/* ============================================================
   Package the site as one downloadable file.

     node tools/package.js              → dist/<name>-<date>.zip
     node tools/package.js --raw        → dist/ only, no zip

   WHY THIS EXISTS
   The site is static and has no dependencies, which is what makes it worth
   handing to somebody: they unzip it, run one command, and it is theirs.
   What they get is not a demo — it is the whole academy, plus the one file
   that makes it theirs (assets/js/config.js) and a README that explains the
   two things they actually need to know.

   WHY THE ZIP IS WRITTEN BY HAND
   `zlib` ships with Node and a ZIP container is a well-documented format, so
   a hundred lines here buys the project's no-dependency rule outright. The
   alternative was adding a package.json and a node_modules for one archive,
   which would have cost the property the product is being sold on.

   It writes STORED or DEFLATED entries with no zip64 and no encryption —
   which is all a folder of text files needs, and is what every unzip tool on
   every platform has understood for thirty years.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const build = require('./build.js');

/* ---------------- CRC-32, table-driven ---------------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/* ---------------- the container ---------------- */

/* MS-DOS date and time, which is what a ZIP header carries. Seconds have a
   resolution of two, hence the halving — that is the format, not a rounding
   error. */
function dosStamp(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

function zip(entries, when = new Date()) {
  const { time, date } = dosStamp(when);
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const e of entries) {
    const name = Buffer.from(e.name.replace(/\\/g, '/'), 'utf8');
    const raw = e.data;
    const deflated = zlib.deflateRawSync(raw, { level: 9 });
    /* Store rather than deflate when compression makes it bigger — true for
       tiny files, where the deflate header outweighs anything it saves. */
    const useDeflate = deflated.length < raw.length;
    const body = useDeflate ? deflated : raw;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);              // version needed
    local.writeUInt16LE(0, 6);               // flags
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);              // extra field length

    chunks.push(local, name, body);

    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0);
    dir.writeUInt16LE(20, 4);                // version made by
    dir.writeUInt16LE(20, 6);                // version needed
    dir.writeUInt16LE(0, 8);
    dir.writeUInt16LE(method, 10);
    dir.writeUInt16LE(time, 12);
    dir.writeUInt16LE(date, 14);
    dir.writeUInt32LE(crc, 16);
    dir.writeUInt32LE(body.length, 20);
    dir.writeUInt32LE(raw.length, 24);
    dir.writeUInt16LE(name.length, 28);
    dir.writeUInt16LE(0, 30);                // extra
    dir.writeUInt16LE(0, 32);                // comment
    dir.writeUInt16LE(0, 34);                // disk number
    dir.writeUInt16LE(0, 36);                // internal attrs
    dir.writeUInt32LE(0o644 << 16, 38);      // external attrs: readable everywhere
    dir.writeUInt32LE(offset, 42);
    central.push(dir, name);

    offset += local.length + name.length + body.length;
  }

  const dirBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dirBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, dirBuf, end]);
}

/* ---------------- what goes in ---------------- */

function walk(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, base, out);
    else out.push({ name: path.relative(base, full), data: fs.readFileSync(full) });
  }
  return out;
}

/* The note the person who unzips this actually reads. Everything in it is a
   thing they will hit in the first five minutes — how to run it, the one file
   to edit, and the fact that ES modules will not load over file://, which is
   the single most likely way to conclude the thing is broken. */
