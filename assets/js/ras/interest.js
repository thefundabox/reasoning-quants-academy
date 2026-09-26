/* Interest, growth and work — RAS 2016 Q117/Q118, 2018 Q116-118, 2021 Q118, 2015 Q104. */
import { gen, ask, options, byTier, inr, rupees, round, asRatio, ratioOf, NAMES } from './kit.js';

const lcm = (a, b) => { const g = (x, y) => (y ? g(y, x % y) : x); return a * b / g(a, b); };

/* RAS 2016 Q117 / 2018 Q117: the CI−SI gap for 2 years is P(r/100)², and for
   3 years it is Pr²(300+r)/10⁶. The paper gives the gap and asks for P. */
const ciSiGap = (R, tier) => {
  const years = byTier(tier, 2, R.pick([2, 3]), 3);
  const r = R.pick([4, 5, 8, 10, 12, 15, 20]);
  const P = R.pick([8000, 12000, 15000, 18000, 24000, 25000, 40000]) * byTier(tier, 1, 1, R.pick([1, 2]));
  const gap = years === 2
    ? P * (r / 100) ** 2
    : P * (r * r * (300 + r)) / 1e6;
  if (Math.round(gap) !== gap || gap < 20) return null;
  const si = P * r * years / 100;
  return ask({
    context: `On a certain sum, the difference between compound interest (compounded annually) and
      simple interest at <b>${r}% per annum</b> for <b>${years} years</b> is <b>${rupees(gap)}</b>.`,
    q: 'The sum is',
    opts: options(rupees(P), [
      { v: rupees(round(gap * 100 / r)), why: 'That treats the difference as one year’s simple interest.' },
      { v: rupees(P / 2), why: '' },
      { v: rupees(round(gap * 10000 / (r * r * years))), why: `This uses ${years} × (r/100)², but the extra interest is not simply ${years} times the two-year gap.` },
      { v: rupees(si), why: 'That is the simple interest on the sum, not the sum.' },
    ]),
    why: years === 2
      ? `For 2 years the gap is exactly the interest earned on the first year's interest:
         P(r/100)² = P × ${round((r / 100) ** 2, 4)} = ${inr(gap)} → P = <b>${rupees(P)}</b>.`
      : `For 3 years the gap is P·r²(300 + r)/10⁶ = P × ${r}² × ${300 + r} / 10⁶ = ${inr(gap)}
         → P = <b>${rupees(P)}</b>.`,
    hardness: years === 3 ? 3 : 1.6,
    concept: 'ci-two-year-gap', conceptLabel: 'The CI − SI gap',
    source: 'Shape of RAS 2016 Q117 · RAS 2021 Q118',
  });
};

/* RAS 2018 Q118: a sum doubles in n years at CI, so in kn years it is 2^k
   times. The trap is multiplying instead of powering. */
const doubling = (R, tier) => {
  const n = R.pick([3, 4, 5, 6]);
  const k = byTier(tier, R.pick([2, 3]), R.pick([3, 4]), R.pick([4, 5]));
  const years = n * k;
  const times = 2 ** k;
  return ask({
    context: `A sum of money at compound interest <b>doubles in ${n} years</b>.`,
    q: `In <b>${years} years</b> it will become how many times the original sum?`,
    opts: options(`${times} times`, [
      { v: `${2 * k} times`, why: 'Money does not grow in equal steps under compound interest — it doubles again and again.' },
      { v: `${2 ** (k - 1)} times`, why: `That is the value after ${n * (k - 1)} years, one doubling short.` },
      { v: `${k + 1} times`, why: 'The number of periods is not the multiplier.' },
      { v: `${times + k} times`, why: '' },
      { v: `${times * 2} times`, why: `That is ${n} years too many — one doubling extra.` },
      { v: `${times + 2} times`, why: '' },
    ], i => `${times + 3 + i} times`),
    why: `${years} years is ${years}/${n} = <b>${k} doubling periods</b>. Each one multiplies the sum by 2,
      so the sum becomes 2<sup>${k}</sup> = <b>${times} times</b> the original.`,
    hardness: 1 + k / 2,
    concept: 'ci-periods', conceptLabel: 'Compounding periods',
    source: 'Shape of RAS 2018, Q118',
  });
};

/* RAS 2018 Q116: population growing at r% — the paper asks BACKWARDS, which
   is where candidates subtract instead of dividing. */
const backwards = (R, tier) => {
  const r = R.pick([4, 5, 8, 10, 20, 25]);
  const years = byTier(tier, 2, 2, 3);
  const base = R.pick([640000, 800000, 750000, 960000, 1250000]);
  const now = base * (1 + r / 100) ** years;
  if (Math.round(now) !== now) return null;
  const naive = now * (1 - r / 100) ** years;
  return ask({
    context: `The population of a town is <b>${inr(now)}</b> and grows at <b>${r}% per annum</b>.`,
    q: `What was the population <b>${years} years ago</b>?`,
    opts: options(inr(base), [
      { v: inr(Math.round(naive)), why: `Going back is not the same as falling ${r}% — you must divide by (1 + r/100), not multiply by (1 − r/100).` },
      { v: inr(Math.round(now - now * r * years / 100)), why: 'That subtracts simple interest; population growth compounds.' },
      { v: inr(Math.round(now / (1 + r / 100))), why: `That goes back only one year, not ${years}.` },
      { v: inr(base - 1000), why: '' },
    ]),
    why: `Each year multiplies by ${1 + r / 100}. So ${years} years ago the population was
      ${inr(now)} ÷ ${round((1 + r / 100) ** years, 4)} = <b>${inr(base)}</b>.`,
    hardness: 1.4 + years / 3,
    concept: 'ci-amount-first', conceptLabel: 'Compounding backwards',
    source: 'Shape of RAS 2018, Q116',
  });
};

