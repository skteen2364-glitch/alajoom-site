from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h in ((390,844),(360,740),(1280,800)):
        pg=b.new_page(viewport={'width':w,'height':h})
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='{}'))
        pg.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,body=''))
        pg.goto('http://localhost:8765/'); pg.wait_for_timeout(5000); pg.screenshot(path=f'/tmp/f{w}.png')
        print(w,h,errs,pg.evaluate("[document.querySelector('.al-crew-b').getBoundingClientRect().bottom, (document.querySelector('.al-tab')||{getBoundingClientRect:()=>({top:innerHeight})}).getBoundingClientRect().top]"))
    b.close()
