export interface AsciiSpectrumState {
  bass: number;
  mids: number;
  highs: number;
  transient: number;
  phase: number;
  reducedMotion?: boolean;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function renderAsciiSpectrum(): string {
  return `<pre class="s9-hud-visual s9-ascii-spectrum" data-s9-ascii-spectrum aria-label="Radio spectrum equalizer">SPECTRUM // STANDBY</pre>`;
}

export function updateAsciiSpectrum(root: ParentNode, state: AsciiSpectrumState): void {
  const el = root.querySelector<HTMLElement>('[data-s9-ascii-spectrum]');
  if (!el) return;

  const phase = state.reducedMotion ? 0 : state.phase;
  const bands = Array.from({ length: 24 }, (_, index) => {
    const source = index < 7 ? state.bass : index < 16 ? state.mids : state.highs;
    const drift = Math.sin(phase + index * 0.72) * 0.12;
    const peak = index % 5 === 0 ? state.transient * 0.18 : 0;
    return clamp01(0.12 + source * 0.72 + drift + peak);
  });

  const rows: string[] = [];
  for (let level = 7; level >= 0; level--) {
    rows.push(
      bands
        .map((band) => (Math.round(band * 7) >= level ? '|' : '.'))
        .join(''),
    );
  }

  el.textContent = rows.join('\n');
}
