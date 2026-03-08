import { motion } from "motion/react";
import { Sparkles, Menu } from "lucide-react";
import { useState } from "react";

type NavigationProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSidebar: () => void;
};

export function Navigation({ currentPath, onNavigate, onOpenSidebar }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/home" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "About", href: "/about" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0F]/80 backdrop-blur-xl border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onOpenSidebar}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-white" />
            </motion.button>

            {/* Logo */}
            <motion.button
              onClick={() => onNavigate("/home")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#F58025] to-[#00A8A8] rounded-xl flex items-center justify-center shadow-lg shadow-[#F58025]/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">UniLearn</span>
            </motion.button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => onNavigate(item.href)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`transition-colors ${
                  currentPath === item.href
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              onClick={() => onNavigate("/dashboard")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 bg-gradient-to-r from-[#F58025] to-[#ff9447] rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-[#F58025]/50 transition-all"
            >
              Open Dashboard
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.93 }}
            className="md:hidden w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <Menu className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pt-4 pb-2"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    onNavigate(item.href);
                    setIsOpen(false);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2 text-left rounded-lg transition-all ${
                    currentPath === item.href
                      ? "text-white bg-white/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </motion.button>
              ))}
              <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-white/10">
                <motion.button
                  onClick={() => {
                    onOpenSidebar();
                    setIsOpen(false);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg font-medium text-white text-left"
                >
                  Menu
                </motion.button>
                <motion.button
                  onClick={() => {
                    onNavigate("/dashboard");
                    setIsOpen(false);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-[#F58025] to-[#ff9447] rounded-lg font-semibold text-white"
                >
                  Open Dashboard
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
