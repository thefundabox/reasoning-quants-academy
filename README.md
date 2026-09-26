# Reasoning & Quants Academy

Self-paced, interactive preparation for the RAS Prelims reasoning and basic-numeracy block.
A static site — no build step, no framework, no dependencies.

## Make it yours

Everything that identifies this site lives in **one file**: `assets/js/config.js`.

```js
identity: { name: 'Marudhara Institute', tagline: 'Think it through.', … }
guide:    { name: 'Guruji', role: 'your tutor' }
theme:    { brand: '#1f5c3d', reason: '#7a4a1e', quant: '#2b4a8c' }
exam:     { questions: 100, minutes: 120, penalty: 0.25 }   // your paper's own rules
content:  { hideChapters: ['quants:6'] }                    // a shorter course
```

Edit it in any text editor and reload — or open **`/customize/`** in the running site for the
same settings with a live preview and a button that writes the file for you.

Every value is validated when it is read, so a colour that is not a colour or an interval ladder
that runs backwards falls back to its default rather than taking a page down. Nothing in it can
change what a question *asks*: the lessons, answer keys and difficulty tiers are the part that
was verified.

To hand the whole thing to somebody:

```bash
node tools/package.js      # → dist/<name>-<date>.zip, ~0.6 MB, no dependencies
```

## Run it

```bash
python3 tools/serve.py
```

Then open <http://localhost:4173>. The dev server sends `no-store` so edits to ES modules take
effect immediately; plain `python3 -m http.server` will cache modules and hide your changes.

It has to be *served*: ES modules do not load over `file://`, so double-clicking `index.html`
shows a blank page. That is a browser security rule, not a fault in the site.

To deploy, upload the folder to any static host (Netlify, GitHub Pages, S3). Nothing is server-side.
On GitHub Pages: push this folder, then *Settings → Pages → Deploy from a branch → `main` / root*.
`.nojekyll` and `404.html` are already here for it, and every link works under a `/<repo>/` prefix.

## What it is

Two academies, deliberately separate:

| | Reasoning Academy | Quants Academy |
|---|---|---|
| Units | 7 | 7 |
| Lessons mapped | 32 | 33 |
| Lessons built | **32 — complete** | **33 — complete** |
| Accent | violet | teal |

Each academy's path is a **chapter timeline**: folding chapters on a vertical spine, one dot per
lesson, one bar segment per lesson in the chapter header, and a single lesson marked *You are
here*. Chapters fold so a 33-lesson academy stays readable, and the chapter you are working
through opens itself.

It is **sequenced but not gated**. The order is drawn plainly, yet every built lesson stays
clickable — hiding the road ahead kills motivation, and an exam candidate revising Unit 5 the
night before must not have to replay Unit 1 to reach it.

Every lesson follows one rhythm, borrowed from Brilliant's "learn by doing":

**Hook → Explore → Predict → Reveal → Drill → Mastery**

The rule that makes it work: **the learner commits to an answer before any explanation appears.**
The riddle posed in the Hook returns in Mastery, now answerable.

**Betaal** — the riddle-poser from Vikram–Betaal — guides throughout. He challenges rather than
lectures, is amused by wrong answers, and never congratulates a guess. His voice rules are
documented at the top of `assets/js/betaal.js`; keep new lessons consistent with them.

## Progress model

- **Streak + daily XP goal** (Duolingo) — repeat runs of a lesson award 25% XP, so new ground beats grinding.
- **Per-concept Leitner mastery** (Membean) — right answers move a concept up the boxes
  (1 → 2 → 4 → 8 → 16 → 32 days), wrong answers drop it. The dashboard review queue surfaces
  what is due, i.e. what you are about to forget.
- **Review sessions** — the queue is not just a list. `review/` assembles a mixed set from
  whatever is due, drawn from wherever in the two academies those ideas live, and answering moves
  each concept up or down its ladder. A review is not a lesson: it awards XP but never marks a
  lesson complete.
- **Re-teaching** — the queue can only re-test, which is the wrong medicine for an idea that was
  never understood. An idea you keep getting *wrong* (two wrong answers and a losing record) leads
  to `reteach/`, which replays the lesson steps that taught it — the exposition, the widget, the
  worked reveal — and only then asks again, in fresh numbers where a generator exists and a
  difficulty step below your usual. It is the one place on the site where the explanation comes
  before you commit, and only because you already committed and were wrong.
