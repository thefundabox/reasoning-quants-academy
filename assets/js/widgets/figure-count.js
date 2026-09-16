/* ============================================================
   Figure counting — hunt every sub-figure, one size class at a time.

   The sub-figures are ENUMERATED, not asserted: each figure lists the
   actual polygons, so the total is whatever the list contains and the
   diagram cannot disagree with the number. Classes are derived from
   polygon area, which is what "count by size class" means in practice.

   Geometry adapted from the original figure-counting module.
   ============================================================ */

const U = 110, OX = 40, OY = 30;
const P = (x, y) => [OX + x * U, OY + y * U];
const poly = pts => pts.map(p => P(p[0], p[1]).join(',')).join(' ');
const shoelace = pts => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a / 2);
};

const line = (a, b) => `<line class="fc-edge" x1="${P(...a)[0]}" y1="${P(...a)[1]}" x2="${P(...b)[0]}" y2="${P(...b)[1]}"/>`;

export const FIGURES = [
  {
    id: 'grid3', name: '3 × 3 grid', ask: 'How many SQUARES?', answer: 14,
    base: () => { let s = ''; for (let i = 0; i <= 3; i++) { s += line([i, 0], [i, 3]) + line([0, i], [3, i]); } return s; },
    subs: () => { const r = []; for (let k = 1; k <= 3; k++) for (let i = 0; i + k <= 3; i++) for (let j = 0; j + k <= 3; j++)
      r.push([[i, j], [i + k, j], [i + k, j + k], [i, j + k]]); return r; },
    breakdown: '1×1: <b>9</b> · 2×2: <b>4</b> · 3×3: <b>1</b> — total <b>14</b>. Formula: 1² + 2² + 3².',
  },
  {
    id: 'rect23', name: '2 × 3 grid', ask: 'How many RECTANGLES (squares included)?', answer: 18,
    base: () => { let s = ''; for (let i = 0; i <= 3; i++) s += line([i, 0], [i, 2]); for (let j = 0; j <= 2; j++) s += line([0, j], [3, j]); return s; },
    subs: () => { const r = []; for (let x1 = 0; x1 < 3; x1++) for (let x2 = x1 + 1; x2 <= 3; x2++)
      for (let y1 = 0; y1 < 2; y1++) for (let y2 = y1 + 1; y2 <= 2; y2++)
        r.push([[x1, y1], [x2, y1], [x2, y2], [x1, y2]]); return r; },
    breakdown: 'Choose 2 of the 4 vertical lines × 2 of the 3 horizontal lines: C(4,2) × C(3,2) = 6 × 3 = <b>18</b>.',
  },
  {
    id: 'fan', name: 'Triangle fan', ask: 'How many TRIANGLES?', answer: 10,
    base: () => { const rays = [[0, 2], [0.5, 2], [1, 2], [1.5, 2], [2, 2]];
      return line([0, 2], [2, 2]) + rays.map(b => line([1, 0], b)).join(''); },
    subs: () => { const rays = [[0, 2], [0.5, 2], [1, 2], [1.5, 2], [2, 2]], r = [];
      for (let i = 0; i < rays.length; i++) for (let j = i + 1; j < rays.length; j++) r.push([[1, 0], rays[i], rays[j]]);
      return r; },
    breakdown: 'Base split into 4 parts → 4 + 3 + 2 + 1 = <b>10</b>. Formula: n(n+1)/2.',
  },
  {
    id: 'diag', name: 'Square + both diagonals', ask: 'How many TRIANGLES?', answer: 8,
    base: () => line([0, 0], [2, 0]) + line([2, 0], [2, 2]) + line([2, 2], [0, 2]) + line([0, 2], [0, 0])
              + line([0, 0], [2, 2]) + line([0, 2], [2, 0]),
    subs: () => [
      [[0, 0], [1, 0], [1, 1]], [[1, 0], [2, 0], [1, 1]], [[2, 0], [2, 1], [1, 1]], [[2, 1], [2, 2], [1, 1]],
      [[2, 2], [1, 2], [1, 1]], [[1, 2], [0, 2], [1, 1]], [[0, 2], [0, 1], [1, 1]], [[0, 1], [0, 0], [1, 1]],
    ],
    breakdown: '4 small triangles round the centre + 4 large half-squares = <b>8</b>.',
  },
];

