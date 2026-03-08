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
  askBackendAssistant,
  type AriaGraphResponse,
  type AriaNode,
  type AriaProfile,
  type AriaBlindspot,
  type AriaRecommendationItem,
  type AriaProject,
} from "../services/backend-api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StudentCache = {
  nextSteps?: Array<{ title?: string; description?: string }>;
  focusAreas?: string[];
};

type ProfessionalCache = {
  roadmapSteps?: Array<{ title?: string; description?: string }>;
  competencies?: Array<{ skill?: string }>;
};

type QuizTrack = "student" | "professional";

type QuizQuestion = {
  id: string;
  track: QuizTrack;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  levelLabel: string;
};

type AnswerRecord = {
  questionId: string;
  topic: string;
  selectedIndex: number;
  isCorrect: boolean;
  prompt: string;
  options: string[];
};

type AssistantQuestionPayload = {
  prompt?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function readJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function uniqueOrdered(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (!seen.has(key)) { seen.add(key); result.push(normalized); }
  }
  return result;
}

function parseJsonObject(text: string): AssistantQuestionPayload | null {
  try { return JSON.parse(text) as AssistantQuestionPayload; } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]) as AssistantQuestionPayload; } catch { return null; }
  }
}

function getLevelLabel(focusHistory: AnswerRecord[]): string {
  const last = focusHistory[focusHistory.length - 1];
  if (last && !last.isCorrect) return "Reinforcement";
  const correctCount = focusHistory.filter((item) => item.isCorrect).length;
  if (correctCount === 0) return "Foundation";
  if (correctCount === 1) return "Application";
  if (correctCount === 2) return "Synthesis";
  return "Mastery";
}

function fallbackQuestion(
  track: QuizTrack, topic: string, levelLabel: string, questionIndex: number, needsReview: boolean,
): QuizQuestion {
  const focus = topic || "Selected Topic";

  const foundationBank = [
    { prompt: `Which statement best describes a core concept of ${focus}?`, options: [`${focus} primarily concerns random memorization without context.`, `${focus} focuses on foundational principles and how they connect in practice.`, `${focus} is only useful for advanced edge cases and not fundamentals.`], correctIndex: 1, explanation: `${focus} starts with core principles and practical connections, not isolated memorization.` },
    { prompt: `What is the strongest first-principles approach to ${focus}?`, options: [`Identify the base model of ${focus}, then test it with a simple scenario.`, `Skip models and rely only on final answers for ${focus}.`, `Treat ${focus} as a fixed checklist with no reasoning.`], correctIndex: 0, explanation: `Understanding and testing the underlying model gives durable ${focus} knowledge.` },
  ];
  const applicationBank = [
    { prompt: `In a practical task, what is the best way to apply ${focus}?`, options: [`Select an approach, justify why it fits, then validate with output checks.`, `Use the same method every time regardless of context.`, `Prioritize speed over correctness when applying ${focus}.`], correctIndex: 0, explanation: `${focus} application requires context-aware method choice and validation.` },
    { prompt: `You must solve a real problem with ${focus}. What should you do first?`, options: [`Define constraints and success criteria before choosing a technique.`, `Jump to implementation and infer constraints later.`, `Avoid measurement and rely on intuition only.`], correctIndex: 0, explanation: `Clear constraints improve accuracy and decision quality in ${focus}.` },
  ];
  const synthesisBank = [
    { prompt: `Which choice shows deeper synthesis in ${focus}?`, options: [`Compare two valid approaches in ${focus} and explain tradeoffs.`, `Use one preferred approach and ignore alternatives.`, `Pick the fastest approach without evaluating quality.`], correctIndex: 0, explanation: `Synthesis in ${focus} means reasoning across alternatives and tradeoffs.` },
    { prompt: `How do you demonstrate strategic thinking in ${focus}?`, options: [`Connect design decisions in ${focus} to downstream impact and risk.`, `Treat each decision in ${focus} as independent and isolated.`, `Optimize one metric in ${focus} while ignoring all side effects.`], correctIndex: 0, explanation: `High-level ${focus} proficiency includes system-level consequence analysis.` },
  ];
  const masteryBank = [
    { prompt: `What best indicates mastery of ${focus}?`, options: [`You can explain, adapt, and troubleshoot ${focus} under changing constraints.`, `You can solve only familiar versions of ${focus} problems.`, `You remember terminology for ${focus} but cannot apply it.`], correctIndex: 0, explanation: `Mastery is adaptive performance, not only recognition or recall.` },
    { prompt: `A mastery-level checkpoint for ${focus} is:`, options: [`Design a robust solution in ${focus} and defend decisions with evidence.`, `Avoid explaining why your ${focus} solution works.`, `Depend on one memorized pattern for all ${focus} tasks.`], correctIndex: 0, explanation: `Evidence-backed decisions and adaptability mark true ${focus} mastery.` },
  ];
  const reinforcementBank = [
    { prompt: `You missed the previous ${focus} question. Which follow-up is best?`, options: [`Retry a similar ${focus} concept with a new scenario and verify each step.`, `Switch to a different topic and skip ${focus} remediation.`, `Repeat the same mistake pattern in ${focus} without checking assumptions.`], correctIndex: 0, explanation: `A similar but re-framed ${focus} scenario helps repair misconceptions.` },
    { prompt: `For ${focus} reinforcement, what should you prioritize now?`, options: [`Rebuild the concept with a different example and compare with your last answer.`, `Memorize the previous answer choice without reasoning.`, `Increase difficulty before fixing the core ${focus} mistake.`], correctIndex: 0, explanation: `Reinforcement works best when the same concept is tested through a new lens.` },
  ];

  const bank = needsReview ? reinforcementBank : levelLabel === "Application" ? applicationBank : levelLabel === "Synthesis" ? synthesisBank : levelLabel === "Mastery" ? masteryBank : foundationBank;
  const picked = bank[questionIndex % bank.length];
  return { id: `${track}-${focus}-${questionIndex}-fallback`, track, topic: focus, prompt: picked.prompt, options: picked.options, correctIndex: picked.correctIndex, explanation: picked.explanation, levelLabel };
}

