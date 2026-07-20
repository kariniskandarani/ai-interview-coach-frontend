import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Upload, FileText, Briefcase, Check, CheckCircle2, AlertCircle,
  LogOut, User, Mail, Lock, Loader2, ArrowRight,
} from 'lucide-react';
import { uploadCvAndJobDescription, getSession } from '@/lib/api';
import { useInterview } from '@/context/InterviewContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const SESSION_ID_KEY = 'interview_session_id';
const PROFILE_KEY = 'interview_profile';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type LoadingPhase = 'reading' | 'analyzing' | 'generating';

const HERO_POINTS = [
  'Personalised questions based on your CV and the role',
  'Instant STAR method + clarity + relevance feedback',
  'Objective scoring after every answer',
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Bot className="w-5 h-5 text-primary" />
      </div>
      <span className="font-bold text-xl text-foreground tracking-tight">Interview Coach</span>
    </div>
  );
}

function HeroCopy() {
  return (
    <div className="space-y-8">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-sm font-mono text-primary uppercase tracking-widest">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        System Ready
      </div>

      <div className="space-y-5">
        <h1 className="text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
          Master the{' '}
          <span className="text-primary">interview.</span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
          Upload your CV and paste the job description. AI generates tailored questions and gives you real-time feedback on every answer.
        </p>
      </div>

      <ul className="space-y-4">
        {HERO_POINTS.map((text, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-base text-muted-foreground">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shown when there's no authenticated user and no guest session yet. */
function AuthGate() {
  const { setGuestMode } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo('Check your email to confirm your account, then log in.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <HeroCopy />

        <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
          <div className="flex bg-muted rounded-lg p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError(null); setInfo(null); }}
              className={`flex-1 py-2 rounded-md text-base font-semibold transition-colors ${
                mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
              className={`flex-1 py-2 rounded-md text-base font-semibold transition-colors ${
                mode === 'signup' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign up
            </button>
          </div>

          {error && (
            <div className="flex gap-2 items-start bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="bg-primary/10 border border-primary/20 text-primary rounded-lg px-4 py-3 mb-6 text-sm">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-lg text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Log in' : 'Create account'}
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={setGuestMode}
            className="w-full border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-base"
          >
            Try without an account
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2.5">
            Sessions won't be saved to history
          </p>
        </div>
      </main>
    </div>
  );
}

/** Shown once authenticated or in guest mode: the CV + job description upload flow. */
function ConfigureSession() {
  const [, setLocation] = useLocation();
  const { setSessionData, resumeSession } = useInterview();
  const { user, session, signOut } = useAuth();

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('reading');
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <p className="text-muted-foreground text-base">Resuming your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => setLocation('/history')}
                  className="text-base text-muted-foreground hover:text-foreground cursor-pointer px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  History
                </button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-full px-3.5 py-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[160px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-3.5 py-1.5">
                Guest mode — sessions won't be saved
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="relative w-full max-w-2xl">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">

            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-card/97 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                    />
                  </div>
                  <div className="flex gap-2 mb-7">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2.5">Preparing your interview</h3>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingPhase}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="text-base text-muted-foreground"
                    >
                      {getLoadingMessage()}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-sm text-muted-foreground/50 mt-7">Usually takes 15–40 seconds</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-8 md:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Configure Session</h2>
                <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">Step 1 of 1</span>
              </div>

              {error && (
                <div className="flex gap-2 items-start bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <FileText className="w-4 h-4" /> Your Resume
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-9 text-center cursor-pointer transition-all ${
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
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground text-base">{cvFile.name}</span>
                      <span className="text-sm text-muted-foreground">{formatFileSize(cvFile.size)} · PDF</span>
                      <span className="text-sm text-primary/70 mt-0.5">Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-muted-foreground/60" />
                      <span className="text-base font-medium text-foreground">Drop PDF or click to browse</span>
                      <span className="text-sm text-muted-foreground">PDF only · max 5 MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" /> Job Description
                </label>
                <textarea
                  placeholder="Paste the job description here..."
                  className="w-full min-h-[200px] resize-none rounded-xl border border-border bg-muted/40 px-5 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <button
                onClick={handleStart}
                disabled={isUploading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                Initialize Session
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Landing() {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex gap-1.5">
          {[0, 0.15, 0.3].map((delay, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!user && !isGuest) return <AuthGate />;
  return <ConfigureSession />;
}
