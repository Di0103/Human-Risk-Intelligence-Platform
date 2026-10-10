// =============================================================================
// MULTI-FRAMEWORK STATUTORY CLAUSE MAPPING ENGINE
// File: src/utils/statutoryFrameworks.js
// Standards: ISO/IEC 27001:2022 | COBIT 2019 | IT Act 2000 (Sec 43A/SPDI) | EU GDPR
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
    id: "gdpr",
    code: "EU-GDPR",
    name: "EU General Data Protection Regulation",
    shortName: "EU GDPR",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    headerColor: "from-emerald-600 to-teal-600",
    description: "Comprehensive privacy and data protection regulation covering PII processing, consent, and security.",
    jurisdiction: "European Union & Cross-Border Data Flow",
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
      clause: "Section 72A",
      title: "Penalty for Disclosure in Breach of Contract",
      description: "Criminal penalty and fines for disclosing personal information without authorization or in breach of lawful contract.",
    },
  ],
  gdpr: [
    {
      clause: "Article 5",
      title: "Principles of Personal Data Processing",
      description: "Personal data must be processed lawfully, fairly, transparently, with purpose limitation and strict data minimization.",
    },
    {
      clause: "Article 25",
      title: "Data Protection by Design & Default",
      description: "Controllers must implement appropriate technical and organizational measures to integrate data protection principles into processing.",
    },
    {
      clause: "Article 32",
      title: "Security of Processing",
      description: "Technical and organizational measures including pseudonymization, encryption, confidentiality, and regular testing of safeguards.",
    },
    {
      clause: "Article 33",
      title: "72-Hour Breach Notification to Authority",
      description: "In case of a personal data breach, controller must notify the supervisory authority within 72 hours of becoming aware.",
    },
    {
      clause: "Article 34",
      title: "Communication of Breach to Data Subjects",
      description: "When a breach results in high risk to individuals, controller must inform affected data subjects without undue delay.",
    },
  ],
};

// =============================================================================
// MULTI-FRAMEWORK CORRELATION MAPPINGS (PRE-BUILT CROSSWALK)
// =============================================================================
export const MULTI_FRAMEWORK_CROSSWALK = [
  {
    domain: "Access Control & Identity Hygiene",
    iso27001: "Control A.5.15 & A.8.5",
    cobit: "DSS05.04 & DSS05.05 (Identity & Privileged Access)",
    itAct: "Section 43A & Rule 8 (SPDI Access Restrictions)",
    gdpr: "Article 32(1)(b) & Article 25 (Confidentiality & Access Safeguards)",
  },
  {
    domain: "Information Security Policy & Governance",
    iso27001: "Control A.5.1 (InfoSec Policies)",
    cobit: "APO13.01 & EDM03 (Security Governance & Risk Optimization)",
    itAct: "Rule 4 (SPDI Comprehensive Privacy & Security Policy)",
    gdpr: "Article 24 & Article 5(2) (Accountability & Policy Enforcement)",
  },
  {
    domain: "Personal Data Privacy & Consent",
    iso27001: "Control A.5.34 (Privacy and Protection of PII)",
    cobit: "APO12.06 & MEA01 (Regulatory Conformance Monitoring)",
    itAct: "Rule 4 & Rule 5 (SPDI Notice, Consent & Collection Restrictions)",
    gdpr: "Article 5, Article 6 & Article 7 (Lawfulness of Processing & Consent)",
  },
  {
    domain: "Incident Response & Breach Notification",
    iso27001: "Control A.5.24 - A.5.28 (Security Incident Management)",
    cobit: "DSS02.05 & DSS02.06 (Incident Escalation & Tracking)",
    itAct: "Section 70B (CERT-In Mandatory Reporting) & Section 43A",
    gdpr: "Article 33 & Article 34 (Mandatory 72-Hour Breach Notification)",
  },
  {
    domain: "Remote Working & Endpoint Security",
    iso27001: "Control A.6.7 (Remote Working) & A.8.1 (Endpoint Devices)",
    cobit: "DSS05.02 (Malware & Endpoint Defense)",
    itAct: "Section 43A & Rule 8 (Reasonable Security Practices on Devices)",
    gdpr: "Article 32(1)(a) & 32(1)(d) (Endpoint Encryption & Vulnerability Testing)",
  },
  {
    domain: "Cryptography & Data Protection in Transit",
    iso27001: "Control A.8.24 (Use of Cryptography) & A.8.20 (Network Security)",
    cobit: "DSS05.03 (Network & Cryptographic Safeguards)",
    itAct: "Rule 8 (SPDI Mandated Encryption Standards)",
    gdpr: "Article 32(1)(a) (State-of-the-art Encryption & Pseudonymization)",
  },
];

