// Repository discovery: turns "a list of paths" into the tree the UI renders.
// The list comes from portal/manifest.json, which scripts/build.mjs writes during the
// Vercel build by walking the repository. Nothing is maintained by hand: add a folder or
// file, push, and the next deploy lists it. The browser never talks to GitHub, so the
// repository can stay private.
import { CONFIG } from '../../config.js';
import { normalize } from './paths.js';
import { getFileType, GROUPS } from './filetypes.js';
import { isRestricted } from './permissions.js';
import { naturalCompare, plural } from './format.js';
import { siteBase } from './urls.js';

export class RepoError extends Error {
  constructor(kind, message, extra = {}) { super(message); this.name = 'RepoError'; this.kind = kind; Object.assign(this, extra); }
}

const time = (iso) => { const t = Date.parse(iso); return Number.isFinite(t) ? t : 0; };
const later = (a, b) => (time(b) > time(a) ? b : a);

export function isIgnored(path, ignore = CONFIG.ignore) {
  const segs = path.split('/');
  const low = segs.map((s) => s.toLowerCase());
  if (ignore.hidden && segs.some((s) => s.startsWith('.'))) return true;
  if (ignore.roots.includes(low[0])) return true;
  if (low.some((s) => ignore.anywhere.includes(s))) return true;
  // Root-only: the FIRST path segment must match, so a same-named folder nested
  // elsewhere (e.g. FYP/Others/) is a different path and is never affected by this.
  return (CONFIG.hiddenSubjects || []).some((h) => h.toLowerCase() === low[0]);
}

const makeDir = (name, path, parent) => ({
  kind: 'dir', name, path, parent, children: [], restricted: path ? isRestricted(path) : false,
  fileCount: 0, dirCount: 0, size: 0, modified: null, groups: {},
});

const compare = (a, b) => (a.kind !== b.kind ? (a.kind === 'dir' ? -1 : 1) : naturalCompare(a.name, b.name));

/** entries: [{ path, size?, modified? }] -> repository model */
export function buildRepository(entries, meta = {}) {
  const root = makeDir('', '', null);
  const byPath = new Map([['', root]]);
  const files = [];

  for (const e of entries) {
    const path = normalize(e.path);
    if (!path || isIgnored(path)) continue;
    const segs = path.split('/');
    let parent = root;
    for (let i = 0; i < segs.length - 1; i++) {
      const p = segs.slice(0, i + 1).join('/');
      let dir = byPath.get(p);
      if (!dir) { dir = makeDir(segs[i], p, parent); byPath.set(p, dir); parent.children.push(dir); }
      parent = dir;
    }
    const name = segs[segs.length - 1];
    const type = getFileType(name);
    const file = {
      kind: 'file', name, path, parent, ext: type.ext, type, restricted: isRestricted(path),
      size: Number.isFinite(e.size) ? e.size : null, modified: e.modified || null,
    };
    parent.children.push(file);
    byPath.set(path, file);
    files.push(file);
  }

  const dirs = [];
  (function walk(dir) {
    dir.children.sort(compare);
    for (const c of dir.children) {
      if (c.kind === 'dir') {
        walk(c);
        dir.fileCount += c.fileCount; dir.dirCount += 1 + c.dirCount; dir.size += c.size;
        if (c.modified) dir.modified = dir.modified ? later(dir.modified, c.modified) : c.modified;
        for (const [g, n] of Object.entries(c.groups)) dir.groups[g] = (dir.groups[g] || 0) + n;
      } else {
        dir.fileCount += 1; dir.size += c.size || 0;
        if (c.modified) dir.modified = dir.modified ? later(dir.modified, c.modified) : c.modified;
        dir.groups[c.type.group] = (dir.groups[c.type.group] || 0) + 1;
      }
    }
    dirs.push(dir);
  })(root);

  const groups = GROUPS.map((g) => ({ ...g, count: root.groups[g.id] || 0 })).filter((g) => g.count);
  return {
    root, byPath, files, dirs, groups,
    subjects: root.children.filter((c) => c.kind === 'dir'),
    rootFiles: root.children.filter((c) => c.kind === 'file'),
    hasDates: files.some((f) => f.modified),
    totals: { files: files.length, size: root.size },
    latest: root.modified,
    source: meta.source || 'unknown', generatedAt: meta.generatedAt || null, stale: !!meta.stale, truncated: !!meta.truncated,
  };
}

export const getNode = (repo, path) => repo.byPath.get(normalize(path)) || null;

export function ancestors(node) {
  const out = [];
  for (let n = node.parent; n && n.path; n = n.parent) out.unshift(n);
  return out; // top-level folder first (the unnamed repository root is the Home crumb)
}

const HUES = [158, 212, 32, 268, 344, 184, 84];
export function subjectInfo(dir) {
  const o = CONFIG.subjects?.[dir.name] || {};
  let h = 5381;
  for (const ch of dir.name) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  const parts = [plural(dir.fileCount, 'file')];
  if (dir.dirCount) parts.push(`in ${plural(dir.dirCount, 'folder')}`);
  return {
    title: o.title || dir.name,
    description: o.description || parts.join(' '),
    custom: !!o.description,
    hue: o.hue ?? HUES[h % HUES.length],
  };
}

// ---- loading -------------------------------------------------------------------------------

const manifestUrl = () => new URL('portal/manifest.json', siteBase()).href;

export async function loadRepository() {
  let res;
  try { res = await fetch(manifestUrl(), { cache: 'no-cache' }); }
  catch { throw new RepoError('network', 'Could not load the file list.'); }
  if (res.status === 404) throw new RepoError('not-found', 'The file list has not been generated.');
  if (!res.ok) throw new RepoError('http', `The file list request failed with status ${res.status}.`);
  let data;
  try { data = await res.json(); }
  catch { throw new RepoError('not-found', 'The file list has not been generated.'); }
  const entries = (data.entries || []).map((e) => ({ path: e.path, size: e.size }));
  return buildRepository(entries, { source: 'manifest', generatedAt: data.generatedAt || null });
}
