/* ============================================================
   THE ONE FILE YOU EDIT.

   Everything below can be changed without touching any other file, and
   everything has a default that reproduces the academy exactly as it
   ships. Change a value, reload, and the site is yours: your name, your
   colours, your guide, your exam rules, your chapters.

   Two ways to do it:
     · edit this file directly — it is plain data, no build step; or
     · open  /customize/  in the running site, set everything with a
       form and a live preview, and download the file it writes.

   THREE RULES THIS FILE FOLLOWS, so a hand-edit can never break the site:

   1. Every value is VALIDATED on read, not trusted. A colour that is not
      a colour, a negative interval, a paper size of nine thousand — each
      falls back to its default rather than taking a page down. A product
      somebody downloads and edits in a text editor has to survive being
      edited in a text editor.
   2. Nothing here changes what a question ASKS. Difficulty tiers, answer
      keys and the widgets are not configurable, because they are the part
      that was verified — a knob that could make a lesson wrong is not a
      feature.
   3. The defaults ARE the shipped behaviour, asserted by the harness. If
      you delete this file's contents entirely, you get the original site.
   ============================================================ */

export const DEFAULTS = {
  /* ---------- who this belongs to ---------- */
  identity: {
    name: 'Reasoning & Quants Academy',   // full name: browser titles, footer
    short: 'Reasoning & Quants',          // top bar, where space is tight
    markSub: 'Academy',                   // the small word stacked under it; '' for none
    kicker: 'RAS Prelims · Reasoning · Mental Ability · Basic Numeracy',
    tagline: 'Learn it by doing it.',
    blurb: 'Two academies, fourteen chapters, and a guide who refuses to explain anything '
         + 'until you have committed to an answer.',
    footer: 'built for self-paced RAS preparation.',
  },

  /* ---------- the guide ----------
     He is named in exactly one place in the code and NOWHERE in the 65
     lessons — he speaks in the first person throughout — so renaming him
     really does rename him, rather than leaving his old name scattered
     through the prose. His VOICE is not configurable: the rules at the top
     of betaal.js are what keep 65 lessons sounding like one person. */
  guide: {
    name: 'Betaal',
    role: 'your guide',
    origin: 'the riddle-poser from Vikram–Betaal',
  },

  /* ---------- colour ----------
     Three accents. The rest of the palette — paper, ink, lines, and the
     whole dark-mode set — is derived in CSS and is not worth exposing:
     changing it is how a readable site stops being readable. */
  theme: {
    brand: '#8c3b2e',      // the academy itself
    reason: '#6b4c9a',     // Reasoning academy
    quant: '#2f7d8c',      // Quants academy
  },

  /* ---------- the exam you are preparing for ----------
     Defaults are RPSC's RAS Prelims: 150 questions in 180 minutes, one
     third of a mark deducted for a wrong answer. Change these and the mock
     changes with them — the clock, the marking and the verdict all read
     from here rather than from a number typed into the page. */
  exam: {
    name: 'RAS Prelims',
    questions: 150,          // in the real paper
    minutes: 180,            // for the real paper
    penalty: 1 / 3,          // marks deducted per wrong answer; 0 for none
    paperSizes: [10, 25, 50],
    setShare: 0.35,          // share of a mock given to shared-stimulus sets
  },

  /* ---------- the progress model ----------
     The Leitner intervals are the spine of the whole thing: a concept
     answered right moves up a box and comes back after that many days.
     Shortening them means more revision and less new ground; lengthening
     them means the opposite. Both are legitimate; neither is free. */
  progress: {
    intervals: [0, 1, 2, 4, 8, 16, 32],   // days per box, box 0 first
    dailyGoal: 40,                        // XP
    lessonXP: 30,                         // for finishing a lesson
    practiceXP: 4,                        // per correct answer in a practice set
    repeatShare: 0.25,                    // XP for re-running a finished lesson
  },

  /* ---------- what exists ----------
     Turn a page off and it disappears from the navigation, the dashboard
     and the derived next-steps track — not merely from the menu. A link to
     a page nobody can reach is worse than no page. */
  features: {
    review: true,        // /review   — spaced-repetition mixed sets
    practice: true,      // /practice — one chapter's own set
    drill: true,         // /practice?drill=1 — endless generated sets
    reteach: true,       // /reteach  — the teaching again, for a failing idea
    mock: true,          // /mock     — timed, negatively marked papers
    achievements: true,  // badges + the shelf
    profiles: true,      // several learners on one browser
    modules: true,       // the eight original standalone tools
  },

  /* ---------- which content ----------
     `academies` switches a whole academy off. `chapters` takes a list of
     chapter keys ("reasoning:3") to HIDE — an empty list shows everything.
     Useful for a shorter course, or for releasing a chapter at a time. */
  content: {
    academies: { reasoning: true, quants: true },
    hideChapters: [],
  },
};

