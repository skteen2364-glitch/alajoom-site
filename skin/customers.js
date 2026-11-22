/* 뷰티 메이트(스킨·네일·헤어) · 고객 장부
   고객·관리권(회차)·방문·시술 기록·예약·시술 메뉴·매출. 로그인하면 계정에 저장(뷰티 메이트끼리 같이 씀). */
(function () {
  var KEY = 'al_beauty_customers_v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var ymd = function (d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var addDays = function (s, n) { var d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return ymd(d); };
  var addMonths = function (s, n) { var d = new Date(s + 'T00:00:00'); d.setMonth(d.getMonth() + n); d.setDate(d.getDate() - 1); return ymd(d); };
  var days = function (a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5); };
  var won = function (n) { n = Math.round(+n || 0); return n.toLocaleString('ko-KR') + '원'; };
  var md = function (s) { return s ? (+s.slice(5, 7)) + '/' + (+s.slice(8, 10)) : '-'; };
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var MATE = (location.pathname.match(/^\/(skin|nail|hair)\b/) || [])[1] || 'skin';
  var P = {
    skin: { t: '알아줌 피부관리샵', menuPh: '예: 수분 관리, 브라질리언 왁싱', memoPh: '예: 건성, 주말 오전 선호, 향 약한 제품', notePh: '예: 수분 관리 · 진정 앰플 사용 · 볼 건조함', care: '그날 받은 시술·사용 제품·피부 상태를', priv: '피부 고민·알레르기 같은 민감한 정보는', more: '왁싱·속눈썹·네일도 좋아요' },
    nail: { t: '알아줌 네일샵', menuPh: '예: 원컬러 젤, 젤 제거, 패디큐어', memoPh: '예: 짧은 기장 선호, 누드톤, 큐티클 예민', notePh: '예: 원컬러 젤 · 누드 베이지 · 오른손 약지 파츠', care: '그날 한 디자인·컬러·사용 제품을', priv: '손톱·피부 상태나 알레르기 같은 민감한 정보는', more: '젤 제거·연장·패디도 좋아요' },
    hair: { t: '알아줌 헤어샵', menuPh: '예: 남성 커트, 뿌리 염색, 클리닉', memoPh: '예: 앞머리 짧게 싫어함, 두피 예민, 애쉬톤 선호', notePh: '예: 뿌리 염색 · 6N 애쉬 · 30분 방치', care: '그날 한 시술·약제·컬러 번호를', priv: '두피 상태나 알레르기 같은 민감한 정보는', more: '커트·펌·염색·클리닉 모두 넣으세요' }
  }[MATE];
  var DEF = {
    nail: [{ id: 'm1', name: '원컬러 젤', price: 45000, mins: 60 }, { id: 'm2', name: '아트 젤', price: 65000, mins: 90 }, { id: 'm3', name: '젤 제거', price: 10000, mins: 20 }, { id: 'm4', name: '케어', price: 20000, mins: 30 }, { id: 'm5', name: '패디큐어', price: 55000, mins: 70 }],
    hair: [{ id: 'm1', name: '커트', price: 20000, mins: 40 }, { id: 'm2', name: '뿌리 염색', price: 60000, mins: 90 }, { id: 'm3', name: '전체 염색', price: 90000, mins: 120 }, { id: 'm4', name: '펌', price: 100000, mins: 150 }, { id: 'm5', name: '클리닉', price: 50000, mins: 50 }]
  };
  var DEF_MENU = DEF[MATE] || [{ id: 'm1', name: '기본 얼굴 관리', price: 70000, mins: 60 }, { id: 'm2', name: '수분 관리', price: 90000, mins: 70 }, { id: 'm3', name: '진정 관리', price: 90000, mins: 70 }, { id: 'm4', name: '등 관리', price: 80000, mins: 60 }, { id: 'm5', name: '왁싱', price: 30000, mins: 30 }];
  var PASSES = [];
  var PAYS = ['카드', '계좌이체', '현금'];

  var DB = load();
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { members: [] }; } catch (e) { return { members: [] }; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast('저장 공간이 부족해요'); } if (window.alajoomSaved) window.alajoomSaved('customers', DB); }
  /* 고객 장부·매출 장부를 로그인한 계정에 저장(폰·PC 같이) */
  setTimeout(function () {
    if (!window.alajoomSync) return;
    window.alajoomSync({ keys: ['customers'],
      get: function () { return DB; },
      has: function () { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } },
      set: function (k, d) { if (d && Array.isArray(d.members)) { DB = d; fixDB(); try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} } },
      done: function () { render(); var hv = $('#v-home'); if (hv && !hv.classList.contains('hidden')) window.dispatchEvent(new CustomEvent('alajoom:tab', { detail: 'home' })); toast('계정에 저장된 고객 장부를 불러왔어요'); } });
  }, 900);
  function toast(t) { var el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 1800); }

  function left(m) { return Math.max(0, (m.total || 0) - (m.att || []).length); }
  function lastAtt(m) { var a = (m.att || []).slice().sort(); return a.length ? a[a.length - 1] : null; }
  function status(m) {
    var t = ymd();
    if (m.end && m.end < t) return { k: 'end', label: '기간 끝남', c: '#8A8F9C' };
    if (left(m) === 0) return { k: 'end', label: '횟수 다 씀', c: '#8A8F9C' };
    if (left(m) <= 2 || (m.end && days(t, m.end) <= 7)) return { k: 'renew', label: '재등록 안내', c: '#C2410C' };
    var la = lastAtt(m) || m.start;
    if (la && days(la, t) >= 35) return { k: 'away', label: '오래 안 옴', c: '#8F2C4E' };
    return { k: 'ok', label: '관리 중', c: '#15803D' };
  }

  var view = { filter: 'all', q: '', sub: 'list', mon: ymd().slice(0, 7) };
  function fixDB() { DB.book = DB.book || []; DB.rsv = DB.rsv || []; DB.menu = DB.menu && DB.menu.length ? DB.menu : DEF_MENU.slice(); PASSES = DB.menu.map(function (x) { return x.name; }).concat(['1회 관리']); }
  fixDB();

  /* ---------- 매출 장부: 고객 결제는 자동, 그 밖의 매출·지출은 직접 ---------- */
  function bookRows(mon) {
    var rows = [];
    DB.members.forEach(function (m) { (m.pays || []).forEach(function (p, i) { if ((p.date || '').slice(0, 7) === mon) rows.push({ auto: true, mid: m.id, date: p.date, type: '매출', what: m.name + ' · ' + (p.pass || '관리권') + ' ' + (p.count || '') + '회' + (i ? ' (재등록)' : ' (신규)'), amount: +p.price || 0, pay: p.pay || '' }); }); });
    DB.book.forEach(function (b) { if ((b.date || '').slice(0, 7) === mon) rows.push(b); });
    return rows.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }
  function shiftMon(mon, n) { var d = new Date(mon + '-01T00:00:00'); d.setMonth(d.getMonth() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
  function renderBook(box) {
    var rows = bookRows(view.mon), inc = 0, out = 0, byPay = {};
    rows.forEach(function (r) { if (r.type === '지출') out += r.amount; else { inc += r.amount; byPay[r.pay || '기타'] = (byPay[r.pay || '기타'] || 0) + r.amount; } });
    var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 10px"><button type="button" class="sub" data-m="mon" data-v="-1" style="flex:none;min-width:44px;padding:0" aria-label="지난달">‹</button><b style="font-size:17px">' + (+view.mon.slice(0, 4)) + '년 ' + (+view.mon.slice(5)) + '월</b><button type="button" class="sub" data-m="mon" data-v="1" style="flex:none;min-width:44px;padding:0" aria-label="다음달">›</button></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 8px;text-align:center">' +
      '<div style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px 4px"><span style="font-size:12px;color:var(--muted)">매출</span><b style="display:block;font-size:15px;color:#15803D">' + won(inc) + '</b></div>' +
      '<div style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px 4px"><span style="font-size:12px;color:var(--muted)">지출</span><b style="display:block;font-size:15px;color:#C2410C">' + won(out) + '</b></div>' +
      '<div style="background:var(--ink);color:#fff;border-radius:14px;padding:10px 4px"><span style="font-size:12px;opacity:.75">남은 돈</span><b style="display:block;font-size:15px;color:var(--yellow)">' + won(inc - out) + '</b></div></div>';
    var pk = Object.keys(byPay); if (pk.length) h += '<p style="margin:0 0 12px;font-size:12.5px;color:var(--muted)">' + pk.map(function (k) { return esc(k) + ' ' + won(byPay[k]); }).join(' · ') + '</p>';
    h += '<button type="button" class="go" data-m="bnew" style="justify-content:center;margin:0 0 12px;width:100%">+ 매출·지출 적기</button>';
    if (!rows.length) h += '<p style="text-align:center;color:var(--muted);padding:16px 0;font-size:14px">이 달 기록이 없어요.<br>고객을 등록하거나 재등록하면 결제가 자동으로 적혀요.</p>';
    else h += '<div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:4px 12px">' + rows.map(function (r) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)">' +
        '<span style="flex:none;width:38px;font-size:12.5px;color:var(--muted)">' + md(r.date) + '</span>' +
        '<span style="flex:1;min-width:0;font-size:14px">' + esc(r.what) + '<small style="display:block;color:var(--muted);font-size:12px">' + (r.auto ? '고객 결제 · 자동' : r.type) + (r.pay ? ' · ' + esc(r.pay) : '') + '</small></span>' +
        '<b style="flex:none;font-size:14px;color:' + (r.type === '지출' ? '#C2410C' : 'var(--ink)') + '">' + (r.type === '지출' ? '-' : '') + won(r.amount) + '</b>' +
        (r.auto ? '<button type="button" data-m="open" data-id="' + r.mid + '" aria-label="고객 보기" style="flex:none;border:0;background:none;font-size:18px;color:#9AA0AD;min-width:32px;min-height:40px;cursor:pointer">›</button>' : '<button type="button" data-m="bdel" data-id="' + r.id + '" aria-label="삭제" style="flex:none;border:0;background:none;font-size:18px;color:#9AA0AD;min-width:32px;min-height:40px;cursor:pointer">×</button>') +
        '</div>';
    }).join('') + '</div>';
    box.insertAdjacentHTML('beforeend', h);
  }
  function bookForm() {
    openDlg('<h2>매출·지출 적기</h2>' + chips('btype', ['매출', '지출'], '지출') + '<input type="hidden" id="mBtype" value="지출">' +
      '<label>날짜<input type="date" id="bDate" value="' + ymd() + '" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit"></label>' +
      '<label>내용<input type="text" id="bWhat" maxlength="40" placeholder="예: 월세, 소도구 구입, 일일 체험"></label>' +
      '<label>금액<input type="text" id="bAmt" inputmode="numeric" placeholder="예: 1200000"></label>' +
      '<label>결제 방법</label>' + chips('pay', PAYS, PAYS[1]) + '<input type="hidden" id="mPay" value="' + PAYS[1] + '">' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="bsave">적기</button></div>');
  }

  /* ---------- 목록 ---------- */
  function render() {
    var box = $('#v-members'); if (!box) return;
    var t = ymd(), mon = t.slice(0, 7), ms = DB.members;
    var active = ms.filter(function (m) { return status(m).k !== 'end'; });
    var renew = ms.filter(function (m) { return status(m).k === 'renew'; });
    var away = ms.filter(function (m) { return status(m).k === 'away'; });
    var todayAtt = ms.filter(function (m) { return (m.att || []).indexOf(t) >= 0; });
    var sales = 0; ms.forEach(function (m) { (m.pays || []).forEach(function (p) { if (p.date && p.date.slice(0, 7) === mon) sales += +p.price || 0; }); });
    var news = ms.filter(function (m) { return (m.created || '').slice(0, 7) === mon; }).length;

    var list = ms.filter(function (m) {
      var s = status(m).k;
      if (view.filter === 'renew' && s !== 'renew') return false;
      if (view.filter === 'away' && s !== 'away') return false;
      if (view.filter === 'end' && s !== 'end') return false;
      if (view.filter === 'all' && s === 'end') return false;
      if (view.q && (m.name + ' ' + (m.phone || '')).indexOf(view.q) < 0) return false;
      return true;
    }).sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); });

    var subb = function (v, l) { return '<button type="button" data-m="sub" data-v="' + v + '" aria-pressed="' + (view.sub === v) + '" style="flex:1;min-height:40px;border:0;border-bottom:3px solid ' + (view.sub === v ? 'var(--ink)' : 'transparent') + ';background:none;font:inherit;font-size:14.5px;font-weight:800;color:' + (view.sub === v ? 'var(--ink)' : 'var(--muted)') + ';cursor:pointer">' + l + '</button>'; };
    var top = '<div style="display:flex;margin:0 0 14px;border-bottom:1px solid var(--line)">' + subb('list', '고객') + subb('cls', '예약') + subb('menu', '시술 메뉴') + subb('book', '매출') + '</div>';
    if (view.sub === 'book') { box.innerHTML = top; renderBook(box); return; }
    if (view.sub === 'cls') { box.innerHTML = top; renderClasses(box); return; }
    if (view.sub === 'menu') { box.innerHTML = top; renderMenu(box); return; }
    var stat = function (n, l, f) { return '<button type="button" class="mb-stat" data-m="filter" data-v="' + f + '" style="flex:1 1 0;min-width:0;border:1px solid var(--line);background:#fff;border-radius:14px;padding:10px 6px;text-align:center;font:inherit;cursor:pointer"><b style="display:block;font-size:20px;font-weight:900">' + n + '</b><span style="font-size:12px;color:var(--muted)">' + l + '</span></button>'; };
    var h = top;
    h += '<div style="display:flex;gap:8px;margin:0 0 10px">' + stat(active.length, '관리 중', 'all') + stat(renew.length, '재등록 안내', 'renew') + stat(away.length, '오래 안 옴', 'away') + '</div>';
    h += '<p style="margin:0 0 14px;font-size:13px;color:var(--muted)">오늘 방문 <b style="color:var(--ink)">' + todayAtt.length + '명</b> · 이번 달 신규 <b style="color:var(--ink)">' + news + '명</b> · 이번 달 결제 <b style="color:var(--ink)">' + won(sales) + '</b></p>';
    h += '<div style="display:flex;gap:8px;margin:0 0 10px"><input type="text" id="mbQ" placeholder="이름·전화번호 찾기" value="' + esc(view.q) + '" style="flex:1"><button type="button" class="sub primary" data-m="new" style="flex:none;min-width:0;padding:0 16px">+ 고객</button></div>';
    var chip = function (v, l) { return '<button type="button" class="chip" data-m="filter" data-v="' + v + '" aria-pressed="' + (view.filter === v) + '">' + l + '</button>'; };
    h += '<div class="chips" role="group" aria-label="고객 보기" style="margin:0 0 12px">' + chip('all', '관리 중') + chip('renew', '재등록 안내') + chip('away', '오래 안 옴') + chip('end', '관리권 끝남') + '</div>';

    if (!ms.length) {
      h += '<div class="panel" style="text-align:center;padding:28px 16px"><b style="font-size:16px">아직 등록한 고객이 없어요</b><p style="margin:6px 0 14px;font-size:14px;color:var(--muted)">고객과 관리권을 등록하면 남은 횟수·재방문 시기를 알아서 챙겨 드려요.</p><button type="button" class="go" data-m="new" style="justify-content:center">첫 고객 등록하기</button></div>';
    } else if (!list.length) {
      h += '<p style="text-align:center;color:var(--muted);padding:20px 0">해당하는 고객이 없어요</p>';
    } else {
      h += '<div style="display:flex;flex-direction:column;gap:10px">' + list.map(card).join('') + '</div>';
    }
    h += '<details style="margin-top:18px;background:#fff"><summary style="font-size:13.5px;font-weight:700;cursor:pointer">엑셀로 받기</summary>' +
      '<p style="font-size:12.5px;color:var(--muted);margin:8px 0">로그인하면 고객 장부가 <b>계정에 저장</b>돼서 폰·PC 어디서나 같이 봐요. 로그인 전에는 이 기기에만 저장돼요. 엑셀로도 받아 둘 수 있어요.</p>' +
      '<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="sub" data-m="export">엑셀로 받기</button></div></details>';
    box.innerHTML = h;
  }
  function card(m) {
    var s = status(m), l = left(m), t = ymd(), done = (m.att || []).indexOf(t) >= 0;
    var pct = m.total ? Math.round(l / m.total * 100) : 0;
    return '<article style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 14px">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<button type="button" data-m="open" data-id="' + m.id + '" style="flex:1;min-width:0;border:0;background:none;padding:0;text-align:left;font:inherit;cursor:pointer">' +
      '<b style="font-size:16px">' + esc(m.name) + '</b> <span style="font-size:11.5px;font-weight:800;color:' + s.c + ';border:1px solid ' + s.c + ';border-radius:999px;padding:1px 7px;margin-left:4px">' + s.label + '</span>' +
      '<span style="display:block;font-size:13px;color:var(--muted);margin-top:2px">' + esc(m.pass || '관리권') + ' · 남은 <b style="color:var(--ink)">' + l + '</b>/' + (m.total || 0) + '회 · ~' + md(m.end) + '</span></button>' +
      '<button type="button" data-m="att" data-id="' + m.id + '" aria-pressed="' + done + '" ' + (l === 0 && !done ? 'disabled ' : '') + 'style="flex:none;min-width:64px;min-height:44px;border-radius:12px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;' + (done ? 'background:var(--yellow);border:1px solid var(--yellow);color:var(--ink)' : 'background:var(--ink);border:1px solid var(--ink);color:#fff') + '">' + (done ? '방문 ✓' : '방문') + '</button></div>' +
      '<div aria-hidden="true" style="height:5px;border-radius:9px;background:#F0EBDD;margin-top:10px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + (s.k === 'renew' ? '#F97316' : 'var(--blue)') + '"></div></div>' +
      '</article>';
  }


  function sortedRsv() { return DB.rsv.slice().sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }); }
  function renderClasses(box) {
    var t = ymd(), cs = sortedRsv().filter(function (r) { return r.date >= addDays(t, -1); });
    var h = '<p style="margin:0 0 12px;font-size:13px;color:var(--muted)">예약을 적어 두면 <b>오늘</b> 화면에 오늘 예약이 보이고, 전날 <b>예약 확인 문자</b>를 바로 만들 수 있어요.</p>';
    h += '<button type="button" class="go" data-m="cnew" style="justify-content:center;margin:0 0 12px;width:100%">+ 예약 추가</button>';
    if (!cs.length) h += '<p style="text-align:center;color:var(--muted);padding:12px 0">다가오는 예약이 없어요</p>';
    var dates = []; cs.forEach(function (r) { if (dates.indexOf(r.date) < 0) dates.push(r.date); });
    var DW = ['일', '월', '화', '수', '목', '금', '토'];
    dates.forEach(function (d) {
      var list = cs.filter(function (r) { return r.date === d; });
      var lab = d === t ? '오늘' : d === addDays(t, 1) ? '내일' : d < t ? '어제' : '';
      h += '<p style="margin:12px 0 6px;font-size:13px;font-weight:900">' + md(d) + ' ' + DW[new Date(d + 'T00:00:00').getDay()] + '요일' + (lab ? ' <span style="color:var(--blue)">· ' + lab + '</span>' : '') + '</p><div style="display:flex;flex-direction:column;gap:6px">' + list.map(function (c) {
        return '<div style="display:flex;align-items:center;gap:8px;border:1px solid var(--line);background:#fff;border-radius:14px;padding:6px 8px 6px 14px"><button type="button" data-m="cedit" data-id="' + c.id + '" style="flex:1;min-width:0;display:flex;align-items:center;gap:12px;border:0;background:none;padding:6px 0;font:inherit;text-align:left;cursor:pointer"><b style="flex:none;font-size:15px;min-width:48px">' + esc(c.time) + '</b><span style="flex:1;min-width:0;font-size:14px"><b>' + esc(c.name) + '</b>님' + (c.what ? ' <small style="color:var(--muted)">· ' + esc(c.what) + '</small>' : '') + '</span></button>' +
          (d === addDays(t, 1) ? '<button type="button" class="sub" data-m="rsms" data-id="' + c.id + '" style="flex:none;min-width:0;min-height:40px;padding:0 10px;font-size:12.5px">확인 문자</button>' : '') + '</div>';
      }).join('') + '</div>';
    });
    box.insertAdjacentHTML('beforeend', h);
  }
  function classForm(c) {
    var isNew = !c; c = c || { date: ymd(), time: '11:00', name: '', what: PASSES[0] };
    var names = DB.members.map(function (m) { return m.name; });
    openDlg('<h2>' + (isNew ? '예약 추가' : '예약 고치기') + '</h2>' +
      '<div style="display:flex;gap:8px"><label style="flex:1">날짜<input type="date" id="cDate" value="' + esc(c.date) + '" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit"></label><label style="flex:1">시간<input type="time" id="cTime" value="' + esc(c.time) + '" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit"></label></div>' +
      '<label>고객 이름<input type="text" id="cName" maxlength="30" value="' + esc(c.name) + '" list="cNames" autocomplete="off" placeholder="예: 김지은"></label><datalist id="cNames">' + names.map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist>' +
      '<label>시술</label>' + chips('what', PASSES, c.what) + '<input type="hidden" id="mWhat" value="' + esc(c.what) + '">' +
      '<label>메모 (선택)<input type="text" id="cMemo" maxlength="60" value="' + esc(c.memo) + '" placeholder="예: 첫 방문, 주차 필요"></label>' +
      '<div class="row" style="display:flex;gap:8px">' + (isNew ? '' : '<button type="button" class="sub" data-m="cdel" data-id="' + c.id + '" style="color:#C2410C">삭제</button>') + '<button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="csave" data-id="' + (isNew ? '' : c.id) + '">저장</button></div>');
  }
  /* ---------- 시술 메뉴 ---------- */
  function renderMenu(box) {
    var h = '<p style="margin:0 0 12px;font-size:13px;color:var(--muted)">시술 메뉴를 적어 두면 관리권·예약 고르기, <b>가격표 카드</b>, 홍보글에 자동으로 들어가요. 하는 시술이 여러 가지면 모두 넣으세요(' + P.more + ').</p>';
    h += '<button type="button" class="go" data-m="mnew" style="justify-content:center;margin:0 0 12px;width:100%">+ 시술 추가</button>';
    h += '<div style="display:flex;flex-direction:column;gap:6px">' + DB.menu.map(function (x) {
      return '<button type="button" data-m="medit" data-id="' + x.id + '" style="display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px 14px;font:inherit;text-align:left;cursor:pointer"><span style="flex:1;min-width:0;font-size:15px;font-weight:800">' + esc(x.name) + (x.mins ? ' <small style="font-weight:500;color:var(--muted)">' + x.mins + '분</small>' : '') + '</span><b style="flex:none">' + (x.price ? won(x.price) : '-') + '</b></button>';
    }).join('') + '</div>';
    box.insertAdjacentHTML('beforeend', h);
  }
  function menuForm(x) {
    var isNew = !x; x = x || { name: '', price: '', mins: 60 };
    openDlg('<h2>' + (isNew ? '시술 추가' : '시술 고치기') + '</h2>' +
      '<label>시술 이름<input type="text" id="xName" maxlength="30" value="' + esc(x.name) + '" placeholder="' + P.menuPh + '"></label>' +
      '<div style="display:flex;gap:8px"><label style="flex:1">가격(원)<input type="text" id="xPrice" inputmode="numeric" value="' + (x.price || '') + '"></label><label style="flex:1">시간(분)<input type="text" id="xMins" inputmode="numeric" value="' + (x.mins || '') + '"></label></div>' +
      '<p style="margin:0;font-size:12px;color:var(--muted)">이름에 "치료·재생·주름 개선" 같은 효능 표현은 피해 주세요.</p>' +
      '<div class="row" style="display:flex;gap:8px">' + (isNew ? '' : '<button type="button" class="sub" data-m="mdel" data-id="' + x.id + '" style="color:#C2410C">삭제</button>') + '<button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="msave" data-id="' + (isNew ? '' : x.id) + '">저장</button></div>');
  }
  /* 오늘 화면·카드용 */
  window.alajoomTodayClasses = function () { var t = ymd(); return sortedRsv().filter(function (r) { return r.date === t; }).map(function (r) { return { time: r.time, name: r.name + '님', cap: 0, what: r.what }; }); };
  window.alajoomWeekSchedule = function () { return DB.menu.map(function (x) { return x.name + (x.price ? ' ' + won(x.price) : ''); }).join(' / '); };
  window.alajoomMenuList = function () { return DB.menu.slice(); };
  /* ---------- 고객 상세 / 등록 ---------- */
  var dlg;
  function openDlg(html) {
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'mbDlg'; document.body.appendChild(dlg); dlg.addEventListener('click', onClick); }
    dlg.innerHTML = '<div class="dlg" style="max-height:calc(100vh - 60px);overflow:auto">' + html + '</div>';
    if (!dlg.open) { dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); }
  }
  function closeDlg() { if (dlg) { dlg.close ? dlg.close() : dlg.removeAttribute('open'); } }
  function chips(name, opts, cur) { return '<div class="chips" role="group">' + opts.map(function (o) { return '<button type="button" class="chip" data-m="pick" data-n="' + name + '" data-v="' + esc(o) + '" aria-pressed="' + (o === cur) + '">' + esc(o) + '</button>'; }).join('') + '</div>'; }

  function form(m) {
    var isNew = !m; var t = ymd();
    m = m || { pass: PASSES[0], total: 10, start: t, end: addMonths(t, 3), pay: PAYS[0] };
    openDlg('<h2>' + (isNew ? '새 고객 등록' : '고객 정보 고치기') + '</h2>' +
      '<label>이름<input type="text" id="mName" value="' + esc(m.name) + '" maxlength="30" autocomplete="off"></label>' +
      '<label>연락처<input type="text" id="mPhone" value="' + esc(m.phone) + '" inputmode="tel" maxlength="20" placeholder="010-0000-0000"></label>' +
      '<label>관리권</label>' + chips('pass', PASSES, m.pass) + '<input type="hidden" id="mPass" value="' + esc(m.pass) + '">' +
      (isNew ? '<div style="display:flex;gap:8px"><label style="flex:1">횟수<input type="text" id="mTotal" inputmode="numeric" value="' + (m.total || '') + '"></label><label style="flex:1">결제 금액<input type="text" id="mPrice" inputmode="numeric" placeholder="예: 600000" value=""></label></div>' +
        '<label>결제 방법</label>' + chips('pay', PAYS, m.pay) + '<input type="hidden" id="mPay" value="' + esc(m.pay) + '">' : '') +
      '<div style="display:flex;gap:8px"><label style="flex:1">시작일<input type="date" id="mStart" value="' + esc(m.start) + '" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit"></label><label style="flex:1">만료일<input type="date" id="mEnd" value="' + esc(m.end) + '" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit"></label></div>' +
      '<label>메모<textarea id="mMemo" maxlength="300" placeholder="' + P.memoPh + '">' + esc(m.memo) + '</textarea></label>' +
      '<p style="margin:-4px 0 0;font-size:12px;color:var(--muted)">' + P.priv + ' 고객 동의를 받고 꼭 필요한 만큼만 적어 주세요.</p>' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="save" data-id="' + (isNew ? '' : m.id) + '">저장</button></div>');
  }
  function detail(m) {
    var s = status(m), l = left(m), la = lastAtt(m);
    var atts = (m.att || []).slice().sort().reverse();
    var pays = (m.pays || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var tel = (m.phone || '').replace(/[^0-9+]/g, '');
    openDlg('<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h2>' + esc(m.name) + '</h2><span style="font-size:13px;color:var(--muted)">' + esc(m.phone || '연락처 없음') + '</span></div><span style="font-size:12px;font-weight:800;color:' + s.c + ';border:1px solid ' + s.c + ';border-radius:999px;padding:2px 9px;white-space:nowrap">' + s.label + '</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">' +
      '<div style="background:var(--ivory);border-radius:12px;padding:10px 4px"><b style="display:block;font-size:20px">' + l + '<small style="font-size:12px;color:var(--muted)">/' + (m.total || 0) + '</small></b><span style="font-size:12px;color:var(--muted)">남은 횟수</span></div>' +
      '<div style="background:var(--ivory);border-radius:12px;padding:10px 4px"><b style="display:block;font-size:16px;line-height:30px">' + md(m.end) + '</b><span style="font-size:12px;color:var(--muted)">만료일</span></div>' +
      '<div style="background:var(--ivory);border-radius:12px;padding:10px 4px"><b style="display:block;font-size:16px;line-height:30px">' + md(la) + '</b><span style="font-size:12px;color:var(--muted)">마지막 방문</span></div></div>' +
      '<p style="margin:0;font-size:13.5px">' + esc(m.pass || '') + ' · ' + md(m.start) + ' ~ ' + md(m.end) + (m.memo ? '<br><span style="color:var(--muted)">' + esc(m.memo) + '</span>' : '') + '</p>' +
      '<div class="row" style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" class="sub primary" data-m="sms" data-id="' + m.id + '">AI로 문자 쓰기</button>' +
      (tel ? '<a class="sub" href="tel:' + tel + '" style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:var(--ink)">전화</a>' : '') + '</div>' +
      '<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="sub" data-m="renew" data-id="' + m.id + '">재등록</button><button type="button" class="sub" data-m="edit" data-id="' + m.id + '">정보 고치기</button></div>' +
      '<details open><summary style="font-size:13.5px;font-weight:700;cursor:pointer">시술 기록 ' + atts.length + '회</summary><div style="display:flex;flex-direction:column;margin-top:6px">' +
      (atts.length ? atts.map(function (d) { var vn = (m.vn || {})[d] || ''; return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)"><b style="flex:none;min-width:44px;font-size:13.5px">' + md(d) + '</b><span style="flex:1;min-width:0;font-size:13.5px;color:' + (vn ? 'var(--ink)' : 'var(--muted)') + '">' + (vn ? esc(vn) : '시술 내용 없음') + '</span><button type="button" class="sub" data-m="vnote" data-id="' + m.id + '" data-v="' + d + '" style="flex:none;min-width:0;min-height:36px;padding:0 10px;font-size:12.5px">' + (vn ? '고치기' : '적기') + '</button><button type="button" class="sub" data-m="unatt" data-id="' + m.id + '" data-v="' + d + '" aria-label="' + md(d) + ' 방문 취소" style="flex:none;min-width:36px;min-height:36px;padding:0;font-size:13px">×</button></div>'; }).join('') : '<span style="font-size:13px;color:var(--muted)">아직 없어요</span>') +
      '</div><p style="font-size:12px;color:var(--muted);margin:8px 0 0">' + P.care + ' 적어 두면 다음 관리 때 바로 봐요.</p></details>' +
      '<details><summary style="font-size:13.5px;font-weight:700;cursor:pointer">결제 내역 ' + pays.length + '건</summary><div style="margin-top:8px;font-size:13.5px">' +
      (pays.length ? pays.map(function (p) { return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)"><span>' + md(p.date) + ' · ' + esc(p.pass || '') + ' ' + (p.count || '') + '회</span><b>' + won(p.price) + ' <small style="font-weight:500;color:var(--muted)">' + esc(p.pay || '') + '</small></b></div>'; }).join('') : '<span style="color:var(--muted)">없어요</span>') +
      '</div></details>' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="del" data-id="' + m.id + '" style="color:#C2410C">고객 삭제</button><button type="button" class="sub" data-m="close">닫기</button></div>');
  }
  function renewForm(m) {
    var t = ymd(); var from = m.end && m.end >= t ? addDays(m.end, 1) : t;
    openDlg('<h2>' + esc(m.name) + ' 재등록</h2>' +
      '<label>관리권</label>' + chips('pass', PASSES, m.pass) + '<input type="hidden" id="mPass" value="' + esc(m.pass) + '">' +
      '<div style="display:flex;gap:8px"><label style="flex:1">추가 횟수<input type="text" id="mTotal" inputmode="numeric" value="10"></label><label style="flex:1">결제 금액<input type="text" id="mPrice" inputmode="numeric" placeholder="예: 550000"></label></div>' +
      '<label>결제 방법</label>' + chips('pay', PAYS, PAYS[0]) + '<input type="hidden" id="mPay" value="' + PAYS[0] + '">' +
      '<label>새 만료일<input type="date" id="mEnd" value="' + addMonths(from, 3) + '" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit"></label>' +
      '<p style="margin:0;font-size:12.5px;color:var(--muted)">남은 ' + left(m) + '회에 추가 횟수가 더해져요.</p>' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="renew-save" data-id="' + m.id + '">재등록</button></div>');
  }
  function noteForm(m, d) {
    var vn = (m.vn || {})[d] || '';
    openDlg('<h2>' + esc(m.name) + '님 · ' + md(d) + ' 시술 기록</h2>' +
      '<label>시술</label>' + '<div class="chips" role="group">' + PASSES.map(function (o) { return '<button type="button" class="chip" data-m="vadd" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
      '<label>내용<textarea id="vNote" maxlength="200" placeholder="' + P.notePh + '">' + esc(vn) + '</textarea></label>' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="open" data-id="' + m.id + '">뒤로</button><button type="button" class="sub primary" data-m="vsave" data-id="' + m.id + '" data-v="' + d + '">저장</button></div>');
  }
  function rsvSms(r) {
    showTab('make');
    var mm = window.alajoomFindMember ? window.alajoomFindMember(r.name) : null;
    window.alajoomRecipient = mm || { name: r.name, phone: '' };
    var b = document.querySelector('.tool[data-tool="sms"]'); if (b) b.click();
    setTimeout(function () {
      var c = document.querySelector('#panel .chip[data-k="topic"][data-v="예약 확인"]'); if (c) c.click();
      var d = document.getElementById('detail'); if (d) d.value = '예약: ' + md(r.date) + ' ' + r.time + ' · ' + (r.what || '관리');
      var p = document.getElementById('panel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast(r.name + '님 예약 확인 문자, 만들기만 누르세요');
    }, 80);
  }
  var find = function (id) { return DB.members.filter(function (m) { return m.id === id; })[0]; };
  var num = function (v) { return Math.max(0, parseInt(String(v || '').replace(/[^0-9]/g, ''), 10) || 0); };

  /* ---------- 문자: 만들기 화면의 '고객 문자'로 연결 ---------- */
  function sms(m) {
    var s = status(m), topic = s.k === 'renew' || s.k === 'end' ? '재등록 안내' : s.k === 'away' ? '재방문 안내' : '관리 후 안부';
    var info = '고객 이름: ' + m.name + ' / 관리권: ' + (m.pass || '') + ' / 남은 횟수: ' + left(m) + '회 / 만료일: ' + md(m.end);
    closeDlg(); showTab('make');
    window.alajoomRecipient = { name: m.name, phone: m.phone || '' };
    var b = document.querySelector('.tool[data-tool="sms"]'); if (b) b.click();
    setTimeout(function () {
      var c = document.querySelector('#panel .chip[data-k="topic"][data-v="' + topic + '"]'); if (c) c.click();
      var d = document.getElementById('detail'); if (d) { d.value = info; }
      var p = document.getElementById('panel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast(m.name + '님 문자, 만들기만 누르세요');
    }, 80);
  }

  /* ---------- 엑셀(CSV) ---------- */
  var COLS = ['이름', '연락처', '관리권', '총횟수', '남은횟수', '시작일', '만료일', '마지막방문', '방문일', '메모'];
  function exportCsv() {
    var q = function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var rows = [COLS].concat(DB.members.map(function (m) { return [m.name, m.phone, m.pass, m.total, left(m), m.start, m.end, lastAtt(m) || '', (m.att || []).slice().sort().join(' '), m.memo]; }));
    var csv = '﻿' + rows.map(function (r) { return r.map(q).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = P.t + '_고객_' + ymd() + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    toast('엑셀 파일로 내보냈어요');
  }
  function parseCsv(text) {
    var out = [], row = [], cur = '', q = false;
    text = text.replace(/^﻿/, '');
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); out.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur || row.length) { row.push(cur); out.push(row); }
    return out.filter(function (r) { return r.some(function (x) { return x.trim(); }); });
  }
  function importCsv(file) {
    var r = new FileReader();
    r.onload = function () {
      var rows = parseCsv(String(r.result)); if (rows.length < 2) { toast('읽을 고객이 없어요'); return; }
      var hd = rows[0].map(function (x) { return x.trim(); }), ix = function (n) { return hd.indexOf(n); };
      if (ix('이름') < 0) { toast(P.t + '에서 내보낸 파일을 골라주세요'); return; }
      var n = 0;
      rows.slice(1).forEach(function (c) {
        var name = (c[ix('이름')] || '').trim(); if (!name) return;
        var att = ix('방문일') >= 0 ? (c[ix('방문일')] || '').split(/\s+/).filter(function (d) { return /^\d{4}-\d{2}-\d{2}$/.test(d); }) : [];
        var m = DB.members.filter(function (x) { return x.name === name && (x.phone || '') === (c[ix('연락처')] || ''); })[0];
        var rec = { name: name, phone: c[ix('연락처')] || '', pass: c[ix('관리권')] || '', total: num(c[ix('총횟수')]), start: c[ix('시작일')] || '', end: c[ix('만료일')] || '', memo: c[ix('메모')] || '', att: att };
        if (m) { Object.keys(rec).forEach(function (k) { m[k] = rec[k]; }); }
        else { rec.id = uid(); rec.created = ymd(); rec.pays = []; DB.members.push(rec); }
        n++;
      });
      save(); render(); toast(n + '명을 불러왔어요');
    };
    r.readAsText(file, 'utf-8');
  }

  /* ---------- 이벤트 ---------- */
  function onClick(e) {
    var t = e.target.closest('[data-m]'); if (!t) return;
    var a = t.dataset.m, id = t.dataset.id, m = id && find(id);
    if (a === 'filter') { view.filter = t.dataset.v; render(); return; }
    if (a === 'sub') { view.sub = t.dataset.v; render(); return; }
    if (a === 'cnew') return classForm(null);
    if (a === 'cedit') { var cc = DB.rsv.filter(function (x) { return x.id === id; })[0]; if (cc) classForm(cc); return; }
    if (a === 'cdel') { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '정말 삭제?'; return; } DB.rsv = DB.rsv.filter(function (x) { return x.id !== id; }); save(); closeDlg(); render(); toast('예약을 지웠어요'); return; }
    if (a === 'csave') {
      var nm = $('#cName', dlg).value.trim(), tm = $('#cTime', dlg).value, dt = $('#cDate', dlg).value; if (!nm || !tm || !dt) { toast('날짜·시간·고객 이름을 적어주세요'); return; }
      var rec = { date: dt, time: tm, name: nm.replace(/\s*님$/, ''), what: $('#mWhat', dlg).value, memo: $('#cMemo', dlg).value.trim() };
      if (id) { var ex = DB.rsv.filter(function (x) { return x.id === id; })[0]; Object.keys(rec).forEach(function (k) { ex[k] = rec[k]; }); }
      else DB.rsv.push(Object.assign({ id: uid() }, rec));
      var cut = addDays(ymd(), -60); DB.rsv = DB.rsv.filter(function (x) { return x.date >= cut; });
      save(); closeDlg(); view.sub = 'cls'; render(); toast('예약을 저장했어요'); return;
    }
    if (a === 'rsms') { var rv = DB.rsv.filter(function (x) { return x.id === id; })[0]; if (rv) rsvSms(rv); return; }
    if (a === 'mnew') return menuForm(null);
    if (a === 'medit') { var mx = DB.menu.filter(function (x) { return x.id === id; })[0]; if (mx) menuForm(mx); return; }
    if (a === 'mdel') { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '정말 삭제?'; return; } DB.menu = DB.menu.filter(function (x) { return x.id !== id; }); if (!DB.menu.length) DB.menu = []; save(); fixDB(); closeDlg(); view.sub = 'menu'; render(); toast('시술을 지웠어요'); return; }
    if (a === 'msave') {
      var xn = $('#xName', dlg).value.trim(); if (!xn) { toast('시술 이름을 적어주세요'); return; }
      var xr = { name: xn, price: num($('#xPrice', dlg).value), mins: num($('#xMins', dlg).value) };
      if (id) { var xe = DB.menu.filter(function (x) { return x.id === id; })[0]; Object.keys(xr).forEach(function (k) { xe[k] = xr[k]; }); } else DB.menu.push(Object.assign({ id: uid() }, xr));
      save(); fixDB(); closeDlg(); view.sub = 'menu'; render(); toast('시술 메뉴에 저장했어요'); return;
    }
    if (a === 'vnote' && m) return noteForm(m, t.dataset.v);
    if (a === 'vsave' && m) { m.vn = m.vn || {}; var vv = $('#vNote', dlg).value.trim(); if (vv) m.vn[t.dataset.v] = vv; else delete m.vn[t.dataset.v]; save(); detail(m); toast('시술 기록을 저장했어요'); return; }
    if (a === 'vadd') { var ta = $('#vNote', dlg); if (ta) { ta.value = (ta.value.trim() ? ta.value.trim() + ' · ' : '') + t.dataset.v; ta.focus(); } return; }
    if (a === 'mon') { view.mon = shiftMon(view.mon, +t.dataset.v); render(); return; }
    if (a === 'bnew') return bookForm();
    if (a === 'bdel') { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '삭제?'; t.style.color = '#C2410C'; t.style.fontSize = '12px'; return; } DB.book = DB.book.filter(function (b) { return b.id !== id; }); save(); render(); toast('지웠어요'); return; }
    if (a === 'bsave') {
      var amt = num($('#bAmt', dlg).value), what = $('#bWhat', dlg).value.trim();
      if (!what || !amt) { toast('내용과 금액을 적어주세요'); return; }
      var bd = $('#bDate', dlg).value || ymd();
      DB.book.push({ id: uid(), date: bd, type: $('#mBtype', dlg).value, what: what, amount: amt, pay: $('#mPay', dlg).value });
      save(); closeDlg(); view.sub = 'book'; view.mon = bd.slice(0, 7); render(); toast('장부에 적었어요'); return;
    }
    if (a === 'new') return form(null);
    if (a === 'open' && m) return detail(m);
    if (a === 'edit' && m) return form(m);
    if (a === 'renew' && m) return renewForm(m);
    if (a === 'sms' && m) return sms(m);
    if (a === 'close') return closeDlg();
    if (a === 'export') return exportCsv();
    if (a === 'pick') {
      t.parentNode.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', b === t); });
      var hid = $('#m' + t.dataset.n.charAt(0).toUpperCase() + t.dataset.n.slice(1), dlg); if (hid) hid.value = t.dataset.v; return;
    }
    if (a === 'att' && m) {
      var td = ymd(); m.att = m.att || [];
      var i = m.att.indexOf(td);
      if (i >= 0) { m.att.splice(i, 1); toast(m.name + '님 오늘 방문을 취소했어요'); }
      else { if (left(m) === 0) { toast('남은 횟수가 없어요. 재등록해 주세요'); return; } m.att.push(td); var l = left(m); toast(m.name + '님 방문 · 남은 ' + l + '회' + (l <= 2 ? ' (재등록 안내 시기예요)' : '')); }
      save(); render(); return;
    }
    if (a === 'unatt' && m) { m.att = (m.att || []).filter(function (d) { return d !== t.dataset.v; }); save(); render(); detail(m); toast('방문을 취소했어요'); return; }
    if (a === 'del' && m) {
      if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '한 번 더 누르면 삭제'; return; }
      DB.members = DB.members.filter(function (x) { return x.id !== id; }); save(); closeDlg(); render(); toast('고객을 삭제했어요'); return;
    }
    if (a === 'save') {
      var name = $('#mName', dlg).value.trim(); if (!name) { toast('이름을 적어주세요'); $('#mName', dlg).focus(); return; }
      var rec = { name: name, phone: $('#mPhone', dlg).value.trim(), pass: $('#mPass', dlg).value, start: $('#mStart', dlg).value, end: $('#mEnd', dlg).value, memo: $('#mMemo', dlg).value.trim() };
      if (id) { Object.keys(rec).forEach(function (k) { m[k] = rec[k]; }); save(); render(); detail(m); toast('고쳤어요'); return; }
      rec.id = uid(); rec.created = ymd(); rec.total = num($('#mTotal', dlg).value) || 1; rec.att = [];
      var price = num($('#mPrice', dlg).value);
      rec.pays = [{ date: ymd(), pass: rec.pass, count: rec.total, price: price, pay: $('#mPay', dlg).value }];
      DB.members.push(rec); save(); closeDlg(); view.filter = 'all'; render(); toast(name + '님 등록 · ' + (price ? '매출 장부에 ' + won(price) + ' 기록' : '결제 금액 없이 등록')); return;
    }
    if (a === 'renew-save' && m) {
      var cnt = num($('#mTotal', dlg).value); if (!cnt) { toast('추가 횟수를 적어주세요'); return; }
      m.total = (m.total || 0) + cnt; m.pass = $('#mPass', dlg).value || m.pass; m.end = $('#mEnd', dlg).value || m.end;
      m.pays = m.pays || []; m.pays.push({ date: ymd(), pass: m.pass, count: cnt, price: num($('#mPrice', dlg).value), pay: $('#mPay', dlg).value });
      save(); render(); detail(m); toast('재등록 · 남은 ' + left(m) + '회 · 매출 장부에 기록했어요'); return;
    }
  }

  /* ---------- 탭 ---------- */
  function showTab(k) {
    document.querySelectorAll('.mtab').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === k); });
    ['home', 'make', 'members', 'works'].forEach(function (v) { var el = $('#v-' + v); if (el) el.classList.toggle('hidden', v !== k); });
    if (k === 'members') render();
    try { window.dispatchEvent(new CustomEvent('alajoom:tab', { detail: k })); } catch (e) {}
    try { sessionStorage.setItem('al_skin_tab', k); } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.alajoomTab = showTab;
  /* 오늘 화면(대시보드)용 */
  window.alajoomMemberStats = function () {
    var t = ymd(), mon = t.slice(0, 7), ms = DB.members, sales = 0;
    ms.forEach(function (m) { (m.pays || []).forEach(function (p) { if ((p.date || '').slice(0, 7) === mon) sales += +p.price || 0; }); });
    (DB.book || []).forEach(function (b) { if ((b.date || '').slice(0, 7) === mon) sales += b.type === '지출' ? 0 : (+b.amount || 0); });
    var pick = function (k) { return ms.filter(function (m) { return status(m).k === k; }).map(function (m) { return { id: m.id, name: m.name, left: left(m), end: m.end, last: lastAtt(m) }; }); };
    return { total: ms.length, active: ms.filter(function (m) { return status(m).k !== 'end'; }).length, today: ms.filter(function (m) { return (m.att || []).indexOf(t) >= 0; }).length,
      sales: sales, renew: pick('renew'), away: pick('away'), news: ms.filter(function (m) { return (m.created || '').slice(0, 7) === mon; }).length };
  };
  window.alajoomMemberSms = function (id) { var m = find(id); if (m) sms(m); };
  window.alajoomFindMember = function (name) {
    var hits = DB.members.filter(function (m) { return m.name === name; });
    if (!hits.length) hits = DB.members.filter(function (m) { return name && (m.name.indexOf(name) >= 0 || name.indexOf(m.name) >= 0); });
    return hits.length === 1 ? { name: hits[0].name, phone: hits[0].phone || '' } : null;
  };
  /* 말로 시키기: "김지은 방문" */
  window.alajoomAttend = function (name) {
    var hits = DB.members.filter(function (m) { return m.name === name; });
    if (!hits.length) hits = DB.members.filter(function (m) { return m.name.indexOf(name) >= 0 || name.indexOf(m.name) >= 0; });
    if (!hits.length) return name + '님을 고객 장부에서 찾지 못했어요';
    if (hits.length > 1) return name + '님이 ' + hits.length + '명이에요. 고객 장부에서 직접 눌러 주세요';
    var m = hits[0], td = ymd(); m.att = m.att || [];
    if (m.att.indexOf(td) >= 0) return m.name + '님은 오늘 이미 방문 기록이 있어요';
    if (left(m) === 0) return m.name + '님은 남은 횟수가 없어요. 재등록해 주세요';
    m.att.push(td); save(); render();
    var l = left(m); return m.name + '님 방문 기록 · 남은 ' + l + '회' + (l <= 2 ? ' (재등록 안내 시기예요)' : '');
  };
  function init() {
    var box = $('#v-members'); if (!box) return;
    box.addEventListener('click', onClick);
    box.addEventListener('input', function (e) { if (e.target.id === 'mbQ') { view.q = e.target.value.trim(); var pos = e.target.selectionStart; render(); var q = $('#mbQ'); q.focus(); try { q.setSelectionRange(pos, pos); } catch (er) {} } });
    document.querySelectorAll('.mtab').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.tab); }); });
    var mt = location.search.match(/[?&]tab=(members|works|make)/);
    var k = mt ? mt[1] : (function () { try { return sessionStorage.getItem('al_skin_tab'); } catch (e) { return null; } })();
    showTab(k === 'members' || k === 'works' || k === 'make' ? k : 'home');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
