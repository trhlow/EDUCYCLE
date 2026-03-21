import './PageLoader.css';

export default function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-logo">🎓 EduCycle</div>
      <div className="page-loader-spinner" />
      <div className="page-loader-text">Đang tải...</div>
    </div>
  );
}
