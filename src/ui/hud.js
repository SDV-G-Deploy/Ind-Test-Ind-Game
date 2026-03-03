export function createHud() {
  const panel = document.querySelector('#hudText');

  return {
    render({ player, world, loopMs, promptText = '', mode = 'normal', dailyDate = '', dailyMissions }) {
      const gameOverText = world.gameOver
        ? ` · GAME OVER · distance ${Math.floor(world.distance)} · best ${world.bestDistance}`
        : '';
      const tutorialText = promptText ? ` · ${promptText}` : '';
      const modeText = mode === 'daily' ? ` · Daily ${dailyDate}` : ' · Normal mode';

      const missionText = dailyMissions
        ? ` · Bank ${dailyMissions.bankedCrystals} · Missions ${dailyMissions.missions
            .map((mission) => `${mission.label} (${Math.floor(mission.progress)}/${mission.target})`)
            .join(' | ')}`
        : '';
      panel.textContent = `HP ${player.hp}/${player.maxHP} · Armor ${Math.floor(player.armor)} · Fatigue ${Math.floor(
        player.fatigue
      )} · Crystals ${player.crystals} · Distance ${Math.floor(world.distance)} · ${Math.round(loopMs)}ms${modeText}${missionText}${gameOverText}${tutorialText}`;
    }
  };
}
