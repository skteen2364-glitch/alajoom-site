  /* ---------- 카드 그리기: 디자인 템플릿 10종 × 크기 3종 ---------- */
  function cssv(n, d){ try { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || d; } catch(e){ return d; } }
  var ACC = cssv('--blue', '#B83C66'), ACCD = cssv('--blue-deep', '#8F2C4E'), TINT = cssv('--blue-tint', '#FBE7EE');
  var THEMES = [
    {key:'point', name:'포인트', sw:TINT},
    {key:'brand', name:'브랜드', sw:ACCD},
    {key:'pop', name:'옐로 팝', sw:'#FFE45C'},
    {key:'magazine', name:'매거진', sw:'#2A2D36'},
    {key:'polaroid', name:'폴라로이드', sw:'#F3EDE2'},
    {key:'minimal', name:'미니멀', sw:'#FFFFFF'},
    {key:'coupon', name:'쿠폰', sw:ACC},
    {key:'menu', name:'메뉴판', sw:'#FBF7EE'},
    {key:'pastel', name:'파스텔', sw:'#FFF3D6'},
    {key:'noir', name:'블랙 골드', sw:'#14161F'}
  ];
  var FMTS = {feed:[1080,1350,'피드 4:5'], square:[1080,1080,'정사각 1:1'], story:[1080,1920,'스토리 9:16']}, cfmt = 'feed';
  function wrap(ctx, text, maxW){ var out = []; String(text).split('\n').forEach(function(par){ var line = ''; Array.from(par).forEach(function(ch){ var test = line + ch; if (ctx.measureText(test).width > maxW && line){ out.push(line); line = ch; } else line = test; }); out.push(line); }); return out; }
  function cover(x, im, l, t, w, h){ var sc = Math.max(w / im.naturalWidth, h / im.naturalHeight), dw = im.naturalWidth * sc, dh = im.naturalHeight * sc; x.save(); x.beginPath(); x.rect(l, t, w, h); x.clip(); x.drawImage(im, l + (w - dw) / 2, t + (h - dh) / 2, dw, dh); x.restore(); }
  function pill(x, text, l, t, bg, fg, size){ size = size || 38; x.font = '900 ' + size + 'px ' + CF; var w = x.measureText(text).width + size * 1.6, h = size * 2; x.fillStyle = bg; roundRect(x, l, t, w, h, h / 2); x.fill(); x.fillStyle = fg; x.textBaseline = 'middle'; x.fillText(text, l + size * .8, t + h / 2 + 1); x.textBaseline = 'alphabetic'; return w; }
  var CF = "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif";
  function titleBlock(x, c, l, y, maxW, size, color, maxLines, align){
    x.font = '900 ' + size + 'px ' + CF; x.fillStyle = color; x.textAlign = align || 'left';
    wrap(x, c.title || '', maxW).slice(0, maxLines || 3).forEach(function(s){ y += size * 1.12; x.fillText(s, l, y); });
    x.textAlign = 'left'; return y;
  }
  function linesBlock(x, c, l, y, maxW, size, color, dot, max){
    x.font = '500 ' + size + 'px ' + CF;
    (c.lines || []).slice(0, max || 4).forEach(function(s){
      wrap(x, s, maxW - (dot ? 44 : 0)).slice(0, 2).forEach(function(seg, i){ y += size * 1.6; if (dot && i === 0){ x.fillStyle = dot; x.beginPath(); x.arc(l + 10, y - size * .34, size * .2, 0, Math.PI * 2); x.fill(); } x.fillStyle = color; x.fillText(seg, l + (dot ? 44 : 0), y); });
      y += size * .2;
    });
    return y;
  }
  function footer(x, c, l, b, color, align, W){
    x.textAlign = align || 'left'; var px = align === 'center' ? W / 2 : l;
    x.font = '900 44px ' + CF; x.fillStyle = color; x.fillText(studio.name || '', px, b - 52);
    x.font = '500 32px ' + CF; x.globalAlpha = .8; x.fillText([studio.area, c.footer].filter(Boolean).join('  ·  '), px, b); x.globalAlpha = 1; x.textAlign = 'left';
  }
  function splitPrice(s){ var m = String(s).match(/^(.*?)[\s·:]+([\d,]+\s*원?|\[[^\]]*\])\s*$/); return m ? [m[1], m[2]] : [s, '']; }
  function drawCard(c, tpl, fmt, s){
    tpl = tpl == null ? theme : tpl; fmt = fmt || cfmt; s = s || 1;
    var T = (THEMES[tpl] || THEMES[0]).key, Fm = FMTS[fmt] || FMTS.feed, W = Fm[0], H = Fm[1];
    var cv = document.createElement('canvas'); cv.width = Math.round(W * s); cv.height = Math.round(H * s);
    var x = cv.getContext('2d'); x.scale(s, s); x.textBaseline = 'alphabetic';
    var im = att && att.img, tall = H / W, top = tall > 1.5 ? 260 : 150, L = 90, MW = W - 180, y;
    if (T === 'point' || T === 'brand' || T === 'pop'){
      var P = T === 'point' ? {bg:TINT, blob:'rgba(255,255,255,.55)', ink:'#1F2230', acc:ACC, pill:'#1F2230', pillT:'#FFD43B'} : T === 'brand' ? {bg:ACCD, blob:ACC, ink:'#FFFFFF', acc:'#FFD43B', pill:'#FFD43B', pillT:'#14161F'} : {bg:'#FFE45C', blob:'#FFD43B', ink:'#14161F', acc:ACCD, pill:'#14161F', pillT:'#FFE45C'};
      x.fillStyle = P.bg; x.fillRect(0, 0, W, H);
      if (im){
        var PH = Math.round(H * (tall > 1.5 ? .48 : .5)); cover(x, im, 0, 0, W, PH);
        if (c.kicker) pill(x, c.kicker, L, PH - 38, P.pill, P.pillT);
        y = titleBlock(x, c, L, PH + 60, MW, fmt === 'square' ? 76 : 92, P.ink, 2);
        linesBlock(x, c, L, y + 6, MW, 40, P.ink, P.acc, fmt === 'square' ? 2 : 3);
      } else {
        x.fillStyle = P.blob; x.beginPath(); x.arc(W - 120, 210, 330, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(110, H - 90, 220, 0, Math.PI * 2); x.fill();
        if (c.kicker) pill(x, c.kicker, L, top, P.pill, P.pillT, 40);
        y = titleBlock(x, c, L, top + 140, MW, fmt === 'square' ? 104 : 118, P.ink, 3);
        y += 60; x.fillStyle = P.acc; x.fillRect(L, y, 120, 12); y += 30;
        linesBlock(x, c, L, y, MW, 46, P.ink, P.acc, fmt === 'square' ? 3 : 4);
      }
      footer(x, c, L, H - 70, P.ink, 'left', W);
    } else if (T === 'magazine'){
      if (im) cover(x, im, 0, 0, W, H); else { var g0 = x.createLinearGradient(0, 0, W, H); g0.addColorStop(0, ACC); g0.addColorStop(1, '#2A2D36'); x.fillStyle = g0; x.fillRect(0, 0, W, H); }
      var g = x.createLinearGradient(0, H * .35, 0, H); g.addColorStop(0, 'rgba(10,10,14,0)'); g.addColorStop(1, 'rgba(10,10,14,.82)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(10,10,14,.35)'; x.fillRect(0, 0, W, 130);
      x.font = '900 34px ' + CF; x.fillStyle = '#FFFFFF'; x.fillText((studio.name || '').toUpperCase(), L, 84);
      x.textAlign = 'right'; x.font = '700 30px ' + CF; x.fillText(c.kicker || '', W - L, 84); x.textAlign = 'left';
      x.font = '900 104px ' + CF; var tl = wrap(x, c.title || '', MW).slice(0, 3), ln = (c.lines || []).slice(0, 2);
      y = H - 150 - ln.length * 66 - tl.length * 116;
      x.fillStyle = '#FFD43B'; x.fillRect(L, y - 40, 90, 10);
      y = titleBlock(x, c, L, y, MW, 104, '#FFFFFF', 3);
      x.font = '500 40px ' + CF; x.fillStyle = 'rgba(255,255,255,.92)'; ln.forEach(function(s2){ y += 66; x.fillText(wrap(x, s2, MW)[0], L, y); });
      x.font = '500 30px ' + CF; x.fillStyle = 'rgba(255,255,255,.75)'; x.fillText([studio.area, c.footer].filter(Boolean).join('  ·  '), L, H - 60);
    } else if (T === 'polaroid'){
      x.fillStyle = '#F3EDE2'; x.fillRect(0, 0, W, H);
      var fw = W - 200, fh = Math.min(H - 520, fw * 1.05), fx = 100, fy = tall > 1.5 ? 220 : 90;
      x.save(); x.translate(W / 2, fy + fh / 2); x.rotate(-.025); x.translate(-W / 2, -(fy + fh / 2));
      x.shadowColor = 'rgba(0,0,0,.18)'; x.shadowBlur = 40; x.shadowOffsetY = 16; x.fillStyle = '#FFFFFF'; x.fillRect(fx, fy, fw, fh + 150); x.shadowColor = 'transparent';
      if (im) cover(x, im, fx + 34, fy + 34, fw - 68, fh - 34); else { x.fillStyle = TINT; x.fillRect(fx + 34, fy + 34, fw - 68, fh - 34); x.font = '900 64px ' + CF; x.fillStyle = ACC; x.textAlign = 'center'; x.fillText(c.kicker || '', W / 2, fy + fh / 2 + 20); x.textAlign = 'left'; }
      x.font = '700 50px ' + CF; x.fillStyle = '#2A2D36'; x.textAlign = 'center'; x.fillText(wrap(x, (c.title || '').replace(/\n/g, ' '), fw - 80)[0], W / 2, fy + fh + 95); x.textAlign = 'left';
      x.restore();
      x.font = '500 40px ' + CF; x.fillStyle = '#2A2D36'; x.textAlign = 'center'; y = fy + fh + 230;
      (c.lines || []).slice(0, fmt === 'square' ? 1 : 3).forEach(function(s2){ x.fillText(wrap(x, s2, MW)[0], W / 2, y); y += 60; });
      x.textAlign = 'left'; if (fmt !== 'square') footer(x, c, L, H - 60, '#2A2D36', 'center', W);
    } else if (T === 'minimal'){
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H); x.strokeStyle = '#1F2230'; x.lineWidth = 3; x.strokeRect(50, 50, W - 100, H - 100);
      var ph2 = im ? Math.round(H * .38) : 0; if (im) cover(x, im, 50, 50, W - 100, ph2);
      y = (im ? 50 + ph2 : (tall > 1.5 ? 380 : 230)) + 70;
      x.font = '700 30px ' + CF; x.fillStyle = ACC; x.textAlign = 'center'; x.fillText((c.kicker || '').split('').join(' '), W / 2, y); x.textAlign = 'left';
      y = titleBlock(x, c, W / 2, y + 20, MW, fmt === 'square' && im ? 70 : 92, '#1F2230', 2, 'center');
      x.fillStyle = '#1F2230'; x.fillRect(W / 2 - 30, y + 36, 60, 4); y += 60;
      x.font = '500 40px ' + CF; x.fillStyle = '#3A3F4C'; x.textAlign = 'center'; (c.lines || []).slice(0, fmt === 'square' ? 2 : 4).forEach(function(s2){ y += 62; x.fillText(wrap(x, s2, MW - 40)[0], W / 2, y); }); x.textAlign = 'left';
      footer(x, c, L, H - 100, '#1F2230', 'center', W);
    } else if (T === 'coupon'){
      x.fillStyle = ACC; x.fillRect(0, 0, W, H);
      var cx = 80, cy = tall > 1.5 ? 330 : (fmt === 'square' ? 80 : 150), cw = W - 160, ch = H - cy * 2;
      x.fillStyle = '#FFFFFF'; roundRect(x, cx, cy, cw, ch, 36); x.fill();
      var cut = cy + ch * .62; x.fillStyle = ACC; x.beginPath(); x.arc(cx, cut, 40, 0, Math.PI * 2); x.arc(cx + cw, cut, 40, 0, Math.PI * 2); x.fill();
      x.setLineDash([18, 16]); x.strokeStyle = '#D9D2C2'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx + 60, cut); x.lineTo(cx + cw - 60, cut); x.stroke(); x.setLineDash([]);
      x.textAlign = 'center'; x.font = '900 40px ' + CF; x.fillStyle = ACC; x.fillText(c.kicker || 'COUPON', W / 2, cy + 110);
      titleBlock(x, c, W / 2, cy + 130, cw - 120, fmt === 'square' ? 84 : 100, '#14161F', 2, 'center');
      x.font = '500 38px ' + CF; x.fillStyle = '#3A3F4C'; y = cut + 80; x.textAlign = 'center';
      (c.lines || []).slice(0, 2).forEach(function(s2){ x.fillText(wrap(x, s2, cw - 120)[0], W / 2, y); y += 58; });
      x.font = '900 40px ' + CF; x.fillStyle = '#14161F'; x.fillText(studio.name || '', W / 2, cy + ch - 50); x.textAlign = 'left';
    } else if (T === 'menu'){
      x.fillStyle = '#FBF7EE'; x.fillRect(0, 0, W, H); x.fillStyle = ACC; x.fillRect(0, 0, W, 24);
      y = tall > 1.5 ? 260 : 150;
      x.textAlign = 'center'; x.font = '700 32px ' + CF; x.fillStyle = ACC; x.fillText(c.kicker || 'MENU', W / 2, y);
      y = titleBlock(x, c, W / 2, y + 10, MW, 92, '#1F2230', 2, 'center'); x.textAlign = 'left';
      y += 70; var rows = (c.lines || []).slice(0, fmt === 'square' ? 4 : 7), gap = Math.max(92, Math.min(150, (H - 260 - y) / Math.max(1, rows.length))); y += Math.max(0, (H - 260 - y - gap * rows.length) / 3);
      rows.forEach(function(s2){
        var pr = splitPrice(s2); x.font = '700 44px ' + CF; x.fillStyle = '#1F2230'; var nm = wrap(x, pr[0], MW - 280)[0]; x.fillText(nm, L, y);
        x.textAlign = 'right'; x.font = '900 44px ' + CF; x.fillText(pr[1], W - L, y); var pw = x.measureText(pr[1]).width; x.textAlign = 'left';
        x.font = '700 44px ' + CF; var nw = x.measureText(nm).width; x.fillStyle = '#C9BFA8';
        for (var dx = L + nw + 24; dx < W - L - pw - 24; dx += 18){ x.beginPath(); x.arc(dx, y - 12, 3, 0, Math.PI * 2); x.fill(); }
        y += gap;
      });
      footer(x, c, L, H - 70, '#1F2230', 'center', W);
    } else if (T === 'pastel'){
      var gp = x.createLinearGradient(0, 0, W, H); gp.addColorStop(0, TINT); gp.addColorStop(1, '#FFF3D6'); x.fillStyle = gp; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.arc(W * .85, H * .12, 260, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(W * .1, H * .9, 200, 0, Math.PI * 2); x.fill();
      var gx = 90, gy = tall > 1.5 ? 300 : 110, gw = W - 180, gh = H - gy * 2;
      x.shadowColor = 'rgba(184,60,102,.18)'; x.shadowBlur = 60; x.shadowOffsetY = 20; x.fillStyle = 'rgba(255,255,255,.88)'; roundRect(x, gx, gy, gw, gh, 48); x.fill(); x.shadowColor = 'transparent';
      var ih = 0; if (im){ ih = Math.round(gh * .42); x.save(); roundRect(x, gx + 30, gy + 30, gw - 60, ih, 32); x.clip(); cover(x, im, gx + 30, gy + 30, gw - 60, ih); x.restore(); ih += 30; }
      y = im ? gy + ih + 60 : gy + Math.max(80, (gh - 300 - 120 * 2 - 62 * Math.min(4, (c.lines || []).length)) / 2); if (c.kicker){ pill(x, c.kicker, gx + 50, y, ACC, '#FFFFFF', 32); y += 70; }
      y = titleBlock(x, c, gx + 50, y + 10, gw - 100, im ? 76 : 96, '#1F2230', 2);
      linesBlock(x, c, gx + 50, y + 10, gw - 100, 38, '#3A3F4C', ACC, im ? 2 : 4);
      x.font = '900 38px ' + CF; x.fillStyle = '#1F2230'; x.fillText(studio.name || '', gx + 50, gy + gh - 50);
    } else {
      var GOLD = '#D9B36C'; x.fillStyle = '#14161F'; x.fillRect(0, 0, W, H);
      if (im){ cover(x, im, 0, 0, W, Math.round(H * .46)); var gn = x.createLinearGradient(0, H * .3, 0, H * .46); gn.addColorStop(0, 'rgba(20,22,31,0)'); gn.addColorStop(1, '#14161F'); x.fillStyle = gn; x.fillRect(0, 0, W, H * .46 + 2); }
      x.strokeStyle = GOLD; x.lineWidth = 2; x.strokeRect(44, 44, W - 88, H - 88);
      y = im ? H * .46 + 40 : (tall > 1.5 ? 420 : 250);
      x.textAlign = 'center'; x.font = '700 30px ' + CF; x.fillStyle = GOLD; x.fillText((c.kicker || '').split('').join(' '), W / 2, y);
      y = titleBlock(x, c, W / 2, y + 16, MW, im ? 78 : 96, '#FFFFFF', 2, 'center');
      x.fillStyle = GOLD; x.fillRect(W / 2 - 40, y + 34, 80, 3); y += 50;
      x.font = '500 38px ' + CF; x.fillStyle = '#D8D4CA'; (c.lines || []).slice(0, im ? 2 : 4).forEach(function(s2){ y += 60; x.fillText(wrap(x, s2, MW - 60)[0], W / 2, y); });
      x.textAlign = 'left'; footer(x, c, L, H - 100, GOLD, 'center', W);
    }
    return cv;
  }
  function roundRect(x, l, t, w, h, r){ x.beginPath(); x.moveTo(l+r, t); x.arcTo(l+w, t, l+w, t+h, r); x.arcTo(l+w, t+h, l, t+h, r); x.arcTo(l, t+h, l, t, r); x.arcTo(l, t, l+w, t, r); x.closePath(); }
