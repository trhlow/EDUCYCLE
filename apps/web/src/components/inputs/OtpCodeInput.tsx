import { useMemo, useRef } from 'react';
import './OtpCodeInput.css';

type OtpCodeInputProps = {
  value: string;
  onChange: (nextValue: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
};

const sanitizeDigits = (raw: string, length: number) =>
  raw.replace(/\D/g, '').slice(0, length);

export default function OtpCodeInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  ariaLabel = 'Mã OTP',
}: OtpCodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const normalized = useMemo(() => sanitizeDigits(value, length), [value, length]);

  const focusIndex = (index: number) => {
    const target = refs.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const setDigitAt = (index: number, digit: string) => {
    const chars = normalized.padEnd(length, ' ').split('');
    chars[index] = digit;
    const next = chars.join('').replace(/\s/g, '');
    onChange(next);
  };

  const handleInput = (index: number, raw: string) => {
    const digits = sanitizeDigits(raw, length);
    if (!digits) {
      setDigitAt(index, '');
      return;
    }
    const first = digits.charAt(0);
    setDigitAt(index, first);
    if (index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const next = sanitizeDigits(event.clipboardData.getData('text'), length);
    if (!next) return;
    onChange(next);
    focusIndex(Math.min(next.length, length) - 1);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !normalized[index] && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  return (
    <div className="otp-code-input" role="group" aria-label={ariaLabel}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          className="otp-code-input__slot"
          value={normalized[index] ?? ''}
          onChange={(event) => handleInput(index, event.target.value)}
          onPaste={handlePaste}
          onKeyDown={(event) => handleKeyDown(index, event)}
          disabled={disabled}
          aria-label={`${ariaLabel} ký tự ${index + 1}`}
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </div>
  );
}
