import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Drawer } from "../components/Drawer";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { TableWrapper } from "../components/TableWrapper";
import { showToast } from "../components/Toast";
import {
  Users,
  Award,
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Percent
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
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const activitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  points_multiplier: z.coerce.number().min(1, "Multiplier must be at least 1"),
  start_date: z.string().min(10, "Start date is required"),
  end_date: z.string().min(10, "End date is required"),
  evidence_required: z.boolean().default(true),
  status: z.string().default("active"),
});

const participationSchema = z.object({
  csr_activity_id: z.coerce.number(),
  hours_spent: z.coerce.number().gt(0, "Hours must be greater than 0"),
  evidence_url: z.string().url("Must be a valid URL").or(z.literal("")),
});

const trainingSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  department_id: z.coerce.number().optional(),
  duration_hours: z.coerce.number().gt(0, "Hours must be greater than 0"),
  status: z.string().default("active"),
});

const completionSchema = z.object({
  training_id: z.coerce.number(),
  score: z.coerce.number().min(0).max(100).optional(),
});

const diversitySchema = z.object({
  department_id: z.coerce.number().optional(),
  metric_name: z.string().min(2, "Metric name is required"),
  value: z.coerce.number().min(0, "Value must be positive"),
});

export const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "activities" | "trainings" | "diversity">("dashboard");
  const [loading, setLoading] = useState(false);
  const [dashData, setDashData] = useState<any>({
    total_hours: 0,
    total_participations: 0,
    total_completions: 0,
    active_activities: 0,
    bar_chart: [],
    pie_chart: []
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [totalParticipations, setTotalParticipations] = useState(0);
  const [partSearch, setPartSearch] = useState("");
  const [partStatus, setPartStatus] = useState("");
  const [partPage, setPartPage] = useState(1);
  const totalPages = Math.ceil(totalParticipations / 10);

  const [trainings, setTrainings] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [drawerType, setDrawerType] = useState<"activity" | "participate" | "training" | "complete" | "diversity" | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const actForm = useForm({ resolver: zodResolver(activitySchema) });
  const partForm = useForm({ resolver: zodResolver(participationSchema) });
  const trForm = useForm({ resolver: zodResolver(trainingSchema) });
  const compForm = useForm({ resolver: zodResolver(completionSchema) });
  const divForm = useForm({ resolver: zodResolver(diversitySchema) });

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/social/dashboard");
      setDashData(res.data);
    } catch (err) {
      showToast("Failed to fetch dashboard data", "error");
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get("/social/activities");
      setActivities(res.data);
    } catch (err) {
      showToast("Failed to fetch activities", "error");
    }
  };

  const fetchParticipations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/social/participations", {
        params: {
          search: partSearch || undefined,
          status: partStatus || undefined,
          skip: (partPage - 1) * 10,
          limit: 10
        }
      });
      setParticipations(res.data.items);
      setTotalParticipations(res.data.total);
    } catch (err) {
      showToast("Failed to fetch participations", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainings = async () => {
    try {
      const res = await api.get("/social/trainings");
      setTrainings(res.data);
    } catch (err) {
      showToast("Failed to fetch training courses", "error");
    }
  };

  const fetchCompletions = async () => {
    try {
      const res = await api.get("/social/trainings/completions");
      setCompletions(res.data);
    } catch (err) {
      showToast("Failed to fetch training completions", "error");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.items || res.data);
    } catch (err) {
      showToast("Failed to fetch departments", "error");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchActivities();
    fetchParticipations();
    fetchTrainings();
    fetchCompletions();
    fetchDepartments();
  }, [partSearch, partStatus, partPage]);

  const onAddActivity = async (data: any) => {
    try {
      await api.post("/social/activities", data);
      showToast("CSR Activity created successfully", "success");
      setDrawerOpen(false);
      fetchActivities();
      fetchDashboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create activity", "error");
    }
  };

  const onLogParticipation = async (data: any) => {
    try {
      await api.post("/social/participations", data);
      showToast("Participation logged successfully. Pending review.", "success");
      setDrawerOpen(false);
      fetchParticipations();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to log participation", "error");
    }
  };

  const onAddTraining = async (data: any) => {
    try {
      await api.post("/social/trainings", data);
      showToast("Training course created successfully", "success");
      setDrawerOpen(false);
      fetchTrainings();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create training", "error");
    }
  };

  const onCompleteTraining = async (data: any) => {
    try {
      await api.post("/social/trainings/complete", data);
      showToast("Training completion recorded! Points awarded.", "success");
      setDrawerOpen(false);
      fetchCompletions();
      fetchDashboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to record completion", "error");
    }
  };

  const onAddDiversity = async (data: any) => {
    try {
      await api.post("/social/diversity-metrics", data);
      showToast("Diversity metric recorded successfully", "success");
      setDrawerOpen(false);
      fetchDashboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to record metric", "error");
    }
  };

  const handleApproveReject = async (id: number, status: "approved" | "rejected") => {
    try {
      await api.put(`/social/participations/${id}/approve?status=${status}`);
      showToast(`Participation ${status} successfully`, "success");
      fetchParticipations();
      fetchDashboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Approval action failed", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Social & ESG Engagement</h1>
          <p className="text-sm text-muted-foreground">
            Monitor diversity, training milestones, health & safety, and corporate social responsibility (CSR) activities.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setDrawerType("activity"); setDrawerOpen(true); }} className="gap-2 bg-esg-social hover:bg-esg-social/90">
            <Plus size={16} /> New Activity
          </Button>
          <Button onClick={() => { setDrawerType("participate"); setDrawerOpen(true); }} className="gap-2">
            <Plus size={16} /> Log CSR Hours
          </Button>
          <Button onClick={() => { setDrawerType("training"); setDrawerOpen(true); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus size={16} /> Add Training
          </Button>
        </div>
      </div>

      <div className="flex border-b border-border">
        {(["dashboard", "activities", "trainings", "diversity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <StatCard
              title="Total CSR Hours Logged"
              value={`${dashData.total_hours} hrs`}
              icon={<Clock size={20} />}
              variant="social"
            />
            <StatCard
              title="Total Participations"
              value={dashData.total_participations}
              icon={<Users size={20} />}
              variant="social"
            />
            <StatCard
              title="Training Completions"
              value={dashData.total_completions}
              icon={<BookOpen size={20} />}
              variant="social"
            />
            <StatCard
              title="Active CSR Campaigns"
              value={dashData.active_activities}
              icon={<Award size={20} />}
              variant="social"
            />
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">CSR Participation by Department</h3>
              {dashData.bar_chart?.length === 0 ? (
                <EmptyState title="No data available" description="Record CSR hours to view charts." />
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashData.bar_chart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#10b981" name="Logs Approved" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">Diversity Distribution Metrics</h3>
              {dashData.pie_chart?.length === 0 ? (
                <EmptyState title="No data available" description="Add diversity metrics to view charts." />
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashData.pie_chart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashData.pie_chart.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "activities" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="text-lg font-semibold mb-4">Active Social Campaigns & Initiatives</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activities.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState title="No CSR Activities found" description="Create one above to get started." />
                </div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-base">{act.name}</h4>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        act.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                      }`}>{act.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{act.description}</p>
                    <div className="mt-2 text-xs flex flex-col gap-1 text-muted-foreground">
                      <div>Points Multiplier: <strong className="text-foreground">{act.points_multiplier} XP/hr</strong></div>
                      <div>Start Date: <strong className="text-foreground">{new Date(act.start_date).toLocaleDateString()}</strong></div>
                      <div>End Date: <strong className="text-foreground">{new Date(act.end_date).toLocaleDateString()}</strong></div>
                      <div>Evidence Required: <strong className="text-foreground">{act.evidence_required ? "Yes" : "No"}</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold">CSR Participation Log & Approval Workflow</h3>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <Select
                  value={partStatus}
                  onChange={(e) => setPartStatus(e.target.value)}
                  className="h-9"
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" }
                  ]}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center p-8"><LoadingSpinner /></div>
            ) : participations.length === 0 ? (
              <EmptyState title="No logs found" description="Submit or search CSR hours above." />
            ) : (
              <div className="flex flex-col gap-4">
                <TableWrapper headers={["Activity", "Volunteer Hours", "Points Earned", "Evidence Link", "Status", "Actions"]}>
                  {participations.map((part) => (
                    <tr key={part.id} className="border-b border-border">
                      <td className="p-4 font-medium">{part.activity?.name || `Activity #${part.csr_activity_id}`}</td>
                      <td className="p-4">{part.hours_spent} hours</td>
                      <td className="p-4 font-semibold">{part.points_earned} pts</td>
                      <td className="p-4">
                        {part.evidence_url ? (
                          <a href={part.evidence_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                            <FileText size={12} /> View File
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          part.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                          part.status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                        }`}>{part.status}</span>
                      </td>
                      <td className="p-4">
                        {part.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleApproveReject(part.id, "approved")} className="h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                              <CheckCircle size={14} className="mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleApproveReject(part.id, "rejected")} className="h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                              <XCircle size={14} className="mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </TableWrapper>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">
                      Showing page <span className="font-semibold">{partPage}</span> of <span className="font-semibold">{totalPages}</span>
                    </span>
                    <div className="flex gap-2">
                      <Button onClick={() => setPartPage(partPage - 1)} disabled={partPage === 1} variant="outline" size="sm">
                        <ChevronLeft size={16} /> Prev
                      </Button>
                      <Button onClick={() => setPartPage(partPage + 1)} disabled={partPage === totalPages} variant="outline" size="sm">
                        Next <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "trainings" && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
            <h3 className="text-lg font-semibold mb-4">ESG Training Catalog</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {trainings.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState title="No courses available" description="Add courses using the action button." />
                </div>
              ) : (
                trainings.map((tr) => (
                  <div key={tr.id} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-2">
                    <h4 className="font-semibold text-base">{tr.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tr.description}</p>
                    <div className="mt-2 text-xs flex justify-between text-muted-foreground border-t border-border pt-2">
                      <span>Duration: <strong className="text-foreground">{tr.duration_hours} hrs</strong></span>
                      <span>Dept: <strong className="text-foreground">{tr.department?.name || "All"}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Completions</h3>
              <Button size="sm" onClick={() => { setDrawerType("complete"); setDrawerOpen(true); }}>
                Log Completion
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {completions.length === 0 ? (
                <EmptyState title="No completions yet" description="Mark a course as complete to earn points." />
              ) : (
                completions.map((comp) => (
                  <div key={comp.id} className="p-3 rounded-lg border border-border bg-background flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-sm">{comp.training?.title}</h4>
                      <p className="text-xs text-muted-foreground">Completed: {new Date(comp.completed_at).toLocaleDateString()}</p>
                    </div>
                    {comp.score !== null && (
                      <span className="text-sm font-bold text-primary">{comp.score}%</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "diversity" && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Diversity & Inclusion Metrics</h3>
            <Button onClick={() => { setDrawerType("diversity"); setDrawerOpen(true); }} className="gap-2">
              <Plus size={16} /> Record Metric
            </Button>
          </div>
          {dashData.pie_chart?.length === 0 ? (
            <EmptyState title="No metrics recorded" description="Submit a diversity metric to visualize statistics." />
          ) : (
            <TableWrapper headers={["Metric Name", "Value (%)", "Recorded Date"]}>
              {dashData.pie_chart.map((m: any, idx: number) => (
                <tr key={idx} className="border-b border-border">
                  <td className="p-4 font-semibold">{m.name}</td>
                  <td className="p-4 font-medium flex items-center gap-1">
                    <Percent size={14} className="text-primary" /> {m.value}%
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">Recently</td>
                </tr>
              ))}
            </TableWrapper>
          )}
        </div>
      )}

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={
        drawerType === "activity" ? "Create CSR Activity Campaign" :
        drawerType === "participate" ? "Log CSR Volunteering Hours" :
        drawerType === "training" ? "Add ESG Course" :
        drawerType === "complete" ? "Log Course Completion" : "Record Diversity Metric"
      }>
        {drawerType === "activity" && (
          <form onSubmit={actForm.handleSubmit(onAddActivity)} className="flex flex-col gap-4">
            <Input label="Campaign Name" {...actForm.register("name")} error={actForm.formState.errors.name?.message as string} />
            <Input label="Description" {...actForm.register("description")} />
            <Input label="Points Multiplier (XP per hour)" type="number" {...actForm.register("points_multiplier")} error={actForm.formState.errors.points_multiplier?.message as string} />
            <Input label="Start Date" type="date" {...actForm.register("start_date")} error={actForm.formState.errors.start_date?.message as string} />
            <Input label="End Date" type="date" {...actForm.register("end_date")} error={actForm.formState.errors.end_date?.message as string} />
            <div className="flex items-center gap-2 py-2">
              <input type="checkbox" id="evidence_required" {...actForm.register("evidence_required")} className="rounded border-border text-primary" />
              <label htmlFor="evidence_required" className="text-sm font-medium">Require Evidence URL Upload</label>
            </div>
            <Button type="submit">Create Initiative</Button>
          </form>
        )}

        {drawerType === "participate" && (
          <form onSubmit={partForm.handleSubmit(onLogParticipation)} className="flex flex-col gap-4">
            <Select
              label="CSR Activity Campaign"
              options={[
                { value: "", label: "Select Activity" },
                ...activities.map((act) => ({
                  value: String(act.id),
                  label: `${act.name} (${act.points_multiplier} XP/hr)`
                }))
              ]}
              {...partForm.register("csr_activity_id")}
              error={partForm.formState.errors.csr_activity_id?.message as string}
            />
            <Input label="Hours Volunteered" type="number" step="0.1" {...partForm.register("hours_spent")} error={partForm.formState.errors.hours_spent?.message as string} />
            <Input label="Evidence Image/File URL" {...partForm.register("evidence_url")} error={partForm.formState.errors.evidence_url?.message as string} />
            <Button type="submit">Submit Volunteering Log</Button>
          </form>
        )}

        {drawerType === "training" && (
          <form onSubmit={trForm.handleSubmit(onAddTraining)} className="flex flex-col gap-4">
            <Input label="Course Title" {...trForm.register("title")} error={trForm.formState.errors.title?.message as string} />
            <Input label="Description" {...trForm.register("description")} />
            <Select
              label="Department Restriction (Optional)"
              options={[
                { value: "", label: "All Departments" },
                ...departments.map((dept) => ({
                  value: String(dept.id),
                  label: dept.name
                }))
              ]}
              {...trForm.register("department_id")}
            />
            <Input label="Duration (Hours)" type="number" step="0.5" {...trForm.register("duration_hours")} error={trForm.formState.errors.duration_hours?.message as string} />
            <Button type="submit">Save Course</Button>
          </form>
        )}

        {drawerType === "complete" && (
          <form onSubmit={compForm.handleSubmit(onCompleteTraining)} className="flex flex-col gap-4">
            <Select
              label="Training Course"
              options={[
                { value: "", label: "Select Course" },
                ...trainings.map((tr) => ({
                  value: String(tr.id),
                  label: tr.title
                }))
              ]}
              {...compForm.register("training_id")}
              error={compForm.formState.errors.training_id?.message as string}
            />
            <Input label="Assessment Score % (Optional)" type="number" {...compForm.register("score")} error={compForm.formState.errors.score?.message as string} />
            <Button type="submit">Complete Course</Button>
          </form>
        )}

        {drawerType === "diversity" && (
          <form onSubmit={divForm.handleSubmit(onAddDiversity)} className="flex flex-col gap-4">
            <Select
              label="Department"
              options={[
                { value: "", label: "Overall Organization" },
                ...departments.map((dept) => ({
                  value: String(dept.id),
                  label: dept.name
                }))
              ]}
              {...divForm.register("department_id")}
            />
            <Input label="Metric Name (e.g. Gender Balance Leadership, Underrepresented Hires)" {...divForm.register("metric_name")} error={divForm.formState.errors.metric_name?.message as string} />
            <Input label="Percentage Value (0-100)" type="number" step="0.1" {...divForm.register("value")} error={divForm.formState.errors.value?.message as string} />
            <Button type="submit">Record Metric</Button>
          </form>
        )}
      </Drawer>
    </div>
  );
};
