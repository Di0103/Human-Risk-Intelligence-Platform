import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "@/assets/shield-scales-logo.png";
import {
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";

export function Header({ onOpenSecurityModal }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const role = profile?.role || user?.user_metadata?.role || "employee";
  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "User");

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10 print:hidden select-none">
      {/* Header Left: ARMOUR Brand Logo & Security Shield Telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
          <img
            src={BrandLogo}
            alt="ARMOUR Shield and Scales Brand Logo"
            className="w-auto h-10 object-contain drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-transform hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider uppercase text-white font-sans leading-none">
              ARMOUR
            </span>
            <span className="text-[9px] text-blue-400 font-mono tracking-wider leading-none mt-1 hidden sm:inline font-bold">
              GRC v1.0 • UNIFIED DEFENSE
            </span>
          </div>
        </div>

        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ISO 27001:2022 Posture: Active
        </span>

        {/* Active Security Shield / Auto-Wipe Guard Indicator */}
        <button
          type="button"
          onClick={onOpenSecurityModal}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition shadow-sm group cursor-pointer"
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
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-medium">
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
  );
}

export default Header;
