import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-red)' }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or contact support if the issue persists.</p>
          <button 
            className="btn-glow" 
            onClick={() => window.location.reload()}
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
