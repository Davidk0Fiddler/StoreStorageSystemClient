(() => {
  const baseTitle = document.title.trim();

  function getCurrentViewTitle() {
    const explicitTitle = document.querySelector('[data-window-title]')?.textContent?.trim();
    if (explicitTitle) return explicitTitle;

    const panelLabel = document.getElementById('panel-label')?.textContent?.trim();
    if (panelLabel) return panelLabel;

    const activeNavigation = document.querySelector('.statistics-nav-item.active, [data-panel].active');
    return activeNavigation?.textContent?.trim() || '';
  }

  function getOpenOverlayTitle() {
    const overlay = [...document.querySelectorAll('.modal.show, .offcanvas.show')].at(-1);
    if (!overlay) return '';

    const labelledBy = overlay.getAttribute('aria-labelledby');
    const labelledTitle = labelledBy ? document.getElementById(labelledBy)?.textContent?.trim() : '';
    const visibleTitle = overlay.querySelector('.modal-title, .offcanvas-title')?.textContent?.trim();
    return labelledTitle || visibleTitle || '';
  }

  function updateDocumentTitle() {
    const parts = [getOpenOverlayTitle(), getCurrentViewTitle(), baseTitle]
      .filter((part, index, all) => part && all.indexOf(part) === index);
    const nextTitle = parts.join(' — ');
    if (nextTitle && document.title !== nextTitle) document.title = nextTitle;
  }

  document.addEventListener('show.bs.modal', () => requestAnimationFrame(updateDocumentTitle));
  document.addEventListener('shown.bs.modal', updateDocumentTitle);
  document.addEventListener('hidden.bs.modal', updateDocumentTitle);
  document.addEventListener('show.bs.offcanvas', () => requestAnimationFrame(updateDocumentTitle));
  document.addEventListener('shown.bs.offcanvas', updateDocumentTitle);
  document.addEventListener('hidden.bs.offcanvas', updateDocumentTitle);

  const observer = new MutationObserver(updateDocumentTitle);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class'],
  });

  updateDocumentTitle();
})();