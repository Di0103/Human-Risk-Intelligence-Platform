import React, { useEffect, useState } from "react";
import { localStorageDb } from "../utils/localStorageDb";
import { useAuth } from "../context/AuthContext";
import { FiUsers } from "react-icons/fi";
import { formatId } from "../utils/idFormatter";

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    department: "",
    designation: "",
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch Employees & Departments from LocalStorage
  const fetchEmployees = () => {
    const empData = localStorageDb.get("employees");
    setEmployees(empData || []);
    const deptData = localStorageDb.get("departments");
    setDepartments(deptData || []);
  };

  useEffect(() => {
    fetchEmployees();

    const handleStorageUpdate = (e) => {
      if (
        !e.detail ||
        e.detail.collection === "employees" ||
        e.detail.collection === "departments" ||
        e.detail.collection === "all"
      ) {
        fetchEmployees();
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

  // Add / Update Employee in LocalStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.department.trim() ||
      !form.designation.trim()
    ) {
      showNotification("error", "Please fill in all employee directory fields.");
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      designation: form.designation.trim(),
      role: "employee",
      user_id: user?.id,
      organization_id: user?.id,
    };

    if (editingId) {
      localStorageDb.update("employees", editingId, payload);
      showNotification("success", "Employee updated successfully.");
    } else {
      const nextId = employees.length
        ? Math.max(...employees.map((e) => Number(e.id) || 0), 0) + 1
        : 1;
      localStorageDb.insert("employees", {
        id: nextId,
        ...payload,
        created_at: new Date().toISOString(),
      });
      showNotification("success", "Employee added successfully.");
    }

    setForm({
      full_name: "",
      email: "",
      department: "",
      designation: "",
    });
    setEditingId(null);
    fetchEmployees();
  };

  // Edit Employee
  const handleEdit = (employee) => {
    setEditingId(employee.id);

    setForm({
      full_name: employee.full_name || employee.name || "",
      email: employee.email || "",
      department: employee.department || "General",
      designation: employee.designation || "Staff",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Employee
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    localStorageDb.delete("employees", id);
    showNotification("success", "Employee deleted successfully.");
    fetchEmployees();
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

      {/* Heading */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
          <FiUsers className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Employee Directory & Workforce Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage organization personnel, designated departmental assignments, and role allocations.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-white mb-5">
          {editingId ? "Edit Employee" : "Add New Employee"}
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. jane.doe@company.com"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              list="department-options"
              placeholder="e.g. Information Security & Compliance"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
            <datalist id="department-options">
              {departments.map((d) => (
                <option key={d.id} value={d.name || d.department_name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="e.g. Security Analyst"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-lg p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-600/20"
            >
              {editingId ? "Update Employee" : "Add Employee"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    full_name: "",
                    email: "",
                    department: "",
                    designation: "",
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

      {/* Table Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">
            Employee List
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {employees.length} Employees
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/90 text-slate-300 uppercase tracking-wider text-xs font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-28">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4 text-center w-36">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiUsers className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-sm font-medium text-slate-400">
                        No records found in database.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Add an employee above to populate the directory.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr
                    key={emp.id}
                    className="bg-slate-900 border-b border-slate-800 text-slate-200 hover:bg-slate-800/50 transition"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded font-mono text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {formatId(emp.id, index, "EMP")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {emp.full_name || emp.name || "Employee"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {emp.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {emp.department || "General"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {emp.designation || "Staff"}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-3 py-1 rounded text-xs font-medium transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-3 py-1 rounded text-xs font-medium transition"
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

export default Employees;