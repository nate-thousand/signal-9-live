/** Animated canvas → MediaStream fallback when demo MP4 files are missing. */

let demoCanvas: HTMLCanvasElement | null = null;
let demoVideo: HTMLVideoElement | null = null;
let demoAnimId: number | null = null;

function drawDemoFrame(ctx: CanvasRenderingContext2D, width: number, height: number, t: number): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a0a2e');
  gradient.addColorStop(0.5, '#3b0764');
  gradient.addColorStop(1, '#0f0518');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 6; i++) {
    const phase = t * (0.35 + i * 0.08) + i * 1.7;
    const x = width * (0.5 + Math.sin(phase) * 0.32);
    const y = height * (0.5 + Math.cos(phase * 0.9) * 0.28);
    const radius = 28 + Math.sin(t * 1.4 + i) * 18;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.2);
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.55)');
    glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
  ctx.lineWidth = 2;
  const scanY = ((t * 90) % (height + 40)) - 20;
  ctx.beginPath();
  ctx.moveTo(0, scanY);
  ctx.lineTo(width, scanY);
  ctx.stroke();
}

function tickDemoCanvas(): void {
  if (!demoCanvas) return;
  const ctx = demoCanvas.getContext('2d');
  if (!ctx) return;
  drawDemoFrame(ctx, demoCanvas.width, demoCanvas.height, performance.now() * 0.001);
  demoAnimId = requestAnimationFrame(tickDemoCanvas);
}

export function getDemoVideoElement(): HTMLVideoElement {
  if (demoVideo) return demoVideo;

  demoCanvas = document.createElement('canvas');
  demoCanvas.width = 640;
  demoCanvas.height = 360;

  const stream = demoCanvas.captureStream(30);
  demoVideo = document.createElement('video');
  demoVideo.muted = true;
  demoVideo.loop = true;
  demoVideo.playsInline = true;
  demoVideo.setAttribute('playsinline', '');
  demoVideo.srcObject = stream;

  tickDemoCanvas();
  return demoVideo;
}

export async function primeDemoVideo(): Promise<HTMLVideoElement> {
  const video = getDemoVideoElement();
  try {
    await video.play();
  } catch {
    // User gesture will start playback via playVideoTransmission
  }
  return video;
}

export function disposeDemoVideoSource(): void {
  if (demoAnimId !== null) {
    cancelAnimationFrame(demoAnimId);
    demoAnimId = null;
  }
  if (demoVideo) {
    demoVideo.pause();
    demoVideo.srcObject = null;
    demoVideo = null;
  }
  demoCanvas = null;
}
