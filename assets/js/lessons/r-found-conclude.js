/* ============================================================
   Reasoning · Unit 1 · Lesson 5 — Statement & Conclusion
   ============================================================ */

import { claimScanner } from '../widgets/claim-lab.js';

const SURVEY = {
  statement: `In a survey of 500 households in Jodhpur, 60% said they had cut their water use
              since the tariff was revised. The largest reductions were reported by households
              in the two lowest consumption slabs.`,
  atoms: [
    { key: 'said60',   label: '60% of the 500 surveyed households <b>said</b> they had cut use',
      short: '60% said so', fixed: true },
    { key: 'lowSlabs', label: 'The largest reported cuts came from the two lowest consumption slabs',
      short: 'lowest slabs cut most', fixed: true },
    { key: 'reallyCut',    label: 'Those households really did cut their use',    short: 'really cut' },
    { key: 'tariffCaused', label: 'The tariff revision is <b>why</b> they cut',   short: 'tariff was the cause' },
    { key: 'cityWide',     label: 'The same pattern holds across the whole city', short: 'true city-wide' },
    { key: 'restRose',     label: 'The remaining 40% increased their use',        short: 'the rest rose' },
    { key: 'slabIsPoor',   label: 'Lowest consumption slab means poorest household', short: 'slab = income' },
  ],
  claims: [
    { text: 'More than half of the households surveyed reported cutting their water use.',
      needs: w => w.said60, trap: null },
    { text: 'Households in the two lowest consumption slabs reported the largest cuts.',
      needs: w => w.lowSlabs, trap: null },
    { text: 'Water use in the surveyed households actually fell.',
      needs: w => w.reallyCut, trap: 'A report treated as a fact' },
    { text: 'The tariff revision caused households to use less water.',
      needs: w => w.tariffCaused, trap: 'Cause smuggled in' },
    { text: '40% of the households surveyed increased their water use.',
      needs: w => w.restRose, trap: 'Not-reduced read as increased' },
    { text: 'Water use has fallen across Jodhpur.',
      needs: w => w.cityWide, trap: 'Sample read as population' },
    { text: 'The poorest households reported the largest cuts.',
      needs: w => w.slabIsPoor, trap: 'Slab read as income' },
  ],
};

