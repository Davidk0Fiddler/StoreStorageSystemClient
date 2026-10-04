import {
  brandRepository,
  productRepository,
  productSizeRepository,
  productTypeRepository,
  stockRepository,
} from "../../../libs/data-access/index.js";
import { DisplayAlert, LoadingSpinner } from "../../../libs/ui/index.js";

const {
  getAllBrands,
  activateBrand,
  deactivateBrand,
  updateBrand,
  createBrand,
} = brandRepository;

const {
  getAllProductTypes,
  activateProductType,
  deactivateProductType,
  updateProductType,
  createProductType,
} = productTypeRepository;

const {
  getAllProductSizes,
  activateProductSize,
  deactivateProductSize,
  updateProductSize,
  createProductSize,
} = productSizeRepository;

const {
  getAllProducts,
  getProductsForListing,
  getProductBySku,
  activateProduct,
  deactivateProduct,
  updateProduct,
  createProduct,
  getProductByBarcode,
} = productRepository;

const { addStock } = stockRepository;

const createStockPanel = `<form class="row g-3 p-1 d-flex justify-content-center">
          <div class="mb-3 col-12 row mt-3 d-flex justify-content-evenly">
            <div class="col-12 col-md-5">
              <label for="barcode-input" class="form-label"> Vonalkód </label>

              <input
                type="text"
                class="form-control"
                id="barcode-input"
                placeholder="5901234123457"
              />
            </div>

            <div class="col-12 col-md-5">
              <label for="stock-quantity-input" class="form-label">
                Mennyiség
              </label>

              <input
                type="number"
                min="1"
                class="form-control"
                id="stock-quantity-input"
                placeholder="20"
              />
            </div>
          </div>

          <div class="col-12 col-md-10">
            <div class="alert alert-secondary" id="selected-product-container">
              <strong>Termék:</strong>

              <span id="selected-product-name">
                Nincs kiválasztott termék
              </span>
            </div>
          </div>

          <div class="mb-3 col-12 row d-flex justify-content-evenly">
            <div class="col-12 col-md-5">
              <label for="original-price-input" class="form-label">
                Normál ár (Ft)
              </label>

              <input
                type="number"
                min="0"
                class="form-control"
                id="original-price-input"
                placeholder="799"
              />
            </div>

            <div class="col-12 col-md-5">
              <label for="current-price-input" class="form-label">
                Aktuális ár (Ft)
              </label>

              <input
                type="number"
                min="0"
                class="form-control"
                id="current-price-input"
                placeholder="599"
              />
            </div>
          </div>

          <div class="col-12 col-md-10">
            <div class="alert alert-success d-none" id="discount-info"></div>
          </div>

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

              <input type="date" class="form-control" id="received-at-input" />
            </div>
          </div>

          <div class="col-12 col-md-10 d-grid">
            <button type="submit" class="btn btn-success">
              <i class="bi bi-floppy-fill me-2"></i>
              Készlet rögzítése
            </button>
          </div>
        </form>`;

document.getElementById("back-to-menu-button").addEventListener("click", () => {
  window.location.href = "../LandingPage/LandingPage.html";
});

document
  .getElementById("back-to-menu-side-bar-button")
  .addEventListener("click", () => {
    window.location.href = "../LandingPage/LandingPage.html";
  });


const contentContainer = document.getElementById("content-container");
const panelLabel = document.getElementById("panel-label");

//#region Brand variables and methods

var currentBrandFilter;

document
  .getElementById("open-brand-panel")
  .addEventListener("click", await DisplayBrandPanel);

const brandPanel = `<div class="brand-filter-bar mb-3">

  <div class="brand-filter active" id="all-brands-button">
    <div class="brand-filter-icon">
      <i class="bi bi-tags"></i>
    </div>

    <div class="brand-filter-content">
      <span class="brand-filter-label">Összes márka</span>
      <span id="all-brands-area" class="brand-filter-count">0</span>
    </div>
  </div>

  <div class="brand-filter" id="all-active-brands-button">
    <div class="brand-filter-icon">
      <i class="bi bi-check-circle"></i>
    </div>

    <div class="brand-filter-content">
      <span class="brand-filter-label">Aktív márkák</span>
      <span id="all-active-brands-area" class="brand-filter-count">0</span>
    </div>
  </div>

  <div class="brand-filter" id="all-inactive-brands-button">
    <div class="brand-filter-icon">
      <i class="bi bi-pause-circle"></i>
    </div>

    <div class="brand-filter-content">
      <span class="brand-filter-label">Inaktív márkák</span>
      <span id="all-inactive-brands-area" class="brand-filter-count">0</span>
    </div>
  </div>

  <div class="brand-create-wrapper">
    <button
      class="brand-create-button"
      id="open-brand-creation-modal-button"
    >
      <i class="bi bi-building-add"></i>
      Márka létrehozása
    </button>
  </div>

</div>

        <div class="row p-1 d-flex justify-content-evenly" id="brands-container">
        </div>`;

window.SendBrandDeactivation = async function SendBrandDeactivation(brandId) {
  LoadingSpinner(true);
  const response = await deactivateBrand(brandId);

  LoadingSpinner(false);
  if (response == true) {
    DisplayAlert("success", "Sikeres deaktiválás!");
    var brandsList = await LoadBrands();
    switch (currentBrandFilter) {
      case null:
        FillBrands(brandsList);
        break;
      case true:
        FillBrands(brandsList.filter((b) => b.isActive == true));
        break;
      case false:
        FillBrands(brandsList.filter((b) => b.isActive == false));
        break;
    }
  } else {
    DisplayAlert("danger", response);
  }
};

window.SendBrandActivation = async function SendBrandActivation(brandId) {
  LoadingSpinner(true);
  const response = await activateBrand(brandId);

  LoadingSpinner(false);
  if (response == true) {
    DisplayAlert("success", "Sikeres aktiválás!");
    var brandsList = await LoadBrands();
    switch (currentBrandFilter) {
      case null:
        FillBrands(brandsList);
        break;
      case true:
        FillBrands(brandsList.filter((b) => b.isActive == true));
        break;
      case false:
        FillBrands(brandsList.filter((b) => b.isActive == false));
        break;
    }
  } else {
    DisplayAlert("danger", response);
  }
};

// Updating Brands

var updatingBrandId = 0;
window.OpenUserUpdateModal = async function OpenUserUpdateModal(
  brandId,
  brandName,
) {
  document.getElementById("update-original-brandname").value = brandName;

  document.getElementById("update-brandname-input").value = brandName;

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("brand-update-modal"),
  );

  modal.show();
  updatingBrandId = Number(brandId);
};

document
  .getElementById("brand-update-save-button")
  .addEventListener("click", async () => {
    let updatedBrandName = document.getElementById(
      "update-brandname-input",
    ).value;

    if (updatedBrandName == " " || updatedBrandName == "") {
      DisplayAlert("danger", "Adjon meg egy márkanevet!");
      return;
    }

    const requestBody = {
      Id: Number(updatingBrandId),
      BrandName: updatedBrandName,
    };

    const response = await updateBrand(requestBody);

    if (response === true) {
      DisplayAlert("success", "Sikeres módosítás!");

      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("brand-update-modal"),
      );

      modal.hide();

      var newBrandsList = await LoadBrands();
      FillBrands(newBrandsList);
    } else {
      DisplayAlert("danger", response);
    }
  });

function FillBrands(brands) {
  const brandsContainer = document.getElementById("brands-container");

  brandsContainer.innerHTML = " ";

  brands.forEach((brand) => {
    brandsContainer.innerHTML += `
    <div class="card col-3 m-2 brand-card">
  <div class="card-body p-3">

    <div class="brand-card-title">
      <div class="brand-card-icon">
        <i class="bi bi-building"></i>
      </div>

      <div class="brand-card-content">
        <span class="brand-card-label">
          Márkanév
        </span>

        <span id="brand-name-area" class="brand-card-name">
          ${brand.brandName}
        </span>
      </div>
    </div>

    <div class="row d-flex justify-content-evenly mt-3">

      <button
        class="btn brand-card-edit col-6 m-1"
        onclick="OpenUserUpdateModal('${brand.id}', '${brand.brandName}')"
      >
        <i class="bi bi-pencil me-1"></i>
        Módosítás
      </button>

      ${ReturnBrandActivationOrDeactivationButton(brand)}

    </div>

  </div>
</div>`;
  });
}

async function LoadBrands() {
  var brands = await getAllBrands();

  document.getElementById("all-brands-area").textContent = brands.length;
  document.getElementById("all-active-brands-area").textContent = brands.filter(
    (b) => b.isActive == true,
  ).length;
  document.getElementById("all-inactive-brands-area").textContent =
    brands.filter((b) => b.isActive == false).length;

  return brands;
}

