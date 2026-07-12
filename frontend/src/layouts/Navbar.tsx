import React from "react";
import { Menu, Moon, Sun, Bell, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Breadcrumb } from "./Breadcrumb";

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu size={20} />
        </button>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
          title="Toggle Dark Mode"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="relative text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
          title="Security Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </button>

        <div className="h-6 w-[1px] bg-border/60 mx-1" />

        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-foreground">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : "ESG Analyst"}
            </span>
            <span className="text-[10px] text-muted-foreground capitalize">
              {user?.role?.name || "analyst"}
            </span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center justify-center p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
