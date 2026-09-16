/* ============================================================
   Explanation figures for generated questions.

   Rule (b) of this project is that a widget DERIVES and never asserts,
   and the home page promises "draw it, never hold it". A generated drill
   that explained itself in prose alone was breaking both: the lessons
   teach an idea with something you can look at, then the drill tested it
   with a paragraph. The learner had nothing to link the answer back to.

   So every generator now returns a `figure` alongside its explanation,
   built from the SAME numbers that produced the answer. A figure cannot
   disagree with its question, because it is drawn from the question.

   These are deliberately small and static — an explanation is read once,
   after the answer is already known, so it wants to be legible rather
   than interactive. Colour comes from the theme's own variables, so the
   figures follow the academy accent and stay readable in either theme.
   ============================================================ */

const esc = s => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Wrap a body in a responsive, theme-aware SVG. */
export const svg = (w, h, body, cls = '') =>
  `<svg viewBox="0 0 ${w} ${h}" class="figsvg ${cls}" role="img" aria-hidden="true">${body}</svg>`;

const TEXT = 'fill="var(--ink)" font-size="13" font-weight="700"';
const MUTED = 'fill="var(--ink-3)" font-size="11" font-weight="700"';

/* ---------------- bars ----------------
   The workhorse. Totals, shares, ratio splits, comparisons, cost vs price,
   year-by-year growth — anything where the point is "this one is bigger,
   and by this much" reads better as length than as a sentence. */
export function barsFig(items, { unit = '', highlight = null, w = 480 } = {}) {
  const rows = items.filter(Boolean);
  if (!rows.length) return '';
  const max = Math.max(...rows.map(r => Math.abs(r.value)), 1);
  /* The label gutter has to fit the longest label, or a bar chart quietly
     clips its own row names — a fixed gutter clipped "second · 5 parts" the
     first time this shipped. ~6.6px per character at 13px bold, clamped so a
     long label cannot squeeze the bars out of existence. */
  const longest = Math.max(...rows.map(r => String(r.label).length));
  const padL = Math.min(210, Math.max(76, longest * 6.6 + 16));
  /* The value sits after the bar, so the right gutter has to fit that too. */
  const longestVal = Math.max(...rows.map(r => String(r.text ?? r.value).length + unit.length));
  const padR = Math.min(150, Math.max(46, longestVal * 6.6 + 14));
  const rowH = 30, top = 8;
  const h = top + rows.length * rowH + 6;
  const span = Math.max(40, w - padL - padR);

  const body = rows.map((r, i) => {
    const y = top + i * rowH;
    const len = Math.max(2, Math.abs(r.value) / max * span);
    const on = highlight === null ? r.on : (i === highlight || r.on);
    const fill = on ? 'var(--accent, var(--brand))' : 'var(--line)';
    return `
      <text x="${padL - 10}" y="${y + 15}" text-anchor="end" ${on ? TEXT : MUTED}>${esc(r.label)}</text>
      <rect x="${padL}" y="${y + 4}" width="${len}" height="15" rx="4" fill="${fill}"/>
      <text x="${padL + len + 8}" y="${y + 16}" ${on ? TEXT : MUTED}>${esc(r.text ?? r.value)}${esc(unit)}</text>`;
  }).join('');
  return svg(w, h, body);
}

/* ---------------- number line ----------------
   Positions counted from both ends — the one idea behind every ranking
   question, and impossible to hold in your head but obvious drawn. */
