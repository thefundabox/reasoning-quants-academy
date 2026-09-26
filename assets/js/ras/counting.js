/* Counting and chance — RAS 2021 Q114 (at least one), Q119 (increasing dice). */
import { gen, ask, options, byTier, round, gcd } from './kit.js';

const C = (n, r) => { if (r < 0 || r > n) return 0; let x = 1; for (let i = 1; i <= r; i++) x = x * (n - r + i) / i; return Math.round(x); };
const frac = (a, b) => { const g = gcd(a, b) || 1; return `${a / g}/${b / g}`; };

/* "At least one" is counted by taking away the case that has none — counting
   it directly needs three separate cases and is where candidates lose time. */
const atLeastOne = (R, tier) => {
  const girls = R.int(byTier(tier, 4, 5, 6), byTier(tier, 8, 10, 12));
  const boys = R.int(byTier(tier, 3, 4, 4), byTier(tier, 6, 8, 9));
  const pick = R.int(3, byTier(tier, 4, 5, 6));
  if (pick >= boys + girls) return null;
  const all = C(girls + boys, pick), none = C(boys, pick);
  const key = all - none;
  if (key < 10) return null;
  return ask({
    context: `A group has <b>${girls} girls</b> and <b>${boys} boys</b>.`,
    q: `In how many ways can <b>${pick} children</b> be chosen so that <b>at least one girl</b> is included?`,
    opts: options(String(key), [
      { v: String(all), why: 'That is every selection, including the all-boy ones.' },
      { v: String(none), why: 'That is the number of selections with NO girl — the very thing to take away.' },
      { v: String(girls * C(girls + boys - 1, pick - 1)), why: 'Choosing "one girl first, then anybody" counts the same group several times over.' },
      { v: String(key + boys), why: '' },
    ], i => String(key + 3 * (i + 1))),
    why: `Count the opposite and subtract. All selections: C(${girls + boys}, ${pick}) = ${all}.
      Selections with no girl at all: C(${boys}, ${pick}) = ${none}.<br>
      At least one girl = ${all} − ${none} = <b>${key}</b>.`,
    hardness: 1.8 + pick / 4,
    concept: 'comb-conditions', conceptLabel: 'At least one',
    source: 'Shape of RAS 2021, Q114',
  });
};

/* Strictly increasing rolls: the ORDER is forced once the numbers are chosen,
   so it is a combination question wearing a probability hat. */
const increasingDice = (R, tier) => {
  const rolls = byTier(tier, 2, 3, R.pick([3, 4]));
  const faces = R.pick([6, 6, 6, 8, 10, 12]);        // dice other than the cube, occasionally
  const good = C(faces, rolls), all = faces ** rolls;
  const key = frac(good, all);
  return ask({
    context: `A fair ${faces === 6 ? 'die' : `${faces}-faced die`} is rolled <b>${rolls} times</b>.`,
    q: `What is the probability that each number is <b>strictly larger</b> than the one before it?`,
    opts: options(key, [
      { v: frac(good * factorial(rolls), all), why: 'That counts every ORDER of the chosen numbers. Only one order is increasing.' },
      { v: frac(1, all), why: 'That is the chance of one particular sequence.' },
      { v: frac(good, faces * rolls), why: `The number of possible outcomes is ${faces} multiplied by itself ${rolls} times, not ${faces} times the rolls.` },
      { v: frac(good + 1, all), why: '' },
    ], i => frac(good + 2 + i, all)),
    why: `Choose which ${rolls} of the ${faces} faces appear: C(${faces}, ${rolls}) = <b>${good}</b> ways.
      Once chosen, exactly one arrangement of them is increasing.<br>
      Total outcomes: ${faces}<sup>${rolls}</sup> = ${all}. Probability = ${good}/${all} = <b>${key}</b>.`,
    hardness: 2 + rolls / 2,
    concept: 'prob-count-both', conceptLabel: 'Order that counts itself',
    source: 'Shape of RAS 2021, Q119',
  });
};
function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }

