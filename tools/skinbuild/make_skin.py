import re, os
src = open('/home/claude/alajoom-site/pilates/index.html', encoding='utf-8').read()
s = src
def rep(a, b, count=None):
    global s
    n = s.count(a)
    assert n > 0, ('missing', a[:90])
    if count is not None: assert n == count, ('count', n, a[:90])
    s = s.replace(a, b)

# CFG 통째로 교체
i = s.index('var CFG = {'); j = s.index('\n};\n', i) + 4
s = s[:i] + open('/home/claude/skinbuild/cfg_skin.js', encoding='utf-8').read() + s[j:]

# 색: 로즈핑크
rep("--blue:#3B5B92; --blue-deep:#2E4877; --blue-tint:#E6ECF5;", "--blue:#B83C66; --blue-deep:#8F2C4E; --blue-tint:#FBE7EE;")
s = s.replace('#2E4877', '#8F2C4E').replace('#3B5B92', '#B83C66').replace('#E6ECF5', '#FBE7EE')

# 머리
rep('<title>필라테스메이트</title>', '<title>스킨메이트</title>')
rep('/pilates/manifest.webmanifest', '/skin/manifest.webmanifest')
rep('/assets/apple-touch-pilates.png', '/assets/apple-touch-skin.png')
rep('content="필라테스메이트"', 'content="스킨메이트"')
rep('<script src="/pilates/members.js?v=11121526" defer></script>', '<script src="/skin/customers.js?v=11181500" defer></script>')
s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="피부관리샵 원장님 AI 직원 — 홍보글·고객 문자·리뷰 답글·고객 장부·예약">', s)
s = s.replace('icon-pilates', 'icon-skin')
rep('<b>필라테스메이트</b><small>알아줌 · 필라테스·요가 원장님 AI 직원</small>', '<b>스킨메이트</b><small>알아줌 · 피부관리·에스테틱 원장님 AI 직원</small>')
# 아이콘(물방울)
rep('<circle cx="12" cy="5" r="2"/><path d="M12 7v6M8 21l4-8 4 8M6 11h12"/>', '<path d="M12 3c3.5 4.2 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.5-6.8 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>')
rep('aria-label="필라테스메이트 메뉴"', 'aria-label="스킨메이트 메뉴"')
rep('data-tab="members" aria-selected="false">회원 장부</button>', 'data-tab="members" aria-selected="false">고객 장부</button>')
rep('"회원들한테 할인 이벤트 카톡으로 알려줘" · "김지은 출석"', '"단골 고객들한테 이벤트 카톡으로 알려줘" · "김지은 방문"')
rep('<span>시간표·체험·휴강 이미지</span>', '<span>메뉴·가격·이벤트·휴무 이미지</span>')
rep('<b>회원 문자</b><span>재등록·리마인드·안부</span>', '<b>고객 문자</b><span>예약 확인·재방문·안부</span>')
# 샵 정보 창
rep('<h2>스튜디오 정보</h2>', '<h2>샵 정보</h2>')
rep('>스튜디오 이름<input', '>샵 이름<input')
rep('placeholder="예: 망원동"', 'placeholder="예: 연남동"')
rep('>대표 수업<input type="text" id="fClass" maxlength="60" placeholder="예: 1:1 기구 필라테스, 4인 그룹">', '>대표 관리<input type="text" id="fClass" maxlength="60" placeholder="예: 수분 관리, 진정 관리, 왁싱">')
rep('placeholder="예: 원장 직강, 산후 회복 클래스"', 'placeholder="예: 1인 원장 직접 관리, 프라이빗 룸"')
rep('placeholder="예: 인스타 DM, 네이버 예약"', 'placeholder="예: 카카오톡 채널, 네이버 예약"')
rep("'스튜디오 이름을 적어주세요'", "'샵 이름을 적어주세요'")
rep("['sms','회원 문자']", "['sms','고객 문자']")
rep("sms:'회원 문자'", "sms:'고객 문자'")

