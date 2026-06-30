export interface AsciiWaveformState {
  amplitude: number;
  bass: number;
  mids: number;
  highs: number;
  transient: number;
  phase: number;
  reducedMotion?: boolean;
}

const WAVE_CHARS = ' .:-=+*#%@';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function sampleChar(value: number): string {
  const index = Math.round(clamp01(value) * (WAVE_CHARS.length - 1));
  return WAVE_CHARS[index] ?? '.';
}

export function renderAsciiWaveform(): string {
  return `<pre class="s9-hud-visual s9-ascii-waveform" data-s9-ascii-waveform aria-label="Latest transmission waveform">-- waveform pending --</pre>`;
}

export function updateAsciiWaveform(root: ParentNode, state: AsciiWaveformState): void {
  const phase = state.reducedMotion ? 0 : state.phase;
  const gain = 0.16 + state.amplitude * 0.6 + state.transient * 0.2;
  const width = 54;
  const rows = [-0.8, -0.35, 0.1, 0.45].map((offset, row) => {
    let line = '';
    for (let x = 0; x < width; x++) {
      const carrier = Math.sin(x * 0.34 + phase + row * 0.8);
      const bass = Math.sin(x * 0.13 + phase * 0.7) * state.bass;
      const mids = Math.sin(x * 0.51 - phase * 0.5) * state.mids * 0.45;
      const sample = 0.45 + (carrier * gain + bass * 0.2 + mids + offset) * 0.55;
      line += sampleChar(sample + state.highs * 0.08);
    }
    return line;
  });

  root.querySelectorAll<HTMLElement>('[data-s9-ascii-waveform]').forEach((el) => {
    el.textContent = rows.join('\n');
  });
}
