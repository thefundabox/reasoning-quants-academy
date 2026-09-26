/* ============================================================
   Question generators — Reasoning.

   The old `modules/*.html` pages could deal thousands of questions
   because they GENERATED them. Those generators are welded to the DOM,
   so nothing here is copied from them. What is borrowed is the idea,
   and the question types they proved were worth drilling.

   The engines are already in the widgets, and rule (b) of this project
   says a widget derives and never asserts — so a generator asks its
   question THROUGH the engine and takes the answer from the same call.
   A generated answer therefore cannot disagree with the lesson that
   taught it, and the harness re-derives every one independently anyway.

   Every generator reuses a `concept` its own chapter already teaches.
   Inventing new ids would put concepts on the Leitner ladder that the
   review builder has no questions for.
   ============================================================ */

import { options, near, byTier } from './rand.js';
import { barsFig, lineFig, vennFor, casesFig, mapFig, cubeFig, foldFig, dialFig } from './figures.js';
import { treeSVG, buildGraph } from '../widgets/family-tree.js';
import { walkSVG } from '../widgets/walk-map.js';
import { termFor } from '../widgets/relation-ladder.js';
import { trace, compassDir } from '../widgets/walk-map.js';
import { FULL, LEFT, RIGHT, BACK } from '../widgets/compass.js';
import { FAMILIES, shift, pos, chr, AZ } from '../widgets/cipher-wheel.js';
import { paintedCounts, paintedCuboid } from '../widgets/dice-lab.js';
import { worldsOf, testClaim } from '../widgets/claim-lab.js';

const NAMES = ['Ravi', 'Sita', 'Mohan', 'Priya', 'Arjun', 'Meera', 'Kabir', 'Anita'];

/* How far above or below you each relation term sits, and whether it is on your
   own line or a side branch. Used to tell a learner WHY the term they picked is
   wrong — "a niece is a level below you, this chain ends a level above" beats
   "no". Levels are the lesson's own vocabulary (see r.rel.ladder). */
const TERM_LEVEL = {
  father: 1, mother: 1, uncle: 1, aunt: 1, brother: 0, sister: 0, cousin: 0,
  son: -1, daughter: -1, nephew: -1, niece: -1,
  grandfather: 2, grandmother: 2, 'great-uncle': 2, 'great-aunt': 2,
  grandson: -2, granddaughter: -2,
  'great-grandfather': 3, 'great-grandmother': 3,
  'great-grandson': -3, 'great-granddaughter': -3,
  /* A chain can reach a marriage without a spouse step in it: the father of
     your sister's son is your brother-in-law. */
  'father-in-law': 1, 'mother-in-law': 1, 'brother-in-law': 0, 'sister-in-law': 0,
  'son-in-law': -1, 'daughter-in-law': -1,
};
const SIDE = new Set(['uncle', 'aunt', 'cousin', 'nephew', 'niece', 'great-uncle', 'great-aunt',
  'father-in-law', 'mother-in-law', 'brother-in-law', 'sister-in-law', 'son-in-law', 'daughter-in-law']);
const lvlWord = n => (n === 0 ? 'your own generation'
  : `${Math.abs(n)} level${Math.abs(n) > 1 ? 's' : ''} ${n > 0 ? 'above' : 'below'} you`);

function levelNote(term, right, path) {
  const a = TERM_LEVEL[term], b = TERM_LEVEL[right];
  if (a === undefined || b === undefined) return `The chain gives <b>${right}</b>, not ${term}.`;
  if (a !== b) {
    return `A <b>${term}</b> sits at ${lvlWord(a)}; this chain ends at ${lvlWord(b)}.
      Count the steps: ${path.map(k => (['father', 'mother'].includes(k) ? '+1'
        : ['son', 'daughter'].includes(k) ? '−1' : '0')).join(', ')} — net ${b > 0 ? '+' : ''}${b}.`;
  }
  return SIDE.has(term) !== SIDE.has(right)
    ? `<b>${term}</b> is on a SIDE branch of the family, and ${right} is on the direct line (or the
       other way round). Both sit at ${lvlWord(a)}, so the level is right and the branch is not.`
    : `Right level, wrong person — <b>${term}</b> and ${right} are both at ${lvlWord(a)}, so check
       the gender the last step of the chain fixes.`;
}
const WORDS = ['TIGER', 'MANGO', 'DELHI', 'JAIPUR', 'PLANT', 'CROWN', 'RIVER', 'STONE',
               'BUNDI', 'CHAIR', 'TABLE', 'MOUSE', 'LIGHT', 'TRAIN', 'CLOUD', 'BRAVE'];

/* ---------------- Unit 2 · Family & Relations ---------------- */

const STEP_WORDS = ['father', 'mother', 'brother', 'sister', 'son', 'daughter'];
const TERMS = ['father', 'mother', 'brother', 'sister', 'son', 'daughter', 'uncle', 'aunt',
               'nephew', 'niece', 'cousin', 'grandfather', 'grandmother', 'grandson',
               'granddaughter', 'great-uncle', 'great-aunt',
               /* Four steps can reach a third generation, and a distractor list that
                  cannot name the answer's own level is no test of the level rule. */
               'great-grandfather', 'great-grandmother', 'great-grandson', 'great-granddaughter',
               'brother-in-law', 'sister-in-law', 'father-in-law', 'mother-in-law'];

