import re, os, json
B='/home/claude/alajoom-site'
M = {
 'cafe': dict(t='카페메이트', biz='동네 카페', c=('#8B5A2B','#6B4420','#F3E9DF'), ch='카',
   desc='동네 카페 사장님 비서 — 신메뉴·시즌 음료 홍보글·손님 문자·리뷰 답글·단체 주문 장부를 한 번에',
   mdesc='카페 홍보글·손님 문자·리뷰 답글·단체 주문 장부를 AI가 도와드려요',
   area='예: 망원동', cls='예: 핸드드립, 바닐라라떼, 수제 스콘', feat='예: 매주 직접 볶는 원두, 창가 자리', contact='예: 인스타 DM, 전화',
   mood="'AI 카페 연출', '음료는 그대로, 카페 화보처럼', '음료·디저트 양과 잔은 그대로 두고, 따뜻한 자연광이 드는 카페 테이블 위 화보처럼 연출해요.'",
   av='<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3c0 1 1 1.5 1 2.5M12 3c0 1 1 1.5 1 2.5"/>',
   cats="['커피','논커피','디저트','원두']",
   menus="""      {id:'m1', cat:'커피', name:'핸드드립', price:'5500', desc:'이번 주 원두로 내려요', origin:'', best:true},
      {id:'m2', cat:'커피', name:'바닐라라떼', price:'5500', desc:'직접 만든 바닐라 시럽', origin:'', best:true},
      {id:'m3', cat:'논커피', name:'흑임자 라떼', price:'6000', desc:'12월 한정, 고소한 흑임자', origin:'', best:false},
      {id:'m4', cat:'디저트', name:'수제 스콘', price:'3800', desc:'매일 아침 구워요', origin:'', best:false},
      {id:'m5', cat:'원두', name:'하우스 블렌드 200g', price:'15000', desc:'고소하고 달콤한 맛', origin:'', best:false}""",
   parties="""      {id:'p1', kind:'원두·재료', name:'한결로스터리', items:'생두·원두', phone:'010-0000-0001', day:'화·금', memo:'오전 주문 시 다음 날 도착'},
      {id:'p2', kind:'원두·재료', name:'푸른목장 우유', items:'우유·생크림', phone:'010-0000-0002', day:'매일', memo:''},
      {id:'p3', kind:'단체 손님', name:'망원동 디자인사무실', items:'회의 커피', phone:'010-0000-0003', day:'', memo:'매주 월요일 회의'}""",
   ledger="""      {id:'l1', date:mon0 + '02', type:'매입', party:'한결로스터리', item:'원두 5kg', amount:150000, paid:true, memo:''},
      {id:'l2', date:mon0 + '03', type:'매입', party:'푸른목장 우유', item:'우유 30L', amount:72000, paid:false, memo:'월말 정산'},
      {id:'l3', date:mon0 + '05', type:'매출', party:'망원동 디자인사무실', item:'회의 커피 20잔', amount:100000, paid:false, memo:'계좌이체 예정'},
      {id:'l4', date:mon0 + '06', type:'매출', party:'매장·배달 매출', item:'하루 매출 합계', amount:428000, paid:true, memo:''}""",
   quote="""      {id:'q1', customer:'망원동 디자인사무실', phone:'010-0000-0003', date:addDays(7), time:'10:00', people:20, place:'사무실로 배달', items:[{name:'아메리카노', qty:12, price:4500}, {name:'바닐라라떼', qty:8, price:5500}], discount:10000, memo:'얼음 따로, 캐리어 포함', status:'확정', booked:false}""",
   ph=dict(mName='예: 바닐라라떼', mDesc='예: 직접 만든 바닐라 시럽', mOrigin='예: 원두 에티오피아', party='예: 한결로스터리', item='예: 원두 5kg', pItems='예: 원두', qCus='예: 디자인사무실 회의', lead='단체 커피·행사·케이터링 문의가 오면 견적서를 이미지로 보내고, 확정되면 장부에 매출로 넣어요.'),
   kw="""      '신메뉴 출시':/신메뉴|새\\s*메뉴|출시|나왔/, '시즌 음료':/시즌|겨울|여름|한정/, '오늘의 디저트':/디저트|케이크|스콘|쿠키|구웠/, '원두 소개':/원두|드립|로스팅|블렌드/, '단체 커피 주문':/단체|회의|행사|대량/, '이벤트·할인':/이벤트|할인|쿠폰|스탬프|서비스|증정/, '휴무·영업시간 안내':/휴무|쉬어|쉽니다|영업\\s*시간|휴가|명절/,
      '단체 주문 확인':/주문\\s*확인|단체/, '픽업 준비 완료':/픽업|포장|준비\\s*완료/, '스탬프·쿠폰 안내':/스탬프|쿠폰|적립/, '재방문 감사':/감사|재방문/, '신메뉴·소식 알림':/신메뉴|새\\s*메뉴|소식|알려|오픈|출시|이벤트|할인/, '휴무 안내':/휴무|쉬어|쉽니다|휴가|명절/,
      '신메뉴':/신메뉴|새\\s*메뉴/, '시즌 메뉴':/시즌|한정/, '이벤트':/이벤트|할인/,
      '좋은 리뷰':/좋은|칭찬|감사|맛있/, '아쉬운 리뷰':/아쉬|불만|안\\s*좋|별로|쓴|연하|늦/, '배달 리뷰':/배달|배민|쿠팡|요기요/"""),
 'bakery': dict(t='베이커리메이트', biz='동네 빵집', c=('#B26A12','#8A520E','#FBEFD9'), ch='빵',
   desc='동네 빵집 사장님 비서 — 갓 구운 빵 알림·케이크 주문·손님 문자·리뷰 답글·주문 장부를 한 번에',
   mdesc='빵집 홍보글·케이크 주문 문자·리뷰 답글·주문 장부를 AI가 도와드려요',
   area='예: 연희동', cls='예: 소금빵, 무화과 깜빠뉴, 주문 케이크', feat='예: 매일 아침 직접 굽는 빵', contact='예: 전화, 네이버 예약',
   mood="'AI 빵집 연출', '빵은 그대로, 빵집 화보처럼', '빵·케이크 모양과 크기는 그대로 두고, 따뜻한 자연광이 드는 나무 테이블 위 화보처럼 연출해요.'",
   av='<path d="M5 11a4 4 0 0 1 2-7.5c1.2 0 2.3.4 3 1a5 5 0 0 1 4 0c.7-.6 1.8-1 3-1A4 4 0 0 1 19 11v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M9 11v4M15 11v4"/>',
   cats="['빵','케이크','구움과자','음료']",
   menus="""      {id:'m1', cat:'빵', name:'소금빵', price:'3000', desc:'겉은 바삭, 속은 촉촉', origin:'', best:true},
      {id:'m2', cat:'빵', name:'무화과 깜빠뉴', price:'7500', desc:'무화과 듬뿍, 천천히 발효해요', origin:'', best:true},
      {id:'m3', cat:'케이크', name:'딸기 생크림 케이크 1호', price:'38000', desc:'3일 전 주문', origin:'', best:false},
      {id:'m4', cat:'구움과자', name:'휘낭시에', price:'2800', desc:'태운 버터로 구워요', origin:'', best:false},
      {id:'m5', cat:'음료', name:'아메리카노', price:'3500', desc:'빵이랑 같이', origin:'', best:false}""",
   parties="""      {id:'p1', kind:'재료', name:'한빛제분', items:'밀가루', phone:'010-0000-0001', day:'월·목', memo:'오후 3시 전 주문'},
      {id:'p2', kind:'재료', name:'푸른목장 유제품', items:'버터·생크림·우유', phone:'010-0000-0002', day:'매일', memo:''},
      {id:'p3', kind:'단체 손님', name:'연희유치원', items:'답례 빵', phone:'010-0000-0003', day:'', memo:'행사 때마다'}""",
   ledger="""      {id:'l1', date:mon0 + '02', type:'매입', party:'한빛제분', item:'강력분 20kg', amount:52000, paid:true, memo:''},
      {id:'l2', date:mon0 + '03', type:'매입', party:'푸른목장 유제품', item:'버터·생크림', amount:186000, paid:false, memo:'월말 정산'},
      {id:'l3', date:mon0 + '05', type:'매출', party:'연희유치원', item:'답례 빵 40세트', amount:240000, paid:false, memo:'계좌이체 예정'},
      {id:'l4', date:mon0 + '06', type:'매출', party:'매장·택배 매출', item:'하루 매출 합계', amount:536000, paid:true, memo:''}""",
   quote="""      {id:'q1', customer:'연희유치원', phone:'010-0000-0003', date:addDays(7), time:'11:00', people:40, place:'유치원으로 배달', items:[{name:'답례 빵 세트', qty:40, price:6000}], discount:0, memo:'개별 포장, 리본 포함', status:'확정', booked:false}""",
   ph=dict(mName='예: 소금빵', mDesc='예: 겉은 바삭, 속은 촉촉', mOrigin='예: 버터 프랑스산', party='예: 한빛제분', item='예: 강력분 20kg', pItems='예: 밀가루', qCus='예: 유치원 답례품', lead='케이크·답례 빵·행사 주문이 오면 견적서를 이미지로 보내고, 확정되면 장부에 매출로 넣어요.'),
   kw="""      '갓 구운 빵 알림':/갓|방금|나왔|굽|오븐/, '신메뉴 출시':/신메뉴|새\\s*(빵|메뉴)|출시/, '케이크 예약 주문':/케이크|주문\\s*케이크|예약/, '시즌 한정':/시즌|크리스마스|한정|겨울|여름/, '단체·선물 주문':/단체|선물|답례|대량/, '이벤트·할인':/이벤트|할인|쿠폰|서비스|증정/, '휴무·영업시간 안내':/휴무|쉬어|쉽니다|영업\\s*시간|휴가|명절/,
      '케이크 주문 확인':/케이크|주문\\s*확인/, '픽업 전날 리마인드':/내일|리마인드|전날/, '픽업 준비 완료':/픽업|포장|준비\\s*완료/, '재방문 감사 쿠폰':/감사|쿠폰|재방문/, '단체 주문 안내':/단체|답례|대량/, '신메뉴·소식 알림':/신메뉴|새\\s*빵|소식|알려|오픈|출시|이벤트|할인/, '휴무 안내':/휴무|쉬어|쉽니다|휴가|명절/,
      '빵 나오는 시간':/시간|굽는|나오는/, '케이크 주문 안내':/케이크/, '이벤트':/이벤트|할인/,
      '좋은 리뷰':/좋은|칭찬|감사|맛있/, '아쉬운 리뷰':/아쉬|불만|안\\s*좋|별로|딱딱|늦/, '택배·배달 리뷰':/택배|배달|배민|쿠팡|요기요/"""),
}
src = open(B+'/food/index.html', encoding='utf-8').read()
for k, m in M.items():
    s = src
    def rep(a, b, n=1):
        global s
        assert a in s, (k, 'missing', a[:90]); s = s.replace(a, b) if n == 0 else s.replace(a, b, n)
    i = s.index('var CFG = {'); j = s.index('\n};\n', i) + 4
    s = s[:i] + open(f'/home/claude/skinbuild/cfg_{k}.js', encoding='utf-8').read() + s[j:]
    for a, b in zip(('#D9480F','#A8380B','#FDEBDD'), m['c']): s = s.replace(a, b)
    rep('<title>푸드메이트</title>', f"<title>{m['t']}</title>")
    rep('/food/manifest.webmanifest', f'/{k}/manifest.webmanifest')
    rep('/assets/apple-touch-food.png', f'/assets/apple-touch-{k}.png')
    rep('content="푸드메이트"', f'content="{m["t"]}"')
    s = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{m["desc"]}">', s, count=1)
    s = s.replace('icon-food', f'icon-{k}')
    rep('<b>푸드메이트</b><small>알아줌 · 음식점 사장님 비서</small>', f"<b>{m['t']}</b><small>알아줌 · {m['biz']} 사장님 비서</small>")
    rep('aria-label="푸드메이트 메뉴"', f'aria-label="{m["t"]} 메뉴"')
    rep('placeholder="예: 망원동"', f'placeholder="{m["area"]}"')
    rep('placeholder="예: 제육볶음 정식, 된장찌개"', f'placeholder="{m["cls"]}"')
    rep('placeholder="예: 매일 담그는 반찬, 혼밥 환영"', f'placeholder="{m["feat"]}"')
    rep('placeholder="예: 전화, 네이버 예약"', f'placeholder="{m["contact"]}"')
    if k == 'bakery': rep('>대표 메뉴<input', '>대표 빵<input')
    rep('<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1 1-2 1-3M12 7c0-1 1-2 1-3M16 7c0-1 1-2 1-3"/>', m['av'])
    rep("if (/\\/food\\//.test(location.pathname)) AI_DEF.mood = ['store', 'AI 매장 연출', '음식은 그대로, 식당 화보처럼', '음식 양·토핑·그릇은 그대로 두고, 따뜻한 자연광이 드는 식당 테이블 위 화보처럼 연출해요.', 1];",
        f"AI_DEF.mood = ['store', {m['mood']}, 1];")
    i = s.index("    var KW = {"); j = s.index("    };", i) + 6
    s = s[:i] + "    var KW = {\n" + m['kw'] + "\n    };" + s[j:]
    i = s.index("    menus:[\n", s.index('var SEED')); j = s.index("    ]\n  };", i) + len("    ]\n  };")
    s = s[:i] + "    menus:[\n" + m['menus'] + "\n    ],\n    parties:[\n" + m['parties'] + "\n    ],\n    ledger:[\n" + m['ledger'] + "\n    ],\n    quotes:[\n" + m['quote'] + "\n    ]\n  };" + s[j:]
    rep("uniq(['식사','곁들임','음료','주류']", "uniq(" + m['cats'])
    rep("m = m || {cat:'식사'};", "m = m || {cat:" + m['cats'][1:].split(',')[0] + "};")
    p = m['ph']
    rep('placeholder="예: 제육볶음 정식"', f'placeholder="{p["mName"]}"')
    rep('placeholder="예: 불맛 나는 제육, 반찬 4가지"', f'placeholder="{p["mDesc"]}"')
    rep('placeholder="예: 돼지고기 국내산"', f'placeholder="{p["mOrigin"]}"')
    rep('placeholder="예: 한빛축산"', f'placeholder="{p["party"]}"', 0)
    rep('placeholder="예: 돼지 앞다리 10kg"', f'placeholder="{p["item"]}"')
    rep('placeholder="예: 돼지고기"', f'placeholder="{p["pItems"]}"')
    rep('placeholder="예: 연남초 학부모회"', f'placeholder="{p["qCus"]}"')
    rep('단체 도시락·모임·케이터링 문의가 오면 견적서를 이미지로 보내고, 확정되면 장부에 매출로 넣어요.', p['lead'])
    rep("var WKEY = 'al_food_works_v1'", f"var WKEY = 'al_{k}_works_v1'")
    s = s.replace("'al_food_box_moved'", f"'al_{k}_box_moved'")
    rep("alajoomFeedback(\\'food\\')", f"alajoomFeedback(\\'{k}\\')")
    s = s.replace('알아줌 푸드메이트로 만들었어요', '알아줌 ' + m['t'] + '로 만들었어요').replace('푸드메이트 포인트 색(주황)', m['t'] + ' 포인트 색')
    left = [w for w in ('푸드메이트','음식점','제육','반찬','한빛축산','연남초','도시락','막국수','밥집') if w in s]
    os.makedirs(f'{B}/{k}', exist_ok=True)
    open(f'{B}/{k}/index.html','w',encoding='utf-8').write(s)
    txt = open(B+'/food/manifest.webmanifest', encoding='utf-8').read().replace('/food/', f'/{k}/').replace('icon-food', f'icon-{k}').replace('푸드메이트', m['t'])
    mf = json.loads(txt); mf['description'] = m['mdesc']
    open(f'{B}/{k}/manifest.webmanifest','w',encoding='utf-8').write(json.dumps(mf, ensure_ascii=False, indent=2))
    print(k, 'left:', left)
