/** Figlet slant — readable "Signal 9" wordmark for the logo grid */
export const SIGNAL_9_LOGO_ART = [
  '  ____  _                   _    ___  ',
  ' / ___|(_) __ _ _ __   __ _| |  / _ \\ ',
  ' \\___ \\| |/ _` | \'_ \\ / _` | | | (_) |',
  '  ___) | | (_| | | | | (_| | |  \\__, |',
  ' |____/|_|\\__, |_| |_|\\__,_|_|    /_/ ',
  '          |___/                       ',
] as const;

export const SIGNAL_9_LOGO_ART_COLS = Math.max(
  ...SIGNAL_9_LOGO_ART.map((line) => line.length),
);
export const SIGNAL_9_LOGO_ART_ROWS = SIGNAL_9_LOGO_ART.length;
