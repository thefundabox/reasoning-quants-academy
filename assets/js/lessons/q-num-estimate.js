/* ============================================================
   Quants · Unit 1 · Lesson 1 — Estimate Before You Solve
   ============================================================ */

import { estimateLab } from '../widgets/number-lab.js';

const ROUNDS = {
  rounds: [
    { q: 'About how much is <b>4,860 ÷ 19</b>?',
      hint: '19 is almost 20, and dividing by 20 is halving then dividing by 10',
      exact: 4860 / 19, tol: 10,
      why: `4,860 ÷ 20 = 243. You rounded the <em>divisor up</em>, so your estimate is a little
            <b>too small</b> — the true value is just above it.` },
    { q: 'About how much is <b>38 × 21</b>?',
      hint: 'push 38 up to 40 and pull 21 down to 20',
      exact: 38 * 21, tol: 10,
      why: `40 × 20 = 800. One number went up and the other came down, so the errors partly cancel
            — this estimate is within a quarter of a percent.` },
    { q: 'About how much is <b>6,970 ÷ 34</b>?',
      hint: 'nudge both: 7,000 ÷ 35',
      exact: 6970 / 34, tol: 10,
      why: `7,000 ÷ 35 = 200, and the exact answer is 205. Rounding the divisor up again cost you
            about 2%.` },
    { q: 'A prize of <b>₹1,197</b> is shared equally by <b>3</b> people. Roughly how much each?',
      hint: '1,197 is almost 1,200',
      exact: 1197 / 3, tol: 10,
      why: `1,200 ÷ 3 = 400, and the true share is ₹399. Rounding the number being divided
            <em>up</em> makes the estimate too <b>big</b> — the opposite direction from before.` },
  ],
};

