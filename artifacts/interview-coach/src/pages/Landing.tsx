import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Upload, FileText, Briefcase, Check, CheckCircle2, AlertCircle, LogOut, User } from 'lucide-react';
import { uploadCvAndJobDescription, getSession } from '@/lib/api';
import { useInterview } from '@/context/InterviewContext';
import { useAuth } from '@/context/AuthContext';

const SESSION_ID_KEY = 'interview_session_id';
const PROFILE_KEY = 'interview_profile';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type LoadingPhase = 'reading' | 'analyzing' | 'generating';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setSessionData, resumeSession } = useInterview();
  const { user, isGuest, session, signOut } = useAuth();

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('reading');
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // On mount: check localStorage for a saved session and try to resume
  useEffect(() => {
    const savedId = localStorage.getItem(SESSION_ID_KEY);
    if (!savedId) return;

    setIsResuming(true);
    getSession(savedId)
      .then((data) => {
        const savedProfile = localStorage.getItem(PROFILE_KEY);
        const profile = savedProfile ? JSON.parse(savedProfile) : null;
        resumeSession(savedId, profile, data);
        setLocation('/interview');
      })
      .catch(() => {
        localStorage.removeItem(SESSION_ID_KEY);
        localStorage.removeItem(PROFILE_KEY);
        setIsResuming(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    setError(null);
    setCvFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    setError(null);
    setCvFile(file);
  };

  const getLoadingMessage = () => {
    if (loadingPhase === 'reading') return 'Reading your CV...';
    if (loadingPhase === 'analyzing') return 'Analyzing your background against the role...';
    return 'Generating your personalized questions...';
  };

  const handleStart = async () => {
    if (!cvFile || !jobDescription.trim()) {
      setError('Please provide both your CV and the job description.');
      return;
    }
    setIsUploading(true);
    setError(null);
    setLoadingPhase('reading');

    const t1 = setTimeout(() => setLoadingPhase('analyzing'), 8000);
    const t2 = setTimeout(() => setLoadingPhase('generating'), 22000);

    try {
      const authToken = session?.access_token;
      const data = await uploadCvAndJobDescription(cvFile, jobDescription, authToken);
      clearTimeout(t1); clearTimeout(t2);
      setSessionData(data.session_id, data.profile, data.questions);
      setLocation('/interview');
    } catch (err: any) {
      clearTimeout(t1); clearTimeout(t2);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsUploading(false);
    }
  };

  if (isResuming) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 0.15, 0.3].map((delay, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">Resuming your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-foreground tracking-tight">Interview Coach</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => setLocation('/history')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  History
                </button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
                  <User className="w-3 h-3" />
                  <span className="max-w-[140px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={() => signOut().then(() => setLocation('/login'))}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-3 py-1">
                Guest mode — sessions won't be saved
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — hero copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/8 text-xs font-mono text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              System Ready
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.05]">
                Master the{' '}
                <span className="text-primary">interview.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Upload your CV and paste the job description. AI generates tailored questions and gives you real-time feedback on every answer.
              </p>
            </div>

            <ul className="space-y-3">
              {[
                'Personalised questions based on your CV and the role',
                'Instant STAR method + clarity + relevance feedback',
                'Objective scoring after every answer',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form card */}
          <div className="relative">
            <div className="bg-card border border-border rounded-xl overflow-hidden">

              {/* Loading overlay */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-card/97 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                      />
                    </div>
                    <div className="flex gap-1.5 mb-6">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Preparing your interview</h3>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingPhase}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm text-muted-foreground"
                      >
                        {getLoadingMessage()}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-xs text-muted-foreground/50 mt-6">Usually takes 15–40 seconds</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground tracking-tight">Configure Session</h2>
                  <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">Step 1 of 1</span>
                </div>

                {error && (
                  <div className="flex gap-2 items-start bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2.5 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* CV upload */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" /> Your Resume
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                      cvFile
                        ? 'border-primary/50 bg-primary/5'
                        : isDragging
                        ? 'border-primary bg-primary/8'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    {cvFile ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground text-sm">{cvFile.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(cvFile.size)} · PDF</span>
                        <span className="text-xs text-primary/70 mt-0.5">Click to change</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="w-8 h-8 text-muted-foreground/60" />
                        <span className="text-sm font-medium text-foreground">Drop PDF or click to browse</span>
                        <span className="text-xs text-muted-foreground">PDF only · max 5 MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job description */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5" /> Job Description
                  </label>
                  <textarea
                    placeholder="Paste the job description here..."
                    className="w-full min-h-[140px] resize-none rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleStart}
                  disabled={isUploading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  Initialize Session
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
