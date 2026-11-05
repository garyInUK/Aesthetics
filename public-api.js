/* Public read-only MariaDB integration. Owner writes remain disabled pending security tests. */
(function () {
  'use strict';
  const API = 'https://api.prioryhouse.com/api.php';
  function element(tag, cls, content) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (content !== undefined) node.textContent = String(content);
    return node;
  }
  async function get(resource) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(API + '?resource=' + encodeURIComponent(resource), {
        method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store',
        signal: controller.signal, headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Invalid API response');
      return rows;
    } finally {
      clearTimeout(timer);
    }
  }
  async function loadPrices() {
    const mount = document.getElementById('price-groups');
    if (!mount) return;
    mount.replaceChildren(element('p', 'tiny-note', 'Loading treatment prices…'));
    try {
      const rows = await get('treatments');
      mount.replaceChildren();
      const safe = rows.filter(p => typeof p.category === 'string' && typeof p.name === 'string'
        && typeof p.description === 'string' && Number.isFinite(Number(p.price)) && Number(p.price) >= 0);
      if (!safe.length) {
        mount.append(element('p', 'tiny-note', 'No treatment prices are published yet.'));
        return;
      }
      for (const category of [...new Set(safe.map(p => p.category))]) {
        const section = element('section', 'price-group');
        section.append(element('h2', '', category));
        const table = element('div', 'price-table');
        safe.filter(p => p.category === category).forEach(p => {
          const row = element('article', 'price-item');
          const left = element('div');
          left.append(element('h3', '', p.name), element('p', '', p.description));
          row.append(left, element('strong', 'price-amount',
            '£' + Number(p.price).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })));
          table.append(row);
        });
        section.append(table);
        mount.append(section);
      }
    } catch (error) {
      mount.replaceChildren(element('p', 'tiny-note', 'Prices are temporarily unavailable. Please try again later.'));
      console.warn('Prices API unavailable:', error.message);
    }
  }
  function googleReviewLink(raw) {
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();
      if (url.protocol !== 'https:') return '';
      if (host === 'google.com' || host.endsWith('.google.com')
          || host === 'google.co.uk' || host.endsWith('.google.co.uk')
          || host === 'maps.app.goo.gl' || host === 'g.page') return url.href;
    } catch (_) {}
    return '';
  }
  async function loadReviews() {
    const mount = document.getElementById('review-list');
    if (!mount) return;
    const status = document.getElementById('review-status');
    mount.replaceChildren(element('p', 'tiny-note', 'Loading published reviews…'));
    try {
      const rows = await get('reviews');
      mount.replaceChildren();
      const safe = rows.filter(r => typeof r.reviewer === 'string'
        && typeof r.review_text === 'string' && Number.isInteger(Number(r.stars))
        && Number(r.stars) >= 1 && Number(r.stars) <= 5);
      if (status) status.textContent = 'Only published customer reviews are displayed. Follow the source link to verify the original.';
      if (!safe.length) {
        mount.append(element('p', 'tiny-note', 'No verified customer reviews have been published yet.'));
        return;
      }
      safe.forEach(review => {
        const card = element('article', 'review-card');
        const stars = Number(review.stars);
        card.append(element('div', 'review-stars', '★'.repeat(stars) + '☆'.repeat(5 - stars)),
          element('p', 'review-quote', '“' + review.review_text + '”'),
          element('div', 'review-who', review.reviewer),
          element('div', 'review-label', 'Customer review · source-linked'));
        const source = googleReviewLink(review.source_url);
        if (source) {
          const link = element('a', 'review-label', 'VIEW ORIGINAL GOOGLE REVIEW ↗');
          link.href = source;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          card.append(link);
        }
        mount.append(card);
      });
    } catch (error) {
      mount.replaceChildren(element('p', 'tiny-note', 'Reviews are temporarily unavailable.'));
      if (status) status.textContent = 'Reviews cannot currently be retrieved from the server.';
      console.warn('Reviews API unavailable:', error.message);
    }
  }
  window.StudioPublic = { loadPrices, loadReviews };
  if (document.getElementById('review-list')) loadReviews();
})();
