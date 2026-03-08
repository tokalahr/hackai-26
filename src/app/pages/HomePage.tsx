import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
  Brain,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { fetchAriaGraph, fetchCalendarEventsByDate, type AriaProfile } from "../services/backend-api";

type DashboardStats = {
  skillsUnlocked: number;
  skillsInProgress: number;
  skillsAvailable: number;
  totalSkills: number;
  coursesTracked: number;
  todayEvents: number;
  nextEventName: string;
  quizAnswered: number;
  quizCorrect: number;
  calibrationScore: number | null;
};

function readSessionJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export default function HomePage() {
  const getLearnerName = () => {
    const savedData = sessionStorage.getItem("learningAssistantInput");
    if (savedData) {
      try { return JSON.parse(savedData).name || "Learner"; } catch { return "Learner"; }
    }
    return "Learner";
  };

  const name = getLearnerName();
  const [stats, setStats] = useState<DashboardStats>({
    skillsUnlocked: 0, skillsInProgress: 0, skillsAvailable: 0, totalSkills: 0,
    coursesTracked: 0, todayEvents: 0, nextEventName: "",
    quizAnswered: 0, quizCorrect: 0, calibrationScore: null,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const newStats = { ...stats };

      // Courses from localStorage
      try {
        const courses = JSON.parse(localStorage.getItem("dashboard-manual-courses") || "[]");
        newStats.coursesTracked = Array.isArray(courses) ? courses.length : 0;
      } catch { /* ignore */ }

      // Quiz progress from sessionStorage
      const quizRaw = readSessionJson<{ provenSkills?: Record<string, number> }>("aria-quiz-progress");
      if (quizRaw?.provenSkills) {
        const scores = Object.values(quizRaw.provenSkills);
        newStats.quizAnswered = scores.length;
        newStats.quizCorrect = scores.filter((s) => s >= 0.5).length;
      }

      // Calibration from sessionStorage
      const calRaw = readSessionJson<{ calibrationScore?: number }>("aria-calibration-results");
      if (calRaw?.calibrationScore !== undefined) {
        newStats.calibrationScore = calRaw.calibrationScore;
      }

      // Proven skills for ARIA graph
      const provenSkills: Record<string, number> = {};
      if (calRaw) {
        const calSkills = readSessionJson<{ provenSkills?: Record<string, number> }>("aria-calibration-results");
        if (calSkills?.provenSkills) Object.assign(provenSkills, calSkills.provenSkills);
      }
      if (quizRaw?.provenSkills) {
        for (const [k, v] of Object.entries(quizRaw.provenSkills)) {
          if (provenSkills[k] === undefined || v > provenSkills[k]) provenSkills[k] = v;
        }
      }

      // ARIA graph for skill stats
      try {
        const coursesList = (() => {
          try {
            const c = JSON.parse(localStorage.getItem("dashboard-manual-courses") || "[]") as Array<{ code?: string }>;
            return c.map((x) => x.code || "").filter(Boolean);
          } catch { return []; }
        })();

        const profile: AriaProfile = {
          completed_courses: coursesList.length > 0 ? coursesList : ["CS 1336", "CS 1337", "CS 2305", "CS 2336"],
          current_courses: ["CS 3345"],
          major: "Computer Science",
          target_roles: ["Software Engineer"],
          interests: [],
          inferred_skills_override: [],
          proven_skills: provenSkills,
        };
        const graph = await fetchAriaGraph(profile);
        if (!cancelled && graph?.skillTree?.nodes) {
          const skillNodes = graph.skillTree.nodes.filter((n) => n.type === "skill");
          newStats.totalSkills = skillNodes.length;
          newStats.skillsUnlocked = skillNodes.filter((n) => n.state === "unlocked").length;
          newStats.skillsInProgress = skillNodes.filter((n) => n.state === "in_progress").length;
          newStats.skillsAvailable = skillNodes.filter((n) => n.state === "available_next").length;
        }
      } catch { /* ARIA graph unavailable */ }

      // Today's calendar events
      try {
        const today = new Date().toISOString().slice(0, 10);
        const calData = await fetchCalendarEventsByDate(today);
        if (!cancelled && calData?.buildings) {
          let count = 0;
          let firstName = "";
          for (const b of calData.buildings) {
            for (const r of b.rooms || []) {
              for (const ev of r.events || []) {
                count++;
                if (!firstName && ev.summary) firstName = ev.summary;
              }
            }
          }
          newStats.todayEvents = count;
          newStats.nextEventName = firstName;
        }
      } catch { /* calendar unavailable */ }

      if (!cancelled) { setStats(newStats); setLoaded(true); }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const progressPct = stats.totalSkills > 0 ? Math.round((stats.skillsUnlocked / stats.totalSkills) * 100) : 0;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Welcome, {name}</h1>
          <p className="text-lg text-slate-600">Your learning journey continues here</p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Dashboard Preview
              </CardTitle>
              <CardDescription>Quick overview of your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                  {/* Skills Progress */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Skills Unlocked</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loaded ? `${stats.skillsUnlocked} / ${stats.totalSkills}` : "..."}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  {/* Courses Tracked */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Courses Tracked</span>
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loaded ? stats.coursesTracked : "..."}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {stats.skillsAvailable > 0 ? `${stats.skillsAvailable} skills available next` : "Add courses on Dashboard"}
                    </div>
                  </div>

                  {/* Today's Events */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Today's Events</span>
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                      {loaded ? (stats.todayEvents > 0 ? `${stats.todayEvents} events` : "No events today") : "..."}
                    </div>
                    <div className="text-sm text-slate-500 truncate">
                      {stats.nextEventName || "Check the Dashboard for this week"}
                    </div>
                  </div>

                  {/* Calibration Score */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Calibration</span>
                      <Brain className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900">
                      {stats.calibrationScore !== null
                        ? `${Math.round(stats.calibrationScore * 100)}%`
                        : loaded ? "Not calibrated" : "..."}
                    </div>
                    <div className="text-sm text-slate-500">
                      {stats.calibrationScore !== null ? "Knowledge accuracy" : "Take the ARIA Calibration"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/dashboard">
                  <Button className="w-full">View Full Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/learning-assistant">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Sparkles className="w-8 h-8 text-indigo-600 mb-2" />
                  <CardTitle>Learning Assistant</CardTitle>
                  <CardDescription className="pt-0 pb-[10px]">Get personalized learning recommendations</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Calendar className="w-8 h-8 text-purple-600 mb-2" />
                  <CardTitle>Campus Events</CardTitle>
                  <CardDescription>View upcoming events and activities</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to="/calibration">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Brain className="w-8 h-8 text-indigo-600 mb-2" />
                  <CardTitle>ARIA Calibration</CardTitle>
                  <CardDescription>Measure what you know vs. what you think you know</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 bg-[#ECF6F2] shadow-none">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <CardDescription className="text-slate-700">Skills Unlocked</CardDescription>
              </div>
              <CardTitle className="text-5xl text-slate-900">{loaded ? stats.skillsUnlocked : "--"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0"><div className="h-1.5 w-16 rounded-full bg-emerald-500" /></CardContent>
          </Card>

          <Card className="border-0 bg-[#F9EEEE] shadow-none">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#F28B54]/20 text-[#E7682F]">
                  <Zap className="h-4 w-4" />
                </span>
                <CardDescription className="text-slate-700">In Progress</CardDescription>
              </div>
              <CardTitle className="text-5xl text-slate-900">{loaded ? stats.skillsInProgress : "--"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0"><div className="h-1.5 w-16 rounded-full bg-[#E7682F]" /></CardContent>
          </Card>

          <Card className="border-0 bg-[#EEF4FB] shadow-none">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-600">
                  <Target className="h-4 w-4" />
                </span>
                <CardDescription className="text-slate-700">Available Next</CardDescription>
              </div>
              <CardTitle className="text-5xl text-slate-900">{loaded ? stats.skillsAvailable : "--"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0"><div className="h-1.5 w-16 rounded-full bg-blue-600" /></CardContent>
          </Card>

          <Card className="border-0 bg-[#F0F0FC] shadow-none">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20 text-violet-600">
                  <Calendar className="h-4 w-4" />
                </span>
                <CardDescription className="text-slate-700">Today's Events</CardDescription>
              </div>
              <CardTitle className="text-5xl text-slate-900">{loaded ? stats.todayEvents : "--"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0"><div className="h-1.5 w-16 rounded-full bg-violet-600" /></CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
