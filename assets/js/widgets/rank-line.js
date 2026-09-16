/* ============================================================
   Rank line — makes the three ranking formulas obvious by
   showing the double-count instead of asserting it.

     total       = left rank + right rank − 1
     other end   = total − rank + 1
     in between  = |difference| − 1

   Every one of those minus-ones is the same minus-one: a person
   counted from both ends is counted twice.
   ============================================================ */

/* Scripted-action surface — see turnDialMachine in compass.js.
   Shrinking the row pulls a marker in with it, so every state is normalised
   rather than clamped at draw time: the harness sees the same a/b the learner
   does, not a value the render would have quietly corrected. */
export function rankLineMachine({ n = 12, a = 4, b = 9 } = {}) {
  const SIZES = [...Array(16).keys()].map(i => i + 5);        // the slider's real range, 5..20
  const norm = st => ({ ...st, a: Math.min(st.a, st.n), b: Math.min(st.b, st.n) });
  return {
    init: norm({ n, a, b, active: 'A', moved: [] }),
    actions: st => ['mA', 'mB',
      ...[...Array(st.n).keys()].map(i => `k${i + 1}`),
      ...SIZES.map(s => `n${s}`)],
    act(st, x) {
      if (x[0] === 'm') return { ...st, active: x.slice(1) };
      if (x[0] === 'n') return norm({ ...st, n: +x.slice(1) });
      const k = +x.slice(1);
      return norm({ ...st, [st.active === 'A' ? 'a' : 'b']: k,
                    moved: st.moved.includes(st.active) ? st.moved : [...st.moved, st.active] });
    },
    report: st => ({
      n: st.n, a: st.a, b: st.b, between: Math.abs(st.a - st.b) - 1,
      movedBoth: st.moved.includes('A') && st.moved.includes('B'),
      changedN: st.n !== n, sameSeat: st.a === st.b,
      aAtEnd: st.a === 1 || st.a === st.n,
    }),
  };
}

export function rankLine(cfg = {}) {
  const M = rankLineMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;
    let { n: N, a: A, b: B } = st;

    el.innerHTML = `
      <div class="rk">
        <div class="rk-picker">
          <button class="rk-chip rk-chip--a is-on" data-m="A">Move A</button>
          <button class="rk-chip rk-chip--b" data-m="B">Move B</button>
          <span class="rk-hint">then tap a position</span>
        </div>
        <div class="rk-stage"><svg id="rkSvg" viewBox="0 0 660 130" class="rk-svg"
             role="img" aria-label="A row of people with two marked positions"></svg></div>
        <label class="rk-nlab">People in the row: <b id="rkN">${N}</b></label>
        <input class="rk-range" id="rkRange" type="range" min="5" max="20" value="${N}"
               aria-label="Number of people in the row">
        <div class="rk-facts" id="rkFacts"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      ({ n: N, a: A, b: B } = st);
      const pad = 30, span = 660 - pad * 2;
      const gap = N > 1 ? span / (N - 1) : 0;
      const X = k => pad + (k - 1) * gap;

      let s = `<line class="rk-rail" x1="${pad - 12}" y1="64" x2="${660 - pad + 12}" y2="64"/>`;
      for (let k = 1; k <= N; k++) {
        const isA = k === A, isB = k === B;
        const cls = isA && isB ? 'is-both' : isA ? 'is-a' : isB ? 'is-b' : '';
        s += `<g class="rk-dot ${cls}" data-k="${k}">
                <circle class="rk-hit" cx="${X(k)}" cy="64" r="${Math.max(11, gap / 2)}"/>
                <circle class="rk-pip" cx="${X(k)}" cy="64" r="${isA || isB ? 11 : 5}"/>
                ${isA ? `<text class="rk-lab" x="${X(k)}" y="${isB ? 36 : 40}" text-anchor="middle">A</text>` : ''}
                ${isB ? `<text class="rk-lab rk-lab--b" x="${X(k)}" y="${isA ? 100 : 40}" text-anchor="middle">B</text>` : ''}
              </g>`;
      }
      s += `<text class="rk-end" x="${pad - 18}" y="68" text-anchor="end">left</text>
            <text class="rk-end" x="${660 - pad + 18}" y="68">right</text>`;
      $('rkSvg').innerHTML = s;

      el.querySelectorAll('.rk-dot').forEach(g => g.onclick = () => {
        st = M.act(st, 'k' + g.dataset.k);
        draw();
      });

      const aL = A, aR = N - A + 1, bL = B, bR = N - B + 1;
      const between = Math.abs(A - B) - 1;
      $('rkFacts').innerHTML = `
        <div class="rk-fact rk-fact--a">
          <span>A</span>
          <b>${aL}${ord(aL)} from the left</b><b>${aR}${ord(aR)} from the right</b>
          <em>${aL} + ${aR} − 1 = ${aL + aR - 1} = the whole row</em>
        </div>
        <div class="rk-fact rk-fact--b">
          <span>B</span>
          <b>${bL}${ord(bL)} from the left</b><b>${bR}${ord(bR)} from the right</b>
          <em>${bL} + ${bR} − 1 = ${bL + bR - 1} = the whole row</em>
        </div>
        <div class="rk-fact rk-fact--gap">
          <span>gap</span>
          <b>${between < 0 ? 0 : between} between A and B</b>
          <em>|${A} − ${B}| − 1 = ${Math.abs(A - B)} − 1 = ${between < 0 ? 0 : between}</em>
        </div>`;

      api.report?.(M.report(st));
    };

    const ord = k => ['th', 'st', 'nd', 'rd'][(k % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][k] || 'th';

    el.querySelectorAll('.rk-chip').forEach(c => c.onclick = () => {
      st = M.act(st, 'm' + c.dataset.m);
      el.querySelectorAll('.rk-chip').forEach(x => x.classList.toggle('is-on', x === c));
    });
    $('rkRange').oninput = e => {
      st = M.act(st, 'n' + e.target.value);
      $('rkN').textContent = st.n;
      draw();
    };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
