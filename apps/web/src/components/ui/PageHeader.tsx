import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`edu-page-header ${className}`.trim()}>
      <div>
        {eyebrow ? <div className="edu-page-eyebrow">{eyebrow}</div> : null}
        <h1 className="edu-page-title">{title}</h1>
        {subtitle ? <p className="edu-page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="edu-header-actions">{actions}</div> : null}
    </header>
  );
}
