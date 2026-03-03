const STORAGE_KEY = 'runner.tutorial.v1';

function loadShownPrompts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { jump: false, doubleJump: false, slam: false };
    const parsed = JSON.parse(raw);
    return {
      jump: Boolean(parsed.jump),
      doubleJump: Boolean(parsed.doubleJump),
      slam: Boolean(parsed.slam)
    };
  } catch {
    return { jump: false, doubleJump: false, slam: false };
  }
}

function persistShownPrompts(shown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shown));
}

export function createTutorialPrompts() {
  const shown = loadShownPrompts();
  let activePrompt = '';

  function showPrompt(key, text) {
    if (shown[key]) return;
    shown[key] = true;
    activePrompt = text;
    persistShownPrompts(shown);
  }

  return {
    update(player) {
      if (!shown.jump && player.onGround) {
        showPrompt('jump', 'Tutorial: Jump to clear gaps and low obstacles.');
      } else if (!shown.doubleJump && !player.onGround && player.jumpsLeft === 1) {
        showPrompt('doubleJump', 'Tutorial: Tap jump again in air for a double jump.');
      } else if (!shown.slam && !player.onGround && player.jumpsLeft <= 1) {
        showPrompt('slam', 'Tutorial: Slam mid-air to break through obstacles.');
      }
    },
    getPrompt() {
      return activePrompt;
    }
  };
}
