// =============================================================================
// HUMAN-CENTRIC GRC MANAGEMENT PLATFORM
// LocalStorage-Driven Enterprise State & Persistence Engine
// File: src/utils/localStorageDb.js
// Standards: ISO/IEC 27001:2022 | COBIT 2019 | IT Act 2000 | EU GDPR
// =============================================================================

import { useState, useEffect } from "react";

// Storage Key Prefix
const STORAGE_PREFIX = "grc_";

// =============================================================================
// CANONICAL ENTERPRISE DEFAULT SEED DATA
// =============================================================================

export const DEFAULT_DEPARTMENTS = [
  {
    id: 1,
    name: "Information Security & Compliance",
    department_name: "Information Security & Compliance",
    head_name: "Alex Turner / CISO",
    department_head: "Alex Turner / CISO",
    created_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 2,
    name: "Legal, Risk & Governance",
    department_name: "Legal, Risk & Governance",
    head_name: "Elena Vance (Legal Counsel & DPO)",
    department_head: "Elena Vance (Legal Counsel & DPO)",
    created_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 3,
    name: "Human Resources & Training",
    department_name: "Human Resources & Training",
    head_name: "Sarah Jenkins (HR Director)",
    department_head: "Sarah Jenkins (HR Director)",
    created_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 4,
    name: "IT Infrastructure & Operations",
    department_name: "IT Infrastructure & Operations",
    head_name: "Marcus Brody (CTO)",
    department_head: "Marcus Brody (CTO)",
    created_at: "2026-01-10T08:00:00Z",
  },
];

export const DEFAULT_EMPLOYEES = [
  {
    id: 1,
    full_name: "Alex Turner",
    email: "a.turner@enterprise.com",
    department: "Information Security & Compliance",
    designation: "Chief Information Security Officer (CISO)",
    role: "admin",
    created_at: "2026-01-12T09:00:00Z",
  },
  {
    id: 2,
    full_name: "Elena Vance",
    email: "e.vance@enterprise.com",
    department: "Legal, Risk & Governance",
    designation: "Senior Legal Counsel & DPO",
    role: "compliance_officer",
    created_at: "2026-01-12T09:15:00Z",
  },
  {
    id: 3,
    full_name: "Marcus Brody",
    email: "m.brody@enterprise.com",
    department: "IT Infrastructure & Operations",
    designation: "Lead Cloud Architect & DevOps",
    role: "employee",
    created_at: "2026-01-12T09:30:00Z",
  },
  {
    id: 4,
    full_name: "Sarah Jenkins",
    email: "s.jenkins@enterprise.com",
    department: "Human Resources & Training",
    designation: "HR & Security Culture Director",
    role: "employee",
    created_at: "2026-01-12T09:45:00Z",
  },
  {
    id: 5,
    full_name: "David Chen",
    email: "d.chen@enterprise.com",
    department: "Information Security & Compliance",
    designation: "Senior SOC & Threat Analyst",
    role: "compliance_officer",
    created_at: "2026-01-12T10:00:00Z",
  },
];

