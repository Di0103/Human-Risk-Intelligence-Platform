import React, { useEffect, useState, useMemo } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import { formatId } from "../utils/idFormatter";
import {
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiX,
  FiLayers,
  FiExternalLink,
  FiShield,
  FiCalendar,
  FiCheckSquare,
  FiUsers,
  FiInfo,
  FiBookmark,
  FiAward,
} from "react-icons/fi";
import {
  resolveMultiFrameworkForPolicy,
  STATUTORY_FRAMEWORKS,
} from "../utils/statutoryFrameworks";

// =============================================================================
// PRE-BUILT ENTERPRISE POLICY TEMPLATES
// =============================================================================
export const POLICY_TEMPLATES = [
  {
    id: "infosec",
    name: "Information Security Policy",
    departmentName: "Information Security & Compliance",
    statutoryClauses: "ISO/IEC 27001:2022 Control A.5.1 (Policies for info security), SOC 2 CC5.1, NIST CSF ID.GV-1",
    version: "1.0",
    description:
      "Establishes management direction and corporate guidelines for information security across all organizational assets. Mandates continuous risk management, least-privilege resource access, endpoint encryption, clean desk protocols, secure remote connectivity, and strict baseline compliance across all departments and external contractors.",
    raci: {
      responsible: "IT Security & Operations Team",
      accountable: "Alex Turner / CISO",
      consulted: "Legal, Risk & Governance Department",
      informed: "All Employees & Contractors",
    },
  },
  {
    id: "access_control",
    name: "Access Control & Password Policy",
    departmentName: "IT Infrastructure & Operations",
    statutoryClauses: "ISO/IEC 27001:2022 Control A.5.15 (Access control), A.8.5 (Secure authentication), NIST SP 800-63B, PCI-DSS Req 8",
    version: "1.0",
    description:
      "Enforces zero-trust access control, role-based permissions (RBAC), and multi-factor authentication (MFA) across all identity providers. Mandates 16+ character passphrases, system-enforced session lockouts after 15 minutes of inactivity, immediate revocation upon employee termination, and mandatory quarterly privileged access audits.",
    raci: {
      responsible: "DevOps & System Administrators",
      accountable: "Head of IT Infrastructure & CTO",
      consulted: "Information Security & Compliance",
      informed: "All System Users & Workforce",
    },
  },
  {
    id: "dpdp_privacy",
    name: "Data Privacy & DPDP Act 2023 Compliance Policy",
    departmentName: "Legal, Risk & Governance",
    statutoryClauses: "DPDP Act 2023 Sections 4, 6, 8, 11; ISO/IEC 27001:2022 Control A.5.34 (Privacy and protection of PII); IT Act 2000 Section 43A",
    version: "1.0",
    description:
      "Defines organizational requirements for collecting, storing, processing, and transferring Digital Personal Data under India's DPDP Act 2023. Establishes verifiable parental consent for minors, Purpose Limitation, Data Principal Rights fulfillment within 72 hours, Data Protection Officer (DPO) governance, and strict Data Fiduciary accountability.",
    raci: {
      responsible: "Data Protection Officer (DPO) & Privacy Team",
      accountable: "Legal Adviser & Head of Governance",
      consulted: "Engineering & Human Resources",
      informed: "All Employees Handling Personal Data",
    },
  },
  {
    id: "business_continuity",
    name: "Business Continuity & Disaster Resilience Policy",
    departmentName: "IT Infrastructure & Operations",
    statutoryClauses: "ISO 22301:2019 Clauses 8.2 (BIA), 8.4 (BCP Plans), 8.5 (DR Exercise); ISO/IEC 27001:2022 Control A.5.29 - A.5.30",
    version: "1.0",
    description:
      "Defines business impact analysis (BIA), disaster recovery (DR) execution protocols, emergency operations center (EOC) failover triggers, and recovery time objective (RTO < 4 hrs) / recovery point objective (RPO < 1 hr) thresholds. Mandates bi-annual tabletop resilience exercises and air-gapped immutable backup verifications.",
    raci: {
      responsible: "Disaster Recovery Lead & Systems Engineering",
      accountable: "VP of Engineering & Head of IT Infrastructure",
      consulted: "Information Security, Compliance & Legal",
      informed: "All Business Unit Leaders & Executive Committee",
    },
  },
  {
    id: "incident_response",
    name: "Incident Response & Breach Notification Policy",
    departmentName: "Information Security & Compliance",
    statutoryClauses: "ISO/IEC 27001:2022 Controls A.5.24 - A.5.28; DPDP Act 2023 Section 8(6); CERT-In Directions Section 70B (6-hour notice)",
    version: "1.0",
    description:
      "Provides structured protocols for detecting, assessing, containing, and recovering from cybersecurity incidents and data compromises. Outlines Computer Security Incident Response Team (CSIRT) triage workflows, forensic chain-of-custody requirements, executive escalation paths, and legally mandated regulatory breach notification procedures.",
    raci: {
      responsible: "SOC Lead & Incident Response Team",
      accountable: "Alex Turner / CISO",
      consulted: "Legal Counsel, Risk Lead & PR Communications",
      informed: "Executive Leadership & Board of Directors",
    },
  },
  {
    id: "remote_work",
    name: "Remote Work & BYOD Security Policy",
    departmentName: "IT Infrastructure & Operations",
    statutoryClauses: "ISO/IEC 27001:2022 Control A.6.7 (Remote working); NIST SP 800-46 Rev. 2; CIS Controls v8 Control 12",
    version: "1.0",
    description:
      "Outlines security mandates for teleworking and personally-owned devices (BYOD) accessing enterprise resources. Requires Mobile Device Management (MDM) enrollment, full-disk BitLocker/FileVault encryption, prohibition of untrusted public Wi-Fi without corporate VPN, and immediate remote-wipe authorization for lost or compromised devices.",
    raci: {
      responsible: "Endpoint Security & Helpdesk Engineers",
      accountable: "Head of IT Infrastructure & CTO",
      consulted: "Human Resources & Training",
      informed: "All Remote & Hybrid Personnel",
    },
  },
  {
    id: "vendor_risk",
    name: "Vendor & Third-Party Risk Management Policy",
    departmentName: "Legal, Risk & Governance",
    statutoryClauses: "ISO/IEC 27001:2022 Controls A.5.19 - A.5.23 (Supplier relationships); SOC 2 CC9.2; EBA Guidelines on Outsourcing",
    version: "1.0",
    description:
      "Establishes cybersecurity and governance requirements for evaluating, onboarding, and monitoring third-party vendors and SaaS providers. Mandates pre-contract security assessments (SOC 2 Type II or ISO 27001 reviews), signed Data Processing Agreements (DPAs), right-to-audit clauses, and annual supplier risk reassessments.",
    raci: {
      responsible: "Procurement & Vendor Risk Analysts",
      accountable: "Chief Risk Officer & Head of Governance",
      consulted: "InfoSec Architecture & Legal",
      informed: "Department Heads & Budget Owners",
    },
  },
];

// Helper to strip serialized internal RACI / Template metadata tags from prose
export const cleanDescriptionText = (text) => {
  if (!text) return "";
  return text
    .replace(/\n*\[TEMPLATE:.*?\]\s*\[RACI\s*\|.*?\]\s*\[STATUTORY:.*?\]\s*(\[MULTI_FW\s*\|.*?\])?/gis, "")
    .replace(/\n*\[MULTI_FW\s*\|.*?\]/gis, "")
    .replace(/\n*\[RACI\s*\|.*?\]/gis, "")
    .replace(/\n*\[STATUTORY:.*?\]/gis, "")
    .trim();
};

