/* ============================================================
   Quants · Unit 1 · Lesson 3 — LCM & HCF
   ============================================================ */

import { factorGrid } from '../widgets/number-lab.js';

/* The five pairs cover every shape the Learn step describes: ordinary overlap,
   heavy overlap, one divides the other, and two numbers sharing nothing at all. */
const PAIRS = { pairs: [[12, 18], [24, 36], [15, 25], [12, 36], [8, 9]], start: 0 };

export default {
  id: 'q.num.lcm',
  title: 'LCM & HCF',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.num.convert',
  nextLabel: 'Next: Fractions ⇄ Percents →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Bells, buses and tiles are the same question',
      say: `Three temple bells ring every <b>6</b>, <b>8</b> and <b>12</b> minutes. They ring
            together at nine o'clock. When next?<br><br>
            A floor <b>240 cm</b> by <b>360 cm</b> must be covered by identical square tiles, with
            none cut. What is the largest tile?<br><br>
            One of those is an <b>LCM</b> and the other is an <b>HCF</b>, and telling which is
            which is the entire difficulty. Almost nobody fails the arithmetic.`,
      cta: 'How do I tell?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Break into primes, then take low or high',
      say: `Once both numbers are written as primes, both answers are read off the same table —
            you only choose which power to take.`,
      body: `
        <p>12 = 2<sup>2</sup> × 3 and 18 = 2 × 3<sup>2</sup>.</p>
        <ul>
          <li><b>HCF</b> — for every prime they <b>share</b>, take the <b>lower</b> power.
              2<sup>1</sup> × 3<sup>1</sup> = <b>6</b>. It is the biggest number that fits into both.</li>
          <li><b>LCM</b> — for every prime in <b>either</b>, take the <b>higher</b> power.
              2<sup>2</sup> × 3<sup>2</sup> = <b>36</b>. It is the smallest number both fit into.</li>
        </ul>
        <p><b>Which one does the question want?</b> Ask what is being counted.</p>
        <ul>
          <li><b>Things recurring together</b> — bells, buses, lights, planets — is an <b>LCM</b>.
              You are waiting for the first moment every cycle lines up, and that moment must be a
              multiple of each.</li>
          <li><b>Cutting something into equal whole pieces</b> — tiles, ribbon, rows of students,
              boxes packed identically — is an <b>HCF</b>. The piece must fit into every dimension
              exactly, so it must be a factor of each.</li>
        </ul>
        <p><b>The free check.</b> For any two numbers,
           <code>HCF × LCM = the product of the numbers</code>. For 12 and 18: 6 × 36 = 216, and
           12 × 18 = 216. ✓ If your two answers fail this, one of them is wrong — and it costs one
           multiplication to find out.</p>
        <p><b>Two useful edges.</b> If the numbers share nothing (15 and 25 share only 5; 8 and 9
           share nothing at all) the HCF is 1 and the LCM is simply the product. And if one number
           divides the other, the HCF is the smaller and the LCM is the larger — no work needed.</p>`,
      cta: 'Show me the factors',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Low power, high power',
      say: `Five pairs. For each one the primes are laid out side by side, and you can see the
            HCF taking the lower power while the LCM takes the higher.<br><br>
            Watch the identity at the bottom hold every single time.`,
      widget: factorGrid(PAIRS),
      __cfg: PAIRS,
      tasks: [
        { label: 'Look at all five pairs', done: s => s.seenAll },
        { label: 'Find the pair where one number <b>divides</b> the other', done: s => s.oneDividesOther },
        { label: 'Find the pair that shares <b>no factor at all</b>', done: s => s.coprime },
      ],
      onComplete: `The two edges are worth keeping. When one number divides the other, the HCF is
                   the smaller and the LCM is the larger. When they share nothing, the HCF is 1
                   and the LCM is simply the product — 8 × 9 = 72.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'lcm-vs-hcf', conceptLabel: 'Deciding whether a story wants LCM or HCF',
      say: `The bells, from the start.`,
      context: `Three bells ring every <b>6</b>, <b>8</b> and <b>12</b> minutes, and ring together
                at <b>9:00</b>.`,
      q: 'When do they next ring together?',
      options: ['9:12', '9:24', '9:48', '9:96'],
      answer: 1,
      whyRight: `Correct. You need the first time that is a multiple of 6, 8 <em>and</em> 12 — the
                 LCM, which is <b>24</b>. So 9:24.`,
      whyWrong: `They ring together at a moment that is a whole number of 6-minute gaps, and of
                 8-minute gaps, and of 12-minute gaps. That is a common <b>multiple</b>, and the
                 <em>next</em> one is the <b>lowest</b> common multiple.<br><br>
                 6 = 2 × 3, 8 = 2<sup>3</sup>, 12 = 2<sup>2</sup> × 3. Take the highest power of
                 each prime: 2<sup>3</sup> × 3 = <b>24</b> minutes.<br><br>
                 <b>9:12</b> is a multiple of 6 and 12 but not of 8 — the second bell is not there
                 yet. <b>9:48</b> is a common multiple, but not the <em>lowest</em>, so it is not the
                 next one.<br><br>
                 Recurring events → LCM. Always.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The bells and the tiles, side by side',
      say: `Same two numbers-into-primes move. Opposite choice at the end.`,
      steps: [
        `<b>Bells — an LCM.</b> 6 = 2 × 3, 8 = 2<sup>3</sup>, 12 = 2<sup>2</sup> × 3. Highest power
         of each: 2<sup>3</sup> × 3 = <b>24 minutes</b>, so 9:24.`,
        `<b>And how many times in two hours?</b> 120 ÷ 24 = <b>5</b>. They ring together at 9:24,
         9:48, 10:12, 10:36 and 11:00 — five times after the start, and reading "in the next two
         hours" as excluding the 9:00 start is the usual convention.`,
        `<b>Tiles — an HCF.</b> The tile must fit a whole number of times along <em>both</em> 240 and
         360, so its side is a common <b>factor</b>, and the largest tile is the highest one.
         240 = 2<sup>4</sup> × 3 × 5, 360 = 2<sup>3</sup> × 3<sup>2</sup> × 5. Lowest shared powers:
         2<sup>3</sup> × 3 × 5 = <b>120 cm</b>.`,
        `<b>How many tiles?</b> (240 ÷ 120) × (360 ÷ 120) = 2 × 3 = <b>6</b> tiles. Note the question
         asked for the largest tile, so the count is small — a smaller tile would work too, but
         would not be the answer.`,
        `<b>The check, on the tiles.</b> HCF 120 and LCM 720: 120 × 720 = 86,400, and
         240 × 360 = 86,400. ✓`,
      ],
      takeaway: `Recurring together → LCM (highest powers). Cutting into equal whole pieces → HCF
                 (lowest shared powers). If you are unsure, ask whether the answer should be
                 bigger or smaller than the numbers given: an LCM is at least as big as the
                 largest, an HCF at most as small as the smallest.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'lcm-vs-hcf', conceptLabel: 'Deciding whether a story wants LCM or HCF',
      input: 'number', answer: 120, unit: 'cm',
      context: `A hall floor measures <b>240 cm</b> by <b>360 cm</b>. It must be covered exactly by
                identical square tiles, with no tile cut.`,
      q: 'What is the side of the largest possible tile?',
      why: `The tile has to fit a whole number of times along both sides, so its side is a
            <b>common factor</b> of 240 and 360 — and "largest" means the <b>HCF</b>.<br><br>
            240 = 2<sup>4</sup> × 3 × 5<br>
            360 = 2<sup>3</sup> × 3<sup>2</sup> × 5<br><br>
            Lowest power of each shared prime: 2<sup>3</sup> × 3 × 5 = <b>120 cm</b>.<br><br>
            That gives 2 tiles along one side and 3 along the other — <b>6 tiles</b> in all.
            Answering with the LCM (720) would give a tile three times longer than the room.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'lcm-identity', conceptLabel: 'HCF × LCM equals the product',
      input: 'number', answer: 24, unit: 'the HCF',
      context: `Two numbers are <b>408</b> and <b>1,032</b>. Their LCM is <b>17,544</b>.`,
      q: 'What is their HCF?',
      why: `Do not factorise anything. Use the identity.<br><br>
            <code>HCF × LCM = 408 × 1,032 = 421,056</code><br>
            <code>HCF = 421,056 ÷ 17,544 = <b>24</b></code><br><br>
            Check it makes sense: 24 divides 408 (giving 17) and divides 1,032 (giving 43), and
            17 and 43 share nothing — exactly what you expect once the HCF has been taken out.<br><br>
            Whenever a question hands you one of the pair and asks for the other, this identity is
            almost always the intended route.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'lcm-vs-hcf', conceptLabel: 'Deciding whether a story wants LCM or HCF',
      say: `Read the story, then decide before you compute.`,
      context: `Buses to Ajmer, Bikaner and Kota leave a Jaipur stand every <b>15</b>, <b>20</b> and
                <b>25</b> minutes respectively. All three leave together at <b>6:00 a.m.</b>`,
      q: 'When do all three next leave together?',
      options: ['9:00 a.m.', '11:00 a.m.', '7:00 a.m.', '6:20 a.m.'],
      answer: 1,
      whyRight: `Correct. 15 = 3 × 5, 20 = 2<sup>2</sup> × 5, 25 = 5<sup>2</sup>; highest powers give
                 2<sup>2</sup> × 3 × 5<sup>2</sup> = <b>300 minutes</b> = 5 hours. So 11:00 a.m.`,
      whyWrong: `Buses departing together again is a <b>recurring</b> event, so it is an LCM.<br><br>
                 15 = 3 × 5 · 20 = 2<sup>2</sup> × 5 · 25 = 5<sup>2</sup><br><br>
                 Take the highest power of each prime: <code>2<sup>2</sup> × 3 × 5<sup>2</sup> =
                 4 × 3 × 25 = <b>300</b></code> minutes, which is <b>5 hours</b> — so
                 <b>11:00 a.m.</b><br><br>
                 The 5<sup>2</sup> is where this one is won or lost: 25 contributes two fives, and
                 taking only one would give 60 minutes and the wrong answer of 7:00. Always compare
                 <em>powers</em> of a prime, never just note that the prime appears.`,
    },
  ],
};
