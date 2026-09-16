/* ============================================================
   Quants · Unit 7 · Lesson 1 — Reading Tables
   ============================================================ */

import { dataTable, sum, pct, growth } from '../widgets/di-lab.js';

/* Exported so the last lesson of the unit can ask questions about the SAME
   table, and so the harness can recompute every total from one source. */
export const YEARS = ['2019', '2020', '2021', '2022'];
export const DISTRICTS = ['Jaipur', 'Kota', 'Bikaner', 'Udaipur'];
export const WHEAT = {
  Jaipur:  [120, 135, 150, 165],
  Kota:    [200, 190, 220, 240],
  Bikaner: [80, 95, 90, 110],
  Udaipur: [150, 160, 155, 175],
};

const TABLE = {
  title: 'Wheat production by district, in thousand quintals',
  rows: DISTRICTS, cols: YEARS, data: WHEAT, unit: '',
  questions: [
    { label: 'Largest four-year producer',
      cells: (d, rows) => rows.flatMap(r => YEARS.map(y => [r, y])),
      answer: (d, T, rows) => rows[T.rowTotals.indexOf(Math.max(...T.rowTotals))],
      working: (d, T) => `row totals: ${T.rowTotals.join(', ')}` },
    { label: 'Total in 2022',
      cells: (d, rows) => rows.map(r => [r, '2022']),
      answer: (d, T) => T.colTotals[3], unit: ' thousand quintals',
      working: () => '120-style column sum: 165 + 240 + 110 + 175' },
    { label: "Jaipur's growth, 2019 to 2022",
      cells: () => [['Jaipur', '2019'], ['Jaipur', '2022']],
      answer: d => growth(d.Jaipur[0], d.Jaipur[3]), unit: '%',
      working: () => '(165 − 120) ÷ 120 × 100' },
    { label: "Kota's share of the 2022 total",
      cells: (d, rows) => rows.map(r => [r, '2022']),
      answer: (d, T) => pct(d.Kota[3], T.colTotals[3]), unit: '%',
      working: (d, T) => `240 ÷ ${T.colTotals[3]} × 100` },
  ],
};