- **Mock papers** — everything above is untimed and forgiving; the exam is neither. A mock is
  10, 25 or 50 questions at RPSC's own pace (72 seconds each), mixed across all fourteen
  chapters, with **a third of a mark deducted for a wrong answer and nothing for a blank**. You
  can skip, flag and come back. No feedback until you submit — then a score, a breakdown by
  chapter, and every question explained. The penalty is the point: a blind guess between four is
  worth exactly zero, a guess between two is worth a third of a mark, and that arithmetic is what
  decides when to attempt.
- **Question sets** — one table or one arrangement with several questions hanging off it, which
  is how a third of the real paper arrives. Solve the stimulus once, read several answers off it.
- **Per-option feedback** — pick the circumference when the answer was the area and you are told
  that, rather than the paragraph everyone else gets. Every generated question does this.
- No hearts, no leagues. When the game outranks the learning, people optimise the game.

All state is in `localStorage` under `rqa.progress.v1`, synced across tabs.

## Layout

```
Every chapter, lesson and tab has its own page. Pages marked * are written by tools/pages.js.

index.html              Home tab — greeting, next steps, the two academies
reasoning/ quants/      each academy's tab — its chapters, as cards
  3-space-and-direction/          * a chapter: its lessons, practice, prev/next chapter
    compass-and-turns/            * a lesson
    practice/                     * that chapter's written questions
    drill/                        * that chapter's endless generated drill (?tier=1|2|3)
ras-drills/             RAS Practise Drills tab — questions built on the real papers
  codes/                          * one page per topic, plus mixed/
review/                 Review tab — spaced-repetition set (?n=<size>)
login/                  mobile sign-in (only when `cloud` is configured)
mock/                   Mock test tab — timed, negatively marked (?n=10|25|50)
progress/               Progress tab — dashboard and achievements
reteach/<concept>/      * one idea taught again, then re-tested
modules/                Tools tab — the eight original standalone tools
  coding-lab/learn-the-codes/     * each tool's tabs, one page apiece
customize/              the settings form, with a live preview
lesson/ practice/ reteach/index.html   forward old ?id= / ?a=&u= / ?c= links to the new pages
404.html  .nojekyll     for GitHub Pages
assets/css/             core · lesson · widgets
assets/js/
  store.js              XP, streak, mastery, review queue
  curriculum.js         both academies, all 14 units
  runner.js             the lesson loop
  betaal.js             the guide: moods, dialogue, voice
  shell.js              topbar + section tabs, dashboard, academy and chapter pages
  routes.js             where every page lives — links and tools/pages.js both ask it
  ras/                  the RAS Practise Drills bank — 41 generators, 12 topics
  cloud.js              mobile sign-in and cross-device sync (off by default)
  merge.js              merging two copies of one learner's record
  pages.js              what each generated page runs
  review.js             concept → the questions that TEST it
  reteach.js            concept → the lesson steps that TEACH it
  config.js             >>> the one file you edit <<<  identity, colours, guide,
                        exam rules, intervals, features, chapters
  mock.js               the paper: blueprint, marking, verdict, and its own runner
  generators/sets.js    one stimulus, several questions
  generators/           questions dealt from a rule instead of a list
  widgets/              interactive manipulables
  lessons/              lesson content
tools/serve.py          dev server (no-cache)
tools/pages.js          write the per-chapter/lesson/tab pages (--check: are they current?)
tools/package.js        zip the whole site — dependency-free ZIP writer
tools/verify-generators.js   regression harness for the modules/ generators
```

## RAS Practise Drills

A second, separate question bank, at `/ras-drills/`. Where the chapter drills teach one idea at a
time, this bank rehearses **the paper**: every archetype in it is one the RPSC has actually set in
RAS Prelims 2015, 2016, 2018, 2021, 2023 or 2024, and each generator names the question it was
modelled on.

- **66 generators across 13 topics** — over 23,000 distinct questions, every one with a worked
  explanation and a named mistake behind each wrong option.
