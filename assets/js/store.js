/* ============================================================
   Progress store — the spine of the dashboard.

   Combines three ideas from the reference products:
   · Duolingo — streak + daily XP goal (loss aversion, light touch)
   · Membean  — per-CONCEPT mastery on a Leitner ladder, so the
                review queue surfaces what you are about to forget
   · Brilliant — lesson completion feeds a visible path, not a grade

   Deliberately NOT gamified further: no hearts, no leagues. The
   research is clear that when the game outranks the learning,
   people optimise the game.
   ============================================================ */

import { CONFIG } from './config.js';

const KEY = 'rqa.progress.v1';
const PROFILES_KEY = 'rqa.profiles.v1';
const DAY = 864e5;


/* Leitner intervals in days: a concept answered right moves up a box.
   Configurable (config.js), and validated there for the two things that would
   silently ruin a schedule — they must ascend, and box 0 must be 0. */
const INTERVALS = CONFIG.progress.intervals;

const todayStr = (d = new Date()) => d.toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

const FRESH = () => ({
  v: 1,
  xp: 0,
  dailyGoal: CONFIG.progress.dailyGoal,
  streak: { count: 0, best: 0, lastDay: null },
  today: { day: todayStr(), xp: 0, correct: 0, asked: 0 },
  lessons: {},   // id -> { status, score, attempts, xp, lastDay }
  concepts: {},  // id -> { label, box, right, wrong, dueDay, lastDay }
  history: [],   // [{ day, xp, correct, asked }]
  achievements: {},  // id -> the day it was earned
  flags: {},         // one-off facts a badge needs, e.g. a perfect practice set
  mocks: [],         // [{ day, score, max, attempted, correct, wrong, seconds, byChapter }]
});

/* ============================================================
   Learner profiles.

   Several people share one machine — a sibling, a study partner, a
   tutor demonstrating on their own laptop — and one shared streak is
   worse than useless, because a Leitner schedule built from two
   people's answers describes neither of them.

   These are PROFILES, not accounts. There is no password and no
   server: everything lives in this browser, and anyone sitting at it
   can pick any profile. Calling it authentication would be a lie —
   a check performed on the same machine that holds the data protects
   nothing. What it does buy is a separate, honest record per learner.

   Storage layout:
     rqa.profiles.v1              { active, list: [{ id, name, made }] }
     rqa.progress.v1              the original single record (legacy)
     rqa.progress.v1:<id>         one record per profile after that
   ============================================================ */

const uid = () => 'p' + Math.random().toString(36).slice(2, 9);
const readJSON = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

/**
 * The profile registry, created on first use.
 *
 * A learner who used the site before profiles existed has a record under the
 * bare key. That record IS their progress, so it becomes the first profile
 * rather than being stranded — the migration reads it, writes it under the new
 * key, and leaves the original in place as a fallback for an older tab.
 */
function readProfiles() {
  const reg = readJSON(PROFILES_KEY);
  if (reg && Array.isArray(reg.list) && reg.list.length) return reg;

  const id = uid();
  const legacy = readJSON(KEY);
  const inherited = !!(legacy && legacy.v === 1);
  /* `legacyOwner` names the ONE profile the old record belongs to. Without it the
     fallback in load() would hand that record to every profile that has yet to
     save anything — so the second learner would open on the first one's XP. */
  const fresh = { active: id, legacyOwner: inherited ? id : null,
                  list: [{ id, name: 'Learner 1', made: todayStr() }] };
  if (inherited) writeJSON(`${KEY}:${id}`, legacy);
  writeJSON(PROFILES_KEY, fresh);
  return fresh;
}

let registry = (typeof localStorage !== 'undefined') ? readProfiles()
  : { active: 'p0', list: [{ id: 'p0', name: 'Learner 1', made: null }] };

const keyFor = id => `${KEY}:${id}`;

export const profiles = () => registry.list.map(p => ({ ...p }));
export const activeProfileId = () => registry.active;
export const activeProfile = () =>
  registry.list.find(p => p.id === registry.active) || registry.list[0];

/** Add a learner and switch to them. Returns the new profile. */
export function addProfile(name) {
  const p = { id: uid(), name: cleanName(name, registry.list.length + 1), made: todayStr() };
  registry = { active: p.id, list: [...registry.list, p] };
  writeJSON(PROFILES_KEY, registry);
  state = load();
  save();
  return p;
}

export function switchProfile(id) {
  if (!registry.list.some(p => p.id === id) || id === registry.active) return false;
  registry = { ...registry, active: id };
  writeJSON(PROFILES_KEY, registry);
  state = load();
  return true;
}

export function renameProfile(id, name) {
  registry = { ...registry,
    list: registry.list.map(p => (p.id === id ? { ...p, name: cleanName(name, 1) } : p)) };
  writeJSON(PROFILES_KEY, registry);
}

