/* ============================================================
   Quants · Unit 4 · Lesson 3 — Paths, Borders & Tiling
   ============================================================ */

import { pathBorder } from '../widgets/mensuration-lab.js';

const FIELD = { w: 20, h: 15, maxT: 5, unit: 'm', startT: 2 };

export default {
  id: 'q.men.paths',
  title: 'Paths, Borders & Tiling',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.men.solids',
  nextLabel: 'Next: Volume & Surface Area →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'The width goes on twice',
      say: `A room is <b>20 m by 15 m</b>. A verandah <b>2 m wide</b> runs around the outside.<br><br>
            The outer rectangle is not 22 by 17. It is <b>24 by 19</b> — because the verandah is
            there on the left <em>and</em> on the right, at the top <em>and</em> at the bottom.<br><br>
            Add the width twice to each dimension, and every question in this lesson becomes one
            subtraction.`,
      cta: 'Show me the subtraction',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Outer minus inner. Always.',
      say: `There is no formula for the area of a path, and you should be suspicious of any you
            half-remember. There is only a rectangle with a smaller rectangle taken out of it.`,
      body: `
        <p><b>Path outside.</b> Each dimension grows by <b>twice</b> the width:</p>
        <p><code>outer = (20 + 2×2) × (15 + 2×2) = 24 × 19 = 456</code><br>
           <code>inner = 20 × 15 = 300</code><br>
           <code>path = 456 − 300 = <b>156 m²</b></code></p>
        <p><b>Path inside.</b> The same move, in reverse — each dimension <em>shrinks</em> by twice
           the width. A 50 × 40 field with a 5 m path running inside the boundary has an untouched
           middle of <code>40 × 30 = 1,200</code>, so the path is
           <code>2,000 − 1,200 = <b>800 m²</b></code>.</p>
        <p><b>Two crossing roads.</b> Now the subtraction changes character. A 60 × 40 field with a
           3 m road down the length and another across the breadth:</p>
        <ul>
          <li>Along the length: <code>60 × 3 = 180</code></li>
          <li>Across the breadth: <code>40 × 3 = 120</code></li>
          <li>Where they cross, a <code>3 × 3 = 9</code> square belongs to <b>both</b> — and adding
              the strips has counted it twice.</li>
        </ul>
        <p><code>total = 180 + 120 − 9 = <b>291 m²</b></code>. That subtraction of the overlap is
           the single most-missed step in the topic.</p>
        <p><b>Cost questions.</b> Once you have the area, cost is one multiplication —
           <code>area × rate</code>. The difficulty is never the money; it is getting the area
           right, so do not rush the outer-minus-inner and then triumphantly multiply a wrong
           number.</p>`,
      cta: 'Let me draw the path',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Outside, inside, and crossing',
      say: `The shaded frame is the path. Widen it and watch how fast the area grows — the width
            counts twice on every dimension.<br><br>
            Then switch to <b>crossing roads</b> and look at the little square in the middle.`,
      widget: pathBorder(FIELD),
      __cfg: FIELD,
      tasks: [
        { label: 'Try all three arrangements', done: s => s.sawAll },
        { label: 'Put the path <b>inside</b> and keep the middle from vanishing', done: s => s.insideFits },
        { label: 'Find the square that belongs to <b>both</b> roads', done: s => s.sawRoads },
      ],
      onComplete: `That little square is where marks are lost. Adding the two strips counts it
                   twice, so it has to come off once.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'path-outer-inner', conceptLabel: 'Outer minus inner, with the width counted twice',
      input: 'number', answer: 156, unit: 'square metres',
      say: `The verandah from the start.`,
      context: `A room <b>20 m × 15 m</b> has a verandah <b>2 m wide</b> all around the
                <b>outside</b>.`,
      q: 'What is the area of the verandah?',
      whyRight: `Correct. The outer rectangle is 24 × 19 = 456, the room is 300, and the difference
                 is <b>156 m²</b>.`,
      whyWrong: `Build the outer rectangle first, adding the width at <b>both</b> ends of each
                 dimension.<br><br>
                 <code>outer = (20 + 4) × (15 + 4) = 24 × 19 = 456</code><br>
                 <code>inner = 20 × 15 = 300</code><br>
                 <code>verandah = 456 − 300 = <b>156 m²</b></code><br><br>
                 If you answered <b>74</b>, you used 22 × 17 = 374 — adding the width only once per
                 dimension. Picture the verandah: it runs along the left side <em>and</em> the
                 right, so the total width grows by 2 + 2.<br><br>
                 There is an exact check worth knowing: a border's area equals the perimeter of its
                 <b>midline</b> times its width. The midline rectangle here is 22 × 17, perimeter
                 <b>78</b>, and <code>78 × 2 = 156</code>. ✓`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Three arrangements, one subtraction',
      say: `Only the direction of the change differs.`,
      steps: [
        `<b>Outside.</b> 20 × 15 with a 2 m path → outer <b>24 × 19 = 456</b>, inner 300, path
         <b>156 m²</b>. Both dimensions grew by 2 × 2.`,
        `<b>Inside.</b> 50 × 40 with a 5 m path → the untouched middle is <b>40 × 30 = 1,200</b>,
         and the path is <code>2,000 − 1,200 = <b>800 m²</b></code>. Here the field itself is the
         outer rectangle.`,
        `<b>Crossing roads.</b> 60 × 40 with two 3 m roads → 180 + 120 = 300, minus the
         <code>3 × 3 = 9</code> crossing square counted twice → <b>291 m²</b>. The roads meet
         once, so you subtract once.`,
        `<b>Cost.</b> A 30 × 20 garden with a 2.5 m path outside: outer <code>35 × 25 = 875</code>,
         inner 600, path <b>275 m²</b>. At ₹12 a square metre that is
         <code>275 × 12 = <b>₹3,300</b></code>.`,
        `<b>The check.</b> A path outside must come out larger than a path of the same width inside,
         because it wraps around a bigger boundary. If yours does not, you have added where you
         should have subtracted.`,
      ],
      takeaway: `Build both rectangles, then subtract. Outside adds twice the width to each
                 dimension; inside removes twice the width. For crossing roads, add the two strips
                 and take the overlap off once.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'path-inside', conceptLabel: 'A path inside shrinks both dimensions',
      input: 'number', answer: 800, unit: 'square metres',
      context: `A field is <b>50 m × 40 m</b>. A path <b>5 m wide</b> runs <b>inside</b> it, all
                along the boundary.`,
      q: 'What is the area of the path?',
      why: `The field is now the <b>outer</b> rectangle, and the untouched middle is the inner
            one.<br><br>
            <code>inner = (50 − 10) × (40 − 10) = 40 × 30 = 1,200</code><br>
            <code>path = 2,000 − 1,200 = <b>800 m²</b></code><br><br>
            Note the width comes off <em>twice</em> here too — 5 m from the left and 5 m from the
            right.<br><br>
            Compare with a 5 m path <em>outside</em> the same field: outer 60 × 50 = 3,000, path
            1,000 m². The outside path is larger, because it wraps around a longer boundary — which
            is the sense check for this whole lesson.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'path-overlap', conceptLabel: 'The crossing square is counted twice',
      input: 'number', answer: 291, unit: 'square metres',
      context: `A rectangular field is <b>60 m × 40 m</b>. Two roads, each <b>3 m wide</b>, run
                through the middle — one parallel to the length and one parallel to the breadth.`,
      q: 'What is the total area of the roads?',
      why: `Add the two strips, then remove what you double-counted.<br><br>
            <code>along the length: 60 × 3 = 180</code><br>
            <code>across the breadth: 40 × 3 = 120</code><br>
            <code>they cross in a square of 3 × 3 = 9</code><br><br>
            <code>total = 180 + 120 − 9 = <b>291 m²</b></code><br><br>
            Answering <b>300</b> means the crossing square was counted in both strips. It is a small
            error in this case — 3% — but it is the specific thing the question was written to
            test, and the options will always include 300.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'path-outer-inner', conceptLabel: 'Outer minus inner, with the width counted twice',
      say: `Area first. The money is the easy part.`,
      context: `A garden is <b>30 m × 20 m</b>. A path <b>2.5 m wide</b> is laid all around the
                outside, and gravelling costs <b>₹12 per square metre</b>.`,
      q: 'What does the gravelling cost?',
      options: ['₹3,300', '₹3,000', '₹7,200', '₹2,400'],
      answer: 0,
      whyRight: `Correct. Outer 35 × 25 = 875, inner 600, so the path is <b>275 m²</b> — and
                 <code>275 × 12 = <b>₹3,300</b></code>.`,
      whyWrong: `Two steps, and the first is where it is won.<br><br>
                 <b>Outer:</b> <code>(30 + 5) × (20 + 5) = 35 × 25 = 875 m²</code> — the width of
                 2.5 m is added at both ends, so each dimension grows by <b>5</b>.<br>
                 <b>Inner:</b> <code>30 × 20 = 600 m²</code><br>
                 <b>Path:</b> <code>875 − 600 = <b>275 m²</b></code><br>
                 <b>Cost:</b> <code>275 × 12 = <b>₹3,300</b></code><br><br>
                 <b>₹7,200</b> is 600 × 12 — the cost of gravelling the <em>garden</em> rather than
                 the path.<br><br>
                 <b>₹3,000</b> is the instructive one: it is <code>250 × 12</code>, where 250 comes
                 from unrolling the path into a straight strip as long as the garden's perimeter,
                 <code>100 × 2.5</code>. That misses the <b>four corner squares</b>, worth
                 <code>4 × 2.5² = 25 m²</code> — and <code>250 + 25 = 275</code>. ✓ Corners are
                 exactly what outer-minus-inner handles for you.`,
    },
  ],
};
