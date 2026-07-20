import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Star, CheckCircle2, RotateCcw, MessageSquare, AlertCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { submitAnswer } from '@/lib/api';
import { useInterview } from '@/context/InterviewContext';

// Parses **bold** markdown in feedback text
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

const getCategoryStyle = (category: string) => {
  const n = category.toLowerCase();
  if (n.includes('technical'))  return 'bg-blue-50 text-blue-700 border-blue-200';
  if (n.includes('behavioral')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (n.includes('hr'))         return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-muted text-muted-foreground border-border';
};

const getScoreStyle = (score: number) => {
  if (score >= 8) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (score >= 5) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-red-50 text-red-700 border border-red-200';
};

// Radial gauge SVG for the completion screen
function ScoreGauge({ score }: { score: number }) {
  const size = 180;
  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  // 270-degree arc: starts at 135° (bottom-left), sweeps clockwise to 45° (bottom-right)
  const arcFraction = 0.75;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * arcFraction;
  const fillLength = arcLength * (score / 10);
  const gap = circumference - arcLength;

  // SVG rotation: 0° is 3 o'clock. We want arc to start at ~135° → rotate by 135°
  const rotation = 135;

  const trackColor = '#e5e7eb'; // gray-200
  const fillColor = score >= 8 ? '#059669' : score >= 5 ? '#d97706' : '#dc2626';
  const labelColor = score >= 8 ? '#065f46' : score >= 5 ? '#92400e' : '#991b1b';
  const bgColor   = score >= 8 ? '#d1fae5' : score >= 5 ? '#fef3c7' : '#fee2e2';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: `rotate(${rotation}deg)` }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${gap}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${fillLength} ${circumference - fillLength}`}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${fillLength} ${circumference - fillLength}` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 12 }}>
          <span className="text-4xl font-black" style={{ color: fillColor }}>{score}</span>
          <span className="text-sm font-medium text-muted-foreground">/&nbsp;10</span>
        </div>
      </div>
    </div>
  );
}

function getClosingMessage(score: number): string {
  if (score >= 8.5) return "Impressive performance. Your answers were structured, specific, and compelling. Walk into the real interview with that same confidence.";
  if (score >= 7)   return "Strong showing. You demonstrated solid instincts — a bit more concrete detail in your examples and you'll be very hard to beat.";
  if (score >= 5.5) return "A solid foundation. The ideas are there; focus on sharpening your STAR-method storytelling and adding quantifiable impact to each answer.";
  if (score >= 4)   return "You're getting there. Bring more specific examples from your experience and practice answering in clear, structured paragraphs.";
  return "Plenty of room to grow — and that's exactly what practice is for. Work on concrete, structured stories and revisit the STAR method for each answer.";
}

export default function Interview() {
  const [, setLocation] = useLocation();
  const { sessionId, profile, interviewData, updateInterviewData, resetInterview } = useInterview();
  
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [answerText]);

  // Redirect if no session
  useEffect(() => {
    if (!sessionId) {
      setLocation('/');
    }
  }, [sessionId, setLocation]);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interviewData?.transcript, interviewData?.current_question_text, isSubmitting]);

  if (!sessionId || !interviewData) return null;

  const handleSend = async () => {
    if (!answerText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const currentAnswer = answerText;
    setAnswerText(''); // optimistic clear

    try {
      const data = await submitAnswer(sessionId, currentAnswer);
      updateInterviewData(data); // context clears localStorage if data.finished
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

  // ─── Completion screen ────────────────────────────────────────────────────
  if (interviewData.finished) {
    const totalScore = interviewData.transcript.reduce((acc, e) => acc + e.evaluation.score, 0);
    const avgScore = interviewData.transcript.length > 0
      ? Math.round((totalScore / interviewData.transcript.length) * 10) / 10
      : 0;

    return (
      <div className="min-h-screen bg-background font-sans py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3"
          >
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Interview Complete</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {getClosingMessage(avgScore)}
            </p>
          </motion.div>

          {/* Score card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-8 flex flex-col md:flex-row items-center gap-10">
                <div className="flex flex-col items-center gap-2">
                  <ScoreGauge score={avgScore} />
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overall Score</span>
                </div>
                <div className="flex-1 space-y-5 w-full">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Role Alignment</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Target role:</span> <span className="font-semibold text-foreground">{profile?.role_type}</span></div>
                      <div><span className="text-muted-foreground">Seniority:</span> <span className="font-semibold text-foreground">{profile?.seniority}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Per-question scores</h3>
                    <div className="flex flex-wrap gap-2">
                      {interviewData.transcript.map((e, i) => (
                        <div key={i} className={`text-xs font-bold px-2 py-1 rounded-md ${getScoreStyle(e.evaluation.score)}`}>
                          Q{i + 1}: {e.evaluation.score}/10
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed feedback */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-6 h-6" /> Detailed Feedback
            </h2>
            
            {interviewData.transcript.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.06 }}
              >
                <Card className="overflow-hidden border-border shadow-sm">
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
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center pb-20">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/history')}
              className="h-12 px-6 gap-2"
            >
              <History className="w-4 h-4" /> View History
            </Button>
            <Button 
              size="lg" 
              onClick={() => {
                resetInterview();
                setLocation('/');
              }}
              className="h-12 px-8"
            >
              Start a new interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active interview ─────────────────────────────────────────────────────
  const progressPercent = ((interviewData.current_question_number - 1) / interviewData.total_questions) * 100;

  return (
    <div className="h-screen flex flex-col bg-background font-sans">
      
      {/* Header */}
      <header className="border-b border-border bg-card flex-shrink-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm flex-shrink-0">
              AI
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm text-foreground leading-none">{profile?.role_type ?? 'Interview Coach'}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Question {Math.min(interviewData.current_question_number, interviewData.total_questions)} of {interviewData.total_questions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums w-8 text-right">
              {Math.round(progressPercent)}%
            </span>
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
              <motion.div
                className="flex gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              >
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
              </motion.div>

              {/* Answer + feedback */}
              <motion.div
                className="flex gap-4 justify-end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.05 }}
              >
                <div className="flex-1 flex flex-col items-end space-y-2">
                  <div className="bg-primary text-primary-foreground p-5 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed max-w-[85%] whitespace-pre-wrap">
                    {entry.answer_text}
                  </div>
                  
                  {/* Inline Feedback Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
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
              </motion.div>
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
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1 ${getCategoryStyle(interviewData.current_category ?? '')}`}>
                  {interviewData.current_category}
                </span>
                <div className="bg-muted/50 border border-border p-5 rounded-2xl rounded-tl-sm text-foreground text-[15px] leading-relaxed max-w-[85%]">
                  {interviewData.current_question_text}
                </div>
              </div>
            </motion.div>
          )}

          {/* AI thinking bubble */}
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

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="max-w-[85%] ml-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Issue</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                {error}
                <Button variant="outline" size="sm" onClick={handleSend} className="w-fit">
                  <RotateCcw className="w-4 h-4 mr-2" /> Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!interviewData.finished && (
        <div className="bg-card border-t border-border p-4 flex-shrink-0 relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              ref={textareaRef}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              className="w-full pr-14 py-2.5 px-3 text-sm resize-none overflow-y-auto rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 disabled:opacity-50 transition-shadow shadow-sm"
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
            <span className="text-xs text-muted-foreground">Answer naturally. The AI evaluates clarity, relevance, and structure.</span>
          </div>
        </div>
      )}

    </div>
  );
}