/**
 * Remove a learner and everything they earned. The last profile cannot go —
 * there has to be somebody to be, and "delete the only learner" is indistinguishable
 * from "reset my progress", which already has its own button.
 */
export function deleteProfile(id) {
  if (registry.list.length < 2 || !registry.list.some(p => p.id === id)) return false;
  const list = registry.list.filter(p => p.id !== id);
  const active = registry.active === id ? list[0].id : registry.active;
  /* If the learner holding the old record goes, the record goes with them —
     otherwise it would resurface under whoever the fallback pointed at next. */
  const heldLegacy = registry.legacyOwner === id;
  registry = { active, list, legacyOwner: heldLegacy ? null : registry.legacyOwner };
  if (heldLegacy) { try { localStorage.removeItem(KEY); } catch { /* private mode */ } }
  writeJSON(PROFILES_KEY, registry);
  try { localStorage.removeItem(keyFor(id)); } catch { /* private mode */ }
  state = load();
  return true;
}

const cleanName = (raw, n) => (String(raw || '').trim().slice(0, 24) || `Learner ${n}`);

let state = load();

function load() {
  try {
    /* The active profile's own record. The pre-profile record is a fallback for
       exactly one profile — the one the migration adopted it into — so that a
       learner whose migration could not write (private mode) still opens on
       their real progress, while every other profile starts empty. */
    const own = localStorage.getItem(keyFor(registry.active));
    const raw = own ?? (registry.legacyOwner === registry.active ? localStorage.getItem(KEY) : null);
    if (!raw) return FRESH();
    const s = JSON.parse(raw);
    return s && s.v === 1 ? s : FRESH();
  } catch {
    return FRESH();   // private mode / storage disabled — run in memory
  }
}

/* The store is imported by the harness under Node, where neither localStorage nor
   window exists. Guarding here keeps it testable without changing a thing in the
   browser — and an in-memory store is exactly the right fallback for both cases. */
const hasWindow = typeof window !== 'undefined';

function save() {
  /* When this copy was last written. Only the cloud merge reads it, to decide
     settings the learner CHOSE (not earned) — see merge.js. */
  state.updated = Date.now();
  try { localStorage.setItem(keyFor(registry.active), JSON.stringify(state)); }
  catch { /* private mode, or Node */ }
  if (hasWindow) window.dispatchEvent(new CustomEvent('rqa:progress', { detail: state }));
}

/* Roll the day over: bank yesterday, decide whether the streak survives. */
function rollDay() {
  const t = todayStr();
  if (state.today.day === t) return;
  if (state.today.asked || state.today.xp) state.history.push({ ...state.today });
  state.history = state.history.slice(-120);
  state.today = { day: t, xp: 0, correct: 0, asked: 0 };
  save();
}

/* ---------- reads ---------- */
export const get = () => (rollDay(), state);

export function streakInfo() {
  rollDay();
  const { count, best, lastDay } = state.streak;
  const gap = lastDay ? daysBetween(lastDay, todayStr()) : null;
  return {
    count: gap === null || gap > 1 ? (gap === 0 ? count : 0) : count,
    best,
    activeToday: lastDay === todayStr(),
    atRisk: gap === 1 && count > 0,      // studied yesterday, not yet today
  };
}

export function dailyProgress() {
  rollDay();
  return { xp: state.today.xp, goal: state.dailyGoal,
           pct: Math.min(100, Math.round(state.today.xp / state.dailyGoal * 100)) };
}

export const lesson = id => state.lessons[id] || null;
export const isDone = id => state.lessons[id]?.status === 'done';

/** Percent of a given list of lesson ids that are complete. */
export function pathProgress(ids) {
  if (!ids.length) return { done: 0, total: 0, pct: 0 };
  const done = ids.filter(isDone).length;
  return { done, total: ids.length, pct: Math.round(done / ids.length * 100) };
}

/** Concepts whose review date has arrived — Membean's "just before you forget". */
export function dueForReview() {
  rollDay();
  const t = todayStr();
  return Object.entries(state.concepts)
    .filter(([, c]) => c.dueDay && c.dueDay <= t && c.box < INTERVALS.length - 1)
    .map(([id, c]) => ({ id, ...c }))
    .sort((a, b) => (a.box - b.box) || a.dueDay.localeCompare(b.dueDay));
}

/** Weakest concepts by accuracy — drives the "shore this up" dashboard card. */
export function weakest(n = 4) {
  return Object.entries(state.concepts)
    .map(([id, c]) => ({ id, ...c, acc: c.right + c.wrong ? c.right / (c.right + c.wrong) : 1 }))
    .filter(c => c.right + c.wrong >= 2 && c.acc < 0.8)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, n);
}