function ReturnBrandActivationOrDeactivationButton(brand) {
  if (brand.isActive) {
    return `<button class="btn btn-success col-6 m-1" onclick="SendBrandDeactivation('${brand.id}')">
                  <i class="bi bi-toggle-on" style="cursor: pointer"></i>
                  Aktív
                </button>`;
  } else {
    return `<button class="btn btn-danger col-6 m-1" onclick="SendBrandActivation('${brand.id}')">
                  <i class="bi bi-toggle-off" style="cursor: pointer"></i>
                  Inaktív
                </button>`;
  }
}

async function DisplayBrandPanel() {
  panelLabel.textContent = "Márka panel";

  contentContainer.innerHTML = brandPanel;

  const allBrandsBtn = document.getElementById("all-brands-button");

  const allActiveBrandsBtn = document.getElementById(
    "all-active-brands-button",
  );

  const allInactiveBrandsBtn = document.getElementById(
    "all-inactive-brands-button",
  );

  // Aktív gomb kezelése
  function SetActiveBrandFilter(activeButton) {
    const buttons = [allBrandsBtn, allActiveBrandsBtn, allInactiveBrandsBtn];

    buttons.forEach((button) => {
      button.classList.remove("active");
    });

    activeButton.classList.add("active");
  }

  // Alapértelmezett szűrő
  currentBrandFilter = null;

  SetActiveBrandFilter(allBrandsBtn);

  // Összes márka betöltése
  var brands = await LoadBrands();

  FillBrands(brands);

  // Aktív márkák
  allActiveBrandsBtn.addEventListener("click", async () => {
    currentBrandFilter = true;

    SetActiveBrandFilter(allActiveBrandsBtn);

    var brandsList = await LoadBrands();

    FillBrands(brandsList.filter((b) => b.isActive == true));
  });

  // Inaktív márkák
  allInactiveBrandsBtn.addEventListener("click", async () => {
    currentBrandFilter = false;

    SetActiveBrandFilter(allInactiveBrandsBtn);

    var brandsList = await LoadBrands();

    FillBrands(brandsList.filter((b) => b.isActive == false));
  });

  // Összes márka
  allBrandsBtn.addEventListener("click", async () => {
    currentBrandFilter = null;

    SetActiveBrandFilter(allBrandsBtn);

    var brandsList = await LoadBrands();

    FillBrands(brandsList);
  });

  document
    .getElementById("open-brand-creation-modal-button")
    .addEventListener("click", async () => {
      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("brand-create-modal"),
      );

      modal.show();

      document
        .getElementById("brand-create-save-button")
        .addEventListener("click", async () => {
          let newBrandName = document.getElementById(
            "create-brandname-input",
          ).value;

          if (newBrandName == " " || newBrandName == "") {
            DisplayAlert("danger", "Adjon meg márkanevet!");
            console.log(newBrandName);
            return;
          }

          console.log(typeof newBrandName, " - ", newBrandName);

          var requestBody = {
            BrandName: newBrandName,
          };

          const response = await createBrand(requestBody);

          if (response == true) {
            DisplayAlert("success", "Sikeres létrehozás");
            modal.hide();
            var newBrandsListAfterCreate = await LoadBrands();
            FillBrands(newBrandsListAfterCreate);
          } else {
            DisplayAlert("danger", response);
          }
        });
    });
}

//#endregion
/*
















*/
//#region ProuctType variables and methods
var currentProductTypeFilter;

document
  .getElementById("open-producttype-panel-button")
  .addEventListener("click", await DisplayProductTypePanel);

const productTypePanel = `
<div class="producttype-filter-bar mb-3">

  <!-- Összes -->
  <div
    class="producttype-filter active"
    id="all-producttypes-button"
  >
    <div class="producttype-filter-icon">
      <i class="bi bi-bookmarks"></i>
    </div>

    <div class="producttype-filter-content">
      <span class="producttype-filter-label">
        Összes terméktípus
      </span>

      <span
        id="all-producttypes-area"
        class="producttype-filter-count"
      >
        0
      </span>
    </div>
  </div>


  <!-- Aktív -->
  <div
    class="producttype-filter"
    id="all-active-producttypes-button"
  >
    <div class="producttype-filter-icon">
      <i class="bi bi-check-circle"></i>
    </div>

    <div class="producttype-filter-content">
      <span class="producttype-filter-label">
        Aktív terméktípusok
      </span>

      <span
        id="all-active-producttypes-area"
        class="producttype-filter-count"
      >
        0
      </span>
    </div>
  </div>


  <!-- Inaktív -->
  <div
    class="producttype-filter"
    id="all-inactive-producttypes-button"
  >
    <div class="producttype-filter-icon">
      <i class="bi bi-pause-circle"></i>
    </div>

    <div class="producttype-filter-content">
      <span class="producttype-filter-label">
        Inaktív terméktípusok
      </span>

      <span
        id="all-inactive-producttypes-area"
        class="producttype-filter-count"
      >
        0
      </span>
    </div>
  </div>


  <!-- Létrehozás -->
  <div class="producttype-create-wrapper">

    <button
      type="button"
      class="producttype-create-button"
      id="open-producttype-creation-modal-button"
    >
      <i class="bi bi-bookmark-plus me-2"></i>
      Terméktípus létrehozása
    </button>

  </div>

</div>


        <div class="row p-1 d-flex justify-content-evenly" id="producttypes-container">
        </div>`;

window.SendProductTypeDeactivation = async function SendProductTypeDeactivation(
  productTypeId,
) {
  LoadingSpinner(true);
  const response = await deactivateProductType(productTypeId);

  LoadingSpinner(false);
  if (response == true) {
    DisplayAlert("success", "Sikeres deaktiválás!");
    var productTypesList = await LoadProductTypes();
    switch (currentProductTypeFilter) {
      case null:
        FillProductTypes(productTypesList);
        break;
      case true:
        FillProductTypes(productTypesList.filter((pt) => pt.isActive == true));
        break;
      case false:
        FillProductTypes(productTypesList.filter((pt) => pt.isActive == false));
        break;
    }
  } else {
    DisplayAlert("danger", response);
  }
};

window.SendProductTypeActivation = async function SendProductTypeActivation(
  productTypeId,
) {
  LoadingSpinner(true);
  const response = await activateProductType(productTypeId);

  LoadingSpinner(false);
  if (response == true) {
    DisplayAlert("success", "Sikeres aktiválás!");
    var productTypesList = await LoadProductTypes();
    switch (currentProductTypeFilter) {
      case null:
        FillProductTypes(productTypesList);
        break;
      case true:
        FillProductTypes(productTypesList.filter((pt) => pt.isActive == true));
        break;
      case false:
        FillProductTypes(productTypesList.filter((pt) => pt.isActive == false));
        break;
    }
  } else {
    DisplayAlert("danger", response);
  }
};

// Updating ProductTypes

var updatingProductTypeId = 0;
window.OpenProductTypeUpdateModal = async function OpenProductTypeUpdateModal(
  productTypeId,
  productTypeName,
) {
  document.getElementById("update-original-producttype-name").value =
    productTypeName;

  document.getElementById("update-producttype-name-input").value =
    productTypeName;

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("producttype-update-modal"),
  );

  modal.show();
  updatingProductTypeId = Number(productTypeId);
};

document
  .getElementById("producttype-update-save-button")
  .addEventListener("click", async () => {
    let updatedProductType = document.getElementById(
      "update-producttype-name-input",
    ).value;

    if (updatedProductType == " " || updatedProductType == "") {
      DisplayAlert("danger", "Adjon meg terméktípust!");
      return;
    }

    const requestBody = {
      Id: Number(updatingProductTypeId),
      TypeName: updatedProductType,
    };

    const response = await updateProductType(requestBody);

    if (response === true) {
      DisplayAlert("success", "Sikeres módosítás!");

      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("producttype-update-modal"),
      );

      modal.hide();

      var newProductTypeList = await LoadProductTypes();
      FillProductTypes(newProductTypeList);
    } else {
      DisplayAlert("danger", response);
    }
  });

function FillProductTypes(productTypes) {
  const productTypesContainer = document.getElementById(
    "producttypes-container",
  );

  productTypesContainer.innerHTML = " ";

  productTypes.forEach((productType) => {
    productTypesContainer.innerHTML += `
   <div class="card col-3 m-2 border-0 shadow-sm rounded-4 product-type-card">
  <div class="card-body p-4">

    <div class="d-flex justify-content-between align-items-start">

      <div class="d-flex align-items-center">

        <div class="rounded-3 bg-primary bg-opacity-10 p-2 me-3">
          <i class="bi bi-box-seam text-primary fs-4"></i>
        </div>

        <div>
          <div class="text-muted small">
            Terméktípus
          </div>

          <div class="fw-bold fs-5 mt-1">
            ${productType.typeName}
          </div>
        </div>

      </div>

      <span class="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2">
        Aktív
      </span>

    </div>

    <div class="d-flex gap-2 mt-4">

      <button
        class="btn btn-primary flex-fill rounded-3"
        onclick="OpenProductTypeUpdateModal('${productType.id}', '${productType.typeName}')"
      >
        <i class="bi bi-pencil me-2"></i>
        Módosítás
      </button>

      ${ReturnProductTypeActivationOrDeactivationButton(productType)}

    </div>

  </div>
</div>`;
  });
}

