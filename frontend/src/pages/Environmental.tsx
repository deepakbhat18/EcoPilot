import React from "react";
import { StatCard } from "../components/StatCard";
import { TableWrapper } from "../components/TableWrapper";
import { Leaf, Eye } from "lucide-react";
import { Button } from "../components/Button";

export const Environmental: React.FC = () => {
  const auditHeaders = ["Facility Name", "Scope 1 (tCO2e)", "Scope 2 (tCO2e)", "Recycled Waste", "Audit Date", "Actions"];
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-esg-environmental">Environmental Dashboard</h1>
        <p className="text-sm text-muted-foreground/80">
          Monitor carbon footprints, energy offsets, resource management, and ecological metrics.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Greenhouse Gas Emissions"
          value="1,248 tCO2e"
          change={-8.4}
          icon={<Leaf size={20} />}
          variant="environmental"
        />
        <StatCard
          title="Water Recycling Efficiency"
          value="89.2 %"
          change={2.1}
          icon={<Leaf size={20} />}
          variant="environmental"
        />
        <StatCard
          title="Renewable Power Share"
          value="64.0 %"
          change={12.5}
          icon={<Leaf size={20} />}
          variant="environmental"
        />
      </div>

      {}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Carbon Audit Auditing Reports</h2>
          <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded">
            Scope 1 & 2 Emissions
          </span>
        </div>

        <TableWrapper headers={auditHeaders}>
          <tr>
            <td className="p-4 font-medium">London HQ Complex</td>
            <td className="p-4">124.5</td>
            <td className="p-4">82.1</td>
            <td className="p-4">92 %</td>
            <td className="p-4">2026-06-15</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Eye size={12} /> View Report
              </Button>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-medium">Frankfurt Manufacturing Site</td>
            <td className="p-4">842.0</td>
            <td className="p-4">521.8</td>
            <td className="p-4">76 %</td>
            <td className="p-4">2026-05-30</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <Eye size={12} /> View Report
              </Button>
            </td>
          </tr>
        </TableWrapper>
      </div>
    </div>
  );
};
