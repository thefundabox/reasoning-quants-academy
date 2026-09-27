/* ============================================================
   RAS Practise Drills — the registry.

   Separate from the chapter generators on purpose. The chapter drill teaches
   a chapter; this bank rehearses the PAPER: the same archetypes the RPSC has
   set in RAS Prelims 2015, 2016, 2018, 2021, 2023 and 2024, at the difficulty
   the paper actually uses, mixed the way the paper mixes them.

   Nothing here is imported by the chapter drill, and nothing there is
   imported by this — a change to one cannot quietly alter the other.

   Answers still record against the chapter and concept each question belongs
   to, so the Leitner ladder, the weak-chapter report and the re-teach route
   all work exactly as they do everywhere else.
   ============================================================ */

import { rng, tierRamp, clampTier, TIER_NAME } from '../generators/rand.js';
import { MIXTURE_GENERATORS } from './mixtures.js';
import { INTEREST_GENERATORS } from './interest.js';
import { PERCENT_GENERATORS } from './percent.js';
import { CODE_GENERATORS } from './codes.js';
import { VERBAL_GENERATORS } from './verbal.js';
import { JUDGEMENT_GENERATORS } from './judgement.js';
import { RELATION_GENERATORS } from './relations.js';
import { FIGURE_GENERATORS } from './figures.js';
import { ARRANGE_GENERATORS } from './arrange.js';
import { CLOCK_GENERATORS } from './clocks.js';
import { NUMBER_GENERATORS } from './numbers.js';
import { COUNTING_GENERATORS } from './counting.js';
import { MEASURE_GENERATORS } from './measure.js';
import { SPATIAL_GENERATORS } from './spatial.js';
import { SET_GENERATORS_RAS } from './sets.js';
import { STAT_GENERATORS } from './stats.js';
import { GEOMETRY_GENERATORS } from './geometry.js';

export const RAS_GENERATORS = [
  ...VERBAL_GENERATORS, ...JUDGEMENT_GENERATORS, ...CODE_GENERATORS, ...RELATION_GENERATORS, ...ARRANGE_GENERATORS,
  ...FIGURE_GENERATORS, ...CLOCK_GENERATORS, ...SPATIAL_GENERATORS, ...SET_GENERATORS_RAS,
  ...NUMBER_GENERATORS, ...MIXTURE_GENERATORS, ...PERCENT_GENERATORS, ...INTEREST_GENERATORS,
  ...COUNTING_GENERATORS, ...MEASURE_GENERATORS, ...STAT_GENERATORS, ...GEOMETRY_GENERATORS,
];

/* The topics a learner picks from. `side` decides which half of the paper it
   belongs to, which is how the page groups them. */
export const RAS_TOPICS = [
  { id: 'verbal', side: 'reasoning', name: 'Statements & Syllogisms',
    blurb: 'Syllogisms solved by counter-example, and 97 written items on implicit assumptions, courses of action, strong arguments and what actually follows.',
    papers: '2015 Q112 · 2016 Q101-104 · 2018 Q102-105 · 2021 Q121-127 · 2023 Q81-83 · 2024 Q79-82, Q86' },
  { id: 'codes', side: 'reasoning', name: 'Coding & Series',
    blurb: 'Invented languages, shifted and rearranged alphabets, number series, three-letter series, repeating blocks, made-up operators and odd-one-out.',
    papers: '2015 Q94, Q100, Q107, Q108 · 2016 Q108, Q109 · 2018 Q107-110 · 2021 Q124 · 2023 Q85 · 2024 Q84, Q85' },
  { id: 'relations', side: 'reasoning', name: 'Blood Relations',
    blurb: 'Four and five links deep, phrased so that the diagram has to be drawn before anything is obvious.',
    papers: '2018 Q111 · 2021 Q123' },
  { id: 'arrange', side: 'reasoning', name: 'Seating & Order',
    blurb: 'Round tables where "right" is anticlockwise, and rows pinned down by clues.',
    papers: '2015 Q106 · arrangement block' },
  { id: 'figures', side: 'reasoning', name: 'Figures, Mirrors & Cubes',
    blurb: 'Rectangles, squares and triangles counted by size class; mirror images of capitals; the cubes hidden inside a painted block.',
    papers: '2015 Q103 · 2016 Q105 · 2018 Q106 · 2021 Q113 · 2023 Q89, Q90 · 2024 Q89, Q95' },
  { id: 'clocks', side: 'reasoning', name: 'Clocks, Calendars & Direction',
    blurb: 'Rotated dials, the angle between two moving hands, days counted in sevens, walks that double back, and people placed by compass offsets.',
    papers: '2021 Q115 · 2023 Q87 · 2024 Q87' },

  { id: 'sets', side: 'reasoning', name: 'Sets & Venn Diagrams',
    blurb: 'Three overlapping groups counted by inclusion–exclusion, and choosing the diagram three nouns actually make.',
    papers: '2023 Q93 · 2024 Q88' },
  { id: 'numbers', side: 'quants', name: 'Number Sense',
    blurb: 'Unit digits, divisibility by several numbers at once, consecutive integers, counting solutions.',
    papers: '2016 Q114 · 2018 Q112, Q113 · 2021 Q112' },
  { id: 'mixtures', side: 'quants', name: 'Ratio & Mixtures',
    blurb: 'Alloys melted together, water added to a mixture, a mixture changed twice, wages on two scales, coins in a ratio.',
    papers: '2016 Q112 · 2018 Q114, Q115 · 2021 Q120 · 2024 Q91' },
  { id: 'percent', side: 'quants', name: 'Percentage & Trade',
    blurb: 'Elections decided by chained percentages, growth between two years, equal gain and loss, a fraction used upside down, and a price cut that buys more.',
    papers: '2015 Q116 · 2016 Q119 · 2021 Q117 · 2023 Q91, Q92 · 2024 Q92' },
  { id: 'interest', side: 'quants', name: 'Interest, Growth & Work',
    blurb: 'The CI−SI gap, doubling periods, population run backwards, work when somebody leaves early, one sum split between two schemes, and compounding more often than yearly.',
    papers: '2015 Q104 · 2016 Q117, Q118 · 2018 Q116-118 · 2021 Q118 · 2023 Q97 · 2024 Q93' },
  { id: 'counting', side: 'quants', name: 'Counting & Chance',
    blurb: '"At least one", committees with a floor, dice whose order counts itself, the gap method, repeated letters, and the sum of two dice.',
    papers: '2021 Q114, Q119 · 2023 Q103 · 2024 Q97, Q98' },
  { id: 'measure', side: 'quants', name: 'Averages, Statistics, Mensuration & DI',
    blurb: 'Averages that move and averages repaired, mean against median against mode, rate read off a table, walls minus their openings, figures inscribed in a circle, pie charts and growth from a table.',
    papers: '2018 Q119-121 · 2021 Q111, Q116 · 2023 Q94, Q95, Q96 · 2024 Q83, Q94, Q96' },
];

