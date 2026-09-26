/* ============================================================
   The mock paper — the one exam-shaped thing the site lacked.

   Everything else here is untimed, single-chapter, and tells you the
   answer the moment you commit. RPSC does none of those things. It gives
   150 questions in 180 minutes — about 72 seconds each — mixes every
   topic, deducts a third of a mark for a wrong answer, and says nothing
   until it is over. A learner trained only on the lesson loop arrives
   accurate and slow, and discovers on the day that accuracy alone does
   not finish a paper.

   So this is deliberately NOT the lesson runner. Three differences, each
   of which is the point rather than a limitation:

     · No feedback until submission. The runner's whole rule is commit,
       then be told. Here you commit and hear nothing, because deciding
       whether you are sure — with no confirmation coming — is itself the
       skill the paper tests.
     · Free navigation. Questions can be skipped, returned to and flagged,
       because choosing what to leave is most of exam technique. A linear
       runner cannot teach that.
     · A penalty for being wrong. With −1/3 a mark, a blind guess is worth
       exactly zero in expectation and a guess between two options is
       worth a third of a mark. That arithmetic changes what you should
       attempt, and no untimed practice set ever surfaces it.

   Answers are recorded against the Leitner ladder only at SUBMISSION,
   never as they are given: recording live would let a learner infer, from
   the dashboard in another tab, what they had got right.
   ============================================================ */

import * as store from './store.js';
import { CONFIG } from './config.js';
import { ACADEMIES, unitFor, activeAcademies, activeUnits } from './curriculum.js';
import { drill, generatorsFor, freshSeed } from './generators/index.js';
import { SET_GENERATORS, expandSet } from './generators/sets.js';
import { rng, clampTier } from './generators/rand.js';
import { orderOptions } from './options.js';
import { betaalSVG } from './betaal.js';
import { refreshAchievements } from './progress.js';

/* RPSC's own arithmetic: 150 questions in 180 minutes. Everything below is
   derived from that ratio rather than typed in, so a different paper length
   still gets an honest clock. */
export const SECONDS_PER_QUESTION = CONFIG.exam.secondsPerQuestion;   // 72 by default
export const PENALTY = CONFIG.exam.penalty;                           // deducted per wrong answer

export const PAPER_SIZES = CONFIG.exam.paperSizes;

/**
 * How a paper is built.
 *
 * Every chapter contributes, because the thing a mixed paper tests and a
 * chapter drill cannot is SWITCHING — recognising which machinery a question
 * wants before solving it. Two of the slots are sets, since roughly a third of
 * a real reasoning section arrives as a shared stimulus with several questions
 * hanging off it.
 */
export function blueprint(n) {
  /* Through the curriculum's own filters, not around them. Reading ACADEMIES
     directly was a real bug: a chapter switched off in config.js disappeared
     from the path, the review index and the drills, and the mock went on
     dealing questions from it — which is worse than not hiding it at all,
     because the learner meets material the course says it does not contain. */
  const chapters = activeAcademies().flatMap(a =>
    activeUnits(a).filter(u => generatorsFor(a, u.n).length).map(u => `${a}:${u.n}`));

  /* How many sets a paper carries is a PROPORTION, not "all of them".
     The first version used `SET_GENERATORS.length` directly, which was fine at
     two sets and wrong the moment there were four: sixteen of a 25-question
     paper's slots went to shared stimuli, leaving nine singles to cover
     fourteen chapters — so a "mixed" paper stopped reaching four of them. The
     harness caught it, which is exactly what that check is for.

     Two bounds, and the tighter one wins:
       · about a third of the paper, which is roughly the share of a real
         reasoning section that arrives as a shared stimulus;
       · never so many that the singles cannot give every chapter one question,
         because a paper that skips chapters is a drill wearing a mock's name. */
  const wanted = Math.floor(n * CONFIG.exam.setShare / SET_LENGTH);
  const affordable = Math.floor((n - chapters.length) / SET_LENGTH);
  const sets = Math.max(0, Math.min(SET_GENERATORS.length, wanted, affordable));
  return { chapters, sets, singles: Math.max(0, n - sets * SET_LENGTH) };
}