/* RAS 2015 Q104: three people start together; two leave a few days before the
   work ends. Asked for the RATIO of their contributions, not the days. */
const leaveEarly = (R, tier) => {
  const [a, b, c] = R.pick([[9, 18, 24], [10, 15, 20], [12, 18, 36], [8, 12, 24], [6, 12, 18]]);
  const L = lcm(lcm(a, b), c);
  const den = L / a + L / b + L / c;                  // work per day, in units of 1/L
  /* The paper always lands on a ratio a candidate can state in small whole
     numbers, so the pair of "leaves early" days is CHOSEN to make one rather
     than drawn and hoped for — 67 : 39 is arithmetically fine and reads like
     a mistake. Searching four values each way is cheap and always finds one. */
  const max = byTier(tier, 2, 3, 4);
  let p = 0, q = 0, y = 0, z = 0;
  for (const [pi, qi] of R.shuffle([1, 2, 3, 4].flatMap(x => [1, 2, 3, 4].map(w => [x, w])))) {
    if (pi > max || qi > max) continue;
    const num0 = L + (L * pi) / b + (L * qi) / c;
    const yU = (num0 - pi * den) * c, zU = (num0 - qi * den) * b;
    if (yU <= 0 || zU <= 0) continue;
    const [y0, z0] = ratioOf(yU, zU);
    if (y0 > 15 || z0 > 15) continue;
    p = pi; q = qi; y = y0; z = z0; break;
  }
  if (!p) return null;
  const num = L + (L * p) / b + (L * q) / c;          // D = num/den
  const D = num / den;
  const names = R.some(NAMES, 3);
  return ask({
    context: `${names[0]}, ${names[1]} and ${names[2]} can finish a piece of work alone in
      <b>${a}</b>, <b>${b}</b> and <b>${c} days</b> respectively. They begin together, but ${names[1]} leaves
      <b>${p} day${p > 1 ? 's' : ''}</b> and ${names[2]} leaves <b>${q} day${q > 1 ? 's' : ''}</b> before the work is finished.`,
    q: `The ratio of ${names[1]}'s share of the work to ${names[2]}'s is`,
    opts: options(`${y} : ${z}`, [
      { v: asRatio(c, b), why: 'That is the ratio of their speeds, ignoring the different number of days each worked.' },
      { v: `${z} : ${y}`, why: 'Right numbers, wrong order.' },
      { v: asRatio(b, c), why: 'That is the ratio of the days they take alone — the slower worker does not do more.' },
      /* Reduced, always: "4 : 4" beside a key of "4 : 3" reads as a typo
         rather than as a wrong answer somebody might actually reach. */
      { v: asRatio(y + 1, z), why: '' },
      { v: asRatio(y, z + 1), why: '' },
      { v: asRatio(y + 2, z), why: '' },
    ], i => asRatio(y + 3 + i, z)),
    why: `Let the work end on day D. ${names[0]} works D days, ${names[1]} works D − ${p},
      ${names[2]} works D − ${q}:<br>
      D/${a} + (D − ${p})/${b} + (D − ${q})/${c} = 1 → D = <b>${round(D, 3)} days</b>.<br>
      ${names[1]}'s share = (D − ${p})/${b} = ${round((D - p) / b, 4)};
      ${names[2]}'s = (D − ${q})/${c} = ${round((D - q) / c, 4)}.
      Ratio = <b>${y} : ${z}</b>.`,
    hardness: 2.5 + (p + q) / 4,
    concept: 'work-rates-add', conceptLabel: 'Work when somebody leaves early',
    source: 'Shape of RAS 2015, Q104',
  });
};

export const INTEREST_GENERATORS = [
  gen('ras-int-gap', 'interest', 'quants:3', 'ci-two-year-gap', 'CI − SI gap', ciSiGap),
  gen('ras-int-double', 'interest', 'quants:3', 'ci-periods', 'Doubling periods', doubling),
  gen('ras-int-back', 'interest', 'quants:3', 'ci-amount-first', 'Growth, backwards', backwards),
  gen('ras-int-leave', 'interest', 'quants:3', 'work-rates-add', 'Work with early leavers', leaveEarly),
];

/* ============================================================
   Wider coverage — RAS 2023 Q97 (one principal split between two schemes),
   RAS 2024 Q93 (a rate found from simple interest, then compounded more
   often than once a year).
   ============================================================ */

/* Part of the money at compound interest, the rest at simple interest, and
   only the DIFFERENCE given. Two schemes, one unknown. */
