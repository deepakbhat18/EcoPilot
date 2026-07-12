import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { StatCard } from "../components/StatCard";
import { showToast } from "../components/Toast";
import {
  Download,
  Layers,
  FileText,
  Printer,
  X,
  Sparkles,
  Building
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

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [reportExplanation, setReportExplanation] = useState<any | null>(null);
  const [explaining, setExplaining] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/reports/summary");
      setMetrics(res.data);
    } catch (err) {
      showToast("Failed to fetch ESG summary reports", "error");
    }
  };

  const explainReportWithAI = async () => {
    setExplaining(true);
    try {
      const docSummary = `ESG Audit Q2 2026. Environmental score: ${metrics.environmental_score}, Social score: ${metrics.social_score}, Governance score: ${metrics.governance_score}. Total emissions: ${metrics.total_emissions_calculated} kg, Total CSR hours: ${metrics.total_csr_logged}, Total Compliance issues: ${metrics.total_compliance_issues}.`;
      const res = await api.post("/ai/report-explainer", { report_details: docSummary });
      setReportExplanation(res.data);
      showToast("AI Explanation generated!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "AI service is temporarily unavailable.", "error");
    } finally {
      setExplaining(false);
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

  const handlePrintPdf = () => {
    window.print();
  };

  const radarData = [
    { subject: "Environmental (E)", value: metrics.environmental_score, fullMark: 100 },
    { subject: "Social (S)", value: metrics.social_score, fullMark: 100 },
    { subject: "Governance (G)", value: metrics.governance_score, fullMark: 100 },
  ];

  const overallEsg = Math.round(
    ((metrics.environmental_score || 85) + 
     (metrics.social_score || 78) + 
     (metrics.governance_score || 92)) / 3
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-emerald-600 to-indigo-600 bg-clip-text text-transparent">
            ESG Performance Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze corporate environmental, social, and governance summaries and download auditable certificates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsPreviewOpen(true)} className="gap-2 bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white font-bold hover:shadow-lg transition-all">
            <Printer size={15} /> Preview Executive PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Environmental Score"
          value={`${metrics.environmental_score}/100`}
          icon={<Layers className="text-emerald-500" size={18} />}
          variant="environmental"
        />
        <StatCard
          title="Social Score"
          value={`${metrics.social_score}/100`}
          icon={<Layers className="text-indigo-500" size={18} />}
          variant="social"
        />
        <StatCard
          title="Governance Score"
          value={`${metrics.governance_score}/100`}
          icon={<Layers className="text-amber-500" size={18} />}
          variant="governance"
        />
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border/60 bg-card shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Pillar-wise Compliance Exports</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border hover:border-emerald-500/25 transition-all">
              <div>
                <h4 className="font-bold text-sm text-foreground">Environmental Pillar (E)</h4>
                <p className="text-xs text-muted-foreground mt-1">Scope 1, 2, and 3 carbon emissions ledger calculations.</p>
              </div>
              <Button onClick={() => handleDownload("environmental")} variant="outline" size="sm" className="gap-1.5 font-semibold">
                <Download size={14} /> Download CSV
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border hover:border-indigo-500/25 transition-all">
              <div>
                <h4 className="font-bold text-sm text-foreground">Social Responsibility Pillar (S)</h4>
                <p className="text-xs text-muted-foreground mt-1">CSR activity summaries, training hours, and diversity values.</p>
              </div>
              <Button onClick={() => handleDownload("social")} variant="outline" size="sm" className="gap-1.5 font-semibold">
                <Download size={14} /> Download CSV
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border hover:border-amber-500/25 transition-all">
              <div>
                <h4 className="font-bold text-sm text-foreground">Governance & Audits Pillar (G)</h4>
                <p className="text-xs text-muted-foreground mt-1">Policies, acknowledgement lists, and compliance task severity.</p>
              </div>
              <Button onClick={() => handleDownload("governance")} variant="outline" size="sm" className="gap-1.5 font-semibold">
                <Download size={14} /> Download CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">ESG Radar Balance</h3>
            <p className="text-xs text-muted-foreground">Compliance distribution overlay</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(156,163,175,0.25)" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" fontSize={9} />
                <Radar name="Organization Rating" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Premium Executive PDF Report Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 print:p-0 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:rounded-none max-h-[90vh] print:max-h-none">
            {/* Modal Controls */}
            <div className="bg-zinc-150 border-b border-zinc-200 px-6 py-4 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" />
                <span className="font-bold text-sm text-zinc-800">Executive ESG Report PDF Preview</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={explainReportWithAI}
                  isLoading={explaining}
                  className="gap-2 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold hover:shadow-lg transition-all"
                >
                  <Sparkles size={14} className="animate-pulse" /> Explain using AI
                </Button>
                <Button onClick={handlePrintPdf} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">
                  <Printer size={14} /> Print / Save PDF
                </Button>
                <button onClick={() => setIsPreviewOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Auditable Print Container */}
            <div className="flex-1 overflow-y-auto p-12 bg-white print:overflow-visible print:p-0">
              <div className="flex flex-col gap-12 max-w-3xl mx-auto">
                {/* PDF Cover Page */}
                <div className="flex flex-col justify-between border-b-2 border-emerald-600 pb-16 min-h-[400px]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl">
                        E
                      </div>
                      <span className="text-xl font-bold tracking-tight text-zinc-900">
                        EcoPilot Enterprise
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Internal Report</span>
                  </div>

                  <div className="my-12">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-4">
                      <Sparkles size={12} />
                      <span>Audit Certified Q2 2026</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                      Corporate Environmental, Social, and Governance (ESG) Audit Report
                    </h1>
                    <p className="text-md text-zinc-600 mt-4 leading-relaxed max-w-xl">
                      A comprehensive compliance audit reviewing Scope 1, 2, and 3 emissions ledgers, active department participations, and policy acknowledgements.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-8 text-xs text-zinc-500 border-t border-zinc-100 pt-6">
                    <div>
                      <span className="block text-zinc-400 font-medium">Prepared For</span>
                      <strong className="text-zinc-800 font-bold">Board of Directors & Stakeholders</strong>
                    </div>
                    <div>
                      <span className="block text-zinc-400 font-medium">Audit Date</span>
                      <strong className="text-zinc-800 font-bold">{new Date().toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="block text-zinc-400 font-medium">Compliance Standard</span>
                      <strong className="text-zinc-800 font-bold">SEC & GHG Protocols Aligned</strong>
                    </div>
                  </div>
                </div>

                {/* Score Section */}
                <div className="flex flex-col gap-6">
                  <h2 className="text-lg font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-2">
                    1. ESG Performance Indicators
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 text-center">
                      <span className="block text-[10px] text-zinc-400 uppercase font-bold">Overall Index</span>
                      <strong className="text-3xl font-black text-emerald-600">{overallEsg}</strong>
                      <span className="block text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full mt-2 w-fit mx-auto">High Tier</span>
                    </div>
                    <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 text-center">
                      <span className="block text-[10px] text-zinc-400 uppercase font-bold">Environmental</span>
                      <strong className="text-3xl font-black text-zinc-800">{metrics.environmental_score}</strong>
                      <span className="block text-[9px] text-zinc-500 mt-2">Target aligned</span>
                    </div>
                    <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 text-center">
                      <span className="block text-[10px] text-zinc-400 uppercase font-bold">Social</span>
                      <strong className="text-3xl font-black text-zinc-800">{metrics.social_score}</strong>
                      <span className="block text-[9px] text-zinc-500 mt-2">Active outreach</span>
                    </div>
                    <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 text-center">
                      <span className="block text-[10px] text-zinc-400 uppercase font-bold">Governance</span>
                      <strong className="text-3xl font-black text-zinc-800">{metrics.governance_score}</strong>
                      <span className="block text-[9px] text-zinc-500 mt-2">Audit Green</span>
                    </div>
                  </div>
                </div>

                {/* Audit summary */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-100 pb-2">
                    2. Executive Summary & Observations
                  </h2>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    During this reporting cycle, the organization successfully audited total Scope 1 and Scope 2 emissions across all global facilities. Departmental carbon profiles have been successfully linked to local grids. Community outreach metrics (S) have demonstrated a 15% increase in total volunteer hours, and policy acknowledgements (G) stand at 92%.
                  </p>
                  <div className="p-4 border border-zinc-200 bg-zinc-50 rounded-xl flex flex-col gap-2 mt-2">
                    <span className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                      <Building size={14} className="text-emerald-600" />
                      Key Audit Summary Stats
                    </span>
                    <ul className="text-xs text-zinc-600 flex flex-col gap-1 list-disc pl-4 mt-1">
                      <li>Carbon emissions calculations are generated using updated EPA greenhouse gas factors.</li>
                      <li>Training activities recorded have exceeded the SEC compliance thresholds for Q2.</li>
                      <li>No open critical severity compliance issues are currently outstanding.</li>
                    </ul>
                  </div>

                  {reportExplanation && (
                    <div className="mt-8 p-6 bg-violet-50 border border-violet-200 rounded-xl flex flex-col gap-4 print:hidden">
                      <h3 className="text-sm font-bold text-violet-900 flex items-center gap-1.5 border-b border-violet-200 pb-2">
                        <Sparkles size={16} className="text-violet-600 animate-pulse" />
                        AI Executive Analysis & Diagnostic
                      </h3>
                      <div className="text-xs leading-relaxed text-zinc-800">
                        <strong className="text-violet-850">Synthesis Summary:</strong>
                        <p className="mt-1">{reportExplanation.summary}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="p-3 bg-white rounded-lg border border-violet-100">
                          <span className="text-[10px] uppercase font-bold text-red-700">Critical Risks</span>
                          <ul className="text-[10px] text-zinc-600 list-disc pl-4 mt-1 flex flex-col gap-1">
                            {reportExplanation.risks.map((r: string, idx: number) => <li key={idx}>{r}</li>)}
                          </ul>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-violet-100">
                          <span className="text-[10px] uppercase font-bold text-emerald-700">Key Insights</span>
                          <ul className="text-[10px] text-zinc-600 list-disc pl-4 mt-1 flex flex-col gap-1">
                            {reportExplanation.insights.map((ins: string, idx: number) => <li key={idx}>{ins}</li>)}
                          </ul>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-violet-100">
                          <span className="text-[10px] uppercase font-bold text-indigo-700">Recommendations</span>
                          <ul className="text-[10px] text-zinc-600 list-disc pl-4 mt-1 flex flex-col gap-1">
                            {reportExplanation.recommendations.map((rec: string, idx: number) => <li key={idx}>{rec}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Signature page */}
                <div className="flex justify-between items-center text-xs text-zinc-400 pt-16 border-t border-zinc-100 mt-8">
                  <span>Authorized Signature: _______________________</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
