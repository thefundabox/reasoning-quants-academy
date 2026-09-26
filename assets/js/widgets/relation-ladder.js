/* ============================================================
   Relation ladder — makes "vertical vs lateral" physical.

   The learner clicks relation steps and watches a token climb,
   drop or slide. The whole point of the lesson is that only
   parent/child steps change your LEVEL; sibling and spouse steps
   never do. You cannot feel that from a definition; you can feel
   it from a token that refuses to move up.
   ============================================================ */

const STEPS = {
  father:   { d: +1, g: 'M', label: "father" },
  mother:   { d: +1, g: 'F', label: "mother" },
  brother:  { d:  0, g: 'M', label: "brother", lateral: true },
  sister:   { d:  0, g: 'F', label: "sister",  lateral: true },
  husband:  { d:  0, g: 'M', label: "husband", lateral: true, spouse: true },
  wife:     { d:  0, g: 'F', label: "wife",    lateral: true, spouse: true },
  son:      { d: -1, g: 'M', label: "son" },
  daughter: { d: -1, g: 'F', label: "daughter" },
};

/**
 * Name the person a chain lands on, the way an exam would.
 * Returns { term, ambiguous, note } — `ambiguous` matters because
 * "father's son" is you OR your brother unless the question says "only".
 *
 * WHY THIS BUILDS A FAMILY instead of adding up levels.
 *
 * The first version tracked two numbers: your LEVEL, and whether any sibling
 * step had been taken. That is the lesson's vocabulary and it is genuinely
 * how you solve these by hand — but as an algorithm it is not enough, and it
 * was wrong in four separate ways that all shipped:
 *
 *   your sister's mother   → said aunt;        she is your MOTHER
 *   your son's brother     → said nephew;      he is your SON
 *   your son's mother      → said mother;      she is you, or your wife
 *   your mother's father's son → said father;  he is your UNCLE
 *
 * Every one of them comes from the same thing: siblings share their parents,
 * so a sibling step is invisible when you look through a parent link — and a
 * step DOWN after a step up may or may not come back to your own line.
 * Counting levels cannot see either. Building the people the chain describes
 * can, so that is what this does, and the naming is read off the family.
 *
 * Ambiguity is recorded where it arises: each time the walk invents a person
 * who could just as well be somebody already in the chain — same parents,
 * compatible gender — the answer is flagged. "You" has no stated gender, which
 * is exactly why "your father's son" is you or your brother.
 */
