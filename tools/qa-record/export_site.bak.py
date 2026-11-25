import re, sys
src = open('/home/claude/dahaezoom/project/Main.dc.html', encoding='utf-8').read()
helmet = src[src.index('<helmet>')+8:src.index('</helmet>')]
body = src[src.index('</helmet>')+9:src.index('</x-dc>')]
# sc-if -> display:contents wrappers
body = re.sub(r'<sc-if value="\{\{ (\w+) \}\}"[^>]*>', lambda m: f'<div data-show="{m.group(1)}" style="display:contents">', body)
body = body.replace('</sc-if>', '</div>')
body = re.sub(r'onClick="\{\{ (\w+) \}\}"', r'data-action="\1"', body)
body = re.sub(r'style="\{\{ tab(\w+) \}\}"', lambda m: f'data-vtab="{m.group(1).lower()}" style=""', body)
body = body.replace('ref="{{ rootRef }}" ', '')
# video
body = body.replace('src="/_blob/981201666caa3ea5abe27b5ab6f23b57" poster="/_blob/028cd45c8686c139405aedb2a2b1cc7f"', 'src="assets/beaumate-short.mp4" poster="assets/beaumate-poster.jpg"')
body = body.replace('src="/_blob/e1efd27df1c7eeb20d41bb41ebc6ff78" poster="/_blob/ed425100c84e428952d6544143700f63"', 'src="assets/funnymate-short.mp4" poster="assets/funnymate-poster.jpg"')
body = re.sub(r'src="/_blob/[0-9a-f]+" poster="/_blob/[0-9a-f]+"', 'src="assets/alajoom-reels.mp4" poster="assets/alajoom-poster.jpg"', body)
body = body.replace('autoplay="true" muted="true" loop="true" playsinline="true" controls="true"', 'autoplay muted loop playsinline controls')
# contact form -> Netlify form
old_open = '<div class="form-box" style="background: #FFFFFF; border-radius: 24px; padding: 32px; display: flex; flex-direction: column; gap: 18px; border: 1px solid #E3E6EE">'
assert old_open in body
body = body.replace(old_open, '<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" id="contactForm" class="form-box" style="background: #FFFFFF; border-radius: 24px; padding: 32px; display: flex; flex-direction: column; gap: 18px; border: 1px solid #E3E6EE">\n<input type="hidden" name="form-name" value="contact">\n<p hidden><label>bot <input name="bot-field"></label></p>')
btn = '<button type="button" data-action="submit"'
i = body.index(btn); j = body.index('</div>', body.index('</button>', i))
body = body[:i] + '<button type="submit"' + body[i+len(btn):j] + '</form>' + body[j+6:]
for fid in ['shop','biz','phone','msg']:
    body = body.replace(f'id="{fid}"', f'id="{fid}" name="{fid}"', 1)
