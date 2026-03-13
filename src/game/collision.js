export function intersectsAABB(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function hasGroundUnderPlayer(world, playerLeft, playerRight) {
  for (let i = world.entities.length - 1; i >= 0; i -= 1) {
    const entity = world.entities[i];
    if (entity.kind !== 'ground') continue;
    if (entity.x < playerRight && entity.x + entity.width > playerLeft) {
      return true;
    }
  }
  return false;
}

export function resolveGroundCollision(player, world) {
  const supportInset = Math.max(4, player.width * 0.14);
  const playerLeft = player.x + world.cameraX + supportInset;
  const playerRight = player.x + world.cameraX + player.width - supportInset;
  const supported = hasGroundUnderPlayer(world, playerLeft, playerRight);
  const bottom = player.y + player.height;

  if (supported && player.vy >= 0 && bottom >= world.groundY) {
    player.y = world.groundY - player.height;
    player.vy = 0;
    player.onGround = true;
    player.jumpsLeft = player.maxJumps;
    player.isSlamming = false;
    return;
  }

  player.onGround = false;
}
