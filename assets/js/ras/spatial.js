/* ============================================================
   Space — walks, positions, mirrors and cubes.

   RAS 2023 Q87 places five people by compass offsets and asks the distance
   between two of them; 2024 Q87 walks a route and asks the same; 2023 Q89 and
   2024 Q89 both ask which capital letters survive a mirror; 2023 Q90 asks how
   many small cubes of a block are invisible. All four are staples, and none of
   them is a variant of the clock questions this bank already had.
   ============================================================ */
import { gen, ask, options, byTier, round, MALE, FEMALE } from './kit.js';

const VEC = { North: [0, 1], South: [0, -1], East: [1, 0], West: [-1, 0] };
const OPP = { North: 'South', South: 'North', East: 'West', West: 'East' };

/* A walk with right-angle turns. The legs partly cancel, so the answer is not
   "add everything up" — which is the mistake the paper is testing. */
/* A right-angled walk lands on a whole number of metres only when the two net
   legs form a Pythagorean triple, which random legs almost never do — the
   first version of this threw away 19 draws in 20. So the NET displacement is
   chosen from a triple, and the legs are built to produce it. */
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17],
  [12, 16, 20], [7, 24, 25], [20, 21, 29], [10, 24, 26], [15, 20, 25], [18, 24, 30]];

const walk = (R, tier) => {
  const legs = byTier(tier, 3, 4, 5);
  const t3 = R.pick(TRIPLES);
  const [tx, ty] = R() < 0.5 ? [t3[0], t3[1]] : [t3[1], t3[0]];
  const x = tx * R.pick([1, -1]), y = ty * R.pick([1, -1]);
  /* Legs alternate axis, because every turn is a right angle. The spare legs
     double back, so the distance walked is more than the distance covered. */
  const ewParts = legs - Math.floor(legs / 2), nsParts = Math.floor(legs / 2);
  const split = (net, k) => {
    if (k <= 1) return [net];
    const backs = Array.from({ length: k - 1 }, () => R.int(1, 9) * -Math.sign(net));
    const first = net - backs.reduce((a2, b2) => a2 + b2, 0);
    return first === 0 ? null : [first, ...backs];
  };
  const ew = split(x, ewParts), ns = split(y, nsParts);
  if (!ew || !ns) return null;
  /* The axis with more legs must go first, or the alternation runs out. */
  let wantEW = ewParts >= nsParts;
  const order = [];
  while (order.length < legs) {
    const pool = wantEW ? ew : ns;
    const v = pool.shift();
    if (v === undefined) return null;
    order.push({ ew: wantEW, v });
    wantEW = !wantEW;
  }
  const path = order.map(o => ({
    dir: o.ew ? (o.v > 0 ? 'East' : 'West') : (o.v > 0 ? 'North' : 'South'),
    d: Math.abs(o.v),
  }));
  if (path.some(p => p.d === 0)) return null;
  const turns = [];
  for (let i = 1; i < path.length; i++) {
    const t = turn(path[i - 1].dir, 'right') === path[i].dir ? 'right'
      : turn(path[i - 1].dir, 'left') === path[i].dir ? 'left' : null;
    if (!t) return null;                          // a U-turn is not a right-angle turn
    turns.push(t);
  }
  const dist = Math.hypot(x, y);
  if (!Number.isInteger(dist) || dist === 0) return null;
  const sum = path.reduce((a, l) => a + l.d, 0);
  const story = path.map((l, i) => (i === 0
    ? `walks <b>${l.d} m</b> towards the <b>${l.dir}</b>`
    : `turns ${turns[i - 1]} and walks <b>${l.d} m</b>`)).join(', then ');
  const dirName = x === 0 ? (y > 0 ? 'North' : 'South')
    : y === 0 ? (x > 0 ? 'East' : 'West')
    : `${y > 0 ? 'North' : 'South'}-${x > 0 ? 'East' : 'West'}`;
  const askDir = R() < 0.35;
  return ask({
    context: `A man starts from point A and ${story}, reaching point B.`,
    q: askDir ? 'In which direction is B from A?' : 'What is the shortest distance from A to B?',
    opts: askDir
      ? options(dirName, [
        { v: OPP[dirName] || dirName.split('-').map(d => OPP[d]).join('-'), why: 'That is the direction of A from B — the question asks the other way round.' },
        { v: 'North-East', why: '' }, { v: 'South-West', why: '' }, { v: 'North-West', why: '' }, { v: 'South-East', why: '' },
        { v: 'East', why: '' }, { v: 'West', why: '' },
      ])
      : options(`${dist} m`, [
        { v: `${sum} m`, why: 'That adds every leg. Legs in opposite directions cancel — only the net displacement counts.' },
        { v: `${Math.abs(x) + Math.abs(y)} m`, why: 'That walks the two net legs one after the other. The shortest distance is the straight line across them.' },
        { v: `${dist + 2} m`, why: '' },
        { v: `${Math.max(Math.abs(x), Math.abs(y))} m`, why: 'That uses only one of the two net legs.' },
      ], i => `${dist + 3 + i * 2} m`),
    why: `Track the two axes separately.<br>
      North–South: ${y >= 0 ? `${Math.abs(y)} m North` : `${Math.abs(y)} m South`}.
      East–West: ${x >= 0 ? `${Math.abs(x)} m East` : `${Math.abs(x)} m West`}.<br>
      ${askDir
        ? `So B lies <b>${dirName}</b> of A.`
        : `Those two are at right angles, so the straight-line distance is
           √(${Math.abs(x)}² + ${Math.abs(y)}²) = <b>${dist} m</b>.`}`,
    hardness: 1 + legs * 0.5,
    concept: 'net-displacement', conceptLabel: 'Net displacement',
    source: 'Shape of RAS 2024, Q87',
  });
};
function turn(face, t) {
  const L = { North: 'West', West: 'South', South: 'East', East: 'North' };
  const Rr = { North: 'East', East: 'South', South: 'West', West: 'North' };
  return t === 'left' ? L[face] : Rr[face];
}

