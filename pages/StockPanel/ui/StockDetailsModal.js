import { SetProductImageSource } from "../../shared/ProductImage.js";
import {
  GetStockById,
  UpdateStockShopQuantity,
} from "../features/StockService.js";
import {
  SetSelectedStock,
  ClearSelectedStock,
  GetSelectedStock,
} from "../features/StockState.js";

import { DisplayAlert as DisplayStockAlert } from "../../shared/Alert.js";
import { RenderStockDocumentsSection } from "../../shared/stockDocuments/StockDocumentsUI.js";
import { LoadStockDocumentsSection } from "../../shared/stockDocuments/StockDocumentsFeature.js";
import { IsExpiredStock } from "../../shared/ExpiredStockBadge.js";

export async function ShowStockDetails(stockId) {
  const stock = await GetStockById(stockId);

  if (!stock) {
    console.error("A készlet részleteinek lekérése sikertelen.");
    return;
  }

  SetSelectedStock(stock);

  const modalElement = document.getElementById("stock-details-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  SetProductImageSource(
    document.getElementById("modal-product-image"),
    stock.product.imageURL || stock.imageURL || stock.product.productImageURL,
    { loading: "eager" },
  );

  document.getElementById("modal-product-name").textContent =
    stock.product.productName;

  document.getElementById("modal-product-brand-and-type").textContent =
    `${stock.product.brand} • ${stock.product.productType}`;

  document.getElementById("modal-product-active").innerHTML =
    ReturnActiveOrInactiveBadge(stock.product.isActive);

  document.getElementById("modal-barcode").textContent = stock.product.barcode;

  document.getElementById("modal-sku").textContent = stock.product.sku;

  document.getElementById("modal-quantity").textContent =
    `${stock.quantity} ${stock.product.productSize}`;

  document.getElementById("modal-shop-quantity").textContent =
    `${stock.shopQuantity} ${stock.product.productSize}`;

  document.getElementById("modal-current-price").textContent =
    `${stock.currentPrice} Ft`;

  document.getElementById("modal-import-price").textContent =
    sessionStorage.getItem("roleName") !== "Counter"
      ? `${stock.importPrice} Ft`
      : "-";

  document.getElementById("modal-invoice").textContent = stock.invoiceId;

  document.getElementById("modal-transit").textContent = stock.transitId;

  document.getElementById("modal-expiration").textContent =
    stock.expirationDate;
  document.getElementById("modal-expired-badge")?.classList.toggle("d-none", !IsExpiredStock(stock));

  document.getElementById("modal-recieved").textContent = stock.recievedAt;

  const documentHost = document.getElementById("modal-stock-documents");
  if (documentHost) {
    const isAdmin = sessionStorage.getItem("roleName") === "Admin";
    documentHost.classList.toggle("d-none", !isAdmin);
    documentHost.innerHTML = isAdmin
      ? RenderStockDocumentsSection(stock.stockId ?? stock.id ?? stockId)
      : "";
    if (isAdmin) {
      void LoadStockDocumentsSection(
        documentHost.querySelector("[data-stock-document-section]"),
      );
    }
  }

  document
    .getElementById("modal-product-discount")
    .classList.toggle("d-none", !stock.isDiscounted);

  document
    .getElementById("modal-product-deposit")
    .classList.toggle("d-none", !stock.product.hasDeposit);

  modal.show();
}

function ReturnActiveOrInactiveBadge(isActive) {
  if (isActive) {
    return `<span class="badge bg-success fs-6 px-3 py-2">Aktív</span>`;
  }

  return `<span class="badge bg-danger fs-6 px-3 py-2">Inaktív</span>`;
}

export function InitializeStockDetailsModal() {
  const closeButton = document.getElementById("close-stock-details-modal-btn");

  closeButton?.addEventListener("click", () => {
    ClearSelectedStock();

    const modalElement = document.getElementById("stock-details-modal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    modal?.hide();

    document
      .querySelectorAll("div.modal-backdrop")
      .forEach((backdrop) => backdrop.remove());
  });

  if (sessionStorage.getItem("roleName") === "Admin") {
    document.getElementById("edit-price-btn")?.classList.remove("d-none");
  }

  const roleName = sessionStorage.getItem("roleName");

  if (roleName === "Admin" || roleName === "Storage") {
    document
      .getElementById("edit-shopquantity-btn")
      ?.classList.remove("d-none");
  }
}

export function OpenUpdateShopQuantityModal() {
  const roleName = sessionStorage.getItem("roleName");
  if (roleName !== "Admin" && roleName !== "Storage") {
    DisplayStockAlert("danger", "Nincs jogosultságod a bolti mennyiség módosításához.");
    return;
  }

  const stock = GetSelectedStock();

  if (!stock) {
    DisplayStockAlert("warning", "Hiba! Nincs megnyitott termék!");
    return;
  }

  const modalElement = document.getElementById("change-shop-quantity-modal");

  document.getElementById("change-shop-quantity-product-name").textContent =
    stock.product.productName;

  document.getElementById("change-shop-quantity-product-quantity").textContent =
    stock.quantity;

  document.getElementById("change-shop-quantity-current").textContent =
    stock.shopQuantity;

  document.getElementById("change-shop-quantity-new").value =
    stock.shopQuantity;

  const helpText = document.getElementById("change-shop-quantity-help");
  if (helpText) {
    helpText.textContent =
      roleName === "Admin"
        ? "A bolti mennyiség növelhető és csökkenthető."
        : "A bolti mennyiséget csökkenteni csak Admin jogosultsággal lehet.";
  }

  bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

export function InitializeStockShopQuantityModal() {
  const saveButton = document.getElementById(
    "save-update-stock-shop-quantity-btn",
  );

  document
    .getElementById("edit-shopquantity-btn")
    ?.addEventListener("click", OpenUpdateShopQuantityModal);

  saveButton?.addEventListener("click", async () => {
    const roleName = sessionStorage.getItem("roleName");
    if (roleName !== "Admin" && roleName !== "Storage") {
      DisplayStockAlert("danger", "Nincs jogosultságod a bolti mennyiség módosításához.");
      return;
    }

    const stock = GetSelectedStock();

    if (!stock) {
      DisplayStockAlert("warning", "Nincs kiválasztott készlet!");
      return;
    }

    const shopQuantity = Number(
      document.getElementById("change-shop-quantity-new").value,
    );

    if (!Number.isFinite(shopQuantity) || shopQuantity < 0) {
      DisplayStockAlert("danger", "Adj meg egy érvényes mennyiséget!");
      return;
    }

    if (roleName !== "Admin" && shopQuantity < Number(stock.shopQuantity)) {
      DisplayStockAlert(
        "danger",
        "A bolti mennyiség csökkentéséhez Admin jogosultság szükséges.",
      );
      return;
    }

    if (shopQuantity > stock.quantity) {
      DisplayStockAlert(
        "danger",
        "Nem lehet több a bolti mennyiség, mint az összmennyiség!",
      );
      return;
    }

    const response = await UpdateStockShopQuantity({
      Id: stock.id,
      ShopQuantity: shopQuantity,
    });

    if (!response.success) {
      DisplayStockAlert("danger", response.message || "Sikertelen módosítás!");
      return;
    }

    bootstrap.Modal.getInstance(
      document.getElementById("change-shop-quantity-modal"),
    )?.hide();

    DisplayStockAlert("success", "Sikeres módosítás!");

    await ShowStockDetails(stock.id);
  });
}
