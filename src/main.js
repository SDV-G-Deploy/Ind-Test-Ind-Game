import { createLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { createRenderer } from './engine/renderer.js';
import { loadAssets } from './engine/assets.js';
import { createPlayer, updatePlayer } from './game/player.js';
import { createWorld, updateWorld } from './game/world.js';
import { createSpawner } from './game/spawner.js';
import { createHud } from './ui/hud.js';

const DEFAULTS = {
  world: {
    gravity: 2400,
    baseSpeed: 200,
    speedRampPerSecond: 2,
    maxSpeed: 350,
    groundY: 560,
    distanceScale: 0.01,
    segmentLength: 180,
    tileWidth: 36
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
    fatigueJumpCost: 28,
    fatigueRecoverPerSecond: 16,
    maxHP: 3,
    invulnSeconds: 0.8
  },
  spawner: {
    segmentLead: 14,
    gapChance: 0.2,
    obstacleChance: 0.35,
    crystalChance: 0.55,
    heartChance: 0.08,
    obstacleMinHeight: 45,
    obstacleMaxHeight: 90
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

function resetRun(state, config) {
  state.world.entities.length = 0;
  state.world.nextSegmentX = 0;
  state.world.cameraX = 0;
  state.world.distance = 0;
  state.world.speed = config.world.baseSpeed;
  state.world.gameOver = false;

  const freshPlayer = createPlayer(config, state.world.groundY);
  Object.assign(state.player, freshPlayer);

  state.spawner.seedInitial(state.world);
}

async function boot() {
  const config = await loadBalance();
  const assets = await loadAssets();
  const canvas = document.getElementById('gameCanvas');
  const buttons = Array.from(document.querySelectorAll('.touch-btn'));

  const input = createInput({ canvas, buttons });
  const world = createWorld(config, canvas);
  const player = createPlayer(config, world.groundY);
  const spawner = createSpawner(config);
  const renderer = createRenderer({ canvas, config, assets });
  const hud = createHud();
  const state = { config, assets, input, world, player, spawner, renderer, hud };

  spawner.seedInitial(world);

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
        if (input.consume('jump')) resetRun(state, config);
      } else {
        updatePlayer(player, world, input, config, dt);
        updateWorld(world, player, spawner, config, dt);
      }

      // Simple runtime assertions for MVP sanity.
      console.assert(player.hp >= 0, 'Player HP should never be negative');
      console.assert(player.fatigue >= 0 && player.fatigue <= player.fatigueMax + 0.01, 'Fatigue out of bounds');

      loopMs = performance.now() - t0;
    },
    render() {
      renderer.draw(state);
      hud.render({ player, world, loopMs });
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
