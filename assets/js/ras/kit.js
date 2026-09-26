/* ============================================================
   Shared pieces for the RAS Practise Drills.

   This bank is modelled on the RPSC papers themselves — RAS Prelims 2015,
   2016, 2018, 2021, 2023 and 2024 — rather than on the lessons. Where the
   chapter drills teach one idea at a time, these questions are the shape the
   examiner actually sets: two or three ideas per question, numbers that do
   not divide evenly, and distractors that are the answer to the question a
   hurried candidate THINKS is being asked.

   Rules inherited from the rest of the project, and not negotiable here:
     · every answer is DERIVED from the same data the learner is shown,
       never stored beside the question;
     · every option is distinct, and each wrong one is a named mistake;
     · a generator reports `hardness`, and the harness holds the mean to
       rising with the tier.

   Difficulty here starts where the chapter drills END. Tier 1 in this bank is
   the ordinary exam question; tier 3 is the one the paper uses to separate
   the top of the list.
   ============================================================ */

export { rng, options, near, clampTier, TIER_NAME, byTier } from '../generators/rand.js';

/** 1234567 → "12,34,567" — the grouping the paper prints. */
export function inr(n) {
  const s = String(Math.round(Math.abs(n)));
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
  return (n < 0 ? '-' : '') + grouped;
}
export const rupees = n => `₹${inr(n)}`;

/** A fraction in lowest terms, as "a : b" or "a/b". */
export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const ratioOf = (a, b) => { const g = gcd(a, b) || 1; return [a / g, b / g]; };
export const asRatio = (a, b) => ratioOf(a, b).join(' : ');

/** Round to at most `d` decimals, without trailing zeros. */
export const round = (x, d = 2) => +(Math.round(x * 10 ** d) / 10 ** d).toFixed(d);

export const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const pos = c => AZ.indexOf(c) + 1;                 // A = 1
export const chr = n => AZ[((n - 1) % 26 + 26) % 26];       // 1 = A, wraps

/* Split by gender, because the blood-relation questions say "son" and
   "daughter" about these people — a Sunita who is somebody's brother is not a
   hard question, it is a broken one. */
export const MALE = ['Aarav', 'Chirag', 'Farhan', 'Gaurav', 'Ishaan', 'Lakhan', 'Naveen', 'Om',
  'Rahul', 'Tarun', 'Vikram', 'Yash'];
export const FEMALE = ['Bhavna', 'Divya', 'Esha', 'Hema', 'Jyoti', 'Kavya', 'Meera', 'Pooja',
  'Sunita', 'Usha', 'Anita', 'Rekha'];
export const NAMES = [...MALE, ...FEMALE];
export const CITIES = ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bharatpur'];

/** The question step every RAS generator returns. */
export function ask({ context = '', q, opts, why, whyRight, whyWrong, hardness = 1, concept, conceptLabel, source = '' }) {
  return {
    type: 'ask', context, q, ...opts,
    why, whyRight, whyWrong,
    hardness, concept, conceptLabel,
    /* Which paper the SHAPE came from. Shown under the explanation, so a
       learner can see this is the real thing rather than a made-up drill. */
    source,
  };
}

/**
 * Declare a generator.
 *
 * `topic` is what the learner picks on the RAS Drills page; `chapter` and
 * `concept` are what the answer is recorded against, so a RAS question feeds
 * the same Leitner ladder and the same weak-chapter reporting as everything
 * else. The concept must be one its chapter actually teaches — the harness
 * checks, for the same reason it checks the chapter drills.
 */
export const gen = (id, topic, chapter, concept, conceptLabel, make) =>
  ({ id, topic, chapter, concept, conceptLabel, make });
