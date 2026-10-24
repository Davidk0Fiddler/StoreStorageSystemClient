import { EscapeHtml } from "../../shared/Html.js";

export function CreateUserCard(user) {
  const card = document.createElement("div");

  card.dataset.username = user.userName;

  card.classList.add(
    "card",
    "user-card",
    "col-12",
    "col-md-5",
    "col-lg-3",
    "m-2",
    "border-0",
    "shadow-sm",
  );

  card.innerHTML = `
    <div class="card-body p-4">

      <div class="d-flex align-items-center mb-4">
        <div class="info-icon">
          <i class="bi bi-person-fill"></i>
        </div>

        <div class="overflow-hidden">
          <div class="text-muted small">
            Felhasználó
          </div>

          <div class="fw-semibold text-truncate">
          ${EscapeHtml(user.userName)}
          </div>
        </div>
      </div>

      <div class="user-info">

        <div class="info-row">
          <div class="info-icon">
            <i class="bi bi-shield-check"></i>
          </div>

          <div>
            <div class="text-muted small">
              Jogosultságkör
            </div>

            <div class="fw-semibold">
              ${EscapeHtml(user.roleName)}
            </div>
          </div>
        </div>

        <div class="info-row">
          <div class="info-icon">
            <i class="bi bi-calendar3"></i>
          </div>

          <div>
            <div class="text-muted small">
              Létrehozás ideje
            </div>

            <div class="fw-semibold">
              ${EscapeHtml(new Date(user.createdAt).toLocaleString("hu-HU"))}
            </div>
          </div>
        </div>

      </div>

      <div class="d-flex gap-2 mt-4">

        <button
          type="button"
          class="btn btn-light border flex-grow-1 user-update-button"
        >
          <i class="bi bi-pencil me-1"></i>
          Módosítás
        </button>

        <button
          type="button"
          class="btn ${
            user.isActive ? "btn-success" : "btn-danger"
          } p-2 col-6 fs-6 user-status-button"
        >
          <i
            class="bi ${user.isActive ? "bi-toggle-on" : "bi-toggle-off"}"
          ></i>

          ${user.isActive ? "Aktív" : "Inaktív"}
        </button>

      </div>

    </div>
  `;

  return card;
}
