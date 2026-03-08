export type NebulaCourse = {
  _id?: string;
  subject_prefix?: string;
  course_number?: string;
  title?: string;
  description?: string;
};

export type NebulaMeeting = {
  start_date?: string;
  start_time?: string;
  location?: {
    building?: string;
    room?: string;
  };
};

export type NebulaSection = {
  _id?: string;
  section_number?: string;
  meetings?: NebulaMeeting[];
  professor_details?: Array<{ first_name?: string; last_name?: string }>;
};

const viteEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const API_BASE = (viteEnv?.VITE_API_BASE_URL || "http://localhost:5050").replace(/\/$/, "");

async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function fetchCourses(params: Record<string, string | number | undefined>) {
  const data = await apiGet<{ data?: NebulaCourse[] }>("/course", params);
  return data.data ?? [];
}

export async function fetchCourseTrends(subjectPrefix: string, courseNumber: string) {
  const data = await apiGet<{ data?: NebulaSection[] }>("/course/sections/trends", {
    subject_prefix: subjectPrefix,
    course_number: courseNumber,
  });
  return data.data ?? [];
}

export async function fetchProfessors(params: Record<string, string | number | undefined>) {
  const data = await apiGet<{ data?: Array<{ first_name?: string; last_name?: string; titles?: string[] }> }>(
    "/professor",
    params,
  );
  return data.data ?? [];
}

export async function askBackendAssistant(query: string) {
  const data = await apiPost<{ answer?: string }>("/solve", { query });
  return data.answer ?? "";
}

export function parseCourseFromText(text: string): { subjectPrefix: string; courseNumber: string } | null {
  const match = text.match(/([a-zA-Z]{2,})\s*[- ]?\s*(\d{3,4})/);
  if (!match) {
    return null;
  }
  return {
    subjectPrefix: match[1].toUpperCase(),
    courseNumber: match[2],
  };
}

// Fetch dashboard overview (progress, stats, etc.)
export async function fetchDashboardOverview() {
  // Adjust the endpoint as needed to match your backend
  return apiGet<{
    progress: number;
    activeCourses: number;
    dueThisWeek: number;
    nextEvent: { name: string; time: string } | null;
    recentBadge: { name: string; earnedAgo: string } | null;
    stats: {
      inProgress: number;
      completed: number;
      certificates: number;
      communitySupport: number;
    };
  }>("/dashboard/overview");
}

// ─── ARIA Calibration API ─────────────────────────────────────────

// Self-assessment question (perceived knowledge)
export type CalibrationQuestion = {
  skillId: string;
  skillName: string;
  question: string;
  type: string;
};

// Multiple-choice quiz question (actual knowledge)
export type QuizQuestion = {
  skillId: string;
  skillName: string;
  questionIndex: number;
  question: string;
  options: string[];
  correctIndex: number;
};

export type CalibrationSkill = {
  skillId: string;
  skillName: string;
  actualKnowledgeScore: number;
  perceivedKnowledgeScore: number;
  calibrationGap: number;
  classification: "overconfident" | "underconfident" | "blindspot" | "hidden_strength" | "aligned";
};

export type KnowledgeMapEntry = {
  skillName: string;
  youSaid: string;
  quizShows: string;
  quizScore: string;
  gap: string;
  classification: string;
};

export type BlindspotCard = {
  skillId: string;
  reason: string;
  impact: number;
  nextStep: string;
};

export type AlertMessage = {
  skillId: string;
  skillName: string;
  message: string;
};

export type CalibrationResult = {
  calibrationScore: number;
  skills: CalibrationSkill[];
  knowledgeMap: KnowledgeMapEntry[];
  blindspots: BlindspotCard[];
  overconfidence: AlertMessage[];
  underconfidence: AlertMessage[];
};

// Step 1: Generate self-assessment questions
export async function fetchCalibrationQuestions(payload: {
  courses: string[];
  skills: string[];
  targetRoles: string[];
}): Promise<{ questions: CalibrationQuestion[] }> {
  return apiPost("/calibrate/questions", payload);
}

// Step 2: Generate quiz questions per skill
export async function fetchCalibrationQuiz(payload: {
  skills: { skillId: string; skillName: string }[];
}): Promise<{ quiz: QuizQuestion[] }> {
  return apiPost("/calibrate/quiz", payload);
}

// Step 3: Submit self-assessment + quiz answers → calibration results
export async function submitCalibration(payload: {
  selfAssessment: { skillId: string; perceivedScore: number }[];
  quizAnswers: { skillId: string; questionIndex: number; selectedIndex: number; correctIndex: number }[];
}): Promise<CalibrationResult> {
  return apiPost("/calibrate/submit", payload);
}
