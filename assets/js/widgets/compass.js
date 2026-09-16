/* ============================================================
   Compass primitives + two widgets:
     turnDial()    — turns happen in the WALKER's frame, not yours
     shadowScene() — sun position fixes shadow direction

   Shared by every lesson in Space & Direction.
   ============================================================ */

export const FULL  = { N: 'North', E: 'East', S: 'South', W: 'West' };
export const LEFT  = { N: 'W', W: 'S', S: 'E', E: 'N' };   // anticlockwise
export const RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' };   // clockwise
export const BACK  = { N: 'S', S: 'N', E: 'W', W: 'E' };
export const ANGLE = { N: -90, E: 0, S: 90, W: 180 };       // screen degrees

/** Where does `world` sit relative to someone facing `face`? */
export function relativeTo(world, face) {
  if (world === face)        return 'front';
  if (LEFT[face] === world)  return 'left';
  if (RIGHT[face] === world) return 'right';
  return 'behind';
}

/* ---------------- turn dial ---------------- */

/* SCRIPTED-ACTION SURFACE.
   The turn logic lives here as a pure machine — an immutable state, a list of
   actions, and the report the lesson's tasks read. The DOM layer below drives
   it and does nothing else with state, so the harness can enumerate every
   reachable state by replaying action sequences against the SAME code the
   learner clicks. Keep it that way: put logic here, not in the click handler.  */
export function turnDialMachine({ start = 'N' } = {}) {
  const fresh = () => ({ face: start, log: [], seen: [start] });
  return {
    init: fresh(),
    actions: ['L', 'R', 'U', 'X'],
    act(st, a) {
      if (a === 'X') return fresh();
      const face = a === 'L' ? LEFT[st.face] : a === 'R' ? RIGHT[st.face] : BACK[st.face];
      return {
        face,
        log: [...st.log, a === 'L' ? 'left' : a === 'R' ? 'right' : 'U-turn'].slice(-8),
        seen: st.seen.includes(face) ? st.seen : [...st.seen, face],
      };
    },
    report: st => ({
      face: st.face, turns: st.log.length, log: st.log.slice(),
      facedAll: st.seen.length >= 4, seen: st.seen.slice(),
      madeLeft: st.log.includes('left'), madeRight: st.log.includes('right'),
      madeU: st.log.includes('U-turn'),
    }),
  };
}

