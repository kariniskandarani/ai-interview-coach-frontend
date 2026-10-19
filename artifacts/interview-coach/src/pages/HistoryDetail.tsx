import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { getSavedSession, SavedSession } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Parses **bold** markdown in feedback text
const FormattedText = ({ text }: { text: string }) => (
  <span>
    {text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>,
    )}
  </span>
);

const getScoreStyle = (score: number) => {
  if (score >= 8) return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
  if (score >= 5) return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
  return 'bg-red-500/15 text-red-300 border border-red-500/30';
};

export default function HistoryDetail() {
  const [, params] = useRoute('/history/:id');
  const [, setLocation] = useLocation();
  const { session, signOut } = useAuth();
  const [data, setData] = useState<SavedSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params?.id || !session?.access_token) return;
    getSavedSession(params.id, session.access_token)
      .then(setData)
      .catch((err) => {
        if (err.status === 401) signOut().then(() => setLocation('/'));
        else setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, [params?.id, session?.access_token]); // eslint-disable-line react-hooks/exhaustive-deps

  const avg = data && data.transcript.length > 0
    ? Math.round((data.transcript.reduce((a, e) => a + e.evaluation.score, 0) / data.transcript.length) * 10) / 10
    : null;

  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => setLocation('/history')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to history
        </button>

        {isLoading && <div className="h-40 bg-card border border-border rounded-xl animate-pulse" />}

        {error && !isLoading && (
          <div className="flex gap-2 items-start bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{data.role_type || 'Interview'}</h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {new Date(data.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {avg !== null && <span>· Average score {avg}/10</span>}
              </p>
            </div>

            <div className="space-y-4">
              {data.transcript.map((e, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Q{i + 1} · {e.category}
                      </p>
                      <h2 className="text-base font-semibold text-foreground mt-1 leading-snug">{e.question_text}</h2>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-sm font-bold flex-shrink-0 ${getScoreStyle(e.evaluation.score)}`}>
                      {e.evaluation.score}/10
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Your answer</h3>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{e.answer_text}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-foreground/80">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Clarity</h3>
                      <FormattedText text={e.evaluation.clarity_feedback} />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Relevance</h3>
                      <FormattedText text={e.evaluation.relevance_feedback} />
                    </div>
                  </div>
                  {e.evaluation.star_feedback && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-sm text-foreground/80">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-1">STAR analysis</h3>
                      <FormattedText text={e.evaluation.star_feedback} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
