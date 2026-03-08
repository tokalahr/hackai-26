import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  LayoutDashboard, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Brain,
  Info,
  X,
  Menu,
} from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/learning-assistant", icon: Sparkles, label: "Learning Assistant" },
  { path: "/student-recommendations", icon: GraduationCap, label: "Student Recommendations" },
  { path: "/professional-recommendations", icon: Briefcase, label: "Professional Recommendations" },
  { path: "/calibration", icon: Brain, label: "ARIA Calibration" },
  { path: "/about", icon: Info, label: "About" },
];

interface SidebarNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SidebarNav({ isOpen, setIsOpen }: SidebarNavProps) {
  const location = useLocation();

  return (
    <>
      {/* Toggle button — always visible, sits above the overlay */}
      <div className="fixed left-4 top-3.5 z-[60]">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="icon"
          className="bg-white shadow-sm"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-xl z-50 overflow-y-auto"
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}