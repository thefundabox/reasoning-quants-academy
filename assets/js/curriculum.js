/* ============================================================
   The two academies, mapped end to end.

   `ready: true`  → a built lesson, playable now
   otherwise      → shown on the path as a planned tile, so the
                    learner can see the whole road ahead (Brilliant
                    shows the full path; hiding it kills motivation)
   ============================================================ */

import { academyOn, chapterOn } from './config.js';

export const ACADEMIES = {
  reasoning: {
    id: 'reasoning',
    name: 'Reasoning Academy',
    tagline: 'Think in pictures. Never in guesses.',
    blurb: 'Logical reasoning, analytical puzzles and mental ability — every idea taught as something you can draw, move and test.',
    theme: 'theme-reason',
    href: 'reasoning/',
    units: [
      {
        n: 1, title: 'Foundations of Reasoning',
        sub: 'How an examiner builds a question — and a trap.',
        lessons: [
          { id: 'r.found.anatomy',   title: 'Anatomy of a Trap',        desc: 'The six ways RPSC hides the answer in plain sight.', mins: 8, ready: true },
          { id: 'r.found.assume',    title: 'Statement & Assumption',   desc: 'What must be taken for granted for a claim to stand.', mins: 10, ready: true },
          { id: 'r.found.argument',  title: 'Statement & Argument',     desc: 'Strong vs weak arguments, and why length never wins.', mins: 10, ready: true },
          { id: 'r.found.action',    title: 'Course of Action',         desc: 'Judging remedies: is it practical, and does it fit?', mins: 9, ready: true },
          { id: 'r.found.conclude',  title: 'Statement & Conclusion',   desc: 'Only what follows — nothing the world tells you.', mins: 10, ready: true },
        ],
      },
      {
        n: 2, title: 'Family & Relations',
        sub: 'Turn any tangled sentence into a diagram you can read off.',
        lessons: [
          { id: 'r.rel.five-marks',  title: 'The Five Marks',           desc: 'The whole symbol language of family trees, in one sitting.', mins: 12, ready: true },
          { id: 'r.rel.ladder',      title: 'The Generation Ladder',    desc: 'Counting levels turns "how related?" into arithmetic.', mins: 10, ready: true },
          { id: 'r.rel.photo',       title: 'Pointing at a Photograph', desc: 'The classic form — and why you must read it backwards.', mins: 11, ready: true },
          { id: 'r.rel.coded',       title: 'Coded Relations',          desc: 'When A $ B # C replaces the words entirely.', mins: 12, ready: true },
        ],
      },
      {
        n: 3, title: 'Space & Direction',
        sub: 'Walks, turns, shadows — geometry hiding inside a story.',
        lessons: [
          { id: 'r.dir.compass',     title: 'Compass & Turns',          desc: 'Left and right from the walker\'s view, never yours.', mins: 9, ready: true },
          { id: 'r.dir.displace',    title: 'Net Displacement',         desc: 'Why the answer is always a right triangle.', mins: 11, ready: true },
          { id: 'r.dir.shadow',      title: 'Sun & Shadow',             desc: 'Morning west, evening east — and what that fixes.', mins: 8, ready: true },
          { id: 'r.dir.mirror',      title: 'The Mirror Trap',          desc: 'Rows facing you flip every left and right.', mins: 9, ready: true },
        ],
      },
      {
        n: 4, title: 'Order & Arrangement',
        sub: 'Seat them, rank them, schedule them — with clues alone.',
        lessons: [
          { id: 'r.ord.ranking',     title: 'Ranking Lines',            desc: 'Three formulas that answer every position question.', mins: 8, ready: true },
          { id: 'r.ord.linear',      title: 'Linear Seating',           desc: 'Anchor the fixed clue first. Always.', mins: 11, ready: true },
          { id: 'r.ord.circular',    title: 'Circular Seating',         desc: 'Facing in, facing out, and the reversal it causes.', mins: 12, ready: true },
          { id: 'r.ord.floors',      title: 'Floors & Boxes',           desc: 'Stacked puzzles and the grid that cracks them.', mins: 12, ready: true },
          { id: 'r.ord.schedule',    title: 'Scheduling Grids',         desc: 'Days, subjects, people — the tick-and-cross table.', mins: 11, ready: true },
        ],
      },
      {
        n: 5, title: 'Codes & Patterns',
        sub: 'Letters become numbers; numbers become rules.',
        lessons: [
          { id: 'r.code.wheel',      title: 'The Cipher Wheel',         desc: 'A1Z26 and shift codes made mechanical.', mins: 10, ready: true },
          { id: 'r.code.families',   title: 'The Five Code Families',   desc: 'Identify the family from one letter pair.', mins: 12, ready: true },
          { id: 'r.code.series-num', title: 'Number Series',            desc: 'Differences, ratios, then squares — in that order.', mins: 11, ready: true },
          { id: 'r.code.series-let', title: 'Letter & Mixed Series',    desc: 'Alphanumeric jumps and the position trick.', mins: 10, ready: true },
          { id: 'r.code.analogy',    title: 'Analogy & Odd One Out',    desc: 'Name the relationship before you look at options.', mins: 9, ready: true },
        ],
      },
      {
        n: 6, title: 'Logic & Deduction',
        sub: 'Circles on paper settle arguments words cannot.',
        lessons: [
          { id: 'r.log.sets',        title: 'Three Kinds of Set',       desc: 'Subset, overlap, disjoint — everything is built from these.', mins: 9, ready: true },
          { id: 'r.log.syllogism',   title: 'Syllogism Basics',         desc: 'All + All, Some + Some, and what proves nothing.', mins: 12, ready: true },
          { id: 'r.log.break',       title: 'Breaking a Conclusion',    desc: 'One counter-drawing kills a conclusion. Find it.', mins: 11, ready: true },
          { id: 'r.log.venn3',       title: 'Venn for Three Categories',desc: 'Choosing the right diagram for real-world nouns.', mins: 10, ready: true },
        ],
      },
      {
        n: 7, title: 'Visual Reasoning',
        sub: 'What the eye must count, fold and rotate.',
        lessons: [
          { id: 'r.vis.count',       title: 'Figure Counting',          desc: 'Count by size class — never at random.', mins: 11, ready: true },
          { id: 'r.vis.mirror',      title: 'Mirror & Water Images',    desc: 'Which axis flips, and what stays put.', mins: 9, ready: true },
          { id: 'r.vis.fold',        title: 'Paper Folding & Punching', desc: 'Unfold in reverse, one crease at a time.', mins: 10, ready: true },
          { id: 'r.vis.dice',        title: 'Cubes & Dice',             desc: 'Opposite faces, and painted-cube counting.', mins: 12, ready: true },
          { id: 'r.vis.figseries',   title: 'Figure Series',            desc: 'Rotation, addition, reflection — isolate one change.', mins: 10, ready: true },
        ],
      },
    ],
  },

  quants: {
    id: 'quants',
    name: 'Quants Academy',
    tagline: 'See the number before you compute it.',
    blurb: 'Basic numeracy from place value to data interpretation — built on estimation, benchmarks and pictures, not on memorised formulas.',
    theme: 'theme-quant',
    href: 'quants/',
    units: [
      {
        n: 1, title: 'Number Sense',
        sub: 'The habits that make every later chapter fast.',
        lessons: [
          { id: 'q.num.estimate',    title: 'Estimate Before You Solve', desc: 'Getting within 10% in four seconds.', mins: 9, ready: true },
          { id: 'q.num.divis',       title: 'Divisibility & Factors',    desc: 'The tests for 3, 4, 6, 8, 9 and 11.', mins: 10, ready: true },
          { id: 'q.num.lcm',         title: 'LCM & HCF',                 desc: 'Bells, buses and tiles — the two questions they hide in.', mins: 11, ready: true },
          { id: 'q.num.convert',     title: 'Fractions ⇄ Percents',      desc: 'The twenty conversions worth knowing cold.', mins: 10, ready: true },
          { id: 'q.num.powers',      title: 'Squares, Cubes & Roots',    desc: 'Up to 30², and how to spot a perfect square.', mins: 9, ready: true },
        ],
      },
      {
        n: 2, title: 'Ratio, Percentage & Trade',
        sub: 'The highest-yield block in the paper.',
        lessons: [
          { id: 'q.pct.ladder',      title: 'The Percent Ladder',        desc: 'Build any percentage from 10%, 5% and 1%.', mins: 12, ready: true },
          { id: 'q.pct.ratio',       title: 'Ratio & Proportion',        desc: 'One part, many shares — the bar that shows it.', mins: 10, ready: true },
          { id: 'q.pct.partner',     title: 'Partnership & Shares',      desc: 'Money × time, and why that product is everything.', mins: 11, ready: true },
          { id: 'q.pct.profit',      title: 'Profit, Loss & Discount',   desc: 'Mark up, discount, and where the profit really sits.', mins: 12, ready: true },
          { id: 'q.pct.successive',  title: 'Successive Change',         desc: 'Why +40% then −40% never returns you home.', mins: 10, ready: true },
        ],
      },
      {
        n: 3, title: 'Interest, Time & Work',
        sub: 'Rates of change, in money and in effort.',
        lessons: [
          { id: 'q.int.simple',      title: 'Simple Interest',           desc: 'A straight line, and the four things it links.', mins: 9, ready: true },
          { id: 'q.int.compound',    title: 'Compound Interest',         desc: 'Where the curve bends — and the CI−SI shortcut.', mins: 12, ready: true },
          { id: 'q.int.speed',       title: 'Time, Speed & Distance',    desc: 'One triangle, and unit conversion that never fails.', mins: 11, ready: true },
          { id: 'q.int.trains',      title: 'Trains, Boats & Streams',   desc: 'Relative speed: add when opposed, subtract when aligned.', mins: 12, ready: true },
          { id: 'q.int.work',        title: 'Work, Pipes & Cisterns',    desc: 'Think in units of work per day, never in days.', mins: 12, ready: true },
        ],
      },
      {
        n: 4, title: 'Mensuration',
        sub: 'Length, area and volume you can picture to scale.',
        lessons: [
          { id: 'q.men.area',        title: 'Perimeter & Area',          desc: 'Squares, rectangles, triangles — drawn true to size.', mins: 10, ready: true },
          { id: 'q.men.circle',      title: 'Circles',                   desc: 'π = 22/7, and when the examiner expects it.', mins: 9, ready: true },
          { id: 'q.men.paths',       title: 'Paths, Borders & Tiling',   desc: 'The outer-minus-inner move that solves them all.', mins: 11, ready: true },
          { id: 'q.men.solids',      title: 'Volume & Surface Area',     desc: 'Cube, cuboid, cylinder, cone — and what scales how.', mins: 12, ready: true },
        ],
      },
      {
        n: 5, title: 'Averages & Statistics',
        sub: 'Where the centre of a set of numbers actually sits.',
        lessons: [
          { id: 'q.avg.centre',      title: 'Mean, Median & Mode',       desc: 'Three centres, and when each one lies.', mins: 10, ready: true },
          { id: 'q.avg.weighted',    title: 'Weighted Average',          desc: 'Combining groups without touching the raw data.', mins: 11, ready: true },
          { id: 'q.avg.alligation',  title: 'Alligation',                desc: 'The cross rule, and the mixture problems it kills.', mins: 12, ready: true },
          { id: 'q.avg.spread',      title: 'Range & Spread',            desc: 'Why two sets with one mean can be nothing alike.', mins: 9, ready: true },
        ],
      },
      {
        n: 6, title: 'Counting & Chance',
        sub: 'Count the possibilities before you weigh them.',
        lessons: [
          { id: 'q.cnt.multiply',    title: 'The Counting Principle',    desc: 'Slots and choices — the root of everything here.', mins: 9, ready: true },
          { id: 'q.cnt.perm',        title: 'Permutations',              desc: 'When order matters, and the repeats you must divide out.', mins: 11, ready: true },
          { id: 'q.cnt.comb',        title: 'Combinations',              desc: 'Committees, handshakes, and nCr from first principles.', mins: 11, ready: true },
          { id: 'q.cnt.prob',        title: 'Probability Basics',        desc: 'Favourable over total — once you can count both.', mins: 10, ready: true },
          { id: 'q.cnt.dice',        title: 'Dice, Cards & Coins',       desc: 'The three sample spaces every paper reuses.', mins: 10, ready: true },
        ],
      },
      {
        n: 7, title: 'Data Interpretation',
        sub: 'Reading a chart faster than you can calculate it.',
        lessons: [
          { id: 'q.di.tables',       title: 'Reading Tables',            desc: 'Scan for the question, not for the data.', mins: 10, ready: true },
          { id: 'q.di.bars',         title: 'Bar & Line Charts',         desc: 'Comparing without computing.', mins: 10, ready: true },
          { id: 'q.di.pie',          title: 'Pie Charts',                desc: 'Degrees, percentages and the 3.6 factor.', mins: 10, ready: true },
          { id: 'q.di.caselet',      title: 'Caselets & Mixed Sets',     desc: 'Turning a paragraph into a table you can use.', mins: 12, ready: true },
          { id: 'q.di.speed',        title: 'DI Under Time Pressure',    desc: 'Which of the five questions to skip, and why.', mins: 11, ready: true },
        ],
      },
    ],
  },
};

