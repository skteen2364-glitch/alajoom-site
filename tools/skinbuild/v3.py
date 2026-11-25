import sys
FONTLINK = ''
CSS = r"""
/* ---------- v3: 시안 A·B·C 섞기 ---------- */
.hd-date{margin:4px 0 6px;font-size:13px;color:var(--muted)}
.hd-note{display:inline-block;color:var(--blue)}
.hd-h1{font-family:'Gaegu',Pretendard,var(--font);font-size:35px;line-height:1.18;font-weight:700;letter-spacing:-.11em;word-spacing:-.12em;margin:0 0 14px;text-wrap:balance;color:var(--ink)}
.tl{list-style:none;margin:0 0 4px;padding:0}
.tl li{display:flex;gap:16px;align-items:baseline;padding:13px 0;border-top:1px solid var(--line)}
.tl-t{flex:none;width:62px;font-family:'Gaegu',Pretendard,var(--font);font-size:22px;font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.tl li:first-child .tl-t{color:var(--blue)}
.tl-m{display:flex;flex-direction:column;gap:2px;font-size:15.5px;min-width:0}.tl-m b{font-weight:700}.tl-m small{font-size:12.5px;color:var(--muted)}
.hd-sum{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 18px;padding-top:4px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
.hd-sum button{border:0;background:none;font:inherit;font-weight:800;color:var(--blue);min-height:44px;cursor:pointer;text-decoration:underline;text-underline-offset:4px;flex:none}
.hp{position:relative;height:300px;border-radius:24px;overflow:hidden;margin:4px 0 20px;background:var(--blue-tint)}
.hp img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hp::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,14,16,0) 35%,rgba(20,14,16,.74) 100%)}
.hp-tag{position:absolute;top:12px;left:12px;z-index:1;font-size:11.5px;font-weight:700;color:#fff;background:rgba(20,14,16,.5);padding:5px 10px;border-radius:999px}
.hp-in{position:absolute;left:16px;right:16px;bottom:16px;z-index:1}
.hp-in h2{margin:0 0 12px;color:#fff;font-size:22px;line-height:1.3;font-weight:900}
.hp-b{display:flex;gap:8px}
.hp1{flex:1;min-height:50px;border:0;border-radius:14px;background:var(--yellow);color:var(--ink);font:inherit;font-size:15px;font-weight:900;cursor:pointer}
.hp2{min-height:50px;padding:0 14px;border:0;border-radius:14px;background:rgba(255,255,255,.16);box-shadow:inset 0 0 0 1px rgba(255,255,255,.5);color:#fff;font:inherit;font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px;cursor:pointer}
.hbar{position:sticky;bottom:14px;z-index:5;display:flex;gap:8px;margin-top:18px}
.hb-go{flex:1;min-height:56px;border:0;border-radius:16px;background:var(--blue);color:#fff;font:inherit;font-size:16.5px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 12px 26px -12px var(--blue-deep);cursor:pointer;transition:transform .12s ease}
.hb-ic{width:56px;flex:none;min-height:56px;border:0;border-radius:16px;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 12px 26px -14px rgba(20,14,16,.8);transition:transform .12s ease}
.hb-go:active,.hb-ic:active,.hp1:active,.hp2:active{transform:scale(.97)}
.qask{display:flex;flex-direction:column;gap:10px;margin:0 0 22px}
.qask label{font-size:13px;color:var(--muted)}
.qbox{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:6px 6px 6px 16px}
.qbox:focus-within{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-tint)}
.qbox input{flex:1;min-width:0;border:0;outline:0;font:inherit;font-size:16px;background:transparent;color:var(--ink);padding:10px 0}
.qmic{width:46px;height:46px;flex:none;border:0;border-radius:12px;background:var(--blue-tint);color:var(--blue);display:flex;align-items:center;justify-content:center;cursor:pointer}
.qlab{margin:0 0 10px;font-size:15px;font-weight:900}
#v-make .tools{display:flex;gap:12px;overflow-x:auto;padding:4px 2px 14px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}
#v-make .tool{flex:none;width:132px;min-height:0;padding:0;border:0;background:none;gap:8px;scroll-snap-align:start;box-shadow:none;border-radius:16px;color:var(--ink)}
#v-make .tool:hover{transform:none}
#v-make .tool b{font-size:14px;font-weight:800;padding-left:2px}
#v-make .tool[aria-pressed="true"] b{color:var(--blue)}
.pv{display:block;width:132px;height:156px;border-radius:16px;overflow:hidden;position:relative;box-shadow:0 8px 18px -12px rgba(20,14,16,.5);transition:transform .12s ease,box-shadow .12s ease}
#v-make .tool:active .pv{transform:scale(.96)}
#v-make .tool[aria-pressed="true"] .pv{box-shadow:0 0 0 3px var(--blue),0 8px 18px -12px rgba(20,14,16,.5)}
.pv *{box-sizing:border-box}
@media (min-width:900px){.hd-h1{font-size:36px}.hp{height:340px}#v-make .tool{width:150px}.pv{width:150px;height:176px}}
"""

