/* ============================================================
   Stat lab — the manipulables behind Unit 5.

   One picture runs through the whole unit: a mean is the point where
   the values BALANCE. Everything else follows from that.

     dotPlot()       — drag a value and watch the mean slide while the
                       median sits still; the fulcrum is the mean
     balanceBeam()   — two groups on a beam. Read it forwards and it is
                       the weighted average; read it backwards and it is
                       alligation, because the ratio is inverse to the
                       distances
     spreadCompare() — two sets with the SAME mean, so the only thing
                       left to see is how far the values sit from it

   Every statistic is computed from the values on screen. Nothing is
   stored, so the fulcrum can never sit anywhere but the true mean.
   ============================================================ */

/* ---------------- pure statistics (exported for the harness) ---------------- */

export const sum = a => a.reduce((x, y) => x + y, 0);
export const mean = a => (a.length ? sum(a) / a.length : 0);

export function median(a) {
  const s = [...a].sort((x, y) => x - y), n = s.length;
  if (!n) return 0;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/** Every value tied for most frequent — there may be none, one, or several. */
export function modes(a) {
  const c = new Map();
  a.forEach(v => c.set(v, (c.get(v) || 0) + 1));
  const top = Math.max(...c.values());
  return top <= 1 ? [] : [...c].filter(([, k]) => k === top).map(([v]) => v).sort((x, y) => x - y);
}

export const range = a => (a.length ? Math.max(...a) - Math.min(...a) : 0);
export const meanDev = a => (a.length ? mean(a.map(v => Math.abs(v - mean(a)))) : 0);

/** Weighted average — the fulcrum of a loaded beam. */
export const weighted = (ws, xs) => sum(ws.map((w, i) => w * xs[i])) / sum(ws);

/**
 * Alligation: the same beam solved for the loads instead of the fulcrum.
 * The parts come out INVERSE to the distances, which is the whole rule.
 */
export function alligation(cheap, dear, m) {
  const cheapParts = dear - m, dearParts = m - cheap;
  const g = (a, b) => (b ? g(b, a % b) : a);
  const d = Math.abs(g(Math.round(cheapParts * 1000), Math.round(dearParts * 1000))) / 1000 || 1;
  return { cheapParts, dearParts, ratio: [cheapParts / d, dearParts / d] };
}

const r2 = n => Math.round(n * 100) / 100;
export const fmt = n => {
  const v = r2(n);
  return Number.isInteger(v) ? v.toLocaleString('en-IN') : v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

/* ---------------- dot plot ---------------- */
export function dotPlot(cfg) {
  const { values = [], min = 0, max = 100, label = '', step = 1 } = cfg;

  return (el, api = {}) => {
    const v = [...values];
    let sel = v.length - 1;
    const start = [...values];

    el.innerHTML = `
      <div class="st">
        <p class="st-lab">${label || 'Drag any value along the line'}</p>
        <div class="st-plot"><svg id="dpSvg" viewBox="0 0 440 120" class="st-svg" role="img"
             aria-label="Values on a number line, with the mean marked as a balance point"></svg></div>
        <div class="st-picker" id="dpPick"></div>
        <input class="st-range" id="dpRange" type="range" min="${min}" max="${max}" step="${step}"
               value="${v[sel]}" aria-label="Value of the selected point">
        <div class="st-cells" id="dpCells"></div>
        <div class="st-note" id="dpNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const m = mean(v), md = median(v), mo = modes(v);
      const X = x => 24 + (x - min) / (max - min) * 392;

      $('dpSvg').innerHTML = `
        <line class="st-axis" x1="24" y1="78" x2="416" y2="78"/>
        <polygon class="st-fulcrum" points="${X(m)},80 ${X(m) - 9},98 ${X(m) + 9},98"/>
        <text class="st-flab" x="${X(m)}" y="112" text-anchor="middle">mean ${fmt(m)}</text>
        <line class="st-median" x1="${X(md)}" y1="42" x2="${X(md)}" y2="78"/>
        <text class="st-mlab" x="${X(md)}" y="34" text-anchor="middle">median ${fmt(md)}</text>
        ${v.map((x, i) => `<circle class="st-dot ${i === sel ? 'is-sel' : ''}" cx="${X(x)}" cy="66" r="7"/>`).join('')}`;

      $('dpPick').innerHTML = v.map((x, i) =>
        `<button class="st-pick ${i === sel ? 'is-on' : ''}" data-i="${i}">${fmt(x)}</button>`).join('');
      $('dpRange').value = v[sel];

      $('dpCells').innerHTML = `
        <div class="st-cell st-cell--mean"><span>Mean</span><b>${fmt(m)}</b>
          <em>${fmt(sum(v))} ÷ ${v.length}</em></div>
        <div class="st-cell st-cell--median"><span>Median</span><b>${fmt(md)}</b>
          <em>${v.length % 2 ? 'the middle value' : 'average of the two middles'}</em></div>
        <div class="st-cell"><span>Mode</span><b>${mo.length ? mo.map(fmt).join(', ') : '—'}</b>
          <em>${mo.length ? 'most frequent' : 'no value repeats'}</em></div>`;

      const below = v.filter(x => x < m).length;
      $('dpNote').innerHTML = below > v.length / 2
        ? `<b>${below} of ${v.length}</b> values sit <em>below</em> the mean. One large value has
           dragged the balance point past most of the data — which is exactly when the mean stops
           describing anybody.`
        : `The mean sits where the values balance. Push one value far out and watch the fulcrum
           follow it, while the median barely moves.`;

      api.report?.({
        values: [...v], mean: r2(m), median: r2(md), modes: mo,
        movedAny: v.some((x, i) => x !== start[i]),
        meanAboveMedian: m > md + 1e-9,
        meanBelowMedian: m < md - 1e-9,
        meanEqualsMedian: Math.abs(m - md) < 1e-9,
        belowMean: below,
        meanPastMost: below > v.length / 2,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.st-pick');
      if (!b) return;
      sel = +b.dataset.i; draw();
    });
    $('dpRange').oninput = e => { v[sel] = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- the balance beam ---------------- */
/* Forwards it is a weighted average; backwards it is alligation. */
export function balanceBeam(cfg) {
  const { left = { label: 'Group A', size: 30, value: 60 },
          right = { label: 'Group B', size: 20, value: 80 },
          maxSize = 60, unit = '', mode = 'weighted' } = cfg;

  return (el, api = {}) => {
    const L = { ...left }, R = { ...right };

    el.innerHTML = `
      <div class="st">
        <div class="st-groups" id="bbG"></div>
        <div class="st-beam"><svg id="bbSvg" viewBox="0 0 440 130" class="st-svg" role="img"
             aria-label="Two groups on a beam, balancing at the weighted average"></svg></div>
        <div class="st-cells" id="bbCells"></div>
        <div class="st-note" id="bbNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const w = weighted([L.size, R.size], [L.value, R.value]);
      const lo = Math.min(L.value, R.value), hi = Math.max(L.value, R.value);
      const pad = Math.max(1, (hi - lo) * 0.25);
      const X = x => 40 + (x - (lo - pad)) / ((hi + pad) - (lo - pad)) * 360;
      const dL = Math.abs(w - L.value), dR = Math.abs(R.value - w);

      $('bbG').innerHTML = [L, R].map((g, i) => `
        <div class="st-group st-group--${i ? 'b' : 'a'}">
          <span class="st-g-name">${g.label}</span>
          <input class="st-g-range" type="range" min="1" max="${maxSize}" value="${g.size}"
                 data-side="${i}" aria-label="Size of ${g.label}">
          <span class="st-g-val"><b>${g.size}</b> strong, averaging <b>${fmt(g.value)}</b>${unit}</span>
        </div>`).join('');

      $('bbSvg').innerHTML = `
        <line class="st-axis" x1="24" y1="60" x2="416" y2="60"/>
        <rect class="st-load st-load--a" x="${X(L.value) - 16}" y="${60 - Math.min(40, L.size * 0.9)}"
              width="32" height="${Math.min(40, L.size * 0.9)}" rx="3"/>
        <rect class="st-load st-load--b" x="${X(R.value) - 16}" y="${60 - Math.min(40, R.size * 0.9)}"
              width="32" height="${Math.min(40, R.size * 0.9)}" rx="3"/>
        <polygon class="st-fulcrum" points="${X(w)},62 ${X(w) - 10},84 ${X(w) + 10},84"/>
        <text class="st-flab" x="${X(w)}" y="100" text-anchor="middle">balances at ${fmt(w)}${unit}</text>
        <text class="st-vlab" x="${X(L.value)}" y="76" text-anchor="middle">${fmt(L.value)}</text>
        <text class="st-vlab" x="${X(R.value)}" y="76" text-anchor="middle">${fmt(R.value)}</text>`;

      const alg = alligation(Math.min(L.value, R.value), Math.max(L.value, R.value), w);

      $('bbCells').innerHTML = `
        <div class="st-cell st-cell--mean"><span>Combined average</span><b>${fmt(w)}${unit}</b>
          <em>(${L.size}×${fmt(L.value)} + ${R.size}×${fmt(R.value)}) ÷ ${L.size + R.size}</em></div>
        <div class="st-cell"><span>Plain average of the two</span><b>${fmt((L.value + R.value) / 2)}${unit}</b>
          <em>${Math.abs(w - (L.value + R.value) / 2) < 1e-9 ? 'equal here — the groups are the same size' : 'wrong unless the groups are equal'}</em></div>
        <div class="st-cell st-cell--gap"><span>Distances</span>
          <b>${fmt(dL)} : ${fmt(dR)}</b>
          <em>sizes are ${L.size} : ${R.size} — the <u>inverse</u></em></div>`;

      $('bbNote').innerHTML = L.size === R.size
        ? `Equal sizes, so the fulcrum sits exactly halfway and the plain average happens to be
           right. This is the only case in which it is.`
        : `The beam balances nearer the <b>heavier</b> group. Notice the distances
           <b>${fmt(dL)} : ${fmt(dR)}</b> are the reverse of the sizes
           <b>${L.size} : ${R.size}</b> — that inversion <em>is</em> alligation.`;

      api.report?.({
        sizes: [L.size, R.size], values: [L.value, R.value],
        combined: r2(w), plain: r2((L.value + R.value) / 2),
        distances: [r2(dL), r2(dR)],
        equalSizes: L.size === R.size,
        leansLeft: w < (L.value + R.value) / 2 - 1e-9,
        leansRight: w > (L.value + R.value) / 2 + 1e-9,
        inverseHolds: Math.abs(dL * L.size - dR * R.size) < 1e-6,
        alligation: alg.ratio,
        mode,
      });
    };

    el.addEventListener('input', e => {
      const r = e.target.closest('.st-g-range');
      if (!r) return;
      (r.dataset.side === '0' ? L : R).size = +r.value;
      draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- two sets, one mean ---------------- */
export function spreadCompare(cfg) {
  const { sets = [], min = 0, max = 100 } = cfg;

  return (el, api = {}) => {
    let shift = 0, scale = 1;
    /* sticky, because a checklist may ask the learner to try a transform AND
       then come back to the original — the current values cannot record that */
    let everShifted = false, everScaled = false;

    el.innerHTML = `
      <div class="st">
        <div class="st-controls">
          <label class="st-lab2">Add to every value
            <input id="scAdd" type="range" min="-20" max="20" step="5" value="0" aria-label="Shift">
            <span id="scAddV">0</span></label>
          <label class="st-lab2">Multiply every value
            <input id="scMul" type="range" min="1" max="3" step="1" value="1" aria-label="Scale">
            <span id="scMulV">×1</span></label>
        </div>
        <div class="st-sets" id="scSets"></div>
        <div class="st-note" id="scNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      $('scAddV').textContent = (shift > 0 ? '+' : '') + shift;
      $('scMulV').textContent = '×' + scale;

      const applied = sets.map(s => ({ ...s, vals: s.values.map(v => v * scale + shift) }));
      const lo = Math.min(...applied.flatMap(s => s.vals));
      const hi = Math.max(...applied.flatMap(s => s.vals));
      const span = Math.max(1, hi - lo);
      const X = x => 6 + (x - lo) / span * 88;

      $('scSets').innerHTML = applied.map(s => `
        <div class="st-set">
          <div class="st-set-head"><b>${s.label}</b>
            <span>${s.vals.map(v => fmt(v)).join(' · ')}</span></div>
          <div class="st-strip">
            ${s.vals.map(v => `<i style="left:${X(v)}%"></i>`).join('')}
            <u style="left:${X(mean(s.vals))}%"></u>
          </div>
          <div class="st-set-stats">
            <span>mean <b>${fmt(mean(s.vals))}</b></span>
            <span>range <b>${fmt(range(s.vals))}</b></span>
            <span>mean deviation <b>${fmt(meanDev(s.vals))}</b></span>
          </div>
        </div>`).join('');

      const means = applied.map(s => mean(s.vals));
      const sameMean = means.every(m => Math.abs(m - means[0]) < 1e-9);
      const mds = applied.map(s => meanDev(s.vals));

      $('scNote').innerHTML = shift !== 0 && scale === 1
        ? `Adding a constant slides every value, so the <b>mean moves</b> by the same amount and the
           <b>spread does not change at all</b>.`
        : scale > 1
          ? `Multiplying stretches the whole picture: the mean <b>and</b> the spread are both
             multiplied by ${scale}.`
          : sameMean
            ? `Identical means, and mean deviations of <b>${mds.map(fmt).join('</b> and <b>')}</b>.
               An average alone tells you nothing about how alike the values are.`
            : `The means have parted company.`;

      api.report?.({
        shift, scale,
        means: means.map(r2), ranges: applied.map(s => r2(range(s.vals))),
        meanDevs: mds.map(r2),
        sameMean,
        triedShift: everShifted, triedScale: everScaled,
        spreadUnchangedByShift: shift !== 0 && scale === 1,
        backToOriginal: shift === 0 && scale === 1,
      });
    };

    $('scAdd').oninput = e => { shift = +e.target.value; if (shift) everShifted = true; draw(); };
    $('scMul').oninput = e => { scale = +e.target.value; if (scale > 1) everScaled = true; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
