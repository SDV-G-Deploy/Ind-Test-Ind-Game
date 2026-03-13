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
    lastCollisionEvent: 'none'
  };
}

export function updateWorld(world, player, spawner, config, dt) {
  if (world.gameOver) return;

  world.speed = Math.min(world.maxSpeed, world.speed + world.speedRamp * dt);
  const scroll = world.speed * dt;
  world.cameraX += scroll;
  world.distance += scroll * config.world.distanceScale;

  if (world.distance >= world.targetDistance) {
    world.gameOver = true;
    world.gameWon = true;
    commitRecords(world, player);
    world.lastCollisionEvent = 'victory';
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
        player.crystals += 1;
        world.lastCollisionEvent = 'crystal-pickup';
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
