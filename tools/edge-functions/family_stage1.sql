-- 알아줌 패밀리 1단계: 패밀리 번호·소개 코드·출석·보너스 횟수·기능 투표·유입 기록·게스트 체험

-- 1) profiles 새 칸
create sequence if not exists private.family_no_seq start 1;
alter table public.profiles
  add column if not exists family_no integer unique,
  add column if not exists ref_code text unique,
  add column if not exists referred_by uuid references auth.users(id) on delete set null,
  add column if not exists source jsonb,
  add column if not exists terms_agreed_at timestamptz;

create or replace function private.new_ref_code() returns text
language plpgsql set search_path = '' as $$
declare c text;
begin
  loop
    c := upper(substr(translate(encode(extensions.gen_random_bytes(8), 'base64'), '+/=0O1Il', ''), 1, 6));
    exit when length(c) = 6 and not exists (select 1 from public.profiles where ref_code = c);
  end loop;
  return c;
end $$;

-- 기존 회원 번호·코드 채우기 (가입 순서대로)
do $$
declare r record;
begin
  for r in select id from public.profiles where family_no is null order by created_at loop
    update public.profiles set family_no = nextval('private.family_no_seq'), ref_code = coalesce(ref_code, private.new_ref_code()) where id = r.id;
  end loop;
end $$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nickname, avatar_url, family_no, ref_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'full_name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    nextval('private.family_no_seq'),
    private.new_ref_code()
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- 사용자가 직접 바꾸면 안 되는 칸은 그대로 지킴
create or replace function private.profiles_touch()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.marketing_opt_in is distinct from old.marketing_opt_in then
    new.marketing_opt_in_at := case when new.marketing_opt_in then now() else null end;
  else
    new.marketing_opt_in_at := old.marketing_opt_in_at;
  end if;
  if old.onboarded_at is null and new.business_type is not null then
    new.onboarded_at := now();
  else
    new.onboarded_at := old.onboarded_at;
  end if;
  if current_setting('app.family_rpc', true) is distinct from 'on' then
    new.family_no := old.family_no;
    new.ref_code := old.ref_code;
    new.referred_by := old.referred_by;
    new.source := old.source;
  end if;
  if old.terms_agreed_at is not null then new.terms_agreed_at := old.terms_agreed_at;
  elsif new.terms_agreed_at is not null then new.terms_agreed_at := now(); end if;
  return new;
end $$;