export default {
  id: 'q.di.tables',
  title: 'Reading Tables',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.di.bars',
  nextLabel: 'Next: Bar & Line Charts →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Read the question first. Then the table.',
      say: `A table of sixteen numbers arrives, and the instinct is to start understanding it.<br><br>
            Do not. Read the <b>question</b> first, find the two or three cells it actually needs,
            and ignore the other thirteen.<br><br>
            A DI set is not a comprehension test. It is a search problem.`,
      cta: 'Show me the search',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Three habits, and the marks look after themselves',
      say: `Everything in this unit is arithmetic you already have — percentages, ratios, averages.
            What is new is <b>navigation</b>.`,
      body: `
        <p><b>1 · Question first, always.</b> Each question names a row, a column, or a cell. Find
           it, compute, move on. Reading the whole table before the questions costs a minute and
           buys nothing.</p>
        <p><b>2 · Compute the totals you will need — once.</b> If several questions ask for shares
           of a year, write that column's total in the margin the first time and reuse it. Column
           totals here are <b>550, 580, 615, 690</b>, and the grand total <b>2,435</b>.</p>
        <p><b>3 · Check the table closes.</b> Row totals and column totals must both reach the same
           grand total. 570 + 850 + 375 + 640 = 2,435, and 550 + 580 + 615 + 690 = 2,435. ✓ If they
           disagree you have misread a figure — and it is far better to find that now than three
           questions later.</p>
        <p><b>Watch the units in the heading.</b> "Thousand quintals" means 240 is 2,40,000
           quintals. Almost every DI trap in the paper is a unit stated once, in small type, at the
           top of the table.</p>
        <p><b>The three question shapes.</b> Nearly all of them are one of:</p>
        <ul>
          <li><b>Largest / smallest</b> — compare, do not compute.</li>
          <li><b>Growth</b> — <code>(new − old) ÷ old × 100</code>, always divided by the
              <em>old</em> figure.</li>
          <li><b>Share</b> — <code>part ÷ whole × 100</code>, where the whole is a row or column
              total you may already have.</li>
        </ul>`,
      cta: 'Let me search the table',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Four questions, four small searches',
      say: `Pick a question and watch the cells it needs light up. Notice how few they are — never
            more than four out of the sixteen.<br><br>
            Row and column totals are computed for you here, but write them down yourself in the
            exam; you will reuse them.`,
      widget: dataTable(TABLE),
      __cfg: TABLE,
      tasks: [
        { label: 'Work through all four questions', done: s => s.seenAll },
        { label: 'Confirm the row and column totals agree', done: s => s.totalsAgree },
        { label: 'Find the question that needs only <b>two</b> cells', done: s => s.label.includes('growth') },
      ],
      onComplete: `The growth question needed two numbers out of sixteen. That is the ratio to
                   expect — and the reason reading the whole table first is wasted effort.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'di-question-first', conceptLabel: 'Find the cells the question needs',
      input: 'number', answer: 690, unit: 'thousand quintals',
      say: `One column. Nothing else.`,
      context: `Wheat production in <b>2022</b>: Jaipur <b>165</b>, Kota <b>240</b>, Bikaner
                <b>110</b>, Udaipur <b>175</b> thousand quintals.`,
      q: 'What was the total production in 2022?',
      whyRight: `Correct. <code>165 + 240 + 110 + 175 = <b>690</b></code>. Four cells, one addition,
                 and the other twelve numbers in the table were irrelevant.`,
      whyWrong: `Add the 2022 column and nothing else.<br><br>
                 <code>165 + 240 = 405</code><br>
                 <code>110 + 175 = 285</code><br>
                 <code>405 + 285 = <b>690</b></code><br><br>
                 Pairing the numbers before adding is faster than running down the column, and it
                 halves the chance of a slip.<br><br>
                 Keep this figure — the next question asks for Kota's share of it, and recomputing
                 the total would be the second most common waste of time in a DI set.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Four questions, and how little each one needed',
      say: `Count the cells used, not the cells present.`,
      steps: [
        `<b>Largest four-year producer.</b> This one genuinely needs all sixteen — but only as four
         row sums: 570, 850, 375, 640. <b>Kota</b>, comfortably.`,
        `<b>Total in 2022.</b> Four cells. <code>165 + 240 + 110 + 175 = <b>690</b></code>.`,
        `<b>Jaipur's growth 2019 → 2022.</b> <em>Two</em> cells.
         <code>(165 − 120) ÷ 120 × 100 = 45 ÷ 120 = <b>37.5%</b></code>. Divide by the
         <b>old</b> figure — dividing by 165 would give 27.3% and is the standard error.`,
        `<b>Kota's share of 2022.</b> <code>240 ÷ 690 × 100 = <b>34.78%</b></code>, reusing the
         total you already computed. Estimate first: 240/690 is a bit over a third, so ~35%. That
         alone separates the options in most papers.`,
        `<b>And the check.</b> Rows sum to 2,435; columns sum to 2,435. The table closes, so nothing
         was misread.`,
      ],
      takeaway: `Read the question, find its cells, compute, move on. Note the column totals once
                 and reuse them. Growth divides by the old figure; share divides by the total.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'di-growth', conceptLabel: 'Growth divides by the old figure',
      input: 'number', answer: 37.5, unit: 'percent', tol: 0.01,
      context: `Jaipur produced <b>120</b> thousand quintals in 2019 and <b>165</b> in 2022.`,
      q: 'What is the percentage growth over that period?',
      why: `<code>growth = (new − old) ÷ <b>old</b> × 100</code><br><br>
            <code>(165 − 120) ÷ 120 × 100 = 45 ÷ 120 × 100 = <b>37.5%</b></code><br><br>
            Dividing by the <em>new</em> figure instead gives <code>45 ÷ 165 = 27.3%</code> — a
            plausible-looking number that will always appear among the options.<br><br>
            Quick check with Unit 1's ladder: 45 out of 120 is a bit over a third, and a third
            would be 33.3%. 37.5% sits just above it. ✓ (It is also exactly 3/8, if you spotted
            that.)`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'di-share', conceptLabel: 'Share divides by the total',
      context: `In 2022 the four districts produced <b>165, 240, 110</b> and <b>175</b> thousand
                quintals, a total of <b>690</b>.`,
      q: "Kota's share of the 2022 total is closest to:",
      options: ['29%', '35%', '41%', '48%'],
      answer: 1,
      whyRight: `Correct. <code>240 ÷ 690 ≈ <b>34.8%</b></code>, which rounds to 35%. Estimating
                 690 as 700 gives 34.3% — near enough to choose, with no long division at all.`,
      whyWrong: `Do not divide exactly. <b>Estimate</b>, because the options are six points apart.<br><br>
                 <code>240 ÷ 690</code> — round the denominator to <b>700</b>:
                 <code>240 ÷ 700 ≈ 34.3%</code>.<br><br>
                 You rounded the divisor <em>up</em>, so the true value is slightly <b>higher</b> —
                 and it is <b>34.8%</b>. Either way, <b>35%</b> is the only option nearby.<br><br>
                 Another route with no division: a third of 690 is 230, and 240 is a little more
                 than that, so the answer is a little over 33%. Same conclusion, four seconds.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'di-compare-not-compute', conceptLabel: 'Compare rather than compute',
      say: `This one can be answered without a single full calculation.`,
      context: `Year totals: <b>2019 — 550</b>, <b>2020 — 580</b>, <b>2021 — 615</b>,
                <b>2022 — 690</b> thousand quintals.`,
      q: 'Which year saw the largest increase over the previous year?',
      options: ['2020', '2021', '2022', 'They were equal'],
      answer: 2,
      whyRight: `Correct. The jumps are <b>30</b>, <b>35</b> and <b>75</b>, so <b>2022</b> — more
                 than double either of the others.`,
      whyWrong: `Subtract consecutive totals; there is nothing to divide.<br><br>
                 <code>2020: 580 − 550 = <b>30</b></code><br>
                 <code>2021: 615 − 580 = <b>35</b></code><br>
                 <code>2022: 690 − 615 = <b>75</b></code><br><br>
                 <b>2022</b>, by a distance.<br><br>
                 Note what the question did <em>not</em> ask for: the largest percentage increase.
                 That would still be 2022 here (75/615 = 12.2% against 6.0% and 5.5%), but the two
                 questions can easily disagree when the base figures differ a lot — so read which
                 one is being asked before you start subtracting or dividing.`,
    },
  ],
};
