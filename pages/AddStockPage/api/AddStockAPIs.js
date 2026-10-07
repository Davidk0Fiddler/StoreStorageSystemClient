import { API_CALL } from "../../shared/ApiCaller.js";

export const AddStockAPIs = {
  /*
    BRANDS
   */
  RequestAllBrands: () => API_CALL("Brands", "GET"),
  SendBrandActivationRequest: (brandId) =>
    API_CALL("Brands/activate", "GET", null, brandId),
  SendBrandDeactivationRequest: (brandId) =>
    API_CALL("Brands/deactivate", "GET", null, brandId),
  SendBrandUpdateRequest: (brandId, updateData) =>
    API_CALL("Brands", "PUT", updateData, brandId),
  SendCreateBrandRequest: (requestBody) =>
    API_CALL("Brands", "POST", requestBody),
  /*
     PRODUCT TYPES
   */
  RequestAllProductTypes: () => API_CALL("ProductType", "GET"),
  SendProductTypeActivationRequest: (productTypeId) =>
    API_CALL("ProductType/activate", "GET", null, productTypeId),
  SendProductTypeDeactivationRequest: (productTypeId) =>
    API_CALL("ProductType/deactivate", "GET", null, productTypeId),
  SendProductTypeUpdateRequest: (productTypeId, updateData) =>
    API_CALL("ProductType", "PUT", updateData, productTypeId),
  SendCreateProductTypeRequest: (requestBody) =>
    API_CALL("ProductType", "POST", requestBody),
  /*
    PRODUCT SIZES
   */
  RequestAllProductSizes: () => API_CALL("ProductSize", "GET"),
  SendProductSizeActivationRequest: (productSizeId) =>
    API_CALL("ProductSize/activate", "GET", null, productSizeId),
  SendProductSizeDeactivationRequest: (productSizeId) =>
    API_CALL("ProductSize/deactivate", "GET", null, productSizeId),
  SendProductSizeUpdateRequest: (productSizeId, updateData) =>
    API_CALL("ProductSize", "PUT", updateData, productSizeId),
  SendCreateProductSizeRequest: (requestBody) =>
    API_CALL("ProductSize", "POST", requestBody),
  /*
    PRODUCTS
  */
  RequestAllProductsForListing: () => API_CALL("Products/listing", "GET"),
  RequestProductBySKU: (sku) => API_CALL("Products/sku", "GET", null, sku),
  SendProductActivationRequest: (productSKU) =>
    API_CALL("Products/activate", "GET", null, productSKU),
  SendProductDeactivationRequest: (productSKU) =>
    API_CALL("Products/deactivate", "GET", null, productSKU),
  SendProductUpdateRequest: (productSKU, updateData) =>
    API_CALL("Products", "PUT", updateData, productSKU, true),
  SendCreateProductRequest: (requestBody) =>
    API_CALL("Products", "POST", requestBody, null, true),
  RequestProductByBarcode: (barcode) => API_CALL(`Products/${barcode}`, "GET"),
  /*
    STOCKS
  */
  SendAddStockRequest: (requestBody) =>
    API_CALL("AddStock", "POST", requestBody),
};
