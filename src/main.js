import { createLoop } from './engine/loop.js';
import { loadAssets } from './engine/assets.js';
import { createInput } from './engine/input.js';
import { createRenderer } from './engine/renderer.js';
import { createPlayer, getSlamAvailability, updatePlayer } from './game/player.js';
import { createWorld, updateWorld } from './game/world.js';
import { createSpawner } from './game/spawner.js';
import { createHud } from './ui/hud.js';
import { createDebugOverlay } from './ui/debugOverlay.js';
import { createTutorialPrompts } from './retention/tutorial.js';
import { createDailyRunMode } from './retention/dailyRun.js';
import { createDailyMissions } from './retention/dailyMissions.js';

const DEFAULTS = {
  world: {
    gravity: 2400,
    baseSpeed: 185,
    speedRampPerSecond: 1.6,
    maxSpeed: 320,
    groundY: 560,
    groundRatio: 0.875,
    distanceScale: 0.01,
    segmentLength: 180,
    tileWidth: 36,
    winDistance: 250
  },
  player: {
    x: 96,
    width: 42,
    height: 56,
    jumpVelocity: -760,
    doubleJumpVelocity: -700,
    maxJumps: 2,
    slamVelocity: 1200,
    armorMax: 100,
    armorRegenPerSecond: 18,
    armorHitCost: 35,
    fatigueMax: 100,
    fatigueJumpCost: 16,
    fatigueRecoverPerSecond: 24,
    maxHP: 3,
    invulnSeconds: 0.8
  },
  spawner: {
    segmentLead: 14,
    gapChance: 0.16,
    obstacleChance: 0.2,
    crystalChance: 0.5,
    heartChance: 0.08,
    obstacleMinHeight: 45,
    obstacleMaxHeight: 84,
    graceDistance: 28,
    rampDistance: 130,
    graceObstacleMultiplier: 0.15
  },
  render: {
    bgColor: '#101629',
    groundColor: '#284021',
    playerColor: '#5ec3ff',
    obstacleColor: '#8d4c45',
    crystalColor: '#82e9ff',
    heartColor: '#ff678f'
  }
};

async function loadBalance() {
  try {
    const response = await fetch('./config/balance.json');
    if (!response.ok) throw new Error('balance file missing');
    const loaded = await response.json();
    return {
      world: { ...DEFAULTS.world, ...(loaded.world || {}) },
      player: { ...DEFAULTS.player, ...(loaded.player || {}) },
      spawner: { ...DEFAULTS.spawner, ...(loaded.spawner || {}) },
      render: { ...DEFAULTS.render, ...(loaded.render || {}) }
    };
  } catch {
    return DEFAULTS;
  }
}

function resetRun(state, config, { autoStart = false } = {}) {
  state.world.entities.length = 0;
  state.world.nextSegmentX = 0;
  state.world.cameraX = 0;
  state.world.distance = 0;
  state.world.speed = config.world.baseSpeed;
  state.world.gameOver = false;
  state.world.gameWon = false;
  state.world.started = autoStart;
  state.world.newBestDistance = false;
  state.world.newBestCrystals = false;
  state.world.lastCollisionEvent = 'none';

  const freshPlayer = createPlayer(config, state.world.groundY);
  Object.assign(state.player, freshPlayer);

  state.spawner.setRandomProvider(state.dailyRun.createRngForCurrentMode());
  state.spawner.seedInitial(state.world);

  state.dailyMissions.onRunStart();
  state.runMetrics.lastDistance = state.world.distance;
  state.runMetrics.lastCrystals = state.player.crystals;
}

function countEntities(entities) {
  let obstacles = 0;
  let crystals = 0;

  entities.forEach((e) => {
    if (e.kind === 'obstacle') obstacles += 1;
    if (e.kind === 'crystal') crystals += 1;
  });

  return { obstacles, crystals };
}

