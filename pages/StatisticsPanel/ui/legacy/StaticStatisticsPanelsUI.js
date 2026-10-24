const charts = new Map();

export function DisposeStaticStatisticsPanelUI(panelId) {
  for (const [key, chart] of charts) {
    if (key.startsWith(`${panelId}:`)) {
      chart.destroy();
      charts.delete(key);
    }
  }
}

