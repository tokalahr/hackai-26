export function AboutPage() {
  return (
    <section className="relative min-h-[70vh] pt-32 pb-16 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#0D0D0F]" />
      <div className="absolute top-16 right-16 w-72 h-72 bg-[#00A8A8]/15 rounded-full blur-3xl" />
      <div className="absolute bottom-16 left-16 w-72 h-72 bg-[#F58025]/15 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto max-w-4xl space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white">About UniLearn</h1>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 text-gray-300">
          <p>
            UniLearn combines two core experiences in one interface: campus intelligence and
            guided professional learning.
          </p>
          <p>
            The campus side surfaces courses, events, and locations so students can quickly
            understand what is happening and where. The learning side takes a learner profile,
            current level, and goals to generate next-step recommendations with rationale.
          </p>
          <p>
            This version runs entirely client-side with local mock data so the full UX can be
            demonstrated without a backend.
          </p>
        </div>
      </div>
    </section>
  );
}
