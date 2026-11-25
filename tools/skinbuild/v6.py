import sys
CSS = """
.hp0 .hp-a,.hp0 .hp-bf{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hp0 .hp-bf{clip-path:inset(0 50% 0 0);animation:hpSw 6s ease-in-out infinite}
.hp0 .hp-ln{position:absolute;top:0;bottom:0;left:50%;width:2px;background:#fff;z-index:1;box-shadow:0 0 8px rgba(0,0,0,.35);animation:hpLn 6s ease-in-out infinite}
.hp0 .hp-l,.hp0 .hp-r{position:absolute;top:12px;z-index:2;font-size:11.5px;font-weight:800;color:#fff;background:rgba(20,14,16,.55);padding:5px 10px;border-radius:999px}
.hp0 .hp-l{left:12px}.hp0 .hp-r{right:12px;background:var(--blue)}
.hp0 .hp-in p{margin:-6px 0 12px;color:rgba(255,255,255,.88);font-size:13.5px;line-height:1.5}
@keyframes hpSw{0%,100%{clip-path:inset(0 72% 0 0)}50%{clip-path:inset(0 28% 0 0)}}
@keyframes hpLn{0%,100%{left:28%}50%{left:72%}}
@media (prefers-reduced-motion:reduce){.hp0 .hp-bf,.hp0 .hp-ln{animation:none}}
@media (min-width:900px){.hp0{height:400px}}
"""
for f, bimg, aimg, h2, p in [
  ('skin', 'demo-skin-before.jpg', 'demo-skin-after.jpg', '어둡게 찍힌 관리실 사진,<br>30초면 인스타 게시물', '밝게 보정하고, 이벤트 문구 넣고, 사진에 맞는 글까지 써 드려요.'),
  ('food', 'haejang-before.jpg', 'haejang-after.jpg', '누렇게 찍힌 음식 사진,<br>30초면 손님 부르는 사진', '먹음직스럽게 보정하고, 메뉴 이름 넣고, 인스타 글까지 써 드려요.'),
]:
    p_ = '/home/claude/alajoom-site/%s/index.html' % f; s = open(p_).read()
    if 'hp0' in s: print('skip', f); continue
    k = s.index('</style>'); s = s[:k] + CSS + s[k:]
    anchor = "    var hl = tc.length"
    hero = ("    else h += '<section class=\"hp hp0\" aria-label=\"사진 보정 예시\"><img class=\"hp-a\" src=\"/assets/%s\" alt=\"\"><img class=\"hp-bf\" src=\"/assets/%s\" alt=\"\"><span class=\"hp-ln\"></span><span class=\"hp-l\">보정 전</span><span class=\"hp-r\">보정 후</span>"
            "<div class=\"hp-in\"><h2>%s</h2><p>%s</p><div class=\"hp-b\"><button type=\"button\" class=\"hp1\" data-hgo=\"photo\">' + IC3.cam + ' 내 사진으로 해보기</button><button type=\"button\" class=\"hp2\" data-hgo=\"retouch\">보정만 하기</button></div></div></section>';\n") % (aimg, bimg, h2, p)
    i = s.index(anchor); s = s[:i] + hero + s[i:]
    open(p_, 'w').write(s); print('ok', f)
