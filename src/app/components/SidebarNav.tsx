import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  LayoutDashboard, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Info,
} from "lucide-react";

const navItems = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/learning-assistant", icon: Sparkles, label: "Learning Assistant" },
  { path: "/student-recommendations", icon: GraduationCap, label: "Student Recommendations" },
  { path: "/professional-recommendations", icon: Briefcase, label: "Professional Recommendations" },
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
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="glass-surface fixed left-0 top-0 z-50 h-screen w-[300px] overflow-y-auto shadow-xl"
          >
            <nav className="flex flex-col gap-4 px-4 py-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex w-full items-center justify-start gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="icon-soft-bg-sm h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium leading-none">{item.label}</span>
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