export const DEFAULT_POLICIES = [
  {
    id: 1,
    title: "Information Security & Acceptable Use Policy",
    policy_name: "Information Security & Acceptable Use Policy",
    version: "1.0",
    department: "Information Security & Compliance",
    department_name: "Information Security & Compliance",
    status: "active",
    template_name: "Information Security Policy",
    raci_responsible: "IT Security Team",
    raci_accountable: "Alex Turner / CISO",
    raci_consulted: "Legal, Risk & Governance Department",
    raci_informed: "All Employees & Contractors",
    statutory_clauses: "ISO/IEC 27001:2022 Control A.5.1",
    framework_iso27001: "ISO/IEC 27001:2022 Control A.5.1",
    framework_cobit: "COBIT 2019 APO13",
    framework_it_act: "IT Act 2000 Section 43A / Rule 4",
    framework_gdpr: "EU GDPR Article 24",
    description: "Establishes mandatory enterprise requirements for safeguarding digital assets, multi-factor authentication, cryptographic key management, and zero trust identity hygiene.",
    summary: "Establishes mandatory enterprise requirements for safeguarding digital assets, multi-factor authentication, cryptographic key management, and zero trust identity hygiene.",
    review_date: "2026-12-31",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Access Control & Identity Governance Policy",
    policy_name: "Access Control & Identity Governance Policy",
    version: "1.1",
    department: "IT Infrastructure & Operations",
    department_name: "IT Infrastructure & Operations",
    status: "active",
    template_name: "Access Control Policy",
    raci_responsible: "Identity & Access Team",
    raci_accountable: "Marcus Brody (CTO)",
    raci_consulted: "Alex Turner / CISO",
    raci_informed: "Engineering & IT Staff",
    statutory_clauses: "ISO/IEC 27001:2022 Control A.5.15",
    framework_iso27001: "ISO/IEC 27001:2022 Control A.5.15",
    framework_cobit: "COBIT 2019 DSS05",
    framework_it_act: "IT Act 2000 Section 43A",
    framework_gdpr: "EU GDPR Article 32",
    description: "Defines identity lifecycle management, least privilege access, mandatory 90-day entitlement reviews, and hardware token multi-factor enforcement for privileged roles.",
    summary: "Defines identity lifecycle management, least privilege access, mandatory 90-day entitlement reviews, and hardware token multi-factor enforcement for privileged roles.",
    review_date: "2026-11-30",
    created_at: "2026-01-15T11:00:00Z",
  },
  {
    id: 3,
    title: "Data Privacy & Sensitive Data Handling Policy",
    policy_name: "Data Privacy & Sensitive Data Handling Policy",
    version: "2.0",
    department: "Legal, Risk & Governance",
    department_name: "Legal, Risk & Governance",
    status: "active",
    template_name: "Data Privacy Policy",
    raci_responsible: "Data Protection Team",
    raci_accountable: "Elena Vance (Legal Counsel & DPO)",
    raci_consulted: "Security Compliance Lead",
    raci_informed: "All Personnel Processing PII",
    statutory_clauses: "EU GDPR Article 32 & IT Act 2000 (SPDI Rules)",
    framework_iso27001: "ISO/IEC 27001:2022 Control A.8.11",
    framework_cobit: "COBIT 2019 APO14",
    framework_it_act: "IT Act 2000 Section 43A / SPDI Rule 8",
    framework_gdpr: "EU GDPR Articles 32, 33, 34",
    description: "Mandates synthetic obfuscation for test replicas, end-to-end encryption for sensitive personal data in transit and at rest, and regulatory disclosure workflows.",
    summary: "Mandates synthetic obfuscation for test replicas, end-to-end encryption for sensitive personal data in transit and at rest, and regulatory disclosure workflows.",
    review_date: "2026-10-31",
    created_at: "2026-01-15T12:00:00Z",
  },
  {
    id: 4,
    title: "Incident Management & 72-Hour Breach Escalation Policy",
    policy_name: "Incident Management & 72-Hour Breach Escalation Policy",
    version: "1.2",
    department: "Information Security & Compliance",
    department_name: "Information Security & Compliance",
    status: "active",
    template_name: "Incident Response Policy",
    raci_responsible: "CSIRT & Incident Response Lead",
    raci_accountable: "Alex Turner / CISO",
    raci_consulted: "Legal & Public Relations",
    raci_informed: "Executive Leadership & Regulators",
    statutory_clauses: "ISO/IEC 27001:2022 Control A.5.24 & GDPR Art 33",
    framework_iso27001: "ISO/IEC 27001:2022 Control A.5.24",
    framework_cobit: "COBIT 2019 DSS02",
    framework_it_act: "IT Act 2000 Section 70B (CERT-In)",
    framework_gdpr: "EU GDPR Article 33",
    description: "Establishes severity classifications, containment protocols, 6-hour CERT-In mandatory notifications, and 72-hour GDPR supervisory authority breach disclosure procedures.",
    summary: "Establishes severity classifications, containment protocols, 6-hour CERT-In mandatory notifications, and 72-hour GDPR supervisory authority breach disclosure procedures.",
    review_date: "2026-09-30",
    created_at: "2026-01-15T13:00:00Z",
  },
];

export const DEFAULT_RISKS = [
  {
    id: 1,
    title: "Privileged Access Management & Stale Credentials Exposure",
    risk_title: "Privileged Access Management & Stale Credentials Exposure",
    category: "Identity & Access",
    likelihood: 4,
    impact: 4,
    score: 16,
    risk_score: 16,
    risk_level: "High",
    owner: "DevOps & Cloud Security Team",
    risk_owner: "DevOps & Cloud Security Team",
    treatment_strategy: "Mitigate",
    mitigation_strategy: "Mitigate",
    treatment_plan: "Implement automated quarterly credential rotation and mandatory session timeouts in Azure AD.",
    remediation_action: "Implement automated quarterly credential rotation and mandatory session timeouts in Azure AD.",
    status: "Open",
    lifecycle_status: "Open",
    created_at: "2026-01-18T10:00:00Z",
  },
  {
    id: 2,
    title: "Third-Party SaaS Vendor Regulatory Compliance Gaps",
    risk_title: "Third-Party SaaS Vendor Regulatory Compliance Gaps",
    category: "Supply Chain",
    likelihood: 3,
    impact: 5,
    score: 15,
    risk_score: 15,
    risk_level: "High",
    owner: "Legal, Risk & Governance",
    risk_owner: "Legal, Risk & Governance",
    treatment_strategy: "Mitigate",
    mitigation_strategy: "Mitigate",
    treatment_plan: "Audit vendor SOC 2 Type II and ISO 27001 certifications before contract execution.",
    remediation_action: "Audit vendor SOC 2 Type II and ISO 27001 certifications before contract execution.",
    status: "Open",
    lifecycle_status: "Open",
    created_at: "2026-01-18T11:00:00Z",
  },
  {
    id: 3,
    title: "Unencrypted Local Backups on Remote Workstations",
    risk_title: "Unencrypted Local Backups on Remote Workstations",
    category: "Endpoint Security",
    likelihood: 3,
    impact: 3,
    score: 9,
    risk_score: 9,
    risk_level: "Medium",
    owner: "IT Infrastructure & Operations",
    risk_owner: "IT Infrastructure & Operations",
    treatment_strategy: "Mitigate",
    mitigation_strategy: "Mitigate",
    treatment_plan: "Enforce centralized BitLocker/FileVault recovery key escrow via Microsoft Intune MDM.",
    remediation_action: "Enforce centralized BitLocker/FileVault recovery key escrow via Microsoft Intune MDM.",
    status: "Mitigated",
    lifecycle_status: "Mitigated",
    created_at: "2026-01-18T12:00:00Z",
  },
  {
    id: 4,
    title: "Targeted Spear-Phishing & Social Engineering Compromise",
    risk_title: "Targeted Spear-Phishing & Social Engineering Compromise",
    category: "Human Factor",
    likelihood: 4,
    impact: 3,
    score: 12,
    risk_score: 12,
    risk_level: "Medium",
    owner: "Human Resources & Training",
    risk_owner: "Human Resources & Training",
    treatment_strategy: "Mitigate",
    mitigation_strategy: "Mitigate",
    treatment_plan: "Conduct monthly simulated phishing drills and mandatory remedial training.",
    remediation_action: "Conduct monthly simulated phishing drills and mandatory remedial training.",
    status: "Open",
    lifecycle_status: "Open",
    created_at: "2026-01-18T13:00:00Z",
  },
  {
    id: 5,
    title: "Legacy VPN Gateway Session Timeout Thresholds",
    risk_title: "Legacy VPN Gateway Session Timeout Thresholds",
    category: "Network Security",
    likelihood: 2,
    impact: 3,
    score: 6,
    risk_score: 6,
    risk_level: "Low",
    owner: "IT Infrastructure & Operations",
    risk_owner: "IT Infrastructure & Operations",
    treatment_strategy: "Mitigate",
    mitigation_strategy: "Mitigate",
    treatment_plan: "Upgraded VPN gateway to enforce 12-hour session re-authentication with push MFA.",
    remediation_action: "Upgraded VPN gateway to enforce 12-hour session re-authentication with push MFA.",
    status: "Closed",
    lifecycle_status: "Closed",
    created_at: "2026-01-18T14:00:00Z",
  },
];

