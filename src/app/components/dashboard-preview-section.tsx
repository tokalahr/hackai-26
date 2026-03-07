import { motion } from "motion/react";
import { useState } from "react";
import { BookOpen, MapPin, TrendingUp, Sparkles } from "lucide-react";

const tabs = [
  { id: "courses", label: "Recommended Courses", icon: BookOpen },
  { id: "rooms", label: "Study Rooms", icon: MapPin },
  { id: "progress", label: "Learning Map", icon: TrendingUp },
  { id: "suggestions", label: "Daily Insights", icon: Sparkles },
];

export function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState("courses");

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0D0D0F]" />

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Your Personalized Hub
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A unified dashboard that brings together all your academic tools and insights
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#F58025] to-[#ff9447] text-white shadow-lg shadow-[#F58025]/30"
                  : "bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative"
        >
          {/* Main Dashboard Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Content based on active tab */}
            {activeTab === "courses" && <CoursesContent />}
            {activeTab === "rooms" && <RoomsContent />}
            {activeTab === "progress" && <ProgressContent />}
            {activeTab === "suggestions" && <SuggestionsContent />}
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#F58025] to-[#00A8A8] rounded-3xl opacity-20 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-[#A259FF] to-[#00A8A8] rounded-3xl opacity-20 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

function CoursesContent() {
  const courses = [
    { code: "CS 4349", name: "Advanced Algorithm Design", prof: "Dr. Smith", match: 95, color: "#F58025" },
    { code: "CS 4375", name: "Machine Learning", prof: "Dr. Johnson", match: 92, color: "#00A8A8" },
    { code: "CS 4384", name: "Automata Theory", prof: "Dr. Williams", match: 88, color: "#A259FF" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-white mb-6">Recommended for You</h3>
      {courses.map((course, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-semibold text-white">{course.code}</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">{course.match}% Match</span>
              </div>
              <h4 className="text-white font-medium mb-1">{course.name}</h4>
              <p className="text-sm text-gray-400">{course.prof}</p>
            </div>
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity" style={{ backgroundImage: `linear-gradient(135deg, ${course.color}, ${course.color}88)` }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RoomsContent() {
  const rooms = [
    { name: "Engineering North 1.204", status: "Available", capacity: 8, occupied: 2 },
    { name: "Student Union 2.302", status: "Available", capacity: 12, occupied: 5 },
    { name: "Library Study Room A", status: "Busy", capacity: 6, occupied: 6 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-white mb-6">Available Study Spaces</h3>
      {rooms.map((room, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">{room.name}</h4>
            <span className={`px-3 py-1 rounded-full text-xs ${room.status === "Available" ? "bg-[#00A8A8]/20 text-[#00A8A8]" : "bg-red-500/20 text-red-400"}`}>
              {room.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Capacity: {room.capacity} seats</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(room.capacity)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < room.occupied ? "bg-[#F58025]" : "bg-white/20"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProgressContent() {
  const skills = [
    { name: "Algorithms & Data Structures", progress: 85, color: "#F58025" },
    { name: "Web Development", progress: 72, color: "#00A8A8" },
    { name: "Machine Learning", progress: 60, color: "#A259FF" },
    { name: "Database Systems", progress: 78, color: "#F58025" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-white mb-6">Your Learning Progress</h3>
      {skills.map((skill, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{skill.name}</span>
            <span className="text-gray-400">{skill.progress}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skill.progress}%` }}
              transition={{ delay: 0.3 + idx * 0.1, duration: 0.8 }}
              className="h-full rounded-full"
              style={{ backgroundColor: skill.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SuggestionsContent() {
  const suggestions = [
    { title: "Join Study Group for CS 4349", description: "3 students with similar schedules are looking for partners", icon: "👥" },
    { title: "Room EN 2.301 Available Soon", description: "Opens in 15 minutes, perfect for your next class prep", icon: "📍" },
    { title: "Complete Linear Algebra Review", description: "Recommended before starting Machine Learning next week", icon: "✨" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-white mb-6">Today's Personalized Suggestions</h3>
      {suggestions.map((suggestion, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all flex gap-4"
        >
          <div className="text-3xl">{suggestion.icon}</div>
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">{suggestion.title}</h4>
            <p className="text-sm text-gray-400">{suggestion.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
