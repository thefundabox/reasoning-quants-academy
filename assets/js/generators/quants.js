/* ============================================================
   Question generators — Quants.  See reasoning.js for the contract.

   Numbers are chosen so the arithmetic comes out CLEAN. An exam item
   that needs a calculator is not testing the idea it claims to test,
   and a generator that draws its numbers freely produces those by the
   dozen — so most of these pick from curated pools rather than ranges.
   ============================================================ */

import { options, near, byTier } from './rand.js';
import { barsFig, lineFig, slotsFig, scaleFig, beamFig, tableFig, pieFig, chartFig, svg } from './figures.js';
import { splitByRatio, money } from '../widgets/share-bar.js';
import { trade, netPct } from '../widgets/trade-bar.js';
import { simple, compound, ciMinusSi, avgSpeed, workUnits, toMS } from '../widgets/rate-lab.js';
import { hcfLcm, divisibilityChecks } from '../widgets/number-lab.js';
import { mean, weighted, alligation } from '../widgets/stat-lab.js';
import { nPr, nCr, wordArrangements, frac } from '../widgets/count-lab.js';
import { rectArea, circleArea, circleCirc, triArea, borderArea, cylVol, cuboidVol,
         cuboidSurf, PI22 } from '../widgets/mensuration-lab.js';
import { sum, pct, growth } from '../widgets/di-lab.js';

const r2 = x => Math.round(x * 100) / 100;
const clean = x => (Number.isInteger(x) ? String(x) : String(r2(x)));

/* ---------------- Unit 1 · Number Sense ---------------- */

export const hcfLcmGen = {
  id: 'num-hcflcm', chapter: 'quants:1',
  concept: 'lcm-identity', conceptLabel: 'HCF × LCM = the product of the pair',
  make(R, tier = 2) {
    /* Gentle keeps both numbers inside the tables a learner already knows;
       stretch pushes past them, where the identity stops being optional. */
    const hi = byTier(tier, 24, 60, 140);
    const a = R.int(6, hi), b = R.int(6, hi);
    if (a === b) return this.make(R, tier);
    const { hcf, lcm } = hcfLcm(a, b);
    const askLcm = R() < 0.5;
    const v = askLcm ? lcm : hcf;
    const o = options(String(v), [
      { v: String(askLcm ? hcf : lcm), why: `That is the <b>${askLcm ? 'HCF' : 'LCM'}</b>, the other
        half of the pair. HCF is the largest number that DIVIDES both; LCM is the smallest that
        BOTH divide. Here HCF = ${hcf} and LCM = ${lcm}.` },
      { v: String(a * b), why: `That is the product ${a} × ${b} = ${a * b}. The product equals
        HCF × LCM, not either one alone — divide it by the ${askLcm ? `HCF (${hcf})` : `LCM (${lcm})`}
        to get the ${askLcm ? 'LCM' : 'HCF'}.` },
      { v: String(v + 1), why: `One out. Check with the identity: HCF × LCM must equal ${a} × ${b}
        = ${a * b}. ${hcf} × ${lcm} = ${hcf * lcm}. ✓` },
    ], i => ({ v: String(v + 2 * (i + 1)),
               why: `Test any candidate against HCF × LCM = ${a} × ${b} = ${a * b} — it catches
                     every slip of this kind in one multiplication.` }));
    return {
      q: `What is the <b>${askLcm ? 'LCM' : 'HCF'}</b> of ${a} and ${b}?`,
      ...o,
      whyRight: `HCF(${a}, ${b}) = ${hcf} and LCM = ${lcm}. Check it the way that catches slips:
        HCF × LCM = ${hcf} × ${lcm} = ${hcf * lcm} = ${a} × ${b}. The answer is <b>${v}</b>.`,
      whyWrong: `Find one, then get the other free — <b>HCF × LCM = a × b</b>.<br><br>
        ${a} × ${b} = ${a * b}. HCF(${a}, ${b}) = ${hcf}, so LCM = ${a * b} ÷ ${hcf} = ${lcm}.<br><br>
        The ${askLcm ? 'LCM' : 'HCF'} is <b>${v}</b>.`,
      /* HCF × LCM = a × b is the check that catches every slip, so show the
         two products as bars of equal length rather than claiming they match. */
      figure: barsFig([
        { label: `HCF × LCM`, value: hcf * lcm, text: `${hcf} × ${lcm} = ${hcf * lcm}`, on: true },
        { label: `${a} × ${b}`, value: a * b, text: String(a * b), on: true },
      ], { w: 400 }),
      figureCap: `Equal lengths, and they must be — find one and the other comes free.`,
      hardness: Math.max(a, b),
    };
  },
};

export const divisGen = {
  id: 'num-divis', chapter: 'quants:1',
  concept: 'divis-combine', conceptLabel: 'Testing divisibility by coprime factors',
  make(R, tier = 2) {
    /* The rule for 3 is one addition; the rule for 11 is an alternating sum.
       Tier decides both how long the number is and how fiddly the test. */
    const n = R.int(byTier(tier, 100, 1000, 100000), byTier(tier, 999, 99999, 9999999));
    const checks = divisibilityChecks(n);
    const by = R.pick(byTier(tier, [3, 4, 9], [3, 4, 6, 8, 9, 11], [6, 8, 11]));
    const yes = n % by === 0;
    return {
      q: `Is <b>${n.toLocaleString('en-IN')}</b> divisible by <b>${by}</b>?`,
      options: ['Yes', 'No'],
      answer: yes ? 0 : 1,
      /* Only two options, so only one can be wrong — but the reason a learner
         picks it is knowable, and it is almost always the rule misapplied
         rather than a guess. Written out by hand because this question never
         goes through `options()`. */
      whyOption: yes
        ? ['', `The rule for ${by} does hold here. ${checks.find(c => c.by === by)?.rule || ''}
                ${n} = ${by} × ${n / by} exactly.`]
        : [`${n} leaves remainder <b>${n % by}</b> when divided by ${by}, so it is not divisible.
            ${checks.find(c => c.by === by)?.rule || ''}`, ''],
      whyRight: `${n} ÷ ${by} ${yes ? `= ${n / by} exactly` : `leaves remainder ${n % by}`}.
        ${checks.find(c => c.by === by)?.rule || ''}`,
      hardness: String(n).length,
      whyWrong: `Use the rule, not long division.<br><br>
        ${checks.find(c => c.by === by)?.rule || `Divide and look at the remainder.`}<br><br>
        ${n} ${yes ? 'is' : 'is <b>not</b>'} divisible by ${by}${yes ? '' : ` — the remainder is ${n % by}`}.`,
      /* The rule acting on the actual digits, so the test is something to look
         at rather than a sentence to remember. */
      figure: barsFig([
        { label: `${n}`, value: n, text: `${n.toLocaleString('en-IN')}`, on: true },
        { label: `÷ ${by}`, value: n - (n % by), text: `${Math.floor(n / by)} × ${by} = ${n - (n % by)}`, on: true },
        { label: 'remainder', value: Math.max(n % by, n * 0.004), text: String(n % by), on: (n % by) !== 0 },
      ], { w: 460 }),
      figureCap: `A remainder of ${n % by} — ${yes ? 'nothing left over, so it divides.' : 'so it does not divide.'}`,
    };
  },
};

/* ---------------- Unit 2 · Ratio, Percentage & Trade ---------------- */

export const ratioSplit = {
  id: 'pct-ratio', chapter: 'quants:2',
  concept: 'ratio-one-part', conceptLabel: 'One part first, then everything else',
  make(R, tier = 2) {
    /* Two parts is one division; three parts with awkward weights is where
       learners start splitting the money directly and going wrong. */
    const parts = R.pick(byTier(tier,
      [[1, 2], [2, 3], [1, 3]],
      [[2, 3], [3, 4], [2, 3, 5], [1, 2, 3], [3, 5, 7], [4, 5]],
      [[3, 5, 7], [2, 5, 8], [4, 7, 9], [5, 6, 9], [3, 7, 11]]));
    const unit = R.int(byTier(tier, 2, 6, 11), byTier(tier, 12, 40, 90)) * 10;
    const total = parts.reduce((a, b) => a + b, 0) * unit;
    const { shares } = splitByRatio(total, parts);
    const i = R.int(0, parts.length - 1);
    const v = shares[i];
    const o = options(money(v), shares.map((sv, k) => ({ v: money(sv), k })).filter(x => x.k !== i)
      .map(x => ({ v: x.v, why: `That is the <b>${['first', 'second', 'third'][x.k]}</b> share
        (${parts[x.k]} parts), not the ${['first', 'second', 'third'][i]} (${parts[i]} parts).
        One part is worth ₹${unit.toLocaleString('en-IN')}, so read which share is being asked for
        before multiplying.` })),
      k => ({ v: money(v + unit * (k + 1)),
              why: `Not a whole number of parts. One part = ₹${total.toLocaleString('en-IN')} ÷
                    ${parts.reduce((x, y) => x + y, 0)} = ₹${unit.toLocaleString('en-IN')}, and every
                    share must be a multiple of it.` }));
    return {
      q: `What is the <b>${['first', 'second', 'third'][i]}</b> share?`,
      context: `₹${total.toLocaleString('en-IN')} is divided in the ratio
                <b>${parts.join(' : ')}</b>.`,
      ...o,
      whyRight: `The parts total ${parts.join(' + ')} = ${parts.reduce((a, b) => a + b, 0)}, so one
        part is ₹${total.toLocaleString('en-IN')} ÷ ${parts.reduce((a, b) => a + b, 0)} =
        ₹${unit.toLocaleString('en-IN')}. The ${['first', 'second', 'third'][i]} share is
        ${parts[i]} × ₹${unit.toLocaleString('en-IN')} = <b>${money(v)}</b>.`,
      whyWrong: `Never split the money directly — find <b>one part</b> first.<br><br>
        Total parts = ${parts.reduce((a, b) => a + b, 0)}. One part =
        ₹${total.toLocaleString('en-IN')} ÷ ${parts.reduce((a, b) => a + b, 0)} =
        ₹${unit.toLocaleString('en-IN')}.<br><br>
        ${parts[i]} parts = <b>${money(v)}</b>.`,
      figure: barsFig(parts.map((pt, k) => ({
        label: `${['first', 'second', 'third'][k] || `share ${k + 1}`} · ${pt} part${pt > 1 ? 's' : ''}`,
        value: shares[k], text: money(shares[k]), on: k === i,
      })), { w: 460 }),
      figureCap: `${parts.join(' : ')} — ${parts.reduce((x, y) => x + y, 0)} equal parts in all.`,
      hardness: parts.length * 10 + parts.reduce((x, y) => x + y, 0),
    };
  },
};

export const profitLoss = {
  id: 'pct-trade', chapter: 'quants:2',
  concept: 'trade-bases', conceptLabel: 'Profit sits on cost, discount on marked price',
  make(R, tier = 2) {
    const cp = R.int(byTier(tier, 5, 10, 21), byTier(tier, 40, 90, 240)) * 10;
    /* 10% and 25% are movements of the decimal point; 12.5% and 37.5% are not. */
    const pct = R.pick(byTier(tier, [10, 20, 25, 50], [10, 12.5, 15, 20, 25, 30, 40],
      [12.5, 16.5, 18, 22.5, 37.5, 45]));
    const gain = R() < 0.6;
    const sp = r2(cp * (1 + (gain ? pct : -pct) / 100));
    const o = options(money(sp), [
      { v: money(r2(cp * (1 - (gain ? pct : -pct) / 100))),
        why: `You moved the price the wrong way. A <b>${pct}% ${gain ? 'profit' : 'loss'}</b> means
          the selling price is ${gain ? 'ABOVE' : 'BELOW'} the cost — ${money(cp)} ×
          ${gain ? `(1 + ${pct}/100)` : `(1 − ${pct}/100)`}.` },
      { v: money(cp + pct), why: `You added ${pct} <em>rupees</em> rather than ${pct} <em>per
        cent</em>. ${pct}% of ${money(cp)} is ${money(r2(cp * pct / 100))}, not ₹${pct}.` },
      { v: money(r2(sp + cp * 0.05)), why: `5% of the cost too high. Profit and loss are always
        measured on the COST price unless the question says otherwise.` },
    ], i => ({ v: money(sp + 10 * (i + 1)),
               why: `SP = CP × (1 ${gain ? '+' : '−'} ${pct}/100) = ${money(cp)} ×
                     ${clean(1 + (gain ? pct : -pct) / 100)} = ${money(sp)}.` }));
    return {
      q: 'What is the selling price?',
      context: `An article costing <b>${money(cp)}</b> is sold at a
                <b>${pct}% ${gain ? 'profit' : 'loss'}</b>.`,
      ...o,
      whyRight: `${gain ? 'Profit' : 'Loss'} is always a percentage <b>of cost</b>:
        ${money(cp)} × ${gain ? 1 + pct / 100 : 1 - pct / 100} = <b>${money(sp)}</b>.`,
      /* Cost and selling price side by side: the gap IS the profit, and its
         length against the COST bar is what the percentage measures. */
      figure: barsFig([
        { label: 'Cost price', value: cp, text: money(cp), on: true },
        { label: 'Selling price', value: sp, text: money(sp), on: true },
      ], { w: 420 }),
      figureCap: `The ${gain ? 'gain' : 'loss'} is measured against the <b>cost</b> bar — always the base named in the question.`,
      hardness: cp / 10 + (Number.isInteger(pct) ? 0 : 40),
      whyWrong: `The base decides everything. Profit and loss are reckoned on the
        <b>cost price</b>, never on the selling price.<br><br>
        SP = CP × (1 ${gain ? '+' : '−'} ${pct}/100) = ${money(cp)} ×
        ${gain ? 1 + pct / 100 : 1 - pct / 100} = <b>${money(sp)}</b>.`,
    };
  },
};