export const DEFAULT_TRAININGS = [
  {
    id: 1,
    title: "ISO/IEC 27001:2022 Information Security Foundations",
    training_name: "ISO/IEC 27001:2022 Information Security Foundations",
    trainer: "Alex Turner / CISO",
    department: "All Departments",
    duration: "45 mins",
    status: "Completed",
    completion_rate: 100,
    training_date: "2026-03-15",
    due_date: "2026-03-15",
    description: "Core concepts of ISMS, information classification, and security control compliance.",
    created_at: "2026-02-01T08:00:00Z",
  },
  {
    id: 2,
    title: "Advanced Phishing & Social Engineering Defense",
    training_name: "Advanced Phishing & Social Engineering Defense",
    trainer: "Threat Intelligence Team",
    department: "All Departments",
    duration: "30 mins",
    status: "Ongoing",
    completion_rate: 78,
    training_date: "2026-04-10",
    due_date: "2026-04-10",
    description: "Interactive simulation for recognizing weaponized links, credential harvesting, and spear-phishing.",
    created_at: "2026-02-01T09:00:00Z",
  },
  {
    id: 3,
    title: "Data Privacy & GDPR Statutory Obligations",
    training_name: "Data Privacy & GDPR Statutory Obligations",
    trainer: "Elena Vance (DPO)",
    department: "Legal & Customer Ops",
    duration: "60 mins",
    status: "Scheduled",
    completion_rate: 0,
    training_date: "2026-05-01",
    due_date: "2026-05-01",
    description: "Understanding data subject rights, consent mechanisms, and 72-hour regulatory notification workflows.",
    created_at: "2026-02-01T10:00:00Z",
  },
];

export const DEFAULT_ASSESSMENTS = [
  {
    id: 1,
    title: "ISO/IEC 27001:2022 Information Security Foundations",
    assessment_name: "ISO/IEC 27001:2022 Information Security Foundations",
    training_name: "ISO/IEC 27001:2022 Information Security Foundations",
    employee_name: "Marcus Brody",
    score: 100,
    assessment_score: 100,
    result: "Pass",
    status: "Pass",
    assessment_date: "2026-03-20",
    due_date: "2026-03-20",
    remarks: "[Criteria: ISO 27001 Core Assessment] Demonstrated 100% mastery in access control & risk triage.",
    assessment_criteria: "ISO 27001 Core Clauses",
    completed_at: "2026-03-20T14:30:00Z",
    created_at: "2026-03-20T14:30:00Z",
  },
  {
    id: 2,
    title: "Advanced Phishing & Social Engineering Defense",
    assessment_name: "Advanced Phishing & Social Engineering Defense",
    training_name: "Advanced Phishing & Social Engineering Defense",
    employee_name: "Sarah Jenkins",
    score: 66.7,
    assessment_score: 66.7,
    result: "Pass",
    status: "Pass",
    assessment_date: "2026-04-12",
    due_date: "2026-04-12",
    remarks: "[Criteria: Phishing Defense Benchmark] Identified payload URLs correctly. Passed threshold.",
    assessment_criteria: "Phishing Simulation Benchmark",
    completed_at: "2026-04-12T11:15:00Z",
    created_at: "2026-04-12T11:15:00Z",
  },
  {
    id: 3,
    title: "ISO/IEC 27001:2022 Information Security Foundations",
    assessment_name: "ISO/IEC 27001:2022 Information Security Foundations",
    training_name: "ISO/IEC 27001:2022 Information Security Foundations",
    employee_name: "David Chen",
    score: 100,
    assessment_score: 100,
    result: "Pass",
    status: "Pass",
    assessment_date: "2026-03-22",
    due_date: "2026-03-22",
    remarks: "[Criteria: ISO 27001 Core Assessment] Complete mastery of Annex A safeguards.",
    assessment_criteria: "ISO 27001 Core Clauses",
    completed_at: "2026-03-22T16:00:00Z",
    created_at: "2026-03-22T16:00:00Z",
  },
];

