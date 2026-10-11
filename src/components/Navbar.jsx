import React from "react";
import BrandLogo from "@/assets/brand-logo.png";

function Navbar() {
  return (
    <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center border-b border-slate-800 shadow-lg">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <img
            src={BrandLogo}
            alt="ARMOUR Brand Logo"
            className="w-11 h-11 object-contain drop-shadow-[0_4px_12px_rgba(37,99,235,0.45)]"
          />
        </div>
        <div>
          <h2 className="text-sm font-black tracking-wider uppercase font-sans">ARMOUR</h2>
          <p className="text-[10px] text-slate-400">Audit, Risk Mapping &amp; Organizational Unified Remediation</p>
        </div>
      </div>

      <div>
        <span className="text-xs text-slate-300">Enterprise GRC Workspace</span>
      </div>
    </header>
  );
}

export default Navbar;