export function CreateTransactionsPanelMarkup() {
  return String.raw`
<div class="container-fluid h-100 overflow-hidden" style="max-height: 100vh">
  <div class="row g-3 h-100">
    <div class="col-12 col-xl-4 h-100">
      <section class="card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body p-4 d-flex flex-column overflow-hidden">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <div class="text-body-secondary small fw-semibold text-uppercase">Pénzügyi áttekintés</div>
              <h4 class="fw-bold mb-0 mt-1">Havi pénzmozgás</h4>
            </div>
            <div class="bg-primary-subtle text-primary rounded-3 p-3"><i class="bi bi-arrow-left-right fs-4"></i></div>
          </div>
          <label for="transactions-month" class="form-label small text-body-secondary">Vizsgált hónap</label>
          <input id="transactions-month" type="month" class="form-control mb-4" />
          <div class="bg-success-subtle text-success rounded-4 p-3 mb-3">
            <div class="small">Bevétel</div><div id="transactions-income" class="fs-3 fw-bold">–</div>
            <div id="transactions-income-count" class="small opacity-75"></div>
          </div>
          <div class="bg-danger-subtle text-danger rounded-4 p-3 mb-3">
            <div class="small">Áru beszerzési kiadása</div><div id="transactions-expenses" class="fs-3 fw-bold">–</div>
            <div id="transactions-expense-count" class="small opacity-75"></div>
          </div>
          <div class="fw-bold mb-2">Napi alakulás</div>
          <div class="position-relative flex-grow-1" style="min-height: 180px"><canvas id="transactions-chart"></canvas></div>
        </div>
      </section>
    </div>
    <div class="col-12 col-xl-8 h-100">
      <section class="card border-0 shadow-sm rounded-4 h-100">
        <div class="card-body p-4 d-flex flex-column overflow-hidden">
          <div class="d-flex align-items-center justify-content-between mb-4 flex-shrink-0">
            <div><div class="text-body-secondary small fw-semibold text-uppercase">Bevételek és kiadások</div><h4 class="fw-bold mb-0 mt-1">Tranzakciók</h4></div>
            <span id="transactions-period-label" class="badge rounded-pill text-bg-primary"></span>
          </div>
          <div class="d-flex gap-3 small mb-3 flex-shrink-0">
            <span class="text-success"><i class="bi bi-circle-fill me-1"></i>Bevétel</span>
            <span class="text-danger"><i class="bi bi-circle-fill me-1"></i>Kiadás</span>
          </div>
          <div id="transactions-list" class="d-flex flex-column gap-2 overflow-auto flex-grow-1" style="min-height: 0"></div>
        </div>
      </section>
    </div>
  </div>
</div>`;
}
