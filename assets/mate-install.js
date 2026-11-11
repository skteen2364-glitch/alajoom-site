/* 고른 메이트 하나만 바탕화면에 깔기
   알아줌 홈에서 메이트를 고르면 /메이트/?install=1 로 와서 이 창이 바로 뜬다.
   window.alajoomShowInstall() 로도 열 수 있다(첫 로그인 직후 등). */
(function () {
  var MATES = {
    pilates: { name: '필라테스메이트', icon: '/assets/icon-pilates-192.png' },
    food: { name: '푸드메이트', icon: '/assets/icon-food-192.png' }
  };
  var key = (location.pathname.match(/^\/([a-z]+)\//) || [])[1];
  var M = MATES[key]; if (!M) return;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});

  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  var ownApp = false;
  try {
    if (standalone && /source=homescreen/.test(location.search)) sessionStorage.setItem('al_own_' + key, '1');
    ownApp = standalone && sessionStorage.getItem('al_own_' + key) === '1';
  } catch (e) {}
  var ua = navigator.userAgent || '';
  var inapp = /KAKAOTALK|NAVER\(|Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp/i.test(ua);
  var ios = /iPhone|iPad|iPod/.test(ua);
  var deferred = null, sheet = null;

  function steps() {
    if (standalone) return '알아줌 앱 안에서는 다른 앱을 깔 수 없어요.<br>아래 <b>주소 복사</b>를 누르고 ' + (ios ? '사파리' : '크롬') + ' 주소창에 붙여 넣어 열어 주세요.';
    if (inapp) return ios ? '오른쪽 아래 <b>⋯ → Safari로 열기</b>를 누른 뒤<br>공유(□↑) → <b>홈 화면에 추가</b>' : '오른쪽 위 <b>⋮ → 다른 브라우저로 열기</b>를 누르면<br>크롬에서 다시 이 창이 떠요.';
    if (ios) return '아래 <b>공유 버튼(□↑)</b>을 누르고<br><b>홈 화면에 추가</b>를 눌러 주세요.';
    return '크롬 오른쪽 위 <b>⋮</b>를 누르고<br><b>홈 화면에 추가</b> 또는 <b>앱 설치</b>를 눌러 주세요.';
  }
  function render() {
    if (!sheet) return;
    var go = sheet.querySelector('.mi-go'), how = sheet.querySelector('.mi-how');
    if (deferred) { go.textContent = M.name + ' 깔기'; go.style.display = ''; how.style.display = 'none'; }
    else if (standalone || inapp) { go.textContent = '주소 복사'; go.style.display = standalone ? '' : 'none'; how.innerHTML = steps(); how.style.display = ''; }
    else { go.style.display = 'none'; how.innerHTML = steps(); how.style.display = ''; }
  }
  function close() { if (sheet) { sheet.remove(); sheet = null; } }
  window.alajoomShowInstall = function () {
    if (ownApp) return;
    close();
    sheet = document.createElement('div');
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'mi-t');
    sheet.style.cssText = 'position:fixed;inset:0;z-index:100005;font-family:inherit;color:#14161F';
    sheet.innerHTML = '<div class="mi-bg" style="position:absolute;inset:0;background:rgba(10,12,18,.55)"></div>' +
      '<div style="position:absolute;left:0;right:0;bottom:0;max-width:440px;margin:0 auto;background:#fff;border-radius:24px 24px 0 0;padding:26px 20px 18px;box-sizing:border-box;text-align:center">' +
      '<img src="' + M.icon + '" alt="" width="76" height="76" style="border-radius:18px;box-shadow:0 8px 20px rgba(0,0,0,.15)">' +
      '<h2 id="mi-t" style="margin:14px 0 6px;font-size:21px;font-weight:900;letter-spacing:-.5px">' + M.name + '만 바탕화면에</h2>' +
      '<p style="margin:0 0 14px;font-size:14px;color:#5B6070;line-height:1.55">아이콘을 누르면 이 화면이 바로 열려요.<br>로그인과 가게 정보도 그대로예요.</p>' +
      '<p class="mi-how" style="margin:0 0 14px;padding:12px;border-radius:12px;background:#FFF8E7;font-size:14px;line-height:1.6"></p>' +
      '<button type="button" class="mi-go" style="width:100%;min-height:54px;border:0;border-radius:14px;background:#14161F;color:#FFE45C;font:inherit;font-size:16px;font-weight:800;cursor:pointer"></button>' +
      '<button type="button" class="mi-x" style="display:block;width:100%;min-height:44px;margin-top:6px;border:0;background:none;font:inherit;font-size:13px;color:#8A8F9C;cursor:pointer">나중에 할게요</button></div>';
    document.body.appendChild(sheet);
    sheet.querySelector('.mi-bg').addEventListener('click', close);
    sheet.querySelector('.mi-x').addEventListener('click', close);
    sheet.querySelector('.mi-go').addEventListener('click', function () {
      if (deferred) { deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; close(); }); return; }
      if (standalone) {
        var url = location.origin + location.pathname + '?install=1';
        try { navigator.clipboard.writeText(url); } catch (e) {}
        this.textContent = '복사했어요!';
      }
    });
    render();
  };

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; render(); });
  window.addEventListener('appinstalled', close);

  if (/[?&]install=1/.test(location.search)) {
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    var openNow = function () { setTimeout(window.alajoomShowInstall, 400); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openNow); else openNow();
  }
})();
