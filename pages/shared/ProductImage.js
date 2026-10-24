export function ResolveProductImageUrl(imageUrl) {
  const value = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (/^https?:\/\//i.test(value)) return value;
  if (/^blob:/i.test(value)) return value;
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return "";

  const configuredApiBase = String(window.config?.API_URL ?? "").trim();
  if (value.startsWith("//")) {
    const protocol = configuredApiBase
      ? new URL(configuredApiBase, window.location.href).protocol
      : window.location.protocol;
    return `${protocol}${value}`;
  }
  if (!configuredApiBase) return value;
  const apiBase = new URL(configuredApiBase, window.location.href)
    .toString()
    .replace(/\/+$/, "");

  const basePath = new URL(apiBase, window.location.href).pathname.replace(/\/+$/, "");
  let relativePath = (value || "product-images/default").replace(/^\/+/, "");
  if (/^api\//i.test(relativePath) && /\/api$/i.test(basePath)) {
    relativePath = relativePath.slice(4);
  }

  return new URL(relativePath, `${apiBase}/`).toString();
}

export function ResolveProductThumbnailUrl(thumbnailUrl, imageUrl) {
  return ResolveProductImageUrl(thumbnailUrl || imageUrl);
}

export function IsValidProductImageFile(file) {
  if (!file || file.size <= 0 || file.size > 10 * 1024 * 1024) return false;
  const extension = file.name?.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension);
}

export function SetProductImageSource(image, imageUrl, { loading = "lazy" } = {}) {
  if (!image) return;
  ClearProductImagePreview(image);
  image.dataset.productImage = "true";
  delete image.dataset.productImageFallbackApplied;
  image.loading = loading;
  image.decoding = "async";
  image.src = ResolveProductImageUrl(imageUrl);
}

export function SetProductImagePreview(image, file, originalUrl = image?.dataset.originalSrc) {
  if (!image) return;
  ClearProductImagePreview(image);

  if (!file) {
    SetProductImageSource(image, originalUrl, { loading: "eager" });
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  image.dataset.previewObjectUrl = objectUrl;
  image.dataset.productImage = "true";
  delete image.dataset.productImageFallbackApplied;
  image.loading = "eager";
  image.decoding = "async";
  image.src = objectUrl;
}

export function ClearProductImagePreview(image) {
  if (!image?.dataset.previewObjectUrl) return;
  URL.revokeObjectURL(image.dataset.previewObjectUrl);
  delete image.dataset.previewObjectUrl;
}

if (
  typeof document !== "undefined" &&
  !document.documentElement.dataset.productImageFallbackListener
) {
  document.documentElement.dataset.productImageFallbackListener = "true";
  document.addEventListener(
    "error",
    (event) => {
      const image = event.target;
      if (!image || image.tagName !== "IMG" || !image.dataset.productImage) return;

      const fallbackUrl = ResolveProductImageUrl();
      if (
        !image.dataset.productImageFallbackApplied &&
        fallbackUrl &&
        image.src !== fallbackUrl
      ) {
        image.dataset.productImageFallbackApplied = "true";
        image.src = fallbackUrl;
        return;
      }

      image.classList.add("d-none");
    },
    true,
  );
}