# 말로 시키기
rep("// 회원 출석: \"김지은 출석\", \"김지은 님 출석 체크\"", "// 고객 방문: \"김지은 방문\", \"김지은 님 왔어\"")
rep(r"var at = t.match(/^([가-힣]{2,4})\s*(님|씨|회원님?)?\s*(오늘\s*)?출석/);", r"var at = t.match(/^([가-힣]{2,4})\s*(님|씨|고객님?)?\s*(오늘\s*)?(방문|출석|왔어|왔음|관리\s*완료)/);")
rep("회원(님)?들|단골/.test(t)", "고객(님)?들|회원(님)?들|단골/.test(t)")
rep("/카드|포스터|시간표/.test(t)", "/카드|포스터|가격표|메뉴판/.test(t)")
i = s.index("    var KW = {"); j = s.index("    };", i) + 6
s = s[:i] + r"""    var KW = {
      '이달의 관리':/이달|이번\s*달|추천/, '신규 고객 이벤트':/이벤트|할인|신규|처음|선물/, '관리 메뉴 소개':/메뉴|가격|관리\s*소개/, '홈케어 팁':/팁|홈케어|집에서|보습/, '원장 소개':/원장\s*소개|소개/, '휴무·일정 안내':/휴무|일정|쉬어|쉽니다|공휴일/,
      '예약 확인':/예약\s*확인|내일|리마인드/, '관리 후 안부':/관리\s*후|오늘\s*관리|수고/, '재방문 안내':/재방문|오랜만|안부|안\s*오/, '재등록 안내':/재등록|만료|끝나|연장|관리권/, '신규 고객 환영':/환영|처음\s*오신|새로\s*오신/, '생일 축하':/생일/, '휴무 안내':/휴무|쉬어|쉽니다|쉬는/, '이벤트·소식 알림':/이벤트|할인|소식|오픈|알려|알림|공지/,
      '관리 메뉴·가격':/메뉴|가격/, '이벤트':/이벤트|할인/, '예약 가능 시간':/예약\s*가능|빈\s*시간|시간/, '휴무 안내':/휴무/,
      '좋은 리뷰':/좋은|칭찬|감사/, '아쉬운 리뷰':/아쉬|불만|안\s*좋|별로|나쁜/
    };""" + s[j:]
rep("else toast('회원 장부를 먼저 열어 주세요')", "else toast('고객 장부를 먼저 열어 주세요')")
rep("/* ---------- 회원 문자: 카톡·문자 앱으로 보내기 ---------- */", "/* ---------- 고객 문자: 카톡·문자 앱으로 보내기 ---------- */")
rep("var WKEY = 'al_pilates_works_v1'", "var WKEY = 'al_skin_works_v1'")

# 오늘 화면
rep("card(st.today + '명', '오늘 출석', 'members', false) + card(st.active + '명', '수강 중', 'members', false)", "card(st.today + '명', '오늘 방문', 'members', false) + card(st.active + '명', '관리 중', 'members', false)")
rep('font-size:16px">오늘 수업</h2>', 'font-size:16px">오늘 예약</h2>')
rep("min-height:36px\">시간표 ' + (tc.length ? '보기' : '만들기') + '</button>", "min-height:36px\">예약 ' + (tc.length ? '보기' : '적기') + '</button>")
rep("(c.cap ? '<small style=\"display:block;color:var(--muted);font-size:11.5px\">정원 ' + c.cap + '명</small>' : '')", "(c.what ? '<small style=\"display:block;color:var(--muted);font-size:11.5px\">' + esc(c.what) + '</small>' : '')")
rep("시간표를 적어 두면 오늘 수업이 여기 보여요.", "예약을 적어 두면 오늘 예약이 여기 보여요.")
rep("'</b>님 · 마지막 출석 ' + md(m.last)", "'</b>님 · 마지막 방문 ' + md(m.last)")
rep("qa('data-hvoice=\"1\"', '말로 시키기', '\"김지은 출석\"') + qa('data-home=\"members\"', '출석 체크', '회원 장부 열기')", "qa('data-hvoice=\"1\"', '말로 시키기', '\"김지은 방문\"') + qa('data-home=\"members\"', '방문 기록', '고객 장부 열기')")
rep("window.alajoomFeedback(\\'pilates\\')", "window.alajoomFeedback(\\'skin\\')")
rep("t.dataset.v === '이번 주 시간표' && window.alajoomWeekSchedule", "t.dataset.v === '관리 메뉴·가격' && window.alajoomWeekSchedule")
rep("toast('시간표를 넣었어요')", "toast('시술 메뉴를 넣었어요')")
rep("/* 스튜디오 정보 */", "/* 샵 정보 */")
rep("/* 로그인 회원의 가게 정보(서버) ↔ 이 화면 */", "/* 로그인 고객의 가게 정보(서버) ↔ 이 화면 */".replace('고객', '회원'))

os.makedirs('/home/claude/alajoom-site/skin', exist_ok=True)
open('/home/claude/alajoom-site/skin/index.html', 'w', encoding='utf-8').write(s)
open('/home/claude/alajoom-site/skin/customers.js', 'w', encoding='utf-8').write(open('/home/claude/skinbuild/customers.js', encoding='utf-8').read())
print('ok')
left = [l.strip()[:140] for l in s.split('\n') if re.search('필라테스|수강|출석|수업|스튜디오|pilates|시간표|강사|휴강', l)]
print('\n'.join(left))
s = open('/home/claude/alajoom-site/skin/index.html', encoding='utf-8').read()
a = '예: "다음 주 휴강이라고 블로그 글 써줘", "김지은 님한테 재등록 카톡 보내줘"'
assert a in s
s = s.replace(a, '예: "다음 주 휴무라고 블로그 글 써줘", "김지은 님한테 재방문 카톡 보내줘"')
open('/home/claude/alajoom-site/skin/index.html', 'w', encoding='utf-8').write(s)
