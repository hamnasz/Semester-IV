# Study portal

A static document portal that works for any repository of course files. It discovers every
subject folder and file automatically and lets you search, browse and preview them in the
browser. No backend, no API keys, and no file in the repository lists what content exists:
the repository itself is that list.

The same copy of this folder works for every repository (Semester II, III, IV, V, VI, VII, or
anything else). The title, repository name and branch are worked out at build time, so nothing
needs editing when you move it from one repository to another.

## Adding it to a repository

1. Delete the old frontend if the repository has one: `css/`, `js/`, `test/`, `package.json`
   and `package-lock.json`. (If you leave `css/`, `js/` and `test/` in place they stay hidden,
   but `package.json` makes Vercel run a pointless `npm install`.)
2. Copy these into the repository root, replacing the old `index.html`, `.gitignore` and
   `README.md`: `index.html`, `portal/`, `scripts/`, `vercel.json`, `.gitignore`, `README.md`.
   The subject folders stay exactly where they are.
3. In Vercel, import the repository (**Add New, Project**). Leave the framework preset on
   **Other**; the build command and output directory come from `vercel.json`. Public and
   private repositories both work.
4. Deploy. Every push to the production branch redeploys.

## How it finds content

During every Vercel build, `scripts/build.mjs` walks the repository and:

1. Copies the site and every subject folder into `dist/`, which is what Vercel serves. Folders
   listed in `hiddenSubjects` (see `portal/config.js`) are left out and never published.
2. Writes `dist/portal/manifest.json`, a list of every file path and size. The portal builds
   its subject list, folder tree, breadcrumbs and search from it. The browser never calls GitHub.
3. Writes `dist/portal/site.json` with the title, description, repository owner, name and
   branch, and puts the title into `dist/index.html`.

Where the identity comes from, in order: values you set in `portal/config.js`, then Vercel's
`VERCEL_GIT_REPO_OWNER`, `VERCEL_GIT_REPO_SLUG` and `VERCEL_GIT_COMMIT_REF`, then GitHub
Actions' `GITHUB_REPOSITORY`, then the git remote. The title is the repository name with
dashes turned into spaces (`Semester-VI` becomes "Semester VI"). If nothing can be detected
the portal is called "Study Portal".

## Settings (`portal/config.js`)

Most repositories need no changes. Everything set to `'auto'` is filled in by the build.

| Setting | What it does |
| --- | --- |
| `site.title`, `site.description` | Replace `'auto'` to name this portal yourself. |
| `repo.owner`, `repo.name`, `repo.branch` | Replace `'auto'` to point at a different repository. |
| `showRepoLink` | Adds a "Repository on GitHub" link in the footer. Leave off for private repositories. |
| `restrictedFolders` | Folders whose files can be viewed but never downloaded. Default: `FYP`. |
| `hiddenSubjects` | Root-level folders hidden and not published. Default: `Others`, plus `css`, `js`, `test` (the old frontend). Matching is by the first path segment only, so `FYP/Others/` stays visible. |
| `subjects` | Optional title and description for a folder, keyed by its name. |

Add a folder or file anywhere in the repository and push; it shows up on the next deploy.

## The one rule that matters

Anything inside a `restrictedFolders` folder can be viewed but never downloaded. This is
enforced in one place, `portal/js/core/permissions.js`, by path and never by file name.
`portal/js/core/urls.js#downloadUrl()` is the only function that produces a download link and
it returns `null` for a restricted path.

## Previews

PDF, Word, PowerPoint, Excel/CSV, images, HTML (sandboxed), Jupyter notebooks, Markdown/text
and source code all render in place (`portal/js/viewers/`). Each viewer library is vendored
under `portal/vendor/` (licences in `portal/vendor/licenses/`) and is only fetched the first
time a matching file is opened.

The deployed site is public to anyone with the link, even if the repository is private. To
restrict it, use Vercel's **Deployment Protection** (project Settings).

## Running it locally

    node scripts/build.mjs
    npx serve dist        # or: python3 -m http.server --directory dist

Locally, the identity is read from the git remote, so it works without any environment variables.
