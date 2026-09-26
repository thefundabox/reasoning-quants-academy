/* Ratio, mixtures and shares — RAS 2016 Q112, 2018 Q114/Q115, 2021 Q120. */
import { gen, ask, options, byTier, asRatio, ratioOf, inr, rupees, round, NAMES } from './kit.js';

/* RAS 2016 Q112: "In a 60-litre mixture the ratio of milk to water is 5:3. To
   make it 1:2, how much water must be added?" — the trap is solving for the
   new TOTAL and reporting it instead of the water added. */
const addWater = (R, tier) => {
  const [a, b] = R.pick([[5, 3], [7, 3], [4, 1], [5, 2], [3, 1], [7, 5]]);
  const parts = a + b;
  const total = parts * R.int(byTier(tier, 5, 8, 11), byTier(tier, 9, 14, 20));
  const milk = total * a / parts, water = total - milk;
  /* Milk is unchanged, so the new total is fixed by the target ratio. */
  const [ta, tb] = R.pick([[1, 2], [2, 3], [1, 1], [3, 5], [1, 3]]);
  const newTotal = milk * (ta + tb) / ta;
  const added = newTotal - total;
  if (added <= 0 || added % 0.5 !== 0) return null;
  return ask({
    context: `In a <b>${total} litre</b> mixture, milk and water are in the ratio <b>${a} : ${b}</b>.`,
    q: `How much water must be added to make the ratio of milk to water <b>${ta} : ${tb}</b>?`,
    opts: options(`${round(added)} litres`, [
      { v: `${round(newTotal)} litres`, why: 'That is the new TOTAL volume, not the water you added. Subtract the volume you started with.' },
      { v: `${round(water + added)} litres`, why: 'That is all the water the mixture ends up holding, including what was already in it.' },
      { v: `${round(total * tb / (ta + tb) - water)} litres`, why: 'This treats the new ratio as shares of the OLD total. Adding water changes the total.' },
      { v: `${round(added * 2)} litres`, why: '' },
    ]),
    why: `Milk never changes: ${milk} L. For milk : water = ${ta} : ${tb}, milk is ${ta} of ${ta + tb} parts,
      so the new total is ${milk} × ${ta + tb}/${ta} = <b>${round(newTotal)} L</b>.
      Water added = ${round(newTotal)} − ${total} = <b>${round(added)} L</b>.`,
    hardness: 0.8 + parts / 4 + (ta === 1 ? 0 : 1) + total / 60,
    concept: 'ratio-one-part', conceptLabel: 'One part of a ratio',
    source: 'Shape of RAS 2016, Q112',
  });
};

/* RAS 2018 Q114: two alloys mixed in EQUAL quantities. The trap is averaging
   the two ratios term by term, which is only right when the parts happen to
   match. */
const twoAlloys = (R, tier) => {
  const [a1, b1] = R.pick([[7, 2], [5, 3], [3, 1], [5, 2], [4, 3]]);
  const [a2, b2] = R.pick([[7, 11], [2, 3], [1, 4], [3, 7], [5, 9]]);
  if (a1 * b2 === a2 * b1) return null;
  const s1 = a1 + b1, s2 = a2 + b2;
  const L = s1 * s2;                                   // one equal quantity of each
  const gold = L * a1 / s1 + L * a2 / s2;
  const copper = 2 * L - gold;
  const [g, c] = ratioOf(gold, copper);
  const naive = ratioOf(a1 + a2, b1 + b2);
  return ask({
    context: `Two alloys are made from gold and copper in the ratios <b>${a1} : ${b1}</b> and <b>${a2} : ${b2}</b>.`,
    q: `Equal quantities of the two alloys are melted together. In the new alloy, gold : copper is`,
    opts: options(`${g} : ${c}`, [
      { v: naive.join(' : '), why: 'Ratios cannot be added term by term — the two alloys are cut into different numbers of parts.' },
      { v: `${c} : ${g}`, why: 'Right numbers, wrong way round: the question asks gold : copper.' },
      { v: asRatio(a1 * a2, b1 * b2), why: 'Multiplying the ratios has no meaning here.' },
      { v: asRatio(gold + 1, copper), why: '' },
    ]),
    why: `Take ${L} g of each — a common multiple of ${s1} and ${s2}, so both divide evenly.<br>
      Gold: ${L} × ${a1}/${s1} + ${L} × ${a2}/${s2} = ${L * a1 / s1} + ${L * a2 / s2} = <b>${gold} g</b>.<br>
      Copper: ${2 * L} − ${gold} = <b>${copper} g</b>. Ratio = <b>${g} : ${c}</b>.`,
    hardness: 1.5 + (s1 * s2) / 30,
    concept: 'ratio-chain', conceptLabel: 'Combining two ratios',
    source: 'Shape of RAS 2018, Q114',
  });
};

/* RAS 2018 Q115: workers in ratio 9:4:1, wages in ratio 8:5:3, one count
   given, total wage bill given — find one person's daily wage. */
