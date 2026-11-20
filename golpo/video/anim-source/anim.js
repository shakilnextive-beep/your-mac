/* কাঁধের ভার — Anime Watercolor animation. render(t) draws one frame. */
const W = 1280, H = 720, LW = 1640, MARGIN = 180;
const TOTAL = 171;
const FONT = '"Baloo Da 2", sans-serif';
const INK = '#2a2440';
let MODE = 'h', OW = 1280, OH = 720;

/* ---------- utils ---------- */
function rand(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const ease = { io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, out: k => 1 - Math.pow(1 - k, 3), sine: k => -(Math.cos(Math.PI * k) - 1) / 2 };
const tw = (t, a, b, e = ease.io) => e(prog(t, a, b));
function canvas(w = LW, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function wash(c, pts, col, edge, seed, passes = 5, wob = 10, alpha = .2) {
  for (let p = 0; p < passes; p++) {
    c.beginPath(); pts.forEach(([x, y], i) => { const jx = (rand(seed + i * 7 + p * 131) - .5) * wob, jy = (rand(seed + i * 11 + p * 97) - .5) * wob; i ? c.lineTo(x + jx, y + jy) : c.moveTo(x + jx, y + jy); });
    c.closePath(); c.globalAlpha = alpha; c.fillStyle = col; c.fill();
  }
  if (edge) { c.globalAlpha = .22; c.strokeStyle = edge; c.lineWidth = 2.5; c.stroke(); }
  c.globalAlpha = 1;
}
const blob = (cx, cy, rx, ry, n = 24, seed = 1, k = .18) => Array.from({ length: n }, (_, i) => { const a = i / n * 6.283, r = 1 + (rand(seed + i) - .5) * k; return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]; });
function rectP(x, y, w, h, n = 4) { const p = []; for (let i = 0; i < n; i++) p.push([x + w * i / n, y]); for (let i = 0; i < n; i++) p.push([x + w, y + h * i / n]); for (let i = 0; i < n; i++) p.push([x + w - w * i / n, y + h]); for (let i = 0; i < n; i++) p.push([x, y + h - h * i / n]); return p; }
function ridge(x0, x1, y, amp, seed, step = 30, bottom = H + 20) { const p = [[x0, bottom]]; for (let x = x0; x <= x1 + step; x += step) { const n = Math.sin(x * 0.004 + seed) * amp * .6 + Math.sin(x * 0.011 + seed * 2) * amp * .3 + (rand(seed + x) - .5) * amp * .2; p.push([x, y - n]); } p.push([x1 + step, bottom]); return p; }
function grad(c, w, h, stops, x0 = 0, y0 = 0, x1 = 0, y1 = h) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, w, h); }
function glow(c, x, y, r, col, a = 1, mode = 'screen') { c.save(); c.globalCompositeOperation = mode; c.globalAlpha = a; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }

/* ---------- painted elements ---------- */
function sky(c, stops, seed = 1, band = 'rgba(255,255,255,1)') {
  grad(c, LW, H, stops);
  for (let i = 0; i < 5; i++) { const y = 60 + i * 90 + rand(seed + i) * 40; wash(c, rectP(-20, y, LW + 40, 50 + rand(seed + i * 3) * 40, 12), band, null, seed + i * 9, 3, 30, .04); }
}
function cumulus(c, cx, cy, s, seed, lit = '#ffffff', shade = '#aba6de') {
  for (let i = 0; i < 6; i++) { const x = cx + (i - 2.5) * s * .26 + (rand(seed + i) - .5) * s * .1; wash(c, blob(x, cy + s * .1, s * .24, s * .1, 20, seed + i * 3), shade, null, seed + i, 4, 8); }
  const puffs = [[0, -.25, .34], [-.32, -.08, .26], [.33, -.06, .27], [-.16, -.47, .25], [.16, -.52, .23], [0, -.74, .19], [-.52, .05, .18], [.54, .06, .17], [-.34, -.32, .17], [.36, -.3, .18]];
  puffs.forEach(([dx, dy, r], i) => { wash(c, blob(cx + dx * s, cy + dy * s, r * s, r * s * .86, 24, seed + 10 + i), shade, null, seed + 40 + i, 2, 10); });
  puffs.forEach(([dx, dy, r], i) => { wash(c, blob(cx + dx * s - r * s * .1, cy + dy * s - r * s * .12, r * s * .9, r * s * .76, 24, seed + 20 + i), lit, null, seed + 60 + i, 5, 10); });
}
function tree(c, x, y, r, seed, dark = '#2f7d4f', light = '#7cc36a', trunk = '#6b4a3a') {
  wash(c, rectP(x - r * .08, y - r * .7, r * .16, r * .72, 2), trunk, null, seed, 4, 4);
  [[0, -1.2, 1], [-.62, -.9, .7], [.62, -.95, .72], [-.26, -1.62, .62], [.3, -1.56, .64]].forEach(([dx, dy, k], i) => wash(c, blob(x + dx * r, y + dy * r, k * r, k * r * .9, 22, seed + i), dark, null, seed + i * 5, 4, 8));
  [[-.22, -1.38, .55], [.25, -1.22, .5], [-.52, -1.02, .4]].forEach(([dx, dy, k], i) => wash(c, blob(x + dx * r, y + dy * r, k * r, k * r * .85, 20, seed + 30 + i), light, null, seed + 50 + i, 3, 7));
}
function palm(c, x, y, h, seed, col = '#2f6e4c', trunk = '#7a5a44') {
  const tx = x + h * .12, ty = y - h;
  c.save(); c.strokeStyle = trunk; c.lineCap = 'round';
  for (let p = 0; p < 4; p++) { c.globalAlpha = .3; c.lineWidth = h * .05; c.beginPath(); c.moveTo(x + p, y); c.quadraticCurveTo(x - h * .05, y - h * .5, tx, ty); c.stroke(); }
  c.restore();
  for (let i = 0; i < 8; i++) { const a = -Math.PI + i / 7 * Math.PI + (rand(seed + i) - .5) * .3, L = h * (.45 + rand(seed + i * 3) * .15); const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .55 + L * .35; const mx = tx + Math.cos(a) * L * .5, my = ty + Math.sin(a) * L * .5 - L * .08; wash(c, [[tx, ty], [mx, my - L * .08], [ex, ey], [mx, my + L * .1]], col, null, seed + i * 13, 4, 6); }
}
function house(c, x, y, w, h, seed, o = {}) {
  wash(c, rectP(x, y - h, w, h, 3), o.wall || '#e9cfa3', null, seed, 5, 6);
  wash(c, rectP(x, y - h, w, h * .12, 3), 'rgba(80,50,60,1)', null, seed + 7, 2, 4);
  wash(c, [[x - w * .08, y - h], [x + w * .5, y - h - h * .55], [x + w * 1.08, y - h]], o.roof || '#b0473a', null, seed + 1, 5, 6);
  wash(c, rectP(x + w * .12, y - h * .64, w * .2, h * .64, 2), '#6b4a3a', null, seed + 2, 4, 4);
  wash(c, rectP(x + w * .55, y - h * .72, w * .28, h * .32, 2), o.win || '#ffd27a', null, seed + 3, 5, 3);
  c.save(); c.globalAlpha = .45; c.strokeStyle = '#4a3340'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { const bx = x + w * .55 + w * .28 * i / 4; c.beginPath(); c.moveTo(bx, y - h * .72); c.lineTo(bx, y - h * .4); c.stroke(); } c.restore();
}
function grassStrokes(c, y0, y1, n, seed, col) { c.save(); c.strokeStyle = col; c.lineCap = 'round'; for (let i = 0; i < n; i++) { const x = rand(seed + i) * LW, y = lerp(y0, y1, rand(seed + i * 3)), h = 8 + rand(seed + i * 5) * 16; c.globalAlpha = .25 + rand(seed + i * 7) * .25; c.lineWidth = 1.5 + rand(i) * 1.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - h * .6, x + (rand(seed + i * 9) - .3) * 8, y - h); c.stroke(); } c.restore(); }
function mountains(c, y, col, seed, amp = 90) { wash(c, ridge(-40, LW + 40, y, amp, seed, 40), col, null, seed, 5, 12); }
function stars(c, n, seed, ymax = H * .7) { for (let i = 0; i < n; i++) { const x = rand(seed + i) * LW, y = rand(seed + i * 3) * ymax, r = .6 + rand(seed + i * 7) * 1.4; c.globalAlpha = .4 + rand(seed + i * 5) * .6; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.globalAlpha = 1; }

/* interior wall */
function room(c, base, seed) {
  grad(c, LW, H, [[0, base[0]], [1, base[1]]]);
  for (let i = 0; i < 9; i++) wash(c, blob(rand(seed + i) * LW, rand(seed + i * 2) * H * .8, 220 + rand(i) * 200, 140 + rand(i * 3) * 120, 22, seed + i), base[2], null, seed + i * 3, 3, 30, .07);
  wash(c, rectP(-20, H * .74, LW + 40, H * .3, 8), base[3], null, seed + 50, 5, 8);
}
function windowFrame(c, x, y, w, h, seed, outside) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); outside(c, x, y, w, h); c.restore();
  wash(c, rectP(x - 18, y - 18, w + 36, 18, 4), '#6b4a3a', null, seed, 5, 3); wash(c, rectP(x - 18, y + h, w + 36, 22, 4), '#6b4a3a', null, seed + 1, 5, 3);
  wash(c, rectP(x - 18, y, 18, h, 3), '#6b4a3a', null, seed + 2, 5, 3); wash(c, rectP(x + w, y, 18, h, 3), '#6b4a3a', null, seed + 3, 5, 3);
  c.save(); c.strokeStyle = '#2a2440'; c.globalAlpha = .75; c.lineWidth = 4; for (let i = 1; i < 6; i++) { const bx = x + w * i / 6; c.beginPath(); c.moveTo(bx, y); c.lineTo(bx, y + h); c.stroke(); } c.restore();
}
function desk(c, x, y, w, seed) {
  wash(c, rectP(x, y, w, 22, 6), '#8a5a3c', null, seed, 5, 3);
  wash(c, rectP(x + 14, y + 22, 16, 200, 2), '#6b4a3a', null, seed + 1, 5, 3); wash(c, rectP(x + w - 30, y + 22, 16, 200, 2), '#6b4a3a', null, seed + 2, 5, 3);
  wash(c, rectP(x + 10, y + 50, w - 20, 10, 4), '#6b4a3a', null, seed + 3, 3, 3);
}
function bookStack(c, x, y, n, seed) { const cols = ['#b0473a', '#2f5fa8', '#e9c46a', '#4f8f6a', '#7a5ca8']; let yy = y; for (let i = 0; i < n; i++) { const w = 120 + rand(seed + i) * 40, h = 16 + rand(seed + i * 3) * 8; wash(c, rectP(x - w / 2 + (rand(seed + i * 5) - .5) * 14, yy - h, w, h, 3), cols[i % 5], null, seed + i * 7, 5, 2); wash(c, rectP(x - w / 2 + 6, yy - h + 3, w - 16, 3, 3), '#fff3dc', null, seed + i * 9, 3, 1); yy -= h + 1; } }

