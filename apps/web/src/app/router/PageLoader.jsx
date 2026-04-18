import EduCycleLogo from '../../components/branding/EduCycleLogo';
import './PageLoader.css';

/**
 * @param {{ label?: string }} [props]
 */
export default function PageLoader({ label = 'Đang tải...' }) {
  return (
    <div className="page-loader" role="status" aria-busy="true" aria-label={label}>
      <div className="page-loader-logo">
        <EduCycleLogo size={48} title="EduCycle" />
        <span className="page-loader-wordmark">EduCycle</span>
      </div>
      <div className="page-loader-spinner" />
      <div className="page-loader-text">{label}</div>
    </div>
  );
}
