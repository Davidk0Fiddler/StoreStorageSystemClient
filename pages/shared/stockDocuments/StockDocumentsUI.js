const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

function formatFileSize(sizeBytes) {
  const size = Number(sizeBytes);
  if (!Number.isFinite(size) || size < 0) return "Ismeretlen méret";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("hu-HU");
}

export function RenderStockDocumentsSection(stockId) {
  return `
    <section class="col-12" data-stock-document-section data-stock-id="${escapeHtml(stockId)}">
      <div class="border rounded-4 p-3 bg-body-tertiary">
        <div class="d-flex align-items-start gap-3 mb-3">
          <span class="stock-document-icon flex-shrink-0"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i></span>
          <div>
            <h3 class="h6 fw-bold mb-1">Számla és szállítólevél PDF-ek</h3>
            <p class="small text-body-secondary mb-0">A dokumentumok ehhez az árutételhez kapcsolódnak. A backend nem tárol külön dokumentumtípust, ezért a fájlnév alapján különböztesd meg a számlát és a szállítólevelet. Legfeljebb 20 MB-os PDF tölthető fel.</p>
          </div>
        </div>
        <div class="row g-2 align-items-start mb-3">
          <div class="col-12 col-md">
            <label class="form-label small fw-semibold" for="stock-document-file-${escapeHtml(stockId)}">PDF kiválasztása</label>
            <input class="form-control form-control-lg" id="stock-document-file-${escapeHtml(stockId)}" type="file" accept=".pdf,application/pdf" data-stock-document-file>
            <div class="form-text" data-stock-document-selected>Válassz ki egy PDF fájlt.</div>
          </div>
          <div class="col-12 col-md-auto stock-document-upload-action">
            <button class="btn btn-primary btn-lg w-100" type="button" data-stock-document-upload disabled>
              <i class="bi bi-cloud-arrow-up me-1" aria-hidden="true"></i>PDF feltöltése
            </button>
          </div>
        </div>
        <div class="small mb-2" role="status" aria-live="polite" data-stock-document-status></div>
        <div class="stock-document-list" data-stock-document-list>
          <div class="text-body-secondary small">Dokumentumok betöltése…</div>
        </div>
      </div>
    </section>
  `;
}

export function RenderStockDocumentList(documents) {
  if (!documents.length) {
    return '<div class="text-body-secondary small">Ehhez az árutételhez még nincs feltöltött dokumentum.</div>';
  }

  return `
    <div class="list-group">
      ${documents.map((document) => {
        const id = escapeHtml(document.id);
        const fileName = escapeHtml(document.fileName || "PDF dokumentum");
        const uploadedBy = document.uploadedBy ? ` · Feltöltötte: ${escapeHtml(document.uploadedBy)}` : "";
        const uploadedAt = formatUploadDate(document.uploadedAtUtc);
        const metadata = [formatFileSize(document.sizeBytes), uploadedAt, uploadedBy].filter(Boolean).join(" · ");
        return `
          <div class="list-group-item d-flex flex-wrap align-items-center gap-2 px-3 py-3">
            <i class="bi bi-file-earmark-pdf text-danger fs-5" aria-hidden="true"></i>
            <div class="flex-grow-1 min-w-0">
              <div class="fw-semibold text-break">${fileName}</div>
              <div class="small text-body-secondary">${metadata}</div>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-outline-primary btn-lg" type="button" data-stock-document-open="${id}" data-document-name="${fileName}">
                <i class="bi bi-eye me-1" aria-hidden="true"></i>Megnyitás
              </button>
              <button class="btn btn-outline-secondary btn-lg" type="button" data-stock-document-download="${id}" data-document-name="${fileName}">
                <i class="bi bi-download me-1" aria-hidden="true"></i>Letöltés
              </button>
              <button class="btn btn-outline-danger btn-lg" type="button" data-stock-document-delete="${id}" data-document-name="${fileName}" aria-label="${fileName} törlése">
                <i class="bi bi-trash3 me-1" aria-hidden="true"></i>Törlés
              </button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

export function RenderStockDocumentDeleteModal(fileName) {
  return `
    <div class="modal fade" data-stock-document-delete-modal tabindex="-1" aria-labelledby="stock-document-delete-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <span class="stock-document-delete-icon"><i class="bi bi-trash3" aria-hidden="true"></i></span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="modal" aria-label="Bezárás"></button>
          </div>
          <div class="modal-body pt-2">
            <h2 class="h5 fw-bold" id="stock-document-delete-title">PDF végleges törlése</h2>
            <p class="text-body-secondary mb-2">Biztosan törlöd ezt a dokumentumot?</p>
            <p class="fw-semibold text-break">${escapeHtml(fileName)}</p>
            <div class="small text-danger" data-stock-document-delete-error role="alert"></div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button class="btn btn-light border btn-lg" type="button" data-bs-dismiss="modal">Mégse</button>
            <button class="btn btn-danger btn-lg" type="button" data-stock-document-delete-confirm><i class="bi bi-trash3 me-1" aria-hidden="true"></i>PDF törlése</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function RenderStockDocumentViewer(fileName) {
  return `
    <div class="stock-document-viewer" data-stock-document-viewer role="dialog" aria-modal="true" aria-label="PDF előnézet">
      <section class="stock-document-viewer__panel">
        <header class="stock-document-viewer__header">
          <div class="min-w-0"><div class="small text-body-secondary">PDF dokumentum</div><h2 class="h6 fw-bold text-break mb-0">${escapeHtml(fileName)}</h2></div>
          <button class="btn btn-light border btn-lg" type="button" data-stock-document-close aria-label="Előnézet bezárása"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
        </header>
        <iframe class="stock-document-viewer__frame" data-stock-document-frame title="${escapeHtml(fileName)}"></iframe>
        <footer class="stock-document-viewer__footer">
          <button class="btn btn-outline-secondary btn-lg" type="button" data-stock-document-close>Bezárás</button>
          <button class="btn btn-primary btn-lg" type="button" data-stock-document-viewer-download><i class="bi bi-download me-1" aria-hidden="true"></i>PDF letöltése</button>
        </footer>
      </section>
    </div>
  `;
}
