/* 알아줌 팀 캐릭터 + '알아줌 한 번에' 진행 화면
   실제 서버 순서(기획 → 글 → 검토)를 그대로 보여줘요. 사진을 넣었을 때만 찰칵이가 함께 일해요. */
(function () {
  var BASE = '<ellipse cx="0" cy="44" rx="30" ry="5" fill="#E9E1CF"/><path d="M-22 22 L-30 40 L-8 28 Z" fill="#F5C518"/><ellipse cx="0" cy="0" rx="36" ry="32" fill="#FFD43B"/>';
  var CH = {
    plan: { name: '반짝이', role: '기획', g: BASE + '<circle cx="-12" cy="-2" r="4" fill="#14161F"/><circle cx="12" cy="-2" r="4" fill="#14161F"/><circle cx="-11" cy="-3.5" r="1.3" fill="#fff"/><circle cx="13" cy="-3.5" r="1.3" fill="#fff"/><ellipse cx="-21" cy="8" rx="5" ry="3" fill="#FF9FB2"/><ellipse cx="21" cy="8" rx="5" ry="3" fill="#FF9FB2"/><path d="M-6 10 Q0 15 6 10" fill="none" stroke="#14161F" stroke-width="2.2" stroke-linecap="round"/><circle cx="-12" cy="-2" r="8" fill="none" stroke="#3B5B92" stroke-width="2"/><circle cx="12" cy="-2" r="8" fill="none" stroke="#3B5B92" stroke-width="2"/><path d="M-4 -2 L4 -2" stroke="#3B5B92" stroke-width="2"/><circle cx="26" cy="-38" r="9" fill="#FFF3B0" stroke="#F5A623" stroke-width="2"/><rect x="22" y="-29" width="8" height="5" rx="1.5" fill="#F5A623"/><path d="M26 -54 L26 -50 M12 -46 L15 -43 M40 -46 L37 -43" stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>' },
    write: { name: '술술이', role: '글', g: BASE + '<path d="M-16 -2 Q-12 -6 -8 -2 M8 -2 Q12 -6 16 -2" fill="none" stroke="#14161F" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="-21" cy="8" rx="5" ry="3" fill="#FF9FB2"/><ellipse cx="21" cy="8" rx="5" ry="3" fill="#FF9FB2"/><path d="M-7 9 Q0 17 7 9 Z" fill="#14161F"/><g transform="translate(34,6) rotate(35)"><rect x="-4" y="-24" width="8" height="34" rx="2" fill="#E8604C"/><rect x="-4" y="-28" width="8" height="6" rx="2" fill="#F7B5A8"/><path d="M-4 10 L0 19 L4 10 Z" fill="#F3D9A4"/><path d="M-1.4 16 L0 19 L1.4 16 Z" fill="#14161F"/></g><path d="M-34 -30 q6 -8 12 0 q6 8 12 0" fill="none" stroke="#3B5B92" stroke-width="2" stroke-linecap="round"/>' },
    photo: { name: '찰칵이', role: '사진', g: BASE + '<circle cx="-12" cy="-8" r="4" fill="#14161F"/><path d="M8 -8 L16 -8" stroke="#14161F" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="-21" cy="0" rx="5" ry="3" fill="#FF9FB2"/><rect x="-20" y="2" width="40" height="26" rx="6" fill="#2A2D36"/><rect x="-8" y="-2" width="14" height="6" rx="2" fill="#2A2D36"/><circle cx="0" cy="15" r="9" fill="#5B6B8C"/><circle cx="0" cy="15" r="5" fill="#9DB4E0"/><circle cx="-2" cy="13" r="1.6" fill="#fff"/><circle cx="13" cy="7" r="2" fill="#FFD43B"/><path d="M30 -30 L34 -24 M40 -20 L33 -20 M28 -36 L28 -42" stroke="#F5A623" stroke-width="2" stroke-linecap="round"/>' },
    check: { name: '꼼꼼이', role: '표현 검토', g: BASE + '<circle cx="-12" cy="-2" r="4" fill="#14161F"/><circle cx="12" cy="-2" r="4" fill="#14161F"/><path d="M-18 -11 L-7 -9 M18 -11 L7 -9" stroke="#14161F" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="-21" cy="8" rx="5" ry="3" fill="#FF9FB2"/><ellipse cx="21" cy="8" rx="5" ry="3" fill="#FF9FB2"/><path d="M-5 12 L5 12" stroke="#14161F" stroke-width="2.2" stroke-linecap="round"/><circle cx="30" cy="16" r="12" fill="#E6F0FF" stroke="#3B5B92" stroke-width="3"/><path d="M38 25 L48 36" stroke="#3B5B92" stroke-width="5" stroke-linecap="round"/><path d="M25 16 L29 20 L36 11" fill="none" stroke="#15803D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' },
    book: { name: '차곡이', role: '장부·문자', g: BASE + '<circle cx="-12" cy="-4" r="4" fill="#14161F"/><circle cx="12" cy="-4" r="4" fill="#14161F"/><circle cx="-11" cy="-5.5" r="1.3" fill="#fff"/><circle cx="13" cy="-5.5" r="1.3" fill="#fff"/><ellipse cx="-21" cy="6" rx="5" ry="3" fill="#FF9FB2"/><ellipse cx="21" cy="6" rx="5" ry="3" fill="#FF9FB2"/><path d="M-6 7 Q0 12 6 7" fill="none" stroke="#14161F" stroke-width="2.2" stroke-linecap="round"/><rect x="-24" y="12" width="28" height="22" rx="3" fill="#FFFFFF" stroke="#2A7A57" stroke-width="2"/><path d="M-19 19 L-1 19 M-19 24 L-5 24 M-19 29 L-8 29" stroke="#2A7A57" stroke-width="1.8" stroke-linecap="round"/><rect x="10" y="8" width="18" height="28" rx="4" fill="#2A2D36"/><rect x="13" y="12" width="12" height="17" rx="1.5" fill="#FEE500"/><path d="M15 18 L23 18 M15 22 L20 22" stroke="#3C1E1E" stroke-width="1.5" stroke-linecap="round"/>' }
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