/* People placed by offsets from one another — RAS 2023 Q87. The trick is that
   the clues are given in a jumbled order and one of them is a midpoint. */
const positions = (R, tier) => {
  const names = R.some([...FEMALE, ...MALE], byTier(tier, 4, 5, 5));
  const [A, B, C, D, E] = names;
  /* From a triple, for the same reason as the walk: the answer must be whole,
     and so must the midpoint, so the horizontal leg has to be even. */
  const t3 = R.pick(TRIPLES.filter(t => t[0] % 2 === 0 || t[1] % 2 === 0));
  const ab = t3[0] % 2 === 0 ? t3[0] : t3[1];
  const span = t3[0] % 2 === 0 ? t3[1] : t3[0];
  if (span < 2) return null;
  const pos = { [A]: [0, 0], [B]: [ab, 0] };
  pos[C] = [ab / 2, 0];                             // C midway between A and B
  const up = E ? R.int(1, span - 1) : span;
  const down = span - up;
  pos[D] = [0, up];                                 // D north of A
  if (E) pos[E] = [ab, -down];                      // E south of B
  const first = D, second = E || B;
  const dx = pos[first][0] - pos[second][0], dy = pos[first][1] - pos[second][1];
  const dist = Math.hypot(dx, dy);
  if (!Number.isInteger(dist)) return null;
  const clues = R.shuffle([
    `${A} and ${B} are <b>${ab} m</b> apart.`,
    `${C} is standing midway between ${A} and ${B}.`,
    `${D} is <b>${up} m</b> North of ${A}.`,
    ...(E ? [`${E} is <b>${down} m</b> South of ${B}.`] : []),
    `${A} is <b>${ab / 2} m</b> West of ${C}.`,
  ]);
  return ask({
    context: `${clues.join(' ')}`,
    q: `What is the shortest distance between <b>${first}</b> and <b>${second}</b>?`,
    opts: options(`${dist} m`, [
      { v: `${Math.abs(dx) + Math.abs(dy)} m`, why: 'That walks along the two sides. The shortest distance is the straight line across.' },
      { v: `${Math.abs(dy)} m`, why: 'That is only the North–South part of the gap.' },
      { v: `${Math.abs(dx)} m`, why: 'That is only the East–West part of the gap.' },
      { v: `${dist + 2} m`, why: '' },
    ], i => `${dist + 3 + i * 2} m`),
    why: `Put them on a grid. ${A} at (0, 0) means ${B} is at (${ab}, 0) and ${C} at (${ab / 2}, 0).<br>
      ${first} is at (${pos[first].join(', ')}) and ${second} at (${pos[second].join(', ')}).<br>
      The gap is ${Math.abs(dx)} m across and ${Math.abs(dy)} m up or down, so the straight line is
      √(${Math.abs(dx)}² + ${Math.abs(dy)}²) = <b>${dist} m</b>.`,
    hardness: 1.6 + names.length / 5,
    concept: 'triples', conceptLabel: 'Positions on a grid',
    source: 'Shape of RAS 2023, Q87',
  });
};

