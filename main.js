const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

require("dotenv").config();

const canUpdate = () => app.isPackaged && process.platform === "win32";

let mainWindow = null;
let updateState = {
  phase: "disabled",
  version: null,
  percent: 0,
};

function publishUpdateState(nextState) {
  updateState = { ...updateState, ...nextState };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("startup:update-status", updateState);
  }
}

function getStartupInfo() {
  return {
    version: app.getVersion(),
    updateManagerEnabled: canUpdate(),
    updater: { ...updateState },
  };
}

ipcMain.handle("startup:get-info", getStartupInfo);

ipcMain.handle("startup:download-update", async () => {
  if (!canUpdate() || updateState.phase !== "available") {
    return { success: false, state: { ...updateState } };
  }

  publishUpdateState({ phase: "downloading", percent: 0 });
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch {
    publishUpdateState({ phase: "error", percent: 0 });
    return { success: false };
  }
});

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.allowPrerelease = false;

autoUpdater.on("checking-for-update", () => {
  publishUpdateState({ phase: "checking", version: null, percent: 0 });
});

autoUpdater.on("update-available", (info) => {
  publishUpdateState({ phase: "available", version: info.version, percent: 0 });
});

autoUpdater.on("update-not-available", (info) => {
  publishUpdateState({ phase: "current", version: info.version, percent: 100 });
});

autoUpdater.on("download-progress", (progress) => {
  publishUpdateState({
    phase: "downloading",
    percent: Math.max(0, Math.min(100, Math.round(progress.percent || 0))),
  });
});

autoUpdater.on("update-downloaded", (info) => {
  publishUpdateState({ phase: "downloaded", version: info.version, percent: 100 });
  setTimeout(() => autoUpdater.quitAndInstall(true, true), 900);
});

autoUpdater.on("error", () => {
  publishUpdateState({ phase: "error", percent: 0 });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "assets", "icon.png"),
  });

  mainWindow.loadFile("pages/LoadingPage/LoadingPage.html");
  mainWindow.setMenu(null);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i")) {
      event.preventDefault();
    }
  });
}

function checkForUpdates() {
  if (!canUpdate()) {
    updateState = { phase: "disabled", version: null, percent: 0 };
    return;
  }

  publishUpdateState({ phase: "checking", version: null, percent: 0 });
  autoUpdater.checkForUpdates().catch(() => {
    publishUpdateState({ phase: "error", percent: 0 });
  });
}

app.whenReady().then(() => {
  createWindow();
  checkForUpdates();
});
