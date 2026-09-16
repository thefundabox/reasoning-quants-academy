/* ============================================================
   Reasoning · Unit 2 · Lesson 2 — The Generation Ladder
   ============================================================ */

import { relationLadder } from '../widgets/relation-ladder.js';

const LADDER = {};       // the keypad starts empty and unlocked
import { staticTree } from '../widgets/family-tree.js';

export default {
  id: 'r.rel.ladder',
  title: 'The Generation Ladder',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.rel.photo',
  nextLabel: 'Next: Pointing at a Photograph →',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Two chains. Same length. Nothing alike.',
      say: `<b>"My father's father"</b> and <b>"my father's brother"</b>.<br><br>
            Both are two words long. One carries you two rungs up a ladder; the other carries you
            one rung up and then sideways. Confuse them and every cousin in Rajasthan becomes your uncle.<br><br>
            Here is what you will answer at the end:
            <b>how is your mother's brother's daughter's brother related to you?</b>`,
      cta: 'Show me the ladder',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Only two kinds of move exist',
      say: `Every relation word does exactly one of two things to your position. Once you see that,
            "how is X related to me" stops being vocabulary and becomes <b>counting</b>.`,
      body: `
        <ul>
          <li><b>Vertical moves</b> change your level. <code>father</code> and <code>mother</code> go up one rung;
              <code>son</code> and <code>daughter</code> go down one. Nothing else moves you vertically.</li>
          <li><b>Lateral moves</b> never change your level. <code>brother</code>, <code>sister</code>,
              <code>husband</code>, <code>wife</code> slide you sideways on the rung you are already standing on.</li>
        </ul>
        <p>So to name any relation, you need only two numbers: <b>the net level</b>, and <b>whether you ever stepped sideways</b>.</p>
        <ul>
          <li>Up 1, no sideways step → <b>father / mother</b>. Up 1 <em>with</em> a sideways step → <b>uncle / aunt</b>.</li>
          <li>Down 1, no sideways step → <b>son / daughter</b>. Down 1 <em>with</em> one → <b>nephew / niece</b>.</li>
          <li>Level 0 reached by going up and back down through a sideways branch → <b>cousin</b>.</li>
          <li>Level ±2 → <b>grandparent / grandchild</b>.</li>
        </ul>
        <p>That table is the entire chapter. The ladder below lets you verify it yourself.</p>`,
      cta: 'Let me climb it',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Climb it yourself',
      say: `Click steps and watch the token. Note the colours: <b>purple moves are vertical</b>,
            <b>gold moves are lateral</b>. Try to make the token reach a cousin — you will find it
            impossible without going up, sideways, then down.`,
      widget: relationLadder(LADDER),
      __cfg: LADDER,
      tasks: [
        { label: 'Take a <b>vertical</b> step (father, mother, son or daughter)', done: s => s.usedVertical },
        { label: 'Take a <b>lateral</b> step (brother, sister, husband or wife) — watch the level <em>not</em> change',
          done: s => s.usedLateral },
        { label: 'Land on a <b>grandparent or grandchild</b> (net level ±2)', done: s => s.reachedGrand },
        { label: 'Build a chain that lands on a <b>cousin</b>', done: s => s.reachedCousin },
      ],
      onComplete: 'Now you have felt it. A cousin is never one step away — it always costs up, across, down.',
      ctaDone: 'Test me',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'lateral-vs-vertical', conceptLabel: 'Lateral vs vertical moves',
      say: `Commit before I explain. This one catches people who count words instead of rungs.`,
      context: `Consider the chain: <b>your father's sister's husband</b>.`,
      q: 'How is he related to you?',
      options: ['Your uncle', 'Your cousin', 'Your brother-in-law', 'Your nephew'],
      answer: 0,
      whyRight: `Correct. <code>father</code> takes you up one rung. <code>sister</code> is lateral — still +1.
                 <code>husband</code> is also lateral — still +1. You are one level above yourself
                 having stepped sideways, and that is the definition of an <b>uncle</b> (by marriage).`,
      whyWrong: `Count rungs, not words. <code>father</code> = up one (+1).
                 <code>sister</code> = sideways, still +1. <code>husband</code> = sideways, still +1.
                 Net level +1 with a sideways step in the chain → <b>uncle</b>.
                 "Brother-in-law" would require you to end on <em>your own</em> level.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Counting beats remembering',
      say: `Watch how little you need to hold in your head.`,
      steps: [
        `<b>Strip the chain into steps.</b> "Father's sister's husband" is three moves: <code>father</code>, <code>sister</code>, <code>husband</code>.`,
        `<b>Tag each move.</b> Vertical: <code>father</code> (+1). Lateral: <code>sister</code> (0), <code>husband</code> (0). You never need to know <em>who</em> these people are.`,
        `<b>Add the levels.</b> +1 + 0 + 0 = <b>+1</b>. One rung above you.`,
        `<b>Check for a sideways step.</b> There were two. Level +1 <em>plus</em> a lateral step is not a parent — it is an <b>uncle</b>. Had there been no lateral step, +1 would have meant your father.`,
      ],
      widget: staticTree([
        { a: 'You', rel: 'son', b: 'Father' },
        { a: 'Father', rel: 'brother', b: 'Bua' },
        { a: 'Fufaji', rel: 'husband', b: 'Bua' },
      ]),
      takeaway: `Net level tells you <em>which row</em> of the table to read. The presence of a lateral step tells you <em>which column</em>. Two facts, every answer.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'level-counting', conceptLabel: 'Counting net level',
      context: `<b>A</b>'s mother is <b>B</b>'s father's sister.`,
      q: 'How is A related to B?',
      options: ['A is B\'s cousin', 'A is B\'s nephew', 'A is B\'s uncle', 'A is B\'s brother'],
      answer: 0,
      why: `Start at B. <code>father</code> → +1. <code>sister</code> → lateral, still +1: that is B's aunt,
            and we are told she is A's mother. Now step down to her child: <code>son/daughter</code> → back to level <b>0</b>.
            Level 0, reached by going up, sideways, then down → <b>cousin</b>.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'level-counting', conceptLabel: 'Counting net level',
      context: `At a wedding in Udaipur, a man introduces a boy: <b>"He is the son of my sister."</b>`,
      q: 'What is the boy to the man?',
      options: ['His son', 'His nephew', 'His cousin', 'His grandson'],
      answer: 1,
      why: `<code>sister</code> is lateral (level 0), then <code>son</code> is vertical down (−1).
            Net level <b>−1</b> with a lateral step in the chain → <b>nephew</b>.
            Without the lateral step, −1 would have been his own son. One sideways move changes the whole word.`,
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'lateral-vs-vertical', conceptLabel: 'Lateral vs vertical moves',
      say: `The chain from the beginning. Four links. Count, do not recall.`,
      context: `<b>Your mother's brother's daughter's brother.</b>`,
      q: 'How is he related to you?',
      options: ['Your uncle', 'Your nephew', 'Your cousin', 'Your brother'],
      answer: 2,
      whyRight: `Exactly. <code>mother</code> +1 · <code>brother</code> lateral, still +1 (your maternal uncle) ·
                 <code>daughter</code> −1, back to 0 (your cousin) · <code>brother</code> lateral, still 0.
                 Net level <b>0</b> with lateral steps above you → <b>cousin</b>.
                 The fourth link changed his gender, not his relationship.`,
      whyWrong: `Take it one link at a time.<br>
                 <code>mother</code> → +1. <code>brother</code> → lateral, still +1 (this is your maternal uncle).
                 <code>daughter</code> → −1, back to level 0 (your cousin).
                 <code>brother</code> → lateral, still level 0.<br><br>
                 You end on your own rung, having branched sideways higher up: <b>cousin</b>.
                 The last step only tells you he is male — a cousin's brother is still your cousin.`,
    },
  ],
};
