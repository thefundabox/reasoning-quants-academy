/* ============================================================
   Data-interpretation lab — the manipulables behind Unit 7.

   A DI widget is only honest if the picture and the numbers come from
   the SAME array. Every total, share, gap and angle below is computed
   from the data at render time, so a bar's height and the answer under
   it cannot drift apart.

     dataTable()  — a table with row and column totals derived, and the
                    cells a question needs highlighted rather than described
     chartRead()  — bars or a line drawn from the data, with comparisons
                    (gaps, crossings, growth) computed on demand
     pieRead()    — slices sized by angle, with the 3.6 factor shown both
                    ways round

   The lessons state totals in their prose; the harness recomputes them
   from these same arrays and fails if the two ever disagree.
   ============================================================ */

const r2 = n => Math.round(n * 100) / 100;
export const sum = a => a.reduce((x, y) => x + y, 0);
export const fmt = n => {
  const v = r2(n);
  return Number.isInteger(v) ? v.toLocaleString('en-IN') : v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};
export const pct = (part, whole) => (whole ? part / whole * 100 : 0);
export const growth = (from, to) => (from ? (to - from) / from * 100 : 0);

/** Row totals, column totals and the grand total — all derived. */
export function tableTotals(rows, data) {
  const rowTotals = rows.map(r => sum(data[r]));
  const cols = data[rows[0]].length;
  const colTotals = [...Array(cols)].map((_, c) => sum(rows.map(r => data[r][c])));
  return { rowTotals, colTotals, grand: sum(rowTotals), grandByCol: sum(colTotals) };
}

