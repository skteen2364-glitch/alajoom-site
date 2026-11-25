from playwright.sync_api import sync_playwright
import json,time
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':390,'height':844})
    c.add_init_script("localStorage.setItem('sb-zuxbloxstkcixqpzqalk-auth-token', JSON.stringify({access_token:'x',refresh_token:'y',expires_at:%d,token_type:'bearer',user:{id:'u1',email:'a@b.c',user_metadata:{name:'선경'}}}))" % (int(time.time())+3600))
    c.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='[]',content_type='application/json'))
    pg=c.new_page(); pg.goto('http://localhost:8765/food/'); pg.wait_for_timeout(1500)
    pg.screenshot(path='/tmp/food_m.png',full_page=True)
    b.close()
