// PGV — frontend scripts (theme toggle, mobile menu, prevent accidental caret, guestbook demo)
// Replace script.js with this file and do a hard refresh (Ctrl+F5) after updating.

(function () {
  const THEME_KEY = 'pgv-theme';
  const html = document.documentElement;
  const body = document.body;

  // Theme toggle
  const themeButtons = document.querySelectorAll('.theme-toggle');
  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
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

  // Guestbook demo (localStorage)
  const GB_KEY = 'pgv-guestbook';
  const gbForm = document.getElementById('guestbook-form');
  const gbListEl = document.getElementById('guestbook-list');
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }
  function renderGuestbook() {
    const arr = JSON.parse(localStorage.getItem(GB_KEY) || '[]');
    if (gbListEl) {
      gbListEl.innerHTML = arr.map(en => `<li><strong>${escapeHtml(en.name)}</strong> <span class="muted">— ${new Date(en.time).toLocaleString()}</span><div>${escapeHtml(en.message)}</div></li>`).join('');
    }
    const recent = document.getElementById('recent-guestbook');
    if (recent) {
      recent.innerHTML = arr.slice(0,5).map(en => `<li>${escapeHtml(en.name)}: ${escapeHtml(en.message.slice(0,60))}</li>`).join('');
    }
  }
  if (gbForm) {
    gbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = gbForm.name.value.trim();
      const message = gbForm.message.value.trim();
      if (!name || !message) return alert('Vyplňte jméno i vzkaz.');
      const arr = JSON.parse(localStorage.getItem(GB_KEY) || '[]');
      arr.unshift({ name, message, time: new Date().toISOString() });
      localStorage.setItem(GB_KEY, JSON.stringify(arr));
      gbForm.reset();
      renderGuestbook();
      alert('Vzkaz uložen lokálně (demo).');
    });
  }
  renderGuestbook();

  // Auto-align side-col so "Poslední vzkazy" lines up with the article grid level
  function alignSide() {
    try {
      const head = document.querySelector('.main-col .section-head');
      const side = document.querySelector('.side-col');
      if (!head || !side) return;
      // compute height of the header area above the article grid (including margin)
      // we measure the distance from the top of the .main-col to the top of the article grid (.card-grid)
      const mainCol = document.querySelector('.main-col');
      const cardGrid = document.querySelector('.main-col .card-grid');
      if (!mainCol || !cardGrid) {
        // fallback: use head height
        const h = head.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--main-section-head-h', (h) + 'px');
        return;
      }
      // compute how much vertical space the header consumes inside .main-col before .card-grid
      const mainRect = mainCol.getBoundingClientRect();
      const headRect = head.getBoundingClientRect();
      const gridRect = cardGrid.getBoundingClientRect();
      // offset relative to mainCol top
      const offset = (gridRect.top - mainRect.top);
      // apply this offset as margin-top for side-col so side cards align with grid top
      document.documentElement.style.setProperty('--main-section-head-h', offset + 'px');
    } catch (e) {
      // fail silently
      console.debug('alignSide error', e);
    }
  }
  function debounce(fn, wait){
    let t;
    return function(){
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  // call now (script is at end of body) and also on DOMContentLoaded/resize
  alignSide();
  document.addEventListener('DOMContentLoaded', alignSide);
  window.addEventListener('resize', debounce(alignSide, 120));

})();
