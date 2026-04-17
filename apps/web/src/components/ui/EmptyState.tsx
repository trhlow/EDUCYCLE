import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  actions,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`edu-empty ${className}`.trim()}>
      <h3 className="edu-empty-title">{title}</h3>
      {description ? <p className="edu-empty-copy">{description}</p> : null}
      {actions ? <div className="edu-empty-actions">{actions}</div> : null}
    </div>
  );
}