async function boot() {
  const config = await loadBalance();
  const assets = await loadAssets();
  const canvas = document.getElementById('gameCanvas');
  const buttons = Array.from(document.querySelectorAll('.touch-btn'));
  const modeToggle = document.getElementById('modeToggle');
  const slamButton = document.getElementById('slamButton');
  const slamHint = document.getElementById('slamHint');

  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === '1';

  const input = createInput({ canvas, buttons });
  const world = createWorld(config, canvas);
  const player = createPlayer(config, world.groundY);
  const spawner = createSpawner(config);
  const renderer = createRenderer({ canvas, config, assets });
  const hud = createHud();
  const debugOverlay = createDebugOverlay(isDebugMode);
  const tutorial = createTutorialPrompts();
  const dailyRun = createDailyRunMode();
  const dailyMissions = createDailyMissions({ getDateKey: () => dailyRun.getDateKey() });
  const runMetrics = { lastDistance: world.distance, lastCrystals: player.crystals };
  const state = {
    config,
    input,
    world,
    player,
    spawner,
    renderer,
    hud,
    tutorial,
    dailyRun,
    dailyMissions,
    runMetrics
  };

  spawner.setRandomProvider(dailyRun.createRngForCurrentMode());
  spawner.seedInitial(world);
  dailyMissions.onRunStart();

  const updateModeButton = () => {
    const mode = dailyRun.getMode();
    modeToggle.textContent = mode === 'daily' ? `Mode: Daily (${dailyRun.getDateKey()})` : 'Mode: Normal';
  };
  updateModeButton();

  modeToggle.addEventListener('click', () => {
    dailyRun.toggleMode();
    updateModeButton();
    resetRun(state, config);
  });

  let loopMs = 0;
  let loop;

  loop = createLoop({
    update(dt) {
      const t0 = performance.now();
      if (input.consume('pause')) {
        loop.pause();
        return;
      }

      if (world.gameOver) {
        if (input.consume('jump')) resetRun(state, config, { autoStart: true });
      } else if (!world.started) {
        if (input.consume('jump')) {
          world.started = true;
        }
      } else {
        updatePlayer(player, world, input, config, dt);
        tutorial.update(player);
        updateWorld(world, player, spawner, config, dt);

        const distanceDelta = Math.max(0, world.distance - runMetrics.lastDistance);
        const crystalsDelta = Math.max(0, player.crystals - runMetrics.lastCrystals);
        dailyMissions.updateProgress({ distanceDelta, crystalsDelta });
        runMetrics.lastDistance = world.distance;
        runMetrics.lastCrystals = player.crystals;
      }

      const slamState = getSlamAvailability(player);
      slamButton.disabled = !slamState.available;
      slamHint.textContent = slamState.available ? 'Slam ready' : slamState.reason;

      // Simple runtime assertions for MVP sanity.
      console.assert(player.hp >= 0, 'Player HP should never be negative');
      console.assert(player.fatigue >= 0 && player.fatigue <= player.fatigueMax + 0.01, 'Fatigue out of bounds');

      const entityCounts = countEntities(world.entities);
      const tutorialState = tutorial.getState();
      debugOverlay.render([
        `debug=${isDebugMode ? '1' : '0'}`,
        `entities obstacle=${entityCounts.obstacles} crystal=${entityCounts.crystals}`,
        `collision ${world.lastCollisionEvent}`,
        `slam available=${slamState.available} reason=${slamState.reason || 'ready'}`,
        `tutorial stage=${tutorialState.stage} completed=${tutorialState.completed}`
      ]);

      loopMs = performance.now() - t0;
    },
    render() {
      renderer.draw(state);
      hud.render({
        player,
        world,
        loopMs,
        promptText: tutorial.getPrompt(),
        mode: dailyRun.getMode(),
        dailyDate: dailyRun.getDateKey(),
        dailyMissions: dailyMissions.getSnapshot()
      });
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyP' && loop.isPaused()) {
      loop.resume();
    }
  });

  loop.start();
}

boot();
