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
    // Keep first 3 chars + last char
    return trimmed.slice(0, 3) + '***' + trimmed.charAt(trimmed.length - 1);
}

export default maskUsername;
