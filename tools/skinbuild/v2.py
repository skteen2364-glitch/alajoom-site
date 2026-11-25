import sys, re
CARD = open('/home/claude/skinbuild/v2_card.js', encoding='utf-8').read()
PHOTO = open('/home/claude/skinbuild/v2_photo.js', encoding='utf-8').read()

CSS = """
/* ---------- v2: 첫 화면 히어로 · 템플릿 고르기 · 도구 색 ---------- */
.hero{position:relative;overflow:hidden;border-radius:24px;padding:22px 20px 18px;background:linear-gradient(135deg,var(--blue) 0%,var(--blue-deep) 100%);color:#fff;margin:2px 0 12px;box-shadow:0 14px 30px -18px var(--blue-deep)}
.hero::before,.hero::after{content:"";position:absolute;border-radius:50%;pointer-events:none}
.hero::before{width:230px;height:230px;right:-80px;top:-90px;background:rgba(255,255,255,.12)}
.hero::after{width:110px;height:110px;right:34px;top:62px;background:rgba(255,212,59,.24)}
.hero>*{position:relative;z-index:1}
.hero .hero-d{margin:0;font-size:13px;opacity:.88}
.hero h1{color:#fff;font-size:25px;margin:4px 0 6px;line-height:1.3}
.hero .hero-s{margin:0 0 16px;font-size:13.5px;opacity:.92}
.hero-b{display:flex;gap:8px;flex-wrap:wrap}
.hero-b button{min-height:50px;border-radius:14px;border:0;font:inherit;font-weight:900;font-size:15px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:transform .12s ease}
.hero-b button:active{transform:scale(.97)}
.hero-b .hb1{background:var(--yellow);color:var(--ink);flex:1 1 100%;font-size:16.5px;min-height:56px}
.hero-b .hb2{background:rgba(255,255,255,.14);color:#fff;flex:1 1 0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.38)}
.tpl-strip{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;padding:2px 2px 10px;-webkit-overflow-scrolling:touch;scrollbar-width:thin}
.tpl{flex:none;width:92px;border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;gap:6px;scroll-snap-align:start;cursor:pointer}
.tpl img{width:92px;min-height:70px;object-fit:cover;border-radius:12px;border:2px solid #fff;background:#EEE9DD;box-shadow:0 1px 6px rgba(20,22,31,.12);transition:transform .12s ease}
.tpl:active img{transform:scale(.96)}
.tpl[aria-pressed="true"] img{border-color:var(--blue);box-shadow:0 0 0 2px var(--blue)}
.tpl span{font-size:12.5px;font-weight:800;color:#3A3F4C;white-space:nowrap}
.tpl[aria-pressed="true"] span{color:var(--blue)}
.step>p small{color:var(--muted);font-weight:500}
.tool .ic{width:44px;height:44px;border-radius:14px}
.tool b{font-size:16px}
.tool[data-tool=set] .ic{background:var(--yellow);color:var(--ink)}
.tool[data-tool=post] .ic{background:#EDE9FE;color:#6D28D9}
.tool[data-tool=card] .ic{background:#DCFCE7;color:#15803D}
.tool[data-tool=sms] .ic{background:#E0F2FE;color:#0369A1}
.tool[data-tool=review] .ic{background:#FEF3C7;color:#B45309}
.tool[data-tool=board] .ic,.tool[data-tool=pop] .ic{background:#FFE4E6;color:#BE123C}
.tool.hero{background:linear-gradient(135deg,#14161F,#2E3240)}
header .brand{cursor:pointer;border-radius:12px}
header .brand:active{opacity:.7}
@media (min-width:900px){.hero{padding:28px 30px 24px}.hero h1{font-size:30px}.hero-b .hb1{flex:0 1 300px}.hero-b .hb2{flex:0 1 180px}.tpl{width:110px}.tpl img{width:110px}}
"""

HERO = r"""var h = '<section class="hero" aria-label="오늘"><p class="hero-d">' + (now.getMonth() + 1) + '월 ' + now.getDate() + '일 ' + days[now.getDay()] + '요일</p><h1>' + HERO_T + '</h1><p class="hero-s">한 줄만 알려 주시면 인스타·블로그·릴스·문자까지 한 번에 써 드려요</p><div class="hero-b">' +
      '<button type="button" class="hb1" data-hgo="set"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>오늘 홍보 만들기</button>' +
      '<button type="button" class="hb2" data-hgo="photo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>사진으로</button>' +
      '<button type="button" class="hb2" data-hvoice="1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>말로</button></div></section>';"""

BRAND = """
  /* 왼쪽 위 메이트 이름을 누르면 첫 화면으로 */
  (function(){ var br = document.querySelector('header .brand'); if (!br) return; br.setAttribute('role', 'button'); br.setAttribute('tabindex', '0'); br.setAttribute('aria-label', CFG.title + ' 첫 화면으로');
    var goHome = function(){ if (window.alajoomTab) window.alajoomTab('home'); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e){ window.scrollTo(0, 0); } };
    br.addEventListener('click', goHome); br.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); goHome(); } }); })();
"""