/* ---------- crisp cel figures ---------- */
function limb(c, pts, w, col) { c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.strokeStyle = INK; c.lineWidth = w + 4; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke(); c.restore(); }
function fillOut(c, path, col, shade) { c.save(); c.beginPath(); path(c); c.fillStyle = col; c.fill(); if (shade) { c.clip(); c.fillStyle = shade; c.fillRect(shade === true ? 0 : -9999, -9999, 0, 0); } c.lineWidth = 2.4; c.strokeStyle = INK; c.beginPath(); path(c); c.stroke(); c.restore(); }
function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function shadeRect(c, path, x, y, w, h) { c.save(); c.beginPath(); path(c); c.clip(); c.fillStyle = 'rgba(40,30,90,.22)'; c.fillRect(x, y, w, h); c.restore(); }
function head(c, x, y, r, f, o) {
  const skin = o.skin || '#f1c7a0', hair = o.hair || '#2b2233';
  if (o.female) { c.save(); c.beginPath(); c.arc(x - f * r * .85, y - r * .25, r * .42, 0, 7); c.fillStyle = hair; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke(); c.restore(); }
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = skin; c.fill(); c.clip(); c.fillStyle = 'rgba(160,80,90,.18)'; c.fillRect(x - f * r * 1.2 - (f < 0 ? 0 : 0), y - r, -f * r * 0.0 + (f > 0 ? -r * .5 : r * .5), r * 2); c.restore();
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke(); c.restore();
  // hair cap covering the back of the head
  c.save(); c.beginPath(); if (o.look === 'up') { c.arc(x - f * r * .15, y + r * .1, r * 1.04, Math.PI * (f > 0 ? .55 : -.55) + (f > 0 ? 0 : Math.PI), Math.PI * (f > 0 ? 1.75 : .25) + (f > 0 ? 0 : Math.PI) ); }
  else if (o.back) { c.arc(x, y, r * 1.05, 0, 7); }
  else { c.ellipse(x - f * r * .18, y - r * .25, r * 1.05, r * .85, 0, Math.PI, Math.PI * 2); c.lineTo(x - f * r * 1.02, y + r * .45); c.lineTo(x - f * r * .4, y + r * .05); }
  c.closePath(); c.fillStyle = hair; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke(); c.restore();
  if (!o.back && o.look !== 'up') { c.fillStyle = INK; c.beginPath(); c.ellipse(x + f * r * .45, y + r * .05, r * .08, r * .14, 0, 0, 7); c.fill(); c.globalAlpha = .35; c.fillStyle = '#e8706a'; c.beginPath(); c.ellipse(x + f * r * .35, y + r * .38, r * .16, r * .08, 0, 0, 7); c.fill(); c.globalAlpha = 1; }
}
/* person: x,y = feet on ground, s = height in px. pose: stand | walk | sit | floor */
function person(c, x, y, s, o = {}) {
  const f = o.face || 1, top = o.top || '#f4f1ea', bot = o.bottom || '#2f4f8f', skin = o.skin || '#f1c7a0';
  const hr = s * (o.child ? .1 : .085);
  if (o.pose === 'sit' || o.pose === 'floor') {
    const seat = o.pose === 'sit' ? s * .27 : s * .04, hipY = y - seat, hipX = x;
    const knee = [hipX + f * s * .2, hipY - s * .01];
    if (o.pose === 'sit') limb(c, [[hipX, hipY], knee, [knee[0] + f * s * .02, y]], s * .075, bot);
    else limb(c, [[hipX, hipY], knee, [knee[0] - f * s * .12, hipY + s * .03]], s * .075, bot);
    const shY = hipY - s * .3, shX = hipX + f * s * (o.lean || .03);
    const tor = cc => { rr(cc, Math.min(shX, hipX) - s * .085, shY, s * .17 + Math.abs(shX - hipX), hipY - shY + s * .03, s * .06); };
    if (o.female) { fillOut(c, cc => { cc.moveTo(shX - s * .09, shY + s * .02); cc.lineTo(shX + s * .09, shY + s * .02); cc.lineTo(hipX + f * s * .26, hipY + s * .03); cc.lineTo(hipX - f * s * .12, hipY + s * .05); cc.closePath(); }, top); shadeRect(c, cc => { cc.moveTo(shX - s * .09, shY + s * .02); cc.lineTo(shX + s * .09, shY + s * .02); cc.lineTo(hipX + f * s * .26, hipY + s * .03); cc.lineTo(hipX - f * s * .12, hipY + s * .05); cc.closePath(); }, f > 0 ? shX - s * .3 : shX + s * .02, shY - 10, s * .28, s * .5); }
    else { fillOut(c, tor, top); shadeRect(c, tor, f > 0 ? shX - s * .2 : shX + s * .03, shY - 5, s * .17, s * .45); }
    const hand = o.hand || [shX + f * s * .26, hipY - s * .1];
    limb(c, [[shX, shY + s * .05], [lerp(shX, hand[0], .5), lerp(shY, hand[1], .5) + s * .06], hand], s * .055, o.sleeve || top);
    c.fillStyle = skin; c.beginPath(); c.arc(hand[0], hand[1], s * .03, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    head(c, shX + f * s * .02 + (o.headDx || 0), shY - hr * .95 + (o.headDy || 0), hr, o.lookF || f, o);
    return;
  }
  const hipY = y - s * .46, ph = o.phase || 0, sw = o.pose === 'walk' ? Math.sin(ph) * s * .11 : 0;
  if (!o.female) { limb(c, [[x - s * .03, hipY], [x - s * .03 - sw * .6, hipY + s * .22], [x - s * .03 - sw, y]], s * .07, bot); limb(c, [[x + s * .03, hipY], [x + s * .03 + sw * .6, hipY + s * .22], [x + s * .03 + sw, y]], s * .07, bot); }
  const shY = y - s * .8, tw0 = s * .2;
  const body = o.female ? (cc => { cc.moveTo(x - tw0 * .5, shY + s * .02); cc.lineTo(x + tw0 * .5, shY + s * .02); cc.lineTo(x + s * .17, y); cc.lineTo(x - s * .17, y); cc.closePath(); }) : (cc => rr(cc, x - tw0 / 2, shY, tw0, hipY - shY + s * .05, s * .07));
  fillOut(c, body, top); shadeRect(c, body, f > 0 ? x - s * .3 : x + s * .01, shY - 5, s * .29, s);
  if (o.female) { c.save(); c.beginPath(); c.moveTo(x - f * tw0 * .5, shY + s * .03); c.quadraticCurveTo(x + f * s * .05, shY + s * .2, x + f * s * .16, y - s * .3); c.lineWidth = s * .05; c.strokeStyle = o.border || '#b0473a'; c.globalAlpha *= .9; c.stroke(); c.restore(); }
  if (o.bag) { const bs = o.bag; fillOut(c, cc => rr(cc, x - f * s * .1 - f * s * .14 * bs - s * .08 * bs, shY + s * .02, s * .2 * bs, s * .26 * bs, s * .05), o.bagCol || '#b0473a'); }
  const armSw = o.pose === 'walk' ? -sw * .8 : 0;
  const hand = o.hand || [x + f * s * .04 + armSw, hipY + s * .02];
  limb(c, [[x + f * s * .02, shY + s * .05], [lerp(x, hand[0], .6), lerp(shY, hand[1], .55)], hand], s * .055, o.sleeve || top);
  c.fillStyle = skin; c.beginPath(); c.arc(hand[0], hand[1], s * .028, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  if (o.hand2) { limb(c, [[x - f * s * .02, shY + s * .05], o.hand2], s * .05, o.sleeve || top); }
  head(c, x + (o.headDx || 0), shY - hr * .9 + (o.headDy || 0), hr, o.lookF || f, o);
}
function lantern(c, x, y, s, t) {
  const fl = .85 + .1 * Math.sin(t * 9) + .05 * Math.sin(t * 23);
  glow(c, x, y - s * .55, s * 9, 'rgba(255,190,90,.55)', fl, 'screen');
  glow(c, x, y - s * .55, s * 3, 'rgba(255,230,160,.9)', fl, 'screen');
  c.save(); c.lineWidth = 2.2; c.strokeStyle = INK;
  c.beginPath(); rr(c, x - s * .42, y - s * .18, s * .84, s * .18, s * .05); c.fillStyle = '#3d3a4a'; c.fill(); c.stroke();
  c.beginPath(); c.ellipse(x, y - s * .55, s * .32, s * .4, 0, 0, 7); c.fillStyle = `rgba(255,214,130,${.8 * fl})`; c.fill(); c.stroke();
  c.beginPath(); c.ellipse(x, y - s * .55, s * .07, s * .15 * fl, 0, 0, 7); c.fillStyle = '#fff6d8'; c.fill();
  c.beginPath(); rr(c, x - s * .3, y - s * 1.02, s * .6, s * .12, s * .04); c.fillStyle = '#3d3a4a'; c.fill(); c.stroke();
  c.beginPath(); c.arc(x, y - s * 1.0, s * .3, Math.PI, 0); c.stroke();
  c.restore();
}

/* ---------- shots ---------- */
const SHOTS = [];
function shot(t0, t1, o) { SHOTS.push(Object.assign({ t0, t1, drift: 120, zoom: [1, 1.04] }, o)); }
// a layer is drawn at x = -MARGIN - camX*par
function lx(par, camX) { return -MARGIN - camX * par; }

/* 1. dusk village (0 - 8.7) */
shot(0, 8.77, {
  drift: 150,
  setup() {
    const sk = canvas(); const c = sk.getContext('2d');
    sky(c, [[0, '#26397f'], [.4, '#6c63b5'], [.72, '#ef9b7c'], [1, '#ffd6a0']], 3);
    cumulus(c, 520, 300, 300, 11, '#ffd9c8', '#8f82c8'); cumulus(c, 1240, 250, 230, 23, '#ffe0cf', '#9488cc');
    const far = canvas(); const f = far.getContext('2d');
    mountains(f, 470, '#7270b3', 5, 70);
    // mosque silhouette
    wash(f, blob(1280, 405, 46, 40, 24, 3), '#5c5a9a', null, 4, 5, 4); wash(f, rectP(1232, 405, 96, 60, 3), '#5c5a9a', null, 5, 5, 4); wash(f, rectP(1352, 330, 16, 135, 2), '#5c5a9a', null, 6, 5, 3); wash(f, blob(1360, 326, 12, 14, 16, 7), '#5c5a9a', null, 8, 5, 3);
    const mid = canvas(); const m = mid.getContext('2d');
    wash(m, ridge(-40, LW + 40, 540, 40, 9, 40), '#3f7f64', null, 9, 5, 10);
    tree(m, 160, 540, 70, 31, '#2b6a4f', '#5fa86a'); palm(m, 330, 545, 210, 41); palm(m, 1460, 545, 230, 42); tree(m, 1560, 545, 80, 33, '#2b6a4f', '#5fa86a');
    house(m, 980, 552, 250, 120, 51, { roof: '#9c3f36', wall: '#e3c49a', win: '#ffcf70' });
    tree(m, 1290, 548, 60, 35, '#2b6a4f', '#5fa86a');
    const near = canvas(); const n = near.getContext('2d');
    wash(n, ridge(-40, LW + 40, 600, 18, 13, 40), '#5c9c55', null, 13, 5, 10); grassStrokes(n, 600, 720, 500, 3, '#2f6e3c');
    wash(n, ridge(-40, LW + 40, 690, 25, 17, 40), '#3d7a45', null, 17, 5, 10);
    return { layers: [[sk, .1], [far, .3], [mid, .55], [near, 1]] };
  },
  draw(c, lt, d, S, camX) {
    // window glow brightens when mother calls
    const wx = 980 + 250 * .69 + lx(.55, camX), wy = 552 - 120 * .56;
    glow(c, wx, wy, 120, 'rgba(255,200,110,.6)', .5 + .5 * tw(lt, 2.2, 4.6));
    // kids playing ball
    const kx = 520 + lx(.8, camX);
    [[0, '#e9c46a', '#3a5a8a', 1], [120, '#f4f1ea', '#5a3a3a', -1], [250, '#9fd0e8', '#3a5a3a', -1]].forEach(([dx, top, bot, f], i) => { person(c, kx + dx + Math.sin(lt * 1.3 + i) * 14, 640, 96, { child: true, face: f, top, bottom: bot, pose: 'walk', phase: lt * 7 + i * 2 }); });
    const bp = (lt * .55) % 1, bx = kx + lerp(20, 240, Math.abs(Math.sin(lt * 1.1))), by = 640 - 30 - Math.abs(Math.sin(lt * 3.3)) * 70;
    c.fillStyle = '#f1f1f1'; c.beginPath(); c.arc(bx, by, 9, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    // birds
    c.save(); c.strokeStyle = 'rgba(42,36,64,.75)'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { const x = 200 + i * 70 + lt * 40 + Math.sin(i) * 30, y = 150 + i * 14 + Math.sin(lt * 2 + i) * 6, w = 9 + Math.sin(lt * 8 + i) * 3; c.beginPath(); c.moveTo(x - 10, y - w * .4); c.quadraticCurveTo(x - 4, y - w, x, y); c.quadraticCurveTo(x + 4, y - w, x + 10, y - w * .4); c.stroke(); } c.restore();
    glow(c, 1050 - camX * .1, 520, 520, 'rgba(255,190,140,.55)', .8);
  }
});

/* interior night with lantern (shared painter) */
function interiorSetup(seed, o = {}) {
  const bg = canvas(); const c = bg.getContext('2d');
  room(c, ['#4b3d62', '#2e2540', '#6a5788', '#3a2c3c'], seed);
  windowFrame(c, 230, 150, 330, 250, seed + 5, (w, x, y, ww, hh) => {
    const g = w.createLinearGradient(0, y, 0, y + hh); (o.outside || [[0, '#2b3f8f'], [.6, '#8a72b8'], [1, '#f2a37a']]).forEach(([k, col]) => g.addColorStop(k, col)); w.fillStyle = g; w.fillRect(x, y, ww, hh);
    if (o.stars) stars(w, 60, 9, y + hh);
    cumulus(w, x + 190, y + 120, 120, 77, o.cloudLit || '#ffd9c8', '#8f82c8');
    wash(w, ridge(x - 40, x + ww + 40, y + hh - 40, 16, 3, 20), '#2c4a50', null, 3, 5, 6); tree(w, x + 60, y + hh, 34, 5, '#1f3d3a', '#2f5a4a'); palm(w, x + 260, y + hh, 120, 7, '#1f3d3a');
  });
  if (o.door) { wash(c, rectP(1300, 190, 190, 440, 4), '#2a2236', null, seed + 9, 5, 4); wash(c, rectP(1316, 206, 158, 424, 4), '#5a4060', null, seed + 10, 4, 4); }
  if (o.routine) { wash(c, rectP(640, 90, 320, 360, 3), '#f3e6cc', null, seed + 21, 5, 4); }
  if (o.clock) { wash(c, blob(1080, 190, 70, 70, 28, seed + 31, .05), '#f3e6cc', '#3b2c45', seed + 31, 5, 3); }
  const mid = canvas(); const m = mid.getContext('2d');
  desk(m, 760, 470, 460, seed + 40);
  bookStack(m, 1120, 470, o.books || 4, seed + 41);
  return [[bg, .25], [mid, .5]];
}
function routineText(c, x, y, lt) {
  c.save(); c.fillStyle = '#3b2c45'; c.font = `800 38px ${FONT}`; c.textAlign = 'center'; c.fillText('রুটিন', x + 160, y + 52);
  c.font = `700 25px ${FONT}`; c.textAlign = 'left';
  ['ভোর ৫টা — ওঠা', 'সকাল — পড়া', 'দুপুর — স্কুল', 'বিকেল — একটু খেলা', 'সন্ধ্যা — পড়া', 'রাত ৯টা — ঘুম'].forEach((s, i) => { c.globalAlpha = .85 * tw(lt, .6 + i * .45, 1.1 + i * .45); c.fillText(s, x + 30, y + 104 + i * 42); });
  c.restore();
}
function clockHands(c, x, y, lt) {
  c.save(); c.strokeStyle = '#2a2440'; c.lineCap = 'round';
  const a1 = lt * 2.2, a2 = lt * .18 + 1;
  c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a1) * 52, y - Math.cos(a1) * 52); c.stroke();
  c.lineWidth = 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(a2) * 34, y - Math.cos(a2) * 34); c.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; c.lineWidth = 3; c.beginPath(); c.moveTo(x + Math.sin(a) * 56, y - Math.cos(a) * 56); c.lineTo(x + Math.sin(a) * 62, y - Math.cos(a) * 62); c.stroke(); }
  c.fillStyle = '#b0473a'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); c.restore();
}
function boyAtDesk(c, camX, lt, o = {}) {
  const bx = 690 + lx(.5, camX) + MARGIN;
  // chair
  c.save(); c.strokeStyle = '#5a3a2c'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 40, 640); c.lineTo(bx - 40, 560); c.lineTo(bx + 30, 560); c.lineTo(bx + 30, 640); c.moveTo(bx - 40, 560); c.lineTo(bx - 46, 450); c.stroke(); c.restore();
  person(c, bx, 640, 250, Object.assign({ pose: 'sit', face: 1, child: true, top: '#f4f1ea', bottom: '#2f4f8f', hand: [bx + 100, 472] }, o));
}

