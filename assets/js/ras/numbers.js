/* Number sense the RPSC way — RAS 2016 Q114, 2018 Q112/Q113, 2021 Q112.
   Short questions that are only short if you know the trick. */
import { gen, ask, options, byTier, inr, round, asRatio } from './kit.js';

const gcd2 = (a, b) => (b ? gcd2(b, a % b) : a);
const lcm2 = (a, b) => a * b / gcd2(a, b);

/* RAS 2016 Q114: the unit digit of a product of big numbers. Multiplying it
   out is the trap — only the last digits matter. */
const unitDigit = (R, tier) => {
  const k = byTier(tier, 3, 3, 4);
  const ns = [...Array(k)].map(() => R.int(111, 999));
  const digits = ns.map(n => n % 10);
  const key = digits.reduce((a, b) => (a * b) % 10, 1);
  const sum = digits.reduce((a, b) => a + b, 0) % 10;
  return ask({
    context: '',
    q: `What is the digit in the unit's place of the product <b>${ns.join(' × ')}</b>?`,
    opts: options(String(key), [
      { v: String(sum), why: 'That adds the last digits. Multiplication of the numbers means multiplication of their last digits.' },
      { v: String((key + 2) % 10), why: '' },
      { v: String(digits[0]), why: 'That is the last digit of the first number only.' },
      { v: String((key + 5) % 10), why: '' },
    ], i => String((key + 3 + i) % 10)),
    why: `Only the last digits matter: ${digits.join(' × ')}
      → ${digits.reduce((a, b) => { const p = (a.v * b) % 10; return { s: `${a.s} → ${p}`, v: p }; }, { s: '', v: 1 }).s.replace(/^ → /, '')}.
      The unit digit is <b>${key}</b>.`,
    hardness: 1 + k / 4,
    concept: 'square-last-digit', conceptLabel: 'Last digits only',
    source: 'Shape of RAS 2016, Q114',
  });
};

/* RAS 2021 Q112: "the arithmetic mean of the numbers between 1 and 156
   divisible by 2, 3, 4 and 6". Divisible by ALL of them means divisible by
   their LCM — and the mean of an evenly spaced list is its middle. */
const meanOfMultiples = (R, tier) => {
  const set = R.pick([[2, 3, 4, 6], [2, 4, 8], [3, 6, 9], [2, 5, 10], [4, 6, 12], [2, 3, 5]]);
  const L = set.reduce(lcm2);
  const N = R.int(byTier(tier, 60, 120, 200), byTier(tier, 160, 320, 600));
  const list = [];
  for (let x = L; x <= N; x += L) list.push(x);
  if (list.length < 4) return null;
  const key = round(list.reduce((a, b) => a + b, 0) / list.length, 2);
  const wrongLCM = round((L + Math.floor(N / L) * L) / 2 + L, 2);
  return ask({
    context: '',
    q: `What is the arithmetic mean of the numbers from 1 to <b>${N}</b> that are divisible by
      <b>${set.slice(0, -1).join(', ')} and ${set[set.length - 1]}</b>?`,
    opts: options(String(key), [
      { v: String(round(N / 2, 2)), why: 'That is the mean of ALL the numbers up to ' + N + ', not of the multiples.' },
      { v: String(wrongLCM), why: 'One term out at one end — list the first and last multiple carefully.' },
      { v: String(L), why: 'That is the smallest such number, not the mean.' },
      { v: String(round(key + L / 2, 2)), why: '' },
    ], i => String(round(key + L * (i + 1), 2))),
    why: `Divisible by every one of ${set.join(', ')} means divisible by their LCM = <b>${L}</b>.<br>
      The multiples are ${list.slice(0, 3).join(', ')} … ${list[list.length - 1]} — evenly spaced,
      so the mean is the middle: (${list[0]} + ${list[list.length - 1]})/2 = <b>${key}</b>.`,
    hardness: 1 + set.length / 4 + list.length / 20,
    concept: 'lcm-identity', conceptLabel: 'Divisible by all of them',
    source: 'Shape of RAS 2021, Q112',
  });
};

