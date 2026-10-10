import { localStorageDb, DEFAULT_USERS } from "../utils/localStorageDb";

const SESSION_KEY = "grc_session";

// Register a new user
export const signUp = async (name, email, password) => {
  const newUser = {
    id: `usr-${Date.now()}`,
    email,
    full_name: name,
    role: "admin",
    created_at: new Date().toISOString(),
  };

  localStorageDb.insert("users", newUser);

  const session = {
    user: newUser,
    access_token: `token-${Date.now()}`,
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { data: { user: newUser, session }, error: null };
};

// Login existing user
export const signIn = async (email, password) => {
  const users = localStorageDb.get("users");
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      email,
      full_name: email.split("@")[0],
      role: "admin",
      created_at: new Date().toISOString(),
    };
    localStorageDb.insert("users", user);
  }

  const session = {
    user,
    access_token: `token-${Date.now()}`,
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { data: { user, session }, error: null };
};

// Logout current user
export const signOut = async () => {
  window.localStorage.removeItem(SESSION_KEY);
  return { error: null };
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