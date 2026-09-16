/* ============================================================
   Family-tree builder.
   The learner states relations in words; the diagram assembles
   itself in the five-mark language. Gender is inferred from the
   relation, so "Ravi is the mother of X" is impossible to draw —
   which is itself the lesson.

   Engine adapted from the original blood-relations module.
   ============================================================ */

const GENDER = { father:'M', son:'M', brother:'M', husband:'M',
                 mother:'F', daughter:'F', sister:'F', wife:'F' };
const REL_LABEL = { father:'father of', mother:'mother of', son:'son of', daughter:'daughter of',
                    brother:'brother of', sister:'sister of', husband:'husband of', wife:'wife of' };

/**
 * One person, one key. A learner naming somebody a second time types what they
 * remember, not what they typed before — "Uncle", "uncle", " Uncle". Matching on
 * the exact string made each of those a NEW person, so the relation they meant to
 * hang off the existing tree floated off as an island instead. Identity is
 * therefore case- and space-insensitive; the spelling first used is what shows.
 */
export const canonName = s => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Every gender a single sentence forces, and on whom.
 *
 * This is the lesson stated as data: you never type anyone's gender, the
 * relation word decides it. "M is the father of R" makes M male; "M is the wife
 * of T" makes M female AND T male.
 */
export function genderClaims({ a, rel, b }) {
  const out = [];
  if (GENDER[rel]) out.push([canonName(a), GENDER[rel], a]);
  if (rel === 'husband') out.push([canonName(b), 'F', b]);
  if (rel === 'wife')    out.push([canonName(b), 'M', b]);
  return out;
}

const said = s => `${s.a} is the ${REL_LABEL[s.rel]} ${s.b}`;
const asMale = g => (g === 'M' ? 'male' : 'female');

/**
 * The first impossibility in a list of sentences, or null.
 *
 * `buildGraph` used to let the last sentence win: state that somebody is a
 * father and then that the same person is a wife, and the diagram quietly
 * redrew them as female. That is the one thing this widget must never do —
 * an impossible family drawn without complaint teaches the opposite of the
 * lesson, and it is exactly the contradiction an exam question hides in a chain.
 *
 * Two impossibilities are worth catching. A person forced to be both genders,
 * and a person who ends up their own ancestor.
 */
export function contradictionIn(sentences) {
  const claim = new Map();                       // person -> { g, by }
  for (const s of sentences) {
    for (const [key, g, shown] of genderClaims(s)) {
      const prev = claim.get(key);
      if (prev && prev.g !== g) {
        return {
          kind: 'gender', person: shown,
          was: said(prev.by), now: said(s),
          text: `You already said <b>${said(prev.by)}</b>, and that makes
                 <b>${shown}</b> ${asMale(prev.g)}. <b>${said(s)}</b> would make the
                 same person ${asMale(g)}.<br><br>
                 Nobody can be both — and you never typed a gender, the
                 <b>relation word</b> did. When a chain forces one person two ways
                 like this, the arrangement you assumed is the thing that is wrong.`,
        };
      }
      if (!prev) claim.set(key, { g, by: s });
    }
  }

  /* Parent links must not close a loop: nobody is their own grandfather.
     Adding one edge at a time names the exact sentence that closes it, which is
     more use to a learner than "there is a loop somewhere". */
  const kids = new Map();
  const descends = (from, target) => {           // is `target` below `from`?
    const seen = new Set(), stack = [from];
    while (stack.length) {
      const x = stack.pop();
      if (x === target) return true;
      if (seen.has(x)) continue;
      seen.add(x);
      (kids.get(x) || []).forEach(y => stack.push(y));
    }
    return false;
  };

  for (const s of sentences) {
    let p = null, c = null;
    if (s.rel === 'father' || s.rel === 'mother') { p = canonName(s.a); c = canonName(s.b); }
    if (s.rel === 'son'    || s.rel === 'daughter') { p = canonName(s.b); c = canonName(s.a); }
    if (!p || p === c) continue;
    if (descends(c, p)) return {
      kind: 'cycle', person: s.a, was: said(s), now: said(s),
      text: `<b>${said(s)}</b> closes a loop — follow the parent links from there and
             you arrive back at the same person.<br><br>
             Nobody can be their own ancestor, so one statement in that chain has
             to go before the tree can be drawn.`,
    };
    if (!kids.has(p)) kids.set(p, []);
    kids.get(p).push(c);
  }
  return null;
}