function readme(cfg) {
  return `${cfg.identity.name}
${'='.repeat(cfg.identity.name.length)}

${cfg.identity.blurb}

RUN IT
------
This is a static site, but it uses ES modules — which browsers refuse to load
from a file:// path. Opening index.html by double-clicking it will show a blank
page. That is a browser security rule, not a fault in the site.

So serve it. Any of these work:

    python3 tools/serve.py          (included; sends no-cache headers)
    python3 -m http.server 8000
    npx serve .

Then open the address it prints. To put it online, upload this whole folder to
any static host — Netlify, GitHub Pages, S3, a university web directory. There
is no server code, no database and no build step.

MAKE IT YOURS
-------------
One file: assets/js/config.js

The name, the tagline, the three accent colours, the guide's name, the exam
rules, the Leitner intervals and which chapters exist are all in it, each with
a comment saying what changing it costs. Edit it in any text editor and reload.

Or open  /customize/  in the running site: same settings, with a live preview,
and a button that writes the file for you.

Every value is validated when it is read. A colour that is not a colour or an
interval ladder that runs backwards falls back to its default rather than
taking a page down — you cannot break this by editing it.

WHAT IS INSIDE
--------------
  index.html        home: the two academies, and your dashboard
  reasoning/ quants/  the paths
  lesson/           the lesson runner
  review/           spaced repetition — what you are about to forget
  practice/         one chapter, written questions or endless generated ones
  reteach/          an idea you keep getting wrong, taught again
  mock/             a timed, mixed, negatively marked paper
  customize/        the settings form
  modules/          the eight standalone tools the lessons grew out of
  assets/js/config.js   >>> the file you edit <<<
  tools/serve.py    the dev server
  tools/verify-generators.js   the test harness — see below

IF YOU CHANGE THE CONTENT
-------------------------
Run the harness:

    node tools/verify-generators.js

It re-derives every generated answer independently, brute-forces every puzzle
for a unique solution, and checks a few thousand other things. It takes about a
minute and it is the reason the questions can be trusted. If you add or edit a
lesson, it must pass before you publish.

LICENCE AND CONTENT
-------------------
The lesson content and the question generators are the work of their author.
Reproduction or redistribution without permission is not licensed. Configuring
this copy for your own teaching is expected; republishing the content as your
own is not.
`;
}

/* ---------------- run ---------------- */

async function main() {
  const raw = process.argv.includes('--raw');

  /* The zip ships the BUILT copy — comments stripped, same as tools/build.js —
     because that is the form meant for a reader rather than an editor. The
     config file is deliberately excluded from that stripping below. */
  build.buildTo(OUT);

  /* config.js keeps its comments. It is the one file the recipient is expected
     to open, and a stripped version of it would be data with the instructions
     removed — exactly backwards for the file whose whole job is to explain
     itself. */
  const cfgSrc = path.join(ROOT, 'assets', 'js', 'config.js');
  fs.copyFileSync(cfgSrc, path.join(OUT, 'assets', 'js', 'config.js'));

  /* serve.py and the harness travel with it: without the first nobody can run
     it, and without the second nobody can safely change it. */
  fs.mkdirSync(path.join(OUT, 'tools'), { recursive: true });
  for (const f of ['serve.py', 'verify-generators.js', 'build.js', 'package.js']) {
    fs.copyFileSync(path.join(ROOT, 'tools', f), path.join(OUT, 'tools', f));
  }

  const { CONFIG } = await import('file://' + cfgSrc);
  fs.writeFileSync(path.join(OUT, 'README.txt'), readme(CONFIG));

  if (raw) {
    console.log(`dist/ ready — ${walk(OUT).length} files, unzipped.`);
    return;
  }

  const slug = CONFIG.identity.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 40) || 'academy';
  const stamp = new Date().toISOString().slice(0, 10);
  const zipName = `${slug}-${stamp}.zip`;

  const files = walk(OUT).sort((a, b) => a.name.localeCompare(b.name));
  const buf = zip(files.map(f => ({ name: `${slug}/${f.name}`, data: f.data })));
  const zipPath = path.join(OUT, zipName);
  fs.writeFileSync(zipPath, buf);

  const mb = n => (n / 1048576).toFixed(2);
  const rawSize = files.reduce((t, f) => t + f.data.length, 0);
  console.log(`${zipName} — ${files.length} files, ${mb(rawSize)} MB → ${mb(buf.length)} MB`);
  console.log(`   ${zipPath}`);
  console.log(`Unzip it, run  python3 tools/serve.py , and edit assets/js/config.js to make it yours.`);
}

if (require.main === module) main();
module.exports = { zip, crc32, readme };
