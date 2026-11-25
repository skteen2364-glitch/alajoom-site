import re, os, json, sys
B='/home/claude/alajoom-site'
M = {
 'nail': dict(t='네일메이트', biz='네일샵', c=('#8A3FA0','#6A2E7D','#F3E8F7'), phg='#F7EEF8 0%,#DCC3E2 45%,#6E4A7C 100%', ch='네',
   desc='네일샵 원장님 비서 — 이달의 아트 홍보글·고객 문자·리뷰 답글·고객 장부·예약을 한 번에',
   area='예: 합정동', cls='예: 원컬러 젤, 시즌 아트, 젤 제거', feat='예: 1인 원장 직접 시술, 예약제', mdesc='네일샵 홍보글·고객 문자·리뷰 답글·고객 장부·예약을 AI가 도와드려요',
   kw="""      '이달의 아트':/이달|이번\\s*달|추천|아트|디자인/, '신상 컬러':/신상|컬러|새\\s*색/, '신규 고객 이벤트':/이벤트|할인|신규|처음|선물/, '시술 메뉴 소개':/메뉴|가격|시술\\s*소개/, '손톱 관리 팁':/팁|관리법|오래|들뜸/, '원장 소개':/원장\\s*소개|소개/, '휴무·일정 안내':/휴무|일정|쉬어|쉽니다|공휴일/,
      '예약 확인':/예약\\s*확인|내일|리마인드/, '시술 후 안부':/시술\\s*후|오늘\\s*(시술|받)|수고/, '리터치 안내':/리터치|들뜨|자라|보수/, '재방문 안내':/재방문|오랜만|안부|안\\s*오/, '신규 고객 환영':/환영|처음\\s*오신|새로\\s*오신/, '생일 축하':/생일/, '휴무 안내':/휴무|쉬어|쉽니다|쉬는/, '이벤트·소식 알림':/이벤트|할인|소식|오픈|알려|알림|공지/,
      '시술 메뉴·가격':/메뉴|가격/, '이벤트':/이벤트|할인/, '예약 가능 시간':/예약\\s*가능|빈\\s*시간|시간/,"""),
 'hair': dict(t='헤어메이트', biz='미용실', c=('#2F6690','#234E70','#E4EEF6'), phg='#EEF3F8 0%,#C3D3E2 45%,#3E5A75 100%', ch='헤',
   desc='동네 미용실 원장님 비서 — 스타일 홍보글·고객 문자·리뷰 답글·고객 장부·예약을 한 번에',
   area='예: 성수동', cls='예: 커트, 뿌리 염색, 매직, 클리닉', feat='예: 1인 원장 직접 시술, 상담부터 마무리까지', mdesc='미용실 홍보글·고객 문자·리뷰 답글·고객 장부·예약을 AI가 도와드려요',
   kw="""      '이달의 스타일':/이달|이번\\s*달|추천|스타일/, '신규 고객 이벤트':/이벤트|할인|신규|처음|선물/, '시술 메뉴 소개':/메뉴|가격|시술\\s*소개/, '집에서 손질 팁':/팁|손질|드라이|집에서/, '원장 소개':/원장\\s*소개|소개/, '휴무·일정 안내':/휴무|일정|쉬어|쉽니다|공휴일/,
      '예약 확인':/예약\\s*확인|내일|리마인드/, '시술 후 안부':/시술\\s*후|오늘\\s*(시술|받)|수고/, '뿌리 염색 시기 안내':/뿌리|염색\\s*시기|새치/, '재방문 안내':/재방문|오랜만|안부|안\\s*오|다듬/, '신규 고객 환영':/환영|처음\\s*오신|새로\\s*오신/, '생일 축하':/생일/, '휴무 안내':/휴무|쉬어|쉽니다|쉬는/, '이벤트·소식 알림':/이벤트|할인|소식|오픈|알려|알림|공지/,
      '시술 메뉴·가격':/메뉴|가격/, '이벤트':/이벤트|할인/, '예약 가능 시간':/예약\\s*가능|빈\\s*시간|시간/,"""),
}
src = open(B+'/skin/index.html', encoding='utf-8').read()
for k, m in M.items():
    s = src
    def rep(a, b):
        global s
        assert a in s, (k, 'missing', a[:80]); s = s.replace(a, b)
    i = s.index('var CFG = {'); j = s.index('\n};\n', i) + 4
    s = s[:i] + open(f'/home/claude/skinbuild/cfg_{k}.js', encoding='utf-8').read() + s[j:]
    for a, b in zip(('#B83C66','#8F2C4E','#FBE7EE'), m['c']): s = s.replace(a, b)
    s = s.replace('#F2DED6 0%,#D4B2A5 45%,#8C675B 100%', m['phg'])
    rep('<title>스킨메이트</title>', f"<title>{m['t']}</title>")
    rep('/skin/manifest.webmanifest', f'/{k}/manifest.webmanifest')
    rep('/assets/apple-touch-skin.png', f'/assets/apple-touch-{k}.png')
    rep('content="스킨메이트"', f'content="{m["t"]}"')
    s = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{m["desc"]}">', s, count=1)
    s = s.replace('icon-skin', f'icon-{k}')
    rep('<b>스킨메이트</b><small>알아줌 · 피부관리·에스테틱 원장님 비서</small>', f"<b>{m['t']}</b><small>알아줌 · {m['biz']} 원장님 비서</small>")
    rep('aria-label="스킨메이트 메뉴"', f'aria-label="{m["t"]} 메뉴"')
    rep('placeholder="예: 연남동"', f'placeholder="{m["area"]}"')
    rep('placeholder="예: 수분 관리, 진정 관리, 왁싱"', f'placeholder="{m["cls"]}"')
    rep('placeholder="예: 1인 원장 직접 관리, 프라이빗 룸"', f'placeholder="{m["feat"]}"')
    rep('>대표 관리<input', '>대표 시술<input')
    i = s.index("    var KW = {"); j = s.index("    };", i) + 6
    s = s[:i] + "    var KW = {\n" + m['kw'] + " '휴무 안내':/휴무/,\n      '좋은 리뷰':/좋은|칭찬|감사/, '아쉬운 리뷰':/아쉬|불만|안\\s*좋|별로|나쁜/\n    };" + s[j:]
    rep("t.dataset.v === '관리 메뉴·가격'", "t.dataset.v === '시술 메뉴·가격'")
    AV = {'nail': '<rect x="8" y="10" width="8" height="11" rx="2"/><path d="M10 10V6h4v4M11 3h2v3h-2z"/>', 'hair': '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 7.6L20 18M8.6 16.4L20 6"/>'}
    rep('<path d="M12 3c3.5 4.2 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.5-6.8 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>', AV[k])
    rep("var WKEY = 'al_skin_works_v1'", f"var WKEY = 'al_{k}_works_v1'")
    rep("alajoomFeedback(\\'skin\\')", f"alajoomFeedback(\\'{k}\\')")
    s = re.sub(r'/skin/customers\.js\?v=\w+', '/skin/customers.js?v=11201500', s)
    left = [w for w in ('스킨메이트','피부관리','에스테틱','관리실','홈케어 팁','관리권') if w in s]
    os.makedirs(f'{B}/{k}', exist_ok=True)
    open(f'{B}/{k}/index.html','w',encoding='utf-8').write(s)
    mf = json.load(open(B+'/skin/manifest.webmanifest', encoding='utf-8'))
    txt = json.dumps(mf, ensure_ascii=False, indent=2).replace('/skin/', f'/{k}/').replace('icon-skin', f'icon-{k}').replace('스킨메이트', m['t'])
    mf = json.loads(txt); mf['description'] = m['mdesc']; mf['background_color'] = mf['theme_color'] = mf['background_color']
    open(f'{B}/{k}/manifest.webmanifest','w',encoding='utf-8').write(json.dumps(mf, ensure_ascii=False, indent=2))
    print(k, 'left:', left)
