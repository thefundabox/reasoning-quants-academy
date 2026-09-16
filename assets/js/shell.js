/* ============================================================
   Shared page shell: top bar, dashboard panels, path rendering.
   ============================================================ */

import * as store from './store.js';
import { ACADEMIES, allLessons, readyLessons, nextUp, unitStats,
         activeAcademies, activeUnits } from './curriculum.js';
import { generatorsFor } from './generators/index.js';
import { nextSteps, badgeShelf } from './progress.js';
import { CONFIG } from './config.js';
import { SECONDS_PER_QUESTION } from './mock.js';
import { href, chapterPath, lessonPath, practicePath, drillPath, reteachPath,
         academyPath, TABS } from './routes.js';

/* Two explicit fields, not one clever split — see the note in config.js. */
const MARK_MAIN = CONFIG.identity.short;
const MARK_SUB = CONFIG.identity.markSub;

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- brand ---------- */
export function brandmark(to = href('')) {
  return `<a class="brandmark" href="${to}">
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="11" fill="var(--brand)"/>
      <circle cx="15" cy="16" r="6" fill="none" stroke="#fff" stroke-width="2.4" opacity=".95"/>
      <circle cx="25" cy="16" r="6" fill="none" stroke="var(--gold)" stroke-width="2.4"/>
      <path d="M12 28h16" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
    </svg>
    <span>${MARK_MAIN}${MARK_SUB ? `<small>${MARK_SUB}</small>` : ''}</span></a>`;
}

/* ---------- progress ring ---------- */
const R = 20, CIRC = +(2 * Math.PI * R).toFixed(1);
export function ring(pct, label = '') {
  return `<div class="ring" style="--pct:${pct};--circ:${CIRC}">
    <svg viewBox="0 0 52 52" width="52" height="52">
      <circle class="trk" cx="26" cy="26" r="${R}"/><circle class="val" cx="26" cy="26" r="${R}"/>
    </svg><b>${label || pct + '%'}</b></div>`;
}

/* ---------- learner switcher ---------- */
/* These are local profiles, not accounts — see the note in store.js. The menu
   says so plainly rather than dressing itself up as a sign-in. */
const initials = name => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function learnerChip() {
  const me = store.activeProfile();
  const list = store.profiles();
  return `<div class="who" id="who">
    <button class="who__btn" type="button" id="whoBtn" aria-expanded="false" aria-haspopup="true"
            title="Switch learner — local to this device">
      <span class="who__av">${esc(initials(me.name))}</span>
      <span class="who__name">${esc(me.name)}</span>
      <svg class="who__chev" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="who__menu" id="whoMenu" role="menu">
      <p class="who__lab">On this device</p>
      ${list.map(p => `
        <button class="who__item ${p.id === me.id ? 'is-on' : ''}" role="menuitem" data-switch="${p.id}">
          <span class="who__av who__av--sm">${esc(initials(p.name))}</span>
          <span>${esc(p.name)}</span>
          ${p.id === me.id ? '<em>current</em>' : ''}
        </button>`).join('')}
      <div class="who__sep"></div>
      <button class="who__item" role="menuitem" data-add="1"><span class="who__plus">+</span> Add a learner</button>
      <button class="who__item" role="menuitem" data-rename="${me.id}"><span class="who__plus">✎</span> Rename ${esc(me.name)}</button>
      ${list.length > 1
        ? `<button class="who__item who__item--bad" role="menuitem" data-del="${me.id}">
             <span class="who__plus">×</span> Remove ${esc(me.name)}</button>`
        : ''}
      <p class="who__note">Saved in this browser only. No password, no sync —
        anyone using this device can pick any learner.</p>
    </div>
  </div>`;
}

