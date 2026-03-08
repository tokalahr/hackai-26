import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navigation } from "./components/navigation";
import { Footer } from "./components/footer";
import { PersistentSidebar } from "./components/persistent-sidebar";
import { EntryPage } from "./pages/entry-page";
import { HomePage } from "./pages/home-page";
import { DashboardPage } from "./pages/dashboard-page";
import { AboutPage } from "./pages/about-page";
import { StudentRecommendationsPage } from "./pages/student-recommendations-page";
import { ProfessionalRecommendationsPage } from "./pages/professional-recommendations-page";

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname || "/");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath: string) => {
    if (nextPath === path) {
      return;
    }
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [path]);

  const isEntryScreen = path === "/";

  const content = useMemo(() => {
    if (path === "/") return <EntryPage onNavigate={navigate} />;
    if (path === "/home") return <HomePage onNavigate={navigate} />;
    if (path === "/dashboard" || path === "/learning-assistant") {
      return <DashboardPage activePath={path} onNavigate={navigate} />;
    }
    if (path === "/about") return <AboutPage />;
    if (path === "/student-recommendations") {
      return <StudentRecommendationsPage onNavigate={navigate} />;
    }
    if (path === "/professional-recommendations") {
      return <ProfessionalRecommendationsPage onNavigate={navigate} />;
    }

    return (
      <section className="relative min-h-[70vh] pt-32 pb-16 px-6">
        <div className="absolute inset-0 bg-[#0D0D0F]" />
        <div className="relative z-10 container mx-auto max-w-3xl text-center space-y-5">
          <h1 className="text-5xl font-bold text-white">Page Not Found</h1>
          <p className="text-gray-400">This placeholder page has not been created yet.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#F58025] to-[#ff9447]"
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }, [path]);

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white dark">
      {!isEntryScreen && (
        <Navigation
          currentPath={path}
          onNavigate={navigate}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      )}

      {!isEntryScreen && (
        <PersistentSidebar
          currentPath={path}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={navigate}
        />
      )}

      <div
        className={
          isEntryScreen
            ? "relative z-10"
            : "relative z-10 container mx-auto max-w-7xl px-6 pt-28 pb-10"
        }
      >
        <AnimatePresence mode="wait">
          <motion.main
            key={path}
            initial={{ opacity: 0, y: 12, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(1px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {content}
          </motion.main>
        </AnimatePresence>
        {!isEntryScreen && <Footer onNavigate={navigate} />}
      </div>
    </div>
  );
}
