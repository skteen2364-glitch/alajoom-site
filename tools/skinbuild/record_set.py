import json, base64, time, time, datetime, sys, os, re
from playwright.sync_api import sync_playwright

MATE = sys.argv[1] if len(sys.argv) > 1 else 'skin'
OUT = '/tmp/rec_' + MATE
os.makedirs(OUT, exist_ok=True)
today = datetime.date.today().isoformat()
sess = {"access_token": "x.eyJzdWIiOiJ1MSJ9.y", "token_type": "bearer", "expires_in": 3600, "expires_at": int(time.time()) + 3600, "refresh_token": "r",
        "user": {"id": "u1", "aud": "authenticated", "role": "authenticated", "email": "demo@alajoom.kr", "app_metadata": {}, "user_metadata": {}}}

FONT_CSS = open('/tmp/fnt/package/700.css').read().replace('./files/', 'http://fonts.local/gb/')

if MATE == 'skin':
    DATA_KEY = 'al_beauty_customers_v1'
    data = {"members": [], "book": [], "menu": [], "rsv": [{"id": "r1", "date": today, "time": "11:00", "name": "김지은", "what": "수분 관리"}, {"id": "r2", "date": today, "time": "14:00", "name": "박하늘", "what": "진정 관리"}, {"id": "r3", "date": today, "time": "17:30", "name": "이서연", "what": "왁싱"}]}
    PHOTO = '/home/claude/skinbuild/skin-before.jpg'; AFTER_F = '/home/claude/skinbuild/skin-after-ai.jpg'; AIKEY = 'space'
    DETAIL = '11월 첫 방문 수분 관리 20%, 선착순 10명'
    RESULTS = {
        "insta": "촉촉함이 필요한 11월, 처음 오시는 분께 작은 선물을 준비했어요 🌿\n\n건조해지는 계절, 피부 컨디션부터 차분히 살피고\n지금 내 피부에 맞는 수분 관리로 안내해 드려요.\n\n✔ 11월 첫 방문 수분 관리 20%\n✔ 선착순 10분\n\n#연남동피부관리 #수분관리 #1인샵",
        "blog": "[연남동 피부관리] 11월 첫 방문 수분 관리 20% 안내\n\n① 건조한 11월, 수분 관리가 필요한 이유\n찬 바람이 불면 피부가 쉽게 당기고 거칠어져요.\n\n② 봄결 스킨케어 수분 관리 과정\n상담 → 클렌징 → 수분 관리 → 홈케어 안내\n\n③ 예약 안내\n위치: [주소] / 예약: 네이버 예약",
        "sms": "[짧은 버전]\n[봄결 스킨케어] 회원님, 11월 첫 방문 수분 관리 20%! 선착순 10분이에요 :)\n\n[긴 버전]\n[봄결 스킨케어] 회원님, 건조해지는 11월이에요. 처음 오시는 분께 수분 관리 20% 할인을 드려요. 선착순 10분이라 예약을 서둘러 주세요!",
        "daangn": "이웃님들, 연남동 1인 피부관리샵 봄결이에요 🙂\n찬 바람에 피부가 당기는 요즘,\n처음 오시는 분께 수분 관리 20% 할인을 드려요.\n조용한 1인 관리실이라 편하게 쉬다 가실 수 있어요.\n위치: 연남동 [주소]",
        "place": "11월 첫 방문 수분 관리 20%\n\n처음 오시는 분께 수분 관리 20% 할인을 드려요.\n기간: 11월 한 달 / 선착순 10분\n예약: 네이버 예약으로 편하게 남겨 주세요."}
else:
    DATA_KEY = None; data = None
    PHOTO = '/home/claude/alajoom-site/assets/food-ai-before.jpg'; AFTER_F = '/home/claude/alajoom-site/assets/food-ai-after.jpg'; AIKEY = 'mood'
    DETAIL = '부채살 스테이크 런치 19,000원, 평일 11시~3시'
    RESULTS = {
        "insta": "이번 주 런치, 스테이크 한 접시 어떠세요? 🥩\n\n겉은 바삭하게, 속은 촉촉하게 구운 부채살에\n부드러운 매시드 포테이토를 곁들였어요.\n\n✔ 부채살 스테이크 런치 19,000원\n✔ 평일 11시~3시\n\n#연남동맛집 #연남동런치 #스테이크",
        "blog": "[연남동 런치] 골목밥상 부채살 스테이크\n\n① 이번 주 런치 메뉴\n겉바속촉 부채살 스테이크를 준비했어요.\n\n② 함께 나오는 것\n매시드 포테이토, 그린 페퍼콘, 홀그레인 머스터드\n\n③ 안내\n평일 11시~3시 / 위치: [주소]",
        "sms": "[짧은 버전]\n[골목밥상] 이번 주 평일 런치 부채살 스테이크 19,000원! 11시~3시 :)\n\n[긴 버전]\n[골목밥상] 단골님, 이번 주 평일 점심에 부채살 스테이크 런치를 준비했어요. 19,000원, 11시부터 3시까지예요. 편하게 들러 주세요!",
        "daangn": "연남동 이웃님들, 골목밥상이에요 🙂\n이번 주 평일 점심에 부채살 스테이크 런치를 시작했어요.\n겉은 바삭, 속은 촉촉하게 구웠어요.\n점심 고민될 때 들러 주세요!\n위치: 연남동 [주소]",
        "place": "이번 주 런치 · 부채살 스테이크\n\n평일 11시~3시, 부채살 스테이크 런치 19,000원.\n매시드 포테이토와 함께 나와요.\n포장 문의는 전화 주세요."}

