/* ============================================================
   Coded-relation decoder.

   Expressions like  A $ B # C * D  strip away every word, which is
   exactly why RPSC likes them. The cure is mechanical: decode ONE
   symbol at a time, and let the tree grow as you go.

   Reuses the family-tree engine so the diagram is identical to the
   one taught in "The Five Marks".
   ============================================================ */

import { buildGraph, treeSVG } from './family-tree.js';

export const SYMBOLS = {
  '$': { rel: 'father',  words: 'is the father of' },
  '#': { rel: 'mother',  words: 'is the mother of' },
  '@': { rel: 'brother', words: 'is the brother of' },
  '*': { rel: 'sister',  words: 'is the sister of' },
  '&': { rel: 'husband', words: 'is the husband of' },
};

/** "A $ B # C" -> [{a:'A', sym:'$', b:'B'}, {a:'B', sym:'#', b:'C'}] */
export function parseExpression(expr) {
  const t = expr.trim().split(/\s+/);
  const out = [];
  for (let i = 1; i < t.length; i += 2) out.push({ a: t[i - 1], sym: t[i], b: t[i + 1] });
  return out;
}

/* Scripted-action surface — see turnDialMachine in compass.js. One action per
   symbol, which is the point of the widget: the chain is decoded one link at a
   time and never in bulk. */
export function codedChainMachine({ expression = '' } = {}) {
  const total = parseExpression(expression).length;
  return {
    init: { at: 0 },
    actions: st => (st.at < total ? ['decode'] : []),
    act: (st, _) => ({ at: st.at + 1 }),
    report: st => ({ decoded: st.at, total, finished: st.at >= total }),
  };
}

export function codedChain(cfg) {
  const { expression, question, legend = Object.keys(SYMBOLS) } = cfg;
  const M = codedChainMachine(cfg);
  return (el, api = {}) => {
    const links = parseExpression(expression);
    let st = M.init;

    const render = () => {
      const at = st.at;
      const decoded = links.slice(0, at);
      const sentences = decoded.map(l => ({ a: l.a, rel: SYMBOLS[l.sym].rel, b: l.b }));
      const { persons, edges } = buildGraph(sentences);
      const done = at >= links.length;

      el.innerHTML = `
        <div class="cc">
          <div class="cc-legend">
            ${legend.map(s => `<span class="cc-key"><b>${s}</b>${SYMBOLS[s].words.replace('is the ', '')}</span>`).join('')}
          </div>

          <div class="cc-expr">
            ${links.map((l, i) => `
              <span class="cc-tok ${i < at ? 'is-done' : ''} ${i === at ? 'is-next' : ''}">
                ${i === 0 ? `<i>${l.a}</i>` : ''}<b>${l.sym}</b><i>${l.b}</i>
              </span>`).join('')}
          </div>

          <div class="cc-stage">${treeSVG(persons, edges, { empty: 'Decode the first symbol to start the tree.' })}</div>

          <ol class="cc-log">
            ${decoded.map((l, i) => `<li><span class="cc-n">${i + 1}</span>
               <b>${l.a}</b> ${SYMBOLS[l.sym].words} <b>${l.b}</b>
               <em>— so ${l.a} is ${SYMBOLS[l.sym].rel === 'mother' || SYMBOLS[l.sym].rel === 'sister' ? 'female' : 'male'}</em></li>`).join('')}
          </ol>

          ${done
            ? `<div class="cc-done">${question || 'Chain fully decoded — now read the level gap off the tree.'}</div>`
            : `<button class="btn cc-go" id="ccGo">Decode <b>${links[at].a} ${links[at].sym} ${links[at].b}</b></button>`}
        </div>`;

      if (!done) el.querySelector('#ccGo').onclick = () => { st = M.act(st, 'decode'); render(); };
      api.report?.(M.report(st));
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}

/** Static decoded tree, for reveal steps. */
export function codedTree(expression) {
  return el => {
    const sentences = parseExpression(expression)
      .map(l => ({ a: l.a, rel: SYMBOLS[l.sym].rel, b: l.b }));
    const { persons, edges } = buildGraph(sentences);
    el.innerHTML = `<div class="cc-stage">${treeSVG(persons, edges)}</div>`;
    return { destroy() {} };
  };
}
