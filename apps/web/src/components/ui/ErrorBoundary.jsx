// apps/web/src/components/ui/ErrorBoundary.jsx
import React from "react";
import { IconAlert, IconRefresh } from "./Icons";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-100 flex items-center justify-center p-6 font-sans">
          <div className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#fce8e6] text-[#c5221f] flex items-center justify-center mx-auto mb-4">
              <IconAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#202124]">
              {this.props.title || "Something went wrong loading this view"}
            </h3>
            <p className="text-xs text-[#5f6368] mt-1.5 leading-relaxed">
              An unexpected error occurred while displaying this page. Click below to return to your default dashboard.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <IconRefresh className="w-3.5 h-3.5" />
                <span>Return to Default View</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
