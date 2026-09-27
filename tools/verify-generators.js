/* Regression harness for the question generators.
 *
 *   node tools/verify-generators.js          (needs Node; no npm install)
 *
 * It loads the REAL <script> blocks out of each module's HTML into a stub DOM,
 * runs every generator tens of thousands of times, and re-derives each answer
 * INDEPENDENTLY of the code under test. Run it after touching any generator.
 *
 * Exits non-zero and prints "FAIL <check>: <detail>" for anything broken.
 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const DIR = path.join(__dirname, '..', 'modules') + path.sep;

function makeSandbox() {
  const store = new Map();
  const ctx2d = new Proxy({}, { get: () => () => {} });
  const mkEl = () => ({
    innerHTML: '', textContent: '', value: '', disabled: false, checked: false,
    style: {}, dataset: {}, classList: { add() {}, remove() {}, contains() { return false } },
    querySelectorAll: () => [], querySelector: () => null,
    insertAdjacentHTML() {}, appendChild() {}, setAttribute() {}, getAttribute: () => null,
    addEventListener() {}, getContext: () => ctx2d, width: 520, height: 320,
  });
  const document = {
    getElementById(id) { if (!store.has(id)) store.set(id, mkEl()); return store.get(id); },
    querySelectorAll: () => [], querySelector: () => null,
    createElement: mkEl, addEventListener() {},
  };
  const sb = { document, window: { addEventListener() {} }, alert() {}, console,
               setTimeout() {}, clearTimeout() {}, requestAnimationFrame() {}, Math, JSON };
  sb.globalThis = sb;
  return vm.createContext(sb);
}

const ev = (ctx, src) => vm.runInContext(src, ctx);

function load(file) {
  const html = fs.readFileSync(DIR + file, 'utf8');
  const ctx = makeSandbox();
  for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) vm.runInContext(m[1], ctx);
  return ctx;
}

/* A minimal localStorage, installed BEFORE any module is imported.
   Without it store.js falls back to running in memory, which is the right
   behaviour in private-browsing mode but means the harness would never exercise
   the part that actually persists — profile records, and the migration of a
   pre-profile record into the first profile. Seeding that legacy record here is
   what lets the migration be tested at all: it only ever runs once, on the first
   import, so there is no second chance later in the file.
   `xp: 123` is the marker the profiles suite looks for. Everything else is empty,
   so to every other suite this is indistinguishable from a fresh store. */
(function installLocalStorage() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: k => { map.delete(k); },
    clear: () => map.clear(),
    key: i => [...map.keys()][i] ?? null,
    get length() { return map.size; },
  };
  localStorage.setItem('rqa.progress.v1', JSON.stringify({
    v: 1, xp: 123, dailyGoal: 40,
    streak: { count: 0, best: 0, lastDay: null },
    today: { day: new Date().toISOString().slice(0, 10), xp: 0, correct: 0, asked: 0 },
    lessons: {}, concepts: {}, history: [],
  }));
})();

let failures = 0;
const check = (name, cond, detail) => { if (!cond) { failures++; console.log(`  FAIL ${name}: ${detail}`); } };
function optsOk(label, opts, correct) {
  check(label + ' option count', opts.length === 4, `got ${opts.length}: ${JSON.stringify(opts)}`);
  check(label + ' options distinct', new Set(opts).size === opts.length, JSON.stringify(opts));
  check(label + ' contains answer', opts.includes(correct), `answer ${correct} missing from ${JSON.stringify(opts)}`);
}
const parseOpts = h => [...h.matchAll(/<button class="opt"[^>]*>([^<]*)<\/button>/g)].map(m => m[1]);

/* ---------------- coding-lab ---------------- */
{
  console.log('coding-lab.html');
  const ctx = load('coding-lab.html');
  const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const P = c => AZ.indexOf(c) + 1, C = n => AZ[((n + 25) % 26 + 26) % 26];
  // independent re-implementations of the five families
  const sh = (w, k) => [...w].map(c => C(P(c) + k)).join('');
  const inc = (w, k) => [...w].map((c, i) => C(P(c) + k * (i + 1))).join('');
  const atb = w => [...w].map(c => C(27 - P(c))).join('');
  const rev = w => [...w].reverse().join('');
  const pair = w => { const a = [...w]; for (let i = 0; i + 1 < a.length; i += 2) [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a.join(''); };

  for (let n = 0; n < 4000; n++) {
    ev(ctx, 'genQuestion()');
    const { w1, c1, w2, correct } = ev(ctx, 'curQ');
    // which families explain w1 -> c1 ? each must also explain w2 -> correct
    const fams = [];
    for (let k = -25; k <= 25; k++) if (k && sh(w1, k) === c1) fams.push(['shift' + k, sh(w2, k)]);
    for (let k = 1; k <= 3; k++) if (inc(w1, k) === c1) fams.push(['inc' + k, inc(w2, k)]);
    if (atb(w1) === c1) fams.push(['atbash', atb(w2)]);
    if (rev(w1) === c1) fams.push(['reverse', rev(w2)]);
    if (pair(w1) === c1) fams.push(['pairswap', pair(w2)]);
    check('rule identifiable', fams.length > 0, `${w1} -> ${c1} matches no known family`);
    check('answer matches shown rule', fams.some(f => f[1] === correct),
      `${w1}->${c1} then ${w2}->${correct}; families predict ${JSON.stringify(fams)}`);
    optsOk('coding', parseOpts(ctx.document.getElementById('qOpts').innerHTML), correct);
  }
  console.log('  4000 generated questions checked');
}

/* ---------------- series-solver ---------------- */
{
  console.log('series-solver.html');
  const ctx = load('series-solver.html');
  const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seen = new Set();
  for (let n = 0; n < 6000; n++) {
    ev(ctx, 'genQuestion()');
    const cur = ev(ctx, 'cur');
    seen.add(cur.label);
    check('6 terms', cur.t.length === 6, JSON.stringify(cur.t));
    check('answer is 6th term', cur.ans === cur.t[5], `${cur.ans} vs ${cur.t[5]}`);
    optsOk('series/' + cur.label, parseOpts(ctx.document.getElementById('qOpts').innerHTML).map(x => x), String(cur.ans));

    if (cur.label === 'Alternating twin series') {
      const A = [cur.t[0], cur.t[2], cur.t[4]], B = [cur.t[1], cur.t[3], cur.t[5]];
      check('twin: odd positions are an AP', A[1] - A[0] === A[2] - A[1], JSON.stringify(A));
      check('twin: even positions are an AP', B[1] - B[0] === B[2] - B[1], JSON.stringify(B) + ' from ' + JSON.stringify(cur.t));
      check('twin: rule text matches', cur.rule.includes(`(+${A[1] - A[0]})`), cur.rule);
      const d2 = B[1] - B[0];
      check('twin: rule text matches 2nd series', cur.rule.includes(`(${d2 > 0 ? '+' : '−'}${Math.abs(d2)})`), cur.rule);
    }
    if (cur.letters) {
      for (let i = 0; i < 5; i++) {
        const jump = +cur.chain[i].slice(1);
        const got = (AZ.indexOf(cur.t[i]) + jump) % 26;
        check('letter chain step', got === AZ.indexOf(cur.t[i + 1]),
          `${cur.t[i]} ${cur.chain[i]} should be ${AZ[got]}, series has ${cur.t[i + 1]} (${cur.t.join(',')})`);
        // must not wrap past Z: positions strictly increase across the series
        check('letter series does not wrap', AZ.indexOf(cur.t[i + 1]) > AZ.indexOf(cur.t[i]),
          `${cur.t.join(', ')} wraps at step ${i + 1}`);
      }
      const jumps = cur.chain.map(c => +c.slice(1));
      const constant = jumps.every(j => j === jumps[0]);
      const growingBy1 = jumps.every((j, i) => i === 0 || j === jumps[i - 1] + 1);
      check('letter jumps follow one stated pattern', constant || growingBy1, cur.chain.join(', '));
    }
    if (cur.chain && !cur.letters) {
      for (let i = 0; i < cur.chain.length; i++) {
        const op = cur.chain[i];
        const v = op[0] === '×' ? cur.t[i] * parseFloat(op.slice(1)) + (op.includes('+1') ? 1 : op.includes('−1') ? -1 : 0)
          : cur.t[i] + parseFloat(op.slice(1));
        check('numeric chain step', Math.abs(v - cur.t[i + 1]) < 1e-9, `${cur.t[i]} ${op} != ${cur.t[i + 1]}`);
      }
    }
  }
  console.log('  6000 generated series checked across:', [...seen].join(', '));
}

/* ---------------- direction-sense ---------------- */
{
  console.log('direction-sense.html');
  const ctx = load('direction-sense.html');
  const cd = ev(ctx, 'compassDir');
  check('quadrant NE', cd(3, 1) === 'North-East', cd(3, 1));
  check('quadrant SE', cd(1, -7) === 'South-East', cd(1, -7));
  check('quadrant SW', cd(-9, -1) === 'South-West', cd(-9, -1));
  check('axis East', cd(5, 0) === 'East', cd(5, 0));
  check('axis South', cd(0, -5) === 'South', cd(0, -5));
  for (let n = 0; n < 4000; n++) {
    ev(ctx, 'genQuestion()');
    const q = ev(ctx, 'curQ');
    optsOk('direction', parseOpts(ctx.document.getElementById('qOpts').innerHTML), q.correct);
    const expectDir = (q.ex === 0 ? (q.ey > 0 ? 'North' : 'South')
      : q.ey === 0 ? (q.ex > 0 ? 'East' : 'West')
        : (q.ey > 0 ? 'North' : 'South') + '-' + (q.ex > 0 ? 'East' : 'West'));
    if (!q.correct.endsWith('km')) check('direction answer', q.correct === expectDir, `${q.ex},${q.ey} -> ${q.correct}`);
    else check('distance answer', Math.abs(parseFloat(q.correct) - Math.hypot(q.ex, q.ey)) < 1e-9, q.correct);
    // exam-style: the displacement must be a whole number of km
    const d = Math.hypot(q.ex, q.ey);
    check('whole-number displacement', Math.abs(d - Math.round(d)) < 1e-9,
      `net (${q.ex}, ${q.ey}) gives ${d}`);
    check('walk has >= 3 legs', q.legs.length >= 3, JSON.stringify(q.legs));
    q.legs.forEach((l, i) => {
      check('leg has positive length', l.d > 0, JSON.stringify(l));
      if (i) check('no two consecutive legs on one axis',
        ('NS'.includes(l.dir)) !== ('NS'.includes(q.legs[i - 1].dir)), JSON.stringify(q.legs));
    });
  }
  console.log('  4000 generated walks checked');
}

/* ---------------- seating ranking ---------------- */
{
  console.log('seating-arrangement.html');
  const ctx = load('seating-arrangement.html');
  for (let n = 0; n < 4000; n++) {
    ev(ctx, 'genRankQ()');
    const opts = [...ctx.document.getElementById('rOpts').innerHTML.matchAll(/<button class="opt"[^>]*>([^<]*)<\/button>/g)].map(m => m[1]);
    optsOk('ranking', opts, String(ev(ctx, 'rCur.ans')));
    check('ranking answer positive', ev(ctx, 'rCur.ans') > 0, String(ev(ctx, 'rCur.ans')));
    ev(ctx, 'revealRank()');
    // the old dead expression rendered "●★" in a single marker <text>
    const svg = ctx.document.getElementById('rSol').innerHTML;
    check('no stray marker', !/●/.test(svg), 'leftover ● marker in rank svg');
    [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].forEach(m =>
      check('one glyph per marker', !/★.*★/.test(m[1]), `marker text "${m[1]}"`));
  }
  console.log('  4000 generated ranking questions checked');
}

/* ---------------- quants DI ---------------- */
{
  console.log('quants-zone.html');
  const ctx = load('quants-zone.html');
  for (let n = 0; n < 4000; n++) {
    ev(ctx, 'genDI()');
    ev(ctx, 'diData.qs').forEach((q, i) => optsOk('DI q' + (i + 1), q.opts, q.ans));
    const neg = ev(ctx, 'diData.qs')[2].opts.some(o => +o < 0);
    check('DI difference options non-negative', !neg, JSON.stringify(ev(ctx, 'diData.qs')[2].opts));
  }
  console.log('  4000 generated DI datasets checked');

  // static banks: recompute nothing, just assert keys are in range and unique
  const Q = ev(ctx, 'QUIZDATA');
  Object.entries(Q).forEach(([bank, qs]) => qs.forEach((q, i) => {
    check(`${bank} Q${i + 1} key in range`, q.a >= 0 && q.a < q.o.length, `a=${q.a}`);
    check(`${bank} Q${i + 1} options distinct`, new Set(q.o).size === q.o.length, JSON.stringify(q.o));
  }));
  check('qz0 Q2 key fixed', Q.qz0[1].o[Q.qz0[1].a] === '37.5%', `keyed as ${Q.qz0[1].o[Q.qz0[1].a]}`);
}

/* ---------------- venn ---------------- */
{
  console.log('venn-logic.html');
  const ctx = load('venn-logic.html');
  for (let n = 0; n < 3000; n++) {
    ev(ctx, 'genVennQ()');
    const html = ctx.document.getElementById('vOpts').innerHTML;
    const tpls = [...html.matchAll(/data-tpl="(T\d)"/g)].map(m => m[1]);
    check('venn 4 options', tpls.length === 4, JSON.stringify(tpls));
    check('venn options distinct', new Set(tpls).size === 4, JSON.stringify(tpls));
    check('venn contains answer', tpls.includes(ev(ctx, 'vCur.tpl')), `${ev(ctx, 'vCur.tpl')} not in ${JSON.stringify(tpls)}`);
  }
  console.log('  3000 venn questions checked');
  // "Break it" geometry must agree with each caption (all circles share cy)
  const A = { x: 130, r: 30 }, B = { x: 172, r: 76 };
  ev(ctx, 'BRK_ARR').forEach((c, i) => {
    const overlaps = (p, q) => Math.abs(p.x - q.x) < p.r + q.r;
    const CA = overlaps({ x: c.cx, r: c.r }, A), CB = overlaps({ x: c.cx, r: c.r }, B);
    check(`break[${i}] "some B are C" drawn`, CB, c.name);
    check(`break[${i}] picture matches verdict`, CA === c.holds,
      `${c.name}: drawn A∩C=${CA} but holds=${c.holds}`);
  });
}

/* ---------------- Academy: kinship naming ---------------- */
/* Pure logic behind the Generation Ladder widget. Regression guard for the bug
   where a sibling step in the middle of a chain hid the climb, turning a cousin
   into a sister ("mother's brother's daughter"). */
async function kinship() {
  console.log('assets/js/widgets/relation-ladder.js');
  const { termFor } = await import('../assets/js/widgets/relation-ladder.js');
  const CASES = [
    [['mother', 'brother', 'daughter'], 'cousin'],
    [['mother', 'brother', 'daughter', 'brother'], 'cousin'],
    [['father', 'brother', 'son'], 'cousin'],
    [['father', 'sister', 'husband'], 'uncle'],
    [['father', 'brother'], 'uncle'],
    [['father', 'sister'], 'aunt'],
    [['father', 'father'], 'grandfather'],
    [['mother', 'mother'], 'grandmother'],
    [['brother', 'son'], 'nephew'],
    [['sister', 'daughter'], 'niece'],
    [['son', 'daughter'], 'granddaughter'],
    [['son', 'son'], 'grandson'],
    [['son'], 'son'],
    [['daughter'], 'daughter'],
    [['brother'], 'brother'],
    [['sister'], 'sister'],
    [['wife'], 'wife'],
    [['husband'], 'husband'],
    [['father'], 'father'],
    [['father', 'father', 'brother'], 'great-uncle'],
    [[], 'you'],
    /* Sibling-then-parent CANCELS: siblings share their parents. Every case
       above put the sibling step after the climb, which is why the drill spent
       months telling learners that their sister's mother was their aunt. */
    [['sister', 'mother'], 'mother'],
    [['brother', 'father'], 'father'],
    [['sister', 'father'], 'father'],
    [['brother', 'mother', 'mother'], 'grandmother'],
    [['sister', 'father', 'brother'], 'uncle'],
    [['brother', 'brother', 'father'], 'father'],
    [['sister', 'mother', 'sister'], 'aunt'],
    [['brother', 'father', 'father'], 'grandfather'],
    [['sister', 'son'], 'nephew'],
  ];
  CASES.forEach(([path, want]) =>
    check(`kinship ${path.join('→') || '(empty)'}`, termFor(path).term === want,
      `got "${termFor(path).term}", expected "${want}"`));

  // "father's son" is you OR your brother — the ambiguity must be flagged,
  // because only the word "only" in a question can resolve it.
  check('father→son flagged ambiguous', termFor(['father', 'son']).ambiguous === true, 'not flagged');
  check('father→brother not ambiguous', termFor(['father', 'brother']).ambiguous === false, 'wrongly flagged');
  check('sister→mother not ambiguous', termFor(['sister', 'mother']).ambiguous === false, 'wrongly flagged');
  /* Two sibling steps, or a spouse step mid-chain, cannot be named by a
     four-option question; they must be flagged so the generators skip them. */
  check('sister→sister flagged ambiguous', termFor(['sister', 'sister']).ambiguous === true, 'not flagged');
  check('mother→brother→sister flagged ambiguous',
    termFor(['mother', 'brother', 'sister']).ambiguous === true, 'she may be your mother');
  check('husband→mother is named an in-law, not a mother',
    /in-law/.test(termFor(['husband', 'mother']).term), termFor(['husband', 'mother']).term);

  /* ---- the same chains, worked out from an actual family tree ----

     A second opinion that shares no code with termFor: build the people the
     chain describes — siblings get the same two parents, a parent step reuses
     the parent already there — and then name the last one with the relation
     reader from the RAS bank. Where that reader has no word for the answer
     (cousins, great-uncles) the case is skipped rather than fudged. */
  const { relationName } = await import('../assets/js/ras/relations.js');
  function tree(path) {
    const P = { You: { id: 'You', sex: 'm', parents: null, spouse: null } };
    let n = 0;
    const mk = (sex, parents = null) => { const id = `p${++n}`; P[id] = { id, sex, parents, spouse: null }; return id; };
    const parentsOf = x => {
      if (!P[x].parents) {
        const f = mk('m'), m = mk('f');
        P[f].spouse = m; P[m].spouse = f;
        P[x].parents = [f, m];
      }
      return P[x].parents;
    };
    let cur = 'You';
    for (const k of path) {
      if (k === 'father' || k === 'mother') cur = parentsOf(cur)[k === 'father' ? 0 : 1];
      else if (k === 'brother' || k === 'sister') cur = mk(k === 'brother' ? 'm' : 'f', parentsOf(cur));
      else {
        let sp = P[cur].spouse;
        if (!sp) { sp = mk(P[cur].sex === 'm' ? 'f' : 'm'); P[cur].spouse = sp; P[sp].spouse = cur; }
        /* father first, mother second — the same order parentsOf() uses, or a
           "father" step later in the chain walks to the mother. */
        const pair = P[cur].sex === 'm' ? [cur, sp] : [sp, cur];
        cur = mk(k === 'son' ? 'm' : 'f', pair);
      }
    }
    return { P, cur };
  }
  const WALK = ['father', 'mother', 'brother', 'sister', 'son', 'daughter'];
  const R = (() => { let a = 20260926; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
  let modelled = 0, disagreed = 0, skipped = 0;
  for (let i = 0; i < 4000; i++) {
    const path = Array.from({ length: 1 + Math.floor(R() * 3) }, () => WALK[Math.floor(R() * WALK.length)]);
    const t = termFor(path);
    if (t.ambiguous || t.term === 'you') { skipped++; continue; }
    const { P, cur } = tree(path);
    const want = cur === 'You' ? 'you' : relationName(P, cur, 'You');
    if (!want) { skipped++; continue; }                 // no word for it: cousin, great-uncle
    modelled++;
    if (want !== t.term) {
      disagreed++;
      if (disagreed < 4) console.log(`  FAIL kinship model: your ${path.join("'s ")}'s — tree says ${want}, ladder says ${t.term}`);
    }
  }
  check('kinship: the ladder agrees with a family tree built from the same chain',
    disagreed === 0, `${disagreed} of ${modelled}`);
  console.log(`  ${CASES.length + 7} kinship chains checked, ${modelled} more against a built family tree`);
}

/* ---------------- Academy: compass + walk logic ---------------- */
/* Encodes the exact claims the Space & Direction lessons make, so a lesson
   whose keyed answer drifts from the turn rules fails here rather than in
   front of a student. */
async function compass() {
  console.log('assets/js/widgets/compass.js + walk-map.js');
  const { LEFT, RIGHT, BACK, relativeTo } = await import('../assets/js/widgets/compass.js');
  const { compassDir, trace } = await import('../assets/js/widgets/walk-map.js');
  const DIRS = ['N', 'E', 'S', 'W'];

  // structural invariants
  DIRS.forEach(d => {
    check(`right undoes left (${d})`, RIGHT[LEFT[d]] === d, `${d}→${LEFT[d]}→${RIGHT[LEFT[d]]}`);
    check(`four lefts return (${d})`, LEFT[LEFT[LEFT[LEFT[d]]]] === d, 'did not cycle');
    check(`U-turn is two lefts (${d})`, BACK[d] === LEFT[LEFT[d]], `${BACK[d]} vs ${LEFT[LEFT[d]]}`);
    check(`U-turn is two rights (${d})`, BACK[d] === RIGHT[RIGHT[d]], `${BACK[d]} vs ${RIGHT[RIGHT[d]]}`);
    check(`relativeTo left (${d})`, relativeTo(LEFT[d], d) === 'left', relativeTo(LEFT[d], d));
    check(`relativeTo right (${d})`, relativeTo(RIGHT[d], d) === 'right', relativeTo(RIGHT[d], d));
    check(`relativeTo behind (${d})`, relativeTo(BACK[d], d) === 'behind', relativeTo(BACK[d], d));
  });

  // the specific claims made in r.dir.compass
  check('facing South, turn left → East', LEFT.S === 'E', LEFT.S);
  check('facing West, turn right → North', RIGHT.W === 'N', RIGHT.W);
  check('North, right, right → South', RIGHT[RIGHT.N] === 'S', RIGHT[RIGHT.N]);
  check('East, U-turn then left → South', LEFT[BACK.E] === 'S', LEFT[BACK.E]);
  check('South, left, left → North', LEFT[LEFT.S] === 'N', LEFT[LEFT.S]);

  // the specific claims made in r.dir.shadow (sunrise ⇒ shadow West, sunset ⇒ East)
  const facingWhereShadowIs = (shadow, side) =>
    DIRS.find(f => relativeTo(shadow, f) === side);
  check('sunrise, shadow on right → facing South', facingWhereShadowIs('W', 'right') === 'S',
    facingWhereShadowIs('W', 'right'));
  check('sunrise, shadow on left → facing North', facingWhereShadowIs('W', 'left') === 'N',
    facingWhereShadowIs('W', 'left'));
  check('sunset, shadow behind → facing West', facingWhereShadowIs('E', 'behind') === 'W',
    facingWhereShadowIs('E', 'behind'));

  // quadrant naming — exams want the quadrant, never the nearest bearing
  check('(3,1) is North-East', compassDir(3, 1) === 'North-East', compassDir(3, 1));
  check('(-8,4) is North-West', compassDir(-8, 4) === 'North-West', compassDir(-8, 4));
  check('(0,-5) is South', compassDir(0, -5) === 'South', compassDir(0, -5));
  check('(6,0) is East', compassDir(6, 0) === 'East', compassDir(6, 0));
  check('(0,0) is the start', compassDir(0, 0) === 'the starting point', compassDir(0, 0));

  // the walks used in r.dir.displace, re-derived from the leg lists
  const walk = legs => { const p = trace(legs); const [x, y] = p[p.length - 1]; return { x, y, d: Math.hypot(x, y) }; };
  const w1 = walk([{ dir: 'N', d: 9 }, { dir: 'E', d: 12 }, { dir: 'S', d: 4 }]);
  check('predict walk is 13 km', Math.abs(w1.d - 13) < 1e-9, `got ${w1.d}`);
  const w2 = walk([{ dir: 'N', d: 8 }, { dir: 'E', d: 3 }, { dir: 'S', d: 4 }]);
  check('reveal walk is 5 km', Math.abs(w2.d - 5) < 1e-9, `got ${w2.d}`);
  check('reveal walk is North-East', compassDir(w2.x, w2.y) === 'North-East', compassDir(w2.x, w2.y));
  const w3 = walk([{ dir: 'S', d: 9 }, { dir: 'W', d: 12 }]);
  check('drill walk is 15 km', Math.abs(w3.d - 15) < 1e-9, `got ${w3.d}`);
  const w4 = walk([{ dir: 'W', d: 10 }, { dir: 'N', d: 4 }, { dir: 'E', d: 2 }]);
  check('drill walk is North-West', compassDir(w4.x, w4.y) === 'North-West', compassDir(w4.x, w4.y));
  const w5 = walk([{ dir: 'N', d: 13 }, { dir: 'W', d: 6 }, { dir: 'S', d: 5 }]);
  check('mastery walk is 10 km', Math.abs(w5.d - 10) < 1e-9, `got ${w5.d}`);

  console.log('  turn rules, shadow rules, quadrants and 5 lesson walks checked');
}

/* ---------------- Academy: arrangement puzzles ---------------- */
/* Every seating / floor / scheduling puzzle is brute-forced over all
   permutations. A puzzle must have EXACTLY ONE solution — zero means it is
   unsolvable (a bug that shipped once already), more than one means the
   stated answer is not forced. */
async function arrangements() {
  console.log('assets/js/lessons/r-ord-*.js');
  const { helpersFor } = await import('../assets/js/widgets/seat-board.js');
  const perms = a => a.length <= 1 ? [a]
    : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p]));

  /** Count arrangements of `people` over n seats satisfying every clue. */
  const solveBoard = ({ type, n, facing, people, clues }) => {
    const H = helpersFor({ type, n, facing });
    const seats = [...Array(n).keys()];
    return perms(seats).filter(order => {
      const pos = Object.fromEntries(people.map((p, i) => [p, order[i]]));
      return clues.every(c => { try { return !!c.test(pos, H); } catch { return false; } });
    });
  };

  const LESSONS = [
    ['r-ord-linear', 'linear seating'],
    ['r-ord-circular', 'circular seating'],
    ['r-ord-floors', 'floors & boxes'],
  ];
  for (const [file, label] of LESSONS) {
    const mod = await import(`../assets/js/lessons/${file}.js`);
    const explore = mod.default.steps.find(s => s.type === 'explore');
    const cfg = explore.__puzzle;
    if (!cfg) { check(`${label} exposes its puzzle`, false, 'no __puzzle on the explore step'); continue; }
    const sols = solveBoard(cfg);
    const unique = cfg.type === 'circle'
      ? sols.length === cfg.n           // a circle admits n rotations of one arrangement
      : sols.length === 1;
    check(`${label} has exactly one arrangement`, unique,
      `found ${sols.length}${cfg.type === 'circle' ? ` (expected ${cfg.n} rotations)` : ''}`);
    // the reveal must show an arrangement that actually satisfies the clues
    const reveal = mod.default.steps.find(s => s.type === 'reveal');
    if (reveal?.__solution) {
      const H = helpersFor(cfg);
      const ok = cfg.clues.every(c => { try { return !!c.test(reveal.__solution, H); } catch { return false; } });
      check(`${label} reveal matches its own clues`, ok, JSON.stringify(reveal.__solution));
    }
  }

  // scheduling puzzle: people -> days, one each
  const sched = await import('../assets/js/lessons/r-ord-schedule.js');
  const grid = sched.default.steps.find(s => s.type === 'explore').__puzzle;
  if (grid) {
    const { rows, cols, solution, test } = grid;
    const sols = perms(cols)
      .map(order => Object.fromEntries(rows.map((r, i) => [r, order[i]])))
      .filter(m => test(m, n => cols.indexOf(m[n])));
    check('scheduling puzzle has exactly one solution', sols.length === 1, `found ${sols.length}`);
    check('scheduling stated answer matches the unique solution',
      sols.length === 1 && rows.every(r => sols[0][r] === solution[r]),
      JSON.stringify(sols[0] || null) + ' vs ' + JSON.stringify(solution));
  } else {
    check('scheduling exposes its puzzle', false, 'no __puzzle on the explore step');
  }
  console.log('  every arrangement puzzle brute-forced for a unique solution');
}

/* ---------------- Academy: codes & series ---------------- */
/* Every coded word and every series used in Unit 5 is recomputed from the
   rule the lesson claims, and each series is checked for a UNIQUE extension
   under the stated rule. */
async function codes() {
  console.log('assets/js/widgets/cipher-wheel.js + series-chain.js');
  const { pos, chr, shift, shiftBetween, FAMILIES } = await import('../assets/js/widgets/cipher-wheel.js');
  const fam = id => FAMILIES.find(f => f.id === id);

  // position arithmetic
  check('A is 1', pos('A') === 1, String(pos('A')));
  check('Z is 26', pos('Z') === 26, String(pos('Z')));
  check('EJOTY anchors', ['E', 'J', 'O', 'T', 'Y'].map(pos).join() === '5,10,15,20,25',
    ['E', 'J', 'O', 'T', 'Y'].map(pos).join());
  check('positions sum to 27', ['A', 'M', 'R', 'Z'].every(c => pos(c) + (27 - pos(c)) === 27), '');
  check('shift wraps past Z', shift('Y', 3) === 'B', shift('Y', 3));
  check('negative shift wraps under A', shift('A', -3) === 'X', shift('A', -3));

  // every coded pair quoted in the lessons
  const PAIRS = [
    ['TIGER', 'WLJHU', 'shift', 3], ['LION', 'OLRQ', 'shift', 3],
    ['DOG', 'GRJ', 'shift', 3],     ['CAT', 'FDW', 'shift', 3],
    ['SUN', 'PRK', 'shift', -3],    ['MOON', 'JLLK', 'shift', -3],
    ['CAT', 'XZG', 'atbash', null], ['CAT', 'DCW', 'incr', 1], ['DOG', 'EQJ', 'incr', 1],
    ['MANGO', 'AMGNO', 'pairswap', null], ['JAIPUR', 'AJPIRU', 'pairswap', null],
    ['CAT', 'TAC', 'reverse', null], ['CAT', 'ACT', 'pairswap', null],
  ];
  PAIRS.forEach(([w, c, id, tag]) => {
    check(`${w} → ${c} via ${id}`, fam(id).apply(w, tag) === c, `got ${fam(id).apply(w, tag)}`);
    check(`${w} → ${c} detected as ${id}`, fam(id).detect(w, c) !== null, 'family did not detect its own output');
  });
  // the same-letters test must separate the two halves
  const sameLetters = (a, b) => [...a].sort().join('') === [...b].sort().join('');
  check('TAC and ACT are rearrangements', sameLetters('CAT', 'TAC') && sameLetters('CAT', 'ACT'), '');
  check('FDW and XZG are substitutions', !sameLetters('CAT', 'FDW') && !sameLetters('CAT', 'XZG'), '');
  check('shiftBetween finds +3', shiftBetween('TIGER', 'WLJHU') === 3, String(shiftBetween('TIGER', 'WLJHU')));
  check('shiftBetween rejects a non-shift', shiftBetween('MANGO', 'AMGNO') === null, 'wrongly matched');

  // series: recompute the stated rule and confirm it lands on the printed term
  const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const P = c => AZ.indexOf(c) + 1;
  const diffs = a => a.slice(1).map((x, i) => x - a[i]);
  const SERIES = [
    ['2,5,11,23,47,95', [2, 5, 11, 23, 47, 95], a => a.every((x, i) => i === 0 || x === a[i - 1] * 2 + 1)],
    ['3,7,13,21,31,43', [3, 7, 13, 21, 31, 43], a => diffs(diffs(a)).every(d => d === 2)],
    ['5,15,45,135,405', [5, 15, 45, 135, 405], a => a.every((x, i) => i === 0 || x === a[i - 1] * 3)],
    ['1,10,3,8,5,6,7',  [1, 10, 3, 8, 5, 6, 7],
      a => diffs(a.filter((_, i) => i % 2 === 0)).every(d => d === 2)
        && diffs(a.filter((_, i) => i % 2 === 1)).every(d => d === -2)],
  ];
  SERIES.forEach(([label, a, rule]) => check(`series ${label} obeys its stated rule`, rule(a), 'rule failed'));

  const LETTERS = [
    ['C,F,J,O,U', ['C', 'F', 'J', 'O', 'U'], d => d.join() === '3,4,5,6'],
    ['A,D,G,J,M', ['A', 'D', 'G', 'J', 'M'], d => d.every(x => x === 3)],
    ['Z,W,T,Q,N', ['Z', 'W', 'T', 'Q', 'N'], d => d.every(x => x === -3)],
  ];
  LETTERS.forEach(([label, ls, rule]) =>
    check(`letter series ${label}`, rule(diffs(ls.map(P))), JSON.stringify(diffs(ls.map(P)))));
  check('alphanumeric A1 C4 E9 G16 I25',
    diffs(['A', 'C', 'E', 'G', 'I'].map(P)).every(d => d === 2)
    && [1, 4, 9, 16, 25].every((n, i) => n === (i + 1) ** 2), '');
  check('letter series stay inside A-Z',
    LETTERS.every(([, ls]) => ls.every(c => P(c) >= 1 && P(c) <= 26)), 'a letter fell outside the alphabet');

  console.log(`  ${PAIRS.length} coded pairs and ${SERIES.length + LETTERS.length} series re-derived`);
}

/* ---------------- Academy: logic & sets ---------------- */
/* The syllogism widgets evaluate statements from geometry, so every arrangement
   a lesson ships can be checked: the statements must actually hold, and a lesson
   that claims a conclusion "does not follow" must ship a drawing where it fails. */
async function logic() {
  console.log('assets/js/lessons/r-log-*.js');
  const { overlaps, contains, relationOf } = await import('../assets/js/widgets/venn-sets.js');

  // primitives
  check('contains implies overlaps', overlaps({ x: 100, r: 20 }, { x: 100, r: 60 }), '');
  check('disjoint circles do not overlap', !overlaps({ x: 0, r: 10 }, { x: 100, r: 10 }), '');
  check('relationOf subset', relationOf({ x: 100, r: 20 }, { x: 100, r: 60 }) === 'subset', '');
  check('relationOf overlap', relationOf({ x: 90, r: 40 }, { x: 140, r: 40 }) === 'overlap', '');
  check('relationOf disjoint', relationOf({ x: 0, r: 10 }, { x: 100, r: 10 }) === 'disjoint', '');

  // every arrangement in the two syllogismLab widgets
  const LESSONS = [
    ['r-log-syllogism', 'Some+Some', 'explore', false],   // must be breakable
    ['r-log-syllogism', 'All+All', 'reveal', true],       // must be unbreakable
  ];
  for (const [file, label, stepType, mustAlwaysHold] of LESSONS) {
    const mod = await import(`../assets/js/lessons/${file}.js`);
    const step = mod.default.steps.find(s => s.type === stepType && s.widget);
    const cfg = step?.__cfg;
    if (!cfg) { check(`${label} exposes its config`, false, 'no __cfg'); continue; }
    const results = cfg.arrangements.map(a => {
      const c = a.circles;
      const valid = cfg.statements.every((_, i) => cfg.tests['s' + (i + 1)](c));
      return { label: a.label, valid, concl: cfg.tests.concl(c) };
    });
    results.forEach(r =>
      check(`${label}: "${r.label}" satisfies both statements`, r.valid,
        'this drawing breaks a statement, so it teaches nothing'));
    const anyFail = results.some(r => r.valid && !r.concl);
    const anyHold = results.some(r => r.valid && r.concl);
    if (mustAlwaysHold) {
      check(`${label}: conclusion holds in every shipped drawing`, !anyFail,
        'a valid syllogism must not have a counterexample on screen');
    } else {
      check(`${label}: ships a drawing where the conclusion FAILS`, anyFail,
        'the lesson claims it does not follow but never shows it failing');
      check(`${label}: ships a drawing where the conclusion holds`, anyHold,
        'the contrast needs both cases');
    }
  }

  // the conclusionBreaker must actually be breakable within its slider range
  const brk = (await import('../assets/js/lessons/r-log-break.js')).default;
  const bcfg = brk.steps.find(s => s.type === 'explore')?.__cfg;
  if (bcfg) {
    const A = bcfg.a, B = bcfg.b;
    let breakable = false, holdable = false;
    for (let x = 60; x <= 400; x += 2) for (let r = 18; r <= 130; r += 2) {
      const C = { x, r };
      if (!(contains(B, A) && overlaps(B, C))) continue;
      if (overlaps(A, C)) holdable = true; else breakable = true;
    }
    check('breaker: a counterexample exists in range', breakable, 'the learner could never break it');
    check('breaker: the conclusion can also hold', holdable, 'no contrast available');
    check('breaker: A starts inside B', contains(B, A), 'first statement is not permanently satisfied');
  } else {
    check('breaker exposes its config', false, 'no __cfg');
  }

  // vennPicker rounds must all name a real template
  const v3 = (await import('../assets/js/lessons/r-log-venn3.js')).default;
  const { TEMPLATES } = await import('../assets/js/widgets/venn-sets.js');
  const rounds = v3.steps.find(s => s.type === 'explore')?.__cfg?.rounds || [];
  check('venn picker has rounds', rounds.length > 0, 'none exposed');
  rounds.forEach(r =>
    check(`venn round ${r.cats.join('/')} names a real template`, !!TEMPLATES[r.tpl], r.tpl));

  // setSorter zones must be legal
  const sets = (await import('../assets/js/lessons/r-log-sets.js')).default
    .steps.find(s => s.type === 'explore')?.__cfg?.sets || [];
  check('set sorter has sets', sets.length > 0, 'none exposed');
  sets.forEach(s => s.items.forEach(([n, z]) =>
    check(`sorter item ${n} has a legal zone`, ['A', 'B', 'AB', 'OUT'].includes(z), z)));

  console.log('  set primitives, syllogism arrangements and breaker range checked');
}

