import sys
OLD="""    var h = '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px" role="tablist">' + keys.map(function(c){ return '<button type="button" class="setc" role="tab" data-setc="' + c + '" aria-selected="' + (c === setCur) + '">' + chName(c) + '</button>'; }).join('') + '</div>';"""
NEW="""    var base = setCur.replace(/_b$/, ''), tabs = keys.filter(function(k){ return !/_b$/.test(k); });
    var h = '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px" role="tablist">' + tabs.map(function(c){ return '<button type="button" class="setc" role="tab" data-setc="' + c + '" aria-selected="' + (c === base) + '">' + chName(c) + '</button>'; }).join('') + '</div>';
    if (setRes[base + '_b']){
      var VL = { insta: ['공감형', '정보형'], blog: ['정보형', '이야기형'] }[base] || ['A', 'B'];
      var vb = function(k, i){ var on = setCur === k; return '<button type="button" data-setc="' + k + '" aria-pressed="' + on + '" style="flex:1;min-height:42px;border-radius:12px;border:1px solid ' + (on ? 'var(--ink)' : 'var(--line)') + ';background:' + (on ? 'var(--ink)' : '#fff') + ';color:' + (on ? '#fff' : 'var(--ink)') + ';font:inherit;font-size:13.5px;font-weight:800;cursor:pointer">' + (i ? 'B안' : 'A안') + ' · ' + VL[i] + '</button>'; };
      h += '<div style="display:flex;gap:8px;margin:0 0 10px" role="group" aria-label="두 가지 버전">' + vb(base, 0) + vb(base + '_b', 1) + '</div>';
    }"""
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read()
    if "role=\"group\" aria-label=\"두 가지 버전\"" in s: print(f,'skip'); continue
    assert s.count(OLD)==1,f
    s=s.replace(OLD,NEW)
    a="tool === 'set' ? setCur === 'insta' : pick.ch === '인스타'"
    assert s.count(a)==1,(f,'ig')
    s=s.replace(a,"tool === 'set' ? setCur.replace(/_b$/, '') === 'insta' : pick.ch === '인스타'")
    b="var chNow = tool === 'set' ? ({insta:'인스타', place:'네이버 플레이스'})[setCur] : pick.ch;"
    assert s.count(b)==1,(f,'ch')
    s=s.replace(b,"var chNow = tool === 'set' ? ({insta:'인스타', place:'네이버 플레이스'})[setCur.replace(/_b$/, '')] : pick.ch;")
    open(f,'w',encoding='utf-8').write(s); print(f,'ok')
