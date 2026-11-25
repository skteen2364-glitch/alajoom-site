from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); c=b.new_context(viewport={'width':412,'height':915},is_mobile=True,has_touch=True,device_scale_factor=2); pg=c.new_page()
    pg.route('**/*supabase.co/**',lambda r:r.fulfill(status=200,body='[]',content_type='application/json'))
    pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/'); pg.wait_for_timeout(2500)
    pg.screenshot(path='/tmp/tab.png')
    print(pg.evaluate("[document.documentElement.scrollWidth, innerWidth, JSON.stringify(document.querySelector('.al-tab a').getBoundingClientRect())]"))
    print(pg.evaluate("(()=>{var r=document.querySelector('.al-tab a').getBoundingClientRect();var e=document.elementFromPoint(r.x+r.width/2,r.y+15);return e.tagName+'.'+e.className+' #'+e.id})()"))
    b.close()
