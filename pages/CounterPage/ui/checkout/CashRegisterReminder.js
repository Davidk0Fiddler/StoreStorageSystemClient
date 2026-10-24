function formatHuf(amount) {
  return `${new Intl.NumberFormat("hu-HU", {
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)} Ft`;
}

export function AskCashRegisterAmountConfirmation({ total, vatTotals = {} }) {
  const checkoutModal = document.getElementById("checkout-modal");
  if (!checkoutModal) return Promise.resolve(false);

  checkoutModal.querySelector("[data-cash-register-reminder]")?.remove();

  const reminder = document.createElement("div");
  reminder.className = "cash-register-reminder";
  reminder.dataset.cashRegisterReminder = "true";
  reminder.setAttribute("role", "alertdialog");
  reminder.setAttribute("aria-modal", "true");
  reminder.setAttribute("aria-labelledby", "cash-register-reminder-title");
  reminder.innerHTML = `
    <section class="cash-register-reminder__dialog">
      <div class="cash-register-reminder__icon" aria-hidden="true">
        <i class="bi bi-cash-register"></i>
      </div>
      <p class="cash-register-reminder__eyebrow">Mentés előtt</p>
      <h2 class="cash-register-reminder__title" id="cash-register-reminder-title">
        Üsd be az összeget a kasszába!
      </h2>
      <p class="cash-register-reminder__copy">
        A vásárlás véglegesítése előtt üsd be az összegeket a kasszába a megfelelő ÁFA-kulcsokhoz.
      </p>
      <div class="cash-register-reminder__vat-heading">Beütendő bruttó összegek ÁFA-kulcsonként</div>
      <dl class="cash-register-reminder__vat-list">
        ${[27, 18, 5, 0]
          .map(
            (rate) => `
              <div class="cash-register-reminder__vat-row">
                <dt>${rate}% ÁFA${rate === 0 ? " <span>(a betétdíjjal együtt)</span>" : ""}</dt>
                <dd>${formatHuf(vatTotals[rate])}</dd>
              </div>
            `,
          )
          .join("")}
      </dl>
      <div class="cash-register-reminder__amount-label">Fizetendő összesen</div>
      <div class="cash-register-reminder__amount">${formatHuf(total)}</div>
      <div class="cash-register-reminder__actions">
        <button class="btn btn-outline-secondary btn-lg" type="button" data-cash-reminder-cancel>
          Vissza a nyugtához
        </button>
        <button class="btn btn-success btn-lg" type="button" data-cash-reminder-confirm>
          <i class="bi bi-check-lg me-2" aria-hidden="true"></i>Beütöttem, mentés
        </button>
      </div>
    </section>
  `;
  checkoutModal.appendChild(reminder);

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (confirmed) => {
      if (resolved) return;
      resolved = true;
      reminder.remove();
      resolve(confirmed);
    };
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        finish(false);
      }
    };

    reminder.querySelector("[data-cash-reminder-cancel]")
      ?.addEventListener("click", () => finish(false));
    reminder.querySelector("[data-cash-reminder-confirm]")
      ?.addEventListener("click", () => finish(true));
    reminder.addEventListener("keydown", handleKeydown);
    reminder.querySelector("[data-cash-reminder-cancel]")?.focus();
  });
}
