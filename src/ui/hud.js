export function createHud() {
  const panel = document.querySelector('#hudText');

  return {
    render({ player, world, loopMs, promptText = '', mode = 'normal', dailyDate = '', dailyMissions }) {
      const modeText = mode === 'daily' ? ` · Daily ${dailyDate}` : ' · Normal';
      const objectiveText = ` · Goal ${Math.floor(world.targetDistance)}m`;

      const missionText = dailyMissions
        ? (() => {
            const completed = dailyMissions.missions.filter((mission) => mission.complete).length;
            return ` · Missions ${completed}/${dailyMissions.missions.length} · Bank ${dailyMissions.bankedCrystals}`;
          })()
        : '';

      const stateText = world.gameOver
        ? world.gameWon
          ? ` · VICTORY! Press JUMP to play again`
          : ` · GAME OVER! Press JUMP to retry`
        : world.started
          ? ' · Running'
          : ' · Press JUMP to start';

      const tutorialText = promptText && world.started && !world.gameOver ? ` · ${promptText}` : '';

      panel.textContent = `HP ${player.hp}/${player.maxHP} · Armor ${Math.floor(player.armor)} · Fatigue ${Math.floor(
        player.fatigue
      )} · Crystals ${player.crystals} · Distance ${Math.floor(world.distance)} · ${Math.round(
        loopMs
      )}ms${modeText}${objectiveText}${missionText}${stateText}${tutorialText}`;
    }
  };
}
