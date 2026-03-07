import { useEffect, useMemo, useState } from "react";
import { Navigation } from "./components/navigation";
import { Footer } from "./components/footer";
import { HomePage } from "./pages/home-page";
import { DashboardPage } from "./pages/dashboard-page";
import { AboutPage } from "./pages/about-page";
import { LoginPage } from "./pages/login-page";

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname || "/");

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

  const content = useMemo(() => {
    if (path === "/") return <HomePage onNavigate={navigate} />;
    if (path === "/dashboard") return <DashboardPage />;
    if (path === "/about") return <AboutPage />;
    if (path === "/login") return <LoginPage />;

    return (
      <section className="relative min-h-[70vh] pt-32 pb-16 px-6">
        <div className="absolute inset-0 bg-[#0D0D0F]" />
        <div className="relative z-10 container mx-auto max-w-3xl text-center space-y-5">
          <h1 className="text-5xl font-bold text-white">Page Not Found</h1>
          <p className="text-gray-400">This placeholder page has not been created yet.</p>
          <button
            onClick={() => navigate("/")}
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
      <Navigation currentPath={path} onNavigate={navigate} />
      <main>{content}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
