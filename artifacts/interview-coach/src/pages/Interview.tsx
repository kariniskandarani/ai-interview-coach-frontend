import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Star, CheckCircle2, RotateCcw, MessageSquare, AlertCircle, History, LogOut, Eye, Target, Sparkles, Award, ThumbsUp, AlertTriangle, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { submitAnswer, getReport, ReportResponse } from '@/lib/api';
import { useInterview } from '@/context/InterviewContext';
import { useAuth } from '@/context/AuthContext';

// Heuristic: does this answer look like code (SQL, a function, JSON, etc.)?
function looksLikeCode(text: string): boolean {
  const trimmed = text.trim();
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|WITH)\b/i.test(trimmed)) return true;
  const codeSignalCount = (trimmed.match(/[{};]|=>|\bfunction\b|\bconst\b|\bclass\b|\bdef\b|\bimport\b/gi) || []).length;
  return trimmed.includes('\n') && codeSignalCount >= 2;
}

// Renders an answer as monospace code when it looks like code, plain wrapped text otherwise
const AnswerText = ({ text }: { text: string }) => {
  if (looksLikeCode(text)) {
    return (
      <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words bg-black/15 rounded-lg p-3 overflow-x-auto">
        <code>{text}</code>
      </pre>
    );
  }
  return <span className="whitespace-pre-wrap">{text}</span>;
};

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
  if (n.includes('technical'))  return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  if (n.includes('behavioral')) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (n.includes('hr'))         return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  return 'bg-slate-700/50 text-slate-300 border-slate-600';
};

const getScoreStyle = (score: number) => {
  if (score >= 8) return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
  if (score >= 5) return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
  return 'bg-red-500/15 text-red-300 border border-red-500/30';
};

