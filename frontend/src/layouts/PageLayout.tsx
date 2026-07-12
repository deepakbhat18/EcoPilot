import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ToastContainer, showToast } from "../components/Toast";
import { CommandPalette } from "../components/CommandPalette";
import { Sparkles, Terminal, Keyboard } from "lucide-react";
import { api } from "../services/api";

export const PageLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("ecopilot-sidebar-collapsed") === "true";
  });
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);

  // Toggle command palette via keyboard shortcuts (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem("ecopilot-sidebar-collapsed", String(newVal));
      return newVal;
    });
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    showToast("Starting EcoPilot Demo Seeder...", "info");
    try {
      await api.post("/demo/seed");
      showToast("Demo datasets successfully seeded! Refreshing...", "success");
      // Trigger a soft refresh of the current page
      window.location.reload();
    } catch (err) {
      console.error(err);
      showToast("Failed to seed demo data. Please verify database connection.", "error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Premium Hackathon Demo Mode Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs px-4 py-2 flex items-center justify-between gap-4 font-medium shrink-0 shadow-sm relative z-50">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="animate-pulse text-yellow-300" />
          <span>
            <strong className="font-bold">EcoPilot Demo Workspace:</strong> Press <kbd className="bg-white/20 px-1 py-0.5 rounded text-[10px] font-mono">Ctrl + K</kbd> to launch Command Palette or load mock datasets instantly.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-0.5 rounded transition-all text-[10px]"
          >
            <Keyboard size={11} />
            Show Shortcuts
          </button>
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="bg-white text-neutral-900 font-bold px-3 py-1 rounded-full hover:bg-emerald-50 transition-all text-[10px] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Terminal size={11} />
            {seeding ? "Seeding..." : "Load Demo Data"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        <div 
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            isCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          <Navbar 
            onMenuToggle={() => setSidebarOpen(true)} 
            onSearchClick={() => setIsCommandOpen(true)}
          />

          <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto animate-fadeIn">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)}
        onSeedSuccess={() => window.location.reload()}
      />

      <ToastContainer />
    </div>
  );
};
