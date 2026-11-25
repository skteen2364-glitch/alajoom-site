from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,kw in [('pc',dict(viewport={'width':1280,'height':800})),('mo',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)),('mo2',dict(viewport={'width':360,'height':740},is_mobile=True,has_touch=True))]:
        c=b.new_context(**kw); pg=c.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='[]',content_type='application/json'))
        pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto('http://localhost:8765/'); pg.wait_for_timeout(1200)
        pg.evaluate("document.getElementById('help').scrollIntoView()"); pg.wait_for_timeout(1500)
        pg.screenshot(path=f'/tmp/help_{name}.png')
        print(name,errs, pg.evaluate("[document.getElementById('help').getBoundingClientRect().height, innerHeight]"))
    b.close()
