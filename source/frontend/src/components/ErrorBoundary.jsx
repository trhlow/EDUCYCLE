import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Đã xảy ra lỗi
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            maxWidth: '400px',
          }}>
            {this.state.error?.message || 'Đã xảy ra lỗi không mong muốn.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.75rem 2rem',
              background: 'var(--primary-600)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
            }}
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
