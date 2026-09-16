/* ============================================================
   Count lab — the manipulables behind Unit 6.

   Counting is the one topic where a formula can be memorised and
   still not believed. So every widget here ENUMERATES the space it
   is talking about and counts what it finds. nCr is not asserted;
   it is what remains after the duplicates are struck out, on screen.

     slotFiller()   — one slot per decision; the product, with the
                      outcomes listed while they still fit
     permComb()     — the same n and r shown twice: every ordering,
                      then those orderings grouped into selections,
                      so the r! division is visible rather than told
     sampleSpace()  — dice, coins and cards, with an event picked and
                      the favourable outcomes highlighted in place

   If a formula and an enumeration ever disagree here, the harness
   fails — which is the only way to be sure the lesson is right.
   ============================================================ */

/* ---------------- pure counting (exported for the harness) ---------------- */

export const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
export const nPr = (n, r) => (r > n ? 0 : fact(n) / fact(n - r));
export const nCr = (n, r) => (r > n ? 0 : nPr(n, r) / fact(r));

/** Every ordered selection of r from a list — the thing nPr counts. */
export function permsOf(arr, r) {
  if (r === 0) return [[]];
  const out = [];
  arr.forEach((x, i) => permsOf(arr.filter((_, j) => j !== i), r - 1).forEach(p => out.push([x, ...p])));
  return out;
}

/** Every unordered selection of r — the thing nCr counts. */
export function combsOf(arr, r) {
  if (r === 0) return [[]];
  if (arr.length < r) return [];
  const [h, ...t] = arr;
  return [...combsOf(t, r - 1).map(c => [h, ...c]), ...combsOf(t, r)];
}

/** Distinct arrangements of a word: n! divided by the factorial of each repeat. */
export function wordArrangements(word) {
  const c = {};
  [...word].forEach(ch => { c[ch] = (c[ch] || 0) + 1; });
  return {
    total: fact(word.length) / Object.values(c).reduce((a, k) => a * fact(k), 1),
    counts: c,
    divisor: Object.values(c).reduce((a, k) => a * fact(k), 1),
  };
}

export const twoDice = () => {
  const o = [];
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) o.push([a, b]);
  return o;
};

export const coinFlips = n => {
  const o = [];
  for (let m = 0; m < 2 ** n; m++)
    o.push([...Array(n)].map((_, i) => (m & (1 << i)) ? 'H' : 'T'));
  return o;
};

export const SUITS = [{ k: 'H', sym: '♥', red: true }, { k: 'D', sym: '♦', red: true },
                      { k: 'C', sym: '♣', red: false }, { k: 'S', sym: '♠', red: false }];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const deck = () => SUITS.flatMap(s => RANKS.map(r => ({ suit: s.k, sym: s.sym, red: s.red, rank: r })));

/** Reduce a fraction, so probabilities print the way an examiner writes them. */
export function frac(num, den) {
  const g = (a, b) => (b ? g(b, a % b) : a);
  const d = g(num, den) || 1;
  return { n: num / d, d: den / d, text: `${num / d}/${den / d}` };
}

