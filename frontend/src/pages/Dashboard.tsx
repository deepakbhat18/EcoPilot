import React, { useState, useEffect } from "react";
<<<<<<< HEAD
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
=======
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

>>>>>>> origin/main
  const [envData, setEnvData] = useState<any>({
    total_emission: 0,
    highest_emission_department: { name: "N/A", value: 0 },
    lowest_emission_department: { name: "N/A", value: 0 },
    goal_completion_percentage: 0,
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
    }
  };

  useEffect(() => {
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
          icon={<Leaf size={18} />}
          variant="environmental"
        />

        <StatCard
<<<<<<< HEAD
          title="Social Responsibility"
          value={`${socialScore.toFixed(1)} / 100`}
          change={1.8}
=======
          title="Social Score (S)"
          value={`${esgSummary.social_score || 78}/100`}
          change={1.5}
          changeLabel="Participation metrics active"
>>>>>>> origin/main
          icon={<Users size={18} />}
          variant="social"
        />

        <StatCard
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
              </div>
            </div>
          </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
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
