/* ============================================================
   Lesson runner — the loop every lesson follows.

   Hook → Explore → Predict → Reveal → Drill → Mastery

   The pedagogical rule, taken from Brilliant: the learner must
   COMMIT to an answer before any explanation appears. So `ask`
   steps never reveal their reasoning until a choice is locked in.

   A lesson is data. It composes four primitives:
     say     — Betaal speaks; optional rich body / figure
     explore — mount an interactive widget with a task checklist
     ask     — a question (used for predict, drill AND mastery)
     reveal  — the worked solution, step by step
   ============================================================ */

import * as store from './store.js';
import { betaalSVG, betaalSays, say as betaalSay, LINES, pick } from './betaal.js';
import { orderOptions, seedFor } from './options.js';
import { chapterOf } from './curriculum.js';
import { refreshAchievements } from './progress.js';
import { ACHIEVEMENTS } from './achievements.js';
import { href, reteachPath } from './routes.js';

const $ = (sel, root = document) => root.querySelector(sel);

/**
 * Does this explore step hold the Continue button until its checklist is done?
 *
 * A checklist gates by default — that is what makes an explore step teach
 * rather than decorate. A re-teach sets `gate: false` on the step it borrowed:
 * the learner is there to be shown the idea again, and making them re-drive
 * the widget before they may answer is a toll booth, not a lesson.
 *
 * Pure, exported and one line, so the harness can hold it to both halves of
 * that rule without a DOM.
 */
export const gates = s => !!(s.tasks && s.tasks.length) && s.gate !== false;

/**
 * Does this session's finish screen offer to re-teach what was missed?
 *
 * Only a practice set does. At the end of a LESSON it would be noise — the
 * explanation is the page they just read and the path is one button away. At
 * the end of a RE-TEACH it would be a loop, so that case escalates to the
 * whole lesson instead. Pure and exported for the same reason as `gates`.
 */
export const offersReteach = def => !!def.review && !def.reteach;

export class Lesson {
  constructor(def, mount) {
    this.def = def;
    this.root = mount;
    this.i = 0;
    this.asked = 0;
    this.right = 0;
    this.firstTry = new Map();   // concept -> was it right on first meeting
    this.missed = new Map();     // concept -> its label, if wrong at ANY point here
    this.render();
  }

  get step() { return this.def.steps[this.i]; }
  get isLast() { return this.i >= this.def.steps.length - 1; }

  /* ---------- shell ---------- */
  render() {
    this.root.innerHTML = `
      <div class="lsn">
        <header class="lsn__bar">
          <a class="lsn__x" href="${this.def.backHref}" aria-label="Leave lesson">✕</a>
          <div class="lsn__rail" id="rail"></div>
          <div class="lsn__meta"><span class="num" id="lsnScore">0/0</span></div>
        </header>
        <main class="lsn__body"><div class="lsn__stage" id="stage"></div></main>
        <footer class="lsn__act"><div class="lsn__act-in" id="act"></div></footer>
      </div>`;
    this.rail = $('#rail', this.root);
    this.stage = $('#stage', this.root);
    this.act = $('#act', this.root);
    this.drawRail();
    this.drawStep();
  }

  drawRail() {
    const groups = this.def.steps.map(s => s.phase || '—');
    const seen = [];
    groups.forEach(g => { if (!seen.includes(g)) seen.push(g); });
    this.rail.innerHTML = seen.map(g => {
      const idxs = groups.map((x, i) => x === g ? i : -1).filter(i => i >= 0);
      const done = idxs.every(i => i < this.i);
      const active = idxs.includes(this.i);
      return `<span class="rail__seg ${done ? 'is-done' : ''} ${active ? 'is-now' : ''}" title="${g}">
                <i></i><em>${g}</em></span>`;
    }).join('');
    $('#lsnScore', this.root).textContent = `${this.right}/${this.asked}`;
  }

