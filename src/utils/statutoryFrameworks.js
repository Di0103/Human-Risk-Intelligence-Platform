// =============================================================================
// MULTI-FRAMEWORK STATUTORY CLAUSE MAPPING ENGINE
// File: src/utils/statutoryFrameworks.js
// Standards: ISO/IEC 27001:2022 | COBIT 2019 | IT Act 2000 (Sec 43A/SPDI) | DPDP Act 2023 | ISO 22301:2019
// =============================================================================

export const STATUTORY_FRAMEWORKS = [
  {
    id: "iso27001",
    code: "ISO-27001",
    name: "ISO/IEC 27001:2022",
    shortName: "ISO 27001",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    headerColor: "from-blue-600 to-indigo-600",
    description: "International standard for Information Security Management Systems (ISMS) and Annex A controls.",
    jurisdiction: "International Standard (ISO/IEC)",
  },
  {
    id: "cobit",
    code: "COBIT-2019",
    name: "COBIT 2019 Framework",
    shortName: "COBIT 2019",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    headerColor: "from-purple-600 to-pink-600",
    description: "ISACA enterprise IT governance, risk optimization, and security process objectives.",
    jurisdiction: "Global Enterprise IT Governance (ISACA)",
  },
  {
    id: "it_act",
    code: "IT-ACT-2000",
    name: "IT Act 2000 (Sec 43A & SPDI Rules)",
    shortName: "IT Act (43A/SPDI)",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    headerColor: "from-amber-600 to-orange-600",
    description: "Statutory mandates for Reasonable Security Practices and Sensitive Personal Data protection in India.",
    jurisdiction: "Indian Cyber Law & MEITY",
  },
  {
    id: "dpdp",
    code: "DPDP-2023",
    name: "DPDP Act 2023 (Digital Personal Data Protection Act)",
    shortName: "DPDP Act 2023",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    headerColor: "from-emerald-600 to-teal-600",
    description: "India's statutory data protection legislation governing digital personal data processing, data principal rights, and data fiduciary obligations.",
    jurisdiction: "Data Protection Board of India (DPBI)",
  },
  {
    id: "iso22301",
    code: "ISO-22301",
    name: "ISO 22301:2019 (Business Continuity Management)",
    shortName: "ISO 22301",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    headerColor: "from-teal-600 to-cyan-600",
    description: "International standard for Business Continuity Management Systems (BCMS) specifying requirements for resilience, continuity, and disaster recovery.",
    jurisdiction: "International Standard (ISO)",
  },
];

