import React from "react";

interface TableWrapperProps {
  headers: string[];
  children: React.ReactNode;
  caption?: string;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({ headers, children, caption }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm">
      <table className="w-full min-w-[600px] text-left border-collapse">
        {caption && <caption className="p-3 text-xs text-muted-foreground/80">{caption}</caption>}
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/90"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 text-sm">
          {children}
        </tbody>
      </table>
    </div>
  );
};
