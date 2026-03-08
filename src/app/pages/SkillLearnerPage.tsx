import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Brain, ArrowLeft, CheckCircle2, XCircle, GraduationCap, Briefcase, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { askBackendAssistant } from "../services/backend-api";

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

function parseJsonObject(text: string): AssistantQuestionPayload | null {
  try {
    return JSON.parse(text) as AssistantQuestionPayload;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]) as AssistantQuestionPayload;
    } catch {
      return null;
    }
  }
}

function getLevelLabel(focusHistory: AnswerRecord[]): string {
  const last = focusHistory[focusHistory.length - 1];
  if (last && !last.isCorrect) {
    return "Reinforcement";
  }
  const correctCount = focusHistory.filter((item) => item.isCorrect).length;
  if (correctCount === 0) {
    return "Foundation";
  }
  if (correctCount === 1) {
    return "Application";
  }
  if (correctCount === 2) {
    return "Synthesis";
  }
  return "Mastery";
}

function fallbackQuestion(
  track: QuizTrack,
  topic: string,
  levelLabel: string,
  questionIndex: number,
  needsReview: boolean,
): QuizQuestion {
  const focus = topic || "Selected Topic";

  const foundationBank = [
    {
      prompt: `Which statement best describes a core concept of ${focus}?`,
      options: [
        `${focus} primarily concerns random memorization without context.`,
        `${focus} focuses on foundational principles and how they connect in practice.`,
        `${focus} is only useful for advanced edge cases and not fundamentals.`,
      ],
      correctIndex: 1,
      explanation: `${focus} starts with core principles and practical connections, not isolated memorization.`,
    },
    {
      prompt: `What is the strongest first-principles approach to ${focus}?`,
      options: [
        `Identify the base model of ${focus}, then test it with a simple scenario.`,
        `Skip models and rely only on final answers for ${focus}.`,
        `Treat ${focus} as a fixed checklist with no reasoning.`,
      ],
      correctIndex: 0,
      explanation: `Understanding and testing the underlying model gives durable ${focus} knowledge.`,
    },
  ];

  const applicationBank = [
    {
      prompt: `In a practical task, what is the best way to apply ${focus}?`,
      options: [
        `Select an approach, justify why it fits, then validate with output checks.`,
        `Use the same method every time regardless of context.`,
        `Prioritize speed over correctness when applying ${focus}.`,
      ],
      correctIndex: 0,
      explanation: `${focus} application requires context-aware method choice and validation.`,
    },
    {
      prompt: `You must solve a real problem with ${focus}. What should you do first?`,
      options: [
        `Define constraints and success criteria before choosing a technique.`,
        `Jump to implementation and infer constraints later.`,
        `Avoid measurement and rely on intuition only.`,
      ],
      correctIndex: 0,
      explanation: `Clear constraints improve accuracy and decision quality in ${focus}.`,
    },
  ];

  const synthesisBank = [
    {
      prompt: `Which choice shows deeper synthesis in ${focus}?`,
      options: [
        `Compare two valid approaches in ${focus} and explain tradeoffs.`,
        `Use one preferred approach and ignore alternatives.`,
        `Pick the fastest approach without evaluating quality.`,
      ],
      correctIndex: 0,
      explanation: `Synthesis in ${focus} means reasoning across alternatives and tradeoffs.`,
    },
    {
      prompt: `How do you demonstrate strategic thinking in ${focus}?`,
      options: [
        `Connect design decisions in ${focus} to downstream impact and risk.`,
        `Treat each decision in ${focus} as independent and isolated.`,
        `Optimize one metric in ${focus} while ignoring all side effects.`,
      ],
      correctIndex: 0,
      explanation: `High-level ${focus} proficiency includes system-level consequence analysis.`,
    },
  ];

  const masteryBank = [
    {
      prompt: `What best indicates mastery of ${focus}?`,
      options: [
        `You can explain, adapt, and troubleshoot ${focus} under changing constraints.`,
        `You can solve only familiar versions of ${focus} problems.`,
        `You remember terminology for ${focus} but cannot apply it.`,
      ],
      correctIndex: 0,
      explanation: `Mastery is adaptive performance, not only recognition or recall.`,
    },
    {
      prompt: `A mastery-level checkpoint for ${focus} is:`,
      options: [
        `Design a robust solution in ${focus} and defend decisions with evidence.`,
        `Avoid explaining why your ${focus} solution works.`,
        `Depend on one memorized pattern for all ${focus} tasks.`,
      ],
      correctIndex: 0,
      explanation: `Evidence-backed decisions and adaptability mark true ${focus} mastery.`,
    },
  ];

  const reinforcementBank = [
    {
      prompt: `You missed the previous ${focus} question. Which follow-up is best?`,
      options: [
        `Retry a similar ${focus} concept with a new scenario and verify each step.`,
        `Switch to a different topic and skip ${focus} remediation.`,
        `Repeat the same mistake pattern in ${focus} without checking assumptions.`,
      ],
      correctIndex: 0,
      explanation: `A similar but re-framed ${focus} scenario helps repair misconceptions.`,
    },
    {
      prompt: `For ${focus} reinforcement, what should you prioritize now?`,
      options: [
        `Rebuild the concept with a different example and compare with your last answer.`,
        `Memorize the previous answer choice without reasoning.`,
        `Increase difficulty before fixing the core ${focus} mistake.`,
      ],
      correctIndex: 0,
      explanation: `Reinforcement works best when the same concept is tested through a new lens.`,
    },
  ];

  const bank = needsReview
    ? reinforcementBank
    : levelLabel === "Application"
      ? applicationBank
      : levelLabel === "Synthesis"
        ? synthesisBank
        : levelLabel === "Mastery"
          ? masteryBank
          : foundationBank;

  const picked = bank[questionIndex % bank.length];

  return {
    id: `${track}-${focus}-${questionIndex}-fallback`,
    track,
    topic: focus,
    prompt: picked.prompt,
    options: picked.options,
    correctIndex: picked.correctIndex,
    explanation: picked.explanation,
    levelLabel,
  };
}

