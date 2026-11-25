base='/home/claude/alajoom-site/'
JS=r'''  /* ---------- 이달 인기 형식 (매달 업데이트) ---------- */
  var trendCache = null;
  function trendOn(){ var b = document.getElementById('trendBox'), c = document.getElementById('trendOn'); return !!(b && !b.classList.contains('hidden') && c && c.checked); }
  async function trendLoad(){
    try {
      if (trendCache === null){
        var r = await fetch('https://zuxbloxstkcixqpzqalk.supabase.co/rest/v1/rpc/trend_style', { method: 'POST', headers: { apikey: 'sb_publishable_cZZ6cVbSIbkG93_rQ8jldg_f_Z9uOYH', 'Content-Type': 'application/json' }, body: JSON.stringify({ p_mate: location.pathname.split('/')[1] }) });
        trendCache = r.ok ? (await r.json()) : false;
      }
      var t = trendCache, box = document.getElementById('trendBox'); if (!box || !t || !t.title) return;
      document.getElementById('trendT').textContent = t.title; document.getElementById('trendS').textContent = t.summary || '';
      box.classList.remove('hidden');
    } catch(e){}
  }
'''
CSS='''
.trend-ck{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,#FFF6D6,#FFEFB0);border:1.5px solid #F2D46A;cursor:pointer}
.trend-ck.hidden{display:none}.trend-ck input{width:20px;height:20px;margin:2px 0 0;accent-color:#14161F;flex:none}
.trend-ck b{display:block;font-size:14.5px}.trend-ck small{display:block;font-size:12.5px;color:#6B5A1A;margin-top:2px;line-height:1.45}
'''
R=[
 ("' + (MS ? '<button class=\"go\" type=\"button\" id=\"go\"","' + (MS ? '<label class=\"trend-ck hidden\" id=\"trendBox\"><input type=\"checkbox\" id=\"trendOn\" checked><span><b>✨ <span id=\"trendT\">이달 인기 형식</span>으로 쓰기</b><small id=\"trendS\"></small></span></label>' : '') + '' + (MS ? '<button class=\"go\" type=\"button\" id=\"go\""),
 ("renderPhoto(); if (keepAtt && keepAtt.blob){ loadPhoto(keepAtt.blob); } return; }","renderPhoto(); trendLoad(); if (keepAtt && keepAtt.blob){ loadPhoto(keepAtt.blob); } return; }"),
 ("var d = await window.alajoomAI.agent({ topic: pick.topic, channels: setSel.slice(), detail: detail,","var d = await window.alajoomAI.agent({ topic: pick.topic, channels: setSel.slice(), detail: detail, trend: trendOn(),"),
 ("var d = await window.alajoomAI.guestAgent({ topic: pick.topic, channels: chs, detail: detail,","var d = await window.alajoomAI.guestAgent({ topic: pick.topic, channels: chs, detail: detail, trend: trendOn(),"),
]
for d in 'skin nail hair pilates academy food cafe bakery'.split():
    p=base+d+'/index.html'; s=open(p).read()
    if 'function trendLoad' in s: print('skip',d); continue
    for a,b in R:
        assert s.count(a)==1,(d,a[:50]); s=s.replace(a,b)
    a='  function renderTrash(box){'; s=s.replace(a,JS+a)
    s=s.replace('<style id="tool-grid">','<style id="tool-grid">'+CSS,1)
    s=s.replace('/assets/ai-bridge.js?v=11221200','/assets/ai-bridge.js?v=11241830')
    open(p,'w').write(s); print('ok',d)
