// =============================================================================
// INTERACTIVE SECURITY MCQ QUIZ REPOSITORY & DETERMINISTIC SCORING ENGINE
// File: src/utils/quizQuestions.js
// Standard: ISO/IEC 27001:2022 & NIST Cybersecurity Phishing Defense
// =============================================================================

export const QUIZ_MODULES = [
  {
    id: "iso27001",
    title: "ISO 27001:2022 ISMS & Access Control Standards",
    category: "Access Control & Governance",
    passingScore: 66,
    criteria: "ISO/IEC 27001:2022 Controls A.5.15 (Access Control), A.8.5 (Secure Authentication), and A.5.24 (Incident Reporting)",
    description: "Evaluates workforce comprehension of Least Privilege access controls, multi-factor credential hygiene, and organizational security incident reporting.",
    questions: [
      {
        id: 1,
        question: "Under ISO/IEC 27001:2022 Control A.5.15, what is the core requirement of the 'Principle of Least Privilege' (PoLP)?",
        criteria: "Access Rights & Least Privilege (Control A.5.15)",
        options: [
          "Users should be granted universal system access to maximize cross-department collaboration speed.",
          "Users are restricted to the minimum access permissions strictly required to perform their specific business duties.",
          "Administrative credentials must be shared among team leads without individual audit logs.",
          "Privileged access rights should never expire or undergo periodic entitlement reviews.",
        ],
        correctIndex: 1,
        explanation: "Control A.5.15 mandates that access rights to information assets must be allocated based on business requirements and the principle of least privilege.",
      },
      {
        id: 2,
        question: "According to ISO 27001:2022 Control A.8.5 (Secure Authentication), which practice best protects enterprise identity against credential stuffing attacks?",
        criteria: "Secure Authentication & MFA Enforcement (Control A.8.5)",
        options: [
          "Storing passwords in an unencrypted shared company document with view-only permissions.",
          "Relying on simple 6-character numeric PINs without account lockout thresholds.",
          "Enforcing Multi-Factor Authentication (MFA) with authenticator apps or FIDO2 hardware keys alongside strong passphrases.",
          "Disabling MFA during remote off-site access to minimize employee login friction.",
        ],
        correctIndex: 2,
        explanation: "Control A.8.5 requires strong authentication technologies such as MFA to prevent unauthorized access via stolen or guessed credentials.",
      },
      {
        id: 3,
        question: "When an employee suspects unauthorized access, anomalous data egress, or a system breach, what does ISO 27001 Control A.5.24 require?",
        criteria: "Security Incident Notification & Evidence Preservation (Control A.5.24)",
        options: [
          "Attempt to counter-hack the attacker IP address before notifying anyone.",
          "Immediately report the event through official security incident channels to CSIRT / IT Security without tampering with log evidence.",
          "Delete local operating system logs and format the endpoint drive immediately.",
          "Post details on public social networks to solicit community remediation advice.",
        ],
        correctIndex: 1,
        explanation: "Control A.5.24 dictates timely reporting of suspected information security events through established reporting channels while preserving forensic evidence.",
      },
    ],
  },
  {
    id: "phishing",
    title: "Phishing Awareness & Social Engineering Defense",
    category: "Threat Recognition & Social Engineering",
    passingScore: 66,
    criteria: "NIST Phishing Simulation Framework & Business Email Compromise (BEC) Defense",
    description: "Assesses employee ability to detect spear-phishing lures, identify domain spoofing techniques, and halt physical social engineering attempts.",
    questions: [
      {
        id: 1,
        question: "You receive an email appearing to come from the CEO marked 'EXTREMELY URGENT: Wire $85,000 to new vendor within 30 minutes, do not call me'. How must you respond?",
        criteria: "Executive Impersonation & BEC Defense",
        options: [
          "Process the payment immediately since it claims to be authorized directly by executive leadership.",
          "Verify the request out-of-band using an established, official company phone number or in-person channel, and alert IT Security.",
          "Reply to the email asking for confirmation of the vendor's routing number.",
          "Forward the email to the entire company distribution list asking if anyone recognizes the vendor.",
        ],
        correctIndex: 1,
        explanation: "Business Email Compromise (BEC) exploits artificial urgency and fear. All unusual financial transactions must undergo independent out-of-band verification.",
      },
      {
        id: 2,
        question: "Which of the following email indicators represents the STRONGEST sign of a credential harvesting phishing campaign?",
        criteria: "Hyperlink Destination & Domain Spoofing Recognition",
        options: [
          "The email is digitally signed with an internal corporate S/MIME certificate.",
          "The sender domain has minor typos (e.g. '@micros0ft-support.co'), uses generic greetings ('Dear User'), and hyperlinks to an unfamiliar external login portal.",
          "The email is sent from the internal HR ticketing system confirming an approved time-off request.",
          "The email contains plain text meeting minutes without any attached links or files.",
        ],
        correctIndex: 1,
        explanation: "Typosquatting domains, generic greetings, and deceptive hyperlinks pointing to credential harvesting landing pages are primary phishing indicators.",
      },
      {
        id: 3,
        question: "An unknown person in delivery attire carrying packages asks you to hold open the badge-protected secure office turnstile so they can enter without scanning. What is this security threat?",
        criteria: "Physical Security & Tailgating Prevention (ISO Control A.7.2)",
        options: [
          "Tailgating / Piggybacking (Physical Social Engineering).",
          "Cross-Site Scripting (XSS).",
          "Denial of Service (DoS).",
          "ARP Spoofing.",
        ],
        correctIndex: 0,
        explanation: "Tailgating/piggybacking exploits human courtesy to bypass physical access perimeters. All visitors must be escorted and badged at reception.",
      },
    ],
  },
  {
    id: "dataprivacy",
    title: "Data Privacy, Clean Desk & DPDP Act 2023 Compliance",
    category: "Regulatory Data Privacy",
    passingScore: 66,
    criteria: "DPDP Act 2023 (Sections 6, 8, 11) & ISO/IEC 27001:2022 Control A.7.7 (Clean Desk)",
    description: "Evaluates handling protocols for Digital Personal Data (PII), clean desk standards, and statutory breach notification mandates under the DPDP Act 2023.",
    questions: [
      {
        id: 1,
        question: "Under ISO 27001 Control A.7.7 ('Clean Desk & Clear Screen'), what must personnel do before leaving their workstation unattended?",
        criteria: "Clean Desk & Clear Screen Safeguards (Control A.7.7)",
        options: [
          "Leave spreadsheets open so colleagues can review progress while you are away.",
          "Lock computer screens (e.g. Win+L or Cmd+Ctrl+Q) and stow confidential physical documents in locked drawers.",
          "Turn off the office overhead lights while leaving workstation monitors awake.",
          "Share workstation passwords with desk neighbors to allow remote unlocking.",
        ],
        correctIndex: 1,
        explanation: "Control A.7.7 requires locking screens and securing sensitive physical paperwork in locked storage to prevent unauthorized visual or physical access.",
      },
      {
        id: 2,
        question: "Under Section 8(6) of India's DPDP Act 2023 (Digital Personal Data Protection Act), what is the mandatory statutory obligation of a Data Fiduciary upon discovering a personal data breach?",
        criteria: "Statutory Breach Disclosure Obligations (DPDP Act 2023 Sec 8(6))",
        options: [
          "Covertly patch systems and notify no external entities.",
          "Promptly notify the Data Protection Board of India (DPBI) and each affected Data Principal in the prescribed form.",
          "Wait until annual statutory tax filing before acknowledging the incident.",
          "Issue notifications only if financial loss exceeds ₹50 Crores.",
        ],
        correctIndex: 1,
        explanation: "Section 8(6) of the DPDP Act 2023 mandates that Data Fiduciaries must give intimation of any personal data breach to the Data Protection Board of India and each affected Data Principal.",
      },
      {
        id: 3,
        question: "Under enterprise Data Classification standards and Section 8(5) of the DPDP Act 2023, which category of information requires reasonable technical safeguards, encryption at rest/transit, and role-based access restrictions?",
        criteria: "PII & Confidential Data Protection (DPDP Act 2023 Sec 8(5))",
        options: [
          "Public marketing brochures published on the corporate website.",
          "Restricted / Confidential data, including customer digital personal data (PII), financial records, and cryptographic keys.",
          "Internal weekly cafeteria lunch schedules.",
          "Public press releases approved for media distribution.",
        ],
        correctIndex: 1,
        explanation: "Digital personal data requires multi-layer defense, encryption at rest/transit, and reasonable security safeguards under Section 8(5) of the DPDP Act 2023.",
      },
    ],
  },
  {
    id: "businesscontinuity",
    title: "Business Continuity & Disaster Resilience (ISO 22301)",
    category: "Operational Resilience",
    passingScore: 66,
    criteria: "ISO 22301:2019 Clauses 8.2, 8.4, 8.5 & ISO/IEC 27001:2022 Control A.8.14 (Redundancy)",
    description: "Evaluates comprehension of Recovery Time Objectives (RTO), Business Impact Analysis (BIA), and emergency disaster recovery failover procedures.",
    questions: [
      {
        id: 1,
        question: "In Business Continuity Management (ISO 22301 Clause 8.2), what does the Recovery Time Objective (RTO) specify?",
        criteria: "Continuity Target Metrics (ISO 22301 Clause 8.2)",
        options: [
          "The maximum targeted duration of time within which a critical system or business process must be restored following an outage.",
          "The physical distance between primary and secondary cloud data centers.",
          "The total count of backup tapes stored in offline bank lockers.",
          "The overtime compensation rate paid to disaster recovery engineers.",
        ],
        correctIndex: 0,
        explanation: "RTO defines the maximum acceptable downtime period after a disruption before catastrophic operational or statutory damage occurs.",
      },
      {
        id: 2,
        question: "Under ISO 22301 Clause 8.5, why are regular Business Continuity & DR simulation exercises mandatory?",
        criteria: "Disaster Recovery Testing & Verification (ISO 22301 Clause 8.5)",
        options: [
          "Solely to satisfy marketing claims on sales brochures.",
          "To validate that recovery runbooks, failover automation, and personnel roles function effectively under crisis conditions.",
          "To exhaust unspent quarterly department budgets.",
          "To test if building smoke alarms emit audio tones.",
        ],
        correctIndex: 1,
        explanation: "Simulated tabletop exercises and failover drills validate that documented procedures successfully restore critical systems within targeted RTO/RPO limits.",
      },
      {
        id: 3,
        question: "Under ISO 22301 Clause 8.4 and ISO/IEC 27001 Control A.8.14, what is the required safeguard for critical data backup redundancy?",
        criteria: "Backup Redundancy & Cold Storage Safeguards",
        options: [
          "Store backups on the same production partition for faster extraction.",
          "Maintain isolated, immutable, geographically separated offsite or air-gapped backups with periodic test restorations.",
          "Only take database snapshots once every two years.",
          "Disable cryptographic validation on backup archives to conserve CPU.",
        ],
        correctIndex: 1,
        explanation: "Immutable, geographically distributed backups safeguard against ransomware attacks and catastrophic datacenter failures, ensuring reliable recovery.",
      },
    ],
  },
];

