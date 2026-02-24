import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 text-center">
            <div>
                <h1 className="text-2xl font-bold text-red-500 mb-4">Oups, une erreur est survenue.</h1>
                <p className="text-gray-400 mb-6">Le portfolio ne peut pas s'afficher correctement pour le moment.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition"
                >
                    Recharger la page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
