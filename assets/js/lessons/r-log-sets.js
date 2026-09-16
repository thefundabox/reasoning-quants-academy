/* ============================================================
   Reasoning · Unit 6 · Lesson 1 — Three Kinds of Set
   ============================================================ */

import { setSorter } from '../widgets/venn-sets.js';

const SORTER_SETS = [
          { a: 'Mammals', b: 'Water creatures', items: [
            ['Dog', 'A'], ['Cow', 'A'], ['Fish', 'B'], ['Crocodile', 'B'],
            ['Dolphin', 'AB'], ['Whale', 'AB'], ['Lizard', 'OUT'], ['Sparrow', 'OUT']] },
          { a: 'Rajasthan cities', b: 'State capitals', items: [
            ['Jodhpur', 'A'], ['Udaipur', 'A'], ['Kota', 'A'], ['Bhopal', 'B'],
            ['Lucknow', 'B'], ['Mumbai', 'B'], ['Jaipur', 'AB'], ['Nagpur', 'OUT']] },
          { a: 'Fruits', b: 'Red things', items: [
            ['Banana', 'A'], ['Mango', 'A'], ['Blood', 'B'], ['Fire engine', 'B'],
            ['Apple', 'AB'], ['Cherry', 'AB'], ['Stone', 'OUT'], ['Chalk', 'OUT']] },
        ];

