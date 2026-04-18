import { maskUsername } from '../../src/lib/mask-username';
import { describe, it, expect } from 'vitest';

describe('maskUsername', () => {
  it('returns "Ẩn danh" for falsy input', () => {
    expect(maskUsername('')).toBe('Ẩn danh');
    expect(maskUsername(null)).toBe('Ẩn danh');
  });

  it('masks short name', () => expect(maskUsername('AB')).toBe('A***B'));
  
  it('masks long name', () => expect(maskUsername('NguyenVanA')).toBe('Ngu***A'));
  
  it('handles single character', () => expect(maskUsername('A')).toBe('A***'));
});
