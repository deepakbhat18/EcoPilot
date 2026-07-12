import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { StatCard } from "../components/StatCard";
import { showToast } from "../components/Toast";
import {
  Download,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from "recharts";

export const Reports: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({
    environmental_score: 85,
    social_score: 78,
    governance_score: 92,
    total_emissions_calculated: 0,
    total_csr_logged: 0,
    total_compliance_issues: 0
  });

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/reports/summary");
      setMetrics(res.data);
    } catch (err) {
      showToast("Failed to fetch ESG summary reports", "error");
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleDownload = async (pillar: "environmental" | "social" | "governance") => {
    try {
      const response = await api.get(`/reports/${pillar}/export`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${pillar}_esg_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`${pillar} CSV report exported successfully!`, "success");
    } catch (err) {
      showToast("Export failed. Please check backend status.", "error");
    }
  };

  const radarData = [
    { subject: "Environmental (E)", value: metrics.environmental_score, fullMark: 100 },
    { subject: "Social (S)", value: metrics.social_score, fullMark: 100 },
    { subject: "Governance (G)", value: metrics.governance_score, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ESG Performance Reports</h1>
          <p className="text-sm text-muted-foreground">
            Analyze corporate environmental, social, and governance metric summaries and download auditable logs.
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Environmental Score"
          value={`${metrics.environmental_score}/100`}
          icon={<Layers className="text-emerald-500" size={20} />}
          variant="environmental"
        />
        <StatCard
          title="Social Score"
          value={`${metrics.social_score}/100`}
          icon={<Layers className="text-indigo-500" size={20} />}
          variant="social"
        />
        <StatCard
          title="Governance Score"
          value={`${metrics.governance_score}/100`}
          icon={<Layers className="text-amber-500" size={20} />}
          variant="governance"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Pillar-wise Report Downloads</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
              <div>
                <h4 className="font-semibold text-sm">Environmental Pillar (E)</h4>
                <p className="text-xs text-muted-foreground">{metrics.total_emissions_calculated} carbon transaction records logged.</p>
              </div>
              <Button onClick={() => handleDownload("environmental")} className="gap-2">
                <Download size={14} /> Download CSV
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
              <div>
                <h4 className="font-semibold text-sm">Social Responsibility Pillar (S)</h4>
                <p className="text-xs text-muted-foreground">{metrics.total_csr_logged} volunteering and training events logged.</p>
              </div>
              <Button onClick={() => handleDownload("social")} className="gap-2">
                <Download size={14} /> Download CSV
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
              <div>
                <h4 className="font-semibold text-sm">Governance & Audits Pillar (G)</h4>
                <p className="text-xs text-muted-foreground">{metrics.total_compliance_issues} active compliance and regulatory concerns.</p>
              </div>
              <Button onClick={() => handleDownload("governance")} className="gap-2">
                <Download size={14} /> Download CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">ESG Score Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Organization Rating" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
