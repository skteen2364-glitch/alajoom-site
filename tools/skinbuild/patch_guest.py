import sys
OLD='''  function demoSet(detail){
    var keepTool = tool, keepCh = pick.ch, res = {};'''
NEW='''  async function demoSet(detail){
    if (window.alajoomAI && window.alajoomAI.guestAgent){
      var r0 = $('#result'); r0.classList.remove('hidden');
      var chs = setSel.slice(0, 3);
      var tm = window.alajoomTeam ? window.alajoomTeam.progress(r0, { photo: false, channels: chs.length }) : null;
      if (!tm) r0.innerHTML = '<div class="out thinking" style="white-space:normal">알아줌이 쓰는 중…</div>';
      try {
        var d = await window.alajoomAI.guestAgent({ topic: pick.topic, channels: chs, detail: detail,
          store: [studio.name, studio.area, studio.cls, studio.feat].filter(Boolean).join(' / ') });
        setRes = d.results || {}; setCur = Object.keys(setRes)[0];
        var fin = function(){
          showSet('체험으로 만든 진짜 글이에요. 체험은 하루 한 번, 카카오로 시작하면 매일 무료로 써요' + (setSel.length > 3 ? ' (체험은 3곳까지)' : ''));
          var rr = $('#result');
          rr.insertAdjacentHTML('afterbegin', '<button type="button" id="demoLogin" style="display:flex;align-items:center;justify-content:center;width:100%;min-height:50px;margin:0 0 12px;border:0;border-radius:14px;background:#FEE500;color:#191600;font:inherit;font-weight:800;font-size:15.5px;cursor:pointer">카카오로 시작하고 매일 무료로 쓰기</button>');
          if (window.alajoomTeam) rr.insertAdjacentHTML('afterbegin', window.alajoomTeam.strip(['plan','write','check']));
          var lb = document.getElementById('demoLogin'); if (lb) lb.onclick = function(){ if (window.alajoomLogin) window.alajoomLogin(); };
        };
        if (tm) tm.done(d.reviewed, fin); else fin();
        return;
      } catch(e){ if (tm) tm.fail(); if (e && e.code === 'guest_used') toast('오늘 체험은 끝났어요. 아래는 예시 글이에요'); }
    }
    demoExamples(detail);
  }
  function demoExamples(detail){
    var keepTool = tool, keepCh = pick.ch, res = {};'''
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read()
    if 'function demoExamples' in s: print(f,'skip'); continue
    assert s.count(OLD)==1, f
    s=s.replace(OLD,NEW)
    s=s.replace('src="/assets/ai-bridge.js?v=11201430"','src="/assets/ai-bridge.js?v=11212130"></script><script src="/assets/family.js?v=11212130"',1)
    assert 'family.js' in s, f
    open(f,'w',encoding='utf-8').write(s); print(f,'ok')