export const successive = {
  id: 'pct-succ', chapter: 'quants:2',
  concept: 'succ-multiply', conceptLabel: 'Successive changes multiply, never add',
  make(R, tier = 2) {
    /* Gentle keeps both changes in the same direction, where the intuition
       still works; stretch mixes a rise with a fall, where it does not. */
    /* Gentle was three values by two, always both increases — six questions.
       The first attempt at widening let the SECOND change go either way at
       gentle, and the tier check refused it: this generator's own `hardness`
       claims mixed directions are worth +30, so mixing them at gentle pushed
       the gentle mean ABOVE exam. The claim is right and the widening was
       wrong — a generator must not have its difficulty measure quietly
       loosened to fit a change. The variety comes from the value pool instead:
       five first changes by four second ones is twenty gentle questions, all
       still same-direction, which is the honest gentle case (+20% then +20% is
       +44%, not +40% — the idea, without the sign complication on top). */
    const a = R.pick(byTier(tier, [10, 20, 25, 40, 50], [10, 20, 25, 30, 50], [12.5, 15, 35, 45, 60]));
    const b = R.pick(byTier(tier, [10, 20, 25, 50], [10, 20, 25, 30], [15, 22.5, 35, 40]));
    const upA = byTier(tier, true, R() < 0.5, R() < 0.5);
    const upB = byTier(tier, true, R() < 0.5, !upA);
    const net = r2(netPct([upA ? a : -a, upB ? b : -b]));
    const naive = (upA ? a : -a) + (upB ? b : -b);
    const o = options(`${net}%`, [
      { v: `${naive}%`, why: `That is the two percentages simply ${naive >= 0 ? 'added' : 'added'}
        (${upA ? '+' : '−'}${a} ${upB ? '+' : '−'}${b}). Percentages never add, because the second
        one is taken on the NEW price, not the original — the base has moved.` },
      { v: `${r2(-net)}%`, why: `Right size, wrong sign. Multiply the factors and compare with 1:
        ${clean(1 + (upA ? a : -a) / 100)} × ${clean(1 + (upB ? b : -b) / 100)} =
        ${clean(1 + net / 100)}, which is ${net >= 0 ? 'above' : 'below'} 1.` },
      { v: `${r2(net + 1)}%`, why: `One point out. Work in factors, never in percentages:
        ${clean(1 + (upA ? a : -a) / 100)} × ${clean(1 + (upB ? b : -b) / 100)} =
        ${clean(1 + net / 100)} → ${net}%.` },
    ], i => ({ v: `${r2(net + (i + 2))}%`,
               why: `Net factor = ${clean(1 + (upA ? a : -a) / 100)} ×
                     ${clean(1 + (upB ? b : -b) / 100)} = ${clean(1 + net / 100)}, so the change is ${net}%.` }));
    return {
      q: 'What is the net percentage change?',
      context: `A price is <b>${upA ? 'increased' : 'decreased'} by ${a}%</b> and then
                <b>${upB ? 'increased' : 'decreased'} by ${b}%</b>.`,
      ...o,
      whyRight: `Multiply the factors, do not add the percentages:
        ${(1 + (upA ? a : -a) / 100).toFixed(2)} × ${(1 + (upB ? b : -b) / 100).toFixed(2)} =
        ${(1 + net / 100).toFixed(4)}, a net <b>${net}%</b>.`,
      whyWrong: `${a}% and ${b}% do not add to ${naive}% — the second change sits on the
        <b>new</b> price, not the old one.<br><br>
        Net factor = ${(1 + (upA ? a : -a) / 100).toFixed(2)} × ${(1 + (upB ? b : -b) / 100).toFixed(2)}
        = ${(1 + net / 100).toFixed(4)} → <b>${net}%</b>.`,
      figure: (() => {
        const f1 = 1 + (upA ? a : -a) / 100, f2 = 1 + (upB ? b : -b) / 100;
        return barsFig([
          { label: 'Start', value: 100, text: '100', on: true },
          { label: `after ${upA ? '+' : '−'}${a}%`, value: 100 * f1, text: clean(r2(100 * f1)), on: true },
          { label: `after ${upB ? '+' : '−'}${b}%`, value: 100 * f1 * f2, text: clean(r2(100 * f1 * f2)), on: true },
        ], { w: 430 });
      })(),
      figureCap: `Each change acts on the bar <em>before</em> it, never on the original 100.`,
      hardness: a + b + (upA === upB ? 0 : 30),
    };
  },
};

/* ---------------- Unit 3 · Interest, Time & Work ---------------- */

export const interestGen = {
  id: 'int-si-ci', chapter: 'quants:3',
  concept: 'ci-two-year-gap', conceptLabel: 'The CI–SI gap over two years',
  make(R, tier = 2) {
    const p = R.int(byTier(tier, 2, 4, 11), byTier(tier, 10, 30, 90)) * 1000;
    /* 10% and 20% keep the gap a round number; 12% and 15% do not. */
    const rate = R.pick(byTier(tier, [10, 20], [5, 8, 10, 12, 15, 20], [7, 12, 15, 18, 22]));
    const t = 2;
    const si = simple(p, rate, t), gap = r2(ciMinusSi(p, rate, t));
    const askGap = R() < 0.5;
    const v = askGap ? gap : si;
    const o = options(money(v), [
      { v: money(askGap ? si : gap),
        why: askGap
          ? `That is the simple interest itself, not the GAP. CI − SI for 2 years is the interest
             earned on the first year's interest — a much smaller number.`
          : `That is the CI − SI gap, not the simple interest. The gap is the extra that compounding
             earns; the question asks for the plain SI.` },
      { v: money(r2(v * 2)), why: `Twice the answer — check whether you doubled a one-year figure
        that was already for two years.` },
      { v: money(r2(v + p * 0.01)), why: `1% of the principal too high. Substitute carefully:
        SI = P × R × T ÷ 100 with P = ${money(p)}.` },
    ], i => ({ v: money(r2(v + 50 * (i + 1))),
               why: `${askGap ? `CI − SI over 2 years = P(R/100)² = ${money(gap)}.`
                              : `SI = P × R × T ÷ 100 = ${money(si)}.`}` }));
    return {
      q: askGap
        ? 'By how much does compound interest exceed simple interest in 2 years?'
        : 'What is the simple interest for 2 years?',
      context: `<b>${money(p)}</b> is invested at <b>${rate}% per annum</b>.`,
      ...o,
      whyRight: askGap
        ? `The gap is one year's interest on the first year's interest:
           P(r/100)² = ${money(p)} × ${rate / 100}² = <b>${money(gap)}</b>.`
        : `SI = P × r × t / 100 = ${money(p)} × ${rate} × 2 / 100 = <b>${money(si)}</b>.`,
      whyWrong: askGap
        ? `CI beats SI only because the second year earns interest on the FIRST year's interest.
           That is ${money(p * rate / 100)} × ${rate}% = <b>${money(gap)}</b> — or straight from
           P(r/100)².`
        : `SI is flat: the same interest every year, always on the original principal.<br><br>
           ${money(p)} × ${rate}% = ${money(p * rate / 100)} a year, so two years is
           <b>${money(si)}</b>.`,
      figure: barsFig([
        { label: 'Year 1 · SI', value: p * rate / 100, text: money(r2(p * rate / 100)), on: true },
        { label: 'Year 2 · SI', value: p * rate / 100, text: money(r2(p * rate / 100)), on: true },
        { label: 'Year 2 · CI', value: p * rate / 100 + gap, text: money(r2(p * rate / 100 + gap)), on: true },
        { label: 'the gap', value: Math.max(gap, p * 0.002), text: money(gap), on: askGap },
      ], { w: 470 }),
      figureCap: `Simple interest repeats the same bar. Compound interest adds interest on the
        first year's interest — that extra sliver is the whole difference.`,
      hardness: p / 1000 + rate,
    };
  },
};

export const speedGen = {
  id: 'int-speed', chapter: 'quants:3',
  concept: 'speed-average', conceptLabel: 'Average speed is total distance over total time',
  make(R, tier = 2) {
    /* Pairs whose harmonic mean is clean — an average-speed question that needs
       a calculator is testing arithmetic, not the idea. */
    /* A 2:1 pair halves and doubles in the head; 42 and 56 do not. */
    const [u, v] = R.pick(byTier(tier,
      [[20, 30], [15, 30], [10, 15], [12, 24], [30, 60], [10, 40], [6, 12], [8, 24], [5, 20],
       [4, 12], [9, 18], [10, 30], [14, 21], [18, 27], [16, 24], [25, 50], [20, 60], [12, 36]],
      [[40, 60], [30, 60], [20, 30], [50, 75], [60, 90], [15, 30],
       [10, 15], [12, 24], [24, 36], [45, 90], [20, 80], [35, 70],
       [16, 48], [25, 100], [18, 36], [42, 56], [30, 45], [40, 120],
       [21, 28], [14, 35], [36, 45], [48, 80], [54, 90], [22, 33],
       [26, 39], [15, 60], [28, 42], [33, 66], [55, 66], [12, 60]],
      [[42, 56], [35, 70], [25, 100], [45, 90], [16, 48], [20, 80],
       [21, 28], [14, 35], [26, 39], [33, 66], [55, 66], [63, 84],
       [39, 52], [51, 68], [57, 76], [65, 91], [44, 77], [34, 51],
       [38, 57], [46, 69], [58, 87], [62, 93], [66, 99], [69, 92],
       [72, 108], [76, 114], [85, 119], [95, 133], [78, 104], [87, 116]]));
    const avg = r2(avgSpeed(u, v));
    const naive = (u + v) / 2;
    const o = options(`${clean(avg)} km/h`, [
      { v: `${clean(naive)} km/h`, why: `That is the plain mean of the two speeds, and it is always
        too high. He spends LONGER on the slow leg, so the slow speed carries more weight —
        the honest answer must sit below ${clean(naive)}.` },
      { v: `${clean(u)} km/h`, why: `That is one of the two speeds, not the average of the journey.
        The answer always lies strictly between ${Math.min(u, v)} and ${Math.max(u, v)}.` },
      { v: `${clean(r2(avg + 1))} km/h`, why: `One out. 2uv/(u+v) = 2 × ${u} × ${v} ÷ ${u + v} =
        ${clean(avg)} km/h.` },
    ], i => ({ v: `${clean(r2(avg + 2 + i))} km/h`,
               why: `Average speed = total distance ÷ total time = 2uv/(u+v) = ${clean(avg)} km/h.` }));
    return {
      q: 'What is his average speed for the whole journey?',
      context: `A man travels from A to B at <b>${u} km/h</b> and returns along the same road at
                <b>${v} km/h</b>.`,
      ...o,
      whyRight: `Average speed is total distance ÷ total time, never the mean of the speeds.
        For equal distances that is the harmonic mean, 2uv/(u+v) = 2×${u}×${v}/${u + v} =
        <b>${clean(avg)} km/h</b>.`,
      whyWrong: `${clean(naive)} km/h is the mean of the two speeds, and it is wrong because he
        spends LONGER at the slower speed — so the slow leg counts for more.<br><br>
        2uv/(u+v) = 2×${u}×${v}/${u + v} = <b>${clean(avg)} km/h</b>. It is always below the
        plain average.`,
      figure: beamFig(
        { at: u, weight: `${u} km/h` }, { at: v, weight: `${v} km/h` }, clean(avg), { w: 420 }),
      hardness: u + v,
      figureCap: `The pivot sits nearer the <b>slower</b> speed, because more time is spent at it —
        which is why ${naive} (the plain average) is wrong.`,
    };
  },
};

export const workGen = {
  id: 'int-work', chapter: 'quants:3',
  concept: 'work-rates-add', conceptLabel: 'Rates add; days do not',
  make(R, tier = 2) {
    /* Gentle picks pairs whose joint time comes out clean. */
    const a = R.pick(byTier(tier, [4, 6, 8, 10, 12, 20], [6, 8, 10, 12, 15, 20, 24], [7, 9, 14, 18, 21, 28]));
    let b = R.pick(byTier(tier, [3, 4, 6, 8, 12], [6, 8, 10, 12, 15, 20, 24, 30], [11, 13, 16, 22, 27, 35]));
    if (b === a) b += 6;
    const w = workUnits([a, b]);
    const together = r2(w.time);
    const o = options(`${clean(together)} days`, [
      { v: `${clean(a + b)} days`, why: `You added the DAYS. Two people working together can never
        take longer than either of them alone — the answer must be under ${Math.min(a, b)} days.` },
      { v: `${clean((a + b) / 2)} days`, why: `That is the average of the two times. Averaging days
        is the same mistake as adding them: it is RATES that combine, not durations.` },
      { v: `${clean(r2(together + 1))} days`, why: `One out. Take the job as ${w.total} units:
        A does ${w.rates[0]} a day, B does ${w.rates[1]}, together ${w.net} — so
        ${w.total} ÷ ${w.net} = ${clean(together)} days.` },
    ], i => ({ v: `${clean(r2(together + 2 + i))} days`,
               why: `1/${a} + 1/${b} of the job per day → ${clean(together)} days. The answer is
                     always smaller than the faster worker's own time.` }));
    return {
      q: 'Working together, how long will they take?',
      context: `A can finish a job in <b>${a} days</b> and B can finish the same job in
                <b>${b} days</b>.`,
      ...o,
      whyRight: `Add the RATES, not the days. In one day A does 1/${a} and B does 1/${b}, together
        ${w.rates[0]} + ${w.rates[1]} = ${w.net} of the ${w.total} units — so
        <b>${clean(together)} days</b>.`,
      figure: barsFig([
        { label: `A's rate`, value: 1 / a, text: `1/${a} of the job a day`, on: true },
        { label: `B's rate`, value: 1 / b, text: `1/${b} of the job a day`, on: true },
        { label: `together`, value: 1 / a + 1 / b, text: `1/${a} + 1/${b} → ${clean(together)} days`, on: true },
      ], { w: 470 }),
      figureCap: `Add the daily RATES, never the days. The joint bar is the two stacked.`,
      hardness: a + b,
      whyWrong: `Days never add: two people cannot take longer than one of them working alone.<br><br>
        Count units of work. Take the job as ${w.total} units; A does ${w.rates[0]} a day, B does
        ${w.rates[1]}. Together ${w.net} a day, so ${w.total} ÷ ${w.net} =
        <b>${clean(together)} days</b>.`,
    };
  },
};

/* ---------------- Unit 4 · Mensuration ---------------- */

