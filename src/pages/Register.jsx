import { useState } from "react";
import { signUp } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const { error } = await signUp(name, email, password);

    if (error) {
      alert(error.message);
    } else {
      alert("Registration Successful!");
      navigate("/login");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 p-4">
      <form
        onSubmit={handleRegister}
        className="bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-white tracking-tight">
          Create Account
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Rivera"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@organization.com"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 p-3 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-blue-600/25 mt-2"
          >
            Register
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;