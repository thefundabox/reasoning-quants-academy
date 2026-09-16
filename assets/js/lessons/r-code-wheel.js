/* ============================================================
   Reasoning · Unit 5 · Lesson 1 — The Cipher Wheel
   ============================================================ */

import { cipherWheel } from '../widgets/cipher-wheel.js';

const WHEEL = { start: 3, word: 'TIGER' };

export default {
  id: 'r.code.wheel',
  title: 'The Cipher Wheel',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.code.families',
  nextLabel: 'Next: The Five Code Families →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Eight seconds, or eighty',
      say: `In a certain code, <b>TIGER</b> is written as <b>WLJHU</b>.<br>
            How is <b>LION</b> written in the same code?<br><br>
            Every candidate can do this eventually. The ones who do it in eight seconds are not
            faster at counting — they simply <b>know where the letters live</b>, and never count
            from A at all.`,
      cta: 'Show me where they live',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Two numbers per letter, and one anchor',
      say: `Coding questions are arithmetic on letter positions. So the positions must be instant,
            not counted.`,
      body: `
        <p><b>Every letter carries two numbers:</b> its position from A, and its position from Z.
           They always add to 27 — so <code>position from Z = 27 − position from A</code>.
           R is 18th from A, and 27 − 18 = 9th from Z.</p>
        <p><b>The anchor worth memorising is EJOTY:</b></p>
        <ul>
          <li><b>E = 5 · J = 10 · O = 15 · T = 20 · Y = 25</b></li>
        </ul>
        <p>Every other letter is within two steps of one of those. Need P? It is one past O, so 16.
           Need W? Three past T, so 23. You never count from A again.</p>
        <p><b>A uniform shift has exactly one secret.</b> If every letter moves the same distance,
           then finding that distance from <em>a single pair</em> decodes the whole language.
           T → W is +3, and that is the entire cipher.</p>
        <p>Two cautions. A shift <b>wraps</b>: Y + 3 is B, not something past Z. And a shift can be
           <b>backwards</b> — S → P is −3, and the wheel handles that just as happily.</p>`,
      cta: 'Let me turn the wheel',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'One wheel, twenty-six languages',
      say: `The outer ring is the plain alphabet, the inner ring the code. Rotate it and every mapping
            changes at once. Tap any letter to see both its positions.`,
      widget: cipherWheel(WHEEL),
      __cfg: WHEEL,
      tasks: [
        { label: 'Tap a letter and read its position from <b>A</b> and from <b>Z</b>', done: s => s.tappedCount >= 1 },
        { label: 'Try at least <b>four</b> different shifts', done: s => s.shiftsTried >= 4 },
        { label: 'Push the shift past <b>+13</b> and watch the wrap', done: s => s.triedBig },
        { label: 'Tap three different letters', done: s => s.tappedCount >= 3 },
      ],
      onComplete: 'One secret, twenty-six settings. That is all a shift code ever is.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'find-the-shift', conceptLabel: 'Finding the shift from one pair',
      say: `Commit first. Find the shift from the <b>first</b> letter pair only, then apply it.`,
      context: `In a certain code, <b>DOG</b> is written as <b>GRJ</b>.`,
      q: 'How is CAT written in that code?',
      options: ['FDW', 'EBU', 'DZS', 'GXW'],
      answer: 0,
      whyRight: `Correct. D is 4, G is 7, so the shift is <b>+3</b>. Applying it: C(3) → F(6),
                 A(1) → D(4), T(20) → W(23). <b>FDW</b>. You only ever needed the first pair —
                 the rest was verification.`,
      whyWrong: `Take the first pair alone: <b>D → G</b>. D is position 4, G is position 7,
                 so the shift is <b>+3</b>.<br><br>
                 Now apply +3 to every letter of CAT: C(3) → F, A(1) → D, T(20) → W.
                 The answer is <b>FDW</b>.<br><br>
                 Check the shift on a second pair before you trust it — O(15) → R(18) is also +3. ✓`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Find, verify, apply',
      say: `Three moves, always in this order.`,
      steps: [
        `<b>Find the shift from the first pair.</b> Convert both letters to positions and subtract. One pair is enough to produce a candidate.`,
        `<b>Verify on a second pair.</b> This costs two seconds and catches the case where the code is <em>not</em> a uniform shift at all — which is the next lesson's whole subject.`,
        `<b>Apply, letter by letter, and wrap.</b> Position + shift, and if you go past 26 subtract 26. Y(25) + 3 = 28 → 28 − 26 = 2 → <b>B</b>.`,
        `<b>Watch for a negative shift.</b> If the coded letter is <em>earlier</em> in the alphabet, the shift is backwards. S(19) → P(16) is −3, and −3 is just as valid as +3.`,
      ],
      takeaway: `Never count from A. Anchor on EJOTY, take the shift from one pair, verify on a second, then apply it mechanically.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'negative-shift', conceptLabel: 'Shifts that run backwards',
      context: `In a certain code, <b>SUN</b> is written as <b>PRK</b>.`,
      q: 'How is MOON written in that code?',
      options: ['PRRQ', 'JLLK', 'JKKL', 'PQQR'],
      answer: 1,
      why: `S is 19 and P is 16, so the shift is <b>−3</b> — backwards. Check it: U(21) → R(18) ✓,
            N(14) → K(11) ✓.<br><br>
            Apply −3 to MOON: M(13) → J, O(15) → L, O → L, N(14) → K. The answer is <b>JLLK</b>.<br><br>
            If you chose PRRQ you shifted forwards. Always note the <em>direction</em> when you extract
            the shift, not just its size.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'position-both-ends', conceptLabel: 'Position from A and from Z',
      context: `Letters are numbered <b>A = 1</b> to <b>Z = 26</b>.`,
      q: 'What is the position of R counted from the Z end?',
      options: ['8', '9', '18', '10'],
      answer: 1,
      why: `R is the <b>18th</b> letter from A. Positions from the two ends always add to <b>27</b>,
            so from Z it is 27 − 18 = <b>9</b>.<br><br>
            Anchor check with EJOTY: R sits two past O(15), so 17? No — O is 15, P 16, Q 17, R <b>18</b>. ✓
            This 27 − n rule is also exactly the reverse-alphabet code you will meet next lesson.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'find-the-shift', conceptLabel: 'Finding the shift from one pair',
      say: `The code from the start.`,
      context: `In a certain code, <b>TIGER</b> is written as <b>WLJHU</b>.`,
      q: 'How is LION written in that code?',
      options: ['OLRQ', 'OKRP', 'ILRQ', 'PMSR'],
      answer: 0,
      whyRight: `Exactly. T(20) → W(23) gives <b>+3</b>, confirmed by I(9) → L(12).
                 Applying +3 to LION: L(12) → O, I(9) → L, O(15) → R, N(14) → Q. <b>OLRQ</b>.`,
      whyWrong: `First pair: <b>T → W</b>. T is 20, W is 23, so the shift is <b>+3</b>.
                 Verify on the second: I(9) → L(12) ✓.<br><br>
                 Now apply +3 to LION: L(12) → O(15), I(9) → L(12), O(15) → R(18), N(14) → Q(17).<br><br>
                 The answer is <b>OLRQ</b>.`,
    },
  ],
};