/* 2. boy at desk, lantern, glance at window (8.77 - 17.75) */
shot(8.77, 17.75, {
  drift: 90, zoom: [1, 1.07],
  setup() { return { layers: interiorSetup(100, { door: true }) }; },
  draw(c, lt, d, S, camX) {
    const ox = lx(.5, camX) + MARGIN;
    // open notebook
    c.save(); c.fillStyle = '#fbf3df'; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(880 + ox, 466); c.lineTo(960 + ox, 458); c.lineTo(1040 + ox, 466); c.lineTo(1040 + ox, 472); c.lineTo(880 + ox, 472); c.closePath(); c.fill(); c.stroke(); c.restore();
    const look = tw(lt, 3.3, 4.2) * (1 - tw(lt, 7.6, 8.4));
    boyAtDesk(c, camX, lt, { lookF: look > .5 ? -1 : 1, headDx: -look * 8 });
    lantern(c, 1000 + ox, 470, 70, lt + 9);
    // mother in the doorway, only looking
    const mo = tw(lt, 4.6, 5.6);
    if (mo > 0) { c.save(); c.globalAlpha = mo; const dx = 1395 + lx(.25, camX); glow(c, dx, 420, 200, 'rgba(255,200,130,.35)', 1); person(c, dx, 620, 330, { female: true, face: -1, top: '#c25a4a', border: '#e9c46a', hair: '#1f1a26' }); c.restore(); }
  }
});

