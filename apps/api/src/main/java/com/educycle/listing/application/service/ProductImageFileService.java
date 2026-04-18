package com.educycle.listing.application.service;

import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.util.ProductImageMagic;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductImageFileService {

    private static final Pattern SAFE_NAME = Pattern.compile(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|jpeg|png|gif|webp)$",
            Pattern.CASE_INSENSITIVE);

    private static final List<String> ALLOWED_EXT = List.of("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024;

    @Value("${app.upload-dir:./data/uploads}")
    private String uploadDirRaw;

    private Path uploadDir;

    @PostConstruct
    void init() throws IOException {
        uploadDir = Paths.get(uploadDirRaw).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);
        log.info("Upload directory: {}", uploadDir);
    }

    public String uploadProductImage(String userId, MultipartFile file) throws IOException {
        if (userId == null || userId.isBlank()) {
            throw new BadRequestException("Cần đăng nhập để tải ảnh");
        }
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File rỗng");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
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

        byte[] fileBytes = file.getBytes();
        if (!ProductImageMagic.isAllowedImage(fileBytes)) {
            throw new BadRequestException("File không phải ảnh hợp lệ (nội dung không khớp định dạng ảnh)");
        }

        String stored = UUID.randomUUID() + "." + ext;
        Path target = uploadDir.resolve(stored).normalize();
        if (!target.startsWith(uploadDir)) {
            throw new BadRequestException("Đường dẫn không hợp lệ");
        }
        Files.write(target, fileBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        return "/api/files/" + stored;
    }

    public Optional<ServedFile> serve(String filename) throws IOException {
        if (!SAFE_NAME.matcher(filename).matches()) {
            throw new BadRequestException("Tên file không hợp lệ");
        }
        Path path = uploadDir.resolve(filename).normalize();
        if (!path.startsWith(uploadDir) || !Files.isRegularFile(path)) {
            return Optional.empty();
        }
        Resource resource = new FileSystemResource(path.toFile());
        String contentType = Files.probeContentType(path);
        return Optional.of(new ServedFile(
                resource,
                contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE));
    }

    public record ServedFile(Resource resource, String contentType) {
    }
}
