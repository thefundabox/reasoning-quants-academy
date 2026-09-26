/* ============================================================
   Review sessions — the missing half of the Membean model.

   The store has tracked per-concept Leitner boxes since the beginning,
   and the dashboard has shown what is due. But there was nothing to
   PRACTISE: the queue named ideas and then left you to go and find a
   lesson that happened to cover them.

   This assembles a mixed set instead. Every `ask` step in every lesson
   already carries a `concept` and a `conceptLabel` — that is the whole
   index, and it needs no build step, so it can never go stale.

   A review session deliberately does NOT complete a lesson. It awards
   XP for the answers and lets `store.answered` move each concept up or
   down its ladder, which is the only bookkeeping that matters here.
   ============================================================ */

import * as store from './store.js';
import { ACADEMIES, readyLessons, activeUnits } from './curriculum.js';
import { drill, freshSeed } from './generators/index.js';
import { SET_GENERATORS, expandSet } from './generators/sets.js';
import { rng } from './generators/rand.js';
import { TIER_NAME, TIER_BLURB, clampTier } from './generators/rand.js';
import { href, chapterPath, practicePath, drillPath } from './routes.js';

/** A lesson id maps to its file by one rule, asserted by the harness. */
export const fileFor = id => `./lessons/${id.replace(/\./g, '-')}.js`;

/**
 * Every question in the academy, indexed by the concept it tests.
 * Built by importing the ready lessons — 65 small modules, no build step,
 * and nothing to regenerate when a lesson changes.
 *
 * The whole lesson is kept alongside, in `byLesson`. The questions are all a
 * review set needs, but re-teaching needs the steps that are NOT questions —
 * and they were already imported, so holding them costs nothing.
 */
export async function buildIndex(only = null) {
  const ids = only || Object.keys(ACADEMIES).flatMap(a => readyLessons(a).map(l => l.id));
  const byConcept = new Map();
  const byLesson = new Map();
  const all = [];

  await Promise.all(ids.map(async id => {
    let mod;
    try { mod = await import(fileFor(id)); } catch { return; }   // unbuilt or renamed
    const lsn = mod.default;
    byLesson.set(lsn.id, lsn);
    lsn.steps.forEach((step, i) => {
      if (step.type !== 'ask' || !step.concept) return;
      const q = {
        key: `${lsn.id}#${i}`,
        concept: step.concept,
        conceptLabel: step.conceptLabel || step.concept,
        lessonId: lsn.id,
        lessonTitle: lsn.title,
        step,
      };
      all.push(q);
      if (!byConcept.has(q.concept)) byConcept.set(q.concept, []);
      byConcept.get(q.concept).push(q);
    });
  }));

  return { byConcept, byLesson, all };
}

/* A deterministic shuffle would be predictable across sessions; a random one
   means two reviews of the same concept rarely open with the same question. */
const shuffled = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);

/**
 * Choose what to practise, in priority order:
 *   1 · concepts actually due on the Leitner schedule
 *   2 · concepts answered badly, whether or not they are due
 *   3 · anything else already met, lowest box first
 *   4 · never-met concepts, but ONLY to top up a short set
 *
 * That last restriction matters. Review means revisiting, so a learner who has met
 * nothing gets an empty order and the page says so — offering them a quiz on
 * material they have never been taught would seed their Leitner boxes with
 * concepts they have no reason to know, and quietly corrupt the whole schedule.
 */
export function chooseConcepts(index, size) {
  const st = store.get();
  const due = store.dueForReview().map(c => c.id);
  const weak = store.weakest(20).map(c => c.id);
  const met = Object.entries(st.concepts)
    .sort((a, b) => a[1].box - b[1].box).map(([id]) => id);

  const order = [];
  const push = id => { if (index.byConcept.has(id) && !order.includes(id)) order.push(id); };
  due.forEach(push);
  weak.forEach(push);
  met.forEach(push);

  const metAnything = order.length > 0;
  if (metAnything && order.length < size) shuffled([...index.byConcept.keys()]).forEach(push);

  return { order, dueCount: due.filter(id => index.byConcept.has(id)).length, size, metAnything };
}

