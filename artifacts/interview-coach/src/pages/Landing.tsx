import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Briefcase, FileText, Loader2, Sparkles, Check, AlertCircle, History, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { uploadCvAndJobDescription, getSession } from '@/lib/api';
import { useInterview } from '@/context/InterviewContext';

const SESSION_ID_KEY = 'interview_session_id';
const PROFILE_KEY = 'interview_profile';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setSessionData, resumeSession } = useInterview();
  
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'reading' | 'analyzing' | 'generating'>('reading');
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
        // Session expired (e.g. free-tier server restart) — clear and show form normally
        localStorage.removeItem(SESSION_ID_KEY);
        localStorage.removeItem(PROFILE_KEY);
        setIsResuming(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      setError(null);
      setCvFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      setError(null);
      setCvFile(file);
    }
  };

  const handleStart = async () => {
    if (!cvFile || !jobDescription.trim()) {
      setError('Please provide both your CV and the job description.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setLoadingPhase('reading');

    // Linear staged loading — reflects what's actually happening on the backend
    const t1 = setTimeout(() => setLoadingPhase('analyzing'), 8000);
    const t2 = setTimeout(() => setLoadingPhase('generating'), 22000);

    try {
      const data = await uploadCvAndJobDescription(cvFile, jobDescription);
      clearTimeout(t1);
      clearTimeout(t2);
      setSessionData(data.session_id, data.profile, data.questions);
      setLocation('/interview');
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsUploading(false);
    }
  };

  const getLoadingMessage = () => {
    switch (loadingPhase) {
      case 'reading':    return 'Reading your CV...';
      case 'analyzing':  return 'Analyzing your background against the role...';
      case 'generating': return 'Generating your personalized interview questions...';
    }
  };

  // Resuming overlay — shown briefly while we fetch the saved session
  if (isResuming) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex gap-2">
            <motion.div className="w-3 h-3 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
            <motion.div className="w-3 h-3 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.div className="w-3 h-3 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
          </div>
          <p className="text-muted-foreground">Resuming your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-lg tracking-tight">AI Interview Coach</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation('/history')} className="gap-2 text-muted-foreground hover:text-foreground">
            <History className="w-4 h-4" />
            History
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8 relative z-10">
            {/* Background radial glow */}
            <div 
              className="absolute -inset-20 z-[-1] pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, hsl(199 89% 48% / 0.1) 0%, transparent 70%)'
              }}
            />
            
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium bg-muted/50 text-muted-foreground">
                Practice the interview before it counts
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Walk in already having done this once.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Turn any job posting and your CV into a personalized mock interview. 
                Get real, specific feedback after every answer from an AI calibrated to test your real skills.
              </p>
            </div>
            
            <ul className="space-y-4">
              {[
                "Every question is tailored to your unique experience and the specific role.",
                "Real-time feedback on clarity, relevance, and impact.",
                "Follow-up questions when your answer needs more depth, just like a real interviewer."
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/80 font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <Card className="shadow-2xl shadow-primary/10 border-border overflow-hidden rounded-2xl">
              <CardContent className="p-0 flex flex-col relative">
                
                <AnimatePresence>
                  {isUploading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                    >
                      {/* Indeterminate thin progress bar at top */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                      </div>
                      
                      <div className="flex gap-2 mb-6">
                        <motion.div className="w-3 h-3 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                        <motion.div className="w-3 h-3 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-3 h-3 rounded-full bg-primary" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">Preparing your interview</h3>
                      <div className="min-h-[1.5rem] relative w-full flex justify-center">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={loadingPhase}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="text-muted-foreground absolute text-sm"
                          >
                            {getLoadingMessage()}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                      <p className="text-xs text-muted-foreground/60 mt-8">This usually takes 15–40 seconds</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-6 md:p-8 space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      Step 1: Your CV (PDF)
                    </div>
                    
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                        cvFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                      />
                      {cvFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          </div>
                          <span className="font-semibold text-foreground">{cvFile.name}</span>
                          <span className="text-xs text-muted-foreground">{formatFileSize(cvFile.size)} · PDF</span>
                          <span className="text-xs text-primary/70 hover:text-primary transition-colors mt-1">Click to change file</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-10 h-10 text-muted-foreground" />
                          <span className="font-medium text-foreground">Drop your CV here or click to browse</span>
                          <span className="text-xs text-muted-foreground">PDF only</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      Step 2: The Job Description
                    </div>
                    <Textarea 
                      placeholder="Paste the job description here..." 
                      className="min-h-[160px] resize-none text-base p-4"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-semibold shadow-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]" 
                    onClick={handleStart}
                    disabled={isUploading}
                  >
                    Analyze & Start Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