/* 3. rules: clock and routine (17.75 - 26.97) */
shot(17.75, 26.97, {
  drift: -110, zoom: [1.05, 1.0],
  setup() { return { layers: interiorSetup(200, { routine: true, clock: true, books: 6 }) }; },
  draw(c, lt, d, S, camX) {
    const bgx = lx(.25, camX) + MARGIN;
    routineText(c, 640 + lx(.25, camX), 90, lt);
    clockHands(c, 1080 + lx(.25, camX), 190, lt);
    boyAtDesk(c, camX, lt, { headDy: 8, lean: .07 });
    lantern(c, 1000 + lx(.5, camX) + MARGIN, 470, 70, lt);
  }
});

/* 4. parents' unfulfilled dreams at sunset (26.97 - 39.49) */
shot(26.97, 39.49, {
  drift: 130, zoom: [1, 1.05],
  setup() {
    const sk = canvas(); const c = sk.getContext('2d');
    sky(c, [[0, '#2e4a9a'], [.45, '#8a7ac4'], [.75, '#f6a77a'], [1, '#ffe2a8']], 6);
    cumulus(c, 1100, 330, 360, 61, '#ffe3cf', '#9a8bcc'); cumulus(c, 380, 240, 200, 63, '#ffe9da', '#a093d0');
    const far = canvas(); const f = far.getContext('2d');
    // the far dream: a faint city on the horizon
    for (let i = 0; i < 14; i++) { const x = 900 + i * 34 + rand(i) * 10, h = 40 + rand(i * 3) * 90; wash(f, rectP(x, 470 - h, 26, h, 2), '#b9a6d8', null, 70 + i, 4, 3); }
    mountains(f, 480, '#8a80bf', 8, 50);
    const mid = canvas(); const m = mid.getContext('2d');
    wash(m, ridge(-40, LW + 40, 560, 30, 19, 40), '#4f8a5a', null, 19, 5, 10); grassStrokes(m, 560, 720, 700, 9, '#2f6e3c');
    tree(m, 140, 570, 90, 71, '#2b6a4f', '#5fa86a'); palm(m, 1540, 570, 240, 72);
    return { layers: [[sk, .1], [far, .3], [mid, .7]] };
  },
  draw(c, lt, d, S, camX) {
    glow(c, 1040 - camX * .1, 470, 600, 'rgba(255,200,140,.6)', .9);
    const px = 700 + lx(.7, camX) + MARGIN;
    person(c, px, 650, 300, { back: true, face: 1, top: '#f4f1ea', bottom: '#5a5a6a', hair: '#1f1a26' });
    const mo = tw(lt, 7.6, 9);
    c.save(); c.globalAlpha = mo; person(c, px + 120, 650, 270, { back: true, female: true, face: 1, top: '#c25a4a', border: '#e9c46a', hair: '#1f1a26' }); c.restore();
    // drifting leaves
    for (let i = 0; i < 10; i++) { const p = (lt * .08 + rand(i)) % 1, x = lerp(-50, W + 50, p) + Math.sin(lt + i) * 30, y = 200 + rand(i * 3) * 300 + Math.sin(p * 9 + i) * 40; c.save(); c.translate(x, y); c.rotate(lt * 2 + i); c.fillStyle = i % 3 ? '#7cc36a' : '#e9c46a'; c.globalAlpha = .8; c.beginPath(); c.ellipse(0, 0, 7, 3.5, 0, 0, 7); c.fill(); c.restore(); }
  }
});

/* 5. mother turns old pages by lantern, then the line (39.49 - 48.38) */
shot(39.49, 48.38, {
  drift: 60, zoom: [1.02, 1.1],
  setup() { return { layers: interiorSetup(300, { stars: true, outside: [[0, '#101a45'], [.7, '#2b3a7a'], [1, '#4a4a8a']], cloudLit: '#9aa6d8' }) }; },
  draw(c, lt, d, S, camX) {
    const ox = lx(.5, camX) + MARGIN;
    // floor mat
    c.save(); c.globalAlpha = .85; c.fillStyle = '#c9a46a'; c.beginPath(); c.ellipse(820 + ox, 660, 300, 40, 0, 0, 7); c.fill(); c.restore();
    lantern(c, 1020 + ox, 655, 80, lt);
    person(c, 760 + ox, 655, 300, { pose: 'floor', female: true, face: 1, top: '#c25a4a', bottom: '#c25a4a', hair: '#1f1a26', hand: [900 + ox, 600], headDy: 10 });
    // old book with a turning page
    const bx = 900 + ox, by = 606;
    c.save(); c.fillStyle = '#efe0bf'; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(bx - 60, by); c.lineTo(bx, by + 8); c.lineTo(bx + 60, by); c.lineTo(bx + 60, by + 10); c.lineTo(bx - 60, by + 10); c.closePath(); c.fill(); c.stroke();
    const pg = (lt * .35) % 1, ang = ease.io(pg) * Math.PI, px = Math.cos(ang) * 58;
    if (lt < 5) { c.fillStyle = '#f7ecd2'; c.beginPath(); c.moveTo(bx, by + 8); c.quadraticCurveTo(bx + px * .5, by - Math.sin(ang) * 30, bx + px, by - Math.sin(ang) * 8); c.lineTo(bx + px, by + 2); c.closePath(); c.fill(); c.stroke(); }
    c.restore();
  }
});

