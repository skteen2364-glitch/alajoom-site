import json, subprocess, sys, glob, os
MATE = sys.argv[1]
V = sorted(glob.glob('/tmp/rec_%s/*.webm' % MATE), key=os.path.getmtime)[-1]
M = dict(json.load(open('/tmp/rec_%s/marks.json' % MATE))); OFF = 2.6
t = lambda k: M[k] + OFF
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
NAME = {'skin': '스킨메이트', 'food': '푸드메이트'}[MATE]
shots = [  # (원본 시각, 길이, 큰 자막, 작은 자막)
    (t('channels') + 0.25, 3.0, '한 줄만 적으면', '오늘 알릴 것 한 줄 + 올릴 곳 고르기'),
    (17.0, 3.0, '사진은 AI가 화보처럼', '음식은 그대로, 빛과 배경만' if MATE == 'food' else '공간은 그대로, 빛과 정리만'),
    (25.6, 3.2, 'AI 직원 세트가 한 번에', '인스타 글'),
    (27.6, 2.6, 'AI 직원 세트가 한 번에', '네이버 블로그'),
    (29.2, 2.6, 'AI 직원 세트가 한 번에', '단골 문자·카톡'),
    (31.1, 2.6, 'AI 직원 세트가 한 번에', '당근 · 플레이스까지'),
]
FADE = 0.45; END = 2.6
W, H = 720, 1558
def esc(s): return s.replace(':', '\\:').replace("'", "’").replace(',', '\\,')
os.makedirs('/tmp/calm_' + MATE, exist_ok=True)
ins = []; fl = []
for i, (src, d, l1, l2) in enumerate(shots):
    png = '/tmp/calm_%s/s%d.png' % (MATE, i)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '%.2f' % src, '-i', V, '-frames:v', '1', '-vf', 'scale=%d:%d' % (W, H), png], check=True)
    ins += ['-loop', '1', '-t', '%.2f' % d, '-i', png]
    cap = ("drawtext=fontfile=%s:text='%s':fontsize=50:fontcolor=#FFD43B:x=(w-tw)/2:y=h*0.76:box=1:boxcolor=0x14161F@0.82:boxborderw=22,"
           "drawtext=fontfile=%s:text='%s':fontsize=34:fontcolor=white:x=(w-tw)/2:y=h*0.76+100:box=1:boxcolor=0x14161F@0.82:boxborderw=16") % (FONT, esc(l1), FONT, esc(l2))
    fl.append('[%d:v]fps=30,format=yuv420p,%s[v%d]' % (i, cap, i))
# 마지막 카드
last = '/tmp/calm_%s/s%d.png' % (MATE, len(shots) - 1)
ins += ['-loop', '1', '-t', '%.2f' % END, '-i', last]
n = len(shots)
fl.append(("[%d:v]fps=30,format=yuv420p,boxblur=10:2,eq=brightness=-0.28,"
           "drawtext=fontfile=%s:text='%s':fontsize=40:fontcolor=white:x=(w-tw)/2:y=h*0.40,"
           "drawtext=fontfile=%s:text='%s':fontsize=64:fontcolor=#FFD43B:x=(w-tw)/2:y=h*0.40+80,"
           "drawtext=fontfile=%s:text='%s':fontsize=32:fontcolor=white@0.85:x=(w-tw)/2:y=h*0.40+190[v%d]") % (n, FONT, esc('알아줌 · ' + NAME), FONT, esc('지금 무료로 시작하세요'), FONT, esc('카카오로 3초 가입 · 하루 10회 무료'), n))
durs = [s[1] for s in shots] + [END]
prev = 'v0'; acc = durs[0]
for i in range(1, n + 1):
    off = acc - FADE
    fl.append('[%s][v%d]xfade=transition=fade:duration=%.2f:offset=%.2f[x%d]' % (prev, i, FADE, off, i))
    prev = 'x%d' % i; acc = acc + durs[i] - FADE
out = '/home/claude/alajoom-site/assets/%smate-short.mp4' % MATE
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[%s]' % prev, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', out], check=True)
print(MATE, 'total', round(acc, 1))