PVJS = r"""
  /* ---------- v3: 첫 화면(시안 A+C)·홍보 화면(시안 A+B) ---------- */
  var IC3 = {
    spark: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>',
    cam: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    mic: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>'
  };
  var PHG = 'background:radial-gradient(120% 90% at 30% 20%,#F2DED6 0%,#D4B2A5 45%,#8C675B 100%)';
  function PV(k){
    var A = 'var(--blue)', s = studio.name || CFG.title;
    if (k === 'photo') return '<span style="position:absolute;inset:0;' + PHG + '"></span><span style="position:absolute;left:0;right:0;bottom:0;height:40px;background:' + A + ';display:flex;align-items:center;padding:0 10px;color:#fff;font-size:12px;font-weight:900">사진 + 글</span>';
    if (k === 'set') return '<span style="position:absolute;inset:0;background:var(--blue-tint)"></span>' +
      '<span style="position:absolute;left:14px;top:16px;width:70px;height:90px;border-radius:10px;background:#fff;transform:rotate(-8deg);box-shadow:0 4px 10px -6px rgba(0,0,0,.4)"></span>' +
      '<span style="position:absolute;left:34px;top:22px;width:70px;height:90px;border-radius:10px;background:#fff;transform:rotate(4deg);box-shadow:0 4px 10px -6px rgba(0,0,0,.4);padding:8px;display:flex;flex-direction:column;gap:5px"><span style="height:6px;width:70%;border-radius:3px;background:' + A + '"></span><span style="height:4px;border-radius:2px;background:#E5DADD"></span><span style="height:4px;width:80%;border-radius:2px;background:#E5DADD"></span><span style="height:4px;width:60%;border-radius:2px;background:#E5DADD"></span></span>' +
      '<span style="position:absolute;left:10px;right:10px;bottom:10px;font-size:11px;font-weight:900;color:var(--blue-deep)">인스타·블로그·문자 한 번에</span>';
    if (k === 'post') return '<span style="position:absolute;inset:0;background:#fff;display:flex;flex-direction:column"><span style="display:flex;align-items:center;gap:6px;padding:8px"><span style="width:16px;height:16px;border-radius:50%;background:' + A + '"></span><span style="height:5px;width:50px;border-radius:3px;background:#E5DADD"></span></span><span style="flex:1;' + PHG + '"></span><span style="padding:7px 8px;display:flex;flex-direction:column;gap:4px"><span style="height:4px;border-radius:2px;background:#E5DADD"></span><span style="height:4px;width:70%;border-radius:2px;background:#E5DADD"></span></span></span>';
    if (k === 'card') return '<span style="position:absolute;inset:0;background:' + A + ';padding:12px;display:flex"><span style="flex:1;border-radius:10px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:var(--ink);text-align:center"><small style="font-size:9px;font-weight:900;color:' + A + '">EVENT</small><b style="font-size:17px;font-weight:900;line-height:1.15">첫 방문<br>혜택</b><span style="width:70%;border-top:2px dashed #E5DADD;margin-top:6px"></span></span></span>';
    if (k === 'sms') return '<span style="position:absolute;inset:0;background:#EEF1F5;padding:12px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px"><span style="align-self:flex-start;background:#FFF7C2;border-radius:4px 12px 12px 12px;padding:8px;font-size:10.5px;line-height:1.45;color:#2A1E22">' + esc(CFG.who || '고객') + '님, 내일 예약 확인드려요 :)</span><span style="align-self:flex-end;background:#fff;border-radius:12px 4px 12px 12px;padding:6px 8px;font-size:10.5px;color:#2A1E22">네 감사해요!</span></span>';
    if (k === 'review') return '<span style="position:absolute;inset:0;background:#FFFBF0;padding:12px;display:flex;flex-direction:column;gap:8px"><span style="color:#F59E0B;font-size:14px;letter-spacing:2px">★★★★★</span><span style="height:4px;border-radius:2px;background:#EADFC8"></span><span style="height:4px;width:75%;border-radius:2px;background:#EADFC8"></span><span style="margin-top:auto;background:#fff;border-radius:10px;padding:8px;font-size:10.5px;line-height:1.45;color:#2A1E22;box-shadow:0 2px 6px -3px rgba(0,0,0,.3)">따뜻한 후기 감사해요! - ' + esc(s) + '</span></span>';
    if (k === 'board') return '<span style="position:absolute;inset:0;background:#2A2D36;padding:14px 12px;display:flex;flex-direction:column;gap:9px;color:#fff"><b style="font-size:13px;text-align:center;font-weight:900">MENU</b>' + ['', '', ''].map(function(){ return '<span style="display:flex;gap:4px;align-items:center"><span style="height:5px;width:44px;border-radius:3px;background:#C9CFDB"></span><span style="flex:1;border-bottom:2px dotted #6A7080"></span><span style="height:5px;width:22px;border-radius:3px;background:#FFD43B"></span></span>'; }).join('') + '</span>';
    if (k === 'pop') return '<span style="position:absolute;inset:0;background:#FFD43B;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#14161F"><small style="font-size:10px;font-weight:900">오늘만</small><b style="font-size:26px;font-weight:900;line-height:1">50%</b><small style="font-size:10px;font-weight:700">가격 POP</small></span>';
    return '<span style="position:absolute;inset:0;background:var(--blue-tint)"></span>';
  }
  (function(){
    var mk = document.getElementById('v-make'); if (!mk || mk.dataset.v3) return; mk.dataset.v3 = '1';
    var h1 = mk.querySelector('h1'); if (h1){ h1.className = 'hd-h1'; h1.textContent = '무엇을 알릴까요?'; }
    var vb = document.getElementById('voiceBtn'); if (vb) vb.style.display = 'none';
    var q = document.createElement('div'); q.className = 'qask';
    q.innerHTML = '<label for="qIn">한 줄로 알려 주세요. AI 직원이 채널별 글을 한 번에 써요</label><div class="qbox"><input type="text" id="qIn" autocomplete="off" placeholder="' + esc((CFG.tools.set && CFG.tools.set.ph || '').replace(/^예:\s*/, '예: ')) + '"><button type="button" class="qmic" aria-label="말로 입력">' + IC3.mic + '</button></div><button type="button" class="hb-go" id="qGo">' + IC3.spark + 'AI 직원에게 맡기기</button>';
    if (h1) h1.insertAdjacentElement('afterend', q);
    var tools = mk.querySelector('.tools');
    if (tools){
      var lab = document.createElement('h2'); lab.className = 'qlab'; lab.textContent = '이렇게 골라서 만들 수도 있어요'; tools.parentNode.insertBefore(lab, tools);
      tools.querySelectorAll('.tool').forEach(function(b){ var k = b.dataset.tool, tt = (b.querySelector('b') || b).textContent.trim(); b.classList.remove('hero', 'wide'); b.innerHTML = '<span class="pv" aria-hidden="true">' + PV(k) + '</span><b>' + esc(tt) + '</b>'; });
    }
    var go = document.getElementById('qGo'), qi = document.getElementById('qIn');
    go.addEventListener('click', async function(){
      var v = qi.value.trim(); if (!v){ toast('한 줄만 적어 주세요'); qi.focus(); return; }
      var on = false; try { on = !!(window.alajoomAI && await window.alajoomAI.loggedIn()); } catch(e){}
      var sb = document.querySelector('.tool[data-tool="' + (on ? 'set' : 'post') + '"]'); if (sb) sb.click();
      if (!on) toast('로그인 전이라 홍보글 체험으로 보여드려요');
      setTimeout(function(){ var d = document.getElementById('detail'); if (d) d.value = v; var g = document.getElementById('go'); if (g) g.click(); }, 80);
    });
    qi.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); go.click(); } });
    q.querySelector('.qmic').addEventListener('click', function(){ vOpen(); });
  })();
"""

