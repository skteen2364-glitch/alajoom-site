import re
base='/home/claude/alajoom-site/'
ALBUM=r'''  /* ---------- 작업실 · 보정한 사진 사진첩 ---------- */
  var albSel = null;
  function albumBlobs(){ return wLoad().filter(function(w){ return w.tool === 'retouch'; }); }
  async function albumSave(b, title){
    if (!b) return;
    var list = wLoad(), now = new Date().toISOString(), d = new Date(), sig = b.size + ':' + b.type;
    if (list[0] && list[0].tool === 'retouch' && list[0].phSig === sig) return;
    var w = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), created: now, updated: now, tool: 'retouch', text: '', card: null, set: null, topic: '', ch: '', detail: '', photo: true, phSig: sig,
      title: title || ('보정 사진 ' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2)) };
    await phPut(w.id, b); list.unshift(w); wSave(list); srvPut(w, b);
  }
  function albDel(ids){
    var set = {}; ids.forEach(function(i){ set[i] = 1; });
    wSave(wLoad().filter(function(x){ return !set[x.id]; }));
    ids.forEach(function(id){ if (curWork === id) curWork = null; });
    if (window.alajoomAI){ window.alajoomAI.loggedIn().then(function(on){ ids.forEach(function(id){ if (on) window.alajoomAI.works.trash(id, true); else phDel(id); }); }); }
    else ids.forEach(phDel);
  }
  function renderAlbum(box, h, show){
    var picking = !!albSel;
    h += '<div class="alb-bar"><span>' + show.length + '장</span>' + (show.length ? (picking ? '<button type="button" class="sub" data-alb="all">모두 고르기</button><button type="button" class="sub primary" data-alb="savesel">저장 <b id="albN">0</b></button><button type="button" class="sub" data-alb="delsel" style="color:#C2410C">지우기</button><button type="button" class="sub" data-alb="pickoff">취소</button>' : '<button type="button" class="sub" data-alb="pick">여러 장 고르기</button>') : '') + '</div>';
    h += show.length ? '<div class="rt-grid alb-grid">' + show.map(function(w){ return '<button type="button" data-albv="' + w.id + '" data-wthumb="' + w.id + '" aria-label="' + esc(w.title || '보정 사진') + '" aria-pressed="' + (picking && albSel[w.id] ? 'true' : 'false') + '"><span>' + esc(w.title || '') + '</span>' + (picking ? '<i class="alb-ck"></i>' : '') + '</button>'; }).join('') + '</div><p class="note" style="margin-top:10px">사진을 누르면 크게 보고 저장하거나, 그 사진으로 바로 홍보글을 만들 수 있어요.</p>' :
      '<div class="panel" style="text-align:center;padding:28px 16px"><b>아직 보정한 사진이 없어요</b><p style="margin:6px 0 12px;font-size:14px;color:var(--muted)">사진 보정이나 홍보글 한 번에서 사진을 보정하고 <b>사진 저장</b>을 누르면 여기에 모여요.</p><button type="button" class="sub primary" data-hgo="retouch" style="margin:0 auto">사진 보정하러 가기</button></div>';
    box.innerHTML = h;
    var empty = 0, pend = 0;
    box.querySelectorAll('[data-wthumb]').forEach(function(el){ pend++; workPhoto(el.dataset.wthumb).then(function(b){ if (b) el.style.backgroundImage = 'url(' + URL.createObjectURL(b) + ')'; else { el.classList.add('alb-none'); el.querySelector('span').textContent = '사진이 저장되지 않았어요'; empty++; } if (!--pend && empty){ var bar = box.querySelector('.alb-bar'); if (bar && !bar.querySelector('[data-alb="clean"]')) bar.insertAdjacentHTML('beforeend', '<button type="button" class="sub" data-alb="clean" style="color:#C2410C">빈 항목 ' + empty + '개 정리</button>'); } }); });
    if (picking) albCount();
  }
  function albCount(){ var n = Object.keys(albSel || {}).length, el = document.getElementById('albN'); if (el) el.textContent = n; }
  async function albView(id){
    var w = wLoad().filter(function(x){ return x.id === id; })[0]; if (!w) return;
    var b = await workPhoto(id); if (!b){ toast('사진이 저장되지 않았어요'); return; }
    var url = URL.createObjectURL(b), v = document.createElement('div'); v.className = 'alb-view'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true');
    v.innerHTML = '<div class="alb-bg" data-av="x"></div><div class="alb-pan"><button type="button" class="alb-x" data-av="x" aria-label="닫기">×</button><img src="' + url + '" alt="' + esc(w.title || '보정 사진') + '"><p>' + esc(w.title || '') + '</p>' +
      '<div class="alb-acts"><button type="button" class="sub primary" data-av="save">사진 저장</button><button type="button" class="sub" data-av="post" style="background:#FFD43B;border-color:#FFD43B;color:#14161F;font-weight:900">이 사진으로 홍보글</button><button type="button" class="sub" data-av="edit">다시 보정</button><button type="button" class="sub" data-av="del" style="color:#C2410C">지우기</button></div></div>';
    document.body.appendChild(v);
    var close = function(){ v.remove(); URL.revokeObjectURL(url); };
    v.addEventListener('click', async function(e){
      var t = e.target.closest('[data-av]'); if (!t) return; var a = t.dataset.av;
      if (a === 'x') return close();
      if (a === 'save'){ if (downloads){ try { await downloads.save({ filename: (studio.name || CFG.title) + '_보정사진.jpg', data: b }); toast('저장했어요'); } catch(err){ toast('사진을 길게 눌러 저장해 주세요'); } } else { saveBlob(b, (studio.name || CFG.title) + '_보정사진.jpg'); toast('저장했어요'); } return; }
      if (a === 'post'){ close(); if (window.alajoomTab) window.alajoomTab('make'); await setAtt(b); curWork = null; var sb = document.querySelector('.tool[data-tool="set"]'); if (sb) sb.click(); toast('사진을 넣었어요. 알릴 내용을 고르고 만들기를 누르세요'); return; }
      if (a === 'edit'){ close(); return openRetouch(id); }
      if (a === 'del'){ if (t.dataset.arm !== '1'){ t.dataset.arm = '1'; t.textContent = '정말 지울까요?'; return; } albDel([id]); close(); renderWorks(); toast('지웠어요'); }
    });
  }
  document.addEventListener('click', async function(e){
    var t = e.target.closest && e.target.closest('[data-albv],[data-alb]'); if (!t) return;
    if (t.dataset.albv){ if (albSel){ var i = t.dataset.albv; if (albSel[i]) delete albSel[i]; else albSel[i] = 1; t.setAttribute('aria-pressed', albSel[i] ? 'true' : 'false'); albCount(); return; } return albView(t.dataset.albv); }
    var a = t.dataset.alb;
    if (a === 'pick'){ albSel = {}; renderWorks(); return; }
    if (a === 'pickoff'){ albSel = null; renderWorks(); return; }
    if (a === 'all'){ albumBlobs().forEach(function(w){ albSel[w.id] = 1; }); renderWorks(); return; }
    if (a === 'savesel'){ var ids = Object.keys(albSel || {}); if (!ids.length){ toast('사진을 골라 주세요'); return; } for (var k = 0; k < ids.length; k++){ var b = await workPhoto(ids[k]); if (b) saveBlob(b, (studio.name || CFG.title) + '_보정사진_' + (k + 1) + '.jpg'); await new Promise(function(r){ setTimeout(r, 350); }); } toast(ids.length + '장 저장했어요'); return; }
    if (a === 'delsel'){ var ds = Object.keys(albSel || {}); if (!ds.length){ toast('사진을 골라 주세요'); return; } if (t.dataset.arm !== '1'){ t.dataset.arm = '1'; t.textContent = ds.length + '장 정말 지울까요?'; return; } albDel(ds); albSel = null; renderWorks(); toast(ds.length + '장 지웠어요'); return; }
    if (a === 'clean'){ var all = albumBlobs(), gone = []; for (var j = 0; j < all.length; j++){ if (!(await workPhoto(all[j].id))) gone.push(all[j].id); } if (gone.length) albDel(gone); renderWorks(); toast('빈 항목 ' + gone.length + '개를 정리했어요'); }
  });
'''
CSS='''
.alb-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px}.alb-bar>span{font-size:13px;font-weight:800;color:var(--muted);margin-right:auto}
.alb-bar .sub{min-width:0;min-height:36px;padding:0 12px;font-size:13px}
.alb-grid button[aria-pressed="true"]{box-shadow:0 0 0 3px var(--blue)}
.alb-grid .alb-ck{position:absolute;right:6px;top:6px;width:22px;height:22px;border-radius:50%;border:2px solid #fff;background:rgba(0,0,0,.25)}
.alb-grid button[aria-pressed="true"] .alb-ck{background:var(--blue) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12l5 5 9-10'/%3E%3C/svg%3E") center/14px no-repeat}
.alb-grid .alb-none{background:#F3EEE3 !important}.alb-grid .alb-none span{color:#8A8F9C !important;text-shadow:none !important;white-space:normal !important}
@media (min-width:900px){.alb-grid{grid-template-columns:repeat(5,minmax(0,1fr)) !important;gap:10px !important}}
.alb-view{position:fixed;inset:0;z-index:100006}.alb-bg{position:absolute;inset:0;background:rgba(10,12,18,.72)}
.alb-pan{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,520px);max-height:92vh;overflow:auto;background:#fff;border-radius:22px;padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}
.alb-pan img{width:100%;max-height:60vh;object-fit:contain;border-radius:14px;background:#F3EEE3}.alb-pan p{margin:0;font-size:13px;font-weight:800;color:var(--muted)}
.alb-x{position:absolute;right:10px;top:10px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(20,22,31,.75);color:#fff;font-size:22px;line-height:1;cursor:pointer;z-index:1}
.alb-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.alb-acts .sub{min-width:0}
'''
for d in 'skin nail hair pilates academy food cafe bakery'.split():
    p=base+d+'/index.html'; s=open(p).read()
    if 'function renderAlbum' in s: print('skip',d); continue
    # TNAME
    s=re.sub(r"var TNAME = \{ retouch:'사진 보정', photo:'사진 홍보', post:'홍보글',", "var TNAME = { retouch:'보정한 사진', photo:'홍보글', post:'홍보글',", s)
    s=s.replace("set:'알아줌 한 번에' }","set:'홍보글' }")
    a="var show = list.filter(function(w){ return f === 'all' || w.tool === f; });"
    assert a in s; s=s.replace(a,"var G = function(t){ return (t === 'post' || t === 'photo') ? 'set' : t; }; var show = list.filter(function(w){ return f === 'all' || G(w.tool) === f; }); if (f !== 'retouch') albSel = null;")
    a="list.filter(function(w){ return w.tool === v; }).length"; assert a in s; s=s.replace(a,"list.filter(function(w){ return G(w.tool) === v; }).length")
    a=" + chip('post', TNAME.post) + chip('photo', TNAME.photo)"; assert a in s; s=s.replace(a,'')
    # album block
    i=s.index("    if (f === 'retouch'){\n"); j=s.index("      return;\n    }\n",i)+len("      return;\n    }\n")
    s=s[:i]+"    if (f === 'retouch') return renderAlbum(box, h, show);\n"+s[j:]
    a='  function renderTrash(box){'; assert s.count(a)==1; s=s.replace(a,ALBUM+a)
    # 목록에서 보정 사진은 사진 플래그 없어도 썸네일 시도
    a="'<div data-wthumb=\"' + (w.photo ? w.id : '') + '\""
    assert a in s; s=s.replace(a,"'<div data-wthumb=\"' + (w.photo || w.tool === 'retouch' ? w.id : '') + '\"")
    # 사진 저장 누르면 사진첩에도
    a="      else { saveBlob(b, (studio.name || CFG.title) + '_보정사진.jpg'); if (lastText) saveWork(); }\n      return;"
    assert a in s, d
    s=s.replace(a,"      else { saveBlob(b, (studio.name || CFG.title) + '_보정사진.jpg'); if (lastText) saveWork(); }\n      try { var sb2 = await photoBlob(1600, .9); await albumSave(sb2, ph.text || ''); toast('저장했어요 · 작업실 보정한 사진에도 넣었어요'); } catch(er){}\n      return;")
    s=s.replace("toast('작업실 · 사진 보정 폴더에 저장했어요');","toast('작업실 · 보정한 사진에 저장했어요');")
    s=s.replace('<style id="tool-grid">','<style id="tool-grid">'+CSS,1)
    open(p,'w').write(s); print('ok',d)
