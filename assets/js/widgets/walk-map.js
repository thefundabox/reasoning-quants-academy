/* ============================================================
   Walk map — trace a route and read the displacement off it.

   Engine adapted from the original direction-sense module, including
   its quadrant rule for naming a direction: exams want the QUADRANT
   ("North-East"), never the nearest 45° bearing.
   ============================================================ */

import { FULL, LEFT, RIGHT, BACK } from './compass.js';

const STEP = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] };

export function trace(legs) {
  let x = 0, y = 0;
  const pts = [[0, 0]];
  legs.forEach(l => { x += STEP[l.dir][0] * l.d; y += STEP[l.dir][1] * l.d; pts.push([x, y]); });
  return pts;
}

export function compassDir(dx, dy) {
  if (dx === 0 && dy === 0) return 'the starting point';
  if (dx === 0) return dy > 0 ? 'North' : 'South';
  if (dy === 0) return dx > 0 ? 'East' : 'West';
  return (dy > 0 ? 'North' : 'South') + '-' + (dx > 0 ? 'East' : 'West');
}

export function walkSVG(legs, { w = 520, h = 380 } = {}) {
  const pts = trace(legs);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs, 0), maxX = Math.max(...xs, 0);
  const minY = Math.min(...ys, 0), maxY = Math.max(...ys, 0);
  const sc = Math.min((w - 90) / Math.max(maxX - minX, 1), (h - 90) / Math.max(maxY - minY, 1), 26);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const P = pts.map(p => [w / 2 + (p[0] - cx) * sc, h / 2 - (p[1] - cy) * sc]);

  let grid = '';
  for (let i = 40; i < w; i += 40) grid += `<line class="wm-grid" x1="${i}" y1="0" x2="${i}" y2="${h}"/>`;
  for (let j = 40; j < h; j += 40) grid += `<line class="wm-grid" x1="0" y1="${j}" x2="${w}" y2="${j}"/>`;

  const a = P[0], b = P[P.length - 1];
  const dx = legs.reduce((s, l) => s + STEP[l.dir][0] * l.d, 0);
  const dy = legs.reduce((s, l) => s + STEP[l.dir][1] * l.d, 0);
  const dist = Math.hypot(dx, dy);

  let s = grid;
  if (dist > 0.01)
    s += `<line class="wm-disp" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
  s += `<polyline class="wm-path" points="${P.map(p => p.join(',')).join(' ')}"/>`;
  // leg labels
  legs.forEach((l, i) => {
    const m = [(P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2];
    s += `<text class="wm-leg" x="${m[0]}" y="${m[1] - 6}" text-anchor="middle">${l.d}</text>`;
  });
  s += `<circle class="wm-start" cx="${a[0]}" cy="${a[1]}" r="6"/>
        <text class="wm-tag wm-tag--s" x="${a[0]}" y="${a[1] - 13}" text-anchor="middle">START</text>
        <circle class="wm-end" cx="${b[0]}" cy="${b[1]}" r="6"/>
        <text class="wm-tag wm-tag--e" x="${b[0]}" y="${b[1] - 13}" text-anchor="middle">END</text>`;
  return { svg: `<svg viewBox="0 0 ${w} ${h}" class="wm-svg">${s}</svg>`, dx, dy, dist };
}

/* ---------------- interactive ---------------- */

/* Scripted-action surface — see turnDialMachine in compass.js.
   The distance box takes any number from 1 to 20, so the enumeration offers a
   stated few: the lengths the seeded route already uses, plus both ends of the
   box's range. Those are what a gate about cancelling out can possibly need —
   a route only returns home by retracing the distances it already walked. */
export function walkMapMachine({ seed = [] } = {}) {
  const DISTANCES = [...new Set([1, 20, ...seed.map(l => l.d)])].sort((a, b) => a - b);
  const facingOf = legs => (legs.length ? legs[legs.length - 1].dir : 'N');
  const TURN = { L: LEFT, R: RIGHT, U: BACK };
  const turnWord = { L: 'left', R: 'right', U: 'U-turn' };

  return {
    init: { legs: seed.slice() },
    actions: st => [
      ...['N', 'E', 'S', 'W'].flatMap(dir => DISTANCES.map(d => `walk:${dir}:${d}`)),
      ...(st.legs.length ? ['L', 'R', 'U'].flatMap(t => DISTANCES.map(d => `turn:${t}:${d}`)) : []),
      ...st.legs.map((_, i) => `del:${i}`),
      'clear',
    ],
    act(st, a) {
      const [kind, x, y] = a.split(':');
      if (kind === 'clear') return { legs: [] };
      if (kind === 'del') return { legs: st.legs.filter((_, i) => i !== +x) };
      if (kind === 'walk') return { legs: [...st.legs, { dir: x, d: +y }] };
      const dir = TURN[x][facingOf(st.legs)], d = +y;
      return { legs: [...st.legs, { dir, d, viaTurn: true,
                                    label: `${turnWord[x]} → ${d} km ${FULL[dir]}` }] };
    },
    report(st) {
      const last = trace(st.legs).pop();
      return { legs: st.legs.slice(), count: st.legs.length,
               dx: last[0], dy: last[1], dist: Math.hypot(last[0], last[1]),
               usedTurn: st.legs.some(l => l.viaTurn),
               returnedHome: st.legs.length > 1 && last[0] === 0 && last[1] === 0,
               diagonal: last[0] !== 0 && last[1] !== 0 };
    },
  };
}

export function walkMap(cfg = {}) {
  const M = walkMapMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="wm">
        <div class="wm-stage" id="wmStage"></div>
        <div class="wm-controls">
          <div class="wm-row">
            <input class="wm-num" id="wmD" type="number" min="1" max="20" value="4" aria-label="Distance in km">
            <select class="wm-sel" id="wmDir" aria-label="Direction">
              ${['N', 'E', 'S', 'W'].map(d => `<option value="${d}">km ${FULL[d]}</option>`).join('')}
            </select>
            <button class="btn wm-add" id="wmAdd">Add</button>
          </div>
          <div class="wm-row">
            <select class="wm-sel" id="wmTurn" aria-label="Turn">
              <option value="L">turn left, then walk</option>
              <option value="R">turn right, then walk</option>
              <option value="U">U-turn, then walk</option>
            </select>
            <button class="btn btn--ghost wm-add" id="wmTurnAdd">Add turn</button>
          </div>
          <div class="wm-legs" id="wmLegs"></div>
          <button class="btn btn--ghost wm-add" id="wmClear">Clear route</button>
          <div class="wm-read" id="wmRead"></div>
        </div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const legs = st.legs;
      if (!legs.length) {
        $('wmStage').innerHTML = `<div class="wm-empty">Add a leg — the route draws itself.</div>`;
        $('wmRead').innerHTML = '';
      } else {
        const { svg, dx, dy, dist } = walkSVG(legs);
        $('wmStage').innerHTML = svg;
        const whole = Math.abs(dist - Math.round(dist)) < 1e-9;
        $('wmRead').innerHTML = dist < 0.01
          ? `<b>Back at the start.</b> Every leg cancelled out — displacement is zero.`
          : `<div class="wm-net"><span>net</span>
               <b>${Math.abs(dy)} ${dy ? FULL[dy > 0 ? 'N' : 'S'] : ''}</b>
               <b>${Math.abs(dx)} ${dx ? FULL[dx > 0 ? 'E' : 'W'] : ''}</b></div>
             <div class="wm-ans"><span>straight-line distance</span>
               <b>${whole ? dist : dist.toFixed(2)} km</b></div>
             <div class="wm-ans"><span>direction from start</span><b>${compassDir(dx, dy)}</b></div>`;
      }
      $('wmLegs').innerHTML = legs.map((l, i) =>
        `<span class="wm-chip">${l.label || `${l.d} km ${FULL[l.dir]}`}
           <button data-i="${i}" aria-label="remove">×</button></span>`).join('');
      $('wmLegs').querySelectorAll('button').forEach(b =>
        b.onclick = () => { st = M.act(st, `del:${b.dataset.i}`); draw(); });

      api.report?.(M.report(st));
    };

    $('wmAdd').onclick = () => {
      const d = Math.max(1, +$('wmD').value || 0);
      st = M.act(st, `walk:${$('wmDir').value}:${d}`); draw();
    };
    $('wmTurnAdd').onclick = () => {
      if (!st.legs.length) { $('wmDir').focus(); return; }
      const d = Math.max(1, +$('wmD').value || 0);
      st = M.act(st, `turn:${$('wmTurn').value}:${d}`); draw();
    };
    $('wmClear').onclick = () => { st = M.act(st, 'clear'); draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/** Static route, for reveal steps. */
export function staticWalk(legs) {
  return el => {
    const { svg, dx, dy, dist } = walkSVG(legs, { w: 520, h: 340 });
    const whole = Math.abs(dist - Math.round(dist)) < 1e-9;
    el.innerHTML = `<div class="wm-stage">${svg}</div>
      <div class="wm-read"><div class="wm-ans"><span>displacement</span>
        <b>${whole ? dist : dist.toFixed(2)} km ${compassDir(dx, dy)}</b></div></div>`;
    return { destroy() {} };
  };
}