/**
 * Concepts the learner is not merely rusty on but is actually getting WRONG —
 * the ones that need re-teaching rather than another turn of the queue.
 *
 * A stricter bar than `weakest`, and deliberately so. Weakness is a reason to
 * practise more; this is a reason to go back to the lesson, which costs the
 * learner ten minutes, so the evidence has to be real:
 *   · at least two wrong answers — one is variance, not a misconception;
 *   · a losing record — under half right, so it is not simply a hard idea
 *     they mostly have.
 * Worst first, and a concept won back since falls out of the list on its own,
 * because both tests read the running totals rather than a stored flag.
 */
export function failing(n = 3) {
  return Object.entries(state.concepts)
    .map(([id, c]) => ({ id, ...c, asked: c.right + c.wrong,
                         acc: c.right + c.wrong ? c.right / (c.right + c.wrong) : 1 }))
    .filter(c => c.wrong >= 2 && c.acc < 0.5)
    .sort((a, b) => (a.acc - b.acc) || (b.wrong - a.wrong))
    .slice(0, n);
}

/** Always returns `days` slots, back-filling untouched days so the chart keeps its shape. */
export function accuracyTrend(days = 7) {
  rollDay();
  const byDay = new Map([...state.history, state.today].map(r => [r.day, r]));
  const out = [];
  for (let k = days - 1; k >= 0; k--) {
    const day = todayStr(new Date(Date.now() - k * DAY));
    const r = byDay.get(day);
    out.push({ day, asked: r?.asked || 0,
               pct: r?.asked ? Math.round(r.correct / r.asked * 100) : null });
  }
  return out;
}

/* ---------- writes ---------- */

/** Record one answered question against a concept; drives mastery + review. */
export function answered(conceptId, wasRight, label = conceptId, chapter = null) {
  rollDay();
  const t = todayStr();
  const c = state.concepts[conceptId] || { label, box: 0, right: 0, wrong: 0, dueDay: t, lastDay: t };
  c.label = label;
  /* Which chapter this idea was last practised under. The store holds no
     syllabus, so it cannot work this out for itself — the caller supplies it,
     and a caller that does not simply leaves the concept unattributed. It
     lets the dashboard name a weak CHAPTER rather than only a weak idea. */
  if (chapter) c.chapter = chapter;
  if (wasRight) { c.right++; c.box = Math.min(c.box + 1, INTERVALS.length - 1); }
  else          { c.wrong++; c.box = Math.max(0, c.box - 1); }
  c.lastDay = t;
  c.dueDay = todayStr(new Date(Date.now() + INTERVALS[c.box] * DAY));
  state.concepts[conceptId] = c;

  state.today.asked++;
  if (wasRight) state.today.correct++;
  save();
  return c;
}

/** XP is capped per day-lesson so grinding one lesson can't farm the dashboard. */
export function awardXP(amount, reason = '') {
  rollDay();
  const n = Math.max(0, Math.round(amount));
  state.xp += n;
  state.today.xp += n;
  touchStreak();
  save();
  return { gained: n, total: state.xp, reason };
}

function touchStreak() {
  const t = todayStr();
  const s = state.streak;
  if (s.lastDay === t) return;
  const gap = s.lastDay ? daysBetween(s.lastDay, t) : null;
  s.count = gap === 1 ? s.count + 1 : 1;
  s.best = Math.max(s.best, s.count);
  s.lastDay = t;
}

/** Mark a lesson complete. Re-completing keeps the best score, awards less XP. */
export function completeLesson(id, score, baseXP = CONFIG.progress.lessonXP) {
  rollDay();
  const prev = state.lessons[id];
  const first = !prev || prev.status !== 'done';
  const rec = {
    status: 'done',
    score: Math.max(score ?? 0, prev?.score ?? 0),
    attempts: (prev?.attempts || 0) + 1,
    xp: (prev?.xp || 0),
    lastDay: todayStr(),
  };
  const gain = first ? baseXP : Math.round(baseXP * CONFIG.progress.repeatShare);   // repeat practice yields less
  rec.xp += gain;
  state.lessons[id] = rec;
  awardXP(gain, first ? 'lesson' : 'review');
  return { first, gain, record: rec };
}

/* ---------------- achievements ----------------
   The badge rules live in achievements.js and are pure. The store owns only
   the record of what has been earned, and re-evaluates after anything that
   changes progress. Records written before achievements existed simply have
   no `achievements` key, and default to an empty one — an old learner
   collects their earned badges on the next thing they do. */

/** Mark a one-off fact a badge depends on (a perfect set, say). */
export function flag(name, value = true) {
  state.flags = { ...(state.flags || {}), [name]: value };
  save();
}

