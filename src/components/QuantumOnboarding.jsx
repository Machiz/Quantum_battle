import React, { useState } from 'react';
import { Atom, Zap, Target, Waves, Shield, Sparkles, Flame, CheckCircle2, ArrowRight, Play } from 'lucide-react';

export default function QuantumOnboarding({ onStartGame }) {
  const [activeTab, setActiveTab] = useState('superposition');

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex items-center justify-center p-4 selection:bg-[#00e5ff] selection:text-black">
      <div className="max-w-4xl w-full bg-[#0b1329]/90 border border-[#00e5ff]/40 rounded-2xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,229,255,0.15)] backdrop-blur-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0d1726] border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-mono">
            <Atom className="w-4 h-4 animate-spin-slow" />
            <span>ACADEMIA CUÁNTICA DE COMBATE • ENTRENAMIENTO PRE-MISIÓN</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
            LOS 3 PRINCIPIOS CUÁNTICOS
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            Antes de tomar el mando de la flota, debes dominar las 3 leyes fundamentales que rigen el campo de batalla probabilístico.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('superposition')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              activeTab === 'superposition'
                ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'bg-[#050b14] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Atom className="w-6 h-6 text-purple-400" />
            <span className="font-bold">1. Superposición</span>
          </button>

          <button
            onClick={() => setActiveTab('entanglement')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              activeTab === 'entanglement'
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : 'bg-[#050b14] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Zap className="w-6 h-6 text-amber-400" />
            <span className="font-bold">2. Entrelazamiento</span>
          </button>

          <button
            onClick={() => setActiveTab('collapse')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
              activeTab === 'collapse'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                : 'bg-[#050b14] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Target className="w-6 h-6 text-cyan-400" />
            <span className="font-bold">3. Interferencia / Colapso</span>
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-[#050b14] border border-slate-800 rounded-xl p-6 space-y-4">
          
          {activeTab === 'superposition' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-3 text-purple-400 border-b border-slate-800 pb-3">
                <Atom className="w-7 h-7" />
                <div>
                  <h3 className="text-lg font-bold text-white">Superposición Ubicacional</h3>
                  <span className="text-xs font-mono text-purple-400">Qubit de la Flota = |ψ⟩ = (|0⟩ + |1⟩)/√2</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                En el mundo cuántico, una flota enemiga <strong>no está fijada en una sola casilla</strong>. El radar detecta que existe simultáneamente en <strong>dos casillas candidatas</strong> (ej. A3 y D5).
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-mono">
                <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg p-3 space-y-1">
                  <span className="text-purple-300 font-bold">Casilla A3 (50%)</span>
                  <p className="text-slate-400 text-[11px]">Amplitud α: Existe un 50% de probabilidad de que la flota colapse aquí al disparar.</p>
                </div>
                <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg p-3 space-y-1">
                  <span className="text-purple-300 font-bold">Casilla D5 (50%)</span>
                  <p className="text-slate-400 text-[11px]">Amplitud β: Existe el otro 50% en la casilla pareja de superposición.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entanglement' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-3 text-amber-400 border-b border-slate-800 pb-3">
                <Zap className="w-7 h-7" />
                <div>
                  <h3 className="text-lg font-bold text-white">Entrelazamiento CNOT (Compuertas CX + Ry)</h3>
                  <span className="text-xs font-mono text-amber-400">Efecto a Distancia • Flotas Vinculadas</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Dos flotas pueden estar cuánticamente entrelazadas mediante una compuerta CNOT. Cuando la <strong>Flota A es destruida</strong>, su colapso activa una rotación de fase $R_y(\theta)$ en la <strong>Flota B</strong>.
              </p>

              <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-4 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-amber-300 font-bold">
                  <Flame className="w-5 h-5" />
                  <span>Estado: Flota B HERIDA / ROTADA (78% Prob. Impacto)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  La Flota B permanece oculta en el mapa, pero su resistencia cae drásticamente. ¡Atacarla entrega puntos extra de bonus!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'collapse' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-3 text-cyan-400 border-b border-slate-800 pb-3">
                <Target className="w-7 h-7" />
                <div>
                  <h3 className="text-lg font-bold text-white">Interferencia & Colapso de Onda</h3>
                  <span className="text-xs font-mono text-cyan-400">Disparo = Medición de 1 Shot</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Cada disparo que realizas ejecuta una <strong>medición de 1 shot en Qiskit</strong>. Si tu disparo en A3 resulta en <strong>AGUA (|0⟩)</strong>, ¡has provocado la colapso de la función de onda!
              </p>

              <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-lg p-4 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Revelación Automática (100% Certeza)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Al confirmar que A3 es Agua, el sistema colapsa la función de onda y <strong>revela automáticamente la flota en D5 con 100% de certeza</strong>.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Progression Info Box */}
        <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-indigo-800/60 rounded-xl p-4 text-xs space-y-2">
          <div className="font-bold text-indigo-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>REGLAS DE REQUISITO DE PUNTAJE Y PROGRESIÓN</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
            <div className="bg-black/40 p-2 rounded border border-indigo-900/60">
              <strong className="text-purple-300 block">Nivel 1 (Grid 6x6)</strong>
              3 Flotas • +200 pts/acierto<br />
              <span className="text-yellow-400 font-bold">Mínimo: 450 Puntos</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-indigo-900/60">
              <strong className="text-amber-300 block">Nivel 2 (Grid 8x8)</strong>
              5 Flotas • +150 pts/acierto<br />
              <span className="text-yellow-400 font-bold">Mínimo: 900 Puntos</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-indigo-900/60">
              <strong className="text-cyan-300 block">Nivel 3 (Grid 12x12)</strong>
              7 Flotas • +100 pts/acierto<br />
              <span className="text-red-400 font-bold">-60 penalización por fallo</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStartGame}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#00e5ff] via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-black font-extrabold text-base tracking-wider uppercase shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all duration-200 flex items-center justify-center space-x-3"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>¡ENTENDIDO, COMERZAR MISIÓN (NIVEL 1)!</span>
        </button>

      </div>
    </div>
  );
}
