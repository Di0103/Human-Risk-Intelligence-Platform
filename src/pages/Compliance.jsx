import React, { useEffect, useState, useMemo } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiLink,
  FiX,
  FiSearch,
  FiLayers,
  FiClock,
  FiFileText,
  FiDatabase,
  FiTrash2,
  FiFilter,
  FiActivity,
  FiTrendingUp,
  FiInfo,
  FiDownload,
  FiRefreshCw,
  FiCheck,
  FiSliders,
  FiEye,
  FiLock,
  FiCpu,
} from "react-icons/fi";
import {
  resolveMultiFrameworkForControl,
  STATUTORY_FRAMEWORKS,
} from "../utils/statutoryFrameworks";

export function Compliance() {
  const { user } = useAuth();
  // Core Data States
  const [frameworks, setFrameworks] = useState([]);
  const [controls, setControls] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Policy-to-Control Mapping States
  const [policies, setPolicies] = useState([]);
  const [policyMappings, setPolicyMappings] = useState([]);
  const [isPolicyMappingModalOpen, setIsPolicyMappingModalOpen] = useState(false);
  const [activePolicyForMapping, setActivePolicyForMapping] = useState(null);
  const [selectedPolicyControlIds, setSelectedPolicyControlIds] = useState([]);
  const [policyMappingSearchTerm, setPolicyMappingSearchTerm] = useState("");
  const [isSavingPolicyMappings, setIsSavingPolicyMappings] = useState(false);

  // Audit Logs & Security Trail States
  const [auditLogs, setAuditLogs] = useState([]);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState("all");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState("all");
  const [isManualAuditModalOpen, setIsManualAuditModalOpen] = useState(false);
  const [manualAuditForm, setManualAuditForm] = useState({
    action: "",
    category: "Internal Audit",
    details: "",
    severity: "info",
  });

  // View & Filter States
  const [activeTab, setActiveTab] = useState("gaps"); // "gaps" | "controls" | "matrix" | "policy_mapping" | "audit_trail"
  const [searchTerm, setSearchTerm] = useState("");
  const [gapFilter, setGapFilter] = useState("all"); // "all" | "gaps_only" | "covered_only"
  const [frameworkFilter, setFrameworkFilter] = useState("all"); // "all" | "iso27001" | "cobit" | "it_act" | "dpdp" | "iso22301"

  // Notification Banner
  const [notification, setNotification] = useState(null);

  // Modals
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [activeRequirement, setActiveRequirement] = useState(null);
  const [selectedControlIds, setSelectedControlIds] = useState([]);
  const [mappingSearchTerm, setMappingSearchTerm] = useState("");

  const [isAddControlModalOpen, setIsAddControlModalOpen] = useState(false);
  const [newControl, setNewControl] = useState({
    control_code: "",
    title: "",
    category: "Technical",
    description: "",
    status: "implemented",
  });

  const [isAddReqModalOpen, setIsAddReqModalOpen] = useState(false);
  const [isSavingRequirement, setIsSavingRequirement] = useState(false);
  const [isSavingControl, setIsSavingControl] = useState(false);
  const [isSavingMappings, setIsSavingMappings] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    name: "ISO/IEC 27001:2022",
    clause: "",
    requirement: "",
    description: "",
  });

  // Fetch all compliance data from LocalStorage
  const fetchComplianceData = () => {
    setLoading(true);
    try {
      const rawFw = localStorageDb.get("compliance_frameworks") || [];
      const rawCtrl = localStorageDb.get("security_controls") || [];
      const rawMap = localStorageDb.get("control_mappings") || [];

      // Normalize requirements to support both standard (schema.sql) and legacy column names
      const normalizedFrameworks = rawFw.map((fw) => ({
        ...fw,
        clause: fw.clause || fw.clause_reference || fw.section_id || "Clause",
        name: fw.name || fw.framework_name || "ISO/IEC 27001:2022",
        requirement: fw.requirement || fw.title || fw.requirement_title || "Requirement",
        description: fw.description || "",
      }));

      // Sort safely in JS
      normalizedFrameworks.sort((a, b) =>
        (a.clause || "").localeCompare(b.clause || "", undefined, { numeric: true, sensitivity: "base" })
      );

      // Normalize controls
      const normalizedControls = rawCtrl.map((c) => ({
        ...c,
        control_code: c.control_code || c.code || "CTRL-000",
        title: c.title || c.control_name || c.name || "Untitled Control",
        description: c.description || "",
        category: c.category || "Technical",
        status: c.status || "implemented",
      }));

      normalizedControls.sort((a, b) =>
        (a.control_code || "").localeCompare(b.control_code || "", undefined, { numeric: true, sensitivity: "base" })
      );

      // Normalize mappings
      const normalizedMappings = rawMap.map((m) => {
        const fwId = String(m.framework_id || m.requirement_id || "").trim();
        const ctrlId = String(m.control_id || "").trim();
        return {
          ...m,
          framework_id: fwId,
          requirement_id: fwId,
          control_id: ctrlId,
        };
      });

      // Policies & Policy-to-Control Mappings
      const rawPolicies = localStorageDb.get("policies") || [];
      const rawPolicyMappings = localStorageDb.get("policy_control_mappings") || [];
      const rawAuditLogs = localStorageDb.get("audit_logs") || [];

      setFrameworks(normalizedFrameworks);
      setControls(normalizedControls);
      setMappings(normalizedMappings);
      setPolicies(rawPolicies);
      setPolicyMappings(rawPolicyMappings);
      setAuditLogs(rawAuditLogs);
    } catch (err) {
      console.error("Error loading compliance data:", err);
      showNotification("error", "Failed to load compliance data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = fetchComplianceData;

  useEffect(() => {
    fetchComplianceData();

    const handleStorageUpdate = (e) => {
      if (
        !e.detail ||
        e.detail.collection === "compliance_frameworks" ||
        e.detail.collection === "security_controls" ||
        e.detail.collection === "control_mappings" ||
        e.detail.collection === "policies" ||
        e.detail.collection === "policy_control_mappings" ||
        e.detail.collection === "audit_logs" ||
        e.detail.collection === "all"
      ) {
        fetchComplianceData();
      }
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Helper map: Framework ID -> Array of mapped Control objects
  const reqControlsMap = useMemo(() => {
    const map = {};
    const controlLookup = new Map();

    controls.forEach((c) => {
      const cIdStr = String(c.id).trim();
      controlLookup.set(cIdStr, c);
      controlLookup.set(c.id, c);
    });

    frameworks.forEach((fw) => {
      const fwIdStr = String(fw.id).trim();
      map[fwIdStr] = [];
      map[fw.id] = map[fwIdStr];
    });

    mappings.forEach((m) => {
      const fwId = String(m.framework_id || m.requirement_id || "").trim();
      const ctrlId = String(m.control_id || "").trim();

      const targetList =
        map[fwId] ||
        (m.framework_id ? map[m.framework_id] : null) ||
        (m.requirement_id ? map[m.requirement_id] : null);
      const controlObj =
        controlLookup.get(ctrlId) ||
        (m.control_id ? controlLookup.get(m.control_id) : null);

      if (targetList && controlObj) {
        // Prevent duplicate control insertions in the mapped list
        if (
          !targetList.some(
            (existing) =>
              String(existing.id).trim() === String(controlObj.id).trim()
          )
        ) {
          targetList.push({
            ...controlObj,
            mappingId: m.id,
            notes: m.notes,
          });
        }
      }
    });

    return map;
  }, [frameworks, controls, mappings]);

  // Dynamic KPI Metrics
  const metrics = useMemo(() => {
    const totalRequirements = frameworks.length;
    const totalControls = controls.length;

    let coveredCount = 0;
    let gapCount = 0;

    frameworks.forEach((fw) => {
      const fwId = String(fw.id).trim();
      const mapped = reqControlsMap[fwId] || reqControlsMap[fw.id] || [];
      if (mapped.length > 0) {
        coveredCount++;
      } else {
        gapCount++;
      }
    });

    const readinessPercentage =
      totalRequirements > 0
        ? Math.round((coveredCount / totalRequirements) * 100)
        : 0;

    return {
      totalRequirements,
      totalControls,
      coveredCount,
      gapCount,
      readinessPercentage,
    };
  }, [frameworks, controls, reqControlsMap]);

  // Policy -> Array of mapped controls
  const policyControlsMap = useMemo(() => {
    const map = {};
    const controlLookup = new Map();

    controls.forEach((c) => {
      controlLookup.set(String(c.id).trim(), c);
      controlLookup.set(c.id, c);
      if (c.control_code) controlLookup.set(c.control_code, c);
    });

    policies.forEach((p) => {
      map[String(p.id)] = [];
      map[p.id] = map[String(p.id)];
    });

    policyMappings.forEach((m) => {
      const polId = String(m.policy_id || "").trim();
      const ctrlId = String(m.control_id || "").trim();
      const targetList = map[polId] || (m.policy_id ? map[m.policy_id] : null);
      const controlObj = controlLookup.get(ctrlId) || (m.control_id ? controlLookup.get(m.control_id) : null);

      if (targetList && controlObj) {
        if (!targetList.some((existing) => String(existing.id).trim() === String(controlObj.id).trim())) {
          targetList.push({
            ...controlObj,
            mappingId: m.id,
            notes: m.notes,
          });
        }
      }
    });

    return map;
  }, [policies, controls, policyMappings]);

  // Policy Compliance Metrics
  const policyComplianceMetrics = useMemo(() => {
    const totalPolicies = policies.length;
    let coveredPoliciesCount = 0;
    let totalLinkedControlsCount = 0;
    let implementedLinkedControlsCount = 0;

    policies.forEach((p) => {
      const mapped = policyControlsMap[String(p.id)] || policyControlsMap[p.id] || [];
      if (mapped.length > 0) {
        coveredPoliciesCount++;
        mapped.forEach((c) => {
          totalLinkedControlsCount++;
          if (c.status === "implemented") {
            implementedLinkedControlsCount++;
          }
        });
      }
    });

    const unmappedPoliciesCount = Math.max(0, totalPolicies - coveredPoliciesCount);
    const overallEnforcementRate = totalLinkedControlsCount > 0
      ? Math.round((implementedLinkedControlsCount / totalLinkedControlsCount) * 100)
      : (totalPolicies > 0 && coveredPoliciesCount === 0 ? 0 : 100);

    const policyCoverageRate = totalPolicies > 0
      ? Math.round((coveredPoliciesCount / totalPolicies) * 100)
      : 0;

    return {
      totalPolicies,
      coveredPoliciesCount,
      unmappedPoliciesCount,
      totalLinkedControlsCount,
      implementedLinkedControlsCount,
      overallEnforcementRate,
      policyCoverageRate,
    };
  }, [policies, policyControlsMap]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditSearchTerm.trim()) {
        const term = auditSearchTerm.toLowerCase();
        const matches =
          (log.action || "").toLowerCase().includes(term) ||
          (log.category || "").toLowerCase().includes(term) ||
          (log.details || "").toLowerCase().includes(term) ||
          (log.actor || "").toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (auditCategoryFilter !== "all" && log.category !== auditCategoryFilter) {
        return false;
      }
      if (auditSeverityFilter !== "all" && log.severity !== auditSeverityFilter) {
        return false;
      }
      return true;
    });
  }, [auditLogs, auditSearchTerm, auditCategoryFilter, auditSeverityFilter]);

  // Policy Mapping Handlers
  const handleOpenPolicyMapping = (policy) => {
    setActivePolicyForMapping(policy);
    const mapped = policyControlsMap[String(policy.id)] || policyControlsMap[policy.id] || [];
    setSelectedPolicyControlIds(mapped.map((c) => c.id));
    setPolicyMappingSearchTerm("");
    setIsPolicyMappingModalOpen(true);
  };

  const handleSavePolicyMappings = () => {
    if (!activePolicyForMapping) return;
    setIsSavingPolicyMappings(true);

    try {
      const polId = String(activePolicyForMapping.id).trim();
      const allPcm = localStorageDb.get("policy_control_mappings") || [];

      // Remove existing mappings for this policy
      const remaining = allPcm.filter((m) => String(m.policy_id).trim() !== polId);

      // Add selected controls
      const newMappings = selectedPolicyControlIds.map((ctrlId, index) => ({
        id: `pcm-${Date.now()}-${index}`,
        policy_id: activePolicyForMapping.id,
        control_id: ctrlId,
        notes: `Linked via Policy Compliance Console`,
        created_at: new Date().toISOString(),
      }));

      const updated = [...newMappings, ...remaining];
      localStorageDb.set("policy_control_mappings", updated);

      localStorageDb.logAudit({
        action: "POLICY_CONTROL_MAP",
        category: "Policy Compliance",
        entity: "policy_control_mappings",
        details: `Updated linked controls for policy "${activePolicyForMapping.title || activePolicyForMapping.policy_name}" (${selectedPolicyControlIds.length} controls aligned)`,
        actor: user?.email || "Admin",
        severity: "info",
      });

      showNotification(
        "success",
        `Aligned ${selectedPolicyControlIds.length} control(s) to "${activePolicyForMapping.title || activePolicyForMapping.policy_name}"!`
      );
      setIsPolicyMappingModalOpen(false);
      fetchComplianceData();
    } catch (err) {
      console.error("Save Policy Mappings Error:", err);
      showNotification("error", `Failed to save policy linkages: ${err.message}`);
    } finally {
      setIsSavingPolicyMappings(false);
    }
  };

  const handleUnlinkControlFromPolicy = (policyId, controlId, controlCode) => {
    if (!window.confirm(`Unlink control ${controlCode} from this policy?`)) return;

    try {
      const allPcm = localStorageDb.get("policy_control_mappings") || [];
      const updated = allPcm.filter(
        (m) => !(String(m.policy_id).trim() === String(policyId).trim() && String(m.control_id).trim() === String(controlId).trim())
      );
      localStorageDb.set("policy_control_mappings", updated);

      localStorageDb.logAudit({
        action: "POLICY_CONTROL_UNLINK",
        category: "Policy Compliance",
        entity: "policy_control_mappings",
        details: `Unlinked control ${controlCode} from policy ID ${policyId}`,
        severity: "warning",
      });

      showNotification("success", `Unlinked control ${controlCode}.`);
      fetchComplianceData();
    } catch (err) {
      showNotification("error", "Failed to unlink control: " + err.message);
    }
  };

  const handleAutoMapPolicyControls = () => {
    if (policies.length === 0) {
      showNotification("error", "No internal policies available to map.");
      return;
    }

    try {
      const allPcm = localStorageDb.get("policy_control_mappings") || [];
      const autoAdded = [];

      policies.forEach((p) => {
        const title = (p.title || p.policy_name || "").toLowerCase();
        let targetCodes = [];

        if (title.includes("access") || title.includes("password")) {
          targetCodes = ["CTRL-002", "CTRL-007"];
        } else if (title.includes("privacy") || title.includes("dpdp") || title.includes("gdpr") || title.includes("data")) {
          targetCodes = ["CTRL-001", "CTRL-010"];
        } else if (title.includes("continuity") || title.includes("disaster") || title.includes("resilience")) {
          targetCodes = ["CTRL-003", "CTRL-005"];
        } else if (title.includes("incident") || title.includes("response")) {
          targetCodes = ["CTRL-002", "CTRL-008"];
        } else if (title.includes("remote") || title.includes("byod")) {
          targetCodes = ["CTRL-006", "CTRL-007"];
        } else {
          targetCodes = ["CTRL-001", "CTRL-006", "CTRL-007"];
        }

        controls.forEach((c) => {
          if (targetCodes.includes(c.control_code)) {
            const alreadyExists = allPcm.some(
              (m) => String(m.policy_id) === String(p.id) && String(m.control_id) === String(c.id)
            );
            if (!alreadyExists) {
              autoAdded.push({
                id: `pcm-auto-${Date.now()}-${p.id}-${c.id}`,
                policy_id: p.id,
                control_id: c.id,
                notes: "Intelligently auto-aligned based on statutory policy taxonomy",
                created_at: new Date().toISOString(),
              });
            }
          }
        });
      });

      const updated = [...autoAdded, ...allPcm];
      localStorageDb.set("policy_control_mappings", updated);

      localStorageDb.logAudit({
        action: "POLICY_AUTO_ALIGN",
        category: "Policy Compliance",
        entity: "policy_control_mappings",
        details: `Intelligently auto-aligned ${autoAdded.length} controls across ${policies.length} policies`,
        severity: "info",
      });

      showNotification("success", `Auto-aligned ${autoAdded.length} security controls to policies!`);
      fetchComplianceData();
    } catch (err) {
      showNotification("error", "Failed to auto-align: " + err.message);
    }
  };

  // Audit Logs Handlers
  const handleExportAuditJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `grc_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("success", "Audit trail exported as JSON.");
  };

  const handleExportAuditCsv = () => {
    const headers = ["ID", "Timestamp", "Action", "Category", "Severity", "Actor", "Details", "IP"];
    const rows = auditLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.action || ""}"`,
      `"${l.category || ""}"`,
      `"${l.severity || ""}"`,
      `"${l.actor || ""}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      `"${l.ip_hash || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `grc_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotification("success", "Audit trail exported as CSV.");
  };

  const handleClearAuditLogs = () => {
    if (!window.confirm("Are you sure you want to clear the audit logs? This action cannot be undone.")) return;
    localStorageDb.clearAuditLogs();
    showNotification("success", "Audit logs cleared successfully.");
    fetchComplianceData();
  };

  const handleSaveManualAuditLog = (e) => {
    e.preventDefault();
    if (!manualAuditForm.action.trim() || !manualAuditForm.details.trim()) {
      alert("Please provide both Event Title / Action and Details.");
      return;
    }

    localStorageDb.logAudit({
      action: manualAuditForm.action.trim(),
      category: manualAuditForm.category,
      entity: "Manual Verification",
      details: manualAuditForm.details.trim(),
      actor: user?.email || "Lead Auditor",
      severity: manualAuditForm.severity,
    });

    showNotification("success", "Manual compliance event logged in audit trail.");
    setIsManualAuditModalOpen(false);
    setManualAuditForm({
      action: "",
      category: "Internal Audit",
      details: "",
      severity: "info",
    });
    fetchComplianceData();
  };

  // Open Mapping Modal for a specific requirement
  const handleOpenMappingModal = (framework) => {
    setActiveRequirement(framework);
    const fwId = String(framework.id).trim();
    const existing = (
      reqControlsMap[fwId] ||
      reqControlsMap[framework.id] ||
      []
    ).map((c) => c.id);
    setSelectedControlIds(existing);
    setMappingSearchTerm("");
    setIsMappingModalOpen(true);
  };

  // Save selected control mappings
  const handleMapControls = async () => {
    if (!activeRequirement) return;

    setIsSavingMappings(true);

    const fwId = String(activeRequirement.id).trim();
    const currentMappedControls =
      reqControlsMap[fwId] || reqControlsMap[activeRequirement.id] || [];
    const currentMappedIds = currentMappedControls.map((c) =>
      String(c.id).trim()
    );
    const selectedStrings = selectedControlIds.map((id) => String(id).trim());

    const toAdd = selectedStrings.filter((id) => !currentMappedIds.includes(id));
    const toRemove = currentMappedIds.filter(
      (id) => !selectedStrings.includes(id)
    );

    // 1. Optimistic Local State Update: Instantly flip badge to COVERED / COMPLIANT!
    const remainingMappings = mappings.filter((m) => {
      const mFw = String(m.framework_id || m.requirement_id || "").trim();
      const mCtrl = String(m.control_id || "").trim();
      if (
        (mFw === fwId || mFw === String(activeRequirement.id)) &&
        toRemove.includes(mCtrl)
      ) {
        return false;
      }
      return true;
    });

    const addedMappingObjects = toAdd.map((ctrlId) => ({
      id: `opt-${Date.now()}-${ctrlId}`,
      framework_id: activeRequirement.id,
      requirement_id: activeRequirement.id,
      control_id: ctrlId,
      notes: "Mapped via Compliance Management Console",
    }));

    const optimisticMappings = [...remainingMappings, ...addedMappingObjects];
    setMappings(optimisticMappings);

    try {
      const allMappings = localStorageDb.get("control_mappings") || [];
      // Remove unselected
      let updated = allMappings.filter((m) => {
        const mFw = String(m.framework_id || m.requirement_id || "").trim();
        const mCtrl = String(m.control_id || "").trim();
        const reqId = String(activeRequirement.id).trim();
        if (mFw === reqId && toRemove.map(String).includes(mCtrl)) {
          return false;
        }
        return true;
      });

      // Add new mappings
      if (toAdd.length > 0) {
        const newObjs = toAdd.map((controlId, index) => ({
          id: `map-${Date.now()}-${index}`,
          framework_id: activeRequirement.id,
          requirement_id: activeRequirement.id,
          control_id: controlId,
          notes: `Mapped via Compliance Management Console`,
          user_id: user?.id,
          organization_id: user?.id,
          created_at: new Date().toISOString(),
        }));
        updated = [...newObjs, ...updated];
      }

      localStorageDb.set("control_mappings", updated);

      showNotification(
        "success",
        `Control mappings updated for ${activeRequirement.clause}!`
      );
      setIsMappingModalOpen(false);
      fetchComplianceData();
    } catch (err) {
      console.error("Save Mappings Error:", err);
      showNotification("error", `Error updating mappings: ${err.message}`);
    } finally {
      setIsSavingMappings(false);
    }
  };

  const handleSaveMappings = handleMapControls;

  // Quick Unmap a specific control from a requirement
  const handleQuickUnmap = (frameworkId, controlId, controlCode) => {
    if (
      !window.confirm(
        `Unlink control ${controlCode} from this clause? This may trigger a compliance gap warning.`
      )
    ) {
      return;
    }

    const fwId = String(frameworkId).trim();
    const ctrlId = String(controlId).trim();

    try {
      const allMappings = localStorageDb.get("control_mappings") || [];
      const updated = allMappings.filter((m) => {
        const mFw = String(m.framework_id || m.requirement_id || "").trim();
        const mCtrl = String(m.control_id || "").trim();
        return !(mFw === fwId && mCtrl === ctrlId);
      });

      localStorageDb.set("control_mappings", updated);
      showNotification("success", `Unmapped ${controlCode} successfully.`);
      fetchComplianceData();
    } catch (err) {
      console.error("Error unmapping control:", err);
      showNotification("error", "Failed to unmap: " + err.message);
    }
  };

  // Add / Save new Security Control
  const handleSaveControl = (e) => {
    e.preventDefault();

    const code = (newControl.control_code || newControl.code || "").trim();
    const title = (newControl.title || newControl.name || newControl.control_name || "").trim();
    const description = (newControl.description || "").trim();
    const category = (newControl.category || "Technical").trim();
    const status = newControl.status || "implemented";

    if (!code || !title) {
      alert("Please provide both Control Code and Title/Name.");
      return;
    }

    setIsSavingControl(true);

    try {
      const currentControls = localStorageDb.get("security_controls") || [];
      const nextId = currentControls.length
        ? Math.max(...currentControls.map((c) => Number(c.id) || 0), 0) + 1
        : 1;

      const payload = {
        id: nextId,
        code: code,
        control_code: code,
        name: title,
        title: title,
        category: category,
        status: status,
        description: description,
        user_id: user?.id,
        organization_id: user?.id,
        created_at: new Date().toISOString(),
      };

      localStorageDb.insert("security_controls", payload);
      showNotification("success", `Security Control "${code}" created successfully.`);
      setIsAddControlModalOpen(false);
      setNewControl({
        control_code: "",
        title: "",
        category: "Technical",
        description: "",
        status: "implemented",
      });
      fetchComplianceData();
    } catch (err) {
      console.error("Save Control Error:", err);
      showNotification("error", `Failed to save control: ${err.message}`);
    } finally {
      setIsSavingControl(false);
    }
  };

  const handleCreateControl = handleSaveControl;

  // Delete Security Control
  const handleDeleteControl = (controlId, controlCode) => {
    if (
      !window.confirm(
        `Are you sure you want to delete control "${controlCode}"? All linkages to compliance requirements will be unmapped.`
      )
    ) {
      return;
    }

    try {
      localStorageDb.delete("security_controls", controlId);
      // Also unmap from control_mappings
      const allMappings = localStorageDb.get("control_mappings") || [];
      const updatedMappings = allMappings.filter((m) => String(m.control_id) !== String(controlId));
      localStorageDb.set("control_mappings", updatedMappings);

      showNotification("success", `Security Control "${controlCode}" deleted.`);
      fetchComplianceData();
    } catch (err) {
      console.error("Error deleting control:", err);
      showNotification("error", "Failed to delete control: " + err.message);
    }
  };

  // Add / Save new Framework Requirement
  const handleSaveRequirement = (e) => {
    e.preventDefault();

    const clause = (newRequirement.clause || "").trim();
    const reqTitle = (newRequirement.requirement || "").trim();
    const fwName = (newRequirement.name || "ISO/IEC 27001:2022").trim();
    const desc = (newRequirement.description || "").trim();

    if (!clause || !reqTitle) {
      alert("Please provide both Clause Reference and Requirement Title.");
      return;
    }

    setIsSavingRequirement(true);

    try {
      const currentFrameworks = localStorageDb.get("compliance_frameworks") || [];
      const nextId = currentFrameworks.length
        ? Math.max(...currentFrameworks.map((f) => Number(f.id) || 0), 0) + 1
        : 1;

      const payload = {
        id: nextId,
        name: fwName,
        framework_name: fwName,
        clause: clause,
        clause_reference: clause,
        requirement: reqTitle,
        title: reqTitle,
        description: desc,
        user_id: user?.id,
        organization_id: user?.id,
        created_at: new Date().toISOString(),
      };

      localStorageDb.insert("compliance_frameworks", payload);
      showNotification("success", `Requirement "${clause}" added successfully.`);
      setIsAddReqModalOpen(false);
      setNewRequirement({
        name: "ISO/IEC 27001:2022",
        clause: "",
        requirement: "",
        description: "",
      });
      fetchComplianceData();
    } catch (err) {
      console.error("Save Requirement Error:", err);
      showNotification("error", `Failed to save requirement: ${err.message}`);
    } finally {
      setIsSavingRequirement(false);
    }
  };

  const handleCreateRequirement = handleSaveRequirement;

  // Delete Framework Requirement
  const handleDeleteRequirement = (frameworkId, clause) => {
    if (
      !window.confirm(
        `Are you sure you want to delete requirement "${clause}"? All mapped controls will be unlinked.`
      )
    ) {
      return;
    }

    try {
      localStorageDb.delete("compliance_frameworks", frameworkId);
      // Unlink mappings
      const allMappings = localStorageDb.get("control_mappings") || [];
      const updatedMappings = allMappings.filter(
        (m) => String(m.framework_id || m.requirement_id) !== String(frameworkId)
      );
      localStorageDb.set("control_mappings", updatedMappings);

      showNotification("success", `Requirement "${clause}" deleted.`);
      fetchComplianceData();
    } catch (err) {
      console.error("Error deleting requirement:", err);
      showNotification("error", "Failed to delete requirement: " + err.message);
    }
  };

  // Status Badge Helper for Controls
  const renderControlStatusBadge = (status) => {
    switch (status) {
      case "implemented":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <FiCheckCircle className="w-3 h-3" /> Implemented
          </span>
        );
      case "partially_implemented":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FiClock className="w-3 h-3" /> Partially Implemented
          </span>
        );
      case "planned":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <FiClock className="w-3 h-3" /> Planned
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

  // Filtered Requirements for Tab 1
  const filteredRequirements = useMemo(() => {
    return frameworks.filter((fw) => {
      const matchesSearch =
        fw.clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fw.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (fw.description &&
          fw.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const fwIdStr = String(fw.id).trim();
      const mapped = reqControlsMap[fwIdStr] || reqControlsMap[fw.id] || [];
      const isGap = mapped.length === 0;

      if (!matchesSearch) return false;
      if (gapFilter === "gaps_only") return isGap;
      if (gapFilter === "covered_only") return !isGap;
      return true;
    });
  }, [frameworks, searchTerm, gapFilter, reqControlsMap]);

  // Filtered Controls for Tab 2 (with Multi-Framework Statutory Filtering)
  const filteredControls = useMemo(() => {
    return controls.filter((ctrl) => {
      const matchesSearch =
        searchTerm === "" ||
        ctrl.control_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctrl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ctrl.description &&
          ctrl.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (frameworkFilter !== "all") {
        const fw = resolveMultiFrameworkForControl(ctrl.control_code, ctrl.title);
        if (frameworkFilter === "iso27001" && !fw.iso27001) return false;
        if (frameworkFilter === "cobit" && !fw.cobit) return false;
        if (frameworkFilter === "it_act" && !fw.itAct) return false;
        if (frameworkFilter === "dpdp" && !(fw.dpdp || fw.gdpr)) return false;
        if (frameworkFilter === "iso22301" && !fw.iso22301) return false;
        if (frameworkFilter === "gdpr" && !(fw.dpdp || fw.gdpr)) return false;
      }

      return true;
    });
  }, [controls, searchTerm, frameworkFilter]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Compliance & Structured Gap Identification
              </h1>
              <p className="text-xs text-slate-400">
                Continuous ISO/IEC 27001:2022 clause-to-control audit readiness and gap mitigation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAuditDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <FiClock className="text-indigo-400" />
            <span>Audit Trail Drawer ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setIsAddReqModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <FiPlus /> Add Requirement
          </button>
          <button
            onClick={() => setIsAddControlModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
          >
            <FiPlus /> Add Security Control
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-sm flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/80 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <FiCheckCircle className="text-emerald-400 text-base" />
            ) : (
              <FiAlertTriangle className="text-red-400 text-base" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Requirements */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Framework Clauses
            </span>
            <FiFileText className="text-blue-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            {metrics.totalRequirements}
          </div>
          <div className="text-[11px] text-blue-400 mt-1 font-medium">
            ISO/IEC 27001:2022
          </div>
        </div>

        {/* Total Controls */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Controls Library
            </span>
            <FiDatabase className="text-indigo-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            {metrics.totalControls}
          </div>
          <div className="text-[11px] text-indigo-300 mt-1 font-medium">
            Active Safeguards
          </div>
        </div>

        {/* Fully Covered Requirements */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Fully Covered
            </span>
            <FiCheckCircle className="text-emerald-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">
            {metrics.coveredCount}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">
            Control Safeguard Active
          </div>
        </div>

        {/* Identified Compliance Gaps (with warning pulse) */}
        <div
          className={`bg-slate-900/90 border rounded-2xl p-4 shadow-sm transition ${
            metrics.gapCount > 0
              ? "border-red-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20"
              : "border-slate-800/90"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Compliance Gaps
            </span>
            <div className="relative">
              {metrics.gapCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
              <FiAlertTriangle className="text-red-400 text-lg" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1.5">
            {metrics.gapCount}
          </div>
          <div className="text-[11px] text-red-300/80 mt-1 font-medium">
            {metrics.gapCount > 0 ? "Requires Immediate Mapping" : "No Uncovered Gaps"}
          </div>
        </div>

        {/* Compliance Readiness Score */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Readiness Score
            </span>
            <FiActivity className="text-emerald-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5 flex items-baseline gap-1">
            <span
              className={
                metrics.readinessPercentage >= 80
                  ? "text-emerald-400"
                  : metrics.readinessPercentage >= 50
                  ? "text-amber-400"
                  : "text-red-400"
              }
            >
              {metrics.readinessPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.readinessPercentage >= 80
                  ? "bg-emerald-500"
                  : metrics.readinessPercentage >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${metrics.readinessPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. View Switcher Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("gaps")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "gaps"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Requirements & Gap Analysis</span>
            {metrics.gapCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                {metrics.gapCount} Gaps
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("controls")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "controls"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Security Controls Library</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {metrics.totalControls}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "matrix"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Requirement-Control Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("policy_mapping")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "policy_mapping"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FiLink />
            <span>Policy-to-Control Alignment</span>
            {policyComplianceMetrics.unmappedPoliciesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {policyComplianceMetrics.unmappedPoliciesCount} Unmapped
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("audit_trail")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "audit_trail"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FiClock />
            <span>Audit Trail & Activity Log</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* Tab 1 Filters: Status & Search */}
        {activeTab === "gaps" && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setGapFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  gapFilter === "all"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({metrics.totalRequirements})
              </button>
              <button
                onClick={() => setGapFilter("gaps_only")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  gapFilter === "gaps_only"
                    ? "bg-red-950/80 text-red-300 font-semibold border border-red-500/30"
                    : "text-slate-400 hover:text-red-400"
                }`}
              >
                <FiAlertTriangle className="text-xs" />
                Gaps Only ({metrics.gapCount})
              </button>
              <button
                onClick={() => setGapFilter("covered_only")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  gapFilter === "covered_only"
                    ? "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30"
                    : "text-slate-400 hover:text-emerald-400"
                }`}
              >
                Covered ({metrics.coveredCount})
              </button>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3.5 top-2.5 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search clause or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Tab 1: Compliance Requirements & Structured Gap Analysis */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Evaluating compliance posture & gaps...</p>
        </div>
      ) : activeTab === "gaps" ? (
        <div className="space-y-3.5">
          {filteredRequirements.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
              <FiShield className="text-4xl mx-auto mb-3 text-slate-500" />
              <p className="text-base font-semibold text-white">No records found in database.</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {frameworks.length === 0
                  ? "Your statutory compliance repository currently has 0 requirements."
                  : "No requirements match your active search or gap filter."}
              </p>
              <button
                onClick={() => setIsAddReqModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                <FiPlus /> Add / Create New Requirement
              </button>
            </div>
          ) : (
            filteredRequirements.map((fw) => {
              const fwIdStr = String(fw.id).trim();
              const mapped = reqControlsMap[fwIdStr] || reqControlsMap[fw.id] || [];
              const isGap = mapped.length === 0;

              return (
                <div
                  key={fw.id}
                  className={`bg-slate-900/90 border rounded-2xl p-5 transition hover:border-slate-700 shadow-sm ${
                    isGap
                      ? "border-red-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/10"
                      : "border-slate-800"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Requirement Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg font-mono text-xs font-bold">
                          {fw.clause}
                        </span>

                        <span className="text-xs text-slate-400 font-medium">
                          {fw.name}
                        </span>

                        {/* Structured Gap Status Badge */}
                        {isGap ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/40">
                            <FiAlertTriangle className="animate-pulse" />
                            COMPLIANCE GAP (0 Controls)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                            <FiCheckCircle />
                            COVERED / COMPLIANT ({mapped.length}{" "}
                            {mapped.length === 1 ? "Control" : "Controls"})
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">
                        {fw.requirement}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                        {fw.description ||
                          "Standard clause criteria defined by the ISO 27001 information security framework."}
                      </p>

                      {/* Mapped Safeguards Section */}
                      <div className="pt-2">
                        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                          <span>Mapped Safeguards & Mitigating Controls:</span>
                        </div>

                        {isGap ? (
                          <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 text-xs text-red-300">
                              <FiAlertTriangle className="text-red-400 text-sm flex-shrink-0" />
                              <span>
                                <strong>High Priority Audit Action:</strong> No active security control is mapped to mitigate this clause.
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenMappingModal(fw)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow transition whitespace-nowrap"
                            >
                              Map Control to Fix Gap
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            {mapped.map((ctrl) => (
                              <div
                                key={ctrl.id}
                                className="group flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-slate-200 transition"
                              >
                                <span className="font-mono font-bold text-blue-400">
                                  {ctrl.control_code}
                                </span>
                                <span className="max-w-[180px] sm:max-w-[240px] truncate font-medium">
                                  {ctrl.title}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuickUnmap(fw.id, ctrl.id, ctrl.control_code)
                                  }
                                  title="Unmap control"
                                  className="text-slate-500 hover:text-red-400 transition ml-1"
                                >
                                  <FiX />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 flex-shrink-0 pt-2 lg:pt-0">
                      <button
                        onClick={() => handleOpenMappingModal(fw)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition"
                      >
                        <FiLink /> Map Controls
                      </button>
                      <button
                        onClick={() => handleDeleteRequirement(fw.id, fw.clause)}
                        title="Delete this requirement"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === "controls" ? (
        /* 5. Tab 2: Security Controls Library */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-slate-400 px-1">
            {/* Framework Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFrameworkFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  frameworkFilter === "all"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Frameworks ({controls.length})
              </button>
              <button
                onClick={() => setFrameworkFilter("iso27001")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  frameworkFilter === "iso27001"
                    ? "bg-blue-950/80 text-blue-300 font-semibold border border-blue-500/30"
                    : "text-slate-400 hover:text-blue-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                ISO 27001
              </button>
              <button
                onClick={() => setFrameworkFilter("cobit")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  frameworkFilter === "cobit"
                    ? "bg-purple-950/80 text-purple-300 font-semibold border border-purple-500/30"
                    : "text-slate-400 hover:text-purple-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                COBIT 2019
              </button>
              <button
                onClick={() => setFrameworkFilter("it_act")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  frameworkFilter === "it_act"
                    ? "bg-amber-950/80 text-amber-300 font-semibold border border-amber-500/30"
                    : "text-slate-400 hover:text-amber-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                IT Act 2000
              </button>
              <button
                onClick={() => setFrameworkFilter("dpdp")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  frameworkFilter === "dpdp"
                    ? "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30"
                    : "text-slate-400 hover:text-emerald-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                DPDP Act 2023
              </button>
              <button
                onClick={() => setFrameworkFilter("iso22301")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  frameworkFilter === "iso22301"
                    ? "bg-rose-950/80 text-rose-300 font-semibold border border-rose-500/30"
                    : "text-slate-400 hover:text-rose-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                ISO 22301
              </button>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3.5 top-2.5 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search controls or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
              />
            </div>
          </div>

          {filteredControls.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
              <FiDatabase className="text-4xl mx-auto mb-3 text-slate-500" />
              <p className="text-base font-semibold text-white">No security controls found.</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                {controls.length === 0
                  ? "Your security controls catalog currently has 0 controls."
                  : "No controls match your active framework or search filter."}
              </p>
              <button
                onClick={() => setIsAddControlModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                <FiPlus /> Add / Create Security Control
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 w-28">Control Code</th>
                      <th className="py-3.5 px-4">Title</th>
                      <th className="py-3.5 px-4 min-w-[220px]">Multi-Framework Crosswalk</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Safeguard Description</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Linked Clauses</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredControls.map((ctrl) => {
                      const ctrlIdStr = String(ctrl.id).trim();
                      const linkedFrameworks = mappings.filter(
                        (m) => String(m.control_id).trim() === ctrlIdStr
                      );
                      const multiFw = resolveMultiFrameworkForControl(ctrl.control_code, ctrl.title);

                      return (
                        <tr key={ctrl.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-400">
                            {ctrl.control_code}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {ctrl.title}
                          </td>

                          {/* Multi-Framework Statutory Crosswalk Badges */}
                          <td className="py-3.5 px-4 text-xs">
                            <div className="flex flex-col gap-1 min-w-[210px]">
                              {/* ISO 27001 */}
                              <div
                                className="flex items-center gap-1.5 text-[11px]"
                                title={`ISO/IEC 27001:2022: ${multiFw.iso27001}`}
                              >
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-[9px] shrink-0">
                                  ISO
                                </span>
                                <span className="text-slate-300 font-mono text-[10px] truncate max-w-[180px]">
                                  {multiFw.iso27001}
                                </span>
                              </div>

                              {/* COBIT 2019 */}
                              <div
                                className="flex items-center gap-1.5 text-[11px]"
                                title={`COBIT 2019: ${multiFw.cobit}`}
                              >
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold text-[9px] shrink-0">
                                  COBIT
                                </span>
                                <span className="text-purple-300 font-mono text-[10px] truncate max-w-[180px]">
                                  {multiFw.cobit}
                                </span>
                              </div>

                              {/* IT Act 2000 */}
                              <div
                                className="flex items-center gap-1.5 text-[11px]"
                                title={`IT Act 2000 (India): ${multiFw.itAct}`}
                              >
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[9px] shrink-0">
                                  IT Act
                                </span>
                                <span className="text-amber-300 font-mono text-[10px] truncate max-w-[180px]">
                                  {multiFw.itAct}
                                </span>
                              </div>

                              {/* DPDP Act 2023 */}
                              {(multiFw.dpdp || multiFw.gdpr) && (
                                <div
                                  className="flex items-center gap-1.5 text-[11px]"
                                  title={`DPDP Act 2023: ${multiFw.dpdp || multiFw.gdpr}`}
                                >
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[9px] shrink-0">
                                    DPDP
                                  </span>
                                  <span className="text-emerald-300 font-mono text-[10px] truncate max-w-[180px]">
                                    {multiFw.dpdp || multiFw.gdpr}
                                  </span>
                                </div>
                              )}

                              {/* ISO 22301:2019 */}
                              {multiFw.iso22301 && (
                                <div
                                  className="flex items-center gap-1.5 text-[11px]"
                                  title={`ISO 22301:2019: ${multiFw.iso22301}`}
                                >
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[9px] shrink-0">
                                    ISO 22301
                                  </span>
                                  <span className="text-rose-300 font-mono text-[10px] truncate max-w-[180px]">
                                    {multiFw.iso22301}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-300">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                              {ctrl.category || "Technical"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">
                            {ctrl.description || "No description provided."}
                          </td>
                          <td className="py-3.5 px-4">
                            {renderControlStatusBadge(ctrl.status)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                              {linkedFrameworks.length}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteControl(ctrl.id, ctrl.control_code)}
                              title="Delete this control"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 6. Tab 3: Requirement-Control Matrix */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Traceability Matrix (Cross-Reference)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct audit evidence linking requirements to technical safeguards.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {mappings.length} Active Linkages
              </span>
            </div>

            {frameworks.length === 0 ? (
              <div className="p-10 text-center text-slate-400 border border-slate-800 rounded-xl">
                <FiLayers className="text-4xl mx-auto mb-3 text-slate-500" />
                <p className="text-base font-semibold text-white">No records found in database.</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Add compliance requirements and security controls to generate the matrix.
                </p>
                <button
                  onClick={() => setIsAddReqModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  <FiPlus /> Add / Create Requirement
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">ISO 27001 Clause</th>
                      <th className="py-3.5 px-4">Requirement Statement</th>
                      <th className="py-3.5 px-4">Mapped Security Control</th>
                      <th className="py-3.5 px-4 min-w-[210px]">Statutory Crosswalk Mapping</th>
                      <th className="py-3.5 px-4">Control Status</th>
                      <th className="py-3.5 px-4">Audit Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {frameworks.map((fw) => {
                      const fwIdStr = String(fw.id).trim();
                      const mapped = reqControlsMap[fwIdStr] || reqControlsMap[fw.id] || [];

                      if (mapped.length === 0) {
                        return (
                          <tr
                            key={fw.id}
                            className="bg-red-950/10 hover:bg-red-950/20 transition"
                          >
                            <td className="py-3.5 px-4 font-mono text-xs font-bold text-red-400">
                              {fw.clause}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium text-white">
                              {fw.requirement}
                            </td>
                            <td
                              colSpan="4"
                              className="py-3.5 px-4 text-xs font-semibold text-red-400"
                            >
                              ⚠️ Unmitigated Gap — No Controls Mapped
                            </td>
                          </tr>
                        );
                      }

                      return mapped.map((ctrl, idx) => {
                        const ctrlFw = resolveMultiFrameworkForControl(ctrl.control_code, ctrl.title);

                        return (
                          <tr
                            key={`${fw.id}-${ctrl.id}`}
                            className="hover:bg-slate-800/40 transition"
                          >
                            {idx === 0 ? (
                              <td
                                rowSpan={mapped.length}
                                className="py-3.5 px-4 font-mono text-xs font-bold text-blue-400 align-top border-r border-slate-800/50"
                              >
                                {fw.clause}
                              </td>
                            ) : null}

                            {idx === 0 ? (
                              <td
                                rowSpan={mapped.length}
                                className="py-3.5 px-4 text-xs font-medium text-white align-top border-r border-slate-800/50"
                              >
                                {fw.requirement}
                              </td>
                            ) : null}

                            <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-200">
                              <span className="text-blue-400 font-bold mr-2">
                                {ctrl.control_code}
                              </span>
                              {ctrl.title}
                            </td>

                            {/* Statutory Multi-Framework Crosswalk Mapping */}
                            <td className="py-3.5 px-4 text-xs">
                              <div className="flex flex-col gap-1 text-[10px]">
                                <span className="text-purple-300 font-mono truncate" title={`COBIT 2019: ${ctrlFw.cobit}`}>
                                  <strong className="text-purple-400">COBIT:</strong> {ctrlFw.cobit}
                                </span>
                                <span className="text-amber-300 font-mono truncate" title={`IT Act 2000: ${ctrlFw.itAct}`}>
                                  <strong className="text-amber-400">IT Act:</strong> {ctrlFw.itAct}
                                </span>
                                <span className="text-emerald-300 font-mono truncate" title={`DPDP Act 2023: ${ctrlFw.dpdp || ctrlFw.gdpr}`}>
                                  <strong className="text-emerald-400">DPDP:</strong> {ctrlFw.dpdp || ctrlFw.gdpr}
                                </span>
                                {ctrlFw.iso22301 && (
                                  <span className="text-rose-300 font-mono truncate" title={`ISO 22301:2019: ${ctrlFw.iso22301}`}>
                                    <strong className="text-rose-400">ISO 22301:</strong> {ctrlFw.iso22301}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {renderControlStatusBadge(ctrl.status)}
                            </td>

                            <td className="py-3.5 px-4 text-xs text-slate-400">
                              {ctrl.notes || "Satisfies standard certification criteria"}
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 4: Internal Policy-to-Control Alignment & Compliance Tracking */}
      {/* ========================================================================= */}
      {activeTab === "policy_mapping" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Policy Compliance Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Policies */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Internal Policies
                </span>
                <FiFileText className="text-blue-400 text-lg" />
              </div>
              <div className="text-2xl font-bold text-white mt-1.5">
                {policyComplianceMetrics.totalPolicies}
              </div>
              <div className="text-[11px] text-blue-400 mt-1 font-medium">
                Governance Documents
              </div>
            </div>

            {/* Mapped with Controls */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Controls Aligned
                </span>
                <FiCheckCircle className="text-emerald-400 text-lg" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1.5">
                {policyComplianceMetrics.coveredPoliciesCount}
              </div>
              <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">
                {policyComplianceMetrics.totalLinkedControlsCount} Linked Safeguards
              </div>
            </div>

            {/* Unmapped Policy Gaps */}
            <div
              className={`bg-slate-900/90 border rounded-2xl p-4 shadow-sm transition ${
                policyComplianceMetrics.unmappedPoliciesCount > 0
                  ? "border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20"
                  : "border-slate-800/90"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Unmapped Policy Gaps
                </span>
                <FiAlertTriangle className="text-amber-400 text-lg" />
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-1.5">
                {policyComplianceMetrics.unmappedPoliciesCount}
              </div>
              <div className="text-[11px] text-amber-300/80 mt-1 font-medium">
                {policyComplianceMetrics.unmappedPoliciesCount > 0 ? "Requires Technical Safeguards" : "All Policies Enforced"}
              </div>
            </div>

            {/* Overall Policy Enforcement Rate */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Enforcement Score
                </span>
                <FiActivity className="text-indigo-400 text-lg" />
              </div>
              <div className="text-2xl font-bold text-white mt-1.5 flex items-baseline gap-1">
                <span
                  className={
                    policyComplianceMetrics.overallEnforcementRate >= 80
                      ? "text-emerald-400"
                      : policyComplianceMetrics.overallEnforcementRate >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }
                >
                  {policyComplianceMetrics.overallEnforcementRate}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    policyComplianceMetrics.overallEnforcementRate >= 80
                      ? "bg-emerald-500"
                      : policyComplianceMetrics.overallEnforcementRate >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${policyComplianceMetrics.overallEnforcementRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiLink className="text-indigo-400" /> Internal Policy & Security Control Alignment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Directly map corporate governance policies to technical safeguards with system-driven compliance tracking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoMapPolicyControls}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <FiCpu />
                <span>Auto-Align Suggested Controls</span>
              </button>
            </div>
          </div>

          {/* Policies Table */}
          {policies.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <FiFileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Internal Policies Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Initialize corporate governance by adding policies in the Policy Management module or clicking "Seed Enterprise Starter Pack" in Profile.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 w-28">Policy ID</th>
                      <th className="py-3.5 px-4">Policy Title & Department</th>
                      <th className="py-3.5 px-4">Statutory Clauses</th>
                      <th className="py-3.5 px-4">Aligned Security Controls</th>
                      <th className="py-3.5 px-4 text-center">Compliance Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {policies.map((policy, idx) => {
                      const pId = String(policy.id);
                      const mappedControls = policyControlsMap[pId] || policyControlsMap[policy.id] || [];
                      const implementedCount = mappedControls.filter((c) => c.status === "implemented").length;
                      const policyRate = mappedControls.length > 0
                        ? Math.round((implementedCount / mappedControls.length) * 100)
                        : 0;

                      return (
                        <tr key={policy.id} className="hover:bg-slate-800/40 transition">
                          {/* Policy Code */}
                          <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              POL-{String(idx + 1).padStart(3, "0")}
                            </span>
                          </td>

                          {/* Policy Title & Dept */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-white text-xs sm:text-sm">
                              {policy.title || policy.policy_name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {policy.department || policy.department_name || "General"}
                            </div>
                          </td>

                          {/* Statutory Clauses */}
                          <td className="py-3.5 px-4 text-xs max-w-xs">
                            <span className="text-slate-300 line-clamp-2">
                              {policy.statutory_clauses || policy.framework_iso27001 || "ISO/IEC 27001 Baseline"}
                            </span>
                          </td>

                          {/* Aligned Controls */}
                          <td className="py-3.5 px-4">
                            {mappedControls.length === 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                <FiAlertTriangle className="text-xs" />
                                <span>No Safeguards Mapped (0% Gap)</span>
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 max-w-md">
                                {mappedControls.map((ctrl) => (
                                  <span
                                    key={ctrl.id}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition"
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        ctrl.status === "implemented" ? "bg-emerald-400" : "bg-amber-400"
                                      }`}
                                    />
                                    <span className="font-bold text-blue-300">{ctrl.control_code}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUnlinkControlFromPolicy(policy.id, ctrl.id, ctrl.control_code)}
                                      className="text-slate-500 hover:text-red-400 ml-0.5"
                                      title="Unlink Control"
                                    >
                                      <FiX className="text-xs" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Compliance Status & Percentage */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center">
                              <span
                                className={`text-xs font-mono font-bold ${
                                  mappedControls.length === 0
                                    ? "text-red-400"
                                    : policyRate === 100
                                    ? "text-emerald-400"
                                    : "text-amber-400"
                                }`}
                              >
                                {mappedControls.length === 0 ? "0%" : `${policyRate}%`}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {mappedControls.length === 0
                                  ? "Unmapped"
                                  : `${implementedCount}/${mappedControls.length} Implemented`}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenPolicyMapping(policy)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
                            >
                              <FiLink />
                              <span>Map Controls</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 5: Audit Trail & Immutable Activity Log */}
      {/* ========================================================================= */}
      {activeTab === "audit_trail" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Audit Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Audit Logs
                </span>
                <FiClock className="text-blue-400 text-lg" />
              </div>
              <div className="text-2xl font-bold text-white mt-1.5">{auditLogs.length}</div>
              <div className="text-[11px] text-blue-400 mt-1 font-medium">Recorded Events</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Auth & Sign-ins
                </span>
                <FiShield className="text-indigo-400 text-lg" />
              </div>
              <div className="text-2xl font-bold text-indigo-400 mt-1.5">
                {auditLogs.filter((l) => l.category === "Authentication").length}
              </div>
              <div className="text-[11px] text-indigo-300 mt-1 font-medium">OTP & Session Events</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Compliance Modifications
                </span>
                <FiDatabase className="text-emerald-400 text-lg" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1.5">
                {
                  auditLogs.filter(
                    (l) =>
                      l.category.includes("Policy") ||
                      l.category.includes("Control") ||
                      l.category.includes("Compliance") ||
                      l.category.includes("Risk")
                  ).length
                }
              </div>
              <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">Data Integrity Logs</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  High Severity Alerts
                </span>
                <FiAlertTriangle className="text-amber-400 text-lg" />
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-1.5">
                {auditLogs.filter((l) => l.severity === "warning" || l.severity === "critical").length}
              </div>
              <div className="text-[11px] text-amber-300/80 mt-1 font-medium">Anomalies & Deletions</div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1">
                <FiSearch className="absolute left-3.5 top-2.5 text-slate-500 text-xs" />
                <input
                  type="text"
                  placeholder="Search logs by action, actor, or details..."
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={auditCategoryFilter}
                onChange={(e) => setAuditCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl text-xs px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Authentication">Authentication</option>
                <option value="Risk Management">Risk Management</option>
                <option value="Policy Compliance">Policy Compliance</option>
                <option value="Security Controls">Security Controls</option>
                <option value="Compliance Mapping">Compliance Mapping</option>
                <option value="System Security">System Security</option>
                <option value="Internal Audit">Internal Audit</option>
              </select>

              {/* Severity Filter */}
              <select
                value={auditSeverityFilter}
                onChange={(e) => setAuditSeverityFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl text-xs px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Audit Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsManualAuditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                <FiPlus />
                <span>Log Milestone</span>
              </button>
              <button
                type="button"
                onClick={handleExportAuditJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                title="Export JSON"
              >
                <FiDownload />
                <span>JSON</span>
              </button>
              <button
                type="button"
                onClick={handleExportAuditCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                title="Export CSV"
              >
                <FiFileText />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={handleClearAuditLogs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
              >
                <FiTrash2 />
                <span>Clear Log</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          {filteredAuditLogs.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <FiClock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Audit Events Logged</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                All platform actions, user authentications, and data modifications will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 w-44">Timestamp</th>
                      <th className="py-3.5 px-4 w-32">Severity</th>
                      <th className="py-3.5 px-4">Action & Category</th>
                      <th className="py-3.5 px-4">Actor</th>
                      <th className="py-3.5 px-4">Details & Entity</th>
                      <th className="py-3.5 px-4 text-center">Verified Node</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>

                        {/* Severity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              log.severity === "critical"
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                : log.severity === "warning"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            }`}
                          >
                            {log.severity || "info"}
                          </span>
                        </td>

                        {/* Action & Category */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs font-bold text-white">
                            {log.action}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {log.category}
                          </div>
                        </td>

                        {/* Actor */}
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-200 whitespace-nowrap">
                          {log.actor || "System"}
                        </td>

                        {/* Details */}
                        <td className="py-3.5 px-4 text-xs text-slate-300 max-w-md">
                          <div className="leading-relaxed">{log.details}</div>
                        </td>

                        {/* Verified Node */}
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-500 whitespace-nowrap">
                          {log.ip_hash || "127.0.0.1"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: Persistent Right Slide-Over Audit Trail */}
      {/* ========================================================================= */}
      {isAuditDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAuditDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                    <FiClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Security Audit Trail</h2>
                    <p className="text-xs text-slate-400">{auditLogs.length} Events Logged</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuditDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* Drawer Search & Filters */}
              <div className="p-4 border-b border-slate-800 space-y-2 bg-slate-900/90">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-2.5 text-slate-500 text-xs" />
                  <input
                    type="text"
                    placeholder="Search event feed..."
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={auditCategoryFilter}
                    onChange={(e) => setAuditCategoryFilter(e.target.value)}
                    className="w-1/2 bg-slate-800 border border-slate-700 text-white rounded-xl text-[11px] px-2 py-1"
                  >
                    <option value="all">All Categories</option>
                    <option value="Authentication">Auth</option>
                    <option value="Risk Management">Risks</option>
                    <option value="Policy Compliance">Policies</option>
                    <option value="Security Controls">Controls</option>
                    <option value="System Security">Security</option>
                  </select>
                  <select
                    value={auditSeverityFilter}
                    onChange={(e) => setAuditSeverityFilter(e.target.value)}
                    className="w-1/2 bg-slate-800 border border-slate-700 text-white rounded-xl text-[11px] px-2 py-1"
                  >
                    <option value="all">All Severities</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Drawer Event Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredAuditLogs.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No matching audit logs found.
                  </div>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            log.severity === "critical"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : log.severity === "warning"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          }`}
                        >
                          {log.severity || "info"}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-white">{log.action}</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{log.details}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>Actor: {log.actor}</span>
                        <span>{log.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleExportAuditCsv}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuditDrawerOpen(false);
                    setActiveTab("audit_trail");
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  Open Full View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Policy-to-Control Linkage Selector */}
      {/* ========================================================================= */}
      {isPolicyMappingModalOpen && activePolicyForMapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded font-mono text-xs font-bold">
                  Policy Alignment
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Map Security Controls to Policy
                </h2>
                <p className="text-xs text-slate-400 max-w-lg mt-0.5 font-medium">
                  "{activePolicyForMapping.title || activePolicyForMapping.policy_name}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPolicyMappingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Search Controls */}
            <div className="py-3">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-2.5 text-slate-500 text-xs" />
                <input
                  type="text"
                  placeholder="Filter controls by code, title, or category..."
                  value={policyMappingSearchTerm}
                  onChange={(e) => setPolicyMappingSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Controls Checkbox List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
              {controls
                .filter((c) => {
                  if (!policyMappingSearchTerm.trim()) return true;
                  const term = policyMappingSearchTerm.toLowerCase();
                  return (
                    (c.control_code || "").toLowerCase().includes(term) ||
                    (c.title || "").toLowerCase().includes(term) ||
                    (c.category || "").toLowerCase().includes(term)
                  );
                })
                .map((ctrl) => {
                  const isChecked = selectedPolicyControlIds.includes(ctrl.id);
                  return (
                    <label
                      key={ctrl.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? "bg-blue-600/10 border-blue-500/40 text-white"
                          : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPolicyControlIds([...selectedPolicyControlIds, ctrl.id]);
                          } else {
                            setSelectedPolicyControlIds(
                              selectedPolicyControlIds.filter((id) => id !== ctrl.id)
                            );
                          }
                        }}
                        className="mt-1 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400">
                            {ctrl.control_code}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {ctrl.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                              ctrl.status === "implemented"
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {ctrl.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {ctrl.description || "Active security safeguard control."}
                        </p>
                      </div>
                    </label>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-2">
              <span className="text-xs text-slate-400">
                {selectedPolicyControlIds.length} control(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPolicyMappingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingPolicyMappings}
                  onClick={handleSavePolicyMappings}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingPolicyMappings ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Alignments"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Record Manual Audit Milestone Event */}
      {/* ========================================================================= */}
      {isManualAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FiClock className="text-blue-400" /> Record Compliance Audit Milestone
              </h2>
              <button
                type="button"
                onClick={() => setIsManualAuditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveManualAuditLog} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Event Action / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AUDIT_WALKTHROUGH_COMPLETED"
                  value={manualAuditForm.action}
                  onChange={(e) => setManualAuditForm({ ...manualAuditForm, action: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={manualAuditForm.category}
                    onChange={(e) => setManualAuditForm({ ...manualAuditForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Internal Audit">Internal Audit</option>
                    <option value="Statutory Frameworks">Statutory Frameworks</option>
                    <option value="Security Controls">Security Controls</option>
                    <option value="Policy Compliance">Policy Compliance</option>
                    <option value="System Security">System Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Severity
                  </label>
                  <select
                    value={manualAuditForm.severity}
                    onChange={(e) => setManualAuditForm({ ...manualAuditForm, severity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Audit Findings & Verification Details
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Document formal audit observations, sampling scope, and stakeholder sign-off..."
                  value={manualAuditForm.details}
                  onChange={(e) => setManualAuditForm({ ...manualAuditForm, details: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualAuditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  Log to Audit Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Map Controls to Requirement */}
      {/* ========================================================================= */}
      {isMappingModalOpen && activeRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded font-mono text-xs font-bold">
                  {activeRequirement.clause}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Map Safeguard Controls
                </h2>
                <p className="text-xs text-slate-400 max-w-lg mt-0.5">
                  {activeRequirement.requirement}
                </p>
              </div>
              <button
                onClick={() => setIsMappingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="py-3">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-2.5 text-slate-500 text-xs" />
                <input
                  type="text"
                  placeholder="Filter controls by code or title..."
                  value={mappingSearchTerm}
                  onChange={(e) => setMappingSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Controls Checklist */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
              {controls
                .filter(
                  (c) =>
                    c.title.toLowerCase().includes(mappingSearchTerm.toLowerCase()) ||
                    c.control_code
                      .toLowerCase()
                      .includes(mappingSearchTerm.toLowerCase())
                )
                .map((ctrl) => {
                  const isChecked = selectedControlIds.some(
                    (id) => String(id).trim() === String(ctrl.id).trim()
                  );

                  return (
                    <label
                      key={ctrl.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                        isChecked
                          ? "bg-blue-600/15 border-blue-500/40 text-white"
                          : "bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedControlIds([...selectedControlIds, ctrl.id]);
                          } else {
                            setSelectedControlIds(
                              selectedControlIds.filter(
                                (id) => String(id).trim() !== String(ctrl.id).trim()
                              )
                            );
                          }
                        }}
                        className="mt-1 w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400">
                            {ctrl.control_code}
                          </span>
                          <span className="font-semibold text-xs text-white truncate">
                            {ctrl.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {ctrl.description || "No description provided."}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {renderControlStatusBadge(ctrl.status)}
                      </div>
                    </label>
                  );
                })}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedControlIds.length}{" "}
                {selectedControlIds.length === 1 ? "control" : "controls"} selected
              </span>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  disabled={isSavingMappings}
                  onClick={() => setIsMappingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingMappings}
                  onClick={handleMapControls}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingMappings ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Mappings...</span>
                    </>
                  ) : (
                    "Save Mappings"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Add New Security Control */}
      {/* ========================================================================= */}
      {isAddControlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                Add Security Control
              </h2>
              <button
                onClick={() => setIsAddControlModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveControl} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Control Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CTRL-IR-01"
                  value={newControl.control_code}
                  onChange={(e) =>
                    setNewControl({ ...newControl, control_code: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Control Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incident Response & Simulation Drills"
                  value={newControl.title}
                  onChange={(e) =>
                    setNewControl({ ...newControl, title: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Control Category
                </label>
                <select
                  value={newControl.category || "Technical"}
                  onChange={(e) =>
                    setNewControl({ ...newControl, category: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technical">Technical</option>
                  <option value="Organizational">Organizational</option>
                  <option value="Operational">Operational</option>
                  <option value="Physical">Physical</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Technical Safeguard Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe technical implementation, verification cadence, and tools..."
                  value={newControl.description}
                  onChange={(e) =>
                    setNewControl({ ...newControl, description: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Implementation Status
                </label>
                <select
                  value={newControl.status}
                  onChange={(e) =>
                    setNewControl({ ...newControl, status: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="implemented">Implemented</option>
                  <option value="partially_implemented">Partially Implemented</option>
                  <option value="planned">Planned</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>

              {/* Live Multi-Framework Statutory Mapping Preview */}
              {(() => {
                const previewFw = resolveMultiFrameworkForControl(
                  newControl.control_code,
                  newControl.title
                );
                return (
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FiLayers className="text-blue-400" /> Multi-Framework Statutory Crosswalk
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Auto-Resolved</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-900/90 border border-blue-500/20 p-2 rounded-lg">
                        <span className="font-bold text-blue-400 block">ISO 27001:</span>
                        <span className="text-slate-300 font-mono truncate block" title={previewFw.iso27001}>
                          {previewFw.iso27001}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 border border-purple-500/20 p-2 rounded-lg">
                        <span className="font-bold text-purple-400 block">COBIT 2019:</span>
                        <span className="text-purple-300 font-mono truncate block" title={previewFw.cobit}>
                          {previewFw.cobit}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 border border-amber-500/20 p-2 rounded-lg">
                        <span className="font-bold text-amber-400 block">IT Act 2000:</span>
                        <span className="text-amber-300 font-mono truncate block" title={previewFw.itAct}>
                          {previewFw.itAct}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 border border-emerald-500/20 p-2 rounded-lg">
                        <span className="font-bold text-emerald-400 block">DPDP Act 2023:</span>
                        <span className="text-emerald-300 font-mono truncate block" title={previewFw.dpdp || previewFw.gdpr}>
                          {previewFw.dpdp || previewFw.gdpr}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 border border-rose-500/20 p-2 rounded-lg">
                        <span className="font-bold text-rose-400 block">ISO 22301:</span>
                        <span className="text-rose-300 font-mono truncate block" title={previewFw.iso22301}>
                          {previewFw.iso22301 || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSavingControl}
                  onClick={() => setIsAddControlModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingControl}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingControl ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Control...</span>
                    </>
                  ) : (
                    "Save Control"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Add New Framework Requirement */}
      {/* ========================================================================= */}
      {isAddReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                Add Compliance Framework Requirement
              </h2>
              <button
                onClick={() => setIsAddReqModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveRequirement} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Framework Name
                </label>
                <input
                  type="text"
                  required
                  value={newRequirement.name}
                  onChange={(e) =>
                    setNewRequirement({ ...newRequirement, name: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Clause / Annex Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clause 9.2 or Control A.8.1"
                  value={newRequirement.clause}
                  onChange={(e) =>
                    setNewRequirement({ ...newRequirement, clause: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Requirement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Internal audit program & schedule"
                  value={newRequirement.requirement}
                  onChange={(e) =>
                    setNewRequirement({
                      ...newRequirement,
                      requirement: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Requirement Details / Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Details of audit criteria, scope, frequency..."
                  value={newRequirement.description}
                  onChange={(e) =>
                    setNewRequirement({
                      ...newRequirement,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSavingRequirement}
                  onClick={() => setIsAddReqModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRequirement}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingRequirement ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Requirement...</span>
                    </>
                  ) : (
                    "Save Requirement"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compliance;
