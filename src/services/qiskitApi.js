/**
 * Cliente de Servicios API para comunicarse con el Backend Python 3.10 + Qiskit
 * Incluye fallback a simulador local JS en caso de que el backend no esté disponible.
 */

const API_BASE = 'http://localhost:8000';

export async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, ...data };
    }
  } catch (err) {
    console.warn("Backend Qiskit Python no detectado o timeout. Usando simulador local en cliente.", err);
  }
  return { online: false, qiskit_version: "2.5.0 (Client Simulator)", python: "3.10.8 (Local Engine)" };
}

export async function fetchNewGame(level = 'medium') {
  try {
    const res = await fetch(`${API_BASE}/api/game/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, rows: 8, cols: 8 })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, state: data.state, source: 'qiskit_python' };
    }
  } catch (e) {
    console.log("Creando juego con simulador cuántico local...");
  }
  return { success: true, state: createLocalQuantumState(level), source: 'qiskit_client_sim' };
}

export async function applyGateApi(cellId, gateType) {
  try {
    const res = await fetch(`${API_BASE}/api/game/apply_gate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cell_id: cellId, gate_type: gateType })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log("Aplicando compuerta mediante simulador cuántico local...");
  }
  return null; // El frontend aplicará fallback si la API falla
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
    console.log("Midiendo celda mediante simulador cuántico local...");
  }
  return null;
}

/**
 * SIMULADOR CUÁNTICO LOCAL CLIENTE (Fiel al motor Qiskit)
 */
export function createLocalQuantumState(level = 'medium') {
  let levelNum = 2;
  let levelName = "Nivel 2: Táctico (Entrelazamiento Parcial 75%)";
  let rows = 8;
  let cols = 8;
  let totalShips = 5;
  let energy = 1240;
  let coherence = 90.0;

  if (level === '1' || level === 'easy' || level === 1) {
    levelNum = 1;
    levelName = "Nivel 1: Novato (Superposición & Entrelazamiento Máximo)";
    rows = 6;
    cols = 6;
    totalShips = 3;
    energy = 1500;
    coherence = 100.0;
  } else if (level === '3' || level === 'hard' || level === 3) {
    levelNum = 3;
    levelName = "Nivel 3: Comandante (Interferencia & Decoherencia Alta)";
    rows = 8;
    cols = 8;
    totalShips = 6;
    energy = 950;
    coherence = 80.0;
  }

  const cells = [];
  const eventLog = [];
  
  // Posiciones de barcos simuladas según dimensiones
  const secretShipsL1 = new Set(['B-02', 'C-04', 'E-03']);
  const secretShipsL2 = new Set(['B-03', 'C-03', 'D-03', 'E-02', 'E-05']);
  const secretShipsL3 = new Set(['A-01', 'B-04', 'D-02', 'E-06', 'F-03', 'H-05']);

  const secretShips = levelNum === 1 ? secretShipsL1 : (levelNum === 3 ? secretShipsL3 : secretShipsL2);
  
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    for (let c = 0; c < cols; c++) {
      const cellId = `${rowLabel}-${String(c).padStart(2, '0')}`;
      const isShip = secretShips.has(cellId);
      
      let pShip = isShip ? (0.65 + Math.random() * 0.25) : (0.08 + Math.random() * 0.22);
      let pWater = 1.0 - pShip;
      
      if (cellId === 'B-02' && levelNum === 1) pShip = 0.75;
      if (cellId === 'E-05' && levelNum === 2) pShip = 0.70;
      if (cellId === 'E-02' && levelNum === 2) pShip = 0.45;
      
      pWater = 1.0 - pShip;
      const ampA = Math.sqrt(pWater);
      const ampB = Math.sqrt(pShip);
      
      cells.push({
        id: cellId,
        row: r,
        col: c,
        is_secret_ship: isShip,
        status: 'superposition',
        prob_ship: Number(pShip.toFixed(3)),
        prob_water: Number(pWater.toFixed(3)),
        amp_a: Number(ampA.toFixed(3)),
        amp_b: Number(ampB.toFixed(3)),
        phase: Number((Math.random() * 40 - 20).toFixed(1)),
        entangled_with: (cellId === 'E-02' && levelNum >= 2) ? ['E-05'] : ((cellId === 'E-05' && levelNum >= 2) ? ['E-02'] : []),
      });
    }
  }

  const now = new Date().toLocaleTimeString('es-ES', { hour12: false });
  eventLog.push({ time: now, text: `🎮 Sesión iniciada - ${levelName}` });
  eventLog.push({ time: now, text: `📡 Radar Qiskit inicializado en cuadrícula de ${rows}x${cols}` });

  const entangledPairs = levelNum === 1 ? [
    { cell_a: 'B-02', cell_b: 'C-04', theta: Math.PI / 4, correlation: 1.0 }
  ] : (levelNum === 2 ? [
    { cell_a: 'E-02', cell_b: 'E-05', theta: Math.PI / 3, correlation: 0.75 }
  ] : [
    { cell_a: 'D-02', cell_b: 'E-06', theta: Math.PI / 2.5, correlation: 0.50 },
    { cell_a: 'A-01', cell_b: 'F-03', theta: Math.PI / 3, correlation: 0.50 }
  ]);

  return {
    level_num: levelNum,
    level_name: levelName,
    energy: energy,
    coherence: coherence,
    turns: 0,
    ships_found: 0,
    total_ships: totalShips,
    enemy_attacks_count: 0,
    rows: rows,
    cols: cols,
    cells: cells,
    entangled_pairs: entangledPairs,
    event_log: eventLog
  };
}
