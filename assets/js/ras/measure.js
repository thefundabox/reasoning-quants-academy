/* Averages, mensuration and data interpretation — RAS 2021 Q111/Q116,
   2018 Q119-121, and the average-changes staple. */
import { gen, ask, options, byTier, inr, rupees, round, NAMES } from './kit.js';
import { pieFig, tableFig } from '../generators/figures.js';

/* An average that moves when one person joins or leaves: the paper's
   favourite, because the wrong instinct (average the averages) is so quick. */
const averageShift = (R, tier) => {
  const n = R.int(byTier(tier, 8, 10, 12), byTier(tier, 12, 20, 30));
  const avg = R.int(byTier(tier, 30, 40, 45), byTier(tier, 50, 60, 70));
  const change = R.pick([1, 1.5, 2, 2.5, 3]) * R.pick([1, -1]);
  const joins = R.pick([true, false]);
  /* New average = avg + change. The newcomer's value follows from the totals. */
  const newAvg = avg + change;
  const value = joins ? newAvg * (n + 1) - avg * n : avg * n - newAvg * (n - 1);
  if (value <= 0 || Math.round(value * 2) !== value * 2) return null;
  /* Arithmetically fine, and nonsense as a question: a group of 19 whose
     average rises 2.5 kg when somebody leaves says that person weighed 3 kg.
     A quarter of the draws were like that. The numbers must describe people. */
  if (value < 30 || value > 120) return null;
  const who = R.pick(NAMES);
  return ask({
    context: `The average weight of <b>${n} students</b> is <b>${avg} kg</b>.`,
    q: joins
      ? `When ${who} joins them, the average ${change > 0 ? 'rises' : 'falls'} by <b>${Math.abs(change)} kg</b>. What is ${who}'s weight?`
      : `When ${who} leaves the group, the average ${change > 0 ? 'rises' : 'falls'} by <b>${Math.abs(change)} kg</b>. What was ${who}'s weight?`,
    opts: options(`${round(value, 1)} kg`, [
      { v: `${round(avg + change, 1)} kg`, why: 'That is the new average, not the weight of the one person who changed it.' },
      { v: `${round(avg + change * n, 1)} kg`, why: `The change is spread over ${joins ? n + 1 : n - 1} people, not ${n}.` },
      { v: `${round(avg - change, 1)} kg`, why: '' },
      { v: `${round(value + 2, 1)} kg`, why: '' },
    ], i => `${round(value + 3 + i * 2, 1)} kg`),
    why: `Work in TOTALS, never in averages.<br>
      Before: ${n} × ${avg} = <b>${round(avg * n, 1)} kg</b>.
      After: ${joins ? n + 1 : n - 1} × ${round(newAvg, 2)} = <b>${round(newAvg * (joins ? n + 1 : n - 1), 1)} kg</b>.<br>
      The difference is ${who}'s weight: <b>${round(value, 1)} kg</b>.`,
    /* Bigger groups and a half-kilogram shift are what the tier moves, so the
       difficulty claim has to be made of those and not of a constant. */
    hardness: 0.8 + n / 20 + (Math.abs(change) % 1 ? 0.5 : 0) + (joins ? 0 : 0.4),
    concept: 'centre-totals', conceptLabel: 'Averages move in totals',
    source: 'RAS staple — averages block',
  });
};

/* RAS 2021 Q116: paint the WALLS of a room, minus the doors and windows, at a
   rate per square metre. Two traps: including the floor, and forgetting the
   openings. */
const paintWalls = (R, tier) => {
  const l = R.int(8, byTier(tier, 12, 15, 18)), w = R.int(5, byTier(tier, 8, 10, 12)), h = R.pick([3, 3.5, 4, 4.5]);
  const doors = R.int(1, 2), dw = R.pick([1, 1.2]), dh = R.pick([2, 2.5]);
  const wins = R.int(1, byTier(tier, 2, 2, 3)), ww = R.pick([1, 1.5]), wh = R.pick([1, 1.5]);
  const rate = R.pick([12, 15, 18, 20, 25]);
  const walls = 2 * (l + w) * h;
  const openings = doors * dw * dh + wins * ww * wh;
  const net = walls - openings;
  const key = net * rate;
  if (Math.round(key) !== key) return null;
  return ask({
    context: `A room is <b>${l} m long, ${w} m wide and ${h} m high</b>. It has <b>${doors} door${doors > 1 ? 's' : ''}</b>
      of ${dw} m × ${dh} m and <b>${wins} window${wins > 1 ? 's' : ''}</b> of ${ww} m × ${wh} m.`,
    q: `At <b>${rupees(rate)} per square metre</b>, what does it cost to paint the walls?`,
    opts: options(rupees(key), [
      { v: rupees(walls * rate), why: 'The doors and windows are not painted — take their area out first.' },
      { v: rupees((walls + l * w) * rate), why: 'That paints the ceiling as well. The question says walls.' },
      { v: rupees((walls + 2 * l * w - openings) * rate), why: 'That adds floor and ceiling.' },
      { v: rupees(round((net + openings / 2) * rate)), why: '' },
    ], i => rupees(key + 25 * (i + 1))),
    why: `Walls (four sides): 2 × (${l} + ${w}) × ${h} = <b>${walls} m²</b>.<br>
      Openings: ${doors} × ${dw} × ${dh} + ${wins} × ${ww} × ${wh} = <b>${openings} m²</b>.<br>
      Painted area ${walls} − ${openings} = ${net} m², at ${rupees(rate)} = <b>${rupees(key)}</b>.`,
    hardness: 1.8 + (wins > 2 ? 0.5 : 0),
    concept: 'area-perimeter-independent', conceptLabel: 'Walls, minus the openings',
    source: 'Shape of RAS 2021, Q116',
  });
};

