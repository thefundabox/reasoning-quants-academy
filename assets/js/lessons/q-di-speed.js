/* ============================================================
   Quants · Unit 7 · Lesson 5 — DI Under Time Pressure
   ============================================================ */

import { claimScanner } from '../widgets/claim-lab.js';
import { WHEAT } from './q-di-tables.js';

/* The last lesson of the academy closes a loop: Unit 1 of Reasoning taught that a
   statement commits you only to what it says. A chart is a statement made of numbers,
   and the same possible-worlds engine applies to it unchanged. */
const CHART_CLAIMS = {
  statement: `A table shows wheat production in four districts of Rajasthan from 2019 to 2022.
              Kota's total across the four years is <b>850</b> thousand quintals, the highest of
              the four; Bikaner's is the lowest in every single year.`,
  atoms: [
    { key: 'kotaHighest', label: 'Kota produced the most wheat over the four years',
      short: 'Kota leads', fixed: true },
    { key: 'bikanerLowest', label: 'Bikaner produced the least in every year',
      short: 'Bikaner last', fixed: true },
    { key: 'kotaFertile', label: 'Kota has the most productive land per hectare', short: 'best yield' },
    { key: 'irrigation', label: 'Better irrigation is why production rose', short: 'irrigation caused it' },
    { key: 'rises2023',  label: 'Production will rise again in 2023', short: '2023 rises' },
    { key: 'otherCrops', label: 'Other crops in these districts fell', short: 'other crops fell' },
  ],
  claims: [
    { text: 'Kota produced more wheat than any other district over the four years.',
      needs: w => w.kotaHighest, trap: null },
    { text: 'Bikaner produced less than every other district in each of the four years.',
      needs: w => w.bikanerLowest, trap: null },
    { text: 'Kota has the most fertile land of the four districts.',
      needs: w => w.kotaFertile, trap: 'Output read as yield' },
    { text: 'Improved irrigation caused the rise in production.',
      needs: w => w.irrigation, trap: 'Cause smuggled in' },
    { text: 'Production will rise again in 2023.',
      needs: w => w.rises2023, trap: 'Trend read as prophecy' },
    { text: 'These districts grew less of other crops over the period.',
      needs: w => w.otherCrops, trap: 'Absence read as evidence' },
  ],
};

