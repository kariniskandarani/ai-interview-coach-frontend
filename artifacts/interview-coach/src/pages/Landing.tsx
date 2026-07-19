import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Briefcase, FileText, Loader2, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { uploadCvAndJobDescription } from '@/lib/api';
import { useInterview } from '@/context/InterviewContext';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setSessionData } = useInterview();
  
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'uploading' | 'analyzing' | 'generating' | 'waking'>('waking');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Simulate progress phases for better UX during cold start (max 60s)
    const phases: Array<'uploading' | 'analyzing' | 'generating' | 'waking'> = ['waking', 'uploading', 'analyzing', 'generating'];
    let phaseIndex = 0;
    
    const progressInterval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setLoadingPhase(phases[phaseIndex]);
    }, 4000);

    try {
      const data = await uploadCvAndJobDescription(cvFile, jobDescription);
      clearInterval(progressInterval);
      setSessionData(data.session_id, data.profile, data.questions);
      setLocation('/interview');
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setIsUploading(false);
    }
  };

  const getLoadingMessage = () => {
    switch (loadingPhase) {
      case 'waking': return 'Connecting to AI systems (this might take a moment)...';
      case 'uploading': return 'Reading your CV...';
      case 'analyzing': return 'Cross-referencing with the job description...';
      case 'generating': return 'Generating your personalized mock interview...';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-lg tracking-tight">AI Interview Coach</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium bg-muted/50 text-muted-foreground">
                Practice the interview before it counts
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
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
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/80 font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <Card className="shadow-xl shadow-primary/5 border-border overflow-hidden">
              <CardContent className="p-0 flex flex-col relative">
                
                <AnimatePresence>
                  {isUploading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-card/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                    >
                      <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                      <h3 className="text-xl font-bold text-foreground mb-2">Preparing your interview</h3>
                      <p className="text-muted-foreground min-h-[1.5rem] transition-opacity duration-300">
                        {getLoadingMessage()}
                      </p>
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
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
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
                          <FileText className="w-10 h-10 text-primary" />
                          <span className="font-medium text-foreground">{cvFile.name}</span>
                          <span className="text-xs text-muted-foreground cursor-pointer hover:text-primary">Click to change</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 cursor-pointer">
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
                      placeholder="Paste the full job posting here..." 
                      className="min-h-[160px] resize-none text-base p-4"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-semibold shadow-md" 
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