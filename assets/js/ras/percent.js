/* Percentage, profit and election arithmetic — RAS 2021 Q117, 2016 Q119, 2015 Q116. */
import { gen, ask, options, byTier, inr, rupees, round, asRatio } from './kit.js';

/* RAS 2021 Q117: three candidates, each described relative to another, a
   margin in votes, and a turnout — four linked percentages in one question. */
const election = (R, tier) => {
  const more = R.pick([50, 25, 20, 40]);              // A over B, %
  const edge = R.pick([5, 8, 10, 4]);                 // B over C, %
  const turnout = R.pick([80, 90, 75]);
  const fC = 1, fB = 1 + edge / 100, fA = fB * (1 + more / 100);
  const unit = R.pick([20000, 40000, 60000, 80000]) * byTier(tier, 1, 1, R.pick([1, 2]));
  const C = unit, B = C * fB, A = C * fA;
  const margin = A - C, total = A + B + C, list = total / (turnout / 100);
  if ([B, A, margin, total, list].some(x => Math.round(x) !== x)) return null;
  return ask({
    context: `In an election between three candidates, <b>A</b> gets <b>${more}% more votes than B</b>,
      and <b>B gets ${edge}% more votes than C</b>. A beats C by <b>${inr(margin)} votes</b>.
      <b>${turnout}%</b> of the voters on the list voted, and no vote was invalid.`,
    q: 'How many voters are there on the voting list?',
    opts: options(inr(list), [
      { v: inr(total), why: `That is the number who VOTED. Only ${turnout}% of the list turned out.` },
      { v: inr(Math.round(A)), why: "That is A's vote count." },
      { v: inr(Math.round(total * turnout / 100)), why: `This takes ${turnout}% of the votes cast instead of treating the votes cast AS ${turnout}%.` },
      { v: inr(Math.round(list) + 1000), why: '' },
    ]),
    why: `Take C = x. Then B = ${round(fB, 4)}x and A = ${round(fB, 4)} × ${round(1 + more / 100, 2)}x = ${round(fA, 4)}x.<br>
      A − C = ${round(fA - 1, 4)}x = ${inr(margin)} → x = <b>${inr(C)}</b>.<br>
      Votes cast = ${round(fA, 4)}x + ${round(fB, 4)}x + x = ${inr(total)}, and that is ${turnout}% of the list,
      so the list holds ${inr(total)} × 100/${turnout} = <b>${inr(list)}</b>.`,
    /* Bigger electorates mean more digits to carry through four linked
       percentages, and that is what the tier moves. */
    hardness: 2 + String(list).length / 5 + (more % 10 ? 0.4 : 0),
    concept: 'pct-successive', conceptLabel: 'Chained percentages',
    source: 'Shape of RAS 2021, Q117',
  });
};

/* RAS 2016 Q119: a percentage change between two years of a table — the sign
   and the base are both traps. */
const changeBetween = (R, tier) => {
  const a = R.int(byTier(tier, 120, 240, 360), byTier(tier, 400, 900, 1800));
  const b = R.int(byTier(tier, 120, 240, 360), byTier(tier, 400, 900, 1800));
  /* Too small a change and the "wrong base" distractor rounds onto the key —
     two options reading 0.69% is a broken question, not a hard one. */
  if (a === b || Math.abs(a - b) * 100 / a > 60 || Math.abs(a - b) * 100 / a < 4) return null;
  const pct = round((b - a) * 100 / a, 2);
  const wrongBase = round((b - a) * 100 / b, 2);
  const dir = pct > 0 ? 'increase' : 'decrease';
  const other = pct > 0 ? 'decrease' : 'increase';
  const y1 = R.pick([2010, 2012, 2015]), y2 = y1 + R.pick([3, 4, 5]);
  return ask({
    context: `A factory exported <b>${inr(a)}</b> units in ${y1}-${String(y1 + 1).slice(2)} and
      <b>${inr(b)}</b> units in ${y2}-${String(y2 + 1).slice(2)}.`,
    q: `The percentage change in exports over that period is about`,
    opts: options(`${Math.abs(pct)}% ${dir}`, [
      { v: `${Math.abs(pct)}% ${other}`, why: 'Right size, wrong direction — check which year is larger.' },
      { v: `${Math.abs(wrongBase)}% ${dir}`, why: `This divides by the ${y2} figure. A change is always measured against the EARLIER value.` },
      { v: `${Math.abs(round(pct + 1, 2))}% ${dir}`, why: '' },
      { v: `${Math.abs(wrongBase)}% ${other}`, why: 'Wrong base and wrong direction.' },
    ]),
    why: `Change = ${inr(b)} − ${inr(a)} = ${inr(b - a)}, measured against the earlier year:
      ${inr(b - a)}/${inr(a)} × 100 = <b>${Math.abs(pct)}% ${dir}</b>.`,
    hardness: 0.9 + String(a).length / 4 + (Number.isInteger(pct) ? 0 : 0.4),
    concept: 'pct-reverse', conceptLabel: 'Percentage change, correct base',
    source: 'Shape of RAS 2016, Q119',
  });
};

