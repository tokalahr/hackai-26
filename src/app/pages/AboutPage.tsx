import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Info, Users, Target, Sparkles, Award, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { fetchDashboardOverview } from "../services/backend-api";

export default function AboutPage() {
  // State for dynamic data
  const [aboutData, setAboutData] = useState<null | {
    mission: string;
    features: Array<{ title: string; description: string }>;
    platformMode: string;
    vision: string;
    stats: { pathways: number; personalized: string; possibilities: string };
  }>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching from backend (replace with real API call)
    fetchDashboardOverview().then(() => {
      setAboutData({
        mission: "Empowering learners with personalized, accessible, and intelligent education.",
        features: [
          { title: "Personalized Learning Assistant", description: "Get customized recommendations based on your goals, background, and learning style." },
          { title: "Goal-Oriented Pathways", description: "Clear learning paths designed for students and professionals alike." },
          { title: "Community Support", description: "Connect with peers, join study groups, and collaborate on projects." },
          { title: "Progress Tracking", description: "Monitor your achievements, courses, and certifications in one place." },
        ],
        platformMode: "UniLearn is currently running in full-stack mode, fetching live data from the backend and database.",
        vision: "A world where learning is accessible, personalized, and empowering for everyone.",
        stats: { pathways: 5, personalized: "100%", possibilities: "∞" },
      });
      setLoading(false);
    }).catch((e) => {
      setError(e.message);
      setLoading(false);
    });
  }, []);

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
              {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : <p className="text-lg text-slate-700 leading-relaxed">{aboutData?.mission}</p>}
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
            {loading ? <Card><CardHeader><CardTitle>Loading...</CardTitle></CardHeader></Card> : error ? <Card><CardHeader><CardTitle className="text-red-500">{error}</CardTitle></CardHeader></Card> : aboutData?.features.map((feature) => (
              <Card className="h-full hover:shadow-lg transition-shadow" key={feature.title}>
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
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
              {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : <p className="text-slate-700">{aboutData?.platformMode}</p>}
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
              {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : <p className="text-slate-700 leading-relaxed">{aboutData?.vision}</p>}
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
            {loading ? (
              <Card><CardHeader className="text-center"><CardTitle>Loading...</CardTitle></CardHeader></Card>
            ) : error ? (
              <Card><CardHeader className="text-center"><CardTitle className="text-red-500">{error}</CardTitle></CardHeader></Card>
            ) : (
              <>
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-4xl text-indigo-600">{aboutData?.stats.pathways}</CardTitle>
                    <CardDescription>Learning Pathways</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-4xl text-purple-600">{aboutData?.stats.personalized}</CardTitle>
                    <CardDescription>Personalized</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-4xl text-blue-600">{aboutData?.stats.possibilities}</CardTitle>
                    <CardDescription>Possibilities</CardDescription>
                  </CardHeader>
                </Card>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
