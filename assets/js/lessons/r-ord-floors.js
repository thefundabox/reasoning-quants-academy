/* ============================================================
   Reasoning · Unit 4 · Lesson 4 — Floors & Boxes
   ============================================================ */

import { seatBoard, solvedBoard } from '../widgets/seat-board.js';

const PUZZLE = {
  type: 'stack', n: 5, people: ['V', 'W', 'X', 'Y', 'Z'],
  clues: [
    { text: '<b>X</b> lives on the topmost floor.',
      test: p => p.X === 4 },
    { text: '<b>V</b> lives immediately below <b>X</b>.',
      test: (p, H) => p.V != null && H.below(p.X) === p.V },
    { text: '<b>Y</b> lives on the lowest floor.',
      test: p => p.Y === 0 },
    { text: 'Exactly one floor separates <b>W</b> and <b>Y</b>.',
      test: p => p.W != null && p.Y != null && Math.abs(p.W - p.Y) === 2 },
  ],
};

export default {
  id: 'r.ord.floors',
  title: 'Floors & Boxes',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.ord.schedule',
  nextLabel: 'Next: Scheduling Grids →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The same puzzle, stood on its end',
      say: `Five people live in a five-storey building, one on each floor.<br><br>
            <b>X lives on the top floor. V lives immediately below X. Y lives on the lowest floor.
            Exactly one floor separates W and Y.</b><br><br>
            This is a seating puzzle rotated ninety degrees — and it comes with one extra trap that
            rows never have: <b>which way do the numbers run?</b>`,
      cta: 'Show me the trap',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Fix the direction of the numbers first',
      say: `A row has left and right. A stack has up and down — and the paper will tell you which end
            is floor 1, usually in a clause you are meant to skim past.`,
      body: `
        <p><b>The convention almost every exam uses:</b> the <b>lowest floor is numbered 1</b> and the
           numbers increase upward. But read the sentence — a "box" puzzle may stack boxes with
           <b>box 1 on top</b>, and everything inverts.</p>
        <p>Draw the stack <b>vertically</b>, with the numbers written down the side, before you read a
           single clue. Never solve a floor puzzle on a horizontal line: "above" and "below" stop being
           obvious the moment the picture is sideways.</p>
        <p>Then the language, which is where the marks actually go:</p>
        <ul>
          <li><b>"Immediately above / below"</b> — the adjacent floor, one step.</li>
          <li><b>"Exactly one floor between X and Y"</b> — the gap is <b>two</b> floors, not one.
              One floor <em>sits between them</em>, so |X − Y| = 2. This is the single most common slip
              in the whole topic.</li>
          <li><b>"X lives above Y"</b> with no other word — anywhere above, not adjacent.</li>
          <li><b>"Only two people live above X"</b> — this <em>fixes</em> X's floor. In a five-storey
              building it puts X on floor 3. Treat these as anchor clues.</li>
        </ul>`,
      cta: 'Let me stack them',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Five floors, five residents',
      say: `Floor 1 is at the bottom, as the paper intends. Tap a person, then tap a floor.
            Watch the "exactly one floor separates" clue — it needs a gap of <b>two</b>.`,
      widget: seatBoard(PUZZLE),
      __cfg: PUZZLE,
      __puzzle: PUZZLE,          // exposed so the harness can brute-force it
      tasks: [
        { label: 'Anchor <b>X</b> on the top floor and <b>Y</b> on the bottom', done: s => s.pos.X === 4 && s.pos.Y === 0 },
        { label: 'Get every clue to turn green', done: s => s.cluesOk === s.cluesTotal },
        { label: 'House all five people', done: s => s.placedAll },
      ],
      onComplete: 'Two anchors at the ends, and the middle had almost no freedom left.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'gap-language', conceptLabel: '"Exactly one between" means a gap of two',
      say: `Commit first. This is a reading question disguised as a reasoning question.`,
      context: `In a building numbered 1 (lowest) to 7 (highest), <b>P lives on floor 2</b>, and
                <b>exactly two floors separate P and Q</b>, with Q above P.`,
      q: 'Which floor does Q live on?',
      options: ['Floor 4', 'Floor 5', 'Floor 3', 'Floor 6'],
      answer: 1,
      whyRight: `Correct. "Exactly two floors separate them" means two floors <b>sit in between</b> —
                 floors 3 and 4. So Q is on floor <b>5</b>: the gap is |5 − 2| = 3, which is
                 two-in-between plus one.`,
      whyWrong: `Read it literally. "Exactly two floors separate P and Q" means <b>two floors lie
                 between them</b> — here floors 3 and 4.<br><br>
                 P is on floor 2, then floors 3 and 4 are the separators, so Q is on floor <b>5</b>.<br><br>
                 The rule: <em>k</em> floors between means the difference is <b>k + 1</b>.
                 Answering "floor 4" treats "two between" as a difference of two, which is the trap.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The building, filled',
      say: `Anchors at both ends, then a gap clue, then the leftovers.`,
      steps: [
        `<b>Draw the stack and number it.</b> Floor 1 at the bottom through floor 5 at the top. Do this before reading any clue.`,
        `<b>Two free anchors.</b> "X on the topmost floor" → floor 5. "Y on the lowest floor" → floor 1. Both fix a person outright, so both go first.`,
        `<b>Chain off an anchor.</b> "V immediately below X" → floor 4.`,
        `<b>Read the gap clue carefully.</b> "Exactly one floor separates W and Y" means one floor sits between them, so |W − Y| = 2. Y is on floor 1, so W is on floor <b>3</b>. <b>Z</b> takes the only floor left, floor 2.`,
      ],
      widget: solvedBoard({ type: 'stack', n: 5, pos: { Y: 0, Z: 1, W: 2, V: 3, X: 4 } }),
      __solution: { Y: 0, Z: 1, W: 2, V: 3, X: 4 },
      takeaway: `Draw it vertically, number it before you read, and translate every "k between" into a difference of k + 1.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'count-anchor', conceptLabel: '"Only k above" fixes a floor',
      context: `Six people live in a six-storey building, floor 1 lowest.
                <b>Only two people live above R.</b>`,
      q: 'Which floor does R live on?',
      options: ['Floor 3', 'Floor 4', 'Floor 2', 'Floor 5'],
      answer: 1,
      why: `If exactly two people live above R, those are floors 5 and 6. R must therefore be on
            floor <b>4</b>, with three people below on floors 1–3.<br><br>
            Counting clues like this one are <b>anchors</b>, not relative clues — they pin a person to a
            single floor with no other information. Use them first, exactly like "sits in the middle" in a row.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'stack-direction', conceptLabel: 'Reading which way the numbers run',
      context: `Five boxes are stacked one on top of another. <b>Box 1 is at the top</b> and box 5 at the
                bottom. Box <b>M</b> is immediately <b>above</b> box <b>N</b>, and N is box 4.`,
      q: 'Which box number is M?',
      options: ['Box 5', 'Box 3', 'Box 2', 'Box 1'],
      answer: 1,
      why: `The numbering is <b>inverted</b> here: box 1 is on top, so a <em>smaller</em> number means
            <em>higher</em> in the stack.<br><br>
            M is immediately above N (box 4), so M is box <b>3</b>.<br><br>
            If you answered box 5, you applied the usual floor convention where bigger means higher.
            That clause — "box 1 is at the top" — is the whole question.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'gap-language', conceptLabel: '"Exactly one between" means a gap of two',
      say: `The building from the start. You have every floor now.`,
      context: `Five people live on five floors, floor 1 lowest. X is on the top floor. V is immediately
                below X. Y is on the lowest floor. Exactly one floor separates W and Y.`,
      q: 'Who lives on floor 2?',
      options: ['W', 'Z', 'V', 'Nobody'],
      answer: 1,
      whyRight: `Exactly. X on 5, V on 4, Y on 1. "Exactly one floor separates W and Y" gives
                 |W − 1| = 2, so W is on floor <b>3</b>. The only person and floor left over are
                 <b>Z on floor 2</b>.`,
      whyWrong: `Build it up. X → floor 5. V immediately below X → floor 4. Y → floor 1.<br><br>
                 "Exactly one floor separates W and Y" means one floor lies between them, so the
                 difference is 2: W is on floor <b>3</b>.<br><br>
                 Floors 5, 4, 3 and 1 are taken, so <b>Z</b> must be on floor <b>2</b>.
                 If you answered W, you read "one floor separates" as a difference of one.`,
    },
  ],
};
