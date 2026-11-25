from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True); pg=c.new_page()
    def h(r):
        u=r.request.url
        if 'auth/v1/settings' in u: return r.fulfill(status=200,body='{"external":{"kakao":true}}',content_type='application/json')
        return r.fulfill(status=200,body='[]',content_type='application/json')
    pg.route('**/*supabase.co/**',h); pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/'); pg.wait_for_timeout(1500)
    pg.evaluate("document.getElementById('family').scrollIntoView()"); pg.wait_for_timeout(800)
    pg.click('.af-go', force=True); pg.wait_for_timeout(500)
    print('login open', pg.evaluate("document.getElementById('dz-login').classList.contains('on')"), pg.url)
    b.close()
