/* ============================================================
   Quants · Unit 2 · Lesson 2 — Ratio & Proportion
   ============================================================ */

import { ratioBar } from '../widgets/share-bar.js';

const SPLIT = {
  totals: [3600, 6300, 9000],
  start: 6300,
  names: ['Youngest', 'Middle', 'Eldest'],
  parts: [2, 3, 4],
  unit: '₹',
};

export default {
  id: 'q.pct.ratio',
  title: 'Ratio & Proportion',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.pct.partner',
  nextLabel: 'Next: Partnership & Shares →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Nine parts, not three people',
      say: `A grandmother leaves <b>₹6,300</b> to three grandchildren in the ratio <b>2 : 3 : 4</b>.
            How much does the middle one get?<br><br>
            Most candidates start dividing 6,300 by 3. That is the wrong three. The money is not
            in three pieces — it is in <b>2 + 3 + 4 = nine</b> pieces, and the middle child holds
            three of them.<br><br>
            Find what one piece is worth and the whole question collapses.`,
      cta: 'Show me the one part',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Every ratio question is the same question',
      say: `There is one move. Everything in this topic is that move, possibly twice.`,
      body: `
        <p><b>Find the value of one part.</b> Add the ratio numbers to get the number of parts, then
           divide the total by that.</p>
        <p>₹6,300 in 2 : 3 : 4 → <code>2 + 3 + 4 = 9 parts</code> → <code>6300 ÷ 9 = ₹700 per part</code>.
           Now just multiply: <b>₹1,400</b>, <b>₹2,100</b>, <b>₹2,800</b>. They add back to 6,300,
           which is your check and costs two seconds.</p>
        <p><b>The three shapes the examiner uses.</b></p>
        <ul>
          <li><b>Given the total.</b> Straight to one part, as above.</li>
          <li><b>Given a difference.</b> "Divided 5 : 7, the second gets ₹480 more." The gap is
              <code>7 − 5 = 2 parts</code>, so one part is <code>480 ÷ 2 = ₹240</code>. Same move —
              you were handed the value of two parts instead of twelve.</li>
          <li><b>Given two chained ratios.</b> A : B = 3 : 4 and B : C = 6 : 7. B is written two
              different ways, so make them agree: scale the first by 3 and the second by 2, giving
              B = 12 in both. Then <b>A : B : C = 9 : 12 : 14</b>.</li>
        </ul>
        <p><b>A ratio is not a quantity.</b> 2 : 3 : 4 and 20 : 30 : 40 are the same ratio. Only the
           total tells you what a part is worth — which is why the first thing you look for is the
           total, the difference, or a share you already know.</p>`,
      cta: 'Let me move the parts',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'One part is the whole trick',
      say: `Change the total and watch every share move together. Add or remove parts and watch
            the bar redraw.<br><br>
            Keep your eye on the one-part line. Every rupee on this screen is that number,
            multiplied.`,
      widget: ratioBar(SPLIT),
      __cfg: SPLIT,
      tasks: [
        { label: 'Get one part to land on exactly <b>₹700</b>', done: s => Math.abs(s.one - 700) < 1e-9 },
        { label: 'Make all three shares <b>equal</b>', done: s => s.allEqual },
        { label: 'Make one share more than <b>half</b> the total', done: s => s.maxOverHalf },
      ],
      onComplete: `Notice what the last one forced you to do: a share passes half only when its part
                   beats all the others put together. 4 out of 9 never could.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'ratio-one-part', conceptLabel: 'Find the value of one part',
      input: 'number', answer: 2100, unit: 'rupees',
      say: `The question from the start. One part first.`,
      context: `<b>₹6,300</b> divided among three grandchildren in the ratio <b>2 : 3 : 4</b>.`,
      q: 'How much does the middle grandchild receive?',
      whyRight: `Correct. 2 + 3 + 4 = 9 parts, 6300 ÷ 9 = ₹700 a part, and the middle child holds
                 3 of them: <b>₹2,100</b>.`,
      whyWrong: `Count the parts, not the people. <b>2 + 3 + 4 = 9</b>, so one part is
                 <code>6300 ÷ 9 = ₹700</code>.<br><br>
                 The middle child has 3 parts: <code>3 × 700 = <b>₹2,100</b></code>.<br><br>
                 Check it — 1,400 + 2,100 + 2,800 = 6,300. If you divided by 3 you got ₹2,100 by
                 accident here, which is exactly why this ratio was chosen: the lucky answer breaks
                 the moment the ratio changes.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The same move, three ways round',
      say: `Watch how little changes between the shapes.`,
      steps: [
        `<b>Given the total.</b> 6,300 in 2 : 3 : 4. Nine parts, so one part is ₹700, and the shares
         are ₹1,400 · ₹2,100 · ₹2,800. Add them back: 6,300. ✓`,
        `<b>Given a difference.</b> Split 5 : 7 where the second gets ₹480 more. The difference is
         <code>7 − 5 = 2 parts</code>, so one part is <code>480 ÷ 2 = ₹240</code>, and the total is
         <code>12 × 240 = ₹2,880</code>. You never needed the total to find it.`,
        `<b>Given two ratios sharing a term.</b> A : B = 3 : 4, B : C = 6 : 7. B is 4 in one and 6
         in the other; the smallest number both divide is 12. Scale ×3 and ×2:
         <b>A : B : C = 9 : 12 : 14</b>. Check both halves still hold — 9 : 12 is 3 : 4, and
         12 : 14 is 6 : 7. ✓`,
        `<b>Always add the shares back.</b> It catches an arithmetic slip in two seconds and it is
         the only check that is free.`,
      ],
      takeaway: `Add the ratio numbers, divide the total by that, multiply back. If you are given a
                 difference instead of a total, divide by the difference of the ratio numbers — the
                 move does not change.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'ratio-difference', conceptLabel: 'When you are given a difference, not a total',
      input: 'number', answer: 2880, unit: 'rupees',
      context: `A sum is divided between two people in the ratio <b>5 : 7</b>. The second receives
                <b>₹480 more</b> than the first.`,
      q: 'What was the total sum?',
      why: `You were handed the value of the <b>gap</b>, not the whole.<br><br>
            The gap is <code>7 − 5 = 2 parts</code>, so one part is <code>480 ÷ 2 = ₹240</code>.<br><br>
            The total is <code>5 + 7 = 12 parts</code>, so <code>12 × 240 = <b>₹2,880</b></code>.
            Check: the shares are ₹1,200 and ₹1,680, which differ by exactly ₹480. ✓`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'ratio-chain', conceptLabel: 'Chaining two ratios through a shared term',
      context: `<b>A : B = 3 : 4</b> and <b>B : C = 6 : 7</b>.`,
      q: 'What is A : B : C?',
      options: ['3 : 4 : 7', '9 : 12 : 14', '3 : 6 : 7', '18 : 24 : 28'],
      answer: 1,
      whyRight: `Yes. B has to mean the same thing in both, so bring it to 12 — scale the first by 3
                 and the second by 2. <b>9 : 12 : 14.</b>`,
      whyWrong: `B is written as <b>4</b> in one ratio and <b>6</b> in the other. Until those agree
                 you cannot join them.<br><br>
                 The smallest number both divide is <b>12</b>. Scale 3 : 4 by three → <b>9 : 12</b>.
                 Scale 6 : 7 by two → <b>12 : 14</b>. Now B matches, so
                 <b>A : B : C = 9 : 12 : 14</b>.<br><br>
                 <b>3 : 4 : 7</b> simply staples the ratios together and quietly changes what B means.
                 <b>18 : 24 : 28</b> is the same ratio as the answer doubled — correct as a ratio, but
                 not in simplest form, and the examiner asks for simplest.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'ratio-one-part', conceptLabel: 'Find the value of one part',
      say: `Back to the grandchildren. One extra move.`,
      context: `₹6,300 was divided in the ratio <b>2 : 3 : 4</b>. The eldest then gives
                <b>₹700</b> to the youngest.`,
      q: 'What is the new ratio of their shares?',
      options: ['1 : 1 : 1', '3 : 3 : 2', '2 : 3 : 3', '1 : 2 : 1'],
      answer: 0,
      whyRight: `Exactly. The youngest goes 1,400 → 2,100 and the eldest 2,800 → 2,100, while the
                 middle child never moved from 2,100. All three now hold <b>₹2,100</b>, so the ratio
                 is <b>1 : 1 : 1</b>.`,
      whyWrong: `Work in rupees, then reduce at the end — never try to shift the ratio numbers
                 directly.<br><br>
                 The original shares are <b>₹1,400 · ₹2,100 · ₹2,800</b> (one part = ₹700).<br><br>
                 ₹700 moves from the eldest to the youngest:
                 <code>1400 + 700 = 2100</code> and <code>2800 − 700 = 2100</code>. The middle child
                 is untouched at ₹2,100.<br><br>
                 Three equal shares of ₹2,100 — and 3 × 2,100 = 6,300, so no money has gone missing.
                 The ratio is <b>1 : 1 : 1</b>.`,
    },
  ],
};
