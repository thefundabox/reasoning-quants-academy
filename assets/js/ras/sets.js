/* ============================================================
   Sets and Venn diagrams — RAS 2023 Q93 (three games, 400 boys),
   RAS 2024 Q88 (which three nouns fit this diagram).

   The counting one is inclusion–exclusion asked backwards: the paper gives
   the "only two" figures and asks for the middle. Every number here is built
   from a real partition of the group, so the seven regions always add to the
   total — which is the check a candidate should do and the generator must.
   ============================================================ */
import { gen, ask, options, byTier, inr } from './kit.js';
import { svg } from '../generators/figures.js';

const GAMES = [['cricket', 'hockey', 'football'], ['chess', 'carrom', 'badminton'],
  ['tennis', 'squash', 'table tennis'], ['kabaddi', 'kho-kho', 'volleyball']];

/* Regions: a = only A, b = only B, c = only C, ab/bc/ca = exactly two, t = all three. */
const threeSets = (R, tier) => {
  const [A, B, C] = R.pick(GAMES);
  const t = R.int(byTier(tier, 8, 10, 12), byTier(tier, 20, 30, 40));
  const ab = R.int(10, 40), bc = R.int(10, 40), ca = R.int(10, 40);
  const a = R.int(byTier(tier, 40, 60, 70), 140), b = R.int(40, 140), c = R.int(40, 140);
  const total = a + b + c + ab + bc + ca + t;
  const playA = a + ab + ca + t, playB = b + ab + bc + t, playC = c + bc + ca + t;
  if (total > 900) return null;
  return ask({
    context: `In a group of <b>${inr(total)}</b> boys, every boy plays at least one of ${A}, ${B} and ${C}.
      <b>${playA}</b> play ${A}, <b>${playB}</b> play ${B} and <b>${playC}</b> play ${C}.
      <b>${ca}</b> play only ${A} and ${C}, <b>${ab}</b> play only ${A} and ${B},
      and <b>${bc}</b> play only ${B} and ${C}.`,
    q: `How many boys play <b>all three</b> games?`,
    opts: options(String(t), [
      { v: String(playA + playB + playC - total), why: 'That is what you get by subtracting the total once — but the boys who play exactly two games have been counted twice, and they must come out before the middle appears.' },
      { v: String(ab + bc + ca), why: 'That is the number who play exactly two of the games.' },
      { v: String(t * 2), why: '' },
      { v: String(total - playA), why: `That is how many do not play ${A}.` },
    ], i => String(t + 2 * (i + 1) + 1)),
    why: `Add the three totals: ${playA} + ${playB} + ${playC} = ${playA + playB + playC}.
      That counts each "exactly two" boy twice and each "all three" boy three times.<br>
      So ${playA + playB + playC} = ${inr(total)} + (${ab} + ${bc} + ${ca}) + 2 × (all three)<br>
      → 2 × (all three) = ${playA + playB + playC} − ${total} − ${ab + bc + ca} = ${2 * t},
      so <b>${t}</b> play all three.<br>
      Check the seven regions: ${a} + ${b} + ${c} + ${ab} + ${bc} + ${ca} + ${t} = ${inr(total)} ✓`,
    hardness: 2.4 + (tier >= 3 ? 0.6 : 0),
    concept: 'overlap-vs-disjoint', conceptLabel: 'Three overlapping sets',
    source: 'Shape of RAS 2023, Q93',
  });
};

/* Which three nouns fit a drawn diagram — RAS 2024 Q88. The shapes ARE the
   question, so they are drawn from the relationship, not illustrated after it. */
