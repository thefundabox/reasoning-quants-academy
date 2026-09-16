/* ============================================================
   Reasoning · Unit 5 · Lesson 5 — Analogy & Odd One Out
   ============================================================ */

import { relationMapper } from '../widgets/relation-mapper.js';

const ANALOGY = {
  rounds: [
    { a: 'Pen', b: 'Write', rel: 'function',
      why: 'A pen is <em>used to</em> write — the second word is what the first one does.',
      c: 'Knife', options: ['Sharp', 'Cut', 'Kitchen', 'Metal'], answer: 1,
      applyWhy: '"A knife is used to <b>cut</b>." Sharp is a property, kitchen a location, metal a material — only <b>Cut</b> completes the same sentence.' },
    { a: 'Petal', b: 'Flower', rel: 'part',
      why: 'A petal is <em>a part of</em> a flower — and note the direction: part first, whole second.',
      c: 'Chapter', options: ['Book', 'Read', 'Page', 'Author'], answer: 0,
      applyWhy: '"A chapter is a part of a <b>book</b>." Page is also a part of a book, but it is not the <em>whole</em> — the direction of the relationship decides it.' },
    { a: 'Judge', b: 'Court', rel: 'worker',
      why: 'A judge <em>works in</em> a court — worker first, workplace second.',
      c: 'Teacher', options: ['Student', 'School', 'Teach', 'Book'], answer: 1,
      applyWhy: '"A teacher works in a <b>school</b>." Teach would be the tool → function relationship, which belongs to a different question.' },
  ],
};