const splitPrincipal = (R, tier) => {
  const SPLITS = [[2, 3], [1, 2], [1, 3], [3, 4], [2, 5]];
  const [num, den] = R.pick(SPLITS);
  const rc = R.pick([10, 20, 5, 15]);                 // compound rate
  const rs = R.pick([12, 15, 8, 18, 20]);             // simple rate
  const years = 2;
  const ciFactor = (num / den) * ((1 + rc / 100) ** years - 1);
  const siFactor = (1 - num / den) * (rs * years / 100);
  const gap = ciFactor - siFactor;
  if (Math.abs(gap) < 0.01) return null;
  const P = R.pick([8000, 10000, 12000, 16000, 20000, 24000]);
  const diff = round(Math.abs(gap) * P, 2);
  if (Math.round(diff) !== diff || diff < 50) return null;
  const bigger = gap > 0 ? 'compound' : 'simple';
  return ask({
    context: `<b>${num}/${den}</b> of a sum is deposited at <b>compound interest of ${rc}% per annum</b>,
      and the rest at <b>simple interest of ${rs}% per annum</b>.`,
    q: `If the ${bigger} interest exceeds the other by <b>${rupees(diff)}</b> after ${years} years,
      what is the total sum?`,
    opts: options(rupees(P), [
      { v: rupees(round(P * num / den, 2)), why: `That is the part at compound interest, not the whole sum.` },
      { v: rupees(round(diff / (rs * years / 100), 2)), why: 'That treats the difference as simple interest on the whole sum.' },
      { v: rupees(P * 2), why: '' },
      { v: rupees(round(P / 2, 2)), why: '' },
    ], i => rupees(P + 2000 * (i + 1))),
    why: `Take the sum as P.<br>
      Compound part: ${num}/${den} × P × ((1 + ${rc}/100)² − 1) = <b>${round(ciFactor, 4)}P</b>.<br>
      Simple part: ${den - num}/${den} × P × ${rs} × 2/100 = <b>${round(siFactor, 4)}P</b>.<br>
      The gap is ${round(Math.abs(gap), 4)}P = ${rupees(diff)}, so P = <b>${rupees(P)}</b>.`,
    hardness: 2.8,
    concept: 'ci-amount-first', conceptLabel: 'Two schemes, one sum',
    source: 'Shape of RAS 2023, Q97',
  });
};

/* A rate found from simple interest and then used with compounding more often
   than yearly. Halving the rate and doubling the periods is the whole trick. */
const compoundOften = (R, tier) => {
  const P = R.pick([8000, 10000, 12000, 16000, 20000]);
  const rate = R.pick([10, 12, 20, 8, 15]);
  const siYears = R.pick([2, 3, 4]);
  const si = P * rate * siYears / 100;
  const per = byTier(tier, 'half-yearly', R.pick(['half-yearly', 'quarterly']), 'quarterly');
  const k = per === 'half-yearly' ? 2 : 4;
  const years = 2;
  const amount = P * (1 + rate / (100 * k)) ** (k * years);
  const ci = round(amount - P, 2);
  const yearly = round(P * ((1 + rate / 100) ** years - 1), 2);
  if (Math.round(ci * 100) !== ci * 100) return null;
  return ask({
    context: `The simple interest on <b>${rupees(P)}</b> for <b>${siYears} years</b> is <b>${rupees(si)}</b>.`,
    q: `At the same rate, compounded <b>${per}</b>, what is the compound interest on the same sum
      after <b>${years} years</b>?`,
    opts: options(rupees(ci), [
      { v: rupees(yearly), why: `That compounds once a year. Compounding ${per} means ${k} periods a year, each at ${rate}/${k} = ${rate / k}%.` },
      { v: rupees(round(amount, 2)), why: 'That is the AMOUNT. The interest is what you add to the principal, so subtract it.' },
      { v: rupees(round(P * rate * years / 100, 2)), why: 'That is simple interest for two years.' },
      { v: rupees(round(ci * 2, 2)), why: '' },
    ], i => rupees(round(ci + 100 * (i + 1), 2))),
    why: `First the rate: ${rupees(si)} = ${rupees(P)} × r × ${siYears}/100 → r = <b>${rate}% per annum</b>.<br>
      Compounded ${per} there are ${k} periods a year at ${rate / k}% each, so after ${years} years:
      ${rupees(P)} × (1 + ${rate / k}/100)<sup>${k * years}</sup> = ${rupees(round(amount, 2))}.<br>
      Interest = ${rupees(round(amount, 2))} − ${rupees(P)} = <b>${rupees(ci)}</b>.`,
    hardness: 2.5 + (k === 4 ? 0.5 : 0),
    concept: 'ci-periods', conceptLabel: 'Compounding more often',
    source: 'Shape of RAS 2024, Q93',
  });
};

INTEREST_GENERATORS.push(
  gen('ras-int-split', 'interest', 'quants:3', 'ci-amount-first', 'Two schemes, one sum', splitPrincipal),
  gen('ras-int-often', 'interest', 'quants:3', 'ci-periods', 'Compounding more often', compoundOften),
);
