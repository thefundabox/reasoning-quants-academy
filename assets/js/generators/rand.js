/* ============================================================
   Seeded randomness, and the option-building the generators share.

   Seeded, not `Math.random`, for one reason: the harness has to be able
   to generate ten thousand questions, re-derive every answer, and get
   the SAME ten thousand next run. A generator that fails once in five
   hundred draws is worthless if the failing draw cannot be reproduced.

   The practice pages pass a seed from the clock, so a learner gets
   fresh questions; the harness passes fixed seeds.
   ============================================================ */

/** mulberry32 — small, fast, good enough for question variety. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  const r = () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));      // inclusive
  r.pick = xs => xs[Math.floor(r() * xs.length)];
  r.some = (xs, n) => {                                          // n distinct picks
    const pool = xs.slice(), out = [];
    while (out.length < n && pool.length) out.push(...pool.splice(Math.floor(r() * pool.length), 1));
    return out;
  };
  r.shuffle = xs => {
    const a2 = xs.slice();
    for (let i = a2.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a2[i], a2[j]] = [a2[j], a2[i]];
    }
    return a2;
  };
  return r;
}

/**
 * Four options, the right one among them, all distinct.
 *
 * Distractors are offered as candidates and taken in order while they are
 * usable; `spare` tops up if too many collided. Returning fewer than four
 * would be a broken question, so this throws rather than shipping one —
 * the harness turns that into a named failure instead of a silent oddity.
 *
 * Distinctness is by RENDERED TEXT, because that is what the learner
 * compares. "0.5" and ".5" are the same option to a reader.
 *
 * PER-OPTION FEEDBACK. A candidate may be written as `{ v, why }` instead of
 * a bare value. `why` says what THAT distractor is — "this is the
 * circumference, not the area" — and the learner who picked it is told that
 * instead of the one paragraph everybody else gets. A generator knows this
 * for free, because it computed the distractor on purpose; a human author
 * has to remember, which is why the written questions mostly do not have it.
 *
 * The reasons come back as `whyOption`, a PARALLEL ARRAY rather than a map
 * keyed by index. Indices do not survive `options.js`, which re-seats every
 * question at render time so the key is not always B — a reason pinned to
 * slot 2 would end up explaining a different option than the one it was
 * written about. Parallel arrays get permuted together, so they cannot drift.
 */
export function options(correct, candidates, spare = () => null) {
  const val = c => (c && typeof c === 'object' && 'v' in c) ? c.v : c;
  const why = c => (c && typeof c === 'object' && 'v' in c) ? (c.why || null) : null;
  const key = v => String(v).trim();

  const out = [val(correct)];
  const reasons = [null];                    // the key needs no excuse; whyRight covers it
  const seen = new Set([key(val(correct))]);

  const add = c => {
    const v = val(c);
    if (v === null || v === undefined || out.length >= 4) return;
    const k = key(v);
    if (k === '' || seen.has(k)) return;
    seen.add(k); out.push(v); reasons.push(why(c));
  };

  candidates.forEach(add);
  for (let i = 0; out.length < 4 && i < 60; i++) add(spare(i));
  if (out.length < 4) {
    throw new Error(`only ${out.length} distinct options for "${val(correct)}": ${JSON.stringify(out)}`);
  }
  /* Omitted entirely when nothing was annotated, so a question that has no
     per-option feedback carries no empty array pretending otherwise. */
  return reasons.some(Boolean)
    ? { options: out, answer: 0, whyOption: reasons }
    : { options: out, answer: 0 };           // the runner re-seats these; see options.js
}

/** Numeric distractors that look plausible: near misses, not noise. */
export const near = (v, ...deltas) => deltas.map(d => v + d);

/* ============================================================
   Difficulty tiers.

   Without these, a learner's first-ever HCF question drew from the same
   range as their five-hundredth. A novice met full-difficulty items on
   day one with nothing gentler to build on, which is the fastest way to
   convince somebody they cannot do this.

   Three tiers, and the names matter more than the numbers:

     1 · Gentle   small numbers, short chains, one idea at a time.
                  Meant to be got RIGHT — confidence is the point.
     2 · Exam     what the paper actually asks. This is the old
                  behaviour exactly, so every existing check still means
                  what it meant before tiers existed.
     3 · Stretch  longer chains, uglier numbers, the traps stacked.

   A generator varies its OWN parameters by tier and reports a `hardness`
   number with each question. That number is the generator's own claim
   about what "harder" means for its question type — chain length, operand
   size, how many premises — and the harness holds it to that claim by
   requiring the mean to rise across the three tiers. A generator that
   ignores its tier therefore fails rather than passing quietly.
   ============================================================ */

export const TIERS = [1, 2, 3];
export const TIER_NAME = { 1: 'Gentle', 2: 'Exam', 3: 'Stretch' };
export const TIER_BLURB = {
  1: 'Small numbers and short chains — meant to be got right.',
  2: 'The difficulty the paper actually asks for.',
  3: 'Longer chains, uglier numbers, traps stacked.',
};

/** Pick one of three values by tier. The whole tier vocabulary, in one line. */
export const byTier = (t, gentle, exam, stretch) =>
  (t <= 1 ? gentle : t >= 3 ? stretch : exam);

/* `+t || 2` looks equivalent and is not: tier 0 is falsy, so it became EXAM
   rather than clamping down to GENTLE — the opposite of what a `?tier=0` in
   the URL is asking for. Only a genuinely unreadable value falls back to 2. */
export const clampTier = t => {
  const n = Math.round(Number(t));
  return Number.isFinite(n) ? Math.min(3, Math.max(1, n)) : 2;
};

/**
 * The tiers a set of `n` questions should be dealt at.
 *
 * Not a flat difficulty: a set that never varies is either always too easy
 * or always too hard, and neither teaches. The shape is a ramp — open one
 * step below the learner's level so the first question is a win, spend the
 * middle at their level, and close with one that stretches. At tier 1 there
 * is nothing below, so the warm-up is skipped rather than faked.
 */
export function tierRamp(tier, n, { warmUp = true } = {}) {
  const t = clampTier(tier);
  const out = [];
  for (let i = 0; i < n; i++) {
    const last = i === n - 1;
    if (warmUp && i === 0 && t > 1 && n >= 3) out.push(t - 1);   // warm-up
    else if (last && t < 3 && n >= 3) out.push(t + 1);           // one stretch
    else out.push(t);
  }
  return out;
}
