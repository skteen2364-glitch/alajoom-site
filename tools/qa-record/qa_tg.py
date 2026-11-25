from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    for d in ['food','skin']:
     for name,kw in [('pc',dict(viewport={'width':1280,'height':800})),('mo',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True))]:
        c=b.new_context(**kw); pg=c.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='{}',content_type='application/json'))
        pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto(f'http://localhost:8765/{d}/'); pg.wait_for_timeout(800)
        pg.evaluate("document.querySelectorAll('[role=dialog]').forEach(d=>d.remove())")
        pg.evaluate("var v=document.querySelector('#v-promo,#v-make');var t=[...document.querySelectorAll('[data-view],[data-v],[data-tab],[aria-controls]')].find(b=>[b.dataset.view,b.dataset.v,b.dataset.tab,b.getAttribute('aria-controls')].includes(v.id.slice(2))||b.getAttribute('aria-controls')==v.id);t?t.click():console.log('none')"); pg.wait_for_timeout(500)
        pg.evaluate("var l=document.querySelector('.qlab');l&&l.scrollIntoView({block:'start'});window.scrollBy(0,-70)"); pg.wait_for_timeout(300)
        pg.screenshot(path=f'/tmp/tg_{d}_{name}.png'); print(d,name,errs)
    b.close()
