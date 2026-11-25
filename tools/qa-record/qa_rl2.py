from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':1280,'height':900}); pg=c.new_page()
    pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='{}',content_type='application/json'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/food/'); pg.wait_for_timeout(900)
    pg.evaluate("localStorage.setItem('pm_푸드메이트_studio',JSON.stringify({name:'골목밥상',area:'망원동',contact:'카카오톡 채널 · 전화 02-123-4567'}))")
    pg.evaluate("document.querySelectorAll('[role=dialog]').forEach(d=>d.remove())")
    pg.evaluate("var v=document.querySelector('#v-promo');var t=[...document.querySelectorAll('[data-view],[data-v],[data-tab],[aria-controls]')].find(b=>[b.dataset.view,b.dataset.v,b.dataset.tab].includes('promo'));t&&t.click()")
    pg.evaluate("document.querySelector('.tool[data-tool=reels]').click()"); pg.wait_for_timeout(400)
    A='/home/claude/alajoom-site/assets/'
    pg.set_input_files('#rlFile',[A+'food-ai-before.jpg',A+'food-ai-after.jpg'])
    pg.wait_for_selector('#rlBody:not(.hidden)')
    for ms,nm in [(2000,'a'),(6200,'b')]:
        pg.wait_for_timeout(ms if nm=='a' else 4200)
        pg.locator('#rlCv').screenshot(path=f'/tmp/rl_f{nm}.png')
    b.close()