/* Two articles sold at the same price, one at a profit and one at the same
   percentage loss — the classic "overall" question, where the instinct that
   it breaks even is wrong. */
const twoArticles = (R, tier) => {
  const r = R.pick([10, 20, 25, 15, 12]);
  const sp = R.pick([960, 1200, 1800, 2400, 990]);
  const cpGain = sp / (1 + r / 100), cpLoss = sp / (1 - r / 100);
  const totalCP = cpGain + cpLoss, totalSP = 2 * sp;
  const loss = totalCP - totalSP;
  const pct = round(loss * 100 / totalCP, 2);
  if (pct <= 0) return null;
  return ask({
    context: `Two articles are each sold for <b>${rupees(sp)}</b>. On one there is a profit of <b>${r}%</b>
      and on the other a loss of <b>${r}%</b>.`,
    q: 'On the whole transaction there is',
    opts: options(`a loss of ${pct}%`, [
      { v: 'neither profit nor loss', why: 'The percentages are equal but they are taken on DIFFERENT cost prices, so they do not cancel.' },
      { v: `a profit of ${pct}%`, why: 'The direction is wrong: equal percentage gain and loss on the same selling price always ends in a loss.' },
      { v: `a loss of ${round(r * r / 100, 2)}%`, why: '' },
      { v: `a loss of ${round(pct * 2, 2)}%`, why: '' },
    ]),
    why: `Cost of the first = ${sp}/${round(1 + r / 100, 2)} = ${rupees(round(cpGain, 2))};
      cost of the second = ${sp}/${round(1 - r / 100, 2)} = ${rupees(round(cpLoss, 2))}.<br>
      Total cost ${rupees(round(totalCP, 2))} against total sale ${rupees(totalSP)} — a loss of
      ${rupees(round(loss, 2))}, i.e. <b>${pct}%</b>. (It is always r²/100 = ${round(r * r / 100, 2)}% of the total cost
      when the two selling prices are equal.)`,
    hardness: 2.2,
    concept: 'trade-two-articles', conceptLabel: 'Equal gain and loss',
    source: 'RAS staple — see 2016 Q117 family',
  });
};

/* RAS 2015 Q116: the ratio of an exterior to an interior angle fixes the
   number of sides. Geometry wearing a ratio's clothes. */
const polygonAngles = (R, tier) => {
  const n = R.pick([6, 8, 9, 10, 12, 15, 18, 20]);
  const ext = 360 / n, int = 180 - ext;
  const [x, y] = [ext, int].map(v => v / 6);
  const r = asRatio(Math.round(x * 6), Math.round(y * 6));
  return ask({
    context: `In a regular polygon, the ratio of an exterior angle to an interior angle is <b>${r}</b>.`,
    q: 'The number of sides of the polygon is',
    opts: options(String(n), [
      { v: String(Math.round(360 / int)), why: 'This divides 360° by the INTERIOR angle. Only the exterior angles sum to 360°.' },
      { v: String(n + 2), why: '' },
      { v: String(Math.max(3, n - 2)), why: '' },
      { v: String(n * 2), why: '' },
    ], i => String(n + 3 + i)),
    why: `Exterior + interior = 180°. In the ratio ${r} the parts total ${r.split(' : ').map(Number).reduce((p, q) => p + q, 0)},
      so the exterior angle is ${ext}°.<br>
      Exterior angles of any polygon add to 360°, so n = 360/${ext} = <b>${n}</b>.`,
    hardness: 1.8,
    concept: 'ratio-one-part', conceptLabel: 'A ratio that fixes a shape',
    source: 'Shape of RAS 2015, Q116',
  });
};

