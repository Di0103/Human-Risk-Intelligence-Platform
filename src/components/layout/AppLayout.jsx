import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {
  FiShield,
  FiLock,
  FiCpu,
  FiX,
  FiZap,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

export function AppLayout({ children }) {
  const navigate = useNavigate();
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden print:h-auto print:min-h-screen print:overflow-visible print:bg-white print:text-slate-900 print:block">
      {/* 1. Left Sidebar (Hidden in print) */}
      <Sidebar />

      {/* 2. Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:h-auto print:w-full print:block print:min-h-screen">
        {/* Top Header with ARMOUR Logo and Security Telemetry */}
        <Header onOpenSecurityModal={() => setIsSecurityModalOpen(true)} />

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
                    Active Security Shield &amp; Auto-Wipe Guard
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ARMED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Zero-Trust Session Integrity &amp; Emergency Data Isolation Telemetry
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