export const DEFAULT_COMPLIANCE_FRAMEWORKS = [
  { id: "fw-4-1", name: "ISO/IEC 27001:2022", clause: "Clause 4.1", requirement: "Understanding the organization and its context", description: "Identify external and internal factors relevant to ISMS purpose and performance." },
  { id: "fw-4-2", name: "ISO/IEC 27001:2022", clause: "Clause 4.2", requirement: "Understanding the needs and expectations of interested parties", description: "Determine interested parties and legal, regulatory, or contractual requirements." },
  { id: "fw-5-1", name: "ISO/IEC 27001:2022", clause: "Clause 5.1", requirement: "Leadership and commitment", description: "Top management must demonstrate leadership with respect to the ISMS." },
  { id: "fw-6-1", name: "ISO/IEC 27001:2022", clause: "Clause 6.1", requirement: "Actions to address risks and opportunities", description: "Define and apply an objective information security risk assessment process." },
  { id: "fw-7-2", name: "ISO/IEC 27001:2022", clause: "Clause 7.2", requirement: "Competence and security training", description: "Ensure persons doing work have necessary competence and training." },
  { id: "fw-8-1", name: "ISO/IEC 27001:2022", clause: "Clause 8.1", requirement: "Operational planning and control", description: "Plan, implement, and control processes needed to meet requirements." },
  { id: "fw-9-1", name: "ISO/IEC 27001:2022", clause: "Clause 9.1", requirement: "Monitoring, measurement, analysis and evaluation", description: "Evaluate information security performance and ISMS effectiveness." },
  { id: "fw-9-2", name: "ISO/IEC 27001:2022", clause: "Clause 9.2", requirement: "Internal audit", description: "Conduct internal audits at planned intervals to verify ISMS conformance." },
  { id: "fw-10-1", name: "ISO/IEC 27001:2022", clause: "Clause 10.1", requirement: "Continual improvement and non-conformity remediation", description: "React to non-conformities, take corrective actions, and continually improve the ISMS." },
];

export const DEFAULT_SECURITY_CONTROLS = [
  { id: "ctrl-1", control_code: "CTRL-001", code: "CTRL-001", title: "Control A.5.1 - Policies for information security", control_name: "Control A.5.1 - Policies for information security", category: "Organizational", status: "implemented", description: "Information security policies defined, approved by management, and published." },
  { id: "ctrl-2", control_code: "CTRL-002", code: "CTRL-002", title: "Control A.5.15 - Access control", control_name: "Control A.5.15 - Access control", category: "Technical", status: "implemented", description: "Rules for physical and logical access control established based on business requirements." },
  { id: "ctrl-3", control_code: "CTRL-003", code: "CTRL-003", title: "Control A.5.19 - Information security in supplier relationships", control_name: "Control A.5.19 - Information security in supplier relationships", category: "Organizational", status: "partially_implemented", description: "Processes for managing information security risks associated with suppliers." },
  { id: "ctrl-4", control_code: "CTRL-004", code: "CTRL-004", title: "Control A.6.8 - Information security event reporting", control_name: "Control A.6.8 - Information security event reporting", category: "Operational", status: "implemented", description: "Mechanism for reporting information security events through appropriate channels." },
  { id: "ctrl-5", control_code: "CTRL-005", code: "CTRL-005", title: "Control A.7.1 - Physical security perimeter", control_name: "Control A.7.1 - Physical security perimeter", category: "Physical", status: "implemented", description: "Security perimeters defined to protect areas that contain sensitive information." },
  { id: "ctrl-6", control_code: "CTRL-006", code: "CTRL-006", title: "Control A.8.1 - User endpoint devices", control_name: "Control A.8.1 - User endpoint devices", category: "Technical", status: "implemented", description: "Endpoint security configurations, disk encryption, and patching enforced." },
  { id: "ctrl-7", control_code: "CTRL-007", code: "CTRL-007", title: "Control A.8.2 - Privileged access rights", control_name: "Control A.8.2 - Privileged access rights", category: "Technical", status: "implemented", description: "Allocation and use of privileged access rights restricted and controlled." },
  { id: "ctrl-8", control_code: "CTRL-008", code: "CTRL-008", title: "Control A.8.7 - Protection against malware", control_name: "Control A.8.7 - Protection against malware", category: "Technical", status: "implemented", description: "EDR and anti-malware protections deployed across servers and endpoints." },
  { id: "ctrl-9", control_code: "CTRL-009", code: "CTRL-009", title: "Control A.8.20 - Network security", control_name: "Control A.8.20 - Network security", category: "Technical", status: "implemented", description: "Networks secured, managed, and controlled to protect information." },
  { id: "ctrl-10", control_code: "CTRL-010", code: "CTRL-010", title: "Control A.8.24 - Use of cryptography", control_name: "Control A.8.24 - Use of cryptography", category: "Technical", status: "implemented", description: "Rules for effective use of cryptography defined and implemented." },
  { id: "ctrl-11", control_code: "CTRL-011", code: "CTRL-011", title: "Control A.8.28 - Secure coding", control_name: "Control A.8.28 - Secure coding", category: "Technical", status: "implemented", description: "Secure coding principles applied to software development." },
];

