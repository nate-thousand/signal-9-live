export interface AsciiGlobeState {
  networkStatus: 'online' | 'degraded' | 'offline';
  broadcastStatus: 'live' | 'standby' | 'jamming';
  phase: number;
  reducedMotion?: boolean;
}

const FRAMES = [
  ['   .---.   ', ' /  | |  \\ ', '| -- o -- |', ' \\  | |  / ', '   `---`   '],
  ['   .---.   ', ' / \\ | / \\ ', '| -- o -- |', ' \\ / | \\ / ', '   `---`   '],
  ['   .---.   ', ' /  \\|/  \\ ', '| ---o--- |', ' \\  /|\\  / ', '   `---`   '],
  ['   .---.   ', ' / / | \\ \\ ', '| -- o -- |', ' \\ \\ | / / ', '   `---`   '],
];

export function renderAsciiGlobe(): string {
  return `<pre class="s9-hud-visual s9-ascii-globe" data-s9-ascii-globe aria-label="System operational globe">${FRAMES[0]?.join('\n') ?? ''}</pre>`;
}

export function updateAsciiGlobe(root: ParentNode, state: AsciiGlobeState): void {
  const el = root.querySelector<HTMLElement>('[data-s9-ascii-globe]');
  if (!el) return;

  const index = state.reducedMotion ? 0 : Math.abs(Math.floor(state.phase * 2)) % FRAMES.length;
  const frame = [...(FRAMES[index] ?? FRAMES[0] ?? [])];
  const status =
    state.networkStatus === 'offline'
      ? 'NO LINK'
      : state.broadcastStatus === 'jamming'
        ? 'JAMMED'
        : state.broadcastStatus === 'live'
          ? 'ON AIR'
          : 'STBY';

  el.textContent = [...frame, ` ${status.padEnd(8, ' ')} `].join('\n');
}
