/* ============================================================
   Series chain — build the operation between every pair of terms,
   then predict the one that is hidden.

   Works on numbers and on letters. For letters the widget shows the
   A=1 position under each one, because that conversion IS the method:
   you cannot subtract letters, but you can subtract their positions.

   Adapted from the original series-solver "detective mode".
   ============================================================ */

const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const posOf = c => AZ.indexOf(c) + 1;

const apply = (op, n, v) =>
  op === '+' ? v + n : op === '−' ? v - n : op === '×' ? v * n : (n ? v / n : NaN);

/** Does `op n` carry term i to term i+1? The one rule that colours a gap. */
export const gapOk = (nums, i, op, n) => {
  const v = parseFloat(n);
  return !isNaN(v) && Math.abs(apply(op, v, nums[i]) - nums[i + 1]) < 1e-9;
};

/** The chain the "Show the chain" button fills in — one op and one number per gap. */
export function chainSolution(nums) {
  return nums.slice(0, -1).map((v, i) => {
    const d = nums[i + 1] - v;
    const r = v !== 0 ? nums[i + 1] / v : NaN;
    return Number.isInteger(r) && Math.abs(r) > 1
      ? { op: '×', n: String(r) }
      : { op: d >= 0 ? '+' : '−', n: String(Math.abs(d)) };
  });
}

/* Scripted-action surface — see turnDialMachine in compass.js.
   The gap inputs are free text, so the sweep cannot enumerate them: the action
   alphabet offers each gap the value that WOULD close it, one that would not,
   and blank — enough to move every reported field in both directions. The
   widget reports only when the learner presses "Test my chain", so a state
   that has never been tested reports nothing, and the sweep skips it. */
export function seriesChainMachine({ terms = [], letters = false } = {}) {
  const nums = letters ? terms.map(posOf) : terms.slice();
  const gaps = terms.length - 2;                              // the last term is hidden
  const sol = chainSolution(nums).slice(0, gaps);   // the last gap leads to the hidden term
  const want = nums[nums.length - 1];
  const OPS = ['+', '−', '×', '÷'];
  const numsFor = i => [sol[i].n, String(+sol[i].n + 1), ''];
  const blank = { ops: Array.from({ length: gaps }, () => '+'),
                  ns: Array.from({ length: gaps }, () => ''), guess: '', out: null };

  const test = st => {
    const ok = st.ops.filter((op, i) => gapOk(nums, i, op, st.ns[i])).length;
    const p = parseFloat(st.guess);
    const hit = !isNaN(p) && Math.abs(p - want) < 1e-9;
    return { gapsCorrect: ok, gaps, chainSolved: ok === gaps,
             predicted: hit, solved: ok === gaps && hit, letters };
  };

  return {
    init: blank,
    actions: st => [
      ...st.ops.flatMap((_, i) => OPS.map(o => `o${i}:${o}`)),
      ...st.ns.flatMap((_, i) => numsFor(i).map(v => `n${i}:${v}`)),
      ...[String(want), String(want + 1), ''].map(v => `p:${v}`),
      'show', 'check',
    ],
    act(st, a) {
      if (a === 'check') return { ...st, out: test(st) };
      if (a === 'show') {                                     // fills the chain, then tests it
        const filled = { ops: sol.map(g => g.op), ns: sol.map(g => g.n), guess: String(want) };
        return { ...filled, out: test(filled) };
      }
      const [head, val] = [a.slice(0, a.indexOf(':')), a.slice(a.indexOf(':') + 1)];
      if (head === 'p') return { ...st, guess: val };
      const i = +head.slice(1);
      return head[0] === 'o'
        ? { ...st, ops: st.ops.map((o, k) => (k === i ? val : o)) }
        : { ...st, ns: st.ns.map((n, k) => (k === i ? val : n)) };
    },
    report: st => st.out,          // null until the learner tests the chain
  };
}