/* Sets deal 3–4 questions depending on tier; budget for the larger, so a paper
   can never over-commit its slots and come up short of chapters. */
const SET_LENGTH = 4;

/**
 * Deal one paper.
 *
 * Seeded end to end, so a paper can be reproduced from its seed alone — that
 * is what lets the harness check a paper it has already scored, and what lets
 * a learner reload mid-test without the questions changing underneath them.
 */
export function buildPaper({ n = 25, seed = freshSeed(), tier = 2 } = {}) {
  const t = clampTier(tier);
  const R = rng(seed);
  const { chapters, sets, singles } = blueprint(n);
  const out = [];

  /* Shuffled, and preferring a fresh chapter each time: two DI tables in one
     paper is the same question twice as far as switching practice goes. A set
     whose chapter is switched off is dropped with it. */
  const pool = R.shuffle(SET_GENERATORS.filter(g => chapters.includes(g.chapter)));
  const usedChapters = new Set();
  const chosen = [...pool.filter(g => !usedChapters.has(g.chapter) && usedChapters.add(g.chapter)),
                  ...pool].slice(0, sets);
  for (let i = 0; i < chosen.length; i++) {
    try { out.push(...expandSet(chosen[i], R, t, i)); }
    catch { /* a set that cannot build is skipped, never fatal — see below */ }
  }

  /* Every chapter once, then round-robin for whatever is left. Dealing at
     random instead left papers that skipped four chapters and asked three
     questions from one, which is not what a mixed paper is for. */
  const order = R.shuffle(chapters);
  let guard = 0;
  while (out.length < n && guard < n * 8) {
    const key = order[guard % order.length];
    const { academyId, unit } = unitFor(key);
    const [q] = drill(academyId, unit.n, 1, R.int(1, 1e9), t);
    guard++;
    if (q) out.push(q);
  }

  /* Options are re-seated ONCE, here, rather than at render time. A mock is
     navigated back and forth, and a learner returning to question 7 must find
     it exactly as they left it — see options.js for why the key would
     otherwise wander. */
  const questions = out.slice(0, n).map((q, i) => {
    const seated = orderOptions(q, `mock:${seed}:${i}:${q.q}`);
    return { ...seated, n: i + 1, chapter: q.chapter || chapterOfQuestion(q) };
  });

  return {
    seed, tier: t, questions,
    seconds: Math.round(questions.length * SECONDS_PER_QUESTION),
    max: questions.length,
  };
}

/* A generated question carries its generator's chapter; a set question carries
   the set's. Anything without one is attributed to nothing rather than guessed
   at, exactly as `store.answered` treats an unattributed concept. */
function chapterOfQuestion(q) {
  const all = [...SET_GENERATORS];
  const g = all.find(x => x.id === q.generatedBy);
  return g ? g.chapter : null;
}

/**
 * Score a paper the way the exam scores it.
 *
 * Unattempted is zero, not negative — the penalty exists to price a guess, not
 * to punish restraint. That distinction is the whole reason a mock is worth
 * sitting: it makes "leave it" a real, costed option for the first time.
 */
export function score(paper, answers) {
  const byChapter = {};
  let correct = 0, wrong = 0, attempted = 0;

  paper.questions.forEach((q, i) => {
    const given = answers[i];
    const key = q.chapter || 'unattributed';
    const b = byChapter[key] || (byChapter[key] = { asked: 0, correct: 0, wrong: 0, skipped: 0 });
    b.asked++;
    if (given === null || given === undefined) { b.skipped++; return; }
    attempted++;
    if (given === q.answer) { correct++; b.correct++; } else { wrong++; b.wrong++; }
  });

  const raw = correct - wrong * PENALTY;
  return {
    correct, wrong, attempted, skipped: paper.questions.length - attempted,
    max: paper.questions.length,
    score: Math.round(raw * 100) / 100,
    pct: Math.round((raw / paper.questions.length) * 1000) / 10,
    accuracy: attempted ? Math.round((correct / attempted) * 1000) / 10 : 0,
    byChapter,
  };
}

