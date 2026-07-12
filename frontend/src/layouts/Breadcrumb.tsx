import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium overflow-hidden select-none">
      <Link 
        to="/" 
        className="hover:text-foreground transition-colors flex items-center gap-1.5 text-muted-foreground/80"
      >
        <Home size={13} />
        <span className="hidden sm:inline">Home</span>
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        
        
        const displayLabel = value
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} className="text-muted-foreground/35 flex-shrink-0" />
            {isLast ? (
              <span className="text-foreground font-semibold truncate max-w-[100px] sm:max-w-none">
                {displayLabel}
              </span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-foreground transition-colors truncate max-w-[100px] sm:max-w-none"
              >
                {displayLabel}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
