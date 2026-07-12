import React from "react";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { FilterPanel } from "../components/FilterPanel";
import { Select } from "../components/Select";
import { Leaf, Users, Building, Trophy } from "lucide-react";

export const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ESG Operations Control Center</h1>
        <p className="text-sm text-muted-foreground/80">
          Real-time summary of EcoPilot environmental, social, and corporate governance compliance.
        </p>
      </div>

      {}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Environmental Score"
          value="78.4 / 100"
          change={4.2}
          icon={<Leaf size={20} />}
          variant="environmental"
        />
        <StatCard
          title="Social Responsibility"
          value="82.1 / 100"
          change={1.5}
          icon={<Users size={20} />}
          variant="social"
        />
        <StatCard
          title="Governance Rating"
          value="91.0 / 100"
          change={-0.3}
          icon={<Building size={20} />}
          variant="governance"
        />
        <StatCard
          title="Gamified Initiatives"
          value="14 Active"
          change={0}
          icon={<Trophy size={20} />}
          variant="gamification"
        />
      </div>

      {}
      <FilterPanel onReset={() => console.log("Reset dashboard filters")}>
        <Select 
          label="Corporate Facility" 
          options={[
            { value: "all", label: "All Facilities" },
            { value: "hq", label: "HQ London" },
            { value: "sf", label: "San Francisco Hub" },
          ]} 
        />
        <Select 
          label="Reporting Cycle" 
          options={[
            { value: "q2", label: "Q2 2026 (Current)" },
            { value: "q1", label: "Q1 2026" },
            { value: "y2025", label: "FY 2025" },
          ]} 
        />
        <Select 
          label="Compliance Target" 
          options={[
            { value: "net-zero", label: "Net Zero 2030" },
            { value: "diversity", label: "Social Inclusion Target" },
            { value: "audit", label: "SEC Audit Alignment" },
          ]} 
        />
      </FilterPanel>

      {}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ChartCard 
          title="Carbon Offsets & Energy Usage Trends" 
          subtitle="Monthly emission tracking compared to net-zero thresholds"
          isLoading={true} 
        >
          <div className="h-full w-full flex items-center justify-center">
            Placeholder Chart
          </div>
        </ChartCard>
        
        <ChartCard 
          title="Diversity & Workforce Distribution" 
          subtitle="Corporate hiring demographics tracking"
          isLoading={true}
        >
          <div className="h-full w-full flex items-center justify-center">
            Placeholder Chart
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
