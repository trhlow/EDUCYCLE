type LoadingStateProps = {
  label?: string;
  className?: string;
};

export default function LoadingState({
  label = 'Đang tải dữ liệu...',
  className = '',
}: LoadingStateProps) {
  return (
    <div className={`edu-state edu-state--loading ${className}`.trim()} role="status" aria-busy="true">
      <span className="edu-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