- **The papers set the level and the variety; they do not cap the syllabus.** The bank covers every
  archetype found in RAS Prelims 2015–2024 *and* the neighbouring ones the same examiner can ask:
  number series beside letter series, rearrangement codes beside shift codes, mirror images and
  hidden cubes beside figure counting, three-set Venn counting, statistics repaired from totals,
  inscribed figures, the gap method, compounding more often than yearly. A bank that stops at the
  questions that happened to be printed is a bank that teaches last year's paper.
- **Harder by design.** Its gentlest tier is an ordinary exam question; the chapter drills stay
  where they were, because they are for learning an idea rather than sitting a paper.
- **Kept apart.** `assets/js/ras/` imports nothing from `assets/js/generators/` except the shared
  randomness helpers, and nothing imports it back — the harness checks that too.
- Answers still feed the same Leitner ladder: each generator records against a concept its own
  chapter teaches, so a RAS question you miss comes back in your review queue and its re-teach
  goes to the lesson that taught it.

Every topic carries the paper references its shapes come from, shown on the topic card and under
each explanation, so a learner can see which of these the RPSC has actually set.

Switch it off with `features.rasDrills` in `config.js`. Add a generator by writing it in the right
`assets/js/ras/*.js`, exporting it from that file's array, and running the harness — `tools/ras-suite.js`
re-derives the mechanical answers from the printed question, re-solves the seating puzzles from
their own clues, and checks every topic can still deal at least a hundred different questions.

## The printed question is the question

`tools/printed-suite.js` reads what the LEARNER reads — the rendered question text and figure —
parses the numbers back out of it, and works the answer out again by a different route. It covers
41 generators and re-derives about 10,000 questions per run, and it re-solves the seating and
floors puzzles from their own printed clues by brute force.

It exists because of a bug nothing else could see: `cnt-slots` drew four slots at Stretch while
every scene could only name three, so the question printed three numbers and the key multiplied
four. The question was well-formed, its options were distinct, its explanation agreed with itself —
and its answer could not be reached from what was on the page. Any check written against the
generator's own intent passes that; only a check that reads the printed text fails it.

## Mobile login (optional)

Off by default: progress lives in the browser, and the site needs nothing but a static host.

Turn it on and learners sign in with a mobile number and a one-time SMS code, and their progress
follows them to any device. It needs a free Firebase project (Google's hosted authentication and
database):

1. Create a project at <https://console.firebase.google.com> → **Add project**.
2. **Build → Authentication → Sign-in method → Phone → Enable.** SMS verification is a paid
   Firebase feature on new projects; check the current pricing before you open it to the public,
   and add test numbers under *Phone numbers for testing* while you are developing.
3. **Authentication → Settings → Authorised domains:** add the domain you serve from
   (`<user>.github.io`), and `localhost` for development.
4. **Build → Firestore Database → Create database** (production mode). Open the **Rules** tab,
   paste `firestore.rules` from this repository, and Publish. Those rules are what actually protect
   a learner's record: a signed-in number may read and write its own document and nothing else.
5. **Project settings → Your apps → Web app.** Copy the four values into `cloud.firebase` in
   `assets/js/config.js` and set `cloud.enabled: true`.

Those four values are not secrets — Firebase's web config is meant to ship in the page.

How it behaves: the browser copy stays the working copy, so the site still works offline; every
sync **merges** rather than overwrites (`assets/js/merge.js`), so two devices used apart both keep
their answers; and signing out removes that learner's copy from the device while leaving it safe in
their account.

## Adding a lesson

1. Write `assets/js/lessons/<id>.js` exporting a default `{ id, title, xp, backHref, steps: [...] }`.
2. Steps compose four primitives: `say`, `explore`, `ask`, `reveal`. Give each a `phase` label —
   the progress rail groups by it.
3. Every `ask` needs a `concept` id; that is what feeds mastery and the review queue.
4. Keep at least three steps that TEACH — a `say` with a `body`, an `explore`, and the `reveal`.
   Those are what a re-teach replays, and the harness fails a thinner lesson.
5. Set `ready: true` on its entry in `curriculum.js` to unlock the tile.
6. Run `node tools/pages.js` to write its page. The harness fails until you do.

Lessons built so far:

| Lesson | Manipulable |
|---|---|
| **Unit 2 — Family & Relations** | |
| `r.rel.five-marks` — The Five Marks | family-tree builder |
| `r.rel.ladder` — The Generation Ladder | relation ladder (vertical vs lateral) |
| `r.rel.photo` — Pointing at a Photograph | phrase peeler (innermost "of" first) |
| `r.rel.coded` — Coded Relations | symbol-chain decoder |
| **Unit 3 — Space & Direction** | |
| `r.dir.compass` — Compass & Turns | turn dial (left/right ride with the walker) |
| `r.dir.displace` — Net Displacement | walk map with live displacement |
| `r.dir.shadow` — Sun & Shadow | sun slider + facing control |
| `r.dir.mirror` — The Mirror Trap | flip-the-row comparator |
| **Unit 4 — Order & Arrangement** | |
| `r.ord.ranking` — Ranking Lines | rank line with live identities |
| `r.ord.linear` — Linear Seating | seat board (row) with live clue checks |
| `r.ord.circular` — Circular Seating | seat board (circle, facing in/out) |
| `r.ord.floors` — Floors & Boxes | seat board (vertical stack) |
| `r.ord.schedule` — Scheduling Grids | tick/cross elimination grid |
| **Unit 5 — Codes & Patterns** | |
| `r.code.wheel` — The Cipher Wheel | rotating two-ring wheel + live encoding |
| `r.code.families` — The Five Code Families | family tester that judges your guess |
| `r.code.series-num` — Number Series | build the operation in every gap |
| `r.code.series-let` — Letter & Mixed Series | same chain, with A=1 positions shown |
| `r.code.analogy` — Analogy & Odd One Out | relation mapper (options hidden until named) |
| **Unit 6 — Logic & Deduction** | |
| `r.log.sets` — Three Kinds of Set | four-zone set sorter |
| `r.log.syllogism` — Syllogism Basics | flip between arrangements of one pair of statements |
| `r.log.break` — Breaking a Conclusion | slide C and hunt for a counterexample |
| `r.log.venn3` — Venn for Three Categories | three-set diagram picker |
| **Unit 7 — Visual Reasoning** | |
| `r.vis.count` — Figure Counting | click every sub-figure, size class by size class |
| `r.vis.mirror` — Mirror & Water Images | one source drawing, two reflection axes |
| `r.vis.fold` — Paper Folding & Punching | punch a folded packet, unfold and watch holes double |
| `r.vis.dice` — Cubes & Dice | slice a painted cube layer by layer |
| `r.vis.figseries` — Figure Series | isolate one attribute at a time |
| **Quants Unit 1** | |
| `q.num.estimate` — Estimate Before You Solve | round, compute, then see your error and its direction |
| `q.num.divis` — Divisibility & Factors | every test run on a real number, checked against the remainder |
| `q.num.lcm` — LCM & HCF | two numbers in primes; HCF takes the low power, LCM the high |
| `q.num.convert` — Fractions ⇄ Percents | flip cards, with the division actually performed |
| `q.num.powers` — Squares, Cubes & Roots | the 2n−1 gaps, and the digits a square can never end in |
| **Quants Unit 2** | |
| `q.pct.ladder` — The Percent Ladder | percent bar + estimation game |
| `q.pct.ratio` — Ratio & Proportion | segmented bar; change the parts, watch one part move |
| `q.pct.partner` — Partnership & Shares | drag the months, watch the profit leave the bigger cheque |
| `q.pct.profit` — Profit, Loss & Discount | cost / marked / selling as three bars on one scale |
| `q.pct.successive` — Successive Change | the honest net beside the naive sum of the percentages |
| **Quants Unit 3** | |
| `q.int.simple` — Simple Interest | the straight line, with the compound curve beside it |
| `q.int.compound` — Compound Interest | watch the curve leave the line, and measure the gap |
| `q.int.speed` — Time, Speed & Distance | set two of the three; the third is derived, in either unit |
| `q.int.trains` — Trains, Boats & Streams | same way or facing, and the time to clear each other |
| `q.int.work` — Work, Pipes & Cisterns | rates add and a leak subtracts, in whole units of work |
| **Quants Unit 4** | |
| `q.men.area` — Perimeter & Area | a rectangle on a unit grid; stretch it and count again |
| `q.men.circle` — Circles | why the radius is always a multiple of 7 |
| `q.men.paths` — Paths, Borders & Tiling | outer minus inner, inside, outside and crossing |
| `q.men.solids` — Volume & Surface Area | four solids, and the k² / k³ split side by side |
| **Quants Unit 5** | |
| `q.avg.centre` — Mean, Median & Mode | drag a value; the fulcrum follows, the median does not |
| `q.avg.weighted` — Weighted Average | two loads on a beam; it balances at the combined average |
| `q.avg.alligation` — Alligation | the same beam solved for the loads instead of the fulcrum |
| `q.avg.spread` — Range & Spread | two sets, one mean; shift leaves spread alone, scale does not |
| **Quants Unit 6** | |
| `q.cnt.multiply` — The Counting Principle | one slot per decision, with every outcome listed while it fits |
| `q.cnt.perm` — Permutations | every ordering shown, then the duplicates struck out |
| `q.cnt.comb` — Combinations | the same list grouped, so the r! division is seen not told |
| `q.cnt.prob` — Probability Basics | all 36 dice outcomes, with the event picked out in place |
| `q.cnt.dice` — Dice, Cards & Coins | the whole deck, and why "king or heart" is 16 not 17 |
| **Quants Unit 7** | |
| `q.di.tables` — Reading Tables | pick a question, watch only the cells it needs light up |
| `q.di.bars` — Bar & Line Charts | the same data as bars and as a line, and why both exist |
| `q.di.pie` — Pie Charts | one slice as degrees, percentage and rupees at once |
| `q.di.caselet` — Caselets & Mixed Sets | the paragraph, turned into the grid it was hiding |
| `q.di.speed` — DI Under Time Pressure | the possible-worlds engine, applied to a chart |