export const FRAMEWORK_CLAUSES = {
  iso27001: [
    {
      clause: "A.5.1",
      title: "Policies for Information Security",
      description: "Information security policy and topic-specific policies must be defined, approved by management, and communicated to personnel.",
    },
    {
      clause: "A.5.15",
      title: "Access Control & Least Privilege",
      description: "Access rights to information and other associated assets must be provisioned and enforced strictly per least privilege.",
    },
    {
      clause: "A.5.24",
      title: "Information Security Incident Management",
      description: "Management must establish responsive procedures to detect, report, and assess information security incidents timely.",
    },
    {
      clause: "A.5.29",
      title: "Information Security During Disruption",
      description: "Processes and controls must be planned and tested to ensure required levels of security during business disruptions.",
    },
    {
      clause: "A.6.7",
      title: "Remote Working & Telework Security",
      description: "Security measures must be implemented when personnel work remotely to protect assets accessed or processed off-premises.",
    },
    {
      clause: "A.8.5",
      title: "Secure Authentication & MFA",
      description: "Secure authentication technologies such as multi-factor authentication (MFA) must be established based on access restrictions.",
    },
    {
      clause: "A.8.14",
      title: "Redundancy of Information Processing Facilities",
      description: "Processing facilities must be implemented with redundancy sufficient to meet availability and business continuity requirements.",
    },
    {
      clause: "A.8.20",
      title: "Network Security & Segmentation",
      description: "Networks and network devices must be secured, managed, and controlled to protect systems and applications in transit.",
    },
    {
      clause: "A.8.24",
      title: "Use of Cryptography",
      description: "Rules for the effective use of cryptography, including key management and algorithm lifecycle, must be defined and implemented.",
    },
  ],
  cobit: [
    {
      clause: "EDM03",
      title: "Ensured Risk Optimization",
      description: "Ensure enterprise risk appetite and tolerance are understood, articulated, and communicated across operations.",
    },
    {
      clause: "APO12",
      title: "Managed Risk",
      description: "Continually identify, assess, and reduce IT-related risk within levels of tolerance set by executive management.",
    },
    {
      clause: "APO13",
      title: "Managed Security",
      description: "Define, operate, and monitor an information security management system aligned with business impact.",
    },
    {
      clause: "DSS04",
      title: "Managed Continuity",
      description: "Establish and maintain a plan to enable business and IT operations to respond to incidents and disruptions.",
    },
    {
      clause: "DSS05",
      title: "Managed Security Services",
      description: "Protect enterprise assets against malware, endpoint compromise, identity misuse, and unauthorized physical intrusion.",
    },
    {
      clause: "DSS02",
      title: "Managed Service Requests & Incidents",
      description: "Provide timely and effective response to user requests and resolution of all operational security incidents.",
    },
    {
      clause: "MEA01",
      title: "Managed Performance & Conformance",
      description: "Collect, validate, and evaluate business process and IT performance metrics and external conformance requirements.",
    },
  ],
  it_act: [
    {
      clause: "Section 43A",
      title: "Compensation for Failure to Protect Data",
      description: "Mandates body corporates possessing sensitive personal data to implement and maintain reasonable security practices.",
    },
    {
      clause: "Rule 4 (SPDI)",
      title: "Mandatory Privacy Policy for SPDI",
      description: "Requires publication of a comprehensive privacy policy detailing collection, storage, and handling of sensitive personal data.",
    },
    {
      clause: "Rule 5 (SPDI)",
      title: "Consent & Purpose Limitation",
      description: "Mandates written consent prior to collecting sensitive personal data, restricting collection strictly to lawful business purposes.",
    },
    {
      clause: "Rule 8 (SPDI)",
      title: "Reasonable Security Practices & Codes",
      description: "Affirms that organizations maintaining ISO/IEC 27001 or equivalent certified security codes fulfill Section 43A statutory duties.",
    },
    {
      clause: "Section 70B",
      title: "Mandatory CERT-In Cybersecurity Incident Reporting",
      description: "Requires designated entities and organizations to report cybersecurity incidents to CERT-In within mandated operational windows.",
    },
    {
      clause: "Section 72A",
      title: "Penalty for Disclosure in Breach of Contract",
      description: "Criminal penalty and fines for disclosing personal information without authorization or in breach of lawful contract.",
    },
  ],
  dpdp: [
    {
      clause: "Section 4",
      title: "Grounds for Processing Digital Personal Data",
      description: "Digital personal data must be processed only for lawful purposes for which the Data Principal has given consent or for legitimate uses.",
    },
    {
      clause: "Section 6",
      title: "Notice & Consent Architecture",
      description: "Itemized, accessible notice must precede or accompany consent requests, clearly stating purpose, rights, and grievance mechanisms.",
    },
    {
      clause: "Section 8(1)",
      title: "Data Fiduciary General Obligations",
      description: "Data Fiduciaries remain accountable for compliance regardless of any third-party processing or data processor engagement.",
    },
    {
      clause: "Section 8(5)",
      title: "Reasonable Security Safeguards",
      description: "Data Fiduciaries must implement reasonable technical and organizational security safeguards to prevent personal data breaches.",
    },
    {
      clause: "Section 8(6)",
      title: "Mandatory Personal Data Breach Notification",
      description: "In the event of a personal data breach, Data Fiduciaries must notify the Data Protection Board of India and each affected Data Principal.",
    },
    {
      clause: "Section 9",
      title: "Processing of Children's Personal Data",
      description: "Mandates verifiable parental consent before processing personal data of a child, prohibiting behavioral tracking and targeted advertising.",
    },
    {
      clause: "Section 11",
      title: "Rights of Data Principals",
      description: "Guarantees rights to access personal data summary, correction, completion, updating, erasure, and grievance redressal.",
    },
  ],
  iso22301: [
    {
      clause: "Clause 8.2",
      title: "Business Impact Analysis (BIA) & Risk Assessment",
      description: "Identify critical business activities, evaluate the financial and operational impact of disruptions over time, and establish RTO/RPO metrics.",
    },
    {
      clause: "Clause 8.3",
      title: "Business Continuity Strategies & Resource Solutions",
      description: "Determine strategies to protect priority activities, including alternate operating sites, data replication, and redundant suppliers.",
    },
    {
      clause: "Clause 8.4",
      title: "Business Continuity Plans & Operating Procedures",
      description: "Document incident response protocols, disaster recovery failover steps, emergency communications, and team responsibilities.",
    },
    {
      clause: "Clause 8.5",
      title: "Exercise Programme & Disaster Recovery Drills",
      description: "Conduct scheduled simulated exercises, tabletop tests, and failover validations to ensure continuity strategies remain effective.",
    },
    {
      clause: "Clause 9.1",
      title: "Monitoring, Measurement, Analysis & Evaluation",
      description: "Continuously evaluate BCMS performance, test effectiveness, and organizational resilience against statutory standards.",
    },
  ],
};

