/* ============================================================
   Quants · Unit 5 · Lesson 2 — Weighted Average
   ============================================================ */

import { balanceBeam } from '../widgets/stat-lab.js';

const CLASSES = {
  left: { label: 'Section A', size: 30, value: 60 },
  right: { label: 'Section B', size: 20, value: 80 },
  maxSize: 60, unit: ' marks', mode: 'weighted',
};

export default {
  id: 'q.avg.weighted',
  title: 'Weighted Average',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.avg.alligation',
  nextLabel: 'Next: Alligation →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Sixty and eighty do not make seventy',
      say: `Section A has <b>30 students</b> averaging <b>60</b>.<br>
            Section B has <b>20 students</b> averaging <b>80</b>.<br><br>
            Together they average <b>68</b>, not 70.<br><br>
            Averaging 60 and 80 gives the two sections an equal vote. They do not get an equal
            vote — A has half as many students again.`,
      cta: 'Show me the beam',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Every group votes with its size',
      say: `You already know that a mean is a <b>balance point</b>. A weighted average is the same
            balance with the loads placed at different distances — and the beam is the picture that
            makes every question in this lesson obvious.`,
      body: `
        <p><b>Combined average = (sum of all the values) ÷ (total count).</b> Written out:</p>
        <p><code>(30 × 60 + 20 × 80) ÷ 50 = (1800 + 1600) ÷ 50 = 3400 ÷ 50 = <b>68</b></code></p>
        <p><b>Go back to totals.</b> That is the one move. An average is a total in disguise, so
           multiply each average by its count, add the totals, and divide by the total count. Never
           average the averages unless the groups are the same size — and if they are, both methods
           give the same answer anyway.</p>
        <p><b>Two checks that catch nearly every error.</b></p>
        <ul>
          <li>The answer must lie <b>between</b> the two averages. 68 sits between 60 and 80. If
              your answer is outside that range, you have made an arithmetic slip.</li>
          <li>It must sit <b>closer to the bigger group</b>. A is larger, so the answer must be
              nearer 60 than 80 — and 68 is, at a distance of 8 versus 12.</li>
        </ul>
        <p><b>Working backwards.</b> Most exam questions give you the combined figure and hide one
           part. A class of 40 averages 62, so the total is 2,480. The top 10 average 80, a total of
           800. The other 30 must therefore total 1,680, averaging <b>56</b>. Every step is a total;
           averages appear only at the start and the end.</p>`,
      cta: 'Let me load the beam',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Slide the sizes, watch the fulcrum',
      say: `The two blocks sit at 60 and 80. Their <b>heights</b> are the group sizes.<br><br>
            Drag the sizes and watch where the beam balances. Look at the distances — they are the
            reverse of the sizes, every time.`,
      widget: balanceBeam(CLASSES),
      __cfg: CLASSES,
      tasks: [
        { label: 'Make the two sections <b>equal in size</b>', done: s => s.equalSizes },
        { label: 'Pull the average <b>below 68</b>, toward Section A', done: s => s.combined < 68 },
        { label: 'Push it <b>above 72</b>, toward Section B', done: s => s.combined > 72 },
      ],
      onComplete: `Equal sizes put the fulcrum exactly halfway — the only case where averaging the
                   averages is right. Every other setting leans toward the bigger group.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'wavg-totals', conceptLabel: 'Go back to totals, then divide once',
      input: 'number', answer: 68, unit: 'marks',
      say: `The two sections from the start.`,
      context: `<b>30 students</b> averaging <b>60</b>, and <b>20 students</b> averaging <b>80</b>.`,
      q: 'What is the combined average?',
      whyRight: `Correct. <code>(30 × 60 + 20 × 80) ÷ 50 = 3400 ÷ 50 = <b>68</b></code> — between
                 the two, and leaning toward the larger section.`,
      whyWrong: `Convert each average into a <b>total</b> first.<br><br>
                 Section A: <code>30 × 60 = 1,800</code> marks.<br>
                 Section B: <code>20 × 80 = 1,600</code> marks.<br>
                 Together: <code>3,400</code> marks across <b>50</b> students.<br><br>
                 <code>3,400 ÷ 50 = <b>68</b></code><br><br>
                 <b>70</b> is the average of 60 and 80, which would only be right if the sections
                 were the same size. Section A has 30 of the 50 students, so it gets the larger
                 vote and drags the answer down toward 60.<br><br>
                 The two checks both pass: 68 lies between 60 and 80, and it is nearer 60.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Forwards, and then backwards',
      say: `Everything in this topic is one line of totals.`,
      steps: [
        `<b>Forwards.</b> <code>(30 × 60 + 20 × 80) ÷ 50 = <b>68</b></code>. The distances tell the
         same story: 68 is 8 above A's average and 12 below B's, a ratio of 8 : 12 = 2 : 3 — the
         inverse of the sizes 30 : 20 = 3 : 2.`,
        `<b>Another forward case.</b> 40 boys averaging 52 kg and 60 girls averaging 47 kg:
         <code>(2,080 + 2,820) ÷ 100 = <b>49 kg</b></code>. Nearer 47, because there are more girls.`,
        `<b>Backwards — the hidden group.</b> A class of 40 averages 62, so the total is <b>2,480</b>.
         The top 10 average 80, so they hold <b>800</b>. The remaining 30 therefore hold
         <code>2,480 − 800 = 1,680</code>, averaging <code>1,680 ÷ 30 = <b>56</b></code>.`,
        `<b>Backwards — the replaced value.</b> Ten numbers average 25, so the total is <b>250</b>.
         Replacing one of them with 45 lifts the average to 27, a total of <b>270</b>. The total
         rose by <b>20</b>, so the number that left was <code>45 − 20 = <b>25</b></code>.`,
        `<b>The pattern.</b> Whenever a question mentions an average changing, write down the old
         total and the new total. The difference is what actually moved.`,
      ],
      takeaway: `Multiply each average by its count, add, divide once. The answer must lie between
                 the parts and lean toward the bigger one — two checks that cost nothing and catch
                 almost everything.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'wavg-totals', conceptLabel: 'Go back to totals, then divide once',
      input: 'number', answer: 49, unit: 'kg',
      context: `A class has <b>40 boys</b> with an average weight of <b>52 kg</b> and
                <b>60 girls</b> with an average of <b>47 kg</b>.`,
      q: 'What is the average weight of the whole class?',
      why: `Totals first.<br><br>
            Boys: <code>40 × 52 = 2,080 kg</code><br>
            Girls: <code>60 × 47 = 2,820 kg</code><br>
            Class: <code>4,900 kg ÷ 100 = <b>49 kg</b></code><br><br>
            Check both ways: 49 lies between 47 and 52 ✓, and it sits nearer 47 because there are
            more girls ✓.<br><br>
            Averaging 52 and 47 would give 49.5 — close enough to be tempting, and wrong.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'wavg-backwards', conceptLabel: 'Working backwards from a changed average',
      input: 'number', answer: 25, unit: 'the number replaced',
      context: `The average of <b>10</b> numbers is <b>25</b>. One of them is replaced by <b>45</b>,
                and the average becomes <b>27</b>.`,
      q: 'What was the number that got replaced?',
      why: `Track the <b>total</b>, not the average.<br><br>
            Old total: <code>10 × 25 = 250</code><br>
            New total: <code>10 × 27 = 270</code><br>
            The total rose by <b>20</b>.<br><br>
            That rise is exactly <code>45 − (the old number)</code>, so the old number was
            <code>45 − 20 = <b>25</b></code>.<br><br>
            Sense check: the replaced value happened to equal the old average, and swapping an
            average-sized value for a 45 lifts a ten-number mean by 2. ✓`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'wavg-backwards', conceptLabel: 'Working backwards from a changed average',
      say: `One group is hidden. Find it.`,
      context: `A class of <b>40</b> students averages <b>62</b> marks. The top <b>10</b> students
                average <b>80</b>.`,
      q: 'What do the remaining 30 average?',
      options: ['44', '56', '58', '50'],
      answer: 1,
      whyRight: `Correct. Class total 2,480; top ten hold 800; the other thirty hold 1,680,
                 averaging <code>1,680 ÷ 30 = <b>56</b></code>.`,
      whyWrong: `Three totals, then one division.<br><br>
                 <b>Whole class:</b> <code>40 × 62 = 2,480</code><br>
                 <b>Top ten:</b> <code>10 × 80 = 800</code><br>
                 <b>The other thirty:</b> <code>2,480 − 800 = 1,680</code><br><br>
                 <code>1,680 ÷ 30 = <b>56</b></code><br><br>
                 <b>44</b> comes from 62 − (80 − 62) = 44, treating the two groups as equal in size.
                 They are not: the top ten are a quarter of the class, so removing them can only pull
                 the average down a little — from 62 to 56, not to 44.<br><br>
                 The between-check confirms it: the class average of 62 must lie between 56 and 80,
                 and it does — nearer 56, because thirty students outvote ten.`,
    },
  ],
};
