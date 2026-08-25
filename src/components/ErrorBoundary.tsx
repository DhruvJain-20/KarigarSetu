import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleResetCache = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#963E20] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-stone-900 font-serif">
                Something went wrong
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache & Reset</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
