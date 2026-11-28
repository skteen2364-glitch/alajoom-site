/* 업종 화면 안에서 '동네 손님께 알리기'
   - 오늘 소식(특가 · 새 소식 · 쉬는 날) → 알아줌 동네 손님 화면
   - 우리 동네 3일 특가 (동네마다 2자리 · 가게 위치 인증)
   업종 화면 홈에서 window.alajoomDongCard() 로 카드를 넣고, 누르면 아래 시트가 열린다. */
(function () {
  var MATE = (location.pathname.match(/^\/([a-z]+)\//) || [])[1] || 'etc';
  var EX = {
    food: { n: '식당', deal: ['점심 특선 해장국 정식 9,000원', '오늘 저녁 수육 반값', '두 분 이상 오시면 음료 서비스'], nw: '겨울 굴국밥 시작했어요', gg: ['수육 한 접시 (2인분)', '15,000원'] },
    cafe: { n: '카페', deal: ['아메리카노 두 잔 5,000원', '오후 3시까지 라떼 천 원 할인', '유자차 시키면 쿠키 하나 서비스'], nw: '겨울 한정 유자차 나왔어요', gg: ['원두 200g + 드립백 5개', '12,000원'] },
    bakery: { n: '빵집', deal: ['저녁 7시부터 빵 30% 할인', '소금빵 세 개 5,000원', '식빵 두 줄 7,000원'], nw: '크리스마스 케이크 예약 받아요', gg: ['크리스마스 케이크 (예약)', '25,000원'] },
    hair: { n: '미용실', deal: ['평일 오전 커트 10,000원', '염색하면 클리닉 서비스', '이번 주 펌 20% 할인'], nw: '새 디자이너 선생님이 오셨어요', gg: ['뿌리 염색 + 클리닉', '39,000원'] },
    nail: { n: '네일', deal: ['젤네일 25,000원', '겨울 아트 5,000원 할인', '두 분 같이 오시면 10% 할인'], nw: '겨울 신상 디자인 나왔어요', gg: ['원컬러 젤 + 케어', '19,000원'] },
    skin: { n: '피부관리', deal: ['첫 방문 관리 30,000원', '수분 관리 1+1', '이번 주 각질 관리 반값'], nw: '새 관리를 시작했어요', gg: ['수분 관리 첫 체험', '29,000원'] },
    pilates: { n: '필라테스', deal: ['첫 체험 수업 10,000원', '두 분 같이 등록하면 10% 할인', '이번 달 등록하면 한 달 더'], nw: '저녁반을 새로 열었어요', gg: ['체험 수업 2회', '20,000원'] },
    academy: { n: '학원', deal: ['겨울방학 특강 접수 중', '형제 같이 오면 10% 할인', '무료 상담 받아요'], nw: '겨울방학 특강을 시작해요', gg: ['겨울방학 특강 4주', '120,000원'] }
  };
  var E = EX[MATE] || { n: '가게', deal: ['오늘만 10% 할인'], nw: '새 소식이 있어요', gg: ['동네 특가 상품', '10,000원'] };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function toast(t) { var el = $('toast'); if (el) { el.textContent = t; el.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { el.classList.remove('on'); }, 2400); return; }
    var d = document.createElement('div'); d.textContent = t; d.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#14161F;color:#fff;padding:12px 18px;border-radius:999px;font-weight:700;z-index:100010'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2400); }
  var AI = function () { return window.alajoomAI; };
  var PIN = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

  var CSS = '.dp-card{display:flex;align-items:center;gap:12px;width:100%;margin:0 0 12px;padding:14px 16px;border:1.5px solid var(--line,#E8E1D0);border-radius:18px;background:#fff;color:var(--ink,#14161F);font:inherit;text-align:left;cursor:pointer}' +
    '.dp-card .ic{flex:none;width:44px;height:44px;border-radius:14px;background:var(--yellow,#FFD43B);display:flex;align-items:center;justify-content:center}' +
    '.dp-card b{display:block;font-size:15.5px}.dp-card small{display:block;font-size:12.5px;color:var(--muted,#5B6070);margin-top:1px}' +
    '.dp-bg{position:fixed;inset:0;background:rgba(10,12,18,.5);z-index:100004}' +
    '.dp-sh{position:fixed;left:0;right:0;bottom:0;max-width:480px;margin:0 auto;max-height:92vh;overflow:auto;background:var(--ivory,#FBF7EE);border-radius:24px 24px 0 0;padding:18px 18px calc(22px + env(safe-area-inset-bottom));z-index:100005;color:var(--ink,#14161F);font-family:inherit;box-sizing:border-box}' +
    '.dp-sh *{box-sizing:border-box}.dp-sh h2{margin:0;font-size:20px;font-weight:900}.dp-sh .dp-sub{display:block;border:0;background:none;padding:0;margin:2px 0 0;font-size:13px;color:var(--muted,#5B6070)}' +
    '.dp-x{position:absolute;right:12px;top:12px;width:40px;height:40px;border:0;border-radius:50%;background:#fff;font-size:20px;cursor:pointer}' +
    '.dp-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:14px 0 4px;padding:4px;border-radius:14px;background:#fff;border:1px solid var(--line,#E8E1D0)}' +
    '.dp-tabs button{height:42px;border:0;border-radius:10px;background:none;font:inherit;font-weight:800;font-size:14.5px;cursor:pointer;color:var(--muted,#5B6070)}.dp-tabs button.on{background:var(--ink,#14161F);color:#fff}' +
    '.dp-sh label{display:block;margin:14px 0 6px;font-size:13.5px;font-weight:800}' +
    '.dp-sh input,.dp-sh textarea{width:100%;border:1.5px solid var(--line,#E8E1D0);border-radius:14px;background:#fff;padding:12px 14px;font:inherit;font-size:16px;color:inherit}.dp-sh textarea{min-height:84px;resize:vertical}' +
    '.dp-ch{display:flex;flex-wrap:wrap;gap:6px}.dp-ch button{min-height:40px;padding:0 14px;border-radius:999px;border:1.5px solid var(--line,#E8E1D0);background:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer;color:inherit}.dp-ch button.on{background:var(--ink,#14161F);border-color:var(--ink,#14161F);color:#fff}' +
    '.dp-ex{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.dp-ex button{border:0;border-radius:10px;background:#fff;padding:7px 10px;font:inherit;font-size:12.5px;color:var(--muted,#5B6070);cursor:pointer}' +
    '.dp-row{display:flex;gap:8px}.dp-row textarea,.dp-row input{flex:1}.dp-mic{flex:none;width:52px;border:0;border-radius:14px;background:var(--yellow,#FFD43B);cursor:pointer;font-size:20px}.dp-mic.on{background:#FF6B4A}' +
    '.dp-sh details{margin-top:14px;padding:12px 14px;border-radius:14px;background:#fff;border:1px solid var(--line,#E8E1D0)}.dp-sh summary{font-weight:800;font-size:14px;cursor:pointer}' +
    '.dp-go{display:block;width:100%;min-height:54px;margin-top:16px;border:0;border-radius:16px;background:var(--ink,#14161F);color:var(--yellow,#FFD43B);font:inherit;font-size:16.5px;font-weight:900;cursor:pointer}.dp-go[disabled]{opacity:.6}' +
    '.dp-ln{display:block;width:100%;min-height:46px;margin-top:8px;border:1.5px solid var(--ink,#14161F);border-radius:14px;background:#fff;font:inherit;font-weight:800;cursor:pointer;color:inherit;text-align:center;line-height:42px;text-decoration:none}' +
    '.dp-note{margin:8px 0 0;font-size:12.5px;color:var(--muted,#5B6070);line-height:1.55}' +
    '.dp-box{margin-top:14px;padding:14px;border-radius:16px;background:#fff;border:1px solid var(--line,#E8E1D0)}.dp-box b{font-size:15px}' +
    '.dp-slot{display:flex;justify-content:space-between;gap:8px;margin-top:8px;padding:10px 12px;border-radius:12px;background:var(--ivory,#FBF7EE);font-size:14px;font-weight:700}.dp-slot.me{background:var(--yellow,#FFD43B)}.dp-slot.free{background:#fff;border:1.5px dashed var(--line,#E8E1D0);color:var(--muted,#5B6070)}.dp-slot span:last-child{white-space:nowrap}' +
    '.dp-codes{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.dp-codes span{padding:7px 11px;border-radius:10px;background:var(--ink,#14161F);color:var(--yellow,#FFD43B);font-weight:900;letter-spacing:.06em}.dp-codes small{color:#fff;margin-left:4px;letter-spacing:0;font-size:11px}' +
    '.dp-done{text-align:center;padding:10px 0 4px}.dp-done b{display:block;font-size:19px;margin-top:6px}';
  function css() { if ($('dp-css')) return; var s = document.createElement('style'); s.id = 'dp-css'; s.textContent = CSS; document.head.appendChild(s); }

  window.alajoomDongCard = function () { css(); return '<button type="button" class="dp-card" data-dongpost="1"><span class="ic">' + PIN + '</span><span style="flex:1"><b>동네 손님께 알리기</b><small>오늘 특가 · 우리 동네 3일 특가를 동네 손님 화면에</small></span><span aria-hidden="true" style="font-size:18px">›</span></button>'; };
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-dongpost]')) open(); });

  var sh = null, tab = 'news', kind = 'deal', hours = null;
  function close() { if (sh) { sh.remove(); document.querySelector('.dp-bg') && document.querySelector('.dp-bg').remove(); sh = null; } }
  function open(t) {
    css(); close(); if (t) tab = t;
    var bg = document.createElement('div'); bg.className = 'dp-bg'; bg.onclick = close; document.body.appendChild(bg);
    sh = document.createElement('div'); sh.className = 'dp-sh'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
    sh.innerHTML = '<button type="button" class="dp-x" aria-label="닫기">×</button><h2>📍 동네 손님께 알리기</h2><p class="dp-sub">사장님이 직접 보내는 소식이에요 · 직거래 구조예요</p>' +
      '<div class="dp-tabs"><button type="button" data-t="news">오늘 소식</button><button type="button" data-t="gg">⏳ 3일 특가</button></div><div id="dpBody"></div>';
    document.body.appendChild(sh);
    sh.querySelector('.dp-x').onclick = close;
    sh.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { tab = b.dataset.t; draw(); }; });
    draw();
  }
  function draw() {
    sh.querySelectorAll('[data-t]').forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); });
    if (tab === 'news') drawNews(); else ggLoad();
  }

  /* ---------- 오늘 소식 ---------- */
  function q(k) { return esc(ls(k) || ''); }
  function drawNews() {
    var first = !(ls('dp_shop') && ls('dp_area'));
    var p = ls('dp_pending'); var pre = ''; if (p) { try { pre = JSON.parse(p).body || ''; kind = JSON.parse(p).kind || kind; } catch (e) {} }
    $('dpBody').innerHTML = '<label>어떤 소식이에요?</label><div class="dp-ch" id="dpKind"><button type="button" data-k="deal">특가</button><button type="button" data-k="new">새 소식</button><button type="button" data-k="off">쉬는 날</button></div>' +
      '<label for="dpTxt" id="dpQ"></label><div class="dp-row"><textarea id="dpTxt" maxlength="120"></textarea><button type="button" class="dp-mic" id="dpMic" aria-label="말로 적기">🎤</button></div><div class="dp-ex" id="dpEx"></div>' +
      '<div id="dpHrsW"><label>언제까지 보여 줄까요?</label><div class="dp-ch" id="dpHrs"><button type="button" data-h="">하루 종일</button><button type="button" data-h="3">⚡ 3시간</button><button type="button" data-h="1">⚡ 1시간</button></div><p class="dp-note">⚡ 번개는 남은 시간이 손님 화면에 줄어들며 보여요. 단골 손님께 알림도 가요</p></div>' +
      '<details' + (first ? ' open' : '') + '><summary>가게 정보 ' + (first ? '(처음 한 번만 적어요)' : '· ' + q('dp_shop') + ' · ' + q('dp_area')) + '</summary>' +
      '<label for="dpShop">가게 이름</label><input id="dpShop" value="' + q('dp_shop') + '" placeholder="예) 우리 가게 이름">' +
      '<label for="dpArea">우리 가게 동네</label><input id="dpArea" value="' + q('dp_area') + '" placeholder="예) 연남동">' +
      '<label for="dpPhone">가게 전화번호 (안 적어도 돼요)</label><input id="dpPhone" type="tel" value="' + q('dp_phone') + '" placeholder="예) 02-000-0000">' +
      '<label for="dpAddr">가게 주소 (안 적어도 돼요)</label><input id="dpAddr" value="' + q('dp_addr') + '" placeholder="예) ○○시 ○○구 ○○동 ○○"></details>' +
      '<button type="button" class="dp-go" id="dpGo">동네에 올리기</button><p class="dp-note">하루 3개까지 · 우리 동네를 인증한 손님 화면에 떠요</p>';
    if (pre) $('dpTxt').value = pre;
    var setK = function (k) { kind = k; $('dpKind').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.k === k); });
      $('dpQ').textContent = k === 'deal' ? '무엇을 얼마에 하세요?' : k === 'new' ? '무엇이 새로 생겼어요?' : '언제 쉬세요?';
      $('dpTxt').placeholder = '예) ' + (k === 'deal' ? E.deal[0] : k === 'new' ? E.nw : '내일 하루 쉬어요');
      var ex = k === 'deal' ? E.deal : k === 'new' ? [E.nw] : ['내일 하루 쉬어요', '이번 주 일요일 쉬어요'];
      $('dpEx').innerHTML = ex.map(function (x) { return '<button type="button">' + esc(x) + '</button>'; }).join('');
      $('dpEx').querySelectorAll('button').forEach(function (b) { b.onclick = function () { $('dpTxt').value = b.textContent; autoH(); }; });
      $('dpHrsW').style.display = k === 'deal' ? '' : 'none'; };
    $('dpKind').querySelectorAll('button').forEach(function (b) { b.onclick = function () { setK(b.dataset.k); }; });
    var hb = $('dpHrs').querySelectorAll('button');
    var setH = function (h) { hours = h; hb.forEach(function (b) { b.classList.toggle('on', String(h || '') === b.dataset.h); }); };
    hb.forEach(function (b) { b.onclick = function () { setH(b.dataset.h ? +b.dataset.h : null); }; });
    function autoH() { var m = $('dpTxt').value.match(/([1-6])\s*시간/); setH(m ? (+m[1] >= 3 ? 3 : 1) : null); }
    $('dpTxt').oninput = autoH; setK(kind); autoH();
    mic($('dpMic'), $('dpTxt'), autoH);
    if (first && AI()) AI().loggedIn().then(function (ok) { if (ok) AI().rpc('family_me').then(function (me) { if (me) { if (!$('dpShop').value && me.store_name) $('dpShop').value = me.store_name; if (!$('dpArea').value && me.area) $('dpArea').value = me.area; } }).catch(function () {}); });
    $('dpGo').onclick = postNews;
  }
  function mic(btn, inp, after) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) { btn.style.display = 'none'; return; }
    var r = null; btn.onclick = function () {
      if (r) { r.stop(); return; }
      r = new SR(); r.lang = 'ko-KR'; r.interimResults = false; r.continuous = true; btn.classList.add('on');
      r.onresult = function (e) { var t = ''; for (var i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript; if (t) { inp.value = (inp.value ? inp.value + ' ' : '') + t.trim(); after && after(); } };
      r.onend = function () { r = null; btn.classList.remove('on'); }; r.onerror = function () { toast('마이크를 켜 주세요'); };
      try { r.start(); } catch (e) { r = null; btn.classList.remove('on'); }
    };
  }
  function push(id) { return (window.alajoomToken ? window.alajoomToken() : Promise.resolve(null)).then(function (t) { if (!t) return null;
    return fetch('https://zuxbloxstkcixqpzqalk.supabase.co/functions/v1/dangol-push', { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_cZZ6cVbSIbkG93_rQ8jldg_f_Z9uOYH', 'Authorization': 'Bearer ' + t }, body: JSON.stringify({ id: id }) }).then(function (r) { return r.ok ? r.json() : null; }); }).catch(function () { return null; }); }
  function login(save) { ls('dp_pending', JSON.stringify(save)); toast('카카오로 3초 로그인할게요'); setTimeout(function () { window.alajoomLogin && window.alajoomLogin(); }, 600); }
  function postNews() {
    var body = $('dpTxt').value.trim().replace(/\s+/g, ' '), shop = $('dpShop').value.trim(), ar = $('dpArea').value.trim(), ph = $('dpPhone').value.trim(), ad = $('dpAddr').value.trim();
    if (body.length < 2) { toast('알릴 내용을 적어 주세요'); return; }
    if (kind === 'off' && !/쉬|휴무|닫/.test(body)) body += ' 쉬어요';
    if (!shop || !ar) { sh.querySelector('details').open = true; toast('가게 이름과 동네를 적어 주세요'); return; }
    if (ph && !/^[0-9\- ]{8,15}$/.test(ph)) { toast('전화번호를 숫자로 적어 주세요'); return; }
    ls('dp_shop', shop); ls('dp_area', ar); ls('dp_phone', ph || null); ls('dp_addr', ad || null);
    if (!AI()) { toast('잠시 뒤 다시 눌러 주세요'); return; }
    AI().loggedIn().then(function (ok) {
      if (!ok) return login({ kind: kind, body: body, t: Date.now() });
      var b = $('dpGo'); b.disabled = true; b.textContent = '올리는 중…';
      var ck = ph + '|' + ad, cp = (ck !== (ls('dp_contact') || '|')) ? AI().rpc('store_contact_set', { p_phone: ph, p_addr: ad }).then(function () { ls('dp_contact', ck); }).catch(function () {}) : Promise.resolve();
      var nid = null;
      cp.then(function () { return AI().rpc('news_post', { p_body: body.slice(0, 120), p_kind: kind, p_store: shop, p_area: ar, p_cat: MATE, p_hours: kind === 'deal' ? hours : null }); })
        .then(function (r) { nid = r && r.id; ls('dp_pending', null); return Promise.all([AI().rpc('family_me').catch(function () { return null; }), nid ? push(nid) : null]); })
        .then(function (rr) { var me = rr[0], sent = rr[1] && rr[1].sent;
          $('dpBody').innerHTML = '<div class="dp-done"><div style="font-size:40px">✅</div><b>동네 손님 화면에 올렸어요</b><p class="dp-note">' + (sent ? '🔔 단골 손님 ' + sent + '명께 알림을 보냈어요. ' : '') + '손님이 \'지금 가요\'를 누르면 몇 명 오는지 볼 수 있어요.</p></div>' +
            (nid ? '<button type="button" class="dp-ln" id="dpGoing">🏃 오고 있는 손님 보기</button>' : '') + '<a class="dp-ln" href="/dong/?s=' + esc((me && me.ref_code) || '') + '" target="_blank" rel="noopener">손님 화면 보기 →</a>';
          var g = $('dpGoing'); if (g) g.onclick = function () { g.disabled = true; AI().rpc('news_mine').then(function (a) { var n = (a || []).filter(function (x) { return x.id === nid; })[0], c = n ? n.going : 0; g.disabled = false; g.textContent = c ? '🏃 손님 ' + c + '명이 오고 있어요 (다시 보기)' : '🏃 아직 없어요 (다시 보기)'; }); };
        }).catch(function (e) { var m = String(e && e.message || ''); b.disabled = false; b.textContent = '동네에 올리기';
          toast(/daily_limit/.test(m) ? '오늘은 3개까지 올릴 수 있어요' : /need_store_area/.test(m) ? '가게 이름과 동네를 적어 주세요' : '잠시 뒤 다시 눌러 주세요'); });
    });
  }

  /* ---------- 3일 특가 ---------- */
  function lft(t) { var m = Math.max(0, Math.round((new Date(t) - Date.now()) / 60000)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60); return (d ? d + '일 ' : '') + (h ? h + '시간 ' : '') + (d ? '' : m % 60 + '분 ') + '남았어요'; }
  function kst(t) { var d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function ggLoad() {
    var B = $('dpBody'); B.innerHTML = '<p class="dp-note">불러오는 중…</p>';
    if (!AI()) { B.innerHTML = '<p class="dp-note">잠시 뒤 다시 열어 주세요</p>'; return; }
    AI().loggedIn().then(function (ok) {
      if (!ok) { B.innerHTML = '<div class="dp-box"><b>먼저 로그인해요</b><p class="dp-note">우리 가게 특가라는 걸 확인하려고 한 번만 로그인해요.</p><button type="button" class="dp-go" id="dpLogin">카카오로 3초 로그인</button></div>'; $('dpLogin').onclick = function () { login({ tab: 'gg', t: Date.now() }); }; return; }
      return AI().rpc('gonggu_status').then(ggDraw);
    }).catch(function () { B.innerHTML = '<p class="dp-note">불러오지 못했어요. 다시 열어 주세요</p>'; });
  }
  function ggDraw(st) {
    var B = $('dpBody'), head = '<p class="dp-note" style="margin-top:12px">우리 동네 손님만 예약해요. 동네마다 딱 2자리, 3일 동안 시간이 줄어들다 끝나요. 돈은 가게에서 직접 받아요.</p>';
    if (!st.dong) { B.innerHTML = head + '<div class="dp-box"><b>1단계 · 가게 위치 인증</b><p class="dp-note">우리 동네 사장님만 올릴 수 있어요. 가게 안에서 아래 버튼을 눌러 주세요. 한 번만 하면 돼요.</p><button type="button" class="dp-go" id="dpLoc">📍 지금 가게 위치로 인증</button></div>'; $('dpLoc').onclick = storeLoc; return; }
    var sl = st.slots || [], h = head + '<div class="dp-box"><div style="display:flex;justify-content:space-between;align-items:center"><b>📍 ' + esc(st.dong) + '</b><button type="button" id="dpRe" style="border:0;background:none;font:inherit;font-size:12.5px;font-weight:700;color:#2F55A4;text-decoration:underline;cursor:pointer">위치 다시 인증</button></div><p class="dp-note" style="margin-top:2px">' + esc(st.dong) + ' 3일 특가 자리 ' + sl.length + '/2</p>';
    sl.forEach(function (x) { h += '<div class="dp-slot' + (x.mine ? ' me' : '') + '"><span>' + (x.mine ? '⭐ 우리 가게 · ' : '') + esc(x.title) + '</span><span>' + lft(x.ends) + '</span></div>'; });
    for (var k = sl.length; k < 2; k++) h += '<div class="dp-slot free"><span>빈자리</span><span>올릴 수 있어요</span></div>';
    h += '</div>';
    if (st.mine) { var m = st.mine, l = m.list || [];
      h += '<div class="dp-box"><b>⭐ ' + esc(m.title) + ' ' + esc(m.price) + '</b><p style="margin:6px 0 0;font-size:22px;font-weight:900">예약 ' + l.length + '명 · ' + m.taken + '개' + (m.qty ? ' / ' + m.qty + '개' : '') + '</p><p class="dp-note">' + lft(m.ends) + ' · 손님이 말하는 번호를 확인해 주세요</p>' +
        (l.length ? '<div class="dp-codes">' + l.map(function (r) { return '<span>' + esc(r.code) + '<small>' + r.qty + '개</small></span>'; }).join('') + '</div>' : '<p class="dp-note">아직 예약이 없어요</p>') +
        '<button type="button" class="dp-ln" id="dpRef">🔄 예약 새로 보기</button><button type="button" class="dp-ln" id="dpEnd" style="border-color:#C9CCD6;color:#6A6F7C">일찍 끝내기</button></div>';
    } else if (sl.length >= 2) h += '<p class="dp-note">지금은 두 자리가 다 찼어요. ' + kst(sl[0].ends) + '에 한 자리가 비어요.</p>';
    else h += '<label for="ggT">무엇을 파세요?</label><div class="dp-row"><input id="ggT" maxlength="40" placeholder="예) ' + esc(E.gg[0]) + '"><button type="button" class="dp-mic" id="ggMic" aria-label="말로 적기">🎤</button></div>' +
      '<label for="ggP">동네 특가 얼마예요?</label><input id="ggP" maxlength="20" placeholder="예) ' + esc(E.gg[1]) + '">' +
      '<label for="ggO">원래 값 (안 적어도 돼요)</label><input id="ggO" maxlength="20">' +
      '<label for="ggQ">몇 개 · 몇 자리 준비하세요? (안 적어도 돼요)</label><input id="ggQ" inputmode="numeric" maxlength="3" placeholder="예) 20">' +
      '<label for="ggN">한 줄 안내 (안 적어도 돼요)</label><input id="ggN" maxlength="80" placeholder="예) 예약 손님 먼저 챙겨 드려요">' +
      '<button type="button" class="dp-go" id="ggGo">3일 특가 올리기</button><p class="dp-note">올리면 바로 3일 시계가 시작돼요 · 한 가게는 한 번에 1개만</p>';
    B.innerHTML = h; $('dpRe').onclick = storeLoc;
    if (st.mine) { $('dpRef').onclick = ggLoad; $('dpEnd').onclick = function () { var b = $('dpEnd'); if (b.dataset.ok !== '1') { b.dataset.ok = '1'; b.textContent = '한 번 더 누르면 끝나요'; return; } AI().rpc('gonggu_end', { p_id: st.mine.id }).then(function (r) { toast('특가를 끝냈어요'); ggDraw(r); }); }; }
    else if ($('ggGo')) { mic($('ggMic'), $('ggT')); $('ggGo').onclick = ggPost; }
  }
  function ggPost() {
    var t = $('ggT').value.trim(), pr = $('ggP').value.trim(), n = parseInt(($('ggQ').value || '').replace(/[^0-9]/g, ''), 10);
    if (t.length < 2) { toast('무엇을 파시는지 적어 주세요'); return; } if (!pr) { toast('동네 특가 값을 적어 주세요'); return; }
    var b = $('ggGo'); b.disabled = true; b.textContent = '올리는 중…';
    AI().rpc('gonggu_post', { p_title: t, p_price: pr, p_orig: $('ggO').value.trim(), p_qty: n > 0 ? n : null, p_note: $('ggN').value.trim() })
      .then(function (st) { toast('⏳ 3일 특가를 올렸어요!'); ggDraw(st); sh.scrollTop = 0; })
      .catch(function (e) { var m = String(e && e.message || ''); b.disabled = false; b.textContent = '3일 특가 올리기'; toast(/slots_full/.test(m) ? '두 자리가 다 찼어요' : /have_active/.test(m) ? '이미 올린 특가가 있어요' : /need_store_dong/.test(m) ? '가게 위치를 먼저 인증해 주세요' : '잠시 뒤 다시 눌러 주세요'); ggLoad(); });
  }
  function storeLoc() {
    var b = this, t = b.textContent; b.disabled = true; b.textContent = '위치 찾는 중…';
    new Promise(function (res, rej) { if (!navigator.geolocation) return rej('nogeo'); navigator.geolocation.getCurrentPosition(function (p) { res(p.coords); }, function (e) { rej(e && e.code === 1 ? 'denied' : 'fail'); }, { enableHighAccuracy: true, timeout: 20000 }); })
      .then(function (c) { return fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&addressdetails=1&accept-language=ko&lat=' + c.latitude.toFixed(5) + '&lon=' + c.longitude.toFixed(5)).then(function (r) { return r.json(); }).then(function (d) {
        var a = d.address || {}, pk = function (ks, re) { for (var i = 0; i < ks.length; i++) { var v = a[ks[i]]; if (typeof v === 'string' && re.test(v.trim())) return v.trim(); } return null; };
        var dong = pk(['suburb', 'quarter', 'neighbourhood', 'village', 'town', 'hamlet'], /(동|읍|면|가|리)$/), gu = pk(['borough', 'city_district', 'county', 'city', 'town'], /(구|군|시)$/);
        if (!dong) throw 'nodong'; return AI().rpc('store_verify', { p_dong: dong, p_gu: gu, p_lat: c.latitude, p_lng: c.longitude }); }); })
      .then(function (r) { toast('📍 ' + r.dong + ' 가게로 인증했어요'); ggLoad(); })
      .catch(function (e) { b.disabled = false; b.textContent = t; toast(e === 'denied' ? '위치 권한을 허용해 주세요' : '위치를 못 찾았어요. 다시 눌러 주세요'); });
  }

  /* 로그인하고 돌아오면 이어서 */
  setTimeout(function () { var p = ls('dp_pending'); if (!p || !AI()) return; var o; try { o = JSON.parse(p); } catch (e) { return; }
    if (Date.now() - (o.t || 0) > 30 * 60000) { ls('dp_pending', null); return; }
    AI().loggedIn().then(function (ok) { if (!ok) return; if (o.tab === 'gg') { ls('dp_pending', null); open('gg'); } else open('news'); }); }, 1200);
  window.alajoomDongOpen = open;
})();
