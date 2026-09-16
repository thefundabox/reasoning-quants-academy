/* ============================================================
   Quants · Unit 7 · Lesson 2 — Bar & Line Charts
   ============================================================ */

import { chartRead, sum, growth } from '../widgets/di-lab.js';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
export const SALES_A = [20, 25, 30, 35, 30, 40];
/* May is 38, not 35, so the 'best combined month' question has exactly ONE answer.
   With 35 it tied with June at 65 — a which-one question with two right answers. */
export const SALES_B = [30, 30, 25, 20, 38, 25];

const CHART = {
  title: 'Monthly sales, in lakh rupees',
  labels: MONTHS,
  series: [{ name: 'Product A', values: SALES_A }, { name: 'Product B', values: SALES_B }],
  unit: '',
  questions: [
    { label: 'Months where A beats B',
      points: s => s[0].values.map((v, i) => (v > s[1].values[i] ? [0, i] : null)).filter(Boolean),
      answer: s => s[0].values.filter((v, i) => v > s[1].values[i]).length,
      working: 'compare heights — no arithmetic needed' },
    { label: 'Largest gap between them',
      points: s => { const g = s[0].values.map((v, i) => Math.abs(v - s[1].values[i]));
        const i = g.indexOf(Math.max(...g)); return [[0, i], [1, i]]; },
      answer: s => Math.max(...s[0].values.map((v, i) => Math.abs(v - s[1].values[i]))),
      unit: ' lakh', working: 'read both bars in the same month, then subtract' },
    { label: "A's growth, Jan to Jun",
      points: () => [[0, 0], [0, 5]],
      answer: s => growth(s[0].values[0], s[0].values[5]), unit: '%',
      working: '(40 − 20) ÷ 20 × 100' },
    { label: 'Best combined month',
      points: s => { const t = s[0].values.map((v, i) => v + s[1].values[i]);
        const i = t.indexOf(Math.max(...t)); return [[0, i], [1, i]]; },
      answer: (s, labels) => { const t = s[0].values.map((v, i) => v + s[1].values[i]);
        return labels[t.indexOf(Math.max(...t))]; },
      working: 'add the two bars in each month, then take the tallest pair' },
  ],
};

