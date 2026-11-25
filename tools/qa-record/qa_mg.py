from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True); pg=c.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=500,body='{}',content_type='application/json')); pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/nail/'); pg.wait_for_timeout(1200)
    pg.evaluate("document.querySelectorAll('[role=dialog]').forEach(d=>d.remove())")
    print('home entry', pg.evaluate("!!document.querySelector('#v-home .mg-entry')"))
    pg.evaluate("window.alajoomTab('members')"); pg.wait_for_timeout(800)
    print('members entry', pg.evaluate("!!document.querySelector('#v-members .mg-entry')"))
    pg.screenshot(path='/tmp/mg_a.png')
    pg.evaluate("document.querySelector('.mg-entry').click()"); pg.wait_for_timeout(500)
    pg.screenshot(path='/tmp/mg_b.png')
    inp=pg.locator('input[data-i="0"][data-k="p"]'); inp.fill('45000'); pg.wait_for_timeout(800)
    print('focus kept', pg.evaluate("document.activeElement && document.activeElement.dataset.k"))
    pg.evaluate("document.querySelector('.mg-body').scrollTop=600"); pg.wait_for_timeout(200)
    pg.screenshot(path='/tmp/mg_c.png')
    print(errs); b.close()
