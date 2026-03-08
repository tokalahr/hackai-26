import { Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import TopNavbar from "../components/TopNavbar";
import SidebarNav from "../components/SidebarNav";

export default function Root() {
  const location = useLocation();
  const isEntryPage = location.pathname === "/";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {!isEntryPage && <TopNavbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div className="flex">
        {!isEntryPage && <SidebarNav isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
        <main className={`flex-1 ${!isEntryPage ? 'ml-0' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}