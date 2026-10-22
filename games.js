// 20 original games. Each game: run(box, api). `api` auto-cleans timers/listeners on restart/exit.
const R = n => Math.random() * n | 0, pick = a => a[R(a.length)], shuf = a => [...a].sort(() => Math.random() - .5);
const opts = (c, pool, n = 4) => { const o = shuf([c, ...shuf([...new Set(pool)].filter(x => x !== c)).slice(0, n - 1)]); return { o, a: o.indexOf(c) }; };
const sp = t => { try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(t)); } catch {} };
const cv = (b, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.className = 'cv'; b.append(c); return [c, c.getContext('2d')]; };
const pt = (e, c) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
const em = (x, t, px, py, z) => { x.font = z + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, px, py); };

// Shared multiple-choice engine (counting, colours, animals, letters, shapes, patterns, math)
function quiz(a, box, gen, n = 10) {
  let i = 0, s = 0;
  const next = () => {
    if (i >= n) return a.win(`You Did It! ${s}/${n} ⭐`);
    const q = gen(i++);
    box.innerHTML = `<div class="q">${q.p}</div><div class="opts">${q.o.map(x => `<button>${x}</button>`).join('')}</div><small>${i}/${n}</small>`;
    const h = box.querySelector('.hear'); if (h) h.onclick = q.s; if (q.s) q.s();
    box.querySelectorAll('.opts button').forEach((b, k) => b.onclick = () => {
      if (k === q.a) { s++; a.score(s); a.sfx('good'); b.classList.add('ok'); a.cheer(); a.later(next, 900); }
      else { a.sfx('bad'); b.classList.add('no'); b.disabled = true; a.say("Let's Try Again!"); }
    });
  };
  next();
}

const number = (b, a) => quiz(a, b, i => {
  const n = 1 + R(3 + i), e = pick(['🍎', '🐥', '⭐', '🎈', '🚗']);
  return { p: `<div class="big">${e.repeat(n)}</div>How many?`, ...opts(n, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].filter(x => Math.abs(x - n) <= 3)) };
});
const math = (b, a) => quiz(a, b, i => {
  const t = i < 5 ? 10 : 20; let x = 1 + R(t), y = 1 + R(t); const op = R(2) ? '+' : '−';
  if (op === '−' && y > x) [x, y] = [y, x];
  const c = op === '+' ? x + y : x - y;
  return { p: `<div class="big">${x} ${op} ${y} = ?</div>`, ...opts(c, [c - 2, c - 1, c + 1, c + 2, c + 3].filter(v => v >= 0)) };
});
const COL = [['Red', '#e53935'], ['Blue', '#1e88e5'], ['Yellow', '#fdd835'], ['Green', '#43a047'], ['Purple', '#8e24aa'], ['Orange', '#fb8c00'], ['Pink', '#ec407a'], ['Brown', '#6d4c41']];
const color = (b, a) => quiz(a, b, () => { const c = pick(COL); return { p: `<div class="sw" style="background:${c[1]}"></div>What color is this?`, ...opts(c[0], COL.map(x => x[0])) }; });
const ANI = [['🐶', 'Woof'], ['🐱', 'Meow'], ['🐮', 'Moo'], ['🐑', 'Baa'], ['🐷', 'Oink'], ['🦆', 'Quack'], ['🦁', 'Roar'], ['🐸', 'Ribbit'], ['🐝', 'Buzz'], ['🐴', 'Neigh']];
const animals = (b, a) => quiz(a, b, () => { const c = pick(ANI); return { p: `<div class="big">“${c[1]}!”</div><button class="hear">🔊 Hear it</button>Which animal says this?`, s: () => sp(c[1]), ...opts(c[0], ANI.map(x => x[0])) }; });
const LET = [['A', '🍎'], ['B', '🐻'], ['C', '🐱'], ['D', '🐶'], ['E', '🐘'], ['F', '🐸'], ['G', '🍇'], ['H', '🏠'], ['L', '🦁'], ['M', '🌙'], ['O', '🐙'], ['P', '🐧'], ['S', '⭐'], ['T', '🐢']];
const abc = (b, a) => quiz(a, b, () => { const c = pick(LET); return { p: `<div class="big">${c[1]}</div>Which letter does it start with?`, ...opts(c[0], LET.map(x => x[0])) }; });
const SH = [['Circle', '<circle cx="50" cy="50" r="42"/>'], ['Square', '<rect x="10" y="10" width="80" height="80"/>'], ['Triangle', '<polygon points="50,8 94,90 6,90"/>'],
  ['Star', '<polygon points="50,5 61,38 96,38 68,58 79,92 50,71 21,92 32,58 4,38 39,38"/>'], ['Diamond', '<polygon points="50,4 94,50 50,96 6,50"/>'],
  ['Heart', '<path d="M50 90C5 55 10 15 35 15c10 0 15 10 15 15 0-5 5-15 15-15 25 0 30 40-15 75z"/>']];
