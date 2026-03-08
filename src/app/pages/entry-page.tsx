import { motion } from "motion/react";

type EntryPageProps = {
  onNavigate: (path: string) => void;
};

export function EntryPage({ onNavigate }: EntryPageProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0F] via-[#16161a] to-[#0D0D0F]" />
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#F58025]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-16 right-10 w-96 h-96 bg-[#00A8A8]/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-10"
      >
        <p className="text-sm uppercase tracking-[0.22em] text-[#F58025] mb-4">Welcome to UniLearn</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Build Smarter.
          <br />
          Learn Smarter.
        </h1>
        <p className="mt-4 text-gray-300 max-w-2xl">
          Explore campus data and personalized learning recommendations designed for students and professionals.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-4xl font-bold text-[#00A8A8]">10K+</p>
            <p className="text-gray-400">Learners Supported</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-4xl font-bold text-[#A259FF]">500+</p>
            <p className="text-gray-400">Courses Indexed</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-4xl font-bold text-[#F58025]">98%</p>
            <p className="text-gray-400">Satisfaction</p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => onNavigate("/home")}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#F58025] to-[#ff9447] hover:shadow-lg hover:shadow-[#F58025]/40 transition-all"
          >
            Enter Home Page
          </button>
        </div>
      </motion.div>
    </section>
  );
}
