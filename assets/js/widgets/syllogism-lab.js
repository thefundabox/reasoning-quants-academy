/* ============================================================
   Syllogism lab.

   Both widgets here evaluate the statements and the conclusion from
   the ACTUAL GEOMETRY on screen, never from a hardcoded answer. If
   the picture and the verdict ever disagree, that is a bug rather
   than a teaching decision — which is exactly the property you want
   when the whole subject is "trust the drawing".

     syllogismLab()      — flip between arrangements of the same statements
     conclusionBreaker() — slide one circle and hunt for a counterexample
   ============================================================ */

import { overlaps, contains } from './venn-sets.js';

const CY = 130;
const COLOURS = ['a', 'b', 'c'];

function circlesSVG(circles, order) {
  return order.map((name, i) => {
    const c = circles[name];
    return `<circle class="sl-c sl-c--${COLOURS[i % 3]}" cx="${c.x}" cy="${CY}" r="${c.r}"/>
            <text class="sl-lab sl-lab--${COLOURS[i % 3]}" x="${c.x}" y="${CY - c.r - 9}"
                  text-anchor="middle">${name}</text>`;
  }).join('');
}

/* ---------------- arrangement flipper ---------------- */
export function syllogismLab({ statements = [], conclusion = '', order = [], tests = {}, arrangements = [] }) {
  return (el, api = {}) => {
    let at = 0;
    const seen = new Set([0]);
    let sawFail = false, sawHold = false;

    const render = () => {
      const arr = arrangements[at];
      const c = arr.circles;
      const sOK = statements.map((_, i) => tests['s' + (i + 1)](c));
      const cOK = tests.concl(c);
      const valid = sOK.every(Boolean);
      if (valid && cOK) sawHold = true;
      if (valid && !cOK) sawFail = true;

      el.innerHTML = `
        <div class="sl">
          <div class="sl-stage"><svg viewBox="0 0 440 260" class="sl-svg" role="img"
               aria-label="Circles for this arrangement">${circlesSVG(c, order)}</svg></div>

          <div class="sl-tests">
            ${statements.map((s, i) => `
              <div class="sl-test ${sOK[i] ? 'is-ok' : 'is-no'}">
                <span class="sl-mark"></span><span>${s}</span></div>`).join('')}
            <div class="sl-test sl-test--concl ${cOK ? 'is-ok' : 'is-no'}">
              <span class="sl-mark"></span><span><em>Conclusion:</em> ${conclusion}</span></div>
          </div>

          <div class="sl-verdict ${valid ? (cOK ? 'is-hold' : 'is-break') : 'is-invalid'}">
            ${!valid
              ? 'This drawing breaks one of the statements, so it proves nothing. Ignore it.'
              : cOK
                ? 'Statements true, conclusion true — <b>here</b>. One agreeable drawing proves nothing.'
                : '💥 Statements true, conclusion <b>false</b>. This single drawing kills the conclusion.'}
          </div>

          <p class="sl-pick-lab">Try a different arrangement of the same statements</p>
          <div class="sl-picks" id="slPicks">
            ${arrangements.map((a, i) =>
              `<button class="sl-pick ${i === at ? 'is-on' : ''} ${seen.has(i) ? 'is-seen' : ''}"
                       data-i="${i}">${a.label}</button>`).join('')}
          </div>
        </div>`;

      el.querySelectorAll('.sl-pick').forEach(b => b.onclick = () => {
        at = +b.dataset.i; seen.add(at); render();
      });

      api.report?.({ at, seen: seen.size, total: arrangements.length,
                     statementsHold: valid, conclusionHolds: cOK,
                     sawFail, sawHold, sawBoth: sawFail && sawHold });
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- continuous counterexample hunter ---------------- */
export function conclusionBreaker({
  statements = ['All A are B', 'Some B are C'],
  conclusion = 'Some A are C',
  a = { x: 130, r: 32 }, b = { x: 176, r: 80 },
  start = { x: 300, r: 52 },
} = {}) {
  return (el, api = {}) => {
    let cx = start.x, cr = start.r;
    let found = false, everValid = false;
    let moves = 0;

    el.innerHTML = `
      <div class="sl">
        <div class="sl-stage"><svg id="cbSvg" viewBox="0 0 440 260" class="sl-svg"
             role="img" aria-label="Circles A, B and a movable circle C"></svg></div>
        <div class="cb-controls">
          <label class="cb-lab">Move C <input id="cbX" type="range" min="60" max="400" value="${cx}" aria-label="Position of C"></label>
          <label class="cb-lab">Resize C <input id="cbR" type="range" min="18" max="130" value="${cr}" aria-label="Size of C"></label>
        </div>
        <div class="sl-tests" id="cbTests"></div>
        <div class="sl-verdict" id="cbVerdict"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const A = { x: a.x, r: a.r }, B = { x: b.x, r: b.r }, C = { x: cx, r: cr };
      const s1 = contains(B, A);     // All A are B
      const s2 = overlaps(B, C);     // Some B are C — true whether C clips B or swallows it
      const concl = overlaps(A, C);  // Some A are C
      const valid = s1 && s2;
      if (valid) everValid = true;
      if (valid && !concl) found = true;

      $('cbSvg').innerHTML = circlesSVG({ A, B, C }, ['B', 'A', 'C']);

      $('cbTests').innerHTML = `
        <div class="sl-test ${s1 ? 'is-ok' : 'is-no'}"><span class="sl-mark"></span><span>${statements[0]}</span></div>
        <div class="sl-test ${s2 ? 'is-ok' : 'is-no'}"><span class="sl-mark"></span><span>${statements[1]}</span></div>
        <div class="sl-test sl-test--concl ${concl ? 'is-ok' : 'is-no'}">
          <span class="sl-mark"></span><span><em>Conclusion:</em> ${conclusion}</span></div>`;

      const v = $('cbVerdict');
      v.className = 'sl-verdict ' + (!valid ? 'is-invalid' : concl ? 'is-hold' : 'is-break');
      v.innerHTML = !valid
        ? 'C is not touching B, so the second statement fails. Move C until it overlaps B.'
        : concl
          ? 'Both statements true and the conclusion true — <b>in this drawing</b>. Keep hunting: one agreeable picture proves nothing.'
          : '💥 <b>Broken.</b> Both statements are true and the conclusion is false. The conclusion does <b>not follow</b>.';

      api.report?.({ x: cx, r: cr, statementsHold: valid, conclusionHolds: concl,
                     foundCounterexample: found, everValid, moves });
    };

    $('cbX').oninput = e => { cx = +e.target.value; moves++; draw(); };
    $('cbR').oninput = e => { cr = +e.target.value; moves++; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