/**
 * Where the time went, and what the flags were worth.
 *
 * Two questions a mock can answer and nothing else here can. First: **what did
 * the questions you got WRONG cost you?** Three minutes sunk into a question
 * that then scores −1/3 is the single most expensive thing a candidate does,
 * and it is invisible without per-question timing — the total looks fine
 * because the time was spent, just not on anything that paid.
 *
 * Second: **do you flag things you actually know?** A flag is a promise to come
 * back, and coming back costs re-reading the question from scratch. A learner
 * who flags six and gets five of them right is not managing risk, they are
 * paying twice for questions they had.
 */
export function analyse(paper, answers, spent = [], flagged = []) {
  const flags = new Set(flagged);
  const per = paper.questions.map((q, i) => {
    const given = answers[i];
    return {
      n: i + 1, chapter: q.chapter, concept: q.concept,
      given, ok: given !== null && given !== undefined && given === q.answer,
      blank: given === null || given === undefined,
      seconds: Math.round(spent[i] || 0),
      flagged: flags.has(i),
    };
  });

  const sum = (rows, f = () => true) => rows.filter(f).reduce((t, r) => t + r.seconds, 0);
  const total = sum(per) || 1;
  const f = per.filter(r => r.flagged);

  return {
    per,
    time: {
      total: sum(per),
      onCorrect: sum(per, r => r.ok),
      onWrong: sum(per, r => !r.ok && !r.blank),
      onBlank: sum(per, r => r.blank),
      /* The share of the clock that bought nothing. Blanks are included: time
         spent reading a question you then left is still time spent. */
      wastedPct: Math.round((sum(per, r => !r.ok) / total) * 100),
      slowest: [...per].sort((a, b) => b.seconds - a.seconds).slice(0, 3),
    },
    flagged: {
      count: f.length,
      correct: f.filter(r => r.ok).length,
      wrong: f.filter(r => !r.ok && !r.blank).length,
      blank: f.filter(r => r.blank).length,
      /* Accuracy on flagged vs the rest — the number that says whether a flag
         means "unsure" or "I know this but want a second look". */
      accuracy: f.filter(r => !r.blank).length
        ? Math.round(f.filter(r => r.ok).length / f.filter(r => !r.blank).length * 100) : null,
      restAccuracy: (() => {
        const rest = per.filter(r => !r.flagged && !r.blank);
        return rest.length ? Math.round(rest.filter(r => r.ok).length / rest.length * 100) : null;
      })(),
    },
  };
}

/**
 * What the paper says about how to sit the next one.
 *
 * Deliberately about STRATEGY rather than topics — the chapter breakdown
 * already says what to study, and a learner who reads only "revise averages"
 * takes the same 20 unattempted questions into the next paper.
 */
