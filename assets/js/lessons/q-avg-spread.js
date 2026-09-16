/* ============================================================
   Quants · Unit 5 · Lesson 4 — Range & Spread
   ============================================================ */

import { spreadCompare } from '../widgets/stat-lab.js';

const SETS = {
  sets: [
    { label: 'Village A', values: [48, 49, 50, 51, 52] },
    { label: 'Village B', values: [10, 30, 50, 70, 90] },
  ],
  min: 0, max: 100,
};

export default {
  id: 'q.avg.spread',
  title: 'Range & Spread',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.cnt.multiply',
  nextLabel: 'Next unit: The Counting Principle →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Two villages, one average, nothing alike',
      say: `Village A's five rainfall readings: <b>48, 49, 50, 51, 52</b> cm.<br>
            Village B's five: <b>10, 30, 50, 70, 90</b> cm.<br><br>
            Both average <b>50 cm</b>. On paper they are identical.<br><br>
            One has a dependable season. The other has droughts and floods. The average cannot tell
            you which is which — and that is what this lesson is for.`,
      cta: 'How do I measure the difference?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Two ways to say how scattered',
      say: `A centre tells you where the values sit. A measure of <b>spread</b> tells you how
            tightly they cluster around it — and a summary with only a centre is half a summary.`,
      body: `
        <ul>
          <li><b>Range = largest − smallest.</b> Instant to compute, and crude: it uses only two of
              the values and ignores everything in between. Village A's range is <b>4</b>; Village
              B's is <b>80</b>.</li>
          <li><b>Mean deviation</b> — find the mean, take how far each value sits from it (ignoring
              sign), and average those distances. It uses every value. For Village A that is
              <code>(2 + 1 + 0 + 1 + 2) ÷ 5 = <b>1.2</b></code>; for Village B,
              <code>(40 + 20 + 0 + 20 + 40) ÷ 5 = <b>24</b></code>.</li>
        </ul>
        <p>By mean deviation, Village B is <b>twenty times</b> as scattered. The range said twenty
           times too — but the range can be badly fooled by one freak reading, while the mean
           deviation cannot.</p>
        <p><b>Two behaviours worth knowing outright</b>, because they get asked directly:</p>
        <ul>
          <li><b>Add a constant to every value</b> — the mean moves by that amount and the
              <b>spread does not change at all</b>. Sliding the whole picture sideways cannot make
              the values more or less alike.</li>
          <li><b>Multiply every value by a constant</b> — the mean <b>and</b> the spread are both
              multiplied. Stretching the picture stretches the gaps too.</li>
        </ul>
        <p><b>And the caution about range.</b> Two sets can share a mean <em>and</em> a range and
           still be quite different: 10, 50, 50, 90 and 10, 10, 90, 90 both average 50 with a range
           of 80, yet their mean deviations are <b>20</b> and <b>40</b>. The range only ever looks
           at the two ends.</p>`,
      cta: 'Let me compare them',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Same mean, different picture',
      say: `Both strips have their mean marked in the same place. Only the scatter differs.<br><br>
            Now use the controls: <b>add</b> to every value and watch the spread refuse to move,
            then <b>multiply</b> and watch it stretch.`,
      widget: spreadCompare(SETS),
      __cfg: SETS,
      tasks: [
        { label: 'Add a constant and confirm the spread is <b>unchanged</b>', done: s => s.spreadUnchangedByShift },
        { label: 'Multiply the values and watch the spread <b>stretch</b>', done: s => s.triedScale },
        { label: 'Return to the original sets', done: s => s.backToOriginal && s.triedShift },
      ],
      onComplete: `Shifting moves the centre and leaves the shape alone. Scaling changes both. That
                   is the whole behaviour of every spread measure there is.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'spread-mean-dev', conceptLabel: 'Mean deviation uses every value',
      input: 'number', answer: 1.2, unit: 'cm', tol: 0.001,
      say: `Village A. Distances from the mean, averaged.`,
      context: `Village A's readings are <b>48, 49, 50, 51, 52</b> cm, with a mean of <b>50</b>.`,
      q: 'What is the mean deviation?',
      whyRight: `Correct. The distances are 2, 1, 0, 1, 2 — a total of 6 — and
                 <code>6 ÷ 5 = <b>1.2 cm</b></code>.`,
      whyWrong: `Take each value's distance from the mean of 50, <b>ignoring the sign</b>:<br><br>
                 <code>|48−50| = 2 · |49−50| = 1 · |50−50| = 0 · |51−50| = 1 · |52−50| = 2</code><br><br>
                 Total <code>6</code>, across 5 readings: <code>6 ÷ 5 = <b>1.2</b></code>.<br><br>
                 If you answered <b>0</b>, you kept the signs — and the signed deviations always sum
                 to zero, for every data set, which is precisely why the absolute value is taken.
                 That cancellation is the balance-point property from the first lesson of this
                 unit, seen from another angle.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The two villages, measured',
      say: `Same centre, and everything else different.`,
      steps: [
        `<b>Village A.</b> Mean <b>50</b>, range <code>52 − 48 = <b>4</b></code>, mean deviation
         <code>(2+1+0+1+2) ÷ 5 = <b>1.2</b></code>. A dependable season.`,
        `<b>Village B.</b> Mean <b>50</b>, range <code>90 − 10 = <b>80</b></code>, mean deviation
         <code>(40+20+0+20+40) ÷ 5 = <b>24</b></code>. Twenty times the scatter, on an identical
         average.`,
        `<b>Add 5 cm to every A reading.</b> The mean becomes <b>55</b>; the range is still
         <b>4</b> and the mean deviation still <b>1.2</b>. The whole picture slid sideways, so
         nothing about the scatter changed.`,
        `<b>Multiply every A reading by 3.</b> The mean becomes <b>150</b>, the range <b>12</b>, the
         mean deviation <b>3.6</b> — all tripled. Stretching the picture stretches the gaps.`,
        `<b>And the warning about range.</b> 10, 50, 50, 90 and 10, 10, 90, 90 share a mean of 50
         and a range of 80. But their mean deviations are <b>20</b> and <b>40</b>: the second set
         has nothing in the middle at all. The range never looked.`,
      ],
      takeaway: `Range is the two ends; mean deviation is every value. Adding a constant moves the
                 centre and leaves the spread alone; multiplying scales both. A mean quoted without
                 a spread is a summary you should not trust.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'spread-shift', conceptLabel: 'Shifting moves the centre, not the spread',
      context: `Every reading in a data set is increased by <b>5</b>.`,
      q: 'What happens to the mean and the range?',
      options: [
        'Both increase by 5',
        'The mean increases by 5; the range is unchanged',
        'The mean is unchanged; the range increases by 5',
        'Both are unchanged',
      ],
      answer: 1,
      whyRight: `Correct. Sliding every value the same distance moves the balance point with them,
                 but the <em>gaps</em> between values are untouched — so the range does not move.`,
      whyWrong: `Picture the values sliding along the line together.<br><br>
                 <b>The mean</b> is the balance point, so it slides too: it increases by <b>5</b>.<br><br>
                 <b>The range</b> is largest minus smallest. Both ends rose by 5, so the difference
                 is exactly what it was: <code>(max + 5) − (min + 5) = max − min</code>.
                 <b>Unchanged.</b><br><br>
                 On 48–52: the mean goes 50 → 55, and the range stays at 4.<br><br>
                 The same holds for mean deviation, and for standard deviation. Only
                 <em>multiplying</em> changes a spread.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'spread-scale', conceptLabel: 'Multiplying scales both centre and spread',
      input: 'number', answer: 12, unit: 'the new range',
      context: `A data set has a mean of <b>50</b> and a range of <b>4</b>. Every value is then
                <b>multiplied by 3</b>.`,
      q: 'What is the new range?',
      why: `Multiplying stretches the whole picture, gaps included.<br><br>
            <code>new range = 3 × 4 = <b>12</b></code><br><br>
            The mean triples too, from 50 to <b>150</b>, and the mean deviation triples from 1.2 to
            3.6.<br><br>
            Contrast this with adding: adding 3 to every value would leave the range at 4 and move
            the mean to 53. <b>Adding shifts; multiplying scales.</b> Every question about
            transforming a data set is one of those two.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'spread-range-crude', conceptLabel: 'Range only ever looks at the two ends',
      say: `Last question of the unit. Both sets have the same mean <em>and</em> the same range.`,
      context: `<b>Set P:</b> 10, 50, 50, 90 &nbsp;·&nbsp; <b>Set Q:</b> 10, 10, 90, 90<br><br>
                Both have a mean of <b>50</b> and a range of <b>80</b>.`,
      q: 'What does the mean deviation tell you that the range cannot?',
      options: [
        'Nothing — identical mean and range means identical spread',
        'That Q is twice as scattered, because its values all sit far from the centre while P has two at the centre',
        'That P is twice as scattered, because it has more distinct values',
        'That the two sets have different medians',
      ],
      answer: 1,
      whyRight: `Exactly. P's mean deviation is <b>20</b> and Q's is <b>40</b>. P has two readings
                 sitting right on the mean; Q has none anywhere near it.`,
      whyWrong: `Compute both and the difference is stark.<br><br>
                 <b>Set P</b> — distances from 50: <code>40, 0, 0, 40</code> → total 80 →
                 <code>80 ÷ 4 = <b>20</b></code>.<br>
                 <b>Set Q</b> — distances from 50: <code>40, 40, 40, 40</code> → total 160 →
                 <code>160 ÷ 4 = <b>40</b></code>.<br><br>
                 The range saw only 10 and 90 in both cases and reported 80 twice. It never looked
                 at the two middle values — and in P those two sit exactly on the mean, which is
                 what halves the scatter.<br><br>
                 (Their medians are both 50, so that is not the difference either.)<br><br>
                 This is the case for preferring a measure that uses every value: the range is fast,
                 and it is blind to everything between the extremes.`,
    },
  ],
};
