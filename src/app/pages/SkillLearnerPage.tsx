import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import {
  Brain,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Briefcase,
  Target,
  AlertTriangle,
  Zap,
  BookOpen,
  Calendar,
  Rocket,
  Lock,
  Unlock,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  Network,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import SkillTreeGraph from "../components/SkillTreeGraph";
import {
  fetchAriaGraph,
  type AriaGraphResponse,
  type AriaNode,
  type AriaProfile,
  type AriaBlindspot,
  type AriaRecommendationItem,
  type AriaProject,
} from "../services/backend-api";

type StudentCache = {
  nextSteps?: Array<{ title?: string; description?: string }>;
  focusAreas?: string[];
};

type ProfessionalCache = {
  roadmapSteps?: Array<{ title?: string; description?: string }>;
  competencies?: Array<{ skill?: string }>;
};

type QuizTrack = "student" | "professional";

function readJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const STATE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  unlocked: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  available_next: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  locked: { bg: "bg-slate-50", text: "text-slate-400", border: "border-slate-200" },
};

const STATE_ICONS: Record<string, typeof CheckCircle2> = {
  unlocked: CheckCircle2,
  in_progress: Loader2,
  available_next: Unlock,
  locked: Lock,
};

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  skill: Zap,
  course: BookOpen,
  concept: Brain,
  event: Calendar,
  role: Target,
  program: GraduationCap,
};

function StateIcon({ state }: { state: string }) {
  const Icon = STATE_ICONS[state] || Lock;
  const colors = STATE_COLORS[state] || STATE_COLORS.locked;
  return <Icon className={`w-4 h-4 ${colors.text}`} />;
}

function TypeIcon({ type }: { type: string }) {
  const Icon = TYPE_ICONS[type] || Brain;
  return <Icon className="w-4 h-4" />;
}

