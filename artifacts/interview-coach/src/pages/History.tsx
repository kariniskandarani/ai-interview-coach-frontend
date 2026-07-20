import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Bot, ArrowLeft, Clock, Briefcase, AlertCircle, LogOut, ChevronRight } from 'lucide-react';
import { listSessions, SessionSummary } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function History() {
  const [, setLocation] = useLocation();
  const { user, session, isGuest, signOut } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guests have no history — don't call the endpoint
    if (isGuest || !session?.access_token) {
      setIsLoading(false);
      return;
    }

    listSessions(session.access_token)
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setSessions(sorted);
      })
      .catch((err) => {
        if (err.status === 401) {
          // Token expired — send back to the landing page's login form
          signOut().then(() => setLocation('/'));
        } else {
          setError(err.message || 'Failed to load past interviews.');
        }
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-foreground tracking-tight">Interview Coach</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {user && (
              <button
                onClick={() => signOut().then(() => setLocation('/'))}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Session History</h1>
          <p className="text-sm text-muted-foreground mt-1">Review past mock interviews and track your progress.</p>
        </div>

        {/* Guest state */}
        {(isGuest || !session) && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Sign up to view your history</p>
              <p className="text-muted-foreground text-sm mt-1">Guest sessions are not saved. Create an account to track progress.</p>
            </div>
            <button
              onClick={() => signOut().then(() => setLocation('/'))}
              className="mt-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Create account
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex gap-2 items-start bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && !isGuest && session && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No completed interviews yet</p>
              <p className="text-muted-foreground text-sm mt-1">Complete an interview and it will appear here.</p>
            </div>
            <button
              onClick={() => setLocation('/')}
              className="mt-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Start your first interview
            </button>
          </div>
        )}

        {/* Session list */}
        {!isLoading && !error && sessions.length > 0 && (
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="group flex items-center justify-between gap-4 bg-card border border-border hover:border-primary/30 rounded-xl px-5 py-4 transition-colors cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{s.role_type || 'Interview'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDate(s.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Completed
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