export function verdictFor(res, secondsUsed, paper, detail = null) {
  const notes = [];
  const skipRate = res.skipped / res.max;
  const guessCost = res.wrong * PENALTY;

  if (skipRate > 0.3) {
    notes.push(`You left <b>${res.skipped} of ${res.max}</b> unanswered. Every skipped question is
      a certain zero, while a guess between two options is worth a third of a mark on average —
      at this skip rate the clock, not the syllabus, is what is costing you marks.`);
  } else if (res.attempted === res.max && res.accuracy < 55) {
    notes.push(`You answered everything and got ${res.accuracy}% of them right. The penalty took
      <b>${Math.round(guessCost * 100) / 100} marks</b> off you — below about 50% accuracy,
      attempting everything scores worse than leaving the ones you cannot see a route into.`);
  } else if (res.accuracy >= 80 && skipRate > 0.15) {
    notes.push(`${res.accuracy}% on what you attempted, and ${res.skipped} left. You are more
      accurate than you are fast — the marks are sitting in the questions you did not reach.`);
  } else {
    notes.push(`${res.correct} right, ${res.wrong} wrong, ${res.skipped} left — a balanced paper.
      The penalty cost you ${Math.round(guessCost * 100) / 100} marks.`);
  }

  /* Three bands, not two. The first version compared against 1.25× the budget
     and then told a learner averaging 78 seconds that they were "inside the
     72-second budget" — which is the sort of praise that costs marks. */
  const budget = SECONDS_PER_QUESTION;
  const pace = secondsUsed / Math.max(1, res.attempted);
  if (res.attempted >= 3) {
    const p = Math.round(pace);
    notes.push(pace > budget * 1.25
      ? `You averaged <b>${p}s</b> per attempted question against a budget of ${Math.round(budget)}s.
         Held over a full paper, that pace leaves roughly a fifth of the questions unread.`
      : pace > budget
        ? `You averaged <b>${p}s</b> per attempted question — a little over the ${Math.round(budget)}s
           the paper allows. It is close, but over a full paper ${p - Math.round(budget)}s a question
           is about ${Math.round((p - budget) * 150 / 60)} minutes you do not have.`
        : `You averaged <b>${p}s</b> per attempted question, inside the ${Math.round(budget)}s budget.
           Pace is not your problem.`);
  }

  /* What the wrong answers cost in TIME, not just in marks. This is the line a
     learner cannot get from any other page here, and usually the expensive one:
     minutes sunk into questions that then scored −1/3. */
  if (detail && detail.time.total > 0 && res.wrong > 0) {
    const w = detail.time.onWrong;
    if (w > 0) {
      notes.push(`You spent <b>${mmss(w)}</b> on the ${res.wrong} question${res.wrong > 1 ? 's' : ''}
        you got wrong — ${Math.round(w / detail.time.total * 100)}% of your clock, for
        −${Math.round(res.wrong * PENALTY * 100) / 100} mark${res.wrong * PENALTY === 1 ? '' : 's'}.
        Time sunk into a question you then
        get wrong is the most expensive thing in an exam; the second-most is time sunk into one
        you then leave blank${detail.time.onBlank > 0 ? ` (another ${mmss(detail.time.onBlank)} here)` : ''}.`);
    }
    const slow = detail.time.slowest[0];
    if (slow && slow.seconds > SECONDS_PER_QUESTION * 2.5) {
      notes.push(`Your longest single question was <b>Q${slow.n}</b> at ${mmss(slow.seconds)} —
        ${Math.round(slow.seconds / SECONDS_PER_QUESTION)}× the budget, and you
        ${slow.ok ? 'did get it right, which still cost you the time of ' +
          Math.round(slow.seconds / SECONDS_PER_QUESTION - 1) + ' other questions'
         : slow.blank ? 'left it blank anyway' : 'got it wrong anyway'}.`);
    }
  }

  /* Whether a flag means "unsure" or "I know this and want to look again". */
  if (detail && detail.flagged.count >= 2) {
    const fl = detail.flagged;
    notes.push(fl.accuracy !== null && fl.restAccuracy !== null && fl.accuracy >= fl.restAccuracy
      ? `You flagged <b>${fl.count}</b> and scored ${fl.accuracy}% on them, against
         ${fl.restAccuracy}% on everything else. You are flagging questions you can already do —
         each one costs a second reading, and the flag is buying you nothing.`
      : `You flagged <b>${fl.count}</b> and scored ${fl.accuracy === null ? 'nothing, leaving them all blank'
         : `${fl.accuracy}% on them against ${fl.restAccuracy}% elsewhere`}. That is what a flag is
         for — it found the questions that were genuinely worth a second look.`);
  }

  const weak = Object.entries(res.byChapter)
    .filter(([k, b]) => k !== 'unattributed' && b.asked >= 2 && b.correct / b.asked < 0.5)
    .map(([k]) => unitFor(k)?.unit.title).filter(Boolean);
  if (weak.length) notes.push(`Weakest on this paper: <b>${weak.join(', ')}</b>.`);
  return notes;
}

