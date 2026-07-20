import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import Landing from '@/pages/Landing';
import Interview from '@/pages/Interview';
import History from '@/pages/History';
import { InterviewProvider } from '@/context/InterviewContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const queryClient = new QueryClient();

// Guard: redirect to the landing page (which handles login/guest entry) unless
// the user is authenticated or in guest mode
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isGuest, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      setLocation('/');
    }
  }, [loading, user, isGuest, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 0.15, 0.3].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user && !isGuest) return null;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Landing handles both the logged-out (login/guest) and logged-in views itself */}
      <Route path="/" component={Landing} />
      <Route path="/interview">
        <AuthGuard>
          <Interview />
        </AuthGuard>
      </Route>
      <Route path="/history">
        <AuthGuard>
          <History />
        </AuthGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <InterviewProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </InterviewProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
