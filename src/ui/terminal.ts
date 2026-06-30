/** Vintage terminal line helpers — scanline prompt UI */

export interface TerminalLineOptions {
  prompt?: string;
  className?: string;
  cursor?: boolean;
}

export function renderTerminalLine(text: string, options: TerminalLineOptions = {}): string {
  const { prompt = '>', className = '', cursor = false } = options;
  const cursorHtml = cursor
    ? '<span class="s9-terminal__cursor" aria-hidden="true">_</span>'
    : '';
  return `<p class="s9-terminal__line ${className}"><span class="s9-terminal__prompt">${prompt}</span> ${text}${cursorHtml}</p>`;
}

export function renderTerminalPrompt(
  label: string,
  options: { id?: string; value?: string; autofocus?: boolean } = {},
): string {
  const { id = '', value = '', autofocus = false } = options;
  const idAttr = id ? ` id="${id}"` : '';
  const focusAttr = autofocus ? ' autofocus' : '';
  return `
    <label class="s9-terminal__input-row">
      <span class="s9-terminal__prompt">&gt;</span>
      <span class="s9-terminal__input-label">${label}</span>
      <input
        class="s9-terminal__input"
        type="text"
        ${idAttr}
        value="${value}"
        spellcheck="false"
        autocomplete="off"
        ${focusAttr}
      />
      <span class="s9-terminal__cursor s9-terminal__cursor--inline" aria-hidden="true">_</span>
    </label>
  `;
}

const BOOT_LINES = [
  'COLD BOOT..................OK',
  'MIL-TERM BIOS..............LOCKED',
  'PACKET VERIFICATION........PASS',
  'MEMORY SCAN................03 NODES',
  'BROADCAST AUTH.............ACCEPTED',
  'ASCII VISUAL ENGINE........ONLINE',
  'AUDIO REACTIVE BRIDGE......ARMED',
  'SIGNAL ACQUISITION.........READY',
];

export function renderBootSequence(): string {
  return BOOT_LINES.map((line, index) =>
    renderTerminalLine(line, {
      className: index === BOOT_LINES.length - 1 ? 's9-terminal__line--accent' : '',
      cursor: index === BOOT_LINES.length - 1,
    }),
  ).join('');
}

export function animateBootLines(container: HTMLElement, onComplete?: () => void): () => void {
  const lines = [...container.querySelectorAll<HTMLElement>('.s9-terminal__line')];
  lines.forEach((line, index) => {
    line.style.opacity = '0';
    window.setTimeout(() => {
      line.style.opacity = '1';
      line.classList.add('s9-terminal__line--visible');
      if (index === lines.length - 1) onComplete?.();
    }, 180 + index * 220);
  });
  return () => undefined;
}
