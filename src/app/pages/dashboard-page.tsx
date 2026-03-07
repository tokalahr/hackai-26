import { useMemo, useState } from "react";
import { saveLearningInput, type LearnerRole } from "./recommendation-utils";

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
  role: LearnerRole;
};

type DashboardSection = "campus" | "learning";

type DashboardPageProps = {
  activePath: string;
  onNavigate: (path: string) => void;
};

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

function LearningAssistantPanel({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [form, setForm] = useState<RecommendationInput>({
    name: "",
    topic: "",
    level: "",
    background: "",
    role: "student",
  });

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-xl font-semibold text-white mb-4">Learning Recommender</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveLearningInput(form);
            onNavigate(
              form.role === "student"
                ? "/student-recommendations"
                : "/professional-recommendations",
            );
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-sm text-gray-300">I am a</label>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value as LearnerRole }))
              }
              className="w-full rounded-xl bg-black/25 border border-white/15 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00A8A8]/70"
            >
              <option value="student" className="text-black">
                Student
              </option>
              <option value="professional" className="text-black">
                Professional
              </option>
            </select>
          </div>

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
            Generate {form.role === "student" ? "Student" : "Professional"} Recommendations
          </button>
        </form>
      </div>
    </div>
  );
}

export function DashboardPage({ activePath, onNavigate }: DashboardPageProps) {
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

        <div>
          {activeSection === "campus" ? (
            <CampusPanel />
          ) : (
            <LearningAssistantPanel onNavigate={onNavigate} />
          )}
        </div>
      </div>
    </section>
  );
}
