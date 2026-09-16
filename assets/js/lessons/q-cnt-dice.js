/* ============================================================
   Quants · Unit 6 · Lesson 5 — Dice, Cards & Coins
   ============================================================ */

import { sampleSpace } from '../widgets/count-lab.js';

const CARDS = {
  space: 'cards',
  events: [
    { label: 'A face card', test: c => 'JQK'.includes(c.rank), expect: 12,
      note: 'Three face cards in each of the four suits — 12 of 52, which is 3/13.' },
    { label: 'A red king', test: c => c.rank === 'K' && c.red, expect: 2,
      note: 'Only the king of hearts and the king of diamonds. Two out of 52, which is 1/26.' },
    { label: 'A heart', test: c => c.suit === 'H', expect: 13 },
    { label: 'A king OR a heart', test: c => c.rank === 'K' || c.suit === 'H', expect: 16,
      note: '13 hearts plus 4 kings is 17 — but the king of hearts was counted twice, so 16.' },
  ],
};

export default {
  id: 'q.cnt.dice',
  title: 'Dice, Cards & Coins',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.di.tables',
  nextLabel: 'Next unit: Reading Tables →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Three sample spaces, reused forever',
      say: `Almost every probability question in the paper is set in one of three places:<br><br>
            <b>Dice</b> — 36 outcomes for two of them.<br>
            <b>Coins</b> — 2<sup>n</sup> outcomes for n tosses.<br>
            <b>Cards</b> — 52, in four suits of thirteen.<br><br>
            Learn the shape of each one and the counting is already done before you read the
            question.`,
      cta: 'Give me the three',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'What is in each space',
      say: `These are worth knowing cold, in the same way the squares to 30 were. The question is
            never "how many cards are there" — it assumes you know.`,
      body: `
        <p><b>A deck of 52.</b> Four suits — <b>hearts ♥</b> and <b>diamonds ♦</b> are red, <b>clubs
           ♣</b> and <b>spades ♠</b> are black. Thirteen cards per suit: A, 2–10, J, Q, K.</p>
        <ul>
          <li><b>26</b> red and 26 black · <b>13</b> of any one suit</li>
          <li><b>4</b> of any one rank — four kings, four aces</li>
          <li><b>12</b> face cards (J, Q, K in each suit) — <em>not</em> 16; the ace is not a face
              card unless the question says so</li>
        </ul>
        <p><b>Two dice.</b> <code>6 × 6 = 36</code> ordered pairs. The dice are
           <b>distinguishable</b> even when identical, so (4,6) and (6,4) are two outcomes. Six
           doubles, and a total of 7 in six ways.</p>
        <p><b>n coins.</b> <code>2ⁿ</code> outcomes — 4 for two coins, 8 for three, 32 for five. The
           number of ways to get exactly r heads from n tosses is <code>nCr</code>, which is where
           the last lesson earns its keep: exactly two heads in three tosses is
           <code>3C2 = 3</code> ways out of 8.</p>
        <p><b>Or means inclusion-exclusion.</b> "A king or a heart" is not 4 + 13. The
           <b>king of hearts</b> is in both lists, so:</p>
        <p><code>13 + 4 − 1 = <b>16</b></code>, giving <code>16/52 = <b>4/13</b></code>.</p>
        <p>This is the crossing-roads subtraction from Mensuration, in a different costume — count
           each side, then remove the overlap once.</p>`,
      cta: 'Let me see the deck',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'All fifty-two, and the ones that count',
      say: `The whole deck is on screen. Pick an event and watch the favourable cards light up.<br><br>
            Look hard at the last one — <b>king or heart</b>. Count the highlighted cards and check
            it against 13 + 4.`,
      widget: sampleSpace(CARDS),
      __cfg: CARDS,
      tasks: [
        { label: 'Look at all four events', done: s => s.seenAll },
        { label: 'Find the event with only <b>2</b> favourable cards', done: s => s.favourable === 2 },
        { label: 'Find the <b>16</b>-card event and see why it is not 17', done: s => s.favourable === 16 },
      ],
      onComplete: `Sixteen, not seventeen. The king of hearts appears in both lists and must only be
                   counted once — which is exactly what the picture shows.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'cards-composition', conceptLabel: 'What is actually in a deck',
      context: `One card is drawn at random from a standard deck of <b>52</b>.`,
      q: 'What is the probability that it is a face card?',
      options: ['3/13', '4/13', '1/13', '3/26'],
      answer: 0,
      whyRight: `Correct. Jack, queen and king in each of four suits gives <code>3 × 4 = 12</code>
                 face cards, and <code>12/52 = <b>3/13</b></code>.`,
      whyWrong: `Count the face cards: <b>J, Q, K</b> in each of the four suits.<br><br>
                 <code>3 × 4 = <b>12</b></code> face cards out of 52.<br><br>
                 <code>12/52 = <b>3/13</b></code> — divide both by 4.<br><br>
                 <b>4/13</b> is 16/52, which counts the ace as a face card. In the standard
                 convention it is not; if a question wants aces included it will say "honour
                 cards" or spell it out.<br><br>
                 <b>1/13</b> is 4/52 — the chance of one particular rank, such as a king.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'The counts worth memorising',
      say: `Then the one that needs subtraction.`,
      steps: [
        `<b>A face card.</b> 12 of 52 → <code><b>3/13</b></code>. Three ranks, four suits.`,
        `<b>A red king.</b> Only the king of hearts and the king of diamonds — 2 of 52 →
         <code><b>1/26</b></code>. Two conditions at once always shrink the count sharply.`,
        `<b>Doubles on two dice.</b> (1,1) through (6,6) — 6 of 36 → <code><b>1/6</b></code>. The
         diagonal of the grid.`,
        `<b>A king or a heart.</b> 13 hearts and 4 kings, but the <b>king of hearts</b> is in both.
         <code>13 + 4 − 1 = 16</code>, so <code>16/52 = <b>4/13</b></code>. Adding to 17 is the
         mistake this question is built to catch.`,
        `<b>Exactly two heads in three tosses.</b> The space is 8; the favourable count is
         <code>3C2 = 3</code> (HHT, HTH, THH) → <code><b>3/8</b></code>. Combinations and
         probability are the same skill.`,
      ],
      takeaway: `Know the three spaces cold: 36 for two dice, 2ⁿ for coins, 52 for cards with 13 per
                 suit, 4 per rank and 12 face cards. For "or", add and remove the overlap once.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'cards-two-conditions', conceptLabel: 'Two conditions at once',
      context: `One card is drawn from a standard deck.`,
      q: 'What is the probability that it is a red king?',
      options: ['1/13', '1/26', '2/13', '1/52'],
      answer: 1,
      whyRight: `Correct. There are four kings, of which two are red — the king of hearts and the
                 king of diamonds. <code>2/52 = <b>1/26</b></code>.`,
      whyWrong: `Both conditions must hold at once, so count the cards satisfying <em>both</em>.<br><br>
                 There are 4 kings. Two of them are red (hearts and diamonds); two are black (clubs
                 and spades).<br><br>
                 <code>2/52 = <b>1/26</b></code><br><br>
                 <b>1/13</b> is 4/52 — the chance of a king of any colour, ignoring the second
                 condition. <b>1/52</b> would be one specific card, such as the king of hearts
                 alone.<br><br>
                 A quick check: red cards are half the deck, so the chance of a red king should be
                 half the chance of a king. And 1/26 is half of 1/13. ✓`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'dice-distinguishable', conceptLabel: 'The two dice are different dice',
      input: 'number', answer: 6, unit: 'favourable outcomes',
      context: `Two fair dice are thrown. You want <b>doubles</b> — both dice showing the same
                number.`,
      q: 'How many of the 36 outcomes are doubles?',
      why: `(1,1), (2,2), (3,3), (4,4), (5,5), (6,6) — <b>6</b> outcomes, so the probability is
            <code>6/36 = 1/6</code>.<br><br>
            The reason the total is 36 and not 21 is that the dice are <b>distinguishable</b>, even
            when they look identical. (2,5) and (5,2) are separate outcomes; only the doubles have
            no partner to pair with.<br><br>
            That is also why doubles are less likely than they feel: there are 30 non-double
            outcomes against just 6 doubles.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'cards-or', conceptLabel: 'For "or", remove the overlap once',
      say: `Last question of the unit. Add carefully, then subtract.`,
      context: `One card is drawn from a standard deck of <b>52</b>.`,
      q: 'What is the probability that it is a king or a heart?',
      options: ['17/52', '4/13', '1/4', '16/13'],
      answer: 1,
      whyRight: `Correct. 13 hearts plus 4 kings is 17, but the <b>king of hearts</b> has been
                 counted twice — so <code>13 + 4 − 1 = 16</code> and <code>16/52 = <b>4/13</b></code>.`,
      whyWrong: `Count each list, then remove what appears in both.<br><br>
                 <b>Hearts:</b> 13 · <b>Kings:</b> 4 · <b>In both:</b> the king of hearts, 1 card.<br><br>
                 <code>13 + 4 − 1 = <b>16</b></code><br>
                 <code>16/52 = <b>4/13</b></code><br><br>
                 <b>17/52</b> is the trap — adding the two lists without noticing the overlap. It is
                 the same error as forgetting the crossing square where two roads meet, and it
                 appears in every "A or B" question.<br><br>
                 <b>1/4</b> is 13/52, the hearts alone. And <b>16/13</b> is above 1, which no
                 probability can ever be — a reminder that the sanity check costs nothing.`,
    },
  ],
};
