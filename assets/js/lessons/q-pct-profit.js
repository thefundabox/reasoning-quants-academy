/* ============================================================
   Quants · Unit 2 · Lesson 4 — Profit, Loss & Discount
   ============================================================ */

import { tradeBar } from '../widgets/trade-bar.js';

const SHOP = { cp: 500, markup: 60, discount: 25, unit: '₹', maxMarkup: 100, maxDiscount: 60 };

export default {
  id: 'q.pct.profit',
  title: 'Profit, Loss & Discount',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.pct.successive',
  nextLabel: 'Next: Successive Change →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'A 25% discount, and he still makes 20%',
      say: `A shawl is marked <b>₹800</b>. The shopkeeper knocks off <b>25%</b> — a real discount,
            not a trick — and <em>still</em> walks away with a <b>20% profit</b>.<br><br>
            Both numbers are true at once, and there is nothing dishonest about it. They are
            simply measured against <b>different prices</b>.<br><br>
            Until you know which percentage sits on which price, this topic will keep taking
            marks off you.`,
      cta: 'Which sits on which?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Three prices, in order',
      say: `Write these three down the side of your rough sheet on every single question. Almost
            every mistake in this topic is a percentage applied to the wrong one.`,
      body: `
        <ul>
          <li><b>CP — cost price.</b> What the seller paid. <b>Profit and loss are always measured
              against this.</b></li>
          <li><b>MP — marked price.</b> The tag. <b>Discount is always measured against this.</b></li>
          <li><b>SP — selling price.</b> What the customer actually hands over.</li>
        </ul>
        <p>They chain: <code>CP —(markup on CP)→ MP —(discount on MP)→ SP</code>.</p>
        <p>So for a cost of ₹500 marked up 60%: <code>MP = 500 × 1.60 = ₹800</code>. Take 25% off
           that: <code>SP = 800 × 0.75 = ₹600</code>. The profit is <code>600 − 500 = ₹100</code>,
           and as a percentage it is <code>100 ÷ <b>500</b> = 20%</code> — divided by the
           <em>cost</em>, never by the marked price.</p>
        <p><b>Going backwards.</b> If something sells at ₹960 for a 20% profit, then ₹960 is
           <b>120%</b> of the cost, so <code>CP = 960 ÷ 1.2 = ₹800</code>. Never subtract 20% of the
           selling price — that would be taking the percentage off the wrong base again.</p>
        <p><b>One factor does the lot.</b> Mark up 40% then discount 15%:
           <code>1.40 × 0.85 = 1.19</code>, a 19% profit, whatever the cost happens to be.</p>`,
      cta: 'Let me drag the prices',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Two percentages, two different bars',
      say: `Cost is fixed at <b>₹500</b>. Move the markup and the discount and watch where the
            selling price lands.<br><br>
            The markup is measured from the <b>cost</b> bar. The discount is measured from the
            <b>marked</b> bar. That is why a 60% markup survives a 25% discount.`,
      widget: tradeBar(SHOP),
      __cfg: SHOP,
      tasks: [
        { label: 'Land on a profit of exactly <b>20%</b>', done: s => s.hit20 },
        { label: 'Find a markup and discount that <b>break even</b>', done: s => s.sawBreakEven && s.markup > 0 },
        { label: 'Make a <b>loss</b> — with the discount smaller than the markup',
          done: s => s.sawLoss && !s.discountOverMarkup },
      ],
      onComplete: `That last one is the point. A 50% markup dies to a 40% discount, even though 40
                   is the smaller number — because the 40% is taken off a bigger price.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'trade-bases', conceptLabel: 'Profit sits on cost, discount sits on marked price',
      input: 'number', answer: 500, unit: 'rupees',
      say: `The shawl from the start. Work backwards down the chain.`,
      context: `Marked <b>₹800</b>, sold at a <b>25% discount</b>, and the shopkeeper still made a
                <b>20% profit</b>.`,
      q: 'What did the shawl cost him?',
      whyRight: `Correct. The discount gives <code>800 × 0.75 = ₹600</code> as the selling price,
                 and ₹600 is 120% of cost, so <code>600 ÷ 1.2 = <b>₹500</b></code>.`,
      whyWrong: `Two steps, each on its own base.<br><br>
                 <b>Down from the tag.</b> The 25% discount is on the marked price:
                 <code>800 × 0.75 = ₹600</code>. That is the selling price.<br><br>
                 <b>Back to the cost.</b> A 20% profit means ₹600 is <b>120%</b> of what he paid:
                 <code>600 ÷ 1.2 = <b>₹500</b></code>.<br><br>
                 Check forwards: 500 → marked 800 is a 60% markup, less 25% is 600, and
                 600 − 500 = ₹100 on a cost of ₹500 — 20%. ✓<br><br>
                 Taking 20% off ₹600 gives ₹480, and that is the classic wrong answer: it measures
                 the profit against the selling price instead of the cost.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Forwards and backwards along the chain',
      say: `The same three prices, walked in both directions.`,
      steps: [
        `<b>Forwards.</b> Cost ₹500, marked up 60% → <code>500 × 1.60 = ₹800</code>. Discount 25% →
         <code>800 × 0.75 = ₹600</code>. Profit <code>600 − 500 = ₹100</code>, which on a cost of
         ₹500 is <b>20%</b>.`,
        `<b>Backwards.</b> Given SP ₹600 and 20% profit, divide rather than subtract:
         <code>600 ÷ 1.2 = ₹500</code>. The rule is that the percentage always divides out of the
         base it was taken on.`,
        `<b>Skip the middle entirely.</b> Markup 40% then discount 15% is
         <code>1.40 × 0.85 = 1.19</code> — a <b>19% profit</b> on any cost at all. On ₹1,200 that
         is a selling price of ₹1,428.`,
        `<b>Why discounting can still pay.</b> The markup is taken on the small number (cost) and
         the discount on the big one (marked). A 60% markup adds ₹300 to a ₹500 cost; a 25%
         discount only gives ₹200 of it back.`,
        `<b>The reflex to build.</b> Read the percentage, then ask "of what?" before you touch it.
         That single question is worth more marks in this topic than any formula.`,
      ],
      takeaway: `Profit and loss divide by CP. Discount divides by MP. When you are given a
                 percentage and a result, divide by (1 ± the rate) — do not subtract the rate from
                 the answer.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'trade-reverse', conceptLabel: 'Dividing back to the cost price',
      input: 'number', answer: 800, unit: 'rupees',
      context: `A cycle dealer in Bhilwara sells a cycle for <b>₹960</b> and makes a
                <b>20% profit</b>.`,
      q: 'What did the cycle cost the dealer?',
      why: `₹960 is not the cost plus 20% of 960 — it is <b>120% of the cost</b>.<br><br>
            <code>CP = 960 ÷ 1.2 = <b>₹800</b></code>.<br><br>
            Check: 800 + 20% of 800 = 800 + 160 = ₹960. ✓<br><br>
            Subtracting 20% of ₹960 would have given ₹768, which is wrong — that takes the
            percentage off the selling price instead of the cost.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'trade-two-articles', conceptLabel: 'Equal selling prices, unequal costs',
      context: `A trader sells two shawls at <b>₹990 each</b>. On one he makes a <b>10% profit</b>;
                on the other he takes a <b>10% loss</b>.`,
      q: 'Overall, what happened?',
      options: [
        'He broke exactly even',
        'He lost ₹20',
        'He gained ₹20',
        'He lost ₹99',
      ],
      answer: 1,
      whyRight: `Right. The costs are ₹900 and ₹1,100 — together ₹2,000 — against ₹1,980 taken in.
                 A loss of <b>₹20</b>, or 1%.`,
      whyWrong: `The two 10%s look like they cancel. They cannot, because they are percentages of
                 <b>different costs</b>.<br><br>
                 Profitable shawl: <code>990 ÷ 1.1 = ₹900</code> cost.<br>
                 Loss-making shawl: <code>990 ÷ 0.9 = ₹1,100</code> cost.<br><br>
                 Total cost <b>₹2,000</b>, total received <b>₹1,980</b> — a loss of <b>₹20</b>.<br><br>
                 The 10% he gained was 10% of the <em>cheaper</em> item and the 10% he lost was 10%
                 of the <em>dearer</em> one, so the loss is always the bigger number. Whenever two
                 articles sell for the same price at equal profit and loss percentages, the result
                 is a loss — of <code>x²/100</code> percent, here 1%.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'trade-single-factor', conceptLabel: 'Markup and discount as one factor',
      say: `Last one. Do it in a single multiplication.`,
      context: `A shopkeeper marks his goods <b>40% above cost</b> and then advertises a
                <b>15% discount</b>.`,
      q: 'What is his profit percentage?',
      options: ['25%', '19%', '21%', '15%'],
      answer: 1,
      whyRight: `Correct — <code>1.40 × 0.85 = 1.19</code>, so a <b>19% profit</b>, whatever the cost.
                 On a ₹1,200 item that is a selling price of ₹1,428.`,
      whyWrong: `<b>25%</b> is 40 − 15, and that subtraction is the trap: the 40% is taken on the
                 cost and the 15% on the marked price, so they never sit on the same number.<br><br>
                 Multiply the factors instead: <code>1.40 × 0.85 = <b>1.19</b></code> → a
                 <b>19%</b> profit.<br><br>
                 Or check it on a convenient cost of ₹100: marked ₹140, less 15% (₹21) → ₹119.
                 That is ₹19 profit on ₹100. Choosing 100 as the cost is legitimate here precisely
                 because the answer does not depend on the cost at all.`,
    },
  ],
};
