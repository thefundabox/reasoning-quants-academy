/* ============================================================
   What each generated page runs.

   `tools/pages.js` writes a small HTML file for every chapter, lesson,
   practice set and re-teach, and each of those files is one line of script:
   a call into here with its own id. Keeping the behaviour in this module
   rather than in the files means a fix lands on all three hundred pages at
   once, and regenerating them is only ever needed when the curriculum grows.
   ============================================================ */

import { applyTheme, chapterOn, CONFIG } from './config.js';
import { findLesson, ACADEMIES } from './curriculum.js';
import { runLesson } from './runner.js';
import { fileFor, makeChapterSession, makeDrillSession } from './review.js';
import { makeReteachSession } from './reteach.js';
import { tierFor } from './progress.js';
import { renderChapter } from './shell.js';
import { href, chapterPath, lessonPath, practicePath, academyPath } from './routes.js';

applyTheme();

const app = () => document.getElementById('app');

function dead(title, body, to = href(''), label = 'Back to the dashboard') {
  app().innerHTML = `
    <div class="wrap" style="padding:var(--s8) 0;text-align:center">
      <h1>${title}</h1>
      <p class="lede" style="margin:var(--s4) auto var(--s6);max-width:48ch">${body}</p>
      <a class="btn btn--lg" href="${to}">${label}</a>
    </div>`;
}

const waiting = text => {
  app().innerHTML = `<div class="wrap" style="padding:var(--s8) 0;text-align:center">
    <p class="lede">${text}</p></div>`;
};

export function chapterPage(academyId, unitN) {
  renderChapter(academyId, unitN);
}

/**
 * A lesson, at its own address.
 *
 * The lesson files were written when every lesson lived at `lesson/?id=…`,
 * and they say where to go next in those terms. Rather than have sixty-five
 * files know about URLs, their links are translated here: a "next lesson"
 * becomes that lesson's page, and "back to the path" becomes this chapter —
 * which is where the learner came from.
 */
export async function lessonPage(id) {
  const meta = findLesson(id);
  if (!meta || !meta.lesson.ready) {
    document.body.classList.add('theme-brand');
    return dead(meta ? 'Not built yet' : 'Lesson not found',
      meta ? `<b>${meta.lesson.title}</b> is on the path but has not been written yet.`
           : 'That lesson does not exist.', href(''), 'Back to the academies');
  }
  const { lesson, unit, academy } = meta;
  document.body.classList.add(academy.theme);
  if (!chapterOn(`${academy.id}:${unit.n}`)) {
    return dead('This lesson is not part of this course',
      'Its chapter has been switched off in this copy of the site.',
      href(academyPath(academy.id)), `Back to ${academy.name}`);
  }
  document.title = `${lesson.title} · ${unit.title} · ${CONFIG.identity.name}`;

  const def = (await import(fileFor(id))).default;
  const chapter = href(chapterPath(academy.id, unit.n));
  const nextId = String(def.nextHref || '').match(/[?&]id=([^&]+)/);
  runLesson({
    ...def,
    backHref: chapter,
    nextHref: nextId ? href(lessonPath(decodeURIComponent(nextId[1]))) : chapter,
    nextLabel: nextId ? def.nextLabel : `Back to ${unit.title}`,
  });
}

/** Written questions from one chapter, or the endless drill. */
export async function practicePage(academyId, unitN, { drill = false } = {}) {
  const q = new URLSearchParams(location.search);
  const size = Math.min(20, Math.max(4, +q.get('n') || 8));
  waiting(drill ? 'Writing you a fresh paper…' : 'Assembling the chapter…');

  /* Difficulty is worked out from this learner's own record unless they asked
     for a specific tier in the URL. Deriving beats asking: a novice does not yet
     know which tier they belong in, and that is exactly who tiers are for. */
  const asked = q.get('tier');
  const chosen = asked ? +asked : tierFor(academyId, unitN).tier;   // the drill floors this at Exam

  const { session, unit, academy, reason } = drill
    ? makeDrillSession(academyId, unitN, size, undefined, chosen)
    : await makeChapterSession(academyId, unitN, size);

  if (!unit) {
    return dead('No such chapter',
      'That link points at a chapter this course does not have.',
      href(ACADEMIES[academyId] ? academyPath(academyId) : ''), 'See the chapters');
  }
  if (!session) {
    const noGen = reason === 'no generators for this chapter yet';
    return dead(`${unit.title} is not ready yet`,
      noGen
        ? `This chapter has no question generator behind it yet, so there is no endless drill for it.
           Its written practice set still works.`
        : reason === 'no built lessons yet'
          ? `None of this chapter's lessons are built, so there is nothing to practise from.`
          : `This chapter's lessons carry no drilled questions yet.`,
      noGen ? href(practicePath(academyId, unitN)) : href(chapterPath(academyId, unitN)),
      noGen ? 'Practise this chapter instead' : `Back to ${unit.title}`);
  }
  document.body.classList.add(academy.theme);
  document.title = `${drill ? 'Drill' : 'Practice'} · ${unit.title} · ${CONFIG.identity.name}`;
  runLesson(session);
}

