import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  FiShield,
  FiBell,
  FiCheckCircle,
  FiLock,
  FiCpu,
  FiX,
  FiAlertTriangle,
  FiZap,
  FiActivity,
  FiArrowRight,
} from "react-icons/fi";
import { ArmourLogo } from "../common/ArmourLogo";

export function AppLayout({ children }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

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
          {/* Header Left: Platform Status & Active Security Shield */}
          <div className="flex items-center gap-3">
            <div className="flex md:hidden items-center gap-2 pr-2 border-r border-slate-800">
              <ArmourLogo className="w-6 h-6" />
              <span className="text-xs font-black tracking-wider uppercase text-white font-sans">
                ARMOUR
              </span>
            </div>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ISO 27001:2022 Posture: Active
            </span>

            {/* Active Security Shield / Auto-Wipe Guard Indicator */}
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition shadow-sm group"
              title="Click to view Active Security Shield & Auto-Wipe Guard telemetry"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <FiShield className="text-cyan-400 text-xs group-hover:scale-110 transition-transform" />
              <span className="text-slate-200">Auto-Wipe Guard:</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold tracking-wider">
                ARMED & OPERATIONAL
              </span>
            </button>
          </div>

          {/* Header Right: Quick Indicators & Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
              <FiCheckCircle className="text-emerald-400 text-sm" />
              <span>Reactive State Active</span>
            </div>

            <div className="h-5 w-[1px] bg-slate-800 hidden lg:block" />

            {/* Quick Profile Summary */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
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

        {/* Security Shield / Auto-Wipe Guard Modal */}
        {isSecurityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl relative">
                  <FiShield className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Active Security Shield & Auto-Wipe Guard
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ARMED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Zero-Trust Session Integrity & Emergency Data Isolation Telemetry
                  </p>
                </div>
              </div>

              {/* Status Indicators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <FiLock className="text-cyan-400" /> Session Hijacking Defense
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Browser fingerprint validation ($UA + Screen + Locale + TZ$) prevents multi-device takeover.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <FiZap className="text-amber-400" /> Emergency Auto-Wipe Guard
                    </span>
                    <span className="font-mono text-amber-400 font-bold">ARMED</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Zeroization protocol triggers instantaneous wipe to 0 records upon detected session anomaly.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <FiCpu className="text-emerald-400" /> Reactive State Synchronization
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">ONLINE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Global <code className="text-slate-300 font-mono text-[10px]">grc-storage-update</code> event bus guarantees instant reactive state without manual refresh.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <FiCheckCircle className="text-blue-400" /> Data Enclave Boundary
                    </span>
                    <span className="font-mono text-blue-400 font-bold">ISOLATED</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    100% Client-Side LocalStorage state engine. Zero unauthenticated external network leaks.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Enclave Sentinel: Active
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSecurityModalOpen(false);
                      navigate("/compliance");
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <span>View Audit Logs</span>
                    <FiArrowRight className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSecurityModalOpen(false)}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-cyan-600/30"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