/* ---------------- slots ---------------- */
export function slotFiller(cfg) {
  const { slots = [], maxList = 36, label = '' } = cfg;

  return (el, api = {}) => {
    const counts = slots.map(s => s.start ?? s.options.length);

    el.innerHTML = `
      <div class="ct">
        <p class="ct-lab">${label || 'One slot per decision — set how many choices each has'}</p>
        <div class="ct-slots" id="sfSlots"></div>
        <div class="ct-product" id="sfProd"></div>
        <div class="ct-list" id="sfList"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const total = counts.reduce((a, b) => a * b, 1);

      $('sfSlots').innerHTML = slots.map((s, i) => `
        <div class="ct-slot">
          <span class="ct-slot-name">${s.name}</span>
          <input class="ct-slot-range" type="range" min="1" max="${s.options.length}" value="${counts[i]}"
                 data-i="${i}" aria-label="Choices for ${s.name}">
          <span class="ct-slot-n"><b>${counts[i]}</b></span>
        </div>`).join('');

      $('sfProd').innerHTML = `
        <span>Total ways</span>
        <b>${counts.join(' × ')} = ${total.toLocaleString('en-IN')}</b>
        <em>multiply, because every choice can pair with every other</em>`;

      if (total <= maxList) {
        const rows = [];
        const build = (i, acc) => {
          if (i === slots.length) return rows.push(acc.join(' · '));
          for (let k = 0; k < counts[i]; k++) build(i + 1, [...acc, slots[i].options[k]]);
        };
        build(0, []);
        $('sfList').innerHTML = `<p class="ct-lab">All ${rows.length} of them, listed</p>
          <div class="ct-chips">${rows.map(r => `<span class="ct-chip">${r}</span>`).join('')}</div>`;
      } else {
        $('sfList').innerHTML = `<div class="ct-toomany">
          <b>${total.toLocaleString('en-IN')}</b> outcomes — too many to list, which is exactly why
          you multiply instead of counting.</div>`;
      }

      api.report?.({
        counts: [...counts], total, listed: total <= maxList,
        allMaxed: counts.every((c, i) => c === slots[i].options.length),
        anyOne: counts.some(c => c === 1),
      });
    };

    el.addEventListener('input', e => {
      const r = e.target.closest('.ct-slot-range');
      if (!r) return;
      counts[+r.dataset.i] = +r.value;
      draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- permutations beside combinations ---------------- */
export function permComb(cfg) {
  const { items = ['A', 'B', 'C', 'D'], startR = 2, maxR = 3 } = cfg;

  return (el, api = {}) => {
    let r = startR, mode = 'perm';
    const seen = new Set(['perm']);

    el.innerHTML = `
      <div class="ct">
        <div class="ct-modes">
          <button class="ct-mode is-on" data-m="perm">Order matters (arrangements)</button>
          <button class="ct-mode" data-m="comb">Order does not (selections)</button>
        </div>
        <label class="ct-lab2">Choose how many
          <input id="pcR" type="range" min="1" max="${maxR}" value="${r}" aria-label="How many to choose">
          <span id="pcRv"></span></label>
        <div class="ct-product" id="pcProd"></div>
        <div class="ct-list" id="pcList"></div>
        <div class="ct-note" id="pcNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const n = items.length;
      const perms = permsOf(items, r);
      const combs = combsOf(items, r);
      $('pcRv').textContent = r + ' of ' + n;

      const showing = mode === 'perm' ? perms : combs;
      const formula = mode === 'perm'
        ? `${n}P${r} = ${n}! ÷ ${n - r}! = <b>${nPr(n, r)}</b>`
        : `${n}C${r} = ${n}P${r} ÷ ${r}! = ${nPr(n, r)} ÷ ${fact(r)} = <b>${nCr(n, r)}</b>`;

      $('pcProd').innerHTML = `
        <span>${mode === 'perm' ? 'Arrangements' : 'Selections'}</span>
        <b>${showing.length}</b>
        <em>${formula}</em>`;

      // in combination mode, group the orderings that collapse into one selection
      $('pcList').innerHTML = mode === 'perm'
        ? `<div class="ct-chips">${perms.map(p => `<span class="ct-chip">${p.join('')}</span>`).join('')}</div>`
        : `<div class="ct-groups">${combs.map(c => {
            const same = perms.filter(p => [...p].sort().join('') === [...c].sort().join(''));
            return `<div class="ct-group">
              <b class="ct-keep">${c.join('')}</b>
              <span class="ct-struck">${same.filter(p => p.join('') !== c.join(''))
                .map(p => p.join('')).join(' ')}</span></div>`;
          }).join('')}</div>`;

      $('pcNote').innerHTML = mode === 'perm'
        ? `Every one of these ${perms.length} is a different <b>order</b>. If the order does not
           matter — a committee, a handshake, a set of cards — most of them are the same thing
           written differently.`
        : `Each row is one selection. The struck-through entries are the <b>${fact(r)}
           ${fact(r) === 1 ? 'ordering' : 'orderings'}</b> of that same group, which is why you
           divide ${nPr(n, r)} by ${r}! to get <b>${nCr(n, r)}</b>.`;

      api.report?.({
        n, r, mode,
        perms: perms.length, combs: combs.length,
        ratio: perms.length / combs.length,
        matchesFormula: perms.length === nPr(n, r) && combs.length === nCr(n, r),
        ratioIsRFactorial: Math.abs(perms.length / combs.length - fact(r)) < 1e-9,
        sawBoth: seen.size === 2,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.ct-mode');
      if (!b) return;
      mode = b.dataset.m; seen.add(mode);
      el.querySelectorAll('.ct-mode').forEach(x => x.classList.toggle('is-on', x === b));
      draw();
    });
    $('pcR').oninput = e => { r = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- the three sample spaces ---------------- */
export function sampleSpace(cfg) {
  const { space = 'dice', events = [] } = cfg;

  return (el, api = {}) => {
    let at = 0;
    const seen = new Set([0]);

    el.innerHTML = `
      <div class="ct">
        <p class="ct-lab">Pick an event and watch it picked out of the whole space</p>
        <div class="ct-modes" id="ssEv"></div>
        <div class="ct-space" id="ssSpace"></div>
        <div class="ct-product" id="ssProd"></div>
        <div class="ct-note" id="ssNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const outcomes = space === 'dice' ? twoDice()
      : space === 'coins' ? coinFlips(3)
      : deck();

    const render = o => {
      if (space === 'dice') return `${o[0]}·${o[1]}`;
      if (space === 'coins') return o.join('');
      return `${o.rank}${o.sym}`;
    };

    const draw = () => {
      const ev = events[at];
      const hit = outcomes.map(o => !!ev.test(o));
      const fav = hit.filter(Boolean).length;
      const f = frac(fav, outcomes.length);

      $('ssEv').innerHTML = events.map((e, i) =>
        `<button class="ct-mode ${i === at ? 'is-on' : ''}" data-i="${i}">${e.label}</button>`).join('');

      $('ssSpace').innerHTML = `<div class="ct-cells ct-cells--${space}">
        ${outcomes.map((o, i) => `<span class="ct-cellx ${hit[i] ? 'is-hit' : ''}
          ${space === 'cards' && o.red ? 'is-red' : ''}">${render(o)}</span>`).join('')}</div>`;

      $('ssProd').innerHTML = `
        <span>Probability</span>
        <b>${fav} / ${outcomes.length} = ${f.text}</b>
        <em>favourable outcomes over every outcome — both counted, neither guessed</em>`;

      $('ssNote').innerHTML = ev.note || `The whole space is <b>${outcomes.length}</b> outcomes, and
        <b>${fav}</b> of them satisfy the event. Nothing here is a formula — it is a count.`;

      api.report?.({
        space, event: ev.label, at, favourable: fav, total: outcomes.length,
        fraction: f.text, seen: seen.size, total_events: events.length,
        seenAll: seen.size === events.length,
        matchesStated: ev.expect === undefined || ev.expect === fav,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.ct-mode');
      if (!b) return;
      at = +b.dataset.i; seen.add(at); draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
