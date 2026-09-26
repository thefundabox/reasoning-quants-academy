/* ============================================================
   The generator registry.

   65 lessons carry 260 hand-written questions — about 18 a chapter, so
   anyone drilling one chapter hard met a repeat within two sessions.
   The old standalone modules never had that problem because they dealt
   questions from a rule instead of a list, and that is what this is.

   A generator is small on purpose:

     { id, chapter: 'reasoning:3', concept, conceptLabel, make(R) }

   `make` takes a seeded RNG and returns the same shape a lesson's `ask`
   step uses, so the runner, the review queue and the mastery ladder all
   treat a generated question exactly like a written one. It reuses a
   concept its chapter already teaches — see reasoning.js for why.
   ============================================================ */

import { rng, tierRamp, clampTier, TIER_NAME } from './rand.js';
import { REASONING_GENERATORS } from './reasoning.js';
import { QUANTS_GENERATORS } from './quants.js';

export const GENERATORS = [...REASONING_GENERATORS, ...QUANTS_GENERATORS];

/** Every generator that belongs to one chapter. */
export const generatorsFor = (academyId, unitN) =>
  GENERATORS.filter(g => g.chapter === `${academyId}:${unitN}`);

/** Which chapters can deal generated questions at all. */
export const generatedChapters = () => [...new Set(GENERATORS.map(g => g.chapter))].sort();

/**
 * What makes two questions the same question.
 *
 * The prose alone is not enough — several generators ask one fixed sentence
 * ("How is that person related to you?") and vary only the setup, so the
 * context and the options have to count too.
 */
export const questionSig = s =>
  `${s.context || ''}|${s.q || ''}|${(s.options || []).join('~')}`;

/**
 * The dealer both callers share.
 *
 * Generators are taken in rotation rather than at random, so a set of six
 * from a chapter with three generators is two of each — not, by luck, six
 * of one. Within a generator the RNG still varies the numbers.
 *
 * A generator that throws is SKIPPED, not fatal. `options()` throws when a
 * draw cannot produce four distinct choices, and one unlucky draw must not
 * take the practice page down with it — the harness hunts those separately,
 * across far more draws than a learner will ever see.
 *
 * `tierAt(k)` decides the difficulty of the k-th question that survives, so
 * a chapter set can ramp while a single-idea set stays flat.
 *
 * `want` names ONE concept the caller needs. Most generators deal a single
 * concept and ignore it, but a generator may vary the concept per draw — a
 * number series records a ratio question against `ratios-first` and an
 * interleaved one against `alternate-terms` — and a re-teach asking for one of
 * those must not be handed the other. It is passed to `make` as a hint AND
 * enforced on the way out, because a hint a generator ignores would otherwise
 * feed the wrong Leitner box silently.
 *
 * `distinct` re-draws past a question already dealt. A chapter set does not
 * need it — eight questions rotating through three generators repeat rarely.
 * A three-question set from ONE generator is the opposite case: measured over
 * 22,500 sets, 9% contained the same question twice, and one generator at
 * Gentle managed it in 78% of them. A learner shown the same question twice
 * inside three has been told their re-teach is a formality.
 */
function deal(gens, n, seed, tierAt, distinct = false, want = null) {
  if (!gens.length) return [];
  const R = rng(seed);
  const out = [];
  const seen = new Set();

  /* A wider guard when de-duplicating, because a rejected draw still costs a
     turn. If the pool really is smaller than `n`, this returns what exists
     rather than padding it with a repeat. */
  const cap = n * (distinct ? 40 : 12);
  for (let i = 0, guard = 0; out.length < n && guard < cap; i++, guard++) {
    const g = gens[i % gens.length];
    const t = tierAt(out.length);
    let step;
    try { step = g.make(R, t, want); } catch { continue; }
    if (!step || !Array.isArray(step.options)) continue;
    if (want && step.concept && step.concept !== want) continue;
    if (distinct) {
      const sig = questionSig(step);
      if (seen.has(sig)) continue;
      seen.add(sig);
    }
    out.push({
      type: 'ask',
      phase: `Q${out.length + 1}`,
      concept: g.concept,
      conceptLabel: g.conceptLabel,
      generatedBy: g.id,
      /* The chapter travels WITH the question. A chapter session declares its
         own, so this was never needed — until the mock, which mixes fourteen
         chapters into one paper and has to attribute every answer afterwards. */
      chapter: g.chapter,
      tier: t,
      tierName: TIER_NAME[t],
      ...step,
    });
  }
  return out;
}

/**
 * Deal `n` questions for a chapter.
 *
 * `warmUp` opens the set one step below the learner's level. That is right for
 * a practice set and wrong for the endless drill, which is there to be hard:
 * see DRILL_FLOOR in review.js.
 */
export function drill(academyId, unitN, n = 8, seed = 1, tier = 2, warmUp = true) {
  const ramp = tierRamp(tier, n, { warmUp });
  return deal(generatorsFor(academyId, unitN), n, seed, k => ramp[k] ?? clampTier(tier));
}

/** Every generator that can ask about one idea, whatever chapter it sits in. */
export const generatorsForConcept = conceptId =>
  GENERATORS.filter(g => g.concept === conceptId);

/**
 * Deal `n` questions about ONE idea, at one difficulty.
 *
 * No ramp here, unlike `drill`. A re-teach set is not a graded paper: it is
 * a single idea being re-tested at the level the learner was just re-taught
 * it, and sliding the last question upward would undo that.
 */
export function drillConcept(conceptId, n = 3, seed = 1, tier = 2) {
  const t = clampTier(tier);
  /* `generatorsDealing`, not `generatorsForConcept`: a generator that varies
     its concept per draw declares only one of them, so searching by the
     declaration made a re-teach for `ratios-first` come back empty while the
     generator that asks it sat right there under another name. */
  return deal(generatorsDealing(conceptId), n, seed, () => t, true, conceptId);
}

/**
 * Every concept a generator can actually deal, including any it varies per
 * draw. `generatorsForConcept` matches on the DECLARED concept, which is what a
 * re-teach searches by — so a generator that deals `ratios-first` under a
 * declaration of `second-differences` would be invisible to a re-teach for the
 * former and wrongly chosen for the latter. Sampling is the only honest way to
 * find out, since the concept is decided inside `make`.
 */
const DEALT = new Map();
export function conceptsDealtBy(g, samples = 200) {
  if (DEALT.has(g.id)) return DEALT.get(g.id);
  const out = new Set([g.concept]);
  const R = rng(20260826);
  for (let i = 0; i < samples; i++) {
    try { const q = g.make(R, 1 + (i % 3)); if (q && q.concept) out.add(q.concept); } catch { /* skip */ }
  }
  /* Memoised: sampling 38 generators 200 times each is not something to do on
     every draw, and the answer cannot change between calls — a generator's
     rules are fixed at module load. */
  const list = [...out];
  DEALT.set(g.id, list);
  return list;
}

/** Generators that can deal a question about this concept, declared or not. */
export const generatorsDealing = conceptId =>
  GENERATORS.filter(g => conceptsDealtBy(g).includes(conceptId));

/** A seed that changes every time, for a learner who wants new questions. */
export const freshSeed = () => (Date.now() ^ Math.floor(Math.random() * 0xffffff)) >>> 0;
