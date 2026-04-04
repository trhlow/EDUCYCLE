/**
 * Mask a username to protect privacy.
 * "NguyenVanA" → "Ngu***nA"
 * "Tran"       → "T***n"
 * "AB"         → "A***B"
 * "A"          → "A***"
 */
export function maskUsername(name) {
  if (!name) return 'Ẩn danh';
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed + '***';
  if (trimmed.length <= 3) return trimmed.charAt(0) + '***' + trimmed.charAt(trimmed.length - 1);
  return trimmed.slice(0, 3) + '***' + trimmed.charAt(trimmed.length - 1);
}

/**
 * Issue #7: Mask an email address for privacy.
 * "nguyenvana@gmail.com"  → "ngu***@***.com"
 * "ab@test.vn"            → "a***@***.vn"
 * "a@b.com"               → "a***@***.com"
 * undefined / null        → "***@***.***"
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***@***.***';
  const atIdx = email.indexOf('@');
  if (atIdx < 0) return '***@***.***';

  const local  = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);       // e.g. "gmail.com"
  const dotIdx = domain.lastIndexOf('.');
  const tld    = dotIdx >= 0 ? domain.slice(dotIdx) : '.***'; // e.g. ".com"

  // Mask local part: keep first 1-3 chars + "***"
  const visibleLocal = local.length > 3 ? local.slice(0, 3) + '***' : local.charAt(0) + '***';

  return `${visibleLocal}@***.${tld.replace('.', '')}`;
}

export default maskUsername;