/* ============================================================
   Validation.

   Read through `CONFIG`, never through `DEFAULTS` — every getter below
   falls back rather than trusting what it finds, so a typo in this file
   costs you that one setting and nothing else.
   ============================================================ */

const isHex = v => typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
const str = (v, d) => (typeof v === 'string' && v.trim() ? v.trim() : d);
const num = (v, d, lo, hi) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? n : d;
};
const bool = (v, d) => (typeof v === 'boolean' ? v : d);

/**
 * Leitner intervals, checked for the two things that would silently ruin the
 * schedule: they must ASCEND (a box that comes back sooner than the one below
 * it is not a ladder) and box 0 must be 0 (a wrong answer returns today).
 */
function intervals(v, d) {
  if (!Array.isArray(v) || v.length < 3 || v.length > 12) return d;
  const nums = v.map(x => Number(x));
  if (nums.some(x => !Number.isInteger(x) || x < 0 || x > 365)) return d;
  if (nums[0] !== 0) return d;
  for (let i = 1; i < nums.length; i++) if (nums[i] <= nums[i - 1]) return d;
  return nums;
}

function paperSizes(v, d) {
  if (!Array.isArray(v) || !v.length) return d;
  const out = [...new Set(v.map(x => Math.round(Number(x))))]
    .filter(x => Number.isFinite(x) && x >= 5 && x <= 150)
    .sort((a, b) => a - b);
  return out.length ? out : d;
}

/** A user's overrides, if any, merged over the defaults with every value checked. */
export function resolve(raw = DEFAULTS) {
  const D = DEFAULTS;
  const r = raw && typeof raw === 'object' ? raw : {};
  const sec = k => (r[k] && typeof r[k] === 'object' ? r[k] : {});
  const id = sec('identity'), gd = sec('guide'), th = sec('theme');
  const ex = sec('exam'), pr = sec('progress'), ft = sec('features'), ct = sec('content');
  const ac = ct.academies && typeof ct.academies === 'object' ? ct.academies : {};

  const questions = num(ex.questions, D.exam.questions, 10, 500);
  const minutes = num(ex.minutes, D.exam.minutes, 5, 600);

  return {
    identity: {
      name: str(id.name, D.identity.name).slice(0, 80),
      short: str(id.short, D.identity.short).slice(0, 40),
      /* Explicit rather than split off the short name. The first version took
         the last word of `short` as the subtitle, which turned "Reasoning &
         Quants" into "Reasoning &" over "Quants" — clever, and wrong for the
         one name it shipped with. An empty string is a valid answer here. */
      markSub: typeof id.markSub === 'string' ? id.markSub.trim().slice(0, 24) : D.identity.markSub,
      kicker: str(id.kicker, D.identity.kicker).slice(0, 140),
      tagline: str(id.tagline, D.identity.tagline).slice(0, 80),
      blurb: str(id.blurb, D.identity.blurb).slice(0, 400),
      footer: str(id.footer, D.identity.footer).slice(0, 140),
    },
    guide: {
      name: str(gd.name, D.guide.name).slice(0, 24),
      role: str(gd.role, D.guide.role).slice(0, 40),
      origin: str(gd.origin, D.guide.origin).slice(0, 120),
    },
    theme: {
      brand: isHex(th.brand) ? th.brand.trim() : D.theme.brand,
      reason: isHex(th.reason) ? th.reason.trim() : D.theme.reason,
      quant: isHex(th.quant) ? th.quant.trim() : D.theme.quant,
    },
    exam: {
      name: str(ex.name, D.exam.name).slice(0, 60),
      questions, minutes,
      /* Derived, not stored: the pace IS the ratio, so a paper of 100 questions
         in 120 minutes gets an honest 72 seconds without anybody doing the sum. */
      secondsPerQuestion: minutes * 60 / questions,
      penalty: num(ex.penalty, D.exam.penalty, 0, 1),
      paperSizes: paperSizes(ex.paperSizes, D.exam.paperSizes),
      setShare: num(ex.setShare, D.exam.setShare, 0, 0.6),
    },
    progress: {
      intervals: intervals(pr.intervals, D.progress.intervals),
      dailyGoal: Math.round(num(pr.dailyGoal, D.progress.dailyGoal, 10, 1000)),
      lessonXP: Math.round(num(pr.lessonXP, D.progress.lessonXP, 1, 500)),
      practiceXP: Math.round(num(pr.practiceXP, D.progress.practiceXP, 1, 100)),
      repeatShare: num(pr.repeatShare, D.progress.repeatShare, 0, 1),
    },
    features: Object.fromEntries(Object.keys(D.features)
      .map(k => [k, bool(ft[k], D.features[k])])),
    content: {
      academies: {
        /* Both off would leave a site with no lessons in it, which is not a
           configuration, it is a mistake. The last one on stays on. */
        reasoning: bool(ac.reasoning, D.content.academies.reasoning)
          || !bool(ac.quants, D.content.academies.quants),
        quants: bool(ac.quants, D.content.academies.quants)
          || !bool(ac.reasoning, D.content.academies.reasoning),
      },
      hideChapters: Array.isArray(ct.hideChapters)
        ? ct.hideChapters.filter(x => typeof x === 'string' && /^[a-z]+:\d+$/.test(x))
        : D.content.hideChapters,
    },
  };
}