/* Mirror images — RAS 2023 Q89, RAS 2024 Q89.

   The symmetric set is a fact about how capitals are DRAWN, not something that
   can be derived, so it is written down once here and every question is
   derived from it. A mirror at the side of the page flips left and right, so a
   letter survives when it has a vertical axis of symmetry. */
const SAME_IN_MIRROR = ['A', 'H', 'I', 'M', 'O', 'T', 'U', 'V', 'W', 'X', 'Y'];
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const mirrorLetters = (R, tier) => {
  const kind = R.pick(['which', 'count-consonants', 'count-all', 'which-not']);
  if (kind === 'which' || kind === 'which-not') {
    const want = kind === 'which' ? SAME_IN_MIRROR : ALL.filter(c => !SAME_IN_MIRROR.includes(c));
    const other = kind === 'which' ? ALL.filter(c => !SAME_IN_MIRROR.includes(c)) : SAME_IN_MIRROR;
    const key = R.pick(want);
    return ask({
      context: `Capital letters are held up to a mirror placed at the side of the page.`,
      q: `Which of these letters ${kind === 'which' ? 'looks the SAME' : 'does NOT look the same'} as its mirror image?`,
      opts: options(key, R.some(other, 3).map(v => ({
        v, why: kind === 'which'
          ? `${v} has no vertical line of symmetry, so the mirror turns it into a shape that is not a letter.`
          : `${v} is symmetric about a vertical line, so the mirror leaves it unchanged.`,
      }))),
      why: `A side mirror swaps left and right, so a letter survives it exactly when it is symmetric
        about a <b>vertical</b> line. Those letters are <b>${SAME_IN_MIRROR.join(', ')}</b> —
        so the answer is <b>${key}</b>.`,
      hardness: 1.1,
      concept: 'which-axis', conceptLabel: 'Which axis the mirror flips',
      source: 'Shape of RAS 2023 Q89 · RAS 2024 Q89',
    });
  }
  const consonants = SAME_IN_MIRROR.filter(c => !VOWELS.includes(c));
  const key = kind === 'count-consonants' ? consonants.length : SAME_IN_MIRROR.length;
  const set = kind === 'count-consonants' ? 'consonants' : 'letters';
  return ask({
    context: `Every capital letter of the English alphabet is held up to a mirror placed at the side of the page.`,
    q: `How many of the <b>${set}</b> look exactly the same as their mirror image?`,
    opts: options(String(key), [
      { v: String(kind === 'count-consonants' ? 21 - consonants.length : 26 - SAME_IN_MIRROR.length),
        why: `That counts the ones that do NOT survive the mirror.` },
      { v: String(key + 2), why: '' }, { v: String(key - 2), why: '' },
      { v: String(kind === 'count-consonants' ? SAME_IN_MIRROR.length : consonants.length),
        why: kind === 'count-consonants' ? 'That counts the vowels among them too.' : 'That leaves the vowels out.' },
    ], i => String(key + 3 + i)),
    why: `A side mirror swaps left and right, so a letter survives when it is symmetric about a
      vertical line: <b>${SAME_IN_MIRROR.join(', ')}</b> — ${SAME_IN_MIRROR.length} letters,
      of which ${consonants.length} are consonants (${consonants.join(', ')}).<br>
      So the answer is <b>${key}</b>.`,
    hardness: 1.6,
    concept: 'both-axes', conceptLabel: 'Counting the symmetric letters',
    source: 'Shape of RAS 2023 Q89 · RAS 2024 Q89',
  });
};

