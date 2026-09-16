/* ============================================================
   Cause chain — the widget for Course of Action.

   A "course of action" question is not a matter of taste, and the
   examiner does not want your opinion of the policy. The problem
   statement describes a CHAIN: a cause, the mechanism it runs
   through, and the effect people complain about. A proposed action
   attaches to exactly one node of that chain, and its fate is then
   decided by three properties of the node it attaches to.

     1 · Is the node even in the chain?   (invented causes fail)
     2 · Has this actor power at it?      (wishing at a node you cannot
                                           reach is not a course of action)
     3 · Does it remove something people
         depend on without replacing it?  (then it is a new problem, not a remedy)

   `judgeAction` derives the verdict from those three, so no action here
   carries a stored yes/no. Change a node's agency and the verdicts
   change with it — which is exactly what should happen.
   ============================================================ */

/** The whole rule, in one function. Everything visible on screen comes from this. */
export function judgeAction(chain, action) {
  const node = (chain.nodes || []).find(n => n.key === action.node);
  if (!node) return { follows: false, reason: 'off-chain', node: null };
  if (!(node.agency || []).includes(action.actor)) return { follows: false, reason: 'no-power', node };
  if (action.removes && !action.replaces) return { follows: false, reason: 'unreplaced', node };
  return { follows: true, reason: node.kind === 'effect' ? 'relief' : 'remedy', node };
}

const WHY = {
  'off-chain': {
    head: 'Does not follow — it is not about this problem',
    body: `This attaches to nothing in the chain. The statement never mentions it, so acting here
           cannot touch the problem described. An action that answers a different question is the
           easiest wrong option in the paper to spot, once you look for the node.`,
  },
  'no-power': {
    head: 'Does not follow — nobody here can act at that node',
    body: `The node is real, but the actor named has no power over it. A course of action must be
           something that can actually be <em>done</em> by whoever is being asked to do it;
           otherwise it is a wish.`,
  },
  unreplaced: {
    head: 'Does not follow — it removes what people depend on',
    body: `This takes away the thing people rely on and puts nothing in its place. It would end the
           stated problem by creating a larger one, which is never an acceptable remedy.`,
  },
  remedy: {
    head: 'Follows — it acts on the pathway itself',
    body: `The node is in the chain, the actor has power over it, and nothing people depend on is
           taken away unreplaced. This attacks the mechanism, so it is a genuine remedy.`,
  },
  relief: {
    head: 'Follows — immediate relief at the effect',
    body: `This attaches at the effect rather than the cause, so it relieves rather than cures —
           but relief for people already harmed is a legitimate course of action, and the examiner
           accepts it alongside a remedy further up the chain.`,
  },
};

const KIND = { cause: 'Root cause', link: 'Mechanism', effect: 'Effect' };

export function causeChain(cfg) {
  const { problem = '', nodes = [], actors = {}, actions = [] } = cfg;
  const chain = { nodes };

  return (el, api = {}) => {
    let sel = 0;                       // action currently being placed
    const placed = new Map();          // action index -> node key the learner chose
    let wrong = 0;

    el.innerHTML = `
      <div class="ch">
        <div class="pw-stmt"><span>The situation</span><p>${problem}</p></div>
        <p class="pw-lab">The chain the statement describes</p>
        <div class="ch-chain" id="ccChain"></div>
        <p class="pw-lab">Pick an action, then click the node it acts on</p>
        <div class="ch-actions" id="ccActs"></div>
        <div class="ch-out" id="ccOut"></div>
      </div>`;

    const $ = id => el.querySelector('#' + id);

    const draw = () => {
      const cur = actions[sel];
      const curNode = placed.get(sel);

      $('ccChain').innerHTML = nodes.map((n, i) => `
        ${i ? '<span class="ch-arrow" aria-hidden="true">→</span>' : ''}
        <button class="ch-node ch-node--${n.kind} ${curNode === n.key ? 'is-picked' : ''}"
                data-k="${n.key}">
          <span class="ch-kind">${KIND[n.kind] || n.kind}</span>
          <span class="ch-node-lab">${n.label}</span>
          <span class="ch-who">${(n.agency || []).length
            ? (n.agency || []).map(a => actors[a] || a).join(' · ')
            : 'nobody here can act'}</span>
        </button>`).join('')
        // an action can also attach to nothing at all, and saying so must be possible
        + `<span class="ch-arrow" aria-hidden="true">|</span>
           <button class="ch-node ch-node--none ${curNode === '__none__' ? 'is-picked' : ''}"
                   data-k="__none__">
             <span class="ch-kind">Off the chain</span>
             <span class="ch-node-lab">Nothing here</span>
             <span class="ch-who">the statement never mentions it</span>
           </button>`;

      $('ccActs').innerHTML = actions.map((a, i) => {
        const done = placed.has(i);
        const v = done ? judgeAction(chain, a) : null;
        return `<button class="ch-act ${i === sel ? 'is-sel' : ''}
                       ${done ? (v.follows ? 'is-yes' : 'is-no') : ''}" data-i="${i}">
          <span class="ch-act-n">${i + 1}</span>
          <span class="ch-act-txt">${a.text}</span>
          <span class="ch-act-who">${actors[a.actor] || a.actor}</span>
        </button>`;
      }).join('');

      if (!placed.has(sel)) {
        $('ccOut').innerHTML = `<div class="ch-hint">Where in the chain does action ${sel + 1} act?
          If you cannot find a node for it, that is itself the answer.</div>`;
      } else {
        const v = judgeAction(chain, cur);
        const right = curNode === (cur.node || '__none__');
        const why = WHY[v.reason];
        $('ccOut').innerHTML = `
          <div class="ch-verdict ${v.follows ? 'is-yes' : 'is-no'}">
            <b>${why.head}</b>
            <p>${why.body}</p>
            ${v.node ? `<p class="ch-at">Acting at: <em>${v.node.label}</em>
              — ${(v.node.agency || []).length
                ? `power lies with ${(v.node.agency || []).map(a => actors[a] || a).join(', ')}`
                : 'no authority in this problem has power here'}.</p>` : ''}
            ${right ? '' : `<p class="ch-at">You placed it elsewhere — look again at what it
              actually touches.</p>`}
          </div>`;
      }

      api.report?.({
        placed: placed.size, total: actions.length,
        placedAll: placed.size === actions.length,
        wrong,
        sawFollows: [...placed.keys()].some(i => judgeAction(chain, actions[i]).follows),
        sawFails: [...placed.keys()].some(i => !judgeAction(chain, actions[i]).follows),
        offChainFound: [...placed.keys()].some(i => judgeAction(chain, actions[i]).reason === 'off-chain'),
      });
    };

    el.addEventListener('click', e => {
      const act = e.target.closest('.ch-act');
      if (act) { sel = +act.dataset.i; return draw(); }
      const node = e.target.closest('.ch-node');
      if (node) {
        if (placed.get(sel) !== node.dataset.k && node.dataset.k !== (actions[sel].node || '__none__')) wrong++;
        placed.set(sel, node.dataset.k);
        return draw();
      }
    });

    draw();
    return { destroy() { el.innerHTML = ''; } };
  };
}
