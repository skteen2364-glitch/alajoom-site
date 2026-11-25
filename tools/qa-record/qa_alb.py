from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,kw in [('pc',dict(viewport={'width':1280,'height':900})),('mo',dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True))]:
        c=b.new_context(**kw); pg=c.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=500,body='{}',content_type='application/json'))
        pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto('http://localhost:8765/skin/'); pg.wait_for_timeout(900)
        pg.evaluate("document.querySelectorAll('[role=dialog]').forEach(d=>d.remove())")
        # 보정 → 사진 저장
        pg.evaluate("window.alajoomTab('make')"); pg.wait_for_timeout(300)
        pg.evaluate("document.querySelector('.tool[data-tool=retouch]').click()"); pg.wait_for_timeout(400)
        for f in ['food-ai-before.jpg','academy-photo.jpg']:
            pg.set_input_files('#phFile','/home/claude/alajoom-site/assets/'+f); pg.wait_for_timeout(1500)
            pg.evaluate("var b=document.querySelector('[data-act=phsave]'); b&&b.click()"); pg.wait_for_timeout(1500)
            pg.evaluate("var b=document.querySelector('[data-act=phnew]'); b&&b.click()"); pg.wait_for_timeout(300)
        # 빈 항목 하나 추가
        pg.evaluate("var k='al_skin_works_v1',l=JSON.parse(localStorage.getItem(k)||'[]');l.push({id:'zz1',tool:'retouch',title:'보정 사진',photo:false,updated:new Date().toISOString()});localStorage.setItem(k,JSON.stringify(l))")
        pg.evaluate("window.alajoomTab('works')"); pg.wait_for_timeout(500)
        pg.screenshot(path=f'/tmp/alb_{name}_list.png')
        pg.evaluate("document.querySelector('[data-wf=retouch]').click()"); pg.wait_for_timeout(900)
        pg.screenshot(path=f'/tmp/alb_{name}_grid.png')
        pg.evaluate("document.querySelector('[data-albv]').click()"); pg.wait_for_timeout(700)
        pg.screenshot(path=f'/tmp/alb_{name}_view.png')
        pg.evaluate("document.querySelector('[data-av=post]').click()"); pg.wait_for_timeout(1500)
        print(name,'set panel', pg.evaluate("document.querySelector('#panel h2').textContent"), 'phBody', pg.evaluate("!document.getElementById('phBody').classList.contains('hidden')"))
        print(name,errs)
    b.close()