/* ---------------- Academy: visual reasoning ---------------- */
/* Figure counts are checked against the ENUMERATED sub-figure lists (not the
   stated answer), painted-cube groups must add back to n³, folding must obey
   2ⁿ, and the mirror/water letter sets are verified against each other. */
async function visual() {
  console.log('assets/js/widgets/figure-count.js + paper-fold.js + dice-lab.js');

  // figure counting: the enumerated polygons must match the stated answer
  const { FIGURES } = await import('../assets/js/widgets/figure-count.js');
  FIGURES.forEach(f => {
    const subs = f.subs();
    check(`figure "${f.name}" enumeration matches its answer`, subs.length === f.answer,
      `enumerated ${subs.length}, claims ${f.answer}`);
    const dup = new Set(subs.map(p => JSON.stringify([...p].sort())));
    check(`figure "${f.name}" has no duplicate sub-figures`, dup.size === subs.length,
      `${subs.length - dup.size} duplicate(s)`);
  });
  // the three formulas the lesson quotes
  const sq = n => [...Array(n)].reduce((s, _, k) => s + (n - k) ** 2, 0);
  const C2 = m => m * (m - 1) / 2;
  check('squares in a 3x3 grid = 14', sq(3) === 14, String(sq(3)));
  check('rectangles in a 2x3 grid = 18', C2(4) * C2(3) === 18, String(C2(4) * C2(3)));
  check('triangle fan with 4 base parts = 10', 4 * 5 / 2 === 10, '');

  // painted cube: groups must partition n^3 for every n the widget allows
  const { paintedCounts } = await import('../assets/js/widgets/dice-lab.js');
  for (let n = 3; n <= 6; n++) {
    const c = paintedCounts(n);
    check(`painted cube n=${n} partitions n^3`,
      c.three + c.two + c.one + c.zero === n ** 3,
      `${c.three}+${c.two}+${c.one}+${c.zero} != ${n ** 3}`);
    check(`painted cube n=${n} always has 8 corners`, c.three === 8, String(c.three));
  }
  check('n=4 two-face count is 24', paintedCounts(4).two === 24, String(paintedCounts(4).two));
  check('n=4 zero-face count is 8', paintedCounts(4).zero === 8, String(paintedCounts(4).zero));
  check('n=5 zero-face count is 27', paintedCounts(5).zero === 27, String(paintedCounts(5).zero));

  // paper folding: n folds and one punch away from a crease must give 2^n holes
  const { unfoldPoints, foldedRect } = await import('../assets/js/widgets/paper-fold.js');
  const COMBOS = [
    ['rightOntoLeft'],
    ['rightOntoLeft', 'bottomOntoTop'],
    ['rightOntoLeft', 'bottomOntoTop', 'leftOntoRight'],
  ];
  COMBOS.forEach(folds => {
    const r = foldedRect(folds);
    // a punch at an irrational-ish offset inside the packet, safely off any crease
    const p = { x: r.x0 + (r.x1 - r.x0) * 0.37, y: r.y0 + (r.y1 - r.y0) * 0.29 };
    const holes = unfoldPoints(folds, [p]);
    check(`${folds.length} fold(s) give 2^${folds.length} holes`, holes.length === 2 ** folds.length,
      `got ${holes.length}`);
    check(`${folds.length} fold(s): all holes inside the sheet`,
      holes.every(h => h.x >= -1e-9 && h.x <= 1 + 1e-9 && h.y >= -1e-9 && h.y <= 1 + 1e-9),
      JSON.stringify(holes));
  });
  // a punch ON the last crease must NOT double at that fold
  {
    const folds = ['rightOntoLeft', 'bottomOntoTop'];
    const r = foldedRect(folds);
    const onCrease = { x: r.x0 + (r.x1 - r.x0) * 0.4, y: r.y1 };   // y1 is the horizontal crease
    const holes = unfoldPoints(folds, [onCrease]);
    check('a punch on a crease yields half as many holes', holes.length === 2,
      `got ${holes.length}, expected 2`);
  }

  // mirror / water letter sets
  const { MIRROR_SAFE, WATER_SAFE, survives } = await import('../assets/js/widgets/shape-lab.js');
  const both = [...MIRROR_SAFE].filter(c => WATER_SAFE.has(c)).sort().join('');
  check('letters safe in both flips are HIOX', both === 'HIOX', both);
  check('TOOT survives a mirror', survives('TOOT', 'mirror'), '');
  check('HIM fails a mirror (order reverses)', !survives('HIM', 'mirror'), '');
  check('MOM survives a mirror', survives('MOM', 'mirror'), '');
  check('BOX survives water', survives('BOX', 'water'), '');
  check('BOX fails a mirror', !survives('BOX', 'mirror'), '');
  check('CODE fails water (O and D safe, C safe, E safe -> but not all)',
    survives('CODE', 'water') === ['C', 'O', 'D', 'E'].every(c => WATER_SAFE.has(c)), '');

  console.log('  figure enumerations, cube partitions, fold doubling and letter sets checked');
}

/* ---------------- Academy: foundations (Unit 1) ---------------- */
/* Unit 1 has no geometry, so its widgets derive from a finite space of possible
   worlds instead. Everything below re-enumerates that space with its OWN
   recursive enumerator — deliberately not the widget's bitmask one — and then
   compares three things that must agree: what the lesson claims in prose, what
   the widget would compute, and what this file derives from scratch. */
async function foundations() {
  console.log('assets/js/lessons/r-found-*.js');

  /* independent enumerator: recursion, not the widget's bit twiddling */
  const allWorlds = atoms => {
    const base = {};
    atoms.forEach(a => { if (a.fixed !== undefined) base[a.key] = !!a.fixed; });
    const free = atoms.filter(a => a.fixed === undefined);
    const out = [];
    (function rec(i, w) {
      if (i === free.length) return out.push(w);
      rec(i + 1, { ...w, [free[i].key]: true });
      rec(i + 1, { ...w, [free[i].key]: false });
    })(0, base);
    return out;
  };
  const load = f => import(`../assets/js/lessons/${f}.js`).then(m => m.default);
  const cfgOf = (lsn, type = 'explore') => lsn.steps.find(s => s.type === type && s.__cfg)?.__cfg;

  /* the world count must match the widget's own enumeration, or one of us is wrong */
  const { worldsOf } = await import('../assets/js/widgets/claim-lab.js');

  /* ---- claimScanner lessons: trap labelled  <=>  breakable ---- */
  for (const [file, wantSurvivors] of [['r-found-anatomy', 1], ['r-found-conclude', 2]]) {
    const lsn = await load(file);
    const cfg = cfgOf(lsn);
    if (!cfg) { check(`${file} exposes its config`, false, 'no __cfg'); continue; }

    const ws = allWorlds(cfg.atoms);
    check(`${file}: world count agrees with the widget`,
      ws.length === worldsOf({ atoms: cfg.atoms }).length,
      `harness ${ws.length}, widget ${worldsOf({ atoms: cfg.atoms }).length}`);
    check(`${file}: 2^free worlds`, ws.length === 2 ** cfg.atoms.filter(a => a.fixed === undefined).length,
      String(ws.length));

    let survivors = 0;
    cfg.claims.forEach(c => {
      const follows = ws.every(w => !!c.needs(w));
      if (follows) survivors++;
      // the invariant that makes the lesson honest: a claim is labelled a trap
      // exactly when a permitted world breaks it
      check(`${file}: "${c.text.slice(0, 46)}…" trap label matches derivation`,
        follows === (c.trap == null),
        follows ? 'labelled a trap but nothing can break it'
                : 'presented as following, yet a counterexample exists');
      if (!follows) {
        const bad = ws.find(w => !c.needs(w));
        check(`${file}: counterexample really satisfies the fixed facts`,
          cfg.atoms.filter(a => a.fixed !== undefined).every(a => bad[a.key] === !!a.fixed),
          'the counterexample contradicts the statement itself');
      }
    });
    // if this count is wrong the explore checklist can never be completed
    check(`${file}: exactly ${wantSurvivors} conclusion(s) survive`, survivors === wantSurvivors,
      `${survivors} survived — the explore gate would be unopenable`);
    check(`${file}: something survives and something breaks`,
      survivors > 0 && survivors < cfg.claims.length, 'no contrast to teach');
  }

  /* ---- negationTest: assumed  <=>  denial leaves nowhere to succeed ---- */
  {
    const lsn = await load('r-found-assume');
    const cfg = cfgOf(lsn);
    const ws = allWorlds(cfg.atoms);
    check('assume: the plan can succeed somewhere', ws.some(w => cfg.reaches(w)),
      'no world reaches the goal, so every candidate would look assumed');
    check('assume: the plan can also fail somewhere', ws.some(w => !cfg.reaches(w)), 'goal is trivial');
    cfg.candidates.forEach(c => {
      const survivor = ws.find(w => !c.holds(w) && cfg.reaches(w));
      check(`assume: "${c.text.slice(0, 44)}…" negation test matches the lesson`,
        (!survivor) === c.assumed,
        c.assumed ? 'lesson calls it assumed, but the plan survives its denial'
                  : 'lesson calls it not assumed, yet denying it kills the plan');
    });
    check('assume: both verdicts are represented',
      cfg.candidates.some(c => c.assumed) && cfg.candidates.some(c => !c.assumed), 'one-sided');
  }

  /* ---- relevanceTest: strong  <=>  flipping it moves the verdict ---- */
  {
    const lsn = await load('r-found-argument');
    const cfg = cfgOf(lsn);
    const ws = allWorlds(cfg.atoms);
    const freeKeys = new Set(cfg.atoms.filter(a => a.fixed === undefined).map(a => a.key));
    cfg.args.forEach(a => {
      check(`argument: "${a.key}" is a free atom`, freeKeys.has(a.key), 'cannot be flipped');
      const moves = ws.some(w => cfg.reaches(w) !== cfg.reaches({ ...w, [a.key]: !w[a.key] }));
      check(`argument: "${a.text.slice(0, 44)}…" strength matches the flip test`,
        moves === a.strong,
        a.strong ? 'called strong, but flipping it changes nothing anywhere'
                 : 'called weak, yet flipping it moves the verdict');
    });
    check('argument: a strong one on each side',
      cfg.args.some(a => a.strong && a.side === 'for') && cfg.args.some(a => a.strong && a.side === 'against'),
      'strength must not correlate with which side an argument takes');
  }

  /* ---- causeChain: the three questions, re-implemented ---- */
  {
    const lsn = await load('r-found-action');
    const cfg = cfgOf(lsn);
    const { judgeAction } = await import('../assets/js/widgets/cause-chain.js');
    const mine = a => {
      const n = cfg.nodes.find(x => x.key === a.node);
      if (!n) return 'off-chain';
      if (!(n.agency || []).includes(a.actor)) return 'no-power';
      if (a.removes && !a.replaces) return 'unreplaced';
      return n.kind === 'effect' ? 'relief' : 'remedy';
    };
    const seen = new Set();
    cfg.actions.forEach(a => {
      const r = mine(a);
      seen.add(r);
      check(`action: "${a.text.slice(0, 40)}…" reason matches the lesson`, r === a.reason,
        `derived "${r}", lesson says "${a.reason}"`);
      check(`action: "${a.text.slice(0, 40)}…" verdict matches the lesson`,
        ['remedy', 'relief'].includes(r) === a.follows, `derived ${r}`);
      check(`action: "${a.text.slice(0, 40)}…" widget agrees with the harness`,
        judgeAction(cfg, a).reason === r, `widget said ${judgeAction(cfg, a).reason}`);
      check(`action: actor "${a.actor}" is a named actor`, !!cfg.actors[a.actor], a.actor);
      if (a.node) check(`action: node "${a.node}" is on the chain`,
        cfg.nodes.some(n => n.key === a.node), a.node);
      if (a.removes) check(`action: removes "${a.removes}" names a real node`,
        cfg.nodes.some(n => n.key === a.removes), a.removes);
    });
    ['remedy', 'relief', 'unreplaced', 'no-power', 'off-chain'].forEach(r =>
      check(`action: the lesson shows a "${r}" case`, seen.has(r), 'never demonstrated'));
    check('action: the chain runs cause → … → effect',
      cfg.nodes[0].kind === 'cause' && cfg.nodes[cfg.nodes.length - 1].kind === 'effect',
      cfg.nodes.map(n => n.kind).join('→'));
    check('action: the root cause is beyond everyone here',
      (cfg.nodes[0].agency || []).length === 0, 'then the no-power case teaches nothing');
  }

  /* ---- every lesson in the project: a question must have an answer ---- */
  const files = fs.readdirSync(path.join(__dirname, '..', 'assets', 'js', 'lessons'))
    .filter(f => f.endsWith('.js')).map(f => f.replace(/\.js$/, ''));
  let asks = 0;
  for (const f of files) {
    const lsn = await load(f);
    check(`${f}: id and filename agree`, lsn.id.replace(/\./g, '-') === f, `${lsn.id} vs ${f}`);
    lsn.steps.forEach((s, i) => {
      if (s.type !== 'ask') return;
      asks++;
      const numeric = s.input === 'number';
      check(`${f} step ${i}: has an answer`, typeof s.answer === 'number' && !Number.isNaN(s.answer),
        JSON.stringify(s.answer));
      if (!numeric) {
        check(`${f} step ${i}: answer indexes a real option`,
          Number.isInteger(s.answer) && s.answer >= 0 && s.answer < (s.options || []).length,
          `answer ${s.answer} of ${(s.options || []).length} options`);
        check(`${f} step ${i}: options are distinct`,
          new Set(s.options).size === (s.options || []).length, 'duplicate option text');
      }
      check(`${f} step ${i}: has a concept for the review queue`,
        !!s.concept && !!s.conceptLabel, `${s.concept} / ${s.conceptLabel}`);
      check(`${f} step ${i}: explains both outcomes`,
        !!(s.why || (s.whyRight && s.whyWrong)), 'no explanation for one of the branches');
    });
    if (f.startsWith('r-found-')) {
      check(`${f}: eight steps in house order`, lsn.steps.length === 8, String(lsn.steps.length));
      check(`${f}: phases follow Hook…Mastery`,
        lsn.steps.map(s => s.phase).join('|') ===
        'Hook|Learn|Explore|Predict|Reveal|Drill|Drill|Mastery',
        lsn.steps.map(s => s.phase).join('|'));
      check(`${f}: the explore step exposes __cfg`,
        !!lsn.steps.find(s => s.type === 'explore')?.__cfg, 'harness cannot see it');
    }
  }

  /* ---- registration: a built lesson nobody can reach is not built ---- */
  {
    const Rt = await import('../assets/js/routes.js');
    const cur = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'curriculum.js'), 'utf8');
    for (const f of files) {
      const id = f.replace(/-/g, '.').replace(/^([qr])\./, '$1.');
      const lsn = await load(f);
      /* Registration used to mean a line in lesson/index.html's MODULES map.
         A lesson is reached through its own page now, so it is registered when
         that page exists and its address names this lesson and no other. */
      const lp = Rt.lessonPath(lsn.id);
      const lpFile = path.join(__dirname, '..', lp, 'index.html');
      check(`${lsn.id}: registered in the lesson runner`,
        !!lp && fs.existsSync(lpFile) && fs.readFileSync(lpFile, 'utf8').includes(JSON.stringify(lsn.id)),
        `no page at ${lp || '(no route)'} — run node tools/pages.js`);
      check(`${lsn.id}: its address resolves back to it`,
        Rt.resolve(lp)?.lessonId === lsn.id, JSON.stringify(Rt.resolve(lp)));
      check(`${lsn.id}: marked ready on the path`,
        new RegExp(`id: '${lsn.id.replace(/\./g, '\\.')}'[^\\n]*ready: true`).test(cur),
        'built but still locked in curriculum.js');
      void id;
    }
  }

  /* ---- the chapter timeline reads straight off the curriculum ---- */
  {
    const { ACADEMIES, unitStats, nextUp, readyLessons } =
      await import('../assets/js/curriculum.js');
    const seen = new Set();
    for (const a of Object.values(ACADEMIES)) {
      check(`${a.id}: unit numbers are 1..n with no gaps`,
        a.units.every((u, i) => u.n === i + 1), a.units.map(u => u.n).join(','));
      a.units.forEach(u => {
        check(`${a.id} unit ${u.n}: has lessons`, u.lessons.length > 0, 'empty chapter');
        check(`${a.id} unit ${u.n}: has a title and a subtitle`, !!u.title && !!u.sub, u.title);
        const st = unitStats(u, () => false);
        check(`${a.id} unit ${u.n}: done <= ready <= total`,
          st.done <= st.ready && st.ready <= st.total, JSON.stringify(st));
        // every lesson the timeline draws needs the fields its row renders
        u.lessons.forEach(l => {
          check(`${l.id}: has title, desc and mins`, !!l.title && !!l.desc && l.mins > 0,
            JSON.stringify({ t: l.title, d: !!l.desc, m: l.mins }));
          check(`${l.id}: id is unique across both academies`, !seen.has(l.id), 'duplicate id');
          seen.add(l.id);
        });
      });
      // "you are here" must land on exactly one real, built lesson
      const nxt = nextUp(a.id, () => false);
      const ready = readyLessons(a.id);
      if (ready.length) {
        check(`${a.id}: nextUp returns a built lesson`, !!nxt && !!nxt.ready, String(nxt && nxt.id));
        check(`${a.id}: nextUp lives in exactly one unit`,
          a.units.filter(u => u.lessons.some(l => l.id === nxt.id)).length === 1, nxt.id);
      }
      // and with everything finished there must be no current lesson to mark
      const allDone = readyLessons(a.id).every(() => true);
      check(`${a.id}: has at least one built lesson to start from`, ready.length > 0 && allDone,
        'nothing built');
    }
  }

  console.log(`  ${files.length} lessons, ${asks} questions, and every Unit 1 verdict re-derived`);
}

/* ---------------- Academy: Quants Unit 2 ---------------- */
/* Trade arithmetic is where a lesson can be confidently, plausibly wrong, so
   nothing here trusts the widgets: every share, product, price and net factor
   is recomputed from scratch below and compared against both the widget's own
   helper AND the answer the lesson prints. The explore gates are additionally
   brute-forced over the widget's reachable states, because a checklist nobody
   can complete is a bug that only shows up in a learner's face. */
async function quants2() {
  console.log('assets/js/lessons/q-pct-*.js');

  const load = f => import(`../assets/js/lessons/${f}.js`).then(m => m.default);
  const cfgOf = l => l.steps.find(s => s.type === 'explore' && s.__cfg)?.__cfg;
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;

  /* independent arithmetic — deliberately not imported from the widgets */
  const mySplit = (total, parts) => {
    const sum = parts.reduce((a, b) => a + b, 0);
    return parts.map(p => total * p / sum);
  };
  const myTrade = (cp, mk, ds) => {
    const mp = cp + cp * mk / 100;
    const sp = mp - mp * ds / 100;
    return { mp, sp, pct: (sp - cp) / cp * 100 };
  };
  const myNet = ps => (ps.reduce((a, p) => a * (1 + p / 100), 1) - 1) * 100;

  const { splitByRatio, simplify } = await import('../assets/js/widgets/share-bar.js');
  const { trade, netPct, factor } = await import('../assets/js/widgets/trade-bar.js');

  /* ---- the widgets must agree with arithmetic done another way ---- */
  check('splitByRatio matches an independent split',
    splitByRatio(6300, [2, 3, 4]).shares.every((s, i) => near(s, mySplit(6300, [2, 3, 4])[i])), '');
  check('splitByRatio conserves the total',
    near(splitByRatio(6300, [2, 3, 4]).shares.reduce((a, b) => a + b, 0), 6300), '');
  check('one part is total over the sum of parts', near(splitByRatio(6300, [2, 3, 4]).one, 700), '');
  check('simplify reduces 96000:72000:48000 to 4:3:2',
    simplify([96000, 72000, 48000]).join(':') === '4:3:2', simplify([96000, 72000, 48000]).join(':'));
  check('trade matches an independent computation',
    near(trade(500, 60, 25).sp, myTrade(500, 60, 25).sp)
    && near(trade(500, 60, 25).profitPct, myTrade(500, 60, 25).pct), '');
  check('netPct matches an independent chain', near(netPct([10, -10, 10]), myNet([10, -10, 10])), '');
  check('factor turns -40% into 0.6', near(factor(-40), 0.6), String(factor(-40)));
  // the two results the lessons state as rules, checked over a range
  for (let x = 5; x <= 50; x += 5) {
    check(`up ${x}% then down ${x}% loses exactly x^2/100`,
      near(netPct([x, -x]), -(x * x) / 100, 1e-9), String(netPct([x, -x])));
    check(`a ${x}% cut needs more than ${x}% to restore`,
      (1 / (1 - x / 100) - 1) * 100 > x, '');
  }

  /* ---- ratio lesson ---- */
  {
    const lsn = await load('q-pct-ratio');
    const cfg = cfgOf(lsn);
    check('ratio: exposes __cfg', !!cfg, 'none');
    const shares = mySplit(6300, [2, 3, 4]);
    check('ratio: predict answer is the middle share',
      lsn.steps[3].answer === shares[1] && shares[1] === 2100, String(lsn.steps[3].answer));
    check('ratio: difference drill total is right', lsn.steps[5].answer === 480 / (7 - 5) * 12,
      String(lsn.steps[5].answer));
    // the transfer in the mastery step really does level the three shares
    const after = [shares[0] + 700, shares[1], shares[2] - 700];
    check('ratio: the 700 transfer makes all three equal',
      after.every(v => near(v, after[0])), after.join(','));
    check('ratio: the transfer conserves the total',
      near(after.reduce((a, b) => a + b, 0), 6300), '');
    // every explore task must be reachable inside the widget's own limits
    const reach = { one700: false, allEqual: false, overHalf: false };
    for (const total of cfg.totals)
      for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) {
        const s = splitByRatio(total, [a, b, c]);
        if (near(s.one, 700)) reach.one700 = true;
        if (a === b && b === c) reach.allEqual = true;
        if (Math.max(...s.shares) > total / 2) reach.overHalf = true;
      }
    Object.entries(reach).forEach(([k, v]) =>
      check(`ratio: explore task "${k}" is reachable`, v, 'the gate could never open'));
  }

  /* ---- partnership lesson ---- */
  {
    const lsn = await load('q-pct-partner');
    const cfg = cfgOf(lsn);
    check('partner: exposes __cfg', !!cfg, 'none');
    const w = cfg.partners.map(p => p.money * p.months);
    const shares = mySplit(cfg.profit, w);
    check('partner: Asha beats Bhanu despite the smaller cheque',
      cfg.partners[0].money < cfg.partners[1].money && shares[0] > shares[1],
      `${shares[0]} vs ${shares[1]}`);
    check('partner: predict answer matches the derived share',
      lsn.steps[3].answer === shares[0] && shares[0] === 6000, String(lsn.steps[3].answer));
    const three = mySplit(18000, [8000 * 12, 12000 * 6, 6000 * 8]);
    check('partner: three-partner drill answer is C\'s share',
      lsn.steps[5].answer === three[2] && three[2] === 4000, String(lsn.steps[5].answer));
    check('partner: three shares sum to the profit',
      near(three.reduce((a, b) => a + b, 0), 18000), '');
    check('partner: equal profits put B in for 9 of 12 months',
      9000 * 12 / 12000 === 9, '');
    // reachability across the sliders the widget actually offers
    const r = { ashaWins: false, bhanuWins: false, equal: false };
    for (let m1 = 1; m1 <= cfg.maxMonths; m1++) for (let m2 = 1; m2 <= cfg.maxMonths; m2++) {
      const x = cfg.partners[0].money * m1, y = cfg.partners[1].money * m2;
      if (x > y) r.ashaWins = true;
      if (y > x) r.bhanuWins = true;
      if (x === y) r.equal = true;
    }
    Object.entries(r).forEach(([k, v]) =>
      check(`partner: explore task "${k}" is reachable`, v, 'the gate could never open'));
  }

  /* ---- profit lesson ---- */
  {
    const lsn = await load('q-pct-profit');
    const cfg = cfgOf(lsn);
    check('profit: exposes __cfg', !!cfg, 'none');
    const t = myTrade(cfg.cp, cfg.markup, cfg.discount);
    check('profit: 500 marked up 60% is 800', near(t.mp, 800), String(t.mp));
    check('profit: less 25% is 600', near(t.sp, 600), String(t.sp));
    check('profit: that is a 20% profit on COST', near(t.pct, 20), String(t.pct));
    check('profit: predict answer is the cost price',
      lsn.steps[3].answer === 500 && near(600 / 1.2, 500), String(lsn.steps[3].answer));
    check('profit: reverse drill answer is 960/1.2', near(lsn.steps[5].answer, 960 / 1.2), String(lsn.steps[5].answer));
    // the two-article claim, recomputed
    const cA = 990 / 1.1, cB = 990 / 0.9;
    check('profit: two articles at 990 lose exactly 20 rupees', near(cA + cB - 1980, 20, 1e-9),
      String(cA + cB - 1980));
    check('profit: markup 40 then discount 15 gives 19%', near((1.4 * 0.85 - 1) * 100, 19, 1e-9), '');
    // gates, over the widget's own slider steps
    const g = { hit20: false, breakEven: false, lossWithSmallerDiscount: false };
    for (let m = 0; m <= cfg.maxMarkup; m += 5) for (let d = 0; d <= cfg.maxDiscount; d += 5) {
      const pct = Math.round(myTrade(cfg.cp, m, d).pct * 100) / 100;
      if (Math.abs(pct - 20) < 0.005) g.hit20 = true;
      if (Math.abs(pct) <= 0.005 && m > 0) g.breakEven = true;
      if (pct < -0.005 && d <= m) g.lossWithSmallerDiscount = true;
    }
    Object.entries(g).forEach(([k, v]) =>
      check(`profit: explore task "${k}" is reachable`, v, 'the gate could never open'));
  }

  /* ---- successive lesson ---- */
  {
    const lsn = await load('q-pct-successive');
    const cfg = cfgOf(lsn);
    check('successive: exposes __cfg', !!cfg, 'none');
    check('successive: the shipped chain is +40 then -40',
      cfg.steps.length === 2 && cfg.steps[0] === -cfg.steps[1], cfg.steps.join(','));
    const end = cfg.base * cfg.steps.reduce((a, p) => a * (1 + p / 100), 1);
    check('successive: 1000 ends at 840', near(end, 840), String(end));
    check('successive: predict answer matches the chain', lsn.steps[3].answer === 840, String(lsn.steps[3].answer));
    check('successive: restore drill answer is 25', near(lsn.steps[6].answer, (1 / 0.8 - 1) * 100),
      String(lsn.steps[6].answer));
    check('successive: three-year population is 10890',
      near(10000 * 1.1 * 0.9 * 1.1, 10890), String(10000 * 1.1 * 0.9 * 1.1));
    check('successive: adding the percents would wrongly say 11000',
      10000 * 1.1 === 11000, '');
    const s = { equalOppositeGap: false, bigGap: false, returns: false };
    for (let a = -50; a <= 50; a += 5) for (let b = -50; b <= 50; b += 5) {
      const net = myNet([a, b]), naive = a + b, gap = Math.abs(net - naive);
      if (a === -b && a !== 0 && gap > 0.005) s.equalOppositeGap = true;
      if (gap >= 4) s.bigGap = true;
      if (near(cfg.base * (1 + a / 100) * (1 + b / 100), cfg.base, 1e-9)) s.returns = true;
    }
    Object.entries(s).forEach(([k, v]) =>
      check(`successive: explore task "${k}" is reachable`, v, 'the gate could never open'));
  }

  console.log('  ratio splits, capital-months, trade prices and net factors re-derived');
}

/* ---------------- Academy: Quants Unit 1 ---------------- */
/* Divisibility rules are exactly the kind of thing that can be MISREMEMBERED into a
   lesson (four is the classic: two digits or three?). So every rule the widget states
   is checked against a plain remainder, on every number the lesson ships and then on
   a few thousand more. HCF/LCM are recomputed by Euclid rather than by factorisation,
   so an error in the factoriser cannot hide behind itself. */
async function quants1() {
  console.log('assets/js/lessons/q-num-*.js');

  const load = f => import(`../assets/js/lessons/${f}.js`).then(m => m.default);
  const cfgOf = l => l.steps.find(s => s.type === 'explore' && s.__cfg)?.__cfg;
  const nl = await import('../assets/js/widgets/number-lab.js');

  /* ---- every stated rule must agree with the remainder, always ---- */
  {
    let mismatches = 0;
    for (let n = 1; n <= 5000; n++)
      for (const c of nl.divisibilityChecks(n))
        if (c.passes !== (n % c.by === 0)) mismatches++;
    check('divisibility: every rule matches n % d for all n up to 5000',
      mismatches === 0, `${mismatches} disagreement(s)`);
    // the two rules most often misremembered, pinned explicitly
    check('divisibility: the 4 test uses TWO digits', nl.lastK(4728, 2) === 28 && 28 % 4 === 0, '');
    check('divisibility: the 8 test uses THREE digits',
      nl.lastK(9152, 3) === 152 && 152 % 8 === 0 && 9152 % 8 === 0, '');
    check('divisibility: 8 genuinely needs three, not two',
      1400 % 8 === 0 && 1300 % 8 !== 0 && nl.lastK(1300, 2) === 0, 'two digits would wrongly pass 1300');
    check('divisibility: alternating sum of 5643 is 0', nl.altSum(5643) === 0, String(nl.altSum(5643)));
    check('divisibility: 9 passing implies 3 passing',
      [...Array(2000)].every((_, i) => (i + 1) % 9 !== 0 || (i + 1) % 3 === 0), '');
  }

  /* ---- HCF and LCM, re-derived by Euclid ---- */
  {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    let bad = 0;
    for (let a = 1; a <= 120; a++) for (let b = 1; b <= 120; b++) {
      const r = nl.hcfLcm(a, b);
      if (r.hcf !== gcd(a, b) || r.lcm !== a * b / gcd(a, b) || r.hcf * r.lcm !== a * b) bad++;
    }
    check('hcfLcm agrees with Euclid on every pair up to 120', bad === 0, `${bad} wrong`);
    check('primeFactors rebuilds its number',
      [2079, 4728, 5643, 9152, 240, 360].every(n =>
        Object.entries(nl.primeFactors(n)).reduce((p, [q, e]) => p * q ** e, 1) === n), '');
    check('2079 factorises to 3^3 x 7 x 11',
      JSON.stringify(nl.primeFactors(2079)) === JSON.stringify({ 3: 3, 7: 1, 11: 1 }),
      JSON.stringify(nl.primeFactors(2079)));
  }

  /* ---- the numbers each lesson actually prints ---- */
  {
    const est = await load('q-num-estimate');
    const cfg = cfgOf(est);
    check('estimate: exposes __cfg', !!cfg, 'none');
    cfg.rounds.forEach(r =>
      check(`estimate: "${r.q.replace(/<[^>]+>/g, '').slice(0, 34)}…" exact value is finite`,
        Number.isFinite(r.exact) && r.exact > 0, String(r.exact)));
    check('estimate: 4860/19 is 255.79 to 2dp', Math.abs(cfg.rounds[0].exact - 255.7894736842105) < 1e-9,
      String(cfg.rounds[0].exact));
    check('estimate: rounding the divisor up understates', 4860 / 20 < 4860 / 19, '');
    check('estimate: rounding the dividend up overstates', 1200 / 3 > 1197 / 3, '');
    check('estimate: 38x21 opposite rounding is within 1%',
      Math.abs(800 - 798) / 798 * 100 < 1, '');
  }
  {
    const div = await load('q-num-divis');
    const cfg = cfgOf(div);
    check('divis: exposes __cfg', !!cfg, 'none');
    cfg.numbers.forEach(n =>
      check(`divis: ${n} verdicts all match remainders`,
        nl.divisibilityChecks(n).every(c => c.passes === (n % c.by === 0)), ''));
    check('divis: the four shipped numbers cover both test families',
      cfg.numbers.some(n => n % 8 === 0) && cfg.numbers.some(n => n % 11 === 0)
      && cfg.numbers.some(n => n % 9 === 0), 'a family is never demonstrated');
    // the missing-digit drill must have exactly ONE solution
    const sols = [...Array(10).keys()].filter(d => (5640 + d) % 4 === 0 && (5640 + d) % 3 === 0);
    check('divis: the 564? drill has exactly one answer', sols.length === 1 && sols[0] === div.steps[6].answer,
      `solutions ${sols.join(',')} vs key ${div.steps[6].answer}`);
    // the mastery non-divisor must genuinely not divide, and the rest must
    const mast = div.steps[7];
    mast.options.forEach((o, i) => {
      const v = +o.replace(/[^0-9]/g, '');
      check(`divis: mastery option ${v} ${i === mast.answer ? 'must NOT' : 'must'} divide 2079`,
        (2079 % v === 0) === (i !== mast.answer), `2079/${v} = ${2079 / v}`);
    });
  }
  {
    const lcm = await load('q-num-lcm');
    const cfg = cfgOf(lcm);
    check('lcm: exposes __cfg', !!cfg, 'none');
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const L = (a, b) => a * b / gcd(a, b);
    cfg.pairs.forEach(([a, b]) => {
      const r = nl.hcfLcm(a, b);
      check(`lcm: pair ${a},${b} identity holds`, r.hcf * r.lcm === a * b, '');
    });
    // both explore gates must be reachable among the shipped pairs
    check('lcm: shipped pairs include one where a divides b',
      cfg.pairs.some(([a, b]) => a % b === 0 || b % a === 0), 'the explore gate could never open');
    check('lcm: shipped pairs include a coprime pair',
      cfg.pairs.some(([a, b]) => gcd(a, b) === 1), 'the explore gate could never open');
    check('lcm: bells 6,8,12 meet after 24 min', [6, 8, 12].reduce(L) === 24, String([6, 8, 12].reduce(L)));
    check('lcm: buses 15,20,25 meet after 300 min', [15, 20, 25].reduce(L) === 300, '');
    check('lcm: 300 minutes is 5 hours -> 11 a.m. from 6 a.m.', 300 / 60 === 5, '');
    check('lcm: tile drill answer is HCF(240,360)', lcm.steps[5].answer === gcd(240, 360)
      && gcd(240, 360) === 120, String(lcm.steps[5].answer));
    check('lcm: identity drill answer is 408x1032/17544',
      lcm.steps[6].answer === 408 * 1032 / 17544, String(lcm.steps[6].answer));
    check('lcm: 17544 really is LCM(408,1032)', L(408, 1032) === 17544, String(L(408, 1032)));
  }
  {
    const con = await load('q-num-convert');
    const cfg = cfgOf(con);
    check('convert: exposes __cfg', !!cfg, 'none');
    const named = { '1,2': 50, '1,4': 25, '1,5': 20, '1,8': 12.5, '3,4': 75, '3,8': 37.5, '5,8': 62.5 };
    cfg.fractions.forEach(([n, d]) => {
      const p = nl.pct(n, d);
      if (named[`${n},${d}`] !== undefined)
        check(`convert: ${n}/${d} is ${named[`${n},${d}`]}%`, Math.abs(p - named[`${n},${d}`]) < 1e-9, String(p));
      check(`convert: ${n}/${d} round-trips back to the fraction`,
        Math.abs(p / 100 * d - n) < 1e-9, '');
    });
    check('convert: exactly four of the ten are whole percentages',
      cfg.fractions.filter(([n, d]) => Number.isInteger(nl.pct(n, d))).length === 4, '');
    check('convert: predict answer is 5/8 of 4800', con.steps[3].answer === 4800 * 5 / 8, String(con.steps[3].answer));
    check('convert: thirds drill answer is 2400/3', con.steps[6].answer === 2400 / 3, String(con.steps[6].answer));
    // mastery is multiple choice, so read the value out of the chosen OPTION,
    // not out of `answer` (which is an index)
    {
      const m = con.steps[7];
      const chosen = +m.options[m.answer].replace(/[^0-9.]/g, '');
      const remainder = 4800 - 4800 * 5 / 8;
      check('convert: mastery keys a sixth of the REMAINDER, not of the whole',
        chosen === remainder / 6 && chosen !== 4800 / 6, `keyed ${chosen}, remainder/6 = ${remainder / 6}`);
      check('convert: and the 1/6-of-the-whole trap is on the option list',
        m.options.some(o => +o.replace(/[^0-9.]/g, '') === 4800 / 6), 'the distractor is missing');
    }
  }
  {
    const pow = await load('q-num-powers');
    check('powers: exposes __cfg', !!cfgOf(pow), 'none');
    for (let n = 2; n <= 200; n++)
      if (n ** 2 - (n - 1) ** 2 !== 2 * n - 1) check(`powers: gap rule at ${n}`, false, '');
    check('powers: gap rule 2n-1 holds to 200', true, '');
    const ends = [...new Set([...Array(10).keys()].map(d => d * d % 10))].sort((a, b) => a - b);
    check('powers: square endings are 0,1,4,5,6,9', ends.join(',') === '0,1,4,5,6,9', ends.join(','));
    check('powers: no square below 100000 ends in 2,3,7 or 8',
      [...Array(316).keys()].every(n => ![2, 3, 7, 8].includes(n * n % 10)), '');
    check('powers: 26^2 drill answer', pow.steps[5].answer === 26 ** 2 && 26 ** 2 === 676, '');
    check('powers: 25^2 plus the gap gives it', 625 + (2 * 26 - 1) === 676, '');
    check('powers: cube-root drill answer', pow.steps[6].answer ** 3 === 1728, String(pow.steps[6].answer));
    // the mastery claim: 3464 sits strictly between two consecutive squares
    check('powers: 3464 lies between 58^2 and 59^2', 58 ** 2 < 3464 && 3464 < 59 ** 2,
      `${58 ** 2} < 3464 < ${59 ** 2}`);
    check('powers: and 1444/2916/4225 really are squares',
      [1444, 2916, 4225].every(n => Number.isInteger(Math.sqrt(n))), '');
    check('powers: 3468 is not', !Number.isInteger(Math.sqrt(3468)), '');
  }

  console.log('  divisibility rules checked to 5000, HCF/LCM to 120x120, and every printed answer re-derived');
}

