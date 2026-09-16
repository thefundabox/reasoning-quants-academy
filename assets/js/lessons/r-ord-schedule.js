/* ============================================================
   Reasoning · Unit 4 · Lesson 5 — Scheduling Grids

   Puzzle verified by brute force: exactly one solution, and every
   clue is load-bearing (removing either non-structural clue leaves
   two solutions).
     Aarti Mon · Chirag Tue · Divya Wed · Bhavesh Thu
   ============================================================ */

import { gridTable } from '../widgets/grid-table.js';

const GRID = {
  title: 'Who is on duty on which day?',
  rows: ['Aarti', 'Bhavesh', 'Chirag', 'Divya'],
  cols: ['Mon', 'Tue', 'Wed', 'Thu'],
  clues: [
    'Bhavesh takes Thursday.',
    'Divya is on <b>neither</b> Monday nor Thursday.',
    'Chirag is on the day <b>immediately after</b> Aarti.',
  ],
  solution: { Aarti: 'Mon', Bhavesh: 'Thu', Chirag: 'Tue', Divya: 'Wed' },
};

export default {
  id: 'r.ord.schedule',
  title: 'Scheduling Grids',
  xp: 45,
  backHref: '../reasoning/',
  nextHref: '../reasoning/',
  nextLabel: 'Finish the unit',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Four people, four days, and no line to sit on',
      say: `Four officers — <b>Aarti, Bhavesh, Chirag and Divya</b> — each take exactly one duty day
            from <b>Monday to Thursday</b>.<br><br>
            <b>Bhavesh takes Thursday. Divya is on neither Monday nor Thursday.
            Chirag is on the day immediately after Aarti.</b><br><br>
            There is no row to draw and no circle to sit in. What replaces them is a <b>grid of ticks
            and crosses</b> — and the marks that win this question are the <b>crosses</b>, not the ticks.`,
      cta: 'Show me the grid',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Cross out more than you tick',
      say: `A matching puzzle pairs each person with exactly one option. The grid makes that constraint
            visible — and it does the deductions for you if you keep it honest.`,
      body: `
        <p>Draw people down the side, options across the top. Then work two rules relentlessly:</p>
        <ol>
          <li><b>One tick per row and per column.</b> The moment you write a tick, cross out the rest of
              that row <em>and</em> the rest of that column. Each person takes one day; each day takes one person.</li>
          <li><b>A row or column with only one empty cell left is solved.</b> If three days are crossed
              out for Divya, the fourth is hers whether or not any clue said so.</li>
        </ol>
        <p>That second rule is where most of the answer comes from, and it is why the crosses matter more
           than the ticks. Candidates who only record what they are told run out of clues; candidates who
           record what they have <em>eliminated</em> finish the grid.</p>
        <p>Three kinds of clue, handled differently:</p>
        <ul>
          <li><b>Direct clues</b> — "Bhavesh takes Thursday" — are a tick. Enter them first.</li>
          <li><b>Negative clues</b> — "Divya is not on Monday" — are a single cross. Weak alone, decisive
              once the grid is half full.</li>
          <li><b>Ordering clues</b> — "Chirag is the day immediately after Aarti" — cannot be entered as one
              mark at all. Test them as <b>pairs</b>: list every possible (Aarti, Chirag) pair of consecutive
              days, then delete the ones the crosses have already killed. Whatever survives is the answer.</li>
        </ul>`,
      cta: 'Let me fill one',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Tick once, and watch the crosses appear',
      say: `Click a cell to cycle <b>blank → ✓ → ✗</b>. When you tick, I cross out the rest of that
            row and column automatically — because that is exactly what you should be doing by hand.`,
      widget: gridTable(GRID),
      __cfg: GRID,
      // exposed so the harness can brute-force it: must have exactly one solution
      __puzzle: {
        rows: ['Aarti', 'Bhavesh', 'Chirag', 'Divya'],
        cols: ['Mon', 'Tue', 'Wed', 'Thu'],
        solution: { Aarti: 'Mon', Bhavesh: 'Thu', Chirag: 'Tue', Divya: 'Wed' },
        test: (m, i) => m.Bhavesh === 'Thu'
                     && m.Divya !== 'Mon' && m.Divya !== 'Thu'
                     && i('Chirag') === i('Aarti') + 1,
      },
      tasks: [
        { label: 'Place at least one <b>tick</b> and see the crosses propagate', done: s => s.usedAuto },
        { label: 'Give every person a day', done: s => s.complete },
        { label: 'Get the whole grid <b>correct</b>', done: s => s.correct === true },
      ],
      onComplete: 'The crosses did most of that. You only ever placed a handful of ticks.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'grid-elimination', conceptLabel: 'Solving by elimination, not by ticks',
      say: `Commit first. Look for the row or column with the fewest options left.`,
      context: `Three friends — <b>K, L, M</b> — each order one drink: chai, coffee or lassi.
                <b>K does not order chai. L does not order chai. M does not order coffee.</b>`,
      q: 'What does M order?',
      options: ['Coffee', 'Chai', 'Lassi', 'Cannot be decided'],
      answer: 1,
      whyRight: `Correct, and note how you got there: nobody was <em>told</em> to order chai.
                 K and L are both crossed out of the chai column, so the only cell left in that column
                 belongs to <b>M</b>. A column with one empty cell is solved.`,
      whyWrong: `Work the <b>chai column</b>, not the rows. K is crossed out of chai, and L is crossed
                 out of chai. That leaves exactly one empty cell in the column — <b>M</b>.<br><br>
                 Somebody must order the chai, so M does. The clue "M does not order coffee" is not
                 even needed for this step; it settles K and L afterwards.<br><br>
                 This is the whole technique: the answer came from three crosses and no ticks.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The duty roster, solved',
      say: `Watch where each mark comes from — and how little of it was ever stated.`,
      steps: [
        `<b>Enter the direct clue.</b> "Bhavesh takes Thursday" is a tick. Immediately cross out the rest of Bhavesh's row and the whole Thursday column, so nobody else can take Thursday.`,
        `<b>Enter the negative clue.</b> "Divya is on neither Monday nor Thursday" gives two crosses. Thursday was already dead, so the useful one is Monday. On its own it proves nothing yet — it is a deposit for later.`,
        `<b>Handle the ordering clue as pairs.</b> Consecutive (Aarti, Chirag) options are (Mon, Tue), (Tue, Wed) and (Wed, Thu). Thursday belongs to Bhavesh, so <b>(Wed, Thu) dies</b>. If Aarti took Tuesday and Chirag Wednesday, then Divya would be left with Monday — which her clue forbids, so <b>(Tue, Wed) dies</b> too.`,
        `<b>One pair survives.</b> Aarti on Monday, Chirag on Tuesday. Wednesday now has a single empty cell, so it is <b>Divya's</b> — even though no clue ever named her day. Final roster: <b>Aarti Monday, Chirag Tuesday, Divya Wednesday, Bhavesh Thursday.</b>`,
      ],
      takeaway: `Ticks come from clues; answers come from crosses. After every tick, sweep the row and the column — that sweep is where the marks are.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'ordering-pairs', conceptLabel: 'Testing an ordering clue as pairs',
      context: `Four students present on Monday, Tuesday, Wednesday and Thursday, one each.
                <b>Ravi presents the day immediately before Sunita.</b>
                <b>Sunita does not present on Tuesday.</b>`,
      q: 'Which pair of days could Ravi and Sunita take?',
      options: ['Mon and Tue', 'Tue and Wed', 'Thu and Mon', 'Any of these'],
      answer: 1,
      why: `List the pairs first: (Mon, Tue), (Tue, Wed), (Wed, Thu). Days do not wrap around, so
            (Thu, Mon) was never on the table.<br><br>
            Sunita is not on Tuesday, which kills (Mon, Tue). That leaves (Tue, Wed) and (Wed, Thu),
            and of the options offered only <b>Tue and Wed</b> appears.<br><br>
            Ordering clues never fit in a single cell. Enumerate the pairs, then let the crosses delete them.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'grid-elimination', conceptLabel: 'Solving by elimination, not by ticks',
      context: `Four people take four different subjects. After entering all the clues, <b>Neha's row</b>
                has crosses against History, Geography and Economics.`,
      q: 'What can you conclude?',
      options: ['Nothing yet — no clue named Neha\'s subject',
                'Neha takes the fourth subject',
                'Neha takes History',
                'The puzzle is inconsistent'],
      answer: 1,
      why: `Every person takes exactly one subject, so Neha's row must contain exactly one tick.
            Three of her four cells are crossed out, so the fourth is hers — <b>whether or not any clue
            ever mentioned it</b>.<br><br>
            This is the deduction candidates most often miss: they wait to be told, and the paper never
            tells them. Then sweep that subject's column — everyone else is now crossed out of it.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'grid-elimination', conceptLabel: 'Solving by elimination, not by ticks',
      say: `The roster from the start. Build the grid and read it off.`,
      context: `Aarti, Bhavesh, Chirag and Divya each take one duty day from Monday to Thursday.
                <b>Bhavesh takes Thursday. Divya is on neither Monday nor Thursday.
                Chirag is on the day immediately after Aarti.</b>`,
      q: 'Who is on duty on Wednesday?',
      options: ['Aarti', 'Chirag', 'Divya', 'Cannot be decided'],
      answer: 2,
      whyRight: `Exactly — and <b>Divya</b> is the one person whose day was never stated.
                 Bhavesh holds Thursday. The consecutive pair must be Aarti Monday and Chirag Tuesday,
                 because (Tue, Wed) would strand Divya on Monday and (Wed, Thu) collides with Bhavesh.
                 Wednesday is then the last empty cell, and it is Divya's.`,
      whyWrong: `Bhavesh takes Thursday, so cross out that column for everyone else.<br><br>
                 The (Aarti, Chirag) pair can be (Mon, Tue), (Tue, Wed) or (Wed, Thu).
                 (Wed, Thu) collides with Bhavesh. (Tue, Wed) would leave only Monday for Divya,
                 which her clue forbids. So the pair is <b>Aarti Monday, Chirag Tuesday</b>.<br><br>
                 That leaves exactly one empty cell on Wednesday: <b>Divya</b> — derived entirely
                 from crosses, since no clue ever named her day.`,
    },
  ],
};