// Legacy alias for backward compatibility
FRAMEWORK_CLAUSES.gdpr = FRAMEWORK_CLAUSES.dpdp;

// =============================================================================
// MULTI-FRAMEWORK CORRELATION MAPPINGS (PRE-BUILT CROSSWALK)
// =============================================================================
export const MULTI_FRAMEWORK_CROSSWALK = [
  {
    domain: "Access Control & Identity Hygiene",
    iso27001: "Control A.5.15 & A.8.5",
    cobit: "DSS05.04 & DSS05.05 (Identity & Privileged Access)",
    itAct: "Section 43A & Rule 8 (SPDI Access Restrictions)",
    dpdp: "Section 8(5) (Safeguards against Unauthorized Personal Data Access)",
    iso22301: "Clause 8.4 (Controlled Access to Critical Disaster Recovery Assets)",
    gdpr: "Section 8(5) (DPDP Act 2023 / Reasonable Safeguards)",
  },
  {
    domain: "Information Security Policy & Governance",
    iso27001: "Control A.5.1 (InfoSec Policies)",
    cobit: "APO13.01 & EDM03 (Security Governance & Risk Optimization)",
    itAct: "Rule 4 (SPDI Comprehensive Privacy & Security Policy)",
    dpdp: "Section 8(1) (Data Fiduciary Governance & Statutory Duty of Care)",
    iso22301: "Clause 5.2 & 8.4 (Business Continuity Policy & Procedures)",
    gdpr: "Section 8(1) (DPDP Act 2023 / Fiduciary Governance)",
  },
  {
    domain: "Personal Data Privacy & Consent",
    iso27001: "Control A.5.34 (Privacy and Protection of PII)",
    cobit: "APO12.06 & MEA01 (Regulatory Conformance Monitoring)",
    itAct: "Rule 4 & Rule 5 (SPDI Notice, Consent & Collection Restrictions)",
    dpdp: "Section 6 (Itemized Notice & Consent) & Section 11 (Data Principal Rights)",
    iso22301: "Clause 8.4 (Protection of Critical PII during Business Disruptions)",
    gdpr: "Section 6 & 11 (DPDP Act 2023 / Consent & Rights)",
  },
  {
    domain: "Incident Response & Breach Notification",
    iso27001: "Control A.5.24 - A.5.28 (Security Incident Management)",
    cobit: "DSS02.05 & DSS02.06 (Incident Escalation & Tracking)",
    itAct: "Section 70B (CERT-In Mandatory Reporting) & Section 43A",
    dpdp: "Section 8(6) (Mandatory Intimation of Breach to DPBI & Data Principals)",
    iso22301: "Clause 8.4.2 & 8.4.3 (Incident Response Structure & Communications)",
    gdpr: "Section 8(6) (DPDP Act 2023 / Breach Intimation)",
  },
  {
    domain: "Remote Working & Endpoint Security",
    iso27001: "Control A.6.7 (Remote Working) & A.8.1 (Endpoint Devices)",
    cobit: "DSS05.02 (Malware & Endpoint Defense)",
    itAct: "Section 43A & Rule 8 (Reasonable Security Practices on Devices)",
    dpdp: "Section 8(5) (Technical Safeguards against Endpoint Data Compromise)",
    iso22301: "Clause 8.3 (Resilient Remote Telework & Alternate Operating Workplaces)",
    gdpr: "Section 8(5) (DPDP Act 2023 / Technical Safeguards)",
  },
  {
    domain: "Cryptography & Data Protection in Transit",
    iso27001: "Control A.8.24 (Use of Cryptography) & A.8.20 (Network Security)",
    cobit: "DSS05.03 (Network & Cryptographic Safeguards)",
    itAct: "Rule 8 (SPDI Mandated Encryption Standards)",
    dpdp: "Section 8(5) (Encryption & Pseudonymization Safeguards against Exfiltration)",
    iso22301: "Clause 8.4.4 (Cryptographic Key Escrow & Secure Offline Backup Vaults)",
    gdpr: "Section 8(5) (DPDP Act 2023 / Cryptographic Defense)",
  },
  {
    domain: "Business Continuity & Disaster Resilience",
    iso27001: "Control A.5.29 (InfoSec in Disruption) & A.8.14 (Redundancy)",
    cobit: "DSS04.02 & DSS04.03 (Managed Continuity & DR Testing)",
    itAct: "Section 43A / Rule 8 (Critical Data Availability & System Resilience)",
    dpdp: "Section 8(5) (High Availability & Business Continuity for Data Fiduciary Services)",
    iso22301: "Clause 8.2 (BIA), Clause 8.4 (BCP Runbooks), Clause 8.5 (DR Drills)",
    gdpr: "ISO 22301 Clause 8.2 / 8.5 (Resilience & DR Drills)",
  },
];