/**
 * Resolves comprehensive multi-framework mappings for any policy title or key
 */
export const resolveMultiFrameworkForPolicy = (policyTitle = "") => {
  const t = (policyTitle || "").toLowerCase();

  if (t.includes("access") || t.includes("password") || t.includes("authentication")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Control A.5.15 & A.8.5",
      cobit: "COBIT 2019 DSS05.04 & DSS05.05",
      itAct: "IT Act 2000 Section 43A / Rule 8 (SPDI)",
      gdpr: "EU GDPR Article 32(1)(b) & Article 25",
    };
  }

  if (t.includes("privacy") || t.includes("gdpr") || t.includes("pii") || t.includes("data protection")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Control A.5.34",
      cobit: "COBIT 2019 APO12.06 & MEA01",
      itAct: "IT Act 2000 Section 43A & Rules 4, 5 (SPDI)",
      gdpr: "EU GDPR Articles 5, 25, 32",
    };
  }

  if (t.includes("incident") || t.includes("breach") || t.includes("response")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Controls A.5.24 - A.5.28",
      cobit: "COBIT 2019 DSS02.05 & DSS02.06",
      itAct: "IT Act 2000 Section 43A & Section 70B (CERT-In)",
      gdpr: "EU GDPR Articles 33 & 34 (72-hour notice)",
    };
  }

  if (t.includes("remote") || t.includes("byod") || t.includes("telework") || t.includes("device")) {
    return {
      iso27001: "ISO/IEC 27001:2022 Controls A.6.7 & A.8.1",
      cobit: "COBIT 2019 DSS05.02",
      itAct: "IT Act 2000 Section 43A / Rule 8 (SPDI)",
      gdpr: "EU GDPR Article 32(1)(a) & Article 25",
    };
  }

  // Default Information Security Policy mapping
  return {
    iso27001: "ISO/IEC 27001:2022 Control A.5.1",
    cobit: "COBIT 2019 APO13.01 & EDM03",
    itAct: "IT Act 2000 Section 43A / Rule 4 (SPDI)",
    gdpr: "EU GDPR Article 24 & Article 5(2)",
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
      gdpr: "Article 32(1)(b) (Access Integrity & Confidentiality)",
    };
  }

  if (combined.includes("crypt") || combined.includes("encryp") || combined.includes("tls") || combined.includes("ssl")) {
    return {
      iso27001: "Control A.8.24 (Use of Cryptography) & A.8.20 (Network Security)",
      cobit: "DSS05.03 (Cryptographic Control Enforcement)",
      itAct: "Section 43A / Rule 8 (Encryption of Sensitive Personal Data)",
      gdpr: "Article 32(1)(a) (Pseudonymization & Cryptographic Defense)",
    };
  }

  if (combined.includes("incident") || combined.includes("alert") || combined.includes("siem") || combined.includes("log")) {
    return {
      iso27001: "Control A.5.24 (Incident Management) & A.8.15 (Logging)",
      cobit: "DSS02.05 (Incident Tracking) & MEA01 (Monitoring)",
      itAct: "Section 70B (CERT-In Reporting) & Section 43A",
      gdpr: "Article 33 (72-Hour Data Breach Notification)",
    };
  }

  if (combined.includes("backup") || combined.includes("recover") || combined.includes("bcp") || combined.includes("dr")) {
    return {
      iso27001: "Control A.8.13 (Information Backup) & A.5.29 (ICT Readiness)",
      cobit: "DSS04 (Managed Continuity)",
      itAct: "Section 43A / Rule 8 (Data Availability & Resilience)",
      gdpr: "Article 32(1)(c) (Restore Availability & Timely Access)",
    };
  }

  return {
    iso27001: "Control A.5.1 (Information Security Policies)",
    cobit: "APO13 (Managed Security)",
    itAct: "Section 43A (Reasonable Security Practices)",
    gdpr: "Article 24 (Responsibility of Controller)",
  };
};
