/* ============================================================
   Re-teaching — the return path the review queue never had.

   The queue could only ever RE-TEST. A concept answered badly dropped a
   Leitner box and came back sooner, as the same kind of question. That is
   the right medicine for something half-remembered and the wrong medicine
   for something never understood: asking a fourth time does not explain
   anything. A learner in the second case had no route back except finding
   the lesson by hand and sitting through it again, questions and all.

   This is that route, and it is short because the data was already there.
   Every `ask` step carries the concept it tests, and every concept is
   taught by exactly ONE lesson (the harness asserts both), so a concept
   names its lesson. What is left is to show the lesson's teaching without
   its questions, and then ask something the learner has not seen.

   It is not a lesson. `review: true` means the runner awards XP for the
   answers instead of completing anything, so a re-teach can never mark a
   path tile done, bank lesson XP twice, or appear in the lesson count.
   ============================================================ */

import * as store from './store.js';
import { chapterOf, unitFor } from './curriculum.js';
import { buildIndex } from './review.js';
import { drillConcept, generatorsDealing, questionSig, freshSeed } from './generators/index.js';
import { tierFor, tierLabel } from './progress.js';
import { clampTier } from './generators/rand.js';
import { href, chapterPath, lessonPath, reteachPath } from './routes.js';

/**
 * Does this step teach, as opposed to test?
 *
 * Decided from what the step CARRIES, never from its phase label — a label
 * is a caption and can be renamed without anybody noticing the consequence.
 * An `explore` and a `reveal` always teach. A `say` teaches when it has a
 * body or a figure; the bare one every lesson opens with is Betaal baiting a
 * newcomer ("answer it in your head before continuing"), and re-reading a
 * tease you have already failed is a poor way to begin.
 */
export const teaches = s =>
  s.type === 'reveal' || s.type === 'explore' || (s.type === 'say' && !!(s.body || s.figure));

/**
 * A lesson's teaching, in the order it was written.
 *
 * This is per LESSON, not per concept, and that is honest rather than lazy:
 * a lesson teaches one idea in three concept-sized slices, and its exposition,
 * its widget and its worked reveal serve all three. Splitting the spine by
 * which question happens to sit nearest each step was tried and thrown away —
 * it left 70 of the 195 concepts with nothing at all, because the drill and
 * mastery questions sit in a run at the end with no teaching between them.
 * A finer block would be invented, not derived.
 */
export const teachSpine = lesson => (lesson?.steps || []).filter(teaches);

/**
 * The tier a re-teach re-tests at: one step below what this chapter would
 * normally deal, floored at Gentle.
 *
 * The learner has just demonstrated they cannot do this at their usual level.
 * A re-teach that ends in another failure has taught nothing and has cost
 * them the one thing the Leitner boxes cannot give back, which is nerve.
 */
export function reteachTier(academyId, unitN) {
  const base = tierFor(academyId, unitN).tier;
  return clampTier(Math.max(1, base - 1));
}

/* Betaal names what the record actually says. He is amused by a wrong answer,
   never scornful, and he does not congratulate anybody for turning up. */
function opener(rec, label, n, tier) {
  const missed = rec
    ? (rec.wrong >= 2
        ? `You have missed <b>${label}</b> ${rec.wrong} times now.`
        : `You have met <b>${label}</b>, and it did not stick.`)
    : `You have not been asked <b>${label}</b> yet — but you asked to be taught it, so.`;

  return `${missed}<br><br>
    Asking it again is what the queue does, and the queue has had its turn. So: the explanation
    from the beginning, the diagram back in your hands, and only then the ${n === 1 ? 'question' : `${n} questions`}
    — set at <b>${tierLabel(tier)}</b>, which is a step below where I would normally put you.<br><br>
    Nothing here counts as finishing a lesson. Only the answers count.`;
}

/**
 * Build a re-teach for one concept.
 *
 * The shape is deliberate: teaching first, testing last. Everywhere else on
 * this site the learner must commit before an explanation appears — that rule
 * is the whole pedagogy. This is the one place it inverts, and only because
 * they already committed, and were wrong, and the explanation is what they
 * were owed for it.
 */
