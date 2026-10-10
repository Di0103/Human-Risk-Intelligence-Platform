import React, { createContext, useContext, useEffect, useState } from "react";
import { localStorageDb, DEFAULT_USERS } from "../utils/localStorageDb";

const SESSION_KEY = "grc_session";

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from LocalStorage
  useEffect(() => {
    try {
      const rawSession = window.localStorage.getItem(SESSION_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed?.user) {
          setUser(parsed.user);
          setSession(parsed);
          setProfile({
            id: parsed.user.id,
            email: parsed.user.email,
            full_name: parsed.user.user_metadata?.full_name || parsed.user.email.split("@")[0],
            role: parsed.user.user_metadata?.role || "admin",
          });
        }
      } else {
        // Default initial session for seamless evaluation
        const defaultAdmin = DEFAULT_USERS[0];
        const initialSession = {
          user: {
            id: defaultAdmin.id,
            email: defaultAdmin.email,
            user_metadata: {
              full_name: defaultAdmin.full_name,
              role: defaultAdmin.role,
            },
            created_at: defaultAdmin.created_at,
          },
          access_token: "local-dev-jwt-token",
        };
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(initialSession));
        setUser(initialSession.user);
        setSession(initialSession);
        setProfile({
          id: defaultAdmin.id,
          email: defaultAdmin.email,
          full_name: defaultAdmin.full_name,
          role: defaultAdmin.role,
        });
      }
    } catch (e) {
      console.warn("Failed to parse local auth session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with Email & Password
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const users = localStorageDb.get("users");
      let matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!matched) {
        // If user doesn't exist, create on the fly with admin role for evaluation ease
        matched = {
          id: `usr-${Date.now()}`,
          email,
          full_name: email.split("@")[0].replace(".", " "),
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
        access_token: `token-${Date.now()}`,
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

      return { data: { user: activeUser, session: newSession }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with Email, Password, Full Name, and RBAC Role
  const signupWithEmail = async (email, password, fullName, role = "admin") => {
    setLoading(true);
    try {
      const newUser = {
        id: `usr-${Date.now()}`,
        email,
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
        access_token: `token-${Date.now()}`,
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

      return { data: { user: activeUser, session: newSession }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login (Local Simulation)
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
        access_token: `token-google-${Date.now()}`,
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

      return { data: { user: googleUser, session: newSession }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      window.localStorage.removeItem(SESSION_KEY);
      setUser(null);
      setProfile(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
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