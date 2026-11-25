import sys, re
FOLDER = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px;margin-right:4px"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'
CSS = r"""
/* ---------- v4: 사진 보정 ---------- */
.rt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.rt-grid button{position:relative;aspect-ratio:1/1;border:0;padding:0;border-radius:12px;overflow:hidden;background:var(--blue-tint) center/cover no-repeat;cursor:pointer}
.rt-grid button span{position:absolute;left:6px;bottom:6px;right:6px;font-size:11px;font-weight:800;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left}
.rt-row{display:flex;flex-wrap:wrap;gap:8px}
.rt-row .sub{flex:1 1 140px}
.att-fix{position:absolute;left:8px;top:8px;min-height:36px;padding:0 12px;border:0;border-radius:999px;background:var(--blue);color:#fff;font:inherit;font-size:13px;font-weight:800;display:flex;align-items:center;gap:6px;cursor:pointer}
.ret-bar{position:sticky;bottom:12px;z-index:5;display:flex;gap:8px}
"""

def patch(path, tools_after_photo=True):
    s = open(path, encoding='utf-8').read()
    def rep(a, b, n=1):
        nonlocal s
        c = s.count(a); assert c == n, (path, c, a[:100]); s = s.replace(a, b)
    rep('@media (prefers-reduced-motion: reduce)', CSS + '\n@media (prefers-reduced-motion: reduce)')
    # 1) 도구 버튼: 사진 보정 (사진 홍보 다음)
    m = re.search(r'(<button class="tool[^"]*" type="button" data-tool="photo"[^>]*>.*?</button>)', s, re.S)
    assert m, 'photo btn'
    s = s[:m.end()] + '\n    <button class="tool" type="button" data-tool="retouch" aria-pressed="false"><b>사진 보정</b></button>' + s[m.end():]
    # 미리보기 그림
    rep("    if (k === 'set') return '<span style=\"position:absolute;inset:0;background:var(--blue-tint)\"></span>' +",
        """    if (k === 'retouch') return '<span style="position:absolute;inset:0;' + PHG + ';filter:saturate(.55) brightness(.82)"></span><span style="position:absolute;top:0;bottom:0;right:0;width:50%;' + PHG + ';filter:brightness(1.12) saturate(1.15);border-left:2px solid #fff"></span><span style="position:absolute;left:8px;bottom:8px;font-size:10.5px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">전</span><span style="position:absolute;right:8px;bottom:8px;font-size:10.5px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">후</span>';
    if (k === 'set') return '<span style="position:absolute;inset:0;background:var(--blue-tint)"></span>' +""")
    # 2) 패널: 보정 전용
    rep("    if (tool === 'photo') return renderPhoto();", "    if (tool === 'photo' || tool === 'retouch') return renderPhoto();")
    rep("    $('#panel').innerHTML = h;\n    ['phFile','phFile2']", """    $('#panel').innerHTML = h;
    if (tool === 'retouch') retouchUI();
    ['phFile','phFile2']""")
    RT = r"""
  /* ---------- v4: 사진 보정만 (글 없이) · 작업실 '사진 보정' 폴더 ---------- */
  var retTo = null;
  function retouchUI(){
    var pn = $('#panel'), body = $('#phBody');
    var h2 = pn.querySelector('h2'); if (h2) h2.textContent = retTo ? '사진 보정하고 돌아가기' : '사진 보정';
    var ch = Array.prototype.slice.call(body.children), cut = false;
    ch.forEach(function(el){
      if (el.classList.contains('outs') || (el.tagName === 'P' && /어떤 사진으로/.test(el.textContent))) el.remove();
      else if (el.tagName === 'HR') { cut = true; el.remove(); }
      else if (cut && el.id !== 'result') el.remove();
    });
    var row = $('#phEdit .row');
    if (row){ row.className = 'rt-row'; row.innerHTML = (retTo ? '<button type="button" class="sub primary" data-act="retback">보정한 사진 쓰기</button>' : '<button type="button" class="sub primary" data-act="phwork">작업실에 저장</button>') + '<button type="button" class="sub" data-act="phsave">휴대폰에 저장</button><button type="button" class="sub" data-act="phnew">다른 사진</button>'; }
    var tx = $('#phText'); if (tx){ var lb = tx.closest('.step') && tx.closest('.step').querySelector('label'); if (lb) lb.textContent = '사진에 넣을 글자 (선택 · 비워 두면 사진만)'; }
    if (ph.frame === 'basic' && !ph.text) ph.frame = 'none';
    document.querySelectorAll('[data-frm]').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.frm === ph.frame); });
    var nm = $('#phName'); if (nm && !ph._nameSet){ nm.checked = false; ph.name = false; }
  }
  async function saveRetouch(){
    if (!ph.img){ toast('사진을 먼저 골라주세요'); return; }
    var b = await photoBlob(1600, .9), list = wLoad(), now = new Date().toISOString();
    var w = curWork && list.filter(function(x){ return x.id === curWork && x.tool === 'retouch'; })[0];
    if (!w){ w = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), created: now }; curWork = w.id; }
    var d = new Date();
    w.tool = 'retouch'; w.text = ''; w.card = null; w.set = null; w.topic = ''; w.ch = ''; w.detail = ''; w.updated = now;
    w.edit = { filter: ph.filter, frame: ph.frame, preset: ph.preset, ratio: ph.ratio };
    w.title = ph.text || ('보정 사진 ' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2));
    w.photo = true; phPut(w.id, b);
    var sig = b.size + ':' + b.type, up = w.phSig !== sig ? b : null; w.phSig = sig;
    list = list.filter(function(x){ return x.id !== w.id; }); list.unshift(w); wSave(list); srvPut(w, up);
    toast('작업실 · 사진 보정 폴더에 저장했어요');
  }
  async function retBack(){
    if (!ph.img){ toast('사진을 먼저 골라주세요'); return; }
    var b = await photoBlob(1600, .88), to = retTo; retTo = null;
    await setAtt(b); tool = to;
    document.querySelectorAll('.tool').forEach(function(x){ x.setAttribute('aria-pressed', x.dataset.tool === to); });
    var keep = window._retKeep || {}; renderPanel();
    if (keep.detail && $('#detail')) $('#detail').value = keep.detail;
    $('#panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('보정한 사진을 넣었어요');
  }
  async function attFix(){
    if (!att) return;
    window._retKeep = { detail: ($('#detail') && $('#detail').value) || '' };
    retTo = tool; tool = 'retouch'; curWork = null;
    document.querySelectorAll('.tool').forEach(function(x){ x.setAttribute('aria-pressed', x.dataset.tool === 'retouch'); });
    ph.img = null; renderPanel();
    var f = new File([att.blob], 'photo.jpg', { type: att.blob.type || 'image/jpeg' });
    await loadPhoto(f);
    $('#panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-act="phwork"],[data-act="retback"],[data-act="attfix"],[data-rtopen]'); if (!t) return;
    var a = t.dataset.act;
    if (a === 'phwork') return saveRetouch();
    if (a === 'retback') return retBack();
    if (a === 'attfix') return attFix();
    if (t.dataset.rtopen) return openRetouch(t.dataset.rtopen);
  });
  document.addEventListener('click', function(e){ var t = e.target.closest && e.target.closest('.tool[data-tool]'); if (t && e.isTrusted) retTo = null; }, true);
  async function openRetouch(id){
    var w = wLoad().filter(function(x){ return x.id === id; })[0]; if (!w) return;
    var b = await workPhoto(w.id); if (!b){ toast('사진을 찾지 못했어요'); return; }
    if (window.alajoomTab) window.alajoomTab('make');
    retTo = null; tool = 'retouch'; curWork = w.id; ph.img = null;
    document.querySelectorAll('.tool').forEach(function(x){ x.setAttribute('aria-pressed', x.dataset.tool === 'retouch'); });
    renderPanel(); await loadPhoto(new File([b], 'photo.jpg', { type: b.type || 'image/jpeg' }));
    $('#panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('저장한 사진을 불러왔어요. 더 보정하고 다시 저장하세요');
  }
"""
    k = s.index('  /* ---------- v3: 첫 화면'); s = s[:k] + RT + s[k:]
    # loadPhoto 가 Promise 를 돌려주도록 (보정 화면 전환 후 기다리기)
    rep("    img.onload = function(){ ph.img = img; analyse(); applyPreset('auto');",
        "    var _done; var _p = new Promise(function(r){ _done = r; });\n    img.onload = function(){ ph.img = img; analyse(); applyPreset('auto'); setTimeout(_done, 0);")
    # loadPhoto 끝: img.src 설정 뒤 return _p — img.src = url; 를 찾아 바꾸기
    i = s.index('  async function loadPhoto(file){'); j = s.index('    img.src = url;', i)
    s = s[:j] + '    img.src = url;\n    return _p;' + s[j + len('    img.src = url;'):]
    # 3) 넣은 사진에 '보정하기'
    rep("""<button type="button" class="sub" data-act="attdel" style="position:absolute;right:8px;top:8px;""",
        """<button type="button" class="att-fix" data-act="attfix"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.5"/></svg>보정하기</button><button type="button" class="sub" data-act="attdel" style="position:absolute;right:8px;top:8px;""")
    # 4) 작업실 폴더
    s = re.sub(r"var TNAME = \{ photo:'사진 홍보',", "var TNAME = { retouch:'사진 보정', photo:'사진 홍보',", s, count=1)
    m = re.search(r"chip\('all', '전체'\) \+ chip\('set', 'AI 직원 세트'\) \+ chip\('post', '홍보글'\) \+ chip\('photo', '사진 홍보'\) \+ chip\('card', '안내 카드'\) \+ chip\('sms', '[^']*'\) \+ chip\('review', '리뷰 답글'\)", s)
    assert m, 'chips'
    s = s[:m.start()] + "chip('all', '전체') + chip('retouch', TNAME.retouch) + chip('set', TNAME.set) + chip('post', TNAME.post) + chip('photo', TNAME.photo) + chip('card', TNAME.card) + chip('sms', TNAME.sms) + chip('review', TNAME.review)" + s[m.end():]
    rep("""    var chip = function(v, l){ var n = v === 'all' ? list.length : list.filter(function(w){ return w.tool === v; }).length; return '<button type="button" class="chip" data-wf="' + v + '" aria-pressed="' + (f === v) + '">' + l + (n ? ' ' + n : '') + '</button>'; };""",
        """    var chip = function(v, l){ var n = v === 'all' ? list.length : list.filter(function(w){ return w.tool === v; }).length; if (!n && v !== 'all' && v !== 'retouch' && f !== v) return ''; return '<button type="button" class="chip" data-wf="' + v + '" aria-pressed="' + (f === v) + '">' + (v === 'all' ? '' : '""" + FOLDER.replace("'", "\\'") + """') + l + (n ? ' ' + n : '') + '</button>'; };""")
    # 사진 보정 폴더는 사진 격자로
    rep("""    if (!show.length) h += '<div class="panel" style="text-align:center;padding:28px 16px"><b>' + (list.length""",
        """    if (f === 'retouch'){
      h += show.length ? '<div class="rt-grid">' + show.map(function(w){ return '<button type="button" data-rtopen="' + w.id + '" data-wthumb="' + w.id + '" aria-label="' + esc(w.title || '보정 사진') + ' 열기"><span>' + esc(w.title || '') + '</span></button>'; }).join('') + '</div><p class="note" style="margin-top:10px">사진을 누르면 다시 보정하거나 휴대폰에 저장할 수 있어요. 지우려면 전체 목록에서 삭제하세요.</p>' :
        '<div class="panel" style="text-align:center;padding:28px 16px"><b>아직 보정한 사진이 없어요</b><p style="margin:6px 0 12px;font-size:14px;color:var(--muted)">AI 만들기 → 사진 보정에서 보정하고 작업실에 저장하세요.</p><button type="button" class="sub primary" data-hgo="retouch" style="margin:0 auto">사진 보정하러 가기</button></div>';
      box.innerHTML = h;
      box.querySelectorAll('[data-wthumb]').forEach(async function(el){ var b = await workPhoto(el.dataset.wthumb); if (b) el.style.backgroundImage = 'url(' + URL.createObjectURL(b) + ')'; });
      return;
    }
    if (!show.length) h += '<div class="panel" style="text-align:center;padding:28px 16px"><b>' + (list.length""")
    # 보정 작업은 '이어서' 누르면 보정 화면으로
    rep("  async function openWork(id){\n    var w = wLoad().filter(function(x){ return x.id === id; })[0]; if (!w) return;",
        "  async function openWork(id){\n    var w = wLoad().filter(function(x){ return x.id === id; })[0]; if (!w) return;\n    if (w.tool === 'retouch') return openRetouch(id);")
    # wTitle: 보정 사진은 저장한 제목
    rep("  function wTitle(w){ var t =", "  function wTitle(w){ if (w.tool === 'retouch') return w.title || '보정 사진'; var t =")
    # 사진 이름 체크를 사용자가 바꾸면 기억
    rep("$('#phName').addEventListener('change', function(){ ph.name = this.checked; schedule(); });",
        "$('#phName').addEventListener('change', function(){ ph.name = this.checked; ph._nameSet = true; schedule(); });")
    open(path, 'w', encoding='utf-8').write(s); print('v4', path)

if __name__ == '__main__':
    for p in sys.argv[1:]: patch(p)