/* Cubes cut from a painted block — RAS 2023 Q90 asks the invisible ones, which
   is the same count as "no face painted" wearing different words. */
const cubes = (R, tier) => {
  const n = R.int(byTier(tier, 3, 4, 4), byTier(tier, 4, 6, 8));
  const total = n ** 3;
  const kinds = [
    { q: 'will not be visible from outside, however the block is turned', key: (n - 2) ** 3,
      why: `The invisible ones are the core: strip one layer off each of the six faces and
            ${n} − 2 = ${n - 2} remains along each edge, so ${n - 2}³ = ${(n - 2) ** 3}.` },
    { q: 'have exactly two faces painted', key: 12 * (n - 2),
      why: `Two painted faces means the cube sits along an edge but not at a corner:
            12 edges × (${n} − 2) = ${12 * (n - 2)}.` },
    { q: 'have exactly one face painted', key: 6 * (n - 2) ** 2,
      why: `One painted face means the middle of a face: 6 × (${n} − 2)² = ${6 * (n - 2) ** 2}.` },
    { q: 'have exactly three faces painted', key: 8,
      why: `Three painted faces happens only at a corner, and a cube has <b>8</b> corners — whatever its size.` },
  ];
  const k = R.pick(kinds);
  if (k.key <= 0) return null;
  return ask({
    context: `A solid cube is painted on all six faces and then cut into <b>${total}</b> identical
      small cubes (<b>${n} × ${n} × ${n}</b>).`,
    q: `How many of the small cubes ${k.q}?`,
    /* At 4 × 4 × 4 the edge count and the face count are both 24, and the
       corners and the hidden core are both 8 — so the four groups cannot
       supply four distinct options on their own. */
    opts: options(String(k.key), kinds.filter(x => x.key !== k.key).map(x => ({
      v: String(x.key), why: `That is the count of cubes that ${x.q}.`,
    })).concat([
      { v: String(total), why: 'That is every cube in the block.' },
      { v: String(n * n), why: 'That is one face of the block, counted in small cubes.' },
      { v: String(6 * n * n), why: 'That counts every painted small FACE, not every painted cube.' },
    ]), i => String(k.key + 2 * (i + 1) + 1)),
    why: `${k.why}<br>The four groups — 8 corners, ${12 * (n - 2)} edges, ${6 * (n - 2) ** 2} faces and
      ${(n - 2) ** 3} hidden — add to ${8 + 12 * (n - 2) + 6 * (n - 2) ** 2 + (n - 2) ** 3}, which is ${total}. That is the check worth doing.`,
    hardness: 1.2 + n / 4,
    concept: 'painted-zero-faces', conceptLabel: 'Cubes inside a painted block',
    source: 'Shape of RAS 2023, Q90',
  });
};

export const SPATIAL_GENERATORS = [
  gen('ras-spa-walk', 'clocks', 'reasoning:3', 'net-displacement', 'Walks and displacement', walk),
  gen('ras-spa-positions', 'clocks', 'reasoning:3', 'triples', 'Positions on a grid', positions),
  gen('ras-spa-mirror', 'figures', 'reasoning:7', 'which-axis', 'Mirror images', mirrorLetters),
  gen('ras-spa-cubes', 'figures', 'reasoning:7', 'painted-zero-faces', 'Painted cubes', cubes),
];
