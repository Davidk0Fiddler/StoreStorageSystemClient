const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld(
  "config",
  Object.freeze({
    API_URL: process.env.API_URL,
  }),
);
