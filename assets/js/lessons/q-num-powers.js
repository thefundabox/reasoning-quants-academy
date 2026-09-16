/* ============================================================
   Quants · Unit 1 · Lesson 5 — Squares, Cubes & Roots
   ============================================================ */

import { powerGrid } from '../widgets/number-lab.js';

const GRID = { max: 30 };

export default {
  id: 'q.num.powers',
  title: 'Squares, Cubes & Roots',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.pct.ladder',
  nextLabel: 'Next unit: The Percent Ladder →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'One of these is not a perfect square',
      say: `<b>1,444 · 2,916 · 3,468 · 4,225</b><br><br>
            You do not need to take a single square root. Three of them can be squares. One of them
            <b>cannot</b>, and you can see which by looking at its last digit.<br><br>
            A square never ends in 2, 3, 7 or 8. Ever.`,
      cta: 'Why never?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Squares to 30, and the two patterns inside them',
      say: `Knowing the squares to 30 is worth memorising outright. But the two <b>patterns</b> are
            worth more, because they let you build the ones you have forgotten.`,
      body: `
        <p><b>Pattern one — the gaps are odd, and they grow by two.</b></p>
        <p>From n−1 to n the square grows by <code>2n − 1</code>. So if you know 25² = 625, then
           26² = 625 + <b>51</b> = <b>676</b>. And 27² = 676 + 53 = 729. You can walk up the table
           from any anchor you remember, adding odd numbers, with no multiplication at all.</p>
        <p><b>Pattern two — the last digit is heavily restricted.</b></p>
        <p>Square the digits 0 to 9 and look at how they end: 0, 1, 4, 9, 6, 5, 6, 9, 4, 1. So a
           perfect square can only end in <b>0, 1, 4, 5, 6 or 9</b>. It can <b>never</b> end in
           <b>2, 3, 7 or 8</b> — which eliminates options instantly, and costs one glance.</p>
        <p><b>Two more things worth having.</b></p>
        <ul>
          <li><b>Anything ending in 5 squares easily.</b> For 35²: take the 3, multiply by the next
              number up (4) to get 12, and write 25 after it — <b>1,225</b>. It works for every such
              number: 45² = 2,025, 85² = 7,225.</li>
          <li><b>Cubes keep or swap their last digit.</b> 0, 1, 4, 5, 6 and 9 stay put; 2 and 8 swap
              with each other, as do 3 and 7. So a cube ending in 3 has a root ending in 7.</li>
        </ul>
        <p><b>A caution on the digit test.</b> It only ever rules things <em>out</em>. 3,464 ends in
           4 and is still not a square. To rule something <em>in</em> you must find the root.</p>`,
      cta: 'Show me the table',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'The gaps, the cubes, and the endings',
      say: `Three views of the same idea. Start with the squares and read the little numbers on the
            right — those are the gaps.<br><br>
            Then look at the last-digit view. That single row is what lets you throw options away
            without computing anything.`,
      widget: powerGrid(GRID),
      __cfg: GRID,
      tasks: [
        { label: 'Look at all three views', done: s => s.seenAll },
      ],
      onComplete: `The gaps are every odd number in order — 3, 5, 7, 9… which is another way of
                   saying that the sum of the first n odd numbers is n².`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'square-last-digit', conceptLabel: 'The last digit rules a square out',
      say: `The four from the start. One glance each.`,
      context: `<b>1,444 · 2,916 · 3,468 · 4,225</b>`,
      q: 'Which cannot possibly be a perfect square?',
      options: ['1,444', '2,916', '3,468', '4,225'],
      answer: 2,
      whyRight: `Correct. It ends in <b>8</b>, and no square ever does. The others check out —
                 1,444 = 38², 2,916 = 54², 4,225 = 65².`,
      whyWrong: `Square each digit 0–9 and look only at how the result ends: 0, 1, 4, 9, 6, 5, 6, 9,
                 4, 1. So the only possible final digits are <b>0, 1, 4, 5, 6, 9</b>.<br><br>
                 <b>1,444</b> ends in 4 — possible, and indeed 38² = 1,444.<br>
                 <b>2,916</b> ends in 6 — possible, and 54² = 2,916.<br>
                 <b>3,468</b> ends in <b>8</b> — <b>impossible</b>. Done, in one glance.<br>
                 <b>4,225</b> ends in 5 — possible, and 65² = 4,225 (note the "5 trick": 6 × 7 = 42,
                 then 25).<br><br>
                 The test is one-way: it proves 3,468 is not a square, but the other three needed a
                 root to confirm.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Building squares you never memorised',
      say: `Two anchors and some addition will get you anywhere in the table.`,
      steps: [
        `<b>The gap rule.</b> n² − (n−1)² = <b>2n − 1</b>. From 25² = 625, the next gap is
         2(26) − 1 = <b>51</b>, so 26² = <b>676</b>. Then +53 gives 27² = 729, +55 gives 28² = 784.`,
        `<b>Anchor on the round numbers.</b> 20² = 400, 25² = 625, 30² = 900. Any square in between
         is a few odd-number steps from one of these, in whichever direction is shorter.`,
        `<b>Numbers ending in 5.</b> 65²: take 6, multiply by 7 → 42, append 25 → <b>4,225</b>.
         The reason is that (10a + 5)² = 100a(a+1) + 25, so the "a × (a+1)" and the "25" never
         interfere with each other.`,
        `<b>The last-digit filter.</b> Endings 2, 3, 7 and 8 are impossible for a square. For cubes
         nothing is impossible, but the last digit is fixed: 2↔8, 3↔7, and the rest stay. So a cube
         ending in 2 has a root ending in 8 — which is how you know 1,728's root ends in 2, and
         since 1,728 sits between 10³ and 20³, it must be <b>12</b>.`,
        `<b>Sum of odd numbers.</b> 1 + 3 + 5 + … + (2n−1) = n². It is the gap rule read backwards,
         and it occasionally appears as a question in its own right.`,
      ],
      takeaway: `Memorise squares to 30 if you can, but memorise the gap rule (2n − 1) and the
                 impossible endings (2, 3, 7, 8) regardless. The first rebuilds the table; the
                 second deletes options for free.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'square-gap-rule', conceptLabel: 'Walking the table with 2n − 1',
      input: 'number', answer: 676, unit: 'is 26 squared',
      context: `You remember that <b>25² = 625</b> but not 26².`,
      q: 'What is 26²?',
      why: `The gap from 25² to 26² is <code>2 × 26 − 1 = <b>51</b></code>.<br><br>
            <code>625 + 51 = <b>676</b></code><br><br>
            No multiplication needed. And the check is instant: a square of a number ending in 6
            must itself end in 6 — which 676 does.<br><br>
            Going the other way works too: 24² = 625 − (2 × 25 − 1) = 625 − 49 = 576.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'cube-last-digit', conceptLabel: 'A cube keeps or swaps its last digit',
      input: 'number', answer: 12, unit: 'is the cube root',
      context: `<b>1,728</b> is a perfect cube.`,
      q: 'What is its cube root?',
      why: `Two observations, no calculation.<br><br>
            <b>Size.</b> 10³ = 1,000 and 20³ = 8,000, so the root is between 10 and 20 — the tens
            digit is <b>1</b>.<br><br>
            <b>Last digit.</b> The cube ends in <b>8</b>, and in cubes 2 and 8 swap. So the root
            ends in <b>2</b>.<br><br>
            Put them together: <b>12</b>. And 12³ = 1,728. ✓<br><br>
            This two-step method finds any cube root up to 99³ instantly, which is well past
            anything the paper will ask.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'square-last-digit', conceptLabel: 'The last digit rules a square out',
      say: `Careful — the digit test only ever rules things out.`,
      context: `A candidate says: "3,464 ends in 4, and squares can end in 4, so 3,464 is a
                perfect square."`,
      q: 'What is wrong with that reasoning?',
      options: [
        'Nothing — the reasoning is sound',
        'Squares cannot end in 4 at all',
        'The test can only rule squares out, never in — and 3,464 lies between 58² and 59²',
        '3,464 is odd, so it cannot be a square',
      ],
      answer: 2,
      whyRight: `Exactly. 58² = 3,364 and 59² = 3,481, so 3,464 falls between two consecutive
                 squares and cannot be one. The ending was necessary, not sufficient.`,
      whyWrong: `The last-digit test is a <b>one-way</b> filter. Ending in 2, 3, 7 or 8 proves a
                 number is <em>not</em> a square; ending in 0, 1, 4, 5, 6 or 9 proves
                 <em>nothing</em>.<br><br>
                 To settle 3,464 you need the root. Anchor: 60² = 3,600, which is above it. Step
                 down — 59² = 3,600 − 119 = 3,481, still above. 58² = 3,481 − 117 = <b>3,364</b>.<br><br>
                 So 3,464 sits between 58² and 59², and there is no whole number in between. Not a
                 square.<br><br>
                 (3,464 is also even, so "odd" is simply wrong — and evenness would not disqualify
                 it anyway, since 4, 16 and 36 are all even squares.)`,
    },
  ],
};
