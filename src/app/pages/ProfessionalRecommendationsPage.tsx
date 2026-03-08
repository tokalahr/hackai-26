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

interface LearningAssistantInput {
  userType: "student" | "professional";
  name: string;
  topic: string;
  currentLevel: string;
  background: string;
}

export default function ProfessionalRecommendationsPage() {
  const [inputData, setInputData] = useState<LearningAssistantInput | null>(null);
  const [hasError, setHasError] = useState(false);

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
              <p className="text-slate-700">{inputData.background}</p>
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
                {[
                  {
                    phase: "Phase 1",
                    title: "Skill Enhancement",
                    description: `Master advanced techniques in ${inputData.topic} through professional certifications`,
                    timeline: "1-3 months",
                    impact: "High",
                  },
                  {
                    phase: "Phase 2",
                    title: "Industry Application",
                    description: "Apply skills to real-world workplace projects and case studies",
                    timeline: "3-6 months",
                    impact: "Very High",
                  },
                  {
                    phase: "Phase 3",
                    title: "Leadership Development",
                    description: "Build management skills and team leadership capabilities",
                    timeline: "6-9 months",
                    impact: "Critical",
                  },
                  {
                    phase: "Phase 4",
                    title: "Strategic Impact",
                    description: "Lead initiatives and drive organizational change",
                    timeline: "9-12 months",
                    impact: "Strategic",
                  },
                ].map((item, index) => (
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
                {[
                  { skill: "Strategic Thinking", level: 85 },
                  { skill: "Project Management", level: 90 },
                  { skill: "Team Leadership", level: 75 },
                  { skill: "Communication", level: 88 },
                  { skill: "Innovation", level: 80 },
                  { skill: "Problem Solving", level: 92 },
                ].map((item, index) => (
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
                {[
                  {
                    scenario: "Process Optimization",
                    description: "Streamline workflows using advanced techniques",
                    impact: "30% efficiency gain",
                  },
                  {
                    scenario: "Team Training Initiative",
                    description: "Lead knowledge-sharing sessions for colleagues",
                    impact: "Team skill uplift",
                  },
                  {
                    scenario: "Innovation Project",
                    description: "Pilot new methodologies in current projects",
                    impact: "Competitive advantage",
                  },
                  {
                    scenario: "Strategic Planning",
                    description: "Contribute to department-level strategy",
                    impact: "Leadership visibility",
                  },
                ].map((item, index) => (
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
                {[
                  {
                    title: "Industry Certification Program",
                    type: "Certification",
                    description: `Professional credentials in ${inputData.topic}`,
                  },
                  {
                    title: "Executive Training Course",
                    type: "Leadership",
                    description: "Advanced management and strategy skills",
                  },
                  {
                    title: "Professional Network",
                    type: "Community",
                    description: "Connect with industry leaders and peers",
                  },
                  {
                    title: "Case Study Library",
                    type: "Resources",
                    description: "Real-world business applications and solutions",
                  },
                ].map((resource, index) => (
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
