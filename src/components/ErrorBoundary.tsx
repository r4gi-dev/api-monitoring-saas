'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { reportError } from '@/lib/monitoring';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    reportError(error, { componentStack: errorInfo.componentStack });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>We have been notified of the issue. Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
