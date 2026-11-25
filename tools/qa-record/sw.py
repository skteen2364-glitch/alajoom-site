import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        pg=await ctx.new_page(); await pg.goto('file:///home/claude/site/index.html?nointro'); await pg.wait_for_timeout(800)
        cdp=await ctx.new_cdp_session(pg)
        async def drag(x0,y0,x1,y1):
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x0,'y':y0}]})
            for i in range(1,11):
                await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x0+(x1-x0)*i/10,'y':y0+(y1-y0)*i/10}]}); await asyncio.sleep(0.016)
            await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        for sec,sel in [('#trust','#trust .trust-row'),('#trust','#trust .trust-row ~ .trust-row'),('#features','#features .feat-row'),('#preview','.pv-row'),('#mates','.mate-grid')]:
            await pg.evaluate(f"document.querySelector('{sec}').scrollIntoView()"); await pg.wait_for_timeout(1500)
            r=await pg.evaluate(f"(()=>{{const e=document.querySelector('{sel}').getBoundingClientRect();return [e.x+e.width/2,e.y+e.height/2]}})()")
            b0=await pg.evaluate(f"document.querySelector('{sel}').scrollLeft")
            await drag(r[0]+120,r[1],r[0]-120,r[1]+2); await pg.wait_for_timeout(900)
            print(sel,[round(x) for x in r],b0,await pg.evaluate(f"document.querySelector('{sel}').scrollLeft"))
        await b.close()
asyncio.run(main())
