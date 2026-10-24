import { GetAllProducts } from "../cashier/CashierService.js";

import { RenderProductSearchList } from "../../ui/productSearch/ProductSearchList.js";

import {
  RenderProductDetailsModal,
  ShowProductDetailsModal,
} from "../../ui/productSearch/ProductDetailsModal.js";

import {
  OpenProductSearchPanel,
  CloseProductSearchPanel,
  GetProductSearchInput,
  GetBarcodeInput,
  GetSelectProductButton,
  GetSearchProductCloseButton,
  ShowSelectedProduct,
} from "../../ui/productSearch/ProductSearchPanel.js";

import { DisplayAlert } from "../../../shared/Alert.js";
import { NormalizeBarcode } from "../../../shared/NormalizeBarcode.js";
import {
  GetProducts,
  SetProducts,
  GetSelectedProduct,
  SetSelectedProduct,
  ClearSelectedProduct,
} from "./ProductSearchState.js";

let searchProductModal = null;
let isInitialized = false;

function SelectProduct(product) {
  SetSelectedProduct(product);

  ShowSelectedProduct(product);
}

function FilterProducts() {
  const productFilterInput = GetProductSearchInput();

  if (!productFilterInput) {
    return;
  }

  const filterValue = productFilterInput.value.toLowerCase();

  const filteredProducts = GetProducts().filter((product) =>
    product.productName?.toLowerCase().includes(filterValue),
  );

  RenderProductSearchList(filteredProducts, SelectProduct);
}

function HandleBarcodeInput() {
  const barcodeInput = GetBarcodeInput();

  if (!barcodeInput) {
    return;
  }

  const barcode = NormalizeBarcode(barcodeInput.value);

  barcodeInput.value = barcode;

  const product = GetProducts().find((product) => product.barcode === barcode);

  if (!product) {
    DisplayAlert("danger", "Termék nem létezik ilyen vonalkóddal.");

    return;
  }

  SelectProduct(product);

  RenderProductDetailsModal(product);
  ShowProductDetailsModal();
}

function HandleSelectProduct() {
  const selectedProduct = GetSelectedProduct();

  if (!selectedProduct) {
    DisplayAlert(
      "danger",
      "Nincs kiválasztott termék. Kérlek válassz ki egy terméket a listából!",
    );

    return;
  }

  RenderProductDetailsModal(selectedProduct);
  ShowProductDetailsModal();
}

function InitializeEventListeners() {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  const productFilterInput = GetProductSearchInput();

  productFilterInput?.addEventListener("input", FilterProducts);

  const barcodeInput = GetBarcodeInput();

  barcodeInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    HandleBarcodeInput();
  });

  const selectProductButton = GetSelectProductButton();

  selectProductButton?.addEventListener("click", HandleSelectProduct);

  const closeButton = GetSearchProductCloseButton();

  closeButton?.addEventListener("click", () => {
    CloseProductSearchPanel(searchProductModal);
  });
}

export async function OpenProductSearchModal() {
  InitializeEventListeners();

  const response = await GetAllProducts();

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  SetProducts(response.data ?? []);
  ClearSelectedProduct();

  const productFilterInput = GetProductSearchInput();

  if (productFilterInput) {
    productFilterInput.value = "";
  }

  const barcodeInput = GetBarcodeInput();

  if (barcodeInput) {
    barcodeInput.value = "";
  }

  RenderProductSearchList(GetProducts(), SelectProduct);

  searchProductModal = OpenProductSearchPanel();
}
