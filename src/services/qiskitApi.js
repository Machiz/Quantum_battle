/**
 * Cliente API y Simulador Cuántico Local (v_final.md)
 * Niebla de Radar Inicial: Todas las casillas se ven uniformes al inicio.
 * Revelación progresiva al medir casillas.
 */

const API_BASE = 'http://localhost:8000';

const FLEET_NAMES = [
  "Fragata Cuántica Alpha",
  "Crucero Estelar Beta",
  "Destructor Qubit Gamma",
  "Submarino Hadamard Delta",
  "Nave Insignia Epsilon",
  "Acorazado Entrelazado Zeta",
  "Portaaviones Cuántico Eta",
  "Corbeta CNOT Theta"
];

const HINTS_MAP = {
  1: "Pista Táctica: Para alcanzar los 450 pts mínimos requeridos en el Nivel 1, evita disparar a ciegas en casillas vacías. Enfócate en las casillas en Superposición (50%) para forzar el Colapso de Onda o activar Entrelazamiento CNOT y rematar Flotas Heridas (+250 pts).",
  2: "Pista Táctica: En el tablero 8x8 con 5 flotas, explora el tablero para descubrir la flota HERIDA inicial (78% prob). Atácala para asegurar impacto y sumar bonus.",
  3: "Pista Táctica: En el tablero 12x12 con 7 flotas, identifica rápidamente las flotas HERIDAS (78% prob) marcadas con fuego 🔥 conforme descubres el espacio probabilístico."
};

export async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, ...data };
    }
  } catch (err) {
    // Backend fallback
  }
  return { online: false, qiskit_version: "2.5.0 (Simulador JS)", python: "3.10.8 (Local)" };
}

export async function fetchNewGame(level = '1', currentScore = 0) {
  try {
    const res = await fetch(`${API_BASE}/api/game/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level })
    });
    if (res.ok) {
      const data = await res.json();
      if (currentScore > 0 && data.state) {
        data.state.score = currentScore;
      }
      return { success: true, state: data.state, source: 'qiskit_python' };
    }
  } catch (e) {
    // Fallback a motor local
  }
  return { success: true, state: createLocalQuantumState(level, currentScore), source: 'qiskit_client_sim' };
}

export async function measureCellApi(cellId) {
  try {
    const res = await fetch(`${API_BASE}/api/game/measure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cell_id: cellId })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }
  return null;
}

/**
 * SIMULADOR CUÁNTICO LOCAL CLIENTE (Fiel a v_final.md)
 */
