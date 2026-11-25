from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,kw in [('pc',dict(viewport={'width':1280,'height':800})),('mo',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True))]:
        c=b.new_context(**kw); pg=c.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='[]',content_type='application/json'))
        pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto('http://localhost:8765/'); pg.wait_for_timeout(1200)
        for sec in ['mates','family','how','video','erp']:
            pg.evaluate(f"document.getElementById('{sec}').scrollIntoView()"); pg.wait_for_timeout(2600)
            pg.screenshot(path=f'/tmp/n_{name}_{sec}.png')
        if name=='mo':
            pg.evaluate("document.getElementById('mates').scrollIntoView()"); pg.wait_for_timeout(500)
            pg.evaluate("document.querySelector('.mc[data-cat=beauty]').click()"); pg.wait_for_timeout(500); pg.screenshot(path='/tmp/n_mo_cat.png')
        print(name,errs)
    b.close()
