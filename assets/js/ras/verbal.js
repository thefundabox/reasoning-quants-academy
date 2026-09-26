/* Statement-based reasoning — RAS 2015 Q112, 2016 Q101/Q103/Q104,
   2018 Q102-105, 2021 Q121/Q122/Q126. About a fifth of the reasoning block.

   The syllogisms are SOLVED, not labelled: a model checker decides which
   conclusions follow, so a premise pair can be drawn at random and the key is
   still right. The judgement questions (assumption, argument, course of
   action) are a written pool — there is no honest way to generate the
   judgement itself, and a generated one would teach a formula that does not
   hold in the paper.
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

/* ---------------- judgement questions: a written pool ---------------- */
const CHOICES = ['Only assumption I is implicit', 'Only assumption II is implicit',
  'Both I and II are implicit', 'Neither I nor II is implicit'];

/* key: 0 = only I, 1 = only II, 2 = both, 3 = neither */
const ASSUMPTIONS = [
  { s: 'The State has decided to conduct the RAS preliminary examination in a single shift across all districts.',
    a: 'Enough examination centres are available in every district on that day.',
    b: 'Candidates prefer a single-shift examination to a two-shift one.', key: 0,
    why: 'A single shift statewide cannot be planned unless the centres exist — that is taken for granted. What candidates PREFER is nowhere in the decision.' },
  { s: 'Notwithstanding the rain, the district administration completed the survey on time.',
    a: 'Rain normally slows such surveys down.',
    b: 'The survey was of farmland.', key: 0,
    why: '"Notwithstanding the rain" only makes sense if rain were expected to hinder it. Nothing tells us what was surveyed.' },
  { s: 'The college has made attendance of 75% compulsory for appearing in the examination.',
    a: 'Attendance can be recorded reliably.',
    b: 'Students with lower attendance always perform badly.', key: 0,
    why: 'A rule that cannot be measured cannot be enforced, so reliable recording is assumed. The rule does not claim anything about performance.' },
  { s: 'Use the new expressway to reach Jaipur faster.',
    a: 'The expressway is shorter or quicker than the existing road.',
    b: 'People want to reach Jaipur.', key: 2,
    why: 'An advertisement to use something assumes both that it delivers the benefit claimed and that somebody wants that benefit.' },
  { s: 'Nothing is beyond the reach of a hard-working person.',
    a: 'A hard-working person can achieve everything.',
    b: 'Those who do not work hard achieve nothing.', key: 0,
    why: 'The first restates the statement, so it is implicit. The second reverses it — the statement says nothing about people who do not work hard.' },
  { s: 'The bank has advised customers to keep their account details confidential.',
    a: 'Customers may not be aware of the risk of sharing details.',
    b: 'The bank cannot protect accounts by itself.', key: 0,
    why: 'Advice is given where it may be needed. That the bank is helpless is far stronger than anything the advice implies.' },
  { s: 'The government has capped the fee that private hospitals may charge for the treatment.',
    a: 'Some private hospitals were charging more than the cap.',
    b: 'Private hospitals will now refuse the treatment.', key: 0,
    why: 'A cap is set against a practice already happening. What hospitals will do next is a prediction, not an assumption.' },
  { s: 'Buy shares of this company — they have risen for three years running.',
    a: 'Past performance is some guide to future performance.',
    b: 'No other company has done as well.', key: 0,
    why: 'The advice only works if the past says something about the future. It never claims to be the best performer.' },
];

