from playwright.sync_api import sync_playwright
import sys
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,kw in [('pc',dict(viewport={'width':1280,'height':800})),('mo',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile'))]:
        c=b.new_context(**kw); pg=c.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='{}',content_type='application/json'))
        pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto('http://localhost:8765/skin/'); pg.wait_for_timeout(800)
        pg.evaluate("document.querySelectorAll('[role=dialog]').forEach(d=>d.remove())")
        pg.evaluate("[...document.querySelectorAll('.mtabs button, .mtabs a')].find(b=>/AI/.test(b.textContent)).click()"); pg.wait_for_timeout(400); pg.evaluate("document.querySelector('.tool[data-tool=photo]').click()"); pg.wait_for_timeout(400)
        pg.set_input_files('#phFile','/home/claude/alajoom-site/assets/academy-photo.jpg'); pg.wait_for_selector('#phBody:not(.hidden)',timeout=8000); pg.wait_for_timeout(1500)
        pg.evaluate("document.querySelector('#fltStrip')&&document.querySelector('#fltStrip').scrollIntoView({block:'center'})"); pg.wait_for_timeout(400)
        pg.screenshot(path=f'/tmp/ph_{name}.png')
        print(name,errs)
    b.close()
