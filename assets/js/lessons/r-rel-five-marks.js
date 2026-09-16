/* ============================================================
   Reasoning · Unit 2 · Lesson 1 — The Five Marks
   ============================================================ */

import { familyTree, staticTree } from '../widgets/family-tree.js';

const TREE = {
  seed: [{ a: 'Mohan', rel: 'father', b: 'Ravi' }],
  presets: [
    { label: 'Uncle\'s daughter', sentences: [
      { a: 'Dad', rel: 'father', b: 'Me' },
      { a: 'Uncle', rel: 'brother', b: 'Dad' },
      { a: 'Priya', rel: 'daughter', b: 'Uncle' }] },
    { label: 'Three generations', sentences: [
      { a: 'Grandpa', rel: 'father', b: 'Dad' },
      { a: 'Grandma', rel: 'wife', b: 'Grandpa' },
      { a: 'Dad', rel: 'father', b: 'Me' },
      { a: 'Mom', rel: 'wife', b: 'Dad' },
      { a: 'Sara', rel: 'sister', b: 'Me' }] },
  ],
};

const MARKS_FIGURE = `
<svg viewBox="0 0 620 130" style="width:100%;max-width:620px;margin-inline:auto" role="img"
     aria-label="The five marks: square male, circle female, double line marriage, vertical line parent to child, gold line siblings">
  <g font-family="inherit" font-size="11.5" font-weight="700" fill="#938878" text-anchor="middle">
    <rect x="34" y="26" width="38" height="38" rx="7" fill="#3b6ea5"/>
    <text x="53" y="51" fill="#fff" font-size="15" font-weight="800">M</text>
    <text x="53" y="88">square</text><text x="53" y="103">male</text>

    <circle cx="163" cy="45" r="20" fill="#c0557a"/>
    <text x="163" y="51" fill="#fff" font-size="15" font-weight="800">F</text>
    <text x="163" y="88">circle</text><text x="163" y="103">female</text>

    <rect x="248" y="26" width="34" height="34" rx="6" fill="#3b6ea5"/>
    <circle cx="330" cy="43" r="17" fill="#c0557a"/>
    <line x1="284" y1="39" x2="311" y2="39" stroke="#8c3b2e" stroke-width="2.6"/>
    <line x1="284" y1="47" x2="311" y2="47" stroke="#8c3b2e" stroke-width="2.6"/>
    <text x="289" y="88">double line</text><text x="289" y="103">marriage</text>

    <rect x="410" y="16" width="32" height="32" rx="6" fill="#3b6ea5"/>
    <line x1="426" y1="48" x2="426" y2="66" stroke="#d8ccb9" stroke-width="2.6"/>
    <circle cx="426" cy="82" r="15" fill="#c0557a"/>
    <text x="426" y="112">vertical · parent → child</text>

    <rect x="524" y="28" width="30" height="30" rx="6" fill="#3b6ea5"/>
    <rect x="576" y="28" width="30" height="30" rx="6" fill="#3b6ea5"/>
    <line x1="539" y1="20" x2="591" y2="20" stroke="#c8901a" stroke-width="2.6"/>
    <line x1="539" y1="20" x2="539" y2="28" stroke="#c8901a" stroke-width="2.6"/>
    <line x1="591" y1="20" x2="591" y2="28" stroke="#c8901a" stroke-width="2.6"/>
    <text x="565" y="88">gold line</text><text x="565" y="103">siblings</text>
  </g>
</svg>`;

