import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches runtime render errors anywhere below it and shows a message instead
 * of unmounting the whole tree (which would leave a blank white page). Without
 * this, an uncaught error — e.g. a data-shape mismatch from the backend — is
 * invisible to the user and only discoverable in the browser console.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Uncaught error in React tree:', error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-lg border border-red-200 bg-red-50 px-6 py-5">
          <h1 className="text-lg font-semibold text-red-800">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-red-700">
            The app hit an unexpected error and couldn&apos;t render. Details are
            in the browser console.
          </p>
          <pre className="mt-4 overflow-auto whitespace-pre-wrap text-xs text-red-900/80">
            {error.message}
          </pre>
        </div>
      </div>
    );
  }
}
