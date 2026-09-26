/* Clocks, calendars and directions — RAS 2021 Q115 and the direction staple.
   Angles are computed, never looked up. */
import { gen, ask, options, byTier, round } from './kit.js';
import { svg } from '../generators/figures.js';

const DIRS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
const dirAt = deg => DIRS[(Math.round(((deg % 360) + 360) % 360 / 45)) % 8];

const hourAngle = (h, m) => ((h % 12) * 30 + m * 0.5) % 360;      // clockwise from 12
const minuteAngle = m => (m * 6) % 360;

/* RAS 2021 Q115: the dial is rotated so that one hand points at a compass
   direction; where does the OTHER hand point some hours later? */
const dialDirection = (R, tier) => {
  const h = R.int(1, 12), m = R.pick([0, 15, 30, 45]);
  const anchorMinute = R.pick([true, false]);
  const anchorDir = R.pick(DIRS);
  const offset = DIRS.indexOf(anchorDir) * 45 - (anchorMinute ? minuteAngle(m) : hourAngle(h, m));
  const ahead = byTier(tier, R.pick([2, 3]), R.pick([3, 4, 5]), R.pick([5, 7, 9]));
  const h2 = (h + ahead - 1) % 12 + 1;
  const askMinute = R.pick([true, false]);
  const deg = (askMinute ? minuteAngle(m) : hourAngle(h2, m)) + offset;
  const norm = ((deg % 360) + 360) % 360;
  if (Math.abs(norm / 45 - Math.round(norm / 45)) > 1e-9) return null;    // must land on a named direction
  const key = dirAt(norm);
  const twelve = dirAt(offset);
  return ask({
    context: `A clock is placed so that when it shows <b>${h}:${String(m).padStart(2, '0')}</b>,
      its <b>${anchorMinute ? 'minute' : 'hour'} hand</b> points towards <b>${anchorDir}</b>.`,
    q: `After <b>${ahead} hours</b>, in which direction will its <b>${askMinute ? 'minute' : 'hour'} hand</b> point?`,
    opts: options(key, [
      { v: dirAt(norm + 180), why: 'That is the opposite direction — check which way round the dial runs.' },
      { v: dirAt(norm + 90), why: 'A quarter turn out: 3 hours of the hour hand is 90°, not 3 hours of the minute hand.' },
      { v: dirAt(norm - 90), why: '' },
      { v: dirAt(norm + 45), why: '' },
    ], i => DIRS[(DIRS.indexOf(key) + 2 + i) % 8]),
    why: `On the dial, ${anchorMinute ? 'the minute hand at ' + m + ' minutes' : 'the hour hand at ' + h + ':' + String(m).padStart(2, '0')}
      stands at ${round(anchorMinute ? minuteAngle(m) : hourAngle(h, m), 1)}° clockwise from 12.
      It points ${anchorDir}, so <b>12 on this dial points ${twelve}</b>.<br>
      ${ahead} hours later the time is ${h2}:${String(m).padStart(2, '0')}; the ${askMinute ? 'minute' : 'hour'} hand
      stands at ${round(askMinute ? minuteAngle(m) : hourAngle(h2, m), 1)}° from 12, which is
      ${round(norm, 1)}° clockwise from North — <b>${key}</b>.<br>
      Note the minute hand returns to the same place every hour; only the hour hand moves in a question like this.`,
    hardness: 1.4 + ahead / 5 + (askMinute === anchorMinute ? 0 : 0.8),
    concept: 'quadrant-direction', conceptLabel: 'A rotated dial',
    source: 'Shape of RAS 2021, Q115',
  });
};

