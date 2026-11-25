import re
base='/home/claude/alajoom-site/'
CSS_ANCH='.ph-wrap img{width:100%;display:block;border-radius:14px;border:1px solid var(--line);background:#eee}\n'
CSS_ADD=CSS_ANCH+'''/* 보정하면서 사진이 계속 보이게: 모바일은 위에 붙고, PC는 왼쪽 사진·오른쪽 조절 */
#phEdit>.ph-wrap{position:sticky;top:58px;z-index:4;background:#fff;padding-bottom:6px}
#phEdit>.ph-wrap img{max-height:40svh;object-fit:contain}
@media (min-width:900px){
  #phEdit{display:grid !important;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);column-gap:22px;row-gap:14px;align-items:start}
  #phEdit>.ph-wrap{grid-column:1;grid-row:1 / span 30;top:84px;padding-bottom:0}
  #phEdit>.ph-wrap img{max-height:calc(100vh - 150px)}
  #phEdit>*:not(.ph-wrap){grid-column:2;min-width:0}
}
'''
JS_ANCH='    var android = /Android/i.test(navigator.userAgent);\n'
JS_ADD='''    var pc = !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) && !(navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
    if (pc){
      // PC: 공유 창(인스타 없음) 대신 인스타그램을 새 탭으로 열고, 사진은 저장·글은 복사
      var igw = null; try { igw = window.open('https://www.instagram.com/', '_blank'); } catch(e){}
      if (file) saveBlob(blob, file.name);
      showGuide('PC에서 인스타그램에 올리기', [file ? '사진을 <b>다운로드 폴더</b>에 저장했어요' : '올릴 사진을 준비하세요', text ? '글(캡션)은 <b>복사</b>해 뒀어요' : '문구는 직접 적어 주세요', (igw ? '새로 열린 인스타그램 탭에서' : '아래 버튼으로 인스타그램을 열고') + ' 왼쪽 <b>＋ 만들기 → 게시물</b> → 저장한 사진을 끌어다 놓기', text ? '문구 칸에 <b>Ctrl+V</b>로 붙여넣기 → 공유' : '공유를 누르면 끝!'], igw ? '' : 'https://www.instagram.com/', '인스타그램 열기');
      return;
    }
'''
for d in 'skin nail hair pilates academy food cafe bakery'.split():
    p=base+d+'/index.html'; s=open(p).read()
    assert s.count(CSS_ANCH)==1 and s.count(JS_ANCH)==1, d
    if 'var pc = !/Android' not in s:
        s=s.replace(CSS_ANCH,CSS_ADD).replace(JS_ANCH,JS_ADD+JS_ANCH)
    open(p,'w').write(s); print('ok',d)
