/* ============================================================
   Reasoning · Unit 5 · Lesson 2 — The Five Code Families
   ============================================================ */

import { codeLab } from '../widgets/cipher-wheel.js';

const LAB = { plain: 'MANGO', code: 'AMGNO', target: 'JAIPUR' };

export default {
  id: 'r.code.families',
  title: 'The Five Code Families',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.code.series-num',
  nextLabel: 'Next: Number Series →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Count the shift and you will find nothing',
      say: `In a certain code, <b>MANGO</b> is written as <b>AMGNO</b>.<br><br>
            Your instinct is to find the shift. Try it: M → A is a jump of 14, A → M is a jump of 12.
            No single shift works, and after thirty seconds of arithmetic you have proved only that
            you were asking the wrong question.<br><br>
            There is a <b>two-second test</b> that would have told you immediately.`,
      cta: 'Give me the test',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Ask one question before you calculate anything',
      say: `<b>Does the code use the same letters as the word?</b> That single question splits every
            coding question in the paper into two halves.`,
      body: `
        <p>MANGO and AMGNO both contain M, A, N, G, O. Nothing was <em>shifted</em> — the letters were
           <b>rearranged</b>. No arithmetic was ever going to help.</p>
        <p><b>Same letters → a rearrangement family:</b></p>
        <ul>
          <li><b>Word reversal</b> — the whole word backwards. <code>CAT → TAC</code></li>
          <li><b>Adjacent pair swap</b> — letters swapped two at a time. <code>MANGO → AMGNO</code>
              (M↔A, N↔G, and the lone O stays put)</li>
        </ul>
        <p><b>Different letters → a substitution family:</b></p>
        <ul>
          <li><b>Uniform shift</b> — every letter moves the same amount. <code>CAT → FDW</code> (+3)</li>
          <li><b>Incremental shift</b> — the step grows: +1, +2, +3… <code>CAT → DCW</code></li>
          <li><b>Reverse alphabet</b> — position becomes 27 − n, so A↔Z. <code>CAT → XZG</code></li>
        </ul>
        <p>Then the diagnostic on the substitution side: compare the <b>first letter pair</b>.
           If the gap repeats on the second pair, it is uniform. If the gap <em>grows</em>, it is
           incremental. If the first letter lands suspiciously far away — near the opposite end of the
           alphabet — check 27 − n before anything else.</p>`,
      cta: 'Let me test the families',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Test a family, and I will judge it',
      say: `Pick any family and I will check it against the pair. Guess badly on purpose once —
            seeing a family <em>fail</em> is how you learn the diagnostic.`,
      widget: codeLab(LAB),
      __cfg: LAB,
      tasks: [
        { label: 'Test at least <b>two</b> families', done: s => s.triedCount >= 2 },
        { label: 'Find the family that fits', done: s => s.solved },
      ],
      onComplete: 'And once the family is named, the second word costs no thinking at all.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'name-the-family', conceptLabel: 'Identifying the code family',
      say: `Commit first. Run the two-second test before any arithmetic.`,
      context: `In a certain code, <b>CAT</b> is written as <b>XZG</b>.`,
      q: 'Which family is this code?',
      options: ['Uniform shift', 'Reverse alphabet', 'Incremental shift', 'Word reversal'],
      answer: 1,
      whyRight: `Correct. The letters are different, so it is a substitution — and C(3) → X(24)
                 is suspiciously far. Check 27 − n: 27 − 3 = 24 = X ✓, 27 − 1 = 26 = Z ✓,
                 27 − 20 = 7 = G ✓. It is the <b>reverse alphabet</b>.`,
      whyWrong: `The letters are different, so it is not a rearrangement. Now look at the size of the
                 first jump: C(3) → X(24) is a leap of 21, which is far too big for a sensible shift.<br><br>
                 That largeness is the signal to test <b>27 − n</b>:
                 27 − 3 = 24 = <b>X</b> ✓ · 27 − 1 = 26 = <b>Z</b> ✓ · 27 − 20 = 7 = <b>G</b> ✓<br><br>
                 It is the <b>reverse alphabet</b>. A uniform shift would have given the same gap on
                 every pair, and here the gaps are 21, 25 and 13 — nothing like each other.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The decision tree, in order',
      say: `Follow this and you never brute-force a code again.`,
      steps: [
        `<b>Are the letters the same?</b> Compare the two words as sets. If yes, it is a rearrangement — go to step 2. If no, go to step 3. This costs two seconds and eliminates half the families.`,
        `<b>Rearrangement: reversed or swapped?</b> Read the code backwards. If it matches the word, it is a reversal. Otherwise check pairs: first two swapped, next two swapped. A word of odd length leaves its last letter untouched — that lone letter is a strong hint.`,
        `<b>Substitution: measure the first pair.</b> Convert both to positions and subtract. Then measure the <em>second</em> pair. Same gap → uniform shift. Gap grew by a constant → incremental.`,
        `<b>Still nothing? Test 27 − n.</b> The reverse alphabet produces wildly varying gaps, so it looks like chaos until you test it — and then it fits every letter at once.`,
      ],
      takeaway: `Same letters or different letters? That question comes before all arithmetic, and it decides which half of the families you are even in.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'incremental-shift', conceptLabel: 'Spotting an incremental shift',
      context: `In a certain code, <b>CAT</b> is written as <b>DCW</b>.`,
      q: 'How is DOG written in that code?',
      options: ['EPH', 'EQJ', 'FQJ', 'EQI'],
      answer: 1,
      why: `Measure both pairs. C(3) → D(4) is <b>+1</b>; A(1) → C(3) is <b>+2</b>; T(20) → W(23) is <b>+3</b>.
            The gap grows by one each time — an <b>incremental shift</b>.<br><br>
            Apply the same growing steps to DOG: D(4) + 1 = E · O(15) + 2 = Q · G(7) + 3 = J.
            The answer is <b>EQJ</b>.<br><br>
            Had you measured only the first pair, you would have concluded "+1" and answered EPH.
            That is precisely why step 3 says measure the <em>second</em> pair too.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'same-letters-test', conceptLabel: 'The same-letters test',
      context: `Four codes, four different words:<br>
                (i) <code>CAT → TAC</code> &nbsp; (ii) <code>CAT → FDW</code> &nbsp;
                (iii) <code>CAT → XZG</code> &nbsp; (iv) <code>CAT → ACT</code>`,
      q: 'Which two are rearrangements rather than substitutions?',
      options: ['(i) and (ii)', '(i) and (iv)', '(ii) and (iii)', '(iii) and (iv)'],
      answer: 1,
      why: `Apply the same-letters test to each.<br><br>
            (i) TAC uses C, A, T — <b>same letters</b> ✓ rearrangement (a reversal).<br>
            (iv) ACT uses C, A, T — <b>same letters</b> ✓ rearrangement (the first pair swapped).<br>
            (ii) FDW and (iii) XZG contain letters absent from CAT, so both are substitutions.<br><br>
            You sorted four codes into two families without a single subtraction.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'name-the-family', conceptLabel: 'Identifying the code family',
      say: `The code from the start. You named the family in the widget — now apply it.`,
      context: `In a certain code, <b>MANGO</b> is written as <b>AMGNO</b>.`,
      q: 'How is JAIPUR written in that code?',
      options: ['AJPIRU', 'AJIPUR', 'RUPIAJ', 'JAIPUR'],
      answer: 0,
      whyRight: `Exactly. MANGO → AMGNO swaps <b>adjacent pairs</b>: M↔A, N↔G, and the odd letter O
                 stays. JAIPUR has six letters, so all three pairs swap: <b>JA</b> → AJ,
                 <b>IP</b> → PI, <b>UR</b> → RU, giving <b>AJPIRU</b>.`,
      whyWrong: `The letters are the same, so it is a rearrangement. It is not a reversal
                 (MANGO backwards is OGNAM), so test pairs: M↔A gives AM ✓, N↔G gives GN ✓,
                 and the lone O stays put ✓. It is an <b>adjacent pair swap</b>.<br><br>
                 JAIPUR has six letters — three complete pairs, none left over:<br>
                 JA → <b>AJ</b> · IP → <b>PI</b> · UR → <b>RU</b><br><br>
                 The answer is <b>AJPIRU</b>. Swapping only the first pair would give AJIPUR,
                 which is the trap option.`,
    },
  ],
};