export function createLocalQuantumState(level = '1', initialScore = 0) {
  let levelNum = 1;
  let levelName = "Nivel 1: Novato (Grid 6x6 • 3 Flotas)";
  let rows = 6;
  let cols = 6;
  let numShips = 3;
  let energy = 1500;
  let coherence = 100.0;
  let entangledPairsCount = 1;
  let hitPts = 200;
  let woundedHitPts = 250;
  let missPenalty = 40;
  let targetScore = 450;
  let initialWoundedCount = 0;

  if (level === '2' || level === 'medium' || level === 2) {
    levelNum = 2;
    levelName = "Nivel 2: Táctico (Grid 8x8 • 5 Flotas)";
    rows = 8;
    cols = 8;
    numShips = 5;
    energy = 1240;
    coherence = 90.0;
    entangledPairsCount = 2;
    hitPts = 150;
    woundedHitPts = 180;
    missPenalty = 50;
    targetScore = 900;
    initialWoundedCount = 1;
  } else if (level === '3' || level === 'hard' || level === 3) {
    levelNum = 3;
    levelName = "Nivel 3: Comandante (Grid 12x12 • 7 Flotas)";
    rows = 12;
    cols = 12;
    numShips = 7;
    energy = 950;
    coherence = 80.0;
    entangledPairsCount = 3;
    hitPts = 100;
    woundedHitPts = 120;
    missPenalty = 60;
    targetScore = 1400;
    initialWoundedCount = 2;
  }

  const cells = {};
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    for (let c = 0; c < cols; c++) {
      const cellId = `${rowLabel}-${String(c).padStart(2, '0')}`;
      cells[cellId] = {
        id: cellId,
        row: r,
        col: c,
        status: 'empty',
        candidate_fleets: []
      };
    }
  }

  const usedTiles = new Set();
  const fleets = {};
  const fleetIds = [];

  for (let i = 0; i < numShips; i++) {
    const fleetId = `fleet_${i + 1}`;
    const fleetName = FLEET_NAMES[i % FLEET_NAMES.length];

    const candidates = [];
    let attempts = 0;
    while (candidates.length < 2 && attempts < 300) {
      attempts++;
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      const tId = `${String.fromCharCode(65 + r)}-${String(c).padStart(2, '0')}`;
      if (!usedTiles.has(tId) && !candidates.includes(tId)) {
        candidates.push(tId);
      }
    }

    if (candidates.length < 2) {
      const allPossible = Object.keys(cells);
      candidates.push(allPossible[Math.floor(Math.random() * allPossible.length)]);
      candidates.push(allPossible[Math.floor(Math.random() * allPossible.length)]);
    }

    candidates.forEach(tId => {
      usedTiles.add(tId);
      cells[tId].candidate_fleets.push(fleetId);
    });

    const secretRealTile = candidates[Math.floor(Math.random() * candidates.length)];

    const isInitialWounded = (i < initialWoundedCount);
    const status = isInitialWounded ? 'wounded' : 'superposition';
    const probHit = isInitialWounded ? 0.78 : 0.50;
    const theta = isInitialWounded ? (0.72 * Math.PI) : (Math.PI / 2);

    fleets[fleetId] = {
      id: fleetId,
      name: fleetName,
      status: status,
      candidate_tiles: candidates,
      secret_real_tile: secretRealTile,
      prob_hit: probHit,
      circuit_theta: theta,
      entangled_with: null
    };
    fleetIds.push(fleetId);
  }

  // Entrelazamientos
  const shuffledFleetIds = [...fleetIds].sort(() => 0.5 - Math.random());
  const entangledPairs = [];
  let pairsMade = 0;

  for (let i = 0; i < shuffledFleetIds.length - 1; i += 2) {
    if (pairsMade >= entangledPairsCount) break;
    const f1Id = shuffledFleetIds[i];
    const f2Id = shuffledFleetIds[i + 1];

    fleets[f1Id].entangled_with = f2Id;
    fleets[f2Id].entangled_with = f1Id;

    entangledPairs.push({
      fleet_a: f1Id,
      fleet_b: f2Id,
      fleet_a_name: fleets[f1Id].name,
      fleet_b_name: fleets[f2Id].name
    });
    pairsMade++;
  }

  const now = new Date().toLocaleTimeString('es-ES', { hour12: false });
  const eventLog = [
    { time: now, text: `🎮 Misión Iniciada (Simulador JS) - ${levelName}. Puntos Objetivo: ${targetScore} Pts.` }
  ];

  return {
    level_num: levelNum,
    level_name: levelName,
    energy: energy,
    coherence: coherence,
    turns: 0,
    score: initialScore,
    ships_destroyed: 0,
    total_ships: numShips,
    target_score: targetScore,
    hit_pts: hitPts,
    miss_penalty: missPenalty,
    all_ships_destroyed: false,
    passed_score: initialScore >= targetScore,
    passed_game: false,
    failed_game: false,
    tactical_hint: HINTS_MAP[levelNum] || "",
    enemy_attacks_count: 0,
    rows: rows,
    cols: cols,
    cells: Object.values(cells),
    fleets: Object.values(fleets),
    entangled_pairs: entangledPairs,
    discovered_fleets: [],
    event_log: eventLog
  };
}

/**
 * Simulador local de medición si falla la API FastAPI
 */
