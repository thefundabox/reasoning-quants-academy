/* ============================================================
   Painted cube — the four counts, derived and drawn.

   A cube of side n is painted on all faces, then cut into n³ unit
   cubes. Exactly where a small cube sat decides how many painted
   faces it carries, and the four groups must add back to n³ — which
   the widget checks on every render.
   ============================================================ */

/**
 * The painted-cube groups for a CUBOID, counted by walking every unit cube.
 *
 * Brute force on purpose. Four formulas exist and all four are easy to
 * misremember; a loop over a·b·c positions cannot be misremembered, and rule
 * (b) of this project says a widget derives rather than asserts. The harness
 * checks the groups partition a·b·c, which a formula slip would break.
 */
export function paintedCuboid(a, b, c) {
  const g = { three: 0, two: 0, one: 0, zero: 0 };
  for (let x = 0; x < a; x++) {
    for (let y = 0; y < b; y++) {
      for (let z = 0; z < c; z++) {
        /* A unit cube shows a face for every side of the block it touches. A
           dimension of 1 touches BOTH its faces at once, which is exactly the
           case the closed forms get wrong. */
        const faces = (x === 0 ? 1 : 0) + (x === a - 1 ? 1 : 0)
                    + (y === 0 ? 1 : 0) + (y === b - 1 ? 1 : 0)
                    + (z === 0 ? 1 : 0) + (z === c - 1 ? 1 : 0);
        if (faces >= 3) g.three++;
        else if (faces === 2) g.two++;
        else if (faces === 1) g.one++;
        else g.zero++;
      }
    }
  }
  return g;
}

export function paintedCounts(n) {
  const k = Math.max(n - 2, 0);
  return { three: n >= 2 ? 8 : 0, two: 12 * k, one: 6 * k * k, zero: k ** 3, total: n ** 3 };
}

export function paintedCube({ start = 4 } = {}) {
  return (el, api = {}) => {
    let n = start, layer = 0, shown = new Set([start]);

    const render = () => {
      const c = paintedCounts(n);
      const sum = c.three + c.two + c.one + c.zero;

      el.innerHTML = `
        <div class="pc">
          <label class="pc-lab">Cube side: <b>${n}</b> — cut into <b>${n ** 3}</b> small cubes</label>
          <input class="pc-range" id="pcN" type="range" min="3" max="6" value="${n}" aria-label="Cube side length">

          <div class="pc-body">
            <div class="pc-stage">
              <p class="pc-layer-lab">Layer <b>${layer + 1}</b> of ${n} <em>(front to back)</em></p>
              <svg viewBox="0 0 ${n * 46 + 8} ${n * 46 + 8}" class="pc-svg" id="pcSvg" role="img"
                   aria-label="One layer of the cut cube"></svg>
              <input class="pc-range" id="pcL" type="range" min="0" max="${n - 1}" value="${layer}" aria-label="Which layer">
            </div>
            <div class="pc-legend">
              <div class="pc-row pc-row--3"><span></span><b class="num">${c.three}</b><em>3 painted faces — the corners</em></div>
              <div class="pc-row pc-row--2"><span></span><b class="num">${c.two}</b><em>2 faces — the edges, 12(n−2)</em></div>
              <div class="pc-row pc-row--1"><span></span><b class="num">${c.one}</b><em>1 face — the middles, 6(n−2)²</em></div>
              <div class="pc-row pc-row--0"><span></span><b class="num">${c.zero}</b><em>0 faces — hidden inside, (n−2)³</em></div>
              <div class="pc-sum ${sum === n ** 3 ? 'is-ok' : 'is-no'}">
                ${c.three} + ${c.two} + ${c.one} + ${c.zero} = <b>${sum}</b> = ${n}³ ✓</div>
            </div>
          </div>
        </div>`;

      drawLayer();
      el.querySelector('#pcN').oninput = e => { n = +e.target.value; shown.add(n); layer = Math.min(layer, n - 1); render(); };
      el.querySelector('#pcL').oninput = e => { layer = +e.target.value; drawLayer(); };

      api.report?.({ n, layer, ...c, consistent: sum === n ** 3,
                     sizesTried: shown.size, sawInterior: n >= 3 && c.zero > 0,
                     sawMiddleLayer: layer > 0 && layer < n - 1 });
    };

    const facesOf = (x, y, z) =>
      [x === 0, x === n - 1, y === 0, y === n - 1, z === 0, z === n - 1].filter(Boolean).length;

    const drawLayer = () => {
      const svg = el.querySelector('#pcSvg');
      if (!svg) return;
      let s = '';
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const f = facesOf(x, y, layer);
        s += `<rect class="pc-cell pc-cell--${f}" x="${4 + x * 46}" y="${4 + y * 46}" width="42" height="42" rx="5"/>
              <text class="pc-num" x="${25 + x * 46}" y="${31 + y * 46}" text-anchor="middle">${f}</text>`;
      }
      svg.innerHTML = s;
      const lab = el.querySelector('.pc-layer-lab');
      if (lab) lab.innerHTML = `Layer <b>${layer + 1}</b> of ${n} <em>(front to back)</em>`;
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}
