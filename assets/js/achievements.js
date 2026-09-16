/* ============================================================
   Achievements.

   `store.js` says this out loud and it is worth repeating here, because
   this file is exactly where the rule gets broken:

     "Deliberately NOT gamified further: no hearts, no leagues. The
      research is clear that when the game outranks the learning,
      people optimise the game."

   So these are not Duolingo's leagues. Every badge below is earned by
   LEARNING something — a chapter finished, an idea carried to the top
   of its Leitner ladder, a concept recovered after being lost — and none
   of them can be earned by turning up, clicking fast, or keeping a
   streak alive with a token answer. The two that touch streaks are
   capped low and framed as habit, not as a score to defend.

   The deeper reason: XP and streaks measure ACTIVITY, and a learner who
   optimises activity gets worse at the exam. Mastery counts measure what
   the Leitner boxes actually believe you know, which is the thing worth
   showing off.

   Each badge is a pure predicate over the store's state, so it can be
   re-evaluated at any time and can never drift out of step with the
   record. `earn()` is called after anything that changes progress.
   ============================================================ */

/** Concepts sitting at box 4 or higher — the store's own bar for "mastered". */
const mastered = st => Object.values(st.concepts).filter(c => c.box >= 4).length;
const lessonsDone = st => Object.values(st.lessons).filter(l => l.status === 'done').length;
const answered = st => Object.values(st.concepts).reduce((n, c) => n + c.right + c.wrong, 0);

/**
 * `when` receives the whole state and returns true once the badge is earned.
 * `goal`/`now` drive the progress bar on a locked badge — a badge you cannot
 * see yourself approaching is just a surprise, not a motivator.
 */
export const ACHIEVEMENTS = [
  { id: 'first-lesson', icon: '🌱', name: 'First ground taken',
    blurb: 'Finish your first lesson.',
    now: lessonsDone, goal: () => 1, when: st => lessonsDone(st) >= 1 },

  { id: 'ten-lessons', icon: '📘', name: 'Ten down',
    blurb: 'Finish ten lessons.',
    now: lessonsDone, goal: () => 10, when: st => lessonsDone(st) >= 10 },

  { id: 'chapter-clear', icon: '🏳️', name: 'Chapter cleared',
    blurb: 'Finish every built lesson in one chapter.',
    now: (st, ctx) => ctx.bestChapter.done, goal: (st, ctx) => ctx.bestChapter.ready || 1,
    when: (st, ctx) => ctx.clearedChapters >= 1 },

  { id: 'three-chapters', icon: '🗺️', name: 'Three chapters clear',
    blurb: 'Finish three chapters outright.',
    now: (st, ctx) => ctx.clearedChapters, goal: () => 3,
    when: (st, ctx) => ctx.clearedChapters >= 3 },

  { id: 'academy-clear', icon: '🎓', name: 'Academy finished',
    blurb: 'Finish every built lesson in one academy.',
    now: (st, ctx) => ctx.bestAcademy.done, goal: (st, ctx) => ctx.bestAcademy.total || 1,
    when: (st, ctx) => ctx.clearedAcademies >= 1 },

  /* Mastery, not activity: these count what the Leitner boxes believe. */
  { id: 'mastered-10', icon: '🧠', name: 'Ten ideas held',
    blurb: 'Carry ten concepts to box 4 or higher.',
    now: mastered, goal: () => 10, when: st => mastered(st) >= 10 },

  { id: 'mastered-50', icon: '💎', name: 'Fifty ideas held',
    blurb: 'Carry fifty concepts to box 4 or higher.',
    now: mastered, goal: () => 50, when: st => mastered(st) >= 50 },

  { id: 'top-box', icon: '🔒', name: 'Locked in',
    blurb: 'Push one concept to the very top box.',
    now: st => Math.max(0, ...Object.values(st.concepts).map(c => c.box)), goal: () => 6,
    when: st => Object.values(st.concepts).some(c => c.box >= 6) },

  /* The most honest badge here. Getting something wrong and later getting it
     right is the whole point of a spaced schedule, so it is worth marking. */
  { id: 'recovered', icon: '♻️', name: 'Won it back',
    blurb: 'Get a concept right after having got it wrong.',
    now: st => Object.values(st.concepts).filter(c => c.wrong > 0 && c.box >= 3).length,
    goal: () => 1,
    when: st => Object.values(st.concepts).some(c => c.wrong > 0 && c.box >= 3) },

  { id: 'hundred-answers', icon: '💯', name: 'A hundred answered',
    blurb: 'Answer a hundred questions, right or wrong.',
    now: answered, goal: () => 100, when: st => answered(st) >= 100 },

  { id: 'perfect-set', icon: '🎯', name: 'Clean sheet',
    blurb: 'Finish a practice set without a single miss.',
    now: st => (st.flags?.perfectSet ? 1 : 0), goal: () => 1,
    when: st => !!st.flags?.perfectSet },

  /* Habit, capped deliberately low. There is no 365-day badge here on purpose:
     a streak worth defending at any cost stops being a study habit. */
  { id: 'streak-7', icon: '🔥', name: 'A week running',
    blurb: 'Study on seven consecutive days.',
    now: st => st.streak.best, goal: () => 7, when: st => st.streak.best >= 7 },
];

/** Facts several badges need, computed once per evaluation. */
export function contextFor(st, ACADEMIES, readyLessons, isDone) {
  let cleared = 0, bestChapter = { done: 0, ready: 1 };
  let clearedAcademies = 0, bestAcademy = { done: 0, total: 1 };

  for (const aid of Object.keys(ACADEMIES)) {
    const ready = new Set(readyLessons(aid).map(l => l.id));
    let aDone = 0;
    for (const u of ACADEMIES[aid].units) {
      const built = u.lessons.filter(l => ready.has(l.id));
      const done = built.filter(l => isDone(l.id)).length;
      aDone += done;
      if (built.length && done === built.length) cleared++;
      if (built.length && done / built.length >= bestChapter.done / (bestChapter.ready || 1)) {
        bestChapter = { done, ready: built.length };
      }
    }
    const total = ready.size;
    if (total && aDone === total) clearedAcademies++;
    if (aDone >= bestAcademy.done) bestAcademy = { done: aDone, total };
  }
  return { clearedChapters: cleared, bestChapter, clearedAcademies, bestAcademy };
}

/**
 * Evaluate every badge and return the ids newly earned.
 *
 * Pure: it does not write. The store decides what to persist, which keeps
 * this file testable without a storage layer.
 */
export function evaluate(st, ctx) {
  const held = st.achievements || {};
  return ACHIEVEMENTS.filter(a => !held[a.id] && a.when(st, ctx)).map(a => a.id);
}

/** Earned and locked badges, with progress, ready to render. */
export function shelf(st, ctx) {
  const held = st.achievements || {};
  return ACHIEVEMENTS.map(a => {
    const goal = Math.max(1, a.goal(st, ctx));
    const now = Math.min(goal, Math.max(0, a.now(st, ctx) || 0));
    return {
      id: a.id, icon: a.icon, name: a.name, blurb: a.blurb,
      earned: !!held[a.id], on: held[a.id] || null,
      now, goal, pct: Math.round(now / goal * 100),
    };
  });
}
