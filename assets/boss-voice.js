/* 사장님, 말만 하세요 — 알아줌의 '귀'
   사장님 말을 서버(boss-intent)가 '할 일'로 바꾸고, 화면이 직접 처리해요.
   - 방문 기록 / 결제(매출 장부) / 한 분께 카톡 / 여러 분께 카톡 / 홍보글 / 리뷰 답글 / 카드
   - 고객 명단은 서버로 보내지 않아요(이름은 이 화면의 장부에서 찾음).
   - 서버가 안 되면 원래 '말로 시키기' 방식(local)으로 그대로 처리해요.
   - 고객에게 보내는 마지막 '전송'은 사장님이 눌러요(카카오가 다른 앱의 대신 전송을 막아 둠). */
(function () {
  if (window.alajoomBoss) return;
  var URL_ = 'https://zuxbloxstkcixqpzqalk.supabase.co', KEY = 'sb_publishable_cZZ6cVbSIbkG93_rQ8jldg_f_Z9uOYH';
  var MATE = (location.pathname.match(/^\/(skin|nail|hair|pilates|academy|food|cafe|bakery)\b/) || [])[1] || 'skin';
  var EX = {
    skin: ['김지은님 내일 2시 예약 확인 카톡 보내줘', '한 달 넘게 안 온 손님들한테 안부 보내줘', '박민수님 수분관리 7만원 카드 결제', '다음 주 월요일 휴무 인스타 올려줘'],
    nail: ['김지은님 리터치 시기 카톡 보내줘', '오래 안 온 손님들한테 안부 보내줘', '박민수님 젤네일 5만원 카드 결제', '이번 주 신상 디자인 인스타 올려줘'],
    hair: ['김지은님 뿌리 염색 시기 카톡 보내줘', '오래 안 온 손님들한테 안부 보내줘', '박민수님 커트 2만원 현금 결제', '다음 주 월요일 휴무 인스타 올려줘']
  };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function toast(t) { var el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 2400); }

  var css = document.createElement('style');
  css.textContent =
    '.boss{margin:14px 0 6px;padding:18px 16px 16px;border-radius:20px;background:#FFD43B;color:#14161F;box-shadow:0 3px 0 #D9A900}' +
    '.boss-top{display:flex;align-items:center;gap:14px}' +
    '.boss-mic{flex:none;width:64px;height:64px;border-radius:50%;border:0;background:#14161F;color:#FFD43B;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 0 0 rgba(20,22,31,.35);animation:bossP 2s infinite}' +
    '.boss-mic svg{width:30px;height:30px}' +
    '.boss h2{margin:0;font-size:21px;line-height:1.25;letter-spacing:-.3px}' +
    '.boss p{margin:4px 0 0;font-size:14.5px;line-height:1.45;color:#3A3F4C;font-weight:600}' +
    '.boss-ex{margin:14px 0 0;padding:0;list-style:none;display:grid;gap:7px}' +
    '.boss-ex li{background:rgba(255,255,255,.72);border-radius:12px;padding:9px 12px;font-size:14px;font-weight:600;line-height:1.4}' +
    '.boss-ex li:before{content:"\\201C";color:#8A6A00;font-weight:900;margin-right:2px}.boss-ex li:after{content:"\\201D";color:#8A6A00;font-weight:900;margin-left:2px}' +
    '.boss-cap{margin:10px 0 0;font-size:12.5px;color:#5B4A00;font-weight:700}' +
    '@keyframes bossP{0%{box-shadow:0 0 0 0 rgba(20,22,31,.35)}70%{box-shadow:0 0 0 14px rgba(20,22,31,0)}100%{box-shadow:0 0 0 0 rgba(20,22,31,0)}}' +
    '#bossSheet{position:fixed;inset:0;z-index:100007}#bossSheet .bg{position:absolute;inset:0;background:rgba(20,22,31,.5)}' +
    '#bossSheet .bd{position:absolute;left:0;right:0;bottom:0;max-width:480px;max-height:86vh;overflow:auto;margin:0 auto;background:#fff;border-radius:22px 22px 0 0;padding:20px 18px 18px;color:#14161F}' +
    '#bossSheet h3{margin:0 0 4px;font-size:18px}#bossSheet .bsub{margin:0 0 12px;font-size:13.5px;color:#5B6070}' +
    '#bossSheet textarea{width:100%;min-height:96px;border:1.5px solid #E6DCC2;border-radius:12px;padding:10px 12px;font:inherit;font-size:15px;background:#FFFDF6}' +
    '#bossSheet .ppl{list-style:none;margin:12px 0 0;padding:0}#bossSheet .ppl li{display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid #EEE}' +
    '#bossSheet .ppl b{flex:1;font-size:15px}#bossSheet .ppl button,#bossSheet .act button{border:1.5px solid #14161F;background:#fff;border-radius:999px;padding:7px 12px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;color:#14161F}' +
    '#bossSheet .ppl button.k{background:#FEE500;border-color:#FEE500}#bossSheet .ppl button.done{background:#E8F5EE;border-color:#E8F5EE;color:#15803D}' +
    '#bossSheet .act{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}#bossSheet .act .main{background:#14161F;color:#fff}' +
    '#bossSheet .ok{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:800}#bossSheet .ok i{flex:none;width:34px;height:34px;border-radius:50%;background:#15803D;color:#fff;display:flex;align-items:center;justify-content:center;font-style:normal}' +
    '.sg{margin:14px 0 6px;background:#fff;border:1px solid var(--line,#E6E8ED);border-radius:20px;padding:16px 16px 6px}' +
    '.sg h2{margin:0 0 2px;font-size:17px;display:flex;align-items:center;gap:8px}.sg h2 small{font-size:12.5px;color:var(--muted,#5B6070);font-weight:600}' +
    '.sg-i{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid var(--line,#EEF0F3)}.sg-i:first-of-type{border-top:0}' +
    '.sg-av{flex:none;width:44px;height:44px;border-radius:50%;background:#FFF8E7;display:flex;align-items:center;justify-content:center}' +
    '.sg-t{flex:1;min-width:0}.sg-t b{display:block;font-size:15px;line-height:1.4}.sg-t span{display:block;font-size:13px;color:var(--muted,#5B6070);margin-top:2px;line-height:1.4}' +
    '.sg-t button{margin-top:8px;border:0;border-radius:999px;background:#14161F;color:#fff;font:inherit;font-size:13.5px;font-weight:800;padding:8px 14px;cursor:pointer}' +
    '.sg-t button.y{background:#FFD43B;color:#14161F}' +
    '.sg-none{padding:6px 0 12px;font-size:14px;color:var(--muted,#5B6070)}' +
    '.bchat{display:grid;gap:10px;margin:0 0 12px}.bme{justify-self:end;max-width:86%;background:#FFD43B;border-radius:18px 18px 4px 18px;padding:10px 14px;font-size:15px;font-weight:700;line-height:1.45}' +
    '.bai{display:flex;gap:8px;align-items:flex-end;max-width:94%}.bai .av{flex:none;width:36px;height:36px;border-radius:50%;background:#FFF8E7;display:flex;align-items:center;justify-content:center}' +
    '.bai .tx{background:#F4F5F7;border-radius:18px 18px 18px 4px;padding:10px 14px;font-size:15px;line-height:1.5}.bai .tx small{display:block;font-size:12px;color:#8A6A00;font-weight:800;margin-bottom:2px}' +
    '.boss-wait{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:100008;background:#14161F;color:#fff;border-radius:999px;padding:10px 18px;font-size:14px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.2)}';
  document.head.appendChild(css);

  var MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  /* '오늘' 화면 맨 위 큰 카드 */
  window.alajoomBossCard = function () {
    var ex = EX[MATE] || EX.skin;
    return '<section class="boss" aria-label="사장님, 말만 하세요"><div class="boss-top"><button type="button" class="boss-mic" data-hvoice="1" aria-label="말로 시키기">' + MIC + '</button>' +
      '<div><h2>사장님, 말만 하세요</h2><p>고객 카톡·장부 기록·홍보글까지<br>말 한마디면 알아서 해줌</p></div></div>' +
      '<ul class="boss-ex" aria-label="이렇게 말해 보세요">' + ex.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<p class="boss-cap">마이크를 누르고 이렇게 말해 보세요</p></section>';
  };

  var CH = { plan: '반짝이', write: '술술이', photo: '찰칵이', check: '꼼꼼이', book: '차곡이' };
  function av(k, n) { return window.alajoomTeam ? window.alajoomTeam.svg(k, n || 34) : '<i data-av="' + k + '" data-n="' + (n || 34) + '"></i>'; }
  function fillAv() { if (!window.alajoomTeam) return; document.querySelectorAll('i[data-av]').forEach(function (e) { e.outerHTML = window.alajoomTeam.svg(e.dataset.av, +e.dataset.n); }); }
  window.addEventListener('load', fillAv); setTimeout(fillAv, 1500);
  function chat(say, k, msg) {
    return '<div class="bchat">' + (say ? '<div class="bme">🎤 ' + esc(say) + '</div>' : '') +
      '<div class="bai"><span class="av">' + av(k, 30) + '</span><div class="tx"><small>' + CH[k] + '</small>' + msg + '</div></div></div>';
  }
  var lastSay = '';
  function sheet(html) {
    close();
    var w = document.createElement('div'); w.id = 'bossSheet'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.innerHTML = '<div class="bg" data-bx></div><div class="bd">' + html + '</div>';
    document.body.appendChild(w);
    w.addEventListener('click', function (e) { if (e.target.closest('[data-bx]')) close(); });
    return w;
  }
  function close() { var o = document.getElementById('bossSheet'); if (o) o.remove(); }
  function done(msg, undo, k) {
    var w = sheet(chat(lastSay, k || 'book', esc(msg) + ' ✓') + '<div class="act">' + (undo ? '<button type="button" id="bUndo">되돌리기</button>' : '') + '<button type="button" class="main" data-bx>확인</button></div>');
    if (undo) w.querySelector('#bUndo').addEventListener('click', function () { undo(); close(); toast('되돌렸어요'); });
  }
  var waitEl = null;
  function wait(on) { if (on) { if (!waitEl) { waitEl = document.createElement('div'); waitEl.className = 'boss-wait'; waitEl.textContent = '알아줌이 알아듣는 중…'; document.body.appendChild(waitEl); } } else if (waitEl) { waitEl.remove(); waitEl = null; } }

  async function intent(say) {
    var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    try {
      var opts = window.alajoomToolOpts ? window.alajoomToolOpts() : {};
      var r = await fetch(URL_ + '/functions/v1/boss-intent', { method: 'POST', signal: ctl ? ctl.signal : undefined, headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY }, body: JSON.stringify({ say: say, mate: MATE, opts: opts }) });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; } finally { clearTimeout(tm); }
  }
  function pickTopic(tool, t) { var o = (window.alajoomToolOpts ? window.alajoomToolOpts()[tool] : null) || []; return o.indexOf(t) >= 0 ? t : (o[0] || t); }
  function chOf(c) { return /블로그/.test(c) ? '블로그' : /당근/.test(c) ? '당근' : /플레이스|네이버/.test(c) ? '네이버 플레이스' : '인스타'; }

  /* 카톡으로 보내기: 공유 창(카카오톡 고르기) → 안 되면 복사 + 카카오톡 열기 */
  function shareText(text) {
    try { navigator.clipboard.writeText(text).catch(function () {}); } catch (e) {}
    if (navigator.share) { navigator.share({ text: text }).catch(function () {}); toast('공유 창에서 카카오톡 → 받을 분을 고르세요'); return; }
    toast('글을 복사했어요. 카카오톡에서 붙여넣기 후 전송해 주세요');
    setTimeout(function () { location.href = 'kakaotalk://launch'; }, 600);
  }

  /* 여러 고객께 한 분씩 */
  function group(it) {
    var kind = it.group || 'away';
    var list = window.alajoomMemberList ? window.alajoomMemberList(kind) : null;
    if (!list) return false;
    if (kind === 'away') { var bk = window.alajoomMemberList('tomorrow').map(function (p) { return p.name; }); list = list.filter(function (p) { return bk.indexOf(p.name) < 0; }); }
    var label = kind === 'renew' ? '재등록 안내할 고객' : kind === 'all' ? '관리 중인 고객' : kind === 'tomorrow' ? '내일 예약 고객' : '오래 안 오신 고객';
    if (!list.length) { done(label + '이 지금은 없어요', null, 'check'); return true; }
    var topic = it.topic || (kind === 'renew' ? '재등록 안내' : kind === 'all' ? '이벤트·소식 알림' : kind === 'tomorrow' ? '예약 확인' : '재방문 안내');
    var tpl = (window.alajoomSmsTpl && window.alajoomSmsTpl(topic)) || '[고객님], 안녕하세요. 편할 때 다시 뵈어요.';
    if (it.detail) {
      if (tpl.indexOf('[소식 내용]') >= 0) tpl = tpl.replace('[소식 내용]', it.detail);
      else if (tpl.indexOf('[날짜]') >= 0 && /\d|월|일|주/.test(it.detail)) tpl = tpl.replace('[날짜]', it.detail);
    }
    var w = sheet(chat(lastSay, kind === 'renew' ? 'book' : kind === 'tomorrow' ? 'check' : 'write', esc(label) + ' ' + list.length + '분이에요. 문구를 확인하고 한 분씩 <b>카톡</b>을 누르면 이름이 들어간 글로 보내져요') +
      '<textarea id="bTxt" aria-label="보낼 문구">' + esc(tpl) + '</textarea>' +
      '<p class="bsub" id="bWarn" style="margin:6px 0 0;color:#C2410C;display:none">[ ] 빈칸을 채운 뒤 보내 주세요</p>' +
      '<ul class="ppl">' + list.map(function (p, i) { return '<li><b>' + esc(p.name) + '님' + (p.time ? ' <small style="font-weight:600;color:#5B6070">' + esc(p.time) + (p.what ? ' · ' + esc(p.what) : '') + '</small>' : '') + '</b><button type="button" class="k" data-k="' + i + '">카톡</button>' + (p.phone ? '<button type="button" data-s="' + i + '">문자</button>' : '') + '</li>'; }).join('') + '</ul>' +
      '<div class="act"><button type="button" class="main" data-bx>다 보냈어요</button></div>');
    var txt = w.querySelector('#bTxt'), warn = w.querySelector('#bWarn');
    var chk = function () { if (kind === 'tomorrow') { warn.style.display = /\[(소식 내용)\]/.test(txt.value) ? '' : 'none'; return; } warn.style.display = /\[(날짜|시간|소식 내용|[^\]고]{1,8})\]/.test(txt.value.replace(/\[고객님\]/g, '')) ? '' : 'none'; };
    txt.addEventListener('input', chk); chk();
    w.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k],[data-s]'); if (!b) return;
      var p = list[+(b.dataset.k || b.dataset.s)], t = txt.value.replace(/\[고객님\]/g, p.name + '님');
      if (p.date) t = t.replace('[날짜]', (+p.date.slice(5, 7)) + '월 ' + (+p.date.slice(8, 10)) + '일').replace('[시간]', p.time || '[시간]');
      if (b.dataset.s) { var ios = /iPhone|iPad|iPod/.test(navigator.userAgent); location.href = 'sms:' + p.phone.replace(/[^0-9+]/g, '') + (ios ? '&' : '?') + 'body=' + encodeURIComponent(t); }
      else shareText(t);
      b.classList.add('done'); b.textContent = '보냄 ✓';
    });
    return true;
  }

  window.alajoomBoss = async function (say, local) {
    lastSay = say;
    wait(true);
    var it = await intent(say);
    wait(false);
    if (!it || it.error || !it.action || it.action === 'unknown') return local(say);
    if (it.say_back) toast(it.say_back);
    switch (it.action) {
      case 'attend':
        if (window.alajoomAttend && it.name) { done(window.alajoomAttend(it.name), null, 'book'); return; }
        return local(say);
      case 'pay':
        if (window.alajoomPay) { var r = window.alajoomPay(it.name, it.item, it.amount, it.method); if (r.ok) done(r.msg, function () { window.alajoomUndoBook && window.alajoomUndoBook(r.id); }, 'book'); else done(r.msg, null, 'book'); return; }
        return local(say);
      case 'sms_group':
        if (group(it)) return;
        return local(say);
      case 'sms': case 'post': case 'review': case 'card':
        if (!window.alajoomVoiceExec) return local(say);
        var rr = { tool: it.action, topic: pickTopic(it.action, it.topic), detail: it.detail || say };
        if (it.action === 'post') rr.ch = chOf(it.ch);
        if (it.action === 'sms' && it.name) rr.to = it.name;
        return window.alajoomVoiceExec(rr);
    }
    return local(say);
  };

  /* 알아줌이 먼저 챙기는 '오늘 맡길 일' (피클의 '둘러보기'처럼) */
  window.alajoomGroupSend = function (kind) { lastSay = ''; return group({ group: kind }); };
  window.alajoomSuggest = function (o) {
    o = o || {};
    var L = function (k) { return window.alajoomMemberList ? window.alajoomMemberList(k) : []; };
    var tom = L('tomorrow'), renew = L('renew'), away = L('away'), items = [];
    away = away.filter(function (p) { return !tom.some(function (t) { return t.name === p.name; }); });
    var names = function (a) { return a.slice(0, 2).map(function (p) { return p.name + '님'; }).join(', ') + (a.length > 2 ? ' 외 ' + (a.length - 2) + '분' : ''); };
    if (tom.length) items.push({ k: 'check', t: '내일 예약 ' + tom.length + '분께 확인 카톡 보낼까요?', d: names(tom) + ' · 시간까지 넣어 드려요', b: '확인 카톡 보내기', a: 'tomorrow' });
    if (renew.length) items.push({ k: 'book', t: '관리권이 곧 끝나는 고객이 ' + renew.length + '분 있어요', d: names(renew) + ' · 재등록 안내 보낼까요?', b: '재등록 안내 보내기', a: 'renew' });
    if (away.length) items.push({ k: 'write', t: '한 달 넘게 안 오신 고객이 ' + away.length + '분이에요', d: names(away) + ' · 안부 카톡 한 통이면 다시 와요', b: '안부 보내기', a: 'away' });
    if (!o.weekPost) items.push({ k: 'plan', t: o.emptyToday ? '오늘 예약이 비었어요. 당일 홍보글 써 드릴까요?' : '이번 주 홍보글이 아직 없어요', d: '인스타·블로그·당근 글을 한 번에 써 드려요', b: '홍보글 써 줘', a: 'post', y: 1 });
    var h = '<section class="sg" aria-label="알아줌이 챙긴 일"><h2>' + av('plan', 26) + '알아줌이 챙긴 일 <small>' + (items.length ? items.length + '개' : '') + '</small></h2>';
    if (!items.length) h += '<p class="sg-none">오늘은 챙길 일이 없어요. 고객 장부에 고객과 예약을 적어 두면 알아서 챙겨 드려요.</p>';
    items.forEach(function (x) { h += '<div class="sg-i"><span class="sg-av">' + av(x.k, 38) + '</span><div class="sg-t"><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span><button type="button" class="' + (x.y ? 'y' : '') + '" data-sg="' + x.a + '">' + esc(x.b) + '</button></div></div>'; });
    setTimeout(fillAv, 0);
    return h + '</section>';
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sg]'); if (!b) return;
    var a = b.dataset.sg;
    if (a === 'post') { if (window.alajoomTab) window.alajoomTab('make'); var t = document.querySelector('.tool[data-tool="set"]'); if (t) t.click(); return; }
    window.alajoomGroupSend(a);
  });

  /* '오늘' 화면이 먼저 그려졌으면 카드가 보이게 다시 그림 */
  var hv = document.getElementById('v-home');
  if (hv && !hv.classList.contains('hidden') && !hv.querySelector('.boss')) { try { window.dispatchEvent(new CustomEvent('alajoom:tab', { detail: 'home' })); } catch (e) {} }
})();
