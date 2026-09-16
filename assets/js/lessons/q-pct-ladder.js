/* ============================================================
   Quants · Unit 2 · Lesson 1 — The Percent Ladder
   ============================================================ */

import { percentLadder, percentEstimate } from '../widgets/percent-bar.js';

const BAR = { total: 480, start: 0 };
const EYE = { rounds: 3, tolerance: 4 };

export default {
  id: 'q.pct.ladder',
  title: 'The Percent Ladder',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.pct.ratio',
  nextLabel: 'Next: Ratio & Proportion →',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Two claims. One of them is false.',
      say: `A shop on Johari Bazaar advertises <b>40% off</b>, then adds <b>5% GST</b> at the counter.
            Your friend says: "So it's really a 35% discount."<br><br>
            Separately — <b>what is 15% of 240?</b> No pen. No calculator.<br><br>
            Most people fail both. Not from weak arithmetic — from never having been shown
            that percentages are built from a handful of <b>rungs</b>.`,
      cta: 'Show me the rungs',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'You only ever need five percentages',
      say: `Every percentage an exam asks for can be assembled from these five, by adding and halving.
            Nothing else needs to be computed from scratch.`,
      body: `
        <ul>
          <li><b>50%</b> — halve it. <em>50% of 480 = 240</em></li>
          <li><b>25%</b> — halve the half. <em>25% of 480 = 120</em></li>
          <li><b>10%</b> — move the decimal one place left. <em>10% of 480 = 48</em></li>
          <li><b>5%</b> — half of the 10%. <em>5% of 480 = 24</em></li>
          <li><b>1%</b> — move the decimal two places left. <em>1% of 480 = 4.8</em></li>
        </ul>
        <p>Now assemble. <b>35%</b> is just <code>25% + 10%</code>. <b>17%</b> is <code>10% + 5% + 1% + 1%</code>.
           <b>65%</b> is <code>50% + 10% + 5%</code>. You are never multiplying — you are stacking rungs.</p>
        <p>This is also why estimation works: once 10% is instant, you can bracket any answer before you calculate it,
           and a wrong option often becomes obvious without doing the sum at all.</p>`,
      cta: 'Let me feel it',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Drag the bar. Find every rung.',
      say: `The bar is 480. Move it and watch the value. Stop exactly on each rung —
            those five numbers are the only ones worth memorising.`,
      widget: percentLadder(BAR),
      __cfg: BAR,
      tasks: [
        { label: 'Land exactly on <b>50%</b>, <b>25%</b>, <b>10%</b>, <b>5%</b> and <b>1%</b>',
          done: s => s.reachedAll && s.reached.length >= 5 },
        { label: 'Push past <b>75%</b> — notice 75% is just 50% + 25%',
          done: s => s.pct >= 75 },
      ],
      onComplete: 'Now the rungs are in your hand, not in a formula sheet.',
      ctaDone: 'Test me',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'pct-build', conceptLabel: 'Building a percentage from rungs',
      input: 'number', answer: 36, unit: 'is 15% of 240',
      say: `The question from the start. Use the ladder, not long multiplication.`,
      q: 'What is 15% of 240?',
      whyRight: `Correct. <b>10% of 240 = 24</b>, and <b>5% is half of that = 12</b>. 24 + 12 = <b>36</b>.
                 Two steps, no working out.`,
      whyWrong: `Climb the ladder: <b>10% of 240 = 24</b> (decimal moves one place).
                 <b>5% is half of 10% = 12</b>. So 15% = 24 + 12 = <b>36</b>.
                 Never multiply 240 × 0.15 by hand — build it.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The same method, on harder numbers',
      say: `Watch how little arithmetic this needs.`,
      steps: [
        `<b>Find 10% first — always.</b> For 840, that is 84. This single step costs nothing and anchors everything after it.`,
        `<b>Halve for 5%.</b> 84 ÷ 2 = 42. You now own 10% and 5% of the number.`,
        `<b>Stack to the target.</b> Need 35%? That is 25% + 10%. Need 45%? That is 50% − 5% = 420 − 42 = <b>378</b>. Subtracting a rung is as legal as adding one.`,
        `<b>Sanity-check against a half.</b> 45% must sit just under half of 840 = 420. 378 does. If your answer had come out as 520, you would catch it instantly.`,
      ],
      takeaway: `Compute 10% before you read the options. It turns four-option guessing into two-option certainty.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'pct-build', conceptLabel: 'Building a percentage from rungs',
      input: 'number', answer: 126, unit: 'candidates',
      context: `A Kota exam centre has <b>840</b> registered candidates. On exam day <b>15%</b> did not appear.`,
      q: 'How many candidates were absent?',
      why: `10% of 840 = 84. Half of that is 5% = 42. So 15% = 84 + 42 = <b>126</b>.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'pct-reverse', conceptLabel: 'Reversing a percentage',
      context: `A farmer near Sri Ganganagar harvests <b>240 quintals</b> of mustard and sells <b>36 quintals</b> at the local mandi.`,
      q: '36 is what percentage of 240?',
      options: ['12%', '15%', '18%', '20%'],
      answer: 1,
      why: `Reverse the ladder. 10% of 240 = 24, and 5% = 12. Since 24 + 12 = 36, the answer is 10% + 5% = <b>15%</b>.
            Reversing is the same skill — you are still just stacking rungs until you hit the number.`,
    },

    /* ---------------- SECOND EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Drill', mood: 'teasing',
      title: 'Now without the numbers',
      say: `Toppers shade the bar in their head before they calculate. Three targets — get within 4% by eye.`,
      widget: percentEstimate(EYE),
      __cfg: EYE,
      tasks: [
        { label: 'Complete all three estimates', done: s => s.finished },
      ],
      onComplete: 'That instinct is worth more than speed in arithmetic.',
      ctaDone: 'On to the real trap',
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'pct-successive', conceptLabel: 'Successive percentage change',
      say: `Back to Johari Bazaar. This is where almost everyone loses the mark.`,
      context: `A shawl is marked <b>₹2,000</b>. The shop gives <b>40% off</b>, then adds <b>5% GST</b> on the discounted price.
                Your friend claims this is the same as a flat 35% discount, so ₹1,300.`,
      q: 'What does the customer actually pay?',
      options: ['₹1,300', '₹1,260', '₹1,200', '₹1,340'],
      answer: 1,
      whyRight: `Right — and note <b>why</b> your friend is wrong. Percentages do not add, because each one is
                 taken of a <b>different base</b>. 40% off 2,000 → 1,200. Then 5% GST is charged on <b>1,200</b>,
                 not on 2,000: 5% of 1,200 = 60. Total <b>₹1,260</b>. A flat 35% off would have been ₹1,300 —
                 the customer is actually ₹40 better off.`,
      whyWrong: `The trap is treating −40% and +5% as −35%. They apply to <b>different bases</b>.<br><br>
                 40% of 2,000 = 800, so the discounted price is <b>1,200</b>.
                 The 5% GST is then charged on 1,200, not on 2,000 — and 5% of 1,200 = 60 (use the ladder: 10% = 120, half it).
                 Total = <b>₹1,260</b>. Your friend's ₹1,300 is off by ₹40.`,
    },
  ],
};
