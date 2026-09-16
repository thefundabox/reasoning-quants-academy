/* ============================================================
   Quants · Unit 2 · Lesson 5 — Successive Change
   ============================================================ */

import { successiveChain } from '../widgets/trade-bar.js';

const SWING = {
  base: 1000,
  steps: [40, -40],
  labels: ['First change', 'Second change'],
  unit: '₹',
};

export default {
  id: 'q.pct.successive',
  title: 'Successive Change',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.int.simple',
  nextLabel: 'Next unit: Simple Interest →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Up forty, down forty, and you are poorer',
      say: `A share costs <b>₹1,000</b>. On Monday it rises <b>40%</b>. On Tuesday it falls
            <b>40%</b>.<br><br>
            You are back where you started. Everyone says so.<br><br>
            You are at <b>₹840</b>. You have lost <b>16%</b>, and you will lose it every single
            time — because the fall was measured against a bigger number than the rise was.`,
      cta: 'Show me why',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Stop adding percentages. Multiply factors.',
      say: `A percentage change is not a number you add. It is a number you <b>multiply by</b> —
            and multiplication does not care what order you use, but it certainly does not add up.`,
      body: `
        <p>Turn every change into its factor: <b>+40%</b> is <code>1.40</code>, <b>−40%</b> is
           <code>0.60</code>, <b>−20%</b> is <code>0.80</code>. Then just multiply along the chain.</p>
        <p><code>1000 × 1.40 × 0.60 = 840</code>. The net factor is
           <code>1.40 × 0.60 = 0.84</code>, which is a <b>16% fall</b>. Adding +40 and −40 gives
           zero, and zero is simply the wrong answer.</p>
        <p><b>If you prefer a formula</b>, two changes of a% and b% combine to
           <code>a + b + ab/100</code> percent. For +40 and −40:
           <code>40 − 40 + (40 × −40)/100 = −16</code>. It is the same multiplication, unpacked.</p>
        <p><b>Two results worth memorising outright.</b></p>
        <ul>
          <li><b>Up x% then down x% always loses <code>x²/100</code> percent.</b> ±10 → 1% lost.
              ±20 → 4%. ±40 → 16%. It is never zero, and it is always a loss whichever order you
              apply them in.</li>
          <li><b>To undo a fall of x%, you need more than x% back.</b> After a 20% cut you are at
              0.8, and <code>1 ÷ 0.8 = 1.25</code> — you need <b>25%</b>, not 20%.</li>
        </ul>
        <p>This is the same idea as the last lesson: <em>each percentage is taken of a different
           base</em>. Markup and discount was one instance; this is the general case.</p>`,
      cta: 'Let me try to get back to zero',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Try to return to where you started',
      say: `₹1,000, then two changes you control. The honest net sits beside the naive sum of the
            percentages, so you can watch the gap open.<br><br>
            See if you can get back to exactly ₹1,000 — and notice what you have to do to
            manage it.`,
      widget: successiveChain(SWING),
      __cfg: SWING,
      tasks: [
        { label: 'Set equal and opposite changes, and see the loss', done: s => s.triedEqualOpposite && s.sawGap },
        { label: 'Open a gap of <b>4 points or more</b> from the naive sum', done: s => s.sawBigGap },
        { label: 'Get back to exactly <b>₹1,000</b>', done: s => s.returnedToStart },
      ],
      onComplete: `The only ways back are to change nothing, or to raise by more than you cut.
                   Equal and opposite never returns you home.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'succ-multiply', conceptLabel: 'Multiply the factors, never add the percentages',
      input: 'number', answer: 840, unit: 'rupees',
      say: `The share from the start. Commit to a number.`,
      context: `<b>₹1,000</b>, up <b>40%</b> on Monday, down <b>40%</b> on Tuesday.`,
      q: 'What is it worth on Tuesday evening?',
      whyRight: `Correct. <code>1000 × 1.40 = 1400</code>, then <code>1400 × 0.60 = 840</code>.
                 A 16% loss, from two changes that looked like they cancelled.`,
      whyWrong: `The two 40%s are taken of different numbers, so they cannot cancel.<br><br>
                 <b>Monday.</b> <code>1000 × 1.40 = ₹1,400</code>. The rise was 40% of
                 <b>1,000</b> — that is ₹400.<br><br>
                 <b>Tuesday.</b> <code>1400 × 0.60 = ₹840</code>. The fall was 40% of
                 <b>1,400</b> — that is ₹560, which is ₹160 more than the rise put in.<br><br>
                 Net: <code>1.40 × 0.60 = 0.84</code>, a <b>16% loss</b> — exactly
                 <code>40² ÷ 100</code>.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Where the missing money went',
      say: `Follow the rupees, not the percentages.`,
      steps: [
        `<b>The rise is 40% of 1,000.</b> That is ₹400, taking you to ₹1,400. Small base, small
         movement.`,
        `<b>The fall is 40% of 1,400.</b> That is ₹560, not ₹400. Bigger base, bigger movement —
         and the extra ₹160 is precisely the 16% you lost.`,
        `<b>As one factor.</b> <code>1.40 × 0.60 = 0.84</code>. Order does not matter:
         <code>0.60 × 1.40</code> is the same 0.84, so falling first and rising after loses exactly
         as much.`,
        `<b>The general result.</b> Up x% then down x% is <code>(1 + x/100)(1 − x/100) = 1 − x²/100²</code>
         — always a loss of <code>x²/100</code> percent. ±10 loses 1%, ±20 loses 4%, ±40 loses 16%.`,
        `<b>And to undo a cut.</b> After −20% you sit at 0.8 of where you were, so you need
         <code>1 ÷ 0.8 = 1.25</code> — a <b>25%</b> rise. The bigger the cut, the more lopsided this
         gets: after −50% you need +100% just to get level.`,
      ],
      takeaway: `Convert every percentage to a factor before you do anything. The chain is then a
                 single multiplication, and no base can be mistaken for another.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'succ-multiply', conceptLabel: 'Multiply the factors, never add the percentages',
      context: `The price of dal rises by <b>20%</b>. A household cuts its consumption by
                <b>20%</b>.`,
      q: 'What happens to what the household spends on dal?',
      options: [
        'It stays the same',
        'It falls by 4%',
        'It rises by 4%',
        'It falls by 40%',
      ],
      answer: 1,
      whyRight: `Yes. Spending is price × quantity, so the factor is
                 <code>1.20 × 0.80 = 0.96</code> — a <b>4% fall</b>, which is <code>20²/100</code>.`,
      whyWrong: `Expenditure is <b>price × quantity</b>, so the two changes multiply.<br><br>
                 <code>1.20 × 0.80 = 0.96</code> → spending falls by <b>4%</b>.<br><br>
                 "Stays the same" is the +20 − 20 = 0 error. The household actually comes out
                 slightly ahead, because the 20% cut is applied to the <em>raised</em> price and so
                 saves more than the rise cost.<br><br>
                 This is the same <code>x²/100</code> result as the share — here it happens to fall
                 in your favour.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'succ-restore', conceptLabel: 'Undoing a percentage cut',
      input: 'number', answer: 25, unit: 'percent',
      context: `A clerk's salary is <b>cut by 20%</b>. The office later agrees to restore it to
                exactly what it was before.`,
      q: 'By what percentage must the reduced salary now be raised?',
      why: `Not 20% — that is the reflex the question is built on.<br><br>
            After the cut the salary sits at <b>0.8</b> of the original. To get back to 1 you need
            to multiply by <code>1 ÷ 0.8 = 1.25</code>, which is a rise of <b>25%</b>.<br><br>
            Check on ₹10,000: cut 20% → ₹8,000. Raise 25% → 8,000 + 2,000 = ₹10,000. ✓<br><br>
            The raise is always the larger percentage, because it is applied to the smaller salary.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'succ-multiply', conceptLabel: 'Multiply the factors, never add the percentages',
      say: `Three changes this time. Do not add them.`,
      context: `A town's population is <b>10,000</b>. It rises <b>10%</b> in the first year, falls
                <b>10%</b> in the second, and rises <b>10%</b> again in the third.`,
      q: 'What is the population at the end of the third year?',
      options: ['11,000', '10,890', '10,000', '10,900'],
      answer: 1,
      whyRight: `Correct. <code>10000 × 1.1 × 0.9 × 1.1 = 10,890</code> — a net rise of 8.9%, not
                 the 10% that adding the changes would suggest.`,
      whyWrong: `Chain the factors: <code>1.1 × 0.9 × 1.1</code>.<br><br>
                 Year 1: <code>10,000 × 1.1 = 11,000</code><br>
                 Year 2: <code>11,000 × 0.9 = 9,900</code><br>
                 Year 3: <code>9,900 × 1.1 = <b>10,890</b></code><br><br>
                 <b>11,000</b> is what you get by adding +10 − 10 + 10 = +10% — the trap.<br><br>
                 The middle pair (+10 then −10) already costs you 1%, leaving 9,900 rather than
                 10,000; the final rise then works on that smaller number. Net: <b>+8.9%</b>.`,
    },
  ],
};
