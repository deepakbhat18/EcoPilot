import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ToastContainer } from "../components/Toast";

export const PageLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-300">
        {}
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />

        {}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>

        {}
        <Footer />
      </div>

      {}
      <ToastContainer />
    </div>
  );
};
