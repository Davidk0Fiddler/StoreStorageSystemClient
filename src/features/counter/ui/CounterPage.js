import {
  counterRepository,
  productRepository,
} from "../../../libs/data-access/index.js";
import {
  DisplayAlert,
  LoadingSpinner,
  GoToPage,
} from "../../../libs/ui/index.js";

const { getAllProducts, getProductsForCashier } = productRepository;
const { isProductAvailableForCashier, savePurchase } = counterRepository;

window.BackToMenu = function () {
  GoToPage("dashboard");
};

window.DisplaySearchProductModal = async function () {
  const searchProductModal = new bootstrap.Modal(
    document.getElementById("select-product-modal"),
  );

  document
    .getElementById("search-product-modal-close-btn")
    .addEventListener("click", () => {
      // searchProductModal.hide();
    });

  function ShowSelectedProduct(product) {
    const selectedProductImage = document.getElementById(
      "selected-product-image",
    );
    const selectedProductName = document.getElementById(
      "selected-product-name",
    );

    selectedProductImage.src = product.imageURL;
    selectedProductName.textContent = product.productName;
  }
  const products = await RequestAllProducts();

  function DisplayProducts(products) {
    const productListArea = document.getElementById("product-list");

    productListArea.innerHTML = "";

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("col");
      productCard.style.cursor = "pointer";
      productCard.innerHTML += `
                      <div class="card product-card h-100">
                        <img
                          src="${product.imageURL}"
                          class="card-img-top product-image"
                        />

                        <div class="card-body text-center">
                          <h6 class="mb-0">${product.productName}</h6>
                        </div>
                      </div>
                    `;

      const card = productCard.querySelector(".product-card");

      productCard.addEventListener("click", () => {
        const previouslySelected = document.querySelector(
          ".product-card.selected",
        );

        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }

        card.classList.add("selected");

        selectedProduct = product;
        ShowSelectedProduct(selectedProduct);
      });

      productListArea.appendChild(productCard);
    });
  }

  var selectedProduct;
  DisplayProducts(products);
  const productFilterInput = document.getElementById("product-filter-input");

  productFilterInput.addEventListener("input", () => {
    const filterValue = productFilterInput.value.toLowerCase();
    const filteredProducts = products.filter((product) =>
      product.productName.toLowerCase().includes(filterValue),
    );
    DisplayProducts(filteredProducts);
  });

  searchProductModal.show();

  document
    .getElementById("search-product-modal-close-btn")
    .addEventListener("click", () => {
      searchProductModal.hide();
      document
        .querySelectorAll("div.modal-backdrop")
        .forEach((div) => div.remove());
    });

  const barcodeInput = document.getElementById("barcode-input");

  document.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      const barcode = barcodeInput.value
        .replace("ö", "0")
        .replace("Ö", "0")
        .trim();
      barcodeInput.value = String(barcode);
      const product = products.find((p) => p.barcode === barcode);
      if (!product) {
        DisplayAlert("danger", "Termék nem létezik ilyen vonalkóddal.");
        return;
      }

      selectedProduct = product;
      ShowSelectedProduct(selectedProduct);

      await DisplayDetailedProductModal(selectedProduct);
    }
  });

  document
    .getElementById("select-product-btn")
    .addEventListener("click", async () => {
      if (selectedProduct) {
        // selectProductModal.hide();
        await DisplayDetailedProductModal(selectedProduct);
      } else {
        DisplayAlert(
          "danger",
          "Nincs kiválasztott termék. Kérlek válassz ki egy terméket a listából!",
        );
      }
    });

  async function DisplayDetailedProductModal(product) {
    const productDetailsModal = new bootstrap.Modal(
      document.getElementById("product-details-modal"),
    );

    // Kép
    document.getElementById("details-product-image").src =
      product.imageURL || "/images/no-image.png";

    // Terméknév
    document.getElementById("details-product-name").textContent =
      product.productName;

    // Vonalkód
    document.getElementById("details-product-barcode").textContent =
      product.barcode && product.barcode.trim() !== "" ? product.barcode : "-";

    // SKU
    document.getElementById("details-product-sku").textContent = product.sku;

    // Márka
    document.getElementById("details-product-brand").textContent =
      product.brand ?? "-";

    // Típus
    document.getElementById("details-product-type").textContent =
      product.productType ?? "-";

    // Kiszerelés
    document.getElementById("details-product-size").textContent =
      product.productSize ?? "-";

    // Betétdíj
    document.getElementById("details-deposit-amount").textContent =
      product.hasDeposit ? `${product.depositAmount} Ft` : "Nincs";

    // Betétdíjas badge
    const badge = document.getElementById("details-product-deposit");

    if (product.hasDeposit) {
      badge.classList.remove("d-none");
      badge.className = "badge bg-warning text-dark fs-6 px-3 py-2";
      badge.textContent = "Betétdíjas";
    } else {
      badge.classList.remove("d-none");
      badge.className = "badge bg-secondary fs-6 px-3 py-2";
      badge.textContent = "Nem betétdíjas";
    }

    productDetailsModal.show();
  }
};

