/* ============================================================
   Reasoning · Unit 1 · Lesson 3 — Statement & Argument
   ============================================================ */

import { relevanceTest } from '../widgets/claim-lab.js';

const SOLAR = {
  proposal: `Should Rajasthan require every new government building to carry rooftop solar?`,
  goalLabel: `whether the requirement would actually cut the state's power bill`,
  atoms: [
    { key: 'daytime',     label: 'Government buildings draw most of their power in daylight', short: 'daytime demand' },
    { key: 'capital',     label: 'The state can fund the up-front cost',                      short: 'money available' },
    { key: 'otherStates', label: 'Other states have already made it compulsory',              short: 'others do it' },
    { key: 'example',     label: 'Government ought to set an example',                        short: 'sets an example' },
    { key: 'popular',     label: 'The move would be popular with voters',                     short: 'popular' },
  ],
  reaches: w => w.daytime && w.capital,
  /* `strong` is never read by the widget — it is what the lesson CLAIMS, so the
     harness can re-derive relevance itself and shout if the two disagree. */
  args: [
    { key: 'daytime', side: 'for', strong: true,
      text: 'Government buildings draw most of their power in daylight — exactly when a rooftop array produces it.' },
    { key: 'capital', side: 'against', strong: true,
      text: 'The up-front cost is heavy and the state capital budget is already committed.' },
    { key: 'otherStates', side: 'against', strong: false,
      text: 'No other state has made it compulsory.' },
    { key: 'example', side: 'for', strong: false,
      text: 'Government should always set an example for its citizens.' },
    { key: 'popular', side: 'for', strong: false,
      text: 'The move would be popular with voters.' },
  ],
};

