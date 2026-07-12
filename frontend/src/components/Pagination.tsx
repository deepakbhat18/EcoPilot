import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground/90">
            Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <ChevronLeft size={16} />
          </Button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            
            const isNearCurrent = Math.abs(page - currentPage) <= 1;
            const isBound = page === 1 || page === totalPages;

            if (isBound || isNearCurrent) {
              return (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={currentPage === page ? "primary" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            }
            
            
            if (page === 2 && currentPage > 3) {
              return <span key="ellipse-start" className="px-1 text-muted-foreground/60">...</span>;
            }
            if (page === totalPages - 1 && currentPage < totalPages - 2) {
              return <span key="ellipse-end" className="px-1 text-muted-foreground/60">...</span>;
            }
            
            return null;
          })}

          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
