export interface AsciiSpectrumState {
  bass: number;
  mids: number;
  highs: number;
  transient: number;
  peak?: number;
  rms?: number;
  signalStrength?: number;
  frequencyBins?: number[];
  phase: number;
  reducedMotion?: boolean;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function renderAsciiSpectrum(): string {
  return `<pre class="s9-hud-visual s9-ascii-spectrum" data-s9-ascii-spectrum aria-label="Radio spectrum analyzer">SPECTRUM // STANDBY</pre>`;
}

export function updateAsciiSpectrum(root: ParentNode, state: AsciiSpectrumState): void {
  const el = root.querySelector<HTMLElement>('[data-s9-ascii-spectrum]');
  if (!el) return;

  const phase = state.reducedMotion ? 0 : state.phase;
  const sourceBins = state.frequencyBins?.length ? state.frequencyBins : null;
  const bands = Array.from({ length: 32 }, (_, index) => {
    if (sourceBins) return clamp01(sourceBins[Math.floor((index / 32) * sourceBins.length)] ?? 0);
    const source = index < 9 ? state.bass : index < 22 ? state.mids : state.highs;
    const drift = Math.sin(phase + index * 0.72) * 0.12;
    const peak = index % 5 === 0 ? state.transient * 0.18 : 0;
    return clamp01(0.12 + source * 0.72 + drift + peak);
  });
  const peakLine = bands
    .map((band, index) => {
      const peakThreshold = clamp01((state.peak ?? state.transient) * 0.82);
      return band >= peakThreshold || index % 8 === 0 ? '^' : '.';
    })
    .join('');

  const rows: string[] = [];
  for (let level = 7; level >= 0; level--) {
    rows.push(
      bands
        .map((band) => (Math.round(band * 7) >= level ? '|' : '.'))
        .join(''),
    );
  }
  const signal = Math.round((state.signalStrength ?? 0) * 99);
  const rms = Math.round((state.rms ?? 0) * 99);
  const peak = Math.round((state.peak ?? 0) * 99);

  el.textContent = `FFT32 SIG${String(signal).padStart(2, '0')} RMS${String(rms).padStart(2, '0')} PK${String(peak).padStart(2, '0')}\n${peakLine}\n${rows.join('\n')}`;
}
