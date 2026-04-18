package com.educycle.listing.api;

import com.educycle.listing.application.service.ProductImageFileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Lưu ảnh cục bộ (dev / Docker volume). Nhiều replica: dùng object storage (S3/R2/MinIO) + URL công khai,
 * không dùng ổ đĩa pod — xem comment trong docker-compose.yml (volumes).
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FileUploadController {

    private final ProductImageFileService productImageFileService;

    @PostMapping(value = "/upload/product-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @AuthenticationPrincipal String userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        return ResponseEntity.ok(Map.of("url", productImageFileService.uploadProductImage(userId, file)));
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) throws IOException {
        return productImageFileService.serve(filename)
                .map(file -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, file.contentType())
                        .body(file.resource()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
