import { intersectsAABB } from './collision.js';
import { applyHitToPlayer } from './player.js';

function commitRecords(world, player) {
  const distance = Math.floor(world.distance);
  const crystals = Math.floor(player.crystals);

  world.newBestDistance = distance > world.bestDistance;
  world.newBestCrystals = crystals > world.bestCrystals;

  if (world.newBestDistance) {
    world.bestDistance = distance;
    localStorage.setItem('runner.bestDistance', String(distance));
  }

  if (world.newBestCrystals) {
    world.bestCrystals = crystals;
    localStorage.setItem('runner.bestCrystals', String(crystals));
  }
}

function updateSpeed(world, config, dt) {
  const maxSpeed = world.maxSpeed;
  const baseSpeed = config.world.baseSpeed;
  const progressToWin = Math.min(1, world.distance / Math.max(1, world.targetDistance));
  const easingPower = Number(config.world.speedCurvePower || 1.1);
  const curvedProgress = Math.pow(progressToWin, easingPower);
  const targetSpeed = baseSpeed + (maxSpeed - baseSpeed) * curvedProgress;
  const accel = Math.max(0.1, Number(world.speedRamp || config.world.speedRampPerSecond || 1)) * dt;

  if (world.speed < targetSpeed) {
    world.speed = Math.min(targetSpeed, world.speed + accel);
  } else {
    world.speed = Math.max(targetSpeed, world.speed - accel * 0.8);
  }
}

function handleCrystalPickup(player, world, config) {
  const rewardCfg = config.reward || {};
  const streakNeeded = Math.max(2, Number(rewardCfg.streakNeeded || 3));
  const streakWindow = Math.max(0.6, Number(rewardCfg.streakWindowSeconds || 4));
  const streakBonus = Math.max(0, Number(rewardCfg.streakBonusCrystals || 2));
  const streakArmor = Math.max(0, Number(rewardCfg.streakArmorBonus || 20));

  player.crystals += 1;
  player.crystalStreak += 1;
  player.crystalStreakTimer = streakWindow;

  if (player.crystalStreak >= streakNeeded) {
    player.crystals += streakBonus;
    player.armor = Math.min(player.armorMax, player.armor + streakArmor);
    player.crystalStreak = 0;
    player.crystalStreakTimer = 0;
    player.streakBonuses += 1;
    world.lastRewardEvent = `Crystal streak! +${streakBonus} crystals, +${streakArmor} armor`;
  } else {
    world.lastRewardEvent = '';
  }
}

export function createWorld(config, canvas) {
  const initialCanvasHeight = canvas.height;
  const groundRatio = Number(config.world.groundRatio || config.world.groundY / initialCanvasHeight || 0.875);

  return {
    gravity: config.world.gravity,
    speed: config.world.baseSpeed,
    speedRamp: config.world.speedRampPerSecond,
    maxSpeed: config.world.maxSpeed,
    groundRatio,
    groundY: Math.round(initialCanvasHeight * groundRatio),
    entities: [],
    nextSegmentX: 0,
    cameraX: 0,
    distance: 0,
    canvasHeight: initialCanvasHeight,
    gameOver: false,
    gameWon: false,
    started: false,
    targetDistance: Number(config.world.winDistance || 250),
    bestDistance: Number(localStorage.getItem('runner.bestDistance') || 0),
    bestCrystals: Number(localStorage.getItem('runner.bestCrystals') || 0),
    newBestDistance: false,
    newBestCrystals: false,
    lastCollisionEvent: 'none',
    lastRewardEvent: '',
    rewardEventTtl: 0,
    lastHazardX: -Infinity,
    hazardCooldownSegments: 0
  };
}

export function updateWorld(world, player, spawner, config, dt) {
  if (world.gameOver) return;

  updateSpeed(world, config, dt);
  const scroll = world.speed * dt;
  world.cameraX += scroll;
  world.distance += scroll * config.world.distanceScale;

  if (world.rewardEventTtl > 0) {
    world.rewardEventTtl = Math.max(0, world.rewardEventTtl - dt);
    if (world.rewardEventTtl <= 0) {
      world.lastRewardEvent = '';
    }
  }

  if (world.distance >= world.targetDistance) {
    world.gameOver = true;
    world.gameWon = true;
    commitRecords(world, player);
    world.lastCollisionEvent = 'victory';
    return;
  }

  const fallMargin = Math.max(40, Number(config.world.fallDeathMargin || 120));
  if (player.y > world.canvasHeight + fallMargin) {
    world.gameOver = true;
    world.gameWon = false;
    world.lastCollisionEvent = 'fall-death';
    commitRecords(world, player);
    return;
  }

  while (world.nextSegmentX < world.cameraX + config.world.segmentLength * config.spawner.segmentLead) {
    spawner.spawnNextSegment(world, config);
  }

  const playerWorldBounds = {
    x: player.x + world.cameraX,
    y: player.y,
    width: player.width,
    height: player.height
  };

  for (let i = world.entities.length - 1; i >= 0; i -= 1) {
    const e = world.entities[i];

    if (e.x + e.width < world.cameraX - 80) {
      world.entities.splice(i, 1);
      continue;
    }

    if (e.kind === 'ground') continue;

    if (intersectsAABB(playerWorldBounds, e)) {
      if (e.kind === 'obstacle') {
        const dead = applyHitToPlayer(player, config);
        world.lastCollisionEvent = dead ? 'obstacle-hit-death' : 'obstacle-hit';
        if (player.isSlamming) {
          world.entities.splice(i, 1);
        }
        if (dead) {
          world.gameOver = true;
          commitRecords(world, player);
        }
      }

      if (e.kind === 'crystal') {
        handleCrystalPickup(player, world, config);
        world.lastCollisionEvent = 'crystal-pickup';
        world.rewardEventTtl = 1.8;
        world.entities.splice(i, 1);
      }

      if (e.kind === 'heart') {
        player.hp = Math.min(player.maxHP, player.hp + 1);
        world.lastCollisionEvent = 'heart-pickup';
        world.entities.splice(i, 1);
      }
    }
  }
}
