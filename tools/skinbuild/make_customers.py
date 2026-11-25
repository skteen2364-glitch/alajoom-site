import re
src = open('/home/claude/alajoom-site/pilates/members.js', encoding='utf-8').read()
s = src

def rep(a, b, count=None):
    global s
    n = s.count(a)
    assert n > 0, ('missing', a[:80])
    if count is not None:
        assert n == count, ('count', n, a[:80])
    s = s.replace(a, b)

# ---- 머리 ----
rep("""/* 필라테스메이트 · 회원 장부 (고객관리)
   회원·수강권·출석·결제를 이 기기(브라우저)에 저장. 엑셀(CSV)로 내보내기/불러오기. */""",
"""/* 스킨메이트 · 고객 장부
   고객·관리권(회차)·방문·시술 기록·예약·시술 메뉴·매출. 로그인하면 계정에 저장(뷰티 메이트끼리 같이 씀). */""")
rep("var KEY = 'al_pilates_members_v1';", "var KEY = 'al_beauty_customers_v1';")
rep("var PASSES = ['1:1 기구', '2:1 듀엣', '4인 그룹', '매트 그룹', '체험'];",
    "var DEF_MENU = [{ id: 'm1', name: '기본 얼굴 관리', price: 70000, mins: 60 }, { id: 'm2', name: '수분 관리', price: 90000, mins: 70 }, { id: 'm3', name: '진정 관리', price: 90000, mins: 70 }, { id: 'm4', name: '등 관리', price: 80000, mins: 60 }, { id: 'm5', name: '왁싱', price: 30000, mins: 30 }];\n  var PASSES = [];")
# DB 기본값 + 동기화 키
rep("return JSON.parse(localStorage.getItem(KEY)) || { members: [] }; } catch (e) { return { members: [] }; }",
    "return JSON.parse(localStorage.getItem(KEY)) || { members: [] }; } catch (e) { return { members: [] }; }")
rep("window.alajoomSaved('members', DB)", "window.alajoomSaved('customers', DB)")
rep("window.alajoomSync({ keys: ['members'],", "window.alajoomSync({ keys: ['customers'],")
rep("DB = d; DB.book = DB.book || []; DB.classes = DB.classes || [];", "DB = d; fixDB();")
rep("toast('계정에 저장된 회원 장부를 불러왔어요')", "toast('계정에 저장된 고객 장부를 불러왔어요')")
rep("""  DB.book = DB.book || [];
  DB.classes = DB.classes || [];""",
"""  function fixDB() { DB.book = DB.book || []; DB.rsv = DB.rsv || []; DB.menu = DB.menu && DB.menu.length ? DB.menu : DEF_MENU.slice(); PASSES = DB.menu.map(function (x) { return x.name; }).concat(['1회 관리']); }
  fixDB();""")

# 상태: 피부관리는 한 달 주기라 '오래 안 옴'을 35일로
rep("if (la && days(la, t) >= 21) return { k: 'away', label: '오래 안 옴', c: '#2E4877' };",
    "if (la && days(la, t) >= 35) return { k: 'away', label: '오래 안 옴', c: '#8F2C4E' };")
rep("return { k: 'ok', label: '수강 중', c: '#15803D' };", "return { k: 'ok', label: '관리 중', c: '#15803D' };")

