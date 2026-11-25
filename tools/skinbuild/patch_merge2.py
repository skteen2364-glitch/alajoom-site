base='/home/claude/alajoom-site/'
R=[("<span class=\"stepno\">2</span>어떤 사진으로 만들까요?","<span class=\"stepno\">' + (MS ? '1-2' : '2') + '</span>어떤 사진으로 만들까요?"),
   ("<span class=\"stepno\">3</span>홍보글 만들기","<span class=\"stepno\">' + (MS ? '2' : '3') + '</span>홍보글 만들기"),
   ('id="lb_topic">이 사진으로 무엇을 알릴까요?','id="lb_topic">\' + (MS ? \'무엇을 알릴까요?\' : \'이 사진으로 무엇을 알릴까요?\') + \''),
   ("보정한 사진을 보고 반짝이·술술이·꼼꼼이가 고른 곳마다 글을 써요.","' + (MS ? '사진을 올렸으면 보정한 사진을 보고, 없으면 한 줄만으로 반짝이·술술이·꼼꼼이가 고른 곳마다 글을 써요.' : '보정한 사진을 보고 반짝이·술술이·꼼꼼이가 고른 곳마다 글을 써요.') + '")]
for d in 'skin nail hair pilates academy food cafe bakery'.split():
    p=base+d+'/index.html'; s=open(p).read()
    if "(MS ? '1-2'" in s: continue
    for a,b in R:
        assert s.count(a)==1,(d,a[:30]); s=s.replace(a,b)
    open(p,'w').write(s); print('ok',d)