const wageRatio = (R, tier) => {
  const [m, w, c] = R.pick([[9, 4, 1], [6, 5, 2], [8, 3, 1], [5, 4, 3], [7, 2, 1]]);
  const [wm, ww, wc] = R.pick([[8, 5, 3], [6, 5, 4], [10, 7, 5], [9, 6, 4]]);
  const k = R.int(byTier(tier, 5, 10, 15), byTier(tier, 12, 25, 40));   // people per ratio part
  const women = w * k;
  const unit = R.int(byTier(tier, 2, 3, 4), byTier(tier, 5, 9, 14));    // rupees per wage part
  const total = k * unit * (m * wm + w * ww + c * wc);
  const childWage = wc * unit;
  return ask({
    context: `At a site, men, women and children work in the ratio <b>${m} : ${w} : ${c}</b> and their daily wages
      are in the ratio <b>${wm} : ${ww} : ${wc}</b>.`,
    q: `If <b>${women} women</b> work there and the total daily wage bill is <b>${rupees(total)}</b>,
      the daily wage of one child is`,
    opts: options(rupees(childWage), [
      { v: rupees(ww * unit), why: "That is a woman's wage — the question asks for a child's." },
      { v: rupees(wm * unit), why: "That is a man's wage." },
      { v: rupees(round(total / (k * (m + w + c)))), why: 'That is the average wage per person, not a child’s wage.' },
      { v: rupees(childWage * 2), why: '' },
    ]),
    why: `${women} women means each ratio part is ${women}/${w} = <b>${k} people</b>:
      ${m * k} men, ${women} women, ${c * k} children.<br>
      Let the wage parts be ₹x each. Total = ${m * k}·${wm}x + ${women}·${ww}x + ${c * k}·${wc}x
      = ${k * (m * wm + w * ww + c * wc)}x = ${inr(total)}, so x = <b>₹${unit}</b>.<br>
      A child gets ${wc}x = <b>${rupees(childWage)}</b>.`,
    hardness: 2 + (m + w + c) / 8,
    concept: 'ratio-difference', conceptLabel: 'Ratios with two scales at once',
    source: 'Shape of RAS 2018, Q115',
  });
};

/* RAS 2021 Q120: coins of three denominations in a ratio, total value given. */
const coins = (R, tier) => {
  const [r1, r2, r3] = R.pick([[25, 9, 5], [5, 3, 2], [8, 5, 3], [12, 7, 4], [6, 5, 4]]);
  const denom = R.pick([[1, 0.5, 0.25], [1, 0.5, 0.1], [2, 1, 0.5], [5, 2, 1]]);
  const perPart = r1 * denom[0] + r2 * denom[1] + r3 * denom[2];
  const k = R.int(byTier(tier, 20, 60, 90), byTier(tier, 60, 150, 260));
  const total = perPart * k;
  if (Math.round(total) !== total) return null;
  const want = R.int(0, 2);
  const counts = [r1 * k, r2 * k, r3 * k];
  const label = ['first', 'second', 'third'][want];
  const name = d => (d >= 1 ? `₹${d}` : `${Math.round(d * 100)} paise`);
  return ask({
    context: `A bag holds coins of <b>${name(denom[0])}</b>, <b>${name(denom[1])}</b> and <b>${name(denom[2])}</b>
      in the ratio <b>${r1} : ${r2} : ${r3}</b>.`,
    q: `If the total value of the coins is <b>${rupees(total)}</b>, the number of ${name(denom[want])} coins is`,
    opts: options(inr(counts[want]), [
      { v: inr(counts[(want + 1) % 3]), why: `That is the count of ${name(denom[(want + 1) % 3])} coins.` },
      { v: inr(Math.round(total / denom[want])), why: 'That would be right only if the bag held nothing else.' },
      { v: inr(counts[0] + counts[1] + counts[2]), why: 'That is every coin in the bag.' },
      { v: inr(counts[want] + k), why: '' },
    ]),
    why: `Let the counts be ${r1}k, ${r2}k, ${r3}k. Value =
      ${r1}k×${denom[0]} + ${r2}k×${denom[1]} + ${r3}k×${denom[2]} = ${perPart}k = ${inr(total)},
      so k = <b>${k}</b>. The ${label} count is ${[r1, r2, r3][want]}k = <b>${inr(counts[want])}</b>.`,
    hardness: 1.4 + (denom[2] < 0.25 ? 1 : 0) + String(total).length / 4,
    concept: 'ratio-one-part', conceptLabel: 'Ratio parts from a total value',
    source: 'Shape of RAS 2021, Q120',
  });
};

export const MIXTURE_GENERATORS = [
  gen('ras-mix-water', 'mixtures', 'quants:2', 'ratio-one-part', 'Changing a mixture', addWater),
  gen('ras-mix-alloys', 'mixtures', 'quants:2', 'ratio-chain', 'Combining two ratios', twoAlloys),
  gen('ras-mix-wages', 'mixtures', 'quants:2', 'ratio-difference', 'Two ratios at once', wageRatio),
  gen('ras-mix-coins', 'mixtures', 'quants:2', 'ratio-one-part', 'Coins in a ratio', coins),
];
