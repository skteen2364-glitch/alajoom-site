import sys
GUARD="if (!window.alajoomAI || !(await window.alajoomAI.loggedIn())){ toast('알아줌 한 번에는 카카오 로그인 후 쓸 수 있어요'); if (window.alajoomLogin) setTimeout(function(){ if (confirm('카카오로 로그인할까요?')) window.alajoomLogin(); }, 300); return; }"
NEW="if (!window.alajoomAI || !(await window.alajoomAI.loggedIn())){ if (!setSel.length){ toast('채널을 하나 이상 골라주세요'); return; } demoSet(detail); return; }"
FN='''  /* 로그인 전: 예시 세트 보여주고 로그인 안내 */
  function demoSet(detail){
    var keepTool = tool, keepCh = pick.ch, res = {};
    tool = 'post';
    setSel.forEach(function(c){ pick.ch = ({insta:'인스타',blog:'블로그'})[c] || '문자'; var t = fallback(detail); if (t) res[c] = t; });
    tool = keepTool; pick.ch = keepCh;
    if (!Object.keys(res).length){ toast('카카오로 로그인하면 AI가 직접 써 드려요'); return; }
    setRes = res; setCur = Object.keys(res)[0];
    showSet('예시 글이에요. 카카오로 로그인하면 알아줌 팀이 우리 가게에 맞게 새로 써 드려요');
    var r = $('#result');
    r.insertAdjacentHTML('afterbegin', '<button type="button" id="demoLogin" style="display:flex;align-items:center;justify-content:center;width:100%;min-height:50px;margin:0 0 12px;border:0;border-radius:14px;background:#FEE500;color:#191600;font:inherit;font-weight:800;font-size:15.5px;cursor:pointer">카카오로 로그인하고 진짜로 만들기</button>');
    var b = document.getElementById('demoLogin'); if (b) b.onclick = function(){ if (window.alajoomLogin) window.alajoomLogin(); };
    try { r.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }
  function showSet(note){'''
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read()
    if 'function demoSet' in s: print(f,'skip'); continue
    assert s.count(GUARD)==1, f
    s=s.replace(GUARD,NEW).replace('  function showSet(note){',FN,1)
    open(f,'w',encoding='utf-8').write(s); print(f,'ok')
