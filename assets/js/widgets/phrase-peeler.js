/* ============================================================
   Phrase peeler — teaches the one technique that cracks every
   "pointing to a photograph" question: never read left to right.

   Find the innermost "of", resolve it to exactly ONE person,
   substitute that person back into the sentence, repeat.

   The learner clicks to peel one layer at a time and watches the
   sentence physically shrink until a single person is left.
   ============================================================ */

/* Scripted-action surface — see turnDialMachine in compass.js. One action, one
   layer: the whole widget is a walk down the phrase, so the sweep is that walk. */
export function phrasePeelerMachine({ layers = [] } = {}) {
  return {
    init: { at: 0 },
    actions: st => (st.at < layers.length ? ['peel'] : []),
    act: (st, _) => ({ at: st.at + 1 }),
    report: st => ({ peeled: st.at, total: layers.length, finished: st.at >= layers.length }),
  };
}

export function phrasePeeler(cfg) {
  const { quote, speaker, layers, answer } = cfg;
  const M = phrasePeelerMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    const render = () => {
      const at = st.at;
      const done = at >= layers.length;
      const current = at === 0 ? quote : layers[at - 1].becomes;

      el.innerHTML = `
        <div class="pp">
          <p class="pp-speaker">${speaker}</p>
          <div class="pp-sentence ${done ? 'is-done' : ''}" id="ppS">
            <span class="pp-quote">“${current}”</span>
          </div>

          <ol class="pp-log">
            ${layers.slice(0, at).map((l, i) => `
              <li>
                <span class="pp-n">${i + 1}</span>
                <div><p class="pp-peel"><em>${l.inner}</em> → <b>${l.resolves}</b></p>
                     <p class="pp-why">${l.why}</p></div>
              </li>`).join('')}
          </ol>

          ${done
            ? `<div class="pp-answer"><span>One person left</span><b>${answer}</b></div>`
            : `<button class="btn pp-go" id="ppGo">
                 Resolve “<em>${layers[at].inner}</em>”
               </button>
               <p class="pp-hint">${layers[at].hint || 'Always take the innermost phrase first.'}</p>`}
        </div>`;

      if (!done) el.querySelector('#ppGo').onclick = () => { st = M.act(st, 'peel'); render(); };
      api.report?.(M.report(st));
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}
