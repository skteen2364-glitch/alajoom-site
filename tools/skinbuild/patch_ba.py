# 전후 사진 도구를 스킨(→네일·헤어) 페이지에 붙이기. 여러 번 실행해도 같은 결과.
import sys, re
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(a, b, mark=None):
    global s
    if (mark or b) in s: return
    assert a in s, (p, a[:70]); s = s.replace(a, b, 1)
rep('<button class="tool" type="button" data-tool="retouch" aria-pressed="false"><b>사진 보정</b></button>',
    '<button class="tool" type="button" data-tool="retouch" aria-pressed="false"><b>사진 보정</b></button>\n    <button class="tool" type="button" data-tool="ba" aria-pressed="false"><b>전후 사진</b></button>')
rep("    if (tool === 'photo' || tool === 'retouch') return renderPhoto();",
    "    if (tool === 'photo' || tool === 'retouch') return renderPhoto();\n    if (tool === 'ba'){ if (window.alajoomBA) window.alajoomBA.render($('#panel')); else $('#panel').innerHTML = '<p class=\"note\">잠시 후 다시 눌러 주세요</p>'; return; }")
rep("  async function openRetouch(id){",
    """  window.alajoomUseAsPhoto = async function(blob, meta){
    if (window.alajoomTab) window.alajoomTab('make');
    retTo = null; tool = 'photo'; curWork = null; ph.img = null;
    document.querySelectorAll('.tool').forEach(function(x){ x.setAttribute('aria-pressed', x.dataset.tool === 'photo'); });
    renderPanel(); await loadPhoto(new File([blob], 'before-after.jpg', { type: 'image/jpeg' }));
    ph.ba = meta || { ba: 1 }; applyPreset('orig'); ph.out = 'enhance'; showOut();
    var tc = meta && meta.topic && document.querySelector('#panel .chip[data-k="topic"][data-v="' + meta.topic + '"]'); if (tc) tc.click();
    $('#panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('전후 사진을 넣었어요. 올릴 곳을 고르고 만들기를 누르세요');
  };
  async function openRetouch(id){""", 'window.alajoomUseAsPhoto')
rep("img.onload = function(){ ph.img = img; ph.src = img; ph.ai = {}; ph.cmp = ''; ph.mark = false;",
    "img.onload = function(){ ph.img = img; ph.src = img; ph.ai = {}; ph.cmp = ''; ph.mark = false; ph.ba = null;")
rep("    if (!ph.img){ toast('사진을 먼저 골라주세요'); return; }\n    var detail = $('#detail').value.trim();",
    "    if (!ph.img){ toast('사진을 먼저 골라주세요'); return; }\n    if (ph.ba && window.alajoomBA) extra = (extra || '') + window.alajoomBA.rule();\n    var detail = $('#detail').value.trim();")
rep("    if (t.dataset.out){ ph.out = t.dataset.out;",
    "    if (t.dataset.out){ if (ph.ba && t.dataset.out !== 'enhance'){ toast('전후 사진은 AI로 바꾸지 않아요. 있는 그대로 올려요'); return; } ph.out = t.dataset.out;")
s = re.sub(r'<script src="/assets/before-after\.js\?v=\w+" defer></script>', '', s)
s = s.replace('<script src="/assets/mate-install.js', '<script src="/assets/before-after.js?v=11210800" defer></script><script src="/assets/mate-install.js', 1)
open(p, 'w', encoding='utf-8').write(s); print('patched', p)
s = open(p, encoding='utf-8').read()
TH = """    if (k === 'ba') return '<span style="position:absolute;inset:0;background:#fff;display:flex;gap:4px;padding:6px"><span style="flex:1;border-radius:8px;position:relative;' + PHG + ';filter:saturate(.6) brightness(.85)"><b style="position:absolute;left:5px;top:5px;background:rgba(255,255,255,.92);color:#14161F;font-size:9px;font-weight:900;border-radius:999px;padding:2px 6px">BEFORE</b></span><span style="flex:1;border-radius:8px;position:relative;' + PHG + '"><b style="position:absolute;left:5px;top:5px;background:rgba(20,22,31,.85);color:#FFD43B;font-size:9px;font-weight:900;border-radius:999px;padding:2px 6px">AFTER</b></span></span>';\n"""
if "if (k === 'ba') return" not in s:
    a = "    if (k === 'set') return '<span style=\"position:absolute;inset:0;background:var(--blue-tint)\"></span>' +"
    assert a in s; s = s.replace(a, TH + a, 1)
open(p, 'w', encoding='utf-8').write(s); print('thumb ok')
