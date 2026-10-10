import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Employees from "./pages/Employees";
import Policies from "./pages/Policies";
import RiskRegister from "./pages/RiskRegister";
import Compliance from "./pages/Compliance";
import Training from "./pages/Training";
import Assessment from "./pages/Assessment";
import InternalAudit from "./pages/InternalAudit";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login defaultSignUp={true} />} />

          {/* Protected Application Routes inside AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Default Route */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Platform Modules */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/audit" element={<InternalAudit />} />
            <Route path="/internal-audit" element={<Navigate to="/audit" replace />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/risks" element={<RiskRegister />} />
            <Route path="/risk-register" element={<Navigate to="/risks" replace />} />
            <Route path="/training" element={<Training />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;