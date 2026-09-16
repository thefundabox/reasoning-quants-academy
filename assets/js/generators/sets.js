/* ============================================================
   Question SETS — one stimulus, several questions.

   Every question in this project has been standalone: its own table, its
   own arrangement, its own numbers. The paper is not like that. RPSC hands
   you one seating arrangement and asks four questions off it, one chart and
   asks five, and the skill being tested is precisely the one a standalone
   question cannot reach — build the diagram ONCE, then harvest several
   answers from it. A learner who has only ever met single questions solves
   the arrangement four times and runs out of clock.

   So a set generator returns a stimulus plus a list of questions, and
   `expandSet` turns that into ordinary `ask` steps that happen to share a
   context. Everything downstream — the runner, the mastery ladder, the
   review queue, the mock — treats them as normal questions, which is the
   point: a set is a way of ASKING, not a new kind of thing to be answered.

   Two rules the harness holds these to:
     · the stimulus travels with every question in the set, because a learner
       scrolling back to question 2 must not find the table gone;
     · the arrangement must have exactly ONE solution, brute-forced, or the
       questions asked off it have no defensible answers.
   ============================================================ */

import { options, byTier } from './rand.js';
import { tableFig } from './figures.js';
import { sum, pct, growth } from '../widgets/di-lab.js';

