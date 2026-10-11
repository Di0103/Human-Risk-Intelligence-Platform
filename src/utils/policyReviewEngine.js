/**
 * ARMOUR Policy Review, Scoring & Suggestions Engine
 * Evaluates policy documents across 5 pillars:
 * 1. Scope & Purpose Completeness (20 pts)
 * 2. RACI Governance & Accountability (20 pts)
 * 3. Multi-Framework & Statutory Alignment (20 pts)
 * 4. Maintenance & Review Lifecycle (20 pts)
 * 5. Enforcement, Penalties & Remediation (20 pts)
 */

export function analyzePolicyDocument(rawText = "") {
  const text = String(rawText || "").trim();
  const lower = text.toLowerCase();

  if (!text || text.length < 20) {
    return {
      score: 0,
      grade: "Class D",
      gradeLabel: "Unrated / Draft",
      gradeColor: "text-red-400",
      badgeBg: "bg-red-500/20 border-red-500/40",
      breakdown: {
        purposeAndScope: 0,
        raciGovernance: 0,
        statutoryAlignment: 0,
        reviewLifecycle: 0,
        enforcementAndPenalties: 0,
      },
      strengths: [],
      recommendations: [
        {
          id: "rec_empty",
          category: "General",
          severity: "high",
          issue: "Document text is empty or too brief for governance evaluation.",
          recommendation: "Paste or draft a comprehensive policy document containing purpose, scope, roles, controls, and review terms.",
          suggestedClause: "1. PURPOSE & SCOPE\nThis policy establishes mandatory operational safeguards across all workforce members...",
          pointsPotential: 25,
        },
      ],
    };
  }

  // -------------------------------------------------------------
  // PILLAR 1: Scope & Purpose Completeness (20 pts)
  // -------------------------------------------------------------
  let purposeScore = 0;
  const hasPurpose = /(purpose|objective|goal|rationale|intent|background)/i.test(lower);
  const hasScope = /(scope|applicability|applies to|covered persons|workforce|departments|third-party)/i.test(lower);
  const hasMetadata = /(version|effective date|policy id|classification|confidential|status)/i.test(lower);

  if (hasPurpose) purposeScore += 8;
  if (hasScope) purposeScore += 8;
  if (hasMetadata) purposeScore += 4;
  purposeScore = Math.min(20, purposeScore);

  // -------------------------------------------------------------
  // PILLAR 2: RACI Governance & Accountability (20 pts)
  // -------------------------------------------------------------
  let raciScore = 0;
  const hasResponsible = /(responsible|duties|sysadmin|devops|administrator|it team|operations team)/i.test(lower);
  const hasAccountable = /(accountable|ciso|cto|cro|dpo|head of it|executive committee|board of directors|general counsel)/i.test(lower);
  const hasConsultedInformed = /(consulted|informed|all employees|stakeholders|staff notification|hr director|legal counsel)/i.test(lower) || /raci/i.test(lower);

  if (hasResponsible) raciScore += 6;
  if (hasAccountable) raciScore += 8;
  if (hasConsultedInformed) raciScore += 6;
  raciScore = Math.min(20, raciScore);

  // -------------------------------------------------------------
  // PILLAR 3: Statutory & Framework Alignment (20 pts)
  // -------------------------------------------------------------
  let statutoryScore = 0;
  const hasIso27001 = /(iso\s*27001|iso\/iec\s*27001|control a\.|annex a|isms|access control|least privilege|mfa|password)/i.test(lower);
  const hasDpdp = /(dpdp|data protection|personal data|data principal|data fiduciary|privacy|consent|cert-in|breach notification)/i.test(lower);
  const hasIso22301 = /(iso\s*22301|business continuity|bcp|disaster recovery|rto|rpo|resilience|tabletop|failover)/i.test(lower);

  if (hasIso27001) statutoryScore += 8;
  if (hasDpdp) statutoryScore += 6;
  if (hasIso22301) statutoryScore += 6;
  statutoryScore = Math.min(20, statutoryScore);

  // -------------------------------------------------------------
  // PILLAR 4: Maintenance, Review Lifecycle & Versioning (20 pts)
  // -------------------------------------------------------------
  let reviewScore = 0;
  const hasReviewCycle = /(review cycle|annual review|annually|quarterly|periodic review|every 12 months|re-evaluation)/i.test(lower);
  const hasChangeLog = /(revision|changelog|approved by|change history|version history|amendment)/i.test(lower);

  if (hasReviewCycle) reviewScore += 10;
  if (hasChangeLog) reviewScore += 10;
  reviewScore = Math.min(20, reviewScore);

  // -------------------------------------------------------------
  // PILLAR 5: Enforcement, Penalties & Disciplinary Actions (20 pts)
  // -------------------------------------------------------------
  let enforcementScore = 0;
  const hasPenalties = /(penalty|penalties|disciplinary action|termination|breach of contract|non-compliance|sanction|it act)/i.test(lower);
  const hasReportingExceptions = /(exception|waiver|report violations|escalation|incident reporting|whistleblower)/i.test(lower);

  if (hasPenalties) enforcementScore += 12;
  if (hasReportingExceptions) enforcementScore += 8;
  enforcementScore = Math.min(20, enforcementScore);

  // -------------------------------------------------------------
  // FINAL SCORE & RECOMMENDATIONS COMPILATION
  // -------------------------------------------------------------
  const totalScore = Math.min(
    100,
    Math.round(purposeScore + raciScore + statutoryScore + reviewScore + enforcementScore)
  );

  let grade = "Class A+";
  let gradeLabel = "Audit-Proof Enterprise Ready";
  let gradeColor = "text-emerald-400";
  let badgeBg = "bg-emerald-500/20 border-emerald-500/40";

  if (totalScore < 50) {
    grade = "Class D";
    gradeLabel = "High Non-Compliance Risk";
    gradeColor = "text-rose-400";
    badgeBg = "bg-rose-500/20 border-rose-500/40";
  } else if (totalScore < 75) {
    grade = "Class C";
    gradeLabel = "Partial Governance (Material Gaps)";
    gradeColor = "text-amber-400";
    badgeBg = "bg-amber-500/20 border-amber-500/40";
  } else if (totalScore < 90) {
    grade = "Class B";
    gradeLabel = "Substantially Compliant";
    gradeColor = "text-blue-400";
    badgeBg = "bg-blue-500/20 border-blue-500/40";
  }

  const strengths = [];
  const recommendations = [];

  // Pillar 1 Feedback
  if (hasPurpose && hasScope) {
    strengths.push("Clear organizational purpose and well-defined applicability scope.");
  } else {
    recommendations.push({
      id: "rec_scope",
      category: "Purpose & Scope",
      severity: "high",
      issue: "Missing formal Executive Statement of Purpose or Organizational Scope boundaries.",
      recommendation: "Explicitly declare the strategic intent of the policy and whether it covers all employees, remote workers, subsidiaries, and third-party vendors.",
      suggestedClause: "1. PURPOSE & SCOPE\nThis policy defines mandatory requirements for protecting enterprise data assets. It applies universally across all full-time employees, contractors, remote personnel, and vendors accessing enterprise information systems.",
      pointsPotential: 8,
    });
  }

  // Pillar 2 Feedback
  if (hasAccountable && hasResponsible) {
    strengths.push("Explicit RACI governance structure identifying both Accountable executives and Responsible teams.");
  } else if (!hasAccountable) {
    recommendations.push({
      id: "rec_raci_accountable",
      category: "RACI Governance",
      severity: "high",
      issue: "Lack of RACI Governance: No designated Accountable executive (e.g. CISO, CTO, or DPO) who bears legal responsibility for policy oversight.",
      recommendation: "Assign ultimate accountability to a designated leadership role (e.g. CISO / Alex Turner) to ensure ISO 27001 leadership commitment.",
      suggestedClause: "4. RACI ACCOUNTABILITY\n- Accountable (A): Chief Information Security Officer (CISO)\n- Responsible (R): IT Security & Systems Administration Team\n- Consulted (C): Legal Counsel & Data Protection Officer\n- Informed (I): All Workforce Members",
      pointsPotential: 8,
    });
  } else {
    recommendations.push({
      id: "rec_raci_responsible",
      category: "RACI Governance",
      severity: "medium",
      issue: "Unclear operational execution: Specify who is Responsible for day-to-day policy enforcement.",
      recommendation: "Clarify the specific team (e.g. DevOps, Endpoint Engineering, Helpdesk) charged with operating controls.",
      suggestedClause: "- Responsible (R): Systems Engineering and Information Security Operations Team.",
      pointsPotential: 6,
    });
  }

  // Pillar 3 Feedback
  if (hasIso27001 && hasDpdp) {
    strengths.push("Strong multi-framework statutory cross-walk aligned with ISO 27001:2022 and DPDP Act 2023.");
  } else {
    if (!hasIso27001) {
      recommendations.push({
        id: "rec_iso27001",
        category: "Framework Alignment",
        severity: "medium",
        issue: "Missing ISO/IEC 27001:2022 control mapping references.",
        recommendation: "Incorporate explicit references to ISO 27001:2022 controls (e.g., Control A.5.15 Access Control, A.8.5 Secure Authentication) for regulatory audit compliance.",
        suggestedClause: "5.1. ACCESS CONTROL MANDATES (ISO 27001:2022 Control A.5.15 & A.8.5)\nAll users must be authenticated via mandatory multi-factor authentication (MFA). Accounts must be locked after 15 minutes of inactivity.",
        pointsPotential: 8,
      });
    }
    if (!hasDpdp) {
      recommendations.push({
        id: "rec_dpdp",
        category: "Privacy & Data Protection",
        severity: "high",
        issue: "No DPDP Act 2023 Provisions: Lacking Purpose Limitation, 72-hour Data Principal Rights fulfillment, and regulatory breach notification timeline.",
        recommendation: "Incorporate mandatory Digital Personal Data Protection obligations to avoid regulatory non-compliance penalties under the DPDP Act 2023.",
        suggestedClause: "5.2. DPDP ACT 2023 COMPLIANCE MANDATES\nPersonal data must strictly be collected for stated, consented purposes. Data Principal requests (access, correction, erasure) shall be processed within 72 hours. Security breaches must be intimated to CERT-In within 6 hours and the Data Protection Board of India (DPBI) promptly.",
        pointsPotential: 6,
      });
    }
  }

  if (!hasIso22301) {
    recommendations.push({
      id: "rec_iso22301",
      category: "Business Continuity",
      severity: "low",
      issue: "Missing Business Continuity & Disaster Resilience thresholds (ISO 22301).",
      recommendation: "Establish quantifiable Recovery Time Objectives (RTO < 4 hrs) and Recovery Point Objectives (RPO < 1 hr) to satisfy organizational continuity standards.",
      suggestedClause: "5.3. RESILIENCE MANDATES (ISO 22301:2019)\nCritical systems must adhere to a Recovery Time Objective (RTO) of less than 4 hours and a Recovery Point Objective (RPO) of under 1 hour. Air-gapped immutable backups must be verified monthly.",
      pointsPotential: 6,
    });
  }

  // Pillar 4 Feedback
  if (hasReviewCycle) {
    strengths.push("Enforced review cycle frequency ensuring policy freshness and audit readiness.");
  } else {
    recommendations.push({
      id: "rec_review_cycle",
      category: "Review Lifecycle",
      severity: "high",
      issue: "Missing Mandatory Review Cycle: ISO 27001 Clause 5.2 mandates formal policy review at least annually.",
      recommendation: "Add an explicit review schedule clause specifying annual re-evaluation or event-driven re-assessment.",
      suggestedClause: "6. MAINTENANCE & REVIEW SCHEDULE\nIn compliance with ISO 27001 Clause 5.2, this policy document shall be formally reviewed and approved by the CISO at least annually (every 12 months), or immediately following major technology or structural changes.",
      pointsPotential: 10,
    });
  }

  // Pillar 5 Feedback
  if (hasPenalties) {
    strengths.push("Robust disciplinary consequences and statutory penalty enforcement clauses.");
  } else {
    recommendations.push({
      id: "rec_penalties",
      category: "Enforcement & Penalties",
      severity: "high",
      issue: "Insufficient Disciplinary Enforcement & Penalty Clause.",
      recommendation: "Specify that policy non-compliance is subject to formal disciplinary action (up to termination) and statutory prosecution under the IT Act 2000 and DPDP Act 2023.",
      suggestedClause: "7. ENFORCEMENT & NON-COMPLIANCE PENALTIES\nAdherence to this policy is mandatory. Any employee or contractor who willfully breaches these provisions shall be subject to disciplinary action, including immediate termination of employment, revocation of access privileges, and legal liability under the Information Technology Act 2000 (Section 43A, 72A) and DPDP Act 2023.",
      pointsPotential: 12,
    });
  }

  return {
    score: totalScore,
    grade,
    gradeLabel,
    gradeColor,
    badgeBg,
    breakdown: {
      purposeAndScope: purposeScore,
      raciGovernance: raciScore,
      statutoryAlignment: statutoryScore,
      reviewLifecycle: reviewScore,
      enforcementAndPenalties: enforcementScore,
    },
    strengths,
    recommendations,
  };
}

/**
 * Appends standard remediation clauses to existing policy text to instantly fix detected gaps.
 * @param {string} currentText 
 * @param {Array} recommendations 
 * @returns {string} Remediated policy text
 */
export function applyPolicyRemediations(currentText = "", recommendations = []) {
  if (!recommendations || recommendations.length === 0) return currentText;

  let remediated = currentText.trim();
  const clausesToAdd = [];

  recommendations.forEach((rec) => {
    if (rec.suggestedClause && !remediated.includes(rec.suggestedClause)) {
      clausesToAdd.push(`\n\n/* --- REMEDIATION ADDED FOR: ${rec.category} --- */\n${rec.suggestedClause}`);
    }
  });

  return remediated + clausesToAdd.join("");
}