var isCashRegisterMode = false;
var selectedProducts = [];

window.DisplayCashRegisterModule = async function DisplayCashRegisterModule() {
  const modal = new bootstrap.Modal(
    document.getElementById("cash-register-modal"),
  );

  isCashRegisterMode = true;

  var isCartEmpty = true;
  function SwitchCartEmptyText() {
    if (isCartEmpty == false)
      document.getElementById("empty-cart").classList.add("d-none");
    else {
      document.getElementById("empty-cart").classList.remove("d-none");
    }
  }

  const cashierProductListArea = document.getElementById(
    "cashier-product-list",
  );

  const products = await getProductsForCashier();
  const quantityModalElement = document.getElementById("cashierQuantityModal");

  const quantityModal = new bootstrap.Modal(quantityModalElement);

  async function OpenQuantityModal(product) {
    const productName = document.getElementById("quantity-product-name");

    const quantityInput = document.getElementById("cashier-quantity-input");

    const unit = document.getElementById("cashier-quantity-unit");

    const checkButton = document.getElementById("quantity-check-btn");

    productName.textContent = product.productName;

    unit.textContent = product.productSize;

    quantityInput.value = product.saleQuantityStep;
    quantityInput.step = product.saleQuantityStep;

    checkButton.replaceWith(checkButton.cloneNode(true));

    const newCheckButton = document.getElementById("quantity-check-btn");

    newCheckButton.addEventListener("click", async () => {
      quantityModal.hide();
      await AddProductToCart(
        product,
        Math.round(quantityInput.value * 100) / 100,
      );
    });

    quantityModal.show();

    quantityModalElement.addEventListener(
      "shown.bs.modal",
      () => {
        quantityInput.focus();
        quantityInput.select();
      },
      { once: true },
    );
  }

  window.ChangeQuantityWithButtonMinus = async (index) => {
    const selectedProduct = selectedProducts[index];

    if (!selectedProduct) return;

    if (selectedProduct.product.productSize === "db") {
      selectedProduct.amount -= 1;
    } else {
      selectedProduct.amount -= 0.05;
      selectedProduct.amount = Math.round(selectedProduct.amount * 100) / 100;
    }

    // Ha 0 vagy az alá csökken, töröljük
    if (selectedProduct.amount <= 0) {
      selectedProducts.splice(index, 1);
    }

    await FillCart();
  };

  window.ChangeQuantityWithButtonPlus = async (index) => {
    const selectedProduct = selectedProducts[index];

    if (!selectedProduct) return;
    if (selectedProduct.product.productSize === "db") {
      selectedProduct.amount += 1;
    } else {
      selectedProduct.amount += 0.05;
      selectedProduct.amount = Math.round(selectedProduct.amount * 100) / 100;
    }

    await FillCart();
  };

  window.RemoveProductFromCart = async (index) => {
    selectedProducts.splice(index, 1);
    await FillCart();
  };

  window.FillCart = async function FillCart() {
    document.getElementById("cashier-cart-list").innerHTML = "";

    if (selectedProducts.length == 0) {
      isCartEmpty = true;
    } else {
      isCartEmpty = false;
    }

    SwitchCartEmptyText();

    selectedProducts.forEach((selectedProduct, index) => {
      document.getElementById("cashier-cart-list").innerHTML += `
      <div class="border rounded-3 p-3 mb-2 bg-white shadow-sm">

        <div class="d-flex justify-content-between align-items-start">

          <div class="fs-3 fw-semibold text-truncate pe-2">
            ${selectedProduct.product.productName}
          </div>

          <button 
            type="button"
            class="btn btn-danger fw-bold"
            aria-label="Termék törlése"
            onclick="RemoveProductFromCart(${index})"
          >
            ×
          </button>

        </div>

        <div class="small text-secondary mt-1">
          ${selectedProduct.product.afaPercent}% ÁFA
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">

          <div class="input-group input-group-sm" style="width: 130px;">

            <button 
              type="button" 
              class="btn btn-outline-secondary fw-bold"
              onclick="ChangeQuantityWithButtonMinus(${index})"
            >
              −
            </button>

            <span class="form-control text-center bg-white">
              ${selectedProduct.amount}
            </span>

            <button 
              type="button" 
              class="btn btn-outline-secondary fw-bold"
              onclick="ChangeQuantityWithButtonPlus(${index})"
            >
              +
            </button>

          </div>

          <div class="fw-bold fs-5 ms-3 text-nowrap">
            ${selectedProduct.amount * selectedProduct.product.unitPrice} Ft
          </div>

        </div>

        ${
          selectedProduct.product.deposit != 0
            ? `
              <div class="d-flex justify-content-between align-items-center text-secondary">
                <div style="width: 130px;">
                  Betétdíj
                </div>

                <div class="ms-3 text-nowrap">
                  ${selectedProduct.product.deposit * selectedProduct.amount} Ft
                </div>
              </div>
            `
            : ""
        }

      </div>
    `;
    });

    function RefreshItemCount() {
      const cartItemCountArea = document.getElementById("cart-item-count");
      let itemCount = 0;

      selectedProducts.forEach((item) => {
        if (item.product.productSize == "db") itemCount += item.amount;
        else itemCount += 1;
      });

      cartItemCountArea.textContent = `${itemCount} termék`;
    }

    function RefreshTotalPrice() {
      const totalPriceArea = document.getElementById("cart-total");
      var totalPrice = 0;
      selectedProducts.forEach((selectedProduct) => {
        totalPrice +=
          selectedProduct.product.unitPrice * selectedProduct.amount +
          selectedProduct.product.deposit * selectedProduct.amount;
      });

      totalPriceArea.textContent = `${totalPrice} Ft`;
    }

    RefreshTotalPrice();
    RefreshItemCount();
  };

  async function AddToSelectedProduct(product, quantity) {
    var hasProduct;
    selectedProducts.forEach((selectedProduct) => {
      if (selectedProduct.product.sku == product.sku)
        hasProduct = selectedProduct;
    });
    if (hasProduct == undefined) {
      selectedProducts.push({ amount: Number(quantity), product: product });
    } else {
      hasProduct.amount += Number(quantity);
    }
    await FillCart();
  }

  async function AddProductToCart(product, quantity) {
    const response = await isProductAvailableForCashier({
      sku: product.sku,
      quantity: Number(quantity),
    });

    if (response.isAvailable == false) {
      DisplayAlert("danger", "Nincs elegendő termék az üzletben!");
      return;
    }

    await AddToSelectedProduct(
      {
        productName: product.productName,
        unitPrice: response.unitPrice,
        sku: product.sku,
        afaPercent: response.afaPercent,
        deposit: response.deposit,
        productSize: product.productSize,
      },
      quantity,
    );

    // When you remove all the items this should be turned back!
    isCartEmpty = false;
    SwitchCartEmptyText();
  }

  async function FillProducts(products) {
    cashierProductListArea.innerHTML = " ";
    products.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add(["card", "h-100", "border-0", "rounded"]);
      card.style.cursor = "pointer";
      card.style.backgroundColor = "#ffffff";
      card.innerHTML = `        
          <img 
            src="${product.imageURL}" 
            alt="${product.productName}"
            class="card-img-top object-fit-contain p-2"
            style="height: 140px;"
        >

        <div class="card-body d-flex align-items-center justify-content-center p-2">
            <div class="fw-semibold text-center">
                ${product.productName}
            </div>
        </div>
    </div>`;
      cashierProductListArea.appendChild(card);

      card.addEventListener("click", async () => {
        if (product.productSize == "db") {
          await AddProductToCart(product, 1);
        } else {
          await OpenQuantityModal(product);
        }
      });
    });
    cashierProductListArea.scrollTo({
      top: cashierProductListArea.scrollHeight,
      behavior: "smooth",
    });
  }

  await FillProducts(products);

  const productSearchInputArea = document.getElementById(
    "cashier-product-search",
  );

  var isProductSearcInputAreaInFocus = false;

  productSearchInputArea.addEventListener(
    "focus",
    () => (isProductSearcInputAreaInFocus = true),
  );

  productSearchInputArea.addEventListener(
    "focusout",
    () => (isProductSearcInputAreaInFocus = false),
  );

  var barcode = "";
  document.addEventListener("keydown", async (e) => {
    if (!isCashRegisterMode) return;

    if (e.key === "Enter") {
      barcode = barcode.replace("ö", "0").replace("Ö", "0");

      products.forEach((product) => {
        if (product.barcode == barcode) {
          selectedProduct = product;
        }
      });

      barcode = "";

      if (selectedProduct === undefined) {
        DisplayAlert("danger", "Nincs termék a beolvasott vonalkóddal!");
        return;
      }

      if (selectedProduct.productSize === "db") {
        await AddProductToCart(selectedProduct, 1);
      } else {
        await OpenQuantityModal(selectedProduct);
      }

      return;
    }

    if (
      e.key === "Control" ||
      e.key === "Shift" ||
      e.key === "Alt" ||
      e.key === "Meta"
    ) {
      return;
    }

    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
      barcode += e.key;
      return;
    }

    barcode += e.key;
  });

  productSearchInputArea.addEventListener("input", async () => {
    const searchValue = productSearchInputArea.value.toLowerCase();

    await FillProducts(
      products.filter((x) => x.productName.toLowerCase().includes(searchValue)),
    );
  });
  await FillCart();
  modal.show();
};

