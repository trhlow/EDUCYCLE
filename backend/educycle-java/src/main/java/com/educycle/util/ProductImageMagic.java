package com.educycle.util;

import java.util.Arrays;

/**
 * Nhận diện ảnh qua magic bytes (không tin extension).
 */
public final class ProductImageMagic {

    private ProductImageMagic() {
    }

    public static boolean isAllowedImage(byte[] data) {
        if (data == null || data.length < 12) {
            return false;
        }
        if (startsWith(data, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})) {
            return true;
        }
        if (startsWith(data, new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A})) {
            return true;
        }
        if (data.length >= 6 && (startsWithGif(data, "GIF87a") || startsWithGif(data, "GIF89a"))) {
            return true;
        }
        return isWebp(data);
    }

    private static boolean startsWithGif(byte[] data, String magic) {
        byte[] m = magic.getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        return startsWith(data, m);
    }

    private static boolean isWebp(byte[] data) {
        if (data.length < 12) {
            return false;
        }
        if (!startsWith(data, "RIFF".getBytes(java.nio.charset.StandardCharsets.US_ASCII))) {
            return false;
        }
        return containsAt(data, 8, "WEBP".getBytes(java.nio.charset.StandardCharsets.US_ASCII));
    }

    private static boolean containsAt(byte[] data, int offset, byte[] needle) {
        if (offset + needle.length > data.length) {
            return false;
        }
        for (int i = 0; i < needle.length; i++) {
            if (data[offset + i] != needle[i]) {
                return false;
            }
        }
        return true;
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) {
            return false;
        }
        return Arrays.compare(data, 0, prefix.length, prefix, 0, prefix.length) == 0;
    }
}
