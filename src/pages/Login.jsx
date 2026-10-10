import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiShield,
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export function Login({ defaultSignUp = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp] = useState(
    defaultSignUp ||
    location.pathname === "/register" ||
    Boolean(location.search && location.search.includes("signup"))
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // Default to admin for convenient evaluation

  const from = location.state?.from?.pathname || "/dashboard";

  // Handle Sign In / Sign Up submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg("Please enter your full name.");
          setLoading(false);
          return;
        }

        const { data, error } = await signupWithEmail(
          email,
          password,
          fullName,
          role
        );

        if (error) {
          setErrorMsg(error.message || "Failed to create account.");
        } else {
          setSuccessMsg(
            "Account created successfully! Redirecting to your dashboard..."
          );
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        }
      } else {
        const { data, error } = await loginWithEmail(email, password);

        if (error) {
          setErrorMsg(error.message || "Invalid credentials.");
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        setErrorMsg(error.message || "Google authentication failed.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to initialize Google Sign-In.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-xl shadow-blue-500/20 mb-4">
          <FiShield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Human-Centric GRC
        </h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Governance, Risk, Compliance & Human Cyber Security
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl shadow-black/50">
          
          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                !isSignUp
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                isSignUp
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm animate-fadeIn">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-300 text-sm animate-fadeIn">
              <FiCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field (Only on Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* RBAC Role Selector Dropdown (Only on Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Platform RBAC Role (Minor Project Evaluation)
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full py-2.5 px-3 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="admin">
                      Administrator (Full Governance & Audit Access)
                    </option>
                    <option value="compliance_officer">
                      Compliance Officer (Risk, Audit & Policy Lead)
                    </option>
                    <option value="employee">
                      Employee (Security Awareness & Training)
                    </option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Defines route permissions and privilege boundaries in the platform.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? "Register Account" : "Sign In to GRC Platform"}</span>
                    <FiArrowRight className="text-base" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social Auth Separator */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Continue with Google */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 hover:text-white shadow-sm transition hover:border-slate-600 disabled:opacity-50"
              >
                <FcGoogle className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;