def patch(path, hero_title):
    s = open(path, encoding='utf-8').read()
    def rep(a, b, n=1):
        nonlocal s
        c = s.count(a); assert c == n, (path, c, a[:100]); s = s.replace(a, b)
    # CSS
    rep('@media (prefers-reduced-motion: reduce)', CSS + '\n@media (prefers-reduced-motion: reduce)')
    # 카드
    i = s.index('  /* ---------- 카드 그리기 ---------- */'); j = s.index('  function roundRect(x, l, t, w, h, r)', i); j = s.index('\n', j) + 1
    s = s[:i] + CARD + PHOTO + s[j:]
    rep("""h += '<div class="step"><p>색상</p><div class="themes" role="group" aria-label="카드 색상">' + THEMES.map(function(t, i){ return '<button type="button" class="sw" data-th="' + i + '" aria-pressed="' + (i===theme) + '" aria-label="' + t.name + '" style="background:' + t.bg + '"></button>'; }).join('') + '</div></div>';""",
        """h += '<div class="step"><p>디자인 고르기 <small>옆으로 넘겨 보세요</small></p><div class="tpl-strip" id="tplStrip" role="group" aria-label="카드 디자인">' + THEMES.map(function(t, i){ return '<button type="button" class="tpl" data-th="' + i + '" aria-pressed="' + (i===theme) + '"><img alt="" src="' + drawCard(c, i, cfmt, .2).toDataURL('image/jpeg', .78) + '"><span>' + t.name + '</span></button>'; }).join('') + '</div></div>';
    h += '<div class="step"><p>크기</p><div class="chips" role="group" aria-label="카드 크기">' + Object.keys(FMTS).map(function(k){ return '<button type="button" class="chip" data-cfmt="' + k + '" aria-pressed="' + (k === cfmt) + '">' + FMTS[k][2] + '</button>'; }).join('') + '</div></div>';""")
    rep("    lastCard = c; var r = $('#result'); r.classList.remove('hidden');", "    lastCard = c; var r = $('#result'); r.classList.remove('hidden'); var sl0 = $('#tplStrip') ? $('#tplStrip').scrollLeft : 0;")
    rep("    r.innerHTML = h;\n    saveWork();\n    var hits = scan([c.title]", "    r.innerHTML = h; if ($('#tplStrip')) $('#tplStrip').scrollLeft = sl0;\n    saveWork();\n    var hits = scan([c.title]")
    rep("if (t.dataset.th){ theme = +t.dataset.th; readCardInputs(); showCard(lastCard); }",
        "if (t.dataset.th){ theme = +t.dataset.th; readCardInputs(); showCard(lastCard); }\n    if (t.dataset.cfmt){ cfmt = t.dataset.cfmt; readCardInputs(); showCard(lastCard); }\n    if (t.dataset.flt){ ph.filter = t.dataset.flt; document.querySelectorAll('[data-flt]').forEach(function(b){ b.setAttribute('aria-pressed', b === t); }); draw(); return; }\n    if (t.dataset.frm){ ph.frame = t.dataset.frm; document.querySelectorAll('[data-frm]').forEach(function(b){ b.setAttribute('aria-pressed', b === t); }); draw(); return; }")
    rep("w.card = lastCard; w.theme = theme;", "w.card = lastCard; w.theme = theme; w.cfmt = cfmt;")
    rep("theme = w.theme || 0;", "theme = w.theme || 0; cfmt = w.cfmt || 'feed';")
    # 사진
    rep("var ph = { out:'enhance', img:null,", "var ph = { out:'enhance', filter:'none', frame:'basic', img:null,")
    rep("      x.putImageData(id, 0, 0);\n    }", "      applyFilter(d, ph.filter);\n      x.putImageData(id, 0, 0);\n    }")
    i = s.index("    if (ph.text){\n      x.font = '900 ' + Math.round(58 * u)"); j = s.index("    return c;\n  }\n  function draw(){", i)
    s = s[:i] + "    return drawFrame(c, x, W, H, u, F);\n  }\n  function draw(){" + s[j + len("    return c;\n  }\n  function draw(){"):]
    rep("    $('#phImg').src = ph.url;\n  }", "    $('#phImg').src = ph.url; photoThumbs();\n  }")
    rep("""    h += '<details><summary>밝기·색감 직접 조절</summary>'""", """    h += strip('fltStrip', '필터', FILTERS, 'flt', ph.filter);
    h += '<details><summary>밝기·색감 직접 조절</summary>'""")
    rep("""    h += '<label class="ck" for="phName"><input type="checkbox" id="phName" checked> 사진 아래에 가게 이름 넣기</label>';""",
        """    h += '<label class="ck" for="phName"><input type="checkbox" id="phName" checked> 가게 이름 넣기</label>';
    h += strip('frmStrip', '꾸미기 템플릿', FRAMES, 'frm', ph.frame);""")
    rep('<input type="text" id="phText" maxlength="16"', '<input type="text" id="phText" maxlength="24"')
    rep('<label for="phText">사진에 글자 넣기 (선택)</label>', '<label for="phText">사진에 넣을 글자 (선택)</label>')
    # 첫 화면
    m = re.search(r"var h = '<div style=\"display:flex;justify-content:space-between;align-items:flex-end;margin:2px 0 12px\">.*?;\n", s)
    assert m, 'hero'
    s = s[:m.start()] + HERO.replace('HERO_T', "'" + hero_title + "'") + '\n' + s[m.end():]
    # 이름 누르면 첫 화면
    k = s.rindex('})();\n</script>')
    s = s[:k] + BRAND + s[k:]
    open(path, 'w', encoding='utf-8').write(s)
    print('patched', path)

if __name__ == '__main__':
    for p, t in [('/home/claude/alajoom-site/skin/index.html', "원장님, 오늘 홍보는<br>제가 알아서 할게요"), ('/home/claude/alajoom-site/pilates/index.html', "원장님, 오늘 홍보는<br>제가 알아서 할게요")]:
        patch(p, t)
