/* ============================================================
   Quants · Unit 4 · Lesson 1 — Perimeter & Area
   ============================================================ */

import { areaGrid } from '../widgets/mensuration-lab.js';

const PLOT = { w: 12, h: 8, maxScale: 3, unit: 'm' };

export default {
  id: 'q.men.area',
  title: 'Perimeter & Area',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.men.circle',
  nextLabel: 'Next: Circles →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Double the sides, and the area quadruples',
      say: `A plot is <b>12 m by 8 m</b>. Its perimeter is <b>40 m</b> and its area is
            <b>96 m²</b>.<br><br>
            Now double both sides — 24 by 16. The perimeter doubles, to 80 m.<br><br>
            The area does not double. It becomes <b>384 m²</b>, which is <b>four</b> times as much.
            That one asymmetry is most of this unit.`,
      cta: 'Show me why',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'One length, two lengths, three lengths',
      say: `Perimeter is a length. Area is a length times a length. That is the whole reason they
            behave differently when you stretch a shape.`,
      body: `
        <p><b>The formulas you need, and no more.</b></p>
        <ul>
          <li><b>Rectangle:</b> area <code>l × b</code>, perimeter <code>2(l + b)</code>.</li>
          <li><b>Square</b> of side a: area <code>a²</code>, perimeter <code>4a</code>.</li>
          <li><b>Triangle:</b> area <code>½ × base × height</code>. The height is the
              <em>perpendicular</em> height, not the slanted side.</li>
        </ul>
        <p><b>The scaling law.</b> Multiply every length by <b>k</b> and:</p>
        <ul>
          <li>Perimeter is multiplied by <b>k</b> — it is one length.</li>
          <li>Area is multiplied by <b>k²</b> — it is two lengths multiplied together.</li>
        </ul>
        <p>So "each side is increased by 20%" means k = 1.2, and the area becomes
           <code>1.2² = 1.44</code> times as big — a <b>44%</b> increase, not 20% and not 40%.
           This is the successive-change idea from Unit 2 wearing a geometric hat: two 20% rises
           applied to the same figure.</p>
        <p><b>Perimeter does not determine area.</b> A perimeter of 40 m can enclose 96 m² (12 × 8),
           100 m² (10 × 10) or 75 m² (15 × 5). For a fixed perimeter the <b>square</b> encloses the
           most — a fact worth knowing, because questions like to ask for the largest possible area.</p>
        <p><b>Watch the units.</b> Perimeter is in metres; area is in metres <em>squared</em>. If a
           question gives one dimension in centimetres and another in metres, convert before you
           multiply, never after.</p>`,
      cta: 'Let me stretch it',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Count the squares, then stretch',
      say: `The rectangle sits on a grid of one-metre squares, so the area is literally the number
            of squares.<br><br>
            Stretch it and count again. The perimeter keeps pace with the slider; the area runs
            away from it.`,
      widget: areaGrid(PLOT),
      __cfg: PLOT,
      tasks: [
        { label: 'Double every side and watch the area', done: s => s.doubled },
        { label: 'Confirm the area factor is <b>k²</b>, not k', done: s => s.sawSquareLaw },
        { label: 'Try all three scales', done: s => s.seenAll },
      ],
      onComplete: `At ×2 the grid holds four times as many squares; at ×3, nine times. The area
                   factor is always the scale multiplied by itself.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'area-scaling', conceptLabel: 'Area scales as the square of the length',
      input: 'number', answer: 384, unit: 'square metres',
      say: `The plot from the start, with both sides doubled.`,
      context: `A plot of <b>12 m × 8 m</b> has both dimensions <b>doubled</b>.`,
      q: 'What is the new area, in square metres?',
      whyRight: `Correct. The new plot is 24 × 16 = <b>384 m²</b> — four times the original 96,
                 because both of the lengths being multiplied have doubled.`,
      whyWrong: `Do it directly: the plot becomes <code>24 m × 16 m = <b>384 m²</b></code>.<br><br>
                 Or use the law: <code>k = 2</code>, so the area is multiplied by
                 <code>k² = 4</code>, and <code>96 × 4 = 384</code>.<br><br>
                 If you answered <b>192</b>, you doubled the area — but doubling the area would
                 mean stretching only <em>one</em> side. Here both sides grew, and each one doubles
                 the answer, so the total effect is fourfold.<br><br>
                 The perimeter, meanwhile, really does just double: 40 m becomes 80 m.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Where the extra squares come from',
      say: `The grid makes it impossible to misremember.`,
      steps: [
        `<b>At ×1</b> the plot holds 12 × 8 = <b>96</b> squares, with a boundary of 40 m.`,
        `<b>At ×2</b> each row is twice as long <em>and</em> there are twice as many rows. Two
         doublings, so 96 × 2 × 2 = <b>384</b>. The boundary, being a single loop, only doubles.`,
        `<b>At ×3</b> it is 36 × 24 = <b>864</b> squares — nine times — while the perimeter is
         merely tripled to 120 m.`,
        `<b>In percentages.</b> "Each side rises 20%" is k = 1.2, so the area factor is
         <code>1.2² = 1.44</code>: a <b>44%</b> rise. Check it on a square of side 10 → 12:
         area goes 100 → 144. ✓`,
        `<b>And the reverse trap.</b> A 10% <em>cut</em> in each side gives
         <code>0.9² = 0.81</code> — a 19% fall in area, not 20%. Multiplying factors, never adding
         percentages: the same rule as Successive Change.`,
      ],
      takeaway: `Perimeter goes as k, area as k². Convert any percentage change into a factor,
                 square it for area, and read the answer off. Never add the percentages.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'area-triangle', conceptLabel: 'Half base times perpendicular height',
      input: 'number', answer: 54, unit: 'square metres',
      context: `A triangular plot has a base of <b>12 m</b> and a perpendicular height of
                <b>9 m</b>.`,
      q: 'What is its area?',
      why: `<code>Area = ½ × base × height = ½ × 12 × 9 = <b>54 m²</b></code><br><br>
            Note that the height must be <b>perpendicular</b> to the base. If a question gives you a
            slanting side instead, that is not the height — and using it would overstate the area.<br><br>
            A useful sanity check: a triangle is always exactly <b>half</b> the rectangle that
            encloses it on the same base and height. Here that rectangle is 12 × 9 = 108, and
            54 is half of it. ✓`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'area-perimeter-independent', conceptLabel: 'One perimeter, many areas',
      context: `A rectangular field is to be fenced with exactly <b>40 m</b> of fencing.`,
      q: 'Which dimensions enclose the largest area?',
      options: ['15 m × 5 m', '12 m × 8 m', '10 m × 10 m', 'All three enclose the same area'],
      answer: 2,
      whyRight: `Correct — <b>10 × 10 = 100 m²</b>, against 96 for 12 × 8 and only 75 for 15 × 5.
                 For a fixed perimeter, the square is always the biggest.`,
      whyWrong: `All three use exactly 40 m of fence, because <code>2(l + b) = 40</code> means
                 <code>l + b = 20</code> in every case. But the <b>areas</b> differ:<br><br>
                 <code>15 × 5 = <b>75 m²</b></code><br>
                 <code>12 × 8 = <b>96 m²</b></code><br>
                 <code>10 × 10 = <b>100 m²</b></code><br><br>
                 The more lopsided the rectangle, the less it holds. Pushing toward a square packs
                 the most area into the same boundary — which is why "all three are the same" is
                 wrong, and why perimeter alone can never tell you the area.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'area-scaling', conceptLabel: 'Area scales as the square of the length',
      say: `A percentage this time. Do not add it to itself.`,
      context: `The side of a square field is increased by <b>20%</b>.`,
      q: 'By what percentage does its area increase?',
      options: ['20%', '40%', '44%', '144%'],
      answer: 2,
      whyRight: `Correct. The factor is <code>1.2² = 1.44</code>, so the area becomes 144% of what
                 it was — an <b>increase of 44%</b>.`,
      whyWrong: `Turn the percentage into a factor and square it, exactly as in Successive
                 Change.<br><br>
                 <code>k = 1.2</code>, so the area factor is <code>1.2 × 1.2 = <b>1.44</b></code>.<br><br>
                 The new area is <b>144%</b> of the old, which is an <b>increase of 44%</b>.<br><br>
                 <b>40%</b> is 20 + 20 — adding the percentages, which never works because the
                 second 20% applies to an already-enlarged figure. <b>144%</b> is the new area as a
                 proportion of the old, not the increase; the question asked by how much it
                 <em>rose</em>.<br><br>
                 Check on real numbers: side 10 → 12 takes the area from 100 to 144, a rise of 44.
                 ✓`,
    },
  ],
};
