import React from "react";

export function ArmourLogo({ className = "w-6 h-6", showText = false, textClassName = "" }) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="armourShieldGrad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="armourBorderGrad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="50%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="armourGoldScales" x1="16" y1="14" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>

          {/* Outer Shield Path */}
          <path
            d="M32 4 C44 4 56 9 56 19 C56 38 44 52 32 60 C20 52 8 38 8 19 C8 9 20 4 32 4 Z"
            fill="url(#armourShieldGrad)"
            stroke="url(#armourBorderGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Shield Inset Accent Line */}
          <path
            d="M32 8 C41 8 51 12 51 20 C51 36 41 48 32 55 C23 48 13 36 13 20 C13 12 23 8 32 8 Z"
            stroke="#93C5FD"
            strokeWidth="1"
            strokeOpacity="0.35"
            fill="none"
          />

          {/* Scales of Justice / Governance Center Post */}
          <path
            d="M31 16 H33 V44 H31 Z"
            fill="url(#armourGoldScales)"
            stroke="#FDE047"
            strokeWidth="0.5"
          />
          {/* Top Ring / Finial */}
          <circle cx="32" cy="14" r="2.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="0.8" />

          {/* Scales Balance Beam / Crossbar */}
          <path
            d="M17 21 C17 20.2 17.5 19.8 18.5 19.8 H45.5 C46.5 19.8 47 20.2 47 21 C47 21.8 46.5 22.2 45.5 22.2 H18.5 C17.5 22.2 17 21.8 17 21 Z"
            fill="url(#armourGoldScales)"
            stroke="#FEF08A"
            strokeWidth="0.5"
          />
          {/* Central Fulcrum Pivot */}
          <circle cx="32" cy="21" r="2" fill="#FEF08A" stroke="#CA8A04" strokeWidth="0.8" />

          {/* Left Pan Chains */}
          <line x1="20" y1="22" x2="15" y2="30" stroke="#FEF08A" strokeWidth="1" strokeLinecap="round" />
          <line x1="20" y1="22" x2="25" y2="30" stroke="#FEF08A" strokeWidth="1" strokeLinecap="round" />
          {/* Left Pan Bowl */}
          <path
            d="M14 30 Q20 36 26 30 Z"
            fill="url(#armourGoldScales)"
            stroke="#FEF08A"
            strokeWidth="0.8"
          />

          {/* Right Pan Chains */}
          <line x1="44" y1="22" x2="39" y2="30" stroke="#FEF08A" strokeWidth="1" strokeLinecap="round" />
          <line x1="44" y1="22" x2="49" y2="30" stroke="#FEF08A" strokeWidth="1" strokeLinecap="round" />
          {/* Right Pan Bowl */}
          <path
            d="M38 30 Q44 36 50 30 Z"
            fill="url(#armourGoldScales)"
            stroke="#FEF08A"
            strokeWidth="0.8"
          />

          {/* Pedestal Base */}
          <path
            d="M26 44 H38 L39.5 47 H24.5 L26 44 Z"
            fill="url(#armourGoldScales)"
            stroke="#FEF08A"
            strokeWidth="0.6"
          />
        </svg>
      </div>

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
            Audit, Risk Mapping & Organizational Unified Remediation
          </p>
        </div>
      )}
    </div>
  );
}

export default ArmourLogo;
