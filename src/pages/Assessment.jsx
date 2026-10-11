import React, { useEffect, useState } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import { FiAward, FiPlayCircle, FiCheckCircle, FiShield, FiClock, FiCheck } from "react-icons/fi";
import { formatId } from "../utils/idFormatter";
import { AssessmentQuizModal } from "../components/AssessmentQuizModal";

const emptyForm = {
  employee_name: "",
  training_name: "",
  assessment_score: "",
  result: "",
  assessment_date: "",
  remarks: "",
  assessment_criteria: "",
};

const Assessment = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [notification, setNotification] = useState(null);

  // Interactive MCQ Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizEmployee, setQuizEmployee] = useState("");
  const [quizTraining, setQuizTraining] = useState("");

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch Assessments from LocalStorage
  const fetchAssessments = () => {
    const data = localStorageDb.get("assessments") || [];
    setAssessments(data);
  };

  useEffect(() => {
    fetchAssessments();

    const handleStorageUpdate = (e) => {
      if (!e.detail || e.detail.collection === "assessments" || e.detail.collection === "all") {
        fetchAssessments();
      }
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Handle Input with Deterministic Pass/Fail Calculation
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Auto-calculate deterministic Pass/Fail when score is updated
      if (name === "assessment_score") {
        const num = Number(value);
        if (value !== "" && !isNaN(num)) {
          updated.result = num >= 66 ? "Pass" : "Fail";
        }
      }

      return updated;
    });
  };

  // Reset Form
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // Callback when quiz is evaluated in modal
  const handleQuizEvaluated = (evalData) => {
    setForm((prev) => ({
      ...prev,
      employee_name: evalData.employee_name || prev.employee_name,
      training_name: evalData.training_name || prev.training_name,
      assessment_score: evalData.assessment_score,
      result: evalData.result,
      assessment_date: evalData.assessment_date,
      remarks: evalData.remarks,
      assessment_criteria: evalData.assessment_criteria,
    }));
    showNotification(
      "success",
      `MCQ Quiz Evaluated: ${evalData.result} (${evalData.assessment_score}%). Form populated deterministically.`
    );
  };

  // Callback when quiz is saved directly from modal
  const handleQuizSaved = (savedRecord) => {
    fetchAssessments();
    showNotification(
      "success",
      `Assessment for ${savedRecord.employee_name || "candidate"} saved! Score: ${savedRecord.score || savedRecord.assessment_score}% (${savedRecord.result || savedRecord.status}).`
    );
    setIsQuizModalOpen(false);
  };

  // Add / Update Assessment with Multi-Tier Fallback
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.employee_name.trim() ||
      !form.training_name.trim() ||
      form.assessment_score === "" ||
      !form.result ||
      !form.assessment_date ||
      !form.remarks.trim()
    ) {
      showNotification("error", "Please fill all required assessment fields.");
      return;
    }

    const scoreNum = Number(form.assessment_score);
    const dateStr = form.assessment_date || new Date().toISOString().split("T")[0];
    const timestampStr = new Date().toISOString();
    const criteriaStr =
      form.assessment_criteria ||
      (scoreNum >= 66
        ? "ISO/IEC 27001 Controls & Threat Awareness Verified"
        : "Standard Assessment Criteria (Remediation Required)");

    // Enriched remarks to preserve criteria & timestamp even in fallback schemas
    const enrichedRemarks = form.remarks.includes("[Criteria:")
      ? form.remarks.trim()
      : `[Criteria: ${criteriaStr} | Completed: ${timestampStr}] ${form.remarks.trim()}`;

    // Tier 1: Combined modern & legacy fields (all aliases with criteria & completed_at)
    const tier1Payload = {
      title: form.training_name.trim(),
      assessment_name: form.training_name.trim(),
      training_name: form.training_name.trim(),
      employee_name: form.employee_name.trim(),
      assessment_score: scoreNum,
      score: scoreNum,
      result: form.result,
      status: form.result,
      assessment_date: dateStr,
      due_date: dateStr,
      remarks: enrichedRemarks,
      assessment_criteria: criteriaStr,
      completed_at: timestampStr,
      user_id: user?.id,
      organization_id: user?.id,
    };

    // Tier 2: Standard schema fields
    const tier2Payload = {
      title: form.training_name.trim(),
      employee_name: form.employee_name.trim(),
      training_name: form.training_name.trim(),
      assessment_score: scoreNum,
      score: scoreNum,
      result: form.result,
      status: form.result,
      assessment_date: dateStr,
      remarks: enrichedRemarks,
    };

    // Tier 3: Standard minimal fields
    const tier3Payload = {
      title: form.training_name.trim(),
      employee_name: form.employee_name.trim(),
      score: scoreNum,
      status: form.result,
      due_date: dateStr,
      remarks: enrichedRemarks,
    };

    // Optimistic UI update
    const previousAssessments = [...assessments];
    const optimisticRecord = {
      id: editingId || `temp-${Date.now()}`,
      ...tier1Payload,
      created_at: new Date().toISOString(),
    };

    if (editingId !== null) {
      setAssessments((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...optimisticRecord } : a))
      );
    } else {
      setAssessments((prev) => [optimisticRecord, ...prev]);
    }

    resetForm();

    try {
      if (editingId !== null) {
        localStorageDb.update("assessments", editingId, tier1Payload);
        showNotification("success", "Assessment record updated successfully.");
      } else {
        const nextId = assessments.length
          ? Math.max(...assessments.map((a) => Number(a.id) || 0), 0) + 1
          : 1;
        localStorageDb.insert("assessments", {
          id: nextId,
          ...tier1Payload,
          created_at: new Date().toISOString(),
        });
        showNotification("success", "Assessment record added successfully.");
      }
      fetchAssessments();
    } catch (err) {
      console.error("Save assessment error:", err);
      showNotification("error", "Failed to save assessment: " + err.message);
    }
  };

  // Edit Assessment
  const handleEdit = (assessment) => {
    setEditingId(assessment.id);

    setForm({
      employee_name: assessment.employee_name || assessment.full_name || "",
      training_name:
        assessment.training_name ||
        assessment.title ||
        assessment.assessment_name ||
        "",
      assessment_score: assessment.assessment_score ?? assessment.score ?? "",
      result: assessment.result || assessment.status || "",
      assessment_date:
        assessment.assessment_date || assessment.due_date || "",
      remarks: assessment.remarks || "",
      assessment_criteria: assessment.assessment_criteria || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Assessment
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assessment?"
    );

    if (!confirmDelete) return;

    try {
      localStorageDb.delete("assessments", id);
      showNotification("success", "Assessment record deleted successfully.");
      if (editingId === id) {
        resetForm();
      }
      fetchAssessments();
    } catch (err) {
      console.error("Delete assessment error:", err);
      showNotification("error", "Failed to delete assessment: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm transition-all shadow-lg ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Page Heading & Interactive Quiz CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <FiAward className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Security Competency & Risk Assessments
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluate workforce security comprehension, execute deterministic MCQ assessments, and document ISO 27001 audit remarks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setQuizEmployee(form.employee_name || "");
            setQuizTraining(form.training_name || "");
            setIsQuizModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 border border-blue-400/30 transition transform active:scale-95"
        >
          <FiPlayCircle className="w-4 h-4 text-blue-200" />
          <span>Take Interactive MCQ Quiz</span>
        </button>
      </div>

      {/* Interactive MCQ Quiz Helper Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-800/40 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Security MCQ Assessment & Evaluation Checklist</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Step 3 Standard
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Replace static score estimation with deterministic 3-question MCQ evaluations covering <strong>ISO/IEC 27001:2022 Controls (A.5.15, A.8.5, A.5.24)</strong>, <strong>Phishing & BEC Defense</strong>, <strong>DPDP Act 2023 Data Privacy</strong>, and <strong>ISO 22301 Continuity</strong>. Deterministically calculates percentage scores and enforces pass/fail criteria (Pass &ge; 66%).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setQuizEmployee(form.employee_name || "");
            setQuizTraining(form.training_name || "");
            setIsQuizModalOpen(true);
          }}
          className="whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition flex items-center gap-1.5 shrink-0"
        >
          <FiPlayCircle className="w-3.5 h-3.5" />
          <span>Launch Quiz Modal</span>
        </button>
      </div>

      {/* ================= FORM ================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            {editingId !== null ? "Edit Assessment Record" : "Add Assessment Record"}
          </h2>
          <span className="text-xs text-slate-400">
            Passing threshold: <span className="font-mono text-emerald-400">&ge; 66%</span> (2/3 correct)
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          {/* Employee Name */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Employee Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="employee_name"
              value={form.employee_name}
              onChange={handleChange}
              placeholder="e.g. John Doe, Alex Turner..."
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Training Name */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Training Program / Module <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="training_name"
              value={form.training_name}
              onChange={handleChange}
              placeholder="e.g. ISO 27001 Access Control, Phishing Awareness..."
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Assessment Score with Interactive Quiz Trigger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Assessment Score (%) <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setQuizEmployee(form.employee_name || "");
                  setQuizTraining(form.training_name || "");
                  setIsQuizModalOpen(true);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition"
                title="Calculate score via 3-question MCQ quiz"
              >
                <FiPlayCircle className="w-3.5 h-3.5" />
                <span>Calculate via MCQ Quiz</span>
              </button>
            </div>
            <input
              type="number"
              name="assessment_score"
              value={form.assessment_score}
              onChange={handleChange}
              placeholder="e.g. 100, 67, 33 (or take quiz above)"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-mono"
            />
          </div>

          {/* Result */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Result (Auto-Calculated) <span className="text-rose-400">*</span>
            </label>
            <select
              name="result"
              value={form.result}
              onChange={handleChange}
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            >
              <option value="" className="bg-slate-800 text-slate-400">Select Result</option>
              <option value="Pass" className="bg-slate-800 text-emerald-400 font-semibold">Pass (&ge; 66%)</option>
              <option value="Fail" className="bg-slate-800 text-rose-400 font-semibold">Fail (&lt; 66%)</option>
            </select>
          </div>

          {/* Assessment Date */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Assessment Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              name="assessment_date"
              value={form.assessment_date}
              onChange={handleChange}
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Assessment Criteria */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Assessment Criteria / Scope
            </label>
            <input
              type="text"
              name="assessment_criteria"
              value={form.assessment_criteria}
              onChange={handleChange}
              placeholder="e.g. ISO 27001 Controls A.5.15, A.8.5, A.5.24"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Auditor Remarks & Findings <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="e.g. Passed ISO 27001 ISMS competency (3/3 correct). Verified PoLP and MFA."
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-600/20"
            >
              {editingId !== null ? "Update Assessment" : "Add Assessment"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-lg text-sm border border-slate-700 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            Assessment Records
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {assessments.length} Evaluations
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 uppercase tracking-wider text-xs font-semibold border-b border-slate-800">
                <th className="py-3 px-4 w-28 text-center">ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Training / Scope</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4">Auditor Remarks</th>
                <th className="py-3 px-4 text-center w-44">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiAward className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-sm font-medium text-slate-400">
                        No records found in database.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Use the form above or launch the MCQ quiz to record an employee assessment result.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                assessments.map((assessment, index) => (
                  <tr
                    key={assessment.id}
                    className="bg-slate-900 border-b border-slate-800 text-slate-200 hover:bg-slate-800/50 transition"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {formatId(assessment.id, index, "ASM")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {assessment.employee_name || assessment.full_name || "Employee"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{assessment.training_name || assessment.title || assessment.assessment_name || "Assessment"}</div>
                      {assessment.assessment_criteria && (
                        <div className="text-[11px] text-blue-400/90 mt-0.5 font-sans">
                          {assessment.assessment_criteria}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {assessment.assessment_score ?? assessment.score ?? 0}%
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        (assessment.result === "Pass" || assessment.status === "Pass")
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}>
                        {assessment.result || assessment.status || "Pending"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-300 font-mono text-xs">
                      {assessment.assessment_date || assessment.due_date || "—"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      <div className="italic">{assessment.remarks || "—"}</div>
                      {assessment.completed_at && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Timestamp: {new Date(assessment.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setQuizEmployee(assessment.employee_name || assessment.full_name || "");
                            setQuizTraining(assessment.training_name || assessment.title || assessment.assessment_name || "");
                            setIsQuizModalOpen(true);
                          }}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                          title="Retest or evaluate with Interactive MCQ Quiz"
                        >
                          <FiPlayCircle className="w-3 h-3" />
                          <span>Quiz</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(assessment)}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-2 py-1 rounded text-xs font-medium transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(assessment.id)}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-2 py-1 rounded text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive MCQ Quiz Modal */}
      <AssessmentQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        initialEmployee={quizEmployee}
        initialTrainingName={quizTraining}
        onEvaluationComplete={handleQuizEvaluated}
        onAssessmentSaved={handleQuizSaved}
      />
    </div>
  );
};

export default Assessment;