/* 6. the blessing that became a weight: walking under summer sky (48.38 - 55.02) */
shot(48.38, 55.02, {
  drift: 160,
  setup() {
    const sk = canvas(); const c = sk.getContext('2d');
    sky(c, [[0, '#1f56c8'], [.6, '#4f8fe0'], [1, '#bfe0f6']], 8);
    cumulus(c, 520, 380, 440, 81); cumulus(c, 1250, 300, 300, 83);
    const far = canvas(); const f = far.getContext('2d'); mountains(f, 500, '#7f97c4', 4, 60);
    const mid = canvas(); const m = mid.getContext('2d');
    wash(m, ridge(-40, LW + 40, 560, 30, 23, 40), '#4f9a58', null, 23, 5, 10);
    for (let i = 0; i < 7; i++) tree(m, 80 + i * 240 + rand(i) * 60, 565, 55 + rand(i * 2) * 25, 90 + i);
    const near = canvas(); const n = near.getContext('2d');
    wash(n, ridge(-40, LW + 40, 610, 10, 25, 40), '#6fb75e', null, 25, 5, 10); grassStrokes(n, 610, 720, 700, 7, '#2f6e3c');
    wash(n, [[-40, 720], [-40, 680], [LW + 40, 640], [LW + 40, 720]], '#e6c99a', null, 27, 5, 8);
    return { layers: [[sk, .1], [far, .3], [mid, .55], [near, 1]] };
  },
  draw(c, lt, d, S, camX) {
    glow(c, 1120, 120, 420, 'rgba(255,250,220,.7)', .9);
    const x = lerp(380, 700, lt / d), bag = lerp(1, 2.1, tw(lt, 2.4, 6.2));
    person(c, x, 670, 230, { child: true, pose: 'walk', phase: lt * 6, face: 1, top: '#f4f1ea', bottom: '#2f4f8f', bag, bagCol: '#b0473a', headDy: bag * 4 - 4 });
    for (let i = 0; i < 14; i++) { const p = (lt * .1 + rand(i)) % 1, xx = lerp(W + 40, -40, p), yy = 150 + rand(i * 5) * 420 + Math.sin(p * 12 + i) * 30; c.save(); c.translate(xx, yy); c.rotate(lt * 3 + i); c.fillStyle = '#ffd1dc'; c.globalAlpha = .9; c.beginPath(); c.ellipse(0, 0, 6, 3.5, 0, 0, 7); c.fill(); c.restore(); }
  }
});

/* 7. hospital corridor (55.02 - 73.04) */
shot(55.02, 73.04, {
  drift: 40, zoom: [1, 1.12],
  setup() {
    const bg = canvas(); const c = bg.getContext('2d');
    const vx = LW / 2, vy = 330;
    grad(c, LW, H, [[0, '#cfe6ea'], [1, '#9cc6cc']]);
    wash(c, [[0, 0], [vx - 150, vy - 100], [vx - 150, vy + 90], [0, H]], '#8fbcc4', null, 1, 5, 8);
    wash(c, [[LW, 0], [vx + 150, vy - 100], [vx + 150, vy + 90], [LW, H]], '#86b4bd', null, 2, 5, 8);
    wash(c, [[0, H], [vx - 150, vy + 90], [vx + 150, vy + 90], [LW, H]], '#6f9fa3', null, 3, 5, 8);
    wash(c, [[0, 0], [vx - 150, vy - 100], [vx + 150, vy - 100], [LW, 0]], '#e4f2f2', null, 4, 5, 8);
    wash(c, rectP(vx - 150, vy - 100, 300, 190, 4), '#f4fbfa', null, 5, 5, 4);
    for (let i = 0; i < 5; i++) { const k = Math.pow(.62, i), w = 260 * k, yy = lerp(vy - 100, 40, k) ; wash(c, rectP(vx - w / 2, yy - 6 * k, w, 14 * k + 2, 3), '#ffffff', null, 10 + i, 5, 2); }
    for (let i = 0; i < 4; i++) { const k = Math.pow(.6, i), xL = lerp(vx - 150, 40, k), xR = lerp(vx + 150, LW - 40, k), hh = 300 * k, yb = lerp(vy + 90, H - 60, k); wash(c, rectP(xL, yb - hh, 60 * k + 6, hh, 2), '#5f8f97', null, 20 + i, 5, 3); wash(c, rectP(xR - 60 * k - 6, yb - hh, 60 * k + 6, hh, 2), '#5f8f97', null, 30 + i, 5, 3); }
    return { layers: [[bg, .2]] };
  },
  draw(c, lt, d, S, camX) {
    const ox = lx(.2, camX) + MARGIN;
    glow(c, 640, 300, 400, 'rgba(235,255,255,.6)', .8);
    // bench and mother
    c.save(); c.fillStyle = '#4b6f78'; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); rr(c, 250 + ox, 560, 300, 22, 6); c.fill(); c.stroke(); c.fillRect(270 + ox, 582, 12, 80); c.fillRect(520 + ox, 582, 12, 80); c.restore();
    person(c, 380 + ox, 660, 300, { pose: 'sit', female: true, face: 1, top: '#c9c2d8', bottom: '#8a7fa8', hair: '#1f1a26', skin: '#e9c9b4', hand: [450 + ox, 580], headDy: 14, lean: .08 });
    person(c, 700 + ox, 670, 330, { face: -1, top: '#e9eef2', bottom: '#4a5060', hair: '#1f1a26', headDy: 6 });
    // doctor arrives from the far end
    const dk = tw(lt, 12.6, 15.5);
    if (dk > 0) { const k = lerp(.3, 1, dk); c.save(); c.globalAlpha = Math.min(1, dk * 2); person(c, lerp(640, 900, dk) + ox * k, lerp(430, 672, dk), 330 * k, { face: -1, top: '#ffffff', bottom: '#3a4a5a', hair: '#3a3a3a', pose: dk < 1 ? 'walk' : 'stand', phase: lt * 6 }); c.restore(); }
  }
});

/* 8. brother flies a kite, I study inside (73.04 - 84.19) */
shot(73.04, 84.19, {
  drift: 200,
  setup() {
    const sk = canvas(); const c = sk.getContext('2d');
    sky(c, [[0, '#1f56c8'], [.6, '#5a9be6'], [1, '#cfe9f8']], 12);
    cumulus(c, 360, 330, 330, 121); cumulus(c, 1180, 260, 260, 123);
    const mid = canvas(); const m = mid.getContext('2d');
    wash(m, ridge(-40, LW + 40, 560, 24, 31, 40), '#5aa35c', null, 31, 5, 10);
    palm(m, 120, 565, 220, 125); tree(m, 520, 560, 70, 127);
    house(m, 900, 600, 520, 300, 131, { roof: '#9c3f36', wall: '#efd7ae', win: '#fff4d6' });
    const near = canvas(); const n = near.getContext('2d');
    wash(n, ridge(-40, LW + 40, 620, 8, 33, 40), '#7cc36a', null, 33, 5, 10); grassStrokes(n, 620, 720, 600, 11, '#2f6e3c');
    return { layers: [[sk, .1], [mid, .7], [near, 1]] };
  },
  draw(c, lt, d, S, camX) {
    glow(c, 300, 90, 400, 'rgba(255,250,220,.7)', .9);
    const bx = 330 + lx(1, camX) + MARGIN, by = 690;
    const kx = bx + 230 + Math.sin(lt * .9) * 40, ky = 170 + Math.sin(lt * 1.3) * 25;
    c.save(); c.strokeStyle = 'rgba(42,36,64,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx + 40, by - 150); c.quadraticCurveTo(bx + 160, by - 260, kx, ky + 30); c.stroke(); c.restore();
    c.save(); c.translate(kx, ky); c.rotate(Math.sin(lt * 2) * .15); c.fillStyle = '#d8402f'; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, -34); c.lineTo(28, 0); c.lineTo(0, 38); c.lineTo(-28, 0); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, 38); for (let i = 1; i < 6; i++) c.lineTo(Math.sin(lt * 4 + i) * 8, 38 + i * 14); c.stroke(); c.restore();
    person(c, bx, by, 170, { child: true, face: 1, top: '#e9c46a', bottom: '#3a5a8a', hand: [bx + 40, by - 150] });
    // window: me at the desk inside
    const hx = 900 + lx(.7, camX), wx = hx + 520 * .55, wy = 600 - 300 * .72, ww = 520 * .28, wh = 300 * .32;
    c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); c.fillStyle = 'rgba(255,214,150,.35)'; c.fillRect(wx, wy, ww, wh); person(c, wx + 55, wy + wh + 28, 130, { pose: 'sit', child: true, face: 1, headDy: 6, top: '#f4f1ea' }); c.restore();
  }
});

/* 9. mother's world at my table (84.19 - 98.16) */
shot(84.19, 98.16, {
  drift: -80, zoom: [1.06, 1.0],
  setup() { return { layers: interiorSetup(400, { books: 0 }) }; },
  draw(c, lt, d, S, camX) {
    const ox = lx(.5, camX) + MARGIN;
    lantern(c, 940 + ox, 470, 70, lt);
    boyAtDesk(c, camX, lt, {});
    const smile = tw(lt, 7.4, 8.6);
    person(c, 1160 + ox, 650, 300, { pose: 'sit', female: true, face: -1, top: '#c25a4a', bottom: '#c25a4a', hair: '#1f1a26', hand: [1110 + ox, 575], headDy: -smile * 4 });
    if (smile > 0) glow(c, 1160 + ox, 380, 140, 'rgba(255,210,150,.5)', smile);
  }
});

