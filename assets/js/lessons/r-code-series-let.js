/* ============================================================
   Reasoning · Unit 5 · Lesson 4 — Letter & Mixed Series
   ============================================================ */

import { seriesChain } from '../widgets/series-chain.js';

const CHAIN = { terms: ['C', 'F', 'J', 'O', 'U'], letters: true,
                label: 'Work on the positions, not the letters' };

export default {
  id: 'r.code.series-let',
  title: 'Letter & Mixed Series',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.code.analogy',
  nextLabel: 'Next: Analogy & Odd One Out →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'You cannot subtract letters',
      say: `<b>C, F, J, O, ?</b><br><br>
            There is no arithmetic you can do to the letter C. But there is arithmetic you can do to
            the number <b>3</b> — and C <em>is</em> 3.<br><br>
            Every letter series becomes a number series the moment you write the positions underneath.
            Candidates who try to feel the gaps by reciting the alphabet lose both time and accuracy.`,
      cta: 'Show me the conversion',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Write the positions. Always.',
      say: `The entire method is one habit: <b>convert first, solve second, convert back</b>.
            The conversion is not a shortcut you take when stuck — it is step one, every time.`,
      body: `
        <p>Write the position under each letter using the EJOTY anchors from the cipher lesson
           (<b>E 5 · J 10 · O 15 · T 20 · Y 25</b>). Then run the number-series checklist you already know.</p>
        <p><b>Three shapes cover almost every letter series:</b></p>
        <ul>
          <li><b>Constant jump</b> — A, D, G, J … each +3.</li>
          <li><b>Growing jump</b> — C, F, J, O … +3, +4, +5, and so on.</li>
          <li><b>Backwards</b> — Z, W, T, Q … each −3. The alphabet runs in reverse and nothing else changes.</li>
        </ul>
        <p><b>Alphanumeric series</b> put a letter and a number together — <code>A1, C4, E9, G16</code>.
           Do not read them as one thing. <b>Split them into two independent series</b> and solve each
           separately: the letters here go A, C, E, G (+2) and the numbers go 1, 4, 9, 16 (perfect squares).
           They almost never share a rule.</p>
        <p>One caution: letter series <b>wrap</b> past Z only if the paper says so. In most RAS questions
           the series is chosen to stay inside A–Z, so if your rule pushes you past Z, suspect the rule
           before you suspect the alphabet.</p>`,
      cta: 'Let me convert one',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'The positions are already written for you',
      say: `Each letter carries its position underneath. Work on <b>those</b> numbers — build the gap
            in each one, then predict the hidden position.`,
      widget: seriesChain(CHAIN),
      __cfg: CHAIN,
      tasks: [
        { label: 'Get every gap in the chain correct', done: s => s.chainSolved },
        { label: 'Predict the hidden position', done: s => s.predicted },
      ],
      onComplete: 'Three, four, five, six. Obvious in numbers, invisible in letters.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'letter-positions', conceptLabel: 'Converting letters to positions',
      say: `Commit first. Write the positions before you look at the options.`,
      context: `Find the next letter: <b>A, D, G, J, ?</b>`,
      q: 'What comes next?',
      options: ['L', 'M', 'K', 'N'],
      answer: 1,
      whyRight: `Correct. Positions are 1, 4, 7, 10 — a constant jump of <b>+3</b>.
                 The next position is 13, and 13 is <b>M</b>.`,
      whyWrong: `Convert first: A = 1, D = 4, G = 7, J = 10.<br><br>
                 The gaps are 3, 3, 3 — a constant jump of <b>+3</b>. The next position is
                 10 + 3 = <b>13</b>.<br><br>
                 Position 13 is <b>M</b> (anchor: J is 10, so K 11, L 12, M 13).
                 Answering L means you counted 12, one short.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The hook, converted',
      say: `Four numbers, and the pattern announces itself.`,
      steps: [
        `<b>Convert.</b> C, F, J, O become <b>3, 6, 10, 15</b>. Use the EJOTY anchors — O is 15 with no counting at all.`,
        `<b>Take differences.</b> 6 − 3 = 3 · 10 − 6 = 4 · 15 − 10 = 5. The jumps are <b>3, 4, 5</b> — growing by one.`,
        `<b>Continue the pattern.</b> The next jump is <b>6</b>, so the next position is 15 + 6 = <b>21</b>.`,
        `<b>Convert back.</b> Position 21 is <b>U</b> (anchor: T is 20, so U is 21). Notice the series stays comfortably inside A–Z, as these questions almost always do.`,
      ],
      takeaway: `Write the positions under the letters before you do anything else. A letter series you can see the numbers for is just a number series.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'reverse-letter-series', conceptLabel: 'Series that run backwards',
      context: `Find the next letter: <b>Z, W, T, Q, ?</b>`,
      q: 'What comes next?',
      options: ['O', 'N', 'P', 'M'],
      answer: 1,
      why: `Convert: Z = 26, W = 23, T = 20, Q = 17. The gaps are <b>−3</b> each time — the series runs
            backwards through the alphabet.<br><br>
            The next position is 17 − 3 = <b>14</b>, which is <b>N</b> (anchor: O is 15, so N is 14).<br><br>
            Nothing about the method changed; only the sign of the jump did.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'alphanumeric-split', conceptLabel: 'Splitting an alphanumeric series',
      context: `Find the next term: <b>A1, C4, E9, G16, ?</b>`,
      q: 'What comes next?',
      options: ['I25', 'H25', 'I20', 'I24'],
      answer: 0,
      why: `Split it into two independent series — they rarely share a rule.<br><br>
            <b>Letters:</b> A, C, E, G → positions 1, 3, 5, 7, rising by 2. Next is position 9 = <b>I</b>.<br>
            <b>Numbers:</b> 1, 4, 9, 16 → the perfect squares 1², 2², 3², 4². Next is 5² = <b>25</b>.<br><br>
            Put them back together: <b>I25</b>. Answering I20 continues the number gaps (3, 5, 7 → 9)
            arithmetically instead of spotting the squares — a reasonable attempt, but the squares
            are the cleaner fit and the intended one.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'letter-positions', conceptLabel: 'Converting letters to positions',
      say: `The series from the start.`,
      context: `Find the next letter: <b>C, F, J, O, ?</b>`,
      q: 'What comes next?',
      options: ['T', 'U', 'S', 'V'],
      answer: 1,
      whyRight: `Exactly. Positions 3, 6, 10, 15 have gaps of <b>3, 4, 5</b> — growing by one.
                 The next gap is 6, so the next position is 15 + 6 = <b>21</b> = <b>U</b>.`,
      whyWrong: `Convert: C = 3, F = 6, J = 10, O = 15.<br><br>
                 Gaps: 3, 4, 5 — each one bigger than the last. So the next gap is <b>6</b>, and the
                 next position is 15 + 6 = <b>21</b>.<br><br>
                 Position 21 is <b>U</b> (T is 20, so U is 21). Answering T means you added 5 again
                 instead of letting the gap grow.`,
    },
  ],
};
