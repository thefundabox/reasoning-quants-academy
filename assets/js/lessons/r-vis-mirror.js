/* ============================================================
   Reasoning · Unit 7 · Lesson 2 — Mirror & Water Images
   ============================================================ */

import { mirrorLab } from '../widgets/shape-lab.js';

const SAMPLES = ['HIM', 'TOOT', 'CODE', 'BOX', 'MUM'];

export default {
  id: 'r.vis.mirror',
  title: 'Mirror & Water Images',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.vis.fold',
  nextLabel: 'Next: Paper Folding & Punching →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Two flips that are nothing alike',
      say: `Hold the word <b>BOX</b> up to a mirror, then hold it over still water.<br><br>
            One of those leaves it looking almost the same. The other scrambles it completely —
            and most candidates cannot say which without trying.<br><br>
            There is exactly one question to ask, and it takes two seconds:
            <b>which axis is the flip about?</b>`,
      cta: 'Show me the axis',
    },
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Name the axis before you picture anything',
      say: `Both transformations are reflections. They differ only in the line you reflect across,
            and everything else follows from that.`,
      body: `
        <ul>
          <li><b>Mirror image</b> — reflection in a <b>vertical</b> line. Left and right swap;
              top and bottom do not move. The <em>order</em> of the letters also reverses, which is
              why writing on an ambulance bonnet looks backwards.</li>
          <li><b>Water image</b> — reflection in a <b>horizontal</b> line. Top and bottom swap;
              left and right do not move. The order of the letters stays exactly as written.</li>
        </ul>
        <p>So the two questions to ask about any letter are different:</p>
        <ul>
          <li><b>Survives a mirror</b> (left–right symmetric): <b>A H I M O T U V W X Y</b></li>
          <li><b>Survives water</b> (top–bottom symmetric): <b>B C D E H I K O X</b></li>
          <li><b>Survives both:</b> only <b>H I O X</b></li>
        </ul>
        <p><b>The trap that costs the mark:</b> for a whole <em>word</em> to look unchanged in a mirror,
           every letter must be left–right symmetric <b>and</b> the word must read the same backwards.
           TOOT survives; HIM does not, because reversing gives MIH. In water there is no such
           condition — the reading order is untouched.</p>`,
      cta: 'Let me flip some',
    },
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Same word, two axes',
      say: `Switch the axis and watch which words survive. Pay attention to <b>TOOT</b> against
            <b>HIM</b> — both are made of mirror-safe letters, but only one survives the mirror.`,
      widget: mirrorLab({ samples: SAMPLES }),
      __cfg: { samples: SAMPLES },
      tasks: [
        { label: 'Try <b>both</b> axes', done: s => s.triedBoth },
        { label: 'Look at at least three different words', done: s => s.samplesSeen >= 3 },
        { label: 'Find a case that comes back <b>unchanged</b>', done: s => s.sawUnchanged },
      ],
      onComplete: 'The axis decided everything. Letter shape alone was never enough.',
      ctaDone: 'Test me',
    },
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'which-axis', conceptLabel: 'Identifying the axis of reflection',
      say: `Commit first. Name the axis, then check the letters.`,
      context: `Consider the block capitals <b>B, C, D, E</b>.`,
      q: 'These four are unchanged by which transformation?',
      options: ['A mirror image (left–right flip)', 'A water image (top–bottom flip)',
                'Both', 'Neither'],
      answer: 1,
      whyRight: `Correct. B, C, D and E are each symmetric about a <b>horizontal</b> line — their top
                 half mirrors their bottom half — so a <b>water image</b> leaves them unchanged.
                 In a mirror they all reverse, because none is left–right symmetric.`,
      whyWrong: `Look at where the symmetry lies. Draw a <b>horizontal</b> line through the middle of
                 B: the top loop mirrors the bottom loop. The same is true of C, D and E.<br><br>
                 That is symmetry about a horizontal axis, which is exactly what a <b>water image</b>
                 reflects across.<br><br>
                 A mirror flips left ↔ right, and none of these four survives that — B reversed points
                 the wrong way, and so do C, D and E.`,
    },
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Why TOOT survives and HIM does not',
      say: `Both are built only from mirror-safe letters. Only one comes back unchanged.`,
      steps: [
        `<b>Check the letters.</b> T, O and H, I, M are all left–right symmetric, so no individual letter is damaged by a mirror.`,
        `<b>But a mirror also reverses the order.</b> This is the step candidates forget. The word is read from the other end.`,
        `<b>TOOT reversed is TOOT.</b> A palindrome, so the reversal is invisible and the word survives.`,
        `<b>HIM reversed is MIH.</b> Every letter looks fine, but the word is wrong. It fails.<br><br>In a <em>water</em> image neither reversal happens, so any word made of B, C, D, E, H, I, K, O, X survives regardless of spelling.`,
      ],
      takeaway: `Mirror = vertical axis, and the reading order reverses. Water = horizontal axis, and the order is untouched. Check the axis first, the letters second, the word order third.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'both-axes', conceptLabel: 'Letters symmetric about both axes',
      context: `Some capitals survive a mirror image <b>and</b> a water image unchanged.`,
      q: 'Which set is exactly those letters?',
      options: ['A H I M O', 'H I O X', 'B C D E H', 'O X I V'],
      answer: 1,
      why: `A letter must be symmetric about <b>both</b> axes to survive both flips.<br><br>
            Mirror-safe: A H I M O T U V W X Y. Water-safe: B C D E H I K O X.<br>
            The letters appearing in <em>both</em> lists are <b>H, I, O and X</b>.<br><br>
            A and M are mirror-safe but not water-safe; B and C are water-safe but not mirror-safe.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'word-order', conceptLabel: 'A mirror reverses the reading order',
      context: `The word <b>MOM</b> is held up to a <b>mirror</b>.`,
      q: 'How does it appear?',
      options: ['MOM — unchanged', 'WOW', 'MOM reversed to a different word', 'Unreadable'],
      answer: 0,
      why: `Two conditions, both satisfied.<br><br>
            <b>Letters:</b> M and O are both left–right symmetric, so neither is damaged.<br>
            <b>Order:</b> MOM reversed is MOM — a palindrome — so the reversal is invisible.<br><br>
            It appears <b>unchanged</b>. Contrast with HIM, which passes the letter test but fails
            the order test.`,
    },
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'which-axis', conceptLabel: 'Identifying the axis of reflection',
      say: `The word from the start.`,
      context: `The word <b>BOX</b> is held up to a <b>mirror</b>, and separately over <b>still water</b>.`,
      q: 'Which is true?',
      options: ['Unchanged in the mirror, changed in water',
                'Changed in the mirror, unchanged in water',
                'Unchanged in both', 'Changed in both'],
      answer: 1,
      whyRight: `Exactly. B, O and X are all <b>water-safe</b> (top–bottom symmetric), so the water
                 image is unchanged. In a <b>mirror</b>, B is not left–right symmetric and the order
                 reverses to XOB — so it changes.`,
      whyWrong: `Take the two axes separately.<br><br>
                 <b>Water (horizontal flip):</b> B, O and X are all top–bottom symmetric, and water
                 does not reverse the reading order. So BOX appears <b>unchanged</b>.<br><br>
                 <b>Mirror (vertical flip):</b> B is <em>not</em> left–right symmetric, and the order
                 reverses to XOB as well. So it <b>changes</b>.<br><br>
                 The answer is: changed in the mirror, unchanged in water.`,
    },
  ],
};