/* 10. first in class: school yard, father brings sweets (98.16 - 111.48) */
shot(98.16, 111.48, {
  drift: 140,
  setup() {
    const sk = canvas(); const c = sk.getContext('2d');
    sky(c, [[0, '#1f56c8'], [.6, '#58a0ea'], [1, '#d4ecf8']], 14);
    cumulus(c, 1220, 300, 330, 141); cumulus(c, 420, 230, 210, 143);
    const mid = canvas(); const m = mid.getContext('2d');
    // school building
    wash(m, rectP(260, 330, 900, 230, 6), '#f0d27a', null, 151, 5, 6); wash(m, rectP(240, 300, 940, 40, 6), '#c9573f', null, 152, 5, 4);
    for (let i = 0; i < 7; i++) { wash(m, rectP(300 + i * 125, 380, 70, 180, 2), '#3f7f64', null, 160 + i, 5, 3); }
    wash(m, ridge(-40, LW + 40, 575, 6, 37, 40), '#6fb75e', null, 37, 5, 8);
    // flame tree (krishnachura)
    wash(m, rectP(1350, 400, 22, 180, 2), '#6b4a3a', null, 171, 5, 3);
    [[1360, 360, 120], [1290, 400, 80], [1440, 400, 90], [1370, 300, 80]].forEach(([x, y, r], i) => { wash(m, blob(x, y, r, r * .7, 22, 180 + i), '#3f8a4f', null, 190 + i, 4, 8); wash(m, blob(x - 10, y - 10, r * .8, r * .5, 22, 200 + i), '#e2452f', null, 210 + i, 4, 8); });
    // flag pole
    wash(m, rectP(180, 250, 8, 330, 1), '#8a8a9a', null, 221, 5, 2); wash(m, rectP(188, 252, 110, 66, 2), '#1f7a4a', null, 222, 5, 3); wash(m, blob(235, 285, 20, 20, 18, 223, .05), '#e2452f', null, 224, 5, 2);
    const near = canvas(); const n = near.getContext('2d');
    wash(n, [[-40, 720], [-40, 600], [LW + 40, 590], [LW + 40, 720]], '#e3c79a', null, 39, 5, 8); grassStrokes(n, 590, 610, 200, 13, '#6a9a4a');
    return { layers: [[sk, .1], [mid, .6], [near, 1]] };
  },
  draw(c, lt, d, S, camX) {
    glow(c, 200, 80, 420, 'rgba(255,250,220,.75)', .9);
    const ox = lx(1, camX) + MARGIN;
    person(c, 640 + ox, 690, 200, { child: true, face: 1, top: '#f4f1ea', bottom: '#2f4f8f', hand: [690 + ox, 560] });
    c.save(); c.fillStyle = '#fffaf0'; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); rr(c, 680 + ox, 535, 46, 60, 4); c.fill(); c.stroke(); c.fillStyle = '#e2452f'; c.font = `800 20px ${FONT}`; c.textAlign = 'center'; c.fillText('১ম', 703 + ox, 572); c.restore();
    const fk = tw(lt, 5.4, 7.2);
    const fx = lerp(1180, 860, fk) + ox;
    person(c, fx, 692, 320, { face: -1, top: '#e9eef2', bottom: '#4a5060', hair: '#1f1a26', pose: fk > 0 && fk < 1 ? 'walk' : 'stand', phase: lt * 6, hand: [fx - 70, 520] });
    c.save(); c.fillStyle = '#d8402f'; c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); rr(c, fx - 120, 500, 80, 50, 6); c.fill(); c.stroke(); c.fillStyle = '#fff3dc'; c.fillRect(fx - 82, 500, 6, 50); c.restore();
    for (let i = 0; i < 18; i++) { const p = (lt * .09 + rand(i)) % 1, xx = 1300 + ox * .6 - p * 900 + Math.sin(p * 10 + i) * 40, yy = 280 + p * 420; c.save(); c.translate(xx, yy); c.rotate(lt * 2 + i); c.fillStyle = '#e2452f'; c.globalAlpha = .85; c.beginPath(); c.ellipse(0, 0, 6, 3.2, 0, 0, 7); c.fill(); c.restore(); }
  }
});

/* 11. the staircase of dreams (111.48 - 131.9) */
const STEPS = [['ক্লাসে প্রথম', 6.2], ['বোর্ডে স্ট্যান্ড', 7.3], ['ভালো কলেজ', 8.6], ['মেডিকেল', 9.7], ['আরও বড় কিছু', 10.9]];
shot(111.48, 131.9, {
  drift: 0, zoom: [1, 1],
  setup() {
    const sk = canvas(LW, H * 2); const c = sk.getContext('2d');
    grad(c, LW, H * 2, [[0, '#18338f'], [.5, '#2f6fd6'], [1, '#bfe0f6']]);
    cumulus(c, 300, 1150, 380, 301); cumulus(c, 1250, 1050, 420, 303); cumulus(c, 800, 700, 300, 305); cumulus(c, 350, 420, 260, 307); cumulus(c, 1200, 300, 300, 309);
    return { layers: [], tall: sk };
  },
  draw(c, lt, d, S) {
    const camY = 260 * tw(lt, 11.5, 18);
    c.drawImage(S.tall, -MARGIN, -H * 1.0 + camY * .5);
    const pos = i => i < 5 ? [150 + i * 175, 530 - i * 98 + camY] : [150 + 4 * 175 + (i - 4) * 120, 530 - 4 * 98 - (i - 4) * 74 + camY];
    const n = 5 + Math.floor(tw(lt, 12.5, 17, ease.out) * 10);
    for (let i = 0; i < n; i++) {
      const appear = i === 0 ? tw(lt, .2, .9, ease.out) : i < 5 ? tw(lt, STEPS[i][1] - .4, STEPS[i][1] + .3, ease.out) : tw(lt, 12.5 + (i - 5) * .35, 13.2 + (i - 5) * .35, ease.out);
      if (appear <= 0) continue;
      const [x, y0] = pos(i), y = y0 + (1 - appear) * 60;
      c.save(); c.globalAlpha = appear * (i > 4 ? lerp(.9, .35, (i - 5) / 9) : 1);
      c.fillStyle = '#f3e6cc'; c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); rr(c, x, y, 170, 26, 8); c.fill(); c.stroke();
      c.fillStyle = '#d4c09a'; c.beginPath(); rr(c, x + 6, y + 26, 158, 14, 6); c.fill(); c.stroke();
      if (i < 5 && lt > STEPS[i][1] - .3) { c.globalAlpha *= tw(lt, STEPS[i][1] - .3, STEPS[i][1] + .3); c.font = `800 30px ${FONT}`; c.textAlign = 'center'; c.shadowColor = 'rgba(60,110,255,.95)'; c.shadowBlur = 16; c.fillStyle = '#ffffff'; c.fillText(STEPS[i][0], x + 85, y + 72); }
      c.restore();
    }
    const reached = clamp((lt - 6.3) / 1.15, 0, 4);
    const i0 = Math.min(3, Math.floor(reached)), fr = reached - i0;
    const [ax, ay] = pos(i0), [bx2, by2] = pos(i0 + 1);
    const px = lerp(ax, bx2, ease.io(fr)) + 85; STAIR_X = lerp(px + 60, 1040, tw(lt, 12.5, 16)); const _u = 0, py = lerp(ay, by2, ease.io(fr)) - Math.sin(fr * Math.PI) * 24;
    person(c, px, py, 150, { child: true, face: 1, top: '#f4f1ea', bottom: '#2f4f8f', pose: fr > .05 && fr < .95 ? 'walk' : 'stand', phase: lt * 8, bag: 1 + reached * .28, bagCol: '#b0473a', headDy: reached * 3 });
  }
});

