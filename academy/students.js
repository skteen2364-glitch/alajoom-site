/* 학원메이트 · 원생 장부
   원생·반·출결·수납·상담을 이 기기(브라우저)에 저장하고, 로그인하면 계정에도 저장.
   학원은 '월 수강료 + 매월 납부일' 기준. 등·하원 알림과 수강료 안내는 원장님 휴대폰 문자로 바로 보내요. */
(function () {
  var KEY = 'al_academy_students_v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var ymd = function (d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var addDays = function (s, n) { var d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return ymd(d); };
  var days = function (a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5); };
  var won = function (n) { n = Math.round(+n || 0); return n.toLocaleString('ko-KR') + '원'; };
  var md = function (s) { return s ? (+s.slice(5, 7)) + '/' + (+s.slice(8, 10)) : '-'; };
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var num = function (v) { return Math.max(0, parseInt(String(v || '').replace(/[^0-9]/g, ''), 10) || 0); };
  var hm = function () { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  var PAYS = ['카드', '계좌이체', '현금', '교육비 결제'];
  var GRADES = ['유치', '초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3', '성인'];
  var DOWS = ['월', '화', '수', '목', '금', '토', '일'];
  var dowOf = function (s) { return (new Date(s + 'T00:00:00').getDay() + 6) % 7; };

  var DB = load();
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { members: [] }; } catch (e) { return { members: [] }; } }
  function fix() {
    DB.members = DB.members || []; DB.book = DB.book || []; DB.classes = DB.classes || [];
    DB.members.forEach(function (m) {
      m.att = m.att || []; m.abs = m.abs || {}; m.pays = m.pays || []; m.notes = m.notes || []; m.cls = m.cls || [];
      if (m.fee == null) m.fee = 0;
      if (!m.payDay) m.payDay = m.end ? +m.end.slice(8, 10) : (m.start ? +m.start.slice(8, 10) : 1);
      if (m.grade == null) m.grade = '';
    });
  }
  fix();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast('저장 공간이 부족해요'); } if (window.alajoomSaved) window.alajoomSaved('members', DB); }
  setTimeout(function () {
    if (!window.alajoomSync) return;
    window.alajoomSync({ keys: ['members'],
      get: function () { return DB; },
      has: function () { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } },
      set: function (k, d) { if (d && Array.isArray(d.members)) { DB = d; fix(); try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} } },
      done: function () { render(); var hv = $('#v-home'); if (hv && !hv.classList.contains('hidden')) window.dispatchEvent(new CustomEvent('alajoom:tab', { detail: 'home' })); toast('계정에 저장된 원생 장부를 불러왔어요'); } });
  }, 900);
  function toast(t) { var el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 1800); }
  function shop() { try { var s = JSON.parse(localStorage.getItem('pm_학원메이트_studio') || 'null'); if (s && s.name) return s.name; } catch (e) {} return '학원'; }

  /* ---------- 상태 ---------- */
  var MON = function () { return ymd().slice(0, 7); };
  function dueDate(m, mon) { var last = new Date(+mon.slice(0, 4), +mon.slice(5, 7), 0).getDate(); return mon + '-' + pad(Math.min(m.payDay || 1, last)); }
  function paidOf(m, mon) { return (m.pays || []).filter(function (p) { return p.mon === mon; })[0]; }
  function active(m, mon) { mon = mon || MON(); if (m.quit && m.quit.slice(0, 7) < mon) return false; if (m.start && m.start.slice(0, 7) > mon) return false; return true; }
  function lastAtt(m) { var a = (m.att || []).slice().sort(); return a.length ? a[a.length - 1] : null; }
  function recentAbs(m) { var t = ymd(); return Object.keys(m.abs || {}).filter(function (d) { return m.abs[d] === '결석' && days(d, t) <= 14 && days(d, t) >= 0; }).length; }
  function status(m) {
    var t = ymd(), mon = MON();
    if (m.quit && m.quit <= t) return { k: 'end', label: '퇴원', c: '#8A8F9C' };
    if (m.fee && !paidOf(m, mon) && (!m.start || m.start.slice(0, 7) <= mon)) {
      var due = dueDate(m, mon), dd = days(t, due);
      if (dd < 0) return { k: 'renew', label: '미납', c: '#C2410C', due: due };
      if (dd <= 3) return { k: 'renew', label: '납부 예정', c: '#B45309', due: due };
    }
    var la = lastAtt(m) || [m.start, m.created].filter(Boolean).sort().pop();
    if (recentAbs(m) >= 2 || (la && days(la, t) >= 14)) return { k: 'away', label: '결석 많음', c: '#2E4877' };
    return { k: 'ok', label: '수강 중', c: '#15803D' };
  }
  function clsName(id) { var c = DB.classes.filter(function (x) { return x.id === id; })[0]; return c ? c.name : ''; }
  function clsNames(m) { var seen = {}; return (m.cls || []).map(clsName).filter(function (n) { if (!n || seen[n]) return false; seen[n] = 1; return true; }); }

  var view = { filter: 'all', q: '', sub: 'list', mon: MON(), day: ymd(), pmon: MON() };

  /* ---------- 문자 보내기(원장님 휴대폰 문자 앱) ---------- */
  var IOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  function smsHref(phone, body) { var p = String(phone || '').replace(/[^0-9+]/g, ''); return 'sms:' + p + (IOS ? '&' : '?') + 'body=' + encodeURIComponent(body); }
  function smsBtn(phone, body, label, primary) {
    if (!String(phone || '').replace(/[^0-9]/g, '')) return '<button type="button" class="sub" data-m="copy" data-v="' + esc(body) + '" style="flex:none;min-width:0;min-height:36px;padding:0 10px;font-size:12.5px">문구 복사</button>';
    return '<a class="sub' + (primary ? ' primary' : '') + '" href="' + esc(smsHref(phone, body)) + '" style="flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:0;min-height:36px;padding:0 10px;font-size:12.5px;text-decoration:none;' + (primary ? '' : 'color:var(--ink)') + '">' + label + '</a>';
  }
  function who(m) { return m.name + ' 학생'; }

  /* ---------- 매출 장부 ---------- */
  function bookRows(mon) {
    var rows = [];
    DB.members.forEach(function (m) { (m.pays || []).forEach(function (p) { if ((p.date || '').slice(0, 7) === mon) rows.push({ auto: true, mid: m.id, date: p.date, type: '매출', what: m.name + ' · ' + (p.mon ? (+p.mon.slice(5)) + '월 수강료' : (p.pass || '수강료')), amount: +p.price || 0, pay: p.pay || '' }); }); });
    DB.book.forEach(function (b) { if ((b.date || '').slice(0, 7) === mon) rows.push(b); });
    return rows.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }
  function shiftMon(mon, n) { var d = new Date(mon + '-01T00:00:00'); d.setMonth(d.getMonth() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
  function monNav(key, mon) { return '<div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 10px"><button type="button" class="sub" data-m="' + key + '" data-v="-1" style="flex:none;min-width:44px;padding:0" aria-label="이전">‹</button><b style="font-size:17px">' + (+mon.slice(0, 4)) + '년 ' + (+mon.slice(5)) + '월</b><button type="button" class="sub" data-m="' + key + '" data-v="1" style="flex:none;min-width:44px;padding:0" aria-label="다음">›</button></div>'; }
  var box3 = function (l, v, c, dark) { return '<div style="' + (dark ? 'background:var(--ink);color:#fff' : 'background:#fff;border:1px solid var(--line)') + ';border-radius:14px;padding:10px 4px"><span style="font-size:12px;' + (dark ? 'opacity:.75' : 'color:var(--muted)') + '">' + l + '</span><b style="display:block;font-size:15px;color:' + c + '">' + v + '</b></div>'; };
  function renderBook(box) {
    var rows = bookRows(view.mon), inc = 0, out = 0;
    rows.forEach(function (r) { if (r.type === '지출') out += r.amount; else inc += r.amount; });
    var h = monNav('mon', view.mon);
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 12px;text-align:center">' + box3('매출', won(inc), '#15803D') + box3('지출', won(out), '#C2410C') + box3('남은 돈', won(inc - out), 'var(--yellow)', 1) + '</div>';
    h += '<button type="button" class="go" data-m="bnew" style="justify-content:center;margin:0 0 12px;width:100%">+ 매출·지출 적기</button>';
    if (!rows.length) h += '<p style="text-align:center;color:var(--muted);padding:16px 0;font-size:14px">이 달 기록이 없어요.<br>수납 탭에서 납부 처리하면 수강료가 자동으로 적혀요.</p>';
    else h += '<div style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:4px 12px">' + rows.map(function (r) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)">' +
        '<span style="flex:none;width:38px;font-size:12.5px;color:var(--muted)">' + md(r.date) + '</span>' +
        '<span style="flex:1;min-width:0;font-size:14px">' + esc(r.what) + '<small style="display:block;color:var(--muted);font-size:12px">' + (r.auto ? '수강료 · 자동' : r.type) + (r.pay ? ' · ' + esc(r.pay) : '') + '</small></span>' +
        '<b style="flex:none;font-size:14px;color:' + (r.type === '지출' ? '#C2410C' : 'var(--ink)') + '">' + (r.type === '지출' ? '-' : '') + won(r.amount) + '</b>' +
        (r.auto ? '<button type="button" data-m="open" data-id="' + r.mid + '" aria-label="원생 보기" style="flex:none;border:0;background:none;font-size:18px;color:#9AA0AD;min-width:32px;min-height:40px;cursor:pointer">›</button>' : '<button type="button" data-m="bdel" data-id="' + r.id + '" aria-label="삭제" style="flex:none;border:0;background:none;font-size:18px;color:#9AA0AD;min-width:32px;min-height:40px;cursor:pointer">×</button>') +
        '</div>';
    }).join('') + '</div>';
    box.insertAdjacentHTML('beforeend', h);
  }
  function bookForm() {
    openDlg('<h2>매출·지출 적기</h2>' + chips('btype', ['매출', '지출'], '지출') + '<input type="hidden" id="mBtype" value="지출">' +
      '<label>날짜<input type="date" id="bDate" value="' + ymd() + '" class="dt"></label>' +
      '<label>내용<input type="text" id="bWhat" maxlength="40" placeholder="예: 월세, 교재 구입, 특강비"></label>' +
      '<label>금액<input type="text" id="bAmt" inputmode="numeric" placeholder="예: 1200000"></label>' +
      '<label>결제 방법</label>' + chips('pay', PAYS, PAYS[1]) + '<input type="hidden" id="mPay" value="' + PAYS[1] + '">' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="bsave">적기</button></div>');
  }

  /* ---------- 수납 ---------- */
  function renderPay(box) {
    var mon = view.pmon, t = ymd();
    var ms = DB.members.filter(function (m) { return active(m, mon) && m.fee; }).sort(function (a, b) { return (a.payDay || 1) - (b.payDay || 1) || a.name.localeCompare(b.name, 'ko'); });
    var bill = 0, got = 0, unpaid = [];
    ms.forEach(function (m) { bill += m.fee; var p = paidOf(m, mon); if (p) got += +p.price || 0; else unpaid.push(m); });
    var h = monNav('pmon', mon);
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 8px;text-align:center">' + box3('청구', won(bill), 'var(--ink)') + box3('납부', won(got), '#15803D') + box3('미납 ' + unpaid.length + '명', won(Math.max(0, bill - got)), 'var(--yellow)', 1) + '</div>';
    h += '<p style="margin:0 0 12px;font-size:12.5px;color:var(--muted)">원생마다 월 수강료와 납부일을 적어 두면 이 달 청구서가 자동으로 만들어져요. 안내 문자는 원장님 휴대폰 문자 앱으로 열려요.</p>';
    if (!ms.length) h += '<div class="panel" style="text-align:center;padding:24px 16px"><b>이 달 청구할 원생이 없어요</b><p style="margin:6px 0 0;font-size:13.5px;color:var(--muted)">원생 정보에 월 수강료를 적어 주세요.</p></div>';
    else h += '<div style="display:flex;flex-direction:column;gap:8px">' + ms.map(function (m) {
      var p = paidOf(m, mon), due = dueDate(m, mon), late = !p && due < t;
      var body = '[' + shop() + '] 안녕하세요, ' + who(m) + ' ' + (+mon.slice(5)) + '월 수강료 ' + won(m.fee) + ' 안내드려요. 납부일은 ' + (+due.slice(8)) + '일이에요. 이미 납부하셨다면 이 문자는 넘겨 주세요. 감사합니다.';
      return '<div style="display:flex;align-items:center;gap:8px;background:#fff;border:1px solid ' + (late ? '#F3C7A8' : 'var(--line)') + ';border-radius:14px;padding:10px 12px">' +
        '<button type="button" data-m="open" data-id="' + m.id + '" style="flex:1;min-width:0;border:0;background:none;padding:0;text-align:left;font:inherit;cursor:pointer"><b style="font-size:15px">' + esc(m.name) + '</b> <small style="color:var(--muted)">' + esc(m.grade || '') + '</small>' +
        '<span style="display:block;font-size:12.5px;color:' + (p ? '#15803D' : late ? '#C2410C' : 'var(--muted)') + '">' + won(m.fee) + ' · ' + (p ? md(p.date) + ' 납부 · ' + esc(p.pay || '') : (+due.slice(8)) + '일 납부' + (late ? ' · 지남' : '')) + '</span></button>' +
        (p ? '<button type="button" class="sub" data-m="unpay" data-id="' + m.id + '" style="flex:none;min-width:0;min-height:36px;padding:0 10px;font-size:12.5px">취소</button>'
           : smsBtn(m.phone, body, '안내 문자') + '<button type="button" class="sub primary" data-m="pay" data-id="' + m.id + '" style="flex:none;min-width:0;min-height:36px;padding:0 10px;font-size:12.5px">납부</button>') +
        '</div>';
    }).join('') + '</div>';
    box.insertAdjacentHTML('beforeend', h);
  }
  function payForm(m) {
    var mon = view.sub === 'pay' ? view.pmon : MON();
    openDlg('<h2>' + esc(m.name) + ' · ' + (+mon.slice(5)) + '월 수강료</h2>' +
      '<div style="display:flex;gap:8px"><label style="flex:1">금액<input type="text" id="pAmt" inputmode="numeric" value="' + (m.fee || '') + '"></label><label style="flex:1">납부일<input type="date" id="pDate" value="' + ymd() + '" class="dt"></label></div>' +
      '<label>결제 방법</label>' + chips('pay', PAYS, PAYS[0]) + '<input type="hidden" id="mPay" value="' + PAYS[0] + '">' +
      '<p style="margin:0;font-size:12.5px;color:var(--muted)">매출 장부에 자동으로 적혀요.</p>' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="pay-save" data-id="' + m.id + '" data-v="' + mon + '">납부 처리</button></div>');
  }

  /* ---------- 출결 ---------- */
  function mark(m, d) { if ((m.att || []).indexOf(d) >= 0) return (m.abs || {})[d] === '지각' ? '지각' : '출석'; return (m.abs || {})[d] === '결석' ? '결석' : ''; }
  function setMark(m, d, v) {
    m.att = (m.att || []).filter(function (x) { return x !== d; }); m.abs = m.abs || {}; delete m.abs[d];
    if (v === '출석' || v === '지각') m.att.push(d);
    if (v === '지각' || v === '결석') m.abs[d] = v;
  }
  function attRow(m, d, cls) {
    var cur = mark(m, d), tm = (m.inT || {})[d];
    var b = function (v, col) { var on = cur === v; return '<button type="button" data-m="mark" data-id="' + m.id + '" data-v="' + v + '" aria-pressed="' + on + '" style="flex:none;min-width:46px;min-height:38px;border-radius:10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;border:1px solid ' + (on ? col : 'var(--line)') + ';background:' + (on ? col : '#fff') + ';color:' + (on ? '#fff' : 'var(--ink)') + '">' + v + '</button>'; };
    var msg = '';
    if (cur === '출석' || cur === '지각') msg = smsBtn(m.phone, '[' + shop() + '] ' + who(m) + ' ' + (tm || hm()) + ' 등원했어요.' + (cls ? ' (' + cls + ')' : ''), '등원 알림');
    if (cur === '결석') msg = smsBtn(m.phone, '[' + shop() + '] 안녕하세요, ' + who(m) + ' 오늘' + (cls ? ' ' + cls : '') + ' 수업에 아직 오지 않았어요. 혹시 사정이 있으면 편하게 알려 주세요.', '결석 연락');
    return '<div style="display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--line);flex-wrap:wrap">' +
      '<button type="button" data-m="open" data-id="' + m.id + '" style="flex:1;min-width:80px;border:0;background:none;padding:0;text-align:left;font:inherit;cursor:pointer"><b style="font-size:15px">' + esc(m.name) + '</b> <small style="color:var(--muted)">' + esc(m.grade || '') + '</small>' + (tm ? '<small style="display:block;color:var(--muted)">' + tm + ' 등원</small>' : '') + '</button>' +
      b('출석', '#15803D') + b('지각', '#B45309') + b('결석', '#C2410C') + (msg ? '<span style="flex-basis:100%;display:flex;justify-content:flex-end;gap:6px">' + msg + '<button type="button" class="sub" data-m="out" data-id="' + m.id + '" style="flex:none;min-width:0;min-height:36px;padding:0 10px;font-size:12.5px"' + (cur === '결석' ? ' hidden' : '') + '>하원 알림</button></span>' : '') +
      '</div>';
  }
  function renderAtt(box) {
    var d = view.day, dw = dowOf(d), isT = d === ymd();
    var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 10px"><button type="button" class="sub" data-m="day" data-v="-1" style="flex:none;min-width:44px;padding:0" aria-label="전날">‹</button><b style="font-size:17px">' + md(d) + ' ' + DOWS[dw] + '요일' + (isT ? ' · 오늘' : '') + '</b><button type="button" class="sub" data-m="day" data-v="1" style="flex:none;min-width:44px;padding:0" aria-label="다음날">›</button></div>';
    var ms = DB.members.filter(function (m) { return status(m).k !== 'end'; });
    var cs = DB.classes.filter(function (c) { return c.day === dw; }).sort(function (a, b) { return (a.time || '').localeCompare(b.time || ''); });
    var cnt = { o: 0, l: 0, x: 0 }; ms.forEach(function (m) { var k = mark(m, d); if (k === '출석') cnt.o++; else if (k === '지각') cnt.l++; else if (k === '결석') cnt.x++; });
    h += '<p style="margin:0 0 12px;font-size:13px;color:var(--muted)">출석 <b style="color:#15803D">' + cnt.o + '</b> · 지각 <b style="color:#B45309">' + cnt.l + '</b> · 결석 <b style="color:#C2410C">' + cnt.x + '</b> — 출석을 누르면 학부모님께 보낼 <b>등원 알림</b> 문자가 준비돼요.</p>';
    if (!ms.length) { h += '<div class="panel" style="text-align:center;padding:24px 16px"><b>먼저 원생을 등록해 주세요</b></div>'; box.insertAdjacentHTML('beforeend', h); return; }
    var shown = {};
    cs.forEach(function (c) {
      var list = ms.filter(function (m) { return (m.cls || []).indexOf(c.id) >= 0; }); list.forEach(function (m) { shown[m.id] = 1; });
      h += '<section class="panel" style="padding:12px 14px;margin:0 0 10px"><div style="display:flex;align-items:center;gap:8px"><b style="flex:none;font-size:15px">' + esc(c.time) + '</b><b style="flex:1;min-width:0;font-size:15px">' + esc(c.name) + '</b><button type="button" class="sub" data-m="note" data-id="' + c.id + '" style="flex:none;min-width:0;min-height:36px;padding:0 12px;font-size:12.5px">알림장</button></div>' +
        (list.length ? list.sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); }).map(function (m) { return attRow(m, d, c.name); }).join('') : '<p style="margin:8px 0 0;font-size:13px;color:var(--muted)">이 반에 넣은 원생이 없어요. 원생 정보에서 반을 골라 주세요.</p>') + '</section>';
    });
    var rest = ms.filter(function (m) { return !shown[m.id]; }).sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); });
    if (rest.length) h += '<section class="panel" style="padding:12px 14px"><b style="font-size:15px">' + (cs.length ? '오늘 반이 없는 원생' : (DB.classes.length ? '이 요일엔 수업이 없어요 · 전체 원생' : '전체 원생')) + '</b>' + rest.map(function (m) { return attRow(m, d, ''); }).join('') + '</section>';
    box.insertAdjacentHTML('beforeend', h);
  }
  function noteForm(c) {
    var key = view.day + ':' + c.id; DB.notes = DB.notes || {};
    openDlg('<h2>' + esc(c.name) + ' 알림장 · ' + md(view.day) + '</h2>' +
      '<label>오늘 배운 것<textarea id="nLearn" maxlength="300" placeholder="예: 일차방정식 활용 문제, 개념 정리">' + esc((DB.notes[key] || {}).learn) + '</textarea></label>' +
      '<label>과제·준비물<textarea id="nHw" maxlength="200" placeholder="예: 교재 54~56쪽, 오답노트">' + esc((DB.notes[key] || {}).hw) + '</textarea></label>' +
      '<p style="margin:0;font-size:12.5px;color:var(--muted)">학생 이름·성적은 넣지 않아요. 반 전체 학부모님께 보내는 알림장이에요.</p>' +
      '<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="sub" data-m="close">닫기</button><button type="button" class="sub" data-m="note-copy" data-id="' + c.id + '">문구 복사</button><button type="button" class="sub primary" data-m="note-ai" data-id="' + c.id + '">AI로 다듬기</button></div>');
  }
  function noteText(c) {
    var l = $('#nLearn', dlg).value.trim(), w = $('#nHw', dlg).value.trim();
    DB.notes = DB.notes || {}; DB.notes[view.day + ':' + c.id] = { learn: l, hw: w }; save();
    return '[' + shop() + ' 알림장] ' + md(view.day) + ' ' + c.name + '\n오늘 배운 것: ' + (l || '-') + '\n과제: ' + (w || '없음');
  }

  /* ---------- 원생 목록 ---------- */
  function render() {
    var box = $('#v-members'); if (!box) return;
    var ms = DB.members;
    var subb = function (v, l) { return '<button type="button" data-m="sub" data-v="' + v + '" aria-pressed="' + (view.sub === v) + '" style="flex:1;min-width:0;min-height:40px;border:0;border-bottom:3px solid ' + (view.sub === v ? 'var(--ink)' : 'transparent') + ';background:none;font:inherit;font-size:14px;font-weight:800;color:' + (view.sub === v ? 'var(--ink)' : 'var(--muted)') + ';cursor:pointer;white-space:nowrap;padding:0 2px">' + l + '</button>'; };
    var top = '<div style="display:flex;margin:0 0 14px;border-bottom:1px solid var(--line)">' + subb('list', '원생') + subb('att', '출결') + subb('pay', '수납') + subb('cls', '시간표') + subb('book', '장부') + '</div>';
    if (view.sub === 'book') { box.innerHTML = top; renderBook(box); return; }
    if (view.sub === 'cls') { box.innerHTML = top; renderClasses(box); return; }
    if (view.sub === 'pay') { box.innerHTML = top; renderPay(box); return; }
    if (view.sub === 'att') { box.innerHTML = top; renderAtt(box); return; }
    var t = ymd(), mon = MON();
    var by = function (k) { return ms.filter(function (m) { return status(m).k === k; }); };
    var act = ms.filter(function (m) { return status(m).k !== 'end'; });
    var news = ms.filter(function (m) { return (m.created || '').slice(0, 7) === mon || (m.start || '').slice(0, 7) === mon; }).length;
    var quits = ms.filter(function (m) { return (m.quit || '').slice(0, 7) === mon; }).length;
    var todayAtt = ms.filter(function (m) { return (m.att || []).indexOf(t) >= 0; }).length;
    var list = ms.filter(function (m) {
      var s = status(m).k;
      if (view.filter === 'all' && s === 'end') return false;
      if (view.filter !== 'all' && view.filter.indexOf('c:') !== 0 && s !== view.filter) return false;
      if (view.filter.indexOf('c:') === 0 && ((m.cls || []).indexOf(view.filter.slice(2)) < 0 || s === 'end')) return false;
      if (view.q && (m.name + ' ' + (m.phone || '') + ' ' + (m.grade || '')).indexOf(view.q) < 0) return false;
      return true;
    }).sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); });
    var stat = function (n, l, f) { return '<button type="button" data-m="filter" data-v="' + f + '" style="flex:1 1 0;min-width:0;border:1px solid var(--line);background:#fff;border-radius:14px;padding:10px 6px;text-align:center;font:inherit;cursor:pointer"><b style="display:block;font-size:20px;font-weight:900">' + n + '</b><span style="font-size:12px;color:var(--muted)">' + l + '</span></button>'; };
    var h = top + '<div style="display:flex;gap:8px;margin:0 0 10px">' + stat(act.length, '수강 중', 'all') + stat(by('renew').length, '수강료 챙길', 'renew') + stat(by('away').length, '결석 많음', 'away') + '</div>';
    h += '<p style="margin:0 0 14px;font-size:13px;color:var(--muted)">오늘 출석 <b style="color:var(--ink)">' + todayAtt + '명</b> · 이번 달 신규 <b style="color:var(--ink)">' + news + '명</b> · 퇴원 <b style="color:var(--ink)">' + quits + '명</b></p>';
    h += '<div style="display:flex;gap:8px;margin:0 0 10px"><input type="text" id="mbQ" placeholder="이름·학년·전화번호 찾기" value="' + esc(view.q) + '" style="flex:1"><button type="button" class="sub primary" data-m="new" style="flex:none;min-width:0;padding:0 16px">+ 원생</button></div>';
    var chip = function (v, l) { return '<button type="button" class="chip" data-m="filter" data-v="' + v + '" aria-pressed="' + (view.filter === v) + '">' + esc(l) + '</button>'; };
    var seen = {}, cchips = DB.classes.filter(function (c) { if (seen[c.name]) return false; seen[c.name] = 1; return true; }).map(function (c) { return chip('c:' + c.id, c.name); }).join('');
    h += '<div class="chips" role="group" aria-label="원생 보기" style="margin:0 0 12px">' + chip('all', '수강 중') + chip('renew', '수강료 챙길') + chip('away', '결석 많음') + cchips + chip('end', '퇴원') + '</div>';
    if (!ms.length) h += '<div class="panel" style="text-align:center;padding:28px 16px"><b style="font-size:16px">아직 등록한 원생이 없어요</b><p style="margin:6px 0 14px;font-size:14px;color:var(--muted)">원생을 등록하면 출결·수강료 납부일·결석을 알아서 챙겨 드려요.</p><button type="button" class="go" data-m="new" style="justify-content:center">첫 원생 등록하기</button></div>';
    else if (!list.length) h += '<p style="text-align:center;color:var(--muted);padding:20px 0">해당하는 원생이 없어요</p>';
    else h += '<div style="display:flex;flex-direction:column;gap:10px">' + list.map(card).join('') + '</div>';
    h += '<details style="margin-top:18px;background:#fff"><summary style="font-size:13.5px;font-weight:700;cursor:pointer">엑셀로 받기</summary>' +
      '<p style="font-size:12.5px;color:var(--muted);margin:8px 0">로그인하면 원생 장부가 <b>계정에 저장</b>돼서 폰·PC 어디서나 같이 봐요. 엑셀로도 받아 둘 수 있어요.</p>' +
      '<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="sub" data-m="export">엑셀로 받기</button></div></details>';
    box.innerHTML = h;
  }
  function card(m) {
    var s = status(m), t = ymd(), cur = mark(m, t), cn = clsNames(m), p = paidOf(m, MON());
    return '<article style="background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 14px"><div style="display:flex;align-items:center;gap:10px">' +
      '<button type="button" data-m="open" data-id="' + m.id + '" style="flex:1;min-width:0;border:0;background:none;padding:0;text-align:left;font:inherit;cursor:pointer">' +
      '<b style="font-size:16px">' + esc(m.name) + '</b> <small style="color:var(--muted)">' + esc(m.grade || '') + '</small> <span style="font-size:11.5px;font-weight:800;color:' + s.c + ';border:1px solid ' + s.c + ';border-radius:999px;padding:1px 7px;margin-left:2px">' + s.label + '</span>' +
      '<span style="display:block;font-size:13px;color:var(--muted);margin-top:2px">' + (cn.length ? esc(cn.join(', ')) : '반 없음') + (m.fee ? ' · ' + (p ? '이번 달 납부 ✓' : (m.payDay || 1) + '일 납부') : '') + '</span></button>' +
      (s.k === 'end' ? '' : '<button type="button" data-m="att" data-id="' + m.id + '" aria-pressed="' + !!cur + '" style="flex:none;min-width:64px;min-height:44px;border-radius:12px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;' + (cur ? 'background:var(--yellow);border:1px solid var(--yellow);color:var(--ink)' : 'background:var(--ink);border:1px solid var(--ink);color:#fff') + '">' + (cur ? cur + ' ✓' : '출석') + '</button>') +
      '</div></article>';
  }

  /* ---------- 시간표(반) ---------- */
  function sortedClasses() { return DB.classes.slice().sort(function (a, b) { return a.day - b.day || (a.time || '').localeCompare(b.time || ''); }); }
  function renderClasses(box) {
    var cs = sortedClasses();
    var h = '<p style="margin:0 0 12px;font-size:13px;color:var(--muted)">반(수업)을 요일·시간별로 적어 두세요. 원생에게 반을 넣으면 <b>출결</b>에서 반별로 체크하고, <b>오늘</b> 화면과 <b>시간표 카드</b>에도 자동으로 들어가요.</p>';
    h += '<button type="button" class="go" data-m="cnew" style="justify-content:center;margin:0 0 12px;width:100%">+ 반·수업 추가</button>';
    if (!cs.length) h += '<p style="text-align:center;color:var(--muted);padding:12px 0">아직 시간표가 없어요</p>';
    else DOWS.forEach(function (dn, di) {
      var list = cs.filter(function (c) { return c.day === di; }); if (!list.length) return;
      h += '<p style="margin:12px 0 6px;font-size:13px;font-weight:900">' + dn + '요일</p><div style="display:flex;flex-direction:column;gap:6px">' + list.map(function (c) {
        var n = DB.members.filter(function (m) { return (m.cls || []).indexOf(c.id) >= 0 && status(m).k !== 'end'; }).length;
        return '<button type="button" data-m="cedit" data-id="' + c.id + '" style="display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:#fff;border-radius:14px;padding:10px 14px;font:inherit;text-align:left;cursor:pointer"><b style="flex:none;font-size:15px;min-width:52px">' + esc(c.time) + '</b><span style="flex:1;min-width:0;font-size:14px">' + esc(c.name) + (c.teacher ? ' <small style="color:var(--muted)">· ' + esc(c.teacher) + '</small>' : '') + '</span><span style="flex:none;font-size:12.5px;color:var(--muted)">' + n + (c.cap ? '/' + c.cap : '') + '명</span></button>';
      }).join('') + '</div>';
    });
    box.insertAdjacentHTML('beforeend', h);
  }
  function classForm(c) {
    var isNew = !c; c = c || { day: (new Date().getDay() + 6) % 7, time: '16:00', name: '', cap: 8 };
    openDlg('<h2>' + (isNew ? '반·수업 추가' : '반·수업 고치기') + '</h2>' +
      '<label>요일</label><div class="chips" role="group">' + DOWS.map(function (d, i) { return '<button type="button" class="chip" data-m="cday" data-v="' + i + '" aria-pressed="' + (i === c.day) + '">' + d + '</button>'; }).join('') + '</div><input type="hidden" id="cDay" value="' + c.day + '">' +
      '<div style="display:flex;gap:8px"><label style="flex:1">시간<input type="time" id="cTime" value="' + esc(c.time) + '" class="dt"></label><label style="flex:1">정원(명)<input type="text" id="cCap" inputmode="numeric" value="' + (c.cap || '') + '"></label></div>' +
      '<label>반 이름<input type="text" id="cName" maxlength="30" value="' + esc(c.name) + '" placeholder="예: 중1 수학 A반, 초등 사고력"></label>' +
      '<label>강사 (선택)<input type="text" id="cTeacher" maxlength="15" value="' + esc(c.teacher) + '"></label>' +
      (isNew ? '<label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="cMWF"> 월·수·금 같은 시간에 추가</label><label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="cTT"> 화·목 같은 시간에 추가</label>' : '') +
      '<div class="row" style="display:flex;gap:8px">' + (isNew ? '' : '<button type="button" class="sub" data-m="cdel" data-id="' + c.id + '" style="color:#C2410C">삭제</button>') + '<button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="csave" data-id="' + (isNew ? '' : c.id) + '">저장</button></div>');
  }
  window.alajoomTodayClasses = function () { var d = (new Date().getDay() + 6) % 7; return sortedClasses().filter(function (c) { return c.day === d; }); };
  window.alajoomWeekSchedule = function () {
    var cs = sortedClasses(); if (!cs.length) return '';
    return DOWS.map(function (dn, di) { var l = cs.filter(function (c) { return c.day === di; }); return l.length ? dn + ' ' + l.map(function (c) { return c.time + ' ' + c.name; }).join(', ') : ''; }).filter(Boolean).join(' / ');
  };

  /* ---------- 대화상자 ---------- */
  var dlg;
  function openDlg(html) {
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'mbDlg'; document.body.appendChild(dlg); dlg.addEventListener('click', onClick); }
    dlg.innerHTML = '<style>#mbDlg .dt{width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit}</style><div class="dlg" style="max-height:calc(100vh - 60px);overflow:auto">' + html + '</div>';
    if (!dlg.open) { dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); }
  }
  function closeDlg() { if (dlg) { dlg.close ? dlg.close() : dlg.removeAttribute('open'); } }
  function chips(name, opts, cur) { return '<div class="chips" role="group">' + opts.map(function (o) { return '<button type="button" class="chip" data-m="pick" data-n="' + name + '" data-v="' + esc(o) + '" aria-pressed="' + (o === cur) + '">' + esc(o) + '</button>'; }).join('') + '</div>'; }

  function form(m) {
    var isNew = !m, t = ymd();
    m = m || { grade: '', fee: '', payDay: +t.slice(8), start: t, cls: [] };
    var cs = sortedClasses();
    openDlg('<h2>' + (isNew ? '새 원생 등록' : '원생 정보 고치기') + '</h2>' +
      '<div style="display:flex;gap:8px"><label style="flex:2">이름<input type="text" id="mName" value="' + esc(m.name) + '" maxlength="20" autocomplete="off"></label><label style="flex:1">학년<select id="mGrade" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit;background:#fff"><option value="">-</option>' + GRADES.map(function (g) { return '<option' + (g === m.grade ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select></label></div>' +
      '<label>학부모 연락처<input type="text" id="mPhone" value="' + esc(m.phone) + '" inputmode="tel" maxlength="20" placeholder="등·하원 알림, 수강료 안내를 보낼 번호"></label>' +
      '<label>학생 연락처 (선택)<input type="text" id="mSphone" value="' + esc(m.sphone) + '" inputmode="tel" maxlength="20"></label>' +
      '<label>반</label>' + (cs.length ? '<div class="chips" role="group">' + cs.map(function (c) { return '<button type="button" class="chip" data-m="mcls" data-v="' + c.id + '" aria-pressed="' + ((m.cls || []).indexOf(c.id) >= 0) + '">' + DOWS[c.day] + ' ' + esc(c.time) + ' ' + esc(c.name) + '</button>'; }).join('') + '</div>' : '<p style="margin:0;font-size:13px;color:var(--muted)">시간표에 반을 먼저 추가하면 여기서 고를 수 있어요.</p>') +
      '<div style="display:flex;gap:8px"><label style="flex:2">월 수강료<input type="text" id="mFee" inputmode="numeric" placeholder="예: 280000" value="' + (m.fee || '') + '"></label><label style="flex:1">매월 납부일<input type="text" id="mPayDay" inputmode="numeric" value="' + (m.payDay || '') + '" placeholder="예: 5"></label></div>' +
      '<label>등록일<input type="date" id="mStart" value="' + esc(m.start) + '" class="dt"></label>' +
      '<label>메모<textarea id="mMemo" maxlength="300" placeholder="예: 형제 할인, 화요일 학원 차량">' + esc(m.memo) + '</textarea></label>' +
      '<p style="margin:-4px 0 0;font-size:12px;color:var(--muted)">성적·건강 같은 민감한 정보는 꼭 필요한 만큼만 적어 주세요. 홍보글에는 원생 정보가 들어가지 않아요.</p>' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="save" data-id="' + (isNew ? '' : m.id) + '">저장</button></div>');
  }
  function detail(m) {
    var s = status(m), la = lastAtt(m), mon = MON(), p = paidOf(m, mon);
    var recs = Object.keys(m.abs || {}).concat(m.att || []).filter(function (d, i, a) { return a.indexOf(d) === i; }).sort().reverse().slice(0, 30);
    var pays = (m.pays || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var notes = (m.notes || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var tel = (m.phone || '').replace(/[^0-9+]/g, ''), cn = clsNames(m);
    var cell = function (v, l) { return '<div style="background:var(--ivory);border-radius:12px;padding:10px 4px"><b style="display:block;font-size:15px;line-height:26px">' + v + '</b><span style="font-size:12px;color:var(--muted)">' + l + '</span></div>'; };
    openDlg('<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h2>' + esc(m.name) + ' <small style="font-size:14px;color:var(--muted)">' + esc(m.grade || '') + '</small></h2><span style="font-size:13px;color:var(--muted)">학부모 ' + esc(m.phone || '연락처 없음') + (m.sphone ? ' · 학생 ' + esc(m.sphone) : '') + '</span></div><span style="font-size:12px;font-weight:800;color:' + s.c + ';border:1px solid ' + s.c + ';border-radius:999px;padding:2px 9px;white-space:nowrap">' + s.label + '</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">' + cell(m.fee ? won(m.fee) : '-', '월 수강료') + cell(m.fee ? (p ? '납부 ✓' : (m.payDay || 1) + '일') : '-', (+mon.slice(5)) + '월 수납') + cell(md(la), '마지막 출석') + '</div>' +
      '<p style="margin:0;font-size:13.5px">' + (cn.length ? esc(cn.join(', ')) : '반 없음') + ' · 등록 ' + md(m.start) + (m.quit ? ' · 퇴원 ' + md(m.quit) : '') + (m.memo ? '<br><span style="color:var(--muted)">' + esc(m.memo) + '</span>' : '') + '</p>' +
      '<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="sub primary" data-m="sms" data-id="' + m.id + '">AI로 문자 쓰기</button>' +
      (tel ? '<a class="sub" href="tel:' + tel + '" style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:var(--ink)">전화</a>' : '') +
      (m.fee && !p ? '<button type="button" class="sub" data-m="pay" data-id="' + m.id + '">' + (+mon.slice(5)) + '월 납부 처리</button>' : '') + '</div>' +
      '<details open><summary style="font-size:13.5px;font-weight:700;cursor:pointer">상담 기록 ' + notes.length + '건</summary><div style="margin-top:8px">' +
      '<div style="display:flex;gap:6px"><input type="text" id="nText" maxlength="200" placeholder="예: 어머님 통화 · 숙제 양 조절 요청" style="flex:1;min-width:0"><button type="button" class="sub primary" data-m="nadd" data-id="' + m.id + '" style="flex:none;min-width:0;padding:0 12px">적기</button></div>' +
      notes.map(function (n) { return '<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span style="flex:none;color:var(--muted);width:38px">' + md(n.date) + '</span><span style="flex:1;min-width:0">' + esc(n.text) + '</span><button type="button" data-m="ndel" data-id="' + m.id + '" data-v="' + n.id + '" aria-label="삭제" style="flex:none;border:0;background:none;color:#9AA0AD;font-size:16px;cursor:pointer">×</button></div>'; }).join('') + '</div></details>' +
      '<details><summary style="font-size:13.5px;font-weight:700;cursor:pointer">출결 기록 (최근 ' + recs.length + '일)</summary><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">' +
      (recs.length ? recs.map(function (d) { var k = mark(m, d); return '<span class="chip" style="cursor:default;' + (k === '결석' ? 'color:#C2410C' : k === '지각' ? 'color:#B45309' : '') + '">' + md(d) + ' ' + k + '</span>'; }).join('') : '<span style="font-size:13px;color:var(--muted)">아직 없어요</span>') + '</div><p style="font-size:12px;color:var(--muted);margin:8px 0 0">출결 고치기는 출결 탭에서 날짜를 골라 바꿔요.</p></details>' +
      '<details><summary style="font-size:13.5px;font-weight:700;cursor:pointer">수납 내역 ' + pays.length + '건</summary><div style="margin-top:8px;font-size:13.5px">' +
      (pays.length ? pays.map(function (q) { return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)"><span>' + md(q.date) + ' · ' + (q.mon ? (+q.mon.slice(5)) + '월 수강료' : esc(q.pass || '')) + '</span><b>' + won(q.price) + ' <small style="font-weight:500;color:var(--muted)">' + esc(q.pay || '') + '</small></b></div>'; }).join('') : '<span style="color:var(--muted)">없어요</span>') + '</div></details>' +
      '<div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="sub" data-m="edit" data-id="' + m.id + '">정보 고치기</button><button type="button" class="sub" data-m="quit" data-id="' + m.id + '">' + (m.quit ? '다시 수강' : '퇴원 처리') + '</button></div>' +
      '<div class="row" style="display:flex;gap:8px"><button type="button" class="sub" data-m="del" data-id="' + m.id + '" style="color:#C2410C">원생 삭제</button><button type="button" class="sub" data-m="close">닫기</button></div>');
  }
  var find = function (id) { return DB.members.filter(function (m) { return m.id === id; })[0]; };

  /* ---------- AI 문자: 만들기 화면의 '학부모 문자'로 연결 ---------- */
  function goSms(topic, info, rec) {
    closeDlg(); showTab('make');
    window.alajoomRecipient = rec || null;
    var b = document.querySelector('.tool[data-tool="sms"]'); if (b) b.click();
    setTimeout(function () {
      var c = document.querySelector('#panel .chip[data-k="topic"][data-v="' + topic + '"]'); if (c) c.click();
      var d = document.getElementById('detail'); if (d) d.value = info;
      var p = document.getElementById('panel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('내용을 채웠어요. 만들기만 누르세요');
    }, 80);
  }
  function sms(m) {
    var s = status(m), mon = MON();
    var topic = s.k === 'renew' ? '수강료 안내' : s.k === 'away' ? '결석 연락' : '수업 내용 알림';
    var info = '받는 분: ' + m.name + ' 학생 학부모님' + (s.k === 'renew' ? ' / ' + (+mon.slice(5)) + '월 수강료 ' + won(m.fee) + ' / 납부일 ' + (m.payDay || 1) + '일' : '') + (s.k === 'away' ? ' / 최근 결석이 있어요' : '');
    goSms(topic, info, { name: m.name + ' 학부모님', phone: m.phone || '' });
  }

  /* ---------- 엑셀(CSV) ---------- */
  var COLS = ['이름', '학년', '학부모 연락처', '학생 연락처', '반', '월 수강료', '납부일', '등록일', '퇴원일', '마지막출석', '출석일', '메모'];
  function exportCsv() {
    var q = function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var rows = [COLS].concat(DB.members.map(function (m) { return [m.name, m.grade, m.phone, m.sphone, clsNames(m).join(' / '), m.fee, m.payDay, m.start, m.quit || '', lastAtt(m) || '', (m.att || []).slice().sort().join(' '), m.memo]; }));
    var csv = '﻿' + rows.map(function (r) { return r.map(q).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = '학원메이트_원생_' + ymd() + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    toast('엑셀 파일로 내보냈어요');
  }
  function copy(text) {
    var ok = function () { toast('복사했어요. 문자·카톡에 붙여 넣으세요'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { prompt('복사해서 쓰세요', text); });
    else prompt('복사해서 쓰세요', text);
  }

  /* ---------- 이벤트 ---------- */
  function onClick(e) {
    var t = e.target.closest('[data-m]'); if (!t) return;
    var a = t.dataset.m, id = t.dataset.id, m = id && find(id);
    if (a === 'filter') { view.filter = t.dataset.v; view.sub = 'list'; render(); return; }
    if (a === 'sub') { view.sub = t.dataset.v; render(); return; }
    if (a === 'close') return closeDlg();
    if (a === 'copy') return copy(t.dataset.v);
    if (a === 'mon') { view.mon = shiftMon(view.mon, +t.dataset.v); render(); return; }
    if (a === 'pmon') { view.pmon = shiftMon(view.pmon, +t.dataset.v); render(); return; }
    if (a === 'day') { view.day = addDays(view.day, +t.dataset.v); render(); return; }
    if (a === 'pick') { t.parentNode.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', b === t); }); var hid = $('#m' + t.dataset.n.charAt(0).toUpperCase() + t.dataset.n.slice(1), dlg); if (hid) hid.value = t.dataset.v; return; }
    if (a === 'mcls') { t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') !== 'true'); return; }
    /* 시간표 */
    if (a === 'cnew') return classForm(null);
    if (a === 'cedit') { var cc = DB.classes.filter(function (x) { return x.id === id; })[0]; if (cc) classForm(cc); return; }
    if (a === 'cday') { t.parentNode.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', b === t); }); $('#cDay', dlg).value = t.dataset.v; return; }
    if (a === 'cdel') { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '정말 삭제?'; return; } DB.classes = DB.classes.filter(function (x) { return x.id !== id; }); DB.members.forEach(function (x) { x.cls = (x.cls || []).filter(function (c) { return c !== id; }); }); save(); closeDlg(); render(); toast('반을 지웠어요'); return; }
    if (a === 'csave') {
      var nm = $('#cName', dlg).value.trim(), tm = $('#cTime', dlg).value; if (!nm || !tm) { toast('시간과 반 이름을 적어주세요'); return; }
      var rec = { day: +$('#cDay', dlg).value, time: tm, name: nm, cap: num($('#cCap', dlg).value), teacher: $('#cTeacher', dlg).value.trim() };
      if (id) { var ex = DB.classes.filter(function (x) { return x.id === id; })[0]; Object.keys(rec).forEach(function (k) { ex[k] = rec[k]; }); }
      else {
        var ds = [rec.day];
        if ($('#cMWF', dlg) && $('#cMWF', dlg).checked) ds = ds.concat([0, 2, 4]);
        if ($('#cTT', dlg) && $('#cTT', dlg).checked) ds = ds.concat([1, 3]);
        ds.filter(function (d, i) { return ds.indexOf(d) === i; }).forEach(function (d) { DB.classes.push(Object.assign({}, rec, { id: uid(), day: d })); });
      }
      save(); closeDlg(); view.sub = 'cls'; render(); toast('시간표에 저장했어요'); return;
    }
    /* 장부 */
    if (a === 'bnew') return bookForm();
    if (a === 'bdel') { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '삭제?'; t.style.color = '#C2410C'; t.style.fontSize = '12px'; return; } DB.book = DB.book.filter(function (b) { return b.id !== id; }); save(); render(); toast('지웠어요'); return; }
    if (a === 'bsave') {
      var amt = num($('#bAmt', dlg).value), what = $('#bWhat', dlg).value.trim(); if (!what || !amt) { toast('내용과 금액을 적어주세요'); return; }
      var bd = $('#bDate', dlg).value || ymd();
      DB.book.push({ id: uid(), date: bd, type: $('#mBtype', dlg).value, what: what, amount: amt, pay: $('#mPay', dlg).value });
      save(); closeDlg(); view.sub = 'book'; view.mon = bd.slice(0, 7); render(); toast('장부에 적었어요'); return;
    }
    /* 수납 */
    if (a === 'pay' && m) return payForm(m);
    if (a === 'pay-save' && m) {
      var pm = t.dataset.v, pa = num($('#pAmt', dlg).value); if (!pa) { toast('금액을 적어주세요'); return; }
      m.pays = (m.pays || []).filter(function (q) { return q.mon !== pm; }); m.pays.push({ date: $('#pDate', dlg).value || ymd(), mon: pm, price: pa, pay: $('#mPay', dlg).value });
      save(); closeDlg(); render(); toast(m.name + ' ' + (+pm.slice(5)) + '월 수강료 납부 · 장부에 적었어요'); return;
    }
    if (a === 'unpay' && m) { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '정말?'; return; } m.pays = (m.pays || []).filter(function (q) { return q.mon !== view.pmon; }); save(); render(); toast('납부를 취소했어요'); return; }
    /* 출결 */
    if (a === 'mark' && m) {
      var d = view.day, v = t.dataset.v; if (mark(m, d) === v) v = '';
      setMark(m, d, v); m.inT = m.inT || {}; if (v === '출석' || v === '지각') { if (!m.inT[d] && d === ymd()) m.inT[d] = hm(); } else delete m.inT[d];
      save(); render(); return;
    }
    if (a === 'out' && m) { var body = '[' + shop() + '] ' + who(m) + ' ' + hm() + ' 수업 마치고 하원했어요.'; if ((m.phone || '').replace(/[^0-9]/g, '')) location.href = smsHref(m.phone, body); else copy(body); return; }
    if (a === 'note') { var nc = DB.classes.filter(function (x) { return x.id === id; })[0]; if (nc) noteForm(nc); return; }
    if (a === 'note-copy') { var c1 = DB.classes.filter(function (x) { return x.id === id; })[0]; if (c1) copy(noteText(c1)); return; }
    if (a === 'note-ai') { var c2 = DB.classes.filter(function (x) { return x.id === id; })[0]; if (!c2) return; var txt = noteText(c2); goSms('수업 내용 알림', txt.replace(/^\[[^\]]*\]\s*/, '반 전체 학부모님께 · '), null); return; }
    /* 원생 */
    if (a === 'new') return form(null);
    if (a === 'open' && m) return detail(m);
    if (a === 'edit' && m) return form(m);
    if (a === 'sms' && m) return sms(m);
    if (a === 'export') return exportCsv();
    if (a === 'nadd' && m) { var tx = $('#nText', dlg).value.trim(); if (!tx) { toast('상담 내용을 적어주세요'); return; } m.notes = m.notes || []; m.notes.push({ id: uid(), date: ymd(), text: tx }); save(); detail(m); toast('상담 기록을 적었어요'); return; }
    if (a === 'ndel' && m) { m.notes = (m.notes || []).filter(function (n) { return n.id !== t.dataset.v; }); save(); detail(m); return; }
    if (a === 'quit' && m) { m.quit = m.quit ? '' : ymd(); save(); render(); detail(m); toast(m.quit ? m.name + ' 퇴원 처리했어요' : m.name + ' 다시 수강으로 바꿨어요'); return; }
    if (a === 'att' && m) {
      var td = ymd(); if (mark(m, td)) { setMark(m, td, ''); if (m.inT) delete m.inT[td]; toast(m.name + ' 오늘 출석을 취소했어요'); }
      else { setMark(m, td, '출석'); m.inT = m.inT || {}; m.inT[td] = hm(); toast(m.name + ' 출석 · 출결 탭에서 등원 알림을 보낼 수 있어요'); }
      save(); render(); return;
    }
    if (a === 'del' && m) { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '한 번 더 누르면 삭제'; return; } DB.members = DB.members.filter(function (x) { return x.id !== id; }); save(); closeDlg(); render(); toast('원생을 삭제했어요'); return; }
    if (a === 'save') {
      var name = $('#mName', dlg).value.trim(); if (!name) { toast('이름을 적어주세요'); $('#mName', dlg).focus(); return; }
      var cls = Array.prototype.map.call(dlg.querySelectorAll('[data-m="mcls"][aria-pressed="true"]'), function (b) { return b.dataset.v; });
      var r2 = { name: name, grade: $('#mGrade', dlg).value, phone: $('#mPhone', dlg).value.trim(), sphone: $('#mSphone', dlg).value.trim(), cls: cls, fee: num($('#mFee', dlg).value), payDay: Math.min(31, Math.max(1, num($('#mPayDay', dlg).value) || 1)), start: $('#mStart', dlg).value || ymd(), memo: $('#mMemo', dlg).value.trim() };
      if (id) { Object.keys(r2).forEach(function (k) { m[k] = r2[k]; }); save(); render(); detail(m); toast('고쳤어요'); return; }
      Object.assign(r2, { id: uid(), created: ymd(), att: [], abs: {}, pays: [], notes: [] });
      DB.members.push(r2); save(); closeDlg(); view.filter = 'all'; view.sub = 'list'; render(); toast(name + ' 등록했어요' + (r2.fee ? ' · 매월 ' + r2.payDay + '일 수납을 챙겨 드려요' : '')); return;
    }
  }

  /* ---------- 탭 ---------- */
  function showTab(k) {
    document.querySelectorAll('.mtab').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === k); });
    ['home', 'make', 'members', 'works'].forEach(function (v) { var el = $('#v-' + v); if (el) el.classList.toggle('hidden', v !== k); });
    if (k === 'members') render();
    try { window.dispatchEvent(new CustomEvent('alajoom:tab', { detail: k })); } catch (e) {}
    try { sessionStorage.setItem('al_pil_tab', k); } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.alajoomTab = showTab;
  window.alajoomOpenAtt = function () { view.sub = 'att'; view.day = ymd(); showTab('members'); };
  /* 오늘 화면(대시보드)용 */
  window.alajoomMemberStats = function () {
    var t = ymd(), mon = MON(), ms = DB.members, sales = 0;
    bookRows(mon).forEach(function (r) { if (r.type !== '지출') sales += +r.amount || 0; });
    var renew = ms.filter(function (m) { return status(m).k === 'renew'; }).map(function (m) { var s = status(m); return { id: m.id, name: m.name, tag: s.label, desc: (+mon.slice(5)) + '월 수강료 ' + won(m.fee) + ' · ' + (+s.due.slice(8)) + '일' }; });
    var away = ms.filter(function (m) { return status(m).k === 'away'; }).map(function (m) { return { id: m.id, name: m.name, last: lastAtt(m) }; });
    return { total: ms.length, active: ms.filter(function (m) { return status(m).k !== 'end'; }).length, today: ms.filter(function (m) { return (m.att || []).indexOf(t) >= 0; }).length, sales: sales, renew: renew, away: away, news: ms.filter(function (m) { return (m.created || '').slice(0, 7) === mon; }).length };
  };
  window.alajoomMemberSms = function (id) { var m = find(id); if (m) sms(m); };
  window.alajoomFindMember = function (name) {
    var hits = DB.members.filter(function (m) { return m.name === name; });
    if (!hits.length) hits = DB.members.filter(function (m) { return name && (m.name.indexOf(name) >= 0 || name.indexOf(m.name) >= 0); });
    return hits.length === 1 ? { name: hits[0].name + ' 학부모님', phone: hits[0].phone || '' } : null;
  };
  /* 말로 시키기: "김지은 출석" */
  window.alajoomAttend = function (name) {
    var hits = DB.members.filter(function (m) { return m.name === name; });
    if (!hits.length) hits = DB.members.filter(function (m) { return m.name.indexOf(name) >= 0 || name.indexOf(m.name) >= 0; });
    if (!hits.length) return name + ' 학생을 원생 장부에서 찾지 못했어요';
    if (hits.length > 1) return name + ' 학생이 ' + hits.length + '명이에요. 원생 장부에서 직접 눌러 주세요';
    var m = hits[0], td = ymd();
    if (mark(m, td) === '출석' || mark(m, td) === '지각') return m.name + ' 학생은 오늘 이미 출석했어요';
    setMark(m, td, '출석'); m.inT = m.inT || {}; m.inT[td] = hm(); save(); render();
    return m.name + ' 출석 완료 · 출결 탭에서 등원 알림을 보낼 수 있어요';
  };
  function init() {
    var box = $('#v-members'); if (!box) return;
    box.addEventListener('click', onClick);
    box.addEventListener('input', function (e) { if (e.target.id === 'mbQ') { view.q = e.target.value.trim(); var pos = e.target.selectionStart; render(); var q = $('#mbQ'); q.focus(); try { q.setSelectionRange(pos, pos); } catch (er) {} } });
    document.querySelectorAll('.mtab').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.tab); }); });
    var mt = location.search.match(/[?&]tab=(members|works|make)/);
    var k = mt ? mt[1] : (function () { try { return sessionStorage.getItem('al_pil_tab'); } catch (e) { return null; } })();
    showTab(k === 'members' || k === 'works' || k === 'make' ? k : 'home');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
