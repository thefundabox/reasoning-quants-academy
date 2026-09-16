/* ============================================================
   Trade bar — chains of multiplicative change.

     tradeBar()         — cost → marked → selling, so you can SEE that
                          the markup is taken on cost and the discount
                          on the marked price, never on the same number
     successiveChain()  — any run of percentage changes, with the honest
                          net beside the naive sum of the percentages

   Both are pure factor arithmetic derived from the sliders. No price,
   profit or net figure here is stored, so the picture cannot disagree
   with the verdict printed under it.
   ============================================================ */

import { money } from './share-bar.js';

/** One percentage change as the factor it really is. */
export const factor = p => 1 + p / 100;

/** Net effect of a run of changes, in percent. */
export const netPct = ps => (ps.reduce((a, p) => a * factor(p), 1) - 1) * 100;

/** Cost → marked → selling, and what the seller actually made. */
export function trade(cp, markup, discount) {
  const mp = cp * factor(markup);
  const sp = mp * factor(-discount);
  return { cp, mp, sp, profit: sp - cp, profitPct: (sp - cp) / cp * 100 };
}

const round2 = n => Math.round(n * 100) / 100;

/* ---------------- cost → marked → selling ---------------- */
export function tradeBar(cfg) {
  const { cp = 500, markup = 60, discount = 25, unit = '₹', maxMarkup = 100, maxDiscount = 60 } = cfg;

  return (el, api = {}) => {
    let mk = markup, ds = discount;

    el.innerHTML = `
      <div class="tb">
        <div class="tb-controls">
          <label class="tb-lab">Mark up on <b>cost</b>
            <input id="tbMk" type="range" min="0" max="${maxMarkup}" step="5" value="${mk}"
                   aria-label="Markup percentage on cost"><span id="tbMkV"></span></label>
          <label class="tb-lab">Discount on <b>marked price</b>
            <input id="tbDs" type="range" min="0" max="${maxDiscount}" step="5" value="${ds}"
                   aria-label="Discount percentage on the marked price"><span id="tbDsV"></span></label>
        </div>
        <div class="tb-bars" id="tbBars"></div>
        <div class="tb-note">The two percentages sit on <b>different bases</b> — that is the whole topic.</div>
        <div class="tb-verdict" id="tbV"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const t = trade(cp, mk, ds);
      const top = Math.max(t.mp, cp) * 1.04;
      const bar = (label, val, cls, note) => `
        <div class="tb-row">
          <span class="tb-name">${label}</span>
          <span class="tb-track"><span class="tb-fill tb-fill--${cls}" style="width:${val / top * 100}%"></span></span>
          <b class="tb-val">${unit}${money(val)}</b>
          <em class="tb-note-s">${note}</em>
        </div>`;

      $('tbMkV').textContent = mk + '%';
      $('tbDsV').textContent = ds + '%';

      $('tbBars').innerHTML =
        bar('Cost', cp, 'cp', 'what the seller paid')
        + bar('Marked', t.mp, 'mp', `cost + ${mk}% <u>of cost</u>`)
        + bar('Selling', t.sp, 'sp', `marked − ${ds}% <u>of marked</u>`);

      const pp = round2(t.profitPct);
      const state = pp > 0.005 ? 'is-profit' : pp < -0.005 ? 'is-loss' : 'is-flat';
      $('tbV').className = 'tb-verdict ' + state;
      $('tbV').innerHTML = `
        <b>${pp > 0.005 ? `Profit of ${money(pp)}%` : pp < -0.005 ? `Loss of ${money(-pp)}%` : 'Breaks even'}</b>
        <p>${unit}${money(t.sp)} − ${unit}${money(cp)} = <b>${unit}${money(round2(t.profit))}</b>,
           and that is measured against <b>cost</b>, never against the marked price.
           A single factor does the same job: ${factor(mk).toFixed(2)} × ${factor(-ds).toFixed(2)}
           = <b>${(factor(mk) * factor(-ds)).toFixed(4)}</b>.</p>`;

      api.report?.({
        markup: mk, discount: ds, cp,
        mp: round2(t.mp), sp: round2(t.sp),
        profitPct: pp,
        sawProfit: pp > 0.005, sawLoss: pp < -0.005, sawBreakEven: Math.abs(pp) <= 0.005,
        hit20: Math.abs(pp - 20) < 0.005,
        discountOverMarkup: ds > mk,
      });
    };

    $('tbMk').oninput = e => { mk = +e.target.value; draw(); };
    $('tbDs').oninput = e => { ds = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- a run of successive changes ---------------- */
export function successiveChain(cfg) {
  const { base = 1000, steps: startSteps = [40, -40], labels = [], unit = '' } = cfg;

  return (el, api = {}) => {
    const steps = [...startSteps];

    el.innerHTML = `
      <div class="tb">
        <div class="tb-controls" id="scCtl"></div>
        <div class="tb-chain" id="scChain"></div>
        <div class="tb-compare" id="scCmp"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const vals = steps.reduce((acc, p) => [...acc, acc[acc.length - 1] * factor(p)], [base]);
      const net = netPct(steps);
      const naive = steps.reduce((a, b) => a + b, 0);
      const back = Math.abs(vals[vals.length - 1] - base) < 1e-9;

      $('scCtl').innerHTML = steps.map((p, i) => `
        <label class="tb-lab">${labels[i] || `Change ${i + 1}`}
          <input type="range" min="-50" max="50" step="5" value="${p}" data-i="${i}"
                 aria-label="${labels[i] || `Change ${i + 1}`} percentage">
          <span>${p > 0 ? '+' : ''}${p}%</span></label>`).join('');

      $('scChain').innerHTML = vals.map((v, i) => `
        ${i ? `<span class="tb-arrow">${steps[i - 1] > 0 ? '+' : ''}${steps[i - 1]}%<i>→</i></span>` : ''}
        <span class="tb-node ${i === 0 ? 'is-base' : ''} ${i === vals.length - 1 ? 'is-end' : ''}">
          <b>${unit}${money(v)}</b><em>${i === 0 ? 'start' : `step ${i}`}</em></span>`).join('');

      const gap = Math.abs(net - naive);
      $('scCmp').className = 'tb-compare ' + (back ? 'is-flat' : net < 0 ? 'is-loss' : 'is-profit');
      $('scCmp').innerHTML = `
        <div class="tb-cmp-cell">
          <span>What actually happened</span>
          <b>${net > 0 ? '+' : ''}${money(Math.round(net * 100) / 100)}%</b>
          <em>${steps.map(p => factor(p).toFixed(2)).join(' × ')} = ${(net / 100 + 1).toFixed(4)}</em>
        </div>
        <div class="tb-cmp-cell tb-cmp-cell--wrong">
          <span>Adding the percentages</span>
          <b>${naive > 0 ? '+' : ''}${naive}%</b>
          <em>${gap < 0.005 ? 'agrees here — only because one change is zero' : `wrong by ${money(Math.round(gap * 100) / 100)} points`}</em>
        </div>`;

      api.report?.({
        steps: [...steps], values: vals, net: Math.round(net * 100) / 100, naive,
        gap: Math.round(gap * 100) / 100,
        returnedToStart: back,
        sawGap: gap > 0.005,
        sawBigGap: gap >= 4,
        triedEqualOpposite: steps.length === 2 && steps[0] === -steps[1] && steps[0] !== 0,
      });
    };

    el.addEventListener('input', e => {
      const r = e.target.closest('input[type="range"][data-i]');
      if (!r) return;
      steps[+r.dataset.i] = +r.value;
      draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
