/* ============================================================
   Reasoning · Unit 1 · Lesson 1 — Anatomy of a Trap
   ============================================================ */

import { claimScanner } from '../widgets/claim-lab.js';

const SUBSIDY = {
  statement: `Following three years of drought, the State has announced a subsidy on
              drip-irrigation equipment for farmers in Barmer district.`,
  atoms: [
    { key: 'subsidy',   label: 'A drip-irrigation subsidy has been announced', short: 'subsidy announced', fixed: true },
    { key: 'drought',   label: 'There have been three years of drought',       short: 'three years of drought', fixed: true },
    { key: 'forBarmer', label: 'It covers farmers in Barmer district',         short: 'covers Barmer', fixed: true },
    { key: 'caused',    label: 'The drought is <b>why</b> it was announced',   short: 'drought was the reason' },
    { key: 'othersToo', label: 'Some other district gets it as well',          short: 'another district too' },
    { key: 'buy',       label: 'Barmer farmers will buy the equipment',        short: 'farmers will buy' },
    { key: 'saves',     label: 'Drip irrigation uses less water than flooding', short: 'drip saves water' },
    { key: 'enough',    label: 'The subsidy is large enough to change behaviour', short: 'subsidy is enough' },
  ],
  claims: [
    { text: 'A subsidy on drip equipment has been announced for farmers in Barmer.',
      needs: w => w.subsidy && w.forBarmer, trap: null },
    { text: 'The three years of drought are the reason for the announcement.',
      needs: w => w.caused, trap: 'Cause smuggled in' },
    { text: 'No district other than Barmer receives this subsidy.',
      needs: w => !w.othersToo, trap: 'Scope creep' },
    { text: 'Farmers in Barmer will now buy drip-irrigation equipment.',
      needs: w => w.buy, trap: 'Future leap' },
    { text: 'Drip irrigation uses less water than flood irrigation.',
      needs: w => w.saves, trap: 'Outside knowledge' },
    { text: 'The subsidy is big enough to change how Barmer farmers irrigate.',
      needs: w => w.enough, trap: 'Quantity leap' },
  ],
};