export async function makeReteachSession(conceptId, { size = 3, seed = freshSeed(), index = null } = {}) {
  const id = String(conceptId || '');
  const ix = index || await buildIndex();
  const questions = ix.byConcept.get(id) || [];
  if (!id || !questions.length) {
    return { session: null, concept: null, reason: 'no such idea' };
  }

  const lessonId = questions[0].lessonId;
  const lesson = ix.byLesson.get(lessonId);
  const spine = teachSpine(lesson);
  if (!spine.length) {
    /* Cannot happen with the 65 lessons as written, and the harness holds
       every one of them to it. Refusing beats shipping an empty re-teach. */
    return { session: null, concept: id, lesson, reason: 'that lesson has no teaching steps' };
  }

  const chapter = chapterOf(lessonId);
  const where = unitFor(chapter);
  const label = questions[0].conceptLabel || id;
  const tier = where ? reteachTier(where.academyId, where.unit.n) : 2;

  /* Generated first, because a generated question is genuinely new: a learner
     who has failed this three times may by now be recognising the item rather
     than the idea, and re-showing it would test their memory of an answer.
     41 of the 195 concepts can be generated, so most re-teaches still fall
     back to the lesson's own questions — which they have seen, but which are
     at least being asked AFTER the explanation this time.

     What it deliberately does NOT do is top up from the rest of the chapter.
     A re-teach that quietly widened into neighbouring ideas would be a
     practice set wearing a re-teach's name, and the evidence it fed back into
     the ladder would be about the wrong concept. */
  const generated = drillConcept(id, size, seed, tier).map((step, i) => ({
    key: `gen:${step.generatedBy}:${i}`, concept: id, conceptLabel: step.conceptLabel || label,
    lessonId, step, generated: true,
  }));
  /* `drillConcept` already refuses to deal the same question twice; this catches
     the remaining case, where a generated draw lands on the written one it was
     modelled after. Three questions is a small enough set that one repeat in it
     reads as carelessness. */
  const seen = new Set();
  const picked = [...generated, ...questions]
    .filter(q => { const k = questionSig(q.step); return !seen.has(k) && seen.add(k); })
    .slice(0, size);

  const rec = store.get().concepts[id] || null;
  const intro = {
    type: 'say', phase: 'Start', mood: 'thinking',
    title: `Again, then — ${label}`,
    say: opener(rec, label, picked.length, tier),
    cta: 'Show me it again',
  };

  /* The checklists stay visible but stop gating. A learner sent here is being
     re-taught, not examined on whether they can drive the widget, and making
     them tick four boxes before they may answer would be a toll booth. */
  const teach = spine.map(s => (s.type === 'explore' ? { ...s, gate: false } : s));

  const asks = picked.map((q, i) => {
    const { say, ...rest } = q.step;      // his lesson-specific line refers to steps we dropped
    return { ...rest, phase: `Q${i + 1}` };
  });

  return {
    concept: id, label, lesson, chapter, where, tier,
    questions: picked, generated: generated.length, written: picked.length - generated.length,
    reason: null,
    session: {
      id: 'reteach.session',
      title: `Re-teach · ${label}`,
      chapter,                              // so every answer is attributed to the right chapter
      review: true,                         // not a lesson: never appears on the path
      reteach: true,                        // and never offers a re-teach of itself — see runner
      xpPerCorrect: 4,
      backHref: where ? href(chapterPath(where.academyId, where.unit.n)) : href(''),
      nextHref: where ? href(chapterPath(where.academyId, where.unit.n)) : href(''),
      nextLabel: where ? `Back to ${where.unit.title}` : 'Back to the dashboard',
      /* Where a learner goes when the re-teach itself did not land. Another
         re-teach would only replay the same four steps, so the escalation is
         the whole lesson — questions, drills and all. */
      lessonHref: href(lessonPath(lessonId)),
      lessonTitle: lesson.title,
      /* A fresh seed each time, so "Another set" re-tests rather than repeats. */
      againHref: href(reteachPath(id)),
      steps: [intro, ...teach, ...asks],
    },
  };
}

/** Can this idea be asked in fresh numbers, or only re-shown? */
export const hasGenerator = conceptId => generatorsDealing(conceptId).length > 0;
