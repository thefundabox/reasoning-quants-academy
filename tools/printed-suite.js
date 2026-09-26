/* ============================================================
   THE PRINTED QUESTION — is it answerable, and is the key right?

   Every other suite checks a generator against its own intent. This one reads
   what the LEARNER reads — the rendered question text and figure — parses the
   numbers back out, and works the answer out again by a different route.

   It exists because of a bug it would have caught on day one: `cnt-slots` drew
   four slots at Stretch but every scene could only name three, so the question
   listed three numbers while the key multiplied four. The question was
   well-formed, the options were distinct, the explanation was consistent with
   itself — and the answer could not be reached from what was printed. Only a
   check that reads the printed text can see that.

   Where the answer needs solving rather than computing (seating, floors), the
   puzzle is re-solved from its own printed clues by brute force.
   ============================================================ */
const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const num = x => +String(x).replace(/[₹,\s]/g, '');
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const C = (n, r) => { if (r < 0 || r > n) return 0; let x = 1; for (let i = 1; i <= r; i++) x = x * (n - r + i) / i; return Math.round(x); };
const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
const perms = xs => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map(p => [x, ...p])));
const LEFT = { N: 'W', W: 'S', S: 'E', E: 'N' }, RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' }, BACK = { N: 'S', S: 'N', E: 'W', W: 'E' };
const CODE = { North: 'N', South: 'S', East: 'E', West: 'W' };
const NAME = { N: 'North', S: 'South', E: 'East', W: 'West' };
const VEC = { N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0] };
const DIRS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
const ORD = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4, '5th': 5, '6th': 6, first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6 };