export function lineFig(n, marks = [], { w = 460, caption = '' } = {}) {
  const padX = 26, y = 46;
  const span = w - padX * 2;
  const gap = n > 1 ? span / (n - 1) : 0;
  const X = k => padX + (k - 1) * gap;
  const dots = Array.from({ length: n }, (_, i) => {
    const k = i + 1;
    const m = marks.find(x => x.at === k);
    return `<circle cx="${X(k)}" cy="${y}" r="${m ? 9 : 4}"
              fill="${m ? 'var(--accent, var(--brand))' : 'var(--line)'}"/>
      ${m ? `<text x="${X(k)}" y="${y + 4}" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">${esc(m.label)}</text>
             <text x="${X(k)}" y="${y - 16}" text-anchor="middle" ${MUTED}>${esc(m.note || k)}</text>` : ''}`;
  }).join('');
  return svg(w, 78, `
    <line x1="${padX - 10}" y1="${y}" x2="${w - padX + 10}" y2="${y}" stroke="var(--line)" stroke-width="2"/>
    ${dots}
    <text x="${padX - 12}" y="${y + 26}" text-anchor="start" ${MUTED}>left</text>
    <text x="${w - padX + 12}" y="${y + 26}" text-anchor="end" ${MUTED}>right</text>
    ${caption ? `<text x="${w / 2}" y="${y + 26}" text-anchor="middle" ${MUTED}>${esc(caption)}</text>` : ''}`);
}

/* ---------------- Venn ----------------
   Two or three circles, positioned to match the relation the premises
   force. This is the drawing the Logic chapter tells learners to make;
   showing it after a syllogism closes the loop the lesson opens. */
export function vennFig(circles, { w = 380, h = 190 } = {}) {
  const body = circles.map(c => `
    <circle cx="${c.x}" cy="${c.y}" r="${c.r}" fill="${c.fill || 'none'}"
            fill-opacity="${c.fill ? 0.14 : 0}"
            stroke="${c.stroke || 'var(--brand)'}" stroke-width="2.4"/>
    <text x="${c.x}" y="${c.ly ?? c.y - c.r - 6}" text-anchor="middle" ${TEXT}>${esc(c.label)}</text>`).join('');
  return svg(w, h, body);
}

/** Circle layout for the four statement forms, so a syllogism can be drawn. */
export function vennFor(kind, A, B, opts = {}) {
  const acc = opts.stroke || 'var(--brand)', gold = 'var(--gold)';
  if (kind === 'all') return vennFig([
    { x: 200, y: 100, r: 72, label: B, stroke: gold, ly: 34 },
    { x: 176, y: 112, r: 40, label: A, stroke: acc, fill: acc, ly: 118 },
  ]);
  if (kind === 'no') return vennFig([
    { x: 112, y: 100, r: 58, label: A, stroke: acc },
    { x: 268, y: 100, r: 58, label: B, stroke: gold },
  ]);
  /* some / some-not both need an overlap; the difference is which part matters */
  return vennFig([
    { x: 148, y: 100, r: 62, label: A, stroke: acc },
    { x: 232, y: 100, r: 62, label: B, stroke: gold },
  ]);
}

/* ---------------- permitted cases ----------------
   For the Foundations drills. The engine enumerates every world the
   statement allows; printing that list IS the explanation, because a
   conclusion follows exactly when its column is true all the way down. */
export function casesFig(cols, rows, { verdict = [] } = {}) {
  const cw = 104, rowH = 26, padT = 30;
  const w = Math.max(300, cols.length * cw + 20), h = padT + rows.length * rowH + 14;
  const head = cols.map((c, i) =>
    `<text x="${18 + i * cw}" y="20" ${MUTED}>${esc(c)}</text>`).join('');
  const body = rows.map((r, ri) => {
    const y = padT + ri * rowH;
    return `<rect x="10" y="${y}" width="${w - 20}" height="${rowH - 4}" rx="5"
              fill="${ri % 2 ? 'var(--surface-2)' : 'transparent'}"/>` +
      r.map((v, ci) => `<text x="${18 + ci * cw}" y="${y + 16}"
        fill="${v === true ? 'var(--good)' : v === false ? 'var(--bad)' : 'var(--ink)'}"
        font-size="12.5" font-weight="700">${v === true ? 'true' : v === false ? 'false' : esc(v)}</text>`).join('');
  }).join('');
  const foot = verdict.length
    ? `<text x="18" y="${h - 2}" ${MUTED}>${esc(verdict.join('   ·   '))}</text>` : '';
  return svg(w, h + (verdict.length ? 8 : 0), head + body + foot);
}

