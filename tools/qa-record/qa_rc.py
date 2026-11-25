from playwright.sync_api import sync_playwright
import json
S=json.dumps([{"name":"동네사장님 모임","url":"https://example.com","kind":"사장님 카페·모임","reason":"같은 동네 사장님들이랑 정보 나눠요","count":3,"types":["skin","food"]},{"name":"OO 세무사무소","url":None,"kind":"세무·회계","reason":"부가세 신고를 친절하게 알려줬어요","count":1,"types":["cafe"]}])
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,kw,data in [('mo',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True),S),('pc',dict(viewport={'width':1280,'height':800}),'[]')]:
        c=b.new_context(**kw); pg=c.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        def h(r, d=None, data=data): r.fulfill(status=200, body=(data if 'reco_list' in r.request.url else '[]'), content_type='application/json')
        pg.route('**/*supabase.co/**', h)
        pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto('http://localhost:8765/'); pg.wait_for_timeout(1200)
        pg.evaluate("document.getElementById('recos').scrollIntoView({block:'center'})"); pg.wait_for_timeout(1500)
        pg.screenshot(path=f'/tmp/rc_{name}.png'); print(name,errs)
    b.close()
