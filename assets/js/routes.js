/* ============================================================
   Where every page lives.

   The site used to be a handful of pages that changed what they showed by
   query string — `lesson/?id=…`, `practice/?a=…&u=…`, `reteach/?c=…` — and
   an academy page that folded all seven of its chapters into one scroll.
   Every chapter, lesson, practice set and re-teach now has a real address
   of its own, which is what makes one bookmarkable, shareable, and visible
   in the browser's history as the thing it is.

   Those pages are written to disk by `tools/pages.js`, and that script asks
   THIS file where to put them. The links on every page ask this file too.
   One function per kind of page, used by both, is the only arrangement in
   which a link and the page it points at cannot drift apart.

   Paths are relative to the site root. `href()` turns one into a full URL
   anchored on where this very file was loaded from, so a link comes out
   right from any depth of page and under any hosting prefix — the root of
   a domain, `/<repo>/` on GitHub Pages, or a folder on somebody's laptop.
   ============================================================ */

import { ACADEMIES } from './curriculum.js';

/* assets/js/routes.js → two levels up is the site root. */
const ROOT = new URL('../../', import.meta.url);

/** A path relative to the site root, as an absolute URL. */
export const href = path => new URL(path, ROOT).href;

/** Titles into URL segments: "Family & Relations" → "family-and-relations". */
export const slug = s => String(s).toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[⇄→]/g, ' to ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/* Segments a chapter keeps for its own pages, which a lesson may not take. */
export const RESERVED = new Set(['practice', 'drill']);

const unitOf = (academyId, unitN) =>
  ACADEMIES[academyId]?.units.find(u => u.n === +unitN) || null;

export const academyPath = academyId => `${academyId}/`;

export function chapterPath(academyId, unitN) {
  const u = unitOf(academyId, unitN);
  return u ? `${academyId}/${u.n}-${slug(u.title)}/` : academyPath(academyId);
}

export const practicePath = (academyId, unitN) => `${chapterPath(academyId, unitN)}practice/`;
export const drillPath = (academyId, unitN) => `${chapterPath(academyId, unitN)}drill/`;

/** A lesson sits inside its chapter: reasoning/3-space-and-direction/compass-and-turns/ */
export function lessonPath(lessonId) {
  for (const a of Object.values(ACADEMIES))
    for (const u of a.units) {
      const l = u.lessons.find(x => x.id === lessonId);
      if (l) return `${chapterPath(a.id, u.n)}${slug(l.title)}/`;
    }
  return '';
}

export const reteachPath = conceptId => `reteach/${slug(conceptId)}/`;

/* The pages that are not about any one chapter — the site's tabs. */
export const TABS = [
  { id: 'home',      label: 'Home',      path: '' },
  { id: 'reasoning', label: 'Reasoning', path: 'reasoning/' },
  { id: 'quants',    label: 'Quants',    path: 'quants/' },
  { id: 'review',    label: 'Review',    path: 'review/',   feature: 'review' },
  { id: 'mock',      label: 'Mock test', path: 'mock/',     feature: 'mock' },
  { id: 'progress',  label: 'Progress',  path: 'progress/' },
  { id: 'modules',   label: 'Tools',     path: 'modules/',  feature: 'modules' },
];

/**
 * An address back to what it names — the inverse of every function above.
 *
 * Accepts a root-relative path or a full URL from `href()`. Returns null for
 * anything that is not one of these pages. The harness uses this to hold a
 * link to meaning something, rather than merely to containing the right text.
 */
export function resolve(address) {
  let p = String(address || '');
  if (/^[a-z]+:/i.test(p)) {
    const u = new URL(p);
    if (!u.href.startsWith(ROOT.href)) return null;
    p = u.href.slice(ROOT.href.length);
  }
  p = p.split(/[?#]/)[0].replace(/^\/+/, '');
  if (p && !p.endsWith('/')) p += '/';
  const seg = p.split('/').filter(Boolean);

  const tab = TABS.find(t => t.path === p);
  if (tab) return { kind: ACADEMIES[tab.id] ? 'academy' : 'tab', id: tab.id, academyId: ACADEMIES[tab.id] ? tab.id : undefined };
  if (seg[0] === 'reteach' && seg.length === 2) return { kind: 'reteach', conceptId: seg[1] };

  const a = ACADEMIES[seg[0]];
  if (!a || seg.length < 2) return null;
  const u = a.units.find(x => `${x.n}-${slug(x.title)}` === seg[1]);
  if (!u) return null;
  const base = { academyId: a.id, unitN: u.n };
  if (seg.length === 2) return { kind: 'chapter', ...base };
  if (seg.length !== 3) return null;
  if (seg[2] === 'practice') return { kind: 'practice', ...base };
  if (seg[2] === 'drill') return { kind: 'drill', ...base };
  const l = u.lessons.find(x => slug(x.title) === seg[2]);
  return l ? { kind: 'lesson', ...base, lessonId: l.id } : null;
}
