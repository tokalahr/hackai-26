import { motion } from "motion/react";
import { Brain, MapPin, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Course Recommendations",
    description: "AI-powered suggestions based on your learning patterns, career goals, and academic history.",
    color: "#F58025",
    gradient: "from-[#F58025] to-[#ff9447]",
  },
  {
    icon: MapPin,
    title: "Real-Time Study Room Finder",
    description: "Find available study spaces across campus instantly with live occupancy data.",
    color: "#00A8A8",
    gradient: "from-[#00A8A8] to-[#00d4d4]",
  },
  {
    icon: TrendingUp,
    title: "Personalized Learning Map",
    description: "Track your academic progress and get insights on skill development and course pathways.",
    color: "#A259FF",
    gradient: "from-[#A259FF] to-[#c285ff]",
  },
  {
    icon: Users,
    title: "Skill-Based Peer Matching",
    description: "Connect with students who share your interests or complement your skills for collaborative learning.",
    color: "#F58025",
    gradient: "from-[#F58025] to-[#A259FF]",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0F] via-[#111113] to-[#0D0D0F]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#A259FF]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00A8A8]/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to excel academically, powered by real-time campus data
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group"
            >
              {/* Glassmorphism Card */}
              <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                {/* Gradient Glow on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className="relative mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 8px 24px ${feature.color}40` }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner Accent */}
                <div
                  className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ backgroundColor: feature.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-all duration-300">
            Explore All Features →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
