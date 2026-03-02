export function createLoop({ update, render, fixedDelta = 1 / 60, maxFrame = 0.1 }) {
  let rafId = null;
  let last = 0;
  let accumulator = 0;
  let paused = false;

  const frame = (timeMs) => {
    if (paused) return;

    const now = timeMs * 0.001;
    const frameDelta = Math.min(maxFrame, now - last || fixedDelta);
    last = now;
    accumulator += frameDelta;

    while (accumulator >= fixedDelta) {
      update(fixedDelta);
      accumulator -= fixedDelta;
    }

    render(accumulator / fixedDelta);
    rafId = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (rafId !== null) return;
      paused = false;
      last = performance.now() * 0.001;
      rafId = requestAnimationFrame(frame);
    },
    pause() {
      paused = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    },
    resume() {
      if (!paused) return;
      paused = false;
      last = performance.now() * 0.001;
      rafId = requestAnimationFrame(frame);
    },
    isPaused() {
      return paused;
    }
  };
}
