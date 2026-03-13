function randomBetween(randomFn, min, max) {
  return min + randomFn() * (max - min);
}

function makeGround(world, x, width) {
  if (width <= 2) return;
  world.entities.push({
    kind: 'ground',
    x,
    y: world.groundY,
    width,
    height: world.canvasHeight - world.groundY
  });
}

function canSpawnHazard(world, segX, cfg) {
  const minGap = Number(cfg.spawner.minHazardGap || 0);
  if (!minGap) return true;
  return segX - (world.lastHazardX ?? -Infinity) >= minGap;
}

function markHazardSpawn(world, segX) {
  world.lastHazardX = segX;
}

function spawnGapSegment(world, segX, length, cfg, randomFn) {
  const gapMin = Math.max(42, Number(cfg.spawner.gapMinWidth || 88));
  const gapMax = Math.max(gapMin, Number(cfg.spawner.gapMaxWidth || 124));
  const entryMin = Math.max(10, Number(cfg.spawner.gapEntryMin || 26));
  const entryMax = Math.max(entryMin, Number(cfg.spawner.gapEntryMax || 62));

  const desiredGapWidth = randomBetween(randomFn, gapMin, gapMax);
  const maxGapWidth = Math.max(36, length - 26);
  const gapWidth = Math.min(desiredGapWidth, maxGapWidth);

  const maxEntry = Math.max(entryMin, length - gapWidth - 12);
  const entry = Math.min(randomBetween(randomFn, entryMin, entryMax), maxEntry);
  const exit = Math.max(0, length - entry - gapWidth);

  makeGround(world, segX, entry);
  makeGround(world, segX + entry + gapWidth, exit);

  if (randomFn() < cfg.spawner.crystalChance * 1.2) {
    world.entities.push({
      kind: 'crystal',
      x: segX + entry + gapWidth * 0.5 - 10,
      y: world.groundY - randomBetween(randomFn, 148, 188),
      width: 20,
      height: 20
    });
  }
}

export function createSpawner(config) {
  const s = config.spawner;
  let randomFn = Math.random;

  return {
    setRandomProvider(nextRandomFn) {
      randomFn = typeof nextRandomFn === 'function' ? nextRandomFn : Math.random;
    },
    seedInitial(world) {
      for (let i = 0; i < s.segmentLead; i += 1) {
        this.spawnNextSegment(world, config);
      }
    },

    spawnNextSegment(world, cfg) {
      const length = cfg.world.segmentLength;
      const segX = world.nextSegmentX;
      const runDistance = world.distance || 0;
      const graceDistance = Number(s.graceDistance || 0);
      const rampDistance = Math.max(1, Number(s.rampDistance || 1));
      const graceMul = Number(s.graceObstacleMultiplier || 0.2);
      const pressure = runDistance <= graceDistance ? 0 : Math.min(1, (runDistance - graceDistance) / rampDistance);
      const obstacleChance = s.obstacleChance * (graceMul + (1 - graceMul) * pressure);
      const gapChance = s.gapChance * (0.35 + 0.65 * pressure);
      const hazardAllowed = canSpawnHazard(world, segX, cfg);
      const roll = randomFn();

      if (hazardAllowed && roll < gapChance) {
        spawnGapSegment(world, segX, length, cfg, randomFn);
        markHazardSpawn(world, segX);
      } else if (hazardAllowed && roll < gapChance + obstacleChance) {
        makeGround(world, segX, length);
        const obstacleH = randomBetween(randomFn, s.obstacleMinHeight, s.obstacleMaxHeight);
        world.entities.push({
          kind: 'obstacle',
          x: segX + length * 0.45,
          y: world.groundY - obstacleH,
          width: 34,
          height: obstacleH
        });
        markHazardSpawn(world, segX);
      } else {
        makeGround(world, segX, length);
      }

      if (randomFn() < s.crystalChance) {
        world.entities.push({
          kind: 'crystal',
          x: segX + length * 0.72,
          y: world.groundY - randomBetween(randomFn, 120, 210),
          width: 20,
          height: 20
        });
      }

      if (randomFn() < s.heartChance) {
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
