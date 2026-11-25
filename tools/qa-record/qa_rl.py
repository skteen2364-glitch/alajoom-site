from playwright.sync_api import sync_playwright
import sys
with sync_playwright() as p:
    b=p.chromium.launch()
    for d,name,kw in [('food','pc',dict(viewport={'width':1280,'height':900})),('skin','mo',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True))]:
        c=b.new_context(**kw); pg=c.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='{}',content_type='application/json'))
        pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto(f'http://localhost:8765/{d}/'); pg.wait_for_timeout(900)
        pg.evaluate("document.querySelectorAll('[role=dialog]').forEach(d=>d.remove())")
        pg.evaluate("var v=document.querySelector('#v-promo,#v-make');var t=[...document.querySelectorAll('[data-view],[data-v],[data-tab],[aria-controls]')].find(b=>[b.dataset.view,b.dataset.v,b.dataset.tab,b.getAttribute('aria-controls')].includes(v.id.slice(2)));t&&t.click()"); pg.wait_for_timeout(400)
        pg.evaluate("var l=document.querySelector('.qlab');l.scrollIntoView();window.scrollBy(0,-70)"); pg.wait_for_timeout(200)
        pg.screenshot(path=f'/tmp/rl_{name}_menu.png')
        pg.evaluate("document.querySelector('.tool[data-tool=reels]').click()"); pg.wait_for_timeout(400)
        A='/home/claude/alajoom-site/assets/'
        pg.set_input_files('#rlFile',[A+'food-ai-before.jpg',A+'food-ai-after.jpg',A+'academy-photo.jpg'])
        pg.wait_for_selector('#rlBody:not(.hidden)'); pg.fill('#rlLine','12월 첫 방문 20% 할인 이벤트'); pg.wait_for_timeout(1700)
        pg.evaluate("document.querySelector('#rlCv').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
        pg.screenshot(path=f'/tmp/rl_{name}_prev.png')
        if name=='pc':
            pg.click('#rlMake'); pg.wait_for_selector('#rlDone:not(.hidden)',timeout=40000)
            print(pg.evaluate("document.querySelector('#rlProg').textContent"))
            pg.evaluate("document.querySelector('#rlDone').scrollIntoView({block:'center'})"); pg.screenshot(path=f'/tmp/rl_{name}_done.png')
        print(d,name,errs)
    b.close()