export function figureCount({ start = 0 } = {}) {
  return (el, api = {}) => {
    let fi = start, state = null;

    const load = () => {
      const f = FIGURES[fi];
      const subs = f.subs().map((pts, i) => ({ pts, i, area: Math.round(shoelace(pts) * 1000) / 1000, found: false }));
      const classes = [...new Set(subs.map(s => s.area))].sort((a, b) => a - b);
      state = { f, subs, classes, cur: 0 };
      render();
    };

    const render = () => {
      const { f, subs, classes, cur } = state;
      const found = subs.filter(s => s.found).length;
      const done = found === subs.length;

      el.innerHTML = `
        <div class="fc">
          <div class="fc-picker" id="fcPick">
            ${FIGURES.map((x, i) => `<button class="fc-fig ${i === fi ? 'is-on' : ''}" data-i="${i}">${x.name}</button>`).join('')}
          </div>
          <p class="fc-ask">${f.ask}</p>
          <div class="fc-classes" id="fcCls">
            ${classes.map((a, ci) => {
              const inC = subs.filter(s => s.area === a), got = inC.filter(s => s.found).length;
              return `<button class="fc-cls ${ci === cur ? 'is-on' : ''} ${got === inC.length ? 'is-done' : ''}"
                        data-c="${ci}">Size ${ci + 1}: ${got}/${inC.length}</button>`;
            }).join('')}
          </div>
          <div class="fc-stage"><svg viewBox="0 0 400 300" class="fc-svg" id="fcSvg" role="img"
               aria-label="${f.name}"></svg></div>
          <div class="fc-read">
            <b class="num">${found} / ${subs.length}</b><span>found</span>
            ${done ? `<span class="fc-win">Complete.</span>` : ''}
          </div>
          ${done ? `<div class="fc-break">${f.breakdown}</div>` : ''}
          <button class="btn btn--ghost fc-btn" id="fcHint">Flash what I am missing in this class</button>
        </div>`;

      drawSvg();
      el.querySelectorAll('.fc-fig').forEach(b => b.onclick = () => { fi = +b.dataset.i; load(); });
      el.querySelectorAll('.fc-cls').forEach(b => b.onclick = () => { state.cur = +b.dataset.c; render(); });
      el.querySelector('#fcHint').onclick = flashMissing;

      api.report?.({ figure: f.id, found, total: subs.length, allFound: done,
                     classes: classes.length,
                     classesComplete: classes.filter(a => subs.filter(s => s.area === a).every(s => s.found)).length });
    };

    const drawSvg = () => {
      const { f, subs, classes, cur } = state;
      const area = classes[cur];
      el.querySelector('#fcSvg').innerHTML =
        f.base() +
        subs.filter(s => s.found).map(s => `<polygon class="fc-found" points="${poly(s.pts)}"/>`).join('') +
        subs.filter(s => !s.found && s.area === area).map(s =>
          `<polygon class="fc-hit" points="${poly(s.pts)}" data-i="${s.i}"><title>click to count</title></polygon>`).join('');
      el.querySelectorAll('.fc-hit').forEach(p =>
        p.addEventListener('click', () => tap(+p.dataset.i)));
    };

    const tap = i => {
      const s = state.subs.find(x => x.i === i);
      if (!s || s.found) return;
      s.found = true;
      // jump to the next class that still has work
      const area = state.classes[state.cur];
      if (state.subs.filter(x => x.area === area && !x.found).length === 0) {
        const next = state.classes.findIndex(a => state.subs.some(x => x.area === a && !x.found));
        if (next >= 0) state.cur = next;
      }
      render();
    };

    const flashMissing = () => {
      const area = state.classes[state.cur];
      const missing = state.subs.filter(s => !s.found && s.area === area);
      const svg = el.querySelector('#fcSvg');
      missing.forEach(s => svg.insertAdjacentHTML('beforeend',
        `<polygon class="fc-miss" points="${poly(s.pts)}"/>`));
      setTimeout(() => svg.querySelectorAll('.fc-miss').forEach(n => n.remove()), 1400);
    };

    load();
    return { destroy() { el.innerHTML = ''; } };
  };
}
