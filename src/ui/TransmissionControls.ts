import {
  SIGNAL_9_PRESET_TRACK_LIST,
  type Signal9PresetTrackId,
} from '../audio/transmissionTracks.js';
import {
  applySignal9Preset,
  updateTransmissionPresetUi,
} from '../platform/applySignal9Preset.js';
import {
  startTransmissionSession,
  stopTransmissionSession,
} from '../platform/transmissionSession.js';
import { playVideoTransmission } from '../platform/videoAsciiSession.js';

export function mountTransmissionControls(instrumentRoot: HTMLElement): HTMLElement {
  const existing = instrumentRoot.querySelector<HTMLElement>('.s9-transmission-bar');
  if (existing) return existing;

  const bar = document.createElement('div');
  bar.className = 's9-transmission-bar';
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Transmission controls');

  const transport = document.createElement('div');
  transport.className = 's9-transmission-bar__transport';

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 's9-transmission-bar__btn s9-transmission-bar__btn--play';
  playBtn.textContent = 'Play';
  playBtn.dataset.s9Action = 'play';

  const stopBtn = document.createElement('button');
  stopBtn.type = 'button';
  stopBtn.className = 's9-transmission-bar__btn s9-transmission-bar__btn--stop';
  stopBtn.textContent = 'Stop';
  stopBtn.dataset.s9Action = 'stop';

  transport.append(playBtn, stopBtn);

  const presets = document.createElement('div');
  presets.className = 's9-transmission-bar__presets';
  presets.setAttribute('role', 'group');
  presets.setAttribute('aria-label', 'Presets');

  for (const preset of SIGNAL_9_PRESET_TRACK_LIST) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 's9-transmission-bar__preset';
    btn.dataset.s9Preset = preset.id;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `<span class="s9-transmission-bar__preset-name">${preset.label}</span>`;
    presets.appendChild(btn);
  }

  bar.append(transport, presets);
  instrumentRoot.appendChild(bar);

  playBtn.addEventListener('click', () => {
    void startTransmissionSession().then(() => {
      void playVideoTransmission().catch((error: unknown) => {
        console.warn('[signal-9] video play:', error);
      });
    });
  });

  stopBtn.addEventListener('click', () => {
    void stopTransmissionSession();
  });

  presets.querySelectorAll<HTMLButtonElement>('[data-s9-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.s9Preset as Signal9PresetTrackId | undefined;
      if (!id) return;
      void applySignal9Preset(instrumentRoot, id)
        .then(() => updateTransmissionPresetUi(presets, id))
        .catch((error: unknown) => {
          console.error('[signal-9] preset apply failed:', error);
        });
    });
  });

  return bar;
}