/* A committee with a floor on one group — the same idea, one step harder. */
const committee = (R, tier) => {
  const men = R.int(5, byTier(tier, 7, 9, 11)), women = R.int(3, byTier(tier, 5, 6, 8));
  const size = R.int(3, byTier(tier, 4, 5, 6));
  const least = R.int(1, 2);
  if (size > men + women - 1 || women < least) return null;
  let key = 0;
  for (let w = least; w <= Math.min(women, size); w++) key += C(women, w) * C(men, size - w);
  const all = C(men + women, size);
  if (key < 10 || key === all) return null;
  return ask({
    context: `A committee of <b>${size}</b> is to be formed from <b>${men} men</b> and <b>${women} women</b>.`,
    q: `In how many ways can it be formed with <b>at least ${least} wom${least === 1 ? 'an' : 'en'}</b>?`,
    opts: options(String(key), [
      { v: String(all), why: 'That is every committee, including those with too few women.' },
      { v: String(C(women, least) * C(men + women - least, size - least)), why: 'Fixing some women first and filling up freely counts the same committee more than once.' },
      { v: String(all - key), why: 'That is the number of committees that FAIL the condition.' },
      { v: String(key + men), why: '' },
    ], i => String(key + 4 * (i + 1))),
    why: `Split by the number of women, from ${least} upwards:<br>
      ${[...Array(Math.min(women, size) - least + 1).keys()].map(i => {
        const w = least + i;
        return `${w} women: C(${women},${w}) × C(${men},${size - w}) = ${C(women, w) * C(men, size - w)}`;
      }).join('<br>')}<br>
      Total = <b>${key}</b>.`,
    hardness: 2.4 + size / 4,
    concept: 'comb-forced', conceptLabel: 'Committees with a floor',
    source: 'RAS staple — counting block',
  });
};

export const COUNTING_GENERATORS = [
  gen('ras-cnt-atleast', 'counting', 'quants:6', 'comb-conditions', 'At least one', atLeastOne),
  gen('ras-cnt-dice', 'counting', 'quants:6', 'prob-count-both', 'Increasing rolls', increasingDice),
  gen('ras-cnt-committee', 'counting', 'quants:6', 'comb-forced', 'Committees', committee),
];

/* ============================================================
   Wider coverage — RAS 2023 Q103 (no two women together),
   RAS 2024 Q97 (words with at least one repeated letter),
   RAS 2024 Q98 (the sum of two dice is prime).
   ============================================================ */

const fact = factorial;   // the name the counting questions use in their own words

/* The gap method: seat the men first, then drop the women into the spaces
   between them. Counting the women first is what makes this hard. */
const noTwoTogether = (R, tier) => {
  const m = R.int(byTier(tier, 4, 5, 6), byTier(tier, 6, 7, 8));
  const w = R.int(2, Math.min(byTier(tier, 2, 3, 4), m));
  const key = fact(m) * C(m + 1, w) * fact(w);
  if (key > 5e8) return null;
  const wrong1 = fact(m + w);                                  // no restriction at all
  const wrong2 = fact(m) * fact(w);                            // women kept as one block
  return ask({
    context: `<b>${m} men</b> and <b>${w} women</b> are to be seated in a row.`,
    q: 'In how many ways can they be seated so that <b>no two women sit together</b>?',
    opts: options(String(key), [
      { v: String(wrong1), why: 'That is every seating, with no restriction at all.' },
      { v: String(wrong2), why: 'That keeps the women together as one block — the opposite of what is asked.' },
      { v: String(fact(m) * C(m + 1, w)), why: `That chooses the gaps but forgets that the ${w} women can be arranged among themselves.` },
      { v: String(fact(m) * fact(m + 1) / fact(m + 1 - w)), why: '' },
    ], i => String(key + 120 * (i + 1))),
    why: `Seat the ${m} men first: ${m}! = <b>${fact(m)}</b> ways. That creates ${m} + 1 = ${m + 1} gaps
      — one at each end and one between every pair.<br>
      No two women together means no gap holds two of them, so choose ${w} of the ${m + 1} gaps:
      C(${m + 1}, ${w}) = ${C(m + 1, w)}, and arrange the women in them: ${w}! = ${fact(w)}.<br>
      Total = ${fact(m)} × ${C(m + 1, w)} × ${fact(w)} = <b>${key}</b>.`,
    hardness: 2.6 + w / 3,
    concept: 'count-restricted-first', conceptLabel: 'The gap method',
    source: 'Shape of RAS 2023, Q103',
  });
};

/* "At least one repeated letter" is counted by taking the all-different case
   away from everything — the same move as "at least one girl", one level up. */
