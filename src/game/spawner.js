function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function makeGround(world, x, width) {
  world.entities.push({
    kind: 'ground',
    x,
    y: world.groundY,
    width,
    height: world.canvasHeight - world.groundY
  });
}

export function createSpawner(config) {
  const s = config.spawner;

  return {
    seedInitial(world) {
      for (let i = 0; i < s.segmentLead; i += 1) {
        this.spawnNextSegment(world, config);
      }
    },

    spawnNextSegment(world, cfg) {
      const length = cfg.world.segmentLength;
      const segX = world.nextSegmentX;
      const roll = Math.random();

      if (roll < s.gapChance) {
        // gap segment: no ground, maybe reward for risky jump
        if (Math.random() < s.crystalChance) {
          world.entities.push({
            kind: 'crystal',
            x: segX + length * 0.5,
            y: world.groundY - 170,
            width: 22,
            height: 22
          });
        }
      } else if (roll < s.gapChance + s.obstacleChance) {
        makeGround(world, segX, length);
        const obstacleH = randomBetween(s.obstacleMinHeight, s.obstacleMaxHeight);
        world.entities.push({
          kind: 'obstacle',
          x: segX + length * 0.45,
          y: world.groundY - obstacleH,
          width: 34,
          height: obstacleH
        });
      } else {
        makeGround(world, segX, length);
      }

      if (Math.random() < s.crystalChance) {
        world.entities.push({
          kind: 'crystal',
          x: segX + length * 0.72,
          y: world.groundY - randomBetween(120, 210),
          width: 20,
          height: 20
        });
      }

      if (Math.random() < s.heartChance) {
        world.entities.push({
          kind: 'heart',
          x: segX + length * 0.25,
          y: world.groundY - 135,
          width: 20,
          height: 20
        });
      }

      world.nextSegmentX += length;
    }
  };
}