export const relationChain = {
  id: 'rel-chain', chapter: 'reasoning:2',
  concept: 'relation-chain', conceptLabel: 'Reading a relation chain one step at a time',
  make(R, tier = 2) {
    /* Keep drawing until the chain lands on an UNAMBIGUOUS term. "Father's son"
       is you or your brother, and a multiple-choice question cannot ask that. */
    let path, t;
    for (let i = 0; i < 40; i++) {
      path = Array.from({ length: R.int(byTier(tier, 2, 2, 3), byTier(tier, 2, 3, 4)) },
        () => R.pick(STEP_WORDS));
      t = termFor(path);
      /* `termFor` returns no word at all for a chain English does not name in
         one term — those get redrawn like the ambiguous ones. */
      if (t.term && !t.ambiguous && t.term !== 'you') break;
    }
    const phrase = 'your ' + path.map(k => `<b>${k}</b>'s`).join(' ').replace(/'s$/, '');
    /* Levels alone do not settle a chain where a sibling step sits next to a
       parent or child step: siblings SHARE their parents, so your sister's
       mother is your own mother. Say so, in the cases where it decides the
       answer — this is the rule the generator itself got wrong for months. */
    const shares = path.some((k, i) => i > 0 &&
      ((['brother', 'sister'].includes(path[i - 1]) && ['father', 'mother'].includes(k)) ||
       (['son', 'daughter'].includes(path[i - 1]) && ['brother', 'sister'].includes(k))));
    const sharesNote = shares
      ? `<br><br>Watch the sibling step: brothers and sisters <b>share their parents</b>, so
         "your sister's mother" is your own mother, not an aunt — and "your son's brother" is
         another son of yours. A sibling step next to a parent or child step cancels out.`
      : '';
    /* A wrong relation term is wrong in a knowable way: it sits at the wrong
       LEVEL. Naming that is more use than "no, try again" — the whole lesson is
       that each parent step climbs one level and each child step drops one. */
    const o = options(t.term, R.shuffle(TERMS.filter(x => x !== t.term)).slice(0, 3)
      .map(term => ({ v: term, why: levelNote(term, t.term, path) })));
    return {
      q: `How is that person related to you?`,
      context: `Somebody is <b>${phrase}</b>.`,
      ...o,
      whyRight: `Walk it, do not picture it. ${path.map((k, i) =>
        `step ${i + 1}: <b>${k}</b>`).join(' → ')}. Each parent step climbs a level, each child
        step drops one, and brother/sister move sideways without changing level — which lands on
        <b>${t.term}</b>.${sharesNote}`,
      whyWrong: `Take one step at a time from yourself, and track only the LEVEL.<br><br>
        ${path.map((k, i) => `${i + 1}. your ${k}`).join('<br>')}<br><br>
        Parent steps go up, child steps go down, sibling and spouse steps stay level.
        The answer is <b>${t.term}</b>.${sharesNote}`,
      /* The chain drawn as the tree the chapter teaches, from the same steps —
         so the answer can be read off a picture instead of a sentence. */
      figure: (() => {
        const people = ['You', ...path.map((_, i) => `P${i + 1}`)];
        const sentences = path.map((rel, i) => ({ a: people[i + 1], rel, b: people[i] }));
        const g = buildGraph(sentences);
        return treeSVG(g.persons, g.edges);
      })(),
      figureCap: `Each rung is one level. The chain ends on your <b>${t.term}</b>.`,
      hardness: path.length * 10,
    };
  },
};

/* ---------------- Unit 3 · Space & Direction ---------------- */

export const netDisplacement = {
  id: 'dir-displace', chapter: 'reasoning:3',
  concept: 'net-displacement', conceptLabel: 'Net displacement is a right triangle',
  make(R, tier = 2) {
    /* Pick legs that land on a Pythagorean triple, the way an exam does —
       the arithmetic must come out whole or the question is a calculator test. */
    /* 3-4-5 is recognised on sight; 9-40-41 has to be computed. */
    const [a, b] = R.pick(byTier(tier,
      [[3, 4], [6, 8], [9, 12]],
      [[3, 4], [6, 8], [9, 12], [12, 16], [15, 20], [5, 12], [10, 24],
       [8, 15], [16, 30], [7, 24], [20, 21], [9, 40]],
      [[16, 30], [7, 24], [20, 21], [9, 40], [12, 35], [11, 60]]));
    /* Any north/south leg with any east/west leg still makes a right angle, so
       varying the pair of directions multiplies the question pool by four. */
    const vert = R.pick(['N', 'S']), horiz = R.pick(['E', 'W']);
    const legs = [{ dir: vert, d: a }, { dir: horiz, d: b }];
    if (R() < 0.5) legs.reverse();
    const end = trace(legs).pop();
    const dist = Math.round(Math.hypot(end[0], end[1]));
    const o = options(`${dist} km`, [
      { v: `${a + b} km`, why: `That is how far he WALKED (${a} + ${b}). The question asks how far
        he ends up from the start, and the two legs are at a right angle — so the answer is the
        straight line across the corner, which is always shorter than the walk.` },
      { v: `${dist - 1} km`, why: `One short. ${a}² + ${b}² = ${a * a + b * b}, and √${a * a + b * b}
        is exactly ${dist} — these legs are a Pythagorean pair, so the root comes out whole.` },
      { v: `${dist + 1} km`, why: `One over. ${a}-${b}-${dist} is an exact triple; if your answer is
        not a whole number, or is next to one, the arithmetic slipped rather than the method.` },
      { v: `${dist + 2} km`, why: `√(${a}² + ${b}²) = √${a * a + b * b} = ${dist}, not ${dist + 2}.` },
    ]);
    return {
      q: 'How far is he from the starting point?',
      context: `A man walks <b>${legs[0].d} km ${FULL[legs[0].dir]}</b>, then turns and walks
                <b>${legs[1].d} km ${FULL[legs[1].dir]}</b>.`,
      ...o,
      whyRight: `The two legs are at right angles, so the displacement is the hypotenuse:
        √(${a}² + ${b}²) = √${a * a + b * b} = <b>${dist} km</b>. Direction from the start is
        <b>${compassDir(end[0], end[1])}</b>.`,
      whyWrong: `Do not add the legs — ${a} + ${b} = ${a + b} is the distance WALKED, not the
        distance FROM the start.<br><br>Perpendicular legs make a right triangle, so use
        √(${a}² + ${b}²) = <b>${dist} km</b>.`,
      /* The route itself, drawn to scale. The straight line from START to END
         is the answer, and seeing it removes the "add the legs" instinct. */
      figure: walkSVG(legs, { w: 380, h: 260 }).svg,
      figureCap: `The faint line is the displacement — ${dist} km, ${compassDir(end[0], end[1])} of the start.`,
      hardness: a + b,
    };
  },
};

export const turnChain = {
  id: 'dir-turns', chapter: 'reasoning:3',
  concept: 'turn-chain', conceptLabel: 'Turns compound in the walker\'s own frame',
  make(R, tier = 2) {
    const start = R.pick(['N', 'E', 'S', 'W']);
    /* Two turns can be held in the head; four cannot, which is the point. */
    const turns = Array.from({ length: R.int(byTier(tier, 1, 2, 3), byTier(tier, 2, 3, 5)) },
      () => R.pick(byTier(tier, ['left', 'right'], ['left', 'right', 'about'],
        ['left', 'right', 'about'])));
    const face = turns.reduce((f, t) =>
      (t === 'left' ? LEFT[f] : t === 'right' ? RIGHT[f] : BACK[f]), start);
    /* Every wrong compass point is wrong by a nameable amount — a quarter turn
       one way is "you took left as the map's left", a half turn is "one turn
       applied backwards". Saying which beats saying "no". */
    const QUARTER = { N: 'E', E: 'S', S: 'W', W: 'N' };
    const o = options(FULL[face], ['N', 'E', 'S', 'W'].filter(d => d !== face).map(d => ({
      v: FULL[d],
      why: BACK[face] === d
        ? `Exactly reversed. One of the turns was applied the wrong way round — most often a
           <b>left</b> read as the map's left rather than the walker's. Facing ${FULL[face]},
           her left is ${FULL[LEFT[face]]}, not ${FULL[RIGHT[face]]}.`
        : QUARTER[face] === d
          ? `A quarter turn clockwise of the answer. Count the turns one at a time — combining two
             in your head is where this slips.`
          : `A quarter turn anticlockwise of the answer. Use the clock face: N = 12, E = 3, S = 6,
             W = 9; right is +3 hours, left is −3, a U-turn is +6.`,
    })));
    return {
      q: 'Which direction is she facing now?',
      context: `A cyclist sets off facing <b>${FULL[start]}</b>. She then turns
                ${turns.map(t => `<b>${t === 'about' ? 'about (U-turn)' : t}</b>`).join(', then ')}.`,
      ...o,
      whyRight: `Every turn is measured from where SHE faces, never from the map.
        ${turns.reduce((acc, t) => {
          const f = acc.f, n = t === 'left' ? LEFT[f] : t === 'right' ? RIGHT[f] : BACK[f];
          acc.txt.push(`${FULL[f]} —${t}→ <b>${FULL[n]}</b>`); acc.f = n; return acc;
        }, { f: start, txt: [] }).txt.join('; ')}.`,
      whyWrong: `Use the clock: N = 12, E = 3, S = 6, W = 9. A right turn moves three hours
        clockwise, a left turn three anticlockwise, a U-turn six.<br><br>
        Starting at ${FULL[start]} and applying ${turns.join(', ')} gives <b>${FULL[face]}</b>.`,
      figure: dialFig(start, turns, face),
      figureCap: `Grey is where she began; the coloured arm is where she ended.`,
      hardness: turns.length * 10 + turns.filter(t => t === 'about').length * 3,
    };
  },
};

/* ---------------- Unit 4 · Order & Arrangement ---------------- */

const ord = k => k + (['th', 'st', 'nd', 'rd'][(k % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][k] || 'th');

export const rankTotal = {
  id: 'ord-total', chapter: 'reasoning:4',
  concept: 'rank-total', conceptLabel: 'Total = left rank + right rank − 1',
  make(R, tier = 2) {
    const total = R.int(byTier(tier, 8, 18, 40), byTier(tier, 16, 45, 95));
    const left = R.int(byTier(tier, 2, 4, 6), total - byTier(tier, 2, 4, 6));
    const right = total - left + 1;
    const o = options(String(total), [
      { v: String(left + right), why: `That is ${left} + ${right} with nothing subtracted — so Anil
        himself has been counted twice, once from each end. Subtract exactly one for the overlap.` },
      { v: String(total - 1), why: `One too few: you subtracted twice. Only ONE person is
        double-counted, so the correction is −1, not −2.` },
      { v: String(total + 2), why: `Total = left + right − 1 = ${left} + ${right} − 1 = ${total}.` },
    ], i => String(total + i + 3));
    return {
      q: 'How many people are in the row?',
      context: `In a row, Anil is <b>${ord(left)} from the left</b> and
                <b>${ord(right)} from the right</b>.`,
      ...o,
      whyRight: `${left} + ${right} − 1 = <b>${total}</b>. The minus one is Anil himself: counting
        from both ends counts him twice.`,
      whyWrong: `Adding the two ranks gives ${left + right}, which counts Anil <em>twice</em> —
        once from each end.<br><br>Total = left + right − 1 = ${left} + ${right} − 1 =
        <b>${total}</b>.`,
      figure: lineFig(total, [{ at: left, label: 'A', note: `${left} from left` }],
        { caption: `${right} from the right` }),
      figureCap: `One person, counted from both ends — so the overlap is subtracted once.`,
      hardness: total,
    };
  },
};

export const rankBetween = {
  id: 'ord-between', chapter: 'reasoning:4',
  concept: 'rank-between', conceptLabel: 'People strictly between two positions',
  make(R, tier = 2) {
    const total = R.int(byTier(tier, 8, 20, 38), byTier(tier, 16, 40, 90));
    const [a, b] = R.some([...Array(total).keys()].map(i => i + 1), 2).sort((x, y) => x - y);
    if (b - a < 2) return this.make(R);                 // need somebody in between
    const between = b - a - 1;
    const o = options(String(between), [
      { v: String(b - a), why: `${b} − ${a} = ${b - a} is the GAP in positions, which still includes
        one of the two people. "Between" is strictly inside, so subtract one more.` },
      { v: String(between - 1), why: `One too few — you subtracted 2. Only the two named people are
        excluded, and the difference ${b} − ${a} already left one of them out.` },
      { v: String(between + 2), why: `|${b} − ${a}| − 1 = ${b - a} − 1 = ${between}.` },
    ], i => String(between + i + 3));
    return {
      q: 'How many people sit between them?',
      context: `In a row of ${total}, Ravi is <b>${ord(a)} from the left</b> and Sunil is
                <b>${ord(b)} from the left</b>.`,
      ...o,
      whyRight: `|${b} − ${a}| − 1 = <b>${between}</b>. The minus one excludes the two of them:
        "between" never counts the endpoints.`,
      whyWrong: `${b} − ${a} = ${b - a} counts one of the two people as well as the gap.<br><br>
        Between means strictly inside, so subtract one: <b>${between}</b>.`,
      figure: lineFig(total, [
        { at: a, label: 'R', note: ord(a) },
        { at: b, label: 'S', note: ord(b) },
      ], { caption: `${between} between them` }),
      figureCap: `The two marked seats are the endpoints — "between" is what lies strictly inside.`,
      hardness: total,
    };
  },
};

/* ---------------- Unit 5 · Codes & Patterns ---------------- */

export const codeFamily = {
  id: 'code-apply', chapter: 'reasoning:5',
  concept: 'name-the-family', conceptLabel: 'Naming the code family from one pair',
  make(R, tier = 2) {
    /* The SAME rule instance must encode the example and the asked word, or the
       answer is computed with a different key than the one shown. That exact bug
       made 28% of the old module's questions unanswerable. */
    /* A uniform shift is one subtraction; an incremental shift changes every
       letter by a different amount, which is where the family has to be NAMED. */
    const fam = R.pick(byTier(tier,
      FAMILIES.filter(f => ['shift', 'reverse'].includes(f.id)),
      FAMILIES,
      FAMILIES.filter(f => ['incr', 'atbash', 'pairswap'].includes(f.id))));
    const tag = fam.id === 'shift' ? String(R.int(1, 6))
              : fam.id === 'incr' ? String(R.int(1, 3)) : 'yes';
    const [w1, w2] = R.some(WORDS, 2);
    const shown = fam.apply(w1, tag), correct = fam.apply(w2, tag);
    const o = options(correct, [
      { v: shift(w2, 1), why: `That is a shift of +1. Read the rule off the pair you were GIVEN
        (<code>${w1}</code> → <code>${shown}</code>) before touching the second word — here it is
        <b>${fam.name}</b>, not a one-step shift.` },
      { v: shift(w2, -1), why: `That is a shift of −1, and in the wrong direction as well. The
        given pair defines the rule: <b>${fam.name}</b> — ${fam.blurb}` },
      { v: [...w2].reverse().join(''), why: `That is the word simply reversed. Reversal is one of
        the five families, but it is not the one at work here: <b>${fam.name}</b>.` },
      { v: shift(w2, 2), why: `A fixed shift of +2. Check your rule against EVERY letter of the
        given pair — a rule that fits the first letter and not the rest is the wrong rule.` },
    ], i => shift(w2, i + 3));
    return {
      q: `How will <code>${w2}</code> be written in that code?`,
      context: `In a certain code, <code>${w1}</code> is written as <code>${shown}</code>.`,
      ...o,
      whyRight: `The rule is <b>${fam.name}</b> — ${fam.blurb}. Applying the same rule to
        ${w2} gives <b>${correct}</b>.`,
      whyWrong: `Find the rule from the pair you were GIVEN before touching the second word.
        <code>${w1}</code> → <code>${shown}</code> is <b>${fam.name}</b>: ${fam.blurb}.<br><br>
        Apply that to <code>${w2}</code> and you get <b>${correct}</b>.`,
      /* Letter under letter with its position — a code is a MAPPING, and a
         mapping wants two rows and arrows, not a sentence about arrows. */
      figure: mapFig([...w2].map((ch, i) => ({
        from: ch, fromPos: pos(ch), to: correct[i], toPos: pos(correct[i]),
      })), { note: `${fam.name} — ${fam.blurb}` }),
      figureCap: `The same rule read off <code>${w1}</code> → <code>${shown}</code>, applied letter by letter.`,
      hardness: { shift: 10, reverse: 14, atbash: 22, pairswap: 24, incr: 30 }[fam.id] || 20,
    };
  },
};

export const letterPosition = {
  id: 'code-position', chapter: 'reasoning:5',
  concept: 'position-both-ends', conceptLabel: 'A letter\'s position from both ends',
  make(R, tier = 2) {
    /* Letters near the ends are easy to count to; the middle is not. */
    const c = R.pick(byTier(tier,
      [...AZ].filter(x => pos(x) <= 6 || pos(x) >= 21),
      [...AZ],
      [...AZ].filter(x => pos(x) >= 9 && pos(x) <= 18)));
    const fromA = pos(c), fromZ = 27 - fromA;
    /* Asked from either end, or as the partner letter. Same identity
       (positions sum to 27) approached three ways, which is how the paper
       varies it too. */
    /* Gentle offered one form over twelve letters, which is twelve questions —
       exactly the harness's floor, and a check that is exactly satisfied is a
       check about to fail. "From the other end" is the same identity read the
       other way, not a harder idea. */
    const form = R.pick(byTier(tier, ['fromZ', 'fromA'], ['fromZ', 'fromA', 'partner'],
      ['fromA', 'partner', 'fromZ']));
    if (form === 'partner') return positionPartner(R, c, fromA, fromZ);
    if (form === 'fromA') return positionFromA(R, c, fromA, fromZ);
    const o = options(String(fromZ), [
      { v: String(26 - fromA), why: `26 − ${fromA}. The two positions add to <b>27</b>, not 26,
        because the letter itself is counted from both ends — so it is counted twice and 26 leaves
        no room for it.` },
      { v: String(fromZ + 1), why: `One over. 27 − ${fromA} = ${fromZ}. Check it on ${c}'s partner
        <b>${chr(fromZ)}</b>, which sits the same distance from the other end.` },
      { v: String(fromZ + 2), why: `Position from Z = 27 − position from A = 27 − ${fromA} = ${fromZ}.` },
    ], i => String(fromZ + i + 3));
    return {
      q: `What is its position counted from <b>Z</b>?`,
      context: `The letter <b>${c}</b> is the ${ord(fromA)} letter of the alphabet.`,
      ...o,
      whyRight: `27 − ${fromA} = <b>${fromZ}</b>. The two positions always add to 27, because
        the letter itself is counted from both ends.`,
      whyWrong: `26 − ${fromA} = ${26 - fromA} forgets that a letter counted from both ends is
        counted twice.<br><br>Position from Z = 27 − position from A = 27 − ${fromA} =
        <b>${fromZ}</b>. Check it on ${c}'s partner, <b>${chr(fromZ)}</b>.`,
      figure: lineFig(26, [
        { at: fromA, label: c, note: `${fromA} from A` },
        { at: fromZ, label: chr(fromZ), note: `${fromA} from Z` },
      ], { w: 480, caption: `${fromA} + ${fromZ} = 27` }),
      figureCap: `A letter and its partner sit the same distance from opposite ends.`,
      hardness: 14 - Math.abs(13.5 - fromA),
    };
  },
};

/* ---------------- Unit 7 · Visual Reasoning ---------------- */

export const holeDoubling = {
  id: 'vis-folds', chapter: 'reasoning:7',
  concept: 'hole-doubling', conceptLabel: 'Each fold doubles the holes',
  make(R, tier = 2) {
    /* Vary the punch count as well as the folds, or there are only three
       questions here and a learner meets each one every third draw.
       GENTLE was still only six questions — two fold counts, one punch, three
       shapes — which is a pool a novice exhausts inside two sessions, and
       Gentle is exactly the tier a struggling learner is dealt. Three folds and
       two punches is still small enough to count on fingers. */
    const folds = R.int(1, byTier(tier, 3, 5, 6));
    const punches = R.int(1, byTier(tier, 2, 4, 6));
    const holes = punches * 2 ** folds;
    const shape = R.pick(['square', 'rectangular', 'circular', 'triangular']);
    const o = options(String(holes), [
      { v: String(folds * 2 * punches), why: `That multiplies the folds by 2 and then by the
        punches — folds ADD layers arithmetically in that sum. They do not: each fold DOUBLES the
        layers, so ${folds} folds give 2<sup>${folds}</sup> = ${2 ** folds} layers, not ${folds * 2}.` },
      { v: String(holes - punches), why: `One punch-worth short — you counted the layers under the
        punch but forgot the top layer itself. ${folds} folds make ${2 ** folds} layers in all.` },
      { v: String(holes * 2), why: `One fold too many. ${folds} fold${folds > 1 ? 's give' : ' gives'}
        ${2 ** folds} layers, so ${punches} × ${2 ** folds} = ${holes}. Doubling again would be
        ${folds + 1} folds.` },
    ], i => ({ v: String(holes + i + 1),
               why: `The count must be ${punches} × 2<sup>${folds}</sup> — a whole number of
                     doublings. ${holes + i + 1} is not ${punches} times any power of two here.` }));
    return {
      q: 'How many holes are in the sheet when it is opened out?',
      context: `A ${shape} sheet is folded in half <b>${folds} time${folds > 1 ? 's' : ''}</b>, and then
                <b>${punches} hole${punches > 1 ? 's are' : ' is'}</b> punched through the folded packet.`,
      ...o,
      whyRight: `Each fold doubles the paper under the punch, so it doubles every hole:
        ${punches} × 2<sup>${folds}</sup> = ${punches} × ${2 ** folds} = <b>${holes}</b>.`,
      whyWrong: `Folds multiply, they do not add.<br><br>
        ${folds} fold${folds > 1 ? 's' : ''} makes ${2 ** folds} layers
        (${Array.from({ length: folds }, (_, i) => 2 ** (i + 1)).join(' → ')}), and every punch goes
        through all of them: ${punches} × ${2 ** folds} = <b>${holes}</b> — unless a hole lands
        exactly on a crease, when two copies coincide.`,
      figure: foldFig(Math.min(folds, 2), holes,
        { note: `${punches} punch${punches > 1 ? 'es' : ''} × 2^${folds} layers` }),
      figureCap: `Each crease doubles the paper beneath the punch, so it doubles the holes.`,
      hardness: folds * 10 + punches,
    };
  },
};

export const paintedCube = {
  id: 'vis-cube', chapter: 'reasoning:7',
  concept: 'painted-two-faces', conceptLabel: 'Painted cubes by position, not by formula',
  make(R, tier = 2) {
    /* A CUBOID as often as a cube. Same idea, far more of it: a cube offers one
       parameter and a cuboid offers three, and the uneven block is the harder
       and more common exam form because the four closed formulas stop looking
       symmetric. Counts come from a brute-force walk over every unit cube
       (`paintedCuboid`), so no formula is being trusted here. */
    const asCuboid = R() < byTier(tier, 0.25, 0.55, 0.75);
    const lo = byTier(tier, 3, 3, 4), hi = byTier(tier, 4, 6, 8);
    const n = R.int(lo, hi);
    const dims = asCuboid
      ? [R.int(lo, hi), R.int(lo, hi), R.int(lo, hi)]
      : [n, n, n];
    const [dx, dy, dz] = dims;
    const cubes = dx * dy * dz;
    const c = asCuboid ? paintedCuboid(dx, dy, dz) : paintedCounts(n);
    const shape = asCuboid && !(dx === dy && dy === dz)
      ? `<b>${dx} × ${dy} × ${dz} = ${cubes}</b>`
      : `<b>${dx} × ${dy} × ${dz} = ${cubes}</b>`;
    const which = R.pick([
      { k: 'two', label: 'exactly two faces', v: c.two, why: 'the edge cubes, not counting corners' },
      { k: 'one', label: 'exactly one face', v: c.one, why: 'the middle of each face' },
      { k: 'zero', label: 'no face at all', v: c.zero, why: 'the hidden core' },
    ]);
    /* The distractors ARE the other three groups, so each one can be named
       exactly — which is far more use than "wrong", because the mistake is
       almost always reading the question rather than the counting. */
    const GROUPS = [
      { v: c.three, name: 'exactly three faces (the 8 corners)' },
      { v: c.two, name: 'exactly two faces (the edges, corners excluded)' },
      { v: c.one, name: 'exactly one face (the middle of each face)' },
      { v: c.zero, name: 'no face at all (the hidden core)' },
    ];
    const o = options(String(which.v),
      GROUPS.filter(g => String(g.v) !== String(which.v)).map(g => ({
        v: String(g.v),
        why: `${g.v} is the count of cubes with <b>${g.name}</b>. You were asked for
          <b>${which.label}</b>, which is ${which.v}. All four groups add to ${cubes}.`,
      })), i => ({ v: String(which.v + i + 1),
                   why: `Not one of the four groups. Corners ${c.three}, edges ${c.two}, face
                         middles ${c.one}, core ${c.zero} — and they must add to ${cubes}.` }));
    return {
      q: `How many small cubes have <b>${which.label}</b> painted?`,
      context: `A ${asCuboid && !(dx === dy && dy === dz) ? 'solid block' : 'cube'} is painted on
                all six faces and then cut into ${shape} identical small cubes.`,
      ...o,
      whyRight: `Those are ${which.why}: <b>${which.v}</b>. The four groups are
        ${c.three} corner + ${c.one} one-face + ${c.two} two-face + ${c.zero} unpainted,
        and they must add to ${cubes} — they do.`,
      whyWrong: `Do not memorise four formulas; count by POSITION.<br><br>
        Corners (3 faces) = ${c.three}; edges (2 faces) = ${c.two}; face middles (1 face) =
        ${c.one}; the core (0 faces) = ${c.zero}. They add to ${cubes}.<br><br>
        Here the answer is <b>${which.v}</b>.`,
      /* The cube as a face, plus the four groups as bars — the point is that
         they PARTITION n³, which a bar chart shows and a list does not. */
      figure: cubeFig(Math.max(dx, dy, dz), { note: `${n} × ${n} × ${n} = ${cubes} small cubes` }) +
        barsFig([
          { label: '3 faces', value: c.three, on: which.k === 'three' },
          { label: '2 faces', value: c.two, on: which.k === 'two' },
          { label: '1 face', value: c.one, on: which.k === 'one' },
          { label: '0 faces', value: c.zero, on: which.k === 'zero' },
        ], { w: 340 }),
      figureCap: `The four groups must add to ${cubes} — count by position, never by formula.`,
      hardness: (dx + dy + dz) * 4 + { three: 0, one: 2, two: 4, zero: 6 }[which.k],
    };
  },
};

/* ---------------- Unit 1 · Foundations of Reasoning ----------------
   This chapter had no generator for a long time, and the reason given was
   that its questions are "arguments in prose". That was only half true. The
   PROSE varies, but the logic underneath is a handful of shapes, and Unit 1
   already owns an engine for exactly this: `claim-lab` enumerates every world
   a statement permits, and a conclusion follows only if it holds in all of
   them. So the generator states a rule, states a fact, and asks the engine —
   it never decides for itself what follows. */

/* Each pair is (antecedent, consequent) of one conditional, written so that
   the reversal reads plausibly — that trap is the whole point of the unit. */
const CONDITIONALS = [
  { p: 'the road is repaired', q: 'the buses run to Bundi',
    pNeg: 'the road was not repaired', qNeg: 'the buses are not running to Bundi' },
  { p: 'the monsoon arrives on time', q: 'the kharif crop is sown',
    pNeg: 'the monsoon did not arrive on time', qNeg: 'the kharif crop was not sown' },
  { p: 'a candidate clears the prelims', q: 'the candidate sits the mains',
    pNeg: 'the candidate did not clear the prelims', qNeg: 'the candidate did not sit the mains' },
  { p: 'the fee is paid', q: 'the admission is confirmed',
    pNeg: 'the fee was not paid', qNeg: 'the admission was not confirmed' },
  { p: 'the dam gates are opened', q: 'the fields downstream are flooded',
    pNeg: 'the dam gates were not opened', qNeg: 'the fields downstream were not flooded' },
  { p: 'the file reaches the collector', q: 'the sanction is issued',
    pNeg: 'the file did not reach the collector', qNeg: 'the sanction was not issued' },
  { p: 'the well is recharged', q: 'the village has water in May',
    pNeg: 'the well was not recharged', qNeg: 'the village had no water in May' },
  { p: 'the bus leaves by six', q: 'the party reaches Jaipur by noon',
    pNeg: 'the bus did not leave by six', qNeg: 'the party did not reach Jaipur by noon' },
];

/* The four facts an examiner attaches to a conditional. Two of them prove
   something; the other two are the classic fallacies and prove nothing. */
const FACTS = [
  { key: 'p',  text: c => c.p,    fix: { p: true } },        // modus ponens
  { key: 'nq', text: c => c.qNeg, fix: { q: false } },       // modus tollens
  { key: 'q',  text: c => c.q,    fix: { q: true } },        // affirming the consequent
  { key: 'np', text: c => c.pNeg, fix: { p: false } },       // denying the antecedent
];

export const conditionalFollows = {
  id: 'found-conditional', chapter: 'reasoning:1',
  concept: 'conclusion-follows', conceptLabel: 'A conclusion must hold in every permitted case',
  make(R, tier = 2) {
    const c = R.pick(CONDITIONALS);
    /* Gentle only ever gives a fact that PROVES something, so the learner meets
       the valid forms first. The two fallacies — where the honest answer is
       "neither follows" — are what the harder tiers add. */
    const fact = R.pick(byTier(tier,
      FACTS.filter(f => ['p', 'nq'].includes(f.key)),
      FACTS,
      FACTS.filter(f => ['q', 'np'].includes(f.key))));

    /* The model: two atoms, one constraint (p implies q), plus whatever the
       fact fixes. Everything after this is read off the enumeration. */
    const model = {
      atoms: [
        { key: 'p', fixed: fact.fix.p },
        { key: 'q', fixed: fact.fix.q },
      ],
      constraints: [w => !(w.p && !w.q)],
    };
    const worlds = worldsOf(model);

    /* Two conclusions, exam style. Which of them follows is the engine's
       answer, not the author's. */
    const pool = [
      { text: c.p,    claim: w => w.p },
      { text: c.pNeg, claim: w => !w.p },
      { text: c.q,    claim: w => w.q },
      { text: c.qNeg, claim: w => !w.q },
    ].filter(x => x.text !== fact.text(c));            // never restate the fact

    const [I, II] = R.some(pool, 2);
    const iFollows  = testClaim(model, I.claim, worlds).follows;
    const iiFollows = testClaim(model, II.claim, worlds).follows;

    const verdict = iFollows && iiFollows ? 'Both I and II follow'
      : iFollows ? 'Only conclusion I follows'
      : iiFollows ? 'Only conclusion II follows'
      : 'Neither conclusion follows';
    /* Each wrong verdict is wrong about a NAMED conclusion, and the enumerator
       already knows which — so say so, rather than repeating the general rule
       at somebody who has just misjudged one specific claim. */
    const claims = { I: iFollows, II: iiFollows };
    const asserts = v => ({
      'Only conclusion I follows': { I: true, II: false },
      'Only conclusion II follows': { I: false, II: true },
      'Both I and II follow': { I: true, II: true },
      'Neither conclusion follows': { I: false, II: false },
    }[v]);
    const o = options(verdict, [
      'Only conclusion I follows', 'Only conclusion II follows',
      'Both I and II follow', 'Neither conclusion follows',
    ].filter(x => x !== verdict).map(v => {
      const a = asserts(v);
      /* Built per conclusion, never grouped. The two can be wrong in OPPOSITE
         directions — one claimed to follow when it does not, the other denied
         when it does — and a single shared verb phrase would then contradict
         itself. One clause each is longer and cannot be wrong. */
      const clauses = ['I', 'II'].filter(k => a[k] !== claims[k]).map(k =>
        `it has <b>${k}</b> ${a[k] ? 'following' : 'not following'}, but ${k} ` +
        (claims[k] ? `holds in every one of the ${worlds.length} case${worlds.length > 1 ? 's' : ''}
          the statement permits` : `fails in at least one of those cases`));
      return {
        v,
        why: `${clauses.join('; and ')}. A conclusion follows only if it survives EVERY permitted
          case — one counter-case is enough to kill it, and no number of supporting cases can
          rescue it.`,
      };
    }));

    const why = x => (testClaim(model, x.claim, worlds).follows
      ? `holds in every case the statement allows`
      : `fails in at least one case the statement allows`);

    return {
      q: 'Which of the conclusions follows?',
      context: `<b>Statement:</b> If ${c.p}, then ${c.q}.<br>
                <b>Fact:</b> ${fact.text(c).charAt(0).toUpperCase() + fact.text(c).slice(1)}.<br><br>
                <b>Conclusion I:</b> ${I.text.charAt(0).toUpperCase() + I.text.slice(1)}.<br>
                <b>Conclusion II:</b> ${II.text.charAt(0).toUpperCase() + II.text.slice(1)}.`,
      ...o,
      whyRight: `Correct. Of the ${worlds.length} case${worlds.length > 1 ? 's' : ''} the statement
                 leaves open, <b>I</b> ${why(I)} and <b>II</b> ${why(II)}.`,
      whyWrong: `List the cases the statement allows, then keep only those the fact permits —
                 ${worlds.length} remain${worlds.length === 1 ? 's' : ''}.<br><br>
                 A conclusion follows only if it is true in <em>every</em> one of them.
                 Here <b>I</b> ${why(I)}, and <b>II</b> ${why(II)}.<br><br>
                 The two that trap people: "${c.q}" being true does <em>not</em> put the road back
                 — something else may cause it. And "${c.pNeg}" leaves the consequent free.`,
      /* Every case the statement still permits, listed. A conclusion follows
         exactly when its column is true all the way down — which is the whole
         method, and is visible here rather than asserted. */
      figure: casesFig(['case', c.p, c.q], worlds.map((w, i) =>
        [`${i + 1}`, w.p, w.q])),
      figureCap: `${worlds.length} case${worlds.length > 1 ? 's remain' : ' remains'} after the fact.
        A conclusion follows only if it holds in every row.`,
      /* More surviving cases means more to check before a conclusion is safe. */
      hardness: worlds.length * 10 + (['q', 'np'].includes(fact.key) ? 8 : 0),
    };
  },
};

/* ---------------- Unit 6 · Logic & Deduction ----------------
   Syllogisms, derived rather than authored. Three categories cut the world
   into seven regions; a model says which regions have anybody in them, and
   there are only 2^7 of those. A premise rules models out, and a conclusion
   FOLLOWS exactly when no surviving model contradicts it.

   One convention matters and it is the one the lessons teach: a named
   category is never empty, so "All A are B" gives you "Some B are A" for
   free. Drop that and this generator would mark r-log-sets wrong. */

const REGIONS = ['a', 'b', 'c', 'ab', 'ac', 'bc', 'abc'];
const IN = {
  A: ['a', 'ab', 'ac', 'abc'],
  B: ['b', 'ab', 'bc', 'abc'],
  C: ['c', 'ac', 'bc', 'abc'],
};
const inter = (x, y) => IN[x].filter(r => IN[y].includes(r));
const minus = (x, y) => IN[x].filter(r => !IN[y].includes(r));

/** Every way the seven regions can be occupied, with no category empty. */
function syllogismModels() {
  const out = [];
  for (let m = 0; m < 128; m++) {
    const occ = {};
    REGIONS.forEach((r, i) => { occ[r] = !!(m & (1 << i)); });
    if (['A', 'B', 'C'].every(k => IN[k].some(r => occ[r]))) out.push(occ);
  }
  return out;
}
const ALL_MODELS = syllogismModels();

/** A statement as a test on one model. */
const stmt = (kind, x, y) => ({
  kind, x, y,
  /* Category names are plural, so every form has to agree with them —
     "No farmers is doctors" is the giveaway that a template was written
     for singular nouns. */
  text: kind === 'all' ? `All ${x} are ${y}`
      : kind === 'no' ? `No ${x} are ${y}`
      : kind === 'some' ? `Some ${x} are ${y}`
      : `Some ${x} are not ${y}`,
  holds: occ =>
    kind === 'all' ? minus(x, y).every(r => !occ[r])
    : kind === 'no' ? inter(x, y).every(r => !occ[r])
    : kind === 'some' ? inter(x, y).some(r => occ[r])
    : minus(x, y).some(r => occ[r]),
});

export const syllogism = {
  id: 'log-syllogism', chapter: 'reasoning:6',
  concept: 'counterexample-method', conceptLabel: 'Killing a conclusion with one drawing',
  make(R, tier = 2) {
    const [A, B, C] = R.some(
      ['painters', 'poets', 'clerks', 'farmers', 'singers', 'doctors', 'traders', 'weavers'], 3);
    const names = { A, B, C };
    const label = s => ({ ...s, text: s.text.replace(/\b(A|B|C)\b/g, k => names[k]) });

    /* Premises always share the middle term B, the way an exam sets them.
       Plenty of pairs prove nothing at all, or contradict each other — that is
       true of real syllogisms too. Redraw until a pair yields exactly one
       clean answer rather than throwing, so the caller always gets a question. */
    const KINDS = ['all', 'no', 'some', 'somenot'];
    let p1, p2, live, follows, fails;
    let found = false;
    for (let attempt = 0; attempt < 60 && !found; attempt++) {
      /* "All" premises pin the circles down; "some" premises leave far more
         arrangements alive, and every one has to be checked. */
      const pool = byTier(tier, ['all', 'no'], KINDS, ['some', 'somenot', 'no']);
      p1 = stmt(R.pick(pool), 'A', 'B');
      p2 = stmt(R.pick(pool), 'B', 'C');
      live = ALL_MODELS.filter(m => p1.holds(m) && p2.holds(m));
      if (!live.length) continue;                       // premises contradict

      const cands = [];
      for (const [x, y] of [['A', 'C'], ['C', 'A'], ['A', 'B'], ['B', 'A'], ['B', 'C'], ['C', 'B']]) {
        for (const k of KINDS) cands.push(stmt(k, x, y));
      }
      /* A conclusion that simply repeats a premise is not a question — it asks
         the learner to notice they have been handed the answer. Converting a
         premise ("No A are B" → "No B are A") is a real inference and stays. */
      const isPremise = s => [p1, p2].some(p => p.kind === s.kind && p.x === s.x && p.y === s.y);
      follows = cands.filter(s => !isPremise(s) && live.every(m => s.holds(m)));
      fails = cands.filter(s => !live.every(m => s.holds(m)));
      found = follows.length > 0 && fails.length >= 3;
    }
    if (!found) throw new Error('no clean single answer');

    const rightRaw = R.pick(follows);
    const right = label(rightRaw);
    /* Distractors must not be equivalent restatements of the answer. */
    const wrongRaw = R.shuffle(fails).filter(s => label(s).text !== right.text).slice(0, 3);
    /* Every failing conclusion fails for a reason the enumerator can point at:
       there is a surviving arrangement of the circles in which it is false. So
       name it — a counter-drawing is the whole method this chapter teaches, and
       "no" teaches none of it. */
    const o = options(right.text, wrongRaw.map(sm => {
      const counter = live.find(m => !sm.holds(m));
      const kills = live.filter(m => !sm.holds(m)).length;
      return {
        v: label(sm).text,
        why: `Not forced. Of the <b>${live.length}</b> arrangement${live.length > 1 ? 's' : ''} that
          satisfy both premises, <b>${kills}</b> make${kills > 1 ? '' : 's'} this one FALSE — so one
          drawing is enough to kill it.${counter ? ` The counter-case is the arrangement where
          ${describeModel(counter, names)}.` : ''}<br><br>
          A conclusion has to hold in every surviving arrangement, not merely in the one that comes
          to mind first.`,
      };
    }));

    return {
      q: 'Which conclusion definitely follows?',
      context: `<b>Statements:</b><br>${label(p1).text}.<br>${label(p2).text}.`,
      ...o,
      whyRight: `Correct. Of the ${live.length} arrangement${live.length > 1 ? 's' : ''} these two
                 statements allow, <b>${right.text.toLowerCase()}</b> is true in every one.`,
      whyWrong: `Draw the three circles every way the statements permit — there are
                 <b>${live.length}</b> such arrangements.<br><br>
                 A conclusion follows only when it survives <em>all</em> of them; one drawing
                 where it fails is enough to kill it. The one that survives here is
                 <b>${right.text.toLowerCase()}</b>.<br><br>
                 Remember what the premises hand you free: a subset read backwards always gives a
                 "some", and two negatives never build a positive.`,
      figure: vennFor(p1.kind, names[p1.x], names[p1.y]) +
              vennFor(p2.kind, names[p2.x], names[p2.y], { stroke: 'var(--reason)' }),
      figureCap: `The two premises drawn. Any conclusion has to survive <b>every</b> way
        these circles can be arranged — all ${live.length} of them.`,
      hardness: live.length,
    };
  },
};


/* ============================================================
   Widening pass · see the matching block in quants.js.

   Visual Reasoning could produce 72 distinct questions in total and
   Space & Direction 240 — small enough that a learner drilling either
   chapter twice is answering from memory, while the Leitner boxes
   happily record it as mastery. Foundations had a single generator.
   ============================================================ */

/* ---------------- Unit 7 · Visual Reasoning ---------------- */

/* A die's opposite faces always sum to 7 — that is the whole engine, and it is
   derived here rather than stored, so the question and its answer cannot part
   company. Two views are given; the face NOT seen in either is what is asked. */
export const diceOpposite = {
  id: 'vis-dice', chapter: 'reasoning:7',
  concept: 'dice-opposite', conceptLabel: 'Opposite faces of a die',
  make(R, tier = 2) {
    const top = R.int(1, 6);
    const opp = 7 - top;
    /* The four faces adjacent to `top` are everything except it and its opposite. */
    const adj = [1, 2, 3, 4, 5, 6].filter(f => f !== top && f !== opp);
    /* Fewer views is harder, and at the top tier the question is asked about a
       face that was never shown at all — which is what made exam and stretch
       identical on the first pass, and the harness said so. */
    const shown = R.some(adj, byTier(tier, 3, 2, 1));      // fewer views = harder
    const askOpp = R() < 0.5;
    const target = askOpp ? top : shown[0];
    const answer = 7 - target;

    const o = options(String(answer), [
      { v: String(target), why: `That is the face you were asked ABOUT, not the one opposite it.
        A face is never opposite itself.` },
      { v: String(7 - answer), why: `${7 - answer} and ${answer} are opposites of each other, so
        you have named the wrong end of the pair. Opposite of ${target} is 7 − ${target} = ${answer}.` },
      { v: String(shown[shown.length - 1] === answer ? (answer % 6) + 1 : shown[shown.length - 1]),
        why: `That face is ADJACENT to ${target} — it shares an edge with it. Adjacent is not
        opposite; on a standard die the two opposite numbers add to 7.` },
    ], i => ({ v: String(((answer + i) % 6) + 1),
               why: `On a standard die that face pairs with ${7 - (((answer + i) % 6) + 1)}, not
                     with ${target}. Every pair must total 7: 1–6, 2–5, 3–4.` }));

    return {
      q: `Which number is on the face <b>opposite ${target}</b>?`,
      context: `A standard die is rolled. Its top face shows <b>${top}</b>, and the side faces
        visible are ${shown.map(f => `<b>${f}</b>`).join(' and ')}.
        On a standard die, opposite faces always total <b>7</b>.`,
      ...o,
      whyRight: `Opposite faces sum to 7, so the face opposite ${target} is
        7 − ${target} = <b>${answer}</b>. The pairs are always 1–6, 2–5 and 3–4 —
        three pairs, nothing to memorise beyond the total.`,
      whyWrong: `Everything visible at once is <b>adjacent</b>, never opposite: you can never see
        two opposite faces of a die in the same view.<br><br>
        The pairs are 1–6, 2–5, 3–4. So opposite ${target} is 7 − ${target} = <b>${answer}</b>.<br><br>
        The faces named as visible (${[top, ...shown].join(', ')}) are all adjacent to one another,
        which is why none of them can be the answer for a face among them.`,
      figure: mapFig([
        { from: 'top', fromPos: 'face', to: String(top), toPos: `opp ${7 - top}` },
        ...shown.map(f => ({ from: 'side', fromPos: 'face', to: String(f), toPos: `opp ${7 - f}` })),
        { from: 'asked', fromPos: String(target), to: String(answer), toPos: `7 − ${target}` },
      ], { note: `Opposite pairs on any standard die: 1–6, 2–5, 3–4.` }),
      figureCap: `Two faces you can see together are adjacent — so they are never a pair.`,
      hardness: 12 - shown.length * 3 + (askOpp ? 0 : 2),
    };
  },
};

/**
 * Rectangles in an m × n grid, counted by ENUMERATION rather than by C(m+1,2)·C(n+1,2).
 *
 * The formula is right and the loop is unarguable, which matters here because
 * the whole lesson is "count by size class, never at random" — a generator that
 * trusted a remembered formula would be doing the thing it warns against.
 */
function countRectangles(cols, rows) {
  let n = 0;
  for (let x1 = 0; x1 <= cols; x1++) for (let x2 = x1 + 1; x2 <= cols; x2++)
    for (let y1 = 0; y1 <= rows; y1++) for (let y2 = y1 + 1; y2 <= rows; y2++) n++;
  return n;
}

function gridRectangles(R, tier) {
  const cols = R.int(byTier(tier, 1, 2, 3), byTier(tier, 4, 7, 9));
  const rows = R.int(byTier(tier, 1, 2, 3), byTier(tier, 4, 7, 9));
  const total = countRectangles(cols, rows);
  const squares = (() => {                       // for the distractor, also counted
    let n = 0;
    for (let k = 1; k <= Math.min(cols, rows); k++) n += (cols - k + 1) * (rows - k + 1);
    return n;
  })();
  const o = options(String(total), [
    { v: String(cols * rows), why: `That counts only the SMALLEST cells — the ${cols * rows}
      single squares of the grid. Any block of adjacent cells is also a rectangle, and there are
      ${total - cols * rows} of those.` },
    { v: String(squares), why: `That is the number of SQUARES (${squares}). Every square is a
      rectangle, but most rectangles are not square — the question asks for all of them.` },
    { v: String((cols + 1) * (rows + 1)), why: `That is the number of grid POINTS
      (${cols + 1} × ${rows + 1}), not rectangles. A rectangle needs two of the ${cols + 1} vertical
      lines and two of the ${rows + 1} horizontal ones.` },
  ], i => ({ v: String(total + i + 1),
             why: `${cols + 1}C2 × ${rows + 1}C2 = ${cols * (cols + 1) / 2} ×
                   ${rows * (rows + 1) / 2} = ${total} exactly.` }));
  return {
    q: `How many rectangles are there in the figure altogether?`,
    context: `A rectangle is divided by straight lines into a grid of
      <b>${cols} columns × ${rows} rows</b> of small cells.`,
    ...o,
    whyRight: `Choose any 2 of the ${cols + 1} vertical lines and any 2 of the ${rows + 1}
      horizontal lines, and those four fix exactly one rectangle.<br><br>
      ${cols + 1}C2 × ${rows + 1}C2 = ${cols * (cols + 1) / 2} × ${rows * (rows + 1) / 2} =
      <b>${total}</b>. Of these, ${squares} happen to be squares.`,
    whyWrong: `Counting at random finds the small ones and misses the wide ones. Count by
      CHOICE instead: a rectangle is fixed the moment you pick its two vertical edges and its
      two horizontal edges.<br><br>
      ${cols + 1} vertical lines → ${cols * (cols + 1) / 2} pairs.
      ${rows + 1} horizontal lines → ${rows * (rows + 1) / 2} pairs.<br><br>
      ${cols * (cols + 1) / 2} × ${rows * (rows + 1) / 2} = <b>${total}</b>.`,
    figure: barsFig([
      { label: 'single cells', value: cols * rows, text: String(cols * rows), on: false },
      { label: 'squares of any size', value: squares, text: String(squares), on: false },
      { label: 'all rectangles', value: total, text: String(total), on: true },
    ], { w: 420 }),
    figureCap: `Every larger block counts too — which is why the honest total dwarfs the ${cols * rows} cells.`,
    hardness: cols * rows * 2 + total / 10,
  };
}

/* Points on a line, every pair joined: C(n,2) segments. A fan of cevians from
   one apex gives the same count, which is why one formula answers both. */
export const fanCount = {
  id: 'vis-fan', chapter: 'reasoning:7',
  concept: 'fan-formula', conceptLabel: 'The triangle-fan formula',
  make(R, tier = 2) {
    /* Two forms of one idea: choose two lines from each direction and a shape is
       fixed. The fan picks two of the base points; the grid picks two horizontal
       lines and two vertical ones. Counting by size class is the same skill, and
       carrying both multiplies the pool this chapter can offer. */
    if (R() < byTier(tier, 0.45, 0.5, 0.5)) return gridRectangles(R, tier);
    const inner = R.int(byTier(tier, 1, 2, 4), byTier(tier, 5, 11, 20));  // lines from the apex
    const parts = inner + 1;                                             // base segments
    const total = parts * (parts + 1) / 2;                               // C(parts+1, 2)

    const o = options(String(total), [
      { v: String(parts), why: `That counts only the SMALLEST triangles — the ${parts} sitting
        side by side along the base. Triangles made of two or more of them adjacent are triangles
        too, and there are ${total - parts} of those.` },
      { v: String(inner), why: `That is the number of lines drawn from the apex, not the number of
        triangles they create. ${inner} lines cut the base into ${parts} parts.` },
      { v: String(parts * parts), why: `You squared the parts. The count is ${parts}(${parts}+1)/2 —
        every PAIR of base points, which is ${parts + 1}C2 = ${total}.` },
    ], i => ({ v: String(total + i + 1),
               why: `${parts}(${parts} + 1)/2 = ${total} — every pair of the ${parts + 1} base
                     points fixes one triangle, and nothing else does.` }));

    return {
      q: `How many triangles are there in the figure altogether?`,
      context: `A triangle has <b>${inner}</b> straight line${inner > 1 ? 's' : ''} drawn from its
        apex to the base, cutting the base into <b>${parts}</b> parts.`,
      ...o,
      whyRight: `Every triangle in a fan is fixed by choosing TWO of the ${parts + 1} points along
        the base — the apex joins to both. So the count is
        ${parts + 1}C2 = ${parts} × ${parts + 1} ÷ 2 = <b>${total}</b>.<br><br>
        By size: ${parts} of one part, ${parts - 1} of two, and so on down to 1 of ${parts} parts —
        which sums to the same ${total}.`,
      whyWrong: `Count by SIZE CLASS, never at random — random counting is how the small ones get
        found and the big ones get missed.<br><br>
        ${Array.from({ length: Math.min(parts, 5) }, (_, i) =>
          `${parts - i} triangle${parts - i > 1 ? 's' : ''} spanning ${i + 1} part${i ? 's' : ''}`).join(' · ')}${parts > 5 ? ' · …' : ''}<br><br>
        Total = ${parts} + ${parts - 1} + … + 1 = ${parts}(${parts} + 1)/2 = <b>${total}</b>.`,
      figure: barsFig(Array.from({ length: Math.min(parts, 6) }, (_, i) => ({
        label: `${i + 1} part${i ? 's' : ''} wide`, value: parts - i, text: String(parts - i), on: i === 0,
      })), { w: 400 }),
      figureCap: `One bar per size class. Their total is ${total} — counting at random misses the wide ones.`,
      hardness: inner * 8 + parts,
    };
  },
};

/* ---------------- Unit 3 · Space & Direction ---------------- */

const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17],
                 [12, 16, 20], [7, 24, 25], [10, 24, 26], [20, 21, 29], [15, 20, 25],
                 [18, 24, 30], [16, 30, 34], [9, 40, 41], [12, 35, 37]];