# ---- 예약 (요일 시간표 대신 날짜별 예약) ----
start = s.index("  function sortedClasses()")
end = s.index("  /* ---------- 회원 상세 / 등록 ---------- */")
s = s[:start] + r"""  function sortedRsv() { return DB.rsv.slice().sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }); }
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
    var h = '<p style="margin:0 0 12px;font-size:13px;color:var(--muted)">시술 메뉴를 적어 두면 관리권·예약 고르기, <b>가격표 카드</b>, 홍보글에 자동으로 들어가요. 하는 시술이 여러 가지면 모두 넣으세요(왁싱·속눈썹·네일도 좋아요).</p>';
    h += '<button type="button" class="go" data-m="mnew" style="justify-content:center;margin:0 0 12px;width:100%">+ 시술 추가</button>';
    h += '<div style="display:flex;flex-direction:column;gap:6px">' + DB.menu.map(function (x) {
      return '<button type="button" data-m="medit" data-id="' + x.id + '" style="display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px 14px;font:inherit;text-align:left;cursor:pointer"><span style="flex:1;min-width:0;font-size:15px;font-weight:800">' + esc(x.name) + (x.mins ? ' <small style="font-weight:500;color:var(--muted)">' + x.mins + '분</small>' : '') + '</span><b style="flex:none">' + (x.price ? won(x.price) : '-') + '</b></button>';
    }).join('') + '</div>';
    box.insertAdjacentHTML('beforeend', h);
  }
  function menuForm(x) {
    var isNew = !x; x = x || { name: '', price: '', mins: 60 };
    openDlg('<h2>' + (isNew ? '시술 추가' : '시술 고치기') + '</h2>' +
      '<label>시술 이름<input type="text" id="xName" maxlength="30" value="' + esc(x.name) + '" placeholder="예: 수분 관리, 브라질리언 왁싱"></label>' +
      '<div style="display:flex;gap:8px"><label style="flex:1">가격(원)<input type="text" id="xPrice" inputmode="numeric" value="' + (x.price || '') + '"></label><label style="flex:1">시간(분)<input type="text" id="xMins" inputmode="numeric" value="' + (x.mins || '') + '"></label></div>' +
      '<p style="margin:0;font-size:12px;color:var(--muted)">이름에 "치료·재생·주름 개선" 같은 효능 표현은 피해 주세요.</p>' +
      '<div class="row" style="display:flex;gap:8px">' + (isNew ? '' : '<button type="button" class="sub" data-m="mdel" data-id="' + x.id + '" style="color:#C2410C">삭제</button>') + '<button type="button" class="sub" data-m="close">취소</button><button type="button" class="sub primary" data-m="msave" data-id="' + (isNew ? '' : x.id) + '">저장</button></div>');
  }
  /* 오늘 화면·카드용 */
  window.alajoomTodayClasses = function () { var t = ymd(); return sortedRsv().filter(function (r) { return r.date === t; }).map(function (r) { return { time: r.time, name: r.name + '님', cap: 0, what: r.what }; }); };
  window.alajoomWeekSchedule = function () { return DB.menu.map(function (x) { return x.name + (x.price ? ' ' + won(x.price) : ''); }).join(' / '); };
  window.alajoomMenuList = function () { return DB.menu.slice(); };
""" + s[end:]
rep("/* ---------- 회원 상세 / 등록 ---------- */", "/* ---------- 고객 상세 / 등록 ---------- */")
rep("  /* ---------- 수업 시간표 ---------- */\n  var DOWS = ['월', '화', '수', '목', '금', '토', '일'];\n", "")

# ---- 서브탭 ----
rep("subb('list', '회원') + subb('cls', '시간표') + subb('book', '매출 장부')", "subb('list', '고객') + subb('cls', '예약') + subb('menu', '시술 메뉴') + subb('book', '매출')")
rep("if (view.sub === 'cls') { box.innerHTML = top; renderClasses(box); return; }",
    "if (view.sub === 'cls') { box.innerHTML = top; renderClasses(box); return; }\n    if (view.sub === 'menu') { box.innerHTML = top; renderMenu(box); return; }")