/**
 * Resolves comprehensive multi-framework mappings for any policy title or key
 */
export const resolveMultiFrameworkForPolicy = (policyTitle = "") => {
  const t = (policyTitle || "").toLowerCase();

  if (t.includes("continuity") || t.includes("disaster") || t.includes("bcp") || t.includes("resilience") || t.includes("recovery")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Controls A.5.29, A.5.30, A.8.14",
      cobit: "COBIT 2019 DSS04 (Managed Continuity)",
      itAct: "IT Act 2000 Section 43A / Rule 8 (Resilience Standards)",
      dpdp: "DPDP Act 2023 Section 8(5) (Safeguards against Data Loss)",
      iso22301: "ISO 22301:2019 Clauses 8.2, 8.3, 8.4, 8.5",
      gdpr: "DPDP Act 2023 Section 8(5) & ISO 22301 Clause 8.4",
    };
  }

  if (t.includes("access") || t.includes("password") || t.includes("authentication")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Control A.5.15 & A.8.5",
      cobit: "COBIT 2019 DSS05.04 & DSS05.05",
      itAct: "IT Act 2000 Section 43A / Rule 8 (SPDI)",
      dpdp: "DPDP Act 2023 Section 8(5) (Reasonable Security Safeguards)",
      iso22301: "ISO 22301:2019 Clause 8.4 (Access Controls during DR)",
      gdpr: "DPDP Act 2023 Section 8(5) (Security Safeguards)",
    };
  }

  if (t.includes("privacy") || t.includes("dpdp") || t.includes("gdpr") || t.includes("pii") || t.includes("data protection")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Control A.5.34",
      cobit: "COBIT 2019 APO12.06 & MEA01",
      itAct: "IT Act 2000 Section 43A & Rules 4, 5 (SPDI)",
      dpdp: "DPDP Act 2023 Sections 4, 6, 8, 9, 11",
      iso22301: "ISO 22301:2019 Clause 8.4 (Safeguarding Data in Disruption)",
      gdpr: "DPDP Act 2023 Sections 4, 6, 8, 11",
    };
  }

  if (t.includes("incident") || t.includes("breach") || t.includes("response")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Controls A.5.24 - A.5.28",
      cobit: "COBIT 2019 DSS02.05 & DSS02.06",
      itAct: "IT Act 2000 Section 43A & Section 70B (CERT-In)",
      dpdp: "DPDP Act 2023 Section 8(6) (Intimation to DPBI & Principals)",
      iso22301: "ISO 22301:2019 Clause 8.4.2 (Incident Management Structure)",
      gdpr: "DPDP Act 2023 Section 8(6) & CERT-In Sec 70B",
    };
  }

  if (t.includes("remote") || t.includes("byod") || t.includes("telework") || t.includes("device")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Controls A.6.7 & A.8.1",
      cobit: "COBIT 2019 DSS05.02",
      itAct: "IT Act 2000 Section 43A / Rule 8 (SPDI)",
      dpdp: "DPDP Act 2023 Section 8(5) (Endpoint Data Safeguards)",
      iso22301: "ISO 22301:2019 Clause 8.3 (Alternate Telework Resilience)",
      gdpr: "DPDP Act 2023 Section 8(5)",
    };
  }

  // Default Information Security Policy mapping
  return {
    iso27001: "ISO/IEC 27001:2022 Control A.5.1",
    cobit: "COBIT 2019 APO13.01 & EDM03",
    itAct: "IT Act 2000 Section 43A / Rule 4 (SPDI)",
    dpdp: "DPDP Act 2023 Section 8(1) & Section 8(5)",
    iso22301: "ISO 22301:2019 Clause 5.2 (BCMS Policy Alignment)",
    gdpr: "DPDP Act 2023 Section 8(1) & Section 8(5)",
  };
};

