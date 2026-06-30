/** Terminal glyph ramp for video-to-ASCII — maps brightness cleanly */
export const SIGNAL_9_VIDEO_GLYPH_SET: string[] = [
  ' ',
  '.',
  ':',
  '-',
  '=',
  '+',
  '*',
  '#',
  '@',
];

/** @deprecated Use SIGNAL_9_VIDEO_GLYPH_SET */
export const SIGNAL_9_EMOJI_GLYPH_SET = SIGNAL_9_VIDEO_GLYPH_SET;
