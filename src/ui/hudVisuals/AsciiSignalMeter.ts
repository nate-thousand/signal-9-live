export interface AsciiSignalMeterState {
  label: string;
  value: number;
  variant?: 'inline' | 'block';
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function meterText(label: string, value: number, width: number): string {
  const clamped = clamp01(value);
  const filled = Math.round(clamped * width);
  const percent = String(Math.round(clamped * 100)).padStart(2, '0');
  return `${label.toUpperCase().slice(0, 5).padEnd(5, ' ')} ${percent}% [${'='.repeat(filled)}${'.'.repeat(width - filled)}]`;
}

export function renderAsciiSignalMeter(name: string, label: string): string {
  return `<pre class="s9-hud-visual s9-ascii-signal-meter" data-s9-ascii-signal-meter="${name}" aria-label="${label} signal meter">${meterText(label, 0, 16)}</pre>`;
}

export function updateAsciiSignalMeter(
  root: ParentNode,
  name: string,
  state: AsciiSignalMeterState,
): void {
  const el = root.querySelector<HTMLElement>(`[data-s9-ascii-signal-meter="${name}"]`);
  if (!el) return;

  el.textContent = meterText(state.label, state.value, state.variant === 'inline' ? 10 : 16);
}
