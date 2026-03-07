import { buildRoleRecommendation, readLearningInput } from "./recommendation-utils";

type ProfessionalRecommendationsPageProps = {
  onNavigate: (path: string) => void;
};

export function ProfessionalRecommendationsPage({ onNavigate }: ProfessionalRecommendationsPageProps) {
  const input = readLearningInput();

  if (!input || input.role !== "professional") {
    return (
      <section className="relative min-h-[70vh] pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#0D0D0F]" />
        <div className="relative z-10 space-y-5">
          <h1 className="text-4xl font-bold text-white">Professional Recommendations</h1>
          <p className="text-gray-400">No professional input found. Please submit the Learning Assistant form first.</p>
          <button
            onClick={() => onNavigate("/learning-assistant")}
            className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#F58025] to-[#ff9447]"
          >
            Go to Learning Assistant
          </button>
        </div>
      </section>
    );
  }

  const rec = buildRoleRecommendation(input, "professional");

  return (
    <section className="relative min-h-[70vh] pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-[#0D0D0F]" />
      <div className="relative z-10 space-y-6">
        <h1 className="text-4xl font-bold text-white">Professional Recommendations</h1>
        <p className="text-gray-400 max-w-2xl">
          Tailored for skill development and real-world execution for {input.name || "the learner"}.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <p className="text-[#ffc89d] font-semibold">{rec.headline}</p>
          <p className="text-sm text-gray-400">Topic: {input.topic}</p>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Next steps</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
              {rec.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Skill development focus</p>
            <div className="flex flex-wrap gap-2">
              {rec.focusAreas.map((focus) => (
                <span key={focus} className="px-3 py-1 rounded-full text-xs bg-[#F58025]/15 border border-[#F58025]/25 text-[#ffc89d]">
                  {focus}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Practice scenario</p>
            <p className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl p-3">{rec.scenario}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Resources</p>
            <ul className="space-y-2">
              {rec.resources.map((item) => (
                <li key={item.title} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <p className="text-gray-400 text-sm">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