async function LoadProductTypes() {
  var productTypes = await getAllProductTypes();

  document.getElementById("all-producttypes-area").textContent =
    productTypes.length;
  document.getElementById("all-active-producttypes-area").textContent =
    productTypes.filter((pt) => pt.isActive == true).length;
  document.getElementById("all-inactive-producttypes-area").textContent =
    productTypes.filter((pt) => pt.isActive == false).length;

  return productTypes;
}

function ReturnProductTypeActivationOrDeactivationButton(productType) {
  if (productType.isActive) {
    return `<button class="btn btn-success col-6 m-1 py-2" onclick="SendProductTypeDeactivation('${productType.id}')">
                  <i class="bi bi-toggle-on" style="cursor: pointer"></i>
                  Aktív
                </button>`;
  } else {
    return `<button class="btn btn-danger col-6 m-1 py-2" onclick="SendProductTypeActivation('${productType.id}')">
                  <i class="bi bi-toggle-off" style="cursor: pointer"></i>
                  Inaktív
                </button>`;
  }
}

async function DisplayProductTypePanel() {
  panelLabel.textContent = "Terméktípus panel";

  contentContainer.innerHTML = productTypePanel;

  const allProductTypesBtn = document.getElementById("all-producttypes-button");

  const allActiveProductTypesBtn = document.getElementById(
    "all-active-producttypes-button",
  );

  const allInactiveProductTypesBtn = document.getElementById(
    "all-inactive-producttypes-button",
  );

  // Segédfüggvény az aktív filter beállításához
  function SetActiveProductTypeFilter(activeButton) {
    const buttons = [
      allProductTypesBtn,
      allActiveProductTypesBtn,
      allInactiveProductTypesBtn,
    ];

    buttons.forEach((button) => {
      button.classList.remove("active");
    });

    activeButton.classList.add("active");
  }

  // Alapértelmezett filter: Összes
  currentProductTypeFilter = null;

  SetActiveProductTypeFilter(allProductTypesBtn);

  // Terméktípusok betöltése
  var productTypes = await LoadProductTypes();

  FillProductTypes(productTypes);

  // Aktív terméktípusok
  allActiveProductTypesBtn.addEventListener("click", async () => {
    currentProductTypeFilter = true;

    SetActiveProductTypeFilter(allActiveProductTypesBtn);

    var productTypeList = await LoadProductTypes();

    FillProductTypes(productTypeList.filter((pt) => pt.isActive === true));
  });

  // Inaktív terméktípusok
  allInactiveProductTypesBtn.addEventListener("click", async () => {
    currentProductTypeFilter = false;

    SetActiveProductTypeFilter(allInactiveProductTypesBtn);

    var productTypes = await LoadProductTypes();

    FillProductTypes(productTypes.filter((pt) => pt.isActive === false));
  });

  // Összes terméktípus
  allProductTypesBtn.addEventListener("click", async () => {
    currentProductTypeFilter = null;

    SetActiveProductTypeFilter(allProductTypesBtn);

    var productTypeList = await LoadProductTypes();

    FillProductTypes(productTypeList);
  });

  // Új terméktípus létrehozása
  document
    .getElementById("open-producttype-creation-modal-button")
    .addEventListener("click", async () => {
      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("producttype-create-modal"),
      );

      modal.show();

      document
        .getElementById("producttype-create-save-button")
        .addEventListener("click", async () => {
          var requestBody = {
            TypeName: document.getElementById("create-producttype-name-input")
              .value,
          };

          const response = await createProductType(requestBody);

          if (response == true) {
            DisplayAlert("success", "Sikeres létrehozás");

            modal.hide();

            var newProductTypesListAfterCreate = await LoadProductTypes();

            FillProductTypes(newProductTypesListAfterCreate);
          } else {
            DisplayAlert("danger", response);
          }
        });
    });
}

function SetActiveProductTypeFilter(activeButton) {
  const buttons = [
    document.getElementById("all-producttypes-button"),
    document.getElementById("all-active-producttypes-button"),
    document.getElementById("all-inactive-producttypes-button"),
  ];

  buttons.forEach((button) => {
    button.classList.remove("active");
  });

  activeButton.classList.add("active");
}
//#endregion
/*
















*/
//#region ProductSize variables and methods
var currentProductSizeFilter;

document
  .getElementById("open-ProductSize-panel-button")
  .addEventListener("click", await DisplayProductSizePanel);

const ProductSizePanel = `<div class="productsize-filter-bar mb-3">

  <!-- Összes -->
  <div
    class="productsize-filter active"
    id="all-ProductSizes-button"
  >
    <div class="productsize-filter-icon">
      <i class="bi bi-rulers"></i>
    </div>

    <div class="productsize-filter-content">
      <span class="productsize-filter-label">
        Összes termékméret
      </span>

      <span
        class="productsize-filter-count"
        id="all-ProductSizes-area"
      >
        0
      </span>
    </div>
  </div>


  <!-- Aktív -->
  <div
    class="productsize-filter"
    id="all-active-ProductSizes-button"
  >
    <div class="productsize-filter-icon">
      <i class="bi bi-check-circle"></i>
    </div>

    <div class="productsize-filter-content">
      <span class="productsize-filter-label">
        Aktív termékméretek
      </span>

      <span
        class="productsize-filter-count"
        id="all-active-ProductSizes-area"
      >
        0
      </span>
    </div>
  </div>


  <!-- Inaktív -->
  <div
    class="productsize-filter"
    id="all-inactive-ProductSizes-button"
  >
    <div class="productsize-filter-icon">
      <i class="bi bi-pause-circle"></i>
    </div>

    <div class="productsize-filter-content">
      <span class="productsize-filter-label">
        Inaktív termékméretek
      </span>

      <span
        class="productsize-filter-count"
        id="all-inactive-ProductSizes-area"
      >
        0
      </span>
    </div>
  </div>


  <!-- Létrehozás -->
  <div class="productsize-create-wrapper">

    <button
      type="button"
      class="productsize-create-button"
      id="open-ProductSize-creation-modal-button"
    >
      <i class="bi bi-rulers me-2"></i>
      Termékméret létrehozása
    </button>

  </div>

</div>

        <div class="row p-1 d-flex justify-content-evenly" id="ProductSizes-container">
        </div>`;

window.SendProductSizeDeactivation = async function SendProductSizeDeactivation(
  ProductSizeId,
) {
  LoadingSpinner(true);
  const response = await deactivateProductSize(ProductSizeId);

  LoadingSpinner(false);
  if (response == true) {
    DisplayAlert("success", "Sikeres deaktiválás!");
    var ProductSizesList = await LoadProductSizes();
    switch (currentProductSizeFilter) {
      case null:
        FillProductSizes(ProductSizesList);
        break;
      case true:
        FillProductSizes(ProductSizesList.filter((pt) => pt.isActive == true));
        break;
      case false:
        FillProductSizes(ProductSizesList.filter((pt) => pt.isActive == false));
        break;
    }
  } else {
    DisplayAlert("danger", response);
  }
};

window.SendProductSizeActivation = async function SendProductSizeActivation(
  ProductSizeId,
) {
  LoadingSpinner(true);
  const response = await activateProductSize(ProductSizeId);

  LoadingSpinner(false);
  if (response == true) {
    DisplayAlert("success", "Sikeres aktiválás!");
    var ProductSizesList = await LoadProductSizes();
    switch (currentProductSizeFilter) {
      case null:
        FillProductSizes(ProductSizesList);
        break;
      case true:
        FillProductSizes(ProductSizesList.filter((pt) => pt.isActive == true));
        break;
      case false:
        FillProductSizes(ProductSizesList.filter((pt) => pt.isActive == false));
        break;
    }
  } else {
    DisplayAlert("danger", response);
  }
};

// Updating ProductSizes

var updatingProductSizeId = 0;
window.OpenProductSizeUpdateModal = async function OpenProductSizeUpdateModal(
  ProductSizeId,
  ProductSizeName,
) {
  document.getElementById("update-original-ProductSize-name").value =
    ProductSizeName;

  document.getElementById("update-ProductSize-name-input").value =
    ProductSizeName;

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("ProductSize-update-modal"),
  );

  modal.show();
  updatingProductSizeId = Number(ProductSizeId);
};

