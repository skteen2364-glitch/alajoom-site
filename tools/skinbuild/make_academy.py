import re, os
B='/home/claude/alajoom-site'
s = open(B+'/pilates/index.html', encoding='utf-8').read()
def rep(a, b, cnt=None):
    global s
    n = s.count(a); assert n > 0, ('missing', a[:80])
    if cnt is not None: assert n == cnt, ('count', n, a[:80])
    s = s.replace(a, b)
i = s.index('var CFG = {'); j = s.index('\n};\n', i) + 4
s = s[:i] + open('/home/claude/skinbuild/cfg_academy.js', encoding='utf-8').read() + s[j:]
# 색: 초록
s = s.replace('#2E4877', '#1F5F45').replace('#3B5B92', '#2A7A57').replace('#E6ECF5', '#E2F2E9')
rep('<title>필라테스메이트</title>', '<title>학원메이트</title>')
rep('/pilates/manifest.webmanifest', '/academy/manifest.webmanifest')
rep('/assets/apple-touch-pilates.png', '/assets/apple-touch-academy.png')
rep('content="필라테스메이트"', 'content="학원메이트"')
s = re.sub(r'<script src="/pilates/members\.js\?v=\w+" defer></script>', '<script src="/academy/students.js?v=11201400" defer></script>', s)
s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="공부방·교습소·학원 원장님 비서 — 원생 모집 홍보글·학부모 문자·후기 답글·원생 장부·출결·시간표">', s)
s = s.replace('icon-pilates', 'icon-academy')
rep('<b>필라테스메이트</b><small>알아줌 · 필라테스·요가 원장님 비서</small>', '<b>학원메이트</b><small>알아줌 · 공부방·교습소·학원 원장님 비서</small>')
rep('<circle cx="12" cy="5" r="2"/><path d="M12 7v6M8 21l4-8 4 8M6 11h12"/>', '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 11.5h5"/>')
rep('aria-label="필라테스메이트 메뉴"', 'aria-label="학원메이트 메뉴"')
rep('data-tab="members" aria-selected="false">회원 장부</button>', 'data-tab="members" aria-selected="false">원생 장부</button>')
rep('"회원들한테 할인 이벤트 카톡으로 알려줘" · "김지은 출석"', '"학부모님들한테 휴원 안내 카톡으로 보내줘" · "김지은 출석"')
rep('<span>시간표·체험·휴강 이미지</span>', '<span>모집·특강·시간표·휴원 이미지</span>')
rep('<b>회원 문자</b><span>재등록·리마인드·안부</span>', '<b>학부모 문자</b><span>수강료·결석·수업 알림</span>')
rep('<h2>스튜디오 정보</h2>', '<h2>학원 정보</h2>')
rep('>스튜디오 이름<input', '>학원 이름<input')
rep('placeholder="예: 망원동"', 'placeholder="예: 목동"')
rep('placeholder="예: 1:1 기구 필라테스, 4인 그룹"', 'placeholder="예: 초등·중등 수학, 4인 소수 정예"')
s = re.sub(r'placeholder="예: 원장 직강[^"]*"', 'placeholder="예: 원장 직강, 개념부터 꼼꼼하게"', s)
s = re.sub(r'placeholder="예: 인스타 DM[^"]*"', 'placeholder="예: 카카오톡 채널, 전화 상담"', s)
rep("'스튜디오 이름을 적어주세요'", "'학원 이름을 적어주세요'")
rep("['sms','회원 문자']", "['sms','학부모 문자']")
rep("sms:'회원 문자'", "sms:'학부모 문자'")
rep("text = text.replace(/\\[(회원|고객|손님)\\s*님?\\]/g", "text = text.replace(/\\[(회원|고객|손님|학부모|원생)\\s*님?\\]/g")
rep("회원(님)?들|단골/.test(t)", "회원(님)?들|학부모(님)?들|원생들|단골/.test(t)")
rep("!/^(단골|손님|회원|고객|우리|다들|모두|여러분|전체|이웃)/", "!/^(단골|손님|회원|고객|학부모|원생|우리|다들|모두|여러분|전체|이웃)/")
i = s.index("    var KW = {"); j = s.index("    };", i) + 6
s = s[:i] + r"""    var KW = {
      '신규 원생 모집':/모집|신규|원생|등록/, '방학 특강 모집':/특강|방학/, '수업 방식 소개':/수업\s*방식|커리|진행/, '원장 소개':/원장\s*소개|선생님\s*소개|소개/, '공부 팁':/팁|공부법|습관/, '휴원·일정 안내':/휴원|일정|쉬어|쉽니다|공휴일/,
      '수강료 안내':/수강료|교습비|납부|원비/, '상담 일정 안내':/상담/, '결석 연락':/결석|안\s*왔|안\s*와/, '수업 내용 알림':/수업\s*내용|숙제|진도|알림장/, '신규 원생 환영':/환영|새로\s*온|처음/, '휴원 안내':/휴원|쉬어|쉽니다|쉬는/, '특강·소식 알림':/특강|소식|알려|알림|공지/,
      '원생 모집':/모집|원생/, '방학 특강':/특강|방학/, '이번 주 시간표':/시간표/, '휴원 안내':/휴원/,
      '좋은 후기':/좋은|칭찬|감사/, '아쉬운 후기':/아쉬|불만|안\s*좋|별로|나쁜/
    };""" + s[j:]
rep("else toast('회원 장부를 먼저 열어 주세요')", "else toast('원생 장부를 먼저 열어 주세요')")
rep("var isCls = /필라테스/.test(CFG.title);", "var isCls = /필라테스|학원/.test(CFG.title);")
rep("var WKEY = 'al_pilates_works_v1'", "var WKEY = 'al_academy_works_v1'")
s = s.replace("'명 ' + (isCls ? '수강 중'", "'명 ' + (isCls ? '수강 중'")
s = s.replace("#F2DED6 0%,#D4B2A5 45%,#8C675B 100%", "#F1F6EE 0%,#C9DDCB 45%,#55806A 100%")
s = s.replace("alajoomFeedback(\\'pilates\\')", "alajoomFeedback(\\'academy\\')")
s = s.replace("['place','플레이스'],['daangn','당근']];", "['place','플레이스'],['daangn','당근'],['momcafe','맘카페']];")
os.makedirs(B+'/academy', exist_ok=True)
open(B+'/academy/index.html','w',encoding='utf-8').write(s)
# 원생 장부(academy/students.js)는 학원 전용으로 따로 관리 — 덮어쓰지 않음
import subprocess; subprocess.run(['python3','/home/claude/skinbuild/patch_academy_home.py'],check=True)
m=''
print('ok', s.count('필라테스'), m.count('회원'), m.count('필라테스'))
