import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { GraduationCap, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

interface TopNavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function TopNavbar({ isOpen, setIsOpen }: TopNavbarProps) {
  const location = useLocation();
  const [hasStudentSkillTrack, setHasStudentSkillTrack] = useState(false);
  const [hasProfessionalSkillTrack, setHasProfessionalSkillTrack] = useState(false);

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
    <nav className="glass-surface sticky top-0 z-40 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="outline"
              size="icon"
            >
              {isOpen ? <X className="icon-soft-bg-sm h-5 w-5" /> : <Menu className="icon-soft-bg-sm h-5 w-5" />}
            </Button>
            <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GraduationCap className="icon-soft-bg h-8 w-8 text-indigo-600" />
              <span className="font-semibold text-xl text-slate-900">UniLearn</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/home">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="icon-soft-bg-sm mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Link>
            {hasStudentSkillTrack && (
              <Link to="/skill-learner?track=student">
                <Button variant="ghost" size="sm">
                  Skill Learner: Student
                </Button>
              </Link>
            )}
            {hasProfessionalSkillTrack && (
              <Link to="/skill-learner?track=professional">
                <Button variant="ghost" size="sm">
                  Skill Learner: Professional
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}