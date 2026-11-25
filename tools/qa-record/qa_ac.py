from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844})
    pg.on('pageerror',lambda e: errs.append(str(e)[:150]))
    pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='[]',content_type='application/json'))
    pg.goto('http://localhost:8765/academy/'); pg.wait_for_timeout(1200)
    pg.screenshot(path='/tmp/ac_home.png')
    for t in ['set','post','sms','review','card','photo','retouch']:
        pg.evaluate(f"(document.querySelector('[data-tool=\"{t}\"]')||{{}}).click&&document.querySelector('[data-tool=\"{t}\"]').click()"); pg.wait_for_timeout(400)
        if t=='set': pg.screenshot(path='/tmp/ac_set.png',full_page=False)
        if t=='sms': pg.screenshot(path='/tmp/ac_sms.png')
    pg.evaluate("document.querySelector('[data-tab=\"members\"]').click()"); pg.wait_for_timeout(600)
    pg.screenshot(path='/tmp/ac_mem.png')
    txt=pg.inner_text('body')
    for bad in ['회원','필라테스','수강권','PT']:
        if bad in txt: errs.append('word:'+bad)
    b.close()
print(errs or 'OK')
