/**
 * ARMOUR Enterprise Policy Template Generator
 * Standards: ISO/IEC 27001:2022 | DPDP Act 2023 | ISO 22301:2019 | IT Act 2000
 * Provides pre-formatted, audit-ready Word (.doc / .docx compatible) and Text templates.
 */

export const ENTERPRISE_POLICY_TEMPLATE_TEXT = `================================================================================
ARMOUR ENTERPRISE INFORMATION SECURITY & DATA GOVERNANCE POLICY
Standard: ISO/IEC 27001:2022 (A.5.1) | DPDP Act 2023 | ISO 22301:2019
Document Classification: RESTRICTED / INTERNAL ENTERPRISE GOVERNANCE
================================================================================

1. DOCUMENT CONTROL & METADATA
--------------------------------------------------------------------------------
Policy Title        : Enterprise Information Security & Data Governance Policy
Policy ID           : POL-ARMOUR-001
Version             : 1.0 (Formal Release)
Effective Date      : October 2026
Review Cycle        : Annual (Mandatory Re-evaluation every 12 Months)
Target Workforce    : All Employees, Officers, Contractors & Third-Party Vendors
Statutory Mappings  : ISO/IEC 27001:2022 (A.5.1, A.5.15, A.8.5)
                      DPDP Act 2023 (Sections 4, 6, 8, 11)
                      ISO 22301:2019 (Clauses 8.2, 8.4, 8.5)
                      IT Act 2000 (Section 43A, 72A) & CERT-In Directions 2022

2. EXECUTIVE PURPOSE & OBJECTIVE
--------------------------------------------------------------------------------
This Policy establishes management direction, organizational principles, and
mandatory technical controls for protecting digital assets, confidential data,
and workforce infrastructure. The primary objective is to maintain zero-trust
confidentiality, integrity, availability, and legal compliance across all operations.

3. SCOPE & APPLICABILITY
--------------------------------------------------------------------------------
This policy applies universally across all departments, geographic branch offices,
remote workers, and technology infrastructure. It encompasses all endpoints,
cloud tenants, data stores, communications networks, and proprietary information.

4. GOVERNANCE & RACI ACCOUNTABILITY MATRIX
--------------------------------------------------------------------------------
Activity / Safeguard                 | Responsible (R)  | Accountable (A) | Consulted (C) | Informed (I)
-------------------------------------|------------------|-----------------|---------------|-------------
Access Control & Password Policy     | DevOps/SysAdmin  | CISO / CTO      | Legal/Risk    | All Staff
DPDP Data Protection & Privacy       | DPO & Privacy    | General Counsel | Compliance    | Workforce
Business Continuity (BCP & DR)       | Systems Eng Lead | VP Operations   | CISO          | Executive
Incident Response & Breach Intimation| SOC Lead / CSIRT | CISO            | Legal Counsel | Board
Periodic Employee Awareness Training | InfoSec Trainer  | HR Director     | Compliance    | All Staff

Key RACI Definitions:
- Responsible (R) : The individual(s) who conduct the operational activity.
- Accountable (A) : The executive leader with ultimate authority and accountability.
- Consulted (C)   : Subject matter experts consulted prior to decisions.
- Informed (I)    : Stakeholders notified regarding policy execution and results.

5. STATUTORY COMPLIANCE SAFEGUARDS & CORE MANDATES
--------------------------------------------------------------------------------
5.1. ACCESS CONTROL & AUTHENTICATION (ISO 27001:2022 Control A.5.15 & A.8.5)
     - Zero-Trust Architecture: Role-based permissions (RBAC) enforced with least privilege.
     - Multi-Factor Authentication (MFA): Mandatory 6-digit OTP or FIDO2 hardware token
       for all external and privileged access.
     - Passphrase Standard: 16+ character passphrases required with biometric fallback.
     - Session Lockout: Inactivity timeout after 15 minutes of user dormancy.

5.2. DIGITAL PERSONAL DATA PROTECTION (DPDP Act 2023 Mandates)
     - Purpose Limitation: Digital personal data shall solely be processed for specified,
       lawful purposes with verifiable consent.
     - Data Principal Rights: Organizational commitment to respond to access, correction,
       and erasure requests within 72 hours.
     - Minor Protection: Absolute prohibition on behavioral profiling or targeted
       advertising directed at minors without verifiable parental authorization.
     - Regulatory Breach Intimation: CSIRT shall report data compromise incidents
       to the Data Protection Board of India (DPBI) and CERT-In within 6 hours of discovery.

5.3. BUSINESS CONTINUITY & RESILIENCE (ISO 22301:2019 Clauses 8.2 & 8.4)
     - Business Impact Analysis (BIA) conducted semi-annually across critical services.
     - Recovery Time Objective (RTO): Service recovery must occur within 4 hours.
     - Recovery Point Objective (RPO): Data loss ceiling strictly limited to under 1 hour.
     - Immutable Backups: Air-gapped, encrypted offline backups verified monthly.

6. MAINTENANCE, REVIEW LIFECYCLE & AUDIT TRAIL
--------------------------------------------------------------------------------
Under ISO 27001 Clause 5.2 and statutory governance mandates, this policy must be
reviewed at least annually, or immediately following significant operational,
infrastructure, or legal modifications. All revisions shall be logged with
author identity, timestamp, and executive committee approval signature.

7. ENFORCEMENT, PENALTIES & DISCIPLINARY ACTIONS
--------------------------------------------------------------------------------
Adherence to this policy is mandatory. Willful or negligent non-compliance poses
severe legal and operational risk to the organization.
- Violations shall be investigated by Internal Audit and Human Resources.
- Non-compliance may result in disciplinary action up to and including immediate
  termination of employment, revocation of commercial contracts, and formal
  prosecution under the Indian Information Technology Act 2000 (Sections 43, 66, 72A)
  and financial penalties under the DPDP Act 2023.

8. EXECUTIVE APPROVAL & ATTESTATION
--------------------------------------------------------------------------------
Prepared By  : Enterprise Risk & Compliance Committee
Reviewed By  : Data Protection Officer (DPO) & Legal Counsel
Approved By  : Chief Information Security Officer (CISO) & Chief Technology Officer
Attestation  : "This policy constitutes formal operating doctrine of the enterprise."
Date         : October 11, 2026
`;

