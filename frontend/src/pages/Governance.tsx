import React from "react";
import { StatCard } from "../components/StatCard";
import { TableWrapper } from "../components/TableWrapper";
import { Building, ShieldCheck } from "lucide-react";
import { Button } from "../components/Button";

export const Governance: React.FC = () => {
  const govHeaders = ["Filing Type", "Regulatory Body", "Status", "Review Score", "Last Submitted", "Details"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-esg-governance">Governance Dashboard</h1>
        <p className="text-sm text-muted-foreground/80">
          Supervise corporate integrity, board metrics, shareholder rights, compliance controls, and privacy standards.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Board Independence Rate"
          value="88.0 %"
          change={1.2}
          icon={<Building size={20} />}
          variant="governance"
        />
        <StatCard
          title="Shareholder Vote Turnout"
          value="94.2 %"
          change={0.5}
          icon={<Building size={20} />}
          variant="governance"
        />
        <StatCard
          title="Regulatory Approvals"
          value="100 % Audit"
          change={0}
          icon={<Building size={20} />}
          variant="governance"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Regulatory Disclosures & Filings</h2>
          <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded">
            Compliance Audit Log
          </span>
        </div>

        <TableWrapper headers={govHeaders}>
          <tr>
            <td className="p-4 font-medium">Securities Exchange Commission SEC 10-K</td>
            <td className="p-4">SEC (United States)</td>
            <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Approved
            </td>
            <td className="p-4">98.4 % Compliance</td>
            <td className="p-4">2026-05-10</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Audit Files
              </Button>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-medium">European Union ESG Disclosure NFRD</td>
            <td className="p-4">ESMA (Europe)</td>
            <td className="p-4 text-amber-500 font-semibold flex items-center gap-1.5">
              Pending Release
            </td>
            <td className="p-4">Under Review</td>
            <td className="p-4">2026-07-02</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Audit Files
              </Button>
            </td>
          </tr>
        </TableWrapper>
      </div>
    </div>
  );
};
