import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

type StatusBadgeProps = {
  status?: string | null;
  label?: string;
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
};

const STATUS_MAP: Record<string, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Chờ xác nhận', tone: 'warning' },
  APPROVED: { label: 'Đã duyệt', tone: 'success' },
  ACCEPTED: { label: 'Đã chấp nhận', tone: 'info' },
  MEETING: { label: 'Đang gặp mặt', tone: 'info' },
  SOLD: { label: 'Đã bán', tone: 'success' },
  COMPLETED: { label: 'Hoàn thành', tone: 'success' },
  AUTO_COMPLETED: { label: 'Tự hoàn thành', tone: 'success' },
  REJECTED: { label: 'Từ chối', tone: 'error' },
  CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
  DISPUTED: { label: 'Tranh chấp', tone: 'error' },
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
};

export default function StatusBadge({
  status,
  label,
  tone,
  className = '',
  icon,
}: StatusBadgeProps) {
  const normalized = (status || '').trim().toUpperCase();
  const fromMap = normalized ? STATUS_MAP[normalized] : undefined;
  const resolvedTone = tone || fromMap?.tone || 'neutral';
  const resolvedLabel =
    label || fromMap?.label || (status ? String(status) : 'Không xác định');

  return (
    <span className={`edu-badge edu-badge--${resolvedTone} ${className}`.trim()}>
      {icon ? icon : null}
      {resolvedLabel}
    </span>
  );
}