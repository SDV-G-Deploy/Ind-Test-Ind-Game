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
    isSlamming: false,
    invulnTime: 0
  };
}

export function updatePlayer(player, world, input, config, dt) {
  const p = config.player;

  if (player.invulnTime > 0) {
    player.invulnTime = Math.max(0, player.invulnTime - dt);
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

  if (input.consume('slam') && !player.onGround) {
    player.vy = p.slamVelocity;
    player.isSlamming = true;
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