export const areaScaling = {
  id: 'men-scale', chapter: 'quants:4',
  concept: 'area-scaling', conceptLabel: 'Lengths × k means area × k²',
  make(R, tier = 2) {
    const k = R.int(2, byTier(tier, 2, 4, 7));
    const w = R.int(byTier(tier, 2, 4, 9), byTier(tier, 8, 15, 30));
    const h = R.int(byTier(tier, 2, 4, 9), byTier(tier, 8, 15, 30));
    const before = rectArea(w, h), after = rectArea(w * k, h * k);
    const o = options(`${after} cm²`, [
      { v: `${before * k} cm²`, why: `You scaled the area by <b>k</b>. Lengths go as k, but AREAS
        go as k² — both sides grew, so the area grows ${k} × ${k} = ${k * k} times.` },
      { v: `${before} cm²`, why: `That is the area BEFORE the enlargement (${w} × ${h}).` },
      { v: `${before * k ** 3} cm²`, why: `k³ is the VOLUME factor. A flat rectangle has two
        dimensions, so it scales by k² = ${k * k}, not k³ = ${k ** 3}.` },
    ], i => ({ v: `${after + 10 * (i + 1)} cm²`,
               why: `New area = ${w * k} × ${h * k} = ${after} cm², which is ${before} × k² =
                     ${before} × ${k * k}.` }));
    return {
      q: 'What is the area of the enlarged rectangle?',
      context: `A rectangle measuring <b>${w} cm × ${h} cm</b> has every length multiplied by
                <b>${k}</b>.`,
      ...o,
      whyRight: `Area goes as the SQUARE of the scale: ${before} × ${k}² = ${before} × ${k ** 2} =
        <b>${after} cm²</b>. Check it directly: ${w * k} × ${h * k} = ${after}.`,
      whyWrong: `Multiplying the area by ${k} gives ${before * k} cm², which is the trap — that is
        what happens if you scale only one side.<br><br>
        Both sides grow, so area grows by k² = ${k ** 2}: ${before} × ${k ** 2} =
        <b>${after} cm²</b>.`,
      figure: scaleFig(
        { w, h, area: before },
        { w: w * k, h: h * k, area: after },
        { unitA: ' cm²', unitB: ' cm²', note: `sides × ${k}  →  area × ${k}² = ${k * k}` }),
      figureCap: `Both sides grew ${k}×, so the area grew ${k}² = ${k * k}× — that is the whole law.`,
      hardness: k * 10 + w + h,
    };
  },
};

export const circleGen = {
  id: 'men-circle', chapter: 'quants:4',
  concept: 'circle-area', conceptLabel: 'Area from the radius, using 22/7',
  make(R, tier = 2) {
    /* Multiples of 7 so 22/7 cancels and the answer stays whole. */
    const r = R.pick(byTier(tier, [7, 14, 21, 28, 35, 42], [7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84],
      [35, 42, 49, 56, 63, 70, 77, 84, 91, 98, 105, 112, 119, 126]));
    /* One radius, five things the paper asks about it. Asking only for the area
       left this generator with twelve questions in total — a learner drilling
       Mensuration met every one of them inside two sessions. */
    /* Gentle asked only for area or circumference — eight questions between
       them. The semicircle belongs here too: it is one extra addition, not a
       harder idea, and it is the form the paper reuses most. */
    const form = R.pick(byTier(tier, ['area', 'circ', 'semi'],
      ['area', 'circ', 'fromArea', 'fromCirc', 'semi'],
      ['fromArea', 'fromCirc', 'semi', 'circ']));
    if (form !== 'area') return circleOther(R, r, form);
    const area = circleArea(r);
    const o = options(`${clean(area)} cm²`, [
      { v: `${clean(r2(2 * PI22 * r))} cm²`, why: `That is the <b>circumference</b> (2πr) — a
        length, which would be measured in cm, not cm². Area is πr².` },
      { v: `${clean(r2(PI22 * r))} cm²`, why: `That is πr — you multiplied by the radius once
        instead of squaring it. πr² = (22/7) × ${r} × ${r}.` },
      { v: `${clean(r2(area * 2))} cm²`, why: `Twice the area. Check whether you used the diameter
        somewhere the formula wants the radius.` },
    ], i => ({ v: `${clean(r2(area + 44 * (i + 1)))} cm²`,
               why: `πr² = (22/7) × ${r * r} = ${clean(area)} cm². The radius is a multiple of 7 so
                     the 7 cancels and the answer is whole.` }));
    return {
      q: 'What is its area?',
      context: `A circle has radius <b>${r} cm</b>. Take π = 22/7.`,
      ...o,
      whyRight: `πr² = (22/7) × ${r}² = (22/7) × ${r * r} = <b>${clean(area)} cm²</b>.
        Radii that are multiples of 7 are chosen so the 7 cancels.`,
      whyWrong: `${clean(r2(2 * PI22 * r))} cm² is the <b>circumference</b> (2πr), not the area —
        and it is measured in cm, not cm².<br><br>
        Area = πr² = (22/7) × ${r * r} = <b>${clean(area)} cm²</b>.`,
      figure: svg(240, 170, `
        <circle cx="90" cy="85" r="66" fill="var(--accent, var(--brand))" fill-opacity="0.16"
                stroke="var(--accent, var(--brand))" stroke-width="2.4"/>
        <line x1="90" y1="85" x2="156" y2="85" stroke="var(--gold)" stroke-width="2.6"/>
        <circle cx="90" cy="85" r="3.5" fill="var(--gold)"/>
        <text x="122" y="78" text-anchor="middle" fill="var(--gold)" font-size="12" font-weight="800">r = ${r}</text>
        <text x="186" y="72" fill="var(--ink-3)" font-size="11" font-weight="700">πr²</text>
        <text x="186" y="92" fill="var(--ink)" font-size="14" font-weight="800">${clean(area)}</text>
        <text x="186" y="108" fill="var(--ink-3)" font-size="11" font-weight="700">cm²</text>`),
      figureCap: `The radius is the only measurement a circle needs — double it and the area quadruples.`,
      hardness: r,
    };
  },
};

/* ---------------- Unit 5 · Averages & Statistics ---------------- */

export const weightedGen = {
  id: 'avg-weighted', chapter: 'quants:5',
  concept: 'wavg-totals', conceptLabel: 'A weighted average is total over total',
  make(R, tier = 2) {
    /* Gentle keeps the groups small AND sharply different in size, so which way
       the average leans is visible before any arithmetic. */
    const n1 = R.int(byTier(tier, 8, 10, 30), byTier(tier, 14, 40, 90));
    const n2 = R.int(byTier(tier, 24, 10, 30), byTier(tier, 32, 40, 90));
    const m1 = R.int(byTier(tier, 40, 40, 37), byTier(tier, 60, 70, 71));
    const m2 = R.int(byTier(tier, 70, 50, 53), byTier(tier, 90, 90, 94));
    const avg = r2(weighted([n1, n2], [m1, m2]));
    const naive = r2(mean([m1, m2]));
    const o = options(clean(avg), [
      { v: clean(naive), why: `That is the plain average of ${m1} and ${m2}, which ignores the group
        SIZES. The bigger group pulls the combined average towards its own — here ${n1 > n2 ?
        `${n1} students at ${m1}` : `${n2} students at ${m2}`} outweighs the other.` },
      { v: clean(r2(avg + 1)), why: `One mark out. Total marks ÷ total students =
        (${n1}×${m1} + ${n2}×${m2}) ÷ ${n1 + n2} = ${n1 * m1 + n2 * m2} ÷ ${n1 + n2} = ${clean(avg)}.` },
      { v: clean(r2(avg - 1)), why: `One mark out the other way. Pool the raw marks:
        ${n1 * m1 + n2 * m2} across ${n1 + n2} students = ${clean(avg)}.` },
    ], i => ({ v: clean(r2(avg + 2 + i)),
               why: `The combined average must lie strictly between ${Math.min(m1, m2)} and
                     ${Math.max(m1, m2)}, nearer the larger group's mark.` }));
    return {
      q: 'What is the average mark of all the students together?',
      context: `A class of <b>${n1}</b> students averages <b>${m1}</b> marks; another of
                <b>${n2}</b> averages <b>${m2}</b>.`,
      ...o,
      whyRight: `Pool the totals: (${n1}×${m1} + ${n2}×${m2}) ÷ (${n1} + ${n2}) =
        ${n1 * m1 + n2 * m2} ÷ ${n1 + n2} = <b>${clean(avg)}</b>.`,
      whyWrong: `${clean(naive)} is the average of the two averages, which is only right when the
        groups are the same size — and here they are not.<br><br>
        Weighted average = total marks ÷ total students = ${n1 * m1 + n2 * m2} ÷ ${n1 + n2} =
        <b>${clean(avg)}</b>. It leans towards the bigger group.`,
      /* Unit 5's own thread: a mean is a BALANCE POINT. The pivot sits nearer
         the heavier group, which is exactly why the plain average is wrong. */
      figure: beamFig({ at: m1, weight: `${n1} students` }, { at: m2, weight: `${n2} students` },
        clean(avg), { w: 430 }),
      figureCap: `The pivot leans towards the bigger group — ${n1 > n2 ? m1 : m2}'s side.
        The plain average ${clean(naive)} ignores the weights entirely.`,
      /* Group SIZE is the load here. A wide gap between the two averages makes
         the lean more obvious, not less, so it must not count as difficulty. */
      hardness: n1 + n2,
    };
  },
};

export const alligationGen = {
  id: 'avg-allig', chapter: 'quants:5',
  concept: 'allig-inverse', conceptLabel: 'Alligation is the balance read backwards',
  make(R, tier = 2) {
    const cheap = R.int(byTier(tier, 10, 20, 23), byTier(tier, 30, 40, 67));
    const dear = cheap + R.int(byTier(tier, 10, 10, 13), byTier(tier, 20, 40, 59));
    const want = R.int(cheap + 2, dear - 2);
    const a = alligation(cheap, dear, want);
    const [cp, dp] = a.ratio;
    const correct = `${cp} : ${dp}`;
    const o = options(correct, [
      { v: `${dp} : ${cp}`, why: `The ratio is INVERTED. Alligation gives cheap : dear as the
        distance from the DEAR price to the mean, over the distance from the mean to the CHEAP
        price — each quantity pairs with the FAR gap, not its own.` },
      { v: `1 : 1`, why: `Equal parts would put the mixture exactly halfway, at
        ₹${clean((cheap + dear) / 2)}/kg. The target is ₹${want}, which is not the midpoint —
        so the two quantities cannot be equal.` },
      { v: `${cp + 1} : ${dp}`, why: `The gaps are ${dear} − ${want} = ${cp} and
        ${want} − ${cheap} = ${dp}, so the ratio is ${cp} : ${dp}.` },
    ], i => ({ v: `${cp + i + 2} : ${dp}`,
               why: `Cheap : dear = (dear − mean) : (mean − cheap) = (${dear} − ${want}) :
                     (${want} − ${cheap}) = ${cp} : ${dp}.` }));
    return {
      q: 'In what ratio must they be mixed?',
      context: `Rice at <b>₹${cheap}/kg</b> is mixed with rice at <b>₹${dear}/kg</b> to sell at
                <b>₹${want}/kg</b>.`,
      ...o,
      whyRight: `The distances from the target, <em>swapped</em>:
        dear − want = ${a.cheapParts}, want − cheap = ${a.dearParts}, so cheap : dear =
        ${a.cheapParts} : ${a.dearParts} = <b>${correct}</b> in lowest terms.`,
      whyWrong: `The ratio is the distances <b>crossed over</b> — the ingredient FURTHER from the
        target is used LESS.<br><br>
        dear − want = ${a.cheapParts}; want − cheap = ${a.dearParts}.<br>
        cheap : dear = ${a.cheapParts} : ${a.dearParts} = <b>${correct}</b>.<br><br>
        Check it: mix in that ratio and the price comes back to ₹${want}.`,
      /* Alligation IS the balance read backwards: the distances either side of
         the target are the ratio, swapped. Same picture as the weighted mean. */
      figure: beamFig({ at: cheap, weight: `${cp} part${cp > 1 ? 's' : ''}` },
        { at: dear, weight: `${dp} part${dp > 1 ? 's' : ''}` }, want, { w: 430 }) +
        barsFig([
          { label: `${want} − ${cheap}`, value: want - cheap, text: String(want - cheap), on: true },
          { label: `${dear} − ${want}`, value: dear - want, text: String(dear - want), on: true },
        ], { w: 360 }),
      figureCap: `The two gaps are ${want - cheap} and ${dear - want} — and the ratio is those
        <b>swapped</b>: ${cp} : ${dp}. The far side needs less of it.`,
      hardness: (dear - cheap) + cp + dp,
    };
  },
};

/* ---------------- Unit 6 · Counting & Chance ---------------- */