document
  .getElementById("checkout-button")
  .addEventListener("click", async () => {
    if (selectedProducts == []) {
      DisplayAlert("danger", "Hiba! Nincs termék a kosárban!");
      return;
    }

    console.log(selectedProducts);

    const checkoutModal = new bootstrap.Modal(
      document.getElementById("checkout-modal"),
    );

    const now = new Date();

    const dateTime =
      now.getFullYear() +
      "." +
      String(now.getMonth() + 1).padStart(2, "0") +
      "." +
      String(now.getDate()).padStart(2, "0") +
      ". " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");

    document.getElementById("date-area").textContent = dateTime;

    const receiptItemsArea = document.getElementById("receipt-items-area");
    receiptItemsArea.innerHTML = "";
    let productsAmount = 0;
    let totalPrice = 0;

    let afa27 = 0;
    let afa18 = 0;
    let afa5 = 0;
    let afa0 = 0;

    selectedProducts.forEach((selectedProduct) => {
      switch (selectedProduct.product.afaPercent) {
        case 27:
          afa27 += selectedProduct.amount * selectedProduct.product.unitPrice;
          break;
        case 18:
          afa18 += selectedProduct.amount * selectedProduct.product.unitPrice;
        case 5:
          afa5 += selectedProduct.amount * selectedProduct.product.unitPrice;
        case 0:
          afa0 += selectedProduct.amount * selectedProduct.product.unitPrice;
      }

      if (selectedProduct.product.deposit != 0) {
        afa0 += selectedProduct.amount * selectedProduct.product.deposit;
      }

      function ReturnAfaForProducts(afa) {
        switch (afa) {
          case 27:
            return `<div class="col-1 text-end">C00</div>`;
          case 18:
            return `<div class="col-1 text-end">B00</div>`;
          case 5:
            return `<div class="col-1 text-end">A00</div>`;
          case 0:
            return `<div class="col-1 text-end">E00</div>`;
        }
      }

      productsAmount += selectedProduct.amount;
      totalPrice +=
        selectedProduct.amount *
        (selectedProduct.product.unitPrice + selectedProduct.product.deposit);
      receiptItemsArea.innerHTML += `
      <div class="row py-3 border-bottom">
                          <div class="col-5">
                            <div class="fw-semibold">${selectedProduct.product.productName}</div>
                          </div>

                          <div class="col-2 text-center">${selectedProduct.amount}</div>

                          <div class="col-2 text-end">${selectedProduct.product.unitPrice}Ft/${selectedProduct.product.productSize}</div>

                          <div class="col-2 text-end fw-semibold">${selectedProduct.amount * selectedProduct.product.unitPrice} Ft</div>

                          ${ReturnAfaForProducts(
                            selectedProduct.product.afaPercent,
                          )}

                          ${
                            selectedProduct.product.deposit == 0
                              ? " "
                              : `
                          <div class="col-5" muted>
                            <div class="fw-semibold">Betétdíj</div>
                          </div>

                          <div class="col-2 text-center" muted>${selectedProduct.amount}</div>

                          <div class="col-2 text-end" muted>${selectedProduct.product.deposit}Ft/db</div>

                          <div class="col-2 text-end fw-semibold" muted>${selectedProduct.amount * selectedProduct.product.deposit} Ft</div>
                          
                          <div class="col-1 text-end">E00</div>
                          `
                          }
                        </div>`;
    });

    document.getElementById("products-count-area").textContent =
      `${productsAmount}db`;

    document.getElementById("total-price-area").textContent = `${totalPrice}Ft`;
    document.getElementById("total-price").textContent = `${totalPrice}Ft`;
    document.getElementById("afa-27-area").textContent = `${afa27}Ft`;
    document.getElementById("afa-18-area").textContent = `${afa18}Ft`;
    document.getElementById("afa-5-area").textContent = `${afa5}Ft`;
    document.getElementById("afa-0-area").textContent = `${afa0}Ft`;

    checkoutModal.show();
  });

document
  .getElementById("save-purchase-btn")
  .addEventListener("click", async () => {
    if (selectedProducts.length == 0) {
      DisplayAlert("danger", "Hiba! Nincs termék kiválasztva!");
      return;
    }
    isCashRegisterMode = false;
    const requestBody = [];

    selectedProducts.forEach((selectedProduct) => {
      requestBody.push({
        SKU: selectedProduct.product.sku,
        Quantity: selectedProduct.amount,
      });
    });

    const response = await savePurchase(requestBody);

    if (response == true) {
      DisplayAlert("success", "Sikeres mentés!");
      selectedProducts = [];

      const checkoutModal = new bootstrap.Modal(
        document.getElementById("checkout-modal"),
      );

      checkoutModal.hide();
      document.getElementById("checkout-modal").style.display = "none";
      document
        .querySelectorAll(".modal-backdrop")
        .forEach((div) => div.remove());

      await FillCart();
    } else {
      DisplayAlert("danger", `Hiba! ${response}`);
    }
  });
