from playwright.sync_api import sync_playwright
import sys
with sync_playwright() as p:
    b=p.chromium.launch()
    for v in ['v4','v1']:
        c=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1)
        pg=c.new_page(); pg.route('**/fonts.g*/**',lambda r:r.abort())
        pg.goto(f'http://localhost:8765/intro-test/{v}/'); pg.wait_for_timeout(2300)
        pg.screenshot(path=f'/tmp/intro_{v}.png')
        print(v, pg.evaluate("[document.body.scrollHeight, (document.querySelector('.it-stage')||{}).getBoundingClientRect && JSON.stringify(document.querySelector('.it-stage').getBoundingClientRect())]"))
    b.close()