/* RAS 2018 Q113: three consecutive numbers, the product divided by each in
   turn, the quotients summed. Algebra disguised as arithmetic. */
const consecutive = (R, tier) => {
  const n = R.int(byTier(tier, 4, 6, 9), byTier(tier, 8, 14, 22));
  const total = 3 * n * n - 1;
  const key = 3 * n;
  return ask({
    context: `The product of three consecutive positive integers is divided by each of them in turn.`,
    q: `If the three quotients add up to <b>${inr(total)}</b>, what is the sum of the three numbers?`,
    opts: options(String(key), [
      { v: String(n), why: 'That is the middle number. The question asks for the sum of all three.' },
      { v: String(3 * n + 3), why: 'One step too far along — check which three consecutive numbers fit.' },
      { v: String(Math.round(total / 3)), why: 'Dividing the quotient total by 3 does not undo the squaring.' },
      { v: String(3 * n - 3), why: '' },
    ], i => String(3 * n + 3 * (i + 2))),
    why: `Call them n−1, n, n+1. Dividing their product by each gives
      n(n+1), (n−1)(n+1) and (n−1)n — that is (n²+n) + (n²−1) + (n²−n) = <b>3n² − 1</b>.<br>
      3n² − 1 = ${inr(total)} → n² = ${n * n} → n = ${n}. The three numbers are
      ${n - 1}, ${n}, ${n + 1} and their sum is <b>${key}</b>.`,
    hardness: 2.4,
    concept: 'divis-factorise', conceptLabel: 'Algebra behind the arithmetic',
    source: 'Shape of RAS 2018, Q113',
  });
};

/* RAS 2018 Q112: how many solutions in NATURAL numbers — stars and bars, and
   the trap is counting the ones that use zero. */
const solutions = (R, tier) => {
  const k = R.int(byTier(tier, 5, 7, 9), byTier(tier, 8, 11, 14));
  const key = (k - 1) * (k - 2) / 2;                       // C(k-1, 2)
  const withZero = (k + 1) * (k + 2) / 2;                  // whole numbers instead
  return ask({
    context: '',
    q: `If x, y and z are <b>natural numbers</b>, how many different solutions does
      <b>x + y + z = ${k}</b> have?`,
    opts: options(String(key), [
      { v: String(withZero), why: 'That allows zeros. Natural numbers start at 1, so every variable must take at least 1.' },
      { v: String(Math.round(key / 6)), why: 'That counts sets rather than ordered solutions — (1, 2, 3) and (3, 2, 1) are different solutions here.' },
      { v: String(k), why: '' },
      { v: String(key + k), why: '' },
    ], i => String(key + 2 * (i + 1))),
    why: `Each of x, y, z is at least 1. Put one aside for each, leaving ${k - 3} to share freely:
      the number of ways is C(${k - 1}, 2) = <b>${key}</b>.<br>
      (If zeros were allowed it would be C(${k + 2}, 2) = ${withZero} — which is what the wrong answer counts.)`,
    hardness: 2.2,
    concept: 'divis-combine', conceptLabel: 'Counting solutions',
    source: 'Shape of RAS 2018, Q112',
  });
};

export const NUMBER_GENERATORS = [
  gen('ras-num-unit', 'numbers', 'quants:1', 'square-last-digit', 'Last digits only', unitDigit),
  gen('ras-num-mean', 'numbers', 'quants:1', 'lcm-identity', 'Divisible by all', meanOfMultiples),
  gen('ras-num-consec', 'numbers', 'quants:1', 'divis-factorise', 'Consecutive integers', consecutive),
  gen('ras-num-solutions', 'numbers', 'quants:1', 'divis-combine', 'Counting solutions', solutions),
];
