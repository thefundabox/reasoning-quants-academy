/* ============================================================
   Reasoning · Unit 2 · Lesson 4 — Coded Relations
   ============================================================ */

import { codedChain, codedTree } from '../widgets/coded-chain.js';

const CHAIN = {
  expression: 'P # Q $ R * S',
  question: 'Decoded. Now read it: P sits two levels above S — so P is S\'s grandmother, on the father\'s side.',
};

export default {
  id: 'r.rel.coded',
  title: 'Coded Relations',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../reasoning/',
  nextLabel: 'Finish the unit',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'They take the words away',
      say: `<b>A $ B # C * D</b><br><br>
            Four letters, three symbols, no words at all. RPSC sets these because words let you guess —
            you half-recognise "nephew" and stumble to an answer. Strip the words out and guessing dies.<br><br>
            Good. Guessing was never going to pass this paper. The cure is entirely mechanical, and by
            the end of this lesson you will decode that expression without thinking.`,
      cta: 'Give me the key',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'One symbol at a time. Never the whole expression.',
      say: `The mistake is trying to read <b>A $ B # C * D</b> as a sentence. It is not a sentence —
            it is a <b>list of instructions</b> for drawing a tree.`,
      body: `
        <p>The paper always gives you a key. It looks different every time, so read it carefully rather
           than assuming — but it will always be built from the same handful of relations:</p>
        <ul>
          <li><code>P $ Q</code> — P is the <b>father</b> of Q</li>
          <li><code>P # Q</code> — P is the <b>mother</b> of Q</li>
          <li><code>P @ Q</code> — P is the <b>brother</b> of Q</li>
          <li><code>P * Q</code> — P is the <b>sister</b> of Q</li>
          <li><code>P &amp; Q</code> — P is the <b>husband</b> of Q</li>
        </ul>
        <p>Now the method, and it is only three lines:</p>
        <ol>
          <li><b>Split the expression into pairs.</b> <code>A $ B # C</code> is two instructions:
              <code>A $ B</code>, then <code>B # C</code>. The middle letter belongs to both.</li>
          <li><b>Draw each pair the moment you read it.</b> Do not queue them up in your head.</li>
          <li><b>Note the gender each symbol forces.</b> <code>#</code> means "mother", so that person
              is female — even though nothing else in the question ever says so. This is where marks are won.</li>
        </ol>
        <p>Then read the finished tree exactly as you did in the earlier lessons: count the level gap.</p>`,
      cta: 'Let me decode one',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Decode it symbol by symbol',
      say: `Press the button once per symbol. Watch two things: the tree growing, and the
            <b>gender each symbol forces</b> on the person to its left.`,
      widget: codedChain(CHAIN),
      __cfg: CHAIN,
      tasks: [
        { label: 'Decode all three symbols', done: s => s.finished },
      ],
      onComplete: 'That is the whole skill. No cleverness, just three small instructions obeyed in order.',
      ctaDone: 'Test me',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'coded-decode', conceptLabel: 'Decoding a symbol chain',
      say: `Commit first. Take it one pair at a time — that is the only defence.`,
      context: `<b>A $ B</b> means A is the father of B · <b>B # C</b> means B is the mother of C.<br>
                Given the expression <b>A $ B # C</b>:`,
      q: 'How is A related to C?',
      options: ['A is C\'s father', 'A is C\'s maternal grandfather', 'A is C\'s uncle', 'A is C\'s paternal grandfather'],
      answer: 1,
      whyRight: `Correct — and note you got the <b>side</b> right too. <code>A $ B</code>: A is B's father,
                 so B is one level below A. <code>B # C</code>: B is C's <em>mother</em>, so B is female and
                 C is one level below B. A is two levels above C, reached <b>through C's mother</b> →
                 <b>maternal grandfather</b>.`,
      whyWrong: `Split it into two instructions.<br><br>
                 <code>A $ B</code> — A is the father of B. A is male; B sits one level below A.<br>
                 <code>B # C</code> — B is the <b>mother</b> of C. This forces B to be <b>female</b>, and puts C
                 one level below B.<br><br>
                 A is therefore two levels above C. And because the link runs through C's <em>mother</em>,
                 A is C's <b>maternal grandfather</b>.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The decoded tree',
      say: `Here is <b>A $ B # C</b> drawn out. Compare it with what you held in your head.`,
      steps: [
        `<b>Split into pairs.</b> <code>A $ B # C</code> becomes <code>A $ B</code> and <code>B # C</code>. B appears in both — it is the hinge.`,
        `<b>First instruction.</b> <code>A $ B</code>: draw A as a square, B one level below. A's gender is fixed by the symbol; B's is not, yet.`,
        `<b>Second instruction.</b> <code>B # C</code>: "mother" forces B to be a <b>circle</b>, and drops C one further level. That gender was never stated in words — the symbol supplied it.`,
        `<b>Read the gap.</b> A to C is two levels, through a female link. Two levels up, male, via the mother's side → <b>maternal grandfather</b>. You never had to remember the word "maternal"; the diagram showed you which side.`,
      ],
      widget: codedTree('A $ B # C'),
      takeaway: `Symbols carry gender that the words never mention. Every time you decode a pair, immediately mark the shape — square or circle — before moving on.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'coded-gender', conceptLabel: 'Gender forced by a symbol',
      context: `<b>P * Q</b> means P is the sister of Q · <b>Q $ R</b> means Q is the father of R.<br>
                Given <b>P * Q $ R</b>:`,
      q: 'How is P related to R?',
      options: ['P is R\'s mother', 'P is R\'s aunt', 'P is R\'s sister', 'P is R\'s grandmother'],
      answer: 1,
      why: `<code>P * Q</code> — P is Q's <b>sister</b>, so P is female and sits on Q's own level.
            <code>Q $ R</code> — Q is R's father, so R is one level below Q, and therefore one level below P too.
            A woman one level above you, reached sideways through your father → your <b>aunt</b> (bua).`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'coded-decode', conceptLabel: 'Decoding a symbol chain',
      context: `<b>M &amp; N</b> means M is the husband of N · <b>N # O</b> means N is the mother of O.<br>
                Given <b>M &amp; N # O</b>:`,
      q: 'How is M related to O?',
      options: ['M is O\'s uncle', 'M is O\'s father', 'M is O\'s grandfather', 'M is O\'s brother'],
      answer: 1,
      why: `<code>M &amp; N</code> — husband and wife sit on the <b>same level</b>; marriage is a lateral link.
            <code>N # O</code> — N is O's mother, so O is one level below N, and equally one level below M.
            M is male, one level above O, and married to O's mother → O's <b>father</b>.
            The trap is treating the marriage link as a step downward; it never is.`,
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'coded-decode', conceptLabel: 'Decoding a symbol chain',
      say: `The expression from the very beginning. Three symbols. You now have every tool.`,
      context: `<b>$</b> = father of · <b>#</b> = mother of · <b>*</b> = sister of<br>
                Given the expression <b>A $ B # C * D</b>:`,
      q: 'How is A related to D?',
      options: ['A is D\'s father', 'A is D\'s grandfather', 'A is D\'s uncle', 'A is D\'s brother'],
      answer: 1,
      whyRight: `Exactly. <code>A $ B</code>: A is B's father. <code>B # C</code>: B is C's mother — so B is
                 <b>female</b>, and C drops one level. <code>C * D</code>: C is D's sister, so C and D are on the
                 <b>same level</b>, both children of B. A is two levels above D → <b>grandfather</b>
                 (maternal, since the link runs through B, who the second symbol proved is a mother).`,
      whyWrong: `Three instructions, in order.<br><br>
                 <code>A $ B</code> — A is B's father. B is one level below A.<br>
                 <code>B # C</code> — B is C's <b>mother</b>. B is female; C is one level below B.<br>
                 <code>C * D</code> — C is D's <b>sister</b>, so D sits on <b>C's own level</b>, not below it.
                 Both are B's children.<br><br>
                 So D is two levels below A → A is D's <b>grandfather</b>. The last symbol is the trap:
                 "sister" is lateral and must not drop D another rung.`,
    },
  ],
};