export function termFor(path) {
  if (!path.length) return { term: 'you', ambiguous: false };

  /* ---- build the family the chain describes ---- */
  const P = { you: { sex: null, parents: null, spouse: null } };
  let n = 0;
  const add = (sex, parents = null) => { const id = `x${++n}`; P[id] = { sex, parents, spouse: null }; return id; };
  const fits = (a, b) => !a || !b || a === b;                 // unknown gender fits either
  const kids = pair => Object.keys(P).filter(k => P[k].parents && P[k].parents[0] === pair[0] && P[k].parents[1] === pair[1]);
  const parentsOf = id => {
    if (!P[id].parents) {
      const f = add('m'), m = add('f');
      P[f].spouse = m; P[m].spouse = f;
      P[id].parents = [f, m];
    }
    return P[id].parents;
  };
  const spouseOf = id => {
    if (!P[id].spouse) {
      const sp = add(P[id].sex === 'm' ? 'f' : P[id].sex === 'f' ? 'm' : null);
      P[id].spouse = sp; P[sp].spouse = id;
    }
    return P[id].spouse;
  };

  let cur = 'you', ambiguous = false, note = '';
  const vague = why => { if (!ambiguous) { ambiguous = true; note = why; } };

  for (const k of path) {
    const s = STEPS[k];
    /* STEPS writes gender as 'M'/'F'; the family model uses 'm'/'f'. Mixing the
       two made every gender test silently false — every answer came out female. */
    const g = s.g.toLowerCase();
    if (s.spouse) {
      const sp = spouseOf(cur);
      /* "your husband" states his gender, and by implication yours — which is
         what keeps the one-step answer from coming out as "wife". */
      if (P[sp].sex === null) P[sp].sex = g;
      if (P[cur].sex === null) P[cur].sex = g === 'm' ? 'f' : 'm';
      cur = sp;
      continue;
    }
    if (s.d === +1) {
      const pair = parentsOf(cur);
      /* Which of a pair is the father depends on a gender, and YOURS is never
         stated — so "your son's mother" is your wife, or you. */
      if (pair.some(x => P[x].sex === null)) {
        vague(`Which parent this lands on depends on your own gender, which the question does not
          state — it is <b>you, or your spouse</b>.`);
      }
      cur = pair[k === 'father' ? 0 : 1];
      continue;
    }
    const pair = s.d === 0 ? parentsOf(cur) : [null, null];
    if (s.d === 0) {
      /* A sibling of somebody who already has a known sibling of this gender
         might BE that person — including you. */
      if (kids(pair).some(x => x !== cur && fits(P[x].sex, g))) {
        vague(`Two people in this chain could be the same person — a sibling step lands on somebody
          already in the family. Only the word <b>"only"</b> in a question can settle it.`);
      }
      cur = add(g, pair);
    } else {
      const sp = spouseOf(cur);
      const father = P[cur].sex === 'f' ? sp : cur;
      const mother = P[cur].sex === 'f' ? cur : sp;
      const key = [father, mother];
      if (kids(key).some(x => fits(P[x].sex, g))) {
        vague(`The step down may come back to your own line — <b>you, or a sibling of yours</b>.
          Only the word <b>"only"</b> in a question can settle it.`);
      }
      cur = add(g, key);
    }
  }

  /* ---- read the answer off the family ---- */
  const sex = P[cur].sex;
  const M = (m, f) => (sex === 'm' ? m : f);
  const sameParents = (a, b) => P[a].parents && P[b].parents && P[a].parents[0] === P[b].parents[0] && P[a].parents[1] === P[b].parents[1];
  const childOf = (c, x) => !!P[c].parents && P[c].parents.includes(x);
  const ancestors = (id, depth) => {
    let level = [id];
    for (let i = 0; i < depth; i++) level = level.flatMap(x => P[x].parents || []);
    return level;
  };
  const descendants = (id, depth) => {
    let level = [id];
    for (let i = 0; i < depth; i++) level = level.flatMap(x => Object.keys(P).filter(c => childOf(c, x)));
    return level;
  };

  const term = (() => {
    if (cur === 'you') return 'you';
    if (P.you.spouse === cur) return M('husband', 'wife');
    if (ancestors('you', 1).includes(cur)) return M('father', 'mother');
    if (descendants('you', 1).includes(cur)) return M('son', 'daughter');
    if (sameParents(cur, 'you')) return M('brother', 'sister');
    if (ancestors('you', 2).includes(cur)) return M('grandfather', 'grandmother');
    if (descendants('you', 2).includes(cur)) return M('grandson', 'granddaughter');
    if (ancestors('you', 3).includes(cur)) return M('great-grandfather', 'great-grandmother');
    if (descendants('you', 3).includes(cur)) return M('great-grandson', 'great-granddaughter');
    /* Side branches. A spouse of an uncle or aunt is called the same thing. */
    const parentSibs = ancestors('you', 1).flatMap(p => Object.keys(P).filter(x => x !== p && sameParents(x, p)));
    if (parentSibs.includes(cur) || parentSibs.some(x => P[x].spouse === cur)) return M('uncle', 'aunt');
    const mySibs = Object.keys(P).filter(x => x !== 'you' && sameParents(x, 'you'));
    if (mySibs.some(sib => childOf(cur, sib)) || mySibs.some(sib => P[sib].spouse && childOf(cur, P[sib].spouse))) {
      return M('nephew', 'niece');
    }
    if (parentSibs.some(a => childOf(cur, a) || (P[a].spouse && childOf(cur, P[a].spouse)))) return 'cousin';
    const grandSibs = ancestors('you', 2).flatMap(p => Object.keys(P).filter(x => x !== p && sameParents(x, p)));
    if (grandSibs.includes(cur) || grandSibs.some(x => P[x].spouse === cur)) return M('great-uncle', 'great-aunt');
    /* In-laws: through your spouse, or married to a sibling. */
    if (P.you.spouse && ancestors(P.you.spouse, 1).includes(cur)) return M('father-in-law', 'mother-in-law');
    if (P.you.spouse && sameParents(cur, P.you.spouse)) return M('brother-in-law', 'sister-in-law');
    if (mySibs.some(sib => P[sib].spouse === cur)) return M('brother-in-law', 'sister-in-law');
    if (descendants('you', 1).some(kid => P[kid].spouse === cur)) return M('son-in-law', 'daughter-in-law');
    return null;                       // no single word for it — the caller redraws
  })();

  return { term, ambiguous: ambiguous && term !== null, note };
}

/* Scripted-action surface — see turnDialMachine in compass.js. Every step the
   keypad offers is an action, and so are Undo and Reset; the five-step ceiling
   is the machine's, not the click handler's, so the sweep cannot walk past it. */
export const LADDER_LIMIT = 5;

export function relationLadderMachine({ start = [], locked = false } = {}) {
  return {
    init: { path: start.slice() },
    actions: locked ? [] : [...Object.keys(STEPS), 'undo', 'reset'],
    act(st, a) {
      if (a === 'reset') return { path: [] };
      if (a === 'undo') return { path: st.path.slice(0, -1) };
      return st.path.length >= LADDER_LIMIT ? st : { path: [...st.path, a] };
    },
    report(st) {
      const t = termFor(st.path);
      const level = st.path.reduce((a, k) => a + STEPS[k].d, 0);
      const vertical = st.path.filter(k => STEPS[k].d !== 0).length;
      const lateral = st.path.filter(k => STEPS[k].d === 0).length;
      return { path: st.path.slice(), level, vertical, lateral, term: t.term,
               ambiguous: t.ambiguous, length: st.path.length,
               usedLateral: lateral > 0, usedVertical: vertical > 0,
               reachedCousin: t.term === 'cousin',
               reachedGrand: /grand/.test(t.term) };
    },
  };
}

