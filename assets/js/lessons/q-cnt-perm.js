/* ============================================================
   Quants · Unit 6 · Lesson 2 — Permutations
   ============================================================ */

import { permComb } from '../widgets/count-lab.js';

const PICKER = { items: ['A', 'B', 'C', 'D'], startR: 2, maxR: 3 };

export default {
  id: 'q.cnt.perm',
  title: 'Permutations',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.cnt.comb',
  nextLabel: 'Next: Combinations →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Five letters, but only thirty words',
      say: `<b>LEVEL</b> has five letters, so it should rearrange in 5! = <b>120</b> ways.<br><br>
            It rearranges in <b>30</b>.<br><br>
            The two L's are identical, and so are the two E's. Swapping them changes nothing you
            can see — so 120 counts every real arrangement four times over.`,
      cta: 'Show me the division',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Arrange, then divide out what you cannot tell apart',
      say: `A permutation is an arrangement — order matters. The only complication in the whole
            topic is repeats, and repeats are handled by division.`,
      body: `
        <p><b>All n items:</b> <code>n!</code> arrangements. Five distinct people in a row is
           <code>5! = 120</code>.</p>
        <p><b>Only r of the n:</b> <code>nPr = n! ÷ (n − r)!</code> — which is really just the slot
           method from the last lesson. Choosing 3 of 6 people for three chairs is
           <code>6 × 5 × 4 = 120</code>, and the formula gives <code>6! ÷ 3! = 120</code>. Same
           thing, written differently.</p>
        <p><b>Repeated items divide out.</b> If a letter appears p times, its p! orderings are
           invisible, so:</p>
        <p><code>arrangements = n! ÷ (p! × q! × …)</code></p>
        <p>LEVEL has 5 letters with L twice and E twice:
           <code>5! ÷ (2! × 2!) = 120 ÷ 4 = <b>30</b></code>.</p>
        <p>BANANA has 6 letters with A three times and N twice:
           <code>6! ÷ (3! × 2!) = 720 ÷ 12 = <b>60</b></code>.</p>
        <p><b>Count the letters properly.</b> Almost every mistake here is a miscount of the
           repeats, not a mistake in the arithmetic. Write the tally out — A:3, N:2, B:1 — before
           you touch a factorial.</p>
        <p><b>A useful sanity check.</b> The answer must be a whole number, and it must be smaller
           than n! whenever anything repeats. If your division leaves a fraction, you have
           miscounted a letter.</p>`,
      cta: 'Let me see the duplicates',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Every ordering, and then the ones that collapse',
      say: `Four distinct letters. In <b>order matters</b> mode you see every arrangement.<br><br>
            Switch to <b>order does not</b> and the same list is grouped: one kept, the rest struck
            through. Those struck entries are exactly what division removes — and that is the next
            lesson's idea, seen early.`,
      widget: permComb(PICKER),
      __cfg: PICKER,
      tasks: [
        { label: 'Look at both modes', done: s => s.sawBoth },
        { label: 'Confirm the counts match <b>nPr</b> and <b>nCr</b>', done: s => s.matchesFormula },
        { label: 'Check the ratio between them is <b>r!</b>', done: s => s.ratioIsRFactorial && s.r > 1 },
      ],
      onComplete: `The ratio is always r! — the number of ways to shuffle a group without changing
                   which items are in it. That is the only thing separating the two ideas.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'perm-repeats', conceptLabel: 'Divide by the factorial of each repeat',
      input: 'number', answer: 30, unit: 'arrangements',
      say: `The word from the start.`,
      context: `In how many distinct ways can the letters of <b>LEVEL</b> be arranged?`,
      q: 'Count them.',
      whyRight: `Correct. Five letters give 120, but L appears twice and E appears twice, so
                 <code>120 ÷ (2! × 2!) = 120 ÷ 4 = <b>30</b></code>.`,
      whyWrong: `Tally the letters first: <b>L:2, E:2, V:1</b> — five letters in all.<br><br>
                 <code>5! = 120</code> would be the answer if every letter were distinct.<br><br>
                 But the two L's can swap without changing the word, and so can the two E's. That
                 makes <code>2! × 2! = 4</code> invisible rearrangements of each real one.<br><br>
                 <code>120 ÷ 4 = <b>30</b></code><br><br>
                 If you answered <b>120</b>, you treated the repeated letters as distinguishable.
                 If you answered <b>60</b>, you divided by only one of the two repeats.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Three words, one division',
      say: `Tally, factorial, divide.`,
      steps: [
        `<b>LEVEL.</b> L:2, E:2, V:1 over 5 letters →
         <code>5! ÷ (2!·2!) = 120 ÷ 4 = <b>30</b></code>.`,
        `<b>BANANA.</b> A:3, N:2, B:1 over 6 letters →
         <code>6! ÷ (3!·2!) = 720 ÷ 12 = <b>60</b></code>. The 3! is 6, not 3 — that slip halves
         nothing and doubles the answer.`,
        `<b>ALLAHABAD.</b> Nine letters: A:4, L:2, H:1, B:1, D:1 →
         <code>9! ÷ (4!·2!) = 362,880 ÷ 48 = <b>7,560</b></code>. The single letters contribute
         1! = 1 each, so they can be left out of the division entirely.`,
        `<b>Choosing only some.</b> Three of six people into three chairs is
         <code>6P3 = 6 × 5 × 4 = <b>120</b></code>. The slot method and the formula are the same
         calculation; use whichever you can do faster.`,
        `<b>The whole-number check.</b> Every one of these came out whole. A fractional answer means
         a miscounted letter — go back to the tally, never to the arithmetic.`,
      ],
      takeaway: `n! for everything, nPr for some, and divide by the factorial of each repeated
                 item. Write the tally down before you compute; that is where the errors live.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'perm-npr', conceptLabel: 'nPr is the slot method in one line',
      input: 'number', answer: 120, unit: 'ways',
      context: `Three of <b>six</b> people are to be seated on <b>three distinct chairs</b>.`,
      q: 'In how many ways can this be done?',
      why: `Order matters here, because the chairs are distinct — the same three people sitting
            differently is a different outcome.<br><br>
            By slots: <code>6 × 5 × 4 = <b>120</b></code>.<br><br>
            By formula: <code>6P3 = 6! ÷ 3! = 720 ÷ 6 = <b>120</b></code>.<br><br>
            They agree because nPr <em>is</em> the slot method: the first chair has 6 candidates,
            the second 5, the third 4.<br><br>
            Had the three seats been identical — a committee rather than chairs — the answer would
            be 120 ÷ 3! = 20, which is the next lesson.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'perm-repeats', conceptLabel: 'Divide by the factorial of each repeat',
      input: 'number', answer: 60, unit: 'arrangements',
      context: `How many distinct arrangements are there of the letters of <b>BANANA</b>?`,
      q: 'Count them.',
      why: `Tally: <b>A:3, N:2, B:1</b> — six letters.<br><br>
            <code>6! ÷ (3! × 2!) = 720 ÷ (6 × 2) = 720 ÷ 12 = <b>60</b></code><br><br>
            The commonest error is writing 3! as 3, giving <code>720 ÷ 6 = 120</code> — double the
            true answer. <b>3! is 6.</b><br><br>
            Sense check: BANANA has more repetition than LEVEL, so relative to its 720 it should
            shrink harder — and it does, to a twelfth rather than a quarter.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'perm-repeats', conceptLabel: 'Divide by the factorial of each repeat',
      say: `Nine letters. Tally carefully — that is the whole question.`,
      context: `How many distinct arrangements are there of the letters of <b>ALLAHABAD</b>?`,
      q: 'Choose the count.',
      options: ['7,560', '15,120', '3,780', '362,880'],
      answer: 0,
      whyRight: `Correct. Nine letters with A four times and L twice:
                 <code>9! ÷ (4! × 2!) = 362,880 ÷ 48 = <b>7,560</b></code>.`,
      whyWrong: `Write the tally out — this is where the question is won or lost.<br><br>
                 <b>A-L-L-A-H-A-B-A-D</b> → <b>A:4, L:2, H:1, B:1, D:1</b>. Nine letters. ✓<br><br>
                 <code>9! = 362,880</code><br>
                 <code>divisor = 4! × 2! = 24 × 2 = 48</code><br>
                 <code>362,880 ÷ 48 = <b>7,560</b></code><br><br>
                 <b>362,880</b> is 9! with no division at all — every letter treated as
                 distinguishable.<br><br>
                 <b>15,120</b> is <code>362,880 ÷ 24</code>: dividing by the A's but forgetting the
                 two L's. <b>3,780</b> divides by 96, which would need a third repeated pair that
                 is not there.<br><br>
                 Count the A's twice over before you commit. Four is easy to read as three.`,
    },
  ],
};
