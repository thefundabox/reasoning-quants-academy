/* ============================================================
   Reasoning · Unit 6 · Lesson 3 — Breaking a Conclusion
   ============================================================ */

import { conclusionBreaker } from '../widgets/syllogism-lab.js';

const BREAKER = {
        statements: ['All A are B', 'Some B are C'],
        conclusion: 'Some A are C',
        a: { x: 130, r: 32 }, b: { x: 176, r: 80 }, start: { x: 300, r: 52 },
      };

export default {
  id: 'r.log.break',
  title: 'Breaking a Conclusion',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.log.venn3',
  nextLabel: 'Next: Venn for Three Categories →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'One drawing is enough to destroy it',
      say: `<b>All A are B. Some B are C. Therefore some A are C.</b><br><br>
            That is the most seductive wrong answer in the whole paper, because it is so often true
            in real life. But you do not need to argue with it, and you do not need a rule.<br><br>
            You need <b>one drawing</b> in which the statements hold and the conclusion fails.
            Find it and the conclusion is dead — no appeal, no discussion.`,
      cta: 'Let me hunt for it',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Stop proving. Start attacking.',
      say: `Most candidates try to <em>justify</em> the conclusion, find one arrangement where it
            works, and tick it. That method is backwards and it is why they lose the mark.`,
      body: `
        <p><b>The counterexample method, in four moves:</b></p>
        <ol>
          <li><b>Draw the statements in the most "spread out" way you can.</b> Push every circle as
              far apart as the statements permit. Overlaps become minimal slivers; nothing touches
              that is not forced to touch.</li>
          <li><b>Now check the conclusion.</b> If it has already failed, you are finished — one
              counterexample and it does not follow.</li>
          <li><b>If it survives, try the opposite extreme.</b> Push circles together, make one swallow
              another, slide an overlap from one side to the other.</li>
          <li><b>Only if it survives every attempt does it follow.</b> And with practice you will
              know within seconds which conclusions are worth attacking.</li>
        </ol>
        <p><b>The single most useful move</b> is to take a "some" overlap and slide it as far from the
           third circle as the statement allows. A "some" only requires the circles to touch
           <em>somewhere</em> — it never says where, and that freedom is what you exploit.</p>`,
      cta: 'Give me the circles',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Slide C until the conclusion dies',
      say: `<b>A</b> sits inside <b>B</b>, so the first statement is permanently satisfied.
            Your job is to place <b>C</b> so that it touches B — keeping the second statement true —
            while missing A entirely.`,
      widget: conclusionBreaker(BREAKER),
      __cfg: BREAKER,
      tasks: [
        { label: 'Get <b>both statements</b> true at the same time', done: s => s.statementsHold },
        { label: 'Find a drawing where the statements hold but the conclusion <b>fails</b>',
          done: s => s.foundCounterexample },
      ],
      onComplete: 'That drawing is a complete proof. The conclusion does not follow, and you never argued a word.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'counterexample-method', conceptLabel: 'Killing a conclusion with one drawing',
      say: `Commit first. Ask what a single counterexample would have to look like.`,
      context: `You are checking whether <b>"Some A are C"</b> follows from
                <b>All A are B</b> and <b>Some B are C</b>.`,
      q: 'What is the fastest way to settle it?',
      options: [
        'Find one drawing where all three are true',
        'Find one drawing where the statements are true and the conclusion is false',
        'Check whether the conclusion is true in the real world',
        'Count how many drawings make the conclusion true',
      ],
      answer: 1,
      whyRight: `Correct. A conclusion follows only if it holds in <b>every</b> drawing, so a single
                 drawing where it fails settles the matter permanently. Finding a drawing where it
                 works proves nothing at all — that only shows it is possible.`,
      whyWrong: `A conclusion "follows" only if it is true in <b>every</b> arrangement the statements
                 permit.<br><br>
                 So one drawing where the statements hold and the conclusion <b>fails</b> is a complete
                 disproof — you are done in seconds.<br><br>
                 Finding a drawing where everything is true proves only that it is <em>possible</em>,
                 which earns nothing. And real-world knowledge is explicitly forbidden: the statements
                 are the only evidence you may use.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The counterexample, and why it works',
      say: `Look at what the drawing actually establishes.`,
      steps: [
        `<b>Put A inside B.</b> "All A are B" is now permanently satisfied and cannot be violated however you move C.`,
        `<b>Let C clip the far edge of B.</b> "Some B are C" only demands that B and C share <em>something</em> — a sliver on the opposite side from A qualifies completely.`,
        `<b>Read the conclusion off the picture.</b> A and C do not touch, so "some A are C" is <b>false</b> — while both statements are true.`,
        `<b>That is a proof, not an opinion.</b> The statements do not force the conclusion, because here is a world obeying the statements in which the conclusion fails. Nothing more needs saying.`,
      ],
      takeaway: `A "some" overlap can always be slid to the far side. That one move breaks most All + Some conclusions in about three seconds.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'possible-vs-forced', conceptLabel: 'Possible is not the same as forced',
      context: `A candidate says: "I drew it, and some A really were C in my picture,
                so the conclusion follows."`,
      q: 'What is wrong with that reasoning?',
      options: [
        'Nothing — one valid drawing is enough',
        'They needed to draw it more accurately',
        'One agreeable drawing shows the conclusion is possible, not forced',
        'They should have used real-world examples instead',
      ],
      answer: 2,
      why: `Their drawing shows the conclusion <b>can</b> be true. The question asks whether it
            <b>must</b> be true.<br><br>
            To establish "follows", you must show that <em>no</em> drawing makes it fail — which means
            trying to break it and failing. To establish "does not follow", you need exactly one
            drawing where it fails.<br><br>
            Their evidence supports neither verdict. It is the commonest error in the topic.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'counterexample-method', conceptLabel: 'Killing a conclusion with one drawing',
      context: `<b>Some singers are dancers. All dancers are artists.</b><br>
                Proposed conclusion: <b>"All singers are artists."</b>`,
      q: 'Does it follow?',
      options: ['It follows', 'It does not follow'],
      answer: 1,
      why: `Attack it. "Some singers are dancers" requires only a sliver of overlap — so draw most of
            the singers circle <b>outside</b> the artists circle entirely, with just a small piece
            poking into dancers.<br><br>
            "Some singers are dancers" ✓ · "All dancers are artists" ✓ · "All singers are artists" ✗<br><br>
            The counterexample exists, so it does not follow. Note what <em>would</em> have followed:
            "<b>Some</b> singers are artists" — because the singers who are dancers must be artists.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'counterexample-method', conceptLabel: 'Killing a conclusion with one drawing',
      say: `The conclusion from the start. You have already drawn its counterexample by hand.`,
      context: `<b>All A are B. Some B are C.</b>`,
      q: 'Which conclusion follows?',
      options: ['Some A are C', 'Some C are B', 'All C are B', 'No A is C'],
      answer: 1,
      whyRight: `Exactly. <b>"Some C are B"</b> is just the second statement read backwards, and overlap
                 is symmetric — so it is guaranteed with no drawing required.<br><br>
                 "Some A are C" is the trap you broke in the widget. "All C are B" and "No A is C" are
                 both merely <em>possible</em> — each has drawings where it fails.`,
      whyWrong: `Test each against a counterexample.<br><br>
                 <b>Some A are C</b> — you broke this yourself: slide C to the far side of B. ✗<br>
                 <b>Some C are B</b> — this is "some B are C" reversed, and overlap is symmetric.
                 No drawing can make it fail. ✓<br>
                 <b>All C are B</b> — C only needs to touch B; the rest of C can sit outside. ✗<br>
                 <b>No A is C</b> — C is free to overlap A as well, so this fails too. ✗<br><br>
                 The answer is <b>Some C are B</b> — the only one that survives every drawing.`,
    },
  ],
};
