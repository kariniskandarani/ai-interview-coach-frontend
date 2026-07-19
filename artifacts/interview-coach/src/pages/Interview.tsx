import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, Loader2, Star, CheckCircle2, RotateCcw, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { submitAnswer, getSession } from '@/lib/api';
import { useInterview } from '@/context/InterviewContext';

// A helper for parsing markdown-like strong text in feedback
const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// A helper to map category to color
const getCategoryStyle = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('technical')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (normalized.includes('behavioral')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (normalized.includes('hr')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-muted text-muted-foreground border-border';
};

// A helper to map score to color and style
const getScoreStyle = (score: number) => {
  if (score >= 8) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (score >= 5) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-red-50 text-red-700 border border-red-200';
};

const getScoreInterpretation = (score: number) => {
  if (score >= 8) return 'Strong performance';
  if (score >= 5) return 'Solid foundation';
  return 'Needs improvement';
};

export default function Interview() {
  const [, setLocation] = useLocation();
  const { sessionId, profile, interviewData, updateInterviewData, resetInterview } = useInterview();
  
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) {
      setLocation('/');
    }
  }, [sessionId, setLocation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interviewData?.transcript, interviewData?.current_question_text, isSubmitting]);

  if (!sessionId || !interviewData) {
    return null; // Will redirect shortly
  }

  const handleSend = async () => {
    if (!answerText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const currentAnswer = answerText;
    setAnswerText(''); // optimistic clear

    try {
      const data = await submitAnswer(sessionId, currentAnswer);
      updateInterviewData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer. Please try again.');
      setAnswerText(currentAnswer); // restore on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    handleSend();
  };

  // Completion Summary View
  if (interviewData.finished) {
    const totalScore = interviewData.transcript.reduce((acc, entry) => acc + entry.evaluation.score, 0);
    const avgScore = interviewData.transcript.length > 0 ? Math.round((totalScore / interviewData.transcript.length) * 10) / 10 : 0;
    
    return (
      <div className="min-h-screen bg-background font-sans py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Interview Complete</h1>
            <p className="text-xl text-muted-foreground">
              You've finished the mock interview. Here is your comprehensive feedback.
            </p>
          </div>

          <Card className="border-border shadow-sm">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overall Performance</h3>
                
                <div className="flex flex-col items-center md:items-start gap-1">
                  <div className={`inline-flex items-baseline gap-2 px-6 py-2 rounded-xl ${getScoreStyle(avgScore)}`}>
                    <span className="text-5xl font-black">{avgScore}</span>
                    <span className="text-2xl font-normal opacity-70">/ 10</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground mt-1 ml-1">
                    {getScoreInterpretation(avgScore)}
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Role alignment</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Target Role:</span> <span className="font-medium text-foreground">{profile?.role_type}</span></div>
                  <div><span className="text-muted-foreground">Seniority:</span> <span className="font-medium text-foreground">{profile?.seniority}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-6 h-6" /> Detailed Feedback
            </h2>
            
            {interviewData.transcript.map((entry, index) => (
              <Card key={index} className="overflow-hidden border-border shadow-sm">
                <div className="bg-muted/30 p-6 border-b border-border">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryStyle(entry.category)}`}>
                      {entry.category}
                    </span>
                    <div className="font-bold text-lg flex items-center gap-2">
                      Score: 
                      <span className={`px-2 py-0.5 rounded-md text-base ${getScoreStyle(entry.evaluation.score)}`}>
                        {entry.evaluation.score}<span className="text-xs font-normal opacity-70">/10</span>
                      </span>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground leading-snug">{entry.question_text}</h4>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Answer</h5>
                    <p className="text-foreground/90 whitespace-pre-wrap">{entry.answer_text}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10 p-4 rounded-lg">
                    <div>
                      <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Clarity & Structure</h5>
                      <p className="text-sm text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.clarity_feedback} /></p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Relevance & Impact</h5>
                      <p className="text-sm text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.relevance_feedback} /></p>
                    </div>
                  </div>

                  {entry.evaluation.star_feedback && (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <h5 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" /> STAR Method Analysis
                      </h5>
                      <p className="text-sm text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.star_feedback} /></p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-8 text-center pb-20">
            <Button 
              size="lg" 
              onClick={() => {
                resetInterview();
                setLocation('/');
              }}
              className="h-14 px-8 text-lg"
            >
              Start a new interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active Interview View
  const progressPercent = ((interviewData.current_question_number - 1) / interviewData.total_questions) * 100;

  return (
    <div className="h-screen flex flex-col bg-background font-sans">
      
      {/* Header */}
      <header className="border-b border-border bg-card flex-shrink-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
              AI
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Interview Coach</div>
              <div className="text-xs text-muted-foreground">Target Role: {profile?.role_type}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground">
              Question {Math.min(interviewData.current_question_number, interviewData.total_questions)} of {interviewData.total_questions}
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Transcript History */}
          {interviewData.transcript.map((entry, index) => (
            <div key={index} className="space-y-8">
              {/* Question */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold mt-1">
                  AI
                </div>
                <div className="flex-1 space-y-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1 ${getCategoryStyle(entry.category)}`}>
                    {entry.category}
                  </span>
                  <div className="bg-muted/50 border border-border p-5 rounded-2xl rounded-tl-sm text-foreground text-[15px] leading-relaxed max-w-[85%]">
                    {entry.question_text}
                  </div>
                </div>
              </div>

              {/* Answer */}
              <div className="flex gap-4 justify-end">
                <div className="flex-1 flex flex-col items-end space-y-2">
                  <div className="bg-primary text-primary-foreground p-5 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed max-w-[85%] whitespace-pre-wrap">
                    {entry.answer_text}
                  </div>
                  
                  {/* Inline Feedback Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="w-full max-w-[85%] mt-4"
                  >
                    <Card className="border-border bg-card shadow-sm text-left">
                      <CardContent className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-bold flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" /> Instant Feedback
                          </h5>
                          <div className={`font-bold text-sm px-2.5 py-1 rounded-md flex items-baseline gap-1 ${getScoreStyle(entry.evaluation.score)}`}>
                            Score: <span className="text-lg font-black">{entry.evaluation.score}</span>
                            <span className="text-xs font-normal opacity-70">/10</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-bold uppercase text-muted-foreground mr-2">Clarity:</span>
                            <span className="text-sm text-foreground/80"><FormattedText text={entry.evaluation.clarity_feedback} /></span>
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase text-muted-foreground mr-2">Relevance:</span>
                            <span className="text-sm text-foreground/80"><FormattedText text={entry.evaluation.relevance_feedback} /></span>
                          </div>
                          {entry.evaluation.star_feedback && (
                            <div className="pt-2 border-t border-border/50 mt-2">
                              <span className="text-xs font-bold uppercase text-primary mr-2">STAR Method:</span>
                              <span className="text-sm text-foreground/80"><FormattedText text={entry.evaluation.star_feedback} /></span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}

          {/* Current Question */}
          {interviewData.current_question_text && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold mt-1">
                AI
              </div>
              <div className="flex-1 space-y-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1 ${getCategoryStyle(interviewData.current_category)}`}>
                  {interviewData.current_category}
                </span>
                <div className="bg-muted/50 border border-border p-5 rounded-2xl rounded-tl-sm text-foreground text-[15px] leading-relaxed max-w-[85%]">
                  {interviewData.current_question_text}
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {isSubmitting && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold mt-1 shadow-sm">
                AI
              </div>
              <div className="flex-1">
                <div className="bg-muted/50 border border-border p-4 rounded-2xl rounded-tl-sm text-foreground text-[15px] flex items-center gap-3 w-fit shadow-sm">
                  <span className="flex gap-1 text-primary text-lg">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }}>•</motion.span>
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}>•</motion.span>
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}>•</motion.span>
                  </span>
                  <span className="italic text-muted-foreground text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex gap-4 justify-end">
              <Alert variant="destructive" className="max-w-[85%]">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Issue</AlertTitle>
                <AlertDescription className="flex flex-col gap-3">
                  {error}
                  <Button variant="outline" size="sm" onClick={handleRetry} className="w-fit">
                    <RotateCcw className="w-4 h-4 mr-2" /> Retry Submission
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!interviewData.finished && (
        <div className="bg-card border-t border-border p-4 flex-shrink-0 relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto relative">
            <Textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[80px] max-h-[200px] pr-14 text-base resize-none shadow-sm focus-visible:ring-primary/20 bg-background"
              disabled={isSubmitting}
            />
            <Button 
              size="icon"
              className="absolute bottom-3 right-3 rounded-full h-10 w-10 shadow-sm transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleSend}
              disabled={!answerText.trim() || isSubmitting}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
          <div className="max-w-4xl mx-auto mt-2 text-center">
            <span className="text-xs text-muted-foreground">Answer naturally. The AI will evaluate clarity, relevance, and structure.</span>
          </div>
        </div>
      )}

    </div>
  );
}