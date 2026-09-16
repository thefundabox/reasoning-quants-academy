/* ============================================================
   Reasoning · Unit 6 · Lesson 4 — Venn for Three Categories
   ============================================================ */

import { vennPicker } from '../widgets/venn-sets.js';

const PICKER = {
        rounds: [
          { cats: ['Jaipur', 'Rajasthan', 'India'], tpl: 'nested',
            why: 'Jaipur is inside Rajasthan, which is inside India — a fully nested chain.' },
          { cats: ['Dogs', 'Cats', 'Animals'], tpl: 'twoIn',
            why: 'No dog is a cat, so those two never touch — but both sit inside Animals.' },
          { cats: ['Doctors', 'Fathers', 'Human beings'], tpl: 'twoOver',
            why: 'Some doctors are fathers, so those two cross; and both are entirely inside Human beings.' },
          { cats: ['Teachers', 'Cyclists', 'Poets'], tpl: 'allOver',
            why: 'A teacher may cycle, a cyclist may write poetry — every pair can share members, and none contains another.' },
          { cats: ['Rice', 'Wheat', 'Vegetables'], tpl: 'separate',
            why: 'None of the three shares any member with another, so all three circles stay apart.' },
        ],
      };

export default {
  id: 'r.log.venn3',
  title: 'Venn for Three Categories',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../reasoning/',
  nextLabel: 'Finish the unit',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Same question, completely different picture',
      say: `Which diagram fits <b>Jaipur, Rajasthan, India</b>?<br>
            Now which fits <b>Doctors, Fathers, Human beings</b>?<br><br>
            Both are three nouns and five diagrams. But the first is a chain of boxes inside boxes,
            and the second is two circles that <em>cross</em> inside a third. Pick by feel and you
            will get one of them wrong.<br><br>
            There is a mechanical way to choose, and it never involves looking at the diagrams first.`,
      cta: 'Show me the method',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'Decide the three pairs before you look at any picture',
      say: `Three categories make exactly <b>three pairs</b>. Settle each pair as subset, overlap or
            disjoint — then the diagram is forced, and you simply find the one that matches.`,
      body: `
        <p>For categories A, B and C, ask three questions in words:</p>
        <ol>
          <li>Is every A a B, do they merely cross, or do they never meet?</li>
          <li>The same for B and C.</li>
          <li>The same for A and C.</li>
        </ol>
        <p><b>The five diagrams that answer almost every RAS question:</b></p>
        <ul>
          <li><b>Nested</b> — each inside the next. <em>Jaipur ⊂ Rajasthan ⊂ India.</em></li>
          <li><b>Two separate inside a bigger</b> — <em>Dogs and Cats, both Animals.</em>
              The two small ones never meet.</li>
          <li><b>Two overlapping inside a bigger</b> — <em>Doctors and Fathers, both Human beings.</em>
              Some doctors are fathers, so the small circles cross.</li>
          <li><b>All three partly overlapping</b> — <em>Teachers, Cyclists, Poets.</em>
              Any pair can share members and none contains another.</li>
          <li><b>All three separate</b> — <em>Rice, Wheat, Vegetables.</em></li>
        </ul>
        <p><b>The trap:</b> the three nouns are almost never printed in nesting order. "Asia, India,
           Maharashtra" is still a nested chain even though it is written largest-first. Sort them
           yourself before you decide.</p>`,
      cta: 'Let me pick some',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Five triples, five decisions',
      say: `For each one, settle the three pairs in words <em>before</em> you look down at the pictures.
            The pictures are there to be matched, not to be browsed.`,
      widget: vennPicker(PICKER),
      __cfg: PICKER,
      tasks: [
        { label: 'Work through all five triples', done: s => s.finished },
      ],
      onComplete: 'Every one of those was decided by three yes/no questions, before any picture was involved.',
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'pairwise-first', conceptLabel: 'Deciding the three pairs first',
      say: `Commit first. Settle the pairs in words.`,
      context: `Consider these three: <b>Tables · Chairs · Furniture</b>.`,
      q: 'Which diagram fits?',
      options: ['Nested — each inside the next',
                'Two separate sets inside a bigger one',
                'Two overlapping sets inside a bigger one',
                'All three completely separate'],
      answer: 1,
      whyRight: `Correct. No table is a chair, so those two are <b>disjoint</b>. But every table and
                 every chair is furniture, so both sit <b>inside</b> the third circle.
                 That is two separate sets inside a bigger one.`,
      whyWrong: `Settle the three pairs before looking at any picture.<br><br>
                 <b>Tables and chairs:</b> nothing is both — <em>disjoint</em>.<br>
                 <b>Tables and furniture:</b> every table is furniture — <em>subset</em>.<br>
                 <b>Chairs and furniture:</b> every chair is furniture — <em>subset</em>.<br><br>
                 Two disjoint circles, both inside a third: <b>two separate sets inside a bigger one</b>.
                 "Nested" would need tables inside chairs, which is false.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Both hook triples, decided',
      say: `The same three questions each time.`,
      steps: [
        `<b>Jaipur, Rajasthan, India.</b> Jaipur–Rajasthan: subset. Rajasthan–India: subset. Jaipur–India: subset. Three subsets in a chain → <b>nested</b>.`,
        `<b>Doctors, Fathers, Human beings.</b> Doctors–Fathers: some doctors are fathers, so <em>overlap</em>. Doctors–Humans: subset. Fathers–Humans: subset. Two crossing circles inside a third → <b>two overlapping inside a bigger one</b>.`,
        `<b>Notice what changed.</b> Only <em>one</em> of the three pairs differed between the two triples — and that single pair changed the entire diagram. This is why deciding pairs beats recognising shapes.`,
        `<b>And re-order before you judge.</b> "Asia, India, Maharashtra" is nested even though it is printed largest-first. Sort the three into size order yourself; the paper will not do it for you.`,
      ],
      takeaway: `Three categories, three pairs, three answers — and the diagram follows. Never choose a picture by how familiar it looks.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'scrambled-order', conceptLabel: 'Categories printed out of order',
      context: `Consider: <b>Asia · India · Maharashtra</b>.`,
      q: 'Which diagram fits?',
      options: ['All three completely separate',
                'Nested — each inside the next',
                'Two separate sets inside a bigger one',
                'All three partly overlapping'],
      answer: 1,
      why: `Sort them by size first: Maharashtra ⊂ India ⊂ Asia. All three pairs are subsets, so the
            diagram is <b>nested</b>.<br><br>
            The categories were printed largest-first to see whether you would reorder them.
            The printed order carries no information at all — only the relationships do.`,
    },
    {
      type: 'ask', phase: 'Drill', mood: 'thinking',
      concept: 'overlap-vs-disjoint', conceptLabel: 'Deciding overlap versus disjoint',
      context: `Consider: <b>Sisters · Mothers · Women</b>.`,
      q: 'Which diagram fits?',
      options: ['Two separate sets inside a bigger one',
                'Two overlapping sets inside a bigger one',
                'Nested — each inside the next',
                'All three partly overlapping'],
      answer: 1,
      why: `A woman can be both a sister and a mother, so those two circles <b>cross</b> — they are not
            separate. And every sister and every mother is a woman, so both sit <b>inside</b> the third.<br><br>
            That gives <b>two overlapping sets inside a bigger one</b>.<br><br>
            Compare with Dogs–Cats–Animals, which looks identical in structure but has the two inner
            circles <em>disjoint</em>. The only difference is whether a single individual can belong to
            both — and that is the question to ask every time.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'teasing',
      concept: 'pairwise-first', conceptLabel: 'Deciding the three pairs first',
      say: `The second triple from the start.`,
      context: `Consider: <b>Doctors · Fathers · Human beings</b>.`,
      q: 'Which diagram fits?',
      options: ['Nested — each inside the next',
                'Two separate sets inside a bigger one',
                'Two overlapping sets inside a bigger one',
                'All three partly overlapping'],
      answer: 2,
      whyRight: `Exactly. Some doctors are fathers, so those two <b>overlap</b>; and both are entirely
                 <b>inside</b> human beings. Note it is not "all three partly overlapping" — that would
                 require some doctors to be non-human, which is false.`,
      whyWrong: `Three pairs, in words.<br><br>
                 <b>Doctors and fathers:</b> a man can be both — <em>overlap</em>.<br>
                 <b>Doctors and humans:</b> every doctor is human — <em>subset</em>.<br>
                 <b>Fathers and humans:</b> every father is human — <em>subset</em>.<br><br>
                 Two crossing circles, both contained in a third: <b>two overlapping sets inside a
                 bigger one</b>.<br><br>
                 "All three partly overlapping" is the trap — it would mean part of the doctors circle
                 lies <em>outside</em> human beings.`,
    },
  ],
};
