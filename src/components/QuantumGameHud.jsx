import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, Zap, Target, Shield, HelpCircle, Activity, RotateCcw, 
  CheckCircle2, AlertTriangle, Info, Play, Flame, Waves, Sparkles,
  Crosshair, Radio, Eye, Lock, ArrowRight, RefreshCw, Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QuantumOnboarding from './QuantumOnboarding';
import { fetchNewGame, measureCellApi, createLocalQuantumState, localMeasureCell } from '../services/qiskitApi';

export default function QuantumGameHud({ backendInfo }) {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [gameState, setGameState] = useState(null);
  const [selectedCellId, setSelectedCellId] = useState('A-00');
  const [loadingAction, setLoadingAction] = useState(false);
  const [level, setLevel] = useState('1');

  const gridRef = useRef(null);
  const [gridCoords, setGridCoords] = useState({});

  useEffect(() => {
    initGame(level);
  }, [level]);

  const initGame = async (lvl, keepScore = 0) => {
    setLoadingAction(true);
    const res = await fetchNewGame(lvl, keepScore);
    let state = res && res.state ? res.state : createLocalQuantumState(lvl, keepScore);
    setGameState(state);
    
    // Seleccionar automáticamente la primera casilla candidata de la flota inicial revelada
    const initialFleet = state.fleets?.find(f => state.discovered_fleets?.includes(f.id));
    if (initialFleet && initialFleet.candidate_tiles.length > 0) {
      setSelectedCellId(initialFleet.candidate_tiles[0]);
    } else {
      setSelectedCellId(state.cells[0]?.id || 'A-00');
    }
    setLoadingAction(false);
  };

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
    const timer = setTimeout(() => {
      updateGridCoords();
    }, 60);
    window.addEventListener('resize', updateGridCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateGridCoords);
    };
  }, [gameState, showOnboarding]);

  useEffect(() => {
    if (gameState?.passed_game) {
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [gameState?.passed_game]);

  if (showOnboarding) {
    return (
      <QuantumOnboarding 
        onStartGame={() => {
          setShowOnboarding(false);
          initGame('1');
        }} 
      />
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#070a0f] flex items-center justify-center text-[#00e5ff] font-mono">
        <div className="flex flex-col items-center space-y-4">
          <Atom className="w-12 h-12 animate-spin text-[#00e5ff]" />
          <span className="tracking-widest">CARGANDO TABLERO Y CIRCUITO QISKIT...</span>
        </div>
      </div>
    );
  }

  const handleMeasure = async (cellIdToMeasure) => {
    const targetId = cellIdToMeasure || selectedCellId;
    if (!targetId || loadingAction) return;

    setLoadingAction(true);
    const apiRes = await measureCellApi(targetId);

    if (apiRes && apiRes.state) {
      setGameState(apiRes.state);
    } else {
      const localRes = localMeasureCell(gameState, targetId);
      if (localRes.success) {
        setGameState(localRes.state);
      }
    }
    setLoadingAction(false);
  };

  const handleNextLevel = () => {
    const nextLvl = gameState.level_num === 1 ? '2' : '3';
    setLevel(nextLvl);
    initGame(nextLvl, gameState.score);
  };

  const selectedCell = gameState.cells.find(c => c.id === selectedCellId) || gameState.cells[0];
  const discoveredSet = new Set(gameState.discovered_fleets || []);

  const fleetsAtSelectedCell = gameState.fleets.filter(
    f => f.status !== 'destroyed' && f.candidate_tiles.includes(selectedCellId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header / Tactical HUD Status Bar */}
      <div className="bg-[#0b1329]/80 backdrop-blur-md border border-[#00e5ff]/30 rounded-xl p-4 shadow-[0_0_25px_rgba(0,229,255,0.15)] flex flex-wrap items-center justify-between gap-4">
        
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
              className={`px-3 py-1 rounded transition ${gameState.level_num === 1 ? 'bg-[#00e5ff] text-black font-semibold shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Nivel 1 (6x6)
            </button>
            <button 
              onClick={() => setLevel('2')}
              className={`px-3 py-1 rounded transition ${gameState.level_num === 2 ? 'bg-[#00e5ff] text-black font-semibold shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Nivel 2 (8x8)
            </button>
            <button 
              onClick={() => setLevel('3')}
              className={`px-3 py-1 rounded transition ${gameState.level_num === 3 ? 'bg-[#00e5ff] text-black font-semibold shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Nivel 3 (12x12)
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm font-mono">
          <div className="flex items-center space-x-2 bg-[#050b14] px-3 py-1.5 rounded-lg border border-cyan-900/50">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-400">Puntos:</span>
            <span className="text-yellow-400 font-bold text-base">{gameState.score}</span>
            <span className="text-slate-500 text-xs">/ {gameState.target_score} Target</span>
          </div>

          <div className="flex items-center space-x-2 bg-[#050b14] px-3 py-1.5 rounded-lg border border-cyan-900/50">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-slate-400">Flotas:</span>
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
            onClick={() => setShowOnboarding(true)}
            className="flex items-center space-x-1.5 bg-purple-950/60 text-purple-300 hover:bg-purple-900 border border-purple-700/50 px-3 py-1.5 rounded-lg text-xs font-sans transition"
          >
            <Atom className="w-4 h-4" />
            <span>Tutorial 3 Principios</span>
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

      {/* Main Grid & Tactical Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TABLERO DINÁMICO */}
        <div className="lg:col-span-7 bg-[#0b1329]/60 border border-slate-800 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crosshair className="w-5 h-5 text-[#00e5ff]" />
              <h2 className="text-base font-semibold text-slate-200">
                ESPACIO DE PROBABILIDADES ({gameState.rows}x{gameState.cols})
              </h2>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1 text-[#00e5ff]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-ping inline-block"></span>
                <span>Superposición (50%)</span>
              </span>
              <span className="flex items-center space-x-1 text-[#ff3b5c]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b5c] inline-block"></span>
                <span>Herida (78%)</span>
              </span>
              <span className="flex items-center space-x-1 text-[#38bdf8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] inline-block"></span>
                <span>Revelada (100%)</span>
              </span>
            </div>
          </div>

          <div 
            ref={gridRef}
            className="relative grid gap-1.5 sm:gap-2"
            style={{
              gridTemplateColumns: `repeat(${gameState.cols}, minmax(0, 1fr))`
            }}
          >
            {/* SVG OVERLAY QUE DIBUJA EXCLUSIVAMENTE LAS CASILLAS CANDIDATAS DE FLOTAS REVELADAS / AFECTADAS */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible">
              <defs>
                <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Dibujar superposición de casillas candidatas sólo para flotas descubiertas */}
              {gameState.fleets
                .filter(f => f.status !== 'destroyed' && f.candidate_tiles.length === 2 && discoveredSet.has(f.id))
                .map(f => {
                  const c1 = gridCoords[f.candidate_tiles[0]];
                  const c2 = gridCoords[f.candidate_tiles[1]];
                  if (!c1 || !c2) return null;
                  
                  const isWounded = f.status === 'wounded';
                  const strokeColor = isWounded ? "#ff3b5c" : "#00e5ff";
                  const glowFilter = isWounded ? "url(#glowRed)" : "url(#glowCyan)";

                  return (
                    <g key={`pair_${f.id}`}>
                      <line 
                        x1={c1.x} y1={c1.y} 
                        x2={c2.x} y2={c2.y} 
                        stroke={strokeColor} 
                        strokeWidth={isWounded ? "3" : "2.5"} 
                        strokeDasharray={isWounded ? "6 3" : "8 4"} 
                        filter={glowFilter}
                        className="opacity-90 animate-pulse"
                      />
                      <circle cx={c1.x} cy={c1.y} r={isWounded ? "4" : "3.5"} fill={strokeColor} />
                      <circle cx={c2.x} cy={c2.y} r={isWounded ? "4" : "3.5"} fill={strokeColor} />
                    </g>
                  );
                })}
            </svg>

            {gameState.cells.map((cell) => {
              const isSelected = cell.id === selectedCellId;
              const isWater = cell.status === 'water';
              const isHit = cell.status === 'hit';

              const candidateFleets = gameState.fleets.filter(
                f => f.status !== 'destroyed' && f.candidate_tiles.includes(cell.id) && discoveredSet.has(f.id)
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
                    aspect-square rounded-md sm:rounded-lg border p-0.5 sm:p-1 flex flex-col items-center justify-between relative transition-all duration-200 font-mono text-[10px] sm:text-xs z-10
                    ${isSelected ? 'ring-2 ring-[#00e5ff] ring-offset-1 ring-offset-[#070a0f] !z-30' : ''}
                    ${isHit ? 'bg-red-950/80 border-red-500 text-red-300' : ''}
                    ${isWater ? 'bg-blue-950/40 border-blue-900/60 text-blue-400 opacity-60 cursor-not-allowed' : ''}
                    ${!isHit && !isWater && hasRevealed ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_18px_rgba(0,229,255,0.4)] animate-pulse' : ''}
                    ${!isHit && !isWater && !hasRevealed && hasWounded ? 'bg-rose-950/80 border-red-500/90 text-rose-200 shadow-[0_0_15px_rgba(255,59,92,0.35)]' : ''}
                    ${!isHit && !isWater && !hasRevealed && !hasWounded && hasSuperposition ? 'bg-cyan-950/30 border-cyan-600/70 text-cyan-200 hover:bg-cyan-900/40' : ''}
                    ${!isHit && !isWater && candidateFleets.length === 0 ? 'bg-[#060c18] border-slate-800/80 text-slate-500 hover:border-slate-700 hover:bg-slate-900/40' : ''}
                  `}
                >
                  <span className="text-[9px] opacity-75 font-semibold leading-none">{cell.id}</span>

                  <div className="flex-1 flex items-center justify-center">
                    {isHit && <span className="text-sm sm:text-base">💥</span>}
                    {isWater && <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />}
                    {!isHit && !isWater && hasRevealed && (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-bounce" />
                    )}
                    {!isHit && !isWater && !hasRevealed && hasWounded && (
                      <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff3b5c] animate-pulse" />
                    )}
                    {!isHit && !isWater && !hasRevealed && !hasWounded && hasSuperposition && (
                      <div className="relative flex items-center justify-center">
                        <Atom className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00e5ff] animate-spin" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* CONTROLES TÁCTICOS Y ESTADO DE FLOTAS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tarjeta de Acción / Disparo */}
          <div className="bg-[#0b1329]/80 border border-[#00e5ff]/40 rounded-xl p-5 shadow-[0_0_20px_rgba(0,229,255,0.1)] space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-[#00e5ff]" />
                <span className="font-semibold text-white">OBJETIVO: <strong className="text-[#00e5ff] font-mono text-lg">{selectedCellId}</strong></span>
              </div>

              <span className="text-xs font-mono font-bold text-[#00e5ff] bg-cyan-950/60 border border-cyan-800 px-2.5 py-1 rounded-md">
                +{gameState.hit_pts} Pts por Acierto
              </span>
            </div>

            {/* Informacion sobre casillas de la flota descubierta */}
            {fleetsAtSelectedCell.length > 0 && fleetsAtSelectedCell.some(f => discoveredSet.has(f.id)) ? (
              <div className="space-y-2">
                {fleetsAtSelectedCell.filter(f => discoveredSet.has(f.id)).map(fleet => (
                  <div key={fleet.id} className="bg-[#050b14] border border-cyan-900/60 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{fleet.name}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        fleet.status === 'revealed' ? 'bg-cyan-500 text-black' :
                        fleet.status === 'wounded' ? 'bg-[#ff3b5c] text-white' : 'bg-cyan-950 text-cyan-200 border border-cyan-700'
                      }`}>
                        {fleet.status === 'revealed' ? '100% REVELADA' :
                         fleet.status === 'wounded' ? `HERIDA (${intPercent(fleet.prob_hit)})` : `SUPERPOSICIÓN (${intPercent(fleet.prob_hit)})`}
                      </span>
                    </div>

                    <p className="text-slate-400 text-[11px]">
                      Ubicaciones: <strong className="text-cyan-300 font-mono">{fleet.candidate_tiles.join(' ó ')}</strong>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-[#050b14] p-3 rounded-lg border border-slate-800">
                Casilla en niebla de radar. Disparar aquí y fallar provocará un <strong className="text-red-400">Contraataque Enemigo</strong> que restará <strong className="text-red-400">-{gameState.counterattack_damage || gameState.miss_penalty} Pts</strong> y dañará tu Coherencia.
              </p>
            )}

            {/* BOTÓN DISPARAR */}
            <button
              onClick={() => handleMeasure(selectedCellId)}
              disabled={selectedCell.status === 'water' || selectedCell.status === 'hit' || loadingAction || gameState.passed_game || gameState.failed_game}
              className={`
                w-full py-3.5 px-4 rounded-xl font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-lg
                ${selectedCell.status === 'water' || selectedCell.status === 'hit' || gameState.passed_game || gameState.failed_game
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-[#00e5ff] via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-black font-extrabold shadow-[0_0_20px_rgba(0,229,255,0.4)] active:scale-[0.98]'
                }
              `}
            >
              <Crosshair className="w-5 h-5" />
              <span>{loadingAction ? 'PROCESANDO QISKIT...' : `MEDIR / ESCANEAR CASILLA (${selectedCellId})`}</span>
            </button>

          </div>

          {/* LISTA DE FLOTAS ENEMIGAS */}
          <div className="bg-[#0b1329]/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center justify-between">
              <span>RADAR DE FLOTAS ({gameState.fleets.length})</span>
              <span className="text-slate-500 font-mono font-normal">Estado Qubits</span>
            </h3>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {gameState.fleets.map(fleet => {
                const isDiscovered = discoveredSet.has(fleet.id);
                return (
                  <div 
                    key={fleet.id}
                    className={`p-2.5 rounded-lg border transition text-xs space-y-1 ${
                      fleet.status === 'destroyed' ? 'bg-red-950/30 border-red-900/40 opacity-50' :
                      !isDiscovered ? 'bg-[#050b14]/50 border-slate-900 text-slate-600' :
                      fleet.status === 'revealed' ? 'bg-cyan-950/40 border-cyan-500/70' :
                      fleet.status === 'wounded' ? 'bg-rose-950/50 border-rose-500/80' : 'bg-[#050b14] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isDiscovered ? 'text-slate-100' : 'text-slate-500 italic'}`}>
                        {isDiscovered ? fleet.name : `[Flota Oculta #${fleet.id.replace('fleet_', '')}]`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        fleet.status === 'destroyed' ? 'bg-red-900 text-red-200' :
                        !isDiscovered ? 'bg-slate-900 text-slate-500 border border-slate-800' :
                        fleet.status === 'revealed' ? 'bg-cyan-500 text-black' :
                        fleet.status === 'wounded' ? 'bg-[#ff3b5c] text-white' : 'bg-cyan-950 text-cyan-200 border border-cyan-700'
                      }`}>
                        {fleet.status === 'destroyed' ? 'DERRIBADA |1⟩' :
                         !isDiscovered ? 'EN SIGILO' :
                         fleet.status === 'revealed' ? 'REVELADA (100%)' :
                         fleet.status === 'wounded' ? 'HERIDA (78%)' : 'SUPERPOSICIÓN (50%)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REGISTRO DE EVENTOS */}
          <div className="bg-[#050b14] border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00e5ff]" />
              <span>LOG DE MEDIDAS QISKIT</span>
            </h3>

            <div className="h-32 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
              {gameState.event_log.map((log, idx) => (
                <div key={idx} className="flex space-x-2 text-slate-300 border-b border-slate-900/80 pb-0.5">
                  <span className="text-cyan-500 font-bold">[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL NIVEL SUPERADO */}
      {gameState.passed_game && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border-2 border-emerald-400 rounded-2xl max-w-xl w-full p-6 text-center space-y-5 shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-fadeIn">
            
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-bold tracking-widest uppercase">¡OBJETIVO ALCANZADO!</span>
              <h2 className="text-3xl font-extrabold text-white">NIVEL {gameState.level_num} SUPERADO</h2>
              <p className="text-slate-300 text-sm">
                Has alcanzado un puntaje de <strong className="text-yellow-400 text-base">{gameState.score} Puntos</strong> (mínimo requerido: {gameState.target_score} Pts).
              </p>
            </div>

            {gameState.level_num < 3 ? (
              <button
                onClick={handleNextLevel}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-black font-extrabold text-sm tracking-wider uppercase rounded-xl transition flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              >
                <span>DESBLOQUEAR Y AVANZAR A NIVEL {gameState.level_num + 1}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-4 bg-emerald-950/50 border border-emerald-600/60 rounded-xl">
                <h3 className="text-emerald-300 font-bold text-base mb-1">🏆 ¡HAS COMPLETADO EL JUEGO COMPLETO!</h3>
                <p className="text-slate-300 text-xs">Dominaste la Matriz 12x12 y los 3 principios de la Computación Cuántica.</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL DERROTA CON PISTA TÁCTICA CUÁNTICA */}
      {gameState.failed_game && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border-2 border-red-500/80 rounded-2xl max-w-xl w-full p-6 text-center space-y-5 shadow-[0_0_60px_rgba(239,68,68,0.3)] animate-fadeIn">
            
            <div className="w-16 h-16 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-red-400 font-bold tracking-widest uppercase">MISIÓN FALLIDA</span>
              <h2 className="text-2xl font-extrabold text-white">NO ALCANZASTE EL PUNTAJE MÍNIMO</h2>
              <p className="text-slate-300 text-xs">
                Puntaje obtenido: <strong className="text-red-400 font-mono text-sm">{gameState.score} Pts</strong> | Requerido: <strong className="text-yellow-400 font-mono text-sm">{gameState.target_score} Pts</strong>
              </p>
            </div>

            <div className="bg-gradient-to-r from-red-950/60 via-purple-950/60 to-slate-900 border border-amber-500/60 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase font-mono">
                <Sparkles className="w-4 h-4" />
                <span>CONSEJO CUÁNTICO DE REINTENTO</span>
              </div>
              <p className="text-slate-200 text-xs leading-relaxed italic">
                "{gameState.tactical_hint || "Revisa las casillas en superposición y elimina flotas heridas para maximizar bonus."}"
              </p>
            </div>

            <button
              onClick={() => initGame(level)}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm tracking-wider uppercase rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>REINTENTAR NIVEL {gameState.level_num}</span>
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
