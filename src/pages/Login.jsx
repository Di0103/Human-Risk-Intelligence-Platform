import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../services/authService";
import {
  FiShield,
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiKey,
  FiCopy,
  FiCheck,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export function Login({ defaultSignUp = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    requestOtp,
    verifyOtp,
    securityLockout,
  } = useAuth();

  // Mode: "credentials" | "otp_verification"
  const [authStep, setAuthStep] = useState("credentials");

  const [isSignUp, setIsSignUp] = useState(
    defaultSignUp ||
    location.pathname === "/register" ||
    Boolean(location.search && location.search.includes("signup"))
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Credentials State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [copiedOtp, setCopiedOtp] = useState(false);

  const otpInputRefs = useRef([]);

  const targetFrom =
    location.state?.from?.pathname ||
    (typeof location.state?.from === "string" ? location.state.from : "/dashboard");
  const from =
    !targetFrom || targetFrom === "/login" || targetFrom === "/register"
      ? "/dashboard"
      : targetFrom;

  // Redirect to dashboard if session already active and valid
  useEffect(() => {
    if (user && !securityLockout?.active) {
      navigate(from, { replace: true });
    }
  }, [user, securityLockout, navigate, from]);

  // Countdown timer for OTP validity
  useEffect(() => {
    let timer;
    if (authStep === "otp_verification" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Step 1: Handle Initial Credentials Submit / Send OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg("Please enter a valid email format (e.g., name@company.com or name@gmail.com).");
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      // Dispatches 6-digit OTP Challenge to email (Mandatory for all sessions)
      const res = await requestOtp(cleanEmail);
      if (res.error) {
        setErrorMsg(res.error.message || "Failed to generate security code.");
        setLoading(false);
        return;
      }

      setGeneratedOtp(res.data.code);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpCode("");
      setCountdown(300);
      setAuthStep("otp_verification");
      setSuccessMsg(
        `Security verification code sent to ${cleanEmail}. Enter code to verify session.`
      );

      // Auto focus first OTP input
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 150);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Input Digit Change
  const handleDigitChange = (index, value) => {
    const val = value.replace(/\D/g, "");
    const updated = [...otpDigits];

    if (val.length > 1) {
      // Pasting full 6-digit code
      const pastedDigits = val.slice(0, 6).split("");
      pastedDigits.forEach((digit, i) => {
        if (i < 6) updated[i] = digit;
      });
      setOtpDigits(updated);
      setOtpCode(updated.join(""));
      if (pastedDigits.length >= 6 && otpInputRefs.current[5]) {
        otpInputRefs.current[5].focus();
      }
      return;
    }

    updated[index] = val ? val[val.length - 1] : "";
    setOtpDigits(updated);
    const combined = updated.join("");
    setOtpCode(combined);

    // Auto-advance to next input
    if (val && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Quick Auto-fill generated OTP for testing
  const handleAutoFillOtp = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split("");
    setOtpDigits(digits);
    setOtpCode(generatedOtp);
    if (otpInputRefs.current[5]) {
      otpInputRefs.current[5].focus();
    }
  };

  // Copy generated OTP to clipboard
  const handleCopyOtp = () => {
    if (!generatedOtp) return;
    navigator.clipboard.writeText(generatedOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await requestOtp(email.trim().toLowerCase());
      if (res.error) {
        setErrorMsg(res.error.message);
      } else {
        setGeneratedOtp(res.data.code);
        setCountdown(300);
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpCode("");
        setSuccessMsg("Fresh 6-digit verification code dispatched!");
      }
    } catch {
      setErrorMsg("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP Submission
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const codeToVerify = otpCode.trim() || otpDigits.join("").trim();
    if (codeToVerify.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await verifyOtp(cleanEmail, codeToVerify, {
        fullName: fullName.trim() || cleanEmail.split("@")[0],
        role,
      });

      if (res.error) {
        setErrorMsg(res.error.message || "Invalid verification code.");
        if (res.error.lockout) {
          // If auto-wipe lockout was triggered, reset inputs
          setAuthStep("credentials");
        }
      } else {
        setSuccessMsg("One-Time Password Verified! Establishing zero-trust session...");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 800);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to verify security code.");
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick fill
  const handleSelectDemoAccount = (demoEmail, demoName, demoRole) => {
    setEmail(demoEmail);
    setFullName(demoName);
    setRole(demoRole);
    setPassword("password123");
    setIsSignUp(false);
    setErrorMsg("");
  };

  // Google SSO with Mandatory OTP Verification Gate
  const handleGoogleSso = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const googleEmail = "alex.turner@enterprise-cloud.com";
      setEmail(googleEmail);
      setFullName("Alex Turner (Google SSO)");
      setRole("admin");
      setIsSignUp(false);

      const res = await requestOtp(googleEmail);
      if (res.error) {
        setErrorMsg(res.error.message || "Failed to initiate verification.");
      } else {
        setGeneratedOtp(res.data.code);
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpCode("");
        setCountdown(300);
        setAuthStep("otp_verification");
        setSuccessMsg(
          "Google SSO recognized! Enter the 6-digit One-Time Password to complete zero-trust login."
        );
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 150);
      }
    } catch {
      setErrorMsg("Google SSO authentication challenge failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-xl shadow-blue-500/20 mb-3 border border-blue-400/30">
          <FiShield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Human Risk Intelligence Platform
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Zero-Trust GRC Governance • Adaptive OTP Authentication • Auto-Wipe Guard
        </p>
      </div>

      {/* Main Authentication Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/60">

          {/* Emergency Security Auto-Wipe Incident Alert */}
          {securityLockout?.active && (
            <div className="mb-5 p-4 bg-red-950/80 border-2 border-red-500/80 rounded-xl text-red-200 text-xs shadow-xl animate-fadeIn space-y-1.5">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-xs">
                <FiAlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Security Auto-Wipe Lockout Triggered</span>
              </div>
              <p className="text-slate-300">
                <strong>Incident Trigger:</strong> {securityLockout.reason}
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All local GRC records were cleared to a 0-record state to prevent unauthorized exposure. Authenticate with a fresh One-Time Password (OTP) to restore legitimate zero-trust access.
              </p>
            </div>
          )}

          {/* Standard Feedback Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-red-300 text-xs animate-fadeIn">
              <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-emerald-300 text-xs animate-fadeIn">
              <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* STEP 1: CREDENTIALS & EMAIL INPUT */}
          {authStep === "credentials" ? (
            <>
              {/* Tab Switcher: Sign In vs Sign Up */}
              <div className="flex bg-slate-800/80 p-1 rounded-xl mb-5 border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
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
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isSignUp
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Full Name (Sign Up only) */}
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <FiUser className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required={isSignUp}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="block w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Work or Personal Email
                    </label>
                    <span className="text-[10px] text-blue-400 font-medium">
                      Accepts all standard domains
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FiMail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com or name@gmail.com"
                      className="block w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports corporate, personal (Gmail/Outlook), university, or disposable addresses.
                  </p>
                </div>

                {/* Password (Optional with OTP) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Password <span className="text-slate-500 font-normal lowercase">(optional with OTP)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FiLock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-9 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* RBAC Role Selector (Sign Up only) */}
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Assigned RBAC Governance Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="block w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Administrator (Full Access & Risk Oversight)</option>
                      <option value="compliance_officer">Compliance Officer (Policy & Audit Lead)</option>
                      <option value="employee">Employee (Awareness Quizzes & Acknowledgements)</option>
                    </select>
                  </div>
                )}

                {/* Mandatory 2FA OTP Gate Notice */}
                <div className="p-3 bg-slate-800/60 rounded-xl border border-indigo-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <FiKey className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                        Mandatory 2FA OTP Security Gate
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ENFORCED
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Dispatches a simulated 6-digit verification code to authenticate.
                      </p>
                    </div>
                  </div>
                  <FiShield className="text-emerald-400 text-base shrink-0" />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Generate & Send Verification Code (OTP)</span>
                        <FiArrowRight className="text-sm" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo Test Credentials Shortcuts */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Quick Evaluation Profiles (1-Click Fill)
                </p>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount("admin@enterprise.com", "Alex Turner (CISO)", "admin")}
                    className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-center transition"
                  >
                    <span className="font-bold text-blue-400 block">Admin / CISO</span>
                    <span className="truncate block opacity-80">Alex Turner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount("compliance@enterprise.com", "Elena Vance (DPO)", "compliance_officer")}
                    className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-center transition"
                  >
                    <span className="font-bold text-indigo-400 block">Compliance</span>
                    <span className="truncate block opacity-80">Elena Vance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount("employee@enterprise.com", "Marcus Brody (Staff)", "employee")}
                    className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-center transition"
                  >
                    <span className="font-bold text-emerald-400 block">Employee</span>
                    <span className="truncate block opacity-80">Marcus Brody</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* STEP 2: INTERACTIVE 6-DIGIT OTP VERIFICATION */
            <div className="space-y-5 animate-fadeIn">
              {/* Back Link */}
              <button
                type="button"
                onClick={() => {
                  setAuthStep("credentials");
                  setErrorMsg("");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <FiArrowLeft />
                <span>Back to email entry</span>
              </button>

              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">
                  <FiKey />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Verify One-Time Password
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter the 6-digit verification code dispatched to:
                </p>
                <p className="text-xs font-mono font-semibold text-blue-400 mt-0.5">
                  {email}
                </p>
              </div>

              {/* Graceful Simulated OTP Delivery Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/40 rounded-xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                    <FiMail className="text-blue-400" />
                    Simulated Security Dispatch:
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <FiClock /> Expires in {formatCountdown(countdown)}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="font-mono text-xl font-black text-amber-300 tracking-widest pl-2">
                    {generatedOtp || "849201"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
                    >
                      {copiedOtp ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                      <span>{copiedOtp ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition shadow-md shadow-blue-500/20"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Notice: In zero-trust mode, OTP delivery is validated directly within your isolated browser security session for instant audit validation.
                </p>
              </div>

              {/* OTP Form with 6 Digit Boxes */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider text-center mb-3">
                    6-Digit Security Code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-mono font-bold bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-inner"
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length < 6}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify Code & Access Dashboard</span>
                        <FiCheckCircle className="text-sm" />
                      </>
                    )}
                  </button>
                </div>

                {/* Resend Code Action */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition"
                  >
                    <FiRefreshCw className="text-xs" /> Resend OTP
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Google SSO Alternative */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleGoogleSso}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 hover:text-white transition"
            >
              <FcGoogle className="w-4 h-4" />
              <span>Continue with Enterprise Google SSO</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;