export default {
  id: 'r.rel.five-marks',
  title: 'The Five Marks',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../reasoning/',
  nextLabel: 'Back to the path',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'A riddle before anything else',
      say: `A traveller stands before a portrait in the City Palace and says:
            <b>"Brothers and sisters I have none, but that man's father is my father's son."</b><br><br>
            Who is in the portrait? Do not answer yet — you will get it wrong, as most do.
            By the end of this lesson you will not need to be clever. You will simply <b>read it off a drawing</b>.`,
      cta: 'Show me how',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Every family puzzle uses only five marks',
      say: `Aunts, in-laws, maternal cousins, "the only son of" — all of it is drawn with
            <b>five marks and nothing else</b>. Learn these and no sentence can tangle you.`,
      figure: MARKS_FIGURE,
      body: `
        <p>Two of these marks carry information you are usually <b>told</b>, and three carry information you must <b>infer</b>:</p>
        <ul>
          <li><b>Square and circle</b> fix gender. A relation word always fixes it for you — a "mother" can only be a circle.</li>
          <li><b>The double line</b> joins a couple. It never changes anyone's level.</li>
          <li><b>The vertical line</b> drops exactly one generation. This is the only mark that moves you down.</li>
          <li><b>The gold line</b> joins people on the same level who share parents.</li>
        </ul>
        <p>That last distinction is the whole game: <b>marriage moves you sideways, parenthood moves you down.</b></p>`,
      cta: 'Let me try drawing',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Say a relation. Watch it become a diagram.',
      say: `State relations the way an exam states them. I will draw. Notice that you never
            tell me anyone's gender — the <b>relation word</b> does that for you.`,
      widget: familyTree(TREE),
      __cfg: TREE,
      tasks: [
        { label: 'Add a <b>parent → child</b> relation (father / mother / son / daughter)',
          done: s => s.types.has('parent') },
        { label: 'Add a <b>marriage</b> — see that both partners stay on the same level',
          done: s => s.types.has('spouse') },
        { label: 'Add a <b>sibling</b> pair',
          done: s => s.types.has('sib') },
        { label: 'Build a family spanning <b>three generations</b>',
          done: s => s.generations >= 3 },
      ],
      onComplete: 'Good. You now have the whole notation. Everything after this is just reading.',
      ctaDone: 'I can draw it',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'only-son-trap', conceptLabel: 'The "only son / only daughter" trap',
      say: `Before I explain anything — commit to an answer. Being wrong here is useful; being told first is not.`,
      context: `Pointing to a photograph, Ravi said: <b>"She is the daughter of my grandfather's only son."</b>`,
      q: 'How is the girl in the photograph related to Ravi?',
      options: ['His cousin', 'His sister', 'His aunt', 'His daughter'],
      answer: 1,
      whyRight: `Exactly. <b>"My grandfather's only son"</b> cannot be an uncle — if Ravi's grandfather had only one son,
                 that son must be Ravi's own father. So the girl is his father's daughter: his <b>sister</b>.`,
      whyWrong: `The trap is the word <b>"only"</b>. Most people read "grandfather's son" as an uncle and answer "cousin".
                 But if the grandfather has <b>only one</b> son, that son has to be Ravi's own father —
                 so the girl is Ravi's father's daughter. Watch it drawn on the next screen.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Read it off the drawing',
      say: `Three marks. No memory required.`,
      steps: [
        `<b>Anchor the speaker.</b> Ravi is the one talking, so put him at level 0 and break the sentence at every "of": <em>[daughter] of [my grandfather's only son]</em>.`,
        `<b>Resolve the innermost phrase first.</b> Grandfather's <b>only</b> son — Ravi exists, so Ravi's father is a son of the grandfather. "Only" means there is no second son. Therefore that son <em>is</em> Ravi's father.`,
        `<b>Drop one level.</b> The girl is the <b>daughter of Ravi's father</b> — a circle hanging below the same father Ravi hangs from.`,
        `<b>Read the shape.</b> Same level as Ravi, joined through the same parent, female → <b>sister</b>. You did not recall a rule; you looked at a picture.`,
      ],
      // Ravi is stated first so HE anchors level 0, exactly as step 1 instructs.
      // Every person is the SUBJECT of at least one relation, so no gender stays unknown.
      widget: staticTree([
        { a: 'Ravi', rel: 'son', b: 'Father' },
        { a: 'Girl', rel: 'daughter', b: 'Father' },
        { a: 'Father', rel: 'son', b: 'Grandfather' },
        { a: 'Grandfather', rel: 'father', b: 'Father' },
      ]),
      takeaway: `"Only son" / "only daughter" is never decoration. It exists to force one person's identity — always resolve that phrase first.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'relation-chain', conceptLabel: 'Reading a relation chain',
      context: `<b>A</b> is <b>B</b>'s sister. <b>C</b> is <b>B</b>'s mother. <b>D</b> is <b>C</b>'s father.`,
      q: 'How is A related to D?',
      options: ['Granddaughter', 'Daughter', 'Aunt', 'Niece'],
      answer: 0,
      why: `Anchor B at level 0. A is B's sister — same level, female. C is their mother, one level up (+1).
            D is C's father, one more up (+2). A sits <b>two levels below D</b> and is female → <b>granddaughter</b>.
            Notice you counted levels rather than reciting relationship names.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'self-reference', conceptLabel: 'Spotting a self-reference',
      context: `Introducing a man, a woman from Bikaner said: <b>"His wife is the only daughter of my father."</b>`,
      q: 'How is the man related to the woman?',
      options: ['Her brother', 'Her father-in-law', 'Her husband', 'Her uncle'],
      answer: 2,
      why: `"The only daughter of my father" — the speaker is a woman, and her father has only one daughter.
            That daughter is <b>the speaker herself</b>. So "his wife" is the woman speaking, which makes the man her <b>husband</b>.
            These puzzles love hiding you inside your own description.`,
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'only-son-trap', conceptLabel: 'The "only son / only daughter" trap',
      say: `Now. The portrait in the City Palace. You have every tool you need.`,
      context: `<b>"Brothers and sisters I have none, but that man's father is my father's son."</b>`,
      q: 'Who is the man in the portrait?',
      options: ['The speaker himself', 'The speaker\'s son', 'The speaker\'s father', 'The speaker\'s nephew'],
      answer: 1,
      whyRight: `Precisely. "My father's son" — and the speaker has no brothers — so that phrase means
                 <b>the speaker himself</b>. The sentence becomes "that man's father is me", which makes the man
                 in the portrait the speaker's <b>son</b>. Same trick as the grandfather: resolve the inner phrase first.`,
      whyWrong: `Work inward. "My father's son" — the speaker has <b>no brothers</b>, so the only son of his father is
                 <b>the speaker himself</b>. Substitute that back: "that man's father is <em>me</em>."
                 If you are that man's father, the man is your <b>son</b>.`,
    },
  ],
};
