/* Seating and ordering — RAS 2015 Q106 (which arrangement is NOT possible)
   and the linear-puzzle staple.

   Both generators BRUTE-FORCE the puzzle they have just written: the clues
   are tested against every arrangement, so "this one is impossible" and "this
   one is forced" are facts about the puzzle rather than claims about it. A
   seating question whose clues admit two answers is the classic way these go
   wrong, and it cannot happen here without the harness seeing it.
   ============================================================ */
import { gen, ask, options, byTier, MALE, FEMALE } from './kit.js';

const permutations = xs => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) =>
  permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map(p => [x, ...p])));

/* ---------------- circular ---------------- */
/* Positions run clockwise. Everybody faces the centre, so a person's RIGHT is
   the seat before them clockwise — the convention the paper uses and the one
   candidates most often invert. */
const CIRC_CLUES = {
  opposite: (a, b) => ({
    test: s => Math.abs(s.indexOf(a) - s.indexOf(b)) === s.length / 2,
    say: `${a} and ${b} sit opposite each other.`,
  }),
  rightOf: (a, b) => ({           // a is immediately to the right of b
    test: s => s[(s.indexOf(b) - 1 + s.length) % s.length] === a,
    say: `${a} sits immediately to the right of ${b}.`,
  }),
  notNext: (a, b) => ({
    test: s => { const i = s.indexOf(a), j = s.indexOf(b); const d = Math.abs(i - j); return d !== 1 && d !== s.length - 1; },
    say: `${a} does not sit next to ${b}.`,
  }),
  between: (a, b, c) => ({        // a sits between b and c
    test: s => { const i = s.indexOf(a), n = s.length;
      const nb = [s[(i + 1) % n], s[(i - 1 + n) % n]];
      return nb.includes(b) && nb.includes(c); },
    say: `${a} sits between ${b} and ${c}.`,
  }),
};

const circular = (R, tier) => {
  /* Single letters, as the paper writes them: six three-letter name stubs in a
     row read as noise, and the question is about the seating, not the names. */
  const people = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats = permutations(people.slice(1)).map(rest => [people[0], ...rest]);   // rotations removed
  const truth = R.pick(seats);
  const pool = [
    CIRC_CLUES.opposite(truth[0], truth[3]),
    CIRC_CLUES.rightOf(truth[2], truth[3]),
    CIRC_CLUES.notNext(truth[1], truth[4]),
    CIRC_CLUES.between(truth[5], truth[4], truth[0]),
  ];
  const clues = R.some(pool, byTier(tier, 2, 3, 3));
  const valid = seats.filter(s => clues.every(c => c.test(s)));
  const invalid = seats.filter(s => !clues.every(c => c.test(s)));
  if (valid.length < 3 || !invalid.length) return null;

  const write = s => s.join('');   // "DAEBCF", exactly as the paper prints it
  const shown = R.some(valid, 3).map(write);
  const odd = write(R.pick(invalid));
  if (shown.includes(odd)) return null;
  const broken = clues.find(c => !c.test([...odd]));
  return ask({
    context: `Six people — <b>${people.join(', ')}</b> — sit around a round table, all facing the centre.<br>
      ${clues.map(c => `· ${c.say}`).join('<br>')}`,
    q: 'Which of the following seatings, read clockwise, is <b>not</b> possible?',
    opts: options(odd, shown.map(v => ({ v, why: 'This one satisfies every clue — check it seat by seat.' }))),
    why: `Test each option against the clues. <b>${odd}</b> breaks this one:
      "${broken ? broken.say : clues[0].say}"<br>
      Remember that everybody faces the centre, so a person's right hand points to the seat
      <i>anticlockwise</i> of them — reading "right" as clockwise is what makes these go wrong.`,
    hardness: 2 + clues.length * 0.6,
    concept: 'circle-facing-in', conceptLabel: 'Round table, facing in',
    source: 'Shape of RAS 2015, Q106',
  });
};