const shapes = (b, a) => quiz(a, b, () => { const c = pick(SH); return { p: `<svg viewBox="0 0 100 100" width="150" fill="${pick(COL)[1]}">${c[1]}</svg>What shape is this?`, ...opts(c[0], SH.map(x => x[0])) }; });
const PE = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];
const pattern = (b, a) => quiz(a, b, i => {
  const u = shuf(PE).slice(0, 2 + (i > 4 ? 1 : 0)), seq = [...Array(u.length * 2 + 1)].map((_, k) => u[k % u.length]), ans = seq.pop();
  return { p: `<div class="big">${seq.join(' ')} ❓</div>What comes next?`, ...opts(ans, PE) };
});

function memory(b, a) {
  const E = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐙', '🦋'], d = shuf([...E, ...E]);
  b.innerHTML = '<div class="mem">' + d.map(e => `<button class="c2" data-e="${e}">❓</button>`).join('') + '</div>';
  let open = [], lock = 0, pairs = 0;
  b.querySelectorAll('.c2').forEach(x => x.onclick = () => {
    if (lock || x.classList.contains('up')) return;
    x.textContent = x.dataset.e; x.classList.add('up'); a.sfx('move'); open.push(x);
    if (open.length < 2) return;
    const [p, q] = open;
    if (p.dataset.e === q.dataset.e) { p.classList.add('done'); q.classList.add('done'); open = []; a.score(++pairs); a.sfx('good'); if (pairs === 8) a.win('You found every pair!'); }
    else { lock = 1; a.say('Try again!'); a.later(() => { [p, q].forEach(z => { z.textContent = '❓'; z.classList.remove('up'); }); open = []; lock = 0; }, 800); }
  });
}

function balloons(b, a) {
  let s = 0, t = 30; b.innerHTML = '<div class="timer">⏱ 30</div><div class="sky"></div>';
  const tm = b.firstChild, sky = b.lastChild;
  a.every(() => {
    const e = document.createElement('button'); e.className = 'bl'; e.textContent = '🎈';
    Object.assign(e.style, { left: R(85) + '%', fontSize: 40 + R(30) + 'px', animationDuration: 4 + R(3) + 's', filter: `hue-rotate(${R(360)}deg)` });
    e.onclick = () => { s++; a.score(s); a.sfx('pop'); e.textContent = '💥'; setTimeout(() => e.remove(), 150); };
    e.onanimationend = () => e.remove(); sky.append(e);
  }, 650);
  a.every(() => { tm.textContent = '⏱ ' + --t; if (!t) a.win(`You popped ${s} balloons!`); }, 1000);
}

