/* ============================================================
   Claim lab — the engine behind Unit 1.

   Verbal reasoning has no geometry to draw, so this unit needs its
   own thing to derive from: a finite space of POSSIBLE WORLDS.

   A model names a handful of atomic facts. The statement FIXES the
   ones it actually asserts; every other atom stays free. Enumerating
   all assignments of the free atoms gives every world the statement
   permits — and from that one construction:

     · a conclusion FOLLOWS    iff it is true in every permitted world
     · an assumption is NEEDED iff denying it leaves no permitted world
                               where the plan still reaches its goal
     · an argument is RELEVANT iff flipping it changes, somewhere,
                               whether the goal is reached

   Every verdict below is computed by scanning that space. Nothing here
   stores an answer, so a lesson can never disagree with its own widget
   — the same guarantee the syllogism lab has, bought a different way.

     claimScanner()   — toggle the open facts, watch conclusions die
     negationTest()   — deny a candidate assumption, see if the plan survives
     relevanceTest()  — flip an argument, see whether anything moves
   ============================================================ */

/* ---------------- the engine ---------------- */

/** Every world the statement permits: free atoms take both values, fixed ones do not. */
export function worldsOf(model) {
  const atoms = model.atoms || [];
  const free = atoms.filter(a => a.fixed === undefined);
  if (free.length > 16) throw new Error('claim-lab: too many free atoms to enumerate');
  const out = [];
  for (let m = 0; m < (1 << free.length); m++) {
    const w = {};
    atoms.forEach(a => { if (a.fixed !== undefined) w[a.key] = !!a.fixed; });
    free.forEach((a, i) => { w[a.key] = !!(m & (1 << i)); });
    if ((model.constraints || []).every(c => c(w))) out.push(w);
  }
  return out;
}

/** The world with one atom flipped — used to test whether an atom matters at all. */
const flip = (w, key) => ({ ...w, [key]: !w[key] });

/**
 * Does `claim` hold in EVERY permitted world?
 * Returns the first world where it fails, which is the whole proof when it does.
 */
export function testClaim(model, claim, worlds = worldsOf(model)) {
  const bad = worlds.find(w => !claim(w));
  return { follows: !bad, counterexample: bad || null, total: worlds.length };
}

/**
 * The negation test, mechanised. An assumption is NEEDED when denying it
 * leaves nowhere for the plan to succeed; if some world survives the denial,
 * the speaker never had to assume it.
 */
export function isNeeded(model, holds, reaches, worlds = worldsOf(model)) {
  const survivor = worlds.find(w => !holds(w) && reaches(w));
  return { needed: !survivor, survivor: survivor || null };
}

/**
 * Relevance, mechanised. An argument bears on the question only if its truth
 * can change the verdict — so look for one world whose goal-verdict moves when
 * the atom flips. If no such world exists the argument is decoration.
 */
export function isRelevant(model, key, reaches, worlds = worldsOf(model)) {
  const legal = new Set(worlds.map(w => JSON.stringify(w)));
  for (const w of worlds) {
    const other = flip(w, key);
    if (!legal.has(JSON.stringify(other))) continue;   // flipping left the space
    if (reaches(w) !== reaches(other)) return { relevant: true, witness: { on: w, off: other } };
  }
  return { relevant: false, witness: null };
}

/* ---------------- shared bits of chrome ---------------- */

const mark = ok => `<span class="pw-mark ${ok ? 'is-ok' : 'is-no'}"></span>`;

function worldChips(model, w) {
  return (model.atoms || []).map(a =>
    `<span class="pw-chip ${w[a.key] ? 'is-t' : 'is-f'} ${a.fixed !== undefined ? 'is-locked' : ''}">
       ${a.short || a.label} <b>${w[a.key] ? 'true' : 'false'}</b></span>`).join('');
}

/* ---------------- view 1: the conclusion scanner ---------------- */
/* The learner turns the open facts on and off by hand and watches conclusions
   die one at a time; the scan button then does exhaustively what they were
   doing by hand, so the method and the proof are visibly the same thing. */
