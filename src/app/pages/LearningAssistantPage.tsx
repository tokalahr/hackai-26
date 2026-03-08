import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

interface LearningAssistantInput {
  userType: "student" | "professional";
  name: string;
  topic: string;
  currentLevel: string;
  background: string;
}

export default function LearningAssistantPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LearningAssistantInput>({
    userType: "student",
    name: "",
    topic: "",
    currentLevel: "",
    background: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to session storage
    sessionStorage.setItem("learningAssistantInput", JSON.stringify(formData));
    
    // Navigate based on user type
    if (formData.userType === "student") {
      navigate("/student-recommendations");
    } else {
      navigate("/professional-recommendations");
    }
  };

  const handleChange = (field: keyof LearningAssistantInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Learning Assistant
              </h1>
              <p className="text-lg text-slate-600">
                Get personalized recommendations for your learning journey
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
              <CardDescription>
                We'll use this information to create personalized learning recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Type */}
                <div className="space-y-3">
                  <Label>I am a:</Label>
                  <RadioGroup
                    value={formData.userType}
                    onValueChange={(value) => handleChange("userType", value as "student" | "professional")}
                  >
                    <div className="flex items-center space-x-2 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">Student</div>
                          <div className="text-sm text-slate-600">
                            Looking for coursework and academic progression
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">Professional</div>
                          <div className="text-sm text-slate-600">
                            Seeking skill development and workplace application
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic of Interest</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Web Development, Data Science, Business Strategy"
                    value={formData.topic}
                    onChange={(e) => handleChange("topic", e.target.value)}
                    required
                  />
                </div>

                {/* Current Level */}
                <div className="space-y-2">
                  <Label htmlFor="currentLevel">Current Level/Skills</Label>
                  <Input
                    id="currentLevel"
                    placeholder="e.g., Beginner, Intermediate, Advanced"
                    value={formData.currentLevel}
                    onChange={(e) => handleChange("currentLevel", e.target.value)}
                    required
                  />
                </div>

                {/* Background/Goals */}
                <div className="space-y-2">
                  <Label htmlFor="background">Background and Goals</Label>
                  <Textarea
                    id="background"
                    placeholder="Tell us about your background and what you hope to achieve..."
                    value={formData.background}
                    onChange={(e) => handleChange("background", e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" size="lg" className="w-full">
                  Get Recommendations
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
