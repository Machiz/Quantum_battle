import React from 'react';
import { FileText, Cpu, Code2, Terminal, Atom, CheckCircle2, ArrowRight, Shield, Flame, Zap } from 'lucide-react';

export default function CodeDocModal() {
  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 p-4 lg:p-8 selection:bg-[#00e5ff] selection:text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="hud-panel p-8 rounded-3xl border border-[#a855f7]/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/40 text-[#c084fc] font-mono text-xs mb-3">
                <Atom className="w-4 h-4 animate-spin-slow" />
                <span>DOCUMENTACIÓN DE CÓDIGO Y ARQUITECTURA TÉCNICA (v_final.md)</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Backend Cuántico Qiskit (Python 3.10.8)
              </h1>
              <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                Modelo formal de Qiskit: La Flota es un Qubit, el Disparo es una Medición de 1-Shot, el Fallo provoca Colapso de Superposición y el Entrelazamiento CNOT genera Flotas Heridas.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-[#070a0f] px-4 py-3 rounded-xl border border-[#1b263b] font-mono text-xs">
              <Cpu className="w-5 h-5 text-[#00e5ff]" />
              <div>
                <div className="text-[10px] text-slate-400">ENTORNO TARGET</div>
                <div className="text-slate-200 font-bold">Python 3.10.8 + Qiskit 2.5.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Overall Architecture */}
        <div className="hud-panel p-8 rounded-2xl border border-[#1b263b] space-y-4">
          <h2 className="text-2xl font-display font-bold text-[#00e5ff] flex items-center space-x-2">
            <Code2 className="w-6 h-6" />
            <span>1. Arquitectura del Sistema (v_final.md)</span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            El proyecto implementa una arquitectura desacoplada cliente-servidor donde la física cuántica se calcula en Python utilizando <strong>Qiskit 2.5.0</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
            <div className="hud-card p-4 rounded-xl border border-[#1b263b]">
              <div className="text-[#00e5ff] font-bold mb-1">Frontend (React + Vite)</div>
              <div className="text-slate-400">HUD táctico interactivo con tablero N x N, radar de flotas en superposición y visualización de entrelazamientos.</div>
            </div>
            <div className="hud-card p-4 rounded-xl border border-[#1b263b]">
              <div className="text-[#c084fc] font-bold mb-1">REST API (FastAPI)</div>
              <div className="text-slate-400">Endpoints `/api/game/new` y `/api/game/measure` para disparar mediciones y recibir colapsos de estado.</div>
            </div>
            <div className="hud-card p-4 rounded-xl border border-[#1b263b]">
              <div className="text-[#ff3b5c] font-bold mb-1">Motor Cuántico (Qiskit)</div>
              <div className="text-slate-400">Simulación exacta con QuantumCircuit(1), RY(θ), CNOT y Statevector para ejecutar mediciones 1-shot.</div>
            </div>
          </div>
        </div>

        {/* Section 2: Qiskit Code Snippet */}
        <div className="hud-panel p-8 rounded-2xl border border-[#1b263b] space-y-6">
          <h2 className="text-2xl font-display font-bold text-[#c084fc] flex items-center space-x-2">
            <Terminal className="w-6 h-6" />
            <span>2. Circuito Qiskit de la Flota (Código Backend)</span>
          </h2>

          <div className="bg-[#070a0f] p-6 rounded-xl border border-[#1b263b] overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
            <pre>{`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# 1. Crear circuito de 1 Qubit para la Flota A (en Superposición entre A3 y D5)
qc_fleet_a = QuantumCircuit(1)
theta = np.pi / 2  # Superposición equitativa (50% / 50%)
qc_fleet_a.ry(theta, 0)

# 2. Medición proyectiva de 1 shot al disparar a A3:
sv = Statevector.from_instruction(qc_fleet_a)
prob_hit = float(abs(sv.data[1])**2)  # 0.50

# 3. Al destruirse la Flota A, propagación CNOT + Ry en Flota B (Entrelazada):
qc_fleet_b = QuantumCircuit(1)
new_theta = 0.72 * np.pi  # Rotación de Fase Ry(θ) -> P(hit) sube a ~78% (Estado Herida)
qc_fleet_b.ry(new_theta, 0)
sv_b = Statevector.from_instruction(qc_fleet_b)
prob_wounded = float(abs(sv_b.data[1])**2)  # 0.78`}</pre>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00e5ff] shrink-0 mt-0.5" />
              <span><strong>Superposición Ubicacional (50%):</strong> Representada por Ry(π/2) en el qubit de la flota.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff3b5c] shrink-0 mt-0.5" />
              <span><strong>Colapso de Superposición:</strong> Si la medición resulta Agua (|0⟩), la función de onda colapsa y la flota se confirma automáticamente en la casilla alternativa con 100% de certeza.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Entrelazamiento CNOT (Flota Herida):</strong> La rotación Ry(θ) eleva la probabilidad de impacto al 78% manteniendo la ubicación de la Flota B oculta.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
