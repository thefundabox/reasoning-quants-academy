/* ============================================================
   Venn primitives + two widgets:
     setSorter()  — place real items into the four zones of two circles
     vennPicker() — choose the diagram that fits three categories

   All circles sit on one horizontal line, so every relation is a
   one-dimensional test on centres and radii. That keeps the geometry
   honest: whatever the picture shows, the code agrees with.
   ============================================================ */

export const overlaps  = (p, q) => Math.abs(p.x - q.x) < p.r + q.r;
export const contains  = (big, small) => Math.abs(big.x - small.x) + small.r <= big.r;
export const disjoint  = (p, q) => !overlaps(p, q);

/** subset | overlap | disjoint — the only three relations two sets can have. */
export function relationOf(p, q) {
  if (contains(q, p) || contains(p, q)) return 'subset';
  return overlaps(p, q) ? 'overlap' : 'disjoint';
}

/* ---------------- set sorter ---------------- */
export function setSorter({ sets = [] } = {}) {
  return (el, api = {}) => {
    let idx = 0, sel = null, wrong = 0;
    let data = null;

    const ZONES = {
      A:   { label: 'left circle only' },
      AB:  { label: 'the lens — both' },
      B:   { label: 'right circle only' },
      OUT: { label: 'outside both' },
    };

    const load = () => {
      const s = sets[idx % sets.length];
      data = { a: s.a, b: s.b, items: s.items.map(([n, z]) => ({ n, z, done: false })), zones: { A: [], AB: [], B: [], OUT: [] } };
      sel = null; wrong = 0;
      render();
    };

    const render = () => {
      const left = data.items.filter(i => !i.done).length;
      el.innerHTML = `
        <div class="vs">
          <p class="vs-head"><b>${data.a}</b> &nbsp;and&nbsp; <b>${data.b}</b></p>
          <div class="vs-stage"><svg id="vsSvg" viewBox="0 0 440 300" class="vs-svg"
               role="img" aria-label="Two overlapping circles with four zones"></svg></div>
          <div class="vs-chips" id="vsChips"></div>
          <div class="vs-msg" id="vsMsg"></div>
          <div class="vs-foot">
            <button class="btn btn--ghost vs-btn" id="vsNew">Different sets</button>
            <span class="vs-count">${left ? `${left} left to place` : 'all placed'}</span>
          </div>
        </div>`;

      draw();
      el.querySelector('#vsNew').onclick = () => { idx++; load(); };
      api.report?.({ placed: data.items.filter(i => i.done).length,
                     total: data.items.length,
                     allPlaced: data.items.every(i => i.done),
                     mistakes: wrong, set: idx });
    };

    const draw = () => {
      const z = data.zones;
      const rows = (arr, x, y0, cls) => arr.map((n, i) =>
        `<text class="vs-item ${cls}" x="${x}" y="${y0 + i * 19}" text-anchor="middle">${n}</text>`).join('');

      el.querySelector('#vsSvg').innerHTML = `
        <rect class="vs-uni" x="14" y="12" width="412" height="276" rx="14"/>
        <text class="vs-unilab" x="410" y="34" text-anchor="end">everything else</text>
        <circle class="vs-c vs-c--a" cx="160" cy="162" r="88"/>
        <circle class="vs-c vs-c--b" cx="284" cy="162" r="88"/>
        <text class="vs-lab vs-lab--a" x="118" y="62" text-anchor="middle">${data.a}</text>
        <text class="vs-lab vs-lab--b" x="326" y="62" text-anchor="middle">${data.b}</text>
        ${rows(z.A, 112, 130, 'is-a')}
        ${rows(z.AB, 222, 130, 'is-ab')}
        ${rows(z.B, 332, 130, 'is-b')}
        ${rows(z.OUT, 66, 46, 'is-out')}
        <rect class="vs-hit" x="14" y="12" width="412" height="276" rx="14" data-z="OUT"/>
        <circle class="vs-hit" cx="160" cy="162" r="88" data-z="A"/>
        <circle class="vs-hit" cx="284" cy="162" r="88" data-z="B"/>
        <ellipse class="vs-hit" cx="222" cy="162" rx="26" ry="72" data-z="AB"/>`;

      el.querySelectorAll('.vs-hit').forEach(h =>
        h.addEventListener('click', () => drop(h.dataset.z)));

      el.querySelector('#vsChips').innerHTML = data.items.map((it, i) =>
        `<button class="vs-chip ${it.done ? 'is-done' : ''} ${sel === i ? 'is-sel' : ''}"
                 ${it.done ? 'disabled' : ''} data-i="${i}">${it.n}</button>`).join('');
      el.querySelectorAll('.vs-chip').forEach(b => b.onclick = () => {
        const i = +b.dataset.i;
        sel = sel === i ? null : i;
        draw();
      });
    };

    const msg = (t, cls) => { const m = el.querySelector('#vsMsg'); m.textContent = t; m.className = 'vs-msg ' + cls; };

    const drop = zone => {
      if (sel === null) return msg('Tap an item first, then tap where it belongs.', 'is-hint');
      const it = data.items[sel];
      if (it.z === zone) {
        it.done = true; data.zones[zone].push(it.n); sel = null;
        const left = data.items.filter(i => !i.done).length;
        render();
        msg(left ? `${it.n} placed — ${left} to go.` : `All placed${wrong ? ` with ${wrong} slip${wrong > 1 ? 's' : ''}` : ' with no mistakes'}.`,
            left ? 'is-ok' : 'is-win');
      } else {
        wrong++;
        msg(`Not there. Is "${it.n}" ${ZONES[it.z].label}?`, 'is-no');
        api.report?.({ placed: data.items.filter(i => i.done).length, total: data.items.length,
                       allPlaced: false, mistakes: wrong, set: idx });
      }
    };

    load();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- three-set diagram picker ---------------- */
export const TEMPLATES = {
  nested:   { name: 'Nested — each inside the next', draw: c =>
    `<circle class="vt vt--3" cx="75" cy="55" r="48"/><circle class="vt vt--2" cx="75" cy="55" r="31"/><circle class="vt vt--1" cx="75" cy="55" r="14"/>` },
  twoIn:    { name: 'Two separate sets inside a bigger one', draw: () =>
    `<circle class="vt vt--3" cx="75" cy="55" r="48"/><circle class="vt vt--1" cx="58" cy="55" r="15"/><circle class="vt vt--2" cx="94" cy="55" r="15"/>` },
  twoOver:  { name: 'Two overlapping sets inside a bigger one', draw: () =>
    `<circle class="vt vt--3" cx="75" cy="55" r="48"/><circle class="vt vt--1" cx="64" cy="55" r="21"/><circle class="vt vt--2" cx="88" cy="55" r="21"/>` },
  allOver:  { name: 'All three partly overlapping', draw: () =>
    `<circle class="vt vt--1" cx="63" cy="46" r="28"/><circle class="vt vt--2" cx="88" cy="46" r="28"/><circle class="vt vt--3" cx="75" cy="68" r="28"/>` },
  separate: { name: 'All three completely separate', draw: () =>
    `<circle class="vt vt--1" cx="32" cy="55" r="22"/><circle class="vt vt--2" cx="75" cy="55" r="22"/><circle class="vt vt--3" cx="118" cy="55" r="22"/>` },
};

export function vennPicker({ rounds = [] } = {}) {
  return (el, api = {}) => {
    let at = 0, chosen = null, right = 0, attempts = 0;

    const render = () => {
      if (at >= rounds.length) {
        el.innerHTML = `<div class="vp"><div class="vp-done"><b>Finished.</b>
          ${right} of ${rounds.length} correct on the first try.
          <p>Notice what you did each time: you decided the three <em>pairwise</em> relations first,
             and only then looked at the pictures.</p></div></div>`;
        api.report?.({ finished: true, right, rounds: rounds.length, attempts });
        return;
      }
      const r = rounds[at];
      const keys = Object.keys(TEMPLATES);
      el.innerHTML = `
        <div class="vp">
          <p class="vp-q">Which diagram fits these three?</p>
          <div class="vp-cats">${r.cats.map(c => `<span class="vp-cat">${c}</span>`).join('')}</div>
          <div class="vp-opts" id="vpOpts">
            ${keys.map(k => `<button class="vp-opt" data-k="${k}">
                <svg viewBox="0 0 150 110">${TEMPLATES[k].draw()}</svg>
                <span>${TEMPLATES[k].name}</span></button>`).join('')}
          </div>
          <div class="vp-fb" id="vpFb"></div>
        </div>`;
      el.querySelectorAll('.vp-opt').forEach(b => b.onclick = () => pick(b.dataset.k));
    };

    const pick = k => {
      if (chosen) return;
      chosen = k; attempts++;
      const r = rounds[at];
      const ok = k === r.tpl;
      if (ok) right++;
      el.querySelectorAll('.vp-opt').forEach(b => {
        b.disabled = true;
        if (b.dataset.k === r.tpl) b.classList.add('is-right');
        if (b.dataset.k === k && !ok) b.classList.add('is-wrong');
      });
      el.querySelector('#vpFb').innerHTML = `
        <div class="vp-note ${ok ? 'is-ok' : 'is-no'}">
          <b>${TEMPLATES[r.tpl].name}.</b> ${r.why}</div>
        <button class="btn vp-next" id="vpGo">${at + 1 < rounds.length ? 'Next triple →' : 'See result'}</button>`;
      el.querySelector('#vpGo').onclick = () => { at++; chosen = null; render(); };
      api.report?.({ at, right, attempts, finished: false });
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}
