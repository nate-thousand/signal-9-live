import type { AudioFeaturesSnapshot, VisualEngineAdapter } from '@plantasonic/platform-types';

import {
  SIGNAL_9_BEAT_SCALE,
} from '../config/audioReactiveConfig.js';
import { SIGNAL_9_EMOJI_GLYPH_SET } from '../config/emojiGlyphs.js';
import { getSignal9Mp3Adapter } from './signal9SoundIntegration.js';
import { getSignal9VisualAdapter } from './signal9VisualIntegration.js';

let pulseActive = false;

/** Combine bass + transient + amplitude into a punchy 0–1 beat scale level. */
export function computeBeatScaleLevel(features: AudioFeaturesSnapshot): number {
  const { gain, curve, bassWeight, transientWeight, amplitudeWeight } = SIGNAL_9_BEAT_SCALE;
  const raw =
    features.bass * bassWeight +
    features.transient * transientWeight +
    features.amplitude * amplitudeWeight;
  const boosted = Math.min(1, raw * gain);
  return Math.pow(boosted, curve);
}

export async function applySignal9EmojiGlyphs(visual?: VisualEngineAdapter | null): Promise<void> {
  const target = visual ?? getSignal9VisualAdapter();
  if (!target) return;
  await target.setGlyphSet(SIGNAL_9_EMOJI_GLYPH_SET);
}

/** Feed bass analysis into per-glyph random scale on the visual engine. */
export function startBassEmojiScalePulse(): void {
  if (pulseActive) return;
  pulseActive = true;

  const tick = (): void => {
    const sound = getSignal9Mp3Adapter();
    const visual = getSignal9VisualAdapter();

    if (sound && visual) {
      const { playing } = sound.getStatus();
      const level = playing ? computeBeatScaleLevel(sound.getAudioFeatures()) : 0;
      void visual.setBassGlyphScale(level);
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