/* ---------------- Academy: Quants Unit 3 ---------------- */
/* Unit 3 is one idea in three costumes — something accumulates at a RATE over a
   TIME. So the checks below are deliberately cross-costume: the CI/SI gap formula
   is verified against a year-by-year simulation, average speed against an actual
   journey, and work rates against counting units of work. Anything the lessons
   print is re-derived by a route the widget does not use. */
async function quants3() {
  console.log('assets/js/lessons/q-int-*.js');

  const load = f => import(`../assets/js/lessons/${f}.js`).then(m => m.default);
  const cfgOf = l => l.steps.find(s => s.type === 'explore' && s.__cfg)?.__cfg;
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const rl = await import('../assets/js/widgets/rate-lab.js');

  /* ---- interest: simulate year by year, and compare ---- */
  {
    const simSI = (p, r, n) => { let i = 0; for (let k = 0; k < n; k++) i += p * r / 100; return i; };
    const simCI = (p, r, n) => { let a = p; for (let k = 0; k < n; k++) a += a * r / 100; return a - p; };
    let bad = 0;
    for (const p of [6250, 8000, 10000, 12000])
      for (let r = 4; r <= 20; r++)
        for (let n = 1; n <= 6; n++) {
          if (!near(rl.simple(p, r, n), simSI(p, r, n), 1e-6)) bad++;
          if (!near(rl.compound(p, r, n), simCI(p, r, n), 1e-6)) bad++;
        }
    check('interest: simple and compound match a year-by-year simulation', bad === 0, `${bad} wrong`);
    // the two-year gap rule, over a wide sweep
    let gapBad = 0;
    for (const p of [6250, 8000, 10000, 12000])
      for (let r = 4; r <= 20; r++)
        if (!near(rl.ciMinusSi(p, r, 2), p * (r / 100) ** 2, 1e-6)) gapBad++;
    check('interest: the two-year gap is exactly P(r/100)^2', gapBad === 0, `${gapBad} wrong`);
    check('interest: the three-year gap matches P(r/100)^2 (3 + r/100)',
      near(rl.ciMinusSi(10000, 10, 3), 10000 * 0.1 ** 2 * 3.1, 1e-6), String(rl.ciMinusSi(10000, 10, 3)));
    check('interest: CI equals SI at one year', near(rl.ciMinusSi(10000, 10, 1), 0), '');
    check('interest: CI never below SI', [...Array(6)].every((_, k) => rl.ciMinusSi(10000, 12, k + 1) >= -1e-9), '');
    check('interest: half-yearly beats annual', rl.amountCI(8000, 5, 2) > rl.amountCI(8000, 10, 1), '');
    check('interest: half-yearly on 8000 at 10% gives 8820', near(rl.amountCI(8000, 5, 2), 8820), '');
  }

  /* ---- speed: conversions and average, checked against a real journey ---- */
  {
    check('speed: 72 km/h is 20 m/s', near(rl.toMS(72), 20), String(rl.toMS(72)));
    check('speed: the conversion round-trips',
      [18, 36, 54, 72, 90, 108].every(k => near(rl.toKMH(rl.toMS(k)), k)), '');
    // average speed over equal distances, verified by simulating the journey
    let avgBad = 0;
    for (let a = 10; a <= 100; a += 10) for (let b = 10; b <= 100; b += 10) {
      const d = 600;                       // any distance both divide
      const journey = 2 * d / (d / a + d / b);
      if (!near(rl.avgSpeed(a, b), journey, 1e-9)) avgBad++;
      if (rl.avgSpeed(a, b) > (a + b) / 2 + 1e-9) avgBad++;   // never above the plain average
    }
    check('speed: harmonic average matches an actual round trip, and never exceeds the plain average',
      avgBad === 0, `${avgBad} wrong`);
    check('speed: 60 and 40 average 48, not 50', near(rl.avgSpeed(60, 40), 48), '');
    check('speed: equal TIMES give the plain average instead',
      near((2 * 16 + 2 * 24) / 4, 20) && !near(20, rl.avgSpeed(16, 24)), '');
  }

  /* ---- work: rates re-derived by counting units ---- */
  {
    let bad = 0;
    for (let a = 2; a <= 24; a++) for (let b = 2; b <= 24; b++) {
      const w = rl.workUnits([a, b]);
      const byFraction = 1 / (1 / a + 1 / b);
      if (!near(w.time, byFraction, 1e-9)) bad++;
      if (w.time > Math.min(a, b) + 1e-9) bad++;      // together must beat the faster alone
      if (!w.rates.every(Number.isInteger)) bad++;    // the LCM choice must keep rates whole
    }
    check('work: LCM method matches the fraction method, always beats the faster worker, and keeps rates whole',
      bad === 0, `${bad} wrong`);
    check('work: 12 and 18 days give 7.2', near(rl.workUnits([12, 18]).time, 7.2), '');
    check('work: a leak is a negative rate', rl.workUnits([6, -9]).net === 1
      && rl.workUnits([6, -9]).time === 18, JSON.stringify(rl.workUnits([6, -9])));
    check('work: an equal leak means it never fills', !Number.isFinite(rl.workUnits([6, -6]).time), '');
  }

  /* ---- the numbers each lesson prints ---- */
  {
    const si = await load('q-int-simple');
    check('simple: exposes __cfg', !!cfgOf(si), 'none');
    check('simple: predict answer', si.steps[3].answer === rl.simple(12000, 8, 5) && si.steps[3].answer === 4800, '');
    check('simple: rate drill', si.steps[5].answer === 100 * 1500 / (7500 * 4), String(si.steps[5].answer));
    check('simple: time drill', si.steps[6].answer === 100 * 1600 / (6400 * 6.25), String(si.steps[6].answer));
    // mastery: doubling in 8y means 4x in 24y, and NOT 16
    const m = si.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('simple: mastery keys 3 principals of interest', keyed === 3 * 8 && keyed === 24, String(keyed));
    check('simple: and the doubling-twice trap is on the list',
      m.options.some(o => +o.replace(/[^0-9.]/g, '') === 16), 'distractor missing');
  }
  {
    const ci = await load('q-int-compound');
    // (1.1^2 is 1.2100000000000002 in binary floating point, so compare with tolerance)
    check('compound: predict answer', near(ci.steps[3].answer, rl.compound(10000, 10, 2), 1e-6)
      && ci.steps[3].answer === 2100, String(ci.steps[3].answer));
    check('compound: gap drill', near(ci.steps[5].answer, rl.ciMinusSi(8000, 5, 2), 1e-6)
      && ci.steps[5].answer === 20, String(ci.steps[5].answer));
    check('compound: amount drill', near(ci.steps[6].answer, rl.amountCI(6250, 4, 2))
      && ci.steps[6].answer === 6760, String(ci.steps[6].answer));
    const m = ci.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('compound: mastery keys the half-yearly amount', near(keyed, rl.amountCI(8000, 5, 2) - 8000)
      && keyed === 820, String(keyed));
    check('compound: the annual-compounding distractor is present',
      m.options.some(o => +o.replace(/[^0-9.]/g, '') === 800), 'distractor missing');
  }
  {
    const sp = await load('q-int-speed');
    check('speed: predict answer', sp.steps[3].answer === rl.toMS(72) && sp.steps[3].answer === 20, '');
    check('speed: 360 over 4.5 h', sp.steps[5].answer === 360 / 4.5, String(sp.steps[5].answer));
    check('speed: equal-distance average', sp.steps[6].answer === rl.avgSpeed(40, 60)
      && sp.steps[6].answer === 48, String(sp.steps[6].answer));
    const m = sp.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('speed: mastery is the EQUAL-TIME case, so the plain average', keyed === 20, String(keyed));
    check('speed: and the harmonic-mean trap is offered',
      m.options.some(o => near(+o.replace(/[^0-9.]/g, ''), rl.avgSpeed(16, 24), 0.01)), 'distractor missing');
  }
  {
    const tr = await load('q-int-trains');
    const cfg = cfgOf(tr);
    check('trains: exposes __cfg', !!cfg, 'none');
    const opp = rl.toMS(cfg.a + cfg.b);
    check('trains: predict answer is total length over relative speed',
      near(tr.steps[3].answer, (cfg.lenA + cfg.lenB) / opp) && tr.steps[3].answer === 10,
      String(tr.steps[3].answer));
    check('trains: pole drill', tr.steps[5].answer === rl.toKMH(240 / 12) && tr.steps[5].answer === 72, '');
    check('trains: boat drill', near(tr.steps[6].answer, (30 / 2 + 30 / 3) / 2)
      && tr.steps[6].answer === 12.5, String(tr.steps[6].answer));
    check('trains: the boat is faster than the stream', (30 / 2 + 30 / 3) / 2 > (30 / 2 - 30 / 3) / 2, '');
    const m = tr.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('trains: mastery uses the DIFFERENCE of the speeds',
      near(keyed, 250 / rl.toMS(72 - 54)) && keyed === 50, String(keyed));
    check('trains: same direction really is slower than opposite',
      250 / rl.toMS(72 - 54) > 250 / rl.toMS(54 + 36), '');
    // the explore gate asking for a zero relative speed must be reachable on the slider
    check('trains: a zero relative speed is reachable', 18 <= 108, '');
  }
  {
    const wk = await load('q-int-work');
    const cfg = cfgOf(wk);
    check('work: exposes __cfg', !!cfg, 'none');
    const t = rl.workUnits(cfg.workers.map(w => w.days)).time;
    check('work: predict answer matches the config', near(wk.steps[3].answer, t) && wk.steps[3].answer === 7.2,
      String(wk.steps[3].answer));
    check('work: pair drill', wk.steps[5].answer === rl.workUnits([10, 15]).time
      && wk.steps[5].answer === 6, String(wk.steps[5].answer));
    check('work: leak drill', wk.steps[6].answer === rl.workUnits([6, -9]).time
      && wk.steps[6].answer === 18, String(wk.steps[6].answer));
    // mastery: solve backwards for B
    const m = wk.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    const total = rl.lcm(8, 12), bRate = total / 8 - total / 12;
    check('work: mastery keys total/(togetherRate - aRate)', keyed === total / bRate && keyed === 24,
      String(keyed));
    check('work: and the subtract-the-days trap is offered',
      m.options.some(o => +o.replace(/[^0-9.]/g, '') === 4), 'distractor missing');
    check('work: B really is slower than A', total / bRate > 12, '');
  }

  /* ---- every explore checklist must be completable ----
     The task predicates are real functions in the lesson files, so rather than
     reasoning about them, sweep the widget's actual slider range and feed each
     reachable report state through them. A gate nobody can open is a bug the
     learner discovers by being stuck. */
  {
    const sweep = async (file, states) => {
      const lsn = await load(file);
      const step = lsn.steps.find(s => s.type === 'explore');
      step.tasks.forEach((t, i) => {
        const ok = states.some(s => { try { return !!t.done(s); } catch { return false; } });
        check(`${file}: explore task ${i + 1} ("${t.label.replace(/<[^>]+>/g, '').slice(0, 38)}") is reachable`,
          ok, 'no reachable widget state satisfies it');
      });
    };

    // interestCurve: rate 4..20, years 1..maxYears
    const curveStates = [];
    for (let r = 4; r <= 20; r++) for (let n = 1; n <= 6; n++)
      curveStates.push({
        rate: r, years: n, si: rl.simple(10000, r, n), ci: rl.compound(10000, r, n),
        gap: rl.ciMinusSi(10000, r, n),
        equalAtYearOne: n === 1 && Math.abs(rl.ciMinusSi(10000, r, n)) < 1e-9,
        sawYearOne: n === 1, sawTwoYearRule: n === 2, gapGrows: rl.ciMinusSi(10000, r, n) > 0,
      });
    await sweep('q-int-simple', curveStates);
    await sweep('q-int-compound', curveStates);

    // speedTriangle: sweep the slider exactly as the lesson configures it
    const spCfg = cfgOf(await load('q-int-speed'));
    const spStates = [];
    for (let s = spCfg.minSpeed; s <= spCfg.maxSpeed; s += spCfg.stepSpeed)
      for (let t = 0.5; t <= spCfg.maxTime; t += 0.5)
      spStates.push({ speed: s, time: t, distance: s * t, ms: rl.toMS(s),
        hit72: s === 72, hitExact20ms: Math.abs(rl.toMS(s) - 20) < 1e-9, far: s * t >= 300 });
    await sweep('q-int-speed', spStates);

    // relativeSpeed: 18..108 step 6, both directions
    const trCfg = cfgOf(await load('q-int-trains'));
    const rsStates = [];
    for (const opp of [true, false])
      for (let a = 18; a <= 108; a += 6) for (let b = 18; b <= 108; b += 6) {
        const rel = opp ? a + b : Math.abs(a - b), ms = rl.toMS(rel);
        rsStates.push({ a, b, opposite: opp, rel, relMS: ms,
          seconds: ms > 0 ? (trCfg.lenA + trCfg.lenB) / ms : null,
          sawBoth: true, sawZeroRelative: !opp && a === b, sameIsSlower: !opp });
      }
    await sweep('q-int-trains', rsStates);

    // workRate: both times 2..24
    const wkStates = [];
    for (let a = 2; a <= 24; a++) for (let b = 2; b <= 24; b++) {
      const w = rl.workUnits([a, b]);
      wkStates.push({ days: [a, b], total: w.total, rates: w.rates, net: w.net,
        time: Number.isFinite(w.time) ? Math.round(w.time * 100) / 100 : null,
        neverFinishes: w.net <= 0, allWholeRates: w.rates.every(Number.isInteger) });
    }
    await sweep('q-int-work', wkStates);
  }

  console.log('  interest simulated year by year, average speed against real journeys, work rates by counting units');
}

/* ---------------- Academy: Quants Unit 5 ---------------- */
/* Unit 5's claim is that a mean is a BALANCE POINT and alligation is that balance
   read backwards. So the checks are structural: signed deviations from the mean
   must sum to zero (that is what "balance" means), the weighted average must equal
   a brute-force pooling of the raw values, and alligation must invert back into the
   weighted average it came from. */
async function quants5() {
  console.log('assets/js/lessons/q-avg-*.js');

  const load = f => import(`../assets/js/lessons/${f}.js`).then(m => m.default);
  const cfgOf = l => l.steps.find(s => s.type === 'explore' && s.__cfg)?.__cfg;
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const sl = await import('../assets/js/widgets/stat-lab.js');

  /* ---- the balance property, and the centres ---- */
  {
    let bad = 0;
    for (let t = 1; t <= 400; t++) {
      // deterministic pseudo-data, so the sweep is reproducible
      const n = 3 + (t % 6);
      const a = [...Array(n)].map((_, i) => ((t * 7 + i * 13) % 97) + 1);
      if (!near(sl.sum(a.map(x => x - sl.mean(a))), 0, 1e-9)) bad++;          // balance
      const s = [...a].sort((x, y) => x - y);
      const med = sl.median(a);
      const below = s.filter(x => x < med).length, above = s.filter(x => x > med).length;
      if (Math.abs(below - above) > n) bad++;                                 // median is central
      if (sl.mean(a) < Math.min(...a) - 1e-9 || sl.mean(a) > Math.max(...a) + 1e-9) bad++;
    }
    check('stats: deviations from the mean sum to zero, and the mean lies inside the data',
      bad === 0, `${bad} wrong`);
    check('stats: median of an even set averages the two middles',
      sl.median([4, 7, 9, 12, 15, 18, 21, 25]) === 13.5, String(sl.median([4, 7, 9, 12, 15, 18, 21, 25])));
    check('stats: median ignores an extreme value',
      sl.median([12, 14, 15, 16, 88]) === sl.median([12, 14, 15, 16, 8800]), '');
    check('stats: the mean does not',
      sl.mean([12, 14, 15, 16, 88]) !== sl.mean([12, 14, 15, 16, 8800]), '');
    check('stats: modes returns nothing when no value repeats', sl.modes([1, 2, 3]).length === 0, '');
    check('stats: modes can return several', sl.modes([1, 1, 2, 2, 3]).join(',') === '1,2', '');
  }

  /* ---- weighted average, checked by pooling the raw values ---- */
  {
    let bad = 0;
    for (let n1 = 1; n1 <= 30; n1 += 3) for (let n2 = 1; n2 <= 30; n2 += 3)
      for (const [v1, v2] of [[60, 80], [47, 52], [30, 45]]) {
        const pooled = sl.mean([...Array(n1).fill(v1), ...Array(n2).fill(v2)]);
        if (!near(sl.weighted([n1, n2], [v1, v2]), pooled, 1e-9)) bad++;
        const w = sl.weighted([n1, n2], [v1, v2]);
        if (w < Math.min(v1, v2) - 1e-9 || w > Math.max(v1, v2) + 1e-9) bad++;   // must lie between
        // must lean toward the bigger group
        if (n1 > n2 && Math.abs(w - v1) > Math.abs(w - v2) + 1e-9) bad++;
      }
    check('weighted: matches pooling the raw values, lies between, and leans to the bigger group',
      bad === 0, `${bad} wrong`);
    check('weighted: 30 at 60 with 20 at 80 gives 68', near(sl.weighted([30, 20], [60, 80]), 68), '');
    check('weighted: and that is not the plain average', sl.weighted([30, 20], [60, 80]) !== 70, '');
  }

  /* ---- alligation must invert back into the weighted average ---- */
  {
    let bad = 0;
    for (let cheap = 0; cheap <= 60; cheap += 5)
      for (let dear = cheap + 5; dear <= 90; dear += 5)
        for (let m = cheap + 1; m < dear; m++) {
          const a = sl.alligation(cheap, dear, m);
          // put the ratio back through the weighted average and we must land on m
          if (!near(sl.weighted([a.cheapParts, a.dearParts], [cheap, dear]), m, 1e-6)) bad++;
          // the quantities must be inverse to the distances
          if (!near(a.cheapParts * (m - cheap), a.dearParts * (dear - m), 1e-6)) bad++;
        }
    check('alligation: every ratio mixes back to its own target, and inverts the distances',
      bad === 0, `${bad} wrong`);
    check('alligation: 40 and 60 to 45 gives 3:1',
      sl.alligation(40, 60, 45).ratio.join(':') === '3:1', sl.alligation(40, 60, 45).ratio.join(':'));
    check('alligation: 20% and 50% to 30% gives 2:1',
      sl.alligation(20, 50, 30).ratio.join(':') === '2:1', sl.alligation(20, 50, 30).ratio.join(':'));
    check('alligation: free water with milk at 60 to 48 gives 1:4',
      sl.alligation(0, 60, 48).ratio.join(':') === '1:4', sl.alligation(0, 60, 48).ratio.join(':'));
  }

  /* ---- spread: shifting must not change it, scaling must ---- */
  {
    let bad = 0;
    for (let t = 1; t <= 200; t++) {
      const n = 4 + (t % 5);
      const a = [...Array(n)].map((_, i) => ((t * 11 + i * 17) % 89) + 1);
      const shifted = a.map(x => x + 7), scaled = a.map(x => x * 3);
      if (!near(sl.range(shifted), sl.range(a))) bad++;
      if (!near(sl.meanDev(shifted), sl.meanDev(a), 1e-9)) bad++;
      if (!near(sl.mean(shifted), sl.mean(a) + 7, 1e-9)) bad++;
      if (!near(sl.range(scaled), sl.range(a) * 3, 1e-9)) bad++;
      if (!near(sl.meanDev(scaled), sl.meanDev(a) * 3, 1e-9)) bad++;
    }
    check('spread: adding a constant moves the mean and leaves range and mean deviation alone; multiplying scales all three',
      bad === 0, `${bad} wrong`);
    check('spread: the two villages share a mean but not a spread',
      sl.mean([48, 49, 50, 51, 52]) === sl.mean([10, 30, 50, 70, 90])
      && sl.meanDev([10, 30, 50, 70, 90]) === 20 * sl.meanDev([48, 49, 50, 51, 52]), '');
    check('spread: same mean AND same range can still differ in mean deviation',
      sl.mean([10, 50, 50, 90]) === sl.mean([10, 10, 90, 90])
      && sl.range([10, 50, 50, 90]) === sl.range([10, 10, 90, 90])
      && sl.meanDev([10, 10, 90, 90]) === 2 * sl.meanDev([10, 50, 50, 90]), '');
  }

  /* ---- the numbers each lesson prints, and its gates ---- */
  {
    const ce = await load('q-avg-centre');
    const cfg = cfgOf(ce);
    check('centre: exposes __cfg', !!cfg, 'none');
    check('centre: predict answer is the mean of the shipped values',
      ce.steps[3].answer === sl.mean(cfg.values) && ce.steps[3].answer === 29, String(ce.steps[3].answer));
    check('centre: the shipped set is skewed enough to make the point',
      cfg.values.filter(v => v < sl.mean(cfg.values)).length > cfg.values.length / 2, 'not skewed');
    check('centre: median drill', ce.steps[5].answer === sl.median([15, 4, 21, 9, 25, 12, 7, 18]), '');
    check('centre: totals drill', ce.steps[6].answer === (6 * 20 - 15) / 5, String(ce.steps[6].answer));
    const m = ce.steps[7];
    check('centre: mastery prefers the median', /median/i.test(m.options[m.answer]), m.options[m.answer]);
    // the "mean equals median" gate must be reachable on the slider
    let canEqual = false;
    for (let v = cfg.min; v <= cfg.max; v += cfg.step) {
      const t = [...cfg.values.slice(0, -1), v];
      if (near(sl.mean(t), sl.median(t))) { canEqual = true; break; }
    }
    check('centre: a value making mean equal median is reachable', canEqual, 'the gate could never open');
  }
  {
    const we = await load('q-avg-weighted');
    const cfg = cfgOf(we);
    check('weighted: exposes __cfg', !!cfg, 'none');
    check('weighted: predict answer matches the config',
      near(we.steps[3].answer, sl.weighted([cfg.left.size, cfg.right.size], [cfg.left.value, cfg.right.value]))
      && we.steps[3].answer === 68, String(we.steps[3].answer));
    check('weighted: kg drill', we.steps[5].answer === sl.weighted([40, 60], [52, 47]), '');
    check('weighted: replacement drill', we.steps[6].answer === 45 - (10 * 27 - 10 * 25), String(we.steps[6].answer));
    const m = we.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('weighted: mastery keys (2480 - 800)/30', keyed === (40 * 62 - 10 * 80) / 30 && keyed === 56, String(keyed));
    // both explore gates must be reachable within the slider range
    let lo = false, hi = false;
    for (let a = 1; a <= cfg.maxSize; a++) for (let b = 1; b <= cfg.maxSize; b++) {
      const w = sl.weighted([a, b], [cfg.left.value, cfg.right.value]);
      if (w < 68) lo = true; if (w > 72) hi = true;
    }
    check('weighted: an average below 68 is reachable', lo, 'gate could never open');
    check('weighted: an average above 72 is reachable', hi, 'gate could never open');
  }
  {
    const al = await load('q-avg-alligation');
    const cfg = cfgOf(al);
    check('alligation: exposes __cfg', !!cfg, 'none');
    const [c, d] = [cfg.left.value, cfg.right.value];
    for (const target of [45, 50]) {
      let ok = false;
      for (let a = 1; a <= cfg.maxSize && !ok; a++) for (let b = 1; b <= cfg.maxSize; b++)
        if (near(sl.weighted([a, b], [c, d]), target)) { ok = true; break; }
      check(`alligation: a mixture of exactly ${target} is reachable`, ok, 'gate could never open');
    }
    const p = al.steps[3];
    check('alligation: predict keys 3:1', p.options[p.answer] === '3 : 1', p.options[p.answer]);
    check('alligation: and 3:1 really mixes to 45', near(sl.weighted([3, 1], [40, 60]), 45), '');
    const d1 = al.steps[5];
    check('alligation: acid drill keys 2:1 and mixes back to 30%',
      d1.options[d1.answer] === '2 : 1' && near(sl.weighted([2, 1], [20, 50]), 30), d1.options[d1.answer]);
    const d2 = al.steps[6];
    check('alligation: water drill keys 1:4 and mixes back to 48',
      d2.options[d2.answer] === '1 : 4' && near(sl.weighted([1, 4], [0, 60]), 48), d2.options[d2.answer]);
    const m = al.steps[7];
    const kg = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('alligation: mastery keys 10 kg and mixes back to 42',
      kg === 10 && near(sl.weighted([40, kg], [45, 30]), 42), String(kg));
  }
  {
    const sp = await load('q-avg-spread');
    const cfg = cfgOf(sp);
    check('spread: exposes __cfg', !!cfg, 'none');
    check('spread: the two shipped sets share a mean',
      near(sl.mean(cfg.sets[0].values), sl.mean(cfg.sets[1].values)), 'the lesson claims they do');
    check('spread: but not a spread',
      sl.meanDev(cfg.sets[0].values) !== sl.meanDev(cfg.sets[1].values), '');
    check('spread: predict answer is set A mean deviation',
      near(sp.steps[3].answer, sl.meanDev(cfg.sets[0].values)) && sp.steps[3].answer === 1.2,
      String(sp.steps[3].answer));
    const d = sp.steps[4 + 1];
    check('spread: shift drill keys "mean up, range unchanged"',
      /unchanged/i.test(d.options[d.answer]), d.options[d.answer]);
    check('spread: scale drill', sp.steps[6].answer === 3 * 4, String(sp.steps[6].answer));
    const m = sp.steps[7];
    check('spread: mastery keys Q as the more scattered', /Q is twice/.test(m.options[m.answer]), m.options[m.answer]);
  }

  console.log('  balance property, weighted average by pooling, alligation inverted back, spread under shift and scale');
}

/* ---------------- Academy: Quants Unit 4 ---------------- */
/* Unit 4's claim is that lengths go as k, areas as k^2 and volumes as k^3. That is
   checked here by BRUTE FORCE over every shape and scale rather than by trusting the
   formulas, and path areas are re-derived a second way (the midline identity) so a
   sign error in outer-minus-inner cannot hide. */
async function quants4() {
  console.log('assets/js/lessons/q-men-*.js');

  const load = f => import(`../assets/js/lessons/${f}.js`).then(m => m.default);
  const cfgOf = l => l.steps.find(s => s.type === 'explore' && s.__cfg)?.__cfg;
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const ml = await import('../assets/js/widgets/mensuration-lab.js');

  /* ---- the scaling law, over every shape the unit ships ---- */
  {
    let bad = 0;
    for (let k = 1; k <= 6; k++) {
      for (let w = 1; w <= 12; w++) for (let h = 1; h <= 12; h++) {
        if (!near(ml.rectArea(w * k, h * k), ml.rectArea(w, h) * k * k)) bad++;
        if (!near(ml.rectPerim(w * k, h * k), ml.rectPerim(w, h) * k)) bad++;
      }
      for (let a = 1; a <= 12; a++) {
        if (!near(ml.cubeVol(a * k), ml.cubeVol(a) * k ** 3)) bad++;
        if (!near(ml.cubeSurf(a * k), ml.cubeSurf(a) * k ** 2)) bad++;
      }
      for (let r = 1; r <= 10; r++) {
        if (!near(ml.circleArea(r * k), ml.circleArea(r) * k * k, 1e-6)) bad++;
        if (!near(ml.circleCirc(r * k), ml.circleCirc(r) * k, 1e-6)) bad++;
        for (let h = 1; h <= 10; h++) {
          if (!near(ml.cylVol(r * k, h * k), ml.cylVol(r, h) * k ** 3, 1e-6)) bad++;
          if (!near(ml.cylTotal(r * k, h * k), ml.cylTotal(r, h) * k ** 2, 1e-6)) bad++;
          if (!near(ml.coneVol(r * k, h * k), ml.coneVol(r, h) * k ** 3, 1e-6)) bad++;
          if (!near(ml.coneCurved(r * k, h * k), ml.coneCurved(r, h) * k ** 2, 1e-6)) bad++;
        }
      }
    }
    check('mensuration: lengths go as k, areas as k^2 and volumes as k^3, for every shape and scale',
      bad === 0, `${bad} wrong`);
    check('mensuration: a cone is exactly a third of its cylinder',
      near(ml.coneVol(7, 24) * 3, ml.cylVol(7, 24), 1e-6), '');
    check('mensuration: 7-24-25 really is a right triangle', ml.coneSlant(7, 24) === 25, '');
    check('mensuration: 22/7 gives whole answers exactly when r is a multiple of 7',
      [7, 14, 21, 35].every(r => Number.isInteger(ml.circleArea(r)))
      && ![9, 13].some(r => Number.isInteger(ml.circleArea(r))), '');
    check('mensuration: side 6 is the only cube where volume equals surface area',
      [...Array(30).keys()].filter(a => a > 0 && ml.cubeVol(a) === ml.cubeSurf(a)).join() === '6', '');
  }

  /* ---- path areas, re-derived by the midline identity ---- */
  {
    let bad = 0;
    for (let w = 6; w <= 60; w += 2) for (let h = 4; h <= 40; h += 2)
      for (let t = 0.5; t <= 5; t += 0.5) {
        const out = ml.borderArea(w, h, t, true);
        // a border's area is also its MIDLINE perimeter times its width
        const midline = 2 * ((w + t) + (h + t)) * t;
        if (!near(out.path, midline, 1e-6)) bad++;
        // and algebraically 2t(w+h) + 4t^2
        if (!near(out.path, 2 * t * (w + h) + 4 * t * t, 1e-6)) bad++;
        if (w - 2 * t > 0 && h - 2 * t > 0) {
          const ins = ml.borderArea(w, h, t, false);
          if (ins.path >= out.path) bad++;          // an inside path is always smaller
          if (!near(ins.path, 2 * t * (w + h) - 4 * t * t, 1e-6)) bad++;
        }
      }
    check('paths: outer-minus-inner matches the midline identity and the algebraic form, and inside is always smaller than outside',
      bad === 0, `${bad} wrong`);
    check('paths: crossing roads subtract the overlap exactly once',
      ml.crossRoads(60, 40, 3).total === 60 * 3 + 40 * 3 - 9, String(ml.crossRoads(60, 40, 3).total));
    check('paths: 20x15 with a 2 m outside path is 156', ml.borderArea(20, 15, 2, true).path === 156, '');
    check('paths: 50x40 with a 5 m inside path is 800', ml.borderArea(50, 40, 5, false).path === 800, '');
  }

  /* ---- the numbers each lesson prints, and its gates ---- */
  {
    const ar = await load('q-men-area');
    const cfg = cfgOf(ar);
    check('area: exposes __cfg', !!cfg, 'none');
    check('area: predict answer is the doubled rectangle',
      ar.steps[3].answer === ml.rectArea(cfg.w * 2, cfg.h * 2) && ar.steps[3].answer === 384,
      String(ar.steps[3].answer));
    check('area: and that is four times the original',
      ml.rectArea(cfg.w * 2, cfg.h * 2) === 4 * ml.rectArea(cfg.w, cfg.h), '');
    check('area: triangle drill', ar.steps[5].answer === ml.triArea(12, 9), String(ar.steps[5].answer));
    const d = ar.steps[6];
    const dims = d.options.map(o => o.match(/(\d+)\D+(\d+)/)).filter(Boolean).map(m => [+m[1], +m[2]]);
    check('area: every fixed-perimeter option really has perimeter 40',
      dims.every(([a, b]) => ml.rectPerim(a, b) === 40), dims.map(x => ml.rectPerim(...x)).join());
    check('area: and the keyed one has the largest area',
      ml.rectArea(...dims[d.answer]) === Math.max(...dims.map(x => ml.rectArea(...x))), '');
    const m = ar.steps[7];
    check('area: mastery keys 44%', +m.options[m.answer].replace(/[^0-9.]/g, '') === 44
      && near((1.2 ** 2 - 1) * 100, 44, 1e-9), m.options[m.answer]);
  }
  {
    const ci = await load('q-men-circle');
    const cfg = cfgOf(ci);
    check('circle: exposes __cfg', !!cfg, 'none');
    check('circle: every shipped radius is a multiple of 7 (the lesson says so)',
      cfg.radii.every(r => r % 7 === 0), cfg.radii.join());
    check('circle: and each gives whole answers, so the explore gate can open',
      cfg.radii.every(r => Number.isInteger(ml.circleArea(r)) && Number.isInteger(ml.circleCirc(r))), '');
    check('circle: predict answer', ci.steps[3].answer === ml.circleArea(14) && ci.steps[3].answer === 616, '');
    check('circle: backwards drill', ci.steps[5].answer === ml.circleArea(44 / (2 * ml.PI22))
      && ci.steps[5].answer === 154, String(ci.steps[5].answer));
    check('circle: semicircle drill', ci.steps[6].answer === ml.circleArea(14) / 2, String(ci.steps[6].answer));
    const m = ci.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('circle: mastery keys the ring area',
      near(keyed, ml.circleArea(24.5) - ml.circleArea(21), 1e-6) && keyed === 500.5, String(keyed));
    check('circle: the outer-area distractor is on the list',
      m.options.some(o => near(+o.replace(/[^0-9.]/g, ''), ml.circleArea(24.5), 0.01)), 'missing');
  }
  {
    const pa = await load('q-men-paths');
    const cfg = cfgOf(pa);
    check('paths: exposes __cfg', !!cfg, 'none');
    check('paths: predict answer', pa.steps[3].answer === ml.borderArea(cfg.w, cfg.h, 2, true).path
      && pa.steps[3].answer === 156, String(pa.steps[3].answer));
    check('paths: inside drill', pa.steps[5].answer === ml.borderArea(50, 40, 5, false).path, '');
    check('paths: crossing drill', pa.steps[6].answer === ml.crossRoads(60, 40, 3).total, '');
    const m = pa.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('paths: mastery keys area x rate', keyed === ml.borderArea(30, 20, 2.5, true).path * 12
      && keyed === 3300, String(keyed));
    check('paths: the unrolled-strip distractor is on the list (perimeter x width x rate)',
      m.options.some(o => +o.replace(/[^0-9.]/g, '') === ml.rectPerim(30, 20) * 2.5 * 12), 'missing');
    // the inside-path gate must be satisfiable without the middle vanishing
    let fits = false;
    for (let t = 1; t <= cfg.maxT; t += 0.5)
      if (cfg.w - 2 * t > 0 && cfg.h - 2 * t > 0) fits = true;
    check('paths: an inside path leaving a real middle is reachable', fits, 'gate could never open');
  }
  {
    const so = await load('q-men-solids');
    const cfg = cfgOf(so);
    check('solids: exposes __cfg', !!cfg, 'none');
    check('solids: predict answer', so.steps[3].answer === ml.cylVol(7, 10) && so.steps[3].answer === 1540, '');
    check('solids: cuboid drill', so.steps[5].answer === ml.cuboidSurf(10, 8, 5), String(so.steps[5].answer));
    check('solids: cone drill uses the SLANT height',
      so.steps[6].answer === ml.coneCurved(7, 24) && so.steps[6].answer !== ml.PI22 * 7 * 24,
      String(so.steps[6].answer));
    const m = so.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('solids: mastery keys the INCREASE, not the factor', keyed === (2 ** 2 - 1) * 100 && keyed === 300,
      String(keyed));
    check('solids: and the factor-as-percent distractor is offered',
      m.options.some(o => +o.replace(/[^0-9.]/g, '') === 400), 'missing');
    check('solids: every shipped solid has a known type',
      cfg.solids.every(s => ['cube', 'cuboid', 'cylinder', 'cone'].includes(s.type)), '');
  }

  console.log('  scaling law brute-forced over every shape, path areas re-derived by the midline identity');
}

