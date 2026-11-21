(() => {
  'use strict';
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.product-menu');
  function closeNav() {
    if (nav) nav.dataset.open = 'false';
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', '打开导航');
    if (menu) menu.open = false;
  }
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
    nav.dataset.open = String(open);
    if (!open && menu) menu.open = false;
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.commercial-header')) closeNav();
    else if (event.target.closest('.site-nav a')) closeNav();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (menu?.open || toggle?.getAttribute('aria-expanded') === 'true')) {
      const target = toggle?.getAttribute('aria-expanded') === 'true' ? toggle : menu.querySelector('summary');
      closeNav();
      target?.focus();
    }
  });
  matchMedia('(min-width:851px)').addEventListener('change', closeNav);
  const tabs = [...document.querySelectorAll('[data-showcase]')];
  function activate(tab) {
    for (const other of tabs) {
      const selected = tab === other;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
    }
  }
  for (const tab of tabs) {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let target;
      const index = tabs.indexOf(tab);
      if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs.at(-1);
      if (target) { event.preventDefault(); activate(target); target.focus(); }
    });
  }
  const filters = [...document.querySelectorAll('[data-filter]')];
  for (const button of filters) button.addEventListener('click', () => {
    for (const other of filters) other.setAttribute('aria-pressed', String(other === button));
    for (const card of document.querySelectorAll('.product-card')) card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
  });
  const search = document.getElementById('download-search');
  search?.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const row of document.querySelectorAll('[data-download-name]')) {
      row.hidden = !(row.dataset.downloadName + ' ' + row.textContent).toLocaleLowerCase().includes(query);
      if (!row.hidden) visible++;
    }
    document.getElementById('download-empty').hidden = visible > 0;
  });
  // Keep old bookmarked homepage section links useful after moving the guides.
  if (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')) {
    const moved = new Set(['modes', 'tutorials', 'choose-app', 'compare', 'start', 'workflow', 'video-reading', 'guide-api', 'guide-code', 'guide-otti']);
    if (moved.has(location.hash.slice(1))) location.replace('guide.html' + location.search + location.hash);
    const alias = { apps: 'products', 'more-apps': 'products', browser: 'products' }[location.hash.slice(1)];
    if (alias) document.getElementById(alias)?.scrollIntoView();
  }
  // Nested guide panels need to open when reached from product navigation.
  const guide = location.hash.startsWith('#guide-') ? document.getElementById(location.hash.slice(1)) : null;
  if (guide?.classList.contains('guide')) document.querySelector(`[data-guide="${guide.id.replace('guide-', '')}"]`)?.click();
})();
