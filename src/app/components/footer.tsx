import { Sparkles } from "lucide-react";

type FooterProps = {
  onNavigate: (path: string) => void;
};

export function Footer({ onNavigate }: FooterProps) {
  const links = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "About", href: "/about" },
    { name: "Login", href: "/login" },
  ];

  return (
    <footer className="relative bg-[#0D0D0F] border-t border-white/10 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-[#F58025] to-transparent" />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F58025] to-[#00A8A8] rounded-xl flex items-center justify-center shadow-lg shadow-[#F58025]/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">UniLearn</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm">
              Campus data and professional learning guidance in one focused interface.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => onNavigate(link.href)}
                    className="text-gray-400 hover:text-[#F58025] transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 UniLearn. Built for student and professional growth.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                <div className="w-2 h-2 bg-[#00A8A8] rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Frontend-only demo mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