export const generatePolicyTemplateHtml = () => {
  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>ARMOUR Enterprise Policy Template</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1e293b;
      margin: 40px;
    }
    .header-box {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .brand-title {
      font-size: 22pt;
      font-weight: 800;
      color: #1e3a8a;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .brand-subtitle {
      font-size: 11pt;
      color: #3b82f6;
      font-weight: 600;
      margin-top: 4px;
      margin-bottom: 12px;
    }
    .badge {
      display: inline-block;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: bold;
    }
    h2 {
      font-size: 14pt;
      color: #1e40af;
      margin-top: 25px;
      margin-bottom: 8px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    h3 {
      font-size: 12pt;
      color: #0f172a;
      margin-top: 16px;
      margin-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0 20px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #94a3b8;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: bold;
    }
    .callout {
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 10px 14px;
      margin: 15px 0;
    }
    .sign-table td {
      height: 45px;
      vertical-align: bottom;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <h1 class="brand-title">ARMOUR</h1>
    <div class="brand-subtitle">Audit, Risk Mapping &amp; Organizational Unified Remediation</div>
    <span class="badge">STANDARD ENTERPRISE GOVERNANCE POLICY TEMPLATE</span>
    <span class="badge" style="background: #f0fdf4; border-color: #bbf7d0; color: #15803d;">ISO 27001 | DPDP ACT | ISO 22301</span>
  </div>

  <h2>1. DOCUMENT CONTROL &amp; METADATA</h2>
  <table>
    <tr><th width="30%">Policy Title</th><td>Enterprise Information Security &amp; Data Governance Policy</td></tr>
    <tr><th>Policy Identifier</th><td>POL-ARMOUR-001</td></tr>
    <tr><th>Version &amp; Status</th><td>Version 1.0 (Official Approved Standard)</td></tr>
    <tr><th>Effective Date</th><td>October 2026</td></tr>
    <tr><th>Mandatory Review Cycle</th><td>Annual (Formal re-evaluation every 12 months)</td></tr>
    <tr><th>Target Workforce</th><td>All Full-Time, Remote Employees, Officers, Contractors &amp; Vendors</td></tr>
    <tr><th>Statutory Alignments</th><td>ISO/IEC 27001:2022 (A.5.1, A.5.15), DPDP Act 2023, ISO 22301:2019, IT Act 2000</td></tr>
  </table>

  <h2>2. EXECUTIVE PURPOSE &amp; OBJECTIVE</h2>
  <p>
    This Policy establishes the foundational cybersecurity, risk management, and regulatory compliance posture for the enterprise. Its primary objective is to enforce zero-trust defense, safeguard confidentiality and integrity of digital records, ensure prompt incident reporting, and protect digital personal data under applicable statutory frameworks.
  </p>

  <h2>3. SCOPE &amp; APPLICABILITY</h2>
  <p>
    This policy applies universally across all departments, operating subsidiaries, cloud environments, workstations, network endpoints, and personnel accessing enterprise informational assets.
  </p>

  <h2>4. RACI GOVERNANCE &amp; ACCOUNTABILITY MATRIX</h2>
  <table>
    <thead>
      <tr>
        <th>Governance Activity / Safeguard</th>
        <th>Responsible (R)</th>
        <th>Accountable (A)</th>
        <th>Consulted (C)</th>
        <th>Informed (I)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Access Control, MFA &amp; Password Hygiene</td>
        <td>DevOps &amp; System Administrators</td>
        <td>CISO / Head of IT</td>
        <td>Legal, Risk &amp; Governance</td>
        <td>All System Users</td>
      </tr>
      <tr>
        <td>Data Privacy &amp; DPDP Act Compliance</td>
        <td>Data Protection Officer (DPO)</td>
        <td>General Counsel / CRO</td>
        <td>Compliance Lead</td>
        <td>Workforce Handling PII</td>
      </tr>
      <tr>
        <td>Business Continuity &amp; Disaster Resilience</td>
        <td>Disaster Recovery Lead</td>
        <td>VP of Infrastructure</td>
        <td>CISO &amp; Operations</td>
        <td>Business Unit Heads</td>
      </tr>
      <tr>
        <td>Incident Detection &amp; Breach Notification</td>
        <td>SOC &amp; CSIRT Team</td>
        <td>CISO</td>
        <td>Legal &amp; Communications</td>
        <td>Executive Board</td>
      </tr>
      <tr>
        <td>Annual Security Training &amp; Attestation</td>
        <td>Security Awareness Lead</td>
        <td>HR Director</td>
        <td>Compliance Lead</td>
        <td>All Active Personnel</td>
      </tr>
    </tbody>
  </table>

  <h2>5. CORE MANDATES &amp; STATUTORY SAFEGUARDS</h2>
  <h3>5.1. Zero-Trust Access Control (ISO/IEC 27001:2022 A.5.15 &amp; A.8.5)</h3>
  <ul>
    <li>Role-Based Access Control (RBAC): Access permissions granted strictly on a need-to-know, least-privilege principle.</li>
    <li>Mandatory Two-Factor Authentication: 6-digit cryptographic OTP challenge or hardware security keys enforced on all sign-ins.</li>
    <li>Session Timeout: Sessions automatically locked after 15 minutes of user inactivity.</li>
  </ul>

  <h3>5.2. Digital Personal Data Protection (DPDP Act 2023)</h3>
  <ul>
    <li>Purpose Limitation: Personal data processed strictly for specified, lawful, and consented business purposes.</li>
    <li>Data Principal Rights: Requests for data access, correction, or erasure fulfilled within 72 hours.</li>
    <li>Protection of Minors: Absolute ban on tracking, behavioral monitoring, or profiling of minor data.</li>
    <li>Mandatory Breach Intimation: Notice delivered to Data Protection Board of India (DPBI) and CERT-In within 6 hours.</li>
  </ul>

  <h3>5.3. Business Continuity &amp; Disaster Recovery (ISO 22301:2019)</h3>
  <ul>
    <li>Maximum Tolerable Outage: Recovery Time Objective (RTO) capped at 4 hours.</li>
    <li>Data Freshness: Recovery Point Objective (RPO) threshold maintained under 1 hour.</li>
    <li>Backup Validation: Air-gapped, immutable backups verified with monthly failover tabletop drills.</li>
  </ul>

  <h2>6. REVIEW CYCLE &amp; AUDIT TRAIL</h2>
  <div class="callout">
    <strong>Mandatory Governance Requirement:</strong> In compliance with ISO 27001 Clause 5.2, this document shall be subjected to formal annual review, or triggered immediately following significant infrastructure, legal, or organizational changes.
  </div>

  <h2>7. ENFORCEMENT &amp; DISCIPLINARY CONSEQUENCES</h2>
  <p>
    Compliance with this policy is a non-negotiable term of employment and vendor engagement. Willful violation, bypass of technical safeguards, or negligent handling of confidential data shall result in disciplinary proceedings up to and including summary dismissal, cancellation of supplier contracts, and statutory civil and criminal penalties under the Information Technology Act 2000 (Section 43A, 66) and DPDP Act 2023.
  </p>

  <h2>8. EXECUTIVE SIGN-OFF &amp; FORMAL APPROVAL</h2>
  <table class="sign-table">
    <tr>
      <th width="33%">CISO Approval</th>
      <th width="33%">Data Protection Officer (DPO)</th>
      <th width="34%">Chief Technology Officer / CEO</th>
    </tr>
    <tr>
      <td>Signature: ______________________<br>Date: _________________________</td>
      <td>Signature: ______________________<br>Date: _________________________</td>
      <td>Signature: ______________________<br>Date: _________________________</td>
    </tr>
  </table>

  <div class="footer">
    ARMOUR Enterprise Governance Platform • Audit, Risk Mapping &amp; Organizational Unified Remediation<br>
    Document Generated for Statutory Enterprise Submission • ISO 27001 | DPDP Act 2023 | ISO 22301
  </div>
</body>
</html>`;
};

/**
 * Triggers browser download of the official Policy Template in Word (.doc) or Text (.txt) format.
 * @param {'word' | 'text'} format 
 */
export const downloadPolicyTemplate = (format = "word") => {
  if (format === "word") {
    const htmlContent = generatePolicyTemplateHtml();
    const blob = new Blob(["\ufeff", htmlContent], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ARMOUR_Enterprise_Policy_Template_ISO27001_DPDP_ISO22301.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    const textContent = ENTERPRISE_POLICY_TEMPLATE_TEXT;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ARMOUR_Enterprise_Policy_Template.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