async function generateTopicQuestion(
  track: QuizTrack, topic: string, questionIndex: number, focusHistory: AnswerRecord[],
): Promise<QuizQuestion> {
  const safeTopic = topic || "Selected Topic";
  const lastAnswer = focusHistory[focusHistory.length - 1];
  const needsReview = Boolean(lastAnswer && !lastAnswer.isCorrect);
  const levelLabel = getLevelLabel(focusHistory);

  const historySummary = focusHistory.slice(-3).map((item, idx) => {
    const outcome = item.isCorrect ? "correct" : "incorrect";
    return `Q${idx + 1}: ${item.prompt} | selected="${item.options[item.selectedIndex] || ""}" | ${outcome}`;
  }).join("\n");

  const previousQuestionContext = lastAnswer
    ? `Previous question prompt: ${lastAnswer.prompt}\nPrevious options: ${lastAnswer.options.join(" | ")}`
    : "No previous question for this focus yet.";

  const remediationRule = needsReview
    ? "The learner got the previous question wrong. Generate a similar concept question about the SAME topic, but with different wording and different options from the previous question."
    : "Generate the next progressive question for this topic knowledge level.";

  const prompt = [
    "Return ONLY a valid JSON object with keys: prompt, options, correctIndex, explanation.",
    "This must be a knowledge question ABOUT THE TOPIC ITSELF, not about study habits or learning strategy.",
    `Track: ${track}.`, `Topic: ${safeTopic}.`, `Target difficulty level: ${levelLabel}.`,
    remediationRule, previousQuestionContext,
    `Recent answer history:\n${historySummary || "None"}`,
    "Rules:", "- options must have at least 2 items (prefer 3 or 4).",
    "- exactly one correct answer.", "- correctIndex must be a valid zero-based index.",
    "- explanation must be concise and topic-specific.",
  ].join("\n\n");

  try {
    const response = await askBackendAssistant(prompt);
    const parsed = parseJsonObject(response);
    if (!parsed?.prompt || !Array.isArray(parsed.options) || parsed.options.length < 2) {
      return fallbackQuestion(track, safeTopic, levelLabel, questionIndex, needsReview);
    }
    const options = parsed.options.map((opt) => String(opt).trim()).filter(Boolean);
    if (options.length < 2) return fallbackQuestion(track, safeTopic, levelLabel, questionIndex, needsReview);
    let correctIndex = Number(parsed.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
    return {
      id: `${track}-${safeTopic}-${questionIndex}-${Date.now()}`, track, topic: safeTopic,
      prompt: String(parsed.prompt).trim(), options, correctIndex,
      explanation: String(parsed.explanation || "Review this concept and compare your choice with the correct option.").trim(),
      levelLabel,
    };
  } catch {
    return fallbackQuestion(track, safeTopic, levelLabel, questionIndex, needsReview);
  }
}

/* ------------------------------------------------------------------ */
/*  ARIA UI sub-components                                             */
/* ------------------------------------------------------------------ */

const STATE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  unlocked: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  available_next: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  locked: { bg: "bg-slate-50", text: "text-slate-400", border: "border-slate-200" },
};

