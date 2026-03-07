import { motion } from "motion/react";
import { Plug, Brain, Zap } from "lucide-react";

const steps = [
  {
    icon: Plug,
    title: "Connect Nebula API",
    description: "Seamlessly integrate with UT Dallas's comprehensive campus data including coursebook, profiles, and room scheduling.",
    color: "#F58025",
    number: "01",
  },
  {
    icon: Brain,
    title: "Analyze Learning Patterns",
    description: "Our AI engine processes your academic history, preferences, and goals to understand your unique learning journey.",
    color: "#00A8A8",
    number: "02",
  },
  {
    icon: Zap,
    title: "Get Personalized Insights",
    description: "Receive tailored course recommendations, study space suggestions, and peer connections that match your needs.",
    color: "#A259FF",
    number: "03",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0F] via-[#111113] to-[#0D0D0F]" />
      
      {/* Decorative Lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Three simple steps to transform your academic experience
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines (Desktop) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-px">
            <div className="relative w-full h-full max-w-5xl mx-auto">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#F58025] via-[#00A8A8] to-[#A259FF] origin-left"
              />
            </div>
          </div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="relative"
            >
              {/* Card */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                      boxShadow: `0 8px 24px ${step.color}60`,
                    }}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                      border: `1px solid ${step.color}30`,
                    }}
                  >
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Bottom Accent */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                  style={{
                    background: `linear-gradient(90deg, ${step.color}00, ${step.color}, ${step.color}00)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F58025] to-[#ff9447] border-2 border-[#0D0D0F]" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A8A8] to-[#00d4d4] border-2 border-[#0D0D0F]" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A259FF] to-[#c285ff] border-2 border-[#0D0D0F]" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Join 10,000+ students</p>
              <p className="text-sm text-gray-400">Already using our platform</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