export default {
  id: 'r.found.argument',
  title: 'Statement & Argument',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.found.action',
  nextLabel: 'Next: Course of Action →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Loud is not strong',
      say: `<em>"No other state has made it compulsory."</em><br><br>
            Read it aloud. It sounds like an argument. It has a subject, a fact, an air of caution.<br><br>
            Now suppose it were the other way round — suppose every other state <b>had</b> made it
            compulsory. Would that change whether the rule works in Rajasthan?<br><br>
            No. Nothing moves. And an argument that cannot move the verdict is not a weak
            argument about the question — it is not about the question at all.`,
      cta: 'Show me the test',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'One question, asked of every argument',
      say: `Candidates try to judge arguments by how convincing they sound. That is a matter of
            taste, and taste is not markable. There is a mechanical question instead.`,
      body: `
        <p><b>Does the truth of this argument change the answer to the question being asked?</b></p>
        <p>Flip it. Suppose it true, then suppose it false. If the verdict on the proposal moves,
           the argument bears on the question — it is <b>strong</b>. If the verdict sits exactly
           where it was, the argument is <b>weak</b>, and no amount of eloquence will save it.</p>
        <p>Because the test is about <em>relevance and weight</em>, four familiar shapes fail it
           almost every time:</p>
        <ul>
          <li><b>The comparison.</b> "No other state does this." Other states are not the question.</li>
          <li><b>The tradition.</b> "It has always been done this way." Age is not a reason.</li>
          <li><b>The truism.</b> "Water is precious." True, and it argues for nothing in particular.</li>
          <li><b>The restatement.</b> "Yes, because such a service is needed." This is the question
              with a "yes" in front of it. It adds no evidence at all — and it is the one that most
              often gets ticked, because agreeing with yourself feels like reasoning.</li>
        </ul>
        <p><b>And length never wins.</b> A strong argument can be nine words if those words bear on
           the outcome. A weak one can run three lines and still be about nothing.</p>`,
      cta: 'Give me the proposal',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Flip each argument and watch the verdict',
      say: `Five arguments about compulsory rooftop solar. Flip each one true ↔ false.<br><br>
            I will search every world for a case where the flip changes whether the proposal
            reaches its goal. Find one and the argument is strong. Find none and it is decoration.`,
      widget: relevanceTest(SOLAR),
      __cfg: SOLAR,
      tasks: [
        { label: 'Flip every argument at least once', done: s => s.testedAll },
        { label: 'Find one where the verdict <b>moves</b>', done: s => s.sawStrong },
        { label: 'Find one where nothing moves at all', done: s => s.sawWeak },
      ],
      onComplete: `Two moved the verdict, three could not move anything. Notice that the two strong
                   ones sit on opposite sides — strength has nothing to do with which side you take.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'argument-relevance', conceptLabel: 'Strength is relevance, not force',
      say: `Commit first.`,
      context: `<b>Should Rajasthan require every new government building to carry rooftop solar?</b>`,
      q: 'Which argument is strong?',
      options: [
        'No — no other state has made it compulsory',
        'Yes — government should set an example for citizens',
        'No — the up-front cost is heavy and the capital budget is already committed',
        'Yes — the move would be popular with voters',
      ],
      answer: 2,
      whyRight: `Correct. Flip it: with money available the rule can work, without it the rule
                 cannot be carried out. The verdict moves, so the argument bears on the question.`,
      whyWrong: `Flip each one and watch the verdict, not the tone.<br><br>
                 <b>No other state does it</b> → suppose they all did. Does the rule now work in
                 Rajasthan? Nothing has changed. Weak.<br><br>
                 <b>Set an example</b> → suppose government need not set an example. Does the rule
                 still cut the power bill? Yes, exactly as before. Weak — a truism argues for
                 everything and therefore for nothing.<br><br>
                 <b>Popular with voters</b> → popularity is not the question asked. Weak.<br><br>
                 <b>The cost is heavy and the budget committed</b> → this one <em>changes the
                 outcome</em>. Strong, and it happens to be against.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Two that move it, three that cannot',
      say: `Sorted by the test, not by how they read.`,
      steps: [
        `<b>Daylight demand — strong.</b> If government buildings really do draw their power when
         the sun is up, the arrays displace expensive daytime purchase. Deny it and the rule buys
         panels that generate when nobody is using anything. The verdict moves both ways.`,
        `<b>Cost and budget — strong.</b> Whether the money exists decides whether the rule can be
         carried out at all. Note that this argument is <em>against</em> the proposal: strength is
         about bearing on the question, never about which side you are on.`,
        `<b>No other state does it — weak.</b> The widget searched every world and never found one
         where flipping it changed the outcome. Other states are simply not part of the question.`,
        `<b>Government should set an example — weak.</b> A sentiment nobody disputes, which is
         precisely the problem: it would support any proposal whatsoever, so it distinguishes
         nothing.`,
        `<b>It would be popular — weak.</b> Popularity might decide whether the rule is
         <em>passed</em>. It cannot decide whether it <em>works</em>, and the question asked about
         working.`,
      ],
      takeaway: `Flip it. If the verdict does not move, the argument is not about the question —
                 and the examiner is asking about the question, not about your sympathies.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'argument-restatement', conceptLabel: 'The restatement that pretends to be a reason',
      context: `<b>Should the state introduce a night bus service between Jaipur and Kota?</b>`,
      q: 'Which argument is strong?',
      options: [
        'Yes — a night service is badly needed on that route',
        'No — fewer than twenty passengers travel that route after 10 p.m., so every trip would run at a loss',
        'Yes — Gujarat already runs night buses on its main routes',
        'No — travelling at night is dangerous',
      ],
      answer: 1,
      whyRight: `Yes. It brings a fact that bears directly on whether the service can be run, and
                 the verdict moves with it.`,
      whyWrong: `<b>"A night service is badly needed"</b> is the question with a <em>yes</em> in
                 front of it. Strip the words and it says: it should be introduced because it should
                 be introduced. No evidence has entered the room. This is the restatement, and it is
                 the commonest wrong tick in the topic.<br><br>
                 <b>"Gujarat runs night buses"</b> — another state is not this route.<br><br>
                 <b>"Travelling at night is dangerous"</b> — vague, unquantified, and equally an
                 argument against every night service that already runs safely.<br><br>
                 <b>"Fewer than twenty passengers after 10 p.m."</b> — a fact, about this route, that
                 decides the matter. Strong.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'argument-length', conceptLabel: 'Length is not strength',
      context: `<b>Should the state cap class size at 40 students?</b><br><br>
                <b>I.</b> No. Education is the foundation of a nation, and our teachers have served
                with dedication for generations; interference with their conditions must be resisted
                in the interest of the country's future.<br>
                <b>II.</b> Yes. The state already has enough classrooms and teachers to seat every
                class at 40 without recruiting anyone.`,
      q: 'Which is strong?',
      options: ['Only I', 'Only II', 'Both I and II', 'Neither'],
      answer: 1,
      whyRight: `Correct. II is two lines shorter and settles the practical question outright:
                 the cap can be met with what already exists.`,
      whyWrong: `Count the words, then ignore the count.<br><br>
                 <b>I</b> is long, grave and moving, and it never touches class size. Foundations,
                 dedication, the country's future — flip any of it and the cap works or fails
                 exactly as before. It is three truisms in a coat.<br><br>
                 <b>II</b> is short and decides the matter: if the classrooms and teachers already
                 exist, the objection that the cap is impractical disappears.<br><br>
                 Examiners build long weak options deliberately, because effort reads as substance.
                 Judge by what moves the verdict.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'argument-relevance', conceptLabel: 'Strength is relevance, not force',
      say: `Four arguments, one question. Flip each before you choose.`,
      context: `<b>Should Rajasthan ban water-intensive crops in blocks where groundwater is
                already over-extracted?</b>`,
      q: 'Which argument is strong?',
      options: [
        'No — farmers in those blocks have grown these crops for generations',
        'Yes — those blocks already draw more groundwater each year than the rains put back, so nothing else will stop the table falling',
        'No — no other state bans particular crops',
        'Yes — water is precious and must be conserved',
      ],
      answer: 1,
      whyRight: `Exactly. It supplies the fact the question turns on — extraction exceeding recharge
                 — and flipping it flips the verdict. Everything else on the list would read the
                 same whatever the water table was doing.`,
      whyWrong: `Three of these are the standard weak shapes, wearing local clothes.<br><br>
                 <b>Grown for generations</b> — the <em>tradition</em>. Suppose the crops were new
                 this year; would over-extraction matter less? No. Nothing moves.<br><br>
                 <b>No other state bans crops</b> — the <em>comparison</em>. Other states have other
                 water tables.<br><br>
                 <b>Water is precious</b> — the <em>truism</em>. Nobody disagrees, and it argues just
                 as well for banning swimming pools, so it settles nothing here.<br><br>
                 <b>Extraction exceeds recharge</b> — a measurable fact about these blocks that
                 decides whether the ban is needed. That is what strong looks like.`,
    },
  ],
};
