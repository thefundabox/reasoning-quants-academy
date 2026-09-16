/* ============================================================
   Reasoning · Unit 6 · Lesson 2 — Syllogism Basics
   ============================================================ */

import { syllogismLab } from '../widgets/syllogism-lab.js';
import { contains, overlaps } from '../widgets/venn-sets.js';

const SOME_SOME = {
        statements: ['Some boys are students.', 'Some students are players.'],
        conclusion: 'Some boys are players.',
        order: ['Boys', 'Students', 'Players'],
        tests: {
          s1: c => overlaps(c.Boys, c.Students),
          s2: c => overlaps(c.Students, c.Players),
          concl: c => overlaps(c.Boys, c.Players),
        },
        arrangements: [
          { label: 'Players pulled close', circles: { Boys: { x: 130, r: 60 }, Students: { x: 200, r: 60 }, Players: { x: 240, r: 60 } } },
          { label: 'Players pushed away', circles: { Boys: { x: 110, r: 55 }, Students: { x: 200, r: 55 }, Players: { x: 300, r: 55 } } },
          { label: 'Players swallow the students', circles: { Boys: { x: 110, r: 50 }, Students: { x: 200, r: 45 }, Players: { x: 215, r: 110 } } },
        ],
      };

const ALL_ALL = {
        statements: ['All pens are books.', 'All books are chairs.'],
        conclusion: 'All pens are chairs.',
        order: ['Chairs', 'Books', 'Pens'],
        tests: {
          s1: c => contains(c.Books, c.Pens),
          s2: c => contains(c.Chairs, c.Books),
          concl: c => contains(c.Chairs, c.Pens),
        },
        arrangements: [
          { label: 'Pens tucked left', circles: { Pens: { x: 150, r: 25 }, Books: { x: 160, r: 55 }, Chairs: { x: 180, r: 100 } } },
          { label: 'Everything concentric', circles: { Pens: { x: 200, r: 18 }, Books: { x: 200, r: 60 }, Chairs: { x: 200, r: 110 } } },
          { label: 'Pens pushed to the edge', circles: { Pens: { x: 120, r: 20 }, Books: { x: 150, r: 70 }, Chairs: { x: 200, r: 130 } } },
        ],
      };