NEW_TOP = r"""    var tc = window.alajoomTodayClasses ? window.alajoomTodayClasses() : [];
    var pw = wLoad().filter(function(w){ return w.photo && Date.now() - new Date(w.updated).getTime() < 14 * 864e5; })[0];
    var isCls = /필라테스/.test(CFG.title);
    var KN = function(n){ return ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'][n] || String(n); };
    var h = '<p class="hd-date">' + (now.getMonth() + 1) + '월 ' + now.getDate() + '일 ' + days[now.getDay()] + '요일</p>';
    if (pw) h += '<section class="hp" aria-label="최근 사진"><img id="hpImg" alt=""><span class="hp-tag">최근 작업 사진</span><div class="hp-in"><h2>이 사진으로<br>오늘 올려 볼까요?</h2><div class="hp-b"><button type="button" class="hp1" data-wopen="' + pw.id + '">이 사진으로 홍보</button><button type="button" class="hp2" data-hgo="photo">' + IC3.cam + '새로 찍기</button></div></div></section>';
    var hl = tc.length ? (isCls ? '오늘 수업이<br>' + tc.length + '개 있어요.' : '오늘은 ' + KN(tc.length) + ' 분이<br>오세요.') : (isCls ? '오늘은 수업이 없어요.<br>홍보하기 좋은 날이에요.' : '오늘은 예약이 없어요.<br>홍보하기 좋은 날이에요.');
    h += '<h1 class="hd-h1">' + (hl.indexOf('<br>') > 0 ? hl.replace('<br>', '<br><span class="hd-note">') + '</span>' : hl) + '</h1>';
    if (tc.length) h += '<ol class="tl" aria-label="' + (isCls ? '오늘 수업' : '오늘 예약') + '">' + tc.map(function(c){ return '<li><b class="tl-t">' + esc(c.time) + '</b><span class="tl-m"><b>' + esc(c.name) + (c.what ? ' · ' + esc(c.what) : '') + '</b>' + (c.cap ? '<small>정원 ' + c.cap + '명</small>' : '') + '</span></li>'; }).join('') + '</ol>';
    h += '<p class="hd-sum"><span>' + (st ? st.active + '명 ' + (isCls ? '수강 중' : '관리 중') + ' · 이번 달 매출 ' + won(st.sales) : '') + '</span><button type="button" data-hcls="1">' + (isCls ? '시간표' : '예약') + ' ' + (tc.length ? '보기' : '적기') + '</button></p>';
"""

