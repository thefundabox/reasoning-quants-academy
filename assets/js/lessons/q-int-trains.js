/* ============================================================
   Quants · Unit 3 · Lesson 4 — Trains, Boats & Streams
   ============================================================ */

import { relativeSpeed } from '../widgets/rate-lab.js';

const TRAINS = { a: 54, b: 36, lenA: 150, lenB: 100, startOpposite: true };

export default {
  id: 'q.int.trains',
  title: 'Trains, Boats & Streams',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.int.work',
  nextLabel: 'Next: Work, Pipes & Cisterns →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Ten seconds, or fifty',
      say: `Two trains, <b>150 m</b> and <b>100 m</b> long.<br><br>
            Coming <b>toward</b> each other at 54 and 36 km/h, they are clear of each other in
            <b>10 seconds</b>.<br><br>
            Travelling the <b>same way</b> at 72 and 54 km/h — faster trains, both of them — it
            takes <b>50 seconds</b>.<br><br>
            Speed barely matters here. What matters is the speed <em>between</em> them.`,
      cta: 'Teach me relative speed',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Sit on one of them',
      say: `Imagine yourself on the first train, treating it as still. The second train then moves
            at the <b>relative speed</b> — and every question here is an ordinary
            distance-over-speed sum in that frame.`,
      body: `
        <ul>
          <li><b>Opposite directions: add.</b> The gap closes at the sum, so it is over fast.</li>
          <li><b>Same direction: subtract.</b> Only the difference matters, so it takes a long time
              — and if the speeds are equal, one never passes the other at all.</li>
        </ul>
        <p><b>The distance is the sum of the lengths.</b> To be fully clear of each other, the whole
           of one train must pass the whole of the other, so it travels
           <code>150 + 100 = 250 m</code>. Against a <em>pole</em> or a standing person, the
           distance is just the train's own length — a pole has no length. Against a
           <b>platform</b>, add the platform's length.</p>
        <p><b>The routine, in four lines.</b> Add or subtract the speeds → convert km/h to m/s with
           × 5/18 → add the lengths → divide. For the trains above:
           <code>54 + 36 = 90 km/h → 25 m/s → 250 ÷ 25 = 10 s</code>.</p>
        <p><b>Boats are the same idea in a current.</b> Let the boat's own speed be <em>b</em> and
           the stream's be <em>s</em>:</p>
        <ul>
          <li><b>Downstream = b + s</b> (the current helps)</li>
          <li><b>Upstream = b − s</b> (the current fights)</li>
        </ul>
        <p>Given the two, recover the parts by adding and subtracting:
           <code>b = (down + up)/2</code> and <code>s = (down − up)/2</code>. That halving is the
           whole trick, and it is the same arithmetic as finding two numbers from their sum and
           difference.</p>`,
      cta: 'Let me try both directions',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Same way, or facing each other',
      say: `Two trains of <b>150 m</b> and <b>100 m</b>. Switch the direction and watch the time to
            clear each other change out of all proportion.<br><br>
            Then set both speeds <b>equal</b> in the same direction, and see what happens.`,
      widget: relativeSpeed(TRAINS),
      __cfg: TRAINS,
      tasks: [
        { label: 'Try both directions', done: s => s.sawBoth },
        { label: 'Make the relative speed <b>zero</b>', done: s => s.sawZeroRelative },
        { label: 'Get them clear of each other in <b>10 seconds or less</b>',
          done: s => s.seconds !== null && s.seconds <= 10 },
      ],
      onComplete: `Equal speeds in the same direction give a relative speed of zero — they never
                   pass. That is why every "same direction" question you will ever see gives two
                   different speeds.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'rel-opposite', conceptLabel: 'Opposite directions add',
      input: 'number', answer: 10, unit: 'seconds',
      say: `The four-line routine.`,
      context: `Two trains, <b>150 m</b> and <b>100 m</b> long, travel <b>toward each other</b> at
                <b>54 km/h</b> and <b>36 km/h</b>.`,
      q: 'How long do they take to pass each other completely?',
      whyRight: `Correct. <code>54 + 36 = 90 km/h = 25 m/s</code>, and the distance is
                 <code>150 + 100 = 250 m</code>, so <code>250 ÷ 25 = <b>10 seconds</b></code>.`,
      whyWrong: `Four lines, in order.<br><br>
                 <b>Relative speed</b> — opposite directions, so add:
                 <code>54 + 36 = 90 km/h</code>.<br>
                 <b>Convert</b> — <code>90 × 5/18 = 25 m/s</code>.<br>
                 <b>Distance</b> — to be fully clear, the whole of both trains must pass:
                 <code>150 + 100 = 250 m</code>.<br>
                 <b>Divide</b> — <code>250 ÷ 25 = <b>10 s</b></code>.<br><br>
                 Using only 150 m gives 6 seconds — the commonest slip, and it comes from forgetting
                 that the <em>second</em> train also has to get out of the way.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The same trains, the other way round',
      say: `Nothing changes but a plus sign.`,
      steps: [
        `<b>Opposite.</b> 54 + 36 = 90 km/h = 25 m/s. 250 m ÷ 25 = <b>10 seconds</b>.`,
        `<b>Same direction, and faster.</b> Take 72 and 54 km/h — both quicker than before. But
         now subtract: <code>72 − 54 = 18 km/h = 5 m/s</code>, so
         <code>250 ÷ 5 = <b>50 seconds</b></code>. Five times as long, with faster trains.`,
        `<b>Against a pole.</b> A pole has no length, so the distance is the train alone. A 240 m
         train passing a pole in 12 s is doing <code>240 ÷ 12 = 20 m/s</code>, which is
         <code>20 × 18/5 = <b>72 km/h</b></code>.`,
        `<b>Boats, same idea.</b> 30 km downstream in 2 h is 15 km/h; 30 km upstream in 3 h is
         10 km/h. Then <code>b = (15 + 10)/2 = <b>12.5</b></code> and
         <code>s = (15 − 10)/2 = <b>2.5</b></code>. Check: 12.5 + 2.5 = 15 ✓ and 12.5 − 2.5 = 10 ✓.`,
        `<b>Why the halving works.</b> Downstream and upstream are b + s and b − s. Add them and the
         stream cancels, leaving 2b. Subtract them and the boat cancels, leaving 2s. Nothing to
         memorise beyond that.`,
      ],
      takeaway: `Add for opposite, subtract for same. Add both lengths unless the other object is a
                 pole. For boats, add the two speeds and halve for the boat; subtract and halve for
                 the stream.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'rel-pole', conceptLabel: 'A pole has no length',
      input: 'number', answer: 72, unit: 'km/h',
      context: `A train <b>240 m</b> long passes a telegraph pole in <b>12 seconds</b>.`,
      q: 'What is its speed in km/h?',
      why: `A pole has no length, so the train covers only its own <b>240 m</b>.<br><br>
            <code>240 ÷ 12 = 20 m/s</code><br><br>
            Convert back: <code>20 × 18/5 = <b>72 km/h</b></code>.<br><br>
            If the question had said "crosses a 360 m platform in 12 seconds", the distance would
            have been 240 + 360 = 600 m and the answer 50 m/s = 180 km/h. Always ask what the train
            actually has to travel past.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'boat-halving', conceptLabel: 'Add and halve for the boat, subtract and halve for the stream',
      input: 'number', answer: 12.5, unit: 'km/h', tol: 0.001,
      context: `A boat covers <b>30 km downstream in 2 hours</b> and <b>30 km upstream in
                3 hours</b>.`,
      q: 'What is the speed of the boat in still water?',
      why: `Get the two effective speeds first.<br><br>
            <b>Downstream:</b> 30 ÷ 2 = <b>15 km/h</b> — that is b + s.<br>
            <b>Upstream:</b> 30 ÷ 3 = <b>10 km/h</b> — that is b − s.<br><br>
            Add them and the stream cancels: <code>b = (15 + 10) ÷ 2 = <b>12.5 km/h</b></code>.<br><br>
            Subtract and the boat cancels: <code>s = (15 − 10) ÷ 2 = 2.5 km/h</code>.<br><br>
            Check both: 12.5 + 2.5 = 15 ✓ and 12.5 − 2.5 = 10 ✓. Answering <b>12.5</b> for the boat
            and 2.5 for the stream — never the other way round, since the boat must be the faster
            of the two.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'rel-same', conceptLabel: 'Same direction subtracts',
      say: `Faster trains than the hook. Predict whether it takes more time or less.`,
      context: `Two trains, <b>150 m</b> and <b>100 m</b> long, travel in the <b>same direction</b>
                at <b>72 km/h</b> and <b>54 km/h</b>.`,
      q: 'How long does the faster take to overtake the slower completely?',
      options: ['10 seconds', '50 seconds', '20 seconds', '7 seconds'],
      answer: 1,
      whyRight: `Correct — <b>50 seconds</b>, five times longer than the head-on case, even though
                 both trains are now faster. <code>72 − 54 = 18 km/h = 5 m/s</code>, and
                 <code>250 ÷ 5 = 50</code>.`,
      whyWrong: `Same direction means <b>subtract</b>, and that is what makes overtaking so slow.<br><br>
                 <b>Relative speed:</b> <code>72 − 54 = 18 km/h</code>.<br>
                 <b>In m/s:</b> <code>18 × 5/18 = 5 m/s</code>.<br>
                 <b>Distance:</b> <code>150 + 100 = 250 m</code>.<br>
                 <b>Time:</b> <code>250 ÷ 5 = <b>50 seconds</b></code>.<br><br>
                 The instinct that faster trains must finish sooner is exactly what the question is
                 testing. From the slower train's window, the other is creeping past at a walking
                 pace of 18 km/h — and 250 metres at that pace takes the better part of a minute.<br><br>
                 <b>7 seconds</b> comes from adding the speeds (126 km/h = 35 m/s), which is the
                 head-on rule applied to a same-direction problem.`,
    },
  ],
};