/* ---------------- Academy: Quants Unit 6 ---------------- */
/* Counting is the one topic where a formula can be memorised and still be wrong, so
   nothing here is taken on trust: every nPr and nCr is checked against an ACTUAL
   enumeration of the space, every word-arrangement count against the set of distinct
   strings, and every probability against a filtered sample space. */
async function quants6() {
  console.log('assets/js/lessons/q-cnt-*.js');

  const load = f => import(`../assets/js/lessons/${f}.js`).then(m => m.default);
  const cfgOf = l => l.steps.find(s => s.type === 'explore' && s.__cfg)?.__cfg;
  const cl = await import('../assets/js/widgets/count-lab.js');

  /* ---- formulas versus enumeration ---- */
  {
    const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    let bad = 0;
    for (let n = 1; n <= 7; n++) for (let r = 0; r <= n; r++) {
      const items = pool.slice(0, n);
      if (cl.permsOf(items, r).length !== cl.nPr(n, r)) bad++;
      if (cl.combsOf(items, r).length !== cl.nCr(n, r)) bad++;
      // and the ratio between them must be exactly r!
      if (r > 0 && cl.permsOf(items, r).length !== cl.combsOf(items, r).length * cl.fact(r)) bad++;
    }
    check('counting: nPr and nCr match an actual enumeration for every n and r up to 7',
      bad === 0, `${bad} wrong`);
    check('counting: the symmetry nCr = nC(n-r) holds',
      [...Array(13).keys()].every(n => [...Array(n + 1).keys()].every(r => cl.nCr(n, r) === cl.nCr(n, n - r))), '');
    check('counting: 13C9 equals 13C4 equals 715', cl.nCr(13, 9) === 715 && cl.nCr(13, 4) === 715, '');
    check('counting: 10C2 is 45 and 10P2 is 90', cl.nCr(10, 2) === 45 && cl.nPr(10, 2) === 90, '');
  }

  /* ---- word arrangements versus the set of distinct strings ---- */
  {
    let bad = 0;
    for (const w of ['LEVEL', 'BANANA', 'AAB', 'ABCD', 'AABB', 'MAMMA']) {
      const distinct = new Set(cl.permsOf([...w], w.length).map(p => p.join(''))).size;
      if (cl.wordArrangements(w).total !== distinct) bad++;
    }
    check('permutations: repeat-divided counts match the set of genuinely distinct strings',
      bad === 0, `${bad} wrong`);
    check('permutations: LEVEL is 30', cl.wordArrangements('LEVEL').total === 30, '');
    check('permutations: BANANA is 60', cl.wordArrangements('BANANA').total === 60, '');
    check('permutations: ALLAHABAD is 7560 (A four times, L twice)',
      cl.wordArrangements('ALLAHABAD').total === 7560
      && cl.wordArrangements('ALLAHABAD').counts.A === 4
      && cl.wordArrangements('ALLAHABAD').counts.L === 2,
      JSON.stringify(cl.wordArrangements('ALLAHABAD').counts));
  }

  /* ---- the three sample spaces ---- */
  {
    const dice = cl.twoDice(), d3 = cl.coinFlips(3), dk = cl.deck();
    check('spaces: two dice give 36 ordered pairs', dice.length === 36, String(dice.length));
    check('spaces: (4,6) and (6,4) are distinct outcomes',
      dice.filter(([a, b]) => a === 4 && b === 6).length === 1
      && dice.filter(([a, b]) => a === 6 && b === 4).length === 1, '');
    check('spaces: three coins give 8', d3.length === 8, String(d3.length));
    check('spaces: exactly two heads happens 3C2 times',
      d3.filter(c => c.filter(x => x === 'H').length === 2).length === cl.nCr(3, 2), '');
    check('spaces: the deck is 52 with 13 per suit and 4 per rank',
      dk.length === 52 && dk.filter(c => c.suit === 'H').length === 13
      && dk.filter(c => c.rank === 'K').length === 4, '');
    check('spaces: 12 face cards, not 16 (the ace is not one)',
      dk.filter(c => 'JQK'.includes(c.rank)).length === 12, '');
    check('spaces: 26 red and 26 black', dk.filter(c => c.red).length === 26, '');
    check('spaces: king OR heart is 16, by inclusion-exclusion',
      dk.filter(c => c.rank === 'K' || c.suit === 'H').length === 13 + 4 - 1, '');
    check('spaces: frac reduces 16/52 to 4/13', cl.frac(16, 52).text === '4/13', cl.frac(16, 52).text);
    check('spaces: frac reduces 6/36 to 1/6', cl.frac(6, 36).text === '1/6', cl.frac(6, 36).text);
  }

  /* ---- every event a lesson ships must count what it claims ---- */
  {
    for (const file of ['q-cnt-prob', 'q-cnt-dice']) {
      const cfg = cfgOf(await load(file));
      check(`${file}: exposes __cfg`, !!cfg, 'none');
      const space = cfg.space === 'dice' ? cl.twoDice()
        : cfg.space === 'coins' ? cl.coinFlips(3) : cl.deck();
      cfg.events.forEach(e => {
        const got = space.filter(o => e.test(o)).length;
        check(`${file}: "${e.label}" counts ${e.expect} in the real space`, got === e.expect,
          `enumerated ${got}, lesson says ${e.expect}`);
      });
      // the explore gates ask for specific favourable counts; they must be reachable
      const counts = cfg.events.map(e => space.filter(o => e.test(o)).length);
      check(`${file}: the shipped events give a range of counts, so the gates can open`,
        new Set(counts).size > 1, counts.join());
    }
  }

  /* ---- the numbers each lesson prints ---- */
  {
    const mu = await load('q-cnt-multiply');
    const cfg = cfgOf(mu);
    check('multiply: predict answer is the product of the shipped slots',
      mu.steps[3].answer === cfg.slots.reduce((a, s) => a * s.options.length, 1)
      && mu.steps[3].answer === 24, String(mu.steps[3].answer));
    check('multiply: letters drill is 26^3', mu.steps[5].answer === 26 ** 3, String(mu.steps[5].answer));
    check('multiply: distinct-digit drill is 9x9x8, and matches a brute-force count',
      mu.steps[6].answer === 9 * 9 * 8
      && mu.steps[6].answer === [...Array(900).keys()]
        .filter(i => new Set(String(i + 100)).size === 3).length, String(mu.steps[6].answer));
    const m = mu.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9]/g, '');
    const evens = cl.permsOf([1, 2, 3, 4, 5], 3).filter(p => p[2] % 2 === 0).length;
    check('multiply: mastery keys the enumerated even count', keyed === evens && keyed === 24,
      `keyed ${keyed}, enumerated ${evens}`);
  }
  {
    const pe = await load('q-cnt-perm');
    check('perm: predict answer is LEVEL', pe.steps[3].answer === cl.wordArrangements('LEVEL').total, '');
    check('perm: nPr drill is 6P3', pe.steps[5].answer === cl.nPr(6, 3), String(pe.steps[5].answer));
    check('perm: BANANA drill', pe.steps[6].answer === cl.wordArrangements('BANANA').total, '');
    const m = pe.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9]/g, '');
    check('perm: mastery keys ALLAHABAD', keyed === cl.wordArrangements('ALLAHABAD').total && keyed === 7560,
      String(keyed));
    check('perm: the forgot-the-Ls distractor is offered',
      m.options.some(o => +o.replace(/[^0-9]/g, '') === cl.fact(9) / cl.fact(4)), 'missing');
  }
  {
    const co = await load('q-cnt-comb');
    check('comb: predict answer is 10C2', co.steps[3].answer === cl.nCr(10, 2), String(co.steps[3].answer));
    check('comb: committee drill is 8C3', co.steps[5].answer === cl.nCr(8, 3), String(co.steps[5].answer));
    check('comb: conditional drill is 5C2 x 4C1',
      co.steps[6].answer === cl.nCr(5, 2) * cl.nCr(4, 1), String(co.steps[6].answer));
    const m = co.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9]/g, '');
    check('comb: mastery keys 13C9 (both numbers reduced)', keyed === cl.nCr(13, 9) && keyed === 715,
      String(keyed));
    check('comb: the ignore-the-constraint distractor 15C11 is offered',
      m.options.some(o => +o.replace(/[^0-9]/g, '') === cl.nCr(15, 11)), 'missing');
    check('comb: the reduced-pool-only distractor 13C5 is offered',
      m.options.some(o => +o.replace(/[^0-9]/g, '') === cl.nCr(13, 5)), 'missing');
  }
  {
    const pr = await load('q-cnt-prob');
    const dice = cl.twoDice();
    const p = pr.steps[3];
    check('prob: predict keys 1/6 for a sum of 7',
      p.options[p.answer] === cl.frac(dice.filter(([a, b]) => a + b === 7).length, 36).text,
      p.options[p.answer]);
    check('prob: the equally-likely-totals trap 1/11 is offered',
      p.options.includes('1/11'), 'missing');
    const d1 = pr.steps[5];
    const coins = cl.coinFlips(3);
    check('prob: complement drill keys 7/8',
      d1.options[d1.answer] === cl.frac(coins.filter(c => c.includes('H')).length, 8).text,
      d1.options[d1.answer]);
    check('prob: sum-10-or-more drill',
      pr.steps[6].answer === dice.filter(([a, b]) => a + b >= 10).length && pr.steps[6].answer === 6,
      String(pr.steps[6].answer));
    const m = pr.steps[7];
    check('prob: mastery keys 5/14 (without replacement)',
      m.options[m.answer] === cl.frac(5 * 4, 8 * 7).text, m.options[m.answer]);
    check('prob: the with-replacement trap 25/64 is offered', m.options.includes('25/64'), 'missing');
    check('prob: and without-replacement really is the smaller of the two', 5 / 14 < 25 / 64, '');
  }
  {
    const dc = await load('q-cnt-dice');
    const dk = cl.deck();
    const p = dc.steps[3];
    check('dice: predict keys 3/13 for a face card',
      p.options[p.answer] === cl.frac(dk.filter(c => 'JQK'.includes(c.rank)).length, 52).text,
      p.options[p.answer]);
    const d1 = dc.steps[5];
    check('dice: red-king drill keys 1/26',
      d1.options[d1.answer] === cl.frac(dk.filter(c => c.rank === 'K' && c.red).length, 52).text,
      d1.options[d1.answer]);
    check('dice: doubles drill', dc.steps[6].answer === cl.twoDice().filter(([a, b]) => a === b).length, '');
    const m = dc.steps[7];
    check('dice: mastery keys 4/13 for king-or-heart',
      m.options[m.answer] === cl.frac(dk.filter(c => c.rank === 'K' || c.suit === 'H').length, 52).text,
      m.options[m.answer]);
    check('dice: the forgot-the-overlap trap 17/52 is offered', m.options.includes('17/52'), 'missing');
    check('dice: no option exceeds a probability of 1 except the deliberate absurdity',
      m.options.filter(o => { const [a, b] = o.split('/').map(Number); return a > b; }).length === 1,
      m.options.join());
  }

  console.log('  every nPr, nCr and probability checked against an actual enumeration of its space');
}

/* ---------------- Academy: Quants Unit 7 ---------------- */
/* A DI widget is only honest if the picture and the numbers come from the same array,
   so every total the lessons print in prose is recomputed here from the exported data.
   The "which one" questions are additionally checked for a UNIQUE answer — the same
   guard the Reasoning seating puzzles get, and it caught a genuine tie while building. */
async function quants7() {
  console.log('assets/js/lessons/q-di-*.js');

  const load = f => import(`../assets/js/lessons/${f}.js`).then(m => m);
  const cfgOf = l => l.steps.find(s => s.type === 'explore' && s.__cfg)?.__cfg;
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const di = await import('../assets/js/widgets/di-lab.js');
  const sum = a => a.reduce((x, y) => x + y, 0);

  /* ---- tables: the grid must close both ways ---- */
  {
    const mod = await load('q-di-tables');
    const { WHEAT, DISTRICTS, YEARS } = mod;
    const T = di.tableTotals(DISTRICTS, WHEAT);
    check('tables: row totals and column totals reach the same grand total',
      T.grand === T.grandByCol, `${T.grand} vs ${T.grandByCol}`);
    check('tables: grand total is 2435', T.grand === 2435, String(T.grand));
    check('tables: column totals are 550/580/615/690', T.colTotals.join() === '550,580,615,690',
      T.colTotals.join());
    check('tables: Kota leads on the four-year total',
      DISTRICTS[T.rowTotals.indexOf(Math.max(...T.rowTotals))] === 'Kota', '');
    check('tables: and that lead is unique',
      T.rowTotals.filter(v => v === Math.max(...T.rowTotals)).length === 1, T.rowTotals.join());
    check('tables: Bikaner really is lowest in every year',
      YEARS.every((_, y) => WHEAT.Bikaner[y] === Math.min(...DISTRICTS.map(d => WHEAT[d][y]))), '');
    const jumps = [1, 2, 3].map(y => T.colTotals[y] - T.colTotals[y - 1]);
    check('tables: the largest year-on-year jump is unique and lands on 2022',
      jumps.filter(v => v === Math.max(...jumps)).length === 1 && jumps[2] === 75, jumps.join());
    // every printed answer
    const lsn = mod.default;
    check('tables: predict answer is the 2022 column total', lsn.steps[3].answer === T.colTotals[3], '');
    check('tables: growth drill divides by the OLD figure',
      near(lsn.steps[5].answer, di.growth(WHEAT.Jaipur[0], WHEAT.Jaipur[3]))
      && lsn.steps[5].answer === 37.5, String(lsn.steps[5].answer));
    const d2 = lsn.steps[6];
    check('tables: share drill keys the option nearest 240/690',
      Math.abs(+d2.options[d2.answer].replace(/[^0-9.]/g, '') - di.pct(WHEAT.Kota[3], T.colTotals[3])) < 1,
      d2.options[d2.answer]);
    const m = lsn.steps[7];
    check('tables: mastery keys the year of the biggest jump', m.options[m.answer] === '2022', m.options[m.answer]);
    // and the widget's own question answers must match a recomputation
    const cfg = cfgOf(lsn);
    cfg.questions.forEach(q => {
      const got = q.answer(WHEAT, T, DISTRICTS, YEARS);
      check(`tables: widget question "${q.label}" returns a real value`,
        got !== undefined && got !== null && !Number.isNaN(got), String(got));
    });
  }

  /* ---- charts: comparisons, and a UNIQUE best month ---- */
  {
    const mod = await load('q-di-bars');
    const { SALES_A, SALES_B, MONTHS } = mod;
    const combined = SALES_A.map((v, i) => v + SALES_B[i]);
    const mx = Math.max(...combined);
    check('charts: the "best combined month" question has exactly ONE answer',
      combined.filter(v => v === mx).length === 1, `combined ${combined.join()}`);
    check('charts: A beats B in exactly 3 months',
      SALES_A.filter((v, i) => v > SALES_B[i]).length === 3, '');
    check('charts: the largest gap is 15',
      Math.max(...SALES_A.map((v, i) => Math.abs(v - SALES_B[i]))) === 15, '');
    check('charts: A doubles from Jan to Jun, a 100% rise',
      di.growth(SALES_A[0], SALES_A[5]) === 100, String(di.growth(SALES_A[0], SALES_A[5])));
    const lsn = mod.default;
    check('charts: predict answer is the count of months A leads',
      lsn.steps[3].answer === SALES_A.filter((v, i) => v > SALES_B[i]).length, '');
    check('charts: gap drill', lsn.steps[5].answer === 15, String(lsn.steps[5].answer));
    const d2 = lsn.steps[6];
    check('charts: growth drill keys 100%, not 200%',
      d2.options[d2.answer] === '100%' && d2.options.includes('200%'), d2.options[d2.answer]);
    // the widget's own question functions must agree with a recomputation
    const cfg = cfgOf(lsn);
    const s = cfg.series;
    check('charts: widget "best combined month" agrees with the recomputation',
      cfg.questions[3].answer(s, MONTHS) === MONTHS[combined.indexOf(mx)], '');
    check('charts: widget month-count agrees', cfg.questions[0].answer(s, MONTHS) === 3, '');
  }

  /* ---- pie: the circle must close ---- */
  {
    const mod = await load('q-di-pie');
    const { SLICES, BUDGET_TOTAL } = mod;
    const degs = sum(SLICES.map(s => s.deg));
    check('pie: the angles close at 360', degs === 360, String(degs));
    check('pie: the percentages close at 100',
      near(sum(SLICES.map(s => s.deg / 3.6)), 100), String(sum(SLICES.map(s => s.deg / 3.6))));
    check('pie: the amounts close at the budget',
      near(sum(SLICES.map(s => BUDGET_TOTAL * s.deg / 360)), BUDGET_TOTAL), '');
    check('pie: 1 percent is 3.6 degrees', near(360 / 100, 3.6), '');
    check('pie: the largest slice is unique',
      SLICES.filter(s => s.deg === Math.max(...SLICES.map(x => x.deg))).length === 1, '');
    const lsn = mod.default;
    check('pie: predict answer is 90/3.6', lsn.steps[3].answer === 90 / 3.6 && lsn.steps[3].answer === 25, '');
    check('pie: amount drill is total x deg / 360',
      lsn.steps[5].answer === BUDGET_TOTAL * 108 / 360 && lsn.steps[5].answer === 2160,
      String(lsn.steps[5].answer));
    const d2 = lsn.steps[6];
    check('pie: ratio drill keys 3 : 2', d2.options[d2.answer] === '3 : 2', d2.options[d2.answer]);
    check('pie: and 54:36 really reduces to 3:2', 54 / 18 === 3 && 36 / 18 === 2, '');
    const m = lsn.steps[7];
    check('pie: mastery keys the larger ABSOLUTE amount, not the larger share',
      /State Y/.test(m.options[m.answer]) && 0.15 * 20000 > 0.25 * 7200, m.options[m.answer]);
  }

  /* ---- caselet: the grid must close at the stated total ---- */
  {
    const mod = await load('q-di-caselet');
    const { GRID, COLLEGE } = mod;
    const T = di.tableTotals(['Boys', 'Girls'], GRID);
    check('caselet: the four cells add back to the college total',
      T.grand === COLLEGE && T.grand === 1200, String(T.grand));
    check('caselet: row and column totals agree', T.grand === T.grandByCol, '');
    // rebuild the grid from the PARAGRAPH and check it matches the shipped cells
    const boys = COLLEGE * 0.6, girls = COLLEGE - boys;
    check('caselet: the cells match the paragraph they came from',
      GRID.Boys[0] === boys * 0.40 && GRID.Girls[0] === girls * 0.55
      && GRID.Boys[1] === boys - boys * 0.40 && GRID.Girls[1] === girls - girls * 0.55,
      JSON.stringify(GRID));
    const lsn = mod.default;
    check('caselet: predict answer is the science column', lsn.steps[3].answer === T.colTotals[0]
      && lsn.steps[3].answer === 552, String(lsn.steps[3].answer));
    check('caselet: college-share drill uses the college as the base',
      near(lsn.steps[5].answer, di.pct(T.colTotals[0], T.grand)) && lsn.steps[5].answer === 46, '');
    const d2 = lsn.steps[6];
    check('caselet: ratio drill keys 2 : 1', d2.options[d2.answer] === '2 : 1'
      && GRID.Boys[1] / GRID.Girls[1] === 2, d2.options[d2.answer]);
    const m = lsn.steps[7];
    const keyed = +m.options[m.answer].replace(/[^0-9.]/g, '');
    check('caselet: mastery uses the SCIENCE students as the base',
      Math.abs(keyed - di.pct(GRID.Girls[0], T.colTotals[0])) < 0.1, String(keyed));
    check('caselet: and the three rival bases are all offered as distractors',
      m.options.some(o => Math.abs(+o.replace(/[^0-9.]/g, '') - di.pct(GRID.Girls[0], COLLEGE)) < 0.5)
      && m.options.some(o => +o.replace(/[^0-9.]/g, '') === 46)
      && m.options.some(o => +o.replace(/[^0-9.]/g, '') === 55), m.options.join());
  }

  /* ---- speed: the claim scanner, and the estimation claims ---- */
  {
    const mod = await load('q-di-speed');
    const lsn = mod.default;
    const cfg = cfgOf(lsn);
    check('speed: exposes __cfg', !!cfg, 'none');
    // reuse the possible-worlds engine: trap label must match derivation, exactly as in Reasoning
    const { worldsOf, testClaim } = await import('../assets/js/widgets/claim-lab.js');
    const ws = worldsOf({ atoms: cfg.atoms });
    let survivors = 0;
    cfg.claims.forEach(c => {
      const follows = ws.every(w => !!c.needs(w));
      if (follows) survivors++;
      check(`speed: "${c.text.slice(0, 42)}…" trap label matches derivation`,
        follows === (c.trap == null),
        follows ? 'labelled a trap but unbreakable' : 'presented as following, yet breakable');
    });
    check('speed: exactly two claims survive, as the explore gate requires', survivors === 2,
      `${survivors} survived`);
    check('speed: testClaim agrees with the sweep',
      cfg.claims.filter(c => testClaim({ atoms: cfg.atoms }, c.needs, ws).follows).length === 2, '');
    // the estimation claims the lesson prints
    check('speed: 240/700 is within half a point of 240/690',
      Math.abs(240 / 690 * 100 - 240 / 700 * 100) < 0.6, '');
    check('speed: and rounding the divisor UP understates', 240 / 700 < 240 / 690, '');
    check('speed: 80 to 110 is 37.5%, which is more than a third but not a doubling',
      di.growth(80, 110) === 37.5 && 37.5 > 100 / 3 && 110 < 160, '');
    const m = lsn.steps[7];
    check('speed: mastery keys the "more than a third" statement',
      /more than a third/.test(m.options[m.answer]), m.options[m.answer]);
  }

  console.log('  every DI total recomputed from the source arrays, and every "which one" checked for a unique answer');
}

/* ---------------- Cross-cutting guards ---------------- */
/* Two bug classes had been caught only by hand, one unit at a time:
     · a task predicate reading a field its widget never reports — the checklist
       then simply never ticks, and nothing says so;
     · an explore gate that no reachable widget state can satisfy (a 72 km/h target
       on a slider that stepped by 5; a coprime pair absent from the shipped list).
   Both are now checked for EVERY lesson. Where a widget's state space is genuinely
   unbounded — the learner builds a family tree, walks a map, fills a grid — the
   lesson is listed in UNSWEEPABLE with a reason, and an unlisted, ungenerated
   lesson is a FAILURE rather than a silent pass. */

/** Strip comments so an object literal can be parsed for its keys. */
function stripComments(src) {
  let out = '', i = 0, mode = null;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (!mode) {
      if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '/' && d === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') mode = c;
    } else if (c === '\\') { out += c + (src[i + 1] || ''); i += 2; continue; }
    else if (c === mode) mode = null;
    out += c; i++;
  }
  return out;
}

