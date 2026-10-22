// Vercel build step. Runs on Vercel's servers, which can read the private repository,
// so the portal no longer needs to ask the GitHub API for the file list.
//
//   1. Copies the site and every subject folder into dist/ (skipping hidden folders such
//      as the root-level "Others", dot-folders, and build tooling).
//   2. Writes dist/portal/manifest.json: the list of every file path and its size.
//      The portal reads this one file instead of calling api.github.com.
//   3. Writes dist/portal/site.json (title, description, owner, name, branch), worked out
//      from the repository this build runs in, and stamps the title into dist/index.html.
//      Values set by hand in portal/config.js win over the automatic ones.
//
// Run it locally with:  node scripts/build.mjs   (then serve the dist/ folder)
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, relative, sep, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// Reuse the portal's own rules (hidden folders, ignored files) so the two never drift apart.
// config.js is a browser ES module, so load it through a temporary .mjs copy.
const tmp = join(tmpdir(), `portal-config-${process.pid}.mjs`);
writeFileSync(tmp, readFileSync(join(root, 'portal', 'config.js')));
const { CONFIG } = await import(pathToFileURL(tmp).href);
rmSync(tmp, { force: true });

// ---- which repository is this? -----------------------------------------------------------
const isAuto = (v) => v == null || v === '' || v === 'auto';

function fromGit() {
  const git = (...args) => {
    try { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
    catch { return ''; }
  };
  const m = git('config', '--get', 'remote.origin.url').match(/github\.com[:/]+([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  return { owner: m?.[1] || '', name: m?.[2] || '', branch: branch && branch !== 'HEAD' ? branch : '' };
}

function detectRepo() {
  const env = process.env;
  const [ghOwner = '', ghName = ''] = (env.GITHUB_REPOSITORY || '').split('/');
  const git = fromGit();
  return {
    owner: env.VERCEL_GIT_REPO_OWNER || ghOwner || git.owner,
    name: env.VERCEL_GIT_REPO_SLUG || ghName || git.name,
    branch: env.VERCEL_GIT_COMMIT_REF || env.GITHUB_REF_NAME || git.branch || 'main',
  };
}

const found = detectRepo();
const repo = {
  owner: isAuto(CONFIG.repo?.owner) ? found.owner : CONFIG.repo.owner,
  name: isAuto(CONFIG.repo?.name) ? found.name : CONFIG.repo.name,
  branch: isAuto(CONFIG.repo?.branch) ? found.branch : CONFIG.repo.branch,
};
// "Semester-VI" -> "Semester VI"
const prettyName = (n) => n.replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim();
const title = isAuto(CONFIG.site?.title) ? (prettyName(repo.name) || 'Study Portal') : CONFIG.site.title;
const description = isAuto(CONFIG.site?.description)
  ? `Notes, slides, papers and project files for ${title} in one place. Search across everything and read documents right here in the browser.`
  : CONFIG.site.description;

const hiddenRoots = new Set((CONFIG.hiddenSubjects || []).map((s) => s.toLowerCase()));
const ignoreRoots = new Set(CONFIG.ignore.roots);
const ignoreAnywhere = new Set(CONFIG.ignore.anywhere);

// Things that must never be uploaded with the site.
const neverCopy = new Set(['dist', 'scripts', 'node_modules', 'vercel.json', '.git', '.github', '.gitignore', '.vercel']);

// Should this repo-relative path appear in the portal's file list?
function listed(rel) {
  const segs = rel.split('/');
  const low = segs.map((s) => s.toLowerCase());
  if (CONFIG.ignore.hidden && segs.some((s) => s.startsWith('.'))) return false;
  if (ignoreRoots.has(low[0])) return false;
  if (low.some((s) => ignoreAnywhere.has(s))) return false;
  return !hiddenRoots.has(low[0]);
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// Copy the site. The root of the repository decides what is skipped; below the root,
// everything is copied as-is.
for (const name of readdirSync(root)) {
  if (neverCopy.has(name) || name.startsWith('.')) continue;
  if (hiddenRoots.has(name.toLowerCase())) { console.log(`skipped hidden folder: ${name}/`); continue; }
  cpSync(join(root, name), join(dist, name), { recursive: true });
}

// Build the manifest from what was actually copied.
const entries = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(dist, full).split(sep).join('/');
    const st = statSync(full);
    if (st.isDirectory()) { walk(full); continue; }
    if (listed(rel)) entries.push({ path: rel, size: st.size });
  }
})(dist);
entries.sort((a, b) => a.path.localeCompare(b.path, 'en', { numeric: true }));

const manifest = { generatedAt: new Date().toISOString(), entries };
mkdirSync(join(dist, 'portal'), { recursive: true });
writeFileSync(join(dist, 'portal', 'manifest.json'), JSON.stringify(manifest));

writeFileSync(join(dist, 'portal', 'site.json'), JSON.stringify({ title, description, ...repo }));

// The page title and description are in the static HTML so they are right before any script runs.
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const indexPath = join(dist, 'index.html');
if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, 'utf8')
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, (_, a, b) => `${a}${esc(description)}${b}`);
  writeFileSync(indexPath, html);
}
console.log(`Portal for ${repo.owner && repo.name ? `${repo.owner}/${repo.name}` : 'an unknown repository'} (${repo.branch}), titled "${title}".`);

const mb = entries.reduce((n, e) => n + e.size, 0) / 1048576;
console.log(`Built dist/ with ${entries.length} files listed (${mb.toFixed(1)} MB of content).`);
if (!existsSync(join(dist, 'index.html'))) { console.error('index.html is missing from dist/'); process.exit(1); }
