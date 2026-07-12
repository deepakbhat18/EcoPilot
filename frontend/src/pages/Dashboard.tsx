import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { Button } from "../components/Button";
import { showToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import { 
  Leaf, 
  Users, 
  Building, 
  TrendingUp, 
  Home, 
  RefreshCw, 
  ChevronRight, 
  HelpCircle,
  Shield,
  Activity,
  Award
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
      showToast("Failed to refresh ESG dashboard control panel.", "error");
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

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#ef4444"];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
        <Home size={13} />
        <span>/</span>
        <span className="font-semibold text-foreground">ESG Control Center</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-emerald-600 to-indigo-600 bg-clip-text text-transparent">
            ESG Control Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Corporate operations control panel tracking environmental impact, community outreach, and governance compliance.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Dashboard
          </Button>
          <Button onClick={() => navigate("/reports")} variant="primary" size="sm">
            Performance Reports
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between lg:col-span-2 min-h-[160px] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Shield size={140} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-100/80 font-bold">Aggregate ESG Index</span>
            <div className="flex items-baseline gap-2 mt-4">
              <h2 className="text-5xl font-black">{overallEsg}</h2>
              <span className="text-emerald-200 text-sm font-semibold">/ 100</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-100/90 border-t border-emerald-500/30 pt-3">
            <span>High Performance Tier</span>
            <span className="bg-emerald-500/35 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">SEC Compliant</span>
          </div>
        </div>

        <StatCard
          title="Environmental (E)"
          value={`${esgSummary.environmental_score || 85}/100`}
          change={4.2}
          changeLabel="Carbon target aligned"
          icon={<Leaf size={18} />}
          variant="environmental"
          className="lg:col-span-1"
        />

        <StatCard
          title="Social (S)"
          value={`${esgSummary.social_score || 78}/100`}
          change={1.5}
          changeLabel="Participation metrics active"
          icon={<Users size={18} />}
          variant="social"
          className="lg:col-span-1"
        />

        <StatCard
          title="Governance (G)"
          value={`${esgSummary.governance_score || 92}/100`}
          change={0.2}
          changeLabel="Compliance audit green"
          icon={<Building size={18} />}
          variant="governance"
          className="lg:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard 
              title="Carbon Footprint Timeline" 
              subtitle="Calculated carbon logs over current calendar cycle"
              isLoading={loading}
              isEmpty={!envData.line_chart || envData.line_chart.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={envData.line_chart || []}>
                  <defs>
                    <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.3)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCarbon)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard 
              title="Departmental Emission Shares" 
              subtitle="Total calculated carbon by corporate business unit"
              isLoading={loading}
              isEmpty={!envData.bar_chart || envData.bar_chart.length === 0}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={envData.bar_chart || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.3)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {(envData.bar_chart || []).map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

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
                No carbon tracking events recorded in this billing cycle.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
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
                <div className="text-xs text-muted-foreground py-2">
                  No automated ESG observations available for this reporting cycle.
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-foreground mb-4 flex items-center gap-2">
              <Award size={16} className="text-esg-gamification" />
              Organizational Leaderboard
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
                        <span className="text-[10px] text-muted-foreground">Compliance Officer</span>
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