/* ---------------- linear ---------------- */
const linear = (R, tier) => {
  const n = byTier(tier, 5, 5, 6);
  const people = R.some([...MALE, ...FEMALE], n);
  const rows = permutations(people);
  const truth = R.pick(rows);
  const say = [];
  const tests = [];
  const add = (t, s) => { tests.push(t); say.push(s); };

  const [a, b, c0, d0] = R.shuffle(truth).slice(0, 4);
  const gap = Math.abs(truth.indexOf(a) - truth.indexOf(b)) - 1;
  add(s => Math.abs(s.indexOf(a) - s.indexOf(b)) - 1 === gap,
    gap === 0 ? `${a} and ${b} sit next to each other.`
      : `There ${gap === 1 ? 'is exactly one person' : `are exactly ${gap} people`} between ${a} and ${b}.`);
  /* Ordered by where they actually sit. Drawn at random, this clue was false
     of the arrangement it was describing half the time — the puzzle then had
     a different unique solution from the one the explanation printed, and the
     printed answer was simply wrong. Every clue is now read OFF the seating. */
  const [c, d] = truth.indexOf(c0) < truth.indexOf(d0) ? [c0, d0] : [d0, c0];
  add(s => s.indexOf(c) < s.indexOf(d), `${c} sits somewhere to the left of ${d}.`);
  const endPerson = truth[R.pick([0, n - 1])];
  add(s => s[0] === endPerson || s[n - 1] === endPerson, `${endPerson} sits at one of the two ends.`);
  const [p, q] = [truth[1], truth[2]];
  add(s => Math.abs(s.indexOf(p) - s.indexOf(q)) === 1, `${p} and ${q} sit next to each other.`);
  const pos = truth.indexOf(truth[Math.floor(n / 2)]) + 1;
  add(s => s.indexOf(truth[Math.floor(n / 2)]) + 1 === pos,
    `${truth[Math.floor(n / 2)]} sits ${pos}${['st', 'nd', 'rd'][pos - 1] || 'th'} from the left.`);

  const solutions = rows.filter(s => tests.every(t => t(s)));
  /* Unique, AND the arrangement the clues were written from. Either failure
     means the question has no answer the learner could reach. */
  if (solutions.length !== 1 || solutions[0].join() !== truth.join()) return null;

  /* A question a clue already answers in words is not a puzzle. The position
     clue names the middle seat outright, and the adjacency clue names a
     neighbour outright, so those questions are dropped when they collide. */
  const k = Math.min(n - 1, 2);
  /* Whoever we ask about must HAVE a right-hand neighbour: asking who sits to
     the right of the person on the right end has no answer, and the fallback
     that once answered it gave the person on their LEFT. */
  const anchor = truth[R.int(0, n - 2)];
  const neighbour = truth[truth.indexOf(anchor) + 1];
  const kinds = ['third', 'neighbour', 'right-end'].filter(x => {
    if (x === 'third') return pos !== 3;
    if (x === 'neighbour') return !((anchor === p && neighbour === q) || (anchor === q && neighbour === p));
    return true;
  });
  if (!kinds.length) return null;
  const kind = R.pick(kinds);
  const key = kind === 'third' ? truth[k] : kind === 'neighbour' ? neighbour : truth[n - 1];
  if (!key) return null;
  const q2 = kind === 'third' ? `Who sits third from the left?`
    : kind === 'neighbour' ? `Who sits immediately to the right of ${anchor}?`
    : `Who sits at the extreme right?`;
  return ask({
    context: `${n} people — <b>${people.join(', ')}</b> — sit in a row facing north.<br>
      ${say.map(s => `· ${s}`).join('<br>')}`,
    q: q2,
    opts: options(key, people.filter(x => x !== key && !(kind === 'neighbour' && x === anchor))
      .map(v => ({ v, why: '' }))),
    why: `Only one seating satisfies all ${say.length} clues:
      <b>${truth.join(' – ')}</b> (left to right). Reading the answer off it: <b>${key}</b>.<br>
      Start from the clue that fixes a position outright — here, "${say[2]}" and "${say[4]}" —
      and place the rest around it.`,
    hardness: 2.2 + n / 4,
    concept: 'linear-solve', conceptLabel: 'Solving a row from clues',
    source: 'RAS staple — arrangement block',
  });
};

export const ARRANGE_GENERATORS = [
  gen('ras-arr-circle', 'arrange', 'reasoning:4', 'circle-facing-in', 'Round table', circular),
  gen('ras-arr-row', 'arrange', 'reasoning:4', 'linear-solve', 'Rows from clues', linear),
];
