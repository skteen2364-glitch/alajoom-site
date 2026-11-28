#!/usr/bin/env python3
"""사장님 꿀팁 글 만들기: tools/tips/posts.json + tools/tips/src/<slug>.md
→ tips/<slug>/index.html, tips/index.html, sitemap.xml(꿀팁 주소만 추가)
사용: python3 tools/tips/build_tips.py  (저장소 루트에서)"""
import json, re, html, os, markdown

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE = 'https://alajoom.com'
posts = json.load(open(os.path.join(ROOT, 'tools/tips/posts.json'), encoding='utf-8'))
posts.sort(key=lambda p: p['date'], reverse=True)

HEAD_COMMON = '''<link rel="icon" href="/assets/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Gaegu:wght@700&display=swap" rel="stylesheet">
<meta name="theme-color" content="#FFF8E7"><meta name="color-scheme" content="only light">'''

CSS = '''<style>
*{box-sizing:border-box}
body{margin:0;background:#FFF8E7;color:#14161F;font-family:'Noto Sans KR',system-ui,sans-serif;line-height:1.75;font-size:16.5px;word-break:keep-all}
header{position:sticky;top:0;background:rgba(255,248,231,.94);backdrop-filter:blur(8px);border-bottom:1px solid #EFE5CC;z-index:5}
header .in{max-width:680px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;justify-content:space-between}
header a.logo{display:flex;align-items:center;gap:8px;color:#14161F;text-decoration:none;font-weight:900;font-size:18px}
header a.logo img{width:28px;height:28px;border-radius:8px}
.tag{display:inline-block;background:#FFD84D;color:#14161F;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;text-decoration:none}
main{max-width:680px;margin:0 auto;padding:22px 20px 60px}
.crumb{font-size:13.5px;color:#6A6F7C;margin:0 0 4px}.crumb a{color:#6A6F7C}
h1{font-family:'Gaegu','Noto Sans KR',sans-serif;font-size:34px;line-height:1.25;margin:10px 0 8px;letter-spacing:-.5px}
.date{color:#6A6F7C;font-size:13.5px;margin:0 0 18px}
article h2{font-size:21px;margin:34px 0 10px;line-height:1.4}
article p{margin:0 0 14px;color:#2A2E3A}
article ul{padding-left:20px;margin:0 0 14px}article li{margin:0 0 8px}
article blockquote{margin:0 0 16px;background:#fff;border:1px solid #EFE5CC;border-left:5px solid #FFD84D;border-radius:14px;padding:12px 16px;position:relative}
article blockquote p{margin:0;color:#14161F}
.cp{float:right;margin:0 0 6px 10px;border:1.5px solid #14161F;background:#fff;border-radius:999px;padding:3px 11px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}
article strong{font-weight:800}
.faq{margin-top:34px;background:#fff;border:1px solid #EFE5CC;border-radius:18px;padding:6px 18px 10px}
.faq h2{margin:16px 0 6px}
.faq h3{font-size:16.5px;margin:16px 0 4px}
.faq p{margin:0 0 6px;color:#3A3F4C}
.more{margin-top:28px;background:#14161F;color:#fff;border-radius:18px;padding:20px;text-align:center}
.more p{margin:0 0 12px;color:#E3E6EE;font-size:15px}
.more a{display:inline-block;background:#FFD84D;color:#14161F;font-weight:900;text-decoration:none;padding:13px 22px;border-radius:12px;box-shadow:0 3px 0 #D9A900}
.list a.card{display:block;background:#fff;border:1px solid #EFE5CC;border-radius:18px;padding:16px 18px;margin:0 0 12px;color:#14161F;text-decoration:none;box-shadow:0 2px 0 #F1E6C8}
.list a.card b{display:block;font-size:17px;line-height:1.45;margin:2px 0 6px}
.list a.card span{font-size:13px;color:#8A6A00;background:#FFF1C7;border-radius:999px;padding:2px 10px}
.list a.card p{margin:0;color:#3A3F4C;font-size:14.5px;line-height:1.6}
.lead{color:#3A3F4C;margin:0 0 20px}
.rel{margin-top:30px}.rel h2{font-size:18px;margin:0 0 10px}
footer{color:#6A6F7C;font-size:13px;text-align:center;padding:20px}
footer a{color:#6A6F7C}
</style>'''