**Both academies are complete — 65 lessons in all**, 32 in Reasoning and 33 in Quants, seven
units each.

Each unit is built around one idea rather than a list of formulas. Quants Unit 2 returns three
times to the same point — a percentage means nothing until you name the base it sits on. Unit 3
is one rate-times-time idea in three costumes. Unit 4 is scaling: k, k², k³. Unit 5 is the mean
as a balance point, with alligation the same balance read backwards. And Unit 7 ends by applying
the Reasoning academy's possible-worlds engine to a chart, because a chart is a statement made of
numbers and commits you only to what it says.
Every tile on both paths is now playable; nothing shows *Coming soon*.

### Unit 1 derives too — from possible worlds instead of geometry

Foundations is the only text-heavy unit, with no diagram to compute from. It gets a different
thing to derive from: a finite space of **possible worlds**. A statement fixes the atoms it
actually asserts and leaves the rest free; enumerating every assignment of the free atoms gives
every situation the statement permits. Then one construction settles all four question types:

- a **conclusion follows** iff it is true in every permitted world — otherwise the widget hands
  you the counterexample;
- an **assumption is needed** iff denying it leaves no permitted world where the plan still
  reaches its goal (the negation test, mechanised);
- an **argument is strong** iff flipping it changes, somewhere, whether the goal is reached;
- a **course of action follows** iff its node is on the stated causal chain, the named actor has
  power at that node, and it does not remove what people depend on without a replacement.

Change a model and the verdicts move with it, so a Unit 1 lesson can no more disagree with its
own widget than a syllogism can disagree with its circles.

### Visual widgets derive, they do not assert

Figure counts come from the **enumerated polygon list**, so the number on screen is whatever the
list contains. Painted-cube groups are computed from position and must add back to n³. Unfolded
hole patterns are produced by reflecting punches across each crease in reverse order — the very
method the lesson teaches. None of these stores an answer that could drift from its picture.

### Logic widgets judge from geometry

The syllogism widgets never store "this conclusion follows". They compute every statement and
the conclusion from the **actual circle positions on screen**, so the verdict and the picture
cannot disagree. That is the property you want when the entire subject is *trust the drawing* —
and it means the harness can check any arrangement a lesson ships.

### The circular-seating convention

Derived, never memorised, because a memorised version gets reversed under pressure:

> Sit at the **north** seat facing the centre — you are facing **South**. Facing South your left
> hand points **East**, and north → east is the **clockwise** way round the table.
> So **facing the centre, left is clockwise**; facing outward, everything reverses.

