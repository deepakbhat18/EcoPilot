import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, 
  Users, 
  Building, 
  Trophy, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  Award, 
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  Calendar,
  AlertTriangle
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

import { api } from "../services/api";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { FilterPanel } from "../components/FilterPanel";
import { Select } from "../components/Select";
import { Button } from "../components/Button";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { showToast } from "../components/Toast";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"activities" | "leaderboard">("activities");
  
  // Dashboard states
  const [envData, setEnvData] = useState<any>({
    total_emission: 0,
    highest_emission_department: { name: "N/A", value: 0 },
    lowest_emission_department: { name: "N/A", value: 0 },
    goal_completion_percentage: 0,
    line_chart: [],
    bar_chart: [],
    pie_chart: [],
    recent_transactions: [],
    insights: []
  });

  const [socialData, setSocialData] = useState<any>({
    total_hours: 0,
    total_participations: 0,
    total_completions: 0,
    active_activities: 0,
    bar_chart: [],
    pie_chart: []
  });

  const [govData, setGovData] = useState<any>({
    total_policies: 0,
    total_acknowledgements: 0,
    open_issues: 0,
    overdue_issues: 0,
    total_audits: 0,
    pie_chart: []
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Selected filters (simulated interactive updates)
  const [facility, setFacility] = useState("all");
  const [cycle, setCycle] = useState("q2");
  const [target, setTarget] = useState("net-zero");

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [envRes, socialRes, govRes, leaderRes] = await Promise.all([
        api.get("/environmental/dashboard"),
        api.get("/social/dashboard"),
        api.get("/governance/dashboard"),
        api.get("/gamification/leaderboard?limit=5")
      ]);

      setEnvData(envRes.data);
      setSocialData(socialRes.data);
      setGovData(govRes.data);
      setLeaderboard(leaderRes.data);
    } catch (error) {
      showToast("Failed to load executive ESG data summaries.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === "facility") setFacility(value);
    if (filterType === "cycle") setCycle(value);
    if (filterType === "target") setTarget(value);

    // Simulate standard premium data loading
    setIsFilterLoading(true);
    setTimeout(() => {
      setIsFilterLoading(false);
      showToast("Dashboard scope successfully updated.", "success");
    }, 600);
  };

  const handleResetFilters = () => {
    setFacility("all");
    setCycle("q2");
    setTarget("net-zero");
    setIsFilterLoading(true);
    setTimeout(() => {
      setIsFilterLoading(false);
      showToast("Filters reset to default view.", "success");
    }, 400);
  };

  // Compute calculated metrics
  const envScore = 80.0; // Baseline
  const socialScore = 82.5 + Math.min(socialData.total_hours / 10, 10);
  const govScore = Math.max(95.0 - (govData.open_issues * 3.5), 60.0);
  const esgComposite = parseFloat(((envScore * 0.4) + (socialScore * 0.3) + (govScore * 0.3)).toFixed(1));

  // Gauge configurations
  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (esgComposite / 100) * circumference;

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#EF4444"];

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-12">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded-md" />
        </div>
        <SkeletonLoader variant="stat" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] bg-card border border-border/50 rounded-2xl animate-pulse" />
          <div className="h-[350px] bg-card border border-border/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            ESG Control Center
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Sparkles size={10} /> Enterprise
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Real-time monitoring and reporting of EcoPilot carbon output, corporate responsibility, and compliance metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDashboardData} variant="outline" size="md">
            Sync Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Environmental Score"
          value={`${envScore.toFixed(0)} / 100`}
          change={2.4}
          icon={<Leaf size={18} />}
          variant="environmental"
        />
        <StatCard
          title="Social Responsibility"
          value={`${socialScore.toFixed(1)} / 100`}
          change={1.8}
          icon={<Users size={18} />}
          variant="social"
        />
        <StatCard
          title="Governance Rating"
          value={`${govScore.toFixed(1)} / 100`}
          change={0.5}
          icon={<Building size={18} />}
          variant="governance"
        />
        <StatCard
          title="Gamified Initiatives"
          value={`${socialData.active_activities + 2} Active`}
          change={0}
          icon={<Trophy size={18} />}
          variant="gamification"
        />
      </div>

      {/* Filter panel */}
      <FilterPanel onReset={handleResetFilters}>
        <Select 
          label="Corporate Facility" 
          value={facility}
          onChange={(e) => handleFilterChange("facility", e.target.value)}
          options={[
            { value: "all", label: "All Facilities" },
            { value: "hq", label: "HQ London" },
            { value: "sf", label: "San Francisco Hub" },
          ]} 
        />
        <Select 
          label="Reporting Cycle" 
          value={cycle}
          onChange={(e) => handleFilterChange("cycle", e.target.value)}
          options={[
            { value: "q2", label: "Q2 2026 (Current)" },
            { value: "q1", label: "Q1 2026" },
            { value: "y2025", label: "FY 2025" },
          ]} 
        />
        <Select 
          label="Compliance Target" 
          value={target}
          onChange={(e) => handleFilterChange("target", e.target.value)}
          options={[
            { value: "net-zero", label: "Net Zero 2030" },
            { value: "diversity", label: "Social Inclusion Target" },
            { value: "audit", label: "SEC Audit Alignment" },
          ]} 
        />
      </FilterPanel>

      {/* Executive score row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Ring Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-card border border-border/60 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">Composite ESG Index</h3>
              <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">Weighted Summary</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall ESG health metric index aggregated across environmental output, volunteer hours, and audit statuses.
            </p>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                  stroke="rgba(var(--border), 0.15)"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="stroke-border/40"
                />
                {/* Foreground Progress */}
                <circle
                  stroke="url(#esgGradient)"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference + " " + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="transition-all duration-1000 ease-out"
                />
                {/* Define gradient colors */}
                <defs>
                  <linearGradient id="esgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-foreground tracking-tighter">{esgComposite}</span>
                <span className="text-[9px] text-muted-foreground/80 font-bold uppercase">Index Rating</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/40 border border-border/40 rounded-xl p-3 flex gap-2.5 text-xs items-start">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-muted-foreground leading-relaxed">
              <strong>Compliance Notice:</strong> EcoPilot carbon logs align with SEC disclosure preparedness. 
              {govData.overdue_issues > 0 ? ` Note: ${govData.overdue_issues} overdue policies require attention.` : " Governance parameters are clean."}
            </span>
          </div>
        </motion.div>

        {/* Dynamic Trends Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ChartCard 
            title="Carbon Offsets & Energy Usage Trends" 
            subtitle="Monthly Scope 1 & Scope 2 emission output (kg CO2e)"
            isLoading={isFilterLoading}
            height={300}
          >
            {envData.line_chart?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No emission trends logged yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={envData.line_chart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.15)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(25, 30, 40, 0.85)", 
                      borderColor: "rgba(100, 116, 139, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px"
                    }} 
                  />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCarbon)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </motion.div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Social Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ChartCard 
            title="Corporate CSR Volunteering Engagement" 
            subtitle="Approved CSR participation logs across corporate departments"
            isLoading={isFilterLoading}
            height={280}
          >
            {socialData.bar_chart?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No active CSR participations logged.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={socialData.bar_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.15)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(25, 30, 40, 0.85)", 
                      borderColor: "rgba(100, 116, 139, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px"
                    }} 
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30}>
                    {socialData.bar_chart.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[320px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">ESG Quick Operations</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Direct access workflows to log carbon records, verify policies, or register CSR hours.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 my-4">
            <button 
              onClick={() => navigate("/environmental")} 
              className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/70 border border-border/40 rounded-xl transition-all text-xs font-semibold text-foreground group text-left"
            >
              <div className="flex items-center gap-2">
                <Leaf size={14} className="text-emerald-500" />
                <span>Log Carbon Emissions</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button 
              onClick={() => navigate("/governance")} 
              className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/70 border border-border/40 rounded-xl transition-all text-xs font-semibold text-foreground group text-left"
            >
              <div className="flex items-center gap-2">
                <Building size={14} className="text-blue-500" />
                <span>Acknowledge Corporate Policy</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button 
              onClick={() => navigate("/social")} 
              className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/70 border border-border/40 rounded-xl transition-all text-xs font-semibold text-foreground group text-left"
            >
              <div className="flex items-center gap-2">
                <Users size={14} className="text-purple-500" />
                <span>Record Volunteer Hours</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="text-[10px] text-muted-foreground text-center">
            Logged in as ESG Administrator &bull; Local database active
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity & Leaderboard Tabs (col-span-2) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border/60 rounded-2xl p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("activities")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "activities" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  Activity Stream
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "leaderboard" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  ESG Champions
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground/80 font-mono">Live updates</span>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "activities" ? (
                <motion.div
                  key="activities"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-3"
                >
                  {envData.recent_transactions?.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-10">No recent tracking logs.</div>
                  ) : (
                    envData.recent_transactions.map((tx: any) => (
                      <div key={tx.id} className="flex gap-3 text-xs border-b border-border/30 pb-3 last:border-b-0 last:pb-0 items-center justify-between">
                        <div className="flex gap-3 items-center min-w-0">
                          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center">
                            <Activity size={14} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">
                              {tx.department} - {tx.emission_factor}
                            </span>
                            <span className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                              Reference: {tx.reference} &bull; Date: {tx.transaction_date}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-emerald-500 font-bold shrink-0 text-right">
                          {Number(tx.calculated_carbon).toLocaleString()} kg CO2e
                        </span>
                      </div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-2.5"
                >
                  {leaderboard.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-10">No champions active this reporting cycle.</div>
                  ) : (
                    <div className="w-full overflow-hidden border border-border/50 rounded-xl bg-card">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-muted/15 border-b border-border/50">
                            <th className="p-3 text-[10px] uppercase font-bold text-muted-foreground/80">Rank</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-muted-foreground/80">Employee Name</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-muted-foreground/80">Department</th>
                            <th className="p-3 text-[10px] uppercase font-bold text-muted-foreground/80 text-right">XP Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {leaderboard.map((user, idx) => (
                            <tr key={user.email} className="hover:bg-muted/10 transition-colors">
                              <td className="p-3 font-bold font-mono text-muted-foreground/80">#{idx + 1}</td>
                              <td className="p-3 font-semibold text-foreground">
                                {user.first_name} {user.last_name}
                              </td>
                              <td className="p-3 text-muted-foreground truncate max-w-[120px]">{user.department?.name || "Corporate"}</td>
                              <td className="p-3 text-right font-mono text-primary font-bold">
                                {user.xp_points.toLocaleString()} XP
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border/40 pt-3 mt-4 flex justify-between items-center text-xs">
            <span className="text-muted-foreground/80">Review detailed history reports in our reports module.</span>
            <Button onClick={() => navigate("/reports")} variant="outline" size="sm" className="h-7.5 py-0">
              View Reports <ArrowRight size={12} className="ml-1" />
            </Button>
          </div>
        </motion.div>

        {/* Compliance Alerts (col-span-1) */}
        <motion.div variants={itemVariants} className="bg-card border border-border/60 rounded-2xl p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-amber-500" /> Urgent Compliance Alerts
            </h3>
            
            <div className="flex flex-col gap-3">
              {govData.open_issues === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <ShieldCheck size={28} className="text-emerald-500 mb-1" />
                  <span className="text-xs font-bold text-emerald-500">Fully Compliant</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">No overdue regulatory audits or active compliance violations.</span>
                </div>
              ) : (
                <>
                  {/* High severity overdue alert */}
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 text-xs items-start">
                    <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">Overdue SEC Diversity Review</span>
                      <span className="text-[10px] text-muted-foreground/90 mt-0.5 leading-relaxed">
                        Due date has passed. Compliance assessment must be finalized immediately.
                      </span>
                      <span className="text-[9px] font-bold text-rose-500 uppercase mt-1">Severity: High</span>
                    </div>
                  </div>

                  {/* Medium severity alert */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-xs items-start">
                    <Calendar size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">HQ Logistics Scope 3 Logs</span>
                      <span className="text-[10px] text-muted-foreground/90 mt-0.5 leading-relaxed">
                        Operations department has pending logistics emissions reporting. Due in 14 days.
                      </span>
                      <span className="text-[9px] font-bold text-amber-500 uppercase mt-1">Severity: Medium</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border/40 pt-3 mt-4 text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Active Issues: {govData.open_issues}</span>
            <button onClick={() => navigate("/governance")} className="text-primary hover:underline font-semibold flex items-center">
              Go to GRC <ChevronRight size={12} />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
