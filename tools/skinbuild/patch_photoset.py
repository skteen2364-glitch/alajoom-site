import sys,re
FN='''  /* 사진 보정 → 바로 '알아줌 한 번에' 세트로 */
  async function photoToSet(){
    if (!ph.img){ toast('사진을 먼저 골라주세요'); return; }
    if (!setSel.length){ toast('채널을 하나 이상 골라주세요'); return; }
    var d = ($('#detail') && $('#detail').value.trim()) || '';
    var b = null; try { b = await photoBlob(1600, .86); } catch(e){}
    if (b) await setAtt(b);
    var sb = document.querySelector('.tool[data-tool="set"]'); if (sb) sb.click();
    setTimeout(function(){ var de = $('#detail'); if (de) de.value = d; var g = $('#go'); if (g) g.click(); }, 60);
  }
  document.addEventListener('click', function(e){ if (e.target.closest && e.target.closest('#goSet')){ e.preventDefault(); photoToSet(); } });
  function showSet(note){'''
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read()
    if 'function photoToSet' in s: print(f,'skip'); continue
    n0=len(s)
    s,k1=re.subn(r"    h \+= '<div class=\"step\"><p id=\"lb_ch\">어디에 올릴까요\?</p>.*\n",
      "    h += '<div class=\"step\"><p>어디에 올릴 글을 만들까요? <small style=\"font-weight:500;color:var(--muted)\">(여러 개 고르기)</small></p><div class=\"chips\" role=\"group\" aria-label=\"채널\">' + SETCH.map(function(c){ return '<button type=\"button\" class=\"chip\" data-chm=\"' + c[0] + '\" aria-pressed=\"' + (setSel.indexOf(c[0]) >= 0) + '\">' + c[1] + '</button>'; }).join('') + '</div></div>';\n",s,count=1)
    k2=s.count('<button class="go" type="button" id="go">이 사진으로 홍보글 만들기</button>')
    s=s.replace('<button class="go" type="button" id="go">이 사진으로 홍보글 만들기</button>','<button class="go" type="button" id="goSet">이 사진으로 홍보글 세트 만들기</button><p class="note" style="margin:0">보정한 사진을 보고 반짝이·술술이·꼼꼼이가 고른 곳마다 글을 써요.</p>')
    k3=s.count('  function showSet(note){')
    s=s.replace('  function showSet(note){',FN,1)
    assert k1==1 and k2==1 and k3==1, (f,k1,k2,k3)
    open(f,'w',encoding='utf-8').write(s); print(f,'ok')
