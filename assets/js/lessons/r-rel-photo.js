/* ============================================================
   Reasoning · Unit 2 · Lesson 3 — Pointing at a Photograph
   ============================================================ */

import { phrasePeeler } from '../widgets/phrase-peeler.js';

const PHOTO = {
  speaker: 'Pointing to a boy, a woman said:',
  quote: 'He is the son of the only sister of my mother',
  answer: 'her cousin (her maternal aunt\'s son)',
  layers: [
    {
      inner: 'the only sister of my mother',
      resolves: 'the speaker\'s maternal aunt',
      why: 'The deepest bracket. "Only sister" fixes her as one specific person — the speaker\'s mother has exactly one sister, so this is the speaker\'s maternal aunt (mausi).',
      becomes: 'He is the son of my maternal aunt',
      hint: 'Start with the phrase that has no other "of" inside it.',
    },
    {
      inner: 'the son of my maternal aunt',
      resolves: 'the speaker\'s cousin',
      why: 'One person left to place. The aunt is one rung above the speaker, so her son drops back to the speaker\'s own rung — a cousin.',
      becomes: 'He is my cousin',
      hint: 'One "of" remains. Resolve it and the sentence is finished.',
    },
  ],
};
import { staticTree } from '../widgets/family-tree.js';

export default {
  id: 'r.rel.photo',
  title: 'Pointing at a Photograph',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.rel.coded',
  nextLabel: 'Next: Coded Relations →',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The sentence is built to be read wrongly',
      say: `Pointing to a lady, a man said:<br>
            <b>"She is the only daughter of my wife's father's only child."</b><br><br>
            Read that left to right and you will drown — wife, father, child, daughter, four people
            arriving faster than you can place them.<br><br>
            There is a technique that makes it trivial, and it is the opposite of reading normally.
            By the end you will answer this in two moves.`,
      cta: 'Show me the technique',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Read from the inside out',
      say: `The examiner nests phrases deliberately, because nesting is where working memory fails.
            So do not hold the sentence — <b>collapse it</b>.`,
      body: `
        <p>The method has three moves, and you repeat them until one person is left:</p>
        <ol>
          <li><b>Find the innermost "of".</b> That is the phrase with no further "of" inside it — the deepest bracket.</li>
          <li><b>Resolve it to exactly one person.</b> Not a description, a <em>person</em>: "my father", "the speaker herself", "her brother".</li>
          <li><b>Substitute and repeat.</b> The sentence gets shorter every pass. It cannot fight back.</li>
        </ol>
        <p>Two things decide almost every one of these questions:</p>
        <ul>
          <li><b>The word "only".</b> "My grandfather's only son" cannot be an uncle — it must be your father.
              "Only" exists to force one identity, never for flavour.</li>
          <li><b>The speaker's own gender.</b> "The only daughter of my father", said by a woman, is <em>the woman herself</em>.
              Said by a man, it is his sister. Same words, different answer.</li>
        </ul>`,
      cta: 'Let me peel one',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Peel it, one layer at a time',
      say: `Here is a different sentence. Resolve the innermost phrase and watch it collapse.
            Notice you never need to picture all four people at once — only two, briefly.`,
      widget: phrasePeeler(PHOTO),
      __cfg: PHOTO,
      tasks: [
        { label: 'Peel the sentence all the way down to one person', done: s => s.finished },
      ],
      onComplete: 'Two passes, four people, and you never held more than two in your head at once.',
      ctaDone: 'Test me',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'speaker-gender', conceptLabel: 'Using the speaker\'s own gender',
      say: `Commit first. Pay attention to <b>who is speaking</b> — that is not decoration either.`,
      context: `Pointing to a man, a <b>woman</b> said: <b>"His mother is the only daughter of my mother."</b>`,
      q: 'How is the man related to the woman?',
      options: ['Her brother', 'Her son', 'Her husband', 'Her father'],
      answer: 1,
      whyRight: `Correct. "The only daughter of my mother" — the speaker <em>is</em> a woman, and her mother
                 has exactly one daughter, so that daughter is <b>the speaker herself</b>.
                 The sentence becomes "his mother is me", which makes the man her <b>son</b>.`,
      whyWrong: `The key is that the speaker is a <b>woman</b>. Her mother has only one daughter — and the
                 speaker is a daughter of her mother. So "the only daughter of my mother" is
                 <b>the speaker herself</b>.<br><br>
                 Substitute: "His mother is <em>me</em>." If you are his mother, he is your <b>son</b>.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Where people go wrong, and why',
      say: `Three traps live in these questions. All three are defeated by the same habit.`,
      steps: [
        `<b>Trap 1 — reading forwards.</b> The sentence is nested on purpose. Always locate the innermost "of" and resolve that first, no matter where it sits in the sentence.`,
        `<b>Trap 2 — ignoring "only".</b> "Only son", "only daughter", "only child" collapse a whole branch of the family to a single person. Circle that word the moment you see it.`,
        `<b>Trap 3 — forgetting who is talking.</b> "The only daughter of my father" is the speaker herself if a woman says it, and the speaker's sister if a man says it. Check the gender of the speaker <em>before</em> you resolve anything.`,
        `<b>Then just draw.</b> Once the sentence is one person long, place them on the tree and read the level gap off the diagram — exactly as in The Five Marks.`,
      ],
      widget: staticTree([
        { a: 'Woman', rel: 'daughter', b: 'Mother' },
        { a: 'Man', rel: 'son', b: 'Woman' },
      ]),
      takeaway: `Innermost "of" first · circle every "only" · check the speaker's gender. In that order, every photograph question collapses in two or three passes.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'only-word', conceptLabel: 'The word "only" forces an identity',
      context: `Pointing at a photograph, <b>Reena</b> said: <b>"He is the son of my grandfather's only son."</b>`,
      q: 'How is he related to Reena?',
      options: ['Her cousin', 'Her brother', 'Her uncle', 'Her nephew'],
      answer: 1,
      why: `Innermost first: "my grandfather's <b>only</b> son". Reena's grandfather has exactly one son —
            and Reena's father must be a son of her grandfather. So that only son <b>is Reena's father</b>.
            Substitute: "He is the son of my father" → her <b>brother</b>.
            Drop the word "only" and the answer would legitimately become "cousin" — that single word is the question.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'speaker-gender', conceptLabel: 'Using the speaker\'s own gender',
      context: `Introducing a man, a <b>woman</b> said: <b>"He is the only son of the mother of my daughter."</b>`,
      q: 'How is the man related to the woman?',
      options: ['Her husband', 'Her brother', 'Her son', 'Her father'],
      answer: 2,
      why: `"The mother of my daughter" — the speaker is a woman and her daughter's mother is
            <b>the speaker herself</b>. Substitute: "He is the only son of <em>me</em>" → her <b>son</b>.
            Self-reference is the whole trick: the speaker keeps hiding inside her own description.`,
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'nested-phrase', conceptLabel: 'Collapsing a nested phrase',
      say: `The sentence from the start. Two passes. Innermost first.`,
      context: `Pointing to a lady, a <b>man</b> said: <b>"She is the only daughter of my wife's father's only child."</b>`,
      q: 'How is the lady related to the man?',
      options: ['His sister', 'His wife', 'His daughter', 'His niece'],
      answer: 2,
      whyRight: `Precisely. Pass one: "my wife's father's <b>only child</b>" — his wife's father has exactly
                 one child, and the wife is a child of her father, so that only child <b>is the wife</b>.
                 Pass two: "the only daughter of <em>my wife</em>" — that is the man's own <b>daughter</b>.`,
      whyWrong: `Two passes, innermost first.<br><br>
                 <b>Pass 1:</b> "my wife's father's <b>only child</b>". The wife is a child of her own father,
                 and there is only one child — so that child <em>is the wife</em>.
                 The sentence becomes: "She is the only daughter of my wife."<br><br>
                 <b>Pass 2:</b> the only daughter of his wife is also his own child → the lady is his <b>daughter</b>.`,
    },
  ],
};
