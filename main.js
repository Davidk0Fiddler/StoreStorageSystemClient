const { app, BrowserWindow } = require("electron");
const path = require("path");

require("dotenv").config();

const START_PAGE = "src/features/loading/ui/LoadingPage.html";

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "assets", "icon.png"),
  });
  window.loadFile(START_PAGE);

  // window.setMenu(null);

  // window.webContents.on("before-input-event", (event, input) => {
  //   if (input.key === "F12") {
  //     event.preventDefault();
  //   }
  // });

  // window.webContents.on("before-input-event", (event, input) => {
  //   if (input.control && input.shift && input.key.toLowerCase() === "i") {
  //     event.preventDefault();
  //   }
  // });
}

app.whenReady().then(createWindow);