function fruit(b, a) {
  const [c, x] = cv(b, 360, 480); let px = 180, s = 0, l = 3, it = [];
  a.ev(c, 'pointermove', e => px = pt(e, c)[0]); a.ev(c, 'pointerdown', e => px = pt(e, c)[0]);
  a.ev(document, 'keydown', e => { if (e.key === 'ArrowLeft') px -= 30; if (e.key === 'ArrowRight') px += 30; });
  a.every(() => it.push({ x: 20 + R(320), y: -20, e: R(4) ? pick(['🍎', '🍌', '🍓', '🍇', '🍊']) : pick(['🪨', '👟']), v: 120 + R(80) + s * 3 }), 700);
  a.loop(dt => {
    x.clearRect(0, 0, 360, 480); px = Math.max(30, Math.min(330, px)); em(x, '🧺', px, 440, 64);
    it = it.filter(o => {
      o.y += o.v * dt; em(x, o.e, o.x, o.y, 38);
      if (o.y > 410 && o.y < 470 && Math.abs(o.x - px) < 44) {
        if (o.e === '🪨' || o.e === '👟') { l--; a.sfx('bad'); a.say('Oops! Not that one'); } else { s++; a.score(s); a.sfx('pop'); }
        if (l <= 0) a.over(`You caught ${s} fruits!`); return false;
      } return o.y < 500;
    });
    em(x, '❤️'.repeat(Math.max(l, 0)), 60, 24, 22);
  });
}

function maze(b, a) {
  let n = 5, p = 0, m = [], s = 72, lv = 0, lk = 0; const [c, x] = cv(b, 360, 360);
  const D = { ArrowUp: [0, -1, 1], ArrowRight: [1, 0, 2], ArrowDown: [0, 1, 4], ArrowLeft: [-1, 0, 8] }; // bits: N1 E2 S4 W8
  const draw = () => {
    x.clearRect(0, 0, 360, 360); x.strokeStyle = '#5e35b1'; x.lineWidth = 4; x.lineCap = 'round';
    m.forEach((w, k) => { const i = k % n * s, j = (k / n | 0) * s; x.beginPath();
      if (w & 1) { x.moveTo(i, j); x.lineTo(i + s, j); } if (w & 2) { x.moveTo(i + s, j); x.lineTo(i + s, j + s); }
      if (w & 4) { x.moveTo(i, j + s); x.lineTo(i + s, j + s); } if (w & 8) { x.moveTo(i, j); x.lineTo(i, j + s); } x.stroke(); });
    em(x, '🏁', (n - .5) * s, (n - .5) * s, s * .6); em(x, '🐥', (p % n + .5) * s, ((p / n | 0) + .5) * s, s * .65);
  };
  const gen = () => {
    s = 360 / n; m = Array(n * n).fill(15); p = 0; lk = 0; const v = new Set([0]), st = [0];
    while (st.length) {
      const k = st[st.length - 1], i = k % n, j = k / n | 0;
      const o = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]].filter(([dx, dy]) => i + dx >= 0 && i + dx < n && j + dy >= 0 && j + dy < n && !v.has(k + dx + dy * n));
      if (!o.length) { st.pop(); continue; }
      const [dx, dy, bit, ob] = pick(o), t = k + dx + dy * n; m[k] &= ~bit; m[t] &= ~ob; v.add(t); st.push(t);
    }
    draw();
  };
  const go = d => {
    if (lk || m[p] & d[2]) return; p += d[0] + d[1] * n; a.sfx('move'); draw();
    if (p === n * n - 1) { lv++; a.score(lv); a.sfx('good'); a.cheer(); if (lv >= 5) return a.win('You explored every maze!'); n++; lk = 1; a.later(gen, 800); }
  };
  a.ev(document, 'keydown', e => { const d = D[e.key]; if (d) { e.preventDefault(); go(d); } });
  b.insertAdjacentHTML('beforeend', '<div class="dpad"><button data-k="ArrowUp">▲</button><button data-k="ArrowLeft">◀</button><button data-k="ArrowDown">▼</button><button data-k="ArrowRight">▶</button></div>');
  b.querySelectorAll('.dpad button').forEach(z => z.onclick = () => go(D[z.dataset.k]));
  gen();
}

