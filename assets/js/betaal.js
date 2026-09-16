/* ============================================================
   Betaal — the riddle-poser who guides the learner.
   From Vikram–Betaal: he sets a puzzle, demands a REASONED answer,
   and never simply hands over the solution.

   Voice rules (keep him consistent everywhere):
   · He challenges, he does not lecture.
   · He never says "well done" for a guess — only for a reason.
   · He is amused by wrong answers, never scornful.
   · Short lines. He is a spirit, not a textbook.
   ============================================================ */

import { CONFIG } from './config.js';

/* His NAME is configurable; his VOICE is not. The rules above are what keep
   65 lessons sounding like one person, and they are the reason he can be
   renamed at all — he speaks in the first person throughout, so the name
   appears nowhere in the lesson prose. */
export const GUIDE = CONFIG.guide.name;

export const MOODS = ['neutral', 'thinking', 'pleased', 'teasing', 'warm', 'impressed'];

/* --- eyes + mouth per mood; everything else is shared --- */
function face(mood) {
  const E = {
    neutral:   `<ellipse cx="40" cy="53" rx="4.2" ry="5"/><ellipse cx="60" cy="53" rx="4.2" ry="5"/>`,
    thinking:  `<ellipse cx="40" cy="53" rx="4.2" ry="2.4"/><ellipse cx="60" cy="53" rx="4.2" ry="5"/>`,
    pleased:   `<path d="M35.5 54.5q4.5-6 9 0" fill="none" stroke-width="3.2" stroke-linecap="round"/>
                <path d="M55.5 54.5q4.5-6 9 0" fill="none" stroke-width="3.2" stroke-linecap="round"/>`,
    teasing:   `<path d="M35.5 53.5q4.5-5 9 0" fill="none" stroke-width="3.2" stroke-linecap="round"/>
                <ellipse cx="60" cy="53" rx="4.2" ry="5"/>`,
    warm:      `<ellipse cx="40" cy="53.5" rx="3.8" ry="4"/><ellipse cx="60" cy="53.5" rx="3.8" ry="4"/>`,
    impressed: `<ellipse cx="40" cy="52.5" rx="5" ry="6"/><ellipse cx="60" cy="52.5" rx="5" ry="6"/>`,
  }[mood] || '';

  const M = {
    neutral:   `<path d="M43 68q7 4 14 0" fill="none" stroke-width="3" stroke-linecap="round"/>`,
    thinking:  `<path d="M44 69h12" fill="none" stroke-width="3" stroke-linecap="round"/>`,
    pleased:   `<path d="M40 66q10 10 20 0" fill="none" stroke-width="3.4" stroke-linecap="round"/>`,
    teasing:   `<path d="M42 70q9 3 16-4" fill="none" stroke-width="3.2" stroke-linecap="round"/>`,
    warm:      `<path d="M43 67q7 6 14 0" fill="none" stroke-width="3.2" stroke-linecap="round"/>`,
    impressed: `<ellipse cx="50" cy="69" rx="5" ry="6.5"/>`,
  }[mood] || '';

  return { E, M };
}

/**
 * Betaal as standalone SVG markup.
 * Colours inherit from --accent so he takes on each academy's identity.
 */
export function betaalSVG(mood = 'neutral', size = 76) {
  const { E, M } = face(mood);
  const float = mood === 'impressed' ? '2.2s' : '3.6s';
  return `
<svg class="betaal betaal--${mood}" viewBox="0 0 100 108" width="${size}" height="${size * 1.08}"
     role="img" aria-label="${GUIDE}, ${CONFIG.guide.role}, looking ${mood}">
  <ellipse class="bt-shadow" cx="50" cy="101" rx="23" ry="4"/>
  <g class="bt-float" style="--float:${float}">
    <!-- spirit body: he floats, so no feet -->
    <path class="bt-body" d="M24 63C24 39 37 25 50 25s26 14 26 38v25q-4.5-7-9.5 0T57 88t-9.5 0T38 88t-9.5 0T24 88z"/>
    <!-- topknot + jewel: the folkloric spirit, not a cartoon ghost -->
    <path class="bt-crown" d="M38 27q12-11 24 0" fill="none" stroke-width="4" stroke-linecap="round"/>
    <circle class="bt-jewel" cx="50" cy="17" r="5"/>
    <circle class="bt-spark" cx="50" cy="17" r="2"/>
    <g class="bt-eyes">${E}</g>
    <g class="bt-mouth">${M}</g>
  </g>
</svg>`;
}

/**
 * A line of Betaal dialogue: avatar + speech card.
 * `tone` maps to a mood; `actions` renders buttons the caller can wire up.
 */
export function betaalSays(text, { mood = 'neutral', size = 62, compact = false } = {}) {
  return `
<div class="says ${compact ? 'says--compact' : ''}">
  <div class="says__who">${betaalSVG(mood, size)}</div>
  <div class="says__bubble"><p>${text}</p></div>
</div>`;
}

/** Swap an existing mounted Betaal's expression without re-rendering the bubble. */
export function setMood(root, mood) {
  const holder = root.querySelector('.says__who');
  if (!holder) return;
  const svg = holder.querySelector('svg');
  const size = svg ? +svg.getAttribute('width') : 62;
  holder.innerHTML = betaalSVG(mood, size);
}

/** Replace the spoken line, with a soft cross-fade. */
export function say(root, text, mood) {
  const bubble = root.querySelector('.says__bubble');
  if (!bubble) return;
  bubble.classList.add('is-swapping');
  setTimeout(() => {
    bubble.innerHTML = `<p>${text}</p>`;
    bubble.classList.remove('is-swapping');
  }, 140);
  if (mood) setMood(root, mood);
}

/* ---- Stock lines, so his voice stays consistent across lessons ---- */
export const LINES = {
  rightFirstTry: [
    "Correct — and you did not guess. I watched.",
    "Right. The reasoning holds. Keep it.",
    "Yes. That is the answer a careful mind reaches.",
  ],
  rightAfterWrong: [
    "Now you have it. The second attempt is where learning lives.",
    "Correct. Note what changed in your thinking — that is the lesson.",
  ],
  wrong: [
    "Not quite. Good — wrong answers are where I do my best work.",
    "No. But look again at what you assumed.",
    "That is the trap I set. Everyone steps in it once.",
  ],
  encourage: [
    "Take your time. I have waited centuries.",
    "Draw it. Do not hold it in your head.",
  ],
};

export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
