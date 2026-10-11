import React from "react";
import BrandLogo from "@/assets/shield-scales-logo.png";

export function ArmourLogo({ className = "w-auto h-10", showText = false, textClassName = "" }) {
  return (
    <div className="inline-flex items-center gap-3">
      <img
        src={BrandLogo}
        alt="ARMOUR Shield & Scales Brand Logo"
        className={`object-contain drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)] shrink-0 ${className}`}
      />
      {showText && (
        <div className={textClassName}>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-wider text-white font-sans uppercase">
              ARMOUR
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
              GRC
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-tight">
            Audit, Risk Mapping &amp; Organizational Unified Remediation
          </p>
        </div>
      )}
    </div>
  );
}

export default ArmourLogo;
