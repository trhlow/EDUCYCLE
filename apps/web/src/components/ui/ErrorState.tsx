import type { ReactNode } from 'react';

type ErrorStateProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function ErrorState({
  title = 'Không thể tải dữ liệu',
  description = 'Vui lòng thử lại sau.',
  actions,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`edu-state edu-state--error ${className}`.trim()} role="alert">
      <h3 className="edu-state-title">{title}</h3>
      {description ? <p className="edu-state-copy">{description}</p> : null}
      {actions ? <div className="edu-state-actions">{actions}</div> : null}
    </div>
  );
}
