import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { ArrowLeft, Compass } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-primary/10 text-primary rounded-full inline-flex mb-6 animate-pulse">
        <Compass size={48} />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404 - Out of Scope</h1>
      <p className="text-sm text-muted-foreground/80 max-w-sm mb-8 leading-relaxed">
        The ESG coordinate metrics or audit reports page you are looking for has been moved or doesn't exist.
      </p>
      <Link to="/">
        <Button variant="outline" className="gap-2">
          <ArrowLeft size={16} /> Return to Operations Center
        </Button>
      </Link>
    </div>
  );
};
