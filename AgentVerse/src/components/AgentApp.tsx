import React, { useState, useRef, useEffect } from 'react';
import { Target, GraduationCap, Award, Network, Map as MapIcon, Send, Sparkles, User, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Agent = {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
};

const AGENTS: Agent[] = [
  { id: 'goal-analysis',    name: 'Goal Analysis',    icon: Target,        color: '#06b6d4', description: 'Analyze your career & academic goals.' },
  { id: 'university',       name: 'University Match', icon: GraduationCap, color: '#8b5cf6', description: 'Discover programs and campus insights.' },
  { id: 'scholarship',      name: 'Scholarship Scout',icon: Award,         color: '#f59e0b', description: 'Find grants and funding opportunities.' },
  { id: 'profile-analysis', name: 'Profile Analysis', icon: Network,       color: '#10b981', description: 'Evaluate strengths and gaps.' },
  { id: 'roadmap',          name: 'Roadmap Generator',icon: MapIcon,       color: '#f43f5e', description: 'Generate timelines and action steps.' },
];

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  agentId: string;
};

export default function AgentApp() {
  const [activeAgentId, setActiveAgentId] = useState<string>(AGENTS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeAgent = AGENTS.find(a => a.id === activeAgentId)!;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, agentId: activeAgentId };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Only send history for the active agent
      const agentHistory = updatedMessages
        .filter(m => m.agentId === activeAgentId)
        .map(m => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: agentHistory.slice(0, -1), // exclude the message we just sent
          agentId: activeAgentId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Request failed');
      }

      const data = await res.json();
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.text,
        agentId: activeAgentId,
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `**Error:** ${err.message || 'Transmission failed. Please try again.'}`,
        agentId: activeAgentId,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeMessages = messages.filter(m => m.agentId === activeAgentId);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#020617]">
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-8 h-20 border-b border-slate-800/80 bg-[#020617]/90 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-cyan-500/20">i</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">iTaqiZ</h1>
            <p className="text-xs font-medium text-cyan-400">AgentVerse Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">All Systems Operational</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-80 border-r border-slate-800/80 p-6 flex flex-col bg-[#020617]/95 overflow-y-auto shrink-0 hidden lg:flex z-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 px-2">
            <Settings2 className="w-4 h-4" /> Active Agents
          </div>
          <div className="space-y-3">
            {AGENTS.map((agent) => {
              const isActive = activeAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl flex items-center justify-center ${isActive ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                      <agent.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    </div>
                    <span className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{agent.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-[3.25rem] leading-relaxed">{agent.description}</p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-1 flex flex-col bg-[#060a15] relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">

            {/* Mobile Agent Picker */}
            <div className="lg:hidden flex space-x-2 overflow-x-auto pb-2 shrink-0 no-scrollbar">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full border whitespace-nowrap transition-colors flex items-center gap-2 ${
                    activeAgentId === agent.id
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <agent.icon className="w-4 h-4" />
                  {agent.name}
                </button>
              ))}
            </div>

            {activeMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
                <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-cyan-900/20">
                  <activeAgent.icon className="w-12 h-12 text-cyan-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Welcome to <span className="text-cyan-400">{activeAgent.name}</span>
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  {activeAgent.description} Ask a question or provide context to begin.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div onClick={() => setInput('Can you explain how you can help me?')} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-left cursor-pointer hover:bg-slate-800 transition-colors">
                    <span className="text-sm font-medium text-slate-300">"Can you explain how you can help me?"</span>
                  </div>
                  <div onClick={() => setInput('What information do you need to get started?')} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-left cursor-pointer hover:bg-slate-800 transition-colors">
                    <span className="text-sm font-medium text-slate-300">"What information do you need to get started?"</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-4">
                {activeMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                    <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="shrink-0 mt-2">
                        {msg.role === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                            <User className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className={`rounded-3xl px-6 py-4 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-slate-800/80 text-white border border-slate-700/50 rounded-tr-sm'
                          : 'bg-cyan-950/20 text-slate-200 border border-cyan-900/30 rounded-tl-sm'
                      }`}>
                        {msg.role === 'model' && (
                          <div className="flex items-center mb-2">
                            <span className="text-[11px] font-bold text-cyan-500 uppercase tracking-wider">
                              {AGENTS.find(a => a.id === msg.agentId)?.name || 'Agent'}
                            </span>
                          </div>
                        )}
                        <div className="prose prose-invert prose-sm md:prose-base prose-cyan max-w-none text-slate-300">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start w-full">
                    <div className="flex gap-4 max-w-[85%]">
                      <div className="shrink-0 mt-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 text-cyan-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-3xl rounded-tl-sm px-6 py-5 flex items-center gap-3">
                        <div className="flex gap-1.5 h-2">
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-slate-800/80 bg-[#020617]/95 backdrop-blur-md shrink-0">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3 md:gap-4 relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={`Message ${activeAgent.name}...`}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-full pl-6 pr-14 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full flex items-center justify-center disabled:opacity-50 disabled:hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" />
              </button>
            </form>
            <div className="text-center mt-3 text-xs text-slate-500">
              AI systems can make mistakes. Please verify critical information.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