/** Record the paper against the learner's history and the Leitner ladder. */
export function commit(paper, answers, res, secondsUsed, detail = null) {
  /* The ladder moves only now, at the end. Recording live would leak the marks
     into another tab's dashboard while the paper was still being sat. */
  paper.questions.forEach((q, i) => {
    const given = answers[i];
    if (given === null || given === undefined) return;      // unattempted is not evidence
    if (!q.concept) return;
    store.answered(q.concept, given === q.answer, q.conceptLabel || q.concept, q.chapter);
  });
  store.awardXP(res.correct * 4, 'mock');
  store.recordMock({
    score: res.score, max: res.max, attempted: res.attempted,
    correct: res.correct, wrong: res.wrong, seconds: Math.round(secondsUsed),
    byChapter: res.byChapter, seed: paper.seed, tier: paper.tier,
    /* Kept small on purpose — the per-question rows are not stored, only the
       four totals a trend could ever be drawn from. A record that grew with
       every paper would eventually outgrow localStorage. */
    time: detail ? { onCorrect: detail.time.onCorrect, onWrong: detail.time.onWrong,
                     onBlank: detail.time.onBlank } : null,
    flags: detail ? { count: detail.flagged.count, correct: detail.flagged.correct } : null,
  });
  if (res.max >= 10 && res.correct === res.max) store.flag('perfectSet');
  return refreshAchievements();
}

