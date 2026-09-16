/* ============================================================
   Build a distributable copy of the site.

     node tools/build.js            → dist/

   WHAT THIS IS
   Friction, not security. Read that again before relying on it.

   The site is static: every lesson is an ES module the browser fetches
   and can therefore be read in the Network tab. This build makes that
   tedious — comments gone, one file instead of ninety, no tidy
   `q-int-work.js` to open — so a casual visitor poking at Inspect
   Element gives up. Anyone who actually wants the content still has it
   in about ten minutes, and no amount of client-side cleverness changes
   that, because the browser has to be able to run the code.

   The ONLY real protection is a server that holds the questions and
   hands them out one at a time behind a login. That is a different
   architecture, and it was considered and declined.

   WHAT THIS DELIBERATELY DOES NOT DO
   · No identifier mangling. A correct renamer needs a real parser, and
     a half-correct one silently breaks a lesson months later. The gain
     over comment-stripping is small; the risk is not.
   · No right-click / F12 blocking. It stops nobody, breaks keyboard
     users and screen readers, and insults the honest majority.
   · No "encryption". The key would ship with the page.

   The source tree is untouched — development still runs from readable
   files, and `tools/serve.py` still serves them.
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

/* Directories copied wholesale, DERIVED rather than listed.

   The listed version had already rotted: `reteach/` was added and the build
   went on shipping the six directories somebody typed in months earlier, so
   the built copy had a dashboard whose links all dead-ended — and nothing
   said so, because a missing page is invisible until somebody clicks it.
   Inverting it makes the failure harmless in the other direction: forget to
   exclude something and the worst case is a stray directory in dist/.
   `modules/` comes along because those pages are still linked and still work. */
const SKIP_DIRS = new Set(['dist', 'tools', 'node_modules']);
const isPart = name => !name.startsWith('.') && !SKIP_DIRS.has(name);

const copyDirs = () => fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory() && isPart(e.name)).map(e => e.name);
const copyFiles = () => fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isFile() && e.name.endsWith('.html')).map(e => e.name);

/* Every directory that is a PAGE — the ones a dead link would be felt in.
   Exported so the harness can hold the build to copying all of them. */
const pageDirs = () => copyDirs().filter(d => fs.existsSync(path.join(ROOT, d, 'index.html')));

/* ---------------- comment stripping ----------------
   Lifted from the harness, where it has been parsing this codebase for a
   long time. It tracks string and template state, so a `//` inside a URL
   or a regex-looking string is left alone — which is exactly the class of
   bug a naive regex version ships with. */
function stripComments(src) {
  let out = '', i = 0, mode = null;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (!mode) {
      if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '/' && d === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') mode = c;
    } else if (c === '\\') { out += c + (src[i + 1] || ''); i += 2; continue; }
    else if (c === mode) mode = null;
    out += c; i++;
  }
  return out;
}

/**
 * Collapse the blank lines and leading indentation that comment removal
 * leaves behind.
 *
 * Only touches whitespace at the START of a line and runs of blank lines —
 * never inside the line — so template literals holding lesson prose keep
 * their internal spacing, and no statement can be joined to the next one.
 * That restraint is the whole reason this is safe without a parser.
 */
function squeeze(src) {
  return src
    .split('\n')
    .map(l => l.replace(/^[ \t]+/, ''))
    .join('\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

let files = 0, before = 0, after = 0;

function processJS(src) {
  const out = squeeze(stripComments(src));
  before += src.length;
  after += out.length;
  return out;
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) { copyDir(src, dst); continue; }
    files++;
    if (entry.name.endsWith('.js')) {
      fs.writeFileSync(dst, processJS(fs.readFileSync(src, 'utf8')));
    } else if (entry.name.endsWith('.html')) {
      /* HTML carries inline <script type="module"> blocks, which get the
         same treatment; the surrounding markup is left alone. */
      const html = fs.readFileSync(src, 'utf8').replace(
        /(<script[^>]*>)([\s\S]*?)(<\/script>)/g,
        (_, open, body, close) => open + processJS(body) + close);
      fs.writeFileSync(dst, html);
    } else {
      fs.copyFileSync(src, dst);
    }
  }
}

/** Build into any directory. `tools/package.js` uses this before zipping. */
function buildTo(target = OUT) {
  files = 0; before = 0; after = 0;              // fresh counters per build
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });

  for (const d of copyDirs()) copyDir(path.join(ROOT, d), path.join(target, d));
  for (const f of copyFiles()) {
    files++;
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(
      /(<script[^>]*>)([\s\S]*?)(<\/script>)/g,
      (_, open, body, close) => open + processJS(body) + close);
    fs.writeFileSync(path.join(target, f), html);
  }

  /* A notice in the build, since the content is the work worth protecting and
     a licence is the part that actually has teeth. */
  fs.writeFileSync(path.join(target, 'NOTICE.txt'),
    `Reasoning & Quants Academy\n` +
    `Lesson content and question generators are the work of their author.\n` +
    `Reproduction or redistribution without permission is not licensed.\n\n` +
    `Note: this build strips comments and indentation. It is not encryption —\n` +
    `a static site is readable by anyone who wants to read it.\n`);

  return { files, before, after };
}

function build() {
  const r = buildTo(OUT);
  const pct = r.before ? Math.round((1 - r.after / r.before) * 100) : 0;
  console.log(`dist/ built — ${r.files} files, JS ${(r.before / 1024).toFixed(0)} KB → ` +
              `${(r.after / 1024).toFixed(0)} KB (${pct}% smaller)`);
  console.log('This is friction, not security: a static site is always readable. See the header.');
}

/* Only builds when run directly, so the harness can import the directory rules
   and check them without writing a dist/ nobody asked for. */
if (require.main === module) build();

module.exports = { copyDirs, copyFiles, pageDirs, stripComments, squeeze, buildTo };
