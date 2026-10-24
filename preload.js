const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

let packagedApiUrl = "";
try {
  const configPath = path.join(process.resourcesPath, "release-config.json");
  packagedApiUrl = JSON.parse(fs.readFileSync(configPath, "utf8")).API_URL || "";
} catch {
  // Development uses the API_URL loaded from the local .env file.
}

contextBridge.exposeInMainWorld(
  "config",
  Object.freeze({
    API_URL: packagedApiUrl || process.env.API_URL,
  }),
);

contextBridge.exposeInMainWorld(
  "startup",
  Object.freeze({
    getInfo: () => ipcRenderer.invoke("startup:get-info"),
    downloadUpdate: () => ipcRenderer.invoke("startup:download-update"),
    onUpdateStatus: (callback) => {
      if (typeof callback !== "function") return () => {};
      const listener = (_event, state) => callback(state);
      ipcRenderer.on("startup:update-status", listener);
      return () => ipcRenderer.removeListener("startup:update-status", listener);
    },
  }),
);