export default {
  id: 'r.found.conclude',
  title: 'Statement & Conclusion',
  xp: 40,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.rel.five-marks',
  nextLabel: 'Next unit: The Five Marks →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Sixty per cent said',
      say: `Sixty per cent of surveyed households <b>said</b> they had cut their water use.<br><br>
            So water use fell. Obviously.<br><br>
            Did it? You have been told what people <em>said</em> to a surveyor. Between what a
            household says about its water bill and what its taps did, there is a gap — and the
            examiner has built the entire question inside that gap.`,
      cta: 'Show me the gap',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Only what follows',
      say: `This is the strictest question type in the paper. A conclusion follows only if it is
            true in <b>every</b> situation the statement permits — one exception and it is finished.`,
      body: `
        <p>You already have the method from lesson one: look for the world where the statement holds
           and the conclusion does not. Data statements come with four gaps you can nearly always
           walk through.</p>
        <ol>
          <li><b>Report is not fact.</b> <em>Said</em>, <em>reported</em>, <em>claimed</em>,
              <em>according to</em> — these tell you what was <b>stated to someone</b>. What people
              tell a surveyor about their own thrift is evidence of what they tell surveyors.</li>
          <li><b>Sample is not population.</b> 500 households were asked. Jodhpur has lakhs. The
              survey supports a claim about the 500 and stops there.</li>
          <li><b>Together is not because.</b> The cut came after the tariff revision. Rainfall,
              a cooler summer, a new pipeline, or a campaign could all sit in that gap.</li>
          <li><b>Not-A is not opposite-A.</b> 60% reported a cut, so 40% did not report one.
              That is <em>all</em>. They may have used the same, or not known, or refused to answer.
              Reading "40% increased" is the single most common slip in data questions.</li>
        </ol>
        <p><b>And read the label, not the word it resembles.</b> "The two lowest <em>consumption</em>
           slabs" describes how much water a household uses. It does not describe income. A large
           house with a leak can sit in a high slab; a careful family of six can sit in a low one.</p>`,
      cta: 'Give me the survey',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Seven conclusions. Two survive.',
      say: `Two facts are fixed: what 60% <b>said</b>, and which slabs reported the largest cuts.
            Everything else is open.<br><br>
            Break every conclusion you can. Then scan, and see which two were never breakable.`,
      widget: claimScanner(SURVEY),
      __cfg: SURVEY,
      tasks: [
        { label: 'Break at least three of the proposed conclusions', done: s => s.broken >= 3 },
        { label: 'Break <b>every</b> one that can be broken', done: s => s.brokeEveryBreakable },
        { label: 'Scan, and confirm exactly two survive', done: s => s.scanned && s.survivors === 2 },
      ],
      onComplete: `Two survivors, and both of them are the statement handed back to you. Every
                   conclusion that told you something new died.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'conclusion-follows', conceptLabel: 'A conclusion must hold in every permitted case',
      say: `Commit.`,
      context: `<b>In a survey of 500 households in Jodhpur, 60% said they had cut their water use
                since the tariff was revised.</b>`,
      q: 'Which conclusion follows?',
      options: [
        'Water use in the surveyed households actually fell',
        'The tariff revision caused households to use less water',
        'More than half of the households surveyed reported cutting their water use',
        'Water use has fallen across Jodhpur',
      ],
      answer: 2,
      whyRight: `Correct. 60% of 500 is 300 households, and 300 is more than half of 500. Note how
                 carefully it is worded — <b>reported</b> cutting, and <b>of those surveyed</b>.
                 Both hedges are doing real work.`,
      whyWrong: `Find the world where the statement is true and the option is false.<br><br>
                 <b>"Use actually fell"</b> — a world where 300 households overstated their thrift
                 to a surveyor. Statement true, option false. Dead.<br><br>
                 <b>"The tariff caused it"</b> — a world where the monsoon was heavy and everyone
                 used less anyway. Dead.<br><br>
                 <b>"Fallen across Jodhpur"</b> — a world where these 500 cut and the other lakh
                 households did not. Dead.<br><br>
                 <b>"More than half reported cutting"</b> — 300 out of 500. You cannot build a world
                 where that fails, because it is arithmetic on what the statement already gave you.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Five gaps, one at a time',
      say: `Each dead conclusion walked into a different gap.`,
      steps: [
        `<b>"Use actually fell" — report treated as fact.</b> The statement reports what households
         <em>said</em>. Self-reported thrift is famously generous. The word <em>said</em> is not
         decoration; it is the boundary of what you were told.`,
        `<b>"The tariff caused it" — cause smuggled in.</b> "Since the tariff was revised" places
         the cut after the revision. Any other explanation fits equally well.`,
        `<b>"40% increased" — not-reduced read as increased.</b> The complement of "reported a cut"
         is "did not report a cut", which includes used the same, did not know, and would not say.`,
        `<b>"Fallen across Jodhpur" — sample read as population.</b> 500 households were asked, and
         nothing tells you how they were chosen.`,
        `<b>"The poorest households cut most" — slab read as income.</b> A consumption slab measures
         water, not money. This one catches careful readers, because the substitution feels like
         common sense rather than a leap.`,
        `<b>The two survivors say nothing new.</b> "More than half reported a cut" and "the lowest
         slabs reported the largest cuts" are the statement, restated. That is the whole test.`,
      ],
      takeaway: `Every word the statement spends on hedging — said, reported, surveyed, since — is
                 a wall. The wrong options are the ones that walk through a wall as if it were a door.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'negation-not-opposite', conceptLabel: 'Not-A is not the opposite of A',
      context: `<b>In a poll, 45% of respondents said they supported the proposal.</b>`,
      q: 'Which follows?',
      options: [
        '55% of respondents opposed the proposal',
        'Fewer than half of the respondents said they supported it',
        'A majority of respondents opposed the proposal',
        '45% of the city supports the proposal',
      ],
      answer: 1,
      whyRight: `Yes. 45% is less than 50%, and the sentence keeps both hedges — <b>said</b>, and
                 <b>of respondents</b>. Dull, and airtight.`,
      whyWrong: `The 55% who did not say they supported it are not therefore opponents. They may
                 have been undecided, indifferent, or unwilling to answer — a poll where 45%
                 supported, 20% opposed and 35% had no view fits the statement exactly.<br><br>
                 That kills both <b>"55% opposed"</b> and <b>"a majority opposed"</b>.<br><br>
                 <b>"45% of the city"</b> promotes respondents to the whole city.<br><br>
                 Only <b>"fewer than half said they supported it"</b> stays inside the statement.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'sample-vs-population', conceptLabel: 'A sample is not the population',
      context: `<b>A survey of 200 shopkeepers in one market found that 70% had adopted digital
                payment.</b>`,
      q: 'Which follows?',
      options: [
        '70% of shopkeepers in the city have adopted digital payment',
        '140 of the shopkeepers surveyed had adopted digital payment',
        'Digital payment is now more common than cash in that market',
        'The remaining 30% refuse to adopt digital payment',
      ],
      answer: 1,
      whyRight: `Correct — 70% of 200 is 140, and the claim stays inside the surveyed group.
                 Arithmetic on the given numbers is always safe; anything else is not.`,
      whyWrong: `<b>"70% of the city"</b> — one market promoted to a city.<br><br>
                 <b>"More common than cash"</b> — adopting digital payment does not say how much of
                 the trade goes through it. A shopkeeper can accept a QR code and take cash all day.<br><br>
                 <b>"The remaining 30% refuse"</b> — not having adopted is not refusing. They may
                 lack a smartphone, or be applying next week.<br><br>
                 <b>140 of those surveyed</b> is 0.70 × 200, computed from the statement's own
                 numbers and claimed about the statement's own group.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'conclusion-follows', conceptLabel: 'A conclusion must hold in every permitted case',
      say: `Last one. Every gap from this unit is available to you.`,
      context: `<b>A study of 1,000 patients found that those who walked daily reported fewer
                episodes of back pain than those who did not.</b>`,
      q: 'Which conclusion follows?',
      options: [
        'Walking daily prevents back pain',
        'Among the patients studied, daily walkers reported fewer episodes than non-walkers',
        'People suffering from back pain should walk daily',
        'Patients who did not walk had the most severe back pain',
      ],
      answer: 1,
      whyRight: `Exactly. It keeps the group (<em>the patients studied</em>), keeps the hedge
                 (<em>reported</em>), and adds nothing. By now you should expect the right answer to
                 feel like it is barely worth saying.`,
      whyWrong: `<b>"Walking prevents back pain"</b> — cause from a comparison, and the arrow may
                 well run the other way: people whose backs hurt walk less <em>because</em> they
                 hurt.<br><br>
                 <b>"People should walk daily"</b> — a recommendation. A conclusion states what is
                 true given the statement, never what anyone ought to do.<br><br>
                 <b>"Non-walkers had the most severe pain"</b> — the study counted <em>episodes</em>,
                 not severity. Fewer, worse episodes is entirely consistent with it.<br><br>
                 <b>"Among the patients studied…"</b> — the statement, returned intact. That is what
                 following looks like.`,
    },
  ],
};
