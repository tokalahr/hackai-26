import { createBrowserRouter } from "react-router";
import Root from "./layouts/Root";
import EntryPage from "./pages/EntryPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import LearningAssistantPage from "./pages/LearningAssistantPage";
import StudentRecommendationsPage from "./pages/StudentRecommendationsPage";
import ProfessionalRecommendationsPage from "./pages/ProfessionalRecommendationsPage";
import SkillLearnerPage from "./pages/SkillLearnerPage";
import CalibrationPage from "./pages/CalibrationPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: EntryPage },
      { path: "home", Component: HomePage },
      { path: "dashboard", Component: DashboardPage },
      { path: "learning-assistant", Component: LearningAssistantPage },
      { path: "student-recommendations", Component: StudentRecommendationsPage },
      { path: "professional-recommendations", Component: ProfessionalRecommendationsPage },
      { path: "skill-learner", Component: SkillLearnerPage },
      { path: "calibration", Component: CalibrationPage },
      { path: "about", Component: AboutPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