export const dirTriple = {
  id: 'dir-triple', chapter: 'reasoning:3',
  concept: 'triples', conceptLabel: 'Recognising Pythagorean triples',
  make(R, tier = 2) {
    const [a, b, c] = R.pick(byTier(tier,
      TRIPLES.filter(t => t[2] <= 15), TRIPLES.filter(t => t[2] <= 30), TRIPLES.filter(t => t[2] > 20)));
    const first = R.pick(['North', 'South', 'East', 'West']);
    const turn = R.pick(['left', 'right']);
    const swap = R() < 0.5;
    const [d1, d2] = swap ? [b, a] : [a, b];

    const o = options(`${c} m`, [
      { v: `${d1 + d2} m`, why: `You added the two legs. That is the distance he WALKED
        (${d1} + ${d2} = ${d1 + d2} m); the question asks how far he ends up from the start, which
        is the straight line across the corner.` },
      { v: `${Math.abs(d1 - d2)} m`, why: `Subtracting the legs would be right if he had walked
        back along the same line. He turned ${turn}, so the two legs are at a RIGHT ANGLE and the
        answer is the hypotenuse.` },
      { v: `${r2v(Math.sqrt(d1 * d1 + d2 * d2) + 1)} m`, why: `Close, but the numbers here form an
        exact triple: ${d1}² + ${d2}² = ${d1 * d1} + ${d2 * d2} = ${c * c} = ${c}². Exam setters
        choose triples precisely so the root is whole — a non-whole answer is a signal to re-check.` },
    ], i => `${c + i + 2} m`);

    return {
      q: `How far is he from his starting point?`,
      context: `A man walks <b>${d1} m</b> towards the <b>${first}</b>, turns <b>${turn}</b>,
        and walks a further <b>${d2} m</b>.`,
      ...o,
      whyRight: `A single turn makes a right angle, so the two legs and the straight-line distance
        form a right triangle: √(${d1}² + ${d2}²) = √${d1 * d1 + d2 * d2} = <b>${c} m</b>.<br><br>
        ${d1}-${d2}-${c} is a Pythagorean triple. Learn 3-4-5, 5-12-13, 8-15-17 and 7-24-25 with
        their multiples and most of these become instant.`,
      whyWrong: `Distance walked and distance FROM THE START are different questions. He walked
        ${d1 + d2} m; he finished ${c} m away.<br><br>
        One turn = one right angle, so use Pythagoras: ${d1}² + ${d2}² = ${d1 * d1} + ${d2 * d2}
        = ${c * c}, and √${c * c} = <b>${c} m</b>.<br><br>
        Spot the triple and you never compute the root: this one is ${a}-${b}-${c}.`,
      figure: mapFig([
        { from: 'leg 1', fromPos: first, to: `${d1} m`, toPos: `${d1}² = ${d1 * d1}` },
        { from: 'leg 2', fromPos: `turn ${turn}`, to: `${d2} m`, toPos: `${d2}² = ${d2 * d2}` },
        { from: 'straight', fromPos: 'line', to: `${c} m`, toPos: `√${d1 * d1 + d2 * d2}` },
      ], { note: `${d1}² + ${d2}² = ${c}² — an exact triple, so the root is whole.` }),
      figureCap: `The two legs and the direct line always close into a right triangle.`,
      hardness: c,
    };
  },
};

