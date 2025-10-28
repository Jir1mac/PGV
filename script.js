// PGV — frontend scripts (theme toggle, mobile menu, prevent accidental caret, guestbook demo)
// Hardened + admin-delete for guestbook entries (localStorage).
// Replace script.js with this file and do a hard refresh (Ctrl+F5) after updating.

(function () {
  const THEME_KEY = 'pgv-theme';
  const ADMIN_SESSION_KEY = 'pgv-admin';
  const ADMIN_PASSWORD = 'PGVlasta'; // <- HESLO!
  const html = document.documentElement;
  const body = document.body;
  const DEV_LOG = false; // zapnout pro ladění

  function dlog(...args){ if (DEV_LOG) console.debug.apply(console, args); }

  // Theme toggle
  const themeButtons = document.querySelectorAll('.theme-toggle');
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { dlog('localStorage setTheme failed', e); }
    themeButtons.forEach(b => b.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false'));
  }
  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
  }
  themeButtons.forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); toggleTheme(); }));

  const saved = (() => { try { return localStorage.getItem(THEME_KEY); } catch(e){ return null; } })();
  if (saved === 'dark' || saved === 'light') setTheme(saved);
  else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }

  // Admin UI (login/logout, show delete buttons)
  function isAdmin() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }
  function setAdmin(val) {
    if (val) sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
    // re-render guestbook to show/hide delete buttons
    renderGuestbook();
    updateAdminButton();
  }

  // create admin button in header-right if not present
  function ensureAdminButton() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    if (headerRight.querySelector('.admin-toggle')) return; // already exists

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'admin-toggle';
    btn.style.marginLeft = '0.5rem';
    btn.style.padding = '0.35rem 0.6rem';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    btn.style.background = 'transparent';
    btn.style.border = '1px solid rgba(0,0,0,0.06)';
    btn.style.color = 'inherit';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isAdmin()) {
        // logout
        if (confirm('Opravdu chcete odhlásit admina?')) {
          setAdmin(false);
        }
        return;
      }
      // login flow: simple prompt (replace with better auth if needed)
      const pwd = prompt('Zadejte admin heslo:');
      if (pwd === null) return; // cancelled
      if (pwd === ADMIN_PASSWORD) {
        setAdmin(true);
        alert('Přihlášení jako admin proběhlo. Nyní můžete mazat vzkazy.');
      } else {
        alert('Nesprávné heslo.');
      }
    });

    headerRight.appendChild(btn);
    updateAdminButton();
  }

  function updateAdminButton() {
    const btn = document.querySelector('.admin-toggle');
    if (!btn) return;
    if (isAdmin()) {
      btn.textContent = 'Admin (odhlásit)';
      btn.style.borderColor = 'rgba(255,80,80,0.14)';
      btn.style.background = 'rgba(255,80,80,0.06)';
    } else {
      btn.textContent = 'Admin (přihlásit)';
      btn.style.borderColor = 'transparent';
      btn.style.background = 'transparent';
    }
  }

  // Mobile menu
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.getElementById('main-nav');
  function openNav() { body.classList.add('nav-open'); if (navToggle) navToggle.setAttribute('aria-expanded', 'true'); const first = mainNav && mainNav.querySelector('a'); if (first) first.focus(); }
  function closeNav() { body.classList.remove('nav-open'); if (navToggle) navToggle.setAttribute('aria-expanded', 'false'); if (navToggle) navToggle.focus(); }
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', (e) => { e.preventDefault(); const exp = navToggle.getAttribute('aria-expanded') === 'true'; if (exp) closeNav(); else openNav(); });
    mainNav.addEventListener('click', (e) => { if (e.target.tagName === 'A' && body.classList.contains('nav-open')) setTimeout(closeNav, 120); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && body.classList.contains('nav-open')) closeNav(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 760 && body.classList.contains('nav-open')) closeNav(); });
  }

  // Prevent accidental caret insertion on single clicks in non-editable areas:
  function isInteractiveOrEditable(node) {
    if (!node) return false;
    const interactiveSelector = 'input, textarea, select, button, a, [contenteditable="true"], [role="textbox"], [tabindex]:not([tabindex="-1"])';
    return !!node.closest && !!node.closest(interactiveSelector);
  }
  document.addEventListener('click', function (e) {
    try {
      if (isInteractiveOrEditable(e.target)) return;
      if (e.detail !== 1) return; // only handle single click
      const sel = window.getSelection && window.getSelection();
      if (!sel) return;
      if (sel.isCollapsed) {
        setTimeout(() => {
          const sel2 = window.getSelection && window.getSelection();
          if (!sel2) return;
          if (sel2.isCollapsed) sel2.removeAllRanges();
        }, 0);
      }
    } catch (err) { console.error(err); }
  }, true);

  // Light hero safety: blur any non-input activeElement on mousedown inside hero (not preventing selection)
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousedown', (e) => {
      if (isInteractiveOrEditable(e.target)) return;
      const active = document.activeElement;
      if (active && !active.matches('input, textarea, select, button, a, [contenteditable="true"]')) {
        try { active.blur(); } catch(_) {}
      }
    }, { passive: true });
  }

  /* ---------- Guestbook (localStorage) ---------- */
  const GB_KEY = 'pgv-guestbook';
  const MAX_ENTRIES = 200;      // maximum zpráv ukládat
  const MAX_NAME_LEN = 80;
  const MAX_MSG_LEN = 2000;
  const gbForm = document.getElementById('guestbook-form');
  const gbListEl = document.getElementById('guestbook-list');

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

  function safeParseJSON(s){
    try { return JSON.parse(s || '[]'); }
    catch(e){ dlog('safeParseJSON failed', e); return []; }
  }

  function readEntries(){
    try {
      const raw = localStorage.getItem(GB_KEY);
      return safeParseJSON(raw);
    } catch (e) {
      dlog('readEntries error', e);
      return [];
    }
  }

  function writeEntries(arr){
    try {
      // limit size
      if (!Array.isArray(arr)) arr = [];
      if (arr.length > MAX_ENTRIES) arr = arr.slice(0, MAX_ENTRIES);
      localStorage.setItem(GB_KEY, JSON.stringify(arr));
      return true;
    } catch (e) {
      console.error('Nelze uložit vzkaz (localStorage):', e);
      return false;
    }
  }

  // delete entry by index (only admin)
  function deleteEntryAt(index) {
    if (!isAdmin()) {
      alert('Pro smazání vzkazu se přihlaste jako admin.');
      return;
    }
    const arr = readEntries();
    if (index < 0 || index >= arr.length) return;
    if (!confirm('Opravdu smazat tento vzkaz?')) return;
    arr.splice(index, 1);
    writeEntries(arr);
    renderGuestbook();
  }

  // render guestbook; show delete buttons only if admin
  function renderGuestbook(){
    try {
      const arr = readEntries();
      if (gbListEl) {
        gbListEl.innerHTML = arr.map((en, i) => {
          const when = en.time ? new Date(en.time).toLocaleString() : '';
          const delBtn = isAdmin() ? `<button class="gb-delete" data-index="${i}" aria-label="Smazat vzkaz" style="margin-left:0.5rem;padding:0.25rem 0.45rem;border-radius:6px;border:1px solid rgba(255,80,80,0.12);background:transparent;color:inherit;cursor:pointer">Smazat</button>` : '';
          return `<li><strong>${escapeHtml(en.name)}</strong> <span class="muted">— ${escapeHtml(when)}</span><div>${escapeHtml(en.message)}</div>${delBtn}</li>`;
        }).join('');
      }
      const recent = document.getElementById('recent-guestbook');
      if (recent) {
        recent.innerHTML = arr.slice(0,5).map(en => `<li>${escapeHtml(en.name)}: ${escapeHtml((en.message || '').slice(0,60))}</li>`).join('');
      }
      // attach event listener for delete buttons (delegation)
      if (gbListEl) {
        gbListEl.querySelectorAll('.gb-delete').forEach(b => {
          b.removeEventListener('click', handleDeleteClick);
          b.addEventListener('click', handleDeleteClick);
        });
      }
    } catch (e) {
      console.error('renderGuestbook error', e);
    }
  }

  function handleDeleteClick(e) {
    const idx = e.currentTarget && e.currentTarget.getAttribute && e.currentTarget.getAttribute('data-index');
    if (idx == null) return;
    const index = parseInt(idx, 10);
    deleteEntryAt(index);
  }

  if (gbForm) {
    // Inline status message element (optional, created dynamically)
    let statusEl = document.getElementById('guestbook-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'guestbook-status';
      statusEl.style.marginTop = '0.5rem';
      gbForm.appendChild(statusEl);
    }

    gbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const nameInput = gbForm.elements['name'];
        const msgInput = gbForm.elements['message'];
        const name = (nameInput && nameInput.value || '').trim().slice(0, MAX_NAME_LEN);
        const message = (msgInput && msgInput.value || '').trim().slice(0, MAX_MSG_LEN);
        if (!name || !message) {
          statusEl.textContent = 'Vyplňte jméno i vzkaz.';
          statusEl.style.color = 'crimson';
          return;
        }
        const arr = readEntries();
        arr.unshift({ name, message, time: new Date().toISOString() });
        // enforce limit
        if (arr.length > MAX_ENTRIES) arr.length = MAX_ENTRIES;
        const ok = writeEntries(arr);
        if (!ok) {
          statusEl.textContent = 'Chyba při ukládání lokálně.';
          statusEl.style.color = 'crimson';
          return;
        }
        gbForm.reset();
        renderGuestbook();
        // jemná inline notifikace
        statusEl.textContent = 'Vzkaz uložen lokálně (demo).';
        statusEl.style.color = 'var(--muted)';
        setTimeout(() => { statusEl.textContent = ''; }, 2500);
      } catch (err) {
        console.error('guestbook submit error', err);
      }
    });
  }

  // initial render
  ensureAdminButton();
  renderGuestbook();

  /* ---------- Auto-align side-col to article grid ---------- */
  function alignSide() {
    try {
      const twoCol = document.querySelector('.two-col');
      const head = document.querySelector('.main-col .section-head');
      const mainCol = document.querySelector('.main-col');
      const cardGrid = document.querySelector('.main-col .card-grid');
      const side = document.querySelector('.side-col');
      if (!twoCol || !head || !mainCol || !cardGrid || !side) {
        dlog('alignSide: missing element(s)', { twoCol, head, mainCol, cardGrid, side });
        document.documentElement.style.setProperty('--main-section-head-h', '0px');
        return;
      }

      // Only apply offset on wide (two-column) layouts - avoid pushing side-col on mobile where it stacks below
      const isTwoCol = window.matchMedia && window.matchMedia('(min-width: 760px)').matches;
      if (!isTwoCol) {
        document.documentElement.style.setProperty('--main-section-head-h', '0px');
        return;
      }

      // compute how much vertical space the header consumes inside .main-col before .card-grid
      const mainRect = mainCol.getBoundingClientRect();
      const gridRect = cardGrid.getBoundingClientRect();
      const offset = Math.max(0, Math.round(gridRect.top - mainRect.top)); // px
      const tweak = 0; // např. -8 nebo +8 pokud chcete jemné doladění
      document.documentElement.style.setProperty('--main-section-head-h', (offset + tweak) + 'px');
      dlog('alignSide set --main-section-head-h', offset + tweak);
    } catch (e) {
      console.debug('alignSide error', e);
      document.documentElement.style.setProperty('--main-section-head-h', '0px');
    }
  }
  function debounce(fn, wait){
    let t;
    return function(){
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  // initial + DOMContentLoaded + load (wait for images) + resize
  try { alignSide(); } catch(e){}
  document.addEventListener('DOMContentLoaded', alignSide);
  window.addEventListener('load', alignSide); // důležité: počkejte na obrázky
  window.addEventListener('resize', debounce(alignSide, 120));

})();
