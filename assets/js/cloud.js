/* ============================================================
   Mobile-number sign-in, and progress that follows the learner.

   Without this, a record lives in one browser: clear it, change phones, or
   study on a second device, and the record is gone or split in two. With it,
   a learner signs in with their mobile number and a one-time SMS code, and
   the same record appears wherever they sign in.

   THE SHAPE OF IT
   · The browser copy stays the working copy. store.js reads and writes only
     localStorage, exactly as before, so nothing waits on a network and the
     site keeps working offline. This module keeps that copy and the cloud
     copy in step.
   · Every sync is a MERGE, never an overwrite (merge.js). Pushes happen inside
     a transaction that reads the cloud copy, merges into it, and writes the
     result — so two devices saving at once both keep their answers.
   · Firebase is loaded from Google's CDN only when `cloud` is configured, so
     a site without it downloads none of it and still needs no build step.

   WHAT PROTECTS A RECORD is firestore.rules, not this file: a signed-in
   number may read and write learners/<its own uid> and nothing else. Anything
   enforced here, in the browser, could be edited out by the person using it.

   The sync engine (`createSync`) takes its backend as an argument, so the
   harness drives it against an in-memory fake with no network at all.
   ============================================================ */

import { CONFIG } from './config.js';
import * as store from './store.js';
import { mergeRecords, sameRecord } from './merge.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';

/* ---------------- the sync engine ---------------- */

const parse = s => { try { return typeof s === 'string' ? JSON.parse(s) : (s || null); } catch { return null; } };

/**
 * @param backend  { load(uid) → doc|null, update(uid, fn(doc|null) → doc|null) → doc|null }
 *                 where doc = { v, phone, name, progress: JSON string }
 * @param st       the store module (injectable for the harness)
 */
export function createSync({ backend, st = store, debounceMs = 1200, onStatus = () => {} }) {
  let user = null, timer = null, busy = null, quiet = false, dirty = false;

  const linked = () => !!user && st.activeProfile().account?.uid === user.uid;

  /* Install a merged copy locally without it counting as a new change —
     otherwise every pull would schedule a push of what it just pulled. */
  const install = rec => {
    if (!rec || sameRecord(rec, st.get())) return false;
    quiet = true;
    try { st.adopt(rec); } finally { quiet = false; }
    return true;
  };

  /** Merge local into the cloud copy, atomically. Returns whether the local copy changed. */
  async function sync() {
    if (!linked()) return false;
    const uid = user.uid;
    const local = JSON.parse(JSON.stringify(st.get()));
    const prof = st.activeProfile();
    let merged = local;
    onStatus('syncing');
    await backend.update(uid, remote => {
      merged = mergeRecords(local, parse(remote && remote.progress)) || local;
      const next = { v: 1, phone: prof.account.phone || user.phoneNumber || '', name: prof.name,
                     progress: JSON.stringify(merged) };
      /* Nothing new on either side: skip the write. */
      if (remote && remote.name === next.name && remote.phone === next.phone
          && sameRecord(parse(remote.progress), merged)) return null;
      return next;
    });
    /* The record may have changed between reading local and the transaction
       finishing. Merge rather than install, so nothing answered in that gap
       is lost. */
    const changed = install(mergeRecords(st.get(), merged));
    onStatus('synced');
    return changed;
  }

  /* One sync at a time; a change arriving mid-sync runs one more after it. */
  function run() {
    if (busy) { dirty = true; return busy; }
    busy = sync()
      .catch(e => {
        const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
        onStatus(offline ? 'offline' : 'error', e);
        return false;
      })
      .finally(() => {
        busy = null;
        if (dirty) { dirty = false; run(); }
      });
    return busy;
  }

  function onChange() {
    if (quiet || !linked()) return;
    clearTimeout(timer);
    timer = setTimeout(run, debounceMs);
  }

  return {
    /** Start syncing for this signed-in user (or stop, with null). */
    attach(u) { user = u; return linked() ? run() : Promise.resolve(false); },
    changed: onChange,
    flush() { clearTimeout(timer); return linked() ? run() : Promise.resolve(false); },
    get linked() { return linked(); },
  };
}