# ---- 목록 문구 ----
rep("stat(active.length, '수강 중', 'all')", "stat(active.length, '관리 중', 'all')")
rep(">오늘 출석 <b", ">오늘 방문 <b")
rep("data-m=\"new\" style=\"flex:none;min-width:0;padding:0 16px\">+ 회원</button>", "data-m=\"new\" style=\"flex:none;min-width:0;padding:0 16px\">+ 고객</button>")
rep("aria-label=\"회원 보기\"", "aria-label=\"고객 보기\"")
rep("chip('all', '수강 중')", "chip('all', '관리 중')")
rep("chip('end', '끝난 회원')", "chip('end', '관리권 끝남')")
rep("아직 등록한 회원이 없어요", "아직 등록한 고객이 없어요")
rep("회원을 등록하면 남은 횟수·만료일을 알아서 챙겨 드려요.", "고객과 관리권을 등록하면 남은 횟수·재방문 시기를 알아서 챙겨 드려요.")
rep("첫 회원 등록하기", "첫 고객 등록하기")
rep("해당하는 회원이 없어요", "해당하는 고객이 없어요")
rep("로그인하면 회원 장부가", "로그인하면 고객 장부가")
# 카드
rep("esc(m.pass || '수강권')", "esc(m.pass || '관리권')")
rep("(done ? '출석 ✓' : '출석')", "(done ? '방문 ✓' : '방문')")
rep("background:' + (s.k === 'renew' ? '#F97316' : '#2E4877') + '", "background:' + (s.k === 'renew' ? '#F97316' : 'var(--blue)') + '")
# 매출 장부 자동 행
s = s.replace("(p.pass || '수강권')", "(p.pass || '관리권')")
# 폼
rep("'새 회원 등록' : '회원 정보 고치기'", "'새 고객 등록' : '고객 정보 고치기'")
s = s.replace("'<label>수강권</label>' + chips('pass', PASSES, m.pass)", "'<label>관리권</label>' + chips('pass', PASSES, m.pass)")
rep("placeholder=\"예: 550000\" value=\"\"", "placeholder=\"예: 600000\" value=\"\"")
rep("placeholder=\"예: 평일 저녁 선호, 목표는 바른 자세\"", "placeholder=\"예: 건성, 주말 오전 선호, 향 약한 제품\"")
rep("건강 상태 같은 민감한 정보는 꼭 필요한 만큼만 적어 주세요.", "피부 고민·알레르기 같은 민감한 정보는 고객 동의를 받고 꼭 필요한 만큼만 적어 주세요.")
# 상세
rep(">마지막 출석</span>", ">마지막 방문</span>")
rep("""'<details><summary style="font-size:13.5px;font-weight:700;cursor:pointer">출석 기록 ' + atts.length + '회</summary><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">' +
      (atts.length ? atts.map(function (d) { return '<button type="button" class="chip" data-m="unatt" data-id="' + m.id + '" data-v="' + d + '" title="눌러서 취소">' + md(d) + ' ×</button>'; }).join('') : '<span style="font-size:13px;color:var(--muted)">아직 없어요</span>') +
      '</div><p style="font-size:12px;color:var(--muted);margin:8px 0 0">날짜를 누르면 그 출석을 취소해요.</p></details>' +""",
"""'<details open><summary style="font-size:13.5px;font-weight:700;cursor:pointer">시술 기록 ' + atts.length + '회</summary><div style="display:flex;flex-direction:column;margin-top:6px">' +
      (atts.length ? atts.map(function (d) { var vn = (m.vn || {})[d] || ''; return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)"><b style="flex:none;min-width:44px;font-size:13.5px">' + md(d) + '</b><span style="flex:1;min-width:0;font-size:13.5px;color:' + (vn ? 'var(--ink)' : 'var(--muted)') + '">' + (vn ? esc(vn) : '시술 내용 없음') + '</span><button type="button" class="sub" data-m="vnote" data-id="' + m.id + '" data-v="' + d + '" style="flex:none;min-width:0;min-height:36px;padding:0 10px;font-size:12.5px">' + (vn ? '고치기' : '적기') + '</button><button type="button" class="sub" data-m="unatt" data-id="' + m.id + '" data-v="' + d + '" aria-label="' + md(d) + ' 방문 취소" style="flex:none;min-width:36px;min-height:36px;padding:0;font-size:13px">×</button></div>'; }).join('') : '<span style="font-size:13px;color:var(--muted)">아직 없어요</span>') +
      '</div><p style="font-size:12px;color:var(--muted);margin:8px 0 0">그날 받은 시술·사용 제품·피부 상태를 적어 두면 다음 관리 때 바로 봐요.</p></details>' +""")
