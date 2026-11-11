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
        var ob = document.createElement('script'); ob.src = '/assets/onboard.js?v=11120000'; ob.onload = function () { window.alajoomOnboard && window.alajoomOnboard(sb); }; document.head.appendChild(ob);
        return makeSample();
      } catch (e) { return null; }
    }
  };
})();
