/* ============================================================
   Mirror row — the single most expensive misread in seating puzzles.

   A row facing NORTH (away from you) shares your left and right.
   A row facing SOUTH (towards you) reverses both. The learner flips
   the row and watches "third from the left" jump to a different seat.
   ============================================================ */

/* Scripted-action surface — the pure core the DOM drives and the harness
   enumerates. See turnDialMachine in compass.js for the contract. */
export function mirrorRowMachine({ people = ['A', 'B', 'C', 'D', 'E', 'F'], facing = 'N' } = {}) {
  const n = people.length;
  return {
    init: { face: facing, pick: 2, flipped: [facing] },
    actions: ['fN', 'fS', ...people.map((_, i) => `p${i}`)],
    act(st, a) {
      if (a[0] === 'p') return { ...st, pick: +a.slice(1) };
      const face = a.slice(1);
      return { ...st, face,
               flipped: st.flipped.includes(face) ? st.flipped : [...st.flipped, face] };
    },
    report(st) {
      const northFacing = st.face === 'N';
      const fromYourLeft = st.pick + 1;
      const fromTheirLeft = northFacing ? st.pick + 1 : n - st.pick;
      return { face: st.face, pick: st.pick, person: people[st.pick], fromYourLeft, fromTheirLeft,
               flippedBoth: st.flipped.length >= 2,
               sawMismatch: !northFacing && fromYourLeft !== fromTheirLeft };
    },
  };
}

export function mirrorRow(cfg = {}) {
  const { people = ['A', 'B', 'C', 'D', 'E', 'F'], facing = 'N' } = cfg;
  const M = mirrorRowMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="mr">
        <div class="mr-toggle">
          <button class="mr-tab" data-f="N">Row faces <b>North</b> — away from you</button>
          <button class="mr-tab" data-f="S">Row faces <b>South</b> — towards you</button>
        </div>
        <div class="mr-stage"><svg id="mrSvg" viewBox="0 0 560 220" class="mr-svg" role="img"
             aria-label="A row of six people"></svg></div>
        <div class="mr-read" id="mrRead"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    const n = people.length;

    const draw = () => {
      const face = st.face, pick = st.pick;
      const gap = 78, x0 = 280 - (n - 1) * gap / 2, y = 118;
      const northFacing = face === 'N';

      let s = `<text class="mr-axis" x="20" y="196">← your left</text>
               <text class="mr-axis" x="540" y="196" text-anchor="end">your right →</text>
               <line class="mr-floor" x1="20" y1="170" x2="540" y2="170"/>`;

      // the row's own left/right arrows, which flip with the facing
      const theirLeftAtScreenLeft = northFacing;
      s += `<text class="mr-axis mr-axis--their" x="20" y="36">${theirLeftAtScreenLeft ? '← their left' : '← their right'}</text>
            <text class="mr-axis mr-axis--their" x="540" y="36" text-anchor="end">${theirLeftAtScreenLeft ? 'their right →' : 'their left →'}</text>`;

      people.forEach((p, i) => {
        const x = x0 + i * gap;
        const on = i === pick;
        s += `<g class="mr-person ${on ? 'is-pick' : ''}" data-i="${i}">
                <circle class="mr-head" cx="${x}" cy="${y}" r="24"/>
                <text class="mr-name" x="${x}" y="${y + 6}" text-anchor="middle">${p}</text>
                <path class="mr-nose" d="${northFacing
                    ? `M ${x - 8} ${y - 30} L ${x} ${y - 40} L ${x + 8} ${y - 30}`
                    : `M ${x - 8} ${y + 30} L ${x} ${y + 40} L ${x + 8} ${y + 30}`}"/>
                <rect class="mr-hit" x="${x - 32}" y="${y - 44}" width="64" height="94"/>
              </g>`;
      });
      $('mrSvg').innerHTML = s;

      el.querySelectorAll('.mr-person').forEach(g =>
        g.onclick = () => { st = M.act(st, 'p' + g.dataset.i); draw(); });

      const { fromYourLeft, fromTheirLeft } = M.report(st);
      $('mrRead').innerHTML = `
        <div class="mr-line"><b>${people[pick]}</b> is
          <span class="mr-badge mr-badge--you">${ord(fromYourLeft)} from <em>your</em> left</span>
          <span class="mr-badge mr-badge--them">${ord(fromTheirLeft)} from <em>their</em> left</span></div>
        <p class="mr-note">${northFacing
          ? 'Facing North, the row looks the same way you do — the two counts agree.'
          : 'Facing South, the row is a mirror of you — the two counts disagree, and the puzzle means <b>theirs</b>.'}</p>`;

      api.report?.(M.report(st));
    };

    const ord = k => k + (['th', 'st', 'nd', 'rd'][(k % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][k] || 'th');

    el.querySelectorAll('.mr-tab').forEach(b => b.onclick = () => {
      st = M.act(st, 'f' + b.dataset.f);
      el.querySelectorAll('.mr-tab').forEach(x => x.classList.toggle('is-on', x.dataset.f === st.face));
      draw();
    });
    el.querySelector(`.mr-tab[data-f="${facing}"]`).classList.add('is-on');

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