/* ---------------- letter mapping ----------------
   Coding questions are a mapping, and a mapping wants two rows with
   arrows between them, not a sentence describing the arrows. */
export function mapFig(pairs, { note = '' } = {}) {
  const cw = 40, padX = 20, w = Math.max(220, pairs.length * cw + padX * 2);
  const body = pairs.map((p, i) => {
    const x = padX + i * cw + cw / 2;
    return `
      <text x="${x}" y="22" text-anchor="middle" ${TEXT}>${esc(p.from)}</text>
      <text x="${x}" y="38" text-anchor="middle" ${MUTED}>${esc(p.fromPos ?? '')}</text>
      <path d="M ${x} 44 L ${x} 58" stroke="var(--line)" stroke-width="2"/>
      <path d="M ${x - 4} 54 L ${x} 59 L ${x + 4} 54" fill="none" stroke="var(--line)" stroke-width="2"/>
      <text x="${x}" y="78" text-anchor="middle" fill="var(--accent, var(--brand))"
            font-size="13" font-weight="800">${esc(p.to)}</text>
      <text x="${x}" y="93" text-anchor="middle" ${MUTED}>${esc(p.toPos ?? '')}</text>`;
  }).join('');
  return svg(w, note ? 112 : 100,
    body + (note ? `<text x="${w / 2}" y="108" text-anchor="middle" ${MUTED}>${esc(note)}</text>` : ''));
}

/* ---------------- slots ----------------
   Counting questions are a row of boxes with a number of choices in each,
   and the product across them. Drawn, the multiplication is self-evident. */
export function slotsFig(slots, { total = '', label = '' } = {}) {
  const bw = 54, gap = 12, padX = 20;
  const w = Math.max(240, slots.length * (bw + gap) + padX * 2 + 90);
  const body = slots.map((s, i) => {
    const x = padX + i * (bw + gap);
    return `
      <rect x="${x}" y="24" width="${bw}" height="40" rx="7" fill="var(--surface-2)"
            stroke="var(--line)" stroke-width="1.5"/>
      <text x="${x + bw / 2}" y="50" text-anchor="middle" ${TEXT}>${esc(s.n)}</text>
      <text x="${x + bw / 2}" y="16" text-anchor="middle" ${MUTED}>${esc(s.label || '')}</text>
      ${i < slots.length - 1
        ? `<text x="${x + bw + gap / 2}" y="50" text-anchor="middle" ${MUTED}>×</text>` : ''}`;
  }).join('');
  const endX = padX + slots.length * (bw + gap);
  return svg(w, 80, body + `
    <text x="${endX + 4}" y="50" ${MUTED}>=</text>
    <text x="${endX + 24}" y="50" fill="var(--accent, var(--brand))" font-size="15" font-weight="800">${esc(total)}</text>
    ${label ? `<text x="${padX}" y="76" ${MUTED}>${esc(label)}</text>` : ''}`);
}

/* ---------------- scaled grid ----------------
   The k / k² law, seen. Two rectangles drawn to scale beside each other
   say more than "area goes as the square" ever does. */
export function scaleFig(a, b, { unitA = '', unitB = '', note = '' } = {}) {
  const maxSide = Math.max(a.w, a.h, b.w, b.h);
  const px = 78 / maxSide;
  const box = (r, x, label) => {
    const W = Math.max(8, r.w * px), H = Math.max(8, r.h * px);
    return `
      <rect x="${x}" y="${96 - H}" width="${W}" height="${H}" rx="3"
            fill="var(--accent, var(--brand))" fill-opacity="${r.dim ? 0.18 : 0.34}"
            stroke="var(--accent, var(--brand))" stroke-width="2"/>
      <text x="${x + W / 2}" y="${112}" text-anchor="middle" ${MUTED}>${esc(r.w)} × ${esc(r.h)}</text>
      <text x="${x + W / 2}" y="${126}" text-anchor="middle" ${TEXT}>${esc(label)}</text>`;
  };
  return svg(300, 136 + (note ? 12 : 0),
    box({ ...a, dim: true }, 24, `${a.area}${unitA}`) + box(b, 168, `${b.area}${unitB}`) +
    (note ? `<text x="150" y="146" text-anchor="middle" ${MUTED}>${esc(note)}</text>` : ''));
}