document
  .getElementById("ProductSize-update-save-button")
  .addEventListener("click", async () => {
    const requestBody = {
      Id: Number(updatingProductSizeId),
      SizeName: document.getElementById("update-ProductSize-name-input").value,
    };

    const response = await updateProductSize(requestBody);

    if (response === true) {
      DisplayAlert("success", "Sikeres módosítás!");

      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("ProductSize-update-modal"),
      );

      modal.hide();

      var newProductSizeList = await LoadProductSizes();
      FillProductSizes(newProductSizeList);
    } else {
      DisplayAlert("danger", response);
    }
  });

function FillProductSizes(ProductSizes) {
  const ProductSizesContainer = document.getElementById(
    "ProductSizes-container",
  );

  ProductSizesContainer.innerHTML = " ";

  ProductSizes.forEach((ProductSize) => {
    ProductSizesContainer.innerHTML += `
    <div class="card col-3 m-2">
            <div class="card-body p-3">
              Termékméret:
              <span id="ProductSize-name-area" class="fw-bold">${ProductSize.sizeName}</span>
              <div class="row d-flex justify-content-evenly mt-3">
                <button class="btn btn-secondary col-6 m-1" onclick="OpenProductSizeUpdateModal('${ProductSize.id}', '${ProductSize.sizeName}')">
                  <i
                    class="bi bi-pencil"
                    onclick=""
                    style="cursor: pointer"
                  ></i>
                  Módosítás
                </button>
                ${ReturnProductSizeActivationOrDeactivationButton(ProductSize)}
              </div>
            </div>
          </div>`;
  });
}

async function LoadProductSizes() {
  var ProductSizes = await getAllProductSizes();

  document.getElementById("all-ProductSizes-area").textContent =
    ProductSizes.length;
  document.getElementById("all-active-ProductSizes-area").textContent =
    ProductSizes.filter((pt) => pt.isActive == true).length;
  document.getElementById("all-inactive-ProductSizes-area").textContent =
    ProductSizes.filter((pt) => pt.isActive == false).length;

  return ProductSizes;
}

function ReturnProductSizeActivationOrDeactivationButton(ProductSize) {
  if (ProductSize.isActive) {
    return `<button class="btn btn-success col-6 m-1" onclick="SendProductSizeDeactivation('${ProductSize.id}')">
                  <i class="bi bi-toggle-on" style="cursor: pointer"></i>
                  Aktív
                </button>`;
  } else {
    return `<button class="btn btn-danger col-6 m-1" onclick="SendProductSizeActivation('${ProductSize.id}')">
                  <i class="bi bi-toggle-off" style="cursor: pointer"></i>
                  Inaktív
                </button>`;
  }
}
async function DisplayProductSizePanel() {
  panelLabel.textContent = "Termékméret panel";

  contentContainer.innerHTML = ProductSizePanel;

  const allProductSizesBtn = document.getElementById("all-ProductSizes-button");

  const allActiveProductSizesBtn = document.getElementById(
    "all-active-ProductSizes-button",
  );

  const allInactiveProductSizesBtn = document.getElementById(
    "all-inactive-ProductSizes-button",
  );

  const createProductSizeBtn = document.getElementById(
    "open-ProductSize-creation-modal-button",
  );

  const createProductSizeModalElement = document.getElementById(
    "ProductSize-create-modal",
  );

  const createProductSizeSaveBtn = document.getElementById(
    "ProductSize-create-save-button",
  );

  /* =========================================
     ACTIVE FILTER
  ========================================= */

  function SetActiveProductSizeFilter(activeButton) {
    const buttons = [
      allProductSizesBtn,
      allActiveProductSizesBtn,
      allInactiveProductSizesBtn,
    ];

    buttons.forEach((button) => {
      button.classList.remove("active");
    });

    activeButton.classList.add("active");
  }

  /* =========================================
     DEFAULT FILTER
  ========================================= */

  currentProductSizeFilter = null;

  SetActiveProductSizeFilter(allProductSizesBtn);

  /* =========================================
     LOAD ALL PRODUCT SIZES
  ========================================= */

  const productSizes = await LoadProductSizes();

  FillProductSizes(productSizes);

  /* =========================================
     ACTIVE PRODUCT SIZES
  ========================================= */

  allActiveProductSizesBtn.addEventListener("click", async () => {
    currentProductSizeFilter = true;

    SetActiveProductSizeFilter(allActiveProductSizesBtn);

    const productSizeList = await LoadProductSizes();

    FillProductSizes(
      productSizeList.filter((productSize) => productSize.isActive === true),
    );
  });

  /* =========================================
     INACTIVE PRODUCT SIZES
  ========================================= */

  allInactiveProductSizesBtn.addEventListener("click", async () => {
    currentProductSizeFilter = false;

    SetActiveProductSizeFilter(allInactiveProductSizesBtn);

    const productSizeList = await LoadProductSizes();

    FillProductSizes(
      productSizeList.filter((productSize) => productSize.isActive === false),
    );
  });

  /* =========================================
     ALL PRODUCT SIZES
  ========================================= */

  allProductSizesBtn.addEventListener("click", async () => {
    currentProductSizeFilter = null;

    SetActiveProductSizeFilter(allProductSizesBtn);

    const productSizeList = await LoadProductSizes();

    FillProductSizes(productSizeList);
  });

  /* =========================================
     CREATE PRODUCT SIZE MODAL
  ========================================= */

  createProductSizeBtn.addEventListener("click", () => {
    const modal = bootstrap.Modal.getOrCreateInstance(
      createProductSizeModalElement,
    );

    modal.show();
  });

  /* =========================================
     CREATE PRODUCT SIZE
  ========================================= */

  createProductSizeSaveBtn.addEventListener("click", async () => {
    const requestBody = {
      SizeName: document.getElementById("create-ProductSize-name-input").value,
    };

    const response = await createProductSize(requestBody);

    if (response === true) {
      DisplayAlert("success", "Sikeres létrehozás");

      const modal = bootstrap.Modal.getOrCreateInstance(
        createProductSizeModalElement,
      );

      modal.hide();

      const newProductSizesListAfterCreate = await LoadProductSizes();

      FillProductSizes(newProductSizesListAfterCreate);
    } else {
      DisplayAlert("danger", response);
    }
  });
}
//#endregion
/*
















*/
//#region Product variables and methods

let loadedProducts = [];

document
  .getElementById("open-product-panel-button")
  .addEventListener("click", async () => {
    await DisplayProductContainer();
  });

const ProductPageContainer = `
      <div class="product-filter-bar mb-3">

  <!-- Szűrés eltávolítása -->
  <div
    class="product-filter d-none"
    id="dismiss-search-filter-button"
  >
    <div class="product-filter-icon">
      <i class="bi bi-x-circle"></i>
    </div>

    <div class="product-filter-content">
      <span class="product-filter-label">Szűrés eltávolítása</span>
    </div>
  </div>

  <!-- Keresés -->
  <div
    class="product-filter"
    id="open-product-search-modal-button"
    data-bs-toggle="modal"
    data-bs-target="#product-search-modal"
  >
    <div class="product-filter-icon">
      <i class="bi bi-search"></i>
    </div>

    <div class="product-filter-content">
      <span class="product-filter-label">Termék keresése</span>
    </div>
  </div>

  <!-- Termék létrehozása -->
  <div class="product-create-wrapper">
    <button
      class="product-create-button"
      id="open-product-creation-modal-button"
      data-bs-toggle="modal"
      data-bs-target="#product-create-modal"
    >
      <i class="bi bi-plus-lg"></i>
      Termék létrehozása
    </button>
  </div>

</div>

        <div
          class="row p-1 d-flex justify-content-evenly"
          id="products-container"
        >
          <table class="table text-center">
            <thead>
              <tr>
                <th scope="col" class="ps-4">Kép</th>
                <th scope="col">Terméknév</th>
                <th scope="col">SKU</th>
                <th scope="col">Márkanév</th>
                <th scope="col" class="text-end pe-4">További lehetőségek</th>
              </tr>
            </thead>
            <tbody class="table-group-divider align-middle" id="products-table-body">
            </tbody>
          </table>
        </div>
        `;

function ReturnProcuctActivationOrDeactivationButton(isActive, sku) {
  console.log(isActive);
  if (isActive) {
    return `<button class="btn btn-success pw-2" onclick="SendProductDeactivation('${sku}')">
                  <i class="bi bi-toggle-on" style="cursor: pointer"></i>
                  Aktív
                </button>`;
  } else {
    return `<button class="btn btn-danger pw-2" onclick="SendProductActivation('${sku}')">
                  <i class="bi bi-toggle-off" style="cursor: pointer"></i>
                  Inaktív
                </button>`;
  }
}