export const DEFAULT_CONTROL_MAPPINGS = [
  { id: "map-1", framework_id: "fw-5-1", requirement_id: "fw-5-1", control_id: "ctrl-1", notes: "Mapped via ISO 27001 Baseline" },
  { id: "map-2", framework_id: "fw-6-1", requirement_id: "fw-6-1", control_id: "ctrl-2", notes: "Mapped via ISO 27001 Baseline" },
  { id: "map-3", framework_id: "fw-7-2", requirement_id: "fw-7-2", control_id: "ctrl-4", notes: "Mapped via ISO 27001 Baseline" },
  { id: "map-4", framework_id: "fw-8-1", requirement_id: "fw-8-1", control_id: "ctrl-6", notes: "Mapped via ISO 27001 Baseline" },
  { id: "map-5", framework_id: "fw-8-1", requirement_id: "fw-8-1", control_id: "ctrl-7", notes: "Mapped via ISO 27001 Baseline" },
  { id: "map-6", framework_id: "fw-9-1", requirement_id: "fw-9-1", control_id: "ctrl-9", notes: "Mapped via ISO 27001 Baseline" },
  { id: "map-7", framework_id: "fw-10-1", requirement_id: "fw-10-1", control_id: "ctrl-10", notes: "Mapped via ISO 27001 Baseline" },
];

export const DEFAULT_INTERNAL_AUDITS = [
  {
    id: 1,
    audit_code: "AUDIT-001",
    title: "Comprehensive Annual ISMS & Access Control Statutory Audit",
    scope: "Evaluation of identity lifecycle, zero trust access control, multi-factor enforcement, and cryptography standards across all cloud infrastructure and enterprise identity providers.",
    standard_framework: "ISO/IEC 27001:2022 & COBIT 2019",
    lead_auditor: "Alex Turner / CISO",
    status: "Completed",
    start_date: "2026-03-01",
    end_date: "2026-03-25",
    summary: "Overall organizational compliance posture is strong. 2 non-conformities identified regarding dormant privileged credentials and legacy VPN authentication timeouts.",
  },
  {
    id: 2,
    audit_code: "AUDIT-002",
    title: "Data Protection & Privacy Architecture Review",
    scope: "Audit of Personally Identifiable Information (PII) processing, sensitive data encryption at rest and in transit, vendor data sharing agreements, and GDPR / IT Act statutory readiness.",
    standard_framework: "EU GDPR & IT Act 2000 (Section 43A/SPDI)",
    lead_auditor: "Elena Vance (Legal Counsel & DPO)",
    status: "In Progress",
    start_date: "2026-04-01",
    end_date: "2026-04-20",
    summary: "Active review of data retention lifecycles and consent mechanisms for workforce and customer data pipelines.",
  },
  {
    id: 3,
    audit_code: "AUDIT-003",
    title: "IT Operations & Incident Management Conformance Audit",
    scope: "Inspection of Computer Security Incident Response Team (CSIRT) runbooks, 72-hour breach notification procedures, network segmentation, and endpoint protection hygiene.",
    standard_framework: "COBIT 2019 & ISO 27001:2022",
    lead_auditor: "Marcus Brody (CTO)",
    status: "Scheduled",
    start_date: "2026-05-05",
    end_date: "2026-05-25",
    summary: "Scheduled audit focusing on operational disaster recovery readiness and SOC 2 / ISO incident escalation pathways.",
  },
];

