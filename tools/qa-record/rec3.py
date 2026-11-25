from playwright.sync_api import sync_playwright
FPS=30; D=6.0
with sync_playwright() as p:
    b=p.chromium.launch()
    c=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1920/844)
    pg=c.new_page(); pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/_old_intro.html'); pg.wait_for_timeout(600)
    pg.evaluate("var s=document.querySelector('.it-skip');if(s)s.style.visibility='hidden';document.getAnimations().forEach(a=>a.pause())")
    for i in range(int(FPS*D)):
        pg.evaluate(f"document.getAnimations().forEach(a=>a.currentTime={i*1000/FPS})")
        pg.screenshot(path=f'/tmp/oi/f{i:04d}.png')
    b.close()
