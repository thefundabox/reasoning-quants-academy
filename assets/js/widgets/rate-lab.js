/* ============================================================
   Rate lab — the manipulables behind Unit 3.

   The unit has one idea wearing three costumes: something accumulates
   at a RATE over a TIME. Money earns interest, a vehicle covers
   distance, a worker completes work. So the widgets share a shape.

     interestCurve()  — the simple line and the compound curve on one
                        axis, with the gap between them measured
     speedTriangle()  — distance = speed x time; set any two, the third
                        is derived, in either unit system
     relativeSpeed()  — two movers, same or opposite way, and the time
                        they take to clear each other
     workRate()       — rates per day add (and a leak subtracts), so the
                        combined time falls straight out

   Every figure below is computed from the sliders. Nothing stores an
   answer, so no lesson can print a number its own picture denies.
   ============================================================ */

/* ---------------- pure arithmetic (exported for the harness) ---------------- */

export const simple = (p, r, t) => p * r * t / 100;
export const amountCI = (p, r, n) => p * (1 + r / 100) ** n;
export const compound = (p, r, n) => amountCI(p, r, n) - p;
/** The gap the exam loves: for two years it is exactly P(r/100)². */
export const ciMinusSi = (p, r, n) => compound(p, r, n) - simple(p, r, n);

export const toMS = kmh => kmh * 5 / 18;
export const toKMH = ms => ms * 18 / 5;
/** Same distance at two speeds — the harmonic mean, never the arithmetic one. */
export const avgSpeed = (a, b) => 2 * a * b / (a + b);

export const gcd = (a, b) => b ? gcd(b, a % b) : a;
export const lcm = (a, b) => a * b / gcd(a, b);
/** Total work as the LCM of the individual times, so every rate is a whole number. */
export function workUnits(days) {
  const total = days.map(Math.abs).reduce((a, b) => lcm(a, b));
  const rates = days.map(d => (d < 0 ? -1 : 1) * total / Math.abs(d));
  const net = rates.reduce((a, b) => a + b, 0);
  return { total, rates, net, time: net > 0 ? total / net : Infinity };
}

