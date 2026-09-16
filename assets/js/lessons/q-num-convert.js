/* ============================================================
   Quants · Unit 1 · Lesson 4 — Fractions ⇄ Percents
   ============================================================ */

import { benchmarkTable } from '../widgets/number-lab.js';

const BENCH = {
  fractions: [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 8], [2, 3], [3, 4], [3, 8], [5, 8]],
};

export default {
  id: 'q.num.convert',
  title: 'Fractions ⇄ Percents',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.num.powers',
  nextLabel: 'Next: Squares, Cubes & Roots →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: '37.5% of 640, without touching a decimal',
      say: `Most people reach for <b>640 × 0.375</b> and start multiplying.<br><br>
            But 37.5% <em>is</em> <b>3/8</b>. And 640 ÷ 8 = 80, so three of those is <b>240</b>.
            Two divisions and no decimal point.<br><br>
            Examiners choose 37.5%, 62.5%, 16⅔% and 87.5% precisely because they look ugly as
            decimals and are trivial as fractions.`,
      cta: 'Show me the pairs',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Twenty conversions, and then you stop calculating',
      say: `Percent means "out of a hundred", so a fraction becomes a percent by dividing and
            multiplying by 100. Do that once for each common fraction and never again.`,
      body: `
        <p><b>The eighths are the money.</b> They are the ones that look worst as decimals:</p>
        <ul>
          <li>1/8 = <b>12.5%</b> · 3/8 = <b>37.5%</b> · 5/8 = <b>62.5%</b> · 7/8 = <b>87.5%</b></li>
        </ul>
        <p><b>The thirds and sixths recur</b>, which is exactly why they get used:</p>
        <ul>
          <li>1/3 = <b>33⅓%</b> · 2/3 = <b>66⅔%</b> · 1/6 = <b>16⅔%</b> · 5/6 = <b>83⅓%</b></li>
        </ul>
        <p><b>The easy ones you already half-know:</b> 1/2 = 50%, 1/4 = 25%, 3/4 = 75%,
           1/5 = 20%, 2/5 = 40%, 1/10 = 10%, 1/20 = 5%, 1/25 = 4%.</p>
        <p><b>How to use them.</b> When a percentage appears, replace it with its fraction and
           <em>divide</em>. "62.5% of 4,800" becomes "5/8 of 4,800": 4,800 ÷ 8 = 600, times 5 =
           <b>3,000</b>. Dividing by 8 is far easier than multiplying by 0.625, and there is nowhere
           to lose a decimal point.</p>
        <p><b>And going backwards.</b> "What percent is 240 of 640?" — form the fraction 240/640,
           cancel to <b>3/8</b>, and read off <b>37.5%</b>. Cancelling before converting is almost
           always faster than dividing 240 by 640.</p>
        <p><b>One warning.</b> 1/3 is <b>33.33…%</b>, not 33%. In a multi-step question that
           rounding will drift, so keep it as a fraction until the very last line.</p>`,
      cta: 'Let me flip them',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Guess, then flip',
      say: `Ten fractions. Say the percentage in your head <b>before</b> you tap each one.<br><br>
            The ones that come out exact are the ones worth memorising. The ones that recur are
            the ones the examiner reaches for.`,
      widget: benchmarkTable(BENCH),
      __cfg: BENCH,
      tasks: [
        { label: 'Flip all ten', done: s => s.revealedAll },
      ],
      onComplete: `Four of the ten land on whole percentages. The eighths give you a clean half,
                   and the thirds and sixths never settle at all.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'convert-fraction-first', conceptLabel: 'Turning a percentage into a fraction first',
      input: 'number', answer: 3000, unit: 'rupees',
      say: `Use the fraction, not the decimal.`,
      context: `A scheme spends <b>62.5%</b> of a <b>₹4,800</b> grant on materials.`,
      q: 'How much goes on materials?',
      whyRight: `Correct. 62.5% is <b>5/8</b>, so 4,800 ÷ 8 = 600 and 5 × 600 = <b>₹3,000</b>.
                 Two easy steps instead of one awkward multiplication.`,
      whyWrong: `Recognise the percentage before you compute with it. <b>62.5% = 5/8</b>.<br><br>
                 <code>4,800 ÷ 8 = 600</code> — that is one eighth.<br>
                 <code>5 × 600 = <b>₹3,000</b></code><br><br>
                 Multiplying 4,800 × 0.625 gets the same answer, but it takes longer and it is the
                 place a decimal point goes missing under time pressure.<br><br>
                 Sanity-check it against a benchmark: 62.5% is a little over half, and half of
                 4,800 is 2,400. ₹3,000 sits just above — correct.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Both directions, on the same numbers',
      say: `Forwards is divide-then-multiply. Backwards is cancel-then-read.`,
      steps: [
        `<b>Percent → amount.</b> 37.5% of 640. Recognise 37.5% = <b>3/8</b>. Then 640 ÷ 8 = 80 and
         3 × 80 = <b>240</b>. Never multiply by 0.375.`,
        `<b>Amount → percent.</b> "240 out of 640 — what percent?" Write 240/640 and cancel:
         divide both by 80 to get <b>3/8</b>, which you already know is <b>37.5%</b>. Cancelling is
         faster than dividing.`,
        `<b>Why the eighths matter so much.</b> Every eighth ends in .5 as a percentage —
         12.5, 25, 37.5, 50, 62.5, 75, 87.5. An option list full of .5 percentages is a signal that
         the intended route was eighths.`,
        `<b>Keep thirds as fractions.</b> 1/3 of 2,400 is 800 exactly. Working with 33% would give
         792, and 33.33% gives 799.92 — close enough to pick a wrong option when two of them sit
         near each other.`,
        `<b>The reflex.</b> Whenever you see a percentage with a .5, or a recurring decimal, stop and
         name the fraction. It is almost always eighths, thirds or sixths.`,
      ],
      takeaway: `Turn the percentage into a fraction and divide. Turn the amount into a fraction and
                 cancel. The twenty pairs are worth ten minutes of memorising and they pay back in
                 every arithmetic question you will ever sit.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'convert-backwards', conceptLabel: 'Cancelling a fraction to read its percentage',
      context: `In a test, a candidate scores <b>240</b> out of <b>640</b>.`,
      q: 'What percentage is that?',
      options: ['35%', '37.5%', '40%', '42.5%'],
      answer: 1,
      whyRight: `Yes. 240/640 cancels to <b>3/8</b> — divide both by 80 — and 3/8 is <b>37.5%</b>.`,
      whyWrong: `Form the fraction and cancel before doing any division.<br><br>
                 <code>240/640</code> — both divide by 80, giving <b>3/8</b>.<br><br>
                 And 3/8 = <b>37.5%</b>, straight off the benchmark list.<br><br>
                 If you did not spot the cancelling: 640 ÷ 8 = 80, and 240 is exactly three of
                 those. The .5 in the answer is the giveaway that eighths were involved — none of
                 the other options could come from an eighth.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'convert-thirds', conceptLabel: 'Keeping recurring fractions as fractions',
      input: 'number', answer: 800, unit: 'rupees',
      context: `A department spends <b>33⅓%</b> of a <b>₹2,400</b> budget on training.`,
      q: 'How much is spent on training?',
      why: `33⅓% is exactly <b>1/3</b>, so the answer is <code>2,400 ÷ 3 = <b>₹800</b></code>.<br><br>
            Notice what happens if you round: 33% of 2,400 is ₹792, and 33.33% is ₹799.92. Both
            are wrong, and in a question where the options were 792, 800 and 810 you would have
            walked into one.<br><br>
            Recurring percentages are always a fraction in disguise. Convert first, round last —
            if at all.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'convert-fraction-first', conceptLabel: 'Turning a percentage into a fraction first',
      say: `Two percentages, one after the other. Fractions make it almost free.`,
      context: `A cooperative harvests <b>4,800</b> quintals. It sells <b>62.5%</b> at the mandi,
                and <b>1/6</b> of <b>what remains</b> is kept as seed.`,
      q: 'How many quintals are kept as seed?',
      options: ['300', '500', '600', '800'],
      answer: 0,
      whyRight: `Correct. 62.5% = 5/8, so 3,000 is sold and <b>1,800</b> remains. A sixth of 1,800
                 is <b>300</b>.`,
      whyWrong: `Do it in fractions and it is two divisions.<br><br>
                 <b>Sold:</b> 62.5% = 5/8. 4,800 ÷ 8 = 600, so 5 × 600 = 3,000 quintals sold.<br><br>
                 <b>Remaining:</b> 4,800 − 3,000 = <b>1,800</b>. (Or note that what is left is 3/8,
                 and 3 × 600 = 1,800 — faster still.)<br><br>
                 <b>Seed:</b> 1/6 of 1,800 = <b>300</b> quintals.<br><br>
                 <b>800</b> is the trap: it is 1/6 of the <em>original</em> 4,800. The question says
                 "of what remains", and this unit's recurring lesson is that a fraction is
                 meaningless until you name what it is a fraction <em>of</em>.`,
    },
  ],
};
