from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2); pg=c.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=500,body='{}',content_type='application/json'))
    pg.goto('http://localhost:8765/food/hi/'); pg.wait_for_timeout(1000)
    pg.screenshot(path='/tmp/hi_full.png',full_page=True)
    pg.click('.cta a', force=True); pg.wait_for_timeout(2500)
    print(pg.url, pg.evaluate("document.activeElement && document.activeElement.id"))
    print(errs); b.close()
