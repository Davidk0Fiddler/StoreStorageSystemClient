const { contextBridge, ipcRenderer } = require("electron");
const apiUrlArgument = process.argv.find((argument) =>
  argument.startsWith("--store-api-url="),
);
let apiUrl = "";
try {
  apiUrl = decodeURIComponent(apiUrlArgument?.slice("--store-api-url=".length) || "");
} catch {
  // A hibás argumentum esetén üres API-címmel indul az alkalmazás.
}

contextBridge.exposeInMainWorld(
  "config",
  Object.freeze({
    API_URL: apiUrl,
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
