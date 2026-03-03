const ACTIONS = {
  jump: false,
  slam: false,
  pause: false
};

export function createInput({ canvas, buttons }) {
  const pressed = new Set();

  const trigger = (action) => {
    if (action in ACTIONS) {
      ACTIONS[action] = true;
    }
  };

  const keyToAction = (code) => {
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') return 'jump';
    if (code === 'ArrowDown' || code === 'KeyS') return 'slam';
    if (code === 'KeyP') return 'pause';
    return null;
  };

  window.addEventListener('keydown', (event) => {
    if (pressed.has(event.code)) return;
    const action = keyToAction(event.code);
    if (action) {
      pressed.add(event.code);
      trigger(action);
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    pressed.delete(event.code);
  });

  canvas.addEventListener(
    'pointerdown',
    (event) => {
      const rect = canvas.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const action = localX < rect.width * 0.5 ? 'slam' : 'jump';
      trigger(action);
      event.preventDefault();
    },
    { passive: false }
  );

  buttons.forEach((button) => {
    const action = button.dataset.action;
    button.addEventListener(
      'pointerdown',
      (event) => {
        trigger(action);
        event.preventDefault();
      },
      { passive: false }
    );
  });

  return {
    consume(action) {
      const active = ACTIONS[action];
      ACTIONS[action] = false;
      return active;
    }
  };
}