/* The resolved configuration the whole site reads. One object, built once. */
export const CONFIG = resolve(DEFAULTS);

/** Is a chapter part of this build? */
export const chapterOn = key => {
  const [academy] = String(key).split(':');
  return !!CONFIG.content.academies[academy] && !CONFIG.content.hideChapters.includes(key);
};

/** Is an academy part of this build? */
export const academyOn = id => !!CONFIG.content.academies[id];

/**
 * Push the three accents into the document as CSS variables.
 *
 * Only the accents. The rest of the palette — paper, ink, lines, and every
 * dark-mode token — is derived in CSS, and exposing it is how a readable site
 * stops being readable. Tints are mixed from the accent at 12%, so a brand
 * colour brings its own background with it rather than needing a second knob.
 */
export function applyTheme(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || !doc.documentElement) return false;
  const { brand, reason, quant } = CONFIG.theme;
  const D = DEFAULTS.theme;
  const s = doc.documentElement.style;
  const set = (name, value, fallback) => { if (value !== fallback) s.setProperty(name, value); };
  set('--brand', brand, D.brand);
  set('--reason', reason, D.reason);
  set('--quant', quant, D.quant);
  /* Deep and tint variants follow the accent automatically. `color-mix` is
     supported everywhere this site already relies on it (see core.css). */
  if (brand !== D.brand) {
    s.setProperty('--brand-deep', `color-mix(in srgb, ${brand} 78%, black)`);
    s.setProperty('--brand-tint', `color-mix(in srgb, ${brand} 12%, white)`);
  }
  if (reason !== D.reason) {
    s.setProperty('--reason-deep', `color-mix(in srgb, ${reason} 78%, black)`);
    s.setProperty('--reason-tint', `color-mix(in srgb, ${reason} 12%, white)`);
  }
  if (quant !== D.quant) {
    s.setProperty('--quant-deep', `color-mix(in srgb, ${quant} 78%, black)`);
    s.setProperty('--quant-tint', `color-mix(in srgb, ${quant} 12%, white)`);
  }
  if (CONFIG.identity.name) doc.title = doc.title.replace(DEFAULTS.identity.name, CONFIG.identity.name);
  return true;
}

/* The customizer does NOT re-serialise this file. It fetches this very file,
   swaps the DEFAULTS block for yours, and hands the result back — so a
   downloaded config carries the same validation as the original, and there is
   never a second copy of these rules to drift out of step. The two markers
   below are what it splices between; leave them in place. */
export const BLOCK_START = 'export const DEFAULTS = {';
export const BLOCK_END = '};\n\n/* ====';
