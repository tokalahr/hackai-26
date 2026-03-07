import { motion } from "motion/react";
import { Github, Star, GitFork, Code2 } from "lucide-react";

export function OpenSourceSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0D0D0F]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#F58025]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#A259FF]/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* Main Content */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
            {/* Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A259FF]/20 border border-[#A259FF]/30">
                <Code2 className="w-4 h-4 text-[#A259FF]" />
                <span className="text-sm text-[#A259FF] font-medium">Open Source</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Built by Students,
                  <br />
                  For Students
                </span>
              </h2>

              <p className="text-lg text-gray-400 leading-relaxed">
                This project is completely open source and built with the UT Dallas community in mind. 
                Contribute, customize, or learn from the codebase.
              </p>

              {/* Stats */}
              <div className="flex gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#F58025]" />
                  <div>
                    <div className="text-xl font-bold text-white">2.4k</div>
                    <div className="text-sm text-gray-400">Stars</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-[#00A8A8]" />
                  <div>
                    <div className="text-xl font-bold text-white">487</div>
                    <div className="text-sm text-gray-400">Forks</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#A259FF]" />
                  <div>
                    <div className="text-xl font-bold text-white">89</div>
                    <div className="text-sm text-gray-400">Contributors</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all duration-300"
                >
                  Read Docs
                </motion.button>
              </div>
            </motion.div>

            {/* Right Side - Code Snippet */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Code Window */}
              <div className="bg-[#1a1a1d] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Window Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-gray-400 ml-2">nebula-api.ts</span>
                </div>

                {/* Code Content */}
                <div className="p-4 font-mono text-sm overflow-x-auto">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[#A259FF]">import</span>{" "}
                      <span className="text-white">{"{"} NebulaClient {"}"}</span>{" "}
                      <span className="text-[#A259FF]">from</span>{" "}
                      <span className="text-[#00A8A8]">'@nebula/api'</span>
                      <span className="text-gray-500">;</span>
                    </div>
                    <div className="h-3" />
                    <div>
                      <span className="text-[#A259FF]">const</span>{" "}
                      <span className="text-[#F58025]">client</span>{" "}
                      <span className="text-white">=</span>{" "}
                      <span className="text-[#A259FF]">new</span>{" "}
                      <span className="text-[#00A8A8]">NebulaClient</span>
                      <span className="text-white">()</span>
                      <span className="text-gray-500">;</span>
                    </div>
                    <div className="h-3" />
                    <div>
                      <span className="text-gray-500">// Get course recommendations</span>
                    </div>
                    <div>
                      <span className="text-[#A259FF]">const</span>{" "}
                      <span className="text-white">courses</span>{" "}
                      <span className="text-white">=</span>{" "}
                      <span className="text-[#A259FF]">await</span>{" "}
                      <span className="text-[#F58025]">client</span>
                      <span className="text-white">.</span>
                      <span className="text-[#00A8A8]">getCourses</span>
                      <span className="text-white">()</span>
                      <span className="text-gray-500">;</span>
                    </div>
                    <div className="h-3" />
                    <div>
                      <span className="text-gray-500">// Find available rooms</span>
                    </div>
                    <div>
                      <span className="text-[#A259FF]">const</span>{" "}
                      <span className="text-white">rooms</span>{" "}
                      <span className="text-white">=</span>{" "}
                      <span className="text-[#A259FF]">await</span>{" "}
                      <span className="text-[#F58025]">client</span>
                      <span className="text-white">.</span>
                      <span className="text-[#00A8A8]">getAvailableRooms</span>
                      <span className="text-white">()</span>
                      <span className="text-gray-500">;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* UTD Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 bg-gradient-to-r from-[#F58025]/20 to-[#00A8A8]/20 backdrop-blur-sm border border-white/10 rounded-xl p-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#F58025] to-[#00A8A8] rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  UT
                </div>
                <div>
                  <div className="text-white font-semibold">UT Dallas Community</div>
                  <div className="text-sm text-gray-400">Powered by Nebula Labs</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
