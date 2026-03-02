export function intersectsAABB(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function resolveGroundCollision(player, groundY) {
  const bottom = player.y + player.height;
  if (bottom >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
    player.jumpsLeft = player.maxJumps;
    player.isSlamming = false;
  }
}