export default {
  id: 'r.log.sets',
  title: 'Three Kinds of Set',
  xp: 30,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.log.syllogism',
  nextLabel: 'Next: Syllogism Basics →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Two true sentences, one wrong conclusion',
      say: `<b>All fathers are men. Some men are doctors.</b><br><br>
            Is your father a doctor? Obviously not necessarily. You knew that instantly —
            because you have a father and you know his job.<br><br>
            Now replace the words with letters and the instinct vanishes. <b>All A are B.
            Some B are C.</b> Suddenly candidates conclude "some A are C" and lose the mark.
            The cure is to stop reasoning in words and start drawing circles.`,
      cta: 'Show me the circles',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Two sets can relate in exactly three ways',
      say: `Not four, not seven. Three. Every logic question in the paper is assembled from these
            three bricks, so learn them properly once.`,
      body: `
        <ul>
          <li><b>Subset — "All A are B."</b> Circle A sits entirely inside circle B.
              All fathers are men; all apples are fruits.</li>
          <li><b>Overlap — "Some A are B."</b> The circles cross, and the lens between them is the
              "some". Some students are players.</li>
          <li><b>Disjoint — "No A is B."</b> The circles never touch. No dog is a cat.</li>
        </ul>
        <p>Two consequences worth having permanently:</p>
        <ul>
          <li><b>"All A are B" also guarantees "Some B are A."</b> If every father is a man, then
              at least some men are fathers — the subset always creates an overlap when read backwards.
              This is the one positive inference you get for free.</li>
          <li><b>"No A is B" also gives "No B is A."</b> Disjointness is symmetric, so a negative
              statement can always be reversed at no cost.</li>
        </ul>
        <p>What you do <em>not</em> get for free: "Some A are B" tells you nothing about how much
           of A is inside B — it might be one member or nearly all of them. That vagueness is the
           source of almost every trap in this unit.</p>`,
      cta: 'Let me sort some',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Four zones, and every item belongs to one',
      say: `Two circles carve the world into <b>four</b> regions — left only, the lens, right only,
            and everything outside. Tap an item, then tap its home.`,
      widget: setSorter({ sets: SORTER_SETS }),
      __cfg: { sets: SORTER_SETS },
      tasks: [
        { label: 'Place every item in the first set', done: s => s.allPlaced },
        { label: 'Fill at least one item into the <b>lens</b> — the "both" region', done: s => s.placed >= 1 },
      ],
      onComplete: 'The lens is where every "some" lives. Everything else in this unit is about how big that lens might be.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'free-conversion', conceptLabel: 'What "All A are B" gives you for free',
      say: `Commit first. Only one of these is guaranteed.`,
      context: `You are told only this: <b>All fathers are men.</b>`,
      q: 'Which statement is guaranteed to be true as well?',
      options: ['All men are fathers', 'Some men are fathers', 'No men are fathers', 'Some fathers are not men'],
      answer: 1,
      whyRight: `Correct. The fathers circle sits inside the men circle, so the part of "men" that
                 overlaps "fathers" is not empty — <b>some men are fathers</b>. That is the one
                 free inference a subset gives you.`,
      whyWrong: `Draw it: a small "fathers" circle entirely inside a bigger "men" circle.<br><br>
                 <b>"All men are fathers"</b> would need the two circles to be identical — nothing
                 in the statement says that, and the picture clearly shows men outside the fathers circle.<br><br>
                 <b>"Some men are fathers"</b> is guaranteed: the fathers circle is inside men and it is
                 not empty, so part of men is definitely fathers. <b>Subset read backwards always
                 gives you a "some".</b>`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'What each relation does and does not give you',
      say: `Three bricks, and precisely what each one entitles you to.`,
      steps: [
        `<b>Subset — All A are B.</b> Gives you: some B are A. Does <em>not</em> give you: all B are A. The circle can always be strictly smaller, and usually is.`,
        `<b>Overlap — Some A are B.</b> Gives you: some B are A (overlap is symmetric). Does <em>not</em> tell you how big the overlap is, nor whether any A sits outside B. "Some" is compatible with "nearly all" and with "exactly one".`,
        `<b>Disjoint — No A is B.</b> Gives you: no B is A. Does <em>not</em> stop A from overlapping anything else. Avoiding one circle says nothing about avoiding a third.`,
        `<b>The rule that governs all three.</b> A conclusion follows only if it is true in <em>every</em> drawing consistent with the statements. If you can sketch one arrangement where it fails, it does not follow — which is the whole of the next two lessons.`,
      ],
      takeaway: `Subset gives you a "some" backwards, and disjointness reverses freely. Nothing else is free.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'disjoint-symmetry', conceptLabel: 'Reversing a negative statement',
      context: `You are told: <b>No pen is a pencil.</b>`,
      q: 'Which statement must also be true?',
      options: ['Some pens are pencils', 'No pencil is a pen', 'All pencils are pens', 'Some pencils are not pens'],
      answer: 1,
      why: `Disjointness is <b>symmetric</b>: if the two circles do not touch, they do not touch from
            either side. So "no pen is a pencil" immediately gives <b>"no pencil is a pen"</b>.<br><br>
            "Some pencils are not pens" is <em>also</em> true here, but it is weaker and, more importantly,
            it is not the standard conversion the paper is testing. The clean reversal is the one to know.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'some-is-vague', conceptLabel: 'How little "some" tells you',
      context: `You are told: <b>Some students are players.</b>`,
      q: 'Which of these is definitely true?',
      options: ['Some students are not players', 'Most students are players',
                'Some players are students', 'At least half the students are players'],
      answer: 2,
      why: `Overlap is symmetric, so "some students are players" guarantees <b>"some players are
            students"</b> and nothing more.<br><br>
            The other three all smuggle in a <em>quantity</em>. "Some" is compatible with one single
            student and with every student but one — the word carries no information about size.
            "Some students are not players" feels obvious but is not guaranteed: the statement is still
            true if <em>all</em> students happen to be players.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'free-conversion', conceptLabel: 'What "All A are B" gives you for free',
      say: `The pair from the start. Draw before you decide.`,
      context: `<b>All fathers are men. Some men are doctors.</b>`,
      q: 'What follows?',
      options: ['Some fathers are doctors', 'Some men are fathers',
                'No father is a doctor', 'All doctors are men'],
      answer: 1,
      whyRight: `Exactly. "All fathers are men" gives you <b>"some men are fathers"</b> for free —
                 the subset read backwards. <br><br>
                 "Some fathers are doctors" does <em>not</em> follow: the doctors could all sit in the
                 part of "men" that lies outside the fathers circle. That is the drawing you will
                 learn to hunt for in the next lesson.`,
      whyWrong: `Take the statements one at a time.<br><br>
                 "All fathers are men" puts the fathers circle inside the men circle — which
                 guarantees <b>"some men are fathers"</b>.<br><br>
                 "Some men are doctors" only says the doctors circle touches men <em>somewhere</em>.
                 It may touch entirely outside the fathers circle, so "some fathers are doctors"
                 is possible but not <b>guaranteed</b> — and only guaranteed conclusions count.`,
    },
  ],
};
