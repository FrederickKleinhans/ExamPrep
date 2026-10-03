import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CertArc] Route rendering failed:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page-root" role="alert">
          <div className="card-surface" style={{ maxWidth: 560, margin: '48px auto', padding: 28 }}>
            <h1 className="text-heading" style={{ margin: '0 0 8px', fontSize: 22 }}>
              This page ran into a problem
            </h1>
            <p className="text-muted" style={{ margin: '0 0 20px', fontSize: 14 }}>
              Your saved progress is unchanged. Reload the page to try again.
            </p>
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
