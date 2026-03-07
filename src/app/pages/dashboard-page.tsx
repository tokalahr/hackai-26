import { useMemo, useRef, useState } from "react";

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

type CampusEventPin = {
  id: number;
  title: string;
  description: string;
  location: string;
  likes: number;
  x: number;
  y: number;
};

type Cluster = {
  id: string;
  x: number;
  y: number;
  pins: CampusEventPin[];
};

const initialPinnedEvents: CampusEventPin[] = [
  {
    id: 1001,
    title: "HackAI Kickoff",
    description: "Opening session for teams to meet, scope ideas, and align on tracks.",
    location: "ECSW Atrium",
    likes: 24,
    x: 46,
    y: 52,
  },
  {
    id: 1002,
    title: "Resume Clinic",
    description: "Career center mentors review resumes and LinkedIn profiles.",
    location: "Student Services Building",
    likes: 15,
    x: 58,
    y: 47,
  },
  {
    id: 1003,
    title: "Night Coding Sprint",
    description: "Late-night co-working session with mentors and snacks.",
    location: "Founders Lab",
    likes: 39,
    x: 48,
    y: 56,
  },
  {
    id: 1004,
    title: "AI Ethics Circle",
    description: "Roundtable on fairness, safety, and responsible deployment.",
    location: "Library Room B",
    likes: 11,
    x: 32,
    y: 35,
  },
];

function clusterPins(pins: CampusEventPin[], threshold = 7): Cluster[] {
  const clusters: Cluster[] = [];

  for (const pin of pins) {
    let placed = false;
    for (const cluster of clusters) {
      const dx = cluster.x - pin.x;
      const dy = cluster.y - pin.y;
      if (Math.hypot(dx, dy) <= threshold) {
        cluster.pins.push(pin);
        cluster.x = cluster.pins.reduce((sum, p) => sum + p.x, 0) / cluster.pins.length;
        cluster.y = cluster.pins.reduce((sum, p) => sum + p.y, 0) / cluster.pins.length;
        placed = true;
        break;
      }
    }

    if (!placed) {
      clusters.push({ id: `cluster-${pin.id}`, x: pin.x, y: pin.y, pins: [pin] });
    }
  }

  return clusters.map((cluster) => ({
    ...cluster,
    id: `cluster-${cluster.pins.map((p) => p.id).sort((a, b) => a - b).join("-")}`,
  }));
}

function CampusEventMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [pins, setPins] = useState<CampusEventPin[]>(initialPinnedEvents);
  const [selectedEvent, setSelectedEvent] = useState<CampusEventPin | null>(null);
  const [hoveredPinId, setHoveredPinId] = useState<number | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [openClusterId, setOpenClusterId] = useState<string | null>(null);

  const [draftPos, setDraftPos] = useState<{ x: number; y: number } | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftLocation, setDraftLocation] = useState("");

  const clusters = useMemo(() => clusterPins(pins), [pins]);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const map = mapRef.current;
    if (!map) return;
    const rect = map.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setDraftPos({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
    setDraftTitle("");
    setDraftDescription("");
    setDraftLocation("");
  };

  const addEventPin = () => {
    if (!draftPos || !draftTitle.trim()) return;
    const newPin: CampusEventPin = {
      id: Date.now(),
      title: draftTitle.trim(),
      description: draftDescription.trim() || "No description provided yet.",
      location: draftLocation.trim() || "Location placeholder (API later)",
      likes: Math.floor(Math.random() * 20),
      x: draftPos.x,
      y: draftPos.y,
    };
    setPins((prev) => [newPin, ...prev]);
    setDraftPos(null);
    setSelectedEvent(newPin);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-white">Interactive Campus Event Map</h2>
        <a
          href="https://map.utdallas.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#7bf0f0] hover:underline"
        >
          Open official map
        </a>
      </div>

      <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
        <div
          ref={mapRef}
          onClick={handleMapClick}
          className="relative w-full h-[430px] cursor-crosshair overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#101419] via-[#182028] to-[#101419]" />
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="absolute left-[8%] top-[15%] w-[84%] h-[3px] bg-[#00A8A8]/45 rotate-[6deg]" />
          <div className="absolute left-[18%] top-[68%] w-[62%] h-[3px] bg-[#F58025]/45 -rotate-[10deg]" />
          <div className="absolute left-[24%] top-[20%] w-[4px] h-[62%] bg-white/20" />

          {clusters.map((cluster) => {
            const isGroup = cluster.pins.length > 1;
            const showList = hoveredClusterId === cluster.id || openClusterId === cluster.id;

            if (!isGroup) {
              const pin = cluster.pins[0];
              const isHovered = hoveredPinId === pin.id;

              return (
                <button
                  key={pin.id}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedEvent(pin);
                  }}
                  onMouseEnter={() => setHoveredPinId(pin.id)}
                  onMouseLeave={() => setHoveredPinId(null)}
                >
                  <span className="block w-4 h-4 rounded-full bg-[#F58025] ring-4 ring-[#F58025]/25 shadow-lg" />
                  {isHovered && (
                    <span className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap rounded-md px-2 py-1 text-xs text-white bg-black/80 border border-white/10">
                      {pin.title}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <div
                key={cluster.id}
                style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                onMouseEnter={() => setHoveredClusterId(cluster.id)}
                onMouseLeave={() => setHoveredClusterId(null)}
              >
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenClusterId((prev) => (prev === cluster.id ? null : cluster.id));
                  }}
                  className="w-8 h-8 rounded-full bg-[#00A8A8] text-black font-bold text-xs ring-4 ring-[#00A8A8]/25 shadow-lg"
                  title={`${cluster.pins.length} nearby events`}
                >
                  {cluster.pins.length}
                </button>

                {showList && (
                  <div className="absolute z-20 left-1/2 -translate-x-1/2 top-10 w-60 rounded-xl border border-white/10 bg-[#0f1116]/95 backdrop-blur-xl p-2">
                    <p className="text-xs text-gray-400 px-2 pb-1">Nearby events</p>
                    <ul className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {cluster.pins.map((pin) => (
                        <li key={pin.id}>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedEvent(pin);
                              setOpenClusterId(null);
                            }}
                            className="w-full text-left text-sm rounded-lg px-2 py-1.5 text-gray-200 hover:bg-white/10"
                          >
                            {pin.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {draftPos && (
            <div
              style={{ left: `${draftPos.x}%`, top: `${draftPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <span className="block w-4 h-4 rounded-full bg-[#A259FF] ring-4 ring-[#A259FF]/25 shadow-lg animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Click anywhere on the map box to add an event pin. Hover pins for titles. Nearby pins auto-cluster.
      </p>

      {draftPos && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <p className="text-sm text-gray-300 font-medium">Create Event at Selected Pin</p>
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Event title"
            className="w-full rounded-lg bg-black/25 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-gray-500"
          />
          <textarea
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            rows={2}
            placeholder="Event description"
            className="w-full rounded-lg bg-black/25 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-gray-500"
          />
          <input
            value={draftLocation}
            onChange={(event) => setDraftLocation(event.target.value)}
            placeholder="Location (placeholder for API)"
            className="w-full rounded-lg bg-black/25 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-gray-500"
          />
          <div className="flex gap-2">
            <button
              onClick={addEventPin}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#F58025] to-[#ff9447]"
            >
              Add Pin
            </button>
            <button
              onClick={() => setDraftPos(null)}
              className="rounded-lg px-4 py-2 text-sm text-gray-300 border border-white/15 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <p className="text-lg font-semibold text-white">{selectedEvent.title}</p>
          <p className="text-sm text-gray-300">{selectedEvent.description}</p>
          <p className="text-sm text-[#7bf0f0]">Location: {selectedEvent.location}</p>
          <p className="text-sm text-gray-400">Likes: {selectedEvent.likes}</p>
        </div>
      )}
    </div>
  );
}

function CampusPanel() {
  return (
    <div className="space-y-6">
      <CampusEventMap />

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
