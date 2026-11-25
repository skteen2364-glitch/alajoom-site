from playwright.sync_api import sync_playwright
import base64
jobs=[('skin','이벤트',6,'첫 방문 고객 / 수분 관리 이벤트',['첫 방문 수분 관리 20% 할인','11월 30일까지 · 예약제','홈케어 샘플 함께 드려요'],'/tmp/card_skin.png'),
      ('pilates','체험 수업',1,'처음이어도 / 괜찮아요',['1:1 기구 체험 수업','평일 저녁 7시 · 2자리 남음','소도구 무료 대여'],'/tmp/card_pil.png')]
with sync_playwright() as p:
    b=p.chromium.launch()
    for mate,topic,tpl,title,lines,out in jobs:
        pg=b.new_page(viewport={'width':390,'height':900}); pg.route('**/*supabase.co/**',lambda r:r.abort())
        pg.goto(f'http://localhost:8765/{mate}/'); pg.wait_for_timeout(1000)
        pg.click('.mtab[data-tab="make"]'); pg.click('.tool[data-tool="card"]'); pg.wait_for_timeout(200)
        pg.click(f'#panel .chip[data-k="topic"][data-v="{topic}"]'); pg.click('#go'); pg.wait_for_timeout(1500)
        pg.click(f'#tplStrip [data-th="{tpl}"]'); pg.wait_for_timeout(300)
        pg.fill('#cTitle',title)
        ls=pg.query_selector_all('.cLine')
        for i,l in enumerate(ls): l.fill(lines[i] if i<len(lines) else '')
        pg.click('[data-act="redraw"]'); pg.wait_for_timeout(500)
        src=pg.get_attribute('#cardImg','src'); open(out,'wb').write(base64.b64decode(src.split(',')[1])); print(out)
    b.close()
