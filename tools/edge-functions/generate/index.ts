import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const DAILY_LIMIT = 10;
const FOUNDER_LIMIT = 20; // 창립 사장님(패밀리 1~100번)
const MODEL = Deno.env.get("AI_MODEL") ?? "claude-haiku-5-5";
const ALLOWED = ["https://alajoom.com", "https://www.alajoom.com", "https://alajoom-site.pages.dev", "http://localhost:8765"];

function cors(origin: string | null) {
  const o = origin && (ALLOWED.includes(origin) || origin.endsWith(".alajoom-site.pages.dev")) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const MATES: Record<string, string> = {
  food: "음식점", pilates: "필라테스·요가 스튜디오", skin: "피부관리·에스테틱(1인 피부관리샵)", beau: "피부관리·에스테틱", funi: "가구·인테리어",
  nail: "네일샵", hair: "미용실", cafe: "카페", bakery: "베이커리", flower: "꽃집", pet: "애견미용", academy: "공부방·교습소·학원",
};
const KINDS: Record<string, string> = {
  insta: "인스타그램 게시물 문구(첫 줄 후킹 문장, 본문 3~5줄, 이모지 적당히, 마지막에 해시태그 8~12개)",
  blog: "네이버 블로그 글(제목 1줄, 소제목 ①②③ 구성, 위치·영업시간 안내 칸, 해시태그 5개)",
  sms: "단골 손님에게 보내는 문자 메시지(90자 안팎, [가게이름]으로 시작, 혜택과 기한 명확히)",
  review: "손님 리뷰에 대한 사장님 답글(감사 인사, 리뷰 내용 구체적으로 언급, 다음 방문 유도, 3~4문장)",
  card: "카드뉴스 4장 분량 문구(장마다 제목 1줄 + 설명 1~2줄)",
};

const SYSTEM = `너는 한국 1인 소상공인 사장님을 돕는 AI 비서 '알아줌'이야.
- 사장님 가게 말투로, 친근하고 자연스러운 한국어로 써.
- 과장, 허위, '최고/1위/100%' 같은 단정 표현, 의료·효능 보장 표현은 쓰지 마.
- 사장님이 주지 않은 가격·할인·영업시간 같은 사실은 지어내지 말고 [ ]로 비워 둬.
- 가게 홍보 글쓰기와 관계없는 요청은 정중히 사양하고, 결과물만 출력해.`;

const CHANNELS: Record<string, string> = {
  insta: "인스타그램 피드 캡션 A안(공감형): 첫 줄은 손님 마음을 건드리는 한 문장, 짧은 줄바꿈으로 6~9줄, 이모지 적당히, 끝에 행동 한 가지(예약·DM·저장), 마지막 줄에 해시태그 8~12개(지역명·업종·상황 섞어서)",
  insta_b: "인스타그램 피드 캡션 B안(정보형): A안과 첫 문장·구성이 완전히 달라야 함. 첫 줄 한 문장 + '✔' 또는 '①②③'로 핵심 정보 3~5줄(무엇을·누구에게·언제까지·어떻게 예약) + 마무리 한 줄, 마지막 줄에 해시태그 8~12개",
  blog: "네이버 블로그 글",
  sms: "단골·회원에게 보내는 문자/카톡: [짧은 버전] 90자 안팎 한 개 + [긴 버전] 250자 안팎 한 개. 받는 사람은 [회원님]으로. 마지막에 '수신거부: [번호]'는 넣지 말 것",
  reels: "인스타 릴스·쇼츠 15~30초 세로 영상 대본: 첫 3초 후킹 문장, 장면 4~6개. 장면마다 '화면(무엇을 찍을지) / 자막 / 말(내레이션)'을 줄로 나눠서, 마지막에 캡션 한 줄",
  place: "네이버 플레이스 소식: 제목 1줄 + 본문 3~5줄, 담백하게, 기간·혜택·예약 방법을 분명히",
  daangn: "당근 동네생활/비즈프로필 소식: 이웃에게 말하듯 친근하게 4~6줄, 광고 티 덜 나게, 마지막에 위치 안내",
  momcafe: "동네 맘카페 홍보 게시판 글: 제목 1줄 + 본문 6~9줄, 원장이 직접 소개하듯 담백하게, 광고 티 덜 나게, 이모지·해시태그 없이, 마지막에 상담 방법([ ]로)",
};
const BLOG_TYPE: Record<string, string> = {
  A: "[정보형] 손님이 검색해서 들어왔을 때 궁금한 걸 다 알려 주는 글. 무엇을·누구에게·어떻게·왜 좋은지 차근차근.",
  B: "[이야기형] 사장님이 오늘 있었던 일을 일기처럼 들려주는 글. 현장 장면·준비 과정·사장님 마음이 느껴지게, 정보는 뒤쪽에 자연스럽게.",
};
const BLOG_RULE = `규칙:
- 공백 포함 1,500~2,200자. 짧게 끝내지 마.
- 첫 줄은 제목 한 줄: 지역명+업종+핵심 내용(지역명을 모르면 [지역명]).
- 도입 2~3문단 → 소제목 4~5개(①②③④⑤), 소제목마다 3~5문장 → 마무리 문단.
- 네이버 검색에 잘 걸리게 지역명·업종·핵심어를 본문에 자연스럽게 3~5번.
- 사진이 들어갈 자리에 [사진: 무엇을 찍은 사진] 을 3~4번 넣어.
- 끝에 '📍 위치 [ ] / 🕐 영업시간 [ ] / 📞 예약 [ ]' 안내와 해시태그 10개.
- 사장님이 주지 않은 가격·후기·숫자는 지어내지 마. 블로그 글만 출력해.`;
const RISKY = /최저가|업계\s*최초|1위|100%|무조건|평생|완벽|절대|유일|최고급|치료|특효|완치|효능|면역력|다이어트\s*효과|살\s*빠|디스크|통증\s*(완화|해결)|교정\s*효과|재생|주름\s*(개선|제거)|미백|리프팅|모공\s*(축소|개선)|여드름\s*(치료|개선)|즉시\s*효과|성적\s*(향상|보장|상승)|합격\s*(보장|률)|만점자|1등급\s*\d|SKY\s*\d+명|명문대\s*\d+명|탈모\s*(치료|개선|완화|방지|예방)|발모|양모|무좀|내성\s*발톱|모발\s*재생|숙면|항산화|글루텐\s*프리|무방부제|무첨가/;
// 업종별 추가 규칙(광고 표현)
const MATE_RULE: Record<string, string> = {
  skin: "피부관리샵은 의료기관이 아니야. 치료·재생·주름 개선·미백·리프팅·여드름 치료·즉시 효과 같은 의료·기능성 표현과 전후 비교로 효과를 약속하는 말은 쓰지 마. 관리 과정·분위기·홈케어 안내 위주로 써.",
  academy: "학원·공부방 광고야. 성적 향상·합격 보장·합격률·만점자·1등급 인원 같은 결과 약속이나 과장 표현은 쓰지 마. 학생 이름·학교·성적은 절대 넣지 말고, 수강료는 원장님이 적은 그대로만 써. 수업 방식·관리 방법·원장님 소개·공부 습관 위주로 학부모가 믿을 수 있게 써.",
  nail: "네일샵은 의료기관이 아니야. 무좀·내성발톱 치료, 손톱 손상 회복·재생, 지속 기간 보장(한 달 무조건 유지 등) 같은 표현은 쓰지 마. 디자인·컬러·꼼꼼한 케어·위생 위주로 써.",
  hair: "미용실은 의료기관이 아니야. 탈모 치료·탈모 개선·발모·두피 치료·모발 재생·손상모 완벽 복구 같은 의료·효능 표현은 쓰지 마. 고객 얼굴 사진은 동의를 전제로 하고, 스타일·상담·손질법 위주로 써.",
  cafe: "카페 광고야. 다이어트·면역·혈당·숙면 같은 건강 효능, 스페셜티 등급·100% 아라비카처럼 확인이 필요한 말은 사장님이 준 정보가 아니면 쓰지 마. 맛·향·자리·분위기·디저트 위주로 써.",
  bakery: "빵집 광고야. 다이어트·혈당·소화 같은 건강 효능과 글루텐 프리·무첨가·무방부제·유기농처럼 확인이 필요한 말은 사장님이 준 정보가 아니면 쓰지 마. 재료·원산지는 사장님이 적은 것만, 굽는 시간·식감·향 위주로 써.",
};

async function claude(apiKey: string, system: string, content: unknown, maxTokens = 1200): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content }] }),
  });
  if (!r.ok) { console.error("anthropic", r.status, (await r.text()).slice(0, 300)); throw new Error("ai"); }
  const d = await r.json();
  return (d.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n").trim();
}
function looseJSON(t: string): Record<string, unknown> | null {
  const s = t.replace(/```(json)?/g, ""); const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b < a) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}

function clip(v: unknown, n = 400) {
  return String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f]/g, " ").slice(0, n).trim();
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, svcKey, { auth: { persistSession: false } });
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u } = await admin.auth.getUser(jwt);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  // 로그인 전 체험: '알아줌 한 번에'만, IP당 하루 1번, 전체 하루 300번까지
  const guest = !u?.user;
  if (guest && !(body.guest === true && String(body.mode ?? "") === "agent")) return json({ error: "login_required", message: "카카오로 로그인한 뒤 써 주세요." }, 401);
  const uid = u?.user?.id ?? "";
  const mate = String(body.mate ?? "");
  if (!MATES[mate]) return json({ error: "bad_request", message: "업종이 올바르지 않아요." }, 400);

  const mode = String(body.mode ?? "");
  const { data: prof } = guest ? { data: null } : await admin.from("profiles").select("voice,family_no").eq("id", uid).maybeSingle();
  const voiceText = clip(((prof?.voice ?? {}) as Record<string, { text?: string }>)[mate]?.text ?? "", 1500);
  const SYS0 = MATE_RULE[mate] ? SYSTEM + "\n- " + MATE_RULE[mate] : SYSTEM;
  const SYS = voiceText && mode !== "voice" ? SYS0 + `\n- 아래는 이 가게 사장님 말투야. 내용은 지어내지 말고 말투·문장 길이·이모지 습관만 따라 써.\n[우리 가게 말투]\n${voiceText}` : SYS0;
  const imgOf = () => {
    const img = typeof body.image === "string" ? body.image : "";
    return img && /^[A-Za-z0-9+/=]+$/.test(img) && img.length < 1_800_000 ? { type: "image", source: { type: "base64", media_type: "image/jpeg", data: img } } : null;
  };

  // 메이트 화면이 직접 만든 요청문(prompt) 또는 항목(fields) 둘 중 하나
  let content: unknown;
  if (mode === "voice") {
    const samples = clip(body.samples, 6000);
    if (samples.length < 40) return json({ error: "bad_request", message: "예전에 쓴 글을 조금 더 붙여 넣어 주세요(두세 개면 좋아요)." }, 400);
    content = `아래는 ${MATES[mate]} 사장님이 직접 쓴 글들이야. 이 사람의 '말투'만 분석해서 다른 AI가 그대로 흉내 낼 수 있게 한국어로 정리해줘.\n` +
      `형식: '- '로 시작하는 6~8줄. 호칭(손님을 뭐라고 부르는지), 문장 끝맺음(~요/~습니다/~해요 등), 문장 길이, 이모지·기호 습관, 자주 쓰는 표현, 분위기, 피하는 것.\n` +
      `가게 이름·가격·날짜 같은 내용 정보는 적지 마. 설명 없이 목록만.\n\n[사장님 글]\n${samples}`;
  } else if (mode === "agent") {
    content = "agent";
  } else if (typeof body.prompt === "string" && body.prompt.trim()) {
    const text = `업종: ${MATES[mate]}\n` + clip(body.prompt, 4000);
    const im = imgOf();
    content = im ? [im, { type: "text", text }] : text;
  } else {
    const kind = String(body.kind ?? "");
    if (!KINDS[kind]) return json({ error: "bad_request", message: "결과물 종류가 올바르지 않아요." }, 400);
    const f = (body.fields ?? {}) as Record<string, unknown>;
    content = [
      `업종: ${MATES[mate]}`,
      `만들 것: ${KINDS[kind]}`,
      f.store ? `가게 이름: ${clip(f.store, 60)}` : "",
      f.area ? `지역: ${clip(f.area, 60)}` : "",
      f.item ? `오늘 알릴 메뉴·상품·수업: ${clip(f.item, 200)}` : "",
      f.point ? `강조할 점: ${clip(f.point, 300)}` : "",
      f.offer ? `혜택·이벤트: ${clip(f.offer, 200)}` : "",
      f.review ? `손님 리뷰 원문: ${clip(f.review, 600)}` : "",
      f.tone ? `말투: ${clip(f.tone, 40)}` : "",
    ].filter(Boolean).join("\n");
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "ai_not_ready", message: "AI 연결 준비 중이에요. 곧 열려요!" }, 503);

  const isAdmin = !guest && (u!.user!.app_metadata as Record<string, unknown> | undefined)?.role === "admin";
  const fno = Number((prof as Record<string, unknown> | null)?.family_no ?? 0);
  const base = isAdmin ? 100000 : (fno > 0 && fno <= 100 ? FOUNDER_LIMIT : DAILY_LIMIT);
  let cnt = 0; let bonusLeft: number | null = null;
  const refund = async () => { if (!guest) await admin.rpc("svc_refund_usage2", { p_user: uid, p_base: base }); };
  if (guest) {
    const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("alajoom:" + ip + ":" + svcKey.slice(-12))))).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { data: ok, error: ge } = await admin.rpc("svc_consume_guest", { p_hash: hash, p_per: 1, p_cap: 300 });
    if (ge) return json({ error: "server_error" }, 500);
    if (!ok) return json({ error: "guest_used", message: "체험은 하루 한 번이에요. 카카오로 로그인하면 매일 무료로 써요." }, 429);
  } else {
    const { data: r, error: ce } = await admin.rpc("svc_consume_usage2", { p_user: uid, p_base: base });
    if (ce) return json({ error: "server_error" }, 500);
    if (r === null) return json({ error: "limit", message: `오늘 무료 ${base}회를 다 썼어요. 출석·소개로 받은 보너스도 다 썼어요. 내일 다시 만나요!`, used: base, limit: base }, 429);
    cnt = Number((r as Record<string, unknown>).used ?? 0);
    if ((r as Record<string, unknown>).bonus) bonusLeft = Number((r as Record<string, unknown>).left ?? 0);
  }

  try {
    let text = "";
    let extra: Record<string, unknown> = {};
    if (mode === "voice") {
      text = await claude(apiKey, "너는 글쓰기 말투를 분석하는 편집자야. 요청한 형식만 출력해.", content, 700);
      const v = { ...((prof?.voice ?? {}) as Record<string, unknown>), [mate]: { text: clip(text, 1500), at: new Date().toISOString() } };
      await admin.from("profiles").update({ voice: v }).eq("id", uid);
    } else if (mode === "agent") {
      // AI 직원 세트: 전략 → 채널별 글 → (위험 표현 있으면) 검토
      const chs = (Array.isArray(body.channels) ? body.channels : []).map(String).filter((c) => CHANNELS[c]).slice(0, guest ? 3 : 7);
      if (!chs.length) { await refund(); return json({ error: "bad_request", message: "채널을 하나 이상 골라 주세요." }, 400); }
      let brief = [`업종: ${MATES[mate]}`, `가게 정보: ${clip(body.store, 600)}`, `이번에 알릴 것: ${clip(body.topic, 80)}`, body.detail ? `사장님이 준 정보: ${clip(body.detail, 800)}` : ""].filter(Boolean).join("\n");
      let trendTitle = "";
      if (body.trend === true) {
        const { data: tr } = await admin.from("trend_styles").select("title,insta,blog").eq("mate", mate).eq("active", true).order("month", { ascending: false }).limit(1).maybeSingle();
        if (tr) {
          trendTitle = String(tr.title ?? "");
          brief += `\n\n[${trendTitle} — 요즘 반응 좋은 글의 '형식'만 따라 써. 다른 사람 글의 문장을 흉내 내거나 지어낸 후기·숫자를 넣지 말고, 내용은 이 가게 정보로만 새로 써]\n인스타 형식:\n${clip(tr.insta, 1200)}\n블로그 형식:\n${clip(tr.blog, 1200)}`;
        }
      }
      const im = imgOf();
      const withImg = (t: string) => im ? [im, { type: "text", text: (t + "\n첨부한 사진에 실제로 보이는 것을 살려서 써. 사진에 없는 것은 지어내지 마.") }] : t;
      const st = looseJSON(await claude(apiKey, SYS, withImg(brief + `\n\n[전략 담당] 이번 홍보에서 가장 강조할 한 가지(focus), 첫 문장 후킹(hook), 핵심 포인트 3개(points)를 기획해. JSON만: {"focus":"","hook":"","points":["","",""]}`), 500)) ?? {};
      const keys = chs.filter((c) => c !== "blog").flatMap((c) => c === "insta" ? ["insta", "insta_b"] : [c]);
      const spec = keys.map((c) => `- "${c}": ${CHANNELS[c]}`).join("\n");
      const blogOne = (k: string) => claude(apiKey, SYS, withImg(brief + `\n\n[전략]\n${JSON.stringify(st)}\n\n[블로그 담당] 네이버 블로그 글 한 편을 써. ${BLOG_TYPE[k]}\n${BLOG_RULE}`), 6000).catch(() => "");
      const blogP = chs.includes("blog") ? Promise.all([blogOne("A"), blogOne("B")]) : Promise.resolve(["", ""]);
      const draftP = keys.length
        ? claude(apiKey, SYS, withImg(brief + `\n\n[전략]\n${JSON.stringify(st)}\n\n[카피 담당] 위 전략으로 채널별 글을 써. 채널마다 형식이 달라. 같은 문장을 반복하지 말고 채널에 맞게.\n${spec}\nJSON만 출력(문자열 안 줄바꿈은 \\n): {${keys.map((c) => `"${c}":""`).join(",")}}`), 4000).then(looseJSON).catch(() => null)
        : Promise.resolve({});
      const [blogTxt, draftRaw] = await Promise.all([blogP, draftP]);
      const draft = (draftRaw ?? {}) as Record<string, unknown>;
      let out: Record<string, string> = {};
      for (const c of keys) out[c] = String(draft[c] ?? "").trim();
      if (chs.includes("blog")) {
        const bt = blogTxt as string[];
        out.blog = String(bt[0] ?? "").trim();
        if (bt[1]) out.blog_b = String(bt[1]).trim();
      }
      const risky = Object.keys(out).filter((c) => out[c] && RISKY.test(out[c]));
      if (risky.length) {
        const fixed = await Promise.all(risky.map((c) => claude(apiKey, SYS, `[검토 담당] 아래 글에서 과장·단정 표현(최고/1위/100%/완벽 등)과 의료·효능 보장 표현(치료/효과/통증 완화/다이어트 효과 등), 성적·합격 보장 표현만 사실적이고 안전한 표현으로 바꿔. 나머지는 한 글자도 바꾸지 말고 글 전체를 그대로 출력해. 설명은 쓰지 마.\n\n${out[c]}`, c.startsWith("blog") ? 6000 : 1500).catch(() => "")));
        risky.forEach((c, i) => { const f = String(fixed[i] ?? "").trim(); if (f && f.length > out[c].length * 0.7) out[c] = f; });
      }
      out = Object.fromEntries(Object.entries(out).filter(([, v]) => v));
      if (!Object.keys(out).length) throw new Error("empty");
      extra = { results: out, strategy: st, reviewed: [...new Set(risky.map((c) => c.replace(/_b$/, "")))], trend: trendTitle };
      text = Object.values(out).join("\n\n");
    } else {
      text = await claude(apiKey, SYS, content, 4000);
    }
    const TOOLS = ["photo", "post", "card", "sms", "review", "board", "pop", "insta", "blog", "set", "voice", "other"];
    const tool = mode === "agent" ? "set" : mode === "voice" ? "voice" : TOOLS.includes(String(body.tool)) ? String(body.tool) : (typeof body.kind === "string" && TOOLS.includes(body.kind) ? body.kind : "other");
    if (!guest) await admin.from("usage_events").insert({ user_id: uid, mate, tool });
    return json({ text, ...extra, used: isAdmin ? 0 : cnt, limit: guest ? 1 : base, bonus_left: bonusLeft, admin: isAdmin, guest });
  } catch (e) {
    console.error("fetch", String(e));
    await refund();
    return json({ error: "ai_error", message: "AI 연결이 잠시 끊겼어요. 다시 시도해 주세요." }, 502);
  }
});