export const PERCENT_GENERATORS = [
  gen('ras-pct-election', 'percent', 'quants:2', 'pct-successive', 'Chained percentages', election),
  gen('ras-pct-change', 'percent', 'quants:2', 'pct-reverse', 'Percentage change', changeBetween),
  gen('ras-pct-two', 'percent', 'quants:2', 'trade-two-articles', 'Equal gain and loss', twoArticles),
  gen('ras-pct-polygon', 'percent', 'quants:2', 'ratio-one-part', 'Ratio fixing a shape', polygonAngles),
];

/* ============================================================
   Wider coverage — RAS 2023 Q92 (a fraction used upside down),
   RAS 2024 Q92 (a price cut buys more), RAS 2023 Q91 (a ratio that shifts
   when the same amount is added to each share).
   ============================================================ */

/* Multiplying by a/b instead of b/a. The error is measured against what the
   answer SHOULD have been, which is the half candidates get wrong. */
const fractionFlip = (R, tier) => {
  const PAIRS = [[3, 5], [2, 3], [4, 7], [5, 8], [3, 4], [5, 6], [2, 7]];
  const [a, b] = R.pick(PAIRS);
  /* correct = x·b/a, obtained = x·a/b; error = (b/a − a/b)/(b/a) = (b² − a²)/b² */
  const err = round((b * b - a * a) / (b * b) * 100, 2);
  return ask({
    context: `A student had to multiply a number by <b>${b}/${a}</b>, but multiplied it by
      <b>${a}/${b}</b> instead.`,
    q: 'What is the percentage error in the result?',
    opts: options(`${err}%`, [
      { v: `${round((b * b - a * a) / (a * a) * 100, 2)}%`, why: `That measures the error against the WRONG answer. A percentage error is always measured against the correct value.` },
      { v: `${round((b - a) / b * 100, 2)}%`, why: 'That compares the fractions themselves rather than the results they produce.' },
      { v: `${round(a / b * 100, 2)}%`, why: '' },
      { v: `${round(100 - err, 2)}%`, why: '' },
    ], i => `${round(err + 4 * (i + 1), 2)}%`),
    why: `Take the number as 1. It should have become ${b}/${a} = ${round(b / a, 4)};
      it became ${a}/${b} = ${round(a / b, 4)}.<br>
      Error = ${round(b / a - a / b, 4)}, measured against the correct ${round(b / a, 4)}:<br>
      (${b}² − ${a}²)/${b}² = ${b * b - a * a}/${b * b} = <b>${err}%</b>.`,
    hardness: 2.1,
    concept: 'pct-reverse', conceptLabel: 'Error against the right value',
    source: 'Shape of RAS 2023, Q92',
  });
};

/* A price cut, and the extra quantity it buys. The reduced price falls out in
   one line, which is why the paper likes it. */
const priceCut = (R, tier) => {
  const r = R.pick(byTier(tier, [10, 20, 25], [10, 20, 25, 15], [12.5, 15, 21]));
  const reduced = R.pick(byTier(tier, [12, 15, 20], [15, 16, 20, 24], [24, 25, 30, 40]));
  /* The quantity a shopper is told about is a number a shopper would say —
     "10.5 kg more", never "10.42 kg more". So the clean numbers are the price
     and the quantity, and the money is derived from them. */
  const extra = R.pick([2, 2.5, 3, 4, 5, 6, 7.5, 10, 10.5, 12]);
  const money = 100 * reduced * extra / r;
  if (!Number.isInteger(money) || money % 10 !== 0 || money > 12000) return null;
  const original = round(reduced / (1 - r / 100), 2);
  if (Math.round(original * 100) !== original * 100) return null;
  return ask({
    context: `A reduction of <b>${r}%</b> in the price of rice lets a buyer get <b>${extra} kg more</b>
      for <b>₹${money}</b>.`,
    q: 'What is the reduced price per kg?',
    opts: options(`₹${reduced}`, [
      { v: `₹${original}`, why: 'That is the ORIGINAL price, before the cut.' },
      { v: `₹${round(money / extra, 2)}`, why: 'That divides the money by the extra quantity alone, as though the buyer got nothing before.' },
      { v: `₹${round(reduced * (1 - r / 100), 2)}`, why: 'That applies the cut twice.' },
      { v: `₹${reduced + 5}`, why: '' },
    ], i => `₹${round(reduced + 2 * (i + 1) + 1, 2)}`),
    why: `The money is fixed, so the extra rice is bought with what the cut saved:
      ${r}% of ₹${money} = <b>₹${round(money * r / 100, 2)}</b>.<br>
      That saving buys the extra ${extra} kg at the NEW price, so the new price is
      ₹${round(money * r / 100, 2)} ÷ ${extra} = <b>₹${reduced}</b> per kg.<br>
      (The old price was ₹${reduced} ÷ ${round(1 - r / 100, 3)} = ₹${original}.)`,
    hardness: 1.4 + (Number.isInteger(r) ? 0 : 0.8) + money / 6000 + (Number.isInteger(extra) ? 0 : 0.4),
    concept: 'pct-reverse', conceptLabel: 'A cut, and what it buys',
    source: 'Shape of RAS 2024, Q92',
  });
};

