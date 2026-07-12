import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Terminal, 
  Leaf, 
  Users, 
  Building, 
  Trophy, 
  FileText, 
  User, 
  Database,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { showToast } from "./Toast";
import { api } from "../services/api";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSeedSuccess?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose,
  onSeedSuccess
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const items = [
    { id: "dash", category: "Navigation", title: "Go to Dashboard", icon: <Terminal size={16} />, action: () => navigate("/") },
    { id: "env", category: "Navigation", title: "Go to Environmental Module", icon: <Leaf size={16} className="text-esg-environmental" />, action: () => navigate("/environmental") },
    { id: "soc", category: "Navigation", title: "Go to Social Responsibility", icon: <Users size={16} className="text-esg-social" />, action: () => navigate("/social") },
    { id: "gov", category: "Navigation", title: "Go to Corporate Governance", icon: <Building size={16} className="text-esg-governance" />, action: () => navigate("/governance") },
    { id: "gam", category: "Navigation", title: "Go to ESG Gamification", icon: <Trophy size={16} className="text-esg-gamification" />, action: () => navigate("/gamification") },
    { id: "rep", category: "Navigation", title: "Go to Performance Reports", icon: <FileText size={16} />, action: () => navigate("/reports") },
    { id: "prof", category: "Navigation", title: "View Profile settings", icon: <User size={16} />, action: () => navigate("/profile") },
    
    { id: "seed", category: "Actions", title: "Seed Demo ESG Datasets", icon: <Sparkles size={16} className="text-primary animate-pulse" />, action: async () => {
      setSeeding(true);
      showToast("Seeding realistic ESG database...", "info");
      try {
        await api.post("/demo/seed");
        showToast("Demo datasets seeded successfully!", "success");
        if (onSeedSuccess) onSeedSuccess();
      } catch (err) {
        showToast("Failed to seed demo data. Check container logs.", "error");
      } finally {
        setSeeding(false);
        onClose();
      }
    }},
    { id: "add_carb", category: "Actions", title: "Log Carbon Transaction", icon: <Database size={16} className="text-emerald-500" />, action: () => { navigate("/environmental"); onClose(); } },
    { id: "add_csr", category: "Actions", title: "Register Social CSR activity", icon: <Users size={16} className="text-indigo-500" />, action: () => { navigate("/social"); onClose(); } }
  ];

  const filtered = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-950/65 backdrop-blur-md z-50 flex items-start justify-center pt-[15vh] p-4">
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-card border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[500px]"
      >
        <div className="flex items-center gap-3 px-4 border-b border-border/60 h-14 shrink-0">
          <Search size={18} className="text-muted-foreground/80" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/60"
            placeholder="Type a command or navigate pages..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            disabled={seeding}
          />
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-semibold">ESC</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => item.action()}
                    disabled={seeding}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all
                      ${isSelected ? "bg-primary/10 text-primary" : "text-foreground/90 hover:bg-muted/30"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="opacity-80">{item.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground/80">{item.category}</span>
                      </div>
                    </div>
                    {isSelected && <ArrowRight size={14} className="text-primary animate-bounce-horizontal" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No command or location matches your search.
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-border/50 text-[10px] text-muted-foreground flex justify-between shrink-0 bg-muted/20">
          <span>Use <kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd> to select and <kbd className="font-sans">Enter</kbd> to execute</span>
          <span>Command Console</span>
        </div>
      </div>
    </div>
  );
};
