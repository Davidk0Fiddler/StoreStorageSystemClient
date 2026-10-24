const panels = new Map();

export function RegisterStatisticsPanel(panelId, panelDefinition) {
  if (
    !panelId ||
    typeof panelDefinition?.render !== "function" ||
    typeof panelDefinition?.mount !== "function"
  ) {
    throw new TypeError(
      "A statisztikai panelhez azonosító, render és mount függvény kell.",
    );
  }
  if (panels.has(panelId)) {
    throw new Error(`Már regisztrált statisztikai panel: ${panelId}`);
  }
  panels.set(panelId, Object.freeze({ ...panelDefinition }));
}

export function GetStatisticsPanel(panelId) {
  return panels.get(panelId) ?? null;
}
