// Fills in the settings that config.js leaves on 'auto' (site title, description and the
// repository's owner, name and branch). scripts/build.mjs works them out for whichever
// repository the portal is built in and writes them to portal/site.json. Values you set by
// hand in config.js are never replaced.
import { CONFIG } from '../../config.js';
import { siteBase } from './urls.js';

const isAuto = (v) => v == null || v === '' || v === 'auto';

export async function loadSite() {
  let data = {};
  try {
    const res = await fetch(new URL('portal/site.json', siteBase()).href, { cache: 'no-cache' });
    if (res.ok) data = (await res.json()) || {};
  } catch { /* fall back to the defaults below */ }

  const fill = (target, key, value) => { if (isAuto(target[key])) target[key] = value; };
  fill(CONFIG.site, 'title', data.title || 'Study Portal');
  fill(CONFIG.site, 'description', data.description ||
    `Notes, slides, papers and project files for ${CONFIG.site.title} in one place. Search across everything and read documents right here in the browser.`);
  fill(CONFIG.repo, 'owner', data.owner || '');
  fill(CONFIG.repo, 'name', data.name || '');
  fill(CONFIG.repo, 'branch', data.branch || 'main');
  document.title = CONFIG.site.title;
}