function SkillTreeNode({ node }: { node: AriaNode }) {
  const colors = STATE_COLORS[node.state] || STATE_COLORS.locked;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 rounded-lg border ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
    >
      <div className="flex items-center gap-2 mb-1">
        <StateIcon state={node.state} />
        <TypeIcon type={node.type} />
        <span className={`text-sm font-medium ${colors.text}`}>{node.label}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        <Badge variant="outline" className="text-xs">
          {node.type}
        </Badge>
        <Badge
          variant="outline"
          className={`text-xs ${
            node.relevance === "high"
              ? "border-purple-300 text-purple-600"
              : node.relevance === "medium"
              ? "border-blue-300 text-blue-600"
              : "border-slate-200 text-slate-400"
          }`}
        >
          {node.relevance}
        </Badge>
        {node.unlocksCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            unlocks {node.unlocksCount}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

function BlindspotCard({ blindspot }: { blindspot: AriaBlindspot }) {
  const impactPct = Math.round(blindspot.impact_score * 100);
  const urgencyPct = Math.round(blindspot.urgency_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border border-amber-200 bg-amber-50/50"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
          <Eye className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-slate-900 text-sm">{blindspot.id}</span>
            <Badge variant="outline" className="text-xs">{blindspot.type}</Badge>
          </div>
          <p className="text-sm text-slate-600 mb-2">{blindspot.reason}</p>
          <div className="flex gap-3 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Impact:</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${impactPct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600">{impactPct}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Urgency:</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${urgencyPct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600">{urgencyPct}%</span>
            </div>
          </div>
          <div className="flex items-start gap-1 text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
            <Rocket className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{blindspot.next_step}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RecommendationCard({
  item,
  icon: Icon,
}: {
  item: AriaRecommendationItem;
  icon: typeof Zap;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 transition-colors"
    >
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-sm font-medium text-slate-900">{item.label}</span>
          <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project }: { project: AriaProject }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex items-start gap-2">
        <Rocket className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-sm font-medium text-slate-900">{project.title}</span>
          <p className="text-xs text-slate-500 mt-0.5">{project.reason}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {project.skills.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SkillLearnerPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const hasStudentTrack = Boolean(sessionStorage.getItem("student-recommendations-cache"));
  const hasProfessionalTrack = Boolean(sessionStorage.getItem("professional-recommendations-cache"));

  const requestedTrack = searchParams.get("track");
  const initialTrack: QuizTrack = requestedTrack === "professional" ? "professional" : "student";

  const [activeTrack, setActiveTrack] = useState<QuizTrack>(initialTrack);
  const [ariaData, setAriaData] = useState<AriaGraphResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllNodes, setShowAllNodes] = useState(false);
  const [filterState, setFilterState] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");

  useEffect(() => {
    if (hasStudentTrack && !hasProfessionalTrack) {
      setActiveTrack("student");
      setSearchParams({ track: "student" });
    } else if (!hasStudentTrack && hasProfessionalTrack) {
      setActiveTrack("professional");
      setSearchParams({ track: "professional" });
    }
  }, [hasStudentTrack, hasProfessionalTrack, setSearchParams]);

  useEffect(() => {
    if (!hasStudentTrack && !hasProfessionalTrack) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const studentCache = readJson<StudentCache>("student-recommendations-cache");
    const professionalCache = readJson<ProfessionalCache>("professional-recommendations-cache");

    const dashboardCourses = JSON.parse(localStorage.getItem("dashboard-manual-courses") || "[]") as Array<{
      code?: string;
    }>;
    const coursesList = dashboardCourses.map((c) => c.code || "").filter(Boolean);

    const inputRaw = sessionStorage.getItem("learningAssistantInput");
    let topic = "";
    let background = "";
    if (inputRaw) {
      try {
        const parsed = JSON.parse(inputRaw);
        topic = parsed.topic || "";
        background = parsed.background || "";
      } catch {
        /* ignore */
      }
    }

    const inferredSkills: string[] = [];
    if (activeTrack === "student" && studentCache) {
      (studentCache.focusAreas || []).forEach((a) => inferredSkills.push(a));
      (studentCache.nextSteps || []).forEach((s) => {
        if (s.title) inferredSkills.push(s.title);
      });
    } else if (activeTrack === "professional" && professionalCache) {
      (professionalCache.competencies || []).forEach((c) => {
        if (c.skill) inferredSkills.push(c.skill);
      });
      (professionalCache.roadmapSteps || []).forEach((r) => {
        if (r.title) inferredSkills.push(r.title);
      });
    }

    const interests = topic ? [topic] : [];
    if (background) {
      background
        .split(/[,.\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 2 && s.length < 40)
        .slice(0, 3)
        .forEach((s) => interests.push(s));
    }

    const profile: AriaProfile = {
      completed_courses: coursesList.length > 0 ? coursesList : ["CS 1336", "CS 1337", "CS 2305", "CS 2336"],
      current_courses: ["CS 3345"],
      major: "Computer Science",
      target_roles: activeTrack === "professional" ? ["Software Engineer", "Full-Stack Developer"] : ["Software Engineer"],
      interests,
      inferred_skills_override: inferredSkills,
    };

    fetchAriaGraph(profile)
      .then((data) => {
        if (!cancelled) {
          setAriaData(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to load ARIA graph");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Only re-fetch when the track changes or an explicit refresh is requested
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack, fetchKey]);

  const switchTrack = (next: QuizTrack) => {
    setActiveTrack(next);
    setSearchParams({ track: next });
    setAriaData(null);
  };

  const filteredNodes = useMemo(() => {
    if (!ariaData) return [];
    let nodes = ariaData.skillTree.nodes;
    if (filterState) nodes = nodes.filter((n) => n.state === filterState);
    if (filterType) nodes = nodes.filter((n) => n.type === filterType);
    nodes.sort((a, b) => {
      const stateOrder: Record<string, number> = { unlocked: 0, in_progress: 1, available_next: 2, locked: 3 };
      const relOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const sd = (stateOrder[a.state] ?? 3) - (stateOrder[b.state] ?? 3);
      if (sd !== 0) return sd;
      const rd = (relOrder[a.relevance] ?? 2) - (relOrder[b.relevance] ?? 2);
      if (rd !== 0) return rd;
      return b.unlocksCount - a.unlocksCount;
    });
    return nodes;
  }, [ariaData, filterState, filterType]);

  const displayedNodes = showAllNodes ? filteredNodes : filteredNodes.slice(0, 24);

  const stateCounts = useMemo(() => {
    if (!ariaData) return { unlocked: 0, in_progress: 0, available_next: 0, locked: 0 };
    const counts: Record<string, number> = { unlocked: 0, in_progress: 0, available_next: 0, locked: 0 };
    ariaData.skillTree.nodes.forEach((n) => {
      counts[n.state] = (counts[n.state] || 0) + 1;
    });
    return counts;
  }, [ariaData]);

  if (!hasStudentTrack && !hasProfessionalTrack) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>ARIA Skill Learner Not Available Yet</CardTitle>
            <CardDescription>
              Generate at least one recommendation track through the Learning Assistant, then return here
              for your personalized skill tree and graph analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/learning-assistant">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Learning Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Network className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">ARIA Skill Learner</h1>
              <p className="text-lg text-slate-600">
                Your personalized Academic Knowledge Graph — see what you know, what you're missing,
                and what to learn next.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Track Selector + Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Track & Overview</CardTitle>
            <CardDescription>
              Select your track to view the corresponding skill graph analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {hasStudentTrack && (
                <Button
                  type="button"
                  variant={activeTrack === "student" ? "default" : "outline"}
                  onClick={() => switchTrack("student")}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student
                </Button>
              )}
              {hasProfessionalTrack && (
                <Button
                  type="button"
                  variant={activeTrack === "professional" ? "default" : "outline"}
                  onClick={() => switchTrack("professional")}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Professional
                </Button>
              )}
            </div>

            {ariaData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    filterState === "unlocked" ? "border-emerald-400 bg-emerald-50" : "border-slate-200"
                  }`}
                  onClick={() => setFilterState(filterState === "unlocked" ? null : "unlocked")}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-600">{stateCounts.unlocked}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Unlocked</p>
                </div>
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    filterState === "in_progress" ? "border-amber-400 bg-amber-50" : "border-slate-200"
                  }`}
                  onClick={() => setFilterState(filterState === "in_progress" ? null : "in_progress")}
                >
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-600">{stateCounts.in_progress}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">In Progress</p>
                </div>
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    filterState === "available_next" ? "border-blue-400 bg-blue-50" : "border-slate-200"
                  }`}
                  onClick={() => setFilterState(filterState === "available_next" ? null : "available_next")}
                >
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{stateCounts.available_next}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Available Next</p>
                </div>
                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    filterState === "locked" ? "border-slate-400 bg-slate-50" : "border-slate-200"
                  }`}
                  onClick={() => setFilterState(filterState === "locked" ? null : "locked")}
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="text-2xl font-bold text-slate-400">{stateCounts.locked}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Locked</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-10 w-10 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-slate-600 font-medium">Building your ARIA knowledge graph...</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Error loading graph: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {ariaData && !loading && (
          <>
            {/* Skill Tree — view toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-slate-900">Skill Tree</h2>
                <span className="text-sm text-slate-500">
                  {ariaData.skillTree.nodes.length} nodes · {ariaData.skillTree.edges.length} edges
                </span>
              </div>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "graph" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("graph")}
                >
                  <Network className="w-4 h-4 mr-1" />
                  Graph
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutGrid className="w-4 h-4 mr-1" />
                  List
                </Button>
              </div>
            </div>

            {/* Graph View */}
            {viewMode === "graph" && <SkillTreeGraph data={ariaData} />}

            {/* List View */}
            {viewMode === "list" && (
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex flex-wrap gap-2">
                    {["skill", "course", "concept", "event", "role"].map((t) => (
                      <Button
                        key={t}
                        variant={filterType === t ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType(filterType === t ? null : t)}
                      >
                        <TypeIcon type={t} />
                        <span className="ml-1 capitalize">{t}</span>
                      </Button>
                    ))}
                    {(filterState || filterType) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterState(null);
                          setFilterType(null);
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayedNodes.map((node) => (
                      <SkillTreeNode key={node.id} node={node} />
                    ))}
                  </div>
                  {filteredNodes.length > 24 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAllNodes(!showAllNodes)}
                    >
                      {showAllNodes ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Show fewer ({filteredNodes.length} total)
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show all {filteredNodes.length} nodes
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Blindspots */}
            {ariaData.blindspots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-amber-600" />
                    You Don't Know What You Don't Know
                  </CardTitle>
                  <CardDescription>
                    Important gaps in your knowledge graph — high-impact skills, courses, and events
                    you may be overlooking.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ariaData.blindspots.map((bs) => (
                    <BlindspotCard key={bs.id} blindspot={bs} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Next Skills */}
              {ariaData.recommendations.nextSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      Next Skills to Learn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ariaData.recommendations.nextSkills.map((item) => (
                      <RecommendationCard key={item.id} item={item} icon={Zap} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Next Courses */}
              {ariaData.recommendations.nextCourses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Next Courses to Take
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ariaData.recommendations.nextCourses.map((item) => (
                      <RecommendationCard key={item.id} item={item} icon={BookOpen} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Events */}
              {ariaData.recommendations.events.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      Relevant Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ariaData.recommendations.events.map((item) => (
                      <RecommendationCard key={item.id} item={item} icon={Calendar} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Projects */}
              {ariaData.recommendations.projects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Rocket className="w-5 h-5 text-purple-600" />
                      Suggested Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ariaData.recommendations.projects.map((p) => (
                      <ProjectCard key={p.title} project={p} />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Raw JSON (collapsible) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-slate-500">Raw ARIA Output (JSON)</CardTitle>
              </CardHeader>
              <CardContent>
                <details>
                  <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
                    Expand to see full JSON response
                  </summary>
                  <pre className="mt-2 text-xs bg-slate-50 p-4 rounded-lg overflow-auto max-h-96 border border-slate-200">
                    {JSON.stringify(ariaData, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </>
        )}

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/learning-assistant">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Learning Assistant
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
