import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import OtpCodeInput from './OtpCodeInput';

describe('OtpCodeInput', () => {
  it('supports paste and keeps only numeric digits', () => {
    const onChange = vi.fn();
    render(<OtpCodeInput value="" onChange={onChange} />);

    const firstSlot = screen.getByLabelText('Mã OTP ký tự 1');
    fireEvent.paste(firstSlot, {
      clipboardData: {
        getData: () => '12a34b56',
      },
    });

    expect(onChange).toHaveBeenCalledWith('123456');
  });

  it('moves to next slot after typing a digit', () => {
    const onChange = vi.fn();
    render(<OtpCodeInput value="" onChange={onChange} />);

    const firstSlot = screen.getByLabelText('Mã OTP ký tự 1');
    fireEvent.change(firstSlot, { target: { value: '9' } });

    expect(onChange).toHaveBeenCalledWith('9');
  });
});
