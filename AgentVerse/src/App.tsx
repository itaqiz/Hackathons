import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AgentApp from './components/AgentApp';

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-50 flex flex-col overflow-hidden font-sans selection:bg-cyan-500/30">
      {view === 'landing' ? (
        <LandingPage onEnter={() => setView('app')} />
      ) : (
        <AgentApp />
      )}
    </div>
  );
}