function piano(b, a) {
  const K = [['C', 262], ['D', 294], ['E', 330], ['F', 349], ['G', 392], ['A', 440], ['B', 494], ['C', 523]], cl = ['#ff5252', '#ff9800', '#fdd835', '#66bb6a', '#26c6da', '#42a5f5', '#7e57c2', '#ec407a'];
  let n = 0;
  b.innerHTML = '<div class="piano">' + K.map((k, i) => `<button style="background:${cl[i]}">${k[0]}<small>${'ASDFGHJK'[i]}</small></button>`).join('') + '</div><p>Tap the keys to make music! 🎶</p>';
  const bs = b.querySelectorAll('.piano button'), pl = i => { a.note(K[i][1], .7, 'triangle', .3); a.score(++n); bs[i].classList.add('ok'); setTimeout(() => bs[i].classList.remove('ok'), 150); };
  bs.forEach((z, i) => z.onclick = () => pl(i));
  a.ev(document, 'keydown', e => { const i = 'ASDFGHJK'.indexOf(e.key.toUpperCase()); if (i >= 0 && !e.repeat) pl(i); });
}

function words(b, a) {
  const order = shuf([['CAT', '🐱'], ['DOG', '🐶'], ['SUN', '☀️'], ['BEE', '🐝'], ['PIG', '🐷'], ['BUS', '🚌'], ['HAT', '🎩'], ['FISH', '🐟']]).slice(0, 5); let i = 0, s = 0;
  const next = () => {
    if (i >= 5) return a.win(`You built ${s} words!`);
    const [w, e] = order[i++]; let t = '';
    b.innerHTML = `<div class="big">${e}</div><div class="slots">${[...w].map(() => '<span></span>').join('')}</div><div class="opts">${shuf([...w]).map(ch => `<button>${ch}</button>`).join('')}</div><small>${i}/5</small>`;
    const sl = b.querySelectorAll('.slots span'), bs = b.querySelectorAll('.opts button');
    bs.forEach(z => z.onclick = () => {
      if (z.disabled) return; t += z.textContent; z.disabled = true; sl[t.length - 1].textContent = z.textContent; a.sfx('move');
      if (t.length < w.length) return;
      if (t === w) { s++; a.score(s); a.sfx('good'); a.cheer(); a.later(next, 1000); }
      else { a.say("Let's Try Again!"); a.sfx('bad'); a.later(() => { t = ''; sl.forEach(q => q.textContent = ''); bs.forEach(q => q.disabled = false); }, 700); }
    });
  };
  next();
}

function dino(b, a) {
  const [c, x] = cv(b, 480, 220); let y = 0, v = 0, s = 0, ob = [], spd = 240, t = 0;
  const j = () => { if (y === 0) { v = 560; a.sfx('move'); } };
  a.ev(c, 'pointerdown', j); a.ev(document, 'keydown', e => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); j(); } });
  b.insertAdjacentHTML('beforeend', '<p>Tap, click or press Space to jump! Collect ⭐ and hop over 🌵</p>');
  a.loop(dt => {
    x.clearRect(0, 0, 480, 220); v -= 1500 * dt; y = Math.max(0, y + v * dt); if (y === 0) v = 0; spd += 5 * dt; t -= dt;
    if (t <= 0) { ob.push({ x: 500, e: R(3) ? '🌵' : '⭐' }); t = .9 + Math.random() * 1.1; }
    x.fillStyle = '#a1887f'; x.fillRect(0, 185, 480, 35); em(x, '🦖', 60, 160 - y, 48);
    ob = ob.filter(o => {
      o.x -= spd * dt; const star = o.e === '⭐'; em(x, o.e, o.x, star ? 105 : 163, 36);
      if (Math.abs(o.x - 60) < 26) {
        if (star && Math.abs(160 - y - 105) < 40) { s++; a.score(s); a.sfx('pop'); if (s >= 10) a.win('You collected 10 stars!'); return false; }
        if (!star && y < 32) { a.over(`Nice run! ${s} stars`); return false; }
      } return o.x > -30;
    });
  });
}

