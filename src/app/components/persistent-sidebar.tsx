type PersistentSidebarProps = {
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
};

const navItems = [
  { label: "Home", path: "/" },
  { label: "Campus", path: "/dashboard" },
  { label: "Learning Assistant", path: "/learning-assistant" },
  { label: "About", path: "/about" },
];

export function PersistentSidebar({
  currentPath,
  isOpen,
  onClose,
  onNavigate,
}: PersistentSidebarProps) {
  const isActive = (path: string) => currentPath === path;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-[#0f0f12]/95 backdrop-blur-2xl border-r border-white/10 p-4 pt-24 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2 mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Navigate</p>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs text-gray-300 border border-white/10 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                onNavigate(item.path);
                onClose();
              }}
              className={`text-left rounded-xl px-4 py-3 border transition-all ${
                isActive(item.path)
                  ? "bg-[#F58025]/15 border-[#F58025]/45 text-[#ffc89d]"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4 px-2">
          This drawer stays available on every page.
        </p>
      </aside>
    </>
  );
}