The original `modules/seating-arrangement.html` had this backwards (and its circle puzzle was
built on the reversed rule). Both the rule card and the puzzle have been corrected.

**Explore checklists are sticky.** Once a task is achieved it stays ticked, because several
checklists ask for states that are mutually exclusive at any one instant ("end up diagonally
from the start" and "return to the starting point" can both be *done*, never both be *true*).

## Testing

```bash
node tools/verify-generators.js
```

Two suites in one run:

- **Generators** — loads the real `<script>` blocks from `modules/*.html` into a stub DOM and
  re-derives every generated answer independently (25,000 questions per run).
- **Kinship naming** — the pure logic behind the Generation Ladder, over 23 relation chains.
  Guards the bug where a sibling step mid-chain hid the climb and turned a cousin into a sister.
- **Compass and walks** — turn rules, shadow rules, quadrant naming, and every walk used in
  Space & Direction re-derived from its leg list. A lesson whose keyed answer drifts from the
  turn rules fails here rather than in front of a student.
- **Visual reasoning** — each figure's enumerated sub-figures must match its stated answer and
  contain no duplicates; painted-cube groups must partition n³ for every n; n folds and one punch
  must give exactly 2ⁿ holes, all inside the sheet, with a punch **on** a crease giving half that;
  and the mirror/water letter sets are cross-checked (only H, I, O, X survive both).
- **Logic and sets** — every syllogism arrangement a lesson ships must actually satisfy its
  statements; a lesson claiming "does not follow" must ship a drawing where the conclusion fails,
  and one claiming "follows" must ship none. The counterexample hunter is checked to be genuinely
  breakable within its slider range.
- **Codes and series** — every coded word quoted in Unit 5 is re-encoded from the family the
  lesson names (and each family must detect its own output), and every series is checked against
  the rule the lesson claims for it. Letter series are additionally checked for staying inside A–Z.
- **Arrangement puzzles** — every seating, floor and scheduling puzzle is brute-forced over all
  permutations and must have **exactly one** solution (a circle allows its *n* rotations). Zero
  solutions means unsolvable — which shipped once — and more than one means the stated answer
  isn't forced. Each reveal's arrangement is re-tested against its own clues, which is what
  catches a reversed circular convention.
- **Explore gates** — every task on every checklist must be satisfiable by some state the widget
  can actually reach. See below for how the widgets the learner *builds* are covered too.

### Widgets export a machine, so a gate can be proved reachable

An explore checklist that no widget state can satisfy is invisible: nothing errors, the task
simply never ticks. So every gate is checked against real widget states rather than trusted.

Widgets whose settings are a list — a slider, a set of views — could always be swept by
enumerating those settings. The others could not: a family tree, a walk, a seating grid has no
list of settings, only a history of what the learner did to it. Those nineteen lessons used to be
exempt.

They are not any more. Each of those widgets now exports a pure **machine**:

```js
export function turnDialMachine({ start = 'N' } = {}) {
  return {
    init: { face: start, log: [], seen: [start] },
    actions: ['L', 'R', 'U', 'X'],       // what the learner can press
    act(st, a) { /* … returns the next state … */ },
    report: st => ({ /* … what the lesson's tasks read … */ }),
  };
}
```

The DOM layer holds no state of its own — a click is `st = M.act(st, 'L')` and a redraw ends in
`api.report?.(M.report(st))`. The harness then walks that machine breadth-first from `init`,
applying every action and keeping the states it has not seen, so **reachability is established
against the same transition function the learner clicks.** Around 220,000 states per run.

Three rules keep it honest, and each is itself checked:

- A widget with a machine must report **through** it. An `api.report?.({ … })` literal in such a
  widget is a harness failure, because it would mean the sweep is exercising code nobody runs.
- Where a widget's input is genuinely open — the family tree takes any two names you type — the
  reduction is in the **enumeration**, not in the widget: `act` still accepts anything, while
  `actions` offers a small stated cast. A smaller alphabet can only make a gate look unreachable,
  never the reverse.
- Depth, and the rare breadth cap, are stated per widget and **printed when they bite**. A
  truncated walk is reported, not passed over quietly.
