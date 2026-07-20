import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  MessageSquare, 
  History as HistoryIcon, 
  Send, 
  CheckCircle2, 
  Play, 
  ArrowRight,
  User,
  Bot,
  Star,
  Check,
  ChevronRight
} from 'lucide-react';

export function FocusedLight() {
  const [activeTab, setActiveTab] = useState<'landing' | 'chat' | 'history'>('landing');

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sky-600 font-semibold text-lg tracking-tight">
          <Bot className="w-6 h-6" />
          <span>InterviewAI</span>
        </div>
        <nav className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('landing')}
            className={`text-sm font-medium transition-colors ${activeTab === 'landing' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            New Interview
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`text-sm font-medium transition-colors ${activeTab === 'chat' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Active Session
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <HistoryIcon className="w-4 h-4" />
            History
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {activeTab === 'landing' && <LandingTab onStart={() => setActiveTab('chat')} />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'history' && <HistoryTab />}
      </main>
    </div>
  );
}

function LandingTab({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-16">
      
      {/* Left Column: Copy */}
      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Nail your next interview with precision.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-md">
            Upload your CV and paste the job description. Our AI generates tailored questions and provides instant, actionable feedback.
          </p>
        </div>

        <ul className="space-y-4">
          {[
            'Personalised questions based on the role',
            'Instant STAR method feedback',
            'Objective scoring and clarity review',
            'Review past sessions to track progress'
          ].map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: Form Card */}
      <div className="flex-1 w-full max-w-md">
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Setup your session</h2>
          
          <div className="space-y-6">
            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload your CV</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-sky-300 transition-colors cursor-pointer bg-white">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PDF or DOCX up to 5MB</p>
              </div>
            </div>

            {/* Simulated selected file */}
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <FileText className="w-5 h-5 text-sky-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">alex_doe_resume_2024.pdf</p>
                <p className="text-xs text-slate-500">2.4 MB</p>
              </div>
              <Check className="w-5 h-5 text-green-500" />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
              <textarea 
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow placeholder:text-slate-400"
                placeholder="Paste the job description here..."
                defaultValue="Senior Product Designer at TechCorp. Looking for someone with experience in design systems, user research, and cross-functional collaboration..."
              />
            </div>

            <button 
              onClick={onStart}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Start Interview
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

function ChatTab() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-65px)]">
      
      {/* Session Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div>
          <h2 className="font-semibold text-slate-900">Senior Product Designer</h2>
          <p className="text-xs text-slate-500">Question 3 of 8</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 fill-sky-600" />
          <span>Current Score: 8.5/10</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
        
        {/* Previous Question & Answer & Feedback */}
        <div className="space-y-6 opacity-60">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none">
              <p className="text-slate-700 text-sm leading-relaxed">
                Can you describe a time when you had to advocate for a user-centered design decision that conflicted with engineering constraints?
              </p>
            </div>
          </div>

          <div className="flex gap-4 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 bg-sky-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[85%]">
              <p className="text-sm leading-relaxed">
                At my last company, we were building a new checkout flow. Engineering wanted to use a standard multi-page form because it was easier to integrate with our legacy backend. However, user research showed high drop-off rates on multi-page checkouts. I built a prototype of a single-page accordion checkout and ran A/B tests showing a 15% increase in conversion. I presented this data to the engineering lead, and we compromised by building the frontend as a single page while keeping the backend calls sequential.
              </p>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="ml-12 pl-4 border-l-2 border-sky-500 max-w-[80%]">
            <div className="bg-slate-50 p-4 rounded-xl rounded-tl-none relative">
              <div className="absolute top-4 right-4 text-xs font-bold bg-sky-100 text-sky-700 px-2 py-1 rounded">
                8/10
              </div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">Feedback</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-3 pr-12">
                Strong response using the STAR method. You clearly outlined the Situation and Task, explained your Action (prototype and A/B test), and shared the Result (compromise and conversion increase). 
              </p>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">Good evidence</span>
                <span className="inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-medium">Could detail impact more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-sky-600" />
          </div>
          <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none shadow-sm">
            <p className="text-slate-800 text-sm leading-relaxed font-medium">
              That's a great example of using data to drive consensus. 
              <br/><br/>
              Next question: How do you approach creating and maintaining a design system, particularly when scaling a product across multiple platforms?
            </p>
          </div>
        </div>

      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="relative max-w-4xl mx-auto flex items-end gap-3">
          <textarea 
            className="w-full max-h-32 min-h-[56px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent focus:bg-white transition-all resize-none placeholder:text-slate-400"
            placeholder="Type your answer here..."
            rows={1}
          />
          <button className="absolute right-3 bottom-2 p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[11px] text-slate-400">Press Enter to send, Shift + Enter for new line</p>
        </div>
      </div>

    </div>
  );
}

function HistoryTab() {
  const sessions = [
    { role: 'Senior Product Designer', company: 'TechCorp', date: 'Oct 24, 2024', score: 8.5, status: 'Completed' },
    { role: 'UX Researcher', company: 'InnovateInc', date: 'Oct 20, 2024', score: 7.2, status: 'Completed' },
    { role: 'Product Designer', company: 'StartupX', date: 'Oct 15, 2024', score: null, status: 'In Progress' },
    { role: 'Lead Designer', company: 'GlobalCorp', date: 'Sep 30, 2024', score: 9.0, status: 'Completed' },
  ];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 lg:p-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Interview History</h1>
        <p className="text-slate-500 mt-1 text-sm">Review your past sessions and track your progress.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-6">Role & Company</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right">Date</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {sessions.map((session, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="col-span-6">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  {session.role}
                  <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-sm text-slate-500">{session.company}</div>
              </div>
              <div className="col-span-2 text-right font-medium">
                {session.score ? (
                  <span className="text-slate-900">{session.score} <span className="text-slate-400 text-xs font-normal">/10</span></span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </div>
              <div className="col-span-2 text-right text-sm text-slate-500">
                {session.date}
              </div>
              <div className="col-span-2 text-right flex justify-end">
                {session.status === 'Completed' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
