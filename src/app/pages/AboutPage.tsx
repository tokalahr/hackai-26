import { motion } from "motion/react";
import { Info, Users, Target, Sparkles, Award, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
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
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Replace with dynamic mission statement */}
              <p className="text-lg text-slate-700 leading-relaxed">--</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TODO: Replace with dynamic features list */}
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>--</CardTitle>
                <CardDescription>--</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.div>

        {/* Current Mode */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Current Platform Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Replace with dynamic platform mode info */}
              <p className="text-slate-700">--</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Replace with dynamic vision statement */}
              <p className="text-slate-700 leading-relaxed">--</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TODO: Replace with dynamic stats */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-4xl text-indigo-600">--</CardTitle>
                <CardDescription>Learning Pathways</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-4xl text-purple-600">--</CardTitle>
                <CardDescription>Personalized</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-4xl text-blue-600">--</CardTitle>
                <CardDescription>Possibilities</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
