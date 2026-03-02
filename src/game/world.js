import { intersectsAABB } from './collision.js';
import { applyHitToPlayer } from './player.js';

export function createWorld(config, canvas) {
  return {
    gravity: config.world.gravity,
    speed: config.world.baseSpeed,
    speedRamp: config.world.speedRampPerSecond,
    maxSpeed: config.world.maxSpeed,
    groundY: config.world.groundY,
    entities: [],
    nextSegmentX: 0,
    cameraX: 0,
    distance: 0,
    canvasHeight: canvas.height,
    gameOver: false,
    bestDistance: Number(localStorage.getItem('runner.bestDistance') || 0)
  };
}

export function updateWorld(world, player, spawner, config, dt) {
  if (world.gameOver) return;

  world.speed = Math.min(world.maxSpeed, world.speed + world.speedRamp * dt);
  const scroll = world.speed * dt;
  world.cameraX += scroll;
  world.distance += scroll * config.world.distanceScale;

  while (world.nextSegmentX < world.cameraX + config.world.segmentLength * config.spawner.segmentLead) {
    spawner.spawnNextSegment(world, config);
  }

  for (let i = world.entities.length - 1; i >= 0; i -= 1) {
    const e = world.entities[i];

    if (e.x + e.width < world.cameraX - 80) {
      world.entities.splice(i, 1);
      continue;
    }

    if (e.kind === 'ground') continue;

    if (intersectsAABB(player, e)) {
      if (e.kind === 'obstacle') {
        const dead = applyHitToPlayer(player, config);
        if (player.isSlamming) {
          world.entities.splice(i, 1);
        }
        if (dead) {
          world.gameOver = true;
          world.bestDistance = Math.max(world.bestDistance, Math.floor(world.distance));
          localStorage.setItem('runner.bestDistance', String(world.bestDistance));
        }
      }

      if (e.kind === 'crystal') {
        player.crystals += 1;
        world.entities.splice(i, 1);
      }

      if (e.kind === 'heart') {
        player.hp = Math.min(player.maxHP, player.hp + 1);
        world.entities.splice(i, 1);
      }
    }
  }
}
