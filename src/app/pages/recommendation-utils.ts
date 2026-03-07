export type LearnerRole = "student" | "professional";

export type StoredLearningInput = {
  name: string;
  topic: string;
  level: string;
  background: string;
  role: LearnerRole;
};

export type RoleRecommendation = {
  headline: string;
  nextSteps: string[];
  focusAreas: string[];
  scenario: string;
  resources: Array<{ title: string; note: string }>;
};

const STORAGE_KEY = "learningAssistantInput";

export function saveLearningInput(input: StoredLearningInput) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(input));
}

export function readLearningInput(): StoredLearningInput | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredLearningInput;
    if (!parsed.role || !parsed.topic) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildRoleRecommendation(
  input: StoredLearningInput,
  role: LearnerRole,
): RoleRecommendation {
  const topic = input.topic.trim() || "selected topic";
  const level = input.level.trim() || "current level";

  if (role === "student") {
    return {
      headline: "Student Coursework Path",
      nextSteps: [
        `Pick 2 supporting courses aligned with ${topic} and your level (${level}).`,
        "Plan a 4-week coursework sprint with weekly milestones and revision checkpoints.",
        "Meet a TA/mentor this week to validate your approach before major submissions.",
        "Build a portfolio artifact from one assignment to showcase practical understanding.",
      ],
      focusAreas: [
        "Course sequencing",
        "Assessment strategy",
        "Exam readiness",
        "Project deliverables",
      ],
      scenario:
        `You are taking a semester project in ${topic}. Build a weekly execution plan balancing coursework, labs, and exam prep while minimizing deadline risk.`,
      resources: [
        {
          title: "University course catalog + syllabi",
          note: "Use prerequisites and grading breakdown to choose your best sequence.",
        },
        {
          title: "Pomodoro + spaced repetition workflow",
          note: "Combine active recall with assignment milestones.",
        },
        {
          title: "Student office hours tracker",
          note: "Log questions weekly and bring them to TA/professor sessions.",
        },
      ],
    };
  }

  return {
    headline: "Professional Skill Development Path",
    nextSteps: [
      `Define one workplace outcome where ${topic} can create measurable value in 30 days.`,
      "Identify skill gaps and prioritize the top 3 competencies for role growth.",
      "Ship one practical mini-project and document business impact.",
      "Present a short demo to peers/manager and gather actionable feedback.",
    ],
    focusAreas: [
      "Applied skill depth",
      "Business relevance",
      "Execution speed",
      "Stakeholder communication",
    ],
    scenario:
      `You are a professional upskilling in ${topic}. Design a capability roadmap that improves delivery quality while fitting into a busy work schedule.`,
    resources: [
      {
        title: "Role-specific case studies",
        note: "Focus on examples from your industry rather than generic tutorials.",
      },
      {
        title: "Weekly reflection loop",
        note: "Track what worked, bottlenecks, and the next experiment.",
      },
      {
        title: "Mentor/peer review cadence",
        note: "Use bi-weekly reviews to accelerate growth and accountability.",
      },
    ],
  };
}
