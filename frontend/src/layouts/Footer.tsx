import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 border-t border-border/60 bg-card/10 text-center text-xs text-muted-foreground">
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
        <span>
          © {new Date().getFullYear()} EcoPilot. Enterprise ESG Management Platform.
        </span>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#compliance" className="hover:text-foreground transition-colors">Security & Audit</a>
        </div>
      </div>
    </footer>
  );
};
