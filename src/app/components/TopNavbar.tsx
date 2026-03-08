import { Link } from "react-router";
import { GraduationCap, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

interface TopNavbarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function TopNavbar({ isOpen, setIsOpen }: TopNavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="outline"
              size="icon"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
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
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}