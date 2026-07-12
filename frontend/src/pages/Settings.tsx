import React from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { showToast } from "../components/Toast";

export const Settings: React.FC = () => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Application settings updated successfully.", "success");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground/80">
          Configure EcoPilot platform parameters, active integrations, notification thresholds, and security preferences.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button className="text-left px-4 py-2.5 text-sm font-semibold text-primary bg-primary/10 rounded-lg">
            Platform Configuration
          </button>
          <button className="text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/40 rounded-lg transition-colors">
            Integrations & API
          </button>
          <button className="text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/40 rounded-lg transition-colors">
            Team Members & Security
          </button>
        </div>

        {}
        <div className="md:col-span-2">
          <Card>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold border-b border-border/60 pb-3 mb-2">
                Platform Configuration
              </h2>
              
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Input label="Workspace Name" defaultValue="EcoPilot Enterprise" />
                <Select
                  label="Primary ESG Metric System"
                  options={[
                    { value: "metric", label: "Metric Units (tCO2, Liters)" },
                    { value: "imperial", label: "Imperial Units (Tons, Gallons)" },
                  ]}
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Select
                  label="Default Reporting Standard"
                  options={[
                    { value: "gri", label: "GRI (Global Reporting Initiative)" },
                    { value: "sasb", label: "SASB Standards Alignment" },
                    { value: "tcfd", label: "TCFD Climate Disclosures" },
                  ]}
                />
                <Input label="System Administrator Email" defaultValue="admin@ecopilot.com" type="email" />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-border/60 pt-4 mt-2">
                <Button type="button" variant="outline" size="sm">
                  Discard Changes
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
