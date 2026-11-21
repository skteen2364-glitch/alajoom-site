/* 알아줌 패밀리 — 패밀리 번호·창립 사장님·출석·소개·기능 투표
   메이트 화면: '오늘' 화면에 패밀리 카드를 끼움 (ai-bridge.js의 window.alajoomAI 사용)
   모든 화면: ?ref=코드, utm_* 를 처음 들어온 기록으로 저장 → 로그인 뒤 서버에 한 번 보냄 */
(function () {
  var LS = { ref: 'al_ref', src: 'al_src', srcSent: 'al_src_sent' };
  var URL_ = 'https://zuxbloxstkcixqpzqalk.supabase.co';
  var KEY = 'sb_publishable_cZZ6cVbSIbkG93_rQ8jldg_f_Z9uOYH';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  /* 1) 들어온 길 기록 (처음 한 번) */
  try {
    var q = new URLSearchParams(location.search);
    var ref = (q.get('ref') || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
    if (ref) ls(LS.ref, ref.toUpperCase());
    if (!ls(LS.src)) {
      var src = { landing: location.pathname.slice(0, 60), at: new Date().toISOString().slice(0, 10) };
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { var v = q.get(k); if (v) src[k.slice(4)] = v.slice(0, 60); });
      if (ref) src.ref = ref.toUpperCase();
      var r = document.referrer; if (r && r.indexOf(location.host) < 0) { try { src.from = new URL(r).hostname.slice(0, 60); } catch (e) {} }
      ls(LS.src, JSON.stringify(src));
    }
  } catch (e) {}

  /* 2) 창립 사장님 인원 (로그인 없이) */
  window.alajoomFamilyCount = function () {
    return fetch(URL_ + '/rest/v1/rpc/family_count', { method: 'POST', headers: { 'apikey': KEY, 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  };
  document.addEventListener('DOMContentLoaded', function () {
    var el = document.querySelectorAll('[data-family-count]');
    if (!el.length) return;
    window.alajoomFamilyCount().then(function (n) {
      if (n == null) return;
      el.forEach(function (x) { x.textContent = x.getAttribute('data-family-count') === 'left' ? Math.max(0, 100 - n) : n; x.closest('[data-family-wrap]') && x.closest('[data-family-wrap]').removeAttribute('hidden'); });
    });
  });

  /* 아래는 메이트 화면에서만 */
  var AI = function () { return window.alajoomAI; };
  if (!/^\/(food|pilates|skin|nail|hair|cafe|bakery|academy)\b/.test(location.pathname)) return;

  var me = null, busy = false;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(t) { var el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 2600); }

  var css = document.createElement('style');
  css.textContent = [
    '.fam{margin:12px 0;padding:16px;border-radius:18px;background:linear-gradient(135deg,#FFF6D6,#FFFDF4);border:1px solid #F1E2B0;color:#14161F}',
    '.fam-top{display:flex;align-items:center;gap:10px}',
    '.fam-logo{flex:none;width:40px;height:40px;border-radius:12px;background:#FFD43B;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#14161F}',
    '.fam-t{flex:1;min-width:0}.fam-t small{display:block;font-size:12px;color:#7A6A3A;font-weight:700}.fam-t b{display:block;font-size:17px;line-height:1.3}',
    '.fam-badge{flex:none;font-size:11.5px;font-weight:800;padding:4px 9px;border-radius:999px;background:#14161F;color:#FFD43B}',
    '.fam-left{margin:12px 0 10px;font-size:14px;color:#3A3F4C}.fam-left b{color:#14161F}',
    '.fam-btns{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
    '.fam-btns button{min-height:48px;border-radius:12px;border:1px solid #EADBA8;background:#fff;color:#14161F;font:inherit;font-size:13px;font-weight:800;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 4px}',
    '.fam-btns button small{font-size:11px;font-weight:600;color:#8A7A4A}',
    '.fam-btns button[disabled]{opacity:.55;cursor:default}',
    '.fam-go{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;margin-top:10px;border:0;border-radius:12px;background:#FEE500;color:#191600;font:inherit;font-weight:800;font-size:15px;cursor:pointer}',
    '.fam-dlg{border:0;border-radius:20px;padding:0;width:min(420px,92vw);max-height:86vh}',
    '.fam-dlg::backdrop{background:rgba(20,22,31,.45)}',
    '.fam-dlg .in{padding:20px}.fam-dlg h3{margin:0 0 4px;font-size:18px}.fam-dlg p.s{margin:0 0 14px;font-size:13.5px;color:#5B6070}',
    '.fam-f{display:flex;gap:10px;align-items:center;padding:12px 0;border-top:1px solid #EEE9DC}',
    '.fam-f div{flex:1;min-width:0}.fam-f b{display:block;font-size:15px}.fam-f span{display:block;font-size:12.5px;color:#6A6F7C}',
    '.fam-f button{flex:none;min-width:74px;min-height:40px;border-radius:999px;border:1px solid #D9CFB8;background:#fff;font:inherit;font-size:13px;font-weight:800;cursor:pointer}',
    '.fam-f button.on{background:#14161F;color:#FFD43B;border-color:#14161F}',
    '.fam-x{display:block;width:100%;min-height:46px;margin-top:12px;border:0;border-radius:12px;background:#F2F3F6;font:inherit;font-weight:800;cursor:pointer}',
    '.fam-code{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;border-radius:14px;background:#FFF6D6;font-size:22px;font-weight:900;letter-spacing:2px}',
    '.fam-code button{font-size:13px;letter-spacing:0;min-height:40px;padding:0 14px;border-radius:10px;border:0;background:#14161F;color:#fff;font-weight:800;cursor:pointer}'
  ].join('\n');
  document.head.appendChild(css);

  async function load() {
    try {
      if (!AI() || !(await AI().loggedIn())) { me = null; window.alajoomFamilyMe = null; return; }
      // 처음 들어온 길·소개 코드는 로그인 뒤 한 번만 보냄
      var src = ls(LS.src);
      if (src && !ls(LS.srcSent)) { try { await AI().rpc('family_set_source', { p_src: JSON.parse(src) }); ls(LS.srcSent, '1'); } catch (e) {} }
      var code = ls(LS.ref);
      if (code) {
        try {
          var r = await AI().rpc('family_claim_ref', { p_code: code });
          if (r && r.ok) toast('소개로 오셨네요! 보너스 10회를 드렸어요');
        } catch (e) {}
        ls(LS.ref, null);
      }
      me = await AI().rpc('family_me');
    } catch (e) { me = null; }
    window.alajoomFamilyMe = me;
    if (me) { var qt = document.getElementById('quota'); if (qt) { var lf = Math.max(0, me.base - me.used); qt.textContent = lf > 0 ? '오늘 ' + lf + '회 남음' + (me.bonus > 0 ? ' +' + me.bonus : '') : (me.bonus > 0 ? '보너스 ' + me.bonus + '회 남음' : '오늘 횟수를 다 썼어요'); } }
  }

  function card() {
    if (!me) {
      return '<section class="fam" id="famCard" aria-label="알아줌 패밀리"><div class="fam-top"><span class="fam-logo">알</span><div class="fam-t"><small>알아줌 패밀리</small><b>창립 사장님 100분을 모셔요</b></div></div>' +
        '<p class="fam-left">카카오로 시작하면 패밀리 번호를 드려요. 1~100번 창립 사장님은 매일 <b>20회</b> 무료예요.</p>' +
        '<button type="button" class="fam-go" data-fam="login">카카오로 패밀리 되기</button></section>';
    }
    var left = Math.max(0, me.base - me.used);
    return '<section class="fam" id="famCard" aria-label="알아줌 패밀리"><div class="fam-top"><span class="fam-logo">알</span>' +
      '<div class="fam-t"><small>알아줌 패밀리</small><b>' + esc(me.family_no) + '번째 사장님</b></div>' +
      (me.founder ? '<span class="fam-badge">창립 사장님</span>' : '') + '</div>' +
      '<p class="fam-left">오늘 남은 횟수 <b>' + left + '회</b>' + (me.bonus > 0 ? ' · 보너스 <b>' + me.bonus + '회</b>' : '') + '</p>' +
      '<div class="fam-btns">' +
      '<button type="button" data-fam="checkin"' + (me.checked ? ' disabled' : '') + '>' + (me.checked ? '출석 완료' : '출석하기') + '<small>' + (me.checked ? '내일 또 만나요' : '+2회') + '</small></button>' +
      '<button type="button" data-fam="invite">사장님 소개<small>둘 다 +10회</small></button>' +
      '<button type="button" data-fam="vote">다음 기능 투표<small>3개까지</small></button>' +
      '</div></section>';
  }

  function inject() {
    var box = document.getElementById('v-home'); if (!box) return;
    var old = document.getElementById('famCard'); if (old) old.remove();
    var html = card();
    var at = box.querySelector('.hd-sum') || box.querySelector('h1.hd-h1');
    if (at) at.insertAdjacentHTML('afterend', html); else box.insertAdjacentHTML('afterbegin', html);
  }

  function dlg(html) {
    var d = document.createElement('dialog'); d.className = 'fam-dlg'; d.innerHTML = '<div class="in">' + html + '<button type="button" class="fam-x" data-x>닫기</button></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-x]')) { d.close(); d.remove(); } });
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    return d;
  }

  async function voteDlg() {
    var list = [];
    try { list = await AI().rpc('family_features'); } catch (e) { toast('잠시 뒤 다시 눌러 주세요'); return; }
    var d = dlg('<h3>다음에 뭘 만들까요?</h3><p class="s">필요한 기능에 표를 주세요. 한 분당 3개까지예요. 표가 많은 것부터 업종 전문가 조언을 받아 만들어요.</p><div id="famList"></div>');
    var draw = function () {
      d.querySelector('#famList').innerHTML = list.map(function (f) {
        return '<div class="fam-f"><div><b>' + esc(f.title) + '</b><span>' + esc(f.descr || '') + ' · ' + f.votes + '표</span></div>' +
          '<button type="button" data-fv="' + esc(f.id) + '" class="' + (f.mine ? 'on' : '') + '">' + (f.mine ? '투표함' : '투표') + '</button></div>';
      }).join('');
    };
    draw();
    d.addEventListener('click', async function (e) {
      var b = e.target.closest('[data-fv]'); if (!b) return;
      b.disabled = true;
      try {
        var r = await AI().rpc('family_vote', { p_feature: b.dataset.fv });
        if (r && r.ok === false && r.why === 'max3') toast('3개까지 고를 수 있어요. 하나를 빼고 골라 주세요');
        list = await AI().rpc('family_features'); draw();
      } catch (e2) { toast('잠시 뒤 다시 눌러 주세요'); b.disabled = false; }
    });
  }

  function inviteDlg() {
    var link = 'https://alajoom.com/?ref=' + me.ref_code;
    var d = dlg('<h3>아는 사장님께 알아줌 소개하기</h3><p class="s">이 링크로 시작한 사장님도, 소개한 사장님도 보너스 10회를 받아요. 지금까지 ' + (me.refs || 0) + '분이 함께하셨어요.</p>' +
      '<div class="fam-code"><span>' + esc(me.ref_code) + '</span><button type="button" data-copy>링크 복사</button></div>' +
      (navigator.share ? '<button type="button" class="fam-go" data-share style="margin-top:10px">카톡·문자로 보내기</button>' : ''));
    var msg = '사장님, 저 요즘 홍보글을 알아줌으로 써요. 한 줄만 적으면 인스타·블로그·문자 글을 같이 써 줘서 편해요. 무료예요.\n' + link;
    d.addEventListener('click', async function (e) {
      if (e.target.closest('[data-copy]')) { try { await navigator.clipboard.writeText(msg); toast('소개 문구와 링크를 복사했어요'); } catch (er) { prompt('복사해서 보내 주세요', link); } }
      if (e.target.closest('[data-share]')) { try { await navigator.share({ title: '알아줌', text: msg }); } catch (er) {} }
    });
  }

  document.addEventListener('click', async function (e) {
    var b = e.target.closest('[data-fam]'); if (!b || busy) return;
    var k = b.dataset.fam;
    if (k === 'login') { if (window.alajoomLogin) window.alajoomLogin(); return; }
    if (!me) return;
    if (k === 'checkin') {
      busy = true; b.disabled = true;
      try { var r = await AI().rpc('family_checkin'); if (r && r.ok) toast('출석 완료! 보너스 2회를 드렸어요'); me = await AI().rpc('family_me'); inject(); }
      catch (er) { toast('잠시 뒤 다시 눌러 주세요'); b.disabled = false; }
      busy = false; return;
    }
    if (k === 'invite') return inviteDlg();
    if (k === 'vote') return voteDlg();
  });

  var loaded = load();
  window.addEventListener('alajoom:tab', function (e) { if (e.detail === 'home') loaded.then(function () { setTimeout(inject, 0); }); });
  window.addEventListener('alajoom:used', function () { loaded = load().then(function () { if (document.getElementById('famCard')) inject(); }); });
  // 첫 화면이 이미 그려져 있으면 바로
  loaded.then(function () { var h = document.getElementById('v-home'); if (h && h.offsetParent !== null && h.innerHTML.trim()) inject(); });
  window.alajoomFamily = { reload: function () { loaded = load().then(inject); return loaded; } };
})();
