/**
 * Cliente API y Simulador Cuántico Local (v_final.md)
 * Cumple con el paradigma de Batalla Naval Cuántica:
 * - Flota = Qubit
 * - Disparo = Medición 1-shot (50% prob o 75-80% herida)
 * - Fallo (Agua) -> Colapso de superposición -> Revela la flota en la casilla alternativa (100% certeza)
 * - Acierto (Impacto) -> Colapso a Derribada |1⟩ -> Propagación CNOT a flota entrelazada (Estado Herida)
 */

const API_BASE = 'http://localhost:8000';

const FLEET_NAMES = [
  "Fragata Cuántica Alpha",
  "Crucero Estelar Beta",
  "Destructor Qubit Gamma",
  "Submarino Hadamard Delta",
  "Nave Insignia Epsilon",
  "Acorazado Entrelazado Zeta"
];

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

export async function fetchNewGame(level = '1') {
  try {
    const res = await fetch(`${API_BASE}/api/game/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, state: data.state, source: 'qiskit_python' };
    }
  } catch (e) {
    // Fallback a motor local
  }
  return { success: true, state: createLocalQuantumState(level), source: 'qiskit_client_sim' };
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
export function createLocalQuantumState(level = '1') {
  let levelNum = 2;
  let levelName = "Nivel 2: Táctico (4 Flotas - Grid 8x8)";
  let rows = 8;
  let cols = 8;
  let numShips = 4;
  let energy = 1240;
  let coherence = 90.0;
  let entangledPairsCount = 2;

  if (level === '1' || level === 'easy' || level === 1) {
    levelNum = 1;
    levelName = "Nivel 1: Novato (3 Flotas - Grid 6x6)";
    rows = 6;
    cols = 6;
    numShips = 3;
    energy = 1500;
    coherence = 100.0;
    entangledPairsCount = 1;
  } else if (level === '3' || level === 'hard' || level === 3) {
    levelNum = 3;
    levelName = "Nivel 3: Comandante (5 Flotas - Grid 8x8)";
    rows = 8;
    cols = 8;
    numShips = 5;
    energy = 950;
    coherence = 80.0;
    entangledPairsCount = 2;
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
    while (candidates.length < 2 && attempts < 200) {
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

    fleets[fleetId] = {
      id: fleetId,
      name: fleetName,
      status: 'superposition',
      candidate_tiles: candidates,
      secret_real_tile: secretRealTile,
      prob_hit: 0.50,
      circuit_theta: Math.PI / 2,
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
    { time: now, text: `🎮 Nueva Partida (Simulador JS) - ${levelName}. ${numShips} Flotas en Superposición.` }
  ];

  return {
    level_num: levelNum,
    level_name: levelName,
    energy: energy,
    coherence: coherence,
    turns: 0,
    score: 0,
    ships_destroyed: 0,
    total_ships: numShips,
    is_victory: false,
    enemy_attacks_count: 0,
    rows: rows,
    cols: cols,
    cells: Object.values(cells),
    fleets: Object.values(fleets),
    entangled_pairs: entangledPairs,
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

  if (!cell || cell.status === 'water' || cell.status === 'hit') {
    return { success: false, message: 'Celda no válida o ya atacada' };
  }

  let targetFleet = newFleets.find(f => f.status !== 'destroyed' && f.candidate_tiles.includes(cellId));
  const newLog = [...gameState.event_log];
  const now = new Date().toLocaleTimeString('es-ES', { hour12: false });

  let newScore = gameState.score;
  let newShipsDestroyed = gameState.ships_destroyed;
  let newCoherence = gameState.coherence;

  if (!targetFleet) {
    cell.status = 'water';
    newScore = Math.max(0, newScore - 20);
    newCoherence = Math.max(5.0, Number((newCoherence - 1.5).toFixed(1)));
    newLog.unshift({ time: now, text: `🌊 Disparo en ${cellId}: AGUA. Casilla vacía. [-20 pts]` });

    return {
      success: true,
      state: {
        ...gameState,
        turns: gameState.turns + 1,
        score: newScore,
        coherence: newCoherence,
        cells: newCells,
        event_log: newLog
      }
    };
  }

  const isRealLocation = (cellId === targetFleet.secret_real_tile);
  const probHit = targetFleet.prob_hit;
  const roll = Math.random();
  const isHit = isRealLocation && (roll <= probHit);

  if (isHit) {
    // IMPACTO
    targetFleet.status = 'destroyed';
    targetFleet.prob_hit = 1.0;
    cell.status = 'hit';
    newShipsDestroyed += 1;
    const ptsGained = targetFleet.status === 'wounded' ? 250 : 200;
    newScore += ptsGained;
    newLog.unshift({ time: now, text: `💥 ¡IMPACTO DIRECTO en ${cellId}! La ${targetFleet.name} colapsó a Derribada |1⟩. [+{ptsGained} pts]` });

    // CNOT Entanglement
    if (targetFleet.entangled_with) {
      const partner = newFleets.find(f => f.id === targetFleet.entangled_with);
      if (partner && partner.status !== 'destroyed') {
        partner.status = 'wounded';
        partner.prob_hit = 0.78;
        newLog.unshift({ time: now, text: `⚡ ENTLEZAMIENTO CNOT: El colapso de ${targetFleet.name} provocó una rotación en ${partner.name}. ¡Flota entrelazada ahora está HERIDA (P=78%)!` });
      }
    }
  } else {
    // FALLO Y COLAPSO DE SUPERPOSICIÓN
    cell.status = 'water';
    newScore = Math.max(0, newScore - 40);
    newCoherence = Math.max(5.0, Number((newCoherence - 3.0).toFixed(1)));

    const altTile = targetFleet.candidate_tiles.find(t => t !== cellId);
    if (altTile) {
      targetFleet.status = 'revealed';
      targetFleet.candidate_tiles = [altTile];
      targetFleet.secret_real_tile = altTile;
      targetFleet.prob_hit = 1.0;
      newLog.unshift({ time: now, text: `🌊 AGUA en ${cellId}. 🔮 ¡COLAPSO DE SUPERPOSICIÓN! ${targetFleet.name} revelada con 100% de certeza en ${altTile}. [-40 pts]` });
    } else {
      newLog.unshift({ time: now, text: `🌊 AGUA en ${cellId}. [-40 pts]` });
    }
  }

  return {
    success: true,
    state: {
      ...gameState,
      turns: gameState.turns + 1,
      score: newScore,
      ships_destroyed: newShipsDestroyed,
      coherence: newCoherence,
      is_victory: newShipsDestroyed >= gameState.total_ships,
      cells: newCells,
      fleets: newFleets,
      event_log: newLog
    }
  };
}
