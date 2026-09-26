/* Counting figures — RAS 2015 Q103, 2016 Q105, 2018 Q106, 2021 Q113.
   Every count here is computed from the figure's own geometry and is also
   reachable by hand from the formula printed in the explanation. */
import { gen, ask, options, byTier } from './kit.js';
import { svg } from '../generators/figures.js';

const C2 = n => n * (n - 1) / 2;

const gridSVG = (m, n, cell = 34, shade = null) => {
  const w = n * cell, h = m * cell, pad = 12;
  const lines = [];
  for (let i = 0; i <= m; i++) lines.push(`<line x1="${pad}" y1="${pad + i * cell}" x2="${pad + w}" y2="${pad + i * cell}"/>`);
  for (let j = 0; j <= n; j++) lines.push(`<line x1="${pad + j * cell}" y1="${pad}" x2="${pad + j * cell}" y2="${pad + h}"/>`);
  const fill = shade
    ? `<rect x="${pad + shade[1] * cell}" y="${pad + shade[0] * cell}" width="${cell}" height="${cell}"
         fill="var(--accent, var(--brand))" opacity=".18"/>`
    : '';
  return svg(w + pad * 2, h + pad * 2,
    `${fill}<g stroke="var(--ink)" stroke-width="2" fill="none" stroke-linecap="square">${lines.join('')}</g>`);
};

/* Rectangles in a grid: choose two of the horizontal lines and two of the
   vertical ones. Squares are the special case where the sides match. */
const rectangles = (R, tier) => {
  const m = R.int(byTier(tier, 2, 3, 3), byTier(tier, 4, 5, 6));
  const n = R.int(byTier(tier, 2, 3, 4), byTier(tier, 5, 6, 7));
  if (m === n && m < 3) return null;
  const rect = C2(m + 1) * C2(n + 1);
  let squares = 0;
  for (let k = 1; k <= Math.min(m, n); k++) squares += (m - k + 1) * (n - k + 1);
  const wantSquares = R() < 0.4;
  const key = wantSquares ? squares : rect;
  return ask({
    context: `${gridSVG(m, n)}`,
    q: `How many <b>${wantSquares ? 'squares' : 'rectangles (including squares)'}</b> are there in the figure above?`,
    opts: options(String(key), [
      { v: String(wantSquares ? rect : squares), why: wantSquares
        ? 'That counts every rectangle. Only those with equal sides are squares.'
        : 'That counts only the squares — a rectangle need not have equal sides.' },
      { v: String(m * n), why: 'That is only the smallest cells. Bigger rectangles made of several cells also count.' },
      { v: String(key + m * n), why: '' },
      { v: String(Math.round(key / 2)), why: '' },
    ], i => String(key + 2 + i * 3)),
    why: wantSquares
      ? `Count squares by size. A k×k square fits in ${m} − k + 1 rows and ${n} − k + 1 columns:<br>
         ${[...Array(Math.min(m, n)).keys()].map(i => `${i + 1}×${i + 1}: ${(m - i) * (n - i)}`).join(' &nbsp;+&nbsp; ')}
         &nbsp;=&nbsp; <b>${squares}</b>.`
      : `A rectangle is fixed by choosing 2 of the ${m + 1} horizontal lines and 2 of the ${n + 1} vertical ones:<br>
         C(${m + 1},2) × C(${n + 1},2) = ${C2(m + 1)} × ${C2(n + 1)} = <b>${rect}</b>.
         (Of these, ${squares} are squares.)`,
    hardness: 1.2 + (m + n) / 4 + (wantSquares ? 0.5 : 0),
    concept: 'squares-vs-rectangles', conceptLabel: 'Counting by size class',
    source: 'Shape of RAS 2021, Q113',
  });
};

/* A fan: one apex, k lines drawn to the base. Triangles = pairs of rays. */
const fanTriangles = (R, tier) => {
  const k = R.int(byTier(tier, 2, 3, 4), byTier(tier, 4, 5, 7));      // interior cevians
  const total = (k + 1) * (k + 2) / 2;
  const w = 300, h = 170, pad = 14;
  const apex = [w / 2, pad];
  const rays = [...Array(k + 2).keys()].map(i => [pad + i * (w - 2 * pad) / (k + 1), h - pad]);
  const body = `<g stroke="var(--ink)" stroke-width="2" fill="none">
    <path d="M${apex[0]},${apex[1]} L${pad},${h - pad} L${w - pad},${h - pad} Z"/>
    ${rays.slice(1, -1).map(p => `<line x1="${apex[0]}" y1="${apex[1]}" x2="${p[0]}" y2="${p[1]}"/>`).join('')}
  </g>`;
  return ask({
    context: svg(w, h, body),
    q: 'How many triangles are there in the figure?',
    opts: options(String(total), [
      { v: String(k + 1), why: 'Those are only the smallest triangles. Two or more adjoining ones also make a triangle.' },
      { v: String(total - 1), why: 'The whole figure is itself a triangle — do not leave it out.' },
      { v: String(k + 2), why: '' },
      { v: String(total + k), why: '' },
    ], i => String(total + 2 + i)),
    why: `Every triangle is fixed by choosing 2 of the ${k + 2} lines from the apex:
      C(${k + 2},2) = <b>${total}</b>.<br>
      Counted the other way: ${k + 1} single cells, ${k} made of two, ${k - 1} of three … down to 1 whole —
      ${[...Array(k + 1).keys()].map(i => k + 1 - i).join(' + ')} = ${total}.`,
    hardness: 1.4 + k / 3,
    concept: 'fan-formula', conceptLabel: 'Triangles in a fan',
    source: 'Shape of RAS 2016 Q105 · RAS 2018 Q106',
  });
};

