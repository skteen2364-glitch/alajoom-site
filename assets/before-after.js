/* 알아줌 · 전후 사진 만들기 (스킨·네일·헤어)
   시술 전·후 실제 사진 두 장을 같은 크기로 맞춰 한 장으로 붙여요.
   두 사진에는 똑같은 밝기 조절만 적용하고(후 사진만 보정하지 않음), AI로 바꾸지 않아요. */
(function () {
  var MATE = (location.pathname.match(/^\/(skin|nail|hair)\b/) || [])[1] || 'skin';
  var TXT = {
    skin: { tip: '같은 자리·같은 조명·같은 각도에서 찍은 사진이 가장 믿음직해요.', warn: '피부관리는 효과를 약속하면 안 돼요. 글에는 "개인차가 있어요"가 자동으로 들어가요.', topic: '관리 과정 소개' },
    nail: { tip: '같은 손, 같은 각도로 찍으면 디자인 변화가 잘 보여요.', warn: '손발톱 치료·회복처럼 보이는 말은 쓰지 않아요.', topic: '시술 과정' },
    hair: { tip: '뒷모습·옆모습도 좋아요. 같은 자리·같은 조명이면 더 좋아요.', warn: '탈모·두피 개선 같은 효과는 약속하지 않아요.', topic: '시술 과정' }
  }[MATE];
  var S = { a: null, b: null, lay: 'lr', lab: 'en', bri: 0, ok: false, pos: { a: { x: 0, y: 0, z: 1 }, b: { x: 0, y: 0, z: 1 } } };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var LAYS = [['lr', '좌우 (인스타 4:5)'], ['tb', '위아래 (4:5)'], ['sq', '좌우 정사각형']];
  function shop() { try { var t = (document.title || '').trim(); var s = JSON.parse(localStorage.getItem('pm_' + t + '_studio') || 'null'); if (s && s.name) return s.name; } catch (e) {} return ''; }
  function toast(t) { var el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 1900); }

  function size() { return S.lay === 'sq' ? [1080, 1080] : [1080, 1350]; }
  function slots(W, H) {
    var g = 8;
    if (S.lay === 'tb') { var h = (H - g) / 2; return { a: [0, 0, W, h], b: [0, h + g, W, h] }; }
    var w = (W - g) / 2; return { a: [0, 0, w, H], b: [w + g, 0, w, H] };
  }
  function drawImg(ctx, img, r, p) {
    var x = r[0], y = r[1], w = r[2], h = r[3];
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (!img) { ctx.fillStyle = '#EFEAE0'; ctx.fillRect(x, y, w, h); ctx.restore(); return; }
    var sc = Math.max(w / img.width, h / img.height) * p.z, dw = img.width * sc, dh = img.height * sc;
    var mx = Math.max(0, (dw - w) / 2), my = Math.max(0, (dh - h) / 2);
    var ox = Math.max(-mx, Math.min(mx, p.x)), oy = Math.max(-my, Math.min(my, p.y)); p.x = ox; p.y = oy;
    if (S.bri) ctx.filter = 'brightness(' + (100 + S.bri) + '%)';
    ctx.drawImage(img, x + (w - dw) / 2 + ox, y + (h - dh) / 2 + oy, dw, dh);
    ctx.restore();
  }
  function pill(ctx, text, x, y, dark) {
    ctx.font = '800 40px "Pretendard","Noto Sans KR",sans-serif';
    var w = ctx.measureText(text).width + 44, h = 64;
    ctx.fillStyle = dark ? 'rgba(20,22,31,.82)' : 'rgba(255,255,255,.92)';
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 32); else ctx.rect(x, y, w, h); ctx.fill();
    ctx.fillStyle = dark ? '#FFD43B' : '#14161F'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 22, y + h / 2 + 2);
  }
  function compose(scale) {
    scale = scale || 1;
    var wh = size(), W = wh[0], H = wh[1], cv = document.createElement('canvas');
    cv.width = W * scale; cv.height = H * scale;
    var ctx = cv.getContext('2d'); ctx.scale(scale, scale);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
    var sl = slots(W, H);
    drawImg(ctx, S.a, sl.a, S.pos.a); drawImg(ctx, S.b, sl.b, S.pos.b);
    var L = S.lab === 'ko' ? ['전', '후'] : ['BEFORE', 'AFTER'];
    pill(ctx, L[0], sl.a[0] + 28, sl.a[1] + 28, false); pill(ctx, L[1], sl.b[0] + 28, sl.b[1] + 28, true);
    var nm = shop();
    if (nm) { ctx.font = '700 28px "Pretendard","Noto Sans KR",sans-serif'; ctx.textBaseline = 'alphabetic'; var tw = ctx.measureText(nm).width; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText(nm, W - tw - 29, H - 27); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fillText(nm, W - tw - 30, H - 28); }
    return cv;
  }
  function draw() {
    var cv = document.getElementById('baCv'); if (!cv) return;
    var src = compose(1), wh = size(); cv.width = wh[0]; cv.height = wh[1];
    cv.getContext('2d').drawImage(src, 0, 0);
    var ready = S.a && S.b; ['baSave', 'baUse'].forEach(function (id) { var b = document.getElementById(id); if (b) b.disabled = !(ready && S.ok); });
  }
  function load(file, k) {
    if (!file) return;
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () { S[k] = im; S.pos[k] = { x: 0, y: 0, z: 1 }; var t = document.getElementById('baT' + k); if (t) t.textContent = (k === 'a' ? '전' : '후') + ' 사진 바꾸기'; draw(); };
    im.onerror = function () { toast('이 사진은 열 수 없어요. JPG나 PNG로 골라주세요'); };
    im.src = url;
  }
  function render(panel) {
    var h = '<h2>전후 사진 만들기</h2>' +
      '<p class="note" style="margin:0 0 4px">시술 <b>전</b>과 <b>후</b> 실제 사진 두 장을 같은 크기로 맞춰 한 장으로 만들어요. ' + esc(TXT.tip) + '</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      ['a', 'b'].map(function (k) { return '<label class="drop" style="min-height:84px;padding:12px;cursor:pointer"><b id="baT' + k + '">' + (k === 'a' ? '전' : '후') + ' 사진 고르기</b><span>' + (k === 'a' ? '시술 전' : '시술 후') + '</span><input type="file" accept="image/*,.heic,.heif" data-ba="' + k + '" style="position:absolute;width:1px;height:1px;opacity:0"></label>'; }).join('') + '</div>' +
      '<div style="position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:#F7F4EE;touch-action:none"><canvas id="baCv" style="display:block;width:100%;height:auto" aria-label="전후 사진 미리보기"></canvas></div>' +
      '<p class="note" style="margin:0;font-size:12.5px">사진을 손가락으로 밀면 위치가, 아래 막대로 크기가 바뀌어요. 두 사진의 얼굴·손 위치를 비슷하게 맞춰 주세요.</p>' +
      ['a', 'b'].map(function (k) { return '<label class="sl"><span>' + (k === 'a' ? '전' : '후') + ' 크기</span><input type="range" min="100" max="250" value="100" data-baz="' + k + '"></label>'; }).join('') +
      '<div class="step"><p>모양</p><div class="chips" role="group">' + LAYS.map(function (l) { return '<button type="button" class="chip" data-balay="' + l[0] + '" aria-pressed="' + (S.lay === l[0]) + '">' + l[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="step"><p>글자</p><div class="chips" role="group"><button type="button" class="chip" data-balab="en" aria-pressed="' + (S.lab === 'en') + '">BEFORE · AFTER</button><button type="button" class="chip" data-balab="ko" aria-pressed="' + (S.lab === 'ko') + '">전 · 후</button></div></div>' +
      '<label class="sl"><span>밝기 (두 사진 똑같이)</span><input type="range" min="-30" max="30" value="' + S.bri + '" id="baBri"></label>' +
      '<p class="note" style="margin:0;font-size:12.5px">믿을 수 있는 전후 사진을 위해 <b>후 사진만 따로 보정하지 않아요.</b> AI로 바꾸지도 않아요. ' + esc(TXT.warn) + '</p>' +
      '<label style="display:flex;gap:10px;align-items:flex-start;font-size:14px;font-weight:700;background:var(--ivory);border-radius:12px;padding:12px"><input type="checkbox" id="baOk" style="width:20px;height:20px;flex:none;margin-top:1px"' + (S.ok ? ' checked' : '') + '><span>고객님께 사진을 홍보에 써도 된다는 동의를 받았어요<small style="display:block;font-weight:500;color:var(--muted)">얼굴이 나오면 꼭 동의를 받아 주세요. 동의가 없으면 얼굴 없이 부분만 찍어 주세요.</small></span></label>' +
      '<div style="display:flex;gap:8px"><button type="button" class="sub" id="baSave" disabled>사진 저장</button><button type="button" class="go" id="baUse" disabled style="flex:1;justify-content:center">이 사진으로 홍보글 쓰기</button></div>';
    panel.innerHTML = h;
    panel.querySelectorAll('[data-ba]').forEach(function (inp) { inp.addEventListener('change', function () { load(inp.files && inp.files[0], inp.dataset.ba); }); });
    panel.querySelectorAll('[data-baz]').forEach(function (r) { r.value = Math.round(S.pos[r.dataset.baz].z * 100); r.addEventListener('input', function () { S.pos[r.dataset.baz].z = r.value / 100; draw(); }); });
    document.getElementById('baBri').addEventListener('input', function (e) { S.bri = +e.target.value; draw(); });
    document.getElementById('baOk').addEventListener('change', function (e) { S.ok = e.target.checked; draw(); });
    panel.addEventListener('click', function (e) {
      var t = e.target.closest('[data-balay],[data-balab],#baSave,#baUse'); if (!t) return;
      if (t.dataset.balay) { S.lay = t.dataset.balay; t.parentNode.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', b === t); }); draw(); return; }
      if (t.dataset.balab) { S.lab = t.dataset.balab; t.parentNode.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', b === t); }); draw(); return; }
      if (t.id === 'baSave') { compose(1).toBlob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = '전후사진_' + new Date().toISOString().slice(0, 10) + '.jpg'; document.body.appendChild(a); a.click(); a.remove(); toast('사진을 저장했어요'); }, 'image/jpeg', .92); return; }
      if (t.id === 'baUse') { compose(1).toBlob(function (b) { if (window.alajoomUseAsPhoto) window.alajoomUseAsPhoto(b, { ba: MATE, topic: TXT.topic }); }, 'image/jpeg', .92); }
    });
    var cv = document.getElementById('baCv'), drag = null;
    cv.addEventListener('pointerdown', function (e) {
      var r = cv.getBoundingClientRect(), wh = size(), k = (wh[0] / r.width), px = (e.clientX - r.left) * k, py = (e.clientY - r.top) * k, sl = slots(wh[0], wh[1]);
      var hit = ['a', 'b'].filter(function (s) { var q = sl[s]; return px >= q[0] && px <= q[0] + q[2] && py >= q[1] && py <= q[1] + q[3]; })[0];
      if (!hit || !S[hit]) return; drag = { k: hit, x: e.clientX, y: e.clientY, s: k }; cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; var p = S.pos[drag.k]; p.x += (e.clientX - drag.x) * drag.s; p.y += (e.clientY - drag.y) * drag.s; drag.x = e.clientX; drag.y = e.clientY; draw(); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { cv.addEventListener(ev, function () { drag = null; }); });
    draw();
  }
  window.alajoomBA = { render: render, rule: function () {
    return '\n이 사진은 시술 전후 비교 사진이야. 사진에 보이는 변화(' + (MATE === 'nail' ? '디자인·컬러' : MATE === 'hair' ? '스타일·길이·컬러' : '정돈된 느낌·관리 과정') + ')를 담백하게 설명하고, 효과를 약속하거나 과장하지 마.' + (MATE === 'skin' ? ' 마지막에 "관리 결과는 피부 상태에 따라 개인차가 있어요." 한 줄을 꼭 넣어.' : '') + ' 고객 이름은 쓰지 마.\n';
  } };
})();
