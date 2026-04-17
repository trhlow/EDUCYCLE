import type { ReactNode } from 'react';

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padded?: boolean;
};

export default function SurfaceCard({
  children,
  className = '',
  interactive = false,
  padded = true,
}: SurfaceCardProps) {
  const classes = [
    'edu-card',
    padded ? 'edu-card--padded' : '',
    interactive ? 'edu-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <section className={classes}>{children}</section>;
}
