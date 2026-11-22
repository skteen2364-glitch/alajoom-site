/* 알아줌 · 사진으로 릴스 만들기
   사진 3~6장 + 자막으로 15초 안팎의 세로 영상(9:16)을 휴대폰·PC 브라우저 안에서 바로 만들어요.
   AI 영상 서비스를 쓰지 않아서 횟수 제한·비용이 없어요. 자막을 AI에게 맡길 때만 글 1회가 차감돼요.
   사진은 서버로 보내지 않아요(자막 AI도 글만 보냄). */
(function () {
  if (window.alajoomReels) return;
  var MATE = (location.pathname.split('/')[1] || 'skin');
  var OLD = { skin: '스킨메이트', nail: '네일메이트', hair: '헤어메이트', pilates: '필라테스메이트', academy: '학원메이트', food: '푸드메이트', cafe: '카페메이트', bakery: '베이커리메이트' };
  var HOOK = {
    skin: ['오늘 관리실 풍경이에요', '한 분만을 위한 시간', '꼼꼼하게, 편안하게', '예약은 프로필 링크에서'],
    nail: ['이번 주 디자인 모음', '손끝까지 꼼꼼하게', '이런 디자인 어떠세요?', '예약은 프로필 링크에서'],
    hair: ['오늘의 스타일', '어울리는 길이 찾기', '편하게 상담해요', '예약은 프로필 링크에서'],
    pilates: ['오늘 수업 풍경', '소수 정예로 꼼꼼하게', '처음이어도 괜찮아요', '체험 수업은 프로필 링크에서'],
    academy: ['우리 반 수업 시간', '한 명 한 명 살펴요', '상담은 언제든 편하게', '상담 예약은 프로필 링크에서'],
    food: ['오늘 나온 메뉴', '매일 아침 직접 준비해요', '따뜻할 때 드세요', '위치·주문은 프로필 링크에서'],
    cafe: ['오늘의 커피 한 잔', '직접 굽고 직접 내려요', '쉬어 가기 좋은 자리', '위치는 프로필 링크에서'],
    bakery: ['갓 구운 빵 나왔어요', '매일 새벽 직접 구워요', '오늘의 추천 빵', '위치·예약은 프로필 링크에서']
  }[MATE] || ['오늘의 소식', '정성껏 준비했어요', '편하게 들러 주세요', '프로필 링크에서 확인하세요'];

  var W = 720, H = 1280, FPS = 30;
  var S = { pics: [], caps: [], line: '', pace: 3, end: true, busy: false, url: null, blob: null, ext: 'mp4' };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function $(s, r) { return (r || document).querySelector(s); }
  function toast(t) { var el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 2200); }
  function studio() { try { var s = JSON.parse(localStorage.getItem('pm_' + (OLD[MATE] || '') + '_studio') || 'null'); if (s && s.name) return s; } catch (e) {} return { name: '', area: '', contact: '' }; }
  function blue() { var v = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim(); return v || '#B83C66'; }

  var chickImg = null;
  function loadChick() {
    if (chickImg || !window.alajoomTeam || !window.alajoomTeam.svg) return;
    try {
      var svg = window.alajoomTeam.svg('write', 240).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      var im = new Image(); im.onload = function () { chickImg = im; }; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    } catch (e) {}
  }

  /* ---------- 화면 ---------- */
  function render(panel) {
    loadChick();
    var st = studio();
    var h = '<h2>사진으로 릴스 만들기</h2>';
    h += '<p class="note" style="margin-top:-6px">사진 3~6장이면 15초 세로 영상이 돼요. AI 영상이 아니라 <b>횟수 제한 없이 무료</b>예요. 음악은 인스타에서 올릴 때 넣으면 저작권 걱정이 없어요.</p>';
    h += '<p class="note" style="font-size:13px;font-weight:700;color:var(--ink)"><span class="stepno">1</span>사진 고르기 <small style="font-weight:500;color:var(--muted)">(최대 6장, 순서대로)</small></p>';
    h += '<div class="drop" id="rlDrop"><b>사진 여러 장 고르기</b><span>한 번에 여러 장 골라도 돼요</span><input type="file" id="rlFile" accept="image/*" multiple aria-label="릴스에 넣을 사진 고르기" class="file-cover"></div>';
    h += '<div id="rlPics" class="rl-pics"></div>';
    h += '<div id="rlBody" class="hidden" style="display:flex;flex-direction:column;gap:14px">';
    h += '<p class="note" style="font-size:13px;font-weight:700;color:var(--ink)"><span class="stepno">2</span>자막</p>';
    h += '<div class="step"><label for="rlLine">한 줄로 알려주세요 (첫 장면 자막)</label><input type="text" id="rlLine" maxlength="30" placeholder="예: 12월 첫 방문 20% 할인"></div>';
    h += '<div id="rlCaps" style="display:flex;flex-direction:column;gap:8px"></div>';
    h += '<button type="button" class="sub" id="rlAI">술술이에게 자막 맡기기 <small style="font-weight:500">(글 1회 차감)</small></button>';
    h += '<div class="step"><p id="lb_rlp">넘기는 속도</p><div class="chips" role="group" aria-labelledby="lb_rlp"><button type="button" class="chip" data-rlp="3.4" aria-pressed="false">차분하게</button><button type="button" class="chip" data-rlp="2.6" aria-pressed="true">보통</button><button type="button" class="chip" data-rlp="1.9" aria-pressed="false">빠르게</button></div></div>';
    h += '<label class="ck" for="rlEnd"><input type="checkbox" id="rlEnd" checked> 마지막에 가게 이름·예약 안내 넣기</label>';
    h += '<p class="note" style="font-size:13px;font-weight:700;color:var(--ink)"><span class="stepno">3</span>미리보기</p>';
    h += '<div class="rl-stage"><canvas id="rlCv" width="' + W + '" height="' + H + '" aria-label="릴스 미리보기"></canvas><div class="rl-side"><p class="note" id="rlLen"></p><button class="go" type="button" id="rlMake">영상 만들기</button><p class="note" id="rlProg" style="margin:0"></p><div id="rlDone" class="hidden" style="display:flex;flex-direction:column;gap:8px"></div></div></div>';
    h += '<p class="note">고객 얼굴이 나온 사진은 꼭 본인 동의를 받고 써 주세요. 사진은 서버로 보내지 않고 이 기기 안에서만 영상으로 만들어요.</p>';
    h += '</div>';
    panel.innerHTML = h;
    S.pics = []; S.caps = []; S.line = ''; S.pace = 2.6; S.end = true; S.busy = false; S.blob = null;
    if (S.url) { URL.revokeObjectURL(S.url); S.url = null; }
    $('#rlFile').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    var drop = $('#rlDrop');
    ['dragover', 'dragenter'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); }); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); addFiles(e.dataTransfer.files); });
    $('#rlLine').addEventListener('input', function () { S.line = this.value.trim(); dirty(); });
    $('#rlEnd').addEventListener('change', function () { S.end = this.checked; dirty(); });
    panel.addEventListener('click', onClick);
    panel.addEventListener('input', function (e) { var i = e.target.dataset && e.target.dataset.cap; if (i != null) { S.caps[+i] = e.target.value; dirty(); } });
    startPreview();
  }

  function onClick(e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.rlp) { S.pace = +t.dataset.rlp; t.parentNode.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', b === t); }); dirty(); return; }
    if (t.dataset.mv) { var i = +t.dataset.i, j = i + (+t.dataset.mv); if (j < 0 || j >= S.pics.length) return; swap(S.pics, i, j); swap(S.caps, i, j); picsUI(); capsUI(); dirty(); return; }
    if (t.dataset.rm != null) { var k = +t.dataset.rm; S.pics.splice(k, 1); S.caps.splice(k, 1); picsUI(); capsUI(); dirty(); return; }
    if (t.id === 'rlAI') return aiCaps(t);
    if (t.id === 'rlMake') return make();
    if (t.dataset.rla === 'save') return save();
    if (t.dataset.rla === 'ig') return toInsta();
  }
  function swap(a, i, j) { var x = a[i]; a[i] = a[j]; a[j] = x; }

  function addFiles(list) {
    var fs = Array.prototype.slice.call(list || []).filter(function (f) { return /^image\//.test(f.type) || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name); });
    if (!fs.length) { toast('사진을 받지 못했어요. 다시 골라 주세요'); return; }
    var room = 6 - S.pics.length; if (room <= 0) { toast('사진은 6장까지 넣을 수 있어요'); return; }
    if (fs.length > room) toast('앞의 ' + room + '장만 넣었어요 (최대 6장)');
    Promise.all(fs.slice(0, room).map(loadImg)).then(function (ims) {
      ims.forEach(function (im) { if (!im) return; S.pics.push(im); S.caps.push(''); });
      fillCaps(); picsUI(); capsUI(); dirty();
      $('#rlBody').classList.toggle('hidden', !S.pics.length);
      if (S.pics.length && S.pics.length < 3) toast('3장 이상이면 더 자연스러워요');
    });
  }
  function loadImg(f) {
    return new Promise(function (res) {
      var url = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        // 큰 사진은 줄여서 메모리를 아껴요
        var m = 1400, sc = Math.min(1, m / Math.max(im.width, im.height));
        var c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.thumb = c.toDataURL('image/jpeg', .6); res(c);
      };
      im.onerror = function () { URL.revokeObjectURL(url); toast('열 수 없는 사진이 있어요 (HEIC는 앨범에서 JPG로 골라 주세요)'); res(null); };
      im.src = url;
    });
  }
  function fillCaps() { for (var i = 0; i < S.caps.length; i++) if (!S.caps[i] && i > 0) S.caps[i] = HOOK[Math.min(i, HOOK.length - 1)] || ''; }
  function picsUI() {
    var el = $('#rlPics'); if (!el) return;
    el.innerHTML = S.pics.map(function (c, i) {
      return '<div class="rl-pic"><img src="' + c.thumb + '" alt="' + (i + 1) + '번째 사진"><span>' + (i + 1) + '</span><div><button type="button" data-mv="-1" data-i="' + i + '" aria-label="앞으로">‹</button><button type="button" data-rm="' + i + '" aria-label="빼기">×</button><button type="button" data-mv="1" data-i="' + i + '" aria-label="뒤로">›</button></div></div>';
    }).join('');
  }
  function capsUI() {
    var el = $('#rlCaps'); if (!el) return;
    el.innerHTML = S.pics.map(function (c, i) {
      if (i === 0) return '<p class="note" style="margin:0">1번 사진: 위 한 줄이 자막으로 나와요</p>';
      return '<label class="rl-cap"><span>' + (i + 1) + '번</span><input type="text" maxlength="28" data-cap="' + i + '" value="' + esc(S.caps[i] || '') + '" placeholder="자막 (비워 두면 사진만)"></label>';
    }).join('');
  }

  async function aiCaps(btn) {
    if (!S.pics.length) return toast('사진부터 골라 주세요');
    var ai = null; try { ai = window.claude && window.claude.use ? await window.claude.use('sample') : null; } catch (e) {}
    if (!ai || !ai.json) { toast('카카오로 로그인하면 술술이가 자막을 써 드려요'); return; }
    var st = studio(), n = S.pics.length;
    btn.disabled = true; var old = btn.innerHTML; btn.textContent = '술술이가 자막 쓰는 중…';
    try {
      var p = '인스타 릴스용 짧은 자막을 써 줘. 가게: ' + (st.name || '') + ' (' + (st.area || '') + '), 업종: ' + (document.title || '') + '. 대표 메뉴/서비스: ' + (st.cls || '') + '. 사장님이 알리고 싶은 말: "' + (S.line || '오늘의 소식') + '". ' +
        '사진은 ' + n + '장. 장면마다 자막 1개씩, 총 ' + n + '개. 첫 자막은 3초 안에 눈길을 끄는 문장. 각 자막은 한국어 14자 안팎, 최대 22자, 이모지 없이. 효과·효능을 약속하거나 과장(최고, 1위, 100%, 치료, 다이어트)하지 마. ' +
        '{"caps":["자막1","자막2",...]} 형식.';
      var j = await ai.json(p);
      var caps = j && Array.isArray(j.caps) ? j.caps : null;
      if (!caps || !caps.length) throw new Error('empty');
      caps = caps.map(function (x) { return String(x || '').replace(/["\n]/g, ' ').trim().slice(0, 28); });
      S.line = caps[0] || S.line; $('#rlLine').value = S.line;
      for (var i = 1; i < n; i++) S.caps[i] = caps[i] || S.caps[i] || '';
      capsUI(); dirty(); toast('자막을 넣었어요. 눌러서 고칠 수 있어요');
    } catch (e) { if (!(e && e.code)) toast('자막을 받지 못했어요. 직접 적어 주세요'); }
    btn.disabled = false; btn.innerHTML = old;
  }

  /* ---------- 그리기 ---------- */
  var XF = 0.45, ENDLEN = 2.6;
  function total() { return S.pics.length * S.pace + (S.end ? ENDLEN : 0); }
  function capAt(i) { return i === 0 ? (S.line || '') : (S.caps[i] || ''); }
  function cover(ctx, img, k, z, dir) {
    var sc = Math.max(W / img.width, H / img.height) * z, dw = img.width * sc, dh = img.height * sc;
    var mx = (dw - W) / 2, my = (dh - H) / 2;
    var ox = dir % 2 ? (k - .5) * 2 * mx * .8 : 0, oy = dir % 2 ? 0 : (k - .5) * 2 * my * .8;
    if (dir >= 2) { ox = -ox; oy = -oy; }
    ctx.drawImage(img, (W - dw) / 2 + ox, (H - dh) / 2 + oy, dw, dh);
  }
  function wrap(ctx, text, maxW) {
    var lines = [], cur = '';
    // 한국어는 띄어쓰기 단위로, 너무 길면 글자 단위로
    var parts = String(text).split(' ');
    parts.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width <= maxW) { cur = t; return; }
      if (cur) lines.push(cur);
      cur = w;
      while (ctx.measureText(cur).width > maxW && cur.length > 1) { var cut = cur.length - 1; while (cut > 1 && ctx.measureText(cur.slice(0, cut)).width > maxW) cut--; lines.push(cur.slice(0, cut)); cur = cur.slice(cut); }
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function caption(ctx, text, a) {
    if (!text) return;
    ctx.save();
    ctx.font = '800 50px "Pretendard","Noto Sans KR","Apple SD Gothic Neo",sans-serif';
    var lines = wrap(ctx, text, W - 160), lh = 66, bw = 0;
    lines.forEach(function (l) { bw = Math.max(bw, ctx.measureText(l).width); });
    var pw = bw + 64, ph = lines.length * lh + 40, x = (W - pw) / 2, y = H * 0.68 + (1 - a) * 40;
    ctx.globalAlpha = a;
    ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(255,255,255,.95)'; rr(ctx, x, y, pw, ph, 28); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#FFD43B'; rr(ctx, x + 22, y + ph - 14, pw - 44, 6, 3); ctx.fill();
    ctx.fillStyle = '#14161F'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach(function (l, i) { ctx.fillText(l, W / 2, y + 20 + lh / 2 + i * lh); });
    ctx.restore();
  }
  function badge(ctx, name) {
    if (!name) return;
    ctx.save(); ctx.font = '800 28px "Pretendard","Noto Sans KR",sans-serif';
    var w = ctx.measureText(name).width + 40;
    ctx.fillStyle = 'rgba(20,22,31,.62)'; rr(ctx, 36, 60, w, 52, 26); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(name, 56, 87); ctx.restore();
  }
  function endCard(ctx, a, k) {
    if (!chickImg) loadChick();
    var st = studio();
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#FFF4C7'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(W / 2, H * 0.36, 210 + Math.sin(k * 6) * 6, 0, Math.PI * 2); ctx.fill();
    if (chickImg) ctx.drawImage(chickImg, W / 2 - 150, H * 0.36 - 160, 300, 300);
    ctx.fillStyle = '#14161F'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 64px "Pretendard","Noto Sans KR",sans-serif'; ctx.fillText(st.name || '우리 가게', W / 2, H * 0.62);
    ctx.font = '700 36px "Pretendard","Noto Sans KR",sans-serif'; ctx.fillStyle = '#4A4F5C';
    if (st.area) ctx.fillText(st.area, W / 2, H * 0.62 + 70);
    ctx.fillStyle = blue(); rr(ctx, W / 2 - 250, H * 0.75, 500, 92, 46); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '800 36px "Pretendard","Noto Sans KR",sans-serif';
    ctx.fillText(MATE === 'food' || MATE === 'cafe' || MATE === 'bakery' ? '위치는 프로필 링크에서' : '예약은 프로필 링크에서', W / 2, H * 0.75 + 47);
    if (st.contact) { ctx.fillStyle = '#5B6070'; ctx.font = '600 28px "Pretendard","Noto Sans KR",sans-serif'; ctx.fillText(String(st.contact).slice(0, 26), W / 2, H * 0.75 + 140); }
    ctx.restore();
  }
  function frame(ctx, t) {
    var n = S.pics.length, st = studio();
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
    if (!n) {
      ctx.fillStyle = '#F3EEE3'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#8A8F9C'; ctx.textAlign = 'center';
      ctx.font = '700 40px "Pretendard","Noto Sans KR",sans-serif'; ctx.fillText('사진을 고르면', W / 2, H / 2 - 30); ctx.fillText('여기서 미리 보여요', W / 2, H / 2 + 30); return;
    }
    var picEnd = n * S.pace;
    if (t < picEnd + XF || !S.end) {
      var i = Math.min(n - 1, Math.floor(t / S.pace)), k = (t - i * S.pace) / S.pace;
      ctx.save(); cover(ctx, S.pics[i], Math.min(1, k), 1.06 + 0.1 * Math.min(1, k), i % 4); ctx.restore();
      var nk = t - (i + 1) * S.pace + XF;
      if (i + 1 < n && nk > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, nk / XF); cover(ctx, S.pics[i + 1], 0, 1.06, (i + 1) % 4); ctx.restore(); }
      var g = ctx.createLinearGradient(0, H * 0.55, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = g; ctx.fillRect(0, H * 0.55, W, H * 0.45);
      badge(ctx, st.name);
      var ca = Math.min(1, (t - i * S.pace) / 0.35) * Math.min(1, ((i + 1) * S.pace - t) / 0.3 + (i === n - 1 && !S.end ? 1 : 0));
      caption(ctx, capAt(i), Math.max(0, Math.min(1, ca)));
    }
    if (S.end && t > picEnd - XF) { var ea = Math.min(1, (t - picEnd + XF) / XF); endCard(ctx, ea, t - picEnd); }
  }

  /* ---------- 미리보기 ---------- */
  var raf = 0, t0 = 0;
  function dirty() { t0 = performance.now(); var L = $('#rlLen'); if (L) L.textContent = S.pics.length ? '길이 ' + total().toFixed(1) + '초 · 세로 9:16' : ''; }
  function startPreview() {
    cancelAnimationFrame(raf); dirty();
    var loop = function () {
      var cv = document.getElementById('rlCv'); if (!cv) return; // 다른 메뉴로 가면 멈춤
      if (!S.busy) { var T = total() || 1, t = ((performance.now() - t0) / 1000) % (T + 0.6); frame(cv.getContext('2d'), Math.min(t, T)); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  /* ---------- 녹화 ---------- */
  function pickMime() {
    if (!window.MediaRecorder) return null;
    var c = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (var i = 0; i < c.length; i++) { try { if (MediaRecorder.isTypeSupported(c[i])) return c[i]; } catch (e) {} }
    return '';
  }
  async function make() {
    if (S.busy) return;
    if (S.pics.length < 2) return toast('사진을 2장 이상 골라 주세요');
    var cv = document.getElementById('rlCv');
    var mime = pickMime();
    if (mime === null || !cv.captureStream) { toast('이 브라우저는 영상 만들기를 못 해요. 크롬이나 사파리 최신판으로 열어 주세요'); return; }
    try { await document.fonts.load('800 50px "Pretendard"'); } catch (e) {}
    S.busy = true; var btn = $('#rlMake'), prog = $('#rlProg'); btn.disabled = true; $('#rlDone').classList.add('hidden');
    var ctx = cv.getContext('2d'), T = total();
    frame(ctx, 0);
    var stream = cv.captureStream(FPS), chunks = [];
    var rec; try { rec = mime ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6000000 }) : new MediaRecorder(stream); } catch (e) { rec = new MediaRecorder(stream); }
    var type = (rec.mimeType || mime || 'video/webm').split(';')[0];
    S.ext = /mp4/.test(type) ? 'mp4' : 'webm';
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    var done = new Promise(function (r) { rec.onstop = r; });
    rec.start(250);
    var start = performance.now();
    await new Promise(function (res) {
      var step = function () {
        var t = (performance.now() - start) / 1000;
        frame(ctx, Math.min(t, T));
        prog.textContent = '영상 만드는 중 ' + Math.min(100, Math.round(t / T * 100)) + '% · 화면을 켜 둔 채로 기다려 주세요';
        if (t >= T + 0.15) return res();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    rec.stop(); await done;
    stream.getTracks().forEach(function (tr) { tr.stop(); });
    S.blob = new Blob(chunks, { type: type });
    if (S.url) URL.revokeObjectURL(S.url); S.url = URL.createObjectURL(S.blob);
    S.busy = false; btn.disabled = false; btn.textContent = '다시 만들기';
    prog.textContent = '완성! ' + T.toFixed(0) + '초 영상 (' + (S.blob.size / 1048576).toFixed(1) + 'MB)';
    var d = $('#rlDone');
    d.innerHTML = '<video src="' + S.url + '" controls playsinline muted style="width:100%;max-width:240px;border-radius:14px;background:#000"></video>' +
      '<button type="button" class="sub primary" data-rla="ig" style="background:linear-gradient(90deg,#F58529,#DD2A7B,#8134AF);border:0">인스타 릴스에 올리기</button>' +
      '<button type="button" class="sub" data-rla="save">영상 저장</button>' +
      (S.ext === 'webm' ? '<p class="note" style="margin:0">이 브라우저는 webm 파일로 만들어요. 인스타에 안 올라가면 크롬 최신판이나 사파리에서 다시 만들어 주세요.</p>' : '');
    d.classList.remove('hidden');
    try { window.dispatchEvent(new CustomEvent('alajoom:reels', { detail: { sec: T, n: S.pics.length } })); } catch (e) {}
  }
  function fname() { var s = studio().name || '알아줌'; return s.replace(/[\\/:*?"<>|]/g, '') + '_릴스.' + S.ext; }
  function save() {
    if (!S.blob) return;
    var a = document.createElement('a'); a.href = S.url; a.download = fname(); document.body.appendChild(a); a.click(); a.remove();
    toast('영상을 저장했어요');
  }
  async function toInsta() {
    if (!S.blob) return;
    var cap = [S.line].concat(S.caps.slice(1)).filter(Boolean).join('\n');
    try { if (cap) navigator.clipboard.writeText(cap).catch(function () {}); } catch (e) {}
    var pc = !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) && !(navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
    if (pc) {
      var w = null; try { w = window.open('https://www.instagram.com/', '_blank'); } catch (e) {}
      save();
      guide('PC에서 릴스 올리기', ['영상을 <b>다운로드 폴더</b>에 저장했어요', cap ? '자막 문구는 <b>복사</b>해 뒀어요' : '문구는 직접 적어 주세요', (w ? '새로 열린 인스타그램 탭에서' : '인스타그램을 열고') + ' 왼쪽 <b>＋ 만들기 → 게시물</b> → 저장한 영상을 끌어다 놓기 (영상은 릴스로 올라가요)', '음악은 휴대폰 인스타 앱에서 넣을 수 있어요']);
      return;
    }
    var file = new File([S.blob], fname(), { type: S.blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); guide('인스타그램에서 마무리', ['공유 창에서 <b>Instagram → 릴스</b>를 고르세요', '<b>오디오 추가</b>로 음악을 넣으면 더 좋아요', cap ? '문구 칸에 <b>붙여넣기</b> (복사돼 있어요)' : '문구를 적고', '<b>공유</b>를 누르면 끝!']); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    save();
    guide('인스타그램에 릴스 올리기', ['영상을 <b>저장</b>했어요', '인스타 앱에서 <b>＋ → 릴스</b> → 방금 저장한 영상 고르기', '<b>오디오</b>에서 음악 넣기', cap ? '문구 칸에 <b>붙여넣기</b> → 공유' : '문구를 적고 공유']);
  }
  function guide(title, steps) {
    var w = document.createElement('div'); w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.style.cssText = 'position:fixed;inset:0;z-index:100006';
    w.innerHTML = '<div data-gx style="position:absolute;inset:0;background:rgba(20,22,31,.5)"></div><div style="position:absolute;left:0;right:0;bottom:0;max-width:460px;margin:0 auto;background:#fff;border-radius:22px 22px 0 0;padding:22px 18px 16px">' +
      '<h2 style="margin:0 0 12px;font-size:18px;font-weight:900">' + title + '</h2><ol style="margin:0 0 14px;padding-left:20px;font-size:14.5px;line-height:1.7">' + steps.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' +
      '<button type="button" data-gx class="sub" style="width:100%;min-height:46px">닫기</button></div>';
    document.body.appendChild(w);
    w.addEventListener('click', function (e) { if (e.target.closest('[data-gx]')) w.remove(); });
  }

  var css = document.createElement('style');
  css.textContent = '.rl-pics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.rl-pics:empty{display:none}' +
    '.rl-pic{position:relative;border-radius:12px;overflow:hidden;background:#eee;aspect-ratio:3/4}.rl-pic img{width:100%;height:100%;object-fit:cover;display:block}' +
    '.rl-pic>span{position:absolute;left:6px;top:6px;min-width:24px;height:24px;border-radius:12px;background:#14161F;color:#FFD43B;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center}' +
    '.rl-pic>div{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;padding:4px;background:linear-gradient(transparent,rgba(0,0,0,.45))}' +
    '.rl-pic button{width:34px;height:34px;border:0;border-radius:17px;background:rgba(255,255,255,.92);font-size:18px;font-weight:900;color:#14161F;cursor:pointer}' +
    '.rl-cap{display:grid;grid-template-columns:40px 1fr;align-items:center;gap:8px;font-size:13px;font-weight:800}.rl-cap input{min-width:0}' +
    '.rl-stage{display:flex;flex-direction:column;align-items:center;gap:12px}.rl-stage canvas{width:100%;max-width:270px;aspect-ratio:9/16;border-radius:18px;background:#111;box-shadow:0 12px 30px -16px rgba(0,0,0,.6)}' +
    '.rl-side{width:100%;display:flex;flex-direction:column;gap:8px}' +
    '@media (min-width:900px){.rl-stage{flex-direction:row;align-items:flex-start;gap:22px}.rl-stage canvas{max-width:300px;flex:none}.rl-side{flex:1}.rl-pics{grid-template-columns:repeat(6,minmax(0,1fr))}}';
  document.head.appendChild(css);

  window.alajoomReels = { render: render };
})();
