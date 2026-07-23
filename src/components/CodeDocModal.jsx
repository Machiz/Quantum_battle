import React from 'react';
import { FileText, Cpu, Code2, Terminal, Atom, CheckCircle2, ArrowRight } from 'lucide-react';

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
                <span>EXPLICACIÓN DE CÓDIGO Y ARQUITECTURA TÉCNICA</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Backend Cuántico Qiskit (Python 3.10.8)
              </h1>
              <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                Documentación detallada del modelo matemático de circuitos cuánticos, vectores de estado, entrelazamiento parcial y comunicación API FastAPI.
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
            <span>1. Arquitectura del Sistema</span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            El proyecto implementa una arquitectura desacoplada cliente-servidor donde la física cuántica se calcula verdaderamente en Python utilizando <strong>Qiskit</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
            <div className="hud-card p-4 rounded-xl border border-[#1b263b]">
              <div className="text-[#00e5ff] font-bold mb-1">Frontend (React + Vite)</div>
              <div className="text-slate-400">HUD táctico que replica la interfaz del concept image, gráficos SVG para entrelazamientos e Inspector de celdas.</div>
            </div>
            <div className="hud-card p-4 rounded-xl border border-[#1b263b]">
              <div className="text-[#c084fc] font-bold mb-1">REST API (FastAPI)</div>
              <div className="text-slate-400">Servidor en Python que expone endpoints HTTP para reinicio, aplicación de compuertas y medición.</div>
            </div>
            <div className="hud-card p-4 rounded-xl border border-[#1b263b]">
              <div className="text-[#ff3b5c] font-bold mb-1">Motor Cuántico (Qiskit 2.5.0)</div>
              <div className="text-slate-400">Simulación exacta con QuantumCircuit, RY(θ), CX y Statevector para extraer amplitudes α y β.</div>
            </div>
          </div>
        </div>

        {/* Section 2: Qiskit Code Explanation */}
        <div className="hud-panel p-8 rounded-2xl border border-[#1b263b] space-y-6">
          <h2 className="text-2xl font-display font-bold text-[#c084fc] flex items-center space-x-2">
            <Terminal className="w-6 h-6" />
            <span>2. Código Backend Qiskit (Snippet de Ejemplo)</span>
          </h2>

          <div className="bg-[#070a0f] p-6 rounded-xl border border-[#1b263b] overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
            <pre>{`import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# 1. Crear circuito de entrelazamiento parcial entre 2 qubits (casillas E-02 y E-05)
qc = QuantumCircuit(2)

# 2. Rotación parametrizada RY(theta) para controlar el grado de probabilidad inicial
theta = np.pi / 4  # Genera ~85% / 15% de entrelazamiento parcial
qc.ry(theta, 0)

# 3. Aplicar CNOT (CX) para vincular el Qubit 0 y Qubit 1
qc.cx(0, 1)

# 4. Obtener Vector de Estado exacto de Qiskit
sv = Statevector.from_instruction(qc)
amp_00 = sv.data[0]  # Amplitude |00⟩
amp_11 = sv.data[3]  # Amplitude |11⟩

print(f"Probabilidad de colapso conjunto: {abs(amp_11)**2:.2f}")`}</pre>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00e5ff] shrink-0 mt-0.5" />
              <span><strong>Compuerta Hadamard (H):</strong> Transforma |0⟩ en (|0⟩ + |1⟩)/√2 (50% probabilidad), expandiendo certezas en casillas vecinas.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff3b5c] shrink-0 mt-0.5" />
              <span><strong>Compuerta Pauli-X (X):</strong> Invierte el estado probabilístico (NOT bit flip). De 20% Barco pasa a 80% Barco.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#c084fc] shrink-0 mt-0.5" />
              <span><strong>Compuerta Pauli-Z (Z):</strong> Invierte la fase relativa del estado (|1⟩ → -|1⟩) permitiendo fenómenos de interferencia cuántica.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Setup Instructions */}
        <div className="hud-panel p-8 rounded-2xl border border-[#1b263b] space-y-4">
          <h2 className="text-2xl font-display font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>3. Cómo Ejecutar el Backend en Python 3.10.8</span>
          </h2>

          <div className="bg-[#070a0f] p-4 rounded-xl border border-[#1b263b] font-mono text-xs space-y-2 text-slate-300">
            <div># 1. Instalar dependencias necesarias</div>
            <div className="text-[#00e5ff]">pip install qiskit fastapi uvicorn pydantic numpy</div>
            <br />
            <div># 2. Iniciar el servidor FastAPI con Qiskit</div>
            <div className="text-[#00e5ff]">python run_backend.py</div>
            <br />
            <div># 3. Iniciar el frontend Vite en otra terminal</div>
            <div className="text-[#00e5ff]">npm run dev</div>
          </div>
        </div>

      </div>
    </div>
  );
}
