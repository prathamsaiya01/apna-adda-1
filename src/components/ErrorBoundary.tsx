// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Apna Adda ErrorBoundary caught error]:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = "/";
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              {this.props.fallbackTitle || "Something went wrong"}
            </h2>

            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Apna Adda hit an unexpected hiccup loading this screen. Don't worry, your party session is safe!
            </p>

            {this.state.error && (
              <div className="text-left bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-red-300 mb-6 max-h-36 overflow-y-auto whitespace-pre-wrap break-words">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold text-sm shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Return to Adda</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 text-slate-200 border border-white/20 font-bold text-sm hover:bg-white/15 transition flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
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