const r2v = x => Math.round(x * 100) / 100;

export const dirQuadrant = {
  id: 'dir-quadrant', chapter: 'reasoning:3',
  concept: 'quadrant-direction', conceptLabel: 'Naming the quadrant',
  make(R, tier = 2) {
    /* Legs are built, then the finishing position is derived by the WIDGET's own
       tracer — so the generator cannot claim a direction the map would not draw. */
    const n = byTier(tier, 2, 3, R.int(4, 5));
    const dirs = ['N', 'S', 'E', 'W'];
    let legs, end;
    for (let attempt = 0; attempt < 40; attempt++) {
      /* `trace` is the walk-map widget's own tracer and it keys legs by `d`.
         Using it rather than adding up here means the generator cannot claim a
         finishing point the map would not draw. */
      legs = Array.from({ length: n }, () => ({
        dir: R.pick(dirs), d: R.int(byTier(tier, 2, 3, 4), byTier(tier, 8, 14, 22)),
      }));
      const [ex, ey] = trace(legs).pop();
      end = { dx: ex, dy: ey };
      if (end.dx !== 0 && end.dy !== 0) break;      // a pure N/S/E/W answer is a different question
    }
    if (end.dx === 0 || end.dy === 0) return this.make(R, tier);
    const dir = compassDir(end.dx, end.dy);
    const opposite = { 'North-East': 'South-West', 'South-West': 'North-East',
                       'North-West': 'South-East', 'South-East': 'North-West' }[dir] || dir;
    const flipEW = dir.replace('East', 'W#').replace('West', 'East').replace('W#', 'West');

    const o = options(dir, [
      { v: opposite, why: `That is the exact opposite — the direction of the START as seen from
        where he finished. The question asks where he is relative to the start, so the arrow points
        the other way.` },
      { v: flipEW, why: `East and West are swapped. He is ${Math.abs(end.dx)} m
        ${end.dx > 0 ? 'EAST' : 'WEST'} of where he began — count the east legs against the west
        legs before naming the quadrant.` },
      { v: Math.abs(end.dx) >= Math.abs(end.dy) ? (end.dx > 0 ? 'East' : 'West')
                                                : (end.dy > 0 ? 'North' : 'South'),
        why: `That names only the LARGER of the two offsets and drops the other. He is off the
        start line in both directions (${Math.abs(end.dx)} m ${end.dx > 0 ? 'east' : 'west'} and
        ${Math.abs(end.dy)} m ${end.dy > 0 ? 'north' : 'south'}), so the answer is a quadrant.` },
    ], i => ['North-East', 'South-East', 'South-West', 'North-West'][i % 4]);

    const full = { N: 'North', S: 'South', E: 'East', W: 'West' };
    return {
      q: `In which direction is he now, relative to his starting point?`,
      context: `Starting from a point, a man walks
        ${legs.map(l => `<b>${l.d} m ${full[l.dir]}</b>`).join(', then ')}.`,
      ...o,
      whyRight: `Add the legs along each axis separately.<br><br>
        East–West: ${end.dx > 0 ? `${end.dx} m east` : `${-end.dx} m west`}.
        North–South: ${end.dy > 0 ? `${end.dy} m north` : `${-end.dy} m south`}.<br><br>
        Both are non-zero, so he is in the <b>${dir}</b> quadrant.`,
      whyWrong: `Never chase the walk in your head — tally the two axes.<br><br>
        ${end.dx > 0 ? `${end.dx} m EAST` : `${-end.dx} m WEST`} and
        ${end.dy > 0 ? `${end.dy} m NORTH` : `${-end.dy} m SOUTH`} of the start.<br><br>
        Two non-zero offsets name a quadrant, not a single direction: <b>${dir}</b>.
        Exams want the quadrant, never the exact bearing.`,
      figure: mapFig([
        ...legs.map((l, i) => ({ from: `leg ${i + 1}`, fromPos: full[l.dir], to: `${l.d} m`, toPos: '' })),
        { from: 'net E–W', fromPos: '', to: end.dx > 0 ? `${end.dx} E` : `${-end.dx} W`, toPos: '' },
        { from: 'net N–S', fromPos: '', to: end.dy > 0 ? `${end.dy} N` : `${-end.dy} S`, toPos: '' },
      ], { note: `Both offsets non-zero → a quadrant: ${dir}.` }),
      figureCap: `Only the two totals matter — the order of the legs never changes where he ends up.`,
      hardness: n * 9 + (Math.abs(end.dx) + Math.abs(end.dy)) / 6,
    };
  },
};