function FillProducts(products) {
  const productsTableBody = document.getElementById("products-table-body");
  productsTableBody.innerHTML = "";

  console.log(products);

  products.forEach((product) => {
    console.log(product);
    const row = document.createElement("tr");

    row.innerHTML = `
  <td class="align-middle ps-4" style="width: 80px;">
    <div class="d-flex align-items-center justify-content-center rounded-3 bg-body-tertiary border"
         style="width: 56px; height: 56px;">
      <img
        src="${product.productImageURL}"
        alt="${product.productName}"
        style="width: 48px; height: 48px; object-fit: contain;"
        class="rounded-2"
      />
    </div>
  </td>

  <td class="align-middle">
    <span class="fw-semibold">
      ${product.productName}
    </span>
  </td>

  <td class="align-middle">
    <span class="font-monospace text-body-secondary">
      ${product.sku}
    </span>
  </td>

  <td class="align-middle">
    <span class="badge rounded-pill bg-body-tertiary text-body-secondary border px-3 py-2">
      ${product.brandName}
    </span>
  </td>

  <td class="align-middle pe-4">
    <div class="d-flex justify-content-end gap-2">

      <button
        class="btn btn-sm btn-light border rounded-3 px-3 py-2"
        onclick="ViewDetailedProductPanel('${product.sku}')"
      >
        <i class="bi bi-info-circle me-1"></i>
        Részletek
      </button>

      <button
        class="btn btn-sm btn-primary rounded-3 px-3 py-2"
        onclick="OpenProductUpdatePanel('${product.sku}')"
      >
        <i class="bi bi-pencil-square me-1"></i>
        Módosítás
      </button>

      ${ReturnProcuctActivationOrDeactivationButton(
        product.isActive,
        product.sku,
      )}

    </div>
  </td>
`;

    productsTableBody.appendChild(row);
  });
}

window.SendProductActivation = async function SendProductActivation(
  requestBody,
) {
  LoadingSpinner(true);
  const response = await activateProduct(requestBody);
  console.log(response);
  if (response == true) {
    var productList = await LoadProducts();
    FillProducts(productList);
    DisplayAlert("success", "Sikeres aktiválás!");
  } else {
    DisplayAlert("danger", response);
  }
  LoadingSpinner(false);
};

window.SendProductDeactivation = async function SendProductDeactivation(
  requestBody,
) {
  LoadingSpinner(true);
  const response = await deactivateProduct(requestBody);

  if (response == true) {
    var productList = await LoadProducts();
    FillProducts(productList);
    DisplayAlert("success", "Sikeres deaktiválás!");
  } else {
    DisplayAlert("danger", response);
  }
  LoadingSpinner(false);
};

async function LoadProducts() {
  const products = await getProductsForListing();
  loadedProducts = products;
  return products;
}

async function DisplayProductContainer() {
  contentContainer.innerHTML = ProductPageContainer;
  const productsTableBody = document.getElementById("products-table-body");
  const productSearchModalBtn = document.getElementById(
    "open-product-search-modal-button",
  );

  var productList = await LoadProducts();
  FillProducts(productList);

  dismissSelectionButton = document.getElementById(
    "dismiss-search-filter-button",
  );

  dismissSelectionButton.addEventListener("click", async () => {
    dismissSelectionButton.classList.add("d-none");
    var products = await LoadProducts();
    FillProducts(products);
  });

  document
    .getElementById("open-product-creation-modal-button")
    .addEventListener("click", async () => {
      const productSizes = await getAllProductSizes();
      const productTypes = await getAllProductTypes();
      const brands = await getAllBrands();

      const productSizeSelect = document.getElementById(
        "product-create-productsize-select",
      );
      const productTypeSelect = document.getElementById(
        "product-create-producttype-select",
      );
      const brandSelect = document.getElementById(
        "product-create-brand-select",
      );

      productSizeSelect.innerHTML = "";
      productTypeSelect.innerHTML = "";
      brandSelect.innerHTML = "";

      productSizes.forEach((productSize) => {
        if (productSize.isActive) {
          const option = document.createElement("option");

          option.value = productSize.id;
          option.textContent = productSize.sizeName;

          productSizeSelect.appendChild(option);
        }
      });

      productTypes.forEach((productType) => {
        if (productType.isActive) {
          const option = document.createElement("option");

          option.value = productType.id;
          option.textContent = productType.typeName;

          productTypeSelect.appendChild(option);
        }
      });

      brands.forEach((brand) => {
        if (brand.isActive) {
          const option = document.createElement("option");

          option.value = brand.id;
          option.textContent = brand.brandName;

          brandSelect.appendChild(option);
        }
      });

      const hasDepositCheckbox = document.getElementById(
        "product-create-hasdeposit-input",
      );

      const depositAmountInput = document.getElementById(
        "product-create-depositamount-input",
      );

      // Modal alaphelyzetbe állítása
      hasDepositCheckbox.checked = false;
      depositAmountInput.value = 50;
      depositAmountInput.disabled = true;

      hasDepositCheckbox.addEventListener("change", () => {
        depositAmountInput.disabled = !hasDepositCheckbox.checked;
      });
    });

  panelLabel.textContent = "Termékek Panel";
}

document
  .getElementById("product-create-save-button")
  .addEventListener("click", async () => {
    const productName = document.getElementById(
      "product-create-name-input",
    ).value;

    const barcode = document.getElementById(
      "product-create-barcode-input",
    ).value;

    const sku = document.getElementById("product-create-sku-input").value;

    const productTypeId = document.getElementById(
      "product-create-producttype-select",
    ).value;

    const productSizeId = document.getElementById(
      "product-create-productsize-select",
    ).value;

    const brandId = document.getElementById(
      "product-create-brand-select",
    ).value;

    const imageInput = document.getElementById("product-create-image-input");
    const productImage = imageInput.files[0];

    const hasDeposit = document.getElementById(
      "product-create-hasdeposit-input",
    ).checked;

    const depositAmount = hasDeposit
      ? Number(
          document.getElementById("product-create-depositamount-input").value,
        )
      : 0;

    const formData = new FormData();

    formData.append("ProductName", productName);
    if (barcode) formData.append("Barcode", barcode);
    formData.append("SKU", sku);
    formData.append("ProductTypeId", productTypeId);
    formData.append("ProductSizeId", productSizeId);
    formData.append("BrandId", brandId);
    formData.append("HasDeposit", hasDeposit);
    formData.append("DepositAmount", depositAmount);

    if (productImage) formData.append("Image", productImage);

    // Sending the request and reacting to the answer
    LoadingSpinner(true);
    const response = await createProduct(formData);
    LoadingSpinner(false);

    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("product-create-modal"),
    );

    if (response == true) {
      DisplayAlert("success", "Sikeres létrehozás");
      modal.hide();
      var newProductsListAfterCreate = await LoadProducts();
      FillProducts(newProductsListAfterCreate);
    } else {
      DisplayAlert("danger", response);
    }
  });

window.ViewDetailedProductPanel = async function ViewDetailedProductPanel(
  productSKU,
) {
  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("product-view-detailed-modal"),
  );

  const product = await getProductBySku(productSKU);

  // Populate the modal with product details
  document.getElementById("product-view-name").textContent =
    product.productName;
  document.getElementById("product-view-barcode").textContent = product.barcode;
  document.getElementById("product-view-sku").textContent = product.sku;
  document.getElementById("product-view-producttype").textContent =
    product.productType;
  document.getElementById("product-view-productsize").textContent =
    product.productSize;
  document.getElementById("product-view-brand").textContent = product.brand;
  document.getElementById("product-view-image").src = product.imageURL;
  document.getElementById("product-view-hasdeposit").textContent =
    product.hasDeposit ? "Igen" : "Nem";

  document.getElementById("product-view-depositamount").textContent =
    product.hasDeposit ? `${product.depositAmount} Ft` : "-";
  modal.show();
};

let currentlyUpdatingProductSKU = null;