-- 2) 보너스 횟수 장부 · 출석 · 기능 투표 · 게스트 체험
create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index if not exists credit_ledger_user on public.credit_ledger(user_id);
alter table public.credit_ledger enable row level security;
create policy "credit: read own" on public.credit_ledger for select to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);
alter table public.checkins enable row level security;
create policy "checkins: read own" on public.checkins for select to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.features (
  id text primary key,
  title text not null,
  descr text,
  mate text,
  status text not null default 'vote' check (status in ('vote','making','done')),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.features enable row level security;
create policy "features: read all" on public.features for select to anon, authenticated using (true);

create table if not exists public.feature_votes (
  feature_id text not null references public.features(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (feature_id, user_id)
);
create index if not exists feature_votes_user on public.feature_votes(user_id);
alter table public.feature_votes enable row level security;
create policy "votes: read own" on public.feature_votes for select to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.guest_trials (
  ip_hash text not null,
  day date not null,
  count integer not null default 0,
  primary key (ip_hash, day)
);
alter table public.guest_trials enable row level security; -- 정책 없음: 서버(service_role)만

insert into public.features (id, title, descr, sort) values
  ('auto_insta', '인스타 바로 올리기', '만든 글과 사진을 버튼 한 번에 인스타에 올려요', 1),
  ('sms_send', '문자 자동 보내기', '예약·재방문 문자를 알아줌이 대신 보내요', 2),
  ('mini_home', '우리 가게 미니 홈페이지', '알아줌으로 만든 글·사진이 모인 가게 페이지', 3),
  ('reels', '릴스 영상 만들기', '사진 몇 장으로 15초 릴스를 만들어요', 4),
  ('review_reply', '네이버·배민 리뷰 답글 모아 쓰기', '여러 리뷰 답글을 한 번에 써요', 5),
  ('neighbor', '동네 패밀리 가게와 서로 소개', '같은 동네 다른 업종 사장님과 손님을 서로 소개해요', 6)
on conflict (id) do nothing;

-- 3) 횟수 쓰기: 기본 한도 → 넘으면 보너스에서 1개
create or replace function private.consume_usage2(p_user uuid, p_base integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_day date := (now() at time zone 'Asia/Seoul')::date;
  v_count integer; v_bal integer;
begin
  insert into public.usage_daily (user_id, day, count) values (p_user, v_day, 1)
  on conflict (user_id, day) do update set count = public.usage_daily.count + 1
  returning count into v_count;
  if v_count <= p_base then return jsonb_build_object('used', v_count, 'bonus', false); end if;
  select coalesce(sum(amount), 0) into v_bal from public.credit_ledger where user_id = p_user;
  if v_bal > 0 then
    insert into public.credit_ledger (user_id, amount, reason) values (p_user, -1, 'use');
    return jsonb_build_object('used', v_count, 'bonus', true, 'left', v_bal - 1);
  end if;
  update public.usage_daily set count = count - 1 where user_id = p_user and day = v_day;
  return null;
end $$;

create or replace function private.refund_usage2(p_user uuid, p_base integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_old integer;
begin
  update public.usage_daily set count = greatest(count - 1, 0)
  where user_id = p_user and day = (now() at time zone 'Asia/Seoul')::date
  returning count + 1 into v_old;
  if v_old is not null and v_old > p_base then
    insert into public.credit_ledger (user_id, amount, reason) values (p_user, 1, 'refund');
  end if;
end $$;

create or replace function private.consume_guest(p_hash text, p_per integer, p_cap integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_day date := (now() at time zone 'Asia/Seoul')::date; v_c integer; v_total integer;
begin
  select coalesce(sum(count), 0) into v_total from public.guest_trials where day = v_day;
  if v_total >= p_cap then return false; end if;
  insert into public.guest_trials (ip_hash, day, count) values (p_hash, v_day, 1)
  on conflict (ip_hash, day) do update set count = public.guest_trials.count + 1
    where public.guest_trials.count < p_per
  returning count into v_c;
  return v_c is not null;
end $$;

create or replace function public.svc_consume_usage2(p_user uuid, p_base integer) returns jsonb
language sql set search_path = '' as $$ select private.consume_usage2(p_user, p_base); $$;
create or replace function public.svc_refund_usage2(p_user uuid, p_base integer) returns void
language sql set search_path = '' as $$ select private.refund_usage2(p_user, p_base); $$;
create or replace function public.svc_consume_guest(p_hash text, p_per integer, p_cap integer) returns boolean
language sql set search_path = '' as $$ select private.consume_guest(p_hash, p_per, p_cap); $$;

-- 4) 사장님이 부르는 기능 (본인 것만)
create or replace function private.family_me()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); p record; v_bal integer; v_used integer; v_day date := (now() at time zone 'Asia/Seoul')::date; v_refs integer;
begin
  if uid is null then return null; end if;
  select family_no, ref_code, referred_by, store_name, area, business_type, terms_agreed_at, created_at into p from public.profiles where id = uid;
  select coalesce(sum(amount), 0) into v_bal from public.credit_ledger where user_id = uid;
  select coalesce(count, 0) into v_used from public.usage_daily where user_id = uid and day = v_day;
  select count(*) into v_refs from public.profiles where referred_by = uid;
  return jsonb_build_object(
    'family_no', p.family_no, 'founder', coalesce(p.family_no <= 100, false),
    'ref_code', p.ref_code, 'referred', p.referred_by is not null, 'refs', v_refs,
    'store_name', p.store_name, 'area', p.area, 'business_type', p.business_type,
    'terms', p.terms_agreed_at is not null,
    'base', case when coalesce(p.family_no <= 100, false) then 20 else 10 end,
    'bonus', v_bal, 'used', coalesce(v_used, 0),
    'checked', exists (select 1 from public.checkins where user_id = uid and day = v_day),
    'new_user', p.created_at > now() - interval '7 days');
end $$;

create or replace function private.family_checkin()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); v_day date := (now() at time zone 'Asia/Seoul')::date; n integer;
begin
  if uid is null then raise exception 'login_required'; end if;
  insert into public.checkins (user_id, day) values (uid, v_day) on conflict do nothing;
  get diagnostics n = row_count;
  if n = 1 then insert into public.credit_ledger (user_id, amount, reason) values (uid, 2, 'checkin'); end if;
  return jsonb_build_object('ok', n = 1, 'bonus', (select coalesce(sum(amount),0) from public.credit_ledger where user_id = uid));
end $$;

create or replace function private.family_claim_ref(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); me record; ref_uid uuid; ref_cnt integer;
begin
  if uid is null then raise exception 'login_required'; end if;
  select referred_by, created_at into me from public.profiles where id = uid;
  if me.referred_by is not null then return jsonb_build_object('ok', false, 'why', 'already'); end if;
  if me.created_at < now() - interval '7 days' then return jsonb_build_object('ok', false, 'why', 'old'); end if;
  select id into ref_uid from public.profiles where ref_code = upper(trim(p_code));
  if ref_uid is null or ref_uid = uid then return jsonb_build_object('ok', false, 'why', 'bad_code'); end if;
  perform set_config('app.family_rpc', 'on', true);
  update public.profiles set referred_by = ref_uid where id = uid;
  insert into public.credit_ledger (user_id, amount, reason) values (uid, 10, 'ref_in');
  select count(*) into ref_cnt from public.credit_ledger where user_id = ref_uid and reason = 'ref_out';
  if ref_cnt < 50 then insert into public.credit_ledger (user_id, amount, reason) values (ref_uid, 10, 'ref_out'); end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function private.family_set_source(p_src jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null or p_src is null or jsonb_typeof(p_src) <> 'object' or length(p_src::text) > 600 then return; end if;
  perform set_config('app.family_rpc', 'on', true);
  update public.profiles set source = p_src where id = uid and source is null;
end $$;

create or replace function private.family_vote(p_feature text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n integer;
begin
  if uid is null then raise exception 'login_required'; end if;
  delete from public.feature_votes where feature_id = p_feature and user_id = uid;
  get diagnostics n = row_count;
  if n = 0 then
    if (select count(*) from public.feature_votes where user_id = uid) >= 3 then return jsonb_build_object('ok', false, 'why', 'max3'); end if;
    insert into public.feature_votes (feature_id, user_id) values (p_feature, uid);
  end if;
  return jsonb_build_object('ok', true, 'voted', n = 0);
end $$;

create or replace function private.family_features()
returns jsonb language sql security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'title', f.title, 'descr', f.descr, 'status', f.status,
    'votes', (select count(*) from public.feature_votes v where v.feature_id = f.id),
    'mine', exists (select 1 from public.feature_votes v where v.feature_id = f.id and v.user_id = auth.uid()))
    order by f.sort), '[]'::jsonb)
  from public.features f where f.status <> 'done';
