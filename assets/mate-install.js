/* 메이트 하나만 바탕화면에 깔기 (필라테스메이트·푸드메이트 등 각각 따로 설치) */
(function () {
  var MATES = {
    pilates: { name: '필라테스메이트', icon: '/assets/icon-pilates-192.png' },
    food: { name: '푸드메이트', icon: '/assets/icon-food-192.png' }
  };
  var key = (location.pathname.match(/^\/([a-z]+)\//) || [])[1];
  var M = MATES[key]; if (!M) return;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  // 이 메이트 앱으로 실행된 경우(시작 주소에 source=homescreen)만 버튼을 숨긴다.
  // 알아줌 앱 안에서 메이트로 들어온 경우엔 '브라우저에서 열어 설치' 안내를 보여준다.
  var ownApp = false;
  try {
    if (standalone && /source=homescreen/.test(location.search)) sessionStorage.setItem('al_own_' + key, '1');
    ownApp = standalone && sessionStorage.getItem('al_own_' + key) === '1';
  } catch (e) {}
  if (ownApp) return;
  var inAlajoomApp = standalone;
  var ua = navigator.userAgent || '';
  var inapp = /KAKAOTALK|NAVER\(|Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp/i.test(ua);
  var ios = /iPhone|iPad|iPod/.test(ua);
  var deferred = null, OFF = 'al_install_off_' + key;
  var off = function () { try { return localStorage.getItem(OFF); } catch (e) { return null; } };
  var guide = function () {
    if (inAlajoomApp) return '알아줌 앱 안에서는 따로 깔 수 없어요. 주소를 복사해 크롬(아이폰은 사파리)에서 열고 다시 눌러 주세요';
    if (inapp) return ios ? '오른쪽 아래 ⋯ → "Safari로 열기" → 공유 → "홈 화면에 추가"' : '오른쪽 위 ⋮ → "다른 브라우저로 열기" 후 다시 눌러 주세요';
    if (ios) return '아래 공유 버튼(□↑) → "홈 화면에 추가"';
    return '브라우저 오른쪽 위 ⋮ → "홈 화면에 추가" 또는 "앱 설치"';
  };

  var box = document.createElement('div');
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', M.name + ' 바탕화면에 깔기');
  box.style.cssText = 'display:none;position:fixed;left:12px;right:12px;bottom:14px;z-index:9999;max-width:420px;margin:0 auto;padding:12px 12px 12px 14px;border-radius:18px;background:#14161F;color:#fff;box-shadow:0 14px 34px rgba(0,0,0,.28);align-items:center;gap:12px;font-family:inherit';
  box.innerHTML = '<img src="' + M.icon + '" alt="" width="40" height="40" style="border-radius:10px;flex:none">' +
    '<div style="flex:1;min-width:0"><b style="display:block;font-size:14.5px">' + M.name + '만 바탕화면에</b><span class="mi-msg" style="color:#C9CCD6;font-size:12.5px"></span></div>' +
    '<button type="button" class="mi-go" style="flex:none;border:0;border-radius:12px;background:#FFD43B;color:#14161F;font:inherit;font-weight:800;font-size:14px;padding:10px 14px;cursor:pointer">깔기</button>' +
    '<button type="button" class="mi-x" aria-label="닫기" style="flex:none;border:0;background:none;color:#8A8F9C;font-size:20px;padding:4px 6px;cursor:pointer">×</button>';
  var msg, go;
  var show = function () {
    msg.textContent = deferred ? '앱처럼 바로 열 수 있어요' : guide();
    go.style.display = deferred ? '' : 'none';
    box.style.display = 'flex';
  };
  var install = function () {
    if (inAlajoomApp) {
      var url = location.origin + location.pathname;
      try { navigator.clipboard.writeText(url); } catch (e) {}
      show(); msg.textContent = '주소를 복사했어요. 크롬(아이폰은 사파리) 주소창에 붙여 넣고 열어서 "홈 화면에 추가"를 눌러 주세요';
      return;
    }
    if (deferred) { deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; box.style.display = 'none'; }); }
    else show();
  };

  var mount = function () {
    document.body.appendChild(box);
    msg = box.querySelector('.mi-msg'); go = box.querySelector('.mi-go');
    go.addEventListener('click', install);
    box.querySelector('.mi-x').addEventListener('click', function () { box.style.display = 'none'; try { localStorage.setItem(OFF, '1'); } catch (e) {} });
    // 화면 위쪽 상태 문구 아래에 항상 보이는 작은 버튼
    var anchor = document.querySelector('section.studio') || document.getElementById('mode');
    if (anchor) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mi-btn';
      b.innerHTML = '<img src="' + M.icon + '" alt="" width="20" height="20" style="border-radius:5px"> ' + M.name + ' 바탕화면에 깔기';
      b.style.cssText = 'display:inline-flex;align-items:center;gap:6px;min-height:40px;margin:0 0 14px;padding:0 14px;border:1px solid #E1E4EA;border-radius:999px;background:#fff;color:#14161F;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer';
      b.addEventListener('click', install);
      var w = document.createElement('div'); w.className = 'mi-wrap'; w.appendChild(b);
      anchor.parentNode.insertBefore(w, anchor.nextSibling);
    }
    if (ios && !inapp && !off()) setTimeout(show, 5000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    if (!off()) setTimeout(function () { if (go) show(); }, 5000);
  });
  window.addEventListener('appinstalled', function () {
    box.style.display = 'none';
    var b = document.querySelector('.mi-wrap'); if (b) b.style.display = 'none';
  });
})();