rep(">회원 삭제<", ">고객 삭제<")
# 문자 연결
rep("topic = s.k === 'renew' || s.k === 'end' ? '재등록 안내' : s.k === 'away' ? '오랜만에 안부' : '내일 수업 리마인드';",
    "topic = s.k === 'renew' || s.k === 'end' ? '재등록 안내' : s.k === 'away' ? '재방문 안내' : '관리 후 안부';")
rep("var info = '회원 이름: ' + m.name + ' / 수강권: '", "var info = '고객 이름: ' + m.name + ' / 관리권: '")
rep("/* ---------- 문자: 만들기 화면의 '회원 문자'로 연결 ---------- */", "/* ---------- 문자: 만들기 화면의 '고객 문자'로 연결 ---------- */")
# CSV
rep("var COLS = ['이름', '연락처', '수강권', '총횟수', '남은횟수', '시작일', '만료일', '마지막출석', '출석일', '메모'];",
    "var COLS = ['이름', '연락처', '관리권', '총횟수', '남은횟수', '시작일', '만료일', '마지막방문', '방문일', '메모'];")

# ---- 이벤트 ----
rep("""    if (a === 'cedit') { var cc = DB.classes.filter(function (x) { return x.id === id; })[0]; if (cc) classForm(cc); return; }
    if (a === 'cday') { t.parentNode.querySelectorAll('.chip').forEach(function (b) { b.setAttribute('aria-pressed', b === t); }); $('#cDay', dlg).value = t.dataset.v; return; }
    if (a === 'cdel') { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '정말 삭제?'; return; } DB.classes = DB.classes.filter(function (x) { return x.id !== id; }); save(); closeDlg(); render(); toast('수업을 지웠어요'); return; }
    if (a === 'csave') {
      var nm = $('#cName', dlg).value.trim(), tm = $('#cTime', dlg).value; if (!nm || !tm) { toast('시간과 수업 이름을 적어주세요'); return; }
      var rec = { day: +$('#cDay', dlg).value, time: tm, name: nm, cap: num($('#cCap', dlg).value), teacher: $('#cTeacher', dlg).value.trim() };
      if (id) { var ex = DB.classes.filter(function (x) { return x.id === id; })[0]; Object.keys(rec).forEach(function (k) { ex[k] = rec[k]; }); }
      else if ($('#cWeekdays', dlg) && $('#cWeekdays', dlg).checked) { [0, 1, 2, 3, 4].forEach(function (d) { DB.classes.push(Object.assign({}, rec, { id: uid(), day: d })); }); }
      else DB.classes.push(Object.assign({ id: uid() }, rec));
      save(); closeDlg(); view.sub = 'cls'; render(); toast('시간표에 저장했어요'); return;
    }""",
"""    if (a === 'cedit') { var cc = DB.rsv.filter(function (x) { return x.id === id; })[0]; if (cc) classForm(cc); return; }
    if (a === 'cdel') { if (t.dataset.arm !== '1') { t.dataset.arm = '1'; t.textContent = '정말 삭제?'; return; } DB.rsv = DB.rsv.filter(function (x) { return x.id !== id; }); save(); closeDlg(); render(); toast('예약을 지웠어요'); return; }
    if (a === 'csave') {
      var nm = $('#cName', dlg).value.trim(), tm = $('#cTime', dlg).value, dt = $('#cDate', dlg).value; if (!nm || !tm || !dt) { toast('날짜·시간·고객 이름을 적어주세요'); return; }
      var rec = { date: dt, time: tm, name: nm.replace(/\\s*님$/, ''), what: $('#mWhat', dlg).value, memo: $('#cMemo', dlg).value.trim() };
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
    if (a === 'vadd') { var ta = $('#vNote', dlg); if (ta) { ta.value = (ta.value.trim() ? ta.value.trim() + ' · ' : '') + t.dataset.v; ta.focus(); } return; }""")