/* The angle between the hands — the other half of the clock family. */
const handAngle = (R, tier) => {
  const h = R.int(1, 12), m = R.pick(byTier(tier, [0, 10, 20, 30, 40], [5, 15, 25, 35, 45, 50], [7, 13, 24, 38, 47, 52]));
  const raw = Math.abs(hourAngle(h, m) - minuteAngle(m));
  const key = round(Math.min(raw, 360 - raw), 1);
  if (key === 0) return null;
  const naive = round(Math.abs((h % 12) * 30 - minuteAngle(m)), 1);       // forgetting the hour hand drifts
  const dial = svg(150, 150, `<g stroke="var(--ink)" fill="none" stroke-width="2">
      <circle cx="75" cy="75" r="60"/>
      ${[...Array(12).keys()].map(i => {
        const a = (i * 30 - 90) * Math.PI / 180;
        return `<line x1="${75 + 54 * Math.cos(a)}" y1="${75 + 54 * Math.sin(a)}" x2="${75 + 60 * Math.cos(a)}" y2="${75 + 60 * Math.sin(a)}"/>`;
      }).join('')}
      <line x1="75" y1="75" x2="${75 + 34 * Math.cos((hourAngle(h, m) - 90) * Math.PI / 180)}" y2="${75 + 34 * Math.sin((hourAngle(h, m) - 90) * Math.PI / 180)}" stroke-width="4"/>
      <line x1="75" y1="75" x2="${75 + 50 * Math.cos((minuteAngle(m) - 90) * Math.PI / 180)}" y2="${75 + 50 * Math.sin((minuteAngle(m) - 90) * Math.PI / 180)}" stroke="var(--brand)" stroke-width="3"/>
    </g>`);
  return ask({
    context: dial,
    q: `What is the angle between the hands of a clock at <b>${h}:${String(m).padStart(2, '0')}</b>?`,
    opts: options(`${key}°`, [
      { v: `${naive}°`, why: 'This leaves the hour hand on the hour mark. It creeps forward half a degree for every minute.' },
      { v: `${round(360 - key, 1)}°`, why: 'That is the reflex angle — the question wants the smaller one.' },
      { v: `${round(key + 15, 1)}°`, why: '' },
      { v: `${round(Math.abs(key - 30), 1)}°`, why: '' },
    ], i => `${round(key + 5 * (i + 1) + 2, 1)}°`),
    why: `Minute hand: ${m} × 6 = <b>${minuteAngle(m)}°</b> from 12.<br>
      Hour hand: ${h % 12} × 30 + ${m} × 0.5 = <b>${round(hourAngle(h, m), 1)}°</b> from 12 — it does not sit on the ${h}.<br>
      Difference = ${round(raw, 1)}°, and the smaller angle is <b>${key}°</b>.`,
    hardness: 1.4 + (m % 5 === 0 ? 0 : 0.8),
    concept: 'turn-frame', conceptLabel: 'Both hands move',
    source: 'RAS staple — mental ability block',
  });
};

/* Calendar: an ordinary-looking question that is really modular arithmetic. */
const calendar = (R, tier) => {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const start = R.int(0, 6);
  const n = R.int(byTier(tier, 40, 200, 400), byTier(tier, 200, 900, 2500));
  const key = DAYS[(start + n) % 7];
  return ask({
    context: `A certain day was a <b>${DAYS[start]}</b>.`,
    q: `What day of the week will it be <b>${n} days</b> later?`,
    opts: options(key, [
      { v: DAYS[(start + n % 7 + 6) % 7], why: 'One day out — count the remainder again.' },
      { v: DAYS[(start - n % 7 + 700) % 7], why: 'That counts backwards. The question moves forward in time.' },
      { v: DAYS[start], why: `${n} is not a whole number of weeks: ${n} = 7 × ${Math.floor(n / 7)} + ${n % 7}.` },
      { v: DAYS[(start + n % 7 + 1) % 7], why: '' },
    ], i => DAYS[(start + n + 2 + i) % 7]),
    why: `Only the remainder after dividing by 7 matters: ${n} = 7 × ${Math.floor(n / 7)} + <b>${n % 7}</b>.<br>
      So count ${n % 7} day${n % 7 === 1 ? '' : 's'} on from ${DAYS[start]} → <b>${key}</b>.`,
    hardness: 1 + (n > 500 ? 0.6 : 0),
    concept: 'turn-chain', conceptLabel: 'Counting in sevens',
    source: 'RAS staple — mental ability block',
  });
};

export const CLOCK_GENERATORS = [
  gen('ras-clk-dial', 'clocks', 'reasoning:3', 'quadrant-direction', 'A rotated dial', dialDirection),
  gen('ras-clk-angle', 'clocks', 'reasoning:3', 'turn-frame', 'Angle between hands', handAngle),
  gen('ras-clk-cal', 'clocks', 'reasoning:3', 'turn-chain', 'Counting in sevens', calendar),
];
