/* ============================================================
   Number lab — the manipulables behind Unit 1 · Number Sense.

     divisibilityTester() — apply the real tests to a real number;
                            every verdict is checked against n % d
     factorGrid()         — prime-factorise two numbers and read HCF
                            and LCM straight off the shared factors
     benchmarkTable()     — the fraction ⇄ percent conversions, with
                            the division actually performed
     estimateLab()        — round, compute, then see the true value
                            and your error
     powerGrid()          — squares and cubes laid out so the last
                            digit and the gaps become visible

   Every number below is computed. A test that "passes" has been
   checked against the remainder; an HCF is read from the factor
   multiset, not stored. So the lab can never teach a wrong rule.
   ============================================================ */

/* ---------------- pure arithmetic (exported for the harness) ---------------- */

export const digits = n => String(Math.abs(n)).split('').map(Number);

/** The alternating digit sum, from the units end — the 11 test. */
export const altSum = n => digits(n).reverse()
  .reduce((s, d, i) => s + (i % 2 ? -d : d), 0);

/** Last k digits as a number — the 4 and 8 tests. */
export const lastK = (n, k) => Math.abs(n) % 10 ** k;

/**
 * The standard tests. Each carries the working it shows AND its own verdict,
 * which the caller must be able to confirm with a plain remainder.
 */
export function divisibilityChecks(n) {
  const ds = digits(n), sum = ds.reduce((a, b) => a + b, 0);
  const mk = (by, rule, working, passes) => ({ by, rule, working, passes, truth: n % by === 0 });
  return [
    mk(2, 'the last digit is even', `last digit ${ds[ds.length - 1]}`, ds[ds.length - 1] % 2 === 0),
    mk(3, 'the digit sum divides by 3', `${ds.join(' + ')} = ${sum}`, sum % 3 === 0),
    mk(4, 'the last two digits divide by 4', `last two = ${lastK(n, 2)}`, lastK(n, 2) % 4 === 0),
    mk(6, 'it passes both 2 and 3', `even? ${ds[ds.length - 1] % 2 === 0 ? 'yes' : 'no'} · digit sum ${sum}`,
      ds[ds.length - 1] % 2 === 0 && sum % 3 === 0),
    mk(8, 'the last three digits divide by 8', `last three = ${lastK(n, 3)}`, lastK(n, 3) % 8 === 0),
    mk(9, 'the digit sum divides by 9', `${ds.join(' + ')} = ${sum}`, sum % 9 === 0),
    mk(11, 'the alternating digit sum divides by 11',
      `${digits(n).reverse().map((d, i) => (i % 2 ? '−' : '+') + d).join(' ')} = ${altSum(n)}`,
      altSum(n) % 11 === 0),
  ];
}

/** { prime: exponent } */
export function primeFactors(n) {
  const f = {};
  let x = Math.abs(n);
  for (let p = 2; p * p <= x; p++) while (x % p === 0) { f[p] = (f[p] || 0) + 1; x /= p; }
  if (x > 1) f[x] = (f[x] || 0) + 1;
  return f;
}

export const factorString = n => {
  const f = primeFactors(n);
  return Object.keys(f).map(p => f[p] > 1 ? `${p}<sup>${f[p]}</sup>` : p).join(' × ') || '1';
};

/** HCF takes the lower exponent of every shared prime; LCM takes the higher of all. */
export function hcfLcm(a, b) {
  const fa = primeFactors(a), fb = primeFactors(b);
  const primes = [...new Set([...Object.keys(fa), ...Object.keys(fb)])].map(Number).sort((x, y) => x - y);
  let hcf = 1, lcm = 1;
  const rows = primes.map(p => {
    const ea = fa[p] || 0, eb = fb[p] || 0;
    hcf *= p ** Math.min(ea, eb);
    lcm *= p ** Math.max(ea, eb);
    return { p, ea, eb, low: Math.min(ea, eb), high: Math.max(ea, eb) };
  });
  return { hcf, lcm, rows, product: a * b };
}

