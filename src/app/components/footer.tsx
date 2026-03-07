import { Github, Twitter, Mail, Sparkles } from "lucide-react";

export function Footer() {
  const links = {
    product: [
      { name: "Features", href: "#" },
      { name: "API Docs", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Changelog", href: "#" },
    ],
    resources: [
      { name: "Documentation", href: "#" },
      { name: "Guides", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Support", href: "#" },
    ],
    company: [
      { name: "About", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
    ],
  };

  return (
    <footer className="relative bg-[#0D0D0F] border-t border-white/10 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-[#F58025] to-transparent" />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F58025] to-[#00A8A8] rounded-xl flex items-center justify-center shadow-lg shadow-[#F58025]/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Nebula Student</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-sm">
              Empowering UT Dallas students with intelligent academic tools and personalized campus insights.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 hover:border-[#F58025]/50 transition-all group"
              >
                <Github className="w-5 h-5 text-gray-400 group-hover:text-[#F58025] transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 hover:border-[#00A8A8]/50 transition-all group"
              >
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-[#00A8A8] transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 hover:border-[#A259FF]/50 transition-all group"
              >
                <Mail className="w-5 h-5 text-gray-400 group-hover:text-[#A259FF] transition-colors" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#F58025] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#00A8A8] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[#A259FF] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Nebula Student. Built with ❤️ by UT Dallas students.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                <div className="w-2 h-2 bg-[#00A8A8] rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Powered by Nebula Labs API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