export function turnDial(cfg = {}) {
  const M = turnDialMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="td">
        <div class="td-board"><svg id="tdSvg" viewBox="0 0 240 240" class="td-svg" role="img"
             aria-label="A walker on a compass"></svg></div>
        <div class="td-side">
          <div class="td-facing" id="tdFacing"></div>
          <div class="td-arms" id="tdArms"></div>
          <p class="td-label">Turn the walker</p>
          <div class="td-keys">
            <button class="td-key" data-t="L">↰ Turn left</button>
            <button class="td-key" data-t="R">↱ Turn right</button>
            <button class="td-key" data-t="U">↻ U-turn</button>
            <button class="td-key td-key--quiet" data-t="X">Reset</button>
          </div>
          <p class="td-log" id="tdLog"></p>
        </div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const face = st.face, log = st.log;
      const a = ANGLE[face] * Math.PI / 180;
      const L = (ANGLE[face] - 90) * Math.PI / 180;
      const R = (ANGLE[face] + 90) * Math.PI / 180;
      const cx = 120, cy = 120, r = 82;
      const P = (ang, d) => [cx + Math.cos(ang) * d, cy + Math.sin(ang) * d];
      const [fx, fy] = P(a, r), [lx, ly] = P(L, 46), [rx, ry] = P(R, 46);

      $('tdSvg').innerHTML = `
        <circle class="td-ring" cx="${cx}" cy="${cy}" r="${r + 22}"/>
        ${Object.entries(ANGLE).map(([d, deg]) => {
          const [tx, ty] = P(deg * Math.PI / 180, r + 22);
          return `<text class="td-card ${d === face ? 'is-facing' : ''}" x="${tx}" y="${ty + 5}"
                    text-anchor="middle">${d}</text>`;
        }).join('')}
        <line class="td-arm td-arm--l" x1="${cx}" y1="${cy}" x2="${lx}" y2="${ly}"/>
        <text class="td-armlab" x="${lx}" y="${ly - 8}" text-anchor="middle">left</text>
        <line class="td-arm td-arm--r" x1="${cx}" y1="${cy}" x2="${rx}" y2="${ry}"/>
        <text class="td-armlab" x="${rx}" y="${ry - 8}" text-anchor="middle">right</text>
        <line class="td-facing-line" x1="${cx}" y1="${cy}" x2="${fx}" y2="${fy}"/>
        <circle class="td-head" cx="${fx}" cy="${fy}" r="11"/>
        <circle class="td-body" cx="${cx}" cy="${cy}" r="15"/>`;

      $('tdFacing').innerHTML = `<span>facing</span><b>${FULL[face]}</b>`;
      $('tdArms').innerHTML =
        `<span class="td-arm-chip td-arm-chip--l">their left is <b>${FULL[LEFT[face]]}</b></span>
         <span class="td-arm-chip td-arm-chip--r">their right is <b>${FULL[RIGHT[face]]}</b></span>`;
      $('tdLog').textContent = log.length ? 'Turns: ' + log.join(' → ') : '';

      api.report?.(M.report(st));
    };

    el.querySelectorAll('.td-key').forEach(b => b.onclick = () => {
      st = M.act(st, b.dataset.t);
      draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- sun & shadow ---------------- */

/** Sun angle at hour t, and the way the shadow therefore falls. */
export const sunAngle = t => (t - 6) / 12 * Math.PI;
export const shadowAt = t => (Math.cos(sunAngle(t)) >= 0 ? 'W' : 'E');   // sun east ⇒ shadow west

/* Scripted-action surface — see turnDialMachine. `seenEnds` accumulates as the
   learner drags the slider, so the machine accumulates it too rather than
   assuming a fresh visit. */
export function shadowMachine({ hour = 8, face = 'N', interactive = true } = {}) {
  const HOURS = [...Array(13).keys()].map(i => i + 6);          // the slider's real range
  return {
    init: { hour, face, seenEnds: [] },
    actions: interactive
      ? [...HOURS.map(h => `t${h}`), ...['N', 'E', 'S', 'W'].map(d => `f${d}`)]
      : [],
    act(st, a) {
      if (a[0] === 'f') return { ...st, face: a.slice(1) };
      const t = +a.slice(1);
      const end = t <= 7 ? 'rise' : t >= 17 ? 'set' : null;
      return { ...st, hour: t,
               seenEnds: end && !st.seenEnds.includes(end) ? [...st.seenEnds, end] : st.seenEnds };
    },
    report(st) {
      const shadowDir = shadowAt(st.hour);
      return { hour: st.hour, face: st.face, shadowDir,
               rel: st.face ? relativeTo(shadowDir, st.face) : null,
               sawSunrise: st.hour <= 7, sawSunset: st.hour >= 17, sawNoon: st.hour === 12,
               triedBoth: st.seenEnds.length >= 2 };
    },
  };
}

export function shadowScene(cfg = {}) {
  const { hour = 8, interactive = true } = cfg;
  const M = shadowMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="sh">
        <svg id="shSvg" viewBox="0 0 460 300" class="sh-svg" role="img" aria-label="Sun and shadow"></svg>
        ${interactive ? `
        <div class="sh-time">
          <span>🌅 6 AM</span><span>☀️ noon</span><span>🌇 6 PM</span>
        </div>
        <input class="sh-range" id="shTime" type="range" min="6" max="18" step="1" value="${hour}"
               aria-label="Time of day">
        <p class="td-label">Which way is the walker facing?</p>
        <div class="sh-faces" id="shFaces"></div>` : ''}
        <div class="sh-read" id="shRead"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const t = st.hour, f = st.face;
      const th = sunAngle(t);
      const sx = 230 + 190 * Math.cos(th), sy = 230 - 140 * Math.sin(th);
      const px = 230, gy = 246;
      const len = Math.round(18 + 100 * (1 - Math.sin(th)));
      const shadowDir = shadowAt(t);
      const west = shadowDir === 'W';
      const ex = px + (west ? -1 : 1) * len;

      let s = `<rect class="sh-sky" width="460" height="300"/>`;
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        s += `<line class="sh-ray" x1="${sx + Math.cos(a) * 24}" y1="${sy + Math.sin(a) * 24}"
                x2="${sx + Math.cos(a) * 32}" y2="${sy + Math.sin(a) * 32}"/>`;
      }
      s += `<circle class="sh-sun" cx="${sx}" cy="${sy}" r="19"/>
            <rect class="sh-ground" y="246" width="460" height="54"/>
            <line class="sh-horizon" x1="0" y1="246" x2="460" y2="246"/>
            <text class="sh-dir" x="446" y="270" text-anchor="end">E →</text>
            <text class="sh-dir" x="14" y="270">← W</text>
            <polygon class="sh-shadow" points="${px - 7},${gy} ${px + 7},${gy} ${ex + 9},${gy + 16} ${ex - 9},${gy + 16}"/>
            <circle class="sh-person" cx="${px}" cy="${gy - 46}" r="11"/>
            <line class="sh-person-l" x1="${px}" y1="${gy - 35}" x2="${px}" y2="${gy - 8}"/>`;

      if (f) {
        const F = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }[f];
        s += `<line class="sh-face" x1="${px + F[0] * 13}" y1="${gy - 46 + F[1] * 13}"
                x2="${px + F[0] * 32}" y2="${gy - 46 + F[1] * 32}"/>
              <circle class="sh-face-dot" cx="${px + F[0] * 32}" cy="${gy - 46 + F[1] * 32}" r="4.5"/>`;
      }
      const label = t === 6 ? '🌅 Sunrise' : t === 18 ? '🌇 Sunset' : t === 12 ? '☀️ Noon'
                  : t < 12 ? `${t} AM` : `${t - 12} PM`;
      s += `<text class="sh-clock" x="230" y="26" text-anchor="middle">${label}</text>`;
      $('shSvg').innerHTML = s;

      const rel = f ? relativeTo(shadowDir, f) : null;
      $('shRead').innerHTML = Math.sin(th) > 0.97
        ? `<b>Noon.</b> The sun is overhead and the shadow collapses — no direction can be read from it.`
        : `The shadow points <b>${FULL[shadowDir]}</b>.` +
          (f ? ` The walker faces <b>${FULL[f]}</b>, so the shadow falls
                <b>${rel === 'front' ? 'in front of' : rel === 'behind' ? 'behind' : 'to the ' + rel + ' of'}</b> them.` : '');

      api.report?.(M.report(st));
    };

    const renderFaces = () => {
      $('shFaces').innerHTML = ['N', 'E', 'S', 'W'].map(d =>
        `<button class="sh-face-btn ${d === st.face ? 'is-on' : ''}" data-d="${d}">${FULL[d]}</button>`).join('');
      el.querySelectorAll('.sh-face-btn').forEach(b => b.onclick = () => {
        st = M.act(st, 'f' + b.dataset.d); renderFaces(); draw();
      });
    };

    if (interactive) {
      $('shTime').oninput = e => { st = M.act(st, 't' + e.target.value); draw(); };
      renderFaces();
    }
    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
