import { motion } from "motion/react";
import { Link } from "react-router";
import { BarChart3, BookOpen, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import dashboardPreviewImage from "figma:asset/c8fbaffa0a47973e9ca58a8bd06fc4b23895a2c5.png";

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
                    <div className="text-2xl font-bold text-slate-900">72%</div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  {/* Active Courses */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Active Courses</span>
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">18</div>
                    <div className="text-sm text-slate-500 mt-1">5 due this week</div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Next Event</span>
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900">Workshop</div>
                    <div className="text-sm text-slate-500">Tomorrow at 2 PM</div>
                  </div>

                  {/* Achievement */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Recent Badge</span>
                      <Sparkles className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900">🏆 Star Learner</div>
                    <div className="text-sm text-slate-500">Earned 2 days ago</div>
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
                  <CardDescription className="px-[0px] py-[5px] px-[0px] py-[10px] px-[0px] pt-[0px] pb-[10px]">
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
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Courses in Progress</CardDescription>
              <CardTitle className="text-3xl">18</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+2 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Courses Completed</CardDescription>
              <CardTitle className="text-3xl">23</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+3 this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Certificates Earned</CardDescription>
              <CardTitle className="text-3xl">15</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+1 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Community Support</CardDescription>
              <CardTitle className="text-3xl">87</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Highly active</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}