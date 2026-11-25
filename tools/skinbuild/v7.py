import sys, re
CSS = """
.out-c em.ai{background:linear-gradient(90deg,#7C3AED,#DB2777);color:#fff}
.ai-box{border:1px solid #E9D5FF;border-radius:16px;background:linear-gradient(160deg,#FAF5FF,#FFF1F7);padding:16px;display:flex;flex-direction:column;gap:10px}
.ai-box b{font-size:16px}.ai-box p{margin:0;font-size:13.5px;color:var(--muted);line-height:1.55}
.ai-box .ai-prev{position:relative;border-radius:12px;overflow:hidden;background:#000;max-height:320px;display:flex;justify-content:center}
.ai-box .ai-prev img{max-width:100%;max-height:320px;object-fit:contain;display:block}
.ai-box .ai-prev.run::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);background-size:220% 100%;animation:aiSh 1.4s linear infinite}
@keyframes aiSh{from{background-position:120% 0}to{background-position:-120% 0}}
.ai-go{min-height:52px;border:0;border-radius:14px;background:linear-gradient(90deg,#7C3AED,#DB2777);color:#fff;font:inherit;font-size:16px;font-weight:900;cursor:pointer}
.ai-go:disabled{opacity:.75;cursor:wait}
.ai-note{font-size:12px!important}
"""
JS = r"""
  // ===== v7: AI 사진 보정 (Gemini) =====
  var AI_DEF = {
    space: ['pro', 'AI 공간 보정', '프로 사진가가 찍은 것처럼', 'AI가 어둡고 누런 빛을 바로잡고, 굴러다니는 물건·전선 같은 잡동사니만 정리해요. 가구·기구·배치는 그대로라 실제 공간 그대로예요.', 0],
    equip: ['product', 'AI 제품 연출', '제품은 그대로, 배경만 화보처럼', '제품 모양·라벨은 그대로 두고, 책상 위에 대충 찍은 배경을 깔끔한 스튜디오 배경으로 바꿔요.', 1],
    mood:  ['mood', 'AI 감성 연출', '같은 장면을 화보 분위기로', '찍은 장면은 그대로 두고, 부드러운 빛과 차분한 톤으로 화보처럼 연출해요.', 1],
    table: ['delivery', 'AI 배달앱 사진', '음식은 그대로, 배경만 깔끔하게', '음식 양·토핑·그릇은 절대 바꾸지 않고, 어수선한 주변만 깨끗한 테이블로 바꿔요. 배달앱·플레이스 대표 사진에 좋아요.', 1],
    top:   ['pro', 'AI 프로 보정', '빛·색·지저분한 것만 정리', '음식은 그대로 두고, 누런 조명을 자연광처럼 바로잡고 테이블의 휴지·얼룩 같은 것만 정리해요.', 0]
  };
  if (/\/food\//.test(location.pathname)) AI_DEF.mood = ['store', 'AI 매장 연출', '음식은 그대로, 식당 화보처럼', '음식 양·토핑·그릇은 그대로 두고, 따뜻한 자연광이 드는 식당 테이블 위 화보처럼 연출해요.', 1];
  (function(){
    CFG.photo.outputs.forEach(function(o){
      var a = AI_DEF[o.key]; if (o.key === 'enhance'){ o.name = '기본 보정'; o.desc = '무료 · 바로 밝고 깨끗하게'; return; }
      if (!a) return; o.live = true; o.ai = a[0]; o.name = a[1]; o.desc = a[2]; o.long = a[3]; o.mark = !!a[4];
    });
  })();
  function aiOut(){ return CFG.photo.outputs.filter(function(x){ return x.key === ph.out; })[0]; }
  function srcCanvas(maxSide){
    var im = ph.src, s = Math.min(1, maxSide / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
    c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s);
    var x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, c.width, c.height); return c;
  }
  function useAI(o){
    var keep = ph.img; ph.img = ph.src; ph.cmp = render(1200, false).toDataURL('image/jpeg', .85); ph.img = ph.ai[o.key];
    ph.mark = !!o.mark; analyse(); applyPreset('orig');
    var tg = $('#phTag'); if (tg) tg.textContent = o.name + ' 완료';
  }
  function useSrc(){
    if (!ph.src) return; ph.cmp = ''; ph.mark = false;
    if (ph.img !== ph.src){ ph.img = ph.src; analyse(); applyPreset('auto'); }
  }
  function showOut(){
    var o = aiOut(), soon = $('#phSoon'), ed = $('#phEdit'); if (!soon || !ed) return;
    if (!o || !o.ai){ useSrc(); soon.classList.add('hidden'); ed.style.display = 'flex'; return; }
    if (ph.ai && ph.ai[o.key]){ useAI(o); soon.classList.add('hidden'); ed.style.display = 'flex'; return; }
    ed.style.display = 'none'; soon.classList.remove('hidden'); soon.className = 'ai-box';
    var prev = ph.src ? srcCanvas(900).toDataURL('image/jpeg', .85) : '';
    soon.innerHTML = '<b>' + o.name + '</b><p>' + o.long + '</p>' + (prev ? '<div class="ai-prev" id="aiPrev"><img alt="올린 원본 사진" src="' + prev + '"></div>' : '') +
      '<button type="button" class="ai-go" data-act="aigo">AI로 만들기</button>' +
      '<p class="ai-note">10~20초 걸려요 · 하루 3장 무료 · 마음에 안 들면 다시 만들 수 있어요' + (o.mark ? ' · 배경을 바꾼 사진엔 작은 \'AI 연출\' 표시가 들어가요' : '') + '</p>' +
      '<button type="button" class="sub" data-out="enhance">기본 보정으로 하기</button>';
  }
  var aiBusy = false;
  async function aiGo(btn){
    var o = aiOut(); if (!o || !o.ai || !ph.src || aiBusy) return;
    if (!window.alajoomAI || !window.alajoomAI.photo || !(await window.alajoomAI.loggedIn())){
      toast('AI 사진은 카카오 로그인 후 쓸 수 있어요');
      if (window.alajoomLogin) setTimeout(function(){ if (confirm('카카오로 로그인할까요?')) window.alajoomLogin(); }, 300);
      return;
    }
    aiBusy = true; btn.disabled = true; var pv = $('#aiPrev'); if (pv) pv.classList.add('run');
    var msgs = ['사진을 살펴보는 중이에요', '빛을 다시 잡는 중이에요', '색을 맞추는 중이에요', '주변을 정리하는 중이에요', '마무리하는 중이에요'], mi = 0;
    btn.textContent = msgs[0] + '…'; var tm = setInterval(function(){ mi = Math.min(msgs.length - 1, mi + 1); btn.textContent = msgs[mi] + '…'; }, 3500);
    try {
      var blob = await new Promise(function(r){ srcCanvas(1536).toBlob(r, 'image/jpeg', .9); });
      var d = await window.alajoomAI.photo(o.ai, blob);
      var im = new Image(); await new Promise(function(r, j){ im.onload = r; im.onerror = j; im.src = 'data:' + (d.mimeType || 'image/png') + ';base64,' + d.image; });
      ph.ai = ph.ai || {}; ph.ai[o.key] = im; showOut();
      var w = $('.ph-wrap'); if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast(d.limit ? 'AI 사진 완성! 원본은 사진을 누르고 있으면 보여요 · 오늘 ' + Math.max(0, d.limit - d.used) + '장 남음' : 'AI 사진 완성!');
    } catch(e){ btn.disabled = false; btn.textContent = '다시 시도하기'; if (pv) pv.classList.remove('run'); }
    finally { clearInterval(tm); aiBusy = false; }
  }
  document.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('[data-act="aigo"]'); if (b){ e.preventDefault(); aiGo(b); } });
  function aiMark(c, u, F){
    var x = c.getContext('2d'), fs = Math.round(22 * u), pad = Math.round(10 * u), t = 'AI 연출';
    x.save(); x.font = '700 ' + fs + 'px ' + F; var tw = x.measureText(t).width, bw = tw + pad * 2, bh = fs + pad * 1.4, bx = c.width - bw - Math.round(18 * u), by = Math.round(18 * u);
    x.fillStyle = 'rgba(20,14,16,.45)'; if (x.roundRect){ x.beginPath(); x.roundRect(bx, by, bw, bh, bh / 2); x.fill(); } else x.fillRect(bx, by, bw, bh);
    x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText(t, bx + pad, by + bh / 2 + 1); x.restore();
  }
"""
for f in sys.argv[1:]:
    s = open(f).read()
    if 'v7: AI 사진 보정' in s: print('skip', f); continue
    def rep(a, b, cnt=1):
        global s
        assert s.count(a) >= 1, (f, a[:60]); s = s.replace(a, b, cnt)
    k = s.index('</style>'); s = s[:k] + CSS + s[k:]
    # 기존 showOut 제거 (새 것으로 교체)
    i = s.index('  function showOut(){'); j = s.index('  function markPreset(){', i); s = s[:i] + s[j:]
    # 새 코드: renderPhoto 앞에
    i = s.index('  function renderPhoto(){'); s = s[:i] + JS + s[i:]
    rep("(o.live ? '' : 'soon') + '\">' + (o.live ? '지금 사용' : '연결 예정')", "(o.ai ? 'ai' : '') + '\">' + (o.ai ? 'AI · 하루 3장' : '무료')")
    rep("ph.img = img; analyse();", "ph.img = img; ph.src = img; ph.ai = {}; ph.cmp = ''; ph.mark = false; analyse();")
    rep("$('#phBody').classList.remove('hidden'); };", "$('#phBody').classList.remove('hidden'); showOut(); };")
    rep("o ? ph.orig : ph.url", "o ? (ph.cmp || ph.orig) : ph.url")
    rep("return drawFrame(c, x, W, H, u, F);", "var _fc = drawFrame(c, x, W, H, u, F); if (ph.mark && withAdj) aiMark(_fc, u, F); return _fc;")
    # 사진 보정 도구에서도 AI 선택지 보이게
    rep("if (el.classList.contains('outs') || (el.tagName === 'P' && /어떤 사진으로/.test(el.textContent))) el.remove();",
        "if (el.tagName === 'P' && /어떤 사진으로/.test(el.textContent)) el.innerHTML = '<span class=\"stepno\">2</span>어떻게 보정할까요?';")
    open(f, 'w').write(s); print('ok', f)
