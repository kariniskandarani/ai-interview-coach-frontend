export const API_BASE_URL = 'https://ai-interview-coach-backend-g522.onrender.com';

export interface Profile {
  seniority: string;
  role_type: string;
  key_skills: string[];
  skill_gaps: string[];
  strengths_summary: string;
}

export interface Question {
  category: string;
  text: string;
  target_area: string;
}

export interface UploadResponse {
  session_id: string;
  profile: Profile;
  questions: Question[];
}

export interface Evaluation {
  score: number;
  star_feedback: string | null;
  clarity_feedback: string;
  relevance_feedback: string;
  follow_up_needed: boolean;
  follow_up_question: string | null;
}

export interface TranscriptEntry {
  question_text: string;
  category: string;
  answer_text: string;
  evaluation: Evaluation;
}

export interface AnswerResponse {
  session_id: string;
  finished: boolean;
  current_question_number: number;
  total_questions: number;
  current_question_text: string | null;
  current_category: string | null;
  transcript: TranscriptEntry[];
  saved_session_id: string | null;
}

export async function uploadCvAndJobDescription(cv: File, jobDescription: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('cv', cv);
  formData.append('job_description', jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload CV and Job Description. The server might be waking up (can take up to 60s).');
  }

  return response.json();
}

export async function submitAnswer(sessionId: string, answer: string): Promise<AnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answer }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit answer. Please try again.');
  }

  return response.json();
}

export async function getSession(sessionId: string): Promise<AnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Session expired, please start a new interview.');
  }

  return response.json();
}