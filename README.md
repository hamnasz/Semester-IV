# Semester IV — Field Journal

A diary-styled frontend for [`hamnasz/Semester-IV`](https://github.com/hamnasz/Semester-IV) —
every lecture, lab, outline and note, browsable and previewable in the browser, with a
one-click download for each file.

**This is a static site with no build step.** It doesn't store any copies of your course
files — `js/manifest.json` just lists paths, and everything is rendered on the fly straight
from `raw.githubusercontent.com/hamnasz/Semester-IV`. That keeps this repo tiny and fast to
push, no matter how large the course material repo gets.

## How it renders each file type
| Type | How it's shown |
|---|---|
| `.pdf` | fetched and rendered inline via the browser's native PDF viewer |
| `.docx` | converted to clean HTML in-browser with [mammoth.js](https://github.com/mwilliamson/mammoth.js) — reads like an actual page |
| `.pptx` / `.ppt` | previewed via the Microsoft Office Online viewer (very large decks may only offer download) |
| `.csv` | parsed with [PapaParse](https://www.papaparse.com/) and shown as a table |
| `.jpg` / `.jpeg` / `.png` | shown directly |
| `.txt` | shown as plain text |
| anything else | download-only, with a link to view it on GitHub |

Every entry also has a **download** button that fetches the file and saves it locally.

## File structure
```
index.html          the whole app shell (cover + journal + viewer)
css/style.css        all styling
js/subjects.js       per-subject colors/labels/ordering — edit this to re-theme a subject
js/manifest.json     generated list of every file (path, subject, category, size…)
js/app.js            navigation, search, and rendering logic
regenerate-manifest.py   re-scan the course repo and rebuild manifest.json
```

## Updating the file list later
Whenever files are added to or removed from the `Semester-IV` repo:
```bash
git clone https://github.com/hamnasz/Semester-IV.git /tmp/semester-iv
python3 regenerate-manifest.py /tmp/semester-iv
git add js/manifest.json
git commit -m "Update file index"
git push
```

## Deploying with GitHub Pages
1. Push this folder's contents to a GitHub repo (root of the repo, or a `docs/` folder — see below).
2. In that repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick the branch and folder you pushed to, save.
3. Your site will be live at `https://<username>.github.io/<repo>/` within a minute or two.

## Re-theming a subject
Colors, short labels and the little italic note under each subject's table of contents all
live in `js/subjects.js` — no other file needs to change.
