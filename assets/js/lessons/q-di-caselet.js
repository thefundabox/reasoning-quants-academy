/* ============================================================
   Quants · Unit 7 · Lesson 4 — Caselets & Mixed Sets
   ============================================================ */

import { dataTable, pct } from '../widgets/di-lab.js';

/* The paragraph, turned into the 2 x 2 table it was always describing. */
export const COLLEGE = 1200;
export const GRID = {
  Boys:  [288, 432],     // science, not science
  Girls: [264, 216],
};

const CASELET = {
  title: 'The paragraph, as the table it was hiding',
  rows: ['Boys', 'Girls'], cols: ['Science', 'Other'], data: GRID,
  questions: [
    { label: 'Total science students',
      cells: (d, rows) => rows.map(r => [r, 'Science']),
      answer: (d, T) => T.colTotals[0], working: () => '288 + 264' },
    { label: 'Girls as a share of science students',
      cells: () => [['Girls', 'Science']],
      answer: (d, T) => pct(d.Girls[0], T.colTotals[0]), unit: '%',
      working: (d, T) => `264 ÷ ${T.colTotals[0]} × 100` },
    { label: 'Non-science boys to girls',
      cells: () => [['Boys', 'Other'], ['Girls', 'Other']],
      answer: d => `${d.Boys[1] / d.Girls[1]} : 1`,
      working: () => '432 : 216' },
    { label: 'Science students as a share of the college',
      cells: (d, rows) => rows.flatMap(r => ['Science', 'Other'].map(c => [r, c])),
      answer: (d, T) => pct(T.colTotals[0], T.grand), unit: '%',
      working: (d, T) => `${T.colTotals[0]} ÷ ${T.grand} × 100` },
  ],
};