export default {
  id: 'r.code.analogy',
  title: 'Analogy & Odd One Out',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../reasoning/',
  nextLabel: 'Finish the unit',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Every option will look reasonable',
      say: `<b>Pen : Write :: Knife : ?</b> — with the options <b>Sharp</b>, <b>Cut</b>,
            <b>Kitchen</b>, <b>Metal</b>.<br><br>
            All four are true of a knife. That is deliberate. Analogy questions are not tests of
            vocabulary; they are tests of whether you can hold a <b>relationship</b> steady while the
            nouns change underneath it.<br><br>
            There is one habit that makes them nearly automatic, and almost nobody does it.`,
      cta: 'Tell me the habit',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Say the relationship out loud, before you read the options',
      say: `The options are designed to be plausible. If you look at them first, they will pull you
            toward whichever word feels most <em>associated</em> — and association is not relationship.`,
      body: `
        <p><b>The method, in one line:</b> turn the first pair into a sentence, then force the second
           pair to fit the same sentence.</p>
        <p>"A pen is used to <b>write</b>." Now: "A knife is used to ___." <b>Cut</b>. Sharp is a
           property, kitchen is a location, metal is a material — none of them completes
           <em>that sentence</em>.</p>
        <p><b>The relationships that recur:</b></p>
        <ul>
          <li><b>Tool → function</b> (Pen : Write) · <b>Part → whole</b> (Petal : Flower)</li>
          <li><b>Cause → effect</b> (Virus : Illness) · <b>Member → category</b> (Sparrow : Bird)</li>
          <li><b>Worker → workplace</b> (Judge : Court) · <b>Raw material → product</b> (Cotton : Cloth)</li>
          <li><b>Opposites</b> (Ancient : Modern) · <b>Degree</b> (Warm : Hot)</li>
        </ul>
        <p><b>Direction matters.</b> Petal : Flower is part → whole, so the answer pair must also run
           part → whole, not whole → part. Reversing the direction is the second commonest trap after
           choosing by association.</p>
        <p><b>Odd one out is the same skill inverted.</b> Instead of applying a rule, you hunt for the
           rule that covers <em>all but one</em>. Make the rule as specific as you can — a vague rule
           like "they are all things" fits everything and eliminates nothing.</p>`,
      cta: 'Let me name some',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Name it first. Then apply it.',
      say: `I will not show you the options until you have named the relationship. That order is
            the whole lesson — reverse it and the distractors do their work.`,
      widget: relationMapper(ANALOGY),
      __cfg: ANALOGY,
      tasks: [
        { label: 'Work through all three pairs', done: s => s.finished },
      ],
      onComplete: 'Notice how often the wrong option was true — just true of the wrong relationship.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'relation-direction', conceptLabel: 'Keeping the direction of a relationship',
      say: `Commit first. Say the sentence before you read the four words.`,
      context: `<b>Cotton : Cloth :: Clay : ?</b>`,
      q: 'Which word completes the analogy?',
      options: ['Soil', 'Pot', 'Wet', 'Potter'],
      answer: 1,
      whyRight: `Correct. The sentence is "cotton is the <b>raw material</b> made into cloth", so
                 "clay is the raw material made into a <b>pot</b>". Soil is what clay comes from
                 (that reverses the direction), potter is the worker, wet is a property.`,
      whyWrong: `Say the sentence first: <b>"Cotton is the raw material that is made into cloth."</b><br><br>
                 Now force clay into it: "Clay is the raw material that is made into a ___" → <b>Pot</b>.<br><br>
                 <b>Soil</b> is the trap: it is genuinely associated with clay, but it runs the
                 relationship <em>backwards</em> — soil is what clay comes from, not what it becomes.
                 Direction is the whole question.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Four moves, and the distractors stop working',
      say: `The same routine every time, whether the question is an analogy or an odd one out.`,
      steps: [
        `<b>Cover the options.</b> Physically, with your finger if it helps. Reading them first is what causes the error you are trying to avoid.`,
        `<b>Turn the first pair into a sentence.</b> Not a label — a sentence. "A pen is used to write." "A petal is part of a flower." The more specific the sentence, the fewer options survive.`,
        `<b>Check the direction.</b> Part → whole is not the same question as whole → part. Write the arrow down if the pair is reversible.`,
        `<b>Only now uncover the options,</b> and force each one into your sentence. Usually exactly one fits, and the others fail for visibly different reasons — property, location, material, or the same relationship backwards.`,
      ],
      takeaway: `Say the relationship as a sentence before you read the options. Every distractor is true of the noun; only one is true of the relationship.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'odd-one-out', conceptLabel: 'Finding the rule that covers all but one',
      context: `Find the odd one out: <b>Cricket · Hockey · Chess · Football</b>`,
      q: 'Which is the odd one out?',
      options: ['Cricket', 'Hockey', 'Chess', 'Football'],
      answer: 2,
      why: `Make the rule as <b>specific</b> as you can. "They are all games" covers all four and
            eliminates nothing — that is a useless rule.<br><br>
            Sharpen it: "They are all <b>outdoor games played with a ball or physical equipment on a
            field</b>." Cricket, hockey and football fit. <b>Chess</b> is an indoor board game.<br><br>
            The technique is always the same: keep narrowing the rule until exactly one item falls out.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'relation-direction', conceptLabel: 'Keeping the direction of a relationship',
      context: `<b>Doctor : Hospital :: Chef : ?</b>`,
      q: 'Which word completes the analogy?',
      options: ['Food', 'Kitchen', 'Cook', 'Knife'],
      answer: 1,
      why: `The sentence is <b>"A doctor works in a hospital"</b> — worker → workplace.<br><br>
            Force the chef into it: "A chef works in a <b>kitchen</b>."<br><br>
            <b>Food</b> is what a chef produces (worker → product), <b>cook</b> is a near-synonym,
            and <b>knife</b> is a tool. All three are genuinely connected to chefs — and all three
            answer a <em>different</em> question from the one asked.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'relation-sentence', conceptLabel: 'Naming the relationship as a sentence',
      say: `The pair from the start. Say the sentence, then choose.`,
      context: `<b>Pen : Write :: Knife : ?</b>`,
      q: 'Which word completes the analogy?',
      options: ['Sharp', 'Cut', 'Kitchen', 'Metal'],
      answer: 1,
      whyRight: `Exactly. "A pen is used to <b>write</b>" → "a knife is used to <b>cut</b>."
                 Tool → function, held steady while the nouns changed. Sharp, kitchen and metal are
                 all true of a knife and all answer different questions.`,
      whyWrong: `Say the sentence: <b>"A pen is used to write."</b> That is tool → function.<br><br>
                 Now: "A knife is used to ___." → <b>Cut</b>.<br><br>
                 The other three are all true of a knife, which is exactly why they were chosen —
                 <b>sharp</b> is a property, <b>kitchen</b> is a location, <b>metal</b> is a material.
                 None of them is a <em>function</em>.`,
    },
  ],
};
