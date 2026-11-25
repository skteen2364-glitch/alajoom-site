const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'ko-KR' });
  const pg = await c.newPage();
  const clean = async () => { await pg.waitForTimeout(2500); await pg.evaluate(() => { document.querySelectorAll('[role=dialog],dialog[open],.al-tab').forEach(d => d.remove()); }); await pg.waitForTimeout(300); };
  const shots = [
    ['1-home', 'https://alajoom.com/', null],
    ['2-day', 'https://alajoom.com/', '#day'],
    ['3-food', 'https://alajoom.com/food/', 'make'],
    ['4-margin', 'https://alajoom.com/skin/', 'margin'],
    ['5-mates', 'https://alajoom.com/', '#mates'],
  ];
  for (const [n, u, t] of shots) {
    await pg.goto(u, { waitUntil: 'networkidle' }).catch(()=>{});
    await clean();
    if (t && t.startsWith('#')) { await pg.evaluate(s => { const e = document.querySelector(s); e && e.scrollIntoView(); }, t); await pg.waitForTimeout(1500); }
    else if (t==='margin') { await pg.evaluate(() => window.alajoomMargin && window.alajoomMargin.open()); await pg.waitForTimeout(1500); }
    else if (t) { await pg.evaluate(t => window.alajoomTab && window.alajoomTab(t), t); await pg.waitForTimeout(1500); await clean(); }
    await pg.screenshot({ path: `out/shot-${n}.png` });
  }
  const g = await b.newPage({ viewport: { width: 1024, height: 500 } });
  await g.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@700&family=Noto+Sans+KR:wght@500;800&display=block" rel="stylesheet"></head>
  <body style="margin:0;width:1024px;height:500px;background:#FFF8E7;display:flex;align-items:center;font-family:'Noto Sans KR';overflow:hidden">
  <img src="https://alajoom.com/assets/icon-512.png" style="width:330px;height:330px;margin:0 40px 0 70px;border-radius:70px;box-shadow:0 14px 40px rgba(120,90,20,.18)">
  <div><div style="display:inline-block;background:#FFD43B;border-radius:30px;padding:8px 22px;font-weight:800;font-size:26px;color:#3A2E12">소상공인 필수 앱 · 무료</div>
  <div style="font-family:Gaegu;font-weight:700;font-size:124px;line-height:1.05;color:#3A2E12;margin:14px 0 6px">알아줌</div>
  <div style="font-size:31px;font-weight:500;color:#5A4A22;line-height:1.45">홍보글 · 사진 보정 · 원가 계산<br>1인 사장님 AI 비서</div></div></body></html>`, { waitUntil: 'networkidle' });
  await g.waitForTimeout(1500);
  await g.screenshot({ path: 'out/feature-1024x500.png' });
  await b.close();
})();