export default {
  id: 'q.di.caselet',
  title: 'Caselets & Mixed Sets',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.di.speed',
  nextLabel: 'Next: DI Under Time Pressure →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'A paragraph is a table in disguise',
      say: `<em>"In a college of 1,200 students, 60% are boys. Of the boys, 40% study science; of
            the girls, 55% do."</em><br><br>
            Four questions will follow, and every one of them is about the same <b>2 × 2 table</b>
            — boys and girls, science and not.<br><br>
            Draw that table once, fill in four numbers, and the questions answer themselves. Try to
            hold it in your head and you will re-read the paragraph four times.`,
      cta: 'Show me the table',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Draw the grid before you read the questions',
      say: `A caselet gives you data in sentences instead of cells. Your first move is always the
            same: work out what the grid is, and fill it.`,
      body: `
        <p><b>Find the two dimensions.</b> Here they are <em>gender</em> and <em>subject</em>, so
           the grid is 2 × 2 with a total. Some caselets are 3 × 2, a few are 3 × 3 — but the
           method never changes.</p>
        <p><b>Fill it in the order the percentages allow.</b></p>
        <ul>
          <li>Boys: <code>60% of 1,200 = <b>720</b></code>; girls: <code>1,200 − 720 = <b>480</b></code>.
              Take the second by subtraction, not by computing 40% — fewer operations, fewer slips.</li>
          <li>Boys in science: <code>40% of 720 = <b>288</b></code>. Note this is 40% <em>of the
              boys</em>, not of the college.</li>
          <li>Girls in science: <code>55% of 480 = <b>264</b></code>.</li>
          <li>The rest fill by subtraction: 432 boys and 216 girls elsewhere.</li>
        </ul>
        <p><b>Check the grid closes.</b> <code>288 + 264 + 432 + 216 = 1,200</code>. ✓ Two minutes
           spent filling and checking the table buys you four questions at almost no cost each.</p>
        <p><b>Read every percentage's base.</b> This is where caselets are won and lost. "40% of the
           boys" is 40% of 720, not of 1,200. If a question later asks what percentage of the
           <em>college</em> studies science, that is a different base again:
           <code>552 ÷ 1,200 = 46%</code>.</p>
        <p><b>Ratios come straight from the cells.</b> Non-science boys to girls is
           <code>432 : 216 = <b>2 : 1</b></code>, read off without any percentage at all.</p>`,
      cta: 'Let me use the grid',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'One grid, four questions',
      say: `The paragraph has become a table. Pick each question and watch how few cells it
            needs.<br><br>
            Two of the four need a single row or column; one needs one cell. None of them needs the
            paragraph again.`,
      widget: dataTable(CASELET),
      __cfg: CASELET,
      tasks: [
        { label: 'Work through all four questions', done: s => s.seenAll },
        { label: 'Confirm the grid closes at 1,200', done: s => s.grand === 1200 && s.totalsAgree },
        { label: 'Find the question answered by a single cell', done: s => s.label.includes('share of science') },
      ],
      onComplete: `Every question came out of four numbers. Building the grid was the work; the
                   questions were almost free afterwards.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'caselet-grid', conceptLabel: 'Turn the paragraph into a grid',
      input: 'number', answer: 552, unit: 'students',
      say: `Fill the grid, then read it.`,
      context: `A college has <b>1,200</b> students, <b>60%</b> of them boys. <b>40%</b> of the boys
                and <b>55%</b> of the girls study science.`,
      q: 'How many students study science in total?',
      whyRight: `Correct. 720 boys and 480 girls; 40% of 720 is <b>288</b> and 55% of 480 is
                 <b>264</b>, so <code>288 + 264 = <b>552</b></code>.`,
      whyWrong: `Build the grid in order, and watch the base of each percentage.<br><br>
                 <b>Boys:</b> <code>60% of 1,200 = 720</code>. <b>Girls:</b>
                 <code>1,200 − 720 = 480</code>.<br><br>
                 <b>Boys in science:</b> <code>40% of 720 = 288</code> — 40% of the <em>boys</em>,
                 not of the college.<br>
                 <b>Girls in science:</b> <code>55% of 480 = 264</code>.<br><br>
                 <code>288 + 264 = <b>552</b></code><br><br>
                 A common wrong answer is <b>570</b>, from averaging the two percentages
                 (47.5% of 1,200). That treats the two groups as equal in size when there are 720
                 boys against 480 girls — the weighted-average trap from Unit 5, in new clothes.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Four numbers, then four answers',
      say: `The grid does all the work.`,
      steps: [
        `<b>Build it.</b> Boys 720, girls 480. Science: 288 boys and 264 girls. Everything else by
         subtraction: 432 boys and 216 girls. Check: <code>288 + 264 + 432 + 216 = <b>1,200</b></code>. ✓`,
        `<b>Total science.</b> The science column: <code>288 + 264 = <b>552</b></code>.`,
        `<b>Girls as a share of science students.</b> <code>264 ÷ 552 × 100 = <b>47.8%</b></code>.
         The base is the science students, not the girls and not the college — read which whole the
         question wants.`,
        `<b>Non-science boys to girls.</b> <code>432 : 216 = <b>2 : 1</b></code>, read straight off
         two cells with no percentage in sight.`,
        `<b>Science as a share of the college.</b> <code>552 ÷ 1,200 × 100 = <b>46%</b></code> —
         a third different base. Three questions, three wholes: this is what caselets test.`,
      ],
      takeaway: `Draw the grid, fill it with subtraction wherever you can, and check it closes.
                 Then read each question for <em>which whole</em> it wants as the denominator.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'caselet-base', conceptLabel: 'Read which whole the question wants',
      input: 'number', answer: 46, unit: 'percent',
      context: `Of the college's <b>1,200</b> students, <b>552</b> study science.`,
      q: 'What percentage of the college studies science?',
      why: `<code>552 ÷ 1,200 × 100 = <b>46%</b></code><br><br>
            The base here is the <b>whole college</b>. Contrast it with the earlier question, where
            the base was the science students themselves (264 ÷ 552 = 47.8%) — two similar-looking
            percentages from the same grid, answering completely different questions.<br><br>
            A fast route: 552 out of 1,200 — halve both to 276 out of 600, then again to 138 out of
            300, then to 46 out of 100. <b>46%</b>, with no long division.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'caselet-ratio', conceptLabel: 'Ratios come straight from the cells',
      context: `<b>432</b> boys and <b>216</b> girls do <b>not</b> study science.`,
      q: 'What is the ratio of non-science boys to non-science girls?',
      options: ['2 : 1', '3 : 2', '1 : 2', '9 : 5'],
      answer: 0,
      whyRight: `Correct. <code>432 : 216</code>, and 432 is exactly twice 216 — <b>2 : 1</b>.`,
      whyWrong: `Take the two cells and reduce.<br><br>
                 <code>432 : 216</code> — divide both by 216 → <b>2 : 1</b>.<br><br>
                 No percentages are needed at all, which is the point: once the grid is built,
                 ratio questions are read rather than computed.<br><br>
                 <b>1 : 2</b> is the answer reversed. There are more boys than girls outside
                 science, so the first number must be the larger one — a check worth half a second
                 on every ratio question.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'caselet-base', conceptLabel: 'Read which whole the question wants',
      say: `Same grid. A different denominator.`,
      context: `<b>288</b> boys and <b>264</b> girls study science, out of a college of
                <b>1,200</b>.`,
      q: 'What percentage of the science students are girls?',
      options: ['22%', '46%', '47.8%', '55%'],
      answer: 2,
      whyRight: `Correct. The whole is the <b>science students</b>: <code>264 ÷ 552 × 100 =
                 <b>47.8%</b></code>.`,
      whyWrong: `The phrase "of the science students" names the denominator.<br><br>
                 <code>264 ÷ (288 + 264) × 100 = 264 ÷ 552 × 100 = <b>47.8%</b></code><br><br>
                 <b>22%</b> is <code>264 ÷ 1,200</code> — girls in science as a share of the whole
                 <em>college</em>.<br><br>
                 <b>55%</b> is the figure from the paragraph: the percentage of <em>girls</em> who
                 study science. Its base is the 480 girls.<br><br>
                 <b>46%</b> is science students as a share of the college.<br><br>
                 Four plausible percentages, four different wholes, all from the same four cells.
                 That is exactly what a caselet is built to test — so name the denominator out loud
                 before you divide.`,
    },
  ],
};
