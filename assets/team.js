/* 알아줌 팀 캐릭터(병아리) + '알아줌 한 번에' 진행 화면
   실제 서버 순서(기획 → 글 → 검토)를 그대로 보여줘요. 사진을 넣었을 때만 찰칵이가 함께 일해요. */
(function () {
  /* 병아리(알) 팀: 동그란 몸 · 껍데기 한 줄 · 점 눈 · 소품 하나 */
  var CH = {
    plan: { name: '반짝이', role: '기획', g: '<ellipse cx="0" cy="46" rx="26" ry="4" fill="#E9E1CF"/><ellipse cx="0" cy="4" rx="34" ry="38" fill="#FFD43B"/><circle cx="-11" cy="-12" r="3.6" fill="#14161F"/><circle cx="11" cy="-12" r="3.6" fill="#14161F"/><path d="M-5 -5 L5 -5 L0 1Z" fill="#FF9F43"/><circle cx="-21" cy="-3" r="4" fill="#FFB3B3" opacity=".7"/><circle cx="21" cy="-4" r="4" fill="#FFB3B3" opacity=".7"/><path d="M-34 14 L-24 6 L-14 15 L-4 6 L6 15 L16 6 L26 15 L34 8 C34 34 18 44 0 44 C-18 44 -34 34 -34 14Z" fill="#FFFDF6" stroke="#14161F" stroke-width="2.4" stroke-linejoin="round"/><circle cx="0" cy="-48" r="7" fill="#FFF3B0" stroke="#14161F" stroke-width="2.2"/><path d="M-3 -40 h6" stroke="#14161F" stroke-width="2.2" stroke-linecap="round"/>' },
    write: { name: '술술이', role: '글', g: '<ellipse cx="0" cy="46" rx="26" ry="4" fill="#E9E1CF"/><ellipse cx="0" cy="4" rx="34" ry="38" fill="#FFD43B"/><path d="M-15 -11 q4 -5 8 0 M7 -11 q4 -5 8 0" stroke="#14161F" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M-5 -5 L5 -5 L0 1Z" fill="#FF9F43"/><circle cx="-21" cy="-3" r="4" fill="#FFB3B3" opacity=".7"/><circle cx="21" cy="-4" r="4" fill="#FFB3B3" opacity=".7"/><path d="M-34 14 L-24 6 L-14 15 L-4 6 L6 15 L16 6 L26 15 L34 8 C34 34 18 44 0 44 C-18 44 -34 34 -34 14Z" fill="#FFFDF6" stroke="#14161F" stroke-width="2.4" stroke-linejoin="round"/><path d="M26 -6 L40 -22 L44 -18 L30 -2 Z" fill="#3B5B92" stroke="#14161F" stroke-width="2" stroke-linejoin="round"/>' },
    photo: { name: '찰칵이', role: '사진', g: '<ellipse cx="0" cy="46" rx="26" ry="4" fill="#E9E1CF"/><ellipse cx="0" cy="4" rx="34" ry="38" fill="#FFD43B"/><circle cx="-11" cy="-12" r="3.6" fill="#14161F"/><circle cx="11" cy="-12" r="3.6" fill="#14161F"/><path d="M-5 -5 L5 -5 L0 1Z" fill="#FF9F43"/><circle cx="-21" cy="-3" r="4" fill="#FFB3B3" opacity=".7"/><circle cx="21" cy="-4" r="4" fill="#FFB3B3" opacity=".7"/><path d="M-34 14 L-24 6 L-14 15 L-4 6 L6 15 L16 6 L26 15 L34 8 C34 34 18 44 0 44 C-18 44 -34 34 -34 14Z" fill="#FFFDF6" stroke="#14161F" stroke-width="2.4" stroke-linejoin="round"/><rect x="-16" y="10" width="32" height="20" rx="4" fill="#14161F"/><circle cx="0" cy="20" r="6" fill="#9DB4E0" stroke="#fff" stroke-width="2"/>' },
    check: { name: '꼼꼼이', role: '표현 검토', g: '<ellipse cx="0" cy="46" rx="26" ry="4" fill="#E9E1CF"/><ellipse cx="0" cy="4" rx="34" ry="38" fill="#FFD43B"/><path d="M-15 -16 l8 2 M15 -16 l-8 2" stroke="#14161F" stroke-width="2.6" stroke-linecap="round"/><circle cx="-11" cy="-10" r="3.2" fill="#14161F"/><circle cx="11" cy="-10" r="3.2" fill="#14161F"/><path d="M-5 -5 L5 -5 L0 1Z" fill="#FF9F43"/><circle cx="-21" cy="-3" r="4" fill="#FFB3B3" opacity=".7"/><circle cx="21" cy="-4" r="4" fill="#FFB3B3" opacity=".7"/><path d="M-34 14 L-24 6 L-14 15 L-4 6 L6 15 L16 6 L26 15 L34 8 C34 34 18 44 0 44 C-18 44 -34 34 -34 14Z" fill="#FFFDF6" stroke="#14161F" stroke-width="2.4" stroke-linejoin="round"/><circle cx="30" cy="-20" r="9" fill="#E8F3FF" stroke="#14161F" stroke-width="2.4"/><path d="M37 -13 L44 -6" stroke="#14161F" stroke-width="3" stroke-linecap="round"/>' },
    book: { name: '차곡이', role: '장부·문자', g: '<ellipse cx="0" cy="46" rx="26" ry="4" fill="#E9E1CF"/><ellipse cx="0" cy="4" rx="34" ry="38" fill="#FFD43B"/><circle cx="-11" cy="-12" r="3.6" fill="#14161F"/><circle cx="11" cy="-12" r="3.6" fill="#14161F"/><path d="M-5 -5 L5 -5 L0 1Z" fill="#FF9F43"/><circle cx="-21" cy="-3" r="4" fill="#FFB3B3" opacity=".7"/><circle cx="21" cy="-4" r="4" fill="#FFB3B3" opacity=".7"/><path d="M-34 14 L-24 6 L-14 15 L-4 6 L6 15 L16 6 L26 15 L34 8 C34 34 18 44 0 44 C-18 44 -34 34 -34 14Z" fill="#FFFDF6" stroke="#14161F" stroke-width="2.4" stroke-linejoin="round"/><rect x="-15" y="12" width="30" height="20" rx="3" fill="#fff" stroke="#14161F" stroke-width="2.2"/><path d="M-9 18 h18 M-9 24 h12" stroke="#3B5B92" stroke-width="2" stroke-linecap="round"/>' }
  };
  function svg(k, size) { var c = CH[k]; return '<svg width="' + (size || 44) + '" height="' + (size || 44) + '" viewBox="-52 -58 104 106" aria-hidden="true">' + c.g + '</svg>'; }
  var css = false;
  function addCss() {
    if (css) return; css = true;
    var st = document.createElement('style');
    st.textContent = '.atm{background:#fff;border:1px solid var(--line,#E5E0D4);border-radius:18px;padding:12px 14px}' +
      '.atm-h{display:flex;align-items:center;justify-content:space-between;margin:0 0 6px;font-size:13.5px;font-weight:800}.atm-h small{font-weight:600;color:var(--muted,#6B7080)}' +
      '.atm-r{display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px dashed #EEE7D8}.atm-r:first-of-type{border-top:0}' +
      '.atm-av{flex:none;width:46px;height:46px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:#FFF8E1;transition:transform .3s}' +
      '.atm-r[data-s="wait"] .atm-av{filter:grayscale(.85);opacity:.55}' +
      '.atm-r[data-s="work"] .atm-av{animation:atmBob .7s ease-in-out infinite alternate;background:#FFEFB0}' +
      '@keyframes atmBob{from{transform:translateY(0) rotate(-3deg)}to{transform:translateY(-4px) rotate(3deg)}}' +
      '.atm-t{flex:1;min-width:0;font-size:14px;line-height:1.35}.atm-t b{font-weight:800}.atm-t small{display:block;color:var(--muted,#6B7080);font-size:12.5px}' +
      '.atm-s{flex:none;font-size:12px;font-weight:800;border-radius:999px;padding:3px 9px;border:1px solid #DDD6C6;color:#8A8F9C;white-space:nowrap}' +
      '.atm-r[data-s="work"] .atm-s{border-color:#F5C518;background:#FFF6CC;color:#7A5B00}.atm-r[data-s="done"] .atm-s{border-color:#15803D;background:#EAF6EE;color:#15803D}' +
      '.atm-strip{display:flex;align-items:center;gap:6px;margin:0 0 10px;font-size:13px;color:var(--muted,#6B7080)}.atm-strip span{display:inline-flex;margin-right:-10px}' +
      '@media (prefers-reduced-motion:reduce){.atm-r[data-s="work"] .atm-av{animation:none}}';
    document.head.appendChild(st);
  }
  /* el 안에 진행 화면을 그리고 {done, fail}을 돌려줘요 */
  function progress(el, o) {
    addCss(); o = o || {};
    var rows = [['plan', '가게 정보 보고 강조할 점 정하는 중'], ['write', (o.channels || 3) + '곳에 올릴 글 쓰는 중']];
    if (o.photo) rows.splice(1, 0, ['photo', '사진 보고 쓸거리 찾는 중']);
    rows.push(['check', '과장·효능 표현 살피는 중']);
    el.innerHTML = '<div class="atm" role="status" aria-live="polite"><p class="atm-h">알아줌 팀이 일하는 중<small>보통 20~40초</small></p>' + rows.map(function (r, i) {
      return '<div class="atm-r" data-k="' + r[0] + '" data-s="' + (i ? 'wait' : 'work') + '"><span class="atm-av">' + svg(r[0], 42) + '</span><span class="atm-t"><b>' + CH[r[0]].name + '</b> · ' + CH[r[0]].role + '<small>' + r[1] + '</small></span><span class="atm-s">' + (i ? '대기' : '하는 중') + '</span></div>';
    }).join('') + '</div>';
    var rs = el.querySelectorAll('.atm-r'), k = 0;
    function set(i, s, txt) { var r = rs[i]; if (!r) return; r.dataset.s = s; r.querySelector('.atm-s').textContent = s === 'done' ? '완료' : s === 'work' ? '하는 중' : '대기'; if (txt) r.querySelector('small').textContent = txt; }
    var tick = setInterval(function () { if (k < rs.length - 2) { set(k, 'done'); k++; set(k, 'work'); } }, 5000);
    return {
      done: function (reviewed, cb) {
        clearInterval(tick);
        var i = 0;
        (function step() {
          if (i >= rs.length) { setTimeout(cb, 450); return; }
          var key = rs[i].dataset.k, txt = null;
          if (key === 'check') txt = reviewed && reviewed.length ? reviewed.length + '곳 글의 표현을 고쳤어요' : '고칠 표현이 없었어요';
          if (key === 'write') txt = '글을 다 썼어요';
          if (key === 'plan') txt = '강조할 점을 정했어요';
          if (key === 'photo') txt = '사진을 보고 썼어요';
          set(i, 'work'); setTimeout(function () { set(i, 'done', txt); i++; step(); }, rs[i].dataset.s === 'done' ? 80 : 260);
        })();
      },
      fail: function () { clearInterval(tick); }
    };
  }
  function strip(keys) {
    addCss(); keys = keys || ['plan', 'write', 'check'];
    return '<div class="atm-strip">' + keys.map(function (k) { return '<span>' + svg(k, 30) + '</span>'; }).join('') + '<em style="margin-left:14px;font-style:normal"><b style="color:var(--ink,#14161F)">' + keys.map(function (k) { return CH[k].name; }).join('·') + '</b>가 만들었어요</em></div>';
  }
  window.alajoomTeam = { svg: svg, progress: progress, strip: strip, CH: CH };
})();