export default {
  id: 'r.found.anatomy',
  title: 'Anatomy of a Trap',
  xp: 30,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.found.assume',
  nextLabel: 'Next: Statement & Assumption →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The examiner is not testing what you know',
      say: `Three years of drought, and the State announces a subsidy on drip irrigation
            in Barmer.<br><br>
            Now — <b>did the drought cause the announcement?</b><br><br>
            You said yes. Everyone says yes. Read the sentence again: it says
            <em>following</em>. That is a word about <b>time</b>, not about <b>cause</b>.
            One word, and the mark is gone.`,
      cta: 'Show me how they do it',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Six ways to hide the answer in plain sight',
      say: `This whole unit rests on one sentence: <b>the statement is all the evidence you have.</b>
            Not what you know. Not what is obviously true. Only what the words commit you to.`,
      body: `
        <p>A wrong option is almost never nonsense — that would be too easy to reject. It is the
           statement with <b>one thing added</b> that the statement never said. There are six
           standard additions, and after this unit you will see them coming.</p>
        <ol>
          <li><b>Scope creep.</b> The statement says something about Barmer; the option quietly says
              <em>only</em> Barmer. Watch for <em>all, only, every, none, always</em> appearing
              from nowhere.</li>
          <li><b>Cause smuggled in.</b> The statement puts two things side by side —
              <em>following</em>, <em>amid</em>, <em>after</em>, <em>along with</em> — and the option
              turns the join into <em>because</em>.</li>
          <li><b>Future leap.</b> The statement reports a step taken; the option reports the result
              it was meant to achieve. Announcing a subsidy is not the same as anyone taking it.</li>
          <li><b>Outside knowledge.</b> The option is perfectly true — you learnt it in school — and
              still wrong, because this sentence never said it. The hardest one to refuse.</li>
          <li><b>Quantity leap.</b> <em>Some</em> becomes <em>most</em>; a subsidy becomes a
              <em>sufficient</em> subsidy; a rise becomes a <em>sharp</em> rise.</li>
          <li><b>Reversal.</b> "Everyone who cleared the interview had cleared the written test"
              becomes "everyone who cleared the written test cleared the interview". The arrow is
              turned round while you are not looking.</li>
        </ol>
        <p><b>The test that kills all six.</b> Ask: <em>could the statement be entirely true and this
           option still false?</em> If you can describe one such situation — even a strange one —
           the option does not follow. That is the same counterexample move you will use on
           syllogisms later, and it works here without a single circle drawn.</p>`,
      cta: 'Let me try it on the subsidy',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Everything the sentence leaves open',
      say: `Three facts are <b>fixed</b> — the statement asserts them, so you cannot touch them.
            Everything else is <b>open</b>, and open means you may set it however you like.<br><br>
            Set the open facts to make each proposed conclusion <b>false</b>. Every one you can
            break was never a conclusion at all.`,
      widget: claimScanner(SUBSIDY),
      __cfg: SUBSIDY,
      tasks: [
        { label: 'Break at least one proposed conclusion', done: s => s.broken >= 1 },
        { label: 'Break <b>every</b> conclusion that can be broken', done: s => s.brokeEveryBreakable },
        { label: 'Run the full scan and find the one that survives', done: s => s.scanned },
      ],
      onComplete: `Five of the six died the moment you were allowed to choose. Only the one that
                   merely repeats the sentence survived — and that is what "follows" means.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'statement-is-all', conceptLabel: 'The statement is the only evidence',
      say: `Before the explanation — commit.`,
      context: `<b>Following three years of drought, the State has announced a subsidy on
                drip-irrigation equipment for farmers in Barmer district.</b>`,
      q: 'Why does "the drought caused the announcement" fail?',
      options: [
        'Because droughts do not affect government policy',
        'Because the statement joins the two in time, never in cause',
        'Because the subsidy was announced before the drought',
        'Because three years is too short a period to matter',
      ],
      answer: 1,
      whyRight: `Exactly. <em>Following</em> places one event after another and stops there. A world
                 in which the subsidy was planned for years and the drought merely arrived first is
                 completely consistent with the sentence — so cause does not follow.`,
      whyWrong: `The trap is not about droughts or policy. It is about one word.<br><br>
                 <em>Following</em> is a <b>time</b> word. It tells you the order of two events and
                 nothing whatever about why either happened. To conclude cause you would need the
                 sentence to say so — <em>because of</em>, <em>in response to</em>, <em>citing</em>.<br><br>
                 Imagine the subsidy had been in the budget for two years and the drought simply
                 happened first. Every word of the statement is still true. That is your
                 counterexample, and it settles it.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'One survivor, five corpses',
      say: `Look at what separates the one that lived from the five that died.`,
      steps: [
        `<b>"A subsidy has been announced for farmers in Barmer."</b> — this is the sentence with
         its own words rearranged. It adds nothing, so there is nothing to attack. <b>It follows.</b>`,
        `<b>"The drought is the reason."</b> — adds <em>cause</em> to a sentence that offered only
         <em>sequence</em>. Counterexample: the subsidy was already planned. <b>Dead.</b>`,
        `<b>"No other district receives it."</b> — adds <em>only</em>. The sentence tells you Barmer
         is covered; it never says Barmer alone is. Counterexample: Jalore gets it too. <b>Dead.</b>`,
        `<b>"Farmers will now buy the equipment."</b> — adds the <em>outcome</em> to an announcement.
         Counterexample: the scheme is announced and nobody applies. <b>Dead.</b>`,
        `<b>"Drip irrigation uses less water."</b> — true in the world, absent from the sentence.
         This is the one that hurts, because refusing it feels like refusing a fact. You are not
         refusing it; you are refusing to <em>use</em> it. <b>Dead.</b>`,
        `<b>"The subsidy is big enough."</b> — adds a <em>size</em> nobody stated. Counterexample:
         it covers two per cent of the cost. <b>Dead.</b>`,
      ],
      takeaway: `A conclusion that follows is nearly always duller than the ones that do not.
                 If an option feels like it is telling you something new, that is not insight —
                 that is the addition you are supposed to catch.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'trap-reversal', conceptLabel: 'Reversing the arrow',
      context: `<b>Every candidate who cleared the interview had cleared the written test.</b>`,
      q: 'Which of these follows?',
      options: [
        'Every candidate who cleared the written test cleared the interview',
        'A candidate who failed the written test did not clear the interview',
        'Most candidates who cleared the written test cleared the interview',
        'The written test is harder than the interview',
      ],
      answer: 1,
      why: `The sentence points one way only: interview&nbsp;→&nbsp;written.<br><br>
            <b>Option 1</b> turns the arrow round. Counterexample: five hundred cleared the written
            test and three cleared the interview. Statement true, option false. Dead.<br><br>
            <b>Option 2 is the same arrow read backwards, which is legitimate</b> — if clearing the
            interview guarantees the written test, then failing the written test rules out the
            interview. That is the <em>contrapositive</em>, and it is the one reversal that is
            always safe.<br><br>
            <b>Option 3</b> adds a quantity nobody gave. <b>Option 4</b> adds difficulty, which the
            sentence never mentions.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'trap-quantity', conceptLabel: 'Quantity words nobody said',
      context: `<b>Some villages in the block now have piped water.</b>`,
      q: 'Which one follows?',
      options: [
        'Most villages in the block have piped water',
        'At least one village in the block has piped water',
        'Some villages in the block have no piped water',
        'Piped water reached the block recently',
      ],
      answer: 1,
      whyRight: `Yes. <em>Some</em> guarantees <b>at least one</b> and guarantees nothing else.
                 Everything past that number is an addition.`,
      whyWrong: `Take <em>some</em> at exactly its worth: <b>at least one</b>. No more, no less.<br><br>
                 <b>Most</b> needs more than half — never stated. <b>"Some villages have no piped
                 water"</b> feels like the natural partner, but "some" does not promise that the rest
                 are excluded: it is consistent with <em>every</em> village having it. And
                 <b>recently</b> smuggles in time from the word <em>now</em>, which only tells you
                 the present state.<br><br>
                 Only <b>at least one</b> survives.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'statement-is-all', conceptLabel: 'The statement is the only evidence',
      say: `All six traps are in front of you at once. Find the sentence that adds nothing.`,
      context: `<b>Amid a rise in dengue cases, the municipal corporation has begun fogging
                operations in four wards of the city.</b>`,
      q: 'Which conclusion follows?',
      options: [
        'Fogging will bring dengue cases down in those four wards',
        'Dengue cases rose because the corporation had stopped fogging',
        'Fogging operations have begun in four wards of the city',
        'The remaining wards have no dengue cases',
      ],
      answer: 2,
      whyRight: `Correct — and notice how little it says. It repeats the sentence and stops, which is
                 precisely why nothing can break it.`,
      whyWrong: `Check each addition against the sentence.<br><br>
                 <b>"Fogging will bring cases down"</b> — <em>future leap</em>. A step taken is not a
                 result achieved; the fogging may fail entirely.<br><br>
                 <b>"Cases rose because fogging had stopped"</b> — <em>cause smuggled in</em>, and
                 invented at both ends: <em>amid</em> is a time word, and the sentence never says
                 fogging ever stopped.<br><br>
                 <b>"The remaining wards have no dengue"</b> — <em>scope creep</em>. Four wards are
                 being fogged; nothing is claimed about the others.<br><br>
                 <b>"Fogging has begun in four wards"</b> — the sentence, returned unchanged.
                 That is the answer.`,
    },
  ],
};
