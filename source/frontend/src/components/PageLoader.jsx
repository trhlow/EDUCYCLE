import './PageLoader.css';

/**
 * @param {{ label?: string }} [props]
 */
export default function PageLoader({ label = 'Đang tải...' }) {
  return (
    <div className="page-loader" role="status" aria-busy="true" aria-label={label}>
      <div className="page-loader-logo">🎓 EduCycle</div>
      <div className="page-loader-spinner" />
      <div className="page-loader-text">{label}</div>
    </div>
  );
}
