/* ============================================================
   Share bar — splitting one whole into parts.

     ratioBar()          — a:b:c across a total; the bar is drawn from
                           the parts, and every share is total x part / sum
     partnershipBoard()  — money x time per partner, and the profit split
                           that follows from those products

   Both compute every rupee on screen from the inputs. Nothing here
   stores a share, so the bar and the numbers under it cannot drift
   apart — change a ratio and the picture moves with the arithmetic.
   ============================================================ */

/** Indian grouping, and never a float artefact like 899.9999999999999. */
export const money = n => {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? r.toLocaleString('en-IN')
    : r.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

/** The whole of ratio arithmetic: find one part, then multiply. */
export function splitByRatio(total, parts) {
  const sum = parts.reduce((a, b) => a + b, 0);
  if (!sum) return { sum: 0, one: 0, shares: parts.map(() => 0) };
  return { sum, one: total / sum, shares: parts.map(p => total * p / sum) };
}

/** Reduce a list of weights to its simplest whole-number ratio. */
export function simplify(ws) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const g = ws.reduce((a, b) => gcd(a, Math.round(b)), Math.round(ws[0])) || 1;
  return ws.map(w => Math.round(w) / g);
}

const HUES = ['a', 'b', 'c', 'd'];

/* ---------------- ratio bar ---------------- */
export function ratioBar(cfg) {
  const { totals = [3600, 6300, 9000], start = 6300, names = ['Youngest', 'Middle', 'Eldest'],
          parts: startParts = [2, 3, 4], unit = '₹' } = cfg;

  return (el, api = {}) => {
    let total = start;
    let parts = [...startParts];

    el.innerHTML = `
      <div class="rb">
        <div class="rb-top">
          <label class="rb-lab">Total to divide
            <select class="rb-sel" id="rbTotal">
              ${totals.map(t => `<option value="${t}" ${t === start ? 'selected' : ''}>${unit}${money(t)}</option>`).join('')}
            </select></label>
          <div class="rb-ratio" id="rbRatio"></div>
        </div>

        <div class="rb-bar" id="rbBar"></div>

        <div class="rb-one" id="rbOne"></div>
        <div class="rb-steps" id="rbSteps"></div>
        <div class="rb-rows" id="rbRows"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const { sum, one, shares } = splitByRatio(total, parts);

      $('rbRatio').innerHTML = parts.map((p, i) =>
        `<span class="rb-tag rb-tag--${HUES[i]}">${p}</span>`)
        .join('<i class="rb-colon">:</i>');

      $('rbBar').innerHTML = parts.map((p, i) => `
        <span class="rb-seg rb-seg--${HUES[i]}" style="flex:${p}" title="${names[i]}">
          <b>${p}</b><em>${unit}${money(shares[i])}</em></span>`).join('');

      $('rbOne').innerHTML = `
        <span>One part</span>
        <b>${unit}${money(total)} ÷ ${sum} = <u>${unit}${money(one)}</u></b>
        <em>every share is just this, multiplied</em>`;

      $('rbSteps').innerHTML = parts.map((p, i) => `
        <div class="rb-step">
          <button class="rb-btn" data-i="${i}" data-d="-1" aria-label="Fewer parts for ${names[i]}">−</button>
          <span class="rb-step-lab rb-tag--${HUES[i]}">${names[i]}</span>
          <b>${p}</b>
          <button class="rb-btn" data-i="${i}" data-d="1" aria-label="More parts for ${names[i]}">+</button>
        </div>`).join('');

      $('rbRows').innerHTML = parts.map((p, i) => `
        <div class="rb-row">
          <span class="rb-dot rb-tag--${HUES[i]}"></span>
          <span class="rb-row-n">${names[i]}</span>
          <span class="rb-row-w">${p} × ${unit}${money(one)}</span>
          <b>${unit}${money(shares[i])}</b>
        </div>`).join('')
        + `<div class="rb-row rb-row--sum">
             <span class="rb-dot"></span><span class="rb-row-n">Together</span>
             <span class="rb-row-w">${parts.join(' + ')} = ${sum} parts</span>
             <b>${unit}${money(shares.reduce((a, b) => a + b, 0))}</b></div>`;

      api.report?.({
        total, parts: [...parts], sum, one, shares: [...shares],
        allEqual: parts.every(p => p === parts[0]),
        maxShare: Math.max(...shares),
        maxOverHalf: Math.max(...shares) > total / 2,
        oneIsWhole: Number.isInteger(one),
        sumBackOK: Math.abs(shares.reduce((a, b) => a + b, 0) - total) < 1e-9,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.rb-btn');
      if (!b) return;
      const i = +b.dataset.i, d = +b.dataset.d;
      parts[i] = Math.min(9, Math.max(1, parts[i] + d));
      draw();
    });
    $('rbTotal').onchange = e => { total = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- partnership board ---------------- */
export function partnershipBoard(cfg) {
  const { partners: startP = [], profit = 9000, unit = '₹', maxMonths = 12 } = cfg;

  return (el, api = {}) => {
    const ps = startP.map(p => ({ ...p }));

    el.innerHTML = `
      <div class="rb">
        <div class="rb-top">
          <span class="rb-lab">Profit to divide</span>
          <b class="rb-profit">${unit}${money(profit)}</b>
        </div>
        <div class="tb-note">Drag the months. Watch who the profit follows — it is not the bigger cheque.</div>
        <div class="rb-partners" id="pbP"></div>
        <p class="rb-cap">Capital × months — this product is the ratio, and nothing else is</p>
        <div class="rb-bar" id="pbBar"></div>
        <div class="rb-rows" id="pbRows"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const w = ps.map(p => p.money * p.months);
      const { shares } = splitByRatio(profit, w);
      const ratio = simplify(w);
      const richest = ps.reduce((best, p, i) => p.money > ps[best].money ? i : best, 0);
      const earner = shares.reduce((best, s, i) => s > shares[best] ? i : best, 0);

      $('pbP').innerHTML = ps.map((p, i) => `
        <div class="rb-partner">
          <span class="rb-dot rb-tag--${HUES[i]}"></span>
          <span class="rb-p-name">${p.name}</span>
          <span class="rb-p-money">${unit}${money(p.money)}</span>
          <input class="rb-months" type="range" min="1" max="${maxMonths}" value="${p.months}"
                 data-i="${i}" aria-label="Months ${p.name} stayed in">
          <span class="rb-p-mo"><b>${p.months}</b> mo</span>
        </div>`).join('');

      $('pbBar').innerHTML = w.map((x, i) => `
        <span class="rb-seg rb-seg--${HUES[i]}" style="flex:${x}">
          <b>${money(x)}</b><em>${unit}${money(shares[i])}</em></span>`).join('');

      $('pbRows').innerHTML = ps.map((p, i) => `
        <div class="rb-row">
          <span class="rb-dot rb-tag--${HUES[i]}"></span>
          <span class="rb-row-n">${p.name}</span>
          <span class="rb-row-w">${money(p.money)} × ${p.months} = ${money(w[i])}</span>
          <b>${unit}${money(shares[i])}</b>
        </div>`).join('')
        + `<div class="rb-row rb-row--sum">
             <span class="rb-dot"></span><span class="rb-row-n">Ratio</span>
             <span class="rb-row-w">${ratio.join(' : ')}</span>
             <b>${unit}${money(shares.reduce((a, b) => a + b, 0))}</b></div>`;

      api.report?.({
        weights: w, shares, ratio,
        richest, earner,
        // the whole lesson in one flag: the biggest cheque need not win
        richestIsNotEarner: richest !== earner,
        months: ps.map(p => p.months),
        equalShares: shares.every(s => Math.abs(s - shares[0]) < 1e-9),
      });
    };

    el.addEventListener('input', e => {
      const r = e.target.closest('.rb-months');
      if (!r) return;
      ps[+r.dataset.i].months = +r.value;
      draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