/* RAS 2021 Q111: a pie chart of percentages, one sector's rupee value given,
   another asked for. The whole question is one proportion. */
const pieValue = (R, tier) => {
  const heads = ['Paper', 'Printing', 'Royalty', 'Binding', 'Promotion', 'Transport'];
  const parts = R.shuffle([20, 20, 15, 15, 18, 12]).slice(0, 5);
  const sum = parts.reduce((a, b) => a + b, 0);
  const pcts = [...parts, 100 - sum];
  if (pcts[5] < 8) return null;
  const slices = heads.map((label, i) => ({ label, value: pcts[i] }));
  const [from, to] = R.some([0, 1, 2, 3, 4, 5], 2);
  const unit = R.int(byTier(tier, 300, 600, 900), byTier(tier, 900, 1800, 2600));
  const given = pcts[from] * unit;
  const key = pcts[to] * unit;
  return ask({
    context: `${pieFig(slices, { caption: 'Percentage of the cost of publishing a book', hot: to })}`,
    q: `If the publisher pays <b>${rupees(given)}</b> under <b>${heads[from]}</b>,
      how much is paid under <b>${heads[to]}</b>?`,
    opts: options(rupees(key), [
      { v: rupees(round(given * pcts[from] / pcts[to])), why: 'The ratio is the wrong way up — multiply by the target share over the given share.' },
      { v: rupees(round(given * 100 / pcts[from])), why: 'That is the total cost of publishing, not the one head asked for.' },
      { v: rupees(round(given + (pcts[to] - pcts[from]) * 100)), why: '' },
      { v: rupees(key + unit), why: '' },
    ], i => rupees(key + unit * (i + 2))),
    why: `${heads[from]} is ${pcts[from]}% and costs ${rupees(given)}, so 1% costs
      ${rupees(given)} ÷ ${pcts[from]} = <b>${rupees(unit)}</b>.<br>
      ${heads[to]} is ${pcts[to]}%, so it costs ${pcts[to]} × ${rupees(unit)} = <b>${rupees(key)}</b>.`,
    hardness: 1 + (pcts[from] > pcts[to] ? 0.3 : 0) + String(given).length / 6,
    concept: 'pie-amount', conceptLabel: 'One sector from another',
    source: 'Shape of RAS 2021, Q111',
  });
};

/* RAS 2018 Q119: which row of a table grew LEAST in percentage terms. The
   trap is comparing the raw increases, where the biggest number wins. */
const tableGrowth = (R, tier) => {
  const kinds = R.some(['Buses', 'Trucks', 'Scooters', 'Cars', 'Taxis', 'Tractors'], byTier(tier, 4, 4, 5));
  const y1 = R.pick([1995, 2000, 2005]), y2 = y1 + 10;
  const rows = kinds.map(k => {
    const a = R.int(20, 400), b = Math.round(a * (1 + R.int(byTier(tier, 20, 15, 12), 160) / 100));
    return [k, inr(a), inr(b), a, b];
  });
  const pct = rows.map(r => (r[4] - r[3]) * 100 / r[3]);
  const min = Math.min(...pct), max = Math.max(...pct);
  if (pct.filter(p => p === min).length > 1) return null;
  /* The row with the smallest percentage rise must NOT also have the smallest
     raw rise, or the wrong method gets the right answer and teaches nothing. */
  const raw = rows.map(r => r[4] - r[3]);
  const leastPct = pct.indexOf(min), leastRaw = raw.indexOf(Math.min(...raw));
  if (leastPct === leastRaw) return null;
  return ask({
    context: tableFig(['Vehicle', `${y1}`, `${y2}`],
      rows.map(r => ({ label: r[0], cells: [r[1], r[2]] })),
      { caption: 'Vehicles registered in a city' }),
    q: `Which vehicle type showed the <b>smallest percentage increase</b> between ${y1} and ${y2}?`,
    opts: options(rows[leastPct][0], rows.map((r, i) => i === leastPct ? null : ({
      v: r[0],
      why: `${r[0]} rose ${round(pct[i], 1)}% — more than ${rows[leastPct][0]}'s ${round(min, 1)}%.`,
    })).filter(Boolean)),
    why: `A percentage rise is measured against the EARLIER figure, so the smallest raw increase
      need not be the smallest percentage one:<br>
      ${rows.map((r, i) => `${r[0]}: (${r[2]} − ${r[1]})/${r[1]} = <b>${round(pct[i], 1)}%</b>`).join('<br>')}<br>
      Smallest: <b>${rows[leastPct][0]}</b>. (${rows[leastRaw][0]} had the smallest increase in numbers —
      which is the trap.)`,
    hardness: 1.7 + kinds.length / 5,
    concept: 'di-growth', conceptLabel: 'Percentage growth from a table',
    source: 'Shape of RAS 2018, Q119',
  });
};

export const MEASURE_GENERATORS = [
  gen('ras-avg-shift', 'measure', 'quants:5', 'centre-totals', 'Averages that move', averageShift),
  gen('ras-men-paint', 'measure', 'quants:4', 'area-perimeter-independent', 'Walls and openings', paintWalls),
  gen('ras-di-pie', 'measure', 'quants:7', 'pie-amount', 'Pie chart values', pieValue),
  gen('ras-di-table', 'measure', 'quants:7', 'di-growth', 'Growth in a table', tableGrowth),
];