/* ---------------- Firebase ---------------- */

let fb = null;
async function firebase() {
  if (fb) return fb;
  if (!CONFIG.cloud.enabled) throw new Error('cloud sign-in is not configured');
  const [app, auth, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`),
  ]);
  const a = app.initializeApp(CONFIG.cloud.firebase);
  const au = auth.getAuth(a);
  au.useDeviceLanguage();
  const db = fs.getFirestore(a);
  const ref = uid => fs.doc(db, 'learners', uid);
  fb = {
    auth: au, sdk: auth,
    backend: {
      async load(uid) { const s = await fs.getDoc(ref(uid)); return s.exists() ? s.data() : null; },
      async update(uid, fn) {
        return fs.runTransaction(db, async tx => {
          const s = await tx.get(ref(uid));
          const next = fn(s.exists() ? s.data() : null);
          if (next) tx.set(ref(uid), { ...next, updatedAt: fs.serverTimestamp() });
          return next;
        });
      },
    },
  };
  return fb;
}

/* ---------------- status, for the learner chip ---------------- */

let status = CONFIG.cloud.enabled ? 'signed-out' : 'off';
const setStatus = s => {
  status = s;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('rqa:cloud', { detail: s }));
};
export const cloudStatus = () => status;

/** "+919876543210" → "+91•••••3210" — enough to recognise, not to read off a screen. */
export function maskPhone(p) {
  const s = String(p || '');
  if (s.length <= 4) return s;
  const cc = (s.match(/^\+\d{1,2}(?=\d{10}$)/) || [''])[0];
  return cc + '•'.repeat(s.length - cc.length - 4) + s.slice(-4);
}

/* ---------------- page lifecycle ---------------- */

let engine = null, started = null;

/**
 * Called once per page by store.js. Restores a signed-in session, pulls the
 * cloud copy, and keeps pushing changes for as long as the page is open.
 */
export function start() {
  if (started) return started;
  started = (async () => {
    const { auth, sdk, backend } = await firebase();
    engine = engine || createSync({ backend, onStatus: setStatus });
    window.addEventListener('rqa:progress', () => engine.changed());
    /* A lesson finished just before the tab closes should not wait for the
       debounce — it may never get one. */
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') engine.flush(); });
    window.addEventListener('online', () => engine.flush());

    await new Promise(resolve => {
      sdk.onAuthStateChanged(auth, async u => {
        if (!u) { engine.attach(null); setStatus('signed-out'); return resolve(); }
        /* Signed in on this device before, but its local copy is gone —
           cleared site data, say. The account's record comes back into a
           profile of its own; nobody else's progress is touched. */
        let p = store.accountProfile(u.uid);
        if (!p) {
          p = store.addAccountProfile('Me', { uid: u.uid, phone: u.phoneNumber });
          const remote = await backend.load(u.uid).catch(() => null);
          if (remote?.name) store.renameProfile(p.id, remote.name);
        }
        if (store.activeProfile().id !== p.id) { setStatus('paused'); engine.attach(u); return resolve(); }
        const changed = await engine.attach(u);
        if (changed) refreshPage();
        resolve();
      });
    });
    return engine;
  })().catch(e => { setStatus('error', e); throw e; });
  return started;
}

/* A dashboard drawn before another device's progress arrived is showing old
   numbers. Redraw by reloading — but never in the middle of a lesson or a
   timed paper, and never twice in quick succession. */
function refreshPage() {
  if (document.documentElement.dataset.session) return;
  const k = 'rqa.cloud.refreshed';
  try {
    if (Date.now() - (+sessionStorage.getItem(k) || 0) < 15000) return;
    sessionStorage.setItem(k, String(Date.now()));
  } catch { return; }
  location.reload();
}

/* ---------------- sign-in, for login/ ---------------- */

/** The raw input into E.164, or null. A bare local number gets the configured country code. */
export function normalisePhone(raw, countryCode = CONFIG.cloud.countryCode) {
  const s = String(raw || '').replace(/[\s().-]/g, '');
  if (/^\+\d{8,15}$/.test(s)) return s;
  const digits = s.replace(/^0+/, '');
  if (/^\d{6,12}$/.test(digits)) return countryCode + digits;
  return null;
}

let verifier = null;

/** Send the SMS. `button` is the element the invisible reCAPTCHA binds to. */
export async function sendCode(phone, button) {
  const { auth, sdk } = await firebase();
  if (verifier) { try { verifier.clear(); } catch { /* already gone */ } }
  verifier = new sdk.RecaptchaVerifier(auth, button, { size: 'invisible' });
  return sdk.signInWithPhoneNumber(auth, phone, verifier);
}

/**
 * Finish signing in, and decide whose progress this device contributes.
 *
 * `bringLocal` folds the profile in use into the account — right for a
 * learner who has been studying signed-out on their own device, wrong on a
 * shared one, which is why the page asks rather than assumes.
 */
export async function verifyCode(confirmation, code, { bringLocal = false } = {}) {
  const cred = await confirmation.confirm(String(code).trim());
  const u = cred.user;
  const { backend } = await firebase();
  const account = { uid: u.uid, phone: u.phoneNumber };
  const remote = await backend.load(u.uid).catch(() => null);

  const existing = store.accountProfile(u.uid);
  if (existing) store.switchProfile(existing.id);
  else if (bringLocal && !store.activeProfile().account) store.linkProfile(store.activeProfile().id, account);
  else store.addAccountProfile(remote?.name || 'Me', account);

  engine = engine || createSync({ backend, onStatus: setStatus });
  await engine.attach(u);
  return { user: u, isNew: !remote };
}

/** Rename the signed-in learner, here and in the cloud. */
export async function rename(name) {
  store.renameProfile(store.activeProfile().id, name);
  if (engine) await engine.flush();
}

/** Sign out, and take this account's copy off the device. */
export async function signOutHere() {
  const { auth, sdk } = await firebase();
  const u = auth.currentUser;
  if (engine && u) { try { await engine.flush(); } catch { /* it is saved locally up to now */ } }
  await sdk.signOut(auth);
  if (u) store.forgetAccount(u.uid);
  setStatus('signed-out');
}

export async function currentUser() {
  const { auth } = await firebase();
  await auth.authStateReady();
  return auth.currentUser;
}

/** Firebase error codes, in words a learner can act on. */
export function explain(e) {
  const code = String(e?.code || e?.message || '');
  const M = {
    'auth/invalid-phone-number': 'That does not look like a mobile number. Check the digits and the country code.',
    'auth/missing-phone-number': 'Enter your mobile number first.',
    'auth/too-many-requests': 'Too many attempts from this device. Wait a while and try again.',
    'auth/quota-exceeded': 'The site has reached its SMS limit for today. Try again tomorrow.',
    'auth/invalid-verification-code': 'That code is not right. Check the SMS and type all six digits.',
    'auth/code-expired': 'That code has expired. Send a new one.',
    'auth/captcha-check-failed': 'The robot check failed. Reload the page and try again.',
    'auth/invalid-app-credential': 'The robot check could not be verified. Reload the page and try again.',
    'auth/network-request-failed': 'No connection. Check your internet and try again.',
    'auth/operation-not-allowed': 'Mobile sign-in is not switched on for this site yet. (Site owner: enable the Phone provider in Firebase.)',
    'auth/billing-not-enabled': 'SMS sign-in needs billing enabled on the Firebase project. (Site owner: see README, Mobile login.)',
    'auth/unauthorized-domain': 'This web address is not allowed to sign in yet. (Site owner: add it to Firebase authorised domains.)',
  };
  for (const k of Object.keys(M)) if (code.includes(k)) return M[k];
  return 'Something went wrong signing in. Try again in a moment.';
}
