/**
 * Cliente API y Simulador Cuántico Local (v_final.md)
 * El entrelazamiento CNOT se activa A PARTIR DEL NIVEL 2.
 * Nivel 1 (0 pares entrelazados CNOT - Superposición Pura).
 * Nivel 2 (2 pares entrelazados CNOT).
 * Nivel 3 (4 pares entrelazados CNOT).
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
  "Corbeta CNOT Theta",
  "Cazador Pauli Iota",
  "Dreadnought Bloch Kappa"
];

const HINTS_MAP = {
  1: "Pista Táctica: En el Nivel 1 te enfocas en la Superposición Cuántica (50% prob) sin entrelazamientos. El Entrelazamiento CNOT se desbloquea en el Nivel 2.",
  2: "Pista Táctica: ¡Entrelazamiento CNOT Desbloqueado en Nivel 2! Al derribar una flota enlazada CNOT, el colapso en cascada destruirá también a su pareja parejada.",
  3: "Pista Táctica: En el Nivel 3 (Grid 12x12 con 4 pares CNOT), aprovecha la cascada CNOT para destruir ambas flotas enlazadas tras un solo acierto."
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
  let levelName = "Nivel 1: Novato (Grid 6x6 • 5 Flotas • Superposición Pura)";
  let rows = 6;
  let cols = 6;
  let numShips = 5;
  let energy = 1500;
  let coherence = 100.0;
  let entangledPairsCount = 0; // Sin entrelazamientos en Nivel 1
  let hitPts = 200;
  let woundedHitPts = 250;
  let counterattackDamage = 50;
  let coherenceLossOnMiss = 4.0;
  let targetScore = 225;
  let initialWoundedCount = 0;

  if (level === '2' || level === 'medium' || level === 2) {
    levelNum = 2;
    levelName = "Nivel 2: Táctico (Grid 8x8 • 7 Flotas • Entrelazamiento CNOT)";
    rows = 8;
    cols = 8;
    numShips = 7;
    energy = 1240;
    coherence = 90.0;
    entangledPairsCount = 2; // Entrelazamiento desde Nivel 2
    hitPts = 150;
    woundedHitPts = 180;
    counterattackDamage = 60;
    coherenceLossOnMiss = 5.5;
    targetScore = 450;
    initialWoundedCount = 1;
  } else if (level === '3' || level === 'hard' || level === 3) {
    levelNum = 3;
    levelName = "Nivel 3: Comandante (Grid 12x12 • 9 Flotas • Entrelazamiento Completo)";
    rows = 12;
    cols = 12;
    numShips = 9;
    energy = 950;
    coherence = 80.0;
    entangledPairsCount = 4;
    hitPts = 100;
    woundedHitPts = 120;
    counterattackDamage = 75;
    coherenceLossOnMiss = 7.5;
    targetScore = 700;
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
  const entangledPairs = [];
  if (entangledPairsCount > 0) {
    const shuffledFleetIds = [...fleetIds].sort(() => 0.5 - Math.random());
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
  }

  const currentTurnFleet = fleets[fleetIds[0]];
  const activeTurnTiles = currentTurnFleet ? currentTurnFleet.candidate_tiles : [];

  const now = new Date().toLocaleTimeString('es-ES', { hour12: false });
  const eventLog = [
    { time: now, text: `📡 TURNO 1: Radar escaneó 2 casillas (${activeTurnTiles.join(' y ')}) para ${currentTurnFleet.name}.` },
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
    miss_penalty: counterattackDamage,
    counterattack_damage: counterattackDamage,
    coherence_loss_on_miss: coherenceLossOnMiss,
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
    revealed_entanglements: [],
    current_turn_fleet_id: currentTurnFleet ? currentTurnFleet.id : null,
    active_turn_tiles: activeTurnTiles,
    active_fleet_index: 0,
    event_log: eventLog
  };
}

function getNextSuperpositionFleet(fleets, activeIndex) {
  const activeFleets = Object.values(fleets).filter(
    f => (f.status === 'superposition' || f.status === 'wounded') && f.candidate_tiles.length === 2
  );
  if (activeFleets.length > 0) {
    const idx = activeIndex % activeFleets.length;
    return activeFleets[idx];
  }
  return null;
}

/**
 * Simulador local de medición si falla la API FastAPI
 */
