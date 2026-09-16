/* ============================================================
   Quants · Unit 3 · Lesson 3 — Time, Speed & Distance
   ============================================================ */

import { speedTriangle } from '../widgets/rate-lab.js';

const TRIP = { speed: 60, time: 2, maxSpeed: 120, maxTime: 8, minSpeed: 12, stepSpeed: 6 };

export default {
  id: 'q.int.speed',
  title: 'Time, Speed & Distance',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.int.trains',
  nextLabel: 'Next: Trains, Boats & Streams →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Sixty out, forty back. Average fifty?',
      say: `A car drives to a town at <b>60 km/h</b> and returns along the same road at
            <b>40 km/h</b>.<br><br>
            Its average speed for the round trip is <b>48 km/h</b>, not 50.<br><br>
            Why? Because it spends <em>more time</em> at the slower speed than at the faster one.
            The slow leg gets a bigger vote, and averaging the two numbers silently gives them
            equal weight.`,
      cta: 'Show me the right way',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'One relation, and one conversion',
      say: `Distance is a rate times a time — the same shape as interest. Everything in this lesson
            comes out of that, plus one unit conversion you should never have to think about.`,
      body: `
        <p><b>Distance = Speed × Time.</b> Give any two and the third follows:
           <code>S = D/T</code> and <code>T = D/S</code>.</p>
        <p><b>The conversion.</b> 1 km/h is 1,000 m in 3,600 s, which is <b>5/18</b> m/s.</p>
        <ul>
          <li><b>km/h → m/s: multiply by 5/18.</b> 72 × 5/18 = <b>20 m/s</b>.</li>
          <li><b>m/s → km/h: multiply by 18/5.</b> 20 × 18/5 = <b>72 km/h</b>.</li>
        </ul>
        <p>Convert whenever lengths are in metres and speeds in km/h — which is every train
           question in the next lesson. 72, 54, 36 and 90 km/h are the friendly ones: they give
           20, 15, 10 and 25 m/s.</p>
        <p><b>Average speed is total distance over total time.</b> Never the average of the speeds.
           Write it out:</p>
        <p><code>average = (d₁ + d₂) / (t₁ + t₂)</code></p>
        <p>For the round trip at 60 and 40 over 120 km each way: the legs take 2 h and 3 h, so it
           is <code>240 ÷ 5 = <b>48 km/h</b></code>. When the two <em>distances</em> are equal there
           is a shortcut worth knowing — <code>2ab/(a+b)</code> — which gives
           <code>2 × 60 × 40 ÷ 100 = 48</code>. But it only works for equal distances; if the two
           <em>times</em> are equal instead, the plain average <em>is</em> correct.</p>
        <p><b>Keep units consistent.</b> If the speed is in km/h, the time must be in hours. Forty
           minutes is 2/3 of an hour, not 0.40.</p>`,
      cta: 'Let me move the car',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Two of the three, and the third follows',
      say: `Set a speed and a time; the distance is computed. Under it, the same speed appears in
            m/s.<br><br>
            Find <b>72 km/h</b> and look at what it becomes — that number is worth knowing by
            heart.`,
      widget: speedTriangle(TRIP),
      __cfg: TRIP,
      tasks: [
        { label: 'Land on <b>72 km/h</b> and read it in m/s', done: s => s.hit72 },
        { label: 'Reach a distance of <b>300 km or more</b>', done: s => s.far },
        { label: 'Find a speed of exactly <b>20 m/s</b>', done: s => s.hitExact20ms },
      ],
      onComplete: `72 km/h is 20 m/s. That single pair anchors the whole of the next lesson, where
                   train lengths are in metres and speeds are in km/h.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'speed-units', conceptLabel: 'Converting km/h to m/s',
      input: 'number', answer: 20, unit: 'm/s',
      say: `The conversion, cold.`,
      context: `A train travels at <b>72 km/h</b>.`,
      q: 'What is that in metres per second?',
      whyRight: `Correct. <code>72 × 5/18 = <b>20 m/s</b></code>. Divide by 18, multiply by 5 — or
                 notice 72 ÷ 18 = 4, then 4 × 5 = 20.`,
      whyWrong: `One kilometre per hour is 1,000 metres in 3,600 seconds, and
                 <code>1000/3600 = 5/18</code>.<br><br>
                 <code>72 × 5/18</code> — cancel first: <code>72 ÷ 18 = 4</code>, then
                 <code>4 × 5 = <b>20 m/s</b></code>.<br><br>
                 A sanity check on direction: metres per second must be a <em>smaller</em> number
                 than km/h, since 5/18 is well under 1. If your answer came out bigger, you used
                 18/5 by mistake.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Why the round trip averages 48',
      say: `Do it in rupees-and-paise style: count the actual hours.`,
      steps: [
        `<b>Pick a convenient distance.</b> The answer cannot depend on it, so choose one both
         speeds divide: <b>120 km</b> each way.`,
        `<b>Time out.</b> 120 ÷ 60 = <b>2 hours</b>. <b>Time back.</b> 120 ÷ 40 = <b>3 hours</b>.
         There is the asymmetry: three of the five hours are spent at the slower speed.`,
        `<b>Total distance ÷ total time.</b> <code>240 ÷ 5 = <b>48 km/h</b></code>.`,
        `<b>The shortcut, and its condition.</b> With equal <em>distances</em>,
         <code>2ab/(a+b) = 2 × 60 × 40 ÷ 100 = 48</code>. This is the harmonic mean, and it is
         always <b>below</b> the plain average — never above.`,
        `<b>When the plain average IS right.</b> If the car drove for two hours at 60 and two hours
         at 40 — equal <em>times</em>, not equal distances — the answer would genuinely be 50.
         Read which quantity the question holds equal before choosing.`,
      ],
      takeaway: `Average speed is total distance over total time, and nothing else. Equal distances
                 pull the average toward the slower speed; equal times leave it at the plain
                 average.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'speed-basic', conceptLabel: 'Distance = speed × time',
      input: 'number', answer: 80, unit: 'km/h',
      context: `A train covers <b>360 km</b> in <b>4 hours 30 minutes</b>.`,
      q: 'What is its average speed?',
      why: `First fix the units: 4 hours 30 minutes is <b>4.5 hours</b>, not 4.30.<br><br>
            <code>S = D ÷ T = 360 ÷ 4.5 = <b>80 km/h</b></code><br><br>
            If the decimal is awkward, double both: 720 ÷ 9 = 80. ✓<br><br>
            Treating the time as 4.3 hours would give about 83.7 km/h — close enough to look
            plausible and wrong enough to miss the option.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'speed-average', conceptLabel: 'Average speed is total over total',
      input: 'number', answer: 48, unit: 'km/h',
      context: `A car covers <b>120 km</b> at <b>40 km/h</b> and a further <b>120 km</b> at
                <b>60 km/h</b>.`,
      q: 'What is its average speed for the whole journey?',
      why: `Count the hours rather than averaging the speeds.<br><br>
            <code>120 ÷ 40 = 3 h</code> and <code>120 ÷ 60 = 2 h</code>, so the trip takes
            <b>5 hours</b> and covers <b>240 km</b>.<br><br>
            <code>240 ÷ 5 = <b>48 km/h</b></code><br><br>
            Or use the equal-distance shortcut: <code>2 × 40 × 60 ÷ 100 = 48</code>.<br><br>
            <b>50 km/h</b> is the wrong answer this question exists to catch. The car spends three
            of its five hours crawling at 40, so the average must sit closer to 40 than to 60 —
            and 48 does.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'speed-average', conceptLabel: 'Average speed is total over total',
      say: `Read carefully. What is held equal here?`,
      context: `A cyclist rides for <b>2 hours</b> at <b>16 km/h</b> and then for <b>2 hours</b> at
                <b>24 km/h</b>.`,
      q: 'What is the average speed?',
      options: ['19.2 km/h', '20 km/h', '18 km/h', '21 km/h'],
      answer: 1,
      whyRight: `Correct — and this is the case where the plain average <em>is</em> right, because
                 the two <b>times</b> are equal. 32 km + 48 km = 80 km in 4 hours = <b>20 km/h</b>.`,
      whyWrong: `Check what the question holds equal. Here it is the <b>time</b> — two hours on each
                 leg — not the distance.<br><br>
                 <b>Distances:</b> 2 × 16 = 32 km, and 2 × 24 = 48 km. Total <b>80 km</b> in
                 <b>4 hours</b>.<br><br>
                 <code>80 ÷ 4 = <b>20 km/h</b></code>, which is exactly the plain average of 16 and
                 24.<br><br>
                 <b>19.2</b> is the harmonic mean <code>2 × 16 × 24 ÷ 40</code> — the right formula
                 for the <em>wrong</em> situation. It would be correct if the cyclist had covered
                 equal <em>distances</em> at the two speeds.<br><br>
                 The rule underneath both: total distance over total time. Apply that and you never
                 have to remember which shortcut belongs where.`,
    },
  ],
};