export default {
  id: 'r.log.syllogism',
  title: 'Syllogism Basics',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.log.break',
  nextLabel: 'Next: Breaking a Conclusion →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Two questions that feel identical',
      say: `<b>All pens are books. All books are chairs. So are all pens chairs?</b> Yes.<br><br>
            <b>Some boys are students. Some students are players. So are some boys players?</b><br><br>
            The second feels exactly like the first. It is not even close. One of them is forced by
            the statements; the other is merely <em>allowed</em> by them — and "allowed" earns no marks.`,
      cta: 'Show me the difference',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'A conclusion follows only if it is true in every drawing',
      say: `That single sentence decides every syllogism. Not "is it plausible", not "does it usually
            happen" — <b>can I draw the statements so that the conclusion fails?</b>`,
      body: `
        <p>The rules worth carrying, all of them consequences of that one test:</p>
        <ul>
          <li>✅ <b>All + All = All.</b> All pens are books, all books are chairs → all pens are chairs.
              Nesting is transitive, and there is no way to draw it otherwise.</li>
          <li>✅ <b>All A are B gives Some B are A.</b> The free conversion from the last lesson.</li>
          <li>❌ <b>Some + Some proves nothing.</b> The two "somes" can pick out completely different
              members. This is the single commonest wrong answer in the paper.</li>
          <li>❌ <b>A negative never yields a positive.</b> "No A is B" plus anything will not give you
              "some A are C".</li>
          <li>❌ <b>All + Some proves nothing about the far pair.</b> All A are B, some B are C — the
              Cs may all sit in the part of B outside A.</li>
        </ul>
        <p><b>Possibility is not the test.</b> A conclusion that <em>can</em> be true is worth nothing;
           it must be <em>unavoidable</em>. Beginners look for a drawing where the conclusion works
           and stop. Experts look for a drawing where it fails, and only conclude "follows" when
           they cannot find one.</p>`,
      cta: 'Let me flip the drawings',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Same statements. Different pictures.',
      say: `These three drawings all obey <b>Some boys are students</b> and <b>Some students are
            players</b>. Flip between them and watch the conclusion turn from true to false — while
            the statements never budge.`,
      widget: syllogismLab(SOME_SOME),
      __cfg: SOME_SOME,
      tasks: [
        { label: 'View all three arrangements', done: s => s.seen >= 3 },
        { label: 'Find one where the conclusion is <b>true</b>', done: s => s.sawHold },
        { label: 'Find one where the conclusion is <b>false</b>', done: s => s.sawFail },
      ],
      onComplete: 'Both are drawable, so the conclusion is not forced. That is the entire test.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'some-plus-some', conceptLabel: 'Some + Some proves nothing',
      say: `Commit first. Try to draw it failing before you answer.`,
      context: `<b>Some boys are students. Some students are players.</b>`,
      q: 'Does "Some boys are players" follow?',
      options: ['It follows', 'It does not follow'],
      answer: 1,
      whyRight: `Correct. The boys who are students and the students who are players can be entirely
                 different students. You saw that drawing in the widget — statements true, conclusion
                 false. One such drawing is enough.`,
      whyWrong: `It is <b>possible</b> for some boys to be players, but possible is not the test.<br><br>
                 Draw the boys overlapping the left edge of the students circle and the players
                 overlapping the right edge. Both statements hold. The boys and players circles never
                 touch, so the conclusion is <b>false</b> in that drawing.<br><br>
                 One drawing where it fails destroys it. <b>Some + Some proves nothing.</b>`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Why the first one cannot be broken',
      say: `Now the contrast. Try as you like — this one has no escape.`,
      steps: [
        `<b>Draw the statements.</b> "All pens are books" puts pens inside books. "All books are chairs" puts that whole thing inside chairs.`,
        `<b>Try to break it.</b> Move the pens circle anywhere you like — it must stay inside books. Move books anywhere — it must stay inside chairs. Pens is therefore inside chairs no matter what you do.`,
        `<b>There is no counterexample, so it follows.</b> "All pens are chairs" is forced. Nesting is transitive and no drawing can escape it.`,
        `<b>Compare with Some + Some.</b> There, the two overlaps were never anchored to the same part of the middle circle — so they could be slid apart. That freedom is exactly what a valid syllogism removes.`,
      ],
      widget: syllogismLab(ALL_ALL),
      __cfg: ALL_ALL,
      takeaway: `Look for the counterexample first. If you find one, the conclusion dies. If you genuinely cannot construct one, it follows.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'all-plus-all', conceptLabel: 'All + All is transitive',
      context: `<b>All cats are dogs. All dogs are animals.</b>`,
      q: 'Does "Some animals are cats" follow?',
      options: ['It follows', 'It does not follow'],
      answer: 0,
      why: `Cats sit inside dogs, which sit inside animals — so cats sit inside animals.
            And a subset read backwards always gives a "some": since the cats circle is inside animals
            and is not empty, <b>some animals are cats</b>.<br><br>
            Note the question asked for the weaker "some" rather than "all animals are cats" — which
            would <em>not</em> follow. Read which direction the conclusion runs.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'negative-no-positive', conceptLabel: 'A negative never yields a positive',
      context: `<b>No apple is a banana. All bananas are fruits.</b>`,
      q: 'Does "No apple is a fruit" follow?',
      options: ['It follows', 'It does not follow'],
      answer: 1,
      why: `Apples must avoid the <b>banana</b> circle — that is all the first statement says.
            Nothing stops the apples circle from sitting inside "fruits" somewhere else entirely,
            well away from bananas.<br><br>
            Draw fruits large, bananas as a small circle inside it, and apples as another small circle
            inside fruits but not touching bananas. Both statements hold, and "no apple is a fruit" is
            plainly false. <b>Avoiding one circle says nothing about avoiding a bigger one.</b>`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'all-plus-some', conceptLabel: 'All + Some proves nothing about the far pair',
      say: `A new pair, testing whether you now hunt for the counterexample by reflex.`,
      context: `<b>All roses are flowers. Some flowers are red.</b>`,
      q: 'Does "Some roses are red" follow?',
      options: ['It follows', 'It does not follow'],
      answer: 1,
      whyRight: `Exactly. The red things can be chosen entirely from the part of "flowers" that lies
                 <em>outside</em> the roses circle. Statements true, conclusion false — so it does not
                 follow. It might well be true in the world; it is not <b>forced</b> by the statements.`,
      whyWrong: `Hunt for the counterexample. Draw flowers as a big circle with roses as a small circle
                 inside it. Now draw the red circle overlapping flowers <b>on the opposite side</b>,
                 nowhere near roses.<br><br>
                 "All roses are flowers" ✓ · "Some flowers are red" ✓ · "Some roses are red" ✗<br><br>
                 That drawing exists, so the conclusion does <b>not follow</b>. Real roses being red is
                 knowledge about the world, and syllogisms forbid you from using it.`,
    },
  ],
};
