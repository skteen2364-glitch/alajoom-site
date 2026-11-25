import json, subprocess, sys, glob, os
MATE = sys.argv[1]
V = sorted(glob.glob('/tmp/rec_%s/*.webm' % MATE), key=os.path.getmtime)[-1]
M = dict(json.load(open('/tmp/rec_%s/marks.json' % MATE)))
OFF = 2.6
t = lambda k: M[k] + OFF
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',V]).decode())
segs = [  # (start, end, speed)
    (t('set') + 0.25, t('channels') + 0.3, 1.7),
    (t('photo') - 0.2, t('photo') + 1.0, 1.0),
    (t('aigo') - 0.5, t('aigo') + 0.7, 1.0),
    (t('aidone') - 0.5, t('aidone') + 1.4, 1.0),
    (t('result') - 0.1, min(dur - 0.15, t('end') + 2.5), 1.3),
]
# 출력 타임라인 계산
out_t = []; acc = 0
for a, b, sp in segs:
    out_t.append((acc, acc + (b - a) / sp)); acc += (b - a) / sp
def ot(src):  # 결과 구간 안의 원본 시각 → 출력 시각
    a, b, sp = segs[4]; return max(out_t[4][0], out_t[4][0] + (src - a) / sp - 0.55)
END = 2.0
total = acc + END
NAME = {'skin': '스킨메이트', 'food': '푸드메이트'}[MATE]
caps = [
    (0, out_t[0][1], '한 줄만 적으면', '오늘 알릴 것 한 줄 + 올릴 곳 고르기'),
    (out_t[1][0], out_t[3][1], '사진은 AI가 화보처럼', '음식·제품은 그대로, 빛과 배경만' if MATE == 'food' else '공간은 그대로, 빛과 정리만'),
    (out_t[4][0], ot(t('tab_blog')), 'AI 직원 세트가 한 번에', '인스타 글'),
    (ot(t('tab_blog')), ot(t('tab_sms')), 'AI 직원 세트가 한 번에', '네이버 블로그'),
    (ot(t('tab_sms')), ot(t('tab_daangn')), 'AI 직원 세트가 한 번에', '단골 문자·카톡'),
    (ot(t('tab_daangn')), ot(t('tab_place')), 'AI 직원 세트가 한 번에', '당근 소식'),
    (ot(t('tab_place')), ot(t('end')), 'AI 직원 세트가 한 번에', '네이버 플레이스 소식'),
    (ot(t('end')), acc, '올리기 전 미리보기까지', '과장·의료 표현은 자동 검사'),
]
def esc(s): return s.replace(':', '\\:').replace("'", "’").replace(',', '\\,')
W, H = 720, 1558
parts = []
for i, (a, b, sp) in enumerate(segs):
    parts.append('[0:v]trim=%.3f:%.3f,setpts=(PTS-STARTPTS)/%.3f,scale=%d:%d,fps=30[s%d]' % (a, b, sp, W, H, i))
la, lb, _ = segs[4]
parts.append('[0:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,scale=%d:%d,fps=30,loop=loop=%d:size=1:start=0,trim=0:%.2f,boxblur=8:2,eq=brightness=-0.25[e]' % (lb - 0.05, lb, W, H, int(END * 30) + 5, END))
parts.append(''.join('[s%d]' % i for i in range(len(segs))) + '[e]concat=n=%d:v=1:a=0[c]' % (len(segs) + 1))
dt = []
for a, b, l1, l2 in caps:
    en = "enable='between(t,%.2f,%.2f)'" % (a, b - 0.02)
    dt.append("drawtext=fontfile=%s:text='%s':fontsize=50:fontcolor=#FFD43B:x=(w-tw)/2:y=h*0.76:box=1:boxcolor=0x14161F@0.82:boxborderw=22:%s" % (FONT, esc(l1), en))
    dt.append("drawtext=fontfile=%s:text='%s':fontsize=34:fontcolor=white:x=(w-tw)/2:y=h*0.76+100:box=1:boxcolor=0x14161F@0.82:boxborderw=16:%s" % (FONT, esc(l2), en))
e0 = acc
dt.append("drawtext=fontfile=%s:text='%s':fontsize=40:fontcolor=white:x=(w-tw)/2:y=h*0.40:enable='gte(t,%.2f)'" % (FONT, esc('알아줌 · ' + NAME), e0))
dt.append("drawtext=fontfile=%s:text='%s':fontsize=64:fontcolor=#FFD43B:x=(w-tw)/2:y=h*0.40+80:enable='gte(t,%.2f)'" % (FONT, esc('지금 무료로 시작하세요'), e0))
dt.append("drawtext=fontfile=%s:text='%s':fontsize=32:fontcolor=white@0.85:x=(w-tw)/2:y=h*0.40+190:enable='gte(t,%.2f)'" % (FONT, esc('카카오로 3초 가입 · 하루 10회 무료'), e0))
fc = ';'.join(parts) + ';[c]' + ','.join(dt) + '[v]'
out = '/home/claude/alajoom-site/assets/%smate-short.mp4' % MATE
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', V, '-filter_complex', fc, '-map', '[v]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out], check=True)
print(MATE, 'total', round(total, 1), 's', [tuple(round(x, 1) for x in o) for o in out_t])
