import sys,re
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read(); o=s
    # 1 hide 홍보글 single button
    s=s.replace('<button class="tool" type="button" data-tool="post" aria-pressed="false">','<button class="tool" type="button" data-tool="post" aria-pressed="false" hidden style="display:none">',1)
    # 2 map post -> set in click handler
    a="if (t.dataset.tool){ if (e.isTrusted) window.alajoomRecipient = null; tool = t.dataset.tool;"
    assert s.count(a)==1,(f,'click')
    s=s.replace(a,"if (t.dataset.tool){ if (e.isTrusted) window.alajoomRecipient = null; tool = t.dataset.tool === 'post' ? 'set' : t.dataset.tool; if (t.dataset.tool === 'post'){ var sb0 = document.querySelector('.tool[data-tool=\"set\"]'); if (sb0) t = sb0; }")
    # 3 set button label
    s=re.sub(r'<b style="display:block">알아줌 한 번에</b><span>[^<]*</span>','<b style="display:block">홍보글 한 번에</b><span>한 줄·사진이면 인스타·블로그(두 가지씩)·카톡 문자까지</span>',s,count=1)
    s=s.replace("set:{ title:'알아줌 한 번에'","set:{ title:'홍보글 한 번에'")
    # 4 sms channel label
    s=re.sub(r"\['sms','[^']*문자'\]","['sms','카톡·문자']",s,count=1)
    assert s!=o
    open(f,'w',encoding='utf-8').write(s); print(f, '홍보글 한 번에' in s, "['sms','카톡·문자']" in s)