module.exports = async function printedSuite(check) {
  const { GENERATORS } = await import('../assets/js/generators/index.js');
  const { SET_GENERATORS, expandSet } = await import('../assets/js/generators/sets.js');
  const { RAS_GENERATORS } = await import('../assets/js/ras/index.js');
  const { rng } = await import('../assets/js/generators/rand.js');
  const { follows } = await import('../assets/js/ras/verbal.js');
  const { termFor } = await import('../assets/js/widgets/relation-ladder.js');

  /* ---------- one re-derivation per generator, from the printed text ---------- */
  const D = {
    'dir-turns'(q, t) {
      let f = CODE[t.match(/facing (North|South|East|West)/)[1]];
      /* Every turn word after the opening direction, in order — the later ones
         are written "then right", with no "turns" in front of them. */
      const after = t.slice(t.search(/facing (North|South|East|West)/) + 20);
      for (const m of after.matchAll(/\babout \(U-turn\)|\bright\b|\bleft\b/g)) {
        f = /U-turn/.test(m[0]) ? BACK[f] : m[0] === 'right' ? RIGHT[f] : LEFT[f];
      }
      return NAME[f];
    },
    'dir-quadrant'(q, t) {
      let x = 0, y = 0;
      for (const m of t.matchAll(/(\d+)\s*m\s*(North|South|East|West)/g)) {
        const [dx, dy] = VEC[CODE[m[2]]];
        x += dx * +m[1]; y += dy * +m[1];
      }
      if (x === 0 && y === 0) return null;
      if (x === 0) return y > 0 ? 'North' : 'South';
      if (y === 0) return x > 0 ? 'East' : 'West';
      return `${y > 0 ? 'North' : 'South'}-${x > 0 ? 'East' : 'West'}`;
    },
    'dir-triple': (q, t) => hyp(t, 'm'),
    'dir-displace': (q, t) => hyp(t, (t.match(/\d+\s*(km|m)\b/) || [])[1]),
    'ord-total'(q, t) {
      const l = +t.match(/(\d+)(?:st|nd|rd|th) from the left/)[1];
      const r = +t.match(/(\d+)(?:st|nd|rd|th) from the right/)[1];
      return String(l + r - 1);
    },
    'ord-between'(q, t) {
      const total = +(t.match(/row of (\d+)/) || [])[1];
      const ms = [...t.matchAll(/(\d+)(?:st|nd|rd|th) from the (left|right)/g)];
      if (ms.length < 2 || !total) return null;
      const p = ms.map(m => (m[2] === 'left' ? +m[1] : total - +m[1] + 1));
      return String(Math.abs(p[0] - p[1]) - 1);
    },
    'vis-folds'(q, t) {
      const f = +t.match(/folded in half (\d+) times?/)[1];
      const h = +t.match(/(\d+) holes? (?:is|are) punched/)[1];
      return String(h * 2 ** f);
    },
    'vis-cube'(q, t) {
      const [a, b, c] = t.match(/(\d+) × (\d+) × (\d+)/).slice(1, 4).map(x => +x - 2);
      if (/exactly one face/.test(t)) return String(2 * (a * b + b * c + a * c));
      if (/exactly two faces/.test(t)) return String(4 * (a + b + c));
      if (/three faces/.test(t)) return '8';
      if (/no face/.test(t)) return String(a * b * c);
      return null;
    },
    'vis-dice': (q, t) => { const m = t.match(/opposite (\d)/); return m ? String(7 - +m[1]) : null; },
    'vis-fan'(q, t) {
      const fan = t.match(/(\d+) straight lines? drawn from its apex/);
      if (fan) return String(C(+fan[1] + 2, 2));
      const grid = t.match(/grid of (\d+) columns × (\d+) rows/);
      if (!grid) return null;
      const [cols, rows] = grid.slice(1, 3).map(Number);
      if (/rectangles/.test(t)) return String(C(cols + 1, 2) * C(rows + 1, 2));
      let n = 0;
      for (let k = 1; k <= Math.min(cols, rows); k++) n += (cols - k + 1) * (rows - k + 1);
      return String(n);
    },
    'code-position'(q, t) {
      const n = +t.match(/the (\d+)(?:st|nd|rd|th) letter/)[1];
      return /counted from Z/.test(t) ? String(27 - n) : null;
    },
    'log-syllogism'(q, t) {
      const stmts = (t.match(/Statements: (.+?) Which/) || [])[1];
      if (!stmts) return null;
      const prem = stmts.split('.').map(x => x.trim()).filter(Boolean).map(claim);
      if (prem.some(p => !p)) return null;
      const terms = [...new Set(prem.flatMap(p => p.slice(1)))];
      const good = q.options.filter(o => {
        const c = claim(strip(o).replace(/\.$/, ''));
        return c && follows(prem, c, [...new Set([...terms, ...c.slice(1)])]);
      });
      return good.length === 1 ? good[0] : `${good.length} of the options follow`;
    },
    'num-hcflcm'(q, t) { const [a, b] = nums(t); return /HCF/.test(t) ? String(gcd(a, b)) : String(a * b / gcd(a, b)); },
    'num-divis'(q, t) {
      const m = t.match(/Is ([\d,]+) divisible by (\d+)/);
      return m ? (num(m[1]) % +m[2] === 0 ? 'Yes' : 'No') : null;
    },
    'pct-ratio'(q, t) {
      const total = nums(t)[0];
      const parts = (t.match(/ratio ([\d\s:]+)\./) || [])[1].split(':').map(x => +x.trim());
      const which = /first/.test(t) ? 0 : /second/.test(t) ? 1 : /third/.test(t) ? 2 : null;
      if (which === null) return null;
      return String(total * parts[which] / parts.reduce((a, b) => a + b, 0));
    },
    'int-speed'(q, t) { const [a, b] = nums(t); return /average speed/.test(t) ? fix(2 * a * b / (a + b)) + ' km/h' : null; },
    'int-work'(q, t) { const [a, b] = nums(t); return /together/.test(t) ? fix(1 / (1 / a + 1 / b)) + ' days' : null; },
    'men-scale'(q, t) {
      const m = t.match(/(\d+) cm × (\d+) cm has every length multiplied by (\d+)/);
      return m && /area of the enlarged/.test(t) ? `${+m[1] * +m[2] * (+m[3]) ** 2} cm²` : null;
    },
    'men-circle'(q, t) {
      const r = +(t.match(/radius (\d+)/) || [])[1];
      if (!r) return null;
      if (/its area/.test(t)) return `${22 / 7 * r * r} cm²`;
      if (/circumference/.test(t)) return `${2 * 22 / 7 * r} cm`;
      return null;
    },
    'men-ring'(q, t) {
      const m = t.match(/(\d+) cm wide runs around the (outside|inside) of a circle of radius (\d+)/);
      if (!m || !/area of the ring/.test(t)) return null;
      const R = m[2] === 'outside' ? +m[3] + +m[1] : +m[3];
      const r = m[2] === 'outside' ? +m[3] : +m[3] - +m[1];
      return `${22 / 7 * (R * R - r * r)} cm²`;
    },
    'men-triangle'(q, t) {
      const m = t.match(/base (\d+) cm and perpendicular height (\d+) cm/);
      return m && /area/.test(t) ? `${+m[1] * +m[2] / 2} cm²` : null;
    },
    'avg-weighted'(q, t) {
      const m = t.match(/class of (\d+) students averages (\d+) marks; another of (\d+) averages (\d+)/);
      if (!m) return null;
      const v = (+m[1] * +m[2] + +m[3] * +m[4]) / (+m[1] + +m[3]);
      return String(Math.round(v * 100) / 100);
    },
    'avg-allig'(q, t) {
      const m = t.match(/₹(\d+)\/kg is mixed with rice at ₹(\d+)\/kg to sell at ₹(\d+)\/kg/);
      if (!m) return null;
      const [a, b, mean] = m.slice(1, 4).map(Number);
      const g = gcd(b - mean, mean - a) || 1;
      return `${(b - mean) / g} : ${(mean - a) / g}`;
    },
    'cnt-permcomb'(q, t) {
      const m = t.match(/(\d+) different \w+ available\. In how many ways can (\d+) of them be (chosen|arranged)/);
      if (!m) return null;
      const [n, r] = [+m[1], +m[2]];
      return String(m[3] === 'chosen' ? C(n, r) : fact(n) / fact(n - r));
    },
    /* The check this suite was built for. */
    'cnt-slots'(q, t) {
      const printed = [...t.matchAll(/(\d+) [a-z]+(?: [a-z]+)?s\b/g)].map(m => +m[1]);
      return printed.length >= 2 ? String(printed.reduce((a, b) => a * b, 1)) : null;
    },
    'cnt-word'(q, t) {
      const m = t.match(/word ([A-Z]+) \((\d+) letters/);
      if (!m || !/distinct arrangements/.test(t)) return null;
      const c = {};
      for (const ch of m[1]) c[ch] = (c[ch] || 0) + 1;
      return String(Object.values(c).reduce((acc, k) => acc / fact(k), fact(m[1].length)));
    },
    'cnt-prob'(q, t) {
      const m = t.match(/(\d+) white and (\d+) black balls\. Two are drawn one after the other, (without|with) replacement/);
      if (!m || !/both are white/.test(t)) return null;
      const [w, b] = [+m[1], +m[2]];
      const nu = m[3] === 'without' ? w * (w - 1) : w * w;
      const de = m[3] === 'without' ? (w + b) * (w + b - 1) : (w + b) ** 2;
      const g = gcd(nu, de) || 1;
      return `${nu / g}/${de / g}`;
    },
    /* ---- RAS bank ---- */
    'ras-arr-circle'(q, t) {
      const lines = t.split('· ').slice(1).map(x => x.replace(/Which of the following.*$/, '').trim());
      const tests = lines.map(c => {
        let m;
        if ((m = c.match(/^(\w) and (\w) sit opposite each other/))) return s => Math.abs(s.indexOf(m[1]) - s.indexOf(m[2])) === 3;
        if ((m = c.match(/^(\w) sits immediately to the right of (\w)/))) return s => s[(s.indexOf(m[2]) - 1 + 6) % 6] === m[1];
        if ((m = c.match(/^(\w) does not sit next to (\w)/))) return s => { const d = Math.abs(s.indexOf(m[1]) - s.indexOf(m[2])); return d !== 1 && d !== 5; };
        if ((m = c.match(/^(\w) sits between (\w) and (\w)/))) return s => { const i = s.indexOf(m[1]); return [s[(i + 1) % 6], s[(i + 5) % 6]].includes(m[2]) && [s[(i + 1) % 6], s[(i + 5) % 6]].includes(m[3]); };
        throw new Error(`unparsed clue: ${c}`);
      });
      const bad = q.options.filter(o => !tests.every(f => f([...strip(o)])));
      return bad.length === 1 ? bad[0] : `${bad.length} options break the clues`;
    },
    'ras-clk-dial'(q, t) {
      const m = t.match(/when it shows (\d+):(\d+)\s*, its (minute|hour) hand points towards ([\w-]+)\s*\. After (\d+) hours\s*, in which direction will its (minute|hour) hand point/);
      if (!m) return null;
      const [h, mi] = [+m[1], +m[2]];
      const hourA = hh => ((hh % 12) * 30 + mi * 0.5) % 360, minA = () => (mi * 6) % 360;
      const offset = DIRS.indexOf(m[4]) * 45 - (m[3] === 'minute' ? minA() : hourA(h));
      const h2 = (h + +m[5] - 1) % 12 + 1;
      const deg = (((m[6] === 'minute' ? minA() : hourA(h2)) + offset) % 360 + 360) % 360;
      return DIRS[Math.round(deg / 45) % 8];
    },
    'ras-fig-rect'(q, t) {
      const g = grid(q);
      if (!g) return null;
      if (/rectangles/.test(t)) return String(C(g.cols + 1, 2) * C(g.rows + 1, 2));
      let n = 0;
      for (let k = 1; k <= Math.min(g.cols, g.rows); k++) n += (g.cols - k + 1) * (g.rows - k + 1);
      return String(n);
    },
    'ras-fig-cell'(q, t) {
      const g = grid(q);
      const sh = q.context.match(/<rect x="(\d+)" y="(\d+)" width="34"/);
      if (!g || !sh) return null;
      const cx = Math.round((+sh[1] - 12) / 34), cy = Math.round((+sh[2] - 12) / 34);
      let n = 0;
      for (let y1 = 0; y1 <= g.rows; y1++) for (let y2 = y1 + 1; y2 <= g.rows; y2++)
        for (let x1 = 0; x1 <= g.cols; x1++) for (let x2 = x1 + 1; x2 <= g.cols; x2++)
          if (y1 <= cy && y2 >= cy + 1 && x1 <= cx && x2 >= cx + 1) n++;
      return String(n);
    },
    'ras-fig-fan'(q) {
      const rays = (q.context.match(/<line /g) || []).length + 2;
      return String(C(rays, 2));
    },
    /* The RAS family reader, checked against the LESSON's kinship engine. */
    'ras-rel-chain'(q, t) {
      const P = {};
      const person = id => (P[id] = P[id] || { sex: null, parents: [], spouse: null });
      const SEX = { son: 'm', daughter: 'f', husband: 'm', wife: 'f' };
      for (const c of strip(q.context).split(/(?<=\.)\s+/).filter(Boolean)) {
        const m = c.match(/^(\w+) is the (son|daughter|husband|wife) of (\w+)\./);
        if (!m) return null;
        person(m[1]); person(m[3]);
        P[m[1]].sex = SEX[m[2]];
        if (m[2] === 'husband' || m[2] === 'wife') {
          P[m[1]].spouse = m[3]; P[m[3]].spouse = m[1];
          P[m[3]].sex = m[2] === 'husband' ? 'f' : 'm';
        } else P[m[1]].parents.push(m[3]);
      }
      const qm = strip(q.q).match(/How is (\w+) related to (\w+)\s*\?/);
      if (!qm) return null;
      const step = (from, to) => {
        if (P[from].spouse === to) return P[to].sex === 'm' ? 'husband' : 'wife';
        if (P[from].parents.includes(to)) return P[to].sex === 'm' ? 'father' : 'mother';
        if (P[to].parents.includes(from)) return P[to].sex === 'm' ? 'son' : 'daughter';
        return null;
      };
      const seen = new Set([qm[2]]);
      let front = [[qm[2], []]];
      while (front.length) {
        const next = [];
        for (const [node, trail] of front) {
          if (node === qm[1]) { const r = termFor(trail); return r.ambiguous ? null : r.term; }
          for (const nb of Object.keys(P)) {
            if (seen.has(nb) || !step(node, nb)) continue;
            seen.add(nb);
            next.push([nb, [...trail, step(node, nb)]]);
          }
        }
        front = next;
      }
      return null;
    },
    'ras-int-leave'(q, t) {
      const m = t.match(/alone in (\d+)\s*, (\d+) and (\d+) days respectively\. They begin together, but (\w+) leaves (\d+) days? and (\w+) leaves (\d+) days? before/);
      if (!m) return null;
      const [a, b, c] = [+m[1], +m[2], +m[3]];
      const p = +m[5], r = +m[7];
      const work = D2 => D2 / a + Math.max(0, D2 - p) / b + Math.max(0, D2 - r) / c;
      let lo = 0, hi = 200;
      for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (work(mid) < 1) lo = mid; else hi = mid; }
      const Dv = (lo + hi) / 2;
      const [ka, kb] = strip(q.options[q.answer]).split(':').map(x => +x.trim());
      const ratio = ((Dv - p) / b) / ((Dv - r) / c);
      return Math.abs(ratio - ka / kb) < 1e-6 ? strip(q.options[q.answer]) : `${+ratio.toFixed(4)}`;
    },
    'ras-pct-two'(q, t) {
      const m = t.match(/each sold for ₹([\d,]+)\s*\. On one there is a profit of (\d+)% and on the other a loss of \2%/);
      if (!m) return null;
      const sp = num(m[1]), r = +m[2];
      const cost = sp / (1 + r / 100) + sp / (1 - r / 100);
      return `a loss of ${+((cost - 2 * sp) / cost * 100).toFixed(2)}%`;
    },
    'ras-pct-polygon'(q, t) {
      const m = t.match(/exterior angle to an interior angle is (\d+) : (\d+)/);
      return m ? String(Math.round(360 / (180 * +m[1] / (+m[1] + +m[2])))) : null;
    },
    'ras-avg-shift'(q, t) {
      const m = t.match(/average weight of (\d+) students is (\d+) kg\s*\. When (\w+) (joins them|leaves the group), the average (rises|falls) by ([\d.]+) kg/);
      if (!m) return null;
      const [n, avg] = [+m[1], +m[2]];
      const joins = m[4] === 'joins them';
      const newAvg = avg + (m[5] === 'rises' ? 1 : -1) * +m[6];
      return `${+(joins ? newAvg * (n + 1) - avg * n : avg * n - newAvg * (n - 1)).toFixed(1)} kg`;
    },
    'ras-men-paint'(q, t) {
      const m = t.match(/(\d+) m long, ([\d.]+) m wide and ([\d.]+) m high\s*\. It has (\d+) doors? of ([\d.]+) m × ([\d.]+) m and (\d+) windows? of ([\d.]+) m × ([\d.]+) m\s*\..*?₹([\d,]+) per square metre/);
      if (!m) return null;
      const [l, w, h, nd, dw, dh, nw, ww, wh, rate] = m.slice(1, 11).map(num);
      return `₹${((2 * (l + w) * h - nd * dw * dh - nw * ww * wh) * rate).toLocaleString('en-IN')}`;
    },
    /* ---- the wider RAS coverage ---- */
    'ras-spa-walk'(q, t) {
      const T = { North: 'East', East: 'South', South: 'West', West: 'North' };
      const L = { North: 'West', West: 'South', South: 'East', East: 'North' };
      const first = t.match(/walks (\d+) m towards the (North|South|East|West)/);
      if (!first) return null;
      let face = first[2], x = VEC[CODE[face]][0] * +first[1], y = VEC[CODE[face]][1] * +first[1];
      for (const m of t.matchAll(/turns (left|right) and walks (\d+) m/g)) {
        face = m[1] === 'right' ? T[face] : L[face];
        x += VEC[CODE[face]][0] * +m[2];
        y += VEC[CODE[face]][1] * +m[2];
      }
      if (/direction/.test(t)) {
        if (x === 0) return y > 0 ? 'North' : 'South';
        if (y === 0) return x > 0 ? 'East' : 'West';
        return `${y > 0 ? 'North' : 'South'}-${x > 0 ? 'East' : 'West'}`;
      }
      return `${Math.hypot(x, y)} m`;
    },
    'ras-spa-positions'(q, t) {
      const at = {};
      const ab = t.match(/(\w+) and (\w+) are (\d+) m apart/);
      if (!ab) return null;
      at[ab[1]] = [0, 0]; at[ab[2]] = [+ab[3], 0];
      const mid = t.match(/(\w+) is standing midway between (\w+) and (\w+)/);
      if (mid) at[mid[1]] = [+ab[3] / 2, 0];
      for (const m of t.matchAll(/(\w+) is (\d+) m (North|South|East|West) of (\w+)/g)) {
        const base = at[m[4]];
        if (!base) return null;
        const [dx, dy] = VEC[CODE[m[3]]];
        at[m[1]] = [base[0] + dx * +m[2], base[1] + dy * +m[2]];
      }
      const qm = strip(q.q).match(/between (\w+) and (\w+)/);
      if (!qm || !at[qm[1]] || !at[qm[2]]) return null;
      return `${Math.hypot(at[qm[1]][0] - at[qm[2]][0], at[qm[1]][1] - at[qm[2]][1])} m`;
    },
    'ras-spa-cubes'(q, t) {
      const n = +(t.match(/(\d+) × \d+ × \d+/) || [])[1];
      if (!n) return null;
      if (/not be visible/.test(t)) return String((n - 2) ** 3);
      if (/exactly two faces/.test(t)) return String(12 * (n - 2));
      if (/exactly one face/.test(t)) return String(6 * (n - 2) ** 2);
      if (/exactly three faces/.test(t)) return '8';
      return null;
    },
    'ras-set-three'(q, t) {
      const m = t.match(/group of ([\d,]+) boys.*?([\d,]+) play (\w[\w ]*?), ([\d,]+) play (\w[\w ]*?) and ([\d,]+) play (\w[\w ]*?)\./);
      const only = [...t.matchAll(/([\d,]+) play only/g)].map(x => num(x[1]));
      if (!m || only.length !== 3) return null;
      const total = num(m[1]), sum = num(m[2]) + num(m[4]) + num(m[6]);
      return String((sum - total - only.reduce((a, b) => a + b, 0)) / 2);
    },
    'ras-stat-mean'(q, t) {
      const m = t.match(/mean of (\d+) observations was calculated as (\d+).*?taken as ([\d, ]+) were actually ([\d, ]+)\./);
      if (!m) return null;
      const wrong = m[3].split(',').map(x => +x), right = m[4].split(',').map(x => +x);
      const diff = right.reduce((a, b) => a + b, 0) - wrong.reduce((a, b) => a + b, 0);
      return String(Math.round((+m[2] + diff / +m[1]) * 100) / 100);
    },
    'ras-stat-centre'(q, t) {
      const m = t.match(/readings: ([\d, ]+)\./);
      const which = (strip(q.q).match(/the (median|mode|mean) of/) || [])[1];
      if (!m || !which) return null;
      const d = m[1].split(',').map(x => +x).sort((a, b) => a - b);
      if (which === 'median') return String(d.length % 2 ? d[(d.length - 1) / 2] : (d[d.length / 2 - 1] + d[d.length / 2]) / 2);
      if (which === 'mean') return String(Math.round(d.reduce((a, b) => a + b, 0) / d.length * 100) / 100);
      const c = {};
      d.forEach(x => { c[x] = (c[x] || 0) + 1; });
      return String(+Object.keys(c).reduce((a, b) => (c[b] > c[a] ? b : a)));
    },
    'ras-geo-rect'(q, t) {
      const m = t.match(/sides of a triangle are (\d+)\s*, (\d+) and (\d+) units\. A rectangle of width (\d+)/);
      if (!m) return null;
      const area = +m[1] * +m[2] / 2;
      return `${2 * (area / +m[4] + +m[4])} units`;
    },
    'ras-geo-circle'(q, t) {
      const n = +(t.match(/(\d+) equally spaced points/) || [])[1];
      return n ? String((n / 2) * (n - 2)) : null;
    },
    'ras-pct-flip'(q, t) {
      const m = t.match(/multiply a number by (\d+)\/(\d+)\s*, but multiplied it by (\d+)\/(\d+)/);
      if (!m) return null;
      const b = +m[1], a = +m[2];
      return `${Math.round((b * b - a * a) / (b * b) * 10000) / 100}%`;
    },
    'ras-pct-cut'(q, t) {
      const m = t.match(/reduction of ([\d.]+)% .*?get ([\d.]+) kg more for ₹([\d,]+)/);
      if (!m) return null;
      return `₹${Math.round(num(m[3]) * +m[1] / (100 * +m[2]) * 100) / 100}`;
    },
    'ras-pct-shift'(q, t) {
      const m = t.match(/ratio (\d+) : (\d+) : (\d+).*?₹([\d,]+) more to each.*?ratio (\d+) : (\d+) : (\d+)/);
      const who = (strip(q.q).match(/How much did ([A-C])/) || [])[1];
      if (!m || !who) return null;
      const b0 = [+m[1], +m[2], +m[3]], a0 = [+m[5], +m[6], +m[7]], c = num(m[4]);
      /* Solve (b0·k + c)/(b2·k + c) = a0/a2 for k, from the outer two shares. */
      const k = (c * (a0[0] - a0[2])) / (a0[2] * b0[0] - a0[0] * b0[2]);
      const idx = 'ABC'.indexOf(who);
      return `₹${(b0[idx] * k).toLocaleString('en-IN')}`;
    },
    'ras-int-split'(q, t) {
      const m = t.match(/(\d+)\/(\d+) of a sum is deposited at compound interest of (\d+)%.*?simple interest of (\d+)%.*?exceeds the other by ₹([\d,]+) after (\d+) years/);
      if (!m) return null;
      const [nu, de, rc, rs, diff, yrs] = [+m[1], +m[2], +m[3], +m[4], num(m[5]), +m[6]];
      const ci = (nu / de) * ((1 + rc / 100) ** yrs - 1);
      const si = (1 - nu / de) * (rs * yrs / 100);
      return `₹${Math.round(diff / Math.abs(ci - si)).toLocaleString('en-IN')}`;
    },
    'ras-int-often'(q, t) {
      const m = t.match(/simple interest on ₹([\d,]+) for (\d+) years is ₹([\d,]+).*?compounded (half-yearly|quarterly).*?after (\d+) years/);
      if (!m) return null;
      const P = num(m[1]), rate = num(m[3]) * 100 / (P * +m[2]);
      const k = m[4] === 'half-yearly' ? 2 : 4;
      const amount = P * (1 + rate / (100 * k)) ** (k * +m[5]);
      return `₹${Math.round((amount - P) * 100 / 100).toLocaleString('en-IN')}`;
    },
    'ras-mix-steps'(q, t) {
      const m = t.match(/holds (\d+) ml .*?ratio (\d+) : (\d+)\s*\. (\d+) ml of another mixture, milk and water in the ratio (\d+) : (\d+)\s*, is added.*?Then (\d+) ml/);
      if (!m) return null;
      const [start, m1, w1, added, m2, w2, taken] = m.slice(1, 8).map(Number);
      const milk = start * m1 / (m1 + w1) + added * m2 / (m2 + w2);
      const total = start + added;
      return `${Math.round(milk * (total - taken) / total * 100) / 100} ml`;
    },
    'ras-cnt-gaps'(q, t) {
      const m = t.match(/(\d+) men and (\d+) women/);
      if (!m) return null;
      return String(fact(+m[1]) * C(+m[1] + 1, +m[2]) * fact(+m[2]));
    },
    'ras-cnt-repeat'(q, t) {
      const m = t.match(/(\d+) different letters are given\. Words of (\d+) letters/);
      if (!m) return null;
      const k = +m[1], r = +m[2];
      let distinct = 1;
      for (let i = 0; i < r; i++) distinct *= k - i;
      return String(k ** r - distinct);
    },
    'ras-cnt-dicesum'(q, t) {
      const want = strip(q.q).match(/the sum is (.+?)\?/);
      if (!want) return null;
      const tests = {
        'a prime number': x => [2, 3, 5, 7, 11].includes(x),
        'a multiple of 3': x => x % 3 === 0,
        'more than 9': x => x > 9,
        'a perfect square': x => [4, 9].includes(x),
        'an even number greater than 6': x => x % 2 === 0 && x > 6,
        'a multiple of 4': x => x % 4 === 0,
      }[want[1].trim()];
      if (!tests) return null;
      let good = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (tests(a + b)) good++;
      const g = gcd(good, 36) || 1;
      return `${good / g}/${36 / g}`;
    },
    'ras-code-rearrange'(q, t) {
      const m = t.match(/In a certain code, ([A-Z]+) is written as ([A-Z]+)\s*\. How is ([A-Z]+) written/);
      if (!m) return null;
      const RULES = [
        w => w.match(/.{1,3}/g).map(b => [...b].reverse().join('')).join(''),
        w => { const h = Math.ceil(w.length / 2); return [...w.slice(h)].reverse().join('') + [...w.slice(0, h)].reverse().join(''); },
        w => [...w].sort().join(''),
        w => { const a = [...w]; for (let i = 0; i + 1 < a.length; i += 2) { const x = a[i]; a[i] = a[i + 1]; a[i + 1] = x; } return a.join(''); },
      ];
      const fits = RULES.filter(f => f(m[1]) === m[2]);
      if (fits.length !== 1) return null;                 // the example must pin one rule
      return fits[0](m[3]);
    },
    'ras-di-table'(q) {
      const rows = [...strip(q.context).matchAll(/([A-Z][a-z]+) ([\d,]+) ([\d,]+)/g)]
        .map(m => [m[1], num(m[2]), num(m[3])]).filter(r => r[0] !== 'Vehicle');
      if (rows.length < 3) return null;
      const pct = rows.map(r => (r[2] - r[1]) / r[1]);
      return rows[pct.indexOf(Math.min(...pct))][0];
    },
  };

  function nums(t) { return (t.match(/-?\d[\d,]*\.?\d*/g) || []).map(num); }
  function fix(v) { return String(Number.isInteger(v) ? v : Math.round(v * 100) / 100); }
  function hyp(t, unit) {
    const legs = [...t.matchAll(/(\d+)\s*(?:km|m)\b/g)].map(m => +m[1]);
    if (legs.length < 2) return null;
    const d = Math.hypot(legs[0], legs[1]);
    return `${Number.isInteger(d) ? d : Math.round(d * 100) / 100} ${unit}`;
  }
  function grid(q) {
    const m = q.context.match(/viewBox="0 0 (\d+) (\d+)"/);
    return m ? { cols: Math.round((+m[1] - 24) / 34), rows: Math.round((+m[2] - 24) / 34) } : null;
  }
  function claim(s) {
    let m;
    if ((m = s.match(/^All (\w+) are (\w+)$/))) return ['all', m[1], m[2]];
    if ((m = s.match(/^No (\w+) are (\w+)$/))) return ['no', m[1], m[2]];
    if ((m = s.match(/^Some (\w+) are not (\w+)$/))) return ['some-not', m[1], m[2]];
    if ((m = s.match(/^Some (\w+) are (\w+)$/))) return ['some', m[1], m[2]];
    return null;
  }

  let total = 0, wrong = 0, covered = 0;
  for (const g of [...GENERATORS, ...RAS_GENERATORS]) {
    const d = D[g.id];
    if (!d) continue;
    covered++;
    let checked = 0, bad = 0, first = '';
    for (let s = 1; s <= 260; s++) {
      let q; try { q = g.make(rng(s * 37 + 5), 1 + (s % 3)); } catch { continue; }
      if (!q) continue;
      const text = `${strip(q.context)} ${strip(q.q)}`;
      let want;
      try { want = d(q, text); } catch (e) { bad++; first = first || `parse failed: ${e.message}`; continue; }
      if (want === null || want === undefined) continue;
      checked++;
      const norm = x => String(x).replace(/[,₹\s]/g, '');
      if (norm(want) !== norm(strip(q.options[q.answer]))) {
        bad++;
        first = first || `${text.slice(0, 110)} → key "${strip(q.options[q.answer])}", re-derived "${want}"`;
      }
    }
    total += checked; wrong += bad;
    check(`printed ${g.id}: the key is what the printed question asks for`, bad === 0, first);
    check(`printed ${g.id}: the question can be read back at all`, checked > 20, `only ${checked} of 260 draws parsed`);
  }

  /* ---- the set puzzles, re-solved from their own printed clues ---- */
  for (const [id, kind] of [['set-seating', 'row'], ['set-floors', 'floor']]) {
    const g = SET_GENERATORS.find(x => x.id === id);
    let puzzles = 0, qs = 0, bad = 0, notUnique = 0, first = '';
    for (let s = 1; s <= 160; s++) {
      let set; try { set = expandSet(g, rng(s * 13 + 1), 1 + (s % 3), 0); } catch { continue; }
      if (!set || !set.length) continue;
      puzzles++;
      const ctx = strip(set[0].context);
      const all = [ctx, ...set.flatMap(x => [strip(x.q), ...x.options.map(strip)])].join(' ');
      const cast = [...new Set([...all.matchAll(/\b([A-Z][a-z]{2,})\b/g)].map(m => m[1]))]
        .filter(w => !['Question', 'Only', 'Floor', 'The', 'Who', 'How', 'On', 'None'].includes(w));
      const want = +(ctx.match(/^(\d+) people/) || [])[1];
      if (want && cast.length !== want) { bad++; first = first || `cast: expected ${want}, found ${cast.join(',')}`; continue; }
      const lines = ctx.split(/(?<=\.)\s+/).map(x => x.trim()).filter(x => /^[A-Z]/.test(x) && !/^Question/.test(x));
      let tests;
      try { tests = lines.map(c => clue(c, kind)); } catch (e) { bad++; first = first || e.message; continue; }
      const sols = perms(cast).filter(r => tests.every(f => f(r)));
      if (sols.length !== 1) { notUnique++; first = first || `${sols.length} solutions for: ${lines.join(' ')}`; continue; }
      for (const x of set) {
        const got = readOff(x, sols[0], kind);
        if (got === null) continue;
        qs++;
        if (String(got) !== strip(x.options[x.answer])) {
          bad++;
          first = first || `${strip(x.q)} → key "${x.options[x.answer]}", re-solved "${got}"`;
        }
      }
    }
    total += qs;
    check(`printed ${id}: every puzzle has exactly one solution`, notUnique === 0, first);
    check(`printed ${id}: every answer is the one its own clues force`, bad === 0, first);
    check(`printed ${id}: enough puzzles were re-solved to mean something`, qs > 200, `${qs} questions from ${puzzles} puzzles`);
  }

  function clue(c, kind) {
    let m;
    if (kind === 'row') {
      if ((m = c.match(/^(\w+) is at the extreme left/))) return a => a[0] === m[1];
      if ((m = c.match(/^(\w+) is at the extreme right/))) return a => a[a.length - 1] === m[1];
      if ((m = c.match(/^(\w+) sits to the left of (\w+)/))) return a => a.indexOf(m[1]) < a.indexOf(m[2]);
      if ((m = c.match(/^(\w+) sits to the right of (\w+)/))) return a => a.indexOf(m[1]) > a.indexOf(m[2]);
      if ((m = c.match(/^(\w+) is second from the left/))) return a => a[1] === m[1];
      if ((m = c.match(/^(\w+) is immediately next to (\w+)/))) return a => Math.abs(a.indexOf(m[1]) - a.indexOf(m[2])) === 1;
      if ((m = c.match(/^(\w+) is not next to (\w+)/))) return a => Math.abs(a.indexOf(m[1]) - a.indexOf(m[2])) !== 1;
      if ((m = c.match(/^(\w+) is exactly in the (\w+) position from the left/))) return a => a[ORD[m[2]] - 1] === m[1];
    } else {
      if ((m = c.match(/^(\w+) lives on the topmost floor/))) return a => a[a.length - 1] === m[1];
      if ((m = c.match(/^(\w+) lives on the ground floor/))) return a => a[0] === m[1];
      if ((m = c.match(/^(\w+) lives on floor (\d+)/))) return a => a[+m[2] - 1] === m[1];
      if ((m = c.match(/^Only (\d+) (?:person lives|people live) above (\w+)/))) return a => a.length - 1 - a.indexOf(m[2]) === +m[1];
      if ((m = c.match(/^(\w+) lives immediately (above|below) (\w+)/))) return a => a.indexOf(m[1]) - a.indexOf(m[3]) === (m[2] === 'above' ? 1 : -1);
      if ((m = c.match(/^(\w+) lives (?:somewhere )?(above|below) (\w+)/))) return a => (m[2] === 'above' ? a.indexOf(m[1]) > a.indexOf(m[3]) : a.indexOf(m[1]) < a.indexOf(m[3]));
    }
    throw new Error(`unparsed [${kind}] clue: ${c}`);
  }
  function readOff(q, row, kind) {
    const t = strip(q.q);
    let m;
    if (kind === 'row') {
      if (/extreme right/.test(t)) return row[row.length - 1];
      if (/extreme left/.test(t)) return row[0];
      if ((m = t.match(/Who is (\w+) from the left/))) return row[ORD[m[1]] - 1];
      if ((m = t.match(/Who is (\w+) from the right/))) return row[row.length - ORD[m[1]]];
      if ((m = t.match(/between (\w+) and (\w+)/))) return String(Math.abs(row.indexOf(m[1]) - row.indexOf(m[2])) - 1);
      if ((m = t.match(/immediately to the left of (\w+)/))) return row[row.indexOf(m[1]) - 1];
      if ((m = t.match(/immediately to the right of (\w+)/))) return row[row.indexOf(m[1]) + 1];
    } else {
      if (/topmost floor/.test(t)) return row[row.length - 1];
      if (/ground floor/.test(t)) return row[0];
      if ((m = t.match(/On which floor does (\w+) live/))) return `Floor ${row.indexOf(m[1]) + 1}`;
      if ((m = t.match(/between (\w+) and (\w+)/))) return String(Math.abs(row.indexOf(m[1]) - row.indexOf(m[2])) - 1);
      if ((m = t.match(/immediately below (\w+)/))) return row[row.indexOf(m[1]) - 1];
      if ((m = t.match(/immediately above (\w+)/))) return row[row.indexOf(m[1]) + 1];
      if ((m = t.match(/lives on floor (\d+)/))) return row[+m[1] - 1];
    }
    return null;
  }

  /* ---- a pie must add up to a full circle, and its legend must name every slice ---- */
  {
    const pie = GENERATORS.find(g => g.id === 'di-pie');
    let n = 0, bad = 0, first = '';
    for (let s = 1; s <= 400; s++) {
      let q; try { q = pie.make(rng(s), 1 + (s % 3)); } catch { continue; }
      if (!q) continue;
      const legend = [...q.context.matchAll(/>([^<>]+?) — (\d+)°</g)].map(m => [m[1].trim(), +m[2]]);
      const slices = (q.context.match(/<path d="M /g) || []).length;
      n++;
      if (legend.length !== slices) { bad++; first = first || `${slices} slices drawn, ${legend.length} named in the legend`; continue; }
      const sum = legend.reduce((a, b) => a + b[1], 0);
      if (sum !== 360) { bad++; first = first || `the slices total ${sum}°`; continue; }
      const qm = strip(q.q).match(/percentage of the total is ([^?]+?)\s*\?/);
      if (!qm) continue;
      const row = legend.find(l => l[0].toLowerCase() === qm[1].trim().toLowerCase());
      if (!row) { bad++; first = first || `the question names "${qm[1]}", which the legend does not`; continue; }
      total++;
      if (Math.abs(row[1] / 360 * 100 - +strip(q.options[q.answer]).replace('%', '')) > 0.02) {
        bad++; first = first || `${qm[1]} is ${row[1]}° but the key says ${q.options[q.answer]}`;
      }
    }
    check('printed di-pie: every slice is named and they add to a full circle', bad === 0, first);
  }

  console.log(`  ${total} printed questions re-derived across ${covered + 2} generators — key checked against the text the learner reads`);
};