  drawStep() {
    const s = this.step;
    this.stage.scrollTop = 0;
    this.stage.innerHTML = '';
    this.act.innerHTML = '';
    this.drawRail();
    const render = { say: 'renderSay', explore: 'renderExplore', ask: 'renderAsk', reveal: 'renderReveal' }[s.type];
    if (!render) throw new Error(`Unknown step type "${s.type}" in ${this.def.id}`);
    this[render](s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  next() {
    if (this.isLast) return this.finish();
    this.i++;
    if (this.widget?.destroy) this.widget.destroy();
    this.widget = null;
    this.drawStep();
  }

  primary(label, fn, opts = {}) {
    this.act.innerHTML = `<button class="btn btn--lg ${opts.cls || ''}" id="go">${label}</button>`;
    $('#go', this.act).onclick = fn;
    return $('#go', this.act);
  }

  /* ---------- step: say ---------- */
  renderSay(s) {
    this.stage.innerHTML = `
      ${s.title ? `<p class="eyebrow">${s.phase || ''}</p><h2 class="lsn__h">${s.title}</h2>` : ''}
      ${betaalSays(s.say, { mood: s.mood || 'neutral', size: 72 })}
      ${s.body ? `<div class="prose">${s.body}</div>` : ''}
      ${s.figure ? `<div class="figure">${s.figure}</div>` : ''}`;
    this.primary(s.cta || 'Continue', () => this.next());
  }

  /* ---------- step: explore ---------- */
  renderExplore(s) {
    this.stage.innerHTML = `
      <p class="eyebrow">${s.phase || 'Explore'}</p><h2 class="lsn__h">${s.title}</h2>
      ${betaalSays(s.say, { mood: s.mood || 'teasing', size: 64, compact: true })}
      <div class="explore">
        <div class="explore__stage" id="wg"></div>
        ${s.tasks ? `<ol class="tasklist" id="tasks">${s.tasks.map(t =>
          `<li><span class="tick"></span>${t.label}</li>`).join('')}</ol>` : ''}
      </div>`;

    const btn = this.primary(s.cta || 'I have explored this', () => this.next());
    if (gates(s)) btn.disabled = true;

    // Tasks are STICKY: once achieved they stay ticked. Several checklists ask for
    // states that are mutually exclusive at any single instant — "end up diagonally"
    // and "return to the start" can never both be true right now, but a learner can
    // certainly have done both.
    const achieved = new Set();
    const api = {
      /** widget calls this whenever its state changes; we re-test the checklist */
      report: state => {
        if (!s.tasks) return;
        const items = [...$('#tasks', this.stage).children];
        s.tasks.forEach((t, k) => {
          if (t.done(state)) achieved.add(k);
          items[k].classList.toggle('is-done', achieved.has(k));
        });
        const allDone = achieved.size === s.tasks.length;
        if (allDone) {
          btn.disabled = false;
          btn.textContent = s.ctaDone || 'Continue';
          if (!this._praised) {
            this._praised = true;
            betaalSay(this.stage.querySelector('.says'), s.onComplete || 'Good. You have the shape of it now.', 'pleased');
          }
        }
      },
    };
    this._praised = false;
    this.widget = s.widget(  $('#wg', this.stage), api );
  }

  /* ---------- step: ask ---------- */
  renderAsk(step) {
    const numeric = step.input === 'number';
    /* Order the options before anything reads them, so the buttons, the scoring
       and the right-answer highlight all agree. See options.js for why. */
    const s = numeric ? step : orderOptions(step, seedFor(this.def.id, step, this.i));
    this.stage.innerHTML = `
      <p class="eyebrow">${s.phase || 'Question'}</p>
      ${s.say ? betaalSays(s.say, { mood: s.mood || 'thinking', size: 60, compact: true }) : ''}
      <div class="qcard">
        ${s.context ? `<div class="qcontext">${s.context}</div>` : ''}
        <p class="qtext">${s.q}</p>
        ${numeric
          ? `<div class="ansrow"><input class="ansinput num" id="ansIn" type="text" inputmode="decimal"
               placeholder="your answer" autocomplete="off"><span class="ansunit">${s.unit || ''}</span></div>`
          : `<div class="opts" id="opts">${s.options.map((o, k) =>
               `<button class="opt" data-k="${k}">${o}</button>`).join('')}</div>`}
      </div>
      <div id="fb"></div>`;

    let locked = false;
    const lock = choiceIdx => {
      if (locked) return;
      locked = true;
      const ok = numeric
        ? Math.abs(parseFloat($('#ansIn', this.stage).value) - s.answer) < (s.tol ?? 1e-9)
        : choiceIdx === s.answer;

      this.asked++;
      if (ok) this.right++;
      const key = s.concept || this.def.id;
      const label = s.conceptLabel || s.concept || this.def.title;
      if (!this.firstTry.has(key)) this.firstTry.set(key, ok);
      /* The label is kept, not only the id: the finish screen offers to teach
         what was missed, and "turn-frame" is not something to say to a learner. */
      if (!ok) this.missed.set(key, label);
      /* A practice or drill session declares its own chapter; a lesson IS one,
         so its id resolves to the chapter it sits in. */
      store.answered(key, ok, label, this.def.chapter || chapterOf(this.def.id));

      if (!numeric) {
        [...$('#opts', this.stage).children].forEach((b, k) => {
          b.disabled = true;
          if (k === s.answer) b.classList.add('is-right');
          if (k === choiceIdx && !ok) b.classList.add('is-wrong');
        });
      } else {
        $('#ansIn', this.stage).disabled = true;
        $('#ansIn', this.stage).classList.add(ok ? 'is-right' : 'is-wrong');
      }

      const line = ok ? pick(LINES.rightFirstTry) : pick(LINES.wrong);
      /* What THAT option was, when the question knows. One paragraph per
         question tells the learner who picked C the same thing as the learner
         who picked A, and neither of them is being answered — the misconception
         that produced the choice is the thing worth naming. `whyOption` is
         permuted with the options (see options.js), so it cannot point at the
         wrong one. Absent on most written questions; see §6g. */
      const picked = !ok && !numeric && Array.isArray(s.whyOption) ? s.whyOption[choiceIdx] : null;
      $('#fb', this.stage).innerHTML = `
        <div class="verdict ${ok ? 'is-ok' : 'is-no'}">
          <div class="verdict__head">${betaalSVG(ok ? 'pleased' : 'teasing', 46)}
            <div><b>${ok ? 'Correct' : 'Not this time'}</b><p>${line}</p></div></div>
          ${picked ? `<p class="verdict__pick"><span>You chose ${s.options[choiceIdx]}</span>${picked}</p>` : ''}
          <div class="verdict__why">${ok ? (s.whyRight || s.why || '') : (s.whyWrong || s.why || '')}</div>
          ${s.source ? `<p class="verdict__src">${s.source}</p>` : ''}
          ${s.figure ? `<figure class="verdict__fig">${s.figure}
            ${s.figureCap ? `<figcaption>${s.figureCap}</figcaption>` : ''}</figure>` : ''}
        </div>`;
      if (ok) this.celebrate();
      this.drawRail();
      this.primary(this.isLast ? 'Finish lesson' : 'Continue', () => this.next());
    };

    if (numeric) {
      const input = $('#ansIn', this.stage);
      const btn = this.primary('Check', () => lock());
      btn.disabled = true;
      input.oninput = () => { btn.disabled = !input.value.trim(); };
      input.onkeydown = e => { if (e.key === 'Enter' && input.value.trim()) lock(); };
      setTimeout(() => input.focus(), 60);
    } else {
      [...$('#opts', this.stage).children].forEach(b =>
        b.onclick = () => lock(+b.dataset.k));
      this.act.innerHTML = `<p class="act-hint">Choose an answer</p>`;
    }
  }

  /* ---------- step: reveal ---------- */
  renderReveal(s) {
    this.stage.innerHTML = `
      <p class="eyebrow">${s.phase || 'Reveal'}</p><h2 class="lsn__h">${s.title}</h2>
      ${s.say ? betaalSays(s.say, { mood: s.mood || 'warm', size: 60, compact: true }) : ''}
      ${(s.figure || s.widget) ? `<div class="figure" id="revfig">${s.figure || ''}</div>` : ''}
      <ol class="solution">${s.steps.map(t => `<li><div>${t}</div></li>`).join('')}</ol>
      ${s.takeaway ? `<div class="takeaway"><span>Keep this</span><p>${s.takeaway}</p></div>` : ''}`;
    // must mount INTO the figure slot — a widget that writes to the stage would erase the solution
    if (s.widget) this.widget = s.widget($('#revfig', this.stage), {});
    // stagger the steps in so the eye follows the argument
    [...this.stage.querySelectorAll('.solution li')].forEach((li, k) =>
      li.style.animationDelay = `${k * 90}ms`);
    this.primary(s.cta || 'Continue', () => this.next());
  }

  /* ---------- finish ---------- */
  celebrate() {
    const host = document.createElement('div');
    host.className = 'burst';
    host.innerHTML = Array.from({ length: 12 }, (_, k) =>
      `<i style="--a:${k * 30}deg;--d:${60 + (k % 4) * 18}px;--t:${380 + (k % 5) * 60}ms"></i>`).join('');
    this.stage.appendChild(host);
    setTimeout(() => host.remove(), 900);
  }

  finish() {
    const acc = this.asked ? Math.round(this.right / this.asked * 100) : 100;
    // A review session is not a lesson: it must never appear on the path, so it
    // awards XP for the answers instead of completing anything. The per-concept
    // ladder has already moved with each `store.answered` call.
    const review = !!this.def.review;
    const { first, gain } = review
      ? { first: true, gain: store.awardXP(this.right * (this.def.xpPerCorrect || 4), 'review').gained }
      : store.completeLesson(this.def.id, acc / 100, this.def.xp || 30);

    /* A clean sheet is worth marking, but only on a set long enough to mean
       something — one question answered right is not a perfect run. */
    if (this.asked >= 5 && this.right === this.asked) store.flag('perfectSet');
    /* Badges are re-evaluated from the whole record rather than incremented,
       so they can never drift out of step with it. */
    const earned = refreshAchievements();
    // solid = right at first meeting AND never missed later; shaky = missed at any point,
    // which is exactly what the store has pushed back down the review ladder.
    const shaky = this.missed.size;
    const solid = [...this.firstTry].filter(([k, ok]) => ok && !this.missed.has(k)).length;

    /* A way back into the TEACHING for whatever was missed — the thing the
       review queue could never offer, because dropping a box only schedules
       the same question again. See `offersReteach` for who gets the offer. */
    const offers = offersReteach(this.def) ? [...this.missed].slice(0, 3) : [];
    /* Three buttons is already a wall. Anything past that is named as a count
       rather than dropped quietly — a panel headed "these did not land" that
       silently lists only some of them is worse than one that admits the cut. */
    const alsoMissed = offersReteach(this.def) ? this.missed.size - offers.length : 0;
    const backToLesson = this.def.reteach && this.missed.size && this.def.lessonHref;

    this.rail.innerHTML = '';
    this.act.innerHTML = '';
    this.stage.innerHTML = `
      <div class="done">
        <div class="done__hero">${betaalSVG(acc >= 80 ? 'impressed' : 'warm', 104)}</div>
        <h2>${review
          ? (acc >= 80 ? 'Still sharp.' : 'Worth the practice.')
          : (acc >= 80 ? 'That was well reasoned.' : 'Lesson complete.')}</h2>
        <p class="lede">${review
          ? (acc >= 80
            ? 'Those ideas have moved up the ladder and will come back later, not sooner.'
            : 'What slipped has dropped a box, so you will meet it again in a day or two. That is the point of the queue.')
          : (acc >= 80
            ? 'You answered from the diagram, not from memory. That is the whole skill.'
            : 'The ideas that slipped are already queued for review — you will meet them again.')}</p>

        <div class="done__stats">
          <div class="dstat"><b class="num">${acc}%</b><span>accuracy</span></div>
          <div class="dstat"><b class="num">+${gain}</b><span>XP earned</span></div>
          <div class="dstat"><b class="num">${solid}</b><span>ideas solid</span></div>
          <div class="dstat"><b class="num">${shaky}</b><span>${review ? 'dropped a box' : 'queued to revisit'}</span></div>
        </div>
        ${offers.length ? `<div class="reteach">
          <p class="eyebrow">${offers.length > 1 ? 'These did not land' : 'That one did not land'}</p>
          <p class="reteach__lede">Answering ${offers.length > 1 ? 'them' : 'it'} again is only a test.
            Go back to where ${offers.length > 1 ? 'they were' : 'it was'} taught instead — the explanation,
            the diagram, then fresh questions.</p>
          <div class="reteach__row">${offers.map(([id, label]) =>
            `<a class="btn btn--ghost" href="${href(reteachPath(id))}">Teach me ${label}</a>`).join('')}</div>
          ${alsoMissed ? `<p class="reteach__more">${alsoMissed} more slipped too — they are waiting on your dashboard.</p>` : ''}
        </div>` : ''}
        ${backToLesson ? `<div class="reteach">
          <p class="eyebrow">Still not landing</p>
          <p class="reteach__lede">You have now seen this explained twice. A third telling of the same
            four steps will not help — take the lesson whole, drills included.</p>
          <div class="reteach__row">
            <a class="btn btn--ghost" href="${this.def.lessonHref}">Sit through ${this.def.lessonTitle || 'the lesson'} again</a>
          </div>
        </div>` : ''}
        ${!first ? `<p class="muted done__note">Repeat run — XP is reduced, because new ground is worth more than old.</p>` : ''}
        ${earned.length ? `<div class="done__badges">
          <p class="eyebrow">${earned.length > 1 ? 'Achievements earned' : 'Achievement earned'}</p>
          ${earned.map(id => {
            const a = ACHIEVEMENTS.find(x => x.id === id);
            return a ? `<span class="wonbadge"><i>${a.icon}</i><b>${a.name}</b><em>${a.blurb}</em></span>` : '';
          }).join('')}
        </div>` : ''}

        <div class="done__acts">
          <a class="btn btn--lg" href="${this.def.nextHref || this.def.backHref}">${this.def.nextLabel || 'Back to the path'}</a>
          ${review
            /* Reloading this page is another set, since every set is dealt on a
               fresh seed. A session whose page is not simply `./` — a drill that
               carries its tier — says so in `againHref`. */
            ? `<a class="btn btn--ghost btn--lg" href="${this.def.againHref || './'}">Another set</a>`
            : `<a class="btn btn--ghost btn--lg" href="${this.def.backHref}">See my path</a>`}
        </div>
      </div>`;
  }
}

export function runLesson(def, selector = '#app') {
  /* Marks a page as mid-session, so a cloud sync never reloads it (cloud.js). */
  document.documentElement.dataset.session = '1';
  const el = document.querySelector(selector);
  document.title = `${def.title} · Reasoning & Quants Academy`;
  return new Lesson(def, el);
}