window.OpenProductUpdatePanel = async function OpenProductUpdatePanel(
  productSKU,
) {
  const product = await getProductBySku(productSKU);

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("product-update-modal"),
  );

  // Populate the modal with product informations

  const productNameInput = document.getElementById("product-update-name-input");
  const productBarcodeInput = document.getElementById(
    "product-update-barcode-input",
  );
  const productTypeSelect = document.getElementById(
    "product-update-producttype-select",
  );
  const productSizeSelect = document.getElementById(
    "product-update-productsize-select",
  );
  const productBrandSelect = document.getElementById(
    "product-update-brand-select",
  );

  const updateHasDepositCheckbox = document.getElementById(
    "product-update-hasdeposit-input",
  );

  const updateDepositAmountInput = document.getElementById(
    "product-update-depositamount-input",
  );

  const hasDepositCheckbox = document.getElementById(
    "product-update-hasdeposit-input",
  );

  const depositAmountInput = document.getElementById(
    "product-update-depositamount-input",
  );

  const productSKUDisplay = document.getElementById(
    "product-update-sku-display",
  );

  console.log(product);

  hasDepositCheckbox.checked = product.hasDeposit;
  depositAmountInput.disabled = !product.hasDeposit;
  depositAmountInput.value = product.hasDeposit ? product.depositAmount : 50;

  updateHasDepositCheckbox.addEventListener("change", () => {
    updateDepositAmountInput.disabled = !updateHasDepositCheckbox.checked;

    if (updateHasDepositCheckbox.checked) {
      if (
        updateDepositAmountInput.value === "" ||
        Number(updateDepositAmountInput.value) === 0
      ) {
        updateDepositAmountInput.value = 50;
      }
    } else {
      updateDepositAmountInput.value = 50;
    }
  });

  const productImage = document.getElementById("product-update-image");

  productNameInput.textContent = product.productName;
  productBarcodeInput.textContent = product.barcode;
  productTypeSelect.textContent = product.productType;
  productSizeSelect.textContent = product.productSize;
  productBrandSelect.textContent = product.brand;
  productImage.src = product.imageURL;
  productSKUDisplay.value = product.sku;
  currentlyUpdatingProductSKU = product.sku;

  const productSizes = await getAllProductSizes();
  const productTypes = await getAllProductTypes();
  const brands = await getAllBrands();

  productSizeSelect.innerHTML = "";
  productTypeSelect.innerHTML = "";
  productBrandSelect.innerHTML = "";

  let productSizeId = 0;
  let productTypeId = 0;
  let productBrandId = 0;

  productSizes.forEach((productSize) => {
    if (productSize.isActive) {
      const option = document.createElement("option");

      option.value = productSize.id;
      option.textContent = productSize.sizeName;

      productSizeSelect.appendChild(option);

      if (productSize.sizeName == product.productSize) {
        productSizeId = productSize.id;
      }
    }
  });

  productTypes.forEach((productType) => {
    if (productType.isActive) {
      const option = document.createElement("option");

      option.value = productType.id;
      option.textContent = productType.typeName;

      productTypeSelect.appendChild(option);

      if (productType.typeName == product.productType) {
        productTypeId = productType.id;
      }
    }
  });

  brands.forEach((brand) => {
    if (brand.isActive) {
      const option = document.createElement("option");

      option.value = brand.id;
      option.textContent = brand.brandName;

      productBrandSelect.appendChild(option);

      if (brand.brandName == product.brand) {
        productBrandId = brand.id;
      }
    }
  });

  productNameInput.value = product.productName;
  if (product.barcode == " - ") productBarcodeInput.value = null;
  else productBarcodeInput.value = product.barcode;

  productTypeSelect.value = productTypeId;
  productSizeSelect.value = productSizeId;
  productBrandSelect.value = productBrandId;
  productImage.src = product.imageURL;

  modal.show();
};

document
  .getElementById("product-update-save-button")
  .addEventListener("click", async () => {
    const productName = document.getElementById(
      "product-update-name-input",
    ).value;
    const productBarcode = document.getElementById(
      "product-update-barcode-input",
    ).value;

    const productTypeId = document.getElementById(
      "product-update-producttype-select",
    ).value;
    const productSizeId = document.getElementById(
      "product-update-productsize-select",
    ).value;
    const productBrandId = document.getElementById(
      "product-update-brand-select",
    ).value;

    const hasDeposit = document.getElementById(
      "product-update-hasdeposit-input",
    ).checked;

    const depositAmount = hasDeposit
      ? Number(
          document.getElementById("product-update-depositamount-input").value,
        )
      : 0;

    const imageInput = document.getElementById("product-update-image-input");
    const productImage = imageInput.files[0];

    const formData = new FormData();

    formData.append("ProductName", productName);
    if (productBarcode) formData.append("Barcode", productBarcode);
    formData.append("SKU", currentlyUpdatingProductSKU);
    formData.append("ProductTypeId", productTypeId);
    formData.append("ProductSizeId", productSizeId);
    formData.append("BrandId", productBrandId);
    console.log(hasDeposit, depositAmount);
    formData.append("HasDeposit", hasDeposit);
    formData.append("DepositAmount", depositAmount);
    if (productImage) formData.append("Image", productImage);

    LoadingSpinner(true);
    const response = await updateProduct(
      formData,
      currentlyUpdatingProductSKU,
    );
    LoadingSpinner(false);

    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("product-update-modal"),
    );

    if (response == true) {
      DisplayAlert("success", "Sikeres frissítés");
      modal.hide();
      currentlyUpdatingProductSKU = null;
      var newProductsListAfterUpdate = await LoadProducts();
      FillProducts(newProductsListAfterUpdate);
    } else {
      DisplayAlert("danger", response);
    }
  });

const selectionOptionSelector = document.getElementById(
  "product-search-filter-select",
);

document
  .getElementById("product-search-filter-select")
  .addEventListener("change", () => {
    const selectionOption = selectionOptionSelector.value;

    const selectionInputLabel = document.getElementById(
      "product-search-filter-input-label",
    );

    document.getElementById("product-search-filter-input").value = " ";

    switch (selectionOption) {
      case "nev":
        selectionInputLabel.textContent = "Terméknév:";
        break;

      case "vonalkod":
        selectionInputLabel.textContent = "Vonalkód:";
        break;

      case "sku":
        selectionInputLabel.textContent = "Belső azonosító:";
        break;

      case "termektipus":
        selectionInputLabel.textContent = "Terméktípus:";
        break;

      case "termekmeret":
        selectionInputLabel.textContent = "Termékméret:";
        break;

      case "marka":
        selectionInputLabel.textContent = "Márka:";
        break;
    }
  });

var dismissSelectionButton;

document
  .getElementById("product-search-button")
  .addEventListener("click", async () => {
    const selectionOption = selectionOptionSelector.value;

    const selectionInputValue = document
      .getElementById("product-search-filter-input")
      .value.trim()
      .toLowerCase();

    console.log(selectionOption, selectionInputValue);

    switch (selectionOption) {
      case "nev":
        let products = await LoadProducts();

        let filteredProducts = products.filter((p) =>
          p.productName.toLowerCase().includes(selectionInputValue),
        );

        console.log(products, filteredProducts);
        FillProducts(filteredProducts);
        break;

      case "vonalkod":
        let productsByBarcode = await LoadProducts();

        let filteredProductsByBarcode = productsByBarcode.filter(
          (p) =>
            p.Barcode != "" &&
            p.Barcode != " " &&
            p.Barcode != null &&
            p.Barcode.toLowerCase().includes(selectionInputValue),
        );

        console.log(productsByBarcode, filteredProductsByBarcode);
        FillProducts(filteredProductsByBarcode);
        break;

      case "sku":
        let productsBySKU = await LoadProducts();

        let filteredProductsBySKU = productsBySKU.filter((p) =>
          p.sku.toLowerCase().includes(selectionInputValue),
        );

        console.log(productsBySKU, filteredProductsBySKU);
        FillProducts(filteredProductsBySKU);
        break;

      case "termektipus":
        let productsByType = await LoadProducts();

        let filteredProductsByType = productsByType.filter((p) =>
          p.productType.toLowerCase().includes(selectionInputValue),
        );

        console.log(productsByType, filteredProductsByType);
        FillProducts(filteredProductsByType);
        break;

      case "termekmeret":
        let productsBySize = await LoadProducts();

        let filteredProductsBySize = productsBySize.filter((p) =>
          p.productSize.toLowerCase().includes(selectionInputValue),
        );

        console.log(productsBySize, filteredProductsBySize);
        FillProducts(filteredProductsBySize);
        break;

      case "marka":
        let productsByBrand = await LoadProducts();

        let filteredProductsByBrand = productsByBrand.filter((p) =>
          p.brand.toLowerCase().includes(selectionInputValue),
        );

        console.log(productsByBrand, filteredProductsByBrand);
        FillProducts(filteredProductsByBrand);
        break;
    }

    dismissSelectionButton.classList.remove("d-none");
  });

//#endregion

/*
















*/
//#region AddStock Methods

const createStockButton = document.getElementById(
  "create-stock-sidebar-button",
);

const createStockBarcodeOrProductPage = `
  <div
          class="row m-auto h-100 justify-content-center align-items-center g-4"
          style="min-height: 80vh"
        >
          <div
            class="col-4 btn btn-outline-secondary addstock-btn rounded m-2"
            id="create-stock-by-barcode" onclick="DisplayAddStockByBarcodePage()"
          >
            <div
              class="d-flex flex-column justify-content-center align-items-center addstock-btn-body"
            >
              <i class="bi bi-upc-scan display-1 mb-3"></i>
              <h5 class="text-center mb-0 fs-3">Vonalkód alapján</h5>
            </div>
          </div>

          <div
            class="col-4 btn btn-outline-secondary addstock-btn rounded m-2"
            id="create-stock-by-selecting-product"
            onclick="DisplayAddStockProducts()"
          >
            <div
              class="d-flex flex-column justify-content-center align-items-center addstock-btn-body"
            >
              <i class="bi bi-archive display-1 mb-3"></i>
              <h5 class="text-center mb-0 fs-3">Termék kiválasztása</h5>
            </div>
          </div>
        </div>
`;

