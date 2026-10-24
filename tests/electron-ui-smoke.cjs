const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");

const projectRoot = path.resolve(__dirname, "..");
const electronBinary = require("electron");

class DevToolsClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();

    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (!message.id) return;

      const pending = this.pending.get(message.id);
      if (!pending) return;
      clearTimeout(pending.timeout);
      this.pending.delete(message.id);

      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });

    socket.addEventListener("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error("Electron DevTools kapcsolat bezárult."));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`DevTools időtúllépés: ${method}`));
      }, 5000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.text || "UI kiértékelési hiba.");
    }
    return response.result?.value;
  }

  close() {
    if (this.socket.readyState === WebSocket.OPEN) this.socket.close();
  }
}

async function getFreePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForPageTarget(port, processHandle, getOutput) {
  const deadline = Date.now() + 25000;
  let lastError;
  while (Date.now() < deadline) {
    if (processHandle.exitCode !== null) {
      throw new Error(
        `Az Electron leállt (code=${processHandle.exitCode}, signal=${processHandle.signalCode}). ${getOutput()}`,
      );
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const target = targets.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
      if (target) return target;
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw new Error(`Az Electron UI nem jelent meg a DevTools-on. ${lastError ?? ""} ${getOutput()}`);
}

async function waitForLoginPage(devTools) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const state = await devTools.evaluate(`({
      url: location.href,
      hasUsername: Boolean(document.getElementById("login-username-field")),
      hasPassword: Boolean(document.getElementById("login-password-field")),
    })`);
    if (state?.hasUsername && state?.hasPassword) return state;
    await delay(250);
  }
  throw new Error("A bejelentkezési oldal nem töltődött be.");
}

async function main() {
  const port = await getFreePort();
  const profilePath = await fs.mkdtemp(path.join(os.tmpdir(), "store-client-ui-smoke-"));
  const output = [];
  const child = spawn(
    electronBinary,
    [
      "--disable-gpu",
      `--remote-debugging-port=${port}`,
      "--remote-debugging-address=127.0.0.1",
      `--user-data-dir=${profilePath}`,
      ".",
    ],
    { cwd: projectRoot, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  child.stdout.on("data", (chunk) => output.push(chunk.toString()));
  child.stderr.on("data", (chunk) => output.push(chunk.toString()));
  const getOutput = () => output.join("").slice(-4000);
  let devTools;

  try {
    const target = await waitForPageTarget(port, child, getOutput);
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("DevTools WebSocket kapcsolódási időtúllépés.")), 5000);
      socket.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
      socket.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("DevTools WebSocket kapcsolat sikertelen.")); }, { once: true });
    });
    devTools = new DevToolsClient(socket);
    await devTools.send("Runtime.enable");

    const loginPage = await waitForLoginPage(devTools);
    assert.match(loginPage.url, /LoginPage\.html/i, "a splash oldal után a login oldalra kell jutni");

    const initialButtonState = await devTools.evaluate(
      `document.getElementById("login-button").disabled`,
    );
    assert.equal(initialButtonState, true, "üres mezőkkel a bejelentkezés legyen letiltva");

    const enabledButtonState = await devTools.evaluate(`(() => {
      const username = document.getElementById("login-username-field");
      const password = document.getElementById("login-password-field");
      username.value = "ui-smoke-user";
      username.dispatchEvent(new Event("input", { bubbles: true }));
      password.value = "ui-smoke-password";
      password.dispatchEvent(new Event("input", { bubbles: true }));
      return document.getElementById("login-button").disabled;
    })()`);
    assert.equal(enabledButtonState, false, "kitöltött mezőkkel a gomb engedélyeződjön");

    const revealedType = await devTools.evaluate(`(() => {
      document.getElementById("toggle-password-button").click();
      return document.getElementById("login-password-field").type;
    })()`);
    assert.equal(revealedType, "text", "a jelszó ikon fedje fel a jelszót");

    console.log("UI smoke test sikeres: indítás, bejelentkezési mezők validálása, jelszó megjelenítése.");
  } finally {
    try {
      await devTools?.send("Browser.close");
    } catch {
      // Az alkalmazás már bezáródhatott vagy megszakadhatott.
    }
    devTools?.close();
    if (child.exitCode === null) child.kill();
    await Promise.race([
      new Promise((resolve) => child.once("exit", resolve)),
      delay(3000),
    ]);

    const resolvedProfilePath = path.resolve(profilePath);
    const resolvedTempPath = path.resolve(os.tmpdir());
    if (path.dirname(resolvedProfilePath) === resolvedTempPath) {
      await fs.rm(resolvedProfilePath, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
