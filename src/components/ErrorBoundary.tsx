/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 * Provides recovery mechanism and error reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { logger } from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    logger.error('[ErrorBoundary] Caught error:', error);
    logger.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    this.setState({ errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI using ErrorFallback component
      return (
        <ErrorFallback
          error={this.state.error ?? undefined}
          errorMessage="The app encountered an unexpected error. Please try again."
          onReset={this.handleReset}
          showDevDetails
        />
      );
    }

    return this.props.children;
  }
}