export function relationLadder(cfg = {}) {
  const { locked = false } = cfg;
  const M = relationLadderMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="rl">
        <div class="rl-board">
          <svg id="rlSvg" viewBox="0 0 300 330" class="rl-svg" role="img" aria-label="Generation ladder"></svg>
        </div>
        <div class="rl-side">
          <p class="rl-chain-label">Your chain</p>
          <p class="rl-chain" id="rlChain"></p>
          <div class="rl-verdict" id="rlVerdict"></div>
          ${locked ? '' : `
          <p class="rl-chain-label" style="margin-top:14px">Add a step</p>
          <div class="rl-keys">
            ${Object.keys(STEPS).map(k =>
              `<button class="rl-key rl-key--${STEPS[k].d > 0 ? 'up' : STEPS[k].d < 0 ? 'down' : 'side'}"
                       data-k="${k}">${STEPS[k].label}</button>`).join('')}
          </div>
          <div class="rl-acts">
            <button class="btn btn--ghost rl-undo" id="rlUndo">Undo</button>
            <button class="btn btn--ghost rl-undo" id="rlReset">Reset</button>
          </div>`}
        </div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const path = st.path;
      const levels = [2, 1, 0, -1, -2];
      const y = lv => 40 + (2 - lv) * 62;
      let level = 0;
      const pts = [{ lv: 0, x: 150 }];
      let x = 150;
      path.forEach(k => {
        const s = STEPS[k];
        level += s.d;
        x += s.lateral ? 46 : 0;
        pts.push({ lv: Math.max(-2, Math.min(2, level)), x: Math.max(40, Math.min(260, x)), step: k });
      });

      let svg = levels.map(lv => `
        <line class="rl-rung" x1="26" y1="${y(lv)}" x2="274" y2="${y(lv)}"/>
        <text class="rl-lvl" x="16" y="${y(lv) + 4}">${lv > 0 ? '+' + lv : lv}</text>`).join('');

      // path trail
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        svg += `<line class="rl-trail ${STEPS[b.step].lateral ? 'is-side' : 'is-vert'}"
                  x1="${a.x}" y1="${y(a.lv)}" x2="${b.x}" y2="${y(b.lv)}"/>`;
      }
      // start marker
      svg += `<circle class="rl-start" cx="150" cy="${y(0)}" r="9"/>
              <text class="rl-tag" x="150" y="${y(0) + 26}" text-anchor="middle">you</text>`;
      // token
      const last = pts[pts.length - 1];
      if (pts.length > 1) {
        if (!reduced.length) {
    return { term: 'you', ambiguous: vagueSpouse || vagueSibling,
             note: 'The chain comes back to where it started.' };
  }

  const g = STEPS[path[path.length - 1]].g;
        svg += g === 'M'
          ? `<rect class="rl-token" x="${last.x - 13}" y="${y(last.lv) - 13}" width="26" height="26" rx="6"/>`
          : `<circle class="rl-token rl-token--f" cx="${last.x}" cy="${y(last.lv)}" r="14"/>`;
      }
      $('rlSvg').innerHTML = svg;

      // chain text
      $('rlChain').innerHTML = path.length
        ? 'your ' + path.map(k => `<b>${STEPS[k].label}</b>'s`).join(' ').replace(/'s$/, '')
        : '<span class="muted">You are standing on rung 0. Add a step.</span>';

      const t = termFor(path);
      const { vertical, lateral } = M.report(st);
      $('rlVerdict').innerHTML = path.length ? `
        <div class="rl-term ${t.ambiguous ? 'is-amb' : ''}">
          <span>this person is your</span><b>${t.term}</b>
          ${t.ambiguous ? '<em>ambiguous</em>' : ''}
        </div>
        <p class="rl-count"><b>${vertical}</b> vertical step${vertical === 1 ? '' : 's'}
           · <b>${lateral}</b> lateral · net level <b>${level > 0 ? '+' + level : level}</b></p>
        ${t.note ? `<p class="rl-note">${t.note}</p>` : ''}` : '';

      api.report?.(M.report(st));
    };

    if (!locked) {
      el.querySelectorAll('.rl-key').forEach(b => b.onclick = () => {
        st = M.act(st, b.dataset.k); draw();
      });
      $('rlUndo').onclick = () => { st = M.act(st, 'undo'); draw(); };
      $('rlReset').onclick = () => { st = M.act(st, 'reset'); draw(); };
    }
    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