/* 12. veranda at night, fireflies (131.9 - 148.72) */
shot(131.9, 148.72, {
  drift: 90, zoom: [1, 1.06],
  setup() {
    const sk = canvas(); const c = sk.getContext('2d');
    grad(c, LW, H, [[0, '#0d1640'], [.65, '#26357a'], [1, '#3f4a8f']]); stars(c, 220, 41, H * .6);
    wash(c, blob(1180, 150, 46, 46, 30, 3, .04), '#fff6d8', null, 3, 5, 2); glow(c, 1180, 150, 220, 'rgba(255,246,210,.5)', 1);
    cumulus(c, 500, 260, 220, 401, '#8e9ad0', '#3a4588');
    const mid = canvas(); const m = mid.getContext('2d');
    wash(m, ridge(-40, LW + 40, 520, 30, 43, 40), '#14304a', null, 43, 5, 10); palm(m, 300, 525, 230, 45, '#10263a', '#16283a'); tree(m, 900, 525, 80, 47, '#10263a', '#1a3a4a', '#10263a'); palm(m, 1400, 525, 250, 49, '#10263a', '#16283a');
    const near = canvas(); const n = near.getContext('2d');
    wash(n, rectP(-40, 560, LW + 80, 200, 8), '#3a2c3c', null, 51, 5, 6);
    for (let i = 0; i < 6; i++) wash(n, rectP(60 + i * 300, -20, 40, 600, 3), '#4a3a4e', null, 60 + i, 5, 4);
    wash(n, rectP(-40, 520, LW + 80, 20, 8), '#5a4658', null, 70, 5, 4); for (let i = 0; i < 40; i++) wash(n, rectP(i * 42, 540, 10, 40, 2), '#5a4658', null, 80 + i, 3, 2);
    // brother's window, warm and dim
    wash(n, rectP(1340, 180, 220, 200, 3), '#e9b86a', null, 90, 5, 4); wash(n, blob(1450, 340, 80, 26, 20, 91), '#7a5ca8', null, 92, 5, 4); wash(n, blob(1390, 330, 22, 20, 16, 93), '#f1c7a0', null, 94, 5, 3);
    return { layers: [[sk, .1], [mid, .4], [near, 1]] };
  },
  draw(c, lt, d, S, camX) {
    const ox = lx(1, camX) + MARGIN;
    glow(c, 1450 + ox, 280, 200, 'rgba(255,200,120,.4)', .9);
    person(c, 640 + ox, 690, 240, { child: true, back: true, face: 1, top: '#f4f1ea', bottom: '#2f4f8f', hand: [660 + ox, 525], hand2: [612 + ox, 525] });
    for (let i = 0; i < 26; i++) { const x = (rand(i) * W + Math.sin(lt * .4 + i) * 60), y = 300 + rand(i * 3) * 280 + Math.sin(lt * .7 + i * 2) * 30, a = .5 + .5 * Math.sin(lt * 2.5 + i * 1.7); glow(c, x, y, 18, 'rgba(220,255,140,.9)', a * .9); c.fillStyle = `rgba(250,255,200,${a})`; c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill(); }
  }
});