const createStockByBarcodePage = `<div
          class="position-absolute top-50 start-50 translate-middle text-center w-100"
        >
          <div class="container">
            <label
              for="addstock-barcode-input"
              class="form-label fs-1 fw-bold mb-4"
            >
              Vonalkód
            </label>

            <div class="d-flex justify-content-center">
              <input
                type="text"
                id="addstock-barcode-input"
                class="form-control text-center fs-2"
                maxlength="13"
                style="width: 17ch; letter-spacing: 2px"
              />
            </div>

            <div class="d-flex justify-content-center gap-4 mt-5">
              <button
                class="btn btn-outline-danger btn-lg px-5 py-3 fs-4"
                onclick="DisplayAddStockPage()"                
              >
                Vissza
              </button>

              <button
                class="btn btn-outline-primary btn-lg px-5 py-3 fs-4"
                id="create-stock-button" onclick="CheckWhetherThereIsProductWithThisBarcode()"
              >
                Tovább
              </button>
            </div>
          </div>
        </div>`;

const createStockByProductPage = `<h2 class="text-center fw-bold mb-4">Termék kiválasztása</h2>

        <div class="row">
          <!-- Termékek -->
          <div class="col-lg-9">
            <div
              class="border rounded p-3 bg-light"
              style="height: 70vh; overflow-y: auto"
            >
              <div class="row g-3" id="addstock-products-container">
                <!-- Dinamikusan generált kártyák -->
              </div>
            </div>
          </div>
          <!-- Kiválasztott termék -->
          <div class="col-lg-3">
            <div class="card shadow-sm h-100">
              <div class="card-header text-center fw-bold">
                Kiválasztott termék
              </div>

              <div
                class="card-body d-flex flex-column justify-content-center align-items-center"
              >
                <div
                  class="d-flex justify-content-center align-items-center"
                  style="height: 220px"
                >
                  <img
                    id="selected-product-image"
                    src=""
                    class="img-fluid"
                    style="max-height: 180px; object-fit: contain"
                  />
                </div>

                <h5 id="selected-product-name" class="mt-3 text-center">
                  Nincs kiválasztva
                </h5>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-4 mt-4">
          <button class="btn btn-outline-danger btn-lg px-5" id="back-button" onclick="DisplayAddStockPage()">
            Vissza
          </button>

          <button class="btn btn-outline-primary btn-lg px-5" id="next-button" onclick="CheckWhetherThereIsChosenProduct()">
            Tovább
          </button>
        </div>`;

const createStockFinalPage = `
  <h2 class="text-center fw-bold my-1">Áru létrehozása</h2>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card shadow-sm h-90">
              <div class="card-header fw-bold">Áru adatai</div>

              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Mennyiség</label>

                    <input
                      id="addstock-quantity"
                      type="number"
                      min="1"
                      class="form-control"
                      required
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Beszerzési ár</label>

                    <div class="input-group">
                      <input
                        id="addstock-import-price"
                        type="number"
                        min="0"
                        class="form-control"
                        required
                      />
                      <span class="input-group-text">Ft</span>
                    </div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Jelenlegi ár</label>

                    <div class="input-group">

                        <input
                            id="addstock-current-price"
                            type="number"
                            class="form-control"
                        />

                        <span class="input-group-text">Ft</span>

                        <button
                            class="btn btn-primary margin-btn"
                            type="button"
                            id="price-margin-30-btn"
                            onclick="SetPriceMargin(30)"
                        >
                            30%
                        </button>

                        <button
                            class="btn btn-outline-secondary margin-btn"
                            type="button"
                            id="price-margin-20-btn"
                            onclick="SetPriceMargin(20)"
                        >
                            20%
                        </button>

                        <button
                            class="btn btn-outline-secondary margin-btn"
                            type="button"
                            id="price-margin-10-btn"
                            onclick="SetPriceMargin(10)"
                        >
                            10%
                        </button>

                        <input
                            id="addstock-margin-input"
                            type="number"
                            class="form-control"
                            style="max-width:110px"
                            placeholder="Árrés"
                            onchange="SetPriceMargin(this.value)"
                        />

                        <span class="input-group-text">%</span>

                    </div>
                </div>
                <div class="col-12">
                      <label class="form-label">ÁFA</label>

                      <div class="btn-group w-100" role="group">

                          <button
                              type="button"
                              class="btn btn-primary vat-btn"
                              data-vat="27"
                              id="vat-27-btn"
                              onclick="SetVat(27)"
                          >
                              27%
                          </button>

                          <button
                              type="button"
                              class="btn btn-outline-secondary vat-btn"
                              data-vat="18"
                              id="vat-18-btn"
                              onclick="SetVat(18)"
                          >
                              18%
                          </button>

                          <button
                              type="button"
                              class="btn btn-outline-secondary vat-btn"
                              data-vat="5"
                              id="vat-5-btn"
                              onclick="SetVat(5)"
                          >
                              5%
                          </button>

                          <button
                              type="button"
                              class="btn btn-outline-secondary vat-btn"
                              data-vat="0"
                              id="vat-0-btn"
                              onclick="SetVat(0)"
                          >
                              0%
                          </button>

                      </div>

                      <input
                          id="addstock-vat"
                          type="hidden"
                          value="27"
                      />
                  </div>
                  <div class="col-12">
                    <label class="form-label"> Számla azonosító </label>

                    <input
                      id="addstock-invoice-id"
                      class="form-control"
                      type="text"
                      required
                    />
                  </div>

                  <div class="col-12">
                    <label class="form-label"> Szállítólevél azonosító </label>

                    <input
                      id="addstock-transit-id"
                      class="form-control"
                      type="text"
                      required
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label"> Lejárati dátum </label>

                    <input
                      id="addstock-expiration-date"
                      class="form-control"
                      type="date"
                      required
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label"> Beérkezés dátuma </label>

                    <input
                      id="addstock-received-at"
                      class="form-control"
                      type="date"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card shadow-sm h-100">
              <div class="card-header fw-bold text-center">
                Kiválasztott termék
              </div>

              <div class="card-body">
                <div class="text-center mb-4">
                  <img
                    id="addstock-selected-product-image"
                    src=""
                    class="img-fluid"
                    style="max-height: 220px; object-fit: contain"
                  />
                </div>

                <h4 id="addstock-selected-product-name" class="text-center mb-4">
                  
                </h4>

                <table class="table table-sm align-middle mb-0">
                  <tbody>
                    <tr>
                      <th style="width: 40%">Vonalkód</th>
                      <td id="addstock-selected-product-barcode"></td>
                    </tr>

                    <tr>
                      <th>Belső azonosító</th>
                      <td id="addstock-selected-product-sku"></td>
                    </tr>

                    <tr>
                      <th>Márka</th>
                      <td id="addstock-selected-product-brand"></td>
                    </tr>

                    <tr>
                      <th>Típus</th>
                      <td id="addstock-selected-product-type"></td>
                    </tr>

                    <tr>
                      <th>Méret</th>
                      <td id="addstock-selected-product-size"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-4 m-4">
          <button class="btn btn-outline-danger btn-lg px-5" id="back-button" onclick="DisplayAddStockPage()">
            Vissza
          </button>

          <button
            class="btn btn-outline-success btn-lg px-5"
            id="save-stock-button"
            onclick="AddStockRequest()"
          >
            Mentés
          </button>
        </div>
`;

window.DisplayAddStockPage = async function DisplayAddStockPage() {
  panelLabel.textContent = "Áru hozzáadása";
  contentContainer.innerHTML = createStockBarcodeOrProductPage;
};

var isAddStockByBarcodeOpen = false;

