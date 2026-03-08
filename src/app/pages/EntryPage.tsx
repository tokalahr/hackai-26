import { Link } from "react-router";
import { motion } from "motion/react";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";

export default function EntryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              className="bg-white/20 backdrop-blur-sm p-6 rounded-full"
            >
              <GraduationCap className="w-24 h-24 text-white" />
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to UniLearn
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Your personalized learning platform for academic and professional growth
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
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
