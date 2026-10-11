import React from "react";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      window.localStorage.removeItem("grc_session");
      window.sessionStorage.removeItem("grc_otp_challenge");
    } catch {
      // Storage cleanup fallback
    }
    window.location.href = "/login";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl shadow-lg">
              <FiAlertTriangle />
            </div>

            <h1 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h1>

            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              The application encountered an unexpected runtime state. You can reload the page or return to the secure login portal.
            </p>

            {this.state.error && (
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-red-300 text-left mb-6 overflow-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <FiRefreshCw className="text-sm" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
              >
                <FiHome className="text-sm" />
                <span>Return to Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