/* ---------------- balance beam ----------------
   A mean is a balance point. The lessons teach it that way, so the drill
   should show it that way: two weights, and where the pivot has to sit. */
export function beamFig(left, right, mean, { w = 400 } = {}) {
  const lo = Math.min(left.at, right.at, mean), hi = Math.max(left.at, right.at, mean);
  const span = Math.max(1e-9, hi - lo);
  const padX = 44, usable = w - padX * 2;
  const X = v => padX + (v - lo) / span * usable;
  const y = 56;
  const wt = (m, side) => `
    <rect x="${X(m.at) - 17}" y="${y - 34}" width="34" height="26" rx="5"
          fill="var(--accent, var(--brand))" fill-opacity="${side === 'l' ? 0.5 : 0.28}"
          stroke="var(--accent, var(--brand))" stroke-width="1.6"/>
    <text x="${X(m.at)}" y="${y - 16}" text-anchor="middle" fill="var(--ink)" font-size="11.5" font-weight="800">${esc(m.weight)}</text>
    <text x="${X(m.at)}" y="${y + 22}" text-anchor="middle" ${MUTED}>${esc(m.at)}</text>`;
  return svg(w, 88, `
    <line x1="${padX - 16}" y1="${y}" x2="${w - padX + 16}" y2="${y}" stroke="var(--line)" stroke-width="3"/>
    ${wt(left, 'l')}${wt(right, 'r')}
    <path d="M ${X(mean)} ${y + 2} L ${X(mean) - 11} ${y + 20} L ${X(mean) + 11} ${y + 20} Z" fill="var(--gold)"/>
    <text x="${X(mean)}" y="${y + 36}" text-anchor="middle" fill="var(--gold)" font-size="12" font-weight="800">${esc(mean)}</text>`);
}

/* ---------------- painted cube ---------------- */
export function cubeFig(n, { note = '' } = {}) {
  const s = Math.min(26, 96 / n), o = s * 0.42;
  const cells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    cells.push(`<rect x="${40 + c * s}" y="${34 + r * s}" width="${s - 1.5}" height="${s - 1.5}"
      fill="var(--accent, var(--brand))" fill-opacity="${(r === 0 || c === 0 || r === n - 1 || c === n - 1) ? 0.42 : 0.1}"
      stroke="var(--line)" stroke-width="0.8"/>`);
  }
  const top = Array.from({ length: n }, (_, c) =>
    `<path d="M ${40 + c * s} 34 l ${o} ${-o} l ${s - 1.5} 0 l ${-o} ${o} Z"
       fill="var(--accent, var(--brand))" fill-opacity="0.26" stroke="var(--line)" stroke-width="0.8"/>`).join('');
  return svg(220, 34 + n * s + (note ? 32 : 14),
    top + cells.join('') +
    (note ? `<text x="110" y="${34 + n * s + 22}" text-anchor="middle" ${MUTED}>${esc(note)}</text>` : ''));
}