/** One idea taught again, then re-tested. */
export async function reteachPage(conceptId) {
  const size = Math.min(6, Math.max(1, +new URLSearchParams(location.search).get('n') || 3));
  waiting('Finding where this was taught…');
  const { session, where, label } = await makeReteachSession(conceptId, { size });
  if (!session) {
    /* Reachable if a record outlives the lesson that wrote it — a renamed
       concept, an older version of the site — so it has to be a dead end with
       a way out, never a blank page. */
    return dead('No such idea',
      `That link points at an idea this course does not teach. It may have been renamed since
       your progress was saved. Every weak idea on your dashboard links to the lesson behind it.`);
  }
  if (where) document.body.classList.add(where.academy.theme);
  document.title = `Re-teach · ${label} · ${CONFIG.identity.name}`;
  runLesson(session);
}

/* ---------------- RAS Practise Drills ---------------- */

/** The tab itself: every topic, what it rehearses, and where it came from. */
export async function rasIndexPage() {
  const { RAS_TOPICS, rasGeneratorsFor, RAS_GENERATORS } = await import('./ras/index.js');
  const { topbar, crumbs, wireLearnerChip, $ } = await import('./shell.js');
  const { rasTopicPath } = await import('./routes.js');
  document.body.classList.add('theme-brand');
  document.title = `RAS Practise Drills · ${CONFIG.identity.name}`;
  if (!CONFIG.features.rasDrills) {
    return dead('Not part of this course', 'The RAS drills have been switched off in this copy of the site.');
  }

  const card = t => `
    <a class="chapcard rascard rascard--${t.side}" href="${href(rasTopicPath(t.id))}">
      <span class="chapcard__top">
        <span class="chap__num">${t.side === 'reasoning' ? '◑' : '∑'}</span>
        <span class="chap__count">${rasGeneratorsFor(t.id).length} question type${rasGeneratorsFor(t.id).length > 1 ? 's' : ''}</span>
      </span>
      <b class="chapcard__title">${t.name}</b>
      <em class="chapcard__sub">${t.blurb}</em>
      <span class="rascard__papers">Set in ${t.papers}</span>
      <span class="chapcard__go">Start drilling <span class="arw">→</span></span>
    </a>`;

  $('#app').innerHTML = `
    ${topbar({ tab: 'ras' })}
    <div class="wrap">
      ${crumbs([{ label: 'Home', href: href('') }, { label: 'RAS Practise Drills' }])}
      <header class="hero">
        <p class="eyebrow hero__kicker">Modelled on RAS Prelims 2015 · 2016 · 2018 · 2021 · 2023 · 2024</p>
        <h1>The paper's own questions, in fresh numbers.</h1>
        <p class="lede">Every archetype here has been set by the RPSC — the invented language, the CI−SI gap,
          the round table where "right" is anticlockwise, the pie chart with one value given. The numbers,
          names and figures change on every reload; the shape does not.
          <b>These are harder than the chapter drills</b>, which teach one idea at a time. Nothing here is a warm-up.</p>
        <div class="row" style="margin-top:var(--s5);flex-wrap:wrap;gap:var(--s3)">
          <a class="btn btn--lg" href="${href(rasTopicPath('mixed'))}">Sit a mixed set of 15</a>
          <span class="muted" style="font-size:14px;align-self:center">${RAS_GENERATORS.length} question types across
            ${RAS_TOPICS.length} topics — over 20,000 distinct questions.</span>
        </div>
      </header>

      <h2 class="section-h">Reasoning &amp; mental ability</h2>
      <div class="chapgrid">${RAS_TOPICS.filter(t => t.side === 'reasoning').map(card).join('')}</div>

      <h2 class="section-h">Basic numeracy</h2>
      <div class="chapgrid">${RAS_TOPICS.filter(t => t.side === 'quants').map(card).join('')}</div>

      <footer class="foot">
        <p style="font-size:13px;max-width:78ch">Answers here feed the same ladder as the rest of the site:
          a question you get wrong comes back in your review queue, and its chapter is where the
          re-teach will send you. The chapter drills remain exactly as they were — they are for learning
          an idea; this is for sitting the paper.</p>
        <a href="${href('')}">← Home</a>
      </footer>
    </div>`;
  wireLearnerChip($('#app'));
}

/** One topic, dealt endlessly. */
export async function rasTopicPage(topicId) {
  const { rasSession, rasTopic } = await import('./ras/index.js');
  const { rasPath } = await import('./routes.js');
  document.body.classList.add('theme-brand');
  if (!CONFIG.features.rasDrills) {
    return dead('Not part of this course', 'The RAS drills have been switched off in this copy of the site.');
  }
  const q = new URLSearchParams(location.search);
  const size = Math.min(25, Math.max(5, +q.get('n') || (topicId === 'mixed' ? 15 : 10)));
  const tier = q.get('tier') ? +q.get('tier') : 2;
  waiting('Setting your paper…');
  const { session, topic, reason } = rasSession(topicId, { size, tier, backHref: href(rasPath()) });
  if (!session) {
    return dead('No such drill', `That link points at a set this bank does not have${reason ? ` (${reason})` : ''}.`,
      href(rasPath()), 'See the RAS drills');
  }
  document.title = `${topic.name} · RAS Practise Drills · ${CONFIG.identity.name}`;
  runLesson(session);
}
