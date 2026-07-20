import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile, Question, AnswerResponse } from '../lib/api';

const SESSION_ID_KEY = 'interview_session_id';
const PROFILE_KEY = 'interview_profile';

interface InterviewState {
  sessionId: string | null;
  profile: Profile | null;
  questions: Question[];
  interviewData: AnswerResponse | null;
  setSessionData: (sessionId: string, profile: Profile, questions: Question[]) => void;
  resumeSession: (sessionId: string, profile: Profile | null, data: AnswerResponse) => void;
  updateInterviewData: (data: AnswerResponse) => void;
  resetInterview: () => void;
}

const InterviewContext = createContext<InterviewState | undefined>(undefined);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [interviewData, setInterviewData] = useState<AnswerResponse | null>(null);

  const setSessionData = (id: string, prof: Profile, qs: Question[]) => {
    setSessionId(id);
    setProfile(prof);
    setQuestions(qs);

    // Persist to localStorage so the interview survives a refresh
    localStorage.setItem(SESSION_ID_KEY, id);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(prof));

    if (!interviewData && qs.length > 0) {
      setInterviewData({
        session_id: id,
        finished: false,
        current_question_number: 1,
        total_questions: qs.length,
        current_question_text: qs[0].text,
        current_category: qs[0].category,
        transcript: [],
        saved_session_id: null
      });
    }
  };

  // Called when resuming from localStorage on app load
  const resumeSession = (id: string, prof: Profile | null, data: AnswerResponse) => {
    setSessionId(id);
    setProfile(prof);
    setInterviewData(data);
  };

  const updateInterviewData = (data: AnswerResponse) => {
    setInterviewData(data);
    // Clear localStorage once finished — a completed interview shouldn't be resumed
    if (data.finished) {
      localStorage.removeItem(SESSION_ID_KEY);
      localStorage.removeItem(PROFILE_KEY);
    }
  };

  const resetInterview = () => {
    setSessionId(null);
    setProfile(null);
    setQuestions([]);
    setInterviewData(null);
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(PROFILE_KEY);
  };

  return (
    <InterviewContext.Provider value={{
      sessionId,
      profile,
      questions,
      interviewData,
      setSessionData,
      resumeSession,
      updateInterviewData,
      resetInterview
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
}