/* ---------------- folded paper ---------------- */
export function foldFig(folds, holes, { note = '' } = {}) {
  const S = 74, x0 = 24, y0 = 20;
  const creases = [];
  if (folds >= 1) creases.push(`<line x1="${x0 + S / 2}" y1="${y0}" x2="${x0 + S / 2}" y2="${y0 + S}"
    stroke="var(--gold)" stroke-width="1.6" stroke-dasharray="4 3"/>`);
  if (folds >= 2) creases.push(`<line x1="${x0}" y1="${y0 + S / 2}" x2="${x0 + S}" y2="${y0 + S / 2}"
    stroke="var(--gold)" stroke-width="1.6" stroke-dasharray="4 3"/>`);
  const pts = [];
  const grid = folds >= 2 ? 2 : folds >= 1 ? 2 : 1;
  for (let r = 0; r < (folds >= 2 ? 2 : 1); r++) {
    for (let c = 0; c < (folds >= 1 ? 2 : 1); c++) {
      pts.push(`<circle cx="${x0 + S / (grid * 2) + c * S / 2 + (folds >= 1 ? 0 : S / 4)}"
        cy="${y0 + (folds >= 2 ? S / 4 + r * S / 2 : S / 2)}" r="5" fill="var(--bad)"/>`);
    }
  }
  return svg(240, y0 + S + (note ? 36 : 16), `
    <rect x="${x0}" y="${y0}" width="${S}" height="${S}" rx="4" fill="var(--surface-2)"
          stroke="var(--line)" stroke-width="1.6"/>
    ${creases.join('')}${pts.join('')}
    <text x="${x0 + S + 22}" y="${y0 + 30}" ${TEXT}>${folds} fold${folds === 1 ? '' : 's'}</text>
    <text x="${x0 + S + 22}" y="${y0 + 50}" fill="var(--accent, var(--brand))" font-size="15" font-weight="800">${holes} holes</text>
    ${note ? `<text x="${x0}" y="${y0 + S + 26}" ${MUTED}>${esc(note)}</text>` : ''}`);
}

/* ---------------- compass dial ---------------- */
export function dialFig(start, turns, end) {
  const D = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const cx = 70, cy = 70, r = 42;
  const arrow = (dir, color, len) => {
    const [dx, dy] = D[dir];
    return `<line x1="${cx}" y1="${cy}" x2="${cx + dx * len}" y2="${cy + dy * len}"
              stroke="${color}" stroke-width="3" stroke-linecap="round"/>
            <circle cx="${cx + dx * len}" cy="${cy + dy * len}" r="5" fill="${color}"/>`;
  };
  const cards = Object.entries(D).map(([k, [dx, dy]]) =>
    `<text x="${cx + dx * (r + 16)}" y="${cy + dy * (r + 16) + 4}" text-anchor="middle" ${MUTED}>${k}</text>`).join('');
  return svg(260, 140, `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)" stroke-width="1.6"/>
    ${cards}${arrow(start, 'var(--line)', r - 6)}${arrow(end, 'var(--accent, var(--brand))', r - 6)}
    <text x="150" y="52" ${MUTED}>start ${start}</text>
    <text x="150" y="72" ${MUTED}>${turns.join(' → ') || 'no turns'}</text>
    <text x="150" y="94" fill="var(--accent, var(--brand))" font-size="14" font-weight="800">facing ${end}</text>`);
}

/* A plain HTML table, for the DI drills — the chart IS the question there,
   so the figure highlights the cells the answer came from. */
