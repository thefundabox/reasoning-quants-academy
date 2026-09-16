/* ============================================================
   Option ordering.

   Authors put the right answer second. Not sometimes — across the
   65 lessons the keys ran 16% / 68% / 16% / 0.5%, so a learner who
   pressed the second button every time and read nothing scored 68%.

   That is worse than a cosmetic flaw. The score feeds `store.answered`,
   which feeds the Leitner box, which decides what the review queue
   thinks you know. A guessing bias therefore corrupts the schedule as
   well as the mark.

   Fixing the 189 questions by hand would fix today and not tomorrow,
   because the bias is a writing habit, not a typo. So ordering is
   decided HERE, at render time, from the question itself: the key's
   slot comes from a hash of the question, and the distractors fill the
   rest. Same question, same layout every time — but across the corpus
   the key lands in all four positions evenly.

   Numbers are NOT sorted ascending, and that is deliberate. Sorting
   reads better, but it turned out to be its own tell: authors write
   distractors that straddle the right answer, so ascending order put
   the key in a middle slot 92% of the time (5 / 40 / 53 / 3 across the
   38 numeric questions). Scanning a sorted list is worth less than not
   training the instinct "the answer is the middle number".

   "None of these" and its cousins still stay last, where convention
   puts them. The option TEXT is never touched, only its position, so
   explanations that quote an option by its words keep working.

   `whyOption` — the per-option feedback, one entry per option — is
   permuted with them. It has to be: it is the one thing here that is
   pinned to an option rather than to the question, and a reason left
   behind in slot 2 would end up explaining whichever option landed
   there. Parallel arrays moved together cannot drift apart.
   ============================================================ */

/* Options that are conventionally last, whatever else happens. */
const TERMINAL = [
  /^none of (these|the above)$/i,
  /^all of the above$/i,
  /^(cannot|can'?t) (be (determined|decided|said)|say|tell)$/i,
  /^(data|information) (inadequate|insufficient)$/i,
  /^insufficient data$/i,
];

const plain = o => String(o).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
const isTerminal = o => TERMINAL.some(re => re.test(plain(o)));

/** The numeric value of an option, or null if it is not purely a number. */
export function optionValue(o) {
  const t = plain(o).replace(/[₹,\s]/g, '');
  return /^-?\d+(\.\d+)?%?$/.test(t) ? parseFloat(t) : null;
}

/* A small deterministic PRNG so a question looks the same every time it is
   asked. Randomising per view would move the answer under a learner who is
   re-reading it, and would make the harness untestable. */
const hashOf = s => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const rngFrom = seed => {
  let a = seed || 1;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Reorder one question's options and move its key to match.
 *
 * Returns a NEW step; the original is never mutated, because review and
 * chapter-practice sessions hand round the very same step objects and a
 * mutation would leak from one set into another.
 */
export function orderOptions(step, seed = '') {
  if (!step || !Array.isArray(step.options) || step.input === 'number') return step;
  if (!Number.isInteger(step.answer)) return step;

  const right = step.options[step.answer];
  const tail = step.options.filter(isTerminal);
  const movable = step.options.filter(o => !isTerminal(o));

  /* PLACE the key, don't merely shuffle. A free shuffle only tends towards an
     even spread, and over 189 questions "tends towards" still left one slot at
     33%. Choosing the slot from the hash makes the spread as even as the hash
     is; the distractors fill the gaps in shuffled order. */
  const h = hashOf(seed || plain(step.q || '') || movable.join('|'));
  const rand = rngFrom(h);
  const others = movable.filter(o => o !== right);
  for (let i = others.length - 1; i > 0; i--) {              // Fisher–Yates
    const j = Math.floor(rand() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const slot = h % movable.length;
  const ordered = [];
  let k = 0;
  for (let i = 0; i < movable.length; i++) ordered.push(i === slot ? right : others[k++]);

  const options = [...ordered, ...tail];
  /* Find the key by identity first — two options can read the same only if the
     question is broken, and the harness already forbids that. */
  const answer = options.indexOf(right);
  if (answer < 0) return step;

  /* Carry the per-option reasons through the same permutation. Looked up by
     the option's ORIGINAL index, so each reason follows its own option. */
  const out = { ...step, options, answer };
  if (Array.isArray(step.whyOption)) {
    out.whyOption = options.map(o => step.whyOption[step.options.indexOf(o)] ?? null);
  }
  return out;
}

/** The seed for a question: stable across sessions, distinct between questions. */
export const seedFor = (lessonId, step, i = 0) =>
  `${lessonId}#${step.concept || i}#${plain(step.q || '')}`;
