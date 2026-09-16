/* ============================================================
   Quants · Unit 4 · Lesson 2 — Circles
   ============================================================ */

import { circleLab } from '../widgets/mensuration-lab.js';

const CIRCLES = { radii: [7, 14, 21], start: 1 };

export default {
  id: 'q.men.circle',
  title: 'Circles',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.men.paths',
  nextLabel: 'Next: Paths, Borders & Tiling →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Why the radius is always 7, 14 or 21',
      say: `Look at the radius in any circle question on an RPSC paper. It is <b>7</b>, or
            <b>14</b>, or <b>21</b>, or <b>35</b>. Almost never 9 or 13.<br><br>
            That is not a coincidence — it is a <b>message</b>. π is meant to be <b>22/7</b> here,
            and a radius divisible by 7 makes the sevens cancel so the answer comes out whole.<br><br>
            Reading that signal saves you from a page of decimals.`,
      cta: 'Show me the two formulas',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Two formulas, and one decision',
      say: `A circle needs less memorising than any other shape. There are two formulas, and the
            only real skill is knowing which value of π the question wants.`,
      body: `
        <ul>
          <li><b>Circumference = 2πr</b> — a length, so it grows in step with the radius.</li>
          <li><b>Area = πr²</b> — two lengths, so it grows as the <b>square</b> of the radius, just
              like every other area in this unit.</li>
        </ul>
        <p><b>Choosing π.</b> If the radius (or diameter) is a multiple of <b>7</b>, use
           <b>22/7</b> — the sevens cancel and both answers land on whole numbers. Otherwise the
           question almost always intends <b>3.14</b>. If neither gives a clean answer, you have
           probably misread a dimension.</p>
        <p><b>Worked once, to fix the pattern.</b> For r = 14:</p>
        <ul>
          <li><code>C = 2 × 22/7 × 14 = 2 × 22 × 2 = <b>88</b></code> — cancel the 7 into the 14 first.</li>
          <li><code>A = 22/7 × 14² = 22/7 × 196 = 22 × 28 = <b>616</b></code> — again, cancel before
              you multiply.</li>
        </ul>
        <p><b>Always cancel first.</b> Working out 196 × 22 and then dividing by 7 is three times the
           arithmetic and three times the risk.</p>
        <p><b>Going backwards.</b> Given a circumference of 44, the radius is
           <code>44 ÷ (2 × 22/7) = 44 × 7 ÷ 44 = <b>7</b></code>, and the area is then 154. Half a
           circle has half the area but <em>not</em> half the perimeter — a semicircle's boundary is
           <code>πr + 2r</code>, because the straight diameter counts too.</p>`,
      cta: 'Let me pick a radius',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Three radii, all multiples of seven',
      say: `Each of these radii is a multiple of 7, and each gives whole numbers for both the
            circumference and the area.<br><br>
            Look at the third cell as you switch: that is the same area computed with 3.14 instead.
            Notice how close it is — and how much uglier.`,
      widget: circleLab(CIRCLES),
      __cfg: CIRCLES,
      tasks: [
        { label: 'Look at all three radii', done: s => s.seenAll },
        { label: 'Confirm both answers come out <b>whole</b>', done: s => s.wholeAnswers },
      ],
      onComplete: `Whole answers every time, because 22/7 meets a radius the 7 divides into. That
                   is the examiner telling you which π to use.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'circle-area', conceptLabel: 'Area is π r², with the sevens cancelled first',
      input: 'number', answer: 616, unit: 'square units',
      say: `Cancel before you multiply.`,
      context: `A circular field has a radius of <b>14 m</b>. Take π as <b>22/7</b>.`,
      q: 'What is its area, in square metres?',
      whyRight: `Correct. <code>22/7 × 14 × 14</code> — cancel the 7 into one 14 to leave
                 <code>22 × 2 × 14 = <b>616 m²</b></code>.`,
      whyWrong: `<code>Area = πr² = 22/7 × 14²</code><br><br>
                 Cancel first: the 7 goes into one of the 14s twice, leaving
                 <code>22 × 2 × 14 = <b>616</b></code>.<br><br>
                 If you answered <b>88</b>, that is the <em>circumference</em> — 2πr. The two are
                 easy to swap under pressure; the area is the bigger number and carries square
                 units.<br><br>
                 A quick sanity check: the circle sits inside a 28 × 28 square of area 784, and
                 fills a bit over three-quarters of it. 616 is 78.6% of 784 — exactly right, since
                 a circle always fills π/4 ≈ 78.5% of its bounding square.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Forwards, backwards and halved',
      say: `The same two formulas, used four ways.`,
      steps: [
        `<b>Forwards, r = 21.</b> <code>C = 2 × 22/7 × 21 = <b>132</b></code> and
         <code>A = 22/7 × 441 = 22 × 63 = <b>1,386</b></code>. Cancel the 7 into the 21 first and
         there is no long multiplication at all.`,
        `<b>Backwards from a circumference.</b> C = 44 gives
         <code>r = 44 × 7 ÷ 44 = <b>7</b></code>, and then <code>A = 22/7 × 49 = <b>154</b></code>.
         Find the radius first; every other quantity follows from it.`,
        `<b>A semicircle.</b> Half the area — for r = 14 that is <code>616 ÷ 2 = <b>308</b></code>.
         But its <em>boundary</em> is not half the circumference: it is the curved half
         <b>plus the diameter</b>, <code>44 + 28 = 72</code>.`,
        `<b>Area still goes as the square.</b> From r = 7 to r = 14 the radius doubles and the area
         goes 154 → 616, four times over. Circles obey the same k² law as rectangles.`,
        `<b>A ring, to look ahead.</b> A path around a circular park is just outer area minus inner:
         for a park of r = 21 with a 3.5 m path, <code>22/7 × (24.5² − 21²) = <b>500.5 m²</b></code>.
         That outer-minus-inner move is the whole of the next lesson.`,
      ],
      takeaway: `C = 2πr, A = πr². Cancel the 7 before multiplying. A radius that is a multiple of 7
                 is the examiner saying "use 22/7" — and a semicircle's boundary always includes the
                 diameter.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'circle-backwards', conceptLabel: 'Find the radius first',
      input: 'number', answer: 154, unit: 'square units',
      context: `A circular pond has a circumference of <b>44 m</b>. Take π as <b>22/7</b>.`,
      q: 'What is its area?',
      why: `Find the <b>radius</b> before anything else.<br><br>
            <code>2 × 22/7 × r = 44</code>, so <code>44r/7 = 44</code> and <code>r = <b>7 m</b></code>.<br><br>
            Then <code>A = 22/7 × 7² = 22 × 7 = <b>154 m²</b></code>.<br><br>
            The 44 appearing on both sides is the giveaway that this was built around r = 7. Whenever
            a circumference is a multiple of 44, the radius is a multiple of 7.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'circle-semicircle', conceptLabel: 'A semicircle keeps its diameter',
      input: 'number', answer: 308, unit: 'square units',
      context: `A semicircular plot has a radius of <b>14 m</b>.`,
      q: 'What is its area?',
      why: `Half of a full circle's area:<br><br>
            <code>½ × 22/7 × 14² = ½ × 616 = <b>308 m²</b></code><br><br>
            Area halves cleanly. Its <b>perimeter</b> does not: the boundary is the curved half
            (<code>πr = 44</code>) <em>plus</em> the straight diameter (<code>28</code>), giving
            <b>72 m</b> — not half of 88.<br><br>
            Whenever a shape is cut, ask whether the cut created a new edge. Area never gains one;
            perimeter usually does.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'circle-ring', conceptLabel: 'A ring is outer area minus inner',
      say: `A circular path. Same move as a rectangular one.`,
      context: `A circular park has a radius of <b>21 m</b>. A path <b>3.5 m wide</b> runs all the
                way around the outside of it.`,
      q: 'What is the area of the path?',
      options: ['500.5 m²', '462 m²', '1,886.5 m²', '231 m²'],
      answer: 0,
      whyRight: `Correct. The outer radius is 24.5, so the path is
                 <code>22/7 × (24.5² − 21²) = 22/7 × 159.25 = <b>500.5 m²</b></code>.`,
      whyWrong: `A path is always <b>outer minus inner</b> — never a formula of its own.<br><br>
                 <b>Outer radius:</b> <code>21 + 3.5 = 24.5 m</code>. The width is added
                 <em>once</em> to the radius, unlike a rectangle where it is added at both ends.<br><br>
                 <b>Outer area:</b> <code>22/7 × 24.5² = 1,886.5</code><br>
                 <b>Inner area:</b> <code>22/7 × 21² = 1,386</code><br>
                 <b>Path:</b> <code>1,886.5 − 1,386 = <b>500.5 m²</b></code><br><br>
                 <b>1,886.5</b> is the outer area on its own — the whole park <em>plus</em> the
                 path.<br><br>
                 <b>462</b> is <code>132 × 3.5</code>: unrolling the path into a straight strip as
                 long as the <em>inner</em> circumference. That undercounts, because the outer edge
                 of a ring is longer than the inner one. (<b>231</b> is half of that same mistake.)
                 The true answer, 500.5, sits above 462 — exactly as it must.`,
    },
  ],
};