export function buildGraph(sentences) {
  const persons = {}, edges = [];
  const meet = raw => {
    const k = canonName(raw);
    persons[k] ||= { name: String(raw).trim(), gender: '?', gen: null };
    return k;
  };

  for (const s of sentences) {
    const rel = s.rel;
    const a = meet(s.a), b = meet(s.b);
    if (a === b) continue;                       // "Ravi is the father of ravi"
    if (GENDER[rel]) persons[a].gender = GENDER[rel];
    if (rel === 'husband') persons[b].gender = 'F';
    if (rel === 'wife')    persons[b].gender = 'M';

    let e = null;
    if (rel === 'father' || rel === 'mother')   e = { a, b, type: 'parent' };
    if (rel === 'son'    || rel === 'daughter') e = { a: b, b: a, type: 'parent' };
    if (rel === 'brother'|| rel === 'sister')   e = { a, b, type: 'sib' };
    if (rel === 'husband'|| rel === 'wife')     e = { a, b, type: 'spouse' };
    if (e && !edges.some(x => x.type === e.type &&
        ((x.a === e.a && x.b === e.b) || (e.type !== 'parent' && x.a === e.b && x.b === e.a))))
      edges.push(e);
  }
  assignGenerations(persons, edges);
  return { persons, edges, groups: componentsOf(persons, edges) };
}

/**
 * The people who are actually joined to one another, as separate lists.
 *
 * This matters more than it looks. Two people the learner has never linked are
 * not "on the same generation" — they have no relationship at all, and drawing
 * them on one row silently asserts one. Each group is laid out and levelled on
 * its own, and the renderer keeps them visibly apart.
 *
 * Groups come out in the order the learner first named someone in them, so the
 * family they started with stays at the top.
 */
export function componentsOf(persons, edges) {
  const names = Object.keys(persons);
  const adj = Object.fromEntries(names.map(n => [n, []]));
  edges.forEach(e => { if (adj[e.a] && adj[e.b]) { adj[e.a].push(e.b); adj[e.b].push(e.a); } });

  const seen = new Set(), out = [];
  for (const start of names) {
    if (seen.has(start)) continue;
    const comp = [], stack = [start];
    seen.add(start);
    while (stack.length) {
      const x = stack.pop();
      comp.push(x);
      for (const y of adj[x]) if (!seen.has(y)) { seen.add(y); stack.push(y); }
    }
    comp.sort((p, q) => names.indexOf(p) - names.indexOf(q));
    out.push(comp);
  }
  return out;
}

/**
 * Levels, measured within each group.
 *
 * Every group gets its own zero. Previously only the first person was seeded and
 * anyone the walk never reached was dropped on level 0 as a fallback — which put
 * an unrelated stranger on the same rung as the learner's own father.
 */
function assignGenerations(persons, edges) {
  const names = Object.keys(persons);
  if (!names.length) return;
  names.forEach(n => persons[n].gen = null);
  componentsOf(persons, edges).forEach(comp => { persons[comp[0]].gen = 0; });

  for (let pass = 0; pass < 60; pass++) {
    for (const e of edges) {
      const A = persons[e.a], B = persons[e.b];
      if (!A || !B) continue;
      if (e.type === 'parent') {
        if (A.gen !== null && B.gen === null) B.gen = A.gen - 1;
        else if (B.gen !== null && A.gen === null) A.gen = B.gen + 1;
      } else {
        if (A.gen !== null && B.gen === null) B.gen = A.gen;
        else if (B.gen !== null && A.gen === null) A.gen = B.gen;
      }
    }
  }
  names.forEach(n => { if (persons[n].gen === null) persons[n].gen = 0; });
}

