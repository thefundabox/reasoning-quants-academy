/* Blood relations — RAS 2018 Q111, 2021 Q123. Four or five links deep, which
   is where drawing beats reading.

   The family is BUILT first and the relation read off it, so the clue chain
   and the answer cannot disagree. Nothing is hard-coded: `relationName` walks
   the tree, and the harness walks it again by a different route. */
import { gen, ask, options, byTier, MALE, FEMALE } from './kit.js';

/* A family of three generations. Everyone gets an id; links are parent and
   spouse, and every other relation is derived from those two. */
function family(R) {
  const men = R.shuffle(MALE), women = R.shuffle(FEMALE);
  let mi = 0, fi = 0;
  const P = {};
  const add = (sex, parents = null) => {
    const id = sex === 'm' ? men[mi++] : women[fi++];
    P[id] = { id, sex, parents, spouse: null };
    return id;
  };
  const marry = (a, b) => { P[a].spouse = b; P[b].spouse = a; };

  const gpa = add('m'), gma = add('f');            // grandparents
  marry(gpa, gma);
  const kids = [];
  for (let k = 0; k < 3; k++) kids.push(add(k === 1 ? 'f' : 'm', [gpa, gma]));
  /* Two of the three marry in, which is what makes the in-law questions
     possible at all. */
  const spouses = kids.slice(0, 2).map((k, n) => {
    const s = add(P[k].sex === 'm' ? 'f' : 'm');
    marry(k, s);
    return s;
  });
  const grandkids = [];
  for (let k = 0; k < 2; k++) grandkids.push(add(k === 0 ? 'm' : 'f', [kids[k], spouses[k]]));
  return { P, gpa, gma, kids, spouses, grandkids };
}

const parentsOf = (P, x) => P[x].parents || [];
const childrenOf = (P, x) => Object.values(P).filter(p => (p.parents || []).includes(x)).map(p => p.id);
const siblingsOf = (P, x) => {
  const par = parentsOf(P, x);
  if (!par.length) return [];
  return childrenOf(P, par[0]).filter(y => y !== x);
};

/** How is A related to B? Walks the tree; returns the word the paper uses. */
export function relationName(P, a, b) {
  const male = P[a].sex === 'm';
  if (P[a].spouse === b) return male ? 'husband' : 'wife';
  if (parentsOf(P, b).includes(a)) return male ? 'father' : 'mother';
  if (parentsOf(P, a).includes(b)) return male ? 'son' : 'daughter';
  if (siblingsOf(P, b).includes(a)) return male ? 'brother' : 'sister';
  const gp = parentsOf(P, b).flatMap(p => parentsOf(P, p));
  if (gp.includes(a)) return male ? 'grandfather' : 'grandmother';
  const gc = childrenOf(P, a).flatMap(c => childrenOf(P, c));
  if (gc.includes(b)) return male ? 'grandson' : 'granddaughter';   // unreachable: covered above
  const gpa2 = parentsOf(P, a).flatMap(p => parentsOf(P, p));
  if (gpa2.includes(b)) return male ? 'grandson' : 'granddaughter';
  /* Uncle / aunt: a sibling of a parent, or married to one. */
  const parentSibs = parentsOf(P, b).flatMap(p => siblingsOf(P, p));
  if (parentSibs.includes(a)) return male ? 'uncle' : 'aunt';
  if (parentSibs.some(s => P[s].spouse === a)) return male ? 'uncle' : 'aunt';
  const sibKids = siblingsOf(P, a).flatMap(s => childrenOf(P, s));
  if (sibKids.includes(b)) return male ? 'nephew' : 'niece';        // A is the CHILD of B's sibling
  if (siblingsOf(P, b).flatMap(s => childrenOf(P, s)).includes(a)) return male ? 'nephew' : 'niece';
  /* In-laws through a spouse. */
  const sp = P[b].spouse;
  if (sp && parentsOf(P, sp).includes(a)) return male ? 'father-in-law' : 'mother-in-law';
  const spA = P[a].spouse;
  if (spA && parentsOf(P, spA).includes(b)) return male ? 'son-in-law' : 'daughter-in-law';
  if (spA && siblingsOf(P, spA).includes(b)) return male ? 'brother-in-law' : 'sister-in-law';
  if (sp && siblingsOf(P, sp).includes(a)) return male ? 'brother-in-law' : 'sister-in-law';
  return null;
}

/* The clues are always PRIMITIVE links — "X is the son of Y", "X is the wife
   of Y" — because those are the only two facts a family is actually built
   from, and every other relation is deduced from them by the reader.

   Each edge of the family graph becomes one clue. The clues shown are the
   ones along the path from the person asked about to the person asked about,
   so the question is always answerable from what is printed. An earlier
   version drew clues at random and produced questions whose answer could not
   be reached from them at all — a hard question and an unanswerable one look
   identical until you try to solve it. */
