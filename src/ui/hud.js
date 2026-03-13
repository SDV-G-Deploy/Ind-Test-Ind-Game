export function createHud() {
  const health = document.querySelector('#hudHealth');
  const armor = document.querySelector('#hudArmor');
  const fatigue = document.querySelector('#hudFatigue');
  const run = document.querySelector('#hudRun');
  const goal = document.querySelector('#hudGoal');
  const status = document.querySelector('#hudStatus');

  return {
    render({ player, world, loopMs, promptText = '', mode = 'normal', dailyDate = '', dailyMissions }) {
      health.textContent = `HP ${player.hp}/${player.maxHP}`;
      armor.textContent = `Armor ${Math.floor(player.armor)}`;
      fatigue.textContent = `Fatigue ${Math.floor(player.fatigue)}/${player.fatigueMax}`;
      run.textContent = `${Math.floor(world.distance)}m · ${player.crystals} crystals`;
      goal.textContent = `Goal ${Math.floor(world.targetDistance)}m · Streak ${player.crystalStreak}/3`;

      const modeText = mode === 'daily' ? `Daily ${dailyDate}` : 'Normal';
      const missionText = dailyMissions
        ? (() => {
            const completed = dailyMissions.missions.filter((mission) => mission.complete).length;
            return ` · Missions ${completed}/${dailyMissions.missions.length} · Bank ${dailyMissions.bankedCrystals}`;
          })()
        : '';
      const recordsText = ` · Best ${world.bestDistance}m / ${world.bestCrystals} crystals`;
      const perfText = ` · ${Math.round(loopMs)}ms`;
      const newRecordText = world.gameOver && (world.newBestDistance || world.newBestCrystals)
        ? ` · NEW RECORD${world.newBestDistance && world.newBestCrystals ? ' (distance + crystals)' : world.newBestDistance ? ' (distance)' : ' (crystals)'}`
        : '';

      const stateText = world.gameOver
        ? world.gameWon
          ? 'VICTORY · Press JUMP to restart'
          : 'GAME OVER · Press JUMP to retry'
        : world.started
          ? 'Running'
          : 'Ready · Press JUMP to start';

      const tutorialText = promptText && world.started && !world.gameOver ? ` · ${promptText}` : '';
      const rewardText = world.lastRewardEvent && world.started && !world.gameOver ? ` · ${world.lastRewardEvent}` : '';
      status.textContent = `${stateText} · Mode ${modeText}${missionText}${recordsText}${perfText}${newRecordText}${rewardText}${tutorialText}`;
    }
  };
}
