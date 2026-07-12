import React from "react";

interface TableWrapperProps {
  headers: string[];
  children: React.ReactNode;
  caption?: string;
  maxHeight?: string; 
}

export const TableWrapper: React.FC<TableWrapperProps> = ({ 
  headers, 
  children, 
  caption,
  maxHeight
}) => {
  return (
    <div 
      className="w-full overflow-x-auto rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm"
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full min-w-[600px] text-left border-collapse relative">
        {caption && <caption className="p-3 text-xs text-muted-foreground/80">{caption}</caption>}
        <thead>
          <tr className="border-b border-border bg-muted/35">
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className="sticky top-0 p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 bg-card/90 backdrop-blur-md z-10"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50 text-sm">
          {children}
        </tbody>
      </table>
    </div>
  );
};
