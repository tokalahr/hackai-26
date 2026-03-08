import { useState } from "react";
import { motion } from "motion/react";
import {
  Brain,
  Target,
  ShieldAlert,
  Eye,
  TrendingUp,
  Gem,
  CircleCheckBig,
  ChevronRight,
  Loader2,
  BarChart3,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  fetchCalibrationQuestions,
  fetchCalibrationQuiz,
  submitCalibration,
  type CalibrationQuestion,
  type QuizQuestion,
  type CalibrationResult,
  type CalibrationSkill,
} from "../services/backend-api";

// ── Phase type ─────────────────────────────────────────
type Phase = "setup" | "selfAssessment" | "quiz" | "loading" | "results";

// ── Classification colors & labels ─────────────────────
const classColors: Record<string, string> = {
  overconfident: "bg-orange-50 text-orange-700 border-orange-300",
  underconfident: "bg-sky-50 text-sky-700 border-sky-300",
  blindspot: "bg-rose-50 text-rose-700 border-rose-300",
  hidden_strength: "bg-teal-50 text-teal-700 border-teal-300",
  aligned: "bg-green-50 text-green-700 border-green-300",
};

const classIcons: Record<string, typeof Brain> = {
  overconfident: ShieldAlert,
  underconfident: TrendingUp,
  blindspot: Eye,
  hidden_strength: Gem,
  aligned: CircleCheckBig,
};

const classLabels: Record<string, string> = {
  overconfident: "Presumptive",
  underconfident: "Recommended",
  blindspot: "Blindspot",
  hidden_strength: "Hidden Strength",
  aligned: "Aligned",
};

const BAR_COLORS = {
  actual: "#6366f1",
  perceived: "#a78bfa",
};

