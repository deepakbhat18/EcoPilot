import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FolderTree,
  Tag,
  Flame,
  ShoppingBag,
  Target,
  FileSpreadsheet,
  Award,
  Gift,
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
  AlertCircle
} from "lucide-react";
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

interface MasterDataManagerProps {
  entity:
    | "departments"
    | "categories"
    | "emission-factors"
    | "product-esg-profiles"
    | "environmental-goals"
    | "policies"
    | "badges"
    | "rewards";
}

export const MasterDataManager: React.FC<MasterDataManagerProps> = ({ entity }) => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDesc, setSortDesc] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<any[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const getConfigs = () => {
    switch (entity) {
      case "departments":
        return {
          title: "Departments",
          description: "Manage organizational structures, leadership roles, and headcounts.",
          icon: <FolderTree size={18} />,
          searchPlaceholder: "Search code, name, head...",
          tableHeaders: ["Name", "Code", "Head", "Employee Count", "Status", "Actions"],
          validationSchema: z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            code: z.string().min(2, "Code must be at least 2 characters"),
            head: z.string().optional().or(z.literal("")),
            parent_department_id: z.coerce.number().optional().nullable(),
            employee_count: z.coerce.number().min(0, "Count must be positive").default(0),
            status: z.string().default("active"),
            description: z.string().optional().or(z.literal("")),
          })
        };
      case "categories":
        return {
          title: "Categories",
          description: "Define carbon and ESG categorization taxonomies.",
          icon: <Tag size={18} />,
          searchPlaceholder: "Search category name...",
          tableHeaders: ["Name", "Type", "Status", "Actions"],
          validationSchema: z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            type: z.string().min(2, "Type is required"),
            status: z.string().default("active"),
            description: z.string().optional().or(z.literal("")),
          })
        };
      case "emission-factors":
        return {
          title: "Emission Factors",
          description: "Maintain verified CO2 equivalent emission metrics and standards.",
          icon: <Flame size={18} />,
          searchPlaceholder: "Search name, source, unit...",
          tableHeaders: ["Name", "Category", "Factor", "Unit", "Source", "Status", "Actions"],
          validationSchema: z.object({
            name: z.string().min(2, "Name is required"),
            source: z.string().min(2, "Source is required"),
            category_id: z.coerce.number({ invalid_type_error: "Category is required" }),
            factor: z.coerce.number().min(0, "Factor must be positive"),
            unit: z.string().min(1, "Unit is required"),
            status: z.string().default("active"),
            description: z.string().optional().or(z.literal("")),
          })
        };
      case "product-esg-profiles":
        return {
          title: "Product ESG Profiles",
          description: "Record environmental footprint profiles of system products.",
          icon: <ShoppingBag size={18} />,
          searchPlaceholder: "Search product name...",
          tableHeaders: ["Product Name", "Category", "Emission Factor", "Carbon Rating", "Actions"],
          validationSchema: z.object({
            product_name: z.string().min(2, "Product name is required"),
            category_id: z.coerce.number({ invalid_type_error: "Category is required" }),
            emission_factor_id: z.coerce.number({ invalid_type_error: "Emission factor is required" }),
            carbon_rating: z.string().min(1, "Rating is required"),
            description: z.string().optional().or(z.literal("")),
          })
        };
      case "environmental-goals":
        return {
          title: "Environmental Goals",
          description: "Establish carbon reductions and resource goals for departments.",
          icon: <Target size={18} />,
          searchPlaceholder: "Search goal title...",
          tableHeaders: ["Title", "Department", "Target", "Current Progress", "Deadline", "Status", "Actions"],
          validationSchema: z.object({
            title: z.string().min(2, "Title is required"),
            department_id: z.coerce.number().optional().nullable(),
            target: z.coerce.number().min(0, "Target must be positive"),
            current_progress: z.coerce.number().min(0, "Progress must be positive").default(0),
            deadline: z.string().min(4, "Deadline is required"),
            status: z.string().default("active"),
          })
        };
      case "policies":
        return {
          title: "ESG Policies",
          description: "Publish environmental compliance and governance policy codes.",
          icon: <FileSpreadsheet size={18} />,
          searchPlaceholder: "Search policy title...",
          tableHeaders: ["Title", "Effective Date", "Status", "Actions"],
          validationSchema: z.object({
            title: z.string().min(2, "Title is required"),
            description: z.string().optional().or(z.literal("")),
            effective_date: z.string().min(4, "Effective date is required"),
            status: z.string().default("active"),
          })
        };
      case "badges":
        return {
          title: "Badges",
          description: "Configure recognition badges and achievement rules.",
          icon: <Award size={18} />,
          searchPlaceholder: "Search badge name...",
          tableHeaders: ["Name", "Icon", "Unlock Rule", "Status", "Actions"],
          validationSchema: z.object({
            name: z.string().min(2, "Name is required"),
            description: z.string().optional().or(z.literal("")),
            icon: z.string().min(1, "Icon name is required"),
            unlock_rule: z.string().min(2, "Unlock rule is required"),
            status: z.string().default("active"),
          })
        };
      case "rewards":
        return {
          title: "Rewards",
          description: "Manage system gift points values and items inventory.",
          icon: <Gift size={18} />,
          searchPlaceholder: "Search reward items...",
          tableHeaders: ["Name", "Points Required", "Stock", "Status", "Actions"],
          validationSchema: z.object({
            name: z.string().min(2, "Name is required"),
            description: z.string().optional().or(z.literal("")),
            points_required: z.coerce.number().min(0, "Points must be positive"),
            stock: z.coerce.number().min(0, "Stock must be positive"),
            status: z.string().default("active"),
          })
        };
    }
  };

  const config = getConfigs();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(config.validationSchema)
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        skip: (page - 1) * limit,
        limit,
        sort_by: sortField,
        sort_desc: sortDesc,
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter && entity === "categories") params.type = typeFilter;

      const endpoint = entity === "policies" ? "policies" : entity;
      const res = await api.get(`/${endpoint}`, { params });
      setData(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      showToast("Failed to retrieve master data records.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      if (entity === "departments" || entity === "environmental-goals") {
        const res = await api.get("/departments", { params: { limit: 100 } });
        setDepartments(res.data.items || []);
      }
      if (entity === "emission-factors" || entity === "product-esg-profiles") {
        const catRes = await api.get("/categories", { params: { limit: 100 } });
        setCategories(catRes.data.items || []);
      }
      if (entity === "product-esg-profiles") {
        const factRes = await api.get("/emission-factors", { params: { limit: 100 } });
        setEmissionFactors(factRes.data.items || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
    loadDependencies();
  }, [entity, page, sortField, sortDesc, statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    reset({
      name: "",
      code: "",
      head: "",
      parent_department_id: "",
      employee_count: 0,
      status: "active",
      description: "",
      type: "environmental",
      source: "",
      category_id: "",
      factor: 0,
      unit: "",
      product_name: "",
      emission_factor_id: "",
      carbon_rating: "A",
      title: "",
      target: 0,
      current_progress: 0,
      deadline: new Date().toISOString().split("T")[0],
      effective_date: new Date().toISOString().split("T")[0],
      icon: "leaf",
      unlock_rule: "",
      points_required: 0,
      stock: 0
    });
    setDrawerOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const defaults: any = { ...item };
    if (item.deadline) defaults.deadline = item.deadline.split("T")[0];
    if (item.effective_date) defaults.effective_date = item.effective_date.split("T")[0];
    reset(defaults);
    setDrawerOpen(true);
  };

  const onSubmit = async (values: any) => {
    try {
      const endpoint = entity === "policies" ? "policies" : entity;
      if (editingItem) {
        await api.put(`/${endpoint}/${editingItem.id}`, values);
        showToast("Record updated successfully.", "success");
      } else {
        await api.post(`/${endpoint}`, values);
        showToast("Record created successfully.", "success");
      }
      setDrawerOpen(false);
      loadData();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || "Failed to save record.";
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
      const endpoint = entity === "policies" ? "policies" : entity;
      await api.delete(`/${endpoint}/${deleteId}`);
      showToast("Record successfully deleted.", "success");
      setDeleteConfirmOpen(false);
      loadData();
    } catch (e) {
      showToast("Failed to delete record.", "error");
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      {}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
        <Home size={13} />
        <span>/</span>
        <span>Master Data</span>
        <span>/</span>
        <span className="font-semibold text-foreground">{config.title}</span>
      </div>

      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span className="p-1.5 bg-primary/10 text-primary rounded-lg">{config.icon}</span>
            {config.title}
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1">{config.description}</p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={() => loadData()} variant="outline" size="sm">
            <RefreshCw size={15} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateNew} variant="primary" size="sm">
            <Plus size={15} className="mr-1.5" />
            Add New
          </Button>
        </div>
      </div>

      {}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={`Total ${config.title}`} value={total} variant="default" />
        <StatCard
          title="Active Records"
          value={data.filter((d) => d.status === "active").length}
          variant="environmental"
        />
        <StatCard
          title="Draft/Inactive"
          value={data.filter((d) => d.status === "inactive" || d.status === "draft").length}
          variant="social"
        />
        <StatCard title="Sync Health" value="100%" variant="governance" />
      </div>

      {}
      <div className="flex flex-col md:flex-row gap-3 bg-card border border-border/60 p-4 rounded-xl shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Input
            placeholder={config.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        </form>

        <div className="flex gap-2">
          {entity === "categories" && (
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: "", label: "All Types" },
                { value: "environmental", label: "Environmental" },
                { value: "social", label: "Social" },
                { value: "governance", label: "Governance" },
              ]}
              className="min-w-[140px]"
            />
          )}

          {["departments", "categories", "emission-factors", "environmental-goals", "policies", "badges", "rewards"].includes(entity) && (
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              className="min-w-[140px]"
            />
          )}
        </div>
      </div>

      {}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border/60">
          <LoadingSpinner size="md" />
          <span className="text-xs text-muted-foreground/80 mt-3">Loading master data records...</span>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          title={`No ${config.title} Found`}
          description="Create a new master data entry to start seeding your platform parameter details."
          onAction={handleCreateNew}
          actionLabel="Add New Entry"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="w-full overflow-x-auto rounded-xl border border-border/60 bg-card text-card-foreground shadow-xs">
            <table className="w-full min-w-[700px] text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  {config.tableHeaders.map((hdr, idx) => (
                    <th
                      key={idx}
                      className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 cursor-pointer select-none group"
                      onClick={() => {
                        const lowHdr = hdr.toLowerCase().replace(" ", "_");
                        if (lowHdr !== "actions" && lowHdr !== "category" && lowHdr !== "emission_factor" && lowHdr !== "department") {
                          handleSort(lowHdr);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        {hdr}
                        {hdr !== "Actions" && hdr !== "Category" && hdr !== "Emission Factor" && hdr !== "Department" && renderSortIndicator(hdr.toLowerCase().replace(" ", "_"))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/15 transition-colors">
                    {}
                    {entity === "departments" && (
                      <>
                        <td className="p-4 font-semibold text-foreground truncate">{item.name}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{item.code}</td>
                        <td className="p-4 text-muted-foreground truncate">{item.head || "-"}</td>
                        <td className="p-4 text-muted-foreground">{item.employee_count}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {entity === "categories" && (
                      <>
                        <td className="p-4 font-semibold text-foreground truncate">{item.name}</td>
                        <td className="p-4 text-muted-foreground capitalize">{item.type}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {entity === "emission-factors" && (
                      <>
                        <td className="p-4 font-semibold text-foreground truncate">{item.name}</td>
                        <td className="p-4 text-muted-foreground truncate">{item.category?.name || "-"}</td>
                        <td className="p-4 text-foreground font-semibold">{item.factor}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{item.unit}</td>
                        <td className="p-4 text-muted-foreground truncate">{item.source}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {entity === "product-esg-profiles" && (
                      <>
                        <td className="p-4 font-semibold text-foreground truncate">{item.product_name}</td>
                        <td className="p-4 text-muted-foreground truncate">{item.category?.name || "-"}</td>
                        <td className="p-4 text-muted-foreground truncate">{item.emission_factor?.name || "-"}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-500">
                            {item.carbon_rating}
                          </span>
                        </td>
                      </>
                    )}

                    {entity === "environmental-goals" && (
                      <>
                        <td className="p-4 font-semibold text-foreground truncate">{item.title}</td>
                        <td className="p-4 text-muted-foreground truncate">{item.department?.name || "-"}</td>
                        <td className="p-4 text-foreground font-semibold">{item.target}%</td>
                        <td className="p-4 text-muted-foreground">{item.current_progress}%</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{item.deadline}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {entity === "policies" && (
                      <>
                        <td className="p-4 font-semibold text-foreground truncate">{item.title}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{item.effective_date}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {entity === "badges" && (
                      <>
                        <td className="p-4 font-semibold text-foreground truncate">{item.name}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{item.icon}</td>
                        <td className="p-4 text-muted-foreground truncate font-mono text-xs">{item.unlock_rule}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {entity === "rewards" && (
                      <>
                        <td className="p-4 font-semibold text-foreground truncate">{item.name}</td>
                        <td className="p-4 text-foreground font-semibold">{item.points_required} pts</td>
                        <td className="p-4 text-muted-foreground">{item.stock} units</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}

                    {}
                    <td className="p-4 w-20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-muted-foreground hover:text-primary rounded-lg hover:bg-secondary transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => triggerDelete(item.id)}
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

          {}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <span className="text-xs text-muted-foreground/80">
                Showing page <span className="font-semibold text-foreground">{page}</span> of{" "}
                <span className="font-semibold text-foreground">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft size={16} />
                  Prev
                </Button>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? `Edit ${config.title}` : `Create ${config.title}`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {}
          <div className="flex flex-col gap-4 border-b border-border/60 pb-5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Primary Specifications
            </h4>

            {entity === "departments" && (
              <>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Department Name" required error={errors.name?.message as string} />
                  )}
                />
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Department Code" required error={errors.code?.message as string} />
                  )}
                />
                <Controller
                  name="head"
                  control={control}
                  render={({ field }) => <Input {...field} label="Department Head (Full Name)" />}
                />
              </>
            )}

            {entity === "categories" && (
              <>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Category Name" required error={errors.name?.message as string} />
                  )}
                />
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Category Scope Type"
                      required
                      options={[
                        { value: "environmental", label: "Environmental" },
                        { value: "social", label: "Social" },
                        { value: "governance", label: "Governance" },
                      ]}
                      error={errors.type?.message as string}
                    />
                  )}
                />
              </>
            )}

            {entity === "emission-factors" && (
              <>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Emission Factor Name" required error={errors.name?.message as string} />
                  )}
                />
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Link to Category"
                      required
                      options={[
                        { value: "", label: "Select a Category" },
                        ...categories.map((c) => ({ value: c.id, label: c.name })),
                      ]}
                      error={errors.category_id?.message as string}
                    />
                  )}
                />
                <Controller
                  name="factor"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      label="Factor Value"
                      required
                      error={errors.factor?.message as string}
                    />
                  )}
                />
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Unit (e.g. kg CO2/kWh)" required error={errors.unit?.message as string} />
                  )}
                />
              </>
            )}

            {entity === "product-esg-profiles" && (
              <>
                <Controller
                  name="product_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Product Name"
                      required
                      error={errors.product_name?.message as string}
                    />
                  )}
                />
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Taxonomy Category"
                      required
                      options={[
                        { value: "", label: "Select a Category" },
                        ...categories.map((c) => ({ value: c.id, label: c.name })),
                      ]}
                      error={errors.category_id?.message as string}
                    />
                  )}
                />
                <Controller
                  name="emission_factor_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Carbon Emission Factor"
                      required
                      options={[
                        { value: "", label: "Select Emission Factor" },
                        ...emissionFactors.map((f) => ({ value: f.id, label: `${f.name} (${f.factor} ${f.unit})` })),
                      ]}
                      error={errors.emission_factor_id?.message as string}
                    />
                  )}
                />
                <Controller
                  name="carbon_rating"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Carbon Rating Class"
                      required
                      options={[
                        { value: "A+", label: "A+" },
                        { value: "A", label: "A" },
                        { value: "B", label: "B" },
                        { value: "C", label: "C" },
                        { value: "D", label: "D" },
                        { value: "E", label: "E" },
                      ]}
                      error={errors.carbon_rating?.message as string}
                    />
                  )}
                />
              </>
            )}

            {entity === "environmental-goals" && (
              <>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Goal Title" required error={errors.title?.message as string} />
                  )}
                />
                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Assigned Department"
                      options={[
                        { value: "", label: "Global / Cross-Departmental" },
                        ...departments.map((d) => ({ value: d.id, label: d.name })),
                      ]}
                    />
                  )}
                />
                <Controller
                  name="target"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      label="Target Reduction Percentage (%)"
                      required
                      error={errors.target?.message as string}
                    />
                  )}
                />
                <Controller
                  name="current_progress"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      label="Current Reduction Progress (%)"
                      error={errors.current_progress?.message as string}
                    />
                  )}
                />
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      label="Target Deadline Date"
                      required
                      error={errors.deadline?.message as string}
                    />
                  )}
                />
              </>
            )}

            {entity === "policies" && (
              <>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Policy Title" required error={errors.title?.message as string} />
                  )}
                />
                <Controller
                  name="effective_date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      label="Policy Effective Date"
                      required
                      error={errors.effective_date?.message as string}
                    />
                  )}
                />
              </>
            )}

            {entity === "badges" && (
              <>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Badge Name" required error={errors.name?.message as string} />
                  )}
                />
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Lucide Icon Name" required error={errors.icon?.message as string} />
                  )}
                />
                <Controller
                  name="unlock_rule"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Achievement Unlock Condition/Rule"
                      required
                      error={errors.unlock_rule?.message as string}
                    />
                  )}
                />
              </>
            )}

            {entity === "rewards" && (
              <>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Reward Item Name" required error={errors.name?.message as string} />
                  )}
                />
                <Controller
                  name="points_required"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Required Points"
                      required
                      error={errors.points_required?.message as string}
                    />
                  )}
                />
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Inventory Stock Quantity"
                      required
                      error={errors.stock?.message as string}
                    />
                  )}
                />
              </>
            )}
          </div>

          {}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Metadata & Attributes
            </h4>

            {entity === "departments" && (
              <>
                <Controller
                  name="parent_department_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Parent Department Link"
                      options={[
                        { value: "", label: "No Parent" },
                        ...departments
                          .filter((d) => d.id !== editingItem?.id)
                          .map((d) => ({ value: d.id, label: d.name })),
                      ]}
                    />
                  )}
                />
                <Controller
                  name="employee_count"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Total Department Headcount"
                      error={errors.employee_count?.message as string}
                    />
                  )}
                />
              </>
            )}

            {entity === "emission-factors" && (
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <Input {...field} label="DataSource Standard Reference" required error={errors.source?.message as string} />
                )}
              />
            )}

            {["departments", "categories", "emission-factors", "environmental-goals", "policies", "badges", "rewards"].includes(entity) && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Record Operational Status"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                  />
                )}
              />
            )}

            {["departments", "categories", "emission-factors", "product-esg-profiles", "policies", "badges", "rewards"].includes(entity) && (
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground/95">Description</label>
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full text-sm bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary outline-hidden rounded-lg px-3 py-2 text-foreground"
                    />
                  </div>
                )}
              />
            )}
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
        title="Confirm Deletion"
        message="Are you sure you want to delete this master data record? This action cannot be undone."
      />
    </div>
  );
};
