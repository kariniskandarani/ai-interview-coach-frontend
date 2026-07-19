import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Profile, Question, AnswerResponse } from '../lib/api';

interface InterviewState {
  sessionId: string | null;
  profile: Profile | null;
  questions: Question[];
  interviewData: AnswerResponse | null;
  setSessionData: (sessionId: string, profile: Profile, questions: Question[]) => void;
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
    // Initialize interview data with the first question if we don't have it yet
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

  const updateInterviewData = (data: AnswerResponse) => {
    setInterviewData(data);
  };

  const resetInterview = () => {
    setSessionId(null);
    setProfile(null);
    setQuestions([]);
    setInterviewData(null);
  };

  // Optional: load from sessionStorage so refresh doesn't completely lose everything if they haven't started answering yet,
  // but requirements say "React state (useState/useReducer) - no localStorage needed", so we stick to just memory.

  return (
    <InterviewContext.Provider value={{
      sessionId,
      profile,
      questions,
      interviewData,
      setSessionData,
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