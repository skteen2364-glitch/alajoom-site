from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (360,390,1280):
        for path in ('/','/skin/','/food/','/pilates/','/academy/','/nail/','/hair/','/cafe/','/bakery/'):
            pg=b.new_page(viewport={'width':w,'height':800})
            pg.on('pageerror',lambda e,path=path,w=w: errs.append((w,path,str(e)[:120])))
            pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='[]',content_type='application/json'))
            pg.goto('http://localhost:8765'+path); pg.wait_for_timeout(1200)
            ov=pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')
            if ov: errs.append((w,path,'overflow'))
            pg.close()
    b.close()
print(errs or 'OK')
