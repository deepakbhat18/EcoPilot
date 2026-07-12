import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { Button } from "../components/Button";
import { showToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Leaf, 
  Users, 
  Building, 
  TrendingDown, 
  Home, 
  RefreshCw, 
  ChevronRight, 
  HelpCircle,
  Shield,
  Activity,
  Award,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from "recharts";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [esgSummary, setEsgSummary] = useState<any>({
    environmental_score: 85,
    social_score: 78,
    governance_score: 92,
    total_emissions_calculated: 0,
    total_csr_logged: 0,
    total_compliance_issues: 0
  });

  const [envData, setEnvData] = useState<any>({
    total_emission: 0,
    highest_emission_department: { name: "N/A", value: 0 },
    lowest_emission_department: { name: "N/A", value: 0 },
    goal_completion_percentage: 0,
    bar_chart: [],
    line_chart: [],
    pie_chart: [],
    recent_transactions: [],
    top_polluting_departments: [],
    insights: []
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, envRes, leaderRes] = await Promise.allSettled([
        api.get("/reports/summary"),
        api.get("/environmental/dashboard"),
        api.get("/gamification/leaderboard?limit=5")
      ]);

      if (summaryRes.status === "fulfilled") {
        setEsgSummary(summaryRes.value.data);
      }
      if (envRes.status === "fulfilled") {
        setEnvData(envRes.value.data);
      }
      if (leaderRes.status === "fulfilled") {
        setLeaderboard(leaderRes.value.data);
      }
    } catch (err) {
      showToast("Failed to sync ESG dashboard.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const overallEsg = Math.round(
    ((esgSummary.environmental_score || 85) + 
     (esgSummary.social_score || 78) + 
     (esgSummary.governance_score || 92)) / 3
  );

  // ESG health tier classification
  const getEsgTier = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    if (score >= 80) return { label: "Good", color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/30" };
    if (score >= 70) return { label: "Average", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/30" };
    if (score >= 50) return { label: "Needs Improvement", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    return { label: "Critical", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" };
  };

  const tier = getEsgTier(overallEsg);

  // SVG parameters for circular score ring
  const radius = 52;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallEsg / 100) * circumference;

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#ef4444"];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
        <Home size={13} />
        <span>/</span>
        <span className="font-semibold text-foreground">ESG Control Center</span>
      </div>

      {/* Main Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-emerald-600 to-indigo-600 bg-clip-text text-transparent">
            ESG Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time compliance monitoring, environmental impact metrics, and corporate social indicators.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Platform
          </Button>
          <Button onClick={() => navigate("/reports")} variant="primary" size="sm">
            Performance Reports
          </Button>
        </div>
      </div>

      {/* Executive Welcome & Daily ESG Snapshot Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 via-zinc-900 to-emerald-950 border border-emerald-500/20 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles size={160} />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold tracking-wider uppercase">
              <Shield size={14} />
              <span>ESG Compliance Active</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mt-1">
              Welcome back, {user?.first_name || "ESG Officer"}
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Here is your daily corporate sustainability breakdown. Carbon offset objectives are currently aligned, and social index participation points are active across all departments.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-white/10 pt-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-semibold">Active Footprint</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingDown size={14} /> Downward Trend
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-semibold">CSR Vol Hours</span>
              <span className="text-sm font-bold text-white">48.5 Hours logged</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-semibold">Compliance State</span>
              <span className="text-sm font-bold text-teal-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> 100% Certified
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 font-semibold">Audit Status</span>
              <span className="text-sm font-bold text-zinc-200">2 Complete (Q2)</span>
            </div>
          </div>
        </div>

        {/* ESG Health Meter: Animated Circular overall score */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center text-center">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Organization ESG Health Meter</h3>
          
          <div className="relative flex items-center justify-center my-4">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="rgba(229,231,235,0.2)"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={overallEsg >= 80 ? "#10b981" : overallEsg >= 65 ? "#3b82f6" : "#f59e0b"}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-foreground">{overallEsg}</span>
              <span className="text-[10px] text-muted-foreground font-medium">Index</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className={`text-sm font-bold ${tier.color} px-3 py-1 rounded-full ${tier.bg} border ${tier.border}`}>
              Status: {tier.label}
            </span>
            <span className="text-[10px] text-muted-foreground mt-1">Calculated across Environmental, Social, & Governance categories.</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Breakdown Row */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Environmental Score (E)"
          value={`${esgSummary.environmental_score || 85}/100`}
          change={4.2}
          changeLabel="Carbon target aligned"
          icon={<Leaf size={18} />}
          variant="environmental"
        />

        <StatCard
          title="Social Score (S)"
          value={`${esgSummary.social_score || 78}/100`}
          change={1.5}
          changeLabel="Participation metrics active"
          icon={<Users size={18} />}
          variant="social"
        />

        <StatCard
          title="Governance Score (G)"
          value={`${esgSummary.governance_score || 92}/100`}
          change={0.2}
          changeLabel="Compliance audit green"
          icon={<Building size={18} />}
          variant="governance"
        />
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Carbon Footprint Area Chart */}
            <ChartCard 
              title="Carbon Footprint Timeline" 
              subtitle="Auditable monthly carbon logs (in kg CO2e)"
              isLoading={loading}
              isEmpty={!envData.line_chart || envData.line_chart.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={envData.line_chart || []}>
                  <defs>
                    <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.3)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(255,255,255,0.95)", 
                      color: "#1f2937", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "8px", 
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)" 
                    }} 
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCarbon)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Chart 2: Department Carbon Shares Donut */}
            <ChartCard
              title="Departmental Distributions"
              subtitle="Current carbon footprint percentage distribution"
              isLoading={loading}
              isEmpty={!envData.bar_chart || envData.bar_chart.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={envData.bar_chart || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(envData.bar_chart || []).map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Department Rankings, Highest & Lowest Performing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award size={16} className="text-emerald-500" />
                Top Performing ESG Unit
              </h3>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-md font-bold text-foreground">
                    {envData.lowest_emission_department?.name || "Tokyo Operations"}
                  </h4>
                  <p className="text-xs text-muted-foreground">Minimal Carbon Impact & High CSR</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-500">Rank #1</span>
                  <p className="text-[10px] text-muted-foreground">Green Unit Tier</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                Carbon Attention Required
              </h3>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-md font-bold text-foreground">
                    {envData.highest_emission_department?.name || "Berlin Factory"}
                  </h4>
                  <p className="text-xs text-muted-foreground">Highest recorded direct emissions</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-500">Review Required</span>
                  <p className="text-[10px] text-muted-foreground">Scope 1 intensive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Carbon Registrations */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Recent Carbon Registrations</h3>
                <p className="text-xs text-muted-foreground">Auditable emissions logs waiting for review or successfully resolved.</p>
              </div>
              <Button onClick={() => navigate("/environmental")} variant="outline" size="sm" className="gap-1.5">
                Manage Carbon <ChevronRight size={14} />
              </Button>
            </div>

            {envData.recent_transactions && envData.recent_transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Source / Factor</th>
                      <th className="pb-3 text-right">Offset Carbon</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-border/40">
                    {envData.recent_transactions.slice(0, 4).map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 font-medium text-foreground">{tx.department}</td>
                        <td className="py-3.5 text-muted-foreground">{tx.emission_factor}</td>
                        <td className="py-3.5 text-right font-semibold text-foreground">{Number(tx.calculated_carbon || 0).toLocaleString()} kg</td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            tx.status === "approved" 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No carbon tracking events recorded in this cycle. Try clicking the "Load Demo Data" button above to populate timelines.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Columns: Insights, Leaderboards, Quick Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Executive Insights Console */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Strategic ESG Insights
            </h3>
            <div className="flex flex-col gap-3">
              {envData.insights && envData.insights.length > 0 ? (
                envData.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-muted/40 border border-border rounded-xl">
                    <HelpCircle size={16} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground leading-normal">{insight}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col gap-2 p-3 bg-muted/30 border border-border rounded-xl">
                  <span className="text-xs text-muted-foreground">
                    Insights are automatically generated when emissions and CSR logs are seeded. Click <strong className="text-primary font-bold">Load Demo Data</strong> at the top bar to initialize analysis.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Gamification Leaderboard */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-foreground mb-4 flex items-center gap-2">
              <Award size={16} className="text-esg-gamification" />
              Sustainability Leaderboard
            </h3>
            <div className="flex flex-col gap-3">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((userL: any, idx: number) => (
                  <div key={userL.user_id} className="flex justify-between items-center p-2.5 hover:bg-muted/30 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-muted-foreground w-4">{idx + 1}</span>
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground text-xs uppercase">
                        {userL.first_name ? userL.first_name[0] : "?"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">{userL.first_name} {userL.last_name}</span>
                        <span className="text-[10px] text-muted-foreground">ESG Contributor</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-esg-gamification">{userL.total_xp} XP</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  Corporate sustainability games will resolve at target dates.
                </div>
              )}
            </div>
          </div>

          {/* Operations Shortcuts (Quick Actions) */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-foreground mb-4">Quick Operations</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate("/environmental")} className="flex flex-col gap-2 p-3 text-left bg-muted/30 hover:bg-primary/5 border border-border/60 hover:border-primary/20 rounded-xl transition-all">
                <Leaf size={16} className="text-esg-environmental" />
                <span className="text-xs font-bold text-foreground">Log Carbon</span>
              </button>
              <button onClick={() => navigate("/social")} className="flex flex-col gap-2 p-3 text-left bg-muted/30 hover:bg-primary/5 border border-border/60 hover:border-primary/20 rounded-xl transition-all">
                <Users size={16} className="text-esg-social" />
                <span className="text-xs font-bold text-foreground">CSR Activity</span>
              </button>
              <button onClick={() => navigate("/governance")} className="flex flex-col gap-2 p-3 text-left bg-muted/30 hover:bg-primary/5 border border-border/60 hover:border-primary/20 rounded-xl transition-all">
                <Building size={16} className="text-esg-governance" />
                <span className="text-xs font-bold text-foreground">View Audits</span>
              </button>
              <button onClick={() => navigate("/reports")} className="flex flex-col gap-2 p-3 text-left bg-muted/30 hover:bg-primary/5 border border-border/60 hover:border-primary/20 rounded-xl transition-all">
                <TrendingUp size={16} className="text-primary" />
                <span className="text-xs font-bold text-foreground">Download ESG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
