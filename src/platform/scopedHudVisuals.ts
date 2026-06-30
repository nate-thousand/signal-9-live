/**
 * TODO: Future scoped HUD visual mounts.
 *
 * Broadcast Terminal currently disables the global Plantasonic ASCII stage so
 * no full-screen/background glyph layer can appear behind the UI. Future work
 * should mount visual-engine driven effects into explicit HUD containers only
 * (for example the center visual bay, spectrum analyzer, or Echo panel).
 *
 * Rules for that future implementation:
 * - Do not mount any canvas to the app, screen, or viewport root.
 * - Each visual target must be owned by a specific HUD panel element.
 * - Each target must be clipped by its panel bounds.
 * - Audio-reactive data should be routed into these panel-owned visuals only.
 * - Do not modify Plantasonic Platform or engine packages.
 */
export {};