/* ============================================================
   What this build actually contains.

   `config.js` can switch an academy off entirely or hide named chapters —
   for a shorter course, or for releasing a chapter at a time. The filters
   are applied HERE, at the one place that knows the syllabus, so a hidden
   chapter disappears from the path, the review index, the drill, the mock
   and the derived next-steps track together. Filtering at each call site
   would eventually miss one, and a chapter that is hidden from the path but
   still dealt by the mock is worse than one that is simply present.

   With the shipped configuration every filter is a pass-through, which the
   harness asserts — the default build is the whole curriculum.
   ============================================================ */

export const activeAcademies = () =>
  Object.keys(ACADEMIES).filter(a => academyOn(a));

/** One academy's units, minus any the configuration hides. */
export const activeUnits = academy =>
  (ACADEMIES[academy]?.units || []).filter(u => chapterOn(`${academy}:${u.n}`));

export const allLessons = academy =>
  activeUnits(academy).flatMap(u => u.lessons);

export const readyLessons = academy =>
  allLessons(academy).filter(l => l.ready);

/**
 * Which chapter a lesson belongs to, as "reasoning:3".
 *
 * The store records this against every concept the learner answers, so a
 * dashboard can say WHICH chapter is weak rather than only which idea. Kept
 * here because the curriculum is the only thing that knows the mapping.
 */
