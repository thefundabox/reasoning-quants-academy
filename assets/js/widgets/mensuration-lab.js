/* ============================================================
   Mensuration lab — the manipulables behind Unit 4.

   The unit turns on one fact that is far easier to SEE than to
   memorise: stretch a shape by k and its length goes as k, its area
   as k², its volume as k³. So every widget here draws to scale and
   lets the learner stretch it.

     areaGrid()    — a rectangle on a unit grid, so the area is
                     literally countable, with a scale slider beside it
     circleLab()   — circumference and area, and why 22/7 is chosen
                     exactly when the radius is a multiple of 7
     pathBorder()  — outer minus inner, inside or outside, plus the
                     crossing-roads case where the overlap is counted twice
     solidLab()    — cube, cuboid, cylinder and cone, with the k² / k³
                     split shown side by side

   Every figure is computed from the dimensions on screen. Nothing is
   stored, so a drawing can never disagree with the number under it.
   ============================================================ */

export const PI22 = 22 / 7;

/* ---------------- pure formulas (exported for the harness) ---------------- */

export const rectArea = (w, h) => w * h;
export const rectPerim = (w, h) => 2 * (w + h);
export const triArea = (b, h) => b * h / 2;

export const circleArea = (r, pi = PI22) => pi * r * r;
export const circleCirc = (r, pi = PI22) => 2 * pi * r;

/** A border of width t, laid outside or inside a w × h rectangle. */
export function borderArea(w, h, t, outside = true) {
  const W = outside ? w + 2 * t : w - 2 * t;
  const H = outside ? h + 2 * t : h - 2 * t;
  const outer = outside ? W * H : w * h;
  const inner = outside ? w * h : W * H;
  return { W, H, outer, inner, path: outer - inner };
}

/** Two roads across a field: the crossing square would otherwise be counted twice. */
export const crossRoads = (w, h, t) => ({
  along: w * t, across: h * t, overlap: t * t, total: w * t + h * t - t * t,
});

export const cubeVol = a => a ** 3;
export const cubeSurf = a => 6 * a * a;
export const cuboidVol = (l, b, h) => l * b * h;
export const cuboidSurf = (l, b, h) => 2 * (l * b + b * h + h * l);
export const cylVol = (r, h, pi = PI22) => pi * r * r * h;
export const cylCurved = (r, h, pi = PI22) => 2 * pi * r * h;
export const cylTotal = (r, h, pi = PI22) => 2 * pi * r * (r + h);
export const coneVol = (r, h, pi = PI22) => pi * r * r * h / 3;
export const coneSlant = (r, h) => Math.sqrt(r * r + h * h);
export const coneCurved = (r, h, pi = PI22) => pi * r * coneSlant(r, h);

