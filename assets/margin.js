/* 알아줌 · 원가·마진 계산기
   메뉴(시술)마다 재료비 + 시간만큼의 고정비 + 카드 수수료를 빼서 진짜 남는 돈과 마진율을 보여줘요.
   입력값은 이 기기에만 저장돼요(서버로 보내지 않음). 참고용 계산이에요. */
(function () {
  if (window.alajoomMargin) return;
  var MATE = location.pathname.split('/')[1] || 'skin';
  var KEY = 'al_margin_' + MATE;
  var UNIT = { skin: '관리', nail: '시술', hair: '시술', pilates: '수업', academy: '수업', food: '메뉴', cafe: '메뉴', bakery: '메뉴' }[MATE] || '메뉴';
  var PRESET = {
    skin: [['기본 관리', 60000, 60, 6000], ['수분 관리', 80000, 70, 9000], ['진정 관리', 80000, 70, 9000], ['등 관리', 70000, 50, 5000]],
    nail: [['젤 원컬러', 40000, 60, 3000], ['젤 아트', 60000, 90, 5000], ['연장', 80000, 120, 8000], ['젤 제거', 10000, 20, 1000]],
    hair: [['커트', 20000, 30, 500], ['펌', 80000, 120, 12000], ['염색', 70000, 90, 10000], ['클리닉', 40000, 40, 6000]],
    pilates: [['개인 레슨 1회', 70000, 50, 0], ['그룹 레슨 1인', 25000, 50, 0]],
    academy: [['월 수강료(주3회)', 300000, 720, 10000]],
    food: [['대표 메뉴', 11000, 8, 3800], ['세트 메뉴', 15000, 10, 5200], ['사이드', 5000, 4, 1500]],
    cafe: [['아메리카노', 4500, 2, 700], ['라떼', 5000, 3, 1100], ['디저트', 6500, 1, 2200]],
    bakery: [['식빵', 6000, 3, 1600], ['크루아상', 4000, 3, 1300], ['케이크 조각', 6500, 4, 2300]]
  }[MATE] || [['대표 메뉴', 20000, 30, 4000]];
  var FIX = [['임대료', 1200000], ['관리비·공과금', 300000], ['직원 인건비', 0], ['통신·프로그램', 80000], ['광고·홍보', 100000], ['소모품·기타', 150000]];
  var S = load();
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.items) return s; } catch (e) {}
    return { items: PRESET.map(function (p) { return { n: p[0], p: p[1], m: p[2], c: p[3] }; }), fix: FIX.map(function (f) { return { n: f[0], v: f[1] }; }), days: 25, hours: 8, fee: 1.5, vat: false, me: 2500000 };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var won = function (n) { return (Math.round(n) || 0).toLocaleString('ko-KR') + '원'; };
  var num = function (v) { v = String(v).replace(/[^0-9.\-]/g, ''); return v === '' ? 0 : Number(v); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function calc() {
    var fixSum = S.fix.reduce(function (a, f) { return a + num(f.v); }, 0) + num(S.me);
    var mins = Math.max(1, num(S.days) * num(S.hours) * 60);
    var perMin = fixSum / mins;
    var rows = S.items.map(function (it) {
      var price = num(it.p), net = S.vat ? price / 1.1 : price;
      var fee = price * num(S.fee) / 100, fixc = perMin * num(it.m), cost = num(it.c) + fixc + fee;
      var profit = net - cost, rate = net > 0 ? profit / net * 100 : 0;
      var k = 1 - num(S.fee) / 100 * (S.vat ? 1.1 : 1) - 0.4; // 마진 40%가 되는 가격
      var good = k > 0 ? (num(it.c) + fixc) / k * (S.vat ? 1.1 : 1) : 0;
      return { it: it, fixc: fixc, fee: fee, cost: cost, profit: profit, rate: rate, good: Math.ceil(good / 1000) * 1000 };
    });
    var avg = rows.length ? rows.reduce(function (a, r) { return a + (num(r.it.c) + r.fee); }, 0) / rows.length : 0;
    var avgP = rows.length ? rows.reduce(function (a, r) { return a + (S.vat ? num(r.it.p) / 1.1 : num(r.it.p)); }, 0) / rows.length : 0;
    var unit = avgP - avg; // 고정비 빼기 전, 한 건당 남는 돈(평균)
    return { fixSum: fixSum, perMin: perMin, perHour: perMin * 60, rows: rows, be: unit > 0 ? Math.ceil(fixSum / unit) : 0 };
  }

  function html() {
    var R = calc();
    var h = '<div class="mg-head"><button type="button" class="mg-x" data-mg="x" aria-label="닫기">×</button><b>원가·마진 계산기</b><small>' + UNIT + '마다 진짜 남는 돈</small></div><div class="mg-body">';
    h += '<section class="mg-card mg-sum"><div><span>한 달 고정비</span><b>' + won(R.fixSum) + '</b></div><div><span>1시간 버티는 돈</span><b>' + won(R.perHour) + '</b></div><div><span>본전 건수</span><b>' + (R.be ? R.be + '건/월' : '-') + '</b></div></section>';
    h += '<p class="mg-tip">본전 건수 = 한 달 고정비를 채우려면 ' + UNIT + '을 평균 몇 건 해야 하는지예요.</p>';
    h += '<section class="mg-card"><h3>1. 대표 ' + UNIT + '</h3><div class="mg-list">' + R.rows.map(function (r, i) {
      var cls = r.rate >= 40 ? 'ok' : r.rate >= 20 ? 'mid' : 'low';
      return '<div class="mg-item"><div class="mg-in"><input aria-label="이름" data-i="' + i + '" data-k="n" value="' + esc(r.it.n) + '" class="mg-n"><button type="button" class="mg-del" data-del="' + i + '" aria-label="빼기">×</button></div>' +
        '<div class="mg-grid"><label>가격<input inputmode="numeric" data-i="' + i + '" data-k="p" value="' + num(r.it.p) + '"></label><label>걸리는 시간(분)<input inputmode="numeric" data-i="' + i + '" data-k="m" value="' + num(r.it.m) + '"></label><label>재료비<input inputmode="numeric" data-i="' + i + '" data-k="c" value="' + num(r.it.c) + '"></label></div>' +
        '<div class="mg-res ' + cls + '"><span>원가 ' + won(r.cost) + ' <small>(재료 ' + won(r.it.c) + ' + 고정비 ' + won(r.fixc) + ' + 수수료 ' + won(r.fee) + ')</small></span><b>남는 돈 ' + won(r.profit) + ' · ' + Math.round(r.rate) + '%</b>' +
        (r.rate < 40 && r.good > num(r.it.p) ? '<em>마진 40%가 되려면 ' + won(r.good) + '</em>' : '') + '</div></div>';
    }).join('') + '</div><button type="button" class="mg-add" data-mg="add">+ ' + UNIT + ' 추가</button></section>';
    h += '<section class="mg-card"><h3>2. 한 달 고정비</h3><div class="mg-fix">' + S.fix.map(function (f, i) { return '<label>' + esc(f.n) + '<input inputmode="numeric" data-f="' + i + '" value="' + num(f.v) + '"></label>'; }).join('') +
      '<label>원장님 몫(내 월급)<input inputmode="numeric" data-s="me" value="' + num(S.me) + '"></label></div><p class="mg-tip">원장님 월급도 고정비에 넣어야 진짜 남는 돈이 보여요.</p></section>';
    h += '<section class="mg-card"><h3>3. 영업 시간·수수료</h3><div class="mg-grid"><label>한 달 영업일<input inputmode="numeric" data-s="days" value="' + num(S.days) + '"></label><label>하루 일하는 시간<input inputmode="numeric" data-s="hours" value="' + num(S.hours) + '"></label><label>카드 수수료(%)<input inputmode="decimal" data-s="fee" value="' + num(S.fee) + '"></label></div>' +
      '<label class="mg-ck"><input type="checkbox" data-s="vat"' + (S.vat ? ' checked' : '') + '> 가격에서 부가세 10% 떼고 계산 (일반과세자)</label></section>';
    h += '<p class="mg-note">입력한 값은 이 기기에만 저장돼요. 계산은 참고용이에요. 세금·수수료는 사장님 상황에 따라 다르니 정확한 건 세무사와 확인해 주세요.</p>';
    h += '<div class="mg-actions"><button type="button" data-mg="copy">결과 복사</button><button type="button" data-mg="reset">처음 값으로</button></div></div>';
    return h;
  }
  var box = null;
  function draw(keepFocus) {
    if (!box) return;
    var a = document.activeElement, sel = a && a.dataset ? ['i', 'k', 'f', 's'].map(function (x) { return a.dataset[x]; }).join('|') : null, pos = a && a.selectionStart;
    var sc = box.querySelector('.mg-body') ? box.querySelector('.mg-body').scrollTop : 0;
    box.querySelector('.mg-pan').innerHTML = html();
    box.querySelector('.mg-body').scrollTop = sc;
    if (keepFocus && sel) {
      var el = Array.prototype.filter.call(box.querySelectorAll('input'), function (x) { return ['i', 'k', 'f', 's'].map(function (k) { return x.dataset[k]; }).join('|') === sel; })[0];
      if (el) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch (e) {} }
    }
  }
  var tmr = 0;
  function open() {
    if (box) return;
    box = document.createElement('div'); box.className = 'mg-wrap'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', '원가·마진 계산기');
    box.innerHTML = '<div class="mg-bg" data-mg="x"></div><div class="mg-pan"></div>';
    document.body.appendChild(box); draw();
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-mg],[data-del]'); if (!t) return;
      if (t.dataset.del != null) { S.items.splice(+t.dataset.del, 1); save(); return draw(); }
      var a = t.dataset.mg;
      if (a === 'x') { box.remove(); box = null; return; }
      if (a === 'add') { S.items.push({ n: '새 ' + UNIT, p: 0, m: 30, c: 0 }); save(); draw(); var l = box.querySelectorAll('.mg-n'); if (l.length) l[l.length - 1].select(); return; }
      if (a === 'reset') { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '정말 처음으로?'; return; } try { localStorage.removeItem(KEY); } catch (e2) {} S = load(); return draw(); }
      if (a === 'copy') {
        var R = calc(), txt = '[원가·마진 계산]\n한 달 고정비 ' + won(R.fixSum) + ' · 본전 ' + (R.be || '-') + '건/월\n' + R.rows.map(function (r) { return '- ' + r.it.n + ': 가격 ' + won(r.it.p) + ' / 원가 ' + won(r.cost) + ' / 남는 돈 ' + won(r.profit) + ' (' + Math.round(r.rate) + '%)'; }).join('\n');
        try { navigator.clipboard.writeText(txt); t.textContent = '복사했어요'; } catch (e3) {}
      }
    });
    box.addEventListener('input', function (e) {
      var x = e.target, d = x.dataset;
      if (d.i != null) S.items[+d.i][d.k] = d.k === 'n' ? x.value : num(x.value);
      else if (d.f != null) S.fix[+d.f].v = num(x.value);
      else if (d.s) S[d.s] = d.s === 'vat' ? x.checked : num(x.value);
      save(); clearTimeout(tmr); tmr = setTimeout(function () { draw(true); }, d.s === 'vat' ? 0 : 450);
    });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { box.remove(); box = null; } });
  }

  /* 장부·오늘 화면에 들어가는 버튼 */
  function entry() {
    return '<button type="button" class="mg-entry" data-mgopen="1"><span class="mg-ic" aria-hidden="true">₩</span><span><b>원가·마진 계산기</b><small>' + UNIT + '마다 진짜 남는 돈, 본전 건수까지</small></span><i aria-hidden="true">›</i></button>';
  }
  function place() {
    ['v-members', 'v-home'].forEach(function (id) {
      var v = document.getElementById(id); if (!v || v.querySelector('.mg-entry')) return;
      if (id === 'v-home') { var a = v.querySelector('#famCard') || v.querySelector('.hd-sum'); if (!a) return; a.insertAdjacentHTML('afterend', entry()); }
      else { if (!v.firstElementChild) return; var h1 = v.querySelector('h1'); if (h1) h1.insertAdjacentHTML('afterend', entry()); else v.insertAdjacentHTML('afterbegin', entry()); }
    });
  }
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-mgopen]')) open(); });
  var mo = new MutationObserver(function () { clearTimeout(mo.t); mo.t = setTimeout(place, 120); });
  function start() { place(); ['v-members', 'v-home'].forEach(function (id) { var v = document.getElementById(id); if (v) mo.observe(v, { childList: true }); }); if (/[?&]margin=1/.test(location.search)) open(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  var css = document.createElement('style');
  css.textContent = '.mg-entry{display:flex;align-items:center;gap:12px;width:100%;margin:12px 0;padding:12px 14px;border:1.5px solid #E9DDBF;border-radius:18px;background:linear-gradient(135deg,#FFFBEF,#FFF3CC);font:inherit;text-align:left;cursor:pointer;color:#14161F}' +
    '.mg-entry .mg-ic{flex:none;width:42px;height:42px;border-radius:12px;background:#14161F;color:#FFD43B;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center}' +
    '.mg-entry b{display:block;font-size:15.5px}.mg-entry small{display:block;font-size:12.5px;color:#6B5A1A}.mg-entry span:nth-child(2){flex:1;min-width:0}.mg-entry i{font-style:normal;font-size:22px;color:#9A8B6A}' +
    '.mg-wrap{position:fixed;inset:0;z-index:100007}.mg-bg{position:absolute;inset:0;background:rgba(10,12,18,.55)}' +
    '.mg-pan{position:absolute;left:0;right:0;bottom:0;top:4vh;max-width:620px;margin:0 auto;background:#FAF7F0;border-radius:22px 22px 0 0;display:flex;flex-direction:column;overflow:hidden;font-family:inherit;color:#14161F}' +
    '@media (min-width:721px){.mg-pan{top:4vh;bottom:4vh;border-radius:22px}}' +
    '.mg-head{position:relative;padding:16px 18px 12px;background:#14161F;color:#fff}.mg-head b{display:block;font-size:18px;font-weight:900}.mg-head small{font-size:12.5px;color:#FFD43B}' +
    '.mg-x{position:absolute;right:12px;top:12px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:22px;cursor:pointer}' +
    '.mg-body{flex:1;overflow:auto;padding:14px 14px 30px;display:flex;flex-direction:column;gap:12px;-webkit-overflow-scrolling:touch}' +
    '.mg-card{background:#fff;border:1px solid #EDE5D3;border-radius:18px;padding:14px}.mg-card h3{margin:0 0 10px;font-size:15px;font-weight:900}' +
    '.mg-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:#FFF6D6;border-color:#F2DE9C}.mg-sum div{display:flex;flex-direction:column;gap:2px}.mg-sum span{font-size:11.5px;color:#6B5A1A;font-weight:700}.mg-sum b{font-size:16px;font-weight:900}' +
    '.mg-tip,.mg-note{margin:-4px 2px 0;font-size:12px;color:#7A6F58;line-height:1.5}.mg-note{margin:0}' +
    '.mg-list{display:flex;flex-direction:column;gap:10px}.mg-item{border:1px solid #F0E8D6;border-radius:14px;padding:10px}' +
    '.mg-in{display:flex;gap:6px;margin-bottom:8px}.mg-n{flex:1;min-width:0;font-weight:800 !important}.mg-del{flex:none;width:38px;border:1px solid #EDE5D3;border-radius:10px;background:#fff;font-size:18px;cursor:pointer;color:#9A8B6A}' +
    '.mg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.mg-fix{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}' +
    '.mg-pan label{display:flex;flex-direction:column;gap:3px;font-size:11.5px;font-weight:700;color:#6A6F7C}' +
    '.mg-pan input:not([type=checkbox]){width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:8px 10px;border:1px solid #E1E4EA;border-radius:10px;background:#fff;color:#14161F}' +
    '.mg-res{margin-top:8px;padding:8px 10px;border-radius:10px;display:flex;flex-direction:column;gap:2px;font-size:12.5px}.mg-res small{color:#7A7F8C}.mg-res b{font-size:15px}.mg-res em{font-style:normal;font-size:12px;font-weight:800}' +
    '.mg-res.ok{background:#E5F6EA}.mg-res.ok b{color:#16794A}.mg-res.mid{background:#FFF4D6}.mg-res.mid b{color:#9A6A00}.mg-res.low{background:#FFE7E2}.mg-res.low b{color:#C2410C}.mg-res em{color:#6B5A1A}' +
    '.mg-add{margin-top:10px;width:100%;min-height:44px;border:1.5px dashed #D9CCAA;border-radius:12px;background:#FFFCF4;font:inherit;font-weight:800;cursor:pointer;color:#6B5A1A}' +
    '.mg-ck{flex-direction:row !important;align-items:center;gap:8px !important;margin-top:10px;font-size:13px !important;color:#3A3F4C !important}.mg-ck input{width:18px;height:18px}' +
    '.mg-actions{display:flex;gap:8px}.mg-actions button{flex:1;min-height:46px;border:1px solid #E1E4EA;border-radius:14px;background:#fff;font:inherit;font-weight:800;cursor:pointer}.mg-actions button:first-child{background:#14161F;color:#FFD43B;border-color:#14161F}';
  document.head.appendChild(css);
  window.alajoomMargin = { open: open };
})();