function connect(b, a) {
  const E = shuf(['🐶', '🍎', '🚗', '⭐', '🐟', '🌸']).slice(0, 5), btn = e => `<button data-e="${e}">${e}</button>`;
  b.innerHTML = `<p>Tap one on the left, then its match on the right</p><div class="cn"><div>${shuf(E).map(btn).join('')}</div><div>${shuf(E).map(btn).join('')}</div><svg></svg></div>`;
  const cn = b.querySelector('.cn'), svg = cn.querySelector('svg'), [l, r] = cn.querySelectorAll('div'); let sel = null, n = 0;
  l.onclick = e => { const t = e.target.closest('button'); if (!t || t.disabled) return; l.querySelectorAll('button').forEach(z => z.classList.remove('sel')); t.classList.add('sel'); sel = t; a.sfx('move'); };
  r.onclick = e => {
    const t = e.target.closest('button'); if (!t || t.disabled || !sel) return;
    if (t.dataset.e !== sel.dataset.e) { a.sfx('bad'); a.say('Look again!'); return; }
    const q = cn.getBoundingClientRect(), p1 = sel.getBoundingClientRect(), p2 = t.getBoundingClientRect();
    svg.insertAdjacentHTML('beforeend', `<line x1="${p1.right - q.left}" y1="${p1.top + p1.height / 2 - q.top}" x2="${p2.left - q.left}" y2="${p2.top + p2.height / 2 - q.top}" stroke="hsl(${n * 70},80%,50%)" stroke-width="6" stroke-linecap="round"/>`);
    sel.disabled = t.disabled = true; sel.classList.remove('sel'); sel = null; a.score(++n); a.sfx('good');
    if (n === 5) a.win('Everything is connected!');
  };
}

function diff(b, a) {
  let r = 0, s = 0; const P = ['🍎', '🍌', '🐶', '🐱', '⭐', '🌸', '🚗', '🎈'];
  const next = () => {
    if (r >= 5) return a.win('You found them all!');
    const k = 1 + (r >> 1); r++;
    const L = [...Array(9)].map(() => pick(P)), Rt = [...L], ix = shuf([...Array(9).keys()]).slice(0, k); let f = 0;
    ix.forEach(i => Rt[i] = pick(P.filter(p => p !== L[i])));
    b.innerHTML = `<p>Tap ${k > 1 ? 'the ' + k + ' differences' : 'the difference'} in the right picture! (${r}/5)</p><div class="df"><div class="g3">${L.map(e => `<span>${e}</span>`).join('')}</div><div class="g3">${Rt.map(e => `<button>${e}</button>`).join('')}</div></div>`;
    b.querySelectorAll('.g3 button').forEach((z, i) => z.onclick = () => {
      if (z.classList.contains('ok')) return;
      if (ix.includes(i)) { z.classList.add('ok'); a.sfx('good'); a.score(++s); if (++f === k) { a.cheer(); a.later(next, 900); } }
      else { a.sfx('bad'); a.say('Look again!'); }
    });
  };
  next();
}

function star(b, a) {
  const [c, x] = cv(b, 360, 480); let p = { x: 180, y: 400 }, tg = { x: 180, y: 400 }, s = 0, l = 3, inv = 0, st = { x: 180, y: 150 };
  const as = [...Array(4)].map(() => ({ x: R(360), y: R(300), vx: (R(2) ? 1 : -1) * (40 + R(40)), vy: (R(2) ? 1 : -1) * (40 + R(40)) }));
  const mv = e => { const q = pt(e, c); tg = { x: q[0], y: q[1] }; };
  a.ev(c, 'pointermove', mv); a.ev(c, 'pointerdown', mv);
  a.ev(document, 'keydown', e => { const d = { ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, -30], ArrowDown: [0, 30] }[e.key]; if (d) { e.preventDefault(); tg = { x: tg.x + d[0], y: tg.y + d[1] }; } });
  a.loop(dt => {
    x.clearRect(0, 0, 360, 480); p.x += (tg.x - p.x) * Math.min(1, dt * 8); p.y += (tg.y - p.y) * Math.min(1, dt * 8); inv -= dt;
    em(x, '⭐', st.x, st.y, 36);
    if (Math.hypot(p.x - st.x, p.y - st.y) < 34) { s++; a.score(s); a.sfx('pop'); st = { x: 30 + R(300), y: 30 + R(420) }; if (s >= 15) return a.win('You collected 15 stars!'); }
    as.forEach(o => {
      o.x += o.vx * dt; o.y += o.vy * dt; if (o.x < 10 || o.x > 350) o.vx *= -1; if (o.y < 10 || o.y > 470) o.vy *= -1; em(x, '☄️', o.x, o.y, 34);
      if (inv <= 0 && Math.hypot(p.x - o.x, p.y - o.y) < 30) { l--; inv = 1.5; a.sfx('bad'); a.say('Bump! Keep going!'); if (l <= 0) a.over(`You got ${s} stars!`); }
    });
    if (inv <= 0 || (inv * 10 | 0) % 2) em(x, '🚀', p.x, p.y, 40);
    em(x, '❤️'.repeat(Math.max(l, 0)), 50, 24, 20);
  });
}

