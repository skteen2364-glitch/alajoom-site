base='/home/claude/alajoom-site/'
JS=r'''  /* ---------- 작업실 사진 자동 찾기: 말한 메뉴와 맞는 보정 사진 ---------- */
  var ALB_STOP = /^(사진|보정|할인|이벤트|오늘|이번|이번주|이번달|주말|평일|저녁|점심|아침|메뉴|신메뉴|주문|예약|손님|고객|가게|매장|원장님|사장님|안내|소개|진행|시작|오픈|특가|세일|무료|증정|드려요|합니다|해요|있어요|까지|부터|만|씩)$/;
  function albTokens(t){ return String(t || '').replace(/[0-9%~!?.,()\[\]"'·:;\/+\-]/g, ' ').split(/\s+/).map(function(w){ return w.replace(/(은|는|이|가|을|를|에|에서|으로|로|와|과|도|만|랑|이랑|하고|세트|정식)$/, ''); }).filter(function(w){ return w.length >= 2 && !ALB_STOP.test(w); }); }
  async function albumFind(text){
    var tk = albTokens(text); if (!tk.length) return null;
    var best = null, bs = 0;
    albumBlobs().forEach(function(w){
      var hay = ((w.tag || '') + ' ' + (/^보정 사진/.test(w.title || '') ? '' : (w.title || ''))).replace(/\s+/g, '');
      if (!hay) return;
      var s = 0; tk.forEach(function(k){ if (hay.indexOf(k) >= 0) s += k.length; });
      if (s > bs){ bs = s; best = w; }
    });
    if (!best) return null;
    var b = await workPhoto(best.id); return b ? { w: best, b: b } : null;
  }
  function albTagSet(id, tag){ var list = wLoad(), w = list.filter(function(x){ return x.id === id; })[0]; if (!w) return; w.tag = String(tag || '').trim().slice(0, 30); w.updated = new Date().toISOString(); wSave(list); srvPut(w, null); }
  function albHitNote(w){
    var n = document.getElementById('albHit'); if (n) n.remove();
    var anchor = document.getElementById('phBody'); if (!anchor) return;
    anchor.insertAdjacentHTML('afterbegin', '<div id="albHit" class="alb-hit"><span>작업실 보정한 사진에서 <b>' + esc(w.tag || w.title || '사진') + '</b> 사진을 찾아서 넣었어요.</span><button type="button" class="sub" data-albpick="1">다른 사진 고르기</button></div>');
  }
  function albPicker(){
    var list = albumBlobs();
    if (!list.length){ toast('작업실에 보정한 사진이 아직 없어요. 사진을 올려 주세요'); return; }
    var v = document.createElement('div'); v.className = 'alb-view'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true');
    v.innerHTML = '<div class="alb-bg" data-ap="x"></div><div class="alb-pan"><button type="button" class="alb-x" data-ap="x" aria-label="닫기">×</button><b style="font-size:16px">작업실 사진에서 고르기</b><div class="rt-grid alb-grid">' + list.map(function(w){ return '<button type="button" data-ap="' + w.id + '" data-wthumb="' + w.id + '" aria-label="' + esc(w.tag || w.title || '보정 사진') + '"><span>' + esc(w.tag || w.title || '') + '</span></button>'; }).join('') + '</div></div>';
    document.body.appendChild(v);
    v.querySelectorAll('[data-wthumb]').forEach(function(el){ workPhoto(el.dataset.wthumb).then(function(b){ if (b) el.style.backgroundImage = 'url(' + URL.createObjectURL(b) + ')'; }); });
    v.addEventListener('click', async function(e){
      var t = e.target.closest('[data-ap]'); if (!t) return; var id = t.dataset.ap; v.remove(); if (id === 'x') return;
      var b = await workPhoto(id); if (!b){ toast('사진을 찾지 못했어요'); return; }
      await loadPhoto(new File([b], 'photo.jpg', { type: b.type || 'image/jpeg' }));
      var w = wLoad().filter(function(x){ return x.id === id; })[0]; if (w) albHitNote(w);
      var hn = document.getElementById('albHit'); if (hn) hn.querySelector('span').innerHTML = '작업실 사진 <b>' + esc((w && (w.tag || w.title)) || '') + '</b>을 넣었어요.';
      toast('사진을 넣었어요. 보정하고 만들기를 누르세요');
    });
  }
  document.addEventListener('click', function(e){ var t = e.target.closest && e.target.closest('[data-albpick]'); if (t) albPicker(); });
'''
CSS='''
.alb-hit{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;background:#FFF6D6;border:1px solid #F2DE9C;font-size:13.5px}
.alb-hit span{flex:1;min-width:180px}.alb-hit .sub{flex:none !important;width:auto !important;min-width:0;min-height:34px;padding:0 12px;font-size:12.5px}
.alb-tag{display:flex;gap:6px;align-items:center}.alb-tag input{flex:1;min-width:0;font:inherit;font-size:15px;padding:9px 11px;border:1px solid var(--line);border-radius:10px}
.alb-pickbtn{align-self:flex-start;min-width:0 !important;width:auto !important;flex:none !important;padding:0 14px !important}
'''
R=[
 # 1단계에 '작업실 사진에서 고르기'
 ("    h += '<div class=\"alt-pick\" id=\"altPick\">","    if (MS && albumBlobs().length) h += '<button type=\"button\" class=\"sub alb-pickbtn\" data-albpick=\"1\">작업실 사진에서 고르기 (' + albumBlobs().length + '장)</button>';\n    h += '<div class=\"alt-pick\" id=\"altPick\">"),
 # 만들기: 사진 없으면 작업실에서 찾기, 올린 사진은 사진첩에 저장
 ("if (tool === 'set' && $('#phBody')){ return (async function(){ if (ph.img){ var pb = null; try { pb = await photoBlob(1600, .86); } catch(er){} await setAtt(pb); } generate(); })(); }",
  "if (tool === 'set' && $('#phBody')){ return (async function(){ var dtx = (($('#detail') && $('#detail').value) || '') + ' ' + (pick.topic || ''), found = null; if (!ph.img && !att){ try { found = await albumFind(dtx); } catch(er){} if (found){ await loadPhoto(new File([found.b], 'photo.jpg', { type: found.b.type || 'image/jpeg' })); albHitNote(found.w); toast('작업실에서 맞는 사진을 찾아서 넣었어요'); } else if (albumBlobs().length || dtx.trim()) toast('맞는 사진이 없어서 글만 써요. 사진을 올리면 같이 넣어 드려요'); } if (ph.img){ var pb = null; try { pb = await photoBlob(1600, .86); } catch(er){} await setAtt(pb); if (!found && pb && !document.getElementById('albHit')){ try { await albumSave(pb, (($('#detail') && $('#detail').value) || '').trim().slice(0, 30)); var nl = wLoad(); if (nl[0] && nl[0].tool === 'retouch' && !nl[0].tag){ nl[0].tag = (($('#detail') && $('#detail').value) || '').trim().slice(0, 30); wSave(nl); } } catch(er){} } } generate(); })(); }"),
 # 사진 크게 보기: 메뉴 이름 붙이기
 ("'<div class=\"alb-acts\"><button type=\"button\" class=\"sub primary\" data-av=\"save\">사진 저장</button>",
  "'<label class=\"alb-tag\"><input id=\"albTag\" maxlength=\"30\" placeholder=\"메뉴·시술 이름 (예: 돈가스)\" value=\"' + esc(w.tag || '') + '\"><button type=\"button\" class=\"sub\" data-av=\"tag\" style=\"min-width:0;flex:none;padding:0 12px\">이름 저장</button></label><p class=\"note\" style=\"margin:-4px 0 0;font-weight:500\">이름을 붙여 두면 \"돈가스 20% 할인\"처럼 말할 때 이 사진을 알아서 찾아 넣어요.</p>' + '<div class=\"alb-acts\"><button type=\"button\" class=\"sub primary\" data-av=\"save\">사진 저장</button>"),
 ("      if (a === 'x') return close();\n      if (a === 'save'){",
  "      if (a === 'x') return close();\n      if (a === 'tag'){ var tv = document.getElementById('albTag').value; albTagSet(id, tv); w.tag = tv; toast('이름을 붙였어요'); renderWorks(); return; }\n      if (a === 'save'){"),
 # 썸네일에 이름 보이기
 ("<span>' + esc(w.title || '') + '</span>' + (picking","<span>' + esc(w.tag || w.title || '') + '</span>' + (picking"),
]
for d in 'skin nail hair pilates academy food cafe bakery'.split():
    p=base+d+'/index.html'; s=open(p).read()
    if 'function albumFind' in s: print('skip',d); continue
    for a,b in R:
        assert s.count(a)==1,(d,a[:60]); s=s.replace(a,b)
    a='  function renderTrash(box){'; s=s.replace(a,JS+a)
    s=s.replace('<style id="tool-grid">','<style id="tool-grid">'+CSS,1)
    # 보정 화면에서 저장할 때 사진 글자를 이름으로
    s=s.replace("await albumSave(sb2, ph.text || '');","await albumSave(sb2, ph.text || ''); var al2 = wLoad(); if (al2[0] && al2[0].tool === 'retouch' && ph.text && !al2[0].tag){ al2[0].tag = ph.text.slice(0, 30); wSave(al2); }")
    open(p,'w').write(s); print('ok',d)
