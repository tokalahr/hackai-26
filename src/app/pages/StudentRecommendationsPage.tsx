import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { 
  GraduationCap, 
  Target, 
  BookOpen, 
  Lightbulb, 
  ExternalLink,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { askBackendAssistant, fetchCourseTrends, parseCourseFromText } from "../services/backend-api";

interface LearningAssistantInput {
  userType: "student" | "professional";
  name: string;
  topic: string;
  currentLevel: string;
  background: string;
}

type StudentRecommendationCache = {
  fingerprint: string;
  assistantAnswer: string;
  liveSectionCount: number | null;
  nextSteps: StudentStep[];
  focusAreas: string[];
  resources: StudentResource[];
};

type StudentStep = {
  step: number;
  title: string;
  description: string;
  duration: string;
};

type StudentResource = {
  title: string;
  type: string;
  description: string;
};

const STUDENT_CACHE_KEY = "student-recommendations-cache";

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

export default function StudentRecommendationsPage() {
  const [inputData, setInputData] = useState<LearningAssistantInput | null>(null);
  const [hasError, setHasError] = useState(false);
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [liveSectionCount, setLiveSectionCount] = useState<number | null>(null);
  const [nextSteps, setNextSteps] = useState<StudentStep[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [resources, setResources] = useState<StudentResource[]>([]);
  const [loading, setLoading] = useState(true); // <-- loading state

  useEffect(() => {
    const savedData = sessionStorage.getItem("learningAssistantInput");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.userType === "student") {
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
    if (!inputData || inputData.userType !== "student") {
      setLoading(false);
      return;
    }

    let active = true;
    const fingerprint = getFingerprint(inputData);

    try {
      const cachedRaw = sessionStorage.getItem(STUDENT_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as StudentRecommendationCache;
        if (cached.fingerprint === fingerprint) {
          setAssistantAnswer(cached.assistantAnswer || "");
          setLiveSectionCount(cached.liveSectionCount ?? null);
          setNextSteps(Array.isArray(cached.nextSteps) ? cached.nextSteps : []);
          setFocusAreas(Array.isArray(cached.focusAreas) ? cached.focusAreas : []);
          setResources(Array.isArray(cached.resources) ? cached.resources : []);
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
      let latestLiveSectionCount: number | null = null;
      let latestNextSteps: StudentStep[] = [];
      let latestFocusAreas: string[] = [];
      let latestResources: StudentResource[] = [];

      try {
        const answer = await askBackendAssistant(
          `Create concise student recommendations for topic ${inputData.topic}, level ${inputData.currentLevel}, background ${inputData.background}.`,
        );
        if (active && answer) {
          setAssistantAnswer(answer);
          latestAssistantAnswer = answer;
        }

        const stepsRaw = await askBackendAssistant(
          `Return only JSON array with 4 objects {"title","description","duration"} for student next steps on ${inputData.topic} at level ${inputData.currentLevel}. Respond ONLY with a valid JSON array.`,
        );
        const parsedSteps = parseJsonArray<{ title?: string; description?: string; duration?: string }>(stepsRaw);
        if (active && parsedSteps && parsedSteps.length > 0) {
          const mappedSteps = parsedSteps.slice(0, 4).map((step, index) => ({
            step: index + 1,
            title: step.title || `Step ${index + 1}`,
            description: step.description || "Continue progressing through the learning path.",
            duration: step.duration || "4-6 weeks",
          }));
          setNextSteps(mappedSteps);
          latestNextSteps = mappedSteps;
        }

        const focusRaw = await askBackendAssistant(
          `Return only JSON array of 6 short focus areas for a student learning ${inputData.topic}. Respond ONLY with a valid JSON array.`,
        );
        const parsedFocus = parseJsonArray<string>(focusRaw);
        if (active && parsedFocus && parsedFocus.length > 0) {
          const mappedFocus = parsedFocus.slice(0, 6).map((item) => String(item));
          setFocusAreas(mappedFocus);
          latestFocusAreas = mappedFocus;
        }

        const resourcesRaw = await askBackendAssistant(
          `Return only JSON array with 4 objects {"title","type","description"} for student resources on ${inputData.topic}. Respond ONLY with a valid JSON array.`,
        );
        const parsedResources = parseJsonArray<{ title?: string; type?: string; description?: string }>(resourcesRaw);
        if (active && parsedResources && parsedResources.length > 0) {
          const mappedResources = parsedResources.slice(0, 4).map((resource, index) => ({
            title: resource.title || `Learning Resource ${index + 1}`,
            type: resource.type || "Resource",
            description: resource.description || "Recommended supporting material.",
          }));
          setResources(mappedResources);
          latestResources = mappedResources;
        }

        const parsed = parseCourseFromText(inputData.topic);
        if (!parsed) {
          return;
        }

        const sections = await fetchCourseTrends(parsed.subjectPrefix, parsed.courseNumber);
        if (active) {
          setLiveSectionCount(sections.length);
          latestLiveSectionCount = sections.length;
        }
      } catch {
        // Keep static recommendation content when backend data is unavailable.
      } finally {
        if (active) {
          const payload: StudentRecommendationCache = {
            fingerprint,
            assistantAnswer: latestAssistantAnswer || assistantAnswer,
            liveSectionCount: latestLiveSectionCount,
            nextSteps: latestNextSteps.length > 0 ? latestNextSteps : nextSteps,
            focusAreas: latestFocusAreas.length > 0 ? latestFocusAreas : focusAreas,
            resources: latestResources.length > 0 ? latestResources : resources,
          };
          sessionStorage.setItem(STUDENT_CACHE_KEY, JSON.stringify(payload));
          window.dispatchEvent(new Event("skill-tracks-updated"));
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
          <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <AlertTitle>No Student Data Found</AlertTitle>
            <AlertDescription>
              Please complete the Learning Assistant form to get student recommendations.
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
            <div className="p-3 bg-indigo-100 rounded-lg">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Student Recommendations
              </h1>
              <p className="text-lg text-slate-600">
                Personalized coursework progression for {inputData.name}
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
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle>Your Learning Path: {inputData.topic}</CardTitle>
              <CardDescription>
                Based on your {inputData.currentLevel} level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assistantAnswer && (
                <div className="mb-4 p-3 rounded-lg bg-indigo-100 border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-700 mb-1">Live Advisor Insight</p>
                  <p className="text-sm text-slate-700">{assistantAnswer}</p>
                </div>
              )}
              <p className="text-slate-700">{inputData.background}</p>
              {liveSectionCount !== null && (
                <p className="text-sm text-slate-600 mt-3">
                  Nebula trends found <strong>{liveSectionCount}</strong> related sections.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Recommended Next Steps
              </CardTitle>
              <CardDescription>
                Follow this coursework progression for optimal learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nextSteps.length === 0 && (
                  <p className="text-sm text-slate-500">No live next-step recommendations available.</p>
                )}
                {nextSteps.map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex gap-4 p-4 rounded-lg bg-slate-50"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {item.description}
                      </p>
                      <Badge variant="secondary">{item.duration}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Focus Areas */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                Key Focus Areas
              </CardTitle>
              <CardDescription>
                Essential topics to master in {inputData.topic}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {focusAreas.length === 0 && (
                  <p className="text-sm text-slate-500">No live focus areas available.</p>
                )}
                {focusAreas.map((area, index) => (
                  <motion.div
                    key={area}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                  >
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span className="font-medium text-slate-900">{area}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Recommended Resources
              </CardTitle>
              <CardDescription>
                Curated learning materials for {inputData.topic}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources.length === 0 && (
                  <p className="text-sm text-slate-500">No live resources available.</p>
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
          transition={{ delay: 0.5, duration: 0.5 }}
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
