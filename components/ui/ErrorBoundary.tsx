import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; errorMessage: string; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, errorMessage: '' };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erreur interceptée par ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'black', color: 'red', height: '100vh', zIndex: 9999 }}>
          <h2>🚨 Crash React Intercepté (Écran Noir Évité)</h2>
          <p style={{ fontFamily: 'monospace' }}>{this.state.errorMessage}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
