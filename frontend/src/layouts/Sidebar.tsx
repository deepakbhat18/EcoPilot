import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Leaf, 
  Users, 
  Building, 
  Trophy, 
  FileText, 
  Settings, 
  User,
  X,
  FolderTree,
  Tag,
  Flame,
  ShoppingBag,
  Target,
  FileSpreadsheet,
  Award,
  Gift
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Environmental", path: "/environmental", icon: <Leaf size={18} />, colorClass: "text-esg-environmental" },
    { name: "Social", path: "/social", icon: <Users size={18} />, colorClass: "text-esg-social" },
    { name: "Governance", path: "/governance", icon: <Building size={18} />, colorClass: "text-esg-governance" },
    { name: "Gamification", path: "/gamification", icon: <Trophy size={18} />, colorClass: "text-esg-gamification" },
    { name: "Reports", path: "/reports", icon: <FileText size={18} /> },
    ...(user && ["admin", "esg manager", "department manager"].includes(user.role?.name?.toLowerCase() || "") 
      ? [{ name: "Settings", path: "/settings", icon: <Settings size={18} /> }] 
      : []),
    { name: "Profile", path: "/profile", icon: <User size={18} /> },
  ];

  const masterDataItems = [
    { name: "Departments", path: "/departments", icon: <FolderTree size={16} /> },
    { name: "Categories", path: "/categories", icon: <Tag size={16} /> },
    { name: "Emission Factors", path: "/emission-factors", icon: <Flame size={16} /> },
    { name: "Product Profiles", path: "/product-esg-profiles", icon: <ShoppingBag size={16} /> },
    { name: "Goals", path: "/environmental-goals", icon: <Target size={16} /> },
    { name: "Policies", path: "/policies", icon: <FileSpreadsheet size={16} /> },
    { name: "Badges", path: "/badges", icon: <Award size={16} /> },
    { name: "Rewards", path: "/rewards", icon: <Gift size={16} /> },
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary bg-primary/10 border-r-2 border-r-primary transition-all rounded-r-lg";
  const inactiveStyle = "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all rounded-r-lg";

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-border/60 bg-card text-card-foreground flex flex-col justify-between
          transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 border-b border-border/60 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-lg">
                E
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                EcoPilot
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-1 pr-4 py-4 shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                <span className={item.colorClass}>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-6 py-2 shrink-0">
            <div className="h-px bg-border/60" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mt-4 mb-2">
              Master Data Management
            </h4>
          </div>

          <nav className="flex flex-col gap-1 pr-4 pb-6 flex-1">
            {masterDataItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                <span className="text-muted-foreground/70">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground text-sm">
              {user?.first_name ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : "EA"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-foreground truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : "ESG Analyst"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">{user?.email || "analyst@ecopilot.com"}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
