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
