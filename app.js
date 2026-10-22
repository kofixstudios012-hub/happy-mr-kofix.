import GAMES from './games.js';
import { A } from './audio.js';

const $ = s => document.querySelector(s), app = $('#app');
const CATS = [['all', 'All Games'], ['learn', 'Learning'], ['puzzle', 'Puzzles'], ['action', 'Action and Adventure'], ['music', 'Music and Creativity']];
const LABEL = Object.fromEntries(CATS);
let cat = 'all', q = '', cleanup = [], tt;
const stop = () => cleanup.splice(0).forEach(f => { try { f(); } catch {} });

// Browsers block audio until a tap: unlock on the first interaction.
['pointerdown', 'keydown'].forEach(e => document.addEventListener(e, () => A.init(), { once: true }));
const sync = () => { $('#mus').style.opacity = A.mOn ? 1 : .4; $('#snd').style.opacity = A.sOn ? 1 : .4; };
$('#mus').onclick = () => { A.toggleMusic(); sync(); };
$('#snd').onclick = () => { A.toggleSfx(); sync(); };
$('#home').onclick = () => location.hash = '#/';
sync();

function home() {
  stop(); A.music('home'); $('#home').hidden = true;
  app.innerHTML = `<section class="hero"><h2>Welcome to Happy Mr Kofix!</h2><p>Play, Learn, Explore, and Have Fun!</p>
    <button class="play" id="go">▶ Play Games</button><small>Tap to turn on the music 🎵</small></section>
    <div class="tabs">${CATS.map(([k, l]) => `<button class="tab ${k === cat ? 'on' : ''}" data-c="${k}">${l}</button>`).join('')}
    <input id="se" type="search" placeholder="🔍 Search games" aria-label="Search games" value="${q}"></div><div class="grid" id="gr"></div>`;
  const list = () => {
    const f = GAMES.filter(g => (cat === 'all' || g.c === cat) && g.n.toLowerCase().includes(q.toLowerCase()));
    $('#gr').innerHTML = f.map(g => `<button class="gc c-${g.c}" data-id="${g.id}"><span class="ic">${g.i}</span><b>${g.n}</b><small>${g.d}</small><em>${LABEL[g.c]}</em></button>`).join('') || '<p>No games found. Try another word!</p>';
    $('#gr').querySelectorAll('.gc').forEach(b => b.onclick = () => { A.init(); location.hash = '#/' + b.dataset.id; });
  };
  list();
  $('#go').onclick = () => { A.init(); A.music('home'); $('#gr').scrollIntoView({ behavior: 'smooth' }); };
  app.querySelectorAll('.tab').forEach(b => b.onclick = () => { cat = b.dataset.c; app.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === b)); list(); });
  $('#se').oninput = e => { q = e.target.value; list(); };
}

function play(g) {
  stop(); A.music(g.m); $('#home').hidden = false;
  app.innerHTML = `<div class="bar"><b>${g.i} ${g.n}</b><span id="sc">⭐ 0</span><button id="rs">↻ Restart</button><button id="bk">☰ All Games</button></div>
    <div id="box" class="box t-${g.c}"></div><div id="toast" aria-live="polite"></div>`;
  const box = $('#box');
  const end = (t, ok) => {
    stop(); A.sfx(ok ? 'win' : 'good');
    box.insertAdjacentHTML('beforeend', `<div class="ov"><h2>${ok ? '🎉' : '😊'} ${t}</h2><button id="ag">Play Again</button><button id="mn">All Games</button></div>`);
    $('#ag').onclick = start; $('#mn').onclick = () => location.hash = '#/';
  };
  const api = {
    sfx: A.sfx, note: A.note, win: t => end(t, 1), over: t => end(t, 0),
    score: n => $('#sc').textContent = '⭐ ' + n,
    say(t) { const e = $('#toast'); if (!e) return; e.textContent = t; clearTimeout(tt); tt = setTimeout(() => e.textContent = '', 1400); },
    cheer() { api.say(['Great Job!', 'Wonderful!', 'You Did It!'][Math.random() * 3 | 0]); },
    later(f, ms) { const t = setTimeout(f, ms); cleanup.push(() => clearTimeout(t)); },
    every(f, ms) { const i = setInterval(f, ms); cleanup.push(() => clearInterval(i)); },
    ev(t, e, f) { t.addEventListener(e, f); cleanup.push(() => t.removeEventListener(e, f)); },
    loop(f) { // requestAnimationFrame loop that stops cleanly
      let id, dead = 0, last = performance.now();
      const step = t => { if (dead) return; f(Math.min(.05, (t - last) / 1000)); last = t; if (!dead) id = requestAnimationFrame(step); };
      id = requestAnimationFrame(step); cleanup.push(() => { dead = 1; cancelAnimationFrame(id); });
    },
  };
  function start() {
    stop(); box.innerHTML = ''; api.score(0);
    try { g.run(box, api); } catch (e) { console.error(e); box.innerHTML = '<p>Oops! Something went wrong. Tap Restart.</p>'; }
  }
  $('#rs').onclick = start; $('#bk').onclick = () => location.hash = '#/';
  start();
}

function route() { const g = GAMES.find(x => x.id === location.hash.slice(2)); g ? play(g) : home(); }
window.addEventListener('hashchange', route); route();

// ---- WhatsApp booking (no email, no server) ----
const dlg = $('#dlg'), bf = $('#bf');
const open = e => { e.preventDefault(); $('#err').textContent = ''; bf.d.min = new Date().toISOString().slice(0, 10); dlg.showModal(); };
$('#book').onclick = $('#credit').onclick = open;
$('#cx').onclick = () => dlg.close();
bf.onsubmit = e => {
  e.preventDefault();
  const f = new FormData(bf), n = (f.get('n') || '').trim(), s = f.get('s'), d = f.get('d'), t = (f.get('t') || '').trim();
  if (!n || !s || !d) { $('#err').textContent = 'Please add your name, the service and a date.'; return; }
  const msg = `Hello Kofix! I would like to book a photography session.\n\nName: ${n}\nService: ${s}\nPreferred date: ${d}\nDetails: ${t || '-'}`;
  const url = 'https://wa.me/233534349054?text=' + encodeURIComponent(msg);
  $('#err').textContent = '';
  $('#fb').innerHTML = `WhatsApp should open with your message ready. Press <b>Send</b> inside WhatsApp to finish. Nothing is sent until you do. Did it not open? <a href="${url}" target="_blank" rel="noopener">Open WhatsApp here</a> or message +233 53 434 9054.`;
  window.open(url, '_blank', 'noopener');
};
