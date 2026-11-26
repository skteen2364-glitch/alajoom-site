/* 알아줌 — 업종 화면 '오늘' 위쪽: 이번 주 인기 글 분석 카드 + 분석 보기(인스타·블로그·참고 자료) */
(function () {
  var M = (location.pathname.match(/^\/(food|pilates|skin|nail|hair|cafe|bakery|academy)\b/) || [])[1];
  if (!M) return;
  var NAME = { skin: '피부관리샵', nail: '네일샵', hair: '미용실', pilates: '필라테스', academy: '학원', food: '음식점', cafe: '카페', bakery: '베이커리' }[M];
  var U = 'https://zuxbloxstkcixqpzqalk.supabase.co/rest/v1/rpc/trend_detail';
  var K = 'sb_publishable_cZZ6cVbSIbkG93_rQ8jldg_f_Z9uOYH';
  var data = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lines(t) {
    return String(t || '').split('\n').map(function (x) { return x.replace(/^\s*-\s*/, '').trim(); }).filter(Boolean)
      .map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
  }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function when(iso) {
    var d = new Date(iso); if (isNaN(d)) return '';
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
  }

  var css = document.createElement('style');
  css.textContent = [
    '.wkc{display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:14px 16px;border-radius:18px;background:#14161F;color:#fff;cursor:pointer;border:0;width:100%;text-align:left;font:inherit}',
    '.wkc i{flex:none;width:38px;height:38px;border-radius:12px;background:#FFD43B;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:19px}',
    '.wkc span{flex:1;min-width:0}',
    '.wkc b{display:block;font-size:15.5px;font-weight:800;letter-spacing:-.3px}',
    '.wkc small{display:block;margin-top:2px;font-size:12.5px;color:#C9CDD8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.wkc em{flex:none;font-style:normal;font-size:13px;font-weight:800;color:#14161F;background:#FFD43B;padding:8px 12px;border-radius:999px}',
    '.wkd{width:min(560px,94vw);max-height:88vh;padding:0;border:0;border-radius:22px;color:#14161F}',
    '.wkd::backdrop{background:rgba(10,12,20,.55)}',
    '.wkd .in{padding:22px 20px 18px;overflow:auto;max-height:88vh;box-sizing:border-box}',
    '.wkd .tg{display:inline-block;font-size:12px;font-weight:800;color:#3B5B92;background:#EAF0FA;padding:5px 10px;border-radius:999px}',
    '.wkd h3{margin:10px 0 4px;font-size:21px;font-weight:900;letter-spacing:-.5px}',
    '.wkd .sm{margin:0 0 14px;font-size:14px;color:#4A4F5C;line-height:1.55}',
    '.wkd .tb{display:flex;gap:6px;margin:0 0 10px}',
    '.wkd .tb button{flex:1;min-height:42px;border-radius:12px;border:1.5px solid #E4DED0;background:#fff;font:inherit;font-size:14px;font-weight:800;color:#6B7080;cursor:pointer}',
    '.wkd .tb button[aria-pressed="true"]{background:#14161F;border-color:#14161F;color:#fff}',
    '.wkd ul{margin:0;padding:14px 16px 14px 32px;border-radius:14px;background:#FBF7EE;font-size:14px;line-height:1.6}',
    '.wkd li+li{margin-top:6px}',
    '.wkd .src{margin:14px 0 0;font-size:12.5px;color:#6B7080;line-height:1.6}',
    '.wkd .src a{color:#3B5B92;margin-right:8px;word-break:break-all}',
    '.wkd .go{display:flex;align-items:center;justify-content:center;width:100%;min-height:50px;margin-top:16px;border:0;border-radius:14px;background:#FFD43B;color:#14161F;font:inherit;font-size:16px;font-weight:900;cursor:pointer}',
    '.wkd .x{display:block;width:100%;min-height:44px;margin-top:6px;border:0;background:none;font:inherit;font-size:14px;font-weight:700;color:#6B7080;cursor:pointer}'
  ].join('');
  document.head.appendChild(css);

  function cardHtml() {
    return '<button type="button" class="wkc" id="wkCard" aria-haspopup="dialog">' +
      '<i aria-hidden="true">✨</i><span><b>이번 주 ' + esc(NAME) + ' 인기 글 분석했어요</b>' +
      '<small>' + esc(data.summary || '') + '</small></span><em>분석 보기</em></button>';
  }

  function inject() {
    if (!data) return;
    var box = document.getElementById('v-home'); if (!box || !box.innerHTML.trim()) return;
    if (document.getElementById('wkCard')) return;
    var at = box.querySelector('h1.hd-h1') || box.querySelector('.hd-sum');
    if (at) at.insertAdjacentHTML('afterend', cardHtml()); else box.insertAdjacentHTML('afterbegin', cardHtml());
  }

  function open() {
    var src = (data.sources || []).filter(function (u) { return /^https?:\/\//.test(u); });
    var d = document.createElement('dialog'); d.className = 'wkd';
    d.innerHTML = '<div class="in"><span class="tg">' + esc(when(data.updated_at)) + ' 분석 · 매주 월요일 새로</span>' +
      '<h3>' + esc(data.title || ('이번 주 ' + NAME + ' 인기 글 분석')) + '</h3>' +
      '<p class="sm">' + esc(data.summary || '') + '</p>' +
      '<div class="tb" role="group" aria-label="채널"><button type="button" data-t="insta" aria-pressed="true">인스타</button><button type="button" data-t="blog" aria-pressed="false">네이버 블로그</button></div>' +
      '<ul id="wkList">' + lines(data.insta) + '</ul>' +
      (src.length ? '<p class="src">이번 주 참고한 자료 ' + src.length + '곳<br>' + src.map(function (u) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener nofollow">' + esc(host(u)) + '</a>'; }).join('') + '</p>' : '') +
      '<p class="src">공개된 인기 게시물·상위 글·마케팅 자료를 모아 업종별로 공통점을 뽑았어요.</p>' +
      '<button type="button" class="go" data-go>이 분석으로 글 쓰기</button><button type="button" class="x" data-x>닫기</button></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) {
      var t = e.target.closest('[data-t]');
      if (t) {
        d.querySelectorAll('[data-t]').forEach(function (b) { b.setAttribute('aria-pressed', b === t ? 'true' : 'false'); });
        d.querySelector('#wkList').innerHTML = lines(data[t.dataset.t]);
        return;
      }
      if (e.target.closest('[data-go]')) {
        close();
        var tab = document.querySelector('.mtab[data-tab="make"], .tab[data-view="promo"]');
        if (tab) tab.click();
        return;
      }
      if (e.target === d || e.target.closest('[data-x]')) close();
    });
    function close() { if (d.close) d.close(); d.remove(); }
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }

  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#wkCard')) open(); });

  fetch(U, { method: 'POST', headers: { apikey: K, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_mate: M }) })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (t) {
      if (!t || !t.summary) return;
      data = t;
      inject();
      var box = document.getElementById('v-home');
      if (box && 'MutationObserver' in window) new MutationObserver(function () { if (!document.getElementById('wkCard')) inject(); }).observe(box, { childList: true });
    }).catch(function () {});
})();
