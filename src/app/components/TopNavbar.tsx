import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import nyxLogoDark from "../../assets/nyx-logo-dark.svg";
import nyxLogoLight from "../../assets/nyx-logo-light.svg";

interface TopNavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("nyx-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function TopNavbar({ isOpen, setIsOpen }: TopNavbarProps) {
  const location = useLocation();
  const [hasStudentSkillTrack, setHasStudentSkillTrack] = useState(false);
  const [hasProfessionalSkillTrack, setHasProfessionalSkillTrack] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("nyx-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const refreshTrackFlags = () => {
    const studentRaw = sessionStorage.getItem("student-recommendations-cache");
    const professionalRaw = sessionStorage.getItem("professional-recommendations-cache");
    setHasStudentSkillTrack(Boolean(studentRaw));
    setHasProfessionalSkillTrack(Boolean(professionalRaw));
  };

  useEffect(() => {
    refreshTrackFlags();
  }, [location.pathname]);

  useEffect(() => {
    const onSkillTracksUpdated = () => refreshTrackFlags();
    window.addEventListener("skill-tracks-updated", onSkillTracksUpdated);
    return () => {
      window.removeEventListener("skill-tracks-updated", onSkillTracksUpdated);
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10" />
            <Link to="/home" className="flex items-center hover:opacity-90 transition-opacity" aria-label="Nyx home">
              <img
                src={theme === "dark" ? nyxLogoDark : nyxLogoLight}
                alt="Nyx.ai"
                className="h-9 w-auto"
              />
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/home">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm">About</Button>
            </Link>
            {hasStudentSkillTrack && (
              <Link to="/skill-learner?track=student">
                <Button variant="ghost" size="sm">Skill Learner: Student</Button>
              </Link>
            )}
            {hasProfessionalSkillTrack && (
              <Link to="/skill-learner?track=professional">
                <Button variant="ghost" size="sm">Skill Learner: Professional</Button>
              </Link>
            )}

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative w-9 h-9"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Sun className={`w-5 h-5 transition-all ${theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"} absolute`} />
              <Moon className={`w-5 h-5 transition-all ${theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"} absolute`} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
