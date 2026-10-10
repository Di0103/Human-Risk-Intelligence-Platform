import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { FiShield, FiBell, FiCheckCircle } from "react-icons/fi";

export function AppLayout({ children }) {
  const { user, profile } = useAuth();

  const role = profile?.role || user?.user_metadata?.role || "employee";
  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "User");

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden print:h-auto print:min-h-screen print:overflow-visible print:bg-white print:text-slate-900 print:block">
      {/* 1. Left Sidebar (Hidden in print) */}
      <Sidebar />

      {/* 2. Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:h-auto print:w-full print:block print:min-h-screen">
        {/* Top Header (Hidden in print) */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10 print:hidden">
          {/* Header Left: Platform Status */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ISO 27001:2022 Posture: Active & Compliant
            </span>
          </div>

          {/* Header Right: Quick Indicators */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <FiCheckCircle className="text-emerald-400 text-sm" />
              <span>Security Controls Synced</span>
            </div>

            <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

            {/* Quick Profile Summary */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight">
                  {fullName}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {role.replace("_", " ")}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shadow-inner">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body (Expands to 100% width and height in print) */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8 print:p-0 print:m-0 print:overflow-visible print:bg-white print:w-full print:block">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
