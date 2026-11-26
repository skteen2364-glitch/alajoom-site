/* 알아줌 전화 비서 — ① 통화 녹음 정리(바로 사용) ② 바쁠 때 대신 받기(연습해 보기, 실제 전화 연결 준비 중) ③ 예약 확인 전화(개시 전)
   서버: call-note(녹음 → 예약 메모, 녹음 저장 안 함), call-answer(가게 AI 비서 응대) */
(function () {
  var URL_ = 'https://zuxbloxstkcixqpzqalk.supabase.co', KEY = 'sb_publishable_cZZ6cVbSIbkG93_rQ8jldg_f_Z9uOYH';
  var MATE = (location.pathname.match(/^\/(skin|nail|hair|pilates|academy|food|cafe|bakery)\b/) || [])[1] || 'skin';
  var BOSS = /food|cafe|bakery/.test(MATE) ? '사장님' : /academy|pilates/.test(MATE) ? '원장님' : '원장님';
  var BUSY = /food|cafe|bakery/.test(MATE) ? '조리 중' : /academy|pilates/.test(MATE) ? '수업 중' : '관리 중';
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function toast(t) { var el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 2600); }
  function studio() {
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (/^pm_.+_studio$/.test(k)) { var v = JSON.parse(localStorage.getItem(k) || '{}'); if (v && v.name) return v; } } } catch (e) {}
    return {};
  }
  function cfg(v) { try { if (v) localStorage.setItem('al_call_cfg', JSON.stringify(v)); return JSON.parse(localStorage.getItem('al_call_cfg') || '{}'); } catch (e) { return {}; } }
  function menu() { return window.alajoomMenuNames ? window.alajoomMenuNames() : []; }
  function ymdK(d) { return (+d.slice(5, 7)) + '월 ' + (+d.slice(8, 10)) + '일'; }

  var css = document.createElement('style');
  css.textContent =
    '.callc{margin:12px 0 6px;padding:16px;border-radius:20px;background:#fff;border:1px solid #E8E2D2}' +
    '.callc h3{margin:0 0 2px;font-size:17px;font-weight:900;display:flex;align-items:center;gap:8px}.callc>p{margin:0 0 10px;font-size:13px;color:#5B6070}' +
    '.callc .cr{display:flex;align-items:center;gap:10px;padding:11px 0;border-top:1px solid #F1ECDF}.callc .cr>div{flex:1;min-width:0}.callc .cr b{display:block;font-size:15px}.callc .cr small{display:block;font-size:12.5px;color:#6A6F7C;line-height:1.4;word-break:keep-all}' +
    '.callc .cr button{flex:none;border:0;border-radius:12px;padding:10px 13px;font:inherit;font-size:13.5px;font-weight:800;background:#14161F;color:#fff;cursor:pointer}.callc .cr button.y{background:#FFD43B;color:#14161F}' +
    '.callc .bdg{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:800;vertical-align:2px}.callc .bdg.p{background:#E6ECF5;color:#3B5B92}.callc .bdg.g{background:#EEE;color:#666}' +
    '.callc .cr.off{opacity:.7}' +
    '#callSheet{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center}#callSheet .bg{position:absolute;inset:0;background:rgba(20,22,31,.45)}' +
    '#callSheet .pn{position:relative;width:100%;max-width:520px;max-height:92vh;overflow:auto;background:#fff;border-radius:24px 24px 0 0;padding:20px 18px 24px;box-sizing:border-box}' +
    '#callSheet h3{margin:0 0 4px;font-size:18px}#callSheet .s{margin:0 0 12px;font-size:13.5px;color:#5B6070;line-height:1.5}' +
    '#callSheet label{display:block;margin:8px 0 0;font-size:13px;font-weight:800;color:#3A3F4C}#callSheet input,#callSheet textarea{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:10px 12px;border:1px solid #DDD6C4;border-radius:12px;font:inherit;font-size:15px;background:#FFFDF6}' +
    '#callSheet .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}#callSheet .sum{margin:6px 0 10px;padding:12px 14px;border-radius:14px;background:#FFF7D1;font-size:15px;font-weight:700;line-height:1.5}' +
    '#callSheet .act{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}#callSheet .act button{flex:1;min-width:130px;border:1px solid #14161F;border-radius:12px;padding:12px;font:inherit;font-size:15px;font-weight:800;background:#fff;color:#14161F;cursor:pointer}#callSheet .act .m{background:#14161F;color:#fff}#callSheet .act .k{background:#FEE500;border-color:#FEE500}' +
    '#callSheet .chat{display:grid;gap:8px;margin:8px 0;max-height:42vh;overflow:auto;padding:12px;border-radius:16px;background:#F6F3EA}#callSheet .g{justify-self:end;max-width:85%;background:#FFD43B;border-radius:16px 16px 4px 16px;padding:9px 12px;font-size:14.5px}#callSheet .a{max-width:88%;background:#fff;border-radius:16px 16px 16px 4px;padding:9px 12px;font-size:14.5px;line-height:1.5}#callSheet .a b{display:block;font-size:11.5px;color:#8A6A00}' +
    '#callSheet .say{display:flex;gap:8px}#callSheet .say input{flex:1;margin:0}#callSheet .say button{flex:none;border:0;border-radius:12px;padding:0 14px;font:inherit;font-weight:800;background:#14161F;color:#fff;cursor:pointer}#callSheet .say .mic{background:#FFD43B;color:#14161F}' +
    '#callSheet .note{font-size:12.5px;color:#6A6F7C;margin:8px 0 0;line-height:1.5}#callSheet .wait{padding:30px 0;text-align:center;font-weight:800;color:#5B6070}';
  document.head.appendChild(css);

  window.alajoomCallCard = function () {
    return '<section class="callc" aria-label="알아줌 전화 비서"><h3>📞 알아줌 전화 비서</h3><p>' + BUSY + '이라 바쁠 때, 전화 일도 알아줌이 도와요</p>' +
      '<div class="cr"><div><b>통화 녹음 정리</b><small>손님과 통화한 녹음을 올리면 예약·요청을 장부에 정리해요</small></div><button type="button" class="y" data-call="note">녹음 올리기</button></div>' +
      '<div class="cr"><div><b>' + BUSY + ' 걸려 온 전화 대신 받기<span class="bdg p">준비 중</span></b><small>못 받을 때만 알아줌이 받아 예약을 적어 둬요. 지금은 연습만 할 수 있어요</small></div><button type="button" data-call="practice">연습해 보기</button></div>' +
      '<div class="cr off"><div><b>내일 예약 손님 확인 전화<span class="bdg g">개시 전</span></b><small>' + BOSS + '이 확인하면 알아줌이 대신 걸어요</small></div></div>' +
      '<input type="file" accept="audio/*,.m4a,.mp3,.amr,.3gp,.wav,.aac,.ogg" id="callFile" hidden></section>';
  };

  function sheet(html) {
    close(); var w = document.createElement('div'); w.id = 'callSheet'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.innerHTML = '<div class="bg" data-cx></div><div class="pn">' + html + '</div>';
    document.body.appendChild(w); w.addEventListener('click', function (e) { if (e.target.closest('[data-cx]')) close(); }); return w;
  }
  function close() { var o = document.getElementById('callSheet'); if (o) o.remove(); try { speechSynthesis.cancel(); } catch (e) {} }

  async function post(fn, body, ms) {
    var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 60000);
    try {
      var r = await fetch(URL_ + '/functions/v1/' + fn, { method: 'POST', signal: ctl ? ctl.signal : undefined, headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY }, body: JSON.stringify(body) });
      var d = {}; try { d = await r.json(); } catch (e) {} d._ok = r.ok; return d;
    } catch (e) { return { _ok: false, message: '인터넷 연결을 확인해 주세요' }; } finally { clearTimeout(tm); }
  }
  function b64(file) { return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1] || ''); }; r.onerror = function () { res(''); }; r.readAsDataURL(file); }); }
  function mimeOf(f) { var t = f.type || ''; if (/^audio\//.test(t)) return t === 'audio/x-m4a' ? 'audio/mp4' : t; var x = (f.name.split('.').pop() || '').toLowerCase(); return { m4a: 'audio/mp4', mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac', ogg: 'audio/ogg', amr: 'audio/amr', '3gp': 'audio/3gpp' }[x] || 'audio/mp4'; }
  function shareText(text) {
    try { navigator.clipboard.writeText(text).catch(function () {}); } catch (e) {}
    if (navigator.share) { navigator.share({ text: text }).catch(function () {}); toast('공유 창에서 카카오톡 → 받을 분을 고르세요'); return; }
    toast('글을 복사했어요. 카카오톡에 붙여 넣어 주세요');
    setTimeout(function () { location.href = 'kakaotalk://launch'; }, 600);
  }

  /* 결과 메모 화면 (녹음 정리·연습 공통) */
  function noteView(n, from) {
    var w = sheet('<h3>' + (from === 'note' ? '통화를 정리했어요' : '알아줌이 받아 적은 메모') + '</h3>' +
      (n.summary ? '<p class="sum">' + esc(n.summary) + '</p>' : '') +
      (n.todo ? '<p class="s">할 일: ' + esc(n.todo) + '</p>' : '') +
      '<div class="row2"><label>손님 이름<input id="nName" value="' + esc(n.name) + '"></label><label>연락처<input id="nPhone" inputmode="tel" value="' + esc(n.phone) + '"></label></div>' +
      '<div class="row2"><label>날짜<input id="nDate" type="date" value="' + esc(n.date) + '"></label><label>시간<input id="nTime" type="time" value="' + esc(n.time) + '"></label></div>' +
      '<label>내용<input id="nWhat" value="' + esc(n.what) + '"></label>' +
      '<label>요청 메모<input id="nReq" value="' + esc(n.request) + '"></label>' +
      '<label>손님께 보낼 확인 카톡<textarea id="nReply" rows="3">' + esc(n.reply || '') + '</textarea></label>' +
      '<div class="act"><button type="button" class="m" id="nSave">예약 장부에 넣기</button><button type="button" class="k" id="nKakao">카톡으로 보내기</button></div>' +
      '<p class="note">이름·날짜·시간이 맞는지 확인하고 넣어 주세요. ' + (from === 'note' ? '녹음 파일은 저장하지 않아요.' : '') + '</p>');
    var $ = function (id) { return w.querySelector('#' + id); };
    if (!n.reply) {
      var st = studio();
      $('nReply').value = (n.name ? n.name + '님, ' : '') + (st.name || '저희 가게') + '예요. ' + (n.date ? ymdK(n.date) + ' ' : '') + (n.time || '') + (n.date || n.time ? ' 예약 확인드려요. ' : '문의 주셔서 감사해요. ') + '변경이 필요하시면 편하게 답장 주세요.';
    }
    $('nSave').addEventListener('click', function () {
      if (!window.alajoomAddRsv) { toast('이 화면에서는 예약 장부를 쓸 수 없어요'); return; }
      var r = window.alajoomAddRsv({ name: $('nName').value, phone: $('nPhone').value, date: $('nDate').value, time: $('nTime').value, what: $('nWhat').value, memo: $('nReq').value });
      toast(r.msg); if (r.ok) { this.disabled = true; this.textContent = '장부에 넣었어요 ✓'; }
    });
    $('nKakao').addEventListener('click', function () { shareText($('nReply').value); });
  }

  /* ① 통화 녹음 정리 */
  async function onFile(f) {
    if (!f) return;
    if (f.size > 9.5 * 1024 * 1024) { toast('녹음이 너무 커요. 10분 안쪽 통화로 올려 주세요'); return; }
    sheet('<div class="wait">🎧 통화를 듣고 정리하는 중…<br><small style="font-weight:600">30초쯤 걸려요</small></div>');
    var st = studio();
    var d = await post('call-note', { audio: await b64(f), mime: mimeOf(f), mate: MATE, shop: st.name || '', menu: menu() }, 90000);
    if (!document.getElementById('callSheet')) return;
    if (!d._ok) { sheet('<h3>정리하지 못했어요</h3><p class="s">' + esc(d.message || '잠시 뒤 다시 올려 주세요') + '</p><div class="act"><button type="button" class="m" data-cx>닫기</button></div>'); return; }
    noteView(d, 'note');
  }

  /* ② 대신 받기 연습 */
  function practice() {
    var c = cfg(), st = studio();
    var w = sheet('<h3>' + BUSY + ' 걸려 온 전화, 알아줌이 받으면</h3>' +
      '<p class="s">' + BOSS + '이 손님 역할로 말해 보세요. 알아줌이 가게 AI 비서로 대답하고 예약을 받아 적어요.<br><b>실제 가게 전화 연결은 준비 중이에요.</b></p>' +
      '<details' + (c.hours ? '' : ' open') + '><summary style="font-weight:800;font-size:14px;cursor:pointer">알아줌이 알아야 할 것 (한 번만 적어 두세요)</summary>' +
      '<label>영업시간<input id="cHours" placeholder="예: 화~일 10시~8시, 월요일 휴무" value="' + esc(c.hours || '') + '"></label>' +
      '<label>안내 메모<textarea id="cRules" rows="2" placeholder="예: 주차 2시간 무료, 첫 방문은 상담 30분 포함">' + esc(c.rules || '') + '</textarea></label></details>' +
      '<div class="chat" id="cChat"><div class="a"><b>알아줌 · 예시</b>📞 따르릉… 손님 역할로 "예약하고 싶어요"라고 말해 보세요</div></div>' +
      '<div class="say"><input id="cSay" placeholder="손님이 하는 말" enterkeyhint="send"><button type="button" class="mic" id="cMic" aria-label="말로 하기">🎤</button><button type="button" id="cGo">보내기</button></div>' +
      '<p class="note"><label style="display:inline;font-weight:600"><input type="checkbox" id="cVoice" checked style="display:inline;width:auto;margin:0 4px 0 0"> 알아줌 대답을 소리로 듣기</label> · 연습한 대화는 저장하지 않아요</p>' +
      '<div class="act"><button type="button" id="cEnd">통화 끝 · 메모 보기</button></div>');
    var $ = function (id) { return w.querySelector('#' + id); };
    var hist = [], last = null, busy = false;
    var save = function () { cfg({ hours: $('cHours').value.trim(), rules: $('cRules').value.trim() }); };
    function add(who, t) { var d = document.createElement('div'); d.className = who === 'ai' ? 'a' : 'g'; d.innerHTML = who === 'ai' ? '<b>알아줌</b>' + esc(t) : esc(t); $('cChat').appendChild(d); $('cChat').scrollTop = 1e6; }
    function speak(t) { if (!$('cVoice').checked || !window.speechSynthesis) return; try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; u.rate = 1.05; speechSynthesis.speak(u); } catch (e) {} }
    async function send() {
      var t = $('cSay').value.trim(); if (!t || busy) return; busy = true; save();
      $('cSay').value = ''; add('guest', t); hist.push({ who: 'guest', t: t });
      var st2 = studio(), cc = cfg();
      var d = await post('call-answer', { mate: MATE, shop: { name: st2.name || '', area: st2.area || '', hours: cc.hours || '', rules: cc.rules || '', menu: menu() }, history: hist }, 20000);
      busy = false;
      if (!document.body.contains(w)) return;
      if (!d._ok) { add('ai', '(잠시 연결이 안 됐어요. 다시 말해 주세요)'); hist.pop(); return; }
      add('ai', d.reply); hist.push({ who: 'ai', t: d.reply }); speak(d.reply); last = d.note || last;
      if (d.end) setTimeout(function () { if (document.body.contains(w)) showNote(); }, 1800);
    }
    function showNote() { if (!last || !(last.name || last.date || last.summary)) { toast('아직 받아 적은 내용이 없어요'); return; } noteView(Object.assign({ reply: '' }, last), 'practice'); }
    $('cGo').addEventListener('click', send);
    $('cSay').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); send(); } });
    $('cEnd').addEventListener('click', showNote);
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) $('cMic').style.display = 'none';
    else $('cMic').addEventListener('click', function () {
      try { speechSynthesis.cancel(); } catch (e) {}
      var rec = new SR(); rec.lang = 'ko-KR'; rec.interimResults = false; rec.maxAlternatives = 1;
      var b = this; b.textContent = '…';
      rec.onresult = function (e) { $('cSay').value = e.results[0][0].transcript; send(); };
      rec.onend = function () { b.textContent = '🎤'; };
      rec.onerror = function () { b.textContent = '🎤'; toast('잘 못 들었어요. 다시 눌러 주세요'); };
      rec.start();
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-call]'); if (!b) return;
    if (b.dataset.call === 'note') { var f = document.getElementById('callFile'); if (f) { f.value = ''; f.click(); } }
    else if (b.dataset.call === 'practice') practice();
  });
  function late() { if (document.querySelector('.callc')) return; var bs = document.querySelector('#v-home .boss'); if (bs) bs.insertAdjacentHTML('afterend', window.alajoomCallCard()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(late, 0); }); else setTimeout(late, 0);
  document.addEventListener('change', function (e) { if (e.target && e.target.id === 'callFile') onFile(e.target.files && e.target.files[0]); });
})();
