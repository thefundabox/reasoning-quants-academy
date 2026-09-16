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
  const chosen = asked ? +asked : tierFor(academyId, unitN).tier;

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
