import json, datetime
ROOT = '/mnt/user-data/outputs/artifacts/7b10eac4-a8ce-445e-af32-6852c0362101/project/'
FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&amp;family=Noto+Sans+KR:wght@400;500;700;900&amp;display=swap">'
SANS = "'Noto Sans KR', 'Apple SD Gothic Neo', system-ui, sans-serif"
SERIF = "'Gowun Batang', 'Noto Serif KR', serif"

I = {
 'home': '<path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z"/>',
 'spark': '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
 'users': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6 6 0 0 0-3-5.2"/>',
 'folder': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 'mic': '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
 'camera': '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 'image': '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
 'msg': '<path d="M4 5h16v11H9l-5 4z"/>',
 'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
 'plus': '<path d="M12 5v14M5 12h14"/>',
 'drop': '<path d="M12 3c3.5 4.2 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.5-6.8 6-11z"/>',
 'check': '<path d="M5 12l5 5 9-10"/>',
 'card': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
}
def ic(name, size=22, color='currentColor', sw=2):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[name]}</svg>'

def page(title, body, ground, ink):
    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONT}
<style>
body{{margin:0}}
a{{color:{ink}}}a:hover{{color:{ink}}}
::selection{{background:#F6D3DF}}
</style>
</helmet>
<div style="width: 390px; height: 844px; position: relative; overflow: hidden; box-sizing: border-box; background: {ground}; color: {ink}; font-family: {SANS}; -webkit-font-smoothing: antialiased">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":390,"height":844}}}}'>
class Component extends DCLogic {{
renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''

def nav(active, bg, line, ink, muted, acc):
    items = [('home', '오늘'), ('spark', '홍보'), ('users', '고객'), ('folder', '작업실')]
    cells = ''
    for k, lab in items:
        on = lab == active
        col = acc if on else muted
        cells += f'<a href="#" style="flex: 1; min-height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; color: {col}; font-size: 11.5px; font-weight: {900 if on else 500}">{ic(k, 22, col, 2.2 if on else 1.8)}{lab}</a>'
    return f'<nav aria-label="메뉴" style="position: absolute; left: 0; right: 0; bottom: 0; height: 74px; padding: 0 8px 10px; box-sizing: border-box; display: flex; background: {bg}; border-top: 1px solid {line}">{cells}</nav>'

def logo(ink, sub='봄결 스킨케어 · 연남동', muted='#6E5F64'):
    return f'''<header style="display: flex; align-items: center; gap: 10px; padding: 18px 22px 0">
<a href="#" aria-label="스킨메이트 첫 화면" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: {ink}; min-height: 44px">
<span style="width: 34px; height: 34px; border-radius: 10px; background: #FFD43B; color: #14161F; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px">알</span>
<span style="display: flex; flex-direction: column; line-height: 1.25"><b style="font-size: 15px; font-weight: 900">스킨메이트</b><small style="font-size: 12px; color: {muted}">{sub}</small></span></a>
<span style="flex: 1"></span>
<span style="font-size: 12px; font-weight: 700; color: {muted}">오늘 10회</span>
</header>'''

# ---------------- A. 포슬린 에디토리얼 ----------------
A_G, A_INK, A_MUT, A_ACC, A_LINE = '#FAF6F3', '#2A1E22', '#6B5A60', '#B83C66', '#EADFDB'
def a_today():
    rows = [('11:00', '김지은', '수분 관리', '관리권 7/10'), ('14:00', '박하늘', '진정 관리', '첫 방문'), ('17:30', '이서연', '왁싱', '1회 관리')]
    tl = ''
    for i, (t, n, w, m) in enumerate(rows):
        tl += f'''<div style="display: flex; gap: 16px; align-items: flex-start; padding: 14px 0; border-top: 1px solid {A_LINE}">
<span style="width: 58px; flex: none; font-family: {SERIF}; font-size: 22px; font-weight: 700; color: {A_ACC if i == 0 else A_INK}; letter-spacing: -0.02em">{t}</span>
<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><b style="font-size: 16px; font-weight: 700">{n}님 · {w}</b><small style="font-size: 13px; color: {A_MUT}">{m}</small></span>
{'<a href="#" style="align-self: center; min-height: 44px; display: flex; align-items: center; font-size: 13px; font-weight: 700; color: ' + A_ACC + '; text-decoration: underline; text-underline-offset: 4px">확인 문자</a>' if i == 0 else ''}
</div>'''
    todo = ''
    for lab, sub, btn in [('최유나님 관리권 1회 남음', '재등록 안내를 보낼 때예요', '안내 쓰기'), ('35일 넘게 안 오신 고객 3분', '정민지, 한소희, 윤가람', '안부 쓰기')]:
        todo += f'''<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid {A_LINE}">
<span style="flex: 1; display: flex; flex-direction: column; gap: 2px"><b style="font-size: 15px">{lab}</b><small style="font-size: 13px; color: {A_MUT}">{sub}</small></span>
<a href="#" style="min-height: 44px; padding: 0 14px; display: flex; align-items: center; border-radius: 999px; border: 1px solid {A_INK}; font-size: 13.5px; font-weight: 700; text-decoration: none; color: {A_INK}">{btn}</a></div>'''
    body = logo(A_INK, muted=A_MUT) + f'''
<main style="padding: 26px 22px 0; display: flex; flex-direction: column">
<p style="margin: 0 0 8px; font-size: 13px; color: {A_MUT}">11월 18일 수요일</p>
<h1 style="margin: 0; font-family: {SERIF}; font-size: 33px; line-height: 1.28; font-weight: 700; letter-spacing: -0.02em; text-wrap: balance">오늘은 세 분이<br>오세요.</h1>
<section aria-label="오늘 예약" style="margin-top: 20px">{tl}</section>
<h2 style="margin: 24px 0 4px; font-size: 15px; font-weight: 900">챙길 일</h2>
<section>{todo}</section>
</main>
<div style="position: absolute; left: 22px; right: 22px; bottom: 90px; display: flex; gap: 10px">
<a href="#" style="flex: 1; min-height: 56px; border-radius: 16px; background: {A_ACC}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16.5px; font-weight: 900; text-decoration: none; box-shadow: 0 10px 24px -12px rgba(143,44,78,.7)">{ic('spark', 20, '#FFFFFF', 2.3)}오늘 홍보 만들기</a>
<button type="button" aria-label="말로 시키기" style="width: 56px; height: 56px; border-radius: 16px; border: 1px solid {A_INK}; background: transparent; color: {A_INK}; display: flex; align-items: center; justify-content: center">{ic('mic', 22, A_INK)}</button>
</div>''' + nav('오늘', A_G, A_LINE, A_INK, A_MUT, A_ACC)
    return page('A 오늘', body, A_G, A_INK)

def mini_post(bg, title, sub, ink='#FFFFFF', w=112, h=140, extra=''):
    return f'<span style="width: {w}px; height: {h}px; flex: none; border-radius: 12px; background: {bg}; color: {ink}; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; box-shadow: 0 6px 16px -10px rgba(42,30,34,.5); {extra}"><b style="font-size: 14px; line-height: 1.25; font-weight: 900; white-space: pre-line">{title}</b><small style="font-size: 10.5px; opacity: .85">{sub}</small></span>'

def a_promo():
    outs = [
        (mini_post('linear-gradient(160deg,#C9A89B,#8E6A5E)', '촉촉한 하루\n수분 관리', '인스타 게시물'), '인스타 글'),
        (mini_post('#FFFFFF', '첫 방문\n20%', '쿠폰 카드', ink=A_INK, extra='border: 2px dashed #E3B9C8'), '안내 카드'),
        ('<span style="width: 112px; height: 140px; flex: none; border-radius: 12px; background: #F3ECE8; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-end; gap: 6px"><span style="background: #FFF7C2; border-radius: 4px 12px 12px 12px; padding: 8px; font-size: 10.5px; line-height: 1.45; color: #2A1E22">지은님, 내일 11시 수분 관리 예약 확인드려요</span></span>', '고객 문자'),
    ]
    gal = ''.join(f'<a href="#" style="display: flex; flex-direction: column; gap: 8px; text-decoration: none; color: {A_INK}; font-size: 13px; font-weight: 700">{o}{lab}</a>' for o, lab in outs)
    chips = ''.join(f'<button type="button" style="min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid {"#2A1E22" if i == 1 else A_LINE}; background: {"#2A1E22" if i == 1 else "#FFFFFF"}; color: {"#FFFFFF" if i == 1 else A_INK}; font: inherit; font-size: 13.5px; font-weight: 700">{c}</button>' for i, c in enumerate(['이달의 관리', '신규 고객 이벤트', '홈케어 팁', '휴무 안내', '원장 소개']))
    body = logo(A_INK, muted=A_MUT) + f'''
<main style="padding: 26px 22px 0; display: flex; flex-direction: column; gap: 18px">
<h1 style="margin: 0; font-family: {SERIF}; font-size: 31px; line-height: 1.3; font-weight: 700; letter-spacing: -0.02em">무엇을 알릴까요?</h1>
<label style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: {A_MUT}">한 줄로 알려 주세요
<span style="display: flex; align-items: center; gap: 8px; background: #FFFFFF; border: 1px solid {A_LINE}; border-radius: 16px; padding: 6px 6px 6px 16px">
<input type="text" value="11월 첫 방문 수분 관리 20%, 선착순 10명" style="flex: 1; min-width: 0; border: 0; outline: 0; font: inherit; font-size: 15.5px; color: {A_INK}; background: transparent">
<button type="button" aria-label="말로 입력" style="width: 44px; height: 44px; border-radius: 12px; border: 0; background: {A_ACC}; color: #fff; display: flex; align-items: center; justify-content: center">{ic('mic', 20, '#FFFFFF')}</button></span></label>
<div style="display: flex; flex-wrap: wrap; gap: 8px">{chips}</div>
<h2 style="margin: 6px 0 0; font-size: 15px; font-weight: 900">이렇게 한 번에 만들어져요</h2>
<div style="display: flex; gap: 12px">{gal}</div>
</main>
<div style="position: absolute; left: 22px; right: 22px; bottom: 90px">
<a href="#" style="min-height: 56px; border-radius: 16px; background: {A_ACC}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16.5px; font-weight: 900; text-decoration: none; box-shadow: 0 10px 24px -12px rgba(143,44,78,.7)">AI 직원에게 맡기기 {ic('arrow', 20, '#FFFFFF', 2.4)}</a></div>''' + nav('홍보', A_G, A_LINE, A_INK, A_MUT, A_ACC)
    return page('A 홍보', body, A_G, A_INK)

# ---------------- B. 로즈 볼드 ----------------
B_ACC, B_D, B_INK, B_MUT = '#B83C66', '#8F2C4E', '#1F1418', '#665359'
def b_today():
    appts = ''.join(f'''<div style="flex: none; width: 150px; border-radius: 18px; background: #FFFFFF; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 8px 20px -14px rgba(31,20,24,.6)">
<b style="font-size: 22px; font-weight: 900; color: {B_ACC if i == 0 else B_INK}; letter-spacing: -0.02em">{t}</b><span style="font-size: 15px; font-weight: 700">{n}님</span><small style="font-size: 12.5px; color: {B_MUT}">{w}</small></div>'''
        for i, (t, n, w) in enumerate([('11:00', '김지은', '수분 관리'), ('14:00', '박하늘', '진정 관리 · 첫 방문'), ('17:30', '이서연', '왁싱')]))
    body = f'''
<section style="background: {B_ACC}; color: #FFFFFF; padding: 0 0 70px; position: relative">
<header style="display: flex; align-items: center; gap: 10px; padding: 18px 22px 0">
<a href="#" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: #FFFFFF; min-height: 44px"><span style="width: 34px; height: 34px; border-radius: 10px; background: #FFD43B; color: #14161F; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 15px">알</span><b style="font-size: 15px; font-weight: 900">스킨메이트</b></a>
<span style="flex: 1"></span><span style="font-size: 12px; font-weight: 700; opacity: .9">봄결 스킨케어</span></header>
<h1 style="margin: 30px 22px 0; font-size: 36px; line-height: 1.22; font-weight: 900; letter-spacing: -0.03em">원장님 홍보,<br>한 줄이면<br>끝나요.</h1>
<a href="#" style="margin: 22px 22px 0; min-height: 58px; border-radius: 18px; background: #FFD43B; color: #14161F; display: flex; align-items: center; justify-content: space-between; padding: 0 18px 0 20px; font-size: 17px; font-weight: 900; text-decoration: none">오늘 홍보 만들기 {ic('arrow', 22, '#14161F', 2.6)}</a>
</section>
<section style="margin-top: -46px; padding: 0 0 0 22px; display: flex; flex-direction: column; gap: 10px">
<h2 style="margin: 0; font-size: 13px; font-weight: 700; color: #FFFFFF">오늘 예약 3</h2>
<div style="display: flex; gap: 10px; overflow: hidden; padding-bottom: 6px">{appts}</div></section>
<section style="padding: 18px 22px 0; display: grid; grid-template-columns: 1.15fr 1fr; grid-template-rows: 112px 112px; gap: 10px">
<a href="#" style="grid-row: span 2; border-radius: 20px; background: linear-gradient(170deg,#D7B4A6 0%,#9B7466 100%); color: #FFFFFF; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; text-decoration: none">
<span style="width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,.22); display: flex; align-items: center; justify-content: center">{ic('camera', 22, '#FFFFFF')}</span>
<b style="font-size: 18px; line-height: 1.3; font-weight: 900">사진 한 장으로<br>홍보하기</b></a>
<a href="#" style="border-radius: 20px; background: #FFFFFF; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; text-decoration: none; color: {B_INK}; box-shadow: inset 0 0 0 1px #EBDCE1">{ic('card', 22, B_ACC)}<b style="font-size: 15.5px; font-weight: 900">카드 만들기</b></a>
<a href="#" style="border-radius: 20px; background: #FFFFFF; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; text-decoration: none; color: {B_INK}; box-shadow: inset 0 0 0 1px #EBDCE1">{ic('msg', 22, B_ACC)}<b style="font-size: 15.5px; font-weight: 900">고객 문자 <small style="font-weight: 700; color: {B_ACC}">· 5</small></b></a>
</section>''' + nav('오늘', '#FFFFFF', '#EBDCE1', B_INK, B_MUT, B_ACC)
    return page('B 오늘', body, '#FBF3F5', B_INK)

def tcard(kind):
    if kind == 'coupon':
        return f'<span style="aspect-ratio: 4 / 5; border-radius: 14px; background: {B_ACC}; padding: 12px; box-sizing: border-box; display: flex"><span style="flex: 1; border-radius: 10px; background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; color: {B_INK}"><small style="font-size: 10px; font-weight: 900; color: {B_ACC}">COUPON</small><b style="font-size: 20px; font-weight: 900; line-height: 1.15">첫 방문<br>20%</b><small style="font-size: 10px; color: {B_MUT}">11월 30일까지</small></span></span>'
    if kind == 'mag':
        return '<span style="aspect-ratio: 4 / 5; border-radius: 14px; background: linear-gradient(180deg,#C9A89B 0%,#6E4E44 100%); padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-end; color: #FFFFFF"><span style="width: 26px; height: 3px; background: #FFD43B; margin-bottom: 8px"></span><b style="font-size: 18px; line-height: 1.2; font-weight: 900">촉촉한<br>하루의 끝</b><small style="font-size: 10px; opacity: .85; margin-top: 4px">봄결 스킨케어</small></span>'
    if kind == 'menu':
        rows = ''.join(f'<span style="display: flex; gap: 4px; font-size: 10.5px; font-weight: 700"><span>{a}</span><span style="flex: 1; border-bottom: 1.5px dotted #C9BFA8; margin-bottom: 3px"></span><span>{b}</span></span>' for a, b in [('수분 관리', '90,000'), ('진정 관리', '90,000'), ('왁싱', '30,000')])
        return f'<span style="aspect-ratio: 4 / 5; border-radius: 14px; background: #FBF7EE; padding: 14px 12px; box-sizing: border-box; display: flex; flex-direction: column; gap: 7px; color: {B_INK}; box-shadow: inset 0 3px 0 {B_ACC}"><b style="font-size: 15px; font-weight: 900; text-align: center; margin: 4px 0 6px">관리 메뉴</b>{rows}</span>'
    if kind == 'noir':
        return '<span style="aspect-ratio: 4 / 5; border-radius: 14px; background: #14161F; padding: 10px; box-sizing: border-box; display: flex"><span style="flex: 1; border: 1px solid #D9B36C; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #FFFFFF; text-align: center"><small style="font-size: 9px; letter-spacing: .3em; color: #D9B36C">V I P</small><b style="font-size: 16px; font-weight: 900; line-height: 1.25">단골 고객<br>감사 주간</b></span></span>'
    if kind == 'polaroid':
        return f'<span style="aspect-ratio: 4 / 5; border-radius: 14px; background: #F3EDE2; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column"><span style="flex: 1; background: #FFFFFF; padding: 8px 8px 0; transform: rotate(-2deg); box-shadow: 0 6px 12px -6px rgba(0,0,0,.3); display: flex; flex-direction: column"><span style="flex: 1; background: linear-gradient(160deg,#E8CFC6,#B8958A)"></span><small style="text-align: center; font-size: 10.5px; font-weight: 700; padding: 6px 0; color: {B_INK}">오늘의 관리실</small></span></span>'
    return f'<span style="aspect-ratio: 4 / 5; border-radius: 14px; background: linear-gradient(140deg,#FBE7EE,#FFF3D6); padding: 12px; box-sizing: border-box; display: flex; align-items: center"><span style="flex: 1; border-radius: 12px; background: rgba(255,255,255,.9); padding: 12px; display: flex; flex-direction: column; gap: 6px; color: {B_INK}"><small style="align-self: flex-start; font-size: 9.5px; font-weight: 900; background: {B_ACC}; color: #FFFFFF; padding: 3px 8px; border-radius: 999px">홈케어 팁</small><b style="font-size: 14px; line-height: 1.3; font-weight: 900">관리 받은 날<br>저녁 보습법</b></span></span>'

def b_promo():
    kinds = [('coupon', '쿠폰'), ('mag', '매거진'), ('menu', '메뉴판'), ('pastel', '파스텔'), ('polaroid', '폴라로이드'), ('noir', '블랙 골드')]
    grid = ''.join(f'<a href="#" style="display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: {B_INK}; font-size: 12.5px; font-weight: 700; border-radius: 16px; {"outline: 3px solid " + B_ACC + "; outline-offset: 3px;" if i == 0 else ""}">{tcard(k)}{lab}</a>' for i, (k, lab) in enumerate(kinds))
    body = f'''
<header style="display: flex; align-items: center; gap: 12px; padding: 18px 22px 0">
<a href="#" aria-label="뒤로" style="width: 44px; height: 44px; border-radius: 14px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px #EBDCE1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="{B_INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></a>
<b style="font-size: 15px; font-weight: 900">안내 카드</b></header>
<main style="padding: 18px 22px 0; display: flex; flex-direction: column; gap: 14px">
<h1 style="margin: 0; font-size: 30px; line-height: 1.25; font-weight: 900; letter-spacing: -0.03em">디자인부터<br>골라 보세요</h1>
<div role="group" aria-label="크기" style="display: flex; gap: 6px">{''.join(f'<button type="button" style="min-height: 40px; padding: 0 14px; border-radius: 999px; border: 0; background: {"#1F1418" if i == 0 else "#FFFFFF"}; color: {"#FFFFFF" if i == 0 else B_INK}; font: inherit; font-size: 13px; font-weight: 700; box-shadow: inset 0 0 0 1px #EBDCE1">{c}</button>' for i, c in enumerate(['피드 4:5', '정사각', '스토리']))}</div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 10px">{grid}</div>
</main>
<div style="position: absolute; left: 22px; right: 22px; bottom: 90px">
<a href="#" style="min-height: 56px; border-radius: 18px; background: {B_ACC}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 16.5px; font-weight: 900; text-decoration: none">쿠폰 디자인으로 글 채우기 {ic('arrow', 20, '#FFFFFF', 2.4)}</a></div>''' + nav('홍보', '#FFFFFF', '#EBDCE1', B_INK, B_MUT, B_ACC)
    return page('B 홍보', body, '#FBF3F5', B_INK)

# ---------------- C. 사진 중심 ----------------
C_G, C_INK, C_MUT, C_ACC, C_LINE = '#FFFCFA', '#221A1D', '#6A5D62', '#B83C66', '#EFE6E2'
PHOTO = 'background: radial-gradient(120% 90% at 30% 20%, #F2DED6 0%, #D4B2A5 45%, #8C675B 100%)'
def c_today():
    rows = ''.join(f'<div style="display: flex; align-items: center; gap: 14px; min-height: 52px; border-bottom: 1px solid {C_LINE}"><b style="width: 50px; font-size: 15px; font-weight: 900; color: {C_ACC if i == 0 else C_INK}">{t}</b><span style="flex: 1; font-size: 15px">{n}님 <small style="color: {C_MUT}">· {w}</small></span></div>' for i, (t, n, w) in enumerate([('11:00', '김지은', '수분 관리'), ('14:00', '박하늘', '진정 관리'), ('17:30', '이서연', '왁싱')]))
    body = logo(C_INK, muted=C_MUT) + f'''
<section style="margin: 16px 22px 0; height: 330px; border-radius: 24px; {PHOTO}; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 18px; box-sizing: border-box">
<span style="position: absolute; top: 14px; left: 14px; font-size: 11.5px; font-weight: 700; color: #FFFFFF; background: rgba(34,26,29,.45); padding: 5px 10px; border-radius: 999px">어제 찍은 관리실 사진</span>
<span style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(34,26,29,0) 40%, rgba(34,26,29,.72) 100%)"></span>
<h1 style="position: relative; margin: 0 0 12px; color: #FFFFFF; font-size: 24px; line-height: 1.3; font-weight: 900; letter-spacing: -0.02em">이 사진으로<br>오늘 올려 볼까요?</h1>
<div style="position: relative; display: flex; gap: 8px">
<a href="#" style="flex: 1; min-height: 50px; border-radius: 14px; background: #FFD43B; color: #14161F; display: flex; align-items: center; justify-content: center; font-size: 15.5px; font-weight: 900; text-decoration: none">이 사진으로 홍보</a>
<a href="#" style="min-height: 50px; padding: 0 16px; border-radius: 14px; background: rgba(255,255,255,.18); color: #FFFFFF; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,.45)">{ic('camera', 18, '#FFFFFF')}새로 찍기</a></div></section>
<section style="padding: 20px 22px 0"><h2 style="margin: 0 0 4px; font-size: 15px; font-weight: 900">오늘 예약</h2>{rows}</section>
<button type="button" aria-label="말로 시키기" style="position: absolute; right: 22px; bottom: 92px; width: 60px; height: 60px; border-radius: 50%; border: 0; background: {C_ACC}; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px -10px rgba(143,44,78,.8)">{ic('mic', 24, '#FFFFFF', 2.2)}</button>''' + nav('오늘', C_G, C_LINE, C_INK, C_MUT, C_ACC)
    return page('C 오늘', body, C_G, C_INK)

def c_promo():
    flts = [('기본', 'none'), ('화사하게', 'saturate(1.3) brightness(1.06)'), ('뽀얀 톤', 'brightness(1.12) contrast(.86)'), ('시네마', 'contrast(1.1) hue-rotate(-8deg)'), ('흑백', 'grayscale(1)')]
    fl = ''.join(f'<a href="#" style="flex: none; display: flex; flex-direction: column; align-items: center; gap: 6px; text-decoration: none; color: {C_ACC if i == 2 else C_INK}; font-size: 12px; font-weight: {900 if i == 2 else 600}"><span style="width: 62px; height: 62px; border-radius: 50%; {PHOTO}; filter: {f}; box-shadow: {"0 0 0 3px " + C_G + ", 0 0 0 5px " + C_ACC if i == 2 else "none"}"></span>{lab}</a>' for i, (lab, f) in enumerate(flts))
    frames = [
        ('하단 띠', f'<span style="position: absolute; left: 0; right: 0; bottom: 0; height: 26%; background: {C_ACC}; display: flex; align-items: center; padding: 0 8px"><b style="color: #fff; font-size: 10px">11월 이벤트</b></span>'),
        ('매거진', '<span style="position: absolute; left: 8px; top: 10px; display: flex; flex-direction: column; gap: 4px"><span style="width: 18px; height: 2px; background: #FFD43B"></span><b style="color: #fff; font-size: 11px; line-height: 1.2">촉촉한<br>하루</b></span>'),
        ('스티커', f'<span style="position: absolute; right: 6px; top: 6px; width: 34px; height: 34px; border-radius: 50%; background: {C_ACC}; color: #fff; font-size: 9px; font-weight: 900; display: flex; align-items: center; justify-content: center; transform: rotate(10deg)">NEW</span>'),
        ('폴라로이드', '<span style="position: absolute; inset: 0; border: 6px solid #fff; border-bottom-width: 18px"></span>'),
    ]
    fr = ''.join(f'<a href="#" style="flex: none; display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: {C_INK}; font-size: 12px; font-weight: 600"><span style="width: 80px; height: 100px; border-radius: 12px; {PHOTO}; position: relative; overflow: hidden; display: block; box-shadow: {"0 0 0 2px " + C_ACC if i == 0 else "none"}">{h}</span>{lab}</a>' for i, (lab, h) in enumerate(frames))
    body = f'''
<header style="display: flex; align-items: center; gap: 12px; padding: 18px 22px 0">
<a href="#" aria-label="뒤로" style="width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px {C_LINE}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="{C_INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></a>
<b style="font-size: 15px; font-weight: 900">사진 홍보</b><span style="flex: 1"></span>
<a href="#" style="min-height: 44px; padding: 0 16px; border-radius: 14px; background: {C_INK}; color: #FFFFFF; display: flex; align-items: center; font-size: 14px; font-weight: 900; text-decoration: none">다음</a></header>
<section style="margin: 14px 22px 0; height: 360px; border-radius: 22px; {PHOTO}; filter: brightness(1.12) contrast(.86); position: relative; overflow: hidden">
<span style="position: absolute; left: 0; right: 0; bottom: 0; height: 84px; background: {C_ACC}; display: flex; flex-direction: column; justify-content: center; padding: 0 20px"><b style="color: #FFFFFF; font-size: 22px; font-weight: 900">11월 수분 관리 이벤트</b><small style="color: rgba(255,255,255,.88); font-size: 12px; margin-top: 2px">봄결 스킨케어 · 연남동</small></span></section>
<h2 style="margin: 18px 22px 10px; font-size: 14px; font-weight: 900">필터</h2>
<div style="display: flex; gap: 12px; padding: 0 22px; overflow: hidden">{fl}</div>
<h2 style="margin: 16px 22px 10px; font-size: 14px; font-weight: 900">꾸미기</h2>
<div style="display: flex; gap: 10px; padding: 0 22px; overflow: hidden">{fr}</div>''' + nav('홍보', C_G, C_LINE, C_INK, C_MUT, C_ACC)
    return page('C 홍보', body, C_G, C_INK)

files = {'Main.dc.html': a_today(), 'A-promo.dc.html': a_promo(), 'B-today.dc.html': b_today(), 'B-promo.dc.html': b_promo(), 'C-today.dc.html': c_today(), 'C-promo.dc.html': c_promo()}
for k, v in files.items():
    open(ROOT + k, 'w', encoding='utf-8').write(v)
rows = [('Main.dc.html', 'A-promo.dc.html'), ('B-today.dc.html', 'B-promo.dc.html'), ('C-today.dc.html', 'C-promo.dc.html')]
titles = ['A · 포슬린 에디토리얼 — 차분한 명조, 오늘 일정이 주인공', 'B · 로즈 볼드 — 꽉 찬 색, 큰 버튼, 디자인부터 고르기', 'C · 사진 중심 — 샵 사진이 첫 화면, 필터·꾸미기 바로']
boards, order, notes = {}, [], {}
for r, (a, b) in enumerate(rows):
    y = 300 + r * (844 + 420)
    for c, f in enumerate((a, b)):
        boards[f] = {'x': c * 470, 'y': y, 'w': 390, 'h': 844, 'title': ['오늘', '홍보'][c] + ' · ' + 'ABC'[r]}
        order.append(f)
    notes[f'row{r}'] = {'x': 0, 'y': y - 250, 'text': titles[r], 'kind': 'title1', 'maxW': 860}
idx = {'v': 3, 'createdOnFiles': {'v': 1, 'at': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}, 'title': '스킨메이트 새 디자인 시안', 'launch': {'view': 'canvas'}, 'pages': [], 'boards': boards, 'order': order, 'notes': notes, 'designSystems': []}
open(ROOT + 'canvas.json', 'w', encoding='utf-8').write(json.dumps(idx, ensure_ascii=False))
print('ok', list(files))
