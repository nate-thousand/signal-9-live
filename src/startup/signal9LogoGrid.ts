import type { GridState } from 'ascii-visual-engine';

import {
  SIGNAL_9_LOGO_ART,
  SIGNAL_9_LOGO_ART_COLS,
  SIGNAL_9_LOGO_ART_ROWS,
} from './signal9LogoArt.js';
import type { LogoPointerState } from './signal9LogoPointer.js';

const ART_WIDTH = SIGNAL_9_LOGO_ART_COLS;
const ART_HEIGHT = SIGNAL_9_LOGO_ART_ROWS;

const GLITCH_CHARS = '@#$%&!?<>|\\/~';

export function paintSignal9LogoGrid(
  grid: GridState,
  time: number,
  reducedMotion: boolean,
  pointer: LogoPointerState = { x: 0.5, y: 0.5, active: false },
): void {
  const { cols, rows, cells } = grid;
  const baseOffsetX = Math.max(0, Math.floor((cols - ART_WIDTH) / 2));
  const baseOffsetY = Math.max(0, Math.floor((rows - ART_HEIGHT) / 2));

  const pointerPullX = pointer.active ? (pointer.x - 0.5) * 5 : 0;
  const pointerPullY = pointer.active ? (pointer.y - 0.5) * 3 : 0;
  const offsetX = baseOffsetX + Math.round(pointerPullX);
  const offsetY = baseOffsetY + Math.round(pointerPullY);

  const pointerCol = Math.round(pointer.x * Math.max(cols - 1, 1));
  const pointerRow = Math.round(pointer.y * Math.max(rows - 1, 1));

  for (const cell of cells) {
    cell.char = ' ';
    cell.brightness = 0;
  }

  const ghostDx =
    (reducedMotion ? 0 : Math.round(Math.sin(time * 1.6) * 1.5)) +
    Math.round(pointerPullX * 0.6);
  const ghostDy =
    (reducedMotion ? 0 : Math.round(Math.cos(time * 2.3))) +
    Math.round(pointerPullY * 0.6);

  if (!reducedMotion) {
    blitArt(cells, cols, rows, offsetX + ghostDx, offsetY + ghostDy, 0.38);
  }

  blitArt(cells, cols, rows, offsetX, offsetY, 0.9);

  if (pointer.active) {
    applyPointerBeam(cells, cols, rows, pointerCol, pointerRow);
  }

  if (!reducedMotion && Math.random() > (pointer.active ? 0.78 : 0.88)) {
    const sliceY = offsetY + Math.floor(Math.random() * ART_HEIGHT);
    const shift =
      Math.round((Math.random() - 0.5) * 4) + Math.round(pointerPullX * 0.5);
    for (let x = 0; x < cols; x++) {
      const from = sliceY * cols + x;
      const to = sliceY * cols + Math.min(cols - 1, Math.max(0, x + shift));
      if (cells[from]?.char !== ' ' && cells[to]) {
        cells[to].char = cells[from].char;
        cells[to].brightness = cells[from].brightness;
        if (shift !== 0) cells[from].char = ' ';
      }
    }
  }

  if (pointer.active && !reducedMotion && Math.random() > 0.55) {
    applyPointerGlitch(cells, cols, pointerCol, pointerRow, 4);
  }
}

function applyPointerBeam(
  cells: GridState['cells'],
  cols: number,
  rows: number,
  pointerCol: number,
  pointerRow: number,
): void {
  for (let y = 0; y < rows; y++) {
    const rowDist = Math.abs(y - pointerRow);
    if (rowDist > 2) continue;

    for (let x = 0; x < cols; x++) {
      const colDist = Math.abs(x - pointerCol);
      const cell = cells[y * cols + x];
      if (!cell || cell.char === ' ') continue;

      const falloff = 1 - (rowDist * 0.28 + colDist * 0.08);
      if (falloff <= 0) continue;

      cell.brightness = Math.min(1, cell.brightness + falloff * 0.22);
    }
  }
}

function applyPointerGlitch(
  cells: GridState['cells'],
  cols: number,
  pointerCol: number,
  pointerRow: number,
  radius: number,
): void {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue;

      const gx = pointerCol + dx;
      const gy = pointerRow + dy;
      if (gx < 0 || gy < 0) continue;

      const cell = cells[gy * cols + gx];
      if (!cell || cell.char === ' ') continue;

      cell.char = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]!;
      cell.brightness = 0.65 + Math.random() * 0.35;
    }
  }
}

function blitArt(
  cells: GridState['cells'],
  cols: number,
  rows: number,
  offsetX: number,
  offsetY: number,
  brightness: number,
): void {
  for (let y = 0; y < ART_HEIGHT; y++) {
    const line = SIGNAL_9_LOGO_ART[y];
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch === ' ') continue;

      const gx = offsetX + x;
      const gy = offsetY + y;
      if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;

      const cell = cells[gy * cols + gx];
      if (!cell) continue;

      if (brightness < 0.5 && cell.char !== ' ') continue;

      cell.char = ch;
      cell.brightness = brightness;
    }
  }
}
