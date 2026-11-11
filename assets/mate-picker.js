/* "어떤 메이트를 바탕화면에 둘까요?" 고르기 창
   window.alajoomPickMate({ all: function(){...} }) — 메이트를 고르면 그 메이트 화면(?install=1)으로 이동,
   '알아줌 전체'를 고르면 all() 실행 */
(function () {
  if (window.alajoomPickMate) return;
  var LIVE = [
    { key: 'pilates', name: '필라테스메이트', sub: '필라테스·요가 스튜디오', icon: '/assets/icon-pilates-192.png' },
    { key: 'food', name: '푸드메이트', sub: '음식점·식당', icon: '/assets/icon-food-192.png' }
  ];
  window.alajoomMates = LIVE;
  window.alajoomPickMate = function (opt) {
    opt = opt || {};
    var old = document.getElementById('al-pick'); if (old) old.remove();
    var w = document.createElement('div');
    w.id = 'al-pick'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-labelledby', 'al-pick-t');
    w.style.cssText = 'position:fixed;inset:0;z-index:100004;font-family:"Noto Sans KR",system-ui,sans-serif;color:#14161F';
    var rows = LIVE.map(function (m) {
      return '<button type="button" data-k="' + m.key + '" style="display:flex;align-items:center;gap:14px;width:100%;min-height:72px;margin:0 0 10px;padding:12px 14px;border:1px solid #E1E4EA;border-radius:16px;background:#fff;font:inherit;text-align:left;cursor:pointer">' +
        '<img src="' + m.icon + '" alt="" width="48" height="48" style="border-radius:12px;flex:none">' +
        '<span style="flex:1;min-width:0"><b style="display:block;font-size:16px">' + m.name + '</b><span style="font-size:13px;color:#6A6F7C">' + m.sub + '</span></span>' +
        '<span aria-hidden="true" style="font-size:20px;color:#9AA0AD">›</span></button>';
    }).join('');
    w.innerHTML = '<div data-x style="position:absolute;inset:0;background:rgba(10,12,18,.55)"></div>' +
      '<div style="position:absolute;left:0;right:0;bottom:0;max-width:440px;margin:0 auto;background:#FFF8E7;border-radius:24px 24px 0 0;padding:24px 18px 20px;box-sizing:border-box">' +
      '<h2 id="al-pick-t" style="margin:0 0 4px;font-size:21px;font-weight:900;letter-spacing:-.5px">어떤 메이트를 바탕화면에 둘까요?</h2>' +
      '<p style="margin:0 0 16px;font-size:14px;color:#5B6070;line-height:1.5">고른 메이트만 앱으로 깔려요. 알아줌을 거치지 않고 바로 열 수 있어요.</p>' +
      rows +
      (opt.all ? '<button type="button" data-all style="display:block;width:100%;min-height:48px;margin:4px 0 0;border:0;background:none;font:inherit;font-size:14px;font-weight:700;color:#5B6070;cursor:pointer;text-decoration:underline;text-underline-offset:3px">알아줌 전체(모든 메이트)를 깔게요</button>' : '') +
      '<button type="button" data-x style="display:block;width:100%;min-height:44px;border:0;background:none;font:inherit;font-size:13px;color:#8A8F9C;cursor:pointer">닫기</button>' +
      '</div>';
    document.body.appendChild(w);
    w.addEventListener('click', function (e) {
      var t = e.target.closest('[data-k],[data-all],[data-x]'); if (!t) return;
      if (t.hasAttribute('data-x')) { w.remove(); return; }
      if (t.hasAttribute('data-all')) { w.remove(); opt.all && opt.all(); return; }
      location.href = '/' + t.getAttribute('data-k') + '/?install=1';
    });
  };
})();
