import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[EduCycle] Uncaught render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Đã xảy ra lỗi giao diện</h1>
          <p style={{ marginBottom: '1rem', maxWidth: '42rem' }}>
            Ứng dụng gặp lỗi khi hiển thị. Bạn có thể tải lại trang hoặc xóa dữ liệu trình duyệt cho site này
            (localStorage) nếu vừa đăng nhập / cập nhật phiên bản.
          </p>
          <pre
            style={{
              padding: '1rem',
              background: '#fff',
              borderRadius: 8,
              overflow: 'auto',
              fontSize: '0.8rem',
              border: '1px solid #fecaca',
            }}
          >
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