/** One question per concept first; only double up once every concept has had a turn. */
export function pickQuestions(index, order, size) {
  const out = [], used = new Set();
  for (let pass = 0; out.length < size && pass < 4; pass++) {
    for (const c of order) {
      if (out.length >= size) break;
      const pool = shuffled(index.byConcept.get(c) || []).filter(q => !used.has(q.key));
      if (!pool.length) continue;
      used.add(pool[0].key);
      out.push(pool[0]);
    }
    if (!order.length) break;
  }
  return out;
}

/**
 * Wrap the chosen questions as something `runLesson` can run.
 * The `review: true` flag tells the runner not to mark a lesson complete —
 * a practice set is not a lesson, and it must not appear on the path.
 */
export function buildSession(questions, { dueCount = 0 } = {}) {
  const intro = {
    type: 'say', phase: 'Start', mood: 'neutral',
    title: dueCount ? `${dueCount} idea${dueCount > 1 ? 's are' : ' is'} due` : 'A mixed set',
    say: dueCount
      ? `These came back because the schedule says you are about to forget them — that is the
         moment practice is worth most.<br><br>
         ${questions.length} question${questions.length > 1 ? 's' : ''}, drawn from wherever in the
         two academies they happen to live. Get one right and it moves up its ladder; get it wrong
         and it drops back down and returns sooner.`
      : `Nothing is due yet, so this is a mixed set from what you have met — a spread across both
         academies rather than one topic.<br><br>
         ${questions.length} question${questions.length > 1 ? 's' : ''}. Answer honestly; the
         ladder only helps if it knows what you actually know.`,
    cta: 'Begin',
  };

  const steps = questions.map((q, i) => {
    const { say, ...rest } = q.step;          // drop the lesson-specific Betaal line
    return {
      ...rest,
      phase: `Q${i + 1}`,
      context: `${rest.context || ''}<p class="qsrc">from <b>${q.lessonTitle}</b></p>`,
    };
  });

  return {
    id: 'review.session',
    title: 'Review',
    review: true,
    xpPerCorrect: 4,
    backHref: href(''),
    nextHref: href(''),
    nextLabel: 'Back to the dashboard',
    steps: [intro, ...steps],
  };
}

/** Everything above, in one call. */
export async function makeSession(size = 8) {
  const index = await buildIndex();
  const { order, dueCount } = chooseConcepts(index, size);
  const questions = pickQuestions(index, order, size);
  return { session: questions.length ? buildSession(questions, { dueCount }) : null,
           questions, dueCount, index };
}

/* ============================================================
   Chapter practice — the same machinery, aimed at one unit.

   A REVIEW is chosen by the schedule: it may only draw on concepts the
   learner has already met, because seeding a Leitner box with an idea
   nobody has taught them would corrupt the schedule that decides all
   their future practice.

   A CHAPTER PRACTICE is chosen by the learner. They have pointed at a
   unit and asked for questions on it, so unmet concepts inside that unit
   are fair game — answering them is real evidence either way, and the
   scope is one chapter rather than the whole academy. Everything else is
   shared: same questions, same Leitner bookkeeping, same refusal to mark
   a lesson complete.
   ============================================================ */

/** The unit itself, or null if the academy or number is not one we have. */
export function findUnit(academyId, unitN) {
  /* Through `activeUnits`, so a chapter switched off in config.js is a chapter
     this page does not have — practice, drill and the "Another set" link all
     resolve through here, and a URL that reached a hidden chapter would be a
     back door into content the course says it does not contain. */
  return activeUnits(academyId).find(u => u.n === +unitN) || null;
}

/** The built lessons of one unit — the only ones with questions behind them. */
export function unitLessonIds(academyId, unitN) {
  const unit = findUnit(academyId, unitN);
  if (!unit) return [];
  const ready = new Set(readyLessons(academyId).map(l => l.id));
  return unit.lessons.filter(l => ready.has(l.id)).map(l => l.id);
}

/**
 * Order one chapter's concepts: due first, then weak, then met, then the rest
 * of the chapter. That last group is what separates this from `chooseConcepts` —
 * see the note above.
 */
