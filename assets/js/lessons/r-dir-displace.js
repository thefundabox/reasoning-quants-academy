/* ============================================================
   Reasoning · Unit 3 · Lesson 2 — Net Displacement
   ============================================================ */

import { walkMap, staticWalk } from '../widgets/walk-map.js';

const ROUTE = { seed: [{ dir: 'N', d: 3 }, { dir: 'E', d: 4 }] };

export default {
  id: 'r.dir.displace',
  title: 'Net Displacement',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.dir.shadow',
  nextLabel: 'Next: Sun & Shadow →',

  steps: [
    /* ---------------- HOOK ---------------- */
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Seven kilometres walked. Five from home.',
      say: `A postman leaves the Jaipur GPO, walks <b>3 km North</b>, then <b>4 km East</b>.
            He has walked seven kilometres. He is <b>five</b> kilometres from where he started.<br><br>
            Every one of these questions is the same shape: two numbers and a right triangle.
            And the examiner only ever uses a handful of triangles — once you know them, you stop
            calculating and start recognising.<br><br>
            The one you will answer at the end: <b>13 km North, 6 km West, 5 km South. How far from the start?</b>`,
      cta: 'Show me the shape',
    },

    /* ---------------- LEARN ---------------- */
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Cancel first. Then one triangle.',
      say: `Never trace the walk step by step in your head. Collapse it to <b>two numbers</b> first.`,
      body: `
        <ol>
          <li><b>Add up North, subtract South.</b> That is your vertical leg.</li>
          <li><b>Add up East, subtract West.</b> That is your horizontal leg.</li>
          <li><b>The straight-line distance is the hypotenuse:</b> <code>√(vertical² + horizontal²)</code>.</li>
        </ol>
        <p>Opposite legs cancel before you do any geometry. A walk of 13 km North and 5 km South is
           simply <b>8 km North</b> — the walker's route was long, their displacement was not.</p>
        <p>Learn these triples and most questions need no arithmetic at all:</p>
        <ul>
          <li><b>3–4–5</b> and its multiples: 6–8–10, 9–12–15, 12–16–20</li>
          <li><b>5–12–13</b> · <b>8–15–17</b> · <b>7–24–25</b></li>
        </ul>
        <p>If your two legs are 6 and 8, do not reach for a calculator. The answer is 10.</p>
        <p>For <b>direction</b>, exams want the <b>quadrant</b>, not a bearing. Ending 3 km east and
           1 km north of the start is <b>North-East</b> — not "East, roughly". Any positive east
           together with any positive north is North-East, however lopsided.</p>`,
      cta: 'Let me walk one',
    },

    /* ---------------- EXPLORE ---------------- */
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Build a route and read the dashed line',
      say: `The solid line is the walk. The <b>dashed line is the answer</b> — displacement, not distance walked.
            Try a route that comes back to where it began, and watch it vanish.`,
      widget: walkMap(ROUTE),
      __cfg: ROUTE,
      tasks: [
        { label: 'Build a route of at least <b>three</b> legs', done: s => s.count >= 3 },
        { label: 'Use a <b>turn</b> instead of naming a direction', done: s => s.usedTurn },
        { label: 'End up <b>diagonally</b> from the start (both legs non-zero)', done: s => s.diagonal },
        { label: 'Make a route that returns to the <b>starting point</b>', done: s => s.returnedHome },
      ],
      onComplete: 'Good. Distance walked and distance from home are different numbers, and the question always wants the second one.',
      ctaDone: 'Test me',
    },

    /* ---------------- PREDICT ---------------- */
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'net-displacement', conceptLabel: 'Cancelling legs, then Pythagoras',
      say: `Commit first. Cancel before you square anything.`,
      context: `A surveyor walks <b>9 km North</b>, then <b>12 km East</b>, then <b>4 km South</b>.`,
      q: 'How far is she from her starting point?',
      options: ['25 km', '13 km', '17 km', '15 km'],
      answer: 1,
      whyRight: `Correct — and you cancelled before squaring. 9 North − 4 South = <b>5 North</b>.
                 Horizontal is <b>12 East</b>. Legs of 5 and 12 are the <b>5–12–13</b> triple, so the
                 answer is <b>13 km</b> with no arithmetic at all.`,
      whyWrong: `Cancel the opposite legs first: 9 km North − 4 km South = <b>5 km North</b>.
                 The horizontal leg is <b>12 km East</b>.<br><br>
                 Legs of 5 and 12 are a standard triple: <b>5–12–13</b>. The answer is <b>13 km</b>.<br><br>
                 If you answered 25, you added all three legs — that is the distance <em>walked</em>,
                 not the distance <em>from</em> the start.`,
    },

    /* ---------------- REVEAL ---------------- */
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The route, drawn',
      say: `Here is a walk that looks complicated and is not.`,
      steps: [
        `<b>List the legs by axis.</b> 8 km North, 3 km East, 4 km South: the vertical legs are +8 and −4, the horizontal is +3.`,
        `<b>Cancel.</b> 8 − 4 = <b>4 North</b>. Horizontal stays <b>3 East</b>. A three-leg walk has become a two-leg walk, and the 4 km of southward walking has simply disappeared from the answer.`,
        `<b>Recognise, do not calculate.</b> Legs of 3 and 4 are the most common triple in the paper: the hypotenuse is <b>5 km</b>. He walked 15 km to end up 5 km from home.`,
        `<b>Name the quadrant.</b> He ends north of the start and east of it → <b>North-East</b>. Both components are named, however lopsided they are.`,
      ],
      widget: staticWalk([{ dir: 'N', d: 8 }, { dir: 'E', d: 3 }, { dir: 'S', d: 4 }]),
      takeaway: `Distance walked is a distraction. Cancel to two numbers, check the triples list, then square only if you must.`,
    },

    /* ---------------- DRILL ---------------- */
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'triples', conceptLabel: 'Recognising Pythagorean triples',
      context: `A jeep drives <b>9 km South</b>, then <b>12 km West</b>.`,
      q: 'How far is it from the starting point?',
      options: ['15 km', '21 km', '13 km', '18 km'],
      answer: 0,
      why: `Nothing cancels — the legs are 9 and 12. That is <b>3–4–5 multiplied by 3</b>: 9–12–<b>15</b>.
            Recognising the triple saves you from computing √225 under time pressure.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'quadrant-direction', conceptLabel: 'Naming the quadrant',
      context: `A trekker walks <b>10 km West</b>, then <b>4 km North</b>, then <b>2 km East</b>.`,
      q: 'In which direction is she from her starting point?',
      options: ['North', 'West', 'North-West', 'South-West'],
      answer: 2,
      why: `Cancel the horizontal legs: 10 West − 2 East = <b>8 West</b>. Vertical is <b>4 North</b>.<br><br>
            She is both north and west of the start → <b>North-West</b>. The trap is answering "West"
            because the westward leg is twice as long. Exams name the quadrant, not the dominant leg.`,
    },

    /* ---------------- MASTERY ---------------- */
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'net-displacement', conceptLabel: 'Cancelling legs, then Pythagoras',
      say: `The walk from the beginning. Cancel, recognise, answer.`,
      context: `A man walks <b>13 km North</b>, then <b>6 km West</b>, then <b>5 km South</b>.`,
      q: 'How far is he from his starting point?',
      options: ['24 km', '10 km', '8 km', '14 km'],
      answer: 1,
      whyRight: `Exactly. 13 North − 5 South = <b>8 North</b>. Horizontal is <b>6 West</b>.
                 Legs of 6 and 8 → the 3–4–5 triple doubled → <b>10 km</b>. No squaring needed.
                 He walked 24 km and finished 10 km from home.`,
      whyWrong: `Cancel first: 13 km North − 5 km South = <b>8 km North</b>. The horizontal leg is
                 <b>6 km West</b>.<br><br>
                 Legs of 6 and 8 are the <b>3–4–5 triple doubled</b>, so the hypotenuse is <b>10 km</b>.<br><br>
                 If you answered 24, you added the legs — that is the total <em>distance walked</em>,
                 which the question did not ask for.`,
    },
  ],
};
