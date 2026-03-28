import './EduCycleLogo.css';

/**
 * Logo EduCycle: sách mở (nhìn từ trên) + cung mũi tên “chu trình”.
 * @param {{ size?: number; className?: string; variant?: 'default' | 'inverse'; title?: string }} props
 */
export default function EduCycleLogo({
  size = 40,
  className = '',
  variant = 'default',
  title = 'EduCycle',
}) {
  const variantClass = variant === 'inverse' ? ' educycle-logo--inverse' : '';
  return (
    <svg
      className={`educycle-logo${variantClass} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Sách mở: hai nửa gặp nhau ở gáy */}
      <path
        fill="currentColor"
        d="M20 6 10 11v15l10-5 10 5V11L20 6z"
        opacity="0.95"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.35"
        d="M20 7v14"
      />
      {/* Chu trình tái sử dụng tài liệu */}
      <path
        className="educycle-logo__accent"
        d="M29 13.5a8.5 8.5 0 0 1-3.8 11.2"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        className="educycle-logo__accent"
        d="M24.5 24.5l.4-1.8 1.8.4"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