HEADER = '<header><div class="in"><a class="logo" href="/?utm_source=tips"><img src="/assets/icon-192.png" alt="">알아줌</a><a class="tag" href="/tips/">사장님 꿀팁</a></div></header>'
FOOTER = '<footer>알아줌 · 혼자 일하는 사장님 옆에 · <a href="/tips/">사장님 꿀팁</a> · <a href="/terms/">이용약관</a> · <a href="/privacy/">개인정보처리방침</a></footer>'
COPY_JS = '''<script>
document.querySelectorAll('article blockquote').forEach(function(q){var b=document.createElement('button');b.type='button';b.className='cp';b.textContent='복사';b.onclick=function(){var t=q.innerText.replace(/^복사(됨 ✓)?\\s*/,'').trim();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='복사됨 ✓'},function(){var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();b.textContent='복사됨 ✓'})};q.insertBefore(b,q.firstChild)});
</script>'''


def strip_md(s):
    s = re.sub(r'\*\*(.+?)\*\*', r'\1', s)
    s = re.sub(r'\*(.+?)\*', r'\1', s)
    s = re.sub(r'\[(.+?)\]\((.+?)\)', r'\1', s)
    return s.strip()


def parse(slug):
    t = open(os.path.join(ROOT, 'tools/tips/src', slug + '.md'), encoding='utf-8').read()
    lines = t.split('\n')
    if lines[0].startswith('슬러그') or lines[0].startswith('제안 슬러그'):
        lines = lines[1:]
    t = '\n'.join(lines).strip()
    m = re.match(r'# (.+)\n', t)
    title = m.group(1).strip()
    t = t[m.end():].strip()
    body, _, faq = t.partition('## 자주 묻는 질문')
    qas = re.findall(r'\*\*Q\. (.+?)\*\*\s*\nA\. (.+?)(?=\n\s*\n|\Z)', faq.strip(), re.S)
    qas = [(q.strip(), a.strip()) for q, a in qas]
    return title, body.strip(), qas


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + '</script>'


def build_post(p, others):
    title, body, qas = parse(p['slug'])
    p['title'] = title
    url = f"{BASE}/tips/{p['slug']}/"
    esc = html.escape
    body_html = markdown.markdown(body, extensions=['nl2br'])
    faq_html = ''.join(f'<h3>Q. {esc(q)}</h3><p>{esc(a)}</p>' for q, a in qas)
    article_ld = {"@context": "https://schema.org", "@type": "Article", "headline": title,
                  "description": p['description'], "datePublished": p['date'], "dateModified": p['date'],
                  "inLanguage": "ko", "mainEntityOfPage": url, "image": f"{BASE}/assets/og-alajoom.jpg",
                  "author": {"@type": "Organization", "name": "알아줌", "url": BASE + "/"},
                  "publisher": {"@type": "Organization", "name": "알아줌", "url": BASE + "/",
                                "logo": {"@type": "ImageObject", "url": f"{BASE}/assets/icon-192.png"}}}
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qas]}
    rel = ''.join(f'<a class="card" href="/tips/{o["slug"]}/"><b>{esc(o["title"])}</b></a>' for o in others[:3])
    y, mo, d = p['date'].split('-')
    out = f'''<!DOCTYPE html>
<html lang="ko"><head><script>if(location.hostname==='www.alajoom.com')location.replace('https://alajoom.com'+location.pathname+location.search+location.hash)</script><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} · 알아줌 사장님 꿀팁</title>
<meta name="description" content="{esc(p['description'])}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="알아줌">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(p['description'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/assets/og-alajoom.jpg"><meta name="twitter:card" content="summary_large_image">
<meta property="article:published_time" content="{p['date']}">
{HEAD_COMMON}
{ld(article_ld)}
{ld(faq_ld)}
{CSS}</head>
<body>
{HEADER}
<main>
<p class="crumb"><a href="/tips/">사장님 꿀팁</a></p>
<h1>{esc(title)}</h1>
<p class="date">{y}년 {int(mo)}월 {int(d)}일 · 알아줌</p>
<article>
{body_html}
</article>
<section class="faq"><h2>자주 묻는 질문</h2>{faq_html}</section>
<div class="more"><p>직접 써 보려면 →</p><a href="{p['cta']['href']}">{esc(p['cta']['label'])}</a></div>
{('<section class="rel list"><h2>다른 사장님 꿀팁</h2>' + rel + '</section>') if rel else ''}
</main>
{FOOTER}
<script src="/assets/family.js" defer></script>
{COPY_JS}
</body></html>
'''
    os.makedirs(os.path.join(ROOT, 'tips', p['slug']), exist_ok=True)
    open(os.path.join(ROOT, 'tips', p['slug'], 'index.html'), 'w', encoding='utf-8').write(out)


