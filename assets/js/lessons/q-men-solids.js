/* ============================================================
   Quants · Unit 4 · Lesson 4 — Volume & Surface Area
   ============================================================ */

import { solidLab } from '../widgets/mensuration-lab.js';

const SOLIDS = {
  maxScale: 3,
  solids: [
    { type: 'cube', label: 'Cube (side 6)', dims: [6],
      note: 'At side 6, the volume and the surface area happen to be the same number — 216. That is a coincidence of this one size, not a rule.' },
    { type: 'cuboid', label: 'Cuboid (10 × 8 × 5)', dims: [10, 8, 5] },
    { type: 'cylinder', label: 'Cylinder (r 7, h 10)', dims: [7, 10] },
    { type: 'cone', label: 'Cone (r 7, h 24)', dims: [7, 24] },
  ],
};

export default {
  id: 'q.men.solids',
  title: 'Volume & Surface Area',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.avg.centre',
  nextLabel: 'Next unit: Mean, Median & Mode →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Double the box, and it holds eight times as much',
      say: `A cube of side 6 has a volume of <b>216</b> and a surface area of <b>216</b>. Amusing,
            and a coincidence of that one size.<br><br>
            Now double every edge. The surface area becomes <b>four</b> times bigger. The volume
            becomes <b>eight</b> times bigger.<br><br>
            Painting it costs four times as much. Filling it costs eight.`,
      cta: 'Show me the split',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Two lengths, or three',
      say: `Surface area is made of two lengths multiplied; volume is made of three. Every formula
            below is an instance of that, and so is every scaling question.`,
      body: `
        <ul>
          <li><b>Cube</b> of side a: <code>V = a³</code>, <code>S = 6a²</code>.</li>
          <li><b>Cuboid</b> l × b × h: <code>V = lbh</code>,
              <code>S = 2(lb + bh + hl)</code> — three pairs of identical faces.</li>
          <li><b>Cylinder</b> radius r, height h: <code>V = πr²h</code>. The
              <b>curved</b> surface is <code>2πrh</code> — the rectangle you would get by unrolling
              it — and the <b>total</b> surface adds the two circular ends:
              <code>2πr(r + h)</code>.</li>
          <li><b>Cone</b> radius r, height h: <code>V = ⅓πr²h</code> — exactly a third of the
              cylinder on the same base and height. Its curved surface is <code>πrl</code>, where
              <b>l</b> is the <em>slant</em> height, <code>l = √(r² + h²)</code> — not h.</li>
        </ul>
        <p><b>The slant height is where cones are lost.</b> For r = 7 and h = 24,
           <code>l = √(49 + 576) = √625 = <b>25</b></code>. Examiners choose 7-24-25 and 5-12-13
           precisely so the root comes out whole — another signal, like the multiples of 7 for π.</p>
        <p><b>The scaling law, extended.</b> Multiply every dimension by <b>k</b>:</p>
        <ul>
          <li>Lengths (edges, radii, slant) × <b>k</b></li>
          <li>Areas (surface) × <b>k²</b></li>
          <li>Volumes × <b>k³</b></li>
        </ul>
        <p>So doubling every edge multiplies the surface by 4 — a <b>300% increase</b> — and the
           volume by 8, a <b>700% increase</b>. Read the question carefully: "becomes how many
           times" wants 4, while "increases by what percent" wants 300.</p>`,
      cta: 'Let me scale the solids',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Four solids, one law',
      say: `Pick a solid, then scale it. Watch the last cell: the two factors always come out as
            <b>k²</b> and <b>k³</b>, whatever the shape.<br><br>
            That is worth more than any single formula — it works for shapes you have never been
            taught.`,
      widget: solidLab(SOLIDS),
      __cfg: SOLIDS,
      tasks: [
        { label: 'Look at all four solids', done: s => s.seenAll },
        { label: 'Double the dimensions and check the two factors', done: s => s.doubled },
        { label: 'Confirm volume follows <b>k³</b> and surface <b>k²</b>',
          done: s => s.cubeLawHolds && s.squareLawHolds && s.k > 1 },
      ],
      onComplete: `Four different shapes, and the same two factors every time. The law belongs to
                   dimension, not to the formula.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'solid-cylinder', conceptLabel: 'Cylinder volume is π r² h',
      input: 'number', answer: 1540, unit: 'cubic units',
      say: `Cancel the seven first, as always.`,
      context: `A cylindrical tank has radius <b>7 m</b> and height <b>10 m</b>. Take π as
                <b>22/7</b>.`,
      q: 'What is its volume, in cubic metres?',
      whyRight: `Correct. <code>22/7 × 49 × 10</code> — the 7 cancels into the 49 to leave
                 <code>22 × 7 × 10 = <b>1,540 m³</b></code>.`,
      whyWrong: `<code>V = πr²h = 22/7 × 7² × 10</code><br><br>
                 Cancel before multiplying: the 7 goes into 49 seven times, leaving
                 <code>22 × 7 × 10 = <b>1,540</b></code>.<br><br>
                 If you answered <b>440</b>, that is the <em>curved surface area</em>,
                 <code>2πrh</code> — an area, not a volume, and it carries square units rather than
                 cubic ones. Checking the units of your own answer catches this instantly.<br><br>
                 The total surface, if you needed it, is <code>2πr(r + h) = 2 × 22/7 × 7 × 17 =
                 748 m²</code>.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The four solids, worked',
      say: `Then the law that outlives all four formulas.`,
      steps: [
        `<b>Cuboid 10 × 8 × 5.</b> <code>V = 400</code>. Surface:
         <code>2(80 + 40 + 50) = <b>340</b></code> — three pairs of faces, so compute the three
         distinct rectangles and double the total.`,
        `<b>Cylinder r = 7, h = 10.</b> <code>V = 22/7 × 49 × 10 = <b>1,540</b></code>. Curved
         surface <code>2 × 22/7 × 7 × 10 = <b>440</b></code>; total surface adds the two ends,
         giving <b>748</b>.`,
        `<b>Cone r = 7, h = 24.</b> <code>V = ⅓ × 22/7 × 49 × 24 = <b>1,232</b></code> — and the
         cylinder on the same base and height is 3,696, exactly three times it. The slant height is
         <code>√(49 + 576) = 25</code>, so the curved surface is
         <code>22/7 × 7 × 25 = <b>550</b></code>.`,
        `<b>The coincidence at side 6.</b> <code>6³ = 216</code> and <code>6 × 6² = 216</code>. It
         holds at 6 and nowhere else — at side 5 the volume is 125 against a surface of 150.`,
        `<b>And the law.</b> Scale any of these by k and the volume goes as <b>k³</b> while the
         surface goes as <b>k²</b>. Double a cube of side 5: surface 150 → 600 (×4), volume
         125 → 1,000 (×8). No formula was needed to know that.`,
      ],
      takeaway: `Volume multiplies three lengths, surface multiplies two — so under scaling they go
                 as k³ and k². For cones, find the slant height first; for cylinders, cancel the 7
                 before you multiply.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'solid-cuboid', conceptLabel: 'Three pairs of faces',
      input: 'number', answer: 340, unit: 'square units',
      context: `A closed box measures <b>10 cm × 8 cm × 5 cm</b>.`,
      q: 'What is its total surface area?',
      why: `A cuboid has three <b>pairs</b> of identical faces, so find one of each and double the
            sum.<br><br>
            <code>10 × 8 = 80</code> · <code>8 × 5 = 40</code> · <code>5 × 10 = 50</code><br>
            <code>S = 2(80 + 40 + 50) = 2 × 170 = <b>340 cm²</b></code><br><br>
            Its volume, for contrast, is <code>10 × 8 × 5 = 400 cm³</code> — a similar number, but
            a different <em>kind</em> of number. Watch the units: cm² for the surface, cm³ for the
            volume.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'solid-cone-slant', conceptLabel: 'A cone needs the slant height',
      input: 'number', answer: 550, unit: 'square units',
      context: `A cone has radius <b>7 cm</b> and vertical height <b>24 cm</b>. Take π as
                <b>22/7</b>.`,
      q: 'What is its curved surface area?',
      why: `The curved surface uses the <b>slant</b> height, not the vertical one.<br><br>
            <code>l = √(r² + h²) = √(49 + 576) = √625 = <b>25 cm</b></code><br><br>
            <code>Curved surface = πrl = 22/7 × 7 × 25 = <b>550 cm²</b></code><br><br>
            Using h = 24 instead would give 528 — plausible, and wrong. The 7-24-25 triple is
            chosen so the root is whole; whenever you see 7 and 24, or 5 and 12, expect a clean
            slant height and reach for it immediately.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'solid-scaling', conceptLabel: 'Surface goes as k², volume as k³',
      say: `Last question of the unit. Read what is being asked for.`,
      context: `Every edge of a cube is <b>doubled</b>.`,
      q: 'By what percentage does its surface area increase?',
      options: ['100%', '200%', '300%', '400%'],
      answer: 2,
      whyRight: `Correct. The surface becomes <code>2² = 4</code> times as big, and going from 1 to
                 4 is an <b>increase of 300%</b>.`,
      whyWrong: `Two steps, and the second is where the question is really aimed.<br><br>
                 <b>The factor.</b> Surface area is two lengths multiplied, so doubling every edge
                 multiplies it by <code>2² = <b>4</b></code>.<br><br>
                 <b>The increase.</b> Becoming 4 times as big is a rise of <b>3</b> times the
                 original — that is <b>300%</b>, not 400%.<br><br>
                 <b>400%</b> is the new surface as a proportion of the old; the question asked by how
                 much it <em>increased</em>. <b>100%</b> is the increase in each <em>edge</em>.<br><br>
                 Check on a cube of side 5 → 10: surface 150 → 600. The rise is 450, and
                 <code>450 ÷ 150 = 3 = 300%</code>. ✓<br><br>
                 (The volume, meanwhile, goes ×8 — an increase of 700%.)`,
    },
  ],
};