// =============================================================================
// DETERMINISTIC EVALUATION ENGINE
// =============================================================================

export const evaluateQuizAnswers = (module, answersMap, employeeName = "Employee") => {
  const questions = module.questions;
  let correctCount = 0;
  const breakdown = [];

  questions.forEach((q, idx) => {
    const selectedAnswer = answersMap[q.id];
    const isCorrect = selectedAnswer === q.correctIndex;
    if (isCorrect) correctCount += 1;

    breakdown.push({
      questionNumber: idx + 1,
      questionText: q.question,
      criteria: q.criteria,
      selectedOptionIndex: selectedAnswer,
      selectedOptionText: selectedAnswer !== undefined ? q.options[selectedAnswer] : "No answer selected",
      correctOptionIndex: q.correctIndex,
      correctOptionText: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation,
    });
  });

  const total = questions.length;
  // Calculate percentage: 3/3 = 100%, 2/3 = 67%, 1/3 = 33%, 0/3 = 0%
  const score = Math.round((correctCount / total) * 100);
  const result = score >= module.passingScore ? "Pass" : "Fail";
  const timestamp = new Date().toISOString();
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Generate Granular Auditor Remarks with Criteria Breakdown
  let remarksSummary = "";
  if (result === "Pass") {
    remarksSummary = `Evaluated via ${module.title}. Score: ${score}% (${correctCount}/${total} correct). Demonstrated strong competency in ${module.criteria}. Verified passing outcome under compliance audit criteria. Completed: ${formattedDate}.`;
  } else {
    const failedCriteria = breakdown
      .filter((b) => !b.isCorrect)
      .map((b) => b.criteria)
      .join(", ");
    remarksSummary = `Evaluated via ${module.title}. Score: ${score}% (${correctCount}/${total} correct). FAILED passing threshold (${module.passingScore}%). Critical knowledge gap identified in: ${failedCriteria}. Remedial refresher training required within 7 days. Evaluated: ${formattedDate}.`;
  }

  return {
    score,
    result,
    correctCount,
    totalQuestions: total,
    breakdown,
    timestamp,
    remarksSummary,
    moduleTitle: module.title,
    criteria: module.criteria,
  };
};
