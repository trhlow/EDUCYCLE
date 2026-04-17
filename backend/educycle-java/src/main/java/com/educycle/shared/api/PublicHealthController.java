package com.educycle.shared.api;

import com.educycle.shared.dto.common.PublicHealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/public")
public class PublicHealthController {

    @GetMapping("/health")
    public ResponseEntity<PublicHealthResponse> health() {
        return ResponseEntity.ok(new PublicHealthResponse(
                "UP",
                "educycle-api",
                Instant.now()
        ));
    }
}
