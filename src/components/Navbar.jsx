import React from 'react';
import { Atom, Shield, Play, Cpu, Info } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendInfo }) {
  return (
    <header className="sticky top-0 z-50 bg-[#070a0f]/90 backdrop-blur-md border-b border-[#1b2a40] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#00e5ff]/20 to-[#a855f7]/20 border border-[#00e5ff]/40 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            <Atom className="w-6 h-6 text-[#00e5ff] animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg tracking-wider text-white">QUANTUM BATTLESHIP</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff3b5c]/20 border border-[#ff3b5c]/40 text-[#ff3b5c] font-semibold tracking-widest">
                OPERATION COLLAPSE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Hackathon Quantum Hub Perú</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-[#0d121c] p-1.5 rounded-xl border border-[#1b263b]">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'landing'
                ? 'bg-gradient-to-r from-[#00e5ff]/20 to-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121927]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Visión & Concepto</span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'game'
                ? 'bg-gradient-to-r from-[#00e5ff]/20 to-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121927]'
            }`}
          >
            <Play className="w-4 h-4 text-[#00e5ff]" />
            <span className="font-bold">Centro de Comando (Juego)</span>
          </button>
        </nav>

        {/* Status Pill */}
        <div className="flex items-center space-x-2 bg-[#0d121c] px-3.5 py-1.5 rounded-lg border border-[#1b263b] text-xs font-mono">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Radar Cuántico Activo</span>
        </div>

      </div>
    </header>
  );
}
