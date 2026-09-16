/* ============================================================
   Reasoning · Unit 1 · Lesson 2 — Statement & Assumption
   ============================================================ */

import { negationTest } from '../widgets/claim-lab.js';

const NOTICE = {
  plan: `Notice from a school: <em>"Parents are requested to check the school website every
         Monday for the weekly circular."</em>`,
  goalLabel: `the circular actually reaches the parents`,
  atoms: [
    { key: 'access',  label: 'Parents can reach the internet',                    short: 'has internet' },
    { key: 'look',    label: 'At least some parents will look at the site',       short: 'parents look' },
    { key: 'canRead', label: 'Parents can read the language of the circular',     short: 'can read it' },
    { key: 'sms',     label: 'The school also sends the circular by SMS',         short: 'SMS as well' },
    { key: 'daily',   label: 'Every parent visits the site every single day',     short: 'all visit daily' },
  ],
  reaches: w => w.access && w.look && w.canRead,
  /* `assumed` is never read by the widget — it is what the lesson CLAIMS, so the
     harness can re-derive each verdict itself and shout if the two disagree. */
  candidates: [
    { text: 'Parents have some access to the internet.',                 holds: w => w.access,  assumed: true },
    { text: 'At least some parents will actually look at the site.',     holds: w => w.look,    assumed: true },
    { text: 'Parents can read the language the circular is written in.', holds: w => w.canRead, assumed: true },
    { text: 'The school has no other way of reaching parents.',          holds: w => !w.sms,    assumed: false },
    { text: 'Every parent visits the website every single day.',         holds: w => w.daily,   assumed: false },
  ],
};

