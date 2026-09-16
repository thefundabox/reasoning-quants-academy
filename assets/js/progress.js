/* ============================================================
   The join between the store, the curriculum and the badges.

   `store.js` deliberately knows nothing about the curriculum — it holds a
   record, not a syllabus — and `achievements.js` is pure predicates. This
   is the one place that holds both, so neither has to import the other.

   It also builds the "next steps" track. That track is derived, never
   stored: a saved recommendation goes stale the moment the learner does
   something, and a stale instruction is worse than none.
   ============================================================ */

import * as store from './store.js';
import { ACADEMIES, readyLessons, nextUp, unitStats, unitFor,
         activeAcademies, activeUnits } from './curriculum.js';
import { evaluate, contextFor, shelf } from './achievements.js';
import { generatorsFor } from './generators/index.js';
import { clampTier, TIER_NAME, TIER_BLURB } from './generators/rand.js';
import { CONFIG } from './config.js';
import { lessonPath, reteachPath, practicePath, drillPath } from './routes.js';

/* Badges are counted against the build the learner has, not the one the source
   tree holds — "finish a chapter" must mean a chapter they can open. */
const visibleAcademies = () => Object.fromEntries(
  activeAcademies().map(a => [a, { ...ACADEMIES[a], units: activeUnits(a) }]));

const ctx = () => contextFor(store.get(), visibleAcademies(), readyLessons, store.isDone);

/** Re-check every badge. Returns the ids newly earned, for announcing. */
export const refreshAchievements = () => store.earnAchievements(evaluate, ctx());

/** Every badge with its progress, earned or not. */
export const badgeShelf = () => shelf(store.get(), ctx());

export const badgeCounts = () => {
  const all = badgeShelf();
  return { earned: all.filter(b => b.earned).length, total: all.length };
};

/**
 * What this learner should do next — at most three, most useful first.
 *
 * The order encodes the teaching model rather than a menu:
 *   1. an idea they keep getting WRONG, because that is a teaching problem
 *      and no amount of scheduling fixes it;
 *   2. what the schedule says is about to be forgotten, because that is
 *      the moment repetition is worth most;
 *   3. the weakest chapter they have actually met, because accuracy below
 *      60% means the idea did not land the first time;
 *   4. the next lesson on the path, which is the default when nothing is
 *      urgent.
 * A learner who has done nothing gets exactly one step: start.
 */
export function nextSteps(limit = 3) {
  const st = store.get();
  const steps = [];
  const started = Object.keys(st.lessons).length > 0;

  if (!started) {
    const first = nextUp('reasoning', store.isDone);
    return first ? [{
      kind: 'start', icon: '▶', title: `Begin: ${first.title}`,
      why: 'The path starts here. Everything else unlocks from it.',
      href: lessonPath(first.id),
    }] : [];
  }

  /* Above the queue on purpose. A concept with a losing record has not been
     forgotten, it was never understood, and the queue's only move is to ask
     it again sooner — which is what has already failed twice. See store.failing
     for why two wrong answers is the bar. */
  const stuck = CONFIG.features.reteach ? store.failing(1)[0] : null;
  if (stuck) {
    steps.push({
      kind: 'reteach', icon: '↺', title: `Learn ${stuck.label} again`,
      why: `Wrong ${stuck.wrong} of ${stuck.asked} times. Another question will not explain it — the lesson will.`,
      href: reteachPath(stuck.id),
    });
  }

  const due = CONFIG.features.review ? store.dueForReview() : [];
  if (due.length) {
    steps.push({
      kind: 'review', icon: '⟳', title: `Review ${Math.min(due.length, 8)} idea${due.length > 1 ? 's' : ''}`,
      why: `${due.length} ${due.length > 1 ? 'are' : 'is'} due today — the schedule says you are about to forget ${due.length > 1 ? 'them' : 'it'}.`,
      href: 'review/',
    });
  }

  /* The weakest chapter the learner has actually touched. Chapters they have
     never opened are not weaknesses, they are simply ahead of them. */
  const weak = CONFIG.features.practice ? weakestChapter() : null;
  if (weak && weak.acc < 0.6) {
    steps.push({
      kind: 'shore', icon: '◆', title: `Drill ${weak.unit.title}`,
      why: `You are at ${Math.round(weak.acc * 100)}% on this chapter's ideas — the lowest you have met.`,
      href: generatorsFor(weak.academyId, weak.unit.n).length
        ? drillPath(weak.academyId, weak.unit.n) : practicePath(weak.academyId, weak.unit.n),
    });
  }

  /* A mock, once there is enough behind the learner for one to mean anything.
     Offered on evidence, not on a schedule: below about a chapter's worth of
     lessons a mixed paper measures what they have not been taught yet, which
     is discouraging and tells them nothing they can act on. */
  const done = Object.values(st.lessons).filter(l => l.status === 'done').length;
  const papers = store.mocks();
  const daysSince = papers.length
    ? Math.round((Date.parse(new Date().toISOString().slice(0, 10)) -
                  Date.parse(papers[papers.length - 1].day)) / 864e5)
    : Infinity;
  if (CONFIG.features.mock && done >= 5 && (!papers.length || daysSince >= 7)) {
    steps.push({
      kind: 'mock', icon: '⏱', title: papers.length ? 'Sit another mock paper' : 'Sit your first mock paper',
      why: papers.length
        ? `${daysSince} days since your last. Accuracy drifts quietly; a timed paper is the only thing that says so.`
        : `${done} lessons in. Everything so far has been untimed — the paper is not, and that is a separate skill.`,
      href: 'mock/',
    });
  }

  const next = nextUp('reasoning', store.isDone) || nextUp('quants', store.isDone);
  if (next) {
    steps.push({
      kind: 'learn', icon: '▶', title: `Next lesson: ${next.title}`,
      why: 'New ground, in the order the path builds it.',
      href: lessonPath(next.id),
    });
  } else {
    steps.push({
      kind: 'done', icon: '★', title: 'Both academies finished',
      why: 'Nothing left to unlock — keep the ideas alive with drills and reviews.',
      href: 'reasoning/',
    });
  }

  return steps.slice(0, limit);
}