function bubble(b, a) {
  const W = 380, H = 540, r = 20, C = 9, K = ['#ff5252', '#40c4ff', '#69f0ae', '#ffd740', '#e040fb'];
  const [c, x] = cv(b, W, H); let par = 0, g = [], s = 0, shots = 0, cur = R(5), nx = R(5), m = null, aim = [0, -1];
  const row = () => Array(C).fill(-1), ctr = (i, j) => [r + j * 2 * r + ((i + par) % 2 ? r : 0), r + i * 35];
  for (let i = 0; i < 5; i++) g.push(row().map(() => R(5))); g.push(row());
  const nb = (i, j) => { const d = (i + par) % 2 ? [0, 1] : [-1, 0]; return [[i, j - 1], [i, j + 1], ...[-1, 1].flatMap(k => d.map(e => [i + k, j + e]))].filter(([p, q]) => p >= 0 && q >= 0 && q < C && p < g.length); };
  const grp = (i, j, ok) => { const st = [[i, j]], seen = new Set(), o = []; while (st.length) { const [p, q] = st.pop(), k = p * C + q; if (seen.has(k) || g[p][q] < 0 || !ok(g[p][q])) continue; seen.add(k); o.push([p, q]); nb(p, q).forEach(z => st.push(z)); } return o; };
  const dot = (px, py, col, rad = r - 1) => { x.beginPath(); x.arc(px, py, rad, 0, 7); x.fillStyle = col; x.fill(); x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(px - rad / 3, py - rad / 3, rad / 4, 0, 7); x.fill(); };
  const dir = e => { const q = pt(e, c), dx = q[0] - W / 2, dy = Math.min(q[1] - (H - 30), -30), d = Math.hypot(dx, dy); return [dx / d, dy / d]; };
  a.ev(c, 'pointermove', e => aim = dir(e));
  a.ev(c, 'pointerdown', e => { if (m) return; aim = dir(e); m = { x: W / 2, y: H - 30, vx: aim[0] * 620, vy: aim[1] * 620, k: cur }; cur = nx; nx = R(5); a.sfx('move'); });
  const land = () => {
    let best = null, bd = 1e9;
    g.forEach((rw, i) => rw.forEach((v, j) => { if (v < 0) { const [cx, cy] = ctr(i, j), d = Math.hypot(cx - m.x, cy - m.y); if (d < bd) { bd = d; best = [i, j]; } } }));
    const [i, j] = best, k = m.k; g[i][j] = k; m = null; shots++;
    const t = grp(i, j, v => v === k);
    if (t.length >= 3) {
      t.forEach(([p, q]) => g[p][q] = -1); s += t.length * 10; a.sfx('pop');
      const ok = new Set(); g[0].forEach((v, q) => { if (v >= 0) grp(0, q, () => true).forEach(([p, z]) => ok.add(p * C + z)); });
      g.forEach((rw, p) => rw.forEach((v, q) => { if (v >= 0 && !ok.has(p * C + q)) { g[p][q] = -1; s += 20; } })); // floating bubbles fall
    } else a.sfx('click');
    if (shots % 7 === 0) { g.unshift(row().map(() => R(5))); par ^= 1; a.say('New row!'); } // challenge grows
    while (g.length > 1 && g[g.length - 1].every(v => v < 0) && g[g.length - 2].every(v => v < 0)) g.pop();
    if (g[g.length - 1].some(v => v >= 0)) g.push(row());
    a.score(s);
    if (g.every(rw => rw.every(v => v < 0))) return a.win('All bubbles popped!');
    if (g.some((rw, p) => p >= 11 && rw.some(v => v >= 0))) a.over(`Score ${s}`);
  };
  a.loop(dt => {
    x.clearRect(0, 0, W, H);
    if (m) for (let z = 0; z < 4 && m; z++) {
      m.x += m.vx * dt / 4; m.y += m.vy * dt / 4;
      if (m.x < r || m.x > W - r) { m.vx *= -1; m.x = Math.max(r, Math.min(W - r, m.x)); }
      if (m.y <= r || g.some((rw, i) => rw.some((v, j) => v >= 0 && Math.hypot(ctr(i, j)[0] - m.x, ctr(i, j)[1] - m.y) < r * 1.85))) land();
    }
    g.forEach((rw, i) => rw.forEach((v, j) => { if (v >= 0) dot(...ctr(i, j), K[v]); }));
    if (!m) { x.setLineDash([6, 8]); x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2, H - 30); x.lineTo(W / 2 + aim[0] * 130, H - 30 + aim[1] * 130); x.stroke(); x.setLineDash([]); dot(W / 2, H - 30, K[cur]); }
    else dot(m.x, m.y, K[m.k]);
    dot(50, H - 30, K[nx], 12); x.fillStyle = '#fff'; x.font = '14px sans-serif'; x.textAlign = 'center'; x.fillText('Next', 50, H - 8);
  });
}

