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

function getSpawnProfile(world) {
  const progress = Math.min(1, (world.distance || 0) / Math.max(1, world.targetDistance || 1));

  if (progress < 0.3) {
    return {
      progress,
      gapMul: 0.75,
      obstacleMul: 0.82,
      minGapMul: 1.12,
      gapWidthMul: 0.9,
      recoverySegments: 1
    };
  }

  if (progress < 0.75) {
    return {
      progress,
      gapMul: 1,
      obstacleMul: 1,
      minGapMul: 1,
      gapWidthMul: 1,
      recoverySegments: 1
    };
  }

  return {
    progress,
    gapMul: 1.18,
    obstacleMul: 1.12,
    minGapMul: 0.86,
    gapWidthMul: 1.1,
    recoverySegments: 0
  };
}

function canSpawnHazard(world, segX, cfg, profile) {
  if (world.hazardCooldownSegments > 0) return false;

  const minGap = Number(cfg.spawner.minHazardGap || 0) * Number(profile.minGapMul || 1);
  if (!minGap) return true;

  return segX - (world.lastHazardX ?? -Infinity) >= minGap;
}

function markHazardSpawn(world, segX, cooldownSegments) {
  world.lastHazardX = segX;
  world.hazardCooldownSegments = Math.max(0, Number(cooldownSegments || 0));
}

function spawnRecoverySegment(world, segX, length, cfg, randomFn) {
  makeGround(world, segX, length);

  const chance = Math.max(0, Math.min(1, Number(cfg.spawner.recoveryCrystalChance || 0.6)));
  if (randomFn() < chance) {
    const firstX = segX + length * randomBetween(randomFn, 0.45, 0.58);
    const secondX = segX + length * randomBetween(randomFn, 0.64, 0.82);
    world.entities.push({
      kind: 'crystal',
      x: firstX,
      y: world.groundY - randomBetween(randomFn, 122, 148),
      width: 20,
      height: 20
    });
    world.entities.push({
      kind: 'crystal',
      x: secondX,
      y: world.groundY - randomBetween(randomFn, 132, 168),
      width: 20,
      height: 20
    });
  }
}

function spawnGapSegment(world, segX, length, cfg, randomFn, profile) {
  const gapMin = Math.max(42, Number(cfg.spawner.gapMinWidth || 88) * Number(profile.gapWidthMul || 1));
  const gapMax = Math.max(gapMin, Number(cfg.spawner.gapMaxWidth || 124) * Number(profile.gapWidthMul || 1.08));
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

  const arcPoints = [
    {
      x: segX + Math.max(4, entry * 0.72),
      y: world.groundY - randomBetween(randomFn, 118, 140)
    },
    {
      x: segX + entry + gapWidth * 0.5,
      y: world.groundY - randomBetween(randomFn, 154, 186)
    },
    {
      x: segX + entry + gapWidth + Math.max(4, Math.min(28, exit * 0.34)),
      y: world.groundY - randomBetween(randomFn, 124, 148)
    }
  ];

  arcPoints.forEach((point, index) => {
    if (index === 2 && exit < 12) return;
    world.entities.push({
      kind: 'crystal',
      x: point.x,
      y: point.y,
      width: 20,
      height: 20
    });
  });
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
      const profile = getSpawnProfile(world);

      if (world.hazardCooldownSegments > 0) {
        spawnRecoverySegment(world, segX, length, cfg, randomFn);
        world.hazardCooldownSegments -= 1;
        world.nextSegmentX += length;
        return;
      }

      const obstacleChance = s.obstacleChance * (graceMul + (1 - graceMul) * pressure) * profile.obstacleMul;
      const gapChance = s.gapChance * (0.35 + 0.65 * pressure) * profile.gapMul;
      const hazardAllowed = canSpawnHazard(world, segX, cfg, profile);
      const roll = randomFn();

      if (hazardAllowed && roll < gapChance) {
        spawnGapSegment(world, segX, length, cfg, randomFn, profile);
        const cooldown = Number(profile.recoverySegments) + Number(cfg.spawner.recoverySegments || 0);
        markHazardSpawn(world, segX, cooldown);
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
        const cooldown = Number(profile.recoverySegments) + Number(cfg.spawner.lateRecoverySegments || 0);
        markHazardSpawn(world, segX, cooldown);
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