export function chooseChapterConcepts(index) {
  const st = store.get();
  const due = store.dueForReview().map(c => c.id);
  const weak = store.weakest(20).map(c => c.id);
  const met = Object.entries(st.concepts).sort((a, b) => a[1].box - b[1].box).map(([id]) => id);

  const order = [];
  const push = id => { if (index.byConcept.has(id) && !order.includes(id)) order.push(id); };
  due.forEach(push);
  weak.forEach(push);
  met.forEach(push);
  shuffled([...index.byConcept.keys()]).forEach(push);   // the chapter's own, met or not

  return { order, dueCount: due.filter(id => index.byConcept.has(id)).length };
}

/** Wrap a chapter's questions as something `runLesson` can run. */
export function buildChapterSession(questions, { academy, unit, dueCount = 0 } = {}) {
  const n = questions.length;
  const intro = {
    type: 'say', phase: 'Start', mood: 'teasing',
    title: `${unit.title} — ${n} question${n > 1 ? 's' : ''}`,
    say: `You picked this chapter, so this set stays inside it: ${n} question${n > 1 ? 's' : ''}
          drawn only from <b>${unit.title}</b>.<br><br>
          ${dueCount
            ? `${dueCount} of the ideas here ${dueCount > 1 ? 'are' : 'is'} already due, so they come first. `
            : ''}Every answer still moves its idea up or down the ladder — practising a chapter
          early is allowed, and I will remember how it went either way.`,
    cta: 'Begin',
  };

  const steps = questions.map((q, i) => {
    const { say, ...rest } = q.step;           // drop the lesson-specific Betaal line
    return {
      ...rest,
      phase: `Q${i + 1}`,
      context: `${rest.context || ''}<p class="qsrc">from <b>${q.lessonTitle}</b></p>`,
    };
  });

  return {
    id: 'practice.chapter',
    title: `Practice · ${unit.title}`,
    chapter: `${academy.id}:${unit.n}`,
    review: true,                              // not a lesson: never appears on the path
    xpPerCorrect: 4,
    backHref: href(chapterPath(academy.id, unit.n)),
    nextHref: href(chapterPath(academy.id, unit.n)),
    nextLabel: `Back to ${unit.title}`,
    /* This page is nothing without its chapter, so "Another set" has to carry
       the chapter with it — a bare "./" lands on "No such chapter". */
    againHref: href(practicePath(academy.id, unit.n)),
    steps: [intro, ...steps],
  };
}

/** Everything above, for one chapter, in one call. */
export async function makeChapterSession(academyId, unitN, size = 8, seed = freshSeed()) {
  const academy = ACADEMIES[academyId];
  const unit = findUnit(academyId, unitN);
  if (!academy || !unit) return { session: null, questions: [], unit: null, academy: null, reason: 'no such chapter' };

  const ids = unitLessonIds(academyId, unitN);
  if (!ids.length) return { session: null, questions: [], unit, academy, reason: 'no built lessons yet' };

  const index = await buildIndex(ids);
  const { order, dueCount } = chooseChapterConcepts(index);
  const written = pickQuestions(index, order, size);

  /* Top up from the generators when the chapter runs out of written questions.
     A chapter holds ~18 of them, so asking for 20 used to hand back 18 and a
     learner drilling hard met the same ones within two sessions. Generated
     questions carry a concept the chapter already teaches, so they feed the
     same mastery ladder. `drill` returns [] for a chapter with no generators,
     and then this behaves exactly as it did before. */
  const short = size - written.length;
  const generated = short > 0 ? drill(academyId, unitN, short, seed) : [];
  const questions = [...written, ...generated.map((step, i) => ({
    key: `gen:${step.generatedBy}:${i}`,
    concept: step.concept, conceptLabel: step.conceptLabel,
    lessonId: null, lessonTitle: `${unit.title} · generated`, step, generated: true,
  }))];

  return {
    session: questions.length ? buildChapterSession(questions, { academy, unit, dueCount }) : null,
    questions, unit, academy, dueCount, index,
    written: written.length, generated: generated.length,
    reason: questions.length ? null : 'no questions in this chapter',
  };
}

