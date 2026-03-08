import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { 
  Briefcase, 
  TrendingUp, 
  Rocket, 
  Target, 
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  Award
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { askBackendAssistant, fetchProfessors } from "../services/backend-api";

interface LearningAssistantInput {
  userType: "student" | "professional";
  name: string;
  topic: string;
  currentLevel: string;
  background: string;
}

type ProfessionalRecommendationCache = {
  fingerprint: string;
  assistantAnswer: string;
  professorNames: string[];
  roadmapSteps: RoadmapStep[];
  competencies: Competency[];
  scenarios: Scenario[];
  resources: ProfessionalResource[];
  roadmapRaw: string | null;
  competencyRaw: string | null;
  scenarioRaw: string | null;
  resourcesRaw: string | null;
};

type RoadmapStep = {
  phase: string;
  title: string;
  description: string;
  timeline: string;
  impact: string;
};

type Competency = {
  skill: string;
  level: number;
};

type Scenario = {
  scenario: string;
  description: string;
  impact: string;
};

type ProfessionalResource = {
  title: string;
  type: string;
  description: string;
};

const PROFESSIONAL_CACHE_KEY = "professional-recommendations-cache";

function getFingerprint(input: LearningAssistantInput): string {
  return JSON.stringify({
    userType: input.userType,
    name: input.name,
    topic: input.topic,
    currentLevel: input.currentLevel,
    background: input.background,
  });
}

function parseJsonArray<T>(text: string): T[] | null {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      return null;
    }
    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

export default function ProfessionalRecommendationsPage() {
  const [inputData, setInputData] = useState<LearningAssistantInput | null>(null);
  const [hasError, setHasError] = useState(false);
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [professorNames, setProfessorNames] = useState<string[]>([]);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [resources, setResources] = useState<ProfessionalResource[]>([]);
  const [loading, setLoading] = useState(true); // <-- loading state
  const [roadmapRaw, setRoadmapRaw] = useState<string | null>(null);
  const [competencyRaw, setCompetencyRaw] = useState<string | null>(null);
  const [scenarioRaw, setScenarioRaw] = useState<string | null>(null);
  const [resourcesRaw, setResourcesRaw] = useState<string | null>(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem("learningAssistantInput");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.userType === "professional") {
          setInputData(data);
        } else {
          setHasError(true);
        }
      } catch {
        setHasError(true);
      }
    } else {
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    if (!inputData || inputData.userType !== "professional") {
      setLoading(false);
      return;
    }

    let active = true;
    const fingerprint = getFingerprint(inputData);

    try {
      const cachedRaw = sessionStorage.getItem(PROFESSIONAL_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as ProfessionalRecommendationCache;
        if (cached.fingerprint === fingerprint) {
          setAssistantAnswer(cached.assistantAnswer || "");
          setProfessorNames(Array.isArray(cached.professorNames) ? cached.professorNames : []);
          setRoadmapSteps(Array.isArray(cached.roadmapSteps) ? cached.roadmapSteps : []);
          setCompetencies(Array.isArray(cached.competencies) ? cached.competencies : []);
          setScenarios(Array.isArray(cached.scenarios) ? cached.scenarios : []);
          setResources(Array.isArray(cached.resources) ? cached.resources : []);
          setRoadmapRaw(cached.roadmapRaw ?? null);
          setCompetencyRaw(cached.competencyRaw ?? null);
          setScenarioRaw(cached.scenarioRaw ?? null);
          setResourcesRaw(cached.resourcesRaw ?? null);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache parse issues and regenerate.
    }

    const loadLiveRecommendations = async () => {
      setLoading(true);

      let latestAssistantAnswer = "";
      let latestProfessorNames: string[] = [];
      let latestRoadmapSteps: RoadmapStep[] = [];
      let latestCompetencies: Competency[] = [];
      let latestScenarios: Scenario[] = [];
      let latestResources: ProfessionalResource[] = [];
      let latestRoadmapRaw: string | null = null;
      let latestCompetencyRaw: string | null = null;
      let latestScenarioRaw: string | null = null;
      let latestResourcesRaw: string | null = null;

      try {
        // Use more specific, role-focused prompts for each section
        const answer = await askBackendAssistant(
          `You are a career coach AI. Give a concise, actionable professional development overview for a web developer with background: ${inputData.background}, current level: ${inputData.currentLevel}. Focus on top strategies for career advancement in ${inputData.topic}.`
        );
        if (active && answer) {
          setAssistantAnswer(answer);
          latestAssistantAnswer = answer;
        }

        const roadmapRawResponse = await askBackendAssistant(
          `You are a senior tech mentor. Return only a JSON array of 4 objects with keys {"title","description","timeline","impact"}. Each object is a top roadmap step for career advancement in ${inputData.topic} for a professional. Be specific and practical. Respond ONLY with a valid JSON array.`
        );
        setRoadmapRaw(roadmapRawResponse);
        latestRoadmapRaw = roadmapRawResponse;
        const parsedRoadmap = parseJsonArray<{
          title?: string;
          description?: string;
          timeline?: string;
          impact?: string;
        }>(roadmapRawResponse);
        if (active && parsedRoadmap && parsedRoadmap.length > 0) {
          const mappedRoadmap = parsedRoadmap.slice(0, 4).map((step, index) => ({
            phase: `Phase ${index + 1}`,
            title: step.title || `Milestone ${index + 1}`,
            description: step.description || "Advance through this stage with measurable outcomes.",
            timeline: step.timeline || "2-4 months",
            impact: step.impact || "High",
          }));
          setRoadmapSteps(mappedRoadmap);
          latestRoadmapSteps = mappedRoadmap;
        }

        const competencyRawResponse = await askBackendAssistant(
          `You are a tech hiring manager. Return only a JSON array of 6 objects {"skill","level"} (level 50-100) for the most in-demand professional competencies in ${inputData.topic}. Use real-world, up-to-date skills. Respond ONLY with a valid JSON array.`
        );
        setCompetencyRaw(competencyRawResponse);
        latestCompetencyRaw = competencyRawResponse;
        const parsedCompetencies = parseJsonArray<{ skill?: string; level?: number }>(competencyRawResponse);
        if (active && parsedCompetencies && parsedCompetencies.length > 0) {
          const mappedCompetencies = parsedCompetencies.slice(0, 6).map((entry, index) => ({
            skill: entry.skill || `Core Skill ${index + 1}`,
            level: Math.max(50, Math.min(100, Number(entry.level) || 75)),
          }));
          setCompetencies(mappedCompetencies);
          latestCompetencies = mappedCompetencies;
        }

        const scenarioRawResponse = await askBackendAssistant(
          `You are a senior engineering manager. Return only a JSON array of 4 objects {"scenario","description","impact"} for the most relevant workplace application scenarios in ${inputData.topic}. Use real, modern examples. Respond ONLY with a valid JSON array.`
        );
        setScenarioRaw(scenarioRawResponse);
        latestScenarioRaw = scenarioRawResponse;
        const parsedScenarios = parseJsonArray<{ scenario?: string; description?: string; impact?: string }>(scenarioRawResponse);
        if (active && parsedScenarios && parsedScenarios.length > 0) {
          const mappedScenarios = parsedScenarios.slice(0, 4).map((scenario, index) => ({
            scenario: scenario.scenario || `Use Case ${index + 1}`,
            description: scenario.description || "Apply this capability to a practical initiative.",
            impact: scenario.impact || "Business impact",
          }));
          setScenarios(mappedScenarios);
          latestScenarios = mappedScenarios;
        }

        const resourcesRawResponse = await askBackendAssistant(
          `You are a professional development advisor. Return only a JSON array of 4 objects {"title","type","description"} for the best, most current professional development resources in ${inputData.topic}. Include top-rated books, courses, or sites. Respond ONLY with a valid JSON array.`
        );
        setResourcesRaw(resourcesRawResponse);
        latestResourcesRaw = resourcesRawResponse;
        const parsedResources = parseJsonArray<{ title?: string; type?: string; description?: string }>(resourcesRawResponse);
        if (active && parsedResources && parsedResources.length > 0) {
          const mappedResources = parsedResources.slice(0, 4).map((resource, index) => ({
            title: resource.title || `Resource ${index + 1}`,
            type: resource.type || "Professional",
            description: resource.description || "Recommended career development material.",
          }));
          setResources(mappedResources);
          latestResources = mappedResources;
        }

        const professors = await fetchProfessors({ offset: 0 });
        if (active && professors.length > 0) {
          const names = professors
            .slice(0, 3)
            .map((prof) => `${prof.first_name ?? ""} ${prof.last_name ?? ""}`.trim())
            .filter(Boolean);
          setProfessorNames(names);
          latestProfessorNames = names;
        }
      } catch {
        // Keep static recommendation content when backend data is unavailable.
      } finally {
        if (active) {
          const payload: ProfessionalRecommendationCache = {
            fingerprint,
            assistantAnswer: latestAssistantAnswer || assistantAnswer,
            professorNames: latestProfessorNames.length > 0 ? latestProfessorNames : professorNames,
            roadmapSteps: latestRoadmapSteps.length > 0 ? latestRoadmapSteps : roadmapSteps,
            competencies: latestCompetencies.length > 0 ? latestCompetencies : competencies,
            scenarios: latestScenarios.length > 0 ? latestScenarios : scenarios,
            resources: latestResources.length > 0 ? latestResources : resources,
            roadmapRaw: latestRoadmapRaw ?? roadmapRaw,
            competencyRaw: latestCompetencyRaw ?? competencyRaw,
            scenarioRaw: latestScenarioRaw ?? scenarioRaw,
            resourcesRaw: latestResourcesRaw ?? resourcesRaw,
          };
          sessionStorage.setItem(PROFESSIONAL_CACHE_KEY, JSON.stringify(payload));
        }
        setLoading(false);
      }
    };

    void loadLiveRecommendations();
    return () => {
      active = false;
    };
  }, [inputData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <div className="text-lg text-slate-700 font-medium">Generating your recommendations...</div>
        </div>
      </div>
    );
  }

  if (hasError || !inputData) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Professional Data Found</AlertTitle>
            <AlertDescription>
              Please complete the Learning Assistant form to get professional recommendations.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link to="/learning-assistant">
              <Button className="w-full">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Go to Learning Assistant
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Professional Recommendations
              </h1>
              <p className="text-lg text-slate-600">
                Career development pathway for {inputData.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle>Your Professional Development: {inputData.topic}</CardTitle>
              <CardDescription>
                Leveraging your {inputData.currentLevel} expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assistantAnswer && (
                <div className="mb-4 p-3 rounded-lg bg-purple-100 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Live Advisor Insight</p>
                  <p className="text-sm text-slate-700">{assistantAnswer}</p>
                </div>
              )}
              <p className="text-slate-700">{inputData.background}</p>
              {professorNames.length > 0 && (
                <p className="text-sm text-slate-600 mt-3">
                  Related faculty from Nebula: <strong>{professorNames.join(", ")}</strong>
                </p>
              )}
              {/* Debug: Show raw backend responses for roadmap, competencies, scenarios, resources */}
              <details className="mt-4 bg-slate-100 p-2 rounded border border-slate-200">
                <summary className="cursor-pointer text-xs text-slate-500">Show raw backend responses (debug)</summary>
                <div className="text-xs text-slate-600 mt-2">
                  <div><strong>Roadmap Raw:</strong> {JSON.stringify(roadmapRaw)}</div>
                  <div><strong>Competency Raw:</strong> {JSON.stringify(competencyRaw)}</div>
                  <div><strong>Scenario Raw:</strong> {JSON.stringify(scenarioRaw)}</div>
                  <div><strong>Resources Raw:</strong> {JSON.stringify(resourcesRaw)}</div>
                </div>
              </details>
            </CardContent>
          </Card>
        </motion.div>

        {/* Career Advancement Steps */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Career Advancement Roadmap
              </CardTitle>
              <CardDescription>
                Strategic steps to advance your career in {inputData.topic}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roadmapSteps.length === 0 && (
                  <p className="text-sm text-slate-500">No live roadmap steps available.</p>
                )}
                {roadmapSteps.map((item, index) => (
                  <motion.div
                    key={item.phase}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex gap-4 p-4 rounded-lg bg-slate-50 border-l-4 border-purple-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-600">{item.phase}</Badge>
                        <h3 className="font-semibold text-slate-900">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {item.description}
                      </p>
                      <div className="flex gap-3">
                        <Badge variant="outline">{item.timeline}</Badge>
                        <Badge variant="secondary">Impact: {item.impact}</Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Core Competencies */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Core Professional Competencies
              </CardTitle>
              <CardDescription>
                Essential skills for career growth in {inputData.topic}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competencies.length === 0 && (
                  <p className="text-sm text-slate-500">No live competency data available.</p>
                )}
                {competencies.map((item, index) => (
                  <motion.div
                    key={item.skill}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="p-4 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{item.skill}</span>
                      <span className="text-sm text-purple-600 font-semibold">{item.level}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.level}%` }}
                        transition={{ delay: 0.2 + 0.1 * index, duration: 0.5 }}
                        className="bg-purple-600 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real-World Scenarios */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-600" />
                Workplace Application Scenarios
              </CardTitle>
              <CardDescription>
                How to apply {inputData.topic} skills in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scenarios.length === 0 && (
                  <p className="text-sm text-slate-500">No live workplace scenarios available.</p>
                )}
                {scenarios.map((item, index) => (
                  <motion.div
                    key={item.scenario}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">
                          {item.scenario}
                        </h4>
                        <p className="text-sm text-slate-600 mb-2">
                          {item.description}
                        </p>
                        <Badge className="bg-green-600">{item.impact}</Badge>
                      </div>
                      <Rocket className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Professional Resources */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Professional Development Resources
              </CardTitle>
              <CardDescription>
                Curated resources for career advancement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources.length === 0 && (
                  <p className="text-sm text-slate-500">No live professional resources available.</p>
                )}
                {resources.map((resource, index) => (
                  <motion.div
                    key={resource.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">
                          {resource.title}
                        </h4>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {resource.description}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex gap-4"
        >
          <Link to="/learning-assistant" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Modify Preferences
            </Button>
          </Link>
          <Link to="/dashboard" className="flex-1">
            <Button className="w-full">
              View My Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
