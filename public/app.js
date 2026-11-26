/* Konstruktionslabbet – teknik åk 7–9 (Lgr22 TK.7-9.2.3).
   Allt ritas i kod: ingen bildfil, inget typsnitt utifrån, inget spårar barnet. */
(function () {
  'use strict';
  var D = window.KDATA;
  var UPP = D.uppgifter;

  var S = {
    niva: 1, i: 0, stjarnor: 0, svarat: false, valt: null, ratt: false,
    ljud: true, sida: 9, klar: false
  };
  var duk, g, W = 0, H = 0, dpr = 1;
  var farg = {};

  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  /* ---------- ljud ---------- */
  var ac = null;
  function ljudPav() {
    if (!S.ljud) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
    } catch (e) {}
  }
  function ton(frek, dur, typ, fordr) {
    if (!S.ljud) return;
    ljudPav();
    if (!ac) return;
    var o = ac.createOscillator(), gn = ac.createGain();
    o.type = typ || 'sine'; o.frequency.value = frek;
    gn.gain.setValueAtTime(0.0001, ac.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.01);
    gn.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(gn); gn.connect(ac.destination);
    o.start(ac.currentTime + (fordr || 0));
    o.stop(ac.currentTime + (fordr || 0) + dur + 0.02);
  }
  function rättLjud() { ton(660, 0.12, 'triangle', 0); ton(880, 0.18, 'triangle', 0.11); }
  function felLjud() { ton(320, 0.22, 'sine', 0); }

  function säg(text) {
    if (!S.ljud || !text) return;
    if (window.__rost && window.__rost(text)) return;
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'sv-SE'; u.rate = 0.95; u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function tyst() {
    try { if (window.__rostStopp) window.__rostStopp(); } catch (e) {}
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {}
  }

  /* ---------- canvas ---------- */
  function storlek() {
    var ruta = document.getElementById('dukruta');
    var r = ruta.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(240, Math.round(r.width));
    H = Math.max(160, Math.round(r.height));
    duk.width = Math.round(W * dpr);
    duk.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    rita();
  }
  function rr(x, y, w, h, r) {
    g.beginPath();
    if (g.roundRect) { g.roundRect(x, y, w, h, r); return; }
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function bjälke(x1, y1, x2, y2, w, c) {
    g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
  function ring(x, y, w, h, c, lw) {
    g.strokeStyle = c; g.lineWidth = lw || 4;
    rr(x, y, w, h, Math.min(w, h) * 0.2); g.stroke();
  }

  function rita() {
    if (!g) return;
    g.clearRect(0, 0, W, H);
    var u = UPP[S.i];
    if (!u) return;
    var c = { krita: farg.krita, damp: farg.damp, accent: farg.accent, guld: farg.guld, linje: farg.linje };
    var vald = S.svarat ? u.alternativ[S.valt] : null;
    switch (u.scen) {
      case 'ram': ritaRigg(vald, c); break;
      case 'konsol': ritaKonsol(vald, c); break;
      case 'bro': ritaBro(vald, c); break;
      case 'skylt': ritaSkylt(c); break;
      case 'pelare': ritaPelare(c); break;
      case 'fackverk': ritaFackverk(c); break;
      case 'container': ritaContainer(vald, c); break;
      case 'lucka': ritaLucka(vald, c); break;
      case 'fjader': ritaFjader(vald, c); break;
    }
    if (S.svarat) { ritaDelar(u, c); }
  }

  function mark(c, y) {
    g.strokeStyle = c.linje; g.lineWidth = 3;
    g.beginPath(); g.moveTo(W * 0.08, y); g.lineTo(W * 0.92, y); g.stroke();
    for (var x = W * 0.08 + 12; x < W * 0.92; x += 24) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 9, y + 12); g.stroke();
    }
  }
  function vikt(cx, cy, b, c, lyft) {
    var w = b * 0.9, h = b * 0.62;
    g.fillStyle = c.krita; rr(cx - w / 2, cy - h - (lyft || 0), w, h, 10); g.fill();
    g.fillStyle = '#fff'; g.font = '700 ' + Math.round(b * 0.3) + 'px Helvetica, Arial';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('1000 kg', cx, cy - h / 2 - (lyft || 0));
  }
  function pilNer(cx, y, len, c) {
    g.strokeStyle = c.accent; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx, y); g.lineTo(cx, y + len); g.stroke();
    g.beginPath(); g.moveTo(cx - 9, y + len - 12); g.lineTo(cx, y + len); g.lineTo(cx + 9, y + len - 12); g.stroke();
  }

  /* struktur efter valt alternativ – används när svaret är givet */
  function struktur(cx, cy, b, ikon, skev, c) {
    g.save(); g.translate(cx, cy); g.rotate(skev || 0);
    var halv = b / 2, kol = c.accent, lw = Math.max(5, b * 0.055);
    if (ikon === 'fyrkant') {
      g.strokeStyle = kol; g.lineWidth = lw; g.lineJoin = 'round';
      g.strokeRect(-halv, -halv, b, b);
    } else if (ikon === 'snedstag') {
      g.strokeStyle = kol; g.lineWidth = lw;
      g.strokeRect(-halv, -halv, b, b);
      bjälke(-halv, halv, halv, -halv, lw, kol);
    } else if (ikon === 'kryss') {
      g.strokeStyle = kol; g.lineWidth = lw;
      g.strokeRect(-halv, -halv, b, b);
      bjälke(-halv, halv, halv, -halv, lw, kol);
      bjälke(-halv, -halv, halv, halv, lw, kol);
    } else if (ikon === 'vinkel') {
      bjälke(-halv, -halv, -halv, halv, lw, kol);
      bjälke(-halv, halv, halv, halv, lw, kol);
    } else if (ikon === 'konsol') {
      bjälke(-halv, -halv, -halv, halv, lw, kol);
      bjälke(-halv, halv, halv, halv, lw, kol);
      bjälke(-halv, -halv, halv, halv, lw, kol);
    } else if (ikon === 'triangel') {
      g.strokeStyle = kol; g.lineWidth = lw; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(-halv, halv); g.lineTo(0, -halv); g.lineTo(halv, halv); g.closePath(); g.stroke();
    }
    g.restore();
  }

  function ritaRigg(vald, c) {
    var b = Math.min(W * 0.46, H * 0.56);
    var by = H * 0.9;
    mark(c, by);
    var skev = S.svarat && !S.ratt ? 0.16 : 0;
    g.save();
    g.translate(W / 2, by);
    g.rotate(skev);
    g.translate(-W / 2, -by);
    // två stöd
    bjälke(W / 2 - b * 0.62, by, W / 2 - b * 0.48, by - b * 0.55, 8, c.damp);
    bjälke(W / 2 + b * 0.62, by, W / 2 + b * 0.48, by - b * 0.55, 8, c.damp);
    // ram
    if (vald) {
      struktur(W / 2, by - b * 0.55 - b / 2, b * 0.92, vald.ikon, 0, c);
    } else {
      ring(W / 2 - b * 0.5, by - b * 0.55 - b, b, b, c.linje, 4);
      g.fillStyle = c.damp; g.font = '600 ' + Math.round(b * 0.22) + 'px Helvetica, Arial';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('?', W / 2, by - b * 0.55 - b / 2);
    }
    // vikten ovanpå
    var topp = vald ? by - b * 0.55 - b : by - b * 1.6;
    var lyft = S.svarat && !S.ratt ? b * 0.12 : 0;
    vikt(W / 2, topp - 10 + lyft, b * 0.72, c, 0);
    g.restore();
    if (!S.svarat) pilNer(W / 2, topp - b * 0.5, b * 0.35, c);
  }

  function ritaKonsol(vald, c) {
    var b = Math.min(W * 0.38, H * 0.58);
    var vx = W * 0.2, vy0 = H * 0.16, vy1 = H * 0.92;
    g.fillStyle = c.linje; g.fillRect(vx - b * 0.16, vy0, b * 0.16, vy1 - vy0);
    var hx = vx, hy = H * 0.6;
    // hylla
    bjälke(hx, hy, hx + b * 1.1, hy, 10, S.svarat && !S.ratt ? c.accent : c.krita);
    // bok
    g.fillStyle = '#fff'; g.strokeStyle = c.krita; g.lineWidth = 3;
    rr(hx + b * 0.5, hy - b * 0.42, b * 0.42, b * 0.4, 6); g.fill(); g.stroke();
    if (vald) {
      g.save();
      if (vald.ikon === 'vinkel') {
        bjälke(hx, hy, hx, hy + b * 0.55, 9, c.accent);
        bjälke(hx, hy + b * 0.55, hx + b * 0.35, hy + b * 0.55, 9, c.accent);
      } else {
        bjälke(hx, hy, hx, hy + b * 0.55, 9, c.accent);
        bjälke(hx, hy, hx + b * 0.55, hy + b * 0.55, 9, c.accent);
        bjälke(hx, hy, hx + b * 0.55, hy + b * 0.55, 9, c.accent);
      }
      g.restore();
    }
  }

  function ritaBro(vald, c) {
    var b = Math.min(W * 0.5, H * 0.42);
    var gy = H * 0.86, left = W * 0.5 - b * 0.8, right = W * 0.5 + b * 0.8;
    g.fillStyle = c.linje;
    g.fillRect(0, gy, left - b * 0.2, H - gy);
    g.fillRect(right + b * 0.2, gy, W - right - b * 0.2, H - gy);
    // brofack
    var bx = (left + right) / 2, by = gy - b * 0.15;
    if (vald) struktur(bx, by - b / 2, b, vald.ikon, S.svarat && !S.ratt ? 0.1 : 0, c);
    // lasten
    vikt(bx + b * 0.1, by - b - 12, b * 0.6, c);
    g.strokeStyle = c.linje; g.lineWidth = 3;
  }

  function ritaSkylt(c) {
    var b = Math.min(W * 0.42, H * 0.5);
    var px = W * 0.24, py = H * 0.9;
    // stolpe
    g.fillStyle = c.linje; g.fillRect(px - b * 0.07, py - b * 0.9, b * 0.14, b * 0.9);
    // arm
    bjälke(px, py - b * 0.86, px + b * 0.62, py - b * 0.86, 12, c.krita);
    // vajer
    g.strokeStyle = c.krita; g.lineWidth = 4;
    g.beginPath(); g.moveTo(px + b * 0.62, py - b * 0.86); g.lineTo(px + b * 0.62, py - b * 0.52); g.stroke();
    // skylt
    g.fillStyle = c.accent; rr(px + b * 0.36, py - b * 0.52, b * 0.52, b * 0.3, 8); g.fill();
    g.fillStyle = '#fff'; g.font = '700 ' + Math.round(b * 0.14) + 'px Helvetica, Arial';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('SKYLT', px + b * 0.62, py - b * 0.37);
    // markering av delarna när svaret är givet
    if (S.svarat) {
      ring(px + b * 0.58, py - b * 0.9, b * 0.09, b * 0.42, S.valt === 0 ? '#3E8E5A' : c.damp, 4);
      ring(px + b * 0.02, py - b * 0.96, b * 0.6, b * 0.2, S.valt === 1 ? '#3E8E5A' : c.damp, 4);
    }
  }

  function ritaPelare(c) {
    var b = Math.min(W * 0.44, H * 0.42);
    var gy = H * 0.9, px = W * 0.5, top = gy - b * 1.2;
    mark(c, gy);
    g.fillStyle = c.krita; g.fillRect(px - b * 0.09, top, b * 0.18, gy - top);
    // brobana
    bjälke(px - b * 0.9, top, px + b * 0.9, top, 14, c.krita);
    // vajer uppifrån snedt ner till däcket
    g.strokeStyle = c.damp; g.lineWidth = 3;
    g.beginPath(); g.moveTo(px, top - b * 0.02); g.lineTo(px - b * 0.78, top); g.stroke();
    g.beginPath(); g.moveTo(px, top - b * 0.02); g.lineTo(px + b * 0.78, top); g.stroke();
    if (S.svarat) {
      ring(px - b * 0.14, top + b * 0.05, b * 0.28, gy - top - b * 0.1, S.valt === 0 ? '#3E8E5A' : c.damp, 4);
      ring(px - b * 0.8, top - b * 0.16, b * 0.72, b * 0.14, S.valt === 1 ? '#3E8E5A' : c.damp, 4);
    }
  }

  function ritaFackverk(c) {
    var b = Math.min(W * 0.62, H * 0.5);
    var cx = W / 2, cy = H * 0.5, h = b * 0.34;
    var x0 = cx - b / 2, x1 = cx + b / 2, yt = cy - h / 2, yb = cy + h / 2;
    bjälke(x0, yt, x1, yt, 12, c.krita);   // överkant
    bjälke(x0, yb, x1, yb, 12, c.krita);   // underkant
    var n = 4, i;
    for (i = 0; i <= n; i++) {
      var x = x0 + (b / n) * i;
      bjälke(x, yt, x, yb, 7, c.damp);
    }
    for (i = 0; i < n; i++) {
      var xa = x0 + (b / n) * i, xb = x0 + (b / n) * (i + 1);
      if (i % 2 === 0) bjälke(xa, yb, xb, yt, 5, c.damp);
      else bjälke(xa, yt, xb, yb, 5, c.damp);
    }
    // last
    vikt(cx, yt - 10, b * 0.34, c);
    if (S.svarat) {
      ring(x0 - 6, yt - 12, b + 12, 22, S.valt === 0 ? '#3E8E5A' : c.damp, 4);
      ring(x0 - 6, yb - 10, b + 12, 22, S.valt === 1 ? '#3E8E5A' : c.damp, 4);
    }
  }

  function ritLinje(cx, y0, y1, vald, c) {
    var ik = vald ? vald.ikon : 'stal';
    if (ik === 'gummi') {
      g.strokeStyle = c.accent; g.lineWidth = 7; g.lineJoin = 'round';
      g.beginPath();
      for (var y = y0; y <= y1; y += 8) {
        var xx = cx + (Math.round((y - y0) / 8) % 2 ? 9 : -9);
        if (y === y0) g.moveTo(cx, y); else g.lineTo(xx, y);
      }
      g.stroke();
    } else if (ik === 'glas') {
      g.strokeStyle = '#8FB6C6'; g.lineWidth = 7;
      g.beginPath(); g.moveTo(cx, y0); g.lineTo(cx, y1); g.stroke();
    } else {
      g.strokeStyle = c.krita; g.lineWidth = 4;
      g.beginPath(); g.moveTo(cx, y0); g.lineTo(cx, y1); g.stroke();
      g.strokeStyle = c.damp; g.lineWidth = 2;
      g.beginPath(); g.moveTo(cx - 2, y0); g.lineTo(cx + 2, y1); g.stroke();
    }
  }

  function ritaContainer(vald, c) {
    var b = Math.min(W * 0.46, H * 0.5);
    var cx = W / 2, top = H * 0.1;
    g.strokeStyle = c.krita; g.lineWidth = 6;
    g.beginPath(); g.arc(cx, top, 12, Math.PI * 0.15, Math.PI * 0.85, true); g.stroke();
    ritLinje(cx, top + 10, top + b * 0.7, vald, c);
    g.fillStyle = c.accent; rr(cx - b * 0.5, top + b * 0.7, b, b * 0.6, 8); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3;
    for (var i = 1; i < 4; i++) {
      g.beginPath(); g.moveTo(cx - b * 0.5 + (b / 4) * i, top + b * 0.75);
      g.lineTo(cx - b * 0.5 + (b / 4) * i, top + b * 1.25); g.stroke();
    }
    vikt(cx, H * 0.95, b * 0.4, c);
    g.strokeStyle = c.linje; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx, top + b * 1.3); g.lineTo(cx, H * 0.95 - b * 0.35); g.stroke();
  }

  function ritaLucka(vald, c) {
    var b = Math.min(W * 0.6, H * 0.46);
    var cx = W / 2, cy = H * 0.55;
    g.strokeStyle = c.linje; g.lineWidth = 14;
    g.beginPath(); g.moveTo(cx - b / 2, cy - b * 0.35); g.lineTo(cx - b / 2, cy + b * 0.35);
    g.lineTo(cx + b / 2, cy + b * 0.35); g.lineTo(cx + b / 2, cy - b * 0.35); g.stroke();
    bjälke(cx - b / 2, cy - b * 0.35, cx + b / 2, cy - b * 0.35, 14, c.linje);
    // luckan
    var ik = vald ? vald.ikon : 'gummi';
    g.save(); g.translate(cx, cy);
    if (ik === 'gummi') {
      g.strokeStyle = c.accent; g.lineWidth = 12; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-b * 0.5, 0);
      g.bezierCurveTo(-b * 0.25, -14, b * 0.25, 14, b * 0.5, 0); g.stroke();
    } else if (ik === 'glas') {
      g.fillStyle = 'rgba(143,182,198,.5)'; g.strokeStyle = '#8FB6C6'; g.lineWidth = 3;
      g.fillRect(-b * 0.5, -8, b, 16); g.strokeRect(-b * 0.5, -8, b, 16);
    } else {
      g.fillStyle = c.damp; g.fillRect(-b * 0.5, -9, b, 18);
    }
    g.restore();
    // vattendroppar ovanför
    g.fillStyle = 'rgba(90,150,180,.45)';
    for (var i = 0; i < 5; i++) {
      var x = cx - b * 0.4 + i * b * 0.2;
      g.beginPath(); g.ellipse(x, cy - b * 0.55 + (i % 2) * 12, 4, 6, 0, 0, Math.PI * 2); g.fill();
    }
  }

  function ritaFjader(vald, c) {
    var b = Math.min(W * 0.5, H * 0.46);
    var cx = W / 2, gy = H * 0.9;
    mark(c, gy);
    g.fillStyle = c.linje; g.fillRect(cx - b * 0.6, gy - 10, b * 1.2, 12);
    var ik = vald ? vald.ikon : 'stal';
    var topp = gy - b * 0.75;
    if (ik === 'stal') {
      g.strokeStyle = c.accent; g.lineWidth = 7; g.lineJoin = 'round';
      g.beginPath();
      for (var i = 0; i <= 8; i++) {
        var y = topp + ((gy - 12 - topp) / 8) * i;
        var x = cx + (i % 2 ? b * 0.22 : -b * 0.22);
        if (i === 0) g.moveTo(cx, y); else g.lineTo(x, y);
      }
      g.stroke();
    } else if (ik === 'lera') {
      g.fillStyle = '#B08968'; rr(cx - b * 0.28, topp, b * 0.56, gy - 12 - topp, 14); g.fill();
    } else {
      g.fillStyle = 'rgba(143,182,198,.5)'; g.strokeStyle = '#8FB6C6'; g.lineWidth = 3;
      rr(cx - b * 0.24, topp, b * 0.48, gy - 12 - topp, 6); g.fill(); g.stroke();
    }
    // pressplatta + pil ner
    g.fillStyle = c.krita; rr(cx - b * 0.42, topp - b * 0.28, b * 0.84, b * 0.22, 8); g.fill();
    pilNer(cx, topp - b * 0.78, b * 0.42, c);
  }

  function ritaDelar(u, c) {}
  function ritaDelar2(u, c) {}

  /* ---------- ikoner till svarsknapparna ---------- */
  function ikon(namn) {
    var A = 'var(--accent)';
    function st(inner) { return '<svg viewBox="0 0 80 60" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>'; }
    switch (namn) {
      case 'fyrkant': return st('<rect x="20" y="12" width="40" height="36" rx="2" stroke="' + A + '" stroke-width="5"/>');
      case 'snedstag': return st('<rect x="20" y="12" width="40" height="36" rx="2" stroke="' + A + '" stroke-width="5"/><path d="M20 48 L60 12" stroke="' + A + '" stroke-width="5"/>');
      case 'kryss': return st('<rect x="20" y="12" width="40" height="36" rx="2" stroke="' + A + '" stroke-width="5"/><path d="M20 48 L60 12 M20 12 L60 48" stroke="' + A + '" stroke-width="5"/>');
      case 'vinkel': return st('<path d="M24 10 L24 48 L62 48" stroke="' + A + '" stroke-width="6"/>');
      case 'konsol': return st('<path d="M24 10 L24 48 L62 48 Z" stroke="' + A + '" stroke-width="6"/>');
      case 'vajer': return st('<path d="M40 6 L40 44" stroke="' + A + '" stroke-width="4"/><path d="M34 44 h12" stroke="' + A + '" stroke-width="6"/><circle cx="40" cy="8" r="4" stroke="' + A + '" stroke-width="4"/>');
      case 'balk': return st('<rect x="12" y="26" width="56" height="12" rx="3" stroke="' + A + '" stroke-width="5"/>');
      case 'pelare': return st('<rect x="32" y="8" width="16" height="44" rx="3" stroke="' + A + '" stroke-width="5"/><path d="M16 8 h48" stroke="' + A + '" stroke-width="5"/>');
      case 'gummi': return st('<path d="M14 34 C24 14 34 50 44 30 C52 16 62 40 68 26" stroke="' + A + '" stroke-width="6"/>');
      case 'stal': return st('<path d="M20 12 C40 12 40 30 20 30 C40 30 40 48 20 48" stroke="' + A + '" stroke-width="5"/><path d="M60 12 C40 12 40 30 60 30 C40 30 40 48 60 48" stroke="' + A + '" stroke-width="5"/>');
      case 'glas': return st('<rect x="20" y="10" width="40" height="40" rx="3" stroke="' + A + '" stroke-width="4" fill="rgba(143,182,198,.35)"/><path d="M28 42 L44 18" stroke="' + A + '" stroke-width="3"/>');
      case 'lera': return st('<path d="M22 46 C16 34 28 26 34 30 C38 18 56 22 58 34 C68 38 62 50 50 48 Z" stroke="' + A + '" stroke-width="5"/>');
    }
    return st('');
  }

  /* ---------- spel ---------- */
  function nivaUppgifter(n) { return UPP.filter(function (u) { return u.niva === n; }); }

  function visa() {
    var u = UPP[S.i];
    if (!u) return;
    S.svarat = false; S.valt = null; S.ratt = false;
    document.getElementById('niva').textContent = 'Nivå ' + u.niva;
    document.getElementById('framsteg').textContent = (S.i + 1) + ' / ' + UPP.length;
    var f = document.getElementById('fraga');
    f.textContent = u.fraga;
    var rad = document.getElementById('svar');
    rad.innerHTML = '';
    u.alternativ.forEach(function (a, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'svarsknapp';
      b.setAttribute('aria-label', a.text);
      b.dataset.idx = idx;
      b.innerHTML = ikon(a.ikon) + '<span>' + a.text + '</span>';
      b.addEventListener('click', function () { svara(idx); });
      rad.appendChild(b);
    });
    var st = document.getElementById('svarstext');
    st.hidden = true; st.textContent = '';
    rita();
    säg(u.fraga);
    if (window.skolappar && window.skolappar.event) {
      try { window.skolappar.event('level', u.niva); } catch (e) {}
    }
  }

  function svara(idx) {
    if (S.svarat) return;
    var u = UPP[S.i];
    S.svarat = true; S.valt = idx; S.ratt = idx === u.ratt;
    var knappar = document.querySelectorAll('.svarsknapp');
    Array.prototype.forEach.call(knappar, function (b, i) {
      b.disabled = true;
      if (i === u.ratt) b.classList.add('rattsvar');
      else if (i === idx) b.classList.add('felsvar');
    });
    var st = document.getElementById('svarstext');
    st.hidden = false;
    if (S.ratt) {
      S.stjarnor++;
      document.getElementById('stjarnor').textContent = '★ ' + S.stjarnor;
      st.textContent = 'Rätt! ' + u.forklaring;
      rättLjud(); säg('Rätt! ' + u.forklaring);
    } else {
      st.textContent = 'Nästan. ' + u.forklaring;
      felLjud(); säg('Nästan. ' + u.forklaring);
    }
    var rad = document.getElementById('svar');
    var nk = document.createElement('button');
    nk.type = 'button';
    nk.className = 'spela';
    nk.style.cssText = 'flex:1 1 100%;max-width:none;min-height:60px;font-size:19px;margin-top:2px';
    nk.textContent = (S.i + 1 < UPP.length && UPP[S.i + 1].niva === u.niva) ? 'Nästa' : 'Fortsätt';
    nk.addEventListener('click', nasta);
    rad.appendChild(nk);
    rita();
  }

  function nasta() {
    var u = UPP[S.i];
    var kvar = UPP.slice(S.i + 1).filter(function (x) { return x.niva === u.niva; });
    if (kvar.length) { S.i++; visa(); return; }
    // nivån klar
    var sista = !UPP.slice(S.i + 1).length;
    document.getElementById('klar-rubrik').textContent = sista ? 'Alla nivåer klara!' : 'Nivå ' + u.niva + ' klar';
    document.getElementById('klar-text').textContent = sista
      ? 'Du har byggt stadigt hela vägen: ' + S.stjarnor + ' av ' + UPP.length + ' stjärnor.'
      : D.nivaNamn[u.niva] + ' – ' + S.stjarnor + ' stjärnor så här långt.';
    document.getElementById('nasta').textContent = sista ? 'Spela igen' : 'Nästa nivå';
    document.getElementById('klarskarm').hidden = false;
    if (window.skolappar && window.skolappar.event) {
      try {
        window.skolappar.event('round_done', Math.round(100 * S.stjarnor / UPP.length));
      } catch (e) {}
    }
    if (sista) säg('Alla nio uppgifter klara! Nu vet du varför trianglar håller och vilka material som tål vad.');
  }

  function starta(n) {
    S.niva = n || 1;
    S.i = UPP.findIndex(function (u) { return u.niva === S.niva; });
    if (S.i < 0) S.i = 0;
    document.getElementById('klarskarm').hidden = true;
    visa();
  }

  function startaOm() {
    S.stjarnor = 0;
    document.getElementById('stjarnor').textContent = '★ 0';
    starta(1);
  }

  function bind() {
    duk = document.getElementById('duk');
    g = duk.getContext('2d');
    farg.krita = css('--krita') || '#2E2A26';
    farg.damp = css('--damp') || '#6B635A';
    farg.accent = css('--accent') || '#C9622D';
    farg.guld = css('--guld') || '#E0A526';
    farg.linje = css('--linje') || '#E4DCCD';

    document.getElementById('starta').addEventListener('click', function () {
      document.getElementById('startskarm').hidden = true;
      ljudPav();
      if (window.skolappar && window.skolappar.event) {
        try { window.skolappar.event('round_start'); } catch (e) {}
      }
      starta(1);
      if (window.__rost) { try { window.__rost('Konstruktionslabbet. Bygg stadigt – välj den ram och det material som håller.'); } catch (e) {} }
    });
    document.getElementById('nasta').addEventListener('click', function () {
      var sista = document.getElementById('nasta').textContent === 'Spela igen';
      if (sista) { startaOm(); return; }
      var u = UPP[S.i];
      S.i++;
      var nästaNiva = UPP[S.i] ? UPP[S.i].niva : u.niva;
      document.getElementById('klarskarm').hidden = true;
      visa();
      säg(D.nivaNamn[nästaNiva] + '.');
    });
    document.getElementById('stangKlar').addEventListener('click', function () {
      document.getElementById('klarskarm').hidden = true;
    });
    var lk = document.getElementById('ljudknapp');
    lk.addEventListener('click', function () {
      S.ljud = !S.ljud;
      lk.textContent = S.ljud ? '🔊' : '🔇';
      lk.setAttribute('aria-label', S.ljud ? 'Stäng av ljudet' : 'Sätt på ljudet');
      if (!S.ljud) {
        tyst();
        if (window.skolappar && window.skolappar.event) {
          try { window.skolappar.event('sound_off'); } catch (e) {}
        }
      }
    });
    window.addEventListener('resize', storlek);
    window.addEventListener('orientationchange', function () { setTimeout(storlek, 250); });
    if (window.ResizeObserver) {
      try { new ResizeObserver(function () { storlek(); }).observe(document.getElementById('dukruta')); } catch (e) {}
    }
    document.addEventListener('pointerdown', function () { ljudPav(); }, { once: true });
    storlek();
  }

  window.__labb = {
    S: S, uppgifter: UPP, visa: visa, svara: svara, starta: starta,
    nasta: nasta, rita: rita, storlek: storlek
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();