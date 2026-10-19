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

export interface SessionSummary {
  id: string;
  created_at: string;
  role_type: string;
}

export interface ReportResponse {
  readiness_score: number;
  overall_summary: string;
  strengths: string[];
  weaknesses: string[];
  study_plan: string[];
}

// POST /api/upload — attach auth token if the user is logged in
// Omit the header entirely for guests (do NOT send an empty Authorization header)
export async function uploadCvAndJobDescription(
  cv: File,
  jobDescription: string,
  authToken?: string,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('cv', cv);
  formData.append('job_description', jobDescription);

  const headers: Record<string, string> = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload CV and job description. The server might be waking up (can take up to 60 s).');
  }

  return response.json();
}

export async function submitAnswer(sessionId: string, answer: string): Promise<AnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

// GET /api/sessions — requires auth token; returns null if the caller has no token
// so the caller can decide to show an empty/guest state instead of hitting a 401
export async function listSessions(authToken: string): Promise<SessionSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });

  if (response.status === 401) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to load past interviews.');
  }

  return response.json();
}

// GET /api/sessions/{id}/report — only call once the interview is finished;
// this triggers a real AI call on the backend and takes a few seconds
export async function getReport(sessionId: string): Promise<ReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/report`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate your report. Please try again.');
  }

  return response.json();
}

export interface SavedSession {
  id: string;
  created_at: string;
  role_type: string;
  transcript: TranscriptEntry[];
}

// GET /api/history/{id} — a finished interview saved to the logged-in user's history
export async function getSavedSession(sessionId: string, authToken: string): Promise<SavedSession> {
  const response = await fetch(`${API_BASE_URL}/api/history/${sessionId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` },
  });

  if (response.status === 401) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to load this interview.');
  }

  return response.json();
}
