import './ProductGridSkeleton.css';

/**
 * Skeleton lưới sản phẩm (trang chủ / listing) — Sprint 4 production polish.
 */
export default function ProductGridSkeleton({ count = 8, className = '' }) {
  return (
    <div
      className={`pgs-grid ${className}`.trim()}
      role="status"
      aria-busy="true"
      aria-label="Đang tải danh sách sản phẩm"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pgs-card">
          <div className="pgs-img skeleton" />
          <div className="pgs-body">
            <div className="pgs-line pgs-line--title skeleton" />
            <div className="pgs-line pgs-line--mid skeleton" />
            <div className="pgs-line pgs-line--short skeleton" />
            <div className="pgs-footer">
              <div className="pgs-price skeleton" />
              <div className="pgs-chip skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