export function localMeasureCell(gameState, cellId) {
  const newCells = gameState.cells.map(c => ({ ...c }));
  const newFleets = gameState.fleets.map(f => ({ ...f, candidate_tiles: [...f.candidate_tiles] }));
  const cell = newCells.find(c => c.id === cellId);
  const discoveredFleets = new Set(gameState.discovered_fleets || []);

  if (!cell || cell.status === 'water' || cell.status === 'hit') {
    return { success: false, message: 'Celda no válida o ya atacada' };
  }

  let targetFleet = newFleets.find(f => f.status !== 'destroyed' && f.candidate_tiles.includes(cellId));
  const newLog = [...gameState.event_log];
  const now = new Date().toLocaleTimeString('es-ES', { hour12: false });

  let newScore = gameState.score;
  let newShipsDestroyed = gameState.ships_destroyed;
  let newCoherence = gameState.coherence;

  const hitPts = gameState.hit_pts || (gameState.level_num === 1 ? 200 : (gameState.level_num === 2 ? 150 : 100));
  const woundedHitPts = gameState.level_num === 1 ? 250 : (gameState.level_num === 2 ? 180 : 120);
  const missPenalty = gameState.miss_penalty || (gameState.level_num === 1 ? 40 : (gameState.level_num === 2 ? 50 : 60));

  if (!targetFleet) {
    cell.status = 'water';
    newScore = Math.max(0, newScore - missPenalty);
    newCoherence = Math.max(0.0, Number((newCoherence - 2.0).toFixed(1)));
    newLog.unshift({ time: now, text: `🌊 Disparo en ${cellId}: AGUA. Casilla vacía. [-${missPenalty} pts]` });

    const allDestroyed = newShipsDestroyed >= gameState.total_ships;
    const passedScore = newScore >= gameState.target_score;

    return {
      success: true,
      state: {
        ...gameState,
        turns: gameState.turns + 1,
        score: newScore,
        coherence: newCoherence,
        all_ships_destroyed: allDestroyed,
        passed_score: passedScore,
        passed_game: allDestroyed && passedScore,
        failed_game: (allDestroyed && !passedScore) || (newCoherence <= 0),
        discovered_fleets: Array.from(discoveredFleets),
        cells: newCells,
        event_log: newLog
      }
    };
  }

  discoveredFleets.add(targetFleet.id);

  const isRealLocation = (cellId === targetFleet.secret_real_tile);
  const probHit = targetFleet.prob_hit;
  const roll = Math.random();
  const isHit = isRealLocation && (roll <= probHit);

  if (isHit) {
    const wasWounded = (targetFleet.status === 'wounded');
    targetFleet.status = 'destroyed';
    targetFleet.prob_hit = 1.0;
    cell.status = 'hit';
    newShipsDestroyed += 1;
    const ptsGained = wasWounded ? woundedHitPts : hitPts;
    newScore += ptsGained;
    newLog.unshift({ time: now, text: `💥 ¡IMPACTO DIRECTO en ${cellId}! La ${targetFleet.name} colapsó a Derribada |1⟩. [+{ptsGained} pts]` });

    if (targetFleet.entangled_with) {
      const partner = newFleets.find(f => f.id === targetFleet.entangled_with);
      if (partner && partner.status !== 'destroyed') {
        partner.status = 'wounded';
        partner.prob_hit = 0.78;
        discoveredFleets.add(partner.id);
        newLog.unshift({ time: now, text: `⚡ ENTLEZAMIENTO CNOT: El colapso de ${targetFleet.name} provocó una rotación en ${partner.name}. ¡Flota entrelazada ahora está HERIDA (P=78%)!` });
      }
    }
  } else {
    cell.status = 'water';
    newScore = Math.max(0, newScore - missPenalty);
    newCoherence = Math.max(0.0, Number((newCoherence - 3.5).toFixed(1)));

    const altTile = targetFleet.candidate_tiles.find(t => t !== cellId);
    if (altTile) {
      targetFleet.status = 'revealed';
      targetFleet.candidate_tiles = [altTile];
      targetFleet.secret_real_tile = altTile;
      targetFleet.prob_hit = 1.0;
      newLog.unshift({ time: now, text: `🌊 AGUA en ${cellId}. 🔮 ¡COLAPSO DE SUPERPOSICIÓN! ${targetFleet.name} revelada con 100% de certeza en ${altTile}. [-${missPenalty} pts]` });
    } else {
      newLog.unshift({ time: now, text: `🌊 AGUA en ${cellId}. [-${missPenalty} pts]` });
    }
  }

  const allDestroyed = newShipsDestroyed >= gameState.total_ships;
  const passedScore = newScore >= gameState.target_score;

  return {
    success: true,
    state: {
      ...gameState,
      turns: gameState.turns + 1,
      score: newScore,
      ships_destroyed: newShipsDestroyed,
      coherence: newCoherence,
      all_ships_destroyed: allDestroyed,
      passed_score: passedScore,
      passed_game: allDestroyed && passedScore,
      failed_game: (allDestroyed && !passedScore) || (newCoherence <= 0),
      discovered_fleets: Array.from(discoveredFleets),
      cells: newCells,
      fleets: newFleets,
      event_log: newLog
    }
  };
}
