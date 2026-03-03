const STORAGE_KEY = 'runner.dailyMissions.v0';

const MISSION_POOL = [
  { id: 'distance_200', label: 'Travel 200 distance', target: 200, reward: 20, metric: 'distance' },
  { id: 'distance_350', label: 'Travel 350 distance', target: 350, reward: 35, metric: 'distance' },
  { id: 'crystals_8', label: 'Collect 8 crystals', target: 8, reward: 20, metric: 'crystals' },
  { id: 'crystals_15', label: 'Collect 15 crystals', target: 15, reward: 35, metric: 'crystals' },
  { id: 'runs_3', label: 'Start 3 runs', target: 3, reward: 15, metric: 'runs' },
  { id: 'runs_5', label: 'Start 5 runs', target: 5, reward: 30, metric: 'runs' }
];

function hashStringToSeed(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickMissions(dateKey) {
  const rng = mulberry32(hashStringToSeed(`missions:${dateKey}`));
  const pool = [...MISSION_POOL];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, 3).map((mission) => ({ ...mission, progress: 0, complete: false, claimed: false }));
}

function createFreshState(dateKey, bankedCrystals = 0) {
  return { dateKey, missions: pickMissions(dateKey), bankedCrystals };
}

function loadState(dateKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createFreshState(dateKey, 0);
    const parsed = JSON.parse(raw);
    const bankedCrystals = Number(parsed.bankedCrystals || 0);
    if (parsed.dateKey !== dateKey || !Array.isArray(parsed.missions)) {
      return createFreshState(dateKey, bankedCrystals);
    }
    return {
      dateKey,
      bankedCrystals,
      missions: parsed.missions.map((mission) => ({
        ...mission,
        progress: Number(mission.progress || 0),
        complete: Boolean(mission.complete),
        claimed: Boolean(mission.claimed)
      }))
    };
  } catch {
    return createFreshState(dateKey, 0);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createDailyMissions({ getDateKey }) {
  let state = loadState(getDateKey());

  function ensureCurrentDay() {
    const currentDate = getDateKey();
    if (state.dateKey !== currentDate) {
      state = createFreshState(currentDate, state.bankedCrystals);
      saveState(state);
    }
  }

  function advanceMission(metric, amount) {
    if (amount <= 0) return;
    ensureCurrentDay();
    let changed = false;

    state.missions.forEach((mission) => {
      if (mission.metric !== metric || mission.claimed) return;

      const nextProgress = Math.min(mission.target, mission.progress + amount);
      if (nextProgress !== mission.progress) {
        mission.progress = nextProgress;
        changed = true;
      }

      if (!mission.complete && mission.progress >= mission.target) {
        mission.complete = true;
        mission.claimed = true;
        state.bankedCrystals += mission.reward;
        changed = true;
      }
    });

    if (changed) saveState(state);
  }

  return {
    onRunStart() {
      advanceMission('runs', 1);
    },
    updateProgress({ distanceDelta = 0, crystalsDelta = 0 }) {
      advanceMission('distance', distanceDelta);
      advanceMission('crystals', crystalsDelta);
    },
    getSnapshot() {
      ensureCurrentDay();
      return {
        dateKey: state.dateKey,
        bankedCrystals: state.bankedCrystals,
        missions: state.missions.map((mission) => ({
          id: mission.id,
          label: mission.label,
          progress: mission.progress,
          target: mission.target,
          reward: mission.reward,
          complete: mission.complete
        }))
      };
    }
  };
}
