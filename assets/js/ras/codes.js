/* Coding, decoding and letter patterns — RAS 2015 Q94/Q107/Q108, 2016 Q109,
   2018 Q107-110, 2021 Q124. The RPSC favourites, all five of them. */
import { gen, ask, options, byTier, AZ, pos, chr } from './kit.js';

const WORDS = ['sky', 'blue', 'bicycle', 'race', 'coffee', 'tea', 'bring', 'she', 'he', 'water',
  'green', 'hill', 'river', 'book', 'road', 'city', 'rain', 'fire', 'lamp', 'door', 'train', 'gold'];
const SYLL = ['lew', 'nas', 'hsi', 'ploy', 'wir', 'sut', 'lim', 'goolo', 'yarn', 'silko', 'spadi',
  'breli', 'zwet', 'volo', 'tenk', 'mip', 'dola', 'ruki', 'fask', 'jaro'];

/* RAS 2018 Q110 / 2015 Q108: an invented language given as three sentences.
   The answer is forced by the words two sentences SHARE, and the question is
   only fair if exactly one word is shared — which is checked, not assumed. */
const language = (R, tier) => {
  const w = R.some(WORDS, 6);
  const c = R.some(SYLL, 6);
  const code = Object.fromEntries(w.map((x, i) => [x, c[i]]));
  /* Three sentences. The target word sits in the first two and nowhere else;
     everything else appears at most once across that pair. */
  const S = [[w[0], w[1], w[2]], [w[0], w[3], w[4]], [w[3], w[5], w[1]]];
  const target = w[0];
  const shared = S[0].filter(x => S[1].includes(x));
  if (shared.length !== 1 || shared[0] !== target) return null;

  const show = s => R.shuffle(s.map(x => code[x])).join(' ');
  const sentences = S.map(s => ({ code: show(s), words: R.shuffle(s.slice()).join(' ') }));
  return ask({
    context: `In a certain code language:<br>
      I. "<b>${sentences[0].code}</b>" means "${sentences[0].words}";<br>
      II. "<b>${sentences[1].code}</b>" means "${sentences[1].words}";<br>
      III. "<b>${sentences[2].code}</b>" means "${sentences[2].words}".`,
    q: `Which code word stands for "<b>${target}</b>"?`,
    opts: options(code[target], [
      { v: code[w[1]], why: `"${code[w[1]]}" is common to sentences I and III, so it stands for "${w[1]}".` },
      { v: code[w[3]], why: `"${code[w[3]]}" is common to sentences II and III, so it stands for "${w[3]}".` },
      { v: code[w[2]], why: `"${code[w[2]]}" appears only in sentence I, so it cannot be pinned to any one word from I alone.` },
      { v: code[w[4]], why: `"${code[w[4]]}" appears only in sentence II.` },
      { v: code[w[5]], why: '' },
    ]),
    why: `Compare the sentences that both mention "${target}" — I and II.
      They share exactly one code word, <b>${code[target]}</b>, and exactly one English word, "${target}".
      So ${code[target]} = ${target}. (I and III share "${w[1]}" = ${code[w[1]]}; II and III share "${w[3]}" = ${code[w[3]]}.)`,
    hardness: 2,
    concept: 'name-the-family', conceptLabel: 'Decoding by intersection',
    source: 'Shape of RAS 2018 Q110 · RAS 2015 Q108',
  });
};

/* RAS 2021 Q124: TIGER → QDFHS. Two operations stacked — a shift and a
   rearrangement — which is where a single-step reader comes unstuck. */