const edgeClue = (P, a, b, kind) => (kind === 'spouse'
  ? `${a} is the ${P[a].sex === 'm' ? 'husband' : 'wife'} of ${b}.`
  : `${a} is the ${P[a].sex === 'm' ? 'son' : 'daughter'} of ${b}.`);

/** Every primitive link, as [from, to, kind]. */
function edges(P) {
  const out = [];
  for (const p of Object.values(P)) {
    for (const par of p.parents || []) out.push([p.id, par, 'child']);
    if (p.spouse && p.id < p.spouse) out.push([p.id, p.spouse, 'spouse']);
  }
  return out;
}

/** The shortest chain of primitive links joining two people. */
function pathBetween(P, from, to) {
  const adj = new Map();
  for (const e of edges(P)) {
    const [a, b] = e;
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push([b, e]);
    adj.get(b).push([a, e]);
  }
  const seen = new Set([from]);
  let front = [[from, []]];
  while (front.length) {
    const next = [];
    for (const [node, trail] of front) {
      if (node === to) return trail;
      for (const [nb, e] of adj.get(node) || []) {
        if (seen.has(nb)) continue;
        seen.add(nb);
        next.push([nb, [...trail, e]]);
      }
    }
    front = next;
  }
  return null;
}

const OPPOSITE = { father: 'son', mother: 'daughter', son: 'father', daughter: 'mother',
  brother: 'sister', sister: 'brother', uncle: 'nephew', aunt: 'niece', nephew: 'uncle', niece: 'aunt',
  grandfather: 'grandson', grandmother: 'granddaughter', grandson: 'grandfather', granddaughter: 'grandmother',
  husband: 'wife', wife: 'husband', 'father-in-law': 'son-in-law', 'mother-in-law': 'daughter-in-law',
  'son-in-law': 'father-in-law', 'daughter-in-law': 'mother-in-law',
  'brother-in-law': 'sister-in-law', 'sister-in-law': 'brother-in-law' };

const chain = (R, tier) => {
  const { P, gpa, gma, kids, spouses, grandkids } = family(R);
  const pairs = [[grandkids[0], gpa], [spouses[0], gma], [grandkids[1], kids[2]], [spouses[1], grandkids[0]],
    [kids[2], grandkids[1]], [grandkids[0], spouses[1]], [spouses[0], kids[2]], [grandkids[0], kids[2]]];
  const wantLinks = byTier(tier, 3, 4, 4);
  const usable = pairs.filter(([a, b]) => {
    const rel = a !== b && relationName(P, a, b);
    const path = rel && pathBetween(P, a, b);
    return path && path.length >= wantLinks - 1;
  });
  if (!usable.length) return null;
  const [X, Y] = R.pick(usable);
  const key = relationName(P, X, Y);
  const back = relationName(P, Y, X) || OPPOSITE[key];

  const path = pathBetween(P, X, Y);
  const onPath = new Set(path.map(e => e.join('|')));
  /* One or two extra links, so the chain is not simply the clues in order. */
  const decoys = edges(P).filter(e => !onPath.has(e.join('|')));
  const shown = R.shuffle([...path, ...R.shuffle(decoys).slice(0, byTier(tier, 1, 2, 3))])
    .map(([a, b, kind]) => edgeClue(P, a, b, kind));

  const male = P[X].sex === 'm';
  const wrongs = [back, male ? 'uncle' : 'aunt', male ? 'nephew' : 'niece',
    male ? 'brother' : 'sister', male ? 'son' : 'daughter', male ? 'grandson' : 'granddaughter',
    male ? 'brother-in-law' : 'sister-in-law', male ? 'father' : 'mother']
    .filter(w => w && w !== key);
  return ask({
    context: shown.join(' '),
    q: `How is <b>${X}</b> related to <b>${Y}</b>?`,
    opts: options(key, [
      { v: back, why: `That is how ${Y} is related to ${X} — the question asks it the other way round.` },
      ...R.shuffle(wrongs.filter(w => w !== back)).slice(0, 4).map(v => ({ v, why: '' })),
    ], i => (male ? ['cousin', 'brother-in-law', 'son-in-law', 'nephew', 'uncle']
                  : ['cousin', 'sister-in-law', 'daughter-in-law', 'niece', 'aunt'])[i % 5]),
    why: `Draw the links in the order given, and put each new person on the right generation.
      The chain from ${X} to ${Y} is ${path.length} link${path.length > 1 ? 's' : ''} long, and it reads:
      <b>${X} is the ${key} of ${Y}</b>.<br>
      The commonest slip is answering the reverse — ${Y} is the ${back} of ${X}.`,
    hardness: 1.5 + path.length * 0.8,
    concept: 'relation-chain', conceptLabel: 'A chain of relations',
    source: 'Shape of RAS 2018 Q111 · RAS 2021 Q123',
  });
};

export const RELATION_GENERATORS = [
  gen('ras-rel-chain', 'relations', 'reasoning:2', 'relation-chain', 'Chains of relations', chain),
];
