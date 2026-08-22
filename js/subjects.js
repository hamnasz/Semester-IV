// Metadata for each subject "tab" in the binder. Order here = tab order.
const SUBJECT_META = {
  "Database": {
    short: "DB", color: "#2f6f6a", accent: "#e7f2f0",
    note: "queries, schemas & the MySQL labs"
  },
  "Linear Algebra": {
    short: "LA", color: "#3a4a7a", accent: "#eaecf5",
    note: "vector spaces, eigen-everything"
  },
  "Machine Learning": {
    short: "ML", color: "#8a1f2d", accent: "#f6e9ea",
    note: "the deck that got messiest, fastest"
  },
  "Operating System": {
    short: "OS", color: "#46525c", accent: "#eceeef",
    note: "processes, threads & lab writeups"
  },
  "Psychology": {
    short: "PSY", color: "#6a3b6a", accent: "#f1e9f1",
    note: "the reading-heavy one"
  },
  "Entrepreneurship": {
    short: "ENT", color: "#b8862f", accent: "#faf1e2",
    note: "canvases, mixes & pitch decks"
  },
  "Teaching of Holy Quran": {
    short: "THQ", color: "#1f5c3a", accent: "#e9f2ec",
    note: "course outline"
  },
  "Others": {
    short: "MISC", color: "#6b7a3a", accent: "#f0f2e6",
    note: "loose pages that didn't fit a spine"
  }
};

// Category display order within a subject (unlisted categories sort after these, alphabetically)
const CATEGORY_ORDER = ["Outline", "Outlines", "Mids", "Finals", "General"];

// Subcategory display order within a category
const SUBCATEGORY_ORDER = ["Slides", "Notes", "Digital Notes", "Ex", "Assignment", "Lab", "Lab Manual"];