export const pct = (num, den) => num / den * 100;
export const round2 = n => Math.round(n * 100) / 100;
export const fmt = n => {
  const r = round2(n);
  return Number.isInteger(r) ? r.toLocaleString('en-IN') : r.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

/* ---------------- divisibility tester ---------------- */
export function divisibilityTester(cfg) {
  const { numbers = [4728, 5643, 9152, 2079], start = 0 } = cfg;

  return (el, api = {}) => {
    let at = start;
    const seen = new Set([start]);
    const passedSomething = new Set();

    el.innerHTML = `
      <div class="nl">
        <p class="nl-lab">Pick a number and watch every test run on it</p>
        <div class="nl-picks" id="nlPicks"></div>
        <div class="nl-big" id="nlBig"></div>
        <div class="nl-tests" id="nlTests"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const n = numbers[at];
      const checks = divisibilityChecks(n);
      checks.forEach(c => { if (c.passes) passedSomething.add(c.by); });

      $('nlPicks').innerHTML = numbers.map((x, i) =>
        `<button class="nl-pick ${i === at ? 'is-on' : ''} ${seen.has(i) ? 'is-seen' : ''}"
                 data-i="${i}">${x.toLocaleString('en-IN')}</button>`).join('');

      $('nlBig').innerHTML = digits(n).map(d => `<span class="nl-digit">${d}</span>`).join('');

      $('nlTests').innerHTML = checks.map(c => `
        <div class="nl-test ${c.passes ? 'is-ok' : 'is-no'}">
          <span class="nl-by">${c.by}</span>
          <span class="nl-rule"><b>${c.rule}</b><em>${c.working}</em></span>
          <span class="nl-flag">${c.passes ? 'divides' : 'does not'}</span>
        </div>`).join('');

      api.report?.({
        n, at, seen: seen.size, total: numbers.length,
        seenAll: seen.size === numbers.length,
        passes: checks.filter(c => c.passes).map(c => c.by),
        passCount: checks.filter(c => c.passes).length,
        // the honest invariant: a shown verdict always matches the remainder
        allVerdictsTrue: checks.every(c => c.passes === c.truth),
        found11: checks.find(c => c.by === 11).passes,
        foundNoneBut2: checks.filter(c => c.passes).length <= 1,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.nl-pick');
      if (!b) return;
      at = +b.dataset.i; seen.add(at); draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- factor grid: HCF and LCM ---------------- */
export function factorGrid(cfg) {
  const { pairs = [[12, 18], [24, 36], [15, 25]], start = 0 } = cfg;

  return (el, api = {}) => {
    let at = start;
    const seen = new Set([start]);

    el.innerHTML = `
      <div class="nl">
        <p class="nl-lab">Two numbers, broken into primes</p>
        <div class="nl-picks" id="fgPicks"></div>
        <div class="nl-fg" id="fgBody"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const [a, b] = pairs[at];
      const { hcf, lcm, rows, product } = hcfLcm(a, b);

      $('fgPicks').innerHTML = pairs.map((p, i) =>
        `<button class="nl-pick ${i === at ? 'is-on' : ''} ${seen.has(i) ? 'is-seen' : ''}"
                 data-i="${i}">${p[0]} &amp; ${p[1]}</button>`).join('');

      $('fgBody').innerHTML = `
        <div class="nl-fline"><span>${a}</span><b>${factorString(a)}</b></div>
        <div class="nl-fline"><span>${b}</span><b>${factorString(b)}</b></div>
        <table class="nl-tab">
          <tr><th>prime</th><th>in ${a}</th><th>in ${b}</th><th>HCF takes</th><th>LCM takes</th></tr>
          ${rows.map(r => `<tr>
            <td class="nl-p">${r.p}</td><td>${r.ea}</td><td>${r.eb}</td>
            <td class="nl-low">${r.low}</td><td class="nl-high">${r.high}</td></tr>`).join('')}
        </table>
        <div class="nl-out">
          <div class="nl-out-c nl-out-c--hcf"><span>HCF</span><b>${hcf}</b><em>lower power of shared primes</em></div>
          <div class="nl-out-c nl-out-c--lcm"><span>LCM</span><b>${lcm}</b><em>higher power of every prime</em></div>
        </div>
        <div class="nl-check">HCF × LCM = ${hcf} × ${lcm} = <b>${hcf * lcm}</b>,
          and ${a} × ${b} = <b>${product}</b> — always equal, for any two numbers.</div>`;

      api.report?.({
        a, b, hcf, lcm, at, seen: seen.size, total: pairs.length,
        seenAll: seen.size === pairs.length,
        identityHolds: hcf * lcm === product,
        coprime: hcf === 1,
        oneDividesOther: a % b === 0 || b % a === 0,
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.nl-pick');
      if (!b) return;
      at = +b.dataset.i; seen.add(at); draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- fraction ⇄ percent bench ---------------- */
export function benchmarkTable(cfg) {
  const { fractions = [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 8], [2, 3], [3, 4], [3, 8], [5, 8]] } = cfg;

  return (el, api = {}) => {
    const revealed = new Set();

    el.innerHTML = `
      <div class="nl">
        <p class="nl-lab">Guess before you flip — then check the division</p>
        <div class="nl-cards" id="btCards"></div>
        <div class="nl-note" id="btNote">Flip them all. The ones ending in .5 or .25 are the ones worth owning.</div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      $('btCards').innerHTML = fractions.map(([n, d], i) => {
        const p = pct(n, d);
        const shown = revealed.has(i);
        return `<button class="nl-card ${shown ? 'is-open' : ''}" data-i="${i}">
          <b>${n}<i>/</i>${d}</b>
          <span>${shown ? `${fmt(p)}%` : 'tap'}</span>
          ${shown ? `<em>${n} ÷ ${d} × 100</em>` : ''}
        </button>`;
      }).join('');

      const exact = fractions.filter(([n, d]) => Number.isInteger(pct(n, d))).length;
      $('btNote').innerHTML = revealed.size === fractions.length
        ? `<b>${exact} of ${fractions.length}</b> come out as whole percentages. The recurring ones —
           1/3 and 1/6 — are exactly why examiners choose thirds when they want you to waste time.`
        : `Flipped ${revealed.size} of ${fractions.length}.`;

      api.report?.({
        revealed: revealed.size, total: fractions.length,
        revealedAll: revealed.size === fractions.length,
        values: fractions.map(([n, d]) => round2(pct(n, d))),
      });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.nl-card');
      if (!b) return;
      revealed.add(+b.dataset.i); draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- estimate first, compute second ---------------- */
export function estimateLab(cfg) {
  const { rounds = [] } = cfg;

  return (el, api = {}) => {
    let at = 0, locked = false, hits = 0;

    el.innerHTML = `
      <div class="nl">
        <p class="nl-q" id="elQ"></p>
        <div class="nl-round" id="elRound"></div>
        <div class="nl-estrow">
          <input class="nl-in" id="elIn" type="text" inputmode="decimal" placeholder="your estimate" autocomplete="off">
          <button class="btn" id="elGo">Check it</button>
        </div>
        <div class="nl-verdict" id="elV"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const show = () => {
      const r = rounds[at];
      locked = false;
      $('elQ').innerHTML = r.q;
      $('elRound').innerHTML = r.hint
        ? `<span class="nl-hint-lab">Round it first</span><b>${r.hint}</b>` : '';
      $('elIn').value = ''; $('elIn').disabled = false;
      $('elGo').textContent = 'Check it'; $('elGo').disabled = false;
      $('elV').innerHTML = '';
    };

    $('elGo').onclick = () => {
      const r = rounds[at];
      if (locked) {
        at++;
        if (at >= rounds.length) {
          $('elQ').innerHTML = `<b>Done — ${hits} of ${rounds.length} within ${r.tol || 10}%.</b>`;
          $('elRound').innerHTML = ''; $('elIn').disabled = true; $('elGo').disabled = true;
          $('elV').innerHTML = `<div class="nl-done">An estimate you trust turns four options into one.</div>`;
          return api.report?.({ round: rounds.length, hits, total: rounds.length, finished: true });
        }
        return show();
      }
      const guess = parseFloat($('elIn').value);
      if (Number.isNaN(guess)) return;
      locked = true;
      const tol = r.tol || 10;
      const err = Math.abs(guess - r.exact) / Math.abs(r.exact) * 100;
      const win = err <= tol;
      if (win) hits++;
      $('elIn').disabled = true;
      $('elV').className = 'nl-verdict ' + (win ? 'is-ok' : 'is-no');
      $('elV').innerHTML = `
        <b>${win ? `Within ${fmt(err)}%` : `Off by ${fmt(err)}%`}</b>
        <p>Exact answer <b>${fmt(r.exact)}</b>. ${r.why}</p>`;
      $('elGo').textContent = at + 1 >= rounds.length ? 'See result' : 'Next';
      api.report?.({ round: at + 1, hits, total: rounds.length, finished: false, lastError: round2(err) });
    };

    $('elIn').onkeydown = e => { if (e.key === 'Enter') $('elGo').click(); };

    show();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- squares, cubes and last digits ---------------- */
export function powerGrid(cfg) {
  const { max = 30 } = cfg;

  return (el, api = {}) => {
    let mode = 'sq';
    const seen = new Set(['sq']);

    el.innerHTML = `
      <div class="nl">
        <div class="nl-modes">
          <button class="nl-mode is-on" data-m="sq">Squares to ${max}²</button>
          <button class="nl-mode" data-m="cu">Cubes to 15³</button>
          <button class="nl-mode" data-m="last">Last digits</button>
        </div>
        <div class="nl-grid" id="pgGrid"></div>
        <div class="nl-note" id="pgNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      if (mode === 'last') {
        const ends = [...Array(10)].map((_, d) => ({ d, sq: (d * d) % 10 }));
        const possible = [...new Set(ends.map(e => e.sq))].sort((a, b) => a - b);
        $('pgGrid').innerHTML = ends.map(e =>
          `<span class="nl-cell"><b>…${e.d}</b><em>…${e.sq}</em></span>`).join('');
        $('pgNote').innerHTML = `A square can only end in <b>${possible.join(', ')}</b>.
          It can never end in <b>2, 3, 7 or 8</b> — so any option ending in one of those is not a
          perfect square, and you have eliminated it without computing anything.`;
      } else if (mode === 'cu') {
        $('pgGrid').innerHTML = [...Array(15)].map((_, i) => {
          const n = i + 1;
          return `<span class="nl-cell"><b>${n}³</b><em>${(n ** 3).toLocaleString('en-IN')}</em></span>`;
        }).join('');
        $('pgNote').innerHTML = `Cubes keep the last digit of their root for 0, 1, 4, 5, 6 and 9 —
          and swap 2↔8 and 3↔7.`;
      } else {
        $('pgGrid').innerHTML = [...Array(max)].map((_, i) => {
          const n = i + 1;
          return `<span class="nl-cell ${n > 1 ? '' : 'is-first'}">
            <b>${n}²</b><em>${(n ** 2).toLocaleString('en-IN')}</em>
            ${n > 1 ? `<i>+${n ** 2 - (n - 1) ** 2}</i>` : ''}</span>`;
        }).join('');
        $('pgNote').innerHTML = `The gap between consecutive squares is <b>2n − 1</b> — always odd,
          and growing by 2 each time. That is why 25² = 625 and 26² = 625 + 51 = 676, with no
          multiplication at all.`;
      }
      api.report?.({ mode, seen: seen.size, seenAll: seen.size === 3 });
    };

    el.addEventListener('click', e => {
      const b = e.target.closest('.nl-mode');
      if (!b) return;
      mode = b.dataset.m; seen.add(mode);
      el.querySelectorAll('.nl-mode').forEach(x => x.classList.toggle('is-on', x === b));
      draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