/* ---------------- Unit 1 · Foundations ---------------- */

const QTY = [
  { said: 'many', claimed: 'all', why: 'many is not all' },
  { said: 'some', claimed: 'most', why: 'some could be two' },
  { said: 'often', claimed: 'always', why: 'often admits exceptions' },
  { said: 'several', claimed: 'the majority', why: 'several says nothing about a majority' },
  { said: 'a number of', claimed: 'every', why: 'a number of is not every' },
  { said: 'a few', claimed: 'nearly all', why: 'a few is the smallest quantity word there is' },
  { said: 'most', claimed: 'all', why: 'most leaves a remainder, and all does not' },
  { said: 'usually', claimed: 'without exception', why: 'usually is precisely not without exception' },
  { said: 'a majority of', claimed: 'almost every one of', why: 'a majority can be fifty-one in a hundred' },
  { said: 'sometimes', claimed: 'regularly', why: 'sometimes carries no frequency at all' },
  { said: 'reportedly', claimed: 'certainly', why: 'a report is not a confirmation' },
];
const QTY_SUBJECTS = [
  { grp: 'students in the district', act: 'walk to school' },
  { grp: 'farmers in the block', act: 'have taken the new seed' },
  { grp: 'households in the town', act: 'now have piped water' },
  { grp: 'buses on the route', act: 'run on time' },
  { grp: 'shops in the market', act: 'accept digital payment' },
  { grp: 'villages in the tehsil', act: 'are connected by a metalled road' },
  { grp: 'candidates who applied', act: 'cleared the written test' },
  { grp: 'wells in the panchayat', act: 'held water through the summer' },
  { grp: 'schools in the block', act: 'have a working library' },
  { grp: 'traders at the mandi', act: 'weigh electronically' },
  { grp: 'patients at the centre', act: 'were seen the same day' },
  { grp: 'tourists to the fort', act: 'arrive between October and March' },
];

