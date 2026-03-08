import { motion } from "motion/react";
import { Info, Users, Target, Sparkles, Award, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                About UniLearn
              </h1>
              <p className="text-lg text-slate-600">
                Your personalized learning companion
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-700 leading-relaxed">
                UniLearn is a comprehensive learning platform designed to support both students and 
                professionals in their educational journey. We provide personalized recommendations, 
                track your progress, and connect you with the resources you need to succeed.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Sparkles,
                title: "Personalized Learning Assistant",
                description: "Get customized recommendations based on your goals, background, and learning style",
                color: "bg-indigo-100 text-indigo-600",
              },
              {
                icon: Target,
                title: "Goal-Oriented Pathways",
                description: "Clear learning paths designed for students and professionals alike",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Connect with peers, join study groups, and collaborate on projects",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Award,
                title: "Progress Tracking",
                description: "Monitor your achievements, courses, and certifications in one place",
                color: "bg-green-100 text-green-600",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Current Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Current Platform Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                UniLearn is currently running in <strong>frontend-only demo mode</strong>. This means:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>All data is stored locally in your browser's session storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Campus events and courses are populated with mock data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Learning recommendations are generated client-side</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Your session data will be cleared when you close the browser</span>
                </li>
              </ul>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> In a production environment, UniLearn would connect to a 
                  backend system to persist your data, provide real-time updates, and offer 
                  advanced analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">
                We envision a world where learning is accessible, personalized, and empowering for 
                everyone. Whether you're a student pursuing academic excellence or a professional 
                seeking to advance your career, UniLearn is here to guide you every step of the way. 
                Our platform adapts to your unique needs and helps you achieve your goals through 
                intelligent recommendations and comprehensive tracking.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-4xl text-indigo-600">2</CardTitle>
                <CardDescription>Learning Pathways</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-4xl text-purple-600">100%</CardTitle>
                <CardDescription>Personalized</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-4xl text-blue-600">∞</CardTitle>
                <CardDescription>Possibilities</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
