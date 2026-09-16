/* ============================================================
   Reasoning · Unit 1 · Lesson 4 — Course of Action
   ============================================================ */

import { causeChain } from '../widgets/cause-chain.js';

const FLUORIDE = {
  problem: `Several villages in the block report fluoride in the hand-pump water well above the
            safe limit, and cases of joint pain among residents are rising.`,
  nodes: [
    { key: 'ground', kind: 'cause',  label: 'Fluoride in the groundwater',             agency: [] },
    { key: 'pumps',  kind: 'link',   label: 'Hand pumps are the only drinking source', agency: ['admin'] },
    { key: 'drink',  kind: 'link',   label: 'Residents drink the water untreated',     agency: ['admin', 'health'] },
    { key: 'pain',   kind: 'effect', label: 'Joint pain among residents',              agency: ['health'] },
  ],
  actors: {
    admin: 'Block administration',
    health: 'Health department',
    geology: 'Geology department',
  },
  /* `follows` and `reason` are never read by the widget — they are what the lesson
     CLAIMS, so the harness can run the three questions itself and shout on a mismatch. */
  actions: [
    { text: 'Fit de-fluoridation units to the affected hand pumps.',
      node: 'drink', actor: 'admin', follows: true, reason: 'remedy' },
    { text: 'Seal every hand pump in the block at once.',
      node: 'pumps', actor: 'admin', removes: 'pumps', follows: false, reason: 'unreplaced' },
    { text: 'Seal the affected pumps and supply water by tanker until a piped line is laid.',
      node: 'pumps', actor: 'admin', removes: 'pumps', replaces: true, follows: true, reason: 'remedy' },
    { text: 'Hold a medical camp for residents already suffering joint pain.',
      node: 'pain', actor: 'health', follows: true, reason: 'relief' },
    { text: 'Direct the geology department to remove the fluoride from the groundwater.',
      node: 'ground', actor: 'geology', follows: false, reason: 'no-power' },
    { text: 'Ask the panchayat to organise a village cleanliness drive.',
      node: null, actor: 'admin', follows: false, reason: 'off-chain' },
  ],
};