const ACTIONS = [
  { s: 'A large number of employees have gone on mass casual leave in protest against the new recruitment policy.',
    a: 'The company should immediately withdraw the new policy.',
    b: 'The company should discuss the employees’ objections and then decide.', key: 1,
    why: 'Surrender to pressure is not a course of action, it is a capitulation; talking first and deciding afterwards addresses the cause.' },
  { s: 'The prices of petrol have risen sharply over the past few weeks.',
    a: 'The government should immediately abolish all taxes on petrol.',
    b: 'The government should examine what is driving the rise before acting.', key: 1,
    why: 'A course of action must be practical and proportionate. Abolishing all tax is neither; understanding the cause is both.' },
  { s: 'Several road accidents have occurred at an unmanned railway crossing in the district.',
    a: 'The crossing should be manned or a bridge sanctioned.',
    b: 'Vehicles should be banned from that road permanently.', key: 0,
    why: 'The first removes the cause. Banning traffic removes the road instead of the danger — a cure worse than the disease.' },
  { s: 'Many students of a government school failed the board examination this year.',
    a: 'The school should be closed down.',
    b: 'The reasons for the poor result should be identified and remedial classes started.', key: 1,
    why: 'Closure punishes the students for the failure; diagnosis and remedy act on it.' },
];

const ARGUMENTS = [
  { s: 'Should wearing a helmet be enforced strictly for both rider and pillion?',
    a: 'Yes — the head is the most vulnerable part in a crash, and helmets measurably reduce deaths.',
    b: 'No — each person knows how to protect their own life and it should be left to them.', key: 0,
    why: 'The first rests on evidence about outcomes. The second is a general appeal to choice that would dismiss every safety rule equally, which is what makes it weak.' },
  { s: 'Should recruitment to government service be based on past academic performance instead of a competitive examination?',
    a: 'Yes — it would spare candidates the cost of preparing for examinations.',
    b: 'No — universities assess differently, so marks from different universities are not comparable.', key: 1,
    why: 'The objection identifies a defect that would make the method unworkable. Saving cost does not address whether the method selects the right people.' },
  { s: 'Should India make voting compulsory in general elections?',
    a: 'Yes — a government elected by everyone represents the country better.',
    b: 'No — compulsory voting cannot be enforced in a country of this size, and punishing non-voters would cost more than it gains.', key: 2,
    why: 'Both are strong: one names a real benefit, the other a real practical obstacle. A strong argument is one that bears on the decision — they need not agree.' },
];

const judgement = (kind, pool, labels) => (R, tier) => {
  const it = R.pick(pool);
  const key = labels[it.key];
  return ask({
    context: `<b>Statement:</b> ${it.s}<br><br><b>${kind}:</b><br>I. ${it.a}<br>II. ${it.b}`,
    q: kind === 'Assumptions' ? 'Which of the assumptions is implicit in the statement?'
      : kind === 'Courses of action' ? 'Which course of action logically follows?'
      : 'Which of the arguments is strong?',
    opts: options(key, labels.filter(l => l !== key).map(v => ({ v, why: '' }))),
    why: it.why,
    hardness: 1.5 + (it.key === 3 ? 0.8 : 0) + (it.key === 2 ? 0.5 : 0),
    concept: kind === 'Assumptions' ? 'assumption-unstated' : kind === 'Courses of action' ? 'action-replacement' : 'argument-relevance',
    conceptLabel: kind === 'Assumptions' ? 'What must be taken for granted'
      : kind === 'Courses of action' ? 'Does the remedy fit?' : 'Is the argument relevant?',
    source: 'Shape of RAS 2016 Q101 · RAS 2018 Q102-105 · RAS 2021 Q121',
  });
};

const ACT_LABELS = ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither I nor II follows'];
const ARG_LABELS = ['Only argument I is strong', 'Only argument II is strong', 'Both I and II are strong', 'Neither I nor II is strong'];

export const VERBAL_GENERATORS = [
  gen('ras-verb-syll', 'verbal', 'reasoning:6', 'counterexample-method', 'Testing a conclusion', syllogism),
  gen('ras-verb-assume', 'verbal', 'reasoning:1', 'assumption-unstated', 'Implicit assumptions', judgement('Assumptions', ASSUMPTIONS, CHOICES)),
  gen('ras-verb-action', 'verbal', 'reasoning:1', 'action-replacement', 'Courses of action', judgement('Courses of action', ACTIONS, ACT_LABELS)),
  gen('ras-verb-arg', 'verbal', 'reasoning:1', 'argument-relevance', 'Strong and weak arguments', judgement('Arguments', ARGUMENTS, ARG_LABELS)),
];
