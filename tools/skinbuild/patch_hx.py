import re, html
p='/home/claude/alajoom-site/index.html'; s=open(p).read()
T={ # section: (template, color of key or None)
 'mates':('우리 업종을 [골라 보세요]',None),
 'family':('창립 사장님 [100분]을 모셔요',None),
 'rank':('함께 키운 [순위]',None),
 'how':('말하고, 확인하면 [끝]',None),
 'preview':('[사진 한 장]이면|인스타·블로그·릴스대본·카페글까지',None),
 'video':('퇴근 후 홍보글,|이제 [말 한마디]로 끝','#3B5B92'),
 'team':('의뢰 하나에|[알아줌 팀]이 나눠서 일해요',None),
 'skin':('[한 줄]만 적으면|홍보가 끝나요',None),
 'food':('[한 줄]만 적으면|홍보가 끝나요',None),
 'erp':('매장관리도|[평생 무료]로 해줌','#3B5B92'),
 'pricing':('구독료 [0원], 부담 없이 시작하세요',None),
 'trust':('AI에게 맡겨도 [안심]되게',None),
 'faq':('[궁금한 것]부터 풀어드릴게요',None),
 'contact':('[알아줌]에게 물어보세요',None),
 'cta':('오늘 할 일,|[말로] 맡겨보세요',None),
}
def build(tpl,color):
    out=[]; seq=0; keyed=False
    def seg(t):
        nonlocal seq
        t=t.strip(' ')
        if not t: return ''
        r='<span class="hx-a" style="--s:%d">%s</span>'%(seq,html.escape(t,quote=False)); seq+=1; return r
    for li,line in enumerate(tpl.split('|')):
        if li: out.append('<br>')
        m=re.match(r'(.*)\[(.*)\](.*)',line)
        if not m:
            words=line; out.append(seg(words)); continue
        a,k,b=m.groups()
        if a: out.append(seg(a)); 
        if a.endswith(' '): out.append(' ')
        chars=''.join('<i class="sp"> </i>' if c==' ' else '<i style="--i:%d">%s</i>'%(i,html.escape(c)) for i,c in enumerate(k))
        out.append('<span class="hx-k"%s>%s</span>'%((' style="color:%s"'%color) if color else '',chars))
        if b.startswith(' '): out.append(' ')
        if b: out.append(seg(b))
    return ''.join(out)
n=0
for sid,(tpl,color) in T.items():
    m=re.search(r'<section id="%s"'%sid,s); end=s.find('</section>',m.end())
    hm=re.search(r'<h2([^>]*)>(.*?)</h2>',s[m.end():end],re.S)
    attrs,inner=hm.group(1),hm.group(2)
    if 'hx' in attrs: continue
    plain=tpl.replace('[','').replace(']','').replace('|',' ')
    na=attrs.replace('class="','class="hx ',1) if 'class="' in attrs else attrs+' class="hx"'
    na+=' aria-label="%s"'%plain
    new='<h2%s><span aria-hidden="true">%s</span></h2>'%(na,build(tpl,color))
    a0=m.end()+hm.start(); a1=m.end()+hm.end()
    s=s[:a0]+new+s[a1:]; n+=1
# typing loop: skip .hx headings
old="if (h.closest('.dz-ms, #faq, #cta, .al')) return;"
assert old in s
s=s.replace(old,"if (h.closest('.dz-ms, #faq, #cta, .al') || h.classList.contains('hx')) return;")
css='''<style id="hx-css">
.hx .hx-a{display:inline-block;opacity:0;transform:translateY(24px) rotate(-1.5deg)}
.hx .hx-k{position:relative;display:inline-block;white-space:nowrap;isolation:isolate}
.hx .hx-k i{display:inline-block;font-style:normal;opacity:0;transform:translateY(26px) scale(.5)}
.hx .hx-k i.sp{width:.28em}
.hx .hx-k::after{content:"";position:absolute;left:-3%;right:-3%;bottom:.06em;height:.3em;z-index:-1;border-radius:6px;background:#FFD43B;transform:scaleX(0);transform-origin:left}
.hx.hx-on .hx-a{animation:h1In .65s cubic-bezier(.2,.9,.3,1.2) forwards;animation-delay:calc(.08s + var(--s,0) * .22s)}
.hx.hx-on .hx-k i{animation:h1Pop .5s cubic-bezier(.2,.9,.3,1.5) forwards,h1Wave 3.2s ease-in-out infinite;animation-delay:calc(.4s + var(--i,0) * .07s),calc(1.9s + var(--i,0) * .07s)}
.hx.hx-on .hx-k::after{animation:h1Mark .55s ease forwards 1.05s}
@media (prefers-reduced-motion:reduce){.hx .hx-a,.hx .hx-k i{opacity:1 !important;transform:none !important;animation:none !important}.hx .hx-k::after{transform:none}}
</style>
<script>
(function(){var hs=document.querySelectorAll('h2.hx');if(!hs.length)return;
  if(!('IntersectionObserver' in window)){hs.forEach(function(h){h.classList.add('hx-on')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>=.6)e.target.classList.add('hx-on');else if(!e.isIntersecting)e.target.classList.remove('hx-on');});},{threshold:[0,.6]});
  hs.forEach(function(h){io.observe(h)});})();
</script>
'''
a='<script src="/assets/supabase-2.119.0.js"></script>'
if 'id="hx-css"' not in s: s=s.replace(a,css+a,1)
open(p,'w').write(s); print('headings',n)
