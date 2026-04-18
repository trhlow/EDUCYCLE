import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from '../../src/lib/api-error';

describe('getApiErrorMessage', () => {
  it('returns fallback for null', () => {
    expect(getApiErrorMessage(null, 'X')).toBe('X');
  });

  it('handles network error', () => {
    expect(getApiErrorMessage({ code: 'ERR_NETWORK' })).toMatch(/Không kết nối/);
  });

  it('reads Spring message field', () => {
    expect(
      getApiErrorMessage({
        response: { status: 400, data: { message: 'Email đã tồn tại' } },
      }),
    ).toBe('Email đã tồn tại');
  });

  it('joins validation errors array', () => {
    expect(
      getApiErrorMessage({
        response: { status: 422, data: { errors: ['A', 'B'] } },
      }),
    ).toBe('A · B');
  });

  it('maps 429', () => {
    expect(getApiErrorMessage({ response: { status: 429, data: {} } })).toMatch(/Quá nhiều/);
  });

  it('maps 5xx', () => {
    expect(getApiErrorMessage({ response: { status: 503, data: {} } })).toMatch(/Máy chủ/);
  });
});