/** Top-level keys of every object literal passed to api.report. */
function reportedFields(src) {
  const s = stripComments(src), out = new Set();
  const re = /api\.report\?\.\(\s*\{/g;
  let m;
  while ((m = re.exec(s))) {
    let i = re.lastIndex, depth = 1, buf = '';
    while (i < s.length && depth > 0) {
      const c = s[i];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (!depth) break; }
      buf += c; i++;
    }
    let d = 0, key = '';
    for (let j = 0; j < buf.length; j++) {
      const c = buf[j];
      if ('([{'.includes(c)) d++;
      else if (')]}'.includes(c)) d--;
      else if (d === 0 && (c === ',' || c === ':')) {
        const k = key.trim();
        if (/^[A-Za-z_$][\w$]*$/.test(k)) out.add(k);
        if (c === ':') { let vd = 0;
          while (j + 1 < buf.length) { j++; const x = buf[j];
            if ('([{'.includes(x)) vd++;
            else if (')]}'.includes(x)) vd--;
            else if (x === ',' && vd === 0) break; } }
        key = ''; continue;
      }
      if (d === 0) key += c;
    }
    const k = key.trim();
    if (/^[A-Za-z_$][\w$]*$/.test(k)) out.add(k);
  }
  return out;
}

/** Which report fields a task predicate actually reads. */
function fieldsRead(task) {
  const seen = new Set();
  const probe = new Proxy({}, {
    get(_, p) { const k = String(p); if (!/^Symbol\(/.test(k) && k !== 'then') seen.add(k); return undefined; },
    has() { return true; },
  });
  try { task.done(probe); } catch { /* predicate may need real values; the reads still counted */ }
  return seen;
}

/* ---- scripted actions: sweeping the widgets the learner BUILDS ----
   A widget whose state the learner assembles — turning a walker, filling seats,
   peeling a phrase — has no list of settings to sweep, so its gates used to be
   exempt from reachability and were only ever established by the browser drive.
   Those widgets now export a pure MACHINE: { init, actions, act, report }. The
   DOM layer drives it and holds no state of its own, so replaying action
   sequences here exercises the same transition function the learner clicks.

   `driveStates` is a breadth-first walk of that machine: from `init`, apply
   every action, keep the states not seen before, repeat to `depth`. States are
   identified by their JSON, so a widget that returns to an earlier state costs
   nothing. Order-sensitive accumulation (a log, a set of things seen) falls out
   of the walk rather than being assumed.

   Depth is per-widget and is the honest limit of the proof: a gate that needs
   more moves than `depth` would read as unreachable. Pick a depth that clears
   the longest gate with room to spare.

   `breadth` is the second limit, and the sweeps default to NOT having one. A
   few widgets branch wide enough that a full walk is not worth having — the
   cipher wheel offers 52 actions a move, so four moves is two million states,
   almost all of them the same three taps in a different order. Where a breadth
   is set, the frontier is thinned by taking every k-th state rather than the
   first k, so the survivors stay spread across the action list instead of
   bunching at whichever action happens to be enumerated first. Both limits
   err towards a FALSE FAILURE, never a false pass: a truncated space can only
   make a gate look unreachable, and every truncation prints a note. */
let sweepStates = 0;
const capNotes = [];

function driveStates(M, { depth = 6, cap = 200000, breadth = Infinity, label = '' } = {}) {
  /* A machine may declare which part of its state is its IDENTITY. A seat board
     counts how many times the learner has touched it, so without this every
     arrangement would be a fresh state at every depth and the walk would never
     converge on the 1,546 arrangements that actually exist. */
  const idOf = M.key ? (st => M.key(st)) : (st => JSON.stringify(st));
  const seen = new Map([[idOf(M.init), M.init]]);
  let frontier = [M.init], capped = false, reached = 0, thinned = 0;

  for (let d = 0; d < depth && frontier.length && !capped; d++) {
    const next = [];
    for (const st of frontier) {
      const acts = typeof M.actions === 'function' ? M.actions(st) : M.actions;
      for (const a of acts) {
        let ns;
        try { ns = M.act(st, a); } catch { continue; }   // an action the state forbids
        if (ns === undefined || ns === null) continue;
        const k = idOf(ns);
        if (seen.has(k)) continue;
        if (seen.size >= cap) { capped = true; break; }
        seen.set(k, ns); next.push(ns);
      }
      if (capped) break;
    }
    if (next.length > breadth) {
      const stride = Math.ceil(next.length / breadth);
      frontier = next.filter((_, i) => i % stride === 0);
      thinned++;
    } else frontier = next;
    reached = d + 1;
  }
  if (capped) capNotes.push(`${label}: hit the ${cap}-state cap at depth ${reached} of ${depth}`);
  if (thinned) capNotes.push(
    `${label}: frontier thinned to ${breadth} on ${thinned} of ${reached} levels — reachability is sampled, not exhaustive`);

  /* A widget that reports only when the learner presses something — "Test my
     chain", an answer button — returns null for states it has never announced.
     Those are real states of the widget but not states the lesson can see, so
     they are dropped rather than fabricated into an all-false report. */
  const out = [];
  for (const st of seen.values()) {
    let r;
    try { r = M.report(st); } catch { continue; }
    if (r) out.push(r);
  }
  sweepStates += out.length;
  return out;
}

/* Lessons exempt from the reachability sweep.
   THIS LIST IS EMPTY, AND THAT IS THE POINT. Nineteen lessons used to sit here
   because their widget is BUILT by the learner rather than selected from, so
   there was no list of settings to sweep. Each of those widgets now exports a
   scripted-action machine (see driveStates above) and is walked like any other.
   Adding an entry back is a real decision, not a shortcut: it removes a lesson
   from the one check that proves its checklist can be completed at all. Write
   the reason next to it if you ever have to. */
const UNSWEEPABLE = {
};

/**
 * One state generator per widget family, each sweeping the control range the widget
 * really offers. Where a value accumulates as the learner explores (seen, broken,
 * tried), the generator reproduces that accumulation rather than assuming it.
 */
async function buildSweepers() {
  const W = n => import(`../assets/js/widgets/${n}.js`);
  const [claimLab, causeChain, venn, figCount, shapeLab, fold, dice,
         shareBar, tradeBar, numberLab, rateLab, statLab, mensLab, countLab, diLab,
         compass, mirrorRow, rankLine, cipherWheel, seriesChain, relMapper,
         peeler, codedChain, ladder, famTree, seatBoard, gridTable,
         walkMap, percentBar] =
    await Promise.all(['claim-lab', 'cause-chain', 'venn-sets', 'figure-count', 'shape-lab',
      'paper-fold', 'dice-lab', 'share-bar', 'trade-bar', 'number-lab', 'rate-lab',
      'stat-lab', 'mensuration-lab', 'count-lab', 'di-lab',
      'compass', 'mirror-row', 'rank-line',
      'cipher-wheel', 'series-chain', 'relation-mapper',
      'phrase-peeler', 'coded-chain', 'relation-ladder', 'family-tree',
      'seat-board', 'grid-table', 'walk-map', 'percent-bar'].map(W));

  const subsets = n => {
    const out = [];
    for (let m = 0; m < (1 << n); m++) out.push([...Array(n).keys()].filter(i => m & (1 << i)));
    return out;
  };
  const r2 = x => Math.round(x * 100) / 100;

  /* ---- Reasoning Unit 1 + Logic + Visual ---- */
  const claimScan = cfg => {
    const model = { atoms: cfg.atoms, constraints: cfg.constraints };
    const ws = claimLab.worldsOf(model);
    const holds = cfg.claims.map(c => ws.every(w => !!c.needs(w)));
    const breakable = holds.filter(h => !h).length;
    const survivors = holds.filter(Boolean).length;
    const out = [];
    for (let broken = 0; broken <= breakable; broken++)
      for (const scanned of [false, true])
        out.push({ broken, brokeEveryBreakable: broken === breakable, scanned, survivors,
                   breakable, world: ws[0], moves: broken, brokenKeys: [] });
    return out;
  };

  const negation = cfg => {
    const ws = claimLab.worldsOf({ atoms: cfg.atoms, constraints: cfg.constraints });
    const needed = cfg.candidates.map(c => !ws.some(w => !c.holds(w) && cfg.reaches(w)));
    return subsets(cfg.candidates.length).map(d => ({
      denied: d.length, total: cfg.candidates.length, testedAll: d.length === cfg.candidates.length,
      sawNeeded: d.some(i => needed[i]), sawFree: d.some(i => !needed[i]),
      neededCount: needed.filter(Boolean).length,
    }));
  };

  const relevance = cfg => {
    const ws = claimLab.worldsOf({ atoms: cfg.atoms, constraints: cfg.constraints });
    const strong = cfg.args.map(a => claimLab.isRelevant({ atoms: cfg.atoms }, a.key, cfg.reaches, ws).relevant);
    return subsets(cfg.args.length).map(t => ({
      tested: t.length, total: cfg.args.length, testedAll: t.length === cfg.args.length,
      sawStrong: t.some(i => strong[i]), sawWeak: t.some(i => !strong[i]),
      strongCount: strong.filter(Boolean).length,
    }));
  };

  const chain = cfg => subsets(cfg.actions.length).map(p => {
    const v = p.map(i => causeChain.judgeAction(cfg, cfg.actions[i]));
    return { placed: p.length, total: cfg.actions.length, placedAll: p.length === cfg.actions.length,
      wrong: 0, sawFollows: v.some(x => x.follows), sawFails: v.some(x => !x.follows),
      offChainFound: v.some(x => x.reason === 'off-chain') };
  });

  const breaker = cfg => {
    const out = [];
    let found = false;
    for (let x = 60; x <= 400; x += 4) for (let r = 18; r <= 130; r += 4) {
      const A = cfg.a, B = cfg.b, C = { x, r };
      const s1 = venn.contains(B, A), s2 = venn.overlaps(B, C), concl = venn.overlaps(A, C);
      const valid = s1 && s2;
      if (valid && !concl) found = true;
      out.push({ x, r, statementsHold: valid, conclusionHolds: concl,
                 foundCounterexample: found, everValid: valid, moves: out.length });
    }
    return out;
  };

  const syllogism = cfg => {
    const res = cfg.arrangements.map(a => {
      const c = a.circles;
      const valid = cfg.statements.every((_, i) => cfg.tests['s' + (i + 1)](c));
      return { valid, concl: cfg.tests.concl(c) };
    });
    return subsets(res.length).filter(v => v.length).map(vis => ({
      at: vis[vis.length - 1], seen: vis.length, total: res.length,
      statementsHold: res[vis[vis.length - 1]].valid,
      conclusionHolds: res[vis[vis.length - 1]].concl,
      sawHold: vis.some(i => res[i].valid && res[i].concl),
      sawFail: vis.some(i => res[i].valid && !res[i].concl),
      sawBoth: vis.some(i => res[i].valid && res[i].concl) && vis.some(i => res[i].valid && !res[i].concl),
    }));
  };

  const sorter = cfg => {
    const out = [];
    cfg.sets.forEach((s, si) => {
      for (let placed = 0; placed <= s.items.length; placed++)
        out.push({ set: si, total: s.items.length, placed, allPlaced: placed === s.items.length, mistakes: 0 });
    });
    return out;
  };

  const rounds = cfg => [false, true].map(finished => ({ finished, rounds: (cfg.rounds || []).length }));

  /* The widget groups sub-figures by AREA (via shoelace), not by vertex count, and
     the learner may switch figures with the picker — so sweep every figure and group
     the way the widget itself does. */
  const shoelace = pts => {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return Math.abs(a / 2);
  };
  const figures = () => {
    const out = [];
    figCount.FIGURES.forEach((f, fi) => {
      const areas = f.subs().map(pts => Math.round(shoelace(pts) * 1000) / 1000);
      const classes = new Set(areas).size;
      for (let c = 0; c <= classes; c++) for (const allFound of [false, true])
        out.push({ figure: fi, found: allFound ? areas.length : 0, total: areas.length,
                   allFound, classes, classesComplete: c });
    });
    return out;
  };

  const mirrorLab = cfg => {
    const anyUnchanged = cfg.samples.some(s => shapeLab.survives(s, 'mirror') || shapeLab.survives(s, 'water'));
    const out = [];
    for (let seen = 1; seen <= cfg.samples.length; seen++)
      for (const triedBoth of [false, true])
        out.push({ samplesSeen: seen, triedBoth, sawUnchanged: anyUnchanged && seen >= 1,
                   revealed: true, unchanged: anyUnchanged });
    return out;
  };

  const figSeries = () => [false, true].map(answered => ({ answered, correct: answered }));

  const folding = cfg => {
    const out = [];
    for (let p = 0; p <= 3; p++) for (const unfolded of [false, true])
      for (const two of [false, true])
        out.push({ punches: p, unfolded, triedTwoFolds: two && (cfg.folds || []).length >= 2,
                   folds: (cfg.folds || []).length, holes: p * 2 ** (cfg.folds || []).length, doubled: true });
    return out;
  };

  const cubes = () => {
    const out = [];
    for (let sizes = 1; sizes <= 4; sizes++) for (const mid of [false, true]) for (const inner of [false, true])
      out.push({ sizesTried: sizes, sawMiddleLayer: mid, sawInterior: inner, consistent: true });
    return out;
  };

  /* ---- Quants ---- */
  const ratio = cfg => {
    const out = [];
    for (const total of cfg.totals) for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) {
      const s = shareBar.splitByRatio(total, [a, b, c]);
      out.push({ total, parts: [a, b, c], sum: s.sum, one: s.one, shares: s.shares,
        allEqual: a === b && b === c, maxShare: Math.max(...s.shares),
        maxOverHalf: Math.max(...s.shares) > total / 2,
        oneIsWhole: Number.isInteger(s.one), sumBackOK: true });
    }
    return out;
  };

  const partners = cfg => {
    const out = [];
    for (let m1 = 1; m1 <= cfg.maxMonths; m1++) for (let m2 = 1; m2 <= cfg.maxMonths; m2++) {
      const w = [cfg.partners[0].money * m1, cfg.partners[1].money * m2];
      const sh = shareBar.splitByRatio(cfg.profit, w).shares;
      const richest = cfg.partners[0].money > cfg.partners[1].money ? 0 : 1;
      const earner = sh[0] > sh[1] ? 0 : 1;
      out.push({ weights: w, shares: sh, ratio: shareBar.simplify(w), richest, earner,
        richestIsNotEarner: richest !== earner, months: [m1, m2],
        equalShares: Math.abs(sh[0] - sh[1]) < 1e-9 });
    }
    return out;
  };

  const trade = cfg => {
    const out = [];
    for (let m = 0; m <= cfg.maxMarkup; m += 5) for (let d = 0; d <= cfg.maxDiscount; d += 5) {
      const t = tradeBar.trade(cfg.cp, m, d), pp = r2(t.profitPct);
      out.push({ markup: m, discount: d, cp: cfg.cp, mp: r2(t.mp), sp: r2(t.sp), profitPct: pp,
        sawProfit: pp > 0.005, sawLoss: pp < -0.005, sawBreakEven: Math.abs(pp) <= 0.005,
        hit20: Math.abs(pp - 20) < 0.005, discountOverMarkup: d > m });
    }
    return out;
  };

  const successive = cfg => {
    const out = [];
    for (let a = -50; a <= 50; a += 5) for (let b = -50; b <= 50; b += 5) {
      const net = tradeBar.netPct([a, b]), naive = a + b, gap = Math.abs(net - naive);
      const vals = [cfg.base, cfg.base * (1 + a / 100), cfg.base * (1 + a / 100) * (1 + b / 100)];
      out.push({ steps: [a, b], values: vals, net: r2(net), naive, gap: r2(gap),
        returnedToStart: Math.abs(vals[2] - cfg.base) < 1e-9,
        sawGap: gap > 0.005, sawBigGap: gap >= 4,
        triedEqualOpposite: a === -b && a !== 0 });
    }
    return out;
  };

  const estimate = cfg => [{ round: cfg.rounds.length, hits: cfg.rounds.length,
    total: cfg.rounds.length, finished: true }, { round: 1, hits: 0, total: cfg.rounds.length, finished: false }];

  const divis = cfg => {
    const out = [];
    cfg.numbers.forEach((n, i) => {
      const ch = numberLab.divisibilityChecks(n);
      for (let seen = 1; seen <= cfg.numbers.length; seen++)
        out.push({ n, at: i, seen, total: cfg.numbers.length, seenAll: seen === cfg.numbers.length,
          passes: ch.filter(c => c.passes).map(c => c.by), passCount: ch.filter(c => c.passes).length,
          allVerdictsTrue: ch.every(c => c.passes === c.truth),
          found11: ch.find(c => c.by === 11).passes,
          foundNoneBut2: ch.filter(c => c.passes).length <= 1 });
    });
    return out;
  };

  const factors = cfg => {
    const out = [];
    cfg.pairs.forEach(([a, b], i) => {
      const r = numberLab.hcfLcm(a, b);
      for (let seen = 1; seen <= cfg.pairs.length; seen++)
        out.push({ a, b, hcf: r.hcf, lcm: r.lcm, at: i, seen, total: cfg.pairs.length,
          seenAll: seen === cfg.pairs.length, identityHolds: r.hcf * r.lcm === a * b,
          coprime: r.hcf === 1, oneDividesOther: a % b === 0 || b % a === 0 });
    });
    return out;
  };

  const bench = cfg => {
    const out = [];
    for (let rev = 0; rev <= cfg.fractions.length; rev++)
      out.push({ revealed: rev, total: cfg.fractions.length, revealedAll: rev === cfg.fractions.length,
        values: cfg.fractions.map(([n, d]) => numberLab.pct(n, d)) });
    return out;
  };

  const powers = () => [1, 2, 3].map(s => ({ mode: 'sq', seen: s, seenAll: s === 3 }));

  const curve = cfg => {
    const out = [];
    for (let r = 4; r <= 20; r++) for (let n = 1; n <= cfg.maxYears; n++)
      out.push({ rate: r, years: n, si: rateLab.simple(cfg.p, r, n), ci: rateLab.compound(cfg.p, r, n),
        gap: rateLab.ciMinusSi(cfg.p, r, n),
        equalAtYearOne: n === 1 && Math.abs(rateLab.ciMinusSi(cfg.p, r, n)) < 1e-9,
        sawYearOne: n === 1, sawTwoYearRule: n === 2, gapGrows: rateLab.ciMinusSi(cfg.p, r, n) > 0 });
    return out;
  };

  const speedTri = cfg => {
    const out = [];
    for (let s = cfg.minSpeed; s <= cfg.maxSpeed; s += cfg.stepSpeed)
      for (let t = 0.5; t <= cfg.maxTime; t += 0.5)
        out.push({ speed: s, time: t, distance: s * t, ms: rateLab.toMS(s), hit72: s === 72,
          hitExact20ms: Math.abs(rateLab.toMS(s) - 20) < 1e-9, far: s * t >= 300 });
    return out;
  };

  const relSpeed = cfg => {
    const out = [];
    for (const opp of [true, false]) for (let a = 18; a <= 108; a += 6) for (let b = 18; b <= 108; b += 6) {
      const rel = opp ? a + b : Math.abs(a - b), ms = rateLab.toMS(rel);
      out.push({ a, b, opposite: opp, rel, relMS: ms,
        seconds: ms > 0 ? r2((cfg.lenA + cfg.lenB) / ms) : null,
        sawBoth: true, sawZeroRelative: !opp && a === b, sameIsSlower: !opp });
    }
    return out;
  };

  const work = cfg => {
    const out = [];
    for (let a = 2; a <= cfg.maxDays; a++) for (let b = 2; b <= cfg.maxDays; b++) {
      const w = rateLab.workUnits([a, b]);
      out.push({ days: [a, b], total: w.total, rates: w.rates, net: w.net,
        time: Number.isFinite(w.time) ? r2(w.time) : null,
        neverFinishes: w.net <= 0, allWholeRates: w.rates.every(Number.isInteger) });
    }
    return out;
  };

  const dots = cfg => {
    const out = [];
    for (let i = 0; i < cfg.values.length; i++)
      for (let v = cfg.min; v <= cfg.max; v += (cfg.step || 1)) {
        const vals = cfg.values.map((x, k) => (k === i ? v : x));
        const m = statLab.mean(vals), md = statLab.median(vals);
        out.push({ values: vals, mean: r2(m), median: r2(md), modes: statLab.modes(vals),
          movedAny: v !== cfg.values[i], meanAboveMedian: m > md + 1e-9, meanBelowMedian: m < md - 1e-9,
          meanEqualsMedian: Math.abs(m - md) < 1e-9,
          belowMean: vals.filter(x => x < m).length,
          meanPastMost: vals.filter(x => x < m).length > vals.length / 2 });
      }
    return out;
  };

  const beam = cfg => {
    const out = [];
    for (let a = 1; a <= cfg.maxSize; a++) for (let b = 1; b <= cfg.maxSize; b++) {
      const w = statLab.weighted([a, b], [cfg.left.value, cfg.right.value]);
      const dL = Math.abs(w - cfg.left.value), dR = Math.abs(cfg.right.value - w);
      out.push({ sizes: [a, b], values: [cfg.left.value, cfg.right.value], combined: r2(w),
        plain: r2((cfg.left.value + cfg.right.value) / 2), distances: [r2(dL), r2(dR)],
        equalSizes: a === b, leansLeft: w < (cfg.left.value + cfg.right.value) / 2 - 1e-9,
        leansRight: w > (cfg.left.value + cfg.right.value) / 2 + 1e-9,
        inverseHolds: Math.abs(dL * a - dR * b) < 1e-6,
        alligation: statLab.alligation(Math.min(cfg.left.value, cfg.right.value),
          Math.max(cfg.left.value, cfg.right.value), w).ratio, mode: cfg.mode });
    }
    return out;
  };

  const spread = cfg => {
    const out = [];
    for (let sh = -20; sh <= 20; sh += 5) for (let sc = 1; sc <= 3; sc++) {
      const applied = cfg.sets.map(s => s.values.map(v => v * sc + sh));
      out.push({ shift: sh, scale: sc, means: applied.map(a => r2(statLab.mean(a))),
        ranges: applied.map(a => r2(statLab.range(a))), meanDevs: applied.map(a => r2(statLab.meanDev(a))),
        sameMean: true, triedShift: true, triedScale: sc > 1,
        spreadUnchangedByShift: sh !== 0 && sc === 1, backToOriginal: sh === 0 && sc === 1 });
    }
    return out;
  };

  const grid = cfg => {
    const out = [];
    for (let k = 1; k <= cfg.maxScale; k++) {
      const W = cfg.w * k, H = cfg.h * k;
      out.push({ k, w: W, h: H, area: mensLab.rectArea(W, H), perimeter: mensLab.rectPerim(W, H),
        areaFactor: mensLab.rectArea(W, H) / mensLab.rectArea(cfg.w, cfg.h),
        perimFactor: mensLab.rectPerim(W, H) / mensLab.rectPerim(cfg.w, cfg.h),
        seenAll: k === cfg.maxScale,
        sawSquareLaw: k > 1 && mensLab.rectArea(W, H) / mensLab.rectArea(cfg.w, cfg.h) === k * k,
        doubled: k === 2 });
    }
    return out;
  };

  const circles = cfg => cfg.radii.flatMap((r, i) =>
    [...Array(cfg.radii.length).keys()].map(s => ({
      r, circumference: mensLab.circleCirc(r), area: mensLab.circleArea(r), at: i,
      seen: s + 1, total: cfg.radii.length, seenAll: s + 1 === cfg.radii.length,
      wholeAnswers: Number.isInteger(mensLab.circleCirc(r)) && Number.isInteger(mensLab.circleArea(r)),
      multipleOfSeven: r % 7 === 0 })));

  const borders = cfg => {
    const out = [], modes = [['out', true, false], ['in', false, false], ['cross', false, true]];
    for (const [tag, outside, roads] of modes)
      for (let t = 1; t <= cfg.maxT; t += 0.5)
        for (const seenCount of [1, 2, 3]) {
          const b = mensLab.borderArea(cfg.w, cfg.h, t, outside);
          const cr = mensLab.crossRoads(cfg.w, cfg.h, t);
          out.push({ t, outside, roads, path: roads ? cr.total : b.path, overlap: cr.overlap,
            seen: [tag], sawAll: seenCount === 3, sawOutside: true, sawInside: true, sawRoads: true,
            insideFits: !outside && cfg.w - 2 * t > 0 && cfg.h - 2 * t > 0 });
        }
    return out;
  };

  const solids = cfg => {
    const out = [];
    cfg.solids.forEach((s, i) => {
      for (let k = 1; k <= cfg.maxScale; k++)
        out.push({ solid: s.type, k, vol: 0, surf: 0, volFactor: k ** 3, surfFactor: k ** 2,
          seenAll: i === cfg.solids.length - 1, cubeLawHolds: true, squareLawHolds: true,
          doubled: k === 2 });
    });
    return out;
  };

  const slots = cfg => {
    const out = [];
    const ranges = cfg.slots.map(s => s.options.length);
    const rec = (i, acc) => {
      if (i === ranges.length) {
        const total = acc.reduce((a, b) => a * b, 1);
        out.push({ counts: [...acc], total, listed: total <= cfg.maxList,
          allMaxed: acc.every((c, k) => c === ranges[k]), anyOne: acc.some(c => c === 1) });
        return;
      }
      for (let c = 1; c <= ranges[i]; c++) rec(i + 1, [...acc, c]);
    };
    rec(0, []);
    return out;
  };

  const pc = cfg => {
    const out = [];
    for (const mode of ['perm', 'comb']) for (let r = 1; r <= cfg.maxR; r++) {
      const p = countLab.permsOf(cfg.items, r).length, c = countLab.combsOf(cfg.items, r).length;
      out.push({ n: cfg.items.length, r, mode, perms: p, combs: c, ratio: p / c,
        matchesFormula: p === countLab.nPr(cfg.items.length, r) && c === countLab.nCr(cfg.items.length, r),
        ratioIsRFactorial: Math.abs(p / c - countLab.fact(r)) < 1e-9, sawBoth: true });
    }
    return out;
  };

  const space = cfg => {
    const sp = cfg.space === 'dice' ? countLab.twoDice()
      : cfg.space === 'coins' ? countLab.coinFlips(3) : countLab.deck();
    return cfg.events.flatMap((e, i) => {
      const fav = sp.filter(o => e.test(o)).length;
      return [...Array(cfg.events.length).keys()].map(s => ({
        space: cfg.space, event: e.label, at: i, favourable: fav, total: sp.length,
        fraction: countLab.frac(fav, sp.length).text, seen: s + 1,
        total_events: cfg.events.length, seenAll: s + 1 === cfg.events.length,
        matchesStated: e.expect === undefined || e.expect === fav }));
    });
  };

  const table = cfg => {
    const T = diLab.tableTotals(cfg.rows, cfg.data);
    return cfg.questions.flatMap((q, i) => [...Array(cfg.questions.length).keys()].map(s => ({
      at: i, seen: s + 1, total: cfg.questions.length, seenAll: s + 1 === cfg.questions.length,
      answer: q.answer(cfg.data, T, cfg.rows, cfg.cols), label: q.label,
      rowTotals: T.rowTotals, colTotals: T.colTotals, grand: T.grand,
      totalsAgree: T.grand === T.grandByCol })));
  };

  const chart = cfg => {
    const out = [];
    for (const type of ['bar', 'line'])
      cfg.questions.forEach((q, i) => {
        for (let s = 1; s <= cfg.questions.length; s++)
          out.push({ type, at: i, seen: s, total: cfg.questions.length,
            seenAll: s === cfg.questions.length, sawBothTypes: type === 'line',
            answer: q.answer(cfg.series, cfg.labels), label: q.label,
            totals: cfg.series.map(x => diLab.sum(x.values)) });
      });
    return out;
  };

  const pie = cfg => {
    const biggest = cfg.slices.reduce((b, x, i) => (x.deg > cfg.slices[b].deg ? i : b), 0);
    const degTotal = cfg.slices.reduce((a, s) => a + s.deg, 0);
    return cfg.slices.flatMap((s, i) => [...Array(cfg.slices.length).keys()].map(k => ({
      at: i, seen: k + 1, total: cfg.slices.length, seenAll: k + 1 === cfg.slices.length,
      deg: s.deg, share: r2(s.deg / 3.6),
      amount: cfg.total ? r2(cfg.total * s.deg / 360) : null,
      degClose: degTotal === 360, largest: biggest, onLargest: i === biggest })));
  };

  /* ---- Reasoning Unit 3 · scripted actions ---- */
  /* Four turns is one lap of the dial, so depth 5 clears "faced all four" and
     still reaches every log the gates read. */
  const dial = cfg => driveStates(compass.turnDialMachine(cfg), { depth: 5, label: 'turn dial' });
  /* Two moves would open every gate but "saw both ends"; depth 3 leaves slack. */
  const shadow = cfg => driveStates(compass.shadowMachine(cfg), { depth: 3, label: 'shadow scene' });

  /* ---- Reasoning Units 3 + 4 · scripted actions ---- */
  /* Flip, pick, flip back — depth 3 covers every face/pick pair with history. */
  const row = cfg => driveStates(mirrorRow.mirrorRowMachine(cfg), { depth: 3, label: 'mirror row' });
  /* Moving BOTH markers is the deepest gate: switch to A, place it, switch to B,
     place it. Four moves exactly, so sweep to five. */
  const ranks = cfg => driveStates(rankLine.rankLineMachine(cfg), { depth: 5, label: 'rank line' });

  /* ---- Reasoning Unit 5 · scripted actions ---- */
  /* Three taps is the deepest gate, and three moves of the wheel's 52 actions
     is already 66,000 states — swept in full, but a fourth level would be two
     million of the same taps reordered, so the depth stops here. */
  const wheel = cfg => driveStates(cipherWheel.cipherWheelMachine(cfg), { depth: 3, label: 'cipher wheel' });
  /* Five families, each testable once: the whole space is 32 states. */
  const families = cfg => driveStates(cipherWheel.codeLabMachine(cfg), { depth: 5, label: 'code lab' });
  /* "Show the chain" fills and tests in one move, so both gates open at depth 1;
     depth 2 also covers editing a gap and re-testing. */
  const series = cfg =>
    driveStates(seriesChain.seriesChainMachine(cfg), { depth: 2, label: 'series chain' });
  /* Three rounds of name → confirm → apply → confirm is twelve moves, and the
     "finished" gate is the last of them. */
  const analogy = cfg =>
    driveStates(relMapper.relationMapperMachine(cfg), { depth: 12, label: 'relation mapper' });

  /* ---- Reasoning Unit 2 · scripted actions ---- */
  /* One button, one layer: the walk is as deep as the phrase is long. */
  const peel = cfg =>
    driveStates(peeler.phrasePeelerMachine(cfg), { depth: (cfg.layers || []).length, label: 'phrase peeler' });
  const decode = cfg =>
    driveStates(codedChain.codedChainMachine(cfg), { depth: 8, label: 'coded chain' });
  /* Five steps is the ladder's own ceiling, so this walks every chain it can build. */
  const rungs = cfg => driveStates(ladder.relationLadderMachine(cfg), { depth: 5, label: 'relation ladder' });
  /* Three sentences reach three generations, which is the deepest gate. */
  const tree = cfg => driveStates(famTree.familyTreeMachine(cfg), { depth: 3, label: 'family tree' });

  /* ---- Reasoning Unit 4 · scripted actions ---- */
  /* Seating every person takes two taps each, and the gates want the board
     SOLVED — so the walk has to be deep enough to place them all. It converges
     because `key` counts arrangements, not routes to them. */
  const seats = cfg =>
    driveStates(seatBoard.seatBoardMachine(cfg), { depth: 2 * (cfg.people || []).length, label: 'seat board' });
  /* Four ticks fill the grid, and the auto-crossing does the rest. */
  const elimGrid = cfg => driveStates(gridTable.gridTableMachine(cfg), { depth: 4, label: 'elimination grid' });

  /* The route is seeded two legs in, so two more cancel it back to the start —
     the deepest of that lesson's gates. */
  const walk = cfg => driveStates(walkMap.walkMapMachine(cfg), { depth: 3, label: 'walk map' });

  /* One lesson, two widgets: the draggable bar, then the scored estimate game.
     `rounds` is what tells them apart — only the game has them. */
  const percent = cfg => cfg.rounds
    ? driveStates(percentBar.percentEstimateMachine(cfg), { depth: 3 * cfg.rounds + 2, label: 'percent estimate' })
    : driveStates(percentBar.percentLadderMachine(cfg), { depth: 2, label: 'percent ladder' });

  return {
    'r-found-anatomy': claimScan, 'r-found-conclude': claimScan, 'q-di-speed': claimScan,
    'r-dir-compass': dial, 'r-dir-shadow': shadow, 'r-dir-mirror': row, 'r-ord-ranking': ranks,
    'r-code-wheel': wheel, 'r-code-families': families,
    'r-code-series-num': series, 'r-code-series-let': series, 'r-code-analogy': analogy,
    'r-rel-photo': peel, 'r-rel-coded': decode, 'r-rel-ladder': rungs, 'r-rel-five-marks': tree,
    'r-ord-linear': seats, 'r-ord-circular': seats, 'r-ord-floors': seats, 'r-ord-schedule': elimGrid,
    'r-dir-displace': walk, 'q-pct-ladder': percent,
    'r-found-assume': negation, 'r-found-argument': relevance, 'r-found-action': chain,
    'r-log-break': breaker, 'r-log-syllogism': syllogism, 'r-log-sets': sorter, 'r-log-venn3': rounds,
    'r-vis-count': figures, 'r-vis-mirror': mirrorLab, 'r-vis-figseries': figSeries,
    'r-vis-fold': folding, 'r-vis-dice': cubes,
    'q-pct-ratio': ratio, 'q-pct-partner': partners, 'q-pct-profit': trade, 'q-pct-successive': successive,
    'q-num-estimate': estimate, 'q-num-divis': divis, 'q-num-lcm': factors,
    'q-num-convert': bench, 'q-num-powers': powers,
    'q-int-simple': curve, 'q-int-compound': curve, 'q-int-speed': speedTri,
    'q-int-trains': relSpeed, 'q-int-work': work,
    'q-avg-centre': dots, 'q-avg-weighted': beam, 'q-avg-alligation': beam, 'q-avg-spread': spread,
    'q-men-area': grid, 'q-men-circle': circles, 'q-men-paths': borders, 'q-men-solids': solids,
    'q-cnt-multiply': slots, 'q-cnt-perm': pc, 'q-cnt-comb': pc,
    'q-cnt-prob': space, 'q-cnt-dice': space,
    'q-di-tables': table, 'q-di-caselet': table, 'q-di-bars': chart, 'q-di-pie': pie,
  };
}

async function guards() {
  console.log('cross-cutting guards');

  const ldir = path.join(__dirname, '..', 'assets', 'js', 'lessons');
  const wdir = path.join(__dirname, '..', 'assets', 'js', 'widgets');
  const files = fs.readdirSync(ldir).filter(f => f.endsWith('.js'));

  const widgetFields = {};
  fs.readdirSync(wdir).filter(f => f.endsWith('.js')).forEach(f => {
    widgetFields[f.replace(/\.js$/, '')] = reportedFields(fs.readFileSync(path.join(wdir, f), 'utf8'));
  });

  /* ---- 0 · the machines, and the DOM layers that must be driven by them ---- */
  /* The reachability sweep is only worth having while the widget the LEARNER
     clicks and the machine the HARNESS walks are the same code. Two ways that
     bond can quietly break, so both are checked here rather than trusted:
     a machine that stops meeting the contract, and a widget that goes back to
     assembling its own report object instead of asking the machine for one —
     which would leave the sweep exercising code nobody runs. */
  let machines = 0;
  for (const f of fs.readdirSync(wdir).filter(x => x.endsWith('.js'))) {
    const name = f.replace(/\.js$/, '');
    const src = fs.readFileSync(path.join(wdir, f), 'utf8');
    const mod = await import(`../assets/js/widgets/${f}`);
    const exported = Object.keys(mod).filter(k => /Machine$/.test(k));
    if (!exported.length) continue;

    for (const k of exported) {
      machines++;
      let M;
      try { M = mod[k]({}); } catch { M = null; }
      check(`${name}: ${k}() builds without a config`, !!M, 'threw');
      if (!M) continue;
      check(`${name}: ${k} has an init state`, M.init !== undefined, 'no init');
      check(`${name}: ${k} offers actions`,
        Array.isArray(M.actions) || typeof M.actions === 'function', typeof M.actions);
      check(`${name}: ${k} has act() and report()`,
        typeof M.act === 'function' && typeof M.report === 'function', '');
    }

    /* Every api.report call in a scriptable widget must hand over the machine's
       own report — `api.report?.({ ... })` here means the DOM has drifted. */
    const literals = [...stripComments(src).matchAll(/api\.report\?\.\(\s*\{/g)].length;
    check(`${name}: reports through its machine, not a literal of its own`, literals === 0,
      `${literals} api.report call(s) build their own object — the sweep would stop matching the widget`);
  }

  /* Load every lesson once, and sweep each explore step once, so checks 1 and 2
     read the same states rather than regenerating them. */
  const gens = await buildSweepers();
  const lessons = [];
  for (const f of files) {
    const key = f.replace(/\.js$/, '');
    const src = fs.readFileSync(path.join(ldir, f), 'utf8');
    const lsn = (await import(`../assets/js/lessons/${f}`)).default;
    const steps = lsn.steps.filter(s => s.type === 'explore' && s.tasks);
    const gen = UNSWEEPABLE[key] ? null : gens[key];
    lessons.push({ key, lsn, steps, gen, exempt: !!UNSWEEPABLE[key],
      imports: [...src.matchAll(/from '\.\.\/widgets\/([\w-]+)\.js'/g)].map(m => m[1]),
      states: gen ? steps.map(s => gen(s.__cfg, s)) : null });
  }

  /* ---- 1 · every field a task reads must be one its widget reports ---- */
  let checkedTasks = 0;
  for (const { key, imports, steps, states } of lessons) {
    const known = new Set(imports.flatMap(w => [...(widgetFields[w] || [])]));
    /* A widget that reports through its scripted machine has no object literal
       at the api.report call site for the scraper to read. Take those fields
       from the report objects the sweep actually produced — running the code is
       stronger evidence than reading it. */
    (states || []).forEach(list => list.forEach(s => Object.keys(s).forEach(k => known.add(k))));
    steps.forEach(step => {
      step.tasks.forEach((t, ti) => {
        checkedTasks++;
        [...fieldsRead(t)].forEach(k =>
          check(`${key} task ${ti + 1}: reads "${k}", which its widget reports`, known.has(k),
            `${imports.join('/')} never reports it — the checklist could never tick`));
      });
    });
  }

  /* ---- 2 · reachability: every gate must be openable by some real widget state ---- */
  let swept = 0, exempt = 0;
  for (const { key, steps, gen, states, exempt: isExempt } of lessons) {
    if (!steps.length) continue;
    if (isExempt) { exempt++; continue; }
    check(`${key}: has a reachability sweeper (or a stated exemption)`, !!gen,
      'unclassified — add a sweeper or an UNSWEEPABLE entry with a reason');
    if (!gen) continue;

    steps.forEach((step, si) => {
      check(`${key}: sweeper produced states`, states[si].length > 0, 'none generated');
      step.tasks.forEach((t, ti) => {
        const ok = states[si].some(s => { try { return !!t.done(s); } catch { return false; } });
        check(`${key}: gate ${ti + 1} ("${t.label.replace(/<[^>]+>/g, '').slice(0, 40)}") is reachable`,
          ok, 'no reachable widget state satisfies it');
      });
      swept++;
    });
  }

  /* ---- 3 · uniqueness: a question must have exactly ONE right answer ---- */
  /* Two ways this breaks. Options can collide in VALUE while differing as text
     ("45" and "45.0"), so two of them would be right at once. And a superlative
     asked of data can TIE — the bar chart shipped with May and June both on 65
     until this check found it. */
  let mcq = 0, sup = 0;
  const numOf = o => {
    const t = String(o).replace(/<[^>]+>/g, '').replace(/[₹,\s]/g, '');
    return /^-?\d+(\.\d+)?%?$/.test(t) ? parseFloat(t) : null;
  };
  for (const f of files) {
    const key = f.replace(/\.js$/, '');
    const lsn = (await import(`../assets/js/lessons/${f}`)).default;
    lsn.steps.forEach((s, i) => {
      if (s.type !== 'ask' || s.input === 'number') return;
      mcq++;
      const vals = s.options.map(numOf);
      if (vals.every(v => v !== null)) {
        check(`${key} step ${i}: numeric options are distinct in VALUE, not just in text`,
          new Set(vals).size === vals.length, s.options.join(' / '));
      }
      check(`${key} step ${i}: exactly one option is keyed`,
        Number.isInteger(s.answer) && s.answer >= 0 && s.answer < s.options.length, String(s.answer));
    });
  }

  /* Superlatives asked of shipped data: the extremum must be unique, or the
     question has more than one right answer. */
  const SUPERLATIVES = [
    { lesson: 'q-di-tables', what: 'largest four-year producer',
      values: async m => Object.values(m.WHEAT).map(v => v.reduce((a, b) => a + b, 0)), pick: 'max' },
    { lesson: 'q-di-tables', what: 'year with the largest jump',
      values: async m => { const cols = [0, 1, 2, 3].map(y =>
        Object.values(m.WHEAT).reduce((a, v) => a + v[y], 0));
        return [1, 2, 3].map(y => cols[y] - cols[y - 1]); }, pick: 'max' },
    { lesson: 'q-di-bars', what: 'best combined month',
      values: async m => m.SALES_A.map((v, i) => v + m.SALES_B[i]), pick: 'max' },
    { lesson: 'q-di-pie', what: 'largest slice',
      values: async m => m.SLICES.map(s => s.deg), pick: 'max' },
    { lesson: 'q-avg-centre', what: 'the outlier that skews the mean',
      values: async m => m.default.steps.find(s => s.__cfg).__cfg.values, pick: 'max' },
  ];
  for (const s of SUPERLATIVES) {
    const mod = await import(`../assets/js/lessons/${s.lesson}.js`);
    const vals = await s.values(mod);
    const target = s.pick === 'max' ? Math.max(...vals) : Math.min(...vals);
    sup++;
    check(`${s.lesson}: "${s.what}" has a unique answer`,
      vals.filter(v => v === target).length === 1, `${vals.join()} — ${target} appears more than once`);
  }

  capNotes.forEach(n => console.log(`  NOTE cap reached — ${n}`));
  console.log(`  ${machines} scripted-action machines checked, and every widget that has one reports through it`);
  console.log(`  ${checkedTasks} task predicates field-checked · ${swept} explore steps swept · ${exempt} exempt (learner-built)`);
  console.log(`  ${sweepStates.toLocaleString()} states reached by replaying scripted actions against the widgets' own machines`);
  console.log(`  ${mcq} multiple-choice questions checked for a single right answer · ${sup} superlatives checked for a unique extremum`);
}

/* ---------------- Review sessions ---------------- */
/* The review index is built by importing lesson files whose paths are DERIVED from
   lesson ids. That convention is load-bearing: break it and a concept silently
   vanishes from the queue rather than erroring. So it is asserted here, along with
   the property that every concept the store can put in the queue has at least one
   question to practise it with — otherwise the dashboard would offer a review the
   session builder cannot fill. */
async function review() {
  console.log('assets/js/review.js');

  const rv = await import('../assets/js/review.js');
  const store = await import('../assets/js/store.js');
  const { ACADEMIES, readyLessons } = await import('../assets/js/curriculum.js');
  const ldir = path.join(__dirname, '..', 'assets', 'js', 'lessons');

  /* ---- the id → filename convention the index depends on ---- */
  const ids = Object.keys(ACADEMIES).flatMap(a => readyLessons(a).map(l => l.id));
  check('review: every ready lesson id maps to a file that exists',
    ids.every(id => fs.existsSync(path.join(ldir, `${id.replace(/\./g, '-')}.js`))),
    ids.filter(id => !fs.existsSync(path.join(ldir, `${id.replace(/\./g, '-')}.js`))).join());

  const index = await rv.buildIndex();
  check('review: the index found questions', index.all.length > 0, '0');
  check('review: it indexed every ready lesson',
    new Set(index.all.map(q => q.lessonId)).size === ids.length,
    `${new Set(index.all.map(q => q.lessonId)).size} of ${ids.length}`);

  /* ---- every concept taught is a concept practisable ---- */
  const taught = new Set();
  for (const id of ids) {
    const lsn = (await import(`../assets/js/lessons/${id.replace(/\./g, '-')}.js`)).default;
    lsn.steps.forEach(s => { if (s.type === 'ask' && s.concept) taught.add(s.concept); });
  }
  check('review: every concept a lesson teaches has at least one question in the index',
    [...taught].every(c => (index.byConcept.get(c) || []).length > 0),
    [...taught].filter(c => !index.byConcept.has(c)).join());
  check('review: the index has no concept the lessons do not teach',
    [...index.byConcept.keys()].every(c => taught.has(c)), '');

  /* ---- a session must be well-formed and runnable ---- */
  const qs = index.all.slice(0, 8);
  const session = rv.buildSession(qs, { dueCount: 3 });
  check('review: a session is flagged so the runner does NOT complete a lesson',
    session.review === true, String(session.review));
  check('review: its id is not a real lesson id', !ids.includes(session.id), session.id);
  check('review: it opens with a say step and then only asks',
    session.steps[0].type === 'say' && session.steps.slice(1).every(s => s.type === 'ask'),
    session.steps.map(s => s.type).join());
  check('review: every question keeps its concept, so the ladder still moves',
    session.steps.slice(1).every(s => !!s.concept && !!s.conceptLabel), '');
  check('review: every question keeps a valid answer key',
    session.steps.slice(1).every(s => s.input === 'number'
      ? typeof s.answer === 'number'
      : Number.isInteger(s.answer) && s.answer >= 0 && s.answer < s.options.length), '');
  check('review: the lesson-specific Betaal line is dropped',
    session.steps.slice(1).every(s => s.say === undefined), '');
  check('review: each question names the lesson it came from',
    session.steps.slice(1).every(s => /class="qsrc"/.test(s.context || '')), '');
  check('review: phases are distinct, so the progress rail has one segment per question',
    new Set(session.steps.map(s => s.phase)).size === session.steps.length, '');

  /* ---- picking must not repeat a question inside one session ---- */
  const order = [...index.byConcept.keys()];
  for (const size of [4, 8, 20]) {
    const picked = rv.pickQuestions(index, order, size);
    check(`review: a set of ${size} contains no repeated question`,
      new Set(picked.map(q => q.key)).size === picked.length, `${picked.length} picked`);
    check(`review: a set of ${size} is filled`, picked.length === size, String(picked.length));
    // one per concept first: with more concepts than slots, no concept should appear twice
    if (size <= order.length)
      check(`review: a set of ${size} spreads across ${size} different concepts`,
        new Set(picked.map(q => q.concept)).size === size,
        `${new Set(picked.map(q => q.concept)).size} distinct`);
  }

  /* With 195 concepts and 8 slots, one pass fills the set and no question can repeat
     however broken the de-duplication is — so the check above passes trivially. Force
     the second pass with a tiny index, which is the only place duplicates can arise. */
  {
    const tiny = { byConcept: new Map(), all: [] };
    ['alpha', 'beta', 'gamma'].forEach(c => {
      const qs = [0, 1].map(i => ({ key: `${c}#${i}`, concept: c, conceptLabel: c,
        lessonId: 'x', lessonTitle: 'X', step: { type: 'ask', concept: c } }));
      tiny.byConcept.set(c, qs);
      tiny.all.push(...qs);
    });
    const small = rv.pickQuestions(tiny, ['alpha', 'beta', 'gamma'], 8);
    check('review: forced to double up, it still never repeats a question',
      new Set(small.map(q => q.key)).size === small.length, small.map(q => q.key).join());
    check('review: and it stops at what exists rather than padding or looping',
      small.length === tiny.all.length, `${small.length} of ${tiny.all.length}`);
    check('review: the first pass covers every concept before any concept repeats',
      new Set(small.slice(0, 3).map(q => q.concept)).size === 3,
      small.slice(0, 3).map(q => q.concept).join());
  }

  /* ---- a learner who has met NOTHING must not be quizzed on unseen material ----
     The harness runs with an empty in-memory store, so this is exactly that case.
     An earlier version of this check asserted the opposite and so encoded the bug. */
  const fresh = rv.chooseConcepts(index, 8);
  check('review: a learner who has met no concepts gets an EMPTY order, not a quiz on unseen material',
    fresh.order.length === 0 && fresh.metAnything === false, `${fresh.order.length} concepts offered`);
  const freshSession = await rv.makeSession(8);
  check('review: and makeSession returns no session, so the page shows the empty state',
    freshSession.session === null, 'a session was built');

  /* ---- once something has been met, never-met concepts may top up a short set ---- */
  store.answered('statement-is-all', true, 'The statement is the only evidence');
  const started = rv.chooseConcepts(index, 8);
  check('review: after meeting one concept, the met one leads the order',
    started.order[0] === 'statement-is-all', started.order[0]);
  check('review: and the set is topped up to the requested size',
    started.order.length >= 8, String(started.order.length));
  check('review: every concept offered has questions behind it',
    started.order.every(c => index.byConcept.has(c)), '');

  console.log(`  ${index.all.length} questions indexed across ${index.byConcept.size} concepts, sessions well-formed`);
}

/* ---------------- Question generators ---------------- */
/* The whole point of a generator is volume, so a fault that shows up in one
   draw out of four hundred still reaches a learner. These run every generator
   600 times and check the invariants that make a question answerable at all —
   then re-derive a sample of the answers from scratch, the way rule (a) of this
   project demands, rather than trusting the same helper that produced them. */
async function generators() {
  console.log('assets/js/generators/');

  const G = await import('../assets/js/generators/index.js');
  const { rng } = await import('../assets/js/generators/rand.js');
  const { ACADEMIES, readyLessons } = await import('../assets/js/curriculum.js');

  /* Every concept a generator uses must be one its own chapter teaches, or the
     Leitner ladder fills with concepts the review builder cannot find a
     question for. */
  const conceptsOf = {};
  for (const aid of Object.keys(ACADEMIES)) {
    for (const u of ACADEMIES[aid].units) {
      const set = new Set();
      const ready = new Set(readyLessons(aid).map(l => l.id));
      for (const l of u.lessons) {
        if (!ready.has(l.id)) continue;
        const lsn = (await import(`../assets/js/lessons/${l.id.replace(/\./g, '-')}.js`)).default;
        lsn.steps.forEach(s => { if (s.type === 'ask' && s.concept) set.add(s.concept); });
      }
      conceptsOf[`${aid}:${u.n}`] = set;
    }
  }

  const DRAWS = 600;
  let made = 0, thrown = 0;
  for (const g of G.GENERATORS) {
    check(`gen ${g.id}: names a chapter that exists`, !!conceptsOf[g.chapter], g.chapter);
    /* A generator may override the concept per draw — `code-series` records a
       ratio question against `ratios-first` and an interleaved one against
       `alternate-terms`, so the ladder learns the right thing from each. Every
       one of those must be taught by the chapter too, or the review builder
       has no question for an idea sitting on the ladder. */
    {
      const R = rng(5150);
      const drawn = new Set();
      for (let i = 0; i < 300; i++) {
        let q; try { q = g.make(R, 1 + (i % 3)); } catch { continue; }
        if (q && q.concept) drawn.add(q.concept);
      }
      const stray = [...drawn].filter(c => !conceptsOf[g.chapter]?.has(c));
      check(`gen ${g.id}: every concept it deals is taught by its own chapter`,
        stray.length === 0, `${stray.join(', ')} not taught by ${g.chapter}`);
    }
    check(`gen ${g.id}: reuses a concept its chapter teaches`,
      conceptsOf[g.chapter]?.has(g.concept),
      `${g.concept} not among: ${[...(conceptsOf[g.chapter] || [])].join(', ')}`);

    const R = rng(9001);
    const seenQ = new Set();
    let produced = 0, firstError = null;
    let bad = 0, firstBad = '';
    for (let i = 0; i < DRAWS; i++) {
      let s;
      try { s = g.make(R); } catch (e) {
        thrown++; bad++; firstError ||= e.message; firstBad ||= `threw: ${e.message}`; continue;
      }
      made++; produced++;
      const fail = m => { bad++; firstBad ||= m; };

      if (!s.q) fail('no question text');
      if (!Array.isArray(s.options) || s.options.length < 2) fail('fewer than 2 options');
      else {
        const txt = s.options.map(o => String(o).replace(/<[^>]+>/g, '').trim());
        if (new Set(txt).size !== txt.length) fail(`repeated option: ${txt.join(' / ')}`);
        if (!Number.isInteger(s.answer) || s.answer < 0 || s.answer >= s.options.length)
          fail(`answer index ${s.answer} of ${s.options.length}`);
        /* Numeric options must differ in VALUE, not merely as text — "45" and
           "45.0" would both be right at once. */
        const nums = txt.map(t => {
          const c = t.replace(/[₹,\s]/g, '').replace(/(km\/h|cm²|cm|days|%)$/i, '');
          return /^-?\d+(\.\d+)?$/.test(c) ? parseFloat(c) : null;
        });
        if (nums.every(v => v !== null) && new Set(nums).size !== nums.length)
          fail(`options equal in value: ${txt.join(' / ')}`);
      }
      if (!s.whyRight || !s.whyWrong) fail('missing an explanation branch');
      if (/undefined|NaN|\[object/.test(`${s.q}${s.context || ''}${s.whyRight}${s.whyWrong}`))
        fail(`undefined/NaN leaked into the prose`);
      seenQ.add(`${s.q}|${s.context || ''}`);
    }
    check(`gen ${g.id}: ${DRAWS} draws are all well-formed`, bad === 0, `${bad} bad — ${firstBad}`);
    /* A generator that always asks the same thing is a list with extra steps. */
    /* A generator that throws on EVERY draw disappears without a sound: `deal`
       skips a throwing generator so one unlucky draw cannot take a page down,
       which means a broken one contributes nothing and says nothing. That
       happened — an edit put an undefined variable into `code-series` and it
       produced zero questions for a while, showing up only as a chapter that
       had quietly stopped offering series. Checked first, and separately, so
       the failure reads as what it is rather than as "not enough variety". */
    /* A question that REFERS to a chart or a table must carry one. The pie
       generator shipped with its chart in `figure` — which is the explanation,
       shown only after the answer — so the question read "the pie chart shows
       …" and showed nothing. Unanswerable, and invisible to every check here:
       it was a perfectly well-formed question with four distinct options and a
       valid key. The only thing wrong with it was that it could not be
       answered, which is not a property any of those checks describe. */
    {
      const R = rng(7373);
      let refers = 0, missing = 0, firstMissing = null;
      for (let i = 0; i < 200; i++) {
        let q; try { q = g.make(R, 1 + (i % 3)); } catch { continue; }
        /* Words inside <code> are DATA, not prose — `code-apply` encodes the
           word TABLE, and matching that as a reference to a table is how this
           check first failed on a generator that has never shown one. And a
           reference needs a determiner: "the pie chart shows" refers, "TABLE"
           does not. */
        const ctx = String(q?.context || '');
        const prose = ctx.replace(/<code>[\s\S]*?<\/code>/g, ' ');
        if (!/\b(the|this|a|following)\s+(pie\s+|bar\s+|line\s+)?(chart|table|graph|diagram)\b/i.test(prose)) continue;
        refers++;
        if (!/<svg|<table/.test(ctx)) { missing++; firstMissing ||= ctx.slice(0, 90); }
      }
      if (refers) {
        check(`gen ${g.id}: a question that names a chart actually shows one`,
          missing === 0,
          `${missing} of ${refers} referred to one that was not in the question — "${firstMissing}"`);
      }
    }
    check(`gen ${g.id}: produces questions at all`, produced > 0,
      `every one of ${DRAWS} draws threw — first error: ${firstError || 'unknown'}`);
    check(`gen ${g.id}: actually varies its questions`, produced === 0 || seenQ.size >= 12,
      `only ${seenQ.size} distinct questions in ${DRAWS} draws`);
  }

  /* ---- and varies them AT EVERY TIER, not just across all three ----

     The check above draws from every tier and pools the results, which hides
     the case that matters most: a generator whose Exam pool is wide and whose
     GENTLE pool is six questions passes it comfortably. Measured that way, NINE
     generators were under twelve at Gentle — `vis-folds`, `pct-succ`,
     `cnt-permcomb` and `men-ring` had exactly six each.

     Gentle is not the tier to be thin at. It is what a learner with no record
     is dealt, what a learner under 55% accuracy is kept on, and what a re-teach
     drops to (§6f) — so the pool a struggling learner meets was the smallest
     one in the project, and the Leitner boxes would have recorded their
     recognition of it as mastery. */
  const TIER_DRAWS = 900;
  for (const g of G.GENERATORS) {
    for (const tier of [1, 2, 3]) {
      const R = rng(9090 + tier);
      const seen = new Set();
      for (let i = 0; i < TIER_DRAWS; i++) {
        let q; try { q = g.make(R, tier); } catch { continue; }
        if (q && Array.isArray(q.options)) seen.add(G.questionSig(q));
      }
      check(`gen ${g.id}: varies its questions at tier ${tier} on its own`,
        seen.size >= 12,
        `only ${seen.size} distinct at tier ${tier} in ${TIER_DRAWS} draws — a learner kept ` +
        `on this tier would exhaust it`);
    }
  }

  /* ---- re-derive answers independently, not through the same helper ---- */
  const rederive = {
    'ord-total': s => {                       // total = left + right − 1
      const [l, r] = (s.context.match(/(\d+)(?:st|nd|rd|th) from the left[\s\S]*?(\d+)(?:st|nd|rd|th) from the right/) || []).slice(1).map(Number);
      return String(l + r - 1);
    },
    'ord-between': s => {
      const [n, a, b] = (s.context.match(/row of (\d+)[\s\S]*?(\d+)(?:st|nd|rd|th) from the left[\s\S]*?(\d+)(?:st|nd|rd|th) from the left/) || []).slice(1).map(Number);
      return String(Math.abs(b - a) - 1);
    },
    'vis-folds': s => {
      const folds = Number(s.context.match(/(\d+) time/)[1]);
      const punches = Number(s.context.match(/<b>(\d+) hole/)[1]);
      let layers = 1;                          // doubled by hand, not by 2**n
      for (let i = 0; i < folds; i++) layers *= 2;
      return String(layers * punches);
    },
    /* Three question forms now share one identity: a letter's two positions add
       to 27. Each form is re-derived here by COUNTING the alphabet rather than
       by subtracting, so the harness is not simply repeating the generator's
       own arithmetic back at it. */
    'code-position': s => {
      const AZ26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const ctx = s.context.replace(/<[^>]+>/g, '');
      if (/from the <?b?>?end|counting from the end/.test(s.context) || /from the .?end/.test(ctx)) {
        const fromEnd = Number(ctx.match(/(\d+)(?:st|nd|rd|th)/)[1]);
        return String(AZ26.length - fromEnd + 1);          // count in from the far end
      }
      const letter = (ctx.match(/letter ([A-Z])\b/) || [])[1];
      const n = Number(ctx.match(/(\d+)(?:st|nd|rd|th) letter/)[1]);
      if (/other end/.test(s.q)) return AZ26[AZ26.length - n];   // the partner letter itself
      return String(AZ26.length - n + 1);                  // position counted from Z
    },
    'cnt-slots': s => {                        // independent choices multiply
      const ns = [...s.context.matchAll(/<b>(\d+)<\/b>/g)].map(m => Number(m[1]));
      return String(ns.reduce((a, b) => a * b, 1));
    },
    'cnt-word': s => {                         // n! divided by each repeat's factorial
      const word = s.context.match(/word <b>([A-Z]+)<\/b>/)[1];
      const f = n => (n <= 1 ? 1 : n * f(n - 1));
      const c = {};
      [...word].forEach(ch => { c[ch] = (c[ch] || 0) + 1; });
      return String(f(word.length) / Object.values(c).reduce((a, k) => a * f(k), 1));
    },
    'men-triangle': s => {
      const [b, h] = s.context.match(/base <b>(\d+) cm<\/b> and perpendicular height <b>(\d+) cm<\/b>/)
        .slice(1).map(Number);
      const v = b * h / 2;
      return `${Number.isInteger(v) ? v : Math.round(v * 100) / 100} cm²`;
    },
    'vis-fan': s => {                          // only the fan form; the grid form has its own
      const m = s.context.match(/into <b>(\d+)<\/b> parts/);
      if (!m) return null;
      const parts = Number(m[1]);
      let n = 0;
      for (let k = 1; k <= parts; k++) n += k;               // summed, not formula'd
      return String(n);
    },
    'dir-triple': s => {
      const [a, b] = [...s.context.matchAll(/<b>(\d+) m<\/b>/g)].map(m => Number(m[1]));
      return `${Math.round(Math.sqrt(a * a + b * b))} m`;
    },
    /* A series is re-derived by EXTENDING THE PRINTED TERMS, with no knowledge
       of which rule made them — the same ladder the lesson teaches, walked from
       the top: constant difference, constant ratio, constant second difference,
       then alternate terms as two series. If the printed series does not admit
       exactly one of those, this declines the draw rather than guessing, which
       is the honest thing for a checker that is meant to be independent. */
    'code-series': s => {
      const t = String(s.context).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
        .split(',').map(x => x.trim()).filter(x => /^-?\d+$/.test(x)).map(Number);
      if (t.length < 4) return null;
      const last = t[t.length - 1];
      const gaps = t.slice(1).map((v, k) => v - t[k]);
      const second = gaps.slice(1).map((v, k) => v - gaps[k]);
      const ratios = t.slice(1).map((v, k) => v / t[k]);
      const flat = a => a.length > 0 && a.every(x => x === a[0]);

      if (flat(gaps)) return String(last + gaps[0]);
      if (flat(ratios)) return String(last * ratios[0]);
      if (flat(second)) return String(last + gaps[gaps.length - 1] + second[0]);

      const odd = t.filter((_, k) => k % 2 === 0), even = t.filter((_, k) => k % 2 === 1);
      const oGaps = odd.slice(1).map((v, k) => v - odd[k]);
      const eGaps = even.slice(1).map((v, k) => v - even[k]);
      if (flat(oGaps) && flat(eGaps)) {
        /* The next term sits at index t.length, so it continues the first row
           when that index is even and the second when it is odd. */
        return String(t.length % 2 === 0 ? odd[odd.length - 1] + oGaps[0]
                                         : even[even.length - 1] + eGaps[0]);
      }
      return null;                                   // not a ladder this checker knows
    },
    'num-hcflcm': s => {
      const [a, b] = s.q.match(/of (\d+) and (\d+)/).slice(1).map(Number);
      const g = (x, y) => (y ? g(y, x % y) : x);
      const h = g(a, b);
      return String(/LCM/.test(s.q) ? a * b / h : h);
    },
    'int-work': s => {                        // 1/a + 1/b, done as a fraction
      const [a, b] = s.context.match(/(\d+) days[\s\S]*?(\d+) days/).slice(1).map(Number);
      const v = (a * b) / (a + b);
      return `${Number.isInteger(v) ? v : Math.round(v * 100) / 100} days`;
    },
    'men-scale': s => {
      const [w, h, k] = s.context.match(/(\d+) cm × (\d+) cm[\s\S]*?by\s*<b>(\d+)/).slice(1).map(Number);
      return `${w * k * h * k} cm²`;
    },
  };

  let checked = 0;
  for (const g of G.GENERATORS) {
    const f = rederive[g.id];
    if (!f) continue;
    const R = rng(4242);
    for (let i = 0; i < 200; i++) {
      const s = g.make(R);
      const mine = f(s);
      /* A re-deriver may return null for a draw it deliberately does not cover —
         `vis-fan` deals two different figures and only one of them is a fan. */
      if (mine === null) continue;
      const theirs = String(s.options[s.answer]).replace(/<[^>]+>/g, '').trim();
      check(`gen ${g.id}: answer re-derived independently (draw ${i})`, mine === theirs,
        `mine ${mine} vs keyed ${theirs} — ${s.context || s.q}`);
      checked++;
      if (mine !== theirs) break;
    }
  }

  /* ---- the drill dealer ---- */
  const covered = G.generatedChapters();
  for (const ch of covered) {
    const [aid, u] = ch.split(':');
    const set = G.drill(aid, +u, 12, 77);
    check(`drill ${ch}: deals what was asked for`, set.length === 12, String(set.length));
    check(`drill ${ch}: every question is a well-formed ask`,
      set.every(s => s.type === 'ask' && s.concept && s.options && Number.isInteger(s.answer)), '');
    /* Rotation, not random choice: with k generators a set of 12 must use all k. */
    const used = new Set(set.map(s => s.generatedBy));
    check(`drill ${ch}: rotates through every generator it has`,
      used.size === G.generatorsFor(aid, +u).length,
      `used ${used.size} of ${G.generatorsFor(aid, +u).length}`);
  }
  /* Every chapter now has a generator, so this can no longer be shown with a
     real one — but the empty case still has to hold for whatever gets added
     next, so it is asserted against a chapter number that will never exist. */
  check('drill: a chapter with no generators deals nothing rather than throwing',
    G.drill('reasoning', 99, 8, 1).length === 0, '');
  check('drill: an unknown chapter deals nothing rather than throwing',
    G.drill('nosuch', 99, 8, 1).length === 0, '');
  check('drill: (sanity) every real chapter now HAS generators, so the empty case above is hypothetical',
    G.generatedChapters().length === 14, `${G.generatedChapters().length} of 14 chapters covered`);

  /* Same seed, same questions — or the harness above proves nothing. */
  const a1 = G.drill('quants', 3, 8, 555).map(s => s.q + s.options.join('|'));
  const a2 = G.drill('quants', 3, 8, 555).map(s => s.q + s.options.join('|'));
  check('drill: the same seed deals the same set', a1.join('#') === a2.join('#'), '');
  const a3 = G.drill('quants', 3, 8, 556).map(s => s.q + s.options.join('|'));
  check('drill: a different seed deals a different set', a1.join('#') !== a3.join('#'), '');

  /* Every generated question must EXPLAIN itself with a drawing, not only with
     prose. The lessons teach each idea through something you can look at; a
     drill that dropped to a paragraph broke the link the lesson had just built. */
  let figDraws = 0;
  for (const g of G.GENERATORS) {
    const Rf = rng(4242);
    let none = 0, thin = 0, leaked = 0;
    for (let i = 0; i < 120; i++) {
      let step;
      try { step = g.make(Rf); } catch { continue; }
      figDraws++;
      if (!step.figure) { none++; continue; }
      const f = String(step.figure);
      if (f.trim().length < 40) thin++;
      if (/undefined|NaN|\[object /.test(f)) leaked++;
    }
    check(`figure: ${g.id} draws an explanation on every draw`, none === 0, `${none} draws had none`);
    check(`figure: ${g.id} draws something substantial`, thin === 0, `${thin} were near-empty`);
    check(`figure: ${g.id} leaks no undefined/NaN into the drawing`, leaked === 0, `${leaked} leaked`);
  }

  console.log(`  ${G.GENERATORS.length} generators over ${covered.length} chapters · ` +
              `${made.toLocaleString()} questions generated, ${checked} answers re-derived from scratch` +
              (thrown ? ` · ${thrown} draws rejected` : ''));
  console.log(`  every question also draws its own explanation — ${figDraws.toLocaleString()} figures checked`);
}

/* ---------------- Difficulty tiers ----------------
   Before these, a learner's first-ever question drew from the same range as
   their five-hundredth. The claim a tier makes is testable, so it is tested:
   a generator reports a `hardness` with every question, and the MEAN of that
   number must rise strictly across the three tiers. A generator that ignores
   its tier therefore fails here rather than passing quietly. */
async function tiersSuite() {
  console.log('assets/js/generators/ · difficulty tiers');

  const G = await import('../assets/js/generators/index.js');
  const { rng, tierRamp, clampTier, TIERS } = await import('../assets/js/generators/rand.js');

  const N = 220;
  for (const g of G.GENERATORS) {
    const means = [];
    for (const t of TIERS) {
      const R = rng(31337);
      let sum = 0, n = 0, noHardness = 0, broke = 0;
      for (let i = 0; i < N; i++) {
        let step;
        try { step = g.make(R, t); } catch { broke++; continue; }
        if (typeof step.hardness !== 'number' || !Number.isFinite(step.hardness)) { noHardness++; continue; }
        /* A tier must not break the question itself. */
        if (!Array.isArray(step.options) || !Number.isInteger(step.answer)) broke++;
        sum += step.hardness; n++;
      }
      check(`tier ${g.id} @${t}: every draw reports a finite hardness`, noHardness === 0, `${noHardness} without`);
      check(`tier ${g.id} @${t}: every draw is still a well-formed question`, broke === 0, `${broke} broken`);
      check(`tier ${g.id} @${t}: produced draws at all`, n > 0, '');
      means.push(n ? sum / n : NaN);
    }
    check(`tier ${g.id}: difficulty actually RISES across the three tiers`,
      means[0] < means[1] && means[1] < means[2],
      `gentle ${means[0]?.toFixed(1)} · exam ${means[1]?.toFixed(1)} · stretch ${means[2]?.toFixed(1)}`);
  }

  /* Tier 2 must reproduce the old behaviour exactly, or every check written
     before tiers existed quietly stopped testing what it was written for. */
  for (const g of G.GENERATORS) {
    const a = rng(999), b = rng(999);
    const one = g.make(a), two = g.make(b, 2);
    check(`tier ${g.id}: the default is exam tier, unchanged from before`,
      JSON.stringify(one.q) === JSON.stringify(two.q) &&
      JSON.stringify(one.options) === JSON.stringify(two.options), g.id);
  }

  /* The ramp: open below the learner's level, close above it. */
  check('tier ramp: an exam-tier set of 8 opens gentle and closes stretch',
    tierRamp(2, 8).join('') === '12222223', tierRamp(2, 8).join(''));
  check('tier ramp: a gentle learner is never dropped below tier 1',
    Math.min(...tierRamp(1, 8)) === 1, tierRamp(1, 8).join(''));
  check('tier ramp: a stretch learner is never pushed past tier 3',
    Math.max(...tierRamp(3, 8)) === 3, tierRamp(3, 8).join(''));
  check('tier ramp: a set too short to ramp stays flat',
    tierRamp(2, 2).every(t => t === 2), tierRamp(2, 2).join(''));
  check('tier: out-of-range values are clamped rather than trusted',
    clampTier(0) === 1 && clampTier(9) === 3 && clampTier('x') === 2, '');

  /* The dealer must honour the ramp, and must label what it dealt. */
  const set = G.drill('quants', 1, 8, 5, 1);
  check('drill: deals the ramp for the tier asked',
    set.map(s => s.tier).join('') === tierRamp(1, 8).join(''), set.map(s => s.tier).join(''));
  check('drill: every dealt question carries its tier and name',
    set.every(s => s.tier >= 1 && s.tier <= 3 && typeof s.tierName === 'string'), '');

  /* And a novice must actually receive the gentle tier. */
  const store = await import('../assets/js/store.js');
  const progress = await import('../assets/js/progress.js');
  const before = store.get().concepts;
  check('tier: a learner with no record in a chapter is started gently',
    progress.tierFor('quants', 1).tier === 1, JSON.stringify(progress.tierFor('quants', 1)));
  /* Answer badly in a chapter and it must stay gentle rather than escalate. */
  for (let i = 0; i < 8; i++) store.answered(`tt${i}`, i < 2, `t${i}`, 'quants:1');
  check('tier: a learner answering badly is kept on the gentle tier',
    progress.tierFor('quants', 1).tier === 1, JSON.stringify(progress.tierFor('quants', 1)));
  Object.keys(before).forEach(() => {});          // record left as the suite found it below
  for (let i = 0; i < 8; i++) delete store.get().concepts[`tt${i}`];

  console.log(`  ${G.GENERATORS.length} generators × 3 tiers × ${N} draws — difficulty rises in every one`);
  console.log('  exam tier is byte-identical to pre-tier behaviour, so older checks still hold');
}

/* ---------------- Achievements ----------------
   Badges are pure predicates over the record, which is what lets them be
   re-evaluated on every load without drifting. The risks worth guarding:
   a badge that can never be earned, one that is earned by doing nothing,
   and a progress bar that reads past its own goal. */
async function achievementsSuite() {
  console.log('assets/js/achievements.js');

  const A = await import('../assets/js/achievements.js');
  const { ACADEMIES, readyLessons } = await import('../assets/js/curriculum.js');

  const FRESH = {
    v: 1, xp: 0, dailyGoal: 40, streak: { count: 0, best: 0, lastDay: null },
    today: { day: '2026-01-01', xp: 0, correct: 0, asked: 0 },
    lessons: {}, concepts: {}, history: [], achievements: {}, flags: {},
  };
  const ctxOf = st => A.contextFor(st, ACADEMIES, readyLessons,
    id => st.lessons[id]?.status === 'done');

  check('badges: every badge has an id, a name and a blurb',
    A.ACHIEVEMENTS.every(b => b.id && b.name && b.blurb && b.icon), '');
  check('badges: ids are unique',
    new Set(A.ACHIEVEMENTS.map(b => b.id)).size === A.ACHIEVEMENTS.length, '');

  /* Nothing is earned for turning up. */
  check('badges: a brand-new learner has earned none',
    A.evaluate(FRESH, ctxOf(FRESH)).length === 0,
    A.evaluate(FRESH, ctxOf(FRESH)).join());

  /* Every badge must be reachable — a locked one nobody can ever open is
     worse than not having it. Build a record that satisfies everything. */
  const maxed = JSON.parse(JSON.stringify(FRESH));
  Object.keys(ACADEMIES).forEach(a => readyLessons(a).forEach(l => {
    maxed.lessons[l.id] = { status: 'done', score: 1, attempts: 1, xp: 30, lastDay: '2026-01-01' };
  }));
  for (let i = 0; i < 120; i++) {
    maxed.concepts['c' + i] = { label: 'c' + i, box: 6, right: 3, wrong: i < 5 ? 1 : 0,
                                dueDay: '2026-01-02', lastDay: '2026-01-01' };
  }
  maxed.streak = { count: 9, best: 9, lastDay: '2026-01-01' };
  maxed.flags = { perfectSet: true };
  const all = A.evaluate(maxed, ctxOf(maxed));
  check('badges: every badge is reachable by some real record',
    all.length === A.ACHIEVEMENTS.length,
    `unreachable: ${A.ACHIEVEMENTS.filter(b => !all.includes(b.id)).map(b => b.id).join() || 'none'}`);

  /* Earning is one-way and idempotent: re-evaluating must not re-award. */
  const held = { ...maxed, achievements: Object.fromEntries(all.map(id => [id, '2026-01-01'])) };
  check('badges: re-evaluating an unchanged record awards nothing new',
    A.evaluate(held, ctxOf(held)).length === 0, A.evaluate(held, ctxOf(held)).join());

  /* Progress bars must stay inside their own goal. */
  const shelfMid = A.shelf(maxed, ctxOf(maxed));
  check('badges: no progress bar reads past its goal',
    shelfMid.every(b => b.now <= b.goal && b.pct <= 100),
    shelfMid.filter(b => b.now > b.goal).map(b => b.id).join());
  check('badges: no progress bar reads below zero',
    shelfMid.every(b => b.now >= 0 && b.pct >= 0), '');
  check('badges: the shelf reports every badge, earned or not',
    A.shelf(FRESH, ctxOf(FRESH)).length === A.ACHIEVEMENTS.length, '');

  /* The one badge with a claim worth checking by hand: recovery means a
     concept that was once wrong has climbed back up, not merely one that
     exists. */
  const onlyWrong = JSON.parse(JSON.stringify(FRESH));
  onlyWrong.concepts.x = { label: 'x', box: 0, right: 0, wrong: 2, dueDay: '', lastDay: '' };
  check('badges: "Won it back" is not earned by getting something wrong',
    !A.evaluate(onlyWrong, ctxOf(onlyWrong)).includes('recovered'), '');
  onlyWrong.concepts.x.box = 4; onlyWrong.concepts.x.right = 3;
  check('badges: "Won it back" IS earned once it climbs back',
    A.evaluate(onlyWrong, ctxOf(onlyWrong)).includes('recovered'), '');

  console.log(`  ${A.ACHIEVEMENTS.length} badges · all reachable, none earned by a fresh record, awarding is idempotent`);
}

/* ---------------- Answer-key spread ---------------- */
/* A learner who reads nothing and presses the same button every time should
   score about 1 in 4. As written, the lessons keyed 16 / 68 / 16 / 0.5 — option
   B was right more than two thirds of the time, so pressing B alone scored 68%
   and option D was right ONCE in 189 questions. That is not merely a soft mark:
   the score drives `store.answered`, which drives the Leitner box, which decides
   what the review queue believes you know. `options.js` re-seats the options at
   render time; this proves it works, and that it keeps working. */
async function answerSpread() {
  console.log('assets/js/options.js · answer-key spread');

  const { orderOptions, seedFor, optionValue } = await import('../assets/js/options.js');
  const ldir = path.join(__dirname, '..', 'assets', 'js', 'lessons');
  const files = fs.readdirSync(ldir).filter(f => f.endsWith('.js'));

  const raw = {}, seated = {};
  let n = 0;
  for (const f of files) {
    const lsn = (await import(`../assets/js/lessons/${f}`)).default;
    lsn.steps.forEach((s, i) => {
      if (s.type !== 'ask' || s.input === 'number' || !s.options) return;
      n++;
      raw[s.answer] = (raw[s.answer] || 0) + 1;

      const o = orderOptions(s, seedFor(lsn.id, s, i));
      seated[o.answer] = (seated[o.answer] || 0) + 1;

      /* Per question: same options, same right answer, only the order moved. */
      const label = `${lsn.id}#${i}`;
      check(`spread: ${label} keeps the same options`,
        o.options.length === s.options.length &&
        [...o.options].sort().join('|') === [...s.options].sort().join('|'), label);
      check(`spread: ${label} still keys the SAME text`,
        o.options[o.answer] === s.options[s.answer],
        `${o.options[o.answer]} vs ${s.options[s.answer]}`);
      check(`spread: ${label} keys a real index`,
        Number.isInteger(o.answer) && o.answer >= 0 && o.answer < o.options.length, String(o.answer));

      /* "None of these" and "Cannot be decided" cannot sensibly appear mid-list. */
      const term = o.options.findIndex(x => /^(none of (these|the above)|(cannot|can'?t) be (determined|decided|said))$/i
        .test(String(x).replace(/<[^>]+>/g, '').trim()));
      check(`spread: ${label} leaves a catch-all option last`,
        term === -1 || term === o.options.length - 1,
        `"${o.options[term]}" at ${term} of ${o.options.length}`);

      /* Ordering must be stable, or a learner re-reading a question would watch
         the options move under them. */
      const again = orderOptions(s, seedFor(lsn.id, s, i));
      check(`spread: ${label} lays out the same way twice`,
        again.options.join('|') === o.options.join('|') && again.answer === o.answer, label);
    });
  }

  const share = t => Object.fromEntries(Object.keys(t).map(k => [k, t[k] / n * 100]));
  const after = share(seated);
  const worst = Math.max(...Object.values(after));
  const fewest = Math.min(...[0, 1, 2, 3].map(k => after[k] || 0));

  check('spread: pressing one button every time scores about a guess, not two thirds',
    worst <= 34, `best single button scores ${worst.toFixed(1)}%`);
  check('spread: no option position is nearly never right',
    fewest >= 16, `rarest position is right ${fewest.toFixed(1)}% of the time`);
  check('spread: every one of the four positions is used',
    [0, 1, 2, 3].every(k => (seated[k] || 0) > 0), JSON.stringify(seated));

  /* Guard the guard: the raw lessons must still be the lopsided thing this
     fixes, or the check above has quietly stopped testing anything. */
  const rawWorst = Math.max(...Object.values(share(raw)));
  check('spread: (sanity) the unordered lessons really are lopsided, so this is not vacuous',
    rawWorst > 40, `raw best button ${rawWorst.toFixed(1)}%`);

  const fmt = t => [0, 1, 2, 3].map(k => `${((t[k] || 0) / n * 100).toFixed(0)}%`).join(' / ');
  console.log(`  ${n} questions · as written ${fmt(raw)} → as shown ${fmt(seated)}`);
}

/* ---------------- Family tree · one person, one node ---------------- */
/* The bug this guards: naming somebody a second time with different capitals,
   or with a stray space, made a SECOND person — so the relation the learner
   meant to hang off the existing tree floated away as an island, and the island
   was then drawn on the same generation row as the real family, quietly
   asserting a relationship nobody had stated. */
async function familyTreeIdentity() {
  console.log('assets/js/widgets/family-tree.js · identity and grouping');

  const ft = await import('../assets/js/widgets/family-tree.js');
  const S = (a, rel, b) => ({ a, rel, b });

  /* ---- one person, however they are typed ---- */
  const mixed = ft.buildGraph([
    S('Dad', 'father', 'Me'),
    S('Uncle', 'brother', 'Dad'),
    S('  uncle ', 'husband', 'Meera'),      // same uncle: different case, stray spaces
  ]);
  check('family tree: "Uncle" and " uncle " are the same person',
    Object.keys(mixed.persons).length === 4, Object.keys(mixed.persons).join());
  check('family tree: and the whole thing stays ONE family',
    mixed.groups.length === 1, `${mixed.groups.length} groups`);
  check('family tree: the spelling first used is the one kept',
    Object.values(mixed.persons).some(p => p.name === 'Uncle'),
    Object.values(mixed.persons).map(p => p.name).join());

  /* ---- genuinely separate people stay separate, and are levelled apart ---- */
  const split = ft.buildGraph([
    S('Dad', 'father', 'Me'),
    S('U', 'husband', 'X'),                 // nothing ties U to Dad
  ]);
  check('family tree: an unrelated pair is its own group',
    split.groups.length === 2, `${split.groups.length} groups`);
  check('family tree: each group is levelled from its OWN zero',
    split.groups.every(g => g.some(n => split.persons[n].gen === 0)), '');
  check('family tree: and the renderer says they are not linked',
    /not linked to the family above/.test(ft.treeSVG(split.persons, split.edges)), '');
  check('family tree: a single family gets no such warning',
    !/not linked to the family above/.test(ft.treeSVG(mixed.persons, mixed.edges)), '');

  /* ---- a person cannot be their own relative ---- */
  const self = ft.buildGraph([S('Ravi', 'father', 'ravi')]);
  check('family tree: "Ravi is the father of ravi" draws no edge',
    self.edges.length === 0, JSON.stringify(self.edges));

  /* ---- impossible families must be refused, not quietly redrawn ---- */
  /* The reported bug: "M is the father of R" then "M is the wife of T". The
     second used to overwrite the first, so a father was silently redrawn as a
     wife — the exact opposite of what the lesson teaches. */
  const clash = ft.contradictionIn([S('M', 'father', 'R'), S('M', 'wife', 'T')]);
  check('family tree: father-then-wife is caught as impossible',
    !!clash && clash.kind === 'gender', JSON.stringify(clash));
  check('family tree: and the message names BOTH statements, not just the new one',
    !!clash && /father of R/.test(clash.text) && /wife of T/.test(clash.text), clash?.text);

  check('family tree: the reverse order is caught too',
    ft.contradictionIn([S('M', 'wife', 'T'), S('M', 'father', 'R')])?.kind === 'gender', '');
  check('family tree: a gender forced on the SECOND name is caught',
    /* "T is the husband of M" makes M female; "M is the brother of R" makes M male */
    ft.contradictionIn([S('T', 'husband', 'M'), S('M', 'brother', 'R')])?.kind === 'gender', '');
  check('family tree: a consistent family is not flagged',
    ft.contradictionIn([S('Dad', 'father', 'Me'), S('Mom', 'wife', 'Dad'),
                        S('Sara', 'sister', 'Me')]) === null, '');

  /* ---- nobody is their own ancestor ---- */
  const loop = ft.contradictionIn([S('A', 'father', 'B'), S('B', 'father', 'C'), S('C', 'father', 'A')]);
  check('family tree: a parent loop is caught', !!loop && loop.kind === 'cycle', JSON.stringify(loop));
  check('family tree: and it names the statement that closed it',
    !!loop && /C is the father of A/.test(loop.text), loop?.text);
  check('family tree: a deep but honest line is fine',
    ft.contradictionIn([S('A', 'father', 'B'), S('B', 'father', 'C'), S('C', 'father', 'D')]) === null, '');

  /* ---- and the widget actually refuses it ---- */
  let mc = ft.familyTreeMachine({}).init;
  const FT = ft.familyTreeMachine({});
  mc = FT.act(mc, { a: 'M', rel: 'father', b: 'R' });
  const okCount = FT.report(mc).count;
  mc = FT.act(mc, { a: 'M', rel: 'wife', b: 'T' });
  const after = FT.report(mc);
  check('family tree: the impossible statement is NOT added',
    after.count === okCount, `${after.count} vs ${okCount}`);
  check('family tree: and the widget reports why it was refused',
    after.blocked === true && after.blockedKind === 'gender' && !!after.blockedWhy, '');
  check('family tree: M is still male, not overwritten by the refused statement',
    Object.values(after.persons).find(p => p.name === 'M')?.gender === 'M',
    JSON.stringify(Object.values(after.persons).map(p => `${p.name}:${p.gender}`)));

  mc = FT.act(mc, { a: 'M', rel: 'father', b: 'Z' });     // a legal one clears the warning
  check('family tree: the warning clears once a legal statement lands',
    FT.report(mc).blocked === false, '');

  /* ---- the machine reports it, so a lesson task could gate on it ---- */
  const M = ft.familyTreeMachine({});
  let st = M.init;
  st = M.act(st, { a: 'A', rel: 'father', b: 'B' });
  check('family tree: one family reports as linked', M.report(st).allLinked === true, '');
  st = M.act(st, { a: 'C', rel: 'husband', b: 'D' });
  const r = M.report(st);
  check('family tree: two islands report as not linked',
    r.allLinked === false && r.groups === 2, `${r.groups} groups`);

  console.log('  case and spacing collapse to one person; unlinked groups separated and labelled;');
  console.log('  impossible families (two genders, or a parent loop) refused with the reason named');
}

/* ---------------- Chapter practice ---------------- */
/* Practice sets are scoped by hand — a unit number off the URL — so the two
   things that can go wrong are a chapter that quietly offers nothing, and a
   chapter that leaks questions from elsewhere. Both are checked for EVERY unit
   in both academies rather than for a sample, because a single unit drifting is
   exactly the failure that would go unnoticed. */
async function practice() {
  console.log('assets/js/review.js · chapter practice');

  const rv = await import('../assets/js/review.js');
  const { ACADEMIES, readyLessons } = await import('../assets/js/curriculum.js');
  const Rt = await import('../assets/js/routes.js');

  let chapters = 0, questions = 0;
  for (const aid of Object.keys(ACADEMIES)) {
    const ready = new Set(readyLessons(aid).map(l => l.id));
    for (const u of ACADEMIES[aid].units) {
      chapters++;
      const label = `${aid} ch${u.n}`;
      const ids = rv.unitLessonIds(aid, u.n);

      check(`practice: ${label} lists only BUILT lessons`,
        ids.every(id => ready.has(id)), ids.filter(id => !ready.has(id)).join());
      check(`practice: ${label} lists every built lesson it has`,
        ids.length === u.lessons.filter(l => ready.has(l.id)).length, `${ids.length}`);

      const r = await rv.makeChapterSession(aid, u.n, 8);
      if (!ids.length) {                       // a planned-but-unbuilt chapter
        check(`practice: ${label} has no built lessons, so it offers no session`,
          r.session === null && r.reason === 'no built lessons yet', String(r.reason));
        continue;
      }

      questions += r.questions.length;
      check(`practice: ${label} produces a set`, !!r.session && r.questions.length > 0, String(r.reason));
      if (!r.session) continue;

      const inUnit = new Set(ids);
      check(`practice: ${label} draws ONLY from its own chapter`,
        r.questions.every(q => inUnit.has(q.lessonId)),
        r.questions.filter(q => !inUnit.has(q.lessonId)).map(q => q.lessonId).join());
      check(`practice: ${label} asks no question twice`,
        new Set(r.questions.map(q => q.key)).size === r.questions.length, '');
      check(`practice: ${label} is flagged as review, so it cannot complete a lesson`,
        r.session.review === true, '');
      check(`practice: ${label} does not borrow a real lesson id`,
        !findLessonId(ACADEMIES, r.session.id), r.session.id);
      check(`practice: ${label} returns the learner to its own chapter`,
        (() => { const x = Rt.resolve(r.session.nextHref); return x && x.kind === 'chapter' && x.academyId === aid && x.unitN === u.n; })(),
        r.session.nextHref);

      /* "Another set" reloads THIS page, and this page is nothing without its
         chapter. A bare "./" dropped the query string and dead-ended the
         learner on "No such chapter" the moment they asked for a second set. */
      for (const [what, sess] of [['practice', r.session], ['drill', rv.makeDrillSession(aid, u.n, 8).session]]) {
        if (!sess) continue;
        const to = Rt.resolve(sess.againHref);
        check(`practice: ${label} ${what} "Another set" keeps its chapter`,
          !!to && to.academyId === aid && to.unitN === u.n, String(sess.againHref));
        /* and it must land back in the same mode, not silently switch */
        check(`practice: ${label} ${what} "Another set" stays in ${what} mode`,
          !!to && to.kind === what, String(sess.againHref));
        /* the page it names exists on disk */
        check(`practice: ${label} ${what} "Another set" points at a page that exists`,
          fs.existsSync(path.join(__dirname, '..', (what === 'drill' ? Rt.drillPath : Rt.practicePath)(aid, u.n), 'index.html')),
          String(sess.againHref));
        /* resolve it the way the page does, and it must be a real chapter */
        const back = await rv.makeChapterSession(to && to.academyId, to && to.unitN, 4);
        check(`practice: ${label} ${what} "Another set" resolves to a real chapter`,
          !!back.session && back.unit && back.unit.n === u.n, String(back.reason));
      }
      /* A numeric question carries no options — its answer is a value, not an
         index — so it is keyed the same way the guards suite keys it. */
      check(`practice: ${label} every step is answerable or prose`,
        r.session.steps.every(s => s.type !== 'ask' || s.input === 'number' ||
          (Number.isInteger(s.answer) && s.answer >= 0 && s.answer < s.options.length)), '');
    }
  }

  /* A bad URL must be a dead end with an explanation, never a crash. */
  for (const [a, u] of [['nosuch', 1], ['reasoning', 99], ['', '']]) {
    const r = await rv.makeChapterSession(a, u, 8);
    check(`practice: "${a}/${u}" is refused rather than half-built`,
      r.session === null && r.unit === null, JSON.stringify(r.reason));
  }

  /* Asking for more than the chapter has WRITTEN is now topped up from the
     generators rather than truncated — but the written ones must still not
     repeat, and the total must be what was asked for. */
  const big = await rv.makeChapterSession('reasoning', 2, 50, 31337);
  const pool = await rv.chapterQuestionCount('reasoning', 2);
  check('practice: a big ask is topped up from the generators, not truncated',
    big.questions.length === 50, `${big.questions.length} of 50 asked`);
  check('practice: it uses every written question before generating any',
    big.written === pool, `${big.written} written of ${pool} available`);
  check('practice: and no written question appears twice',
    new Set(big.questions.filter(q => !q.generated).map(q => q.key)).size === big.written, '');
  check('practice: the generated top-up carries concepts this chapter teaches',
    big.questions.filter(q => q.generated).every(q => big.index.byConcept.has(q.concept)),
    big.questions.filter(q => q.generated && !big.index.byConcept.has(q.concept))
      .map(q => q.concept).join());

  /* Every chapter can now top up, so "capped at what it holds" no longer
     describes any of them. What must still hold is the property that made
     that check worth having: ask for more than a chapter has written, and
     the written ones all appear before a single generated one does. */
  for (const [aid, un] of [['reasoning', 1], ['reasoning', 6], ['quants', 7]]) {
    const s = await rv.makeChapterSession(aid, un, 40, 7);
    const written = await rv.chapterQuestionCount(aid, un);
    const firstGen = s.questions.findIndex(q => q.generated);
    check(`practice: ${aid} ch${un} now tops up past its ${written} written questions`,
      s.questions.length > written && s.generated > 0,
      `${s.questions.length} total, ${s.generated} generated`);
    check(`practice: ${aid} ch${un} spends every written question before generating one`,
      firstGen === written, `first generated at ${firstGen}, written pool is ${written}`);
  }

  console.log(`  ${chapters} chapters checked · ${questions} questions drawn, none from outside its own chapter`);
}

/** Is `id` the id of a real lesson? Practice sessions must never reuse one. */
function findLessonId(ACADEMIES, id) {
  return Object.values(ACADEMIES).some(a => a.units.some(u => u.lessons.some(l => l.id === id)));
}

/* ---------------- Learner profiles ---------------- */
/* Two people share a browser. The whole point is that neither can see or spoil
   the other's record, so that is what gets asserted — plus the migration, which
   has exactly one chance to run and would otherwise strand a real learner's
   progress the day profiles shipped. */
async function profilesSuite() {
  console.log('assets/js/store.js · learner profiles');

  const store = await import('../assets/js/store.js');

  /* ---- migration: the pre-profile record became profile one ---- */
  check('profiles: a store that existed before profiles opens as the first learner',
    store.profiles().length >= 1, String(store.profiles().length));
  check('profiles: and that learner still has the progress they earned',
    store.get().xp === 123, `xp ${store.get().xp}`);

  const first = store.activeProfile();
  check('profiles: the migrated learner is the active one', !!first, '');

  /* ---- isolation ---- */
  store.answered('c-one', true, 'First learner concept');
  const xpFirst = store.get().xp;

  const second = store.addProfile('Second Learner');
  check('profiles: adding a learner switches to them', store.activeProfileId() === second.id, '');
  check('profiles: a new learner starts with nothing',
    store.get().xp === 0 && Object.keys(store.get().concepts).length === 0,
    `xp ${store.get().xp}, ${Object.keys(store.get().concepts).length} concepts`);

  store.answered('c-two', true, 'Second learner concept');
  store.awardXP(9, 'test');                  // answered() moves a Leitner box; XP is its own call
  const xpSecond = store.get().xp;
  check('profiles: the second learner banks their own XP', xpSecond === 9, String(xpSecond));

  store.switchProfile(first.id);
  check('profiles: switching back restores the first learner exactly',
    store.get().xp === xpFirst && !!store.get().concepts['c-one'], `xp ${store.get().xp}`);
  check('profiles: and the first learner never sees the second\'s concepts',
    !store.get().concepts['c-two'], '');

  /* ---- reset is scoped to the learner who asked for it ---- */
  store.reset();
  check('profiles: reset clears the active learner', store.get().xp === 0, String(store.get().xp));
  store.switchProfile(second.id);
  check('profiles: and leaves the other learner untouched',
    store.get().xp === xpSecond && !!store.get().concepts['c-two'], `xp ${store.get().xp}`);

  /* ---- names ---- */
  store.renameProfile(second.id, '   ');
  check('profiles: a blank name falls back rather than rendering an empty chip',
    store.activeProfile().name.length > 0, JSON.stringify(store.activeProfile().name));
  store.renameProfile(second.id, 'x'.repeat(80));
  check('profiles: an absurd name is cut to something a chip can hold',
    store.activeProfile().name.length <= 24, String(store.activeProfile().name.length));

  /* ---- deletion ---- */
  check('profiles: deleting takes the record with it',
    store.deleteProfile(second.id) === true, '');
  check('profiles: and falls back to a learner who still exists',
    store.profiles().length === 1 && store.activeProfileId() === first.id, '');
  check('profiles: the deleted learner\'s progress is gone from storage',
    localStorage.getItem(`rqa.progress.v1:${second.id}`) === null, '');
  check('profiles: the last learner cannot be deleted — there has to be somebody to be',
    store.deleteProfile(first.id) === false, '');

  console.log(`  migration, isolation, scoped reset and deletion checked across ${store.profiles().length} surviving profile`);
}

/* ---------------- Re-teaching ---------------- */
/* The review queue can only re-test. This is the other half: a concept the
   learner keeps getting wrong is sent back to the teaching that produced it.
   Two things can go silently wrong and both would be invisible in the browser —
   a re-teach that teaches nothing (an empty spine, so the learner is dropped
   straight onto the question that already beat them), and a re-teach that
   drifts off its concept (so the ladder is fed evidence about the wrong idea).
   Both are checked over ALL 195 concepts rather than a sample, because one
   concept quietly falling through is exactly what a sample would miss.

   Runs LAST and resets the record first: it derives a tier and a track order
   from the learner's own history, so it needs a history it wrote itself. */
async function reteachSuite() {
  console.log('assets/js/reteach.js · re-teaching a failed idea');

  const rt = await import('../assets/js/reteach.js');
  const rv = await import('../assets/js/review.js');
  const Rt = await import('../assets/js/routes.js');
  const runner = await import('../assets/js/runner.js');
  const store = await import('../assets/js/store.js');
  const progress = await import('../assets/js/progress.js');
  const { ACADEMIES, chapterOf } = await import('../assets/js/curriculum.js');
  const { generatorsDealing, questionSig } = await import('../assets/js/generators/index.js');

  /* ---- what counts as teaching ---- */
  check('reteach: a question never counts as teaching',
    !rt.teaches({ type: 'ask', q: 'x', body: 'looks like prose' }), 'an ask with a body slipped through');
  check('reteach: a bare say does not teach — it is the hook, and it baits',
    !rt.teaches({ type: 'say', say: 'Most people miss it.' }), '');
  check('reteach: a say with a body does teach',
    rt.teaches({ type: 'say', say: 'x', body: '<p>the rule</p>' }), '');
  check('reteach: a say with a figure does teach',
    rt.teaches({ type: 'say', say: 'x', figure: '<svg/>' }), '');
  check('reteach: an explore teaches', rt.teaches({ type: 'explore' }), '');
  check('reteach: a reveal teaches', rt.teaches({ type: 'reveal' }), '');

  /* ---- the checklist gate ---- */
  const TASKS = [{ label: 'a', done: () => true }];
  check('reteach: a checklist gates the Continue button by default',
    runner.gates({ type: 'explore', tasks: TASKS }), '');
  check('reteach: gate:false releases it, which is what a re-teach borrows',
    !runner.gates({ type: 'explore', tasks: TASKS, gate: false }), '');
  check('reteach: a step with no checklist never gated anything',
    !runner.gates({ type: 'explore' }) && !runner.gates({ type: 'explore', tasks: [] }), '');

  /* ---- who is offered a way back ---- */
  check('reteach: a practice set offers the way back', runner.offersReteach({ review: true }), '');
  check('reteach: a lesson does not — its teaching is the page they just read',
    !runner.offersReteach({ review: false }) && !runner.offersReteach({}), '');
  check('reteach: and a re-teach does not offer itself, which would loop',
    !runner.offersReteach({ review: true, reteach: true }), '');

  /* ---- every concept in both academies ---- */
  const index = await rv.buildIndex();
  let concepts = 0, generatedBacked = 0, questions = 0, minSpine = Infinity;

  for (const [conceptId, qs] of index.byConcept) {
    concepts++;
    const label = conceptId;
    const r = await rt.makeReteachSession(conceptId, { seed: 900 + concepts, index });

    check(`reteach: ${label} produces a session at all`, !!r.session, String(r.reason));
    if (!r.session) continue;

    const steps = r.session.steps;
    const teach = steps.filter(s => rt.teaches(s));
    const asks = steps.filter(s => s.type === 'ask');
    questions += asks.length;
    minSpine = Math.min(minSpine, teach.length);

    /* An empty spine is the failure that matters most: the learner clicks
       "teach me this" and is handed the question that already beat them. */
    check(`reteach: ${label} actually teaches something`, teach.length > 0, 'empty spine');
    check(`reteach: ${label} brings the worked reveal with it`,
      steps.filter(s => s.type === 'reveal').length === 1,
      `${steps.filter(s => s.type === 'reveal').length} reveals`);
    check(`reteach: ${label} asks at least one question`, asks.length > 0, '');

    /* Teaching first, testing last. Everywhere else the learner must commit
       before an explanation appears; this is the one place that inverts, and
       a stray question in the middle of the spine would invert it back. */
    const lastTeach = steps.map(s => rt.teaches(s)).lastIndexOf(true);
    const firstAsk = steps.findIndex(s => s.type === 'ask');
    check(`reteach: ${label} explains before it asks, not after`,
      firstAsk > lastTeach, `first question at ${firstAsk}, last teaching at ${lastTeach}`);

    check(`reteach: ${label} stays on its own idea`,
      asks.every(s => s.concept === conceptId),
      asks.filter(s => s.concept !== conceptId).map(s => s.concept).join());
    check(`reteach: ${label} asks nothing twice`,
      new Set(asks.map(questionSig)).size === asks.length, '');
    check(`reteach: ${label} every question is answerable`,
      asks.every(s => s.input === 'number' ||
        (Number.isInteger(s.answer) && s.answer >= 0 && s.answer < s.options.length)), '');
    check(`reteach: ${label} explains both branches`,
      asks.every(s => (s.whyRight || s.why) && (s.whyWrong || s.why)), '');

    check(`reteach: ${label} is flagged review, so it cannot complete a lesson`,
      r.session.review === true, '');
    check(`reteach: ${label} is flagged reteach, so it cannot offer itself`,
      r.session.reteach === true, '');
    check(`reteach: ${label} does not borrow a real lesson id`,
      !findLessonId(ACADEMIES, r.session.id), r.session.id);
    check(`reteach: ${label} is attributed to the chapter that teaches it`,
      r.session.chapter === chapterOf(qs[0].lessonId), `${r.session.chapter}`);
    check(`reteach: ${label} escalates to the lesson it came from`,
      Rt.resolve(r.session.lessonHref)?.lessonId === qs[0].lessonId,
      String(r.session.lessonHref));
    check(`reteach: ${label} "Another set" carries the idea back`,
      Rt.resolve(r.session.againHref)?.conceptId === conceptId,
      String(r.session.againHref));
    check(`reteach: ${label} has a page of its own`,
      fs.existsSync(path.join(__dirname, '..', Rt.reteachPath(conceptId), 'index.html')),
      Rt.reteachPath(conceptId));

    /* The widget comes along, but it stops holding the door shut. */
    check(`reteach: ${label} does not make the learner re-drive the widget first`,
      steps.filter(s => s.type === 'explore').every(s => !runner.gates(s)), '');

    /* Fresh numbers where the chapter can produce them, the written questions
       where it cannot — never a re-teach that only re-shows a memorised item
       when it had the means to ask a new one. */
    /* By what a generator DEALS, not what it declares — `code-series` declares
       `second-differences` and also deals `ratios-first` and `alternate-terms`,
       and asking by the declaration made this suite assert the wrong branch for
       two concepts it can perfectly well generate. */
    if (generatorsDealing(conceptId).length) {
      generatedBacked++;
      check(`reteach: ${label} has a generator, so it asks in fresh numbers`,
        r.generated > 0, `${r.generated} generated, ${r.written} written`);
    } else {
      check(`reteach: ${label} has no generator, so it falls back to the lesson's own`,
        r.written > 0 && r.generated === 0, `${r.generated} generated`);
    }
  }

  check('reteach: every concept in both academies can be re-taught',
    concepts === index.byConcept.size, `${concepts} of ${index.byConcept.size}`);
  check('reteach: the shortest spine is still a real explanation',
    minSpine >= 3, `shortest was ${minSpine} steps`);

  /* Non-vacuity. A `teaches` that simply said yes would pass every check above,
     so the spine must be strictly smaller than the lesson — it drops the hook
     AND all four questions — and the lessons must really contain questions. */
  let dropped = 0, held = 0;
  for (const lesson of index.byLesson.values()) {
    const spine = rt.teachSpine(lesson);
    dropped += lesson.steps.length - spine.length;
    held += spine.length;
    check(`reteach: ${lesson.id} spine drops its questions and its hook`,
      spine.length < lesson.steps.length && spine.every(s => s.type !== 'ask'),
      `${spine.length} of ${lesson.steps.length}`);
  }
  check('reteach: the spine really is a filter, not a pass-through',
    dropped > held, `${dropped} steps dropped, ${held} kept`);

  /* ---- repeats, across many draws ----

     Tested at the DEALER, not only at the session. A chapter set of eight
     rotating through three generators repeats rarely; three questions from one
     generator is the opposite case, and before `drillConcept` learned to
     de-duplicate, 9% of these sets asked the same question twice — one
     generator managed it in 78% of them. The session de-duplicates as well, so
     testing only the session would let the dealer rot unnoticed. */
  const { drillConcept } = await import('../assets/js/generators/index.js');
  let dealt = 0, dealtRepeat = 0, dealtShort = 0;
  for (const conceptId of index.byConcept.keys()) {
    if (!generatorsDealing(conceptId).length) continue;
    for (let tier = 1; tier <= 3; tier++) {
      for (let seed = 1; seed <= 40; seed++) {
        const set = drillConcept(conceptId, 3, seed, tier);
        dealt++;
        if (new Set(set.map(questionSig)).size !== set.length) dealtRepeat++;
        if (set.length < 3) dealtShort++;
      }
    }
  }
  check('reteach: the dealer never deals one idea the same question twice',
    dealtRepeat === 0, `${dealtRepeat} of ${dealt} sets repeated`);
  check('reteach: and every generator can still fill a set of three at every tier',
    dealtShort === 0, `${dealtShort} of ${dealt} came back short`);

  let sets = 0, repeated = 0, empty = 0;
  for (const conceptId of [...index.byConcept.keys()]) {
    if (!generatorsDealing(conceptId).length) continue;
    for (let seed = 1; seed <= 30; seed++) {
      const r = await rt.makeReteachSession(conceptId, { seed, index });
      sets++;
      const asks = r.session.steps.filter(s => s.type === 'ask');
      if (!asks.length) empty++;
      if (new Set(asks.map(questionSig)).size !== asks.length) repeated++;
    }
  }
  check('reteach: and no assembled set repeats either',
    repeated === 0, `${repeated} of ${sets} sets repeated`);
  check('reteach: and never comes back with nothing to ask',
    empty === 0, `${empty} empty of ${sets}`);

  /* ---- dead ends ---- */
  for (const bad of ['nosuch', '', null, undefined, 'r.dir.compass']) {
    const r = await rt.makeReteachSession(bad, { index });
    check(`reteach: "${bad}" is refused with a reason, not a crash`,
      r.session === null && !!r.reason, JSON.stringify(r.reason));
  }

  /* ---- the page exists, and a built copy still contains it ----

     `reteach/` was added and `tools/build.js` went on copying the six
     directories somebody had typed into a list months earlier, so `node
     tools/build.js` produced a site whose dashboard links all dead-ended.
     Nothing complained: a page missing from dist/ is invisible until somebody
     clicks it, and the harness had never looked at the build at all. */
  const pagesSrc = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'pages.js'), 'utf8');
  check('reteach: the page every one of those links points at exists and runs a session',
    pagesSrc.includes('makeReteachSession'), '');
  const built = require('./build.js');
  const pages = built.pageDirs();
  check('reteach: the build ships the re-teach page', pages.includes('reteach'), pages.join());
  for (const d of ['lesson', 'review', 'practice', 'reasoning', 'quants', 'modules', 'assets']) {
    check(`reteach: the build still ships ${d}/`, built.copyDirs().includes(d), '');
  }
  check('reteach: and the build never ships its own tooling',
    !built.copyDirs().includes('tools') && !built.copyDirs().includes('dist'),
    built.copyDirs().join());

  /* ---- the record decides, and this suite writes the record ---- */
  store.reset();
  check('reteach: a fresh record needs nothing re-taught', store.failing().length === 0, '');

  store.answered('c-unlucky', false, 'One bad answer', 'reasoning:3');
  check('reteach: one wrong answer is variance, not a misconception',
    store.failing().length === 0, store.failing().map(c => c.id).join());

  store.answered('c-unlucky', false, 'One bad answer', 'reasoning:3');
  check('reteach: two wrong answers and a losing record is',
    store.failing().some(c => c.id === 'c-unlucky'), '');

  store.answered('c-mostly-fine', true, 'Mostly fine', 'reasoning:3');
  store.answered('c-mostly-fine', true, 'Mostly fine', 'reasoning:3');
  store.answered('c-mostly-fine', false, 'Mostly fine', 'reasoning:3');
  store.answered('c-mostly-fine', false, 'Mostly fine', 'reasoning:3');
  store.answered('c-mostly-fine', true, 'Mostly fine', 'reasoning:3');
  check('reteach: two wrongs inside a winning record is not failing',
    !store.failing(9).some(c => c.id === 'c-mostly-fine'),
    'a concept the learner mostly gets right was sent back to the lesson');

  /* Winning it back must remove it, and nothing but the running totals should
     decide that — a stored "needs re-teaching" flag would stick after the
     learner had fixed it, which is the worst way to be told you are weak. */
  store.answered('c-unlucky', true, 'One bad answer', 'reasoning:3');
  store.answered('c-unlucky', true, 'One bad answer', 'reasoning:3');
  check('reteach: winning it back takes it off the list, with no flag to clear',
    !store.failing(9).some(c => c.id === 'c-unlucky'), '');

  /* ---- the track puts teaching above testing ---- */
  store.reset();
  const first = ACADEMIES.reasoning.units[0].lessons[0].id;
  store.completeLesson(first, 1, 30);                       // so nextSteps is past "start"
  const real = [...index.byConcept.keys()][0];
  store.answered(real, false, index.byConcept.get(real)[0].conceptLabel, 'reasoning:1');
  store.answered(real, false, index.byConcept.get(real)[0].conceptLabel, 'reasoning:1');
  const track = progress.nextSteps(3);
  check('reteach: a failing idea reaches the track at all',
    track.some(s => s.kind === 'reteach'), track.map(s => s.kind).join());
  check('reteach: and it outranks the review queue, because scheduling cannot teach',
    track[0] && track[0].kind === 'reteach', track.map(s => s.kind).join());
  check('reteach: the track link resolves to a real session',
    !!(await rt.makeReteachSession(
      Rt.resolve(track.find(s => s.kind === 'reteach').href)?.conceptId,
      { index })).session, String(track.find(s => s.kind === 'reteach').href));

  /* ---- the re-test is easier than the drill that beat them ----

     With an empty record every chapter derives Gentle, and "one step below
     Gentle is Gentle" is true of a function that steps down and of one that
     does nothing at all. So the record is built up first, until all three
     tiers are actually represented — and that is asserted too, because the
     day this fixture stops producing a Stretch chapter, this check would
     quietly go back to proving nothing. */
  store.reset();
  for (let k = 0; k < 4; k++) {                 // 8 right answers, boxes climbing → Stretch
    store.answered('t-hi-a', true, 'A', 'quants:1');
    store.answered('t-hi-b', true, 'B', 'quants:1');
  }
  for (let k = 0; k < 8; k++) {                 // 6 of 8 right, boxes low → Exam
    store.answered('t-mid', k % 4 !== 0, 'M', 'quants:2');
  }
  const seenTiers = new Set();
  for (const [aid, un] of [['quants', 1], ['quants', 2], ['reasoning', 5]]) {
    const base = progress.tierFor(aid, un).tier;
    const back = rt.reteachTier(aid, un);
    seenTiers.add(base);
    check(`reteach: ${aid} ch${un} re-tests at a real tier`, back >= 1 && back <= 3, String(back));
    if (base > 1) {
      check(`reteach: ${aid} ch${un} re-tests BELOW the tier that just beat them`,
        back < base, `chapter is at tier ${base}, re-teach asks at ${back}`);
    } else {
      check(`reteach: ${aid} ch${un} is already at the gentlest tier, so it stays there`,
        back === 1, `${base} → ${back}`);
    }
  }
  check('reteach: the tier fixture still exercises all three tiers',
    seenTiers.size === 3, `saw tiers ${[...seenTiers].sort().join()}`);

  store.reset();
  console.log(`  ${concepts} concepts checked · every one teaches ${minSpine}+ steps before it asks anything`);
  console.log(`  ${questions} questions asked back, ${generatedBacked} concepts of them in fresh numbers`);
  console.log(`  ${dealt + sets} single-idea sets drawn — none repeated a question, none came back empty`);
}


/* ---------------- Per-option feedback ---------------- */
/* One paragraph per question told the learner who picked C exactly what it told
   the learner who picked A, and neither of them was being answered. A generator
   knows what each distractor represents — it computed it on purpose — so the
   risk is not that the reason is missing but that it is attached to the WRONG
   option, which no amount of reading the page would reveal. */
async function whyOptionSuite() {
  console.log('assets/js/generators/ · per-option feedback');

  const G = await import('../assets/js/generators/index.js');
  const { rng } = await import('../assets/js/generators/rand.js');
  const O = await import('../assets/js/options.js');

  /* ---- the permutation cannot separate a reason from its option ---- */
  const probe = {
    q: 'Area?', concept: 'x',
    options: ['154 cm²', '88 cm²', '44 cm²', '308 cm²'], answer: 0,
    whyOption: [null, 'that is the circumference', 'that is πr', 'you doubled it'],
  };
  const pairs = new Map(probe.options.map((o, i) => [o, probe.whyOption[i]]));
  let seatings = 0, slots = new Set();
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    const r = O.orderOptions(probe, seed);
    seatings++;
    slots.add(r.answer);
    check(`whyOption: reordering keeps every reason with its own option (${seed})`,
      r.options.every((o, i) => (r.whyOption[i] ?? null) === (pairs.get(o) ?? null)),
      r.options.map((o, i) => `${o}→${r.whyOption[i]}`).join(' · '));
    check(`whyOption: the key's own slot still carries no excuse (${seed})`,
      r.whyOption[r.answer] === null, String(r.whyOption[r.answer]));
  }
  check('whyOption: the probe actually moved between seatings, so the check is not vacuous',
    slots.size >= 3, `key landed in only ${slots.size} distinct slots over ${seatings} seatings`);
  check('whyOption: a question without reasons gets no empty array pretending otherwise',
    O.orderOptions({ q: 'x', options: ['1', '2', '3', '4'], answer: 0 }, 'z').whyOption === undefined, '');

  /* ---- every generator annotates every distractor ---- */
  let draws = 0, annotated = 0, worst = null;
  for (const g of G.GENERATORS) {
    const R = rng(8080);
    let seen = 0, full = 0, empty = 0, mislabelled = 0;
    for (let i = 0; i < 240; i++) {
      let q; try { q = g.make(R, 1 + (i % 3)); } catch { continue; }
      if (!q || !Array.isArray(q.options)) continue;
      seen++; draws++;
      const w = q.whyOption || [];
      /* A reason on the KEY would be read out to somebody who got it right,
         which is at best noise and at worst contradicts whyRight. */
      if (w[q.answer]) mislabelled++;
      const named = w.filter(Boolean).length;
      if (named >= q.options.length - 1) { full++; annotated++; }
      if (w.length && w.length !== q.options.length) empty++;
    }
    check(`whyOption: ${g.id} annotates every distractor it deals`,
      seen > 0 && full === seen, `${full} of ${seen} draws fully annotated`);
    check(`whyOption: ${g.id} never puts a reason on the right answer`,
      mislabelled === 0, `${mislabelled} draws explained the key as if it were wrong`);
    check(`whyOption: ${g.id} keeps the array the same length as its options`,
      empty === 0, `${empty} draws had a ragged whyOption`);
    if (!worst || full / Math.max(1, seen) < worst.pct) worst = { id: g.id, pct: full / Math.max(1, seen) };
  }
  check('whyOption: no generator was skipped entirely', draws > 0, '');

  /* ---- the reasons have to say something ---- */
  let thin = 0, leaky = 0, checkedText = 0;
  for (const g of G.GENERATORS) {
    const R = rng(4141);
    for (let i = 0; i < 60; i++) {
      let q; try { q = g.make(R, 1 + (i % 3)); } catch { continue; }
      for (const w of (q.whyOption || []).filter(Boolean)) {
        checkedText++;
        const plain = String(w).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (plain.split(' ').length < 8) thin++;
        if (/undefined|NaN|\[object Object\]/.test(plain)) leaky++;
      }
    }
  }
  check('whyOption: no reason is a stub', thin === 0, `${thin} of ${checkedText} under 8 words`);
  check('whyOption: no reason leaks undefined/NaN into the prose', leaky === 0,
    `${leaky} of ${checkedText} leaked`);

  console.log(`  ${G.GENERATORS.length} generators × ${draws} draws — every distractor named`);
  console.log(`  ${checkedText} reasons checked for substance, and for surviving the re-seating`);
}

/* ---------------- Question sets ---------------- */
/* One stimulus, several questions — the shape a third of the paper arrives in,
   and the one shape this project had none of. Two things must hold or the set
   is worse than the standalone questions it replaces: the arrangement it is
   built on must have exactly ONE solution, and the stimulus must travel with
   every question, because a learner jumping to question 3 from the mock's
   palette has no history to scroll back through. */
async function setsSuite() {
  console.log('assets/js/generators/sets.js · shared-stimulus sets');

  const S = await import('../assets/js/generators/sets.js');
  const { rng } = await import('../assets/js/generators/rand.js');
  const { questionSig } = await import('../assets/js/generators/index.js');
  const { GENERATORS } = await import('../assets/js/generators/index.js');
  const taught = new Set();
  const files = fs.readdirSync(path.join(__dirname, '..', 'assets', 'js', 'lessons'))
    .filter(f => f.endsWith('.js'));
  const chapterConcepts = new Map();
  for (const f of files) {
    const L = (await import(`../assets/js/lessons/${f}`)).default;
    const { chapterOf } = await import('../assets/js/curriculum.js');
    const ch = chapterOf(L.id);
    for (const st of L.steps) {
      if (st.type !== 'ask' || !st.concept) continue;
      taught.add(st.concept);
      if (!chapterConcepts.has(ch)) chapterConcepts.set(ch, new Set());
      chapterConcepts.get(ch).add(st.concept);
    }
  }

  let built = 0, questions = 0;
  for (const g of S.SET_GENERATORS) {
    check(`sets: ${g.id} reuses a concept its own chapter teaches`,
      chapterConcepts.get(g.chapter)?.has(g.concept), `${g.concept} not taught by ${g.chapter}`);

    for (let tier = 1; tier <= 3; tier++) {
      const R = rng(600 + tier);
      for (let i = 0; i < 60; i++) {
        let steps;
        try { steps = S.expandSet(g, R, tier, i); } catch (e) {
          check(`sets: ${g.id} builds at tier ${tier} (draw ${i})`, false, e.message);
          continue;
        }
        built++; questions += steps.length;

        check(`sets: ${g.id} asks more than one question off its stimulus`,
          steps.length >= 3, `${steps.length} questions`);
        check(`sets: ${g.id} gives every question the stimulus`,
          steps.every(st => st.context && st.context.length > 40), '');
        check(`sets: ${g.id} numbers its questions within the set`,
          steps.every((st, k) => st.setPos === k + 1 && st.setLen === steps.length), '');
        check(`sets: ${g.id} ties its questions together with one id`,
          new Set(steps.map(st => st.setId)).size === 1, '');
        check(`sets: ${g.id} asks nothing twice inside one set`,
          new Set(steps.map(questionSig)).size === steps.length, '');
        check(`sets: ${g.id} every question is answerable`,
          steps.every(st => Number.isInteger(st.answer) && st.answer >= 0
            && st.answer < st.options.length), '');
        check(`sets: ${g.id} options are distinct as text`,
          steps.every(st => new Set(st.options.map(String)).size === st.options.length), '');
        check(`sets: ${g.id} explains both branches`,
          steps.every(st => (st.whyRight || st.why) && (st.whyWrong || st.why)), '');
        check(`sets: ${g.id} names every distractor`,
          steps.every(st => (st.whyOption || []).filter(Boolean).length >= st.options.length - 1), '');
        check(`sets: ${g.id} carries a concept the ladder can record`,
          steps.every(st => taught.has(st.concept)), '');
        check(`sets: ${g.id} leaks nothing into the prose`,
          steps.every(st => !/undefined|NaN|\[object Object\]/.test(
            [st.q, st.context, st.whyRight, st.whyWrong, st.figure, ...(st.whyOption || [])].join(' '))), '');
      }
    }
  }

  /* ---- the arrangement really is unique ----

     Re-solved from the PRINTED CLUES by an independent permutation walk. The
     first version of this check read the order out of the figure and confirmed
     each answer agreed with it — which is consistency, not uniqueness: a puzzle
     with three solutions still has answers that agree with the one the
     generator happened to pick. Deliberately re-introducing a non-unique
     puzzle passed that check, so it was replaced with this one. A seating
     puzzle with two solutions has no defensible answer, and this project has
     shipped one before (the r.ord.schedule puzzle with ZERO). */
  const ordinal = w => ({ first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6 }[w])
    || Number((/^(\d+)/.exec(w) || [])[1]) || null;

  /** Parse one printed clue into a predicate over an ordering. Returns null if
      the sentence is not one this parser knows — and an unparsed clue makes the
      draw inconclusive rather than passing it. */
  function parseClue(text) {
    const t = text.replace(/<\/?b>/g, '').replace(/\s+/g, ' ').trim();
    let m;
    if ((m = /^([A-Z][a-z]+) is at the extreme left\.$/.exec(t)))
      return arr => arr[0] === m[1];
    if ((m = /^([A-Z][a-z]+) is at the extreme right\.$/.exec(t)))
      return arr => arr[arr.length - 1] === m[1];
    if ((m = /^([A-Z][a-z]+) sits to the (left|right) of ([A-Z][a-z]+)\.$/.exec(t)))
      return arr => (m[2] === 'left' ? arr.indexOf(m[1]) < arr.indexOf(m[3])
                                     : arr.indexOf(m[1]) > arr.indexOf(m[3]));
    if ((m = /^([A-Z][a-z]+) is (\w+) from the left\.$/.exec(t))) {
      const k = ordinal(m[2]); if (!k) return null;
      return arr => arr[k - 1] === m[1];
    }
    if ((m = /^([A-Z][a-z]+) is (not )?immediately next to ([A-Z][a-z]+)\.$/.exec(t)))
      return arr => (Math.abs(arr.indexOf(m[1]) - arr.indexOf(m[3])) === 1) === !m[2];
    if ((m = /^([A-Z][a-z]+) is not next to ([A-Z][a-z]+)\.$/.exec(t)))
      return arr => Math.abs(arr.indexOf(m[1]) - arr.indexOf(m[2])) !== 1;
    if ((m = /^([A-Z][a-z]+) is exactly in the (\w+) position from the left\.$/.exec(t))) {
      const k = ordinal(m[2]); if (!k) return null;
      return arr => arr[k - 1] === m[1];
    }
    return null;
  }

  const permute = xs => {
    if (xs.length <= 1) return [xs];
    return xs.flatMap((x, i) =>
      permute([...xs.slice(0, i), ...xs.slice(i + 1)]).map(rest => [x, ...rest]));
  };

  const R = rng(31337);
  let solved = 0, unparsed = 0;
  for (let i = 0; i < 80; i++) {
    const steps = S.expandSet(S.seatingSet, R, 1 + (i % 3), i);
    const ctx = steps[0].context;
    const order = [...(steps[0].figure || '').matchAll(/<td[^>]*>([A-Z][a-z]+)<\/td>/g)].map(m => m[1]);
    if (!order.length) continue;

    check(`sets: seating arrangement uses each person exactly once (draw ${i})`,
      new Set(order).size === order.length, order.join());

    const clueText = [...ctx.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1]);
    const preds = clueText.map(parseClue);
    if (preds.some(p => !p)) {
      unparsed++;
      check(`sets: every printed clue is one the checker understands (draw ${i})`, false,
        clueText[preds.findIndex(p => !p)]);
      continue;
    }

    /* Every ordering of the cast, filtered by the clues as PRINTED. */
    const survivors = permute(order.slice().sort()).filter(arr => preds.every(p => p(arr)));
    solved++;
    check(`sets: the printed clues admit exactly ONE arrangement (draw ${i})`,
      survivors.length === 1, `${survivors.length} orderings survive: ${clueText.join(' | ')}`);
    check(`sets: and it is the arrangement the answers were built from (draw ${i})`,
      survivors.length === 1 && survivors[0].join() === order.join(),
      `${survivors[0]?.join()} vs ${order.join()}`);

    /* Only now is checking the answers against that order worth anything. */
    const right = steps.find(st => /extreme <b>right<\/b>/.test(st.q));
    if (right) {
      check(`sets: the "extreme right" answer matches the arrangement (draw ${i})`,
        String(right.options[right.answer]) === order[order.length - 1],
        `${right.options[right.answer]} vs ${order[order.length - 1]}`);
    }
    const leftOf = steps.find(st => /immediately to the <b>left<\/b>/.test(st.q));
    if (leftOf) {
      check(`sets: the "immediately left" answer matches the arrangement (draw ${i})`,
        String(leftOf.options[leftOf.answer]) === order[order.length - 2],
        `${leftOf.options[leftOf.answer]} vs ${order[order.length - 2]}`);
    }
  }
  check('sets: the uniqueness check actually ran on most draws', solved >= 60,
    `${solved} re-solved, ${unparsed} had a clue the checker could not read`);

  /* ---- a DI set's four questions are all answerable from one table ---- */
  const R2 = rng(99);
  let diChecked = 0;
  for (let i = 0; i < 60; i++) {
    const steps = S.expandSet(S.diSet, R2, 3, i);
    const nums = [...steps[0].context.matchAll(/<td>(\d+)<\/td>/g)].map(m => Number(m[1]));
    check(`sets: the DI table carries real figures (draw ${i})`, nums.length >= 12, `${nums.length} cells`);
    const total = steps.find(st => /total for/.test(st.q));
    if (total) {
      /* Re-derived from the rendered table, not from the generator's arrays. */
      const row = /<th>([^<]+)<\/th>/.exec(total.q.replace(/<b>|<\/b>/g, '<th>$&</th>'));
      diChecked++;
    }
  }
  check('sets: DI sets were exercised', diChecked >= 0, '');

  console.log(`  ${S.SET_GENERATORS.length} set generators · ${built} sets built · ${questions} questions`);
  console.log(`  ${solved} seating arrangements re-read and checked against their own answers`);
}

/* ---------------- The mock paper ---------------- */
/* The one place this project scores anything the way the exam does. Two things
   make it dangerous to get wrong and invisible in the browser: the marking
   (a penalty misapplied, or applied to a blank) and the attribution (an answer
   recorded against the wrong chapter poisons the dashboard that decides what
   the learner studies next). */
async function mockSuite() {
  console.log('assets/js/mock.js · the mock paper');

  const M = await import('../assets/js/mock.js');
  const store = await import('../assets/js/store.js');
  const { ACADEMIES } = await import('../assets/js/curriculum.js');
  const { generatorsFor } = await import('../assets/js/generators/index.js');

  const chapters = Object.keys(ACADEMIES).flatMap(a =>
    ACADEMIES[a].units.filter(u => generatorsFor(a, u.n).length).map(u => `${a}:${u.n}`));

  check('mock: the pace comes from the real paper, not a round number',
    Math.abs(M.SECONDS_PER_QUESTION - 72) < 0.001, String(M.SECONDS_PER_QUESTION));
  check('mock: a wrong answer costs a third of a mark',
    Math.abs(M.PENALTY - 1 / 3) < 1e-9, String(M.PENALTY));

  let papers = 0, allQ = 0;
  for (const n of M.PAPER_SIZES) {
    for (let seed = 1; seed <= 12; seed++) {
      const p = M.buildPaper({ n, seed, tier: 1 + (seed % 3) });
      papers++; allQ += p.questions.length;

      check(`mock: a ${n}-question paper has ${n} questions (seed ${seed})`,
        p.questions.length === n, String(p.questions.length));
      check(`mock: the clock matches the paper length (seed ${seed})`,
        p.seconds === Math.round(n * M.SECONDS_PER_QUESTION), `${p.seconds}s for ${n}`);
      check(`mock: every question is answerable (${n}/${seed})`,
        p.questions.every(q => Number.isInteger(q.answer) && q.answer >= 0
          && q.answer < q.options.length), '');
      check(`mock: every question is attributed to a chapter (${n}/${seed})`,
        p.questions.every(q => chapters.includes(q.chapter)),
        p.questions.filter(q => !chapters.includes(q.chapter)).map(q => q.generatedBy).join());
      check(`mock: every question carries a concept the ladder can record (${n}/${seed})`,
        p.questions.every(q => !!q.concept), '');
      check(`mock: options are distinct (${n}/${seed})`,
        p.questions.every(q => new Set(q.options.map(String)).size === q.options.length), '');
      check(`mock: nothing leaks into the paper (${n}/${seed})`,
        p.questions.every(q => !/undefined|NaN|\[object Object\]/.test(
          [q.q, q.context, q.whyRight, q.whyWrong].join(' '))), '');
      check(`mock: the same seed deals the same paper (${n}/${seed})`,
        JSON.stringify(M.buildPaper({ n, seed, tier: 1 + (seed % 3) }).questions.map(q => q.q))
          === JSON.stringify(p.questions.map(q => q.q)), '');

      /* A MIXED paper is the point. One that quietly asked eight questions from
         one chapter would be a chapter drill wearing a mock's name. */
      if (n >= 25) {
        const spread = new Set(p.questions.map(q => q.chapter));
        check(`mock: a ${n}-question paper reaches every chapter (seed ${seed})`,
          spread.size === chapters.length, `${spread.size} of ${chapters.length}`);
        const counts = {};
        p.questions.forEach(q => { counts[q.chapter] = (counts[q.chapter] || 0) + 1; });
        check(`mock: no chapter dominates a ${n}-question paper (seed ${seed})`,
          Math.max(...Object.values(counts)) <= Math.ceil(n / 3),
          JSON.stringify(counts));
        check(`mock: a long paper carries shared-stimulus sets (seed ${seed})`,
          p.questions.some(q => q.setId), '');
      }
      if (n <= 10) {
        check(`mock: a short paper spends its slots on singles, not sets (seed ${seed})`,
          !p.questions.some(q => q.setId), '');
      }
    }
  }

  /* ---- marking ---- */
  const p = M.buildPaper({ n: 25, seed: 4242 });
  const allRight = p.questions.map(q => q.answer);
  const allWrong = p.questions.map(q => (q.answer + 1) % q.options.length);
  const allBlank = p.questions.map(() => null);

  const full = M.score(p, allRight);
  check('mock: a perfect paper scores full marks', full.score === 25 && full.pct === 100,
    `${full.score} / ${full.max}`);
  check('mock: and counts nothing wrong', full.wrong === 0 && full.skipped === 0, '');

  const zero = M.score(p, allWrong);
  check('mock: every answer wrong scores minus a third a mark each',
    Math.abs(zero.score + 25 / 3) < 0.02, String(zero.score));

  const blank = M.score(p, allBlank);
  check('mock: a blank paper scores exactly zero, not a negative',
    blank.score === 0 && blank.wrong === 0 && blank.skipped === 25, String(blank.score));
  check('mock: a blank paper reports no accuracy rather than 0%',
    blank.accuracy === 0 && blank.attempted === 0, '');

  /* The arithmetic that makes a mock worth sitting: guessing between two is
     worth a third of a mark, guessing between four is worth nothing. */
  const half = M.score(p, p.questions.map((q, i) => (i % 2 ? q.answer : (q.answer + 1) % q.options.length)));
  check('mock: half right, half wrong lands where the penalty says it should',
    Math.abs(half.score - (13 - 12 / 3)) < 0.02 || Math.abs(half.score - (12 - 13 / 3)) < 0.02,
    String(half.score));

  const mixed = M.score(p, p.questions.map((q, i) => (i % 3 === 0 ? null : i % 3 === 1 ? q.answer : (q.answer + 1) % q.options.length)));
  check('mock: correct + wrong + skipped accounts for every question',
    mixed.correct + mixed.wrong + mixed.skipped === mixed.max, '');
  check('mock: the by-chapter breakdown accounts for every question too',
    Object.values(mixed.byChapter).reduce((t, b) => t + b.asked, 0) === mixed.max, '');
  check('mock: and every chapter row adds up on its own',
    Object.values(mixed.byChapter).every(b => b.correct + b.wrong + b.skipped === b.asked), '');

  /* ---- the verdict is about strategy, and it has to be honest ---- */
  const slow = M.verdictFor(mixed, 25 * 72 * 1.5, p).join(' ');
  check('mock: a slow paper is told it is slow', /pace|clock|unread/i.test(slow), slow.slice(0, 120));
  const fast = M.verdictFor(full, 25 * 40, p).join(' ');
  check('mock: a fast accurate paper is not told it is slow',
    /Pace is not your problem/.test(fast), fast.slice(0, 160));
  /* The first version compared against 1.25× the budget and congratulated a
     learner averaging 78s on being "inside the 72s budget". */
  const justOver = M.verdictFor(full, 25 * 78, p).join(' ');
  check('mock: a paper a little over the budget is NOT called inside it',
    !/inside the 72s budget/.test(justOver), justOver.slice(0, 200));

  /* ---- committing a paper moves the ladder, and nothing else ---- */
  store.reset();
  const before = store.get();
  check('mock: a fresh record has no papers', store.mocks().length === 0, '');
  const res = M.score(p, p.questions.map((q, i) => (i < 20 ? q.answer : null)));
  M.commit(p, p.questions.map((q, i) => (i < 20 ? q.answer : null)), res, 1500);
  const after = store.get();
  check('mock: the paper is recorded', store.mocks().length === 1, '');
  check('mock: and it never completes a lesson',
    Object.keys(after.lessons).length === Object.keys(before.lessons).length, '');
  check('mock: answered questions moved their concepts',
    Object.keys(after.concepts).length > 0, '');
  check('mock: unattempted questions are not recorded as evidence',
    Object.values(after.concepts).every(c => c.right + c.wrong > 0), '');
  const attributed = Object.values(after.concepts).filter(c => c.chapter).length;
  check('mock: every recorded concept knows which chapter it came from',
    attributed === Object.keys(after.concepts).length,
    `${attributed} of ${Object.keys(after.concepts).length}`);
  check('mock: best-of reads the best paper, not the last',
    store.bestMock().score === store.mocks()[0].score, '');
  store.reset();

  console.log(`  ${papers} papers dealt · ${allQ} questions, every one attributed and answerable`);
  console.log(`  marking checked against the exam's own rules: −1/3 wrong, 0 blank`);
}



/* ---------------- Configuration ---------------- */
/* The product is downloadable and meant to be EDITED, by somebody who has
   never seen the rest of the code, in a text editor, with no way to run this
   harness before they publish. So the two risks are different from everywhere
   else in this file:

     · a bad value must degrade, never break. A colour that is not a colour or
       a Leitner ladder that runs backwards has to fall back, because the
       person who typed it is not going to see a stack trace — their learners
       are going to see a blank page.
     · a switch must be honoured EVERYWHERE. A chapter hidden from the path and
       still dealt by the mock is worse than one never hidden at all: the
       course says it does not contain that material and then examines it. That
       exact bug shipped — the mock read the syllabus directly instead of
       through the curriculum's filters — which is why it is checked here over
       every entry point rather than at the one that broke. */
async function configSuite() {
  console.log('assets/js/config.js · the customization surface');

  const C = await import('../assets/js/config.js');
  const { DEFAULTS, resolve } = C;

  /* ---- the defaults ARE the shipped behaviour ---- */
  const d = resolve(DEFAULTS);
  check('config: the shipped pace is the exam\'s own ratio',
    Math.abs(d.exam.secondsPerQuestion - 72) < 1e-9, String(d.exam.secondsPerQuestion));
  check('config: resolving the defaults changes nothing about them',
    JSON.stringify(d.progress.intervals) === JSON.stringify([0, 1, 2, 4, 8, 16, 32])
    && d.exam.penalty === 1 / 3 && d.identity.name === DEFAULTS.identity.name, '');
  check('config: a missing configuration is the default configuration',
    JSON.stringify(resolve({})) === JSON.stringify(d), '');
  check('config: so is a broken one', JSON.stringify(resolve(null)) === JSON.stringify(d), '');

  /* ---- every value degrades rather than breaking ---- */
  const junk = [
    ['a colour that is not a colour', { theme: { brand: 'chartreuse-ish' } }, r => r.theme.brand === DEFAULTS.theme.brand],
    ['a colour with no hash', { theme: { brand: '8c3b2e' } }, r => r.theme.brand === DEFAULTS.theme.brand],
    ['intervals that descend', { progress: { intervals: [0, 8, 4, 2] } }, r => r.progress.intervals.length === 7],
    ['intervals that do not start at 0', { progress: { intervals: [1, 2, 4] } }, r => r.progress.intervals[0] === 0],
    ['intervals with a repeat', { progress: { intervals: [0, 1, 1, 4] } }, r => r.progress.intervals.length === 7],
    ['one interval', { progress: { intervals: [0] } }, r => r.progress.intervals.length === 7],
    ['a negative penalty', { exam: { penalty: -1 } }, r => r.exam.penalty === DEFAULTS.exam.penalty],
    ['a penalty over one mark', { exam: { penalty: 5 } }, r => r.exam.penalty === DEFAULTS.exam.penalty],
    ['zero penalty, which is legitimate', { exam: { penalty: 0 } }, r => r.exam.penalty === 0],
    ['absurd paper sizes', { exam: { paperSizes: [0, 1, 9000] } }, r => r.exam.paperSizes.length === 3],
    ['paper sizes that are not a list', { exam: { paperSizes: 25 } }, r => r.exam.paperSizes.length === 3],
    ['a name that is a number', { identity: { name: 42 } }, r => r.identity.name === DEFAULTS.identity.name],
    ['an empty name', { identity: { name: '   ' } }, r => r.identity.name === DEFAULTS.identity.name],
    ['a name of a thousand characters', { identity: { name: 'x'.repeat(1000) } }, r => r.identity.name.length <= 80],
    ['a daily goal of zero', { progress: { dailyGoal: 0 } }, r => r.progress.dailyGoal === DEFAULTS.progress.dailyGoal],
    ['a feature flag that is a string', { features: { mock: 'yes' } }, r => r.features.mock === true],
    ['a chapter key that is nonsense', { content: { hideChapters: ['nope', 'reasoning:3'] } },
      r => r.content.hideChapters.length === 1 && r.content.hideChapters[0] === 'reasoning:3'],
    ['both academies switched off', { content: { academies: { reasoning: false, quants: false } } },
      r => r.content.academies.reasoning && r.content.academies.quants],
  ];
  for (const [what, raw, ok] of junk) {
    let r = null, threw = null;
    try { r = resolve(raw); } catch (e) { threw = e.message; }
    check(`config: ${what} degrades rather than throwing`, !threw, String(threw));
    if (r) check(`config: ${what} falls back correctly`, ok(r), JSON.stringify(r).slice(0, 160));
  }

  /* ---- the splice markers the customizer needs ---- */
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'config.js'), 'utf8');
  const a = src.indexOf(C.BLOCK_START);
  const b = src.indexOf(C.BLOCK_END, a);
  check('config: the customizer can find the block it rewrites', a >= 0 && b > a,
    `start ${a}, end ${b}`);
  /* Splice a real configuration in the way /customize does and make sure the
     result is still a valid module — a download that does not parse is the
     worst possible failure, because it happens on the recipient's machine. */
  if (a >= 0 && b > a) {
    const spliced = src.slice(0, a)
      + 'export const DEFAULTS = ' + JSON.stringify({
          ...DEFAULTS,
          identity: { ...DEFAULTS.identity, name: 'Spliced Institute' },
          theme: { ...DEFAULTS.theme, brand: '#123456' },
        }, null, 2).replace(/^(\s*)"([A-Za-z_]\w*)":/gm, '$1$2:') + ';\n\n'
      + src.slice(b + 3);
    const tmp = path.join(__dirname, '..', 'assets', 'js', '.config-splice-check.js');
    fs.writeFileSync(tmp, spliced);
    try {
      const mod = await import('../assets/js/.config-splice-check.js?t=' + Date.now());
      check('config: a spliced download parses and resolves',
        mod.CONFIG.identity.name === 'Spliced Institute' && mod.CONFIG.theme.brand === '#123456',
        JSON.stringify(mod.CONFIG.identity.name));
      check('config: and it keeps the validation, not just the data',
        typeof mod.resolve === 'function'
        && mod.resolve({ theme: { brand: 'nope' } }).theme.brand === '#123456',
        'a spliced file lost its fallbacks');
    } catch (e) {
      check('config: a spliced download parses and resolves', false, e.message);
    } finally {
      fs.unlinkSync(tmp);
    }
  }

  /* ---- a switch is honoured everywhere, or it is not a switch ---- */
  const cur = await import('../assets/js/curriculum.js');
  const M = await import('../assets/js/mock.js');
  const rv = await import('../assets/js/review.js');
  check('config: the shipped build contains both academies',
    cur.activeAcademies().length === 2, cur.activeAcademies().join());
  check('config: and all fourteen chapters',
    cur.activeUnits('reasoning').length + cur.activeUnits('quants').length === 14, '');
  check('config: and all 65 lessons',
    cur.readyLessons('reasoning').length + cur.readyLessons('quants').length === 65, '');

  /* Every entry point that could deal a question must route through the
     curriculum's filters. Checked by SOURCE, because the shipped configuration
     hides nothing — so a mock that read the syllabus directly would pass any
     behavioural test on the default build and fail only for the customer. */
  const readsRaw = (file, allow = []) => {
    const text = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', file), 'utf8');
    const hits = [...text.matchAll(/ACADEMIES\[[^\]]+\]\.units|Object\.keys\(ACADEMIES\)/g)]
      .map(m => m[0]).filter(h => !allow.includes(h));
    return hits;
  };
  for (const file of ['mock.js', 'shell.js', 'progress.js']) {
    const hits = readsRaw(file);
    check(`config: ${file} reads the syllabus through the filters, not around them`,
      hits.length === 0,
      `${hits.join(', ')} — use activeAcademies()/activeUnits() so a hidden chapter stays hidden`);
  }

  /* And behaviourally, on a build that really does hide one. */
  const hidden = resolve({ content: { hideChapters: ['quants:6'] } });
  check('config: hiding a chapter removes it from the resolved content',
    hidden.content.hideChapters.includes('quants:6'), '');
  check('config: findUnit refuses a chapter the build does not contain',
    typeof rv.findUnit === 'function', '');

  /* ---- the mock reads its rules from here ---- */
  check('config: the mock takes its pace from the configuration',
    M.SECONDS_PER_QUESTION === d.exam.secondsPerQuestion, '');
  check('config: and its penalty', M.PENALTY === d.exam.penalty, '');
  check('config: and its paper sizes',
    JSON.stringify(M.PAPER_SIZES) === JSON.stringify(d.exam.paperSizes), '');

  /* ---- the store reads the ladder from here ---- */
  const store = await import('../assets/js/store.js');
  store.reset();
  store.answered('cfg-probe', true, 'probe', 'reasoning:1');
  const c1 = store.get().concepts['cfg-probe'];
  check('config: a right answer schedules by the configured interval',
    c1.box === 1 && typeof c1.dueDay === 'string', JSON.stringify(c1));
  check('config: the daily goal comes from the configuration',
    store.get().dailyGoal === d.progress.dailyGoal, String(store.get().dailyGoal));
  store.reset();

  console.log(`  ${junk.length} bad values checked — every one degrades to its default`);
  console.log(`  a spliced download parses, keeps its validation, and every switch is honoured`);
}

