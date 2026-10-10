import { localStorageDb, DEFAULT_USERS } from "../utils/localStorageDb";

const SESSION_KEY = "grc_session";
const OTP_CHALLENGE_KEY = "grc_otp_challenge";

// Validate standard email format (supports corporate, personal, disposable, etc.)
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

// Generate deterministic browser / device fingerprint
export const getBrowserFingerprint = () => {
  if (typeof window === "undefined") return "server-env";
  const userAgent = navigator.userAgent || "unknown-ua";
  const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const tz = Intl?.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  return btoa(`${userAgent}::${screenRes}::${tz}`).slice(0, 32);
};

// Generate 6-Digit OTP challenge
export const requestOtp = async (email) => {
  const cleanEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return {
      data: null,
      error: {
        message: "Please provide a valid email format (e.g., name@company.com or name@gmail.com).",
      },
    };
  }

  // 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const challenge = {
    email: cleanEmail,
    code,
    expiresAt,
    attempts: 0,
    fingerprint: getBrowserFingerprint(),
    createdAt: new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(OTP_CHALLENGE_KEY, JSON.stringify(challenge));
  } catch (e) {
    window.localStorage.setItem(OTP_CHALLENGE_KEY, JSON.stringify(challenge));
  }

  localStorageDb.logAudit({
    action: "AUTH_OTP_REQUESTED",
    category: "Authentication",
    entity: "Session",
    details: `Generated 6-digit verification code challenge for ${cleanEmail}`,
    actor: cleanEmail,
    severity: "info",
  });

  return {
    data: {
      email: cleanEmail,
      code,
      expiresAt,
    },
    error: null,
  };
};

// Verify OTP & Authenticate Session
export const verifyOtp = async (email, inputCode, metadata = {}) => {
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanCode = String(inputCode).trim();

  let rawChallenge = null;
  try {
    rawChallenge =
      window.sessionStorage.getItem(OTP_CHALLENGE_KEY) ||
      window.localStorage.getItem(OTP_CHALLENGE_KEY);
  } catch (e) {}

  if (!rawChallenge) {
    return {
      data: null,
      error: { message: "No active verification challenge found. Please request a new code." },
    };
  }

  let challenge;
  try {
    challenge = JSON.parse(rawChallenge);
  } catch (e) {
    return {
      data: null,
      error: { message: "Corrupted verification challenge. Please request a new code." },
    };
  }

  if (challenge.email !== cleanEmail) {
    return {
      data: null,
      error: { message: "Email mismatch for this verification challenge." },
    };
  }

  // Check expiration
  if (Date.now() > challenge.expiresAt) {
    return {
      data: null,
      error: {
        message: "Verification code has expired (5 minute validity). Please request a fresh code.",
      },
    };
  }

  // Check brute force attempts
  if (challenge.attempts >= 3) {
    localStorageDb.triggerSecurityAutoWipe(
      "Brute Force Detection: 3 consecutive failed OTP verification attempts."
    );
    return {
      data: null,
      error: {
        message:
          "SECURITY LOCKOUT: Too many failed verification attempts. Emergency auto-wipe triggered to safeguard organizational data.",
        lockout: true,
      },
    };
  }

  // Validate Code
  if (challenge.code !== cleanCode) {
    challenge.attempts += 1;
    try {
      window.sessionStorage.setItem(OTP_CHALLENGE_KEY, JSON.stringify(challenge));
      window.localStorage.setItem(OTP_CHALLENGE_KEY, JSON.stringify(challenge));
    } catch (e) {}

    const remaining = 3 - challenge.attempts;
    localStorageDb.logAudit({
      action: "AUTH_OTP_FAILED",
      category: "Authentication",
      entity: "Identity",
      details: `Failed OTP attempt for ${cleanEmail}. ${remaining} attempts remaining before auto-wipe.`,
      actor: cleanEmail,
      severity: "warning",
    });

    if (remaining <= 0) {
      localStorageDb.triggerSecurityAutoWipe(
        "Brute Force Detection: Maximum failed OTP attempts exceeded."
      );
      return {
        data: null,
        error: {
          message:
            "SECURITY LOCKOUT TRIGGERED: Maximum failed attempts exceeded. Local GRC records automatically wiped.",
          lockout: true,
        },
      };
    }

    return {
      data: null,
      error: {
        message: `Invalid verification code. ${remaining} attempt${
          remaining === 1 ? "" : "s"
        } remaining before emergency security auto-wipe.`,
      },
    };
  }

  // Verification Succeeded: Clear challenge & security lockout
  try {
    window.sessionStorage.removeItem(OTP_CHALLENGE_KEY);
    window.localStorage.removeItem(OTP_CHALLENGE_KEY);
  } catch (e) {}
  localStorageDb.clearSecurityLockout();

  // Find or Create User
  const users = localStorageDb.get("users");
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: metadata.fullName || cleanEmail.split("@")[0].replace(/[._]/g, " "),
      role: metadata.role || "admin",
      created_at: new Date().toISOString(),
    };
    localStorageDb.insert("users", user);
  } else if (metadata.role && user.role !== metadata.role) {
    user.role = metadata.role;
    localStorageDb.update("users", user.id, { role: metadata.role });
  }

  const fingerprint = getBrowserFingerprint();
  const sessionToken = `sec_jwt_${btoa(
    JSON.stringify({
      uid: user.id,
      email: user.email,
      role: user.role,
      fp: fingerprint,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
  )}`;

  const session = {
    user,
    access_token: sessionToken,
    fingerprint,
    created_at: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  localStorageDb.logAudit({
    action: "AUTH_LOGIN_SUCCESS",
    category: "Authentication",
    entity: "Session",
    details: `User verified OTP and established session (Role: ${user.role})`,
    actor: user.email,
    severity: "info",
  });

  return { data: { user, session }, error: null };
};

