import React, { useState } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import {
  QUIZ_MODULES,
  evaluateQuizAnswers,
} from "../utils/quizQuestions";
import {
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiShield,
  FiClock,
  FiX,
  FiCheck,
  FiBookOpen,
  FiUser,
  FiFileText,
} from "react-icons/fi";

export const AssessmentQuizModal = ({
  isOpen,
  onClose,
  initialEmployee = "",
  initialTrainingName = "",
  onEvaluationComplete, // Optional callback to pass back score, result, remarks
  onAssessmentSaved, // Optional callback after persisting to LocalStorage
}) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  // Selected Quiz Module
  const defaultModule =
    QUIZ_MODULES.find(
      (m) =>
        initialTrainingName &&
        m.title.toLowerCase().includes(initialTrainingName.toLowerCase().slice(0, 8))
    ) || QUIZ_MODULES[0];

  const [selectedModuleId, setSelectedModuleId] = useState(defaultModule.id);
  const activeModule =
    QUIZ_MODULES.find((m) => m.id === selectedModuleId) || QUIZ_MODULES[0];

  // Form & Answers State
  const [employeeName, setEmployeeName] = useState(initialEmployee || "");
  const [trainingName, setTrainingName] = useState(
    initialTrainingName || activeModule.title
  );
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }

  // Evaluation & Results State
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [customRemarks, setCustomRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle Answer Selection
  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
    // Reset evaluation if answers change
    if (evaluationResult) {
      setEvaluationResult(null);
    }
  };

  // Evaluate Quiz Deterministically
  const handleEvaluateQuiz = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!employeeName.trim()) {
      setErrorMessage("Please specify the Employee name being assessed.");
      return;
    }

    const totalQuestions = activeModule.questions.length;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < totalQuestions) {
      setErrorMessage(
        `Please answer all ${totalQuestions} questions before scoring (answered: ${answeredCount}/${totalQuestions}).`
      );
      return;
    }

    const evaluation = evaluateQuizAnswers(
      activeModule,
      answers,
      employeeName.trim()
    );
    setEvaluationResult(evaluation);
    setCustomRemarks(evaluation.remarksSummary);

    if (onEvaluationComplete) {
      onEvaluationComplete({
        employee_name: employeeName.trim(),
        training_name: trainingName.trim() || activeModule.title,
        assessment_score: evaluation.score,
        result: evaluation.result,
        remarks: evaluation.remarksSummary,
        assessment_criteria: activeModule.criteria,
        assessment_date: new Date().toISOString().split("T")[0],
      });
    }
  };

  // Persist directly to LocalStorage
  const handleSaveToDatabase = () => {
    if (!evaluationResult) return;
    setIsSaving(true);
    setErrorMessage("");

    const empName = employeeName.trim();
    const trName = trainingName.trim() || activeModule.title;
    const scoreNum = evaluationResult.score;
    const resultStr = evaluationResult.result;
    const dateStr = new Date().toISOString().split("T")[0];
    const timestampStr = new Date().toISOString();
    const finalRemarks = customRemarks.trim() || evaluationResult.remarksSummary;
    const criteriaStr = activeModule.criteria;

    // Build structured fallback remarks to ensure criteria and timestamp are 100% preserved
    const enrichedRemarks = `[Criteria: ${criteriaStr} | Completed: ${timestampStr}] ${finalRemarks}`;

    const currentAssessments = localStorageDb.get("assessments") || [];
    const nextId = currentAssessments.length
      ? Math.max(...currentAssessments.map((a) => Number(a.id) || 0), 0) + 1
      : 1;

    const payload = {
      id: nextId,
      title: trName,
      assessment_name: trName,
      training_name: trName,
      employee_name: empName,
      assessment_score: scoreNum,
      score: scoreNum,
      result: resultStr,
      status: resultStr,
      assessment_date: dateStr,
      due_date: dateStr,
      remarks: enrichedRemarks,
      assessment_criteria: criteriaStr,
      completed_at: timestampStr,
      user_id: user?.id,
      organization_id: user?.id,
      created_at: timestampStr,
    };

    try {
      localStorageDb.insert("assessments", payload);
      setIsSaving(false);
      if (onAssessmentSaved) {
        onAssessmentSaved(payload);
      }
      onClose();
    } catch (err) {
      setIsSaving(false);
      console.error("Save assessment quiz error:", err);
      setErrorMessage("Failed to persist evaluation record: " + err.message);
    }
  };

  // Reset / Clear Answers
  const handleReset = () => {
    setAnswers({});
    setEvaluationResult(null);
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xl flex-shrink-0">
              <FiAward />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Interactive Security MCQ Assessment</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  3 Questions
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic scoring engine evaluating ISO 27001 & Phishing competency.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Scrollable Quiz Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-slate-300">
          {/* Module Selector & Candidate Scoping */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Quiz Module Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <FiBookOpen className="text-blue-400" /> Assessment Module
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => {
                    setSelectedModuleId(e.target.value);
                    const mod = QUIZ_MODULES.find((m) => m.id === e.target.value);
                    if (mod) setTrainingName(mod.title);
                    setAnswers({});
                    setEvaluationResult(null);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {QUIZ_MODULES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee / Candidate Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <FiUser className="text-blue-400" /> Employee / Candidate Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe, Alex Turner..."
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Scope & Audit Criteria Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <FiShield className="text-emerald-400 shrink-0" />
                <span>Audit Criteria: <strong className="text-slate-200">{activeModule.criteria}</strong></span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                Passing Threshold: {activeModule.passingScore}% (2/3 Correct)
              </span>
            </div>
          </div>

          {/* Error Message Toast */}
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <FiAlertTriangle className="text-red-400 text-base shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 3 Questions Container */}
          <div className="space-y-4">
            {activeModule.questions.map((q, qIndex) => {
              const selectedOpt = answers[q.id];
              const isEvaluated = Boolean(evaluationResult);
              const questionBreakdown = evaluationResult?.breakdown.find(
                (b) => b.questionNumber === qIndex + 1
              );

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition ${
                    isEvaluated
                      ? questionBreakdown?.isCorrect
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : "bg-rose-950/20 border-rose-500/40"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-blue-500/15 text-blue-400 border border-blue-500/25">
                      Question {qIndex + 1} of 3
                    </span>
                    <span className="text-[10px] text-slate-400 italic">
                      Criteria: {q.criteria}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed mb-3">
                    {q.question}
                  </p>

                  {/* 4 Multiple Choice Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedOpt === optIndex;
                      const isCorrectChoice = q.correctIndex === optIndex;

                      let optionStyle =
                        "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-200";

                      if (isSelected) {
                        optionStyle =
                          "bg-blue-600/20 border-blue-500 text-white font-medium shadow-sm";
                      }

                      if (isEvaluated) {
                        if (isCorrectChoice) {
                          optionStyle =
                            "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold";
                        } else if (isSelected && !isCorrectChoice) {
                          optionStyle =
                            "bg-rose-500/20 border-rose-500 text-rose-200";
                        } else {
                          optionStyle =
                            "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60";
                        }
                      }

                      return (
                        <label
                          key={optIndex}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition text-xs ${optionStyle}`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            checked={isSelected}
                            disabled={isEvaluated}
                            onChange={() => handleSelectOption(q.id, optIndex)}
                            className="mt-0.5 w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                          />
                          <div className="flex-1 leading-relaxed">
                            <span className="font-bold mr-1.5 font-mono">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isEvaluated && isCorrectChoice && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                              <FiCheck className="text-xs" /> Correct
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Evaluated Explanation Banner */}
                  {isEvaluated && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                      <strong className="text-blue-400">Auditor Explanation: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Results Outcome & Auditor Remarks Preview */}
          {evaluationResult && (
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-700 rounded-xl space-y-3.5 shadow-lg animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                      evaluationResult.result === "Pass"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {evaluationResult.result === "Pass" ? (
                      <FiCheckCircle />
                    ) : (
                      <FiXCircle />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Deterministic Outcome
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                      <span
                        className={
                          evaluationResult.result === "Pass"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }
                      >
                        {evaluationResult.result.toUpperCase()} ({evaluationResult.score}%)
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        ({evaluationResult.correctCount} of {evaluationResult.totalQuestions} Correct)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      evaluationResult.result === "Pass"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {evaluationResult.result === "Pass" ? "Compliance Standard Met" : "Remediation Required"}
                  </span>
                </div>
              </div>

              {/* Granular Auditor Remarks Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <FiFileText className="text-blue-400" /> Detailed Auditor Remarks & Assessment Criteria
                </label>
                <textarea
                  rows="3"
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Includes evaluated controls, correct count, failure remediation alerts, and completion timestamps.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Reset Answers
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Close
            </button>

            {!evaluationResult ? (
              <button
                type="button"
                onClick={handleEvaluateQuiz}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <FiAward className="text-sm" />
                <span>Calculate Score & Evaluate Outcome</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveToDatabase}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Persisting Record...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="text-sm" />
                    <span>Save Evaluation to Database</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuizModal;
