/* Glosario Ciber · Sitio estático, sin frameworks ni rastreo de usuarios. */
(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const state = {
    data: null,
    query: '',
    category: 'all',
    type: 'all',
    sort: 'original',
    favoritesOnly: false,
    favorites: loadFavorites(),
  };
  const icons = {
    landmark: '<path d="M3 10h18M5 10v10m5-10v10m4-10v10m5-10v10M2 21h20M12 2l10 6H2l10-6Z"/>',
    shield: '<path d="M12 2 21 6v6c0 6-4 9-9 11-5-2-9-5-9-11V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    key: '<circle cx="8" cy="14" r="5"/><path d="m12 10 9-9M16 6l3 3M18 4l3 3"/>',
    activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
    scale: '<path d="M12 3v18M4 7h16M5 7l-3 8h6L5 7Zm14 0-3 8h6l-3-8ZM8 21h8"/>',
    chart: '<path d="M4 20V12M10 20V8M16 20V4M22 20H2"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-16-4 24"/>',
    fingerprint: '<path d="M7 8a6 6 0 0 1 10 0M5 12a7 7 0 0 1 14 0M8 14v-2a4 4 0 0 1 8 0v4M12 14v5M5 16v-3M19 14v2M8 19l-1 2M16 19l1 2"/>',
  };
  let toastTimer;

  function escapeHtml(input) {
    return String(input ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function normalize(input) {
    return String(input ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function loadFavorites() {
    try {
      const ids = JSON.parse(localStorage.getItem('glosario-ciber-favoritos') || '[]');
      return new Set(Array.isArray(ids) ? ids.filter((t) => typeof t === 'string') : []);
    } catch { return new Set(); }
  }
  function saveFavorites() {
    try { localStorage.setItem('glosario-ciber-favoritos', JSON.stringify([...state.favorites])); } catch { /* almacenamiento deshabilitado */ }
  }
  function toast(message) {
    const el = byId('toast');
    clearTimeout(toastTimer);
    el.textContent = message;
    el.classList.add('show');
    toastTimer = setTimeout(() => el.classList.remove('show'), 3100);
  }
  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.shield}</svg>`;
  }
  function initTheme() {
    let theme = 'light';
    try { theme = localStorage.getItem('glosario-ciber-tema') || 'light'; } catch { /* sin persistencia */ }
    applyTheme(theme);
    byId('themeToggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('glosario-ciber-tema', next); } catch { /* sin persistencia */ }
    });
  }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    byId('themeIcon').textContent = theme === 'dark' ? '☀' : '☾';
    byId('themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  }
  function categoryById(id) { return state.data.categories.find((c) => c.id === id); }
  function sourceById(id) { return state.data.sources.find((source) => source.id === id); }
  function classification(term) {
    if (term.classification === 'Definición Normativa') return { label: 'Marco normativo', className: 'norm' };
    if (term.classification === 'Concepto Legal Aplicado') return { label: 'Aplicación normativa', className: 'norm' };
    if (term.classification === 'Concepto De Guía Spdp') return { label: 'Guía SPDP', className: 'guide' };
    return { label: 'Explicación técnica', className: '' };
  }
  function renderCategories() {
    byId('catTotal').textContent = state.data.categories.length;
    byId('termTotal').textContent = state.data.terms.length;
    byId('categoryGrid').innerHTML = state.data.categories.map((c) => `
      <button type="button" class="category-tile" data-category="${escapeHtml(c.id)}" aria-pressed="${state.category === c.id}">
        <span class="category-top"><span class="category-icon">${icon(c.icon)}</span><span class="category-num">${String(c.order).padStart(2, '0')} / ${String(state.data.categories.length).padStart(2, '0')}</span></span>
        <span class="category-name">${escapeHtml(c.name)}</span>
        <span class="category-desc">${escapeHtml(c.description)}</span>
        <span class="category-bottom"><b>${c.count} términos</b><span aria-hidden="true">↗</span></span>
      </button>`).join('');
    byId('categorySelect').innerHTML = `<option value="all">Todas las categorías</option>` + state.data.categories.map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('');
  }
  function renderBibliography() {
    byId('sourceGrid').innerHTML = state.data.sources.map((source) => `
      <article class="source-item"><div><span class="source-label">${escapeHtml(source.kind)}</span>
      <h3>${escapeHtml(source.name)}</h3><p>${escapeHtml(source.note)}</p></div>
      <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar ${escapeHtml(source.name)} (se abre en otra pestaña)">Ver fuente ↗</a></article>`).join('');
  }
  function termCard(term) {
    const info = classification(term);
    const saved = state.favorites.has(term.id);
    const source = (term.sourceIds || []).map(sourceById).filter(Boolean)[0];
    const sourceLink = source ? `<a class="card-link" target="_blank" rel="noopener noreferrer" href="${escapeHtml(source.url)}" title="${escapeHtml(source.name)}">Consultar fuente ↗</a>` : `<span></span>`;
    return `<article class="entry-card" id="termino-${escapeHtml(term.id)}" data-id="${escapeHtml(term.id)}" aria-labelledby="name-${escapeHtml(term.id)}">
      <div class="entry-meta"><span class="tag ${info.className}">${escapeHtml(info.label)}</span>
      <button type="button" class="star-btn" data-action="favorite" data-id="${escapeHtml(term.id)}" aria-label="${saved ? 'Quitar de' : 'Añadir a'} guardados: ${escapeHtml(term.term)}" aria-pressed="${saved}" title="${saved ? 'Quitar de guardados' : 'Guardar término'}">${saved ? '★' : '☆'}</button></div>
      <h4 id="name-${escapeHtml(term.id)}">${escapeHtml(term.term)}</h4>
      <p class="entry-def">${escapeHtml(term.definition)}</p>
      <div class="example-block"><strong>↳ Ejemplo cotidiano</strong><p>${escapeHtml(term.example)}</p></div>
      <div class="reference-block"><div class="reference-label">Referencia documental</div><p class="reference-text">${escapeHtml(term.reference)}</p></div>
      <div class="card-actions">${sourceLink}<button class="copy-link" type="button" data-action="copy" data-id="${escapeHtml(term.id)}" aria-label="Copiar enlace directo al término ${escapeHtml(term.term)}">Copiar enlace ↗</button></div>
    </article>`;
  }
  function filteredTerms() {
    const search = normalize(state.query);
    let filtered = state.data.terms.filter((term) => {
      if (state.category !== 'all' && term.category !== state.category) return false;
      if (state.type !== 'all' && term.classification !== state.type) return false;
      if (state.favoritesOnly && !state.favorites.has(term.id)) return false;
      if (!search) return true;
      const cat = categoryById(term.category);
      return normalize([term.term, term.definition, term.example, term.reference, term.classification, cat?.name].join(' ')).includes(search);
    });
    if (state.sort !== 'original') {
      filtered = [...filtered].sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }) * (state.sort === 'za' ? -1 : 1));
    }
    return filtered;
  }
  function renderTerms() {
    const results = filteredTerms();
    byId('resultsCount').textContent = `${results.length} de ${state.data.terms.length} términos`;
    const active = state.category === 'all' ? 'Todos los términos' : categoryById(state.category)?.name || 'Todos los términos';
    byId('activeFilterText').textContent = state.query ? `${active} · búsqueda: «${state.query}»` : state.favoritesOnly ? `${active} · solo guardados` : active;
    byId('categorySelect').value = state.category;
    byId('typeSelect').value = state.type;
    byId('sortSelect').value = state.sort;
    byId('favsOnly').setAttribute('aria-pressed', String(state.favoritesOnly));
    byId('favsOnly').querySelector('span').textContent = state.favoritesOnly ? '★' : '☆';
    byId('resetFilters').disabled = state.query === '' && state.category === 'all' && state.type === 'all' && !state.favoritesOnly && state.sort === 'original';
    document.querySelectorAll('.category-tile').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.category === state.category)));
    if (!results.length) {
      byId('termResults').innerHTML = `<div class="no-results"><span aria-hidden="true">⌕</span><h3>No se encontraron términos</h3><p>Prueba otra palabra, categoría o tipo de referencia.</p><button type="button" id="noResultReset">Ver todos los términos</button></div>`;
      return;
    }
    const groups = state.data.categories.map((c) => ({ ...c, terms: results.filter((t) => t.category === c.id) })).filter((group) => group.terms.length);
    byId('termResults').innerHTML = groups.map((group) => `
      <section class="term-group" aria-labelledby="group-${escapeHtml(group.id)}">
        <header class="group-head"><div class="group-name"><span class="group-dot">${String(group.order).padStart(2, '0')}</span><h3 id="group-${escapeHtml(group.id)}">${escapeHtml(group.name)}</h3></div><span class="group-count">${group.terms.length} ${group.terms.length === 1 ? 'término' : 'términos'}</span></header>
        <div class="entry-grid">${group.terms.map(termCard).join('')}</div>
      </section>`).join('');
  }
  function resetFilters() {
    state.query = ''; state.category = 'all'; state.type = 'all'; state.sort = 'original'; state.favoritesOnly = false;
    byId('searchInput').value = '';
    renderTerms();
  }
  async function copyLink(id) {
    const link = new URL(window.location.href);
    link.hash = `termino/${encodeURIComponent(id)}`;
    try {
      await navigator.clipboard.writeText(link.href);
      toast('Enlace copiado. Puedes compartir esta ficha.');
    } catch {
      window.location.hash = link.hash;
      toast('Enlace preparado en la barra de direcciones; cópialo desde allí.');
    }
  }
  function readDeepLink() {
    const match = /^#termino\/([^/?#]+)/.exec(window.location.hash);
    if (!match) return;
    let id;
    try { id = decodeURIComponent(match[1]); } catch { return; }
    const term = state.data?.terms.find((t) => t.id === id);
    if (!term) return;
    state.query = ''; state.category = term.category; state.type = 'all'; state.favoritesOnly = false;
    byId('searchInput').value = '';
    renderTerms();
    requestAnimationFrame(() => {
      const card = byId(`termino-${id}`);
      card?.classList.add('deep-link');
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  function attachEvents() {
    byId('searchInput').addEventListener('input', (e) => { state.query = e.target.value.trim(); renderTerms(); });
    byId('categorySelect').addEventListener('change', (e) => { state.category = e.target.value; renderTerms(); });
    byId('typeSelect').addEventListener('change', (e) => { state.type = e.target.value; renderTerms(); });
    byId('sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; renderTerms(); });
    byId('favsOnly').addEventListener('click', () => { state.favoritesOnly = !state.favoritesOnly; renderTerms(); });
    byId('resetFilters').addEventListener('click', resetFilters);
    byId('allCategories').addEventListener('click', () => { resetFilters(); byId('explorar').scrollIntoView({ behavior: 'smooth' }); });
    byId('categoryGrid').addEventListener('click', (e) => {
      const button = e.target.closest('[data-category]');
      if (!button) return;
      state.category = state.category === button.dataset.category ? 'all' : button.dataset.category;
      renderTerms();
      byId('explorar').scrollIntoView({ behavior: 'smooth' });
    });
    byId('termResults').addEventListener('click', (e) => {
      if (e.target.closest('#noResultReset')) { resetFilters(); return; }
      const button = e.target.closest('button[data-action]');
      if (!button) return;
      const id = button.dataset.id;
      if (button.dataset.action === 'copy') { copyLink(id); return; }
      if (state.favorites.has(id)) { state.favorites.delete(id); toast('Término eliminado de guardados.'); }
      else { state.favorites.add(id); toast('Término guardado en este navegador.'); }
      saveFavorites();
      renderTerms();
    });
    window.addEventListener('hashchange', readDeepLink);
    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input,textarea,select,[contenteditable]')) return;
      e.preventDefault(); byId('searchInput').focus();
    });
  }
  async function initialize() {
    initTheme();
    attachEvents();
    try {
      const response = await fetch('./data/glosario.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.categories) || !Array.isArray(data.terms) || !Array.isArray(data.sources)) throw new Error('Formato de datos no válido');
      state.data = data;
      renderCategories();
      renderBibliography();
      renderTerms();
      if (window.location.hash.startsWith('#termino/')) readDeepLink();
    } catch (error) {
      console.error('No se pudo cargar el glosario:', error);
      byId('categoryGrid').innerHTML = '<p class="loading-text">No se pudieron cargar las categorías.</p>';
      byId('resultsCount').textContent = 'Sin datos';
      byId('termResults').innerHTML = '<div class="no-results"><span aria-hidden="true">!</span><h3>No se pudo abrir el contenido</h3><p>Para probar el sitio en tu Mac, inicia un servidor local con <code>python3 -m http.server 8000</code> y abre <code>http://localhost:8000</code>.</p></div>';
      toast('Revisa la conexión local o el archivo data/glosario.json.');
    }
  }
  initialize();
})();
