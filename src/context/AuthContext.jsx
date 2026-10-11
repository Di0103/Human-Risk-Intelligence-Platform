import React, { createContext, useContext, useEffect, useState } from "react";
import { localStorageDb, DEFAULT_USERS } from "../utils/localStorageDb";
import {
  requestOtp as serviceRequestOtp,
  verifyOtp as serviceVerifyOtp,
  validateSessionIntegrity,
  signOut as serviceSignOut,
} from "../services/authService";

const SESSION_KEY = "grc_session";

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  loading: true,
  securityLockout: null,
  requestOtp: async () => {},
  verifyOtp: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  triggerEmergencyAutoWipe: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [securityLockout, setSecurityLockout] = useState(() => localStorageDb.getSecurityLockout());

  // Initialize Auth State from LocalStorage
  useEffect(() => {
    const syncAuthState = () => {
      try {
        const integrity = validateSessionIntegrity();
        if (integrity.valid && integrity.user && integrity.session) {
          setUser(integrity.user);
          setSession(integrity.session);
          setProfile({
            id: integrity.user.id,
            email: integrity.user.email,
            full_name:
              integrity.user.user_metadata?.full_name ||
              integrity.user.full_name ||
              integrity.user.email.split("@")[0],
            role:
              integrity.user.user_metadata?.role ||
              integrity.user.role ||
              "admin",
          });
        } else {
          // Strictly wipe unauthenticated, corrupt, or expired sessions
          window.localStorage.removeItem(SESSION_KEY);
          try {
            window.sessionStorage.removeItem("grc_otp_challenge");
            window.localStorage.removeItem("grc_otp_challenge");
          } catch (err) {}
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (e) {
        console.warn("Failed to validate local auth session:", e);
        try {
          window.localStorage.removeItem(SESSION_KEY);
        } catch (err) {}
        setUser(null);
        setSession(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    syncAuthState();

    // Cross-tab synchronization via native 'storage' event
    const handleStorageChange = (e) => {
      if (e.key === SESSION_KEY) {
        syncAuthState();
      }
    };

    // Instant intra-page session update listener
    const handleAuthStateChange = (e) => {
      if (!e.detail?.session) {
        setUser(null);
        setSession(null);
        setProfile(null);
      } else {
        syncAuthState();
      }
    };

    // Periodic heartbeat (every 30s) to enforce expiration and integrity
    const heartbeatInterval = setInterval(() => {
      const integrity = validateSessionIntegrity();
      if (!integrity.valid) {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    }, 30000);

    // Security Alert & Auto-Wipe Listener
    const handleSecurityAlert = (e) => {
      const lockoutData = e.detail || localStorageDb.getSecurityLockout();
      setSecurityLockout(lockoutData);
      setUser(null);
      setProfile(null);
      setSession(null);
      try {
        window.localStorage.removeItem(SESSION_KEY);
      } catch (err) {}
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("grc-auth-state-change", handleAuthStateChange);
    window.addEventListener("grc-security-alert", handleSecurityAlert);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("grc-auth-state-change", handleAuthStateChange);
      window.removeEventListener("grc-security-alert", handleSecurityAlert);
    };
  }, []);

  // Request OTP for Email
  const requestOtp = async (email) => {
    return await serviceRequestOtp(email);
  };

  // Verify OTP and Authenticate
  const verifyOtp = async (email, code, metadata = {}) => {
    setLoading(true);
    try {
      const res = await serviceVerifyOtp(email, code, metadata);
      if (res.error) {
        if (res.error.lockout) {
          setSecurityLockout(localStorageDb.getSecurityLockout());
        }
        return res;
      }

      if (res.data?.user) {
        setUser(res.data.user);
        setSession(res.data.session);
        setProfile({
          id: res.data.user.id,
          email: res.data.user.email,
          full_name:
            res.data.user.user_metadata?.full_name ||
            res.data.user.full_name ||
            metadata.fullName ||
            res.data.user.email.split("@")[0],
          role:
            res.data.user.user_metadata?.role ||
            res.data.user.role ||
            metadata.role ||
            "admin",
        });
        setSecurityLockout(null);
      }

      return res;
    } finally {
      setLoading(false);
    }
  };

  // Direct Login with Email & Password (or quick login)
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = String(email).trim().toLowerCase();
      const users = localStorageDb.get("users");
      let matched = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!matched) {
        matched = {
          id: `usr-${Date.now()}`,
          email: cleanEmail,
          full_name: cleanEmail.split("@")[0].replace(/[._]/g, " "),
          role: "admin",
          created_at: new Date().toISOString(),
        };
        localStorageDb.insert("users", matched);
      }

      const activeUser = {
        id: matched.id,
        email: matched.email,
        user_metadata: {
          full_name: matched.full_name,
          role: matched.role || "admin",
        },
        created_at: matched.created_at || new Date().toISOString(),
      };

      const newSession = {
        user: activeUser,
        access_token: `sec_jwt_${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setUser(activeUser);
      setSession(newSession);
      setProfile({
        id: matched.id,
        email: matched.email,
        full_name: matched.full_name,
        role: matched.role || "admin",
      });
      setSecurityLockout(null);

      return { data: { user: activeUser, session: newSession }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Direct Sign Up with Email, Password, Full Name, and RBAC Role
  const signupWithEmail = async (email, password, fullName, role = "admin") => {
    setLoading(true);
    try {
      const cleanEmail = String(email).trim().toLowerCase();
      const newUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        full_name: fullName,
        role: role || "admin",
        created_at: new Date().toISOString(),
      };

      localStorageDb.insert("users", newUser);

      const activeUser = {
        id: newUser.id,
        email: newUser.email,
        user_metadata: {
          full_name: fullName,
          role: role || "admin",
        },
        created_at: newUser.created_at,
      };

      const newSession = {
        user: activeUser,
        access_token: `sec_jwt_${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setUser(activeUser);
      setSession(newSession);
      setProfile({
        id: newUser.id,
        email: newUser.email,
        full_name: fullName,
        role: role || "admin",
      });
      setSecurityLockout(null);

      return { data: { user: activeUser, session: newSession }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Simulation
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const googleUser = {
        id: "usr-google-demo",
        email: "alex.turner@enterprise-cloud.com",
        user_metadata: {
          full_name: "Alex Turner (Google SSO)",
          role: "admin",
        },
        created_at: new Date().toISOString(),
      };

      const newSession = {
        user: googleUser,
        access_token: `sec_jwt_google_${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      setUser(googleUser);
      setSession(newSession);
      setProfile({
        id: googleUser.id,
        email: googleUser.email,
        full_name: googleUser.user_metadata.full_name,
        role: "admin",
      });
      setSecurityLockout(null);

      return { data: { user: googleUser, session: newSession }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout & Strict Storage Cleansing
  const logout = async () => {
    setLoading(true);
    try {
      await serviceSignOut();
      window.localStorage.removeItem(SESSION_KEY);
      try {
        window.sessionStorage.removeItem("grc_otp_challenge");
        window.localStorage.removeItem("grc_otp_challenge");
      } catch (e) {}

      setUser(null);
      setProfile(null);
      setSession(null);

      // Instantly notify other components and listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("grc-auth-state-change", { detail: { session: null, user: null } })
        );
        window.dispatchEvent(
          new CustomEvent("grc-storage-update", { detail: { collection: "users" } })
        );
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Emergency Auto-Wipe Trigger
  const triggerEmergencyAutoWipe = (reason) => {
    const lockout = localStorageDb.triggerSecurityAutoWipe(reason);
    setSecurityLockout(lockout);
    setUser(null);
    setProfile(null);
    setSession(null);
    try {
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem("grc_otp_challenge");
      window.localStorage.removeItem("grc_otp_challenge");
    } catch (e) {}

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("grc-auth-state-change", { detail: { session: null, user: null } })
      );
    }
    return lockout;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    securityLockout,
    requestOtp,
    verifyOtp,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    triggerEmergencyAutoWipe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;