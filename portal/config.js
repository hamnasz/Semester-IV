/**
 * Portal configuration. This is the only file you normally need to edit, and for most
 * repositories you do not need to edit it at all.
 * Subjects, folders and files are listed by scripts/build.mjs during the Vercel build,
 * so adding a folder or a file never needs a code change.
 *
 * Anything set to 'auto' is worked out at build time from the repository the build runs
 * in (owner, name and branch from Vercel/GitHub, or from the git remote), and the title is
 * made from the repository name: "Semester-VI" becomes "Semester VI". Replace 'auto' with
 * a value to override it for one repository.
 */
export const CONFIG = {
  site: { title: 'auto', description: 'auto' },

  repo: { owner: 'auto', name: 'auto', branch: 'auto' },

  // Shows a "Repository on GitHub" link in the footer. Leave it off for a private
  // repository (visitors would only reach a 404); turn it on for a public one.
  showRepoLink: false,

  // Where file contents are served from: the same site (resolved relative to index.html).
  // scripts/build.mjs copies every subject folder into the deployed site next to index.html.
  contentBase: './',

  /**
   * Download rule. Anything whose repository path is inside one of these
   * folders can be viewed but never downloaded from this UI.
   * Paths are matched from the repository root, on folder boundaries, ignoring case
   * (so "FYP" covers "FYP/Others/x.pdf" but not "FYP-old/x.pdf").
   * Everything else, including subjects you add later, gets normal downloads.
   */
  restrictedFolders: ['FYP'],

  /**
   * Folders hidden from the portal entirely (not just view-only). Matched only at the
   * repository ROOT, so listing "Others" here hides the top-level Others/ folder and
   * everything inside it, but a nested folder that happens to share the same name —
   * such as FYP/Others/ — is a different path and stays fully visible.
   */
  hiddenSubjects: ['Others', 'css', 'js', 'test'],
  // 'css', 'js' and 'test' are the folders of the older single-page frontend that some of
  // these repositories used to carry. Hiding them keeps them from showing up as subjects
  // (and from being published) until they are deleted from the repository.

  // Repository items that belong to the site itself and should not show up as content.
  // Compared case-insensitively. Anything starting with a dot is hidden too.
  // 'manifest.json' is listed here only so a stray leftover copy never shows up as a
  // browsable file — nothing reads it anymore; the file list always comes from the API.
  ignore: {
    roots: [
      'index.html', '404.html', 'portal', 'manifest.json', 'readme.md', 'license', 'license.md',
      'license.txt', 'cname', 'robots.txt', 'package.json', 'package-lock.json', 'node_modules',
    ],
    anywhere: ['.ds_store', 'thumbs.db', 'desktop.ini', '__macosx'],
    hidden: true,
  },

  // Optional per-folder display overrides, keyed by the top-level folder name.
  // Folders without an entry get their name and a generated summary.
  subjects: {
    FYP: {
      title: 'FYP',
      description: 'Final year project: DocBot AI proposals, defence slides, research analysis and figures.',
    },
  },

  recentCount: 8,
  // Files bigger than this ask before loading into the previewer.
  maxPreviewMB: 40,
};