body = body.replace('<input type="checkbox" style="width: 20px;', '<input type="checkbox" name="agree" value="yes" required style="width: 20px;', 1)
body = body.replace('id="phone" name="phone" type="tel"', 'id="phone" name="phone" type="tel" required')
assert '{{' not in body, re.findall(r'.{30}\{\{.{30}', body)[:3]
on = "flex: 1 1 auto; min-height: 40px; padding: 0 12px; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; border: 0; background: #3B5B92; color: #FFFFFF;"
off = "flex: 1 1 auto; min-height: 40px; padding: 0 12px; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; border: 1px solid #D9CFB8; background: #FFFFFF; color: #4A5060;"
js = '''<script>
(function(){
  var state = {mate:'beau', v:'promo', submitted:false}; var hold = 0;
  var ON = %r, OFF = %r;
  function render(){
    var flags = {isBeau: state.mate==='beau', isFuni: state.mate==='funi',
      vPromo: state.v==='promo', vKakao: state.v==='kakao', vDay: state.v==='day',
      submitted: state.submitted, notSubmitted: !state.submitted};
    document.querySelectorAll('[data-show]').forEach(function(el){ el.style.display = flags[el.getAttribute('data-show')] ? 'contents' : 'none'; });
    document.querySelectorAll('[data-vtab]').forEach(function(el){ el.setAttribute('style', el.getAttribute('data-vtab')===state.v ? ON : OFF); });
  }
  var actions = {
    pickBeau: function(){ state.mate='beau'; }, pickFuni: function(){ state.mate='funi'; },
    pickPromo: function(){ hold=Date.now()+14000; state.v='promo'; }, pickKakao: function(){ hold=Date.now()+14000; state.v='kakao'; }, pickDay: function(){ hold=Date.now()+14000; state.v='day'; }
  };
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-action]'); if(!t) return;
    var a = actions[t.getAttribute('data-action')]; if(a){ a(); render(); }
  });
  var form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = '보내는 중…';
    fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: new URLSearchParams(new FormData(form)).toString()})
      .then(function(r){ if(!r.ok) throw new Error(r.status); state.submitted = true; render(); })
      .catch(function(){ btn.disabled = false; btn.textContent = '문의 보내기'; alert('전송에 실패했어요. 잠시 후 다시 시도해 주세요.'); });
  });
  render();
  // hero tab cycle
  try {
    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      var order=['promo','kakao','day'], hv=true, topEl=document.getElementById('top');
      if (topEl && 'IntersectionObserver' in window) new IntersectionObserver(function(en){ hv = en[0].isIntersecting; }, {threshold:0.35}).observe(topEl);
      setInterval(function(){ if(!hv || Date.now()<hold) return; state.v = order[(order.indexOf(state.v)+1)%%3]; render(); }, 7000);
    }
  } catch(err) {}
  // mate carousel auto-scroll
  try {
    var g = document.querySelector('.mate-grid');
    if (g && 'IntersectionObserver' in window && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      var vis = false, hold = 0;
      new IntersectionObserver(function(en){ vis = en[0].isIntersecting; }, {threshold:0.5}).observe(g);
      var pause = function(){ hold = Date.now() + 6000; };
      g.addEventListener('touchstart', pause, {passive:true}); g.addEventListener('pointerdown', pause); g.addEventListener('wheel', pause, {passive:true});
      setInterval(function(){
        if (!vis || Date.now() < hold || g.scrollWidth <= g.clientWidth + 4) return;
        var card = g.firstElementChild; if (!card) return;
        var step = card.getBoundingClientRect().width + 12;
        if (g.scrollLeft + g.clientWidth >= g.scrollWidth - 8) g.scrollTo({left:0, behavior:'smooth'}); else g.scrollBy({left:step, behavior:'smooth'});
      }, 1800);
    }
  } catch(err) {}
  // section reveal
  try {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var secs = Array.prototype.slice.call(document.querySelectorAll('section:not(#top):not([aria-label])'));
    var boxOf = function(sec){ return sec.classList.contains('wrap') ? sec : (sec.querySelector(':scope > .wrap') || sec); };
    var io = new IntersectionObserver(function(entries){ entries.forEach(function(en){ if(!en.isIntersecting) return;
      Array.prototype.slice.call(boxOf(en.target).children).forEach(function(k,i){ k.style.transitionDelay=(Math.min(i,3)*140)+'ms'; k.classList.add('dz-in'); });
      io.unobserve(en.target); }); }, {threshold:0.3});
    secs.forEach(function(sec){ Array.prototype.forEach.call(boxOf(sec).children, function(k){ k.classList.add('dz-rv'); }); io.observe(sec); });
  } catch(err) {}
})();
</script>''' % (on, off)
favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M32 2a30 30 0 0 1 30 30a30 30 0 0 1-30 30H6a4 4 0 0 1-4-4V32A30 30 0 0 1 32 2z' fill='%23FFD43B'/%3E%3Ctext x='33' y='44' font-size='32' font-weight='900' text-anchor='middle' fill='%2314161F' font-family='sans-serif'%3E%EC%95%8C%3C/text%3E%3C/svg%3E"
html = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>알아줌 | 1인 사장님 무료 AI 비서</title>
<meta name="description" content="혼자 다 하는 사장님, 말만 하세요. 홍보글·카톡 문의 답장·예약 정리까지 알아줌이 알아서 해줘요. 카드 등록 없이 무료.">
<meta property="og:title" content="알아줌 | 1인 사장님 무료 AI 비서">
<meta property="og:description" content="혼자 다 하는 사장님, 말만 하세요. 알아서 해줌.">
<meta property="og:image" content="assets/alajoom-poster.jpg">
<meta property="og:type" content="website">
<meta name="theme-color" content="#FFF8E7">
<link rel="icon" href="{favicon}">
{helmet.strip()}
</head>
<body>
{body.strip()}
{js}
</body>
</html>
'''
open('/home/claude/site/index.html','w',encoding='utf-8').write(html)
print('ok', len(html))
