/* 알아줌 메이트 화면 ↔ Supabase AI 서버 연결
   메이트 화면은 window.claude.use('sample')로 AI를 찾는다.
   로그인돼 있으면 서버 함수 generate를 부르는 sample을 돌려주고,
   아니면 null(예시 문구 모드) + 카카오 로그인 버튼을 보여준다. */
(function () {
  if (window.claude && window.claude.use) return;
  var URL_ = 'https://zuxbloxstkcixqpzqalk.supabase.co';
  var KEY = 'sb_publishable_cZZ6cVbSIbkG93_rQ8jldg_f_Z9uOYH';
  var MATE = (location.pathname.match(/^\/(food|pilates|beau|funi|nail|hair|cafe|bakery|flower|pet)\b/) || [])[1] || 'food';
  var sbP = null;

  function lib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = '/assets/supabase-2.119.0.js'; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function client() {
    if (!sbP) sbP = lib().then(function () {
      return window.supabase.createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
    });
    return sbP;
  }
  function toast(t) {
    var el = document.getElementById('toast'); if (!el) return;
    el.textContent = t; el.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }
  function setMode(html) {
    var go = function () { var m = document.getElementById('mode'); if (m) m.innerHTML = html; };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else setTimeout(go, 0);
  }
  function b64(blob) {
    return new Promise(function (res) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { res(''); };
      r.readAsDataURL(blob);
    });
  }

  async function raw(body) {
    var sb = await client();
    var s = (await sb.auth.getSession()).data.session;
    if (!s) { toast('카카오로 로그인하면 AI가 직접 써 드려요'); var e0 = new Error('login'); e0.code = 'login_required'; throw e0; }
    body.mate = MATE;
    var r = await fetch(URL_ + '/functions/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + s.access_token },
      body: JSON.stringify(body)
    });
    var d = {}; try { d = await r.json(); } catch (e) {}
    if (!r.ok) { toast(d.message || 'AI가 잠시 바빠요. 조금 뒤 다시 눌러 주세요'); var e1 = new Error(d.error || 'ai_error'); e1.code = d.error || 'ai_error'; throw e1; }
    if (d.admin) setMode('진짜 AI 직원이 써요 · 관리자 무제한');
    else if (d.used != null && d.limit) setMode('진짜 AI 직원이 써요 · 오늘 ' + Math.max(0, d.limit - d.used) + '회 남음');
    return d;
  }
  async function call(prompt, opts) {
    var sb = await client();
    var s = (await sb.auth.getSession()).data.session;
    if (!s) { toast('카카오로 로그인하면 AI가 직접 써 드려요'); var e0 = new Error('login'); e0.code = 'login_required'; throw e0; }
    var tb = document.querySelector('.tool[aria-pressed="true"]');
    var body = { mate: MATE, prompt: String(prompt), tool: (tb && tb.dataset.tool) || 'other' };
    if (opts && opts.images && opts.images[0]) body.image = await b64(opts.images[0]);
    var r = await fetch(URL_ + '/functions/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + s.access_token },
      body: JSON.stringify(body)
    });
    var d = {}; try { d = await r.json(); } catch (e) {}
    if (!r.ok) {
      toast(d.message || 'AI가 잠시 바빠요. 조금 뒤 다시 눌러 주세요');
      var e1 = new Error(d.error || 'ai_error'); e1.code = d.error || 'ai_error'; throw e1;
    }
    if (d.admin) setMode('진짜 AI 직원이 써요 · 관리자 무제한');
    else if (d.used != null && d.limit) setMode('진짜 AI 직원이 써요 · 오늘 ' + Math.max(0, d.limit - d.used) + '회 남음');
    return { text: d.text || '' };
  }

  var info = {};
  async function syncProfile(sb, uid) {
    try {
      var q = await sb.from('profiles').select('store_name,area,store_info').eq('id', uid).maybeSingle();
      if (q.error || !q.data) return;
      info = q.data.store_info || {};
      var st = info[MATE];
      window.dispatchEvent(new CustomEvent('alajoom:profile', { detail: { store_name: q.data.store_name, area: q.data.area, studio: st && st.name ? st : null } }));
    } catch (e) {}
  }
  async function saveStudio(sb, uid, st) {
    if (!st || !st.name) return;
    try {
      var clean = {};
      ['name', 'area', 'cls', 'feat', 'contact', 'tone'].forEach(function (k) { clean[k] = String(st[k] || '').slice(0, 300); });
      info[MATE] = clean;
      await sb.from('profiles').update({ store_name: clean.name.slice(0, 60), area: clean.area.slice(0, 60) || null, store_info: info }).eq('id', uid);
    } catch (e) {}
  }

  function makeSample() {
    var f = function (prompt, opts) { return call(prompt, opts); };
    f.limits = function () { return Promise.resolve({ images: true }); };
    f.json = async function (prompt) {
      var res = await call(prompt + '\n\n설명이나 코드블록 없이 JSON 하나만 출력해.');
      var t = (res.text || '').replace(/```(json)?/g, '');
      var a = t.indexOf('{'), b = t.lastIndexOf('}');
      if (a < 0 || b < a) return null;
      try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { return null; }
    };
    return f;
  }

  /* 메이트 화면용 추가 기능: AI 직원 세트, 말투, 내 작업실(계정 저장) */
  var uidP = null;
  async function me() { var sb = await client(); var s = (await sb.auth.getSession()).data.session; return s ? { sb: sb, uid: s.user.id } : null; }
  window.alajoomAI = {
    loggedIn: async function () { try { return !!(await me()); } catch (e) { return false; } },
    feedback: async function (kind, message, mate) {
      var m = await me(); if (!m) throw new Error('login_required');
      var r = await m.sb.from('feedback').insert({ user_id: m.uid, kind: kind, message: String(message).slice(0, 2000), mate: mate || null, page: location.pathname.slice(0, 200) });
      if (r.error) throw r.error; return true;
    },
    agent: async function (p) {
      var body = { mode: 'agent', topic: p.topic, channels: p.channels, detail: p.detail, store: p.store, tool: 'set' };
      if (p.image) body.image = await b64(p.image);
      return raw(body);
    },
    learnVoice: function (samples) { return raw({ mode: 'voice', samples: samples, tool: 'voice' }); },
    getVoice: async function () { var m = await me(); if (!m) return null; var q = await m.sb.from('profiles').select('voice').eq('id', m.uid).maybeSingle(); var v = q.data && q.data.voice || {}; return v[MATE] || null; },
    saveVoice: async function (text) {
      var m = await me(); if (!m) return false;
      var q = await m.sb.from('profiles').select('voice').eq('id', m.uid).maybeSingle(); var v = (q.data && q.data.voice) || {};
      if (text) v[MATE] = { text: String(text).slice(0, 1500), at: new Date().toISOString() }; else delete v[MATE];
      var r = await m.sb.from('profiles').update({ voice: v }).eq('id', m.uid); return !r.error;
    },
    works: {
      list: async function () {
        var m = await me(); if (!m) return null;
        var q = await m.sb.from('works').select('id,tool,title,data,photo,created_at,updated_at,deleted_at').eq('mate', MATE).order('updated_at', { ascending: false }).limit(200);
        return q.error ? null : q.data;
      },
      put: async function (w, blob) {
        var m = await me(); if (!m) return false;
        var data = {}; Object.keys(w).forEach(function (k) { if (['id', 'tool', 'created', 'updated', 'photo', 'title'].indexOf(k) < 0) data[k] = w[k]; });
        var r = await m.sb.from('works').upsert({ user_id: m.uid, id: w.id, mate: MATE, tool: w.tool, title: String(w.title || '').slice(0, 120), data: data, photo: !!w.photo, created_at: w.created, updated_at: w.updated, deleted_at: null });
        if (!r.error && blob) await m.sb.storage.from('work-photos').upload(m.uid + '/' + w.id + '.jpg', blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
        return !r.error;
      },
      trash: async function (id, on) { var m = await me(); if (!m) return false; var r = await m.sb.from('works').update({ deleted_at: on ? new Date().toISOString() : null }).eq('user_id', m.uid).eq('id', id); return !r.error; },
      purge: async function (id) { var m = await me(); if (!m) return false; await m.sb.storage.from('work-photos').remove([m.uid + '/' + id + '.jpg']); var r = await m.sb.from('works').delete().eq('user_id', m.uid).eq('id', id); return !r.error; },
      photo: async function (id) { var m = await me(); if (!m) return null; var r = await m.sb.storage.from('work-photos').download(m.uid + '/' + id + '.jpg'); return r.error ? null : r.data; }
    }
  };

  /* 운영 데이터(메뉴·장부·회원 장부) 계정 동기화
     window.alajoomSync({ keys:[...], get:function(k){return data}, set:function(k,data){...} })
     window.alajoomSaved(k, data) — 화면이 저장할 때 부름 */
  var SY = null, pushT = {};
  function atKey(k) { return 'al_sync_at_' + MATE + '_' + k; }
  function getAt(k) { try { return +localStorage.getItem(atKey(k)) || 0; } catch (e) { return 0; } }
  function setAt(k, t) { try { localStorage.setItem(atKey(k), String(t)); } catch (e) {} }
  async function pushKey(k, data) {
    var m = await me(); if (!m) return;
    var at = getAt(k) || Date.now();
    var r = await m.sb.from('mate_data').upsert({ user_id: m.uid, mate: MATE, key: k, data: data, updated_at: new Date(at).toISOString() });
    if (r.error) console.warn('sync', k, r.error.message);
  }
  window.alajoomSaved = function (k, data) {
    setAt(k, Date.now());
    if (!SY) return;
    clearTimeout(pushT[k]); pushT[k] = setTimeout(function () { pushKey(k, data); }, 1200);
  };
  window.alajoomSync = async function (cfg) {
    SY = cfg;
    try {
      var m = await me(); if (!m) { SY = null; return; }
      var q = await m.sb.from('mate_data').select('key,data,updated_at').eq('mate', MATE);
      if (q.error) return;
      var rows = {}; (q.data || []).forEach(function (r) { rows[r.key] = r; });
      var pulled = 0;
      for (var i = 0; i < cfg.keys.length; i++) {
        var k = cfg.keys[i], r = rows[k], la = getAt(k), sa = r ? new Date(r.updated_at).getTime() : 0;
        if (r && sa > la) { cfg.set(k, r.data); setAt(k, sa); pulled++; }
        else if ((la && (!r || la > sa)) || (!r && cfg.has && cfg.has(k))) { if (!la) setAt(k, Date.now()); await pushKey(k, cfg.get(k)); }
      }
      if (pulled && cfg.done) cfg.done(pulled);
    } catch (e) {}
  };

  window.alajoomLogin = async function () {
    var sb = await client();
    sb.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo: location.origin + location.pathname } });
  };

  window.claude = {
    use: async function (name) {
      if (name !== 'sample') return null;
      try {
        var sb = await client();
        var s = (await sb.auth.getSession()).data.session;
        if (!s) {
          setTimeout(function () {
            setMode('체험판 · 예시 문구예요 <button type="button" onclick="alajoomLogin()" style="margin-left:6px;padding:4px 10px;border:0;border-radius:999px;background:#FEE500;color:#191919;font:inherit;font-weight:700;cursor:pointer">카카오 로그인하고 AI로 쓰기</button>');
          }, 30);
          return null;
        }
        setTimeout(function () { setMode('진짜 AI 직원이 써요 · 하루 10회 무료'); }, 30);
        syncProfile(sb, s.user.id);
        window.addEventListener('alajoom:onboarded', function () { syncProfile(sb, s.user.id); });
        window.addEventListener('alajoom:studio-saved', function (ev) { saveStudio(sb, s.user.id, ev.detail); });
        var ob = document.createElement('script'); ob.src = '/assets/onboard.js?v=11120006'; ob.onload = function () { window.alajoomOnboard && window.alajoomOnboard(sb); }; document.head.appendChild(ob);
        return makeSample();
      } catch (e) { return null; }
    }
  };
})();