export default {
  id: 'r.found.assume',
  title: 'Statement & Assumption',
  xp: 35,
  backHref: '../reasoning/',
  nextHref: '../lesson/?id=r.found.argument',
  nextLabel: 'Next: Statement & Argument →',

  steps: [
    {
      type: 'say', phase: 'Hook', mood: 'teasing',
      title: 'What the speaker did not bother to say',
      say: `A school puts up a notice: <em>check the website every Monday.</em><br><br>
            The school never said parents own a phone. Never said anyone would look. Never said
            parents can read the language it is written in.<br><br>
            And yet if any one of those is false, the notice is <b>waste paper</b>. Those are
            assumptions — the things a speaker leans on without noticing they are leaning.`,
      cta: 'How do I find them?',
    },

    {
      type: 'say', phase: 'Learn', mood: 'neutral',
      title: 'The negation test',
      say: `An assumption is not a guess about what the speaker believes. It is something with a
            precise job: <b>the statement falls apart without it.</b>`,
      body: `
        <p>Which gives you a mechanical test, and you should never answer these questions any other
           way:</p>
        <ol>
          <li><b>Deny the candidate.</b> Take it and make it false — flatly, completely.</li>
          <li><b>Now re-read the statement.</b> Can it still do what it set out to do?</li>
          <li><b>If it collapses, it was assumed.</b> If it survives, it was not — no matter how
              reasonable, likely or agreeable it sounds.</li>
        </ol>
        <p>That last clause is where marks are lost. Candidates pick the option that sounds most
           <em>sensible</em>. The examiner is not asking what is sensible; the examiner is asking
           what is <b>load-bearing</b>.</p>
        <p><b>Two rules that settle most disputes.</b></p>
        <ul>
          <li><b>An assumption must be unstated.</b> If the statement says it outright, it is a
              stated fact, and a stated fact is never the answer to an assumption question.</li>
          <li><b>An assumption is the minimum, never the maximum.</b> "Some parents will look" is
              assumed. "Every parent looks daily" is not — deny it and the notice still works
              perfectly well. Beware of options carrying <em>all</em>, <em>every</em>,
              <em>only</em>: they are usually too strong to be load-bearing.</li>
        </ul>`,
      cta: 'Give me the notice',
    },

    {
      type: 'explore', phase: 'Explore', mood: 'teasing',
      title: 'Deny each one and watch',
      say: `Five candidates. Deny each in turn.<br><br>
            When denial leaves the notice <b>nowhere to succeed</b>, it was assumed. When some world
            survives the denial, I will show you that world — and the candidate is finished.`,
      widget: negationTest(NOTICE),
      __cfg: NOTICE,
      tasks: [
        { label: 'Deny every candidate at least once', done: s => s.testedAll },
        { label: 'Find one the notice <b>cannot</b> survive without', done: s => s.sawNeeded },
        { label: 'Find one the notice survives perfectly well', done: s => s.sawFree },
      ],
      onComplete: `Three were load-bearing and two were merely agreeable. Nothing about the wording
                   told you which was which — only the denial did.`,
      ctaDone: 'Test me',
    },

    {
      type: 'ask', phase: 'Predict', mood: 'thinking',
      concept: 'negation-test', conceptLabel: 'Denying a candidate to test it',
      say: `Commit before I explain anything.`,
      context: `Notice: <b>"Parents are requested to check the school website every Monday for the
                weekly circular."</b>`,
      q: 'Which of these is NOT assumed?',
      options: [
        'Parents have some access to the internet',
        'At least some parents will look at the site',
        'The school has no other way of reaching parents',
        'Parents can read the language of the circular',
      ],
      answer: 2,
      whyRight: `Right. Deny it — suppose the school <em>also</em> sends an SMS. The notice still
                 works exactly as before. A plan does not assume it is the only plan available.`,
      whyWrong: `Deny each one and see which survives.<br><br>
                 <b>No internet access</b> → nobody can open the site. Collapses.<br>
                 <b>Nobody will look</b> → the circular sits there unread. Collapses.<br>
                 <b>Cannot read the language</b> → opening it achieves nothing. Collapses.<br>
                 <b>The school has another channel</b> → so what? The website request still works.
                 <b>Survives</b> — and that is the answer.<br><br>
                 A speaker who suggests one route is not claiming it is the only route.`,
    },

    {
      type: 'reveal', phase: 'Reveal', mood: 'warm',
      title: 'Load-bearing, or merely agreeable',
      say: `The same test, applied five times, sorts them completely.`,
      steps: [
        `<b>Internet access — assumed.</b> Deny it and every route to the circular is closed. There
         is no surviving world at all, which is exactly what "assumed" means.`,
        `<b>Some parents will look — assumed.</b> Every request assumes somebody might comply. Deny
         it and the notice is addressed to no one.`,
        `<b>Parents can read it — assumed.</b> Quietly carried by the word "circular", and the one
         candidates most often miss, because literacy feels too obvious to state.`,
        `<b>No other channel — not assumed.</b> The widget handed you a surviving world: SMS also
         sent, and the website request still works. One counterexample, done.`,
        `<b>Every parent, every day — not assumed.</b> Far stronger than the notice needs. Deny it
         and the circular still reaches parents. <em>All</em> and <em>every</em> are nearly always
         too heavy to be load-bearing.`,
      ],
      takeaway: `Ask "does it collapse without this?", never "is this reasonable?". The second
                 question has no answer, which is why candidates argue about it and lose the mark.`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'neutral',
      concept: 'assumption-unstated', conceptLabel: 'An assumption must be unstated',
      context: `<b>Because the road is flooded, the collector has ordered all buses to take the
                bypass.</b>`,
      q: 'Which is an assumption in this order?',
      options: [
        'The road is flooded',
        'The bypass is passable',
        'The bypass is shorter than the flooded road',
        'Buses are the only vehicles using that road',
      ],
      answer: 1,
      whyRight: `Yes. Deny it — the bypass is impassable too — and the order becomes useless.
                 It is load-bearing, and the statement never says it.`,
      whyWrong: `Two filters, in order.<br><br>
                 <b>First, is it unstated?</b> "The road is flooded" is written into the statement
                 in so many words. A stated fact can never be the assumption — that alone eliminates
                 it, however tempting it looks.<br><br>
                 <b>Second, deny what remains.</b> Bypass impassable → the order fails. <b>Assumed.</b>
                 Bypass longer than the flooded road → the order still works, just slowly.
                 <b>Not assumed.</b> Other vehicles use the road → changes nothing about buses.
                 <b>Not assumed.</b>`,
    },

    {
      type: 'ask', phase: 'Drill', mood: 'teasing',
      concept: 'assumption-minimum', conceptLabel: 'Assumptions are minimum, not maximum',
      context: `A bank notice: <b>"Customers are advised to use the mobile app for balance
                enquiries instead of visiting the branch."</b>`,
      q: 'Which is assumed?',
      options: [
        'Most customers visit the branch only for balance enquiries',
        'At least some customers are able to use the mobile app',
        'The bank intends to close its branches',
        'Customers prefer mobile apps to branch counters',
      ],
      answer: 1,
      whyRight: `Correct, and note how modest it is — <em>at least some</em>, <em>able to</em>.
                 Deny it and the advice is addressed to people who cannot follow it.`,
      whyWrong: `Deny each.<br><br>
                 <b>Most visit only for balance enquiries</b> → suppose they visit for many reasons;
                 the advice about this one reason still stands. Survives, and "most" is a quantity
                 nobody stated.<br><br>
                 <b>Nobody can use the app</b> → the advice is impossible to follow. <b>Collapses —
                 assumed.</b><br><br>
                 <b>The bank has no plan to close branches</b> → the advice is unaffected. A bank
                 suggesting a cheaper channel is not announcing a closure; that is your own story.<br><br>
                 <b>Customers do not prefer apps</b> → then the bank is advising them to do something
                 they dislike, which is exactly what advice is for. Survives.`,
    },

    {
      type: 'ask', phase: 'Mastery', mood: 'thinking',
      concept: 'negation-test', conceptLabel: 'Denying a candidate to test it',
      say: `A plan with a stated purpose. Find the belief it cannot do without.`,
      context: `<b>The Municipal Corporation has decided to charge for plastic carry bags at all
                its markets, in order to cut plastic waste.</b>`,
      q: 'Which is assumed?',
      options: [
        'Some shoppers will bring their own bags rather than pay the charge',
        'Plastic carry bags are the only source of plastic waste in the city',
        'The Corporation needs the revenue the charge will raise',
        'Shoppers cannot afford to pay the charge',
      ],
      answer: 0,
      whyRight: `Exactly — and it is the bridge between the action and its purpose. Deny it, so
                 that every shopper simply pays and takes the bag, and plastic waste is unchanged.
                 The plan collapses into a tax. <b>Load-bearing.</b>`,
      whyWrong: `The stated purpose is <b>to cut plastic waste</b>. Anything that does not stand
                 between the charge and that purpose is decoration.<br><br>
                 <b>Only source of plastic waste</b> — deny it: bags are one source among many, and
                 charging still cuts waste a little. Survives. (<em>Only</em> should have warned you.)<br><br>
                 <b>Needs the revenue</b> — deny it: the Corporation is rich and charges anyway to
                 discourage use. The plan works perfectly. Survives, and it contradicts the stated
                 purpose.<br><br>
                 <b>Shoppers cannot afford it</b> — deny it: they can afford it, and some still
                 bring a bag rather than pay for nothing. Survives.<br><br>
                 <b>Some will bring their own bags</b> — deny it and the waste never falls. This is
                 the only one the plan is standing on.`,
    },
  ],
};
