/* ============================================================
   Quants · Unit 1 · Lesson 2 — Divisibility & Factors
   ============================================================ */

import { divisibilityTester } from '../widgets/number-lab.js';

const TESTER = { numbers: [4728, 5643, 9152, 2079], start: 0 };

export default {
  id: 'q.num.divis',
  title: 'Divisibility & Factors',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.num.lcm',
  nextLabel: 'Next: LCM & HCF →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Does 11 divide 5,643?',
      say: `Do not divide. Add the digits alternately, starting from the right:<br>
            <b>3 − 4 + 6 − 5 = 0</b>.<br><br>
            Zero divides by 11. So yes — and you did it in two seconds, in your head, on a
            four-digit number.<br><br>
            Six tests like this turn a whole family of exam questions into sight-reading.`,
      cta: 'Give me the six',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'The tests worth knowing cold',
      say: `Each one replaces a division with something you can do by looking. Learn the working,
            not just the rule — the working is what you actually perform.`,
      body: `
        <ul>
          <li><b>2</b> — the last digit is even.</li>
          <li><b>4</b> — the <b>last two digits</b> form a number divisible by 4. Everything above the
              hundreds is a multiple of 100, and 100 already divides by 4, so it cannot affect the
              answer.</li>
          <li><b>8</b> — the <b>last three digits</b> divide by 8, for the same reason: 1,000 divides
              by 8.</li>
          <li><b>3</b> — the <b>digit sum</b> divides by 3.</li>
          <li><b>9</b> — the <b>digit sum</b> divides by 9. Same sum, stricter question — so anything
              passing 9 automatically passes 3.</li>
          <li><b>6</b> — it passes <b>both 2 and 3</b>. There is no separate test, and there does not
              need to be.</li>
          <li><b>11</b> — the <b>alternating digit sum</b>, from the right, divides by 11 (zero
              counts).</li>
        </ul>
        <p><b>Two habits that save marks.</b></p>
        <p><b>Combine, do not invent.</b> There is no "test for 12". A number divides by 12 exactly
           when it passes <b>4 and 3</b> — because 4 × 3 = 12 and they share no factor. The same
           trick gives you 15 (3 and 5), 18 (2 and 9) and 24 (8 and 3). But <em>never</em> 2 and 6
           for 12: those share a factor, and 18 would pass both while not dividing by 12.</p>
        <p><b>Factorise once, answer everything.</b> 2,079 = 3<sup>3</sup> × 7 × 11. From that one
           line you can read off every divisor it has, and refuse every divisor it does not.</p>`,
      cta: 'Run the tests for me',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Four numbers, seven tests each',
      say: `Pick each number and watch every test run, with its working shown.<br><br>
            Look for the pattern: which numbers pass the digit-sum tests, and which pass the
            last-digits tests. They are almost never the same ones.`,
      widget: divisibilityTester(TESTER),
      __cfg: TESTER,
      tasks: [
        { label: 'Look at all four numbers', done: s => s.seenAll },
        { label: 'Find one that divides by <b>11</b>', done: s => s.found11 },
        { label: 'Find one that passes <b>five or more</b> tests', done: s => s.passCount >= 5 },
      ],
      onComplete: `Notice 4,728 passing 2, 4, 8, 3 and 6 while failing 9 and 11 — and 5,643 doing
                   the exact opposite. Even numbers and digit-sum numbers are different worlds.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'divis-eleven', conceptLabel: 'The alternating digit sum, for 11',
      say: `The number from the start. Do it the fast way.`,
      context: `<b>2,079</b>`,
      q: 'Which of these divides it?',
      options: ['2 only', '9 and 11', '4 and 8', '5 and 6'],
      answer: 1,
      whyRight: `Correct. The digit sum is 2 + 0 + 7 + 9 = <b>18</b>, which divides by 9. The
                 alternating sum is 9 − 7 + 0 − 2 = <b>0</b>, which divides by 11. And 2,079 is odd,
                 so 2, 4, 8 and 6 are all out at a glance.`,
      whyWrong: `Start with the cheapest test of all: <b>2,079 is odd</b>. That immediately kills
                 2, 4, 8 and 6 — four of the seven tests, for free.<br><br>
                 <b>Digit sum</b> 2 + 0 + 7 + 9 = <b>18</b>. That divides by 9 (and so by 3).<br><br>
                 <b>Alternating sum</b> from the right: 9 − 7 + 0 − 2 = <b>0</b>. Zero is divisible by
                 11, so 11 divides it.<br><br>
                 In full, 2,079 = 3<sup>3</sup> × 7 × 11 — and every one of those verdicts falls out
                 of that.<br><br>
                 5 is out too: the number ends in 9.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Why the last-digit tests work at all',
      say: `These are not arbitrary rules. Each one is a short argument.`,
      steps: [
        `<b>Why 4 only looks at two digits.</b> Any number is (hundreds part × 100) + (last two
         digits). 100 divides by 4, so the hundreds part contributes nothing to the remainder.
         Only the last two digits can decide it. For 4,728 that is <b>28</b>, and 28 ÷ 4 = 7. ✓`,
        `<b>Why 8 needs three.</b> 1,000 divides by 8, so everything above the hundreds falls away —
         but 100 does <em>not</em> divide by 8, so the hundreds digit still matters. For 9,152 the
         last three are <b>152</b>, and 152 ÷ 8 = 19. ✓`,
        `<b>Why digit sums work for 3 and 9.</b> 10 leaves a remainder of 1 when divided by 9, and
         so does 100, and 1,000. So a number leaves the same remainder as the sum of its digits.
         For 5,643: 5 + 6 + 4 + 3 = <b>18</b>, divisible by 9. ✓`,
        `<b>Why 11 alternates.</b> 10 leaves remainder −1 with 11, 100 leaves +1, 1,000 leaves −1 —
         the signs flip. So the digits must be added with alternating signs. For 9,152:
         2 − 5 + 1 − 9 = <b>−11</b>. ✓`,
        `<b>And 6 needs no rule of its own.</b> 6 = 2 × 3 and those share no factor, so passing both
         is exactly the same as passing 6. 4,728 is even and has digit sum 21 — so 6 divides it.`,
      ],
      takeaway: `Last-digit tests come from powers of 10 being divisible by 4 and 8. Digit-sum tests
                 come from powers of 10 leaving remainder 1 with 9. Knowing why is what stops you
                 misremembering which test needs two digits and which needs three.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'divis-combine', conceptLabel: 'Combining tests for composite divisors',
      context: `You need to know whether a number divides by <b>12</b>.`,
      q: 'Which pair of tests settles it?',
      options: [
        'Divisible by 2 and by 6',
        'Divisible by 3 and by 4',
        'Divisible by 2 and by 3',
        'Divisible by 6 and by 12',
      ],
      answer: 1,
      whyRight: `Right. 3 × 4 = 12 and they share no common factor, so passing both is exactly
                 passing 12.`,
      whyWrong: `You may split a divisor into factors only when those factors <b>share nothing</b>.<br><br>
                 <b>3 and 4</b> share no factor and multiply to 12. ✓<br><br>
                 <b>2 and 6</b> multiply to 12 but both contain a 2, so they overlap — and 18 passes
                 both while <em>not</em> dividing by 12. ✗<br><br>
                 <b>2 and 3</b> only prove divisibility by 6. 18 passes both again. ✗<br><br>
                 This is the single commonest divisibility error in the paper, and the fix is to
                 check that your two factors are <em>coprime</em> before you trust them.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'divis-eleven', conceptLabel: 'The alternating digit sum, for 11',
      input: 'number', answer: 0, unit: 'the missing digit',
      context: `The last digit of <b>5 6 4 ?</b> is smudged. The number divides by <b>4</b> and
                also by <b>3</b>.`,
      q: 'What is the missing digit?',
      why: `Two conditions. Apply each as a filter rather than testing all ten digits.<br><br>
            <b>Divisible by 4</b> — only the last two digits matter, so <code>4?</code> must divide
            by 4. That leaves <b>0, 4, 8</b> (from 40, 44, 48).<br><br>
            <b>Divisible by 3</b> — the digit sum is 5 + 6 + 4 + ? = 15 + ?, so ? must be
            <b>0, 3, 6</b> or <b>9</b>.<br><br>
            The only digit in <em>both</em> lists is <b>0</b>, giving <b>5,640</b>. Check:
            5,640 ÷ 4 = 1,410 and 5,640 ÷ 3 = 1,880. ✓<br><br>
            Note that 5,644 and 5,648 pass the 4 test but fail the digit sum, and 5,643 and 5,646
            do the reverse — which is why you need both filters, not either one.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'divis-factorise', conceptLabel: 'Reading every divisor off a factorisation',
      say: `One factorisation, four questions answered at once.`,
      context: `<b>2,079 = 3<sup>3</sup> × 7 × 11</b>`,
      q: 'Which of these does NOT divide 2,079?',
      options: ['63', '77', '99', '49'],
      answer: 3,
      whyRight: `Correct. <b>49 = 7<sup>2</sup></b>, and 2,079 contains only <b>one</b> 7. A divisor
                 may never ask for more copies of a prime than the number actually has.`,
      whyWrong: `Break each candidate into primes and ask whether 3<sup>3</sup> × 7 × 11 can supply
                 them.<br><br>
                 <b>63 = 3<sup>2</sup> × 7</b> — needs two 3s and one 7; there are three 3s and a 7. ✓
                 (2,079 ÷ 63 = 33)<br>
                 <b>77 = 7 × 11</b> — one of each, both present. ✓ (2,079 ÷ 77 = 27)<br>
                 <b>99 = 3<sup>2</sup> × 11</b> — available. ✓ (2,079 ÷ 99 = 21)<br>
                 <b>49 = 7 × 7</b> — needs <b>two</b> 7s, and there is only one. ✗
                 (2,079 ÷ 49 = 42.43…)<br><br>
                 This is the whole value of factorising once: every divisibility question about the
                 number is then answered by counting primes, never by dividing.`,
    },
  ],
};