BAR = r"""    h += '<div class="hbar"><button type="button" class="hb-go" data-hgo="set">' + IC3.spark + '오늘 홍보 만들기</button><button type="button" class="hb-ic" data-hgo="photo" aria-label="사진으로 홍보">' + IC3.cam + '</button><button type="button" class="hb-ic" data-hvoice="1" aria-label="말로 시키기">' + IC3.mic + '</button></div>';
    box.innerHTML = h;
    if (pw) phGet(pw.id).then(function(b){ var im = document.getElementById('hpImg'); if (b && im){ if (window._hpUrl) URL.revokeObjectURL(window._hpUrl); window._hpUrl = URL.createObjectURL(b); im.src = window._hpUrl; } }).catch(function(){});
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-home],[data-hgo],[data-hsms],[data-hvoice],[data-hcls]'); if (!t) return;"""

def patch(path):
    s = open(path, encoding='utf-8').read()
    def rep(a, b, n=1):
        nonlocal s
        c = s.count(a); assert c == n, (path, c, a[:90]); s = s.replace(a, b)
    rep('<script src="./', '<script src="./') if False else None
    # 글꼴 + CSS
    i = s.index('</head>'); s = s[:i] + FONTLINK + '\n' + s[i:]
    rep('@media (prefers-reduced-motion: reduce)', CSS + '\n@media (prefers-reduced-motion: reduce)')
    # 첫 화면 위쪽
    i = s.index("    var h = '<section class=\"hero\""); j = s.index("    // 할 일", i)
    k = s.index("    var tc = window.alajoomTodayClasses", i)
    s = s[:i] + NEW_TOP + s[j:]
    rep("<h2 style=\"margin:0 0 4px;font-size:16px\">할 일 ", "<h2 style=\"margin:0 0 4px;font-size:16px\">챙길 일 ")
    # 빠른 실행 지우기
    i = s.index("    // 빠른 실행"); j = s.index("    // 최근 작업", i); s = s[:i] + s[j:]
    # 아래 고정 바
    rep("""    box.innerHTML = h;
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-home],[data-hgo],[data-hsms],[data-hvoice],[data-hcls]'); if (!t) return;""", BAR)
    # 디자인 먼저 고르기(카드)
    rep("""    h += '<button class="go" type="button" id="go">' + (tool === 'set'""",
        """    if (tool === 'card') h += '<div class="step"><p>디자인 먼저 고르기 <small>나중에 바꿔도 돼요</small></p><div class="tpl-strip" id="tplPick" role="group" aria-label="카드 디자인">' + THEMES.map(function(t, i){ return '<button type="button" class="tpl" data-th="' + i + '" aria-pressed="' + (i === theme) + '"><img alt="" src="' + drawCard(cardFallback(''), i, cfmt, .2).toDataURL('image/jpeg', .75) + '"><span>' + t.name + '</span></button>'; }).join('') + '</div></div>';
    h += '<button class="go" type="button" id="go">' + (tool === 'set'""")
    rep("if (t.dataset.th){ theme = +t.dataset.th; readCardInputs(); showCard(lastCard); }",
        "if (t.dataset.th){ theme = +t.dataset.th; t.parentNode.querySelectorAll('[data-th]').forEach(function(b){ b.setAttribute('aria-pressed', b === t); }); if (lastCard && $('#result') && !$('#result').classList.contains('hidden')){ readCardInputs(); showCard(lastCard); } }")
    # 홍보 화면 + PV
    k = s.index('  function renderHome(){')
    s = s[:k] + PVJS + s[k:]
    open(path, 'w', encoding='utf-8').write(s); print('v3', path)

if __name__ == '__main__':
    for p in sys.argv[1:]: patch(p)
