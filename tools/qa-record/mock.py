import base64
from playwright.sync_api import sync_playwright
def b64(p): return 'data:image/png;base64,'+base64.b64encode(open(p,'rb').read()).decode()
M=[dict(out='/home/claude/alajoom-site/assets/skin-card.jpg',card='/tmp/card_skin.png',bg1='#FBE7EE',bg2='#FFF3D6',acc='#B83C66',shop='bomgyeol_skin',name='봄결 스킨케어',
        cap='첫 방문 고객님께 수분 관리 20% 🌿 예약은 프로필 링크에서',msg='김지은님, 봄결 스킨케어예요 😊 내일(목) 오전 11시 수분 관리 예약 확인드려요. 변경 필요하시면 편하게 답장 주세요!',tag='예약 확인 문자'),
   dict(out='/home/claude/alajoom-site/assets/pilates-card.jpg',card='/tmp/card_pil.png',bg1='#E6ECF5',bg2='#FFF3D6',acc='#3B5B92',shop='haru_pilates',name='하루필라테스',
        cap='필라테스 처음이세요? 1:1 체험부터 가볍게 🙌',msg='박하늘 회원님, 하루필라테스예요! 수강권이 2회 남았어요. 지금처럼 꾸준히 이어가실 수 있게 재등록 안내드려요 💪',tag='재등록 안내 문자')]
H='''<html><head><style>
*{box-sizing:border-box}body{margin:0;width:1200px;height:900px;font-family:"Noto Sans CJK KR","Noto Sans KR",sans-serif;background:linear-gradient(135deg,{bg1},{bg2});position:relative;overflow:hidden}
.c1{position:absolute;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.45);left:-160px;top:-180px}
.c2{position:absolute;width:300px;height:300px;border-radius:50%;background:{acc};opacity:.10;right:-60px;bottom:-80px}
.ph{position:absolute;left:150px;top:70px;width:420px;height:860px;border-radius:56px;background:#14161F;padding:14px;box-shadow:0 40px 80px -30px rgba(20,22,31,.55);transform:rotate(-4deg)}
.sc{width:100%;height:100%;border-radius:44px;background:#fff;overflow:hidden}
.top{display:flex;align-items:center;gap:10px;padding:46px 18px 12px}
.av{width:38px;height:38px;border-radius:50%;background:conic-gradient(#F58529,#DD2A7B,#8134AF,#F58529);padding:3px}.av i{display:block;width:100%;height:100%;border-radius:50%;background:{acc};border:2px solid #fff}
.top b{font-size:15px}.top small{display:block;font-size:12px;color:#8A8F9C}
.img{width:100%;aspect-ratio:4/5;background:url({card}) center/cover}
.ic{display:flex;gap:16px;padding:12px 18px 6px;font-size:24px}
.cap{padding:0 18px;font-size:14px;line-height:1.5}.cap b{margin-right:6px}
.bub{position:absolute;right:90px;top:250px;width:440px;background:#fff;border-radius:28px;padding:22px 24px;box-shadow:0 30px 60px -28px rgba(20,22,31,.45)}
.bub .h{display:flex;align-items:center;gap:10px;margin-bottom:12px}.bub .k{width:40px;height:40px;border-radius:12px;background:#FEE500;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px}
.bub .h b{font-size:17px}.bub .h small{display:block;font-size:13px;color:#8A8F9C}
.bub p{margin:0;background:#FFF7C2;border-radius:6px 20px 20px 20px;padding:14px 16px;font-size:18px;line-height:1.55;color:#14161F}
.chip{position:absolute;right:120px;top:120px;background:#14161F;color:#FFE45C;font-weight:900;font-size:22px;padding:14px 22px;border-radius:999px;box-shadow:0 18px 30px -16px rgba(0,0,0,.5)}
.chip2{position:absolute;right:250px;top:650px;background:{acc};color:#fff;font-weight:800;font-size:19px;padding:12px 20px;border-radius:999px}
</style></head><body><div class="c1"></div><div class="c2"></div>
<div class="ph"><div class="sc"><div class="top"><span class="av"><i></i></span><div><b>{shop}</b><small>{name}</small></div></div><div class="img"></div>
<div class="ic">♡ 💬 ↗</div><div class="cap"><b>{shop}</b>{cap}</div></div></div>
<div class="chip">AI 직원이 한 번에 완성</div>
<div class="bub"><div class="h"><span class="k">톡</span><div><b>{tag}</b><small>고객 장부에서 바로</small></div></div><p>{msg}</p></div>
<div class="chip2">✓ 광고 표현 검사 통과</div>
</body></html>'''
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1200,'height':900})
    for m in M:
        h=H
        for k,v in m.items(): h=h.replace('{'+k+'}', b64(v) if k=='card' else v)
        pg.set_content(h); pg.wait_for_timeout(500); pg.screenshot(path=m['out'],type='jpeg',quality=84); print(m['out'])
    b.close()
