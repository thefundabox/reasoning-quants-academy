/* ============================================================
   Quants · Unit 7 · Lesson 3 — Pie Charts
   ============================================================ */

import { pieRead } from '../widgets/di-lab.js';

export const BUDGET_TOTAL = 7200;
export const SLICES = [
  { name: 'Agriculture', deg: 108 },
  { name: 'Education',   deg: 90 },
  { name: 'Health',      deg: 72 },
  { name: 'Roads',       deg: 54 },
  { name: 'Water',       deg: 36 },
];

const PIE = {
  title: 'State budget allocation, total ₹7,200 crore',
  slices: SLICES, total: BUDGET_TOTAL, unit: '₹',
};

export default {
  id: 'q.di.pie',
  title: 'Pie Charts',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.di.caselet',
  nextLabel: 'Next: Caselets & Mixed Sets →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Divide by 3.6 and you are done',
      say: `A pie chart gives you <b>degrees</b>. Every question wants <b>percentages</b> or
            <b>rupees</b>.<br><br>
            The bridge is one number. A full circle is 360° and a full share is 100%, so
            <b>1% = 3.6°</b>.<br><br>
            A 90° slice is <code>90 ÷ 3.6 = <b>25%</b></code>. That is the entire technique.`,
      cta: 'Show me both directions',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Degrees, percentages, and the actual amount',
      say: `Three representations of one thing. Move between them freely and no pie-chart question
            can trouble you.`,
      body: `
        <ul>
          <li><b>Degrees → percentage:</b> divide by <b>3.6</b>. (90° → 25%)</li>
          <li><b>Percentage → degrees:</b> multiply by <b>3.6</b>. (30% → 108°)</li>
          <li><b>Degrees → amount:</b> <code>total × degrees ÷ 360</code>. On ₹7,200 crore, a 90°
              slice is <code>7,200 × 90 ÷ 360 = <b>₹1,800 crore</b></code>.</li>
        </ul>
        <p><b>The quarter-shortcuts are worth having.</b> 90° = 25%, 180° = 50%, 36° = 10%,
           18° = 5%, 3.6° = 1%. Most exam slices are built from these.</p>
        <p><b>Ratios need no conversion at all.</b> The ratio of two slices is the ratio of their
           degrees — and also of their percentages, and of their amounts, because all three are the
           same numbers scaled. Roads 54° to Water 36° is <code>54 : 36 = <b>3 : 2</b></code>, and
           you never had to find either percentage.</p>
        <p><b>Always check the circle closes.</b> The angles must total <b>360°</b> and the
           percentages <b>100%</b>. Here: 108 + 90 + 72 + 54 + 36 = 360. ✓ If a question gives you
           four slices and asks for the fifth, that check <em>is</em> the method — subtract from
           360.</p>
        <p><b>Two pies cannot be compared unless you know both totals.</b> A 25% slice of a small
           budget is less money than a 15% slice of a large one. Whenever a question puts two pie
           charts side by side, look for the two totals before comparing anything.</p>`,
      cta: 'Let me read the slices',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'One slice, three ways of saying it',
      say: `Tap each slice. You get its angle, its percentage and its rupee amount — all from the
            same one number.<br><br>
            Check the note at the bottom as you go: the angles must reach 360° and the percentages
            100%.`,
      widget: pieRead(PIE),
      __cfg: PIE,
      tasks: [
        { label: 'Look at all five slices', done: s => s.seenAll },
        { label: 'Land on the <b>largest</b> slice', done: s => s.onLargest },
        { label: 'Confirm the angles close at 360°', done: s => s.degClose },
      ],
      onComplete: `Agriculture at 108° is the largest — 30% of the budget, ₹2,160 crore. Every one of
                   those three numbers came from the same angle.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'pie-degrees-percent', conceptLabel: 'Divide degrees by 3.6',
      input: 'number', answer: 25, unit: 'percent',
      say: `The bridge number.`,
      context: `In a budget pie chart, the <b>Education</b> slice measures <b>90°</b>.`,
      q: 'What percentage of the budget is that?',
      whyRight: `Correct. <code>90 ÷ 3.6 = <b>25%</b></code> — a right angle is always a quarter of
                 the circle, so this one you should recognise on sight.`,
      whyWrong: `A full circle of 360° represents 100%, so each 1% is
                 <code>360 ÷ 100 = <b>3.6°</b></code>.<br><br>
                 <code>90 ÷ 3.6 = <b>25%</b></code><br><br>
                 Or see it directly: 90° is a right angle, which is a <b>quarter</b> of the circle —
                 and a quarter is 25%.<br><br>
                 If you answered <b>90</b>, you read the degrees as a percentage. That mistake makes
                 the five slices add to 360%, which is the check that catches it.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The whole chart, converted',
      say: `One division per slice, and the circle closes.`,
      steps: [
        `<b>Agriculture 108°.</b> <code>108 ÷ 3.6 = <b>30%</b></code>, and
         <code>7,200 × 108 ÷ 360 = <b>₹2,160 crore</b></code>. The largest slice.`,
        `<b>Education 90° → 25% → ₹1,800 crore.</b> <b>Health 72° → 20% → ₹1,440 crore.</b>
         <b>Roads 54° → 15% → ₹1,080 crore.</b> <b>Water 36° → 10% → ₹720 crore.</b>`,
        `<b>Both checks close.</b> Angles: 108 + 90 + 72 + 54 + 36 = <b>360</b>. Percentages:
         30 + 25 + 20 + 15 + 10 = <b>100</b>. Amounts: 2,160 + 1,800 + 1,440 + 1,080 + 720 =
         <b>7,200</b>. ✓`,
        `<b>Ratios skip the conversion.</b> Roads to Water is <code>54 : 36 = <b>3 : 2</b></code>,
         and equally <code>15 : 10</code> or <code>1,080 : 720</code>. Whichever pair of numbers you
         happen to have, the ratio is the same — so use the ones already in front of you.`,
        `<b>Comparisons within one pie are safe.</b> Agriculture exceeds Education by 18°, which is
         <code>18 ÷ 90 = <b>20%</b> more</code> — note that is 20% <em>of Education</em>, not
         20 percentage points.`,
      ],
      takeaway: `Degrees ÷ 3.6 for a percentage; × 3.6 to go back. Amount is total × degrees ÷ 360.
                 Ratios need no conversion at all. And always check the angles reach 360°.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'pie-amount', conceptLabel: 'Amount is total × degrees ÷ 360',
      input: 'number', answer: 2160, unit: 'crore rupees',
      context: `The total budget is <b>₹7,200 crore</b>, and the <b>Agriculture</b> slice measures
                <b>108°</b>.`,
      q: 'How much is allocated to agriculture, in crore rupees?',
      why: `<code>amount = total × degrees ÷ 360 = 7,200 × 108 ÷ 360</code><br><br>
            Cancel first: <code>7,200 ÷ 360 = 20</code>, so <code>20 × 108 = <b>₹2,160 crore</b></code>.<br><br>
            Or go via the percentage: <code>108 ÷ 3.6 = 30%</code>, and 30% of 7,200 is
            <code>0.3 × 7,200 = 2,160</code>. Same answer, and the ladder from Unit 2 makes the
            second route just as quick — 10% is 720, so 30% is 2,160.<br><br>
            Note that <code>7,200 ÷ 360 = 20</code> is worth writing down once: every slice in this
            chart is then just its angle × 20.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'pie-ratio', conceptLabel: 'Ratios need no conversion',
      context: `<b>Roads</b> occupies <b>54°</b> and <b>Water</b> occupies <b>36°</b>.`,
      q: 'What is the ratio of the Roads allocation to the Water allocation?',
      options: ['3 : 2', '2 : 3', '5 : 4', '54 : 100'],
      answer: 0,
      whyRight: `Correct. <code>54 : 36</code>, and dividing both by 18 gives <b>3 : 2</b>. No
                 percentages and no rupees were needed.`,
      whyWrong: `The ratio of two slices is simply the ratio of their <b>angles</b> — converting to
                 percentages or rupees only scales both sides by the same factor.<br><br>
                 <code>54 : 36</code> — divide both by 18 → <b>3 : 2</b>.<br><br>
                 Check it in the other units: percentages <code>15 : 10 = 3 : 2</code> ✓, and
                 amounts <code>1,080 : 720 = 3 : 2</code> ✓.<br><br>
                 <b>2 : 3</b> is the answer written backwards — Roads is the larger slice, so its
                 number must come first and must be the bigger one.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'pie-two-charts', conceptLabel: 'Two pies need two totals',
      say: `Two charts, and the trap is not arithmetic.`,
      context: `State X allocates <b>25%</b> of its budget to education. State Y allocates
                <b>15%</b>. State X's total budget is <b>₹7,200 crore</b>; State Y's is
                <b>₹20,000 crore</b>.`,
      q: 'Which state spends more on education?',
      options: [
        'State X, because 25% is the larger share',
        'State Y — ₹3,000 crore against ₹1,800 crore',
        'They spend the same amount',
        'It cannot be determined from the information given',
      ],
      answer: 1,
      whyRight: `Correct. <code>25% of 7,200 = ₹1,800 crore</code> but
                 <code>15% of 20,000 = ₹3,000 crore</code>. The smaller share of the bigger budget
                 wins comfortably.`,
      whyWrong: `A percentage is a share <em>of something</em>, and the two somethings are very
                 different here.<br><br>
                 <b>State X:</b> <code>25% of 7,200 = ₹1,800 crore</code><br>
                 <b>State Y:</b> <code>15% of 20,000 = ₹3,000 crore</code><br><br>
                 <b>State Y spends more</b>, despite the smaller slice.<br><br>
                 "State X, because 25% is larger" compares the slices while ignoring the pies —
                 the single most common error whenever two pie charts appear together.<br><br>
                 "Cannot be determined" would be right if only the percentages were given. Both
                 totals are stated, so it can.`,
    },
  ],
};
