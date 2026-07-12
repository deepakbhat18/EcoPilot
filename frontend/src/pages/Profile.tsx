import React from "react";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { Shield, Mail, Calendar } from "lucide-react";

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-sm text-muted-foreground/80">
          Manage your account credentials, security role permissions, and view active sessions.
        </p>
      </div>

      <div className="max-w-xl">
        <Card className="flex flex-col gap-5">
          <div className="flex items-center gap-4 border-b border-border/60 pb-5">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
              {user?.first_name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">
                {user ? `${user.first_name} ${user.last_name}` : "Senior ESG Analyst"}
              </span>
              <span className="text-sm text-muted-foreground capitalize">
                {user?.role?.name || "analyst"} Role
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Email Address</span>
                <span className="font-medium">{user?.email || "analyst@ecopilot.com"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Shield size={16} className="text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Account Role</span>
                <span className="capitalize font-medium">{user?.role?.name || "admin"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Active Since</span>
                <span className="font-medium">July 12, 2026</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
