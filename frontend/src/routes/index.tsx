import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GuestLayout } from "../layouts/GuestLayout";
import { ProtectedRouteLayout } from "../layouts/ProtectedRouteLayout";
import { PageLayout } from "../layouts/PageLayout";

import { Dashboard } from "../pages/Dashboard";
import { Environmental } from "../pages/Environmental";
import { Social } from "../pages/Social";
import { Governance } from "../pages/Governance";
import { Gamification } from "../pages/Gamification";
import { Reports } from "../pages/Reports";
import { Settings } from "../pages/Settings";
import { Profile } from "../pages/Profile";
import { Login } from "../pages/Login";
import { ForgotPassword } from "../pages/ForgotPassword";
import { NotFound } from "../pages/NotFound";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRouteLayout />}>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/environmental" element={<Environmental />} />
          <Route path="/social" element={<Social />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