$$;

create or replace function private.family_count()
returns integer language sql security definer set search_path = '' as $$
  select count(*)::integer from public.profiles where family_no is not null;
$$;

-- 공개 이름 (PostgREST rpc)
create or replace function public.family_me() returns jsonb language sql set search_path = '' as $$ select private.family_me(); $$;
create or replace function public.family_checkin() returns jsonb language sql set search_path = '' as $$ select private.family_checkin(); $$;
create or replace function public.family_claim_ref(p_code text) returns jsonb language sql set search_path = '' as $$ select private.family_claim_ref(p_code); $$;
create or replace function public.family_set_source(p_src jsonb) returns void language sql set search_path = '' as $$ select private.family_set_source(p_src); $$;
create or replace function public.family_vote(p_feature text) returns jsonb language sql set search_path = '' as $$ select private.family_vote(p_feature); $$;
create or replace function public.family_features() returns jsonb language sql set search_path = '' as $$ select private.family_features(); $$;
create or replace function public.family_count() returns integer language sql set search_path = '' as $$ select private.family_count(); $$;

-- 5) 권한: 기본 PUBLIC 실행권한 걷고 필요한 것만
revoke all on function private.new_ref_code(), private.consume_usage2(uuid,integer), private.refund_usage2(uuid,integer),
  private.consume_guest(text,integer,integer), private.family_me(), private.family_checkin(), private.family_claim_ref(text),
  private.family_set_source(jsonb), private.family_vote(text), private.family_features(), private.family_count() from public, anon, authenticated;
revoke all on function public.svc_consume_usage2(uuid,integer), public.svc_refund_usage2(uuid,integer), public.svc_consume_guest(text,integer,integer),
  public.family_me(), public.family_checkin(), public.family_claim_ref(text), public.family_set_source(jsonb),
  public.family_vote(text), public.family_features(), public.family_count() from public, anon, authenticated;

grant usage on schema private to authenticated, anon, service_role;
grant execute on function private.consume_usage2(uuid,integer), private.refund_usage2(uuid,integer), private.consume_guest(text,integer,integer) to service_role;
grant execute on function public.svc_consume_usage2(uuid,integer), public.svc_refund_usage2(uuid,integer), public.svc_consume_guest(text,integer,integer) to service_role;
grant execute on function private.family_me(), private.family_checkin(), private.family_claim_ref(text), private.family_set_source(jsonb), private.family_vote(text) to authenticated;
grant execute on function public.family_me(), public.family_checkin(), public.family_claim_ref(text), public.family_set_source(jsonb), public.family_vote(text) to authenticated;
grant execute on function private.family_features(), private.family_count() to anon, authenticated;
grant execute on function public.family_features(), public.family_count() to anon, authenticated;
grant select on public.features to anon, authenticated;
grant select on public.credit_ledger, public.checkins, public.feature_votes to authenticated;
