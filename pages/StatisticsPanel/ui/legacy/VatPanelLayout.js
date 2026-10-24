export function CreateVatPanelMarkup() {
  return String.raw`
<div class="container-fluid h-100 overflow-hidden" style="max-height: 100vh">
  <div class="row g-3 h-100">
    <div class="col-12 col-xl-4 h-100">
      <section class="card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body p-4 d-flex flex-column overflow-auto">
          <div class="d-flex align-items-center gap-3 mb-4">
            <div class="bg-primary-subtle text-primary rounded-3 p-3"><i class="bi bi-percent fs-3"></i></div>
            <div><div class="text-body-secondary small fw-semibold text-uppercase">Pénzügyi áttekintés</div><h4 class="fw-bold mb-0 mt-1">ÁFA és bevétel</h4></div>
          </div>
          <label for="vat-month" class="form-label small text-body-secondary">Vizsgált hónap</label>
          <input id="vat-month" type="month" class="form-control mb-4" />
          <div class="bg-success-subtle text-success rounded-4 p-3 mb-3">
            <div class="small">Bruttó értékesítési bevétel</div><div id="vat-gross-revenue" class="fs-3 fw-bold">–</div>
          </div>
          <div id="vat-margin-card" class="bg-warning-subtle text-warning-emphasis rounded-4 p-3 mb-3">
            <div class="small fw-semibold">Teljes profit / árrés</div>
            <div id="vat-margin-total" class="fs-3 fw-bold">–</div>
          </div>
          <div class="bg-primary-subtle text-primary rounded-4 p-3 mb-3">
            <div class="small">Értékesítések ÁFÁ-ja</div><div id="vat-output-total" class="fs-3 fw-bold">–</div>
          </div>
        </div>
      </section>
    </div>
    <div class="col-12 col-xl-4 h-100">
      <section class="card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body p-4 d-flex flex-column overflow-hidden">
          <div class="mb-4"><div class="text-body-secondary small fw-semibold text-uppercase">Adókulcs szerinti bontás</div><h4 class="fw-bold mb-1 mt-1">ÁFA-kulcsok</h4><small class="text-body-secondary">Értékesítési ÁFA kulcsonként</small></div>
          <div id="vat-rate-list" class="d-flex flex-column gap-3 overflow-auto"></div>
          <div id="vat-empty-state" class="text-body-secondary text-center py-5 d-none">Ehhez a hónaphoz nincs rögzített értékesítési ÁFA-adat.</div>
        </div>
      </section>
    </div>
    <div class="col-12 col-xl-4 h-100">
      <section class="card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body p-4 d-flex flex-column overflow-hidden">
          <div class="mb-4"><div class="text-body-secondary small fw-semibold text-uppercase">Bevétel felosztása</div><h4 class="fw-bold mb-1 mt-1">Bruttó bevétel és összetevői</h4><small class="text-body-secondary">Kiadás, profit / árrés és ÁFA</small></div>
          <div class="position-relative flex-grow-1" style="min-height: 260px"><canvas id="vat-chart"></canvas></div>
          <div class="bg-body-tertiary rounded-4 p-3 mt-3 small text-body-secondary">A kiadás az eladott mennyiség és a beszerzési ár alapján készül, a visszaváltható termékek betétdíjával együtt. A 0%-os ÁFA-kulcsú értékesítést a kulcs szerinti bontás mutatja, ez nem csak visszaváltásból áll. A jelmagyarázat a diagram alatt látható.</div>
        </div>
      </section>
    </div>
  </div>
</div>`;
}
