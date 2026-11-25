# 학원메이트 오늘 화면: 수강료 챙길 원생 표시 + 출결 바로가기 (make_academy.py 이후 실행)
p='/home/claude/alajoom-site/academy/index.html'; s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    if b in s: return
    assert a in s, a[:80]; s=s.replace(a,b,1)
rep("""padding:1px 7px">재등록</span><span style="flex:1;min-width:0;font-size:14px"><b>' + esc(m.name) + '</b>님 · 남은 ' + m.left + '회 · ~' + md(m.end) + '</span>""",
    """padding:1px 7px">' + esc(m.tag || '재등록') + '</span><span style="flex:1;min-width:0;font-size:14px"><b>' + esc(m.name) + '</b> · ' + esc(m.desc || '') + '</span>""")
rep("""'</b>님 · 마지막 출석 ' + md(m.last) + '</span>""", """'</b> · 마지막 출석 ' + md(m.last) + '</span>""")
rep("""<button type="button" data-hcls="1">' + (isCls ? '시간표' : '예약') + ' ' + (tc.length ? '보기' : '적기') + '</button>""",
    """<button type="button" data-hcls="1">' + (tc.length ? '출결 체크' : '시간표 적기') + '</button>""")
rep("""if (t.dataset.hcls){ window.alajoomTab('members');""", """if (t.dataset.hcls){ if (window.alajoomOpenAtt && window.alajoomTodayClasses && window.alajoomTodayClasses().length){ window.alajoomOpenAtt(); return; } window.alajoomTab('members');""")
import re
s=re.sub(r'/academy/students\.js\?v=\w+','/academy/students.js?v=11202130',s)
open(p,'w',encoding='utf-8').write(s); print('ok')
