  /* ---------- 사진 필터 · 꾸미기 템플릿 ---------- */
  var FILTERS = [['none','기본'],['vivid','화사하게'],['soft','뽀얀 톤'],['film','시네마'],['cool','쿨톤'],['vintage','빈티지'],['mono','흑백']];
  var FRAMES = [['basic','기본'],['band','하단 띠'],['magazine','매거진'],['polaroid','폴라로이드'],['badge','스티커'],['line','라인'],['none','글자 없이']];
  function applyFilter(d, f){
    if (!f || f === 'none') return;
    for (var i = 0; i < d.length; i += 4){
      var r = d[i], g = d[i+1], b = d[i+2], l = .299*r + .587*g + .114*b;
      if (f === 'vivid'){ r = l + (r - l) * 1.25 + 6; g = l + (g - l) * 1.25 + 6; b = l + (b - l) * 1.25 + 6; }
      else if (f === 'soft'){ r = (l + (r - l) * .88) * .86 + 36 + 4; g = (l + (g - l) * .88) * .86 + 36; b = (l + (b - l) * .88) * .86 + 36 + 2; }
      else if (f === 'film'){ var k = (l - 128) * .14; r = (r - 128) * 1.08 + 128 + k; g = (g - 128) * 1.08 + 128; b = (b - 128) * 1.08 + 128 - k + 6; }
      else if (f === 'cool'){ r = r - 8; g = g + 2; b = b + 14; }
      else if (f === 'vintage'){ var sr = .393*r + .769*g + .189*b, sg = .349*r + .686*g + .168*b, sb = .272*r + .534*g + .131*b; r = (r * .62 + sr * .38) * .9 + 22; g = (g * .62 + sg * .38) * .9 + 18; b = (b * .62 + sb * .38) * .9 + 10; }
      else if (f === 'mono'){ var m = (l - 128) * 1.12 + 128; r = g = b = m; }
      d[i] = r; d[i+1] = g; d[i+2] = b;
    }
  }
  function drawFrame(c, x, W, H, u, F){
    var fr = ph.frame || 'basic', acc = cssv('--blue', '#B83C66'), txt = ph.text, nm = ph.name && studio.name ? studio.name + (studio.area ? '  ·  ' + studio.area : '') : '';
    var shade = function(h0){ var gr = x.createLinearGradient(0, H - h0, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = gr; x.fillRect(0, H - h0, W, h0); };
    x.textBaseline = 'alphabetic';
    if (fr === 'none') return c;
    if (fr === 'basic'){
      if (txt){ x.font = '900 ' + Math.round(58 * u) + 'px ' + F; var tw = x.measureText(txt).width, pad = 34 * u, bh = 96 * u, bx = 48 * u, by = 48 * u; x.fillStyle = '#FFD43B'; roundRect(x, bx, by, tw + pad * 2, bh, bh / 2); x.fill(); x.fillStyle = '#14161F'; x.textBaseline = 'middle'; x.fillText(txt, bx + pad, by + bh / 2 + 2 * u); x.textBaseline = 'alphabetic'; }
      if (nm){ shade(200 * u); x.font = '700 ' + Math.round(38 * u) + 'px ' + F; x.fillStyle = '#FFFFFF'; x.fillText(nm, 48 * u, H - 48 * u); }
      return c;
    }
    if (fr === 'band'){
      var bh2 = (txt ? 190 : 120) * u; x.fillStyle = acc; x.fillRect(0, H - bh2, W, bh2);
      if (txt){ x.font = '900 ' + Math.round(64 * u) + 'px ' + F; x.fillStyle = '#FFFFFF'; x.fillText(txt, 56 * u, H - bh2 + 92 * u); }
      if (nm){ x.font = '700 ' + Math.round(34 * u) + 'px ' + F; x.fillStyle = 'rgba(255,255,255,.88)'; x.fillText(nm, 56 * u, H - 40 * u); }
      return c;
    }
    if (fr === 'magazine'){
      var gt = x.createLinearGradient(0, 0, 0, H * .42); gt.addColorStop(0, 'rgba(0,0,0,.55)'); gt.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gt; x.fillRect(0, 0, W, H * .42);
      x.font = '700 ' + Math.round(30 * u) + 'px ' + F; x.fillStyle = '#FFFFFF'; x.fillText((studio.name || '').toUpperCase(), 56 * u, 80 * u);
      if (txt){ x.fillStyle = '#FFD43B'; x.fillRect(56 * u, 120 * u, 80 * u, 8 * u); x.font = '900 ' + Math.round(96 * u) + 'px ' + F; x.fillStyle = '#FFFFFF'; wrap(x, txt, W - 112 * u).slice(0, 2).forEach(function(s, i){ x.fillText(s, 56 * u, 230 * u + i * 108 * u); }); }
      if (studio.area && ph.name){ shade(150 * u); x.font = '500 ' + Math.round(30 * u) + 'px ' + F; x.fillStyle = '#FFFFFF'; x.fillText(studio.area + (studio.contact ? '  ·  ' + studio.contact : ''), 56 * u, H - 44 * u); }
      return c;
    }
    if (fr === 'polaroid'){
      var src = document.createElement('canvas'); src.width = W; src.height = H; src.getContext('2d').drawImage(c, 0, 0);
      var m = 46 * u, bot = 210 * u; x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
      var iw = W - m * 2, ih = H - m - bot, sc = Math.max(iw / W, ih / H), dw = W * sc, dh = H * sc;
      x.save(); x.beginPath(); x.rect(m, m, iw, ih); x.clip(); x.drawImage(src, m + (iw - dw) / 2, m + (ih - dh) / 2, dw, dh); x.restore();
      x.textAlign = 'center'; x.font = '700 ' + Math.round(54 * u) + 'px ' + F; x.fillStyle = '#2A2D36'; x.fillText(txt || studio.name || '', W / 2, H - bot / 2 + 6 * u);
      if (txt && nm){ x.font = '500 ' + Math.round(28 * u) + 'px ' + F; x.fillStyle = '#8A8F9C'; x.fillText(nm, W / 2, H - 46 * u); }
      x.textAlign = 'left'; return c;
    }
    if (fr === 'badge'){
      var R = 132 * u, cx = W - R - 40 * u, cy = R + 40 * u, word = txt || 'NEW';
      x.save(); x.translate(cx, cy); x.rotate(.18); x.fillStyle = acc; x.beginPath(); x.arc(0, 0, R, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 4 * u; x.setLineDash([10 * u, 8 * u]); x.beginPath(); x.arc(0, 0, R - 14 * u, 0, Math.PI * 2); x.stroke(); x.setLineDash([]);
      x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle'; var fs = word.length > 6 ? 40 : 54; x.font = '900 ' + Math.round(fs * u) + 'px ' + F;
      var parts = wrap(x, word, R * 1.5).slice(0, 2); parts.forEach(function(s, i){ x.fillText(s, 0, (i - (parts.length - 1) / 2) * fs * 1.1 * u); });
      x.restore(); x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      if (nm){ shade(180 * u); x.font = '700 ' + Math.round(38 * u) + 'px ' + F; x.fillStyle = '#FFFFFF'; x.fillText(nm, 48 * u, H - 48 * u); }
      return c;
    }
    if (fr === 'line'){
      x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 5 * u; x.strokeRect(34 * u, 34 * u, W - 68 * u, H - 68 * u);
      shade(320 * u); x.textAlign = 'center';
      if (txt){ x.font = '900 ' + Math.round(70 * u) + 'px ' + F; x.fillStyle = '#FFFFFF'; x.fillText(txt, W / 2, H - (nm ? 130 : 90) * u); }
      if (nm){ x.font = '500 ' + Math.round(32 * u) + 'px ' + F; x.fillStyle = 'rgba(255,255,255,.9)'; x.fillText(nm, W / 2, H - 76 * u); }
      x.textAlign = 'left'; return c;
    }
    return c;
  }
  var _thT = 0;
  function photoThumbs(){
    clearTimeout(_thT); _thT = setTimeout(function(){
      if (!ph.img) return;
      var keep = { filter: ph.filter, frame: ph.frame };
      var fs = $('#fltStrip'), ms = $('#frmStrip');
      if (fs) fs.querySelectorAll('[data-flt]').forEach(function(b){ ph.filter = b.dataset.flt; ph.frame = 'none'; var im = b.querySelector('img'); im.src = render(200, true).toDataURL('image/jpeg', .7); });
      ph.filter = keep.filter;
      if (ms) ms.querySelectorAll('[data-frm]').forEach(function(b){ ph.frame = b.dataset.frm; var im = b.querySelector('img'); im.src = render(220, true).toDataURL('image/jpeg', .72); });
      ph.frame = keep.frame;
    }, 250);
  }
  function strip(id, label, list, attr, cur){
    return '<div class="step"><p>' + label + ' <small style="font-weight:500">옆으로 넘겨 보세요</small></p><div class="tpl-strip" id="' + id + '" role="group" aria-label="' + label + '">' + list.map(function(o){ return '<button type="button" class="tpl" data-' + attr + '="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '"><img alt=""><span>' + o[1] + '</span></button>'; }).join('') + '</div></div>';
  }