const shiftAndReverse = (R, tier) => {
  const words = ['TIGER', 'FROZEN', 'PLANET', 'MARKET', 'SILVER', 'CANDLE', 'GARDEN', 'MONKEY', 'PENCIL', 'TEMPLE'];
  const [demo, ask1] = R.some(words, 2);
  const k = R.pick([-3, -2, -1, 1, 2, 3]);
  const reverse = byTier(tier, false, true, true);
  const apply = word => {
    const shifted = [...word].map(ch => chr(pos(ch) + k));
    return (reverse ? shifted.reverse() : shifted).join('');
  };
  const key = apply(ask1);
  const noShift = reverse ? [...ask1].reverse().join('') : ask1;
  const noReverse = [...ask1].map(ch => chr(pos(ch) + k)).join('');
  const wrongWay = (() => { const s = [...ask1].map(ch => chr(pos(ch) - k)); return (reverse ? s.reverse() : s).join(''); })();
  /* Without the reversal, `noReverse` IS the key — a tier that has no second
     operation needs a different third distractor, or the draw is thrown away
     every time and the whole generator silently deals nothing. */
  const extra = reverse ? noReverse : [...ask1].map(ch => chr(pos(ch) + k + 1)).join('');
  if (new Set([key, noShift, extra, wrongWay]).size < 4) return null;
  return ask({
    context: `In a certain code, <b>${demo}</b> is written as <b>${apply(demo)}</b>.`,
    q: `In the same code, <b>${ask1}</b> is written as`,
    opts: options(key, [
      { v: wrongWay, why: `The shift is the other way: each letter moves ${k > 0 ? 'forward' : 'back'} ${Math.abs(k)}.` },
      { v: extra, why: reverse ? 'The shift is right, but the code also reverses the word.' : 'Each letter has moved one place too far.' },
      { v: noShift, why: 'That rearranges the letters without shifting them.' },
      { v: [...key].reverse().join(''), why: '' },
    ]),
    why: `Line the demonstration up letter by letter: every letter of ${demo} moves
      <b>${Math.abs(k)} ${k > 0 ? 'forward' : 'backward'}</b>${reverse ? ', and the whole word is then written backwards' : ''}.<br>
      ${ask1} → ${[...ask1].map(ch => chr(pos(ch) + k)).join('')}${reverse ? ` → reversed → <b>${key}</b>` : ` = <b>${key}</b>`}`,
    hardness: 1 + (reverse ? 1.4 : 0) + Math.abs(k) / 4 + ask1.length / 12,
    concept: 'find-the-shift', conceptLabel: 'A shift with a twist',
    source: 'Shape of RAS 2021, Q124',
  });
};

/* RAS 2018 Q108: WYB, SWD, OUF, KSH — three letter columns, each running at
   its own rate. Reading them as one series is the mistake. */
const tripleSeries = (R, tier) => {
  const steps = [R.pick([-4, -3, 4, 3]), R.pick([-2, 2, -1]), R.pick([2, 3, -2])];
  const start = [R.int(14, 24), R.int(14, 24), R.int(2, 6)];
  const terms = [];
  for (let i = 0; i < 5; i++) {
    const t = start.map((s, j) => s + steps[j] * i);
    if (t.some(x => x < 1 || x > 26)) return null;
    terms.push(t.map(chr).join(''));
  }
  const key = terms[4];
  const drift = start.map((s, j) => s + steps[j] * 4 + (j === 0 ? 1 : 0)).map(chr).join('');
  const sameStep = start.map((s, j) => s + steps[0] * 4).map(x => chr(x)).join('');
  if (new Set([key, drift, sameStep]).size < 3) return null;
  return ask({
    context: `Look at the series: <b>${terms.slice(0, 4).join(', ')}, ?</b>`,
    q: 'The next term is',
    opts: options(key, [
      { v: drift, why: 'One column is off by a letter — check the first letters again: they move in equal steps.' },
      { v: sameStep, why: 'All three letters do not move at the same rate; each column has its own step.' },
      { v: [...key].reverse().join(''), why: '' },
      { v: start.map((s, j) => chr(s + steps[j] * 5)).join(''), why: 'That is the term after the one asked for.' },
    ]),
    why: `Take the columns separately:<br>
      first letters ${terms.slice(0, 4).map(t => t[0]).join(', ')} → ${steps[0] > 0 ? '+' : '−'}${Math.abs(steps[0])} each time;<br>
      second ${terms.slice(0, 4).map(t => t[1]).join(', ')} → ${steps[1] > 0 ? '+' : '−'}${Math.abs(steps[1])};<br>
      third ${terms.slice(0, 4).map(t => t[2]).join(', ')} → ${steps[2] > 0 ? '+' : '−'}${Math.abs(steps[2])}.<br>
      Next: <b>${key}</b>.`,
    hardness: 2.1,
    concept: 'letter-positions', conceptLabel: 'Three columns at once',
    source: 'Shape of RAS 2018, Q108',
  });
};

/* RAS 2015 Q107: a long letter string built from a repeating block, with
   letters knocked out. The block has to be found before anything can be filled. */
