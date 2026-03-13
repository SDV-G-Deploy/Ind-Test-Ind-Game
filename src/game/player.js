import { resolveGroundCollision } from './collision.js';

export function createPlayer(config, groundY) {
  const p = config.player;
  return {
    x: p.x,
    y: groundY - p.height,
    width: p.width,
    height: p.height,
    vy: 0,
    onGround: true,
    jumpsLeft: p.maxJumps,
    maxJumps: p.maxJumps,
    hp: p.maxHP,
    maxHP: p.maxHP,
    armor: p.armorMax,
    armorMax: p.armorMax,
    fatigue: 0,
    fatigueMax: p.fatigueMax,
    crystals: 0,
    crystalStreak: 0,
    crystalStreakTimer: 0,
    streakBonuses: 0,
    isSlamming: false,
    invulnTime: 0
  };
}

export function getSlamAvailability(player) {
  if (player.onGround) {
    return { available: false, reason: 'Slam only in air' };
  }

  if (player.armor < player.armorMax) {
    return { available: false, reason: 'Need full armor' };
  }

  return { available: true, reason: '' };
}

export function updatePlayer(player, world, input, config, dt) {
  const p = config.player;

  if (player.invulnTime > 0) {
    player.invulnTime = Math.max(0, player.invulnTime - dt);
  }

  if (player.crystalStreakTimer > 0) {
    player.crystalStreakTimer = Math.max(0, player.crystalStreakTimer - dt);
    if (player.crystalStreakTimer <= 0) {
      player.crystalStreak = 0;
    }
  }

  player.armor = Math.min(player.armorMax, player.armor + p.armorRegenPerSecond * dt);
  player.fatigue = Math.max(0, player.fatigue - p.fatigueRecoverPerSecond * dt);

  if (input.consume('jump')) {
    const canJump = player.jumpsLeft > 0;
    const fatigueBudget = player.fatigue + p.fatigueJumpCost <= player.fatigueMax;
    if (canJump && fatigueBudget) {
      const jumpIndex = player.maxJumps - player.jumpsLeft;
      player.vy = jumpIndex > 0 ? p.doubleJumpVelocity : p.jumpVelocity;
      player.jumpsLeft -= 1;
      player.onGround = false;
      player.fatigue += p.fatigueJumpCost;
      player.isSlamming = false;
    }
  }

  if (input.consume('slam')) {
    const slamState = getSlamAvailability(player);
    if (slamState.available) {
      player.vy = p.slamVelocity;
      player.isSlamming = true;
    }
  }

  player.vy += world.gravity * dt;
  player.y += player.vy * dt;

  resolveGroundCollision(player, world.groundY);
}

export function applyHitToPlayer(player, config) {
  if (player.invulnTime > 0) return false;

  const hitCost = config.player.armorHitCost;
  if (player.armor >= hitCost) {
    player.armor -= hitCost;
  } else {
    player.hp -= 1;
  }

  player.invulnTime = config.player.invulnSeconds;
  return player.hp <= 0;
}
