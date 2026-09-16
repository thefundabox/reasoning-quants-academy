/* ============================================================
   Seat board — place people, test clues live.

   Three layouts share one engine:
     row    — seats left to right, facing North (away) or South (towards you)
     circle — seats round a table, facing in or out
     stack  — floors, 1 at the bottom

   THE CIRCLE CONVENTION, derived rather than remembered:
   sit at the north seat facing the centre and you are facing South.
   Facing South your left hand points East, and north → east is the
   CLOCKWISE way round the table. So facing the centre, left is
   clockwise. Facing outward, everything reverses.
   ============================================================ */

/** Helpers handed to every clue test, already bound to this board's geometry. */
export function helpersFor({ type, n, facing }) {
  // Guard every helper: clue tests chain them (right(right(x))) and an unplaced
  // person must propagate as "no seat", never as seat 0 via null + 1.
  const ok = i => i != null && Number.isInteger(i) && i >= 0 && i < n;
  const cw = i => (ok(i) ? (i + 1) % n : null);        // next seat clockwise on screen
  const acw = i => (ok(i) ? (i - 1 + n) % n : null);
  const inward = facing === 'in';

  if (type === 'circle') return {
    n, type, facing,
    left:  i => (inward ? cw : acw)(i),
    right: i => (inward ? acw : cw)(i),
    opposite: i => (ok(i) && n % 2 === 0) ? (i + n / 2) % n : null,
    adjacent: (i, j) => ok(i) && ok(j) && (cw(i) === j || acw(i) === j),
    isEnd: () => false,
  };

  if (type === 'stack') return {
    n, type, facing,
    above: i => (ok(i) && i + 1 <= n - 1) ? i + 1 : null,
    below: i => (ok(i) && i - 1 >= 0) ? i - 1 : null,
    adjacent: (i, j) => ok(i) && ok(j) && Math.abs(i - j) === 1,
    isEnd: i => ok(i) && (i === 0 || i === n - 1),
    left: () => null, right: () => null, opposite: () => null,
  };

  // row: screen index 0 is the viewer's left
  const facingAway = facing === 'N';
  return {
    n, type, facing,
    left:  i => { if (!ok(i)) return null; const k = facingAway ? i - 1 : i + 1; return ok(k) ? k : null; },
    right: i => { if (!ok(i)) return null; const k = facingAway ? i + 1 : i - 1; return ok(k) ? k : null; },
    adjacent: (i, j) => ok(i) && ok(j) && Math.abs(i - j) === 1,
    opposite: () => null,
    isEnd: i => ok(i) && (i === 0 || i === n - 1),
  };
}

/* Scripted-action surface — see turnDialMachine in compass.js.
   Two taps place a person: pick up a chip, then tap a seat. `key` leaves the
   touch counter out of a state's identity, so the walk converges on the
   arrangements that exist rather than on the paths that reach them. */
export function seatBoardMachine({ type = 'row', n = 5, people = [], facing = 'N',
                                   clues = [], seed = {} } = {}) {
  const H = helpersFor({ type, n, facing });
  const whoAt = (pos, i) => Object.keys(pos).find(p => pos[p] === i);
  const safe = (test, pos) => { try { return !!test(pos, H); } catch { return false; } };

  return {
    init: { pos: { ...seed }, sel: null, touched: 0 },
    key: st => JSON.stringify([Object.entries(st.pos).sort(), st.sel]),
    actions: [...people.map(p => `c:${p}`), ...[...Array(n).keys()].map(i => `s:${i}`), 'reset'],
    act(st, a) {
      if (a === 'reset') return { pos: {}, sel: null, touched: st.touched + 1 };
      const pos = { ...st.pos };
      if (a[0] === 'c') {                       // tap a person's chip
        const p = a.slice(2);
        if (pos[p] !== undefined) { delete pos[p]; return { pos, sel: null, touched: st.touched + 1 }; }
        return { ...st, sel: st.sel === p ? null : p };
      }
      const i = +a.slice(2), occupant = whoAt(pos, i);
      if (!st.sel) {                            // tapping a seat with nobody in hand clears it
        if (!occupant) return st;
        delete pos[occupant];
        return { pos, sel: null, touched: st.touched + 1 };
      }
      if (occupant) delete pos[occupant];
      pos[st.sel] = i;
      return { pos, sel: null, touched: st.touched + 1 };
    },
    report(st) {
      const placedAll = people.every(p => st.pos[p] !== undefined);
      const ok = clues.map(c => safe(c.test, st.pos)).filter(Boolean).length;
      return { pos: { ...st.pos }, placedAll, solved: placedAll && ok === clues.length,
               touched: st.touched, cluesOk: ok, cluesTotal: clues.length, type, facing };
    },
  };
}

