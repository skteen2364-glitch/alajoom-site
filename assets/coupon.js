/* 알아줌 패밀리 — 동네 패밀리 쿠폰
   같은 동네 다른 업종 패밀리 가게끼리 손님을 서로 보내요.
   - 내 가게 쿠폰 만들기 (내용은 사장님이 정함)
   - 우리 동네 패밀리 쿠폰 → 손님에게 보낼 문구 (보내기는 사장님이 직접)
   - 쿠폰 손님 왔어요 +1 (어느 가게에서 보냈는지) */
(function () {
  var MATE = { skin: '피부관리샵', nail: '네일샵', hair: '미용실', pilates: '필라테스', academy: '학원', food: '음식점', cafe: '카페', bakery: '베이커리', funi: '퍼니' };
  var AI = function () { return window.alajoomAI; };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(t) { var el = document.getElementById('toast'); if (!el) { alert(t); return; } el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 2600); }

  var css = document.createElement('style');
  css.textContent = [
    '.cpd{width:min(560px,94vw);max-height:90vh;padding:0;border:0;border-radius:22px;color:#14161F}',
    '.cpd::backdrop{background:rgba(10,12,20,.55)}',
    '.cpd .in{padding:22px 20px 16px;overflow:auto;max-height:90vh;box-sizing:border-box}',
    '.cpd h3{margin:0 0 4px;font-size:21px;font-weight:900;letter-spacing:-.5px}',
    '.cpd .lead{margin:0 0 16px;font-size:14px;color:#4A4F5C;line-height:1.55}',
    '.cpd h4{margin:18px 0 8px;font-size:15px;font-weight:900}',
    '.cpd .box{padding:14px;border-radius:16px;background:#FBF7EE}',
    '.cpd label{display:block;font-size:13px;font-weight:800;margin:0 0 6px}',
    '.cpd input[type=text]{width:100%;box-sizing:border-box;min-height:46px;padding:10px 12px;border-radius:12px;border:1.5px solid #E4DED0;font:inherit;font-size:15px;background:#fff}',
    '.cpd label+input+label{margin-top:10px}',
    '.cpd .row{display:flex;gap:8px;margin-top:12px}',
    '.cpd .b1{flex:1;min-height:48px;border:0;border-radius:12px;background:#14161F;color:#fff;font:inherit;font-size:15px;font-weight:900;cursor:pointer}',
    '.cpd .b2{min-height:48px;padding:0 14px;border:1.5px solid #E4DED0;border-radius:12px;background:#fff;color:#14161F;font:inherit;font-size:14px;font-weight:800;cursor:pointer}',
    '.cpd .tk{display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:#fff;border:1.5px dashed #E3C657}',
    '.cpd .tk+.tk{margin-top:8px}',
    '.cpd .tk i{flex:none;width:40px;height:40px;border-radius:12px;background:#FFD43B;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:19px}',
    '.cpd .tk span{flex:1;min-width:0}',
    '.cpd .tk b{display:block;font-size:15px}',
    '.cpd .tk small{display:block;font-size:12.5px;color:#6B7080;margin-top:2px}',
    '.cpd .tk em{display:block;font-style:normal;font-size:14px;font-weight:800;color:#B04A00;margin-top:4px}',
    '.cpd .tk button{flex:none;min-height:40px;padding:0 12px;border:0;border-radius:10px;background:#FFD43B;color:#14161F;font:inherit;font-size:13px;font-weight:900;cursor:pointer}',
    '.cpd .empty{padding:16px;border-radius:16px;background:#F4F5F8;font-size:14px;color:#4A4F5C;line-height:1.55}',
    '.cpd .cnt{display:flex;gap:8px}',
    '.cpd .cnt div{flex:1;padding:12px;border-radius:14px;background:#fff;border:1px solid #EEE7D6;text-align:center;font-size:12.5px;color:#6B7080}',
    '.cpd .cnt b{display:block;font-size:22px;color:#14161F}',
    '.cpd .plus{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
    '.cpd .plus button{min-height:40px;padding:0 12px;border-radius:999px;border:1.5px solid #E4DED0;background:#fff;font:inherit;font-size:13px;font-weight:800;cursor:pointer}',
    '.cpd .note{margin:12px 0 0;font-size:12.5px;color:#6B7080;line-height:1.55}',
    '.cpd .x{display:block;width:100%;min-height:44px;margin-top:10px;border:0;background:none;font:inherit;font-size:14px;font-weight:700;color:#6B7080;cursor:pointer}'
  ].join('');
  document.head.appendChild(css);

  function link(p, me) { return 'https://alajoom.com/c/?k=' + encodeURIComponent(p.code) + (me && me.code ? '&f=' + encodeURIComponent(me.code) : ''); }
  function msg(p, me) {
    return (me && me.store ? me.store + '에서 ' : '') + '이웃 가게 쿠폰을 드려요 🎁\n' +
      p.store + ' · ' + p.offer + (p.terms ? ' (' + p.terms + ')' : '') + '\n쿠폰 보기 👉 ' + link(p, me);
  }

  window.alajoomCoupon = async function () {
    if (!AI() || !(await AI().loggedIn())) { toast('카카오로 시작하면 쓸 수 있어요'); return; }
    var me = null, parts = [], came = [];
    try { var r = await Promise.all([AI().rpc('coupon_mine'), AI().rpc('coupon_partners'), AI().rpc('coupon_came_by')]); me = r[0] || {}; parts = r[1] || []; came = r[2] || []; }
    catch (e) { toast('잠시 뒤 다시 열어 주세요'); return; }

    var d = document.createElement('dialog'); d.className = 'cpd';
    function render() {
      var hasCp = !!me.offer;
      var near = parts.filter(function (p) { return p.near === '1'; }), wide = parts.filter(function (p) { return p.near !== '1'; });
      var tk = function (p, i) {
        return '<div class="tk"><i aria-hidden="true">🎟️</i><span><b>' + esc(p.store) + '</b><small>' + esc(MATE[p.mate] || '') + ' · ' + esc(p.area || '') + '</small><em>' + esc(p.offer) + '</em>' +
          (p.terms ? '<small>' + esc(p.terms) + '</small>' : '') + '</span><button type="button" data-send="' + i + '">손님에게<br>보내기</button></div>';
      };
      var h = '<div class="in"><h3>동네 패밀리 쿠폰</h3>' +
        '<p class="lead">같은 동네 다른 업종 패밀리 가게와 손님을 서로 보내요. 할인 내용은 사장님이 정하고, 알아줌은 연결만 해요.</p>';

      h += '<h4>1. 우리 가게 쿠폰</h4><div class="box">' +
        (me.area ? '' : '<p class="note" style="margin:0 0 10px;color:#B04A00">가게 정보에 동네(예: 정자동)를 적어 주셔야 이웃 가게와 연결돼요.</p>') +
        '<label for="cpOffer">이웃 가게 손님에게 드릴 혜택</label><input type="text" id="cpOffer" maxlength="60" placeholder="예: 아메리카노 500원 할인" value="' + esc(me.offer || '') + '">' +
        '<label for="cpTerms">조건 (선택)</label><input type="text" id="cpTerms" maxlength="80" placeholder="예: 1인 1회 · 12월 31일까지" value="' + esc(me.terms || '') + '">' +
        '<div class="row"><button type="button" class="b1" data-save>' + (hasCp ? (me.active ? '고친 내용 저장' : '다시 열기') : '쿠폰 열기') + '</button>' +
        (hasCp && me.active ? '<button type="button" class="b2" data-pause>잠시 쉬기</button>' : '') + '</div>' +
        (hasCp ? '<p class="note">' + (me.active ? '지금 이웃 패밀리 가게에 보여요.' : '지금은 쉬는 중이라 이웃 가게에 안 보여요.') + '</p>' : '') + '</div>';

      h += '<h4>2. 우리 동네 패밀리 쿠폰</h4>';
      if (parts.length) {
        if (near.length) h += near.map(function (p) { return tk(p, parts.indexOf(p)); }).join('');
        if (wide.length) h += (near.length ? '<p class="note">가까운 지역</p>' : '') + wide.map(function (p) { return tk(p, parts.indexOf(p)); }).join('');
        h += '<p class="note">보내기를 누르면 손님에게 보낼 문구가 준비돼요. 카톡·문자로 보내는 건 사장님이 직접 해요.</p>';
      } else {
        h += '<div class="empty">아직 우리 동네에 쿠폰을 연 패밀리 가게가 없어요.<br>다른 업종 패밀리가 생기면 여기에 바로 보여요. 아는 사장님께 알아줌을 소개해 보세요.</div>';
      }

      if (hasCp) {
        var cmap = {}; came.forEach(function (c) { cmap[c.code] = c.n; });
        h += '<h4>3. 쿠폰 손님 왔어요</h4><div class="box"><div class="cnt"><div><b>' + (me.came || 0) + '</b>우리 가게에 온 손님</div><div><b>' + (me.sent || 0) + '</b>내가 보낸 손님</div></div>' +
          '<p class="note">손님이 쿠폰 화면을 보여 주면, 보낸 가게를 눌러 주세요.</p><div class="plus">' +
          parts.map(function (p) { return '<button type="button" data-use="' + esc(p.code) + '">+1 ' + esc(p.store) + (cmap[p.code] ? ' · ' + cmap[p.code] : '') + '</button>'; }).join('') +
          '<button type="button" data-use="">+1 기타</button></div></div>';
      }
      h += '<button type="button" class="x" data-x>닫기</button></div>';
      d.innerHTML = h;
    }
    render();
    document.body.appendChild(d);

    var busy = false;
    d.addEventListener('click', async function (e) {
      if (e.target === d || e.target.closest('[data-x]')) { d.close && d.close(); d.remove(); return; }
      if (busy) return;
      var s = e.target.closest('[data-save],[data-pause]');
      if (s) {
        var offer = d.querySelector('#cpOffer').value.trim(), terms = d.querySelector('#cpTerms').value.trim();
        if (offer.length < 2) { toast('혜택을 적어 주세요'); d.querySelector('#cpOffer').focus(); return; }
        busy = true;
        try { me = await AI().rpc('coupon_save', { p_offer: offer, p_terms: terms, p_active: !s.hasAttribute('data-pause') }); toast(s.hasAttribute('data-pause') ? '쿠폰을 잠시 쉬어요' : '쿠폰을 열었어요'); render(); }
        catch (er) { toast(/family_only/.test(er && er.message) ? '패밀리 사장님만 쿠폰을 열 수 있어요' : '잠시 뒤 다시 눌러 주세요'); }
        busy = false; return;
      }
      var b = e.target.closest('[data-send]');
      if (b) {
        var p = parts[+b.dataset.send], t = msg(p, me);
        if (navigator.share) { try { await navigator.share({ text: t }); } catch (er) {} }
        else { try { await navigator.clipboard.writeText(t); toast('보낼 문구를 복사했어요. 카톡에 붙여 넣어 보내 주세요'); } catch (er) { prompt('복사해서 보내 주세요', t); } }
        return;
      }
      var u = e.target.closest('[data-use]');
      if (u) {
        busy = true;
        try { me = await AI().rpc('coupon_use', { p_from: u.dataset.use }); came = await AI().rpc('coupon_came_by'); toast('쿠폰 손님 +1'); render(); }
        catch (er) { toast('잠시 뒤 다시 눌러 주세요'); }
        busy = false;
      }
    });
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  };
})();
