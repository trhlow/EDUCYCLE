package com.educycle.controller;

import com.educycle.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Lưu ảnh cục bộ (dev / nhỏ) — thay base64 trong DB. Production có thể chuyển sang S3/Cloudinary.
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class FileUploadController {

    private static final Pattern SAFE_NAME = Pattern.compile(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|jpeg|png|gif|webp)$",
            Pattern.CASE_INSENSITIVE);

    private static final List<String> ALLOWED_EXT = List.of("jpg", "jpeg", "png", "gif", "webp");

    @Value("${app.upload-dir:./data/uploads}")
    private String uploadDirRaw;

    private Path uploadDir;

    @PostConstruct
    void init() throws IOException {
        uploadDir = Paths.get(uploadDirRaw).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);
        log.info("Upload directory: {}", uploadDir);
    }

    @PostMapping(value = "/upload/product-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @AuthenticationPrincipal String userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (userId == null || userId.isBlank()) {
            throw new BadRequestException("Cần đăng nhập để tải ảnh");
        }
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File rỗng");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Ảnh tối đa 5MB");
        }

        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (ext == null) {
            ext = "jpg";
        }
        ext = ext.toLowerCase();
        if (!ALLOWED_EXT.contains(ext)) {
            throw new BadRequestException("Chỉ chấp nhận jpg, png, gif, webp");
        }

        String stored = UUID.randomUUID() + "." + ext;
        Path target = uploadDir.resolve(stored).normalize();
        if (!target.startsWith(uploadDir)) {
            throw new BadRequestException("Đường dẫn không hợp lệ");
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String url = "/api/files/" + stored;
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) throws IOException {
        if (!SAFE_NAME.matcher(filename).matches()) {
            throw new BadRequestException("Tên file không hợp lệ");
        }
        Path path = uploadDir.resolve(filename).normalize();
        if (!path.startsWith(uploadDir) || !Files.isRegularFile(path)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(path.toFile());
        String ct = Files.probeContentType(path);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, ct != null ? ct : MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .body(resource);
    }
}
