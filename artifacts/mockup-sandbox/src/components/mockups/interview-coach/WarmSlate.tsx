import React, { useState } from 'react';
import { UploadCloud, MessageSquare, History, Send, CheckCircle2, FileText, Mic, Star, ChevronRight } from 'lucide-react';

export function WarmSlate() {
  const [activeTab, setActiveTab] = useState<'landing' | 'chat' | 'history'>('landing');

  return (
    <div className="min-h-screen w-full bg-stone-50 font-sans text-stone-900 flex flex-col">
      {/* Top Navigation / Tabs for Sandbox only */}
      <nav className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center text-white font-serif italic font-bold text-lg">C</div>
             <span className="font-semibold text-stone-900 tracking-tight">Coach</span>
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'landing' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Setup
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Interview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
            >
              History
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {activeTab === 'landing' && <LandingView />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'history' && <HistoryView />}
      </main>
    </div>
  );
}

function LandingView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
      <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white font-serif italic text-2xl font-bold mb-8 shadow-sm">C</div>
      
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-5xl font-serif text-stone-900 mb-4 tracking-tight leading-tight">Master your next interview.</h1>
        <p className="text-stone-500 text-lg max-w-md mx-auto leading-relaxed">
          Upload your resume and the job description. Get personalized, conversational practice with instant feedback.
        </p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl ring-1 ring-stone-200 shadow-sm p-8">
        <div className="space-y-6">
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Your Resume</label>
            <div className="border border-dashed border-stone-300 rounded-xl p-6 flex flex-col items-center justify-center bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer group">
              <UploadCloud className="w-6 h-6 text-stone-400 group-hover:text-violet-500 transition-colors mb-2" />
              <span className="text-sm text-stone-500 font-medium">Upload PDF or DOCX</span>
              <span className="text-xs text-stone-400 mt-1">Max 5MB</span>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Job Description</label>
            <textarea 
              rows={4}
              placeholder="Paste the role requirements here..."
              className="w-full rounded-xl border border-stone-200 p-4 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 resize-none bg-white placeholder:text-stone-400"
            ></textarea>
          </div>

          <button className="w-full bg-violet-600 text-white rounded-xl py-3.5 font-medium text-sm hover:bg-violet-700 transition-colors">
            Start Mock Interview
          </button>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-8 text-sm text-stone-500 font-medium">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-stone-400" />
          <span>1. Upload details</span>
        </div>
        <div className="w-4 h-[1px] bg-stone-300"></div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-stone-400" />
          <span>2. Chat practice</span>
        </div>
        <div className="w-4 h-[1px] bg-stone-300"></div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-stone-400" />
          <span>3. Get feedback</span>
        </div>
      </div>
    </div>
  );
}

function ChatView() {
  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto bg-white border-x border-stone-200 shadow-sm min-h-0">
      
      {/* Interview Header */}
      <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white z-10">
        <div>
          <h2 className="font-semibold text-stone-900">Senior Product Designer</h2>
          <p className="text-xs text-stone-500 mt-0.5">Stripe • Question 3 of 8</p>
        </div>
        <div className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium border border-violet-100">
          Behavioral
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/50">
        
        {/* AI Question */}
        <div className="flex gap-4 max-w-[85%]">
          <div className="flex-shrink-0 mt-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-600"></div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-5 py-4 text-stone-800 text-sm leading-relaxed shadow-sm">
            <p>Tell me about a time when you had to advocate for a design decision that stakeholders initially pushed back against. How did you handle the situation and what was the outcome?</p>
          </div>
        </div>

        {/* User Answer */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-violet-600 text-white rounded-2xl rounded-tr-sm px-5 py-4 text-sm leading-relaxed max-w-[85%] shadow-sm">
            <p>At my last company, the product team wanted to skip the user testing phase for a new checkout flow to save time. I pushed back by organizing a quick, 2-day guerilla testing session that uncovered a major usability flaw. By showing a video clip of a user struggling to complete a purchase, I convinced them to delay the launch by a week. The revised flow increased conversion by 15%.</p>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="flex justify-end w-full">
          <div className="bg-white border border-stone-200 rounded-xl max-w-[85%] w-full relative overflow-hidden shadow-sm">
            {/* Left Accent Stripe */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-600"></div>
            
            <div className="p-5 pl-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Feedback</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-violet-600">8</span>
                  <span className="text-xs text-stone-400">/10</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-stone-700 leading-relaxed">
                  Strong example using the STAR method. Your action was proactive and the result was quantifiable (15% conversion increase).
                </p>
                <div className="bg-stone-50 rounded-lg p-3 border border-stone-100 text-sm text-stone-600">
                  <strong className="text-stone-800 font-medium">To improve:</strong> Briefly mention how you communicated this flaw without making the product team feel alienated.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next AI Question */}
        <div className="flex gap-4 max-w-[85%]">
          <div className="flex-shrink-0 mt-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-600"></div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-5 py-4 text-stone-800 text-sm leading-relaxed shadow-sm">
            <p>Great insight. Following up on that, how do you typically balance the need for pixel-perfect polish with the pressure to ship quickly?</p>
          </div>
        </div>

      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-200 z-10">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            rows={1}
            placeholder="Type your answer..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 resize-none min-h-[52px]"
          />
          <button className="absolute right-2 bottom-2 p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-3 px-1">
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Mic className="w-3.5 h-3.5" /> Speak answer
          </span>
          <span className="text-xs text-stone-400">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}

function HistoryView() {
  const sessions = [
    { role: "Senior Product Designer", company: "Stripe", date: "Today, 10:30 AM", score: 85, status: "completed" },
    { role: "UX Researcher", company: "Airbnb", date: "Yesterday", score: 92, status: "completed" },
    { role: "Product Designer", company: "Linear", date: "Oct 12, 2023", score: null, status: "in-progress" },
    { role: "Frontend Developer", company: "Vercel", date: "Sep 28, 2023", score: 78, status: "completed" },
  ];

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 mb-2">Past Interviews</h1>
          <p className="text-stone-500 text-sm">Review your previous sessions and feedback.</p>
        </div>
        <button className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-sm">
          New Interview
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((session, i) => (
          <div 
            key={i} 
            className="group bg-white rounded-xl p-5 border border-stone-200 hover:border-violet-300 transition-colors cursor-pointer shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.status === 'completed' ? 'bg-violet-50' : 'bg-stone-50'}`}>
                {session.status === 'completed' ? (
                  <CheckCircle2 className={`w-6 h-6 ${session.status === 'completed' ? 'text-violet-600' : 'text-stone-300'}`} />
                ) : (
                  <History className="w-5 h-5 text-stone-400" />
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-stone-900">{session.role}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-stone-500">{session.company}</span>
                  <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                  <span className="text-sm text-stone-400">{session.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {session.status === 'completed' ? (
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-lg font-bold text-stone-900">{session.score}</span>
                    <span className="text-xs text-stone-400">/100</span>
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                    Completed
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-sm font-medium text-stone-500">In progress</span>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                      Draft
                    </span>
                  </div>
                </div>
              )}
              
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-violet-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
