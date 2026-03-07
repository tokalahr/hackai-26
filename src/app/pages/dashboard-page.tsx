import { useMemo, useState } from "react";

const campusEvents = [
  {
    id: 1,
    name: "AI & Society Symposium",
    date: "Mar 15, 2026",
    location: "Engineering Building, Room 201",
  },
  {
    id: 2,
    name: "Spring Career Fair",
    date: "Mar 22, 2026",
    location: "Main Hall, Ground Floor",
  },
  {
    id: 3,
    name: "HackAI Campus Sprint",
    date: "Apr 05, 2026",
    location: "Innovation Hub",
  },
];

const campusCourses = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    description: "Foundations of supervised and unsupervised learning.",
  },
  {
    id: 2,
    title: "Data Structures and Algorithms",
    description: "Core structures, algorithmic thinking, and complexity.",
  },
  {
    id: 3,
    title: "Natural Language Processing",
    description: "Text representation, sequence models, and transformers.",
  },
];

type RecommendationInput = {
  name: string;
  topic: string;
  level: string;
  background: string;
};

type RecommendationResult = {
  learner: string;
  topic: string;
  nextSteps: string[];
  keyConcepts: string[];
  practiceScenario: string;
  externalSources: Array<{ title: string; snippet: string }>;
};

type DashboardSection = "campus" | "learning";

type DashboardPageProps = {
  activePath: string;
};

function buildRecommendation(input: RecommendationInput): RecommendationResult {
  const topic = input.topic.trim() || "your selected topic";

  return {
    learner: input.name || "Learner",
    topic,
    nextSteps: [
      `Revisit fundamentals in ${topic} at your current level: ${input.level || "beginner"}.`,
      `Complete one hands-on mini project in ${topic} that matches your background.`,
      "Practice retrieval: summarize each session in 5 bullet points and one confusion question.",
      "Schedule two spaced revision blocks this week for retention.",
    ],
    keyConcepts: [
      "Foundations",
      "Evaluation Metrics",
      "Error Analysis",
      "Transfer to Real Tasks",
    ],
    practiceScenario:
      `You are mentoring a junior teammate who must apply ${topic} to solve a real workplace problem. ` +
      "Design a simple plan: objective, data/input assumptions, approach, and success criteria.",
    externalSources: [
      {
        title: "YouTube: 3Blue1Brown (Neural Networks)",
        snippet: "Watch chapters explaining gradients and backprop; pause to sketch each concept.",
      },
      {
        title: "fast.ai Practical Deep Learning",
        snippet: "Use lesson notebooks to connect intuition with implementation quickly.",
      },
      {
        title: "Andrej Karpathy walkthroughs",
        snippet: "Follow from-scratch builds to understand what libraries abstract away.",
      },
    ],
  };
}

function CampusPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Upcoming Campus Events</h2>
        <ul className="space-y-3">
          {campusEvents.map((event) => (
            <li key={event.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="font-medium text-white">{event.name}</p>
              <p className="text-sm text-gray-400">{event.date}</p>
              <p className="text-sm text-[#00d4d4]">{event.location}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Courses</h2>
        <ul className="space-y-3">
          {campusCourses.map((course) => (
            <li key={course.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="font-medium text-white">{course.title}</p>
              <p className="text-sm text-gray-400">{course.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LearningAssistantPanel() {
  const [form, setForm] = useState<RecommendationInput>({
    name: "",
    topic: "",
    level: "",
    background: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const recommendation = useMemo(
    () => (submitted ? buildRecommendation(form) : null),
    [submitted, form],
  );

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Learning Recommender</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
          className="space-y-4"
        >
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Your name"
            className="w-full rounded-xl bg-black/25 border border-white/15 px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A259FF]/70"
            required
          />
          <input
            value={form.topic}
            onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
            placeholder="Topic you are learning"
            className="w-full rounded-xl bg-black/25 border border-white/15 px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A8A8]/70"
            required
          />
          <input
            value={form.level}
            onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
            placeholder="Current level / skills"
            className="w-full rounded-xl bg-black/25 border border-white/15 px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F58025]/70"
            required
          />
          <textarea
            value={form.background}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, background: event.target.value }))
            }
            rows={3}
            placeholder="Background, goals, and constraints"
            className="w-full rounded-xl bg-black/25 border border-white/15 px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A259FF]/70"
          />
          <button
            type="submit"
            className="w-full rounded-xl px-4 py-3 font-semibold text-white bg-gradient-to-r from-[#F58025] to-[#ff9447] hover:shadow-lg hover:shadow-[#F58025]/40 transition-all"
          >
            Generate Recommendations
          </button>
        </form>
      </div>

      {recommendation && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-5">
          <h3 className="text-xl font-semibold text-white">
            Recommendations for {recommendation.learner}
          </h3>
          <p className="text-sm text-[#00d4d4]">Topic: {recommendation.topic}</p>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Next steps</p>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              {recommendation.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Key concepts</p>
            <div className="flex flex-wrap gap-2">
              {recommendation.keyConcepts.map((concept) => (
                <span
                  key={concept}
                  className="px-3 py-1 rounded-full text-xs bg-[#00A8A8]/15 border border-[#00A8A8]/25 text-[#7bf0f0]"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Practice scenario</p>
            <p className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl p-3">
              {recommendation.practiceScenario}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">External sources</p>
            <ul className="space-y-2 text-sm text-gray-300">
              {recommendation.externalSources.map((source) => (
                <li key={source.title} className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="font-medium text-white">{source.title}</p>
                  <p className="text-gray-400">{source.snippet}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardPage({ activePath }: DashboardPageProps) {
  const activeSection: DashboardSection =
    activePath === "/learning-assistant" ? "learning" : "campus";

  return (
    <section className="relative min-h-[70vh] pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-[#0D0D0F]" />
      <div className="absolute top-0 left-1/3 w-[28rem] h-[28rem] bg-[#F58025]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-[#00A8A8]/10 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6">
        <h1 className="text-4xl font-bold text-white">
          {activeSection === "learning" ? "Learning Assistant" : "Dashboard"}
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Campus data and learning guidance in one place. This demo version is fully frontend-only.
        </p>

        <div>{activeSection === "campus" ? <CampusPanel /> : <LearningAssistantPanel />}</div>
      </div>
    </section>
  );
}