// Jigsaw-style picture puzzle: tap a piece, then tap another to swap. Pictures are drawn in-browser.
function img(p) {
  const c = document.createElement('canvas'); c.width = c.height = 360; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 360, 360);
  g.addColorStop(0, p.b[0]); g.addColorStop(1, p.b[1]); x.fillStyle = g; x.fillRect(0, 0, 360, 360);
  for (let i = 0; i < 9; i++) em(x, p.x[i % p.x.length], 40 + i * 83 % 300, 40 + i * 131 % 300, 44);
  em(x, p.e, 180, 185, 210); return c.toDataURL();
}
const puzzle = pics => (b, a) => {
  let P = pics[0], n = 3, arr = [], sel = -1, url = '';
  const draw = () => {
    b.innerHTML = `<div class="pk">${pics.map((p, i) => `<button data-p="${i}" class="${p === P ? 'on' : ''}">${p.e}</button>`).join('')}</div>
    <div class="pk">${[['Easy', 2], ['Medium', 3], ['Hard', 4]].map(([t, k]) => `<button data-n="${k}" class="${k === n ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="pz" style="grid-template-columns:repeat(${n},1fr)">${arr.map((v, i) => `<button class="${v === i ? 'fit' : ''}${i === sel ? ' sel' : ''}" style="background-image:url('${url}');background-size:${n * 100}% ${n * 100}%;background-position:${(v % n) / (n - 1) * 100}% ${(v / n | 0) / (n - 1) * 100}%"></button>`).join('')}</div>`;
    b.querySelectorAll('[data-p]').forEach(z => z.onclick = () => { P = pics[z.dataset.p]; mk(); });
    b.querySelectorAll('[data-n]').forEach(z => z.onclick = () => { n = +z.dataset.n; mk(); });
    b.querySelectorAll('.pz button').forEach((z, i) => z.onclick = () => {
      if (sel < 0) { sel = i; a.sfx('click'); return draw(); }
      if (sel !== i) { [arr[sel], arr[i]] = [arr[i], arr[sel]]; a.sfx(arr[i] === i ? 'good' : 'move'); } sel = -1;
      a.score(arr.filter((v, k) => v === k).length); draw();
      if (arr.every((v, k) => v === k)) a.win('Puzzle complete!');
    });
  };
  const mk = () => { url = img(P); arr = shuf([...Array(n * n).keys()]); while (arr.every((v, i) => v === i)) arr = shuf(arr); sel = -1; a.score(0); draw(); };
  mk();
};
const jigsaw = puzzle([{ b: ['#7ee0ff', '#c6ffdd'], e: '🏰', x: ['☁️', '⭐'] }, { b: ['#ffd1ff', '#fff3a0'], e: '🚀', x: ['⭐', '🌙'] }, { b: ['#a1ffce', '#faffd1'], e: '🌈', x: ['🌸', '🦋'] }]);
const animalPuzzle = puzzle([{ b: ['#ffe082', '#ffab91'], e: '🦁', x: ['🌴', '🌼'] }, { b: ['#b9f6ca', '#e1f5fe'], e: '🐼', x: ['🎋', '🌿'] }, { b: ['#b3e5fc', '#e8eaf6'], e: '🐘', x: ['☁️', '💧'] }, { b: ['#80deea', '#0097a7'], e: '🐠', x: ['🫧', '🐚'] }]);

