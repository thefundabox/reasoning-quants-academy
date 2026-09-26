/* ============================================================
   Geometry the paper actually sets — RAS 2024 Q94 (a triangle's area
   becomes a rectangle's perimeter), RAS 2023 Q94 (figures inscribed in a
   circle), RAS 2024 Q83 (right triangles from points on a circle).

   Each one is two steps: a shape gives up a number, and the number is then
   asked about in a different shape's language. That hop is the difficulty,
   not the formulas.
   ============================================================ */
import { gen, ask, options, byTier, round, asRatio } from './kit.js';

const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [20, 21, 29]];

/* A right triangle's area, handed to a rectangle. The trap is answering with
   the rectangle's LENGTH, or its area again. */
const triangleToRectangle = (R, tier) => {
  const [a, b, c] = R.pick(byTier(tier, TRIPLES.slice(0, 3), TRIPLES.slice(0, 5), TRIPLES.slice(3)));
  const area = a * b / 2;
  const widths = [2, 4, 5, 10].filter(w => area % w === 0 && area / w !== w);
  if (!widths.length) return null;
  const w = R.pick(widths);
  const l = area / w;
  const perim = 2 * (l + w);
  return ask({
    context: `The sides of a triangle are <b>${a}</b>, <b>${b}</b> and <b>${c}</b> units.
      A rectangle of width <b>${w}</b> units is drawn with the same area as the triangle.`,
    q: 'What is the perimeter of the rectangle?',
    opts: options(`${perim} units`, [
      { v: `${l} units`, why: 'That is the rectangle’s length. The perimeter goes all the way round.' },
      { v: `${area} units`, why: 'That is the area, which is a number of square units, not a length.' },
      { v: `${a + b + c} units`, why: 'That is the perimeter of the TRIANGLE.' },
      { v: `${l + w} units`, why: 'That is half the perimeter — length plus width, counted once.' },
    ], i => `${perim + 2 * (i + 1)} units`),
    why: `${a}² + ${b}² = ${a * a + b * b} = ${c}², so the triangle is right-angled and its legs are the
      base and height: area = ½ × ${a} × ${b} = <b>${area}</b> square units.<br>
      The rectangle has the same area, so its length is ${area} ÷ ${w} = <b>${l}</b>,
      and its perimeter is 2 × (${l} + ${w}) = <b>${perim}</b> units.`,
    hardness: 1 + c / 12 + (area > 100 ? 0.4 : 0),
    concept: 'area-perimeter-independent', conceptLabel: 'Area into perimeter',
    source: 'Shape of RAS 2024, Q94',
  });
};

/* Inscribed in a circle: the square's diagonal and the triangle's height are
   both fixed by the radius, and that is the whole question. */
