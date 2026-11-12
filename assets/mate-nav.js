/* 알아줌 메이트 공용: 휴대폰 '뒤로가기'가 앱을 바로 끄지 않게
   - 탭을 옮길 때마다 기록을 남겨, 뒤로가기 = 이전 탭
   - 창(시트·대화상자)이 열려 있으면 뒤로가기 = 그 창 닫기
   - 첫 화면(홈)에서 뒤로가기 = 원래대로 나가기 */
(function () {
  if (window.alajoomNav) return;
  window.alajoomNav = true;
  var fromPop = false, ignore = 0, cur = null;
  var CLOSE_SEL = '[data-vx],[data-vlx],[data-gx],[data-x],.mi-x,.ob-later,#stCancel,[data-close]';

  function overlays() {
    var list = [];
    document.querySelectorAll('dialog[open]').forEach(function (d) { list.push(d); });
    document.querySelectorAll('body > [role=dialog][aria-modal=true]').forEach(function (d) { list.push(d); });
    return list;
  }
  function closeOne(el) {
    if (el.tagName === 'DIALOG') { try { el.close(); } catch (e) {} return; }
    var b = el.querySelector(CLOSE_SEL);
    if (b) { b.click(); if (!el.isConnected) return; }
    el.remove();
  }
  function st() { return history.state || {}; }

  // 탭이 바뀌면 기록 남기기
  window.addEventListener('alajoom:tab', function (e) {
    var k = e.detail;
    if (!k) return;
    if (cur === null) { cur = k; try { history.replaceState({ al: 1, t: 'home' }, ''); if (k !== 'home') history.pushState({ al: 1, t: k }, ''); } catch (er) {} return; }
    if (fromPop || k === cur) { cur = k; return; }
    cur = k;
    try { history.pushState({ al: 1, t: k }, ''); } catch (er) {}
  });

  // 창이 열리면 기록 하나 더(뒤로가기로 닫히게), 버튼으로 닫히면 그 기록 지우기
  var openCount = 0;
  function check() {
    var n = overlays().length;
    if (n > openCount) {
      for (var i = openCount; i < n; i++) { try { history.pushState({ al: 1, t: cur || 'home', ov: 1 }, ''); } catch (er) {} }
    } else if (n < openCount && !fromPop) {
      var drop = openCount - n;
      while (drop-- > 0 && st().ov) { ignore++; history.back(); break; }
    }
    openCount = n;
  }
  var mo = new MutationObserver(function () { setTimeout(check, 0); });
  function start() {
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
    if (!history.state || !history.state.al) { try { history.replaceState({ al: 1, t: cur || 'home' }, ''); } catch (er) {} }
    openCount = overlays().length;
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  window.addEventListener('popstate', function (e) {
    if (ignore > 0) { ignore--; return; }
    var ov = overlays();
    fromPop = true;
    try {
      if (ov.length) {
        closeOne(ov[ov.length - 1]);
        openCount = overlays().length;
        return;
      }
      var s = e.state || {};
      var t = s.t || 'home';
      if (t !== cur && window.alajoomTab) window.alajoomTab(t);
      cur = t;
    } finally { setTimeout(function () { fromPop = false; }, 0); }
  });
})();