/**
 * Re-evaluate every badge; returns the ones newly earned so the caller can
 * announce them. The rules are injected rather than imported, so store.js
 * keeps no dependency on the curriculum and stays loadable on its own.
 */
export function earnAchievements(evaluate, ctx) {
  state.achievements = state.achievements || {};
  const fresh = evaluate(state, ctx);
  if (!fresh.length) return [];
  const day = todayStr();
  fresh.forEach(id => { state.achievements[id] = day; });
  save();
  return fresh;
}

export const achievements = () => ({ ...(state.achievements || {}) });

/* ---------------- mock papers ----------------
   A mock is the only thing here that is scored the way the exam scores: on a
   clock and with a penalty for a wrong answer. It is kept as its own history
   rather than folded into `today`, because the number a learner needs from it
   is the TREND across papers — one mock says almost nothing.

   Records written before mocks existed have no `mocks` key, so every read
   defaults it. Nothing migrates; an old learner simply has no papers yet. */
export function recordMock(result) {
  rollDay();
  state.mocks = [...(state.mocks || []), { day: todayStr(), ...result }].slice(-40);
  save();
  return state.mocks.length;
}

export const mocks = () => [...(state.mocks || [])];
export const lastMock = () => (state.mocks || [])[state.mocks?.length - 1] || null;

/** Best percentage across every paper sat — the only mock number worth a headline. */
export function bestMock() {
  const all = state.mocks || [];
  if (!all.length) return null;
  return all.reduce((b, m) => (m.score / m.max > b.score / b.max ? m : b), all[0]);
}

export function setDailyGoal(xp) { state.dailyGoal = Math.max(10, Math.round(xp)); save(); }

/* ============================================================
   Accounts — a profile signed in with a mobile number.

   A profile may carry `account: { uid, phone }`. That makes it the local copy
   of a record kept in the cloud (see cloud.js); everything above still reads
   and writes only this copy, so the site works identically offline and the
   store never waits on a network.
   ============================================================ */

/** The local profile holding this account's copy, if this device has one. */
export const accountProfile = uid =>
  registry.list.find(p => p.account && p.account.uid === uid) || null;

/** Mark a profile as this account's copy. */
export function linkProfile(id, account) {
  if (!registry.list.some(p => p.id === id) || !account || !account.uid) return false;
  registry = { ...registry, list: registry.list.map(p => {
    if (p.id === id) return { ...p, account: { uid: String(account.uid), phone: String(account.phone || '') } };
    /* One device copy per account — a second would drift from the first. */
    if (p.account && p.account.uid === account.uid) { const { account: _, ...rest } = p; return rest; }
    return p;
  }) };
  writeJSON(PROFILES_KEY, registry);
  return true;
}

/** A new profile for an account signing in on this device for the first time. */
export function addAccountProfile(name, account) {
  const p = addProfile(name);
  linkProfile(p.id, account);
  return activeProfile();
}

/**
 * Replace the ACTIVE record wholesale — used only to install a merged copy.
 * Anything that is not a v1 record is refused, so a bad download cannot blank
 * a learner's progress.
 */
export function adopt(record) {
  if (!record || typeof record !== 'object' || record.v !== 1) return false;
  state = record;
  save();
  return true;
}

/**
 * Signing out on a shared device should not leave that learner's record behind
 * for the next person — it is safe in the cloud. The profile goes; if it is the
 * only one, it is emptied and unlinked instead, since one profile must remain.
 */
export function forgetAccount(uid) {
  const p = accountProfile(uid);
  if (!p) return false;
  if (registry.list.length > 1) return deleteProfile(p.id);
  registry = { ...registry, list: registry.list.map(x => {
    if (x.id !== p.id) return x;
    const { account: _, ...rest } = x;
    return { ...rest, name: 'Learner 1' };
  }) };
  writeJSON(PROFILES_KEY, registry);
  state = FRESH();
  save();
  return true;
}

/** Clears the ACTIVE profile only — the others are somebody else's work. */
export function reset() { state = FRESH(); save(); }

/* Cross-tab sync so the dashboard never shows stale numbers. Two tabs may sit on
   different profiles, so only this profile's key is worth reacting to; a change
   to the registry means another tab switched learner, and this one re-reads. */
if (hasWindow) {
  /* Only when a cloud is configured, and never under Node. The import is lazy
     so a site without one downloads none of it. */
  if (CONFIG.cloud.enabled) import('./cloud.js').then(m => m.start()).catch(() => { /* offline: stay local */ });

  window.addEventListener('storage', e => {
    if (e.key === PROFILES_KEY) registry = readProfiles();
    else if (e.key !== keyFor(registry.active)) return;
    state = load();
    window.dispatchEvent(new CustomEvent('rqa:progress', { detail: state }));
  });
}