export const foundQuantity = {
  id: 'found-quantity', chapter: 'reasoning:1',
  concept: 'trap-quantity', conceptLabel: 'Quantity words nobody said',
  make(R, tier = 2) {
    const q = R.pick(QTY);
    const s = R.pick(QTY_SUBJECTS);
    const other = R.pick(QTY_SUBJECTS.filter(x => x.grp !== s.grp));
    /* Gentle offers one inflated conclusion among plainly safe ones; stretch
       hides it among conclusions that are merely narrower restatements. */
    const safe = byTier(tier,
      [`At least one of the ${s.grp} ${s.act}.`],
      [`At least one of the ${s.grp} ${s.act}.`,
       `Not every one of the ${s.grp} necessarily ${s.act.replace(/^have /, 'has ')}.`],
      [`At least one of the ${s.grp} ${s.act}.`,
       `The statement gives no figure for the ${other.grp}.`,
       `Fewer than all of the ${s.grp} may ${s.act.replace(/^have /, 'have ')}.`]);

    const bad = `<b>${q.claimed.charAt(0).toUpperCase() + q.claimed.slice(1)}</b> of the ${s.grp} ${s.act}.`;
    const o = options(bad, safe.map(v => ({
      v, why: `This one is safe — it stays inside what "${q.said}" licenses. The question asks
        which conclusion goes BEYOND the statement, and this does not.` })),
      i => [{ v: `Some of the ${s.grp} ${s.act}.`,
              why: `"Some" is weaker than "${q.said}", so it is already covered by the statement.
                    A conclusion that says LESS than the evidence always follows.` },
            { v: `The number who ${s.act} is not stated exactly.`,
              why: `True, and safe — noticing that a figure is missing is not the same as
                    inventing one. The trap option supplies a quantity instead.` },
            { v: `The statement mentions the ${s.grp}.`,
              why: `That is just a restatement, so it cannot go beyond anything.` }][i % 3]);

    return {
      q: `Which conclusion goes <b>beyond</b> what the statement says?`,
      context: `<b>Statement:</b> "<i>${q.said.charAt(0).toUpperCase() + q.said.slice(1)} of the
        ${s.grp} ${s.act}.</i>"`,
      ...o,
      whyRight: `The statement says <b>${q.said}</b>. It does not say <b>${q.claimed}</b>, and
        ${q.why} — so that conclusion adds a quantity nobody stated.<br><br>
        This is the single most common trap in Statement & Conclusion: the conclusion is plausible,
        it is probably even true in the real world, and it still does not FOLLOW.`,
      whyWrong: `Read the quantity word, then guard it.<br><br>
        The statement offers "<b>${q.said}</b>". Anything stronger — ${q.claimed}, every, all,
        always, the majority — is an upgrade the statement never authorised, because ${q.why}.<br><br>
        The other options stay at or below "${q.said}", which is why they are safe.
        The answer is: <b>${q.claimed} of the ${s.grp} ${s.act}</b>.`,
      figure: mapFig([
        { from: 'stated', fromPos: 'evidence', to: q.said, toPos: '' },
        { from: 'concluded', fromPos: 'claim', to: q.claimed, toPos: '' },
      ], { note: `${q.why.charAt(0).toUpperCase() + q.why.slice(1)} — a conclusion may never be stronger than its evidence.` }),
      figureCap: `Only what the statement licenses may be concluded — the world outside it is not evidence.`,
      hardness: 10 + safe.length * 6,
    };
  },
};

/* Put a surviving arrangement into words, so a counter-case can be NAMED rather
   than merely counted. The model's own overlap flags are the source — nothing
   here decides what is true, it only reads what the enumerator already found. */
function describeModel(m, names) {
  const pair = (x, y) => {
    const k = `${x}${y}`, k2 = `${y}${x}`;
    const v = m[k] !== undefined ? m[k] : m[k2];
    return v === undefined ? null
      : v ? `some ${names[x]} are ${names[y]}` : `no ${names[x]} are ${names[y]}`;
  };
  const parts = [pair('A', 'B'), pair('B', 'C'), pair('A', 'C')].filter(Boolean);
  return parts.length ? parts.join(', ') : 'the circles sit apart';
}

/* The same 27-identity, asked the other two ways. Kept beside the generator
   that dispatches to them rather than inlined, so each stays readable. */
function positionFromA(R, c, fromA, fromZ) {
  const o = options(String(fromA), [
    { v: String(27 - fromZ + 1), why: `You worked from 26 rather than 27. A letter counted from
      both ends is counted twice, so the two positions sum to <b>27</b>: 27 − ${fromZ} = ${fromA}.` },
    { v: String(fromZ), why: `That is the position you were GIVEN (from Z), handed back. The two
      positions are equal only for the middle of the alphabet.` },
    { v: String(fromA + 1), why: `One over. 27 − ${fromZ} = ${fromA}.` },
  ], i => ({ v: String(fromA + i + 2),
             why: `Position from A = 27 − position from Z = 27 − ${fromZ} = ${fromA}.` }));
  return {
    q: `What is its position counted from <b>A</b>?`,
    context: `A letter is the <b>${ord(fromZ)}</b> letter counting from the <b>end</b> of the alphabet.`,
    ...o,
    whyRight: `27 − ${fromZ} = <b>${fromA}</b>, which is the letter <b>${c}</b>.
      The identity runs both ways — whichever end you are given, subtract from 27.`,
    whyWrong: `The two positions of any letter add to <b>27</b>, not 26, because the letter itself
      is counted from both ends.<br><br>
      27 − ${fromZ} = <b>${fromA}</b> — the letter is ${c}.`,
    figure: lineFig(26, [{ at: fromA, label: c, note: `${fromA} from A` },
                         { at: fromZ, label: chr(fromZ), note: `${fromZ} from A` }],
      { w: 480, caption: `${fromA} + ${fromZ} = 27` }),
    figureCap: `Whichever end you are given, the other is 27 minus it.`,
    hardness: 12 - Math.abs(13.5 - fromA) + 3,
  };
}

function positionPartner(R, c, fromA, fromZ) {
  const mate = chr(fromZ);
  const o = options(mate, [
    { v: chr(Math.min(26, Math.max(1, 26 - fromA))), why: `That is the letter at position
      26 − ${fromA}. The pairing runs on <b>27</b>, not 26 — using 26 shifts every partner by one.` },
    { v: c, why: `That is the letter you started with. A letter is its own partner only if it sat
      at position 13.5, which no letter does.` },
    { v: chr(Math.min(26, fromZ + 1)), why: `One place past the partner. 27 − ${fromA} = ${fromZ},
      which is <b>${mate}</b>.` },
  ], i => ({ v: chr(((fromZ + i + 1) % 26) + 1),
             why: `${c} is ${fromA} from A, so its partner is 27 − ${fromA} = ${fromZ} from A: ${mate}.` }));
  return {
    q: `Which letter occupies the same position counted from the <b>other end</b>?`,
    context: `Take the letter <b>${c}</b>, the ${ord(fromA)} letter of the alphabet.`,
    ...o,
    whyRight: `${c} is ${fromA} from A, so its partner sits ${fromA} from Z — that is position
      27 − ${fromA} = ${fromZ} from A, the letter <b>${mate}</b>.<br><br>
      A–Z, B–Y, C–X: every pair adds to 27.`,
    whyWrong: `Pair the alphabet from both ends: A–Z, B–Y, C–X, and so on. Each pair's positions
      add to <b>27</b>.<br><br>
      ${c} is at ${fromA}, so its partner is at 27 − ${fromA} = ${fromZ}: <b>${mate}</b>.`,
    figure: lineFig(26, [{ at: fromA, label: c, note: `${fromA} from A` },
                         { at: fromZ, label: mate, note: `${fromA} from Z` }],
      { w: 480, caption: `${fromA} + ${fromZ} = 27` }),
    figureCap: `The two letters sit the same distance from opposite ends.`,
    hardness: 12 - Math.abs(13.5 - fromA) + 5,
  };
}

