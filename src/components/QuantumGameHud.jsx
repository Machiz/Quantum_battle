import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, Zap, Target, Shield, HelpCircle, Activity, RotateCcw, 
  CheckCircle2, AlertTriangle, Info, Play, Flame, Waves, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchNewGame, applyGateApi, measureCellApi, createLocalQuantumState } from '../services/qiskitApi';

export default function QuantumGameHud({ backendInfo }) {
  const [gameState, setGameState] = useState(null);
  const [selectedCellId, setSelectedCellId] = useState('F-06');
  const [loadingAction, setLoadingAction] = useState(false);
  const [level, setLevel] = useState('medium');
  const [activeTabManual, setActiveTabManual] = useState('superposition');
  
  // Referencia al contenedor de la cuadrícula para calcular coordenadas exactas de las líneas SVG de entrelazamiento
  const gridRef = useRef(null);
  const [gridCoords, setGridCoords] = useState({});

  // Cargar juego inicial
  useEffect(() => {
    initGame(level);
  }, [level]);

  const initGame = async (lvl) => {
    setLoadingAction(true);
    const res = await fetchNewGame(lvl);
    if (res && res.state) {
      setGameState(res.state);
      // Seleccionar celda F-06 por defecto si existe
      const f06Exists = res.state.cells.find(c => c.id === 'F-06');
      if (f06Exists) setSelectedCellId('F-06');
      else setSelectedCellId(res.state.cells[0]?.id || 'A-00');
    } else {
      setGameState(createLocalQuantumState(lvl));
    }
    setLoadingAction(false);
  };

  // Recalcular posiciones de celdas para dibujar arcos SVG de entrelazamiento
  const updateGridCoords = () => {
    if (!gridRef.current) return;
    const gridRect = gridRef.current.getBoundingClientRect();
    const cellElements = gridRef.current.querySelectorAll('[data-cell-id]');
    
    const coordsMap = {};
    cellElements.forEach(el => {
      const id = el.getAttribute('data-cell-id');
      const rect = el.getBoundingClientRect();
      coordsMap[id] = {
        x: rect.left - gridRect.left + rect.width / 2,
        y: rect.top - gridRect.top + rect.height / 2
      };
    });
    setGridCoords(coordsMap);
  };

  useEffect(() => {
    updateGridCoords();
    window.addEventListener('resize', updateGridCoords);
    return () => window.removeEventListener('resize', updateGridCoords);
  }, [gameState]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#070a0f] flex items-center justify-center text-[#00e5ff] font-mono">
        <div className="flex flex-col items-center space-y-4">
          <Atom className="w-12 h-12 animate-spin text-[#00e5ff]" />
          <span>INICIALIZANDO MOTOR CUÁNTICO QISKIT...</span>
        </div>
      </div>
    );
  }

  // Encontrar celda seleccionada
  const selectedCell = gameState.cells.find(c => c.id === selectedCellId) || gameState.cells[0];

  // Aplicar compuerta cuántica (H, X, Z)
  const handleApplyGate = async (gateType) => {
    if (!selectedCell || selectedCell.status !== 'superposition' || loadingAction) return;
    
    setLoadingAction(true);
    const apiRes = await applyGateApi(selectedCell.id, gateType);
    
    if (apiRes && apiRes.state) {
      setGameState(apiRes.state);
    } else {
      // Fallback a motor local
      applyLocalGate(selectedCell.id, gateType);
    }
    setLoadingAction(false);
  };

  // Simulador local de compuertas
  const applyLocalGate = (cellId, gateType) => {
    const costMap = { H: 20, X: 10, Z: 15 };
    const cost = costMap[gateType] || 15;
    
    if (gameState.energy < cost) return;

    const newCells = gameState.cells.map(c => {
      if (c.id === cellId) {
        let newPShip = c.prob_ship;
        if (gateType === 'H') {
          // Hadamard equilibra probabilidad
          newPShip = 0.50 + (Math.random() * 0.1 - 0.05);
        } else if (gateType === 'X') {
          // Pauli-X (NOT) invierte probabilidad
          newPShip = 1.0 - c.prob_ship;
        } else if (gateType === 'Z') {
          // Pauli-Z altera la fase
          newPShip = Math.max(0.1, Math.min(0.9, c.prob_ship * 1.15));
        }

        const newPWater = 1.0 - newPShip;
        return {
          ...c,
          prob_ship: Number(newPShip.toFixed(2)),
          prob_water: Number(newPWater.toFixed(2)),
          amp_a: Number(Math.sqrt(newPWater).toFixed(3)),
          amp_b: Number(Math.sqrt(newPShip).toFixed(3)),
          phase: Number((c.phase + (gateType === 'Z' ? 180 : 45)) % 360)
        };
      }
      return c;
    });

    const now = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const newLog = [
      { time: now, text: `Compuerta ${gateType} aplicada en ${cellId} (-${cost} GW)` },
      ...gameState.event_log
    ];

    setGameState({
      ...gameState,
      energy: gameState.energy - cost,
      turns: gameState.turns + 1,
      cells: newCells,
      event_log: newLog
    });
  };

  // Acción Medir / Colapsar
  const handleMeasure = async () => {
    if (!selectedCell || selectedCell.status !== 'superposition' || loadingAction) return;

    setLoadingAction(true);
    const apiRes = await measureCellApi(selectedCell.id);

    if (apiRes && apiRes.state) {
      setGameState(apiRes.state);
      if (apiRes.is_hit) triggerHitConfetti();
    } else {
      measureLocalCell(selectedCell.id);
    }
    setLoadingAction(false);
  };

  const measureLocalCell = (cellId) => {
    const cell = gameState.cells.find(c => c.id === cellId);
    if (!cell) return;

    // Born rule roll
    const roll = Math.random();
    const isHit = cell.is_secret_ship ? (roll <= Math.max(cell.prob_ship, 0.45)) : (roll <= cell.prob_ship * 0.3);

    const newCells = gameState.cells.map(c => {
      if (c.id === cellId) {
        return {
          ...c,
          status: isHit ? 'ship' : 'water',
          prob_ship: isHit ? 1.0 : 0.0,
          prob_water: isHit ? 0.0 : 1.0,
          amp_a: isHit ? 0.0 : 1.0,
          amp_b: isHit ? 1.0 : 0.0,
        };
      }
      // Propagar entrelazamiento si aplica
      if (cell.entangled_with && cell.entangled_with.includes(c.id) && c.status === 'superposition') {
        const delta = isHit ? 0.35 : -0.25;
        const pNew = Math.max(0.05, Math.min(0.95, c.prob_ship + delta));
        return {
          ...c,
          prob_ship: Number(pNew.toFixed(2)),
          prob_water: Number((1.0 - pNew).toFixed(2)),
          amp_a: Number(Math.sqrt(1.0 - pNew).toFixed(3)),
          amp_b: Number(Math.sqrt(pNew).toFixed(3))
        };
      }
      return c;
    });

    const now = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const newLog = [
      { 
        time: now, 
        text: isHit ? `💥 NAVE DETECTADA en ${cellId} (Colapso |1⟩)` : `🌊 Agua confirmada en ${cellId} (Colapso |0⟩)` 
      },
      ...gameState.event_log
    ];

    if (isHit) triggerHitConfetti();

    const newFound = isHit ? gameState.ships_found + 1 : gameState.ships_found;

    setGameState({
      ...gameState,
      ships_found: newFound,
      turns: gameState.turns + 1,
      coherence: Math.max(20, Number((gameState.coherence - 2.1).toFixed(1))),
      cells: newCells,
      event_log: newLog
    });
  };

  const triggerHitConfetti = () => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00e5ff', '#ff3b5c', '#a855f7']
    });
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans p-2 md:p-4 lg:p-6 overflow-x-hidden selection:bg-[#00e5ff] selection:text-black">
      
      {/* 1. TOP HUD HEADER BAR */}
      <header className="hud-panel rounded-2xl p-4 mb-4 border border-[#1b263b] flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        
        {/* Left Stats */}
        <div className="flex items-center space-x-6 md:space-x-8 font-mono text-xs md:text-sm">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">ENERGÍA</div>
            <div className="text-[#00e5ff] font-bold text-lg md:text-xl flex items-center space-x-1">
              <Zap className="w-4 h-4 fill-current text-[#00e5ff]" />
              <span>{gameState.energy.toLocaleString()} <span className="text-xs">GW</span></span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">COHERENCIA</div>
            <div className="text-[#00e5ff] font-bold text-lg md:text-xl flex items-center space-x-1">
              <Activity className="w-4 h-4 text-[#00e5ff]" />
              <span>{gameState.coherence}%</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">NAVES</div>
            <div className="font-bold text-lg md:text-xl flex items-center space-x-1 text-white">
              <span className="text-[#ff3b5c]">{String(gameState.ships_found).padStart(2, '0')}</span>
              <span className="text-slate-500">/</span>
              <span>{String(gameState.total_ships).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Center Title */}
        <div className="text-center hidden lg:block">
          <h1 className="font-display font-black text-xl tracking-widest text-white">
            QUANTUM BATTLESHIP
          </h1>
          <p className="text-[11px] font-mono text-slate-400 tracking-wider">
            RADAR CONTROL HUD • QISKIT BACKEND
          </p>
        </div>

        {/* Right Sector & Turn Badge */}
        <div className="flex items-center space-x-4 font-mono">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">SECTOR DE OPERACIÓN</div>
            <div className="text-slate-200 font-bold text-sm">B-12 / OMEGA</div>
          </div>

          <div className="w-10 h-10 rounded-full border border-[#00e5ff]/50 bg-[#0d1726] flex items-center justify-center text-[#00e5ff] font-bold font-mono text-sm shadow-[0_0_12px_rgba(0,229,255,0.3)]">
            {gameState.turns}
          </div>

          <button
            onClick={() => initGame(level)}
            className="p-2 rounded-xl bg-[#121927] border border-[#1b263b] hover:border-[#00e5ff] text-slate-300 hover:text-[#00e5ff] transition-all"
            title="Reiniciar Partida"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* 2. BARRA DE SELECCIÓN DE LOS 3 NIVELES */}
      <div className="hud-panel rounded-2xl p-3 mb-4 border border-[#1b263b] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Target className="w-4 h-4 text-[#00e5ff]" />
          <span className="font-bold uppercase tracking-wider text-[#00e5ff]">SELECCIONAR NIVEL:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLevel('1')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 ${
              (gameState.level_num === 1 || level === '1')
                ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)] font-bold'
                : 'bg-[#0d1726] border-[#1b263b] text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00e5ff]" />
            <span>Nivel 1: Novato (6x6)</span>
          </button>

          <button
            onClick={() => setLevel('2')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 ${
              (gameState.level_num === 2 || level === '2')
                ? 'bg-[#a855f7]/20 border-[#a855f7] text-[#c084fc] shadow-[0_0_12px_rgba(168,85,247,0.3)] font-bold'
                : 'bg-[#0d1726] border-[#1b263b] text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
            <span>Nivel 2: Táctico (8x8)</span>
          </button>

          <button
            onClick={() => setLevel('3')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 ${
              (gameState.level_num === 3 || level === '3')
                ? 'bg-[#ff3b5c]/20 border-[#ff3b5c] text-[#ff3b5c] shadow-[0_0_12px_rgba(255,59,92,0.3)] font-bold'
                : 'bg-[#0d1726] border-[#1b263b] text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff3b5c]" />
            <span>Nivel 3: Comandante (8x8)</span>
          </button>
        </div>
      </div>

      {/* MAIN HUD 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: EXPLICACIÓN DE CONCEPTOS POR NIVEL */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          <div className="hud-panel p-5 rounded-2xl border border-[#1b263b] flex-1 flex flex-col justify-between">
            
            <div>
              <div className="text-[10px] font-mono text-[#00e5ff] tracking-widest uppercase mb-1 flex items-center justify-between">
                <span>MANUAL DE CAMPO • NIVEL {gameState.level_num || 2}</span>
                <span className="px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[9px]">
                  CONCEPTOS ACTIVOS
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-4">
                {gameState.level_num === 1
                  ? "Nivel 1: Superposición & Entrelazamiento Máximo"
                  : gameState.level_num === 3
                  ? "Nivel 3: Interferencia & Decoherencia Alta"
                  : "Nivel 2: Entrelazamiento Parcial & Compuertas"}
              </h2>

              {/* CONCEPTOS EXPLICADOS A UN LADO POR NIVEL */}
              {gameState.level_num === 1 && (
                <div className="space-y-4">
                  {/* CONCEPTO 1: SUPERPOSICIÓN */}
                  <div className="hud-card p-3.5 rounded-xl border border-[#00e5ff]/30 bg-[#00e5ff]/5">
                    <div className="text-xs font-mono text-[#00e5ff] font-bold mb-1 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>1. Superposición Cuántica (|Ψ⟩)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Las celdas no son agua ni barco antes de medir, sino una superposición: <code className="text-[#00e5ff]">α|0⟩ + β|1⟩</code>. Cada disparo obliga al sistema a colapsar a un estado puro según la regla de Born (<code className="text-[#00e5ff]">P(|1⟩)=|β|²</code>).
                    </p>
                  </div>

                  {/* CONCEPTO 2: ENTRELAZAMIENTO MÁXIMO */}
                  <div className="hud-card p-3.5 rounded-xl border border-[#a855f7]/30 bg-[#a855f7]/5">
                    <div className="text-xs font-mono text-[#c084fc] font-bold mb-1 flex items-center space-x-1.5">
                      <Atom className="w-3.5 h-3.5" />
                      <span>2. Entrelazamiento Máximo (100%)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Dos celdas comparten el Estado de Bell <code className="text-[#c084fc]">(|00⟩+|11⟩)/√2</code>. Al medir la celda A, la celda B entrelazada se resuelve instantáneamente al 100% de la misma forma.
                    </p>
                  </div>

                  {/* CONCEPTO 3: HADAMARD */}
                  <div className="hud-card p-3.5 rounded-xl border border-[#1b263b]">
                    <div className="text-xs font-mono text-slate-200 font-bold mb-1 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#00e5ff]" />
                      <span>3. Compuerta Hadamard (H)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Redistribuye amplitudes creando una superposición balanceada (~50%/50%) para explorar sectores con poca información.
                    </p>
                  </div>
                </div>
              )}

              {gameState.level_num === 2 && (
                <div className="space-y-4">
                  {/* CONCEPTO 1: ENTRELAZAMIENTO PARCIAL */}
                  <div className="hud-card p-3.5 rounded-xl border border-[#a855f7]/40 bg-[#a855f7]/10">
                    <div className="text-xs font-mono text-[#c084fc] font-bold mb-1 flex items-center space-x-1.5">
                      <Atom className="w-3.5 h-3.5" />
                      <span>1. Entrelazamiento Parcial (75%)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Representa <code className="text-[#c084fc]">α|00⟩ + β|11⟩</code> en Qiskit mediante <code className="text-[#c084fc]">RY(θ)+CX</code>. Medir celda A no regala la celda B, sino que eleva su probabilidad al 75%-85%.
                    </p>
                  </div>

                  {/* CONCEPTO 2: PAULI-X */}
                  <div className="hud-card p-3.5 rounded-xl border border-[#ff3b5c]/30 bg-[#ff3b5c]/5">
                    <div className="text-xs font-mono text-[#ff3b5c] font-bold mb-1 flex items-center space-x-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>2. Compuerta Pauli-X (NOT Inversor)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Invierte las amplitudes de probabilidad (<code className="text-[#ff3b5c]">P → 1 - P</code>). Si una celda tiene 15% de nave, aplicar X la eleva a 85%.
                    </p>
                  </div>

                  {/* CONCEPTO 3: GESTIÓN DE RIESGO */}
                  <div className="hud-card p-3.5 rounded-xl border border-[#1b263b]">
                    <div className="text-xs font-mono text-amber-400 font-bold mb-1 flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>3. Toma de Decisiones Tácticas</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      ¿Disparar con 75% o gastar puntos de energía en compuertas para acercar la probabilidad al 95%?
                    </p>
                  </div>
                </div>
              )}

              {gameState.level_num === 3 && (
                <div className="space-y-4">
                  {/* CONCEPTO 1: INTERFERENCIA DE FASE */}
                  <div className="hud-card p-3.5 rounded-xl border border-[#c084fc]/40 bg-[#a855f7]/10">
                    <div className="text-xs font-mono text-[#c084fc] font-bold mb-1 flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      <span>1. Interferencia de Fase (Compuerta Z)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Modifica la fase <code className="text-[#c084fc]">|0⟩ + e^{"iϕ"}|1⟩</code> en Qiskit. Permite sumar amplitudes (interferencia constructiva) o cancelarlas (destructiva).
                    </p>
                  </div>

                  {/* CONCEPTO 2: DECOHERENCIA CUÁNTICA */}
                  <div className="hud-card p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
                    <div className="text-xs font-mono text-amber-400 font-bold mb-1 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>2. Decoherencia Cuántica (Ruido)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      El entorno degrada la coherencia del sistema en cada turno (-3% a -8%). Al bajar del 30%, el radar sufre distorsiones graves.
                    </p>
                  </div>

                  {/* CONCEPTO 3: ATAQUES DE INTERFERENCIA ENEMIGOS */}
                  <div className="hud-card p-3.5 rounded-xl border border-[#ff3b5c]/30 bg-[#ff3b5c]/5">
                    <div className="text-xs font-mono text-[#ff3b5c] font-bold mb-1 flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      <span>3. Pulsos Enemigos de Radar</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      El enemigo emite rotaciones <code className="text-[#ff3b5c]">RZ(π/3)</code> desalineando casillas en superposición y drenando energía.
                    </p>
                  </div>
                </div>
              )}

              {/* TACTICAL COMMANDER QUOTE */}
              <div className="hud-card p-4 rounded-xl border-l-2 border-l-[#00e5ff] border-y border-r border-[#1b263b] italic text-xs text-slate-300 mt-5 bg-[#090d15]/90">
                {gameState.level_num === 1
                  ? '"Comandante, aproveche el entrelazamiento máximo: medir una nave resolverá instantáneamente su celda pareja."'
                  : gameState.level_num === 3
                  ? '"¡Atención! La decoherencia y los pulsos enemigos desalinean las casillas. Use compuertas Z para corregir fases antes de colapsar."'
                  : '"Comandante, el entrelazamiento es parcial (75%). Si la probabilidad no es suficiente, aplique compuerta X para invertir o H para redistribuir."'}
              </div>

            </div>

            {/* SYSTEM STATUS FOOTER */}
            <div className="pt-4 border-t border-[#1b263b] flex items-center justify-between text-[11px] font-mono text-slate-400 mt-6">
              <span>MOTOR QISKIT BACKEND:</span>
              <span className="text-[#00e5ff] font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping inline-block mr-1" />
                {gameState.level_num === 1 ? 'BELL STATE (100%)' : (gameState.level_num === 3 ? 'DECOHERENCE SIM' : 'PARTIAL ENTANGLED')}
              </span>
            </div>

          </div>

        </div>

        {/* CENTER COLUMN: OPERATIONAL RADAR GRID & BOTTOM ACTION PANEL */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          
          {/* RADAR MATRIX CANVAS */}
          <div className="hud-panel p-4 md:p-6 rounded-2xl border border-[#1b263b] flex-1 flex flex-col justify-center items-center relative overflow-hidden grid-bg-overlay min-h-[440px]">
            
            {/* Header matrix label */}
            <div className="w-full flex justify-between items-center mb-4 font-mono text-xs text-slate-400">
              <span className="text-[#00e5ff]">RADAR MATRIZ CUÁNTICA QISKIT</span>
              <span>{gameState.rows}x{gameState.cols} QUBITS</span>
            </div>

            {/* SVG OVERLAY FOR ENTANGLEMENT ARCS */}
            <div ref={gridRef} className="relative w-full max-w-[460px] aspect-square">
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                {gameState.entangled_pairs.map((pair, idx) => {
                  const cA = gridCoords[pair.cell_a];
                  const cB = gridCoords[pair.cell_b];
                  if (!cA || !cB) return null;

                  // Dibujar arco curvado
                  const dx = cB.x - cA.x;
                  const dy = cB.y - cA.y;
                  const cx = (cA.x + cB.x) / 2;
                  const cy = (cA.y + cB.y) / 2 - 35; // curva hacia arriba

                  return (
                    <g key={idx}>
                      <path
                        d={`M ${cA.x} ${cA.y} Q ${cx} ${cy} ${cB.x} ${cB.y}`}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="animate-pulse"
                      />
                      <circle cx={cx} cy={cy} r="4" fill="#a855f7" className="animate-ping" />
                    </g>
                  );
                })}
              </svg>

              {/* GRID BOARD (Dynamic 6x6 or 8x8) */}
              <div className={`grid ${gameState.cols === 6 ? 'grid-cols-6' : 'grid-cols-8'} gap-1.5 w-full h-full`}>
                {gameState.cells.map((cell) => {
                  const isSelected = cell.id === selectedCellId;
                  const isWater = cell.status === 'water';
                  const isShip = cell.status === 'ship';
                  const isEntangled = cell.entangled_with && cell.entangled_with.length > 0;
                  const probPct = Math.round(cell.prob_ship * 100);

                  return (
                    <button
                      key={cell.id}
                      data-cell-id={cell.id}
                      onClick={() => setSelectedCellId(cell.id)}
                      className={`relative flex flex-col items-center justify-center rounded-lg font-mono text-xs transition-all duration-200 aspect-square border ${
                        isSelected
                          ? 'border-[#00e5ff] shadow-[0_0_18px_rgba(0,229,255,0.6)] z-30 scale-105'
                          : isEntangled
                          ? 'cell-entangled-glow border-[#a855f7]/60'
                          : 'border-[#1b263b] hover:border-[#00e5ff]/50'
                      } ${
                        isShip
                          ? 'cell-hit'
                          : isWater
                          ? 'cell-water'
                          : 'cell-superposition'
                      }`}
                    >
                      {/* Sub-capa de llenado dinámico de probabilidad % */}
                      {cell.status === 'superposition' && (
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-[#00e5ff]/15 transition-all duration-300 rounded-b-md"
                          style={{ height: `${probPct}%` }}
                        />
                      )}

                      {/* Display content based on state */}
                      {isWater && (
                        <span className="text-slate-500 font-mono text-xs">|0⟩</span>
                      )}

                      {/* SHIP HIT */}
                      {isShip && (
                        <div className="flex flex-col items-center justify-center text-[#ff3b5c]">
                          <Flame className="w-5 h-5 animate-pulse" />
                          <span className="text-[9px] font-bold mt-0.5">|1⟩</span>
                        </div>
                      )}

                      {/* SUPERPOSITION STATE % */}
                      {cell.status === 'superposition' && (
                        <div className="relative z-10 flex flex-col items-center">
                          <span className={`font-bold ${probPct > 50 ? 'text-[#00e5ff]' : 'text-slate-300'}`}>
                            {probPct}%
                          </span>
                        </div>
                      )}

                      {/* Entanglement indicator dot */}
                      {isEntangled && cell.status === 'superposition' && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

          </div>

          {/* BOTTOM ACTION PANEL & GUÍA TÁCTICA */}
          <div className="hud-panel p-4 rounded-2xl border border-[#1b263b] grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* GATE BUTTONS (8 cols) */}
            <div className="md:col-span-8 grid grid-cols-4 gap-2">
              
              {/* HADAMARD H */}
              <button
                onClick={() => handleApplyGate('H')}
                disabled={loadingAction || selectedCell.status !== 'superposition'}
                className="hud-card p-3 rounded-xl border border-[#00e5ff]/30 hover:border-[#00e5ff] hover:bg-[#00e5ff]/10 disabled:opacity-40 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-xl font-display font-black text-[#00e5ff] group-hover:scale-110 transition-transform">H</span>
                <span className="text-[10px] font-mono text-slate-300 uppercase mt-0.5">HADAMARD</span>
                <span className="text-[9px] font-mono text-[#00e5ff] mt-1 bg-[#00e5ff]/10 px-1.5 py-0.5 rounded">-20 GW</span>
              </button>

              {/* PAULI-X */}
              <button
                onClick={() => handleApplyGate('X')}
                disabled={loadingAction || selectedCell.status !== 'superposition'}
                className="hud-card p-3 rounded-xl border border-[#ff3b5c]/30 hover:border-[#ff3b5c] hover:bg-[#ff3b5c]/10 disabled:opacity-40 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-xl font-display font-black text-[#ff3b5c] group-hover:scale-110 transition-transform">X</span>
                <span className="text-[10px] font-mono text-slate-300 uppercase mt-0.5">INVERTIR</span>
                <span className="text-[9px] font-mono text-[#ff3b5c] mt-1 bg-[#ff3b5c]/10 px-1.5 py-0.5 rounded">-10 GW</span>
              </button>

              {/* PAULI-Z */}
              <button
                onClick={() => handleApplyGate('Z')}
                disabled={loadingAction || selectedCell.status !== 'superposition'}
                className="hud-card p-3 rounded-xl border border-[#a855f7]/30 hover:border-[#a855f7] hover:bg-[#a855f7]/10 disabled:opacity-40 transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className="text-xl font-display font-black text-[#c084fc] group-hover:scale-110 transition-transform">Z</span>
                <span className="text-[10px] font-mono text-slate-300 uppercase mt-0.5">FASE</span>
                <span className="text-[9px] font-mono text-[#c084fc] mt-1 bg-[#a855f7]/10 px-1.5 py-0.5 rounded">-15 GW</span>
              </button>

              {/* ACTION MEDIR (COLAPSAR) */}
              <button
                onClick={handleMeasure}
                disabled={loadingAction || selectedCell.status !== 'superposition'}
                className="hud-card p-3 rounded-xl border border-[#00e5ff] bg-gradient-to-br from-[#00e5ff]/20 to-[#00b8d4]/10 hover:from-[#00e5ff]/30 hover:to-[#00b8d4]/20 disabled:opacity-40 transition-all flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(0,229,255,0.3)] group"
              >
                <span className="text-base font-display font-bold text-white group-hover:scale-105 transition-transform">MEDIR</span>
                <span className="text-[9px] font-mono text-slate-200 uppercase mt-0.5">COLAPSAR ESTADO</span>
                <span className="text-[9px] font-mono text-emerald-400 mt-1">SIN COSTE</span>
              </button>

            </div>

            {/* GUÍA TÁCTICA (4 cols) */}
            <div className="md:col-span-4 hud-card p-3 rounded-xl border border-[#1b263b] flex flex-col justify-center">
              <div className="text-[10px] font-mono text-[#00e5ff] uppercase tracking-wider mb-1 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
                <span>GUÍA TÁCTICA</span>
              </div>
              <p className="text-xs text-slate-300 italic font-sans leading-relaxed">
                "Comandante, la celda {selectedCell.id} muestra {Math.round(selectedCell.prob_ship * 100)}% de probabilidad de nave. Podríamos usar Medir ahora o aplicar H para expandir el mapa."
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: INSPECTOR DE CELDA & REGISTRO DE EVENTOS */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          
          {/* INSPECTOR DE CELDA (Exact visual match to image) */}
          <div className="hud-panel p-5 rounded-2xl border border-[#1b263b]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              INSPECTOR DE CELDA
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-3xl font-mono font-bold text-white">
                {selectedCell.id}
              </h3>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${
                selectedCell.status === 'ship'
                  ? 'bg-[#ff3b5c]/20 border-[#ff3b5c] text-[#ff3b5c]'
                  : selectedCell.status === 'water'
                  ? 'bg-slate-800 border-slate-600 text-slate-400'
                  : 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
              }`}>
                {selectedCell.status === 'ship' ? 'Barco Confirmado' : (selectedCell.status === 'water' ? 'Agua Confirmada' : 'Superposición')}
              </span>
            </div>

            {/* PROBABILITY BREAKDOWN BARS */}
            <div className="space-y-3 font-mono text-xs mb-6">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>|0⟩ (Mar)</span>
                  <span>{Math.round(selectedCell.prob_water * 100)}%</span>
                </div>
                <div className="w-full bg-[#070a0f] h-2 rounded-full overflow-hidden border border-[#1b263b]">
                  <div className="bg-slate-500 h-full transition-all duration-300" style={{ width: `${selectedCell.prob_water * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-[#00e5ff]">
                  <span>|1⟩ (Nave)</span>
                  <span>{Math.round(selectedCell.prob_ship * 100)}%</span>
                </div>
                <div className="w-full bg-[#070a0f] h-2 rounded-full overflow-hidden border border-[#1b263b]">
                  <div className="bg-[#00e5ff] h-full transition-all duration-300" style={{ width: `${selectedCell.prob_ship * 100}%` }} />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
              Esta celda tiene un {Math.round(selectedCell.prob_ship * 100)}% de probabilidad de contener una nave. Aún no existe físicamente en un estado definido.
            </p>

            {/* AMPLITUDE CARDS */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="hud-card p-3 rounded-xl border border-[#1b263b] text-center">
                <div className="text-[10px] text-slate-400 uppercase">AMPLITUD A</div>
                <div className="text-lg font-bold text-slate-200 mt-1">{selectedCell.amp_a}</div>
              </div>

              <div className="hud-card p-3 rounded-xl border border-[#1b263b] text-center">
                <div className="text-[10px] text-slate-400 uppercase">AMPLITUD B</div>
                <div className="text-lg font-bold text-[#00e5ff] mt-1">{selectedCell.amp_b}</div>
              </div>
            </div>

          </div>

          {/* REGISTRO DE EVENTOS */}
          <div className="hud-panel p-5 rounded-2xl border border-[#1b263b] flex-1 flex flex-col min-h-[220px]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>REGISTRO DE EVENTOS</span>
              <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[240px] pr-1 font-mono text-xs text-slate-300">
              {gameState.event_log.map((log, i) => (
                <div key={i} className="flex space-x-2 text-[11px] border-b border-[#1b263b]/50 pb-1.5">
                  <span className="text-slate-500 select-none">{log.time}</span>
                  <span className="text-slate-200">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
