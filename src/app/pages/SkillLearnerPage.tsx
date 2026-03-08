import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Brain, ArrowLeft, CheckCircle2, XCircle, GraduationCap, Briefcase, Target } from "lucide-react";
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
  levelLabel: string;
};

type AnswerRecord = {
  questionId: string;
  topic: string;
  selectedIndex: number;
  isCorrect: boolean;
};

type QuestionBlueprint = {
  levelLabel: string;
  promptTemplate: string;
  explanationTemplate: string;
  correct?: string;
  wrongA?: string;
  wrongB?: string;
};

type OptionVariant = {
  correct: string;
  wrongA: string;
  wrongB: string;
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

function rotate<T>(items: T[], shift: number): T[] {
  const length = items.length;
  if (length === 0) {
    return items;
  }
  const safeShift = ((shift % length) + length) % length;
  return [...items.slice(safeShift), ...items.slice(0, safeShift)];
}

function optionVariantsFor(track: QuizTrack, levelLabel: string, needsReview: boolean): OptionVariant[] {
  if (needsReview) {
    return [
      {
        correct: "Revisit your notes, summarize the core concept, and solve one guided example for {topic}.",
        wrongA: "Jump straight to advanced material and skip concept review for {topic}.",
        wrongB: "Pause {topic} entirely and switch to an unrelated area.",
      },
      {
        correct: "Redo one foundational exercise in {topic} and explain your reasoning step by step.",
        wrongA: "Memorize final answers for {topic} without solving the process.",
        wrongB: "Increase question difficulty in {topic} before fixing fundamentals.",
      },
      {
        correct: "Create a short error log for {topic}, then practice a corrected example.",
        wrongA: "Ignore the mistake and move to the next topic immediately.",
        wrongB: "Repeat the exact same method in {topic} without checking why it failed.",
      },
    ];
  }

  if (track === "student") {
    if (levelLabel === "Foundation") {
      return [
        {
          correct: "Define the key terms in {topic} and practice one basic problem.",
          wrongA: "Memorize random facts without checking how they connect in {topic}.",
          wrongB: "Skip fundamentals and attempt only final-level tasks in {topic}.",
        },
        {
          correct: "Build a one-page concept map for {topic} and verify it with one example.",
          wrongA: "Read only summaries and avoid direct practice for {topic}.",
          wrongB: "Change topics before validating your base understanding of {topic}.",
        },
      ];
    }
    if (levelLabel === "Application") {
      return [
        {
          correct: "Work through a medium-difficulty scenario in {topic} and explain each step.",
          wrongA: "Keep re-reading definitions without doing any applied practice.",
          wrongB: "Attempt a new topic before validating your {topic} understanding.",
        },
        {
          correct: "Solve two practical exercises in {topic} and compare your solution approaches.",
          wrongA: "Use one memorized pattern for every {topic} problem.",
          wrongB: "Skip feedback and assume your first attempt in {topic} is always correct.",
        },
      ];
    }
    if (levelLabel === "Synthesis") {
      return [
        {
          correct: "Combine two ideas in {topic} and justify tradeoffs in your solution.",
          wrongA: "Avoid comparison and use the first method you remember in {topic}.",
          wrongB: "Ignore reflection and only track whether your answer is final.",
        },
        {
          correct: "Integrate multiple {topic} techniques into one workflow and defend your choices.",
          wrongA: "Treat all {topic} techniques as interchangeable without context.",
          wrongB: "Skip reasoning and optimize only for speed in {topic} work.",
        },
      ];
    }
    return [
      {
        correct: "Teach {topic} back in your own words and solve a timed challenge.",
        wrongA: "Keep doing only easy questions you already know for {topic}.",
        wrongB: "Stop practicing {topic} after one correct answer.",
      },
      {
        correct: "Run a timed mixed set for {topic} and explain errors after each question.",
        wrongA: "Avoid timed practice and only review solved examples in {topic}.",
        wrongB: "Assume mastery in {topic} without testing retention over time.",
      },
    ];
  }

  if (levelLabel === "Foundation") {
    return [
      {
        correct: "Define a concrete outcome for {topic} and map one measurable KPI.",
        wrongA: "Start implementation without a business objective for {topic}.",
        wrongB: "Delay all planning until every edge case is known for {topic}.",
      },
      {
        correct: "Write a success metric for {topic} and align it with one team goal.",
        wrongA: "Measure activity volume only and ignore outcomes for {topic}.",
        wrongB: "Keep {topic} goals vague so they cannot be evaluated.",
      },
    ];
  }
  if (levelLabel === "Application") {
    return [
      {
        correct: "Build a small pilot for {topic}, then review results with stakeholders.",
        wrongA: "Expand scope immediately before validating {topic} assumptions.",
        wrongB: "Rely on opinions only and skip evidence for {topic} progress.",
      },
      {
        correct: "Ship a controlled experiment in {topic} and compare baseline vs outcome.",
        wrongA: "Roll out {topic} to all teams before any pilot learning.",
        wrongB: "Treat early feedback as noise and avoid iteration in {topic}.",
      },
    ];
  }
  if (levelLabel === "Synthesis") {
    return [
      {
        correct: "Create repeatable standards for {topic} and mentor one teammate.",
        wrongA: "Keep {topic} as personal knowledge with no shared process.",
        wrongB: "Add tools before standardizing how {topic} work is evaluated.",
      },
      {
        correct: "Document a reusable playbook for {topic} and run a peer review session.",
        wrongA: "Scale {topic} adoption without any standard definitions.",
        wrongB: "Optimize tooling first and postpone team enablement in {topic}.",
      },
    ];
  }
  return [
    {
      correct: "Lead a cross-team initiative in {topic} and report measurable outcomes.",
      wrongA: "Focus only on individual tasks and avoid organization-level goals in {topic}.",
      wrongB: "Treat mastery in {topic} as static and skip post-project retrospectives.",
    },
    {
      correct: "Own a strategy cycle for {topic} with metrics, review cadence, and coaching.",
      wrongA: "Assume past wins in {topic} guarantee future performance without measurement.",
      wrongB: "Avoid cross-team visibility and keep {topic} impact local only.",
    },
  ];
}

function getBlueprint(track: QuizTrack, stage: number, needsReview: boolean): QuestionBlueprint {
  if (needsReview) {
    return {
      levelLabel: "Reinforcement",
      promptTemplate:
        "You missed the previous checkpoint. Which action best rebuilds your foundation in {topic}?",
      correct: "Revisit your notes, summarize the core concept, and solve one guided example for {topic}.",
      wrongA: "Jump straight to advanced material and skip concept review for {topic}.",
      wrongB: "Pause {topic} entirely and switch to an unrelated area.",
      explanationTemplate:
        "A short review loop helps stabilize {topic} before increasing complexity.",
    };
  }

  const studentStages: QuestionBlueprint[] = [
    {
      levelLabel: "Foundation",
      promptTemplate: "What is the best first move to build confidence in {topic}?",
      correct: "Define the key terms in {topic} and practice one basic problem.",
      wrongA: "Memorize random facts without checking how they connect in {topic}.",
      wrongB: "Skip fundamentals and attempt only final-level tasks in {topic}.",
      explanationTemplate: "Strong foundations in {topic} make all later steps faster.",
    },
    {
      levelLabel: "Application",
      promptTemplate: "Which choice best applies your current understanding of {topic}?",
      correct: "Work through a medium-difficulty scenario in {topic} and explain each step.",
      wrongA: "Keep re-reading definitions without doing any applied practice.",
      wrongB: "Attempt a new topic before validating your {topic} understanding.",
      explanationTemplate: "Applied practice turns {topic} from memory into usable skill.",
    },
    {
      levelLabel: "Synthesis",
      promptTemplate: "How should you deepen mastery in {topic} next?",
      correct: "Combine two ideas in {topic} and justify tradeoffs in your solution.",
      wrongA: "Avoid comparison and use the first method you remember in {topic}.",
      wrongB: "Ignore reflection and only track whether your answer is final.",
      explanationTemplate: "Synthesis in {topic} builds decision-making, not just repetition.",
    },
    {
      levelLabel: "Mastery",
      promptTemplate: "What is the strongest mastery checkpoint for {topic}?",
      correct: "Teach {topic} back in your own words and solve a timed challenge.",
      wrongA: "Keep doing only easy questions you already know for {topic}.",
      wrongB: "Stop practicing {topic} after one correct answer.",
      explanationTemplate: "Teaching and timed retrieval confirm durable mastery in {topic}.",
    },
  ];

  const professionalStages: QuestionBlueprint[] = [
    {
      levelLabel: "Foundation",
      promptTemplate: "What is the best first move to establish practical value in {topic}?",
      correct: "Define a concrete outcome for {topic} and map one measurable KPI.",
      wrongA: "Start implementation without a business objective for {topic}.",
      wrongB: "Delay all planning until every edge case is known for {topic}.",
      explanationTemplate: "Clear outcomes anchor {topic} to impact, not activity.",
    },
    {
      levelLabel: "Application",
      promptTemplate: "Which action best applies {topic} in a real workflow?",
      correct: "Build a small pilot for {topic}, then review results with stakeholders.",
      wrongA: "Expand scope immediately before validating {topic} assumptions.",
      wrongB: "Rely on opinions only and skip evidence for {topic} progress.",
      explanationTemplate: "Pilot-first execution keeps {topic} iterative and evidence-based.",
    },
    {
      levelLabel: "Synthesis",
      promptTemplate: "How should you scale your skill in {topic} next?",
      correct: "Create repeatable standards for {topic} and mentor one teammate.",
      wrongA: "Keep {topic} as personal knowledge with no shared process.",
      wrongB: "Add tools before standardizing how {topic} work is evaluated.",
      explanationTemplate: "Scalable {topic} skill needs shared standards and transfer.",
    },
    {
      levelLabel: "Mastery",
      promptTemplate: "What is the strongest mastery signal for {topic} at work?",
      correct: "Lead a cross-team initiative in {topic} and report measurable outcomes.",
      wrongA: "Focus only on individual tasks and avoid organization-level goals in {topic}.",
      wrongB: "Treat mastery in {topic} as static and skip post-project retrospectives.",
      explanationTemplate: "Mastery in {topic} is demonstrated through sustained, measurable impact.",
    },
  ];

  const bank = track === "student" ? studentStages : professionalStages;
  return bank[Math.min(bank.length - 1, stage)];
}

function buildAdaptiveQuestion(
  track: QuizTrack,
  focus: string,
  questionIndex: number,
  focusHistory: AnswerRecord[],
): QuizQuestion {
  const safeFocus = focus || "Selected Focus";
  const lastAnswer = focusHistory[focusHistory.length - 1];
  const needsReview = Boolean(lastAnswer && !lastAnswer.isCorrect);
  const wrongCount = focusHistory.filter((answer) => !answer.isCorrect).length;
  const progressionStage = Math.max(0, Math.min(3, focusHistory.length));
  const blueprint = getBlueprint(track, progressionStage, needsReview);

  const prompt = blueprint.promptTemplate.replaceAll("{topic}", safeFocus);
  const explanation = blueprint.explanationTemplate.replaceAll("{topic}", safeFocus);

  const variants = optionVariantsFor(track, blueprint.levelLabel, needsReview);
  const variantIndex = (questionIndex + wrongCount) % variants.length;
  const chosen = variants[variantIndex];

  const rawOptions = [
    chosen.correct.replaceAll("{topic}", safeFocus),
    chosen.wrongA.replaceAll("{topic}", safeFocus),
    chosen.wrongB.replaceAll("{topic}", safeFocus),
  ];

  const rotatedOptions = rotate(rawOptions, questionIndex % rawOptions.length);
  const correctIndex = rotatedOptions.findIndex((option) => option === rawOptions[0]);

  return {
    id: `${track}-${safeFocus}-${questionIndex}`,
    track,
    topic: safeFocus,
    prompt,
    options: rotatedOptions,
    correctIndex,
    explanation,
    levelLabel: blueprint.levelLabel,
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
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [focusSelectorOpen, setFocusSelectorOpen] = useState(true);
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

    const focusHistory = answers.filter((answer) => answer.topic === selectedFocus);
    setCurrentQuestion(buildAdaptiveQuestion(activeTrack, selectedFocus, questionIndex, focusHistory));
    setSelectedIndex(null);
    setShowResult(false);
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
              <p className="text-lg text-slate-600">Choose a focus, then answer adaptive MCQs that build from your previous responses.</p>
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

        {selectedFocus && currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>{currentQuestion.topic}</CardTitle>
              <CardDescription>
                {currentQuestion.prompt}
              </CardDescription>
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
                Select a focus above to begin adaptive skill-building questions.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