/* ---------------- Unit 5 · Codes & Patterns — number series ---------------- */

/* Chapter 5 teaches series in two lessons and could not generate a single one:
   `code-apply` does ciphers and `code-position` does alphabet positions, so a
   learner drilling this chapter never met the half of it the paper asks most.

   Every rule below BUILDS its series term by term, and the answer is simply the
   next term the same rule produces — nothing is asserted, so the printed series
   and its answer cannot disagree. The harness re-derives the answer by
   extending the PRINTED terms with its own arithmetic rather than by trusting
   the rule that made them.

   Each rule also names the concept it actually trains. The generator declares
   `second-differences` because that is the method the whole ladder teaches —
   differences, then differences again, then ratios — but a multiplicative draw
   records against `ratios-first` and an interleaved one against
   `alternate-terms`, so the Leitner boxes learn the right thing from each. */
const SERIES_RULES = [
  {
    id: 'add', label: 'a constant difference', concept: 'second-differences',
    conceptLabel: 'Taking differences twice', base: 6,
    build: (R, tier) => {
      const d = R.int(byTier(tier, 2, 3, 7), byTier(tier, 9, 14, 23));
      const a = R.int(byTier(tier, 2, 5, 11), byTier(tier, 12, 40, 90));
      return { term: k => a + d * k, blurb: `add ${d} each time` };
    },
  },
  {
    id: 'mul', label: 'a constant ratio', concept: 'ratios-first',
    conceptLabel: 'Switching from differences to ratios', base: 13,
    build: (R, tier) => {
      const r = R.pick(byTier(tier, [2, 3], [2, 3, 4], [3, 4, 5]));
      const a = R.int(byTier(tier, 1, 2, 3), byTier(tier, 6, 9, 14));
      return { term: k => a * r ** k, blurb: `multiply by ${r} each time` };
    },
  },
  {
    id: 'grow', label: 'a difference that itself grows', concept: 'second-differences',
    conceptLabel: 'Taking differences twice', base: 22,
    build: (R, tier) => {
      const d0 = R.int(byTier(tier, 1, 2, 4), byTier(tier, 5, 9, 15));
      const step = R.int(byTier(tier, 1, 2, 3), byTier(tier, 3, 6, 11));
      const a = R.int(byTier(tier, 1, 3, 6), byTier(tier, 9, 25, 60));
      /* Gaps run d0, d0+step, d0+2·step … so the SECOND differences are
         constant — which is the whole point of "take the differences twice",
         and why this is built from a step rather than from a formula. */
      return { term: k => a + k * d0 + step * (k * (k - 1) / 2),
               blurb: `the gaps themselves go up by ${step} each time` };
    },
  },
  {
    id: 'square', label: 'squares, shifted', concept: 'second-differences',
    conceptLabel: 'Taking differences twice', base: 28,
    build: (R, tier) => {
      const start = R.int(byTier(tier, 2, 3, 5), byTier(tier, 5, 8, 12));
      const off = R.int(byTier(tier, -2, -4, -9), byTier(tier, 2, 5, 11));
      return { term: k => (start + k) ** 2 + off,
               blurb: off === 0 ? 'consecutive squares'
                 : `consecutive squares, each ${off > 0 ? 'plus' : 'minus'} ${Math.abs(off)}` };
    },
  },
  {
    id: 'alt', label: 'two series interleaved', concept: 'alternate-terms',
    conceptLabel: 'Reading alternate terms as two series', base: 36,
    build: (R, tier) => {
      const a1 = R.int(2, byTier(tier, 8, 15, 26));
      const d1 = R.int(byTier(tier, 2, 3, 6), byTier(tier, 7, 12, 19));
      const a2 = R.int(3, byTier(tier, 9, 18, 30));
      const d2 = R.int(byTier(tier, 2, 4, 7), byTier(tier, 8, 13, 21));
      /* Odd positions are one series, even positions another. Read as a single
         series it has no rule at all, which is exactly the trap. */
      return { term: k => (k % 2 === 0 ? a1 + d1 * (k / 2) : a2 + d2 * ((k - 1) / 2)),
               blurb: `alternate terms form two separate series, one going up by ${d1} `
                    + `and the other by ${d2}`,
               pair: [d1, d2] };
    },
  },
];

export const numberSeries = {
  id: 'code-series', chapter: 'reasoning:5',
  concept: 'second-differences', conceptLabel: 'Taking differences twice',
  make(R, tier = 2, want = null) {
    /* Tier decides which rules are in play — but a caller asking for ONE
       concept overrides that, because a re-teach for `alternate-terms` must
       deal interleaved series even at the gentle tier, where they would not
       otherwise appear at all. Difficulty is still varied inside the rule. */
    const byTierPool = byTier(tier,
      SERIES_RULES.filter(x => ['add', 'mul'].includes(x.id)),
      SERIES_RULES.filter(x => x.id !== 'alt'),
      SERIES_RULES.filter(x => ['grow', 'square', 'alt', 'mul'].includes(x.id)));
    const wanted = want ? SERIES_RULES.filter(x => x.concept === want) : [];
    const pool = wanted.length ? wanted : byTierPool;
    const rule = R.pick(pool);
    const built = rule.build(R, tier);
    const len = byTier(tier, 5, 5, 6);
    const shown = Array.from({ length: len }, (_, k) => built.term(k));
    const answer = built.term(len);

    /* A series with a repeat, a non-integer, a negative or an absurd magnitude
       is not a question — redraw rather than ship one. `deal` skips a generator
       that throws, so returning a bad draw would be worse than recursing. */
    const all = [...shown, answer];
    if (all.some(v => !Number.isInteger(v) || v <= 0 || v > 5e6)
        || new Set(all).size !== all.length) {
      return this.make(R, tier, want);
    }

    const gaps = shown.slice(1).map((v, k) => v - shown[k]);
    const lastGap = answer - shown[len - 1];
    const repeatGap = gaps[gaps.length - 1];
    const tail = shown[len - 1];

    /* Three distractors, each a mistake with a name. Built rule-aware so the
       plausible wrong answer is the one this particular series invites: for a
       ratio you are tempted to add, for a growing gap you are tempted to repeat
       the last one, and for interleaved terms you are tempted to read straight
       across. */
    const addNext = tail + repeatGap;
    const ratio = shown[1] / shown[0];
    const mulNext = Number.isInteger(tail * ratio) ? tail * ratio : tail * 2;

    const cand = [];
    if (rule.id === 'mul') {
      cand.push({ v: addNext, why: `You continued the DIFFERENCE. The gaps here are
        ${gaps.join(', ')} — they are growing, not constant, which is the signal to stop taking
        differences and start taking ratios: ${shown.slice(0, 3).map((v, k) => k ? `${v}÷${shown[k - 1]}=${v / shown[k - 1]}` : '').filter(Boolean).join(', ')}.` });
    } else if (rule.id === 'alt') {
      cand.push({ v: addNext, why: `You read it as ONE series and repeated the last gap. Read the
        alternate terms separately instead: ${shown.filter((_, k) => k % 2 === 0).join(', ')} is one
        series and ${shown.filter((_, k) => k % 2 === 1).join(', ')} is another, and the next term
        continues whichever one it belongs to.` });
    } else {
      cand.push({ v: addNext, why: `You repeated the LAST gap (${repeatGap}) rather than
        continuing the pattern the gaps themselves make. The gaps run ${gaps.join(', ')} — not
        constant, so the next one is ${lastGap}, not ${repeatGap}.` });
    }

    cand.push({ v: mulNext, why: rule.id === 'mul'
      ? `Right idea, wrong ratio. Each term is ${built.blurb.replace('multiply by ', '')} times the
         one before it, and ${tail} × ${ratio} = ${answer}.`
      : `That treats the series as multiplicative. Test a rule against EVERY neighbouring pair
         before using it on the last one — ${shown.slice(0, 3).join(' → ')} is not a constant
         ratio.` });

    const nudge = Math.max(1, Math.abs(lastGap) > 4 ? 2 : 1);
    cand.push({ v: answer + nudge, why: `Close. The rule is ${built.blurb}, which puts the next
      term at exactly ${answer}.` });
    cand.push({ v: answer - nudge, why: `Just short. Continue the rule properly — ${built.blurb} —
      and the next term is ${answer}.` });

    /* Only usable distractors: positive, whole, and not the answer or a term
       already printed. `options` needs three good ones. */
    const seen = new Set(all);
    const usable = cand.filter(c => Number.isInteger(c.v) && c.v > 0 && !seen.has(c.v)
      && (seen.add(c.v), true));
    if (usable.length < 3) return this.make(R, tier, want);

    const o = options(String(answer), usable.map(c => ({ v: String(c.v), why: c.why })),
      i => {
        const v = answer + (i + 2) * Math.max(2, Math.abs(lastGap));
        return { v: String(v), why: `The rule is ${built.blurb}, so the next term is ${answer}.` };
      });

    /* The ladder, written out for this series — the same order the lesson
       teaches it in, with each rung's actual numbers rather than its name. */
    const secondDiffs = gaps.slice(1).map((g, k) => g - gaps[k]);
    const oddTerms = shown.filter((_, k) => k % 2 === 0);
    const evenTerms = shown.filter((_, k) => k % 2 === 1);
    const ratios = shown.slice(1).map((v, k) => {
      const r = v / shown[k];
      return Number.isInteger(r) ? String(r) : r.toFixed(2);
    });

    return {
      q: `What comes next in the series?`,
      context: `<b>${shown.join(',&nbsp; ')},&nbsp; ?</b>`,
      /* The draw's own concept, not the generator's — a ratio question should
         move the ratio box, not the differences one. All three are taught by
         this chapter; the harness checks that. */
      concept: rule.concept, conceptLabel: rule.conceptLabel,
      ...o,
      /* The evidence shown is the evidence that MATTERS for this rule. Printing
         "Gaps: 3, 6, 12, 24" under a doubling series is true and beside the
         point, and under an interleaved one the gaps alternate sign and mean
         nothing at all — a worked answer that shows the wrong working teaches
         the wrong habit. */
      whyRight: `The rule is <b>${rule.label}</b> — ${built.blurb}. Continuing it from
        ${tail} gives <b>${answer}</b>.<br><br>${
        rule.id === 'mul'
          ? `Ratios: ${ratios.join(', ')} — constant, which is what says multiply rather than add.`
          : rule.id === 'alt'
            /* The answer sits at index `len`, so it continues the FIRST row when
               that index is even and the second when it is odd. Written out
               once, here, rather than inferred twice in the sentence. */
            ? (() => {
                const toFirst = len % 2 === 0;
                const first = `1st, 3rd, 5th… : ${oddTerms.join(', ')}${toFirst ? ` → <b>${answer}</b>` : ''}`;
                const second = `2nd, 4th, 6th… : ${evenTerms.join(', ')}${toFirst ? '' : ` → <b>${answer}</b>`}`;
                return `${first}<br>${second}<br><br>
                  The ${len + 1}th term continues the ${toFirst ? 'first' : 'second'} of them,
                  going up by ${toFirst ? built.pair[0] : built.pair[1]}.`;
              })()
            : `Gaps: ${gaps.join(', ')} → the next gap is ${lastGap}.`}`,
      whyWrong: `Work down the ladder in order and stop at the first rung that fits
        <em>every</em> pair — not the first that fits one.<br><br>
        <b>1 · Differences.</b> ${gaps.join(', ')}${new Set(gaps).size === 1
          ? ' — constant, so that is the rule.' : ' — not constant, so keep going.'}<br>
        <b>2 · Differences again.</b> ${secondDiffs.join(', ') || '—'}${
          secondDiffs.length && new Set(secondDiffs).size === 1
            ? ' — constant, so the gaps grow evenly.' : ''}<br>
        <b>3 · Ratios.</b> ${ratios.join(', ')}${new Set(ratios).size === 1
          ? ' — constant, so it multiplies.' : ''}<br>
        <b>4 · Squares, cubes, alternate terms.</b>${rule.id === 'alt'
          ? ' — this one. Odd and even positions are two separate series.' : ''}<br><br>
        Here the rule is <b>${built.blurb}</b>, so the next term is <b>${answer}</b>.`,
      /* The terms with each step drawn between them, and the gaps as bars
         underneath. A row of numbers hides the very thing being looked for:
         the pattern is in the SPACES, and for a growing series the bars show
         it climbing at a glance. */
      figure: rule.id === 'alt'
        /* Two rows, not one — because that is the whole answer. Bars of the
           gaps would be actively misleading here: they alternate sign, and
           drawing their absolute values would show a pattern that is not
           there. */
        ? mapFig(shown.map((v, k) => ({
            from: k % 2 === 0 ? String(v) : '·', fromPos: k % 2 === 0 ? 'first' : '',
            to: k % 2 === 1 ? String(v) : '·', toPos: k % 2 === 1 ? 'second' : '',
          })).concat([{ from: len % 2 === 0 ? String(answer) : '?', fromPos: 'next',
                        to: len % 2 === 1 ? String(answer) : '?', toPos: '' }]),
            { note: `Read down each row on its own: +${built.pair[0]} and +${built.pair[1]}.` })
        : mapFig(shown.slice(1).map((v, k) => ({
            from: String(shown[k]), fromPos: k === 0 ? 'start' : '',
            to: String(v), toPos: `${gaps[k] >= 0 ? '+' : ''}${gaps[k]}`,
          })).concat([{ from: String(tail), fromPos: '', to: String(answer),
                        toPos: `${lastGap >= 0 ? '+' : ''}${lastGap}` }]),
            { note: `${rule.label} — ${built.blurb}.` })
          + barsFig(gaps.concat([lastGap]).map((g, k) => ({
              label: k === gaps.length ? 'next gap' : `gap ${k + 1}`,
              value: Math.abs(g), text: String(g), on: k === gaps.length,
            })), { w: 420 }),
      figureCap: rule.id === 'alt'
        ? `Two series taking turns. Read straight across and there is no rule to find.`
        : `The pattern lives in the gaps, not in the terms — the last bar is the one you
           were solving for.`,
      hardness: rule.base + len + Math.min(20, Math.log10(Math.max(2, answer)) * 4),
    };
  },
};

