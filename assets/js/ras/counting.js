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
