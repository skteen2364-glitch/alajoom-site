/* 알아줌 첫 로그인 정보 받기: 업종 · 지역 · 가게 이름 · 마케팅 수신 동의(선택)
   window.alajoomOnboard(supabaseClient) 로 부른다. 한 번 저장하면 다시 묻지 않는다. */
(function () {
  if (window.alajoomOnboard) return;
  var TYPES = [
    ['food', '음식점'], ['cafe', '카페'], ['bakery', '베이커리'], ['pilates', '필라테스·요가'],
    ['beau', '피부관리·에스테틱'], ['nail', '네일샵'], ['hair', '미용실'], ['funi', '가구·인테리어'],
    ['flower', '꽃집'], ['pet', '애견미용'], ['etc', '기타']
  ];
  var CSS = '#al-ob{position:fixed;inset:0;z-index:100003;font-family:"Noto Sans KR",system-ui,sans-serif;color:#14161F}' +
    '#al-ob .ob-bg{position:absolute;inset:0;background:rgba(10,12,18,.55)}' +
    '#al-ob .ob-pan{position:absolute;left:0;right:0;bottom:0;max-width:440px;max-height:92vh;overflow:auto;margin:0 auto;background:#fff;border-radius:24px 24px 0 0;padding:24px 20px 22px;box-sizing:border-box}' +
    '@media (min-width:721px){#al-ob .ob-pan{bottom:auto;top:50%;transform:translateY(-50%);border-radius:24px}}' +
    '#al-ob h2{margin:0 0 4px;font-size:21px;font-weight:900;letter-spacing:-.5px}' +
    '#al-ob .ob-sub{margin:0 0 16px;font-size:14px;color:#5B6070;line-height:1.5}' +
    '#al-ob label.ob-l{display:block;margin:14px 0 6px;font-size:14px;font-weight:800}' +
    '#al-ob .ob-chips{display:flex;flex-wrap:wrap;gap:6px}' +
    '#al-ob .ob-chip{min-height:40px;padding:0 12px;border:1px solid #E1E4EA;border-radius:999px;background:#fff;font:inherit;font-size:14px;font-weight:600;color:#14161F;cursor:pointer}' +
    '#al-ob .ob-chip[aria-pressed=true]{background:#14161F;border-color:#14161F;color:#FFE45C}' +
    '#al-ob input[type=text]{width:100%;min-height:48px;padding:0 14px;border:1px solid #E1E4EA;border-radius:12px;font:inherit;font-size:16px;box-sizing:border-box}' +
    '#al-ob .ob-agree{display:flex;gap:10px;align-items:flex-start;margin:18px 0 0;padding:12px;border-radius:12px;background:#F6F7FA;font-size:13.5px;line-height:1.5;cursor:pointer}' +
    '#al-ob .ob-agree input{width:20px;height:20px;margin:1px 0 0;flex:none}' +
    '#al-ob .ob-agree small{display:block;color:#6A6F7C;font-size:12px}' +
    '#al-ob .ob-go{width:100%;min-height:54px;margin-top:16px;border:0;border-radius:14px;background:#14161F;color:#FFE45C;font:inherit;font-size:16px;font-weight:800;cursor:pointer}' +
    '#al-ob .ob-go:disabled{opacity:.45;cursor:default}' +
    '#al-ob .ob-later{display:block;margin:10px auto 0;border:0;background:none;font:inherit;font-size:13px;color:#8A8F9C;cursor:pointer;min-height:40px}' +
    '#al-ob .ob-err{display:none;margin:10px 0 0;font-size:13px;color:#C2410C;text-align:center}';

  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }

  var LIVE = { pilates: ['필라테스메이트', '/assets/icon-pilates-192.png'], food: ['푸드메이트', '/assets/icon-food-192.png'] };
  function offerInstall(k) {
    var m = LIVE[k]; if (!m) return;
    if (location.pathname.indexOf('/' + k + '/') === 0) { if (window.alajoomShowInstall) setTimeout(window.alajoomShowInstall, 300); return; }
    var w = document.createElement('div');
    w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.style.cssText = 'position:fixed;inset:0;z-index:100004;font-family:"Noto Sans KR",system-ui,sans-serif;color:#14161F';
    w.innerHTML = '<div data-x style="position:absolute;inset:0;background:rgba(10,12,18,.55)"></div>' +
      '<div style="position:absolute;left:0;right:0;bottom:0;max-width:440px;margin:0 auto;background:#fff;border-radius:24px 24px 0 0;padding:26px 20px 18px;box-sizing:border-box;text-align:center">' +
      '<img src="' + m[1] + '" alt="" width="72" height="72" style="border-radius:18px">' +
      '<h2 style="margin:14px 0 6px;font-size:20px;font-weight:900">' + m[0] + '를 바탕화면에 둘까요?</h2>' +
      '<p style="margin:0 0 16px;font-size:14px;color:#5B6070;line-height:1.55">다음부터 알아줌을 거치지 않고<br>아이콘 하나로 바로 열 수 있어요.</p>' +
      '<button type="button" data-go style="width:100%;min-height:54px;border:0;border-radius:14px;background:#14161F;color:#FFE45C;font:inherit;font-size:16px;font-weight:800;cursor:pointer">네, 깔게요</button>' +
      '<button type="button" data-x style="display:block;width:100%;min-height:44px;margin-top:6px;border:0;background:none;font:inherit;font-size:13px;color:#8A8F9C;cursor:pointer">나중에 할게요</button></div>';
    document.body.appendChild(w);
    w.addEventListener('click', function (e) {
      var t = e.target.closest('[data-go],[data-x]'); if (!t) return;
      if (t.hasAttribute('data-go')) location.href = '/' + k + '/?install=1'; else w.remove();
    });
  }

  window.alajoomOnboard = async function (sb) {
    try {
      if (!sb || document.getElementById('al-ob') || window.alajoomOnboard._busy) return;
      window.alajoomOnboard._busy = true;
      var s = (await sb.auth.getSession()).data.session; if (!s) return;
      try { if (sessionStorage.getItem('al_ob_later')) return; } catch (e) {}
      var q = await sb.from('profiles').select('business_type,store_name,area,marketing_opt_in,onboarded_at').eq('id', s.user.id).maybeSingle();
      if (q.error || !q.data || q.data.onboarded_at) return;
      var p = q.data;
      var guess = (location.pathname.match(/^\/(food|pilates|beau|funi|nail|hair|cafe|bakery|flower|pet)\b/) || [])[1] || p.business_type || '';
      var sel = guess;

      if (!document.getElementById('al-ob-css')) { var st = el('style', { id: 'al-ob-css' }); st.textContent = CSS; document.head.appendChild(st); }
      var box = el('div', { id: 'al-ob', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'al-ob-t' });
      var chips = TYPES.map(function (t) { return '<button type="button" class="ob-chip" data-v="' + t[0] + '" aria-pressed="' + (t[0] === sel) + '">' + t[1] + '</button>'; }).join('');
      box.innerHTML = '<div class="ob-bg"></div><div class="ob-pan">' +
        '<h2 id="al-ob-t">반가워요, 사장님!</h2>' +
        '<p class="ob-sub">가게에 딱 맞는 글을 쓰려고 세 가지만 여쭤볼게요.</p>' +
        '<label class="ob-l">업종</label><div class="ob-chips">' + chips + '</div>' +
        '<label class="ob-l" for="al-ob-store">가게 이름</label><input type="text" id="al-ob-store" maxlength="60" placeholder="예: 연남 해장국" autocomplete="organization">' +
        '<label class="ob-l" for="al-ob-area">지역(동네)</label><input type="text" id="al-ob-area" maxlength="60" placeholder="예: 서울 마포구 연남동">' +
        '<label class="ob-agree"><input type="checkbox" id="al-ob-mkt"><span><b>(선택) 마케팅 정보 수신 동의</b><small>새 기능·혜택·이벤트 소식을 이메일로 받아요. 동의하지 않아도 모든 기능을 쓸 수 있고, 언제든 철회할 수 있어요. <a href="/privacy/" target="_blank" style="color:inherit">자세히</a></small></span></label>' +
        '<button type="button" class="ob-go">시작하기</button>' +
        '<p class="ob-err" role="alert"></p>' +
        '<button type="button" class="ob-later">나중에 할게요</button></div>';
      document.body.appendChild(box);
      var $ = function (x) { return box.querySelector(x); };
      if (p.store_name) $('#al-ob-store').value = p.store_name;
      if (p.area) $('#al-ob-area').value = p.area;
      $('#al-ob-mkt').checked = !!p.marketing_opt_in;
      var go = $('.ob-go');
      var check = function () { go.disabled = !(sel && $('#al-ob-store').value.trim()); };
      check();
      $('.ob-chips').addEventListener('click', function (e) {
        var b = e.target.closest('.ob-chip'); if (!b) return; sel = b.dataset.v;
        box.querySelectorAll('.ob-chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b); }); check();
      });
      $('#al-ob-store').addEventListener('input', check);
      var close = function () { box.remove(); };
      $('.ob-later').addEventListener('click', function () { try { sessionStorage.setItem('al_ob_later', '1'); } catch (e) {} close(); });
      go.addEventListener('click', async function () {
        go.disabled = true;
        var r = await sb.from('profiles').update({
          business_type: sel,
          store_name: $('#al-ob-store').value.trim().slice(0, 60),
          area: $('#al-ob-area').value.trim().slice(0, 60) || null,
          marketing_opt_in: $('#al-ob-mkt').checked
        }).eq('id', s.user.id);
        if (r.error) { var er = $('.ob-err'); er.textContent = '저장하지 못했어요. 잠시 후 다시 눌러 주세요.'; er.style.display = 'block'; go.disabled = false; return; }
        close();
        try { window.dispatchEvent(new CustomEvent('alajoom:onboarded', { detail: { business_type: sel } })); } catch (e) {}
        offerInstall(sel);
      });
    } catch (e) { /* 정보 받기는 실패해도 서비스 이용을 막지 않는다 */ }
    finally { window.alajoomOnboard._busy = false; }
  };
})();
