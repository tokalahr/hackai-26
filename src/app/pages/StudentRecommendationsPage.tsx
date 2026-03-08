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

interface LearningAssistantInput {
  userType: "student" | "professional";
  name: string;
  topic: string;
  currentLevel: string;
  background: string;
}

export default function StudentRecommendationsPage() {
  const [inputData, setInputData] = useState<LearningAssistantInput | null>(null);
  const [hasError, setHasError] = useState(false);

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
              <p className="text-slate-700">{inputData.background}</p>
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
                {[
                  {
                    step: 1,
                    title: "Foundational Course",
                    description: `Start with Introduction to ${inputData.topic} to build a strong foundation`,
                    duration: "4-6 weeks",
                  },
                  {
                    step: 2,
                    title: "Intermediate Projects",
                    description: "Apply your knowledge through hands-on projects and assignments",
                    duration: "6-8 weeks",
                  },
                  {
                    step: 3,
                    title: "Advanced Concepts",
                    description: "Dive deeper into specialized topics and advanced techniques",
                    duration: "8-10 weeks",
                  },
                  {
                    step: 4,
                    title: "Capstone Project",
                    description: "Complete a comprehensive project demonstrating mastery",
                    duration: "4-6 weeks",
                  },
                ].map((item, index) => (
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
                {[
                  "Theoretical Foundations",
                  "Practical Applications",
                  "Problem-Solving Skills",
                  "Research Methods",
                  "Collaborative Projects",
                  "Critical Thinking",
                ].map((area, index) => (
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
                {[
                  {
                    title: "Comprehensive Textbook",
                    type: "Book",
                    description: `Essential readings in ${inputData.topic}`,
                  },
                  {
                    title: "Interactive Online Course",
                    type: "Course",
                    description: "Self-paced learning with practical exercises",
                  },
                  {
                    title: "Academic Journal Collection",
                    type: "Research",
                    description: "Latest research papers and case studies",
                  },
                  {
                    title: "Study Group Forum",
                    type: "Community",
                    description: "Connect with peers and share knowledge",
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
