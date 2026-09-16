/* ============================================================
   Shape lab — two widgets built on one idea: apply ONE transform
   and look at what survives it.

     mirrorLab()    — vertical mirror (left↔right) vs water image (top↔bottom)
     figSeriesLab() — a figure series where exactly one attribute changes

   Both transform the SAME source drawing, so the "answer" is whatever
   the transform produces. Nothing is drawn twice by hand, which is how
   a mirror-image widget quietly ends up lying to students.
   ============================================================ */

/* Letters that survive each flip unchanged (block capitals). */
export const MIRROR_SAFE = new Set([...'AHIMOTUVWXY']);   // vertical mirror, left↔right
export const WATER_SAFE  = new Set([...'BCDEHIKOX']);     // water image, top↔bottom

export const survives = (text, axis) => {
  const safe = axis === 'mirror' ? MIRROR_SAFE : WATER_SAFE;
  const chars = [...text.toUpperCase()].filter(c => /[A-Z]/.test(c));
  if (!chars.every(c => safe.has(c))) return false;
  // a vertical mirror also reverses reading order, so the word must be a palindrome
  return axis === 'mirror' ? chars.join('') === [...chars].reverse().join('') : true;
};

export function mirrorLab({ samples = ['HIM', 'TOOT', 'CODE', 'BOX'] } = {}) {
  return (el, api = {}) => {
    let text = samples[0], axis = 'mirror';
    const tried = new Set(['mirror']);
    const seenText = new Set([text]);

    const render = () => {
      const ok = survives(text, axis);
      const transform = axis === 'mirror' ? 'scale(-1,1)' : 'scale(1,-1)';

      el.innerHTML = `
        <div class="ml">
          <div class="ml-axis">
            <button class="ml-tab ${axis === 'mirror' ? 'is-on' : ''}" data-a="mirror">
              <b>Mirror image</b><span>flip left ↔ right</span></button>
            <button class="ml-tab ${axis === 'water' ? 'is-on' : ''}" data-a="water">
              <b>Water image</b><span>flip top ↔ bottom</span></button>
          </div>

          <div class="ml-pair">
            <div class="ml-cell">
              <svg viewBox="0 0 200 110" class="ml-svg"><text class="ml-txt" x="100" y="72" text-anchor="middle">${text}</text></svg>
              <em>as written</em>
            </div>
            <div class="ml-axisline ${axis}"><span></span></div>
            <div class="ml-cell">
              <svg viewBox="0 0 200 110" class="ml-svg">
                <g transform="translate(100,55) ${transform} translate(-100,-55)">
                  <text class="ml-txt ml-txt--flip" x="100" y="72" text-anchor="middle">${text}</text>
                </g>
              </svg>
              <em>${axis === 'mirror' ? 'in a mirror' : 'in still water'}</em>
            </div>
          </div>

          <div class="ml-verdict ${ok ? 'is-ok' : 'is-no'}">
            ${ok ? `<b>Unchanged.</b> Every letter is symmetric about this axis${axis === 'mirror' ? ', and the word reads the same reversed' : ''}.`
                 : `<b>Changed.</b> ${axis === 'mirror'
                      ? 'Either a letter is not left–right symmetric, or the word does not read the same backwards.'
                      : 'At least one letter is not top–bottom symmetric.'}`}
          </div>

          <p class="ml-lab">Try another</p>
          <div class="ml-samples" id="mlS">
            ${samples.map(s => `<button class="ml-sample ${s === text ? 'is-on' : ''}" data-t="${s}">${s}</button>`).join('')}
          </div>
          <div class="ml-key">
            <span><b>Safe in a mirror:</b> ${[...MIRROR_SAFE].join(' ')}</span>
            <span><b>Safe in water:</b> ${[...WATER_SAFE].join(' ')}</span>
          </div>
        </div>`;

      el.querySelectorAll('.ml-tab').forEach(b => b.onclick = () => { axis = b.dataset.a; tried.add(axis); render(); });
      el.querySelectorAll('.ml-sample').forEach(b => b.onclick = () => { text = b.dataset.t; seenText.add(text); render(); });

      api.report?.({ text, axis, unchanged: ok, triedBoth: tried.size >= 2,
                     samplesSeen: seenText.size, sawUnchanged: ok });
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- figure series ---------------- */
/* A shape is {sides, rot, dots}. Exactly one attribute moves per step,
   and the widget derives the next term rather than storing it. */

const polygonPts = (sides, cx, cy, r, rot) =>
  [...Array(sides)].map((_, i) => {
    const a = (rot + i * 360 / sides - 90) * Math.PI / 180;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');

export function shapeSVG({ sides = 4, rot = 0, dots = 0 }, size = 92) {
  const c = size / 2, r = size * 0.36;
  let s = `<polygon class="fs-poly" points="${polygonPts(sides, c, c, r, rot)}"/>`;
  s += `<line class="fs-mark" x1="${c}" y1="${c}" x2="${(c + Math.cos((rot - 90) * Math.PI / 180) * r).toFixed(1)}"
          y2="${(c + Math.sin((rot - 90) * Math.PI / 180) * r).toFixed(1)}"/>`;
  for (let i = 0; i < dots; i++) {
    const a = (i * 360 / Math.max(dots, 1) - 90) * Math.PI / 180;
    s += `<circle class="fs-dot" cx="${(c + Math.cos(a) * r * 0.45).toFixed(1)}"
            cy="${(c + Math.sin(a) * r * 0.45).toFixed(1)}" r="4"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" class="fs-svg">${s}</svg>`;
}

export function figSeriesLab({ start = { sides: 4, rot: 0, dots: 1 }, step = { rot: 90, dots: 1 }, terms = 4 } = {}) {
  return (el, api = {}) => {
    let revealed = false, guess = null;

    const at = k => ({ sides: start.sides, rot: start.rot + (step.rot || 0) * k, dots: start.dots + (step.dots || 0) * k });
    const answer = at(terms);          // derived, never stored
    const options = [answer,
      { ...answer, rot: answer.rot + 90 },
      { ...answer, dots: Math.max(0, answer.dots - 1) },
      { ...answer, rot: answer.rot - 90, dots: answer.dots + 1 }];

    const render = () => {
      el.innerHTML = `
        <div class="fs">
          <div class="fs-row">
            ${[...Array(terms)].map((_, k) => `<div class="fs-cell">${shapeSVG(at(k))}<em>${k + 1}</em></div>`).join('')}
            <div class="fs-cell fs-cell--q">${revealed ? shapeSVG(answer) : '<div class="fs-q">?</div>'}<em>${terms + 1}</em></div>
          </div>
          <p class="fs-ask">Which single attribute changes from one figure to the next?</p>
          <div class="fs-attrs" id="fsAttrs">
            ${['The number of sides', 'The rotation', 'The number of dots', 'The rotation and the dots']
              .map((t, i) => `<button class="fs-attr" data-i="${i}">${t}</button>`).join('')}
          </div>
          <div class="fs-fb" id="fsFb"></div>
        </div>`;
      el.querySelectorAll('.fs-attr').forEach(b => b.onclick = () => pick(+b.dataset.i));
    };

    const pick = i => {
      if (guess !== null) return;
      guess = i;
      const changesRot = !!step.rot, changesDots = !!step.dots;
      const correct = changesRot && changesDots ? 3 : changesRot ? 1 : 2;
      const ok = i === correct;
      el.querySelectorAll('.fs-attr').forEach((b, k) => {
        b.disabled = true;
        if (k === correct) b.classList.add('is-right');
        if (k === i && !ok) b.classList.add('is-wrong');
      });
      revealed = true;
      const fb = el.querySelector('#fsFb');
      fb.innerHTML = `<div class="fs-note ${ok ? 'is-ok' : 'is-no'}">
        The polygon keeps <b>${start.sides} sides</b> throughout${changesRot ? `, turns <b>${step.rot}°</b> each step` : ''}${changesDots ? `, and gains <b>${step.dots} dot</b> each step` : ''}.
        Isolate one attribute at a time and the series stops being a picture puzzle.</div>`;
      // redraw with the answer showing, keeping the feedback
      const keep = fb.innerHTML;
      render();
      el.querySelector('#fsFb').innerHTML = keep;
      el.querySelectorAll('.fs-attr').forEach((b, k) => {
        b.disabled = true;
        if (k === correct) b.classList.add('is-right');
        if (k === i && !ok) b.classList.add('is-wrong');
      });
      api.report?.({ answered: true, correct: ok, revealed: true });
    };

    render();
    return { destroy() { el.innerHTML = ''; }, get answer() { return answer; }, get options() { return options; } };
  };
}
