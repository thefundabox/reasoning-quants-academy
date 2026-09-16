/* ============================================================
   Reasoning · Unit 4 · Lesson 1 — Ranking Lines
   ============================================================ */

import { rankLine } from '../widgets/rank-line.js';

const LINE = { n: 12, a: 4, b: 9 };

export default {
  id: 'r.ord.ranking',
  title: 'Ranking Lines',
  xp: 30,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.ord.linear',
  nextLabel: 'Next: Linear Seating →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The most expensive minus one in the paper',
      say: `In a row of <b>40</b> students, Ravi is <b>12th from the left</b>.
            What is his rank from the right?<br><br>
            Almost everyone answers 28. The answer is <b>29</b> — and the missing student is
            <b>Ravi himself</b>. Every formula in this lesson is that same observation wearing a
            different hat. Once you see the double-count, you never need to memorise any of them.`,
      cta: 'Show me the double-count',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Three formulas, one idea',
      say: `A person counted from <b>both</b> ends is counted <b>twice</b>. Subtract them once and
            every ranking question resolves.`,
      body: `
        <ul>
          <li><b>Total = left rank + right rank − 1.</b> Asha is 7th from the left and 11th from the right:
              7 + 11 counts Asha in both, so the row holds 17.</li>
          <li><b>Rank from the other end = Total − rank + 1.</b> This is the same equation rearranged, nothing new.</li>
          <li><b>People strictly between two positions = |difference| − 1.</b> Between the 9th and 14th
              there are 14 − 9 − 1 = 4 people, because both endpoints are excluded.</li>
        </ul>
        <p>Prove it once with a tiny row and you will never doubt it again. Five people, and you are third
           from the left: 3 + 3 = 6, one more than the row. That extra one is you.</p>
        <p>The trap that catches people twice as often as the formula: <b>"from the top" in a rank list
           usually means from the best</b>, and a class of 40 with Ravi 12th from the top has 28 students
           <em>behind</em> him — not 28 below in rank order. Read whether the question wants a
           <b>position</b> or a <b>count</b>.</p>`,
      cta: 'Let me see it move',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Move the markers, watch the identity hold',
      say: `Place <b>A</b> and <b>B</b> anywhere and change the size of the row. The line under each
            person always adds to the same total. It cannot not.`,
      widget: rankLine(LINE),
      __cfg: LINE,
      tasks: [
        { label: 'Move <b>both</b> markers', done: s => s.movedBoth },
        { label: 'Change the size of the row', done: s => s.changedN },
        { label: 'Put <b>A</b> at one end and read its two ranks', done: s => s.aAtEnd },
        { label: 'Put A and B on the <b>same</b> position — see the gap go to zero', done: s => s.sameSeat },
      ],
      onComplete: 'The minus one never moved. It is the person themselves, every single time.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'rank-flip', conceptLabel: 'Rank from the other end',
      say: `Commit first. Do not reach for the formula — reach for the double-count.`,
      context: `In a row of <b>30</b> children at a Jaipur school assembly, Meena is <b>8th from the left</b>.`,
      q: 'What is her rank from the right end?',
      options: ['22nd', '23rd', '21st', '24th'],
      answer: 1,
      whyRight: `Correct. There are 7 children to her left, so 30 − 8 = 22 stand to her right.
                 Her <em>rank</em> from the right counts her as well: 22 + 1 = <b>23rd</b>.
                 Or straight from the formula: 30 − 8 + 1 = 23.`,
      whyWrong: `30 − 8 = 22 is the number of children <b>standing to her right</b>, not her rank.
                 Her rank from that end includes <b>her</b>: 22 + 1 = <b>23rd</b>.<br><br>
                 Formula form: rank from the other end = Total − rank + 1 = 30 − 8 + 1 = <b>23</b>.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Prove it on five people',
      say: `Never trust a formula you have not checked on a row you can see.`,
      steps: [
        `<b>Draw five dots.</b> Label them 1 to 5 from the left. Put yourself on the third dot.`,
        `<b>Count from the left.</b> You are 3rd. <b>Count from the right.</b> You are also 3rd. Add them: 3 + 3 = 6.`,
        `<b>But the row holds five.</b> The extra one is you, counted once from each side. So Total = left + right − 1. That single minus one is the entire chapter.`,
        `<b>Now the gap.</b> Between dot 2 and dot 5 there are dots 3 and 4 — two people. 5 − 2 = 3, minus 1 for the endpoint you must not count = 2. ✓`,
      ],
      takeaway: `Total = left + right − 1 · Other end = Total − rank + 1 · Between = |difference| − 1. All three are the same sentence: do not count the person twice.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'rank-total', conceptLabel: 'Total from two ranks',
      context: `In a queue outside a Kota exam centre, Asha is <b>7th from the front</b> and
                <b>11th from the back</b>.`,
      q: 'How many people are in the queue?',
      options: ['18', '17', '16', '19'],
      answer: 1,
      why: `7 + 11 = 18, but Asha has been counted from both ends, so she appears twice.
            Subtract her once: <b>17</b>.<br><br>
            Sanity check: 6 people ahead of her, 10 behind her, plus Asha = 6 + 10 + 1 = 17. ✓`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'rank-between', conceptLabel: 'Counting people between two positions',
      context: `In a row, <b>P</b> is 9th from the left and <b>Q</b> is 14th from the left.`,
      q: 'How many people sit strictly between P and Q?',
      options: ['5', '4', '6', '3'],
      answer: 1,
      why: `The positions differ by 14 − 9 = 5. But that 5 counts the step onto Q itself.
            People strictly between = 5 − 1 = <b>4</b> (positions 10, 11, 12 and 13).<br><br>
            Note both ranks were given from the <em>same</em> end. If a question gives one from the left
            and one from the right, convert to the same end first — otherwise the subtraction is meaningless.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'rank-flip', conceptLabel: 'Rank from the other end',
      say: `The question from the start.`,
      context: `In a row of <b>40</b> students, Ravi is <b>12th from the left</b>.`,
      q: 'What is his rank from the right end?',
      options: ['28th', '29th', '27th', '30th'],
      answer: 1,
      whyRight: `Exactly. 40 − 12 = 28 students stand to his right; his rank from that end includes
                 him, so it is <b>29th</b>. And check the identity: 12 + 29 − 1 = 40. ✓`,
      whyWrong: `40 − 12 = 28 counts the students <b>to his right</b>, not Ravi's rank.<br><br>
                 Rank from the other end = Total − rank + 1 = 40 − 12 + 1 = <b>29th</b>.<br><br>
                 Verify with the identity: 12 + 29 − 1 = 40, the size of the row. ✓`,
    },
  ],
};
