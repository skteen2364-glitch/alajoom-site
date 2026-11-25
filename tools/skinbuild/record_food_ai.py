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
    data = {"members": [
        {"id": "a1", "name": "최유나", "phone": "010-2222-3333", "pass": "수분 관리", "total": 10, "att": ["2026-09-02", "2026-09-20", "2026-10-05", "2026-10-21", "2026-11-04"] + ["2026-08-0%d" % i for i in range(1, 5)], "start": "2026-08-01", "end": "2026-12-31", "pays": [{"date": today[:8] + "03", "price": 900000, "pass": "수분 관리 10회"}]},
        {"id": "a2", "name": "김지은", "phone": "010-1111-2222", "pass": "진정 관리", "total": 10, "att": ["2026-10-30", "2026-11-12"], "start": "2026-10-01", "end": "2027-02-28", "pays": [{"date": today[:8] + "05", "price": 850000, "pass": "진정 관리 10회"}]}],
        "book": [], "menu": [],
        "rsv": [{"id": "r1", "date": today, "time": "11:00", "name": "김지은", "what": "수분 관리"},
                {"id": "r2", "date": today, "time": "14:00", "name": "박하늘", "what": "진정 관리"},
                {"id": "r3", "date": today, "time": "17:30", "name": "이서연", "what": "왁싱"}]}
    TYPE = '11월 첫 방문 수분 관리 20% 할인, 선착순 10명'
    RESULTS = {
        "insta": "촉촉함이 필요한 11월, 처음 오시는 분께 작은 선물을 준비했어요 🌿\n\n건조해지는 계절, 피부 컨디션부터 차분히 살피고\n지금 내 피부에 맞는 수분 관리로 안내해 드려요.\n\n✔ 11월 첫 방문 수분 관리 20%\n✔ 선착순 10분\n✔ 1인 원장 직접 관리 · 프라이빗 룸\n\n예약은 프로필 링크 네이버 예약으로 편하게 남겨 주세요.\n\n#연남동피부관리 #연남동에스테틱 #수분관리 #피부관리샵 #1인샵",
        "blog": "[연남동 피부관리] 11월 첫 방문 수분 관리 20% 안내\n\n① 건조한 11월, 왜 수분 관리일까요\n찬 바람이 불기 시작하면 피부가 쉽게 당기고 거칠어져요…\n\n② 봄결 스킨케어의 수분 관리\n상담으로 피부 컨디션을 먼저 살피고…\n\n③ 예약 안내\n위치: 연남동 [주소] / 예약: 네이버 예약",
        "sms": "[봄결 스킨케어] 고객님, 11월 첫 방문 고객께 수분 관리 20% 할인을 드려요. 선착순 10분! 예약은 답장 주세요 :)"}
    REQ = ''
    PHOTO = '/home/claude/skinbuild/skin-before.jpg'; FLTS = ['vivid', 'soft']; PH_TEXT = '11월 첫 방문 20%'; FRMS = ['band', 'magazine', 'polaroid', 'band']; DETAIL = '11월 첫 방문 수분 관리 20%, 선착순 10명'
else:
    DATA_KEY = None
    data = None
    TYPE = ''
    PHOTO = '/home/claude/alajoom-site/assets/food-ai-before.jpg'; PH_TEXT = '이번 주 스테이크 런치'; DETAIL = '부채살 스테이크 런치 19,000원, 평일 11시~3시'
    RESULTS = {
        "insta": "이번 주 런치, 스테이크 한 접시 어떠세요? 🥩\n\n겉은 바삭하게, 속은 촉촉하게 구운 부채살에\n부드러운 매시드 포테이토와 그린 페퍼콘을 곁들였어요.\n\n✔ 부채살 스테이크 런치 19,000원\n✔ 평일 11시~3시\n\n#연남동맛집 #연남동런치 #스테이크 #골목밥상 #점심추천",
        "blog": "[연남동 런치] 골목밥상 부채살 스테이크\n\n① 메뉴 소개\n…",
        "sms": "[골목밥상] 이번 주 평일 런치 부채살 스테이크 19,000원! 11시~3시에 만나요 :)"}

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
        time.sleep(0.4)
        r.fulfill(status=200, content_type='application/json', headers={'access-control-allow-origin': '*'},
                  body=json.dumps({"text": RESULTS["insta"], "results": RESULTS, "strategy": {}, "reviewed": [], "used": 1, "limit": 10}))
    pg.route('**/functions/v1/generate', gen)
    AFTER = base64.b64encode(open('/home/claude/alajoom-site/assets/food-ai-after.jpg','rb').read()).decode()
    def pai(r):
        time.sleep(4.6); r.fulfill(status=200, content_type='application/json', body=json.dumps({'image': AFTER, 'mimeType': 'image/jpeg', 'used': 1, 'limit': 3}))
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
    def sv(sel, blk='center'):
        pg.evaluate("(function(){var e=document.querySelector(%s); if(e) e.scrollIntoView({behavior:'smooth',block:'%s'});})()" % (json.dumps(sel), blk))
    mk = '.tab[data-view="promo"]'
    pg.click(mk); pg.wait_for_timeout(900)
    pg.click('.tool[data-tool="photo"]'); pg.wait_for_timeout(700)
    pg.set_input_files('#phFile', PHOTO); pg.wait_for_timeout(1300)
    sv('.outs'); pg.wait_for_timeout(900)
    pg.click('.out-c[data-out="mood"]'); pg.wait_for_timeout(800)
    sv('#phSoon', 'start'); pg.wait_for_timeout(2200)
    sv('[data-act="aigo"]'); pg.wait_for_timeout(700)
    pg.click('[data-act="aigo"]'); pg.wait_for_timeout(1200)
    sv('#aiPrev'); pg.wait_for_timeout(4000)
    sv('#phImg'); pg.wait_for_timeout(2200)
    hb = pg.query_selector('#phHold').bounding_box()
    pg.mouse.move(hb['x'] + hb['width']/2, hb['y'] + hb['height']/2)
    for _ in range(2):
        pg.mouse.down(); pg.wait_for_timeout(1300); pg.mouse.up(); pg.wait_for_timeout(1300)
    sv('#phText'); pg.wait_for_timeout(600)
    pg.click('#phText'); pg.keyboard.type(PH_TEXT, delay=70); pg.wait_for_timeout(400)
    sv('#frmStrip'); pg.wait_for_timeout(600)
    pg.click('[data-frm="band"]'); pg.wait_for_timeout(900)
    sv('#phImg'); pg.wait_for_timeout(1700)
    sv('#detail'); pg.wait_for_timeout(600)
    pg.click('#detail'); pg.keyboard.type(DETAIL, delay=45); pg.wait_for_timeout(400)
    pg.click('#go'); pg.wait_for_timeout(2600)
    sv('#igHd', 'start'); pg.wait_for_timeout(2600)
    pg.mouse.wheel(0, 650); pg.wait_for_timeout(2400)
    vpath = pg.video.path()
    pg.close(); ctx.close(); b.close()
    print(vpath)
