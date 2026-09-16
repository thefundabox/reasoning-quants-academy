/* ============================================================
   Quants · Unit 2 · Lesson 3 — Partnership & Shares
   ============================================================ */

import { partnershipBoard } from '../widgets/share-bar.js';

const FIRM = {
  partners: [
    { name: 'Asha',  money: 12000, months: 12 },
    { name: 'Bhanu', money: 18000, months: 4 },
  ],
  profit: 9000,
  unit: '₹',
  maxMonths: 12,
};

export default {
  id: 'q.pct.partner',
  title: 'Partnership & Shares',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.pct.profit',
  nextLabel: 'Next: Profit, Loss & Discount →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The bigger cheque loses',
      say: `Asha puts <b>₹12,000</b> into a shop and stays for <b>12 months</b>.<br>
            Bhanu puts <b>₹18,000</b> in and leaves after <b>4 months</b>.<br><br>
            Bhanu invested half as much again as Asha. So Bhanu takes the larger share of the
            profit — obviously.<br><br>
            No. Asha takes <b>twice</b> what Bhanu takes. Money alone was never the ratio.`,
      cta: 'Then what is?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Rupee-months, not rupees',
      say: `A rupee that sits in the business for a year does twice the work of a rupee that sits
            there for six months. So the thing you compare is not the money — it is the
            <b>money multiplied by the time it stayed</b>.`,
      body: `
        <p>Compute <b>capital × months</b> for each partner. That product, and nothing else, is the
           ratio the profit divides in.</p>
        <ul>
          <li>Asha: <code>12,000 × 12 = 144,000</code></li>
          <li>Bhanu: <code>18,000 × 4 = 72,000</code></li>
        </ul>
        <p>144,000 : 72,000 reduces to <b>2 : 1</b>. On a profit of ₹9,000 that is
           <b>₹6,000</b> and <b>₹3,000</b> — and they add back to 9,000, which is your check.</p>
        <p><b>The three forms this takes.</b></p>
        <ul>
          <li><b>Same time, different money.</b> The months cancel, so the ratio is just the
              capitals. This is the easy case, and it is why people wrongly believe capital is
              always the answer.</li>
          <li><b>Different time.</b> Multiply. Always.</li>
          <li><b>Solve for the missing piece.</b> If the profits are equal, the products must be
              equal — set them equal and solve for the unknown months or the unknown capital.</li>
        </ul>
        <p><b>A caution about wording.</b> "Joined after 3 months" in a twelve-month year means the
           partner was in for <b>9</b> months, not 3. Read for how long the money was actually
           working.</p>`,
      cta: 'Give me the sliders',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Drag the months, watch the profit move',
      say: `Asha's ₹12,000 and Bhanu's ₹18,000 are fixed. Only the <b>months</b> move.<br><br>
            Bhanu put in more money. See whether you can make that matter — and find where the
            two of them come out exactly level.`,
      widget: partnershipBoard(FIRM),
      __cfg: FIRM,
      tasks: [
        { label: 'Make <b>Asha</b> earn more, despite the smaller cheque', done: s => s.richestIsNotEarner },
        { label: 'Make <b>Bhanu</b> earn more instead', done: s => !s.richestIsNotEarner },
        { label: 'Get the two shares <b>exactly equal</b>', done: s => s.equalShares },
      ],
      onComplete: `The level point is where 12,000 × months equals 18,000 × months — the products
                   match even though the cheques never do.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'partner-capital-months', conceptLabel: 'Profit follows capital × time',
      input: 'number', answer: 6000, unit: 'rupees to Asha',
      say: `Commit before I explain it.`,
      context: `Asha: <b>₹12,000 for 12 months</b>. Bhanu: <b>₹18,000 for 4 months</b>.
                The year's profit is <b>₹9,000</b>.`,
      q: "What is Asha's share?",
      whyRight: `Correct. 12,000 × 12 = 144,000 against 18,000 × 4 = 72,000, a ratio of 2 : 1.
                 Asha takes two of the three parts: <b>₹6,000</b>.`,
      whyWrong: `Multiply each capital by the months it stayed.<br><br>
                 Asha: <code>12,000 × 12 = 144,000</code><br>
                 Bhanu: <code>18,000 × 4 = 72,000</code><br><br>
                 That is <b>2 : 1</b> — three parts in all, so one part of the ₹9,000 profit is
                 ₹3,000.<br><br>
                 Asha holds two parts: <b>₹6,000</b>. Bhanu holds one: ₹3,000. Together ₹9,000. ✓<br><br>
                 Splitting by capital alone (12 : 18) would have given Asha ₹3,600 — the trap.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Three partners, one method',
      say: `Scaling up changes nothing at all.`,
      steps: [
        `<b>Multiply each partner out.</b> Asha ₹8,000 for 12 months → 96,000. Bhanu ₹12,000 for
         6 months → 72,000. Chandu ₹6,000 for 8 months → 48,000.`,
        `<b>Reduce.</b> 96,000 : 72,000 : 48,000, all divisible by 24,000 → <b>4 : 3 : 2</b>.
         Nine parts.`,
        `<b>Divide the profit.</b> On ₹18,000 that is ₹2,000 a part, so <b>₹8,000 · ₹6,000 · ₹4,000</b>.
         They add back to ₹18,000. ✓`,
        `<b>Note who is where.</b> Bhanu put in the most money and finishes second, because Asha's
         smaller capital worked for twice as long. This is the whole topic in one line.`,
        `<b>And in reverse.</b> If two partners' profits are equal, their products are equal. Asha's
         ₹9,000 over 12 months is 108,000; for Bhanu's ₹12,000 to match, he needs
         <code>108,000 ÷ 12,000 = 9</code> months — so he <em>joined three months late</em>.`,
      ],
      takeaway: `Write capital × months under every name before you do anything else. The question
                 is then an ordinary ratio question, and you already know how to finish those.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'partner-capital-months', conceptLabel: 'Profit follows capital × time',
      input: 'number', answer: 4000, unit: "rupees to Chandu",
      context: `Asha invests <b>₹8,000 for 12 months</b>, Bhanu <b>₹12,000 for 6 months</b> and
                Chandu <b>₹6,000 for 8 months</b>. The profit is <b>₹18,000</b>.`,
      q: "What is Chandu's share?",
      why: `Products first: <code>96,000</code>, <code>72,000</code>, <code>48,000</code>.<br><br>
            Divide through by 24,000 → <b>4 : 3 : 2</b>, which is 9 parts. One part of ₹18,000
            is ₹2,000.<br><br>
            Chandu holds 2 parts: <b>₹4,000</b>. (Asha ₹8,000, Bhanu ₹6,000 — and 8,000 + 6,000 +
            4,000 = 18,000. ✓)`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'partner-ratio-of-ratios', conceptLabel: 'Multiplying a capital ratio by a time ratio',
      context: `Two partners invest in the ratio <b>5 : 6</b>, and stay for <b>8</b> and
                <b>10</b> months respectively.`,
      q: 'In what ratio is the profit divided?',
      options: ['5 : 6', '4 : 5', '2 : 3', '3 : 2'],
      answer: 2,
      whyRight: `Yes — <code>5 × 8 = 40</code> and <code>6 × 10 = 60</code>, which reduces to
                 <b>2 : 3</b>. You never needed the actual rupees.`,
      whyWrong: `You can multiply the ratios directly; the unknown common factor cancels.<br><br>
                 <code>5 × 8 = 40</code> · <code>6 × 10 = 60</code> → divide both by 20 →
                 <b>2 : 3</b>.<br><br>
                 <b>5 : 6</b> is capital alone, ignoring that the second partner also stayed longer.
                 <b>4 : 5</b> is the time ratio 8 : 10 reduced — the other half of the answer on its
                 own. Neither is enough; the product is what counts.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'partner-solve-time', conceptLabel: 'Solving backwards for the missing months',
      say: `Now run the method backwards.`,
      context: `Asha invests <b>₹9,000</b> at the start of the year. Bhanu invests <b>₹12,000</b>
                but joins later. At the end of the twelve months they take <b>equal</b> profits.`,
      q: 'How many months after the start did Bhanu join?',
      options: ['2 months', '3 months', '4 months', '9 months'],
      answer: 1,
      whyRight: `Correct. Asha's product is 9,000 × 12 = 108,000, so Bhanu needs
                 <code>108,000 ÷ 12,000 = 9</code> months in the business — meaning he joined
                 <b>3 months</b> late.`,
      whyWrong: `Equal profits mean <b>equal products</b>. That is the whole equation.<br><br>
                 Asha: <code>9,000 × 12 = 108,000</code>.<br>
                 Bhanu must match it: <code>12,000 × t = 108,000</code>, so <code>t = 9</code>
                 months.<br><br>
                 Now read the question again — it asks when he <b>joined</b>, not how long he
                 stayed. Nine months in the business means he joined
                 <code>12 − 9 = <b>3 months</b></code> after the start.<br><br>
                 <b>9 months</b> is the value of <em>t</em>, sitting there as the trap for anyone
                 who stops one line early.`,
    },
  ],
};
