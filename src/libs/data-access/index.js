/**
 * Public surface of the data-access layer.
 *
 * Feature code should import from this barrel rather than reaching into
 * individual repository files, so the internal organisation can change
 * without touching the features.
 */

export * as authRepository from "./repositories/auth.repository.js";
export * as brandRepository from "./repositories/brand.repository.js";
export * as counterRepository from "./repositories/counter.repository.js";
export * as productRepository from "./repositories/product.repository.js";
export * as productSizeRepository from "./repositories/product-size.repository.js";
export * as productTypeRepository from "./repositories/product-type.repository.js";
export * as statisticsRepository from "./repositories/statistics.repository.js";
export * as stockRepository from "./repositories/stock.repository.js";
export * as userRepository from "./repositories/user.repository.js";

export * from "./session.js";