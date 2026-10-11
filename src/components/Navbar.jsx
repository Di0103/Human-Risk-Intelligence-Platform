import React from "react";
import BrandLogo from "@/assets/shield-scales-logo.png";

function Navbar() {
  return (
    <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center border-b border-slate-800 shadow-lg">
      <div className="flex items-center gap-3">
        <img
          src={BrandLogo}
          alt="ARMOUR Brand Logo"
          className="w-auto h-10 object-contain drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
        />
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