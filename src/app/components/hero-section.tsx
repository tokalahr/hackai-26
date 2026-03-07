import { motion } from "motion/react";
import { Sparkles, Zap } from "lucide-react";

type HeroSectionProps = {
  onNavigate: (path: string) => void;
};

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0F] via-[#1a1a1d] to-[#0D0D0F]" />
      
      {/* Abstract Geometric Shapes */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#F58025]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00A8A8]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#A259FF]/20 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F58025]/10 border border-[#F58025]/30"
            >
              <Sparkles className="w-4 h-4 text-[#F58025]" />
              <span className="text-sm text-[#F58025]">University + Learning Assistant</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                Build Smarter.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#F58025] via-[#00A8A8] to-[#A259FF] bg-clip-text text-transparent">
                Learn Smarter.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 max-w-lg"
            >
              Explore campus events and courses, then generate personalized learning next steps with reasons.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <button
                onClick={() => onNavigate("/dashboard")}
                className="px-8 py-4 bg-gradient-to-r from-[#F58025] to-[#ff9447] rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-[#F58025]/50 transition-all duration-300 transform hover:scale-105"
              >
                Open Dashboard
              </button>
              <button
                onClick={() => onNavigate("/about")}
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Learn More
              </button>
            </motion.div>

          </motion.div>

          {/* Right - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Glassmorphism Card */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Your Dashboard</h3>
                      <p className="text-sm text-gray-400">Today's Recommendations</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F58025] to-[#00A8A8] rounded-full" />
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {[
                      { title: "CS 4337 - Advanced Algorithms", color: "#F58025", progress: 75 },
                      { title: "MATH 2418 - Linear Algebra", color: "#00A8A8", progress: 60 },
                      { title: "ECS 3390 - Tech Writing", color: "#A259FF", progress: 90 },
                    ].map((course, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white font-medium">{course.title}</span>
                          <span className="text-xs text-gray-400">{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ delay: 0.8 + idx * 0.1, duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: course.color }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#F58025]">12</div>
                      <div className="text-xs text-gray-400">Rooms</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#00A8A8]">8</div>
                      <div className="text-xs text-gray-400">Peers</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-[#A259FF]">5</div>
                      <div className="text-xs text-gray-400">Skills</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-[#A259FF] to-[#F58025] rounded-2xl shadow-lg shadow-[#A259FF]/50"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-[#00A8A8] to-[#A259FF] rounded-2xl shadow-lg shadow-[#00A8A8]/50"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