// ── Main Component ─────────────────────────────────────
export default function CalibrationPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [loadingMessage, setLoadingMessage] = useState("ARIA is analyzing your knowledge...");

  // Setup state
  const [courses, setCourses] = useState("");
  const [skills, setSkills] = useState("");
  const [targetRoles, setTargetRoles] = useState("");

  // Self-assessment state (perceived knowledge)
  const [questions, setQuestions] = useState<CalibrationQuestion[]>([]);
  const [selfRatings, setSelfRatings] = useState<Record<string, number>>({});

  // Quiz state (actual knowledge)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({}); // "skillId_qIndex" → selectedIndex

  // Results state
  const [results, setResults] = useState<CalibrationResult | null>(null);
  const [error, setError] = useState("");

  // ─ Step 1: Generate self-assessment questions ─────────
  const handleGenerateQuestions = async () => {
    setPhase("loading");
    setLoadingMessage("ARIA is generating your self-assessment...");
    setError("");
    try {
      const coursesArr = courses.split(",").map((s) => s.trim()).filter(Boolean);
      const skillsArr = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const rolesArr = targetRoles.split(",").map((s) => s.trim()).filter(Boolean);

      const data = await fetchCalibrationQuestions({
        courses: coursesArr,
        skills: skillsArr,
        targetRoles: rolesArr,
      });

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        const init: Record<string, number> = {};
        for (const q of data.questions) {
          init[q.skillId] = 3;
        }
        setSelfRatings(init);
        setPhase("selfAssessment");
      } else {
        setError("No questions generated. Try different inputs.");
        setPhase("setup");
      }
    } catch {
      setError("Failed to generate questions. Is the backend running?");
      setPhase("setup");
    }
  };

  // ─ Step 2: After self-assessment, generate quiz ───────
  const handleStartQuiz = async () => {
    setPhase("loading");
    setLoadingMessage("ARIA is building your knowledge quiz...");
    setError("");
    try {
      const skillPayload = questions.map((q) => ({
        skillId: q.skillId,
        skillName: q.skillName,
      }));

      const data = await fetchCalibrationQuiz({ skills: skillPayload });

      if (data.quiz && data.quiz.length > 0) {
        setQuizQuestions(data.quiz);
        // Initialize all quiz answers to -1 (unanswered)
        const init: Record<string, number> = {};
        for (const qq of data.quiz) {
          init[`${qq.skillId}_${qq.questionIndex}`] = -1;
        }
        setQuizAnswers(init);
        setPhase("quiz");
      } else {
        setError("No quiz questions generated. Try again.");
        setPhase("selfAssessment");
      }
    } catch {
      setError("Failed to generate quiz. Please try again.");
      setPhase("selfAssessment");
    }
  };

  // ─ Step 3: Submit everything ──────────────────────────
  const handleSubmitAll = async () => {
    setPhase("loading");
    setLoadingMessage("ARIA is computing your calibration...");
    setError("");
    try {
      // Build self-assessment payload: normalize 1-5 → 0-1
      const selfAssessment = Object.entries(selfRatings).map(([skillId, rating]) => ({
        skillId,
        perceivedScore: (rating - 1) / 4,
      }));

      // Build quiz answers payload
      const quizAnswersList = quizQuestions.map((qq) => ({
        skillId: qq.skillId,
        questionIndex: qq.questionIndex,
        selectedIndex: quizAnswers[`${qq.skillId}_${qq.questionIndex}`] ?? -1,
        correctIndex: qq.correctIndex,
      }));

      const data = await submitCalibration({
        selfAssessment,
        quizAnswers: quizAnswersList,
      });

      setResults(data);
      setPhase("results");

      // Persist calibration results so the ARIA skill graph can read them
      if (data.skills && data.skills.length > 0) {
        const provenSkills: Record<string, number> = {};
        for (const s of data.skills) {
          provenSkills[s.skillName || s.skillId] = s.actualKnowledgeScore;
        }
        sessionStorage.setItem("aria-calibration-results", JSON.stringify({
          provenSkills,
          calibrationScore: data.calibrationScore,
          timestamp: Date.now(),
        }));
        window.dispatchEvent(new Event("skill-tracks-updated"));
      }
    } catch {
      setError("Failed to compute calibration. Please try again.");
      setPhase("quiz");
    }
  };

  // Helper: count answered quiz questions
  const answeredCount = Object.values(quizAnswers).filter((v) => v >= 0).length;
  const totalQuizCount = quizQuestions.length;

  // ─ Loading screen ─────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
          <div className="text-lg text-slate-700 font-medium">{loadingMessage}</div>
          <p className="text-sm text-slate-500">This may take a moment</p>
        </div>
      </div>
    );
  }

  // ─ Phase: Setup ───────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">ARIA Calibration</h1>
                <p className="text-lg text-slate-600">
                  Measure what you know vs. what you think you know
                </p>
              </div>
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="pt-5 pb-4">
                <p className="text-sm font-semibold text-indigo-800 mb-2">How it works</p>
                <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside">
                  <li>You rate your own confidence in each skill (Perceived Knowledge)</li>
                  <li>ARIA gives you a short quiz to measure your actual understanding</li>
                  <li>We compare the two and show you where the gaps are</li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Your Academic Profile</CardTitle>
                <CardDescription>
                  Tell ARIA about your background so it can generate personalized calibration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Completed Courses (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={courses}
                    onChange={(e) => setCourses(e.target.value)}
                    placeholder="e.g. CS 1337, CS 2336, MATH 2418"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Known Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Python, HTML, CSS, SQL, Git"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Target Roles (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={targetRoles}
                    onChange={(e) => setTargetRoles(e.target.value)}
                    placeholder="e.g. Frontend Developer, Data Analyst"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleGenerateQuestions}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!courses && !skills}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Calibration
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─ Phase: Self-Assessment ─────────────────────────────
  if (phase === "selfAssessment") {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Step 1: Self-Assessment</h1>
                <p className="text-slate-600">
                  Rate your confidence for each skill (1 = beginner, 5 = expert)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Step 1 of 2</Badge>
              <span className="text-xs text-slate-500">Next: Knowledge Quiz</span>
            </div>
          </motion.div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <motion.div
                key={q.skillId + idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {q.skillName || q.skillId}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-800 font-medium mb-3">{q.question}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 w-4">1</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={selfRatings[q.skillId] ?? 3}
                          onChange={(e) =>
                            setSelfRatings((prev) => ({
                              ...prev,
                              [q.skillId]: parseInt(e.target.value, 10),
                            }))
                          }
                          className="flex-1 accent-indigo-600"
                        />
                        <span className="text-xs text-slate-500 w-4">5</span>
                        <span className="text-sm font-bold text-indigo-600 w-6 text-right">
                          {selfRatings[q.skillId] ?? 3}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setPhase("setup")} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleStartQuiz}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Next: Take the Quiz
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─ Phase: Quiz ────────────────────────────────────────
  if (phase === "quiz") {
    // Group quiz questions by skill
    const groupedBySkill: Record<string, QuizQuestion[]> = {};
    for (const qq of quizQuestions) {
      if (!groupedBySkill[qq.skillId]) groupedBySkill[qq.skillId] = [];
      groupedBySkill[qq.skillId].push(qq);
    }

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <BookOpen className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Step 2: Knowledge Quiz</h1>
                <p className="text-slate-600">
                  Answer these questions so ARIA can measure your actual understanding
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Step 2 of 2</Badge>
              <span className="text-xs text-slate-500">
                {answeredCount}/{totalQuizCount} answered
              </span>
            </div>
          </motion.div>

          {Object.entries(groupedBySkill).map(([skillId, skillQs]) => (
            <motion.div
              key={skillId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {skillQs[0]?.skillName || skillId.replace("_", " ")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {skillQs.map((qq) => {
                    const key = `${qq.skillId}_${qq.questionIndex}`;
                    const selected = quizAnswers[key] ?? -1;
                    return (
                      <div key={key} className="space-y-2">
                        <p className="text-sm font-medium text-slate-800">
                          Q{qq.questionIndex}. {qq.question}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {qq.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() =>
                                setQuizAnswers((prev) => ({ ...prev, [key]: optIdx }))
                              }
                              className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                                selected === optIdx
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-800 font-medium"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setPhase("selfAssessment")} className="flex-1">
              Back to Self-Assessment
            </Button>
            <Button
              onClick={handleSubmitAll}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={answeredCount < totalQuizCount}
            >
              Submit & See Results
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {answeredCount < totalQuizCount && (
            <p className="text-center text-xs text-slate-500">
              Answer all {totalQuizCount} questions to continue
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─ Phase: Results ─────────────────────────────────────
  if (phase === "results" && results) {
    const calibrationPct = Math.round((results.calibrationScore ?? 0) * 100);

    const radarData = (results.skills ?? []).map((s: CalibrationSkill) => ({
      subject: s.skillName || s.skillId,
      "Quiz Score": Math.round(s.actualKnowledgeScore * 100),
      "Self Rating": Math.round(s.perceivedKnowledgeScore * 100),
    }));

    const barData = (results.skills ?? []).map((s: CalibrationSkill) => ({
      name: s.skillName || s.skillId,
      "Quiz Score (AK)": Math.round(s.actualKnowledgeScore * 100),
      "Self Rating (PK)": Math.round(s.perceivedKnowledgeScore * 100),
    }));

    const classCounts: Record<string, number> = {};
    for (const s of results.skills ?? []) {
      classCounts[s.classification] = (classCounts[s.classification] ?? 0) + 1;
    }

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">ARIA Calibration Results</h1>
                <p className="text-lg text-slate-500 dark:text-slate-300">Quiz-verified knowledge calibration</p>
              </div>
            </div>
          </motion.div>

          {/* Score + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Dominant percentage */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card className="bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 h-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Calibration Score</p>
                  <p className="text-7xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{calibrationPct}%</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                    {calibrationPct >= 80
                      ? "Excellent self-awareness!"
                      : calibrationPct >= 60
                        ? "Good awareness with room to improve"
                        : "Significant gaps between perception and reality"}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Right: All classifications in one card */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
              <Card className="bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 h-full">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm text-slate-900 dark:text-slate-100">Classification Breakdown</CardTitle>
                  <CardDescription className="text-xs">How your skills are distributed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 px-4 pb-4">
                  {Object.entries(classLabels).map(([key, label]) => {
                    const Icon = classIcons[key];
                    const count = classCounts[key] ?? 0;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between px-3 py-2 text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-semibold">{label}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold">{count}</span>
                          <span className="text-[10px] ml-1 opacity-70">{count === 1 ? "skill" : "skills"}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-slate-700" />
                    Knowledge Radar
                  </CardTitle>
                  <CardDescription>Quiz Score vs Self Rating</CardDescription>
                </CardHeader>
                <CardContent>
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#475569" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Radar name="Quiz Score" dataKey="Quiz Score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        <Radar name="Self Rating" dataKey="Self Rating" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-slate-500">No radar data</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Bar Chart */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-slate-700" />
                    AK vs PK Comparison
                  </CardTitle>
                  <CardDescription>Side-by-side: quiz results vs your self-rating</CardDescription>
                </CardHeader>
                <CardContent>
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: "8px" }} />
                        <Legend />
                        <Bar dataKey="Quiz Score (AK)" fill={BAR_COLORS.actual} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Self Rating (PK)" fill={BAR_COLORS.perceived} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-slate-500">No bar data</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Knowledge Map Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Map</CardTitle>
                <CardDescription>Your self-rating vs quiz performance per skill</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Skill</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">You Said</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Quiz Shows</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Quiz Score</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Gap</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Classification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(results.knowledgeMap ?? []).map((entry, idx) => {
                        const cls = entry.classification || "aligned";
                        const Icon = classIcons[cls] || CircleCheckBig;
                        return (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-800">{entry.skillName}</td>
                            <td className="py-3 px-4 text-slate-600">{entry.youSaid}</td>
                            <td className="py-3 px-4 text-slate-600">{entry.quizShows}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary" className="text-xs font-mono">
                                {entry.quizScore}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{entry.gap}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${classColors[cls]}`}>
                                <Icon className="w-3 h-3" />
                                {classLabels[cls] || cls}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(results.blindspots ?? []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="border-rose-300 bg-rose-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-700">
                      <Eye className="w-5 h-5" />
                      Blindspots
                    </CardTitle>
                    <CardDescription>Skills you don't know that you don't know</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {results.blindspots.map((b, i) => (
                      <div key={i} className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                        <p className="text-sm font-medium text-rose-800">{b.skillId.replace("_", " ")}</p>
                        <p className="text-xs text-rose-600 mt-1">{b.reason}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs border-rose-300 text-rose-700">Impact: {Math.round(b.impact * 100)}%</Badge>
                          <span className="text-xs text-rose-600 font-medium">→ {b.nextStep}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}


          </div>

          {/* Restart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setPhase("setup");
                setResults(null);
                setQuestions([]);
                setSelfRatings({});
                setQuizQuestions([]);
                setQuizAnswers({});
              }}
              className="px-8"
            >
              Recalibrate
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