/** Render the graph as SVG in the five-mark language. */
export function treeSVG(persons, edges, { empty = 'State a relation and the tree draws itself.' } = {}) {
  const names = Object.keys(persons);
  if (!names.length)
    return `<svg viewBox="0 0 640 240" class="ft-svg"><text x="320" y="120" text-anchor="middle"
             class="ft-empty">${empty}</text></svg>`;

  /* Lay out one GROUP at a time, stacked down the page. People the learner has
     not linked share no rung, so they must not share a row — that is the whole
     reason the tree is worth drawing. */
  const groups = componentsOf(persons, edges);

  const rowsOf = comp => {
    const gens = [...new Set(comp.map(n => persons[n].gen))].sort((x, y) => y - x);
    return gens.map(g => {
      const arr = comp.filter(n => persons[n].gen === g);
      const out = [], used = new Set();          // spouses sit next to each other
      arr.forEach(n => {
        if (used.has(n)) return;
        out.push(n); used.add(n);
        const sp = edges.find(e => e.type === 'spouse' && (e.a === n || e.b === n));
        const other = sp && (sp.a === n ? sp.b : sp.a);
        if (other && arr.includes(other) && !used.has(other)) { out.push(other); used.add(other); }
      });
      return { g, arr: out };
    });
  };

  const SP = 132, TOP = 54, LH = 108, GAP = 46;
  const laid = groups.map(rowsOf);
  const widest = Math.max(...laid.flat().map(r => r.arr.length), 1);
  const W = Math.max(600, widest * SP + 90);
  const H = TOP + laid.flat().length * LH + (laid.length - 1) * GAP + 34;

  const pos = {};
  let tags = '', bands = '';
  let y = TOP;
  laid.forEach((rows, ci) => {
    if (ci > 0) {
      /* Say it, rather than let the picture imply a link that was never stated. */
      bands += `<line class="ft-split" x1="26" y1="${y - GAP / 2}" x2="${W - 26}" y2="${y - GAP / 2}"/>
                <text class="ft-split-tag" x="${W / 2}" y="${y - GAP / 2 - 8}" text-anchor="middle"
                >not linked to the family above yet</text>`;
    }
    rows.forEach(({ g, arr }) => {
      const x0 = (W - (arr.length - 1) * SP) / 2;
      arr.forEach((n, i) => pos[n] = { x: x0 + i * SP, y });
      tags += `<text x="14" y="${y + 5}" class="ft-lvl">${g > 0 ? '+' + g : g}</text>`;
      y += LH;
    });
    y += GAP;
  });

  let lines = '';
  // marriage: the double line
  edges.filter(e => e.type === 'spouse').forEach(e => {
    const A = pos[e.a], B = pos[e.b]; if (!A || !B) return;
    const x1 = Math.min(A.x, B.x) + 20, x2 = Math.max(A.x, B.x) - 20, y = A.y;
    lines += `<line class="ft-marry" x1="${x1}" y1="${y - 4}" x2="${x2}" y2="${y - 4}"/>
              <line class="ft-marry" x1="${x1}" y1="${y + 4}" x2="${x2}" y2="${y + 4}"/>`;
  });

  const kidsOf = {};
  edges.filter(e => e.type === 'parent').forEach(e => {
    kidsOf[e.a] ||= [];
    if (!kidsOf[e.a].includes(e.b)) kidsOf[e.a].push(e.b);
  });

  const coupled = new Set(), barred = new Set(), spans = [];
  edges.filter(e => e.type === 'spouse').forEach(e => {
    const kids = [...new Set([...(kidsOf[e.a] || []), ...(kidsOf[e.b] || [])])].filter(k => pos[k]);
    if (!kids.length || !pos[e.a] || !pos[e.b]) return;
    const midX = (pos[e.a].x + pos[e.b].x) / 2, topY = pos[e.a].y + 22, barY = topY + 30;
    const xs = kids.map(k => pos[k].x);
    spans.push({ x1: Math.min(...xs) - 40, x2: Math.max(...xs) + 40, y: barY });
    lines += `<line class="ft-line" x1="${midX}" y1="${topY}" x2="${midX}" y2="${barY}"/>
              <line class="ft-line" x1="${Math.min(...xs)}" y1="${barY}" x2="${Math.max(...xs)}" y2="${barY}"/>`;
    kids.forEach(k => {
      lines += `<line class="ft-line" x1="${pos[k].x}" y1="${barY}" x2="${pos[k].x}" y2="${pos[k].y - 22}"/>`;
      barred.add(k);
    });
    coupled.add(e.a); coupled.add(e.b);
  });

  Object.entries(kidsOf).forEach(([par, kids]) => {
    if (coupled.has(par) || !pos[par]) return;
    kids.forEach(k => {
      if (barred.has(k) || !pos[k]) return;
      const x1 = pos[par].x, y1 = pos[par].y + 22, y2 = pos[k].y - 22, x2 = pos[k].x, midY = (y1 + y2) / 2;
      lines += `<path class="ft-line" d="M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}" fill="none"/>`;
    });
  });

  edges.filter(e => e.type === 'sib').forEach(e => {
    const A = pos[e.a], B = pos[e.b]; if (!A || !B) return;
    if (spans.some(s => s.y < A.y && A.x >= s.x1 && A.x <= s.x2 && B.x >= s.x1 && B.x <= s.x2)) return;
    lines += `<line class="ft-sib" x1="${A.x}" y1="${A.y - 30}" x2="${B.x}" y2="${B.y - 30}"/>
              <line class="ft-sib" x1="${A.x}" y1="${A.y - 30}" x2="${A.x}" y2="${A.y - 22}"/>
              <line class="ft-sib" x1="${B.x}" y1="${B.y - 30}" x2="${B.x}" y2="${B.y - 22}"/>`;
  });

  /* The key is canonical; the LABEL is whatever the learner typed first. */
  let nodes = '';
  names.forEach(n => {
    const P = pos[n], g = persons[n].gender, label = persons[n].name || n;
    if (!P) return;
    nodes += g === 'M'
      ? `<rect class="ft-male" x="${P.x - 19}" y="${P.y - 19}" width="38" height="38" rx="7"/>`
      : g === 'F'
      ? `<circle class="ft-female" cx="${P.x}" cy="${P.y}" r="20"/>`
      : `<rect class="ft-unknown" x="${P.x - 19}" y="${P.y - 19}" width="38" height="38" rx="19"/>`;
    nodes += `<text class="ft-init" x="${P.x}" y="${P.y + 5}" text-anchor="middle">${g === '?' ? '?' : label[0].toUpperCase()}</text>`;
    nodes += `<text class="ft-name" x="${P.x}" y="${P.y + 40}" text-anchor="middle">${label}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" class="ft-svg" style="min-width:${Math.min(W, 640)}px">${bands}${lines}${tags}${nodes}</svg>`;
}

/* ---------------- interactive widget ---------------- */

/* Scripted-action surface — see turnDialMachine in compass.js.
   This is the one widget whose input is genuinely open: the learner types any
   two names they like, so no list of actions can be the whole space. `act`
   therefore takes any sentence at all — the DOM layer hands it exactly what was
   typed — while `actions` offers a small cast, which is what the harness walks.
   The reduction is in the ENUMERATION, not in the widget: three names and the
   eight relations are enough to build a parent, a spouse, a sibling and a
   three-generation tree, which is everything the lesson's gates ask for. A
   smaller alphabet can only make a gate look unreachable, never the reverse. */
export const SWEEP_CAST = ['A', 'B', 'C'];

export function familyTreeMachine(opts = {}) {
  const cast = opts.cast || SWEEP_CAST;
  const pairs = cast.flatMap((a, i) => cast.slice(i + 1).map(b => [a, b]));
  return {
    init: { sentences: (opts.seed || []).slice(), refused: null },
    actions: st => [
      ...pairs.flatMap(([a, b]) => Object.keys(REL_LABEL).map(rel => `add:${a}:${rel}:${b}`)),
      ...st.sentences.map((_, i) => `del:${i}`),
      ...(opts.presets || []).map((_, i) => `preset:${i}`),
    ],
    /* A string action comes from the enumeration above; an object is a sentence
       the learner typed, whose names are free text and must not be squeezed
       through a colon-delimited key.

       A sentence that contradicts what is already stated is REFUSED rather than
       drawn. Letting it through meant the later statement silently overwrote the
       earlier one — a father redrawn as a wife, no complaint — which teaches the
       exact opposite of the lesson. The reason travels in the state so the DOM
       can explain it and the harness can assert it. */
    act(st, x) {
      if (typeof x === 'object') {
        const { a, b } = x;
        if (!a || !b || canonName(a) === canonName(b)) return st;
        const clash = contradictionIn([...st.sentences, x]);
        if (clash) return { ...st, refused: { tried: x, why: clash } };
        return { sentences: [...st.sentences, x], refused: null };
      }
      const [kind, ...rest] = x.split(':');
      if (kind === 'del') {
        return { sentences: st.sentences.filter((_, i) => i !== +rest[0]), refused: null };
      }
      if (kind === 'preset') {
        return { sentences: opts.presets[+rest[0]].sentences.slice(), refused: null };
      }
      const [a, rel, b] = rest;
      return this.act(st, { a, rel, b });
    },
    report(st) {
      const { persons, edges, groups } = buildGraph(st.sentences);
      return {
        sentences: st.sentences.slice(), persons, edges,
        count: st.sentences.length,
        generations: new Set(Object.values(persons).map(p => p.gen)).size,
        types: new Set(edges.map(e => e.type)),
        /* One group means one family. More than one means the learner has stated
           relations that do not yet touch — worth being able to ask about. */
        groups: groups.length,
        allLinked: groups.length <= 1,
        /* The last statement the tree refused, and why. `blocked` is the field a
           lesson task would read to ask the learner to go and find one. */
        blocked: !!st.refused,
        blockedKind: st.refused?.why.kind || null,
        blockedWhy: st.refused?.why.text || null,
        blockedTried: st.refused ? { ...st.refused.tried } : null,
        hasFemale: Object.values(persons).some(p => p.gender === 'F'),
        hasMale: Object.values(persons).some(p => p.gender === 'M'),
      };
    },
  };
}

export function familyTree(opts = {}) {
  const M = familyTreeMachine(opts);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="ft">
        <div class="ft-controls">
          <input class="ft-in" id="ftA" placeholder="Ravi" maxlength="10" aria-label="First person"
                 list="ftCast">
          <select class="ft-sel" id="ftR" aria-label="Relation">
            ${Object.entries(REL_LABEL).map(([k, v]) => `<option value="${k}">is the ${v}</option>`).join('')}
          </select>
          <input class="ft-in" id="ftB" placeholder="Sita" maxlength="10" aria-label="Second person"
                 list="ftCast">
          <button class="btn ft-add" id="ftAdd">Add</button>
        </div>
        <datalist id="ftCast"></datalist>
        <div class="ft-cast" id="ftCastRow" hidden></div>
        <div class="ft-clash" id="ftClash" role="alert" hidden></div>
        ${opts.presets ? `<div class="ft-presets">${opts.presets.map((p, i) =>
          `<button class="chip ft-preset" data-i="${i}">${p.label}</button>`).join('')}</div>` : ''}
        <div class="ft-stage" id="ftStage"></div>
        <div class="ft-said" id="ftSaid"></div>
        <div class="ft-legend">
          <span><i class="lg-m"></i>square = male</span>
          <span><i class="lg-f"></i>circle = female</span>
          <span><i class="lg-marry"></i>double line = marriage</span>
          <span><i class="lg-down"></i>vertical = parent → child</span>
          <span><i class="lg-sib"></i>gold = siblings</span>
        </div>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    let focused = 'ftA';                       // which box a tapped name should fill
    [$('ftA'), $('ftB')].forEach(i => i.onfocus = () => { focused = i.id; });

    const draw = () => {
      const r = M.report(st);
      $('ftStage').innerHTML = treeSVG(r.persons, r.edges);

      /* Everyone already in the tree, one tap away. Retyping a name from memory
         is what created a stranger instead of reusing a person, so the cure is
         to make reuse the shortest path — and the autocomplete backs it up for
         anyone who prefers the keyboard. */
      const cast = Object.values(r.persons).map(p => p.name);
      $('ftCast').innerHTML = cast.map(n => `<option value="${n}"></option>`).join('');
      const row = $('ftCastRow');
      row.hidden = !cast.length;
      row.innerHTML = cast.length
        ? `<span class="ft-cast__lab">Already here — tap to reuse</span>` +
          cast.map(n => `<button class="chip ft-cast__who" data-who="${n}">${n}</button>`).join('')
        : '';
      row.querySelectorAll('[data-who]').forEach(b => b.onclick = () => {
        const box = $(focused === 'ftB' ? 'ftB' : 'ftA');
        box.value = b.dataset.who;
        (focused === 'ftB' ? $('ftA') : $('ftB')).focus();
      });

      /* An impossible statement is refused, and the refusal explains itself —
         that contradiction is the lesson, so it must not pass silently. */
      const clash = $('ftClash');
      clash.hidden = !r.blocked;
      clash.innerHTML = r.blocked
        ? `<div class="ft-clash__mark" aria-hidden="true">!</div>
           <div class="ft-clash__body">
             <b>That cannot be true at the same time.</b>
             <p>${r.blockedWhy}</p>
           </div>
           <button class="ft-clash__x" id="ftClashX" aria-label="Dismiss">×</button>`
        : '';
      if (r.blocked) $('ftClashX').onclick = () => { clash.hidden = true; };

      $('ftSaid').innerHTML = st.sentences.map((s, i) =>
        `<span class="ft-chip">${s.a} is the <b>${REL_LABEL[s.rel]}</b> ${s.b}
           <button data-del="${i}" aria-label="remove">×</button></span>`).join('');
      $('ftSaid').querySelectorAll('[data-del]').forEach(b =>
        b.onclick = () => { st = M.act(st, `del:${b.dataset.del}`); draw(); });

      api.report?.(r);
    };

    const add = () => {
      const a = $('ftA').value.trim(), b = $('ftB').value.trim(), rel = $('ftR').value;
      if (!a || !b) { $('ftA').focus(); return; }
      const before = st.sentences.length;
      st = M.act(st, { a, rel, b });
      /* Only clear the boxes if the statement was accepted — a refused one stays
         put so the learner can see what they typed and change it. */
      if (st.sentences.length > before) {
        $('ftA').value = ''; $('ftB').value = ''; $('ftA').focus();
      }
      draw();
    };
    $('ftAdd').onclick = add;
    [$('ftA'), $('ftB')].forEach(i => i.onkeydown = e => { if (e.key === 'Enter') add(); });
    el.querySelectorAll('.ft-preset').forEach(b =>
      b.onclick = () => { st = M.act(st, `preset:${b.dataset.i}`); draw(); });

    draw();
    return { destroy() { el.innerHTML = ''; }, get sentences() { return st.sentences; } };
  };
}

/** Static tree, for reveal steps. */
export function staticTree(sentences) {
  return el => {
    const { persons, edges } = buildGraph(sentences);
    el.innerHTML = `<div class="ft-stage">${treeSVG(persons, edges)}</div>`;
    return { destroy() {} };
  };
}
