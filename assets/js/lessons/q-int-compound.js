/* ============================================================
   Quants · Unit 3 · Lesson 2 — Compound Interest
   ============================================================ */

import { interestCurve } from '../widgets/rate-lab.js';

const DEPOSIT = { p: 10000, rate: 10, maxYears: 6, startYears: 2, unit: '₹' };

export default {
  id: 'q.int.compound',
  title: 'Compound Interest',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.int.speed',
  nextLabel: 'Next: Time, Speed & Distance →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'One hundred rupees, out of nowhere',
      say: `₹10,000 at 10% for two years.<br><br>
            <b>Simple interest:</b> ₹1,000 a year, so ₹2,000.<br>
            <b>Compound interest:</b> ₹2,100.<br><br>
            Where did the extra <b>₹100</b> come from? Nobody paid it in. It is the interest that
            the <em>first year's interest</em> earned in the second year — 10% of ₹1,000.<br><br>
            And that is the whole topic.`,
      cta: 'Show me the machinery',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'The base moves every year',
      say: `You met this idea in Unit 2 under a different name. Simple interest keeps the base
            fixed at the original principal; compound interest lets the base <b>grow</b>. Same
            trap, new costume.`,
      body: `
        <p><b>Amount = P × (1 + R/100)<sup>n</sup></b>, and <b>CI = Amount − P</b>. Notice there is
           no formula for CI on its own — you always find the amount first and subtract.</p>
        <p>₹10,000 at 10% for 2 years: <code>10,000 × 1.1 × 1.1 = ₹12,100</code>, so CI = ₹2,100.
           This is exactly the "multiply the factors" move from Successive Change; a rate of
           interest is just a percentage change applied year after year.</p>
        <p><b>The gap, which is what gets asked.</b> For <b>two years</b> the difference between CI
           and SI is exactly</p>
        <p><code>CI − SI = P × (R/100)<sup>2</sup></code></p>
        <p>For ₹10,000 at 10%: <code>10,000 × 0.1<sup>2</sup> = ₹100</code>. ✓ It is the interest on
           the first year's interest, and nothing else. For <b>three</b> years the gap is
           <code>P × (R/100)<sup>2</sup> × (3 + R/100)</code> — for the same numbers, ₹310.</p>
        <p><b>When the compounding is not yearly</b>, do not touch the formula — change the units.
           Half-yearly means the rate <b>halves</b> and the number of periods <b>doubles</b>.
           ₹8,000 at 10% per annum for one year, compounded half-yearly, is 5% for 2 periods:
           <code>8,000 × 1.05<sup>2</sup> = ₹8,820</code>, so CI = ₹820 rather than ₹800. More
           frequent compounding always earns more, because the base is refreshed sooner.</p>
        <p><b>Two sanity checks.</b> CI is always <em>at least</em> SI, and they are equal only for
           the first period. And CI must never be wildly larger — at ordinary exam rates it exceeds
           SI by a few per cent, not a few multiples.</p>`,
      cta: 'Let me open the gap',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Watch the curve leave the line',
      say: `Same widget as last lesson, now read the other way.<br><br>
            Stop at <b>two years</b> and check the gap against <b>P × (R/100)²</b> yourself. Then
            raise the rate and watch how much faster the gap grows than the interest does.`,
      widget: interestCurve(DEPOSIT),
      __cfg: DEPOSIT,
      tasks: [
        { label: 'Sit on <b>two years</b> and see the P(R/100)² rule', done: s => s.sawTwoYearRule },
        { label: 'Confirm they are <b>equal</b> at one year', done: s => s.equalAtYearOne },
        { label: 'Take the rate to <b>20%</b> over <b>six years</b>', done: s => s.rate === 20 && s.years === 6 },
      ],
      onComplete: `At 10% for two years the gap is ₹100. Double the rate to 20% and it does not
                   double — it quadruples to ₹400, because the rate is squared.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'ci-amount-first', conceptLabel: 'Find the amount, then subtract',
      input: 'number', answer: 2100, unit: 'rupees of interest',
      say: `Amount first. Always.`,
      context: `<b>₹10,000</b> at <b>10%</b> compounded annually for <b>2 years</b>.`,
      q: 'What is the compound interest?',
      whyRight: `Correct. <code>10,000 × 1.1 × 1.1 = ₹12,100</code>, so the interest is
                 <code>12,100 − 10,000 = <b>₹2,100</b></code>.`,
      whyWrong: `There is no direct formula for CI — find the <b>amount</b> and subtract.<br><br>
                 <b>Year 1:</b> 10,000 × 1.1 = ₹11,000.<br>
                 <b>Year 2:</b> 11,000 × 1.1 = <b>₹12,100</b>. Note the second year's interest is
                 ₹1,100, not ₹1,000 — it is charged on the grown balance.<br><br>
                 <code>CI = 12,100 − 10,000 = <b>₹2,100</b></code><br><br>
                 If you answered <b>12,100</b> you gave the amount. If you answered <b>2,000</b> you
                 computed simple interest and missed the ₹100 that the first year's interest
                 earned.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Where every rupee of the gap comes from',
      say: `Follow the second year closely — that is where compounding lives.`,
      steps: [
        `<b>Year one is identical.</b> Both methods charge 10% of ₹10,000 = ₹1,000. Simple and
         compound cannot differ yet, because nothing has accumulated to compound.`,
        `<b>Year two is where they part.</b> Simple charges 10% of the original ₹10,000 = ₹1,000
         again. Compound charges 10% of ₹11,000 = <b>₹1,100</b>. The extra <b>₹100</b> is 10% of
         last year's ₹1,000.`,
        `<b>So the two-year gap is P × (R/100)².</b> It is "the rate, applied to the rate, applied
         to the principal" — which is why the rate appears squared. ₹10,000 × 0.1² = ₹100. ✓`,
        `<b>Three years.</b> CI = ₹3,310 against SI = ₹3,000, a gap of <b>₹310</b>. The formula
         <code>P(R/100)²(3 + R/100)</code> gives 10,000 × 0.01 × 3.1 = 310. ✓ The gap is growing
         faster than the interest, because each year's surplus starts earning too.`,
        `<b>Compounding more often.</b> ₹8,000 at 10% for a year, half-yearly, is 5% twice:
         <code>8,000 × 1.05² = ₹8,820</code>. That is ₹820 against ₹800 annually — the same ₹20
         story, one level down.`,
      ],
      takeaway: `Amount first, then subtract. For a two-year difference between CI and SI, go
                 straight to P × (R/100)² — it is one multiplication and it is exact. For non-annual
                 compounding, halve the rate and double the periods before you start.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'ci-two-year-gap', conceptLabel: 'The two-year gap is P × (R/100)²',
      input: 'number', answer: 20, unit: 'rupees',
      context: `<b>₹8,000</b> is invested for <b>2 years</b> at <b>5%</b> per annum.`,
      q: 'By how much does the compound interest exceed the simple interest?',
      why: `Use the two-year rule and do it in one line.<br><br>
            <code>P × (R/100)² = 8,000 × (0.05)² = 8,000 × 0.0025 = <b>₹20</b></code><br><br>
            The long way confirms it: SI = 8,000 × 5 × 2 ÷ 100 = ₹800. CI: 8,000 × 1.05² = ₹8,820,
            so CI = ₹820. The difference is <b>₹20</b>. ✓<br><br>
            That ₹20 is simply 5% of the first year's ₹400 of interest — which is what the formula
            is saying.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'ci-amount-first', conceptLabel: 'Find the amount, then subtract',
      input: 'number', answer: 6760, unit: 'rupees',
      context: `<b>₹6,250</b> is deposited at <b>4%</b> per annum, compounded annually, for
                <b>2 years</b>.`,
      q: 'What is the amount at the end?',
      why: `<code>6,250 × 1.04 × 1.04 = 6,250 × 1.0816 = <b>₹6,760</b></code><br><br>
            Year by year, if you prefer: 4% of 6,250 is ₹250, giving ₹6,500. Then 4% of 6,500 is
            ₹260, giving <b>₹6,760</b>. The second year's interest is ₹10 more — which is 4% of the
            first ₹250, exactly as the gap rule predicts.<br><br>
            The compound interest itself is ₹510, against ₹500 simple.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'ci-periods', conceptLabel: 'Changing the compounding period',
      say: `The rate is annual. The compounding is not.`,
      context: `<b>₹8,000</b> is deposited at <b>10% per annum</b> for <b>one year</b>, compounded
                <b>half-yearly</b>.`,
      q: 'What is the compound interest?',
      options: ['₹800', '₹820', '₹1,600', '₹1,640'],
      answer: 1,
      whyRight: `Correct. Half-yearly means <b>5% for two periods</b>:
                 <code>8,000 × 1.05² = ₹8,820</code>, so the interest is <b>₹820</b> — twenty rupees
                 more than the ₹800 that annual compounding would give.`,
      whyWrong: `Do not change the formula. Change the <b>units</b>: halve the rate, double the
                 periods.<br><br>
                 <b>Rate per half-year:</b> 10% ÷ 2 = <b>5%</b>.<br>
                 <b>Number of periods:</b> 1 year × 2 = <b>2</b>.<br><br>
                 <code>8,000 × 1.05 × 1.05 = ₹8,820</code>, so <code>CI = <b>₹820</b></code>.<br><br>
                 <b>₹800</b> is annual compounding — it ignores the instruction entirely.
                 <b>₹1,600</b> and <b>₹1,640</b> come from using 10% <em>per half-year</em>, which
                 doubles the rate instead of halving it. The phrase "per annum" fixes the rate for
                 a year however often the interest is added.<br><br>
                 The direction is worth remembering: more frequent compounding always earns
                 <em>slightly more</em>, never less, and never anything like double.`,
    },
  ],
};