const repeatedLetter = (R, tier) => {
  const k = R.int(byTier(tier, 6, 8, 10), byTier(tier, 9, 10, 12));
  const r = byTier(tier, 3, 4, 5);
  if (r > k) return null;
  const all = k ** r;
  let distinct = 1;
  for (let i = 0; i < r; i++) distinct *= k - i;
  const key = all - distinct;
  return ask({
    context: `<b>${k} different letters</b> are given. Words of <b>${r} letters</b> are formed from them,
      and a letter may be used more than once.`,
    q: 'How many of those words have <b>at least one repeated letter</b>?',
    opts: options(String(key), [
      { v: String(distinct), why: 'That counts the words with all letters DIFFERENT — the very ones to take away.' },
      { v: String(all), why: 'That is every word that can be formed, repeats or not.' },
      { v: String(C(k, r)), why: 'That chooses which letters appear and ignores their order; a word is ordered.' },
      { v: String(key + k), why: '' },
    ], i => String(key + 100 * (i + 1))),
    why: `Count the opposite. Words with repetition allowed: ${k}<sup>${r}</sup> = <b>${all}</b>.<br>
      Words with every letter different: ${Array.from({ length: r }, (_, i) => k - i).join(' × ')} = <b>${distinct}</b>.<br>
      At least one repeat = ${all} − ${distinct} = <b>${key}</b>.`,
    hardness: 2.3 + r / 4,
    concept: 'perm-repeats', conceptLabel: 'Counting the opposite',
    source: 'Shape of RAS 2024, Q97',
  });
};

/* Two dice, one property of the sum. Enumerated over all 36 outcomes, so the
   generator cannot disagree with a hand count. */
const diceSum = (R, tier) => {
  const PROPS = [
    { say: 'a prime number', test: s => [2, 3, 5, 7, 11].includes(s), tier: 1 },
    { say: 'a multiple of 3', test: s => s % 3 === 0, tier: 1 },
    { say: 'more than 9', test: s => s > 9, tier: 1 },
    { say: 'a perfect square', test: s => [4, 9].includes(s), tier: 2 },
    { say: 'an even number greater than 6', test: s => s % 2 === 0 && s > 6, tier: 2 },
    { say: 'a multiple of 4', test: s => s % 4 === 0, tier: 2 },
  ];
  const p = R.pick(PROPS.filter(x => (tier === 1 ? x.tier === 1 : true)));
  let good = 0;
  const pairs = [];
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (p.test(a + b)) { good++; pairs.push(`${a}+${b}`); }
  if (!good || good === 36) return null;
  const g = gcd(good, 36) || 1;
  const key = `${good / g}/${36 / g}`;
  const g2 = gcd(36 - good, 36) || 1;
  return ask({
    context: `Two fair dice are thrown together.`,
    q: `What is the probability that the sum is <b>${p.say}</b>?`,
    opts: options(key, [
      { v: `${(36 - good) / g2}/${36 / g2}`, why: 'That is the probability of the sum NOT having the property.' },
      { v: `${good / gcd(good, 12) }/${12 / gcd(good, 12)}`, why: 'There are 36 equally likely outcomes with two dice, not 12.' },
      { v: `${good}/36`.replace(/^(\d+)\/36$/, (m0, x) => `${x}/6`), why: 'The outcomes are pairs, so the denominator is 6 × 6 = 36.' },
      { v: `${Math.min(6, good)}/36`, why: '' },
    ], i => `${good + i + 1}/36`),
    why: `List the 36 equally likely outcomes and keep the ones whose sum is ${p.say}:
      there are <b>${good}</b> of them.<br>
      Probability = ${good}/36 = <b>${key}</b>.`,
    hardness: 1.4 + (p.tier === 2 ? 0.6 : 0),
    concept: 'dice-distinguishable', conceptLabel: 'All 36 outcomes',
    source: 'Shape of RAS 2024, Q98',
  });
};

COUNTING_GENERATORS.push(
  gen('ras-cnt-gaps', 'counting', 'quants:6', 'count-restricted-first', 'The gap method', noTwoTogether),
  gen('ras-cnt-repeat', 'counting', 'quants:6', 'perm-repeats', 'At least one repeat', repeatedLetter),
  gen('ras-cnt-dicesum', 'counting', 'quants:6', 'dice-distinguishable', 'Sums on two dice', diceSum),
);