const r2 = n => Math.round(n * 100) / 100;
export const money = n => {
  const v = r2(n);
  return Number.isInteger(v) ? v.toLocaleString('en-IN') : v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

/* ---------------- simple line vs compound curve ---------------- */
export function interestCurve(cfg) {
  const { p = 10000, rate = 10, maxYears = 6, startYears = 2, unit = '₹' } = cfg;

  return (el, api = {}) => {
    let r = rate, n = startYears;

    el.innerHTML = `
      <div class="rt">
        <div class="rt-controls">
          <label class="rt-lab">Rate
            <input id="icR" type="range" min="4" max="20" step="1" value="${r}" aria-label="Rate percent">
            <span id="icRv"></span></label>
          <label class="rt-lab">Years
            <input id="icN" type="range" min="1" max="${maxYears}" step="1" value="${n}" aria-label="Years">
            <span id="icNv"></span></label>
        </div>
        <div class="rt-chart"><svg id="icSvg" viewBox="0 0 420 200" class="rt-svg" role="img"
             aria-label="Simple interest as a straight line and compound interest as a curve"></svg></div>
        <div class="rt-cells" id="icCells"></div>
        <div class="rt-gap" id="icGap"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      $('icRv').textContent = r + '%';
      $('icNv').textContent = n;

      const top = amountCI(p, r, maxYears);
      const X = k => 30 + k / maxYears * 375;
      const Y = v => 180 - (v - p) / (top - p) * 160;

      const siPts = [], ciPts = [];
      for (let k = 0; k <= maxYears; k++) {
        siPts.push(`${X(k)},${Y(p + simple(p, r, k))}`);
        ciPts.push(`${X(k)},${Y(amountCI(p, r, k))}`);
      }

      $('icSvg').innerHTML = `
        <line class="rt-axis" x1="30" y1="180" x2="410" y2="180"/>
        <line class="rt-axis" x1="30" y1="18" x2="30" y2="180"/>
        <polyline class="rt-si" points="${siPts.join(' ')}"/>
        <polyline class="rt-ci" points="${ciPts.join(' ')}"/>
        <line class="rt-mark" x1="${X(n)}" y1="${Y(p + simple(p, r, n))}" x2="${X(n)}" y2="${Y(amountCI(p, r, n))}"/>
        <circle class="rt-dot rt-dot--si" cx="${X(n)}" cy="${Y(p + simple(p, r, n))}" r="4.5"/>
        <circle class="rt-dot rt-dot--ci" cx="${X(n)}" cy="${Y(amountCI(p, r, n))}" r="4.5"/>
        ${[...Array(maxYears + 1)].map((_, k) =>
          `<text class="rt-tick" x="${X(k)}" y="195" text-anchor="middle">${k}</text>`).join('')}`;

      const si = simple(p, r, n), ci = compound(p, r, n), gap = ci - si;
      $('icCells').innerHTML = `
        <div class="rt-cell rt-cell--si"><span>Simple</span><b>${unit}${money(si)}</b>
          <em>${unit}${money(p)} × ${r}% × ${n}</em></div>
        <div class="rt-cell rt-cell--ci"><span>Compound</span><b>${unit}${money(ci)}</b>
          <em>${unit}${money(p)} × ${(1 + r / 100).toFixed(2)}<sup>${n}</sup> − ${unit}${money(p)}</em></div>
        <div class="rt-cell rt-cell--gap"><span>Compound earns extra</span><b>${unit}${money(gap)}</b>
          <em>interest that itself earned interest</em></div>`;

      $('icGap').innerHTML = n === 2
        ? `At <b>two years</b> the gap is exactly <b>P × (r/100)<sup>2</sup></b> =
           ${unit}${money(p)} × ${(r / 100).toFixed(2)}<sup>2</sup> = <b>${unit}${money(p * (r / 100) ** 2)}</b>
           — worth memorising, because two-year questions are the common ones.`
        : n === 1
          ? `At <b>one year</b> there is nothing to compound yet, so the two are <b>identical</b>.
             Compounding only bites from the second year onward.`
          : `Over ${n} years the gap has grown to ${unit}${money(gap)}. It widens faster than the
             interest itself, because each year's extra also starts earning.`;

      api.report?.({
        rate: r, years: n, si: r2(si), ci: r2(ci), gap: r2(gap),
        equalAtYearOne: n === 1 && Math.abs(gap) < 1e-9,
        sawYearOne: n === 1, sawTwoYearRule: n === 2,
        gapGrows: gap > 0,
      });
    };

    $('icR').oninput = e => { r = +e.target.value; draw(); };
    $('icN').oninput = e => { n = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- distance = speed x time ---------------- */
export function speedTriangle(cfg) {
  /* The step is 6 and the floor is 12 on purpose: that makes every multiple of 18
     — 18, 36, 54, 72, 90, 108 — landable, and those are exactly the speeds that
     convert to a whole number of m/s. A step of 5 would skip 72 entirely, which
     would leave the lesson asking for a value the slider cannot produce. */
  const { speed = 60, time = 2, maxSpeed = 120, maxTime = 8, minSpeed = 12, stepSpeed = 6 } = cfg;

  return (el, api = {}) => {
    let s = speed, t = time;

    el.innerHTML = `
      <div class="rt">
        <div class="rt-controls">
          <label class="rt-lab">Speed
            <input id="stS" type="range" min="${minSpeed}" max="${maxSpeed}" step="${stepSpeed}" value="${s}" aria-label="Speed in km per hour">
            <span id="stSv"></span></label>
          <label class="rt-lab">Time
            <input id="stT" type="range" min="0.5" max="${maxTime}" step="0.5" value="${t}" aria-label="Time in hours">
            <span id="stTv"></span></label>
        </div>
        <div class="rt-tri" id="stTri"></div>
        <div class="rt-road"><span class="rt-car" id="stCar">▶</span></div>
        <div class="rt-conv" id="stConv"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const d = s * t;
      $('stSv').textContent = s + ' km/h';
      $('stTv').textContent = t + (t === 1 ? ' hour' : ' hours');

      $('stTri').innerHTML = `
        <div class="rt-tri-top"><span>Distance</span><b>${money(d)} km</b></div>
        <div class="rt-tri-bot">
          <div><span>Speed</span><b>${money(s)} km/h</b></div>
          <div class="rt-tri-x">×</div>
          <div><span>Time</span><b>${money(t)} h</b></div>
        </div>`;

      $('stCar').style.left = Math.min(100, d / (maxSpeed * maxTime) * 100) + '%';

      $('stConv').innerHTML = `
        <div class="rt-cell"><span>Same speed in m/s</span><b>${money(toMS(s))} m/s</b>
          <em>× 5/18 — because 1 km/h is 1000 m per 3600 s</em></div>
        <div class="rt-cell"><span>Rearranged</span><b>${money(d)} ÷ ${money(s)} = ${money(t)} h</b>
          <em>any two of the three give the third</em></div>`;

      api.report?.({
        speed: s, time: t, distance: r2(d), ms: r2(toMS(s)),
        hit72: s === 72, hitExact20ms: Math.abs(toMS(s) - 20) < 1e-9,
        far: d >= 300,
      });
    };

    $('stS').oninput = e => { s = +e.target.value; draw(); };
    $('stT').oninput = e => { t = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- two movers ---------------- */
export function relativeSpeed(cfg) {
  const { a = 54, b = 36, lenA = 150, lenB = 100, startOpposite = true } = cfg;

  return (el, api = {}) => {
    let sa = a, sb = b, opposite = startOpposite;
    const seen = new Set();

    el.innerHTML = `
      <div class="rt">
        <div class="rt-dirs">
          <button class="rt-dir is-on" data-o="1">Opposite directions</button>
          <button class="rt-dir" data-o="0">Same direction</button>
        </div>
        <div class="rt-controls">
          <label class="rt-lab">First train
            <input id="rsA" type="range" min="18" max="108" step="6" value="${sa}" aria-label="Speed of the first train">
            <span id="rsAv"></span></label>
          <label class="rt-lab">Second train
            <input id="rsB" type="range" min="18" max="108" step="6" value="${sb}" aria-label="Speed of the second train">
            <span id="rsBv"></span></label>
        </div>
        <div class="rt-track" id="rsTrack"></div>
        <div class="rt-cells" id="rsCells"></div>
        <div class="rt-note" id="rsNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      seen.add(opposite ? 'opp' : 'same');
      const rel = opposite ? sa + sb : Math.abs(sa - sb);
      const relMS = toMS(rel);
      const total = lenA + lenB;
      const secs = relMS > 0 ? total / relMS : Infinity;

      $('rsAv').textContent = sa + ' km/h';
      $('rsBv').textContent = sb + ' km/h';
      el.querySelectorAll('.rt-dir').forEach(b2 =>
        b2.classList.toggle('is-on', (b2.dataset.o === '1') === opposite));

      $('rsTrack').innerHTML = `
        <div class="rt-lane"><span class="rt-train rt-train--a">${lenA} m ▶</span></div>
        <div class="rt-lane"><span class="rt-train rt-train--b">${opposite ? '◀ ' : '▶ '}${lenB} m</span></div>`;

      $('rsCells').innerHTML = `
        <div class="rt-cell"><span>Relative speed</span><b>${money(rel)} km/h</b>
          <em>${opposite ? `${sa} + ${sb} — closing` : `${Math.max(sa, sb)} − ${Math.min(sa, sb)} — creeping past`}</em></div>
        <div class="rt-cell"><span>In m/s</span><b>${money(relMS)} m/s</b><em>× 5/18</em></div>
        <div class="rt-cell rt-cell--gap"><span>Time to clear each other</span>
          <b>${Number.isFinite(secs) ? money(secs) + ' s' : 'never'}</b>
          <em>${total} m ÷ ${money(relMS)} m/s</em></div>`;

      $('rsNote').innerHTML = sa === sb && !opposite
        ? `Equal speeds in the <b>same</b> direction: the relative speed is <b>zero</b> and they
           never pass at all. This is why "same direction" questions always give unequal speeds.`
        : opposite
          ? `Travelling toward each other, the gap closes at the <b>sum</b> of the speeds — so it
             is over quickly.`
          : `Travelling the same way, only the <b>difference</b> matters, and passing takes far
             longer than most people expect.`;

      api.report?.({
        a: sa, b: sb, opposite, rel, relMS: r2(relMS),
        seconds: Number.isFinite(secs) ? r2(secs) : null,
        sawBoth: seen.size === 2,
        sawZeroRelative: !opposite && sa === sb,
        sameIsSlower: !opposite && rel < sa + sb,
      });
    };

    el.addEventListener('click', e => {
      const b2 = e.target.closest('.rt-dir');
      if (!b2) return;
      opposite = b2.dataset.o === '1';
      draw();
    });
    $('rsA').oninput = e => { sa = +e.target.value; draw(); };
    $('rsB').oninput = e => { sb = +e.target.value; draw(); };

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/* ---------------- work per day ---------------- */
export function workRate(cfg) {
  const { workers = [], unit = 'days', maxDays = 24 } = cfg;

  return (el, api = {}) => {
    const w = workers.map(x => ({ ...x }));

    el.innerHTML = `
      <div class="rt">
        <div class="rt-workers" id="wrW"></div>
        <p class="rt-cap">Total work = LCM of the individual times, so every rate is a whole number</p>
        <div class="rt-bar" id="wrBar"></div>
        <div class="rt-cells" id="wrCells"></div>
        <div class="rt-note" id="wrNote"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const { total, rates, net, time } = workUnits(w.map(x => x.drains ? -x.days : x.days));

      $('wrW').innerHTML = w.map((x, i) => `
        <div class="rt-worker ${x.drains ? 'is-drain' : ''}">
          <span class="rt-w-name">${x.name}</span>
          <span class="rt-w-role">${x.drains ? 'empties in' : 'alone takes'}</span>
          <input class="rt-w-range" type="range" min="2" max="${maxDays}" step="1" value="${x.days}"
                 data-i="${i}" aria-label="${x.name} time">
          <span class="rt-w-val"><b>${x.days}</b> ${unit}</span>
        </div>`).join('');

      $('wrBar').innerHTML = rates.map((r, i) => `
        <span class="rt-seg ${r < 0 ? 'is-drain' : ''}" style="flex:${Math.abs(r) || 0.001}">
          <b>${r > 0 ? '+' : ''}${r}</b><em>${w[i].name}</em></span>`).join('');

      $('wrCells').innerHTML = `
        <div class="rt-cell"><span>Total work</span><b>${total} units</b>
          <em>LCM(${w.map(x => x.days).join(', ')})</em></div>
        <div class="rt-cell"><span>Net per ${unit.replace(/s$/, '')}</span><b>${net} units</b>
          <em>${rates.map(r => (r > 0 ? '+' : '') + r).join(' ')}</em></div>
        <div class="rt-cell rt-cell--gap"><span>Time together</span>
          <b>${Number.isFinite(time) ? money(time) + ' ' + unit : 'never finishes'}</b>
          <em>${total} ÷ ${net}</em></div>`;

      $('wrNote').innerHTML = net <= 0
        ? `The drain is winning, so the tank <b>never fills</b>. A negative net rate is a real answer
           in pipe questions — and the sign is the whole of it.`
        : `Rates add. Times do <b>not</b> — adding the days would be meaningless, which is why you
           convert to work-per-${unit.replace(/s$/, '')} first.`;

      api.report?.({
        days: w.map(x => x.days), total, rates, net,
        time: Number.isFinite(time) ? r2(time) : null,
        neverFinishes: net <= 0,
        allWholeRates: rates.every(r => Number.isInteger(r)),
      });
    };

    el.addEventListener('input', e => {
      const r = e.target.closest('.rt-w-range');
      if (!r) return;
      w[+r.dataset.i].days = +r.value;
      draw();
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
