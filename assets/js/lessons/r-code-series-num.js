/* ============================================================
   Reasoning · Unit 5 · Lesson 3 — Number Series
   ============================================================ */

import { seriesChain } from '../widgets/series-chain.js';

const CHAIN = { terms: [2, 5, 11, 23, 47, 95],
                label: 'Find the rule in every gap, then the missing term' };

export default {
  id: 'r.code.series-num',
  title: 'Number Series',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.code.series-let',
  nextLabel: 'Next: Letter & Mixed Series →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'You will find the answer and not notice',
      say: `<b>2, 5, 11, 23, 47, ?</b><br><br>
            Most candidates take the differences — <b>3, 6, 12, 24</b> — see that they are not
            constant, conclude the method failed, and start again from scratch.<br><br>
            But look at that row of differences. It is a perfectly good series in its own right, and
            it has already handed you the answer. The method did not fail; the candidate stopped one
            step too early.`,
      cta: 'Show me the order',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Always test in the same order',
      say: `Number series feel like inspiration. They are not — they are a <b>checklist</b>, run in a
            fixed order, and the order is what makes it fast.`,
      body: `
        <ol>
          <li><b>Differences.</b> Subtract each term from the next. Constant? It is an arithmetic series, done.</li>
          <li><b>Differences of the differences.</b> If the first row is not constant, take differences again —
              or check whether that row is itself a familiar series. This is the step people skip.</li>
          <li><b>Ratios.</b> Divide each term by the previous. Constant? Geometric. Growing fast is the signal to
              divide rather than subtract.</li>
          <li><b>Multiply and adjust.</b> Try ×2 ± 1, ×3 ± 2. Fits many series that look chaotic.</li>
          <li><b>Squares and cubes.</b> Compare against 1, 4, 9, 16, 25 … and 1, 8, 27, 64 …, allowing a constant offset.</li>
          <li><b>Alternate terms.</b> If nothing works, read positions 1, 3, 5 as one series and 2, 4, 6 as another.
              Sudden zig-zags are the tell.</li>
          <li><b>Sum of the previous two.</b> The Fibonacci family — check it last, it is rarer.</li>
        </ol>
        <p>Run them in that order and you will never stare at a series wondering where to begin.
           The commonest failure is not ignorance of the patterns — it is <b>stopping after step 1</b>.</p>`,
      cta: 'Let me build a chain',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Build the operation in every gap',
      say: `Choose the operator and the number for each gap, then predict the hidden term.
            The bars are there so the <em>shape</em> of the growth is visible — flat, steep, or exploding.`,
      widget: seriesChain(CHAIN),
      __cfg: CHAIN,
      tasks: [
        { label: 'Get every gap in the chain correct', done: s => s.chainSolved },
        { label: 'Predict the hidden term', done: s => s.predicted },
      ],
      onComplete: 'Each gap doubled the one before it. That was visible in the bars before any arithmetic.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'second-differences', conceptLabel: 'Taking differences twice',
      say: `Commit first. Step 1, then <b>step 2</b> — do not stop at one row.`,
      context: `Find the next term: <b>3, 7, 13, 21, 31, ?</b>`,
      q: 'What comes next?',
      options: ['41', '43', '45', '42'],
      answer: 1,
      whyRight: `Correct. The differences are 4, 6, 8, 10 — not constant, so take differences again:
                 2, 2, 2. Constant. The next difference is 12, so the next term is 31 + 12 = <b>43</b>.`,
      whyWrong: `Row one: differences are <b>4, 6, 8, 10</b>. Not constant — but do not abandon the method.<br><br>
                 Row two: differences of that row are <b>2, 2, 2</b>. Constant. So the differences grow
                 by 2 each time, and the next difference is 10 + 2 = <b>12</b>.<br><br>
                 The next term is 31 + 12 = <b>43</b>. Answering 41 means you assumed the difference
                 stayed at 10 — that is stopping at step 1.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The hook, run through the checklist',
      say: `Two steps of the checklist and it is finished.`,
      steps: [
        `<b>Step 1 — differences.</b> 2, 5, 11, 23, 47 gives <b>3, 6, 12, 24</b>. Not constant, so an arithmetic series it is not. Do not restart.`,
        `<b>Step 2 — look at that row.</b> 3, 6, 12, 24 is doubling. The differences form a geometric series, so the next difference is <b>48</b>.`,
        `<b>Answer.</b> 47 + 48 = <b>95</b>.`,
        `<b>The same series, seen another way.</b> Each term is <code>previous × 2 + 1</code>: 2×2+1 = 5, 5×2+1 = 11, 11×2+1 = 23. That is checklist step 4, and it lands on the same 95. When two routes agree, you are done.`,
      ],
      takeaway: `A non-constant difference row is not a dead end — it is a new series to solve. Most people abandon the method exactly one step before it works.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'ratios-first', conceptLabel: 'Switching from differences to ratios',
      context: `Find the next term: <b>5, 15, 45, 135, ?</b>`,
      q: 'What comes next?',
      options: ['270', '405', '360', '540'],
      answer: 1,
      why: `The differences are 10, 30, 90 — growing fast, and that speed is the signal to stop
            subtracting and start <b>dividing</b>.<br><br>
            Ratios: 15 ÷ 5 = 3, 45 ÷ 15 = 3, 135 ÷ 45 = 3. Constant, so it is geometric with ratio 3.<br><br>
            Next term = 135 × 3 = <b>405</b>. Answering 270 doubles instead of tripling.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'alternate-terms', conceptLabel: 'Reading alternate terms as two series',
      context: `Find the next term: <b>1, 10, 3, 8, 5, 6, ?</b>`,
      q: 'What comes next?',
      options: ['4', '7', '8', '5'],
      answer: 1,
      why: `The zig-zag up and down is the tell for checklist step 6. Split it into two series.<br><br>
            <b>Positions 1, 3, 5:</b> 1, 3, 5 — rising by 2. <br>
            <b>Positions 2, 4, 6:</b> 10, 8, 6 — falling by 2.<br><br>
            The next term sits at position 7, which belongs to the <em>first</em> series: after 5 comes
            <b>7</b>.<br><br>
            Trying to find one rule for the whole row is hopeless here — no single operation goes
            up, down, up, down like that.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'second-differences', conceptLabel: 'Taking differences twice',
      say: `The series from the start.`,
      context: `Find the next term: <b>2, 5, 11, 23, 47, ?</b>`,
      q: 'What comes next?',
      options: ['94', '95', '96', '71'],
      answer: 1,
      whyRight: `Exactly. Differences 3, 6, 12, 24 double each time, so the next is 48 and the answer is
                 47 + 48 = <b>95</b>. The cross-check confirms it: each term is previous × 2 + 1,
                 and 47 × 2 + 1 = 95. ✓`,
      whyWrong: `Differences: <b>3, 6, 12, 24</b>. Not constant — but that row is itself doubling,
                 so the next difference is <b>48</b>.<br><br>
                 47 + 48 = <b>95</b>.<br><br>
                 Cross-check with checklist step 4: each term is previous × 2 + 1.
                 47 × 2 + 1 = 95 ✓. Answering 94 is the ×2 rule without the +1.`,
    },
  ],
};
