/* ============================================================
   Quants · Unit 3 · Lesson 5 — Work, Pipes & Cisterns
   ============================================================ */

import { workRate } from '../widgets/rate-lab.js';

const CREW = {
  workers: [
    { name: 'Asha', days: 12 },
    { name: 'Bhanu', days: 18 },
  ],
  unit: 'days',
  maxDays: 24,
};

export default {
  id: 'q.int.work',
  title: 'Work, Pipes & Cisterns',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.men.area',
  nextLabel: 'Next unit: Perimeter & Area →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Never add the days',
      say: `Asha builds a wall in <b>12 days</b>. Bhanu builds the same wall in <b>18 days</b>.
            Together?<br><br>
            Not 30. Not 15. <b>7.2 days</b> — and it must be less than 12, because two people
            cannot be slower than the faster of them working alone.<br><br>
            Days do not add. <b>Rates</b> do.`,
      cta: 'Show me rates',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Turn days into work per day',
      say: `The third costume of the same idea. Interest accumulates per year, distance per hour,
            and work per day. Once you are counting <b>per day</b>, everything simply adds.`,
      body: `
        <p>You could write Asha as 1/12 of the wall per day and Bhanu as 1/18, then add the
           fractions. That works, and it is slow. There is a better bookkeeping.</p>
        <p><b>Let the total work be the LCM of the times.</b> For 12 and 18 that is <b>36 units</b>.
           Now:</p>
        <ul>
          <li>Asha does <code>36 ÷ 12 = <b>3 units</b></code> a day.</li>
          <li>Bhanu does <code>36 ÷ 18 = <b>2 units</b></code> a day.</li>
          <li>Together: <b>5 units</b> a day, so <code>36 ÷ 5 = <b>7.2 days</b></code>.</li>
        </ul>
        <p>Every number stays a whole number until the final division. That is the entire reason to
           choose the LCM rather than 1.</p>
        <p><b>Pipes are workers with a sign.</b> A pipe that fills has a positive rate; a leak or an
           outlet has a <b>negative</b> one. A tank filling in 6 hours and leaking empty in 9:
           take 18 units, so <code>+3</code> and <code>−2</code>, netting <b>+1</b> unit an hour —
           <b>18 hours</b> to fill. If the net comes out negative, the tank never fills, and that
           is a legitimate answer.</p>
        <p><b>Working backwards.</b> If A and B together take 8 days and A alone takes 12, take
           LCM(8, 12) = 24. Together they do 3 a day and A does 2, so B does <b>1</b> — meaning B
           alone needs <b>24 days</b>. Subtracting rates is how every "find the other worker"
           question is solved.</p>
        <p><b>The check you should always run.</b> Two people together must finish faster than
           either alone. If your answer is bigger than the smaller of the two times, you have added
           days somewhere.</p>`,
      cta: 'Let me set the rates',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Rates add. Days never do.',
      say: `Drag each worker's time and watch the units-per-day, then the time together.<br><br>
            Keep an eye on the total-work row: it is the LCM, so the rates stay whole. And check
            the result against the rule — together must always beat the faster one alone.`,
      widget: workRate(CREW),
      __cfg: CREW,
      tasks: [
        { label: 'Get back to <b>12 and 18</b> days and read the answer', done: s => s.days[0] === 12 && s.days[1] === 18 },
        { label: 'Make them work at the <b>same rate</b>', done: s => s.days[0] === s.days[1] },
        { label: 'Make the pair finish in <b>4 days or fewer</b>', done: s => s.time !== null && s.time <= 4 },
      ],
      onComplete: `Equal times halve the job exactly — two people each doing half. And notice the
                   answer never once exceeded the faster worker's own time.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'work-rates-add', conceptLabel: 'Rates add; days do not',
      input: 'number', answer: 7.2, unit: 'days', tol: 0.01,
      say: `The wall, from the start.`,
      context: `Asha builds a wall in <b>12 days</b>; Bhanu builds it in <b>18 days</b>. They work
                together.`,
      q: 'How many days do they take?',
      whyRight: `Correct. Total work 36 units; Asha 3 a day, Bhanu 2, together 5 —
                 <code>36 ÷ 5 = <b>7.2 days</b></code>. Comfortably under Asha's 12, as it must be.`,
      whyWrong: `Convert to work per day before doing anything else.<br><br>
                 Take the total work as <b>LCM(12, 18) = 36 units</b>.<br><br>
                 Asha: <code>36 ÷ 12 = 3</code> units a day.<br>
                 Bhanu: <code>36 ÷ 18 = 2</code> units a day.<br>
                 Together: <b>5</b> units a day.<br><br>
                 <code>36 ÷ 5 = <b>7.2 days</b></code><br><br>
                 <b>30</b> comes from adding the days, which would mean help makes the job slower.
                 <b>15</b> is their average, which would mean help makes no difference at all. The
                 answer must be below 12 — that check alone eliminates both.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Three shapes, one method',
      say: `Whole numbers throughout, because the total is the LCM.`,
      steps: [
        `<b>Two working together.</b> 12 and 18 days → 36 units → 3 + 2 = 5 a day →
         <b>7.2 days</b>.`,
        `<b>Different numbers, same move.</b> 10 and 15 days → LCM 30 → 3 + 2 = 5 a day →
         <code>30 ÷ 5 = <b>6 days</b></code>.`,
        `<b>A pipe and a leak.</b> Fills in 6 hours, empties in 9 → LCM 18 → <code>+3</code> and
         <code>−2</code> → net <b>+1</b> an hour → <b>18 hours</b>. The leak has tripled the filling
         time, which is worth feeling: a small negative rate does enormous damage to a small net.`,
        `<b>Finding the missing worker.</b> A and B together take 8 days; A alone takes 12. LCM 24 →
         together <b>3</b> a day, A <b>2</b> a day, so B does <b>1</b> → B alone takes
         <b>24 days</b>. Rates subtract as easily as they add.`,
        `<b>The one check.</b> Together must beat the faster worker alone; adding a leak must make
         things slower. If either fails, you have added times instead of rates.`,
      ],
      takeaway: `Total work = LCM of the times. Divide to get each rate, add them (subtracting any
                 leak), then divide the total by the net. Every intermediate number stays whole.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'work-rates-add', conceptLabel: 'Rates add; days do not',
      input: 'number', answer: 6, unit: 'days',
      context: `A does a job in <b>10 days</b> and B does the same job in <b>15 days</b>.`,
      q: 'Working together, how many days do they take?',
      why: `Total work = <b>LCM(10, 15) = 30 units</b>.<br><br>
            A does <code>30 ÷ 10 = 3</code> a day; B does <code>30 ÷ 15 = 2</code> a day. Together
            <b>5</b> a day.<br><br>
            <code>30 ÷ 5 = <b>6 days</b></code><br><br>
            Sanity check: 6 is less than 10, as it must be. And the answer is nicely whole here —
            examiners usually choose times whose LCM divides cleanly by the summed rate.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'work-negative-rate', conceptLabel: 'A leak is a negative rate',
      input: 'number', answer: 18, unit: 'hours',
      context: `A pipe fills a tank in <b>6 hours</b>. A leak at the bottom can empty the full tank
                in <b>9 hours</b>. Both are open.`,
      q: 'How long does the tank take to fill?',
      why: `Give the leak a <b>negative</b> rate and the rest is the usual method.<br><br>
            Total work = <b>LCM(6, 9) = 18 units</b>.<br><br>
            Pipe: <code>+18 ÷ 6 = +3</code> units an hour.<br>
            Leak: <code>−18 ÷ 9 = −2</code> units an hour.<br>
            Net: <b>+1</b> unit an hour.<br><br>
            <code>18 ÷ 1 = <b>18 hours</b></code><br><br>
            Three times as long as the pipe alone — and if the leak had emptied the tank in 6 hours
            instead of 9, the net would be zero and the tank would never fill at all.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'work-subtract', conceptLabel: 'Subtracting rates to find one worker',
      say: `Now run the method backwards. Last question of the unit.`,
      context: `A and B together finish a job in <b>8 days</b>. A working alone would take
                <b>12 days</b>.`,
      q: 'How long would B take alone?',
      options: ['20 days', '24 days', '16 days', '4 days'],
      answer: 1,
      whyRight: `Correct. LCM(8, 12) = 24 units. Together they do 3 a day and A does 2, so B does
                 <b>1</b> — and <code>24 ÷ 1 = <b>24 days</b></code>.`,
      whyWrong: `Subtract the <b>rates</b>, never the days.<br><br>
                 Total work = <b>LCM(8, 12) = 24 units</b>.<br><br>
                 Together: <code>24 ÷ 8 = 3</code> units a day.<br>
                 A alone: <code>24 ÷ 12 = 2</code> units a day.<br>
                 So B contributes <code>3 − 2 = <b>1</b></code> unit a day.<br><br>
                 <code>24 ÷ 1 = <b>24 days</b></code><br><br>
                 <b>4 days</b> is 12 − 8, the days subtracted directly — and it is absurd on its
                 face, since it would make B more than twice as fast as A while barely improving
                 the pair's time.<br><br>
                 The sense check: A alone takes 12 days and the pair take 8, so B is helping only a
                 little. A slow helper must have a long solo time — 24 days is exactly the sort of
                 number to expect.`,
    },
  ],
};
