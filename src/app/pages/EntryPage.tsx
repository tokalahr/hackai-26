import { Link } from "react-router";
import { motion } from "motion/react";
import { GraduationCap, ArrowRight, BookOpen, Sparkles, Trophy, Briefcase, Brain, CalendarDays } from "lucide-react";
import { Button } from "../components/ui/button";

export default function EntryPage() {
  const leftIcons = [
    { Icon: BookOpen, className: "top-[16%] left-[7%]" },
    { Icon: Sparkles, className: "top-[42%] left-[12%]" },
    { Icon: Trophy, className: "top-[68%] left-[9%]" },
  ];

  const rightIcons = [
    { Icon: Briefcase, className: "top-[20%] right-[8%]" },
    { Icon: Brain, className: "top-[46%] right-[11%]" },
    { Icon: CalendarDays, className: "top-[72%] right-[8%]" },
  ];

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.14,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1.05 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1.08 }}
          transition={{ delay: 0.1, duration: 1.2, ease: "easeOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        {/* Side icon entrances: left icons come from left, right icons come from right */}
        <div className="absolute inset-0 hidden md:block pointer-events-none">
          {leftIcons.map(({ Icon, className }, index) => (
            <motion.div
              key={`left-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.15 + index * 0.1,
                duration: 0.75,
                type: "spring",
                stiffness: 90,
                damping: 18,
              }}
              className={`absolute ${className} bg-white/18 border border-white/30 rounded-2xl p-3 backdrop-blur-sm shadow-lg`}
              style={{ willChange: "transform, opacity" }}
            >
              <Icon className="w-7 h-7 text-white/95" />
            </motion.div>
          ))}

          {rightIcons.map(({ Icon, className }, index) => (
            <motion.div
              key={`right-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.2 + index * 0.1,
                duration: 0.75,
                type: "spring",
                stiffness: 90,
                damping: 18,
              }}
              className={`absolute ${className} bg-white/18 border border-white/30 rounded-2xl p-3 backdrop-blur-sm shadow-lg`}
              style={{ willChange: "transform, opacity" }}
            >
              <Icon className="w-7 h-7 text-white/95" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl">
        <motion.div
          initial="hidden"
          animate="show"
          variants={contentVariants}
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-2">
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 rounded-full border border-white/45"
                animate={{ scale: [1, 1.16, 1], opacity: [0.55, 0.15, 0.55] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-white/30"
                animate={{ scale: [1, 1.28, 1], opacity: [0.35, 0.08, 0.35] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full shadow-2xl">
                <GraduationCap className="w-24 h-24 text-white" />
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-2">
            <motion.div
              className="text-white font-semibold tracking-[0.22em] text-2xl md:text-3xl"
              initial={{ letterSpacing: "0.35em", opacity: 0 }}
              animate={{ letterSpacing: "0.22em", opacity: 1 }}
              transition={{ duration: 0.75, ease: "easeOut", delay: 0.15 }}
            >
              UNILEARN
            </motion.div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to UniLearn
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-white/90 mb-8">
            Your personalized learning platform for academic and professional growth
          </motion.p>

          <motion.div
            variants={itemVariants}
          >
            <Link to="/home">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-white/90 text-lg px-8 py-6 shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
