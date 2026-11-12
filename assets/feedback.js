/* 알아줌 공용: 베타 '의견 보내기' 창 — window.alajoomFeedback(mate) */
(function () {
  if (window.alajoomFeedback) return;
  var KINDS = [['idea', '이런 게 있으면 좋겠어요'], ['bug', '안 돼요·이상해요'], ['good', '좋았어요']];
  window.alajoomFeedback = function (mate) {
    if (document.getElementById('al-fb')) return;
    var w = document.createElement('div');
    w.id = 'al-fb'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-labelledby', 'al-fb-t');
    w.style.cssText = 'position:fixed;inset:0;z-index:100008;font-family:inherit';
    w.innerHTML = '<div data-x style="position:absolute;inset:0;background:rgba(20,22,31,.5)"></div>' +
      '<div style="position:absolute;left:0;right:0;bottom:0;max-width:460px;margin:0 auto;background:#fff;color:#14161F;border-radius:22px 22px 0 0;padding:22px 18px 18px;box-sizing:border-box">' +
      '<b id="al-fb-t" style="display:block;font-size:18px;margin-bottom:4px">의견 보내기</b>' +
      '<p style="margin:0 0 12px;font-size:13px;color:#5B6070;line-height:1.5">불편한 점, 있었으면 하는 기능 뭐든 좋아요. 알아줌 만드는 사람이 직접 읽어요.</p>' +
      '<div id="al-fb-k" role="radiogroup" aria-label="종류" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">' +
      KINDS.map(function (k, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-k="' + k[0] + '" style="min-height:40px;padding:0 12px;border-radius:999px;border:1px solid ' + (i === 0 ? '#14161F' : '#E6E8ED') + ';background:' + (i === 0 ? '#FFE45C' : '#fff') + ';font:inherit;font-size:13px;font-weight:700;color:#14161F;cursor:pointer">' + k[1] + '</button>'; }).join('') + '</div>' +
      '<label for="al-fb-m" style="position:absolute;left:-9999px">내용</label><textarea id="al-fb-m" rows="4" maxlength="2000" placeholder="예: 회원 장부에서 수강권 연장이 한 번에 됐으면 좋겠어요" style="width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:12px;border:1px solid #E6E8ED;border-radius:12px;resize:vertical"></textarea>' +
      '<p id="al-fb-e" role="alert" style="display:none;margin:8px 0 0;font-size:13px;color:#C2410C"></p>' +
      '<div style="display:flex;gap:8px;margin-top:12px"><button type="button" data-x style="flex:1;min-height:48px;border:1px solid #E6E8ED;border-radius:12px;background:#fff;font:inherit;font-weight:700;color:#14161F;cursor:pointer">닫기</button>' +
      '<button type="button" id="al-fb-go" style="flex:2;min-height:48px;border:0;border-radius:12px;background:#14161F;color:#fff;font:inherit;font-weight:800;cursor:pointer">보내기</button></div></div>';
    document.body.appendChild(w);
    var kind = 'idea', ta = w.querySelector('#al-fb-m'), err = w.querySelector('#al-fb-e'), go = w.querySelector('#al-fb-go');
    var close = function () { w.remove(); };
    w.querySelectorAll('[data-x]').forEach(function (b) { b.addEventListener('click', close); });
    w.querySelector('#al-fb-k').addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]'); if (!b) return; kind = b.dataset.k;
      w.querySelectorAll('[data-k]').forEach(function (x) { var on = x === b; x.setAttribute('aria-checked', on); x.style.background = on ? '#FFE45C' : '#fff'; x.style.borderColor = on ? '#14161F' : '#E6E8ED'; });
    });
    var say = function (t) { err.textContent = t; err.style.display = 'block'; };
    go.addEventListener('click', async function () {
      var msg = ta.value.trim();
      if (!msg) { say('내용을 한 줄이라도 적어 주세요.'); ta.focus(); return; }
      go.disabled = true; go.textContent = '보내는 중…'; err.style.display = 'none';
      try {
        if (!window.alajoomAI || !(await window.alajoomAI.loggedIn())) { say('로그인하면 보낼 수 있어요. 홈에서 카카오로 로그인해 주세요.'); go.disabled = false; go.textContent = '보내기'; return; }
        await window.alajoomAI.feedback(kind, msg, mate);
        w.querySelector('div:last-child').innerHTML = '<b style="display:block;font-size:18px;margin:6px 0">고마워요!</b><p style="margin:0 0 14px;font-size:14px;color:#5B6070;line-height:1.5">보내주신 의견 잘 받았어요. 알아줌을 고칠 때 꼭 참고할게요.</p><button type="button" data-x style="width:100%;min-height:48px;border:0;border-radius:12px;background:#14161F;color:#fff;font:inherit;font-weight:800;cursor:pointer">닫기</button>';
        w.querySelector('div:last-child [data-x]').addEventListener('click', close);
      } catch (e) { say('보내지 못했어요. 잠시 후 다시 눌러 주세요.'); go.disabled = false; go.textContent = '보내기'; }
    });
    setTimeout(function () { ta.focus(); }, 50);
  };
})();
