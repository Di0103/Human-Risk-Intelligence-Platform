import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiGrid,
  FiLayers,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiCheckSquare,
  FiBookOpen,
  FiClipboard,
  FiLogOut,
  FiShield,
  FiUser,
  FiBarChart2,
} from "react-icons/fi";
import { ArmourLogo } from "../common/ArmourLogo";

export function Sidebar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: FiGrid },
    { label: "Organization & Departments", path: "/departments", icon: FiLayers },
    { label: "Employees / Directory", path: "/employees", icon: FiUsers },
    { label: "Compliance & Controls", path: "/compliance", icon: FiCheckSquare },
    { label: "Internal Audit & Findings", path: "/audit", icon: FiShield },
    { label: "Policy Management", path: "/policies", icon: FiFileText },
    { label: "Risk Register", path: "/risks", icon: FiAlertTriangle },
    { label: "Security Training", path: "/training", icon: FiBookOpen },
    { label: "Assessments", path: "/assessment", icon: FiClipboard },
    { label: "Audit & Reports", path: "/reports", icon: FiBarChart2 },
    { label: "My Profile", path: "/profile", icon: FiUser },
  ];

  // Derive role and display badge
  const role = profile?.role || user?.user_metadata?.role || "employee";
  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "GRC User");
  const email = user?.email || "";

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case "admin":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
      case "compliance_officer":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    }
  };

  const formatRoleTitle = (r) => {
    if (r === "compliance_officer") return "Compliance Officer";
    if (r === "admin") return "Admin";
    return "Employee";
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 min-h-screen text-slate-300 select-none print:hidden">
      {/* 1. Brand Logo Header */}
      <div>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 bg-slate-950/40">
          <ArmourLogo className="w-8 h-8" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-white tracking-wider uppercase font-sans">
                ARMOUR
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                GRC
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium tracking-tight truncate leading-tight mt-0.5" title="Audit, Risk Mapping & Organizational Unified Remediation">
              Audit, Risk Mapping & Remediation
            </p>
          </div>
        </div>

        {/* 2. Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* 3. Bottom User Profile Pill & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div
          onClick={() => navigate("/profile")}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 flex items-center justify-between gap-2 cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-inner">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block px-1.5 py-0.2 text-[10px] font-semibold rounded-md border uppercase tracking-wider ${getRoleBadgeStyle(
                    role
                  )}`}
                >
                  {formatRoleTitle(role)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