// Helper to extract or resolve RACI & multi-framework statutory attributes reliably
export const extractRaciAndStatutory = (p) => {
  const defaultMapping = resolveMultiFrameworkForPolicy(p?.title || p?.policy_name || "");

  if (!p) {
    return {
      responsible: "IT Security Team",
      accountable: "Alex Turner / CISO",
      consulted: "Legal, Risk & Governance Department",
      informed: "All Employees & Contractors",
      statutoryClauses: "ISO/IEC 27001:2022 Control A.5.1",
      templateName: "Enterprise Policy",
      framework_iso27001: defaultMapping.iso27001,
      framework_cobit: defaultMapping.cobit,
      framework_it_act: defaultMapping.itAct,
      framework_dpdp: defaultMapping.dpdp || defaultMapping.gdpr,
      framework_iso22301: defaultMapping.iso22301,
      framework_gdpr: defaultMapping.dpdp || defaultMapping.gdpr,
    };
  }

  // Extract Multi-Framework from serialized description footer if present
  const rawDesc = p.description || p.summary || "";
  const multiFwMatch = rawDesc.match(/\[MULTI_FW\s*\|\s*ISO:\s*([^|\]]+)\s*\|\s*COBIT:\s*([^|\]]+)\s*\|\s*IT_ACT:\s*([^|\]]+)\s*\|\s*(?:DPDP|GDPR):\s*([^|\]]+)(?:\s*\|\s*ISO22301:\s*([^|\]]+))?\]/i);

  const resolvedFw = {
    framework_iso27001:
      p.framework_iso27001 ||
      (multiFwMatch ? multiFwMatch[1].trim() : defaultMapping.iso27001),
    framework_cobit:
      p.framework_cobit ||
      (multiFwMatch ? multiFwMatch[2].trim() : defaultMapping.cobit),
    framework_it_act:
      p.framework_it_act ||
      (multiFwMatch ? multiFwMatch[3].trim() : defaultMapping.itAct),
    framework_dpdp:
      p.framework_dpdp ||
      p.framework_gdpr ||
      (multiFwMatch ? multiFwMatch[4].trim() : defaultMapping.dpdp || defaultMapping.gdpr),
    framework_iso22301:
      p.framework_iso22301 ||
      (multiFwMatch && multiFwMatch[5] ? multiFwMatch[5].trim() : defaultMapping.iso22301),
    framework_gdpr:
      p.framework_dpdp ||
      p.framework_gdpr ||
      (multiFwMatch ? multiFwMatch[4].trim() : defaultMapping.dpdp || defaultMapping.gdpr),
  };

  // Check direct DB columns
  if (p.raci_responsible || p.raci_accountable || p.raci_consulted || p.raci_informed) {
    return {
      responsible: p.raci_responsible || "IT Security Team",
      accountable: p.raci_accountable || "Alex Turner / CISO",
      consulted: p.raci_consulted || "Legal, Risk & Governance Department",
      informed: p.raci_informed || "All Employees & Contractors",
      statutoryClauses: p.statutory_clauses || "ISO/IEC 27001:2022 Control A.5.1",
      templateName: p.template_name || "Custom Enterprise Policy",
      ...resolvedFw,
    };
  }

  // Check serialized description footer
  const raciMatch = rawDesc.match(/\[RACI\s*\|\s*R:\s*([^|\]]+)\s*\|\s*A:\s*([^|\]]+)\s*\|\s*C:\s*([^|\]]+)\s*\|\s*I:\s*([^|\]]+)\]/i);
  const statMatch = rawDesc.match(/\[STATUTORY:\s*([^\]]+)\]/i);
  const tmplMatch = rawDesc.match(/\[TEMPLATE:\s*([^\]]+)\]/i);

  if (raciMatch) {
    return {
      responsible: raciMatch[1].trim(),
      accountable: raciMatch[2].trim(),
      consulted: raciMatch[3].trim(),
      informed: raciMatch[4].trim(),
      statutoryClauses: statMatch ? statMatch[1].trim() : (p.statutory_clauses || "ISO/IEC 27001:2022 Control A.5.1"),
      templateName: tmplMatch ? tmplMatch[1].trim() : (p.template_name || ""),
      ...resolvedFw,
    };
  }

  // Keyword heuristic matching against templates
  const titleLower = (p.title || p.policy_name || "").toLowerCase();
  const matchedTemplate = POLICY_TEMPLATES.find((tpl) => {
    const tplName = tpl.name.toLowerCase();
    if (titleLower.includes(tplName.slice(0, 14))) return true;
    if (tpl.id === "access_control" && (titleLower.includes("access") || titleLower.includes("password"))) return true;
    if ((tpl.id === "dpdp_privacy" || tpl.id === "gdpr_privacy") && (titleLower.includes("privacy") || titleLower.includes("dpdp") || titleLower.includes("gdpr"))) return true;
    if (tpl.id === "business_continuity" && (titleLower.includes("continuity") || titleLower.includes("disaster") || titleLower.includes("resilience"))) return true;
    if (tpl.id === "incident_response" && titleLower.includes("incident")) return true;
    if (tpl.id === "remote_work" && (titleLower.includes("remote") || titleLower.includes("byod"))) return true;
    if (tpl.id === "vendor_risk" && (titleLower.includes("vendor") || titleLower.includes("third-party"))) return true;
    if (tpl.id === "infosec" && (titleLower.includes("security") || titleLower.includes("information"))) return true;
    return false;
  });

  if (matchedTemplate) {
    return {
      responsible: matchedTemplate.raci.responsible,
      accountable: matchedTemplate.raci.accountable,
      consulted: matchedTemplate.raci.consulted,
      informed: matchedTemplate.raci.informed,
      statutoryClauses: matchedTemplate.statutoryClauses,
      templateName: matchedTemplate.name,
      ...resolvedFw,
    };
  }

  return {
    responsible: "IT Security Team",
    accountable: "Alex Turner / CISO",
    consulted: "Legal, Risk & Governance Department",
    informed: "All Employees & Contractors",
    statutoryClauses: "ISO/IEC 27001:2022 Control A.5.1",
    templateName: "Custom Policy",
    ...resolvedFw,
  };
};

/**
 * Enterprise Policy Scoring Formula (0 - 100%)
 * Evaluates:
 * 1. Completeness (25%): Title, Description length >= 40 chars, Version, Status
 * 2. RACI Governance (25%): Responsible, Accountable, Consulted, Informed
 * 3. Statutory Crosswalk (25%): ISO 27001, COBIT, IT Act 2000, DPDP Act 2023, ISO 22301
 * 4. Technical Control Mapping & Review Cycle (25%): Valid review cycle date + mapped controls
 */
export const calculatePolicyScore = (policy, mappings = []) => {
  if (!policy) {
    return {
      score: 0,
      grade: "Incomplete",
      gradeColor: "text-rose-400",
      badgeBg: "bg-rose-500/15 border-rose-500/30",
      breakdown: { completeness: 0, raci: 0, statutory: 0, controlsAndReview: 0 },
    };
  }

  let score = 0;
  const breakdown = {
    completeness: 0,
    raci: 0,
    statutory: 0,
    controlsAndReview: 0,
  };

  // 1. Completeness (up to 25 pts)
  let compPts = 0;
  if (policy.title && policy.title.trim().length > 3) compPts += 8;
  const desc = cleanDescriptionText(policy.description || policy.summary || "");
  if (desc && desc.trim().length >= 40) compPts += 10;
  else if (desc && desc.trim().length > 0) compPts += 5;
  if (policy.version) compPts += 4;
  if (policy.status === "active") compPts += 3;
  breakdown.completeness = compPts;
  score += compPts;

  // 2. RACI Assignment (up to 25 pts)
  let raciPts = 0;
  const raci = extractRaciAndStatutory(policy);
  if (raci.responsible && raci.responsible.trim().length > 2) raciPts += 7;
  if (raci.accountable && raci.accountable.trim().length > 2) raciPts += 7;
  if (raci.consulted && raci.consulted.trim().length > 2) raciPts += 5.5;
  if (raci.informed && raci.informed.trim().length > 2) raciPts += 5.5;
  breakdown.raci = Math.min(25, Math.round(raciPts));
  score += breakdown.raci;

  // 3. Statutory & Multi-Framework Alignment (up to 25 pts)
  let statPts = 0;
  if (policy.statutory_clauses || raci.statutoryClauses) statPts += 10;
  if (policy.framework_iso27001 || raci.framework_iso27001) statPts += 5;
  if (policy.framework_cobit || raci.framework_cobit) statPts += 3;
  if (policy.framework_it_act || raci.framework_it_act) statPts += 3;
  if (
    policy.framework_dpdp ||
    raci.framework_dpdp ||
    policy.framework_gdpr ||
    raci.framework_gdpr ||
    policy.framework_iso22301 ||
    raci.framework_iso22301
  ) {
    statPts += 4;
  }
  breakdown.statutory = Math.min(25, statPts);
  score += breakdown.statutory;

  // 4. Control Mapping & Review Cycle (up to 25 pts)
  let crPts = 0;
  if (policy.review_date) {
    const rev = new Date(policy.review_date);
    const now = new Date();
    if (rev > now) {
      crPts += 10; // Active future review date
    } else {
      crPts += 4; // Overdue review
    }
  }
  const policyIdStr = String(policy.id).trim();
  const linkedControls = (mappings || []).filter(
    (m) => String(m.policy_id).trim() === policyIdStr
  );
  if (linkedControls.length >= 2) crPts += 15;
  else if (linkedControls.length === 1) crPts += 10;
  else {
    const t = (policy.title || "").toLowerCase();
    if (
      t.includes("access") ||
      t.includes("privacy") ||
      t.includes("incident") ||
      t.includes("continuity")
    ) {
      crPts += 8;
    }
  }
  breakdown.controlsAndReview = Math.min(25, crPts);
  score += breakdown.controlsAndReview;

  const finalScore = Math.min(100, Math.round(score));
  let grade = "Bronze Standard";
  let gradeColor = "text-rose-400";
  let badgeBg = "bg-rose-500/15 border-rose-500/30";

  if (finalScore >= 85) {
    grade = "Gold Compliant";
    gradeColor = "text-emerald-400";
    badgeBg = "bg-emerald-500/15 border-emerald-500/30";
  } else if (finalScore >= 70) {
    grade = "Silver Compliant";
    gradeColor = "text-blue-400";
    badgeBg = "bg-blue-500/15 border-blue-500/30";
  } else if (finalScore >= 50) {
    grade = "Needs Alignment";
    gradeColor = "text-amber-400";
    badgeBg = "bg-amber-500/15 border-amber-500/30";
  }

  return {
    score: finalScore,
    grade,
    gradeColor,
    badgeBg,
    breakdown,
  };
};

