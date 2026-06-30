export interface TelemetryBar {
  label: string;
  value: number;
}

export interface AsciiTelemetryBarsState {
  bars: TelemetryBar[];
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function renderBar(label: string, value: number): string {
  const width = 14;
  const filled = Math.round(clamp01(value) * width);
  return `${label.padEnd(5, ' ')} [${'#'.repeat(filled)}${'.'.repeat(width - filled)}]`;
}

export function renderAsciiTelemetryBars(): string {
  return `<pre class="s9-hud-visual s9-ascii-telemetry" data-s9-ascii-telemetry-bars aria-label="System telemetry bars">SYS   [..............]</pre>`;
}

export function updateAsciiTelemetryBars(root: ParentNode, state: AsciiTelemetryBarsState): void {
  const el = root.querySelector<HTMLElement>('[data-s9-ascii-telemetry-bars]');
  if (!el) return;

  el.textContent = state.bars
    .slice(0, 5)
    .map((bar) => renderBar(bar.label.toUpperCase().slice(0, 5), bar.value))
    .join('\n');
}
