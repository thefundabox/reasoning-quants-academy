/* Statement-based reasoning — RAS 2015 Q112, 2016 Q101/Q103/Q104,
   2018 Q102-105, 2021 Q121/Q122/Q126. About a fifth of the reasoning block.

   The syllogisms are SOLVED, not labelled: a model checker decides which
   conclusions follow, so a premise pair can be drawn at random and the key is
   still right. The judgement questions that share this block — assumption,
   course of action, argument, conclusion — are a written pool in
   judgement.js, for the reasons set out at the top of that file.
   ============================================================ */
import { gen, ask, options, byTier } from './kit.js';

/* ---------------- syllogism, by model checking ----------------
   Terms are subsets of a small universe. Exam convention, which is what the
   RPSC key follows: every term is non-empty, "all A are B" allows A = B, and
   "some" means "at least one, possibly all". A conclusion FOLLOWS when no
   model satisfies the premises and denies it. */
const holds = (claim, m) => {
  const [kind, a, b] = claim;
  const A = m[a], B = m[b];
  if (kind === 'all') return A.every(x => B.includes(x));
  if (kind === 'no') return !A.some(x => B.includes(x));
  if (kind === 'some') return A.some(x => B.includes(x));
  return A.some(x => !B.includes(x));                 // some-not
};

function models(terms, universe = 4) {
  const subsets = [];
  for (let mask = 1; mask < (1 << universe); mask++) {        // non-empty terms
    subsets.push([...Array(universe).keys()].filter(i => mask & (1 << i)));
  }
  const out = [];
  const walk = (i, acc) => {
    if (i === terms.length) { out.push({ ...acc }); return; }
    for (const s of subsets) walk(i + 1, { ...acc, [terms[i]]: s });
  };
  walk(0, {});
  return out;
}

/** Does `conclusion` follow from `premises`? Pure, and the harness re-derives it. */
export function follows(premises, conclusion, terms) {
  for (const m of models(terms)) {
    if (premises.every(p => holds(p, m)) && !holds(conclusion, m)) return false;
  }
  return true;
}

const say = ([kind, a, b]) => ({
  all: `All ${a} are ${b}.`, no: `No ${a} are ${b}.`,
  some: `Some ${a} are ${b}.`, 'some-not': `Some ${a} are not ${b}.`,
}[kind]);

const NOUNS = [['branches', 'flowers', 'leaves'], ['pens', 'books', 'papers'], ['fruits', 'trees', 'plants'],
  ['doctors', 'teachers', 'writers'], ['metals', 'solids', 'conductors'], ['cities', 'ports', 'markets'],
  ['birds', 'animals', 'hunters'], ['chairs', 'tables', 'desks']];

const syllogism = (R, tier) => {
  const [A, B, C] = R.pick(NOUNS);
  const kinds = byTier(tier, ['all', 'no'], ['all', 'no', 'some'], ['all', 'no', 'some', 'some-not']);
  const premises = [[R.pick(kinds), A, B], [R.pick(kinds), B, C]];
  /* Both premises negative or both particular proves nothing at all, and a
     question whose answer is always "none follows" teaches only a habit. */
  const candidates = [['all', A, C], ['some', C, A], ['no', A, C], ['some', A, C], ['some', B, A], ['all', C, A]];
  const conclusions = R.some(candidates, 3);
  const verdicts = conclusions.map(c => follows(premises, c, [A, B, C]));
  if (!verdicts.some(Boolean)) return null;              // at least one must follow
  const labels = ['I', 'II', 'III'];
  const good = verdicts.map((v, i) => (v ? labels[i] : null)).filter(Boolean);
  const answer = good.length === 3 ? 'All three follow' : `Only ${good.join(' and ')} follow${good.length > 1 ? '' : 's'}`;
  const wrong = labels.filter(l => !good.includes(l));
  return ask({
    context: `<b>Statements:</b><br>${premises.map(say).join('<br>')}<br><br>
      <b>Conclusions:</b><br>${conclusions.map((c, i) => `${labels[i]}. ${say(c)}`).join('<br>')}`,
    q: 'Which of the conclusions follow from the statements?',
    opts: options(answer, [
      { v: 'None of the conclusions follows', why: `${good.join(' and ')} cannot be denied while both statements hold, so ${good.length > 1 ? 'they follow' : 'it follows'}.` },
      { v: 'All three follow', why: wrong.length ? `${wrong.join(' and ')} can be false while the statements are true — draw it.` : '' },
      ...wrong.map(l => ({ v: `Only ${l} follows`, why: `${l} is only a possibility, not forced by the statements.` })),
      ...labels.filter(l => good.includes(l) && good.length > 1).map(l => ({ v: `Only ${l} follows`, why: `${l} does follow — but it is not the only one.` })),
    ], i => `Only ${labels[i % 3]} and ${labels[(i + 1) % 3]} follow`),
    why: `Test each conclusion by trying to DRAW a counter-example that keeps both statements true.<br>
      ${conclusions.map((c, i) => `${labels[i]}. ${say(c)} — ${verdicts[i] ? '<b>follows</b>: no diagram can keep the statements and break it.' : 'does not follow: a diagram exists where the statements hold and this fails.'}`).join('<br>')}`,
    hardness: 1.6 + conclusions.length / 3 + (premises.some(p => p[0] === 'some-not') ? 1 : 0),
    concept: 'counterexample-method', conceptLabel: 'Testing a conclusion',
    source: 'Shape of RAS 2016 Q103 · RAS 2018 Q104',
  });
};

/* The written judgement questions — assumption, course of action, argument,
   conclusion — live in judgement.js. They are a pool rather than a generator,
   and the reasons why are worth reading before adding to them. */
export const VERBAL_GENERATORS = [
  gen('ras-verb-syll', 'verbal', 'reasoning:6', 'counterexample-method', 'Testing a conclusion', syllogism),
];
