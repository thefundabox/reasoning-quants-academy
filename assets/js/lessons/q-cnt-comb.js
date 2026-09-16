/* ============================================================
   Quants · Unit 6 · Lesson 3 — Combinations
   ============================================================ */

import { permComb } from '../widgets/count-lab.js';

const TEAM = { items: ['A', 'B', 'C', 'D'], startR: 2, maxR: 3 };

export default {
  id: 'q.cnt.comb',
  title: 'Combinations',
  xp: 40,
  backHref: '../quants/',
  nextHref: '../lesson/?id=q.cnt.prob',
  nextLabel: 'Next: Probability Basics →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Ten people, forty-five handshakes',
      say: `Ten people at a meeting, and everyone shakes hands with everyone else.<br><br>
            Each person shakes nine hands, so that is 90 — except that your handshake with me and
            my handshake with you are the <b>same handshake</b>.<br><br>
            <b>45.</b> Every count has been made twice, so halve it. That halving is the entire
            idea of a combination.`,
      cta: 'Show me the general rule',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Arrange, then strike out the reorderings',
      say: `A combination is a selection where order does not matter. There is no new machinery —
            you count arrangements and then divide away the orderings you cannot distinguish.`,
      body: `
        <p><code>nCr = nPr ÷ r!</code></p>
        <p>Because any group of r items can be written in <code>r!</code> different orders, and a
           selection does not care which. Handshakes: <code>10P2 = 90</code>, and each pair was
           counted <code>2! = 2</code> times, so <code>90 ÷ 2 = <b>45</b></code>.</p>
        <p><b>Which is it?</b> One question decides:</p>
        <ul>
          <li><b>Does swapping two chosen items change the outcome?</b> Yes → arrangement
              (<b>nPr</b>). Chairs, ranks, prizes, passwords, seats.</li>
          <li>No → selection (<b>nCr</b>). Committees, teams, handshakes, cards in a hand,
              a set of subjects.</li>
        </ul>
        <p><b>The symmetry worth using.</b> <code>nCr = nC(n−r)</code>, because choosing which 9 to
           include is the same as choosing which 4 to leave out. So
           <code>13C9 = 13C4 = 715</code> — and the second is far less arithmetic.</p>
        <p><b>Conditions become smaller problems.</b> "Exactly 2 men from 5 and 1 woman from 4"
           is <code>5C2 × 4C1 = 10 × 4 = <b>40</b></code> — choose within each group, then multiply,
           because you are doing both. "Two particular players always included" simply removes them
           from the pool: 11 from 15 with 2 fixed is <code>13C9</code>.</p>`,
      cta: 'Let me strike out the duplicates',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Watch the orderings collapse',
      say: `Switch to <b>order does not matter</b>. Each row keeps one selection and strikes out
            the rest — those struck entries are the same group in a different order.<br><br>
            Count the struck items in a row. That number is <b>r!</b>, and it is exactly what you
            divide by.`,
      widget: permComb(TEAM),
      __cfg: TEAM,
      tasks: [
        { label: 'Look at both modes', done: s => s.sawBoth },
        { label: 'Confirm the ratio between them is <b>r!</b>', done: s => s.ratioIsRFactorial && s.r > 1 },
        { label: 'Try choosing <b>3</b> and see six orderings collapse into one', done: s => s.r === 3 },
      ],
      onComplete: `At r = 3 each selection absorbs 3! = 6 orderings. At r = 2 it absorbs 2. The
                   divisor is never a mystery — it is the factorial of how many you chose.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'comb-divide-order', conceptLabel: 'Divide arrangements by r!',
      input: 'number', answer: 45, unit: 'handshakes',
      say: `The meeting from the start.`,
      context: `<b>10 people</b> each shake hands with every other person exactly once.`,
      q: 'How many handshakes take place?',
      whyRight: `Correct. <code>10C2 = (10 × 9) ÷ 2 = <b>45</b></code>. Order does not matter,
                 because a handshake has no first and second person.`,
      whyWrong: `Count the ordered pairs first, then remove the double-counting.<br><br>
                 Each of the 10 people shakes 9 hands, giving <code>10 × 9 = 90</code>. But that
                 counts <em>your hand and mine</em> and <em>my hand and yours</em> as two events,
                 when they are one.<br><br>
                 <code>90 ÷ 2 = <b>45</b></code><br><br>
                 In the notation: <code>10C2 = 10P2 ÷ 2! = 90 ÷ 2 = 45</code>.<br><br>
                 <b>90</b> is the answer to a different question — how many ordered pairs, which
                 would be right if the two roles differed (say, one person gifting another).`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Four selections, worked',
      say: `Each one is nPr with the orderings taken back out.`,
      steps: [
        `<b>Handshakes among 10.</b> <code>10C2 = 90 ÷ 2 = <b>45</b></code>. The classic, and the
         reason "n(n−1)/2" is worth recognising on sight.`,
        `<b>A committee of 3 from 8.</b> <code>8C3 = (8 × 7 × 6) ÷ 3! = 336 ÷ 6 = <b>56</b></code>.
         Write the top as r descending factors, then divide by r! — never compute 8! in full.`,
        `<b>With a condition.</b> Exactly 2 men from 5 and 1 woman from 4:
         <code>5C2 × 4C1 = 10 × 4 = <b>40</b></code>. Choose inside each group, then multiply,
         because both selections happen.`,
        `<b>With members forced in.</b> A team of 11 from 15 where 2 players are certain: take them
         out of the problem. You now choose <b>9</b> more from the remaining <b>13</b> —
         <code>13C9 = 13C4 = <b>715</b></code>.`,
        `<b>Use the symmetry.</b> <code>13C9</code> written out is a nine-factor fraction;
         <code>13C4</code> is <code>(13 × 12 × 11 × 10) ÷ 24 = 715</code>. Identical answer, a
         quarter of the work.`,
      ],
      takeaway: `nCr = nPr ÷ r!. Ask whether swapping two chosen items changes anything: if not, it
                 is a combination. Forced members leave the pool; conditions inside groups multiply.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'comb-basic', conceptLabel: 'Choosing without order',
      input: 'number', answer: 56, unit: 'committees',
      context: `A committee of <b>3</b> is to be formed from <b>8</b> people. All three members
                have equal standing.`,
      q: 'In how many ways can it be formed?',
      why: `The members have equal standing, so order does not matter — this is a
            <b>combination</b>.<br><br>
            <code>8C3 = (8 × 7 × 6) ÷ (3 × 2 × 1) = 336 ÷ 6 = <b>56</b></code><br><br>
            Write only as many factors on top as you are choosing — three here — and divide by 3!.
            Computing 8! and 5! in full is three times the work and the usual source of slips.<br><br>
            Had the three roles been <em>chairman, secretary and treasurer</em>, order would matter
            and the answer would be <code>8P3 = 336</code>.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'comb-conditions', conceptLabel: 'Choose within each group, then multiply',
      input: 'number', answer: 40, unit: 'committees',
      context: `From <b>5 men</b> and <b>4 women</b>, a committee of <b>3</b> is formed containing
                <b>exactly 2 men</b>.`,
      q: 'In how many ways?',
      why: `Split the choice into two independent selections, then multiply — you are doing both.<br><br>
            <b>2 men from 5:</b> <code>5C2 = 10</code><br>
            <b>1 woman from 4:</b> <code>4C1 = 4</code><br><br>
            <code>10 × 4 = <b>40</b></code><br><br>
            "Exactly 2 men" fixes the woman count at 1, since the committee is 3 strong — read that
            off before you start, or you will find yourself adding cases you do not need.<br><br>
            For contrast, "<em>at least</em> 2 men" would need two cases: 2 men and 1 woman (40),
            plus 3 men and no women (<code>5C3 = 10</code>), giving 50.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'comb-forced', conceptLabel: 'Forced members leave the pool',
      say: `Two players are certain. Take them out of the problem entirely.`,
      context: `A cricket team of <b>11</b> is to be chosen from <b>15</b> players. Two particular
                players are <b>always included</b>.`,
      q: 'In how many ways can the team be chosen?',
      options: ['1,365', '715', '455', '1,287'],
      answer: 1,
      whyRight: `Correct. With 2 places already filled, you choose <b>9</b> more from the remaining
                 <b>13</b>: <code>13C9 = 13C4 = <b>715</b></code>.`,
      whyWrong: `A forced member is not a choice — remove them from both numbers before you
                 start.<br><br>
                 <b>Places left to fill:</b> <code>11 − 2 = 9</code><br>
                 <b>Players left to choose from:</b> <code>15 − 2 = 13</code><br><br>
                 <code>13C9</code>. Use the symmetry to make it easy:
                 <code>13C9 = 13C4 = (13 × 12 × 11 × 10) ÷ 24 = 17,160 ÷ 24 = <b>715</b></code>.<br><br>
                 <b>1,365</b> is <code>15C11</code> — the unconstrained answer, ignoring the two
                 fixed players entirely.<br><br>
                 <b>1,287</b> is <code>13C5</code>: subtracting the two players from the pool but
                 forgetting to reduce the places to fill. Both numbers have to drop.`,
    },
  ],
};
