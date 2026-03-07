import { motion } from "motion/react";
import { Sparkles, Menu } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Docs", href: "#docs" },
    { name: "Community", href: "#community" },
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
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F58025] to-[#00A8A8] rounded-xl flex items-center justify-center shadow-lg shadow-[#F58025]/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Nebula Student</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2 text-white hover:text-[#F58025] transition-colors">
              Sign In
            </button>
            <button className="px-5 py-2 bg-gradient-to-r from-[#F58025] to-[#ff9447] rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-[#F58025]/50 transition-all">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
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
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-white/10">
                <button className="px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-all text-left">
                  Sign In
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-[#F58025] to-[#ff9447] rounded-lg font-semibold text-white">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
