/* ============================================================
   Relation mapper — name the relationship BEFORE looking at options.

   Analogy questions are lost by candidates who compare topics
   ("pen and knife are both tools, so…") instead of relationships.
   This widget forces the naming step first, then makes you apply
   the named relation to a second pair.
   ============================================================ */

export const RELATIONS = [
  { id: 'function', name: 'Tool → what it does',        eg: 'Pen : Write' },
  { id: 'part',     name: 'Part → whole',               eg: 'Petal : Flower' },
  { id: 'cause',    name: 'Cause → effect',             eg: 'Virus : Illness' },
  { id: 'member',   name: 'Member → category',          eg: 'Sparrow : Bird' },
  { id: 'worker',   name: 'Worker → workplace',         eg: 'Judge : Court' },
  { id: 'opposite', name: 'Opposites',                  eg: 'Ancient : Modern' },
  { id: 'degree',   name: 'Smaller → larger degree',    eg: 'Warm : Hot' },
  { id: 'product',  name: 'Raw material → product',     eg: 'Cotton : Cloth' },
];

/* Scripted-action surface — see turnDialMachine in compass.js.
   A round is name → confirm → apply → confirm, and the widget reports on the
   two answers but not on the two confirmations, so `out` carries the last
   report and stays null until the learner has answered something. */
export function relationMapperMachine({ rounds = [] } = {}) {
  const add = (xs, x) => (xs.includes(x) ? xs : [...xs, x]);
  const init = { at: 0, step: 'name', namedRight: 0, appliedRight: 0, namedTypes: [], out: null };
  return {
    init,
    actions(st) {
      if (st.step === 'name') return RELATIONS.map(r => `r:${r.id}`);
      if (st.step === 'apply') return rounds[st.at].options.map((_, i) => `a:${i}`);
      if (st.step === 'done') return [];
      return ['go'];
    },
    act(st, a) {
      const r = rounds[st.at];
      if (a === 'go') {
        if (st.step === 'named') return { ...st, step: 'apply' };
        const at = st.at + 1;
        if (at < rounds.length) return { ...st, at, step: 'name' };
        return { ...st, at, step: 'done',
                 out: { finished: true, namedRight: st.namedRight,
                        appliedRight: st.appliedRight, rounds: rounds.length } };
      }
      if (a[0] === 'r') {
        const id = a.slice(2);
        const next = { ...st, step: 'named', namedTypes: add(st.namedTypes, id),
                       namedRight: st.namedRight + (id === r.rel ? 1 : 0) };
        return { ...next, out: { at: next.at, phase: 'name', namedRight: next.namedRight,
                                 appliedRight: next.appliedRight,
                                 namedTypes: next.namedTypes.length, finished: false } };
      }
      const i = +a.slice(2);
      const next = { ...st, step: 'answered',
                     appliedRight: st.appliedRight + (i === r.answer ? 1 : 0) };
      return { ...next, out: { at: next.at, phase: 'apply', namedRight: next.namedRight,
                               appliedRight: next.appliedRight,
                               namedTypes: next.namedTypes.length,
                               finished: next.at + 1 >= rounds.length } };
    },
    report: st => st.out,          // null until the first answer is given
  };
}

export function relationMapper(cfg = {}) {
  const { rounds = [] } = cfg;
  const M = relationMapperMachine(cfg);
  return (el, api = {}) => {
    let st = M.init;

    const $ = id => el.querySelector('#' + id);

    const render = () => {
      const { at } = st;
      const r = rounds[at];

      if (st.step === 'done') {
        el.innerHTML = `<div class="rm"><div class="rm-done">
          <b>Finished.</b> You named ${st.namedRight} of ${rounds.length} relationships correctly and
          applied ${st.appliedRight} of ${rounds.length}.
          <p>The naming step is the one that transfers — the options change every year, the
             relationships do not.</p></div></div>`;
        api.report?.(M.report(st));
        return;
      }

      el.innerHTML = `
        <div class="rm">
          <div class="rm-pair"><b>${r.a}</b><span>:</span><b>${r.b}</b></div>
          ${st.step === 'name'
            ? `<p class="rm-ask">First — <b>name the relationship</b>. Do not look ahead.</p>
               <div class="rm-opts" id="rmOpts">
                 ${RELATIONS.map(x => `<button class="rm-opt" data-r="${x.id}">
                    <b>${x.name}</b><em>${x.eg}</em></button>`).join('')}
               </div>`
            : `<div class="rm-named">Relationship: <b>${RELATIONS.find(x => x.id === r.rel).name}</b></div>
               <p class="rm-ask">Now apply <em>the same relationship</em> to complete this pair:</p>
               <div class="rm-pair rm-pair--q"><b>${r.c}</b><span>:</span><b class="rm-blank">?</b></div>
               <div class="rm-opts rm-opts--flat" id="rmOpts">
                 ${r.options.map((o, i) => `<button class="rm-opt rm-opt--flat" data-i="${i}">${o}</button>`).join('')}
               </div>`}
          <div class="rm-fb" id="rmFb"></div>
        </div>`;

      el.querySelectorAll('.rm-opt').forEach(b => b.onclick = () =>
        st.step === 'name' ? pickRelation(b.dataset.r) : pickAnswer(+b.dataset.i));
    };

    const advance = () => { st = M.act(st, 'go'); render(); };

    const pickRelation = id => {
      const { at } = st, r = rounds[at];
      const ok = id === r.rel;
      st = M.act(st, `r:${id}`);
      el.querySelectorAll('.rm-opt').forEach(b => {
        b.disabled = true;
        if (b.dataset.r === r.rel) b.classList.add('is-right');
        if (b.dataset.r === id && !ok) b.classList.add('is-wrong');
      });
      $('rmFb').innerHTML = `<div class="rm-note ${ok ? 'is-ok' : 'is-no'}">
        ${ok ? '' : 'Not quite. '}<b>${r.a} : ${r.b}</b> is
        <b>${RELATIONS.find(x => x.id === r.rel).name.toLowerCase()}</b>. ${r.why}</div>
        <button class="btn rm-next" id="rmGo">Now apply it →</button>`;
      $('rmGo').onclick = advance;
      api.report?.(M.report(st));
    };

    const pickAnswer = i => {
      const { at } = st, r = rounds[at];
      const ok = i === r.answer;
      st = M.act(st, `a:${i}`);
      el.querySelectorAll('.rm-opt').forEach((b, k) => {
        b.disabled = true;
        if (k === r.answer) b.classList.add('is-right');
        if (k === i && !ok) b.classList.add('is-wrong');
      });
      $('rmFb').innerHTML = `<div class="rm-note ${ok ? 'is-ok' : 'is-no'}">${r.applyWhy}</div>
        <button class="btn rm-next" id="rmGo">${at + 1 < rounds.length ? 'Next pair →' : 'See result'}</button>`;
      $('rmGo').onclick = advance;
      api.report?.(M.report(st));
    };

    render();
    return { destroy() { el.innerHTML = ''; } };
  };
}
