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

export type CalendarEvent = {
  summary?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
};

export type CalendarRoom = {
  room?: string;
  events?: CalendarEvent[];
};

export type CalendarBuilding = {
  building?: string;
  rooms?: CalendarRoom[];
};

export type CalendarByDate = {
  date?: string;
  buildings?: CalendarBuilding[];
};

const viteEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const API_BASE = (viteEnv?.VITE_API_BASE_URL || "http://localhost:5004").replace(/\/$/, "");

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

export async function fetchCalendarEventsByDate(dateISO: string) {
  const data = await apiGet<{ data?: CalendarByDate }>(`/calendar/${dateISO}`);
  return data.data;
}