/**
 * An endless set for one chapter — every question generated, nothing repeated
 * from the lessons. This is the answer to "the chapter only has 18 questions":
 * a different seed every time means a different paper every time.
 */
/* The endless drill never deals below EXAM difficulty.

   It used to take the tier straight from the learner's record, and a record
   with nothing in it derives Gentle — so a chapter nobody had drilled yet
   opened on its smallest numbers and shortest chains, and stayed there until
   six answers had been banked. Every learner's FIRST look at the drill was
   therefore its easiest possible face, which is exactly the wrong way round
   for the page whose whole purpose is exam pressure. Written practice still
   starts gently; that is what it is for. */
export const DRILL_FLOOR = 2;

export function makeDrillSession(academyId, unitN, size = 10, seed = freshSeed(), tier = DRILL_FLOOR) {
  const academy = ACADEMIES[academyId];
  const unit = findUnit(academyId, unitN);
  if (!academy || !unit) return { session: null, questions: [], unit: null, academy: null, reason: 'no such chapter' };

  /* A chapter with a SET generator opens on one — a table or an arrangement
     with several questions hanging off it. That is a third of what the paper
     actually asks and no amount of standalone drilling rehearses it: the skill
     is solving the stimulus ONCE and reading several answers off it. Only when
     the set is a reasonable share of the paper, so a six-question drill is not
     two-thirds one table. */
  tier = Math.max(DRILL_FLOOR, clampTier(tier));
  const setGen = SET_GENERATORS.find(g => g.chapter === `${academyId}:${unitN}`);
  const setSteps = (setGen && size >= 6)
    ? (() => { try { return expandSet(setGen, rng(seed ^ 0x5eed), clampTier(tier), 0); } catch { return []; } })()
    : [];
  const steps = [...setSteps, ...drill(academyId, unitN, Math.max(0, size - setSteps.length), seed, tier, false)]
    .slice(0, size)
    .map((st, i) => ({ ...st, phase: `Q${i + 1}` }));
  if (!steps.length) {
    return { session: null, questions: [], unit, academy, reason: 'no generators for this chapter yet' };
  }

  const intro = {
    type: 'say', phase: 'Start', mood: 'teasing',
    title: `${unit.title} — ${steps.length} fresh questions`,
    say: `These are built to order, not picked from a list — new numbers, new names, new
          arrangement every time you open this page. Reload it and you get a different paper.<br><br>
          Difficulty: <b>${TIER_NAME[clampTier(tier)]}</b> — ${TIER_BLURB[clampTier(tier)]}
          The drill never goes below exam difficulty, and the last question is a shade harder still.<br><br>
          ${setSteps.length ? `It opens with a <b>shared-stimulus set</b>: ${setSteps.length}
            questions off one ${academyId === 'quants' ? 'table' : 'arrangement'}. Solve it once
            and read all ${setSteps.length} answers off it — that is what the paper is testing.<br><br>` : ''}
          Same rules as anywhere else: every answer moves its idea up or down the ladder.`,
    cta: 'Begin',
  };

  return {
    session: {
      id: 'practice.drill', title: `${unit.title} drill`,
      chapter: `${academy.id}:${unit.n}`,
      tier: clampTier(tier),
      review: true, xpPerCorrect: 4,
      backHref: href(chapterPath(academy.id, unit.n)), nextHref: href(chapterPath(academy.id, unit.n)),
      nextLabel: `Back to ${unit.title}`,
      /* Same URL, fresh seed on load — so "Another set" really is another set. */
      againHref: `${href(drillPath(academy.id, unit.n))}?tier=${clampTier(tier)}`,
      steps: [intro, ...steps],
    },
    questions: steps, unit, academy, reason: null,
  };
}

/** How many questions a chapter can offer — used to hide a dead practice link. */
export async function chapterQuestionCount(academyId, unitN) {
  const ids = unitLessonIds(academyId, unitN);
  if (!ids.length) return 0;
  return (await buildIndex(ids)).all.length;
}
