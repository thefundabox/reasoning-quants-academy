/* ============================================================
   Quants · Unit 5 · Lesson 3 — Alligation
   ============================================================ */

import { balanceBeam } from '../widgets/stat-lab.js';

const RICE = {
  left: { label: 'Cheaper rice', size: 30, value: 40 },
  right: { label: 'Dearer rice', size: 10, value: 60 },
  maxSize: 60, unit: ' ₹/kg', mode: 'alligation',
};

export default {
  id: 'q.avg.alligation',
  title: 'Alligation',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.avg.spread',
  nextLabel: 'Next: Range & Spread →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The same beam, solved backwards',
      say: `Rice at <b>₹40/kg</b> and rice at <b>₹60/kg</b>, mixed to sell at <b>₹45/kg</b>.
            In what ratio?<br><br>
            Last lesson you were given the loads and found the balance point. Now you are given the
            <b>balance point</b> and must find the loads.<br><br>
            It is one beam and one question, asked from either end.`,
      cta: 'Show me the cross',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'The ratio is the inverse of the distances',
      say: `Alligation has a reputation as a trick to memorise. It is not — it is the balance you
            already understand, and the "cross" is just how the answer is laid out.`,
      body: `
        <p><b>Write down the two distances from the mixture price.</b></p>
        <ul>
          <li>From the <b>cheaper</b> side: <code>45 − 40 = <b>5</b></code></li>
          <li>From the <b>dearer</b> side: <code>60 − 45 = <b>15</b></code></li>
        </ul>
        <p><b>Now swap them.</b> The quantity of <b>cheap</b> is the <em>dear</em> distance, and the
           quantity of <b>dear</b> is the <em>cheap</em> distance:</p>
        <p><code>cheap : dear = 15 : 5 = <b>3 : 1</b></code></p>
        <p><b>Why the swap.</b> The beam balances when load × distance matches on both sides. The
           mixture price sits close to ₹40 and far from ₹60, so there must be <em>more</em> of the
           cheap rice to hold it there. Whichever price the answer sits nearer, that is the one you
           need more of — and that single sentence will save you whenever you cannot remember which
           way the cross goes.</p>
        <p><b>Check by putting it back.</b> 3 parts at 40 and 1 part at 60:
           <code>(3 × 40 + 1 × 60) ÷ 4 = 180 ÷ 4 = <b>45</b></code>. ✓ Two seconds, and it removes
           all doubt about the direction.</p>
        <p><b>It works on anything that averages</b> — prices, percentages, speeds, ages,
           concentrations. Mixing 20% and 50% acid to get 30%: distances 10 and 20, so the ratio is
           <b>2 : 1</b> in favour of the weaker. And when one ingredient is <b>free</b>, like water
           added to milk, simply use zero as its price.</p>`,
      cta: 'Let me find the ratio',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Move the loads until the price is right',
      say: `The two rices sit at <b>₹40</b> and <b>₹60</b>. Change the quantities and watch the
            mixture price move.<br><br>
            Get the beam to balance at <b>₹45</b>, then look at the distances — they will be the
            reverse of the quantities you used.`,
      widget: balanceBeam(RICE),
      __cfg: RICE,
      tasks: [
        { label: 'Balance the mixture at exactly <b>₹45</b>', done: s => Math.abs(s.combined - 45) < 1e-9 },
        { label: 'Balance it at exactly <b>₹50</b>', done: s => Math.abs(s.combined - 50) < 1e-9 },
        { label: 'Confirm distance × quantity matches on both sides', done: s => s.inverseHolds },
      ],
      onComplete: `At ₹45 you needed three parts cheap to one part dear — and the distances were
                   5 and 15, exactly reversed. At ₹50, halfway, the quantities are equal.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'allig-inverse', conceptLabel: 'Quantities are inverse to the distances',
      context: `Rice at <b>₹40/kg</b> and rice at <b>₹60/kg</b> are mixed to sell at <b>₹45/kg</b>.`,
      q: 'In what ratio are they mixed, cheap to dear?',
      options: ['1 : 3', '3 : 1', '1 : 1', '2 : 1'],
      answer: 1,
      whyRight: `Correct. The distances are 5 and 15, so the quantities are 15 : 5 = <b>3 : 1</b> —
                 three parts of the cheap rice.`,
      whyWrong: `The mixture price of ₹45 sits <b>close to ₹40</b> and <b>far from ₹60</b>. To hold
                 the average down there, you need <em>more</em> of the cheap rice.<br><br>
                 Distances: <code>45 − 40 = 5</code> and <code>60 − 45 = 15</code>.<br>
                 Swap them: <code>cheap : dear = 15 : 5 = <b>3 : 1</b></code>.<br><br>
                 <b>1 : 3</b> is the same numbers written the wrong way round — it would put more of
                 the expensive rice in and give a mixture at ₹55, not ₹45.<br><br>
                 Check the winner: <code>(3 × 40 + 1 × 60) ÷ 4 = 45</code>. ✓ If you are ever unsure
                 which way the cross falls, this check settles it faster than remembering the rule.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Three mixtures, one move',
      say: `Distances, swap, check.`,
      steps: [
        `<b>Rice at 40 and 60, mixed to 45.</b> Distances <b>5</b> and <b>15</b> → ratio
         <b>15 : 5 = 3 : 1</b>. Check: (3 × 40 + 60) ÷ 4 = 45. ✓`,
        `<b>Acid at 20% and 50%, mixed to 30%.</b> Distances <b>10</b> and <b>20</b> → ratio
         <b>20 : 10 = 2 : 1</b>, two parts of the weaker. Check: (2 × 20 + 50) ÷ 3 = 30. ✓
         Percentages behave exactly like prices.`,
        `<b>Water into milk.</b> Milk costs ₹60 a litre; water is free, so its price is <b>0</b>.
         To sell the mixture at ₹48: distances are <code>48 − 0 = 48</code> and
         <code>60 − 48 = 12</code>, so <b>water : milk = 12 : 48 = 1 : 4</b>. Check:
         (1 × 0 + 4 × 60) ÷ 5 = 48. ✓`,
        `<b>Reading the profit off it.</b> That last mixture costs the seller ₹48 a litre of milk
         spread over 5 litres of product. One litre of free water in every five is where the extra
         margin comes from — which is why these questions are always phrased about milk.`,
        `<b>If you forget the direction</b>, do not guess. Ask which price the answer is nearer, and
         put more of that one in. Then check by mixing it back.`,
      ],
      takeaway: `Two distances from the mixture value, then swap them. More of whichever ingredient
                 the answer sits nearer. Always mix it back to check — it costs one line and removes
                 the only real risk in the topic.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'allig-percent', conceptLabel: 'Alligation on percentages',
      context: `A <b>20%</b> acid solution and a <b>50%</b> acid solution are mixed to give a
                <b>30%</b> solution.`,
      q: 'In what ratio are they mixed, weaker to stronger?',
      options: ['1 : 2', '2 : 1', '3 : 1', '1 : 3'],
      answer: 1,
      whyRight: `Yes. Distances are <code>30 − 20 = 10</code> and <code>50 − 30 = 20</code>, so the
                 quantities are <b>20 : 10 = 2 : 1</b> — twice as much of the weaker solution.`,
      whyWrong: `30% sits nearer 20% than 50%, so most of the mixture must be the <b>weaker</b>
                 solution.<br><br>
                 Distances: <code>30 − 20 = 10</code> and <code>50 − 30 = 20</code>.<br>
                 Swap: <code>weak : strong = 20 : 10 = <b>2 : 1</b></code>.<br><br>
                 Check: <code>(2 × 20 + 1 × 50) ÷ 3 = 90 ÷ 3 = 30</code>. ✓<br><br>
                 <b>1 : 2</b> reverses it and would give 40%. Percentages average exactly like
                 prices — there is nothing special to learn here beyond noticing that the units
                 have changed.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'allig-free', conceptLabel: 'A free ingredient has a price of zero',
      context: `Milk costs <b>₹60 a litre</b>. Water is free. A trader wants a mixture that costs
                him <b>₹48 a litre</b>.`,
      q: 'In what ratio must water be mixed with milk?',
      options: ['1 : 4', '1 : 5', '2 : 5', '1 : 3'],
      answer: 0,
      whyRight: `Correct. Water's price is <b>0</b>, so the distances are 48 and 12, giving
                 <b>water : milk = 12 : 48 = 1 : 4</b>.`,
      whyWrong: `Treat water as an ingredient costing <b>₹0</b> and the method is unchanged.<br><br>
                 Distances from ₹48: <code>48 − 0 = 48</code> (the water side) and
                 <code>60 − 48 = 12</code> (the milk side).<br><br>
                 Swap them: <code>water : milk = 12 : 48 = <b>1 : 4</b></code>.<br><br>
                 Check: five litres of mixture contain 1 litre of water and 4 of milk, costing
                 <code>4 × 60 = ₹240</code>, which is <code>240 ÷ 5 = ₹48</code> a litre. ✓<br><br>
                 <b>1 : 5</b> is the common slip — it comes from reading "1 part water in 5 parts
                 mixture" as a ratio of water to milk. The ratio asked for compares the two
                 ingredients, not one ingredient to the whole.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'allig-inverse', conceptLabel: 'Quantities are inverse to the distances',
      say: `No prices this time. The method does not care.`,
      context: `A shopkeeper has <b>40 kg</b> of a mixture and wants the average cost to fall from
                <b>₹45/kg</b> to <b>₹42/kg</b> by adding rice worth <b>₹30/kg</b>.`,
      q: 'How much of the ₹30 rice must be added?',
      options: ['8 kg', '10 kg', '12 kg', '15 kg'],
      answer: 1,
      whyRight: `Correct. Treating the existing mixture (₹45) and the new rice (₹30) as the two
                 ingredients at a target of ₹42: distances are 12 and 3, so
                 <b>old : new = 12 : 3 = 4 : 1</b>. With 40 kg of old, that is <b>10 kg</b> of new.`,
      whyWrong: `The existing mixture is simply an ingredient priced at <b>₹45</b>.<br><br>
                 Distances from the target ₹42:<br>
                 <code>45 − 42 = 3</code> (the old side) and <code>42 − 30 = 12</code> (the new
                 side).<br><br>
                 Swap: <code>old : new = 12 : 3 = <b>4 : 1</b></code>.<br><br>
                 The old quantity is 40 kg, which is the "4", so one part is 10 kg — and the new
                 rice is <b>10 kg</b>.<br><br>
                 Check: <code>(40 × 45 + 10 × 30) ÷ 50 = (1,800 + 300) ÷ 50 = 2,100 ÷ 50 = ₹42</code>. ✓<br><br>
                 Note the target sits much nearer ₹45 than ₹30, so most of the mixture must remain
                 the old stock — which rules out any answer close to 40 kg immediately.`,
    },
  ],
};
