package com.educycle.controller;

import com.educycle.dto.bookwanted.BookWantedPostResponse;
import com.educycle.dto.bookwanted.CreateBookWantedRequest;
import com.educycle.dto.bookwanted.UpdateBookWantedRequest;
import com.educycle.dto.common.PageResponse;
import com.educycle.service.BookWantedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/book-wanted")
@RequiredArgsConstructor
public class BookWantedController {

    private final BookWantedService bookWantedService;

    /** Tin công khai đang mở — ai cũng xem được */
    @GetMapping
    public ResponseEntity<PageResponse<BookWantedPostResponse>> listOpen(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(bookWantedService.listOpen(q, pageable));
    }

    /** Tin của tôi — cần đăng nhập (đặt trước /{id} để không nhầm với UUID) */
    @GetMapping("/mine")
    public ResponseEntity<PageResponse<BookWantedPostResponse>> listMine(
            @AuthenticationPrincipal String userId,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(bookWantedService.listMine(UUID.fromString(userId), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookWantedPostResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(bookWantedService.getById(id));
    }

    @PostMapping
    public ResponseEntity<BookWantedPostResponse> create(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateBookWantedRequest request) {
        return ResponseEntity.ok(bookWantedService.create(UUID.fromString(userId), request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BookWantedPostResponse> update(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateBookWantedRequest request) {
        return ResponseEntity.ok(bookWantedService.update(id, UUID.fromString(userId), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId) {
        bookWantedService.delete(id, UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }
}
