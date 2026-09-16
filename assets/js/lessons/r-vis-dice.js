/* ============================================================
   Reasoning · Unit 7 · Lesson 4 — Cubes & Dice
   ============================================================ */

import { paintedCube } from '../widgets/dice-lab.js';

export default {
  id: 'r.vis.dice',
  title: 'Cubes & Dice',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.vis.figseries',
  nextLabel: 'Next: Figure Series →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'A cube painted red, then cut into 64',
      say: `A wooden cube is painted red on <b>all six faces</b>, then sawn into <b>64</b> equal small
            cubes.<br><br>
            How many of them have <b>exactly two</b> red faces? And how many have <b>none at all</b>?<br><br>
            You do not need to visualise the cube. You need to know that a small cube's paint depends
            only on <b>where it sat</b> — corner, edge, face-middle, or buried.`,
      cta: 'Show me the four places',
    },
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Four positions, four formulas',
      say: `Cut a cube of side <b>n</b> into n³ small cubes. Every small cube sits in exactly one of
            four kinds of place, and its position decides its paint completely.`,
      body: `
        <ul>
          <li><b>Corners → 3 painted faces.</b> A cube has 8 corners, always. This count never depends on n.</li>
          <li><b>Edges (not corners) → 2 faces.</b> 12 edges, each holding (n − 2) small cubes: <b>12(n − 2)</b>.</li>
          <li><b>Face middles → 1 face.</b> 6 faces, each with an (n − 2) × (n − 2) inner square: <b>6(n − 2)²</b>.</li>
          <li><b>Buried inside → 0 faces.</b> The inner cube of side (n − 2): <b>(n − 2)³</b>.</li>
        </ul>
        <p><b>The check that catches every slip:</b> the four groups must add back to n³.
           For n = 4: 8 + 24 + 24 + 8 = 64 ✓. Do that addition every time — it costs three seconds
           and it has caught more errors than any other habit in this chapter.</p>
        <p><b>Dice, separately.</b> On a standard die, opposite faces sum to <b>7</b>: 1–6, 2–5, 3–4.
           When a question shows two views of the same die, any number appearing in <em>both</em> views
           cannot be opposite anything you can see in either — it is adjacent to all of them.</p>`,
      cta: 'Let me slice one',
    },
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Slice the cube layer by layer',
      say: `Each square shows how many painted faces that small cube carries. Slide through the layers
            and watch the <b>0</b>s appear only in the middle ones — those are the buried cubes.`,
      widget: paintedCube({ start: 4 }),
      __cfg: { start: 4 },
      tasks: [
        { label: 'Look at a <b>middle</b> layer, not just the front face', done: s => s.sawMiddleLayer },
        { label: 'Find the cubes with <b>0</b> painted faces', done: s => s.sawInterior },
        { label: 'Try at least <b>two</b> different cube sizes', done: s => s.sizesTried >= 2 },
      ],
      onComplete: 'The eight corners never changed. Everything else grew with n — which is exactly what the formulas say.',
      ctaDone: 'Test me',
    },
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'painted-two-faces', conceptLabel: 'Counting cubes with two painted faces',
      say: `Commit first. Use the position, not a picture.`,
      context: `A cube is painted on all faces and cut into <b>64</b> equal small cubes,
                so the side is <b>n = 4</b>.`,
      q: 'How many small cubes have exactly two painted faces?',
      options: ['12', '24', '8', '36'],
      answer: 1,
      whyRight: `Correct. Two painted faces means sitting along an <b>edge</b> but not at a corner.
                 A cube has 12 edges, each holding n − 2 = 2 such cubes: 12 × 2 = <b>24</b>.`,
      whyWrong: `Two painted faces means the cube sits on an <b>edge</b>, between two corners.<br><br>
                 A cube has <b>12 edges</b>. On each edge, the two ends are corners (3 faces), leaving
                 n − 2 = 4 − 2 = <b>2</b> cubes with exactly two painted faces.<br><br>
                 12 × 2 = <b>24</b>. Answering 12 counts one per edge and forgets that each edge holds
                 several.`,
    },
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'n = 4, all four groups',
      say: `And the addition that proves you have not slipped.`,
      steps: [
        `<b>Corners — 3 faces.</b> Always <b>8</b>, whatever n is.`,
        `<b>Edges — 2 faces.</b> 12 edges × (4 − 2) = 12 × 2 = <b>24</b>.`,
        `<b>Face middles — 1 face.</b> 6 faces × (4 − 2)² = 6 × 4 = <b>24</b>.`,
        `<b>Buried — 0 faces.</b> (4 − 2)³ = <b>8</b>. Now check: 8 + 24 + 24 + 8 = <b>64</b> = 4³ ✓. If that sum misses, one of your four numbers is wrong and you know it immediately.`,
      ],
      takeaway: `8 corners · 12(n−2) edges · 6(n−2)² faces · (n−2)³ inside — then add them up and confirm you get n³.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'painted-zero-faces', conceptLabel: 'Counting the buried cubes',
      context: `A cube is painted on all faces and cut into <b>125</b> small cubes, so <b>n = 5</b>.`,
      q: 'How many small cubes have no paint at all?',
      options: ['9', '27', '64', '8'],
      answer: 1,
      why: `The unpainted cubes form a solid inner cube with one layer stripped from each side,
            so its side is n − 2 = <b>3</b>.<br><br>
            That is 3³ = <b>27</b> cubes.<br><br>
            Check the whole set: 8 + 12(3) + 6(9) + 27 = 8 + 36 + 54 + 27 = <b>125</b> = 5³ ✓`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'dice-opposite', conceptLabel: 'Opposite faces of a die',
      context: `A standard die has opposite faces summing to <b>7</b>. Two views of the same die show
                <b>1, 2, 3</b> and <b>1, 3, 5</b>.`,
      q: 'Which number is opposite 1?',
      options: ['6', '2', '4', '5'],
      answer: 0,
      why: `On a standard die the pairs are fixed: 1–6, 2–5, 3–4, each summing to <b>7</b>.
            So 1 is opposite <b>6</b>.<br><br>
            The two views confirm it rather than contradict it: 1 appears <em>with</em> 2, 3 and 5,
            so 1 is adjacent to all of them — and the only face left for it to be opposite is <b>6</b>.
            Faces seen together in one view can never be opposite each other.`,
    },
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'painted-zero-faces', conceptLabel: 'Counting the buried cubes',
      say: `Back to the 64.`,
      context: `A cube painted on all six faces is cut into <b>64</b> equal small cubes.`,
      q: 'How many have no painted face at all?',
      options: ['4', '8', '16', '0'],
      answer: 1,
      whyRight: `Exactly. n = 4, so the buried cube has side n − 2 = 2, giving 2³ = <b>8</b>.<br><br>
                 And the full check: 8 corners + 24 edges + 24 face-middles + 8 buried = <b>64</b> ✓`,
      whyWrong: `n = 4, since 4³ = 64.<br><br>
                 Strip one layer from every side and the unpainted core is a cube of side
                 n − 2 = <b>2</b>. So it holds 2³ = <b>8</b> small cubes.<br><br>
                 Verify with the total: 8 + 12(2) + 6(2²) + 2³ = 8 + 24 + 24 + 8 = <b>64</b> ✓
                 If your four numbers do not add to n³, one of them is wrong.`,
    },
  ],
};
