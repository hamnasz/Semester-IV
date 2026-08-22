(function(){
  "use strict";

  let MANIFEST = null;
  let FILES = [];
  let SUBJECTS = []; // ordered list of subject names present in the data

  const state = { subject: null, category: null, subcategory: null };

  // ---------- helpers ----------
  function rawUrl(path){
    const p = path.split('/').map(encodeURIComponent).join('/');
    return `https://raw.githubusercontent.com/${MANIFEST.githubUser}/${MANIFEST.githubRepo}/${MANIFEST.githubBranch}/${p}`;
  }
  function blobUrl(path){
    const p = path.split('/').map(encodeURIComponent).join('/');
    return `https://github.com/${MANIFEST.githubUser}/${MANIFEST.githubRepo}/blob/${MANIFEST.githubBranch}/${p}`;
  }
  function titleFromFilename(fn){
    return fn.replace(/\.[^/.]+$/, "").trim();
  }
  function formatSize(bytes){
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024*1024) return (bytes/1024).toFixed(0) + " KB";
    return (bytes/(1024*1024)).toFixed(1) + " MB";
  }
  function sortByOrder(list, order){
    return list.slice().sort((a,b)=>{
      const ia = order.indexOf(a), ib = order.indexOf(b);
      const ra = ia === -1 ? 999 : ia, rb = ib === -1 ? 999 : ib;
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b);
    });
  }
  function subjectMeta(name){
    return SUBJECT_META[name] || { short: name.slice(0,3).toUpperCase(), color:"#555", accent:"#eee", note:"" };
  }
  function el(tag, cls, html){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // ---------- boot ----------
  async function init(){
    const res = await fetch('js/manifest.json');
    MANIFEST = await res.json();
    FILES = MANIFEST.files;
    document.getElementById('fileCount').textContent = FILES.length;

    // preserve a sensible subject order: known subjects first (SUBJECT_META order), then any extras
    const present = Array.from(new Set(FILES.map(f => f.subject)));
    const known = Object.keys(SUBJECT_META).filter(s => present.includes(s));
    const extra = present.filter(s => !known.includes(s));
    SUBJECTS = known.concat(extra);

    renderTabs();
    selectSubject(SUBJECTS[0]);

    document.getElementById('openJournal').addEventListener('click', () => {
      document.getElementById('cover').hidden = true;
      document.getElementById('journal').hidden = false;
    });
    document.getElementById('toCover').addEventListener('click', () => {
      document.getElementById('journal').hidden = true;
      document.getElementById('cover').hidden = false;
    });

    setupSearch();
    setupViewer();
  }

  // ---------- tabs ----------
  function renderTabs(){
    const nav = document.getElementById('tabs');
    nav.innerHTML = '';
    SUBJECTS.forEach(subj => {
      const meta = subjectMeta(subj);
      const btn = el('button', 'tab');
      btn.style.background = meta.color;
      btn.dataset.subject = subj;
      btn.innerHTML = `<span>${meta.short} &middot; ${subj}</span>`;
      btn.addEventListener('click', () => selectSubject(subj));
      nav.appendChild(btn);
    });
  }

  function selectSubject(subject){
    state.subject = subject;
    state.category = null;
    state.subcategory = null;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.subject === subject));
    renderTOC();
  }

  // ---------- table of contents (left page) ----------
  function filesForSubject(subject){
    return FILES.filter(f => f.subject === subject);
  }

  function renderTOC(){
    const wrap = document.getElementById('tocPage');
    wrap.className = 'page-inner grain';
    const subject = state.subject;
    const meta = subjectMeta(subject);
    const files = filesForSubject(subject);

    const categories = Array.from(new Set(files.map(f => f.category)));
    const orderedCats = sortByOrder(categories, CATEGORY_ORDER);

    if (!state.category) state.category = orderedCats[0];

    let html = `<h2 class="toc-heading">${subject}</h2><p class="toc-note">${meta.note}</p>`;
    wrap.innerHTML = html;

    orderedCats.forEach(cat => {
      const catFiles = files.filter(f => f.category === cat);
      const catBtn = el('button', 'toc-cat' + (cat === state.category ? ' is-active' : ''));
      catBtn.innerHTML = `<span class="toc-cat__label">${cat}</span><span class="toc-cat__leader"></span><span class="toc-cat__count">${catFiles.length}</span>`;
      catBtn.addEventListener('click', () => {
        state.category = cat;
        state.subcategory = null;
        renderTOC();
        renderEntries();
      });
      wrap.appendChild(catBtn);

      if (cat === state.category){
        const subs = Array.from(new Set(catFiles.filter(f => f.subcategory).map(f => f.subcategory)));
        const orderedSubs = sortByOrder(subs, SUBCATEGORY_ORDER);
        orderedSubs.forEach(sub => {
          const subBtn = el('button', 'toc-sub' + (sub === state.subcategory ? ' is-active' : ''));
          const count = catFiles.filter(f => f.subcategory === sub).length;
          subBtn.textContent = `${sub} (${count})`;
          subBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            state.subcategory = (state.subcategory === sub) ? null : sub;
            renderTOC();
            renderEntries();
          });
          wrap.appendChild(subBtn);
        });
      }
    });

    renderEntries();
  }

  // ---------- entries (right page) ----------
  function renderEntries(){
    const wrap = document.getElementById('entriesPage');
    wrap.className = 'page-inner grain';
    const subject = state.subject, category = state.category;
    let files = filesForSubject(subject).filter(f => f.category === category);
    if (state.subcategory) files = files.filter(f => f.subcategory === state.subcategory);

    wrap.innerHTML = `<div class="entries-heading"><h2>${category}</h2><span class="entries-count">${files.length} ${files.length===1?'entry':'entries'}</span></div>`;

    if (!files.length){
      wrap.appendChild(el('p', 'entries-empty', 'No pages filed here yet.'));
      return;
    }

    // group: loose files (no subcategory) first, then by subcategory
    const groups = {};
    files.forEach(f => {
      const key = f.subcategory || '__loose__';
      (groups[key] = groups[key] || []).push(f);
    });
    const groupKeys = Object.keys(groups);
    const orderedKeys = sortByOrder(groupKeys.filter(k=>k!=='__loose__'), SUBCATEGORY_ORDER);
    if (groups['__loose__']) orderedKeys.unshift('__loose__');

    orderedKeys.forEach(key => {
      if (key !== '__loose__' && !state.subcategory) {
        wrap.appendChild(el('div', 'entries-group-title', key));
      } else if (key === '__loose__' && groupKeys.length > 1 && !state.subcategory) {
        wrap.appendChild(el('div', 'entries-group-title', 'general'));
      }
      groups[key].forEach(f => wrap.appendChild(renderEntryRow(f)));
    });
  }

  function renderEntryRow(f){
    const meta = subjectMeta(f.subject);
    const row = el('div', 'entry');
    const badge = el('div', 'entry__badge', f.ext.toUpperCase().slice(0,4));
    badge.style.background = meta.color;
    row.appendChild(badge);

    const main = el('div', 'entry__main');
    main.appendChild(el('div', 'entry__title', titleFromFilename(f.filename)));
    main.appendChild(el('div', 'entry__meta', `${formatSize(f.size)}`));
    row.appendChild(main);

    const actions = el('div', 'entry__actions');
    const viewBtn = el('button', 'entry-btn entry-btn--view', 'view');
    viewBtn.addEventListener('click', () => openViewer(f));
    const dlBtn = el('button', 'entry-btn entry-btn--dl', 'download');
    dlBtn.addEventListener('click', (ev) => { ev.stopPropagation(); triggerDownload(f, dlBtn); });
    actions.appendChild(viewBtn);
    actions.appendChild(dlBtn);
    row.appendChild(actions);

    return row;
  }

  // ---------- search ----------
  function setupSearch(){
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    let timer = null;

    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => runSearch(input.value.trim()), 120);
    });
    input.addEventListener('focus', () => { if (input.value.trim()) results.hidden = false; });
    document.addEventListener('click', (ev) => {
      if (!ev.target.closest('.masthead__search')) results.hidden = true;
    });

    function runSearch(q){
      if (!q){ results.hidden = true; return; }
      const ql = q.toLowerCase();
      const matches = FILES.filter(f =>
        f.filename.toLowerCase().includes(ql) ||
        f.subject.toLowerCase().includes(ql) ||
        (f.subcategory||'').toLowerCase().includes(ql) ||
        f.category.toLowerCase().includes(ql)
      ).slice(0, 24);

      results.innerHTML = '';
      results.hidden = false;
      if (!matches.length){
        results.appendChild(el('div', 'search-empty', `no pages match "${q}"`));
        return;
      }
      matches.forEach(f => {
        const meta = subjectMeta(f.subject);
        const row = el('button', 'search-row');
        row.innerHTML = `<span class="search-row__dot" style="background:${meta.color}"></span>
          <span class="search-row__title">${titleFromFilename(f.filename)}</span>
          <span class="search-row__subject">${f.subject}</span>`;
        row.addEventListener('click', () => {
          results.hidden = true;
          input.value = '';
          state.subject = f.subject; state.category = f.category; state.subcategory = f.subcategory;
          document.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.subject === f.subject));
          renderTOC();
          openViewer(f);
        });
        results.appendChild(row);
      });
    }
  }

  // ---------- download ----------
  async function triggerDownload(f, btnEl){
    const original = btnEl ? btnEl.textContent : null;
    if (btnEl){ btnEl.textContent = 'fetching…'; btnEl.disabled = true; }
    try{
      const res = await fetch(rawUrl(f.path));
      if (!res.ok) throw new Error('network');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = f.filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    }catch(e){
      window.open(rawUrl(f.path), '_blank');
    }finally{
      if (btnEl){ btnEl.textContent = original; btnEl.disabled = false; }
    }
  }

  // ---------- viewer ----------
  function setupViewer(){
    document.getElementById('viewerClose').addEventListener('click', closeViewer);
    document.getElementById('viewerBackdrop').addEventListener('click', closeViewer);
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeViewer(); });
  }

  function closeViewer(){
    document.getElementById('viewer').hidden = true;
    document.getElementById('viewerContent').innerHTML = '';
  }

  function openViewer(f){
    const viewer = document.getElementById('viewer');
    const content = document.getElementById('viewerContent');
    document.getElementById('viewerFilename').textContent = titleFromFilename(f.filename);
    document.getElementById('viewerMeta').textContent = `${f.subject} · ${f.category}${f.subcategory ? ' · '+f.subcategory : ''} · ${formatSize(f.size)}`;
    document.getElementById('viewerDownload').onclick = () => triggerDownload(f);
    content.innerHTML = `<div class="viewer__loading"><div class="ink-spinner"></div><p>turning to the page&hellip;</p></div>`;
    viewer.hidden = false;

    renderViewerContent(f, content).catch(err => {
      content.innerHTML = fallbackHTML(f, "This page wouldn't open for preview, but you can still download it.");
    });
  }

  function fallbackHTML(f, message){
    return `<div class="viewer__fallback">
      <strong>${titleFromFilename(f.filename)}</strong>
      <p>${message}</p>
      <div style="display:flex; gap:10px;">
        <button class="entry-btn entry-btn--dl" onclick="window.__downloadCurrent && window.__downloadCurrent()">download the file</button>
        <a class="entry-btn" style="text-decoration:none; display:inline-flex; align-items:center;" href="${blobUrl(f.path)}" target="_blank" rel="noopener">open on GitHub</a>
      </div>
    </div>`;
  }

  async function renderViewerContent(f, content){
    window.__downloadCurrent = () => triggerDownload(f);
    const ext = f.ext;
    const url = rawUrl(f.path);

    if (["jpg","jpeg","png","gif","webp"].includes(ext)){
      content.innerHTML = `<div class="viewer__img-wrap"><img src="${url}" alt="${f.filename}"></div>`;
      return;
    }

    if (ext === "pdf"){
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(new Blob([blob], {type:'application/pdf'}));
      content.innerHTML = `<embed src="${objUrl}" type="application/pdf" />`;
      return;
    }

    if (ext === "docx"){
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const buf = await res.arrayBuffer();
      const result = await window.mammoth.convertToHtml({ arrayBuffer: buf });
      content.innerHTML = `<div class="docx-page">${result.value}</div>`;
      return;
    }

    if (ext === "csv"){
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const text = await res.text();
      const parsed = window.Papa.parse(text.trim(), { skipEmptyLines: true });
      const rows = parsed.data;
      if (!rows.length){ content.innerHTML = fallbackHTML(f, "This sheet looks empty."); return; }
      let html = '<div class="ledger-wrap"><table class="ledger-table"><thead><tr>';
      rows[0].forEach(h => html += `<th>${h}</th>`);
      html += '</tr></thead><tbody>';
      rows.slice(1, 500).forEach(r => {
        html += '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>';
      });
      html += '</tbody></table></div>';
      if (rows.length > 501) html += `<p style="font-family:var(--mono); font-size:.75rem; color:var(--ink-faint); padding:0 20px;">showing first 500 of ${rows.length-1} rows — download for the full sheet</p>`;
      content.innerHTML = html;
      return;
    }

    if (ext === "txt"){
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const text = await res.text();
      const div = document.createElement('div');
      const pre = el('pre', 'note-page');
      pre.textContent = text;
      div.appendChild(pre);
      content.innerHTML = '';
      content.appendChild(pre);
      return;
    }

    if (["ppt","pptx","doc"].includes(ext)){
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
      content.innerHTML = `<div class="viewer__note">previewing via Microsoft Office viewer — very large decks may take a moment, or may only offer download</div><iframe src="${officeUrl}" allowfullscreen></iframe>`;
      return;
    }

    content.innerHTML = fallbackHTML(f, "There's no in-browser preview for this file type yet.");
  }

  document.addEventListener('DOMContentLoaded', init);
})();