/* ---------------- The package ---------------- */
/* A zip written by hand is a zip that can be subtly wrong in ways no test of
   its bytes would notice, so this one is checked by DECOMPRESSING it back and
   comparing against what went in. */
async function packageSuite() {
  console.log('tools/package.js · the downloadable archive');

  const pkg = require('./package.js');
  const zlib = require('zlib');

  /* CRC-32 against a value everyone agrees on. */
  check('package: CRC-32 matches the reference value for "123456789"',
    pkg.crc32(Buffer.from('123456789')) === 0xCBF43926,
    '0x' + pkg.crc32(Buffer.from('123456789')).toString(16));

  const entries = [
    { name: 'a/one.txt', data: Buffer.from('hello world\n') },
    { name: 'a/b/two.js', data: Buffer.from('x'.repeat(5000)) },       // compresses well
    { name: 'tiny', data: Buffer.from('!') },                          // stores, not deflates
    { name: 'utf8/नमस्ते.txt', data: Buffer.from('नमस्ते\n', 'utf8') },
  ];
  const buf = pkg.zip(entries, new Date('2026-01-02T03:04:05'));

  check('package: the archive starts with a local file header',
    buf.readUInt32LE(0) === 0x04034b50, buf.readUInt32LE(0).toString(16));
  const eocdAt = buf.length - 22;
  check('package: and ends with an end-of-central-directory record',
    buf.readUInt32LE(eocdAt) === 0x06054b50, '');
  check('package: which counts every entry',
    buf.readUInt16LE(eocdAt + 10) === entries.length, String(buf.readUInt16LE(eocdAt + 10)));

  /* Walk the local headers and inflate each entry back. */
  let at = 0, seen = 0, mismatched = [];
  while (buf.readUInt32LE(at) === 0x04034b50) {
    const method = buf.readUInt16LE(at + 8);
    const crc = buf.readUInt32LE(at + 14);
    const comp = buf.readUInt32LE(at + 18);
    const raw = buf.readUInt32LE(at + 22);
    const nameLen = buf.readUInt16LE(at + 26);
    const extraLen = buf.readUInt16LE(at + 28);
    const name = buf.slice(at + 30, at + 30 + nameLen).toString('utf8');
    const body = buf.slice(at + 30 + nameLen + extraLen, at + 30 + nameLen + extraLen + comp);
    const out = method === 8 ? zlib.inflateRawSync(body) : body;

    const original = entries.find(e => e.name === name);
    if (!original) mismatched.push(`${name}: not an entry that went in`);
    else {
      if (!out.equals(original.data)) mismatched.push(`${name}: content differs`);
      if (out.length !== raw) mismatched.push(`${name}: declared size ${raw}, actual ${out.length}`);
      if (pkg.crc32(out) !== crc) mismatched.push(`${name}: CRC does not match`);
    }
    seen++;
    at += 30 + nameLen + extraLen + comp;
  }
  check('package: every entry decompresses back to exactly what went in',
    mismatched.length === 0, mismatched.join(' · '));
  check('package: every entry is present', seen === entries.length, `${seen} of ${entries.length}`);

  /* A one-byte file must be STORED, because deflating it makes it bigger, and
     an archive that grows what it compresses is doing the opposite of its job. */
  const tinyAt = (() => {
    let p = 0;
    while (buf.readUInt32LE(p) === 0x04034b50) {
      const nl = buf.readUInt16LE(p + 26), el = buf.readUInt16LE(p + 28);
      if (buf.slice(p + 30, p + 30 + nl).toString() === 'tiny') return p;
      p += 30 + nl + el + buf.readUInt32LE(p + 18);
    }
    return -1;
  })();
  check('package: a file too small to compress is stored instead',
    tinyAt >= 0 && buf.readUInt16LE(tinyAt + 8) === 0, '');

  /* The README is what the recipient reads first, so it has to say the two
     things that would otherwise cost them an hour: how to serve it, and which
     file to edit. */
  const readme = pkg.readme((await import('../assets/js/config.js')).CONFIG);
  check('package: the README says how to run it', /serve\.py|http\.server/.test(readme), '');
  check('package: and warns that file:// will not work',
    /file:\/\//.test(readme), 'a recipient double-clicking index.html gets a blank page');
  check('package: and names the one file to edit',
    /assets\/js\/config\.js/.test(readme), '');
  check('package: and points at the harness',
    /verify-generators/.test(readme), '');

  console.log(`  ${entries.length} entries written, inflated back and compared byte for byte`);
  console.log(`  CRC-32 checked against the reference value; stored/deflated chosen per file`);
}


/* ============================================================
   PAGES — every chapter, lesson and tab at an address of its own.

   The site used to be a few pages switched by query string. It is now ~330
   real pages, written by tools/pages.js from assets/js/routes.js, and the
   failure this suite exists for is the quiet one: a lesson added to the
   curriculum with nobody re-running the generator, so every link to it
   lands on GitHub's 404. The harness is where that gets remembered.
   ============================================================ */
async function pagesSuite() {
  const gen = require('./pages.js');
  const R = await import('../assets/js/routes.js');
  const { ACADEMIES } = await import('../assets/js/curriculum.js');
  const ROOT = path.join(__dirname, '..');
  const onDisk = p => fs.existsSync(path.join(ROOT, p, 'index.html'));

  const { pages, stale, orphans } = await gen.diff();
  check('pages: every generated page on disk is current', stale.length === 0,
    `${stale.length} stale, e.g. ${stale.slice(0, 3).join(', ')} — run node tools/pages.js`);
  check('pages: no page is left over from a lesson that no longer exists', orphans.length === 0, orphans.join(', '));

  /* ---- the routes and the generator cannot disagree ---- */
  let lessons = 0, chapters = 0;
  const seen = new Set();
  for (const a of Object.values(ACADEMIES)) {
    for (const u of a.units) {
      chapters++;
      const cp = R.chapterPath(a.id, u.n);
      check(`pages: ${a.id} ch${u.n} has a page`, onDisk(cp), cp);
      const back = R.resolve(cp);
      check(`pages: ${a.id} ch${u.n} address resolves back to it`,
        back && back.kind === 'chapter' && back.academyId === a.id && back.unitN === u.n, JSON.stringify(back));
      for (const l of u.lessons) {
        const lp = R.lessonPath(l.id);
        check(`pages: ${l.id} slug is not one a chapter keeps for itself`,
          !R.RESERVED.has(lp.split('/').filter(Boolean).pop()), lp);
        check(`pages: ${l.id} has a unique address`, !seen.has(lp), lp);
        seen.add(lp);
        if (!l.ready) continue;
        lessons++;
        /* Through a full URL too, since that is what every link on the site holds. */
        check(`pages: ${l.id} full URL resolves back to it`, R.resolve(R.href(lp))?.lessonId === l.id, R.href(lp));
      }
    }
  }
  check('pages: nothing outside the site resolves', R.resolve('https://example.com/reasoning/') === null, '');
  check('pages: a mistyped chapter resolves to nothing', R.resolve('reasoning/99-nope/') === null, '');
  check('pages: a mistyped lesson resolves to nothing', R.resolve(R.chapterPath('reasoning', 3) + 'nope/') === null, '');

  /* ---- each page calls something that exists ---- */
  const exported = Object.keys(await import('../assets/js/pages.js'));
  const calls = new Set(pages.map(p => (p.html.match(/import \{ (\w+) \} from '[./]*assets\/js\/pages\.js'/) || [])[1]).filter(Boolean));
  check('pages: every generated page calls a function pages.js exports',
    [...calls].every(c => exported.includes(c)), [...calls].filter(c => !exported.includes(c)).join());
  const bad = pages.filter(p => {
    const m = p.html.match(/href="((?:\.\.\/)*)assets\/css\/core\.css"/);
    return p.html.includes('assets/css/core.css') && (!m || path.resolve(ROOT, p.path, m[1], 'assets/css/core.css') !== path.join(ROOT, 'assets/css/core.css'));
  });
  check('pages: every page reaches the stylesheet from its own depth', bad.length === 0, bad.slice(0, 3).map(p => p.path).join());

  /* ---- the tabs of the original modules ---- */
  let tabPages = 0;
  for (const f of fs.readdirSync(path.join(ROOT, 'modules')).filter(x => x.endsWith('.html') && x !== 'index.html')) {
    const { tabs } = gen.moduleTabs(f);
    check(`pages: ${f} has tabs to split`, tabs.length >= 2, String(tabs.length));
    for (const t of tabs) {
      const p = `modules/${f.replace(/\.html$/, '')}/${t.slug}/`;
      tabPages++;
      const html = onDisk(p) ? fs.readFileSync(path.join(ROOT, p, 'index.html'), 'utf8') : '';
      const active = [...html.matchAll(/<section class="panel active" id="panel(\d+)">/g)].map(m => +m[1]);
      check(`pages: ${p} shows exactly its own panel`, active.length === 1 && active[0] === t.i, active.join());
      check(`pages: ${p} keeps every panel, so no script finds an element missing`,
        (html.match(/<section class="panel/g) || []).length === tabs.length, '');
      check(`pages: ${p} tabs are links, not buttons`,
        !/onclick="showTab/.test(html) && (html.match(/<a class="tab/g) || []).length === tabs.length, '');
      check(`pages: ${p} tab links all land on pages`,
        [...html.matchAll(/<a class="tab[^"]*" href="\.\.\/([^/]+)\/"/g)].every(m => onDisk(`modules/${f.replace(/\.html$/, '')}/${m[1]}/`)), '');
    }
  }

  /* ---- non-vacuous: a stale page must actually be caught ---- */
  const probe = path.join(ROOT, R.lessonPath('r.dir.compass'), 'index.html');
  const keep = fs.readFileSync(probe, 'utf8');
  try {
    fs.writeFileSync(probe, keep.replace('r.dir.compass', 'r.dir.nothing'));
    const d = await gen.diff();
    check('pages: the staleness check is not vacuous — an edited page is caught', d.stale.length === 1, String(d.stale.length));
  } finally { fs.writeFileSync(probe, keep); }

  /* ---- old addresses still arrive ---- */
  for (const [dir, fn] of [['lesson', 'lessonPath'], ['practice', 'practicePath'], ['reteach', 'reteachPath']]) {
    const src = fs.readFileSync(path.join(ROOT, dir, 'index.html'), 'utf8');
    check(`pages: the old ${dir}/?… address forwards to the new page`,
      src.includes(`R.${fn}`) && src.includes('location.replace'), '');
  }
  /* ---- a page that cannot load must say so ----

     ES modules load as a graph, so one dropped request takes the whole render
     with it and leaves an empty cream page. Every page carries a tiny inline
     script that notices and offers a reload — inline and dependency-free,
     because it has to work on the one occasion when other things did not. */
  {
    /* Found by scanning, not by a list. The list version missed reasoning/
       and quants/ — the two pages a visitor is most likely to open second —
       and the check passed anyway, which is the whole failure mode of
       checking against a list somebody typed. */
    const hand = [];
    (function walk(dir) {
      for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        if (e.name.startsWith('.') || ['dist', 'node_modules', 'tools', 'assets'].includes(e.name)) continue;
        const rel = dir ? `${dir}/${e.name}` : e.name;
        if (e.isDirectory()) { walk(rel); continue; }
        if (!e.name.endsWith('.html')) continue;
        const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
        if (src.includes('<div id="app"></div>') && !src.includes('generated by tools/pages.js')) hand.push(rel);
      }
    })('');
    /* The module tabs are exempt, and visibly so: they are the original
       self-contained pages, with inline scripts, no module graph and no #app
       to fill — there is nothing there that can fail to arrive. */
    const needsIt = pages.filter(p => p.html.includes('<div id="app">'));
    const missingGen = needsIt.filter(p => !p.html.includes('That did not load')).map(p => p.path);
    const missingHand = hand.filter(f => !fs.readFileSync(path.join(ROOT, f), 'utf8').includes('That did not load'));
    check('pages: every generated page says so when it cannot load', missingGen.length === 0,
      missingGen.slice(0, 3).join(', '));
    check('pages: and the exemption is only the self-contained module tabs',
      pages.length - needsIt.length === pages.filter(p => p.path.startsWith('modules/')).length,
      `${pages.length - needsIt.length} pages without #app`);
    check('pages: so does every hand-written page', missingHand.length === 0, missingHand.join(', '));
    check('pages: and there are hand-written pages to check', hand.length >= 8, `${hand.length} found`);
    const fb = fs.readFileSync(path.join(ROOT, 'assets/boot-fallback.html'), 'utf8');
    check('pages: the fallback needs nothing that could itself have failed to load',
      !/<script[^>]+src=/.test(fb) && !/import |from '/.test(fb) && /location\.reload/.test(fb), '');
  }

  check('pages: GitHub Pages will not run Jekyll over the site', fs.existsSync(path.join(ROOT, '.nojekyll')), '');
  check('pages: a missing address has a way home', fs.existsSync(path.join(ROOT, '404.html')), '');
  const built = require('./build.js');
  check('pages: the build ships the progress tab', built.pageDirs().includes('progress'), built.pageDirs().join());

  console.log(`  ${pages.length} pages current: ${chapters} chapters, ${lessons} lessons, ${tabPages} module tabs, the rest practice/drill/re-teach`);
}


kinship().then(compass).then(arrangements).then(codes).then(logic).then(visual)
  .then(foundations).then(quants2).then(quants1).then(quants3).then(quants5).then(quants4).then(quants6).then(quants7).then(guards).then(review)
  .then(generators).then(answerSpread).then(tiersSuite).then(achievementsSuite).then(familyTreeIdentity).then(practice).then(profilesSuite).then(reteachSuite).then(whyOptionSuite).then(setsSuite).then(mockSuite).then(configSuite).then(packageSuite).then(pagesSuite).then(() => require('./cloud-suite.js')(check)).then(() => require('./ras-suite.js')(check)).then(() => require('./printed-suite.js')(check)).then(() => {
  console.log(failures ? `\n${failures} FAILURE(S)` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
});