/**
 * Resolves multi-framework mappings for any security control code or category
 */
export const resolveMultiFrameworkForControl = (controlCode = "", title = "") => {
  const combined = `${controlCode} ${title}`.toLowerCase();

  if (combined.includes("mfa") || combined.includes("auth") || combined.includes("pass") || combined.includes("access")) {
    return {
      iso27001: "Control A.8.5 (Secure Authentication) & A.5.15 (Access Control)",
      cobit: "DSS05.04 (User Identity and Logical Access)",
      itAct: "Section 43A / Rule 8 (Reasonable Security Practices)",
      dpdp: "DPDP Act 2023 Section 8(5) (Access Safeguards)",
      iso22301: "ISO 22301 Clause 8.4 (DR Access Control)",
      gdpr: "DPDP Act 2023 Section 8(5)",
    };
  }

  if (combined.includes("crypt") || combined.includes("encryp") || combined.includes("tls") || combined.includes("ssl")) {
    return {
      iso27001: "Control A.8.24 (Use of Cryptography) & A.8.20 (Network Security)",
      cobit: "DSS05.03 (Cryptographic Control Enforcement)",
      itAct: "Section 43A / Rule 8 (Encryption of Sensitive Personal Data)",
      dpdp: "DPDP Act 2023 Section 8(5) (Cryptographic Safeguards)",
      iso22301: "ISO 22301 Clause 8.4.4 (Cryptographic Backup Protection)",
      gdpr: "DPDP Act 2023 Section 8(5)",
    };
  }

  if (combined.includes("incident") || combined.includes("alert") || combined.includes("siem") || combined.includes("log")) {
    return {
      iso27001: "Control A.5.24 (Incident Management) & A.8.15 (Logging)",
      cobit: "DSS02.05 (Incident Tracking) & MEA01 (Monitoring)",
      itAct: "Section 70B (CERT-In Mandatory Reporting) & Section 43A",
      dpdp: "DPDP Act 2023 Section 8(6) (Breach Intimation to DPBI)",
      iso22301: "ISO 22301 Clause 8.4.2 (Incident Response Structure)",
      gdpr: "DPDP Act 2023 Section 8(6)",
    };
  }

  if (combined.includes("backup") || combined.includes("recover") || combined.includes("bcp") || combined.includes("dr") || combined.includes("continuity")) {
    return {
      iso27001: "Control A.8.13 (Information Backup) & A.5.29 (ICT Readiness)",
      cobit: "DSS04 (Managed Continuity & Recovery)",
      itAct: "Section 43A / Rule 8 (Data Availability & Resilience)",
      dpdp: "DPDP Act 2023 Section 8(5) (High Availability for Personal Data)",
      iso22301: "ISO 22301:2019 Clauses 8.2, 8.4, 8.5 (BIA & DR Drills)",
      gdpr: "ISO 22301:2019 Clause 8.4 / 8.5",
    };
  }

  return {
    iso27001: "Control A.5.1 (Information Security Policies)",
    cobit: "APO13 (Managed Security)",
    itAct: "Section 43A (Reasonable Security Practices)",
    dpdp: "DPDP Act 2023 Section 8(1) (Data Fiduciary Duty)",
    iso22301: "ISO 22301:2019 Clause 5.2 (BCMS Governance)",
    gdpr: "DPDP Act 2023 Section 8(1)",
  };
};
