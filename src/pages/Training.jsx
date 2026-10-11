import React, { useEffect, useState } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import { FiBookOpen, FiAward, FiPlayCircle, FiShield, FiCheckCircle } from "react-icons/fi";
import { formatId } from "../utils/idFormatter";
import { AssessmentQuizModal } from "../components/AssessmentQuizModal";

const Training = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Interactive MCQ Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizTargetTraining, setQuizTargetTraining] = useState(null);

  const [form, setForm] = useState({
    training_name: "",
    trainer: "",
    department: "",
    training_date: "",
    duration: "",
    status: "",
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Callback when quiz is completed & saved to LocalStorage
  const handleQuizAssessmentSaved = (savedAssessment) => {
    setIsQuizModalOpen(false);

    if (quizTargetTraining && (savedAssessment.result === "Pass" || savedAssessment.status === "Pass")) {
      try {
        // Auto update training status to Completed & completion rate to 100%
        localStorageDb.update("trainings", quizTargetTraining.id, {
          status: "Completed",
          completion_rate: 100,
        });

        fetchTrainings();
        showNotification(
          "success",
          `Assessment passed (${savedAssessment.score || savedAssessment.assessment_score}%)! Training "${quizTargetTraining.training_name || quizTargetTraining.title}" marked as Completed.`
        );
      } catch (err) {
        console.warn("Failed to mark training completed:", err);
        showNotification("success", `Assessment for ${savedAssessment.employee_name} recorded!`);
      }
    } else {
      showNotification(
        "success",
        `Assessment for ${savedAssessment.employee_name} recorded (${savedAssessment.result || savedAssessment.status}).`
      );
    }
    setQuizTargetTraining(null);
  };

  // ================= FETCH TRAININGS =================

  const fetchTrainings = () => {
    const data = localStorageDb.get("trainings") || [];
    setTrainings(data);
  };

  useEffect(() => {
    fetchTrainings();

    const handleStorageUpdate = (e) => {
      if (!e.detail || e.detail.collection === "trainings" || e.detail.collection === "all") {
        fetchTrainings();
      }
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= ADD / UPDATE WITH RESILIENT FALLBACKS =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.training_name.trim() ||
      !form.trainer.trim() ||
      !form.department.trim() ||
      !form.training_date ||
      !form.duration.trim() ||
      !form.status
    ) {
      showNotification("error", "Please fill all required training fields.");
      return;
    }

    const tier1Payload = {
      title: form.training_name.trim(),
      training_name: form.training_name.trim(),
      trainer: form.trainer.trim(),
      department: form.department.trim(),
      training_date: form.training_date,
      due_date: form.training_date,
      duration: form.duration.trim(),
      status: form.status,
      description: form.training_name.trim(),
      completion_rate:
        form.status === "Completed" ? 100 : form.status === "Ongoing" ? 50 : 0,
      user_id: user?.id,
      organization_id: user?.id,
    };

    const tier2Payload = {
      training_name: form.training_name.trim(),
      trainer: form.trainer.trim(),
      department: form.department.trim(),
      training_date: form.training_date,
      duration: form.duration.trim(),
      status: form.status,
    };

    const tier3Payload = {
      title: form.training_name.trim(),
      trainer: form.trainer.trim(),
      department: form.department.trim(),
      due_date: form.training_date,
      status: form.status,
    };

    // Optimistic UI update
    const previousTrainings = [...trainings];
    const optimisticRecord = {
      id: editingId || `temp-${Date.now()}`,
      ...tier1Payload,
      created_at: new Date().toISOString(),
    };

    if (editingId) {
      setTrainings((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...optimisticRecord } : t))
      );
    } else {
      setTrainings((prev) => [optimisticRecord, ...prev]);
    }

    resetForm();

    try {
      if (editingId) {
        localStorageDb.update("trainings", editingId, tier1Payload);
        showNotification("success", "Training program updated successfully.");
      } else {
        const nextId = trainings.length
          ? Math.max(...trainings.map((t) => Number(t.id) || 0), 0) + 1
          : 1;
        localStorageDb.insert("trainings", {
          id: nextId,
          ...tier1Payload,
          created_at: new Date().toISOString(),
        });
        showNotification("success", "Training session successfully scheduled.");
      }
      fetchTrainings();
    } catch (err) {
      console.error("Save training error:", err);
      showNotification("error", "Failed to save training: " + err.message);
    }
  };

  // ================= EDIT =================

  const handleEdit = (training) => {
    setEditingId(training.id);

    setForm({
      training_name: training.training_name || training.title || "",
      trainer: training.trainer || "",
      department: training.department || "",
      training_date: training.training_date || training.due_date || "",
      duration: training.duration || "",
      status: training.status || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= DELETE =================

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this training?"
    );

    if (!confirmDelete) return;

    try {
      localStorageDb.delete("trainings", id);
      showNotification("success", "Training deleted successfully.");
      fetchTrainings();
    } catch (err) {
      console.error("Delete training error:", err);
      showNotification("error", "Failed to delete training: " + err.message);
    }
  };

  // ================= RESET FORM =================

  const resetForm = () => {
    setEditingId(null);

    setForm({
      training_name: "",
      trainer: "",
      department: "",
      training_date: "",
      duration: "",
      status: "",
    });
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

      {/* ================= PAGE TITLE & QUIZ CTA ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <FiBookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Security Training & Awareness Programs
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Coordinate human-centric security training modules, scheduled sessions, and completion tracking.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setQuizTargetTraining(null);
            setIsQuizModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 border border-purple-400/30 transition transform active:scale-95"
        >
          <FiAward className="w-4 h-4 text-purple-200" />
          <span>Take Competency Quiz</span>
        </button>
      </div>

      {/* Interactive Assessment Callout Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-slate-900 border border-purple-800/40 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0 mt-0.5">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Training Competency & MCQ Assessment</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Live Verification
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Verify workforce training comprehension with interactive 3-question MCQ quizzes covering ISO 27001 Access Control, NIST Phishing & Social Engineering Defense, DPDP Act 2023, or ISO 22301 Business Continuity. Passing an assessment marks the training session as <strong>Completed (100%)</strong>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setQuizTargetTraining(null);
            setIsQuizModalOpen(true);
          }}
          className="whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 transition flex items-center gap-1.5 shrink-0"
        >
          <FiPlayCircle className="w-3.5 h-3.5" />
          <span>Launch Quiz</span>
        </button>
      </div>

      {/* ================= FORM ================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-white mb-5">
          {editingId ? "Edit Training Session" : "Schedule New Training"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Training Name */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Training Name
            </label>
            <input
              type="text"
              name="training_name"
              value={form.training_name}
              onChange={handleChange}
              placeholder="e.g. Phishing Awareness & Social Engineering"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Trainer */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Trainer / Facilitator
            </label>
            <input
              type="text"
              name="trainer"
              value={form.trainer}
              onChange={handleChange}
              placeholder="e.g. Alex Rivera, Security Lead"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Target Department
            </label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. All Departments / Finance"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Training Date */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Training Date
            </label>
            <input
              type="date"
              name="training_date"
              value={form.training_date}
              onChange={handleChange}
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g. 2 Hours / 1 Day"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            >
              <option value="" className="bg-slate-800 text-slate-400">Select Status</option>
              <option value="Scheduled" className="bg-slate-800 text-white">Scheduled</option>
              <option value="Ongoing" className="bg-slate-800 text-white">Ongoing</option>
              <option value="Completed" className="bg-slate-800 text-white">Completed</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-600/20"
            >
              {editingId ? "Update Training" : "Schedule Training"}
            </button>

            {editingId && (
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

      {/* ================= TRAINING TABLE ================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            Training Directory
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {trainings.length} Sessions
          </span>
        </div>

        <div className="w-full overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 uppercase tracking-wider text-xs font-semibold border-b border-slate-800">
                <th className="py-3 px-4 w-28 text-center">ID</th>
                <th className="py-3 px-4">Training Name</th>
                <th className="py-3 px-4">Trainer</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-48">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {trainings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiBookOpen className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-sm font-medium text-slate-400">
                        No records found in database.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Use the form above to schedule a security training program.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                trainings.map((training, index) => (
                  <tr
                    key={training.id}
                    className="bg-slate-900 border-b border-slate-800 text-slate-200 hover:bg-slate-800/50 transition"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {formatId(training.id, index, "TRN")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {training.training_name || training.title || "Security Training"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {training.trainer || "Security Team"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {training.department || "All Departments"}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-300 font-mono text-xs">
                      {training.training_date || training.due_date || "—"}
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {training.duration}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        training.status === "Completed"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : training.status === "Ongoing"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}>
                        {training.status || "Scheduled"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setQuizTargetTraining(training);
                            setIsQuizModalOpen(true);
                          }}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                          title="Assess employee training comprehension with interactive MCQ quiz"
                        >
                          <FiAward className="w-3 h-3" />
                          <span>Assess</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(training)}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-2 py-1 rounded text-xs font-medium transition"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(training.id)}
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

      {/* Interactive MCQ Assessment Modal */}
      <AssessmentQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => {
          setIsQuizModalOpen(false);
          setQuizTargetTraining(null);
        }}
        initialTrainingName={
          quizTargetTraining
            ? quizTargetTraining.training_name || quizTargetTraining.title
            : ""
        }
        onAssessmentSaved={handleQuizAssessmentSaved}
      />
    </div>
  );
};

export default Training;