export function tableFig(head, rows, { hotRow = -1, hotCol = -1, caption = '' } = {}) {
  return `<div class="qtable-wrap"><table class="qtable qtable--fig">
    <thead><tr>${head.map((h, i) =>
      `<th class="${i - 1 === hotCol ? 'is-hot' : ''}">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r, ri) => `<tr class="${ri === hotRow ? 'is-hot' : ''}">
      <th>${esc(r.label)}</th>
      ${r.cells.map((c, ci) => `<td class="${ci === hotCol || ri === hotRow ? 'is-hot' : ''}">${esc(c)}</td>`).join('')}
    </tr>`).join('')}</tbody>
  </table>${caption ? `<p class="figcap">${esc(caption)}</p>` : ''}</div>`;
}


/**
 * A pie chart drawn from the slices themselves.
 *
 * The arcs are computed from the same degrees the question is asked about, so
 * the picture cannot disagree with the answer — rule (b). Slices are drawn in
 * order from twelve o'clock clockwise, which is how every printed pie in an
 * exam paper is laid out.
 */
export function pieFig(slices, { w = 300, hot = -1, caption = '' } = {}) {
  const cx = w / 2, cy = 110, r = 92;
  const total = slices.reduce((t, s) => t + s.deg, 0) || 360;
  let at = -90;                                   // start at twelve o'clock
  const TONE = ['var(--accent, var(--brand))', 'var(--gold)', 'var(--good)', 'var(--bad)',
                'var(--ink-3)', 'var(--line-strong)'];
  const paths = slices.map((s, i) => {
    const sweep = s.deg / total * 360;
    const a0 = at * Math.PI / 180, a1 = (at + sweep) * Math.PI / 180;
    at += sweep;
    const big = sweep > 180 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    /* A slice of the whole circle is a circle, and an arc from a point back to
       itself draws nothing — so that one case is a plain circle instead. */
    const d = sweep >= 359.99
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
      : `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${big} 1 ${x1} ${y1} Z`;
    const mid = (a0 + a1) / 2;
    return { d, fill: TONE[i % TONE.length], on: i === hot,
             lx: cx + r * 0.62 * Math.cos(mid), ly: cy + r * 0.62 * Math.sin(mid), s };
  });

  const body = paths.map(p => `
    <path d="${p.d}" fill="${p.fill}" fill-opacity="${p.on ? 0.95 : 0.42}"
          stroke="var(--surface)" stroke-width="2"/>`).join('')
    + paths.filter(p => p.s.deg / total * 360 >= 26).map(p => `
    <text x="${p.lx.toFixed(1)}" y="${p.ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
          font-size="11" font-weight="800" fill="var(--surface)">${esc(p.s.deg)}°</text>`).join('')
    /* A real swatch in the slice's own colour, not a ■ glyph — that inherits
       the TEXT fill, so every row came out the same grey and the legend could
       not be matched to the chart at all. The degrees were printed twice, on
       the slice and in the legend, so the question stayed answerable; it was
       the colour key that did nothing. */
    + slices.map((sl, i) => `
    <rect x="10" y="${210 + i * 15}" width="10" height="10" rx="2"
          fill="${TONE[i % TONE.length]}" fill-opacity="${i === hot ? 0.95 : 0.5}"/>
    <text x="25" y="${219 + i * 15}" font-size="11" font-weight="700"
          fill="${i === hot ? 'var(--ink)' : 'var(--ink-3)'}">${esc(sl.label)} — ${esc(sl.deg)}°</text>`).join('');

  return svg(w, 226 + slices.length * 15 + (caption ? 16 : 0),
    body + (caption ? `<text x="10" y="${222 + slices.length * 15 + 10}" font-size="11"
      fill="var(--ink-3)" font-weight="700">${esc(caption)}</text>` : ''));
}

/**
 * A grouped bar chart with a real axis — the DI stimulus, not an illustration.
 *
 * Everything else in this file explains an answer after the fact. This one is
 * the QUESTION: a bar chart question is unanswerable without the chart, so it
 * goes in the `context` and has to be readable rather than decorative. Which
 * means the two things a printed chart has and a decorative one does not:
 *
 *   · a y-axis with numbered gridlines, because "read the axis and the unit
 *     first" is a concept this chapter actually teaches, and a chart with no
 *     axis makes that lesson unlearnable; and
 *   · the unit stated once, at the top, exactly where a paper puts it — the
 *     trap being that "in thousands" is printed once and applies to every bar.
 *
 * Bars are drawn from the same numbers the question is asked about, so the
 * picture cannot disagree with the answer. Rule (b).
 */
export function chartFig(series, cols, { unit = '', hot = -1, hotCol = -1, w = 480, line = false } = {}) {
  /* Laid out downwards from the plot rather than backwards from the height,
     which is how the first version put the legend on top of the column labels:
     both were positioned from `h` and landed within four pixels of each other.
     Each band now gets its own space and the height is the sum. */
  const padL = 44, padR = 12, padT = unit ? 26 : 12;
  const plotH = 150;
  const labelsY = padT + plotH + 18;                       // column names
  const legendY = padT + plotH + (series.length > 1 ? 38 : 0);
  const h = padT + plotH + (series.length > 1 ? 52 : 30);
  const plotW = w - padL - padR;

  const values = series.flatMap(s => s.values);
  const top = Math.max(...values);
  /* Round the axis up to something a person would draw — 4 gridlines at a
     round step, not 4 at 137.25. A chart whose axis needs a calculator is
     testing the wrong thing. */
  const rough = top / 4;
  const mag = 10 ** Math.floor(Math.log10(Math.max(1, rough)));
  const step = Math.ceil(rough / mag) * mag;
  const axisTop = step * 4;

  const y = v => padT + plotH - (v / axisTop) * plotH;
  const groupW = plotW / cols.length;
  const barW = Math.min(26, (groupW * 0.62) / series.length);
  const TONE = ['var(--accent, var(--brand))', 'var(--gold)', 'var(--good)'];

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = step * i;
    return `<line x1="${padL}" y1="${y(v).toFixed(1)}" x2="${w - padR}" y2="${y(v).toFixed(1)}"
                  stroke="var(--line)" stroke-width="1"/>
            <text x="${padL - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" ${MUTED}>${v}</text>`;
  }).join('');

  /* A line chart is a line chart, not a line drawn over bars. The first version
     always drew the bars and added the line on top, which is a combo chart —
     a real thing, and not the two distinct chart types a DI section shows. */
  const bars = line ? '' : series.map((s, si) => s.values.map((v, ci) => {
    const gx = padL + ci * groupW + groupW / 2;
    const x = gx - (series.length * barW) / 2 + si * barW;
    const on = (hot === si || hot < 0) && (hotCol === ci || hotCol < 0);
    return `<rect x="${x.toFixed(1)}" y="${y(v).toFixed(1)}" width="${(barW - 3).toFixed(1)}"
                  height="${Math.max(1, padT + plotH - y(v)).toFixed(1)}" rx="2"
                  fill="${TONE[si % TONE.length]}" fill-opacity="${on ? 0.95 : 0.38}"/>`;
  }).join('')).join('');

  /* The same numbers, drawn the other way a paper draws them. */
  const lines = line ? series.map((s, si) => {
    const pts = s.values.map((v, ci) =>
      `${(padL + ci * groupW + groupW / 2).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const dim = hot >= 0 && hot !== si ? 0.4 : 1;
    return `<polyline points="${pts}" fill="none" stroke="${TONE[si % TONE.length]}"
                      stroke-opacity="${dim}" stroke-width="2.6" stroke-linejoin="round"
                      stroke-linecap="round"/>`
      + s.values.map((v, ci) =>
        `<circle cx="${(padL + ci * groupW + groupW / 2).toFixed(1)}" cy="${y(v).toFixed(1)}"
                 r="${hotCol === ci ? 5 : 3.4}" fill="${TONE[si % TONE.length]}"
                 fill-opacity="${dim}"/>`).join('');
  }).join('') : '';

  const labels = cols.map((c, ci) =>
    `<text x="${(padL + ci * groupW + groupW / 2).toFixed(1)}" y="${labelsY}"
           text-anchor="middle" ${MUTED}>${esc(c)}</text>`).join('');

  /* Spread across the plot rather than at a fixed 96px pitch, so two long
     series names cannot run into each other on a narrow chart. */
  const legendPitch = Math.min(120, plotW / Math.max(1, series.length));
  const legend = series.length > 1 ? series.map((s, si) =>
    `<rect x="${(padL + si * legendPitch).toFixed(1)}" y="${legendY - 9}" width="10" height="10" rx="2"
           fill="${TONE[si % TONE.length]}"/>
     <text x="${(padL + si * legendPitch + 15).toFixed(1)}" y="${legendY}" ${MUTED}>${esc(s.label)}</text>`).join('') : '';

  return svg(w, h,
    (unit ? `<text x="${padL}" y="14" ${MUTED}>${esc(unit)}</text>` : '')
    + grid + bars + lines + labels + legend);
}
