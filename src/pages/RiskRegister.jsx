import React, { useEffect, useState, useMemo } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { formatId } from "../utils/idFormatter";
import {
  FiAlertTriangle,
  FiShield,
  FiActivity,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiX,
  FiCheckCircle,
  FiSliders,
  FiUser,
  FiTag,
  FiRefreshCw,
  FiTrendingUp,
  FiInfo,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export function RiskRegister() {
  const { user } = useAuth();
  // Core Data States
  const [risks, setRisks] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [heatmapFilter, setHeatmapFilter] = useState(null); // { likelihood, impact } or null

  // Notification Toast
  const [notification, setNotification] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    title: "",
    category: "Human / Social Engineering",
    likelihood: 3,
    impact: 3,
    owner: "",
    treatment_strategy: "Mitigate",
    treatment_plan: "",
    status: "Open",
  };

  const [form, setForm] = useState(initialForm);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch risks and potential owners from LocalStorage
  const fetchData = () => {
    setLoading(true);
    try {
      const riskData = localStorageDb.get("risks") || [];
      setRisks(riskData);

      // Aggregate owners from profiles and employees
      const profiles = localStorageDb.get("profiles") || [];
      const employees = localStorageDb.get("employees") || [];

      const ownerList = new Set();
      profiles.forEach((p) => {
        if (p.full_name) ownerList.add(p.full_name);
      });
      employees.forEach((e) => {
        if (e.full_name) ownerList.add(e.full_name);
      });
      setOwners(Array.from(ownerList));
    } catch (err) {
      console.error("Error fetching risk register:", err);
      showNotification("error", "Failed to load risk register: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleStorageUpdate = (e) => {
      if (
        !e.detail ||
        e.detail.collection === "risks" ||
        e.detail.collection === "risk_register" ||
        e.detail.collection === "employees" ||
        e.detail.collection === "profiles" ||
        e.detail.collection === "all"
      ) {
        fetchData();
      }
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Likelihood & Impact descriptive dictionaries
  const likelihoodLabels = {
    5: "5 - Almost Certain (Frequent occurrence expected)",
    4: "4 - Likely (High probability of happening)",
    3: "3 - Possible (Moderate chance of occurrence)",
    2: "2 - Unlikely (Infrequent or isolated event)",
    1: "1 - Rare (Exceptional circumstances only)",
  };

  const impactLabels = {
    5: "5 - Catastrophic (Critical breach, heavy regulatory fine)",
    4: "4 - Major (Severe business or data disruption)",
    3: "3 - Moderate (Manageable operational impact)",
    2: "2 - Minor (Low data sensitivity, minimal losses)",
    1: "1 - Insignificant (Negligible consequence)",
  };

  // Classification Helpers
  const calculateScore = (l, i) => Number(l) * Number(i);

  const calculateLevel = (score) => {
    if (score >= 15) return { label: "High", badge: "bg-red-500/15 text-red-400 border-red-500/40" };
    if (score >= 8) return { label: "Medium", badge: "bg-amber-500/15 text-amber-400 border-amber-500/40" };
    return { label: "Low", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" };
  };

  // Top KPI Metrics
  const metrics = useMemo(() => {
    const total = risks.length;
    let high = 0;
    let medium = 0;
    let low = 0;
    let totalScore = 0;

    risks.forEach((r) => {
      const score = calculateScore(r.likelihood, r.impact);
      totalScore += score;
      if (score >= 15) high++;
      else if (score >= 8) medium++;
      else low++;
    });

    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : "0.0";

    return { total, high, medium, low, avgScore };
  }, [risks]);

  // 5x5 Heatmap Matrix Coordinate Aggregation
  const heatmapData = useMemo(() => {
    // 5x5 grid: matrix[likelihood][impact] = count
    const grid = {};
    for (let l = 1; l <= 5; l++) {
      grid[l] = {};
      for (let i = 1; i <= 5; i++) {
        grid[l][i] = 0;
      }
    }

    risks.forEach((r) => {
      const l = Math.max(1, Math.min(5, Number(r.likelihood) || 1));
      const i = Math.max(1, Math.min(5, Number(r.impact) || 1));
      if (grid[l] && grid[l][i] !== undefined) {
        grid[l][i] += 1;
      }
    });

    return grid;
  }, [risks]);

  // Filtered Risks for Table
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const score = calculateScore(r.likelihood, r.impact);
      const level = calculateLevel(score).label;
      const title = r.title || r.risk_title || "";
      const owner = r.owner || "";
      const category = r.category || "";

      // 1. Heatmap Cell Filter
      if (heatmapFilter) {
        if (
          Number(r.likelihood) !== heatmapFilter.likelihood ||
          Number(r.impact) !== heatmapFilter.impact
        ) {
          return false;
        }
      }

      // 2. Search Filter
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 3. Category Filter
      if (categoryFilter !== "all" && category !== categoryFilter) {
        return false;
      }

      // 4. Level Filter
      if (levelFilter !== "all" && level !== levelFilter) {
        return false;
      }

      return true;
    });
  }, [risks, searchTerm, categoryFilter, levelFilter, heatmapFilter]);

  // Handle Form Open for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  // Handle Form Open for Edit
  const handleOpenEdit = (risk) => {
    setEditingId(risk.id);

    // Extract strategy if prefixed e.g. "[Mitigate] Plan text"
    let strategy = "Mitigate";
    let plan = risk.treatment_plan || "";
    const match = plan.match(/^\[(Mitigate|Accept|Transfer|Avoid)\]\s*(.*)$/i);
    if (match) {
      strategy = match[1];
      plan = match[2];
    }

    setForm({
      title: risk.title || risk.risk_title || "",
      category: risk.category || "Human / Social Engineering",
      likelihood: Number(risk.likelihood) || 3,
      impact: Number(risk.impact) || 3,
      owner: risk.owner || "",
      treatment_strategy: strategy,
      treatment_plan: plan,
      status: risk.status || "Open",
    });

    setIsModalOpen(true);
  };

  // Handle Form Submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showNotification("error", "Please enter a Risk Title.");
      return;
    }

    const compiledTreatmentPlan = `[${form.treatment_strategy}] ${form.treatment_plan.trim()}`;
    const scoreVal = Number(form.likelihood) * Number(form.impact);

    // Multi-tier payloads
    // Tier 1: Combined modern & legacy fields (all alias columns from master_fix_all_modules.sql)
    const tier1Payload = {
      title: form.title.trim(),
      risk_title: form.title.trim(),
      risk_name: form.title.trim(),
      name: form.title.trim(),
      category: form.category,
      likelihood: Number(form.likelihood),
      impact: Number(form.impact),
      score: scoreVal,
      exposure_score: scoreVal,
      owner: form.owner.trim() || "Unassigned",
      risk_owner: form.owner.trim() || "Unassigned",
      treatment_strategy: form.treatment_strategy,
      mitigation_strategy: form.treatment_strategy,
      treatment_plan: compiledTreatmentPlan,
      remediation_action: compiledTreatmentPlan,
      description: compiledTreatmentPlan,
      summary: compiledTreatmentPlan,
      status: form.status,
      lifecycle_status: form.status,
      user_id: user?.id,
      organization_id: user?.id,
    };

    // Tier 2: Standard schema columns
    const tier2Payload = {
      title: form.title.trim(),
      risk_title: form.title.trim(),
      category: form.category,
      likelihood: Number(form.likelihood),
      impact: Number(form.impact),
      owner: form.owner.trim() || "Unassigned",
      treatment_plan: compiledTreatmentPlan,
      status: form.status,
    };

    // Tier 3: Core minimal columns
    const tier3Payload = {
      title: form.title.trim(),
      category: form.category,
      likelihood: Number(form.likelihood),
      impact: Number(form.impact),
      owner: form.owner.trim() || "Unassigned",
      status: form.status,
    };

    // Optimistic UI update
    const previousRisks = [...risks];
    const optimisticRecord = {
      id: editingId || `temp-${Date.now()}`,
      ...tier1Payload,
      created_at: new Date().toISOString(),
    };

    if (editingId) {
      setRisks((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...optimisticRecord } : r))
      );
    } else {
      setRisks((prev) => [optimisticRecord, ...prev]);
    }

    setIsModalOpen(false);
    setForm(initialForm);

    try {
      if (editingId) {
        localStorageDb.update("risks", editingId, tier1Payload);
        showNotification("success", "Risk assessment updated successfully.");
      } else {
        const nextId = risks.length
          ? Math.max(...risks.map((r) => Number(r.id) || 0), 0) + 1
          : 1;
        localStorageDb.insert("risks", {
          id: nextId,
          ...tier1Payload,
          created_at: new Date().toISOString(),
        });
        showNotification("success", "New risk successfully registered.");
      }
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error("Save risk error:", err);
      showNotification("error", "Error saving risk: " + err.message);
    }
  };

  // Handle Delete
  const handleDelete = (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete risk "${title}"?`)) {
      return;
    }

    try {
      localStorageDb.delete("risks", id);
      showNotification("success", "Risk deleted from register.");
      fetchData();
    } catch (err) {
      console.error("Delete risk error:", err);
      showNotification("error", "Failed to delete risk: " + err.message);
    }
  };

  // Heatmap Cell Color Resolver based on GRC standard
  const getCellColor = (l, i, count) => {
    const score = l * i;
    if (score >= 15) {
      return count > 0
        ? "bg-red-950/80 border-red-500/60 text-red-200 hover:bg-red-900/90 shadow-red-950/50"
        : "bg-red-950/30 border-red-900/40 text-red-400/50 hover:bg-red-950/50";
    }
    if (score >= 8) {
      return count > 0
        ? "bg-amber-950/80 border-amber-500/60 text-amber-200 hover:bg-amber-900/90 shadow-amber-950/50"
        : "bg-amber-950/30 border-amber-900/40 text-amber-400/50 hover:bg-amber-950/50";
    }
    return count > 0
      ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900/90 shadow-emerald-950/50"
      : "bg-emerald-950/30 border-emerald-900/40 text-emerald-400/50 hover:bg-emerald-950/50";
  };

  // Live Modal Preview Calculation
  const currentModalScore = calculateScore(form.likelihood, form.impact);
  const currentModalLevel = calculateLevel(currentModalScore);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Enterprise Risk Register & 5x5 Heatmap Matrix
              </h1>
              <p className="text-xs text-slate-400">
                Likelihood vs. Impact quantitative assessment, classification, and treatment planning.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition self-start md:self-auto"
        >
          <FiPlus className="text-base" /> Register New Risk
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-sm flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/80 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <FiCheckCircle className="text-emerald-400" />
            ) : (
              <FiAlertTriangle className="text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <FiX />
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Risks */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Identified Risks
            </span>
            <FiShield className="text-blue-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{metrics.total}</div>
          <div className="text-[11px] text-blue-400 mt-1 font-medium">Cataloged in Register</div>
        </div>

        {/* Critical & High Risks */}
        <div className="bg-slate-900/90 border border-red-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/25 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Critical & High
            </span>
            <FiAlertTriangle className="text-red-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1.5">{metrics.high}</div>
          <div className="text-[11px] text-red-300 mt-1 font-medium">Score 15 – 25 (Urgent Action)</div>
        </div>

        {/* Medium Risks */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Medium Risks
            </span>
            <FiActivity className="text-amber-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1.5">{metrics.medium}</div>
          <div className="text-[11px] text-amber-300 mt-1 font-medium">Score 8 – 14 (Monitored)</div>
        </div>

        {/* Low / Mitigated Risks */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low / Mitigated
            </span>
            <FiCheckCircle className="text-emerald-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">{metrics.low}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">Score 1 – 7 (Tolerable)</div>
        </div>

        {/* Average Risk Score */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg. Risk Score
            </span>
            <FiTrendingUp className="text-indigo-400 text-lg" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5 flex items-baseline gap-1">
            <span
              className={
                metrics.avgScore >= 15
                  ? "text-red-400"
                  : metrics.avgScore >= 8
                  ? "text-amber-400"
                  : "text-emerald-400"
              }
            >
              {metrics.avgScore}
            </span>
            <span className="text-xs text-slate-500 font-normal">/ 25</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Org Risk Exposure</div>
        </div>
      </div>

      {/* 3. Interactive 5x5 Risk Heatmap Matrix */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FiSliders className="text-blue-400" /> Interactive 5x5 Heatmap Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click on any cell to filter risks by its exact Likelihood and Impact coordinates.
            </p>
          </div>

          {heatmapFilter && (
            <button
              onClick={() => setHeatmapFilter(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-600/30 transition self-start sm:self-auto"
            >
              <FiX className="text-sm" />
              <span>Clear Heatmap Filter (L:{heatmapFilter.likelihood}, I:{heatmapFilter.impact})</span>
            </button>
          )}
        </div>

        {/* Heatmap Grid Layout */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[620px]">
            {/* Rows from Likelihood 5 down to 1 */}
            <div className="flex">
              {/* Y-Axis Label */}
              <div className="w-24 flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase tracking-wider text-slate-400 [writing-mode:vertical-rl] rotate-180 py-4">
                Likelihood (Probability)
              </div>

              {/* Grid Body */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((l) => (
                  <div key={l} className="flex items-center gap-2">
                    {/* Y-Axis Row Header */}
                    <div className="w-28 text-right pr-2 text-xs font-semibold text-slate-400 flex-shrink-0 truncate">
                      {l === 5 && "5 - Certain"}
                      {l === 4 && "4 - Likely"}
                      {l === 3 && "3 - Possible"}
                      {l === 2 && "2 - Unlikely"}
                      {l === 1 && "1 - Rare"}
                    </div>

                    {/* 5 Impact Cells for this Likelihood */}
                    <div className="grid grid-cols-5 gap-2 flex-1">
                      {[1, 2, 3, 4, 5].map((i) => {
                        const count = heatmapData[l]?.[i] || 0;
                        const score = l * i;
                        const isSelected =
                          heatmapFilter?.likelihood === l && heatmapFilter?.impact === i;

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setHeatmapFilter(null);
                              } else {
                                setHeatmapFilter({ likelihood: l, impact: i });
                              }
                            }}
                            className={`h-16 rounded-xl border p-2 flex flex-col justify-between transition-all duration-150 relative ${getCellColor(
                              l,
                              i,
                              count
                            )} ${
                              isSelected
                                ? "ring-2 ring-white border-white scale-[1.04] z-10 shadow-lg"
                                : ""
                            }`}
                          >
                            {/* Score corner tag */}
                            <div className="flex items-center justify-between w-full text-[10px] font-mono">
                              <span className="opacity-75">{score}</span>
                              <span className="text-[9px] uppercase font-bold tracking-tight opacity-75">
                                {score >= 15 ? "High" : score >= 8 ? "Med" : "Low"}
                              </span>
                            </div>

                            {/* Risk Count centered */}
                            <div className="flex items-center justify-center w-full">
                              {count > 0 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-white font-extrabold text-sm backdrop-blur-sm shadow-inner">
                                  {count}
                                </span>
                              ) : (
                                <span className="text-xs opacity-30 font-medium">0</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* X-Axis Header (Impact 1 - 5) */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-28 flex-shrink-0" />
                  <div className="grid grid-cols-5 gap-2 flex-1 text-center text-xs font-semibold text-slate-400">
                    <div>1 - Insignificant</div>
                    <div>2 - Minor</div>
                    <div>3 - Moderate</div>
                    <div>4 - Major</div>
                    <div>5 - Catastrophic</div>
                  </div>
                </div>

                {/* X-Axis Label */}
                <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 pt-1">
                  Impact (Consequence)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 mt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-500/60" />
            <span>Low Risk (1 - 7)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/30 border border-amber-500/60" />
            <span>Medium Risk (8 - 14)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-red-500/30 border border-red-500/60" />
            <span>Critical / High Risk (15 - 25)</span>
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-3 text-slate-500 text-xs" />
          <input
            type="text"
            placeholder="Search risk by title, category, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Human / Social Engineering">Human / Social Engineering</option>
            <option value="Technical / Infrastructure">Technical / Infrastructure</option>
            <option value="Data Privacy & Governance">Data Privacy & Governance</option>
            <option value="Compliance & Legal">Compliance & Legal</option>
            <option value="Operational">Operational</option>
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="High">High / Critical Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>
        </div>
      </div>

      {/* Active Heatmap Filter Banner */}
      {heatmapFilter && (
        <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <FiFilter className="text-blue-400" />
            <span>
              Filtered by Heatmap coordinate:{" "}
              <strong>Likelihood {heatmapFilter.likelihood}</strong>,{" "}
              <strong>Impact {heatmapFilter.impact}</strong> (Score:{" "}
              {heatmapFilter.likelihood * heatmapFilter.impact}). Displaying{" "}
              <strong>{filteredRisks.length}</strong> matching{" "}
              {filteredRisks.length === 1 ? "risk" : "risks"}.
            </span>
          </div>
          <button
            onClick={() => setHeatmapFilter(null)}
            className="text-blue-400 hover:text-white font-semibold flex items-center gap-1"
          >
            <FiX /> Reset
          </button>
        </div>
      )}

      {/* 5. Risk Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Evaluating organizational risks...</p>
        </div>
      ) : filteredRisks.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          <FiAlertTriangle className="text-4xl mx-auto mb-3 text-slate-500" />
          <p className="text-base font-semibold text-white">No records found in database.</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {risks.length === 0
              ? "Your risk register currently has 0 rows. Add real threat entries to populate the register."
              : "No risks match your active search or heatmap filter."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <FiPlus /> Add / Create New Risk
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-28">Risk ID</th>
                  <th className="py-3.5 px-4">Risk Title & Category</th>
                  <th className="py-3.5 px-4 text-center">L (1-5)</th>
                  <th className="py-3.5 px-4 text-center">I (1-5)</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-4 text-center">Level</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Treatment Plan & Strategy</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRisks.map((risk, index) => {
                  const score = calculateScore(risk.likelihood, risk.impact);
                  const level = calculateLevel(score);
                  const title = risk.title || risk.risk_title || "Untitled Risk";

                  return (
                    <tr key={risk.id} className="hover:bg-slate-800/40 transition">
                      {/* Risk ID */}
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {formatId(risk.id, index, "RSK")}
                        </span>
                      </td>

                      {/* Title & Category */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-white text-xs sm:text-sm">
                          {title}
                        </div>
                        <div className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-blue-300 border border-slate-700">
                          {risk.category || "General"}
                        </div>
                      </td>

                      {/* Likelihood */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-slate-200">
                        {risk.likelihood}
                      </td>

                      {/* Impact */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-slate-200">
                        {risk.impact}
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-white">
                        {score}
                      </td>

                      {/* Level Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${level.badge}`}
                        >
                          {level.label}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <FiUser className="text-slate-500" />
                          <span>{risk.owner || "Unassigned"}</span>
                        </div>
                      </td>

                      {/* Treatment Plan */}
                      <td className="py-3.5 px-4 text-xs text-slate-400 max-w-sm">
                        <div className="line-clamp-2">
                          {risk.treatment_plan || "No formal treatment plan entered."}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {risk.status || "Open"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(risk)}
                            title="Edit Risk"
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/30 rounded-lg transition"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(risk.id, title)}
                            title="Delete Risk"
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: Add / Edit Risk Assessment */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiAlertTriangle className="text-blue-400" />
                {editingId ? "Edit Risk Assessment & Treatment" : "Register New Threat / Risk"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Risk Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Targeted Phishing and Employee Credential Harvesting Attack"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Risk Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Human / Social Engineering">Human / Social Engineering</option>
                    <option value="Technical / Infrastructure">Technical / Infrastructure</option>
                    <option value="Data Privacy & Governance">Data Privacy & Governance</option>
                    <option value="Compliance & Legal">Compliance & Legal</option>
                    <option value="Operational">Operational</option>
                    <option value="Third-Party Vendor">Third-Party Vendor</option>
                  </select>
                </div>

                {/* Owner */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Risk Owner
                  </label>
                  <input
                    type="text"
                    list="owners-list"
                    placeholder="Select or enter owner name..."
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="owners-list">
                    {owners.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                </div>

                {/* Likelihood Slider */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300 uppercase">
                      Likelihood
                    </label>
                    <span className="font-mono text-sm font-bold text-blue-400">
                      {form.likelihood} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={form.likelihood}
                    onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    {likelihoodLabels[form.likelihood]}
                  </p>
                </div>

                {/* Impact Slider */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300 uppercase">
                      Impact
                    </label>
                    <span className="font-mono text-sm font-bold text-blue-400">
                      {form.impact} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={form.impact}
                    onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    {impactLabels[form.impact]}
                  </p>
                </div>

                {/* Live Assessment Calculation Preview Card */}
                <div className="md:col-span-2 p-3.5 bg-slate-950/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Calculated Exposure
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xl font-mono font-bold text-white">
                        Score: {currentModalScore}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({form.likelihood} × {form.impact})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentModalLevel.badge}`}
                    >
                      {currentModalLevel.label} Priority
                    </span>
                  </div>
                </div>

                {/* Treatment Strategy */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Treatment Strategy
                  </label>
                  <select
                    value={form.treatment_strategy}
                    onChange={(e) => setForm({ ...form, treatment_strategy: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mitigate">Mitigate (Deploy Safeguards / Technical Controls)</option>
                    <option value="Accept">Accept (Tolerate within Risk Appetite)</option>
                    <option value="Transfer">Transfer (Cyber Insurance or 3rd-Party)</option>
                    <option value="Avoid">Avoid (Terminate Risky Activity)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open (Identified)</option>
                    <option value="In Progress">In Progress (Mitigation Underway)</option>
                    <option value="Mitigated">Mitigated (Safeguard Deployed)</option>
                    <option value="Closed">Closed</option>
                    <option value="Accepted">Accepted by Management</option>
                  </select>
                </div>

                {/* Treatment Plan Details */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Treatment Plan & Remediation Action
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Specify compensating controls, hardware MFA tokens, training mandates, patch SLAs..."
                    value={form.treatment_plan}
                    onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20"
                >
                  {editingId ? "Update Risk" : "Register Risk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskRegister;