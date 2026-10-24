export function CreatePurchaseDetailsModalMarkup() {
  return String.raw`
<!-- Shoplog modal -->
    <section>
      <div
        class="modal fade"
        id="shoplog-details-modal"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen m-0">
          <div class="modal-content border-0">
            <!-- HEADER -->
            <div class="modal-header px-4 py-3 border-bottom shadow-sm">
              <div>
                <div class="d-flex align-items-center gap-3">
                  <div
                    class="bg-primary bg-opacity-10 text-primary rounded-3 p-2"
                  >
                    <i class="bi bi-receipt fs-3"></i>
                  </div>

                  <div>
                    <h3 class="mb-0 fw-bold">Vásárlás részletei</h3>

                    <div class="text-body-secondary">
                      <i class="bi bi-clock me-1"></i>
                      <span id="shoplog-date">-</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="btn btn-outline-secondary btn-lg rounded-3 ms-auto"
                data-bs-dismiss="modal"
              >
                <i class="bi bi-x-lg me-2"></i>
                Bezárás
              </button>
            </div>

            <!-- BODY -->
            <div class="modal-body p-0 bg-body-tertiary">
              <div class="container-fluid h-100">
                <div class="row h-100 g-0">
                  <!-- LEFT: PRODUCTS -->
                  <div class="col-xl-8 col-xxl-9 h-100">
                    <div class="h-100 d-flex flex-column p-4">
                      <!-- PRODUCTS HEADER -->
                      <div
                        class="d-flex align-items-center justify-content-between mb-3"
                      >
                        <div>
                          <h4 class="fw-bold mb-1">Vásárolt termékek</h4>

                          <div class="text-body-secondary">
                            <span id="shoplog-products-count">0</span>
                            tétel
                          </div>
                        </div>

                        <div
                          class="badge text-bg-primary rounded-pill fs-6 px-3 py-2"
                        >
                          <i class="bi bi-bag-check me-1"></i>
                          Vásárlás
                        </div>
                      </div>

                      <!-- PRODUCT LIST -->
                      <div
                        id="shoplog-products-area"
                        class="flex-grow-1 overflow-auto"
                      >
                        <!-- JS tölti -->
                      </div>
                    </div>
                  </div>

                  <!-- RIGHT: SUMMARY -->
                  <div class="col-xl-4 col-xxl-3 h-100">
                    <div class="h-100 bg-body border-start d-flex flex-column">
                      <!-- SUMMARY HEADER -->
                      <div class="p-4 border-bottom">
                        <div class="text-body-secondary small mb-1">
                          VÁSÁRLÁS ÖSSZESÍTÉSE
                        </div>

                        <div id="shoplog-total-price" class="display-5 fw-bold">
                          0 Ft
                        </div>
                      </div>

                      <!-- SUMMARY CONTENT -->
                      <div class="p-4 flex-grow-1">
                        <div class="d-flex justify-content-between mb-3">
                          <span class="text-body-secondary"> Termékek </span>

                          <span id="shoplog-products-price" class="fw-semibold">
                            0 Ft
                          </span>
                        </div>

                        <div class="d-flex justify-content-between mb-3">
                          <span class="text-body-secondary"> Betétdíj </span>

                          <span id="shoplog-deposit-bottom" class="fw-semibold">
                            0 Ft
                          </span>
                        </div>

                        <hr class="my-4" />

                        <!-- STATS -->
                        <div class="row g-2">
                          <div class="col-6">
                            <div class="bg-body-tertiary rounded-3 p-3">
                              <div class="small text-body-secondary">
                                Tételek
                              </div>

                              <div
                                id="shoplog-products-count-stat"
                                class="fs-4 fw-bold"
                              >
                                0
                              </div>
                            </div>
                          </div>

                          <div class="col-6">
                            <div class="bg-body-tertiary rounded-3 p-3">
                              <div class="small text-body-secondary">
                                Betétdíj
                              </div>

                              <div id="shoplog-deposit" class="fs-4 fw-bold">
                                0 Ft
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- TOTAL -->
                      <div class="p-4 border-top">
                        <div
                          class="d-flex justify-content-between align-items-end"
                        >
                          <div>
                            <div class="text-body-secondary">
                              Fizetendő összesen
                            </div>

                            <div
                              id="shoplog-total-price-bottom"
                              class="fs-1 fw-bold"
                            >
                              0 Ft
                            </div>
                          </div>

                          <div
                            class="bg-success bg-opacity-10 text-success rounded-circle p-3"
                          >
                            <i class="bi bi-check-lg fs-3"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
`;
}
