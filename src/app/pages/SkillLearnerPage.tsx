import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Brain, ArrowLeft, CheckCircle2, XCircle, GraduationCap, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

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
};

type AnswerRecord = {
  questionId: string;
  topic: string;
  selectedIndex: number;
  isCorrect: boolean;
};

function readJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function uniqueOrdered(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (!normalized) {
      continue;
    }
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }
  return result;
}

function buildQuestion(track: QuizTrack, topic: string, index: number, allTopics: string[]): QuizQuestion {
  const safeTopic = topic || `Topic ${index + 1}`;
  const distractors = allTopics.filter((item) => item !== safeTopic).slice(0, 3);
  while (distractors.length < 3) {
    distractors.push(`General review ${distractors.length + 1}`);
  }

  const options = [
    `Prioritize ${safeTopic} first`,
    `Skip ${safeTopic} and move to ${distractors[0]}`,
    `Only study ${distractors[1]} this week`,
    `Ignore all and focus on ${distractors[2]}`,
  ];

  return {
    id: `${track}-${index}-${safeTopic}`,
    track,
    topic: safeTopic,
    prompt: `Based on your ${track} recommendations, what should be your next focus?`,
    options,
    correctIndex: 0,
    explanation: `Your recommendation order suggests focusing on ${safeTopic} at this stage.`,
  };
}

export default function SkillLearnerPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const studentCache = readJson<StudentCache>("student-recommendations-cache");
  const professionalCache = readJson<ProfessionalCache>("professional-recommendations-cache");

  const studentTopics = useMemo(() => {
    const steps = (studentCache?.nextSteps ?? []).map((item) => item.title || "");
    const focus = studentCache?.focusAreas ?? [];
    return uniqueOrdered([...steps, ...focus]);
  }, [studentCache]);

  const professionalTopics = useMemo(() => {
    const roadmap = (professionalCache?.roadmapSteps ?? []).map((item) => item.title || "");
    const competencies = (professionalCache?.competencies ?? []).map((item) => item.skill || "");
    return uniqueOrdered([...roadmap, ...competencies]);
  }, [professionalCache]);

  const hasStudentTrack = studentTopics.length > 0;
  const hasProfessionalTrack = professionalTopics.length > 0;

  const requestedTrack = searchParams.get("track");
  const initialTrack: QuizTrack = requestedTrack === "professional" ? "professional" : "student";

  const [activeTrack, setActiveTrack] = useState<QuizTrack>(initialTrack);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const topics = activeTrack === "student" ? studentTopics : professionalTopics;

  useEffect(() => {
    if (hasStudentTrack && !hasProfessionalTrack) {
      setActiveTrack("student");
      setSearchParams({ track: "student" });
      return;
    }
    if (!hasStudentTrack && hasProfessionalTrack) {
      setActiveTrack("professional");
      setSearchParams({ track: "professional" });
      return;
    }
    if (hasStudentTrack && hasProfessionalTrack && requestedTrack !== "student" && requestedTrack !== "professional") {
      setSearchParams({ track: "student" });
    }
  }, [hasStudentTrack, hasProfessionalTrack, requestedTrack, setSearchParams]);

  useEffect(() => {
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setShowResult(false);
  }, [activeTrack]);

  useEffect(() => {
    if (topics.length === 0) {
      setCurrentQuestion(null);
      return;
    }

    const topic = topics[questionIndex % topics.length];
    setCurrentQuestion(buildQuestion(activeTrack, topic, questionIndex, topics));
    setSelectedIndex(null);
    setShowResult(false);
  }, [activeTrack, questionIndex, topics]);

  const switchTrack = (next: QuizTrack) => {
    setActiveTrack(next);
    setSearchParams({ track: next });
  };

  const submitAnswer = () => {
    if (!currentQuestion || selectedIndex === null) {
      return;
    }

    const isCorrect = selectedIndex === currentQuestion.correctIndex;
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        topic: currentQuestion.topic,
        selectedIndex,
        isCorrect,
      },
    ]);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setQuestionIndex((prev) => prev + 1);
  };

  const correctCount = answers.filter((item) => item.isCorrect).length;

  if (!hasStudentTrack && !hasProfessionalTrack) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Skill Learner Not Available Yet</CardTitle>
            <CardDescription>
              Generate at least one recommendation track first, then come back for topic-based MCQ practice.
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
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Skill Learner</h1>
              <p className="text-lg text-slate-600">Progressive MCQs generated from your recommendation order</p>
            </div>
          </div>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Track</CardTitle>
            <CardDescription>
              Use Student or Professional quiz tracks based on generated recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
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
            <Badge variant="secondary">Answered: {answers.length}</Badge>
            <Badge variant="secondary">Correct: {correctCount}</Badge>
          </CardContent>
        </Card>

        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>{currentQuestion.topic}</CardTitle>
              <CardDescription>{currentQuestion.prompt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isPicked = selectedIndex === index;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isPicked ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}

              {!showResult ? (
                <Button type="button" onClick={submitAnswer} disabled={selectedIndex === null}>
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    {selectedIndex === currentQuestion.correctIndex ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {selectedIndex === currentQuestion.correctIndex ? "Correct" : "Not quite"}
                      </p>
                      <p className="text-sm text-slate-600">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                  <Button type="button" onClick={nextQuestion}>
                    Next Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recommendation Order</CardTitle>
            <CardDescription>Question topics are served in this sequence and cycle as you continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topics.map((topic, index) => (
              <div key={`${topic}-${index}`} className="text-sm text-slate-700">
                {index + 1}. {topic}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
