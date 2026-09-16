/* ============================================================
   Reasoning · Unit 4 · Lesson 3 — Circular Seating
   ============================================================ */

import { seatBoard, solvedBoard } from '../widgets/seat-board.js';

const PUZZLE = {
  type: 'circle', n: 6, facing: 'in', people: ['A', 'B', 'C', 'D', 'E', 'F'],
  clues: [
    { text: '<b>B</b> sits exactly opposite <b>A</b>.',
      test: (p, H) => p.A != null && p.B != null && H.opposite(p.A) === p.B },
    { text: '<b>C</b> sits immediately to <b>B</b>\'s left.',
      test: (p, H) => p.C != null && H.left(p.B) === p.C },
    { text: '<b>D</b> is <em>not</em> a neighbour of <b>A</b>.',
      test: (p, H) => p.A != null && p.D != null && !H.adjacent(p.D, p.A) },
    { text: '<b>E</b> sits immediately to <b>D</b>\'s right.',
      test: (p, H) => p.E != null && H.right(p.D) === p.E },
  ],
};

export default {
  id: 'r.ord.circular',
  title: 'Circular Seating',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.ord.floors',
  nextLabel: 'Next: Floors & Boxes →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Left, at a round table, is not the left of your page',
      say: `Eight people sit around a table, all facing the <b>centre</b>.
            Who sits immediately to the <b>left</b> of the person directly <b>opposite</b> you?<br><br>
            If you answered that without drawing, you guessed. Half of all candidates carry the wrong
            rule into the exam — and it is wrong in a way that quietly reverses every single clue.`,
      cta: 'Derive the rule with me',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Do not memorise this. Derive it in four seconds.',
      say: `Rules you memorise get reversed under pressure. This one you can rebuild from something
            you already proved in <b>Compass &amp; Turns</b>.`,
      body: `
        <p>Put a person at the <b>north seat</b> of the table, facing the centre.</p>
        <ol>
          <li>Facing the centre from the north seat means they are <b>facing South</b>.</li>
          <li>You already know: <b>facing South, your left hand points East</b>. (Stand up and check.)</li>
          <li>On the table, going from the north seat towards the east seat is the <b>clockwise</b> direction.</li>
        </ol>
        <p>Therefore, <b>facing the centre: left is clockwise, right is anticlockwise.</b>
           Facing <b>outward</b>, everything reverses — left becomes anticlockwise.</p>
        <p>Two more facts finish the chapter:</p>
        <ul>
          <li><b>Opposite</b> exists only when the number of seats is <b>even</b>. With <em>n</em> seats,
              the person opposite is <em>n</em>/2 seats along. With 8 people, opposite is 4 seats away;
              with 7, nobody is exactly opposite anyone.</li>
          <li><b>Rotations do not matter.</b> A circular arrangement has no seat number 1 — only an order.
              Place your first person anywhere and build around them.</li>
        </ul>`,
      cta: 'Let me seat them',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Six around a table, all facing in',
      say: `The little nose on each seat shows the facing. Place <b>A</b> anywhere you like —
            in a circle there is no seat one — then build outward and watch the clues test themselves.`,
      widget: seatBoard(PUZZLE),
      __cfg: PUZZLE,
      __puzzle: PUZZLE,          // exposed so the harness can brute-force it
      tasks: [
        { label: 'Seat <b>A</b> and put <b>B</b> opposite them', done: s => s.cluesOk >= 1 },
        { label: 'Get every clue to turn green', done: s => s.cluesOk === s.cluesTotal },
        { label: 'Seat all six people', done: s => s.placedAll },
      ],
      onComplete: 'And it worked from whichever seat you started. That is what "no seat one" means.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'circle-facing-in', conceptLabel: 'Left and right facing the centre',
      say: `Commit first. Rebuild the rule rather than recalling it.`,
      context: `Five friends sit around a round table, all facing the <b>centre</b>.
                Looking down at the table, in <b>clockwise</b> order they are:
                <b>A, B, C, D, E</b>.`,
      q: 'Who sits immediately to C\'s right?',
      options: ['D', 'B', 'A', 'E'],
      answer: 1,
      whyRight: `Correct. Facing the centre, <b>right is anticlockwise</b> — the direction you came from
                 in the clockwise listing. Going back one from C gives <b>B</b>.`,
      whyWrong: `Rebuild it: facing the centre, <b>left is clockwise</b>, so <b>right is anticlockwise</b>.<br><br>
                 The clockwise order is A, B, C, D, E. Anticlockwise from C is the person listed
                 <em>before</em> C — that is <b>B</b>.<br><br>
                 If you answered D, you used clockwise for "right", which is the reversed rule.
                 Check it from the north seat: facing the centre you face South, and facing South your
                 <em>left</em> hand points East, the clockwise way round.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The six, solved',
      say: `Same discipline as a row: anchor, chain, and leave the negative clue until last.`,
      steps: [
        `<b>Anchor anywhere.</b> A circle has no seat one, so drop <b>A</b> at the top. "B sits exactly opposite A" — with six seats, opposite means three seats along, so B goes to the bottom.`,
        `<b>Chain with the correct rule.</b> Facing the centre, left is clockwise. "C is immediately to B's left" → C takes the seat one step <b>clockwise</b> from B.`,
        `<b>Now the negative clue earns its keep.</b> "D is not a neighbour of A" rules out the two seats touching A. With A, B and C already placed, exactly one seat remains that D is allowed to take.`,
        `<b>Finish.</b> "E is immediately to D's right" → one step <b>anticlockwise</b> from D. <b>F</b> takes the last empty seat. Every clue holds, from whichever seat you started.`,
      ],
      widget: solvedBoard({ type: 'circle', n: 6, facing: 'in', pos: { A: 0, E: 1, D: 2, B: 3, C: 4, F: 5 } }),
      __solution: { A: 0, E: 1, D: 2, B: 3, C: 4, F: 5 },
      takeaway: `Facing in: left = clockwise. Facing out: left = anticlockwise. Opposite = n/2 seats along, and only when n is even.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'circle-facing-out', conceptLabel: 'The reversal when facing outward',
      context: `Six people sit around a round table, all facing <b>outward</b>, away from the table.
                Looking down, in <b>clockwise</b> order they are: <b>P, Q, R, S, T, U</b>.`,
      q: 'Who sits immediately to Q\'s left?',
      options: ['R', 'P', 'S', 'U'],
      answer: 1,
      why: `Facing <b>outward</b> reverses everything: left becomes <b>anticlockwise</b>.
            Anticlockwise from Q is the person listed before it — <b>P</b>.<br><br>
            Check it the same way as before. Sit at the north seat facing outward and you face
            <b>North</b>; facing North your left hand points <b>West</b>, and north → west is the
            anticlockwise way round the table. ✓`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'circle-opposite', conceptLabel: 'Finding the person opposite',
      context: `Eight people sit evenly around a circular table facing the centre.
                In clockwise order they are: <b>A, B, C, D, E, F, G, H</b>.`,
      q: 'Who sits directly opposite C?',
      options: ['F', 'G', 'H', 'E'],
      answer: 1,
      why: `With <b>8</b> seats, the person opposite is <b>8 ÷ 2 = 4</b> seats along.
            Counting four clockwise from C: D (1), E (2), F (3), <b>G</b> (4).<br><br>
            Direction does not matter for "opposite" — four seats anticlockwise from C also lands on G.
            And note that with an <em>odd</em> number of seats this question would have no answer at all.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'circle-facing-in', conceptLabel: 'Left and right facing the centre',
      say: `The question from the start, made concrete. Two steps: find the opposite, then turn.`,
      context: `Eight people sit around a table, all facing the <b>centre</b>. In clockwise order
                they are: <b>A, B, C, D, E, F, G, H</b>.`,
      q: 'Who sits immediately to the left of the person sitting opposite A?',
      options: ['D', 'F', 'H', 'B'],
      answer: 1,
      whyRight: `Exactly. Opposite A is four seats along → <b>E</b>. Facing the centre, left is
                 <b>clockwise</b>, so immediately to E's left is the next one clockwise: <b>F</b>.`,
      whyWrong: `Two steps, in order.<br><br>
                 <b>Step 1 — opposite.</b> Eight seats, so opposite is four along: A → B, C, D, <b>E</b>.<br><br>
                 <b>Step 2 — left.</b> Facing the centre, left is <b>clockwise</b>. One clockwise step
                 from E is <b>F</b>.<br><br>
                 If you answered D, you took left as anticlockwise — the reversed rule. Rebuild it from
                 the north seat whenever you doubt it.`,
    },
  ],
};
