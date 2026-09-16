/* ============================================================
   Reasoning · Unit 7 · Lesson 3 — Paper Folding & Punching
   ============================================================ */

import { paperFold } from '../widgets/paper-fold.js';

const FOLDS = ['rightOntoLeft', 'bottomOntoTop'];

export default {
  id: 'r.vis.fold',
  title: 'Paper Folding & Punching',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.vis.dice',
  nextLabel: 'Next: Cubes & Dice →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'One punch. How many holes?',
      say: `Take a square sheet. Fold the right half onto the left. Fold the bottom half onto the top.
            Now punch <b>one</b> hole through the folded packet and open it out.<br><br>
            How many holes are in the sheet? And — the part that actually earns the mark —
            <b>where are they?</b><br><br>
            Both answers come from one rule, applied backwards.`,
      cta: 'Give me the rule',
    },
    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Unfold in reverse, mirroring at every crease',
      say: `Do not try to imagine the final sheet. Imagine <b>one crease at a time</b>, in the
            opposite order to the folding.`,
      body: `
        <p><b>The count is the easy half.</b> Each fold doubles the paper under the punch, so each
           fold doubles the holes:</p>
        <ul>
          <li>1 fold, 1 punch → <b>2</b> holes · 2 folds → <b>4</b> · 3 folds → <b>8</b></li>
          <li>In general, <b>2ⁿ</b> holes for n folds — unless a hole sits exactly on a crease,
              in which case two copies coincide and you get fewer.</li>
        </ul>
        <p><b>The positions are the half that carries the marks.</b> Undo the folds in reverse order.
           At each unfold, every hole you already have <b>mirrors across that crease</b>, and you keep
           both the original and the mirror image.</p>
        <ol>
          <li>Start with the punch as it sits in the folded packet.</li>
          <li>Undo the <em>last</em> fold. Reflect every hole across that crease. Now you have twice as many.</li>
          <li>Undo the fold before it. Reflect everything again — including the copies you just made.</li>
          <li>Continue until the sheet is flat.</li>
        </ol>
        <p>The order matters: unfolding in the same order as the folding gives the wrong pattern.
           Reverse order, always.</p>`,
      cta: 'Let me fold one',
    },
    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Punch it, then open it out',
      say: `The shaded region is the folded packet — click inside it to punch. Then unfold and watch
            each crease double what you have. Try two folds, then try three.`,
      widget: paperFold({ folds: FOLDS }),
      __cfg: { folds: FOLDS },
      tasks: [
        { label: 'Punch a hole in the folded packet', done: s => s.punches >= 1 },
        { label: 'Unfold it and count the holes', done: s => s.unfolded },
        { label: 'Try a version with <b>two or more</b> folds', done: s => s.triedTwoFolds },
      ],
      onComplete: 'Every crease mirrored what was already there. That is the whole technique.',
      ctaDone: 'Test me',
    },
    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'hole-doubling', conceptLabel: 'Each fold doubles the holes',
      say: `Commit first. Count the folds, not the picture.`,
      context: `A square sheet is folded in half <b>three times</b>, then <b>one</b> hole is punched
                through the folded packet, away from any crease.`,
      q: 'How many holes are in the opened sheet?',
      options: ['3', '6', '8', '16'],
      answer: 2,
      whyRight: `Correct. Each fold doubles the thickness under the punch, so three folds give
                 2 × 2 × 2 = <b>8</b> layers — and one punch goes through all eight.`,
      whyWrong: `Each fold <b>doubles</b> the number of layers the punch passes through.<br><br>
                 One fold → 2 layers. Two folds → 4. Three folds → <b>8</b>.<br><br>
                 So one punch makes <b>8</b> holes: 2³. Answering 6 adds the folds (3 × 2) instead of
                 doubling; answering 16 is 2⁴, one fold too many.`,
    },
    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The hook, unfolded properly',
      say: `Two folds, one punch — and the positions, not just the count.`,
      steps: [
        `<b>Fold 1: right onto left.</b> The sheet is now a tall half-width rectangle, and the crease runs down the middle vertically.`,
        `<b>Fold 2: bottom onto top.</b> Now a quarter-size packet in the top-left, with a horizontal crease across the middle.`,
        `<b>Punch once, then undo fold 2 first.</b> Reflect the hole across the <em>horizontal</em> crease. Two holes, one above the other, both in the left half.`,
        `<b>Now undo fold 1.</b> Reflect <em>both</em> holes across the <em>vertical</em> crease. Four holes — and they sit in a symmetric block, one in each quadrant, mirrored about both centre lines.`,
      ],
      takeaway: `Count with 2ⁿ. Place by unfolding in reverse, reflecting everything you already have at each crease.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'crease-coincidence', conceptLabel: 'Holes that land on a crease',
      context: `A sheet is folded in half <b>twice</b>, and one hole is punched <b>exactly on the
                last crease</b>.`,
      q: 'How many holes appear when it is opened?',
      options: ['4', '2', '1', '8'],
      answer: 1,
      why: `Normally two folds give 2² = 4 holes. But a hole sitting <b>on</b> a crease is its own
            mirror image across that crease — the reflection lands on top of the original instead of
            beside it.<br><br>
            So that fold does not double anything, and only the other fold does: <b>2</b> holes.<br><br>
            This is the one exception to 2ⁿ, and papers use it precisely because candidates apply the
            formula without looking at where the punch sits.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'reverse-order', conceptLabel: 'Unfolding in reverse order',
      context: `A sheet is folded <b>bottom onto top</b>, then <b>right onto left</b>, and a hole is
                punched near the centre of the packet.`,
      q: 'Which crease do you mirror across first when unfolding?',
      options: ['The horizontal one, because it was folded first',
                'The vertical one, because it was folded last',
                'Either — the order does not matter',
                'Both at once'],
      answer: 1,
      why: `Unfolding reverses the folding, so the <b>last</b> fold is the <b>first</b> to be undone —
            here the vertical crease from "right onto left".<br><br>
            Order genuinely matters for the final <em>positions</em>. Undoing in the wrong order can
            place the holes in the wrong quadrants even though the count comes out right, and the
            options in these questions are built to catch exactly that.`,
    },
    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'hole-doubling', conceptLabel: 'Each fold doubles the holes',
      say: `The sheet from the start.`,
      context: `A square is folded <b>right half onto left</b>, then <b>bottom half onto top</b>,
                then punched <b>once</b> away from any crease.`,
      q: 'What does the opened sheet look like?',
      options: ['2 holes, side by side', '4 holes, one in each quadrant',
                '4 holes, all in the left half', '8 holes in a ring'],
      answer: 1,
      whyRight: `Exactly. Two folds → 2² = <b>4</b> holes. Undoing the horizontal crease gives a
                 mirrored pair vertically; undoing the vertical crease mirrors that pair across —
                 leaving <b>one hole in each quadrant</b>, symmetric about both centre lines.`,
      whyWrong: `<b>Count:</b> two folds double twice, so 2² = <b>4</b> holes.<br><br>
                 <b>Positions:</b> undo the last fold first. Reflecting across the horizontal crease
                 gives two holes stacked in the left half. Then reflecting <em>both</em> across the
                 vertical crease sends copies into the right half.<br><br>
                 The result is <b>one hole in each quadrant</b>. "All in the left half" forgets the
                 second unfold entirely.`,
    },
  ],
};
