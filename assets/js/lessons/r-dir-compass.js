/* ============================================================
   Reasoning · Unit 3 · Lesson 1 — Compass & Turns
   ============================================================ */

import { turnDial } from '../widgets/compass.js';

const DIAL = { start: 'N' };

export default {
  id: 'r.dir.compass',
  title: 'Compass & Turns',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.dir.displace',
  nextLabel: 'Next: Net Displacement →',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'One question. Most people miss it.',
      say: `You are walking <b>South</b>. You turn <b>left</b>.<br><br>
            Are you now facing East, or West?<br><br>
            Answer it in your head before continuing. Then notice <em>why</em> you answered that —
            because almost everyone who gets it wrong makes the same substitution, and it is not
            carelessness. It is a habit that has to be replaced.`,
      cta: 'Show me the habit',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Left belongs to the walker, not to the map',
      say: `The wrong habit is reading "left" as <b>west</b>, because west is on the left of a map.
            That works only when the walker happens to face north.`,
      body: `
        <p>A turn is always measured from the walker's <b>current facing</b>:</p>
        <ul>
          <li><b>Left = anticlockwise.</b> North → West → South → East → North.</li>
          <li><b>Right = clockwise.</b> North → East → South → West → North.</li>
          <li><b>U-turn</b> is two turns the same way, or simply the opposite direction.</li>
        </ul>
        <p>The fastest reliable trick is the <b>clock face</b>. Put North at 12, East at 3, South at 6, West at 9.
           A right turn moves you <b>three hours clockwise</b>; a left turn moves you three hours anticlockwise.
           Facing South (6 o'clock) and turning left: 6 − 3 = 3 o'clock, which is <b>East</b>.</p>
        <p>Notice what that means: facing South, the walker's left is East — the <em>opposite</em> of the
           map's left. That single reversal is the whole lesson.</p>`,
      cta: 'Let me turn one',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Turn the walker yourself',
      say: `The <b>gold arm is their left</b> and the <b>teal arm is their right</b>. Watch both arms
            rotate <em>with</em> the walker. They are attached to the person, never to the compass.`,
      widget: turnDial(DIAL),
      __cfg: DIAL,
      tasks: [
        { label: 'Make a <b>left</b> turn', done: s => s.madeLeft },
        { label: 'Make a <b>right</b> turn', done: s => s.madeRight },
        { label: 'Try a <b>U-turn</b>', done: s => s.madeU },
        { label: 'Face all four directions at some point', done: s => s.facedAll },
      ],
      onComplete: 'Now you have seen the arms move. They never stayed pointing west.',
      ctaDone: 'Test me',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'turn-frame', conceptLabel: 'Turns are measured from the walker\'s facing',
      say: `Commit before I explain. Use the clock face if it helps.`,
      context: `A cyclist on the Jaipur ring road is heading <b>West</b>. She turns <b>right</b>.`,
      q: 'Which direction is she now heading?',
      options: ['North', 'South', 'East', 'West'],
      answer: 0,
      whyRight: `Correct. West is 9 o'clock. A right turn is three hours clockwise: 9 + 3 = 12,
                 which is <b>North</b>. Her right hand was pointing north the whole time — the map's
                 right had nothing to do with it.`,
      whyWrong: `Use the clock. North = 12, East = 3, South = 6, West = 9.<br><br>
                 She is facing West, so she is at <b>9 o'clock</b>. A <b>right</b> turn moves three hours
                 <em>clockwise</em>: 9 + 3 = 12 → <b>North</b>.<br><br>
                 If you answered South, you read "right" as the right-hand side of the map. That is the
                 exact habit this lesson exists to break.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The clock face, once and for all',
      say: `Four numbers, and you never guess again.`,
      steps: [
        `<b>Lay the clock down.</b> North at 12, East at 3, South at 6, West at 9. Draw it in the margin of the paper — it takes two seconds and it survives your nerves.`,
        `<b>Right is +3 hours. Left is −3 hours.</b> That is the entire rule. Facing East (3) and turning right: 3 + 3 = 6 → South.`,
        `<b>Wrap around 12.</b> Facing West (9) and turning right: 9 + 3 = 12 → North. Facing North (12) and turning left: 12 − 3 = 9 → West.`,
        `<b>Chain turns one at a time.</b> Never try to combine two turns in your head. Facing South (6), left twice: 6 − 3 = 3 (East), then 3 − 3 = 12 (North). Two small steps beat one clever one.`,
      ],
      takeaway: `Facing North, the walker's left really is West. In every other facing it is not. Never carry the map's left into the walker's frame.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'turn-chain', conceptLabel: 'Chaining several turns',
      context: `A man starts walking <b>North</b>. He turns <b>right</b>, walks on, then turns <b>right</b> again.`,
      q: 'Which direction is he facing now?',
      options: ['East', 'South', 'West', 'North'],
      answer: 1,
      why: `One turn at a time. North is 12 o'clock. First right: 12 + 3 = 3 → <b>East</b>.
            Second right: 3 + 3 = 6 → <b>South</b>.<br><br>
            Two right turns always reverse you, which is worth remembering on its own —
            it is the same as a U-turn.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'turn-frame', conceptLabel: 'Turns are measured from the walker\'s facing',
      context: `A bus leaves Jodhpur heading <b>East</b>. It takes a <b>U-turn</b>, then turns <b>left</b>.`,
      q: 'Which direction is it heading now?',
      options: ['North', 'South', 'East', 'West'],
      answer: 1,
      why: `East is 3 o'clock. A U-turn is six hours: 3 + 6 = 9 → <b>West</b>.
            Now a left turn from West: 9 − 3 = 6 → <b>South</b>.<br><br>
            The trap is applying the left turn to the original facing instead of the new one.
            Every turn acts on wherever the walker is pointing <em>at that moment</em>.`,
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'turn-frame', conceptLabel: 'Turns are measured from the walker\'s facing',
      say: `The question from the start — plus one more turn, so you cannot answer it from memory.`,
      context: `A walker is heading <b>South</b>. He turns <b>left</b>, walks a while, then turns <b>left</b> again.`,
      q: 'Which direction is he facing at the end?',
      options: ['East', 'North', 'West', 'South'],
      answer: 1,
      whyRight: `Exactly. South is 6 o'clock. First left: 6 − 3 = 3 → <b>East</b> (this is the step most
                 people get wrong, answering West). Second left: 3 − 3 = 12 → <b>North</b>.`,
      whyWrong: `South is <b>6 o'clock</b>. A left turn is three hours anticlockwise.<br><br>
                 First left: 6 − 3 = 3 → <b>East</b>. Facing south, your left hand points east —
                 check it with your own hands if it still feels wrong.<br><br>
                 Second left: 3 − 3 = 12 → <b>North</b>.`,
    },
  ],
};
