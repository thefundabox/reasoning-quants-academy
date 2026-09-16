/* ============================================================
   Cipher wheel — a uniform shift, made mechanical.

   Outer ring is the plain alphabet, inner ring the coded one.
   Rotate the inner ring and every mapping in the language changes
   at once, which is the point: a shift code has exactly ONE secret,
   and finding it from a single letter pair solves the whole word.

   Engine adapted from the original coding-lab module.
   ============================================================ */

export const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const pos = c => AZ.indexOf(c) + 1;                 // A = 1
export const chr = n => AZ[((n - 1) % 26 + 26) % 26];      // 1 = A, wraps
export const shift = (w, k) => [...w].map(c => chr(pos(c) + k)).join('');

/** The shift that turns `a` into `b`, or null if no single shift does. */
export function shiftBetween(a, b) {
  if (a.length !== b.length || !a.length) return null;
  const k = ((pos(b[0]) - pos(a[0])) % 26 + 26) % 26;
  return shift(a, k) === b ? k : null;
}

/* Scripted-action surface — see turnDialMachine in compass.js.
   `r<n>` is the shift slider, `t<L>` a tap on a letter. Both the shifts and the
   letters tried accumulate, so the machine accumulates them the same way. */
export function cipherWheelMachine({ start = 3 } = {}) {
  const add = (xs, x) => (xs.includes(x) ? xs : [...xs, x]);
  return {
    init: { k: start, tapped: null, taps: [], shifts: [start] },
    actions: [...Array(26).keys()].map(i => `r${i}`).concat([...AZ].map(c => `t${c}`)),
    act(st, a) {
      if (a[0] === 't') { const c = a.slice(1); return { ...st, tapped: c, taps: add(st.taps, c) }; }
      const k = +a.slice(1);
      return { ...st, k, shifts: add(st.shifts, k) };
    },
    report: st => ({
      shift: st.k, tapped: st.tapped, tappedCount: st.taps.length,
      shiftsTried: st.shifts.length, atAtbash: false,
      triedBig: st.shifts.some(x => x >= 13),
    }),
  };
}

