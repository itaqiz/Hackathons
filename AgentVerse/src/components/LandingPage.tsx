import React from 'react';
import { ChevronRight, Target, GraduationCap, Award, Network, Map as MapIcon } from 'lucide-react';

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#020617]">
      <header className="flex justify-between items-center px-6 md:px-8 h-20 border-b border-slate-800/80 bg-[#020617]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-cyan-500/20">i</div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-none">iTaqiZ</h1>
            <p className="text-xs font-medium text-cyan-400 hidden sm:block mt-1">AgentVerse Core</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-[#020617] relative">
        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center py-12 px-6 my-auto mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Multi-Agent AI Platform
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white text-center mb-6 leading-tight">
            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Scholars</span><br className="hidden md:block" /> Through AI.
          </h2>
    
          <p className="text-slate-400 text-base md:text-xl max-w-2xl text-center leading-relaxed mb-12">
            A specialized intelligence hub designed to accelerate research, academic planning, and scholarship discovery across 5 distributed agents.
          </p>
    
          <button 
            onClick={onEnter}
            className="group px-8 py-4 bg-white text-slate-950 font-semibold rounded-full hover:bg-slate-100 transition-all flex items-center gap-3 shadow-xl hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
          >
            Initialize Agents
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
    
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-20 md:mt-24 w-full max-w-5xl mx-auto">
             {[
               { icon: Target, label: 'Goal Analysis' },
               { icon: GraduationCap, label: 'University Match' },
               { icon: Award, label: 'Scholarships' },
               { icon: Network, label: 'Profile Analysis' },
               { icon: MapIcon, label: 'Roadmap Generation' }
             ].map((feat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col items-center text-center space-y-4 hover:bg-slate-800/50 transition-colors">
                  <feat.icon className="w-8 h-8 text-cyan-400" />
                  <h3 className="font-medium text-sm text-slate-200">{feat.label}</h3>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
