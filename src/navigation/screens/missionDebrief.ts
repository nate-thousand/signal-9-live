import { generateDebrief } from '../../ai/index.js';
import { renderTerminalLine } from '../../ui/terminal.js';
import { launchDefaultMission } from './missionBriefing.js';
import type { ScreenContext } from '../types.js';

/** Brief terminal flash — no modal panel */
export function renderMissionDebriefScreen(ctx: ScreenContext): void {
  const { root, navigate, mission } = ctx;

  if (!mission) {
    void launchDefaultMission(navigate);
    return;
  }

  root.innerHTML = `
    <div class="s9-terminal s9-terminal--flash" data-s9-debrief-flash>
      ${renderTerminalLine('COMPILING REPORT...', { cursor: true })}
    </div>
  `;

  const flash = root.querySelector<HTMLElement>('[data-s9-debrief-flash]');

  void (async () => {
    try {
      const debrief = await generateDebrief(mission);
      if (flash) {
        flash.innerHTML = renderTerminalLine(
          `GRADE ${debrief.grade} · ${debrief.summary.slice(0, 64)}… [ENTER]`,
        );
      }
    } catch {
      if (flash) {
        flash.innerHTML = renderTerminalLine('REPORT FAILED · [ENTER] TO CONTINUE');
      }
    }
  })();

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.removeEventListener('keydown', onKeyDown);
      void launchDefaultMission(navigate);
    }
  };

  window.addEventListener('keydown', onKeyDown);
}
