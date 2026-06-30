export interface AsciiPortraitState {
  callsign?: string;
  status: 'listening' | 'trace' | 'locked' | 'offline';
  interference: number;
  phase: number;
  reducedMotion?: boolean;
}

const BASE_FACE = [
  '   .--------.   ',
  '  /  .----.  \\  ',
  ' |  / .--. \\  | ',
  ' | | | .. | | | ',
  ' |  \\ `--` /  | ',
  '  \\  `----`  /  ',
  '   `--.__.--`   ',
];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function renderAsciiPortrait(): string {
  return `<pre class="s9-hud-visual s9-ascii-portrait" data-s9-ascii-portrait aria-label="Echo status portrait">${BASE_FACE.join('\n')}</pre>`;
}

export function updateAsciiPortrait(root: ParentNode, state: AsciiPortraitState): void {
  const el = root.querySelector<HTMLElement>('[data-s9-ascii-portrait]');
  if (!el) return;

  const phase = state.reducedMotion ? 0 : state.phase;
  const noise = clamp01(state.interference);
  const label = (state.callsign || state.status).toUpperCase().slice(0, 12).padEnd(12, ' ');
  const glyph = state.status === 'locked' ? '#' : state.status === 'trace' ? '*' : state.status === 'offline' ? '.' : '+';
  const lines = BASE_FACE.map((line, row) => {
    let next = '';
    for (let index = 0; index < line.length; index++) {
      const char = line[index] ?? ' ';
      const spark = Math.sin(phase + row * 1.7 + index * 0.9) > 1 - noise * 0.52;
      next += char === ' ' && spark ? glyph : char;
    }
    return next;
  });

  lines.splice(3, 1, ` | | ${label} | | `.slice(0, BASE_FACE[3]?.length ?? 16));
  el.textContent = lines.join('\n');
}