export default {
  id: 'q.num.estimate',
  title: 'Estimate Before You Solve',
  xp: 30,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.num.divis',
  nextLabel: 'Next: Divisibility & Factors →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'You are given four answers. Three are absurd.',
      say: `<b>4,860 ÷ 19</b> — and the options are 195, 256, 312 and 405.<br><br>
            You could do the long division. It will take you ninety seconds and you will probably
            make a slip.<br><br>
            Or: 19 is nearly 20, and <b>4,860 ÷ 20 = 243</b>. Only one option is anywhere near 243.
            Four seconds, no working, and the mark is yours.`,
      cta: 'Teach me to do that',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Round, compute, and know which way you leaned',
      say: `Estimation is not guessing. It is exact arithmetic on a rounder number, plus one
            piece of bookkeeping: <b>which direction did you push?</b>`,
      body: `
        <p><b>The three moves.</b></p>
        <ol>
          <li><b>Round to something you can divide by in your head</b> — a multiple of 10, 20, 25 or
              50. 19 → 20. 34 → 35. 1,197 → 1,200.</li>
          <li><b>Do the easy sum exactly.</b> 4,860 ÷ 20 = 243. Never estimate the estimate.</li>
          <li><b>Note the lean.</b> This is the step everyone skips, and it is the one that turns a
              rough number into a decision.</li>
        </ol>
        <p><b>The direction rule, and it is worth owning outright:</b></p>
        <ul>
          <li>Round the <b>divisor up</b> → your estimate is <b>too small</b>. (You shared among more
              people than there really were.)</li>
          <li>Round the <b>divisor down</b> → your estimate is <b>too big</b>.</li>
          <li>Round the number being divided <b>up</b> → estimate <b>too big</b>; down → too small.</li>
          <li>In a multiplication, push one factor up and the other down — the errors partly cancel
              and you land remarkably close.</li>
        </ul>
        <p>So "about 243, and the truth is a bit more" is far stronger than "about 243". It rules
           out 195 <em>and</em> tells you which side of 243 to look on.</p>
        <p><b>When to stop estimating.</b> If two options sit within a few per cent of each other,
           the estimate has done its job of eliminating the rest — now compute, but only between
           the two survivors.</p>`,
      cta: 'Let me try four',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Four estimates, ten seconds each',
      say: `Round first, then type what you get. I will show you the exact value and how far off
            you were.<br><br>
            Anything inside <b>10%</b> counts. You are not trying to be right — you are trying to
            be close enough to throw options away.`,
      widget: estimateLab(ROUNDS),
      __cfg: ROUNDS,
      tasks: [
        { label: 'Work through all four', done: s => s.finished },
      ],
      onComplete: 'That is the habit. It costs seconds and it saves minutes.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'estimate-direction', conceptLabel: 'Knowing which way your rounding leaned',
      say: `The bookkeeping step. Commit.`,
      context: `To estimate <b>4,860 ÷ 19</b> you rounded <b>19 up to 20</b> and got <b>243</b>.`,
      q: 'What do you know about the true answer?',
      options: [
        'It is a little less than 243',
        'It is a little more than 243',
        'It is exactly 243',
        'Nothing — the estimate says nothing about direction',
      ],
      answer: 1,
      whyRight: `Correct. Dividing by 20 splits the total among <em>more</em> shares than dividing
                 by 19, so each share came out smaller. The truth — 255.79 — sits above your 243.`,
      whyWrong: `Think about what dividing means. You shared 4,860 among <b>20</b> when really there
                 were only <b>19</b>.<br><br>
                 More people, smaller share. So your 243 is an <b>underestimate</b>, and the true
                 answer is <b>above</b> it — 255.79, in fact.<br><br>
                 This matters: with options 195, 256, 312 and 405, "about 243 and probably a bit
                 more" points straight at <b>256</b>, while "about 243" on its own might have
                 tempted you toward 195.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Four estimates, and what each one leaned',
      say: `The arithmetic is trivial. The direction is the skill.`,
      steps: [
        `<b>4,860 ÷ 19 → use 20.</b> 4,860 ÷ 20 = <b>243</b>. Divisor rounded <em>up</em>, so the
         estimate is too small. True value 255.79 — about 5% above.`,
        `<b>38 × 21 → use 40 × 20.</b> That is <b>800</b>, against a true 798. One factor up, one
         down, and the errors almost cancel: an error of <b>0.25%</b>.`,
        `<b>6,970 ÷ 34 → use 7,000 ÷ 35.</b> That is <b>200</b>, and the truth is exactly 205.
         Both numbers were nudged up, but the divisor's move mattered more, so again the estimate
         sits low.`,
        `<b>₹1,197 ÷ 3 → use 1,200 ÷ 3.</b> That is <b>₹400</b> against a true ₹399. Here the
         <em>dividend</em> went up, so this estimate is too <b>big</b> — the opposite lean from the
         first one.`,
        `<b>Read the pattern.</b> Rounding the thing being divided and rounding the thing you divide
         by push the answer in opposite directions. Once you feel that, an estimate stops being
         approximate and starts being a bound.`,
      ],
      takeaway: `Round to a number you can compute with exactly, then ask "did I make the answer
                 bigger or smaller?". An estimate with a direction eliminates options that a bare
                 estimate cannot.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'estimate-eliminate', conceptLabel: 'Using an estimate to throw options away',
      context: `<b>6,970 ÷ 34</b>`,
      q: 'Which option can you reach without dividing?',
      options: ['145', '205', '285', '340'],
      answer: 1,
      whyRight: `Yes. 7,000 ÷ 35 = 200, so the answer sits near 200 — and only one option does.
                 (It is exactly 205, as it happens.)`,
      whyWrong: `Round both to friendly numbers: <code>7,000 ÷ 35 = 200</code>.<br><br>
                 That single line eliminates 145, 285 and 340 outright — they are 27%, 43% and 70%
                 away from 200, and rounding by less than 1% cannot possibly move the answer that
                 far.<br><br>
                 <b>205</b> is the only survivor, and no long division was needed to find it.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'estimate-multiply', conceptLabel: 'Opposite rounding in a multiplication',
      input: 'number', answer: 800, unit: 'as your estimate',
      context: `You need a fast estimate of <b>38 × 21</b>. Push one factor up and pull the other
                down to the nearest ten.`,
      q: 'What estimate does that give?',
      why: `38 rounds up to <b>40</b>, 21 rounds down to <b>20</b>, and <code>40 × 20 = 800</code>.<br><br>
            The true product is <b>798</b> — an error of a quarter of one per cent.<br><br>
            This is why opposite rounding is worth doing deliberately in a multiplication: you added
            about 5% to one factor and took about 5% off the other, and the two almost exactly
            undo each other.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'estimate-direction', conceptLabel: 'Knowing which way your rounding leaned',
      say: `One question, no calculation allowed.`,
      context: `A district has <b>4,860</b> polling staff to be sent to <b>19</b> centres, equally.
                A clerk reports that each centre receives <b>312</b> staff.`,
      q: 'Without dividing, how do you know the clerk is wrong?',
      options: [
        '312 × 19 is obviously not 4,860',
        '4,860 ÷ 20 is 243, and using a bigger divisor can only have made that too small — but 312 is far above it',
        'The number of staff should be divisible by the number of centres',
        'You cannot tell without doing the division',
      ],
      answer: 1,
      whyRight: `Exactly the reasoning. 243 is a floor you got for free, and the truth sits only
                 slightly above it — around 256, nowhere near 312.`,
      whyWrong: `The point of the estimate is that it bounds the answer, so a wrong figure can be
                 rejected without ever computing the right one.<br><br>
                 <code>4,860 ÷ 20 = 243</code>, and because you divided by <b>more</b> centres than
                 there really are, the true share is a little <b>above</b> 243 — not far above, since
                 20 is within about 5% of 19.<br><br>
                 312 is nearly <b>30%</b> above 243. No 5% adjustment reaches it, so the clerk is
                 wrong and you know it in four seconds.<br><br>
                 "You cannot tell without dividing" is the instinct this whole lesson exists to
                 break. And divisibility is irrelevant — 4,860 need not divide evenly by 19 at all.`,
    },
  ],
};
