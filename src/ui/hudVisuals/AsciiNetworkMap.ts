export interface AsciiNetworkMapState {
  location: string;
  networkStatus: 'online' | 'degraded' | 'offline';
  packetActivity: number;
  phase: number;
  reducedMotion?: boolean;
}

function nodeGlyph(active: boolean, status: AsciiNetworkMapState['networkStatus']): string {
  if (status === 'offline') return 'x';
  if (status === 'degraded') return active ? '*' : '+';
  return active ? '@' : 'o';
}

export function renderAsciiNetworkMap(): string {
  return `<pre class="s9-hud-visual s9-ascii-network" data-s9-ascii-network-map aria-label="Resistance network map">NETWORK // NO CARRIER</pre>`;
}

export function updateAsciiNetworkMap(root: ParentNode, state: AsciiNetworkMapState): void {
  const el = root.querySelector<HTMLElement>('[data-s9-ascii-network-map]');
  if (!el) return;

  const phase = state.reducedMotion ? 0 : state.phase;
  const pulse = Math.floor(phase * 2 + state.packetActivity * 8) % 4;
  const a = nodeGlyph(pulse === 0, state.networkStatus);
  const b = nodeGlyph(pulse === 1, state.networkStatus);
  const c = nodeGlyph(pulse === 2, state.networkStatus);
  const d = nodeGlyph(pulse === 3, state.networkStatus);
  const path = state.networkStatus === 'offline' ? '   ' : state.networkStatus === 'degraded' ? '-.-' : '---';
  const loc = state.location.toUpperCase().slice(0, 18).padEnd(18, ' ');

  el.textContent = [
    `        ${b}`,
    `        |`,
    `${a}${path}${c}${path}${d}`,
    ` \\     |     /`,
    `  \\  ${nodeGlyph(pulse % 2 === 0, state.networkStatus)}  /`,
    `   [${loc}]`,
  ].join('\n');
}