export function Policies() {
  const { user, profile } = useAuth();

  // Core Data States
  const [policies, setPolicies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Persona / View Mode (Defaults to actual user role, but allows evaluator toggle)
  const actualRole = profile?.role || user?.user_metadata?.role || "employee";
  const [activeTab, setActiveTab] = useState(
    actualRole === "employee" ? "my_policies" : "all_policies"
  );

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Notification Toast
  const [notification, setNotification] = useState(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [controlMappings, setControlMappings] = useState([]);

  const initialForm = {
    template_name: "",
    title: "",
    description: "",
    statutory_clauses: "",
    framework_iso27001: "ISO/IEC 27001:2022 Control A.5.1",
    framework_cobit: "COBIT 2019 APO13.01 & EDM03",
    framework_it_act: "IT Act 2000 Section 43A / Rule 4 (SPDI)",
    framework_dpdp: "DPDP Act 2023 Section 8(1) & Section 8(5)",
    framework_iso22301: "ISO 22301:2019 Clause 8.2 / 8.4",
    framework_gdpr: "DPDP Act 2023 Section 8(1) & Section 8(5)",
    department_id: "",
    department: "",
    version: "1.0",
    review_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
    status: "active",
    file_url: "",
    raci_responsible: "IT Security & Operations Team",
    raci_accountable: "Alex Turner / CISO",
    raci_consulted: "Legal, Risk & Governance Department",
    raci_informed: "All Employees & Contractors",
  };

  const [form, setForm] = useState(initialForm);

  // Read & Acknowledge Modal State (for Employee Workflow)
  const [readerPolicy, setReaderPolicy] = useState(null);
  const [agreedCheckbox, setAgreedCheckbox] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch LocalStorage data
  const fetchData = () => {
    setLoading(true);
    try {
      const rawPolicies = localStorageDb.get("policies") || [];
      const rawDepts = localStorageDb.get("departments") || [];
      const rawAcks = localStorageDb.get("policy_acknowledgements") || [];
      const rawProfiles = localStorageDb.get("profiles") || [];
      const rawMappings = localStorageDb.get("policy_control_mappings") || [];

      // Normalize policies to support alternative column conventions seamlessly
      const normalizedPolicies = rawPolicies.map((p) => {
        const raciData = extractRaciAndStatutory(p);
        return {
          ...p,
          title: p.title || p.policy_name || "Untitled Policy",
          policy_name: p.policy_name || p.title || "Untitled Policy",
          description: p.description || p.summary || "",
          file_url: p.file_url || p.document_url || "",
          department: p.department || p.department_name || "",
          department_name: p.department_name || p.department || "",
          version: p.version || "1.0",
          status: p.status || "active",
          raci_responsible: p.raci_responsible || raciData.responsible,
          raci_accountable: p.raci_accountable || raciData.accountable,
          raci_consulted: p.raci_consulted || raciData.consulted,
          raci_informed: p.raci_informed || raciData.informed,
          statutory_clauses: p.statutory_clauses || raciData.statutoryClauses,
          framework_iso27001: p.framework_iso27001 || raciData.framework_iso27001,
          framework_cobit: p.framework_cobit || raciData.framework_cobit,
          framework_it_act: p.framework_it_act || raciData.framework_it_act,
          framework_dpdp: p.framework_dpdp || p.framework_gdpr || raciData.framework_dpdp || raciData.framework_gdpr,
          framework_iso22301: p.framework_iso22301 || raciData.framework_iso22301,
          framework_gdpr: p.framework_dpdp || p.framework_gdpr || raciData.framework_dpdp || raciData.framework_gdpr,
          template_name: p.template_name || raciData.templateName,
        };
      });

      // Normalize departments (avoid generic 'General' if department_name is populated)
      const normalizedDepartments = rawDepts.map((d) => {
        const cleanName =
          d.name && d.name !== "General"
            ? d.name
            : d.department_name || d.name || "General";
        return {
          ...d,
          name: cleanName,
          department_name: cleanName,
        };
      });

      // Normalize acknowledgements to support compatibility schema columns
      const normalizedAcks = rawAcks.map((a) => ({
        ...a,
        policy_id: a.policy_id,
        user_id: a.user_id,
        user_email: a.user_email || "",
        employee_id: a.employee_id || "",
        acknowledged: a.acknowledged !== false,
        status: a.status || "signed",
        signed_at: a.signed_at || a.acknowledged_at || a.created_at,
        acknowledged_at: a.acknowledged_at || a.signed_at || a.created_at,
      }));

      setPolicies(normalizedPolicies);
      setDepartments(normalizedDepartments);
      setAcknowledgements(normalizedAcks);
      setProfiles(rawProfiles);
      setControlMappings(rawMappings);
    } catch (err) {
      console.error("Error loading policies data:", err);
      showNotification("error", "Failed to load policy data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleStorageUpdate = (e) => {
      if (
        !e.detail ||
        e.detail.collection === "policies" ||
        e.detail.collection === "departments" ||
        e.detail.collection === "policy_acknowledgements" ||
        e.detail.collection === "policy_control_mappings" ||
        e.detail.collection === "all"
      ) {
        fetchData();
      }
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Review status helper (near/overdue review dates)
  const getReviewStatus = (reviewDateStr) => {
    if (!reviewDateStr) return { label: "No Date", color: "text-slate-400", isPending: false };
    const reviewDate = new Date(reviewDateStr);
    const now = new Date();
    const diffDays = Math.ceil((reviewDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Overdue by ${Math.abs(diffDays)}d`,
        color: "text-red-400 font-bold",
        isPending: true,
      };
    }
    if (diffDays <= 45) {
      return {
        label: `Due in ${diffDays}d`,
        color: "text-amber-400 font-semibold",
        isPending: true,
      };
    }
    return {
      label: formatDate(reviewDateStr),
      color: "text-slate-300",
      isPending: false,
    };
  };

  // Top KPI Metrics
  const metrics = useMemo(() => {
    const totalPolicies = policies.length;
    const published = policies.filter((p) => p.status === "active").length;

    // Review date near/passed (<= 45 days or overdue)
    const pendingReview = policies.filter(
      (p) => getReviewStatus(p.review_date).isPending
    ).length;

    // Unique active departments with policies
    const deptSet = new Set();
    policies.forEach((p) => {
      if (p.department || p.department_name) {
        deptSet.add(p.department || p.department_name);
      }
    });

    // Total target employee headcount
    const totalEmployees = Math.max(
      profiles.filter((p) => p.role === "employee" || !p.role).length,
      1
    );

    // Organization Compliance Rate: Actual Acks vs Total Target Expected Acks
    const activePolicyIds = new Set(
      policies.filter((p) => p.status === "active").map((p) => p.id)
    );
    const validAcks = acknowledgements.filter((a) =>
      activePolicyIds.has(a.policy_id)
    ).length;

    const totalPossibleAcks = published * totalEmployees;
    const complianceRate =
      totalPossibleAcks > 0
        ? Math.min(100, Math.round((validAcks / totalPossibleAcks) * 100))
        : 0;

    // Current user's individual acknowledgment statistics
    const myAcksCount = policies
      .filter((p) => p.status === "active")
      .filter((p) => {
        return acknowledgements.some((a) => {
          if (String(a.policy_id).trim() !== String(p.id).trim()) return false;
          if (user?.id && String(a.user_id).trim() === String(user.id).trim()) return true;
          if (profile?.id && String(a.user_id).trim() === String(profile.id).trim()) return true;
          if (user?.email && a.user_email && a.user_email.toLowerCase() === user.email.toLowerCase()) return true;
          return false;
        });
      }).length;

    // Live Average Policy Score
    let avgScore = 0;
    if (policies.length > 0) {
      const sumScores = policies.reduce((acc, p) => {
        const sc = calculatePolicyScore(p, controlMappings);
        return acc + sc.score;
      }, 0);
      avgScore = Math.round(sumScores / policies.length);
    }

    return {
      totalPolicies,
      published,
      pendingReview,
      activeDepts: deptSet.size,
      complianceRate,
      myAcksCount,
      totalEmployees,
      avgScore,
    };
  }, [policies, acknowledgements, profiles, user, controlMappings]);

  // Handle Template Selection
  const handleSelectTemplate = (templateId) => {
    if (!templateId) {
      setForm((prev) => ({
        ...prev,
        template_name: "",
      }));
      return;
    }
    const tpl = POLICY_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    // Match department by name
    const matchedDept = departments.find(
      (d) =>
        d.name?.toLowerCase().includes(tpl.departmentName.toLowerCase().slice(0, 10)) ||
        d.department_name?.toLowerCase().includes(tpl.departmentName.toLowerCase().slice(0, 10))
    );

    const multiFw = resolveMultiFrameworkForPolicy(tpl.name);

    setForm((prev) => ({
      ...prev,
      template_name: tpl.name,
      title: tpl.name,
      description: tpl.description,
      statutory_clauses: tpl.statutoryClauses,
      framework_iso27001: multiFw.iso27001,
      framework_cobit: multiFw.cobit,
      framework_it_act: multiFw.itAct,
      framework_dpdp: multiFw.dpdp || multiFw.gdpr,
      framework_iso22301: multiFw.iso22301,
      framework_gdpr: multiFw.dpdp || multiFw.gdpr,
      version: tpl.version || "1.0",
      department_id: matchedDept ? matchedDept.id : prev.department_id || departments[0]?.id || "",
      department: matchedDept ? matchedDept.name : tpl.departmentName,
      raci_responsible: tpl.raci.responsible,
      raci_accountable: tpl.raci.accountable,
      raci_consulted: tpl.raci.consulted,
      raci_informed: tpl.raci.informed,
    }));
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      department_id: departments[0]?.id || "",
      department: departments[0]?.name || "",
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (policy) => {
    setEditingId(policy.id);
    const raci = extractRaciAndStatutory(policy);
    setForm({
      template_name: policy.template_name || raci.templateName || "",
      title: policy.title || policy.policy_name || "",
      description: cleanDescriptionText(policy.description || ""),
      statutory_clauses: policy.statutory_clauses || raci.statutoryClauses || "",
      framework_iso27001: policy.framework_iso27001 || raci.framework_iso27001 || "ISO/IEC 27001:2022 Control A.5.1",
      framework_cobit: policy.framework_cobit || raci.framework_cobit || "COBIT 2019 APO13",
      framework_it_act: policy.framework_it_act || raci.framework_it_act || "IT Act 2000 Section 43A / Rule 4",
      framework_dpdp: policy.framework_dpdp || policy.framework_gdpr || raci.framework_dpdp || raci.framework_gdpr || "DPDP Act 2023 Section 8(1)",
      framework_iso22301: policy.framework_iso22301 || raci.framework_iso22301 || "ISO 22301:2019 Clause 8.2 / 8.4",
      framework_gdpr: policy.framework_dpdp || policy.framework_gdpr || raci.framework_dpdp || raci.framework_gdpr || "DPDP Act 2023 Section 8(1)",
      department_id: policy.department_id || "",
      department: policy.department || policy.department_name || "",
      version: policy.version || "1.0",
      review_date: policy.review_date || "",
      status: policy.status || "active",
      file_url: policy.file_url || "",
      raci_responsible: policy.raci_responsible || raci.responsible,
      raci_accountable: policy.raci_accountable || raci.accountable,
      raci_consulted: policy.raci_consulted || raci.consulted,
      raci_informed: policy.raci_informed || raci.informed,
    });
    setIsCreateModalOpen(true);
  };

  // Submit Create or Update
  const handleSubmitPolicy = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    if (!title) {
      showNotification("warning", "Please provide a Policy Title.");
      return;
    }

    const hasDept =
      (form.department_id && String(form.department_id).trim()) ||
      (form.department && form.department.trim());
    if (!hasDept) {
      showNotification("warning", "Please select or specify a Governing Department.");
      return;
    }

    const description = form.description.trim();
    if (!description) {
      showNotification("warning", "Please provide a Policy Summary / Mandatory Obligations.");
      return;
    }

    setIsSubmitting(true);

    const matchedDept = departments.find(
      (d) => String(d.id).trim() === String(form.department_id).trim()
    );
    const deptName = matchedDept
      ? matchedDept.name
      : form.department
      ? form.department.trim()
      : "General";
    const deptId =
      form.department_id && String(form.department_id).trim()
        ? String(form.department_id).trim()
        : null;
    const version = form.version ? form.version.trim() : "1.0";
    const reviewDate = form.review_date || null;
    const status = form.status || "active";
    const fileUrl = form.file_url ? form.file_url.trim() : null;

    const raciResponsible = form.raci_responsible ? form.raci_responsible.trim() : "IT Security Team";
    const raciAccountable = form.raci_accountable ? form.raci_accountable.trim() : "Alex Turner / CISO";
    const raciConsulted = form.raci_consulted ? form.raci_consulted.trim() : "Legal, Risk & Governance Department";
    const raciInformed = form.raci_informed ? form.raci_informed.trim() : "All Employees & Contractors";
    const statutoryClauses = form.statutory_clauses ? form.statutory_clauses.trim() : "ISO/IEC 27001:2022 Control A.5.1";
    const templateName = form.template_name ? form.template_name.trim() : null;

    const fwIso = form.framework_iso27001 ? form.framework_iso27001.trim() : "ISO/IEC 27001:2022 Control A.5.1";
    const fwCobit = form.framework_cobit ? form.framework_cobit.trim() : "COBIT 2019 APO13";
    const fwItAct = form.framework_it_act ? form.framework_it_act.trim() : "IT Act 2000 Section 43A / Rule 4";
    const fwDpdp = form.framework_dpdp
      ? form.framework_dpdp.trim()
      : form.framework_gdpr
      ? form.framework_gdpr.trim()
      : "DPDP Act 2023 Section 8(1) & Section 8(5)";
    const fwIso22301 = form.framework_iso22301
      ? form.framework_iso22301.trim()
      : "ISO 22301:2019 Clause 8.2 / 8.4";

    // Structured metadata serialized footer to guarantee persistence even if DB columns aren't migrated
    const serializedFooter = `\n\n[TEMPLATE: ${templateName || "Enterprise Policy"}] [RACI | R: ${raciResponsible} | A: ${raciAccountable} | C: ${raciConsulted} | I: ${raciInformed}] [STATUTORY: ${statutoryClauses}] [MULTI_FW | ISO: ${fwIso} | COBIT: ${fwCobit} | IT_ACT: ${fwItAct} | DPDP: ${fwDpdp} | ISO22301: ${fwIso22301}]`;
    const cleanDesc = cleanDescriptionText(description);
    const enrichedDescription = `${cleanDesc}${serializedFooter}`;

    try {
      // 1. Primary Comprehensive Payload (including dedicated RACI & multi-framework fields)
      const primaryPayload = {
        title,
        policy_name: title,
        description: enrichedDescription,
        summary: enrichedDescription,
        version,
        department_id: deptId,
        department: deptName,
        department_name: deptName,
        review_date: reviewDate,
        status,
        file_url: fileUrl,
        document_url: fileUrl,
        raci_responsible: raciResponsible,
        raci_accountable: raciAccountable,
        raci_consulted: raciConsulted,
        raci_informed: raciInformed,
        statutory_clauses: statutoryClauses,
        framework_iso27001: fwIso,
        framework_cobit: fwCobit,
        framework_it_act: fwItAct,
        framework_dpdp: fwDpdp,
        framework_iso22301: fwIso22301,
        framework_gdpr: fwDpdp,
        template_name: templateName,
        user_id: user?.id,
        organization_id: user?.id,
      };

      console.log(
        editingId
          ? `Attempting to update policy ${editingId}:`
          : "Attempting to insert policy into 'policies':",
        primaryPayload
      );

      if (editingId) {
        localStorageDb.update("policies", editingId, primaryPayload);
      } else {
        const nextId = policies.length
          ? Math.max(...policies.map((p) => Number(p.id) || 0), 0) + 1
          : 1;
        localStorageDb.insert("policies", {
          id: nextId,
          ...primaryPayload,
          created_at: new Date().toISOString(),
        });
      }

      showNotification(
        "success",
        editingId
          ? `Policy "${title}" updated successfully.`
          : `New policy "${title}" published to organization.`
      );

      setIsCreateModalOpen(false);
      setEditingId(null);
      setForm(initialForm);
      fetchData();
    } catch (err) {
      console.error("Save Policy Error:", err);
      showNotification("error", `Failed to save policy: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Policy
  const handleDeletePolicy = (id, title) => {
    if (!window.confirm(`Are you sure you want to delete policy "${title}"?`)) {
      return;
    }

    try {
      localStorageDb.delete("policies", id);
      showNotification("success", "Policy removed.");
      fetchData();
    } catch (err) {
      showNotification("error", "Failed to delete policy: " + err.message);
    }
  };

  // Open Policy Document Reader for Employee
  const handleOpenReader = (policy) => {
    setReaderPolicy(policy);
    setAgreedCheckbox(false);
  };

  // Submit Employee Acknowledgment & Attestation
  const handleConfirmAcknowledge = async () => {
    if (!readerPolicy) return;

    const currentUserId = user?.id || profile?.id || null;
    const currentUserEmail = user?.email || profile?.email || "employee@company.com";
    const currentUserName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      (currentUserEmail ? currentUserEmail.split("@")[0] : "Employee");

    setAcknowledging(true);

    const nowIso = new Date().toISOString();
    const optimisticAck = {
      id: `opt-ack-${Date.now()}`,
      policy_id: readerPolicy.id,
      user_id: currentUserId,
      user_email: currentUserEmail,
      employee_id: currentUserId,
      acknowledged: true,
      status: "signed",
      acknowledged_at: nowIso,
      signed_at: nowIso,
    };

    // 1. Immediate Optimistic Local State Update:
    // Instantly flips the badge to "Signed & Acknowledged", increments "1 of 1 Signed", and closes modal
    setAcknowledgements((prev) => {
      const filtered = prev.filter((a) => {
        const isSamePolicy =
          String(a.policy_id).trim() === String(readerPolicy.id).trim();
        const isSameUser =
          (currentUserId && String(a.user_id).trim() === String(currentUserId).trim()) ||
          (currentUserEmail && a.user_email && a.user_email.toLowerCase() === currentUserEmail.toLowerCase());
        return !(isSamePolicy && isSameUser);
      });
      return [...filtered, optimisticAck];
    });

    const policyTitle = readerPolicy.title || readerPolicy.policy_name || "Policy";
    setReaderPolicy(null);
    setAgreedCheckbox(false);

    showNotification(
      "success",
      `You have officially signed & acknowledged "${policyTitle}". Compliance record updated!`
    );

    try {
      // 2. Resolve or Auto-Provision Employee record in employees collection
      let resolvedEmployeeId = null;
      if (currentUserEmail) {
        const employees = localStorageDb.get("employees");
        let emp = employees.find((e) => e.email === currentUserEmail);
        if (emp) {
          resolvedEmployeeId = emp.id;
        } else {
          const nextEmpId = employees.length
            ? Math.max(...employees.map((e) => Number(e.id) || 0), 0) + 1
            : 1;
          emp = {
            id: nextEmpId,
            full_name: currentUserName,
            email: currentUserEmail,
            department: readerPolicy.department || "General",
            designation: profile?.designation || "Staff",
            created_at: nowIso,
          };
          localStorageDb.insert("employees", emp);
          resolvedEmployeeId = nextEmpId;
        }
      }

      // 3. Persist Acknowledgment to LocalStorage
      const tier1Payload = {
        id: `ack-${Date.now()}`,
        policy_id: readerPolicy.id,
        user_id: currentUserId,
        employee_id: resolvedEmployeeId ? String(resolvedEmployeeId) : (currentUserId ? String(currentUserId) : null),
        user_email: currentUserEmail,
        signed_at: nowIso,
        status: "signed",
        acknowledged: true,
        acknowledged_at: nowIso,
        created_at: nowIso,
      };

      const existingAcks = localStorageDb.get("policy_acknowledgements") || [];
      const filteredAcks = existingAcks.filter(
        (a) => !(String(a.policy_id) === String(readerPolicy.id) && String(a.user_id) === String(currentUserId))
      );
      localStorageDb.set("policy_acknowledgements", [tier1Payload, ...filteredAcks]);

      fetchData();
    } catch (err) {
      console.error("Policy Sign-off Error:", err);
      fetchData();
      showNotification("error", `Signature Failed: ${err.message}`);
    } finally {
      setAcknowledging(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle className="w-3 h-3" /> Active
          </span>
        );
      case "review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FiClock className="w-3 h-3" /> Under Review
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <FiEdit2 className="w-3 h-3" /> Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const title = p.title || p.policy_name || "";
      const description = p.description || "";
      const dept = p.department || p.department_name || "";
      const status = p.status || "active";

      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (departmentFilter !== "all" && dept !== departmentFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;

      // In "My Policies" tab, show active policies assigned to the employee
      if (activeTab === "my_policies") {
        return status === "active";
      }

      return true;
    });
  }, [policies, searchTerm, departmentFilter, statusFilter, activeTab]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Policy Management & Compliance Acknowledgement
              </h1>
              <p className="text-xs text-slate-400">
                Mandatory governance policies, ISO 27001 Annex A.5 compliance, and employee sign-off workflow.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Evaluator Persona Switcher */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("all_policies")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "all_policies"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Admin / Officer View
            </button>
            <button
              onClick={() => setActiveTab("my_policies")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === "my_policies"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Employee Portal</span>
              {user && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Create Button (Visible to Admins / Compliance Officers) */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
          >
            <FiPlus className="text-base" /> Create / Publish Policy
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-sm flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              : notification.type === "warning"
              ? "bg-amber-950/80 border-amber-500/40 text-amber-300"
              : "bg-red-950/80 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <FiCheckCircle className="text-emerald-400 text-base flex-shrink-0" />
            ) : notification.type === "warning" ? (
              <FiAlertTriangle className="text-amber-400 text-base flex-shrink-0" />
            ) : (
              <FiAlertTriangle className="text-red-400 text-base flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <FiX />
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Published Policies */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Published Policies
            </span>
            <FiShield className="text-blue-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{metrics.published}</div>
          <div className="text-[11px] text-blue-400 mt-1 font-medium">
            Active Governance
          </div>
        </div>

        {/* Policy Scoring Average */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Policy Score Avg
            </span>
            <FiAward className="text-emerald-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5 flex items-baseline gap-1">
            <span
              className={
                metrics.avgScore >= 80
                  ? "text-emerald-400"
                  : metrics.avgScore >= 60
                  ? "text-blue-400"
                  : "text-amber-400"
              }
            >
              {metrics.avgScore}%
            </span>
            <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.avgScore >= 80
                  ? "bg-emerald-500"
                  : metrics.avgScore >= 60
                  ? "bg-blue-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${metrics.avgScore}%` }}
            />
          </div>
        </div>

        {/* Organization Acknowledgment Compliance Rate */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Compliance Sign-off Rate
            </span>
            <FiCheckSquare className="text-emerald-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5 flex items-baseline gap-1">
            <span
              className={
                metrics.complianceRate >= 80
                  ? "text-emerald-400"
                  : metrics.complianceRate >= 50
                  ? "text-amber-400"
                  : "text-red-400"
              }
            >
              {metrics.complianceRate}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.complianceRate >= 80
                  ? "bg-emerald-500"
                  : metrics.complianceRate >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${metrics.complianceRate}%` }}
            />
          </div>
        </div>

        {/* Policies Pending Review */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Annual Review
            </span>
            <FiClock className="text-amber-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1.5">
            {metrics.pendingReview}
          </div>
          <div className="text-[11px] text-amber-300 mt-1 font-medium">
            Due Within 45 Days or Overdue
          </div>
        </div>

        {/* Active Departments */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Governed Departments
            </span>
            <FiLayers className="text-indigo-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            {metrics.activeDepts}
          </div>
          <div className="text-[11px] text-indigo-300 mt-1 font-medium">
            Cross-Functional Scope
          </div>
        </div>
      </div>

      {/* 3. Personalized Employee Progress Banner (Shown in Employee Portal) */}
      {activeTab === "my_policies" && (
        <div className="p-5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl flex-shrink-0">
              <FiCheckSquare />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Employee Policy Attestation Portal
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as <strong className="text-slate-200">{user?.email || "Employee"}</strong>. All active policies below require mandatory review and sign-off.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 text-right self-start sm:self-auto">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Your Personal Progress
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              <span className="text-emerald-400">{metrics.myAcksCount}</span> of{" "}
              {metrics.published} Signed
            </div>
          </div>
        </div>
      )}

      {/* 4. Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-3 text-slate-500 text-xs" />
          <input
            type="text"
            placeholder="Search policies by title, department, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter (Admin View Only) */}
          {activeTab === "all_policies" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="review">Under Review</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          )}
        </div>
      </div>

      {/* 5. Policy Repository Table / Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading organizational policies...</p>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          <FiFileText className="text-4xl mx-auto mb-3 text-slate-500" />
          <p className="text-base font-semibold text-white">No records found in database.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {policies.length === 0
              ? "Your local policy repository currently has 0 records."
              : "No policies match your active search or department filter."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <FiPlus /> Add / Create New Policy
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-28">Policy ID</th>
                  <th className="py-3.5 px-4">Policy Document</th>
                  <th className="py-3.5 px-4 min-w-[210px]">RACI Accountability</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Next Review</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Policy Score</th>
                  {activeTab === "all_policies" ? (
                    <th className="py-3.5 px-4 text-center">Staff Sign-off</th>
                  ) : (
                    <th className="py-3.5 px-4 text-center">My Attestation</th>
                  )}
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPolicies.map((p, index) => {
                  const title = p.title || p.policy_name || "Untitled Policy";
                  const dept = p.department || p.department_name || "General";
                  const reviewInfo = getReviewStatus(p.review_date);

                  // Acknowledgement stats
                  const policyAcks = acknowledgements.filter(
                    (a) => a.policy_id === p.id
                  );
                  const acksCount = policyAcks.length;
                  const totalExpected = metrics.totalEmployees;
                  const ackPercentage = Math.min(
                    100,
                    Math.round((acksCount / totalExpected) * 100)
                  );

                  // Current user acknowledgement record
                  const userAck = policyAcks.find((a) => {
                    if (user?.id && String(a.user_id).trim() === String(user.id).trim()) return true;
                    if (profile?.id && String(a.user_id).trim() === String(profile.id).trim()) return true;
                    if (user?.email && a.user_email && a.user_email.toLowerCase() === user.email.toLowerCase()) return true;
                    return false;
                  });
                  const hasUserAcknowledged = Boolean(userAck);

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      {/* Policy ID */}
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {formatId(p.id, index, "POL")}
                        </span>
                      </td>

                      {/* Policy Title & Description & Statutory Clauses */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
                          <span>{title}</span>
                          {p.file_url && (
                            <a
                              href={p.file_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open external document"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <FiExternalLink className="text-xs" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {cleanDescriptionText(p.description) || "Corporate Information Security standard policy."}
                        </p>
                        {/* Multi-Framework Statutory Mapping Badges */}
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {p.framework_iso27001 && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono"
                              title={`ISO/IEC 27001:2022: ${p.framework_iso27001}`}
                            >
                              <span className="font-bold text-[9px] text-blue-400">ISO</span>
                              <span className="truncate max-w-[110px]">{p.framework_iso27001}</span>
                            </span>
                          )}
                          {p.framework_cobit && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono"
                              title={`COBIT 2019: ${p.framework_cobit}`}
                            >
                              <span className="font-bold text-[9px] text-purple-400">COBIT</span>
                              <span className="truncate max-w-[100px]">{p.framework_cobit}</span>
                            </span>
                          )}
                          {p.framework_it_act && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono"
                              title={`IT Act 2000 (India): ${p.framework_it_act}`}
                            >
                              <span className="font-bold text-[9px] text-amber-400">IT Act</span>
                              <span className="truncate max-w-[100px]">{p.framework_it_act}</span>
                            </span>
                          )}
                          {(p.framework_dpdp || p.framework_gdpr) && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono"
                              title={`DPDP Act 2023: ${p.framework_dpdp || p.framework_gdpr}`}
                            >
                              <span className="font-bold text-[9px] text-emerald-400">DPDP</span>
                              <span className="truncate max-w-[100px]">{p.framework_dpdp || p.framework_gdpr}</span>
                            </span>
                          )}
                          {p.framework_iso22301 && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/30 font-mono"
                              title={`ISO 22301:2019: ${p.framework_iso22301}`}
                            >
                              <span className="font-bold text-[9px] text-rose-400">ISO 22301</span>
                              <span className="truncate max-w-[100px]">{p.framework_iso22301}</span>
                            </span>
                          )}
                          {!p.framework_iso27001 && !p.framework_cobit && !p.framework_it_act && !p.framework_dpdp && !p.framework_gdpr && !p.framework_iso22301 && p.statutory_clauses && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700/60 font-mono truncate max-w-xs"
                              title={`Statutory & Regulatory Alignment: ${p.statutory_clauses}`}
                            >
                              <FiShield className="text-blue-400 text-[10px] shrink-0" />
                              <span className="truncate">{p.statutory_clauses}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* RACI Matrix Badges Column */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex flex-col gap-1 min-w-[190px]">
                          {/* Responsible */}
                          <div
                            className="flex items-center gap-1.5 text-[11px]"
                            title={`Responsible (Executes Policy Mandates): ${p.raci_responsible}`}
                          >
                            <span className="w-4 h-4 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">
                              R
                            </span>
                            <span className="text-slate-200 truncate">{p.raci_responsible}</span>
                          </div>
                          {/* Accountable */}
                          <div
                            className="flex items-center gap-1.5 text-[11px]"
                            title={`Accountable (Signs Off & Owns Risk): ${p.raci_accountable}`}
                          >
                            <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">
                              A
                            </span>
                            <span className="text-purple-300 font-semibold truncate">
                              {p.raci_accountable}
                            </span>
                          </div>
                          {/* Consulted & Informed in one compact row */}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                            <span
                              className="flex items-center gap-1 truncate"
                              title={`Consulted: ${p.raci_consulted}`}
                            >
                              <span className="w-3.5 h-3.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-[9px] shrink-0">
                                C
                              </span>
                              <span className="truncate max-w-[85px]">{p.raci_consulted}</span>
                            </span>
                            <span
                              className="flex items-center gap-1 truncate"
                              title={`Informed: ${p.raci_informed}`}
                            >
                              <span className="w-3.5 h-3.5 rounded bg-slate-700/80 text-slate-300 border border-slate-600/50 flex items-center justify-center font-bold text-[9px] shrink-0">
                                I
                              </span>
                              <span className="truncate max-w-[85px]">{p.raci_informed}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-300 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-blue-300 border border-slate-700">
                          {dept}
                        </span>
                      </td>

                      {/* Version */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-300 whitespace-nowrap">
                        v{p.version || "1.0"}
                      </td>

                      {/* Review Date */}
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        <span className={reviewInfo.color}>{reviewInfo.label}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(p.status)}
                      </td>

                      {/* Policy Score & Grade */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {(() => {
                          const scoreData = calculatePolicyScore(p, controlMappings);
                          return (
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${scoreData.badgeBg} ${scoreData.gradeColor}`}
                                title={`Completeness: ${scoreData.breakdown.completeness}/25 | RACI: ${scoreData.breakdown.raci}/25 | Statutory: ${scoreData.breakdown.statutory}/25 | Controls & Review: ${scoreData.breakdown.controlsAndReview}/25`}
                              >
                                <FiAward className="text-xs" />
                                {scoreData.score}%
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                {scoreData.grade}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Column depends on Active Tab */}
                      {activeTab === "all_policies" ? (
                        /* Admin: Staff Sign-off Coverage */
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-semibold text-white">
                              {acksCount} / {totalExpected}
                            </span>
                            <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full ${
                                  ackPercentage >= 80
                                    ? "bg-emerald-500"
                                    : ackPercentage >= 50
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${ackPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      ) : (
                        /* Employee: My Attestation Status */
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {hasUserAcknowledged ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                              <FiCheckCircle className="text-xs" /> Signed & Acknowledged ({formatDate(userAck?.signed_at || userAck?.acknowledged_at)})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/40">
                              <FiClock className="text-xs" /> Pending Attestation
                            </span>
                          )}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* Employee Read & Acknowledge Action */}
                          {activeTab === "my_policies" && (
                            <button
                              onClick={() => handleOpenReader(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                hasUserAcknowledged
                                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                              }`}
                            >
                              {hasUserAcknowledged ? "Review Document" : "Acknowledge & Sign"}
                            </button>
                          )}

                          {/* Admin Management Actions */}
                          {activeTab === "all_policies" && (
                            <>
                              <button
                                onClick={() => handleOpenReader(p)}
                                title="View Document"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                              >
                                <FiFileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                title="Edit Policy"
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/30 rounded-lg transition"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePolicy(p.id, title)}
                                title="Delete Policy"
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: Create / Edit Policy */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiFileText className="text-blue-400" />
                {editingId ? "Edit Policy Details" : "Publish Corporate Security Policy"}
              </h2>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 disabled:opacity-50"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmitPolicy} className="space-y-4 mt-4">
              {/* Pre-Built Enterprise Template Selector */}
              <div className="p-3.5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FiLayers className="text-sm" /> Pre-Built Enterprise Policy Template
                  </label>
                  <span className="text-[11px] text-slate-400">Auto-fills standards, clauses & RACI</span>
                </div>
                <select
                  value={
                    POLICY_TEMPLATES.find((t) => t.name === form.template_name || t.name === form.title)?.id || ""
                  }
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Pre-Built Template or Create Custom --</option>
                  {POLICY_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Policy Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Security & Data Protection Policy"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Governing Department <span className="text-red-400">*</span>
                  </label>
                  {departments.length > 0 ? (
                    <select
                      required
                      value={form.department_id}
                      onChange={(e) => {
                        const selected = departments.find(
                          (d) => String(d.id).trim() === String(e.target.value).trim()
                        );
                        setForm({
                          ...form,
                          department_id: e.target.value,
                          department: selected ? selected.name : form.department,
                        });
                      }}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Information Security, Legal, HR..."
                      value={form.department}
                      onChange={(e) =>
                        setForm({ ...form, department: e.target.value })
                      }
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* Version */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Version Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1.0 or 2.1"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Next Review Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Annual Review Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.review_date}
                    onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Publication Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active (Enforced across organization)</option>
                    <option value="review">Under Review (Draft revisions pending)</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived (Superseded)</option>
                  </select>
                </div>
              </div>

              {/* Statutory Clauses & Regulatory Mandates */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <FiShield className="text-blue-400" /> Statutory & Regulatory Clauses
                </label>
                <input
                  type="text"
                  placeholder="e.g. ISO/IEC 27001:2022 Control A.5.1, DPDP Act 2023 Sec 8(5), ISO 22301 Clause 8.4"
                  value={form.statutory_clauses}
                  onChange={(e) => setForm({ ...form, statutory_clauses: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Multi-Framework Statutory Clause Mapping Grid */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FiLayers className="text-blue-400" /> Multi-Framework Statutory Clause Mapping
                  </h4>
                  <span className="text-[10px] text-slate-400">ISO 27001, COBIT, IT Act 2000, DPDP Act 2023 & ISO 22301 Crosswalk</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* ISO/IEC 27001:2022 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-[10px]">
                        ISO 27001
                      </span>
                      <span className="text-[11px]">Annex A Control</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Control A.5.1 (Policies for info security)"
                      value={form.framework_iso27001}
                      onChange={(e) => setForm({ ...form, framework_iso27001: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  {/* COBIT 2019 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold text-[10px]">
                        COBIT 2019
                      </span>
                      <span className="text-[11px]">Governance Objective</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., EDM03 & APO13 (Managed Security)"
                      value={form.framework_cobit}
                      onChange={(e) => setForm({ ...form, framework_cobit: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  {/* IT Act 2000 (India) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px]">
                        IT Act 2000
                      </span>
                      <span className="text-[11px]">Section 43A / SPDI Rules</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Section 43A, Rule 4 (Privacy Policy mandate)"
                      value={form.framework_it_act}
                      onChange={(e) => setForm({ ...form, framework_it_act: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  {/* DPDP Act 2023 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                        DPDP Act 2023
                      </span>
                      <span className="text-[11px]">Section / Safeguards</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Section 8(1) & Section 8(5) (Security Safeguards)"
                      value={form.framework_dpdp || form.framework_gdpr || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          framework_dpdp: e.target.value,
                          framework_gdpr: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  {/* ISO 22301:2019 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                        ISO 22301
                      </span>
                      <span className="text-[11px]">Business Continuity Clause</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Clause 8.2 (BIA) & Clause 8.4 (BCP Plans)"
                      value={form.framework_iso22301 || ""}
                      onChange={(e) => setForm({ ...form, framework_iso22301: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* RACI Matrix Accountability Assignment Grid */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FiUsers className="text-indigo-400" /> RACI Matrix Accountability Assignment
                  </h4>
                  <span className="text-[10px] text-slate-400">Formal GRC governance assignments</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Responsible */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px]">
                        R
                      </span>
                      <span>Responsible</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Executes work)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., IT Security & Operations Team"
                      value={form.raci_responsible}
                      onChange={(e) => setForm({ ...form, raci_responsible: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Accountable */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-[10px]">
                        A
                      </span>
                      <span>Accountable</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Signs off & owns)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Alex Turner / CISO or Legal Adviser"
                      value={form.raci_accountable}
                      onChange={(e) => setForm({ ...form, raci_accountable: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Consulted */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">
                        C
                      </span>
                      <span>Consulted</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Two-way advisory)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Legal, Risk & Governance Department"
                      value={form.raci_consulted}
                      onChange={(e) => setForm({ ...form, raci_consulted: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Informed */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-slate-700 text-slate-300 border border-slate-600/50 flex items-center justify-center font-bold text-[10px]">
                        I
                      </span>
                      <span>Informed</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Notified stakeholders)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., All Employees & Contractors"
                      value={form.raci_informed}
                      onChange={(e) => setForm({ ...form, raci_informed: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Document / File URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Document Link / PDF Attachment URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/document/d/... or intranet link"
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description / Policy Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Policy Summary & Mandatory Obligations <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Summarize the core requirements, acceptable use rules, data handling mandates, and penalties for non-compliance..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{editingId ? "Updating Policy..." : "Publishing Policy..."}</span>
                    </>
                  ) : (
                    editingId ? "Update Policy" : "Publish Policy"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: Employee Read & Acknowledge Modal */}
      {/* ========================================================================= */}
      {readerPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    v{readerPolicy.version || "1.0"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {readerPolicy.department || readerPolicy.department_name || "Enterprise Wide"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {readerPolicy.title || readerPolicy.policy_name}
                </h2>
              </div>
              <button
                onClick={() => setReaderPolicy(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Document Content Scroll Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-sm text-slate-300">
              {/* Statutory & Regulatory Alignment Banner */}
              {readerPolicy.statutory_clauses && (
                <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-center gap-2 text-xs text-blue-300">
                  <FiShield className="text-base text-blue-400 shrink-0" />
                  <div>
                    <strong className="text-white">Statutory & Regulatory Alignment: </strong>
                    <span>{readerPolicy.statutory_clauses}</span>
                  </div>
                </div>
              )}

              {/* Policy Compliance Score Breakdown Card */}
              {(() => {
                const scoreData = calculatePolicyScore(readerPolicy, controlMappings);
                return (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <FiAward className="text-base" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white uppercase tracking-wider">
                            Policy Compliance Scoring Matrix & Checklist
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Evaluated across completeness, review lifecycle, RACI ownership & control mapping
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${scoreData.badgeBg} ${scoreData.gradeColor}`}>
                          {scoreData.score}% · {scoreData.grade}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
                        <div className="text-slate-400">Completeness</div>
                        <div className="font-bold text-white mt-0.5">{scoreData.breakdown.completeness} / 25 pts</div>
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${(scoreData.breakdown.completeness / 25) * 100}%` }} />
                        </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
                        <div className="text-slate-400">RACI Assignment</div>
                        <div className="font-bold text-white mt-0.5">{scoreData.breakdown.raci} / 25 pts</div>
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${(scoreData.breakdown.raci / 25) * 100}%` }} />
                        </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
                        <div className="text-slate-400">Statutory Alignment</div>
                        <div className="font-bold text-white mt-0.5">{scoreData.breakdown.statutory} / 25 pts</div>
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${(scoreData.breakdown.statutory / 25) * 100}%` }} />
                        </div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
                        <div className="text-slate-400">Controls & Review</div>
                        <div className="font-bold text-white mt-0.5">{scoreData.breakdown.controlsAndReview} / 25 pts</div>
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${(scoreData.breakdown.controlsAndReview / 25) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Multi-Framework Statutory Crosswalk in Reader Modal */}
              {(readerPolicy.framework_iso27001 || readerPolicy.framework_cobit || readerPolicy.framework_it_act || readerPolicy.framework_dpdp || readerPolicy.framework_gdpr || readerPolicy.framework_iso22301) && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FiLayers className="text-blue-400" /> Multi-Framework Statutory Crosswalk
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {readerPolicy.framework_iso27001 && (
                      <div className="bg-slate-900/90 border border-blue-500/20 p-2.5 rounded-lg">
                        <div className="text-[10px] font-bold text-blue-400 uppercase">ISO/IEC 27001</div>
                        <div className="text-xs font-semibold text-slate-200 mt-1 truncate" title={readerPolicy.framework_iso27001}>
                          {readerPolicy.framework_iso27001}
                        </div>
                        <div className="text-[10px] text-slate-500">Annex A Control</div>
                      </div>
                    )}
                    {readerPolicy.framework_cobit && (
                      <div className="bg-slate-900/90 border border-purple-500/20 p-2.5 rounded-lg">
                        <div className="text-[10px] font-bold text-purple-400 uppercase">COBIT 2019</div>
                        <div className="text-xs font-semibold text-slate-200 mt-1 truncate" title={readerPolicy.framework_cobit}>
                          {readerPolicy.framework_cobit}
                        </div>
                        <div className="text-[10px] text-slate-500">Governance Obj.</div>
                      </div>
                    )}
                    {readerPolicy.framework_it_act && (
                      <div className="bg-slate-900/90 border border-amber-500/20 p-2.5 rounded-lg">
                        <div className="text-[10px] font-bold text-amber-400 uppercase">IT Act 2000</div>
                        <div className="text-xs font-semibold text-slate-200 mt-1 truncate" title={readerPolicy.framework_it_act}>
                          {readerPolicy.framework_it_act}
                        </div>
                        <div className="text-[10px] text-slate-500">Sec 43A / SPDI</div>
                      </div>
                    )}
                    {(readerPolicy.framework_dpdp || readerPolicy.framework_gdpr) && (
                      <div className="bg-slate-900/90 border border-emerald-500/20 p-2.5 rounded-lg">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase">DPDP Act 2023</div>
                        <div className="text-xs font-semibold text-slate-200 mt-1 truncate" title={readerPolicy.framework_dpdp || readerPolicy.framework_gdpr}>
                          {readerPolicy.framework_dpdp || readerPolicy.framework_gdpr}
                        </div>
                        <div className="text-[10px] text-slate-500">Section Mandate</div>
                      </div>
                    )}
                    {readerPolicy.framework_iso22301 && (
                      <div className="bg-slate-900/90 border border-rose-500/20 p-2.5 rounded-lg">
                        <div className="text-[10px] font-bold text-rose-400 uppercase">ISO 22301</div>
                        <div className="text-xs font-semibold text-slate-200 mt-1 truncate" title={readerPolicy.framework_iso22301}>
                          {readerPolicy.framework_iso22301}
                        </div>
                        <div className="text-[10px] text-slate-500">BCP / Resilience</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RACI Matrix Accountability Card in Reader Modal */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FiUsers className="text-indigo-400" /> RACI Accountability Matrix
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-900/90 border border-blue-500/20 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase">
                      <span className="w-3.5 h-3.5 rounded bg-blue-500/20 flex items-center justify-center text-[9px]">R</span>
                      Responsible
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 truncate" title={readerPolicy.raci_responsible}>
                      {readerPolicy.raci_responsible || "IT Security Team"}
                    </div>
                    <div className="text-[10px] text-slate-400">Executes & enforces</div>
                  </div>

                  <div className="bg-slate-900/90 border border-purple-500/20 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase">
                      <span className="w-3.5 h-3.5 rounded bg-purple-500/20 flex items-center justify-center text-[9px]">A</span>
                      Accountable
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 truncate" title={readerPolicy.raci_accountable}>
                      {readerPolicy.raci_accountable || "Alex Turner / CISO"}
                    </div>
                    <div className="text-[10px] text-slate-400">Approves & owns</div>
                  </div>

                  <div className="bg-slate-900/90 border border-amber-500/20 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase">
                      <span className="w-3.5 h-3.5 rounded bg-amber-500/20 flex items-center justify-center text-[9px]">C</span>
                      Consulted
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 truncate" title={readerPolicy.raci_consulted}>
                      {readerPolicy.raci_consulted || "Legal & Governance"}
                    </div>
                    <div className="text-[10px] text-slate-400">Advises & reviews</div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700/60 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 uppercase">
                      <span className="w-3.5 h-3.5 rounded bg-slate-700 flex items-center justify-center text-[9px]">I</span>
                      Informed
                    </div>
                    <div className="text-xs font-semibold text-white mt-1 truncate" title={readerPolicy.raci_informed}>
                      {readerPolicy.raci_informed || "All Employees"}
                    </div>
                    <div className="text-[10px] text-slate-400">Workforce bound</div>
                  </div>
                </div>
              </div>

              {/* Policy Body */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                {cleanDescriptionText(readerPolicy.description) ||
                  "This policy establishes the minimum acceptable security safeguards, password protocols, asset protections, and confidential information handling requirements expected of all organizational personnel."}
              </div>

              {readerPolicy.file_url && (
                <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-blue-300">
                    Official supplementary policy attachment available:
                  </span>
                  <a
                    href={readerPolicy.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <span>Open Document</span>
                    <FiExternalLink />
                  </a>
                </div>
              )}

              {/* Attestation Checkbox Box */}
              <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedCheckbox}
                    onChange={(e) => setAgreedCheckbox(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                  />
                  <div className="text-xs text-slate-200 leading-normal">
                    <strong>Mandatory Compliance Declaration:</strong> I hereby certify that I have read, understood, and agree to abide by the mandates, obligations, and security protocols outlined in this policy document.
                  </div>
                </label>

                <div className="text-[11px] text-slate-400 pl-7">
                  Attesting identity: <span className="text-slate-200 font-mono">{user?.email || "Current User"}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Next Review: {formatDate(readerPolicy.review_date)}
              </span>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  disabled={acknowledging}
                  onClick={() => setReaderPolicy(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!agreedCheckbox || acknowledging}
                  onClick={handleConfirmAcknowledge}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                >
                  {acknowledging ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Recording Sign-off...</span>
                    </>
                  ) : (
                    "Acknowledge & Sign Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Policies;