export function claimScanner(cfg) {
  const { statement = '', atoms = [], claims = [] } = cfg;
  const model = { atoms, constraints: cfg.constraints };

  return (el, api = {}) => {
    const all = worldsOf(model);
    const free = atoms.filter(a => a.fixed === undefined);
    const fixed = atoms.filter(a => a.fixed !== undefined);
    /* Open on the world where every claim happens to hold — otherwise the learner
       arrives to find half of them already false and has nothing left to break. */
    let w = { ...(all.find(x => claims.every(c => c.needs(x))) || all[0]) };
    const broken = new Set();        // claims the learner has personally seen fail
    let scanned = false;
    let moves = 0;

    /* the truth, computed once, never consulted while the learner explores */
    const truth = claims.map(c => testClaim(model, c.needs, all));

    el.innerHTML = `
      <div class="pw">
        <div class="pw-stmt"><span>The statement</span><p>${statement}</p></div>
        ${fixed.length ? `<div class="pw-locked">
          <p class="pw-lab">Fixed by the statement — you may not touch these</p>
          <div class="pw-toggles">${fixed.map(a =>
            `<div class="pw-tog is-locked"><span class="pw-tog-sw is-${a.fixed ? 'on' : 'off'}"></span>
               <span>${a.label}</span><em>${a.fixed ? 'true' : 'false'}</em></div>`).join('')}</div>
        </div>` : ''}
        <div class="pw-open">
          <p class="pw-lab">Left open — the statement never settles these, so you may set them freely</p>
          <div class="pw-toggles" id="clTogs">${free.map(a =>
            `<button class="pw-tog" data-k="${a.key}"><span class="pw-tog-sw"></span>
               <span>${a.label}</span><em></em></button>`).join('')}</div>
        </div>
        <div class="pw-claims" id="clClaims"></div>
        <div class="pw-acts">
          <button class="btn btn--ghost pw-scan" id="clScan">Scan all ${all.length} worlds at once</button>
        </div>
        <div class="pw-scanout" id="clScanOut"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      free.forEach(a => {
        const b = el.querySelector(`.pw-tog[data-k="${a.key}"]`);
        b.classList.toggle('is-on', w[a.key]);
        b.querySelector('.pw-tog-sw').className = `pw-tog-sw is-${w[a.key] ? 'on' : 'off'}`;
        b.querySelector('em').textContent = w[a.key] ? 'true' : 'false';
      });

      claims.forEach((c, i) => { if (!c.needs(w)) broken.add(i); });

      $('clClaims').innerHTML = `
        <p class="pw-lab">Proposed conclusions — true in <em>this</em> world?</p>
        ${claims.map((c, i) => {
          const ok = c.needs(w);
          return `<div class="pw-claim ${ok ? 'is-ok' : 'is-no'} ${broken.has(i) ? 'is-broken' : ''}">
                    ${mark(ok)}<span>${c.text}</span>
                    ${broken.has(i) ? `<b class="pw-dead">you broke it</b>` : ''}
                  </div>`;
        }).join('')}`;

      api.report?.({
        world: { ...w }, moves, scanned,
        broken: broken.size,
        brokenKeys: [...broken],
        breakable: truth.filter(t => !t.follows).length,
        brokeEveryBreakable: truth.every((t, i) => t.follows || broken.has(i)),
        survivors: truth.filter(t => t.follows).length,
      });
    };

    el.querySelectorAll('.pw-tog[data-k]').forEach(b => b.onclick = () => {
      w[b.dataset.k] = !w[b.dataset.k];
      moves++;
      draw();
    });

    $('clScan').onclick = () => {
      scanned = true;
      $('clScan').disabled = true;
      $('clScanOut').innerHTML = `
        <p class="pw-lab">Every world the statement permits, checked</p>
        ${claims.map((c, i) => {
          const t = truth[i];
          return `<div class="pw-verdict ${t.follows ? 'is-hold' : 'is-break'}">
            <b>${t.follows ? 'Follows' : 'Does not follow'}</b>
            <span>${c.text}</span>
            ${t.follows
              ? `<p>True in all ${t.total} worlds. Nothing you could have set would break it.</p>`
              : `<p>Counterexample — a world the statement fully permits, in which this is false:</p>
                 <div class="pw-world">${worldChips(model, t.counterexample)}</div>`}
          </div>`;
        }).join('')}`;
      draw();
    };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- view 2: the negation test ---------------- */
/* Deny the candidate. If the plan can still reach its goal somewhere, the
   speaker never needed it — and the surviving world is printed as the proof. */
export function negationTest(cfg) {
  const { plan = '', goalLabel = '', atoms = [], reaches, candidates = [] } = cfg;
  const model = { atoms, constraints: cfg.constraints };

  return (el, api = {}) => {
    const all = worldsOf(model);
    const truth = candidates.map(c => isNeeded(model, c.holds, reaches, all));
    const denied = new Set();

    el.innerHTML = `
      <div class="pw">
        <div class="pw-stmt"><span>The plan</span><p>${plan}</p></div>
        <div class="pw-goal"><span>Only works if</span><p>${goalLabel}</p></div>
        <p class="pw-lab">Deny each candidate in turn. If the plan survives the denial, it was never assumed.</p>
        <div class="pw-cands" id="clCands"></div>
      </div>`;

    const draw = () => {
      el.querySelector('#clCands').innerHTML = candidates.map((c, i) => {
        const off = denied.has(i);
        const t = truth[i];
        return `<div class="pw-cand ${off ? (t.needed ? 'is-needed' : 'is-free') : ''}">
          <div class="pw-cand-row">
            <button class="pw-deny ${off ? 'is-on' : ''}" data-i="${i}">${off ? 'Denied' : 'Deny it'}</button>
            <span class="pw-cand-txt">${c.text}</span>
          </div>
          ${off ? (t.needed
            ? `<div class="pw-out is-needed"><b>The plan collapses.</b>
                 There is no world left in which it reaches its goal — so the speaker had to be
                 taking this for granted. <em>It is an assumption.</em></div>`
            : `<div class="pw-out is-free"><b>The plan survives.</b>
                 Here is a world where this is false and the plan still works, so it was never assumed:
                 <div class="pw-world">${worldChips(model, t.survivor)}</div></div>`) : ''}
        </div>`;
      }).join('');

      el.querySelectorAll('.pw-deny').forEach(b => b.onclick = () => {
        const i = +b.dataset.i;
        denied.has(i) ? denied.delete(i) : denied.add(i);
        draw();
      });

      api.report?.({
        denied: denied.size, total: candidates.length,
        testedAll: denied.size === candidates.length,
        sawNeeded: [...denied].some(i => truth[i].needed),
        sawFree: [...denied].some(i => !truth[i].needed),
        neededCount: truth.filter(t => t.needed).length,
      });
    };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- view 3: the relevance test ---------------- */
/* Flip the argument and look at the goal. If the verdict never moves, the
   argument cannot be strong however well it is phrased — which is the whole
   point of the lesson, and here it is a search result rather than an opinion. */
export function relevanceTest(cfg) {
  const { proposal = '', goalLabel = '', atoms = [], reaches, args = [] } = cfg;
  const model = { atoms, constraints: cfg.constraints };

  return (el, api = {}) => {
    const all = worldsOf(model);
    const truth = args.map(a => isRelevant(model, a.key, reaches, all));
    const tested = new Set();

    el.innerHTML = `
      <div class="pw">
        <div class="pw-stmt"><span>The proposal</span><p>${proposal}</p></div>
        <div class="pw-goal"><span>The question it turns on</span><p>${goalLabel}</p></div>
        <p class="pw-lab">Flip each argument true ↔ false. Watch whether the verdict above moves at all.</p>
        <div class="pw-args" id="clArgs"></div>
      </div>`;

    const draw = () => {
      el.querySelector('#clArgs').innerHTML = args.map((a, i) => {
        const done = tested.has(i);
        const t = truth[i];
        return `<div class="pw-arg ${done ? (t.relevant ? 'is-strong' : 'is-weak') : ''}">
          <div class="pw-arg-row">
            <button class="pw-flip ${done ? 'is-on' : ''}" data-i="${i}">${done ? 'Flipped' : 'Flip it'}</button>
            <span class="pw-arg-side pw-arg-side--${a.side}">${a.side === 'for' ? 'For' : 'Against'}</span>
            <span class="pw-arg-txt">${a.text}</span>
          </div>
          ${done ? (t.relevant
            ? `<div class="pw-out is-needed"><b>The verdict moves.</b>
                 With this true the proposal reaches its goal; with it false it does not.
                 It bears on the question — <em>strong</em>.
                 <div class="pw-world">${worldChips(model, t.witness.on)}</div></div>`
            : `<div class="pw-out is-free"><b>Nothing moves.</b>
                 Across all ${all.length} worlds, flipping this never changes whether the proposal
                 reaches its goal. It cannot decide anything — <em>weak</em>, however it is worded.</div>`) : ''}
        </div>`;
      }).join('');

      el.querySelectorAll('.pw-flip').forEach(b => b.onclick = () => {
        tested.add(+b.dataset.i);
        draw();
      });

      api.report?.({
        tested: tested.size, total: args.length,
        testedAll: tested.size === args.length,
        sawStrong: [...tested].some(i => truth[i].relevant),
        sawWeak: [...tested].some(i => !truth[i].relevant),
        strongCount: truth.filter(t => t.relevant).length,
      });
    };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
