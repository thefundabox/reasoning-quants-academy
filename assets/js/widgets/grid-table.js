/* ============================================================
   Elimination grid — the tool that cracks scheduling puzzles.

   Click a cell to cycle blank → ✓ → ✗. Setting a ✓ automatically
   crosses out the rest of that row and column, because each person
   takes exactly one option and each option belongs to one person.
   That auto-propagation IS the technique: most candidates lose marks
   by forgetting to cross out, not by reasoning badly.
   ============================================================ */

/* Scripted-action surface — see turnDialMachine in compass.js.
   One action per cell, cycling blank → ✓ → ✗, and the auto-crossing that a ✓
   triggers happens here rather than in the click handler — it is the technique
   the lesson teaches, so it belongs in the part the harness can walk.
   `key` drops the auto-cross tally from a grid's identity, the way the seat
   board drops its touch count. */
export function gridTableMachine({ rows = [], cols = [], solution = null } = {}) {
  const blank = () => rows.map(() => cols.map(() => 0));
  return {
    init: { grid: blank(), autoCount: 0 },
    key: st => JSON.stringify(st.grid),
    actions: rows.flatMap((_, r) => cols.map((__, c) => `${r},${c}`)).concat('clear'),
    act(st, a) {
      if (a === 'clear') return { grid: blank(), autoCount: 0 };
      const [r, c] = a.split(',').map(Number);
      const grid = st.grid.map(row => row.slice());
      const v = (grid[r][c] + 1) % 3;
      grid[r][c] = v;
      let auto = st.autoCount;
      if (v === 1) {                     // one option per person, one person per option
        cols.forEach((_, ci) => { if (ci !== c && grid[r][ci] !== 1) { if (grid[r][ci] !== 2) auto++; grid[r][ci] = 2; } });
        rows.forEach((_, ri) => { if (ri !== r && grid[ri][c] !== 1) { if (grid[ri][c] !== 2) auto++; grid[ri][c] = 2; } });
      }
      return { grid, autoCount: auto };
    },
    report(st) {
      const complete = rows.every((_, ri) => st.grid[ri].some(v => v === 1));
      return {
        state: st.grid.map(r => r.slice()),
        ticks: st.grid.flat().filter(v => v === 1).length,
        complete,
        correct: solution && complete
          ? rows.every((r, ri) => cols[st.grid[ri].indexOf(1)] === solution[r])
          : null,
        usedAuto: st.autoCount > 0, autoCount: st.autoCount,
      };
    },
  };
}

export function gridTable(cfg = {}) {
  const { rows = [], cols = [], title = '', clues = [] } = cfg;
  const M = gridTableMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="gt">
        ${title ? `<p class="gt-title">${title}</p>` : ''}
        ${clues.length ? `<ul class="gt-clues">${clues.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
        <div class="gt-wrap"><table class="gt-table" id="gtTable"></table></div>
        <div class="gt-foot">
          <button class="btn btn--ghost gt-btn" id="gtClear">Clear grid</button>
          <span class="gt-status" id="gtStatus"></span>
        </div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const paint = () => {
      $('gtTable').innerHTML = `
        <thead><tr><th class="gt-corner"></th>
          ${cols.map(c => `<th class="gt-col">${c}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((r, ri) => `
          <tr><th class="gt-row">${r}</th>
            ${cols.map((_, ci) => {
              const v = st.grid[ri][ci];
              return `<td><button class="gt-cell ${v === 1 ? 'is-tick' : v === 2 ? 'is-cross' : ''}"
                        data-r="${ri}" data-c="${ci}"
                        aria-label="${rows[ri]} / ${cols[ci]}">${v === 1 ? '✓' : v === 2 ? '✗' : ''}</button></td>`;
            }).join('')}
          </tr>`).join('')}</tbody>`;

      el.querySelectorAll('.gt-cell').forEach(b =>
        b.onclick = () => { st = M.act(st, `${b.dataset.r},${b.dataset.c}`); paint(); });

      const r = M.report(st);
      $('gtStatus').innerHTML = r.complete
        ? (r.correct === null ? `Grid complete.`
           : r.correct ? `<b class="gt-win">Every row placed correctly.</b>`
                       : `<b class="gt-no">Grid is full, but at least one row is wrong.</b>`)
        : `${r.ticks} of ${rows.length} rows decided`;

      api.report?.(r);
    };

    $('gtClear').onclick = () => { st = M.act(st, 'clear'); paint(); };

    paint();
    return { destroy() { el.innerHTML = ''; } };
  };
}
