// script.js
// PGV — frontend scripts (theme toggle, mobile menu, prevent accidental caret, guestbook demo)
// Combined single-icon theme toggle + admin popover.
// Admin login is now automatically remembered for THIS browser session (sessionStorage).
// Replace script.js and hard-refresh (Ctrl+F5).

(function () {
  const THEME_KEY = 'pgv-theme';
  const ADMIN_SESSION_KEY = 'pgv-admin';
  const ADMIN_PASSWORD = 'PGVlasta'; // <- upravte heslo dle potřeby
  const html = document.documentElement;
  const body = document.body;
  const DEV_LOG = false;
  function dlog(...args){ if (DEV_LOG) console.debug(...args); }

  /* ---------- Theme init & helpers ---------- */
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch(e){ dlog('setTheme storage failed', e); }
    updateThemeIcon();
  }
  function toggleTheme() {
    const cur = html.getAttribute('data-theme') || 'light';
    setTheme(cur === 'light' ? 'dark' : 'light');
  }
  (function initTheme(){
    const saved = (() => { try { return localStorage.getItem(THEME_KEY); } catch(e){ return null; } })();
    if (saved === 'dark' || saved === 'light') setTheme(saved);
    else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  })();

  /* ---------- Combined Theme/Admin control UI ---------- */
  function isAdmin(){ return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'; }
  function setAdmin(val){
    if (val) sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
    if (typeof renderGuestbook === 'function') renderGuestbook();
    updateThemeVisual();
  }

  function ensureControl() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    if (getComputedStyle(headerRight).position === 'static') headerRight.style.position = 'relative';

    // remove old theme-toggle/admin-toggle elements if exist
    document.querySelectorAll('.theme-toggle, .admin-toggle, .theme-admin-btn').forEach(el => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });

    // create composite control if missing
    let btn = headerRight.querySelector('.theme-admin-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-admin-btn';
      btn.setAttribute('aria-label', 'Přepnout motiv / administrace');
      btn.setAttribute('title', 'Motiv / Admin');
      headerRight.appendChild(btn);

      // icon wrapper (single icon that changes based on current theme)
      const iconWrap = document.createElement('span');
      iconWrap.className = 'ta-icon';
      iconWrap.setAttribute('aria-hidden', 'true');
      btn.appendChild(iconWrap);

      // admin icon as accessible span (role=button) inside the same control
      const adminIcon = document.createElement('span');
      adminIcon.className = 'admin-icon';
      adminIcon.setAttribute('role', 'button');
      adminIcon.setAttribute('tabindex', '0');
      adminIcon.setAttribute('aria-label', 'Admin');
      adminIcon.title = 'Admin';
      adminIcon.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      // append admin icon to button
      btn.appendChild(adminIcon);

      // main button toggles theme, ignore clicks on adminIcon
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.admin-icon')) return;
        toggleTheme();
        try { btn.blur(); } catch(_) {}
      });

      // admin icon opens/closes popover
      adminIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const pop = headerRight.querySelector('.admin-popover');
        if (!pop) return;
        if (pop.classList.contains('open')) hidePopover();
        else showPopover();
        try { adminIcon.blur(); } catch(_) {}
      });
      adminIcon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          const pop = headerRight.querySelector('.admin-popover');
          if (!pop) return;
          showPopover();
        }
      });
    }

    // create popover if missing (same structure as before)
    let pop = headerRight.querySelector('.admin-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'admin-popover';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-modal', 'false');
      pop.innerHTML = `
  <h3>Přihlášení správce</h3>
  <div class="admin-row">
    <label for="admin-pass">Heslo</label>
    <div style="display:flex;gap:0.5rem;align-items:center">
      <input id="admin-pass" type="password" aria-label="Admin heslo" />
      <button id="admin-pass-toggle" class="admin-pass-toggle" type="button" aria-pressed="false" title="Zobrazit/skrýt heslo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div id="admin-error" class="admin-error" aria-live="polite"></div>
  </div>
  <div class="admin-actions">
    <button id="admin-cancel" class="btn btn-ghost">Zrušit</button>
    <button id="admin-submit" class="btn btn-primary">Přihlásit</button>
  </div>
`;
      headerRight.appendChild(pop);

      // wiring popover controls
      const passInput = pop.querySelector('#admin-pass');
      const passToggle = pop.querySelector('#admin-pass-toggle');
      const cancelBtn = pop.querySelector('#admin-cancel');
      const submitBtn = pop.querySelector('#admin-submit');
      const errEl = pop.querySelector('#admin-error');

      passToggle.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const isShown = passInput.type === 'text';
        passInput.type = isShown ? 'password' : 'text';
        passToggle.setAttribute('aria-pressed', String(!isShown));
      });

      cancelBtn.addEventListener('click', (ev) => { ev.preventDefault(); hidePopover(); });

      submitBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        const pwd = passInput.value || '';
        if (!ADMIN_PASSWORD) { errEl.textContent = 'Admin heslo není nastavené.'; return; }
        if (pwd === ADMIN_PASSWORD) {
          // IMPORTANT: remember admin automatically for THIS SESSION (sessionStorage)
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
          errEl.textContent = '';
          hidePopover();
          setAdmin(true);
          try { alert('Přihlášení jako admin proběhlo.'); } catch(_) {}
          passInput.value = '';
        } else {
          errEl.textContent = 'Nesprávné heslo.';
        }
      });

      // close on click outside
      document.addEventListener('click', function (e) {
        const target = e.target;
        const headerNow = document.querySelector('.header-right');
        const btnNow = headerNow && headerNow.querySelector('.theme-admin-btn');
        if (!pop.contains(target) && !(btnNow && btnNow.contains(target))) {
          hidePopover();
        }
      }, true);

      // ESC closes
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hidePopover(); });
    }

    // initial visual update
    updateThemeIcon();
    updateThemeVisual();
  }

  function showPopover() {
    const headerRight = document.querySelector('.header-right');
    const pop = headerRight && headerRight.querySelector('.admin-popover');
    const btn = headerRight && headerRight.querySelector('.theme-admin-btn');
    if (!pop || !btn) return;
    pop.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    const input = pop.querySelector('#admin-pass');
    if (input) { input.value = ''; setTimeout(() => input.focus(), 0); }
    const popRect = pop.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    if (popRect.right > vw - 8) { pop.style.right = '8px'; pop.style.left = 'auto'; }
    else { pop.style.right = '0'; pop.style.left = 'auto'; }
  }
  function hidePopover(){
    const headerRight = document.querySelector('.header-right');
    const pop = headerRight && headerRight.querySelector('.admin-popover');
    const btn = headerRight && headerRight.querySelector('.theme-admin-btn');
    if (!pop || !btn) return;
    pop.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    pop.style.right = '0';
  }

  function updateThemeIcon(){
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    const iconWrap = headerRight.querySelector('.ta-icon');
    if (!iconWrap) return;
    const theme = html.getAttribute('data-theme') || 'light';
    if (theme === 'dark') {
      // show sun icon (click => switch to light)
      iconWrap.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      iconWrap.title = 'Přepnout na světlé zobrazení';
    } else {
      // show moon icon (click => switch to dark)
      iconWrap.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      iconWrap.title = 'Přepnout na tmavé zobrazení';
    }
  }

  function updateThemeVisual(){
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    const btn = headerRight.querySelector('.theme-admin-btn');
    if (!btn) return;
    if (isAdmin()) btn.classList.add('admin-on'); else btn.classList.remove('admin-on');
  }

  /* ---------- Guestbook + helpers (unchanged logic) ---------- */
  const GB_KEY = 'pgv-guestbook';
  const MAX_ENTRIES = 200;
  const MAX_NAME_LEN = 80;
  const MAX_MSG_LEN = 2000;
  const gbForm = document.getElementById('guestbook-form');
  const gbListEl = document.getElementById('guestbook-list');

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }
  function safeParseJSON(s){ try { return JSON.parse(s || '[]'); } catch(e){ dlog('safeParseJSON failed', e); return []; } }

  function readEntries(){ try { const raw = localStorage.getItem(GB_KEY); return safeParseJSON(raw); } catch(e){ dlog('readEntries error', e); return []; } }
  function writeEntries(arr){ try { if (!Array.isArray(arr)) arr=[]; if (arr.length>MAX_ENTRIES) arr=arr.slice(0,MAX_ENTRIES); localStorage.setItem(GB_KEY, JSON.stringify(arr)); return true; } catch(e){ console.error('Nelze uložit vzkaz', e); return false; } }

  function deleteEntryAt(index){
    if (!isAdmin()){ alert('Pro smazání vzkazu se přihlaste jako admin.'); return; }
    const arr = readEntries();
    if (index<0 || index>=arr.length) return;
    if (!confirm('Opravdu smazat tento vzkaz?')) return;
    arr.splice(index,1);
    writeEntries(arr);
    renderGuestbook();
  }

  function renderGuestbook(){
    try {
      const arr = readEntries();
      if (gbListEl){
        gbListEl.innerHTML = arr.map((en,i) => {
          const when = en.time ? new Date(en.time).toLocaleString() : '';
          const delBtn = isAdmin() ? `<button class="gb-delete" data-index="${i}" aria-label="Smazat vzkaz" style="margin-left:0.5rem;padding:0.25rem 0.45rem;border-radius:6px;border:1px solid rgba(255,80,80,0.12);background:transparent;color:inherit;cursor:pointer">Smazat</button>` : '';
          return `<li><strong>${escapeHtml(en.name)}</strong> <span class="muted">— ${escapeHtml(when)}</span><div>${escapeHtml(en.message)}</div>${delBtn}</li>`;
        }).join('');
      }
      const recent = document.getElementById('recent-guestbook');
      if (recent) recent.innerHTML = arr.slice(0,5).map(en => `<li>${escapeHtml(en.name)}: ${escapeHtml((en.message||'').slice(0,60))}</li>`).join('');
      if (gbListEl) gbListEl.querySelectorAll('.gb-delete').forEach(b => { b.removeEventListener('click', handleDeleteClick); b.addEventListener('click', handleDeleteClick); });
    } catch(e){ console.error('renderGuestbook error', e); }
  }
  function handleDeleteClick(e){ const idx = e.currentTarget && e.currentTarget.getAttribute && e.currentTarget.getAttribute('data-index'); if (idx==null) return; deleteEntryAt(parseInt(idx,10)); }

  if (gbForm){
    let statusEl = document.getElementById('guestbook-status');
    if (!statusEl){ statusEl = document.createElement('div'); statusEl.id='guestbook-status'; statusEl.style.marginTop='0.5rem'; gbForm.appendChild(statusEl); }
    gbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const nameInput = gbForm.elements['name'];
        const msgInput = gbForm.elements['message'];
        const name = (nameInput && nameInput.value||'').trim().slice(0,MAX_NAME_LEN);
        const message = (msgInput && msgInput.value||'').trim().slice(0,MAX_MSG_LEN);
        if (!name || !message){ statusEl.textContent='Vyplňte jméno i vzkaz.'; statusEl.style.color='crimson'; return; }
        const arr = readEntries();
        arr.unshift({ name, message, time: new Date().toISOString() });
        if (arr.length>MAX_ENTRIES) arr.length = MAX_ENTRIES;
        const ok = writeEntries(arr);
        if (!ok){ statusEl.textContent='Chyba při ukládání vzkazu'; statusEl.style.color='crimson'; return; }
        gbForm.reset(); renderGuestbook();
        statusEl.textContent='Vzkaz odeslán.'; statusEl.style.color='var(--muted)';
        setTimeout(()=>{ statusEl.textContent=''; }, 2500);
      } catch(err){ console.error('guestbook submit error', err); }
    });
  }

  /* ---------- Align side-col (unchanged) ---------- */
  function alignSide(){
    try {
      const twoCol = document.querySelector('.two-col');
      const mainCol = document.querySelector('.main-col');
      const cardGrid = document.querySelector('.main-col .card-grid');
      const side = document.querySelector('.side-col');
      if (!twoCol || !mainCol || !cardGrid || !side){ document.documentElement.style.setProperty('--main-section-head-h','0px'); return; }
      const isTwoCol = window.matchMedia && window.matchMedia('(min-width: 760px)').matches;
      if (!isTwoCol){ document.documentElement.style.setProperty('--main-section-head-h','0px'); return; }
      const mainRect = mainCol.getBoundingClientRect();
      const gridRect = cardGrid.getBoundingClientRect();
      const offset = Math.max(0, Math.round(gridRect.top - mainRect.top));
      document.documentElement.style.setProperty('--main-section-head-h', offset + 'px');
    } catch(e){ dlog('alignSide error', e); document.documentElement.style.setProperty('--main-section-head-h','0px'); }
  }
  function debounce(fn, wait){ let t; return function(){ clearTimeout(t); t=setTimeout(fn, wait); }; }

  /* ---------- init ---------- */
  ensureControl();
  // if admin was already set in this session, make sure visuals reflect that
  if (isAdmin()) updateThemeVisual();
  renderGuestbook();
  try { alignSide(); } catch(e){}
  document.addEventListener('DOMContentLoaded', alignSide);
  window.addEventListener('load', alignSide);
  window.addEventListener('resize', debounce(alignSide, 120));

})();