export const DEFAULT_AUDIT_FINDINGS = [
  {
    id: 1,
    finding_code: "FINDING-001",
    audit_code: "AUDIT-001",
    title: "Stale Privileged Administrative Credentials Lacking Quarterly Attestation",
    severity: "Major Non-Conformity",
    framework_clause: "Control A.5.15 (Access Control) / COBIT DSS05.04",
    framework_name: "ISO/IEC 27001:2022 & COBIT 2019",
    description: "During identity directory inspection, 4 administrative service accounts had not undergone user access review within the mandatory 90-day cycle, violating the Principle of Least Privilege.",
    evidence: "Active Directory log exports showed last entitlement review date exceeded 120 days for accounts: svc_devops_ci, admin_temp_ops.",
    remediation_plan: "Enforce automated quarterly entitlement review triggers in Okta/Azure AD; revoke unreviewed service accounts automatically after 14 days grace period.",
    owner: "DevOps & System Administrators",
    status: "In Remediation",
    due_date: "2026-05-15",
    verified_by: "Alex Turner / CISO",
  },
  {
    id: 2,
    finding_code: "FINDING-002",
    audit_code: "AUDIT-002",
    title: "Absence of Documented 72-Hour Regulatory Breach Notification Simulation",
    severity: "Minor Non-Conformity",
    framework_clause: "GDPR Article 33 & IT Act Section 70B (CERT-In)",
    framework_name: "EU GDPR & IT Act 2000",
    description: "Organization maintains an Incident Response Policy but has not conducted a live simulated breach exercise within the last 12 months to test cross-departmental 72-hour notice readiness.",
    evidence: "Tabletop exercise records show disaster recovery drills were executed, but no dedicated PII compromise regulatory notification walkthrough was logged.",
    remediation_plan: "Schedule and conduct an executive tabletop simulation testing Data Protection Officer (DPO) and Legal breach notification workflows by Q3.",
    owner: "Legal, Risk & Governance",
    status: "Open",
    due_date: "2026-06-01",
    verified_by: "Elena Vance (Legal Counsel & DPO)",
  },
  {
    id: 3,
    finding_code: "FINDING-003",
    audit_code: "AUDIT-001",
    title: "Remote Workstations Lacking Centralized BitLocker Recovery Key Escrow",
    severity: "Observation",
    framework_clause: "Control A.6.7 (Remote Working) & IT Act Section 43A",
    framework_name: "ISO/IEC 27001:2022 & IT Act 2000",
    description: "Laptops distributed to engineering staff are encrypted, but 12% of endpoints do not sync recovery escrow keys into the centralized MDM portal.",
    evidence: "Fleet MDM compliance dashboard reflected 6 endpoints with unescrowed local BitLocker protectors.",
    remediation_plan: "Deploy an automated Intune/MDM remediation script enforcing mandatory Azure AD key escrow upon device boot.",
    owner: "IT Infrastructure & Operations",
    status: "Resolved",
    due_date: "2026-04-10",
    verified_by: "Marcus Brody (CTO)",
  },
  {
    id: 4,
    finding_code: "FINDING-004",
    audit_code: "AUDIT-001",
    title: "Multi-Factor Authentication (MFA) Fallback Timeout Exceeding Thresholds",
    severity: "Opportunity for Improvement",
    framework_clause: "Control A.8.5 (Secure Authentication) & COBIT DSS05.05",
    framework_name: "ISO/IEC 27001:2022 & COBIT 2019",
    description: "VPN tunnel session re-authentication is configured for 24 hours rather than the recommended 12-hour statutory threshold for off-site connections.",
    evidence: "Cisco AnyConnect / WireGuard gateway profile timeout settings configured to 1440 minutes.",
    remediation_plan: "Update gateway configuration profiles to enforce 720-minute re-authentication timeouts with push notifications.",
    owner: "IT Security Team",
    status: "In Remediation",
    due_date: "2026-05-01",
    verified_by: "Alex Turner / CISO",
  },
  {
    id: 5,
    finding_code: "FINDING-005",
    audit_code: "AUDIT-002",
    title: "Unmasked Personal Identifiable Data (PII) Staged in Non-Production Cluster",
    severity: "Critical",
    framework_clause: "GDPR Article 32 & IT Act Section 43A / Rule 8",
    framework_name: "EU GDPR & IT Act 2000",
    description: "A development database clone contained unmasked customer phone numbers and email addresses without synthetic data obfuscation.",
    evidence: "Staging database replica `dev_cust_db_v2` contained 1,420 unanonymized customer profile records.",
    remediation_plan: "Immediately purge staging replica; implement automated synthetic data masking pipeline before any production database replication.",
    owner: "Database Engineering & Legal",
    status: "Resolved",
    due_date: "2026-04-05",
    verified_by: "Elena Vance (Legal Counsel & DPO)",
  },
  {
    id: 6,
    finding_code: "FINDING-006",
    audit_code: "AUDIT-003",
    title: "Vendor SOC 2 Type II Attestation Annual Renewal Tracking Gap",
    severity: "Minor Non-Conformity",
    framework_clause: "Control A.5.19 (Supplier Security) & COBIT APO10",
    framework_name: "ISO/IEC 27001:2022 & COBIT 2019",
    description: "3 critical SaaS sub-processors had expired SOC 2 reports (>15 months old) with no documented request for refreshed bridge letters.",
    evidence: "Vendor risk register indicates AWS and Datadog have valid reports, but HR ticketing software attestation expired in December.",
    remediation_plan: "Institute automated calendar triggers and vendor procurement gates requiring updated SOC 2 / ISO 27001 certificates prior to contract renewal.",
    owner: "Legal & Procurement Lead",
    status: "Open",
    due_date: "2026-05-30",
    verified_by: "Alex Turner / CISO",
  },
];

