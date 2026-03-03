export function createHud() {
  const panel = document.querySelector('.topbar');

  return {
    render({ player, world, loopMs }) {
      const gameOverText = world.gameOver
        ? ` · GAME OVER · distance ${Math.floor(world.distance)} · best ${world.bestDistance}`
        : '';
      panel.textContent = `HP ${player.hp}/${player.maxHP} · Armor ${Math.floor(player.armor)} · Fatigue ${Math.floor(
        player.fatigue
      )} · Crystals ${player.crystals} · Distance ${Math.floor(world.distance)} · ${Math.round(loopMs)}ms${gameOverText}`;
    }
  };
}
