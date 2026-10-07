export function ReturnDateInputs() {
  return `
    <div class="mb-3 col-12 row d-flex justify-content-evenly">

      <div class="col-12 col-md-5">
        <label for="expiration-date-input" class="form-label">
          Lejárati dátum
        </label>

        <input
          type="date"
          class="form-control"
          id="expiration-date-input"
        />
      </div>

      <div class="col-12 col-md-5">
        <label for="received-at-input" class="form-label">
          Beérkezési dátum
        </label>

        <input
          type="date"
          class="form-control"
          id="received-at-input"
        />
      </div>

    </div>
  `;
}
