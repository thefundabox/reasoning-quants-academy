/* ============================================================
   Statistics — RAS 2024 Q96 (a mean corrected after wrong readings),
   RAS 2023 Q95 (who scored fastest, from a table), and the median/mode
   relation the papers lean on.
   ============================================================ */
import { gen, ask, options, byTier, round, inr, NAMES } from './kit.js';
import { tableFig } from '../generators/figures.js';

/* A mean that has to be repaired. Averages are repaired in TOTALS, never by
   averaging the corrections — which is the mistake on offer. */
const correctedMean = (R, tier) => {
  const n = R.pick([50, 100, 40, 80, 120]);
  const mean = R.int(30, 70);
  const k = byTier(tier, 2, 3, 3);
  const wrong = Array.from({ length: k }, () => R.int(10, 60));
  const right = wrong.map(w => w + R.int(5, 40));
  const diff = right.reduce((a, b) => a + b, 0) - wrong.reduce((a, b) => a + b, 0);
  const key = round(mean + diff / n, 2);
  if (!Number.isFinite(key)) return null;
  return ask({
    context: `The mean of <b>${n} observations</b> was calculated as <b>${mean}</b>. It was later found that
      ${k} readings taken as <b>${wrong.join(', ')}</b> were actually <b>${right.join(', ')}</b>.`,
    q: 'What is the corrected mean?',
    opts: options(String(key), [
      { v: String(round(mean + diff, 2)), why: 'That adds the whole correction to the mean. It has to be shared over all ' + n + ' observations.' },
      { v: String(round(mean + diff / k, 2)), why: `That spreads the correction over the ${k} wrong readings only. Every observation is part of the mean.` },
      { v: String(round(mean - diff / n, 2)), why: 'The corrected readings are larger, so the mean must rise, not fall.' },
      { v: String(round(key + 1, 2)), why: '' },
    ], i => String(round(key + 0.5 * (i + 2), 2))),
    why: `Work in totals. Wrong total = ${n} × ${mean} = <b>${inr(n * mean)}</b>.<br>
      The readings were understated by (${right.join(' + ')}) − (${wrong.join(' + ')}) = <b>${diff}</b>,
      so the true total is ${inr(n * mean + diff)}.<br>
      Corrected mean = ${inr(n * mean + diff)} ÷ ${n} = <b>${key}</b>.`,
    hardness: 1.4 + k / 3,
    concept: 'centre-totals', conceptLabel: 'Repairing a mean',
    source: 'Shape of RAS 2024, Q96',
  });
};

/* Fastest scorer from a table — RAS 2023 Q95. A rate question disguised as a
   reading question: the biggest total is rarely the fastest. */
const fastestRate = (R, tier) => {
  const who = R.some(NAMES, byTier(tier, 4, 4, 5));
  const rows = who.map(name => {
    const r1 = R.int(5, 90), b1 = R.int(10, 150), r2 = R.int(5, 90), b2 = R.int(10, 160);
    return { name, r1, b1, r2, b2, rate: (r1 + r2) / (b1 + b2), runs: r1 + r2 };
  });
  const best = rows.reduce((a, b) => (b.rate > a.rate ? b : a));
  const most = rows.reduce((a, b) => (b.runs > a.runs ? b : a));
  /* If the biggest scorer is also the fastest, the wrong method gets the right
     answer and the question teaches nothing. */
  if (best.name === most.name) return null;
  if (rows.filter(r => Math.abs(r.rate - best.rate) < 0.02).length > 1) return null;
  return ask({
    context: tableFig(['Player', '1st innings runs', '1st innings balls', '2nd innings runs', '2nd innings balls'],
      rows.map(r => ({ label: r.name, cells: [r.r1, r.b1, r.r2, r.b2] })),
      { caption: 'Runs scored in a two-innings match' }),
    q: 'Who scored <b>fastest</b> across the match?',
    opts: options(best.name, rows.filter(r => r.name !== best.name).map(r => ({
      v: r.name,
      why: `${r.name} scored ${r.runs} runs off ${r.b1 + r.b2} balls — ${round(r.rate * 100, 1)} runs per 100 balls, below ${best.name}'s ${round(best.rate * 100, 1)}.`,
    }))),
    why: `Fastest means runs PER BALL, so add both innings for each player and divide:<br>
      ${rows.map(r => `${r.name}: ${r.runs} ÷ ${r.b1 + r.b2} = <b>${round(r.rate, 3)}</b>`).join('<br>')}<br>
      <b>${best.name}</b> is fastest. (${most.name} scored the most runs — which is the trap.)`,
    hardness: 1.6 + who.length / 5,
    concept: 'di-compare-not-compute', conceptLabel: 'Rate, not total',
    source: 'Shape of RAS 2023, Q95',
  });
};

/* Mean, median and mode of a small set, and the empirical relation between
   them — the other half of what this chapter is asked. */
const centreThree = (R, tier) => {
  const n = byTier(tier, 7, 9, 11);
  const data = Array.from({ length: n }, () => R.int(10, 40));
  /* Force exactly one mode, or "the mode" names nothing. */
  const modeVal = R.pick(data);
  data[R.int(0, n - 1)] = modeVal;
  data[R.int(0, n - 1)] = modeVal;
  const counts = {};
  data.forEach(d => { counts[d] = (counts[d] || 0) + 1; });
  const top = Math.max(...Object.values(counts));
  if (Object.values(counts).filter(c => c === top).length !== 1) return null;
  const mode = +Object.keys(counts).find(k => counts[k] === top);
  const sorted = [...data].sort((a, b) => a - b);
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const mean = round(data.reduce((a, b) => a + b, 0) / n, 2);
  const which = R.pick(['median', 'mode', 'mean']);
  const key = which === 'median' ? median : which === 'mode' ? mode : mean;
  if (new Set([median, mode, mean]).size < 3) return null;
  return ask({
    context: `A set of ${n} readings: <b>${data.join(', ')}</b>.`,
    q: `What is the <b>${which}</b> of these readings?`,
    opts: options(String(key), [
      { v: String(which === 'median' ? mode : median), why: which === 'median' ? 'That is the mode — the value that repeats.' : 'That is the median — the middle value once they are sorted.' },
      { v: String(which === 'mean' ? median : mean), why: which === 'mean' ? 'That is the median, not the average.' : 'That is the mean.' },
      { v: String(round(key + 1, 2)), why: '' },
      { v: String(sorted[n - 1]), why: 'That is the largest reading.' },
    ], i => String(round(key + 2 + i, 2))),
    why: `Sorted: ${sorted.join(', ')}.<br>
      Median (middle) = <b>${median}</b>; mode (most frequent) = <b>${mode}</b>, appearing ${top} times;
      mean = ${data.reduce((a, b) => a + b, 0)} ÷ ${n} = <b>${mean}</b>.<br>
      The one asked for is the <b>${which}</b>: ${key}.`,
    hardness: 1.2 + n / 8,
    concept: 'centre-which', conceptLabel: 'Which centre is asked for',
    source: 'RAS staple — statistics block',
  });
};

export const STAT_GENERATORS = [
  gen('ras-stat-mean', 'measure', 'quants:5', 'centre-totals', 'Repairing a mean', correctedMean),
  gen('ras-stat-rate', 'measure', 'quants:7', 'di-compare-not-compute', 'Rate from a table', fastestRate),
  gen('ras-stat-centre', 'measure', 'quants:5', 'centre-which', 'Mean, median, mode', centreThree),
];