window.DisplayAddStockByBarcodePage =
  async function DisplayAddStockByBarcodePage() {
    panelLabel.textContent = "Áru hozzáadása - Vonalkód alapján";
    contentContainer.innerHTML = createStockByBarcodePage;
    isAddStockByBarcodeOpen = true;

    var barcode = "";
    document.addEventListener("keydown", async (e) => {
      if (isAddStockByBarcodeOpen === false) return;
      if (e.key === "Enter") {
        barcode = barcode.replace("ö", "0").replace("Ö", "0");

        if (isAddStockByBarcodeOpen === true) {
          CheckWhetherThereIsProductWithThisBarcode(barcode);
          isAddStockByBarcodeOpen = false;
        }
        barcode = "";

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
  };

createStockButton.addEventListener("click", async () => {
  await DisplayAddStockPage();
});

let selectedProduct = null;

window.DisplayAddStockProducts = async function DisplayAddStockProducts() {
  contentContainer.innerHTML = createStockByProductPage;

  const container = document.getElementById("addstock-products-container");
  container.innerHTML = "";

  const products = await LoadProducts();
  console.log(products);
  products.forEach((product) => {
    const productCard = `
            <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                <div class="card product-card">

                    <div class="d-flex justify-content-center align-items-center" style="height:160px;">
                        <img
                            src="${product.productImageURL}"
                            class="product-image img-fluid"
                            alt="${product.productName}"
                        >
                    </div>

                    <div class="card-body d-flex justify-content-center align-items-center">
                        <div class="text-center fw-semibold">
                            ${product.productName}
                        </div>
                    </div>

                </div>
            </div>
        `;

    container.innerHTML += productCard;
  });

  document.querySelectorAll(".product-card").forEach((card, index) => {
    card.addEventListener("click", () => {
      selectProduct(products[index], card);
    });
  });
};

function selectProduct(product, card) {
  document
    .querySelectorAll(".product-card")
    .forEach((c) => c.classList.remove("selected"));

  card.classList.add("selected");

  selectedProduct = product;
  chosenProductForAddStock = product;
  document.getElementById("selected-product-image").src =
    product.productImageURL;
  document.getElementById("selected-product-name").textContent =
    product.productName;
}

var chosenProductForAddStock;

window.CheckWhetherThereIsChosenProduct =
  async function CheckWhetherThereIsChosenProduct() {
    if (chosenProductForAddStock != null) {
      await DisplayAddStockFinalPage();
    } else {
      DisplayAlert("danger", "Nincs kiválasztott termék!");
    }
  };

window.CheckWhetherThereIsProductWithThisBarcode =
  async function CheckWhetherThereIsProductByBarcode(barcode = null) {
    const barcodeInput = document.getElementById("addstock-barcode-input");

    const barcodeValue = barcode ?? barcodeInput.value.trim();

    if (!barcodeValue) {
      DisplayAlert("danger", "Kérlek, adj meg egy vonalkódot!");
      return;
    }

    const barcodeResponse = await getProductByBarcode(barcodeValue);

    if (barcodeResponse) {
      chosenProductForAddStock = barcodeResponse;
      await DisplayAddStockFinalPage();
      return;
    }

    DisplayAlert("danger", "Nem található termék a megadott vonalkóddal!");
  };

async function DisplayAddStockFinalPage() {
  contentContainer.innerHTML = createStockFinalPage;

  let selectedProduct = await getProductBySku(chosenProductForAddStock.sku);

  const selectedProductImage = document.getElementById(
    "addstock-selected-product-image",
  );
  const selectedProductName = document.getElementById(
    "addstock-selected-product-name",
  );
  const selectedProductBarcode = document.getElementById(
    "addstock-selected-product-barcode",
  );
  const selectedProductSKU = document.getElementById(
    "addstock-selected-product-sku",
  );
  const selectedProductBrand = document.getElementById(
    "addstock-selected-product-brand",
  );
  const selectedProductType = document.getElementById(
    "addstock-selected-product-type",
  );
  const selectedProductSize = document.getElementById(
    "addstock-selected-product-size",
  );

  selectedProductImage.src = selectedProduct.imageURL;
  selectedProductName.textContent = selectedProduct.productName;
  selectedProductBarcode.textContent = selectedProduct.barcode;
  selectedProductSKU.textContent = selectedProduct.sku;
  selectedProductBrand.textContent = selectedProduct.brand;
  selectedProductType.textContent = selectedProduct.productType;
  selectedProductSize.textContent = selectedProduct.productSize;

  var importPrice = parseFloat(
    document.getElementById("addstock-import-price").value,
  );

  var VAT = 27;
  var Margin = 30;
  const marginInput = document.getElementById("addstock-margin-input");

  const buttons = {
    10: document.getElementById("price-margin-10-btn"),
    20: document.getElementById("price-margin-20-btn"),
    30: document.getElementById("price-margin-30-btn"),
  };

  marginInput.addEventListener("input", (e) => {
    SetPriceMargin(Number(e.target.value));
  });

  window.SetPriceMargin = function SetPriceMargin(newMargin) {
    // Csak akkor írjuk át az inputot, ha máshonnan hívták meg
    if (document.activeElement !== marginInput) {
      marginInput.value = newMargin;
    }

    // Minden gomb alapállapotba
    Object.values(buttons).forEach((btn) => {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline-secondary");
    });

    // Ha 10/20/30, akkor az adott legyen aktív
    if (buttons[newMargin]) {
      buttons[newMargin].classList.remove("btn-outline-secondary");
      buttons[newMargin].classList.add("btn-primary");
    }

    Margin = newMargin;
    CalculatePriceAfterVat(importPrice, Margin, VAT);
  };

  const VATButtons = {
    27: document.getElementById("vat-27-btn"),
    18: document.getElementById("vat-18-btn"),
    5: document.getElementById("vat-5-btn"),
    0: document.getElementById("vat-0-btn"),
  };

  window.SetVat = function SetVat(newVAT) {
    VAT = newVAT;
    Object.values(VATButtons).forEach((btn) => {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline-secondary");
    });

    // Ha 10/20/30, akkor az adott legyen aktív
    if (VATButtons[newVAT]) {
      VATButtons[newVAT].classList.remove("btn-outline-secondary");
      VATButtons[newVAT].classList.add("btn-primary");
    }

    CalculatePriceAfterVat(importPrice, Margin, VAT);
  };

  document
    .getElementById("addstock-import-price")
    .addEventListener("input", (e) => {
      importPrice = parseFloat(
        document.getElementById("addstock-import-price").value,
      );
      CalculatePriceAfterVat(importPrice, Margin, VAT);
    });

  window.CalculatePriceAfterVat = function CalculatePriceAfterVat(
    importPrice,
    Margin,
    VAT,
  ) {
    document.getElementById("addstock-current-price").value = Math.round(
      importPrice * (1 + Margin / 100) * (1 + VAT / 100),
    );
  };

  document
    .getElementById("addstock-current-price")
    .addEventListener("input", (e) => {
      const currentPrice = Number(e.target.value);

      Margin = CalculateMargin(importPrice, currentPrice, VAT);

      SetPriceMargin(Number(Margin.toFixed(2)));
    });

  function CalculateMargin(importPrice, currentPrice, VAT) {
    if (importPrice <= 0) return 0;

    return (currentPrice / (importPrice * (1 + VAT / 100)) - 1) * 100;
  }
}
window.AddStockRequest = async function AddStockRequest() {
  if (chosenProductForAddStock == null) {
    DisplayAlert("danger", "Termék nem található!");
    return;
  }

  // Inputok
  const quantityInput = document.getElementById("addstock-quantity");
  const importPriceInput = document.getElementById("addstock-import-price");
  const currentPriceInput = document.getElementById("addstock-current-price");
  const vatInput = document.getElementById("addstock-vat");
  const invoiceInput = document.getElementById("addstock-invoice-id");
  const transitInput = document.getElementById("addstock-transit-id");
  const expirationInput = document.getElementById("addstock-expiration-date");
  const receivedInput = document.getElementById("addstock-received-at");

  // Validáció
  if (!quantityInput.reportValidity()) return;
  if (!importPriceInput.reportValidity()) return;
  if (!currentPriceInput.reportValidity()) return;
  if (!invoiceInput.reportValidity()) return;
  if (!transitInput.reportValidity()) return;
  if (!expirationInput.reportValidity()) return;
  if (!receivedInput.reportValidity()) return;

  // Request body
  const requestBody = {
    productSKU: chosenProductForAddStock.sku,
    quantity: parseFloat(quantityInput.value),
    importPrice: parseInt(importPriceInput.value),
    currentPrice: parseInt(currentPriceInput.value),
    afaPercent: parseFloat(vatInput.value),
    invoiceId: invoiceInput.value.trim(),
    transitId: transitInput.value.trim(),
    expirationDate: expirationInput.value,
    recievedAt: receivedInput.value,
  };

  try {
    const response = await addStock(requestBody);

    if (response === true) {
      DisplayAlert("success", "Sikeres áru hozzáadása!");

      // Űrlap alaphelyzetbe
      quantityInput.value = "";
      importPriceInput.value = "";
      currentPriceInput.value = "";
      document.getElementById("addstock-margin-input").value = "";
      invoiceInput.value = "";
      transitInput.value = "";
      expirationInput.value = "";
      receivedInput.value = "";

      // Alap ÁFA
      SetVat(27);

      // Alap árrés
      SetPriceMargin(30);

      DisplayAddStockPage();
    } else {
      DisplayAlert("danger", response);
    }
  } catch (error) {
    console.error(error);
    DisplayAlert("danger", "Váratlan hiba történt az áru létrehozása során.");
  }
};

//#endregion
DisplayAddStockPage();
