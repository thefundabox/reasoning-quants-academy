/* ============================================================
   CLOUD — mobile sign-in and cross-device progress.
   Run by verify-generators.js; kept in its own file for size.

   Sync code that is merely "mostly right" loses a learner's work slowly and
   invisibly: a lesson done on the phone vanishes after the laptop syncs, and
   nobody can say when. So the merge is held to algebra (idempotent,
   commutative, associative, nothing earned lost) over thousands of random
   record pairs, and the engine is run as two devices against one fake cloud.
   ============================================================ */
const fs = require('fs'), path = require('path');

module.exports = async function cloudSuite(check) {
  const { mergeRecords, sameRecord } = await import('../assets/js/merge.js');
  const cloud = await import('../assets/js/cloud.js');
  const store = await import('../assets/js/store.js');
  const cfg = await import('../assets/js/config.js');
  const ROOT = path.join(__dirname, '..');

  let seed = 20260917;
  const R = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* ---- random records ---- */
  const days = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'];
  const pick = a => a[Math.floor(R() * a.length)];
  const n = k => Math.floor(R() * k);
  function record() {
    const r = { v: 1, xp: n(500), dailyGoal: pick([30, 40, 60]), updated: n(5) * 1000,
      streak: { count: n(6), best: 0, lastDay: pick([null, ...days]) },
      today: { day: pick(days), xp: n(40), correct: n(9), asked: 9 },
      lessons: {}, concepts: {}, history: [], achievements: {}, flags: {}, mocks: [] };
    r.streak.best = r.streak.count + n(3);
    for (const id of ['r.a', 'r.b', 'q.c', 'q.d']) if (R() < 0.5)
      r.lessons[id] = { status: pick(['done', 'started']), score: +(R()).toFixed(2), attempts: 1 + n(3), xp: n(60), lastDay: pick(days) };
    for (const id of ['c1', 'c2', 'c3', 'c4', 'c5']) if (R() < 0.6)
      r.concepts[id] = { label: id, box: n(6), right: n(5), wrong: n(4), dueDay: pick(days), lastDay: pick(days) };
    for (const d of days) if (R() < 0.4 && d !== r.today.day) r.history.push({ day: d, xp: n(50), correct: n(8), asked: 8 });
    for (const b of ['first', 'streak3', 'mock1']) if (R() < 0.4) r.achievements[b] = pick(days);
    if (R() < 0.3) r.flags.perfectSet = true;
    for (let k = n(3); k > 0; k--) r.mocks.push({ day: pick(days), score: n(25), max: 25, attempted: 20, correct: n(20), wrong: n(5), seconds: 600 + n(900) });
    return r;
  }

  let idem = 0, comm = 0, lost = 0, assoc = 0;
  const TRIALS = 3000;
  for (let t = 0; t < TRIALS; t++) {
    const a = record(), b = record(), c = record();
    const m = mergeRecords(a, b);
    if (!sameRecord(mergeRecords(m, m), m)) idem++;
    if (!sameRecord(m, mergeRecords(b, a))) comm++;
    if (!sameRecord(mergeRecords(mergeRecords(a, b), c), mergeRecords(a, mergeRecords(b, c)))) assoc++;
    for (const src of [a, b]) {
      for (const [id, l] of Object.entries(src.lessons))
        if (!m.lessons[id] || (l.status === 'done' && m.lessons[id].status !== 'done') || m.lessons[id].score < l.score) lost++;
      for (const k of Object.keys(src.achievements)) if (!m.achievements[k] || m.achievements[k] > src.achievements[k]) lost++;
      for (const id of Object.keys(src.concepts)) if (!m.concepts[id]) lost++;
      if (m.xp < src.xp || m.streak.best < src.streak.best) lost++;
      for (const mk of src.mocks) if (!m.mocks.some(x => sameRecord(x, mk))) lost++;
    }
  }
  check('cloud: merging a record with itself changes nothing', idem === 0, `${idem} of ${TRIALS}`);
  check('cloud: it does not matter which device syncs first', comm === 0, `${comm} of ${TRIALS}`);
  check('cloud: syncing three devices in any grouping agrees', assoc === 0, `${assoc} of ${TRIALS}`);
  check('cloud: nothing earned on either device is lost', lost === 0, `${lost} losses`);

  /* The box is a schedule: the LATER answer decides it, even when it is lower. */
  const older = { v: 1, concepts: { c: { box: 5, right: 5, wrong: 0, lastDay: '2026-09-01' } } };
  const newer = { v: 1, concepts: { c: { box: 0, right: 5, wrong: 1, lastDay: '2026-09-03' } } };
  check('cloud: a concept missed more recently is not promoted by an older copy',
    mergeRecords(older, newer).concepts.c.box === 0, JSON.stringify(mergeRecords(older, newer).concepts.c));
  check('cloud: a missing or foreign copy never replaces a real one',
    sameRecord(mergeRecords(newer, null), newer) && sameRecord(mergeRecords({ v: 2, xp: 9e9 }, newer), newer), '');
  const x = record(), y = record();
  y.history.push({ day: x.today.day, xp: 1, correct: 0, asked: 1 });
  const xy = mergeRecords(x, y);
  check('cloud: a day is never both today and banked history', !xy.history.some(h => h.day === xy.today.day), '');

  /* ---- the engine: two devices, one cloud ---- */
  function fakeCloud() {
    const docs = new Map();
    let writes = 0;
    return {
      writes: () => writes, docs,
      async load(uid) { return docs.has(uid) ? JSON.parse(JSON.stringify(docs.get(uid))) : null; },
      async update(uid, fn) {
        const next = fn(docs.has(uid) ? JSON.parse(JSON.stringify(docs.get(uid))) : null);
        if (next) { docs.set(uid, JSON.parse(JSON.stringify(next))); writes++; }
        return next;
      },
    };
  }
  function device(rec, account) {
    let state = JSON.parse(JSON.stringify(rec));
    const prof = { id: 'd', name: 'Asha', account };
    return { activeProfile: () => prof, get: () => state,
      adopt: r => { if (!r || r.v !== 1) return false; state = r; return true; } };
  }
  const user = { uid: 'u1', phoneNumber: '+919876543210' };
  const acct = { uid: 'u1', phone: user.phoneNumber };
  const sky = fakeCloud();
  const phoneRec = record(), laptopRec = record();
  const phone = device(phoneRec, acct), laptop = device(laptopRec, acct);
  const sp = cloud.createSync({ backend: sky, st: phone, debounceMs: 0 });
  const sl = cloud.createSync({ backend: sky, st: laptop, debounceMs: 0 });

  await sp.attach(user);
  check('cloud: the first device to sign in creates the account record', sky.docs.has('u1') && sky.writes() === 1, String(sky.writes()));
  await sl.attach(user);
  const want = mergeRecords(phoneRec, laptopRec);
  check("cloud: the second device receives the first device's progress", sameRecord(laptop.get(), want), '');
  await sp.flush();
  check("cloud: and the first device receives the second's", sameRecord(phone.get(), want), '');
  const before = sky.writes();
  await sp.flush(); await sl.flush();
  check('cloud: once in step, a sync writes nothing', sky.writes() === before, `${sky.writes() - before} extra writes`);

  phone.get().lessons['q.new-on-phone'] = { status: 'done', score: 1, attempts: 1, xp: 30, lastDay: '2026-09-06' };
  laptop.get().lessons['r.new-on-laptop'] = { status: 'done', score: 0.8, attempts: 1, xp: 30, lastDay: '2026-09-06' };
  await Promise.all([sl.flush(), sp.flush()]);
  await sl.flush();
  const both = d => d.get().lessons['q.new-on-phone']?.status === 'done' && d.get().lessons['r.new-on-laptop']?.status === 'done';
  check('cloud: two devices finishing lessons while apart both keep both lessons', both(phone) && both(laptop), '');
  const stored = JSON.parse(sky.docs.get('u1').progress);
  check('cloud: and so does the cloud copy', !!(stored.lessons['q.new-on-phone'] && stored.lessons['r.new-on-laptop']), '');
  check('cloud: the stored document carries only the fields the rules allow',
    Object.keys(sky.docs.get('u1')).every(k => ['v', 'phone', 'name', 'progress', 'updatedAt'].includes(k)),
    Object.keys(sky.docs.get('u1')).join());
  check('cloud: the stored phone is the signed-in number, as the rules require',
    sky.docs.get('u1').phone === user.phoneNumber, sky.docs.get('u1').phone);

  /* Non-vacuous: an overwrite-style sync (newest wins) must be caught by the
     "both lessons" check above. Simulate it and confirm the check would fail. */
  const clobber = { ...laptop.get(), lessons: { 'r.new-on-laptop': laptop.get().lessons['r.new-on-laptop'] } };
  check('cloud: the both-lessons check is not vacuous — an overwrite would fail it', !both({ get: () => clobber }), '');

  const sibling = device(record(), undefined);
  const ss = cloud.createSync({ backend: sky, st: sibling, debounceMs: 0 });
  const snap = sky.docs.get('u1').progress;
  await ss.attach(user); await ss.flush();
  check('cloud: another learner on a signed-in device is never synced into the account', sky.docs.get('u1').progress === snap, '');

  const broken = { load: async () => { throw new Error('offline'); }, update: async () => { throw new Error('offline'); } };
  const lonely = device(record(), acct), keep = JSON.stringify(lonely.get());
  const statuses = [];
  const sb = cloud.createSync({ backend: broken, st: lonely, debounceMs: 0, onStatus: s => statuses.push(s) });
  let threw = false;
  try { await sb.attach(user); } catch { threw = true; }
  check('cloud: an unreachable cloud neither throws nor touches local progress',
    !threw && JSON.stringify(lonely.get()) === keep && statuses.includes('error'), statuses.join());

  /* ---- the real store's account functions ---- */
  store.reset();
  const base = store.activeProfile();
  check("cloud: linking a profile marks it as the account's copy",
    store.linkProfile(base.id, acct) && store.accountProfile('u1')?.id === base.id, '');
  const other = store.addProfile('Sibling');
  store.linkProfile(other.id, acct);
  check('cloud: an account has one copy per device, never two',
    store.profiles().filter(p => p.account?.uid === 'u1').length === 1 && store.accountProfile('u1').id === other.id, '');
  check('cloud: adopt refuses anything that is not a progress record',
    !store.adopt(null) && !store.adopt({ v: 2 }) && !store.adopt('x'), '');
  check("cloud: signing out removes that account's progress from the device",
    store.forgetAccount('u1') && !store.accountProfile('u1') && !store.profiles().some(p => p.id === other.id),
    store.profiles().map(p => p.name).join());
  /* Leave exactly one profile, link it, and sign out: it must be emptied, not deleted. */
  while (store.profiles().length > 1) store.deleteProfile(store.profiles().find(p => p.id !== store.activeProfileId()).id);
  store.completeLesson('r.found.anatomy', 1, 30);
  store.linkProfile(store.activeProfile().id, acct);
  store.forgetAccount('u1');
  check('cloud: signing out the only learner empties it rather than deleting it',
    store.profiles().length === 1 && !store.activeProfile().account && store.get().xp === 0,
    `${store.profiles().length} profiles, xp ${store.get().xp}`);

  /* ---- config ---- */
  check('cloud: off in the shipped configuration', cfg.CONFIG.cloud.enabled === false, '');
  check('cloud: switched on with blank Firebase settings stays off', cfg.resolve({ cloud: { enabled: true } }).cloud.enabled === false, '');
  const full = { apiKey: 'k', authDomain: 'x.firebaseapp.com', projectId: 'x', appId: '1:2:web:3' };
  check('cloud: switched on with all four settings turns on', cfg.resolve({ cloud: { enabled: true, firebase: full } }).cloud.enabled === true, '');
  check('cloud: a malformed country code falls back', cfg.resolve({ cloud: { countryCode: '91abc' } }).cloud.countryCode === '+91', '');

  /* ---- phone numbers ---- */
  check('cloud: a bare Indian number gets +91', cloud.normalisePhone('98765 43210', '+91') === '+919876543210', '');
  check('cloud: a leading 0 is dropped', cloud.normalisePhone('098765-43210', '+91') === '+919876543210', '');
  check('cloud: an international number is kept', cloud.normalisePhone('+44 7700 900123', '+91') === '+447700900123', '');
  check('cloud: letters are refused', cloud.normalisePhone('call me', '+91') === null, '');
  const masked = cloud.maskPhone('+919876543210');
  check('cloud: a masked number shows only its last four digits', masked.endsWith('3210') && !masked.includes('98765'), masked);

  /* ---- a site with the cloud switched off must not download it ----

     store.js imports cloud.js lazily, and only when `cloud.enabled`. That was
     undone for a while by shell.js importing two helpers from it at the top of
     the file, which pulled cloud.js and merge.js into every page of every
     build — the heavy part (Firebase) stayed lazy, but "downloads none of it"
     should mean none of it. */
  const shellSrc = fs.readFileSync(path.join(ROOT, 'assets/js/shell.js'), 'utf8');
  check('cloud: an ordinary page does not download the cloud module',
    !/^import[^\n]*from '\.\/(cloud|merge)\.js'/m.test(shellSrc),
    'shell.js imports it at the top, so every page loads it');
  check('cloud: store.js still loads it lazily when it IS configured',
    /CONFIG\.cloud\.enabled[\s\S]{0,120}import\('\.\/cloud\.js'\)/.test(
      fs.readFileSync(path.join(ROOT, 'assets/js/store.js'), 'utf8')), '');

  /* ---- the dev server should show what the host will show ---- */
  const serve = fs.readFileSync(path.join(ROOT, 'tools/serve.py'), 'utf8');
  check('cloud: the dev server serves the site\'s own 404 page, as the host does',
    /def send_error/.test(serve) && /404\.html/.test(serve),
    'a missing page renders Python\'s error page locally and 404.html in production');

  /* ---- the pieces a deployment needs ---- */
  const rules = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
  check('cloud: the rules let a learner touch only their own record', /request\.auth\.uid == uid/.test(rules), '');
  check('cloud: and close everything else', /match \/\{document=\*\*\}[\s\S]*allow read, write: if false/.test(rules), '');
  check('cloud: the login page exists and uses the cloud module',
    fs.readFileSync(path.join(ROOT, 'login', 'index.html'), 'utf8').includes('assets/js/cloud.js'), '');
  check('cloud: the build ships the login page', require('./build.js').pageDirs().includes('login'), '');
  check('cloud: README explains the Firebase setup', /Mobile login/.test(fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')), '');

  store.reset();
  console.log(`  merge checked over ${TRIALS} random record triples; two devices synced through a fake cloud`);
};