/* ---------------- Unit 5 · Codes & Patterns — letter series ---------------- */

/* The number series has a twin the paper asks just as often, and it is harder
   for one specific reason: letters have to be CONVERTED before the pattern is
   visible at all. B, E, H, K is nothing until it is 2, 5, 8, 11 — and that
   single step is the concept `r.code.series-let` teaches.

   So every rule here works in POSITIONS, using the cipher wheel's own `pos`
   and `chr`, and the explanation always shows the conversion. Nothing wraps
   past Z: a series that runs off the end of the alphabet and reappears at A is
   legitimate on paper and, in a four-option question, indistinguishable from
   an arithmetic slip. */
const LETTER_RULES = [
  {
    id: 'step', label: 'a constant step through the alphabet',
    concept: 'letter-positions', conceptLabel: 'Converting letters to positions', base: 8,
    build: (R, tier) => {
      const d = R.int(byTier(tier, 2, 2, 3), byTier(tier, 4, 6, 8));
      const a = R.int(1, 6);
      return { at: k => a + d * k, blurb: `each letter is ${d} further on than the one before` };
    },
  },
  {
    id: 'back', label: 'a step BACKWARDS through the alphabet',
    concept: 'reverse-letter-series', conceptLabel: 'Series that run backwards', base: 18,
    build: (R, tier) => {
      const d = R.int(byTier(tier, 2, 2, 3), byTier(tier, 4, 6, 7));
      const a = 26 - R.int(0, 4);
      return { at: k => a - d * k, blurb: `each letter is ${d} BEFORE the one before it` };
    },
  },
  {
    id: 'grow', label: 'a step that itself grows',
    concept: 'letter-positions', conceptLabel: 'Converting letters to positions', base: 30,
    build: (R, tier) => {
      const d0 = R.int(1, byTier(tier, 2, 3, 4));
      const inc = R.int(1, byTier(tier, 1, 2, 3));
      const a = R.int(1, 4);
      return { at: k => a + k * d0 + inc * (k * (k - 1) / 2),
               blurb: `the jumps themselves grow by ${inc} each time` };
    },
  },
  {
    id: 'alt', label: 'two letter series taking turns',
    concept: 'reverse-letter-series', conceptLabel: 'Series that run backwards', base: 38,
    build: (R, tier) => {
      const a1 = R.int(1, 5), d1 = R.int(2, byTier(tier, 3, 4, 5));
      const a2 = 26 - R.int(0, 4), d2 = -R.int(2, byTier(tier, 3, 4, 5));
      /* One climbing, one falling — the pair the paper likes, because reading
         it straight across gives an alternating gap that fits no rule. */
      return { at: k => (k % 2 === 0 ? a1 + d1 * (k / 2) : a2 + d2 * ((k - 1) / 2)),
               blurb: `alternate letters climb by ${d1} while the others fall by ${-d2}`,
               pair: [d1, -d2] };
    },
  },
];

export const letterSeries = {
  id: 'code-series-let', chapter: 'reasoning:5',
  concept: 'letter-positions', conceptLabel: 'Converting letters to positions',
  make(R, tier = 2, want = null) {
    const byTierPool = byTier(tier,
      LETTER_RULES.filter(x => ['step', 'back'].includes(x.id)),
      LETTER_RULES.filter(x => x.id !== 'alt'),
      LETTER_RULES);
    /* `alphanumeric-split` is not a RULE, it is a presentation — any of the
       letter rules can be dressed with numbers — so a request for it leaves the
       rule pool alone and switches the presentation on instead. */
    const wanted = want ? LETTER_RULES.filter(x => x.concept === want) : [];
    const pool = wanted.length ? wanted : byTierPool;
    const rule = R.pick(pool);
    const built = rule.build(R, tier);

    /* Alphanumeric: half the draws pair each letter with a number, which is the
       form the lesson calls "splitting an alphanumeric series" — two patterns
       side by side, and the trap is trying to read them as one. */
    /* When the caller wants `alphanumeric-split` specifically, every draw is
       alphanumeric — otherwise a re-teach for that concept would deal plain
       letter series most of the time and record them under the wrong idea. */
    const alnum = rule.id !== 'alt'
      && (want === 'alphanumeric-split' || R() < byTier(tier, 0.25, 0.4, 0.5));
    const numFrom = R.int(1, 5), numStep = R.int(2, byTier(tier, 4, 6, 9));
    const numAt = k => numFrom + numStep * k;

    const len = byTier(tier, 4, 5, 5);
    const posns = Array.from({ length: len + 1 }, (_, k) => built.at(k));
    if (posns.some(p => !Number.isInteger(p) || p < 1 || p > 26)) return this.make(R, tier, want);
    if (new Set(posns).size !== posns.length) return this.make(R, tier, want);

    const term = k => (alnum ? `${chr(posns[k])}${numAt(k)}` : chr(posns[k]));
    const shown = Array.from({ length: len }, (_, k) => term(k));
    const answer = term(len);
    const gaps = posns.slice(1, len).map((p, k) => p - posns[k]);
    const lastGap = posns[len] - posns[len - 1];

    /* Distractors that are each a named mistake, in letters rather than in
       numbers — a learner picks a LETTER, so the explanation has to be about
       which letter and why. */
    const cand = [];
    const off = k => (alnum ? `${chr(k)}${numAt(len)}` : chr(k));
    const nearPos = posns[len - 1] + (gaps[gaps.length - 1] ?? lastGap);
    if (rule.id === 'grow' && nearPos >= 1 && nearPos <= 26 && nearPos !== posns[len]) {
      cand.push({ v: off(nearPos), why: `You repeated the LAST jump
        (${gaps[gaps.length - 1]}) instead of continuing the pattern the jumps make. In positions
        the series runs ${posns.slice(0, len).join(', ')} — jumps of ${gaps.join(', ')}, so the
        next jump is ${lastGap}, not ${gaps[gaps.length - 1]}.` });
    }
    for (const delta of [1, -1, 2]) {
      const p = posns[len] + delta;
      if (p < 1 || p > 26 || p === posns[len]) continue;
      cand.push({ v: off(p), why: `<b>${chr(p)}</b> is position ${p}; the answer is position
        ${posns[len]}, which is <b>${chr(posns[len])}</b>. Convert to numbers and the
        ${delta > 0 ? 'overshoot' : 'undershoot'} is obvious — that is the whole reason to
        convert.` });
    }
    if (rule.id === 'back') {
      const fwd = posns[len - 1] + Math.abs(lastGap);
      if (fwd >= 1 && fwd <= 26 && fwd !== posns[len]) {
        cand.push({ v: off(fwd), why: `You stepped FORWARD. This series runs backwards —
          ${shown.slice(0, 3).join(', ')} is ${posns.slice(0, 3).join(', ')} in positions, which is
          falling, so the next letter is earlier in the alphabet, not later.` });
      }
    }
    const seen = new Set([answer, ...shown]);
    const usable = cand.filter(c => !seen.has(c.v) && (seen.add(c.v), true));

    if (alnum) {
      /* At least one distractor must move the NUMBER, or the number half is
         free information and the question quietly stops being about splitting
         two series at all. Unshifted to the front so it always survives the
         slice — the first version left it last, and every option came out with
         the same number on it. */
      const numTraps = [numAt(len) + numStep, numAt(len) - numStep]
        .filter(v => v > 0 && v !== numAt(len))
        .map(v => ({ v: `${chr(posns[len])}${v}`,
          why: `The letter is right and the number is not. They are two separate series running
            side by side: the numbers go
            ${Array.from({ length: len }, (_, k) => numAt(k)).join(', ')} — up by ${numStep} — so
            the next is ${numAt(len)}, not ${v}.` }))
        .filter(c => !seen.has(c.v) && (seen.add(c.v), true));
      usable.unshift(...numTraps.slice(0, 1));
    }

    if (usable.length < 3) return this.make(R, tier, want);

    const o = options(answer, usable.slice(0, 3), i => {
      const p = ((posns[len] + 3 + i - 1) % 26) + 1;
      return { v: off(p), why: `Position ${posns[len]} is <b>${chr(posns[len])}</b>. Write the
        positions under the letters and the answer is arithmetic, not memory.` };
    });

    const oddL = shown.filter((_, k) => k % 2 === 0);
    const evenL = shown.filter((_, k) => k % 2 === 1);

    return {
      q: `Which comes next in the series?`,
      context: `<b>${shown.join(',&nbsp; ')},&nbsp; ?</b>`,
      /* An alphanumeric term tests the SPLIT above all — two patterns side by
         side — so that is what it records against, whichever rule drove the
         letters. */
      concept: alnum ? 'alphanumeric-split' : rule.concept,
      conceptLabel: alnum ? 'Splitting an alphanumeric series' : rule.conceptLabel,
      ...o,
      whyRight: `In positions${alnum ? ' (letters only)' : ''} the series is
        <b>${posns.slice(0, len).join(', ')}</b> — ${built.blurb}. The next position is
        ${posns[len]}, which is <b>${chr(posns[len])}</b>.${
        alnum ? ` The numbers run ${Array.from({ length: len }, (_, k) => numAt(k)).join(', ')},
                  so the term is <b>${answer}</b>.` : ''}`,
      whyWrong: `<b>Convert first.</b> A letter series is invisible until it is numbers:
        A = 1, B = 2, … Z = 26.<br><br>
        ${shown.join(', ')} → <b>${posns.slice(0, len).join(', ')}</b>${
        alnum ? ' (taking the letters on their own)' : ''}<br>
        ${rule.id === 'alt'
          ? `Alternate letters are two series: ${oddL.join(', ')} climbs and ${evenL.join(', ')} falls.`
          : `Jumps: ${gaps.join(', ')} → the next jump is ${lastGap}.`}<br><br>
        Position ${posns[len]} is <b>${chr(posns[len])}</b>${alnum ? `, and the numbers go up by
        ${numStep}, so the answer is <b>${answer}</b>` : ''}.`,
      /* Letters over positions, which IS the method. A row of letters hides the
         pattern; the row of numbers underneath is the whole lesson. */
      figure: mapFig(shown.map((t, k) => ({
        from: t, fromPos: String(posns[k]),
        to: k < len - 1 ? `+${gaps[k]}` : '', toPos: '',
      })).concat([{ from: '?', fromPos: String(posns[len]), to: answer, toPos: 'answer' }]),
        { note: `${rule.label} — ${built.blurb}.` }),
      figureCap: `The letters on top, their positions underneath — the pattern only exists in the
        bottom row.`,
      hardness: rule.base + (alnum ? 10 : 0) + len,
    };
  },
};

export const REASONING_GENERATORS = [
  relationChain, netDisplacement, turnChain, rankTotal, rankBetween,
  codeFamily, letterPosition, holeDoubling, paintedCube,
  conditionalFollows, syllogism,
  /* the widening pass — see the block comment above diceOpposite */
  diceOpposite, fanCount, dirTriple, dirQuadrant, foundQuantity, numberSeries, letterSeries,
];
