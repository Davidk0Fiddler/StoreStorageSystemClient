function GetAfaCode(afa) {
  switch (afa) {
    case 27:
      return "C00";

    case 18:
      return "B00";

    case 5:
      return "A00";

    case 0:
      return "E00";

    default:
      return "";
  }
}

export function CreateReceiptItem(selectedProduct) {
  const product = selectedProduct.product;
  const amount = selectedProduct.amount;

  const productTotal = amount * product.unitPrice;

  const depositTotal = amount * product.deposit;

  const afaCode = GetAfaCode(product.afaPercent);

  return `
    <div class="row py-3 border-bottom">

      <div class="col-5">
        <div class="fw-semibold">
          ${product.productName}
        </div>
      </div>

      <div class="col-2 text-center">
        ${amount}
      </div>

      <div class="col-2 text-end">
        ${product.unitPrice}Ft/${product.productSize}
      </div>

      <div class="col-2 text-end fw-semibold">
        ${productTotal} Ft
      </div>

      <div class="col-1 text-end">
        ${afaCode}
      </div>

      ${
        product.deposit == 0
          ? ""
          : `
            <div class="col-5 text-secondary">
              <div class="fw-semibold">
                Betétdíj
              </div>
            </div>

            <div class="col-2 text-center text-secondary">
              ${amount}
            </div>

            <div class="col-2 text-end text-secondary">
              ${product.deposit}Ft/db
            </div>

            <div class="col-2 text-end fw-semibold text-secondary">
              ${depositTotal} Ft
            </div>

            <div class="col-1 text-end">
              E00
            </div>
          `
      }

    </div>
  `;
}