/**
 * Accuracy per chapter, over the concepts the learner has actually answered.
 *
 * Concepts carry the chapter they were last practised under (see
 * `store.answered`). Anything answered before that was recorded has no
 * chapter and is skipped rather than guessed at — a wrong attribution would
 * send the learner to drill the wrong thing.
 */
export function chapterAccuracy(minAnswers = 4) {
  const st = store.get();
  const bucket = new Map();
  Object.values(st.concepts).forEach(c => {
    if (!c.chapter) return;
    const b = bucket.get(c.chapter) || { right: 0, wrong: 0, met: 0 };
    b.right += c.right; b.wrong += c.wrong; b.met++;
    bucket.set(c.chapter, b);
  });

  const out = [];
  for (const [key, b] of bucket) {
    const where = unitFor(key);
    const asked = b.right + b.wrong;
    /* One unlucky answer is not a weak chapter. Below this many attempts the
       number says more about variance than about the learner. */
    if (!where || asked < minAnswers) continue;
    out.push({ ...where, chapter: key, met: b.met, asked, acc: b.right / asked });
  }
  return out.sort((x, y) => x.acc - y.acc);
}

/** The weakest chapter with enough answers behind it to mean anything. */
const weakestChapter = () => chapterAccuracy()[0] || null;

/**
 * What difficulty this learner should be drilled at in one chapter.
 *
 * Derived, never chosen for them and never stored — a saved level goes stale
 * the moment they improve, and a learner who has a bad week should not be
 * pinned to a tier they earned a month ago.
 *
 * The evidence is the chapter's own record:
 *   · nothing met here at all → GENTLE. A novice's first question should be
 *     one they can get right; that is the whole reason tiers exist.
 *   · met, but shaky → GENTLE while accuracy is under 55%, because more of
 *     the same difficulty is not what a struggling learner needs.
 *   · solid and well-drilled → STRETCH once accuracy is past 85% AND the
 *     ideas are sitting in the upper Leitner boxes. Accuracy alone is not
 *     enough: it can be high simply because nothing has been asked yet.
 *   · everything else → EXAM, which is what the paper asks.
 */
export function tierFor(academyId, unitN) {
  const st = store.get();
  const key = `${academyId}:${unitN}`;
  const mine = Object.values(st.concepts).filter(c => c.chapter === key);
  const asked = mine.reduce((n, c) => n + c.right + c.wrong, 0);

  /* Too little evidence to judge; start gently rather than guessing. */
  if (asked < 6) return { tier: 1, why: 'You have not drilled this chapter yet — starting gently.' };

  const acc = mine.reduce((n, c) => n + c.right, 0) / asked;
  const meanBox = mine.reduce((n, c) => n + c.box, 0) / mine.length;

  if (acc < 0.55) return { tier: 1, why: `You are at ${Math.round(acc * 100)}% here — easing off until it sticks.` };
  if (acc > 0.85 && meanBox >= 3) {
    return { tier: 3, why: `${Math.round(acc * 100)}% and holding — these are the harder ones.` };
  }
  return { tier: 2, why: `${Math.round(acc * 100)}% here — exam difficulty.` };
}

export const tierLabel = t => TIER_NAME[clampTier(t)];
export const tierBlurb = t => TIER_BLURB[clampTier(t)];

/** Overall completion, for the track header. */
export function overall() {
  /* Only what this build contains. Counting hidden chapters would tell a
     learner they had cleared 3 of 14 when the course they can actually see has
     twelve — a completion figure measured against material that is not there. */
  const ids = activeAcademies().flatMap(a => readyLessons(a).map(l => l.id));
  const p = store.pathProgress(ids);
  const chapters = activeAcademies().flatMap(a =>
    activeUnits(a).map(u => unitStats(u, store.isDone)));
  return {
    lessons: p, chaptersCleared: chapters.filter(c => c.ready && c.done === c.ready).length,
    chaptersTotal: chapters.length,
  };
}