export function chapterOf(lessonId) {
  for (const aid of Object.keys(ACADEMIES)) {
    for (const u of ACADEMIES[aid].units) {
      if (u.lessons.some(l => l.id === lessonId)) return `${aid}:${u.n}`;
    }
  }
  return null;
}

/** A chapter key back to its academy and unit. */
export function unitFor(chapterKey) {
  const [aid, n] = String(chapterKey || '').split(':');
  const a = ACADEMIES[aid];
  const u = a && a.units.find(x => x.n === +n);
  return u ? { academyId: aid, academy: a, unit: u } : null;
}

/** Built / total / completed for one unit — drives the chapter header and its bars. */
export function unitStats(unit, isDone) {
  const ready = unit.lessons.filter(l => l.ready);
  return {
    total: unit.lessons.length,
    ready: ready.length,
    done: ready.filter(l => isDone(l.id)).length,
  };
}

export function findLesson(id) {
  for (const a of Object.values(ACADEMIES))
    for (const u of a.units) {
      const l = u.lessons.find(x => x.id === id);
      if (l) return { lesson: l, unit: u, academy: a };
    }
  return null;
}

/** The next unfinished ready lesson — powers "Continue" on the home page. */
export function nextUp(academy, isDone) {
  return readyLessons(academy).find(l => !isDone(l.id)) || readyLessons(academy)[0] || null;
}
