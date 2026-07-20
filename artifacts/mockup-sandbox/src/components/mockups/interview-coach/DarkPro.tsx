import React, { useState } from 'react';
import { UploadCloud, FileText, Send, CheckCircle2, ChevronRight, Bot, Play, Sparkles } from 'lucide-react';

export function DarkPro() {
  const [activeTab, setActiveTab] = useState('landing');

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-cyan-400/30">
      {/* Navigation Tabs (for mockup purposes only) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-lg tracking-tight">Intervue.ai</span>
          </div>
          <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveTab('landing')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'landing' ? 'bg-cyan-400/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              Setup
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'chat' ? 'bg-cyan-400/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              Session
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-cyan-400/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 min-h-screen">
        {activeTab === 'landing' && <LandingView />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'history' && <HistoryView />}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1e293b;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}

function LandingView() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <Sparkles className="w-3 h-3" /> System Ready
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
          Master the <br />
          <span className="text-cyan-400">interview.</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-md">
          Upload your CV, paste the job description, and face an AI that questions like a real hiring manager. Real-time feedback, deeper insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm text-slate-400 font-medium pt-4 border-t border-slate-800/50 max-w-md">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400"/> Instant Setup</div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700"></div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400"/> STAR Framework</div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700"></div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400"/> Tech & Behavioral</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-8 flex items-center justify-between">
          <span>Configure Session</span>
          <span className="text-xs font-mono text-slate-500 font-normal">STEP 1 OF 1</span>
        </h2>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300">Your Resume</label>
            <div className="border-2 border-dashed border-cyan-400/30 bg-slate-800/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800 hover:border-cyan-400/60 transition-all group">
              <UploadCloud className="w-8 h-8 text-cyan-400/60 group-hover:text-cyan-400 mb-3 transition-colors" />
              <p className="text-sm text-white font-medium mb-1">Upload PDF Document</p>
              <p className="text-xs text-slate-500">Max size 5MB</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300">Job Description</label>
            <textarea 
              placeholder="Paste the role requirements, tech stack, and responsibilities here..."
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none transition-all text-sm leading-relaxed"
            ></textarea>
          </div>

          <button className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-4">
            <Play className="w-4 h-4 fill-slate-950" /> 
            INITIALIZE SESSION
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Senior Product Designer
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-400 border border-slate-700">TechNova</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Question 3 of 8</p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-48">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 w-3/8 rounded-full" style={{width: '37.5%'}}></div>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 tracking-wider">37.5% COMPLETE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 pb-8 custom-scrollbar">
        {/* Previous Message Pair */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-2 max-w-[85%] sm:max-w-2xl">
            <div className="bg-slate-800 rounded-lg rounded-tl-none p-4 text-slate-300 text-sm leading-relaxed border border-slate-700/50">
              Can you walk me through a time when you had to advocate for user experience in the face of strict engineering constraints?
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-row-reverse">
          <div className="w-8 h-8 rounded bg-cyan-400/20 flex items-center justify-center flex-shrink-0 border border-cyan-400/30">
            <span className="text-[10px] font-bold text-cyan-400">YOU</span>
          </div>
          <div className="space-y-4 max-w-[85%] sm:max-w-2xl flex flex-col items-end">
            <div className="bg-cyan-400/10 border-l-2 border-cyan-400 rounded-lg rounded-tr-none p-4 text-white text-sm leading-relaxed">
              At my previous role, engineering wanted to ship a dashboard without mobile responsiveness due to a tight deadline. I gathered analytics showing 40% of our daily active users logged in via mobile. I compromised by designing a streamlined mobile view that only surfaced the three most critical metrics, which engineering agreed was feasible to build in the timeframe.
            </div>
            
            {/* Feedback Card */}
            <div className="w-full sm:w-5/6 bg-slate-800 border border-slate-700 border-l-2 border-l-cyan-400 rounded-lg p-4 self-end">
              <div className="flex items-start justify-between mb-4 border-b border-slate-700/50 pb-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Response Analysis
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-cyan-400 font-mono font-bold text-xl leading-none">8</span>
                  <span className="text-xs text-slate-500 font-mono">/10</span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <p className="text-slate-300"><strong className="text-white font-medium mr-1">Clarity:</strong> Excellent. Direct and specific.</p>
                <p className="text-slate-300"><strong className="text-white font-medium mr-1">STAR Method:</strong> Good use of Situation and Action. The Result could be stronger—did shipping the streamlined view improve engagement?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center flex-shrink-0 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-2 max-w-[85%] sm:max-w-2xl">
            <div className="bg-slate-800 rounded-lg rounded-tl-none p-4 text-slate-200 text-sm leading-relaxed border border-slate-700/50">
              That's a practical compromise. What metrics did you track after launching the streamlined mobile dashboard, and how did they compare to the desktop experience?
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="relative group">
          <textarea 
            placeholder="Type your response here..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-16 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none h-28 text-sm transition-all"
          ></textarea>
          <button className="absolute bottom-4 right-4 p-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-md transition-colors shadow-lg">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500 font-mono">Press Enter to send, Shift + Enter for new line</p>
          <div className="text-xs font-mono text-cyan-400/70">Recording... 00:45</div>
        </div>
      </div>
    </div>
  );
}

function HistoryView() {
  const sessions = [
    { role: 'Senior Product Designer', company: 'TechNova', date: 'Oct 24, 2023', score: 85, status: 'Completed' },
    { role: 'UX Researcher', company: 'GlobalData', date: 'Oct 20, 2023', score: 92, status: 'Completed' },
    { role: 'Frontend Engineer', company: 'Startup Inc', date: 'Oct 15, 2023', score: 78, status: 'Completed' },
    { role: 'Product Manager', company: 'Innovate LLC', date: 'Oct 10, 2023', score: null, status: 'Incomplete' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Session History</h2>
          <p className="text-sm text-slate-400">Review past interviews and track your performance over time.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-700">
          Export Report
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((session, i) => (
          <div key={i} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer">
            <div className="flex items-center gap-4 sm:gap-5 mb-4 sm:mb-0">
              <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-cyan-400/50 transition-colors shadow-inner">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">{session.role}</h3>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400 font-mono">
                  <span>{session.company}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span>{session.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto">
              {session.status === 'Completed' ? (
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">SCORE</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-mono font-bold text-white">{session.score}</span>
                    <span className="text-xs text-slate-500 font-mono">/100</span>
                  </div>
                </div>
              ) : (
                <span className="px-3 py-1 bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-800">
                  {session.status}
                </span>
              )}
              
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
