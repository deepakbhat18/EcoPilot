import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Leaf,
  Plus,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Home,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Zap,
  HelpCircle,
  FileText
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { api } from "../services/api";
import { Drawer } from "../components/Drawer";
import { StatCard } from "../components/StatCard";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { showToast } from "../components/Toast";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";

const txSchema = z.object({
  department_id: z.coerce.number({ invalid_type_error: "Department is required" }),
  emission_factor_id: z.coerce.number({ invalid_type_error: "Emission Factor is required" }),
  quantity: z.coerce.number().gt(0, "Quantity must be greater than 0"),
  source: z.string().min(2, "Source is required"),
  reference: z.string().min(2, "Reference code is required"),
  transaction_date: z.string().min(4, "Date is required"),
  status: z.string().default("approved"),
  notes: z.string().optional().or(z.literal("")),
});

export const Environmental: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>({
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

  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalTxs, setTotalTxs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingDash, setLoadingDash] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDesc, setSortDesc] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  const [departments, setDepartments] = useState<any[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(txSchema)
  });

  const loadDashboard = async () => {
    setLoadingDash(true);
    try {
      const res = await api.get("/environmental/dashboard");
      setDashboard(res.data);
    } catch (e) {
      showToast("Failed to retrieve environmental dashboard metrics.", "error");
    } finally {
      setLoadingDash(false);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {
        skip: (page - 1) * limit,
        limit,
        sort_by: sortField,
        sort_desc: sortDesc,
      };
      if (search) params.search = search;
      if (deptFilter) params.department_id = deptFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/environmental/transactions", { params });
      setTransactions(res.data.items || []);
      setTotalTxs(res.data.total || 0);
    } catch (e) {
      showToast("Failed to retrieve carbon transactions.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadRelations = async () => {
    try {
      const dRes = await api.get("/departments", { params: { limit: 100 } });
      setDepartments(dRes.data.items || []);

      const fRes = await api.get("/emission-factors", { params: { limit: 100 } });
      setEmissionFactors(fRes.data.items || []);

      const gRes = await api.get("/environmental-goals", { params: { limit: 100 } });
      setGoals(gRes.data.items || []);
    } catch (e) {}
  };

  useEffect(() => {
    loadDashboard();
    loadRelations();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [page, sortField, sortDesc, deptFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  };

  const handleCreateNew = () => {
    setEditingTx(null);
    reset({
      department_id: "",
      emission_factor_id: "",
      quantity: 0,
      source: "",
      reference: "",
      transaction_date: new Date().toISOString().split("T")[0],
      status: "approved",
      notes: ""
    });
    setDrawerOpen(true);
  };

  const handleEdit = (tx: any) => {
    setEditingTx(tx);
    const defaults = {
      ...tx,
      transaction_date: tx.transaction_date.split("T")[0]
    };
    reset(defaults);
    setDrawerOpen(true);
  };

  const onSubmit = async (values: any) => {
    try {
      if (editingTx) {
        await api.put(`/environmental/transactions/${editingTx.id}`, values);
        showToast("Carbon Transaction updated successfully.", "success");
      } else {
        await api.post("/environmental/transactions", values);
        showToast("Carbon Transaction created successfully.", "success");
      }
      setDrawerOpen(false);
      loadDashboard();
      loadTransactions();
      loadRelations();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || "Failed to save carbon transaction.";
      showToast(msg, "error");
    }
  };

  const triggerDelete = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/environmental/transactions/${deleteId}`);
      showToast("Carbon Transaction successfully deleted.", "success");
      setDeleteConfirmOpen(false);
      loadDashboard();
      loadTransactions();
      loadRelations();
    } catch (e) {
      showToast("Failed to delete carbon transaction.", "error");
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(false);
    }
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  const totalPages = Math.ceil(totalTxs / limit);
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#ef4444"];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
        <Home size={13} />
        <span>/</span>
        <span>Sustainability</span>
        <span>/</span>
        <span className="font-semibold text-foreground">Environmental Management</span>
      </div>

      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Leaf size={24} />
            </span>
            Environmental Management
          </h1>
          <p className="text-base text-muted-foreground mt-1.5">
            Log carbon transactions, track department emissions offsets, and analyze organizational goals.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => { loadDashboard(); loadTransactions(); }} variant="outline" size="md">
            <RefreshCw size={16} className={`mr-2 ${loadingDash || loading ? "animate-spin" : ""}`} />
            Sync Metrics
          </Button>
          <Button onClick={handleCreateNew} variant="primary" size="md">
            <Plus size={16} className="mr-2" />
            Log Carbon
          </Button>
        </div>
      </div>

      {}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Emissions"
          value={`${Number(dashboard.total_emission || 0).toLocaleString()} kg CO2e`}
          icon={<TrendingUp size={20} />}
          variant="environmental"
        />
        <StatCard
          title="Highest Department"
          value={dashboard.highest_emission_department?.name || "N/A"}
          changeLabel={`Emission: ${Number(dashboard.highest_emission_department?.value || 0).toLocaleString()} kg`}
          change={dashboard.highest_emission_department?.value > 0 ? 0 : undefined}
          icon={<AlertCircle size={20} />}
          variant="social"
        />
        <StatCard
          title="Lowest Department"
          value={dashboard.lowest_emission_department?.name || "N/A"}
          changeLabel={`Emission: ${Number(dashboard.lowest_emission_department?.value || 0).toLocaleString()} kg`}
          change={dashboard.lowest_emission_department?.value > 0 ? 0 : undefined}
          icon={<CheckCircle2 size={20} />}
          variant="governance"
        />
        <StatCard
          title="Goal Completion Rate"
          value={`${Number(dashboard.goal_completion_percentage || 0).toFixed(1)}%`}
          icon={<Award size={20} />}
          variant="gamification"
        />
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {}
            <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-xs">
              <h3 className="text-md font-bold text-foreground mb-4">Emissions Trend (This Year)</h3>
              <div className="h-[250px] w-full">
                {dashboard.line_chart?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No timeline activity recorded yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboard.line_chart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.3)" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {}
            <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-xs">
              <h3 className="text-md font-bold text-foreground mb-4">Departmental Breakdown</h3>
              <div className="h-[250px] w-full">
                {dashboard.bar_chart?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No department emissions found.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboard.bar_chart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(229, 231, 235, 0.3)" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {dashboard.bar_chart.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-xs">
            <h3 className="text-md font-bold text-foreground mb-4">Source Category Distribution</h3>
            <div className="h-[200px] w-full flex flex-col md:flex-row items-center justify-center gap-6">
              {dashboard.pie_chart?.length === 0 ? (
                <div className="text-xs text-muted-foreground">No source emissions recorded.</div>
              ) : (
                <>
                  <div className="w-[180px] h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboard.pie_chart}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {dashboard.pie_chart.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {dashboard.pie_chart.map((entry: any, index: number) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-muted-foreground truncate">{entry.name}:</span>
                        <span className="font-semibold text-foreground">{Number(entry.value).toLocaleString()} kg</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3 bg-card border border-border/60 p-4 rounded-xl shadow-xs">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Input
                  placeholder="Search source reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              </form>

              <div className="flex gap-2">
                <Select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  options={[
                    { value: "", label: "All Departments" },
                    ...departments.map((d) => ({ value: d.id, label: d.name })),
                  ]}
                  className="min-w-[150px]"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "approved", label: "Approved" },
                    { value: "pending", label: "Pending" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                  className="min-w-[130px]"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border/60">
                <LoadingSpinner size="md" />
                <span className="text-xs text-muted-foreground mt-3">Fetching carbon records...</span>
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState
                title="No Transactions Logged"
                description="Begin seeding emissions tracking by logging a new department carbon transaction."
                onAction={handleCreateNew}
                actionLabel="Log Carbon"
              />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="w-full overflow-x-auto rounded-xl border border-border/60 bg-card text-card-foreground shadow-xs">
                  <table className="w-full min-w-[700px] text-left border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/20">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 cursor-pointer select-none group w-[22%]" onClick={() => handleSort("department_id")}>
                          <div className="flex items-center gap-1.5">
                            Department
                            {renderSortIndicator("department_id")}
                          </div>
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 w-[22%]">Factor</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 w-[15%]" onClick={() => handleSort("quantity")}>
                          <div className="flex items-center gap-1.5">
                            Quantity
                            {renderSortIndicator("quantity")}
                          </div>
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 w-[16%]" onClick={() => handleSort("calculated_carbon")}>
                          <div className="flex items-center gap-1.5">
                            Carbon (kg)
                            {renderSortIndicator("calculated_carbon")}
                          </div>
                        </th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 w-[15%]">Date</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 w-[10%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/15 transition-colors">
                          <td className="p-4 font-semibold text-foreground truncate">{tx.department?.name || "N/A"}</td>
                          <td className="p-4 text-muted-foreground truncate">{tx.emission_factor?.name || "N/A"}</td>
                          <td className="p-4 text-muted-foreground font-mono text-xs">{tx.quantity} {tx.emission_factor?.unit}</td>
                          <td className="p-4 text-emerald-500 font-bold font-mono">{Number(tx.calculated_carbon).toLocaleString()}</td>
                          <td className="p-4 text-muted-foreground font-mono text-xs">{tx.transaction_date.split("T")[0]}</td>
                          <td className="p-4 w-20">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(tx)}
                                className="p-1 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => triggerDelete(tx.id)}
                                className="p-1 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border/40 pt-4">
                    <span className="text-xs text-muted-foreground/80">
                      Showing page <span className="font-semibold text-foreground">{page}</span> of{" "}
                      <span className="font-semibold text-foreground">{totalPages}</span>
                    </span>
                    <div className="flex gap-2">
                      <Button onClick={() => setPage(page - 1)} disabled={page === 1} variant="outline" size="sm">
                        <ChevronLeft size={16} /> Prev
                      </Button>
                      <Button onClick={() => setPage(page + 1)} disabled={page === totalPages} variant="outline" size="sm">
                        Next <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {}
          <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-xs">
            <h3 className="text-md font-bold text-foreground flex items-center gap-2">
              <Zap size={18} className="text-primary" /> Goal Completion Progress
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              {goals.length === 0 ? (
                <span className="text-xs text-muted-foreground">No active environmental goals found.</span>
              ) : (
                goals.map((g) => {
                  const pct = Math.min((g.current_progress / g.target) * 100, 100);
                  return (
                    <div key={g.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-foreground truncate max-w-[170px]">{g.title}</span>
                        <span className="text-muted-foreground font-mono">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Target: {g.target} kg | Progress: {g.current_progress} kg
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {}
          <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-xs">
            <h3 className="text-md font-bold text-foreground mb-4">Highest Emission Contributor</h3>
            <div className="flex flex-col gap-3">
              {dashboard.top_polluting_departments?.length === 0 ? (
                <span className="text-xs text-muted-foreground">No contributors recorded.</span>
              ) : (
                dashboard.top_polluting_departments.map((dept: any, index: number) => (
                  <div key={dept.department_id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-muted-foreground/60 w-4 font-mono">#{index + 1}</span>
                      <span className="text-foreground font-semibold truncate max-w-[150px]">{dept.name}</span>
                    </div>
                    <span className="font-mono text-rose-500 font-bold">{Number(dept.value).toLocaleString()} kg</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {}
          <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-xs">
            <h3 className="text-md font-bold text-foreground flex items-center gap-2">
              <HelpCircle size={18} className="text-amber-500" /> Executive Green Insights
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              {dashboard.insights?.length === 0 ? (
                <span className="text-xs text-muted-foreground">Computing smart greenhouse diagnostics...</span>
              ) : (
                dashboard.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex gap-2 text-xs items-start bg-secondary/50 p-2.5 rounded-lg border border-border/40">
                    <AlertCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground/90">{insight}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {}
          <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-xs">
            <h3 className="text-md font-bold text-foreground mb-4">Recent Operations Feed</h3>
            <div className="flex flex-col gap-4">
              {dashboard.recent_transactions?.length === 0 ? (
                <span className="text-xs text-muted-foreground">No recent tracking logs.</span>
              ) : (
                dashboard.recent_transactions.map((tx: any) => (
                  <div key={tx.id} className="flex gap-3 text-xs border-b border-border/30 pb-3 last:border-b-0 last:pb-0">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0 h-8 w-8 flex items-center justify-center">
                      <FileText size={14} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-foreground truncate">
                        {tx.department} - {tx.emission_factor}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {Number(tx.calculated_carbon).toLocaleString()} kg CO2e logged on {tx.transaction_date}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingTx ? "Edit Carbon Transaction" : "Log Carbon Transaction"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 border-b border-border/60 pb-5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Primary Specifications
            </h4>

            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Department Name"
                  required
                  options={[
                    { value: "", label: "Select a Department" },
                    ...departments.map((d) => ({ value: d.id, label: d.name })),
                  ]}
                  error={errors.department_id?.message as string}
                />
              )}
            />

            <Controller
              name="emission_factor_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Emission Factor Target"
                  required
                  options={[
                    { value: "", label: "Select an Emission Factor" },
                    ...emissionFactors.map((f) => ({ value: f.id, label: `${f.name} (${f.factor} ${f.unit})` })),
                  ]}
                  error={errors.emission_factor_id?.message as string}
                />
              )}
            />

            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="any"
                  label="Quantity Consumed"
                  required
                  error={errors.quantity?.message as string}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Transaction Details
            </h4>

            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Source/Scope Name"
                  placeholder="e.g. Scope 1 Fleet Diesel"
                  required
                  error={errors.source?.message as string}
                />
              )}
            />

            <Controller
              name="reference"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Reference / Invoice Code"
                  placeholder="e.g. INV-2026-99"
                  required
                  error={errors.reference?.message as string}
                />
              )}
            />

            <Controller
              name="transaction_date"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  label="Log Date"
                  required
                  error={errors.transaction_date?.message as string}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Approval Status"
                  options={[
                    { value: "approved", label: "Approved" },
                    { value: "pending", label: "Pending" },
                    { value: "rejected", label: "Rejected" },
                  ]}
                />
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/95">Operational Notes</label>
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full text-sm bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary outline-hidden rounded-lg px-3 py-2 text-foreground"
                  />
                </div>
              )}
            />
          </div>

          <div className="flex justify-end gap-2.5 mt-4 pt-4 border-t border-border/60">
            <Button type="button" onClick={() => setDrawerOpen(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Drawer>

      {}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Carbon Log Deletion"
        message="Are you sure you want to delete this carbon transaction? This action will subtract emissions calculations and restore department goal offsets."
      />
    </div>
  );
};