const STATE_ICONS: Record<string, typeof CheckCircle2> = { unlocked: CheckCircle2, in_progress: Loader2, available_next: Unlock, locked: Lock };
const TYPE_ICONS: Record<string, typeof BookOpen> = { skill: Zap, course: BookOpen, concept: Brain, event: Calendar, role: Target, program: GraduationCap };

function StateIcon({ state }: { state: string }) { const Icon = STATE_ICONS[state] || Lock; const c = STATE_COLORS[state] || STATE_COLORS.locked; return <Icon className={`w-4 h-4 ${c.text}`} />; }
function TypeIcon({ type }: { type: string }) { const Icon = TYPE_ICONS[type] || Brain; return <Icon className="w-4 h-4" />; }

function SkillTreeNode({ node }: { node: AriaNode }) {
  const c = STATE_COLORS[node.state] || STATE_COLORS.locked;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-3 rounded-lg border ${c.border} ${c.bg} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-1">
        <StateIcon state={node.state} /><TypeIcon type={node.type} />
        <span className={`text-sm font-medium ${c.text}`}>{node.label}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        <Badge variant="outline" className="text-xs">{node.type}</Badge>
        <Badge variant="outline" className={`text-xs ${node.relevance === "high" ? "border-purple-300 text-purple-600" : node.relevance === "medium" ? "border-blue-300 text-blue-600" : "border-slate-200 text-slate-400"}`}>{node.relevance}</Badge>
        {node.unlocksCount > 0 && <Badge variant="secondary" className="text-xs">unlocks {node.unlocksCount}</Badge>}
      </div>
    </motion.div>
  );
}

function BlindspotCard({ blindspot }: { blindspot: AriaBlindspot }) {
  const impactPct = Math.round(blindspot.impact_score * 100);
  const urgencyPct = Math.round(blindspot.urgency_score * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0"><Eye className="w-5 h-5 text-amber-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-slate-900 text-sm">{blindspot.id}</span>
            <Badge variant="outline" className="text-xs">{blindspot.type}</Badge>
          </div>
          <p className="text-sm text-slate-600 mb-2">{blindspot.reason}</p>
          <div className="flex gap-3 mb-2">
            <div className="flex items-center gap-1"><span className="text-xs text-slate-500">Impact:</span><div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${impactPct}%` }} /></div><span className="text-xs font-medium text-slate-600">{impactPct}%</span></div>
            <div className="flex items-center gap-1"><span className="text-xs text-slate-500">Urgency:</span><div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${urgencyPct}%` }} /></div><span className="text-xs font-medium text-slate-600">{urgencyPct}%</span></div>
          </div>
          <div className="flex items-start gap-1 text-xs text-emerald-700 bg-emerald-50 p-2 rounded"><Rocket className="w-3 h-3 mt-0.5 flex-shrink-0" /><span>{blindspot.next_step}</span></div>
        </div>
      </div>
    </motion.div>
  );
}

function RecommendationCard({ item, icon: Icon }: { item: AriaRecommendationItem; icon: typeof Zap }) {
  return (<motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 transition-colors"><div className="flex items-start gap-2"><Icon className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" /><div><span className="text-sm font-medium text-slate-900">{item.label}</span><p className="text-xs text-slate-500 mt-0.5">{item.reason}</p></div></div></motion.div>);
}

