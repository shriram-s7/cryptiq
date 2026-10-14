/**
 * Lightweight, zero-dependency confetti celebration generator.
 * Creates an explosion of colorful confetti particles that animate across the screen and self-cleanup.
 */
export function triggerConfetti(durationMs: number = 3000): void {
  if (typeof document === 'undefined') return;

  const container = document.createElement('div');
  container.className = 'confetti-canvas-container';
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 99999;
    overflow: hidden;
  `;

  const colors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#10b981', '#06b6d4', '#f59e0b', '#eab308', '#ffffff'
  ];

  const shapes = ['square', 'circle', 'ribbon'];
  const particleCount = 70;

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const startX = 20 + Math.random() * 60; // Start mostly towards center-horizontal
    const endX = startX + (Math.random() * 60 - 30);
    const endY = 80 + Math.random() * 40;
    const size = 6 + Math.random() * 8;
    const rotate = Math.random() * 720 - 360;
    const delay = Math.random() * 400;
    const animDuration = 1800 + Math.random() * 1200;

    el.style.cssText = `
      position: absolute;
      left: ${startX}vw;
      top: -20px;
      width: ${shape === 'ribbon' ? size * 0.4 : size}px;
      height: ${shape === 'ribbon' ? size * 2 : size}px;
      background-color: ${color};
      border-radius: ${shape === 'circle' ? '50%' : '2px'};
      opacity: 0.95;
      box-shadow: 0 0 8px ${color}88;
      animation: confettiFall ${animDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms forwards;
      --end-x: ${endX}vw;
      --end-y: ${endY}vh;
      --rotate: ${rotate}deg;
    `;

    container.appendChild(el);
  }

  document.body.appendChild(container);

  setTimeout(() => {
    container.remove();
  }, durationMs + 800);
}
