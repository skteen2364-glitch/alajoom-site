/* 천천히 말해도 끊기지 않는 마이크
   - 폰 음성인식은 1~2초만 쉬어도 멈춰 버려서, 천천히 말하는 사장님 말이 잘림.
   - 이 파일은 브라우저의 SpeechRecognition을 감싸서, 말이 멈춰도 바로 끝내지 않고
     다시 듣기를 이어 붙여요. 사장님이 버튼을 다시 누르거나(stop),
     한동안(시장 12초, 그 밖 8초) 아무 말이 없을 때만 끝나요.
   - interimResults=false 로 쓰는 곳(전화처럼 주고받는 화면)은 원래대로 둬요. */
(function () {
  var N = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!N || N.__patient) return;
  var SIL = /\/market\//.test(location.pathname) ? 12000 : 8000;
  var MAX = 180000;

  function P() {
    this.lang = 'ko-KR'; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1;
    this.onresult = this.onend = this.onerror = this.onstart = null;
    this._l = {}; this._run = false;
  }
  P.__patient = true;
  P.prototype.addEventListener = function (t, f) { (this._l[t] = this._l[t] || []).push(f); };
  P.prototype.removeEventListener = function (t, f) { var a = this._l[t] || []; var i = a.indexOf(f); if (i > -1) a.splice(i, 1); };
  P.prototype._emit = function (t, e) {
    e = e || {}; e.type = t; e.target = this;
    var h = this['on' + t], self = this;
    if (typeof h === 'function') { try { h.call(this, e); } catch (x) { setTimeout(function () { throw x; }); } }
    (this._l[t] || []).slice().forEach(function (f) { try { f.call(self, e); } catch (x) { setTimeout(function () { throw x; }); } });
  };
  function mk(list) {
    var arr = list.map(function (c) { var r = [{ transcript: c.t, confidence: 1 }]; r.isFinal = c.f; r.item = function (i) { return this[i]; }; return r; });
    arr.item = function (i) { return this[i]; };
    return arr;
  }
  P.prototype._fire = function (idx) {
    var all = this._done.concat(this._cur || []);
    this._emit('result', { resultIndex: idx, results: mk(all) });
  };

  P.prototype.start = function () {
    if (this._run) { var err = new Error('already started'); err.name = 'InvalidStateError'; throw err; }
    if (!this.interimResults && !this.continuous) { return this._native(); }
    this._run = true; this._user = false; this._fatal = false; this._done = []; this._cur = null;
    this._t0 = this._last = Date.now(); this._started = false; this._fails = 0;
    this._go();
  };
  // 원래 방식 그대로(한 마디 듣고 끝)
  P.prototype._native = function () {
    var s = this, r = new N(); s._r = r; s._run = true;
    ['lang', 'interimResults', 'continuous', 'maxAlternatives'].forEach(function (k) { r[k] = s[k]; });
    r.onstart = function () { s._emit('start'); };
    r.onresult = function (e) { s._emit('result', { resultIndex: e.resultIndex, results: e.results }); };
    r.onerror = function (e) { s._emit('error', { error: e.error, message: e.message }); };
    r.onend = function () { s._run = false; s._r = null; s._emit('end'); };
    r.start();
  };
  P.prototype._go = function () {
    var s = this, r = new N(), base = s._done.length, sep = base > 0;
    s._r = r; s._cur = null;
    r.lang = s.lang || 'ko-KR'; r.interimResults = true; r.continuous = true; r.maxAlternatives = 1;
    r.onstart = function () { if (!s._started) { s._started = true; s._emit('start'); } };
    r.onresult = function (e) {
      s._last = Date.now(); s._fails = 0;
      var cur = [];
      for (var i = 0; i < e.results.length; i++) {
        var t = e.results[i][0].transcript;
        if (i === 0 && sep && t && t.charAt(0) !== ' ') t = ' ' + t;
        cur.push({ f: e.results[i].isFinal, t: t });
      }
      s._cur = cur;
      s._fire(base + e.resultIndex);
    };
    r.onerror = function (e) {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
        s._fatal = true; s._emit('error', { error: e.error, message: e.message });
      } else if (e.error === 'network') { s._fails++; if (s._fails > 2) { s._fatal = true; s._emit('error', { error: e.error, message: e.message }); } }
      // no-speech / aborted 는 조용히 넘기고 다시 들음
    };
    r.onend = function () {
      if (s._cur && s._cur.length) {
        var firstOpen = -1;
        s._cur.forEach(function (c, i) { if (!c.f) { c.f = true; if (firstOpen < 0) firstOpen = i; } });
        if (firstOpen > -1) s._fire(base + firstOpen);
        s._done = s._done.concat(s._cur); s._cur = null;
      }
      var now = Date.now();
      if (!s._user && !s._fatal && now - s._last < SIL && now - s._t0 < MAX) {
        setTimeout(function () { if (s._user) return s._finish(); try { s._go(); } catch (x) { s._finish(); } }, 120);
        return;
      }
      s._finish();
    };
    try { r.start(); } catch (x) { s._finish(); }
  };
  P.prototype._finish = function () { if (!this._run) return; this._run = false; this._r = null; this._emit('end'); };
  P.prototype.stop = function () { this._user = true; if (this._r) { try { this._r.stop(); } catch (x) { this._finish(); } } else this._finish(); };
  P.prototype.abort = function () { this._user = true; if (this._r) { try { this._r.abort(); } catch (x) { this._finish(); } } else this._finish(); };

  window.SpeechRecognition = P;
  window.webkitSpeechRecognition = P;
})();
