#!/usr/bin/env python3
"""
Regenerate js/manifest.json by scanning a local clone of the Semester-IV repo.

Usage:
    git clone https://github.com/hamnasz/Semester-IV.git /tmp/semester-iv
    python3 regenerate-manifest.py /tmp/semester-iv

Run this whenever files are added to / removed from the Semester-IV repo,
then commit the updated js/manifest.json to this (the frontend) repo.
"""
import os, sys, json

GITHUB_USER = "hamnasz"
GITHUB_REPO = "Semester-IV"
GITHUB_BRANCH = "main"

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 regenerate-manifest.py /path/to/cloned/Semester-IV")
        sys.exit(1)
    root = sys.argv[1]
    entries = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d != ".git"]
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, root)
            if rel == "README.md":
                continue
            parts = rel.split(os.sep)
            subject = parts[0]
            category = parts[1] if len(parts) > 2 else "General"
            subcategory = parts[2] if len(parts) > 3 else None
            ext = os.path.splitext(fn)[1].lower().lstrip(".")
            entries.append({
                "path": rel.replace(os.sep, "/"),
                "subject": subject,
                "category": category,
                "subcategory": subcategory,
                "filename": fn,
                "ext": ext,
                "size": os.path.getsize(full),
            })
    entries.sort(key=lambda e: (e["subject"], e["category"], e["subcategory"] or "", e["filename"]))
    manifest = {
        "githubUser": GITHUB_USER,
        "githubRepo": GITHUB_REPO,
        "githubBranch": GITHUB_BRANCH,
        "generatedFileCount": len(entries),
        "files": entries,
    }
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "js", "manifest.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(entries)} files to {out_path}")

if __name__ == "__main__":
    main()
