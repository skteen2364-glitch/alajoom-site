from playwright.sync_api import sync_playwright
FPS=30; D=5.2; LOOPS=2
with sync_playwright() as p:
    b=p.chromium.launch()
    c=b.new_context(viewport={'width':390,'height':694},device_scale_factor=2.7693)
    pg=c.new_page(); pg.route('**/fonts.g*/**',lambda r:r.abort())
    pg.goto('http://localhost:8765/intro-test/v4/'); pg.wait_for_timeout(800)
    pg.evaluate("""document.querySelectorAll('a[href^="/intro-test/"]').forEach(a=>a.parentNode.style.display='none');
      var s=document.querySelector('.it-skip'); if(s) s.style.visibility='hidden';
      document.getAnimations().forEach(a=>a.pause());""")
    n=int(FPS*D*LOOPS)
    for i in range(n):
        t=(i/FPS)*1000
        pg.evaluate(f"document.getAnimations().forEach(a=>a.currentTime={t})")
        pg.screenshot(path=f'/tmp/intro_frames/f{i:04d}.png')
    print(n)
    b.close()
