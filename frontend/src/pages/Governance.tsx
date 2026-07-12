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
  Shield,
  FileText,
  AlertTriangle,
  ClipboardList,
  Plus,
  Search,
  Bell,
  Check,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

const COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

const policySchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  effective_date: z.string().min(10, "Effective date is required"),
  status: z.string().default("active"),
});

const auditSchema = z.object({
  title: z.string().min(2, "Title is required"),
  scope: z.string().min(2, "Scope is required"),
  findings: z.string().optional(),
  status: z.string().default("draft"),
  audit_date: z.string().min(10, "Audit date is required"),
});

const complianceSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  owner_id: z.coerce.number(),
  due_date: z.string().min(10, "Due date is required"),
  status: z.string().default("open"),
  severity: z.string().default("medium"),
});

export const Governance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "policies" | "audits" | "compliance">("dashboard");
  const [loading, setLoading] = useState(false);
  const [dashData, setDashData] = useState<any>({
    total_policies: 0,
    total_acknowledgements: 0,
    open_issues: 0,
    overdue_issues: 0,
    total_audits: 0,
    pie_chart: []
  });

  const [policies, setPolicies] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<any[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [issueSearch, setIssueSearch] = useState("");
  const [issueStatus, setIssueStatus] = useState("");
  const [issuePage, setIssuePage] = useState(1);
  const totalPages = Math.ceil(totalIssues / 10);

  const [users, setUsers] = useState<any[]>([]);

  const [drawerType, setDrawerType] = useState<"policy" | "audit" | "compliance" | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const polForm = useForm({ resolver: zodResolver(policySchema) });
  const audForm = useForm({ resolver: zodResolver(auditSchema) });
  const compForm = useForm({ resolver: zodResolver(complianceSchema) });

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/governance/dashboard");
      setDashData(res.data);
    } catch (err) {
      showToast("Failed to fetch dashboard", "error");
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await api.get("/policies");
      setPolicies(res.data.items || res.data);
    } catch (err) {
      showToast("Failed to fetch policies", "error");
    }
  };

  const fetchAudits = async () => {
    try {
      const res = await api.get("/governance/audits");
      setAudits(res.data);
    } catch (err) {
      showToast("Failed to fetch audits", "error");
    }
  };

  const fetchComplianceIssues = async () => {
    setLoading(true);
    try {
      const res = await api.get("/governance/compliance-issues", {
        params: {
          search: issueSearch || undefined,
          status: issueStatus || undefined,
          skip: (issuePage - 1) * 10,
          limit: 10
        }
      });
      setComplianceIssues(res.data.items);
      setTotalIssues(res.data.total);
    } catch (err) {
      showToast("Failed to fetch compliance issues", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.items || res.data);
    } catch (err) {
      showToast("Failed to fetch corporate users", "error");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchPolicies();
    fetchAudits();
    fetchComplianceIssues();
    fetchUsers();
  }, [issueSearch, issueStatus, issuePage]);

  const onAddPolicy = async (data: any) => {
    try {
      await api.post("/policies", data);
      showToast("Corporate policy published successfully", "success");
      setDrawerOpen(false);
      fetchPolicies();
      fetchDashboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create policy", "error");
    }
  };

  const onAddAudit = async (data: any) => {
    try {
      await api.post("/governance/audits", data);
      showToast("Audit log created successfully", "success");
      setDrawerOpen(false);
      fetchAudits();
      fetchDashboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create audit", "error");
    }
  };

  const onAddCompliance = async (data: any) => {
    try {
      await api.post("/governance/compliance-issues", data);
      showToast("Compliance issue assigned successfully", "success");
      setDrawerOpen(false);
      fetchComplianceIssues();
      fetchDashboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create compliance issue", "error");
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await api.post(`/governance/policies/${id}/acknowledge`);
      showToast("Policy acknowledged! 10 XP rewarded.", "success");
      fetchPolicies();
      fetchDashboard();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Acknowledgment failed", "error");
    }
  };

  const triggerReminders = async () => {
    try {
      await api.post("/governance/compliance-issues/trigger-reminders");
      showToast("Urgent overdue reminders sent to assignees!", "success");
    } catch (err) {
      showToast("Failed to trigger alerts", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Governance, Risk & Compliance</h1>
          <p className="text-sm text-muted-foreground">
            Manage policies acknowledgements, track audits, and resolve active compliance or regulatory issues.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setDrawerType("policy"); setDrawerOpen(true); }} className="gap-2 bg-esg-governance hover:bg-esg-governance/90">
            <Plus size={16} /> New Policy
          </Button>
          <Button onClick={() => { setDrawerType("audit"); setDrawerOpen(true); }} className="gap-2">
            <Plus size={16} /> Log Audit
          </Button>
          <Button onClick={() => { setDrawerType("compliance"); setDrawerOpen(true); }} className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus size={16} /> Log Issue
          </Button>
        </div>
      </div>

      <div className="flex border-b border-border">
        {(["dashboard", "policies", "audits", "compliance"] as const).map((tab) => (
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
            <StatCard
              title="Active ESG Policies"
              value={dashData.total_policies}
              icon={<Shield size={20} />}
              variant="governance"
            />
            <StatCard
              title="Total Acknowledgements"
              value={dashData.total_acknowledgements}
              icon={<FileText size={20} />}
              variant="governance"
            />
            <StatCard
              title="Open Compliance Issues"
              value={dashData.open_issues}
              icon={<AlertCircle size={20} />}
              variant="governance"
            />
            <StatCard
              title="Overdue Reminders"
              value={dashData.overdue_issues}
              icon={<AlertTriangle size={20} />}
              variant="governance"
              className={dashData.overdue_issues > 0 ? "border-rose-500 bg-rose-50/20 text-rose-700" : ""}
            />
            <StatCard
              title="Audits Registered"
              value={dashData.total_audits}
              icon={<ClipboardList size={20} />}
              variant="governance"
            />
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">Urgent Compliance Tasks</h3>
              <div className="flex justify-between items-center mb-4 p-4 rounded-lg bg-muted/40 border border-border">
                <div>
                  <h4 className="font-semibold text-sm">Send Notification Alerts</h4>
                  <p className="text-xs text-muted-foreground">Notify owners of compliance items approaching or past due dates.</p>
                </div>
                <Button size="sm" onClick={triggerReminders} className="gap-2">
                  <Bell size={14} /> Send Overdue Reminders
                </Button>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">Open Issues Severity Breakdown</h3>
              {dashData.pie_chart?.length === 0 ? (
                <EmptyState title="No active issues" description="Organization is fully compliant!" />
              ) : (
                <div className="h-64 flex items-center justify-center">
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

      {activeTab === "policies" && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Corporate Policies Acknowledgement</h3>
          {policies.length === 0 ? (
            <EmptyState title="No policies found" description="Create a policy using the action button." />
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {policies.map((pol) => (
                <div key={pol.id} className="p-4 rounded-lg border border-border bg-background flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-base flex items-center gap-1.5">
                      <Shield className="text-esg-governance h-4.5 w-4.5" />
                      {pol.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{pol.description}</p>
                  </div>
                  <div className="border-t border-border pt-3 mt-1 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Eff. Date: {pol.effective_date}</span>
                    <Button size="sm" variant="outline" onClick={() => handleAcknowledge(pol.id)} className="h-8 gap-1">
                      <Check size={14} /> Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "audits" && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-lg font-semibold mb-4">Audits & Disclosures Logs</h3>
          {audits.length === 0 ? (
            <EmptyState title="No audits registered" description="Record a new third-party audit to establish compliance." />
          ) : (
            <TableWrapper headers={["Audit Title", "Scope", "Audit Date", "Status", "Findings Summary"]}>
              {audits.map((aud) => (
                <tr key={aud.id} className="border-b border-border">
                  <td className="p-4 font-semibold">{aud.title}</td>
                  <td className="p-4">{aud.scope}</td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(aud.audit_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      aud.status === "final" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    }`}>{aud.status}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{aud.findings || "No findings recorded"}</td>
                </tr>
              ))}
            </TableWrapper>
          )}
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold">Regulatory Compliance Issues List</h3>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Select
                value={issueStatus}
                onChange={(e) => setIssueStatus(e.target.value)}
                className="h-9"
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "open", label: "Open" },
                  { value: "resolved", label: "Resolved" }
                ]}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><LoadingSpinner /></div>
          ) : complianceIssues.length === 0 ? (
            <EmptyState title="No compliance issues found" description="Create an issue or adjust filters." />
          ) : (
            <div className="flex flex-col gap-4">
              <TableWrapper headers={["Title / Description", "Owner ID", "Due Date", "Severity", "Status", "Resolution Alert"]}>
                {complianceIssues.map((issue) => (
                  <tr key={issue.id} className={`border-b border-border ${issue.is_overdue ? "bg-rose-50/15" : ""}`}>
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold">{issue.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{issue.description}</div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">Owner #{issue.owner_id}</td>
                    <td className="p-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        {new Date(issue.due_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        issue.severity === "high" ? "bg-rose-100 text-rose-800" :
                        issue.severity === "medium" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>{issue.severity}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        issue.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>{issue.status}</span>
                    </td>
                    <td className="p-4">
                      {issue.is_overdue && (
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={14} /> OVERDUE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </TableWrapper>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    Showing page <span className="font-semibold">{issuePage}</span> of <span className="font-semibold">{totalPages}</span>
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={() => setIssuePage(issuePage - 1)} disabled={issuePage === 1} variant="outline" size="sm">
                      <ChevronLeft size={16} /> Prev
                    </Button>
                    <Button onClick={() => setIssuePage(issuePage + 1)} disabled={issuePage === totalPages} variant="outline" size="sm">
                      Next <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={
        drawerType === "policy" ? "Publish ESG Corporate Policy" :
        drawerType === "audit" ? "Log Governance Compliance Audit" : "Create Regulatory Compliance Issue"
      }>
        {drawerType === "policy" && (
          <form onSubmit={polForm.handleSubmit(onAddPolicy)} className="flex flex-col gap-4">
            <Input label="Policy Title" {...polForm.register("title")} error={polForm.formState.errors.title?.message as string} />
            <Input label="Description" {...polForm.register("description")} />
            <Input label="Effective Date" type="date" {...polForm.register("effective_date")} error={polForm.formState.errors.effective_date?.message as string} />
            <Button type="submit">Publish Policy</Button>
          </form>
        )}

        {drawerType === "audit" && (
          <form onSubmit={audForm.handleSubmit(onAddAudit)} className="flex flex-col gap-4">
            <Input label="Audit Title" {...audForm.register("title")} error={audForm.formState.errors.title?.message as string} />
            <Input label="Scope of Audit" {...audForm.register("scope")} error={audForm.formState.errors.scope?.message as string} />
            <Input label="Findings Summary" {...audForm.register("findings")} />
            <Input label="Audit Date" type="date" {...audForm.register("audit_date")} error={audForm.formState.errors.audit_date?.message as string} />
            <Select
              label="Status"
              options={[
                { value: "draft", label: "Draft" },
                { value: "final", label: "Final" }
              ]}
              {...audForm.register("status")}
            />
            <Button type="submit">Log Audit</Button>
          </form>
        )}

        {drawerType === "compliance" && (
          <form onSubmit={compForm.handleSubmit(onAddCompliance)} className="flex flex-col gap-4">
            <Input label="Issue Title" {...compForm.register("title")} error={compForm.formState.errors.title?.message as string} />
            <Input label="Description" {...compForm.register("description")} />
            <Select
              label="Assign Owner"
              options={[
                { value: "", label: "Select Corporate Officer" },
                ...users.map((u) => ({
                  value: String(u.id),
                  label: `${u.first_name} ${u.last_name}`
                }))
              ]}
              {...compForm.register("owner_id")}
              error={compForm.formState.errors.owner_id?.message as string}
            />
            <Input label="Due Date" type="date" {...compForm.register("due_date")} error={compForm.formState.errors.due_date?.message as string} />
            <Select
              label="Severity"
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" }
              ]}
              {...compForm.register("severity")}
            />
            <Button type="submit">Assign Compliance Issue</Button>
          </form>
        )}
      </Drawer>
    </div>
  );
};