export function seriesChain(cfg = {}) {
  const { terms = [], letters = false, label = '' } = cfg;
  const M = seriesChainMachine(cfg);
  return (el, api = {}) => {
    const nums = letters ? terms.map(posOf) : terms.slice();
    const shown = terms.slice(0, terms.length - 1);
    const gaps = shown.length - 1;
    let st = M.init;

    el.innerHTML = `
      <div class="sc">
        ${label ? `<p class="sc-label">${label}</p>` : ''}
        <div class="sc-terms" id="scTerms"></div>
        <div class="sc-gaps" id="scGaps"></div>
        <div class="sc-foot">
          <button class="btn sc-btn" id="scCheck">Test my chain</button>
          <button class="btn btn--ghost sc-btn" id="scShow">Show the chain</button>
          <span class="sc-status" id="scStatus"></span>
        </div>
        <div class="sc-verdict" id="scVerdict"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    const max = Math.max(...nums.map(Math.abs), 1);

    const drawTerms = (revealLast = false) => {
      $('scTerms').innerHTML = terms.map((t, i) => {
        const last = i === terms.length - 1;
        const hide = last && !revealLast;
        const h = letters ? 54 : Math.max(14, Math.abs(nums[i]) / max * 92);
        return `<div class="sc-col">
                  <span class="sc-val ${hide ? 'is-hidden' : ''}">${hide ? '?' : t}</span>
                  ${letters ? `<span class="sc-pos">${hide ? '' : posOf(t)}</span>` : ''}
                  <div class="sc-bar ${hide ? 'is-myst' : ''}" style="height:${hide ? 46 : h}px"></div>
                </div>`;
      }).join('');
    };

    const drawGaps = () => {
      $('scGaps').innerHTML = st.ops.map((op, i) => `
        <div class="sc-gap" id="scGap${i}">
          <span>${letters ? posOf(terms[i]) : terms[i]}</span>
          <select data-op="${i}">${['+', '−', '×', '÷'].map(o =>
            `<option ${o === op ? 'selected' : ''}>${o}</option>`).join('')}</select>
          <input type="number" step="any" data-n="${i}" value="${st.ns[i]}" placeholder="?">
        </div>`).join('') +
        `<div class="sc-gap sc-gap--pred">
           <span>${letters ? posOf(terms[shown.length - 1]) : terms[shown.length - 1]} →</span>
           <input type="number" step="any" id="scPred" value="${st.guess}" placeholder="next">
           ${letters ? '<em>as a position</em>' : ''}
         </div>`;

      el.querySelectorAll('[data-op]').forEach(s =>
        s.onchange = e => { st = M.act(st, `o${e.target.dataset.op}:${e.target.value}`); });
      el.querySelectorAll('[data-n]').forEach(s =>
        s.oninput = e => { st = M.act(st, `n${e.target.dataset.n}:${e.target.value}`); });
      $('scPred').oninput = e => { st = M.act(st, `p:${e.target.value}`); };
    };

    const paint = () => {
      const r = M.report(st);
      st.ops.forEach((op, i) => {
        $('scGap' + i).className = 'sc-gap ' + (gapOk(nums, i, op, st.ns[i]) ? 'is-ok' : 'is-no');
      });
      const want = nums[nums.length - 1];
      if (r.predicted) drawTerms(true);

      $('scStatus').textContent = `${r.gapsCorrect} / ${gaps} gaps correct`;
      $('scVerdict').innerHTML =
        (r.chainSolved ? `<b class="sc-win">Chain correct.</b> ` : `Fix the red gaps. `) +
        (r.predicted ? `<b class="sc-win">And the hidden term is ${letters ? terms[terms.length - 1] + ' (position ' + want + ')' : want}.</b>`
             : st.guess !== '' ? `Your prediction is not it yet.` : '');

      api.report?.(r);
    };

    $('scCheck').onclick = () => { st = M.act(st, 'check'); paint(); };
    $('scShow').onclick = () => { st = M.act(st, 'show'); drawGaps(); paint(); };

    drawTerms(); drawGaps();
    return { destroy() { el.innerHTML = ''; } };
  };
}