const SHAPES = [
  { id: 'nested', say: 'one inside another, inside a third',
    fits: [['Universe', 'Galaxies', 'Stars'], ['Rajasthan', 'Jaipur district', 'Jaipur city'],
           ['Vehicles', 'Cars', 'Electric cars'], ['Animals', 'Birds', 'Parrots']],
    misses: [['Teacher', 'Mother', 'Doctor'], ['Income tax', 'Sales tax', 'Service tax'],
             ['Library', 'Books', 'Furniture'], ['Gold', 'Silver', 'Metal']] },
  { id: 'disjoint-in', say: 'two separate circles, both inside a third',
    fits: [['Taxes', 'Income tax', 'Sales tax'], ['State', 'Jaipur', 'Jodhpur'],
           ['Fruits', 'Mangoes', 'Apples'], ['Pulses', 'Gram', 'Lentil']],
    misses: [['Universe', 'Galaxies', 'Stars'], ['Doctors', 'Women', 'Mothers'],
             ['Vehicles', 'Cars', 'Electric cars'], ['Rajasthan', 'Jaipur district', 'Jaipur city']] },
  { id: 'overlap', say: 'three circles that all overlap one another',
    fits: [['Teachers', 'Women', 'Mothers'], ['Players', 'Students', 'Singers'],
           ['Writers', 'Poets who paint', 'Painters'], ['Farmers', 'Landowners', 'Voters']],
    misses: [['Rajasthan', 'Jaipur district', 'Jaipur city'], ['Taxes', 'Income tax', 'Sales tax'],
             ['Animals', 'Birds', 'Parrots'], ['Fruits', 'Mangoes', 'Apples']] },
];

const vennShape = (R, tier) => {
  /* Nested circles are read at a glance; three mutually overlapping ones need
     every pair checked. That is the difficulty here, so the tier picks the
     shape rather than decorating the hardness number. */
  const byLevel = { 1: ['nested'], 2: ['nested', 'disjoint-in'], 3: ['disjoint-in', 'overlap'] };
  const shape = R.pick(SHAPES.filter(s => byLevel[tier <= 1 ? 1 : tier >= 3 ? 3 : 2].includes(s.id)));
  const key = R.pick(shape.fits);
  const wrong = R.some(shape.misses, 3);
  const fig = {
    nested: svg(300, 150, `<g fill="none" stroke="var(--ink)" stroke-width="2">
        <circle cx="150" cy="75" r="68"/><circle cx="150" cy="75" r="44"/><circle cx="150" cy="75" r="20"/></g>`),
    'disjoint-in': svg(300, 150, `<g fill="none" stroke="var(--ink)" stroke-width="2">
        <circle cx="150" cy="75" r="68"/><circle cx="115" cy="75" r="26"/><circle cx="188" cy="75" r="26"/></g>`),
    overlap: svg(300, 160, `<g fill="none" stroke="var(--ink)" stroke-width="2">
        <circle cx="120" cy="70" r="46"/><circle cx="178" cy="70" r="46"/><circle cx="149" cy="110" r="46"/></g>`),
  }[shape.id];
  return ask({
    context: fig,
    q: 'Which set of three fits the diagram above?',
    opts: options(key.join(', '), wrong.map(v => ({
      v: v.join(', '),
      why: `${v[0]}, ${v[1]} and ${v[2]} do not sit that way: draw them and the circles come out differently.`,
    }))),
    why: `The diagram shows <b>${shape.say}</b>.<br>
      ${key[0]}, ${key[1]} and ${key[2]} stand in exactly that relation — which is why the other three
      sets do not fit, however familiar they look.`,
    hardness: 1.2 + { nested: 0, 'disjoint-in': 0.7, overlap: 1.4 }[shape.id],
    concept: 'overlap-vs-disjoint', conceptLabel: 'Choosing the right diagram',
    source: 'Shape of RAS 2024, Q88',
  });
};

export const SET_GENERATORS_RAS = [
  gen('ras-set-three', 'sets', 'reasoning:6', 'overlap-vs-disjoint', 'Three overlapping sets', threeSets),
  gen('ras-set-venn', 'sets', 'reasoning:6', 'overlap-vs-disjoint', 'Choosing the diagram', vennShape),
];