export const DEFAULT_USERS = [
  {
    id: "usr-admin-01",
    email: "admin@enterprise.com",
    password: "password123",
    full_name: "Alex Turner",
    role: "admin",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "usr-compliance-01",
    email: "compliance@enterprise.com",
    password: "password123",
    full_name: "Elena Vance",
    role: "compliance_officer",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "usr-employee-01",
    email: "employee@enterprise.com",
    password: "password123",
    full_name: "Marcus Brody",
    role: "employee",
    created_at: "2026-01-01T00:00:00Z",
  },
];

// Mapping of collection name to default seed data
const COLLECTION_DEFAULTS = {
  departments: DEFAULT_DEPARTMENTS,
  employees: DEFAULT_EMPLOYEES,
  policies: DEFAULT_POLICIES,
  risks: DEFAULT_RISKS,
  risk_register: DEFAULT_RISKS,
  trainings: DEFAULT_TRAININGS,
  assessments: DEFAULT_ASSESSMENTS,
  compliance_frameworks: DEFAULT_COMPLIANCE_FRAMEWORKS,
  security_controls: DEFAULT_SECURITY_CONTROLS,
  control_mappings: DEFAULT_CONTROL_MAPPINGS,
  internal_audits: DEFAULT_INTERNAL_AUDITS,
  audit_findings: DEFAULT_AUDIT_FINDINGS,
  policy_acknowledgements: [],
  audit_logs: [],
  users: DEFAULT_USERS,
  profiles: DEFAULT_EMPLOYEES.map((e) => ({
    id: e.id ? `usr-${e.id}` : "usr-admin-01",
    full_name: e.full_name,
    email: e.email,
    role: e.role,
    department: e.department,
  })),
};

// =============================================================================
// STORAGE ENGINE IMPLEMENTATION
// =============================================================================

class LocalStorageDb {
  constructor() {
    this.prefix = STORAGE_PREFIX;
    this.ensureInitialized();
  }

  getKey(collection) {
    // Normalize aliases (risk_register -> risks)
    const norm = collection === "risk_register" ? "risks" : collection;
    return `${this.prefix}${norm}`;
  }

  // Ensure initial clean 0-record slate is established for new browsers/sessions (Auto-seeding PERMANENTLY DISABLED)
  ensureInitialized() {
    if (typeof window === "undefined" || !window.localStorage) return;

    // Strict 0-records enforcement: purge any legacy auto-seeded mock data from prior builds
    const isCleanSlate = window.localStorage.getItem(`${this.prefix}strict_zero_slate_v3`);
    if (!isCleanSlate) {
      this.clearToEmptySlate();
      window.localStorage.setItem(`${this.prefix}strict_zero_slate_v3`, "true");
      window.localStorage.setItem(`${this.prefix}seeded`, "false");
    }
  }

  // Wipes all operational collections to an empty 0-record state
  clearToEmptySlate() {
    if (typeof window === "undefined" || !window.localStorage) return;

    const operationalCollections = [
      "departments",
      "employees",
      "policies",
      "risks",
      "risk_register",
      "trainings",
      "assessments",
      "internal_audits",
      "audit_findings",
      "policy_acknowledgements",
      "control_mappings",
      "compliance_frameworks",
      "security_controls",
      "audit_logs",
    ];

    operationalCollections.forEach((coll) => {
      window.localStorage.setItem(this.getKey(coll), JSON.stringify([]));
    });

    // Ensure demo authentication accounts exist so login is always accessible
    const usersKey = this.getKey("users");
    const existingUsers = window.localStorage.getItem(usersKey);
    if (!existingUsers) {
      window.localStorage.setItem(usersKey, JSON.stringify(DEFAULT_USERS));
    }

    this.notify("all");
  }

  // Seed default enterprise data for all collections (ONLY on explicit manual request from Profile page)
  seedDefaults() {
    if (typeof window === "undefined" || !window.localStorage) return;

    Object.entries(COLLECTION_DEFAULTS).forEach(([collection, data]) => {
      const key = this.getKey(collection);
      window.localStorage.setItem(key, JSON.stringify(data));
    });
    window.localStorage.setItem(`${this.prefix}seeded`, "true");
    this.notify("all");
  }