export const permCombGen = {
  id: 'cnt-permcomb', chapter: 'quants:6',
  concept: 'comb-divide-order', conceptLabel: 'Order matters, or it does not',
  make(R, tier = 2) {
    const n = R.int(byTier(tier, 4, 5, 8), byTier(tier, 7, 10, 14));
    const k = R.int(2, Math.min(byTier(tier, 3, 4, 5), n - 1));
    /* The noun is varied as well as the numbers. A generator whose every
       question opens "There are n books on a shelf" reads as one question with
       the numbers filed off — which at Gentle, with k pinned to 2, it was. */
    const scene = R.pick([
      { things: 'different books', where: 'on a shelf', row: 'arranged in a row' },
      { things: 'students', where: 'in a class', row: 'seated in a row' },
      { things: 'different flags', where: 'available', row: 'flown one above another' },
      { things: 'candidates', where: 'shortlisted', row: 'ranked in order' },
      { things: 'different paintings', where: 'in a gallery', row: 'hung in a row' },
    ]);
    const wantOrder = R() < 0.5;
    const v = wantOrder ? nPr(n, k) : nCr(n, k);
    const other = wantOrder ? nCr(n, k) : nPr(n, k);
    const o = options(String(v), [
      { v: String(other), why: wantOrder
          ? `That is ${n}C${k} — the number of ways to CHOOSE ${k}, with order ignored. Here they
             are ${scene.row}, so the same ${k} in a different order is a different outcome.`
          : `That is ${n}P${k} — the number of ARRANGEMENTS. Merely choosing ${k} does not care
             about their order, so this over-counts each choice ${k}! = ${other / v} times.` },
      { v: String(n ** k), why: `${n}^${k} allows the same one to be picked more than once. Each
        is distinct and used once, so every slot has one fewer option than the last:
        ${Array.from({ length: k }, (_, j) => n - j).join(' × ')}.` },
      { v: String(v + 1), why: `One out — and one out is always arithmetic rather than method,
        because ${wantOrder ? `${n}P${k}` : `${n}C${k}`} is a product of whole numbers and lands
        exactly on ${v}. Recount the slots: ${Array.from({ length: k }, (_, j) => n - j).join(' × ')}
        ${wantOrder ? '' : ` ÷ ${k}!`}.` },
    ], i => ({ v: String(v + 5 * (i + 1)),
               why: `${n}P${k} = ${nPr(n, k)} and ${n}C${k} = ${nCr(n, k)}; the question asks for
                     ${wantOrder ? 'the arrangements' : 'the choices'}, so ${v}.` }));
    return {
      q: wantOrder
        ? `In how many ways can <b>${k}</b> of them be ${scene.row}?`
        : `In how many ways can <b>${k}</b> of them be chosen?`,
      context: `There are <b>${n}</b> ${scene.things} ${scene.where}.`,
      ...o,
      whyRight: wantOrder
        ? `Order matters, so it is a permutation: ${n}P${k} = <b>${v}</b>.`
        : `Order does NOT matter, so divide the arrangements by the ${k}! ways of ordering each
           choice: ${n}C${k} = ${n}P${k} ÷ ${k}! = <b>${v}</b>.`,
      whyWrong: `Ask one question first: <b>would swapping two of them make a different outcome?</b>
        ${wantOrder
          ? `${scene.row.charAt(0).toUpperCase() + scene.row.slice(1)} — yes, so count
             arrangements: ${n}P${k} = <b>${v}</b>.`
          : `Merely chosen — no, so ${other} arrangements over-count by ${k}! = ${other / v}:
             ${n}C${k} = <b>${v}</b>.`}`,
      /* The slots ARE the multiplication rule. For a combination the same row
         is drawn, then divided by k! — which is the one step people forget. */
      figure: slotsFig(Array.from({ length: k }, (_, i) => ({
        n: n - i, label: `slot ${i + 1}`,
      })), { total: `${nPr(n, k)}`, label: 'arrangements' }) +
        (wantOrder ? '' : barsFig([
          { label: 'arrangements', value: nPr(n, k), text: String(nPr(n, k)), on: false },
          { label: `÷ ${k}! = ${nPr(n, k) / nCr(n, k)}`, value: nCr(n, k), text: String(nCr(n, k)), on: true },
        ], { w: 400 })),
      figureCap: wantOrder
        ? `Each slot has one fewer to choose from than the last.`
        : `Every choice was counted ${k}! = ${nPr(n, k) / nCr(n, k)} times, once per ordering — so divide.`,
      hardness: n * k,
    };
  },
};

/* ---------------- Unit 7 · Data Interpretation ----------------
   The reason this chapter had no generator was that a DI question needs a
   chart to read from, and there was none to generate. But `di-lab` already
   totals a table for the lesson, so the table is the missing half — build
   the data, print it, and let the same helpers answer the question.

   Every figure the question asks for is recomputed from the source arrays,
   never carried alongside them, so the table and the answer under it cannot
   drift apart. That is the same guarantee the q-di-* suite enforces on the
   hand-written charts. */

const DI_SETS = [
  { unit: 'Units sold (in thousands)', rows: ['Jaipur', 'Kota', 'Ajmer', 'Bikaner'],
    cols: ['2021', '2022', '2023', '2024'] },
  { unit: 'Applications received (in hundreds)', rows: ['North', 'South', 'East', 'West'],
    cols: ['Q1', 'Q2', 'Q3', 'Q4'] },
  { unit: 'Wheat procured (in tonnes)', rows: ['Alwar', 'Bharatpur', 'Sikar', 'Nagaur'],
    cols: ['2021', '2022', '2023', '2024'] },
  { unit: 'Buses run (per day)', rows: ['Depot A', 'Depot B', 'Depot C', 'Depot D'],
    cols: ['Mon', 'Tue', 'Wed', 'Thu'] },
];

/** A table whose row totals are all different, so "which is largest" has one answer. */
function diTable(R, set) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const data = set.rows.map(() => set.cols.map(() => R.int(2, 9) * 5));
    const totals = data.map(sum);
    if (new Set(totals).size === totals.length) return { data, totals };
  }
  throw new Error('could not build a table with distinct row totals');
}

