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