/* The same amount added to each share changes the ratio — RAS 2023 Q91. */
const ratioShift = (R, tier) => {
  const PAIRS = [[[3, 4, 5], [5, 6, 7]], [[2, 3, 4], [4, 5, 6]], [[1, 2, 3], [3, 4, 5]], [[4, 5, 6], [6, 7, 8]]];
  const [before, after] = R.pick(PAIRS);
  const add = R.pick([1000, 2000, 4000, 5000, 3000]);
  /* (b0·k + c)/(b2·k + c) = a0/a2 … solve for k from the first and last shares. */
  const k = (add * (after[0] - after[2]) ) / (after[2] * before[0] - after[0] * before[2]);
  if (!Number.isFinite(k) || k <= 0 || Math.round(k) !== k) return null;
  const shares = before.map(x => x * k);
  const check = shares.map(x => x + add);
  const ok = check[0] * after[1] === check[1] * after[0] && check[1] * after[2] === check[2] * after[1];
  if (!ok) return null;
  const who = ['A', 'B', 'C'];
  const idx = R.int(0, 2);
  return ask({
    context: `Three students A, B and C receive prize money in the ratio <b>${before.join(' : ')}</b>.
      The principal then gives <b>₹${add.toLocaleString('en-IN')}</b> more to each of them, after which
      their amounts are in the ratio <b>${after.join(' : ')}</b>.`,
    q: `How much did <b>${who[idx]}</b> receive originally?`,
    opts: options(`₹${shares[idx].toLocaleString('en-IN')}`, [
      { v: `₹${check[idx].toLocaleString('en-IN')}`, why: 'That is the amount AFTER the extra money was added.' },
      { v: `₹${shares[(idx + 1) % 3].toLocaleString('en-IN')}`, why: `That is ${who[(idx + 1) % 3]}'s original share.` },
      { v: `₹${(shares[idx] + add / 2).toLocaleString('en-IN')}`, why: '' },
      { v: `₹${(before[idx] * add).toLocaleString('en-IN')}`, why: '' },
    ], i => `₹${(shares[idx] + add * (i + 1)).toLocaleString('en-IN')}`),
    why: `Let the shares be ${before.map(x => `${x}k`).join(', ')}. After ₹${add.toLocaleString('en-IN')} each they are
      ${before.map(x => `${x}k + ${add}`).join(', ')}, and those are in the ratio ${after.join(' : ')}.<br>
      Taking the first and the last: (${before[0]}k + ${add}) × ${after[2]} = (${before[2]}k + ${add}) × ${after[0]}
      → k = <b>${k.toLocaleString('en-IN')}</b>.<br>
      So the original shares were ${shares.map(x => `₹${x.toLocaleString('en-IN')}`).join(', ')}, and
      ${who[idx]} received <b>₹${shares[idx].toLocaleString('en-IN')}</b>.`,
    hardness: 2.5,
    concept: 'ratio-difference', conceptLabel: 'A ratio that shifts',
    source: 'Shape of RAS 2023, Q91',
  });
};

PERCENT_GENERATORS.push(
  gen('ras-pct-flip', 'percent', 'quants:2', 'pct-reverse', 'Fractions used upside down', fractionFlip),
  gen('ras-pct-cut', 'percent', 'quants:2', 'pct-reverse', 'A cut, and what it buys', priceCut),
  gen('ras-pct-shift', 'percent', 'quants:2', 'ratio-difference', 'Ratios that shift', ratioShift),
);
