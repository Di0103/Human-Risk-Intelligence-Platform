import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import { formatId } from "../utils/idFormatter";
import {
  FiFolder,
  FiPlus,
  FiAlertTriangle,
  FiShield,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiActivity,
  FiLayers,
  FiUsers,
  FiRadio,
  FiCpu,
  FiZap,
  FiCrosshair,
  FiEye,
  FiClock,
  FiLock,
  FiX,
} from "react-icons/fi";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/*
  Dashboard
  -------------------------------------------------------
  GRC collections used:

  employees
  departments
  risk_register
  policies
  trainings
  assessments

  Expected fields:

  employees:
  - id
  - full_name
  - email
  - department

  trainings:
  - id
  - training_name
  - trainer
  - training_date

  assessments:
  - id
  - full_name
  - assessment_score
  - result

  risk_register:
  - id
  - risk_title
  - category
  - status

  policies:
  - id
  - policy_name
  - department
  - version
*/

// ============================================================
// COLORS
// ============================================================

const DEPT_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#4f46e5",
  "#0891b2",
  "#ca8a04",
];

const CATEGORY_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#06b6d4",
  "#ec4899",
];

const RISK_COLORS = {
  Open: "#dc2626",
  Closed: "#16a34a",
};

// ============================================================
// DASHBOARD
// ============================================================

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fullName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "Administrator");

  // ----------------------------------------------------------
  // EXECUTIVE GRC METRICS (Section 6 & Prompt 6)
  // ----------------------------------------------------------

  const [grcMetrics, setGrcMetrics] = useState({
    totalRisks: 0,
    criticalRisksCount: 0,
    totalFrameworkClauses: 0,
    unmitigatedGapsCount: 0,
    policyComplianceRate: 0,
    activeControlsCount: 0,
  });

  const [criticalRisksList, setCriticalRisksList] = useState([]);
  const [complianceGapsList, setComplianceGapsList] = useState([]);
  const [riskCategoryData, setRiskCategoryData] = useState([]);
  const [deptPolicyRateData, setDeptPolicyRateData] = useState([]);

  // Threat Intelligence & Human Risk Exposure Telemetry State
  const [telemetry, setTelemetry] = useState({
    hreiScore: 0,
    threatLevel: "LOW",
    phishingVector: 0,
    identityVector: 0,
    statutoryVector: 0,
    dataPrivacyVector: 0,
    signals: [],
    lastScanned: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Active Security Shield / Auto-Wipe Inspection Modal State
  const [showShieldModal, setShowShieldModal] = useState(false);

  // ----------------------------------------------------------
  // STATS
  // ----------------------------------------------------------

  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    risks: 0,
    policies: 0,
    trainings: 0,
    assessments: 0,
  });

  // ----------------------------------------------------------
  // RECENT DATA
  // ----------------------------------------------------------

  const [recentEmployees, setRecentEmployees] = useState([]);
  const [recentTrainings, setRecentTrainings] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [recentRisks, setRecentRisks] = useState([]);
  const [recentPolicies, setRecentPolicies] = useState([]);

  // ----------------------------------------------------------
  // CHART DATA
  // ----------------------------------------------------------

  const [deptDistribution, setDeptDistribution] = useState([]);
  const [riskStatusData, setRiskStatusData] = useState([]);

  // ----------------------------------------------------------
  // TRAININGS / NOTIFICATIONS
  // ----------------------------------------------------------

  const [upcomingTrainings, setUpcomingTrainings] = useState([]);
  const [pendingAssessments, setPendingAssessments] = useState([]);

  const [notifOpen, setNotifOpen] = useState(false);

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  // ==========================================================
  // FETCH DASHBOARD (LocalStorage-Driven Engine)
  // ==========================================================

  const fetchDashboard = () => {
    try {
      const allEmployees = localStorageDb.get("employees") || [];
      const allDepts = localStorageDb.get("departments") || [];
      const allTrainings = localStorageDb.get("trainings") || [];
      const allAssessments = localStorageDb.get("assessments") || [];
      const allRisks = localStorageDb.get("risks") || [];
      const allFrameworks = localStorageDb.get("compliance_frameworks") || [];
      const allControls = localStorageDb.get("security_controls") || [];
      const allMappings = localStorageDb.get("control_mappings") || [];
      const allPolicies = localStorageDb.get("policies") || [];
      const allAcks = localStorageDb.get("policy_acknowledgements") || [];
      const allProfiles = localStorageDb.get("profiles") || [];

      // 1. Critical Risks & Category Distribution
      const criticalRisks = allRisks.filter((r) => {
        const likelihood = Number(r.likelihood) || 1;
        const impact = Number(r.impact) || 1;
        const score = Number(r.risk_score) || (likelihood * impact) || 0;
        return score >= 15;
      });

      const catCounts = {};
      allRisks.forEach((r) => {
        const cat = r.category || "General";
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
      const riskCatFormatted = Object.entries(catCounts).map(([name, value]) => ({
        name,
        value,
      }));
      setRiskCategoryData(riskCatFormatted);

      // 2. Compliance Gaps & Active Implemented Controls
      const mappedFwIds = new Set(allMappings.map((m) => String(m.framework_id || m.requirement_id)));
      const gaps = allFrameworks.filter((fw) => !mappedFwIds.has(String(fw.id)));
      const activeControlsCount = allControls.filter((c) => c.status === "implemented").length;

      // 3. Policy Compliance Rate & Department Attestation Rates
      const activePolicies = allPolicies.filter((p) => p.status === "active" || !p.status);
      const targetEmployees = allProfiles.filter((p) => p.role === "employee" || !p.role);
      const employeeHeadcount = Math.max(targetEmployees.length, allEmployees.length, 1);
      const activePolicyIds = new Set(activePolicies.map((p) => String(p.id)));
      const validAcks = allAcks.filter((a) => activePolicyIds.has(String(a.policy_id))).length;
      const totalPossibleAcks = activePolicies.length * employeeHeadcount;
      const policyComplianceRate = totalPossibleAcks > 0
        ? Math.min(100, Math.round((validAcks / totalPossibleAcks) * 100))
        : 0;

      const deptAttestationData = allDepts.map((d) => {
        const deptName = d.name || d.department_name || "General";
        const deptEmps = allEmployees.filter(
          (p) => p.department === deptName
        );
        const deptEmpCount = Math.max(deptEmps.length, 1);
        const deptEmpIds = new Set(deptEmps.map((p) => String(p.id)));
        const deptAcks = allAcks.filter(
          (a) => deptEmpIds.has(String(a.user_id || a.employee_id)) && activePolicyIds.has(String(a.policy_id))
        ).length;
        const deptPossible = activePolicies.length * deptEmpCount;
        const rate = deptPossible > 0 ? Math.min(100, Math.round((deptAcks / deptPossible) * 100)) : 0;
        return {
          name: deptName,
          rate,
          signed: deptAcks,
          headcount: deptEmps.length,
        };
      });
      setDeptPolicyRateData(deptAttestationData);

      // Set GRC Metrics State
      setGrcMetrics({
        totalRisks: allRisks.length,
        criticalRisksCount: criticalRisks.length,
        totalFrameworkClauses: allFrameworks.length,
        unmitigatedGapsCount: gaps.length,
        policyComplianceRate,
        activeControlsCount,
      });

      setCriticalRisksList(criticalRisks.slice(0, 4));
      setComplianceGapsList(gaps.slice(0, 4));

      // General Stats
      setStats({
        employees: allEmployees.length,
        departments: allDepts.length,
        risks: allRisks.length,
        policies: allPolicies.length,
        trainings: allTrainings.length,
        assessments: allAssessments.length,
      });

      // Recent rows
      setRecentEmployees(allEmployees.slice(0, 5));
      setRecentTrainings(allTrainings.slice(0, 5));
      setRecentAssessments(allAssessments.slice(0, 5));
      setRecentRisks(allRisks.slice(0, 5));
      setRecentPolicies(allPolicies.slice(0, 5));

      // Department distribution
      const deptCounts = allEmployees.reduce((acc, row) => {
        const department = row.department || "Unassigned";
        acc[department] = (acc[department] || 0) + 1;
        return acc;
      }, {});
      setDeptDistribution(Object.entries(deptCounts).map(([name, value]) => ({ name, value })));

      // Risk status
      const statusCounts = allRisks.reduce((acc, row) => {
        const status = row.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      setRiskStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      // Upcoming trainings
      const sortedTrainings = [...allTrainings].sort((a, b) =>
        (a.training_date || "").localeCompare(b.training_date || "")
      );
      setUpcomingTrainings(sortedTrainings.slice(0, 6));

      // Pending assessments
      const pendingAss = allAssessments.filter(
        (a) => !a.result || a.result === "Pending" || !a.status || a.status === "Pending"
      );
      setPendingAssessments(pendingAss.slice(0, 10));

      // Threat Intelligence Telemetry & Human Risk Exposure Index (HREI)
      const failedAssessments = allAssessments.filter(
        (a) => a.result === "Fail" || (Number(a.score) < 70 && a.score !== undefined)
      );
      const assessmentFailureRate = allAssessments.length > 0
        ? Math.round((failedAssessments.length / allAssessments.length) * 100)
        : 0;

      let exposurePoints = 0;
      exposurePoints += Math.min(40, criticalRisks.length * 15);
      exposurePoints += Math.min(30, Math.round(assessmentFailureRate * 0.3));
      exposurePoints += Math.min(20, gaps.length * 4);
      if (allPolicies.length > 0) {
        exposurePoints += Math.min(10, Math.round((100 - policyComplianceRate) * 0.1));
      }

      const isCleanEmpty = allRisks.length === 0 && allAssessments.length === 0 && allPolicies.length === 0;
      const hreiScore = isCleanEmpty ? 0 : Math.min(100, Math.max(0, exposurePoints));

      let threatLevel = "LOW";
      if (hreiScore >= 75) threatLevel = "CRITICAL";
      else if (hreiScore >= 50) threatLevel = "ELEVATED";
      else if (hreiScore >= 25) threatLevel = "GUARDED";
      else threatLevel = "LOW";

      const phishingVector = allAssessments.length > 0
        ? Math.min(100, Math.max(10, assessmentFailureRate + (allTrainings.filter((t) => t.status !== "Completed").length * 15)))
        : (allRisks.some((r) => (r.category || "").includes("Human")) ? 45 : 0);
      const identityVector = criticalRisks.length > 0
        ? Math.min(100, 25 + criticalRisks.length * 20)
        : (allRisks.length > 0 ? 20 : 0);
      const statutoryVector = allFrameworks.length > 0
        ? Math.min(100, Math.round((gaps.length / allFrameworks.length) * 100))
        : 0;
      const dataPrivacyVector = allPolicies.length > 0
        ? Math.max(0, 100 - policyComplianceRate)
        : 0;

      const signals = [];
      if (criticalRisks.length > 0) {
        signals.push({
          id: "sig-1",
          type: "CRITICAL",
          title: "Critical Threat Active",
          desc: `${criticalRisks[0].title || criticalRisks[0].risk_title || "Identified Threat"} exceeds tolerance threshold.`,
          time: "Just now",
        });
      }
      if (gaps.length > 0) {
        signals.push({
          id: "sig-2",
          type: "WARNING",
          title: "Statutory Gap Detected",
          desc: `${gaps.length} mandatory framework clauses lack active implemented security controls.`,
          time: "Live Telemetry",
        });
      }
      if (failedAssessments.length > 0) {
        signals.push({
          id: "sig-3",
          type: "WARNING",
          title: "Human Susceptibility Spike",
          desc: `${failedAssessments.length} assessment failures logged in workforce phishing simulations.`,
          time: "Threat Radar",
        });
      }
      if (policyComplianceRate < 100 && allPolicies.length > 0) {
        signals.push({
          id: "sig-4",
          type: "INFO",
          title: "Policy Attestation Notice",
          desc: `Workforce policy acknowledgement is currently at ${policyComplianceRate}%.`,
          time: "Active Signal",
        });
      }
      if (signals.length === 0) {
        signals.push({
          id: "sig-clean",
          type: "SUCCESS",
          title: "Hardened Baseline Posture",
          desc: "Clean workspace initialized with 0 active threat exposure signals and zero-trust hygiene.",
          time: "Continuous Monitor",
        });
      }

      setTelemetry({
        hreiScore,
        threatLevel,
        phishingVector,
        identityVector,
        statutoryVector,
        dataPrivacyVector,
        signals,
        lastScanned: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const handleSimulateTelemetryScan = () => {
    try {
      localStorageDb.logAudit({
        action: "TELEMETRY_RADAR_SCAN",
        category: "Threat Intelligence",
        entity: "Radar Enclave",
        details: "Simulated vulnerability radar scan executed across 4 workforce threat vectors",
        severity: "info",
      });
    } catch (e) {}

    setTelemetry((prev) => ({
      ...prev,
      lastScanned: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    // Trigger reactive state propagation
    localStorageDb.notifyUpdate("telemetry");
  };

  useEffect(() => {
    fetchDashboard();

    const handleStorageUpdate = () => {
      fetchDashboard();
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Global search
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      runGlobalSearch(searchTerm.trim());
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const runGlobalSearch = useCallback((term) => {
    setSearching(true);
    setShowSearchDropdown(true);

    try {
      const emps = localStorageDb.get("employees") || [];
      const pols = localStorageDb.get("policies") || [];
      const rsks = localStorageDb.get("risks") || [];
      const trns = localStorageDb.get("trainings") || [];

      const lowerTerm = term.toLowerCase();

      const matchedEmps = emps
        .filter((e) => (e.full_name || e.name || "").toLowerCase().includes(lowerTerm))
        .slice(0, 5)
        .map((r) => ({
          type: "Employee",
          label: r.full_name || r.name,
          sub: r.email,
          id: r.id,
        }));

      const matchedPols = pols
        .filter((p) => (p.policy_name || p.title || "").toLowerCase().includes(lowerTerm))
        .slice(0, 5)
        .map((r) => ({
          type: "Policy",
          label: r.policy_name || r.title,
          sub: r.department,
          id: r.id,
        }));

      const matchedRisks = rsks
        .filter((r) => (r.risk_title || r.title || "").toLowerCase().includes(lowerTerm))
        .slice(0, 5)
        .map((r) => ({
          type: "Risk",
          label: r.risk_title || r.title,
          sub: r.status,
          id: r.id,
        }));

      const matchedTrainings = trns
        .filter((t) => (t.training_name || t.title || "").toLowerCase().includes(lowerTerm))
        .slice(0, 5)
        .map((r) => ({
          type: "Training",
          label: r.training_name || r.title,
          sub: r.trainer,
          id: r.id,
        }));

      setSearchResults([
        ...matchedEmps,
        ...matchedPols,
        ...matchedRisks,
        ...matchedTrainings,
      ]);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // ==========================================================
  // NOTIFICATION COUNT
  // ==========================================================

  const notificationCount =
    pendingAssessments.length +
    upcomingTrainings.filter(
      isWithinNext7Days
    ).length;

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="space-y-6">
      {/* ===================================================
          TOP HEADER
      ==================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* TITLE */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Executive GRC Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous Governance, Risk Assessment & Compliance Performance Monitoring
            </p>
          </div>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* SEARCH */}
          <div className="relative w-full sm:w-72 lg:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search employees, policies, risks..."
              className="w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {/* SEARCH DROPDOWN */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                  {searching && (
                    <div className="p-4 text-sm text-slate-400">Searching...</div>
                  )}

                  {!searching && searchResults.length === 0 && (
                    <div className="p-4 text-sm text-slate-400">No results found.</div>
                  )}

                  {!searching &&
                    searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        className="p-3 hover:bg-slate-800/80 cursor-pointer flex justify-between items-center gap-3 transition"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {result.label}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {result.sub}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                          {result.type}
                        </span>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => setShowSearchDropdown(false)}
                  className="w-full p-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 border-t border-slate-800 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((open) => !open)}
              className="w-10 h-10 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 relative flex items-center justify-center transition"
              aria-label="Notifications"
            >
              🔔
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {notifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800">
                <div className="p-4 font-semibold text-sm text-white">
                  Notifications
                </div>

                {pendingAssessments.length > 0 && (
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Pending Assessments
                    </p>
                    {pendingAssessments.map((assessment) => (
                      <div
                        key={`pa-${assessment.id}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="truncate text-slate-300">
                          {assessment.full_name}
                        </span>
                        <span className="shrink-0 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {upcomingTrainings.filter(isWithinNext7Days).length > 0 && (
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Trainings This Week
                    </p>
                    {upcomingTrainings
                      .filter(isWithinNext7Days)
                      .map((training) => (
                        <div
                          key={`training-${training.id}`}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="truncate text-slate-300">
                            {training.training_name}
                          </span>
                          <span className="shrink-0 text-xs text-blue-400 font-mono">
                            {formatDate(training.training_date)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {notificationCount === 0 && (
                  <div className="p-5 text-sm text-slate-400 text-center">
                    You're all caught up 🎉
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIVE SECURITY SHIELD / AUTO-WIPE GUARD INDICATOR */}
          <button
            type="button"
            onClick={() => setShowShieldModal(true)}
            className="h-10 px-3.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-white rounded-lg transition text-xs font-semibold shadow-lg shadow-cyan-950/20 flex items-center gap-2.5 group"
            title="Inspect Active Security Shield & Auto-Wipe Guard Defense"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <FiShield className="text-cyan-400 text-sm group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Auto-Wipe Guard</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ARMED
                </span>
              </div>
              <span className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
                Session Defense Active
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ===================================================
          WELCOME GREETING
      ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Welcome, {fullName} 👋
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Human-Centric Governance, Risk & Compliance Overview
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg w-fit">
          {new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
        </span>
      </div>

      {/* ===================================================
          THREAT INTELLIGENCE & HUMAN RISK EXPOSURE TELEMETRY
      ==================================================== */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/20 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl relative">
              <FiRadio className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Real-Time Threat Intelligence & Human Risk Exposure Telemetry
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Live Radar
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous social engineering vulnerability assessment, statutory gap radar, and workforce security signals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <FiClock className="text-indigo-400" />
              <span>Scanned {telemetry.lastScanned}</span>
            </span>
            <button
              type="button"
              onClick={handleSimulateTelemetryScan}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold transition"
            >
              <FiZap className="text-xs" />
              <span>Simulate Telemetry Scan</span>
            </button>
          </div>
        </div>

        {/* Active Security Defense & Auto-Wipe Guard Status Banner */}
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FiShield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Security Shield & Auto-Wipe Sentinel
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ARMED & OPERATIONAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Session hijacking detection active via SHA-256 browser fingerprinting; emergency auto-wipe zeroization protocol on standby.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 block">State Engine</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Reactive Events Active
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowShieldModal(true)}
              className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FiEye className="text-xs" />
              <span>Inspect Shield Telemetry</span>
            </button>
          </div>
        </div>

        {/* 3 Telemetry Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card 1: Human Risk Exposure Index (HREI) Gauge (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FiCrosshair className="text-indigo-400" /> Human Risk Exposure Index (HREI)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  telemetry.threatLevel === "CRITICAL"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                    : telemetry.threatLevel === "ELEVATED"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : telemetry.threatLevel === "GUARDED"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {telemetry.threatLevel} Threat
              </span>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span
                className={`text-4xl font-mono font-black ${
                  telemetry.hreiScore >= 75
                    ? "text-rose-400"
                    : telemetry.hreiScore >= 50
                    ? "text-amber-400"
                    : telemetry.hreiScore >= 25
                    ? "text-blue-400"
                    : "text-emerald-400"
                }`}
              >
                {telemetry.hreiScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
              <span className="text-xs text-slate-400 ml-2 font-medium">
                {telemetry.hreiScore === 0 ? "Hardened Baseline (0 Records)" : "Composite Vulnerability Score"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    telemetry.hreiScore >= 75
                      ? "bg-rose-500"
                      : telemetry.hreiScore >= 50
                      ? "bg-amber-500"
                      : telemetry.hreiScore >= 25
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(4, telemetry.hreiScore)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (Hardened)</span>
                <span>50 (Elevated)</span>
                <span>100 (Critical)</span>
              </div>
            </div>
          </div>

          {/* Card 2: 4 Active Threat Vector Gauges (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Active Threat Vectors & Telemetry Gauges
            </span>

            {/* Vector 1 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">1. Phishing & Social Engineering</span>
                <span className="font-mono text-slate-300">{telemetry.phishingVector}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${telemetry.phishingVector}%` }}
                />
              </div>
            </div>

            {/* Vector 2 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">2. Identity & Privileged Access Drift</span>
                <span className="font-mono text-slate-300">{telemetry.identityVector}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${telemetry.identityVector}%` }}
                />
              </div>
            </div>

            {/* Vector 3 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">3. Statutory Non-Compliance Penalty</span>
                <span className="font-mono text-slate-300">{telemetry.statutoryVector}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${telemetry.statutoryVector}%` }}
                />
              </div>
            </div>

            {/* Vector 4 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">4. Shadow IT & Data Exfiltration Surface</span>
                <span className="font-mono text-slate-300">{telemetry.dataPrivacyVector}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${telemetry.dataPrivacyVector}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Live Threat Telemetry Signals Stream (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FiEye className="text-indigo-400" /> Live Telemetry Feed
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {telemetry.signals.length} Signals Active
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {telemetry.signals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2 text-xs"
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                      sig.type === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : sig.type === "WARNING"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : sig.type === "SUCCESS"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                    }`}
                  >
                    {sig.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{sig.title}</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                      {sig.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-900 mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>Telemetry Gateway: Local Enclave</span>
              <span className="text-emerald-400 font-medium">● Monitoring Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          EXECUTIVE GRC KPI CARDS (Prompt 6 Deliverable)
      ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Risk Posture */}
        <div className="bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Risk Posture
            </span>
            <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <FiAlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {grcMetrics.totalRisks}
            </span>
            <span className="text-xs text-slate-400 font-medium">Total Risks</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {grcMetrics.criticalRisksCount} Critical / High
            </span>
            <span className="text-slate-500">Score ≥ 15</span>
          </div>
        </div>

        {/* 2. Compliance Readiness */}
        <div className="bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Compliance Coverage
            </span>
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FiShield className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {grcMetrics.totalFrameworkClauses}
            </span>
            <span className="text-xs text-slate-400 font-medium">Framework Clauses</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {grcMetrics.unmitigatedGapsCount} Unmitigated Gaps
            </span>
            <span className="text-slate-500">Needs Safeguards</span>
          </div>
        </div>

        {/* 3. Policy Attestation Rate */}
        <div className="bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Policy Attestation Rate
            </span>
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FiFileText className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {grcMetrics.policyComplianceRate}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Sign-off Rate</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-indigo-400 font-bold">
              {stats.policies} Policies Published
            </span>
            <span className="text-slate-500">Organization-wide</span>
          </div>
        </div>

        {/* 4. Active Safeguards */}
        <div className="bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Security Controls
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FiCheckCircle className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {grcMetrics.activeControlsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Implemented</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold">
              Active Technical Safeguards
            </span>
            <span className="text-slate-500">Audited</span>
          </div>
        </div>
      </div>

      {/* ===================================================
          CRITICAL ACTION REQUIRED: RULE-BASED SYSTEM ALERTS ENGINE
      ==================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FiAlertCircle className="text-rose-400 w-5 h-5" />
              Critical Action Required
            </h2>
            <p className="text-xs text-slate-400">
              Rule-based continuous monitoring alerts engine (Section 6, Item 11 of Synopsis)
            </p>
          </div>
          {(complianceGapsList.length > 0 || criticalRisksList.length > 0) && (
            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              {complianceGapsList.length + criticalRisksList.length} Active Security Alerts
            </span>
          )}
        </div>

        {complianceGapsList.length === 0 && criticalRisksList.length === 0 ? (
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-5 flex items-center gap-4 text-emerald-300 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-400 border border-emerald-700/50">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-emerald-200">
                All systems compliant — No critical security alerts.
              </h3>
              <p className="text-xs text-emerald-400/90 mt-0.5">
                All ISO 27001 requirements are covered by mapped technical safeguards, and registered risks remain below high-impact thresholds.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Alert Box 1: Compliance Gaps */}
            <div className="bg-slate-900/90 border-l-4 border-l-amber-500 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg">
                      <FiShield className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Compliance Gaps Detected
                      </h3>
                      <p className="text-xs text-slate-400">
                        {grcMetrics.unmitigatedGapsCount} unmitigated framework requirements
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/compliance")}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition"
                  >
                    Resolve Gaps <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {complianceGapsList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No unmitigated compliance gaps found.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {complianceGapsList.map((gap) => (
                      <div
                        key={gap.id}
                        className="bg-slate-800/60 border border-slate-700/70 rounded-lg p-3 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold rounded border border-amber-500/30">
                              {gap.clause}
                            </span>
                            <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded">
                              0 Controls Mapped
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-1">
                            {gap.requirement}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/compliance")}
                          className="shrink-0 text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 bg-slate-800 border border-slate-700 rounded hover:border-slate-600 transition"
                        >
                          Resolve Gap
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alert Box 2: Critical & High Risks */}
            <div className="bg-slate-900/90 border-l-4 border-l-rose-500 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg">
                      <FiAlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Critical & High Risks
                      </h3>
                      <p className="text-xs text-slate-400">
                        {grcMetrics.criticalRisksCount} risks require immediate mitigation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/risks")}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1.5 rounded-lg transition"
                  >
                    Inspect Risks <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {criticalRisksList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No critical or high severity risks recorded.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {criticalRisksList.map((risk) => {
                      const score = Number(risk.risk_score) || (Number(risk.likelihood) * Number(risk.impact)) || 0;
                      return (
                        <div
                          key={risk.id}
                          className="bg-slate-800/60 border border-slate-700/70 rounded-lg p-3 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-white truncate">
                                {risk.title || risk.risk_title}
                              </span>
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-[10px] font-bold rounded">
                                Score {score}
                              </span>
                              <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded">
                                {risk.category || "General"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 italic">
                              Plan: {risk.treatment_plan || "No active treatment plan documented"}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate("/risks")}
                            className="shrink-0 text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 bg-slate-800 border border-slate-700 rounded hover:border-slate-600 transition"
                          >
                            Inspect Risk
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          SUMMARY CARDS (OPERATIONAL METRICS)
      ==================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          label="Employees"
          value={stats.employees}
          color="text-blue-400"
        />

        <SummaryCard
          label="Departments"
          value={stats.departments}
          color="text-emerald-400"
        />

        <SummaryCard
          label="Risks"
          value={stats.risks}
          color="text-rose-400"
        />

        <SummaryCard
          label="Policies"
          value={stats.policies}
          color="text-purple-400"
        />

        <SummaryCard
          label="Trainings"
          value={stats.trainings}
          color="text-amber-400"
        />

        <SummaryCard
          label="Assessments"
          value={stats.assessments}
          color="text-indigo-400"
        />
      </div>

      {/* ===================================================
          QUICK ACTIONS
      ==================================================== */}
      <div className="bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 p-5">
        <h2 className="text-base font-bold text-white mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickAction
            label="Employees"
            className="bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
            onClick={() => navigate("/employees")}
          />

          <QuickAction
            label="Departments"
            className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
            onClick={() => navigate("/departments")}
          />

          <QuickAction
            label="Risks"
            className="bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
            onClick={() => navigate("/risks")}
          />

          <QuickAction
            label="Policies"
            className="bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
            onClick={() => navigate("/policies")}
          />

          <QuickAction
            label="Training"
            className="bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
            onClick={() => navigate("/training")}
          />

          <QuickAction
            label="Assessment"
            className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
            onClick={() => navigate("/assessment")}
          />
        </div>
      </div>

      {/* ===================================================
          INTERACTIVE RECHARTS VISUALIZATION
      ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* 1. RISK DISTRIBUTION BY CATEGORY */}
        <ChartCard title="Risk Distribution by Category">
          {riskCategoryData.length === 0 ? (
            <EmptyChartState message="No categorized risks recorded." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="65%"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {riskCategoryData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 2. POLICY ATTESTATION BY DEPARTMENT */}
        <ChartCard title="Policy Sign-Off Rate by Department">
          {deptPolicyRateData.length === 0 ? (
            <EmptyChartState message="No department attestation data." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptPolicyRateData}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 100]} unit="%" allowDecimals={false} stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(val, name, item) => [
                    `${val}% (${item.payload.signed} signed)`,
                    "Compliance Rate",
                  ]}
                />
                <Bar
                  dataKey="rate"
                  fill="#6366f1"
                  radius={[5, 5, 0, 0]}
                  name="Sign-Off Rate (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 3. TRAINING VS ASSESSMENTS */}
        <ChartCard title="Trainings vs Assessments">
          {stats.trainings === 0 && stats.assessments === 0 ? (
            <EmptyChartState message="No training or assessment records." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "Trainings",
                    count: stats.trainings,
                  },
                  {
                    name: "Assessments",
                    count: stats.assessments,
                  },
                ]}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ===================================================
          UPCOMING TRAININGS
      ==================================================== */}
      <div className="bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 p-5">
        <h2 className="text-base font-bold text-white mb-4">
          Upcoming Trainings
        </h2>

        {upcomingTrainings.length === 0 ? (
          <div className="min-h-[100px] flex flex-col items-center justify-center py-6 text-sm text-slate-400">
            <FiFolder className="w-7 h-7 text-slate-600 mb-2" />
            <p className="font-medium text-slate-400">No records found in database.</p>
            <button
              onClick={() => navigate("/training")}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition"
            >
              <FiPlus className="w-3.5 h-3.5" /> Schedule Training
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {upcomingTrainings.map((training) => {
              const date = training.training_date
                ? new Date(training.training_date)
                : null;

              return (
                <div
                  key={training.id}
                  className="border border-slate-800 rounded-lg overflow-hidden text-center bg-slate-800/60 min-h-[120px]"
                >
                  <div className="bg-amber-600/80 text-white text-xs font-semibold py-2">
                    {date
                      ? date
                          .toLocaleString("default", {
                            month: "short",
                          })
                          .toUpperCase()
                      : "TBD"}
                  </div>

                  <div className="text-2xl font-bold text-white py-2">
                    {date ? date.getDate() : "-"}
                  </div>

                  <div
                    className="text-xs text-slate-300 px-2 pb-3 truncate"
                    title={training.training_name}
                  >
                    {training.training_name}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================
          RECENT EMPLOYEES
      ==================================================== */}
      <RecentTable
        title="Recent Employees"
        columns={["ID", "Name", "Email"]}
        rows={recentEmployees}
        renderRow={(employee, idx) => [
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {formatId(employee.id, idx, "EMP")}
          </span>,
          employee.full_name || employee.name || "—",
          employee.email,
        ]}
        onAddNew={() => navigate("/employees")}
        addNewLabel="Add Employee"
      />

      {/* ===================================================
          RECENT TRAININGS
      ==================================================== */}
      <RecentTable
        title="Recent Trainings"
        columns={["ID", "Training", "Trainer"]}
        rows={recentTrainings}
        renderRow={(training, idx) => [
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {formatId(training.id, idx, "TRN")}
          </span>,
          training.training_name || training.title || "—",
          training.trainer,
        ]}
        onAddNew={() => navigate("/training")}
        addNewLabel="Schedule Training"
      />

      {/* ===================================================
          RECENT ASSESSMENTS
      ==================================================== */}
      <RecentTable
        title="Recent Assessments"
        columns={["ID", "Employee", "Score", "Result"]}
        rows={recentAssessments}
        renderRow={(assessment, idx) => [
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {formatId(assessment.id, idx, "ASM")}
          </span>,
          assessment.employee_name || assessment.full_name || "—",
          assessment.assessment_score !== undefined && assessment.assessment_score !== null
            ? `${assessment.assessment_score}%`
            : assessment.score !== undefined
            ? `${assessment.score}%`
            : "—",
          assessment.result || assessment.status || "—",
        ]}
        onAddNew={() => navigate("/assessment")}
        addNewLabel="Take Assessment"
      />

      {/* ===================================================
          RECENT RISKS
      ==================================================== */}
      <RecentTable
        title="Recent Risks"
        columns={["ID", "Risk", "Category", "Status"]}
        rows={recentRisks}
        renderRow={(risk, idx) => [
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {formatId(risk.id, idx, "RSK")}
          </span>,
          risk.title || risk.risk_title || "—",
          risk.category,
          risk.status,
        ]}
        onAddNew={() => navigate("/risks")}
        addNewLabel="Add Risk"
      />

      {/* ===================================================
          RECENT POLICIES
      ==================================================== */}
      <RecentTable
        title="Recent Policies"
        columns={["ID", "Policy", "Department", "Version"]}
        rows={recentPolicies}
        renderRow={(policy, idx) => [
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {formatId(policy.id, idx, "POL")}
          </span>,
          policy.title || policy.policy_name || "—",
          policy.department || policy.department_name || "—",
          policy.version ? `v${policy.version}` : "v1.0",
        ]}
        onAddNew={() => navigate("/policies")}
        addNewLabel="Create Policy"
        last
      />

      {/* ===================================================
          SECURITY SHIELD / AUTO-WIPE GUARD INSPECTION MODAL
      ==================================================== */}
      {showShieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setShowShieldModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl relative">
                <FiShield className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Active Security Shield & Auto-Wipe Guard
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ARMED
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zero-Trust Session Integrity & Emergency Data Isolation Telemetry
                </p>
              </div>
            </div>

            {/* Defense Tiles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <FiLock className="text-cyan-400" /> Session Hijacking Defense
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Cryptographic browser fingerprinting ($UA + Screen + Locale + TZ$) validates session integrity on every operation, preventing multi-device takeover.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <FiZap className="text-amber-400" /> Emergency Auto-Wipe Guard
                  </span>
                  <span className="font-mono text-amber-400 font-bold">ARMED</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deterministic zeroization protocol purges all 10 operational compliance collections back to 0 records instantly upon detected session anomaly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <FiCpu className="text-emerald-400" /> Reactive State Synchronization
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">ONLINE</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Global <code className="text-slate-300 font-mono text-[10px]">grc-storage-update</code> event bus guarantees instant reactive state without manual refresh triggers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <FiCheckCircle className="text-blue-400" /> Data Enclave Boundary
                  </span>
                  <span className="font-mono text-blue-400 font-bold">ISOLATED</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  100% Client-Side LocalStorage state engine. Zero unauthenticated external network requests or cross-tenant data leaks.
                </p>
              </div>
            </div>

            {/* Diagnostic Footer */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Active Operator: <strong className="text-slate-200">{fullName}</strong></span>
              <span className="text-cyan-400">Enclave: Verified</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowShieldModal(false);
                  navigate("/compliance");
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>View Audit Trail</span>
                <FiArrowRight className="text-xs" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowShieldModal(false);
                    navigate("/profile");
                  }}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
                >
                  Manage Security Lock
                </button>
                <button
                  type="button"
                  onClick={() => setShowShieldModal(false)}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-cyan-600/30"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({ label, value, color }) => {
  return (
    <div className="bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 h-[110px] p-4 flex flex-col items-center justify-center text-center hover:border-slate-700 transition">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </h2>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  );
};

// ============================================================
// QUICK ACTION
// ============================================================

const QuickAction = ({ label, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        ${className}
        w-full
        h-[42px]
        rounded-lg
        text-white
        text-sm
        font-medium
        transition
        cursor-pointer
        shadow-md
      `}
    >
      {label}
    </button>
  );
};

// ============================================================
// CHART CARD
// ============================================================

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 p-5 h-[340px] flex flex-col overflow-hidden">
      <h2 className="text-base font-bold text-white mb-2 shrink-0">
        {title}
      </h2>
      <div className="flex-1 min-h-0 w-full">
        {children}
      </div>
    </div>
  );
};

// ============================================================
// EMPTY CHART
// ============================================================

const EmptyChartState = ({ message = "No records found in database." }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-sm py-8">
      <FiFolder className="w-8 h-8 text-slate-600 mb-2" />
      <p className="font-medium text-slate-400">{message}</p>
    </div>
  );
};

// ============================================================
// RECENT TABLE
// ============================================================

const RecentTable = ({
  title,
  columns,
  rows,
  renderRow,
  last,
  onAddNew,
  addNewLabel = "Add / Create New",
}) => {
  return (
    <div
      className={`bg-slate-900/80 rounded-xl shadow-lg border border-slate-800 p-5 overflow-hidden ${
        last ? "" : "mb-6"
      }`}
    >
      <h2 className="text-base font-bold text-white mb-4">
        {title}
      </h2>

      <div className="w-full overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full min-w-[650px] table-fixed border-collapse text-left text-sm text-slate-300">
          <thead>
            <tr className="bg-slate-800/90 text-slate-300 uppercase tracking-wider text-xs font-semibold border-b border-slate-800">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-xs font-semibold whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <FiFolder className="w-7 h-7 text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-400">
                      No records found in database.
                    </p>
                    {onAddNew && (
                      <button
                        onClick={onAddNew}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        {addNewLabel}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const cells = renderRow(row, idx);
                return (
                  <tr
                    key={row.id || idx}
                    className="border-b border-slate-800 text-slate-200 hover:bg-slate-800/50 transition"
                  >
                    {cells.map((cell, index) => (
                      <td
                        key={index}
                        className="px-4 py-3 text-sm text-slate-300 truncate align-middle"
                        title={
                          typeof cell === "string" || typeof cell === "number"
                            ? String(cell)
                            : ""
                        }
                      >
                        {cell !== null && cell !== undefined && cell !== ""
                          ? cell
                          : "-"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// DATE UTILITIES
// ============================================================

function isWithinNext7Days(training) {
  if (!training?.training_date) {
    return false;
  }

  const date = new Date(
    training.training_date
  );

  const now = new Date();

  const diffDays =
    (date - now) /
    (1000 * 60 * 60 * 24);

  return (
    diffDays >= 0 &&
    diffDays <= 7
  );
}

// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateStr) {
  if (!dateStr) {
    return "";
  }

  return new Date(
    dateStr
  ).toLocaleDateString(
    "default",
    {
      month: "short",
      day: "numeric",
    }
  );
}

// ============================================================
// EXPORT
// ============================================================

export default Dashboard;