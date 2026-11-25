from playwright.sync_api import sync_playwright
import json
T=json.dumps({"month":"2026-11","title":"11월 맛집 인기 형식","summary":"첫 줄에 숫자·질문, 저장해 둘 정보 3줄, 사장님 한마디, 끝에 고르는 질문"})
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True); pg=c.new_page(); errs=[]; sent=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    def h(r):
        u=r.request.url
        if 'trend_style' in u: return r.fulfill(status=200,body=T,content_type='application/json')
        if 'functions/v1/generate' in u:
            sent.append(r.request.post_data_json.get('trend'))
            return r.fulfill(status=200,body=json.dumps({"results":{"insta":"테스트 글\n#a","insta_b":"B"},"trend":"11월 맛집 인기 형식","guest":True}),content_type='application/json')
        return r.fulfill(status=500,body='{}',content_type='application/json')
    pg.route('**/*supabase.co/**',h); pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/food/'); pg.wait_for_timeout(900)
    pg.evaluate("document.querySelectorAll('[role=dialog]').forEach(d=>d.remove())")
    pg.evaluate("window.alajoomTab('make')"); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('.tool[data-tool=set]').click()"); pg.wait_for_timeout(900)
    pg.fill('#detail','돈가스 정식 20% 할인')
    pg.evaluate("document.getElementById('trendBox').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/tr_a.png')
    pg.evaluate("document.getElementById('go').click()"); pg.wait_for_timeout(5000)
    pg.evaluate("document.getElementById('result').scrollIntoView()"); pg.wait_for_timeout(300)
    pg.screenshot(path='/tmp/tr_b.png')
    print('sent trend', sent, 'note', pg.evaluate("!!document.querySelector('.trend-done')"))
    print(errs); b.close()
