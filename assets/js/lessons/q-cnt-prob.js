/* ============================================================
   Quants · Unit 6 · Lesson 4 — Probability Basics
   ============================================================ */

import { sampleSpace } from '../widgets/count-lab.js';

const DICE = {
  space: 'dice',
  events: [
    { label: 'Sum is 7', test: o => o[0] + o[1] === 7, expect: 6,
      note: 'Six ways out of thirty-six — the most likely sum of all, which is why 7 sits at the centre of the grid.' },
    { label: 'Sum is 8', test: o => o[0] + o[1] === 8, expect: 5 },
    { label: 'Sum is 10 or more', test: o => o[0] + o[1] >= 10, expect: 6 },
    { label: 'Doubles', test: o => o[0] === o[1], expect: 6,
      note: 'The diagonal. Six outcomes, the same count as a sum of 7 — but a very different-looking set.' },
  ],
};

export default {
  id: 'q.cnt.prob',
  title: 'Probability Basics',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.cnt.dice',
  nextLabel: 'Next: Dice, Cards & Coins →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Probability is counting, twice',
      say: `Two dice. What is the chance the total is <b>7</b>?<br><br>
            There is nothing to guess. Count how many outcomes give a 7 — that is <b>6</b>. Count
            how many outcomes there are altogether — that is <b>36</b>.<br><br>
            <b>6/36 = 1/6.</b> Everything you learnt in the last three lessons was preparation for
            this one division.`,
      cta: 'Show me the counting',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Favourable over total',
      say: `Probability is a fraction of counts. If you can count both numbers, you are done — and
            counting is what this unit has been about.`,
      body: `
        <p><code>P(event) = favourable outcomes ÷ total outcomes</code>, provided every outcome is
           <b>equally likely</b>. That proviso matters: the <em>sums</em> of two dice are not equally
           likely, so you must count over the 36 <em>pairs</em>, never over the 11 possible totals.</p>
        <p><b>Every probability sits between 0 and 1.</b> If yours does not, you have divided the
           wrong way round.</p>
        <p><b>The complement is often the short route.</b> <code>P(not A) = 1 − P(A)</code>. "At
           least one head in three tosses" has seven favourable cases to list — or one unfavourable
           one, all tails: <code>1 − 1/8 = <b>7/8</b></code>. Whenever a question says <em>at
           least</em>, look at the complement first.</p>
        <p><b>Both happening: multiply.</b> Two reds drawn from a bag of 5 red and 3 blue,
           <em>without replacement</em>:</p>
        <p><code>5/8 × 4/7 = 20/56 = <b>5/14</b></code></p>
        <p>The second fraction changed because the first ball is gone — four reds left out of seven
           balls. With replacement it would be <code>5/8 × 5/8</code> instead. Read the question for
           that phrase; it is the entire difference.</p>
        <p><b>Either one: add, then subtract the overlap.</b> <code>P(A or B) = P(A) + P(B) −
           P(both)</code> — the same inclusion-exclusion that fixed the crossing roads in
           Mensuration.</p>`,
      cta: 'Let me count the grid',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Thirty-six outcomes, and the ones that count',
      say: `The whole space is on screen — every one of the 36 ordered pairs. Pick an event and the
            favourable outcomes light up.<br><br>
            Nothing here is a formula. It is a count, and you can check it by eye.`,
      widget: sampleSpace(DICE),
      __cfg: DICE,
      tasks: [
        { label: 'Look at all four events', done: s => s.seenAll },
        { label: 'Find an event with exactly <b>6</b> favourable outcomes', done: s => s.favourable === 6 },
        { label: 'Find one with <b>fewer</b> than 6', done: s => s.favourable < 6 },
      ],
      onComplete: `A sum of 7 and doubles both have six outcomes and look nothing alike on the grid.
                   The count is what matters, not the shape it makes.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'prob-count-both', conceptLabel: 'Count the favourable and the total',
      context: `Two fair dice are thrown.`,
      q: 'What is the probability that the total is 7?',
      options: ['1/6', '1/11', '1/12', '7/36'],
      answer: 0,
      whyRight: `Correct. Six pairs give a total of 7 — (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) —
                 out of 36, so <code>6/36 = <b>1/6</b></code>.`,
      whyWrong: `Count both numbers over the <b>pairs</b>, not over the totals.<br><br>
                 <b>Total outcomes:</b> <code>6 × 6 = 36</code>.<br>
                 <b>Favourable:</b> (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — <b>6</b> of them.<br><br>
                 <code>6/36 = <b>1/6</b></code><br><br>
                 <b>1/11</b> is the trap: there are eleven possible totals (2 to 12), so it looks
                 like each should have probability 1/11. But they are <em>not equally likely</em> —
                 a total of 2 happens one way and a total of 7 happens six ways. Probability only
                 divides like that over outcomes that are equally likely, and the sums are not.<br><br>
                 That is why the grid of 36 pairs is the right space to count in.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Four questions, four counts',
      say: `Each one is favourable over total, once you pick the right space.`,
      steps: [
        `<b>Sum of 7.</b> 6 pairs out of 36 → <code><b>1/6</b></code>. The most likely total, because
         7 has the most ways of being made.`,
        `<b>Sum of 10 or more.</b> Totals of 10 (three ways), 11 (two) and 12 (one) → 6 out of 36 →
         <code><b>1/6</b></code>. Same probability as a 7, arrived at from three totals rather than
         one.`,
        `<b>At least one head in three coins.</b> The space is <code>2³ = 8</code>. Listing the
         seven favourable cases works, but the complement is one line: only <b>TTT</b> fails, so
         <code>1 − 1/8 = <b>7/8</b></code>.`,
        `<b>Two reds, without replacement</b>, from 5 red and 3 blue.
         <code>5/8 × 4/7 = 20/56 = <b>5/14</b></code>. The denominator drops from 8 to 7 because a
         ball has left the bag; the numerator drops from 5 to 4 because it was red.`,
        `<b>With replacement</b>, the same question is <code>5/8 × 5/8 = 25/64</code> — a larger
         number, because the bag never gets poorer in reds. Two words, two different answers.`,
      ],
      takeaway: `Count the favourable outcomes and the total outcomes over a space of equally likely
                 cases. For "at least", use the complement. For "and", multiply — adjusting the
                 second fraction if the first draw was not replaced.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'prob-complement', conceptLabel: 'For "at least", use the complement',
      context: `Three fair coins are tossed.`,
      q: 'What is the probability of getting at least one head?',
      options: ['3/8', '1/2', '7/8', '1/8'],
      answer: 2,
      whyRight: `Correct. Only <b>TTT</b> has no head at all, so <code>1 − 1/8 = <b>7/8</b></code>.`,
      whyWrong: `"At least one" is a signal to look at what you are <em>excluding</em>.<br><br>
                 The space has <code>2³ = 8</code> outcomes. Exactly one of them — <b>TTT</b> — has
                 no head.<br><br>
                 <code>P(at least one head) = 1 − 1/8 = <b>7/8</b></code><br><br>
                 The long way agrees: HHH, HHT, HTH, THH, HTT, THT, TTH — seven outcomes out of
                 eight.<br><br>
                 <b>3/8</b> is the probability of <em>exactly</em> one head. <b>1/2</b> is the
                 chance for a single coin. Whenever a question says "at least", count the one case
                 that fails and subtract from 1.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'prob-count-both', conceptLabel: 'Count the favourable and the total',
      input: 'number', answer: 6, unit: 'favourable outcomes',
      context: `Two fair dice are thrown. You want the total to be <b>10 or more</b>.`,
      q: 'How many of the 36 outcomes are favourable?',
      why: `Break it down by total, and count the pairs for each.<br><br>
            <b>10:</b> (4,6), (5,5), (6,4) — three ways<br>
            <b>11:</b> (5,6), (6,5) — two ways<br>
            <b>12:</b> (6,6) — one way<br><br>
            <code>3 + 2 + 1 = <b>6</b></code> favourable, so the probability is
            <code>6/36 = 1/6</code>.<br><br>
            Note (4,6) and (6,4) are <b>different outcomes</b> — the dice are distinguishable, even
            if they look alike. Counting them as one is the standard error here, and it would have
            given 4 instead of 6.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'prob-without-replacement', conceptLabel: 'Without replacement, the second fraction changes',
      say: `Read the last three words of the question carefully.`,
      context: `A bag holds <b>5 red</b> and <b>3 blue</b> balls. Two balls are drawn one after the
                other, <b>without replacement</b>.`,
      q: 'What is the probability that both are red?',
      options: ['25/64', '5/14', '5/28', '1/2'],
      answer: 1,
      whyRight: `Correct. <code>5/8 × 4/7 = 20/56 = <b>5/14</b></code> — the second fraction changes
                 because one red ball has left the bag.`,
      whyWrong: `Both draws must be red, so multiply — but the bag is different for the second
                 draw.<br><br>
                 <b>First ball red:</b> <code>5/8</code>.<br>
                 <b>Second ball red:</b> only <b>4</b> reds remain among <b>7</b> balls →
                 <code>4/7</code>.<br><br>
                 <code>5/8 × 4/7 = 20/56 = <b>5/14</b></code><br><br>
                 <b>25/64</b> is <code>5/8 × 5/8</code> — the answer <em>with</em> replacement, where
                 the ball goes back and the bag is unchanged. That is the whole point of the phrase
                 "without replacement", and it is the option most people take.<br><br>
                 Sense check: removing a red makes a second red slightly less likely, so the true
                 answer must be <em>below</em> 25/64 ≈ 0.39. And 5/14 ≈ 0.36. ✓`,
    },
  ],
};
