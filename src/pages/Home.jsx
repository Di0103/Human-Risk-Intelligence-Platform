import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const modules = [
    {
      title: "Dashboard",
      description: "View overall statistics and project summary.",
      path: "/dashboard",
    },
    {
      title: "Departments",
      description: "Manage departments and department heads.",
      path: "/departments",
    },
    {
      title: "Employees",
      description: "Add, update and manage employee records.",
      path: "/employees",
    },
    {
      title: "Risk Register",
      description: "Track and manage organizational risks.",
      path: "/risk-register",
    },
    {
      title: "Policies",
      description: "Maintain company policies and compliance records.",
      path: "/policies",
    },
    {
      title: "Training",
      description: "Manage employee training programs.",
      path: "/training",
    },
    {
      title: "Assessment",
      description: "Record employee assessment results.",
      path: "/assessment",
    },
    {
      title: "Reports",
      description: "Generate reports and view analytics.",
      path: "/reports",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Hero Section */}
      <div className="bg-slate-900 border-b border-slate-800 py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <span className="px-3.5 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold uppercase tracking-wider inline-block mb-4">
            Enterprise Governance, Risk & Compliance Platform
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Human-Centric GRC Management Platform
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto">
            A unified, audit-ready platform for continuous compliance monitoring, ISO 27001 / SOC 2 control mappings, risk assessment, employee security training, and executive reporting.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/25 transition"
            >
              Open Dashboard
            </Link>
            <Link
              to="/login"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-8 py-3 rounded-xl font-semibold transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="max-w-7xl mx-auto px-6 py-14 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            GRC Operational Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            End-to-end governance and security telemetry capabilities
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((module, index) => (
            <div
              key={index}
              className="bg-slate-900/80 border border-slate-800 shadow-lg rounded-xl p-6 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-slate-400 mb-5">
                  {module.description}
                </p>
              </div>

              <Link
                to={module.path}
                className="inline-flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-xs font-semibold transition"
              >
                Launch Module →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-slate-900/60 border-t border-slate-800/80 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-10 tracking-tight">
            Key Architecture Highlights
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
              <h3 className="text-lg font-bold text-white mb-2">
                Workforce Management
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Maintain verified employee directories with departmental associations and role-based access control.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
              <h3 className="text-lg font-bold text-white mb-2">
                Structured Gap Identification
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamically verify ISO 27001 requirements against implemented safeguards to pinpoint compliance deficiencies.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
              <h3 className="text-lg font-bold text-white mb-2">
                Human Cyber Telemetry
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor security awareness training completion rates and assessment scores across all organizational teams.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © 2026 Human-Centric GRC Platform • Minor Project Phase 1 • React, Tailwind CSS & Local Enterprise State
      </footer>
    </div>
  );
};

export default Home;