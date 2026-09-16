/* ============================================================
   Reasoning · Unit 7 · Lesson 1 — Figure Counting
   ============================================================ */

import { figureCount } from '../widgets/figure-count.js';

export default {
  id: 'r.vis.count',
  title: 'Figure Counting',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.vis.mirror',
  nextLabel: 'Next: Mirror & Water Images →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Everyone counts eight. There are fourteen.',
      say: `A plain <b>3 × 3 grid</b>. How many squares?<br><br>
            Almost everyone says nine — the nine little boxes — and moves on satisfied.
            The answer is <b>fourteen</b>, because a 2 × 2 block is also a square, and so is the
            whole grid.<br><br>
            The mistake is never arithmetic. It is <b>counting at random</b> instead of by size.`,
      cta: 'Show me the method',
    },
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Count by size class, and formulas where they fit',
      say: `Random scanning guarantees you will miss some and double-count others. Sorting by size
            guarantees neither can happen.`,
      body: `
        <p><b>The method:</b> pick the smallest possible sub-figure and count every one of that size.
           Then the next size up. Then the next. Add at the end. You never need to remember which
           ones you have already seen, because size does the bookkeeping for you.</p>
        <p><b>Formulas worth knowing, for the regular cases:</b></p>
        <ul>
          <li><b>Squares in an n × n grid:</b> 1² + 2² + … + n². For 3 × 3 that is 9 + 4 + 1 = <b>14</b>.</li>
          <li><b>Rectangles in an r × c grid:</b> C(r+1, 2) × C(c+1, 2) — choose two of the horizontal
              lines and two of the vertical ones. A 2 × 3 grid gives C(3,2) × C(4,2) = 3 × 6 = <b>18</b>.</li>
          <li><b>Triangles in a fan</b> whose base is split into n parts: n(n+1)/2. Four parts → <b>10</b>.</li>
        </ul>
        <p><b>The reading trap:</b> "squares" and "rectangles" are different questions. Every square is
           a rectangle, so a rectangle count is always the larger number. Underline which word the
           paper actually used before you count anything.</p>`,
      cta: 'Let me hunt them',
    },
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Click every sub-figure, smallest size first',
      say: `Only the current size class is clickable, which forces the discipline on you.
            Finish a class and I move you to the next.`,
      widget: figureCount({ start: 0 }),
      __cfg: { start: 0 },
      tasks: [
        { label: 'Find every sub-figure in the first figure', done: s => s.allFound },
        { label: 'Complete at least <b>two</b> size classes', done: s => s.classesComplete >= 2 },
      ],
      onComplete: 'Nine, then four, then one. In that order it is impossible to miss any.',
      ctaDone: 'Test me',
    },
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'count-by-class', conceptLabel: 'Counting by size class',
      say: `Commit first. Count by size, not by eye.`,
      context: `A square has <b>both diagonals</b> drawn in — nothing else.`,
      q: 'How many triangles does it contain?',
      options: ['4', '6', '8', '10'],
      answer: 2,
      whyRight: `Correct. Four small triangles meet at the centre, and each diagonal cuts the square
                 into two large half-square triangles — that is four more. 4 + 4 = <b>8</b>.`,
      whyWrong: `Count by size.<br><br>
                 <b>Small:</b> the two diagonals cut the square into <b>4</b> triangles meeting at the centre.<br>
                 <b>Large:</b> each diagonal splits the whole square into two halves, and there are two
                 diagonals — <b>4</b> more.<br><br>
                 4 + 4 = <b>8</b>. Answering 4 means you stopped after the first size class, which is
                 exactly the habit this lesson exists to break.`,
    },
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The 3 × 3 grid, class by class',
      say: `Three passes, and the fourteen appear without effort.`,
      steps: [
        `<b>Size 1 — single cells.</b> The grid is 3 across and 3 down, so there are 3 × 3 = <b>9</b>.`,
        `<b>Size 2 — 2 × 2 blocks.</b> The top-left corner of such a block can sit in 2 columns and 2 rows, so 2 × 2 = <b>4</b>.`,
        `<b>Size 3 — the whole grid.</b> Exactly <b>1</b>.`,
        `<b>Add them.</b> 9 + 4 + 1 = <b>14</b>, which is the formula 1² + 2² + 3² read from the other direction. The formula is not a shortcut you memorise — it <em>is</em> the size-class count.`,
      ],
      takeaway: `Smallest size first, then the next, then add. Never scan a figure at random, and always check whether the question said squares or rectangles.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'squares-vs-rectangles', conceptLabel: 'Squares are not rectangles',
      context: `A grid is <b>2 rows by 3 columns</b>.`,
      q: 'How many rectangles does it contain (squares included)?',
      options: ['6', '12', '18', '24'],
      answer: 2,
      why: `A rectangle is fixed by choosing <b>two of the vertical lines</b> and <b>two of the
            horizontal lines</b>.<br><br>
            A 2 × 3 grid has 4 vertical lines and 3 horizontal ones: C(4,2) × C(3,2) = 6 × 3 = <b>18</b>.<br><br>
            Answering 6 counts only the single cells — the first size class and nothing else.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'fan-formula', conceptLabel: 'The triangle-fan formula',
      context: `Lines are drawn from a single apex to <b>5 points</b> along a base line, dividing the
                base into <b>4 equal parts</b>.`,
      q: 'How many triangles are formed?',
      options: ['4', '10', '15', '8'],
      answer: 1,
      why: `Every triangle is fixed by choosing <b>two of the five rays</b> from the apex:
            C(5,2) = <b>10</b>.<br><br>
            Read by size class it is the same number: 4 single-part triangles + 3 two-part + 2 three-part
            + 1 four-part = 4 + 3 + 2 + 1 = <b>10</b>. That is the formula n(n+1)/2 with n = 4.`,
    },
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'count-by-class', conceptLabel: 'Counting by size class',
      say: `The grid from the start.`,
      context: `A plain <b>3 × 3 grid</b> of nine cells.`,
      q: 'How many squares does it contain?',
      options: ['9', '13', '14', '18'],
      answer: 2,
      whyRight: `Exactly. 9 single cells + 4 blocks of 2 × 2 + 1 whole grid = <b>14</b>,
                 which is 1² + 2² + 3².<br><br>
                 Note that 18 is the answer to a <em>different</em> question — how many
                 <b>rectangles</b> the same grid contains. The word in the question decides everything.`,
      whyWrong: `Count by size class.<br><br>
                 <b>1 × 1:</b> 9 · <b>2 × 2:</b> 4 · <b>3 × 3:</b> 1<br><br>
                 Total = <b>14</b>, i.e. 1² + 2² + 3².<br><br>
                 Answering 9 stops at the first class. Answering 18 counts <em>rectangles</em>,
                 which is a different question entirely.`,
    },
  ],
};