const getScoreAccentBorder = (score: number) => {
  if (score >= 8) return 'border-l-emerald-500';
  if (score >= 5) return 'border-l-amber-500';
  return 'border-l-red-500';
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

  const trackColor = '#1e293b'; // slate-800
  const fillColor = score >= 8 ? '#34d399' : score >= 5 ? '#fbbf24' : '#f87171'; // emerald-400 / amber-400 / red-400
  const labelColor = fillColor;
  const bgColor   = 'transparent';

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
  const { user, signOut } = useAuth();

  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

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

  const handleGetReport = async () => {
    if (!sessionId) return;
    setIsLoadingReport(true);
    setReportError(null);
    try {
      const data = await getReport(sessionId);
      setReport(data);
    } catch (err: any) {
      setReportError(err.message || 'Failed to generate your report. Please try again.');
    } finally {
      setIsLoadingReport(false);
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
        <div className="max-w-5xl mx-auto space-y-10">
          
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

          {/* Full AI readiness report */}
          <div>
            {!report && !isLoadingReport && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-col items-center gap-3 py-10 px-6 border border-dashed border-border rounded-2xl text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Want the full picture?</p>
                  <p className="text-muted-foreground text-base mt-1 max-w-md">
                    Get an AI-written readiness report with your strengths, growth areas, and a personalized study plan.
                  </p>
                </div>
                {reportError && <p className="text-sm text-destructive">{reportError}</p>}
                <Button size="lg" onClick={handleGetReport} className="mt-2 gap-2">
                  <Sparkles className="w-4 h-4" /> Get my full report
                </Button>
              </motion.div>
            )}

            {isLoadingReport && (
              <div className="flex flex-col items-center gap-4 py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-base text-muted-foreground">Writing your readiness report — this can take a few seconds...</p>
              </div>
            )}

            {report && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Award className="w-6 h-6" /> Your Readiness Report
                </h2>

                <Card className="border-border shadow-sm overflow-hidden">
                  <CardContent className="p-8 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex flex-col items-center gap-2">
                      <ScoreGauge score={report.readiness_score} />
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Readiness Score</span>
                    </div>
                    <p className="flex-1 text-base text-foreground/90 leading-relaxed">{report.overall_summary}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-400 flex items-center gap-2 mb-4">
                        <ThumbsUp className="w-4 h-4" /> Strengths
                      </h3>
                      <ul className="space-y-3">
                        {report.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-base text-foreground/85 leading-relaxed">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4" /> Growth Areas
                      </h3>
                      <ul className="space-y-3">
                        {report.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-base text-foreground/85 leading-relaxed">
                            <AlertCircle className="w-4.5 h-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-primary/30 bg-primary/5 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-5">
                      <ListChecks className="w-5 h-5 text-primary" /> Your Study Plan
                    </h3>
                    <ul className="space-y-3">
                      {report.study_plan.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 bg-card border border-border rounded-lg p-4">
                          <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-base text-foreground/90 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

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
                <Card className={`overflow-hidden border-border shadow-sm border-l-4 ${getScoreAccentBorder(entry.evaluation.score)}`}>
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
                      <div className="text-foreground/90"><AnswerText text={entry.answer_text} /></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Clarity & Structure
                        </h5>
                        <p className="text-[15px] text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.clarity_feedback} /></p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-2">
                          <Target className="w-4 h-4" /> Relevance & Impact
                        </h5>
                        <p className="text-[15px] text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.relevance_feedback} /></p>
                      </div>
                    </div>

                    {entry.evaluation.star_feedback && (
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h5 className="text-xs font-bold text-primary uppercase tracking-wide mb-1.5 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> STAR Method Analysis
                        </h5>
                        <p className="text-[15px] text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.star_feedback} /></p>
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
      <header className="border-b border-border bg-card flex-shrink-0 z-10 shadow-[0_12px_32px_-14px_rgba(0,0,0,0.6)]">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-sm flex-shrink-0">
              AI
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-semibold text-base text-foreground leading-snug truncate" title={profile?.role_type}>
                {profile?.role_type ?? 'Interview Coach'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Question {Math.min(interviewData.current_question_number, interviewData.total_questions)} of {interviewData.total_questions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground tabular-nums w-9 text-right">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-7 w-px bg-border" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (window.confirm('Start a new interview? Your current progress will be lost.')) {
                    resetInterview();
                    setLocation('/');
                  }
                }}
                className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                title="New interview"
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>
              {user && (
                <button
                  onClick={() => setLocation('/history')}
                  className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  title="Interview history"
                >
                  <History className="w-4.5 h-4.5" />
                </button>
              )}
              <button
                onClick={() => signOut().then(() => setLocation('/'))}
                className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-32">
        <div className="max-w-5xl mx-auto space-y-8">
          
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
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold mt-1">
                  AI
                </div>
                <div className="flex-1 space-y-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1 ${getCategoryStyle(entry.category)}`}>
                    {entry.category}
                  </span>
                  <div className="bg-card border border-border p-6 rounded-2xl rounded-tl-sm text-foreground text-base leading-relaxed max-w-[85%]">
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
                  <div className="bg-secondary border border-border text-foreground p-6 rounded-2xl rounded-tr-sm text-base leading-relaxed max-w-[85%]">
                    <AnswerText text={entry.answer_text} />
                  </div>

                  {/* Inline Feedback Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
                    className="w-full max-w-[85%] mt-4"
                  >
                    <Card className={`border-border bg-card shadow-sm text-left border-l-4 ${getScoreAccentBorder(entry.evaluation.score)}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h5 className="text-lg font-bold flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" /> Instant Feedback
                          </h5>
                          <div className={`font-bold text-base px-3 py-1.5 rounded-md flex items-baseline gap-1 ${getScoreStyle(entry.evaluation.score)}`}>
                            Score: <span className="text-xl font-black">{entry.evaluation.score}</span>
                            <span className="text-sm font-normal opacity-70">/10</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Eye className="w-4.5 h-4.5 text-muted-foreground" />
                              <span className="text-sm font-bold uppercase text-muted-foreground tracking-wide">Clarity</span>
                            </div>
                            <p className="text-base text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.clarity_feedback} /></p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4.5 h-4.5 text-muted-foreground" />
                              <span className="text-sm font-bold uppercase text-muted-foreground tracking-wide">Relevance</span>
                            </div>
                            <p className="text-base text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.relevance_feedback} /></p>
                          </div>
                          {entry.evaluation.star_feedback && (
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4.5 h-4.5 text-primary" />
                                <span className="text-sm font-bold uppercase text-primary tracking-wide">STAR Method</span>
                              </div>
                              <p className="text-base text-foreground/80 leading-relaxed"><FormattedText text={entry.evaluation.star_feedback} /></p>
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
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold mt-1">
                AI
              </div>
              <div className="flex-1 space-y-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1 ${getCategoryStyle(interviewData.current_category ?? '')}`}>
                  {interviewData.current_category}
                </span>
                <div className="bg-card border border-border p-6 rounded-2xl rounded-tl-sm text-foreground text-base leading-relaxed max-w-[85%]">
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
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold mt-1 shadow-sm">
                AI
              </div>
              <div className="flex-1">
                <div className="bg-card border border-border p-5 rounded-2xl rounded-tl-sm text-foreground text-base flex items-center gap-3 w-fit shadow-sm">
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
        <div className="bg-card border-t border-border p-5 flex-shrink-0 relative z-20 shadow-[0_-12px_32px_-14px_rgba(0,0,0,0.6)]">
          <div className="max-w-5xl mx-auto flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{ minHeight: '52px', maxHeight: '160px' }}
              className="flex-1 py-3.5 px-4 text-base resize-none overflow-y-auto rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 disabled:opacity-50 transition-shadow shadow-sm"
              disabled={isSubmitting}
            />
            <Button
              size="icon"
              className="rounded-xl h-[52px] w-[52px] flex-shrink-0 shadow-sm transition-transform duration-150 hover:scale-110 active:scale-90"
              onClick={handleSend}
              disabled={!answerText.trim() || isSubmitting}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isSubmitting ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Loader2 className="w-5! h-5! animate-spin" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="send"
                    initial={{ opacity: 0, scale: 0.6, rotate: 90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Send className="w-5! h-5!" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
          <div className="max-w-5xl mx-auto mt-2.5 text-center">
            <span className="text-xs text-muted-foreground">Answer naturally. The AI evaluates clarity, relevance, and structure.</span>
          </div>
        </div>
      )}

    </div>
  );
}
