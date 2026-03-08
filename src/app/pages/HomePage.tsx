import { motion } from "motion/react";
import { Link } from "react-router";
import { BarChart3, BookOpen, Calendar, CheckCircle2, TrendingUp, Trophy, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import dashboardPreviewImage from "../../assets/c8fbaffa0a47973e9ca58a8bd06fc4b23895a2c5.png";

export default function HomePage() {
  // Get learner name from session storage
  const getLearnerName = () => {
    const savedData = sessionStorage.getItem("learningAssistantInput");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        return data.name || "Learner";
      } catch {
        return "Learner";
      }
    }
    return "Learner";
  };

  const name = getLearnerName();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-slate-900">
            Welcome, {name}
          </h1>
          <p className="text-lg text-slate-600">
            Your learning journey continues here
          </p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Dashboard Preview
              </CardTitle>
              <CardDescription>
                Quick overview of your learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                  {/* Progress Overview */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Overall Progress</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    {/* TODO: Replace with dynamic progress data */}
                    <div className="text-2xl font-bold text-slate-900">--</div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>

                  {/* Active Courses */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Active Courses</span>
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    {/* TODO: Replace with dynamic active courses count */}
                    <div className="text-2xl font-bold text-slate-900">--</div>
                    <div className="text-sm text-slate-500 mt-1">-- due this week</div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Next Event</span>
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    {/* TODO: Replace with dynamic event info */}
                    <div className="text-lg font-semibold text-slate-900">--</div>
                    <div className="text-sm text-slate-500">--</div>
                  </div>

                  {/* Achievement */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Recent Badge</span>
                      <Sparkles className="w-4 h-4 text-yellow-600" />
                    </div>
                    {/* TODO: Replace with dynamic badge info */}
                    <div className="text-lg font-semibold text-slate-900">--</div>
                    <div className="text-sm text-slate-500">--</div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/dashboard">
                  <Button className="w-full">
                    View Full Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/learning-assistant">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Sparkles className="w-8 h-8 text-indigo-600 mb-2" />
                  <CardTitle>Learning Assistant</CardTitle>
                  <CardDescription className="pt-0 pb-[10px]">
                    Get personalized learning recommendations
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Calendar className="w-8 h-8 text-purple-600 mb-2" />
                  <CardTitle>Campus Events</CardTitle>
                  <CardDescription>
                    View upcoming events and activities
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Your Courses</CardTitle>
                  <CardDescription>
                    Access your enrolled courses
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="border-0 bg-[#F9EEEE] shadow-none">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#F28B54]/20 text-[#E7682F]">
                  <BookOpen className="h-4 w-4" />
                </span>
                <CardDescription className="text-slate-700">Course in Progress</CardDescription>
              </div>
              {/* TODO: Replace with dynamic course in progress count */}
              <CardTitle className="text-5xl text-slate-900">--</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1.5 w-16 rounded-full bg-[#E7682F]" />
            </CardContent>
          </Card>

          <Card className="border-0 bg-[#ECF6F2] shadow-none">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <CardDescription className="text-slate-700">Course Completed</CardDescription>
              </div>
              {/* TODO: Replace with dynamic course completed count */}
              <CardTitle className="text-5xl text-slate-900">--</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1.5 w-16 rounded-full bg-emerald-500" />
            </CardContent>
          </Card>

          <Card className="border-0 bg-[#EEF4FB] shadow-none">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-600">
                  <Trophy className="h-4 w-4" />
                </span>
                <CardDescription className="text-slate-700">Certificates Earned</CardDescription>
              </div>
              {/* TODO: Replace with dynamic certificates earned count */}
              <CardTitle className="text-5xl text-slate-900">--</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1.5 w-16 rounded-full bg-blue-600" />
            </CardContent>
          </Card>

          <Card className="border-0 bg-[#F0F0FC] shadow-none">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20 text-violet-600">
                  <Users className="h-4 w-4" />
                </span>
                <CardDescription className="text-slate-700">Community Support</CardDescription>
              </div>
              {/* TODO: Replace with dynamic community support count */}
              <CardTitle className="text-5xl text-slate-900">--</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1.5 w-16 rounded-full bg-violet-600" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}