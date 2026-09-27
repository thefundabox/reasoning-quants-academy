/* ============================================================
   RAS PRACTISE DRILLS — the regression suite.

   The rule the rest of this project runs on applies here too: the harness
   must re-derive the answer INDEPENDENTLY of the code that produced it. So
   the checks below read the question the learner would read — the printed
   numbers, the printed clues — and work the answer out again by a different
   route. Where that is impossible in a line of code (the judgement questions),
   the check is structural and says so.
   ============================================================ */
const fs = require('fs'), path = require('path');

const perms = xs => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) =>
  perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map(p => [x, ...p])));
const C = (n, r) => { if (r < 0 || r > n) return 0; let x = 1; for (let i = 1; i <= r; i++) x = x * (n - r + i) / i; return Math.round(x); };
const strip = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const nums = t => (strip(t).match(/-?\d[\d,]*\.?\d*/g) || []).map(x => +x.replace(/,/g, ''));

module.exports = async function rasSuite(check) {
  const ROOT = path.join(__dirname, '..');
  const { RAS_GENERATORS, RAS_TOPICS, rasDeal, rasSession, rasGeneratorsFor } = await import('../assets/js/ras/index.js');
  const { rng } = await import('../assets/js/generators/rand.js');
  const { ACADEMIES } = await import('../assets/js/curriculum.js');
  const R2 = await import('../assets/js/routes.js');

  /* ---- what every chapter teaches, so a RAS concept can be held to it ---- */
  const conceptsOf = {};
  for (const a of Object.values(ACADEMIES)) {
    for (const u of a.units) {
      const set = new Set();
      for (const l of u.lessons) {
        if (!l.ready) continue;
        const m = await import(`../assets/js/lessons/${l.id.replace(/\./g, '-')}.js`);
        (m.default.steps || []).forEach(s => { if (s.type === 'ask' && s.concept) set.add(s.concept); });
      }
      conceptsOf[`${a.id}:${u.n}`] = set;
    }
  }

  /* ---- structure, per generator, across all three tiers ---- */
  const DRAWS = 220;
  for (const g of RAS_GENERATORS) {
    const seen = [];
    const hard = { 1: [], 2: [], 3: [] };
    for (let t = 1; t <= 3; t++) {
      const r = rng(97 + t * 31);
      for (let i = 0; i < DRAWS; i++) {
        let q;
        try { q = g.make(r, t); } catch (e) { check(`ras ${g.id}: a draw threw`, false, e.message); break; }
        if (!q) continue;
        seen.push(q);
        hard[t].push(q.hardness);
      }
    }
    check(`ras ${g.id}: produces questions at all`, seen.length > 0, '0 in 660 draws');
    if (!seen.length) continue;

    const bad = seen.find(q => new Set(q.options.map(String)).size !== 4);
    check(`ras ${g.id}: always four distinct options`, !bad, bad ? JSON.stringify(bad.options) : '');
    const key = seen.find(q => !Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length);
    check(`ras ${g.id}: the key points at one of its own options`, !key, key ? String(key.answer) : '');
    const noWhy = seen.find(q => !(q.why || (q.whyRight && q.whyWrong)));
    check(`ras ${g.id}: explains the answer`, !noWhy, noWhy ? strip(noWhy.q).slice(0, 60) : '');
    const noQ = seen.find(q => !strip(q.q));
    check(`ras ${g.id}: asks something`, !noQ, '');
    check(`ras ${g.id}: names a chapter that exists`, !!conceptsOf[g.chapter], g.chapter);
    const stray = [...new Set(seen.map(q => q.concept))].filter(c => !conceptsOf[g.chapter]?.has(c));
    check(`ras ${g.id}: records against a concept its chapter teaches`, stray.length === 0, stray.join());
    check(`ras ${g.id}: belongs to a topic on the page`,
      RAS_TOPICS.some(t => t.id === g.topic), g.topic);
    /* A question that says "the figure" or "the table" must carry one. */
    const talksFigure = seen.filter(q => /\b(figure|table|chart|diagram) above|following (figure|table)|in the figure/i.test(strip(q.q) + strip(q.context)));
    const missing = talksFigure.find(q => !/<svg|<table/.test(q.context || ''));
    check(`ras ${g.id}: a question that names a figure shows one`, !missing, missing ? strip(missing.q).slice(0, 70) : '');
    /* Difficulty must rise with the tier, or the tier argument is decoration.
       The written judgement items used to be exempt here, because a pool of
       fifteen had nothing to vary. Each item now carries its own `level` and
       the tier picks by it, so they are held to the same rule as everything
       else. */
    const mean = t => hard[t].reduce((a, b) => a + b, 0) / (hard[t].length || 1);
    if (hard[1].length && hard[3].length) {
      check(`ras ${g.id}: gets harder as the tier rises`, mean(3) >= mean(1),
        `${mean(1).toFixed(2)} → ${mean(2).toFixed(2)} → ${mean(3).toFixed(2)}`);
    }
    /* This bank starts where the chapter drills end. */
    check(`ras ${g.id}: even its gentlest tier is an exam-level question`, mean(1) >= 1, mean(1).toFixed(2));
  }

  /* ---- answers, re-derived from the printed question ---- */
  let rederived = 0, wrong = 0;
  const say = (id, want, got, q) => { wrong++; if (wrong < 6) console.log(`  FAIL ras re-derive ${id}: want ${want}, key says ${got} — ${strip(q).slice(0, 90)}`); };
  const KEY = q => String(q.options[q.answer]);

  for (let s = 1; s <= 260; s++) {
    for (const g of RAS_GENERATORS) {
      let q; try { q = g.make(rng(s * 131 + 7), 1 + (s % 3)); } catch { continue; }
      if (!q) continue;
      const text = strip(q.context) + ' ' + strip(q.q);
      const k = KEY(q);

      if (g.id === 'ras-num-unit') {
        const ns = strip(q.q).match(/(\d+) × (\d+)(?: × (\d+))?(?: × (\d+))?/).slice(1).filter(Boolean).map(Number);
        const want = String(ns.reduce((a, b) => (a * (b % 10)) % 10, 1));
        rederived++; if (want !== k) say(g.id, want, k, text);
      } else if (g.id === 'ras-num-consec') {
        const total = nums(q.q)[0];
        const n = Math.sqrt((total + 1) / 3);
        rederived++; if (String(3 * n) !== k) say(g.id, 3 * n, k, text);
      } else if (g.id === 'ras-num-solutions') {
        const kk = nums(q.q).pop();
        rederived++; if (String((kk - 1) * (kk - 2) / 2) !== k) say(g.id, (kk - 1) * (kk - 2) / 2, k, text);
      } else if (g.id === 'ras-num-mean') {
        const m = strip(q.q).match(/from 1 to (\d+) that are divisible by ([\d, and]+)\?/);
        const N = +m[1];
        const set = (m[2].match(/\d+/g) || []).map(Number);
        const l = set.reduce((a, b) => { const gg = (x, y) => (y ? gg(y, x % y) : x); return a * b / gg(a, b); });
        const list = []; for (let x = l; x <= N; x += l) list.push(x);
        const want = +(list.reduce((a, b) => a + b, 0) / list.length).toFixed(2);
        rederived++; if (String(want) !== k) say(g.id, want, k, text);
      } else if (g.id === 'ras-cnt-atleast') {
        const [girls, boys, pick] = nums(text);
        const want = C(girls + boys, pick) - C(boys, pick);
        rederived++; if (String(want) !== k) say(g.id, want, k, text);
      } else if (g.id === 'ras-cnt-committee') {
        const [size, men, women, least] = nums(text);
        let want = 0;
        for (let w = least; w <= Math.min(women, size); w++) want += C(women, w) * C(men, size - w);
        rederived++; if (String(want) !== k) say(g.id, want, k, text);
      } else if (g.id === 'ras-cnt-dice') {
        const faces = /(\d+)-faced/.test(text) ? +text.match(/(\d+)-faced/)[1] : 6;
        const rolls = nums(strip(q.context)).pop();
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const good = C(faces, rolls), all = faces ** rolls, gg = gcd(good, all);
        rederived++; if (`${good / gg}/${all / gg}` !== k) say(g.id, `${good / gg}/${all / gg}`, k, text);
      } else if (g.id === 'ras-int-gap') {
        const m = text.match(/at ([\d.]+)% per annum for (\d+) years is ₹([\d,]+)/);
        const r = +m[1], y = +m[2], gap = +m[3].replace(/,/g, '');
        const want = y === 2 ? gap / (r / 100) ** 2 : gap * 1e6 / (r * r * (300 + r));
        rederived++; if (`₹${Math.round(want).toLocaleString('en-IN')}` !== k) say(g.id, want, k, text);
      } else if (g.id === 'ras-int-double') {
        const [n, years] = nums(text);
        rederived++; if (`${2 ** (years / n)} times` !== k) say(g.id, 2 ** (years / n), k, text);
      } else if (g.id === 'ras-int-back') {
        const m = text.match(/is ([\d,]+) and grows at ([\d.]+)% per annum.*?(\d+) years ago/);
        const want = Math.round(+m[1].replace(/,/g, '') / (1 + +m[2] / 100) ** +m[3]);
        rederived++; if (want.toLocaleString('en-IN') !== k) say(g.id, want, k, text);
      } else if (g.id === 'ras-mix-water') {
        const m = text.match(/In a (\d+) litre mixture, milk and water are in the ratio (\d+) : (\d+).*?ratio of milk to water (\d+) : (\d+)/);
        const [tot, a, b, ta, tb] = m.slice(1).map(Number);
        const milk = tot * a / (a + b);
        const want = milk * (ta + tb) / ta - tot;
        rederived++; if (`${+want.toFixed(2)} litres` !== k) say(g.id, want, k, text);
      } else if (g.id === 'ras-pct-change') {
        const m = strip(q.context).match(/exported ([\d,]+) units in [\d-]+ and ([\d,]+) units/);
        const from = +m[1].replace(/,/g, ''), to = +m[2].replace(/,/g, '');
        const pct = +((to - from) * 100 / from).toFixed(2);
        const want = `${Math.abs(pct)}% ${pct > 0 ? 'increase' : 'decrease'}`;
        rederived++; if (want !== k) say(g.id, want, k, text);
      } else if (g.id === 'ras-clk-cal') {
        const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const start = DAYS.findIndex(d => text.includes(`was a ${d}`));
        const n = nums(q.q)[0];
        rederived++; if (DAYS[(start + n) % 7] !== k) say(g.id, DAYS[(start + n) % 7], k, text);
      } else if (g.id === 'ras-clk-angle') {
        const m = strip(q.q).match(/at (\d+):(\d+)/);
        const h = +m[1], mm = +m[2];
        const raw = Math.abs(((h % 12) * 30 + mm * 0.5) - mm * 6);
        const want = +Math.min(raw, 360 - raw).toFixed(1);
        rederived++; if (`${want}°` !== k) say(g.id, want, k, text);
      }
    }
  }
  check('ras: every mechanical answer re-derived from the printed question', wrong === 0, `${wrong} of ${rederived}`);
  console.log(`  ${rederived} answers re-derived independently across 14 generators`);

  /* ---- the row puzzles, re-solved from their own clues ---- */
  let rows = 0, rowBad = 0;
  for (let s = 1; s < 400 && rows < 60; s++) {
    const q = RAS_GENERATORS.find(g => g.id === 'ras-arr-row').make(rng(s), 1 + (s % 3));
    if (!q) continue;
    rows++;
    const names = strip(q.context).match(/— ([^—]+) — sit in a row/)[1].split(', ');
    const clues = q.context.split('· ').slice(1).map(strip);
    let tests;
    try {
      tests = clues.map(c => {
        let m;
        if ((m = c.match(/^(\w+) and (\w+) sit next to each other/))) return r => Math.abs(r.indexOf(m[1]) - r.indexOf(m[2])) === 1;
        if ((m = c.match(/exactly (?:one person|(\d+) people) between (\w+) and (\w+)/))) return r => Math.abs(r.indexOf(m[2]) - r.indexOf(m[3])) - 1 === (m[1] ? +m[1] : 1);
        if ((m = c.match(/^(\w+) sits somewhere to the left of (\w+)/))) return r => r.indexOf(m[1]) < r.indexOf(m[2]);
        if ((m = c.match(/^(\w+) sits at one of the two ends/))) return r => r[0] === m[1] || r[r.length - 1] === m[1];
        if ((m = c.match(/^(\w+) sits (\d)\w\w from the left/))) return r => r.indexOf(m[1]) + 1 === +m[2];
        throw new Error(`unparsed clue: ${c}`);
      });
    } catch (e) { rowBad++; check('ras arrange: every clue is one the suite can read back', false, e.message); break; }
    const sol = perms(names).filter(r => tests.every(t => t(r)));
    if (sol.length !== 1) { rowBad++; continue; }
    const row = sol[0], text = strip(q.q);
    const want = /third from the left/.test(text) ? row[2]
      : /right of (\w+)/.test(text) ? row[row.indexOf(text.match(/right of (\w+)/)[1]) + 1]
      : row[row.length - 1];
    if (want !== KEY(q)) rowBad++;
  }
  check('ras arrange: every row puzzle has exactly one seating, and it is the one keyed',
    rowBad === 0 && rows > 20, `${rowBad} bad of ${rows}`);

  /* ---- syllogisms: solved again over a larger universe ---- */
  const { follows } = await import('../assets/js/ras/verbal.js');
  const holds = (claim, m) => {
    const [kind, a, b] = claim;
    if (kind === 'all') return m[a].every(x => m[b].includes(x));
    if (kind === 'no') return !m[a].some(x => m[b].includes(x));
    if (kind === 'some') return m[a].some(x => m[b].includes(x));
    return m[a].some(x => !m[b].includes(x));
  };
  const follows5 = (prem, con, terms) => {
    const U = 5, subsets = [];
    for (let mask = 1; mask < (1 << U); mask++) subsets.push([...Array(U).keys()].filter(i => mask & (1 << i)));
    for (const A of subsets) for (const B of subsets) for (const Cc of subsets) {
      const m = { [terms[0]]: A, [terms[1]]: B, [terms[2]]: Cc };
      if (prem.every(p => holds(p, m)) && !holds(con, m)) return false;
    }
    return true;
  };
  const T = ['x', 'y', 'z'];
  const KINDS = ['all', 'no', 'some', 'some-not'];
  let syl = 0, sylBad = 0;
  for (const k1 of KINDS) for (const k2 of KINDS) for (const ck of KINDS) for (const pair of [['x', 'z'], ['z', 'x'], ['y', 'x']]) {
    const prem = [[k1, 'x', 'y'], [k2, 'y', 'z']];
    const con = [ck, ...pair];
    syl++;
    if (follows(prem, con, T) !== follows5(prem, con, T)) sylBad++;
  }
  check('ras verbal: the syllogism solver agrees with a larger universe', sylBad === 0, `${sylBad} of ${syl}`);
  check('ras verbal: and it rejects the classic invalid conversion',
    !follows([['all', 'x', 'y']], ['all', 'y', 'x'], T) && follows([['all', 'x', 'y']], ['some', 'y', 'x'], T), '');

  /* ---- variety, per topic ---- */
  const thin = [];
  for (const t of RAS_TOPICS) {
    const seen = new Set();
    for (let s = 0; s < 260; s++) for (const q of rasDeal(t.id, 6, s * 97 + 1, 1 + (s % 3))) {
      seen.add(`${strip(q.context)}|${strip(q.q)}|${q.options.join('~')}`);
    }
    if (seen.size < 100) thin.push(`${t.id}:${seen.size}`);
  }
  check('ras: every topic can deal at least a hundred different questions', thin.length === 0, thin.join(' '));

  /* ---- the written judgement pool ----

     These are the only questions in the bank a person wrote rather than a rule
     generated, so what can go wrong with them is editorial: a lopsided answer
     key that rewards always picking the first option, a duplicated statement,
     a reason too thin to teach anything, or too few items at a tier so the
     same question comes round twice in one set. */
  {
    const { POOLS } = await import('../assets/js/ras/judgement.js');
    let items = 0;
    for (const [kind, pool] of Object.entries(POOLS)) {
      items += pool.length;
      check(`ras ${kind}: the pool is deep enough that a set does not repeat itself`,
        pool.length >= 16, `${pool.length} items`);
      check(`ras ${kind}: no statement appears twice`,
        new Set(pool.map(i => i.s)).size === pool.length, '');
      const thinWhy = pool.filter(i => i.why.split(/\s+/).length < 18);
      check(`ras ${kind}: every item gives a reason worth reading`, thinWhy.length === 0,
        thinWhy.map(i => i.s.slice(0, 40)).join(' | '));
      check(`ras ${kind}: every item names both options, a key and a level`,
        pool.every(i => i.s && i.a && i.b && i.key >= 0 && i.key <= 3 && i.level >= 1 && i.level <= 3), '');
      for (const [tier, want] of [[1, [1]], [2, [1, 2]], [3, [2, 3]]]) {
        const n = pool.filter(i => want.includes(i.level)).length;
        check(`ras ${kind}: tier ${tier} has a choice of items`, n >= 4, `${n} items at level ${want.join('/')}`);
      }
    }
    check('ras judgement: the written pool is substantial', items >= 90, `${items} items`);

    /* The commonest answer must not be a strategy. Four options means 25% by
       luck; a pool where "Only I" is right 60% of the time teaches that
       instead of teaching judgement. */
    for (const g of RAS_GENERATORS.filter(x => /ras-verb-(assume|action|arg|conclude)/.test(x.id))) {
      const counts = {};
      let n = 0;
      for (let s2 = 1; s2 <= 900; s2++) {
        const q = g.make(rng(s2 * 17 + 3), 1 + (s2 % 3));
        if (!q) continue;
        n++;
        const k = q.options[q.answer];
        counts[k] = (counts[k] || 0) + 1;
      }
      const top = Math.max(...Object.values(counts)) / n;
      check(`ras ${g.id}: no single answer is a winning strategy`, top <= 0.5,
        `commonest key is ${(top * 100).toFixed(0)}% of ${n} draws`);
      check(`ras ${g.id}: all four answers occur`, Object.keys(counts).length === 4, Object.keys(counts).join(' | '));
    }
    console.log(`  ${items} written judgement items checked for key spread, depth and duplication`);
  }

  /* ---- sets and pages ---- */
  const set = rasSession('mixed', { size: 15, seed: 4242 });
  check('ras: a mixed paper deals a full set', set.session && set.questions.length === 15, String(set.questions?.length));
  check('ras: a mixed paper is flagged review, so it cannot complete a lesson', set.session?.review === true, '');
  check('ras: every question carries the chapter it is recorded against',
    set.questions.every(q => /^(reasoning|quants):\d+$/.test(q.chapter || '')), '');
  check('ras: a mixed paper draws from both halves of the syllabus',
    new Set(set.questions.map(q => q.chapter.split(':')[0])).size === 2, '');
  check('ras: no question is repeated inside one paper',
    new Set(set.questions.map(q => strip(q.q) + q.options.join())).size === set.questions.length, '');
  check('ras: an unknown topic is refused rather than dealt empty', rasSession('nope').session === null, '');

  for (const t of [...RAS_TOPICS.map(x => x.id), 'mixed']) {
    check(`ras: ${t} has a page of its own`,
      fs.existsSync(path.join(ROOT, R2.rasTopicPath(t), 'index.html')), R2.rasTopicPath(t));
  }
  check('ras: the tab exists and points at the bank',
    R2.TABS.some(t => t.id === 'ras' && t.path === R2.rasPath()), '');
  check('ras: the index page exists', fs.existsSync(path.join(ROOT, R2.rasPath(), 'index.html')), '');
  check('ras: the bank is separate from the chapter drills',
    !fs.readFileSync(path.join(ROOT, 'assets/js/generators/index.js'), 'utf8').includes('ras/'), '');
  const drills = (await import('../assets/js/review.js')).makeDrillSession('reasoning', 5, 8, 11, 1);
  check('ras: the chapter drill still deals its own questions, unchanged',
    drills.session && drills.questions.every(q => !String(q.generatedBy || '').startsWith('ras-')), '');

  console.log(`  ${RAS_GENERATORS.length} RAS generators across ${RAS_TOPICS.length} topics, all tiers exercised`);
};