// Register a new user
export const signUp = async (name, email, password, role = "admin") => {
  const cleanEmail = String(email).trim().toLowerCase();
  const users = localStorageDb.get("users");
  let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

  const newUser = existing || {
    id: `usr-${Date.now()}`,
    email: cleanEmail,
    full_name: name || cleanEmail.split("@")[0].replace(/[._]/g, " "),
    role: role || "admin",
    created_at: new Date().toISOString(),
  };

  if (!existing) {
    localStorageDb.insert("users", newUser);
  }

  const fingerprint = getBrowserFingerprint();
  const session = {
    user: newUser,
    access_token: `sec_jwt_${Date.now()}`,
    fingerprint,
    created_at: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { data: { user: newUser, session }, error: null };
};

// Login existing user
export const signIn = async (email, password) => {
  const cleanEmail = String(email).trim().toLowerCase();
  const users = localStorageDb.get("users");
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: cleanEmail.split("@")[0].replace(/[._]/g, " "),
      role: "admin",
      created_at: new Date().toISOString(),
    };
    localStorageDb.insert("users", user);
  }

  const fingerprint = getBrowserFingerprint();
  const session = {
    user,
    access_token: `sec_jwt_${Date.now()}`,
    fingerprint,
    created_at: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { data: { user, session }, error: null };
};

// Logout current user
export const signOut = async () => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const actor = parsed?.user?.email || "User";
    localStorageDb.logAudit({
      action: "AUTH_LOGOUT",
      category: "Authentication",
      entity: "Session",
      details: "User terminated session and signed out",
      actor,
      severity: "info",
    });
  } catch (e) {}

  window.localStorage.removeItem(SESSION_KEY);
  return { error: null };
};

// Validate Session Integrity (Detects session hijacking or device handover)
export const validateSessionIntegrity = () => {
  if (typeof window === "undefined") return { valid: true };
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return { valid: false };
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || !parsed?.user) return { valid: false };

    // Fingerprint verification
    const currentFp = getBrowserFingerprint();
    if (parsed.fingerprint && parsed.fingerprint !== currentFp) {
      // Fingerprint anomaly detected! Multi-device handover or session hijack signature
      localStorageDb.logAudit({
        action: "AUTH_SESSION_HIJACK_DETECTED",
        category: "System Security",
        entity: "Security Watcher",
        details: "Browser fingerprint mismatch detected! Emergency security auto-wipe triggered.",
        actor: "Security Watcher",
        severity: "critical",
      });
      localStorageDb.triggerSecurityAutoWipe(
        "Multi-Device Session Anomaly / Fingerprint Mismatch Detected"
      );
      return { valid: false, hijacked: true };
    }

    return { valid: true, user: parsed.user, session: parsed };
  } catch (e) {
    return { valid: false };
  }
};

// Get logged-in user
export const getCurrentUser = async () => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || null;
  } catch (e) {
    return null;
  }
};