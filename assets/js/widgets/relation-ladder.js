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
 */
export function termFor(path) {
  if (!path.length) return { term: 'you', ambiguous: false };

  let level = 0, collateral = false, spouse = false, peak = 0;
  path.forEach(k => {
    const s = STEPS[k];
    level += s.d;
    peak = Math.max(peak, level);
    if (s.lateral && !s.spouse) collateral = true;
    if (s.spouse) spouse = true;
  });
  // Did the walk climb above where it finished? Sibling steps in between must not
  // hide that — "mother's brother's daughter" climbs to +1 and comes back to 0.
  const upThenDown = peak > level;

  const g = STEPS[path[path.length - 1]].g;
  const M = (m, f) => (g === 'M' ? m : f);

  if (level >= 2)  return { term: collateral ? M('great-uncle', 'great-aunt') : M('grandfather', 'grandmother'), ambiguous: false };
  if (level === 1) return { term: collateral ? M('uncle', 'aunt') : M('father', 'mother'), ambiguous: false };
  if (level === -1) return { term: collateral ? M('nephew', 'niece') : M('son', 'daughter'), ambiguous: false };
  if (level <= -2) return { term: M('grandson', 'granddaughter'), ambiguous: false };

  // level 0
  if (spouse && path.length === 1) return { term: M('husband', 'wife'), ambiguous: false };
  if (collateral && upThenDown)    return { term: 'cousin', ambiguous: false };
  if (upThenDown) return {
    term: M('brother', 'sister'), ambiguous: true,
    note: `You went up to a parent and straight back down — so this is <b>you or your ${M('brother','sister')}</b>. Only the word <b>"only"</b> in a question can settle it.`,
  };
  if (collateral) return { term: M('brother', 'sister'), ambiguous: false };
  return { term: 'you', ambiguous: false };
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
