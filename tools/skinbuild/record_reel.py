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
    INTRO = '원장님, <i>홍보</i>할 시간 없으시죠?'; OUTRO = '스킨메이트, <i>지금 무료로</i> 시작하세요'
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
    INTRO = '사장님, <i>홍보</i>할 시간 없으시죠?'; OUTRO = '푸드메이트, <i>지금 무료로</i> 시작하세요'
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

    ctx = b.new_context(viewport={'width': 780, 'height': 1388}, device_scale_factor=1, record_video_dir=OUT, record_video_size={'width': 780, 'height': 1388}, storage_state=state)
    ctx.add_init_script("sessionStorage.setItem('al_ob_later','1'); document.addEventListener('DOMContentLoaded', function(){ document.documentElement.style.zoom = 2; });")
    pg = ctx.new_page(); route_all(pg)
    pg.add_style_tag if False else None
    pg.goto('http://localhost:8765/%s/' % MATE); pg.wait_for_timeout(2200)
    W = pg.wait_for_timeout
    pg.add_style_tag(content="""html,body,*{overflow-anchor:none!important} body{padding-bottom:700px!important}
      #cap{position:fixed;left:14px;right:14px;bottom:26px;z-index:99999;text-align:center;pointer-events:none;transition:opacity .35s ease, transform .35s ease;opacity:0;transform:translateY(8px)}
      #cap.on{opacity:1;transform:none}
      #cap b{display:inline-block;background:rgba(20,22,31,.86);color:#fff;font:800 21px/1.45 'Noto Sans KR','Apple SD Gothic Neo',sans-serif;padding:10px 16px;border-radius:14px;letter-spacing:-.3px}
      #cap b i{font-style:normal;color:#FFD43B}""")
    pg.evaluate("() => { const d = document.createElement('div'); d.id = 'cap'; d.innerHTML = '<b></b>'; document.body.appendChild(d); }")
    def cap(html):
        pg.evaluate("""(h) => { const c = document.getElementById('cap'); c.classList.remove('on'); setTimeout(() => { c.querySelector('b').innerHTML = h; c.classList.add('on'); }, h ? 220 : 0); }""", html)
    def sv(sel, blk='center', ms=1100, extra=0):
        pg.evaluate("""([sel, blk, ms, extra]) => new Promise(res => { const e = document.querySelector(sel); if (!e) return res();
          const y0 = window.scrollY; e.scrollIntoView({block: blk === 'start' ? 'start' : 'center'}); window.scrollBy(0, (blk === 'start' ? -70 : 0) + extra); const y1 = window.scrollY; window.scrollTo(0, y0); const t0 = performance.now();
          const step = t => { const k = Math.min(1, (t - t0) / ms), ez = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; window.scrollTo(0, y0 + (y1 - y0) * ez); if (k < 1) requestAnimationFrame(step); else res(); };
          requestAnimationFrame(step); })""", [sel, blk, ms, extra])
    def glide(dy, ms=1600):
        pg.evaluate("""([dy, ms]) => new Promise(res => { const y0 = window.scrollY, t0 = performance.now();
          const step = t => { const k = Math.min(1, (t - t0) / ms), ez = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; window.scrollTo(0, y0 + dy * ez); if (k < 1) requestAnimationFrame(step); else res(); };
          requestAnimationFrame(step); })""", [dy, ms])
    W(900)
    cap(INTRO); W(2000)
    pg.click('.mtab[data-tab="make"]' if MATE != 'food' else '.tab[data-view="promo"]'); W(600)
    pg.click('.tool[data-tool="set"]'); W(500)
    sv('#detail', 'center', 1200, 60); W(300)
    cap('<i>한 줄</i>만 적으면'); W(500)
    pg.click('#detail'); pg.keyboard.type(DETAIL, delay=70); W(700)
    sv('[data-chm="daangn"]', 'center', 900); W(200)
    cap('올릴 곳은 <i>골라만</i> 주세요')
    pg.evaluate("() => document.querySelector('[data-chm=\"daangn\"]').click()"); W(450); pg.evaluate("() => document.querySelector('[data-chm=\"place\"]').click()"); W(1100)
    sv('#attBox', 'center', 1000); W(200)
    pg.set_input_files('#attBox input[type=file]', AFTER_F); W(600)
    cap('사진은 <i>AI가 화보처럼</i> 보정해요'); W(2200)
    sv('#go', 'center', 1000); W(300)
    cap('<i>알아줌</i>에게 맡기면'); W(700)
    pg.evaluate("() => document.querySelector('#go').click()"); W(2600)
    sv('#result', 'start', 1300); W(300)
    cap('<i>인스타 글</i>이 사진과 함께 완성'); W(1500)
    glide(520, 2200); W(1300)
    sv('#result', 'start', 1200); W(300)
    for k, t in [('blog', '<i>네이버 블로그</i>도'), ('sms', '<i>단골 문자</i>도'), ('daangn', '<i>당근</i> 소식도'), ('place', '<i>플레이스</i> 소식까지')]:
        cap(t); W(250); pg.evaluate("(k) => document.querySelector('[data-setc=\"' + k + '\"]').click()", k); W(1900)
    cap('<i>알아서</i> 한 번에 다 써 줘요'); W(2000)
    cap(OUTRO); W(2600)
    vpath = pg.video.path()
    pg.close(); ctx.close(); b.close()
    print(vpath)
