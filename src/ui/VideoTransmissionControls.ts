import { SIGNAL_9_VIDEO_SOURCES } from '../config/videoSources.js';
import {
  SIGNAL_9_VIDEO_PROFILE_MAP,
  SIGNAL_9_VIDEO_SLIDER_CONTROLS,
} from '../content/videoVisualPresets.js';
import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';
import {
  loadVideoSourceById,
  pauseVideoTransmission,
  playVideoTransmission,
  restartVideoTransmission,
  setVideoBackgroundEnabled,
  setVideoControlFromSlider,
  isVideoBackgroundEnabled,
} from '../platform/videoAsciiSession.js';
import { applyTransmissionProfileSync } from '../platform/transmissionControlState.js';
import { SIGNAL_9_DEFAULT_VIDEO_SOURCE } from '../config/videoSources.js';

export type VideoPanelPresetId = Signal9PresetTrackId | 'blackout';

let activeVideoPanel: HTMLElement | null = null;

function syncSliders(panel: HTMLElement, presetId: VideoPanelPresetId): void {
  const profile = SIGNAL_9_VIDEO_PROFILE_MAP[presetId];
  for (const control of SIGNAL_9_VIDEO_SLIDER_CONTROLS) {
    const input = panel.querySelector<HTMLInputElement>(`[data-s9-video-control="${control.id}"]`);
    if (!input) continue;
    const key = control.id === 'glitch' ? 'glitchAmount' : control.id;
    input.value = String(profile[key as keyof typeof profile]);
  }
}

export function syncVideoPanelPreset(presetId: VideoPanelPresetId): void {
  if (!activeVideoPanel) return;
  syncSliders(activeVideoPanel, presetId);
  applyTransmissionProfileSync(SIGNAL_9_VIDEO_PROFILE_MAP[presetId]);
  const source = SIGNAL_9_VIDEO_SOURCES.find((s) => s.defaultPreset === presetId);
  const select = activeVideoPanel.querySelector<HTMLSelectElement>('#s9-video-source');
  if (source && select) select.value = source.id;
}

export function mountVideoTransmissionControls(instrumentRoot: HTMLElement): HTMLElement {
  const existing = instrumentRoot.querySelector<HTMLElement>('.s9-video-bar');
  if (existing) return existing;

  const panel = document.createElement('div');
  panel.className = 's9-video-bar';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Video ASCII controls');

  const header = document.createElement('div');
  header.className = 's9-video-bar__header';
  header.textContent = 'VIDEO ASCII';
  panel.appendChild(header);

  const sourceRow = document.createElement('div');
  sourceRow.className = 's9-video-bar__row';

  const sourceLabel = document.createElement('label');
  sourceLabel.className = 's9-video-bar__label';
  sourceLabel.htmlFor = 's9-video-source';
  sourceLabel.textContent = 'Source';

  const sourceSelect = document.createElement('select');
  sourceSelect.id = 's9-video-source';
  sourceSelect.className = 's9-video-bar__select';
  for (const source of SIGNAL_9_VIDEO_SOURCES) {
    const option = document.createElement('option');
    option.value = source.id;
    option.textContent = source.title;
    sourceSelect.appendChild(option);
  }

  sourceRow.append(sourceLabel, sourceSelect);
  panel.appendChild(sourceRow);

  const videoToggleRow = document.createElement('div');
  videoToggleRow.className = 's9-video-bar__row s9-video-bar__row--toggle';

  const videoToggleLabel = document.createElement('label');
  videoToggleLabel.className = 's9-video-bar__toggle';
  videoToggleLabel.htmlFor = 's9-video-background';

  const videoToggle = document.createElement('input');
  videoToggle.type = 'checkbox';
  videoToggle.id = 's9-video-background';
  videoToggle.className = 's9-video-bar__toggle-input';
  videoToggle.checked = isVideoBackgroundEnabled();

  const videoToggleText = document.createElement('span');
  videoToggleText.className = 's9-video-bar__toggle-text';
  videoToggleText.textContent = 'Video source';

  const videoToggleHint = document.createElement('span');
  videoToggleHint.className = 's9-video-bar__toggle-hint';
  videoToggleHint.textContent = 'Off = standalone ASCII visualizer';

  videoToggleLabel.append(videoToggle, videoToggleText);
  videoToggleRow.append(videoToggleLabel, videoToggleHint);
  panel.appendChild(videoToggleRow);

  const transport = document.createElement('div');
  transport.className = 's9-video-bar__transport';

  for (const action of [
    { id: 'play', label: 'Play Video' },
    { id: 'pause', label: 'Pause Video' },
    { id: 'restart', label: 'Restart' },
  ]) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 's9-video-bar__btn';
    btn.dataset.s9VideoAction = action.id;
    btn.textContent = action.label;
    transport.appendChild(btn);
  }
  panel.appendChild(transport);

  const sliders = document.createElement('div');
  sliders.className = 's9-video-bar__sliders';

  for (const control of SIGNAL_9_VIDEO_SLIDER_CONTROLS) {
    const row = document.createElement('div');
    row.className = 's9-video-bar__slider-row';

    const label = document.createElement('label');
    label.className = 's9-video-bar__label';
    label.htmlFor = `s9-video-${control.id}`;
    label.textContent = control.label;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '1';
    input.step = '0.01';
    input.id = `s9-video-${control.id}`;
    input.className = 's9-video-bar__range';
    input.dataset.s9VideoControl = control.id;
    input.value = '0.5';

    row.append(label, input);
    sliders.appendChild(row);
  }
  panel.appendChild(sliders);

  instrumentRoot.appendChild(panel);
  activeVideoPanel = panel;

  sourceSelect.addEventListener('change', () => {
    void loadVideoSourceById(sourceSelect.value)
      .then(() => {
        if (isVideoBackgroundEnabled()) {
          return playVideoTransmission(sourceSelect.value);
        }
      })
      .catch((error: unknown) => {
        console.error('[signal-9] video source load failed:', error);
      });
  });

  videoToggle.addEventListener('change', () => {
    void setVideoBackgroundEnabled(videoToggle.checked).catch((error: unknown) => {
      console.error('[signal-9] video background toggle failed:', error);
      videoToggle.checked = !videoToggle.checked;
    });
  });

  transport.querySelectorAll<HTMLButtonElement>('[data-s9-video-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.s9VideoAction;
      const sourceId =
        panel.querySelector<HTMLSelectElement>('#s9-video-source')?.value ??
        SIGNAL_9_DEFAULT_VIDEO_SOURCE.id;
      if (action === 'play') {
        if (!isVideoBackgroundEnabled()) return;
        void playVideoTransmission(sourceId).catch((error: unknown) => {
          console.error('[signal-9] video play failed:', error);
        });
      }
      if (action === 'pause') {
        void pauseVideoTransmission();
      }
      if (action === 'restart') {
        void restartVideoTransmission(sourceId).catch((error: unknown) => {
          console.error('[signal-9] video restart failed:', error);
        });
      }
    });
  });

  sliders.querySelectorAll<HTMLInputElement>('[data-s9-video-control]').forEach((input) => {
    input.addEventListener('input', () => {
      const controlId = input.dataset.s9VideoControl;
      if (!controlId) return;
      setVideoControlFromSlider(controlId, Number(input.value));
    });
  });

  syncSliders(panel, 'broadcast');

  // Video loads when applySignal9Preset runs during bootstrap.

  return panel;
}