/* The difference between two counts in one figure — RAS 2018 Q106 asks
   exactly this, and it is where a candidate counts one class twice. */
const difference = (R, tier) => {
  const m = R.int(2, byTier(tier, 2, 3, 4)), n = R.int(2, byTier(tier, 3, 4, 5));
  const rect = C2(m + 1) * C2(n + 1);
  let squares = 0;
  for (let k = 1; k <= Math.min(m, n); k++) squares += (m - k + 1) * (n - k + 1);
  const key = rect - squares;
  if (key < 2) return null;
  return ask({
    context: gridSVG(m, n),
    q: 'In the figure above, how many more rectangles are there than squares?',
    opts: options(String(key), [
      { v: String(rect), why: 'That is the number of rectangles, not the difference.' },
      { v: String(squares), why: 'That is the number of squares.' },
      { v: String(rect + squares), why: 'The question asks for a difference, not a total.' },
      { v: String(Math.abs(key - m * n)), why: '' },
    ], i => String(key + 1 + i)),
    why: `Rectangles: C(${m + 1},2) × C(${n + 1},2) = <b>${rect}</b>.
      Squares: ${[...Array(Math.min(m, n)).keys()].map(i => `${(m - i) * (n - i)}`).join(' + ')} = <b>${squares}</b>.
      Difference = ${rect} − ${squares} = <b>${key}</b>.`,
    hardness: 1.8 + (m + n) / 5,
    concept: 'count-by-class', conceptLabel: 'Two counts in one figure',
    source: 'Shape of RAS 2018, Q106',
  });
};

/* Rectangles through one marked cell. Same grid, a different count, and the
   variety the other two lack: every cell of every grid is a new question. */
const throughCell = (R, tier) => {
  const m = R.int(byTier(tier, 3, 3, 4), byTier(tier, 4, 5, 6));
  const n = R.int(byTier(tier, 3, 4, 4), byTier(tier, 5, 6, 7));
  const i = R.int(0, m - 1), j = R.int(0, n - 1);
  /* A rectangle contains the cell when its top edge is at or above the cell's
     top and its bottom edge at or below — the choices multiply. */
  const key = (i + 1) * (m - i) * (j + 1) * (n - j);
  const total = C2(m + 1) * C2(n + 1);
  if (key === total) return null;
  return ask({
    context: gridSVG(m, n, 34, [i, j]),
    q: 'How many rectangles in the figure contain the shaded cell?',
    opts: options(String(key), [
      { v: String(total), why: 'That is every rectangle in the grid, whether or not it covers the shaded cell.' },
      { v: String((i + 1) * (j + 1)), why: 'That counts only the rectangles whose corner is the shaded cell.' },
      { v: String(key - (i + 1) * (m - i)), why: '' },
      { v: String(key + m * n), why: '' },
    ], k => String(key + 2 + k * 3)),
    why: `A rectangle covers the cell when its horizontal edges straddle that row and its vertical
      edges straddle that column.<br>
      Rows: ${i + 1} choices above × ${m - i} below = ${(i + 1) * (m - i)}.
      Columns: ${j + 1} × ${n - j} = ${(j + 1) * (n - j)}.<br>
      Together: <b>${key}</b> of the grid's ${total} rectangles.`,
    hardness: 2 + (m + n) / 5,
    concept: 'count-by-class', conceptLabel: 'Rectangles through a cell',
    source: 'RAS figure-counting block',
  });
};

export const FIGURE_GENERATORS = [
  gen('ras-fig-cell', 'figures', 'reasoning:7', 'count-by-class', 'Rectangles through a cell', throughCell),
  gen('ras-fig-rect', 'figures', 'reasoning:7', 'squares-vs-rectangles', 'Rectangles and squares', rectangles),
  gen('ras-fig-fan', 'figures', 'reasoning:7', 'fan-formula', 'Triangles in a fan', fanTriangles),
  gen('ras-fig-diff', 'figures', 'reasoning:7', 'count-by-class', 'Comparing two counts', difference),
];