export default {
  id: 'q.di.bars',
  title: 'Bar & Line Charts',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.di.pie',
  nextLabel: 'Next: Pie Charts →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Half of these questions need no arithmetic',
      say: `"In how many months did A outsell B?"<br><br>
            There is nothing to calculate. Run your eye along and count the months where one bar is
            taller than the other. <b>Three.</b><br><br>
            A chart is a picture precisely so that comparisons can be <em>seen</em>. Reaching for
            the numbers is how candidates run out of time.`,
      cta: 'When do I compute, then?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Compare by eye, compute only when forced',
      say: `Sort each question into one of two piles before you touch it.`,
      body: `
        <p><b>Answerable by looking:</b> which is largest, which is smallest, how many times one
           exceeds another, when a line crosses, whether a trend rises or falls, roughly what
           ratio two bars stand in. These need <b>no arithmetic at all</b>, and they are usually
           half the set.</p>
        <p><b>Needs computing:</b> exact totals, percentage change, shares, averages. Even here,
           <b>estimate first</b> — the options in a DI set are rarely closer than a few per cent
           apart.</p>
        <p><b>Bars against lines.</b> The same data, two jobs:</p>
        <ul>
          <li><b>Bars</b> are for <em>comparing</em> quantities at one moment — heights side by
              side.</li>
          <li><b>Lines</b> are for <em>trend</em> over time, and for spotting where two series
              <b>cross</b>. A crossing is where the lead changes hands, and it is nearly invisible
              on bars.</li>
        </ul>
        <p><b>Read the axis before anything else.</b> Two traps live there. A vertical axis that
           does not start at zero makes small differences look enormous. And a stated unit — "in
           lakh", "in thousands" — turns 40 into 40,00,000 in the answer options.</p>
        <p><b>Growth is still (new − old) ÷ old.</b> A's sales run 20 in January to 40 in June:
           <code>20 ÷ 20 = <b>100%</b></code>. It doubled, so it rose by 100% — not by 200%, which
           is what the final figure is <em>of</em> the first.</p>`,
      cta: 'Let me read the chart',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Bars, then the same data as a line',
      say: `Pick a question and the bars it needs light up. Then switch to <b>line</b> and look at
            the same data again.<br><br>
            The crossings are obvious on the line and nearly invisible on the bars — that is the
            whole reason both chart types exist.`,
      widget: chartRead(CHART),
      __cfg: CHART,
      tasks: [
        { label: 'Work through all four questions', done: s => s.seenAll },
        { label: 'Switch to the <b>line</b> view', done: s => s.type === 'line' },
        { label: 'Find the question with a <b>month</b> as its answer', done: s => typeof s.answer === 'string' },
      ],
      onComplete: `Two of those four needed no arithmetic — just a comparison of heights. Sort every
                   DI question that way before you start writing.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'di-compare-by-eye', conceptLabel: 'Comparisons need no arithmetic',
      input: 'number', answer: 3, unit: 'months',
      say: `Do not compute. Look.`,
      context: `<b>A:</b> 20, 25, 30, 35, 30, 40 &nbsp;·&nbsp; <b>B:</b> 30, 30, 25, 20, 38, 25
                (lakh rupees, January to June)`,
      q: 'In how many months did A exceed B?',
      whyRight: `Correct — March, April and June: <b>3</b> months. A count, not a calculation.`,
      whyWrong: `Go month by month and just ask "is A bigger?"<br><br>
                 Jan 20 &lt; 30 ✗ · Feb 25 &lt; 30 ✗ · <b>Mar 30 &gt; 25 ✓</b> ·
                 <b>Apr 35 &gt; 20 ✓</b> · May 30 &lt; 38 ✗ · <b>Jun 40 &gt; 25 ✓</b><br><br>
                 <b>3 months.</b><br><br>
                 On the chart this is faster still — you are looking for the months where A's bar
                 stands taller, and there is no subtraction anywhere. Questions of this shape are
                 free marks, and they are usually the first in the set.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Two you can see, two you must compute',
      say: `Sorting them first is the skill.`,
      steps: [
        `<b>Months where A beats B — seen.</b> March, April, June. <b>3</b>. No arithmetic.`,
        `<b>Best combined month — nearly seen.</b> Add each pair: 50, 55, 55, 55, <b>68</b>, 65.
         <b>May</b>, and reading the tallest pair off the chart gets you there before the addition
         finishes.`,
        `<b>Largest gap — one subtraction.</b> April: <code>35 − 20 = <b>15 lakh</b></code>, the
         widest separation on the chart and visible at a glance before you confirm it.`,
        `<b>A's growth Jan to Jun — computed.</b> <code>(40 − 20) ÷ 20 × 100 = <b>100%</b></code>.
         Doubling is a 100% rise. B, meanwhile, fell from 30 to 25 — a drop of
         <code>5 ÷ 30 = 16.7%</code>.`,
        `<b>Why the line view matters.</b> A and B cross between February and March, and again
         between April and May. Those crossings answer "when did A overtake B?" instantly, and are
         very hard to see on bars.`,
      ],
      takeaway: `Sort each question into "can be seen" and "must be computed". Read the axis and the
                 unit before either. Growth still divides by the old figure, and doubling is a 100%
                 rise.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'di-gap', conceptLabel: 'The largest gap is one subtraction',
      input: 'number', answer: 15, unit: 'lakh rupees',
      context: `<b>A:</b> 20, 25, 30, 35, 30, 40 &nbsp;·&nbsp; <b>B:</b> 30, 30, 25, 20, 38, 25`,
      q: 'What is the largest gap between the two products in any month?',
      why: `Scan for the month where the bars are furthest apart, then subtract once.<br><br>
            The gaps are <code>10, 5, 5, <b>15</b>, 8, 15</code>… and April and June both give
            <b>15</b>.<br><br>
            <code>April: 35 − 20 = <b>15</b></code> · <code>June: 40 − 25 = <b>15</b></code><br><br>
            The value is the same either way, which is why the question asks for the gap rather than
            the month. Had it asked <em>which</em> month, the answer would have been ambiguous — and
            a well-set paper would not ask it.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'di-growth-doubling', conceptLabel: 'Doubling is a 100% rise',
      context: `Product A sold <b>20 lakh</b> in January and <b>40 lakh</b> in June.`,
      q: "What is A's percentage growth over the period?",
      options: ['50%', '100%', '200%', '20%'],
      answer: 1,
      whyRight: `Correct. <code>(40 − 20) ÷ 20 × 100 = <b>100%</b></code> — the sales doubled, which
                 is a rise of one whole original amount.`,
      whyWrong: `<code>growth = (new − old) ÷ old × 100 = (40 − 20) ÷ 20 × 100 = <b>100%</b></code><br><br>
                 <b>200%</b> is the trap: 40 is 200% <em>of</em> 20, but the question asks by how
                 much it <em>grew</em>. Growing to 200% of the original is growing <b>by</b> 100%.<br><br>
                 <b>50%</b> comes from dividing by the new figure — <code>20 ÷ 40</code> — which is
                 the standard error in every growth question in this unit.<br><br>
                 This is the same "factor versus increase" distinction as the cube in Mensuration:
                 ×4 is a 300% rise, ×2 is a 100% rise.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'di-axis', conceptLabel: 'Read the axis and the unit first',
      say: `Nothing is wrong with the data here. Something is wrong with the reading.`,
      context: `A chart is headed <b>"Sales, in lakh rupees"</b>. Its vertical axis begins at
                <b>20</b> rather than at zero. Product A's bar reaches 40 and Product B's reaches
                30.`,
      q: 'Which conclusion is safe?',
      options: [
        "A's bar looks twice as tall as B's, so A sold twice as much",
        'A sold ₹40 lakh and B sold ₹30 lakh, so A sold a third more',
        'A sold ₹40 and B sold ₹30',
        'The chart cannot be used, because the axis does not start at zero',
      ],
      answer: 1,
      whyRight: `Correct. Read the <em>values</em>, not the heights: 40 against 30, so A sold
                 <code>10 ÷ 30 = 33.3%</code> more. The unit is lakh, so those are ₹40 lakh and
                 ₹30 lakh.`,
      whyWrong: `Two separate traps are in play, and one distractor falls into each.<br><br>
                 <b>The truncated axis.</b> Starting at 20 means A's bar shows 20 units of height
                 and B's shows 10 — so A's bar <em>is</em> twice as tall while the sales are only a
                 third higher. Never judge a ratio by bar height unless the axis starts at zero.<br><br>
                 <b>The unit.</b> "In lakh rupees" makes those figures <b>₹40 lakh</b> and
                 <b>₹30 lakh</b>, not ₹40 and ₹30. That single word in the heading is worth marks
                 on its own.<br><br>
                 And the chart is perfectly usable — a truncated axis is misleading to the eye, not
                 invalid. You simply read the numbers instead of the heights.`,
    },
  ],
};
