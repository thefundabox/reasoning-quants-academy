/* ============================================================
   Reasoning · Unit 3 · Lesson 4 — The Mirror Trap
   ============================================================ */

import { mirrorRow } from '../widgets/mirror-row.js';

const ROW = { people: ['A', 'B', 'C', 'D', 'E', 'F'], facing: 'N' };

export default {
  id: 'r.dir.mirror',
  title: 'The Mirror Trap',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../reasoning/',
  nextLabel: 'Finish the unit',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Whose left?',
      say: `Six students sit in a row <b>facing the teacher</b>. The teacher says:
            <b>"Anil is third from the left."</b><br><br>
            Third from <em>whose</em> left? Yours, looking at the row — or Anil's own?<br><br>
            Get that wrong and every seat in the puzzle shifts by exactly the amount that makes all
            four options look plausible. This is not a hard idea. It is an expensive one.`,
      cta: 'Show me the flip',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Which way is the row looking?',
      say: `Everything depends on one thing the question always tells you, and candidates always skim past:
            <b>the direction the row is facing</b>.`,
      body: `
        <ul>
          <li><b>Row facing North</b> (away from you, as if you stand behind them) — they are looking the same
              way you are. <b>Their left is your left.</b> The two counts agree, and you can read the row
              straight off the page.</li>
          <li><b>Row facing South</b> (towards you, as if they are an audience) — they are a <b>mirror</b> of you.
              <b>Their left is your right.</b> Every "from the left" reverses.</li>
        </ul>
        <p>The same rule governs circles:</p>
        <ul>
          <li><b>Facing the centre</b> — a person's <b>left is clockwise</b> as you look down at the table…
              which is why you must never reason about a circle without drawing it.</li>
          <li><b>Facing outward</b> — everything reverses again.</li>
        </ul>
        <p>The safe habit: <b>always convert to the row's own frame first</b>. Redraw the row so that it faces
           away from you, flipping the order if you must, and then read every clue literally. One flip at the
           start is far cheaper than a flip on every clue.</p>`,
      cta: 'Let me flip a row',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Watch the counts disagree',
      say: `Tap a person to select them, then flip the row's facing. Watch the two badges —
            <b>your left</b> and <b>their left</b> — agree, then disagree.`,
      widget: mirrorRow(ROW),
      __cfg: ROW,
      tasks: [
        { label: 'Try <b>both</b> facings', done: s => s.flippedBoth },
        { label: 'Find a person whose two counts <b>disagree</b>', done: s => s.sawMismatch },
        { label: 'Select someone other than the third person', done: s => s.pick !== 2 },
      ],
      onComplete: 'Third from your left and third from theirs are different seats. The question always means theirs.',
      ctaDone: 'Test me',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'row-facing', conceptLabel: 'Converting to the row\'s own frame',
      say: `Commit first. Convert to their frame before you count anything.`,
      context: `Five children sit in a row <b>facing South</b> — that is, facing you.
                From <b>your</b> point of view, they are, left to right: <b>P, Q, R, S, T</b>.`,
      q: 'Who is second from the children\'s own left?',
      options: ['Q', 'S', 'R', 'T'],
      answer: 1,
      whyRight: `Correct. They face South, so they are a mirror of you: <b>their left is your right</b>.
                 From your right the order is T, S, R, Q, P — so second from their left is <b>S</b>.`,
      whyWrong: `They face <b>South</b>, meaning they are looking at you. That makes them a mirror:
                 <b>their left is your right</b>.<br><br>
                 Reading from your right: T is first, <b>S is second</b>, R is third.<br><br>
                 If you answered Q, you counted from your own left — which is what the question was
                 built to catch.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Flip once, at the start',
      say: `The disciplined method costs ten seconds and saves the whole puzzle.`,
      steps: [
        `<b>Read the facing before any clue.</b> "Facing north", "facing south", "facing the centre", "facing outward" — underline it. It is never decoration and it is never omitted.`,
        `<b>If the row faces you, rewrite it reversed.</b> Write the row out once in <em>their</em> left-to-right order. Now every clue in the question can be read literally, with no mental gymnastics.`,
        `<b>Then never flip again.</b> The expensive mistake is flipping on clue 1, forgetting on clue 2, and flipping back on clue 3. One conversion at the start, then obey the paper.`,
        `<b>For circles, draw the table and mark the noses.</b> Facing the centre, a person's left is the seat that is clockwise <em>on your page</em>. Draw the arrow; do not hold it in your head.`,
      ],
      takeaway: `The question always speaks in the row's own frame. Convert once, at the top of the page, and then read every clue exactly as written.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'row-facing', conceptLabel: 'Converting to the row\'s own frame',
      context: `Six people sit in a row <b>facing North</b> — away from you. In <b>their</b> order from
                left to right they are: <b>M, N, O, P, Q, R</b>.`,
      q: 'Who is third from your right?',
      options: ['O', 'P', 'Q', 'R'],
      answer: 1,
      why: `Facing North means they look the same way you do, so <b>their left is your left</b> and the
            written order is also your order: M, N, O, P, Q, R from your left.<br><br>
            Counting from your <b>right</b>: R is first, Q second, <b>P is third</b>.<br><br>
            No flip was needed here — but you only knew that because you checked the facing first.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'circle-facing', conceptLabel: 'Left and right around a circle',
      context: `Five friends sit around a round table <b>facing the centre</b>. Looking down at the table,
                you see them arranged clockwise as: <b>A, B, C, D, E</b>.`,
      q: 'Who is sitting to the immediate left of A?',
      options: ['B', 'E', 'C', 'D'],
      answer: 0,
      why: `Facing the centre, a person's <b>left</b> is the seat that comes next <b>clockwise</b> as you
            look down on the table. Going clockwise from A, the next seat is <b>B</b>.<br><br>
            The reliable check: imagine sitting in A's chair looking inward. Your left hand sweeps in
            the clockwise direction of the drawing. Had they been facing <em>outward</em>, the answer
            would flip to E.`,
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'row-facing', conceptLabel: 'Converting to the row\'s own frame',
      say: `The classroom from the start. Read the facing, convert once, then count.`,
      context: `Six students sit in a row <b>facing the teacher</b>, who stands in front of them.
                The teacher, looking at the class, sees them left to right as:
                <b>Anil, Beena, Chetan, Deepa, Esha, Farhan</b>.<br>
                The teacher then says: <b>"Chetan, move to the seat third from your left."</b>`,
      q: 'Which seat does Chetan move to — counting in the teacher\'s view from her left?',
      options: ['The 3rd seat', 'The 4th seat', 'The 5th seat', 'He is already there'],
      answer: 1,
      whyRight: `Exactly. The students face the teacher, so they are a mirror of her: <b>their left is her right</b>.
                 Third from <em>their</em> left means third counting from Farhan's end — Farhan, Esha,
                 <b>Deepa</b> — which is the <b>4th seat</b> in the teacher's own left-to-right view.`,
      whyWrong: `The students face the teacher, so their frame is <b>mirrored</b> relative to hers:
                 their left is her right.<br><br>
                 "Third from your left" is spoken to Chetan, so it means third from the <b>students'</b> left —
                 that is, counting from the teacher's right: Farhan (1st), Esha (2nd), <b>Deepa (3rd)</b>.<br><br>
                 Deepa's seat is the <b>4th</b> when the teacher counts from her own left.
                 Answering "the 3rd seat" means you counted in the teacher's frame, not the students'.`,
    },
  ],
};
