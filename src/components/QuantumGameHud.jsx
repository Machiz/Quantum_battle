import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, Zap, Target, Shield, HelpCircle, Activity, RotateCcw, 
  CheckCircle2, AlertTriangle, Info, Play, Flame, Waves, Sparkles,
  Crosshair, Radio, Eye, Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchNewGame, measureCellApi, createLocalQuantumState, localMeasureCell } from '../services/qiskitApi';

export default function QuantumGameHud({ backendInfo }) {
  const [gameState, setGameState] = useState(null);
  const [selectedCellId, setSelectedCellId] = useState('A-00');
  const [loadingAction, setLoadingAction] = useState(false);
  const [level, setLevel] = useState('1');
  const [showRulesModal, setShowRulesModal] = useState(false);

  const gridRef = useRef(null);
  const [gridCoords, setGridCoords] = useState({});

  // Cargar nueva partida al cambiar nivel
  useEffect(() => {
    initGame(level);
  }, [level]);

  const initGame = async (lvl) => {
    setLoadingAction(true);
    const res = await fetchNewGame(lvl);
    if (res && res.state) {
      setGameState(res.state);
      setSelectedCellId(res.state.cells[0]?.id || 'A-00');
    } else {
      const localState = createLocalQuantumState(lvl);
      setGameState(localState);
      setSelectedCellId(localState.cells[0]?.id || 'A-00');
    }
    setLoadingAction(false);
  };

  // Recalcular posiciones exactas de celdas para dibujar SVG de superposición y entrelazamiento CNOT
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

  // Celebración con confetti al ganar
  useEffect(() => {
    if (gameState?.is_victory) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [gameState?.is_victory]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#070a0f] flex items-center justify-center text-[#00e5ff] font-mono">
        <div className="flex flex-col items-center space-y-4">
          <Atom className="w-12 h-12 animate-spin text-[#00e5ff]" />
          <span className="tracking-widest">INICIALIZANDO MOTOR CUÁNTICO QISKIT (v_final.md)...</span>
        </div>
      </div>
    );
  }

  // Ejecutar Disparo / Medición
  const handleMeasure = async (cellIdToMeasure) => {
    const targetId = cellIdToMeasure || selectedCellId;
    if (!targetId || loadingAction) return;

    setLoadingAction(true);
    const apiRes = await measureCellApi(targetId);

    if (apiRes && apiRes.state) {
      setGameState(apiRes.state);
    } else {
      // Fallback simulador JS local
      const localRes = localMeasureCell(gameState, targetId);
      if (localRes.success) {
        setGameState(localRes.state);
      }
    }
    setLoadingAction(false);
  };

  // Encontrar celda seleccionada actual
  const selectedCell = gameState.cells.find(c => c.id === selectedCellId) || gameState.cells[0];

  // Encontrar flotas asociadas a la celda seleccionada
  const fleetsAtSelectedCell = gameState.fleets.filter(
    f => f.status !== 'destroyed' && f.candidate_tiles.includes(selectedCellId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header / Tactical HUD Status Bar */}
      <div className="bg-[#0b1329]/80 backdrop-blur-md border border-[#00e5ff]/30 rounded-xl p-4 shadow-[0_0_25px_rgba(0,229,255,0.15)] flex flex-wrap items-center justify-between gap-4">
        
        {/* Selector de Nivel & Título */}
        <div className="flex items-center space-y-1 sm:space-y-0 sm:space-x-4 flex-col sm:flex-row">
          <div className="flex items-center space-x-2">
            <Radio className="w-6 h-6 text-[#00e5ff] animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-wide bg-gradient-to-r from-white via-cyan-200 to-[#00e5ff] bg-clip-text text-transparent">
              BATALLA NAVAL CUÁNTICA
            </h1>
          </div>

          <div className="flex items-center bg-[#050b14] border border-cyan-900 rounded-lg p-1 text-xs">
            <button 
              onClick={() => setLevel('1')}
              className={`px-3 py-1 rounded transition ${level === '1' ? 'bg-[#00e5ff] text-black font-semibold shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Novato (6x6)
            </button>
            <button 
              onClick={() => setLevel('medium')}
              className={`px-3 py-1 rounded transition ${level === 'medium' || level === '2' ? 'bg-[#00e5ff] text-black font-semibold shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Táctico (8x8)
            </button>
            <button 
              onClick={() => setLevel('3')}
              className={`px-3 py-1 rounded transition ${level === '3' ? 'bg-[#00e5ff] text-black font-semibold shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Comandante (8x8)
            </button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="flex items-center space-x-6 text-sm font-mono">
          <div className="flex items-center space-x-2 bg-[#050b14] px-3 py-1.5 rounded-lg border border-cyan-900/50">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-400">Puntos:</span>
            <span className="text-yellow-400 font-bold text-base">{gameState.score}</span>
          </div>

          <div className="flex items-center space-x-2 bg-[#050b14] px-3 py-1.5 rounded-lg border border-cyan-900/50">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-slate-400">Hundidas:</span>
            <span className="text-white font-bold text-base">{gameState.ships_destroyed} / {gameState.total_ships}</span>
          </div>

          <div className="flex items-center space-x-2 bg-[#050b14] px-3 py-1.5 rounded-lg border border-cyan-900/50">
            <Activity className="w-4 h-4 text-[#00e5ff]" />
            <span className="text-slate-400">Coherencia:</span>
            <span className={`font-bold text-base ${gameState.coherence > 60 ? 'text-green-400' : 'text-amber-400'}`}>
              {gameState.coherence}%
            </span>
          </div>

          <button
            onClick={() => setShowRulesModal(true)}
            className="flex items-center space-x-1.5 bg-cyan-950/60 text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black border border-[#00e5ff]/40 px-3 py-1.5 rounded-lg text-xs font-sans transition-all duration-200"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Guía Cuántica</span>
          </button>

          <button
            onClick={() => initGame(level)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-sans transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Banner de Victoria */}
      {gameState.is_victory && (
        <div className="bg-gradient-to-r from-emerald-900/80 via-cyan-900/80 to-blue-900/80 border-2 border-emerald-400 rounded-xl p-6 text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-bounce">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wider">
            🎉 ¡VICTORIA CUÁNTICA CONFIRMADA!
          </h2>
          <p className="text-emerald-200 text-sm max-w-xl mx-auto">
            Has colapsado todas las flotas enemigas al estado |1⟩ en <strong>{gameState.turns} turnos</strong> con una puntuación final de <strong>{gameState.score} Puntos</strong>.
          </p>
        </div>
      )}

      {/* Main Grid & Tactical Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TABLERO DE N x N (8 Columns on Large Screens) */}
        <div className="lg:col-span-7 bg-[#0b1329]/60 border border-slate-800 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crosshair className="w-5 h-5 text-[#00e5ff]" />
              <h2 className="text-base font-semibold text-slate-200">
                ESPACIO DE PROBABILIDADES ($N \times N$)
              </h2>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping inline-block"></span>
                <span>Superposición (50%)</span>
              </span>
              <span className="flex items-center space-x-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Herida (75-80%)</span>
              </span>
              <span className="flex items-center space-x-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                <span>Revelada (100%)</span>
              </span>
            </div>
          </div>

          {/* Grid Container */}
          <div 
            ref={gridRef}
            className="relative grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${gameState.cols}, minmax(0, 1fr))`
            }}
          >
            {gameState.cells.map((cell) => {
              const isSelected = cell.id === selectedCellId;
              const isWater = cell.status === 'water';
              const isHit = cell.status === 'hit';

              // Buscar flotas no destruidas que contengan esta casilla entre sus candidatas
              const candidateFleets = gameState.fleets.filter(
                f => f.status !== 'destroyed' && f.candidate_tiles.includes(cell.id)
              );

              const hasSuperposition = candidateFleets.some(f => f.status === 'superposition');
              const hasWounded = candidateFleets.some(f => f.status === 'wounded');
              const hasRevealed = candidateFleets.some(f => f.status === 'revealed');

              return (
                <button
                  key={cell.id}
                  data-cell-id={cell.id}
                  onClick={() => setSelectedCellId(cell.id)}
                  disabled={isWater || isHit || loadingAction}
                  className={`
                    aspect-square rounded-lg border p-1 flex flex-col items-center justify-between relative transition-all duration-200 font-mono text-xs
                    ${isSelected ? 'ring-2 ring-[#00e5ff] ring-offset-2 ring-offset-[#070a0f] z-10' : ''}
                    ${isHit ? 'bg-red-950/80 border-red-500 text-red-300' : ''}
                    ${isWater ? 'bg-blue-950/40 border-blue-900/60 text-blue-400 opacity-60 cursor-not-allowed' : ''}
                    ${!isHit && !isWater && hasRevealed ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,229,255,0.3)] animate-pulse' : ''}
                    ${!isHit && !isWater && !hasRevealed && hasWounded ? 'bg-amber-950/60 border-amber-500/80 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]' : ''}
                    ${!isHit && !isWater && !hasRevealed && !hasWounded && hasSuperposition ? 'bg-purple-950/40 border-purple-600/70 text-purple-200 hover:bg-purple-900/50' : ''}
                    ${!isHit && !isWater && candidateFleets.length === 0 ? 'bg-[#060c18] border-slate-800/80 text-slate-500 hover:border-slate-700 hover:bg-slate-900/40' : ''}
                  `}
                >
                  <span className="text-[10px] opacity-75 font-semibold leading-none">{cell.id}</span>

                  <div className="flex-1 flex items-center justify-center">
                    {isHit && <span className="text-xl">💥</span>}
                    {isWater && <Waves className="w-5 h-5 text-blue-400" />}
                    {!isHit && !isWater && hasRevealed && (
                      <Eye className="w-6 h-6 text-cyan-400 animate-bounce" />
                    )}
                    {!isHit && !isWater && !hasRevealed && hasWounded && (
                      <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                    )}
                    {!isHit && !isWater && !hasRevealed && !hasWounded && hasSuperposition && (
                      <div className="relative flex items-center justify-center">
                        <Atom className="w-5 h-5 text-purple-400 animate-spin" />
                        <span className="absolute text-[9px] font-bold text-purple-200">50%</span>
                      </div>
                    )}
                  </div>

                  {candidateFleets.length > 0 && !isHit && !isWater && (
                    <div className="flex space-x-1 text-[9px]">
                      {candidateFleets.map(f => (
                        <span key={f.id} className="px-1 bg-black/60 rounded text-cyan-300 font-bold">
                          {f.name.split(' ')[1] || f.id}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* SVG Overlay para conectar parejas de superposición y entrelazamiento */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
            {gameState.fleets
              .filter(f => f.status !== 'destroyed' && f.candidate_tiles.length === 2)
              .map(f => {
                const c1 = gridCoords[f.candidate_tiles[0]];
                const c2 = gridCoords[f.candidate_tiles[1]];
                if (!c1 || !c2) return null;
                const isWounded = f.status === 'wounded';
                return (
                  <g key={`pair_${f.id}`}>
                    <line 
                      x1={c1.x} y1={c1.y} 
                      x2={c2.x} y2={c2.y} 
                      stroke={isWounded ? "#f59e0b" : "#a855f7"} 
                      strokeWidth={isWounded ? "2.5" : "2"} 
                      strokeDasharray="4 4" 
                      className="opacity-70 animate-pulse"
                    />
                  </g>
                );
              })}
          </svg>

        </div>

        {/* CONTROLES TÁCTICOS Y ESTADO DE FLOTAS (5 Columns on Large Screens) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tarjeta de Acción / Disparo */}
          <div className="bg-[#0b1329]/80 border border-[#00e5ff]/40 rounded-xl p-5 shadow-[0_0_20px_rgba(0,229,255,0.1)] space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-[#00e5ff]" />
                <span className="font-semibold text-white">OBJETIVO: <strong className="text-[#00e5ff] font-mono text-lg">{selectedCellId}</strong></span>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold ${
                selectedCell.status === 'water' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                selectedCell.status === 'hit' ? 'bg-red-950 text-red-400 border border-red-800' :
                fleetsAtSelectedCell.length > 0 ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'bg-slate-800 text-slate-400'
              }`}>
                {selectedCell.status === 'water' ? 'MEDIDO (|0⟩ Agua)' :
                 selectedCell.status === 'hit' ? 'MEDIDO (|1⟩ Derribado)' :
                 fleetsAtSelectedCell.length > 0 ? `${fleetsAtSelectedCell.length} Flota(s) en Radar` : 'Casilla Vacía'}
              </span>
            </div>

            {/* Información sobre las flotas en la casilla seleccionada */}
            {fleetsAtSelectedCell.length > 0 ? (
              <div className="space-y-2">
                {fleetsAtSelectedCell.map(fleet => (
                  <div key={fleet.id} className="bg-[#050b14] border border-cyan-900/60 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{fleet.name}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        fleet.status === 'revealed' ? 'bg-cyan-500 text-black' :
                        fleet.status === 'wounded' ? 'bg-amber-500 text-black' : 'bg-purple-900/80 text-purple-200'
                      }`}>
                        {fleet.status === 'revealed' ? '100% REVELADA' :
                         fleet.status === 'wounded' ? `HERIDA (P=${intPercent(fleet.prob_hit)})` : `SUPERPOSICIÓN (${intPercent(fleet.prob_hit)})`}
                      </span>
                    </div>

                    <p className="text-slate-400 text-[11px]">
                      Ubicaciones posibles: <strong className="text-cyan-300 font-mono">{fleet.candidate_tiles.join(' ó ')}</strong>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-[#050b14] p-3 rounded-lg border border-slate-800">
                Esta casilla no es una de las 2 ubicaciones de superposición reveladas por el radar para las flotas activas. Disparar aquí probablemente resultará en Agua.
              </p>
            )}

            {/* BOTÓN DISPARAR / MEDIR */}
            <button
              onClick={() => handleMeasure(selectedCellId)}
              disabled={selectedCell.status === 'water' || selectedCell.status === 'hit' || loadingAction || gameState.is_victory}
              className={`
                w-full py-3.5 px-4 rounded-xl font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-lg
                ${selectedCell.status === 'water' || selectedCell.status === 'hit' || gameState.is_victory
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-[#00e5ff] via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-black font-extrabold shadow-[0_0_20px_rgba(0,229,255,0.4)] active:scale-[0.98]'
                }
              `}
            >
              <Crosshair className="w-5 h-5" />
              <span>{loadingAction ? 'EJECUTANDO CIRCUITO QISKIT...' : `DISPARAR / MEDIR CASILLA (${selectedCellId})`}</span>
            </button>

          </div>

          {/* LISTA DE FLOTAS ENEMIGAS Y SUS ESTADOS */}
          <div className="bg-[#0b1329]/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center justify-between">
              <span>RADAR DE FLOTAS ENEMIGAS ({gameState.fleets.length})</span>
              <span className="text-slate-500 font-mono font-normal">Estado de Qubits</span>
            </h3>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {gameState.fleets.map(fleet => (
                <div 
                  key={fleet.id}
                  className={`p-3 rounded-lg border transition text-xs space-y-1.5 ${
                    fleet.status === 'destroyed' ? 'bg-red-950/30 border-red-900/40 opacity-50' :
                    fleet.status === 'revealed' ? 'bg-cyan-950/40 border-cyan-500/70' :
                    fleet.status === 'wounded' ? 'bg-amber-950/40 border-amber-500/70' : 'bg-[#050b14] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{fleet.name}</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      fleet.status === 'destroyed' ? 'bg-red-900 text-red-200' :
                      fleet.status === 'revealed' ? 'bg-cyan-500 text-black' :
                      fleet.status === 'wounded' ? 'bg-amber-500 text-black' : 'bg-purple-900 text-purple-200'
                    }`}>
                      {fleet.status === 'destroyed' ? 'DERRIBADA |1⟩' :
                       fleet.status === 'revealed' ? 'REVELADA (100%)' :
                       fleet.status === 'wounded' ? 'HERIDA Ry(θ) (78%)' : 'SUPERPOSICIÓN (50%)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span>Casillas: {fleet.candidate_tiles.join(', ')}</span>
                    {fleet.entangled_with && (
                      <span className="text-purple-400 flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Entrelazada con {fleet.entangled_with.replace('fleet_', 'Flota ')}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REGISTRO DE EVENTOS CUÁNTICOS EN VIVO */}
          <div className="bg-[#050b14] border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00e5ff]" />
              <span>REGISTRO DE MEDIDAS & EVENTOS QISKIT</span>
            </h3>

            <div className="h-36 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
              {gameState.event_log.map((log, idx) => (
                <div key={idx} className="flex space-x-2 text-slate-300 border-b border-slate-900/80 pb-1">
                  <span className="text-cyan-500 font-bold">[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL / GUÍA DE REGLAS SEGÚN MD v_final */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-[#00e5ff]/50 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-[0_0_50px_rgba(0,229,255,0.2)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Atom className="w-5 h-5 text-[#00e5ff]" />
                <span>MECÁNICAS CUÁNTICAS (v_final.md)</span>
              </h3>
              <button 
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto pr-2">
              <div className="bg-[#050b14] p-3 rounded-lg border border-cyan-900/50">
                <h4 className="font-bold text-[#00e5ff] mb-1">1. Qubit = Estado de la Flota</h4>
                <p>Cada flota enemiga es modelada como un qubit. Su estado oscila entre estar a salvo ($|0\rangle$) o destruida ($|1\rangle$).</p>
              </div>

              <div className="bg-[#050b14] p-3 rounded-lg border border-purple-900/50">
                <h4 className="font-bold text-purple-400 mb-1">2. Superposición Ubicacional (50%)</h4>
                <p>Al inicio, la flota existe simultáneamente entre <strong>dos casillas reveladas por el radar</strong> (ej. A3 y D5). Medir cualquiera de ellas tiene un 50% de probabilidad de acierto.</p>
              </div>

              <div className="bg-[#050b14] p-3 rounded-lg border border-blue-900/50">
                <h4 className="font-bold text-blue-400 mb-1">3. Fallo (Agua) = Colapso de Superposición</h4>
                <p>Si disparas a A3 y resulta Agua ($|0\rangle$), la función de onda colapsa y la flota es <strong>revelada automáticamente en D5 con 100% de certeza</strong>.</p>
              </div>

              <div className="bg-[#050b14] p-3 rounded-lg border border-amber-900/50">
                <h4 className="font-bold text-amber-400 mb-1">4. Entrelazamiento CNOT = Flota Herida (78%)</h4>
                <p>Si la flota destruida estaba entrelazada con otra flota, la segunda sufre una rotación condicional $R_y(\theta)$, pasando a estado <strong>Herida</strong>. Su probabilidad de caer aumenta al 78% pero permanece oculta.</p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 bg-[#00e5ff] hover:bg-cyan-400 text-black font-bold rounded-xl transition"
            >
              Entendido, volver a la Batalla
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function intPercent(prob) {
  return `${Math.round((prob || 0) * 100)}%`;
}