const r2 = x => Math.round(x * 100) / 100;
const clean = x => (Number.isInteger(x) ? String(x) : String(r2(x)));
const ord = k => k + (['th', 'st', 'nd', 'rd'][(k % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][k] || 'th');

/* ---------------- Data interpretation: one table, four questions ---------------- */

const TABLES = [
  { unit: 'Units sold (in thousands)', rows: ['Jaipur', 'Kota', 'Ajmer', 'Bikaner'], cols: ['2021', '2022', '2023', '2024'] },
  { unit: 'Applications received (in hundreds)', rows: ['North', 'South', 'East', 'West'], cols: ['Q1', 'Q2', 'Q3', 'Q4'] },
  { unit: 'Wheat procured (in tonnes)', rows: ['Alwar', 'Bharatpur', 'Sikar', 'Nagaur'], cols: ['2021', '2022', '2023', '2024'] },
  { unit: 'Buses run (per day)', rows: ['Depot A', 'Depot B', 'Depot C', 'Depot D'], cols: ['Mon', 'Tue', 'Wed', 'Thu'] },
  { unit: 'Patients seen (per week)', rows: ['PHC Ajmer', 'PHC Tonk', 'PHC Dausa', 'PHC Sirohi'], cols: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
];

const tableHTML = (set, data) => `
  <div class="qtable-wrap"><table class="qtable">
    <thead><tr><th>${set.unit}</th>${set.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${set.rows.map((r, i) =>
      `<tr><th>${r}</th>${data[i].map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;

/** Row totals all distinct AND column totals all distinct, so both superlatives are unique. */
function buildTable(R, set) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const data = set.rows.map(() => set.cols.map(() => R.int(2, 9) * 5));
    const rowT = data.map(sum);
    const colT = set.cols.map((_, c) => data.reduce((t, row) => t + row[c], 0));
    if (new Set(rowT).size === rowT.length && new Set(colT).size === colT.length) {
      return { data, rowT, colT };
    }
  }
  throw new Error('could not build a table with distinct row and column totals');
}

export const diSet = {
  id: 'set-di', chapter: 'quants:7', set: true, stimulus: 'table',
  concept: 'di-question-first', conceptLabel: 'Find the cells the question needs',
  make(R, tier = 2) {
    const set = R.pick(TABLES);
    const { data, rowT, colT } = buildTable(R, set);
    const grand = sum(rowT);
    const bestRow = rowT.indexOf(Math.max(...rowT));
    const bestCol = colT.indexOf(Math.max(...colT));
    const i = R.int(0, set.rows.length - 1);
    const share = r2(pct(rowT[i], grand));

    /* A column pair with real movement, so the growth question is not 0%. */
    let c = 0;
    for (let k = 0; k < set.cols.length - 1; k++) if (data[i][k] !== data[i][k + 1]) { c = k; break; }
    const from = data[i][c], to = data[i][c + 1];
    const g = r2(growth(from, to));

    const questions = [
      {
        q: `What is the total for <b>${set.rows[i]}</b> across all ${set.cols.length} columns?`,
        ...options(String(rowT[i]), [
          { v: String(rowT[i] + 5), why: `Five over — one cell read twice or misread. The row is
            ${data[i].join(' + ')} = ${rowT[i]}.` },
          { v: String(rowT[i] - 5), why: `Five short — a cell dropped. Add straight across the
            <b>${set.rows[i]}</b> row: ${data[i].join(' + ')} = ${rowT[i]}.` },
          { v: String(colT[c]), why: `That is a COLUMN total (${set.cols[c]}), read down instead of
            across. The question names a row.` },
        ], k => ({ v: String(rowT[i] + 10 * (k + 1)),
                   why: `${data[i].join(' + ')} = ${rowT[i]}. Nothing outside that row belongs.` })),
        whyRight: `Add that row and nothing else: ${data[i].join(' + ')} = <b>${rowT[i]}</b>.`,
        whyWrong: `Read the question before the table — it names one row, so only
          ${set.cols.length} cells matter.<br><br>${data[i].join(' + ')} = <b>${rowT[i]}</b>.`,
      },
      {
        q: `Which row has the <b>highest</b> total?`,
        concept: 'di-compare-not-compute', conceptLabel: 'Compare rather than compute',
        ...options(set.rows[bestRow], set.rows.map((rw, k) => ({ rw, k })).filter(x => x.k !== bestRow)
          .map(x => ({ v: x.rw, why: `<b>${x.rw}</b> totals ${rowT[x.k]}, which is
            ${rowT[bestRow] - rowT[x.k]} behind ${set.rows[bestRow]} (${rowT[bestRow]}). Judging by
            the largest single cell rather than the row total is the trap here.` }))),
        whyRight: `Row totals: ${set.rows.map((rw, k) => `${rw} ${rowT[k]}`).join(', ')}.
          <b>${set.rows[bestRow]}</b> leads with ${rowT[bestRow]}.`,
        whyWrong: `Total each row, then compare. The biggest single figure in the table does not
          decide it — <b>${set.rows[bestRow]}</b> wins on ${rowT[bestRow]}.`,
      },
      {
        q: `<b>${set.rows[i]}</b> accounts for what share of the grand total?`,
        concept: 'di-share', conceptLabel: 'Share divides by the total',
        ...options(`${clean(share)}%`, [
          { v: `${clean(r2(pct(rowT[i], grand - rowT[i])))}%`, why: `You divided by everything
            EXCEPT ${set.rows[i]}. A share is measured against the whole (${grand}), which includes
            the row itself.` },
          { v: `${clean(r2(share + 5))}%`, why: `Five points over. ${rowT[i]} ÷ ${grand} =
            ${clean(share)}%.` },
          { v: `${clean(r2(share - 4))}%`, why: `Four points under. Total the row
            (${rowT[i]}), then divide by the grand total ${grand}.` },
        ], k => ({ v: `${clean(r2(share + 7 + k))}%`,
                   why: `${rowT[i]} ÷ ${grand} × 100 = ${clean(share)}%.` })),
        whyRight: `${set.rows[i]} totals ${rowT[i]}; the grand total is ${grand}.
          ${rowT[i]} ÷ ${grand} = <b>${clean(share)}%</b>.`,
        whyWrong: `A share divides by the <b>whole</b>, never by the rest.<br><br>
          ${rowT[i]} ÷ ${grand} = <b>${clean(share)}%</b>.`,
      },
      {
        q: `For <b>${set.rows[i]}</b>, what is the change from <b>${set.cols[c]}</b> to
            <b>${set.cols[c + 1]}</b>?`,
        concept: 'di-growth', conceptLabel: 'Growth divides by the old figure',
        ...options(`${clean(g)}%`, [
          { v: `${clean(r2(growth(to, from)))}%`, why: `That is the change measured backwards, from
            ${set.cols[c + 1]} to ${set.cols[c]}. Growth runs forward from the earlier figure.` },
          { v: `${clean(r2((to - from) / to * 100))}%`, why: `You divided by the LATER figure
            (${to}). Percentage change divides by where you started, ${from}.` },
          { v: `${clean(r2(g + 10))}%`, why: `Ten points over.
            (${to} − ${from}) ÷ ${from} × 100 = ${clean(g)}%.` },
        ], k => ({ v: `${clean(r2(g - 5 * (k + 1)))}%`,
                   why: `(${to} − ${from}) ÷ ${from} = ${clean(g)}%, measured against ${set.cols[c]}.` })),
        whyRight: `(${to} − ${from}) ÷ ${from} = <b>${clean(g)}%</b>. Growth always divides by the
          <b>earlier</b> figure.`,
        whyWrong: `Growth divides by where you started, not where you ended:
          (${to} − ${from}) ÷ ${from} = <b>${clean(g)}%</b>.`,
      },
    ];

    return {
      context: tableHTML(set, data),
      figure: tableFig([set.unit, ...set.cols],
        set.rows.map((rw, k) => ({ label: rw, cells: data[k] })),
        { hotRow: i, caption: `Grand total ${grand}` }),
      figureCap: `Four questions, one table — solve the table once and read all four off it.`,
      questions: questions.slice(0, byTier(tier, 3, 4, 4)),
      hardness: 20 + byTier(tier, 0, 6, 12),
    };
  },
};

/* ---------------- Linear arrangement: one seating, four questions ---------------- */

const PEOPLE = ['Anil', 'Bhavna', 'Chetan', 'Deepa', 'Esha', 'Farhan', 'Gita'];

/**
 * Drop every clue the puzzle does not need.
 *
 * Adding clues until exactly one ordering survives guarantees a solvable
 * puzzle and NOT a well-made one: the clues arrive in shuffled order, so
 * several of the early ones are usually implied by the later ones. One draw
 * printed "Only 2 people live above Bhavna", "Bhavna lives on floor 3" and
 * "Bhavna lives below Farhan" together — three ways of saying one thing, which
 * reads as sloppy and, worse, makes the puzzle easier than its clue count
 * suggests.
 *
 * So each clue is tried for removal in turn, and kept only if taking it out
 * would admit a second ordering. What is left is minimal: every printed clue
 * is load-bearing.
 */
function prune(people, clues) {
  let kept = clues.slice();
  for (let i = kept.length - 1; i >= 0; i--) {
    const without = kept.filter((_, k) => k !== i);
    if (solve(people, without).length === 1) kept = without;
  }
  return kept;
}

/** Every ordering of `people`, filtered by the clues. Brute force — see the header. */
function solve(people, clues) {
  const out = [];
  const walk = (left, acc) => {
    if (!left.length) { if (clues.every(c => c.test(acc))) out.push(acc); return; }
    for (let i = 0; i < left.length; i++) {
      walk([...left.slice(0, i), ...left.slice(i + 1)], [...acc, left[i]]);
    }
  };
  walk(people, []);
  return out;
}

export const seatingSet = {
  id: 'set-seating', chapter: 'reasoning:4', set: true, stimulus: 'arrangement',
  /* `linear-solve` is what a seating set actually exercises — and it is a real
     concept r.ord.linear teaches. Inventing an id would put something on the
     Leitner ladder that the review builder has no questions for, which the
     harness rejects and rightly so. */
  concept: 'linear-solve', conceptLabel: 'Solving a linear arrangement',
  make(R, tier = 2) {
    const n = byTier(tier, 4, 5, 6);
    const cast = R.some(PEOPLE, n);

    /* Draw clues until EXACTLY ONE arrangement survives. A puzzle with two
       solutions has no defensible answer, and one with none has no puzzle —
       both have shipped in this project before, which is why this is checked
       rather than assumed. */
    let order = null, clues = null;
    for (let attempt = 0; attempt < 400 && !order; attempt++) {
      const target = R.shuffle(cast);
      const pool = [];
      const [a, b, c2] = R.some(cast, 3);
      const ia = target.indexOf(a), ib = target.indexOf(b), ic = target.indexOf(c2);
      pool.push({ text: `<b>${target[0]}</b> is at the extreme left.`,
                  test: arr => arr[0] === target[0] });
      pool.push({ text: `<b>${target[n - 1]}</b> is at the extreme right.`,
                  test: arr => arr[n - 1] === target[n - 1] });
      pool.push({ text: `<b>${a}</b> sits ${ia < ib ? 'to the left of' : 'to the right of'} <b>${b}</b>.`,
                  test: arr => (ia < ib ? arr.indexOf(a) < arr.indexOf(b) : arr.indexOf(a) > arr.indexOf(b)) });
      pool.push({ text: `<b>${target[1]}</b> is second from the left.`,
                  test: arr => arr[1] === target[1] });
      pool.push({ text: `<b>${c2}</b> is ${Math.abs(ia - ic) === 1 ? 'immediately next to' : 'not next to'} <b>${a}</b>.`,
                  test: arr => (Math.abs(arr.indexOf(c2) - arr.indexOf(a)) === 1) === (Math.abs(ia - ic) === 1) });
      pool.push({ text: `<b>${target[Math.floor(n / 2)]}</b> is exactly in the ${ord(Math.floor(n / 2) + 1)} position from the left.`,
                  test: arr => arr[Math.floor(n / 2)] === target[Math.floor(n / 2)] });

      /* Add clues one at a time until exactly one arrangement survives, then
         STOP. Picking a fixed number and hoping failed a third of the time at
         six people, and it also made bad puzzles: too few clues leave several
         answers, too many leave nothing to work out. The minimal set that pins
         the line is both guaranteed to exist and the better question. */
      const shuffled = R.shuffle(pool);
      const picked = [];
      let sols = solve(cast, picked);
      for (const clue of shuffled) {
        if (sols.length === 1) break;
        picked.push(clue);
        sols = solve(cast, picked);
      }
      if (sols.length === 1) { order = sols[0]; clues = prune(cast, picked); }
    }
    if (!order) throw new Error('no arrangement with a unique solution');

    const mid = R.int(1, n - 2);
    const [x, y] = [order[0], order[n - 1]];
    const gapA = R.int(0, n - 3), gapB = gapA + R.int(2, n - 1 - gapA);
    const between = gapB - gapA - 1;

    const questions = [
      {
        q: `Who is at the extreme <b>right</b>?`,
        ...options(order[n - 1], order.slice(0, n - 1).map((p, k) => ({
          v: p, why: `<b>${p}</b> is ${ord(k + 1)} from the left, so ${n - k - 1} place${n - k - 1 > 1 ? 's' : ''}
            short of the right-hand end. The clues fix the whole line as
            ${order.join(' – ')}.` }))),
        whyRight: `The only arrangement satisfying all ${clues.length} clues is
          <b>${order.join(' – ')}</b>, so the right-hand end is <b>${order[n - 1]}</b>.`,
        whyWrong: `Anchor the fixed clue first, then place the rest against it. The single
          arrangement that survives every clue is <b>${order.join(' – ')}</b>.`,
      },
      {
        q: `Who is <b>${ord(mid + 1)}</b> from the left?`,
        concept: 'rank-flip', conceptLabel: 'Rank from the other end',
        ...options(order[mid], order.filter((_, k) => k !== mid).map((p, k) => {
          const at = order.indexOf(p);
          return { v: p, why: `<b>${p}</b> sits ${ord(at + 1)} from the left, not ${ord(mid + 1)}.
            Counting from the wrong end is the usual cause — from the RIGHT, ${p} is
            ${ord(n - at)}.` };
        })),
        whyRight: `In <b>${order.join(' – ')}</b>, position ${mid + 1} from the left is
          <b>${order[mid]}</b>.`,
        whyWrong: `Write the line out once and read every answer off it:
          <b>${order.join(' – ')}</b>. ${ord(mid + 1)} from the left is <b>${order[mid]}</b>.`,
      },
      {
        q: `How many people sit <b>between</b> ${order[gapA]} and ${order[gapB]}?`,
        concept: 'rank-between', conceptLabel: 'Counting people between two positions',
        ...options(String(between), [
          { v: String(between + 1), why: `That is the difference in their positions
            (${gapB + 1} − ${gapA + 1} = ${gapB - gapA}), which still counts one of the two.
            "Between" excludes both endpoints.` },
          { v: String(between + 2), why: `Both endpoints counted in. ${order[gapA]} is
            ${ord(gapA + 1)} and ${order[gapB]} is ${ord(gapB + 1)}, so strictly between them are
            ${between}.` },
          { v: String(Math.max(0, between - 1)), why: `One too few — subtracting twice.
            ${gapB + 1} − ${gapA + 1} − 1 = ${between}.` },
        ], k => ({ v: String(between + k + 3),
                   why: `In ${order.join(' – ')} there are exactly ${between} people between them.` })),
        whyRight: `${order[gapA]} is ${ord(gapA + 1)} and ${order[gapB]} is ${ord(gapB + 1)}, so
          ${gapB + 1} − ${gapA + 1} − 1 = <b>${between}</b> sit between them.`,
        whyWrong: `Positions differ by ${gapB - gapA}; "between" excludes both of them, so subtract
          one: <b>${between}</b>.`,
      },
      {
        q: `Who sits immediately to the <b>left</b> of ${order[n - 1]}?`,
        concept: 'immediate-vs-somewhere', conceptLabel: '"Immediately" vs "somewhere"',
        ...options(order[n - 2], order.filter((_, k) => k !== n - 2).map(p => {
          const at = order.indexOf(p);
          return { v: p, why: at === n - 1
            ? `That is ${p} — the person the question is asked ABOUT. Nobody sits immediately to
               their own left.`
            : `<b>${p}</b> is ${ord(at + 1)} from the left, ${n - 2 - at} place${Math.abs(n - 2 - at) === 1 ? '' : 's'}
               away from the seat asked for. The line is ${order.join(' – ')}.` };
        })),
        whyRight: `In <b>${order.join(' – ')}</b>, the person just left of ${order[n - 1]} is
          <b>${order[n - 2]}</b>.`,
        whyWrong: `"Immediately to the left" means one seat earlier in the line, reading left to
          right: <b>${order[n - 2]}</b>.`,
      },
    ];

    const clueHTML = `<b>${n} people sit in a row facing north.</b><ul style="margin:6px 0 0 1.1em">
      ${clues.map(c => `<li>${c.text}</li>`).join('')}</ul>`;

    return {
      context: clueHTML,
      figure: tableFig(['Seat', ...order.map((_, k) => ord(k + 1))],
        [{ label: 'Left → right', cells: order }],
        { caption: `The one arrangement that satisfies every clue.` }),
      figureCap: `Solve the line once; all four questions are read straight off it.`,
      questions: questions.slice(0, byTier(tier, 3, 4, 4)),
      hardness: n * 6 + clues.length * 3,
    };
  },
};


/* ---------------- Floors & boxes: one stack, four questions ---------------- */

/* The vertical cousin of the seating set, and the form RPSC uses at least as
   often. Everything about it is the same idea read upwards, which is exactly
   why it belongs here rather than in a second generator: the clue language
   ("only two above", "immediately below") is the part that trips people, not
   the solving. Solutions are brute-forced for uniqueness, same as the row. */
export const floorsSet = {
  id: 'set-floors', chapter: 'reasoning:4', set: true, stimulus: 'building',
  concept: 'stack-direction', conceptLabel: 'Reading which way the numbers run',
  make(R, tier = 2) {
    const n = byTier(tier, 4, 5, 6);
    const cast = R.some(PEOPLE, n);

    let order = null, clues = null;         // order[0] is the GROUND floor
    for (let attempt = 0; attempt < 400 && !order; attempt++) {
      const target = R.shuffle(cast);
      const [a, b] = R.some(cast, 2);
      const ia = target.indexOf(a), ib = target.indexOf(b);
      const pool = [
        { text: `<b>${target[n - 1]}</b> lives on the topmost floor.`,
          test: arr => arr[n - 1] === target[n - 1] },
        { text: `<b>${target[0]}</b> lives on the ground floor.`,
          test: arr => arr[0] === target[0] },
        { text: `<b>${a}</b> lives ${ia > ib ? 'above' : 'below'} <b>${b}</b>.`,
          test: arr => (ia > ib ? arr.indexOf(a) > arr.indexOf(b) : arr.indexOf(a) < arr.indexOf(b)) },
        { text: `Only <b>${n - 1 - ia}</b> ${n - 1 - ia === 1 ? 'person lives' : 'people live'} above <b>${a}</b>.`,
          test: arr => arr.length - 1 - arr.indexOf(a) === n - 1 - ia },
        { text: `<b>${b}</b> lives ${Math.abs(ia - ib) === 1 ? 'immediately' : 'somewhere'} ${ib > ia ? 'above' : 'below'} <b>${a}</b>.`,
          test: arr => {
            const d = arr.indexOf(b) - arr.indexOf(a);
            return Math.abs(ia - ib) === 1
              ? d === (ib > ia ? 1 : -1)
              : (ib > ia ? d > 0 : d < 0);
          } },
        { text: `<b>${target[Math.floor(n / 2)]}</b> lives on floor <b>${Math.floor(n / 2) + 1}</b>.`,
          test: arr => arr[Math.floor(n / 2)] === target[Math.floor(n / 2)] },
      ];
      const shuffledPool = R.shuffle(pool);
      const picked = [];
      let sols = solve(cast, picked);
      for (const clue of shuffledPool) {
        if (sols.length === 1) break;
        picked.push(clue);
        sols = solve(cast, picked);
      }
      if (sols.length === 1) { order = sols[0]; clues = prune(cast, picked); }
    }
    if (!order) throw new Error('no stack with a unique solution');

    const floorOf = who => order.indexOf(who) + 1;
    const pick = R.int(1, n - 2);                       // a middle floor
    const above = n - 1 - order.indexOf(order[pick]);

    const questions = [
      {
        q: `Who lives on the <b>topmost</b> floor?`,
        ...options(order[n - 1], order.slice(0, n - 1).map(p => ({
          v: p, why: `<b>${p}</b> is on floor ${floorOf(p)} of ${n}. Floors are numbered from the
            GROUND up, so the topmost is floor ${n} — reading the stack downwards is the single
            commonest slip in these.` }))),
        whyRight: `The only stack satisfying every clue, ground floor first, is
          <b>${order.join(' → ')}</b>. Floor ${n} is <b>${order[n - 1]}</b>.`,
        whyWrong: `Draw the stack once, ground floor at the BOTTOM, and read every answer off it:
          ${order.map((p, k) => `floor ${k + 1} ${p}`).join(', ')}.`,
      },
      {
        q: `On which floor does <b>${order[pick]}</b> live?`,
        concept: 'count-anchor', conceptLabel: '"Only k above" fixes a floor',
        ...options(`Floor ${pick + 1}`, order.map((p, k) => ({ p, k })).filter(x => x.k !== pick)
          .map(x => ({ v: `Floor ${x.k + 1}`, why: `Floor ${x.k + 1} is <b>${x.p}</b>.
            ${order[pick]} has ${above} ${above === 1 ? 'person' : 'people'} above and ${pick}
            below, which fixes floor ${pick + 1}.` }))),
        whyRight: `Counting up from the ground: ${order.map((p, k) => `${k + 1} ${p}`).join(', ')}.
          <b>${order[pick]}</b> is on floor <b>${pick + 1}</b>.`,
        whyWrong: `"Only k above" is the clue that fixes a floor outright — it counts DOWN from the
          top while the floor number counts UP from the ground, and the two must agree.<br><br>
          ${order[pick]} has ${above} above, so they are on floor ${n} − ${above} = <b>${pick + 1}</b>.`,
      },
      {
        q: `How many people live <b>between</b> ${order[0]} and ${order[n - 1]}?`,
        concept: 'gap-language', conceptLabel: '"Exactly one between" means a gap of two',
        ...options(String(n - 2), [
          { v: String(n - 1), why: `That is the difference in their floor numbers
            (${n} − 1 = ${n - 1}), which still counts one of the two. "Between" excludes both.` },
          { v: String(n), why: `That is everybody in the building, the two named included.` },
          { v: String(Math.max(0, n - 3)), why: `One too few — subtracting twice. Floors
            ${2}–${n - 1} hold ${n - 2} people.` },
        ], i => ({ v: String(n + i + 1),
                   why: `Only ${n} people live here in total, so there cannot be more than
                         ${n - 2} strictly between two of them.` })),
        whyRight: `${order[0]} is on floor 1 and ${order[n - 1]} on floor ${n}, so floors 2 to
          ${n - 1} lie between them — <b>${n - 2}</b> people.`,
        whyWrong: `Gap language is off-by-one country. Floor ${n} minus floor 1 is ${n - 1}, and
          that count still includes one of the two. Strictly between: <b>${n - 2}</b>.`,
      },
      {
        q: `Who lives <b>immediately below</b> ${order[n - 1]}?`,
        concept: 'immediate-vs-somewhere', conceptLabel: '"Immediately" vs "somewhere"',
        ...options(order[n - 2], order.filter((_, k) => k !== n - 2).map(p => ({
          v: p, why: order.indexOf(p) === n - 1
            ? `That is ${p} themselves — nobody lives immediately below their own floor.`
            : `<b>${p}</b> is on floor ${floorOf(p)}, which is ${n - 1 - floorOf(p)} floor${Math.abs(n - 1 - floorOf(p)) === 1 ? '' : 's'}
               away from the one asked for. "Immediately below" means exactly one floor down —
               floor ${n - 1}.` }))),
        whyRight: `${order[n - 1]} is on floor ${n}, so immediately below is floor ${n - 1}:
          <b>${order[n - 2]}</b>.`,
        whyWrong: `"Immediately" is exact and "somewhere" is not — this asks for exactly one floor
          down, floor ${n - 1}, which is <b>${order[n - 2]}</b>.`,
      },
    ];

    return {
      context: `<b>${n} people live on the ${n} floors of a building</b>, the ground floor
        numbered 1 and the topmost ${n}.<ul style="margin:6px 0 0 1.1em">
        ${clues.map(c => `<li>${c.text}</li>`).join('')}</ul>`,
      figure: tableFig(['Floor', ...order.map((_, k) => String(n - k))],
        [{ label: 'Top → ground', cells: [...order].reverse() }],
        { caption: `The one stack that satisfies every clue.` }),
      figureCap: `Drawn top-down here, numbered bottom-up — which is the confusion these clues live on.`,
      questions: questions.slice(0, byTier(tier, 3, 4, 4)),
      hardness: n * 6 + clues.length * 3 + 2,
    };
  },
};

/* ---------------- Caselet: one paragraph, four questions ---------------- */

/* The DI form with no chart at all: the data is buried in prose and the first
   real step is building the table yourself. That step is the whole skill, and
   a generator that handed over a tidy table would have removed it. */
const CASELETS = [
  { total: 'candidates who sat the examination', a: 'men', b: 'women',
    x: 'qualified', y: 'did not qualify', unit: '' },
  { total: 'households surveyed in the block', a: 'rural', b: 'urban',
    x: 'have a piped connection', y: 'do not', unit: '' },
  { total: 'visitors to the fort last week', a: 'Indian', b: 'foreign',
    x: 'took the guided tour', y: 'did not', unit: '' },
  { total: 'students in the college', a: 'boys', b: 'girls',
    x: 'opted for science', y: 'opted for arts', unit: '' },
];

export const caseletSet = {
  id: 'set-caselet', chapter: 'quants:7', set: true, stimulus: 'caselet',
  concept: 'caselet-grid', conceptLabel: 'Turn the paragraph into a grid',
  make(R, tier = 2) {
    const c = R.pick(CASELETS);
    /* Numbers chosen so every derived cell is a whole number and the shares
       come out to one decimal at worst — a caselet that needs a calculator is
       testing arithmetic, not the reading. */
    const step = byTier(tier, 40, 20, 10);
    const ax = R.int(3, 9) * step, ay = R.int(2, 8) * step;
    const bx = R.int(2, 8) * step, by = R.int(2, 7) * step;
    const A = ax + ay, B = bx + by, X = ax + bx, Y = ay + by, T = A + B;

    const questions = [
      {
        q: `How many of the ${c.total} are <b>${c.b}</b>?`,
        ...options(String(B), [
          { v: String(A), why: `That is the number of ${c.a} (${ax} + ${ay}). The paragraph gives
            you ${c.a} and the total; ${c.b} is what is left: ${T} − ${A} = ${B}.` },
          { v: String(bx), why: `That is only the ${c.b} who ${c.x} (${bx}). The question asks for
            all ${c.b}, both those who ${c.x} and those who ${c.y}.` },
          { v: String(T - bx), why: `That is everybody except the ${c.b} who ${c.x} — a subtraction
            from the wrong total.` },
        ], i => ({ v: String(B + step * (i + 1)),
                   why: `Total ${T} minus ${c.a} ${A} leaves ${B}.` })),
        whyRight: `Build the grid before answering anything. ${c.a}: ${A}. Total: ${T}.
          So ${c.b} = ${T} − ${A} = <b>${B}</b>.`,
        whyWrong: `A caselet is a table someone has written out as a sentence. Draw the two-by-two
          first — ${c.a}/${c.b} down the side, ${c.x}/${c.y} across the top — and fill in what you
          are given; the rest follows by subtraction.<br><br>
          ${c.b} = ${T} − ${A} = <b>${B}</b>.`,
      },
      {
        q: `How many altogether <b>${c.x}</b>?`,
        concept: 'caselet-base', conceptLabel: 'Read which whole the question wants',
        ...options(String(X), [
          { v: String(ax), why: `That is the ${c.a} who ${c.x} only (${ax}). The question asks
            across both groups: ${ax} + ${bx} = ${X}.` },
          { v: String(Y), why: `That is the number who ${c.y} (${Y}) — the other column.` },
          { v: String(T - ax), why: `Everybody except the ${c.a} who ${c.x}. Add the column, do not
            subtract from the total.` },
        ], i => ({ v: String(X + step * (i + 1)),
                   why: `${ax} ${c.a} + ${bx} ${c.b} = ${X}.` })),
        whyRight: `Add down the column: ${ax} ${c.a} + ${bx} ${c.b} = <b>${X}</b>.`,
        whyWrong: `The question names no group, so it wants both — the column total, not a cell.
          ${ax} + ${bx} = <b>${X}</b>.`,
      },
      {
        q: `What fraction of the <b>${c.b}</b> ${c.x}?`,
        concept: 'caselet-base', conceptLabel: 'Read which whole the question wants',
        ...options(`${clean(r2(bx / B * 100))}%`, [
          { v: `${clean(r2(bx / X * 100))}%`, why: `You divided by everybody who ${c.x} (${X}).
            The question says "of the ${c.b}", so the base is ${B}.` },
          { v: `${clean(r2(bx / T * 100))}%`, why: `You divided by the grand total (${T}). Read the
            words after "of" — they name the base, and here it is the ${c.b}.` },
          { v: `${clean(r2(ax / A * 100))}%`, why: `That is the share of the <b>${c.a}</b> who
            ${c.x}, not the ${c.b}.` },
        ], i => ({ v: `${clean(r2(bx / B * 100 + 5 * (i + 1)))}%`,
                   why: `${bx} of ${B} ${c.b} is ${clean(r2(bx / B * 100))}%.` })),
        whyRight: `"Of the ${c.b}" names the base: ${bx} out of ${B} =
          <b>${clean(r2(bx / B * 100))}%</b>.`,
        whyWrong: `Every percentage question hides its base in the words after "of". Here that is
          the ${c.b} — ${B} of them — not the total and not the column.<br><br>
          ${bx} ÷ ${B} = <b>${clean(r2(bx / B * 100))}%</b>.`,
      },
      {
        q: `What is the ratio of ${c.a} to ${c.b} among those who <b>${c.x}</b>?`,
        concept: 'caselet-ratio', conceptLabel: 'Ratios come straight from the cells',
        ...options(ratioText(ax, bx), [
          { v: ratioText(bx, ax), why: `Inverted — that is ${c.b} to ${c.a}. The order in the
            question is ${c.a} first.` },
          { v: ratioText(A, B), why: `That is the ratio of ALL ${c.a} to all ${c.b}
            (${A} : ${B}), not of those who ${c.x}.` },
          { v: ratioText(ay, by), why: `That is the ratio among those who ${c.y} — the other
            column of the grid.` },
        ], i => ({ v: ratioText(ax + step * (i + 1), bx),
                   why: `The two cells are ${ax} and ${bx}, so the ratio is ${ratioText(ax, bx)}.` })),
        whyRight: `Both numbers are cells you already have: ${ax} : ${bx} =
          <b>${ratioText(ax, bx)}</b>.`,
        whyWrong: `Once the grid is drawn, a ratio needs no arithmetic beyond cancelling — read the
          two cells straight off it: ${ax} : ${bx} = <b>${ratioText(ax, bx)}</b>.`,
      },
    ];

    return {
      context: `Of the <b>${T}</b> ${c.total}, <b>${A}</b> are ${c.a}.
        Among the ${c.a}, <b>${ax}</b> ${c.x} and the rest ${c.y}.
        Among the ${c.b}, <b>${bx}</b> ${c.x}.`,
      figure: tableFig(['', c.x, c.y, 'total'], [
        { label: c.a.charAt(0).toUpperCase() + c.a.slice(1), cells: [ax, ay, A] },
        { label: c.b.charAt(0).toUpperCase() + c.b.slice(1), cells: [bx, by, B] },
        { label: 'Total', cells: [X, Y, T] },
      ], { caption: `The grid the paragraph was describing all along.` }),
      figureCap: `Four given numbers; every other cell falls out by subtraction.`,
      questions: questions.slice(0, byTier(tier, 3, 4, 4)),
      hardness: 18 + byTier(tier, 0, 8, 16),
    };
  },
};

/** A ratio in lowest terms — cancelling is the only arithmetic a caselet ratio needs. */
function ratioText(a, b) {
  const g = (x, y) => (y ? g(y, x % y) : x);
  const d = g(a, b) || 1;
  return `${a / d} : ${b / d}`;
}

export const SET_GENERATORS = [diSet, seatingSet, floorsSet, caseletSet];

/**
 * Turn a set into ordinary `ask` steps.
 *
 * The stimulus is copied onto EVERY question rather than shown once at the
 * top. That is deliberate: a learner on question 3 of 4 must be able to see
 * the table without scrolling back through two answered questions, and in the
 * mock they can jump straight to question 3 from the palette with no history
 * at all. Repeating it costs a little markup and removes a whole class of
 * "where did the table go".
 */
export function expandSet(gen, R, tier = 2, seq = 0) {
  const built = gen.make(R, tier);
  const setId = `${gen.id}#${seq}`;
  return built.questions.map((q, k) => ({
    type: 'ask',
    concept: q.concept || gen.concept,
    conceptLabel: q.conceptLabel || gen.conceptLabel,
    generatedBy: gen.id,
    setId, setPos: k + 1, setLen: built.questions.length,
    /* Each generator names its own stimulus. This used to be a ternary on the
       generator id, which said "arrangement" for a caselet the moment a third
       set existed — the classic cost of branching on identity instead of
       asking the thing itself. */
    context: `${built.context}<p class="qset">Question ${k + 1} of ${built.questions.length}
      on this ${gen.stimulus || 'set'}</p>`,
    figure: built.figure,
    figureCap: built.figureCap,
    hardness: built.hardness,
    tier,
    ...q,
  }));
}
