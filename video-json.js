// js/videa-json.js
(function () {
  const GRID_SELECTOR = '#video-grid';
  const JSON_PATH = '/videos.json';

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function getYouTubeId(url) {
    if (!url) return null;
    let m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/))([0-9A-Za-z_-]{11})/);
    if (m && m[1]) return m[1];
    m = url.match(/[?&]v=([0-9A-Za-z_-]{11})/);
    return m ? m[1] : null;
  }

  function createCard(item) {
    const card = document.createElement('div');
    card.className = 'video-card';

    const title = item.title || '';

    const id = getYouTubeId(item.url || item.src || '');
    if (id) {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id);
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.title = title || 'video';
      card.appendChild(iframe);
    } else if (item.embed) {
      const tmp = document.createElement('div');
      tmp.innerHTML = item.embed;
      const iframe = tmp.querySelector('iframe');
      if (iframe) {
        const safe = document.createElement('iframe');
        safe.src = iframe.src || iframe.getAttribute('data-src') || '';
        safe.loading = 'lazy';
        safe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        safe.setAttribute('allowfullscreen', '');
        safe.title = title || 'video';
        card.appendChild(safe);
      } else {
        const ph = document.createElement('div');
        ph.style.padding = '36% 0';
        ph.style.background = '#111';
        card.appendChild(ph);
      }
    } else {
      const ph = document.createElement('div');
      ph.style.padding = '36% 0';
      ph.style.background = '#111';
      card.appendChild(ph);
    }

    const t = document.createElement('div');
    t.className = 'video-title';
    t.textContent = title || 'YouTube video';
    card.appendChild(t);

    return card;
  }

  async function loadAndRender() {
    const container = document.querySelector(GRID_SELECTOR);
    if (!container) {
      return console.warn('Neexistuje kontejner pro videa: ' + GRID_SELECTOR);
    }
    container.setAttribute('aria-busy', 'true');
    container.innerHTML = '<div class="video-card">Načítám…</div>';
    try {
      const res = await fetch(JSON_PATH, { cache: 'no-store' });
      if (!res.ok) throw new Error('videos.json nenalezen (HTTP ' + res.status + ')');
      const data = await res.json();
      const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      container.innerHTML = '';
      if (!items.length) {
        container.innerHTML = '<div class="video-card">Žádná videa</div>';
        container.setAttribute('aria-busy', 'false');
        return;
      }
      items.forEach(it => {
        const card = createCard(it);
        container.appendChild(card);
      });
      container.setAttribute('aria-busy', 'false');
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="video-card" style="color:#f66">Chyba při načítání: ' + escapeHtml(err.message || err) + '</div>';
      container.setAttribute('aria-busy', 'false');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndRender);
  } else {
    loadAndRender();
  }
})();
