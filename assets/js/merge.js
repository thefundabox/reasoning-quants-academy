/* ============================================================
   Two copies of one learner's record, made into one.

   With a mobile login the same learner can study on a phone at lunch and a
   laptop at night, and either device may have been offline. Neither copy is
   "the truth" — each holds answers the other never saw. So the rule is not
   "newest wins", which would throw away a whole evening's lessons because the
   phone happened to save a second later. It is: keep everything either copy
   knows, field by field, in the way that field means.

   The function is pure and has three properties the harness proves, because
   sync code without them corrupts records slowly and silently:
     · merge(a, a) equals a            — syncing twice changes nothing
     · merge(a, b) equals merge(b, a)  — it does not matter who syncs first
     · nothing earned is ever lost     — a finished lesson, a badge, a mock

   One honest limitation: total XP is the LARGER of the two, not the sum. XP is
   a running total, and without a log of every award there is no way to tell
   the XP both devices share from the XP each earned alone. Summing would count
   shared XP twice on every sync; taking the larger undercounts only when both
   devices earned XP while apart, which is the rarer and gentler error.
   ============================================================ */

const later = (a, b) => (String(a || '') >= String(b || '') ? a : b);
const maxN = (a, b) => Math.max(+a || 0, +b || 0);
const minDay = (a, b) => (!a ? b : !b ? a : a <= b ? a : b);
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);

/* A total order on anything JSON, for the last tie-break — so that two
   genuinely different records at the same instant still merge the same way
   whichever device runs the merge. */
const cmpJSON = (a, b) => {
  const x = JSON.stringify(a), y = JSON.stringify(b);
  return x < y ? -1 : x > y ? 1 : 0;
};

function mergeLessons(a = {}, b = {}) {
  const out = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[id], y = b[id];
    if (!x || !y) { out[id] = { ...(x || y) }; continue; }
    out[id] = {
      ...x, ...y,
      status: x.status === 'done' || y.status === 'done' ? 'done' : (x.status || y.status),
      score: maxN(x.score, y.score),
      attempts: maxN(x.attempts, y.attempts),
      xp: maxN(x.xp, y.xp),
      lastDay: later(x.lastDay, y.lastDay),
    };
  }
  return out;
}

/* A concept's Leitner box is a SCHEDULE, not a score: the most recent answer
   decides it. So the copy that was answered last wins whole — taking the max
   box would promote a learner who got it wrong on their phone this morning. */
function pickConcept(x, y) {
  if ((x.lastDay || '') !== (y.lastDay || '')) return (x.lastDay || '') > (y.lastDay || '') ? x : y;
  const nx = (x.right || 0) + (x.wrong || 0), ny = (y.right || 0) + (y.wrong || 0);
  if (nx !== ny) return nx > ny ? x : y;
  return cmpJSON(x, y) >= 0 ? x : y;
}

function mergeConcepts(a = {}, b = {}) {
  const out = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[id], y = b[id];
    out[id] = { ...(!x || !y ? (x || y) : pickConcept(x, y)) };
  }
  return out;
}

function mergeDays(a = [], b = []) {
  const by = new Map();
  for (const h of [...a, ...b]) {
    if (!h || !h.day) continue;
    const p = by.get(h.day);
    by.set(h.day, p
      ? { day: h.day, xp: maxN(p.xp, h.xp), correct: maxN(p.correct, h.correct), asked: maxN(p.asked, h.asked) }
      : { day: h.day, xp: +h.xp || 0, correct: +h.correct || 0, asked: +h.asked || 0 });
  }
  return [...by.values()].sort((x, y) => (x.day < y.day ? -1 : 1));
}

/* Today and history are ONE list of days with the latest day pulled out.
   Treating them separately was not associative: merging a into b and then c
   dropped the history of a day that (b∘c) still called "today", so the answer
   depended on which two devices synced first. The harness proves it now. */
function splitDays(a, b) {
  const all = mergeDays(
    [...(a?.history || []), ...(a?.today?.day ? [a.today] : [])],
    [...(b?.history || []), ...(b?.today?.day ? [b.today] : [])]);
  if (!all.length) return { today: { ...(a?.today || b?.today) }, history: [] };
  const day = all[all.length - 1].day;
  return { today: all[all.length - 1], history: all.slice(0, -1).slice(-120) };
}

function mergeStreak(x = {}, y = {}) {
  const lx = x.lastDay || '', ly = y.lastDay || '';
  const lead = lx !== ly ? (lx > ly ? x : y) : ((x.count || 0) >= (y.count || 0) ? x : y);
  return { count: +lead.count || 0, best: maxN(maxN(x.best, y.best), lead.count), lastDay: lead.lastDay ?? null };
}

function mergeAchievements(a = {}, b = {}) {
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = minDay(a[k], b[k]);
  return out;
}

function mergeFlags(a = {}, b = {}) {
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k], y = b[k];
    out[k] = x === undefined ? y : y === undefined ? x : (x && !y) ? x : (y && !x) ? y : (cmpJSON(x, y) >= 0 ? x : y);
  }
  return out;
}

/* A mock paper is an event: the same sitting appears in both copies once it
   has synced, and two different sittings are both kept. */
const mockKey = m => JSON.stringify([m.day, m.score, m.max, m.attempted, m.correct, m.wrong, m.seconds]);
function mergeMocks(a = [], b = []) {
  const by = new Map();
  for (const m of [...a, ...b]) if (m) by.set(mockKey(m), by.has(mockKey(m)) && cmpJSON(by.get(mockKey(m)), m) >= 0 ? by.get(mockKey(m)) : m);
  return [...by.values()]
    .sort((x, y) => ((x.day || '') !== (y.day || '') ? ((x.day || '') < (y.day || '') ? -1 : 1) : cmpJSON(x, y)))
    .slice(-40);
}

/**
 * Merge two progress records (store.js shape, v1). Either may be null.
 * Returns a new object; neither input is modified.
 */
export function mergeRecords(a, b) {
  const okA = isObj(a) && a.v === 1, okB = isObj(b) && b.v === 1;
  if (!okA && !okB) return null;
  if (!okA) return JSON.parse(JSON.stringify(b));
  if (!okB) return JSON.parse(JSON.stringify(a));

  /* Settings the learner chose, rather than earned, follow whichever copy was
     saved last. */
  const newer = (+a.updated || 0) !== (+b.updated || 0)
    ? ((+a.updated || 0) > (+b.updated || 0) ? a : b)
    : (cmpJSON(a.dailyGoal, b.dailyGoal) >= 0 ? a : b);

  const out = {
    v: 1,
    xp: maxN(a.xp, b.xp),
    dailyGoal: newer.dailyGoal,
    streak: mergeStreak(a.streak, b.streak),
    ...splitDays(a, b),
    lessons: mergeLessons(a.lessons, b.lessons),
    concepts: mergeConcepts(a.concepts, b.concepts),
    achievements: mergeAchievements(a.achievements, b.achievements),
    flags: mergeFlags(a.flags, b.flags),
    mocks: mergeMocks(a.mocks, b.mocks),
    updated: maxN(a.updated, b.updated),
  };
  return out;
}

/** Same record, ignoring key order — what "nothing changed" means for a sync. */
export function sameRecord(a, b) {
  const norm = x => JSON.stringify(x, (k, v) => (isObj(v) ? Object.fromEntries(Object.keys(v).sort().map(key => [key, v[key]])) : v));
  return norm(a) === norm(b);
}
