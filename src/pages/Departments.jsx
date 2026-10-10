import React, { useEffect, useState } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import { FiLayers } from "react-icons/fi";
import { formatId } from "../utils/idFormatter";

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    department: "",
    head: "",
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch Departments from LocalStorage
  const fetchDepartments = () => {
    const data = localStorageDb.get("departments");
    setDepartments(data || []);
  };

  useEffect(() => {
    fetchDepartments();

    const handleStorageUpdate = (e) => {
      if (!e.detail || e.detail.collection === "departments" || e.detail.collection === "all") {
        fetchDepartments();
      }
    };

    window.addEventListener("grc-storage-update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener("grc-storage-update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Handle Input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add or Update Department in LocalStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.department.trim() || !form.head.trim()) {
      showNotification("error", "Please provide both Department Name and Department Head.");
      return;
    }

    const payload = {
      name: form.department.trim(),
      department_name: form.department.trim(),
      head_name: form.head.trim(),
      department_head: form.head.trim(),
      user_id: user?.id,
      organization_id: user?.id,
    };

    if (editingId) {
      localStorageDb.update("departments", editingId, payload);
      showNotification("success", "Department updated successfully.");
    } else {
      const nextId = departments.length
        ? Math.max(...departments.map((d) => Number(d.id) || 0)) + 1
        : 1;
      localStorageDb.insert("departments", {
        id: nextId,
        ...payload,
        created_at: new Date().toISOString(),
      });
      showNotification("success", "Department added successfully.");
    }

    setForm({
      department: "",
      head: "",
    });
    setEditingId(null);
    fetchDepartments();
  };

  // Edit Department
  const handleEdit = (dept) => {
    setEditingId(dept.id);

    setForm({
      department: dept.department_name || dept.name || "",
      head: dept.department_head || dept.head_name || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Department
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    localStorageDb.delete("departments", id);
    showNotification("success", "Department deleted successfully.");
    fetchDepartments();
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
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Department Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Organize compliance boundaries, assign department leadership, and track organizational governance.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-base font-bold text-white mb-4">
          {editingId ? "Edit Department" : "Add New Department"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                Department Name
              </label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Information Security & Compliance"
                className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                Department Head
              </label>
              <input
                type="text"
                name="head"
                value={form.head}
                onChange={handleChange}
                placeholder="e.g. Alex Turner / CISO"
                className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-600/20"
            >
              {editingId ? "Update Department" : "Add Department"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    department: "",
                    head: "",
                  });
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-5 py-2.5 rounded-lg text-sm border border-slate-700 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Department Table Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            Department Directory
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {departments.length} Departments
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/90 text-slate-300 uppercase tracking-wider text-xs font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-28">ID</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Department Head</th>
                <th className="py-3 px-4 text-center w-36">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiLayers className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-sm font-medium text-slate-400">
                        No records found in database.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Use the form above to add an organizational department.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                departments.map((dept, index) => (
                  <tr
                    key={dept.id}
                    className="bg-slate-900 border-b border-slate-800 text-slate-200 hover:bg-slate-800/50 transition"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-400">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {formatId(dept.id, index, "DEPT")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-white">
                      {dept.department_name || dept.name || "General"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {dept.department_head || dept.head_name || "Unassigned"}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded text-xs font-semibold transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded text-xs font-semibold transition"
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
    </div>
  );
};

export default Departments;