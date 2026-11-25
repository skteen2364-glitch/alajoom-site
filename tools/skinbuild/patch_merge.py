base='/home/claude/alajoom-site/'
R=[
("  function renderPhoto(){","  function renderPhoto(){ var MS = tool === 'set';"),
("var h = '<h2>사진 올리고 홍보하기</h2>';","var h = '<h2>' + (MS ? '홍보글 한 번에' : '사진 올리고 홍보하기') + '</h2>';"),
("<span class=\"stepno\">1</span>사진 올리기</p>';","<span class=\"stepno\">1</span>사진 올리기' + (MS ? ' <small style=\"font-weight:500;color:var(--muted)\">(선택 · 올리면 바로 보정해요)</small>' : '') + '</p>';"),
("    h += '<hr style=\"border:0;border-top:1px solid var(--line);margin:2px 0\">';","    if (MS) h += '</div>';\n    h += '<hr style=\"border:0;border-top:1px solid var(--line);margin:2px 0\">';"),
("P.topics.map(function(o, i){","(MS ? TOOLS.set.steps[0].opts : P.topics).map(function(o, i){"),
("pick = { topic:P.topics[0], ch:'인스타' };","pick = { topic:(MS ? TOOLS.set.steps[0].opts[0] : P.topics[0]), ch:'인스타' }; if (MS){ ph.img = null; }"),
('<button class="go" type="button" id="goSet">이 사진으로 홍보글 세트 만들기</button>',"' + (MS ? '<button class=\"go\" type=\"button\" id=\"go\" style=\"background:#FFD43B;color:#14161F\">홍보글 세트 만들기</button>' : '<button class=\"go\" type=\"button\" id=\"goSet\">이 사진으로 홍보글 세트 만들기</button>') + '"),
("    h += '<div class=\"result hidden\" id=\"result\"></div></div>';","    h += '<div class=\"result hidden\" id=\"result\"></div>' + (MS ? '' : '</div>');"),
("    if (tool === 'photo' || tool === 'retouch') return renderPhoto();","    if (tool === 'set'){ var keepAtt = att; renderPhoto(); if (keepAtt && keepAtt.blob){ loadPhoto(keepAtt.blob); } return; }\n    if (tool === 'photo' || tool === 'retouch') return renderPhoto();"),
("    if (t.id === 'go'){ curWork = null; return generate(); }","    if (t.id === 'go'){ curWork = null; if (tool === 'set' && $('#phBody')){ return (async function(){ if (ph.img){ var pb = null; try { pb = await photoBlob(1600, .86); } catch(er){} await setAtt(pb); } else await setAtt(null); generate(); })(); } return generate(); }"),
("tool = t.dataset.tool === 'post' ? 'set' : t.dataset.tool; if (t.dataset.tool === 'post'){","tool = (t.dataset.tool === 'post' || t.dataset.tool === 'photo') ? 'set' : t.dataset.tool; if (t.dataset.tool === 'post' || t.dataset.tool === 'photo'){"),
(">AI 만들기</button>",">홍보</button>"),
("AI 만들기 → ","홍보 → "),
]
CSS='\n#v-promo .tool[data-tool=photo],#v-make .tool[data-tool=photo]{display:none !important}\n'
for d in 'skin nail hair pilates academy food cafe bakery'.split():
    p=base+d+'/index.html'; s=open(p).read()
    if 'var MS = tool' in s: print('skip',d); continue
    for a,b in R:
        if a not in s:
            if a in ('>AI 만들기</button>',): continue
            raise SystemExit('miss %s %s'%(d,a[:50]))
        s=s.replace(a,b)
    s=s.replace('<style id="tool-grid">','<style id="tool-grid">'+CSS,1)
    open(p,'w').write(s); print('ok',d)
