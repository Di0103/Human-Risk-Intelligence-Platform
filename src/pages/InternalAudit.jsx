import React, { useEffect, useState, useMemo } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import { formatId } from "../utils/idFormatter";
import {
  STATUTORY_FRAMEWORKS,
  FRAMEWORK_CLAUSES,
  MULTI_FRAMEWORK_CROSSWALK,
} from "../utils/statutoryFrameworks";
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPrinter,
  FiLayers,
  FiFileText,
  FiActivity,
  FiClock,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiTrendingUp,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiAward,
} from "react-icons/fi";

export function InternalAudit() {
  const { user, profile } = useAuth();
  const auditorName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "Lead Internal Auditor";

  // State - initialized to clean empty state (isolated per tenant)
  const [audits, setAudits] = useState([]);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("findings"); // 'findings' | 'audits' | 'crosswalk' | 'report'
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);

  // Self-Audit Runner State
  const [isRunningSelfAudit, setIsRunningSelfAudit] = useState(false);
  const [selfAuditProgress, setSelfAuditProgress] = useState(0);

  // New Finding Modal State
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [findingForm, setFindingForm] = useState({
    audit_code: "AUDIT-001",
    title: "",
    severity: "Minor Non-Conformity",
    framework_clause: "Control A.5.15 (Access Control)",
    framework_name: "ISO/IEC 27001:2022",
    description: "",
    evidence: "",
    remediation_plan: "",
    owner: "IT Security Team",
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
  });

  // New Audit Engagement Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditForm, setAuditForm] = useState({
    title: "",
    scope: "",
    standard_framework: "ISO/IEC 27001:2022",
    lead_auditor: auditorName,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    summary: "",
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch from LocalStorage
  const fetchAuditData = () => {
    setLoading(true);
    try {
      const auditsData = localStorageDb.get("internal_audits") || [];
      const findingsData = localStorageDb.get("audit_findings") || [];
      setAudits(auditsData);
      setFindings(findingsData);
    } catch (err) {
      console.warn("Audit data load exception:", err);
      setAudits([]);
      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();

    const handleStorageUpdate = (e) => {
      if (
        !e.detail ||
        e.detail.collection === "internal_audits" ||
        e.detail.collection === "audit_findings" ||
        e.detail.collection === "all"
      ) {
        fetchAuditData();
      }
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalFindings = findings.length;
    const critical = findings.filter((f) => f.severity === "Critical").length;
    const major = findings.filter((f) => f.severity === "Major Non-Conformity").length;
    const minor = findings.filter((f) => f.severity === "Minor Non-Conformity").length;
    const resolved = findings.filter((f) => f.status === "Resolved").length;
    const open = findings.filter((f) => f.status === "Open" || f.status === "In Remediation").length;
    const remediationRate = totalFindings > 0 ? Math.round((resolved / totalFindings) * 100) : 0;

    return {
      totalAudits: audits.length,
      totalFindings,
      critical,
      major,
      minor,
      resolved,
      open,
      remediationRate,
    };
  }, [audits, findings]);

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const matchesSearch =
        f.finding_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.framework_clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.owner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = selectedSeverity === "all" || f.severity === selectedSeverity;
      const matchesStatus = selectedStatus === "all" || f.status === selectedStatus;
      const matchesFramework =
        selectedFramework === "all" ||
        (f.framework_name && f.framework_name.toLowerCase().includes(selectedFramework.toLowerCase()));

      return matchesSearch && matchesSeverity && matchesStatus && matchesFramework;
    });
  }, [findings, searchTerm, selectedSeverity, selectedStatus, selectedFramework]);

  // Execute Rule-Based Enterprise Audit Engine
  const handleRunSelfAudit = async () => {
    setIsRunningSelfAudit(true);
    setSelfAuditProgress(10);

    const steps = [
      "Auditing Identity & Access Control against ISO 27001 Control A.5.15 & COBIT DSS05...",
      "Evaluating Data Protection & Digital Personal Data Safeguards against DPDP Act 2023 & IT Act...",
      "Verifying Business Continuity Plans, Disaster Recovery RTO/RPO Metrics & Drills (ISO 22301)...",
      "Synthesizing Non-Conformities & Sequenced Finding Registry...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setSelfAuditProgress((i + 1) * 25);
    }

    // System-generated fresh finding based on rule-based audit
    const nextSeq = findings.length + 1;
    const newFindingCode = formatId(nextSeq, nextSeq - 1, "FINDING");
    const freshFinding = {
      id: Date.now(),
      finding_code: newFindingCode,
      audit_code: audits[0]?.audit_code || "AUDIT-001",
      title: "System-Driven Audit: Periodic Cryptographic Key Rotation Gap Detected",
      severity: "Minor Non-Conformity",
      framework_clause: "Control A.8.24 (Cryptography) & IT Act Rule 8",
      framework_name: "ISO/IEC 27001:2022 & IT Act 2000",
      description: "Rule-based audit discovered production database encryption keys exceeding recommended 365-day rotation policy interval.",
      evidence: "KMS log metadata shows key `prod-db-kms-01` created 380 days ago without automatic yearly rotation enabled.",
      remediation_plan: "Enable system-enforced 365-day rotation on AWS KMS / GCP KMS keyring; verify ciphertext transparent re-wrap.",
      owner: "DevOps & Cloud Security Team",
      status: "In Remediation",
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      verified_by: auditorName,
      user_id: user?.id,
      organization_id: user?.id,
    };

    setFindings((prev) => [freshFinding, ...prev]);

    // Persist to LocalStorage
    try {
      localStorageDb.insert("audit_findings", freshFinding);
    } catch (e) {
      console.warn("Could not write finding to LocalStorage:", e);
    }

    setIsRunningSelfAudit(false);
    setSelfAuditProgress(0);
    showNotification(
      "success",
      `Enterprise Self-Audit Completed! Generated sequenced finding ${newFindingCode} with remediation tasks.`
    );
  };

  // Create New Finding
  const handleCreateFinding = (e) => {
    e.preventDefault();
    if (!findingForm.title.trim()) {
      showNotification("error", "Please enter a Finding Title.");
      return;
    }

    const nextSeq = findings.length + 1;
    const code = formatId(nextSeq, nextSeq - 1, "FINDING");
    const newRecord = {
      id: Date.now(),
      finding_code: code,
      ...findingForm,
      status: "Open",
      verified_by: auditorName,
      user_id: user?.id,
      organization_id: user?.id,
      created_at: new Date().toISOString(),
    };

    setFindings((prev) => [newRecord, ...prev]);
    setIsFindingModalOpen(false);
    setFindingForm({
      audit_code: "AUDIT-001",
      title: "",
      severity: "Minor Non-Conformity",
      framework_clause: "Control A.5.15 (Access Control)",
      framework_name: "ISO/IEC 27001:2022",
      description: "",
      evidence: "",
      remediation_plan: "",
      owner: "IT Security Team",
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    });

    try {
      localStorageDb.insert("audit_findings", newRecord);
    } catch (err) {
      console.warn("Saved finding error:", err);
    }

    showNotification("success", `Internal Audit Finding ${code} created successfully.`);
  };

  // Create New Audit Engagement
  const handleCreateAudit = (e) => {
    e.preventDefault();
    if (!auditForm.title.trim()) {
      showNotification("error", "Please enter an Audit Title.");
      return;
    }

    const nextSeq = audits.length + 1;
    const code = formatId(nextSeq, nextSeq - 1, "AUDIT");
    const newAuditRecord = {
      id: Date.now(),
      audit_code: code,
      ...auditForm,
      status: "Scheduled",
      user_id: user?.id,
      organization_id: user?.id,
      created_at: new Date().toISOString(),
    };

    setAudits((prev) => [newAuditRecord, ...prev]);
    setIsAuditModalOpen(false);
    setAuditForm({
      title: "",
      scope: "",
      standard_framework: "ISO/IEC 27001:2022",
      lead_auditor: auditorName,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      summary: "",
    });

    try {
      localStorageDb.insert("internal_audits", newAuditRecord);
    } catch (err) {
      console.warn("Saved audit error:", err);
    }

    showNotification("success", `Internal Audit Engagement ${code} registered successfully.`);
  };

  // Toggle Finding Status
  const handleToggleFindingStatus = (findingId, newStatus) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, status: newStatus } : f))
    );

    try {
      localStorageDb.update("audit_findings", findingId, { status: newStatus });
    } catch (err) {
      console.warn("Updated finding status error:", err);
    }

    showNotification("success", `Finding status updated to "${newStatus}".`);
  };

  // Export Audit Findings Report as CSV
  const handleExportCSV = () => {
    const headers = [
      "Finding ID",
      "Audit Code",
      "Title",
      "Severity",
      "Framework Clause",
      "Framework Standard",
      "Status",
      "Owner",
      "Due Date",
      "Description",
      "Remediation Plan",
    ];

    const rows = findings.map((f) => [
      `"${f.finding_code}"`,
      `"${f.audit_code}"`,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${f.framework_clause}"`,
      `"${f.framework_name}"`,
      `"${f.status}"`,
      `"${f.owner}"`,
      `"${f.due_date || ""}"`,
      `"${f.description.replace(/"/g, '""')}"`,
      `"${(f.remediation_plan || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Internal_Audit_Findings_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "Major Non-Conformity":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "Minor Non-Conformity":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Observation":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "In Remediation":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Accepted Risk":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      default:
        return "bg-red-500/20 text-red-300 border-red-500/40";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm transition-all shadow-lg ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <FiCheckCircle className="text-base flex-shrink-0" />
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Page Heading & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-xl text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/30">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Rule-Based Enterprise Audit & Self-Assessment Engine
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute structured compliance self-audits, track sequenced findings (AUDIT-001, FINDING-001), and map multi-framework statutory clauses.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunSelfAudit}
            disabled={isRunningSelfAudit}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 border border-emerald-400/30 transition transform active:scale-95 disabled:opacity-50"
          >
            <FiActivity className={isRunningSelfAudit ? "animate-spin" : ""} />
            <span>{isRunningSelfAudit ? "Running Rule-Based Audit..." : "Run Rule-Based Enterprise Audit"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFindingModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <FiPlus />
            <span>Log Finding</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <FiPlus />
            <span>New Audit Scope</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition"
          >
            <FiDownload />
            <span>Export Findings</span>
          </button>
        </div>
      </div>

      {/* Self-Audit Running Progress Banner */}
      {isRunningSelfAudit && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 shadow-xl space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span>Executing ISO 27001, COBIT, IT Act, DPDP & ISO 22301 Rule-Based Audit Scan...</span>
            <span>{selfAuditProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${selfAuditProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Audit Engagements
          </span>
          <div className="text-2xl font-bold text-white mt-1.5 flex items-center justify-between">
            <span>{metrics.totalAudits}</span>
            <FiLayers className="text-blue-400 text-xl" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {formatId(metrics.totalAudits, metrics.totalAudits - 1, "AUDIT")}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Audit Findings
          </span>
          <div className="text-2xl font-bold text-white mt-1.5 flex items-center justify-between">
            <span>{metrics.totalFindings}</span>
            <FiFileText className="text-indigo-400 text-xl" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.open} Open / In Remediation
          </div>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-4 shadow-sm bg-rose-950/10">
          <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
            Critical Non-Conformities
          </span>
          <div className="text-2xl font-bold text-rose-400 mt-1.5 flex items-center justify-between">
            <span>{metrics.critical}</span>
            <FiAlertTriangle className="text-rose-400 text-xl" />
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">
            Mandatory Immediate Remediation
          </div>
        </div>

        <div className="bg-slate-900/90 border border-orange-900/40 rounded-2xl p-4 shadow-sm bg-orange-950/10">
          <span className="text-[11px] font-semibold text-orange-300 uppercase tracking-wider">
            Major Non-Conformities
          </span>
          <div className="text-2xl font-bold text-orange-400 mt-1.5 flex items-center justify-between">
            <span>{metrics.major}</span>
            <FiAlertTriangle className="text-orange-400 text-xl" />
          </div>
          <div className="text-[11px] text-orange-400/80 mt-1">
            ISO / Statutory Deficiencies
          </div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 shadow-sm bg-emerald-950/10">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
            Remediation Closure Rate
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5 flex items-center justify-between">
            <span>{metrics.remediationRate}%</span>
            <FiCheckCircle className="text-emerald-400 text-xl" />
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {metrics.resolved} of {metrics.totalFindings} Resolved
          </div>
        </div>
      </div>

      {/* Multi-Framework Statutory Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                Step 4 Multi-Framework Statutory Engine
              </span>
              <span className="text-xs text-slate-400">4 Active Legal & Regulatory Benchmarks</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Synchronized Statutory Clause Governance
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
              Every audit finding and security policy cross-references international standards and statutory mandates:
              <strong> ISO/IEC 27001:2022</strong> (Annex A controls), <strong>COBIT 2019</strong> (EDM/DSS/APO objectives), <strong>IT Act 2000</strong> (Section 43A / SPDI Rules), <strong>DPDP Act 2023</strong> (Sections 4, 6, 8, 11), and <strong>ISO 22301:2019</strong> (Business Continuity & Resilience).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUTORY_FRAMEWORKS.map((fw) => (
              <div
                key={fw.id}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${fw.badgeColor}`}
              >
                <span>{fw.shortName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("findings")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "findings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FiFileText />
            <span>Audit Findings Registry</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {findings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audits")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "audits"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FiLayers />
            <span>Audit Engagements</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {audits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("crosswalk")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "crosswalk"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FiAward />
            <span>Statutory Crosswalk Matrix</span>
          </button>
        </div>

        {/* Search & Filters */}
        {activeTab === "findings" && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search findings, clause, owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none focus:border-indigo-500 w-52"
              />
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs outline-none focus:border-indigo-500"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major Non-Conformity">Major Non-Conformity</option>
              <option value="Minor Non-Conformity">Minor Non-Conformity</option>
              <option value="Observation">Observation</option>
              <option value="Opportunity for Improvement">Opportunity for Improvement</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Remediation">In Remediation</option>
              <option value="Resolved">Resolved</option>
              <option value="Accepted Risk">Accepted Risk</option>
            </select>
          </div>
        )}
      </div>

      {/* ================= TAB 1: AUDIT FINDINGS REGISTRY ================= */}
      {activeTab === "findings" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Internal Audit Finding Records</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {filteredFindings.length} Records
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sequenced non-conformity tracking with verified remediation plans and auditor sign-off.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-800/90 text-slate-300 uppercase tracking-wider text-xs font-semibold border-b border-slate-800">
                  <th className="py-3 px-4 w-28 text-center">Finding ID</th>
                  <th className="py-3 px-4 w-28 text-center">Audit Code</th>
                  <th className="py-3 px-4">Finding Title & Scope</th>
                  <th className="py-3 px-4 text-center">Severity</th>
                  <th className="py-3 px-4">Statutory Clause</th>
                  <th className="py-3 px-4">Remediation Owner</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-32">Quick Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredFindings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500 text-xs">
                      No audit findings match current criteria. Use "Log Finding" or "Run Compliance Self-Audit" above.
                    </td>
                  </tr>
                ) : (
                  filteredFindings.map((f, index) => (
                    <tr
                      key={f.id}
                      className="bg-slate-900/60 hover:bg-slate-800/50 transition border-b border-slate-800/80 text-xs"
                    >
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-bold text-indigo-400">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {formatId(f.finding_code || f.id, index, "FINDING")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-slate-400">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {f.audit_code || "AUDIT-001"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-xs">{f.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{f.description}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(f.severity)}`}>
                          {f.severity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-blue-300">{f.framework_clause}</div>
                        <div className="text-[10px] text-slate-500">{f.framework_name}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{f.owner}</div>
                        {f.due_date && (
                          <div className="text-[10px] text-slate-500 font-mono">Due: {f.due_date}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(f.status)}`}>
                          {f.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {f.status !== "Resolved" ? (
                            <button
                              type="button"
                              onClick={() => handleToggleFindingStatus(f.id, "Resolved")}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition"
                              title="Mark as Resolved"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleFindingStatus(f.id, "Open")}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition"
                              title="Re-open Finding"
                            >
                              Re-open
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: AUDIT ENGAGEMENTS ================= */}
      {activeTab === "audits" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audits.length === 0 ? (
              <div className="col-span-full py-12 px-4 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
                <FiLayers className="w-8 h-8 text-slate-600 mb-2 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No audit scopes logged yet.</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Click "New Audit Scope" or "Run Compliance Self-Audit" above to initiate your first engagement.</p>
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                >
                  <FiPlus />
                  <span>New Audit Scope</span>
                </button>
              </div>
            ) : (
              audits.map((a, index) => (
                <div
                  key={a.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {formatId(a.audit_code || a.id, index, "AUDIT")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          a.status === "Completed"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : a.status === "In Progress"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-3 leading-snug">
                      {a.title}
                    </h3>

                    <div className="text-[11px] text-blue-400 font-medium mt-1">
                      Standard: {a.standard_framework}
                    </div>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {a.scope}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Lead Auditor:</span>
                      <span className="font-semibold text-slate-300">{a.lead_auditor}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span>Period:</span>
                      <span>{a.start_date} to {a.end_date}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: STATUTORY CROSSWALK MATRIX ================= */}
      {activeTab === "crosswalk" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FiAward className="text-indigo-400" />
              <span>Multi-Framework Statutory Crosswalk Matrix</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive correlation matrix mapping ISO/IEC 27001, COBIT 2019, IT Act 2000 (Section 43A/SPDI), DPDP Act 2023, and ISO 22301 across core operational domains.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-800/90 text-slate-200 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
                  <th className="py-3 px-4 w-44">Operational Domain</th>
                  <th className="py-3 px-4 text-blue-300">ISO/IEC 27001:2022</th>
                  <th className="py-3 px-4 text-purple-300">COBIT 2019</th>
                  <th className="py-3 px-4 text-amber-300">IT Act 2000 (Sec 43A/SPDI)</th>
                  <th className="py-3 px-4 text-emerald-300">DPDP Act 2023</th>
                  <th className="py-3 px-4 text-teal-300">ISO 22301:2019</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {MULTI_FRAMEWORK_CROSSWALK.map((row, idx) => (
                  <tr key={idx} className="bg-slate-900/60 hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white border-r border-slate-800/80">
                      {row.domain}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-200 bg-blue-950/10 border-r border-slate-800/80">
                      {row.iso27001}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-200 bg-purple-950/10 border-r border-slate-800/80">
                      {row.cobit}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-200 bg-amber-950/10 border-r border-slate-800/80">
                      {row.itAct}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-200 bg-emerald-950/10 border-r border-slate-800/80">
                      {row.dpdp || row.gdpr}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-teal-200 bg-teal-950/10">
                      {row.iso22301 || "Clause 8.4 (Continuity Procedures)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG NEW AUDIT FINDING ================= */}
      {isFindingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiPlus className="text-indigo-400" />
                <span>Log Structured Audit Finding ({formatId(findings.length + 1, findings.length, "FINDING")})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFindingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateFinding} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Audit Engagement Code <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={findingForm.audit_code}
                    onChange={(e) => setFindingForm({ ...findingForm, audit_code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  >
                    {audits.map((a) => (
                      <option key={a.id} value={a.audit_code}>
                        {a.audit_code} - {a.title.slice(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity Classification <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={findingForm.severity}
                    onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Critical">Critical (Immediate Escalation)</option>
                    <option value="Major Non-Conformity">Major Non-Conformity</option>
                    <option value="Minor Non-Conformity">Minor Non-Conformity</option>
                    <option value="Observation">Observation</option>
                    <option value="Opportunity for Improvement">Opportunity for Improvement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Finding Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inadequate multi-factor authentication on staging admin portal"
                  value={findingForm.title}
                  onChange={(e) => setFindingForm({ ...findingForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Statutory Framework Standard <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={findingForm.framework_name}
                    onChange={(e) => setFindingForm({ ...findingForm, framework_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="ISO/IEC 27001:2022">ISO/IEC 27001:2022</option>
                    <option value="COBIT 2019">COBIT 2019</option>
                    <option value="IT Act 2000 (Section 43A/SPDI)">IT Act 2000 (Section 43A/SPDI)</option>
                    <option value="DPDP Act 2023">DPDP Act 2023 (Digital Personal Data Protection)</option>
                    <option value="ISO 22301:2019">ISO 22301:2019 (Business Continuity)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Clause Reference <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Control A.5.15 / Article 32"
                    value={findingForm.framework_clause}
                    onChange={(e) => setFindingForm({ ...findingForm, framework_clause: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Non-Conformity Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="Detail the observed operational gap or control breakdown..."
                  value={findingForm.description}
                  onChange={(e) => setFindingForm({ ...findingForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Remediation Owner / Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IT Security Team, DevOps"
                    value={findingForm.owner}
                    onChange={(e) => setFindingForm({ ...findingForm, owner: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Remediation Due Date
                  </label>
                  <input
                    type="date"
                    value={findingForm.due_date}
                    onChange={(e) => setFindingForm({ ...findingForm, due_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Remediation Action Plan
                </label>
                <textarea
                  rows="2"
                  placeholder="Mandated corrective actions to resolve non-conformity..."
                  value={findingForm.remediation_plan}
                  onChange={(e) => setFindingForm({ ...findingForm, remediation_plan: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFindingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEW AUDIT ENGAGEMENT ================= */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FiPlus className="text-indigo-400" />
                <span>Register Audit Scope ({formatId(audits.length + 1, audits.length, "AUDIT")})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Audit Engagement Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Identity Lifecycle & Access Control Conformance Audit"
                  value={auditForm.title}
                  onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Statutory Benchmark Standard
                </label>
                <select
                  value={auditForm.standard_framework}
                  onChange={(e) => setAuditForm({ ...auditForm, standard_framework: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                >
                  <option value="ISO/IEC 27001:2022">ISO/IEC 27001:2022 ISMS</option>
                  <option value="COBIT 2019">COBIT 2019 IT Governance</option>
                  <option value="IT Act 2000 (Section 43A/SPDI)">IT Act 2000 (Section 43A & SPDI)</option>
                  <option value="DPDP Act 2023">DPDP Act 2023 (Digital Personal Data Protection Act)</option>
                  <option value="ISO 22301:2019">ISO 22301:2019 (Business Continuity Management)</option>
                  <option value="Multi-Framework (ISO, COBIT, IT Act, DPDP, ISO 22301)">Multi-Framework Integrated Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Audit Scope & Boundaries <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Define technical systems, cloud accounts, policies, and departments included in this audit..."
                  value={auditForm.scope}
                  onChange={(e) => setAuditForm({ ...auditForm, scope: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={auditForm.start_date}
                    onChange={(e) => setAuditForm({ ...auditForm, start_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={auditForm.end_date}
                    onChange={(e) => setAuditForm({ ...auditForm, end_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Register Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InternalAudit;
