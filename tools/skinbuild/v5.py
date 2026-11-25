import sys, re
CSS = """
  /* v5: 인스타 게시물 미리보기 */
  #result.igm .ig-hd{display:flex;align-items:center;gap:9px;padding:10px 12px;background:#fff;border:1px solid var(--line);border-bottom:0;border-radius:16px 16px 0 0;max-width:540px}
  .ig-av{width:32px;height:32px;border-radius:50%;padding:2px;background:linear-gradient(45deg,#F58529,#DD2A7B,#8134AF);flex:none}
  .ig-av span{display:flex;width:100%;height:100%;border-radius:50%;background:#fff;color:var(--ink);font-size:12px;font-weight:900;align-items:center;justify-content:center;border:2px solid #fff}
  .ig-hd b{font-size:13.5px;line-height:1.2;display:block}.ig-hd small{font-size:11.5px;color:var(--muted);display:block}
  .ig-hd i{margin-left:auto;font-style:normal;font-size:11px;font-weight:800;color:#DD2A7B;background:#FDEEF4;border-radius:99px;padding:3px 9px}
  #result.igm #resPh{border-radius:0;margin-bottom:0!important;border-left:1px solid var(--line);border-right:1px solid var(--line);border-top:0;border-bottom:0;aspect-ratio:4/5;object-fit:cover}
  #result.igm .ig-ic{display:flex;gap:14px;padding:10px 12px 4px;background:#fff;border:1px solid var(--line);border-top:0;border-bottom:0;max-width:540px}
  #result.igm .ig-ic svg{width:23px;height:23px}
  #result.igm #out{border-radius:0 0 16px 16px;border-top:0;background:#fff;max-width:540px;box-sizing:border-box;font-size:14px;padding-top:6px}
"""
JS = """
  function igFrame(on){
    var r = $('#result'), rp = $('#resPh'); if (!r || !rp) return;
    var hd = $('#igHd'), ic = $('#igIc');
    if (!on){ r.classList.remove('igm'); if (hd) hd.remove(); if (ic) ic.remove(); return; }
    r.classList.add('igm');
    var nm = (studio && studio.name) || '우리 가게', ar = (studio && studio.area) || '';
    if (!hd){ rp.insertAdjacentHTML('beforebegin', '<div class="ig-hd" id="igHd" aria-hidden="true"><div class="ig-av"><span></span></div><div><b></b><small></small></div><i>인스타 미리보기</i></div>'); hd = $('#igHd'); }
    hd.querySelector('.ig-av span').textContent = nm.replace(/\\s/g, '').slice(0, 2);
    hd.querySelector('b').textContent = nm; hd.querySelector('small').textContent = ar;
    if (!ic){ var s = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
      rp.insertAdjacentHTML('afterend', '<div class="ig-ic" id="igIc" aria-hidden="true"><svg ' + s + '><path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6z"/></svg><svg ' + s + '><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12z"/></svg><svg ' + s + '><path d="M22 3 11 14M22 3l-7 19-4-8-8-4z"/></svg></div>'); }
  }
"""
for f in sys.argv[1:]:
    s = open(f).read()
    if 'function igFrame' in s: print('skip', f); continue
    a = "  .card-prev,#resPh{max-width:540px}\n"
    assert a in s; s = s.replace(a, a + CSS, 1)
    old = "else rp.classList.add('hidden');\n"
    i = s.index("var rp = $('#resPh'); if ((tool === 'post'")
    j = s.index(old, i) + len(old)
    s = s[:j] + "    igFrame(!rp.classList.contains('hidden') && (tool === 'set' ? setCur === 'insta' : pick.ch === '인스타'));\n" + s[j:]
    k = s.index("  function showText(text, streaming){")
    s = s[:k] + JS + s[k:]
    open(f, 'w').write(s); print('ok', f)
