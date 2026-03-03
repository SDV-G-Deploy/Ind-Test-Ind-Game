const STORAGE_KEY = 'runner.tutorial.v1';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { stage: 0, completed: false };
    const parsed = JSON.parse(raw);
    return {
      stage: Math.max(0, Math.min(3, Number(parsed.stage || 0))),
      completed: Boolean(parsed.completed)
    };
  } catch {
    return { stage: 0, completed: false };
  }
}

function persistProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

const PROMPTS = [
  'Tutorial: Jump to clear gaps and low obstacles.',
  'Tutorial: Tap jump again in air for a double jump.',
  'Tutorial: Slam mid-air to break through obstacles.'
];

export function createTutorialPrompts() {
  const progress = loadProgress();
  let activePrompt = '';

  function advance() {
    progress.stage = Math.min(3, progress.stage + 1);
    if (progress.stage >= 3) {
      progress.completed = true;
      activePrompt = '';
    }
    persistProgress(progress);
  }

  return {
    update(player) {
      if (progress.completed) {
        activePrompt = '';
        return;
      }

      if (progress.stage === 0) {
        activePrompt = PROMPTS[0];
        if (!player.onGround) advance();
        return;
      }

      if (progress.stage === 1) {
        activePrompt = PROMPTS[1];
        if (!player.onGround && player.jumpsLeft === 0) advance();
        return;
      }

      if (progress.stage === 2) {
        activePrompt = PROMPTS[2];
        if (player.isSlamming) advance();
      }
    },
    getPrompt() {
      return activePrompt;
    },
    getState() {
      return { stage: progress.stage, completed: progress.completed };
    }
  };
}