/* ---------------- table ---------------- */
export function dataTable(cfg) {
  const { title = '', rows = [], cols = [], data = {}, unit = '', questions = [] } = cfg;

  return (el, api = {}) => {
    let at = 0;
    const seen = new Set([0]);

    el.innerHTML = `
      <div class="di">
        <p class="di-title">${title}</p>
        <div class="di-tablewrap"><table class="di-table" id="dtTable"></table></div>
        <p class="di-lab">Pick a question — the cells it needs will light up</p>
        <div class="di-qs" id="dtQs"></div>
        <div class="di-answer" id="dtAns"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    const T = tableTotals(rows, data);

    const draw = () => {
      const q = questions[at];
      const hot = q.cells ? q.cells(data, rows, cols) : [];
      const isHot = (r, c) => hot.some(h => h[0] === r && h[1] === c);

      $('dtTable').innerHTML = `
        <tr><th></th>${cols.map(c => `<th>${c}</th>`).join('')}<th class="di-tot">Total</th></tr>
        ${rows.map((r, ri) => `<tr>
          <th class="di-rowh">${r}</th>
          ${data[r].map((v, ci) => `<td class="${isHot(r, cols[ci]) ? 'is-hot' : ''}">${fmt(v)}</td>`).join('')}
          <td class="di-tot">${fmt(T.rowTotals[ri])}</td></tr>`).join('')}
        <tr><th class="di-rowh di-tot">Total</th>
          ${T.colTotals.map(v => `<td class="di-tot">${fmt(v)}</td>`).join('')}
          <td class="di-tot di-grand">${fmt(T.grand)}</td></tr>`;

      $('dtQs').innerHTML = questions.map((x, i) =>
        `<button class="di-q ${i === at ? 'is-on' : ''} ${seen.has(i) ? 'is-seen' : ''}"
                 data-i="${i}">${x.label}</button>`).join('');

      const val = q.answer(data, T, rows, cols);
      $('dtAns').innerHTML = `
        <span>Answer</span><b>${typeof val === 'number' ? fmt(val) + (q.unit || unit) : val}</b>
        <em>${q.working ? q.working(data, T) : ''}</em>`;

      api.report?.({
        at, seen: seen.size, total: questions.length, seenAll: seen.size === questions.length,
        answer: val, label: q.label,
        rowTotals: T.rowTotals, colTotals: T.colTotals, grand: T.grand,
        totalsAgree: T.grand === T.grandByCol,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.di-q');
      if (!b) return;
      at = +b.dataset.i; seen.add(at); draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- bars and lines ---------------- */
export function chartRead(cfg) {
  const { title = '', labels = [], series = [], unit = '', questions = [], startType = 'bar' } = cfg;

  return (el, api = {}) => {
    let type = startType, at = 0;
    const seen = new Set([0]);

    el.innerHTML = `
      <div class="di">
        <p class="di-title">${title}</p>
        <div class="di-modes">
          <button class="di-mode is-on" data-t="bar">Bars</button>
          <button class="di-mode" data-t="line">Line</button>
        </div>
        <div class="di-chart"><svg id="crSvg" viewBox="0 0 440 220" class="di-svg" role="img"
             aria-label="${title}"></svg></div>
        <div class="di-legend" id="crLeg"></div>
        <div class="di-qs" id="crQs"></div>
        <div class="di-answer" id="crAns"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    const top = Math.max(...series.flatMap(s => s.values)) * 1.15;
    const X = i => 44 + i * (376 / labels.length) + (376 / labels.length) / 2;
    const Y = v => 180 - v / top * 150;

    const draw = () => {
      const q = questions[at];
      const hot = q.points ? q.points(series, labels) : [];
      const isHot = (si, i) => hot.some(h => h[0] === si && h[1] === i);

      const gw = (376 / labels.length) / (series.length + 1);
      const body = type === 'bar'
        ? series.map((s, si) => s.values.map((v, i) => `
            <rect class="di-bar di-bar--${si} ${isHot(si, i) ? 'is-hot' : ''}"
                  x="${X(i) - (376 / labels.length) / 2 + gw * (si + 0.5)}" y="${Y(v)}"
                  width="${gw}" height="${180 - Y(v)}" rx="2"/>`).join('')).join('')
        : series.map((s, si) => `
            <polyline class="di-line di-line--${si}"
                      points="${s.values.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}"/>
            ${s.values.map((v, i) => `<circle class="di-pt di-pt--${si} ${isHot(si, i) ? 'is-hot' : ''}"
              cx="${X(i)}" cy="${Y(v)}" r="4"/>`).join('')}`).join('');

      $('crSvg').innerHTML = `
        <line class="di-axis" x1="40" y1="180" x2="424" y2="180"/>
        <line class="di-axis" x1="40" y1="16" x2="40" y2="180"/>
        ${body}
        ${labels.map((l, i) => `<text class="di-tick" x="${X(i)}" y="197" text-anchor="middle">${l}</text>`).join('')}`;

      $('crLeg').innerHTML = series.map((s, si) =>
        `<span class="di-key"><i class="di-swatch di-swatch--${si}"></i>${s.name}</span>`).join('');

      $('crQs').innerHTML = questions.map((x, i) =>
        `<button class="di-q ${i === at ? 'is-on' : ''} ${seen.has(i) ? 'is-seen' : ''}"
                 data-i="${i}">${x.label}</button>`).join('');

      const val = q.answer(series, labels);
      $('crAns').innerHTML = `
        <span>Answer</span><b>${typeof val === 'number' ? fmt(val) + (q.unit || unit) : val}</b>
        <em>${q.working || ''}</em>`;

      api.report?.({
        type, at, seen: seen.size, total: questions.length,
        seenAll: seen.size === questions.length,
        sawBothTypes: type === 'line' || seen.has('line'),
        answer: val, label: q.label,
        totals: series.map(s => sum(s.values)),
      });
    };

    el.addEventListener('click', e => {
      const m = e.target.closest('.di-mode');
      if (m) {
        type = m.dataset.t; seen.add(type);
        el.querySelectorAll('.di-mode').forEach(x => x.classList.toggle('is-on', x === m));
        return draw();
      }
      const b = e.target.closest('.di-q');
      if (b) { at = +b.dataset.i; seen.add(at); draw(); }
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- pie ---------------- */
export function pieRead(cfg) {
  const { title = '', slices = [], total = 0, unit = '' } = cfg;

  return (el, api = {}) => {
    let at = 0;
    const seen = new Set([0]);

    el.innerHTML = `
      <div class="di">
        <p class="di-title">${title}</p>
        <div class="di-pie">
          <svg id="prSvg" viewBox="0 0 220 220" class="di-svg di-svg--pie" role="img"
               aria-label="${title}"></svg>
          <div class="di-slices" id="prList"></div>
        </div>
        <div class="di-answer" id="prAns"></div>
        <div class="di-note" id="prNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    const degTotal = sum(slices.map(s => s.deg));

    const draw = () => {
      let a0 = -90;
      const arcs = slices.map((s, i) => {
        const a1 = a0 + s.deg;
        const p = (a, r) => [110 + r * Math.cos(a * Math.PI / 180), 110 + r * Math.sin(a * Math.PI / 180)];
        const [x0, y0] = p(a0, 92), [x1, y1] = p(a1, 92);
        const d = `M110,110 L${x0},${y0} A92,92 0 ${s.deg > 180 ? 1 : 0},1 ${x1},${y1} Z`;
        a0 = a1;
        return `<path class="di-slice di-slice--${i % 6} ${i === at ? 'is-on' : ''}" d="${d}"/>`;
      }).join('');

      $('prSvg').innerHTML = arcs;

      $('prList').innerHTML = slices.map((s, i) => `
        <button class="di-slicebtn ${i === at ? 'is-on' : ''}" data-i="${i}">
          <i class="di-swatch di-swatch--${i % 6}"></i>
          <span class="di-slice-name">${s.name}</span>
          <span class="di-slice-deg">${s.deg}°</span>
          <b>${fmt(s.deg / 3.6)}%</b>
        </button>`).join('');

      const s = slices[at];
      const share = s.deg / 3.6;
      $('prAns').innerHTML = `
        <span>${s.name}</span>
        <b>${s.deg}° = ${fmt(share)}%${total ? ` = ${unit}${fmt(total * s.deg / 360)}` : ''}</b>
        <em>divide the angle by 3.6 for the percentage — because 360° is 100%</em>`;

      $('prNote').innerHTML = `The angles add to <b>${degTotal}°</b> and the percentages to
        <b>${fmt(sum(slices.map(x => x.deg / 3.6)))}%</b>. If either fails to close, you have
        misread a slice.`;

      api.report?.({
        at, seen: seen.size, total: slices.length, seenAll: seen.size === slices.length,
        deg: s.deg, share: r2(share),
        amount: total ? r2(total * s.deg / 360) : null,
        degClose: degTotal === 360,
        largest: slices.reduce((b, x, i) => (x.deg > slices[b].deg ? i : b), 0),
        onLargest: at === slices.reduce((b, x, i) => (x.deg > slices[b].deg ? i : b), 0),
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.di-slicebtn');
      if (!b) return;
      at = +b.dataset.i; seen.add(at); draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
