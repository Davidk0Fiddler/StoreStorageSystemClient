const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");

const projectRoot = path.resolve(__dirname, "..");
const electronBinary = require("electron");

class DevToolsClient {
  constructor(child) {
    this.writer = child.stdio[3];
    this.reader = child.stdio[4];
    this.nextId = 1;
    this.pending = new Map();
    this.buffer = "";

    this.reader.on("data", (chunk) => {
      this.buffer += chunk.toString();
      let separatorIndex;
      while ((separatorIndex = this.buffer.indexOf("\0")) >= 0) {
        const rawMessage = this.buffer.slice(0, separatorIndex);
        this.buffer = this.buffer.slice(separatorIndex + 1);
        if (!rawMessage) continue;

        let message;
        try {
          message = JSON.parse(rawMessage);
        } catch {
          continue;
        }
        if (!message.id) continue;

        const pending = this.pending.get(message.id);
        if (!pending) continue;
        clearTimeout(pending.timeout);
        this.pending.delete(message.id);

        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      }
    });

    this.reader.on("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error("Electron DevTools kapcsolat bezárult."));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}, sessionId, timeoutMs = 5000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`DevTools időtúllépés: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timeout });
      this.writer.write(`${JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })}\0`);
    });
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    }, this.sessionId);
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.text || "UI kiértékelési hiba.");
    }
    return response.result?.value;
  }

}

async function waitForPageTarget(devTools, processHandle, getOutput) {
  const deadline = Date.now() + 25000;
  let lastError;
  while (Date.now() < deadline) {
    if (processHandle.exitCode !== null) {
      throw new Error(
        `Az Electron leállt (code=${processHandle.exitCode}, signal=${processHandle.signalCode}). ${getOutput()}`,
      );
    }
    try {
      const response = await devTools.send("Target.getTargets", {}, undefined, 1500);
      const target = response.targetInfos.find((item) => item.type === "page");
      if (target) return target;
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw new Error(`Az Electron UI nem jelent meg a DevTools-on. ${lastError ?? ""} ${getOutput()}`);
}

async function waitForStartupReady(devTools) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const state = await devTools.evaluate(`({
      url: location.href,
      hasLaunchButton: Boolean(document.getElementById("launch-button")),
      launchDisabled: document.getElementById("launch-button")?.disabled,
      launchLabel: document.getElementById("launch-button")?.textContent.trim(),
      version: document.getElementById("version-label")?.textContent,
    })`);
    if (state?.hasLaunchButton && state.launchDisabled === false) return state;
    await delay(250);
  }
  throw new Error("Az indítóoldal nem vált indíthatóvá a várt időn belül.");
}

async function waitForStartupPage(devTools) {
  const deadline = Date.now() + 10000;
  let lastState;
  while (Date.now() < deadline) {
    lastState = await devTools.evaluate(`({
      url: location.href,
      hasLaunchButton: Boolean(document.getElementById("launch-button")),
      launchDisabled: document.getElementById("launch-button")?.disabled,
    })`);
    if (lastState?.hasLaunchButton) return lastState;
    await delay(100);
  }
  throw new Error(`Az indítóoldal nem töltődött be. ${JSON.stringify(lastState)}`);
}

async function waitForLoginPage(devTools) {
  const deadline = Date.now() + 10000;
  let lastState;
  while (Date.now() < deadline) {
    lastState = await devTools.evaluate(`({
      url: location.href,
      hasUsername: Boolean(document.getElementById("login-username-field")),
      hasPassword: Boolean(document.getElementById("login-password-field")),
      validationInitialized: document.getElementById("login-button")?.classList.contains("btn-secondary"),
    })`);
    if (lastState?.hasUsername && lastState?.hasPassword && lastState.validationInitialized) return lastState;
    await delay(200);
  }
  throw new Error(`A bejelentkezési oldal nem töltődött be. ${JSON.stringify(lastState)}`);
}

async function main() {
  const profilePath = await fs.mkdtemp(path.join(os.tmpdir(), "store-client-ui-smoke-"));
  const output = [];
  const launchedAt = Date.now();
  const child = spawn(
    electronBinary,
    [
      // Opt in only when a restricted test runner blocks Chromium's sandbox.
      ...(process.env.ELECTRON_TEST_NO_SANDBOX === "1" ? ["--no-sandbox"] : []),
      "--disable-gpu",
      "--remote-debugging-pipe",
      `--user-data-dir=${profilePath}`,
      ".",
    ],
    { cwd: projectRoot, windowsHide: true, stdio: ["ignore", "pipe", "pipe", "pipe", "pipe"] },
  );
  child.stdout.on("data", (chunk) => output.push(chunk.toString()));
  child.stderr.on("data", (chunk) => output.push(chunk.toString()));
  const getOutput = () => output.join("").slice(-4000);
  const devTools = new DevToolsClient(child);

  try {
    const target = await waitForPageTarget(devTools, child, getOutput);
    const attached = await devTools.send("Target.attachToTarget", {
      targetId: target.targetId,
      flatten: true,
    });
    devTools.sessionId = attached.sessionId;
    await devTools.send("Runtime.enable", {}, devTools.sessionId);

    const initialSplash = await waitForStartupPage(devTools);
    assert.match(initialSplash.url, /LoadingPage\.html/i, "induláskor a betöltőoldal jelenjen meg");
    assert.equal(initialSplash.launchDisabled, true, "az Indulás gomb a betöltés alatt legyen letiltva");

    const splashReady = await waitForStartupReady(devTools);
    assert.equal(splashReady.launchLabel, "Indulás", "a sikeres előkészítés után az Indulás gomb jelenjen meg");
    assert.match(splashReady.version, /^Verzió:/, "a verziószám jelenjen meg az indítóoldalon");
    assert.ok(Date.now() - launchedAt >= 10_000, "az indítóképernyő legalább 10 másodpercig maradjon aktív");

    await devTools.evaluate(`document.getElementById("launch-button").click()`);
    const loginPage = await waitForLoginPage(devTools);
    assert.match(loginPage.url, /LoginPage\.html/i, "az Indulás gomb után a bejelentkezési oldalra kell jutni");

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
