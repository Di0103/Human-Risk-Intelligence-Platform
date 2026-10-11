import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { localStorageDb } from "../utils/localStorageDb";
import {
  FiUser,
  FiMail,
  FiShield,
  FiHash,
  FiLogOut,
  FiCalendar,
  FiDatabase,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiTrash2,
  FiLayers,
  FiCheck,
} from "react-icons/fi";

function Profile() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "User");

  const email = profile?.email || user?.email || "Not specified";
  const role = profile?.role || user?.user_metadata?.role || "employee";
  const initial = (fullName[0] || "U").toUpperCase();

  const roleFormatted =
    role === "admin"
      ? "Administrator"
      : role === "compliance_officer"
      ? "Compliance Officer"
      : "Employee";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Active Member";

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Reset workspace to clean 0-record state
  const handleResetTenantData = () => {
    if (
      !window.confirm(
        "Are you sure you want to reset your workspace? This will purge all your departments, employees, policies, risks, trainings, assessments, and audit records, restoring your dashboard to a clean 0-record state."
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      localStorageDb.resetWorkspace("empty");
      showFeedback(
        "success",
        "Workspace successfully wiped to a clean state with 0 records."
      );
    } catch (err) {
      showFeedback("error", `Failed to reset workspace: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  // Seed sample enterprise workspace template
  const handleSeedTenantDefaults = () => {
    setSeeding(true);
    try {
      localStorageDb.resetWorkspace("defaults");
      showFeedback(
        "success",
        "Enterprise starter template seeded into your workspace!"
      );
    } catch (err) {
      showFeedback("error", `Failed to seed template data: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  // Emergency Security Auto-Wipe & Lockout
  const handleEmergencySecurityAutoWipe = async () => {
    if (
      !window.confirm(
        "EMERGENCY SECURITY ACTION: Are you sure you want to trigger a Security Auto-Wipe? This will immediately purge all local compliance records to a clean 0-record state, terminate active session tokens, and lock the platform."
      )
    ) {
      return;
    }

    localStorageDb.triggerSecurityAutoWipe(
      "Manual Administrator Security Action: Emergency Lockout Activated"
    );
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm transition-all shadow-lg ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <FiCheckCircle className="text-base shrink-0" />
          ) : (
            <FiAlertTriangle className="text-base shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Page Heading */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
          <FiUser className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            User Account & Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            View your verified credentials, role-based governance privileges, and session information.
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-blue-500/20 shrink-0 border border-blue-400/30">
            {initial}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {fullName}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5" />
                {roleFormatted}
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-xs font-medium">
                Verified RBAC Profile
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <FiUser className="w-3.5 h-3.5 text-blue-400" />
              Full Name
            </div>
            <p className="font-semibold text-base text-white mt-1">{fullName}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <FiMail className="w-3.5 h-3.5 text-indigo-400" />
              Email Address
            </div>
            <p className="font-semibold text-base text-white mt-1 break-all">{email}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <FiShield className="w-3.5 h-3.5 text-emerald-400" />
              Assigned Governance Role
            </div>
            <p className="font-semibold text-base text-white mt-1">{roleFormatted}</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <FiHash className="w-3.5 h-3.5 text-amber-400" />
              Profile UID
            </div>
            <p className="font-mono text-xs text-slate-300 mt-1.5 truncate">
              {user?.id || "N/A"}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-xl sm:col-span-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <FiCalendar className="w-3.5 h-3.5 text-purple-400" />
              Account Created
            </div>
            <p className="font-semibold text-sm text-slate-200 mt-1">{memberSince}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Human Risk Intelligence Platform • Enterprise GRC v1.0
          </p>

          <button
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
            className="inline-flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <FiLogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Local Workspace & Persistence Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <FiDatabase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Enterprise Workspace & Local State Engine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero-latency LocalStorage engine guarantees data is partitioned and persisted directly in your local environment.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Local State Engine Active
          </span>
        </div>

        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">Active Tenant ID:</span>
            <span className="font-mono text-slate-200 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 break-all">
              {user?.id || "Local Enterprise Workspace"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">Persistence Architecture:</span>
            <span className="text-slate-300 font-medium">
              Enterprise Local Storage Engine (Reactive local broadcast across all GRC modules)
            </span>
          </div>
        </div>

        {/* Workspace Management Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetTenantData}
            disabled={resetting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition disabled:opacity-50"
          >
            <FiTrash2 className={resetting ? "animate-spin" : ""} />
            <span>{resetting ? "Wiping Workspace..." : "Reset Workspace to Clean State (0 Records)"}</span>
          </button>

          <button
            type="button"
            onClick={handleSeedTenantDefaults}
            disabled={seeding}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition disabled:opacity-50"
          >
            <FiLayers className={seeding ? "animate-spin" : ""} />
            <span>{seeding ? "Seeding Template..." : "Seed Enterprise Starter Pack"}</span>
          </button>

          <button
            type="button"
            onClick={handleEmergencySecurityAutoWipe}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/50 rounded-xl text-xs font-semibold transition shadow-lg shadow-red-950/40"
            title="Purge all local compliance data and lock platform immediately"
          >
            <FiShield className="text-red-400" />
            <span>Emergency Security Auto-Wipe & Lock</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;