def route_all(pg):
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=FONT_CSS))
    def gb(r):
        fn = r.request.url.split('/gb/')[-1]
        p = '/tmp/fnt/package/files/' + fn
        if os.path.exists(p): r.fulfill(status=200, content_type='font/woff2', body=open(p, 'rb').read())
        else: r.fulfill(status=404, body='')
    pg.route('http://fonts.local/**', gb)
    pg.route('**/auth/v1/**', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(sess['user'])))
    def gen(r):
        time.sleep(2.2)
        r.fulfill(status=200, content_type='application/json', headers={'access-control-allow-origin': '*'},
                  body=json.dumps({"text": RESULTS["insta"], "results": RESULTS, "strategy": {}, "reviewed": [], "used": 1, "limit": 10}))
    pg.route('**/functions/v1/generate', gen)
    AFTER = base64.b64encode(open(AFTER_F,'rb').read()).decode()
    def pai(r):
        time.sleep(1.6); r.fulfill(status=200, content_type='application/json', body=json.dumps({'image': AFTER, 'mimeType': 'image/jpeg', 'used': 1, 'limit': 3}))
    pg.route('**/functions/v1/photo-ai', pai)
    pg.route('**/rest/v1/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))
    pg.route('**/storage/v1/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]'))

with sync_playwright() as p:
    b = p.chromium.launch()
    # 1) 준비: 사진 작업 하나 만들어 두기 (첫 화면 사진 카드용) — 같은 저장소를 쓰도록 녹화 없이 먼저
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    init = "localStorage.setItem('sb-zuxbloxstkcixqpzqalk-auth-token',%s);sessionStorage.setItem('al_ob_later','1');" % json.dumps(json.dumps(sess))
    if DATA_KEY: init += "localStorage.setItem('%s',%s);" % (DATA_KEY, json.dumps(json.dumps(data)))
    ctx.add_init_script(init)
    pg = ctx.new_page(); route_all(pg)
    pg.goto('http://localhost:8765/%s/' % MATE); pg.wait_for_timeout(1500)
    state = ctx.storage_state()
    pg.close(); ctx.close()

    ctx = b.new_context(viewport={'width': 780, 'height': 1688}, device_scale_factor=1, record_video_dir=OUT, record_video_size={'width': 780, 'height': 1688}, storage_state=state)
    ctx.add_init_script("sessionStorage.setItem('al_ob_later','1'); document.addEventListener('DOMContentLoaded', function(){ document.documentElement.style.zoom = 2; });")
    pg = ctx.new_page(); route_all(pg)
    pg.add_style_tag if False else None
    pg.goto('http://localhost:8765/%s/' % MATE); pg.wait_for_timeout(2200)
    T0 = time.time(); MARK = []
    def mark(k): MARK.append((k, round(time.time() - T0, 2)))
    def sv(sel, blk='center', ms=650):
        pg.evaluate("""([sel, blk, ms]) => new Promise(res => { const e = document.querySelector(sel); if (!e) return res();
          const y0 = window.scrollY; e.scrollIntoView({block: blk === 'start' ? 'start' : 'center'}); let y1 = window.scrollY; if (blk === 'start') { window.scrollBy(0, -60); y1 = window.scrollY; } window.scrollTo(0, y0); const t0 = performance.now();
          const step = t => { const k = Math.min(1, (t - t0) / ms), ez = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; window.scrollTo(0, y0 + (y1 - y0) * ez); if (k < 1) requestAnimationFrame(step); else res(); };
          requestAnimationFrame(step); })""", [sel, blk, ms])
    W = pg.wait_for_timeout
    pg.add_style_tag(content='main,#app,body{padding-bottom:600px!important}')
    mark('home'); W(2200)
    pg.click('.mtab[data-tab="make"]' if MATE != 'food' else '.tab[data-view="promo"]'); W(500)
    pg.click('.tool[data-tool="set"]'); W(400); mark('set')
    sv('#detail'); W(200)
    pg.click('#detail'); pg.keyboard.type(DETAIL, delay=38); W(300); mark('typed')
    sv('[data-chm="daangn"]'); W(150)
    pg.click('[data-chm="daangn"]'); W(250); pg.click('[data-chm="place"]'); W(350); mark('channels')
    sv('#attBox'); W(150)
    pg.set_input_files('#attBox input[type=file]', PHOTO); W(900); mark('photo')
    pg.click('[data-act="attfix"]'); W(900)
    sv('.outs'); W(200)
    pg.click('.out-c[data-out="%s"]' % AIKEY); W(500)
    sv('[data-act="aigo"]'); W(200); mark('aigo')
    pg.click('[data-act="aigo"]'); W(2200)
    sv('#phImg'); W(1500); mark('aidone')
    sv('[data-act="retback"]'); W(200)
    pg.click('[data-act="retback"]'); W(900)
    sv('#go'); W(250); mark('go')
    pg.click('#go'); W(2700); mark('result')
    sv('#result', 'start'); W(1800)
    for k in ['blog', 'sms', 'daangn', 'place']:
        mark('tab_' + k); pg.click('[data-setc="%s"]' % k); W(200)
        pg.evaluate("() => { const e = document.querySelector('#result'); e.scrollIntoView({block:'start'}); window.scrollBy(0, -60); }"); W(1350)
    mark('end'); pg.click('[data-setc="insta"]'); W(120); sv('#igHd', 'start', 450); W(2600)
    json.dump(MARK, open(OUT + '/marks.json', 'w')); print(MARK)
    vpath = pg.video.path()
    pg.close(); ctx.close(); b.close()
    print(vpath)