export function seatBoard(cfg = {}) {
  const { type = 'row', n = 5, people = [], facing = 'N', clues = [] } = cfg;
  const M = seatBoardMachine(cfg);
  const H = helpersFor({ type, n, facing });
  return (el, api = {}) => {
    let st = M.init;

    el.innerHTML = `
      <div class="sb">
        <div class="sb-stage"><svg id="sbSvg" viewBox="0 0 520 ${type === 'stack' ? 330 : type === 'circle' ? 340 : 220}"
             class="sb-svg" role="img" aria-label="Seating board"></svg></div>
        <div class="sb-chips" id="sbChips"></div>
        <ul class="sb-clues" id="sbClues"></ul>
        <div class="sb-foot"><button class="btn btn--ghost sb-reset" id="sbReset">Clear the board</button>
          <span class="sb-status" id="sbStatus"></span></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    const whoAt = i => Object.keys(st.pos).find(p => st.pos[p] === i);

    const seatXY = i => {
      if (type === 'circle') {
        const ang = (-90 + i * 360 / n) * Math.PI / 180;
        return [260 + Math.cos(ang) * 118, 168 + Math.sin(ang) * 118];
      }
      if (type === 'stack') return [260, 296 - i * (256 / Math.max(n - 1, 1))];
      const gap = Math.min(86, 440 / Math.max(n - 1, 1));
      return [260 - (n - 1) * gap / 2 + i * gap, 112];
    };

    const draw = () => {
      let s = '';
      if (type === 'circle')
        s += `<circle class="sb-table" cx="260" cy="168" r="66"/>
              <text class="sb-tablab" x="260" y="164" text-anchor="middle">TABLE</text>
              <text class="sb-tablab" x="260" y="180" text-anchor="middle">${facing === 'in' ? 'all facing in' : 'all facing out'}</text>`;
      else if (type === 'row')
        s += `<line class="sb-floor" x1="30" y1="160" x2="490" y2="160"/>
              <text class="sb-axis" x="30" y="192">← your left</text>
              <text class="sb-axis" x="490" y="192" text-anchor="end">your right →</text>
              <text class="sb-axis sb-axis--their" x="30" y="34">${facing === 'N' ? '← their left' : '← their right'}</text>
              <text class="sb-axis sb-axis--their" x="490" y="34" text-anchor="end">${facing === 'N' ? 'their right →' : 'their left →'}</text>`;

      for (let i = 0; i < n; i++) {
        const [x, y] = seatXY(i);
        const who = whoAt(i);
        if (type === 'stack') {
          s += `<g class="sb-seat ${who ? 'is-filled' : ''}" data-i="${i}">
                  <rect class="sb-floorbox" x="${x - 118}" y="${y - 20}" width="236" height="38" rx="9"/>
                  <text class="sb-floornum" x="${x - 100}" y="${y + 5}">Floor ${i + 1}</text>
                  <text class="sb-who" x="${x + 40}" y="${y + 6}" text-anchor="middle">${who || '—'}</text>
                </g>`;
        } else {
          const nose = type === 'circle'
            ? noseFor(i, x, y)
            : (facing === 'N'
                ? `M ${x - 7} ${y - 30} L ${x} ${y - 39} L ${x + 7} ${y - 30}`
                : `M ${x - 7} ${y + 30} L ${x} ${y + 39} L ${x + 7} ${y + 30}`);
          s += `<g class="sb-seat ${who ? 'is-filled' : ''}" data-i="${i}">
                  <circle class="sb-chair" cx="${x}" cy="${y}" r="23"/>
                  <text class="sb-who" x="${x}" y="${y + 6}" text-anchor="middle">${who || i + 1}</text>
                  <path class="sb-nose" d="${nose}"/>
                </g>`;
        }
      }
      $('sbSvg').innerHTML = s;
      el.querySelectorAll('.sb-seat').forEach(g =>
        g.onclick = () => { st = M.act(st, `s:${g.dataset.i}`); draw(); });

      $('sbChips').innerHTML = people.map(p =>
        `<button class="sb-chip ${st.pos[p] !== undefined ? 'is-placed' : ''} ${st.sel === p ? 'is-sel' : ''}"
                 data-p="${p}">${p}</button>`).join('');
      el.querySelectorAll('.sb-chip').forEach(b =>
        b.onclick = () => { st = M.act(st, `c:${b.dataset.p}`); draw(); });

      const r = M.report(st);
      $('sbClues').innerHTML = clues.map(c =>
        `<li class="${safe(c.test) ? 'is-ok' : 'is-no'}"><span class="sb-mark"></span>${c.text}</li>`).join('');

      $('sbStatus').innerHTML = r.solved
        ? `<b class="sb-win">Solved — every clue holds.</b>`
        : r.placedAll ? `${r.cluesOk} of ${r.cluesTotal} clues satisfied`
                      : `${people.length - Object.keys(r.pos).length} still standing`;

      api.report?.(r);
    };

    const noseFor = (i, x, y) => {
      const ang = (-90 + i * 360 / n) * Math.PI / 180;
      const dir = facing === 'in' ? -1 : 1;                 // toward centre, or away
      const nx = x + Math.cos(ang) * 31 * dir, ny = y + Math.sin(ang) * 31 * dir;
      const px = -Math.sin(ang) * 7, py = Math.cos(ang) * 7;
      const bx = x + Math.cos(ang) * 23 * dir, by = y + Math.sin(ang) * 23 * dir;
      return `M ${bx + px} ${by + py} L ${nx} ${ny} L ${bx - px} ${by - py}`;
    };

    const safe = test => { try { return !!test(st.pos, H); } catch { return false; } };

    $('sbReset').onclick = () => { st = M.act(st, 'reset'); draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/** Non-interactive board showing a finished arrangement, for reveal steps. */
export function solvedBoard({ type = 'row', n = 5, facing = 'N', pos = {} }) {
  return el => {
    const mount = seatBoard({ type, n, facing, people: Object.keys(pos), seed: pos, clues: [] });
    const inst = mount(el, {});
    el.querySelectorAll('.sb-chips, .sb-foot, .sb-clues').forEach(x => x.remove());
    el.querySelectorAll('.sb-seat').forEach(g => g.onclick = null);
    return inst;
  };
}