async function generateTopicQuestion(
  track: QuizTrack,
  topic: string,
  questionIndex: number,
  focusHistory: AnswerRecord[],
): Promise<QuizQuestion> {
  const safeTopic = topic || "Selected Topic";
  const lastAnswer = focusHistory[focusHistory.length - 1];
  const needsReview = Boolean(lastAnswer && !lastAnswer.isCorrect);
  const levelLabel = getLevelLabel(focusHistory);

  const historySummary = focusHistory
    .slice(-3)
    .map((item, idx) => {
      const outcome = item.isCorrect ? "correct" : "incorrect";
      return `Q${idx + 1}: ${item.prompt} | selected="${item.options[item.selectedIndex] || ""}" | ${outcome}`;
    })
    .join("\n");

  const previousQuestionContext = lastAnswer
    ? `Previous question prompt: ${lastAnswer.prompt}\nPrevious options: ${lastAnswer.options.join(" | ")}`
    : "No previous question for this focus yet.";

  const remediationRule = needsReview
    ? "The learner got the previous question wrong. Generate a similar concept question about the SAME topic, but with different wording and different options from the previous question."
    : "Generate the next progressive question for this topic knowledge level.";

  const prompt = [
    "Return ONLY a valid JSON object with keys: prompt, options, correctIndex, explanation.",
    "This must be a knowledge question ABOUT THE TOPIC ITSELF, not about study habits or learning strategy.",
    `Track: ${track}.`,
    `Topic: ${safeTopic}.`,
    `Target difficulty level: ${levelLabel}.`,
    remediationRule,
    previousQuestionContext,
    `Recent answer history:\n${historySummary || "None"}`,
    "Rules:",
    "- options must have at least 2 items (prefer 3 or 4).",
    "- exactly one correct answer.",
    "- correctIndex must be a valid zero-based index.",
    "- explanation must be concise and topic-specific.",
  ].join("\n\n");

  try {
    const response = await askBackendAssistant(prompt);
    const parsed = parseJsonObject(response);

    if (!parsed?.prompt || !Array.isArray(parsed.options) || parsed.options.length < 2) {
      return fallbackQuestion(track, safeTopic, levelLabel, questionIndex, needsReview);
    }

    const options = parsed.options.map((opt) => String(opt).trim()).filter(Boolean);
    if (options.length < 2) {
      return fallbackQuestion(track, safeTopic, levelLabel, questionIndex, needsReview);
    }

    let correctIndex = Number(parsed.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      correctIndex = 0;
    }

    const safePrompt = String(parsed.prompt).trim();
    const safeExplanation = String(parsed.explanation || "Review this concept and compare your choice with the correct option.").trim();

    return {
      id: `${track}-${safeTopic}-${questionIndex}-${Date.now()}`,
      track,
      topic: safeTopic,
      prompt: safePrompt,
      options,
      correctIndex,
      explanation: safeExplanation,
      levelLabel,
    };
  } catch {
    return fallbackQuestion(track, safeTopic, levelLabel, questionIndex, needsReview);
  }
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
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [focusSelectorOpen, setFocusSelectorOpen] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

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
    setSelectedFocus(null);
    setFocusSelectorOpen(true);
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setShowResult(false);
  }, [activeTrack]);

  useEffect(() => {
    if (topics.length === 0) {
      setSelectedFocus(null);
      setCurrentQuestion(null);
      return;
    }

    if (selectedFocus && !topics.includes(selectedFocus)) {
      setSelectedFocus(null);
      setFocusSelectorOpen(true);
    }
  }, [topics, selectedFocus]);

  useEffect(() => {
    if (!selectedFocus) {
      setCurrentQuestion(null);
      return;
    }

    let active = true;
    const focusHistory = answers.filter((answer) => answer.topic === selectedFocus);

    const buildQuestion = async () => {
      setIsGeneratingQuestion(true);
      const generated = await generateTopicQuestion(activeTrack, selectedFocus, questionIndex, focusHistory);
      if (!active) {
        return;
      }
      setCurrentQuestion(generated);
      setSelectedIndex(null);
      setShowResult(false);
      setIsGeneratingQuestion(false);
    };

    void buildQuestion();

    return () => {
      active = false;
    };
  }, [activeTrack, selectedFocus, questionIndex, answers]);

  const switchTrack = (next: QuizTrack) => {
    setActiveTrack(next);
    setSearchParams({ track: next });
  };

  const chooseFocus = (focus: string) => {
    setSelectedFocus(focus);
    setFocusSelectorOpen(false);
    setQuestionIndex(0);
    setSelectedIndex(null);
    setShowResult(false);
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
        prompt: currentQuestion.prompt,
        options: currentQuestion.options,
      },
    ]);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setQuestionIndex((prev) => prev + 1);
  };

  const answersForTrack = answers.filter((answer) => topics.includes(answer.topic));
  const answersForFocus = selectedFocus ? answers.filter((answer) => answer.topic === selectedFocus) : [];
  const correctForTrack = answersForTrack.filter((item) => item.isCorrect).length;
  const correctForFocus = answersForFocus.filter((item) => item.isCorrect).length;

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
              <p className="text-lg text-slate-600">
                Choose a focus, then answer adaptive MCQs that test topic knowledge and build on previous answers.
              </p>
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
            <Badge variant="secondary">Answered: {answersForTrack.length}</Badge>
            <Badge variant="secondary">Correct: {correctForTrack}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Next Focus Selection
            </CardTitle>
            <CardDescription>
              Pick what you want to build next from your recommendation order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFocus && !focusSelectorOpen && (
              <Button type="button" variant="outline" onClick={() => setFocusSelectorOpen(true)}>
                Focus: {selectedFocus} (Change)
              </Button>
            )}

            {focusSelectorOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topics.map((topic, index) => (
                  <Button
                    key={`${topic}-${index}`}
                    type="button"
                    variant={selectedFocus === topic ? "default" : "outline"}
                    onClick={() => chooseFocus(topic)}
                    className="justify-start"
                  >
                    {index + 1}. {topic}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedFocus && isGeneratingQuestion && (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-slate-600">Generating a topic-specific question...</p>
            </CardContent>
          </Card>
        )}

        {selectedFocus && currentQuestion && !isGeneratingQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>{currentQuestion.topic}</CardTitle>
              <CardDescription>{currentQuestion.prompt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge>{currentQuestion.levelLabel}</Badge>
                <Badge variant="secondary">Focus answered: {answersForFocus.length}</Badge>
                <Badge variant="secondary">Focus correct: {correctForFocus}</Badge>
              </div>

              {currentQuestion.options.map((option, index) => {
                const isPicked = selectedIndex === index;
                return (
                  <button
                    key={`${currentQuestion.id}-${index}`}
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

        {!selectedFocus && (
          <Card>
            <CardHeader>
              <CardTitle>Start Quiz</CardTitle>
              <CardDescription>
                Select a focus above to begin adaptive, topic-specific MCQs.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
