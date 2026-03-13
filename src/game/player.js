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
    invulnTime: 0,
    jumpBufferTime: 0,
    coyoteTime: Number(p.coyoteSeconds || 0)
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

function tryQueuedJump(player, config) {
  if (player.jumpBufferTime <= 0) return;

  const p = config.player;
  const fatigueBudget = player.fatigue + p.fatigueJumpCost <= player.fatigueMax;
  if (!fatigueBudget) return;

  const hasAirJump = player.jumpsLeft > 0;
  const hasGroundPrivilege = player.onGround || player.coyoteTime > 0;

  if (!hasAirJump) return;

  const treatAsGroundJump = hasGroundPrivilege && player.jumpsLeft === player.maxJumps;
  const jumpIndex = treatAsGroundJump ? 0 : player.maxJumps - player.jumpsLeft;

  player.vy = jumpIndex > 0 ? p.doubleJumpVelocity : p.jumpVelocity;
  player.jumpsLeft -= 1;
  player.onGround = false;
  player.coyoteTime = 0;
  player.jumpBufferTime = 0;
  player.fatigue += p.fatigueJumpCost;
  player.isSlamming = false;
}

export function updatePlayer(player, world, input, config, dt) {
  const p = config.player;
  const jumpBufferSeconds = Math.max(0, Number(p.jumpBufferSeconds || 0));
  const coyoteSeconds = Math.max(0, Number(p.coyoteSeconds || 0));

  if (player.invulnTime > 0) {
    player.invulnTime = Math.max(0, player.invulnTime - dt);
  }

  if (player.crystalStreakTimer > 0) {
    player.crystalStreakTimer = Math.max(0, player.crystalStreakTimer - dt);
    if (player.crystalStreakTimer <= 0) {
      player.crystalStreak = 0;
    }
  }

  if (player.onGround) {
    player.coyoteTime = coyoteSeconds;
  } else {
    player.coyoteTime = Math.max(0, player.coyoteTime - dt);
  }

  player.jumpBufferTime = Math.max(0, player.jumpBufferTime - dt);

  player.armor = Math.min(player.armorMax, player.armor + p.armorRegenPerSecond * dt);
  player.fatigue = Math.max(0, player.fatigue - p.fatigueRecoverPerSecond * dt);

  if (input.consume('jump')) {
    player.jumpBufferTime = jumpBufferSeconds;
  }

  tryQueuedJump(player, config);

  if (input.consume('slam')) {
    const slamState = getSlamAvailability(player);
    if (slamState.available) {
      player.vy = p.slamVelocity;
      player.isSlamming = true;
    }
  }

  player.vy += world.gravity * dt;
  player.y += player.vy * dt;

  resolveGroundCollision(player, world);
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
