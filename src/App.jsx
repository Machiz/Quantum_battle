import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import QuantumGameHud from './components/QuantumGameHud';
import CodeDocModal from './components/CodeDocModal';
import { checkBackendStatus } from './services/qiskitApi';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [backendInfo, setBackendInfo] = useState({ online: false });

  useEffect(() => {
    async function verifyBackend() {
      const info = await checkBackendStatus();
      setBackendInfo(info);
    }
    verifyBackend();
    const interval = setInterval(verifyBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col font-sans selection:bg-[#00e5ff] selection:text-black">
      
      {/* Top Header Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendInfo={backendInfo} 
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onStartGame={() => setActiveTab('game')} />
        )}

        {activeTab === 'game' && (
          <QuantumGameHud backendInfo={backendInfo} />
        )}

        {activeTab === 'code' && (
          <CodeDocModal />
        )}
      </main>

    </div>
  );
}