const missingLetters = (R, tier) => {
  const size = byTier(tier, 3, 4, 4);
  const block = R.some(['a', 'b', 'c', 'd', 'e'], size).join('');
  const reps = byTier(tier, 4, 5, 6);
  const full = block.repeat(reps);
  const blanks = R.some([...Array(full.length).keys()].filter(i => i > 2 && i < full.length - 1), byTier(tier, 3, 4, 5))
    .sort((a, b) => a - b);
  const shown = [...full].map((ch, i) => (blanks.includes(i) ? '_' : ch)).join('');
  const key = blanks.map(i => full[i]).join('');
  const shifted = blanks.map(i => full[(i + 1) % full.length]).join('');
  const reversed = [...key].reverse().join('');
  if (new Set([key, shifted, reversed]).size < 3) return null;
  return ask({
    context: `Some letters are missing from the series below:<br>
      <code style="font-size:17px;letter-spacing:2px">${shown}</code>`,
    q: 'The missing letters, in order, are',
    opts: options(key, [
      { v: shifted, why: 'Each letter here is one place along in the block — the blanks have been lined up wrongly.' },
      { v: reversed, why: 'Right letters, listed from the wrong end.' },
      { v: blanks.map(i => full[(i + 2) % full.length]).join(''), why: '' },
      { v: block.slice(0, blanks.length), why: 'That is the start of the repeating block, not what sits in the gaps.' },
    ]),
    why: `The string repeats the block <b>${block}</b> ${reps} times. Writing it out in blocks of
      ${size} shows what belongs at each gap: <b>${key}</b>.`,
    hardness: 1.4 + size / 3,
    concept: 'alternate-terms', conceptLabel: 'Finding the repeating block',
    source: 'Shape of RAS 2015, Q107',
  });
};

/* RAS 2018 Q107: "If 4 + 5 − 2 = 33 and 10 + 12 − 5 = 119, then 6 + 8 − 3 = ?"
   A made-up operator, shown twice, applied once. */
const madeUpOperator = (R, tier) => {
  const RULES = [
    { f: (a, b, c) => a * b + c * a - c, say: 'ab + ca − c' },
    { f: (a, b, c) => (a + b) * c + a, say: '(a + b)c + a' },
    { f: (a, b, c) => a * b - c * c, say: 'ab − c²' },
    { f: (a, b, c) => (a + b + c) * (a - c), say: '(a + b + c)(a − c)' },
    { f: (a, b, c) => a * b * c - (a + b + c), say: 'abc − (a + b + c)' },
    { f: (a, b, c) => (a * b) / c + a * c, say: 'ab/c + ac' },
  ];
  const rule = R.pick(byTier(tier, RULES.slice(0, 3), RULES, RULES.slice(2)));
  const triple = () => {
    for (let t = 0; t < 40; t++) {
      const a = R.int(3, byTier(tier, 9, 12, 15)), b = R.int(3, byTier(tier, 9, 14, 18)), c = R.int(2, Math.min(a, 7));
      const v = rule.f(a, b, c);
      if (Number.isInteger(v) && v > 5 && v < 1000) return [a, b, c, v];
    }
    return null;
  };
  const one = triple(), two = triple(), three = triple();
  if (!one || !two || !three) return null;
  if (new Set([one[3], two[3], three[3]]).size < 3) return null;
  const [a, b, c, key] = three;
  return ask({
    context: `If <b>${one[0]} + ${one[1]} − ${one[2]} = ${one[3]}</b> and
      <b>${two[0]} + ${two[1]} − ${two[2]} = ${two[3]}</b>,`,
    q: `then <b>${a} + ${b} − ${c} = ?</b>`,
    opts: options(String(key), [
      { v: String(a + b - c), why: 'That is ordinary arithmetic. The two examples show that + and − mean something else here.' },
      { v: String(a * b - c), why: '' },
      { v: String(key + a), why: '' },
      { v: String(Math.abs(key - c)), why: '' },
    ], i => String(key + 2 * (i + 1) + 1)),
    why: `Test a rule against BOTH examples before using it. Here the pattern is <b>${rule.say}</b>:<br>
      ${one[0]}, ${one[1]}, ${one[2]} → ${one[3]} ✓ and ${two[0]}, ${two[1]}, ${two[2]} → ${two[3]} ✓.<br>
      So ${a}, ${b}, ${c} → <b>${key}</b>.`,
    hardness: 2.4,
    concept: 'second-differences', conceptLabel: 'An invented operation',
    source: 'Shape of RAS 2018, Q107',
  });
};

export const CODE_GENERATORS = [
  gen('ras-code-lang', 'codes', 'reasoning:5', 'name-the-family', 'Invented languages', language),
  gen('ras-code-shift', 'codes', 'reasoning:5', 'find-the-shift', 'Shift with a twist', shiftAndReverse),
  gen('ras-code-triple', 'codes', 'reasoning:5', 'letter-positions', 'Three-letter series', tripleSeries),
  gen('ras-code-blanks', 'codes', 'reasoning:5', 'alternate-terms', 'Repeating blocks', missingLetters),
  gen('ras-code-oper', 'codes', 'reasoning:5', 'second-differences', 'Invented operations', madeUpOperator),
];
