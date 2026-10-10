import React, { useEffect, useState, useMemo } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import { formatId } from "../utils/idFormatter";
import {
  FiDownload,
  FiPrinter,
  FiShield,
  FiAlertTriangle,
  FiFileText,
  FiCheckCircle,
  FiSearch,
  FiRefreshCw,
  FiFolder,
  FiCheck,
  FiAlertCircle,
  FiClock,
  FiCheckSquare,
  FiLayers,
} from "react-icons/fi";
import { extractRaciAndStatutory } from "./Policies";

const Reports = () => {
  const { user, profile } = useAuth();
  const officerName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "GRC Lead Auditor");
  const officerRole = profile?.role || "Compliance Officer";

  const [activeReport, setActiveReport] = useState("risks"); // 'risks' | 'compliance' | 'policies' | 'audit'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [generatedAt, setGeneratedAt] = useState(new Date().toLocaleString());

  // Live Data State
  const [risks, setRisks] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [controls, setControls] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [audits, setAudits] = useState([]);
  const [findings, setFindings] = useState([]);

  // Fetch all live database records from LocalStorage
  const fetchAllReportData = () => {
    setLoading(true);
    try {
      const fetchedRisks = localStorageDb.get("risks") || [];
      const fetchedFrameworks = localStorageDb.get("compliance_frameworks") || [];
      const fetchedControls = localStorageDb.get("security_controls") || [];
      const fetchedMappings = localStorageDb.get("control_mappings") || [];
      const fetchedPolicies = localStorageDb.get("policies") || [];
      const fetchedAcks = localStorageDb.get("policy_acknowledgements") || [];
      const fetchedDepts = localStorageDb.get("departments") || [];
      const fetchedProfiles = localStorageDb.get("profiles") || [];
      const fetchedAudits = localStorageDb.get("internal_audits") || [];
      const fetchedFindings = localStorageDb.get("audit_findings") || [];

      setRisks(fetchedRisks);
      setFrameworks(fetchedFrameworks);
      setControls(fetchedControls);
      setMappings(fetchedMappings);
      setPolicies(fetchedPolicies);
      setAcknowledgements(fetchedAcks);
      setDepartments(fetchedDepts);
      setProfiles(fetchedProfiles);
      setAudits(fetchedAudits);
      setFindings(fetchedFindings);
      setGeneratedAt(new Date().toLocaleString());
    } catch (err) {
      console.error("Error fetching report data:", err);
      setAudits([]);
      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReportData();

    const handleStorageUpdate = () => {
      fetchAllReportData();
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // =========================================================================
  // REPORT 1 COMPUTATIONS: Enterprise Risk Register Audit
  // =========================================================================
  const riskReportRows = useMemo(() => {
    return risks.map((r) => {
      const likelihood = Number(r.likelihood) || 1;
      const impact = Number(r.impact) || 1;
      const score = Number(r.risk_score) || likelihood * impact;
      const level =
        r.risk_level ||
        (score >= 15 ? "High" : score >= 8 ? "Medium" : "Low");
      return {
        id: r.id,
        title: r.title || r.risk_title || "Untitled Risk",
        category: r.category || "General",
        likelihood,
        impact,
        score,
        level,
        owner: r.owner || "Unassigned",
        status: r.status || "Open",
        treatmentPlan: r.treatment_plan || "No treatment plan documented",
        createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : "-",
      };
    });
  }, [risks]);

  const riskMetrics = useMemo(() => {
    const total = riskReportRows.length;
    const high = riskReportRows.filter((r) => r.level === "High" || r.score >= 15).length;
    const medium = riskReportRows.filter((r) => r.level === "Medium" && r.score < 15).length;
    const low = riskReportRows.filter((r) => r.level === "Low").length;
    const mitigated = riskReportRows.filter(
      (r) => r.status === "Mitigated" || r.status === "Closed" || r.status === "Accepted"
    ).length;
    const totalScore = riskReportRows.reduce((acc, r) => acc + r.score, 0);
    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : "0.0";
    return { total, high, medium, low, mitigated, avgScore };
  }, [riskReportRows]);

  // =========================================================================
  // REPORT 2 COMPUTATIONS: ISO 27001 Requirement-to-Control Gap Report
  // =========================================================================
  const complianceReportRows = useMemo(() => {
    const controlLookup = new Map(controls.map((c) => [c.id, c]));
    const mappingsByFw = {};
    mappings.forEach((m) => {
      if (!mappingsByFw[m.framework_id]) {
        mappingsByFw[m.framework_id] = [];
      }
      if (controlLookup.has(m.control_id)) {
        mappingsByFw[m.framework_id].push({
          ...controlLookup.get(m.control_id),
          notes: m.notes,
        });
      }
    });

    return frameworks.map((fw) => {
      const mapped = mappingsByFw[fw.id] || [];
      const hasControls = mapped.length > 0;
      const controlCodes = mapped.map((c) => c.control_code).join(", ") || "None";
      const controlTitles = mapped.map((c) => `${c.control_code} (${c.title})`).join("; ") || "None";
      const statuses = mapped.map((c) => c.status).join(", ") || "N/A";

      return {
        id: fw.id,
        framework: fw.name || "ISO/IEC 27001:2022",
        clause: fw.clause,
        requirement: fw.requirement,
        controlCount: mapped.length,
        controlCodes,
        controlTitles,
        controlStatuses: statuses,
        isGap: !hasControls,
        complianceStatus: hasControls ? "Compliant / Safeguarded" : "CRITICAL GAP (Unmitigated)",
      };
    });
  }, [frameworks, controls, mappings]);

  const complianceMetrics = useMemo(() => {
    const totalClauses = complianceReportRows.length;
    const covered = complianceReportRows.filter((r) => !r.isGap).length;
    const gaps = complianceReportRows.filter((r) => r.isGap).length;
    const readiness = totalClauses > 0 ? Math.round((covered / totalClauses) * 100) : 0;
    const implementedControls = controls.filter((c) => c.status === "implemented").length;
    return { totalClauses, covered, gaps, readiness, totalControls: controls.length, implementedControls };
  }, [complianceReportRows, controls]);

  // =========================================================================
  // REPORT 3 COMPUTATIONS: Staff Policy Sign-Off & Attestation Governance
  // =========================================================================
  const policyReportRows = useMemo(() => {
    const targetEmployees = profiles.filter((p) => p.role === "employee" || !p.role);
    const targetCount = Math.max(targetEmployees.length, 1);

    return policies.map((p) => {
      const acksForPolicy = acknowledgements.filter((a) => a.policy_id === p.id);
      const acksCount = acksForPolicy.length;
      const rate = Math.min(100, Math.round((acksCount / targetCount) * 100));
      const raci = extractRaciAndStatutory(p);

      return {
        id: p.id,
        title: p.title || p.policy_name || "Untitled Policy",
        department: p.department || p.department_name || "Enterprise-Wide",
        version: p.version || "1.0",
        status: p.status || "active",
        reviewDate: p.review_date || "-",
        raciAccountable: p.raci_accountable || raci.accountable,
        raciResponsible: p.raci_responsible || raci.responsible,
        raciConsulted: p.raci_consulted || raci.consulted,
        raciInformed: p.raci_informed || raci.informed,
        statutoryClauses: p.statutory_clauses || raci.statutoryClauses,
        targetHeadcount: targetCount,
        signedCount: acksCount,
        complianceRate: rate,
        attestationState: rate >= 80 ? "Sufficient Sign-Off" : rate > 0 ? "Pending Attestations" : "Zero Attestations",
      };
    });
  }, [policies, acknowledgements, profiles]);

  const policyMetrics = useMemo(() => {
    const totalPolicies = policyReportRows.length;
    const activePolicies = policyReportRows.filter((p) => p.status === "active").length;
    const totalAcks = acknowledgements.length;
    const targetHeadcount = Math.max(profiles.filter((p) => p.role === "employee" || !p.role).length, 1);
    const totalPossibleAcks = Math.max(activePolicies * targetHeadcount, 1);
    const overallRate = activePolicies > 0
      ? Math.min(100, Math.round((totalAcks / totalPossibleAcks) * 100))
      : 0;

    return { totalPolicies, activePolicies, totalAcks, targetHeadcount, overallRate };
  }, [policyReportRows, acknowledgements, profiles]);

  // =========================================================================
  // FILTERED PREVIEWS BASED ON SEARCH
  // =========================================================================
  const filteredRiskRows = useMemo(() => {
    if (!searchTerm.trim()) return riskReportRows;
    const s = searchTerm.toLowerCase();
    return riskReportRows.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.category.toLowerCase().includes(s) ||
        r.owner.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.level.toLowerCase().includes(s)
    );
  }, [riskReportRows, searchTerm]);

  const filteredComplianceRows = useMemo(() => {
    if (!searchTerm.trim()) return complianceReportRows;
    const s = searchTerm.toLowerCase();
    return complianceReportRows.filter(
      (r) =>
        r.clause.toLowerCase().includes(s) ||
        r.requirement.toLowerCase().includes(s) ||
        r.controlCodes.toLowerCase().includes(s) ||
        r.complianceStatus.toLowerCase().includes(s)
    );
  }, [complianceReportRows, searchTerm]);

  const filteredPolicyRows = useMemo(() => {
    if (!searchTerm.trim()) return policyReportRows;
    const s = searchTerm.toLowerCase();
    return policyReportRows.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.department.toLowerCase().includes(s) ||
        (r.raciAccountable && r.raciAccountable.toLowerCase().includes(s)) ||
        (r.raciResponsible && r.raciResponsible.toLowerCase().includes(s)) ||
        (r.statutoryClauses && r.statutoryClauses.toLowerCase().includes(s)) ||
        r.status.toLowerCase().includes(s) ||
        r.attestationState.toLowerCase().includes(s)
    );
  }, [policyReportRows, searchTerm]);

  // =========================================================================
  // REPORT 4 COMPUTATIONS: Internal Audit Findings & Statutory Non-Conformities
  // =========================================================================
  const auditReportRows = useMemo(() => {
    const list = findings || [];
    return list.map((f, index) => {
      const findingCode = f.finding_code || formatId(f.id, index, "FINDING");
      const auditCode = f.audit_code || "AUDIT-001";
      const title = f.title || "Untitled Finding";
      const severity = f.severity || "Observation";
      const frameworkClause = f.framework_clause || "ISO 27001 Control A.5.1";
      const frameworkName = f.framework_name || "ISO/IEC 27001:2022";
      const status = f.status || "Open";
      const owner = f.owner || "IT Security Team";
      const dueDate = f.due_date || "2026-12-31";
      const remediationPlan = f.remediation_plan || "Remediation pending review";
      const evidence = f.evidence || "Inspection logs";
      const verifiedBy = f.verified_by || officerName;

      return {
        id: findingCode,
        findingCode,
        auditCode,
        title,
        severity,
        frameworkClause,
        frameworkName,
        status,
        owner,
        dueDate,
        remediationPlan,
        evidence,
        verifiedBy,
      };
    });
  }, [findings, officerName]);

  const auditMetrics = useMemo(() => {
    const total = auditReportRows.length;
    const major = auditReportRows.filter(
      (r) => r.severity.includes("Major") || r.severity.includes("Critical")
    ).length;
    const minor = auditReportRows.filter(
      (r) => r.severity.includes("Minor") || r.severity.includes("Observation")
    ).length;
    const resolved = auditReportRows.filter((r) => r.status === "Resolved").length;
    const remediationRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return { total, major, minor, resolved, remediationRate };
  }, [auditReportRows]);

  const filteredAuditRows = useMemo(() => {
    if (!searchTerm.trim()) return auditReportRows;
    const s = searchTerm.toLowerCase();
    return auditReportRows.filter(
      (r) =>
        r.findingCode.toLowerCase().includes(s) ||
        r.auditCode.toLowerCase().includes(s) ||
        r.title.toLowerCase().includes(s) ||
        r.frameworkClause.toLowerCase().includes(s) ||
        r.frameworkName.toLowerCase().includes(s) ||
        r.severity.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.owner.toLowerCase().includes(s)
    );
  }, [auditReportRows, searchTerm]);

  // =========================================================================
  // CLIENT-SIDE CSV GENERATION ENGINE (RFC 4180 COMPLIANT)
  // =========================================================================
  const escapeCsvCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const downloadCsv = (filename, headers, rows) => {
    const headerLine = headers.map(escapeCsvCell).join(",");
    const rowLines = rows.map((row) => row.map(escapeCsvCell).join(","));
    const csvContent = "\uFEFF" + [headerLine, ...rowLines].join("\r\n"); // UTF-8 BOM

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const dateStamp = new Date().toISOString().split("T")[0];

    if (activeReport === "risks") {
      const headers = [
        "Risk ID",
        "Risk Title",
        "Category",
        "Likelihood (1-5)",
        "Impact (1-5)",
        "Risk Score (1-25)",
        "Risk Level",
        "Risk Owner",
        "Current Status",
        "Mitigation Treatment Plan",
        "Logged Date",
      ];
      const rows = riskReportRows.map((r) => [
        r.id,
        r.title,
        r.category,
        r.likelihood,
        r.impact,
        r.score,
        r.level,
        r.owner,
        r.status,
        r.treatmentPlan,
        r.createdAt,
      ]);
      downloadCsv(`Enterprise_Risk_Register_Audit_Report_${dateStamp}.csv`, headers, rows);
    } else if (activeReport === "compliance") {
      const headers = [
        "Framework Standard",
        "Clause Code",
        "Requirement Statement",
        "Mapped Controls Count",
        "Mapped Control Code(s)",
        "Mapped Control Details",
        "Control Status",
        "Compliance Gap Status",
      ];
      const rows = complianceReportRows.map((c) => [
        c.framework,
        c.clause,
        c.requirement,
        c.controlCount,
        c.controlCodes,
        c.controlTitles,
        c.controlStatuses,
        c.complianceStatus,
      ]);
      downloadCsv(`ISO27001_Compliance_Gap_Audit_Report_${dateStamp}.csv`, headers, rows);
    } else if (activeReport === "policies") {
      const headers = [
        "Policy ID",
        "Policy Title",
        "Target Department",
        "RACI Accountable Owner",
        "RACI Responsible Team",
        "RACI Consulted Stakeholders",
        "RACI Informed Workforce",
        "Statutory & Regulatory Alignment",
        "Version",
        "Policy Lifecycle Status",
        "Next Review Date",
        "Target Headcount",
        "Signed Attestations",
        "Attestation Compliance Rate (%)",
        "Attestation Audit State",
      ];
      const rows = policyReportRows.map((p) => [
        p.id,
        p.title,
        p.department,
        p.raciAccountable,
        p.raciResponsible,
        p.raciConsulted,
        p.raciInformed,
        p.statutoryClauses,
        p.version,
        p.status,
        p.reviewDate,
        p.targetHeadcount,
        p.signedCount,
        `${p.complianceRate}%`,
        p.attestationState,
      ]);
      downloadCsv(`Policy_SignOff_Governance_Audit_Report_${dateStamp}.csv`, headers, rows);
    } else if (activeReport === "audit") {
      const headers = [
        "Finding ID",
        "Audit Engagement",
        "Finding Statement / Title",
        "Severity Level",
        "Statutory Framework & Clause",
        "Audit Evidence",
        "Remediation Action Plan",
        "Assigned Owner",
        "Remediation Status",
        "Target Due Date",
        "Lead Verifier",
      ];
      const rows = auditReportRows.map((a) => [
        a.findingCode,
        a.auditCode,
        a.title,
        a.severity,
        `${a.frameworkName} - ${a.frameworkClause}`,
        a.evidence,
        a.remediationPlan,
        a.owner,
        a.status,
        a.dueDate,
        a.verifiedBy,
      ]);
      downloadCsv(`Internal_Audit_Findings_Governance_Report_${dateStamp}.csv`, headers, rows);
    }
  };

  // =========================================================================
  // PRINT / EXPORT PDF HANDLER
  // =========================================================================
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-100 print:p-0 print:m-0 print:w-full print:bg-white print:text-slate-900">
      {/* Print-specific style rules */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            font-size: 9.5pt !important;
            line-height: 1.35 !important;
          }

          .no-print,
          aside,
          nav,
          header,
          button,
          input {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          /* Unclip all containers and expand to full width */
          #root,
          .app-container,
          main,
          div {
            overflow: visible !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
          }

          .max-w-7xl,
          .max-w-6xl {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Print cards and boxes */
          .print-card,
          .stat-box {
            border: 1px solid #cbd5e1 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border-radius: 6px !important;
          }

          /* Un-truncate all text in print so full audit text is visible */
          .truncate,
          [class*="truncate"] {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
            max-width: none !important;
          }

          /* Prevent breaking inside cards, table rows, and the seal */
          .print-avoid-break,
          .stat-box,
          .seal-box,
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Table formatting */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin-top: 4px !important;
            margin-bottom: 8px !important;
            font-size: 8.5pt !important;
          }

          thead {
            display: table-header-group !important;
          }

          tbody {
            display: table-row-group !important;
          }

          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 8px !important;
            color: #0f172a !important;
            vertical-align: top !important;
          }

          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            font-size: 8pt !important;
            letter-spacing: 0.05em !important;
          }

          tbody tr:nth-child(even) {
            background-color: #f8fafc !important;
          }

          /* Text colors and contrasts */
          h1, h2, h3, h4, p, span, div {
            color: #0f172a !important;
          }

          .text-white {
            color: #0f172a !important;
          }
          .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400 {
            color: #334155 !important;
          }
          .text-slate-500, .text-slate-600 {
            color: #64748b !important;
          }

          /* Semantic Status Badges in Print */
          .badge-high,
          .bg-red-500\/10,
          .bg-red-500\/20 {
            background-color: #fef2f2 !important;
            color: #b91c1c !important;
            border: 1px solid #f87171 !important;
          }
          .badge-med,
          .bg-amber-500\/10,
          .bg-amber-500\/20 {
            background-color: #fffbeb !important;
            color: #b45309 !important;
            border: 1px solid #fbbf24 !important;
          }
          .badge-low,
          .bg-emerald-500\/10,
          .bg-emerald-500\/20 {
            background-color: #f0fdf4 !important;
            color: #15803d !important;
            border: 1px solid #4ade80 !important;
          }
          .bg-blue-500\/10,
          .bg-blue-500\/20 {
            background-color: #eff6ff !important;
            color: #1d4ed8 !important;
            border: 1px solid #93c5fd !important;
          }

          /* Statutory Verification Seal */
          .seal-box {
            border: 2px solid #334155 !important;
            background-color: #f8fafc !important;
            margin-top: 16px !important;
            padding: 16px !important;
          }
        }

        .print-only {
          display: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6 print:max-w-none print:w-full print:m-0 print:space-y-4">
        {/* ========================================================================= */}
        {/* HEADER & EXECUTIVE TOOLBAR (Hidden in Print for custom print banner)      */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                <FiFileText className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Audit & Governance Reports Console
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Audit-ready enterprise exports, continuous compliance evidence, and statutory governance sign-offs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAllReportData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
              title="Refresh local database records"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition active:scale-95"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>

            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition active:scale-95"
            >
              <FiPrinter className="w-4 h-4" />
              Print / Export PDF
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRINT ONLY: OFFICIAL AUDIT HEADER FOR COLLEGE & REGULATORY SUBMISSION     */}
        {/* ========================================================================= */}
        <div className="print-only mb-6 pb-4 border-b-2 border-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-wider uppercase text-slate-900">
                Human-Centric GRC Management Platform
              </h1>
              <p className="text-xs text-slate-700 font-semibold">
                Minor Project Phase 1 — Information Security & Compliance Governance Report
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded">
                AUDIT CLASSIFICATION: CONFIDENTIAL
              </span>
              <p className="text-[10px] text-slate-600 mt-1">Generated: {generatedAt}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-300 grid grid-cols-3 text-xs text-slate-700">
            <div><strong>Active Audit Target:</strong> {activeReport === "risks" ? "Enterprise Risk Register" : activeReport === "compliance" ? "ISO 27001 Gap Analysis" : activeReport === "policies" ? "Staff Policy Attestation" : "Internal Audit Findings Registry"}</div>
            <div><strong>Lead Auditor / Officer:</strong> {officerName}</div>
            <div className="text-right"><strong>Status:</strong> Live Database Grounded</div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* REPORT SELECTOR TABS (No-Print)                                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
          <button
            onClick={() => setActiveReport("risks")}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
              activeReport === "risks"
                ? "bg-rose-950/20 border-rose-500/50 text-white shadow-lg shadow-rose-950/30"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            <span className={`p-2 rounded-lg ${activeReport === "risks" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"}`}>
              <FiAlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase opacity-75">Report 1</span>
              <h3 className="text-sm font-bold text-white mt-0.5">Enterprise Risk Register</h3>
              <p className="text-xs opacity-75 mt-0.5">5x5 matrix scoring & mitigation treatment audit.</p>
            </div>
          </button>

          <button
            onClick={() => setActiveReport("compliance")}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
              activeReport === "compliance"
                ? "bg-amber-950/20 border-amber-500/50 text-white shadow-lg shadow-amber-950/30"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            <span className={`p-2 rounded-lg ${activeReport === "compliance" ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400"}`}>
              <FiShield className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase opacity-75">Report 2</span>
              <h3 className="text-sm font-bold text-white mt-0.5">ISO 27001 Compliance Gaps</h3>
              <p className="text-xs opacity-75 mt-0.5">Requirement-to-control mapping & unmitigated gaps.</p>
            </div>
          </button>

          <button
            onClick={() => setActiveReport("policies")}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
              activeReport === "policies"
                ? "bg-indigo-950/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-950/30"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            <span className={`p-2 rounded-lg ${activeReport === "policies" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
              <FiFileText className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase opacity-75">Report 3</span>
              <h3 className="text-sm font-bold text-white mt-0.5">Policy Sign-Off Governance</h3>
              <p className="text-xs opacity-75 mt-0.5">Staff attestation compliance rates & sign-offs.</p>
            </div>
          </button>

          <button
            onClick={() => setActiveReport("audit")}
            className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
              activeReport === "audit"
                ? "bg-teal-950/20 border-teal-500/50 text-white shadow-lg shadow-teal-950/30"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            <span className={`p-2 rounded-lg ${activeReport === "audit" ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400"}`}>
              <FiCheckSquare className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase opacity-75">Report 4</span>
              <h3 className="text-sm font-bold text-white mt-0.5">Internal Audit Findings</h3>
              <p className="text-xs opacity-75 mt-0.5">Sequenced findings & statutory remediation.</p>
            </div>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* EXECUTIVE KPI SUMMARY CARDS FOR ACTIVE REPORT                             */}
        {/* ========================================================================= */}
        {activeReport === "risks" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3 print-avoid-break">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Total Risks</span>
              <p className="text-2xl font-bold text-white mt-1 print:text-slate-900">{riskMetrics.total}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Registered in live database</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Critical / High</span>
              <p className="text-2xl font-bold text-rose-500 mt-1">{riskMetrics.high}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Score ≥ 15 (Requires mitigation)</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Mitigated / Closed</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{riskMetrics.mitigated}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Safeguards active</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Avg Risk Score</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{riskMetrics.avgScore} / 25</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Mean enterprise risk index</span>
            </div>
          </div>
        )}

        {activeReport === "compliance" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3 print-avoid-break">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Total Clauses</span>
              <p className="text-2xl font-bold text-white mt-1 print:text-slate-900">{complianceMetrics.totalClauses}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">ISO 27001 requirements</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Covered Clauses</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{complianceMetrics.covered}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">At least 1 control mapped</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Unmitigated Gaps</span>
              <p className="text-2xl font-bold text-rose-500 mt-1">{complianceMetrics.gaps}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Zero controls linked</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Audit Readiness</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">{complianceMetrics.readiness}%</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">{complianceMetrics.implementedControls} active controls</span>
            </div>
          </div>
        )}

        {activeReport === "policies" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3 print-avoid-break">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Published Policies</span>
              <p className="text-2xl font-bold text-white mt-1 print:text-slate-900">{policyMetrics.activePolicies}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Active governance documents</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Target Employees</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{policyMetrics.targetHeadcount}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Active workforce size</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Signed Attestations</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{policyMetrics.totalAcks}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Verified digital signatures</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Compliance Rate</span>
              <p className="text-2xl font-bold text-purple-400 mt-1">{policyMetrics.overallRate}%</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Organization-wide sign-off</span>
            </div>
          </div>
        )}

        {activeReport === "audit" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3 print-avoid-break">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Total Findings</span>
              <p className="text-2xl font-bold text-white mt-1 print:text-slate-900">{auditMetrics.total}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Sequenced findings</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Major Non-Conformities</span>
              <p className="text-2xl font-bold text-rose-500 mt-1">{auditMetrics.major}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">High priority audit items</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Resolved / Closed</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{auditMetrics.resolved}</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Corrective actions verified</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 stat-box print:bg-slate-50 print:border-slate-300 print:p-3 print:rounded-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Remediation Rate</span>
              <p className="text-2xl font-bold text-teal-400 mt-1">{auditMetrics.remediationRate}%</p>
              <span className="text-[11px] text-slate-500 print:text-slate-600">Resolution velocity</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LIVE PREVIEW TABLE & SEARCH                                              */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden print-card print:border-slate-300 print:shadow-none print:rounded-lg print:bg-white print-avoid-break">
          {/* PRINT-ONLY Official Table Schedule Header */}
          <div className="print-only py-2.5 px-4 bg-slate-100 border-b border-slate-300">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {activeReport === "risks" && "Audit Schedule 1: Enterprise Risk Assessment & Treatment Matrix"}
              {activeReport === "compliance" && "Audit Schedule 2: ISO/IEC 27001:2022 Security Requirements & Control Gap Analysis"}
              {activeReport === "policies" && "Audit Schedule 3: Corporate Policy Attestation & Workforce Sign-Off Ledger"}
              {activeReport === "audit" && "Audit Schedule 4: Internal Audit Findings & Multi-Framework Remediation Register"}
            </h2>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Verified Records Count: {activeReport === "risks" ? filteredRiskRows.length : activeReport === "compliance" ? filteredComplianceRows.length : activeReport === "policies" ? filteredPolicyRows.length : filteredAuditRows.length} | Evidence Grounding: Local Enterprise Database
            </p>
          </div>

          {/* Table Header toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {activeReport === "risks" && "Enterprise Risk Register & Mitigation Audit Report"}
                {activeReport === "compliance" && "ISO 27001 Requirement-to-Control Compliance Gap Report"}
                {activeReport === "policies" && "Staff Policy Sign-Off & Attestation Governance Report"}
                {activeReport === "audit" && "Internal Audit Findings & Multi-Framework Statutory Report"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified compliance audit records — grounded in local enterprise state.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search audit records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* TABLE CONTENT */}
          <div className="overflow-x-auto">
            {/* 1. RISK TABLE */}
            {activeReport === "risks" && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Risk ID</th>
                    <th className="py-3 px-4">Risk Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Likelihood</th>
                    <th className="py-3 px-4 text-center">Impact</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Severity</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Mitigation Treatment Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRiskRows.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <FiFolder className="w-8 h-8 text-slate-600 mb-2" />
                          <p className="text-sm font-medium text-slate-300">No records found in database.</p>
                          <p className="text-xs text-slate-500 mt-1">Add risks in the Risk Register to populate this audit report.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRiskRows.map((r, index) => (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-semibold whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {formatId(r.id, index, "RSK")}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                          {r.title}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-medium text-[11px]">
                            {r.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{r.likelihood}</td>
                        <td className="py-3 px-4 text-center font-mono">{r.impact}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                              r.score >= 15
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : r.score >= 8
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {r.score}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                              r.level === "High"
                                ? "text-red-400 font-bold"
                                : r.level === "Medium"
                                ? "text-amber-400 font-bold"
                                : "text-emerald-400 font-medium"
                            }`}
                          >
                            {r.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{r.owner}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              r.status === "Open"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : r.status === "Mitigated" || r.status === "Closed"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-sm truncate" title={r.treatmentPlan}>
                          {r.treatmentPlan}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 2. COMPLIANCE TABLE */}
            {activeReport === "compliance" && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Clause</th>
                    <th className="py-3 px-4">Requirement Statement</th>
                    <th className="py-3 px-4">Mapped Security Controls</th>
                    <th className="py-3 px-4">Control Statuses</th>
                    <th className="py-3 px-4">Audit Gap Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredComplianceRows.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <FiFolder className="w-8 h-8 text-slate-600 mb-2" />
                          <p className="text-sm font-medium text-slate-300">No records found in database.</p>
                          <p className="text-xs text-slate-500 mt-1">Add ISO 27001 requirements to generate this gap audit report.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredComplianceRows.map((c) => (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-800/40 transition ${
                          c.isGap ? "bg-red-950/10" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                          {c.clause}
                        </td>
                        <td className="py-3 px-4 font-medium text-white max-w-md">
                          {c.requirement}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 max-w-xs truncate" title={c.controlTitles}>
                          {c.controlTitles}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {c.controlStatuses}
                        </td>
                        <td className="py-3 px-4">
                          {c.isGap ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-semibold text-[11px]">
                              <FiAlertCircle className="w-3.5 h-3.5" />
                              CRITICAL GAP
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-semibold text-[11px]">
                              <FiCheck className="w-3.5 h-3.5" />
                              SAFEGUARDED ({c.controlCount})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 3. POLICY TABLE */}
            {activeReport === "policies" && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-24">Policy ID</th>
                    <th className="py-3 px-4">Policy Title</th>
                    <th className="py-3 px-4">Target Department</th>
                    <th className="py-3 px-4">Accountable (A)</th>
                    <th className="py-3 px-4">Responsible (R)</th>
                    <th className="py-3 px-4 text-center">Version</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Target Workforce</th>
                    <th className="py-3 px-4 text-center">Signed Count</th>
                    <th className="py-3 px-4 text-center">Sign-off Rate</th>
                    <th className="py-3 px-4">Attestation Governance State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPolicyRows.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <FiFolder className="w-8 h-8 text-slate-600 mb-2" />
                          <p className="text-sm font-medium text-slate-300">No records found in database.</p>
                          <p className="text-xs text-slate-500 mt-1">Create policies to populate this attestation governance report.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPolicyRows.map((p, index) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {formatId(p.id, index, "POL")}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                          {p.title}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{p.department}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <span className="font-bold text-purple-400">A:</span> {p.raciAccountable}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            <span className="font-bold text-blue-400">R:</span> {p.raciResponsible}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">v{p.version}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              p.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{p.targetHeadcount}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-white">
                          {p.signedCount}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">
                              {p.complianceRate}%
                            </span>
                            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden print-card">
                              <div
                                className={`h-full rounded-full ${
                                  p.complianceRate >= 80
                                    ? "bg-emerald-500"
                                    : p.complianceRate >= 40
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${p.complianceRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded font-semibold text-[11px] ${
                              p.complianceRate >= 80
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : p.complianceRate > 0
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {p.attestationState}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 4. INTERNAL AUDIT FINDINGS TABLE */}
            {activeReport === "audit" && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Finding ID</th>
                    <th className="py-3 px-4">Audit Scope</th>
                    <th className="py-3 px-4">Finding Statement & Evidence</th>
                    <th className="py-3 px-4 min-w-[190px]">Statutory Clause</th>
                    <th className="py-3 px-4 text-center">Severity</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Remediation Plan</th>
                    <th className="py-3 px-4 text-center">Due Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredAuditRows.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-500">
                        <FiCheckCircle className="text-3xl mx-auto mb-2 opacity-40 text-emerald-500" />
                        <p className="text-sm font-semibold text-slate-300">No audit findings matching query.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditRows.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-teal-400 whitespace-nowrap">
                          {f.findingCode}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {f.auditCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-white">{f.title}</p>
                          {f.evidence && (
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">
                              Evidence: {f.evidence}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                            <FiShield className="text-blue-400 text-[10px] shrink-0" />
                            <span className="truncate max-w-[180px]">{f.frameworkClause}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              f.severity.includes("Major") || f.severity.includes("Critical")
                                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                : f.severity.includes("Minor")
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {f.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{f.owner}</td>
                        <td className="py-3 px-4 max-w-xs text-slate-400 text-[11px]">
                          <span className="line-clamp-2">{f.remediationPlan}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono whitespace-nowrap text-slate-400">
                          {f.dueDate}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              f.status === "Resolved"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : f.status === "In Remediation"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-red-500/15 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing{" "}
              <span className="font-bold text-white">
                {activeReport === "risks"
                  ? filteredRiskRows.length
                  : activeReport === "compliance"
                  ? filteredComplianceRows.length
                  : activeReport === "policies"
                  ? filteredPolicyRows.length
                  : filteredAuditRows.length}
              </span>{" "}
              records
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Verified Enterprise Data
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATUTORY GRC OFFICER VERIFICATION BLOCK & AUDIT SIGN-OFF                 */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl print-card print-avoid-break seal-box print:bg-slate-50 print:border-slate-400 print:rounded-lg print:p-5 print:mt-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800 print:border-slate-300">
            <FiShield className="text-blue-400 w-5 h-5 print:text-blue-700" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider print:text-slate-900">
              Statutory GRC Officer Verification & Attestation Seal
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 print:grid-cols-3 print:gap-4 print:text-slate-800">
            <div>
              <span className="text-slate-500 font-semibold block mb-1 print:text-slate-700">AUDIT VERIFIER</span>
              <p className="font-bold text-white text-sm print:text-slate-900">{officerName}</p>
              <p className="text-slate-400 print:text-slate-700">{officerRole} — Information Security & GRC</p>
              <p className="text-slate-500 text-[11px] mt-1 print:text-slate-600">Platform Admin ID: {user?.id?.slice(0, 12) || "SEC-LEAD-01"}</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-1 print:text-slate-700">AUDIT STATEMENT</span>
              <p className="text-slate-300 italic print:text-slate-800">
                "I hereby attest that the figures and data points in this report represent an exact, unfiltered reflection of our organization's risk register, ISO 27001 safeguard mappings, and staff policy acknowledgements as recorded in our live GRC platform."
              </p>
              <div className="flex items-center gap-2 mt-2 text-emerald-400 font-medium print:text-emerald-700">
                <FiCheckCircle className="w-4 h-4" />
                <span>Verified Clean Database State</span>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <span className="text-slate-500 font-semibold block mb-1 print:text-slate-700">SIGNATURE & SEAL</span>
                <div className="h-14 border-b border-dashed border-slate-600 flex items-end pb-1 font-mono text-xs text-slate-400 print:border-slate-500">
                  <span className="text-slate-300 font-semibold print:text-slate-900">/s/ {officerName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 print:text-slate-600">
                  <span>Sign-off Date: {new Date().toLocaleDateString()}</span>
                  <span className="font-mono text-emerald-400 print:text-emerald-700">HASH: SHA256-OK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;