// Web Audio only: no audio files, no external services.
// Music starts only after the first tap (browser autoplay rule).
let ctx, timer, cur = null, step = 0;
let mm = 0, sm = 0; // music muted, sfx muted (kept for this session only)
try { mm = +sessionStorage.getItem('kx_m') || 0; sm = +sessionStorage.getItem('kx_s') || 0; } catch {}
const save = () => { try { sessionStorage.setItem('kx_m', mm); sessionStorage.setItem('kx_s', sm); } catch {} };
const SC = [262, 294, 330, 392, 440, 523, 587];
// name: [bpm, wave, volume, note pattern]
const T = {
  home:   [220, 'sine', .06, [0, 2, 4, 5, 4, 2, 1, 3]],
  calm:   [190, 'sine', .06, [0, 4, 2, 4, 0, 5, 3, 1]],
  lively: [330, 'triangle', .07, [0, 3, 1, 4, 2, 5, 3, 6]],
  learn:  [250, 'triangle', .06, [0, 2, 1, 3, 2, 4, 3, 5]],
  energy: [400, 'square', .03, [0, 0, 3, 3, 4, 4, 2, 5]],
};
const SF = { good: [523, 659, 784], bad: [330, 294], pop: [880, 1175], win: [523, 659, 784, 1047, 1319], click: [440], move: [370] };

function tone(f, d = .15, t = 'sine', v = .15, at = 0) {
  try {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), n = ctx.currentTime + at;
    o.type = t; o.frequency.value = f;
    g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(.001, n + d);
    o.connect(g); g.connect(ctx.destination); o.start(n); o.stop(n + d + .02);
  } catch {}
}
function run() {
  clearInterval(timer);
  const t = T[cur];
  if (!t || !ctx || mm) return;
  timer = setInterval(() => { tone(SC[t[3][step++ % 8]], .3, t[1], t[2]); }, 60000 / t[0] * 1);
}
export const A = {
  init() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      run();
    } catch {}
  },
  music(n) { cur = n; clearInterval(timer); run(); },   // one track at a time
  sfx(k) { if (!sm) (SF[k] || SF.click).forEach((f, i) => tone(f, .18, 'triangle', .14, i * .09)); },
  note(f, d, t, v) { if (!sm) tone(f, d, t, v); },
  toggleMusic() { mm ^= 1; save(); mm ? clearInterval(timer) : (A.init(), run()); return !mm; },
  toggleSfx() { sm ^= 1; save(); return !sm; },
  get mOn() { return !mm; }, get sOn() { return !sm; },
};
