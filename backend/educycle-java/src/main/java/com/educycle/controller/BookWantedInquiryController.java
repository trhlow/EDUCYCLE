package com.educycle.controller;

import com.educycle.dto.bookwanted.BookWantedInquiryMessageResponse;
import com.educycle.dto.bookwanted.BookWantedInquiryResponse;
import com.educycle.dto.bookwanted.BookWantedInquirySummaryResponse;
import com.educycle.dto.message.SendMessageRequest;
import com.educycle.service.BookWantedInquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/book-wanted")
@RequiredArgsConstructor
public class BookWantedInquiryController {

    private final BookWantedInquiryService bookWantedInquiryService;

    @PostMapping("/{postId}/inquiries")
    public ResponseEntity<BookWantedInquiryResponse> startOrGet(
            @PathVariable UUID postId,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(bookWantedInquiryService.startOrGetInquiry(postId, UUID.fromString(userId)));
    }

    @GetMapping("/{postId}/inquiries")
    public ResponseEntity<List<BookWantedInquirySummaryResponse>> listForPost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(bookWantedInquiryService.listInquiriesForPost(postId, UUID.fromString(userId)));
    }

    @GetMapping("/inquiries/{inquiryId}")
    public ResponseEntity<BookWantedInquiryResponse> getOne(
            @PathVariable UUID inquiryId,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(bookWantedInquiryService.getInquiry(inquiryId, UUID.fromString(userId)));
    }

    @GetMapping("/inquiries/{inquiryId}/messages")
    public ResponseEntity<List<BookWantedInquiryMessageResponse>> listMessages(
            @PathVariable UUID inquiryId,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(bookWantedInquiryService.listMessages(inquiryId, UUID.fromString(userId)));
    }

    @PostMapping("/inquiries/{inquiryId}/messages")
    public ResponseEntity<BookWantedInquiryMessageResponse> send(
            @PathVariable UUID inquiryId,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(bookWantedInquiryService.sendMessage(inquiryId, UUID.fromString(userId), request));
    }
}