export const rasTopic = id => RAS_TOPICS.find(t => t.id === id) || null;
export const rasGeneratorsFor = id => (id === 'mixed' ? RAS_GENERATORS : RAS_GENERATORS.filter(g => g.topic === id));

/** What makes two questions the same question — the drill's own rule. */
const sig = s => `${s.context || ''}|${s.q || ''}|${(s.options || []).join('~')}`;

/**
 * Deal `n` RAS questions.
 *
 * Generators are taken in rotation so a set covers a topic rather than
 * repeating its first archetype, and a draw already dealt is redrawn: these
 * sets are short, and the same question twice in one paper reads as a fault.
 */
export function rasDeal(topicId, n = 10, seed = 1, tier = 2) {
  const all = rasGeneratorsFor(topicId);
  if (!all.length) return [];
  const R = rng(seed);
  /* Shuffled, not taken in file order. Rotation through the registry order
     dealt a 15-question "mixed" paper entirely out of the reasoning half,
     because that half is listed first — the mix was in the name only. */
  const gens = R.shuffle(all);
  const ramp = tierRamp(clampTier(tier), n, { warmUp: false });
  const out = [];
  const seen = new Set();
  for (let i = 0, guard = 0; out.length < n && guard < n * 40; i++, guard++) {
    const g = gens[i % gens.length];
    const t = ramp[out.length] ?? clampTier(tier);
    let step;
    try { step = g.make(R, t); } catch { continue; }      // an unlucky draw, not a fault
    if (!step || !Array.isArray(step.options)) continue;
    const k = sig(step);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({
      ...step,
      type: 'ask',
      phase: `Q${out.length + 1}`,
      generatedBy: g.id,
      chapter: g.chapter,
      tier: t,
      tierName: TIER_NAME[t],
    });
  }
  return out;
}

export const freshSeed = () => (Date.now() ^ Math.floor(Math.random() * 0xffffff)) >>> 0;

/** A full session the ordinary lesson runner can play. */
export function rasSession(topicId, { size = 10, seed = freshSeed(), tier = 2, backHref = '../', title = '' } = {}) {
  const topic = topicId === 'mixed' ? { id: 'mixed', name: 'Mixed paper' } : rasTopic(topicId);
  if (!topic) return { session: null, reason: 'no such topic' };
  const steps = rasDeal(topicId, size, seed, tier).map((s, i) => ({ ...s, phase: `Q${i + 1}` }));
  if (!steps.length) return { session: null, topic, reason: 'nothing to deal' };

  const intro = {
    type: 'say', phase: 'Start', mood: 'thinking',
    title: `${topic.name} — ${steps.length} questions`,
    say: `These are built on the shapes the RPSC actually sets${topic.papers ? ` — ${topic.papers}` : ''}.
      Nothing here is a warm-up: the easiest question in this set is an ordinary exam question, and the
      last one is the sort that decides a list.<br><br>
      Same rules as everywhere else — commit before you look, and every answer moves its idea up or
      down your ladder. Reload the page for a completely different set.`,
    cta: 'Begin',
  };
  return {
    topic,
    questions: steps,
    session: {
      id: 'ras.drill',
      title: `RAS Drill · ${topic.name}`,
      review: true,                       // practice, never a lesson
      xpPerCorrect: 5,                    // harder questions, worth a little more
      backHref, nextHref: backHref,
      nextLabel: 'Back to RAS drills',
      againHref: './',
      steps: [intro, ...steps],
    },
  };
}
