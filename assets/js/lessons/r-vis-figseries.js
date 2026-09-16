/* ============================================================
   Reasoning · Unit 7 · Lesson 5 — Figure Series
   ============================================================ */

import { figSeriesLab } from '../widgets/shape-lab.js';

const SERIES = { start: { sides: 5, rot: 0, dots: 1 }, step: { rot: 90, dots: 1 }, terms: 4 };

export default {
  id: 'r.vis.figseries',
  title: 'Figure Series',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../reasoning/',
  nextLabel: 'Finish the unit',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Four pictures, and everything seems to move',
      say: `A figure series shows you four drawings and asks for the fifth. Every candidate stares at
            all four at once, sees three things changing, and picks whichever option "looks right".<br><br>
            The figures are drawn to overwhelm you. The cure is not to look harder — it is to
            <b>look at one attribute at a time</b>, and ignore everything else while you do.`,
      cta: 'Show me the attributes',
    },
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Isolate one attribute, then the next',
      say: `A figure is a small bundle of independent properties. Track them <b>separately</b>, exactly
            as you split an alphanumeric series into letters and numbers.`,
      body: `
        <p><b>The attributes that change in RAS figure series:</b></p>
        <ul>
          <li><b>Rotation</b> — the whole figure turns by a fixed angle each step. Watch one marked
              corner or line, never the whole shape.</li>
          <li><b>Addition or removal</b> — a dot, line or shape appears each step. Count them; do not
              eyeball.</li>
          <li><b>Reflection</b> — the figure flips. Distinguish this from rotation by checking whether
              the shape has become its own mirror image.</li>
          <li><b>Shading or position</b> — a filled region moves round the figure in a fixed direction.</li>
          <li><b>Size</b> — growing or shrinking at a steady rate.</li>
        </ul>
        <p><b>The method:</b> write the four figures as four short descriptions —
           <em>"5 sides, 0°, 1 dot"</em> then <em>"5 sides, 90°, 2 dots"</em> — and the series becomes a
           table. A table you can read; a picture you can only stare at.</p>
        <p><b>The commonest error</b> is confusing rotation with reflection. A rotated figure keeps its
           handedness; a reflected one reverses it. If a marker that pointed clockwise now points
           anticlockwise, you are looking at a flip, not a turn.</p>`,
      cta: 'Let me isolate one',
    },
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Name the one thing that moves',
      say: `Track the <b>gold marker</b> and the <b>green dots</b> separately. Decide what each is
            doing before you judge the figure as a whole.`,
      widget: figSeriesLab(SERIES),
      __cfg: SERIES,
      tasks: [
        { label: 'Name what changes from figure to figure', done: s => s.answered },
      ],
      onComplete: 'Two attributes moving at once, each perfectly regular on its own.',
      ctaDone: 'Test me',
    },
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'isolate-attribute', conceptLabel: 'Tracking one attribute at a time',
      say: `Commit first. Describe the figures as a table before you decide.`,
      context: `A square contains a single dot. In each successive figure the dot moves to the next
                corner <b>clockwise</b>, and the square rotates <b>90° clockwise</b> as well.`,
      q: 'After four steps, where is the dot relative to the square?',
      options: ['One corner further clockwise', 'Back where it started, relative to the square',
                'Diagonally opposite', 'One corner anticlockwise'],
      answer: 1,
      whyRight: `Correct. The dot advances one corner clockwise <em>and</em> the square turns one
                 quarter-turn clockwise — so the two changes cancel. Relative to the square itself the
                 dot never moves at all, even though on the page everything is turning.`,
      whyWrong: `Track the two attributes separately, then combine.<br><br>
                 <b>Dot:</b> +1 corner clockwise per step.<br>
                 <b>Square:</b> +90° clockwise per step, which carries every corner one position round.<br><br>
                 The dot moves forward exactly as fast as the square carries it, so <b>relative to the
                 square the dot stays on the same corner</b> throughout. On the page it appears to move;
                 relative to the figure it does not.<br><br>
                 This is why "relative to what?" is worth asking before you answer.`,
    },
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Turn the pictures into a table',
      say: `The same series, written down instead of stared at.`,
      steps: [
        `<b>Describe each figure in the same words.</b> Sides, rotation, count of dots. Four figures become four rows: <em>5 sides / 0° / 1 dot</em>, <em>5 sides / 90° / 2 dots</em>, <em>5 sides / 180° / 3 dots</em>, <em>5 sides / 270° / 4 dots</em>.`,
        `<b>Read down each column, not across each row.</b> Sides: 5, 5, 5, 5 — constant, ignore it. Rotation: +90° each time. Dots: +1 each time. Two independent regular series.`,
        `<b>Extend each column separately.</b> Sides stay 5. Rotation reaches 360°, which is the same as 0°. Dots reach 5.`,
        `<b>Reassemble.</b> The answer is a 5-sided figure back at its starting rotation with 5 dots. You never had to picture the transition — only to continue two arithmetic series.`,
      ],
      takeaway: `Write the figures as rows of attributes and read the columns. A figure series is a number series wearing a costume.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'rotation-vs-reflection', conceptLabel: 'Telling rotation from reflection',
      context: `A figure shows an <b>L-shape</b>. In the next figure the L appears <b>backwards</b> —
                its foot now points the other way.`,
      q: 'What transformation has been applied?',
      options: ['A rotation of 90°', 'A reflection', 'A rotation of 180°', 'Cannot be decided'],
      answer: 1,
      why: `An L-shape is <b>chiral</b> — it has a handedness. Rotating it, by any angle, never turns it
            into its mirror image; the foot keeps the same relationship to the upright.<br><br>
            If the foot now points the other way, the figure has been <b>reflected</b>.<br><br>
            The test to carry: pick any two features and ask whether their clockwise order has reversed.
            If it has, it is a flip. If not, it is a turn.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'isolate-attribute', conceptLabel: 'Tracking one attribute at a time',
      context: `A series of figures contains <b>1, 3, 6, 10</b> small circles respectively.`,
      q: 'How many circles are in the next figure?',
      options: ['13', '14', '15', '16'],
      answer: 2,
      why: `Ignore the drawings entirely and treat the counts as a number series — which is exactly
            what they are.<br><br>
            1, 3, 6, 10 has differences <b>2, 3, 4</b>. The differences grow by one, so the next
            difference is <b>5</b>: 10 + 5 = <b>15</b>.<br><br>
            These are the triangular numbers, n(n+1)/2. The moment you extract a count, every technique
            from the Number Series lesson applies unchanged.`,
    },
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'isolate-attribute', conceptLabel: 'Tracking one attribute at a time',
      say: `The series from the widget, continued one step further.`,
      context: `Four figures: a <b>pentagon</b> with a marker, rotating <b>90° clockwise</b> each step,
                and gaining <b>one dot</b> each step. The first has 1 dot at 0°.`,
      q: 'What is the fifth figure?',
      options: ['Pentagon, 360° (back at start), 5 dots',
                'Pentagon, 270°, 5 dots',
                'Hexagon, 0°, 5 dots',
                'Pentagon, 360°, 4 dots'],
      answer: 0,
      whyRight: `Exactly. Sides stay at 5 — that column never moved. Rotation runs 0°, 90°, 180°, 270°,
                 then <b>360°</b>, which is back where it started. Dots run 1, 2, 3, 4, then <b>5</b>.
                 Three columns, each extended on its own.`,
      whyWrong: `Read the columns, not the pictures.<br><br>
                 <b>Sides:</b> 5, 5, 5, 5 → still <b>5</b>. A hexagon was never on the table.<br>
                 <b>Rotation:</b> 0°, 90°, 180°, 270° → <b>360°</b>, i.e. back to the starting orientation.<br>
                 <b>Dots:</b> 1, 2, 3, 4 → <b>5</b>.<br><br>
                 So the fifth figure is a pentagon at its original rotation carrying 5 dots.
                 Options that change the number of sides, or stop the rotation early, break a column
                 that was perfectly regular.`,
    },
  ],
};