export const mmss = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, '0')}`;

/* ============================================================
   The paper, on screen.

   Its own renderer rather than the lesson runner's, for the reasons in the
   header: free navigation, a clock, and silence until submission are three
   things the runner is built not to do.
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* A paper in progress is kept in sessionStorage, keyed by its seed. Thirty
   minutes of work lost to a stray reload is the kind of thing that stops
   somebody using a study tool altogether — and since the paper is rebuilt from
   its seed, only the answers and the clock need saving. */
const RESUME_KEY = seed => `rqa.mock.v1:${seed}`;
const readResume = seed => { try { return JSON.parse(sessionStorage.getItem(RESUME_KEY(seed))); } catch { return null; } };
const writeResume = (seed, v) => { try { sessionStorage.setItem(RESUME_KEY(seed), JSON.stringify(v)); } catch { /* private mode */ } };
const clearResume = seed => { try { sessionStorage.removeItem(RESUME_KEY(seed)); } catch { /* private mode */ } };

export class MockPaper {
  constructor(paper, mount, { backHref = '../' } = {}) {
    this.paper = paper;
    this.root = mount;
    this.backHref = backHref;
    this.i = 0;
    this.answers = new Array(paper.questions.length).fill(null);
    this.flagged = new Set();
    this.left = paper.seconds;
    this.submitted = false;
    /* Seconds spent on each question, accumulated as the learner moves. Kept
       per question rather than as one total because the useful number is not
       "did you finish" — it is what the questions you got WRONG cost you, and
       that is invisible from a total. */
    this.spent = new Array(paper.questions.length).fill(0);
    this.since = null;

    const saved = readResume(paper.seed);
    if (saved && Array.isArray(saved.answers) && saved.answers.length === this.answers.length) {
      this.answers = saved.answers;
      this.flagged = new Set(saved.flagged || []);
      this.left = Math.max(0, Math.min(paper.seconds, saved.left ?? paper.seconds));
      if (Array.isArray(saved.spent) && saved.spent.length === this.spent.length) this.spent = saved.spent;
      this.resumed = true;
    }

    this.shell();
    this.tick = setInterval(() => this.onTick(), 1000);
    this.draw();
  }

  get q() { return this.paper.questions[this.i]; }
  get answered() { return this.answers.filter(a => a !== null).length; }

  /** Close the clock on whatever question was on screen. Idempotent. */
  bank() {
    if (this.since === null) return;
    this.spent[this.wasOn ?? this.i] += (Date.now() - this.since) / 1000;
    this.since = null;
  }

  shell() {
    this.root.innerHTML = `
      <div class="mock">
        <header class="mock__bar">
          <a class="lsn__x" href="${this.backHref}" aria-label="Leave the paper">✕</a>
          <div class="mock__meta">
            <span class="mock__count"><b id="mkDone">0</b> / ${this.paper.questions.length} answered</span>
          </div>
          <div class="mock__clock" id="mkClock" aria-live="off">--:--</div>
        </header>
        <main class="mock__body">
          <div class="mock__stage" id="mkStage"></div>
          <aside class="mock__side">
            <p class="eyebrow">Question palette</p>
            <div class="palette" id="mkPalette"></div>
            <ul class="palette__key">
              <li><i class="pk pk--done"></i>answered</li>
              <li><i class="pk pk--flag"></i>flagged</li>
              <li><i class="pk"></i>not seen</li>
            </ul>
            <button class="btn btn--lg mock__submit" id="mkSubmit">Submit the paper</button>
            <p class="muted mock__note">Wrong answers cost <b>1/3</b> of a mark.
              Unanswered costs nothing.</p>
          </aside>
        </main>
      </div>`;
    $('#mkSubmit', this.root).onclick = () => this.confirmSubmit();
  }

  onTick() {
    if (this.submitted) return;
    this.left--;
    this.paint();
    writeResume(this.paper.seed, { answers: this.answers, flagged: [...this.flagged],
                                   left: this.left, spent: this.spent.map(x => Math.round(x)) });
    if (this.left <= 0) this.submit(true);
  }

  paint() {
    const c = $('#mkClock', this.root);
    const d = $('#mkDone', this.root);
    if (!c || !d) return;
    c.textContent = mmss(this.left);
    /* Colour only in the last fifth, and only then. A clock that is red the
       whole way teaches nothing except anxiety. */
    c.className = `mock__clock ${this.left <= this.paper.seconds * 0.2 ? 'is-low' : ''}
                   ${this.left <= 60 ? 'is-out' : ''}`;
    d.textContent = this.answered;
  }

  drawPalette() {
    const p = $('#mkPalette', this.root);
    p.innerHTML = this.paper.questions.map((q, k) => {
      const cls = [
        k === this.i ? 'is-now' : '',
        this.answers[k] !== null ? 'pk--done' : '',
        this.flagged.has(k) ? 'pk--flag' : '',
        q.setId ? 'is-set' : '',
      ].join(' ');
      return `<button class="pbtn ${cls}" data-k="${k}"
                title="${q.setId ? 'part of a set' : ''}">${k + 1}</button>`;
    }).join('');
    [...p.children].forEach(b => {
      b.onclick = () => { clearTimeout(this.hop); this.i = +b.dataset.k; this.draw(); };
    });
  }

  draw() {
    /* A submitted paper has no stage left to draw into. That is reachable: the
       auto-advance below is on a short timer, so answering the last question
       and hitting Submit inside 140ms leaves a redraw queued against markup
       that no longer exists. Guarding here rather than only cancelling the
       timer covers every future caller too. */
    if (this.submitted) return;
    /* Bank the time on the question being left before moving to the next. */
    this.bank();
    this.i = Math.max(0, Math.min(this.i, this.paper.questions.length - 1));
    this.wasOn = this.i;
    this.since = Date.now();
    const q = this.q;
    const st = $('#mkStage', this.root);
    if (!st || !q) return;
    st.innerHTML = `
      <div class="mock__qhead">
        <span class="eyebrow">Question ${q.n} of ${this.paper.questions.length}</span>
        <button class="btn btn--quiet mock__flag ${this.flagged.has(this.i) ? 'is-on' : ''}"
                id="mkFlag">${this.flagged.has(this.i) ? '★ Flagged' : '☆ Flag for review'}</button>
      </div>
      <div class="qcard">
        ${q.context ? `<div class="qcontext">${q.context}</div>` : ''}
        <p class="qtext">${q.q}</p>
        <div class="opts" id="mkOpts">${q.options.map((o, k) =>
          `<button class="opt ${this.answers[this.i] === k ? 'is-picked' : ''}" data-k="${k}">${o}</button>`).join('')}</div>
      </div>
      <div class="mock__nav">
        <button class="btn btn--ghost" id="mkPrev" ${this.i === 0 ? 'disabled' : ''}>← Previous</button>
        <button class="btn btn--quiet" id="mkClear" ${this.answers[this.i] === null ? 'disabled' : ''}>Clear answer</button>
        <button class="btn" id="mkNext" ${this.i === this.paper.questions.length - 1 ? 'disabled' : ''}>Next →</button>
      </div>`;

    [...$('#mkOpts', st).children].forEach(b => {
      b.onclick = () => {
        /* Tapping the chosen option again clears it. On paper you can rub out,
           and with a penalty for a wrong answer that has to stay possible. */
        const k = +b.dataset.k;
        this.answers[this.i] = this.answers[this.i] === k ? null : k;
        this.draw();
        /* Move on by itself once an answer is in — but only after a beat, so the
           chosen option is visibly selected before the question changes. The
           handle is kept so submitting can cancel a hop that is still pending. */
        clearTimeout(this.hop);
        if (this.answers[this.i] !== null && this.i < this.paper.questions.length - 1) {
          this.hop = setTimeout(() => { this.i++; this.draw(); }, 140);
        }
      };
    });
    $('#mkFlag', st).onclick = () => {
      this.flagged.has(this.i) ? this.flagged.delete(this.i) : this.flagged.add(this.i);
      this.draw();
    };
    $('#mkPrev', st).onclick = () => { clearTimeout(this.hop); if (this.i > 0) { this.i--; this.draw(); } };
    $('#mkNext', st).onclick = () => {
      clearTimeout(this.hop);
      if (this.i < this.paper.questions.length - 1) { this.i++; this.draw(); }
    };
    $('#mkClear', st).onclick = () => { this.answers[this.i] = null; this.draw(); };

    this.drawPalette();
    this.paint();
  }

  confirmSubmit() {
    const left = this.paper.questions.length - this.answered;
    const msg = left
      ? `Submit with ${left} question${left > 1 ? 's' : ''} unanswered? They score zero — which is
         still better than a wrong guess, but only just.`
      : `Submit the paper?`;
    if (window.confirm(msg)) this.submit(false);
  }

  submit(ranOut) {
    if (this.submitted) return;
    this.bank();
    this.submitted = true;
    clearInterval(this.tick);
    clearTimeout(this.hop);
    clearResume(this.paper.seed);
    const used = this.paper.seconds - Math.max(0, this.left);
    const res = score(this.paper, this.answers);
    const detail = analyse(this.paper, this.answers, this.spent, [...this.flagged]);
    const earned = commit(this.paper, this.answers, res, used, detail);
    this.review(res, used, ranOut, earned, detail);
  }

  review(res, used, ranOut, earned, detail) {
    const rows = Object.entries(res.byChapter)
      .map(([k, b]) => ({ k, ...b, title: unitFor(k)?.unit.title || 'Unattributed',
                          pct: b.asked ? Math.round(b.correct / b.asked * 100) : 0 }))
      .sort((a, b) => a.pct - b.pct);

    this.root.innerHTML = `
      <div class="wrap mockdone">
        <div class="done__hero">${betaalSVG(res.pct >= 60 ? 'impressed' : 'warm', 96)}</div>
        <h1>${ranOut ? 'Time.' : 'Paper submitted.'}</h1>
        <p class="lede">${ranOut
          ? 'The clock ran out — which is itself a result, and the most useful one a mock gives.'
          : 'Scored the way the exam scores it: a third of a mark off for every wrong answer.'}</p>

        <div class="done__stats mockdone__stats">
          <div class="dstat"><b class="num">${res.score}</b><span>of ${res.max} marks</span></div>
          <div class="dstat"><b class="num">${res.correct}</b><span>correct</span></div>
          <div class="dstat"><b class="num">${res.wrong}</b><span>wrong · −${Math.round(res.wrong * PENALTY * 100) / 100}</span></div>
          <div class="dstat"><b class="num">${res.skipped}</b><span>left blank</span></div>
          <div class="dstat"><b class="num">${res.accuracy}%</b><span>of attempted</span></div>
          <div class="dstat"><b class="num">${mmss(used)}</b><span>time used</span></div>
        </div>

        <div class="card mockdone__verdict">
          <p class="eyebrow">What this paper says</p>
          ${verdictFor(res, used, this.paper, detail).map(v => `<p>${v}</p>`).join('')}
        </div>

        <h2 class="mockdone__h">By chapter</h2>
        <div class="chaprows">
          ${rows.map(r => `
            <div class="chaprow">
              <span class="chaprow__t">${esc(r.title)}</span>
              <span class="bar"><i style="width:${r.pct}%"></i></span>
              <span class="chaprow__n">${r.correct}/${r.asked}${r.skipped ? ` · ${r.skipped} blank` : ''}</span>
            </div>`).join('')}
        </div>

        ${earned && earned.length ? `<p class="muted" style="margin-top:var(--s4)">
          Achievement earned: ${earned.length} new.</p>` : ''}

        ${detail && detail.time.total > 0 ? `
        <h2 class="mockdone__h">Where the time went</h2>
        <div class="timesplit">
          ${[['on questions you got right', detail.time.onCorrect, 'good'],
             ['on questions you got wrong', detail.time.onWrong, 'bad'],
             ['on questions you left blank', detail.time.onBlank, 'gold']]
            .map(([label, secs, tone]) => `
              <div class="timesplit__row">
                <span class="timesplit__t">${label}</span>
                <span class="bar bar--${tone}"><i style="width:${Math.round(secs / detail.time.total * 100)}%"></i></span>
                <span class="chaprow__n">${mmss(secs)}</span>
              </div>`).join('')}
        </div>
        <p class="muted" style="font-size:13px;margin-top:var(--s3)">
          The middle bar is the expensive one: minutes spent and marks lost on the same questions.
          Under exam conditions that time also comes out of the questions you never reached.</p>` : ''}

        <h2 class="mockdone__h">Every question</h2>
        <p class="muted" style="margin-bottom:var(--s4)">Now the explanations — including, where the
          question knows it, what the option you actually chose represents.</p>
        <div class="qreview">
          ${this.paper.questions.map((q, k) => {
            const given = this.answers[k];
            const ok = given === q.answer;
            const state = given === null ? 'skip' : ok ? 'ok' : 'no';
            const picked = (!ok && given !== null && Array.isArray(q.whyOption)) ? q.whyOption[given] : null;
            return `
              <details class="qrev qrev--${state}" ${state === 'no' ? 'open' : ''}>
                <summary>
                  <span class="qrev__n">${k + 1}</span>
                  <span class="qrev__q">${q.q}</span>
                  <span class="qrev__t ${(detail?.per[k]?.seconds || 0) > SECONDS_PER_QUESTION * 1.5 ? 'is-slow' : ''}"
                        title="time spent on this question">${mmss(detail?.per[k]?.seconds || 0)}</span>
                  ${this.flagged.has(k) ? '<span class="qrev__f" title="you flagged this">★</span>' : ''}
                  <span class="qrev__v">${given === null ? 'blank' : ok ? 'correct' : 'wrong'}</span>
                </summary>
                <div class="qrev__body">
                  ${q.context ? `<div class="qcontext">${q.context}</div>` : ''}
                  <ol class="qrev__opts">${q.options.map((o, oi) => `
                    <li class="${oi === q.answer ? 'is-right' : ''} ${oi === given && !ok ? 'is-wrong' : ''}">
                      ${o}${oi === q.answer ? ' <em>— correct</em>' : ''}${oi === given && !ok ? ' <em>— your answer</em>' : ''}
                    </li>`).join('')}</ol>
                  ${picked ? `<p class="verdict__pick"><span>You chose ${q.options[given]}</span>${picked}</p>` : ''}
                  <div class="verdict__why">${ok ? (q.whyRight || q.why || '') : (q.whyWrong || q.why || '')}</div>
                  ${q.figure ? `<figure class="verdict__fig">${q.figure}
                    ${q.figureCap ? `<figcaption>${q.figureCap}</figcaption>` : ''}</figure>` : ''}
                </div>
              </details>`;
          }).join('')}
        </div>

        <div class="done__acts">
          <a class="btn btn--lg" href="${this.backHref}">Back to the dashboard</a>
          <a class="btn btn--ghost btn--lg" href="./?n=${this.paper.questions.length}">Sit another paper</a>
        </div>
      </div>`;
    window.scrollTo({ top: 0 });
  }
}

export function runMock(paper, selector = '#app', opts = {}) {
  document.documentElement.dataset.session = '1';   // see runLesson
  document.title = `Mock paper · ${paper.questions.length} questions`;
  return new MockPaper(paper, document.querySelector(selector), opts);
}