const inscribed = (R, tier) => {
  const r = R.pick([7, 14, 10, 21, 28, 35]);
  const which = byTier(tier, 'square', R.pick(['square', 'triangle']), R.pick(['triangle', 'ratio']));
  const sq = 2 * r * r;                                   // side = r√2
  const tri = 3 * Math.sqrt(3) / 4 * r * r;
  if (which === 'ratio') {
    return ask({
      context: `A square and an equilateral triangle are both inscribed in the same circle.`,
      q: 'What is the ratio of the area of the square to the area of the triangle?',
      opts: options('8 : 3√3', [
        { v: '3√3 : 8', why: 'Right numbers, wrong way round — the square is the larger of the two.' },
        { v: '4 : 3√3', why: 'That uses ½r² for the square. Its area is 2r², because its diagonal is the diameter.' },
        { v: '2 : √3', why: '' },
        { v: '1 : 1', why: 'They are not equal — the square covers more of the circle than the triangle does.' },
      ]),
      why: `Take the radius as r. The square's diagonal is the diameter 2r, so its side is r√2 and its
        area is <b>2r²</b>.<br>
        The equilateral triangle inscribed in the same circle has side r√3, so its area is
        (√3/4)(r√3)² = <b>3√3r²/4</b>.<br>
        Ratio = 2 : 3√3/4 = <b>8 : 3√3</b> — about ${round(sq / tri, 2)} : 1, so the square is bigger.`,
      hardness: 2.8,
      concept: 'circle-area', conceptLabel: 'Inscribed in a circle',
      source: 'Shape of RAS 2023, Q94',
    });
  }
  const key = which === 'square' ? sq : round(tri, 2);
  return ask({
    context: `A ${which === 'square' ? 'square' : 'n equilateral triangle'} is inscribed in a circle of
      radius <b>${r} cm</b>.`,
    q: `What is its area? ${which === 'triangle' ? '(Take √3 = 1.73.)' : ''}`,
    opts: options(`${which === 'triangle' ? round(3 * 1.73 / 4 * r * r, 2) : key} cm²`, [
      { v: `${round(22 / 7 * r * r, 2)} cm²`, why: 'That is the area of the CIRCLE, not of the figure inside it.' },
      { v: `${r * r} cm²`, why: which === 'square' ? 'That would be a square of side r. Its side is r√2, because the diagonal is the diameter.' : '' },
      { v: `${4 * r * r} cm²`, why: 'That is the square drawn AROUND the circle, touching it on four sides.' },
      { v: `${round(key / 2, 2)} cm²`, why: '' },
    ], i => `${round(key + 7 * (i + 1), 2)} cm²`),
    why: which === 'square'
      ? `The square's diagonal is the circle's diameter, ${2 * r} cm. A square of diagonal d has area
         d²/2, so the area is ${2 * r}²/2 = <b>${sq} cm²</b> — which is also 2r².`
      : `An equilateral triangle inscribed in a circle of radius r has side r√3, so its area is
         (√3/4)(r√3)² = 3√3r²/4 = 3 × 1.73 × ${r}² ÷ 4 = <b>${round(3 * 1.73 / 4 * r * r, 2)} cm²</b>.`,
    hardness: 1.8 + (which === 'triangle' ? 0.8 : 0),
    concept: 'circle-area', conceptLabel: 'Inscribed in a circle',
    source: 'Shape of RAS 2023, Q94',
  });
};

/* Right triangles from equally spaced points on a circle — RAS 2024 Q83. The
   key fact is Thales: the right angle happens exactly when one side is a
   diameter. */
const circlePoints = (R, tier) => {
  const n = R.pick(byTier(tier, [8, 10], [8, 10, 12], [12, 14, 16, 20]));
  const diameters = n / 2;
  const key = diameters * (n - 2);
  const allTriangles = n * (n - 1) * (n - 2) / 6;
  return ask({
    context: `<b>${n}</b> equally spaced points lie on a circle.`,
    q: `Using these points as vertices, how many <b>right-angled</b> triangles can be drawn?`,
    opts: options(String(key), [
      { v: String(allTriangles), why: 'That is every triangle on these points. Only those with a diameter as one side have a right angle.' },
      { v: String(diameters), why: 'That is the number of diameters. Each one can be completed by any of the other points.' },
      { v: String(key / 2), why: 'Each diameter pairs with all ' + (n - 2) + ' remaining points, not half of them.' },
      { v: String(n * (n - 2)), why: `That counts each diameter twice — the ${n} points form only ${diameters} diameters.` },
    ], i => String(key + 4 * (i + 1))),
    why: `An angle drawn on a circle is a right angle exactly when it stands on a <b>diameter</b> (Thales).<br>
      ${n} equally spaced points give ${n} ÷ 2 = <b>${diameters} diameters</b>. Each diameter is the
      hypotenuse, and the third vertex can be any of the remaining ${n} − 2 = ${n - 2} points.<br>
      ${diameters} × ${n - 2} = <b>${key}</b> right-angled triangles.`,
    hardness: 2.2 + n / 20,
    concept: 'circle-semicircle', conceptLabel: 'Right angles on a diameter',
    source: 'Shape of RAS 2024, Q83',
  });
};

export const GEOMETRY_GENERATORS = [
  gen('ras-geo-rect', 'measure', 'quants:4', 'area-perimeter-independent', 'Area into perimeter', triangleToRectangle),
  gen('ras-geo-inscribed', 'measure', 'quants:4', 'circle-area', 'Inscribed figures', inscribed),
  gen('ras-geo-circle', 'measure', 'quants:4', 'circle-semicircle', 'Right angles on a circle', circlePoints),
];
