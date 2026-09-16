/* ============================================================
   Reasoning · Unit 3 · Lesson 3 — Sun & Shadow
   ============================================================ */

import { shadowScene } from '../widgets/compass.js';

const SCENE = { hour: 8, face: 'N' };

export default {
  id: 'r.dir.shadow',
  title: 'Sun & Shadow',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.dir.mirror',
  nextLabel: 'Next: The Mirror Trap →',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'One fact, and the question collapses',
      say: `At <b>sunrise</b>, a man notices his shadow falls exactly to his <b>left</b>.
            Which direction is he facing?<br><br>
            There is nothing to calculate here. There is one fact to know, and it is not on any
            formula sheet — it is the reason these questions exist at all. Everything else is the
            turn rule you already learned.`,
      cta: 'Give me the fact',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'The sun rises in the east, so shadows run west',
      say: `A shadow always points <b>directly away from the sun</b>. That single sentence generates
            every answer in this chapter.`,
      body: `
        <ul>
          <li><b>Sunrise (early morning)</b> — sun in the <b>East</b>, so every shadow points <b>West</b>.</li>
          <li><b>Sunset (evening)</b> — sun in the <b>West</b>, so every shadow points <b>East</b>.</li>
          <li><b>Noon</b> — the sun is overhead, the shadow shrinks to nothing useful.
              An exam that says "at noon" is usually telling you the shadow gives <em>no</em> direction.</li>
        </ul>
        <p>The question then asks where that shadow falls <em>relative to the person</em> — in front, behind,
           to the left or to the right. That is the turn rule from the previous lesson, used backwards:</p>
        <ol>
          <li>Fix the shadow's true direction from the time of day. Morning → West. Evening → East.</li>
          <li>Read where the question puts it: their left, their right, in front, behind.</li>
          <li>Work out which facing makes that true. If the shadow is West and it is on their <b>right</b>,
              then their right hand points West — and only someone facing <b>North</b> has West on their right.</li>
        </ol>
        <p>Do not try to picture this. Use the clock: right = +3 hours, so facing = shadow direction − 3 hours.</p>`,
      cta: 'Let me move the sun',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Move the sun, turn the walker',
      say: `Slide the sun from dawn to dusk and watch the shadow swing from <b>West</b> to <b>East</b>.
            Then set the walker's facing and read where the shadow lands on them.`,
      widget: shadowScene(SCENE),
      __cfg: SCENE,
      tasks: [
        { label: 'Take the sun to <b>early morning</b> — see the shadow point West', done: s => s.sawSunrise },
        { label: 'Take it to <b>evening</b> — see the shadow flip to East', done: s => s.sawSunset },
        { label: 'Visit <b>noon</b> and notice the shadow becomes useless', done: s => s.sawNoon },
        { label: 'Find a facing where the shadow falls <b>behind</b> the walker', done: s => s.rel === 'behind' },
      ],
      onComplete: 'The shadow never chose a side. The time of day chose it, and the facing did the rest.',
      ctaDone: 'Test me',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'shadow-direction', conceptLabel: 'Fixing shadow direction from the time of day',
      say: `Commit first. Fix the shadow's true direction before you think about the person at all.`,
      context: `Early one morning, a farmer near Bikaner notices his shadow falls exactly to his <b>right</b>.`,
      q: 'Which direction is he facing?',
      options: ['North', 'South', 'East', 'West'],
      answer: 1,
      whyRight: `Correct. Morning → the shadow points <b>West</b>. The question says West is on his
                 <b>right</b>. On the clock, right is +3 hours, so his facing is West − 3 hours:
                 9 − 3 = 6 o'clock → <b>South</b>. Check it: facing south, your right hand points west. ✓`,
      whyWrong: `Two steps, in this order.<br><br>
                 <b>Step 1 — fix the shadow.</b> Early morning means the sun is in the east, so the shadow
                 points <b>West</b>.<br><br>
                 <b>Step 2 — use the turn rule.</b> West is on his right. Right = +3 hours on the clock,
                 so his facing = West (9) − 3 = 6 o'clock = <b>South</b>.<br>
                 Sanity check with your own hands: face south, and your right hand points west.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Shadow first. Person second.',
      say: `The order matters more than the reasoning.`,
      steps: [
        `<b>Read the time before anything else.</b> "Morning", "sunrise", "just after dawn" all mean the shadow points <b>West</b>. "Evening", "sunset", "late afternoon" mean it points <b>East</b>. Write that direction down before you read the rest of the sentence.`,
        `<b>Now read where the shadow falls on the person.</b> In front, behind, left, or right. This is a statement about <em>their</em> body, exactly like the turns in the last lesson.`,
        `<b>Reverse the turn.</b> If the shadow is on their right, their facing is the shadow direction minus 3 hours. On their left, plus 3. In front, the same direction. Behind, plus 6.`,
        `<b>Check with your hands.</b> Every one of these can be verified in two seconds by standing up and pointing. Examiners rely on candidates not bothering.`,
      ],
      takeaway: `Morning shadow → West. Evening shadow → East. Everything after that is the clock rule you already own.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'shadow-relative', conceptLabel: 'Reading the shadow relative to the person',
      context: `At <b>sunset</b>, two friends stand facing each other in Pushkar. One notices her shadow
                falls exactly <b>behind</b> her.`,
      q: 'Which direction is she facing?',
      options: ['East', 'West', 'North', 'South'],
      answer: 1,
      why: `Sunset → the sun is in the west → the shadow points <b>East</b>.
            The shadow is <b>behind</b> her, so she is facing the opposite of East → <b>West</b>.
            She is looking straight into the setting sun, which is exactly why her shadow stretches out behind her.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'shadow-direction', conceptLabel: 'Fixing shadow direction from the time of day',
      context: `At <b>sunrise</b> in Mount Abu, a boy's shadow falls on his friend, who is standing
                directly to the boy's <b>right</b>.`,
      q: 'Which direction is the boy facing?',
      options: ['North', 'East', 'South', 'West'],
      answer: 2,
      why: `Sunrise → the shadow points <b>West</b>. The friend is on the boy's <b>right</b>, and the
            shadow reaches him, so West is on the boy's right.<br><br>
            Which facing puts West on your right? Face <b>South</b> and your right hand points west.
            (On the clock: West is 9, right is +3, so facing = 9 − 3 = 6 o'clock = South.)<br><br>
            Note how the <em>side</em> is the whole question — had the friend been on his left,
            the answer would flip to North.`,
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'shadow-relative', conceptLabel: 'Reading the shadow relative to the person',
      say: `The question from the start. Shadow first, person second.`,
      context: `At <b>sunrise</b>, a man notices his shadow falls exactly to his <b>left</b>.`,
      q: 'Which direction is he facing?',
      options: ['North', 'South', 'East', 'West'],
      answer: 0,
      whyRight: `Exactly. Sunrise → the shadow points <b>West</b>. West is on his <b>left</b>.
                 Only someone facing <b>North</b> has west on their left — stand up and check with
                 your own hands if you like. It works every time.`,
      whyWrong: `<b>Step 1:</b> sunrise means the sun is in the east, so his shadow points <b>West</b>.<br><br>
                 <b>Step 2:</b> the shadow is on his <b>left</b>, so his left hand points West.<br><br>
                 Which facing puts West on your left? Face <b>North</b> and your left hand points west.
                 (Face south and it would point east — that is the trap answer.)`,
    },
  ],
};