export default {
  id: 'q.di.speed',
  title: 'DI Under Time Pressure',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../quants/',
  nextLabel: 'Back to the path',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The chart says less than you think',
      say: `Kota grows the most wheat of the four districts. So Kota has the best land.<br><br>
            Does it? The table shows <b>output</b>. It says nothing about how many hectares each
            district planted. Kota may simply be bigger.<br><br>
            A chart is a statement made of numbers — and like any statement, it commits you only to
            what it actually says.`,
      cta: 'That sounds familiar',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Speed comes from skipping, not from rushing',
      say: `This lesson has two halves, and both are about doing <b>less</b>: computing less, and
            concluding less.`,
      body: `
        <p><b>1 · Estimate before you divide.</b> DI options are rarely within a couple of per cent
           of one another. "Kota's share of the 2022 total" is <code>240 ÷ 690</code> — round the
           denominator to 700 and you get 34.3% in two seconds, against a true 34.8%. Half a
           percentage point of error, and the options are five points apart.</p>
        <p><b>2 · Answer the cheap questions first.</b> Comparisons ("which is largest", "in how
           many years did X exceed Y") need no arithmetic. Take them, bank the marks, and come back
           to the percentage questions with what time is left.</p>
        <p><b>3 · Reuse every total.</b> Column totals, row totals and grand totals get asked about
           repeatedly. Write them in the margin once.</p>
        <p><b>4 · And know what the chart cannot say.</b> This is where DI stops being arithmetic.
           A table of production figures tells you <b>what was produced</b>. It does not tell you:</p>
        <ul>
          <li><b>Why</b> — no chart contains a cause. Rainfall, irrigation, prices, policy: all
              absent.</li>
          <li><b>What happens next</b> — three rising years do not make a fourth.</li>
          <li><b>Anything per unit</b> — output is not yield unless area is given.</li>
          <li><b>Anything not measured</b> — other crops, other districts, other years.</li>
        </ul>
        <p>You met this exact discipline in <b>Reasoning Unit 1</b>: a conclusion follows only if
           there is no permitted situation in which it fails. A chart is just a statement with
           numbers in it, and the test is unchanged.</p>`,
      cta: 'Let me break some claims',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'What the table does not say',
      say: `Two facts are <b>fixed</b> — they are read straight off the table. Everything else is
            open, because the table never measured it.<br><br>
            Break every claim you can. The two that survive are the two the table actually
            contains.`,
      widget: claimScanner(CHART_CLAIMS),
      __cfg: CHART_CLAIMS,
      tasks: [
        { label: 'Break at least two of the claims', done: s => s.broken >= 2 },
        { label: 'Break <b>every</b> claim that can be broken', done: s => s.brokeEveryBreakable },
        { label: 'Scan, and confirm exactly two survive', done: s => s.scanned && s.survivors === 2 },
      ],
      onComplete: `Two survivors, and both are simply the table read back. Every claim that told you
                   something new — about cause, about yield, about next year — died.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'di-limits', conceptLabel: 'A chart contains no causes',
      context: `A table shows that wheat production in four districts rose every year from 2019 to
                2022.`,
      q: 'Which conclusion is supported by the table alone?',
      options: [
        'Irrigation in these districts improved over the period',
        'Total production in 2022 exceeded that in 2019',
        'Production will continue to rise in 2023',
        'Farmers switched to wheat from other crops',
      ],
      answer: 1,
      whyRight: `Correct — and notice how little it claims. It compares two figures that are both
                 printed in the table, and adds nothing.`,
      whyWrong: `Ask of each option: <em>is this number, or a comparison of numbers, actually in
                 the table?</em><br><br>
                 <b>Irrigation improved</b> — a <em>cause</em>. No table contains one.<br><br>
                 <b>Will continue to rise</b> — a <em>prediction</em>. Three rising years do not
                 make a fourth; the table stops in 2022.<br><br>
                 <b>Farmers switched from other crops</b> — about crops the table never measured.
                 Wheat rising is perfectly consistent with everything else rising too.<br><br>
                 <b>2022 exceeded 2019</b> — 690 against 550, both printed. It follows.<br><br>
                 This is the same test as Reasoning Unit 1: find the situation where the data holds
                 and the claim fails. For the first three, that situation is easy to describe.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Fast arithmetic, and honest conclusions',
      say: `The two halves of a DI set, in order.`,
      steps: [
        `<b>Estimate first.</b> <code>240 ÷ 690</code>: round to <code>240 ÷ 700 ≈ 34.3%</code>.
         The true figure is 34.8%, so the estimate is <b>0.5 points low</b> — and you rounded the
         divisor up, so you knew in advance it would be low.`,
        `<b>Bank the free marks.</b> "Which district produced most?" and "in which year was the
         jump largest?" are comparisons. No division, no risk, full marks.`,
        `<b>Write the totals once.</b> 550, 580, 615, 690 and the grand total 2,435. Three of the
         four questions in a typical set will use one of them.`,
        `<b>Then refuse what is not there.</b> Kota's 850 makes it the largest <em>producer</em>.
         Calling it the most <em>fertile</em> needs hectares, which nobody gave you — output is not
         yield.`,
        `<b>And refuse the future.</b> A rising trend describes 2019 to 2022. The table ends there,
         and so does what you may say.`,
      ],
      takeaway: `Round the denominator, take the comparison questions first, and reuse your totals.
                 Then read every option twice: a chart supports statements about the numbers it
                 contains, and nothing about causes, forecasts, rates or things it never measured.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'di-estimate', conceptLabel: 'Round the denominator before dividing',
      context: `You need <b>240 ÷ 690</b> as a percentage, and the options are 29%, 35%, 41% and
                48%.`,
      q: 'What is the fastest safe route to the answer?',
      options: [
        'Long-divide 240 by 690 to two decimal places',
        'Round 690 to 700, get 34.3%, and pick the nearest option',
        'Round 240 to 200 and 690 to 700, get 28.6%, and pick 29%',
        'Guess, since the options are close together',
      ],
      answer: 1,
      whyRight: `Correct. Rounding only the denominator moves the answer by half a point, and the
                 options are six points apart — so 35% is safe, in two seconds.`,
      whyWrong: `Round <b>one</b> number, and round it as little as possible.<br><br>
                 <code>240 ÷ 700 = 34.3%</code>, against a true <code>34.8%</code>. An error of
                 <b>0.5 points</b> where the options are six points apart. Safe.<br><br>
                 Rounding <em>both</em> — 200 ÷ 700 = 28.6% — moves the answer by six points and
                 lands you on the wrong option. Rounding 240 down to 200 is a 17% change, far too
                 crude.<br><br>
                 Long division would also get there, but it costs perhaps forty seconds across a
                 full set of questions, and that is the time the last two questions needed.<br><br>
                 The rule from Unit 1 applies: round the <em>divisor</em> up and your estimate is
                 slightly low — so the true answer is a little above 34.3%.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'di-limits', conceptLabel: 'Output is not yield',
      context: `The table shows Kota produced <b>850</b> thousand quintals of wheat over four
                years — more than any other district.`,
      q: 'A candidate concludes that Kota has the most fertile land. What is missing?',
      options: [
        'The rainfall figures for each district',
        'The area under wheat in each district',
        'The wheat prices in each district',
        'Nothing — the conclusion follows',
      ],
      answer: 1,
      whyRight: `Correct. Fertility is output <b>per hectare</b>. Without the area sown, a large
                 total may simply mean a large district.`,
      whyWrong: `"Most fertile" is a claim about <b>yield</b> — production divided by area. The
                 table gives only the numerator.<br><br>
                 Kota might farm four times Bikaner's area and still be less productive per
                 hectare. Nothing in the table rules that out, so the conclusion does not
                 follow.<br><br>
                 Rainfall and prices are also absent, but neither would settle fertility even if
                 given — only the <b>area under wheat</b> converts output into yield.<br><br>
                 Whenever an option contains a per-unit word — fertile, efficient, productive, per
                 capita, per hectare — check that the chart gives you the denominator. It usually
                 does not.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'di-limits', conceptLabel: 'A chart contains no causes',
      say: `The last question of the academy. Everything you need is in Reasoning Unit 1.`,
      context: `Wheat production in a district rose from <b>80</b> to <b>110</b> thousand quintals
                between 2019 and 2022 — a rise of 37.5%.`,
      q: 'Which statement does the data support?',
      options: [
        'Production more than doubled over the period',
        'Production rose by more than a third over the period',
        'The district will produce over 120 thousand quintals in 2023',
        'The rise was due to a government subsidy',
      ],
      answer: 1,
      whyRight: `Correct. <code>(110 − 80) ÷ 80 = 37.5%</code>, and a third is 33.3% — so "more
                 than a third" is exactly what the arithmetic supports, and nothing more.`,
      whyWrong: `Check each against the two numbers you actually have.<br><br>
                 <b>More than doubled</b> — doubling 80 would give 160. It reached 110. <b>False</b>,
                 and checkable in one second.<br><br>
                 <b>Rose by more than a third</b> — <code>30 ÷ 80 = 37.5%</code>, and a third is
                 33.3%. <b>True.</b><br><br>
                 <b>Over 120 in 2023</b> — a forecast. The data stops at 2022.<br><br>
                 <b>Due to a subsidy</b> — a cause. No table contains one, and this is the option
                 that feels most like insight, which is precisely why it is offered.<br><br>
                 The surviving statement is, once again, the dullest: it restates the arithmetic and
                 stops. That has been true in every unit of both academies.`,
    },
  ],
};
