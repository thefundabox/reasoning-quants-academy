/* ============================================================
   Reasoning · Unit 4 · Lesson 2 — Linear Seating
   ============================================================ */

import { seatBoard, solvedBoard } from '../widgets/seat-board.js';

const PUZZLE = {
  type: 'row', n: 5, facing: 'N', people: ['P', 'Q', 'R', 'S', 'T'],
  clues: [
    { text: '<b>R</b> sits exactly in the middle.',            test: p => p.R === 2 },
    { text: '<b>Q</b> sits immediately to <b>R</b>\'s left.',  test: (p, H) => H.left(p.R) === p.Q && p.Q != null },
    { text: '<b>T</b> sits second to <b>R</b>\'s right.',      test: (p, H) => H.right(H.right(p.R)) === p.T && p.T != null },
    { text: '<b>P</b> sits at one of the two ends.',           test: (p, H) => H.isEnd(p.P) },
  ],
};

export default {
  id: 'r.ord.linear',
  title: 'Linear Seating',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.ord.circular',
  nextLabel: 'Next: Circular Seating →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Same clues. Forty seconds, or four minutes.',
      say: `Five people — <b>P, Q, R, S, T</b> — sit in a row, all facing <b>North</b>.<br><br>
            <b>R is exactly in the middle. Q is immediately to R's left. T is second to R's right.
            P is at one of the ends.</b><br><br>
            Every candidate has the same four clues. What separates a forty-second solve from a
            four-minute one is not cleverness — it is <b>which clue you use first</b>.`,
      cta: 'Show me the order',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Rank your clues before you place anyone',
      say: `Clues are not equal. Some pin a person to a seat; some only relate two people;
            some merely forbid something. Use them in that order.`,
      body: `
        <p><b>Strongest first — these fix a seat outright:</b></p>
        <ul>
          <li>"sits exactly in the middle" · "third from the left" · "at the extreme right end"</li>
        </ul>
        <p><b>Then the chaining clues — these fix a seat once one end is known:</b></p>
        <ul>
          <li>"immediately to the left of X" · "second to the right of X" · "sits between X and Y"</li>
        </ul>
        <p><b>Last, the negative clues — these only eliminate:</b></p>
        <ul>
          <li>"is not adjacent to X" · "does not sit at an end"</li>
        </ul>
        <p>Starting with a negative clue is the single commonest way to lose four minutes. It tells
           you where someone <em>is not</em>, which is worth almost nothing until the board is half full.</p>
        <p>Two words to read with care:</p>
        <ul>
          <li><b>"Immediately"</b> means the very next seat. Without it, "to the left of X" means
              <em>anywhere</em> to the left — a much weaker statement.</li>
          <li><b>"Second to the right"</b> means two seats along, not the second person you meet
              who happens to be on the right.</li>
        </ul>
        <p>And always check the facing. This row faces North — away from you — so <b>their left is your left</b>.</p>`,
      cta: 'Let me solve it',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Place them, and watch the clues go green',
      say: `Tap a person, then tap a seat. The clues test themselves as you go — start with the
            middle one and see how fast the rest fall.`,
      widget: seatBoard(PUZZLE),
      __cfg: PUZZLE,
      __puzzle: PUZZLE,          // exposed so the harness can brute-force it
      tasks: [
        { label: 'Anchor <b>R</b> in the middle seat', done: s => s.pos.R === 2 },
        { label: 'Get every clue to turn green', done: s => s.cluesOk === s.cluesTotal },
        { label: 'Seat all five people', done: s => s.placedAll },
      ],
      onComplete: 'Notice you never guessed. Each clue had exactly one seat left to give.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'clue-order', conceptLabel: 'Choosing which clue to use first',
      say: `Commit first. This is about method, not arithmetic.`,
      context: `Six friends sit in a row facing North. You are given these four clues:<br>
                (i) <b>C is not adjacent to D.</b>
                (ii) <b>A sits at the extreme left end.</b>
                (iii) <b>B sits immediately to A's right.</b>
                (iv) <b>E does not sit at either end.</b>`,
      q: 'Which clue should you use first?',
      options: ['Clue (i)', 'Clue (ii)', 'Clue (iii)', 'Clue (iv)'],
      answer: 1,
      whyRight: `Correct. Clue (ii) pins <b>A</b> to a specific seat with no other information needed —
                 it is the only clue that fixes a person outright. Clue (iii) then becomes free,
                 because once A is placed, "immediately to A's right" is a single seat.
                 Clues (i) and (iv) are negatives and are worth almost nothing on an empty row.`,
      whyWrong: `Rank them. Clue (ii) — "extreme left end" — <b>fixes a seat on its own</b>, with no
                 dependency on anything else. Nothing beats that.<br><br>
                 Clue (iii) is strong but only <em>after</em> A is placed. Clues (i) and (iv) are
                 negatives: they eliminate possibilities but place nobody, and on an empty board they
                 eliminate almost nothing.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The puzzle, solved in four moves',
      say: `Watch how each clue leaves exactly one option.`,
      steps: [
        `<b>Anchor.</b> "R is exactly in the middle" of five seats → seat 3. This is the only clue that needs nothing else, so it goes first.`,
        `<b>Chain left.</b> The row faces North, so their left is your left. "Q is immediately to R's left" → seat 2.`,
        `<b>Chain right.</b> "T is second to R's right" — two seats along from seat 3 → seat 5, the right-hand end.`,
        `<b>Now the weak clue finally pays.</b> "P is at an end": seat 5 is taken by T, so P must take seat 1. <b>S</b> drops into the only seat left, seat 4. Four clues, five people, no guessing.`,
      ],
      widget: solvedBoard({ type: 'row', n: 5, facing: 'N', pos: { P: 0, Q: 1, R: 2, S: 3, T: 4 } }),
      __solution: { P: 0, Q: 1, R: 2, S: 3, T: 4 },
      takeaway: `Anchor with a clue that fixes a seat alone. Chain the relative clues off it. Save every negative clue for last — by then it usually has only one seat left to forbid.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'immediate-vs-somewhere', conceptLabel: '"Immediately" vs "somewhere"',
      context: `Six people sit in a row facing North. <b>M is second from the left end</b>, and
                <b>N sits immediately to M's right</b>.`,
      q: 'What is N\'s position from the left end?',
      options: ['2nd', '3rd', '4th', '1st'],
      answer: 1,
      why: `"Second from the left" puts M in seat 2. The row faces North — away from you — so
            their right is your right, and "immediately to M's right" is the very next seat along:
            seat <b>3</b>.<br><br>
            Had the clue read simply "to M's right", N could have been in seat 3, 4, 5 or 6, and you
            could place nobody. That one word is the difference between a fixed seat and a guess.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'clue-order', conceptLabel: 'Choosing which clue to use first',
      context: `Seven students sit in a row. <b>V sits fourth from the left.</b>
                <b>W sits three places to the right of V.</b>`,
      q: 'What is W\'s position from the right end?',
      options: ['1st', '2nd', '3rd', '4th'],
      answer: 0,
      why: `V is in seat 4. Three places to the right is seat 4 + 3 = seat <b>7</b>, which is the last
            seat in a row of seven.<br><br>
            From the right end, seat 7 is the <b>1st</b>. Using the identity from the previous lesson:
            7 − 7 + 1 = 1. ✓ The two lessons chain together — position questions and seating questions
            are the same arithmetic.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'linear-solve', conceptLabel: 'Solving a linear arrangement',
      say: `Back to the five from the start. You have the arrangement now — read it off.`,
      context: `<b>P, Q, R, S, T</b> face North. R is exactly in the middle. Q is immediately to R's left.
                T is second to R's right. P sits at one of the ends.`,
      q: 'Who sits between P and R?',
      options: ['S', 'Q', 'T', 'Nobody'],
      answer: 1,
      whyRight: `Exactly. The row from your left is <b>P, Q, R, S, T</b>. P is in seat 1 and R in seat 3,
                 so the only person between them is <b>Q</b> in seat 2 — which is precisely the clue
                 that put Q there in the first place.`,
      whyWrong: `Rebuild it in order. R is middle → seat 3. Q immediately left of R → seat 2.
                 T second to R's right → seat 5. P at an end, and seat 5 is taken → seat 1.
                 S takes the last free seat → seat 4.<br><br>
                 The row reads <b>P, Q, R, S, T</b>. Between P (seat 1) and R (seat 3) sits <b>Q</b>.`,
    },
  ],
};
