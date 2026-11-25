const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'ko-KR' });

  await c.addInitScript(() => {
    if (!location.pathname.startsWith('/skin')) return;
    const p = n => (n<10?'0':'')+n, d0 = new Date(), ymd = o => { const d = new Date(d0); d.setDate(d.getDate()+o); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); };
    const mk = (id,name,pass,total,att,price,off) => ({ id, name, phone:'010-****-'+(1000+id.length*1234%9000), pass, total, start: ymd(-off), end: ymd(90-off), memo:'', created: ymd(-off), att: att.map(ymd), pays:[{date: ymd(-Math.min(off,20)), pass, count: total, price, pay:'카드'}] });
    localStorage.setItem('al_beauty_customers_v1', JSON.stringify({ members: [
      mk('a1','김*지','수분 관리',10,[-14,-7,0],650000,15), mk('a22','이*연','기본 얼굴 관리',10,[-20,-10,-3],600000,22),
      mk('a333','박*은','진정 관리',5,[-12,-5],380000,13), mk('a4444','최*아','수분 관리',10,[-6],650000,7), mk('a55555','정*희','기본 얼굴 관리',5,[-25,-18,-11,-4],320000,26)
    ], book: [], rsv: [ {id:'r1',date:ymd(0),time:'11:00',name:'김*지',what:'수분 관리',memo:''}, {id:'r2',date:ymd(0),time:'14:30',name:'최*아',what:'수분 관리',memo:''}, {id:'r3',date:ymd(0),time:'17:00',name:'박*은',what:'진정 관리',memo:''} ] }));
  });
  const pg = await c.newPage();
  const clean = async () => { await pg.waitForTimeout(2500); await pg.evaluate(() => { document.querySelectorAll('[role=dialog],dialog[open],.al-tab,#v-members .mg-entry').forEach(d => d.remove()); }); await pg.waitForTimeout(300); };
  const shots = [
    ['1-home', 'https://alajoom.com/', null],
    ['2-day', 'https://alajoom.com/', '#day'],
    ['3-food', 'https://alajoom.com/food/', 'make'],
    ['4-ledger', 'https://alajoom.com/skin/', 'members'],
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
  <div style="font-size:31px;font-weight:500;color:#5A4A22;line-height:1.45"><b style="font-weight:800;color:#3A2E12">인스타·블로그 마케팅 한 번에 · 장부까지</b><br><span style="font-size:24px">SNS 마케팅 자동 작성 · 사진 보정 · 고객·매출 장부</span></div></div></body></html>`, { waitUntil: 'networkidle' });
  await g.waitForTimeout(1500);
  await g.screenshot({ path: 'out/feature-1024x500.png' });
  await b.close();
})();
