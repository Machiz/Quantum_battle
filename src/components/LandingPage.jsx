import React from 'react';
import { 
  Atom, Shield, Zap, Target, Sparkles, Activity, Layers, 
  HelpCircle, ArrowRight, CheckCircle2, ChevronRight, Play, Eye, RotateCw, Flame, Waves, Crosshair
} from 'lucide-react';

export default function LandingPage({ onStartGame }) {
  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 pb-20 selection:bg-[#00e5ff] selection:text-black">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 overflow-hidden border-b border-[#1b2a40]">
        
        {/* Glowing Background Radial Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#00e5ff]/15 via-[#a855f7]/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0d1726] border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-mono mb-6 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Atom className="w-4 h-4 animate-spin-slow" />
            <span>PUZZLE TÁCTICO DE ESTRATEGIA CUÁNTICA • QISKIT 2.5.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-tight mb-6">
            BATTLESHIP CUÁNTICO
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#38bdf8] to-[#a855f7] mt-2">
              CONCEPTO & ABSTRACCIÓN v_final
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-10">
            Aprende computación cuántica jugando. En este modelo, el <strong className="text-[#00e5ff]">Qubit representa a la Flota</strong>, la cual existe en <strong className="text-[#c084fc]">Superposición Ubicacional entre dos casillas</strong>. El disparo es una <strong className="text-[#ff3b5c]">Medición de 1-Shot</strong> que fuerza el colapso de la función de onda.
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
              href="#paradigma-cuantico"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-[#0f1724] border border-[#1b2a40] text-slate-200 font-medium hover:border-[#00e5ff]/50 hover:text-[#00e5ff] transition-all duration-300"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Ver Paradigma Cuántico</span>
            </a>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="hud-card p-4 rounded-xl text-center border border-[#1b263b]">
              <div className="text-2xl font-mono font-bold text-[#00e5ff]">1 Qubit</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Representa cada Flota</div>
            </div>
            <div className="hud-card p-4 rounded-xl text-center border border-[#1b263b]">
              <div className="text-2xl font-mono font-bold text-[#c084fc]">2 Casillas</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Superposición Ubicacional</div>
            </div>
            <div className="hud-card p-4 rounded-xl text-center border border-[#1b263b]">
              <div className="text-2xl font-mono font-bold text-[#ff3b5c]">1 Shot</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Disparo = Medición</div>
            </div>
            <div className="hud-card p-4 rounded-xl text-center border border-[#1b263b]">
              <div className="text-2xl font-mono font-bold text-amber-400">CNOT + Ry</div>
              <div className="text-xs text-slate-400 font-sans mt-1">Flota Herida por Entrelazamiento</div>
            </div>
          </div>

        </div>
      </section>

      {/* PARADIGMA CUÁNTICO SEGÚN v_final.md */}
      <section id="paradigma-cuantico" className="py-20 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-[#00e5ff] tracking-widest uppercase">Lógica del Sistema</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 mt-1">
            Paradigma y Estados de la Flota (v_final.md)
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            El modelo abstrae la computación cuántica de forma fluida y pedagógica sobre un tablero de $N \times N$.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1 */}
          <div className="hud-card p-8 rounded-2xl border border-[#1b263b] hover:border-[#00e5ff]/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">1. Estado Oculto / Intacto (|0⟩)</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              La flota está completamente sana y fuera de peligro. La probabilidad de colapsar a Hundida al ser atacada fuera de su radar es de 0%.
            </p>
          </div>

          {/* Card 2 */}
          <div className="hud-card p-8 rounded-2xl border border-[#1b263b] hover:border-[#c084fc]/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#c084fc] mb-6">
              <Atom className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2. Superposición Ubicacional</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              La flota existe simultáneamente entre <strong>dos casillas</strong> reveladas por el radar (ej. Casilla A3 y D5). Su probabilidad de colapsar a Hundida al ser atacada es del <strong>50%</strong>.
            </p>
          </div>

          {/* Card 3 */}
          <div className="hud-card p-8 rounded-2xl border border-[#1b263b] hover:border-amber-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">3. Estado Herida / Rotada (Ry(θ))</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              La flota sufrió una degradación en su función de onda por el <strong>entrelazamiento (CNOT)</strong> con otra flota destruida. Permanece oculta en el mapa, pero su resistencia matemática disminuyó y su probabilidad de caer sube al <strong>75%-80%</strong>.
            </p>
          </div>

          {/* Card 4 */}
          <div className="hud-card p-8 rounded-2xl border border-[#1b263b] hover:border-[#ff3b5c]/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#ff3b5c]/10 border border-[#ff3b5c]/30 flex items-center justify-center text-[#ff3b5c] mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">4. Estado Derribado / Hundido (|1⟩)</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Resultado definitivo tras una medición exitosa (|1⟩). La flota colapsó y queda eliminada del juego con 100% de certeza.
            </p>
          </div>

        </div>
      </section>

      {/* TABLA DE RESUMEN: LÓGICA CUÁNTICA VS GAMEPLAY */}
      <section className="py-16 px-4 lg:px-8 bg-[#0a0e17] border-y border-[#1b2a40]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-[#00e5ff] tracking-widest uppercase">Resumen Técnico</span>
            <h2 className="text-3xl font-display font-bold text-white mt-1">
              Resumen de Lógica Cuántica vs. Mecánica de Juego
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1b263b]">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#0f1724] text-xs uppercase font-mono text-slate-400 border-b border-[#1b263b]">
                <tr>
                  <th className="py-4 px-6">Concepto Cuántico</th>
                  <th className="py-4 px-6">Expresión en el Juego</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b263b] bg-[#0d121c]/80 text-slate-300 font-sans">
                <tr className="hover:bg-[#121927]">
                  <td className="py-4 px-6 font-bold text-[#00e5ff] font-mono">Qubit</td>
                  <td className="py-4 px-6">Salud y estado de supervivencia de la Flota.</td>
                </tr>
                <tr className="hover:bg-[#121927]">
                  <td className="py-4 px-6 font-bold text-[#c084fc] font-mono">Superposición (H)</td>
                  <td className="py-4 px-6">Radar mostrando 2 ubicaciones posibles (50/50).</td>
                </tr>
                <tr className="hover:bg-[#121927]">
                  <td className="py-4 px-6 font-bold text-emerald-400 font-mono">Medición</td>
                  <td className="py-4 px-6">El acto de disparar a una casilla.</td>
                </tr>
                <tr className="hover:bg-[#121927]">
                  <td className="py-4 px-6 font-bold text-blue-400 font-mono">Colapso de Onda</td>
                  <td className="py-4 px-6">Si fallas en la casilla 1 (Agua), la flota aparece confirmada en la casilla 2.</td>
                </tr>
                <tr className="hover:bg-[#121927]">
                  <td className="py-4 px-6 font-bold text-[#ff3b5c] font-mono">Entrelazamiento (CNOT)</td>
                  <td className="py-4 px-6">Vínculo entre dos flotas enemigas.</td>
                </tr>
                <tr className="hover:bg-[#121927]">
                  <td className="py-4 px-6 font-bold text-amber-400 font-mono">Rotación de Fase (Ry)</td>
                  <td className="py-4 px-6">La Flota B queda "Herida" automáticamente cuando la Flota A es destruida.</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

    </div>
  );
}