export function cipherWheel(cfg = {}) {
  const { start = 3, word = 'TIGER' } = cfg;
  const M = cipherWheelMachine(cfg);
  return (el, api = {}) => {
    let st = M.init, k = start;

    el.innerHTML = `
      <div class="cw">
        <div class="cw-board"><svg id="cwSvg" viewBox="0 0 300 300" class="cw-svg"
             role="img" aria-label="Cipher wheel"></svg></div>
        <div class="cw-side">
          <label class="cw-lab">Shift: <b id="cwK">+${k}</b></label>
          <input class="cw-range" id="cwR" type="range" min="0" max="25" value="${k}" aria-label="Shift amount">
          <div class="cw-map" id="cwMap"></div>
          <p class="cw-lab" style="margin-top:12px">Tap any letter on the wheel</p>
          <div class="cw-fact" id="cwFact">Nothing tapped yet.</div>
          <p class="cw-lab" style="margin-top:12px">Live encoding</p>
          <div class="cw-word" id="cwWord"></div>
        </div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      k = st.k;
      const tapped = st.tapped;
      let s = `<circle class="cw-ring" cx="150" cy="150" r="140"/>
               <circle class="cw-ring cw-ring--in" cx="150" cy="150" r="96"/>`;
      for (let i = 0; i < 26; i++) {
        const a = (i * 360 / 26 - 90) * Math.PI / 180;
        const ox = 150 + Math.cos(a) * 120, oy = 150 + Math.sin(a) * 120 + 5;
        const j = (i + k) % 26;
        const b = (j * 360 / 26 - 90) * Math.PI / 180;
        const ix = 150 + Math.cos(b) * 72, iy = 150 + Math.sin(b) * 72 + 5;
        const on = tapped === AZ[i];
        s += `<g class="cw-pair ${on ? 'is-on' : ''}" data-c="${AZ[i]}">
                <circle class="cw-hit" cx="${ox}" cy="${oy - 5}" r="13"/>
                <text class="cw-plain" x="${ox}" y="${oy}" text-anchor="middle">${AZ[i]}</text>
                <text class="cw-code" x="${ix}" y="${iy}" text-anchor="middle">${AZ[i]}</text>
              </g>`;
      }
      s += `<path class="cw-ptr" d="M150 8 L144 24 L156 24 Z"/>
            <line class="cw-ptr-l" x1="150" y1="24" x2="150" y2="46"/>`;
      $('cwSvg').innerHTML = s;
      el.querySelectorAll('.cw-pair').forEach(g => g.onclick = () => {
        st = M.act(st, 't' + g.dataset.c); draw();
      });

      $('cwK').textContent = (k >= 0 ? '+' : '') + k;
      $('cwMap').innerHTML = ['A', 'B', 'M', 'Z'].map(c =>
        `<span class="cw-chip">${c} → <b>${chr(pos(c) + k)}</b></span>`).join('');

      $('cwFact').innerHTML = tapped
        ? `<b>${tapped}</b> is letter <b>${pos(tapped)}</b> from A and
           <b>${27 - pos(tapped)}</b> from Z.<br>
           With this shift it becomes <b>${chr(pos(tapped) + k)}</b>.
           Its reverse-alphabet partner is <b>${chr(27 - pos(tapped))}</b>.`
        : 'Nothing tapped yet.';

      $('cwWord').innerHTML = [...word].map(c =>
        `<span class="cw-cell"><b>${c}</b><em>${pos(c)}</em><i>↓</i><b class="cw-out">${chr(pos(c) + k)}</b></span>`).join('');

      api.report?.(M.report(st));
    };

    $('cwR').oninput = e => { st = M.act(st, 'r' + e.target.value); draw(); };
    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- code family lab ---------------- */

export const FAMILIES = [
  { id: 'shift', name: 'Uniform shift',
    blurb: 'every letter moves the same number of places',
    detect: (a, b) => { const k = shiftBetween(a, b); return k === null || k === 0 ? null : `+${k > 13 ? k - 26 : k}`; },
    apply: (w, tag) => shift(w, +tag) },
  { id: 'incr', name: 'Incremental shift',
    blurb: 'the step grows letter by letter: +1, +2, +3…',
    detect: (a, b) => {
      if (a.length !== b.length) return null;
      for (const step of [1, 2, 3]) {
        if ([...a].map((c, i) => chr(pos(c) + step * (i + 1))).join('') === b) return String(step);
      }
      return null;
    },
    apply: (w, tag) => [...w].map((c, i) => chr(pos(c) + (+tag) * (i + 1))).join('') },
  { id: 'atbash', name: 'Reverse alphabet',
    blurb: 'A↔Z, B↔Y … position becomes 27 − n',
    detect: (a, b) => [...a].map(c => chr(27 - pos(c))).join('') === b ? 'yes' : null,
    apply: w => [...w].map(c => chr(27 - pos(c))).join('') },
  { id: 'reverse', name: 'Word reversal',
    blurb: 'the same letters, written backwards',
    detect: (a, b) => [...a].reverse().join('') === b ? 'yes' : null,
    apply: w => [...w].reverse().join('') },
  { id: 'pairswap', name: 'Adjacent pair swap',
    blurb: 'the same letters, swapped two at a time',
    detect: (a, b) => {
      const x = [...a]; for (let i = 0; i + 1 < x.length; i += 2) [x[i], x[i + 1]] = [x[i + 1], x[i]];
      return x.join('') === b ? 'yes' : null;
    },
    apply: w => { const x = [...w]; for (let i = 0; i + 1 < x.length; i += 2) [x[i], x[i + 1]] = [x[i + 1], x[i]]; return x.join(''); } },
];

/* Scripted-action surface — see turnDialMachine in compass.js. The state is
   only which families have been tested; whether one FITS is re-derived from the
   pair by `detect`, so the sweep cannot pretend a family fits when it does not. */
export function codeLabMachine({ plain = 'MANGO', code = 'AMGNO' } = {}) {
  const fits = id => {
    const f = FAMILIES.find(x => x.id === id);
    return f && f.detect(plain, code) ? id : null;
  };
  return {
    init: { tried: [], found: null },
    actions: FAMILIES.map(f => f.id),
    act: (st, id) => (st.tried.includes(id) ? st : {
      tried: [...st.tried, id],
      found: fits(id) || st.found,        // a later match replaces an earlier one
    }),
    report: st => ({ tried: st.tried.slice(), triedCount: st.tried.length,
                     found: st.found, solved: !!st.found }),
  };
}

export function codeLab(cfg = {}) {
  const { plain = 'MANGO', code = 'AMGNO', target = 'JAIPUR' } = cfg;
  const M = codeLabMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="cl">
        <div class="cl-given">
          <span class="cl-word">${plain}</span><span class="cl-arrow">is written as</span>
          <span class="cl-word cl-word--code">${code}</span>
        </div>
        <p class="cw-lab">Test a family — I will check it against the pair</p>
        <div class="cl-fams" id="clFams"></div>
        <div class="cl-out" id="clOut"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const render = () => {
      const fam = st.found && FAMILIES.find(x => x.id === st.found);

      $('clFams').innerHTML = FAMILIES.map(f => {
        const t = st.tried.includes(f.id);
        const hit = st.found === f.id;
        return `<button class="cl-fam ${t ? (hit ? 'is-hit' : 'is-miss') : ''}" data-f="${f.id}">
                  <b>${f.name}</b><span>${f.blurb}</span>
                  ${t ? `<em>${hit ? '✓ this is it' : '✗ does not fit'}</em>` : ''}
                </button>`;
      }).join('');
      el.querySelectorAll('.cl-fam').forEach(b =>
        b.onclick = () => { st = M.act(st, b.dataset.f); render(); });

      $('clOut').innerHTML = fam
        ? `<div class="cl-found">
             <p><b>${fam.name}</b> — ${fam.blurb}.</p>
             <div class="cl-pairs">${[...plain].map((c, i) =>
               `<span class="cl-pair"><b>${c}</b><i>→</i><b>${code[i]}</b></span>`).join('')}</div>
             <p class="cl-apply">Apply the same rule to <b>${target}</b>:
                <span class="cl-word cl-word--code">${fam.apply(target, fam.detect(plain, code))}</span></p>
           </div>`
        : st.tried.length ? `<p class="cl-hint">Not that one. Compare the <b>first letter pair</b>, then ask whether the code uses the <b>same letters</b>.</p>` : '';

      api.report?.(M.report(st));
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}
