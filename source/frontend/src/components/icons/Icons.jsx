/**
 * Stroke icons, monochrome via currentColor — align with design tokens on parent.
 * Decorative in buttons/links: parent supplies aria-label; these set aria-hidden.
 */
const svgAttrs = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconBell = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const IconHeart = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
  </svg>
);

/** Filled heart — same silhouette, solid fill */
export const IconHeartFilled = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      stroke="none"
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"
    />
  </svg>
);

export const IconX = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconMenu = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M4 5h16M4 12h16M4 19h16" />
  </svg>
);

export const IconChevronLeft = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const IconChevronRight = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const IconTrash = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconMessageCircle = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export const IconSend = ({ size = 20, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const IconLock = ({ size = 18, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* Toast / status */
export const IconCheckCircle = ({ size = 18, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconAlertCircle = ({ size = 18, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

export const IconAlertTriangle = ({ size = 18, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const IconInfo = ({ size = 18, className = '' }) => (
  <svg {...svgAttrs} width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);
