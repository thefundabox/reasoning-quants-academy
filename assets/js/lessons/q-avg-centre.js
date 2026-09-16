/* ============================================================
   Quants · Unit 5 · Lesson 1 — Mean, Median & Mode
   ============================================================ */

import { dotPlot } from '../widgets/stat-lab.js';

const SALARIES = {
  values: [12, 14, 15, 16, 88],
  min: 5, max: 100, step: 1,
  label: 'Five monthly salaries, in thousands of rupees',
};

export default {
  id: 'q.avg.centre',
  title: 'Mean, Median & Mode',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.avg.weighted',
  nextLabel: 'Next: Weighted Average →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The average salary nobody earns',
      say: `Five people in an office earn <b>₹12k, ₹14k, ₹15k, ₹16k</b> and <b>₹88k</b>.<br><br>
            The average salary is <b>₹29,000</b>.<br><br>
            Four of the five earn <em>less</em> than the average. It describes not one person in
            that room — and it is still, arithmetically, perfectly correct.`,
      cta: 'Then what should I use?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Three centres, and what each is for',
      say: `They answer different questions, and the exam usually tells you which one it wants by
            the shape of the data rather than by naming it.`,
      body: `
        <ul>
          <li><b>Mean</b> — add and divide. It is the <b>balance point</b>: the place where the
              values would sit level on a beam. Because it balances, a single extreme value drags
              it a long way.</li>
          <li><b>Median</b> — sort, then take the middle. With an even count, average the two
              middles. It cares only about <em>position</em>, so an extreme value can be as extreme
              as it likes and the median barely notices.</li>
          <li><b>Mode</b> — the most frequent value. There may be none, one, or several. It is the
              only one that works on things you cannot add, like shirt sizes or preferred subject.</li>
        </ul>
        <p><b>Sorting is not optional for the median.</b> The middle of the <em>list as given</em>
           is not the median unless the list happens to be in order — and examiners give it out of
           order on purpose.</p>
        <p><b>What the mean is good for.</b> It is the only one of the three that remembers the
           total: <code>total = mean × count</code>. Almost every "average" question in the paper
           is really a question about totals in disguise, and this line is how you get at them.
           If six numbers average 20, their total is 120 — and now you can add, remove or replace
           values freely.</p>
        <p><b>When the mean misleads.</b> When one value sits far from the rest — a salary, a
           population, a rainfall figure — the mean is pulled toward it and stops describing a
           typical case. That is exactly when the median is the honest answer.</p>`,
      cta: 'Let me drag the outlier',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Push one value and watch the fulcrum move',
      say: `The triangle underneath is the <b>mean</b> — the balance point. The vertical line is
            the <b>median</b>.<br><br>
            Select the ₹88k salary and drag it. Watch how far the fulcrum travels and how little
            the median cares.`,
      widget: dotPlot(SALARIES),
      __cfg: SALARIES,
      tasks: [
        { label: 'Move a value and watch the mean shift', done: s => s.movedAny },
        { label: 'Get the mean and median to <b>agree</b>', done: s => s.meanEqualsMedian },
        { label: 'Drag the mean above <b>most</b> of the values', done: s => s.meanPastMost },
      ],
      onComplete: `When one value runs away, the mean chases it and the median stays put. That is
                   the whole reason both exist.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'centre-mean', conceptLabel: 'The mean is the balance point',
      input: 'number', answer: 29, unit: 'thousand rupees',
      say: `The office from the start.`,
      context: `Salaries of <b>₹12k, ₹14k, ₹15k, ₹16k</b> and <b>₹88k</b>.`,
      q: 'What is the mean salary, in thousands?',
      whyRight: `Correct. <code>12 + 14 + 15 + 16 + 88 = 145</code>, and <code>145 ÷ 5 = 29</code>.
                 Note that only one person earns anywhere near it — and they earn three times it.`,
      whyWrong: `Add, then divide by how many.<br><br>
                 <code>12 + 14 + 15 + 16 + 88 = 145</code><br>
                 <code>145 ÷ 5 = <b>29</b></code> thousand.<br><br>
                 If you answered <b>15</b>, you found the <em>median</em> — the middle value once
                 sorted. Both are correct statistics; the question asked for the mean.<br><br>
                 The gap between 29 and 15 is the whole point of this lesson: a single ₹88k salary
                 has pulled the balance point past four of the five people.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Why they disagree, and by how much',
      say: `Both numbers are honest. They are answering different questions.`,
      steps: [
        `<b>The mean is 29.</b> It balances the values: the four small salaries pull left, and the
         single ₹88k pulls right hard enough to hold them all. Remove that one salary and the mean
         of the rest is 14.25.`,
        `<b>The median is 15.</b> Sort them — 12, 14, <b>15</b>, 16, 88 — and take the middle. The
         ₹88k contributes exactly one position, no matter how large it is. Change it to ₹880k and
         the median is still 15.`,
        `<b>With an even count</b>, average the two middles. For 4, 7, 9, <b>12, 15</b>, 18, 21, 25
         that is <code>(12 + 15) ÷ 2 = <b>13.5</b></code> — a median that is not one of the values,
         which is perfectly normal.`,
        `<b>The mean remembers totals.</b> Six numbers averaging 20 have a total of <b>120</b>.
         Remove a 15 and the total is 105 across five numbers — a new mean of <b>21</b>. The average
         rose because the value removed was below it.`,
        `<b>Which to report.</b> With a long tail — incomes, land holdings, city populations — the
         median describes a typical case and the mean does not. With symmetric data they agree, and
         the question does not matter.`,
      ],
      takeaway: `Mean = total ÷ count, and it moves with every value. Median = middle after sorting,
                 and it ignores how extreme the extremes are. Convert "average" into "total" the
                 moment you see it — that is what most questions are really about.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'centre-median', conceptLabel: 'Sort first, then take the middle',
      input: 'number', answer: 13.5, unit: 'the median', tol: 0.001,
      context: `The eight values <b>15, 4, 21, 9, 25, 12, 7, 18</b>.`,
      q: 'What is their median?',
      why: `<b>Sort first</b> — the list is deliberately jumbled:<br><br>
            <code>4, 7, 9, <b>12, 15</b>, 18, 21, 25</code><br><br>
            Eight values, so there is no single middle. Average the fourth and fifth:
            <code>(12 + 15) ÷ 2 = <b>13.5</b></code>.<br><br>
            Taking the middle of the list as given would have landed on 9 or 25 — which is exactly
            why the sort is not optional.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'centre-totals', conceptLabel: 'Average questions are total questions',
      input: 'number', answer: 21, unit: 'the new mean',
      context: `Six numbers have a mean of <b>20</b>. One of them, a <b>15</b>, is removed.`,
      q: 'What is the mean of the remaining five?',
      why: `Turn the average into a <b>total</b> immediately.<br><br>
            <code>total = 20 × 6 = 120</code><br>
            <code>after removal = 120 − 15 = 105</code><br>
            <code>new mean = 105 ÷ 5 = <b>21</b></code><br><br>
            The mean <em>rose</em>, which makes sense: the value removed was below the old average,
            so what remains is a slightly better crowd.<br><br>
            Expect that direction check to catch errors. Removing a value above the mean must pull
            the mean down; removing one below must push it up.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'centre-which', conceptLabel: 'Choosing the honest centre',
      say: `A real reporting decision. Both numbers are correct.`,
      context: `In a village of <b>10</b> households, nine earn <b>₹10,000</b> a month and one
                earns <b>₹5,00,000</b>. The mean income is <b>₹59,000</b>; the median is
                <b>₹10,000</b>.`,
      q: 'Which better describes a typical household, and why?',
      options: [
        'The mean, because it uses every value',
        'The median, because nine of the ten households earn far below the mean',
        'The mean, because ₹59,000 lies between the two incomes present',
        'Neither — you would need the mode',
      ],
      answer: 1,
      whyRight: `Exactly. The mean is being held up by a single household; ₹10,000 is what nine of
                 the ten actually earn, so the median is the honest summary.`,
      whyWrong: `Both statistics are computed correctly — this is a question about which one
                 <em>describes</em> the village.<br><br>
                 <b>Mean ₹59,000:</b> <code>(9 × 10,000 + 5,00,000) ÷ 10</code>. It uses every
                 value, which is precisely the problem: one value is fifty times the others and
                 drags the balance point with it. <b>Nine of the ten households earn less than a
                 fifth of the mean.</b><br><br>
                 <b>Median ₹10,000:</b> the middle household once sorted — and here, the income of
                 nine households out of ten.<br><br>
                 "It uses every value" is a strength when the data is symmetric and a weakness when
                 it has a long tail. Income almost always has a long tail, which is why income is
                 reported as a median in practice.<br><br>
                 The mode would also be ₹10,000 here, but it is the wrong tool in general — it says
                 nothing at all when no value repeats.`,
    },
  ],
};