def build_index():
    esc = html.escape
    cards = ''.join(f'<a class="card" href="/tips/{p["slug"]}/"><span>{p["date"].replace("-", ".")}</span><b>{esc(p["title"])}</b><p>{esc(p["description"])}</p></a>' for p in posts)
    coll = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "알아줌 사장님 꿀팁",
            "url": f"{BASE}/tips/", "inLanguage": "ko",
            "hasPart": [{"@type": "Article", "headline": p['title'], "url": f"{BASE}/tips/{p['slug']}/", "datePublished": p['date']} for p in posts]}
    desc = '리뷰 답글, 단골 문자, 홍보 문구까지 — 혼자 가게 하는 사장님이 바로 복사해 쓰는 예시 문장 모음.'
    out = f'''<!DOCTYPE html>
<html lang="ko"><head><script>if(location.hostname==='www.alajoom.com')location.replace('https://alajoom.com'+location.pathname+location.search+location.hash)</script><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>사장님 꿀팁 · 바로 복사해 쓰는 예시 문장 | 알아줌</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{BASE}/tips/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="알아줌">
<meta property="og:title" content="알아줌 사장님 꿀팁">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{BASE}/tips/">
<meta property="og:image" content="{BASE}/assets/og-alajoom.jpg"><meta name="twitter:card" content="summary_large_image">
{HEAD_COMMON}
{ld(coll)}
{CSS}</head>
<body>
{HEADER}
<main>
<h1>사장님 꿀팁</h1>
<p class="lead">{desc}</p>
<section class="list">{cards}</section>
<div class="more"><p>리뷰 답글, 붙여넣으면 바로 3개</p><a href="/review/?utm_source=tips">리뷰 답글 바로 만들기 (무료)</a></div>
</main>
{FOOTER}
<script src="/assets/family.js" defer></script>
</body></html>
'''
    os.makedirs(os.path.join(ROOT, 'tips'), exist_ok=True)
    open(os.path.join(ROOT, 'tips', 'index.html'), 'w', encoding='utf-8').write(out)


def update_sitemap():
    path = os.path.join(ROOT, 'sitemap.xml')
    s = open(path, encoding='utf-8').read()
    entries = [(f'{BASE}/tips/', posts[0]['date'])] + [(f"{BASE}/tips/{p['slug']}/", p['date']) for p in posts]
    for loc, lm in entries:
        pat = re.compile(r'\s*<url><loc>' + re.escape(loc) + r'</loc>.*?</url>')
        s = pat.sub('', s)
    add = ''.join(f'\n  <url><loc>{loc}</loc><lastmod>{lm}</lastmod></url>' for loc, lm in entries)
    s = s.replace('\n</urlset>', add + '\n</urlset>')
    open(path, 'w', encoding='utf-8').write(s)


for p in posts:
    p['title'] = parse(p['slug'])[0]
for p in posts:
    build_post(p, [o for o in posts if o is not p])
build_index()
update_sitemap()
print('built', [p['slug'] for p in posts])
