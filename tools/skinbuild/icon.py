from playwright.sync_api import sync_playwright
def html(size, mask):
    s = size; bub = s*(0.62 if mask else 0.74)
    return f'''<html><body style="margin:0"><div style="width:{s}px;height:{s}px;background:#B83C66;display:flex;align-items:center;justify-content:center;position:relative">
<svg width="{bub}" height="{bub}" viewBox="0 0 100 100"><ellipse cx="50" cy="47" rx="42" ry="39" fill="#FFD43B"/><path d="M22 74 L14 94 L36 80 Z" fill="#FFD43B"/>
<text x="50" y="63" text-anchor="middle" font-family="Noto Sans CJK KR" font-weight="900" font-size="46" fill="#14161F">스</text></svg></div></body></html>'''
with sync_playwright() as p:
    b=p.chromium.launch()
    for size,mask,name in [(192,False,'icon-skin-192.png'),(512,False,'icon-skin-512.png'),(192,True,'icon-skin-maskable-192.png'),(512,True,'icon-skin-maskable-512.png'),(180,False,'apple-touch-skin.png')]:
        pg=b.new_page(viewport={'width':size,'height':size}); pg.set_content(html(size,mask)); pg.wait_for_timeout(200)
        pg.screenshot(path=name,clip={'x':0,'y':0,'width':size,'height':size}); pg.close()
    b.close()