export function localMeasureCell(gameState, cellId) {
  const newCells = gameState.cells.map(c => ({ ...c }));
  const newFleets = gameState.fleets.map(f => ({ ...f, candidate_tiles: [...f.candidate_tiles] }));
  const cell = newCells.find(c => c.id === cellId);
  const revealedEntanglements = [...(gameState.revealed_entanglements || [])];

  if (!cell || cell.status === 'water' || cell.status === 'hit') {
    return { success: false, message: 'Celda no válida o ya atacada' };
  }

  let targetFleet = newFleets.find(
    f => (f.status === 'superposition' || f.status === 'wounded') && f.candidate_tiles.includes(cellId)
  );

  const newLog = [...gameState.event_log];
  const now = new Date().toLocaleTimeString('es-ES', { hour12: false });

  let newScore = gameState.score;
  let newShipsDestroyed = gameState.ships_destroyed;
  let newCoherence = gameState.coherence;
  let newActiveIndex = (gameState.active_fleet_index || 0) + 1;

  const hitPts = gameState.hit_pts || (gameState.level_num === 1 ? 200 : (gameState.level_num === 2 ? 150 : 100));
  const woundedHitPts = gameState.level_num === 1 ? 250 : (gameState.level_num === 2 ? 180 : 120);
  const counterattackDamage = gameState.counterattack_damage || (gameState.level_num === 1 ? 50 : (gameState.level_num === 2 ? 60 : 75));
  const cohLoss = gameState.coherence_loss_on_miss || (gameState.level_num === 1 ? 4.0 : (gameState.level_num === 2 ? 5.5 : 7.5));

  if (!targetFleet) {
    cell.status = 'water';
    newScore = Math.max(0, newScore - counterattackDamage);
    newCoherence = Math.max(0.0, Number((newCoherence - cohLoss).toFixed(1)));
    newLog.unshift({ time: now, text: `🌊 AGUA en ${cellId}. ⚠️ ¡CONTRAATAQUE ENEMIGO! [-${counterattackDamage} Pts]` });

    const nextFleet = getNextSuperpositionFleet(newFleets, newActiveIndex);
    if (nextFleet) {
      newLog.unshift({ time: now, text: `📡 TURNO ${gameState.turns + 2}: Radar presenta el siguiente enlace (${nextFleet.candidate_tiles.join(' y ')}) para ${nextFleet.name}.` });
    }

    const allResolved = newFleets.every(f => f.status === 'destroyed' || f.status === 'revealed');
    const passedScore = newScore >= gameState.target_score;

    return {
      success: true,
      state: {
        ...gameState,
        turns: gameState.turns + 1,
        score: newScore,
        coherence: newCoherence,
        all_ships_destroyed: allResolved,
        passed_score: passedScore,
        passed_game: allResolved && passedScore,
        failed_game: (allResolved && !passedScore) || (newCoherence <= 0),
        current_turn_fleet_id: nextFleet ? nextFleet.id : null,
        active_turn_tiles: nextFleet ? nextFleet.candidate_tiles : [],
        active_fleet_index: newActiveIndex,
        revealed_entanglements: revealedEntanglements,
        cells: newCells,
        fleets: newFleets,
        event_log: newLog
      }
    };
  }

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
    newLog.unshift({ time: now, text: `💥 ¡ACIERTO DIRECTO en ${cellId}! ${targetFleet.name} colapsó a Derribada |1⟩. [+{ptsGained} pts]` });

    if (targetFleet.entangled_with) {
      const partner = newFleets.find(f => f.id === targetFleet.entangled_with);
      if (partner && partner.status !== 'destroyed') {
        const partnerWasWounded = (partner.status === 'wounded');
        partner.status = 'destroyed';
        partner.prob_hit = 1.0;
        newShipsDestroyed += 1;

        const partnerPts = partnerWasWounded ? woundedHitPts : hitPts;
        newScore += partnerPts;

        const partnerTile = partner.secret_real_tile;
        const partnerCell = newCells.find(c => c.id === partnerTile);
        if (partnerCell) {
          partnerCell.status = 'hit';
        }

        revealedEntanglements.push({
          tile_a: cellId,
          tile_b: partnerTile,
          fleet_a_id: targetFleet.id,
          fleet_b_id: partner.id,
          fleet_a_name: targetFleet.name,
          fleet_b_name: partner.name
        });
        newLog.unshift({ time: now, text: `⚡ ¡COLAPSO CNOT EN CASCADA! El derribo de ${targetFleet.name} destruyó instantáneamente a ${partner.name} en ${partnerTile} por entrelazamiento. [+{partnerPts} Pts Bonus]` });
      }
    }
  } else {
    cell.status = 'water';
    newScore = Math.max(0, newScore - counterattackDamage);
    newCoherence = Math.max(0.0, Number((newCoherence - cohLoss).toFixed(1)));

    const altTile = targetFleet.candidate_tiles.find(t => t !== cellId);
    if (altTile) {
      targetFleet.status = 'revealed';
      targetFleet.candidate_tiles = [altTile];
      targetFleet.secret_real_tile = altTile;
      targetFleet.prob_hit = 1.0;
      newLog.unshift({ time: now, text: `🌊 FALLO en ${cellId}. 🔮 BARCO REVELADO EN ${altTile} (Casilla deshabilitada). ⚠️ ¡CONTRAATAQUE ENEMIGO! [-${counterattackDamage} Pts]` });
    } else {
      newLog.unshift({ time: now, text: `🌊 FALLO en ${cellId}. ⚠️ ¡CONTRAATAQUE ENEMIGO! [-${counterattackDamage} Pts]` });
    }
  }

  const nextFleet = getNextSuperpositionFleet(newFleets, newActiveIndex);
  if (nextFleet && nextFleet.candidate_tiles) {
    newLog.unshift({ time: now, text: `📡 TURNO ${gameState.turns + 2}: Radar presenta el siguiente enlace (${nextFleet.candidate_tiles.join(' y ')}) para ${nextFleet.name}.` });
  }

  const allResolved = newFleets.every(f => f.status === 'destroyed' || f.status === 'revealed');
  const passedScore = newScore >= gameState.target_score;

  return {
    success: true,
    state: {
      ...gameState,
      turns: gameState.turns + 1,
      score: newScore,
      ships_destroyed: newShipsDestroyed,
      coherence: newCoherence,
      all_ships_destroyed: allResolved,
      passed_score: passedScore,
      passed_game: allResolved && passedScore,
      failed_game: (allResolved && !passedScore) || (newCoherence <= 0),
      current_turn_fleet_id: nextFleet ? nextFleet.id : null,
      active_turn_tiles: nextFleet ? nextFleet.candidate_tiles : [],
      active_fleet_index: newActiveIndex,
      revealed_entanglements: revealedEntanglements,
      cells: newCells,
      fleets: newFleets,
      event_log: newLog
    }
  };
}
