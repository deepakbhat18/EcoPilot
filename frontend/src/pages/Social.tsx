import React from "react";
import { StatCard } from "../components/StatCard";
import { TableWrapper } from "../components/TableWrapper";
import { Users, Eye } from "lucide-react";
import { Button } from "../components/Button";

export const Social: React.FC = () => {
  const socialHeaders = ["Initiative Description", "Target Group", "Enrollment Rate", "Status", "Completion Date", "Action"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-esg-social">Social Dashboard</h1>
        <p className="text-sm text-muted-foreground/80">
          Track workplace inclusivity, community engagement, training benchmarks, and labor health safety metrics.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Gender Diversity in Leadership"
          value="42.5 %"
          change={3.4}
          icon={<Users size={20} />}
          variant="social"
        />
        <StatCard
          title="Employee Net Promoter Score"
          value="74.0"
          change={8.2}
          icon={<Users size={20} />}
          variant="social"
        />
        <StatCard
          title="Occupational Safety Audits"
          value="0 Incidents"
          change={0}
          icon={<Users size={20} />}
          variant="social"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Social Responsibility Initiatives</h2>
          <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded">
            Corporate Social Responsibility (CSR)
          </span>
        </div>

        <TableWrapper headers={socialHeaders}>
          <tr>
            <td className="p-4 font-medium">Equal Pay Auditing Cycle</td>
            <td className="p-4">Global Workforce</td>
            <td className="p-4">100 %</td>
            <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">Completed</td>
            <td className="p-4">2026-03-12</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Eye size={12} /> Audit Log
              </Button>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-medium">DEI Awareness Modules</td>
            <td className="p-4">Regional Hubs</td>
            <td className="p-4">84.3 %</td>
            <td className="p-4 text-amber-500 font-semibold">In Progress</td>
            <td className="p-4">2026-08-30</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Eye size={12} /> Audit Log
              </Button>
            </td>
          </tr>
        </TableWrapper>
      </div>
    </div>
  );
};
