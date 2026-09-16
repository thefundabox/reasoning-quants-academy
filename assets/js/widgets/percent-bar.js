/* ============================================================
   Percent bar — the manipulable behind "The Percent Ladder".

   Two modes:
     ladder   — drag the bar; benchmark rungs (50/25/10/5/1%) light
                up as you pass them, and the value is shown live.
                Teaches that any percent is built from a few anchors.
     estimate — the bar is blank, the target hidden. Shade by eye,
                then lock in. Trains the estimation habit first.
   ============================================================ */

const fmt = n => {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? r.toLocaleString('en-IN') : r.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

const RUNGS = [
  { p: 50, label: '50%', how: 'half' },
  { p: 25, label: '25%', how: 'half of half' },
  { p: 10, label: '10%', how: 'move the decimal one place' },
  { p: 5,  label: '5%',  how: 'half of 10%' },
  { p: 1,  label: '1%',  how: 'move the decimal two places' },
];

/* ---------- ladder mode ---------- */

/* Scripted-action surface — see turnDialMachine in compass.js. The slider is
   the whole control surface and it steps by 1, so the enumeration is every
   percent it can hold; the rungs passed accumulate, and so does the machine's. */
export function percentLadderMachine({ total = 480, start = 0 } = {}) {
  const passed = (reached, pct) =>
    [...new Set([...reached, ...RUNGS.filter(r => pct >= r.p).map(r => r.p)])];
  return {
    init: { pct: start, reached: passed([], start) },
    actions: [...Array(101).keys()].map(p => `p${p}`),
    act(st, a) {
      const pct = +a.slice(1);
      return { pct, reached: passed(st.reached, pct) };
    },
    report: st => ({ pct: st.pct, value: total * st.pct / 100, total,
                     reached: st.reached.slice(),
                     reachedAll: RUNGS.every(r => st.reached.includes(r.p)) }),
  };
}

export function percentLadder(cfg = {}) {
  const { total = 480, start = 0 } = cfg;
  const M = percentLadderMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="pb">
        <div class="pb-readout">
          <div><span class="pb-lab">of</span><b class="num" id="pbTotal">${fmt(total)}</b></div>
          <div class="pb-eq">×</div>
          <div><span class="pb-lab">percent</span><b class="num pb-pct" id="pbPct">0%</b></div>
          <div class="pb-eq">=</div>
          <div><span class="pb-lab">value</span><b class="num pb-val" id="pbVal">0</b></div>
        </div>

        <div class="pb-track" id="pbTrack">
          <div class="pb-fill" id="pbFill"></div>
          ${RUNGS.map(r => `<span class="pb-rung" data-p="${r.p}" style="left:${r.p}%"><i></i><em>${r.label}</em></span>`).join('')}
        </div>
        <input class="pb-range" id="pbRange" type="range" min="0" max="100" step="1" value="${start}"
               aria-label="Percentage to shade">

        <div class="pb-rungs" id="pbRungs">
          ${RUNGS.map(r => `<button class="pb-anchor" data-p="${r.p}">
             <b>${r.label}</b><span>${fmt(total * r.p / 100)}</span><em>${r.how}</em></button>`).join('')}
        </div>
        <p class="pb-hint" id="pbHint">Drag the bar. Watch which anchors you pass — those five are all you ever need.</p>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    const range = $('pbRange');

    const paint = () => {
      const pct = st.pct;
      $('pbFill').style.width = pct + '%';
      $('pbPct').textContent = pct + '%';
      $('pbVal').textContent = fmt(total * pct / 100);
      el.querySelectorAll('.pb-rung').forEach(r =>
        r.classList.toggle('is-passed', pct >= +r.dataset.p));
      el.querySelectorAll('.pb-anchor').forEach(a =>
        a.classList.toggle('is-here', +a.dataset.p === pct));

      const exact = RUNGS.find(r => r.p === pct);
      if (exact) $('pbHint').innerHTML = `<b>${exact.label} of ${fmt(total)} = ${fmt(total * exact.p / 100)}</b> — ${exact.how}.`;

      api.report?.(M.report(st));
    };

    range.oninput = () => { st = M.act(st, 'p' + range.value); paint(); };
    el.querySelectorAll('.pb-anchor').forEach(a => a.onclick = () => {
      st = M.act(st, 'p' + a.dataset.p); range.value = st.pct; paint();
    });

    paint();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------- estimate mode ---------- */

export const ESTIMATE_POOL = [
  { total: 240, p: 15, story: 'of the 240 seats in a hall' },
  { total: 800, p: 35, story: 'of an 800-page answer booklet stack' },
  { total: 460, p: 60, story: 'of 460 candidates in a Jaipur centre' },
  { total: 350, p: 20, story: 'of a ₹350 exam fee' },
  { total: 900, p: 45, story: 'of 900 km of state highway' },
];

/* Scripted-action surface — see turnDialMachine in compass.js.
   WHICH question comes up is drawn at random, so the draw stays in the DOM
   layer and the machine takes the chosen index as part of the action: `go:2`
   is "advance, and make question 2 the next one". That keeps the scoring pure
   and lets the sweep walk every question rather than whichever one came up.
   The slider takes any percent; the enumeration offers the ones that decide a
   round — the target itself, a miss outside the tolerance, and zero. */
export function percentEstimateMachine({ rounds = 3, tolerance = 4, pool = ESTIMATE_POOL } = {}) {
  const guesses = qi => [...new Set([0, pool[qi].p, Math.min(100, pool[qi].p + tolerance + 1)])];
  return {
    init: { round: 0, qi: 0, v: 0, locked: false, hits: 0, over: false, out: null },
    actions(st) {
      if (st.over) return [];
      if (st.locked) return st.round + 1 >= rounds ? ['go'] : pool.map((_, i) => `go:${i}`);
      return [...guesses(st.qi).map(v => `v:${v}`), 'lock',
              ...(st.round === 0 ? pool.map((_, i) => `start:${i}`) : [])];
    },
    act(st, a) {
      if (a[0] === 's') return { ...st, qi: +a.slice(6), v: 0, locked: false };
      if (a[0] === 'v') return { ...st, v: +a.slice(2) };
      if (a === 'lock') {
        const hits = st.hits + (Math.abs(st.v - pool[st.qi].p) <= tolerance ? 1 : 0);
        return { ...st, locked: true, hits,
                 out: { round: st.round + 1, hits, rounds, finished: st.round + 1 >= rounds } };
      }
      const round = st.round + 1;                       // "go" — the second press
      return round >= rounds
        ? { ...st, round, over: true }
        : { ...st, round, qi: +a.slice(3), v: 0, locked: false };
    },
    report: st => st.out,          // null until the first estimate is locked in
  };
}

export function percentEstimate(cfg = {}) {
  const { rounds = 3, tolerance = 4, pool = ESTIMATE_POOL } = cfg;
  const M = percentEstimateMachine(cfg);
  return (el, api = {}) => {
    const pick = () => Math.floor(Math.random() * pool.length);
    let st = M.init;

    el.innerHTML = `<div class="pb pb--est">
      <p class="pb-q" id="peQ"></p>
      <div class="pb-track pb-track--est"><div class="pb-fill" id="peFill"></div><div class="pb-target" id="peTgt"></div></div>
      <div class="pb-ticks"><span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
      <input class="pb-range" id="peRange" type="range" min="0" max="100" value="0" aria-label="Your estimate">
      <div class="pb-estrow">
        <button class="btn" id="peLock">Lock it in</button>
        <span class="pb-score" id="peScore"></span>
      </div>
      <div class="pb-verdict" id="peV"></div>
    </div>`;

    const $ = id => el.querySelector('#' + id);
    const showRound = () => {
      const q = pool[st.qi];
      $('peQ').innerHTML = `Shade <b>${q.p}%</b> ${q.story} — <em>by eye only.</em>`;
      $('peRange').value = 0; $('peFill').style.width = '0%';
      $('peTgt').style.display = 'none';
      $('peV').innerHTML = '';
      $('peLock').textContent = 'Lock it in';
      $('peLock').disabled = false;
    };

    $('peRange').oninput = e => {
      if (st.locked) return;
      st = M.act(st, `v:${e.target.value}`);
      $('peFill').style.width = st.v + '%';
    };

    $('peLock').onclick = () => {
      if (st.locked) {
        st = M.act(st, st.round + 1 >= rounds ? 'go' : `go:${pick()}`);
        if (!st.over) return showRound();
        $('peQ').innerHTML = `<b>Done — ${st.hits} of ${rounds} within ${tolerance}%.</b>`;
        $('peLock').disabled = true;
        $('peV').innerHTML = `<div class="pb-done">Your eye is now calibrated. Use it before every calculation.</div>`;
        return;
      }
      const q = pool[st.qi], off = Math.abs(st.v - q.p), win = off <= tolerance;
      st = M.act(st, 'lock');
      $('peTgt').style.left = q.p + '%';
      $('peTgt').style.display = 'block';
      $('peScore').textContent = `${st.hits} / ${st.round + 1}`;
      $('peV').innerHTML = `<div class="pb-vd ${win ? 'is-ok' : 'is-no'}">
        ${win ? '🎯 Within ' + tolerance + '%.' : `Off by ${off}%.`}
        Target <b>${q.p}%</b> of ${fmt(q.total)} = <b>${fmt(q.total * q.p / 100)}</b>.
        ${win ? '' : 'Anchor on 50%, then step down.'}</div>`;
      $('peLock').textContent = st.round + 1 >= rounds ? 'See result' : 'Next target';
      api.report?.(M.report(st));
    };

    st = M.act(st, `start:${pick()}`);
    showRound();
    return { destroy() { el.innerHTML = ''; } };
  };
}
