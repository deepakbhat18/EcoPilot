import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { showToast } from "../components/Toast";
import { Card } from "../components/Card";
import { Shield, Bell, Settings as SettingsIcon } from "lucide-react";

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"platform" | "notifications">("platform");
  const [notifications, setNotifications] = useState<any[]>([]);

  const [workspaceName, setWorkspaceName] = useState("EcoPilot Enterprise");
  const [reportingStandard, setReportingStandard] = useState("gri");
  const [evidenceRequired, setEvidenceRequired] = useState("true");

  const fetchSettings = async () => {
    try {
      const res = await api.get("/config/settings");
      const name = res.data.find((s: any) => s.key === "workspace_name")?.value;
      if (name) setWorkspaceName(name);
      const standard = res.data.find((s: any) => s.key === "reporting_standard")?.value;
      if (standard) setReportingStandard(standard);
      const evidence = res.data.find((s: any) => s.key === "evidence_required")?.value;
      if (evidence) setEvidenceRequired(evidence);
    } catch (err) {
      showToast("Failed to load platform settings", "error");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/config/notifications");
      setNotifications(res.data);
    } catch (err) {
      showToast("Failed to retrieve notification preferences", "error");
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchNotifications();
  }, []);

  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/config/settings", { key: "workspace_name", value: workspaceName });
      await api.post("/config/settings", { key: "reporting_standard", value: reportingStandard });
      await api.post("/config/settings", { key: "evidence_required", value: evidenceRequired });
      showToast("Platform settings updated successfully!", "success");
      fetchSettings();
    } catch (err) {
      showToast("Failed to update platform configuration", "error");
    }
  };

  const handleToggleRead = async (id: number) => {
    try {
      await api.put(`/config/notifications/${id}/read`);
      showToast("Notification marked as read", "success");
      fetchNotifications();
    } catch (err) {
      showToast("Failed to update notification", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="text-primary h-7 w-7" />
          System Settings & Control
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure general workspace parameters, notification thresholds, compliance controls, and user preferences.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <div className="md:col-span-1 flex flex-col gap-2">
          <button
            onClick={() => setActiveSection("platform")}
            className={`text-left px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeSection === "platform"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/40"
            }`}
          >
            <Shield size={16} /> Platform Config
          </button>
          <button
            onClick={() => setActiveSection("notifications")}
            className={`text-left px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeSection === "notifications"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/40"
            }`}
          >
            <Bell size={16} /> Alerts & Notifications
          </button>
        </div>

        <div className="md:col-span-3">
          {activeSection === "platform" && (
            <Card>
              <form onSubmit={handleSavePlatform} className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold border-b border-border/60 pb-3 mb-2">
                  Global ESG Platform Options
                </h2>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <Input
                    label="Workspace Display Name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                  <Select
                    label="Default ESG Disclosures Framework"
                    value={reportingStandard}
                    onChange={(e) => setReportingStandard(e.target.value)}
                    options={[
                      { value: "gri", label: "GRI Standards (Global)" },
                      { value: "sasb", label: "SASB Standards (Capital Markets)" },
                      { value: "tcfd", label: "TCFD Climate-related Risks" }
                    ]}
                  />
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <Select
                    label="Volunteering Proof Mode"
                    value={evidenceRequired}
                    onChange={(e) => setEvidenceRequired(e.target.value)}
                    options={[
                      { value: "true", label: "Require evidence URL on CSR log submissions" },
                      { value: "false", label: "Allow fast submissions without verification" }
                    ]}
                  />
                </div>

                <div className="flex justify-end gap-2.5 border-t border-border/60 pt-4 mt-2">
                  <Button type="submit" variant="primary" size="sm">
                    Save Configuration
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeSection === "notifications" && (
            <Card>
              <h2 className="text-lg font-semibold border-b border-border/60 pb-3 mb-4">
                Active System Alerts & Inbox
              </h2>
              <div className="flex flex-col gap-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Your notification inbox is clean!</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-lg border flex justify-between items-center transition-colors ${
                        notif.is_read
                          ? "bg-muted/20 border-border"
                          : "bg-primary/5 border-primary/30"
                      }`}
                    >
                      <div>
                        <h4 className={`text-sm ${notif.is_read ? "font-normal" : "font-semibold"}`}>{notif.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                        <span className="text-[10px] text-muted-foreground block mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                      {!notif.is_read && (
                        <Button size="sm" variant="outline" onClick={() => handleToggleRead(notif.id)} className="h-7 text-xs">
                          Mark Read
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
