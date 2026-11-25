import json,time
from playwright.sync_api import sync_playwright
sess={"access_token":"x.eyJzdWIiOiJ1MSJ9.y","token_type":"bearer","expires_in":3600,"expires_at":int(time.time())+3600,"refresh_token":"r","user":{"id":"u1","aud":"authenticated","role":"authenticated","email":"a@b.c","app_metadata":{},"user_metadata":{}}}
with sync_playwright() as p:
    b=p.chromium.launch()
    for path,tabs in [('/',[]),('/pilates/',['.mtab[data-tab="make"]','.mtab[data-tab="members"]','.mtab[data-tab="works"]']),('/skin/',['.mtab[data-tab="make"]','.mtab[data-tab="members"]','.mtab[data-tab="works"]']),('/food/',['.tab[data-view="promo"]','.tab[data-view="menu"]','.tab[data-view="ledger"]','.tab[data-view="box"]']),('/terms/',[]),('/privacy/',[])]:
      for login in (False,True):
        for w in (360,390,1280):
          pg=b.new_page(viewport={'width':w,'height':800}); errs=[]
          pg.on('pageerror',lambda e:errs.append(str(e)[:120]))
          if login: pg.add_init_script("localStorage.setItem('sb-zuxbloxstkcixqpzqalk-auth-token',%s);sessionStorage.setItem('al_ob_later','1')"%json.dumps(json.dumps(sess)))
          pg.route('**/rest/v1/profiles**',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps({"business_type":"pilates","store_name":"s","onboarded_at":"x"})))
          pg.route('**/rest/v1/**',lambda r:r.fulfill(status=200,content_type='application/json',body='[]') if 'profiles' not in r.request.url else r.fallback())
          pg.route('**/auth/v1/**',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps(sess['user'])))
          pg.route('**/storage/v1/**',lambda r:r.fulfill(status=200,content_type='application/json',body='[]'))
          pg.route('**/cloudfront.net/**',lambda r:r.abort())
          pg.goto('http://localhost:8765'+path); pg.wait_for_timeout(1000)
          over=[]
          for t in ['']+tabs:
              if t: pg.click(t); pg.wait_for_timeout(250)
              ow=pg.evaluate("document.documentElement.scrollWidth-window.innerWidth")
              if ow>1: over.append((t,ow))
          if errs or over: print(path,login,w,'ERR',errs,'OVER',over)
          pg.close()
    b.close(); print('done')
