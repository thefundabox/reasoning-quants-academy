/* ============================================================
   Quants · Unit 6 · Lesson 1 — The Counting Principle
   ============================================================ */

import { slotFiller } from '../widgets/count-lab.js';

const OUTFIT = {
  label: 'One slot per decision — set how many choices each has',
  maxList: 36,
  slots: [
    { name: 'Shirt',   options: ['white', 'blue', 'green', 'cream'] },
    { name: 'Trouser', options: ['black', 'grey', 'khaki'] },
    { name: 'Shoes',   options: ['brown', 'black'] },
  ],
};

export default {
  id: 'q.cnt.multiply',
  title: 'The Counting Principle',
  xp: 35,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.cnt.perm',
  nextLabel: 'Next: Permutations →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Four, three and two make twenty-four',
      say: `Four shirts, three trousers, two pairs of shoes.<br><br>
            Not nine outfits. <b>Twenty-four</b> — because every shirt can go with every trouser,
            and every one of <em>those</em> twelve pairs can go with either pair of shoes.<br><br>
            Add when you are choosing <em>between</em> things. Multiply when you are choosing
            <em>each</em> of them.`,
      cta: 'Show me the slots',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Draw one slot per decision',
      say: `Every counting question in this unit — permutations, combinations, probability — starts
            the same way. Draw a blank for each decision and write how many choices go in it.`,
      body: `
        <p><b>The rule.</b> If one decision has <code>m</code> options and the next has
           <code>n</code>, and the choices are independent, there are <code>m × n</code> ways
           altogether. Extend it to as many slots as you like.</p>
        <p><code>4 × 3 × 2 = 24</code></p>
        <p><b>Add or multiply?</b> This is the whole difficulty, and one word settles it:</p>
        <ul>
          <li><b>AND → multiply.</b> A shirt <em>and</em> a trouser <em>and</em> shoes.</li>
          <li><b>OR → add.</b> Travel by bus <em>or</em> by train: 4 buses + 3 trains = 7 ways,
              because you take one journey, not both.</li>
        </ul>
        <p><b>Repetition changes the numbers in the slots.</b> A number plate with three letters
           then four digits, repeats allowed, is
           <code>26 × 26 × 26 × 10 × 10 × 10 × 10 = 26³ × 10⁴ = 17,57,60,000</code>. Every slot keeps
           its full alphabet because nothing is used up.</p>
        <p><b>Without repetition, each slot loses one.</b> Three-digit numbers with distinct digits
           and no leading zero:</p>
        <ul>
          <li>Hundreds: <b>9</b> — any digit but 0.</li>
          <li>Tens: <b>9</b> — 0 is back in play, but the hundreds digit is gone.</li>
          <li>Units: <b>8</b> — two digits are now spent.</li>
        </ul>
        <p><code>9 × 9 × 8 = <b>648</b></code>. Note the order of filling: <b>deal with the
           restricted slot first</b>. Had you started at the units end you would not know how many
           choices the hundreds slot had left.</p>`,
      cta: 'Let me fill the slots',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Twenty-four outfits, listed',
      say: `Three slots. Change how many choices each has and watch the product.<br><br>
            While the number is small enough, every outcome is listed underneath — so you can
            check the multiplication by counting, once.`,
      widget: slotFiller(OUTFIT),
      __cfg: OUTFIT,
      tasks: [
        { label: 'Get to <b>24</b> with all the choices available', done: s => s.total === 24 },
        { label: 'Set one slot to a single choice and see the product collapse', done: s => s.anyOne },
        { label: 'Count the listed outfits and confirm the product', done: s => s.listed && s.total >= 12 },
      ],
      onComplete: `Counting them by hand works at 24 and is hopeless at 24,000. The product is the
                   same answer, arrived at without the list.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'count-multiply', conceptLabel: 'Independent choices multiply',
      input: 'number', answer: 24, unit: 'outfits',
      say: `The wardrobe from the start.`,
      context: `<b>4</b> shirts, <b>3</b> trousers and <b>2</b> pairs of shoes.`,
      q: 'How many different outfits are possible?',
      whyRight: `Correct. <code>4 × 3 × 2 = <b>24</b></code>. Each of the 12 shirt-and-trouser pairs
                 can be worn with either pair of shoes.`,
      whyWrong: `You are choosing a shirt <b>and</b> a trouser <b>and</b> shoes — three decisions,
                 all of which get made.<br><br>
                 <code>4 × 3 × 2 = <b>24</b></code><br><br>
                 If you answered <b>9</b>, you added: 4 + 3 + 2. Adding answers a different
                 question — "how many garments are there?" — and would be right only if you were
                 picking one item <em>or</em> another.<br><br>
                 Build it up: 4 shirts each pair with 3 trousers gives 12 combinations; each of
                 those 12 goes with 2 pairs of shoes, giving 24.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Slots, and what goes in them',
      say: `The whole method is deciding what number belongs in each blank.`,
      steps: [
        `<b>Independent choices.</b> 4 shirts, 3 trousers, 2 shoes → <code>4 × 3 × 2 = <b>24</b></code>.
         Nothing is used up, so each slot keeps its full count.`,
        `<b>Repetition allowed.</b> Three letters then four digits on a number plate:
         <code>26³ × 10⁴ = 17,576 × 10,000 = <b>17,57,60,000</b></code>. Far too many to list,
         which is the point of having a rule.`,
        `<b>No repetition, with a restriction.</b> Three-digit numbers, all digits different.
         Fill the <em>restricted</em> slot first — the hundreds digit cannot be 0, so it has
         <b>9</b> choices. Then tens has <b>9</b> (zero returns, one digit is spent) and units has
         <b>8</b>. <code>9 × 9 × 8 = <b>648</b></code>.`,
        `<b>Why order of filling matters.</b> Start at the units end and the hundreds slot has an
         unknown number of choices left — sometimes 8, sometimes 9, depending on whether a zero was
         used. Filling the constrained slot first keeps every later count definite.`,
        `<b>OR means add.</b> Four buses or three trains is <code>4 + 3 = 7</code> journeys. The word
         in the question tells you which operation you are in.`,
      ],
      takeaway: `Draw a slot per decision, write the number of choices in each, and multiply.
                 Fill the most restricted slot first, and add only when the question offers
                 alternatives rather than combinations.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'count-repetition', conceptLabel: 'Repetition keeps every slot full',
      input: 'number', answer: 17576, unit: 'letter combinations',
      context: `A vehicle registration begins with <b>three letters</b>, and letters may be
                <b>repeated</b>.`,
      q: 'How many three-letter combinations are possible?',
      why: `Each of the three slots keeps the whole alphabet, because a letter used once is still
            available.<br><br>
            <code>26 × 26 × 26 = 26³ = <b>17,576</b></code><br><br>
            If the four digits that follow are also free to repeat, the full plate count is
            <code>17,576 × 10⁴ = 17,57,60,000</code> — over seventeen crore.<br><br>
            Had repetition been forbidden, the letters would give <code>26 × 25 × 24 = 15,600</code>
            instead. One word in the question moves the answer by nearly two thousand.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'count-restricted-first', conceptLabel: 'Fill the restricted slot first',
      input: 'number', answer: 648, unit: 'numbers',
      context: `How many <b>three-digit numbers</b> have all their digits <b>different</b>?`,
      q: 'Count them.',
      why: `The hundreds digit is the restricted one — it cannot be <b>0</b>, or the number would
            not be three digits. So fill it first.<br><br>
            <b>Hundreds:</b> 9 choices (1–9)<br>
            <b>Tens:</b> 9 choices — 0 is allowed again, but the hundreds digit is used up<br>
            <b>Units:</b> 8 choices — two digits are now spent<br><br>
            <code>9 × 9 × 8 = <b>648</b></code><br><br>
            The tens slot having 9 rather than 8 surprises people. It gains 0 back while losing the
            hundreds digit, so the count is unchanged.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'count-restricted-first', conceptLabel: 'Fill the restricted slot first',
      say: `Two restrictions this time. One of them binds harder.`,
      context: `Three-digit numbers are formed from the digits <b>1, 2, 3, 4, 5</b> with
                <b>no digit repeated</b>.`,
      q: 'How many of them are even?',
      options: ['24', '30', '12', '60'],
      answer: 0,
      whyRight: `Correct. The units digit must be 2 or 4 — <b>2</b> ways — and then the other two
                 slots have 4 and 3 choices left: <code>2 × 4 × 3 = <b>24</b></code>.`,
      whyWrong: `"Even" is a restriction on the <b>units</b> digit, so fill that slot first.<br><br>
                 <b>Units:</b> must be 2 or 4 → <b>2</b> choices.<br>
                 <b>Hundreds:</b> 4 digits remain → <b>4</b> choices.<br>
                 <b>Tens:</b> 3 remain → <b>3</b> choices.<br><br>
                 <code>2 × 4 × 3 = <b>24</b></code><br><br>
                 <b>60</b> is the total number of three-digit numbers from these digits
                 (<code>5 × 4 × 3</code>) with no evenness condition. <b>30</b> is half of that —
                 a reasonable-looking guess that assumes evens and odds split equally. They do not:
                 only 2 of the 5 digits are even, so the even share is <code>2/5</code> of 60, which
                 is <b>24</b>. ✓<br><br>
                 That cross-check — 24 out of 60 is exactly two-fifths — is worth doing whenever a
                 restriction falls on one slot.`,
    },
  ],
};
