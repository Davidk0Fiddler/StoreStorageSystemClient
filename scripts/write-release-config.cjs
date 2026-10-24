const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const apiUrl = process.env.API_URL?.trim();
if (!apiUrl) {
  throw new Error(
    "A kiadáshoz állítsd be az API_URL környezeti változót, vagy a GitHub Actions STORE_API_URL változóját.",
  );
}

let parsedUrl;
try {
  parsedUrl = new URL(apiUrl);
} catch {
  throw new Error("Az API_URL nem érvényes teljes URL.");
}

if (parsedUrl.protocol !== "https:") {
  throw new Error("Kiadási buildhez HTTPS-es API_URL szükséges.");
}

const outputPath = path.join(__dirname, "..", "release-config.json");
fs.writeFileSync(
  outputPath,
  `${JSON.stringify({ API_URL: apiUrl.replace(/\/$/, "") }, null, 2)}\n`,
  "utf8",
);

console.log("A kiadási konfiguráció elkészült.");