// c: learn | puzzle | action | music.  m: music track
export default [
  { id: 'bubble-pop', n: 'Bubble Pop', c: 'action', i: '🫧', d: 'Aim, shoot and pop 3 matching bubbles!', m: 'lively', run: bubble },
  { id: 'number-kids', n: 'Number Kids', c: 'learn', i: '🔢', d: 'Count the objects. Gets harder as you go!', m: 'learn', run: number },
  { id: 'jigsaw', n: 'Jigsaw Puzzle Kids', c: 'puzzle', i: '🧩', d: 'Swap pieces to finish the picture.', m: 'calm', run: jigsaw },
  { id: 'memory', n: 'Memory Match', c: 'puzzle', i: '🃏', d: 'Flip cards and find the pairs.', m: 'calm', run: memory },
  { id: 'color-splash', n: 'Color Splash', c: 'learn', i: '🎨', d: 'Which color is it?', m: 'learn', run: color },
  { id: 'animal-sounds', n: 'Animal Sounds', c: 'learn', i: '🐮', d: 'Hear the sound, pick the animal.', m: 'learn', run: animals },
  { id: 'abc', n: 'ABC Letter Adventure', c: 'learn', i: '🔤', d: 'Match letters with pictures.', m: 'learn', run: abc },
  { id: 'shapes', n: 'Shape Matcher', c: 'learn', i: '🔷', d: 'Name the shapes.', m: 'learn', run: shapes },
  { id: 'fruit-catcher', n: 'Fruit Catcher', c: 'action', i: '🍎', d: 'Catch fruit, dodge the rocks!', m: 'energy', run: fruit },
  { id: 'balloons', n: 'Balloon Pop Party', c: 'action', i: '🎈', d: 'Pop as many balloons as you can!', m: 'lively', run: balloons },
  { id: 'maze', n: 'Maze Explorer', c: 'action', i: '🧭', d: 'Help the chick find the flag.', m: 'energy', run: maze },
  { id: 'piano', n: 'Little Piano', c: 'music', i: '🎹', d: 'Play colorful musical keys.', m: null, run: piano },
  { id: 'word-builder', n: 'Word Builder Kids', c: 'learn', i: '🔠', d: 'Put the letters in order.', m: 'learn', run: words },
  { id: 'pattern', n: 'Pattern Master', c: 'puzzle', i: '🔴', d: 'What comes next?', m: 'calm', run: pattern },
  { id: 'dino-jump', n: 'Dino Jump', c: 'action', i: '🦖', d: 'Jump cacti, grab stars!', m: 'energy', run: dino },
  { id: 'connect', n: 'Colorful Connect', c: 'puzzle', i: '🔗', d: 'Link the matching pairs.', m: 'calm', run: connect },
  { id: 'difference', n: 'Find the Difference', c: 'puzzle', i: '🔍', d: 'Spot what changed.', m: 'calm', run: diff },
  { id: 'animal-puzzle', n: 'Animal Puzzle', c: 'puzzle', i: '🦁', d: 'Rebuild animal pictures.', m: 'calm', run: animalPuzzle },
  { id: 'happy-math', n: 'Happy Math Challenge', c: 'learn', i: '➕', d: 'Add and subtract.', m: 'learn', run: math },
  { id: 'star-collector', n: 'Star Collector', c: 'action', i: '🚀', d: 'Fly, collect stars, dodge comets.', m: 'energy', run: star },
];