  // Dispatch live update events across tabs & components
  notify(collection) {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("grc-storage-update", {
        detail: { collection },
      })
    );
  }

  // Read collection: strictly returns [] (0 records) if missing or empty, NO auto-injection
  get(collection) {
    if (typeof window === "undefined" || !window.localStorage) {
      return collection === "users" ? DEFAULT_USERS : [];
    }

    const key = this.getKey(collection);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      // If collection does not exist in localStorage, return empty array [] (0 records)
      // Only users collection gets default authentication accounts so login works
      return collection === "users" ? DEFAULT_USERS : [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error(`Error parsing localStorage key ${key}:`, e);
      return [];
    }
  }

  // Save entire collection
  set(collection, items) {
    if (typeof window === "undefined" || !window.localStorage) return;

    const key = this.getKey(collection);
    window.localStorage.setItem(key, JSON.stringify(items));
    this.notify(collection);
  }

  // Get item by ID
  getById(collection, id) {
    const items = this.get(collection);
    return items.find((item) => String(item.id) === String(id)) || null;
  }

  // Insert item(s)
  insert(collection, itemOrItems) {
    const items = this.get(collection);
    const toAdd = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

    const prepared = toAdd.map((item, index) => {
      const currentId = item.id || Date.now() + index;
      return {
        ...item,
        id: currentId,
        created_at: item.created_at || new Date().toISOString(),
      };
    });

    const updated = [...prepared, ...items];
    this.set(collection, updated);
    return prepared.length === 1 ? prepared[0] : prepared;
  }

  // Update item by ID
  update(collection, id, updates) {
    const items = this.get(collection);
    let matched = null;

    const updated = items.map((item) => {
      if (String(item.id) === String(id)) {
        matched = { ...item, ...updates, updated_at: new Date().toISOString() };
        return matched;
      }
      return item;
    });

    if (matched) {
      this.set(collection, updated);
    }
    return matched;
  }

  // Delete item by ID
  delete(collection, id) {
    const items = this.get(collection);
    const updated = items.filter((item) => String(item.id) !== String(id));
    this.set(collection, updated);
    return true;
  }

  // Reset workspace: 'empty' wipes to 0 records, 'defaults' restores enterprise sample data
  resetWorkspace(mode = "empty") {
    if (typeof window === "undefined" || !window.localStorage) return;

    if (mode === "empty") {
      this.clearToEmptySlate();
      window.localStorage.setItem(`${this.prefix}seeded`, "false");
    } else {
      // Restore standard defaults upon explicit user request
      this.seedDefaults();
    }
  }

  // ===========================================================================
  // FLUENT QUERY INTERFACE (Replaces Supabase .from() with LocalStorage Engine)
  // ===========================================================================
  from(collection) {
    const db = this;
    let data = [...db.get(collection)];
    let error = null;

    const query = {
      select(columns = "*", options = {}) {
        if (options && options.count === "exact" && options.head) {
          return Promise.resolve({
            data: null,
            count: data.length,
            error: null,
          });
        }
        return query;
      },

      order(column, { ascending = true } = {}) {
        data.sort((a, b) => {
          const valA = a[column];
          const valB = b[column];
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
        return query;
      },

      limit(count) {
        data = data.slice(0, count);
        return query;
      },

      eq(column, value) {
        data = data.filter((item) => String(item[column]) === String(value));
        return query;
      },

      neq(column, value) {
        data = data.filter((item) => String(item[column]) !== String(value));
        return query;
      },

      maybeSingle() {
        return Promise.resolve({
          data: data.length > 0 ? data[0] : null,
          error: null,
        });
      },

      single() {
        return Promise.resolve({
          data: data.length > 0 ? data[0] : null,
          error: data.length === 0 ? { message: "Row not found" } : null,
        });
      },

      // Executing Inserts
      async insert(items) {
        const added = db.insert(collection, items);
        const resultData = Array.isArray(added) ? added : [added];
        return {
          data: resultData,
          error: null,
          select() {
            return Promise.resolve({ data: resultData, error: null });
          },
        };
      },

      // Executing Updates
      async update(updates) {
        const targetIds = data.map((d) => d.id);
        const allItems = db.get(collection);
        let updatedCount = 0;

        const next = allItems.map((item) => {
          if (targetIds.includes(item.id)) {
            updatedCount++;
            return { ...item, ...updates, updated_at: new Date().toISOString() };
          }
          return item;
        });

        db.set(collection, next);
        return {
          data: next.filter((item) => targetIds.includes(item.id)),
          error: null,
          select() {
            return Promise.resolve({ data: next, error: null });
          },
        };
      },

      // Executing Deletes
      async delete() {
        const targetIds = data.map((d) => d.id);
        const allItems = db.get(collection);
        const next = allItems.filter((item) => !targetIds.includes(item.id));
        db.set(collection, next);
        return {
          data: null,
          error: null,
        };
      },

      // Executing Upserts
      async upsert(items) {
        const toUpsert = Array.isArray(items) ? items : [items];
        const allItems = db.get(collection);
        const upsertMap = new Map(allItems.map((i) => [String(i.id), i]));

        toUpsert.forEach((item) => {
          const idStr = String(item.id || Date.now());
          const existing = upsertMap.get(idStr) || {};
          upsertMap.set(idStr, { ...existing, ...item, id: item.id || idStr });
        });

        const next = Array.from(upsertMap.values());
        db.set(collection, next);
        return {
          data: toUpsert,
          error: null,
          select() {
            return Promise.resolve({ data: toUpsert, error: null });
          },
        };
      },

      // Promise resolution for direct await on query
      then(resolve, reject) {
        return Promise.resolve({
          data,
          count: data.length,
          error,
        }).then(resolve, reject);
      },
    };

    return query;
  }
}

// Global Singleton Instance
export const localStorageDb = new LocalStorageDb();

// =============================================================================
// REACTIVE HOOK FOR REALTIME COMPONENTS
// =============================================================================
export function useGrcCollection(collectionName) {
  const [data, setData] = useState(() => localStorageDb.get(collectionName));

  useEffect(() => {
    const handleUpdate = (e) => {
      if (
        !e.detail ||
        e.detail.collection === collectionName ||
        e.detail.collection === "all"
      ) {
        setData(localStorageDb.get(collectionName));
      }
    };

    window.addEventListener("grc-storage-update", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [collectionName]);

  return data;
}

export default localStorageDb;