rep("toast('출석을 취소했어요')", "toast('방문을 취소했어요')")
rep("toast('회원을 삭제했어요')", "toast('고객을 삭제했어요')")
# 'pick' 이벤트가 what 칩도 처리하는지 확인용으로 그대로 둠

# ---- 탭 저장 키, 외부 함수 문구 ----
s = s.replace("al_pil_tab", "al_skin_tab")
rep("if (!hits.length) return name + '님을 회원 장부에서 찾지 못했어요';", "if (!hits.length) return name + '님을 고객 장부에서 찾지 못했어요';")
rep("if (hits.length > 1) return name + '님이 ' + hits.length + '명이에요. 회원 장부에서 직접 눌러 주세요';", "if (hits.length > 1) return name + '님이 ' + hits.length + '명이에요. 고객 장부에서 직접 눌러 주세요';")
rep("return m.name + '님은 오늘 이미 출석했어요';", "return m.name + '님은 오늘 이미 방문 기록이 있어요';")
rep("var l = left(m); return m.name + '님 출석 완료 · 남은 ' + l + '회'", "var l = left(m); return m.name + '님 방문 기록 · 남은 ' + l + '회'")

# ---- 추가 함수: 시술 기록 폼, 예약 확인 문자 ----
rep("  var find = function (id) {", r"""  function noteForm(m, d) {
    var vn = (m.vn || {})[d] || '';
    openDlg('<h2>' + esc(m.name) + '님 · ' + md(d) + ' 시술 기록</h2>' +
      '<label>시술</label>' + '<div class="chips" role="group">' + PASSES.map(function (o) { return '<button type="button" class="chip" data-m="vadd" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
      '<label>내용<textarea id="vNote" maxlength="200" placeholder="예: 수분 관리 · 진정 앰플 사용 · 볼 건조함">' + esc(vn) + '</textarea></label>' +
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
  var find = function (id) {""", count=1)
open('/home/claude/skinbuild/customers.js', 'w', encoding='utf-8').write(s)
print('ok', len(s))

# ---- 남은 문구 ----
s = open('/home/claude/skinbuild/customers.js', encoding='utf-8').read()
for a, b in [
  ("/* 회원 장부·매출 장부를", "/* 고객 장부·매출 장부를"),
  ("매출 장부: 회원 결제는 자동", "매출 장부: 고객 결제는 자동"),
  ("<br>회원을 등록하거나 재등록하면", "<br>고객을 등록하거나 재등록하면"),
  ("(r.auto ? '회원 결제 · 자동'", "(r.auto ? '고객 결제 · 자동'"),
  ("a.download = '필라테스메이트_회원_'", "a.download = '스킨메이트_고객_'"),
  ("toast('읽을 회원이 없어요')", "toast('읽을 고객이 없어요')"),
  ("ix('출석일') >= 0 ? (c[ix('출석일')]", "ix('방문일') >= 0 ? (c[ix('방문일')]"),
  ("pass: c[ix('수강권')] || ''", "pass: c[ix('관리권')] || ''"),
  ("toast(m.name + '님 오늘 출석을 취소했어요')", "toast(m.name + '님 오늘 방문을 취소했어요')"),
  ("toast(m.name + '님 출석 · 남은 '", "toast(m.name + '님 방문 · 남은 '"),
  ("toast('필라테스메이트에서 내보낸 파일을 골라주세요')", "toast('스킨메이트에서 내보낸 파일을 골라주세요')"),
  ("/* 말로 시키기: \"김지은 출석\" */", "/* 말로 시키기: \"김지은 방문\" */"),
]:
    assert a in s, a
    s = s.replace(a, b)
open('/home/claude/skinbuild/customers.js', 'w', encoding='utf-8').write(s)
print('tail ok')