function ProjectCard({ project }: { project: AriaProject }) {
  return (<motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-lg border border-slate-200 bg-white"><div className="flex items-start gap-2"><Rocket className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" /><div><span className="text-sm font-medium text-slate-900">{project.title}</span><p className="text-xs text-slate-500 mt-0.5">{project.reason}</p><div className="flex flex-wrap gap-1 mt-1">{project.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div></div></div></motion.div>);
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SkillLearnerPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const hasStudentTrack = Boolean(sessionStorage.getItem("student-recommendations-cache"));
  const hasProfessionalTrack = Boolean(sessionStorage.getItem("professional-recommendations-cache"));

  const requestedTrack = searchParams.get("track");
  const initialTrack: QuizTrack = requestedTrack === "professional" ? "professional" : "student";

  const [activeTrack, setActiveTrack] = useState<QuizTrack>(initialTrack);

  // ARIA graph state
  const [ariaData, setAriaData] = useState<AriaGraphResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllNodes, setShowAllNodes] = useState(false);
  const [filterState, setFilterState] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");

  // Quiz state (from safe-nocursor)
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [focusSelectorOpen, setFocusSelectorOpen] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  const quizTopics = useMemo(() => {
    const sc = readJson<StudentCache>("student-recommendations-cache");
    const pc = readJson<ProfessionalCache>("professional-recommendations-cache");
    if (activeTrack === "student" && sc) { return uniqueOrdered([...(sc.nextSteps ?? []).map((i) => i.title || ""), ...(sc.focusAreas ?? [])]); }
    if (activeTrack === "professional" && pc) { return uniqueOrdered([...(pc.roadmapSteps ?? []).map((i) => i.title || ""), ...(pc.competencies ?? []).map((i) => i.skill || "")]); }
    return [];
  }, [activeTrack]);

  // Track switching
  useEffect(() => {
    if (hasStudentTrack && !hasProfessionalTrack) { setActiveTrack("student"); setSearchParams({ track: "student" }); }
    else if (!hasStudentTrack && hasProfessionalTrack) { setActiveTrack("professional"); setSearchParams({ track: "professional" }); }
  }, [hasStudentTrack, hasProfessionalTrack, setSearchParams]);

  // Reset quiz on track change
  useEffect(() => { setSelectedFocus(null); setFocusSelectorOpen(true); setQuestionIndex(0); setAnswers([]); setSelectedIndex(null); setShowResult(false); }, [activeTrack]);

  // Validate focus
  useEffect(() => {
    if (quizTopics.length === 0) { setSelectedFocus(null); setCurrentQuestion(null); return; }
    if (selectedFocus && !quizTopics.includes(selectedFocus)) { setSelectedFocus(null); setFocusSelectorOpen(true); }
  }, [quizTopics, selectedFocus]);

  // Generate question (async, from safe-nocursor)
  useEffect(() => {
    if (!selectedFocus) { setCurrentQuestion(null); return; }
    let active = true;
    const focusHistory = answers.filter((a) => a.topic === selectedFocus);
    const buildQuestion = async () => {
      setIsGeneratingQuestion(true);
      const generated = await generateTopicQuestion(activeTrack, selectedFocus, questionIndex, focusHistory);
      if (!active) return;
      setCurrentQuestion(generated); setSelectedIndex(null); setShowResult(false); setIsGeneratingQuestion(false);
    };
    void buildQuestion();
    return () => { active = false; };
  }, [activeTrack, selectedFocus, questionIndex, answers]);

  // ARIA graph fetch
  useEffect(() => {
    if (!hasStudentTrack && !hasProfessionalTrack) return;
    let cancelled = false;
    setLoading(true); setError(null);
    const sc = readJson<StudentCache>("student-recommendations-cache");
    const pc = readJson<ProfessionalCache>("professional-recommendations-cache");
    const dashboardCourses = JSON.parse(localStorage.getItem("dashboard-manual-courses") || "[]") as Array<{ code?: string }>;
    const coursesList = dashboardCourses.map((c) => c.code || "").filter(Boolean);
    const inputRaw = sessionStorage.getItem("learningAssistantInput");
    let topic = "", background = "";
    if (inputRaw) { try { const p = JSON.parse(inputRaw); topic = p.topic || ""; background = p.background || ""; } catch { /* ignore */ } }
    const inferredSkills: string[] = [];
    if (activeTrack === "student" && sc) { (sc.focusAreas || []).forEach((a) => inferredSkills.push(a)); (sc.nextSteps || []).forEach((s) => { if (s.title) inferredSkills.push(s.title); }); }
    else if (activeTrack === "professional" && pc) { (pc.competencies || []).forEach((c) => { if (c.skill) inferredSkills.push(c.skill); }); (pc.roadmapSteps || []).forEach((r) => { if (r.title) inferredSkills.push(r.title); }); }
    const interests = topic ? [topic] : [];
    if (background) background.split(/[,.\n]/).map((s) => s.trim()).filter((s) => s.length > 2 && s.length < 40).slice(0, 3).forEach((s) => interests.push(s));
    const profile: AriaProfile = {
      completed_courses: coursesList.length > 0 ? coursesList : ["CS 1336", "CS 1337", "CS 2305", "CS 2336"],
      current_courses: ["CS 3345"], major: "Computer Science",
      target_roles: activeTrack === "professional" ? ["Software Engineer", "Full-Stack Developer"] : ["Software Engineer"],
      interests, inferred_skills_override: inferredSkills,
    };
    fetchAriaGraph(profile).then((data) => { if (!cancelled) setAriaData(data); }).catch((err) => { if (!cancelled) setError(err?.message || "Failed to load ARIA graph"); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeTrack]);

  const switchTrack = (next: QuizTrack) => { setActiveTrack(next); setSearchParams({ track: next }); setAriaData(null); };
  const chooseFocus = (focus: string) => { setSelectedFocus(focus); setFocusSelectorOpen(false); setQuestionIndex(0); setSelectedIndex(null); setShowResult(false); };
  const submitAnswer = () => {
    if (!currentQuestion || selectedIndex === null) return;
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, topic: currentQuestion.topic, selectedIndex, isCorrect: selectedIndex === currentQuestion.correctIndex, prompt: currentQuestion.prompt, options: currentQuestion.options }]);
    setShowResult(true);
  };
  const nextQuestion = () => setQuestionIndex((prev) => prev + 1);

  const answersForTrack = answers.filter((a) => quizTopics.includes(a.topic));
  const answersForFocus = selectedFocus ? answers.filter((a) => a.topic === selectedFocus) : [];
  const correctForTrack = answersForTrack.filter((a) => a.isCorrect).length;
  const correctForFocus = answersForFocus.filter((a) => a.isCorrect).length;

  const filteredNodes = useMemo(() => {
    if (!ariaData) return [];
    let nodes = ariaData.skillTree.nodes;
    if (filterState) nodes = nodes.filter((n) => n.state === filterState);
    if (filterType) nodes = nodes.filter((n) => n.type === filterType);
    nodes.sort((a, b) => {
      const so: Record<string, number> = { unlocked: 0, in_progress: 1, available_next: 2, locked: 3 };
      const ro: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const sd = (so[a.state] ?? 3) - (so[b.state] ?? 3); if (sd !== 0) return sd;
      const rd = (ro[a.relevance] ?? 2) - (ro[b.relevance] ?? 2); if (rd !== 0) return rd;
      return b.unlocksCount - a.unlocksCount;
    });
    return nodes;
  }, [ariaData, filterState, filterType]);
  const displayedNodes = showAllNodes ? filteredNodes : filteredNodes.slice(0, 24);

  const stateCounts = useMemo(() => {
    if (!ariaData) return { unlocked: 0, in_progress: 0, available_next: 0, locked: 0 };
    const c: Record<string, number> = { unlocked: 0, in_progress: 0, available_next: 0, locked: 0 };
    ariaData.skillTree.nodes.forEach((n) => { c[n.state] = (c[n.state] || 0) + 1; });
    return c;
  }, [ariaData]);

  /* ---- No tracks: landing ---- */
  if (!hasStudentTrack && !hasProfessionalTrack) {
    return (<div className="min-h-screen p-8 flex items-center justify-center"><Card className="max-w-lg w-full"><CardHeader><CardTitle>ARIA Skill Learner Not Available Yet</CardTitle><CardDescription>Generate at least one recommendation track through the Learning Assistant, then return here for your personalized skill tree and quiz.</CardDescription></CardHeader><CardContent><Link to="/learning-assistant"><Button className="w-full"><ArrowLeft className="mr-2 h-4 w-4" />Go to Learning Assistant</Button></Link></CardContent></Card></div>);
  }

  /* ---- Main render ---- */
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg"><Network className="w-8 h-8 text-indigo-600" /></div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">ARIA Skill Learner</h1>
              <p className="text-lg text-slate-600">Your personalized Academic Knowledge Graph — see what you know, what you're missing, and what to learn next.</p>
            </div>
          </div>
        </motion.div>

        {/* Track Selector + Stats */}
        <Card>
          <CardHeader><CardTitle>Track & Overview</CardTitle><CardDescription>Select your track to view the corresponding skill graph analysis.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {hasStudentTrack && <Button type="button" variant={activeTrack === "student" ? "default" : "outline"} onClick={() => switchTrack("student")}><GraduationCap className="w-4 h-4 mr-2" />Student</Button>}
              {hasProfessionalTrack && <Button type="button" variant={activeTrack === "professional" ? "default" : "outline"} onClick={() => switchTrack("professional")}><Briefcase className="w-4 h-4 mr-2" />Professional</Button>}
            </div>
            {ariaData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["unlocked", "in_progress", "available_next", "locked"] as const).map((state) => {
                  const icons = { unlocked: CheckCircle2, in_progress: Loader2, available_next: Unlock, locked: Lock };
                  const colors = { unlocked: "text-emerald-600", in_progress: "text-amber-600", available_next: "text-blue-600", locked: "text-slate-400" };
                  const borders = { unlocked: "border-emerald-400 bg-emerald-50", in_progress: "border-amber-400 bg-amber-50", available_next: "border-blue-400 bg-blue-50", locked: "border-slate-400 bg-slate-50" };
                  const labels = { unlocked: "Unlocked", in_progress: "In Progress", available_next: "Available Next", locked: "Locked" };
                  const Icon = icons[state];
                  return (
                    <div key={state} className={`p-3 rounded-lg border cursor-pointer transition-colors ${filterState === state ? borders[state] : "border-slate-200"}`} onClick={() => setFilterState(filterState === state ? null : state)}>
                      <div className="flex items-center gap-2"><Icon className={`w-4 h-4 ${colors[state]}`} /><span className={`text-2xl font-bold ${colors[state]}`}>{stateCounts[state]}</span></div>
                      <p className="text-xs text-slate-500 mt-1">{labels[state]}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {loading && (<div className="flex items-center justify-center py-12"><div className="flex flex-col items-center gap-3"><svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg><p className="text-slate-600 font-medium">Building your ARIA knowledge graph...</p></div></div>)}
        {error && (<Card className="border-red-200 bg-red-50"><CardContent className="p-4"><div className="flex items-center gap-2 text-red-700"><AlertTriangle className="w-5 h-5" /><span className="font-medium">Error loading graph: {error}</span></div></CardContent></Card>)}

        {ariaData && !loading && (
          <>
            {/* Skill Tree — view toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Network className="w-5 h-5 text-indigo-600" /><h2 className="text-xl font-semibold text-slate-900">Skill Tree</h2><span className="text-sm text-slate-500">{ariaData.skillTree.nodes.length} nodes · {ariaData.skillTree.edges.length} edges</span></div>
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                <Button variant={viewMode === "graph" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("graph")}><Network className="w-4 h-4 mr-1" />Graph</Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}><LayoutGrid className="w-4 h-4 mr-1" />List</Button>
              </div>
            </div>

            {viewMode === "graph" && <SkillTreeGraph data={ariaData} />}
            {viewMode === "list" && (
              <Card><CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap gap-2">
                  {["skill", "course", "concept", "event", "role"].map((t) => (<Button key={t} variant={filterType === t ? "default" : "outline"} size="sm" onClick={() => setFilterType(filterType === t ? null : t)}><TypeIcon type={t} /><span className="ml-1 capitalize">{t}</span></Button>))}
                  {(filterState || filterType) && <Button variant="ghost" size="sm" onClick={() => { setFilterState(null); setFilterType(null); }}>Clear filters</Button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{displayedNodes.map((node) => <SkillTreeNode key={node.id} node={node} />)}</div>
                {filteredNodes.length > 24 && <Button variant="outline" className="w-full" onClick={() => setShowAllNodes(!showAllNodes)}>{showAllNodes ? <><ChevronUp className="w-4 h-4 mr-1" />Show fewer ({filteredNodes.length} total)</> : <><ChevronDown className="w-4 h-4 mr-1" />Show all {filteredNodes.length} nodes</>}</Button>}
              </CardContent></Card>
            )}

            {/* Blindspots */}
            {ariaData.blindspots.length > 0 && (
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-amber-600" />You Don't Know What You Don't Know</CardTitle><CardDescription>Important gaps in your knowledge graph — high-impact skills, courses, and events you may be overlooking.</CardDescription></CardHeader>
                <CardContent className="space-y-3">{ariaData.blindspots.map((bs) => <BlindspotCard key={bs.id} blindspot={bs} />)}</CardContent></Card>
            )}

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ariaData.recommendations.nextSkills.length > 0 && (<Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="w-5 h-5 text-indigo-600" />Next Skills to Learn</CardTitle></CardHeader><CardContent className="space-y-2">{ariaData.recommendations.nextSkills.map((i) => <RecommendationCard key={i.id} item={i} icon={Zap} />)}</CardContent></Card>)}
              {ariaData.recommendations.nextCourses.length > 0 && (<Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="w-5 h-5 text-indigo-600" />Next Courses to Take</CardTitle></CardHeader><CardContent className="space-y-2">{ariaData.recommendations.nextCourses.map((i) => <RecommendationCard key={i.id} item={i} icon={BookOpen} />)}</CardContent></Card>)}
              {ariaData.recommendations.events.length > 0 && (<Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Calendar className="w-5 h-5 text-indigo-600" />Relevant Events</CardTitle></CardHeader><CardContent className="space-y-2">{ariaData.recommendations.events.map((i) => <RecommendationCard key={i.id} item={i} icon={Calendar} />)}</CardContent></Card>)}
              {ariaData.recommendations.projects.length > 0 && (<Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Rocket className="w-5 h-5 text-purple-600" />Suggested Projects</CardTitle></CardHeader><CardContent className="space-y-2">{ariaData.recommendations.projects.map((p) => <ProjectCard key={p.title} project={p} />)}</CardContent></Card>)}
            </div>

            {/* Raw JSON */}
            <Card><CardHeader><CardTitle className="text-sm text-slate-500">Raw ARIA Output (JSON)</CardTitle></CardHeader><CardContent><details><summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">Expand to see full JSON response</summary><pre className="mt-2 text-xs bg-slate-50 p-4 rounded-lg overflow-auto max-h-96 border border-slate-200">{JSON.stringify(ariaData, null, 2)}</pre></details></CardContent></Card>
          </>
        )}

        {/* ---- Skill Quiz (from safe-nocursor) ---- */}
        {quizTopics.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600" />Skill Quiz</CardTitle>
                <CardDescription>Pick a focus topic, then answer adaptive MCQs that test topic knowledge and build on previous answers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Answered: {answersForTrack.length}</Badge>
                  <Badge variant="secondary">Correct: {correctForTrack}</Badge>
                </div>
                {selectedFocus && !focusSelectorOpen && (<Button type="button" variant="outline" onClick={() => setFocusSelectorOpen(true)}>Focus: {selectedFocus} (Change)</Button>)}
                {focusSelectorOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizTopics.map((topic, index) => (<Button key={`${topic}-${index}`} type="button" variant={selectedFocus === topic ? "default" : "outline"} onClick={() => chooseFocus(topic)} className="justify-start">{index + 1}. {topic}</Button>))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedFocus && isGeneratingQuestion && (<Card><CardContent className="py-8"><p className="text-sm text-slate-600">Generating a topic-specific question...</p></CardContent></Card>)}

            {selectedFocus && currentQuestion && !isGeneratingQuestion && (
              <Card>
                <CardHeader><CardTitle>{currentQuestion.topic}</CardTitle><CardDescription>{currentQuestion.prompt}</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2"><Badge>{currentQuestion.levelLabel}</Badge><Badge variant="secondary">Focus answered: {answersForFocus.length}</Badge><Badge variant="secondary">Focus correct: {correctForFocus}</Badge></div>
                  {currentQuestion.options.map((option, index) => (<button key={`${currentQuestion.id}-${index}`} type="button" onClick={() => setSelectedIndex(index)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedIndex === index ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}>{option}</button>))}
                  {!showResult ? (
                    <Button type="button" onClick={submitAnswer} disabled={selectedIndex === null}>Submit Answer</Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        {selectedIndex === currentQuestion.correctIndex ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" /> : <XCircle className="w-5 h-5 text-rose-600 mt-0.5" />}
                        <div><p className="font-medium text-slate-900">{selectedIndex === currentQuestion.correctIndex ? "Correct" : "Not quite"}</p><p className="text-sm text-slate-600">{currentQuestion.explanation}</p></div>
                      </div>
                      <Button type="button" onClick={nextQuestion}>Next Question</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!selectedFocus && (<Card><CardHeader><CardTitle>Start Quiz</CardTitle><CardDescription>Select a focus above to begin adaptive, topic-specific MCQs.</CardDescription></CardHeader></Card>)}
          </>
        )}

        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Link to="/learning-assistant"><Button variant="outline" className="w-full"><ArrowLeft className="mr-2 w-4 h-4" />Back to Learning Assistant</Button></Link>
        </motion.div>
      </div>
    </div>
  );
}