const r2 = n => Math.round(n * 100) / 100;
export const fmt = n => {
  const v = r2(n);
  return Number.isInteger(v) ? v.toLocaleString('en-IN') : v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

/* ---------------- rectangle on a grid, with a scale slider ---------------- */
export function areaGrid(cfg) {
  const { w = 12, h = 8, maxScale = 3, unit = 'm' } = cfg;

  return (el, api = {}) => {
    let k = 1;
    const seen = new Set([1]);

    el.innerHTML = `
      <div class="ms">
        <label class="ms-lab">Stretch every side by
          <input id="agK" type="range" min="1" max="${maxScale}" step="1" value="1" aria-label="Scale factor">
          <span id="agKv">×1</span></label>
        <div class="ms-stage"><svg id="agSvg" viewBox="0 0 420 250" class="ms-svg" role="img"
             aria-label="A rectangle drawn on a unit grid, redrawn as it is scaled"></svg></div>
        <div class="ms-cells" id="agCells"></div>
        <div class="ms-note" id="agNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      seen.add(k);
      const W = w * k, H = h * k;
      const cell = Math.min(400 / (w * maxScale), 230 / (h * maxScale));
      const px = v => v * cell;

      const lines = [];
      for (let i = 0; i <= W; i++)
        lines.push(`<line class="ms-grid" x1="${10 + px(i)}" y1="10" x2="${10 + px(i)}" y2="${10 + px(H)}"/>`);
      for (let j = 0; j <= H; j++)
        lines.push(`<line class="ms-grid" x1="10" y1="${10 + px(j)}" x2="${10 + px(W)}" y2="${10 + px(j)}"/>`);

      $('agKv').textContent = '×' + k;
      $('agSvg').innerHTML = `
        <rect class="ms-fill" x="10" y="10" width="${px(W)}" height="${px(H)}"/>
        ${lines.join('')}
        <rect class="ms-edge" x="10" y="10" width="${px(W)}" height="${px(H)}"/>
        <text class="ms-dim" x="${10 + px(W) / 2}" y="${18 + px(H) + 14}" text-anchor="middle">${W} ${unit}</text>
        <text class="ms-dim" x="${10 + px(W) + 8}" y="${10 + px(H) / 2}">${H} ${unit}</text>`;

      $('agCells').innerHTML = `
        <div class="ms-cell"><span>Perimeter</span><b>${fmt(rectPerim(W, H))} ${unit}</b>
          <em>2 × (${W} + ${H}) — grows as <u>k</u></em></div>
        <div class="ms-cell ms-cell--hi"><span>Area</span><b>${fmt(rectArea(W, H))} ${unit}²</b>
          <em>${W} × ${H} — grows as <u>k²</u></em></div>
        <div class="ms-cell"><span>Compared with ×1</span>
          <b>P ×${fmt(rectPerim(W, H) / rectPerim(w, h))} · A ×${fmt(rectArea(W, H) / rectArea(w, h))}</b>
          <em>${k} and ${k}² = ${k * k}</em></div>`;

      $('agNote').innerHTML = k === 1
        ? `Count the little squares — that is what area <em>is</em>. Now stretch it.`
        : `Every side is ${k} times longer, so the perimeter is ${k} times bigger. But the grid now
           holds <b>${k} × ${k} = ${k * k}</b> times as many squares — which is why area grows as
           the <b>square</b> of the scale.`;

      api.report?.({
        k, w: W, h: H,
        area: rectArea(W, H), perimeter: rectPerim(W, H),
        areaFactor: rectArea(W, H) / rectArea(w, h),
        perimFactor: rectPerim(W, H) / rectPerim(w, h),
        seenAll: seen.size === maxScale,
        sawSquareLaw: k > 1 && rectArea(W, H) / rectArea(w, h) === k * k,
        doubled: k === 2,
      });
    };

    $('agK').oninput = e => { k = +e.target.value; draw(); };
    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- circle ---------------- */
export function circleLab(cfg) {
  const { radii = [7, 14, 21], start = 1 } = cfg;

  return (el, api = {}) => {
    let at = start;
    const seen = new Set([start]);

    el.innerHTML = `
      <div class="ms">
        <p class="ms-lab2">Pick a radius</p>
        <div class="ms-picks" id="clPicks"></div>
        <div class="ms-stage"><svg id="clSvg" viewBox="0 0 420 210" class="ms-svg" role="img"
             aria-label="A circle with its radius marked"></svg></div>
        <div class="ms-cells" id="clCells"></div>
        <div class="ms-note" id="clNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const r = radii[at];
      const px = 90 * r / Math.max(...radii);

      $('clPicks').innerHTML = radii.map((x, i) =>
        `<button class="ms-pick ${i === at ? 'is-on' : ''} ${seen.has(i) ? 'is-seen' : ''}"
                 data-i="${i}">r = ${x}</button>`).join('');

      $('clSvg').innerHTML = `
        <circle class="ms-circ" cx="210" cy="105" r="${px}"/>
        <line class="ms-rad" x1="210" y1="105" x2="${210 + px}" y2="105"/>
        <circle class="ms-cdot" cx="210" cy="105" r="3.5"/>
        <text class="ms-dim" x="${210 + px / 2}" y="98" text-anchor="middle">r = ${r}</text>`;

      const c = circleCirc(r), a = circleArea(r);
      const whole = Number.isInteger(c) && Number.isInteger(a);

      $('clCells').innerHTML = `
        <div class="ms-cell"><span>Circumference</span><b>${fmt(c)}</b>
          <em>2 × 22/7 × ${r}</em></div>
        <div class="ms-cell ms-cell--hi"><span>Area</span><b>${fmt(a)}</b>
          <em>22/7 × ${r}²</em></div>
        <div class="ms-cell"><span>With π = 3.14 instead</span>
          <b>${fmt(circleArea(r, 3.14))}</b><em>close, but not the exam's number</em></div>`;

      $('clNote').innerHTML = whole
        ? `<b>r = ${r} is a multiple of 7</b>, so the sevens cancel and both answers come out whole.
           That is the entire reason examiners choose radii of 7, 14, 21 and 35 — it is a signal
           that <b>22/7</b> is the value of π they intend.`
        : `This radius is not a multiple of 7, so 22/7 leaves a fraction behind. When the radius is
           not a multiple of 7, the question usually expects 3.14 instead.`;

      api.report?.({
        r, circumference: r2(c), area: r2(a),
        at, seen: seen.size, total: radii.length, seenAll: seen.size === radii.length,
        wholeAnswers: whole,
        multipleOfSeven: r % 7 === 0,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.ms-pick');
      if (!b) return;
      at = +b.dataset.i; seen.add(at); draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- paths and borders ---------------- */
export function pathBorder(cfg) {
  const { w = 20, h = 15, maxT = 5, unit = 'm', startT = 2 } = cfg;

  return (el, api = {}) => {
    let t = startT, outside = true, roads = false;
    const seen = new Set();

    el.innerHTML = `
      <div class="ms">
        <div class="ms-modes">
          <button class="ms-mode is-on" data-m="out">Path outside</button>
          <button class="ms-mode" data-m="in">Path inside</button>
          <button class="ms-mode" data-m="cross">Two crossing roads</button>
        </div>
        <label class="ms-lab">Width of the path
          <input id="pbT" type="range" min="1" max="${maxT}" step="0.5" value="${t}" aria-label="Path width">
          <span id="pbTv"></span></label>
        <div class="ms-stage"><svg id="pbSvg" viewBox="0 0 420 240" class="ms-svg" role="img"
             aria-label="A field with a border path drawn around or inside it"></svg></div>
        <div class="ms-cells" id="pbCells"></div>
        <div class="ms-note" id="pbNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      seen.add(roads ? 'cross' : outside ? 'out' : 'in');
      $('pbTv').textContent = t + ' ' + unit;
      const scale = Math.min(380 / (w + 2 * maxT), 200 / (h + 2 * maxT));
      const px = v => v * scale;
      const cx = 210, cy = 120;

      let cells, note;

      if (roads) {
        const r = crossRoads(w, h, t);
        $('pbSvg').innerHTML = `
          <rect class="ms-fill" x="${cx - px(w) / 2}" y="${cy - px(h) / 2}" width="${px(w)}" height="${px(h)}"/>
          <rect class="ms-path" x="${cx - px(w) / 2}" y="${cy - px(t) / 2}" width="${px(w)}" height="${px(t)}"/>
          <rect class="ms-path" x="${cx - px(t) / 2}" y="${cy - px(h) / 2}" width="${px(t)}" height="${px(h)}"/>
          <rect class="ms-overlap" x="${cx - px(t) / 2}" y="${cy - px(t) / 2}" width="${px(t)}" height="${px(t)}"/>
          <rect class="ms-edge" x="${cx - px(w) / 2}" y="${cy - px(h) / 2}" width="${px(w)}" height="${px(h)}"/>`;
        cells = `
          <div class="ms-cell"><span>Along the length</span><b>${fmt(r.along)} ${unit}²</b><em>${w} × ${t}</em></div>
          <div class="ms-cell"><span>Across the breadth</span><b>${fmt(r.across)} ${unit}²</b><em>${h} × ${t}</em></div>
          <div class="ms-cell ms-cell--hi"><span>Total road area</span><b>${fmt(r.total)} ${unit}²</b>
            <em>${fmt(r.along)} + ${fmt(r.across)} − ${fmt(r.overlap)}</em></div>`;
        note = `The little square where they cross belongs to <em>both</em> roads. Add the two
                strips and you have counted it <b>twice</b>, so subtract it once —
                <b>${fmt(r.overlap)} ${unit}²</b> here.`;
      } else {
        const b = borderArea(w, h, t, outside);
        const oW = outside ? b.W : w, oH = outside ? b.H : h;
        const iW = outside ? w : b.W, iH = outside ? h : b.H;
        $('pbSvg').innerHTML = `
          <rect class="ms-path" x="${cx - px(oW) / 2}" y="${cy - px(oH) / 2}" width="${px(oW)}" height="${px(oH)}"/>
          <rect class="ms-fill" x="${cx - px(iW) / 2}" y="${cy - px(iH) / 2}" width="${px(iW)}" height="${px(iH)}"/>
          <rect class="ms-edge" x="${cx - px(oW) / 2}" y="${cy - px(oH) / 2}" width="${px(oW)}" height="${px(oH)}"/>
          <text class="ms-dim" x="${cx}" y="${cy - px(oH) / 2 - 6}" text-anchor="middle">${fmt(oW)} × ${fmt(oH)}</text>
          <text class="ms-dim" x="${cx}" y="${cy + 4}" text-anchor="middle">${fmt(iW)} × ${fmt(iH)}</text>`;
        cells = `
          <div class="ms-cell"><span>Outer</span><b>${fmt(b.outer)} ${unit}²</b><em>${fmt(oW)} × ${fmt(oH)}</em></div>
          <div class="ms-cell"><span>Inner</span><b>${fmt(b.inner)} ${unit}²</b><em>${fmt(iW)} × ${fmt(iH)}</em></div>
          <div class="ms-cell ms-cell--hi"><span>Path</span><b>${fmt(b.path)} ${unit}²</b>
            <em>outer − inner</em></div>`;
        note = outside
          ? `A path <b>outside</b> adds the width at <em>both</em> ends of each dimension, so each
             one grows by <b>2 × ${t} = ${fmt(2 * t)}</b>, not by ${t}.`
          : `A path <b>inside</b> eats the width from both ends, so each dimension <em>shrinks</em>
             by <b>${fmt(2 * t)}</b>. The outer rectangle is the field itself.`;
      }

      $('pbCells').innerHTML = cells;
      $('pbNote').innerHTML = note;

      const b = borderArea(w, h, t, outside);
      const r = crossRoads(w, h, t);
      api.report?.({
        t, outside, roads,
        path: roads ? r.total : b.path,
        overlap: r.overlap,
        seen: [...seen], sawAll: seen.size === 3,
        sawOutside: seen.has('out'), sawInside: seen.has('in'), sawRoads: seen.has('cross'),
        insideFits: !outside && w - 2 * t > 0 && h - 2 * t > 0,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.ms-mode');
      if (!b) return;
      roads = b.dataset.m === 'cross';
      outside = b.dataset.m === 'out';
      el.querySelectorAll('.ms-mode').forEach(x => x.classList.toggle('is-on', x === b));
      draw();
    });
    $('pbT').oninput = e => { t = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- solids ---------------- */
export function solidLab(cfg) {
  const { solids = [], maxScale = 3 } = cfg;

  return (el, api = {}) => {
    let at = 0, k = 1;
    const seen = new Set([0]);

    el.innerHTML = `
      <div class="ms">
        <div class="ms-modes" id="slPicks"></div>
        <label class="ms-lab">Scale every dimension by
          <input id="slK" type="range" min="1" max="${maxScale}" step="1" value="1" aria-label="Scale factor">
          <span id="slKv">×1</span></label>
        <div class="ms-cells" id="slCells"></div>
        <div class="ms-note" id="slNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const measure = (s, scale) => {
      const d = s.dims.map(x => x * scale);
      switch (s.type) {
        case 'cube':     return { vol: cubeVol(d[0]), surf: cubeSurf(d[0]),
          vf: `${d[0]}³`, sf: `6 × ${d[0]}²` };
        case 'cuboid':   return { vol: cuboidVol(...d), surf: cuboidSurf(...d),
          vf: d.join(' × '), sf: `2(lb + bh + hl)` };
        case 'cylinder': return { vol: cylVol(d[0], d[1]), surf: cylTotal(d[0], d[1]),
          vf: `22/7 × ${d[0]}² × ${d[1]}`, sf: `2 × 22/7 × ${d[0]} × (${d[0]} + ${d[1]})` };
        case 'cone':     return { vol: coneVol(d[0], d[1]), surf: coneCurved(d[0], d[1]),
          vf: `⅓ × 22/7 × ${d[0]}² × ${d[1]}`, sf: `22/7 × ${d[0]} × ${fmt(coneSlant(d[0], d[1]))}` };
        default:         return { vol: 0, surf: 0, vf: '', sf: '' };
      }
    };

    const draw = () => {
      seen.add(at);
      const s = solids[at];
      const base = measure(s, 1), now = measure(s, k);

      $('slPicks').innerHTML = solids.map((x, i) =>
        `<button class="ms-mode ${i === at ? 'is-on' : ''}" data-i="${i}">${x.label}</button>`).join('');
      $('slKv').textContent = '×' + k;

      $('slCells').innerHTML = `
        <div class="ms-cell"><span>Volume</span><b>${fmt(now.vol)}</b><em>${now.vf}</em></div>
        <div class="ms-cell ms-cell--hi"><span>Surface area</span><b>${fmt(now.surf)}</b><em>${now.sf}</em></div>
        <div class="ms-cell"><span>Compared with ×1</span>
          <b>V ×${fmt(now.vol / base.vol)} · S ×${fmt(now.surf / base.surf)}</b>
          <em>${k}³ = ${k ** 3} and ${k}² = ${k ** 2}</em></div>`;

      $('slNote').innerHTML = k === 1
        ? `${s.note || ''} Now scale it and watch the two factors part company.`
        : `Every dimension is ${k} times bigger. Surface area is made of <b>two</b> lengths
           multiplied, so it grows as <b>${k}² = ${k ** 2}</b>. Volume is made of <b>three</b>, so it
           grows as <b>${k}³ = ${k ** 3}</b>. That gap is why a scaled-up shape needs far more
           filling than painting.`;

      api.report?.({
        solid: s.type, k, vol: r2(now.vol), surf: r2(now.surf),
        volFactor: r2(now.vol / base.vol), surfFactor: r2(now.surf / base.surf),
        seenAll: seen.size === solids.length,
        cubeLawHolds: Math.abs(now.vol / base.vol - k ** 3) < 1e-6,
        squareLawHolds: Math.abs(now.surf / base.surf - k ** 2) < 1e-6,
        doubled: k === 2,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.ms-mode[data-i]');
      if (!b) return;
      at = +b.dataset.i; draw();
    });
    $('slK').oninput = e => { k = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
