base='/home/claude/alajoom-site/'
CSS='''<style id="tool-grid">
/* 만들기 메뉴 전체가 한눈에: 옆으로 넘기지 않고 줄 바꿈 */
#v-promo .tools,#v-make .tools{display:grid !important;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 10px;overflow:visible;padding:4px 2px 6px}
#v-promo .tool,#v-make .tool{width:auto !important;min-width:0}
#v-promo .pv,#v-make .pv{width:100% !important;height:118px !important}
#v-promo .tool b,#v-make .tool b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (min-width:900px){
  #v-promo .tools,#v-make .tools{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:18px 14px}
  #v-promo .pv,#v-make .pv{height:160px !important}
  #v-promo .tool b,#v-make .tool b{font-size:14px}
}
</style>
'''
for d in 'skin nail hair pilates academy food cafe bakery'.split():
    p=base+d+'/index.html'; s=open(p).read()
    if 'id="tool-grid"' not in s:
        assert s.count('</head>')==1; s=s.replace('</head>',CSS+'</head>')
    open(p,'w').write(s); print('ok',d)