const diHTML = (set, data) => `
  <div class="qtable-wrap"><table class="qtable">
    <thead><tr><th>${set.unit}</th>${set.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${set.rows.map((r, i) =>
      `<tr><th>${r}</th>${data[i].map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;

export const diTableGen = {
  id: 'di-table', chapter: 'quants:7',
  concept: 'di-question-first', conceptLabel: 'Find the cells the question needs',
  make(R, tier = 2) {
    const set = R.pick(DI_SETS);
    const { data, totals } = diTable(R, set);
    const grand = sum(totals);
    /* Gentle asks you to read and add; stretch asks for share and growth,
       where the trap is which figure sits underneath the division. */
    const kind = R.pick(byTier(tier, ['rowTotal', 'largest'],
      ['rowTotal', 'largest', 'share', 'growth'], ['share', 'growth']));

    if (kind === 'rowTotal') {
      const i = R.int(0, set.rows.length - 1);
      const v = totals[i];
      const o = options(String(v), [
        { v: String(v + 5), why: `Five over — a cell misread or added twice. The row is
          ${data[i].join(' + ')} = ${v}.` },
        { v: String(v - 5), why: `Five short — a cell dropped. Add straight across the
          <b>${set.rows[i]}</b> row only: ${data[i].join(' + ')} = ${v}.` },
        { v: String(v + 10), why: `Ten over. Read along the row, not down a column — the columns
          here total ${data[0].map((_, c) => data.reduce((t, rw) => t + rw[c], 0)).join(', ')}.` },
      ], k => ({ v: String(v + 15 * (k + 1)),
                 why: `${data[i].join(' + ')} = ${v}. Nothing outside the <b>${set.rows[i]}</b>
                       row belongs in this total.` }));
      return {
        q: `What is the total for <b>${set.rows[i]}</b> across all ${set.cols.length} columns?`,
        context: diHTML(set, data), ...o,
        whyRight: `Add that row and nothing else: ${data[i].join(' + ')} = <b>${v}</b>.`,
      figure: tableFig([set.unit, ...set.cols],
        set.rows.map((rw, ri) => ({ label: rw, cells: data[ri] })), { hotRow: i, hotCol: -1 }),
      figureCap: `Only the lit row matters — ${data[i].join(' + ')} = ${v}.`,
      hardness: 10,
        whyWrong: `Read the question before the table. It names one row, so only
                   ${set.cols.length} cells matter.<br><br>
                   ${data[i].join(' + ')} = <b>${v}</b>.`,
      };
    }

    if (kind === 'largest') {
      const best = totals.indexOf(Math.max(...totals));
      const o = options(set.rows[best], set.rows.map((rw, i) => ({ rw, i })).filter(x => x.i !== best)
        .map(x => ({ v: x.rw, why: `<b>${x.rw}</b> totals ${totals[x.i]}, which is
          ${totals[best] - totals[x.i]} short of ${set.rows[best]} (${totals[best]}). The trap is
          judging by the biggest single cell rather than the row TOTAL — ${x.rw} holds the largest
          single figure in some tables and still loses on the sum.` })));
      return {
        q: `Which row has the <b>highest</b> total across all ${set.cols.length} columns?`,
        context: diHTML(set, data), ...o,
        whyRight: `Row totals: ${set.rows.map((r, i) => `${r} ${totals[i]}`).join(', ')}.
                   <b>${set.rows[best]}</b> leads with ${totals[best]}.`,
        whyWrong: `Total each row, then compare — do not judge by the biggest single cell,
                   which is the trap here.<br><br>
                   ${set.rows.map((r, i) => `${r}: ${totals[i]}`).join(' · ')}.<br><br>
                   The highest is <b>${set.rows[best]}</b>.`,
      figure: tableFig([set.unit, ...set.cols],
        set.rows.map((rw, ri) => ({ label: rw, cells: data[ri] })), { hotRow: best }) +
        barsFig(set.rows.map((rw, ri) => ({
          label: rw, value: totals[ri], text: String(totals[ri]), on: ri === best,
        })), { w: 420 }),
      figureCap: `Totalled and compared as lengths — the biggest single cell is not the biggest row.`,
      hardness: 14,
      };
    }

    if (kind === 'share') {
      const i = R.int(0, set.rows.length - 1);
      const share = r2(pct(totals[i], grand));
      const o = options(`${clean(share)}%`, [
        { v: `${clean(r2(pct(totals[i], grand - totals[i])))}%`,
          why: `You divided by everything EXCEPT ${set.rows[i]} (${grand - totals[i]}). A share is
            measured against the whole (${grand}), which includes the row itself.` },
        { v: `${clean(r2(share + 5))}%`, why: `Five points over. ${totals[i]} ÷ ${grand} =
          ${clean(share)}%.` },
        { v: `${clean(r2(share - 4))}%`, why: `Four points under. Total the row first
          (${data[i].join(' + ')} = ${totals[i]}), then divide by the grand total ${grand}.` },
      ], k => ({ v: `${clean(r2(share + 7 + k))}%`,
                 why: `${totals[i]} ÷ ${grand} × 100 = ${clean(share)}%.` }));
      return {
        q: `<b>${set.rows[i]}</b> accounts for what share of the grand total?`,
        context: diHTML(set, data), ...o,
        whyRight: `${set.rows[i]} totals ${totals[i]}; the grand total is ${grand}.
                   ${totals[i]} ÷ ${grand} = <b>${clean(share)}%</b>.`,
        whyWrong: `Share divides by the <b>whole</b>, not by the rest.<br><br>
                   ${set.rows[i]} = ${totals[i]}, grand total = ${grand}.<br>
                   ${totals[i]} ÷ ${grand} × 100 = <b>${clean(share)}%</b>.<br><br>
                   Dividing by ${grand - totals[i]} — everything else — is the usual slip.`,
      figure: barsFig([
        ...set.rows.map((rw, ri) => ({ label: rw, value: totals[ri], text: String(totals[ri]), on: ri === i })),
        { label: 'grand total', value: grand, text: String(grand), on: true },
      ], { w: 440 }),
      figureCap: `${totals[i]} against the whole ${grand}, not against the rest.`,
      hardness: 26,
      };
    }

    /* Growth between two adjacent columns for one row. A flat pair would ask
       for a 0% change, which is a fine fact and a terrible question — the
       distractors all collapse onto each other. Look for a pair that moved
       rather than giving up on the draw. */
    let i = R.int(0, set.rows.length - 1);
    let c = R.int(0, set.cols.length - 2);
    if (data[i][c] === data[i][c + 1]) {
      const moved = [];
      set.rows.forEach((_, ri) => data[ri].forEach((v, ci) => {
        if (ci < set.cols.length - 1 && v !== data[ri][ci + 1]) moved.push([ri, ci]);
      }));
      if (!moved.length) throw new Error('every pair in this table is flat');
      [i, c] = R.pick(moved);
    }
    const from = data[i][c], to = data[i][c + 1];
    const g = r2(growth(from, to));
    const o = options(`${clean(g)}%`, [
      { v: `${clean(r2(growth(to, from)))}%`, why: `That is the change measured the other way round
        — from ${set.cols[c + 1]} back to ${set.cols[c]}. Growth is always measured FORWARD from the
        earlier figure.` },
      { v: `${clean(r2((to - from) / to * 100))}%`, why: `You divided by the LATER figure (${to}).
        Percentage change divides by where you started, ${from} — that is the base.` },
      { v: `${clean(r2(g + 10))}%`, why: `Ten points over. (${to} − ${from}) ÷ ${from} × 100 =
        ${clean(g)}%.` },
    ], k => ({ v: `${clean(r2(g - 5 * (k + 1)))}%`,
               why: `(${to} − ${from}) ÷ ${from} = ${clean(g)}%, measured against ${set.cols[c]}.` }));
    return {
      q: `For <b>${set.rows[i]}</b>, what is the change from <b>${set.cols[c]}</b> to <b>${set.cols[c + 1]}</b>?`,
      context: diHTML(set, data), ...o,
      whyRight: `(${to} − ${from}) ÷ ${from} = <b>${clean(g)}%</b>. Growth always divides by the
                 <b>earlier</b> figure.`,
      whyWrong: `Growth divides by where you started, not where you ended.<br><br>
                 (${to} − ${from}) ÷ ${from} × 100 = <b>${clean(g)}%</b>.<br><br>
                 Dividing by ${to} instead gives ${clean(r2((to - from) / to * 100))}%, which is the
                 distractor this question is built around.`,
      figure: tableFig([set.unit, ...set.cols],
        set.rows.map((rw, ri) => ({ label: rw, cells: data[ri] })), { hotRow: i }) +
        barsFig([
          { label: set.cols[c], value: from, text: String(from), on: true },
          { label: set.cols[c + 1], value: to, text: String(to), on: true },
        ], { w: 380 }),
      figureCap: `The change is measured against the <b>${set.cols[c]}</b> bar — where you started.`,
      hardness: 30,
    };
  },
};


/* ============================================================
   Widening pass · the chapters a learner could exhaust.

   Measured over 5,000 draws each, six chapters could only ever produce a
   small fixed pool — Counting & Chance managed 36 distinct questions in
   total, Mensuration 444, Interest/Time/Work 394. That is not "endless
   practice", it is a list with extra steps, and worse: drill those pools
   twice and the Leitner boxes start recording RECOGNITION as mastery,
   which is the one thing a progress model must never do.

   Each generator below opens a genuinely wide space, and reuses a concept
   its own chapter already teaches (the harness rejects any that does not).
   Every distractor is annotated, because a generator computed it on
   purpose and therefore knows what mistake it represents.
   ============================================================ */

/* ---------------- Unit 6 · Counting & Chance ---------------- */

const CNT_SCENES = [
  { things: 'shirts', slots: ['shirt', 'trouser', 'tie'], who: 'Ravi' },
  { things: 'dishes', slots: ['starter', 'main', 'dessert'], who: 'a diner' },
  { things: 'routes', slots: ['bus', 'train', 'taxi'], who: 'a traveller' },
  { things: 'letters', slots: ['first letter', 'second letter', 'third letter'], who: 'a code' },
  { things: 'digits', slots: ['hundreds digit', 'tens digit', 'units digit'], who: 'a number' },
];

export const countMultiply = {
  id: 'cnt-slots', chapter: 'quants:6',
  concept: 'count-multiply', conceptLabel: 'Independent choices multiply',
  make(R, tier = 2) {
    const scene = R.pick(CNT_SCENES);
    const k = byTier(tier, 2, 3, R.int(3, 4));
    const counts = Array.from({ length: k }, () => R.int(byTier(tier, 2, 3, 4), byTier(tier, 5, 7, 9)));
    const total = counts.reduce((a, b) => a * b, 1);
    const summed = counts.reduce((a, b) => a + b, 0);
    const slots = scene.slots.slice(0, k);

    const o = options(String(total), [
      { v: String(summed), why: `You ADDED the choices. Adding answers "how many items are there
        altogether"; this asks how many complete selections can be built, and every choice in one
        slot can pair with every choice in the next — so they multiply.` },
      { v: String(total - counts[0]), why: `That is ${counts.slice(1).reduce((a, b) => a * b, 1)}
        × ${counts[0] - 1} — one option short in the first slot. Every option counts, including
        the first one you looked at.` },
      { v: String(counts[0] ** k), why: `You used ${counts[0]} for every slot. The slots hold
        different numbers of choices here: ${counts.join(', ')}.` },
    ], i => ({ v: String(total + (i + 1) * Math.max(2, counts[0])),
               why: `The count must be exactly ${counts.join(' × ')} = ${total}. Every slot
                     multiplies; none of them adds.` }));

    return {
      q: `In how many different ways can that be done?`,
      context: `${scene.who.charAt(0).toUpperCase() + scene.who.slice(1)} must pick one of each:
        ${slots.map((sl, i) => `<b>${counts[i]}</b> ${sl}s`).join(', ')}.`,
      ...o,
      whyRight: `Independent choices MULTIPLY: ${counts.join(' × ')} = <b>${total}</b>.
        Fix the first slot and the remaining slots still offer every combination they had —
        so each of the ${counts[0]} first choices carries a full copy of the rest.`,
      whyWrong: `Draw a slot for each decision, write how many choices fill it, and multiply.<br><br>
        ${counts.map((c, i) => `${slots[i]}: ${c}`).join(' · ')}<br><br>
        ${counts.join(' × ')} = <b>${total}</b>. Addition would answer a different question —
        how many items exist in total (${summed}), not how many selections.`,
      figure: slotsFig(counts.map((c, i) => ({ n: c, label: slots[i] })),
        { total: String(total), label: 'ways' }),
      figureCap: `Each slot multiplies the count so far — never adds to it.`,
      hardness: k * 10 + total / 10,
    };
  },
};

/* Every word here MUST repeat a letter — that is the whole question. JAIPUR was
   in this list on the first pass and blew up once in thirty draws, because the
   explanation reaches for `reps[0]` and there was no repeat to name. Filtering
   at the source beats guarding at the use site: a word with no repeat does not
   belong in a generator about dividing by repeats. */
const CNT_WORDS = ['LEVEL', 'BANANA', 'LETTER', 'SUCCESS', 'PATTERN', 'BALLOON', 'COFFEE',
                   'MISSISSIPPI', 'ALGEBRA', 'RAJASTHAN', 'BOOKKEEPER', 'ARRANGE',
                   'COMMITTEE', 'DECIDED', 'ASSESS', 'TOMATO', 'PEPPER', 'MADAM', 'STATISTICS',
                   'CALCUTTA', 'ENGINEER', 'PARALLEL', 'SEVENTEEN', 'AGGREGATE', 'DIFFERENT',
                   'ALLAHABAD', 'BHARATPUR', 'CHITTORGARH', 'JHUNJHUNU', 'MARWAR', 'BANSWARA',
                   'ACCOUNT', 'ADDRESS', 'BALANCE', 'CEILING', 'DILEMMA', 'EXAMINE', 'FEEDBACK',
                   'GARLAND', 'HARVEST', 'INITIAL', 'JOURNAL', 'KEEPING', 'LIBERAL', 'MINIMUM',
                   'NOTEBOOK', 'OPPOSITE', 'PROBLEM', 'QUESTION', 'REPEATED', 'SUPPOSE',
                   /* Short words carry the GENTLE tier on their own, and there were nine of
                      them — so a novice met the whole tier inside two sessions. */
                   'APPLE', 'ARENA', 'ERROR', 'HAPPY', 'MOTTO', 'ONION', 'RADAR', 'REFER',
                   'ROTOR', 'SEEDS', 'SPOON', 'START', 'STATE', 'TEETH', 'WHEEL', 'GEESE',
                   'KAYAK', 'PUPPY', 'SILLY', 'SUNNY', 'TOTAL', 'ADDED', 'BOTTLE', 'CANNON',
                   'DINNER', 'SUMMER', 'WINNER', 'YELLOW', 'MIRROR', 'TENNIS', 'SUNSET',
                   'SEASON', 'OFFICE', 'LITTLE', 'FLOPPY', 'HIDDEN', 'LESSON', 'MUSEUM']
  .filter(w => Object.values(wordArrangements(w).counts).some(c => c > 1));

export const wordPerms = {
  id: 'cnt-word', chapter: 'quants:6',
  concept: 'perm-repeats', conceptLabel: 'Divide by the factorial of each repeat',
  make(R, tier = 2) {
    /* Short words with one repeated letter are gentle; long words with two or
       three repeat groups are where the division actually bites. */
    /* Gentle asked for short words with exactly ONE repeat group, and only a
       couple of words in the list qualified — so a three-question set at that
       tier could not be filled without a repeat, which the re-teach suite
       caught. Length alone is a good enough proxy for gentle. */
    const pool = CNT_WORDS.filter(w => {
      const reps = Object.values(wordArrangements(w).counts).filter(c => c > 1).length;
      return byTier(tier, w.length <= 6, w.length <= 8, w.length >= 8 || reps >= 2);
    });
    const word = R.pick(pool.length ? pool : CNT_WORDS);
    const { total, counts, divisor } = wordArrangements(word);
    const naive = [...word].reduce((a, _, i) => a * (i + 1), 1);      // n! — the classic slip
    const reps = Object.entries(counts).filter(([, c]) => c > 1);

    const o = options(String(total), [
      { v: String(naive), why: `That is ${word.length}! — every letter treated as distinct. But
        swapping the two ${reps[0][0]}s gives the SAME word, so ${word.length}! counts each real
        arrangement ${divisor} times over.` },
      { v: String(total * 2), why: `You divided by one repeat group too few. The full divisor here
        is ${reps.map(([ch, c]) => `${c}! for the ${ch}s`).join(' × ')} = ${divisor}.` },
      { v: String(naive / (reps[0][1] + 1)), why: `You divided by ${reps[0][1] + 1} rather than
        ${reps[0][1]}! — the divisor is the FACTORIAL of the repeat count, not the count.` },
    ], i => ({ v: String(total + (i + 1) * 30),
               why: `${word.length}! ÷ ${divisor} = ${naive} ÷ ${divisor} = ${total} exactly —
                     the division always comes out whole.` }));

    return {
      q: `How many distinct arrangements of its letters are there?`,
      context: `Take the letters of the word <b>${word}</b>
        (${word.length} letters: ${reps.map(([ch, c]) => `${ch} appears ${c} times`).join(', ')}).`,
      ...o,
      whyRight: `${word.length}! ÷ (${reps.map(([ch, c]) => `${c}!`).join(' × ')}) =
        ${naive} ÷ ${divisor} = <b>${total}</b>.<br><br>
        Every arrangement was produced ${divisor} times by ${naive}! — once for each way of
        shuffling the identical letters among themselves — so divide it back out.`,
      whyWrong: `Two identical letters swapped give you the same word back, and ${word.length}!
        counted that as a new one.<br><br>
        Total = ${word.length}! ÷ ${reps.map(([ch, c]) => `${c}!`).join(' ÷ ')} =
        ${naive} ÷ ${divisor} = <b>${total}</b>.<br><br>
        The divisor is the factorial of each repeat COUNT, multiplied together.`,
      figure: barsFig([
        { label: `${word.length}! (all distinct)`, value: naive, text: String(naive), on: false },
        { label: `÷ ${divisor} for the repeats`, value: total, text: String(total), on: true },
      ], { w: 430 }),
      figureCap: `The shorter bar is the honest count — ${naive} counted each word ${divisor} times.`,
      hardness: word.length * 6 + reps.length * 8,
    };
  },
};

export const probDraw = {
  id: 'cnt-prob', chapter: 'quants:6',
  concept: 'prob-without-replacement', conceptLabel: 'Without replacement, the second fraction changes',
  make(R, tier = 2) {
    const a = R.int(byTier(tier, 3, 4, 5), byTier(tier, 5, 7, 9));      // wanted colour
    const b = R.int(byTier(tier, 2, 3, 4), byTier(tier, 4, 6, 8));
    const n = a + b;
    const colours = R.pick([['red', 'blue'], ['green', 'yellow'], ['white', 'black'], ['red', 'green']]);
    const both = frac(a * (a - 1), n * (n - 1));
    const withRepl = frac(a * a, n * n);

    const o = options(both.text, [
      { v: withRepl.text, why: `That is the answer WITH replacement — ${a}/${n} × ${a}/${n}.
        Here the first ball is not put back, so the second draw is from ${n - 1} balls with only
        ${a - 1} of the colour left.` },
      { v: frac(a, n).text, why: `That is the probability the FIRST ball is ${colours[0]}. The
        question asks for both, so multiply by the second draw's probability as well.` },
      { v: frac(a * (a - 1), n * n).text, why: `You reduced the numerator for the missing ball but
        not the denominator. If one ball has gone, the bag holds ${n - 1}, not ${n}.` },
    ], i => ({ v: frac(a * (a - 1) + i + 1, n * (n - 1)).text,
               why: `${a}/${n} × ${a - 1}/${n - 1} = ${both.text}. Both parts of the second
                     fraction drop by one.` }));

    return {
      q: `What is the probability that <b>both</b> are ${colours[0]}?`,
      context: `A bag holds <b>${a} ${colours[0]}</b> and <b>${b} ${colours[1]}</b> balls.
        Two are drawn one after the other, <b>without replacement</b>.`,
      ...o,
      whyRight: `First draw: ${a}/${n}. The bag now holds ${n - 1} balls with ${a - 1} ${colours[0]},
        so the second is ${a - 1}/${n - 1}.<br><br>
        ${a}/${n} × ${a - 1}/${n - 1} = ${a * (a - 1)}/${n * (n - 1)} = <b>${both.text}</b>.`,
      whyWrong: `"Without replacement" changes BOTH numbers in the second fraction — one fewer
        ${colours[0]} on top, one fewer ball underneath.<br><br>
        ${a}/${n} × ${a - 1}/${n - 1} = <b>${both.text}</b>.<br><br>
        With replacement it would have been ${a}/${n} × ${a}/${n} = ${withRepl.text}, which is why
        the phrase is worth reading twice.`,
      figure: barsFig([
        { label: 'first draw', value: a / n, text: `${a}/${n}`, on: true },
        { label: 'second draw', value: (a - 1) / (n - 1), text: `${a - 1}/${n - 1}`, on: true },
        { label: 'both', value: (a * (a - 1)) / (n * (n - 1)), text: both.text, on: true },
      ], { w: 430 }),
      figureCap: `The second bar is shorter than the first — the bag changed between draws.`,
      hardness: n * 2 + a,
    };
  },
};

/* ---------------- Unit 4 · Mensuration ---------------- */

export const triangleArea = {
  id: 'men-triangle', chapter: 'quants:4',
  concept: 'area-triangle', conceptLabel: 'Half base times perpendicular height',
  make(R, tier = 2) {
    /* Even bases keep the halving clean. The slant side exists to be ignored —
       that is the whole trap, so it is always present and never the height. */
    const b = 2 * R.int(byTier(tier, 2, 3, 5), byTier(tier, 8, 14, 24));
    const h = R.int(byTier(tier, 3, 4, 7), byTier(tier, 9, 16, 26));
    const slant = Math.round(Math.sqrt(h * h + (b / 2) * (b / 2)) + R.int(1, 3));
    const area = triArea(b, h);

    const o = options(`${clean(area)} cm²`, [
      { v: `${clean(b * h)} cm²`, why: `That is base × height — the RECTANGLE that contains the
        triangle. A triangle is exactly half of it, so halve once more.` },
      { v: `${clean(triArea(b, slant))} cm²`, why: `You used the slant side (${slant} cm) as the
        height. The height must be PERPENDICULAR to the base; the slant side is longer, so it
        always inflates the area.` },
      { v: `${clean(b + h + slant)} cm²`, why: `That is a perimeter, not an area — and its unit
        would be cm, not cm². Adding sides never gives a region.` },
    ], i => ({ v: `${clean(area + 6 * (i + 1))} cm²`,
               why: `½ × ${b} × ${h} = ${clean(area)} cm². Only the perpendicular height counts.` }));

    return {
      q: 'What is its area?',
      context: `A triangle has base <b>${b} cm</b> and perpendicular height <b>${h} cm</b>.
        Its slant side measures ${slant} cm.`,
      ...o,
      whyRight: `½ × base × height = ½ × ${b} × ${h} = <b>${clean(area)} cm²</b>.
        The ${slant} cm side is there to be ignored — only the perpendicular height counts.`,
      whyWrong: `Two things to get right, and the second is the trap.<br><br>
        <b>Half.</b> A triangle is half the rectangle on the same base and height.<br>
        <b>Perpendicular.</b> The height drops at a right angle to the base — it is ${h} cm here,
        not the ${slant} cm slant side.<br><br>
        ½ × ${b} × ${h} = <b>${clean(area)} cm²</b>.`,
      figure: svg(300, 190, `
        <polygon points="40,150 ${40 + Math.min(220, b * 6)},150 ${40 + Math.min(220, b * 6) * 0.38},${150 - Math.min(115, h * 6)}"
                 fill="var(--accent, var(--brand))" fill-opacity="0.16"
                 stroke="var(--accent, var(--brand))" stroke-width="2.2"/>
        <line x1="${40 + Math.min(220, b * 6) * 0.38}" y1="150" x2="${40 + Math.min(220, b * 6) * 0.38}" y2="${150 - Math.min(115, h * 6)}"
              stroke="var(--gold)" stroke-width="2.4" stroke-dasharray="5 4"/>
        <rect x="${40 + Math.min(220, b * 6) * 0.38}" y="142" width="8" height="8" fill="none" stroke="var(--gold)" stroke-width="1.6"/>
        <text x="${40 + Math.min(220, b * 6) * 0.38 + 8}" y="${150 - Math.min(115, h * 6) / 2}" fill="var(--gold)" font-size="12" font-weight="800">h = ${h}</text>
        <text x="${40 + Math.min(220, b * 6) / 2}" y="168" text-anchor="middle" fill="var(--ink-3)" font-size="12" font-weight="700">b = ${b}</text>
        <text x="150" y="24" text-anchor="middle" fill="var(--ink)" font-size="13" font-weight="800">½ × ${b} × ${h} = ${clean(area)} cm²</text>`),
      figureCap: `The dashed line is the only height that counts — it meets the base at a right angle.`,
      hardness: b + h,
    };
  },
};

export const ringArea = {
  id: 'men-ring', chapter: 'quants:4',
  concept: 'circle-ring', conceptLabel: 'A ring is outer area minus inner',
  make(R, tier = 2) {
    const inner = R.pick(byTier(tier, [7, 14, 21, 28, 35], [7, 14, 21, 28, 35, 42, 49, 56, 63],
      [28, 35, 42, 49, 56, 63, 70, 77, 84, 91]));
    const width = R.pick(byTier(tier, [7, 14, 21], [7, 14, 21, 28, 35], [7, 14, 21, 28, 35, 42]));
    const outer = inner + width;
    const ring = r2(circleArea(outer) - circleArea(inner));

    const o = options(`${clean(ring)} cm²`, [
      { v: `${clean(r2(circleArea(width)))} cm²`, why: `That is the area of a circle of radius
        ${width} — the ring's WIDTH treated as a radius. A ring is not a small circle; it is what
        is left when the inner disc is cut out of the outer one.` },
      { v: `${clean(r2(circleArea(outer)))} cm²`, why: `That is the whole outer disc. You still
        have to subtract the ${inner} cm hole in the middle (${clean(r2(circleArea(inner)))} cm²).` },
      { v: `${clean(r2(2 * PI22 * (outer + inner)))} cm²`, why: `That is built from circumferences
        (2πr), which measure length, not area. The unit alone gives it away — cm, not cm².` },
    ], i => ({ v: `${clean(r2(ring + 44 * (i + 1)))} cm²`,
               why: `π(${outer}² − ${inner}²) = (22/7) × ${outer * outer - inner * inner} =
                     ${clean(ring)} cm².` }));

    return {
      q: 'What is the area of the ring?',
      context: `A circular path <b>${width} cm</b> wide runs around the outside of a circle of
        radius <b>${inner} cm</b>. Take π = 22/7.`,
      ...o,
      whyRight: `Outer radius = ${inner} + ${width} = ${outer}.<br><br>
        π(${outer}² − ${inner}²) = (22/7)(${outer * outer} − ${inner * inner}) =
        (22/7) × ${outer * outer - inner * inner} = <b>${clean(ring)} cm²</b>.<br><br>
        Factorising as (R−r)(R+r) = ${width} × ${outer + inner} keeps the numbers small.`,
      whyWrong: `A ring is <b>outer minus inner</b>, and the width is not a radius.<br><br>
        Outer radius = ${inner} + ${width} = ${outer}, so the ring is
        π${outer}² − π${inner}² = ${clean(r2(circleArea(outer)))} − ${clean(r2(circleArea(inner)))}
        = <b>${clean(ring)} cm²</b>.`,
      figure: svg(260, 200, `
        <circle cx="120" cy="100" r="82" fill="var(--accent, var(--brand))" fill-opacity="0.20"
                stroke="var(--accent, var(--brand))" stroke-width="2.2"/>
        <circle cx="120" cy="100" r="${Math.max(22, 82 * inner / outer)}" fill="var(--surface)"
                stroke="var(--gold)" stroke-width="2.2"/>
        <line x1="120" y1="100" x2="${120 + Math.max(22, 82 * inner / outer)}" y2="100" stroke="var(--gold)" stroke-width="2"/>
        <line x1="${120 + Math.max(22, 82 * inner / outer)}" y1="100" x2="202" y2="100" stroke="var(--accent, var(--brand))" stroke-width="2"/>
        <text x="${120 + Math.max(22, 82 * inner / outer) / 2}" y="94" text-anchor="middle" fill="var(--gold)" font-size="11" font-weight="800">${inner}</text>
        <text x="${(120 + Math.max(22, 82 * inner / outer) + 202) / 2}" y="94" text-anchor="middle" fill="var(--ink)" font-size="11" font-weight="800">${width}</text>
        <text x="120" y="196" text-anchor="middle" fill="var(--ink-3)" font-size="11.5" font-weight="700">π(${outer}² − ${inner}²) = ${clean(ring)} cm²</text>`),
      figureCap: `The shaded band only — the white disc in the middle was subtracted out.`,
      hardness: outer + width,
    };
  },
};

/* ---------------- Unit 3 · Interest, Time & Work ---------------- */

export const siSolve = {
  id: 'int-si-solve', chapter: 'quants:3',
  concept: 'si-find-rate', conceptLabel: 'Finding the rate from an amount',
  make(R, tier = 2) {
    const p = R.pick(byTier(tier, [1000, 2000, 5000], [1200, 2400, 3000, 4000, 5000, 6000, 7500, 8000, 9000],
      [3200, 4500, 5600, 6400, 7200, 8400, 9600, 12000]));
    const rate = R.pick(byTier(tier, [5, 10], [4, 5, 6, 8, 10, 12, 15], [3.5, 6.25, 7.5, 9, 11, 14, 16]));
    const t = R.int(byTier(tier, 2, 2, 3), byTier(tier, 3, 5, 8));
    const si = r2(simple(p, rate, t));
    const amount = r2(p + si);
    const askRate = R() < 0.5;

    const o = askRate
      ? options(`${clean(rate)}%`, [
          { v: `${clean(r2(si * 100 / (amount * t)))}%`, why: `You divided by the AMOUNT
            (₹${clean(amount)}) instead of the principal. Interest is always a percentage of what
            was originally lent — ₹${p} — not of what came back.` },
          { v: `${clean(r2(si * 100 / p))}%`, why: `That is the total interest as a percentage of
            the principal across all ${t} years. The rate is <b>per annum</b>, so divide by ${t}.` },
          { v: `${clean(r2(rate * t))}%`, why: `That is rate × time — the total percentage growth,
            not the annual rate.` },
        ], i => ({ v: `${clean(r2(rate + i + 1))}%`,
                   why: `R = SI × 100 ÷ (P × T) = ${clean(si)} × 100 ÷ (${p} × ${t}) =
                         ${clean(rate)}%.` }))
      : options(`${t} years`, [
          { v: `${clean(r2(si * 100 / (p * rate) * 2))} years`, why: `Twice the answer — check
            whether you divided or multiplied by the rate.` },
          { v: `${t + 1} years`, why: `One year out. T = SI × 100 ÷ (P × R) =
            ${clean(si)} × 100 ÷ (${p} × ${clean(rate)}) = ${t}.` },
          { v: `${clean(rate)} years`, why: `That is the RATE, in the wrong slot. Read what each
            number in the formula stands for before substituting.` },
        ], i => ({ v: `${t + i + 2} years`,
                   why: `T = SI × 100 ÷ (P × R) = ${clean(si)} × 100 ÷ (${p} × ${clean(rate)}) =
                         ${t} years.` }));

    return {
      q: askRate ? 'What is the rate of interest per annum?' : 'For how long was it lent?',
      context: `₹<b>${p}</b> lent at simple interest ${askRate ? `for <b>${t} years</b>` :
        `at <b>${clean(rate)}% per annum</b>`} grows to ₹<b>${clean(amount)}</b>.`,
      ...o,
      whyRight: `Interest first: ${clean(amount)} − ${p} = <b>₹${clean(si)}</b>. That is the only
        number the formula wants — the amount includes the principal back again.<br><br>
        SI = PRT/100, so ${askRate
          ? `R = ${clean(si)} × 100 ÷ (${p} × ${t}) = <b>${clean(rate)}%</b>`
          : `T = ${clean(si)} × 100 ÷ (${p} × ${clean(rate)}) = <b>${t} years</b>`}.`,
      whyWrong: `The trap is using the AMOUNT where the formula wants the INTEREST.<br><br>
        Interest = amount − principal = ${clean(amount)} − ${p} = ₹${clean(si)}.<br>
        Then SI = PRT/100 rearranges to ${askRate ? 'R = SI×100/(P×T)' : 'T = SI×100/(P×R)'} =
        <b>${askRate ? `${clean(rate)}%` : `${t} years`}</b>.<br><br>
        Simple interest is a straight line: the same ₹${clean(r2(si / t))} is added every year.`,
      figure: barsFig([
        { label: 'principal', value: p, text: `₹${p}`, on: false },
        { label: `interest over ${t} yr`, value: si, text: `₹${clean(si)}`, on: true },
        { label: 'amount', value: amount, text: `₹${clean(amount)}`, on: false },
      ], { w: 450 }),
      figureCap: `Only the middle bar goes into the formula — the amount is principal plus interest.`,
      hardness: p / 400 + t * 3,
    };
  },
};

export const relativeGen = {
  id: 'int-relative', chapter: 'quants:3',
  concept: 'rel-opposite', conceptLabel: 'Opposite directions add',
  make(R, tier = 2) {
    /* Lengths and speeds chosen so the time comes out clean in seconds. */
    const u = R.pick(byTier(tier, [36, 54, 72], [36, 45, 54, 63, 72, 90], [63, 81, 99, 108, 117]));
    const v = R.pick(byTier(tier, [36, 54], [27, 36, 45, 54, 72, 90], [45, 63, 81, 90, 108]));
    const la = R.int(byTier(tier, 100, 100, 140), byTier(tier, 200, 250, 400));
    const lb = R.int(byTier(tier, 100, 100, 140), byTier(tier, 200, 250, 400));
    const opposite = R() < 0.5 || u === v;
    const relKmh = opposite ? u + v : Math.abs(u - v);
    if (relKmh === 0) return this.make(R, tier);
    const relMs = r2(toMS(relKmh));
    const time = r2((la + lb) / relMs);
    const wrongRel = opposite ? Math.abs(u - v) : u + v;

    const o = options(`${clean(time)} s`, [
      { v: `${clean(r2((la + lb) / toMS(wrongRel) || 0))} s`,
        why: opposite
          ? `You subtracted the speeds. They are moving towards each other, so the gap closes at
             the SUM of the two — ${u} + ${v} = ${u + v} km/h.`
          : `You added the speeds. They are moving the same way, so only the DIFFERENCE in speed
             closes the gap — ${Math.max(u, v)} − ${Math.min(u, v)} = ${Math.abs(u - v)} km/h.` },
      { v: `${clean(r2(la / relMs))} s`, why: `You used only the first train's length. To pass
        completely, the whole of BOTH trains must clear each other — ${la} + ${lb} = ${la + lb} m.` },
      { v: `${clean(r2((la + lb) / relKmh))} s`, why: `You divided metres by km/h. Convert first:
        ${relKmh} km/h × 5/18 = ${clean(relMs)} m/s.` },
    ], i => ({ v: `${clean(r2(time + i + 1))} s`,
               why: `${la + lb} m ÷ ${clean(relMs)} m/s = ${clean(time)} s.` }));

    return {
      q: `How long do they take to pass each other completely?`,
      context: `Two trains, <b>${la} m</b> and <b>${lb} m</b> long, run
        ${opposite ? '<b>towards each other</b>' : '<b>in the same direction</b>'} at
        <b>${u} km/h</b> and <b>${v} km/h</b>.`,
      ...o,
      whyRight: `${opposite ? 'Opposite directions ADD' : 'Same direction SUBTRACTS'}:
        relative speed = ${opposite ? `${u} + ${v}` : `${Math.max(u, v)} − ${Math.min(u, v)}`} =
        ${relKmh} km/h = ${relKmh} × 5/18 = <b>${clean(relMs)} m/s</b>.<br><br>
        Distance to clear = both lengths = ${la} + ${lb} = ${la + lb} m.<br>
        Time = ${la + lb} ÷ ${clean(relMs)} = <b>${clean(time)} s</b>.`,
      whyWrong: `Three steps, and each has its own trap.<br><br>
        <b>1 · Relative speed.</b> ${opposite ? 'Towards each other → add' : 'Same direction → subtract'}:
        ${relKmh} km/h.<br>
        <b>2 · Units.</b> Lengths are in metres, so convert: × 5/18 = ${clean(relMs)} m/s.<br>
        <b>3 · Distance.</b> Passing completely means BOTH lengths: ${la + lb} m.<br><br>
        ${la + lb} ÷ ${clean(relMs)} = <b>${clean(time)} s</b>.`,
      figure: barsFig([
        { label: `${u} km/h`, value: u, text: `${u}`, on: false },
        { label: `${v} km/h`, value: v, text: `${v}`, on: false },
        { label: opposite ? 'sum (closing)' : 'difference (closing)', value: relKmh,
          text: `${relKmh} km/h = ${clean(relMs)} m/s`, on: true },
      ], { w: 450 }),
      figureCap: `Only the highlighted bar closes the gap between them.`,
      hardness: (u + v) / 4 + (la + lb) / 40,
    };
  },
};

/**
 * The circle asked four other ways: circumference, radius back out of an area
 * or a circumference, and the perimeter of a semicircle — which is the one
 * everybody gets wrong, because the diameter has to be added back.
 */
function circleOther(R, r, form) {
  const area = circleArea(r), circ = circleCirc(r);
  if (form === 'circ') {
    const o = options(`${clean(r2(circ))} cm`, [
      { v: `${clean(r2(area))} cm`, why: `That is the AREA (πr²), which is measured in cm² —
        a region, not a distance round the edge.` },
      { v: `${clean(r2(PI22 * r))} cm`, why: `That is πr. The circumference is <b>2</b>πr — the
        factor of 2 is the one people drop.` },
      { v: `${clean(r2(circ * 2))} cm`, why: `Twice the circumference. Check whether you used the
        diameter where the formula already accounts for it: 2πr uses the RADIUS.` },
    ], i => ({ v: `${clean(r2(circ + 22 * (i + 1)))} cm`,
               why: `2πr = 2 × (22/7) × ${r} = ${clean(r2(circ))} cm.` }));
    return {
      q: 'What is its circumference?',
      context: `A circle has radius <b>${r} cm</b>. Take π = 22/7.`, ...o,
      whyRight: `2πr = 2 × (22/7) × ${r} = <b>${clean(r2(circ))} cm</b>. The radius is a multiple
        of 7, so the 7 cancels and the answer stays whole.`,
      whyWrong: `Circumference is <b>2πr</b> and area is <b>πr²</b> — the units tell them apart:
        cm for a distance, cm² for a region.<br><br>
        2 × (22/7) × ${r} = <b>${clean(r2(circ))} cm</b>.`,
      figure: barsFig([{ label: 'circumference 2πr', value: circ, text: `${clean(r2(circ))} cm`, on: true },
                       { label: 'area πr²', value: area, text: `${clean(r2(area))} cm²`, on: false }], { w: 420 }),
      figureCap: `Different quantities and different units — never interchangeable.`,
      hardness: r + 4,
    };
  }
  if (form === 'fromArea') {
    const o = options(`${r} cm`, [
      { v: `${clean(r2(area / PI22))} cm`, why: `That is r², not r — you divided by π and stopped.
        Take the square root: √${clean(r2(area / PI22))} = ${r}.` },
      { v: `${2 * r} cm`, why: `That is the DIAMETER. The question asks for the radius, which is
        half of it.` },
      { v: `${clean(r2(area / (2 * PI22)))} cm`, why: `You divided by 2π, which is the
        circumference formula rearranged. Area is πr², so divide by π and then take the root.` },
    ], i => ({ v: `${r + i + 1} cm`,
               why: `πr² = ${clean(r2(area))} → r² = ${r * r} → r = ${r} cm.` }));
    return {
      q: 'What is its radius?',
      context: `A circle has area <b>${clean(r2(area))} cm²</b>. Take π = 22/7.`, ...o,
      whyRight: `Work backwards: r² = area ÷ π = ${clean(r2(area))} ÷ (22/7) = ${r * r},
        so r = √${r * r} = <b>${r} cm</b>.`,
      whyWrong: `Two steps, and the second is the one that gets dropped.<br><br>
        <b>1.</b> r² = area ÷ π = ${clean(r2(area))} × 7/22 = ${r * r}.<br>
        <b>2.</b> r = √${r * r} = <b>${r} cm</b>.<br><br>
        Stopping after step 1 gives ${r * r}, which is an area-shaped number, not a length.`,
      figure: barsFig([{ label: 'area ÷ π = r²', value: r * r, text: String(r * r), on: false },
                       { label: '√ → r', value: r, text: `${r} cm`, on: true }], { w: 400 }),
      figureCap: `The square root is the step that turns an area back into a length.`,
      hardness: r + 8,
    };
  }
  if (form === 'fromCirc') {
    const o = options(`${r} cm`, [
      { v: `${2 * r} cm`, why: `That is the diameter — you divided by π but not by 2.
        Circumference = 2πr, so both factors have to come out.` },
      { v: `${clean(r2(circ / PI22))} cm`, why: `You divided by π only. 2πr means dividing by
        2π = ${clean(r2(2 * PI22))}, not by π alone.` },
      { v: `${clean(r2(Math.sqrt(circ / PI22)))} cm`, why: `A square root belongs to the AREA
        formula. Circumference is linear in r — no root involved.` },
    ], i => ({ v: `${r + i + 1} cm`,
               why: `2πr = ${clean(r2(circ))} → r = ${clean(r2(circ))} ÷ ${clean(r2(2 * PI22))} = ${r} cm.` }));
    return {
      q: 'What is its radius?',
      context: `A circle has circumference <b>${clean(r2(circ))} cm</b>. Take π = 22/7.`, ...o,
      whyRight: `r = circumference ÷ 2π = ${clean(r2(circ))} ÷ (2 × 22/7) =
        ${clean(r2(circ))} × 7/44 = <b>${r} cm</b>.`,
      whyWrong: `Divide by <b>2π</b>, not by π. Halving is the step that is easiest to forget,
        and it turns a radius into a diameter.<br><br>
        ${clean(r2(circ))} ÷ ${clean(r2(2 * PI22))} = <b>${r} cm</b> (the diameter would be ${2 * r}).`,
      figure: barsFig([{ label: 'circumference', value: circ, text: `${clean(r2(circ))} cm`, on: false },
                       { label: '÷ 2π → radius', value: r, text: `${r} cm`, on: true }], { w: 400 }),
      figureCap: `Two divisions, not one — by π and by 2.`,
      hardness: r + 10,
    };
  }
  /* semicircle perimeter — the diameter must be added back */
  const semi = r2(PI22 * r + 2 * r);
  const o = options(`${clean(semi)} cm`, [
    { v: `${clean(r2(PI22 * r))} cm`, why: `That is the curved edge only. A semicircle is a closed
      shape: its perimeter includes the straight <b>diameter</b> (${2 * r} cm) that closes it.` },
    { v: `${clean(r2(circ / 2))} cm`, why: `Half the full circumference is exactly the curved part
      — same omission. Add the diameter: ${clean(r2(PI22 * r))} + ${2 * r} = ${clean(semi)}.` },
    { v: `${clean(r2(circ + 2 * r))} cm`, why: `You used the WHOLE circumference and then added the
      diameter. Only half the curve belongs to a semicircle.` },
  ], i => ({ v: `${clean(r2(semi + 11 * (i + 1)))} cm`,
             why: `πr + 2r = ${clean(r2(PI22 * r))} + ${2 * r} = ${clean(semi)} cm.` }));
  return {
    q: 'What is the perimeter of the semicircle?',
    context: `A semicircle has radius <b>${r} cm</b>. Take π = 22/7.`, ...o,
    whyRight: `Curved edge = half the circumference = πr = ${clean(r2(PI22 * r))} cm.
      Straight edge = the diameter = ${2 * r} cm.<br><br>
      Perimeter = ${clean(r2(PI22 * r))} + ${2 * r} = <b>${clean(semi)} cm</b>.`,
    whyWrong: `Cutting a circle in half creates a NEW edge — the diameter — and the perimeter has
      to walk along it.<br><br>
      πr + 2r = ${clean(r2(PI22 * r))} + ${2 * r} = <b>${clean(semi)} cm</b>.<br><br>
      Half the circumference alone (${clean(r2(circ / 2))} cm) is an open curve, not a boundary.`,
    figure: barsFig([{ label: 'curved edge πr', value: PI22 * r, text: `${clean(r2(PI22 * r))} cm`, on: true },
                     { label: 'straight edge 2r', value: 2 * r, text: `${2 * r} cm`, on: true },
                     { label: 'perimeter', value: semi, text: `${clean(semi)} cm`, on: true }], { w: 430 }),
    figureCap: `Both edges, because a semicircle is closed by its own diameter.`,
    hardness: r + 14,
  };
}

/* ---------------- Unit 7 · Data Interpretation — the pie ---------------- */

const PIE_SETS = [
  { what: 'a family\'s monthly budget', parts: ['Rent', 'Food', 'Fuel', 'Education', 'Savings'], unit: '₹' },
  { what: 'a district\'s land use', parts: ['Cropped', 'Forest', 'Grazing', 'Built-up', 'Waste'], unit: 'hectares' },
  { what: 'a college\'s intake', parts: ['Science', 'Arts', 'Commerce', 'Vocational', 'Other'], unit: 'students' },
  { what: 'a depot\'s running costs', parts: ['Fuel', 'Wages', 'Repairs', 'Insurance', 'Tolls'], unit: '₹' },
];

export const pieGen = {
  id: 'di-pie', chapter: 'quants:7',
  concept: 'pie-degrees-percent', conceptLabel: 'Divide degrees by 3.6',
  make(R, tier = 2) {
    const set = R.pick(PIE_SETS);
    const n = byTier(tier, 3, 4, 5);
    const parts = set.parts.slice(0, n);

    /* Degrees are multiples of 18 so every share is a clean multiple of 5%, and
       they are forced to total 360 by construction rather than by hope — a pie
       whose slices do not close is the one thing a DI question cannot survive. */
    const units = 360 / 18;                                    // 20 units of 18°
    const cut = [];
    let left = units - n;                                      // every slice gets at least one
    for (let i = 0; i < n - 1; i++) {
      const take = R.int(0, Math.max(0, Math.floor(left / (n - i))) + 1);
      cut.push(1 + Math.min(take, left));
      left -= Math.min(take, left);
    }
    cut.push(1 + left);
    const degs = R.shuffle(cut).map(u => u * 18);
    if (degs.reduce((a, b) => a + b, 0) !== 360) return this.make(R, tier);
    if (new Set(degs).size < degs.length) return this.make(R, tier);   // "which is largest" must be unique

    const total = R.pick(byTier(tier, [3600, 7200, 18000], [7200, 14400, 21600, 36000, 43200],
      [28800, 39600, 46800, 54000, 61200]));
    const i = R.int(0, n - 1);
    const deg = degs[i];
    const share = deg / 3.6;                                   // degrees → per cent
    const amount = total * deg / 360;
    const form = R.pick(byTier(tier, ['pct'], ['pct', 'amount'], ['amount', 'ratio', 'pct']));

    const slices = parts.map((label, k) => ({ label, deg: degs[k] }));
    /* The chart goes in the QUESTION. It shipped in `figure` only — which is
       the explanation, shown after the answer — so the question said "the pie
       chart shows…" and then showed no pie. Unanswerable, and invisible to
       every check the harness had, because a well-formed question with four
       distinct options is exactly what it was. */
    const fig = pieFig(slices, { hot: i, caption: `The slices total 360°, always.` });

    if (form === 'ratio') {
      let j = R.int(0, n - 1); if (j === i) j = (i + 1) % n;
      const g = (a, b) => (b ? g(b, a % b) : a);
      const d = g(degs[i], degs[j]) || 1;
      const o = options(`${degs[i] / d} : ${degs[j] / d}`, [
        { v: `${degs[j] / d} : ${degs[i] / d}`, why: `Inverted — that is ${parts[j]} to ${parts[i]}.
          The question names ${parts[i]} first.` },
        { v: `${degs[i]} : 360`, why: `That is ${parts[i]} against the WHOLE pie, which is its
          share, not its ratio to ${parts[j]}.` },
        { v: `${clean(r2(degs[i] / 3.6))} : ${clean(r2(degs[j] / 3.6))}`,
          why: `You converted both to percentages first. A ratio needs no conversion at all —
            degrees are already proportional to the amounts, so ${degs[i]} : ${degs[j]} cancels
            straight to the answer.` },
      ], k => ({ v: `${degs[i] / d + k + 1} : ${degs[j] / d}`,
                 why: `${degs[i]} : ${degs[j]} cancels by ${d} to ${degs[i] / d} : ${degs[j] / d}.` }));
      return {
        q: `What is the ratio of <b>${parts[i]}</b> to <b>${parts[j]}</b>?`,
        context: `${fig}<p class="qsrc">The pie chart shows ${set.what}, in degrees.</p>`, ...o,
        whyRight: `Degrees are already in proportion to the amounts, so no conversion is needed:
          ${degs[i]} : ${degs[j]}, which cancels by ${d} to <b>${degs[i] / d} : ${degs[j] / d}</b>.`,
        whyWrong: `The commonest wasted step in a pie question is converting to percentages before
          taking a ratio. Degrees, percentages and amounts are all proportional to one another, so
          a ratio can be read straight off the degrees.<br><br>
          ${degs[i]} : ${degs[j]} = <b>${degs[i] / d} : ${degs[j] / d}</b>.`,
        figure: fig, figureCap: `A ratio between two slices never needs the total at all.`,
        hardness: 14 + n * 3,
      };
    }

    if (form === 'amount') {
      const o = options(`${set.unit === '₹' ? '₹' : ''}${clean(amount)}${set.unit === '₹' ? '' : ' ' + set.unit}`, [
        { v: `${set.unit === '₹' ? '₹' : ''}${clean(deg)}${set.unit === '₹' ? '' : ' ' + set.unit}`,
          why: `That is the number of DEGREES (${deg}°), not an amount. Degrees have to be scaled
            by the total: ${total} × ${deg}/360.` },
        { v: `${set.unit === '₹' ? '₹' : ''}${clean(r2(total * share / 100 / 10))}${set.unit === '₹' ? '' : ' ' + set.unit}`,
          why: `A factor of ten out — check where the decimal went when you divided by 3.6.` },
        { v: `${set.unit === '₹' ? '₹' : ''}${clean(r2(total - amount))}${set.unit === '₹' ? '' : ' ' + set.unit}`,
          why: `That is everything EXCEPT ${parts[i]} (${360 - deg}° of the pie).` },
      ], k => ({ v: `${set.unit === '₹' ? '₹' : ''}${clean(r2(amount + total * 0.05 * (k + 1)))}${set.unit === '₹' ? '' : ' ' + set.unit}`,
                 why: `${total} × ${deg}/360 = ${clean(amount)}.` }));
      return {
        q: `How much of it is <b>${parts[i]}</b>?`,
        context: `${fig}<p class="qsrc">The pie chart shows ${set.what}, in degrees. The total is
          <b>${set.unit === '₹' ? '₹' : ''}${total.toLocaleString('en-IN')}${set.unit === '₹' ? '' : ' ' + set.unit}</b>.</p>`,
        ...o,
        whyRight: `Amount = total × degrees ÷ 360 = ${total} × ${deg}/360 =
          <b>${clean(amount)}</b>. (Equivalently ${clean(share)}% of ${total}.)`,
        whyWrong: `A degree is not a quantity — it is a fraction of the circle, and it only becomes
          a quantity once multiplied by the total.<br><br>
          ${total} × ${deg}/360 = <b>${clean(amount)}</b>.`,
        figure: fig,
        figureCap: `${deg}° out of 360° is ${clean(share)}% of ${total.toLocaleString('en-IN')}.`,
        hardness: 20 + n * 3 + total / 6000,
      };
    }

    const o = options(`${clean(share)}%`, [
      { v: `${clean(deg)}%`, why: `That is the degrees read as a percentage. A circle is 360°, not
        100 — divide by 3.6 to convert: ${deg} ÷ 3.6 = ${clean(share)}%.` },
      { v: `${clean(r2(deg / 3))}%`, why: `You divided by 3 rather than 3.6. The factor is
        360/100 = <b>3.6</b>, and getting it slightly wrong is worse than getting it very wrong —
        the answer still looks plausible.` },
      { v: `${clean(r2(100 - share))}%`, why: `That is the share of everything EXCEPT ${parts[i]}
        (${360 - deg}° of the pie).` },
    ], k => ({ v: `${clean(r2(share + 5 * (k + 1)))}%`,
               why: `${deg} ÷ 3.6 = ${clean(share)}%, and every slice here is a whole multiple of 5%.` }));
    return {
      q: `What percentage of the total is <b>${parts[i]}</b>?`,
      context: `${fig}<p class="qsrc">The pie chart shows ${set.what}, in degrees.</p>`, ...o,
      whyRight: `360° is the whole, so one per cent is 3.6°. ${deg} ÷ 3.6 = <b>${clean(share)}%</b>.`,
      whyWrong: `The one number to hold: <b>3.6° is one per cent</b>, because 360 ÷ 100 = 3.6.<br><br>
        ${deg} ÷ 3.6 = <b>${clean(share)}%</b>. Sanity-check it against the picture — a slice near a
        quarter of the circle should come out near 25%.`,
      figure: fig, figureCap: `3.6° is one per cent — the only conversion a pie ever needs.`,
      hardness: 12 + n * 3,
    };
  },
};

/* ---------------- Unit 7 · Data Interpretation — the bar/line chart ---------------- */

/* The chapter had tables and a pie and nothing that is drawn on an AXIS, which
   is most of what a DI section actually shows. The four concepts it teaches
   about charts were all unreachable by a generator:
     · comparisons need no arithmetic  · the largest gap is one subtraction
     · doubling is a 100% rise         · read the axis and the unit first
   The last of those is the one a table cannot teach at all — the unit is
   printed once, at the top, and applies to every bar. */

const CHART_SETS = [
  { unit: 'Units sold (in thousands)', mult: 1000, thing: 'units',
    cols: ['Jaipur', 'Kota', 'Ajmer', 'Alwar', 'Sikar'], series: ['2023', '2024'] },
  { unit: 'Rainfall (in mm)', mult: 1, thing: 'mm',
    cols: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'], series: ['Last year', 'This year'] },
  { unit: 'Applications received (in hundreds)', mult: 100, thing: 'applications',
    cols: ['Q1', 'Q2', 'Q3', 'Q4'], series: ['Rural', 'Urban'] },
  { unit: 'Electricity used (in lakh units)', mult: 100000, thing: 'units',
    cols: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], series: ['Zone A', 'Zone B'] },
  { unit: 'Passengers carried (in thousands)', mult: 1000, thing: 'passengers',
    cols: ['Depot A', 'Depot B', 'Depot C', 'Depot D'], series: ['Morning', 'Evening'] },
];

export const chartGen = {
  id: 'di-chart', chapter: 'quants:7',
  concept: 'di-compare-by-eye', conceptLabel: 'Comparisons need no arithmetic',
  make(R, tier = 2, want = null) {
    const set = R.pick(CHART_SETS);
    const n = Math.min(set.cols.length, byTier(tier, 4, 5, 5));
    const cols = set.cols.slice(0, n);

    /* Multiples of 5 so every gap and every doubling is a whole number, and
       every value distinct within a row so "the largest" is never a tie. */
    const draw = () => {
      for (let attempt = 0; attempt < 60; attempt++) {
        const a = cols.map(() => R.int(4, 18) * 5);
        const b = cols.map(() => R.int(4, 18) * 5);
        const gaps = a.map((v, i) => Math.abs(v - b[i]));
        if (new Set(a).size !== a.length || new Set(b).size !== b.length) continue;
        if (new Set(gaps).size !== gaps.length) continue;      // "biggest gap" must be unique
        const totals = a.map((v, i) => v + b[i]);
        if (new Set(totals).size !== totals.length) continue;  // and "biggest overall" too
        return { a, b, gaps, totals };
      }
      return null;
    };
    const d = draw();
    if (!d) return this.make(R, tier, want);
    const { a, b, gaps, totals } = d;

    const series = [{ label: set.series[0], values: a }, { label: set.series[1], values: b }];
    const asLine = R() < 0.4;
    const chart = (o = {}) => chartFig(series, cols, { unit: set.unit, line: asLine, ...o });

    /* Four question forms, each recording against the concept it trains. A
       caller asking for one (a re-teach) gets that one at any tier. */
    const FORMS = [
      { id: 'largest', concept: 'di-compare-by-eye', conceptLabel: 'Comparisons need no arithmetic' },
      { id: 'gap', concept: 'di-gap', conceptLabel: 'The largest gap is one subtraction' },
      { id: 'double', concept: 'di-growth-doubling', conceptLabel: 'Doubling is a 100% rise' },
      { id: 'axis', concept: 'di-axis', conceptLabel: 'Read the axis and the unit first' },
    ];
    const wanted = want ? FORMS.filter(f => f.concept === want) : [];
    const pool = wanted.length ? wanted
      : byTier(tier, FORMS.filter(f => ['largest', 'axis'].includes(f.id)),
               FORMS, FORMS.filter(f => ['gap', 'double', 'axis'].includes(f.id)));
    const form = R.pick(pool);
    const common = { concept: form.concept, conceptLabel: form.conceptLabel, hardness: 0 };

    /* ---- which is biggest, added across both series ---- */
    if (form.id === 'largest') {
      const best = totals.indexOf(Math.max(...totals));
      const bigSingle = a.indexOf(Math.max(...a));
      const o = options(cols[best], cols.map((c, i) => ({ c, i })).filter(x => x.i !== best)
        .map(x => ({ v: x.c, why: x.i === bigSingle
            ? `<b>${x.c}</b> has the single tallest ${set.series[0]} bar (${a[x.i]}), which is
               exactly the trap: the question asks for the TOTAL of both, and ${cols[best]} wins
               that on ${totals[best]} against ${totals[x.i]}.`
            : `<b>${x.c}</b> totals ${a[x.i]} + ${b[x.i]} = ${totals[x.i]}, which is
               ${totals[best] - totals[x.i]} behind ${cols[best]} (${totals[best]}).` })));
      return {
        ...common,
        q: `Which has the highest <b>combined</b> figure across both ${set.series[0]} and ${set.series[1]}?`,
        context: chart(),
        ...o,
        whyRight: `Add the pair for each: ${cols.map((c, i) => `${c} ${totals[i]}`).join(', ')}.
          <b>${cols[best]}</b> leads with ${totals[best]}.`,
        whyWrong: `You do not need the numbers for a comparison this size — stack the two bars in
          your eye and look for the tallest pair. What you must not do is judge by the tallest
          SINGLE bar, which here belongs to ${cols[bigSingle]}.<br><br>
          Totals: ${cols.map((c, i) => `${c} ${totals[i]}`).join(', ')} → <b>${cols[best]}</b>.`,
        figure: chart({ hotCol: best }),
        figureCap: `Both bars of one column, added — not the tallest bar on the chart.`,
        hardness: 12 + n * 2,
      };
    }

    /* ---- the widest gap between the two series ---- */
    if (form.id === 'gap') {
      const best = gaps.indexOf(Math.max(...gaps));
      const o = options(cols[best], cols.map((c, i) => ({ c, i })).filter(x => x.i !== best)
        .map(x => ({ v: x.c, why: `At <b>${x.c}</b> the two differ by
          |${a[x.i]} − ${b[x.i]}| = ${gaps[x.i]}, which is smaller than the ${gaps[best]} at
          ${cols[best]}. A gap is one subtraction — do not read it as the taller bar.` })));
      return {
        ...common,
        q: `At which point is the <b>difference</b> between the two greatest?`,
        context: chart(),
        ...o,
        whyRight: `One subtraction per column: ${cols.map((c, i) => `${c} ${gaps[i]}`).join(', ')}.
          The widest is <b>${cols[best]}</b> at ${gaps[best]}.`,
        whyWrong: `The largest gap is not where the bars are tallest — it is where they are most
          UNEQUAL, and a tall pair can sit closer together than a short one.<br><br>
          |${set.series[0]} − ${set.series[1]}| by column:
          ${cols.map((c, i) => `${c} ${gaps[i]}`).join(', ')} → <b>${cols[best]}</b>.`,
        figure: chart({ hotCol: best }),
        figureCap: `The widest gap, not the tallest pair — those are different questions.`,
        hardness: 18 + n * 2,
      };
    }

    /* ---- percentage change from one series to the other ---- */
    if (form.id === 'double') {
      let i = R.int(0, n - 1);
      /* Pick a column whose change is a clean whole percentage, so the question
         tests the idea rather than the long division. */
      const clean1 = cols.map((_, k) => k).filter(k => Number.isInteger((b[k] - a[k]) / a[k] * 100));
      if (clean1.length) i = R.pick(clean1);
      const from = a[i], to = b[i];
      const g = r2(growth(from, to));
      if (from === to) return this.make(R, tier, want);
      const o = options(`${clean(g)}%`, [
        { v: `${clean(r2(growth(to, from)))}%`, why: `Measured backwards, from ${set.series[1]} to
          ${set.series[0]}. Change runs forward from the earlier figure — divide by ${from}.` },
        { v: `${clean(r2((to - from) / to * 100))}%`, why: `You divided by the LATER figure
          (${to}). The base is where you started: ${from}.` },
        { v: `${clean(Math.abs(to - from))}%`, why: `That is the change in UNITS
          (${Math.abs(to - from)}), not as a percentage. Divide it by ${from} first.` },
      ], k => ({ v: `${clean(r2(g + 5 * (k + 1)))}%`,
                 why: `(${to} − ${from}) ÷ ${from} × 100 = ${clean(g)}%.` }));
      return {
        ...common,
        q: `For <b>${cols[i]}</b>, what is the percentage change from ${set.series[0]} to ${set.series[1]}?`,
        context: chart(),
        ...o,
        whyRight: `(${to} − ${from}) ÷ ${from} × 100 = <b>${clean(g)}%</b>.${
          Math.abs(g - 100) < 0.01 ? ' A doubling is exactly a 100% rise — not 200%.' : ''}`,
        whyWrong: `Read both bars, then divide by the one you started from.<br><br>
          ${set.series[0]} ${from} → ${set.series[1]} ${to}, a change of ${to - from}.<br>
          ${to - from} ÷ ${from} × 100 = <b>${clean(g)}%</b>.<br><br>
          The classic slip here is doubling: ${from} to ${from * 2} is a rise of <b>100%</b>,
          because the increase equals the original — not 200%, which would be tripling.`,
        figure: chart({ hotCol: i }),
        figureCap: `Change is measured against the bar you started from, never the one you ended on.`,
        hardness: 24 + n * 2,
      };
    }

    /* ---- the unit multiplier: the trap a table cannot set ---- */
    const i = R.int(0, n - 1);
    const s0 = R() < 0.5 ? 0 : 1;
    const reading = (s0 === 0 ? a : b)[i];
    const actual = reading * set.mult;
    const fmtN = v => v.toLocaleString('en-IN');
    const o = options(fmtN(actual), [
      { v: fmtN(reading), why: `That is the number ON the axis. The unit at the top says
        <b>${set.unit.replace(/^[^(]*\(/, '').replace(/\)$/, '')}</b>, so every bar has to be
        multiplied by ${fmtN(set.mult)} — the unit is printed once and applies to all of them.` },
      { v: fmtN(actual * 10), why: `Ten times too many — check the multiplier in the unit line
        again: ${set.unit}.` },
      { v: fmtN(Math.round(actual / 10)), why: `Ten times too few. ${reading} ×
        ${fmtN(set.mult)} = ${fmtN(actual)}.` },
    ], k => ({ v: fmtN(actual + set.mult * 5 * (k + 1)),
               why: `${reading} on the axis × ${fmtN(set.mult)} = ${fmtN(actual)}.` }));
    return {
      ...common,
      q: `How many ${set.thing} does <b>${cols[i]}</b> show for <b>${set.series[s0]}</b>?`,
      context: chart(),
      ...o,
      whyRight: `The bar reads <b>${reading}</b>, and the unit line says
        “${set.unit}” — so the figure is ${reading} × ${fmtN(set.mult)} =
        <b>${fmtN(actual)}</b>.`,
      whyWrong: `Read the unit before the bars, every time. It is printed once, at the top, and it
        applies to the whole chart.<br><br>
        Here it is “${set.unit}”, so the ${reading} on the axis means
        ${reading} × ${fmtN(set.mult)} = <b>${fmtN(actual)}</b>.<br><br>
        Answering with the number on the axis is the commonest mark lost in a DI section, and it
        is lost to reading rather than to arithmetic.`,
      figure: chart({ hot: s0, hotCol: i }),
      figureCap: `The unit sits above the axis and multiplies every bar on the chart.`,
      hardness: 14 + n * 2,
    };
  },
};

export const QUANTS_GENERATORS = [
  hcfLcmGen, divisGen, ratioSplit, profitLoss, successive,
  interestGen, speedGen, workGen, areaScaling, circleGen,
  weightedGen, alligationGen, permCombGen, diTableGen,
  /* the widening pass — see the block comment above countMultiply */
  countMultiply, wordPerms, probDraw, triangleArea, ringArea, siSolve, relativeGen,
  pieGen, chartGen,
];
