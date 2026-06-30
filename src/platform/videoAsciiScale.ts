/** ASCII glyph size range — denser floor for fewer cells (performance). */
export const ASCII_SCALE_MIN_PT = 7;
export const ASCII_SCALE_MAX_PT = 38;
export const ASCII_SCALE_SLIDER_FLOOR = 0.05;
export const ASCII_SCALE_SLIDER_CEILING = 1;

/** Engine grid: cellHeight ≈ 19.2 / density (see GridBuffer) */
const ENGINE_CELL_HEIGHT_FACTOR = 19.2;

function sliderToScaleT(sliderValue: number): number {
  const t = Math.min(1, Math.max(0, sliderValue));
  return ASCII_SCALE_SLIDER_FLOOR + t * (ASCII_SCALE_SLIDER_CEILING - ASCII_SCALE_SLIDER_FLOOR);
}

function scaleTToSlider(scaleT: number): number {
  const clamped = Math.min(
    ASCII_SCALE_SLIDER_CEILING,
    Math.max(ASCII_SCALE_SLIDER_FLOOR, scaleT),
  );
  return (clamped - ASCII_SCALE_SLIDER_FLOOR) / (ASCII_SCALE_SLIDER_CEILING - ASCII_SCALE_SLIDER_FLOOR);
}

export function mapAsciiScaleSliderToFontPt(sliderValue: number): number {
  const scaleT = sliderToScaleT(sliderValue);
  const span = ASCII_SCALE_SLIDER_CEILING - ASCII_SCALE_SLIDER_FLOOR;
  const ratio = span > 0 ? (scaleT - ASCII_SCALE_SLIDER_FLOOR) / span : 0;
  return ASCII_SCALE_MIN_PT + ratio * (ASCII_SCALE_MAX_PT - ASCII_SCALE_MIN_PT);
}

/** Fewer steps → fewer grid rebuilds while dragging ASCII Scale. */
export const ASCII_SCALE_STEPS = 10;

export function quantizeAsciiScaleSlider(sliderValue: number): number {
  const t = Math.min(1, Math.max(0, sliderValue));
  const step = 1 / (ASCII_SCALE_STEPS - 1);
  return Math.round(t / step) * step;
}

/** Map ASCII Scale slider (0–1) → engine density (may exceed 1 for small glyphs). */
export function mapAsciiScaleSliderToDensity(sliderValue: number): number {
  const stepped = quantizeAsciiScaleSlider(sliderValue);
  const fontPt = mapAsciiScaleSliderToFontPt(stepped);
  return ENGINE_CELL_HEIGHT_FACTOR / fontPt;
}

export function mapDensityToAsciiScaleSlider(density: number): number {
  const fontPt = ENGINE_CELL_HEIGHT_FACTOR / Math.max(0.01, density);
  const ratio = (fontPt - ASCII_SCALE_MIN_PT) / (ASCII_SCALE_MAX_PT - ASCII_SCALE_MIN_PT);
  const scaleT = ASCII_SCALE_SLIDER_FLOOR + ratio * (ASCII_SCALE_SLIDER_CEILING - ASCII_SCALE_SLIDER_FLOOR);
  return scaleTToSlider(scaleT);
}
