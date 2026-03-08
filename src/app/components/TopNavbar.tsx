import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { GraduationCap, LayoutDashboard } from "lucide-react";
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
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left spacer for the sidebar toggle button (rendered by SidebarNav at z-60) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10" />
            <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <span className="font-semibold text-xl text-slate-900">Aria</span>
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
                <LayoutDashboard className="w-4 h-4 mr-2" />
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