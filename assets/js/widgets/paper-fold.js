/* ============================================================
   Paper folding & punching.

   The unfolded pattern is COMPUTED, never drawn by hand: punches are
   points in the folded sheet, and each unfold reflects every existing
   point across that crease and keeps both copies. Reverse the folds in
   reverse order and you have the answer — which is exactly the method
   the lesson teaches, so the widget cannot contradict it.
   ============================================================ */

/** A fold halves the sheet. `axis` is the crease; `keep` says which half survives. */
export const FOLDS = {
  rightOntoLeft:  { axis: 'v', keep: 'left',   label: 'Fold right half onto left' },
  leftOntoRight:  { axis: 'v', keep: 'right',  label: 'Fold left half onto right' },
  bottomOntoTop:  { axis: 'h', keep: 'top',    label: 'Fold bottom half onto top' },
  topOntoBottom:  { axis: 'h', keep: 'bottom', label: 'Fold top half onto bottom' },
};

/** Rectangle of the sheet after applying `folds`, within a unit square. */
export function foldedRect(folds) {
  let x0 = 0, y0 = 0, x1 = 1, y1 = 1;
  for (const f of folds) {
    const F = FOLDS[f];
    if (F.axis === 'v') { const m = (x0 + x1) / 2; if (F.keep === 'left') x1 = m; else x0 = m; }
    else                { const m = (y0 + y1) / 2; if (F.keep === 'top')  y1 = m; else y0 = m; }
  }
  return { x0, y0, x1, y1 };
}

/** Unfold: reflect every point across each crease, last fold first. */
export function unfoldPoints(folds, punches) {
  let pts = punches.map(p => ({ ...p }));
  for (let i = folds.length - 1; i >= 0; i--) {
    const rect = foldedRect(folds.slice(0, i));
    const F = FOLDS[folds[i]];
    const mid = F.axis === 'v' ? (rect.x0 + rect.x1) / 2 : (rect.y0 + rect.y1) / 2;
    const mirrored = pts.map(p => F.axis === 'v'
      ? { x: 2 * mid - p.x, y: p.y }
      : { x: p.x, y: 2 * mid - p.y });
    pts = [...pts, ...mirrored];
  }
  // de-duplicate points that land on a crease
  const seen = new Set(), out = [];
  for (const p of pts) {
    const k = `${p.x.toFixed(4)},${p.y.toFixed(4)}`;
    if (!seen.has(k)) { seen.add(k); out.push(p); }
  }
  return out;
}

export function paperFold({ folds = ['rightOntoLeft', 'bottomOntoTop'] } = {}) {
  return (el, api = {}) => {
    let punches = [], unfolded = false, useFolds = folds.slice();
    const S = 240, PAD = 20;
    const px = v => PAD + v * S, py = v => PAD + v * S;

    const render = () => {
      const rect = foldedRect(useFolds);
      const shown = unfolded ? unfoldPoints(useFolds, punches) : punches;

      el.innerHTML = `
        <div class="pf">
          <div class="pf-folds" id="pfFolds">
            ${Object.entries(FOLDS).map(([k, f]) =>
              `<button class="pf-fold ${useFolds.includes(k) ? 'is-on' : ''}" data-k="${k}">${f.label}</button>`).join('')}
          </div>
          <p class="pf-hint">${unfolded
            ? `Unfolded — <b>${shown.length}</b> hole${shown.length === 1 ? '' : 's'} from ${punches.length} punch${punches.length === 1 ? '' : 'es'}.`
            : punches.length
              ? 'Now unfold and watch each crease double the holes.'
              : 'Click inside the shaded folded sheet to punch a hole.'}</p>
          <div class="pf-stage">
            <svg viewBox="0 0 ${S + PAD * 2} ${S + PAD * 2}" class="pf-svg" id="pfSvg" role="img"
                 aria-label="Folded paper with punched holes"></svg>
          </div>
          <div class="pf-foot">
            <button class="btn pf-btn" id="pfGo" ${!punches.length ? 'disabled' : ''}>
              ${unfolded ? 'Fold it again' : 'Unfold'}</button>
            <button class="btn btn--ghost pf-btn" id="pfClear">Clear</button>
          </div>
        </div>`;

      const svg = el.querySelector('#pfSvg');
      let s = `<rect class="pf-sheet" x="${px(0)}" y="${py(0)}" width="${S}" height="${S}" rx="6"/>`;
      // creases
      useFolds.forEach((k, i) => {
        const r = foldedRect(useFolds.slice(0, i)), F = FOLDS[k];
        s += F.axis === 'v'
          ? `<line class="pf-crease" x1="${px((r.x0 + r.x1) / 2)}" y1="${py(r.y0)}" x2="${px((r.x0 + r.x1) / 2)}" y2="${py(r.y1)}"/>`
          : `<line class="pf-crease" x1="${px(r.x0)}" y1="${py((r.y0 + r.y1) / 2)}" x2="${px(r.x1)}" y2="${py((r.y0 + r.y1) / 2)}"/>`;
      });
      if (!unfolded)
        s += `<rect class="pf-folded" x="${px(rect.x0)}" y="${py(rect.y0)}"
                width="${(rect.x1 - rect.x0) * S}" height="${(rect.y1 - rect.y0) * S}" rx="4"/>`;
      s += shown.map(p => `<circle class="pf-hole ${unfolded ? 'is-new' : ''}" cx="${px(p.x)}" cy="${py(p.y)}" r="8"/>`).join('');
      s += `<rect class="pf-hit" x="${px(rect.x0)}" y="${py(rect.y0)}"
              width="${(rect.x1 - rect.x0) * S}" height="${(rect.y1 - rect.y0) * S}"/>`;
      svg.innerHTML = s;

      if (!unfolded) svg.querySelector('.pf-hit').addEventListener('click', e => {
        const box = svg.getBoundingClientRect();
        const vx = (e.clientX - box.left) / box.width * (S + PAD * 2);
        const vy = (e.clientY - box.top) / box.height * (S + PAD * 2);
        punches.push({ x: (vx - PAD) / S, y: (vy - PAD) / S });
        render();
      });

      el.querySelectorAll('.pf-fold').forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        useFolds = useFolds.includes(k) ? useFolds.filter(f => f !== k) : [...useFolds, k];
        punches = []; unfolded = false; render();
      });
      el.querySelector('#pfGo').onclick = () => { unfolded = !unfolded; render(); };
      el.querySelector('#pfClear').onclick = () => { punches = []; unfolded = false; render(); };

      api.report?.({ folds: useFolds.length, punches: punches.length,
                     unfolded, holes: shown.length,
                     doubled: unfolded && shown.length === punches.length * 2 ** useFolds.length,
                     triedTwoFolds: useFolds.length >= 2 });
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}