export default {
  id: 'r.found.action',
  title: 'Course of Action',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.found.conclude',
  nextLabel: 'Next: Statement & Conclusion →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'Two orders, one word apart',
      say: `<b>"Seal every hand pump in the block."</b><br>
            <b>"Seal the affected pumps and send tankers until a pipeline is laid."</b><br><br>
            Both stop people drinking fluoride. One is a course of action and one is a disaster,
            and the difference is not severity, or cost, or good intentions.<br><br>
            The first takes away the only water in the block and puts nothing in its place.`,
      cta: 'So what decides it?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'The problem is a chain. Actions attach to it.',
      say: `Candidates answer these by asking "does this sound like a good idea?" — and then argue
            about the answer forever. There is a structure underneath that settles it.`,
      body: `
        <p>Every problem statement describes a <b>chain</b>: a root cause, the mechanism it runs
           through, and the effect people are complaining about. Fluoride in the rock → pumps are
           the only source → residents drink it untreated → their joints hurt.</p>
        <p>A proposed action attaches to exactly one node of that chain. Find the node and three
           questions decide its fate:</p>
        <ol>
          <li><b>Is the node even in the chain?</b> If the action attaches to nothing the statement
              describes, it is answering a different problem. A cleanliness drive is a fine thing
              and has no bearing on dissolved fluoride.</li>
          <li><b>Does this actor have power at that node?</b> Nobody can order fluoride out of the
              bedrock. An instruction that cannot be carried out is a wish, and a wish is never a
              course of action.</li>
          <li><b>Does it remove something people depend on, without a replacement?</b> Then it ends
              the stated problem by creating a bigger one, and it fails — however decisively it
              solves the thing you were asked about.</li>
        </ol>
        <p><b>One more thing, and it decides many marks.</b> An action at the <em>effect</em> end —
           a medical camp for people already ill — does not cure anything. It still <b>follows</b>.
           Immediate relief for people already harmed is a legitimate course of action, and it sits
           quite happily alongside a remedy further up the chain. Do not reject it for being only
           a bandage.</p>`,
      cta: 'Give me the chain',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Place each action on the chain',
      say: `Six proposed actions. Pick one, then click the node of the chain it actually acts on —
            and if it acts on nothing in the chain, say so.<br><br>
            Once it is placed I will run the three questions against the node you are standing on.
            The verdict comes from the node, never from my opinion of the policy.`,
      widget: causeChain(FLUORIDE),
      __cfg: FLUORIDE,
      tasks: [
        { label: 'Place all six actions on the chain', done: s => s.placedAll },
        { label: 'Find an action that <b>follows</b>', done: s => s.sawFollows },
        { label: 'Find one that fails', done: s => s.sawFails },
        { label: 'Find the one that attaches to nothing at all', done: s => s.offChainFound },
      ],
      onComplete: `Three followed and three failed — one for each of the three questions. Every
                   verdict came from where the action landed, not from how sensible it sounded.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'action-replacement', conceptLabel: 'Removing what people depend on',
      say: `Commit before I explain it.`,
      context: `<b>Course of action:</b> seal every hand pump in the block at once.`,
      q: 'Why does this fail?',
      options: [
        'The block administration has no power to seal hand pumps',
        'Hand pumps are not mentioned in the problem',
        'It removes the only drinking source and puts nothing in its place',
        'It would not stop the joint pain quickly enough',
      ],
      answer: 2,
      whyRight: `Correct. The node is real and the administration can certainly act there — this
                 one fails the third question. It would end the fluoride problem and start a
                 thirst problem.`,
      whyWrong: `Run the three questions in order.<br><br>
                 <b>Is the node in the chain?</b> Yes — "hand pumps are the only drinking source"
                 is written into the statement.<br><br>
                 <b>Has the actor power there?</b> Yes — sealing pumps is exactly what a block
                 administration can do.<br><br>
                 <b>Does it remove what people depend on, unreplaced?</b> <b>Yes</b>, and that is the
                 failure. Compare the third action on the list: identical seal, plus tankers. Same
                 node, same actor, opposite verdict — the replacement is the whole difference.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Three that follow, three that fail',
      say: `Each failure is a different question, failed.`,
      steps: [
        `<b>De-fluoridation units at the pumps — follows.</b> Node: residents drink it untreated.
         The administration has power there, nothing is taken away. It attacks the mechanism, so
         it is a genuine remedy.`,
        `<b>Seal the affected pumps and send tankers — follows.</b> Same node as the failed order,
         same actor, but the thing people depend on is replaced while the pipeline is built.`,
        `<b>Medical camp for those already suffering — follows.</b> Node: the effect. It cures
         nothing, and it is still a course of action, because people already harmed need relief now.
         Rejecting this option is the commonest error in the topic.`,
        `<b>Seal every pump at once — fails.</b> Removal without replacement. The chain is right,
         the power is right, the remedy is a catastrophe.`,
        `<b>Order the geology department to remove the fluoride — fails.</b> The node is the root
         cause, and no authority in this problem has power there. Groundwater chemistry does not
         take instructions.`,
        `<b>A village cleanliness drive — fails.</b> It attaches to no node at all. Worthy, and
         about a different problem entirely.`,
      ],
      takeaway: `Find the node, then ask the three questions in order: in the chain, within this
                 actor's power, and not a removal without a replacement. Relief at the effect end
                 counts — do not throw it away.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'action-power', conceptLabel: 'An action must be something someone can do',
      context: `<b>Statement:</b> Many students in the district's government schools fail
                mathematics.<br><br>
                <b>I.</b> The state should fill the vacant mathematics teaching posts in schools
                that currently have none.<br>
                <b>II.</b> The state should ensure that no student ever finds mathematics
                difficult.`,
      q: 'Which course of action follows?',
      options: ['Only I', 'Only II', 'Both I and II', 'Neither'],
      answer: 0,
      whyRight: `Yes. I names a node in the chain — schools without a teacher — and an actor with
                 power over it. II names an outcome and no action at all.`,
      whyWrong: `<b>I</b> is specific, attaches to a real link in the chain, and the state can
                 actually do it. It follows.<br><br>
                 <b>II</b> reads like an action because it begins with "the state should", but ask
                 what anyone would <em>do</em> on Monday morning. It describes a desirable end state
                 and hands over no mechanism. Nobody can be instructed to ensure a feeling.<br><br>
                 This is the second question failing: an action must be within somebody's power.
                 "Ensure that nobody is ever unhappy" is a wish wearing an imperative.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'action-replacement', conceptLabel: 'Removing what people depend on',
      context: `<b>Statement:</b> Vegetable vendors occupying the main road have made traffic in
                the town unmanageable.<br><br>
                <b>I.</b> Evict every vendor from the town with immediate effect.<br>
                <b>II.</b> Allot the vendors space in the nearby market yard, then clear the road.`,
      q: 'Which follows?',
      options: ['Only I', 'Only II', 'Both I and II', 'Neither'],
      answer: 1,
      whyRight: `Correct. II clears the road and leaves the vendors somewhere to trade — the
                 problem ends and no new one begins.`,
      whyWrong: `Both clear the road, so severity is not what separates them.<br><br>
                 <b>I</b> removes the livelihood of every vendor in the town and offers nothing in
                 its place — and note it also over-reaches: the problem is the <em>main road</em>,
                 and the remedy expels vendors from the whole town.<br><br>
                 <b>II</b> acts at the same node with a replacement attached. Same node, same actor,
                 different verdict — exactly like the hand pumps.<br><br>
                 When two options describe the same measure and one carries "and then provide…",
                 that clause is the answer.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'action-chain', conceptLabel: 'Find the node, then run the three questions',
      say: `Three actions. Run the questions on each before choosing.`,
      context: `<b>Statement:</b> Several government hospitals report a shortage of nurses, and
                waiting times have risen sharply.<br><br>
                <b>I.</b> Fill the sanctioned nursing posts that are lying vacant.<br>
                <b>II.</b> Close the outpatient departments until the shortage is made up.<br>
                <b>III.</b> Advise people to fall ill less often.`,
      q: 'Which follow?',
      options: ['Only I', 'I and II', 'I and III', 'All three'],
      answer: 0,
      whyRight: `Exactly — one survives, and each of the other two fails a different question.`,
      whyWrong: `<b>I</b> — node: too few nurses. The posts are already sanctioned, so the state has
                 both the power and the budget line. It follows.<br><br>
                 <b>II</b> — node: the same shortage, and it does cut waiting times, by removing the
                 service people are waiting for. Removal without replacement; the patients simply
                 go untreated. Fails.<br><br>
                 <b>III</b> — attaches to no node in the chain, and nobody can carry it out in any
                 case. It fails the first two questions at once.<br><br>
                 <b>Only I.</b>`,
    },
  ],
};
