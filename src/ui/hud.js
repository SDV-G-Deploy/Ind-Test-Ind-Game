export function createHud() {
  const panel = document.querySelector('#hudText');

  return {
    render({ player, world, loopMs, promptText = '', mode = 'normal', dailyDate = '', dailyMissions }) {
      const gameOverText = world.gameOver
        ? ` · GAME OVER ${Math.floor(world.distance)}m · best ${world.bestDistance}`
        : '';
      const tutorialText = promptText ? ` · ${promptText}` : '';
<<<<<<< codex/implement-milestone-m1-features-sequentially-91zo02
      const modeText = mode === 'daily' ? ` · Daily ${dailyDate}` : ' · Normal';

      const missionText = dailyMissions
        ? (() => {
            const completed = dailyMissions.missions.filter((mission) => mission.complete).length;
            return ` · Missions ${completed}/${dailyMissions.missions.length} · Bank ${dailyMissions.bankedCrystals}`;
          })()
        : '';

      panel.textContent = `HP ${player.hp}/${player.maxHP} · Armor ${Math.floor(player.armor)} · Fatigue ${Math.floor(
        player.fatigue
      )} · Crystals ${player.crystals} · Distance ${Math.floor(world.distance)} · ${Math.round(
        loopMs
      )}ms${modeText}${missionText}${gameOverText}${tutorialText}`;
=======
      const modeText = mode === 'daily' ? ` · Daily ${dailyDate}` : ' · Normal mode';

      const missionText = dailyMissions
        ? ` · Bank ${dailyMissions.bankedCrystals} · Missions ${dailyMissions.missions
            .map((mission) => `${mission.label} (${Math.floor(mission.progress)}/${mission.target})`)
            .join(' | ')}`
        : '';
      panel.textContent = `HP ${player.hp}/${player.maxHP} · Armor ${Math.floor(player.armor)} · Fatigue ${Math.floor(
        player.fatigue
      )} · Crystals ${player.crystals} · Distance ${Math.floor(world.distance)} · ${Math.round(loopMs)}ms${modeText}${missionText}${gameOverText}${tutorialText}`;
>>>>>>> main
    }
  };
}