/** Wire the switcher. Safe to call on any page; does nothing if the chip is absent. */
export function wireLearnerChip(root = document) {
  const who = root.querySelector('#who');
  if (!who) return;
  const btn = who.querySelector('#whoBtn');

  const close = () => { who.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
  btn.onclick = e => {
    e.stopPropagation();
    const open = !who.classList.contains('is-open');
    who.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  document.addEventListener('click', e => { if (!who.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  who.querySelector('#whoMenu').addEventListener('click', e => {
    const el = e.target.closest('[data-switch],[data-add],[data-rename],[data-del]');
    if (!el) return;
    const d = el.dataset;

    if (d.switch) { if (store.switchProfile(d.switch)) location.reload(); else close(); return; }
    if (d.add) {
      const name = prompt('Name for the new learner?');
      if (name === null) return close();
      store.addProfile(name);
      location.reload();
      return;
    }
    if (d.rename) {
      const name = prompt('Rename this learner to?', store.activeProfile().name);
      if (name === null) return close();
      store.renameProfile(d.rename, name);
      location.reload();
      return;
    }
    if (d.del) {
      const me = store.activeProfile();
      if (!confirm(`Remove ${me.name} and everything they have earned on this device? This cannot be undone.`)) return close();
      store.deleteProfile(d.del);
      location.reload();
    }
  });
}

/* ---------- top bar ----------
   Two rows: the learner's standing, and the site's tabs. The tabs are real
   links to real pages, so the browser's back button, a bookmark and a shared
   link all mean the same thing — which a tab that swapped panels never did. */
export function topbar({ tab = null, back = null } = {}) {
  const s = store.streakInfo(), d = store.dailyProgress(), st = store.get();
  const tabs = TABS.filter(t =>
    (!t.feature || CONFIG.features[t.feature]) &&
    (!ACADEMIES[t.id] || activeAcademies().includes(t.id)));
  return `<div class="topbar"><div class="wrap topbar__in">
      ${back ? `<a class="btn btn--quiet" href="${back}">← Back</a>` : brandmark()}
      <span class="spacer"></span>
      <span class="stat-pill stat-pill--fire" title="${s.atRisk ? 'Study today to keep your streak' : 'Day streak'}">
        🔥 <b>${s.count}</b>${s.atRisk ? '<em class="atrisk">at risk</em>' : ''}</span>
      <span class="stat-pill stat-pill--xp" title="Total XP">⬢ <b>${st.xp}</b> XP</span>
      <span class="stat-pill stat-pill--goal" title="Today's goal">${d.xp}/${d.goal} today</span>
      ${learnerChip()}
    </div>
    <nav class="wrap navtabs" aria-label="Sections">${tabs.map(t =>
      `<a class="navtab ${t.id === tab ? 'is-on' : ''}" href="${href(t.path)}"
          ${t.id === tab ? 'aria-current="page"' : ''}>${t.label}</a>`).join('')}</nav>
    </div>`;
}

/* ---------- academy gateway cards ---------- */
export function gateway() {
  return activeAcademies().map(id => ACADEMIES[id]).map(a => {
    const ids = readyLessons(a.id).map(l => l.id);
    const p = store.pathProgress(ids);
    const total = allLessons(a.id).length;
    const icon = a.id === 'reasoning'
      ? `<svg viewBox="0 0 58 58"><circle cx="22" cy="24" r="15" fill="none" stroke="var(--reason)" stroke-width="3.4"/>
         <circle cx="36" cy="24" r="15" fill="none" stroke="var(--gold)" stroke-width="3.4"/>
         <circle cx="29" cy="38" r="15" fill="none" stroke="var(--reason)" stroke-width="3.4" opacity=".55"/></svg>`
      : `<svg viewBox="0 0 58 58"><rect x="6" y="32" width="11" height="20" rx="3" fill="var(--quant)" opacity=".55"/>
         <rect x="23" y="20" width="11" height="32" rx="3" fill="var(--quant)" opacity=".8"/>
         <rect x="40" y="8" width="11" height="44" rx="3" fill="var(--gold)"/></svg>`;
    return `<a class="gate gate--${a.id === 'reasoning' ? 'reason' : 'quant'} ${a.theme}" href="${href(a.href)}">
      <div class="gate__icon">${icon}</div>
      <h2>${a.name}</h2>
      <p class="lede">${a.blurb}</p>
      <div class="gate__meta">
        <span>${a.units.length} units</span><span>${total} lessons</span>
        <span>${p.done ? `${p.done} done` : 'not started'}</span>
      </div>
      <div class="bar" style="margin-top:var(--s4)"><i style="width:${p.total ? p.pct : 0}%"></i></div>
      <span class="gate__go">Enter the academy <span class="arw">→</span></span>
    </a>`;
  }).join('');
}

/* ---------- your track ----------
   Three things at most, derived fresh on every render. The point is that a
   learner opening the site should never have to decide what to do — the
   schedule already knows, and guessing wrong costs them a session. */
export function trackPanel() {
  const steps = nextSteps(3);
  if (!steps.length) return '';
  return `
    <div class="track">
      <div class="track__head">
        <p class="eyebrow" style="margin:0">Your next steps</p>
        <span class="muted" style="font-size:12.5px">Worked out from your own record, not a fixed list.</span>
      </div>
      <ol class="track__list">
        ${steps.map((s, i) => `
          <a class="track__i track__i--${s.kind}" href="${href(s.href)}">
            <span class="track__n">${i + 1}</span>
            <span class="track__txt"><b>${s.title}</b><em>${s.why}</em></span>
            <span class="track__go" aria-hidden="true">→</span>
          </a>`).join('')}
      </ol>
    </div>`;
}

/* ---------- achievements ----------
   Locked badges show their progress on purpose: a badge you cannot see
   yourself approaching is a surprise, not a motivator. */
export function badgePanel({ compact = false } = {}) {
  const all = badgeShelf();
  const earned = all.filter(b => b.earned);
  const locked = all.filter(b => !b.earned).sort((a, b) => b.pct - a.pct);
  const show = compact ? [...earned.slice(-3), ...locked.slice(0, 3)] : [...earned, ...locked];

  return `
    <div class="badges">
      <div class="track__head">
        <p class="eyebrow" style="margin:0">Achievements</p>
        <span class="muted" style="font-size:12.5px">${earned.length} of ${all.length} earned</span>
      </div>
      <div class="badges__grid">
        ${show.map(b => `
          <div class="badge ${b.earned ? 'is-on' : ''}" title="${b.blurb}">
            <i class="badge__ico">${b.icon}</i>
            <b class="badge__name">${b.name}</b>
            <em class="badge__blurb">${b.blurb}</em>
            ${b.earned
              ? `<span class="badge__on">earned</span>`
              : `<span class="badge__bar"><i style="width:${b.pct}%"></i></span>
                 <span class="badge__prog">${b.now} / ${b.goal}</span>`}
          </div>`).join('')}
      </div>
    </div>`;
}

/* ---------- dashboard ---------- */
export function dashboard() {
  const d = store.dailyProgress();
  const s = store.streakInfo();
  const due = store.dueForReview();
  const weak = store.weakest(4);
  const trend = store.accuracyTrend(7);
  const st = store.get();
  const papers = store.mocks();
  const lastPaper = store.lastMock();
  const bestPaper = store.bestMock();
  /* One bar per paper sat, most recent last, so improvement is something to
     look at rather than something to remember. */
  const mockBars = papers.slice(-8).map(m => {
    const pct = Math.max(0, Math.round(m.score / m.max * 100));
    return `<div class="tbar"><i style="height:${Math.max(6, pct * 0.52)}px"></i>
      <span>${pct}%</span></div>`;
  }).join('');
  const lessonsDone = Object.values(st.lessons).filter(l => l.status === 'done').length;
  const concepts = Object.keys(st.concepts).length;
  const mastered = Object.values(st.concepts).filter(c => c.box >= 4).length;

  const bars = trend.map(t => {
    const h = t.pct === null ? 4 : Math.max(6, t.pct * 0.52);
    const day = new Date(t.day + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'narrow' });
    return `<div class="tbar"><i style="height:${h}px;${t.pct === null ? 'opacity:.25' : ''}"
      title="${t.pct === null ? 'no practice' : t.pct + '% on ' + t.day}"></i><span>${day}</span></div>`;
  }).join('');

  return `
  <div class="dash">
    <div class="dash__main card theme-brand">
      <div class="row-between" style="align-items:flex-start">
        <div><p class="eyebrow">Today</p>
          <h3 style="font-size:20px">${d.pct >= 100 ? 'Daily goal met' : `${d.goal - d.xp} XP to your goal`}</h3>
          <p class="muted" style="font-size:14px;margin-top:2px">
            ${s.activeToday ? 'Streak safe for today.' : s.count ? 'Study once today to keep the streak.' : 'Finish one lesson to start a streak.'}</p>
        </div>
        ${ring(d.pct)}
      </div>
      <div class="bar" style="margin-top:var(--s4)"><i style="width:${d.pct}%"></i></div>
      <div class="dash__nums">
        <div><b class="num">${lessonsDone}</b><span>lessons done</span></div>
        <div><b class="num">${concepts}</b><span>concepts met</span></div>
        <div><b class="num">${mastered}</b><span>mastered</span></div>
        <div><b class="num">${s.best}</b><span>best streak</span></div>
      </div>
    </div>

    <div class="card theme-brand">
      <p class="eyebrow">Accuracy · last 7 days</p>
      <div class="trend">${bars}</div>
      <p class="muted" style="font-size:13px">${trend.some(t => t.pct !== null)
        ? 'Each bar is the share you got right that day.'
        : 'Answer a few questions and your trend appears here.'}</p>
    </div>

    <div class="card theme-brand">
      <p class="eyebrow">Review queue</p>
      ${due.length
        ? `<p class="muted" style="font-size:14px;margin-bottom:var(--s3)">
             ${due.length} idea${due.length > 1 ? 's are' : ' is'} due — spaced so you meet them just before you'd forget.</p>
           <ul class="qlist">${due.slice(0, 5).map(c =>
             `<li><span class="box box--${c.box}">${c.box}</span>${c.label}</li>`).join('')}</ul>`
        : `<p class="muted" style="font-size:14px">Nothing due. Concepts you answer correctly come back on a
             widening schedule — 1 day, 2, 4, 8, 16.</p>`}
      ${weak.length ? `<p class="eyebrow" style="margin-top:var(--s5)">Shore these up</p>
        <ul class="qlist">${weak.map(c =>
          /* Each one links to its own teaching, not to another question. A list
             of things you are bad at, with no way back to where they were
             explained, is a diagnosis without a treatment. */
          (CONFIG.features.reteach
            ? `<li><span class="box box--weak">${Math.round(c.acc * 100)}%</span>
                 <a class="qlink" href="${href(reteachPath(c.id))}"
                    title="Go back to where this was taught">${c.label}</a></li>`
            : `<li><span class="box box--weak">${Math.round(c.acc * 100)}%</span>${c.label}</li>`)
          ).join('')}</ul>` : ''}
      ${concepts && CONFIG.features.review
        ? `<a class="btn btn--lg rev-go" href="${href('review/')}">
             ${due.length ? `Review ${Math.min(due.length, 8)} now` : 'Practise a mixed set'}</a>`
        : ''}
    </div>

    ${CONFIG.features.mock ? `<div class="card theme-brand">
      <p class="eyebrow">Mock papers</p>
      ${papers.length
        ? `<div class="mockmini">
             <div><b class="num">${lastPaper.score}</b><span>last paper, of ${lastPaper.max}</span></div>
             <div><b class="num">${bestPaper.score}</b><span>best of ${papers.length}</span></div>
           </div>
           <div class="trend">${mockBars}</div>
           <p class="muted" style="font-size:13px">Scored with the exam's own penalty — a third of a
             mark off for each wrong answer. The trend matters; one paper does not.</p>`
        : `<p class="muted" style="font-size:14px">Everything else here is untimed. A mock is
             ${Math.round(SECONDS_PER_QUESTION)} seconds a question, mixed across all fourteen
             chapters, with a penalty for guessing — the one exam-shaped thing to practise.</p>`}
      <a class="btn btn--lg rev-go" href="${href('mock/')}">${papers.length ? 'Sit another paper' : 'Sit a mock paper'}</a>
    </div>` : ''}
  </div>`;
}

/* ---------- breadcrumb ---------- */
export function crumbs(items) {
  return `<nav class="crumbs" aria-label="You are here">${items.map((c, i) =>
    i === items.length - 1
      ? `<span aria-current="page">${c.label}</span>`
      : `<a href="${c.href}">${c.label}</a><span class="crumbs__sep" aria-hidden="true">›</span>`).join('')}</nav>`;
}

/* ---------- academy page ----------
   The academy page is a table of contents now, not the whole book. It used
   to fold all seven chapters into one long scroll; each chapter is its own
   page, and this one says what is in each and where the learner stands. */
export function renderPath(academyId, mountSel = '#app') {
  const a = ACADEMIES[academyId];
  const readyIds = readyLessons(academyId).map(l => l.id);
  const p = store.pathProgress(readyIds);
  const accent = academyId === 'reasoning' ? 'reason' : 'quant';
  document.title = `${a.name} · ${CONFIG.identity.name}`;
  document.body.classList.add(a.theme);

  // "where you are" — the first built lesson not yet done. Once the academy is
  // finished there is no current lesson, and nothing should pretend otherwise.
  const allDone = readyIds.length > 0 && readyIds.every(store.isDone);
  const next = allDone ? null : nextUp(academyId, store.isDone);
  const units = activeUnits(academyId);
  const currentUnit = next ? units.find(u => u.lessons.some(l => l.id === next.id)) : null;

  const cards = units.map(u => {
    const st = unitStats(u, store.isDone);
    const isCurrent = currentUnit && currentUnit.n === u.n;
    const complete = st.ready > 0 && st.done === st.ready && st.ready === st.total;
    const bars = u.lessons.map(l =>
      `<i class="${!l.ready ? 'is-soon' : store.isDone(l.id) ? 'is-done' : 'is-todo'}"></i>`).join('');
    return `
      <a class="chapcard ${isCurrent ? 'is-current' : ''} ${complete ? 'is-complete' : ''}"
         href="${href(chapterPath(academyId, u.n))}">
        <span class="chapcard__top">
          <span class="chap__num">${complete ? '✓' : u.n}</span>
          ${isCurrent ? `<span class="chap__now">You are here</span>` : ''}
          <span class="chap__count">${st.ready ? `${st.done} of ${st.ready}` : `${st.total} planned`}</span>
        </span>
        <b class="chapcard__title">${u.title}</b>
        <em class="chapcard__sub">${u.sub}</em>
        <ul class="chapcard__lessons">${u.lessons.map(l =>
          `<li class="${store.isDone(l.id) ? 'is-done' : ''}">${l.title}</li>`).join('')}</ul>
        <span class="chap__bars" aria-hidden="true">${bars}</span>
        <span class="chapcard__go">Open chapter <span class="arw">→</span></span>
      </a>`;
  }).join('');

  $(mountSel).innerHTML = `
    ${topbar({ tab: academyId })}
    <div class="wrap">
      ${crumbs([{ label: 'Home', href: href('') }, { label: a.name }])}
      <header class="hero">
        <p class="eyebrow hero__kicker">${a.name}</p>
        <h1>${a.tagline}</h1>
        <p class="lede">${a.blurb}</p>
        <div class="row" style="margin-top:var(--s5);flex-wrap:wrap;align-items:center">
          ${next
            ? `<a class="btn btn--lg btn--${accent}" href="${href(lessonPath(next.id))}">
                 ${p.done ? 'Resume' : 'Start'}: ${next.title}</a>`
            : readyIds[0] ? `<a class="btn btn--lg btn--${accent}" href="${href(lessonPath(readyIds[0]))}">
                 Practise again</a>` : ''}
          ${ring(p.total ? Math.round(p.done / p.total * 100) : 0)}
          <span class="muted" style="font-size:14px">
            ${p.done} of ${p.total} available lessons complete${allDone ? ' — this academy is finished' : ''}</span>
        </div>
      </header>

      <h2 class="section-h">${units.length} chapters</h2>
      <div class="chapgrid">${cards}</div>

      ${CONFIG.features.practice ? `<section class="drillbar">
        <div class="drillbar__head">
          <b>Practise any chapter</b>
          <span>Questions from that chapter only. <b>∞</b> deals a fresh paper every time.</span>
        </div>
        <div class="drillbar__row">
          ${units.map(u => {
            const st2 = unitStats(u, store.isDone);
            if (!st2.ready) return `<span class="dchip dchip--soon" title="Nothing built here yet">${u.n}. ${u.title}</span>`;
            const hasDrill = generatorsFor(academyId, u.n).length > 0;
            return `<span class="dchip">
              <a class="dchip__go" href="${href(practicePath(academyId, u.n))}"
                 title="${st2.done} of ${st2.ready} lessons done">${u.n}. ${u.title}</a>
              ${hasDrill ? `<a class="dchip__inf" href="${href(drillPath(academyId, u.n))}"
                 title="Endless drill — a different paper every time" aria-label="Endless drill: ${u.title}">∞</a>` : ''}
            </span>`;
          }).join('')}
        </div>
      </section>` : ''}

      <footer class="foot"><a href="${href('')}">← All academies</a></footer>
    </div>`;

  wireLearnerChip($(mountSel));
}

/* ---------- chapter page ---------- */
export function renderChapter(academyId, unitN, mountSel = '#app') {
  const a = ACADEMIES[academyId];
  const units = activeUnits(academyId);
  const i = units.findIndex(u => u.n === +unitN);
  const u = units[i];
  const accent = academyId === 'reasoning' ? 'reason' : 'quant';
  document.body.classList.add(a ? a.theme : 'theme-brand');

  if (!u) {
    /* The page exists on disk for every chapter, but a customised build can
       switch a chapter off. Its address must then say so, not render it. */
    document.title = `Chapter not available · ${CONFIG.identity.name}`;
    $(mountSel).innerHTML = `
      ${topbar({ tab: academyId })}
      <div class="wrap" style="padding:var(--s8) 0;text-align:center">
        <h1>This chapter is not part of this course</h1>
        <p class="lede" style="margin:var(--s4) auto var(--s6);max-width:46ch">
          It has been switched off in this copy of the site.</p>
        <a class="btn btn--lg" href="${href(a ? academyPath(academyId) : '')}">See the chapters that are</a>
      </div>`;
    wireLearnerChip($(mountSel));
    return;
  }

  document.title = `${u.title} · ${a.name} · ${CONFIG.identity.name}`;
  const st = unitStats(u, store.isDone);
  const next = u.lessons.find(l => l.ready && !store.isDone(l.id)) || null;
  const first = u.lessons.find(l => l.ready) || null;
  const hasDrill = generatorsFor(academyId, u.n).length > 0;
  const prev = units[i - 1], after = units[i + 1];

  const rows = u.lessons.map((l, k) => {
    const done = store.isDone(l.id);
    const here = next && l.id === next.id;
    const state = !l.ready ? 'is-soon' : done ? 'is-done' : here ? 'is-here' : 'is-todo';
    const rec = store.lesson(l.id);
    const badge = !l.ready ? '◦' : done ? '✓' : here ? '▶' : String(k + 1);
    const meta = !l.ready
      ? `<span class="chip">Coming soon</span>`
      : done
        ? `<span class="chip chip--done">${Math.round((rec.score || 0) * 100)}%</span>`
        : here
          ? `<span class="chip chip--new">${st.done ? 'Resume' : 'Start'}</span>`
          : `<span class="tl__mins">${l.mins} min</span>`;
    const inner = `
      <span class="tl__badge">${badge}</span>
      <span class="tl__txt"><b>${l.title}</b><em>${l.desc}</em></span>
      <span class="tl__meta">${meta}</span>`;
    return `<li class="tl__i ${state}">
      <span class="tl__dot" aria-hidden="true"></span>
      ${l.ready
        ? `<a class="tl__row" href="${href(lessonPath(l.id))}">${inner}</a>`
        : `<div class="tl__row tl__row--soon">${inner}</div>`}
    </li>`;
  }).join('');

  const pct = st.ready ? Math.round(st.done / st.ready * 100) : 0;
  const pagerLink = (x, dir) => x
    ? `<a class="pager__i pager__i--${dir}" href="${href(chapterPath(academyId, x.n))}">
         <span>${dir === 'prev' ? '← Previous chapter' : 'Next chapter →'}</span><b>${x.n}. ${x.title}</b></a>`
    : `<span class="pager__i pager__i--empty"></span>`;

  $(mountSel).innerHTML = `
    ${topbar({ tab: academyId })}
    <div class="wrap">
      ${crumbs([
        { label: 'Home', href: href('') },
        { label: a.name, href: href(academyPath(academyId)) },
        { label: `Chapter ${u.n}` },
      ])}
      <header class="hero">
        <p class="eyebrow hero__kicker">Chapter ${u.n} of ${units.length} · ${a.name}</p>
        <h1>${u.title}</h1>
        <p class="lede">${u.sub}</p>
        <div class="row" style="margin-top:var(--s5);flex-wrap:wrap;align-items:center">
          ${next
            ? `<a class="btn btn--lg btn--${accent}" href="${href(lessonPath(next.id))}">
                 ${st.done ? 'Resume' : 'Start'}: ${next.title}</a>`
            : first ? `<a class="btn btn--lg btn--${accent}" href="${href(lessonPath(first.id))}">Go through it again</a>` : ''}
          ${ring(pct)}
          <span class="muted" style="font-size:14px">${st.ready
            ? `${st.done} of ${st.ready} lessons complete`
            : `${st.total} lessons planned`}</span>
        </div>
      </header>

      <section class="chap is-open chap--page">
        <div class="chap__body"><div>
          <ol class="tl">${rows}</ol>
          ${st.ready && CONFIG.features.practice ? `
          <div class="chap__foot">
            <a class="btn btn--ghost btn--sm" href="${href(practicePath(academyId, u.n))}">
              <span aria-hidden="true">◆</span> Practise this chapter</a>
            ${hasDrill ? `
            <a class="btn btn--ghost btn--sm" href="${href(drillPath(academyId, u.n))}"
               title="Questions built to order — a different paper every time">
              <span aria-hidden="true">∞</span> Endless drill</a>` : ''}
            <span class="chap__foot-note">${hasDrill
              ? 'Written questions, or an endless drill that never repeats.'
              : `Mixed questions from the ${st.ready} built lesson${st.ready > 1 ? 's' : ''} here.`}</span>
          </div>` : ''}
        </div></div>
      </section>

      <nav class="pager" aria-label="Chapters">${pagerLink(prev, 'prev')}${pagerLink(after, 'next')}</nav>
      <footer class="foot"><a href="${href(academyPath(academyId))}">← All ${a.name} chapters</a></footer>
    </div>`;

  wireLearnerChip($(mountSel));
}