/* 13. what do I want: stars over a hill (148.72 - 159.22) */
shot(148.72, 159.22, {
  drift: 60, zoom: [1, 1.08],
  setup() {
    const sk = canvas(); const c = sk.getContext('2d');
    grad(c, LW, H, [[0, '#0a1236'], [.6, '#2a2f7a'], [1, '#5a4a8f']]);
    for (let i = 0; i < 10; i++) wash(c, blob(200 + i * 140, 260 - i * 10 + rand(i) * 40, 160, 50, 20, 500 + i), '#8f8fe0', null, 510 + i, 3, 20, .06);
    stars(c, 420, 53, H * .8);
    const mid = canvas(); const m = mid.getContext('2d');
    wash(m, ridge(-40, LW + 40, 560, 60, 57, 40), '#1a2450', null, 57, 5, 10); wash(m, blob(820, 720, 520, 170, 30, 59), '#141c40', null, 59, 5, 10);
    return { layers: [[sk, .15], [mid, .5]] };
  },
  draw(c, lt, d, S, camX) {
    const ox = lx(.5, camX) + MARGIN;
    for (let i = 0; i < 30; i++) { const a = .5 + .5 * Math.sin(lt * 3 + i * 2.3); c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.arc(rand(i + 900) * W, rand(i * 7 + 900) * 420, 1.8, 0, 7); c.fill(); }
    const sp = prog(lt, 3.2, 4.4); if (sp > 0 && sp < 1) { const x = lerp(300, 900, sp), y = lerp(80, 260, sp); c.save(); c.strokeStyle = `rgba(255,255,255,${1 - sp})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 90, y - 28); c.stroke(); c.restore(); }
    person(c, 800 + ox, 580, 200, { pose: 'floor', child: true, face: 1, look: 'up', top: '#f4f1ea', bottom: '#2f4f8f', hand: [770 + ox, 575], lean: -.06 });
  }
});

/* 14. dawn river, the helmsman (159.22 - end) */
shot(159.22, TOTAL, {
  drift: 120, zoom: [1, 1.05],
  setup() {
    const sk = canvas(); const c = sk.getContext('2d');
    sky(c, [[0, '#3a5ab8'], [.45, '#a98ad0'], [.75, '#ffb38a'], [1, '#ffe4b0']], 15);
    cumulus(c, 400, 300, 280, 601, '#ffe6d8', '#a79ad4'); cumulus(c, 1300, 260, 240, 603, '#ffe6d8', '#a79ad4');
    const far = canvas(); const f = far.getContext('2d');
    wash(f, ridge(-40, LW + 40, 470, 16, 61, 30, 480), '#6f8a7a', null, 61, 5, 6); for (let i = 0; i < 9; i++) tree(f, 60 + i * 190, 472, 26 + rand(i) * 10, 610 + i, '#4f6f62', '#6f8f78', '#4f5f5a');
    grad(f, LW, H, [[0, 'rgba(0,0,0,0)'], [.66, 'rgba(0,0,0,0)'], [.661, '#e9a98e'], [1, '#6f8fd0']]);
    return { layers: [[sk, .1], [far, .3]] };
  },
  draw(c, lt, d, S, camX) {
    const sunY = lerp(500, 430, tw(lt, 0, 8));
    glow(c, 820, sunY, 160, 'rgba(255,240,200,1)', 1); glow(c, 820, sunY, 520, 'rgba(255,190,140,.6)', 1);
    c.save(); c.fillStyle = '#fff2cf'; c.beginPath(); c.arc(820, sunY, 36, 0, 7); c.fill(); c.restore();
    // shimmer on the water
    c.save(); for (let i = 0; i < 40; i++) { const y = 490 + i * 6, w = 40 + rand(i) * 140; c.globalAlpha = .25 + .2 * Math.sin(lt * 2 + i); c.fillStyle = i % 2 ? '#fff1cf' : '#ffd0a0'; c.fillRect(820 - w / 2 + Math.sin(lt * 1.5 + i) * 12, y, w, 2); } c.restore();
    const bx = lerp(260, 560, lt / d), by = 600 + Math.sin(lt * 1.6) * 4;
    c.save(); c.translate(bx, by); c.rotate(Math.sin(lt * 1.3) * .02);
    c.fillStyle = '#6b4a3a'; c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-170, -10); c.quadraticCurveTo(0, 46, 170, -26); c.lineTo(150, -4); c.quadraticCurveTo(0, 22, -150, 6); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-40, -4); c.quadraticCurveTo(10, -60, 60, -8); c.closePath(); c.fillStyle = '#c9a46a'; c.fill(); c.stroke();
    c.restore();
    person(c, bx - 110, by - 2, 160, { child: true, face: 1, top: '#f4f1ea', bottom: '#2f4f8f', hand: [bx - 70, by - 70] });
    limb(c, [[bx - 70, by - 70], [bx - 160, by + 40]], 6, '#8a5a3c');
    c.save(); c.globalAlpha = .35; c.fillStyle = '#2a2440'; c.beginPath(); c.ellipse(bx, by + 30, 190, 12, 0, 0, 7); c.fill(); c.restore();
  }
});

/* ---------- vertical framing: where to look in each shot (16:9 screen x) ---------- */
const FOCUS = [
  (lt, d, cx) => lerp(560, 1000, ease.sine(clamp(lt / d))),
  (lt) => lerp(820, 1040, tw(lt, 4.2, 5.6)),
  (lt) => lerp(640, 820, tw(lt, 1, 8)),
  (lt, d, cx) => 760 - cx * .7 + 60 * tw(lt, 7.6, 9),
  () => 880,
  (lt, d) => lerp(380, 700, lt / d),
  (lt) => lerp(470, 760, tw(lt, 3.3, 5.2)) + 120 * tw(lt, 12.6, 15.5),
  (lt, d, cx) => lerp(470 - cx, 1010 - cx * .7, tw(lt, 6.5, 9)),
  (lt) => lerp(760, 1100, tw(lt, 6.8, 8.6)),
  (lt, d, cx) => lerp(700, 860, tw(lt, 5, 7.5)) - cx,
  null,
  (lt, d, cx) => 640 - cx + 760 * tw(lt, 2.2, 3.4) * (1 - tw(lt, 5.4, 6.6)),
  (lt, d, cx) => 800 - cx * .5,
  (lt, d) => lerp(380, 560, lt / d) + 60,
];
let STAIR_X = 300;
/* ---------- grain, vignette, subtitles ---------- */
let GRAIN;
function makeGrain() { const W = OW, H = OH; GRAIN = canvas(W, H); const g = GRAIN.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); const im = g.getImageData(0, 0, W, H), dd = im.data; for (let i = 0; i < dd.length; i += 4) { const v = 236 + rand(i * .37) * 19; dd[i] = v; dd[i + 1] = v - 2; dd[i + 2] = v - 6; } g.putImageData(im, 0, 0); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(150,130,110,${.05 + rand(i) * .06})`; g.lineWidth = 1; g.beginPath(); const x = rand(i * 3) * W, y = rand(i * 5) * H; g.moveTo(x, y); g.quadraticCurveTo(x + 20, y + rand(i) * 20, x + 30 + rand(i * 7) * 30, y + (rand(i * 9) - .5) * 30); g.stroke(); } }
function wrap(c, text, maxW) { const words = text.split(' '); const out = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
function subtitles(c, T) {
  const L = LINES.find(l => T >= l.start && T < l.end); if (!L) return;
  const a = Math.min(prog(T, L.start, L.start + .25), 1 - prog(T, L.end - .25, L.end));
  const v = MODE === 'v', fs = v ? 54 : 36, lh = v ? 76 : 50;
  c.save(); c.font = `700 ${fs}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const rows = wrap(c, L.text, v ? OW - 110 : 1060); const y0 = v ? 1620 : OH - 46 - (rows.length - 1) * lh;
  c.globalAlpha = a; rows.forEach((r, i) => { c.shadowColor = 'rgba(40,90,220,.9)'; c.shadowBlur = 16; c.lineWidth = 6; c.strokeStyle = 'rgba(20,24,60,.55)'; c.strokeText(r, OW / 2, y0 + i * lh); c.fillStyle = '#ffffff'; c.fillText(r, OW / 2, y0 + i * lh); c.shadowBlur = 0; c.fillText(r, OW / 2, y0 + i * lh); });
  c.restore();
}
function title(c, T) {
  const a = tw(T, 166, 167.6) * (1 - tw(T, 170, 171));
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.font = `800 ${MODE === 'v' ? 130 : 96}px ${FONT}`; c.shadowColor = 'rgba(60,110,255,.9)'; c.shadowBlur = 30; c.fillStyle = '#ffffff'; c.fillText('কাঁধের ভার', OW / 2, MODE === 'v' ? 760 : 250); c.restore();
}

/* ---------- frame ---------- */
let BUF = [canvas(W, H), canvas(W, H)];
const cache = new Map();
function getShot(i) { if (!cache.has(i)) { cache.set(i, SHOTS[i].setup()); if (cache.size > 3) { const k = [...cache.keys()].find(k => Math.abs(k - i) > 1); if (k !== undefined) cache.delete(k); } } return cache.get(i); }
function drawShot(ctx, i, T) {
  const s = SHOTS[i], st = getShot(i), d = s.t1 - s.t0, lt = T - s.t0, k = ease.sine(clamp(lt / d)), camX = s.drift * k;
  const z = lerp(s.zoom[0], s.zoom[1], k);
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  st.layers.forEach(([cv, par]) => ctx.drawImage(cv, lx(par, camX), 0));
  s.draw(ctx, lt, d, st, camX);
  ctx.restore();
}
const FADE = .8;
const HB = canvas(W, H), SMALL = canvas(135, 240);
function composeH(out, T) {
  let i = SHOTS.findIndex(s => T >= s.t0 && T < s.t1); if (i < 0) i = SHOTS.length - 1;
  const s = SHOTS[i];
  drawShot(out, i, T);
  if (i > 0 && T < s.t0 + FADE) { const b = BUF[0].getContext('2d'); drawShot(b, i - 1, T); out.save(); out.globalAlpha = 1 - ease.sine(prog(T, s.t0, s.t0 + FADE)); out.drawImage(BUF[0], 0, 0); out.restore(); }
  const fb = Math.max(1 - prog(T, 0, .8), tw(T, 170, 171));
  if (fb > 0) { out.save(); out.globalAlpha = fb; out.fillStyle = '#000'; out.fillRect(0, 0, W, H); out.restore(); }
  return i;
}
function focusAt(i, T) { const s = SHOTS[i], d = s.t1 - s.t0, lt = T - s.t0, camX = s.drift * ease.sine(clamp(lt / d)); return i === 10 ? STAIR_X : FOCUS[i](lt, d, camX); }
const CROP = 640, BAND_Y = 300, BAND_S = 1080 / CROP;
function render(T, noText, full) {
  const out = document.getElementById('cv').getContext('2d');
  if (MODE === 'h') { composeH(out, T); }
  else {
    const hb = HB.getContext('2d'); const i = composeH(hb, T);
    let fx = focusAt(i, T); const s = SHOTS[i];
    if (i > 0 && T < s.t0 + FADE) fx = lerp(focusAt(i - 1, T), fx, ease.sine(prog(T, s.t0, s.t0 + FADE)));
    if (full) { const sc = OH / H, half = OW / sc / 2; fx = clamp(fx, half, W - half); out.drawImage(HB, fx - half, 0, half * 2, H, 0, 0, OW, OH); }
    else {
      fx = clamp(fx, CROP / 2, W - CROP / 2);
      const sm = SMALL.getContext('2d'); sm.filter = 'blur(5px)'; sm.drawImage(HB, fx - 203, 0, 406, H, -10, -10, 155, 260); sm.filter = 'none';
      out.save(); out.imageSmoothingQuality = 'high'; out.drawImage(SMALL, 0, 0, 135, 240, 0, 0, OW, OH); out.fillStyle = 'rgba(12,14,40,.35)'; out.fillRect(0, 0, OW, OH); out.restore();
      out.save(); out.shadowColor = 'rgba(0,0,0,.35)'; out.shadowBlur = 40; out.drawImage(HB, fx - CROP / 2, 0, CROP, H, 0, BAND_Y, OW, H * BAND_S); out.restore();
    }
  }
  out.save(); out.globalCompositeOperation = 'multiply'; out.drawImage(GRAIN, 0, 0); out.restore();
  const m = Math.min(OW, OH), vg = out.createRadialGradient(OW / 2, OH / 2, m * .45, OW / 2, OH / 2, Math.max(OW, OH) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,10,40,.35)'); out.fillStyle = vg; out.fillRect(0, 0, OW, OH);
  if (noText) return;
  if (MODE === 'v') { const a = Math.min(prog(T, 1, 2), 1 - tw(T, 165.5, 166.5)); if (a > 0) { out.save(); out.globalAlpha = a * .95; out.textAlign = 'center'; out.font = `800 76px ${FONT}`; out.shadowColor = 'rgba(60,110,255,.9)'; out.shadowBlur = 24; out.fillStyle = '#fff'; out.fillText('কাঁধের ভার', OW / 2, 190); out.restore(); } }
  title(out, T);
  if (!(T > 46.4 && T < 48.38)) subtitles(out, T); else quote(out, T);
}
function quote(c, T) { const a = tw(T, 46.5, 47) ; c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.shadowColor = 'rgba(255,180,90,.9)'; c.shadowBlur = 24; c.fillStyle = '#fff6e0'; if (MODE === 'v') { c.font = `800 72px ${FONT}`; c.fillText('"আমি যা পারিনি...', OW / 2, 1660); c.fillText('তুই পারবি।"', OW / 2, 1760); } else { c.font = `800 54px ${FONT}`; c.fillText('"আমি যা পারিনি... তুই পারবি।"', OW / 2, 160); } c.restore(); }

window.ready = (async () => { await document.fonts.load(`700 36px ${FONT}`, 'আমি'); await document.fonts.load(`800 36px ${FONT}`, 'আমি'); makeGrain(); return true; })();
window.render = render;
window.setMode = (m) => { MODE = m; if (m === 'v') { OW = 1080; OH = 1920; } else { OW = 1280; OH = 720; } const cv = document.getElementById('cv'); cv.width = OW; cv.height = OH; BUF = [canvas(W, H), canvas(W, H)]; makeGrain(); };
window.frameJPEG = (T) => { render(T); return document.getElementById('cv').toDataURL('image/jpeg', .9); };

window.thumb = (T) => {
  render(T, true, true);
  const c = document.getElementById('cv').getContext('2d'), v = MODE === 'v';
  const g = c.createLinearGradient(0, v ? OH * .55 : OH * .35, 0, OH); g.addColorStop(0, 'rgba(10,14,50,0)'); g.addColorStop(1, 'rgba(10,14,50,.82)'); c.fillStyle = g; c.fillRect(0, 0, OW, OH);
  c.save(); c.textAlign = 'center';
  const ty = v ? OH - 520 : OH - 190;
  c.font = `800 ${v ? 190 : 150}px ${FONT}`; c.lineJoin = 'round';
  c.lineWidth = v ? 26 : 20; c.strokeStyle = '#14205a'; c.strokeText('কাঁধের ভার', OW / 2, ty);
  c.shadowColor = 'rgba(80,140,255,.95)'; c.shadowBlur = 40; c.fillStyle = '#ffffff'; c.fillText('কাঁধের ভার', OW / 2, ty); c.shadowBlur = 0; c.fillText('কাঁধের ভার', OW / 2, ty);
  c.font = `700 ${v ? 64 : 48}px ${FONT}`; c.lineWidth = 10; c.strokeStyle = '#14205a';
  const tag = v ? ['বাবা-মায়ের সব স্বপ্ন...', 'একজনের কাঁধে'] : ['বাবা-মায়ের সব স্বপ্ন... একজনের কাঁধে'];
  tag.forEach((t, i) => { const y = ty + (v ? 130 : 90) + i * 84; c.strokeText(t, OW / 2, y); c.fillStyle = '#ffd27a'; c.fillText(t, OW / 2, y); });
  c.restore();
  return document.getElementById('cv').toDataURL('image/jpeg', .93);
};
