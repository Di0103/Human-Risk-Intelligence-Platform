import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateSessionIntegrity } from "../services/authService";
import { FiShield, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

/**
 * ProtectedRoute
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {Array<string>} [allowedRoles] - Optional list of authorized roles: ['admin', 'compliance_officer', 'employee']
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, session, profile, loading } = useAuth();
  const location = useLocation();

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">
          Verifying zero-trust credentials & session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: Strict lockdown & redirect to login
  if (!user || !session) {
    if (typeof window !== "undefined") {
      const integrity = validateSessionIntegrity();
      if (!integrity.valid) {
        window.localStorage.removeItem("grc_session");
      }
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Runtime Verification of Session Storage Integrity & Expiry
  const integrity = validateSessionIntegrity();
  if (!integrity.valid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. RBAC Role Authorization Check
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = profile?.role || "employee";
    const hasPermission = allowedRoles.includes(currentRole);

    if (!hasPermission) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl shadow-lg">
              <FiAlertTriangle />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Access Restricted
            </h2>

            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Your account with role{" "}
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                {currentRole.replace("_", " ")}
              </span>{" "}
              does not have administrative privileges to access this module.
            </p>

            <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400 mb-6 text-left border border-slate-700/80">
              <span className="font-semibold text-slate-300 block mb-1">
                Required Role(s):
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {allowedRoles.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 font-mono text-[11px]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition duration-150 shadow-lg shadow-blue-600/20"
            >
              <FiArrowLeft className="text-lg" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      );
    }
  }

  // 4. Authorized
  return children;
}

export default ProtectedRoute;
