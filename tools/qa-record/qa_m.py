from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    for d,name,kw in [('food','pc',dict(viewport={'width':1280,'height':900})),('skin','mo',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True))]:
        c=b.new_context(**kw); pg=c.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=500,body='{}',content_type='application/json'))
        pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto(f'http://localhost:8765/{d}/'); pg.wait_for_timeout(900)
        pg.evaluate("document.querySelectorAll('[role=dialog]').forEach(d=>d.remove())")
        print([x.strip() for x in pg.eval_on_selector_all('.mtab, nav .tab','e=>e.map(x=>x.textContent)')])
        pg.evaluate("window.alajoomTab('make')"); pg.wait_for_timeout(400)
        pg.evaluate("document.querySelector('.tool[data-tool=set]').click()"); pg.wait_for_timeout(500)
        pg.screenshot(path=f'/tmp/m_{name}_a.png', full_page=False)
        print('visible photo tool', pg.evaluate("getComputedStyle(document.querySelector('.tool[data-tool=photo]')).display"), 'go', pg.evaluate("!!document.getElementById('go')"), 'title', pg.evaluate("document.querySelector('#panel h2').textContent"))
        pg.set_input_files('#phFile','/home/claude/alajoom-site/assets/food-ai-before.jpg'); pg.wait_for_selector('#phBody:not(.hidden)'); pg.wait_for_timeout(1200)
        pg.evaluate("document.querySelector('#panel').scrollIntoView()"); pg.wait_for_timeout(300)
        pg.screenshot(path=f'/tmp/m_{name}_b.png', full_page=True)
        pg.click('#go'); pg.wait_for_timeout(2500)
        print('result shown', pg.evaluate("!document.getElementById('result').classList.contains('hidden')"), 'att', pg.evaluate("document.querySelector('#result img')? 'img':'noimg'"))
        print(d,name,errs)
    b.close()
