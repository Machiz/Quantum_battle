import React, { useState } from 'react';
import { 
  Atom, Shield, Zap, Target, Sparkles, Activity, Layers, 
  HelpCircle, ArrowRight, CheckCircle2, ChevronRight, Play, Eye, RotateCw
} from 'lucide-react';

export default function LandingPage({ onStartGame }) {
  const [activeConceptTab, setActiveConceptTab] = useState('superposition');
  
  // Widget interactivo de superposición
  const [superSlider, setSuperSlider] = useState(70); // 70% ship
  const pWater = ((100 - superSlider) / 100).toFixed(2);
  const pShip = (superSlider / 100).toFixed(2);
  const ampA = Math.sqrt(pWater).toFixed(3);
  const ampB = Math.sqrt(pShip).toFixed(3);

  // Widget interactivo de interferencia
  const [phaseAngle, setPhaseAngle] = useState(0); // 0deg (constructiva) a 180deg (destructiva)
  const interferenceResult = Math.max(0, Math.min(100, Math.round(50 + 45 * Math.cos((phaseAngle * Math.PI) / 180))));

  // Widget de entrelazamiento parcial
  const [entangleTheta, setEntangleTheta] = useState(45); // deg
  const probA = Math.round(100 * Math.sin((entangleTheta * Math.PI) / 180) ** 2);
  const probB = Math.round(probA * 0.85);

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 pb-20 selection:bg-[#00e5ff] selection:text-black">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 overflow-hidden border-b border-[#1b2a40]">
        
        {/* Glowing Background Radial Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#00e5ff]/15 via-[#a855f7]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0d1726] border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-mono mb-6 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Atom className="w-4 h-4 animate-spin-slow" />
            <span>HACKATHON QUANTUM HUB PERÚ • PUZZLE DE ESTRATEGIA CUÁNTICA</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-tight mb-6">
            QUANTUM BATTLESHIP
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#38bdf8] to-[#a855f7] mt-2">
              OPERATION COLLAPSE
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-10">
            Democratizando la Computación Cuántica a través de un juego interactivo de radar táctico.
            Controla estados de <strong className="text-[#00e5ff]">superposición</strong>, manipula <strong className="text-[#c084fc]">interferencia de fase</strong> y domina el <strong className="text-[#ff3b5c]">entrelazamiento parcial</strong> impulsado por el motor backend de <strong className="text-white font-mono">Qiskit (Python 3.10)</strong>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onStartGame}
              className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#00b8d4] text-black font-display font-bold text-base shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:shadow-[0_0_45px_rgba(0,229,255,0.8)] hover:scale-105 transition-all duration-300"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>INICIAR SIMULACIÓN TÁCTICA</span>
            </button>

            <a
              href="#objetivo-proyecto"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-[#0f1724] border border-[#1b2a40] text-slate-200 font-medium hover:border-[#00e5ff]/50 hover:text-[#00e5ff] transition-all duration-300"
            >
              <HelpCircle className="w-5 h-5" />
              <span>¿Qué busca este proyecto?</span>
            </a>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="hud-card p-4 rounded-xl text-center border border-[#1b263b]">
              <div className="text-2xl font-mono font-bold text-[#00e5ff]">100%</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Rigor Técnico Qiskit</div>
            </div>
            <div className="hud-card p-4 rounded-xl text-center border border-[#1b263b]">
              <div className="text-2xl font-mono font-bold text-[#c084fc]">4 Conceptos</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Superposición & Entrelazamiento</div>
            </div>
            <div className="hud-card p-4 rounded-xl text-center border border-[#1b263b]">
              <div className="text-2xl font-mono font-bold text-[#ff3b5c]">1 Jugador</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Puzzle Táctico Solo</div>
            </div>
            <div className="hud-card p-4 rounded-xl text-center border border-[#1b263b]">
              <div className="text-2xl font-mono font-bold text-amber-400">0 Ecuaciones</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Intuición 100% Visual</div>
            </div>
          </div>

        </div>
      </section>

      {/* ¿QUÉ BUSCA Y EN QUÉ TE AYUDARÁ EL PROYECTO? */}
      <section id="objetivo-proyecto" className="py-20 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            ¿Qué busca el proyecto y en qué te ayudará?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            La computación cuántica suele percibirse como un área abstracta repleta de notación de Dirac y matrices complejas. <strong>Quantum Battleship</strong> rompe esa barrera mediante mecánicas tácticas de juego.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Objective Card 1 */}
          <div className="hud-card p-8 rounded-2xl border border-[#1b263b] hover:border-[#00e5ff]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">1. Construir Intuición Cuántica Visual</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              En lugar de memorizar vectores de estado <code className="text-[#00e5ff] font-mono">|\psi⟩ = \alpha|0⟩ + \beta|1⟩</code>, observas casillas con opacidad y porcentaje dinámico. Aprendes cómo interactúan las amplitudes sin lidiar con álgebra compleja.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" />
                <span>Casilla translúcida = Superposición activa</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" />
                <span>Colores Azul / Rojo = Fase positiva / negativa</span>
              </li>
            </ul>
          </div>

          {/* Objective Card 2 */}
          <div className="hud-card p-8 rounded-2xl border border-[#1b263b] hover:border-[#c084fc]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#c084fc] mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">2. Comprender Compuertas Lógicas Cuánticas</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Experimentas de forma directa el impacto de compuertas lógicas como <strong>Hadamard (H)</strong>, <strong>Pauli-X (NOT)</strong> y <strong>Pauli-Z (Phase)</strong> para modificar probabilidades antes de colapsar una celda.
            </p>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#c084fc]" />
                <span>Hadamard (H): Equilibra y redistribuye certezas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#c084fc]" />
                <span>Pauli-X (X): Invierte 20% Barco a 80% Barco</span>
              </li>
            </ul>
          </div>

          {/* Objective Card 3 */}
          <div className="hud-card p-8 rounded-2xl border border-[#1b263b] hover:border-[#ff3b5c]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#ff3b5c]/10 border border-[#ff3b5c]/30 flex items-center justify-center text-[#ff3b5c] mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">3. Entrelazamiento Parcial y Gestión de Riesgo</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              A diferencia de juegos simplificados con entrelazamiento máximo (100%), este proyecto modela <strong>Entrelazamiento Parcial</strong> (<code className="text-[#ff3b5c] font-mono">\alpha|00⟩ + \beta|11⟩</code> con |\alpha| ≠ |\beta|).
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Te enseña la toma de decisiones bajo incertidumbre: <em>¿Disparas con 85% de probabilidad o gastas energía aplicando compuertas para llevarla al 99%?</em>
            </p>
          </div>

          {/* Objective Card 4 */}
          <div className="hud-card p-8 rounded-2xl border border-[#1b263b] hover:border-[#38bdf8]/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-6 group-hover:scale-110 transition-transform">
              <Atom className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">4. Integración Directa con Qiskit (Python 3.10)</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              El motor de juego utiliza verdaderos circuitos cuánticos simulados con <strong>Qiskit 2.5.0</strong> en Python 3.10.8. Las probabilidades no son números aleatorios ficticios, sino resultados exactos del vector de estado de Qiskit.
            </p>
            <div className="px-3 py-2 rounded-lg bg-[#070a0f] border border-[#1b263b] text-[11px] font-mono text-slate-300">
              qc.ry(theta, 0); qc.cx(0, 1); sv = Statevector.from_instruction(qc)
            </div>
          </div>

        </div>
      </section>

      {/* MAPEO DE CONCEPTOS CUÁNTICOS Y TRADUCCIÓN A GAMEPLAY */}
      <section className="py-16 px-4 lg:px-8 bg-[#0a0e17] border-y border-[#1b2a40]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-[#00e5ff] tracking-widest uppercase">Traducción Visual</span>
            <h2 className="text-3xl font-display font-bold text-white mt-1">
              Mapeo de Conceptos Cuánticos a Mecánicas de Juego
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1b263b]">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#0f1724] text-xs uppercase font-mono text-slate-400 border-b border-[#1b263b]">
                <tr>
                  <th className="py-4 px-6">Concepto Cuántico</th>
                  <th className="py-4 px-6">Traducción Visual en el Juego</th>
                  <th className="py-4 px-6">Mecánica de Gameplay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b263b] bg-[#0d121c]/80 text-slate-300 font-sans">
                <tr className="hover:bg-[#121927] transition-colors">
                  <td className="py-4 px-6 font-bold text-[#00e5ff] font-mono">Superposición</td>
                  <td className="py-4 px-6">Barra de Probabilidad / Opacidad dinamica</td>
                  <td className="py-4 px-6">Las casillas no son "Agua" ni "Barco", sino un % dinámico (ej. 70% Barco / 30% Agua).</td>
                </tr>
                <tr className="hover:bg-[#121927] transition-colors">
                  <td className="py-4 px-6 font-bold text-[#c084fc] font-mono">Interferencia</td>
                  <td className="py-4 px-6">Indicador de Fase (Azul + / Rojo -)</td>
                  <td className="py-4 px-6">Usar compuertas manipula la fase para sumar o cancelar amplitudes de probabilidad.</td>
                </tr>
                <tr className="hover:bg-[#121927] transition-colors">
                  <td className="py-4 px-6 font-bold text-[#ff3b5c] font-mono">Entrelazamiento Parcial</td>
                  <td className="py-4 px-6">Líneas de Neón / Brillo de Vínculo (Ψ)</td>
                  <td className="py-4 px-6">Medir una casilla altera la probabilidad de otra en cierto porcentaje, sin resolverla al 100%.</td>
                </tr>
                <tr className="hover:bg-[#121927] transition-colors">
                  <td className="py-4 px-6 font-bold text-amber-400 font-mono">Medición / Colapso</td>
                  <td className="py-4 px-6">Acción de Disparo ("MEDIR")</td>
                  <td className="py-4 px-6">Forzar al sistema a decidirse por un estado puro (|0⟩ Agua o |1⟩ Barco) según la regla de Born.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3 NIVELES Y SUS CONCEPTOS CUÁNTICOS EXPLICADOS */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <span className="text-xs font-mono text-[#00e5ff] tracking-widest uppercase">Estructura del Juego</span>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mt-1">
                Los 3 Niveles de Dificultad & Conceptos por Nivel
              </h3>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-2 font-sans">
                Cada nivel introduce de forma gradual y progresiva nuevos principios cuánticos para dominar la estrategia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* NIVEL 1 CARD */}
              <div className="hud-panel p-6 rounded-2xl border border-[#00e5ff]/40 bg-gradient-to-b from-[#00e5ff]/10 to-transparent flex flex-col justify-between hover:border-[#00e5ff] transition-all">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono text-[#00e5ff] font-bold uppercase tracking-wider">NIVEL 1 • NOVATO</span>
                    <span className="px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] font-mono text-[10px]">6x6 Grid</span>
                  </div>
                  <h4 className="text-lg font-display font-bold text-white mb-3">Superposición & Entrelazamiento Máximo</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                    Ideal para aprender la Regla de Born y el colapso instantáneo de casillas vinculadas al 100%.
                  </p>
                  
                  <div className="space-y-2 border-t border-[#1b263b] pt-3 font-mono text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                      <span>Superposición α|0⟩ + β|1⟩</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                      <span>Entrelazamiento Máximo (100%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                      <span>Compuerta Hadamard (H)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1b263b] text-center">
                  <span className="text-xs font-mono text-[#00e5ff] font-bold">Energía: 1,500 GW • 3 Naves</span>
                </div>
              </div>

              {/* NIVEL 2 CARD */}
              <div className="hud-panel p-6 rounded-2xl border border-[#a855f7]/40 bg-gradient-to-b from-[#a855f7]/10 to-transparent flex flex-col justify-between hover:border-[#a855f7] transition-all">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono text-[#c084fc] font-bold uppercase tracking-wider">NIVEL 2 • TÁCTICO</span>
                    <span className="px-2 py-0.5 rounded bg-[#a855f7]/20 text-[#c084fc] font-mono text-[10px]">8x8 Grid</span>
                  </div>
                  <h4 className="text-lg font-display font-bold text-white mb-3">Entrelazamiento Parcial & Compuertas</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                    Modela el entrelazamiento real en hardware expuesto a ruido. Medir A eleva B al 75% sin resolverlo.
                  </p>
                  
                  <div className="space-y-2 border-t border-[#1b263b] pt-3 font-mono text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
                      <span>Entrelazamiento Parcial (75%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
                      <span>Compuerta Pauli-X (NOT Inversor)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
                      <span>Evaluación Táctica de Riesgo</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1b263b] text-center">
                  <span className="text-xs font-mono text-[#c084fc] font-bold">Energía: 1,240 GW • 5 Naves</span>
                </div>
              </div>

              {/* NIVEL 3 CARD */}
              <div className="hud-panel p-6 rounded-2xl border border-[#ff3b5c]/40 bg-gradient-to-b from-[#ff3b5c]/10 to-transparent flex flex-col justify-between hover:border-[#ff3b5c] transition-all">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono text-[#ff3b5c] font-bold uppercase tracking-wider">NIVEL 3 • COMANDANTE</span>
                    <span className="px-2 py-0.5 rounded bg-[#ff3b5c]/20 text-[#ff3b5c] font-mono text-[10px]">8x8 Grid</span>
                  </div>
                  <h4 className="text-lg font-display font-bold text-white mb-3">Interferencia & Decoherencia Alta</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                    Desafío definitivo: manipula la fase con compuerta Z mientras contienes el ruido ambiental y los pulsos enemigos.
                  </p>
                  
                  <div className="space-y-2 border-t border-[#1b263b] pt-3 font-mono text-xs text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b5c]" />
                      <span>Interferencia Z (Rotación de Fase)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b5c]" />
                      <span>Decoherencia Ambient (-8%/Turno)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b5c]" />
                      <span>Ataques Enemigos de Interferencia</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1b263b] text-center">
                  <span className="text-xs font-mono text-[#ff3b5c] font-bold">Energía: 950 GW • 6 Naves</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* DEMOSTRADOR INTERACTIVO DE CONCEPTOS */}
      <section className="py-20 px-4 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">Laboratorio Interactivo</span>
          <h2 className="text-3xl font-display font-bold text-white mt-1">
            Experimenta los Conceptos Cuánticos en Tiempo Real
          </h2>
        </div>

        {/* Concept Tabs */}
        <div className="flex justify-center space-x-2 mb-8 border-b border-[#1b263b] pb-4">
          <button
            onClick={() => setActiveConceptTab('superposition')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-mono font-medium transition-all ${
              activeConceptTab === 'superposition'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Superposición
          </button>

          <button
            onClick={() => setActiveConceptTab('phase')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-mono font-medium transition-all ${
              activeConceptTab === 'phase'
                ? 'bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Interferencia de Fase
          </button>

          <button
            onClick={() => setActiveConceptTab('entanglement')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-mono font-medium transition-all ${
              activeConceptTab === 'entanglement'
                ? 'bg-[#ff3b5c]/20 text-[#ff3b5c] border border-[#ff3b5c]/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Entrelazamiento Parcial
          </button>
        </div>

        {/* Tab Content 1: Superposition */}
        {activeConceptTab === 'superposition' && (
          <div className="hud-panel p-8 rounded-2xl border border-[#1b263b] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-[#00e5ff] font-display mb-3">Superposición de Qubit</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Como una moneda girando sobre la mesa: la casilla no es ni cara ni cruz, sino una mezcla probabilística hasta que mides.
              </p>
              <div className="space-y-4 font-mono text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>|0⟩ (Agua): <strong>{(pWater * 100).toFixed(0)}%</strong> (α = {ampA})</span>
                  <span>|1⟩ (Nave): <strong>{(pShip * 100).toFixed(0)}%</strong> (β = {ampB})</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={superSlider}
                  onChange={(e) => setSuperSlider(Number(e.target.value))}
                  className="w-full accent-[#00e5ff] bg-[#070a0f] h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Qubit Visual Card */}
            <div className="hud-card p-6 rounded-xl border border-[#00e5ff]/30 text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
              <div className="text-xs font-mono text-slate-400 mb-2">CELDA DE RADAR (F-06)</div>
              <div
                className="w-28 h-28 rounded-2xl border-2 border-[#00e5ff] flex flex-col items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all duration-300"
                style={{
                  backgroundColor: `rgba(0, 229, 255, ${superSlider / 200})`,
                }}
              >
                <span className="text-2xl font-mono font-bold text-[#00e5ff]">{superSlider}%</span>
                <span className="text-[10px] font-mono text-slate-300">PROB. NAVE</span>
              </div>
              <div className="mt-4 text-xs font-mono text-slate-400">
                Vector de Estado Qiskit: <span className="text-[#00e5ff]">{ampA}|0⟩ + {ampB}|1⟩</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Phase Interference */}
        {activeConceptTab === 'phase' && (
          <div className="hud-panel p-8 rounded-2xl border border-[#1b263b] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-[#c084fc] font-display mb-3">Interferencia de Fase</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Las ondas cuánticas pueden combinarse constructivamente (sumar probabilidad) o destructivamente (cancelar probabilidad) según el ángulo de fase.
              </p>
              <div className="space-y-4 font-mono text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Ángulo de Fase (ϕ): <strong>{phaseAngle}°</strong></span>
                  <span>Resultado Probabilidad: <strong>{interferenceResult}%</strong></span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={phaseAngle}
                  onChange={(e) => setPhaseAngle(Number(e.target.value))}
                  className="w-full accent-[#a855f7] bg-[#070a0f] h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="hud-card p-6 rounded-xl border border-[#a855f7]/30 text-center flex flex-col items-center justify-center min-h-[220px]">
              <div className="text-xs font-mono text-slate-400 mb-2">EFECTO DE INTERFERENCIA</div>
              <div className="text-3xl font-mono font-bold text-[#c084fc] my-2">
                {phaseAngle < 60 ? 'Constructiva (+)' : (phaseAngle > 120 ? 'Destructiva (-)' : 'Parcial (~)')}
              </div>
              <div className="w-full bg-[#070a0f] h-4 rounded-full overflow-hidden border border-[#1b263b] mt-2">
                <div
                  className="h-full bg-gradient-to-r from-[#00e5ff] to-[#a855f7] transition-all duration-300"
                  style={{ width: `${interferenceResult}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Entanglement */}
        {activeConceptTab === 'entanglement' && (
          <div className="hud-panel p-8 rounded-2xl border border-[#1b263b] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold text-[#ff3b5c] font-display mb-3">Entrelazamiento Parcial (RY + CX)</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Vincular el Qubit A con el Qubit B mediante <code className="text-[#ff3b5c] font-mono">RY(θ) → CX</code> genera correlaciones. Al medir A, B ajusta su probabilidad dinámicamente.
              </p>
              <div className="space-y-4 font-mono text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Qubit A (E-02): <strong>{probA}%</strong></span>
                  <span>Qubit B (E-05): <strong>{probB}%</strong></span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="85"
                  value={entangleTheta}
                  onChange={(e) => setEntangleTheta(Number(e.target.value))}
                  className="w-full accent-[#ff3b5c] bg-[#070a0f] h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="hud-card p-6 rounded-xl border border-[#ff3b5c]/30 text-center flex flex-col items-center justify-center min-h-[220px]">
              <div className="text-xs font-mono text-slate-400 mb-2">VÍNCULO CUÁNTICO (Ψ)</div>
              <div className="flex items-center justify-center space-x-6 my-4">
                <div className="w-16 h-16 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center font-mono font-bold text-[#00e5ff]">
                  E-02
                </div>
                <span className="text-[#ff3b5c] font-mono text-xs animate-pulse">⟷ [RY+CX] ⟷</span>
                <div className="w-16 h-16 rounded-xl bg-[#a855f7]/20 border border-[#a855f7] flex items-center justify-center font-mono font-bold text-[#c084fc]">
                  E-05
                </div>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Correlación Corregida: <span className="text-[#ff3b5c]">{(probA/100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* FOOTER BANNER CTA */}
      <section className="mt-12 text-center">
        <div className="max-w-4xl mx-auto hud-card p-10 rounded-3xl border border-[#00e5ff]/30 shadow-[0_0_50px_rgba(0,229,255,0.15)] relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              ¿Listo para asumir el control del Radar Cuántico?
            </h3>
            <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8">
              Ponte el casco de operador, analiza las probabilidades, aplica compuertas cuánticas estratégicas y destruye la flota enemiga oculta.
            </p>
            <button
              onClick={onStartGame}
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#00b8d4] text-black font-display font-bold text-base shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>INGRESAR AL JUEGO AHORA</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
