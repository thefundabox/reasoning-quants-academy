/* ============================================================
   Quants · Unit 3 · Lesson 1 — Simple Interest
   ============================================================ */

import { interestCurve } from '../widgets/rate-lab.js';

const LOAN = { p: 10000, rate: 10, maxYears: 6, startYears: 2, unit: '₹' };

export default {
  id: 'q.int.simple',
  title: 'Simple Interest',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.int.compound',
  nextLabel: 'Next: Compound Interest →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'One formula, four questions',
      say: `<b>₹12,000</b> at <b>8%</b> for <b>5 years</b>. The interest is <b>₹4,800</b>.<br><br>
            But the paper rarely asks that. It asks: at what <em>rate</em> does ₹7,500 become
            ₹9,000 in four years? In how many <em>years</em> does a sum double?<br><br>
            Those are the same formula, rearranged. Learn it once as a relationship between four
            quantities and all four questions collapse into one.`,
      cta: 'Show me the relationship',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Interest is a rate times a time',
      say: `This is the first appearance of the idea that runs through the whole unit: something
            accumulates at a fixed <b>rate</b> over a <b>time</b>. Here the something is money.`,
      body: `
        <p><b>SI = P × R × T ÷ 100</b>, where P is the principal, R the rate per cent per year, and
           T the time in years. The <b>amount</b> is P + SI — and confusing the interest with the
           amount is the commonest careless error in the topic.</p>
        <p><b>Simple interest is a straight line.</b> The interest each year is the same, because it
           is always calculated on the <em>original</em> principal. ₹12,000 at 8% earns ₹960 in the
           first year, ₹960 in the second, and ₹960 in every year after. Nothing accelerates.</p>
        <p><b>The four rearrangements</b> — you only ever need one at a time:</p>
        <ul>
          <li>Interest: <code>SI = PRT/100</code></li>
          <li>Rate: <code>R = 100 × SI / (P × T)</code></li>
          <li>Time: <code>T = 100 × SI / (P × R)</code></li>
          <li>Principal: <code>P = 100 × SI / (R × T)</code></li>
        </ul>
        <p><b>Read the question for SI, not for the amount.</b> "₹7,500 becomes ₹9,000" gives you an
           <em>amount</em>. Subtract first: the interest is ₹1,500. Feeding 9,000 into the formula
           is how this question is usually lost.</p>
        <p><b>The doubling shortcut.</b> A sum doubles when the interest equals the principal, so
           <code>P = PRT/100</code>, and P cancels: <b>RT = 100</b>. At 12.5% that is 8 years; at 8%
           it is 12.5 years. Tripling needs the interest to be twice the principal, so RT = 200.</p>`,
      cta: 'Let me see the line',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'The straight line, and the curve beside it',
      say: `The lower line is simple interest. It is <b>straight</b> — every year adds exactly the
            same amount.<br><br>
            The curve above it is compound interest, which is the next lesson. For now, note where
            the two are identical, and watch the gap open after that.`,
      widget: interestCurve(LOAN),
      __cfg: LOAN,
      tasks: [
        { label: 'Find the point where simple and compound are <b>identical</b>', done: s => s.equalAtYearOne },
        { label: 'Push it to <b>six years</b> and see how far they separate', done: s => s.years >= 6 },
        { label: 'Try a rate of <b>20%</b>', done: s => s.rate === 20 },
      ],
      onComplete: `At one year they agree exactly — there has been nothing to compound yet. Every
                   year after that, the straight line falls further behind.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'si-formula', conceptLabel: 'SI = P × R × T ÷ 100',
      input: 'number', answer: 4800, unit: 'rupees of interest',
      say: `Straight from the formula.`,
      context: `<b>₹12,000</b> is lent at <b>8%</b> simple interest for <b>5 years</b>.`,
      q: 'How much interest is earned?',
      whyRight: `Correct. <code>12,000 × 8 × 5 ÷ 100 = ₹4,800</code>. Note the question asked for the
                 <em>interest</em>, not the amount — the amount would be ₹16,800.`,
      whyWrong: `<code>SI = P × R × T ÷ 100 = 12,000 × 8 × 5 ÷ 100</code><br><br>
                 Take it in easy steps: 8% of 12,000 is <b>₹960</b> — that is one year. Simple
                 interest repeats it unchanged, so five years is <code>5 × 960 = <b>₹4,800</b></code>.<br><br>
                 If you answered <b>16,800</b>, you found the <em>amount</em>: principal plus
                 interest. Read which one the question wants; examiners alternate between them
                 deliberately.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The same formula, turned three ways',
      say: `Nothing new is needed — only the rearrangement.`,
      steps: [
        `<b>Find the interest.</b> ₹12,000 at 8% for 5 years. One year is ₹960, so five years is
         <b>₹4,800</b>, and the amount is ₹16,800.`,
        `<b>Find the rate.</b> "₹7,500 becomes ₹9,000 in 4 years." First subtract:
         SI = 9,000 − 7,500 = <b>₹1,500</b>. Then
         <code>R = 100 × 1,500 ÷ (7,500 × 4) = 1,500 ÷ 300 = <b>5%</b></code>.`,
        `<b>Find the time.</b> ₹6,400 at 6.25% earns ₹1,600. <code>T = 100 × 1,600 ÷ (6,400 × 6.25)
         = 160,000 ÷ 40,000 = <b>4 years</b></code>.`,
        `<b>Find the doubling time.</b> Doubling means SI = P, so RT = 100. At 12.5%, T = 100 ÷ 12.5
         = <b>8 years</b>. Notice the principal never entered — doubling time does not depend on how
         much you started with.`,
        `<b>The check that costs nothing.</b> Compute one year's interest and multiply. If your
         answer is not a whole multiple of that, something has gone wrong.`,
      ],
      takeaway: `Subtract to get the interest before you touch the formula. Then pick the
                 rearrangement that isolates what you were asked for — and for doubling, remember
                 that RT = 100 and the principal is irrelevant.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'si-find-rate', conceptLabel: 'Finding the rate from an amount',
      input: 'number', answer: 5, unit: 'percent',
      context: `A sum of <b>₹7,500</b> grows to <b>₹9,000</b> in <b>4 years</b> at simple interest.`,
      q: 'What is the rate per cent per annum?',
      why: `The ₹9,000 is an <b>amount</b>, so subtract first.<br><br>
            <code>SI = 9,000 − 7,500 = ₹1,500</code><br><br>
            <code>R = 100 × SI ÷ (P × T) = 100 × 1,500 ÷ (7,500 × 4) = 150,000 ÷ 30,000 = <b>5%</b></code><br><br>
            Check it forwards: 5% of 7,500 is ₹375 a year, and four years is ₹1,500. ✓<br><br>
            Feeding 9,000 in as the interest would have given 30% — a wildly wrong answer that
            nonetheless looks like arithmetic, which is exactly why the check matters.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'si-find-time', conceptLabel: 'Finding the time',
      input: 'number', answer: 4, unit: 'years',
      context: `<b>₹6,400</b> is invested at <b>6.25%</b> simple interest and earns <b>₹1,600</b>
                in interest.`,
      q: 'For how many years was it invested?',
      why: `<code>T = 100 × SI ÷ (P × R) = 100 × 1,600 ÷ (6,400 × 6.25)</code><br><br>
            The denominator is <code>6,400 × 6.25 = 40,000</code>, and the numerator is
            <code>160,000</code>, so <code>T = <b>4 years</b></code>.<br><br>
            A faster route: 6.25% is <b>1/16</b>, so one year's interest is 6,400 ÷ 16 = <b>₹400</b>.
            Then 1,600 ÷ 400 = <b>4</b>. Recognising 6.25% as a sixteenth — straight from the
            fraction table in Unit 1 — removes the arithmetic entirely.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'si-doubling', conceptLabel: 'Doubling means RT = 100',
      say: `The principal is not given. Decide whether you need it.`,
      context: `A sum of money doubles itself in <b>8 years</b> at simple interest.`,
      q: 'In how many years will it become four times itself?',
      options: ['16 years', '24 years', '32 years', '12 years'],
      answer: 1,
      whyRight: `Correct. Doubling means the interest equalled the principal in 8 years, so
                 <b>one principal takes 8 years</b> to earn. Becoming four times needs
                 <b>three</b> principals of interest — <code>3 × 8 = <b>24 years</b></code>.`,
      whyWrong: `Work in units of "one principal of interest", not in multiples of the total.<br><br>
                 <b>Doubling</b> means the interest earned equals the principal: P of interest in
                 8 years. So the interest arrives at a steady <b>one principal every 8 years</b>.<br><br>
                 <b>Four times</b> means the final amount is 4P, so the interest must be
                 <b>3P</b> — three principals, at 8 years each: <code>3 × 8 = <b>24 years</b></code>.<br><br>
                 <b>16 years</b> is the trap: it doubles the time because the money doubled twice,
                 which would be true for <em>compound</em> interest but not for simple. Under simple
                 interest the money grows in a straight line, so the time grows in step with the
                 <em>interest</em>, not with the multiple.<br><br>
                 (Check with RT = 100: doubling in 8 years means R = 12.5%. For 3P of interest,
                 T = 300 ÷ 12.5 = 24. ✓)`,
    },
  ],
};
